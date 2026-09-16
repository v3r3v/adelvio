import type { Health, Probe, Traffic, Website } from "./model";

export interface DomainProvider {
  read(
    website: Website,
  ): Promise<
    Pick<
      Website,
      "domainExpiry" | "autoRenew" | "ssl" | "sslRenewal" | "dns" | "blocked"
    >
  >;
}
export interface MonitoringProvider {
  read(website: Website): Promise<Health>;
}
export interface DeploymentProvider {
  latest(
    websiteId: string,
  ): Promise<{ deployedAt: string | null; backupAt: string | null }>;
}
export interface ErrorProvider {
  summary(websiteId: string): Promise<{ open: number; explanation: string }>;
}
export interface AnalyticsProvider {
  summary(tenantId: string, days: number): Traffic | Promise<Traffic>;
}
export interface MaintenanceProvider {
  read(
    tenantId: string,
  ): Promise<{ plan: string; price: number; minutes: number }>;
}
export interface NotificationProvider {
  send(input: {
    tenantId: string;
    subject: string;
    text: string;
  }): Promise<{ delivered: boolean; mode: "demo" | "live" }>;
}
export const AI_ENABLED = false;

export const demoAnalytics: AnalyticsProvider = {
  summary(tenantId, days) {
    const multiplier = tenantId === "atelier" ? 1 : 0.62;
    const visitors = Math.round((days === 7 ? 348 : 1426) * multiplier);
    return {
      period: days,
      visitors,
      previous: Math.round(visitors / 1.12),
      views: Array.from({ length: days }, (_, i) =>
        Math.round((32 + ((i * 17 + 9) % 43)) * multiplier),
      ),
      pages: [
        { path: "/", views: Math.round(visitors * 0.65) },
        { path: "/servicios", views: Math.round(visitors * 0.25) },
        { path: "/contacto", views: Math.round(visitors * 0.1) },
      ],
      sources: [
        { name: "Búsqueda", share: 48 },
        { name: "Instagram", share: 32 },
        { name: "Directo", share: 20 },
      ],
      provenance: "demo",
    };
  },
};
export const demoNotifications: NotificationProvider = {
  async send() {
    return { delivered: false, mode: "demo" };
  },
};

/** Public observation only. No user-supplied destination, credentials or proxy redirects. */
export async function probeAdelvio(
  fetcher: typeof fetch = fetch,
): Promise<Probe> {
  const started = Date.now();
  try {
    const response = await fetcher("https://adelvio.com/", {
      method: "HEAD",
      redirect: "manual",
      signal: AbortSignal.timeout(6000),
    });
    return {
      provenance: "live",
      checkedAt: new Date().toISOString(),
      available: response.ok,
      responseMs: Date.now() - started,
      message: response.ok
        ? "La página pública respondió correctamente."
        : "La página no respondió como se esperaba. Conviene revisarla.",
    };
  } catch {
    return {
      provenance: "live",
      checkedAt: new Date().toISOString(),
      available: null,
      responseMs: null,
      message:
        "No pudimos completar esta comprobación. Esto no confirma que la web esté caída.",
    };
  }
}

/** Server-only, read-only Cloudflare adapter. Never wired to the public demo. */
export class CloudflareZoneProvider {
  constructor(
    private token: string,
    private zoneId: string,
  ) {}
  async readZone() {
    if (!/^[a-f0-9]{32}$/i.test(this.zoneId))
      throw new Error("Invalid zone configuration");
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${this.zoneId}`,
      {
        headers: { Authorization: `Bearer ${this.token}` },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!response.ok) throw new Error("Cloudflare information is unavailable");
    const payload = (await response.json()) as {
      success: boolean;
      result: { name: string; status: string };
    };
    if (!payload.success)
      throw new Error("Cloudflare information is unavailable");
    return {
      domain: payload.result.name,
      dnsActive: payload.result.status === "active",
      provenance: "live" as const,
    };
  }
}
