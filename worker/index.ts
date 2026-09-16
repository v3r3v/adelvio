import {
  createTicket,
  identity,
  mutateTicket,
  PortalError,
  seed,
  snapshot,
  ticketFor,
  updateWorkspace,
} from "../portal/service";
import { probeAdelvio } from "../portal/providers";
import type { DemoStore, Probe } from "../portal/model";
interface Env {
  ASSETS: Fetcher;
  PORTAL_SESSIONS: DurableObjectNamespace;
  PORTAL_LIMITER: RateLimit;
}
const headers = {
  "Cache-Control": "no-store, private",
  "Content-Type": "application/json; charset=utf-8",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "same-origin",
};
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers });
const cookieName = "adelvio_demo";
async function body(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    throw new PortalError(415, "Envía una solicitud JSON.");
  if (Number(request.headers.get("content-length") ?? 0) > 20000)
    throw new PortalError(413, "La solicitud es demasiado grande.");
  const reader = request.body?.getReader();
  if (!reader) throw new PortalError(400, "Falta el contenido.");
  let size = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 20000) {
      await reader.cancel();
      throw new PortalError(413, "La solicitud es demasiado grande.");
    }
    chunks.push(part.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  try {
    const data = JSON.parse(new TextDecoder().decode(bytes));
    if (!data || typeof data !== "object" || Array.isArray(data))
      throw new Error();
    return data as Record<string, unknown>;
  } catch {
    throw new PortalError(400, "Contenido no válido.");
  }
}
/** Each public demo session has its own server-side sandbox. No customer database. */
export class PortalSession {
  private store?: DemoStore;
  private lastProbe?: Probe;
  constructor(private ctx?: DurableObjectState) {
    ctx?.blockConcurrencyWhile(async () => {
      this.store = await ctx.storage.get<DemoStore>("demo");
    });
  }
  async alarm() {
    this.store = undefined;
    await this.ctx?.storage.deleteAll();
  }
  async fetch(request: Request) {
    const response = await this.handle(request);
    if (request.method === "POST" && response.ok && this.ctx) {
      if (this.store) {
        await this.ctx.storage.put("demo", this.store);
        await this.ctx.storage.setAlarm(this.store.createdAt + 3600000);
      } else await this.ctx.storage.deleteAll();
    }
    return response;
  }
  private async handle(request: Request) {
    try {
      const url = new URL(request.url);
      const path = url.pathname;
      if (path === "/initialize" && request.method === "POST") {
        this.store = seed((await body(request)).profile);
        return json({ ok: true });
      }
      if (!this.store || Date.now() - this.store.createdAt > 3600000) {
        this.store = undefined;
        return json(
          { error: "La sesión demo terminó. Entra de nuevo para empezar." },
          401,
        );
      }
      const store = this.store;
      if (request.method === "GET" && path === "/snapshot")
        return json(
          await snapshot(
            store,
            url.searchParams.get("tenant") ?? store.actor.tenantId,
            Number(url.searchParams.get("days") ?? 7),
          ),
        );
      if (request.method === "GET" && path === "/probe") {
        if (store.actor.tenantId !== "atelier" && store.actor.role !== "admin")
          throw new PortalError(
            403,
            "Comprobación no disponible para este espacio.",
          );
        if (
          !this.lastProbe ||
          Date.now() - Date.parse(this.lastProbe.checkedAt) > 60000
        )
          this.lastProbe = await probeAdelvio();
        return json(this.lastProbe);
      }
      if (request.method === "GET" && path.startsWith("/tickets/")) {
        const ticket = ticketFor(store, path.split("/")[2]);
        return json({
          ...ticket,
          messages: ticket.messages.filter(
            (m) => !m.internal || store.actor.role === "admin",
          ),
        });
      }
      if (request.method !== "POST")
        throw new PortalError(404, "Recurso no disponible.");
      const input = await body(request);
      if (path === "/logout") {
        this.store = undefined;
        return json({ ok: true });
      }
      if (path === "/role") {
        store.actor = identity(input.profile);
        return json({ ok: true });
      }
      if (path === "/tickets")
        return json({ id: createTicket(store, input) }, 201);
      if (path.startsWith("/tickets/")) {
        mutateTicket(store, path.split("/")[2], input);
        return json({ ok: true });
      }
      if (path === "/workspace") {
        updateWorkspace(store, String(input.tenantId), input);
        return json({ ok: true });
      }
      throw new PortalError(404, "Recurso no disponible.");
    } catch (error) {
      return json(
        {
          error:
            error instanceof PortalError
              ? error.message
              : "No pudimos completar la acción. Intenta de nuevo.",
        },
        error instanceof PortalError ? error.status : 500,
      );
    }
  }
}
const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/portal/")) {
      try {
        if (
          request.method !== "GET" &&
          request.headers.get("Origin") !== url.origin
        )
          throw new PortalError(403, "Origen de la solicitud no permitido.");
        if (!["GET", "POST"].includes(request.method))
          throw new PortalError(405, "Método no disponible.");
        if (env.PORTAL_LIMITER) {
          const limit = await env.PORTAL_LIMITER.limit({
            key: request.headers.get("CF-Connecting-IP") ?? "local",
          });
          if (!limit.success)
            throw new PortalError(
              429,
              "Demasiadas solicitudes. Espera un minuto e intenta de nuevo.",
            );
        }
        const path = url.pathname.replace("/api/portal", "");
        const secure = url.protocol === "https:" ? "; Secure" : "";
        if (path === "/login" && request.method === "POST") {
          const input = await body(request);
          identity(input.profile);
          const id =
            crypto.randomUUID().replaceAll("-", "") +
            crypto.randomUUID().replaceAll("-", "");
          await env.PORTAL_SESSIONS.get(
            env.PORTAL_SESSIONS.idFromName(id),
          ).fetch(
            new Request("https://session/initialize", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ profile: input.profile }),
            }),
          );
          const response = json({ ok: true });
          response.headers.set(
            "Set-Cookie",
            `${cookieName}=${id}; HttpOnly; SameSite=Strict; Path=/api/portal; Max-Age=3600${secure}`,
          );
          return response;
        }
        // initialize is deliberately not exposed through the public API.
        if (
          !/^\/(snapshot|probe|role|logout|workspace|tickets(?:\/REQ-[A-Z0-9]+)?)$/.test(
            path,
          )
        )
          throw new PortalError(404, "Recurso no disponible.");
        const session = request.headers
          .get("Cookie")
          ?.split(";")
          .map((s) => s.trim())
          .find((s) => s.startsWith(cookieName + "="))
          ?.slice(cookieName.length + 1);
        if (!session || !/^[a-f0-9]{64}$/.test(session))
          throw new PortalError(401, "Entra a la demo para continuar.");
        const destination = new URL("https://session" + path + url.search);
        const payload =
          request.method === "POST" ? await body(request) : undefined;
        const response = await env.PORTAL_SESSIONS.get(
          env.PORTAL_SESSIONS.idFromName(session),
        ).fetch(
          new Request(destination, {
            method: request.method,
            headers: { "Content-Type": "application/json" },
            body: payload === undefined ? undefined : JSON.stringify(payload),
          }),
        );
        if (path === "/logout") {
          const out = new Response(response.body, response);
          out.headers.set(
            "Set-Cookie",
            `${cookieName}=; HttpOnly; SameSite=Strict; Path=/api/portal; Max-Age=0${secure}`,
          );
          return out;
        }
        return response;
      } catch (error) {
        return json(
          {
            error:
              error instanceof PortalError
                ? error.message
                : "El portal no está disponible temporalmente.",
          },
          error instanceof PortalError ? error.status : 503,
        );
      }
    }
    if (url.pathname === "/portal" || url.pathname.startsWith("/portal/")) {
      if (!/\.[a-z0-9]+$/i.test(url.pathname)) url.pathname = "/portal/";
      const asset = await env.ASSETS.fetch(new Request(url, request));
      const response = new Response(asset.body, asset);
      response.headers.set("Cache-Control", "no-store");
      response.headers.set("X-Robots-Tag", "noindex, nofollow");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set(
        "Content-Security-Policy",
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; manifest-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
      );
      return response;
    }
    return env.ASSETS.fetch(request);
  },
};

export default worker;
