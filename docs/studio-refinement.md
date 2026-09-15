# Adelvio studio experience — September 15, 2026

## Direction and retained foundations

The site now introduces Adelvio as an independent digital studio. The visual narrative moves from a thoughtful first impression to a clear next step and then to the possibility of separately scoped digital tools. It retains the warm paper, charcoal and electric blue identity, supplied logo, Jose's real contact details and portrait, existing HTML/CSS editorial concept, and the functioning website inquiry brief.

All package prices, care plans, add-on ranges, payment terms, ownership terms and FAQ answers were extracted from the prior page into `app/offerings.ts` without changing their contents. The broader custom-work chapter explicitly requires a separate scope. There are no invented client engagements, testimonials, results or fixed-price automation/commerce promises.

## Visual and interaction system

- Oversized editorial hero with a shared browser interface, independent mobile layer and inquiry fragment. The primary headline is visible immediately; only its position has a small entrance transition.
- A native-scroll, three-stage system composition on wide, sufficiently tall desktops. The browser recedes as contact and workflow layers come forward. The page does not intercept wheel or touch events.
- Manual stage controls on every screen. Tablet, mobile, short desktop windows and reduced-motion settings use an unpinned presentation.
- A large original editorial website study and an interactive appointment concept. Visitors can select a sample day/time; nothing is booked or submitted.
- Retained, aligned website package comparison; clearer process, care, FAQ, founder and contact sections.
- Sticky navigation, mobile menu with Escape/focus return, visible keyboard focus, semantic FAQ disclosures, comfortable calendar targets, and a downloadable brief with accurate selected prices.

`useScrollScene` performs at most one visible-scene measurement per animation frame, uses passive scroll listeners, and disconnects observers/listeners on unmount. The continuous motion changes CSS transform values, and stage transitions use transform/opacity. No motion library, external font, video, or new runtime dependency was added. The static deployment build now pre-renders the same React page, then hydrates its interactions in the browser. Content is present in the initial HTML, including when JavaScript is unavailable; no server process or additional hosting service is required.

## Verification

Chrome visual review included the hero, every system stage, editorial study, working calendar, package comparison, care, founder, and contact layouts. Browser checks covered 320, 390, 768, 820, 1024, 1440 and 1920px widths with no document overflow or off-screen interactive controls. The checks also covered native scroll stage changes, manual mobile stage selection, reduced motion, menu Escape/focus return, keyboard FAQ opening, package/care selection, required form fields, and the downloaded brief contents. No uncaught browser exceptions were recorded.

The website form still prepares an email draft or a local text download; it does not submit email through a backend. The browser test verifies the download without sending any message or creating a real appointment.

Production assets and metadata support both Cloudflare at `/` and the existing GitHub Pages preview at `/adelvio/`. TypeScript and both build targets must pass before release. Production verification checks the published files against the final local build.

Local Lighthouse audit results are recorded below after the final build. These are synthetic local checks, not a guarantee of real-user field performance.


### Local mobile audit

The production-preview Lighthouse run recorded Performance **98**, Accessibility **100**, Best Practices **100**, and SEO **100**. First contentful paint was 1.2s, largest contentful paint 1.8s, total blocking time 140ms, and cumulative layout shift 0. These use Lighthouse's simulated mobile conditions against a local production preview. Real devices and network conditions may differ. Reports and screenshots are retained in the ignored `work/` folder.

The first audit led to stronger work-label contrast, accessible calendar names matching visible text, a valid robots file, a shared lighter favicon resource, losslessly encoded artwork, and build-time rendering of the initial content. Original logo files and their visible pixels remain intact.
