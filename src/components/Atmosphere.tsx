import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { confetti } from '../lib/confetti';

const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const MOTES = Array.from({ length: 26 }, (_, i) => ({
  left: rnd(i) * 100,
  size: 2 + rnd(i + 40) * 3,
  dur: 14 + rnd(i + 80) * 18,
  delay: -rnd(i + 120) * 30,
  sway: (rnd(i + 160) - 0.5) * 120,
  alpha: 0.35 + rnd(i + 200) * 0.45,
}));

const BITS = Array.from({ length: 16 }, (_, i) => ({
  left: rnd(i + 300) * 100,
  w: 5 + rnd(i + 340) * 5,
  h: 8 + rnd(i + 380) * 8,
  dur: 16 + rnd(i + 420) * 16,
  delay: -rnd(i + 460) * 32,
  sway: (rnd(i + 500) - 0.5) * 160,
  color: ['#F2A6C0', '#7FB6E6', '#E3BE74', '#F6ECD0'][i % 4],
}));

const SHOOTERS = [
  { top: 6, left: 70, delay: 2, dur: 9 },
  { top: 22, left: 92, delay: 6, dur: 11 },
  { top: 12, left: 48, delay: 10, dur: 13 },
];
const SPARKLES = Array.from({ length: 12 }, (_, i) => ({
  left: 4 + rnd(i + 600) * 92,
  top: 6 + rnd(i + 640) * 88,
  size: 10 + rnd(i + 680) * 16,
  dur: 4 + rnd(i + 720) * 5,
  delay: -rnd(i + 760) * 8,
}));

