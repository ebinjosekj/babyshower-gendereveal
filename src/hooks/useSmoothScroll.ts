import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';
import { setLenis } from '../lib/scroll';

// Page scroll is locked until the opening sequence is finished.
// Inertial smooth scrolling is used unless the simplified animation mode is on.
export function useSmoothScroll(unlocked: boolean, smooth: boolean) {
  useEffect(() => {
    document.body.style.overflow = unlocked ? '' : 'hidden';
    if (unlocked) {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [unlocked]);

  useEffect(() => {
    if (!unlocked || !smooth) return;
    const lenis = new Lenis({ duration: 1.15 });
    setLenis(lenis);
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
    };
  }, [unlocked, smooth]);
}
