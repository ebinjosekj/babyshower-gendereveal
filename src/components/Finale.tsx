import { useEffect, useLayoutEffect, useRef } from 'react';
import { RotateCcw } from 'lucide-react';
import { EVENT } from '../config';
import { useMotion } from '../context/MotionContext';
import { gsap } from '../lib/gsap';
import { Butterfly, HotAirBalloon, Island, Rainbow, Star, Tree, Elephant, Rabbit, Deer } from './art';
import { Reveal, StarField, Words } from './ui';

const SPARK = ['#FFC93C', '#FF9A3C', '#FF7A66', '#8EE3C2', '#27C4C4', '#B8A6F0', '#FFF8EA'];

// Fireworks light up the clouds while the finale is on screen.
function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null);
  const { simple } = useMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || simple) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
    }
    let sparks: Spark[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let last = 0;
    let visible = false;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = canvas.width = Math.round(r.width);
      h = canvas.height = Math.round(r.height);
    };
    const burst = () => {
      const x = w * (0.12 + Math.random() * 0.76);
      const y = h * (0.1 + Math.random() * 0.4);
      const color = SPARK[Math.floor(Math.random() * SPARK.length)];
      const n = w < 500 ? 34 : 56;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const s = 1.4 + Math.random() * 2.6;
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 60 + Math.random() * 30, color });
      }
    };
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      if (t - last > 950) {
        burst();
        last = t;
      }
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.18)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      sparks = sparks.filter((s) => s.life > 0);
      for (const s of sparks) {
        s.vy += 0.03;
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.985;
        s.life -= 1;
        ctx.globalAlpha = Math.max(0, s.life / 70);
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.15 });
    io.observe(canvas);
    resize();
    raf = requestAnimationFrame(frame);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [simple]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}

export default function Finale({ onReplay }: { onReplay: () => void }) {
  const root = useRef<HTMLElement>(null);
  const { simple } = useMotion();

  // the camera slowly pulls away from the floating island
  useLayoutEffect(() => {
    const el = root.current;
    if (simple || !el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.island-away',
        { scale: 1.25, y: 0 },
        { scale: 0.62, y: -30, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom bottom', scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, [simple]);

  return (
    <section
      ref={root}
      id="finale"
      aria-label="Grand finale"
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden bg-[linear-gradient(180deg,#B8A6F0_0%,#2B1A57_8%,#4A2A8C_38%,#B8A6F0_66%,#FFB07A_86%,#FFD98A_100%)] px-5 pb-10 pt-32 text-center"
    >
      <StarField count={70} />
      <Fireworks />
      <Rainbow className="pointer-events-none absolute left-1/2 top-[34%] w-[140%] max-w-[1000px] -translate-x-1/2 opacity-70" />

      {/* balloons rise into the sky */}
      {[8, 22, 70, 86].map((l, i) => (
        <div
          key={l}
          aria-hidden="true"
          className="ambient hide-simple pointer-events-none absolute bottom-0 w-12 sm:w-16"
          style={{ left: `${l}%`, ['--sway' as string]: `${(i % 2 ? 1 : -1) * 30}px`, animation: `riseUp ${16 + i * 3}s linear ${i * 2.5}s infinite` }}
        >
          <HotAirBalloon colors={i % 2 ? ['#8EE3C2', '#B8A6F0', '#FFC93C', '#FF9A3C', '#27C4C4'] : undefined} />
        </div>
      ))}
      <div className="ambient pointer-events-none absolute left-0 top-[48%]" style={{ animation: 'flyAcross 20s linear infinite' }} aria-hidden="true">
        <Butterfly className="w-10" />
      </div>
      <div className="ambient pointer-events-none absolute left-0 top-[60%]" style={{ animation: 'flyBack 26s linear -10s infinite' }} aria-hidden="true">
        <Butterfly className="w-8" a="#27C4C4" b="#FFC93C" />
      </div>
      {[
        ['14%', '30%'],
        ['84%', '26%'],
        ['30%', '46%'],
        ['72%', '50%'],
        ['50%', '22%'],
      ].map(([l, t], i) => (
        <Star key={i} className="ambient absolute w-6" style={{ left: l, top: t, animation: `twinkle 2.6s ease-in-out ${i * 0.45}s infinite` }} />
      ))}

      <div className="relative z-10 mt-4">
        <h2 className="font-display text-[10vw] font-semibold uppercase leading-[1.08] text-ivory drop-shadow-[0_4px_18px_rgba(43,26,87,.7)] sm:text-7xl">
          <Words text="Tiny Hands." />
          <br />
          <Words text="Big Dreams." delay={0.3} />
          <br />
          <Words text="Endless Love." delay={0.6} />
        </h2>
        <Reveal delay={0.4}>
          <p className="mx-auto mt-6 max-w-md font-display text-2xl font-medium text-plum drop-shadow-[0_2px_0_rgba(255,248,234,.7)] sm:text-3xl">
            We cannot wait to meet our little wonder!
          </p>
          <p className="mt-6 font-display text-lg uppercase tracking-[0.3em] text-plum">With love,</p>
          <p className="title-grad font-script text-6xl sm:text-8xl">{EVENT.parents}</p>
        </Reveal>
      </div>

      {/* the island drifts away below */}
      <div className="island-away relative z-10 mx-auto mt-auto w-[min(88vw,480px)] pt-12 will-change-transform">
        <div className="animate-floaty ambient relative" style={{ animationDuration: '8s' }}>
          <Island className="w-full" />
          <Tree className="absolute bottom-[56%] left-[8%] w-[14%]" />
          <Elephant className="absolute bottom-[55%] left-[28%] w-[24%]" />
          <Rabbit className="absolute bottom-[56%] left-[54%] w-[11%]" />
          <Deer className="absolute bottom-[55%] left-[65%] w-[16%]" />
        </div>
      </div>

      <div className="relative z-10 mt-6 flex flex-col items-center gap-3">
        <button type="button" onClick={onReplay} className="btn-sun">
          <RotateCcw size={18} aria-hidden="true" /> Replay our magical journey
        </button>
        <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-plum/80">
          {EVENT.dateLabel} · {EVENT.timeLabel} · {EVENT.venueName}
        </p>
      </div>
    </section>
  );
}
