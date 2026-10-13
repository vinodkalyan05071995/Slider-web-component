# Options

All options are HTML attributes. Boolean options are on when the attribute is present.

| Attribute | Default | Breakpoint key | Description |
|---|---|---|---|
| `label` | `Carousel` | – | Accessible name. You can use `aria-label` or `aria-labelledby` instead. |
| `per-view` | `1` | `perView` | Slides visible at once. Fractions let the next slide peek in, e.g. `1.2` or `2.5`. |
| `per-move` | `1` | `perMove` | Slides moved per arrow click, swipe or autoplay step. Also sets how many pagination dots there are. |
| `gap` | `0` | `gap` | Space between slides, in px. |
| `speed` | `400` | `speed` | Transition duration, in ms. |
| `transition` | `slide` | – | `slide` or `fade`. Fade always shows one slide at a time. |
| `direction` | auto | – | `ltr`, `rtl` or `ttb` (vertical). RTL is detected automatically from `dir="rtl"` on the page or a parent element. |
| `height` | `24rem` | `height` | Height of a vertical (`ttb`) slider. Any CSS length. |
| `loop` | off | – | Infinite loop. |
| `rewind` | off | – | After the last slide, go back to the first one (and the reverse). |
| `autoplay` | off | – | Turns autoplay on. The value is the interval in ms; with no value it's `5000`. Adds a play/pause button. |
| `no-arrows` | off | `arrows: false` | Hides the previous/next buttons. |
| `no-pagination` | off | `pagination: false` | Hides the pagination dots. |
| `no-drag` | off | `drag: false` | Turns off mouse drag and touch swipe. |
| `breakpoints` | – | – | Responsive overrides (see below). |
| `nav-for` | – | – | Makes this slider the thumbnail navigator for the slider with that `id`. See [Thumbnails](thumbnails.md). |

## Breakpoints

`breakpoints` is a JSON object keyed by **min-width** in px (mobile-first). Every matching breakpoint is applied, smallest
first, on top of the attributes.

```html
<slider-element per-view="1.2" gap="12"
           breakpoints='{"640": {"perView": 2, "gap": 16}, "1024": {"perView": 4, "perMove": 2, "arrows": true}}'>
```

| Width | Result |
|---|---|
| < 640px | 1.2 per view, gap 12 |
| 640–1023px | 2 per view, gap 16 |
| ≥ 1024px | 4 per view, move 2, gap 16 |

Keys you can use: `perView`, `perMove`, `gap`, `speed`, `height`, `arrows`, `pagination`, `drag`.
Use single quotes around the attribute so the JSON's double quotes don't need escaping.

## Loop vs rewind

- **`loop`** gives a seamless infinite loop. The slider adds copies of slides at each end and jumps back to the real slide
  without animation once the move finishes. A copy that's on screen behaves like the real slide: you can click it, tab
  into it, and screen readers announce it.
  Copies are made with `cloneNode`, so **event listeners attached directly to elements inside a slide aren't copied**.
  Use event delegation or custom elements, which upgrade automatically inside the copies.
- **`rewind`** doesn't add copies. From the last slide, "next" animates back to the first.
- Without either, the arrows show as unavailable at the ends.

If there aren't more slides than `per-view`, the slider turns itself off: no arrows, dots, dragging or autoplay.

## Direction

```html
<div dir="rtl"><slider-element loop>…</slider-element></div>            <!-- RTL, detected automatically -->
<slider-element direction="rtl">…</slider-element>                       <!-- RTL, explicit -->
<slider-element direction="ttb" height="360px" per-view="2">…</slider-element>  <!-- vertical -->
```

In RTL, the slides, arrows, dragging and arrow keys all follow the reading direction. A vertical slider uses the
Up/Down arrow keys and vertical dragging. It needs a height, set with the `height` attribute, a breakpoint, or
`--slider-element-height`.

Examples: [loop.html](../examples/loop.html), [responsive.html](../examples/responsive.html),
[rtl.html](../examples/rtl.html), [vertical.html](../examples/vertical.html).
