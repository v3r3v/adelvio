# Websirico

Website for the user's website-building services. Built September 14, 2026.

## Content decisions

- General studio packages: Launch $750, Business $1,250, Appointments $1,900.
- Optional care: Technical Care $49/month, Care Plus $99/month, Local Growth $199/month.
- Add-on ranges, ownership, payment milestones and scope limits follow the September 12 business plan.
- The separate SF Precisio2n prospect estimate is not the public general pricing catalog.
- The desktop/mobile showcases are original HTML/CSS design concepts, clearly labeled as concepts rather than client work. No testimonials, client logos or outcome metrics are used.

## Operation

For the planned custom-domain launch on Cloudflare, follow [the domain and hosting guide](docs/domain-and-hosting-setup.md). The Cloudflare build uses `/` asset paths and a required `SITE_URL` build variable. GitHub Pages continues to use its existing separate build. Adding these files does not purchase a domain, create a Cloudflare deployment, or change DNS.

Public preview: https://v3r3v.github.io/adelvio/

GitHub repository: https://github.com/v3r3v/adelvio

GitHub Pages publishes automatically when changes are pushed to `main`. The workflow installs locked dependencies with `npm ci`, runs `npm run build:pages`, and deploys `dist-pages`. Repository Settings → Pages must use **GitHub Actions** as its source.

The static entry in `pages/` reuses the same page and styles as Sites. `vite.pages.config.ts` sets `/websirico/` as the public base; the profile photo uses that base, and social metadata points to public GitHub Pages assets. Run `npm run preview:pages` after a Pages build to check locally. The original Sites build remains available via `npm run build`.

This is a public informational preview. It requires no ChatGPT account. The inquiry form still prepares an email draft or downloads a brief; it does not send mail from a server. The owner reports purchasing adelvio.com; its Cloudflare connection remains pending. Internal prospect estimates and call notes are outside this repository.

Use npm install, npm run dev and npm run build. The project uses the generated Sites/Vinext structure and retains its lockfile. Hosting identity is in .openai/hosting.json. Never place source credentials or user secrets in this file or source control.

The primary page is app/page.tsx; hero/base styles are app/globals.css; the remaining site styles are app/studio.css. Metadata is in app/layout.tsx. The generated social card is public/og.png.

## Validation

Production build and TypeScript check passed. Inspected desktop and mobile layouts in Chrome, tested navigation, package-to-brief selection, care totals, FAQ expansion and the brief download. Checked for horizontal overflow and broken section anchors at 320px, 390px, 768px and 1440px. Fixed the mobile navigation visibility issue found during testing. Reduced-motion CSS disables entrance/reveal effects and smooth scrolling; keyboard focus indicators and a skip link are present.


## Brand and contact update
Public business name: Websirico. Owner: Jose Rodriguez, B.S. in Computer Engineering (PUPR). Uses the supplied profile photo, phone, email, Instagram and LinkedIn links. The form prepares a mailto draft for the visitor to review and send; it does not deliver mail through a backend. A local brief download remains available. The owner reports purchasing adelvio.com. Cloudflare custom-domain activation remains pending.
