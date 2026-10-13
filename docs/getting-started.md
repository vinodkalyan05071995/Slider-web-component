# Getting started

## Install

### npm

```bash
npm install slider-element
```

```js
import 'slider-element';      // registers <slider-element>
import 'slider-element/css';  // or include the CSS however your bundler handles it
```

| Import path | File |
|---|---|
| `slider-element` | `slider-element.js` (readable source) |
| `slider-element/min` | `dist/slider-element.min.js` |
| `slider-element/css` | `slider-element.css` |
| `slider-element/css/min` | `dist/slider-element.min.css` |

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/slider-element@1/dist/slider-element.min.css">
<script src="https://cdn.jsdelivr.net/npm/slider-element@1/dist/slider-element.min.js" defer></script>
```

### Copy the files

Copy `dist/slider-element.min.js` and `dist/slider-element.min.css` (about 4.3 KB + 1.4 KB gzipped) into your project.
For Shopify, see [Shopify](shopify.md).

## Markup

Every **direct child** of `<slider-element>` becomes a slide. Use any element: `div`, `li` content, `a`, `figure`, product cards.

```html
<slider-element label="Featured products" loop per-view="1" gap="16"
           breakpoints='{"768": {"perView": 2}, "1024": {"perView": 3}}'>
  <div>Slide 1</div>
  <div>Slide 2</div>
  <div>Slide 3</div>
</slider-element>
```

Always give the slider a name with `label`, `aria-label` or `aria-labelledby` (see [Accessibility](accessibility.md)).

Before the script loads, only the first slide is shown, so the page doesn't jump while it loads.

## Browser support

Current Chrome, Edge, Firefox and Safari (15.5+). It relies on custom elements, `ResizeObserver`, pointer events and the
`inert` attribute. There are no polyfills.

## Next

- [Options](options.md): every attribute
- [Examples](../examples/index.html): one runnable page per feature
