import { useEffect, useRef } from 'react';

// Floating golden dust. Canvas + a pre-rendered glow sprite keeps it cheap on phones.
export default function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const sprite = document.createElement('canvas');
    sprite.width = sprite.height = 64;
    const sc = sprite.getContext('2d');
    if (sc) {
      const g = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, 'rgba(240,208,128,1)');
      g.addColorStop(0.25, 'rgba(214,172,84,.65)');
      g.addColorStop(1, 'rgba(201,162,78,0)');
      sc.fillStyle = g;
      sc.fillRect(0, 0, 64, 64);
    }

    interface Dot {
      x: number;
      y: number;
      r: number;
      vx: number;
      vy: number;
      a: number;
      t: number;
      s: number;
    }

    let w = 0;
    let h = 0;
    let raf = 0;
    let dots: Dot[] = [];

    const make = (initial: boolean): Dot => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 12,
      r: Math.random() * 2 + 0.7,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -(Math.random() * 0.35 + 0.08),
      a: Math.random() * 0.55 + 0.3,
      t: Math.random() * Math.PI * 2,
      s: Math.random() * 0.02 + 0.006,
    });

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(64, Math.max(26, w / 24)));
      dots = Array.from({ length: n }, () => make(true));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of dots) {
        if (!reduce) {
          p.t += p.s;
          p.x += p.vx + Math.sin(p.t) * 0.15;
          p.y += p.vy;
          if (p.y < -14) Object.assign(p, make(false));
        }
        ctx.globalAlpha = p.a * (0.45 + 0.55 * (0.5 + 0.5 * Math.sin(p.t * 3)));
        const s = p.r * 10;
        ctx.drawImage(sprite, p.x - s / 2, p.y - s / 2, s, s);
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !reduce) raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[110] h-full w-full" />;
}
