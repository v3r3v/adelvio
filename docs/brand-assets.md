# Adelvio brand assets

- `public/adelvio-logo.png`: original owner-supplied full wordmark, used in the header and footer.
- `public/adelvio-symbol.png`: transparent standalone symbol isolated from the supplied logo. Used as the favicon, Apple touch icon, and six decorative marks in the hero phone, hero tag, service ribbon, booking concept, and contact section.
- `public/adelvio-og.png`: social-sharing artwork.

The symbol is blue by default. The contact section uses a CSS brightness/invert filter to display the same silhouette in white. Decorative images have empty alternative text and explicit dimensions. Asset URLs support both the root Cloudflare deployment and the GitHub Pages subdirectory.

## Symbol extraction

Created with one built-in image-generation edit, using `adelvio-logo.png` as the edit target. Prompt:

> Crop/isolate only the standalone blue three-part interlocking rounded triangular symbol on the left of the word adelvio. Remove the wordmark and surrounding canvas. Preserve the original symbol silhouette, geometry, proportions, orientation and electric-blue color. Do not redesign or add strokes, letters, shadows, glow or additional elements. Produce a tightly framed square transparent-background PNG containing just the symbol, centered, with a small even transparent margin. Clean transparent negative spaces between the three parts and crisp edges suitable for a favicon and small UI marks. No text, background or mockup.

Verified desktop and 390px mobile rendering, all six marks, the white contact-section variant, no broken eager images, and no horizontal overflow in the measured mobile viewport. The new favicon filename also avoids reusing the previous icon's cached URL.
