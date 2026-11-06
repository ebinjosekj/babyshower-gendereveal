import type Lenis from 'lenis';

let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};

export const scrollToTop = () => {
  if (instance) instance.scrollTo(0, { duration: 2 });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};
