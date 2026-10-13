# Performance

## Measured results

Measured on 2026-10-14 with the minified build (`dist/`) in Chromium. Smoothness was measured with the CPU slowed
down 4× to approximate a mid-range phone.

| Test | Result |
|---|---|
| Download size | 4.6 KB JS + 1.4 KB CSS gzipped, no dependencies |
| 1 slider on a page | ready at 15 ms; 1 ms of script |
| 50 sliders (400 slides) on a page | ready at 43 ms; 8 ms script, 7 ms layout; no long tasks |
| Setup cost per slider (100 created at once) | ~0.5 ms each |
| Slide animation, CPU 4× slower | 0 dropped frames (p95 frame 10.9 ms) |
| Fade animation, CPU 4× slower | 0 dropped frames |
| Dragging, CPU 4× slower | 0 dropped frames |
| One pointer-move while dragging | ~2 µs of JS |
| `goTo()` | ~15 µs |
| Window resize, 50 sliders | ~4 ms script + ~5 ms layout per resize |
| Layout shift (CLS) while the script loads | 0 with one slide per view; 0.009 with three (0.001 with the recipe below) |
| 300 sliders added and removed | no leaks: +64 KB heap after garbage collection, no leftover listeners |
| Loop copies | no extra downloads (copies reuse cached images) |

Animations only change `transform` (slide) or `opacity` (fade), which the browser can run on the GPU. Dragging updates
the transform directly, with no layout work.

## Recommendations

### Images: lazy-load everything except the first slide

The biggest cost of any slider is the images inside it. `loading="lazy"` works inside `<slider-element>`: only the
visible slides and their immediate neighbours load, and the rest load as the user moves toward them. In testing, 4 of
10 images loaded at first.

```html
<slider-element label="Hero" loop>
  <div><img src="1.jpg" alt="…" fetchpriority="high"></div>   <!-- first slide: load right away -->
  <div><img src="2.jpg" alt="…" loading="lazy"></div>
  <div><img src="3.jpg" alt="…" loading="lazy"></div>
</slider-element>
```

If the slider is the first thing on the page, its first image is usually the **Largest Contentful Paint** element. Don't
lazy-load it; give it `fetchpriority="high"` instead. Add `width`/`height` attributes or an `aspect-ratio` to images so
their space is reserved before they load. Use `srcset`/`sizes` so phones don't download desktop-sized images. The
[Shopify section](../examples/shopify/slider-element-gallery.liquid) does all of this.

### Layout shift: reserve space before the script loads

Until the script runs, the slider shows only its first slide, at full width. With one slide per view that matches the
final layout, so nothing moves. With several slides per view, the first slide is taller before setup than after, so
content below shifts slightly. To avoid that, give the not-yet-loaded slider the same layout it will have:

```css
/* Match per-view="3" gap="12" */
.cards:not(:defined) { display: flex; gap: 12px; overflow: hidden; }
.cards:not(:defined) > * { display: block !important; flex: 0 0 calc((100% - 2 * 12px) / 3); }
```

```html
<slider-element class="cards" per-view="3" gap="12">…</slider-element>
```

If you use `breakpoints`, add matching media queries to the recipe.

### Loading the script

- Load it with `defer` (or as a module) so it doesn't block page rendering. Sliders set themselves up as soon as the
  script runs.
- Load it once per page, even when there are many sliders.
- With `loop`, each slider adds a few copies of slides at each end (roughly 2 × slides per view + slides per move). They
  cost no extra downloads, but very heavy slides (videos, iframes, large widgets) are duplicated in the page. For those,
  prefer `rewind` over `loop`.

### Autoplay

Autoplay runs on a single timer per slider. It pauses while the browser tab is hidden or the mouse is over the slider,
so background tabs don't keep animating.
