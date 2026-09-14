# Web design & ongoing care

Website for the user's website-building services. Built September 14, 2026.

## Content decisions

- General studio packages: Launch $750, Business $1,250, Appointments $1,900.
- Optional care: Technical Care $49/month, Care Plus $99/month, Local Growth $199/month.
- Add-on ranges, ownership, payment milestones and scope limits follow the September 12 business plan.
- The separate SF Precisio2n prospect estimate is not the public general pricing catalog.
- No business name or public contact destination has been provided. The site uses the descriptive title “Web design & ongoing care.” The project form creates a local text brief and never claims to submit an inquiry.
- The desktop/mobile showcases are original HTML/CSS design concepts, clearly labeled as concepts rather than client work. No testimonials, client logos or outcome metrics are used.

## Operation

Use npm install, npm run dev and npm run build. The project uses the generated Sites/Vinext structure and retains its lockfile. Hosting identity is in .openai/hosting.json. Never place source credentials or user secrets in this file or source control.

The primary page is app/page.tsx; hero/base styles are app/globals.css; the remaining site styles are app/studio.css. Metadata is in app/layout.tsx. The generated social card is public/og.png.

## Validation

Production build and TypeScript check passed. Inspected desktop and mobile layouts in Chrome, tested navigation, package-to-brief selection, care totals, FAQ expansion and the brief download. Checked for horizontal overflow and broken section anchors at 320px, 390px, 768px and 1440px. Fixed the mobile navigation visibility issue found during testing. Reduced-motion CSS disables entrance/reveal effects and smooth scrolling; keyboard focus indicators and a skip link are present.

Before enabling direct inquiries, confirm the owner's intended public business name and email or WhatsApp destination. Keep the local brief download available as an alternative if desired. No private account email or prospect's phone number should be substituted as the owner's contact.
