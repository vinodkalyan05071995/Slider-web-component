# JavaScript API

```js
const slider = document.querySelector('slider-element');
```

## Methods

| Method | Description |
|---|---|
| `next()` | Move forward by `per-move` slides. |
| `prev()` | Move back by `per-move` slides. |
| `goTo(index, animate = true)` | Go to a slide (0-based). Pass `false` to jump without animation. |
| `play()` | Start autoplay (needs the `autoplay` attribute). |
| `pause()` | Stop autoplay. |

## Properties

| Property | Description |
|---|---|
| `index` | Index of the current slide (read it, don't set it; use `goTo()` to move). |
| `ready` | `true` once the slider is set up and `slider-ready` has fired. |
| `SliderElement.i18n` | Static object holding the button labels and announcements (see below). |

`window.SliderElement` is the element class.

## Events

Every event is a `CustomEvent` dispatched on the `<slider-element>` element. Events **bubble**, so you can listen on the
slider, on a parent element, or on `document` (useful when sections are added later, as in the Shopify theme editor).
Event detail indexes are 0-based and always refer to real slides, never loop copies.

| Event | When it fires | `detail` |
|---|---|---|
| `slider-ready` | Once, when the slider has been set up | `{ index, count }` |
| `slide-change` | The current slide changes, as the move **starts** | `{ index, prev }` |
| `slide-moved` | The move has **finished** (after the transition; right away when there's no animation) | `{ index, prev }` |
| `slide-click` | A slide is clicked or tapped (not when a drag ends) | `{ index, slide, originalEvent }` |
| `slider-drag-start` | The user starts dragging or swiping | `{ index }` |
| `slider-drag-end` | The user lets go, before the slider snaps to a slide | `{ index }` |
| `slider-autoplay` | Autoplay starts or stops (button, `play()`/`pause()`, or keyboard focus entering) | `{ playing }` |
| `slider-update` | A breakpoint changed the options | `{ options }` |

Notes:

- With several quick moves (for example, fast clicks on an arrow), `slide-change` fires for each one, but `slide-moved`
  fires once, at the end. Its `prev` is where the sequence started.
- In `slide-click`, a click on a loop copy reports its real slide in both `index` and `slide`.
- `slider-update` fires when the options change, not on every resize. `options` holds the active
  `perView`, `perMove`, `gap`, `speed`, `height`, `arrows`, `pagination` and `drag`.
- `slider-ready` can fire before your script runs, for example if your script is loaded after the slider's. Check
  `slider.ready` first:

```js
function onReady(slider, fn) {
  if (slider.ready) fn();
  else slider.addEventListener('slider-ready', fn, { once: true });
}
```

### Examples

```js
// Analytics / syncing other UI
slider.addEventListener('slide-change', e => {
  console.log(`moved from ${e.detail.prev} to ${e.detail.index}`);
});

// Play a video only once its slide has fully arrived
slider.addEventListener('slide-moved', e => {
  slider.querySelectorAll('video').forEach(v => v.pause());
  slider.querySelectorAll('.slider-element__slide')[e.detail.index]?.querySelector('video')?.play();
});

// Open a lightbox on click (drags don't count as clicks)
slider.addEventListener('slide-click', e => openLightbox(e.detail.index));

// Pause a hover effect while dragging
slider.addEventListener('slider-drag-start', () => slider.classList.add('no-hover'));
slider.addEventListener('slider-drag-end', () => slider.classList.remove('no-hover'));

// Listen to every slider on the page
document.addEventListener('slide-change', e => console.log(e.target.id, e.detail.index));
```

## Timing

A slider sets itself up once its script has run **and** its slides have been parsed. If the script loads without
`defer` while the page is still loading, setup waits until the page has finished parsing (`DOMContentLoaded`).
Calls made before setup are ignored, so run your code after both:

```js
document.addEventListener('DOMContentLoaded', async () => {
  await customElements.whenDefined('slider-element');
  slider.goTo(2);
});
```

## Translations

Every visible label and screen-reader announcement comes from `SliderElement.i18n`. `%s` placeholders are filled in order.
Change the strings **before** any slider is created. Labels are read when a slider first connects to the page.

```html
<script src="slider-element.min.js"></script>
<script>
  Object.assign(SliderElement.i18n, {
    carousel: 'carrousel',
    slide: 'diapositive',
    slideLabel: '%s sur %s',               // each slide's label: "2 sur 5"
    status: 'Diapositive %s sur %s',       // live announcement
    prev: 'Diapositive précédente',
    next: 'Diapositive suivante',
    goTo: 'Aller à la diapositive %s',     // pagination dots
    pagination: 'Choisir une diapositive', // dots group label
    select: 'Afficher la diapositive %s',  // thumbnails
    play: 'Lancer le défilement',
    pause: 'Mettre en pause le défilement',
  });
</script>
```

Example: [i18n.html](../examples/i18n.html). In Shopify, fill these from your locale files (see [Shopify](shopify.md)).

## TypeScript

Types ship with the package:

The package doesn't export anything at runtime (importing it registers the element), so use `import type` for the
types:

```ts
import 'slider-element';
import type { SliderElement } from 'slider-element';

const slider = document.querySelector('slider-element');   // SliderElement | null
slider?.addEventListener('slide-change', e => e.detail.index); // typed CustomEvent
slider?.addEventListener('slide-click', e => e.detail.slide);   // HTMLElement
```

Example: [api.html](../examples/api.html).
