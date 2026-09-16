export const statuses = [
  "Submitted",
  "Reviewing",
  "Awaiting Client Information",
  "Estimate Ready",
  "Awaiting Approval",
  "Scheduled",
  "In Progress",
  "Completed",
  "Closed",
] as const;
export type Status = (typeof statuses)[number];
export const categories = [
  "Problema con la web",
  "Cambiar texto",
  "Reemplazar imagen",
  "Añadir anuncio",
  "Nueva sección",
  "Nueva página",
  "Integración",
  "Soporte general",
] as const;
export type Role = "client" | "admin";
export type Actor = { id: string; name: string; role: Role; tenantId: string };
export type Attachment = { name: string; size: number; type: string };
export type Message = {
  id: string;
  author: string;
  text: string;
  internal: boolean;
  at: string;
};
export type Estimate = {
  amount: number;
  scope: string;
  revision: number;
  approvalRequired: boolean;
  decision: "pending" | "approved" | "declined" | "not-required";
  decidedAt?: string;
  decidedBy?: string;
};
export type Ticket = {
  id: string;
  tenantId: string;
  websiteId: string;
  category: string;
  subject: string;
  description: string;
  page: string;
  priority: "Normal" | "Alta";
  status: Status;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completion?: string;
  messages: Message[];
  attachments: Attachment[];
  estimate?: Estimate;
};
export type Health = {
  status: "Online" | "Degraded" | "Maintenance" | "Offline";
  checkedAt: string;
  uptime: number;
  responseMs: number;
  speed: string;
  lastDeployment: string;
  lastBackup: string;
  incidents: string[];
};
export type Website = {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  health: Health;
  domainExpiry: string;
  autoRenew: boolean;
  ssl: "active" | "attention";
  sslRenewal: string;
  dns: boolean;
  blocked: number;
};
export type Workspace = {
  id: string;
  name: string;
  initials: string;
  contact: string;
  plan: string;
  monthly: number;
  minutes: number;
  used: number;
  websites: Website[];
  announcements: { title: string; text: string; at: string }[];
  activity: { title: string; at: string }[];
};
export type Audit = {
  actor: string;
  tenantId: string;
  action: string;
  at: string;
};
export type DemoStore = {
  actor: Actor;
  workspaces: Workspace[];
  tickets: Ticket[];
  audit: Audit[];
  createdAt: number;
};
export type Traffic = {
  period: number;
  visitors: number;
  previous: number;
  views: number[];
  pages: { path: string; views: number }[];
  sources: { name: string; share: number }[];
  provenance: "demo";
};
export type Probe = {
  provenance: "live";
  checkedAt: string;
  available: boolean | null;
  responseMs: number | null;
  message: string;
};
export type Snapshot = {
  actor: Actor;
  workspaces: Pick<Workspace, "id" | "name" | "initials">[];
  workspace: Workspace;
  tickets: Ticket[];
  traffic: Traffic;
  audit: Audit[];
  mode: "demo";
};
export const statusLabels: Record<Status, string> = {
  Submitted: "Recibida",
  Reviewing: "En revisión",
  "Awaiting Client Information": "Necesita información",
  "Estimate Ready": "Estimado listo",
  "Awaiting Approval": "Espera tu aprobación",
  Scheduled: "Programada",
  "In Progress": "En progreso",
  Completed: "Completada",
  Closed: "Cerrada",
};
