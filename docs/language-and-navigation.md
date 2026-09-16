# Language and navigation

The static page is rendered in Spanish. After hydration, the language is selected in this order:

1. An explicit `?lang=es` or `?lang=en` link.
2. The visitor's saved ES/EN selection (`adelvio-language` in local storage).
3. The first Spanish or English language in the browser's preferences, including regional variants.
4. Spanish when no supported preference is available.

No location permission, IP lookup or external language service is needed. The visible ES/EN buttons work on desktop and mobile, update the URL without reloading, and remember the choice when browser storage is available. Form entries, package selection and open interactions survive a language change. Page language, title and description update too. Without JavaScript the prerendered Spanish content remains readable.

English source content and prices stay in the existing components and `app/offerings.ts`. Add Spanish strings in `app/i18n/es.ts`; use `useLanguage().t()` for visible text, accessible labels and generated project briefs. Keep package identifiers and URL anchors stable across languages. Run `npm run check:language` when editing copy.

The header keeps its layout footprint and changes into a compact floating surface after 52px of scrolling. A thin line indicates reading progress. A masked backdrop blur softens page content approaching and passing behind the header; only a narrow band is filtered, with a smaller radius on mobile. The navigation itself remains sharp and the opaque surface remains readable if backdrop filtering is unsupported. Scroll writes are scheduled with requestAnimationFrame, resize measurements are cached, and listeners/observers clean up on unmount. The mobile menu supports Escape, outside clicks and keyboard focus. Reduced-motion preferences disable the header transitions and menu entrance animation.
