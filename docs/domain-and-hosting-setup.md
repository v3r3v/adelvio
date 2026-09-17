# Adelvio — domain purchase and full hosting setup

Prepared September 14, 2026. The owner has purchased `adelvio.com`, renamed the GitHub repository to `v3r3v/adelvio`, and confirmed the Cloudflare website is live. The initial setup instructions below are retained for reference. Production uses the `adelvio` Worker and `SITE_URL=https://adelvio.com`.

**Release-policy update:** Automatic publishing is disabled. Follow [Preview and production releases](release-controls.md) for the current controls. The original automatic-deployment instructions below are historical, not the current release procedure. GitHub Pages remains available as a separately approved phone preview.

The setup uses Cloudflare Registrar for the domain, Cloudflare DNS to connect it, Cloudflare Workers Static Assets for hosting, and GitHub for the source code. The existing design, packages and email-draft inquiry flow are unchanged.

## 1. Find and purchase the domain

1. Open [Cloudflare domain search](https://www.cloudflare.com/domains/) and enter `adelvio.com`, without `https://` or `www`.
2. If available, compare the first-year price, renewal price, registration term and total due including taxes. Search results are not a reservation; availability is checked again during purchase. If taken, check whether you already bought it before selecting an alternative.
3. Create or sign into your own [Cloudflare account](https://dash.cloudflare.com/). Use your existing Gmail address so registration and recovery do not depend on an email address at the new domain.
4. Verify the account email and enable two-factor authentication. Save recovery codes privately.
5. Open **Domain Registration → Register Domains** (or **Register domains**), search again and choose the exact spelling. One year is a reasonable starting term.
6. Enter accurate registrant and billing information directly in Cloudflare. Review the final total and complete the purchase yourself. You do not need a website builder or paid SSL add-on.
7. Complete any registrant verification email. Keep auto-renew enabled, a valid payment method on file and a separate calendar renewal reminder.

Cloudflare Registrar requires Cloudflare nameservers while the domain remains registered there. A domain purchased there already uses them. See [Cloudflare registration instructions](https://developers.cloudflare.com/registrar/get-started/register-domain/).

**If already purchased elsewhere:** keep that registration. Add the domain to your Cloudflare account on the Free plan and use the two nameservers assigned to that zone at the existing registrar. Preserve any existing mail or other service records before changing DNS. Wait for the Cloudflare zone to become Active; no registrar transfer is required for hosting.

## 2. Connect the GitHub repository to hosting

In Cloudflare, open **Workers & Pages → Create application**, then choose the option to import/connect a Git repository for a **Worker**. Button labels may vary. Connect GitHub and limit the installation's repository access to `v3r3v/adelvio`.

Use the following settings. These depend on the Cloudflare configuration files being present on `main`.

| Field | Value |
|---|---|
| Repository | `v3r3v/adelvio` |
| Worker/project name | `adelvio` |
| Production branch | `main` |
| Root directory | Repository root; leave blank or use `/` as the UI requires |
| Build command | `npm run build:cloudflare` |
| Deploy command | `npm run deploy:cloudflare` |
| Build variable | `SITE_URL` = `https://adelvio.com` **only after confirming that is your domain** |
| Build variable | `NODE_VERSION` = `22.14.0` |
| Builds for non-production branches | Off for the initial launch |
| Non-production deploy command, if later enabled | `npx wrangler versions upload --config wrangler.cloudflare.jsonc` |
| Protect with Cloudflare Access | Off for a public website |
| API token | Create new token; name it `adelvio-builds` |

Set the variables in the **build environment**, not just runtime settings. If prompted for dependency installation, use `npm ci`. The asset directory is already configured as `dist-cloudflare` in `wrangler.cloudflare.jsonc`; the deploy command selects that file explicitly. Do not use the original `npm run build`, which targets Sites.

Keep the Workers Free plan for the current static site. Save and deploy, then open the actual `workers.dev` address Cloudflare provides. Do not guess the account-specific address. Confirm the site and profile image load before connecting the domain.

If you first want to deploy before buying a domain, set `SITE_URL` to a confirmed HTTPS preview address. Once the domain is owned and connected, change it to the final address and rebuild.

Cloudflare can automatically deploy subsequent pushes to the connected branch. See [GitHub integration](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/) and [build configuration](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/).

## 3. Attach the domain and enable HTTPS

1. Ensure the domain's Cloudflare zone is **Active** in the same account as the Worker.
2. Open **Workers & Pages → adelvio → Settings → Domains & Routes → Add → Custom Domain**.
3. Add `adelvio.com`.
4. For the chosen www-to-root setup, add a proxied CNAME named `www`, targeting `adelvio.com`, in the domain's DNS records. Configure the redirect in step 4; a separate www Worker binding is not required for this redirect.
5. Cloudflare creates the necessary DNS records and certificates. Wait for activation before announcing the new address.
6. If an existing DNS record conflicts, inspect what it serves before replacing it. Do not change mail records to fix website routing.

Use the Worker's **Custom Domain** setup; do not paste GitHub Pages IP addresses into Cloudflare. See [Worker custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/).

## 4. Choose one primary address

Use `https://adelvio.com` as the primary address. Once both hosts have working certificates, use the domain's **Rules → Redirect Rules** to redirect requests for `www.adelvio.com` to `https://adelvio.com`, preserving the path and query string, with a permanent **301** redirect. Match only the `www` hostname to avoid a loop. Enable **Always Use HTTPS** for the domain and test HTTP URLs too.

Cloudflare provides a [www-to-root redirect example](https://developers.cloudflare.com/rules/url-forwarding/examples/redirect-www-to-root/). Both the redirect hostname and destination must resolve correctly.

The Cloudflare build sets the canonical URL and social-image URLs from `SITE_URL` and uses root-relative image, script and stylesheet paths. Confirm the variable matches the final primary address.

## 5. Verify and switch over

- Open the domain in an incognito window and on a phone using mobile data.
- Check HTTPS, the profile photo, packages, menu, FAQ and section links.
- Confirm `www` and HTTP requests reach the primary HTTPS address.
- Test the inquiry flow: it opens the visitor's email app with a draft. The visitor still reviews and sends it. No backend email delivery or automatic booking is included.
- Confirm the title and social sharing image use the final domain.
- Verify that a subsequent approved change pushed to `main` deploys through Cloudflare.
- After the Cloudflare site works, retire GitHub Pages hosting: remove/disable its publishing workflow and unpublish it under GitHub **Settings → Pages**. Keep the repository; Cloudflare still uses it for source. Coordinate any replacement of old shared links.
- Update the links in your Instagram, LinkedIn, proposals and email signature.

## 6. Email and ongoing costs

The website can launch with the current Gmail address. Buying the domain does not create `hola@adelvio.com`. A mailbox is an optional separate setup: choose a provider, verify the domain, then configure its MX, SPF, DKIM and DMARC records. Configure actual sending and receiving before changing the site's contact address.

Domain renewal is annual. Cloudflare static-asset requests and storage have no charge under the documented static asset model; Worker execution, paid plans or added services can have separate charges. See [static hosting billing and limits](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/). Review provider bills and renewal notices; enable paid services only when needed.

## Current boundary

The website remains live on its existing version. Cloudflare may build `main`, but its deployment command only prints a disabled notice. Publishing requires the explicit local production command documented in [release controls](release-controls.md). GitHub Pages has its own opt-in preview workflow.
