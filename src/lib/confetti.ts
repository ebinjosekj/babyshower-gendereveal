// Tiny canvas confetti (no dependency). Respects reduced-motion / simplified mode.

const COLORS = ['#E3BE74', '#F6ECD0', '#C9975A', '#F2A6C0', '#7FB6E6', '#9BE0BF', '#B89A5E', '#F2A6C0', '#7FB6E6'];

interface Piece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rot: number;
  vr: number;
  color: string;
  life: number;
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let pieces: Piece[] = [];
let raf = 0;

const tick = () => {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  pieces = pieces.filter((p) => p.life > 0 && p.y < canvas!.height + 30);
  for (const p of pieces) {
    p.vy += 0.18;
    p.vx *= 0.992;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.life -= 1;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.min(1, p.life / 40);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  if (pieces.length > 0) {
    raf = requestAnimationFrame(tick);
  } else {
    canvas.remove();
    canvas = null;
    ctx = null;
    raf = 0;
  }
};

export function confetti(opts: { x?: number; y?: number; count?: number } = {}) {
  const root = document.documentElement;
  if (root.classList.contains('simple') || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:300';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
  }

  const x = opts.x ?? window.innerWidth / 2;
  const y = opts.y ?? window.innerHeight / 2;
  const count = Math.min(opts.count ?? 110, 160);
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = Math.random() * 9 + 3;
    pieces.push({
      x,
      y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 6,
      w: Math.random() * 8 + 5,
      h: Math.random() * 5 + 3,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      life: 110 + Math.random() * 60,
    });
  }
  if (!raf) raf = requestAnimationFrame(tick);
}