// Gold progress line, drifting gold dust and a soft light that follows the cursor.
export default function Atmosphere() {
  const { scrollYProgress } = useScroll();
  const glow = useRef<HTMLDivElement>(null);
  // scroll-linked layers: soft colour clouds drift at different speeds, a thin gold ring turns as you scroll
  const { scrollY } = useScroll();
  const cloudA = useTransform(scrollY, (v) => -v * 0.22);
  const cloudB = useTransform(scrollY, (v) => -v * 0.38);
  const cloudC = useTransform(scrollY, (v) => -v * 0.12);
  const ringTurn = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const ringScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.25, 0.8]);

  // each chapter announces itself with a little gold burst the first time it comes into view
  useEffect(() => {
    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting || seen.has(en.target.id)) return;
          seen.add(en.target.id);
          confetti({ x: window.innerWidth / 2, y: window.innerHeight * 0.3, count: 34 });
        });
      },
      { threshold: 0.4 },
    );
    ['countdown', 'reveal', 'details', 'rsvp', 'finale'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!window.matchMedia('(hover: hover)').matches) return;
    const el = glow.current;
    if (!el) return;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let gx = tx;
    let gy = ty;
    let raf = 0;
    const move = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      el.style.opacity = '1';
    };
    const tick = () => {
      gx += (tx - gx) * 0.12;
      gy += (ty - gy) * 0.12;
      el.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    // a gold ring ripples out wherever the page is tapped or clicked
    const ripple = (e: PointerEvent) => {
      const r = document.createElement('span');
      r.className = 'click-ripple';
      r.style.left = `${e.clientX}px`;
      r.style.top = `${e.clientY}px`;
      r.addEventListener('animationend', () => r.remove());
      document.body.appendChild(r);
      window.dispatchEvent(new Event('wonder-tap'));
      if (Math.random() < 0.22 && !document.querySelector('.simple')) {
        const h = document.createElement('span');
        h.className = 'tap-heart';
        h.textContent = '♥';
        h.style.left = `${e.clientX}px`;
        h.style.top = `${e.clientY}px`;
        h.style.setProperty('--hx', `${(Math.random() - 0.5) * 70}px`);
        h.addEventListener('animationend', () => h.remove());
        document.body.appendChild(h);
      }
      if (!document.documentElement.classList.contains('simple') && !document.querySelector('.simple')) {
        for (let i = 0; i < 7; i++) {
          const sp = document.createElement('span');
          sp.className = 'spark';
          sp.style.position = 'fixed';
          sp.style.zIndex = '150';
          sp.style.left = `${e.clientX}px`;
          sp.style.top = `${e.clientY}px`;
          const a = (i / 7) * Math.PI * 2 + Math.random() * 0.6;
          const d = 36 + Math.random() * 34;
          sp.style.setProperty('--dx', `${Math.cos(a) * d}px`);
          sp.style.setProperty('--dy', `${Math.sin(a) * d}px`);
          sp.addEventListener('animationend', () => sp.remove());
          document.body.appendChild(sp);
        }
      }
      if ((e.target as HTMLElement | null)?.closest('button, a')) {
        try {
          navigator.vibrate?.(8);
        } catch {
          /* not supported */
        }
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerdown', ripple);
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', ripple);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <StarTracker />
      <ScrollCue />
      <DawnGlow />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="ambient absolute bottom-0 rounded-full bg-[#F3DC9C]"
            style={{
              left: `${m.left}%`,
              width: m.size,
              height: m.size,
              opacity: m.alpha,
              boxShadow: '0 0 8px 2px rgba(227,190,116,.55)',
              ['--sway' as string]: `${m.sway}px`,
              animation: `riseUp ${m.dur}s linear ${m.delay}s infinite`,
            }}
          />
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        {BITS.map((b, i) => (
          <span
            key={i}
            className="ambient absolute top-0 rounded-[2px]"
            style={{ left: `${b.left}%`, width: b.w, height: b.h, background: b.color, opacity: 0.5, ['--sway' as string]: `${b.sway}px`, animation: `fall ${b.dur}s linear ${b.delay}s infinite` }}
          />
        ))}
      </div>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <motion.div className="absolute -left-[20%] top-[60%] h-[60vmax] w-[60vmax] rounded-full opacity-[.16]" style={{ y: cloudA, background: 'radial-gradient(circle, #7FB6E6, transparent 65%)' }} />
        <motion.div className="absolute -right-[25%] top-[100%] h-[55vmax] w-[55vmax] rounded-full opacity-[.15]" style={{ y: cloudB, background: 'radial-gradient(circle, #F2A6C0, transparent 65%)' }} />
        <motion.div className="absolute left-[10%] top-[170%] h-[50vmax] w-[50vmax] rounded-full opacity-[.14]" style={{ y: cloudC, background: 'radial-gradient(circle, #E3BE74, transparent 65%)' }} />
        <motion.div className="absolute left-1/2 top-1/2 -ml-[min(48vw,330px)] -mt-[min(48vw,330px)] h-[min(96vw,660px)] w-[min(96vw,660px)] rounded-full border border-sun/25" style={{ rotate: ringTurn, scale: ringScale }}>
          <span className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#FFE9A8] shadow-[0_0_12px_3px_rgba(227,190,116,.8)]" />
          <span className="absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-blush shadow-[0_0_10px_2px_rgba(242,166,192,.7)]" />
        </motion.div>
        {SHOOTERS.map((m, i) => (
          <span key={i} className="ambient absolute block h-[2px] w-[130px] rounded-full opacity-0" style={{ top: `${m.top}%`, left: `${m.left}%`, background: 'linear-gradient(90deg,#FFF6D6,rgba(255,246,214,0))', boxShadow: '0 0 10px 2px rgba(255,236,160,.5)', animation: `shoot ${m.dur}s linear ${m.delay}s infinite` }} />
        ))}
        {SPARKLES.map((m, i) => (
          <svg key={i} viewBox="0 0 24 24" className="ambient absolute opacity-0" style={{ left: `${m.left}%`, top: `${m.top}%`, width: m.size, height: m.size, animation: `twirl ${m.dur}s ease-in-out ${m.delay}s infinite` }}>
            <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4Z" fill="#F3DC9C" />
          </svg>
        ))}
      </div>
      <div ref={glow} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[2] -ml-[190px] -mt-[190px] h-[380px] w-[380px] rounded-full opacity-0 transition-opacity duration-700" style={{ background: 'radial-gradient(circle, rgba(243,220,156,.14), transparent 65%)' }} />
    </>
  );
}

// A shooting star that travels down the right edge as you scroll: its tail stretches and brightens with your speed.
function StarTracker() {
  const { scrollY, scrollYProgress } = useScroll();
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.5 });
  const vel = useSpring(useVelocity(scrollY), { stiffness: 120, damping: 30 });
  const [vh, setVh] = useState(() => window.innerHeight);
  useEffect(() => {
    const on = () => setVh(window.innerHeight);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const y = useTransform(p, (v) => 30 + v * Math.max(0, vh - 100));
  const tail = useTransform(vel, (v) => 0.45 + Math.min(Math.abs(v) / 2500, 1) * 1.55);
  const power = useTransform(vel, (v) => 0.6 + Math.min(Math.abs(v) / 2500, 1) * 0.4);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed bottom-0 top-0 z-[70] w-6" style={{ right: 'max(8px, env(safe-area-inset-right, 0px))' }}>
      <span className="absolute bottom-[60px] left-1/2 top-[30px] w-px bg-gradient-to-b from-transparent via-sun/25 to-transparent" />
      <motion.div className="absolute left-0 top-0 h-0 w-6" style={{ y, opacity: power }}>
        <motion.span className="absolute bottom-0 left-1/2 -ml-px block h-[170px] w-[2px] origin-bottom rounded-full" style={{ scaleY: tail, background: 'linear-gradient(to top, rgba(255,246,214,.95), rgba(227,190,116,.45) 45%, rgba(227,190,116,0))' }} />
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="ambient absolute left-1/2 top-0 block h-[3px] w-[3px] rounded-full bg-[#FFE9A8]" style={{ ['--dx' as string]: `${i % 2 ? 9 : -9}px`, animation: `shedUp 1.8s ease-out ${i * 0.45}s infinite`, boxShadow: '0 0 6px 1px rgba(255,224,140,.8)' }} />
        ))}
        <span className="ambient absolute left-1/2 top-0 -ml-3 -mt-3 block h-6 w-6 rounded-full border border-sun/50" style={{ animation: 'ripple 2.4s ease-out infinite' }} />
        <svg viewBox="0 0 24 24" className="ambient absolute left-1/2 top-0 -ml-[11px] -mt-[11px] h-[22px] w-[22px]" style={{ animation: 'spin 7s linear infinite', filter: 'drop-shadow(0 0 6px rgba(255,224,140,.9))' }}>
          <path d="M12 0L13.6 10.4L24 12L13.6 13.6L12 24L10.4 13.6L0 12L10.4 10.4Z" fill="#FFF6D6" />
        </svg>
      </motion.div>
    </div>
  );
}

