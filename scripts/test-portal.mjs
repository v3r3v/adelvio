import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "vite";
const server = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null },
});
let checks = 0;
function check(name, fn) {
  fn();
  checks++;
  console.log("PASS " + name);
}
try {
  const service = await server.ssrLoadModule("/portal/service.ts");
  const { default: worker, PortalSession } =
    await server.ssrLoadModule("/worker/index.ts");
  const { probeAdelvio } = await server.ssrLoadModule("/portal/providers.ts");
  const s = service.seed("client");
  let view = await service.snapshot(s);
  check("Client receives one workspace and no internal notes", () => {
    assert.equal(view.workspaces.length, 1);
    assert.ok(
      view.tickets.every(
        (t) => t.tenantId === "atelier" && t.messages.every((m) => !m.internal),
      ),
    );
    assert.equal(view.audit.length, 0);
  });
  await assert.rejects(
    () => service.snapshot(s, "lino"),
    (e) => e.status === 403,
  );
  checks++;
  check("Client cannot write internal notes", () =>
    assert.throws(
      () =>
        service.mutateTicket(s, "REQ-1042", {
          action: "message",
          text: "secret",
          internal: true,
        }),
      (e) => e.status === 403,
    ),
  );
  check("Client cannot update status or estimates", () => {
    assert.throws(
      () =>
        service.mutateTicket(s, "REQ-1042", {
          action: "status",
          status: "Completed",
        }),
      (e) => e.status === 403,
    );
    assert.throws(
      () =>
        service.mutateTicket(s, "REQ-1042", {
          action: "estimate",
          amount: 1,
          scope: "x",
        }),
      (e) => e.status === 403,
    );
  });
  const request = {
    tenantId: "atelier",
    websiteId: "web-atelier",
    category: "Cambiar texto",
    subject: "Test request",
    description: "Synthetic description",
    page: "/example",
    priority: "Normal",
    attachments: [],
  };
  check("Tenant and website are validated on create", () => {
    assert.throws(
      () => service.createTicket(s, { ...request, tenantId: "lino" }),
      (e) => e.status === 403,
    );
    assert.throws(
      () => service.createTicket(s, { ...request, websiteId: "web-lino" }),
      (e) => e.status === 400,
    );
  });
  const id = service.createTicket(s, request);
  check("Request creation, message and audit are recorded", () => {
    service.mutateTicket(s, id, { action: "message", text: "Client reply" });
    assert.equal(service.ticketFor(s, id).messages.length, 1);
    assert.ok(s.audit.length >= 2);
  });
  s.actor = service.identity("second");
  check("Direct ticket ID cannot bypass tenant access", () =>
    assert.throws(
      () => service.ticketFor(s, id),
      (e) => e.status === 403,
    ),
  );
  view = await service.snapshot(s);
  check("Second client has a warning and an empty inbox", () => {
    assert.equal(view.workspace.websites[0].health.status, "Degraded");
    assert.equal(view.tickets.length, 0);
  });
  s.actor = service.identity("admin");
  service.mutateTicket(s, id, {
    action: "message",
    text: "Private admin note",
    internal: true,
  });
  service.mutateTicket(s, id, {
    action: "estimate",
    amount: 175,
    scope: "Example scope",
    approvalRequired: true,
  });
  check("Work cannot start before required approval", () =>
    assert.throws(
      () =>
        service.mutateTicket(s, id, {
          action: "status",
          status: "In Progress",
        }),
      (e) => e.status === 409,
    ),
  );
  check("Administrator cannot approve on behalf of client", () =>
    assert.throws(
      () => service.mutateTicket(s, id, { action: "approve", revision: 1 }),
      (e) => e.status === 403,
    ),
  );
  service.mutateTicket(s, id, {
    action: "estimate",
    amount: 200,
    scope: "Revised example scope",
    approvalRequired: true,
  });
  s.actor = service.identity("client");
  check("Stale estimate approval is rejected", () =>
    assert.throws(
      () => service.mutateTicket(s, id, { action: "approve", revision: 1 }),
      (e) => e.status === 409,
    ),
  );
  service.mutateTicket(s, id, { action: "approve", revision: 2 });
  check("Approval is versioned, recorded and cannot be replayed", () => {
    assert.equal(service.ticketFor(s, id).estimate.decision, "approved");
    assert.equal(service.ticketFor(s, id).estimate.decidedBy, "demo-client-a");
    assert.throws(
      () => service.mutateTicket(s, id, { action: "approve", revision: 2 }),
      (e) => e.status === 409,
    );
  });
  view = await service.snapshot(s);
  check("New internal notes remain absent from client payloads", () =>
    assert.ok(!JSON.stringify(view).includes("Private admin note")),
  );
  s.actor = service.identity("admin");
  check("Completion needs a completion record", () =>
    assert.throws(
      () =>
        service.mutateTicket(s, id, { action: "status", status: "Completed" }),
      (e) => e.status === 400,
    ),
  );
  service.mutateTicket(s, id, {
    action: "status",
    status: "Completed",
    completion: "Verified synthetic changes",
  });
  check("Completed work includes timestamp and summary", () => {
    assert.ok(service.ticketFor(s, id).completedAt);
    assert.equal(service.ticketFor(s, id).status, "Completed");
  });
  check("Attachments reject oversized, unsupported and excess files", () => {
    for (const files of [
      [{ name: "x", size: 6000000, type: "image/png" }],
      [{ name: "x", size: 20, type: "text/html" }],
      Array(4).fill({ name: "x", size: 20, type: "image/png" }),
    ])
      assert.throws(
        () => service.validateAttachments(files),
        (e) => e.status === 400,
      );
  });
  check("Attachment content is not retained", () =>
    assert.deepEqual(
      service.validateAttachments([
        { name: "sample.png", size: 10, type: "image/png", content: "private" },
      ]),
      [{ name: "sample.png", size: 10, type: "image/png" }],
    ),
  );
  const failed = await probeAdelvio(async () => {
    throw new Error("upstream failed");
  });
  check("Probe timeout is unknown, not a false outage", () =>
    assert.equal(failed.available, null),
  );
  const success = await probeAdelvio(async (url) => {
    assert.equal(url, "https://adelvio.com/");
    return new Response("", { status: 200 });
  });
  check("Public probe is allowlisted and marked live", () => {
    assert.equal(success.available, true);
    assert.equal(success.provenance, "live");
  });

  const sessions = new Map();
  const env = {
    PORTAL_SESSIONS: {
      idFromName: (n) => n,
      get: (n) => {
        if (!sessions.has(n)) sessions.set(n, new PortalSession());
        return sessions.get(n);
      },
    },
    PORTAL_LIMITER: { limit: async () => ({ success: true }) },
    ASSETS: { fetch: async () => new Response("asset") },
  };
  const origin = "https://portal.example";
  const send = (path, body, cookie, extra = {}) =>
    worker.fetch(
      new Request(origin + "/api/portal" + path, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Origin: origin,
          "Content-Type": "application/json",
          ...(cookie ? { Cookie: cookie } : {}),
          ...extra,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      env,
    );
  check("Anonymous requests are blocked", () => {});
  assert.equal((await send("/snapshot")).status, 401);
  assert.equal(
    (
      await send("/login", { profile: "admin" }, null, {
        Origin: "https://evil.example",
      })
    ).status,
    403,
  );
  checks++;
  let response = await send("/login", { profile: "client" });
  assert.equal(response.status, 200);
  const cookie = response.headers.get("set-cookie").split(";")[0];
  check("Demo cookie has Secure, HttpOnly and SameSite restrictions", () => {
    assert.match(response.headers.get("set-cookie"), /HttpOnly/);
    assert.match(response.headers.get("set-cookie"), /Secure/);
    assert.match(response.headers.get("set-cookie"), /SameSite=Strict/);
  });
  response = await send("/snapshot", undefined, cookie);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/);
  checks++;
  assert.equal(
    (await send("/snapshot?tenant=lino", undefined, cookie)).status,
    403,
  );
  checks++;
  assert.equal(
    (await send("/initialize", { profile: "admin" }, cookie)).status,
    404,
  );
  checks++;
  assert.equal(
    (
      await send(
        "/tickets/REQ-1042",
        { action: "message", internal: true, text: "hidden" },
        cookie,
      )
    ).status,
    403,
  );
  checks++;
  assert.equal(
    (await send("/tickets", { ...request, subject: "x".repeat(21000) }, cookie))
      .status,
    413,
  );
  checks++;
  const second = await send("/login", { profile: "client" });
  const cookie2 = second.headers.get("set-cookie").split(";")[0];
  const created = await (await send("/tickets", request, cookie)).json();
  check("Every demo visitor has an independent sandbox", () =>
    assert.notEqual(cookie, cookie2),
  );
  assert.equal(
    (await send("/tickets/" + created.id, undefined, cookie2)).status,
    404,
  );
  checks++;
  await send("/logout", {}, cookie);
  assert.equal((await send("/snapshot", undefined, cookie)).status, 401);
  checks++;
  env.PORTAL_LIMITER.limit = async () => ({ success: false });
  assert.equal((await send("/login", { profile: "client" })).status, 429);
  checks++;
  const sw = readFileSync("public/portal/sw.js", "utf8");
  let persisted;
  let hydration;
  let alarmAt;
  const context = {
    blockConcurrencyWhile: (callback) => { hydration = callback(); return hydration; },
    storage: {
      get: async () => structuredClone(persisted),
      put: async (_key, value) => { persisted = structuredClone(value); },
      setAlarm: async (at) => { alarmAt = at; },
      deleteAll: async () => { persisted = undefined; },
    },
  };
  const initial = new PortalSession(context);
  await hydration;
  await initial.fetch(new Request('https://session/initialize', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({profile:'client'})}));
  check('Demo state expires after an absolute one-hour lifetime', () => assert.equal(alarmAt, persisted.createdAt + 3600000));
  const resumed = new PortalSession(context);
  await hydration;
  assert.equal((await resumed.fetch(new Request('https://session/snapshot'))).status, 200);
  checks++;
  let capped = false;
  for (let i=0;i<60;i++) {
    const before = persisted.tickets[0].messages.length;
    const result = await resumed.fetch(new Request('https://session/tickets/REQ-1042', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'message',text:'x'.repeat(2900)})}));
    if(result.status===413) {capped=true;assert.equal(persisted.tickets[0].messages.length,before);break;}
  }
  check('Oversized demo state is rejected without persisting the mutation',()=>assert.ok(capped));
  await resumed.alarm();
  check('Expiry alarm clears stored demo data', () => assert.equal(persisted, undefined));
  assert.equal((await resumed.fetch(new Request('https://session/snapshot'))).status, 401);
  checks++;
  check("PWA does not persist responses or private data", () => {
    assert.ok(!sw.includes("caches.open"));
    assert.ok(!sw.includes("cache.put"));
    assert.ok(sw.includes("event.request.mode!=='navigate'"));
  });
  console.log(
    `Portal: ${checks} security, workflow, provider and worker checks passed.`,
  );
} finally {
  await server.close();
}
