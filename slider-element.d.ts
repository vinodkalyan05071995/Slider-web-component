export interface SliderElementChangeDetail {
  index: number;
  prev: number;
}

export interface SliderElementReadyDetail {
  index: number;
  count: number;
}

export interface SliderElementClickDetail {
  index: number;
  slide: HTMLElement;
  originalEvent: MouseEvent;
}

export interface SliderElementIndexDetail {
  index: number;
}

export interface SliderElementAutoplayDetail {
  playing: boolean;
}

export interface SliderElementOptions {
  perView: number;
  perMove: number;
  gap: number;
  speed: number;
  height: string;
  arrows: boolean;
  pagination: boolean;
  drag: boolean;
}

export interface SliderElementUpdateDetail {
  options: SliderElementOptions;
}

export interface SliderElementEventMap {
  'slider-ready': CustomEvent<SliderElementReadyDetail>;
  'slide-change': CustomEvent<SliderElementChangeDetail>;
  'slide-moved': CustomEvent<SliderElementChangeDetail>;
  'slide-click': CustomEvent<SliderElementClickDetail>;
  'slider-drag-start': CustomEvent<SliderElementIndexDetail>;
  'slider-drag-end': CustomEvent<SliderElementIndexDetail>;
  'slider-autoplay': CustomEvent<SliderElementAutoplayDetail>;
  'slider-update': CustomEvent<SliderElementUpdateDetail>;
}

export interface SliderElementI18n {
  carousel: string;
  slide: string;
  slideLabel: string;
  status: string;
  prev: string;
  next: string;
  goTo: string;
  pagination: string;
  select: string;
  play: string;
  pause: string;
}

export declare class SliderElement extends HTMLElement {
  /** Override for translations; `%s` placeholders are filled in order. */
  static i18n: SliderElementI18n;
  /** Index of the current slide. */
  readonly index: number;
  /** True once the slider is set up (after `slider-ready`). */
  readonly ready: boolean;
  next(): void;
  prev(): void;
  goTo(index: number, animate?: boolean): void;
  play(): void;
  pause(): void;

  addEventListener<K extends keyof SliderElementEventMap>(type: K, listener: (this: SliderElement, ev: SliderElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: SliderElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof SliderElementEventMap>(type: K, listener: (this: SliderElement, ev: SliderElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: SliderElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare global {
  interface Window {
    SliderElement: typeof SliderElement;
  }
  interface HTMLElementTagNameMap {
    'slider-element': SliderElement;
  }
  // Events bubble, so they can also be heard on any ancestor or the document.
  interface HTMLElementEventMap extends SliderElementEventMap {}
  interface DocumentEventMap extends SliderElementEventMap {}
}
