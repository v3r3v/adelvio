import {
  categories,
  statuses,
  type Actor,
  type Attachment,
  type DemoStore,
  type Snapshot,
  type Status,
  type Ticket,
  type Workspace,
} from "./model";
import { demoAnalytics } from "./providers";
export class PortalError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const iso = () => new Date().toISOString();
const date = (days: number) =>
  new Date(Date.now() + days * 86400000).toISOString();
const identities: Record<string, Actor> = {
  client: {
    id: "demo-client-a",
    name: "Mariana · ejemplo",
    role: "client",
    tenantId: "atelier",
  },
  second: {
    id: "demo-client-b",
    name: "Gabriel · ejemplo",
    role: "client",
    tenantId: "lino",
  },
  admin: {
    id: "demo-admin",
    name: "Equipo Adelvio · demo",
    role: "admin",
    tenantId: "atelier",
  },
};
export function identity(key: unknown): Actor {
  if (typeof key !== "string" || !Object.hasOwn(identities, key))
    throw new PortalError(400, "Elige un perfil de ejemplo.");
  return { ...identities[key] };
}
export function seed(profile: unknown = "client"): DemoStore {
  const workspaces: Workspace[] = [
    {
      id: "atelier",
      name: "Adelvio · espacio de ejemplo",
      initials: "AD",
      contact: "cliente@ejemplo.invalid",
      plan: "Care Plus",
      monthly: 99,
      minutes: 30,
      used: 12,
      websites: [
        {
          id: "web-atelier",
          tenantId: "atelier",
          name: "Adelvio",
          domain: "adelvio.com",
          health: {
            status: "Online",
            checkedAt: date(-0.003),
            uptime: 99.98,
            responseMs: 284,
            speed: "Ágil en las comprobaciones de ejemplo.",
            lastDeployment: date(-2),
            lastBackup: date(-1),
            incidents: [],
          },
          domainExpiry: date(43),
          autoRenew: true,
          ssl: "active",
          sslRenewal: date(61),
          dns: true,
          blocked: 427,
        },
      ],
      announcements: [
        {
          title: "Un buen momento para actualizar",
          text: "Revisa tus horarios y servicios antes de la próxima temporada. Puedes pedir el cambio desde aquí.",
          at: date(-1),
        },
        {
          title: "Mantenimiento de ejemplo",
          text: "Revisión técnica programada para el próximo martes. En esta demo no se modificará ningún sitio.",
          at: date(-3),
        },
      ],
      activity: [
        { title: "Copia de recuperación completada · ejemplo", at: date(-1) },
        { title: "Nueva versión publicada · ejemplo", at: date(-2) },
      ],
    },
    {
      id: "lino",
      name: "Casa Lino · negocio ficticio",
      initials: "CL",
      contact: "hola@lino.example",
      plan: "Technical Care",
      monthly: 49,
      minutes: 30,
      used: 8,
      websites: [
        {
          id: "web-lino",
          tenantId: "lino",
          name: "Casa Lino",
          domain: "lino.example",
          health: {
            status: "Degraded",
            checkedAt: date(-0.003),
            uptime: 99.7,
            responseMs: 640,
            speed: "El formulario necesita revisión.",
            lastDeployment: date(-5),
            lastBackup: date(-1),
            incidents: [
              "Una prueba del formulario de contacto no se completó.",
            ],
          },
          domainExpiry: date(14),
          autoRenew: false,
          ssl: "active",
          sslRenewal: date(50),
          dns: true,
          blocked: 84,
        },
      ],
      announcements: [],
      activity: [
        {
          title: "Se detectó un problema de formulario · ejemplo",
          at: date(-0.3),
        },
      ],
    },
  ];
  const tickets: Ticket[] = [
    {
      id: "REQ-1042",
      tenantId: "atelier",
      websiteId: "web-atelier",
      category: "Nueva página",
      subject: "Una página para la nueva colección",
      description:
        "Nos gustaría presentar una colección de temporada con las fotografías y los textos que prepararemos.",
      page: "/coleccion",
      priority: "Normal",
      status: "Awaiting Approval",
      createdAt: date(-3),
      updatedAt: date(-1),
      attachments: [],
      messages: [
        {
          id: "msg-a",
          author: "Equipo Adelvio",
          text: "Podemos añadir una página estándar con el contenido provisto. El alcance de ejemplo está listo para revisar.",
          internal: false,
          at: date(-1),
        },
        {
          id: "msg-internal",
          author: "Equipo Adelvio",
          text: "Nota interna de ejemplo: confirmar la recepción de las fotografías antes de programar.",
          internal: true,
          at: date(-1),
        },
      ],
      estimate: {
        amount: 200,
        scope:
          "Una página estándar, hasta 6 imágenes provistas y una ronda consolidada de cambios. Ejemplo sin compromiso; no es una oferta comercial.",
        revision: 1,
        approvalRequired: true,
        decision: "pending",
      },
    },
    {
      id: "REQ-1041",
      tenantId: "atelier",
      websiteId: "web-atelier",
      category: "Cambiar texto",
      subject: "Actualizar el horario de atención",
      description: "Cambiar el horario del viernes al contenido provisto.",
      page: "/contacto",
      priority: "Normal",
      status: "Completed",
      createdAt: date(-6),
      updatedAt: date(-4),
      completedAt: date(-4),
      completion:
        "Texto actualizado y enlaces revisados en el escenario de ejemplo.",
      attachments: [],
      messages: [],
    },
  ];
  return {
    actor: identity(profile),
    workspaces,
    tickets,
    audit: [],
    createdAt: Date.now(),
  };
}
function text(value: unknown, label: string, max = 2000) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new PortalError(
      400,
      `${label}: revisa el contenido (máximo ${max} caracteres).`,
    );
  return value.trim();
}
export function authorize(store: DemoStore, tenant: string) {
  if (store.actor.role !== "admin" && store.actor.tenantId !== tenant)
    throw new PortalError(403, "No tienes acceso a este espacio.");
  if (!store.workspaces.some((w) => w.id === tenant))
    throw new PortalError(404, "Espacio no disponible.");
}
function admin(store: DemoStore) {
  if (store.actor.role !== "admin")
    throw new PortalError(403, "Esta acción requiere el perfil administrador.");
}
function audit(store: DemoStore, tenantId: string, action: string) {
  store.audit.unshift({ actor: store.actor.name, tenantId, action, at: iso() });
  store.audit = store.audit.slice(0, 100);
}
export async function snapshot(
  store: DemoStore,
  tenant = store.actor.tenantId,
  days = 7,
): Promise<Snapshot> {
  authorize(store, tenant);
  if (![7, 30].includes(days)) throw new PortalError(400, "Periodo no válido.");
  const workspace = store.workspaces.find((w) => w.id === tenant)!;
  const tickets = store.tickets
    .filter((t) => t.tenantId === tenant)
    .map((t) => ({
      ...t,
      messages: t.messages.filter(
        (m) => !m.internal || store.actor.role === "admin",
      ),
    }));
  return structuredClone({
    actor: store.actor,
    workspaces: store.workspaces
      .filter((w) => store.actor.role === "admin" || w.id === tenant)
      .map(({ id, name, initials }) => ({ id, name, initials })),
    workspace,
    tickets,
    traffic: await demoAnalytics.summary(tenant, days),
    audit:
      store.actor.role === "admin"
        ? store.audit.filter((a) => a.tenantId === tenant)
        : [],
    mode: "demo",
  });
}
export function ticketFor(store: DemoStore, id: string) {
  const ticket = store.tickets.find((t) => t.id === id);
  if (!ticket) throw new PortalError(404, "Solicitud no disponible.");
  authorize(store, ticket.tenantId);
  return ticket;
}
export function validateAttachments(value: unknown): Attachment[] {
  if (!Array.isArray(value) || value.length > 3)
    throw new PortalError(400, "Puedes adjuntar hasta 3 archivos.");
  return value.map((f) => {
    if (
      !f ||
      typeof f !== "object" ||
      !["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(
        f.type,
      ) ||
      !Number.isSafeInteger(f.size) ||
      f.size <= 0 ||
      f.size > 5 * 1024 * 1024
    )
      throw new PortalError(400, "Usa PNG, JPG, WebP o PDF de hasta 5 MB.");
    return { name: text(f.name, "Archivo", 150), size: f.size, type: f.type };
  });
}
export function createTicket(store: DemoStore, input: Record<string, unknown>) {
  const tenant = text(input.tenantId, "Espacio", 80);
  authorize(store, tenant);
  if (store.tickets.length >= 50)
    throw new PortalError(400, "Has alcanzado el límite de esta sesión demo.");
  const website = store.workspaces
    .find((w) => w.id === tenant)!
    .websites.find((w) => w.id === input.websiteId);
  if (!website)
    throw new PortalError(400, "Selecciona un sitio de este espacio.");
  if (
    !categories.includes(input.category as (typeof categories)[number]) ||
    !["Normal", "Alta"].includes(input.priority as string)
  )
    throw new PortalError(400, "Categoría o prioridad no válida.");
  const ticket: Ticket = {
    id: "REQ-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
    tenantId: tenant,
    websiteId: website.id,
    category: String(input.category),
    subject: text(input.subject, "Asunto", 120),
    description: text(input.description, "Descripción", 4000),
    page: text(input.page, "Página", 300),
    priority: input.priority as "Normal" | "Alta",
    status: "Submitted",
    createdAt: iso(),
    updatedAt: iso(),
    attachments: validateAttachments(input.attachments ?? []),
    messages: [],
  };
  store.tickets.unshift(ticket);
  audit(store, tenant, "Solicitud creada: " + ticket.id);
  return ticket.id;
}
export function mutateTicket(
  store: DemoStore,
  id: string,
  input: Record<string, unknown>,
) {
  const ticket = ticketFor(store, id);
  if (input.action === "message") {
    const internal = input.internal === true;
    if (internal) admin(store);
    if (ticket.messages.length >= 60)
      throw new PortalError(400, "Límite de mensajes de la demo alcanzado.");
    ticket.messages.push({
      id: crypto.randomUUID(),
      author: store.actor.name,
      text: text(input.text, "Mensaje", 3000),
      internal,
      at: iso(),
    });
  } else if (input.action === "status") {
    admin(store);
    if (!statuses.includes(input.status as Status))
      throw new PortalError(400, "Estado no válido.");
    if (
      ["Scheduled", "In Progress", "Completed"].includes(
        String(input.status),
      ) &&
      ticket.estimate?.approvalRequired &&
      ticket.estimate.decision !== "approved"
    )
      throw new PortalError(
        409,
        "Se necesita la aprobación del cliente antes de continuar.",
      );
    if (input.status === "Completed") {
      ticket.completion = text(
        input.completion,
        "Resumen de finalización",
        2000,
      );
      ticket.completedAt = iso();
    } else {
      delete ticket.completedAt;
      delete ticket.completion;
    }
    ticket.status = input.status as Status;
  } else if (input.action === "estimate") {
    admin(store);
    const amount = Number(input.amount);
    if (
      !Number.isFinite(amount) ||
      amount < 0 ||
      amount > 100000 ||
      Math.abs(Math.round(amount * 100) - amount * 100) > 0.000001
    )
      throw new PortalError(400, "Importe no válido.");
    if (["Completed", "Closed"].includes(ticket.status))
      throw new PortalError(
        409,
        "Reabre la solicitud antes de cambiar el estimado.",
      );
    ticket.estimate = {
      amount,
      scope: text(input.scope, "Alcance", 2000),
      revision: (ticket.estimate?.revision ?? 0) + 1,
      approvalRequired: input.approvalRequired !== false,
      decision: input.approvalRequired === false ? "not-required" : "pending",
    };
    ticket.status = ticket.estimate.approvalRequired
      ? "Awaiting Approval"
      : "Estimate Ready";
  } else if (input.action === "approve" || input.action === "decline") {
    if (store.actor.role !== "client")
      throw new PortalError(
        403,
        "Solo el cliente puede responder al estimado.",
      );
    if (
      !ticket.estimate ||
      !ticket.estimate.approvalRequired ||
      ticket.estimate.decision !== "pending" ||
      input.revision !== ticket.estimate.revision ||
      ticket.status !== "Awaiting Approval"
    )
      throw new PortalError(
        409,
        "El estimado cambió o ya tiene una respuesta. Actualiza la página.",
      );
    ticket.estimate.decision =
      input.action === "approve" ? "approved" : "declined";
    ticket.estimate.decidedAt = iso();
    ticket.estimate.decidedBy = store.actor.id;
    ticket.status = input.action === "approve" ? "Scheduled" : "Reviewing";
  } else throw new PortalError(400, "Acción no disponible.");
  ticket.updatedAt = iso();
  audit(store, ticket.tenantId, `${input.action}: ${id}`);
}
export function updateWorkspace(
  store: DemoStore,
  tenant: string,
  input: Record<string, unknown>,
) {
  admin(store);
  authorize(store, tenant);
  const ws = store.workspaces.find((w) => w.id === tenant)!;
  if (
    !["Online", "Degraded", "Maintenance", "Offline"].includes(
      String(input.status),
    )
  )
    throw new PortalError(400, "Estado no válido.");
  const used = Number(input.used);
  if (!Number.isInteger(used) || used < 0 || used > ws.minutes)
    throw new PortalError(400, "Revisa los minutos utilizados.");
  ws.used = used;
  ws.websites[0].health.status = input.status as WebsiteStatus;
  ws.websites[0].health.checkedAt = iso();
  if (input.announcement)
    ws.announcements.unshift({
      title: "Aviso del estudio · demo",
      text: text(input.announcement, "Aviso", 1000),
      at: iso(),
    });
  ws.announcements = ws.announcements.slice(0, 15);
  audit(store, tenant, "Información del sitio y mantenimiento actualizada");
}
type WebsiteStatus = Workspace["websites"][number]["health"]["status"];
