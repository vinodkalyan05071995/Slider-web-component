/*!
 * <slider-element> — a tiny, dependency-free, accessible slider web component.
 * Features: slide / fade transitions, loop (infinite, via clones), rewind, autoplay with
 * play/pause, responsive per-view / per-move / gap, arrows, pagination, drag / swipe,
 * keyboard, thumbnail navigation (`nav-for`), RTL and vertical (`direction="ttb"`). Inspired by Splide.
 */
(() => {
  const I18N = {
    carousel: 'carousel',
    slide: 'slide',
    slideLabel: '%s of %s',
    status: 'Slide %s of %s',
    prev: 'Previous slide',
    next: 'Next slide',
    goTo: 'Go to slide %s',
    pagination: 'Select a slide',
    select: 'Show slide %s',
    play: 'Start autoplay',
    pause: 'Pause autoplay',
  };

  const ICONS = {
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5v14l11-7z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  };

  let uid = 0;
  const mod = (i, n) => ((i % n) + n) % n;
  const fmt = (s, ...args) => args.reduce((r, v) => r.replace('%s', v), s);
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, attrs = {}) => {
    const e = document.createElement(tag);
    e.className = cls;
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  };

  class SliderElement extends HTMLElement {
    /** Override for translations, e.g. SliderElement.i18n.next = 'Suivant'. */
    static i18n = I18N;

    index = 0;
    ready = false; // true once set up; `slider-ready` has fired
    _pos = 0; // logical position; may sit on a clone (outside 0..n-1) in loop mode
    _x = 0; // current translate in px
    _c = 0; // clones on each side

    connectedCallback() {
      // Loaded by a non-deferred script, the element connects before its slides are parsed: wait for them.
      if (!this._built && document.readyState === 'loading') {
        if (!this._waiting) {
          this._waiting = true;
          document.addEventListener('DOMContentLoaded', () => {
            this._waiting = false;
            if (this.isConnected) this.connectedCallback();
          }, { once: true });
        }
        return;
      }
      if (!this._built) this._build();
      this._layout();
      this._ro = new ResizeObserver(() => this._layout());
      this._ro.observe(this);
      document.addEventListener('visibilitychange', this._onVisibility);
      if (this._nav) this._whenReady(() => this._linkNav());
      this._syncAutoplay();
      if (!this.ready) {
        this.ready = true;
        this._emit('slider-ready', { index: this.index, count: this._n });
      }
    }

    disconnectedCallback() {
      this._ro?.disconnect();
      clearTimeout(this._timer);
      clearTimeout(this._fadeTimer);
      document.removeEventListener('visibilitychange', this._onVisibility);
      this._unlinkNav?.();
    }

    /* ---------- public API ---------- */

    next() { if (this.o) this.goTo(this._pos + this.o.perMove); }
    prev() { if (this.o) this.goTo(this._pos - this.o.perMove); }
    play() { this._setPlaying(true); }
    pause() { this._setPlaying(false); }

    goTo(i, animate = true) {
      if (!this._enabled || this._drag?.active) return;
      const n = this._n, max = this._max(), prev = this.index;

      if (this._c) {
        this._normalize();
        i = Math.max(-this._c, Math.min(n - 1 + this._c, i));
      } else {
        const wrap = this._loop || this._rewind;
        if (i > max) i = wrap && prev >= max ? 0 : max;
        else if (i < 0) i = wrap && prev <= 0 ? max : 0;
      }

      this._pos = i;
      this.index = mod(i, n);
      const animated = animate && this._speed() > 0;
      this._setX(this._offset(i), animated);
      if (!animated) this._normalize();
      this._update();

      if (this.index !== prev) {
        if (this._status) this._status.textContent = fmt(SliderElement.i18n.status, this.index + 1, n);
        if (!this._moving) this._moveFrom = prev;
        this._moving = true;
        this._emit('slide-change', { index: this.index, prev });
      }
      // `slide-moved` fires once the transition has finished (transitionend for slide, a timer for fade).
      if (!animated) this._settled();
      else if (this._fade) {
        clearTimeout(this._fadeTimer);
        this._fadeTimer = setTimeout(() => this._settled(), this._speed());
      }
      this._schedule();
    }

    /* ---------- events ---------- */

    _emit(name, detail) {
      this.dispatchEvent(new CustomEvent(name, { bubbles: true, detail }));
    }

    _settled() {
      if (!this._moving) return;
      this._moving = false;
      this._emit('slide-moved', { index: this.index, prev: this._moveFrom });
    }

    /* ---------- setup ---------- */

    _build() {
      this._built = true;
      const t = SliderElement.i18n;
      const id = `se-${++uid}`;
      const trackId = `${id}-track`;
      const ap = this.getAttribute('autoplay');

      this._fade = this.getAttribute('transition') === 'fade';
      this._loop = this.hasAttribute('loop');
      this._rewind = this.hasAttribute('rewind');
      this._nav = this.hasAttribute('nav-for');
      const dir = this.getAttribute('direction');
      this._vertical = dir === 'ttb' && !this._fade;
      if (dir === 'rtl' || dir === 'ltr') this.dir = dir;
      this._interval = ap === null ? 0 : parseInt(ap, 10) || 5000;
      this._playing = this._interval > 0 && !reduceMotion();
      this._slides = [...this.children];
      this._n = this._slides.length;

      this.classList.add('slider-element');
      this.classList.toggle('slider-element--fade', this._fade);
      this.classList.toggle('slider-element--nav', this._nav);
      this.classList.toggle('slider-element--ttb', this._vertical);
      if (!this.hasAttribute('role')) this.setAttribute('role', 'region');
      this.setAttribute('aria-roledescription', t.carousel);
      if (!this.hasAttribute('aria-label') && !this.hasAttribute('aria-labelledby')) {
        this.setAttribute('aria-label', this.getAttribute('label') || 'Carousel');
      }

      this._stage = el('div', 'slider-element__stage');
      this._viewport = el('div', 'slider-element__viewport');
      this._track = el('div', 'slider-element__track', { id: trackId });

      this._slides.forEach((s, i) => {
        s.classList.add('slider-element__slide');
        if (this._nav) {
          s.setAttribute('role', 'button');
          s.tabIndex = 0;
          if (!s.hasAttribute('aria-label')) s.setAttribute('aria-label', fmt(t.select, i + 1));
        } else {
          s.setAttribute('role', 'group');
          s.setAttribute('aria-roledescription', t.slide);
          if (!s.hasAttribute('aria-label')) s.setAttribute('aria-label', fmt(t.slideLabel, i + 1, this._n));
        }
        this._track.append(s);
      });
      this._viewport.append(this._track);

      // Per WAI-ARIA APG, rotation control and arrows come before the slides in reading order.
      if (this._interval) {
        this._toggle = el('button', 'slider-element__toggle', { type: 'button', 'aria-controls': trackId });
        this._toggle.addEventListener('click', () => (this._playing ? this.pause() : this.play()));
        this._stage.append(this._toggle);
      }
      this._prevBtn = el('button', 'slider-element__arrow slider-element__arrow--prev', { type: 'button', 'aria-label': t.prev, 'aria-controls': trackId });
      this._nextBtn = el('button', 'slider-element__arrow slider-element__arrow--next', { type: 'button', 'aria-label': t.next, 'aria-controls': trackId });
      this._prevBtn.innerHTML = ICONS.prev;
      this._nextBtn.innerHTML = ICONS.next;
      this._prevBtn.addEventListener('click', () => this.prev());
      this._nextBtn.addEventListener('click', () => this.next());
      this._stage.append(this._prevBtn, this._nextBtn, this._viewport);

      this._dots = el('div', 'slider-element__pagination', { role: 'group', 'aria-label': t.pagination });
      this._dots.addEventListener('click', e => {
        const b = e.target.closest('.slider-element__dot');
        if (b) this.goTo(+b.dataset.index);
      });
      this.append(this._stage, this._dots);

      if (!this._nav) {
        this._status = el('div', 'slider-element__sr', { 'aria-live': 'polite', 'aria-atomic': 'true' });
        this.append(this._status);
      }

      this._track.addEventListener('transitionend', e => {
        if (e.target === this._track && e.propertyName === 'transform') {
          this._normalize();
          this._update();
          this._settled();
        }
      });
      this.addEventListener('keydown', this._onKey);
      this.addEventListener('mouseenter', () => { this._hover = true; this._schedule(); });
      this.addEventListener('mouseleave', () => { this._hover = false; this._schedule(); });
      // APG: keyboard focus entering the carousel stops rotation until the user restarts it.
      this.addEventListener('focusin', e => {
        if (this._playing && e.target !== this._toggle && e.target.matches(':focus-visible')) this.pause();
      });

      const vp = this._viewport;
      vp.addEventListener('pointerdown', this._onDown);
      vp.addEventListener('pointermove', this._onMove);
      vp.addEventListener('pointerup', this._onUp);
      vp.addEventListener('pointercancel', this._onUp);
      vp.addEventListener('dragstart', e => e.preventDefault());
      vp.addEventListener('click', e => {
        if (this._dragged) { e.preventDefault(); e.stopPropagation(); return; }
        const slide = e.target.closest('.slider-element__slide');
        if (!slide || slide.parentElement !== this._track) return;
        const real = slide._source || slide; // a loop copy reports its real slide
        this._emit('slide-click', { index: this._slides.indexOf(real), slide: real, originalEvent: e });
        if (this._nav) this._select(real);
      }, true);
    }

    /** Read layout options from attributes, then apply min-width breakpoints (mobile-first). */
    _options() {
      const num = (name, d) => { const v = parseFloat(this.getAttribute(name)); return isNaN(v) ? d : v; };
      const o = {
        perView: num('per-view', 1),
        perMove: num('per-move', 1),
        gap: num('gap', 0),
        speed: num('speed', 400),
        height: this.getAttribute('height') || '',
        arrows: !this.hasAttribute('no-arrows'),
        pagination: !this.hasAttribute('no-pagination'),
        drag: !this.hasAttribute('no-drag'),
      };
      let bps = {};
      try { bps = JSON.parse(this.getAttribute('breakpoints') || '{}'); } catch { /* ignore bad JSON */ }
      Object.keys(bps).map(Number).sort((a, b) => a - b).forEach(w => {
        if (matchMedia(`(min-width: ${w}px)`).matches) Object.assign(o, bps[w]);
      });
      if (this._fade) o.perView = o.perMove = 1;
      o.perMove = Math.max(1, Math.round(o.perMove));
      return o;
    }

    _layout() {
      if (!this._n) return;
      const prev = this.o;
      const o = (this.o = this._options());

      this.style.setProperty('--slider-element-per-view', o.perView);
      this.style.setProperty('--slider-element-gap', `${o.gap}px`);
      this.style.setProperty('--slider-element-speed', `${o.speed}ms`);
      if (o.height) this.style.setProperty('--slider-element-height', o.height);
      this._rtl = !this._vertical && getComputedStyle(this).direction === 'rtl';
      this.classList.toggle('slider-element--rtl', this._rtl);
      // Main-axis size: width for horizontal sliders, height for vertical ones.
      this._w = this._vertical ? this._viewport.clientHeight : this._viewport.clientWidth;
      this._step = (this._w - o.gap * (o.perView - 1)) / o.perView + o.gap;
      this._enabled = this._n > o.perView;

      this.classList.toggle('is-static', !this._enabled);
      this.classList.toggle('is-draggable', this._enabled && o.drag);
      this._prevBtn.hidden = this._nextBtn.hidden = !(o.arrows && this._enabled);
      this._dots.hidden = !(o.pagination && this._enabled);

      const structural = !prev || prev.perView !== o.perView || prev.perMove !== o.perMove;
      if (structural) {
        this._buildClones();
        this._buildDots();
      }
      this.index = this._enabled ? Math.min(this.index, this._max()) : 0;
      this._pos = this.index;
      this._setX(this._offset(this._pos), false);
      this._update();
      if (structural) this._syncAutoplay();
      if (prev && JSON.stringify(prev) !== JSON.stringify(o)) this._emit('slider-update', { options: { ...o } });
    }

    _buildClones() {
      this._track.querySelectorAll(':scope > .is-clone').forEach(c => c.remove());
      const { perView, perMove } = this.o, n = this._n;
      const c = (this._c = this._loop && !this._fade && this._enabled ? Math.min(n, Math.ceil(perView) * 2 + perMove) : 0);
      if (!c) return;
      const clone = s => {
        const k = s.cloneNode(true);
        k._source = s;
        k.classList.add('is-clone');
        k.classList.remove('is-active', 'is-visible', 'is-current');
        k.removeAttribute('id');
        k.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
        k.setAttribute('aria-hidden', 'true');
        k.inert = true;
        return k;
      };
      this._track.prepend(...this._slides.slice(n - c).map(clone));
      this._track.append(...this._slides.slice(0, c).map(clone));
    }

    _buildDots() {
      const t = SliderElement.i18n, max = this._max(), trackId = this._track.id;
      this._pages = [];
      for (let i = 0; i <= max; i += this.o.perMove) this._pages.push(i);
      if (!this._loop && this._pages.at(-1) !== max) this._pages.push(max);
      this._dots.replaceChildren(...this._pages.map(p => {
        const b = el('button', 'slider-element__dot', { type: 'button', 'aria-label': fmt(t.goTo, p + 1), 'aria-controls': trackId });
        b.dataset.index = p;
        return b;
      }));
    }

    /* ---------- movement ---------- */

    _speed() { return reduceMotion() ? 0 : this.o.speed; }

    _max() {
      return this._loop || this._fade ? this._n - 1 : Math.max(0, Math.ceil(this._n - this.o.perView));
    }

    _offset(pos) {
      if (this._fade) return 0;
      const x = (pos + this._c) * this._step;
      // Without loop, never scroll past the last slide (handles fractional per-view "peek").
      return this._c ? x : Math.min(x, Math.max(0, this._n * this._step - this.o.gap - this._w));
    }

    _setX(x, animate) {
      if (this._fade) return;
      this._x = x;
      const s = this._track.style;
      s.transition = animate ? `transform ${this._speed()}ms var(--slider-element-easing, ease)` : 'none';
      s.transform = this._vertical ? `translate3d(0,${-x}px,0)` : `translate3d(${this._rtl ? x : -x}px,0,0)`;
    }

    /** Current translate on the main axis, read from the DOM (the track may be mid-transition). */
    _currentX() {
      const tr = getComputedStyle(this._track).transform;
      if (tr === 'none') return 0;
      const m = new DOMMatrixReadOnly(tr);
      return this._vertical ? -m.m42 : this._rtl ? m.m41 : -m.m41;
    }

    /** After landing on a clone, jump (without animation) to the matching real slide. */
    _normalize() {
      if (!this._c || (this._pos >= 0 && this._pos < this._n)) return;
      this._pos = mod(this._pos, this._n);
      this._setX(this._offset(this._pos), false);
      void this._track.offsetWidth; // flush so the next animated move starts from here
    }

    _update() {
      const { index } = this;
      let lostFocus = false;
      const setLive = (s, live) => {
        if (!live && s.contains(document.activeElement)) lostFocus = true;
        s.inert = !live; // keeps off-screen content out of the tab order and a11y tree
      };

      if (this._fade) {
        this._slides.forEach((s, k) => {
          s.classList.toggle('is-visible', k === index);
          s.classList.toggle('is-active', k === index);
          setLive(s, k === index);
        });
      } else {
        const all = [...this._track.children];
        const w = this._step - this.o.gap;
        all.forEach((s, k) => {
          const start = k * this._step - this._x;
          s.classList.toggle('is-visible', start > -1 && start + w < this._w + 1);
          s.classList.toggle('is-active', k === this._pos + this._c);
        });
        all.forEach(s => {
          const src = s._source;
          if (!src) return setLive(s, s.classList.contains('is-visible'));
          // A clone on screen stands in for its real slide (clickable, focusable, announced),
          // unless the real slide is on screen too — then it stays a hidden duplicate.
          const live = s.classList.contains('is-visible') && !src.classList.contains('is-visible');
          setLive(s, live);
          if (live) s.removeAttribute('aria-hidden');
          else s.setAttribute('aria-hidden', 'true');
        });
      }

      if (lostFocus) {
        this.tabIndex = -1;
        this.focus({ preventScroll: true });
      }

      const wrap = this._loop || this._rewind;
      this._prevBtn.setAttribute('aria-disabled', !wrap && index <= 0);
      this._nextBtn.setAttribute('aria-disabled', !wrap && index >= this._max());

      let page = 0;
      this._pages.forEach((p, k) => { if (p <= index) page = k; });
      [...this._dots.children].forEach((b, k) => {
        b.classList.toggle('is-active', k === page);
        b.setAttribute('aria-current', k === page);
      });
    }

    /* ---------- autoplay ---------- */

    _onVisibility = () => this._schedule();

    _schedule() {
      clearTimeout(this._timer);
      if (!this._interval || !this._playing || this._hover || document.hidden || !this._enabled || !this.isConnected) return;
      this._timer = setTimeout(() => {
        const atEnd = !this._loop && this.index >= this._max();
        this.goTo(atEnd ? 0 : this._pos + this.o.perMove);
      }, this._interval);
    }

    _setPlaying(on) {
      if (!this._interval || this._playing === on) return;
      this._playing = on;
      this._syncAutoplay();
      this._emit('slider-autoplay', { playing: on });
    }

    _syncAutoplay() {
      if (!this._interval) return;
      const t = SliderElement.i18n;
      this._toggle.setAttribute('aria-label', this._playing ? t.pause : t.play);
      this._toggle.innerHTML = this._playing ? ICONS.pause : ICONS.play;
      this._toggle.hidden = !this._enabled;
      this.classList.toggle('is-playing', this._playing);
      // Don't spam screen readers while slides rotate automatically.
      this._status?.setAttribute('aria-live', this._playing ? 'off' : 'polite');
      this._schedule();
    }

    /* ---------- input ---------- */

    _onKey = e => {
      if (e.target.closest('slider-element') !== this || e.target.closest('input,textarea,select,[contenteditable]')) return;
      const [back, fwd] = this._vertical ? ['ArrowUp', 'ArrowDown'] : this._rtl ? ['ArrowRight', 'ArrowLeft'] : ['ArrowLeft', 'ArrowRight'];
      if (e.key === back) this.prev();
      else if (e.key === fwd) this.next();
      else if (this._nav && (e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('slider-element__slide')) this._select(e.target);
      else return;
      e.preventDefault();
    };

    /** Pointer movement as [main axis, cross axis]; main is positive toward the previous slide. */
    _delta(e, d) {
      const dx = e.clientX - d.x, dy = e.clientY - d.y;
      return this._vertical ? [dy, dx] : [this._rtl ? -dx : dx, dy];
    }

    _onDown = e => {
      if (!this._enabled || !this.o.drag || e.button !== 0) return;
      if (e.target.closest('input,textarea,select,[contenteditable]')) return;
      this._drag = { x: e.clientX, y: e.clientY, id: e.pointerId, active: false };
    };

    _onMove = e => {
      const d = this._drag;
      if (!d || e.pointerId !== d.id) return;
      const [main, cross] = this._delta(e, d);

      if (!d.active) {
        if (Math.abs(main) < 6 && Math.abs(cross) < 6) return;
        if (Math.abs(cross) > Math.abs(main)) { this._drag = null; return; } // let the page scroll
        d.active = true;
        this._viewport.setPointerCapture(d.id);
        this.classList.add('is-dragging');
        this._emit('slider-drag-start', { index: this.index });
        clearTimeout(this._timer);
        if (!this._fade) {
          // Start from where the track actually is (it may be mid-transition).
          let x = this._currentX();
          if (this._c) {
            const span = this._n * this._step, lo = (this._c - 0.5) * this._step;
            if (x < lo) x += span;
            else if (x >= lo + span) x -= span;
          }
          d.x0 = x;
          d.p0 = this._c ? x / this._step - this._c : this.index;
          if (this._c) this._pos = mod(Math.round(d.p0), this._n);
          this._setX(x, false);
        }
      }
      if (this._fade) return;

      let x = d.x0 - main;
      if (!this._c) { // rubber-band at the edges
        const max = this._offset(this._n);
        if (x < 0) x *= 0.3;
        else if (x > max) x = max + (x - max) * 0.3;
      }
      this._setX(x, false);
    };

    _onUp = e => {
      const d = this._drag;
      if (!d || e.pointerId !== d.id) return;
      this._drag = null;
      if (!d.active) return;
      this.classList.remove('is-dragging');
      this._dragged = true;
      setTimeout(() => (this._dragged = false));
      this._emit('slider-drag-end', { index: this.index });

      const main = e.type === 'pointercancel' ? 0 : this._delta(e, d)[0];
      const swipe = Math.abs(main) > 40;
      if (this._fade) {
        if (swipe) main < 0 ? this.next() : this.prev();
        else this._schedule();
        return;
      }
      let target = Math.round(d.p0 - main / this._step);
      if (swipe && target === Math.round(d.p0)) target += main < 0 ? 1 : -1;
      this.goTo(target);
    };

    /* ---------- thumbnails (nav-for) ---------- */

    _whenReady(fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
      else fn();
    }

    _linkNav() {
      this._unlinkNav?.();
      const main = document.getElementById(this.getAttribute('nav-for'));
      if (!main) return;
      this._main = main;
      const sync = i => {
        this._slides.forEach((s, k) => {
          s.classList.toggle('is-current', k === i);
          if (k === i) s.setAttribute('aria-current', 'true');
          else s.removeAttribute('aria-current');
        });
        // Keep the current thumbnail in view.
        if (this._slides[i] && !this._slides[i].classList.contains('is-visible')) {
          this.goTo(i < this.index ? i : i - Math.ceil(this.o.perView) + 1);
        }
      };
      const onChange = e => { if (e.target === main) sync(e.detail.index); };
      main.addEventListener('slide-change', onChange);
      this._unlinkNav = () => main.removeEventListener('slide-change', onChange);
      sync(main.index || 0);
    }

    _select(slide) {
      const i = this._slides.indexOf(slide);
      if (i > -1) this._main?.goTo(i);
    }
  }

  window.SliderElement = SliderElement;
  if (!customElements.get('slider-element')) customElements.define('slider-element', SliderElement);
})();
