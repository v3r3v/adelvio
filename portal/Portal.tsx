/* eslint-disable @next/next/no-img-element -- Static portal uses shared local brand assets. */
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Icon } from "../app/components/Icon";
import {
  categories,
  statusLabels,
  statuses,
  type Attachment,
  type Probe,
  type Snapshot,
  type Ticket,
} from "./model";

const base = import.meta.env.BASE_URL;
const root = base + "portal";
const currency = (value: number) =>
  new Intl.NumberFormat("es-PR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
const when = (value: string) =>
  new Intl.DateTimeFormat("es-PR", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Puerto_Rico",
  }).format(new Date(value));
const day = (value: string) =>
  new Intl.DateTimeFormat("es-PR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Puerto_Rico",
  }).format(new Date(value));
class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
async function api<T>(
  path: string,
  data?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  if (base !== "/")
    throw new ApiError(
      503,
      "Esta vista necesita el servidor de Cloudflare. Abre la demo en adelvio.com/portal.",
    );
  const response = await fetch("/api/portal" + path, {
    method: data === undefined ? "GET" : "POST",
    headers: data === undefined ? {} : { "Content-Type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });
  if (!response.headers.get("content-type")?.includes("application/json"))
    throw new ApiError(
      503,
      "El servidor del portal no está disponible. Intenta de nuevo.",
    );
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok)
    throw new ApiError(
      response.status,
      payload.error ?? "No pudimos completar la acción.",
    );
  return payload;
}
const errorText = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "No pudimos conectar. Intenta de nuevo.";
function Brand() {
  return (
    <a className="p-brand" href={base} aria-label="Adelvio, sitio principal">
      <img
        src={base + "adelvio-logo.webp"}
        width="2048"
        height="768"
        alt="Adelvio"
      />
    </a>
  );
}
function Label({ children }: { children: ReactNode }) {
  return <p className="p-label">{children}</p>;
}
function Status({ value }: { value: Ticket["status"] }) {
  return (
    <span
      className={
        "p-status " +
        (["Completed", "Closed"].includes(value)
          ? "done"
          : value === "Awaiting Approval"
            ? "attention"
            : "")
      }
    >
      {statusLabels[value]}
    </span>
  );
}
function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-empty">
      <Icon name="window-dots" />
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
function ErrorNotice({ text }: { text: string }) {
  return text ? (
    <div className="p-error" role="alert">
      {text}
    </div>
  ) : null;
}
type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

function Nav({
  to,
  children,
  className = "",
  path,
  go,
}: {
  to: string;
  children: ReactNode;
  className?: string;
  path: string;
  go: (p: string) => void;
}) {
  return (
    <a
      className={className}
      href={root + (to === "/" ? "/" : to)}
      aria-current={
        path === to || (to === "/support" && path.startsWith("/support/"))
          ? "page"
          : undefined
      }
      onClick={(e) => {
        if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
          e.preventDefault();
          go(to);
        }
      }}
    >
      {children}
    </a>
  );
}

export function Portal() {
  const [path, setPath] = useState(location.pathname.replace(root, "") || "/");
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [tenant, setTenant] = useState("");
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [install, setInstall] = useState<InstallPrompt | null>(null);
  const go = useCallback((to: string) => {
    history.pushState(null, "", root + (to === "/" ? "/" : to));
    setPath(to);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    const pop = () => setPath(location.pathname.replace(root, "") || "/");
    const prompt = (e: Event) => {
      e.preventDefault();
      setInstall(e as InstallPrompt);
    };
    window.addEventListener("popstate", pop);
    window.addEventListener("beforeinstallprompt", prompt);
    return () => {
      window.removeEventListener("popstate", pop);
      window.removeEventListener("beforeinstallprompt", prompt);
    };
  }, []);
  useEffect(() => {
    document.title =
      "Adelvio Portal · " +
      (path === "/login"
        ? "Demo"
        : path.startsWith("/support")
          ? "Solicitudes"
          : path === "/settings"
            ? "Tu espacio"
            : "Resumen");
  }, [path]);
  const load = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const data = await api<Snapshot>(
          `/snapshot?days=${period}${tenant ? "&tenant=" + encodeURIComponent(tenant) : ""}`,
          undefined,
          signal,
        );
        setSnapshot(data);
        setError("");
      } catch (e) {
        if (signal?.aborted) return;
        if (e instanceof ApiError && e.status === 401) {
          setSnapshot(null);
          go("/login");
        } else setError(errorText(e));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [period, tenant, go],
  );
  // The state updates in load occur after the asynchronous server response.
  useEffect(() => {
    if (path === "/login") return;
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(controller.signal);
    return () => controller.abort();
  }, [load, path]);
  async function login(profile: string) {
    setBusy(true);
    setError("");
    try {
      await api("/login", { profile });
      setTenant("");
      setSnapshot(null);
      setLoading(true);
      go("/");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function changeRole(profile: string) {
    setBusy(true);
    try {
      await api("/role", { profile });
      setTenant("");
      setSnapshot(null);
      setLoading(true);
      go("/");
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    setBusy(true);
    try {
      await api("/logout", {});
      setSnapshot(null);
      setTenant("");
      go("/login");
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setSnapshot(null);
        setTenant("");
        go("/login");
      } else setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }
  async function mutate(endpoint: string, data: unknown, message: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const result = await api<{ id?: string }>(endpoint, data);
      await load();
      setNotice(message);
      return result;
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setSnapshot(null);
        go("/login");
      } else setError(errorText(e));
      return null;
    } finally {
      setBusy(false);
    }
  }

  if (path === "/login")
    return (
      <div className="p-login">
        <div className="p-login-story">
          <Brand />
          <Label>ADELVIO / CLIENT PORTAL</Label>
          <h1>
            Tu mundo digital.
            <br />
            <em>En buenas manos.</em>
          </h1>
          <p>
            Una vista clara de tu web, tus próximos pasos y el equipo que te
            acompaña.
          </p>
          <div className="p-login-art" aria-hidden="true">
            <div className="p-orbit" />
            <img
              src={base + "adelvio-symbol.webp"}
              alt=""
              width="512"
              height="512"
            />
            <span className="p-art-note">DISEÑO + CUIDADO + CONTINUIDAD</span>
          </div>
          <small>
            Una extensión del estudio. Una forma más simple de estar al día.
          </small>
        </div>
        <main className="p-login-form">
          <span className="p-demo-tag">DEMO INTERACTIVA</span>
          <h2>
            Conoce tu
            <br />
            nuevo espacio.
          </h2>
          <p>
            Explora con un perfil de ejemplo. No necesitas una contraseña ni una
            cuenta real.
          </p>
          <ErrorNotice text={error} />
          <div className="p-profile-options">
            <button disabled={busy} onClick={() => login("client")}>
              <span>
                <strong>Entrar como cliente</strong>
                <small>Adelvio · espacio de ejemplo</small>
              </span>
              <Icon />
            </button>
            <button disabled={busy} onClick={() => login("admin")}>
              <span>
                <strong>Explorar como administrador</strong>
                <small>Gestiona espacios, solicitudes y estimados</small>
              </span>
              <Icon />
            </button>
            <button
              className="p-profile-alt"
              disabled={busy}
              onClick={() => login("second")}
            >
              Ver el segundo cliente ficticio <Icon />
            </button>
          </div>
          {busy && <p role="status">Preparando tu espacio…</p>}
          <div className="p-demo-explanation">
            <strong>Un entorno de prueba, sin compromisos.</strong>
            <p>
              Los datos y perfiles son ficticios. Las acciones no envían
              mensajes, no modifican sitios ni generan cobros. Usa solo
              contenido de ejemplo. La sesión dura hasta una hora. Al salir, los
              datos de esta prueba se eliminan.
            </p>
          </div>
          <a className="p-text-link" href={base}>
            Volver a Adelvio <Icon name="return-left" />
          </a>
          {base !== "/" && (
            <a className="p-primary" href="https://adelvio.com/portal/login">
              Abrir la demo en Cloudflare <Icon />
            </a>
          )}
        </main>
      </div>
    );

  return (
    <div className="p-app">
      <a className="p-skip" href="#portal-main">
        Saltar al contenido
      </a>
      <aside className="p-sidebar">
        <Brand />
        <div className="p-space-label">
          <Label>CLIENT PORTAL</Label>
          <span className="p-demo-tag">DEMO</span>
        </div>
        <nav aria-label="Portal">
          <Nav path={path} go={go} to="/">
            <span>01</span> Resumen <Icon name="arrow-up-right" />
          </Nav>
          <Nav path={path} go={go} to="/support">
            <span>02</span> Solicitudes <Icon name="arrow-up-right" />
          </Nav>
          <Nav path={path} go={go} to="/settings">
            <span>03</span> Tu espacio <Icon name="arrow-up-right" />
          </Nav>
        </nav>
        <div className="p-sidebar-bottom">
          <p>
            Diseñado para
            <br />
            <em>seguir contigo.</em>
          </p>
          <a href="mailto:jose.rodriguez.velez@gmail.com">
            Contactar a Jose <Icon />
          </a>
          <small>Correo real · abre tu aplicación</small>
        </div>
      </aside>
      <div className="p-body">
        <header className="p-topbar">
          <span className="p-breadcrumb">
            TU ESPACIO /{" "}
            <b>
              {path.startsWith("/support")
                ? "SOLICITUDES"
                : path === "/settings"
                  ? "CONFIGURACIÓN"
                  : "RESUMEN"}
            </b>
          </span>
          <div>
            <span className="p-role">
              {snapshot?.actor.role === "admin"
                ? "Administrador demo"
                : "Cliente demo"}
            </span>
            <button className="p-text-link" onClick={logout} disabled={busy}>
              Salir <Icon name="return-left" />
            </button>
          </div>
        </header>
        <div className="p-demo-strip">
          <span className="p-dot" /> Datos de ejemplo. Sin cobros ni cambios en
          sitios reales.{" "}
          <Nav path={path} go={go} to="/settings">
            Sobre esta demo
          </Nav>
        </div>
        <main id="portal-main" className="p-main" tabIndex={-1}>
          <ErrorNotice text={error} />
          {notice && (
            <div className="p-success" role="status">
              <Icon name="check" />
              {notice}
            </div>
          )}
          {loading && !snapshot ? (
            <div className="p-loading" role="status">
              <div />
              <h2>Preparando una vista clara.</h2>
              <p>Cargando el espacio de ejemplo…</p>
            </div>
          ) : !snapshot ? (
            <Empty title="No pudimos abrir este espacio.">
              <button
                className="p-primary"
                onClick={() => {
                  setLoading(true);
                  void load();
                }}
              >
                Intentar de nuevo
              </button>
            </Empty>
          ) : (
            <>
              {snapshot.actor.role === "admin" && (
                <div className="p-workspace-picker">
                  <Label>VISTA DEL ADMINISTRADOR</Label>
                  <label>
                    Espacio del cliente
                    <select
                      value={snapshot.workspace.id}
                      onChange={(e) => {
                        setTenant(e.target.value);
                        setLoading(true);
                        setSnapshot(null);
                        go("/");
                      }}
                    >
                      {snapshot.workspaces.map((w) => (
                        <option value={w.id} key={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span>Las notas internas solo aparecen en este perfil.</span>
                </div>
              )}
              {path === "/" ? (
                <Dashboard
                  data={snapshot}
                  period={period}
                  setPeriod={setPeriod}
                  go={go}
                />
              ) : path === "/support" ? (
                <Support data={snapshot} busy={busy} mutate={mutate} go={go} />
              ) : path.startsWith("/support/") ? (
                <RequestDetail
                  key={path}
                  ticket={snapshot.tickets.find(
                    (t) => t.id === path.split("/")[2],
                  )}
                  admin={snapshot.actor.role === "admin"}
                  busy={busy}
                  mutate={mutate}
                  go={go}
                />
              ) : path === "/settings" ? (
                <Settings
                  data={snapshot}
                  busy={busy}
                  mutate={mutate}
                  changeRole={changeRole}
                  install={install}
                  onInstalled={() => setInstall(null)}
                />
              ) : (
                <Empty title="Esta página no está disponible.">
                  <button className="p-primary" onClick={() => go("/")}>
                    Volver al resumen
                  </button>
                </Empty>
              )}
            </>
          )}
        </main>
        <footer className="p-footer">
          <span>Adelvio / Cuidado digital con intención.</span>
          <span>DEMO · PUERTO RICO</span>
        </footer>
      </div>
    </div>
  );
}

function Dashboard({
  data,
  period,
  setPeriod,
  go,
}: {
  data: Snapshot;
  period: number;
  setPeriod: (n: number) => void;
  go: (p: string) => void;
}) {
  const [probe, setProbe] = useState<Probe | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [now] = useState(() => Date.now());
  const ws = data.workspace;
  const site = ws.websites[0];
  const h = site.health;
  const open = data.tickets.filter(
    (t) => !["Completed", "Closed"].includes(t.status),
  );
  const approvals = open.filter((t) => t.status === "Awaiting Approval");
  const days = Math.ceil((Date.parse(site.domainExpiry) - now) / 86400000);
  const change = Math.round(
    (data.traffic.visitors / data.traffic.previous - 1) * 100,
  );
  const statusText = {
    Online: "Todo en orden.",
    Degraded: "Hay algo que revisar.",
    Maintenance: "En mantenimiento.",
    Offline: "Tu web necesita atención.",
  }[h.status];
  const activity = [
    ...ws.activity,
    ...data.tickets.map((t) => ({
      title: statusLabels[t.status] + ": " + t.subject,
      at: t.updatedAt,
    })),
  ]
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
    .slice(0, 5);
  async function check() {
    setChecking(true);
    setError("");
    try {
      setProbe(await api<Probe>("/probe"));
    } catch (e) {
      setError(errorText(e));
    } finally {
      setChecking(false);
    }
  }
  return (
    <>
      <div className="p-page-heading">
        <div>
          <Label>01 / UNA VISTA CLARA</Label>
          <h1>
            Lo esencial,
            <br />
            <em>en un solo lugar.</em>
          </h1>
        </div>
        <div className="p-heading-meta">
          <span className="p-avatar">{ws.initials}</span>
          <p>
            {ws.name}
            <small>Información de ejemplo · hora de Puerto Rico</small>
          </p>
        </div>
      </div>
      <section
        className={
          "p-health " + (h.status === "Online" ? "" : "p-health-warning")
        }
        aria-labelledby="health-title"
      >
        <div>
          <span className="p-live-label">
            <span className="p-dot" />{" "}
            {h.status === "Online"
              ? "EN LÍNEA · EJEMPLO"
              : h.status === "Maintenance"
                ? "MANTENIMIENTO · EJEMPLO"
                : "ATENCIÓN · EJEMPLO"}
          </span>
          <h2 id="health-title">{statusText}</h2>
          <p>
            {h.status === "Online"
              ? "Tu sitio está disponible en este escenario de demostración."
              : h.status === "Maintenance"
                ? "Hay trabajos programados en este escenario de ejemplo."
                : (h.incidents[0] ??
                  "El equipo debe revisar la disponibilidad del sitio.")}
          </p>
          <div className="p-health-foot">
            <span>
              {site.domain} · {h.incidents.length} incidencias de ejemplo
            </span>
            <small>Última revisión de ejemplo: {when(h.checkedAt)}</small>
          </div>
        </div>
        <div className="p-health-art" aria-hidden="true">
          <div />
          <div />
          <img
            src={base + "adelvio-symbol.webp"}
            alt=""
            width="512"
            height="512"
          />
        </div>
      </section>
      <div className="p-stat-row">
        <Metric
          label="Disponibilidad · ejemplo"
          value={h.uptime + "%"}
          detail="Últimos 30 días"
        />
        <Metric
          label="Respuesta media · ejemplo"
          value={h.responseMs + " ms"}
          detail={h.speed}
        />
        <Metric
          label="Solicitudes abiertas"
          value={String(open.length)}
          detail={
            approvals.length
              ? `${approvals.length} espera tu aprobación`
              : "Sin aprobaciones pendientes"
          }
        />
        <Metric
          label="Mantenimiento"
          value={`${ws.used} / ${ws.minutes}`}
          detail={
            ws.plan === "Care Plus"
              ? "Minutos de contenido / ejemplo"
              : "Minutos técnicos / ejemplo"
          }
        />
      </div>
      {approvals.length > 0 && (
        <button
          className="p-approval-callout"
          onClick={() => go("/support/" + approvals[0].id)}
        >
          <span>
            <b>Un próximo paso espera por ti.</b> Revisa el alcance y el
            estimado de ejemplo.
          </span>
          <Icon />
        </button>
      )}
      <div className="p-dashboard-grid">
        <section className="p-panel p-traffic">
          <div className="p-section-head">
            <div>
              <Label>EL MOVIMIENTO DE TU WEB</Label>
              <h2>Personas que llegan.</h2>
            </div>
            <label className="p-period">
              Periodo
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
              >
                <option value={7}>7 días</option>
                <option value={30}>30 días</option>
              </select>
            </label>
          </div>
          <div className="p-traffic-number">
            <strong>{data.traffic.visitors.toLocaleString("es-PR")}</strong>
            <span>
              visitantes de ejemplo
              <small>+{change}% frente al periodo anterior</small>
            </span>
          </div>
          <div
            className="p-chart"
            role="img"
            aria-label={`Tendencia de vistas de ejemplo de ${period} días. ${data.traffic.views.join(", ")}`}
          >
            <div className="p-chart-grid" />
            {data.traffic.views.map((value, i) => (
              <div
                className="p-bar"
                key={i}
                style={{ height: (value / 85) * 100 + "%" }}
                title={`Día ${i + 1}: ${value} vistas`}
              >
                <span>{value}</span>
              </div>
            ))}
          </div>
          <div className="p-chart-caption">
            <span>HACE {period} DÍAS</span>
            <span>HOY · DATOS SIMULADOS</span>
          </div>
          <div className="p-traffic-breakdown">
            <div>
              <h3>Páginas más vistas</h3>
              {data.traffic.pages.map((p) => (
                <div className="p-line-item" key={p.path}>
                  <span>{p.path}</span>
                  <b>{p.views}</b>
                </div>
              ))}
            </div>
            <div>
              <h3>Cómo te encuentran</h3>
              {data.traffic.sources.map((p) => (
                <div className="p-line-item" key={p.name}>
                  <span>{p.name}</span>
                  <b>{p.share}%</b>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="p-panel">
          <Label>DOMINIO Y PROTECCIÓN / EJEMPLO</Label>
          <h2>
            Tu dirección.
            <br />
            Bien cuidada.
          </h2>
          <div className="p-domain">{site.domain}</div>
          <dl className="p-facts">
            <div>
              <dt>Vencimiento del dominio</dt>
              <dd>
                {day(site.domainExpiry)}
                <small>En {days} días</small>
              </dd>
            </div>
            <div>
              <dt>Renovación automática</dt>
              <dd>{site.autoRenew ? "Activada" : "Necesita atención"}</dd>
            </div>
            <div>
              <dt>Conexión segura</dt>
              <dd>
                {site.ssl === "active"
                  ? "Certificado activo"
                  : "Requiere revisión"}
                <small>Próxima renovación: {day(site.sslRenewal)}</small>
              </dd>
            </div>
            <div>
              <dt>Conexión del dominio</dt>
              <dd>{site.dns ? "Configurada" : "Revisar configuración"}</dd>
            </div>
          </dl>
          <p className={site.autoRenew ? "p-note" : "p-warning"}>
            {site.autoRenew
              ? `En este ejemplo, Cloudflare bloqueó ${site.blocked} solicitudes sospechosas esta semana.`
              : "La renovación automática está desactivada. Confirma la renovación con el proveedor antes del vencimiento."}
          </p>
        </section>
      </div>
      <div className="p-operations">
        <div>
          <Label>ÚLTIMA PUBLICACIÓN / EJEMPLO</Label>
          <h3>{day(h.lastDeployment)}</h3>
          <p>Versión publicada correctamente.</p>
        </div>
        <div>
          <Label>ÚLTIMA COPIA / EJEMPLO</Label>
          <h3>{day(h.lastBackup)}</h3>
          <p>Copia disponible en el escenario de prueba.</p>
        </div>
        <div>
          <Label>COMPROBACIÓN PÚBLICA REAL</Label>
          {ws.id === "atelier" ? (
            <>
              <button
                className="p-text-link"
                disabled={checking}
                onClick={check}
              >
                {checking ? "Comprobando…" : "Comprobar adelvio.com"} <Icon />
              </button>
              {probe && (
                <p role="status">
                  {probe.message}{" "}
                  {probe.responseMs !== null ? `${probe.responseMs} ms · ` : ""}
                  {when(probe.checkedAt)}
                </p>
              )}
              <ErrorNotice text={error} />
              <small>
                Consulta puntual desde Cloudflare. No mide uptime histórico ni
                velocidad de carga.
              </small>
            </>
          ) : (
            <p>Dominio ficticio: no se realizan comprobaciones externas.</p>
          )}
        </div>
      </div>
      <div className="p-dashboard-grid p-bottom-grid">
        <section>
          <div className="p-section-head">
            <h2>Lo que va pasando.</h2>
            <Label>ACTIVIDAD</Label>
          </div>
          <ol className="p-activity">
            {activity.map((a, i) => (
              <li key={a.title + i}>
                <span className="p-activity-dot" />
                <div>
                  <p>{a.title}</p>
                  <time>{when(a.at)}</time>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section>
          <div className="p-section-head">
            <h2>Del estudio, para ti.</h2>
            <Label>AVISOS</Label>
          </div>
          {ws.announcements.length ? (
            ws.announcements.map((a, i) => (
              <article className="p-announcement" key={i}>
                <time>{day(a.at)}</time>
                <h3>{a.title}</h3>
                <p>{a.text}</p>
              </article>
            ))
          ) : (
            <Empty title="Todo al día.">
              Aquí aparecerán los avisos de mantenimiento y las novedades de tu
              espacio.
            </Empty>
          )}
        </section>
      </div>
    </>
  );
}
function Metric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="p-metric">
      <Label>{label}</Label>
      <strong>{value}</strong>
      <p>{detail}</p>
    </div>
  );
}

type Mutate = (
  endpoint: string,
  data: unknown,
  message: string,
) => Promise<{ id?: string } | null>;
function Support({
  data,
  busy,
  mutate,
  go,
}: {
  data: Snapshot;
  busy: boolean;
  mutate: Mutate;
  go: (p: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [files, setFiles] = useState<Attachment[]>([]);
  const [fileError, setFileError] = useState("");
  const filtered = data.tickets.filter(
    (t) =>
      filter === "all" ||
      (filter === "open"
        ? !["Completed", "Closed"].includes(t.status)
        : ["Completed", "Closed"].includes(t.status)),
  );
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (fileError) return;
    const form = new FormData(e.currentTarget);
    const result = await mutate(
      "/tickets",
      {
        tenantId: data.workspace.id,
        websiteId: data.workspace.websites[0].id,
        subject: form.get("subject"),
        description: form.get("description"),
        page: form.get("page"),
        category: form.get("category"),
        priority: form.get("priority"),
        attachments: files,
      },
      "Solicitud de ejemplo creada. No se envió ningún correo.",
    );
    if (result?.id) go("/support/" + result.id);
  }
  return (
    <>
      <div className="p-page-heading">
        <div>
          <Label>02 / SIGAMOS CONSTRUYENDO</Label>
          <h1>
            Una idea.
            <br />
            <em>Un próximo paso.</em>
          </h1>
        </div>
        <button className="p-primary" onClick={() => setCreating(!creating)}>
          {creating ? "Cerrar formulario" : "Nueva solicitud"}
          <Icon name={creating ? "close" : "plus"} />
        </button>
      </div>
      {creating && (
        <section className="p-panel p-new-request">
          <div>
            <Label>CUÉNTANOS QUÉ NECESITAS</Label>
            <h2>
              Los detalles
              <br />
              hacen la diferencia.
            </h2>
            <p>
              Solo contenido de ejemplo. Estas solicitudes viven en tu sesión
              demo; no llegan al equipo.
            </p>
          </div>
          <form onSubmit={submit}>
            <label>
              Asunto
              <input
                required
                maxLength={120}
                name="subject"
                placeholder="Por ejemplo: actualizar el horario"
              />
            </label>
            <div className="p-form-grid">
              <label>
                Tipo de solicitud
                <select name="category">
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Prioridad
                <select name="priority">
                  <option>Normal</option>
                  <option>Alta</option>
                </select>
              </label>
            </div>
            <label>
              Sitio o página afectada
              <input
                required
                name="page"
                maxLength={300}
                defaultValue={data.workspace.websites[0].domain}
              />
            </label>
            <label>
              ¿Qué te gustaría cambiar?
              <textarea
                required
                maxLength={4000}
                rows={5}
                name="description"
                placeholder="Incluye el texto de ejemplo y el resultado que esperas."
              />
            </label>
            <label className="p-upload">
              Adjuntos de ejemplo
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                multiple
                onChange={(e) => {
                  const list = Array.from(e.target.files ?? []);
                  const invalid =
                    list.length > 3 ||
                    list.some(
                      (f) =>
                        f.size === 0 ||
                        f.size > 5 * 1024 * 1024 ||
                        ![
                          "image/png",
                          "image/jpeg",
                          "image/webp",
                          "application/pdf",
                        ].includes(f.type),
                    );
                  setFileError(
                    invalid
                      ? "Selecciona hasta 3 archivos PNG, JPG, WebP o PDF, de hasta 5 MB cada uno."
                      : "",
                  );
                  setFiles(
                    invalid
                      ? []
                      : list.map(({ name, size, type }) => ({
                          name,
                          size,
                          type,
                        })),
                  );
                }}
              />
              <small>
                Solo se guardan el nombre, tipo y tamaño. El contenido del
                archivo no se sube ni puede descargarse en la demo.
              </small>
            </label>
            <ErrorNotice text={fileError} />
            <button className="p-primary" disabled={busy || !!fileError}>
              {busy ? "Guardando…" : "Crear solicitud de ejemplo"}
              <Icon />
            </button>
          </form>
        </section>
      )}
      <div className="p-section-head">
        <h2>Tu conversación con el estudio.</h2>
        <label className="p-period">
          Mostrar
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="open">Abiertas</option>
            <option value="closed">Finalizadas</option>
          </select>
        </label>
      </div>
      <div className="p-ticket-list">
        {filtered.length ? (
          filtered.map((t) => (
            <button
              className="p-ticket-row"
              key={t.id}
              onClick={() => go("/support/" + t.id)}
            >
              <span className="p-ticket-id">{t.id}</span>
              <span className="p-ticket-title">
                <strong>{t.subject}</strong>
                <small>
                  {t.category} · {when(t.createdAt)}
                </small>
              </span>
              <Status value={t.status} />
              <Icon />
            </button>
          ))
        ) : (
          <Empty title="Un espacio para tus próximas ideas.">
            No hay solicitudes en esta vista. Crea una para probar el flujo.
          </Empty>
        )}
      </div>
    </>
  );
}

function RequestDetail({
  ticket,
  admin,
  busy,
  mutate,
  go,
}: {
  ticket?: Ticket;
  admin: boolean;
  busy: boolean;
  mutate: Mutate;
  go: (p: string) => void;
}) {
  const [confirm, setConfirm] = useState(false);
  if (!ticket)
    return (
      <Empty title="Solicitud no disponible.">
        Puede pertenecer a otro espacio o no existir.{" "}
        <button className="p-text-link" onClick={() => go("/support")}>
          Volver a solicitudes
        </button>
      </Empty>
    );
  const t = ticket;
  const endpoint = "/tickets/" + t.id;
  const estimate = t.estimate;
  async function message(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    if (
      await mutate(
        endpoint,
        {
          action: "message",
          text: data.get("message"),
          internal: data.get("internal") === "on",
        },
        "Mensaje añadido a la demo.",
      )
    )
      form.reset();
  }
  async function saveEstimate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await mutate(
      endpoint,
      {
        action: "estimate",
        amount: Number(data.get("amount")),
        scope: data.get("scope"),
        approvalRequired: data.get("approval") === "on",
      },
      "Estimado de ejemplo actualizado.",
    );
  }
  async function saveStatus(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    await mutate(
      endpoint,
      {
        action: "status",
        status: data.get("status"),
        completion: data.get("completion"),
      },
      "Estado actualizado.",
    );
  }
  return (
    <>
      <button className="p-text-link p-back" onClick={() => go("/support")}>
        <Icon name="return-left" /> Todas las solicitudes
      </button>
      <div className="p-detail-heading">
        <Label>
          {t.id} / {t.category}
        </Label>
        <h1>{t.subject}</h1>
        <Status value={t.status} />
      </div>
      <div className="p-detail-grid">
        <div>
          <section className="p-panel">
            <Label>EL PUNTO DE PARTIDA</Label>
            <p className="p-request-description">{t.description}</p>
            <div className="p-request-meta">
              <span>Página: {t.page}</span>
              <span>Prioridad: {t.priority}</span>
              <span>Creada: {when(t.createdAt)}</span>
            </div>
            {t.attachments.length > 0 && (
              <div className="p-attachments">
                <h3>Referencias · solo metadatos</h3>
                {t.attachments.map((f, i) => (
                  <p key={i}>
                    {f.name}{" "}
                    <small>
                      {Math.ceil(f.size / 1024)} KB · contenido no subido
                    </small>
                  </p>
                ))}
              </div>
            )}
          </section>
          {t.completion && (
            <div className="p-completion">
              <Icon name="check" />
              <div>
                <h3>Trabajo completado · ejemplo</h3>
                <p>{t.completion}</p>
                <small>{t.completedAt && when(t.completedAt)}</small>
              </div>
            </div>
          )}
          <section className="p-conversation">
            <h2>Sigamos la conversación.</h2>
            {t.messages.length ? (
              t.messages.map((m) => (
                <article
                  className={"p-message " + (m.internal ? "internal" : "")}
                  key={m.id}
                >
                  <header>
                    <strong>{m.author}</strong>
                    <time>{when(m.at)}</time>
                  </header>
                  {m.internal && <Label>NOTA INTERNA · SOLO ADELVIO</Label>}
                  <p>{m.text}</p>
                </article>
              ))
            ) : (
              <p className="p-note">
                Aquí aparecerán las respuestas a esta solicitud.
              </p>
            )}
            <form onSubmit={message}>
              <label>
                {admin ? "Respuesta o nota" : "Tu mensaje"}
                <textarea
                  name="message"
                  rows={4}
                  maxLength={3000}
                  required
                  placeholder="Escribe un mensaje de ejemplo…"
                />
              </label>
              {admin && (
                <label className="p-checkbox">
                  <input type="checkbox" name="internal" /> Nota interna (no
                  visible para clientes)
                </label>
              )}
              <button className="p-primary" disabled={busy}>
                {busy ? "Guardando…" : "Añadir mensaje"}
                <Icon />
              </button>
            </form>
          </section>
        </div>
        <aside>
          <section className="p-estimate">
            <Label>EL ALCANCE, POR DELANTE</Label>
            <h2>Sin sorpresas.</h2>
            {estimate ? (
              <>
                <div className="p-estimate-price">
                  {currency(estimate.amount)}
                  <small>
                    USD · estimado de ejemplo · revisión {estimate.revision}
                  </small>
                </div>
                <p className="p-preserve">{estimate.scope}</p>
                <p className="p-note">
                  No es una cotización vinculante. No se procesa ningún pago.
                </p>
                <div className="p-estimate-decision">
                  {estimate.decision === "approved"
                    ? "Aprobado en la demo"
                    : estimate.decision === "declined"
                      ? "Solicitaste una revisión"
                      : estimate.decision === "not-required"
                        ? "No requiere aprobación"
                        : "Pendiente de tu decisión"}
                </div>
                {!admin &&
                  estimate.decision === "pending" &&
                  t.status === "Awaiting Approval" && (
                    <>
                      {confirm ? (
                        <div className="p-approval-confirm">
                          <p>
                            ¿Simular la aprobación de{" "}
                            {currency(estimate.amount)} para este alcance?
                          </p>
                          <button
                            className="p-primary"
                            disabled={busy}
                            onClick={async () => {
                              await mutate(
                                endpoint,
                                {
                                  action: "approve",
                                  revision: estimate.revision,
                                },
                                "Aprobación simulada. No hay cobros ni compromiso comercial.",
                              );
                              setConfirm(false);
                            }}
                          >
                            Confirmar aprobación demo
                          </button>
                          <button
                            className="p-text-link"
                            onClick={() => setConfirm(false)}
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <button
                          className="p-primary"
                          disabled={busy}
                          onClick={() => setConfirm(true)}
                        >
                          Revisar y aprobar <Icon />
                        </button>
                      )}
                      <button
                        className="p-text-link"
                        disabled={busy}
                        onClick={() =>
                          mutate(
                            endpoint,
                            { action: "decline", revision: estimate.revision },
                            "Revisión solicitada en la demo.",
                          )
                        }
                      >
                        Pedir una revisión
                      </button>
                    </>
                  )}
              </>
            ) : (
              <p>
                Si el cambio requiere trabajo adicional, el alcance y el
                estimado aparecerán aquí antes de comenzar.
              </p>
            )}
          </section>
          {admin && (
            <section className="p-admin-tools">
              <Label>HERRAMIENTAS DE ADELVIO / DEMO</Label>
              <h3>Preparar estimado</h3>
              <form onSubmit={saveEstimate}>
                <label>
                  Importe (USD)
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    max="100000"
                    step="0.01"
                    required
                    defaultValue={estimate?.amount ?? 150}
                  />
                </label>
                <label>
                  Alcance
                  <textarea
                    name="scope"
                    rows={4}
                    required
                    maxLength={2000}
                    defaultValue={estimate?.scope ?? ""}
                  />
                </label>
                <label className="p-checkbox">
                  <input name="approval" type="checkbox" defaultChecked />{" "}
                  Requiere aprobación del cliente
                </label>
                <button className="p-secondary" disabled={busy}>
                  Guardar estimado demo
                </button>
              </form>
              <h3>Actualizar progreso</h3>
              <form onSubmit={saveStatus}>
                <label>
                  Estado
                  <select name="status" defaultValue={t.status}>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {statusLabels[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Resumen de finalización
                  <textarea
                    name="completion"
                    rows={3}
                    maxLength={2000}
                    placeholder="Obligatorio al completar la solicitud"
                  />
                </label>
                <button className="p-secondary" disabled={busy}>
                  Actualizar estado
                </button>
              </form>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

function Settings({
  data,
  busy,
  mutate,
  changeRole,
  install,
  onInstalled,
}: {
  data: Snapshot;
  busy: boolean;
  mutate: Mutate;
  changeRole: (p: string) => void;
  install: InstallPrompt | null;
  onInstalled: () => void;
}) {
  const [installNote, setInstallNote] = useState("");
  const ws = data.workspace;
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await mutate(
      "/workspace",
      {
        tenantId: ws.id,
        status: form.get("status"),
        used: Number(form.get("used")),
        announcement: form.get("announcement"),
      },
      "Información de ejemplo actualizada.",
    );
  }
  return (
    <>
      <div className="p-page-heading">
        <div>
          <Label>03 / UNA RELACIÓN CLARA</Label>
          <h1>
            Tu negocio es tuyo.
            <br />
            <em>Te acompañamos.</em>
          </h1>
        </div>
      </div>
      <div className="p-dashboard-grid">
        <section className="p-panel">
          <Label>TU ESPACIO DE EJEMPLO</Label>
          <h2>{ws.name}</h2>
          <dl className="p-facts">
            <div>
              <dt>Perfil actual</dt>
              <dd>{data.actor.name}</dd>
            </div>
            <div>
              <dt>Plan ilustrativo</dt>
              <dd>
                {ws.plan} · {currency(ws.monthly)}/mes
              </dd>
            </div>
            <div>
              <dt>
                {ws.plan === "Care Plus"
                  ? "Tiempo de contenido / ejemplo"
                  : "Tiempo técnico / ejemplo"}
              </dt>
              <dd>
                {ws.used} de {ws.minutes} minutos
              </dd>
            </div>
          </dl>
          <p className="p-note">
            Los planes y límites comerciales se rigen por tu propuesta. Esta
            demo no activa una suscripción ni modifica un acuerdo.
          </p>
          <h3>Lo tuyo, sigue siendo tuyo.</h3>
          <p>
            Tu dominio, contenido, marca, datos y cuentas de hosting te
            pertenecen. El código específico se entrega según el acuerdo de
            servicio. Adelvio gestiona el portal, el monitoreo y los flujos de
            soporte como un servicio continuo.
          </p>
        </section>
        <section className="p-panel p-install">
          <Label>SIEMPRE A MANO</Label>
          <h2>
            Un espacio que
            <br />
            va contigo.
          </h2>
          <div className="p-install-icon">
            <img
              src={base + "adelvio-symbol.webp"}
              alt=""
              width="512"
              height="512"
            />
          </div>
          <p>
            Puedes añadir el portal a la pantalla de inicio en navegadores
            compatibles.
          </p>
          {install ? (
            <button
              className="p-primary"
              onClick={async () => {
                try {
                  await install.prompt();
                  const choice = await install.userChoice;
                  setInstallNote(
                    choice.outcome === "accepted"
                      ? "Instalación solicitada al navegador."
                      : "Puedes instalarlo más adelante.",
                  );
                  onInstalled();
                } catch {
                  setInstallNote(
                    "Usa el menú del navegador para añadirlo a la pantalla de inicio.",
                  );
                }
              }}
            >
              Instalar portal <Icon name="plus" />
            </button>
          ) : (
            <p className="p-note">
              iPhone: en Safari, abre Compartir y elige «Añadir a pantalla de
              inicio». En Chrome, usa la opción de instalar del navegador cuando
              esté disponible.
            </p>
          )}
          <p role="status">{installNote}</p>
          <small>
            Requiere conexión. El portal no guarda conversaciones ni datos de
            clientes en caché.
          </small>
        </section>
      </div>
      <section className="p-demo-lab">
        <div>
          <Label>LABORATORIO / SOLO DEMOSTRACIÓN</Label>
          <h2>
            Prueba ambos lados
            <br />
            de la conversación.
          </h2>
          <p>
            Cambia de perfil para revisar un estimado como cliente y responder
            como administrador. Todos los perfiles son ficticios. Los cambios se
            conservan solo dentro de esta sesión de ejemplo.
          </p>
        </div>
        <div className="p-profile-options">
          <button disabled={busy} onClick={() => changeRole("client")}>
            Cliente · Adelvio <Icon />
          </button>
          <button disabled={busy} onClick={() => changeRole("second")}>
            Cliente · Casa Lino <Icon />
          </button>
          <button disabled={busy} onClick={() => changeRole("admin")}>
            Administrador demo <Icon />
          </button>
        </div>
      </section>
      {data.actor.role === "admin" && (
        <div className="p-dashboard-grid">
          <section className="p-panel">
            <Label>ADMINISTRACIÓN DE EJEMPLO</Label>
            <h2>Cuidado al día.</h2>
            <form onSubmit={save}>
              <label>
                Estado del sitio
                <select
                  name="status"
                  defaultValue={ws.websites[0].health.status}
                >
                  <option value="Online">En línea</option>
                  <option value="Degraded">Necesita revisión</option>
                  <option value="Maintenance">En mantenimiento</option>
                  <option value="Offline">Fuera de línea</option>
                </select>
              </label>
              <label>
                Minutos utilizados
                <input
                  name="used"
                  type="number"
                  min="0"
                  max={ws.minutes}
                  defaultValue={ws.used}
                  required
                />
              </label>
              <label>
                Añadir aviso para el cliente
                <textarea name="announcement" maxLength={1000} rows={3} />
              </label>
              <button className="p-primary" disabled={busy}>
                Guardar cambios demo
                <Icon />
              </button>
            </form>
          </section>
          <section>
            <Label>REGISTRO DE ACCIONES / ESTA SESIÓN</Label>
            <h2>Una historia clara.</h2>
            {data.audit.length ? (
              <ol className="p-audit">
                {data.audit.map((a, i) => (
                  <li key={i}>
                    <strong>{a.action}</strong>
                    <p>
                      {a.actor} · {when(a.at)}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <Empty title="Todavía no hay cambios.">
                Las acciones de esta sesión aparecerán aquí.
              </Empty>
            )}
          </section>
        </div>
      )}
      <div className="p-phase-two">
        <Label>PRÓXIMAMENTE / FASE 2</Label>
        <p>
          Resúmenes asistidos por IA, siempre basados en datos verificados. La
          IA está desactivada en esta versión.
        </p>
      </div>
    </>
  );
}
