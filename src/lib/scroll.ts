import type Lenis from 'lenis';

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const scrollToTop = () => {
  if (instance) instance.scrollTo(0, { duration: 2 });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Scroll the page by `dy` pixels (smoothly), e.g. to bring a form field above the on-screen keyboard.
export const scrollByOffset = (dy: number) => {
  if (instance) instance.scrollTo(window.scrollY + dy, { duration: 0.5 });
  else window.scrollBy({ top: dy, behavior: 'smooth' });
};

export const scrollToId = (id: string) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { duration: 1.6 });
  else el.scrollIntoView({ behavior: 'smooth' });
};
