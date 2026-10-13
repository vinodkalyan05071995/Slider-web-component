# Accessibility

slider-element follows the [WAI-ARIA Authoring Practices carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/).

## What the component handles

**Structure**
- The root is a landmark: `role="region"` with `aria-roledescription="carousel"` and your label.
- Each slide is `role="group"` with `aria-roledescription="slide"` and a label like "2 of 5" (unless you give it your own
  `aria-label`).
- Arrows and dots are real `<button>`s with labels ("Next slide", "Go to slide 3"), and `aria-controls` pointing at the
  slides. The current dot has `aria-current="true"`.
- The play/pause button and the arrows come **before** the slides in the page, as the pattern recommends.

**Hidden slides**
- Slides that aren't on screen get the `inert` attribute. Their links and buttons can't be tabbed to, and screen readers
  don't read them.
- Loop copies that are off screen are `inert` and `aria-hidden="true"`. A copy that's on screen takes the place of its
  real slide: it can be clicked and focused, and is announced like the real slide.
- If the focused element scrolls out of view, focus moves to the slider itself rather than being lost.

**Announcements**
- A polite live region announces "Slide N of total" after each change. It's silent while autoplay is running, so screen
  readers aren't interrupted every few seconds.

**Keyboard**
- Left/Right arrow keys move between slides while focus is inside the slider. In RTL they swap, and a vertical slider
  uses Up/Down. Keys typed into form fields inside slides are ignored.
- Thumbnails are focusable buttons that respond to Enter and Space.
- Unavailable arrows use `aria-disabled` instead of `disabled`, so focus stays on the button when you reach the end.

**Autoplay** (WCAG 2.2.2 Pause, Stop, Hide)
- There's always a visible play/pause button.
- Autoplay pauses while the mouse is over the slider.
- Autoplay **stops** when keyboard focus enters the slider, and only restarts when the user presses play.
- It pauses while the browser tab is hidden.
- If the user prefers reduced motion, autoplay doesn't start on its own and all animation is turned off.

**Targets & focus**
- Pagination dots have a 24×24px hit area (WCAG 2.5.8), even though the dot looks smaller.
- Buttons and thumbnails show a clear `:focus-visible` outline (`--slider-element-focus`).

## What's up to you

- **Name every slider** with `label`, `aria-label`, or `aria-labelledby` pointing at a visible heading.
- **Write alt text** for meaningful images. Use `alt=""` for thumbnails, which already have a label.
- **Pick colors with enough contrast** if you change the arrow and dot colors: 3:1 against what's behind them (WCAG 1.4.11).
- **Choose a sensible autoplay interval.** Leave enough time to read each slide, and avoid autoplay for slides with lots of
  text or with forms.
- **Translate the labels** for non-English stores (see [API → Translations](api.md#translations)).
