import { useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';

// Page-wide polish: scroll progress hairline and magnetic buttons.
// Pointer effects only run for a real mouse (never on touch) and only touch transform.
export default function Extras() {
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    let el: HTMLElement | null = null;
    let kind: 'mag' | null = null;
    let raf = 0;

    const reset = (e: HTMLElement | null) => {
      if (!e) return;
      e.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      e.style.transform = '';
    };
    const move = (ev: PointerEvent) => {
      const t = (ev.target as HTMLElement | null)?.closest?.('.btn-sun, .btn-ghost, .btn-ghost-light') as HTMLElement | null;
      if (t !== el) {
        reset(el);
        el = t;
        kind = t ? 'mag' : null;
        if (t) t.style.transition = 'transform .12s ease-out';
      }
      if (!el || !kind) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const px = (ev.clientX - r.left) / r.width - 0.5;
        const py = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = `translate(${px * 8}px, ${py * 6}px)`;
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(raf);
      reset(el);
    };
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-gradient-to-r from-transparent via-sun to-[#FFE9A8] shadow-[0_0_10px_rgba(227,190,116,.8)]"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
