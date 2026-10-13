# Thumbnails

Give the main slider an `id` and add a second slider with `nav-for` pointing at it.

```html
<slider-element id="gallery" label="Product gallery" loop no-pagination>
  <div><img src="large-1.jpg" alt="Front view"></div>
  <div><img src="large-2.jpg" alt="Side view"></div>
  <div><img src="large-3.jpg" alt="Back view"></div>
</slider-element>

<slider-element nav-for="gallery" label="Gallery thumbnails" per-view="4" gap="8" no-pagination
           breakpoints='{"768": {"perView": 6}}'>
  <div><img src="thumb-1.jpg" alt=""></div>
  <div><img src="thumb-2.jpg" alt=""></div>
  <div><img src="thumb-3.jpg" alt=""></div>
</slider-element>
```

How it works:

- Clicking a thumbnail, or pressing Enter/Space on it, moves the main slider to that slide.
- When the main slider changes (arrows, swipe, autoplay), the matching thumbnail gets `.is-current` and
  `aria-current="true"`, and the thumbnail slider scrolls to keep it in view.
- Each thumbnail is a button labelled "Show slide N". Leave the thumbnail images' `alt` empty (`alt=""`) so the label
  isn't read twice.
- The thumbnail slider can have its own arrows, `per-view`, breakpoints and direction. For example, set
  `direction="ttb"` on the thumbnails for a vertical strip beside the main image.

Tips:

- Don't use `loop` on the thumbnail slider.
- Turn off the main slider's dots (`no-pagination`), since the thumbnails replace them.
- The thumbnails can come before or after the main slider in the page.

Example: [thumbnails.html](../examples/thumbnails.html).
