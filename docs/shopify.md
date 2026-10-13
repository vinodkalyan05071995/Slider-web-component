# Shopify

## 1. Add the files

Copy these into your theme's `assets/` folder:

- `dist/slider-element.min.js`
- `dist/slider-element.min.css`

Load them once, in `layout/theme.liquid` or in the sections that use the slider:

```liquid
{{ 'slider-element.min.css' | asset_url | stylesheet_tag }}
<script src="{{ 'slider-element.min.js' | asset_url }}" defer></script>
```

> Dawn and many other themes already define a `<slider-component>` element. `<slider-element>` uses a different tag name,
> so the two don't conflict.

## 2. Use it in a section

[`examples/shopify/slider-element-gallery.liquid`](../examples/shopify/slider-element-gallery.liquid) is a complete section you
can drop into `sections/`. It includes:

- image blocks, each with an optional caption and link
- settings for transition, slides per view (mobile and desktop), moving a page at a time, gap, speed, loop, autoplay,
  pagination, thumbnails, image ratio and corner radius
- responsive `image_tag` output: lazy loading for later slides, and an immediate high-priority load for the first slide when the section is near the top of the page
- a heading used as the slider's accessible name (`aria-labelledby`)

The basic pattern:

```liquid
<slider-element
  id="SliderElement-{{ section.id }}"
  label="{{ section.settings.heading | escape }}"
  per-view="1" gap="16"
  {% if section.settings.loop %}loop{% endif %}
  breakpoints='{"750": {"perView": {{ section.settings.per_view_desktop }}}}'
>
  {%- for block in section.blocks -%}
    <div {{ block.shopify_attributes }}>…</div>
  {%- endfor -%}
</slider-element>
```

Use `section.id` in the `id` so two copies of the section on one page don't clash. This matters for thumbnails, because
`nav-for` finds the main slider by id.

## Product media gallery

```liquid
<slider-element id="Gallery-{{ section.id }}" label="{{ product.title | escape }}" loop no-pagination>
  {%- for media in product.media -%}
    <div>{{ media | image_url: width: 1400 | image_tag: loading: 'lazy', alt: media.alt }}</div>
  {%- endfor -%}
</slider-element>

{%- if product.media.size > 1 -%}
  <slider-element nav-for="Gallery-{{ section.id }}" label="Product thumbnails" per-view="4" gap="8" no-pagination
             breakpoints='{"750": {"perView": 5}}'>
    {%- for media in product.media -%}
      <div>{{ media | image_url: width: 200 | image_tag: loading: 'lazy', alt: '' }}</div>
    {%- endfor -%}
  </slider-element>
{%- endif -%}
```

To jump to a variant's image when the variant changes:

```js
const gallery = document.getElementById('Gallery-{{ section.id }}');
const mediaIds = {{ product.media | map: 'id' | json }};
document.addEventListener('variant:change', e => {        // use your theme's variant event
  const i = mediaIds.indexOf(e.detail.variant?.featured_media?.id);
  if (i > -1) gallery.goTo(i);
});
```

## Translations

Put the labels in your locale files and pass them to `SliderElement.i18n` before any slider is created. One way is to load
the script without `defer` in `theme.liquid`, followed by:

```liquid
<script src="{{ 'slider-element.min.js' | asset_url }}"></script>
<script>
  Object.assign(SliderElement.i18n, {
    prev: {{ 'accessibility.previous_slide' | t | json }},
    next: {{ 'accessibility.next_slide' | t | json }},
    play: {{ 'accessibility.play_slideshow' | t | json }},
    pause: {{ 'accessibility.pause_slideshow' | t | json }}
  });
</script>
```

Use whichever keys your theme's locale files actually have. See [API → Translations](api.md#translations) for the full
list of strings.

## Theme editor

When a merchant changes a setting, the theme editor re-renders the section HTML. `<slider-element>` sets itself up whenever
it's added to the page, so no `shopify:section:load` handler is needed.

To show the slide a merchant selects in the editor:

```js
document.addEventListener('shopify:block:select', e => {
  const slide = e.target.closest('slider-element > *, .slider-element__slide');
  const slider = slide?.closest('slider-element');
  if (!slider) return;
  const slides = [...slider.querySelectorAll('.slider-element__slide:not(.is-clone)')];
  slider.pause();
  slider.goTo(slides.indexOf(slide));
});
```

## Loop mode and theme scripts

Loop copies are made with `cloneNode`. Theme scripts that attach listeners directly to elements inside slides won't
work on the copies. Custom elements (`<product-card>`, `<quick-add>` and so on) and delegated listeners work fine.