// Towards the end of the page a warm dawn light rises from the bottom of the screen.
function DawnGlow() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.55, 1], [0, 0.12, 0.6]);
  return <motion.div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-0 z-[1] h-[45vh]" style={{ opacity, background: 'radial-gradient(ellipse at 50% 100%, rgba(242,166,192,.28), rgba(227,190,116,.26) 38%, transparent 70%)' }} />;
}

// If the guest stops scrolling for a few seconds, a gentle cue reminds them to keep going.
function ScrollCue() {
  const { scrollYProgress } = useScroll();
  const [idle, setIdle] = useState(false);
  const [typing, setTyping] = useState(false);
  const [more, setMore] = useState(true);
  useEffect(() => scrollYProgress.on('change', (v) => setMore(v < 0.96)), [scrollYProgress]);
  useEffect(() => {
    let id = 0;
    const arm = () => {
      setIdle(false);
      window.clearTimeout(id);
      id = window.setTimeout(() => setIdle(true), 4500);
    };
    const inField = () => setTyping(['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? ''));
    arm();
    window.addEventListener('scroll', arm, { passive: true });
    window.addEventListener('touchmove', arm, { passive: true });
    window.addEventListener('wheel', arm, { passive: true });
    window.addEventListener('keydown', arm);
    document.addEventListener('focusin', inField);
    document.addEventListener('focusout', inField);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('scroll', arm);
      window.removeEventListener('touchmove', arm);
      window.removeEventListener('wheel', arm);
      window.removeEventListener('keydown', arm);
      document.removeEventListener('focusin', inField);
      document.removeEventListener('focusout', inField);
    };
  }, []);
  return (
    <AnimatePresence>
      {idle && more && !typing && (
        <motion.div aria-hidden="true" className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center" style={{ bottom: 'max(18px, env(safe-area-inset-bottom, 0px))' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}>
          <span className="flex flex-col items-center rounded-full border border-sun/50 bg-ocean/80 px-5 pb-1 pt-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-ivory shadow-[0_8px_30px_-8px_rgba(0,0,0,.8)]">
            Keep scrolling
            <span className="ambient mt-0.5 block text-sun" style={{ animation: 'bob 1.8s ease-in-out infinite' }}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
            </span>
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
