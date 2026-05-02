# PocketPrint® — Premium One-Product Store

> **Print Moments. Anywhere.**
> A complete, production-ready ultra-premium Shopify-style landing page for the PocketPrint Mini portable wireless thermal printer.

---

## ⚡ About

PocketPrint® is a single-page, ultra-premium product experience designed in the spirit of **Apple · Nothing · Teenage Engineering · Arc Browser · Linear**.

Built to feel like a real funded startup brand — never a dropshipping store.

## 🎨 Design Direction

- **Aesthetic** — Refined minimalism with surgical use of blush pink as the singular accent against bone white and matte ink black
- **Typography** — Geist (display) · JetBrains Mono (technical voice) · Instrument Serif (emotional moments)
- **Influences** — Nothing × Teenage Engineering × Arc Browser
- **Palette** — Bone (`#f4f1ec`) · Ink (`#0a0a0c`) · Blush (`#ff8fb1`) · Blush Deep (`#e85a85`)

## 📦 What's Inside

A single self-contained `index.html` file (no build step, no dependencies beyond Google Fonts).

### Sections

1. **Announcement Bar** — Animated marquee with shipping/warranty/trial messages
2. **Glassmorphic Sticky Nav** — Backdrop-blur with live cart counter
3. **Cinematic Hero** — Floating 3D-style SVG product, animated halo ring, breathing shadow, grid mask, technical meta strip
4. **Brand Ticker** — Oversized animated marquee with serif italics
5. **Manifesto** — Sticky meta column with editorial copy
6. **Engineering Showcase** — Dark canvas with 5-card bento grid:
   - Print preview card with thermal-paper mock
   - Animated Bluetooth ping rings
   - Live battery indicator with breathing pulse
   - Dot-matrix speed wave (JS animated)
   - Floating app phone mock
7. **Buy Block** — Live color picker (recolors the SVG product in real-time) · bundle selector · sticky product image · trust trio
8. **How It Works** — Three-step process with dotted connector line
9. **TikTok Reviews** — Horizontal-scroll carousel with 6 gradient cards, view counts, handles
10. **Specs** — Dark section with annotated product callouts
11. **Comparison Table** — PocketPrint vs. Other Mini Printers
12. **Use Cases** — Four parallax bands with paper mock-ups (Journals · Studying · Lists · Kids)
13. **Trust Trio** — Free shipping · 30-day trial · 2-year warranty
14. **FAQ** — Sticky-side accordion with 7 expandable items
15. **Final Cinematic CTA** — Oversized typography on grid background
16. **Footer** — Multi-column with payment badges

### Interactions Wired Up

- ✅ Slide-out cart drawer with overlay
- ✅ Magnetic hover on all buttons
- ✅ Scroll-triggered staggered reveals (IntersectionObserver)
- ✅ Sticky mobile CTA that fades in past hero
- ✅ Animated marquees (announcement + ticker)
- ✅ FAQ accordion
- ✅ Live SVG color recoloring on variant select
- ✅ Bundle pricing that propagates to every CTA
- ✅ Smooth scroll between sections
- ✅ Dot-matrix wave animation
- ✅ Bluetooth ring pulse animation
- ✅ Battery breathing animation
- ✅ Floating product with shadow ease

## 🚀 How to Use

### Option 1 — Open Directly

Double-click `index.html` to open it in your browser. That's it. No build step.

### Option 2 — Local Server

```bash
# Python
python3 -m http.server 8000

# Node
npx serve

# Then open http://localhost:8000
```

### Option 3 — Deploy

Drop `index.html` into:
- **Vercel** — `vercel deploy`
- **Netlify** — drag & drop
- **Cloudflare Pages** — git push
- **GitHub Pages** — push to `main`

## 🛍️ Convert to Shopify Theme

This file is a self-contained HTML prototype. To turn it into a live Shopify store:

1. Create a new Shopify development store
2. Use [Shopify CLI](https://shopify.dev/docs/themes/tools/cli) to bootstrap a theme
3. Split this HTML into Liquid sections:
   - `sections/announcement-bar.liquid`
   - `sections/header.liquid`
   - `sections/hero.liquid`
   - `sections/manifesto.liquid`
   - `sections/feature-showcase.liquid`
   - `sections/product-buy.liquid`
   - `sections/how-it-works.liquid`
   - `sections/reviews.liquid`
   - `sections/specs.liquid`
   - `sections/comparison.liquid`
   - `sections/use-cases.liquid`
   - `sections/trust.liquid`
   - `sections/faq.liquid`
   - `sections/final-cta.liquid`
   - `sections/footer.liquid`
4. Replace product data with `{{ product.title }}`, `{{ product.price | money }}`, etc.
5. Replace `addToCart()` with Shopify's AJAX cart API (`/cart/add.js`)
6. Move CSS into `assets/theme.css` and JS into `assets/theme.js`

## 📱 Responsive Breakpoints

- **Desktop** — 1280px max container
- **Tablet** — 968px
- **Mobile** — 768px (sticky CTA appears, nav links collapse)

## 🎯 Browser Support

Modern evergreen browsers (Chrome, Safari, Firefox, Edge — last 2 versions). Uses:
- CSS custom properties
- `backdrop-filter` (glassmorphism)
- IntersectionObserver
- CSS Grid + Flexbox
- SVG with gradients & filters

## 📄 License

Built for PocketPrint Industries · 2026

---

**Designed worldwide. Made for ideas in motion.**
