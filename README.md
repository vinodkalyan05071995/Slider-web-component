# `<slider-element>`

A lightweight, dependency-free, accessible slider web component, inspired by [Splide](https://github.com/Splidejs/splide).
About **4.6 KB JS + 1.4 KB CSS** gzipped.

- Slide or fade transitions, with a speed setting and `prefers-reduced-motion` support
- Seamless `loop`, or `rewind`
- Autoplay with a play/pause button, pause on hover, and a stop when keyboard focus enters
- Responsive `per-view` / `per-move` / `gap` set through mobile-first breakpoints, with fractional "peek" layouts
- Arrows, pagination dots, mouse drag and touch swipe, keyboard
- Thumbnail navigation (`nav-for`)
- RTL and vertical (`direction="ttb"`)
- Follows the WAI-ARIA carousel pattern, plus a JS API, events (`slider-ready`, `slide-change`, `slide-moved`, `slide-click`, drag, autoplay, breakpoint updates), translatable labels and TypeScript types

## Install

[![npm](https://img.shields.io/npm/v/slider-element)](https://www.npmjs.com/package/slider-element)
[![gzip size](https://img.shields.io/badge/gzip-4.6%20KB%20JS%20%2B%201.4%20KB%20CSS-blue)](https://www.npmjs.com/package/slider-element)
[![license](https://img.shields.io/npm/l/slider-element)](LICENSE)

### npm

```bash
npm install slider-element
# or
yarn add slider-element
# or
pnpm add slider-element
```

Import it once, anywhere in your app's entry point. The import registers `<slider-element>`, so there's nothing to call.

```js
import 'slider-element';
import 'slider-element/css';
```

If your setup doesn't import CSS from JavaScript, import the stylesheet from your CSS instead (Vite, Parcel and
`postcss-import` resolve package paths):

```css
@import "slider-element/css";
```

Then use the element in your HTML or templates:

```html
<slider-element label="Featured products" loop per-view="3" gap="16">
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</slider-element>
```

**Import paths**

| Import | File | Use it for |
|---|---|---|
| `slider-element` | `slider-element.js` | Bundlers (they minify it for you) |
| `slider-element/min` | `dist/slider-element.min.js` | Pre-minified script |
| `slider-element/css` | `slider-element.css` | Styles |
| `slider-element/css/min` | `dist/slider-element.min.css` | Pre-minified styles |

**TypeScript.** Types are included. The package registers the element and doesn't export anything at runtime, so
import its types with `import type`:

```ts
import 'slider-element';
import type { SliderElement } from 'slider-element';

const slider = document.querySelector('slider-element'); // typed as SliderElement | null
slider?.addEventListener('slide-change', e => console.log(e.detail.index)); // typed event
```

**Frameworks.** It's a standard custom element, so it works in React, Vue, Svelte, Angular and others. Import the
package once on the client, not during server-side rendering. In Vue, tell the compiler it's a custom element:
`compilerOptions.isCustomElement = tag => tag === 'slider-element'`.

### CDN

No build step needed:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slider-element@1/dist/slider-element.min.css">
<script src="https://cdn.jsdelivr.net/npm/slider-element@1/dist/slider-element.min.js" defer></script>
```

`@1` gets the latest 1.x release. Pin an exact version (e.g. `@1.0.0`) in production if you prefer.

### Shopify

Copy `dist/slider-element.min.js` and `dist/slider-element.min.css` into your theme's `assets/` folder. See
[docs/shopify.md](docs/shopify.md) for setup and a ready-made section.

## Usage

```html
<slider-element label="Featured products" loop autoplay="4000" per-view="1" gap="16"
           breakpoints='{"768": {"perView": 2}, "1024": {"perView": 3, "perMove": 3}}'>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</slider-element>
```

Every direct child becomes a slide.

## Documentation

| | |
|---|---|
| [Getting started](docs/getting-started.md) | Install, markup, browser support |
| [Options](docs/options.md) | All attributes, breakpoints, loop vs rewind, RTL & vertical |
| [Thumbnails](docs/thumbnails.md) | `nav-for` thumbnail navigation |
| [JavaScript API](docs/api.md) | Methods, properties, events, translations, TypeScript |
| [Theming](docs/theming.md) | CSS custom properties, class hooks, recipes |
| [Accessibility](docs/accessibility.md) | What's built in and what's up to you |
| [Shopify](docs/shopify.md) | Theme setup, example section, product gallery, theme editor |

## Examples

Serve the repo root with any static server (for example `python3 -m http.server`) and open:

- [`index.html`](index.html): every feature on one page
- [`examples/`](examples/index.html): one standalone page per feature (basic, loop & rewind, responsive, autoplay,
  fade, thumbnails, RTL, vertical, API & events, translations, theming)
- [`examples/shopify/slider-element-gallery.liquid`](examples/shopify/slider-element-gallery.liquid): a ready-to-use Shopify
  section

## Development

```bash
npm install
npm run build            # writes dist/slider-element.min.js and dist/slider-element.min.css
python3 -m http.server   # then open http://localhost:8000
```

`npm publish` runs the build first (`prepublishOnly`).

## License

[MIT](LICENSE)
