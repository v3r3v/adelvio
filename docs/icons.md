# Cross-platform icon standard

All UI icons use SVG geometry, not font characters. Unicode arrows can render as Apple emoji on iOS; a text-presentation variation selector or font stack is not the icon system.

Adelvio uses `app/components/Icon.tsx`. Example:

```tsx
<a href="#work">Explore the work <Icon name="arrow-up-right" /></a>
<button aria-label="Close preview"><Icon name="close" /></button>
```

The component sets a 24 × 24 viewBox, a 1.75-unit rounded stroke and `currentColor`. CSS sizes the SVG to 1em, preserving the existing context, colors and hover transforms. Large decorative arrows use the same paths. The brand logo and symbol remain original assets.

For plain HTML demos, use inline SVGs or an in-document SVG symbol sprite, as demonstrated in Pura Cepa. Its arrow, plus, close and bloom paths match this component. Icons must exist in the initial HTML and work without JavaScript or a network icon font.

Decorative SVGs are hidden from assistive technology and do not receive focus. An icon-only control must have an accessible name on the button/link. Keep text labels and keyboard focus styles.

Use this rule for future Adelvio sites and client demos. When introducing a new icon, define its geometry once, reuse it, and review it at desktop and phone widths. Do not substitute an emoji on small screens. The build runs `scripts/check-icons.mjs` to catch reintroduced Unicode UI symbols.

The `menu` icon uses two horizontal strokes (`M4 8h16M4 16h16`) in the shared 24-unit viewBox. It appears inside the decorative mobile concept preview; real navigation controls retain accessible text labels.
