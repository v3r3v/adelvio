# Adelvio Client Portal — first demo

## Scope and architecture

The public website remains the existing React/Vite prerendered site. The portal is a separate Vite entry under `pages/portal`, with its own CSS and application bundle. Both use the existing Adelvio assets and SVG icon component. The portal UI is Spanish in this first demo; the public site's Spanish/English switch is unchanged.

Routes on Cloudflare:

- `/portal/login` — explicit demo profile selection; not a real customer sign-in.
- `/portal/` — health, traffic, domain, security, activity and announcements.
- `/portal/support` — inbox, filters and request creation.
- `/portal/support/REQ-…` — conversation, estimate, approval and admin actions.
- `/portal/settings` — maintenance, ownership, installation and demo role switching.

`worker/index.ts` routes `/api/portal/*` to per-session Durable Objects and serves the portal shell for nested routes. The public marketing site still goes through the static asset binding. GitHub Pages continues hosting the public site; its portal footer link points to Cloudflare because GitHub Pages cannot run the API.

`portal/service.ts` owns validation, tenant authorization, internal-message projection, approval rules and audit events. The UI never receives another client's data while using a client profile. Administrator queries are scoped to the selected workspace. IDs alone do not grant access.

## What works now

- Two seeded client workspaces and one demo administrator profile.
- Client-specific website status, sample uptime/response times, domain and certificate dates, DNS/security summaries, deployments, backups and incidents.
- Seven-day and thirty-day sample traffic charts, comparisons, pages and sources.
- Announcements, activity feed, maintenance plan and usage display.
- Eight request categories, subject/description/page/priority validation, conversations, nine request statuses and completion records.
- Admin-only internal notes; they are excluded by the server from client payloads.
- Revisioned estimates, optional approval requirement, client approval/decline, stale/replayed approval rejection, and approval required before scheduled/in-progress/completed work.
- Admin updates to simulated website status, maintenance usage and client announcements.
- Server-side audit trail, safe API errors, size/type limits and rate limiting.
- Installable manifest, existing 512px brand icon, standalone mode, install prompt where supported, and a network-only service worker with an offline explanation.
- A real, user-triggered public HTTP check of `https://adelvio.com/` performed by the Worker. It uses a fixed destination, a six-second timeout, no redirects, and a sixty-second per-session reuse window. A failed connection is reported as unknown, not as a verified outage. This check is **not** uptime history, browser performance, TLS expiry, or private Cloudflare analytics.

All other domain, traffic, backup, deployment, maintenance and account information is explicitly synthetic. The $200 seed estimate illustrates an existing additional-page price range; it is not an offer, invoice or change to the public packages.

## Demo session and data handling

Public profile selection is deliberate. Anyone can explore the administrator role, but only within their own synthetic sandbox. **Do not put actual clients, credentials, private metrics or business records in this demo.** This is not production authentication.

The Worker generates an opaque random session identifier and stores it in an HttpOnly, Secure-on-HTTPS, SameSite=Strict cookie limited to `/api/portal`. The session actor is held on the server and is never accepted from a ticket mutation body. A session has a one-hour absolute lifetime. Its small demo state is saved inside its Durable Object to survive idle eviction; an alarm deletes it at expiry and logout clears it immediately. No D1 database is needed for the demo. Namespace provisioning uses the SQLite-backed Durable Object class configuration; the proposed production SQL schema is not applied.

POST requests require same-origin Origin and JSON content type. Streamed request bodies are capped at 20 KB. A native Cloudflare rate-limit binding limits requests to 90 per minute per client IP (an abuse control, not billing protection or a globally exact counter). Each demo session allows at most 50 requests and 60 messages per request. CSP restricts the portal to same-origin scripts/connections and forbids framing. API responses and portal HTML are no-store. The service worker never writes Cache Storage or intercepts/caches API requests.

Attachment selection accepts at most three PNG/JPEG/WebP/PDF files, each up to 5 MB. **Only name/type/size metadata is transmitted; file contents are never uploaded or downloadable.** The UI says this explicitly. Actual uploads require a private object store, signed access, MIME signature verification and malware scanning.

The complete demo session is also capped at 100 KB; an over-budget mutation is rejected without changing the stored state. Session mutations are serialized with persistence to avoid competing updates.

No email is sent. The sidebar's contact link explicitly opens Jose's real email address in the user's own mail app. Approval buttons only simulate approval; no payments, contracts or real work are triggered. AI is disabled.

## Local setup and verification

