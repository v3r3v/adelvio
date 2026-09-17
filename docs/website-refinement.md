# Adelvio website refinement — September 2026

Local review: http://127.0.0.1:8790/?lang=es (run `npm run dev:local` if the local server is stopped). No deployment is part of this task.

## What changed

- Preserved the cream, blue, editorial typography and existing animated interface artwork. The hero now names the service, audience and Puerto Rico location, with a primary project-inquiry action and secondary work action.
- Added a compact founder introduction near the top, using the existing portrait, plus clearer direct-collaboration language in the studio section.
- Expanded the two original concepts with business scenarios, intended audiences, design decisions and scope. The service concept now has paired desktop/mobile HTML previews. Native disclosure controls keep the longer explanation optional and keyboard accessible. Concepts remain explicitly identified as studies, with no invented client results.
- Added a three-part cost explanation: project fee, optional monthly care and separate provider costs. The brief displays the existing 50% / 50% payment split and selected care fee. Authoritative offerings, prices and limits still come from `app/offerings.ts`.
- Clarified that Appointments connects a supported provider, rather than promising a custom scheduling platform. Explained that the brief opens an email draft or downloads a text file; it does not submit to a backend.
- Updated Spanish and English together. Translation checks now inspect conditional copy as well as direct string arguments.
- Refined touch targets, package button sizing, focus states and small-screen layouts. Constrained sticky project text to its visual so expanded descriptions cannot overlap it. Corrected the header blur's scrollbar-width overflow.

## Reference principles

These informed the approach, not copied assets or layouts:

| Reference | Applied principle |
| --- | --- |
| [Indigo Estudio](https://indigoestudio.es/) | Restrained typography, whitespace and project imagery. |
| [MadeByShape](https://madebyshape.co.uk/) | Explicit service/location, inquiry and work actions, a visible person behind the studio. |
| [Éter Estudio](https://www.eterestudio.com/) | Natural Spanish and relevance to Puerto Rican business owners. |
| [Oak Harbor Web Designs](https://oakharborwebdesigns.com/) | Clear distinction between build pricing, support and provider expenses. |
| [Barrigón Studio](https://barrigon.studio/) | Founder presence and useful, restrained interaction. |
| [Dgrees](https://dgrees.studio/) | Business-type and contribution labels alongside substantial project visuals. |

## Apple material and other devices

Apple's [Liquid Glass documentation](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass) describes native Apple framework materials, not a drop-in React/HTML component library. The website uses an original CSS interpretation for navigation only, based on supported [backdrop filtering](https://webkit.org/blog/3632/introducing-backdrop-filters/).

`SiteHeader` selects the cosmetic material enhancement when the platform identifies as Apple and the browser supports backdrop blur. Apple visitors receive a translucent, softly rounded floating header, menu and language control. Other devices receive mostly opaque cream surfaces, restrained corners and the same interactions and SVG icons. Detection changes presentation only; no routes, content or controls depend on it. No device data is sent anywhere.

Reduced-transparency and increased-contrast preferences use opaque surfaces. Reduced-motion rules disable the added movement, while existing motion primitives retain their cleanup and preference handling. The shared header blur remains bounded to its navigation area.

## Verification

- `npm run check:language`: passed, including 323 dictionary entries and unchanged offering prices.
- `npm run check:icons`: passed; new menu geometry is documented in `docs/icons.md`.
- `npx tsc --noEmit`: passed.
- `npm run lint`: no errors; the pre-existing unused-expression warning in `scripts/check-studio.mjs:23` remains.
- `npm run build:local`: passed.
- `SITE_URL=https://adelvio.com npm run build:cloudflare`: passed as a local build only. The environment variable must be set using the syntax appropriate to the shell.
- Chrome visual review covered desktop, tablet and phone layouts, including 320px and 390px CSS widths. Measured page width matched the viewport's available content width after the overflow correction.
- Tested Spanish/English switching with form values preserved; menu open/close, Escape focus restoration and navigation; keyboard disclosure controls; appointment sample selection; package selection and form focus; correct $950 / $950 split for Appointments with $99 monthly care separate; local brief download and its truthful status message.
- Inspected contact destinations and the existing email-draft handler. No email was sent. No broken loaded images or browser console warnings/errors were found.
- No new packages or heavy media were added. No Lighthouse score is claimed. Physical iPhone/Safari and Android testing remain to be done; Chrome viewport testing does not substitute for those devices. Preference fallbacks were reviewed in source, not exercised through OS accessibility settings.

## Evidence still to add

Use real, permission-approved client work when available: a named business problem, delivered scope, real desktop/mobile captures and an approved testimonial. Publish outcome metrics only when measured and attributable. The current original concepts should remain labeled until real case studies exist. Additional photography is optional; the existing founder portrait already supports the direct-collaboration story.
