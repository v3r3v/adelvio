# Adelvio brand assets

- `public/adelvio-logo.png`: original owner-supplied full wordmark, preserved as the source for the header/footer wordmark.
- `public/adelvio-symbol.png`: transparent standalone symbol isolated from the supplied logo. Preserved as the source for the shared interface symbol and Apple touch icon.
- `public/adelvio-logo.webp` and `public/adelvio-symbol.webp`: lossless delivery encodings, with every visible source pixel and alpha value verified unchanged. These are used throughout the website; the WebP symbol is also reused as the favicon to avoid another download.
- `public/og.png`: current studio social-sharing artwork.
- `public/adelvio-og.png`: previous social card retained for existing cached links.

The symbol is blue by default. The contact section uses a CSS brightness/invert filter to display the same silhouette in white. Decorative images have empty alternative text and explicit dimensions. Asset URLs support both the root Cloudflare deployment and the GitHub Pages subdirectory.

## Symbol extraction

Created with one built-in image-generation edit, using `adelvio-logo.png` as the edit target. Prompt:

> Crop/isolate only the standalone blue three-part interlocking rounded triangular symbol on the left of the word adelvio. Remove the wordmark and surrounding canvas. Preserve the original symbol silhouette, geometry, proportions, orientation and electric-blue color. Do not redesign or add strokes, letters, shadows, glow or additional elements. Produce a tightly framed square transparent-background PNG containing just the symbol, centered, with a small even transparent margin. Clean transparent negative spaces between the three parts and crisp edges suitable for a favicon and small UI marks. No text, background or mockup.

Verified desktop and 390px mobile rendering, all six marks, the white contact-section variant, no broken eager images, and no horizontal overflow in the measured mobile viewport. The new favicon filename also avoids reusing the previous icon's cached URL.


## Studio social card refresh

The current card is `public/og.png`, generated with the built-in imagegen tool. Primary prompt: premium offwhite/charcoal/electric-blue editorial social card using the original Adelvio logo reference; exact headline "Good design. Real possibility." and supporting copy "Independent digital studio ? Puerto Rico"; miniature desktop/mobile interfaces; no metrics, client logos or testimonials. One correction changed the miniature browser address to `adelvio.com` and its headline to "Made for what's next." The final card was visually inspected before integration.

The web page's interface compositions are actual HTML/CSS, not this raster social card. Only the social-sharing preview uses the generated image.