```powershell
npm ci
$env:SITE_URL='https://adelvio.com'
npm run build:cloudflare
npm run dev:portal -- --compatibility-date 2026-05-22
```

Open `http://127.0.0.1:8787/portal/login`. The date override is for the installed Wrangler 4.92 runtime; the production compatibility date stays in `wrangler.cloudflare.jsonc`. With a newer runtime supporting that date, `npm run dev:portal` is sufficient. Vite preview alone cannot run the portal API.

```powershell
npm run test:portal
npm run check:language
npm run check:icons
npm run lint
npx tsc --noEmit
npm run build:pages
```

`scripts/test-portal.mjs` tests role/tenant enforcement, note visibility, request input, attachments, approval versioning and replay, completion requirements, session separation, cookie flags, CSRF origin checks, request size, rate limiting, provider timeout handling and network-only PWA behavior. `scripts/test-portal-http.py` exercises the actual local Worker runtime end to end. The SQL file under `migrations/portal` proposes tenant-composite foreign keys for production; it is not a runtime demo dependency.

## Deployment

The existing Cloudflare Git build uses `npm run build:cloudflare`, then `npm run deploy:cloudflare`. The Worker now includes the static-assets binding, `PORTAL_SESSIONS` Durable Object binding/migration and `PORTAL_LIMITER`. Wrangler creates the demo namespace when the deployment token has appropriate permissions. If the Git build token cannot create it, use the account's authorized deployment identity to apply the configuration; do not broaden permissions beyond what is necessary. Do not delete the existing `adelvio.com` domain or DNS configuration.

This adds Worker requests and small temporary Durable Object operations, subject to the account's plan/limits. No paid external provider, database subscription or AI service is required. No new custom domain is needed.

For a future `portal.adelvio.com`, deploy the same portal/Worker as a separate service, keep the API same-origin, and change the portal base/path plus manifest scope/start URL together. The domain model and authorization service are independent of the host. Configure an explicit link from the marketing site and keep separate host-only session cookies.

## Real integrations and production prerequisites

`portal/providers.ts` defines boundaries for Cloudflare/domain data, uptime, deployments/backups, error monitoring, analytics, maintenance/billing and notifications. The demo analytics and notification providers are safe substitutes. `CloudflareZoneProvider` is a read-only server adapter for a scoped zone token; it deliberately is **not exposed by the public demo**. Other real provider adapters are integration work, not fake connected services.

Before actual client onboarding:

1. Replace public `/login` and `/role` demo selection with an established OIDC authentication system, validated issuer/audience/JWKS, invitation-only memberships, and administrator MFA. Disable demo switching entirely on production routes. Use secure server sessions and protect real endpoints independently of UI state.
2. Apply/review the proposed database schema in a private environment and implement tenant-filtered repositories. Derive tenant memberships from authenticated server records. Keep composite tenant foreign keys, transactions for approvals and immutable estimate revisions/audit history.
3. Store integration credentials in Worker secrets or a managed secrets store. If stored per tenant, encrypt with an authenticated encryption scheme and a managed rotating key; the proposed schema stores secret references, never plaintext. Do not use `VITE_` variables for secrets. `.env.example` contains variable names only and does not activate providers.
4. Connect least-privilege Cloudflare zone/DNS/SSL/analytics permissions for each client's account. Registrar expiration and auto-renew data may require that registrar's API; do not infer them from DNS. Provider API permission/plan availability must be checked before promising a metric.
5. Connect external uptime/synthetic checks, deployment and actual backup verification, analytics, error monitoring and email delivery. Preserve provenance and timestamps, including explicit unknown/stale states. The public HTTP probe must not replace these integrations.
6. Add private scanned file storage, authenticated downloads, retention policies, real account recovery/revocation and production abuse controls. Test two real tenant accounts and provider failures before onboarding.
7. Billing remains a separate phase. Display agreed plan status only after integrating it; do not turn demo approvals into charges.

## Phase 2: AI

Keep `AI_ENABLED=false` until verified providers and tenant authorization are in production. A later read-only summary adapter may explain verified incidents, summarize weekly health and suggest request categories. Require source timestamps and evidence, treat client content as untrusted, and retain human approval for changes. No AI model, LM Studio, fabricated analysis or autonomous website changes are used now.

Implementation references: [Cloudflare in-memory state and eviction](https://developers.cloudflare.com/durable-objects/best-practices/rules-of-durable-objects/), [Workers rate limiting](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/), [Wrangler bindings and assets](https://developers.cloudflare.com/workers/wrangler/configuration/).
