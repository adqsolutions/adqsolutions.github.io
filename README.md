# ADQ Solutions Website

Marketing website for **ADQ Solutions** — QA consulting, vendor development, and digital QMS tooling for manufacturers, based in Nagpur, Maharashtra, led by Anik Debnath.

Live domain: `https://adqsolutions.in`

## What changed in this pass

- **Split the single HTML file** into `index.html`, `style.css`, and `script.js` so the site is easier to maintain and caches better in the browser.
- **Optimized every image.** The original logo (1.8 MB) and portrait (5.6 MB) were served at display sizes of ~55px and ~140px. They're now resized, compressed, and offered in WebP with automatic PNG/JPG fallback via `<picture>` — a ~98% reduction in page weight from images alone.
- **Added a real favicon set** (16/32/48px, Apple touch icon, Android icons, `favicon.ico`) generated from the gear-mark in the logo, plus a `site.webmanifest`.
- **SEO**: added `robots.txt`, `sitemap.xml`, a proper Open Graph share image sized 1200×630, image alt/width/height attributes (prevents layout shift), and kept the existing JSON-LD structured data working with the new asset paths.
- **Accessibility**: skip-to-content link, visible keyboard focus states, `aria-expanded`/`aria-controls` on the mobile menu button, `aria-current` on the active nav link, form fields with associated error messages and `aria-invalid`, `role="status"`/`aria-live` on the form's result message, `aria-hidden` on decorative icons, testimonials marked up as `<blockquote>`.
- **UX polish**: working scroll-spy nav highlighting, a back-to-top button, subtle scroll-reveal animation (skipped automatically for users with reduced-motion preferences), inline form validation with per-field error text, and an auto-updating copyright year.
- **Performance**: `defer` on the script tag, `fetchpriority="high"` on the logo, `loading="lazy"` on below-the-fold images, reduced Google Fonts weights to what's actually used.

## File structure

```
├── index.html            Page markup
├── style.css              All styles (previously inline in <style>)
├── script.js               All behavior (previously inline in <script>)
├── robots.txt              Crawler rules + sitemap pointer
├── sitemap.xml             Single-page sitemap
├── site.webmanifest        PWA/icon manifest
├── assets/
│   └── img/
│       ├── logo.png / logo.webp                          Nav & footer logo (341×160)
│       ├── anik-debnath-portrait.jpg / .webp              Founder photo (420×420)
│       ├── og-image.jpg                                   Social share image (1200×630)
│       ├── favicon.ico, favicon-16x16.png, favicon-32x32.png, favicon-48x48.png
│       ├── apple-touch-icon.png                           180×180
│       └── android-chrome-192x192.png / -512x512.png
└── README.md
```

## Running locally

No build step — it's plain HTML/CSS/JS. Serve the folder with any static server, e.g.:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying

Upload the whole folder (keeping the `assets/img` structure intact) to your host — e.g. GitHub Pages, Netlify, Vercel, or standard shared hosting for `adqsolutions.in`. If you use GitHub Pages, an empty file named `.nojekyll` in the root avoids Jekyll trying to process the `assets` folder (add one if you hit missing-asset issues).

## Making the contact form actually send email

Right now `#leadForm` validates input in the browser but doesn't send anywhere (see the comment at the top of `script.js`). To make it live, pick one:

1. **Form backend (fastest, no server code)** — sign up for something like Formspree or Getform, get your endpoint URL, and set `FORM_ENDPOINT` near the top of `script.js`. No other changes needed.
2. **Your own backend** — replace the `submitForm()` function in `script.js` with a call to your API/serverless function, which should send the email (e.g. via SendGrid/SES) and return a JSON success/error response.

## Updating content

- **Text/services/testimonials**: edit directly in `index.html` — it's plain semantic HTML5, no templating.
- **Colors/spacing/fonts**: all design tokens are CSS custom properties at the top of `style.css` under `:root` (`--primary`, `--accent`, `--radius-*`, etc.) — change once, updates everywhere.
- **Replacing the logo or portrait**: drop a new source image in `assets/img`, then re-run it through an image tool (e.g. Squoosh, or ImageMagick/Pillow) to export a right-sized WebP + PNG/JPG pair before swapping the filenames referenced in `index.html` — this keeps the page fast.

## SEO checklist for launch

- [ ] Verify `https://adqsolutions.in/` resolves correctly and update `og:url`/`canonical`/JSON-LD `url` if the domain differs.
- [ ] Submit `sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- [ ] Confirm the business's real social links (only WhatsApp and a placeholder LinkedIn URL are set today — update `href="https://linkedin.com"` in the footer and JSON-LD `sameAs` once the actual profile exists).
- [ ] Add a Google Business Profile for local map-pack visibility in Nagpur.
- [ ] Wire up the contact form backend (see above) so submitted inquiries are actually received.
