# Theming

## CSS custom properties

Set these on `slider-element`, on a class, or globally.

| Property | Default | |
|---|---|---|
| `--slider-element-easing` | `cubic-bezier(0.25, 1, 0.5, 1)` | Slide easing curve |
| `--slider-element-arrow-size` | `2.75rem` | Arrow button size |
| `--slider-element-arrow-bg` | `rgb(255 255 255 / 0.9)` | Arrow and play/pause background |
| `--slider-element-arrow-color` | `#111` | Arrow and play/pause icon color |
| `--slider-element-dot-size` | `0.625rem` | Pagination dot size |
| `--slider-element-dot-color` | `rgb(0 0 0 / 0.25)` | Inactive dot |
| `--slider-element-dot-active` | `#111` | Active dot |
| `--slider-element-focus` | `#2563eb` | Keyboard focus outline |
| `--slider-element-thumb-active` | `#111` | Outline around the current thumbnail |
| `--slider-element-height` | `24rem` | Height of a vertical slider |

The slider sets `--slider-element-per-view`, `--slider-element-gap` and `--slider-element-speed` itself. You can read them in your own
CSS, but don't set them.

```css
.my-slider {
  --slider-element-arrow-bg: #111;
  --slider-element-arrow-color: #fff;
  --slider-element-dot-active: #e11d48;
}
```

## Generated markup

```html
<slider-element class="slider-element [slider-element--fade|--nav|--ttb|--rtl] [is-playing] [is-draggable] [is-dragging] [is-static]"
           role="region" aria-roledescription="carousel" aria-label="…">
  <div class="slider-element__stage">
    <button class="slider-element__toggle">…</button>                       <!-- only with autoplay -->
    <button class="slider-element__arrow slider-element__arrow--prev">…</button>
    <button class="slider-element__arrow slider-element__arrow--next">…</button>
    <div class="slider-element__viewport">
      <div class="slider-element__track">
        <div class="slider-element__slide [is-active] [is-visible] [is-clone] [is-current]">…your slide…</div>
      </div>
    </div>
  </div>
  <div class="slider-element__pagination">
    <button class="slider-element__dot [is-active]"></button>
  </div>
  <div class="slider-element__sr" aria-live="polite"></div>                 <!-- screen-reader announcements -->
</slider-element>
```

## State classes

| Class | On | Meaning |
|---|---|---|
| `.is-active` | slide | The current slide |
| `.is-visible` | slide | Fully on screen |
| `.is-clone` | slide | A loop copy |
| `.is-current` | thumbnail slide | Matches the main slider's current slide |
| `.is-playing` | root | Autoplay is on |
| `.is-dragging` | root | The user is dragging |
| `.is-static` | root | Not enough slides to scroll, so the controls are hidden |
| `[aria-disabled="true"]` | arrow | At the start or end (no loop or rewind) |

## Recipes

```css
/* Scale down slides that aren't current */
.my-slider .slider-element__slide { transition: transform .4s, opacity .4s; }
.my-slider .slider-element__slide:not(.is-active) { transform: scale(.92); opacity: .6; }

/* Arrows outside the slides */
.my-slider .slider-element__arrow--prev { inset-inline-start: -3.5rem; }
.my-slider .slider-element__arrow--next { inset-inline-end: -3.5rem; }

/* Show arrows only on hover (pointer devices) */
@media (hover: hover) {
  .my-slider .slider-element__arrow { opacity: 0; transition: opacity .2s; }
  .my-slider:hover .slider-element__arrow,
  .my-slider .slider-element__arrow:focus-visible { opacity: 1; }
}
```

Avoid `display: none` on arrows or dots to hide them; use the `no-arrows` / `no-pagination` options (per breakpoint if
needed) so the accessibility wiring stays consistent.

Example: [theming.html](../examples/theming.html).
