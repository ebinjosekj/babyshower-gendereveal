import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { setLenis } from '../lib/scroll';

// Smooth (inertial) scrolling wired into GSAP ScrollTrigger.
// Scrolling is locked until the envelope has been opened.
export function useSmoothScroll(enabled: boolean) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = new Lenis({ duration: reduce ? 0.01 : 1.15, smoothWheel: !reduce });
    lenisRef.current = lenis;
    setLenis(lenis);
    lenis.stop();

    const onScroll = () => ScrollTrigger.update();
    lenis.on('scroll', onScroll);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      setLenis(null);
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    document.body.style.overflow = enabled ? '' : 'hidden';
    if (!lenis) return;
    if (enabled) {
      lenis.start();
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    } else {
      lenis.stop();
    }
  }, [enabled]);
}
