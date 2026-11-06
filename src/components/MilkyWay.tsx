import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';

// The opening sky: a painted Milky Way seen from inside the galaxy. A small light leaves the galactic core,
// flies to the viewer through a starfield and lands exactly where the glowing orb button sits.

export const T_DEPART = 5; // seconds: the light leaves the core
export const T_ARRIVE = 12; // seconds: the light reaches the orb

interface Props {
  targetRef: RefObject<HTMLElement>; // the orb the light flies to
  clock: MutableRefObject<number>; // performance.now() at time zero (the parent can shift it to skip ahead)
  lit: boolean; // the orb has been tapped
  onBuilt: () => void; // the sky is painted and the clock may start
}

interface TexStar { u: number; v: number; m: number; c: number; p: number }
interface FreeStar { x: number; y: number; z: number; m: number; p: number; c: number }
interface FgStar { a: number; r: number; m: number; c: number }
interface Pt { x: number; y: number }
interface TrailPt extends Pt { r: number }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const sq = (x: number) => x * x;
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

const hash = (x: number, y: number, s: number) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const noise = (x: number, y: number, s: number) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  return lerp(lerp(hash(xi, yi, s), hash(xi + 1, yi, s), u), lerp(hash(xi, yi + 1, s), hash(xi + 1, yi + 1, s), u), v);
};
const fbm = (x: number, y: number, s: number, o = 4) => {
  let a = 0.5;
  let f = 1;
  let r = 0;
  for (let i = 0; i < o; i++) {
    r += a * noise(x * f, y * f, s + i);
    f *= 2.03;
    a *= 0.5;
  }
  return r;
};

const U0 = -0.12; // galactic centre along the band
const cyAt = (u: number) => 0.07 * Math.sin(u * 2.3 + 0.6);
const bandW = (u: number) => 0.15 + 0.045 * Math.sin(u * 3.1) + 0.03 * Math.cos(u * 7.3);
const bulge = (u: number, d: number) => Math.exp(-((u - U0) ** 2 / 0.09 + (d * d) / 0.022));
const tint = (c: number) => (c > 0.88 ? '255,214,228' : c > 0.62 ? '205,228,255' : '255,244,210');

export default function MilkyWay({ targetRef, clock, lit, onBuilt }: Props) {
  const cv = useRef<HTMLCanvasElement>(null);
  const litAt = useRef<number | null>(null);
  const litRef = useRef(false);
  const built = useRef(onBuilt);
  built.current = onBuilt;

  useEffect(() => {
    litRef.current = lit;
    if (lit && litAt.current === null) litAt.current = performance.now();
  }, [lit]);

  useEffect(() => {
    const canvas = cv.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) {
      built.current();
      return;
    }
    let raf = 0;
    let alive = true;
    let W = 0;
    let H = 0;
    let dpr = 1;
    let texW = 0;
    let texH = 0;
    let lx = 0;
    let ly = 0;
    let tx = 0;
    let ty = 0;
    let last = 0;
    let warpAcc = 0;
    let trail: TrailPt[] = [];
    let tex: HTMLCanvasElement | null = null;
    let starsTex: TexStar[] = [];
    let free: FreeStar[] = [];
    let fg: FgStar[] = [];

    let seed = 99;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const small = window.innerWidth < 700;
    const TW = small ? 720 : 900;
    const TH = Math.round((TW * 9) / 16);
    const ASP = TH / TW;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      texW = Math.hypot(W, H) * 1.5;
      texH = texW * ASP;
    };
    const tPt = (u: number, v: number): Pt => ({ x: ((u + 1) / 2) * texW, y: texH / 2 + (v * texW) / 2 });
    const coreScreen = (): Pt => ({ x: W * 0.5, y: H * (W < 600 ? 0.36 : 0.4) });
    const target = () => {
      const r = targetRef.current?.getBoundingClientRect();
      return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2, r: r.width * 0.23 } : { x: W / 2, y: H * 0.54, r: Math.min(W, H) * 0.09 };
    };

    const build = () => {
      const c = document.createElement('canvas');
      c.width = TW;
      c.height = TH;
      const x = c.getContext('2d');
      if (!x) return;
      const img = x.createImageData(TW, TH);
      const d = img.data;
      for (let py = 0; py < TH; py++) {
        for (let px = 0; px < TW; px++) {
          const u = (px / TW) * 2 - 1;
          const v = ((py / TH) * 2 - 1) * ASP;
          const dd = v - cyAt(u);
          const w = bandW(u);
          const g = bulge(u, dd);
          const cloud = fbm(u * 3.2 + 4, v * 3.2, 11);
          const fine = fbm(u * 9, v * 9, 21, 3);
          let D = Math.exp(-sq(dd / w)) * (0.45 + 0.85 * cloud) + 0.12 * Math.exp(-sq(dd / (w * 2.6))) + 0.8 * g * (0.7 + 0.5 * fine);
          const rn = fbm(u * 5 + 9, dd * 11, 31, 4);
          const rift = smooth(0.42, 0.72, rn) * Math.exp(-sq((dd - 0.012 * Math.sin(u * 9)) / (w * 0.5))) * 0.97;
          D *= 1 - rift * (1 - Math.min(1, g * 0.6));
          D += 0.25 * Math.exp(-sq(dd / (w * 1.4))) * fine * (1 - rift);
          const warm = clamp(g * 1.15 + Math.exp(-sq((u - U0) / 0.4)) * 0.12);
          let r = lerp(0.62, 1, warm);
          let gr = lerp(0.74, 0.8, warm);
          let b = lerp(1, 0.5, warm);
          const nb = fbm(u * 2.6 + 30, v * 2.6, 41);
          const nb2 = fbm(u * 3.4 + 70, v * 3.4, 51);
          const pk = smooth(0.5, 0.74, nb) * 0.55;
          const bl = smooth(0.5, 0.74, nb2) * 0.5;
          r += pk * 0.75 - bl * 0.15;
          gr += pk * 0.12 + bl * 0.15;
          b += pk * 0.35 + bl * 0.6;
          const k = 1 - Math.exp(-Math.pow(Math.max(0, D), 1.12));
          const i = (py * TW + px) * 4;
          d[i] = Math.min(255, r * k * 255);
          d[i + 1] = Math.min(255, gr * k * 255);
          d[i + 2] = Math.min(255, b * k * 255);
          d[i + 3] = 255;
        }
      }
      x.putImageData(img, 0, 0);
      tex = c;
      starsTex = [];
      const want = small ? 7000 : 11000;
      for (let n = 0; n < want; n++) {
        const u = rnd() * 2 - 1;
        const dd = (rnd() + rnd() + rnd() - 1.5) * 0.38 + cyAt(u);
        const w = bandW(u);
        const dens = Math.exp(-sq((dd - cyAt(u)) / w)) + 2 * bulge(u, dd - cyAt(u));
        if (rnd() > dens * 0.9 + 0.04) continue;
        starsTex.push({ u, v: dd, m: Math.pow(rnd(), 3.2), c: rnd(), p: rnd() * 6.28 });
      }
      free = Array.from({ length: 420 }, () => ({ x: rnd(), y: rnd(), z: 0.25 + rnd() * 0.75, m: Math.pow(rnd(), 2.6), p: rnd() * 6.28, c: rnd() }));
      fg = Array.from({ length: 240 }, () => ({ a: rnd() * 6.283, r: rnd(), m: 0.4 + rnd() * 0.6, c: rnd() }));
    };

    const glowDot = (x: number, y: number, r: number, a: number, hue: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, `rgba(${hue},${a})`);
      g.addColorStop(0.35, `rgba(${hue},${a * 0.3})`);
      g.addColorStop(1, `rgba(${hue},0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 6.283);
      ctx.fill();
    };

    const drawSky = (t: number, dim: number, kick: number) => {
      if (!tex) return;
      const ct = coreScreen();
      const push = ease(clamp(t / (T_ARRIVE + 1.5)));
      const sc = lerp(0.82, 1.35, push) + kick * 0.05;
      const rot = (W < H ? -1.02 : -0.4) + t * 0.004 + lx * 0.015;
      const core = tPt(U0, cyAt(U0));
      const appear = smooth(0, 3.2, t);
      ctx.save();
      ctx.translate(ct.x - lx * 10, ct.y - ly * 8);
      ctx.rotate(rot);
      ctx.scale(sc, sc);
      ctx.translate(-core.x, -core.y);
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = appear * (1 - dim * 0.5);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(tex, 0, 0, texW, texH);
      for (const s of starsTex) {
        const p = tPt(s.u, s.v);
        const tw = 0.65 + 0.35 * Math.sin(t * (0.8 + s.m * 2) + s.p);
        ctx.globalAlpha = appear * (1 - dim * 0.5) * (0.35 + s.m * 0.9) * tw;
        ctx.fillStyle = `rgb(${tint(s.c)})`;
        const r = 0.6 + s.m * 1.9;
        ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
      }
      const flare = Math.exp(-Math.pow((t - T_DEPART - 0.4) / 0.9, 2));
      const breathe = 0.85 + 0.15 * Math.sin(t * 1.3);
      const R = texW * 0.03 * (1 + flare * 0.5);
      const gg = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, R * 3);
      gg.addColorStop(0, `rgba(255,240,200,${clamp(0.62 * breathe + flare * 0.5)})`);
      gg.addColorStop(0.2, 'rgba(255,205,130,.3)');
      gg.addColorStop(0.55, 'rgba(240,150,110,.07)');
      gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = appear * (1 - dim * 0.35);
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(core.x, core.y, R * 3, 0, 6.283);
      ctx.fill();
      ctx.restore();
    };

    const drawFree = (t: number) => {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (const s of free) {
        const x = (((s.x * W - t * 2.4 * s.z - lx * 22 * s.z) % W) + W) % W;
        const y = s.y * H - ly * 22 * s.z;
        ctx.globalAlpha = (0.3 + s.m * 0.7) * (0.55 + 0.45 * Math.abs(Math.sin(t * (0.5 + s.z) + s.p)));
        ctx.fillStyle = `rgb(${tint(s.c)})`;
        const r = 0.5 + s.m * 1.9 * s.z;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 6.283);
        ctx.fill();
        if (s.m > 0.72) {
          ctx.globalAlpha *= 0.5;
          ctx.fillRect(x - r * 5, y - 0.4, r * 10, 0.8);
          ctx.fillRect(x - 0.4, y - r * 5, 0.8, r * 10);
        }
      }
      ctx.restore();
    };

    const drawWarp = (w: number, dt: number, o: Pt) => {
      if (w < 0.01) return;
      const maxR = Math.hypot(W, H) * 0.62;
      warpAcc += w * dt * 420;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (const s of fg) {
        const r0 = (s.r * maxR + warpAcc * (0.4 + s.m)) % maxR;
        const len = r0 * w * 0.55 * (0.4 + s.m);
        const ca = Math.cos(s.a);
        const sa = Math.sin(s.a);
        const r1 = Math.max(0, r0 - len);
        const g = ctx.createLinearGradient(o.x + ca * r1, o.y + sa * r1, o.x + ca * r0, o.y + sa * r0);
        g.addColorStop(0, `rgba(${tint(s.c)},0)`);
        g.addColorStop(1, `rgba(${tint(s.c)},${0.5 * w * s.m * clamp(r0 / (maxR * 0.25))})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.8 + s.m * 1.4;
        ctx.beginPath();
        ctx.moveTo(o.x + ca * r1, o.y + sa * r1);
        ctx.lineTo(o.x + ca * r0, o.y + sa * r0);
        ctx.stroke();
      }
      ctx.restore();
    };

    const bez3 = (p: number, a: Pt, b: Pt, c: Pt, d: Pt): Pt => {
      const m = 1 - p;
      return {
        x: m * m * m * a.x + 3 * m * m * p * b.x + 3 * m * p * p * c.x + p * p * p * d.x,
        y: m * m * m * a.y + 3 * m * m * p * b.y + 3 * m * p * p * c.y + p * p * p * d.y,
      };
    };

    const drawJourney = (t: number, p: number, o: { x: number; y: number; r: number }) => {
      const ct = coreScreen();
      const pos = bez3(p, ct, { x: W * 1.08, y: H * 0.08 }, { x: -W * 0.05, y: H * 0.46 }, o);
      const r = lerp(2.4, o.r * 0.5, Math.pow(p, 2.2));
      trail.push({ x: pos.x, y: pos.y, r });
      if (trail.length > 140) trail.shift();
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      for (let i = 1; i < trail.length; i++) {
        const k = i / trail.length;
        const a = trail[i - 1];
        const b = trail[i];
        const sw = Math.sin(i * 0.5 + t * 4) * (1 - k) * 3;
        ctx.strokeStyle = `rgba(255,233,168,${k * 0.55})`;
        ctx.lineWidth = Math.max(0.6, b.r * k * 1.2);
        ctx.beginPath();
        ctx.moveTo(a.x + sw, a.y);
        ctx.lineTo(b.x + sw, b.y);
        ctx.stroke();
        if (i % 3 === 0) {
          ctx.strokeStyle = `rgba(255,170,205,${k * 0.28})`;
          ctx.lineWidth = Math.max(0.4, b.r * k * 0.7);
          ctx.beginPath();
          ctx.moveTo(a.x - sw * 1.6, a.y + 2);
          ctx.lineTo(b.x - sw * 1.6, b.y + 2);
          ctx.stroke();
        }
        if (i % 4 === 0) {
          ctx.strokeStyle = `rgba(150,200,255,${k * 0.25})`;
          ctx.lineWidth = Math.max(0.4, b.r * k * 0.6);
          ctx.beginPath();
          ctx.moveTo(a.x + sw * 1.4, a.y - 2);
          ctx.lineTo(b.x + sw * 1.4, b.y - 2);
          ctx.stroke();
        }
      }
      glowDot(pos.x, pos.y, r * 8, 0.7, '255,226,150');
      ctx.fillStyle = '#fffbe8';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, Math.max(1.4, r * 0.6), 0, 6.283);
      ctx.fill();
      ctx.restore();
    };

    const frame = (now: number) => {
      if (!alive) return;
      const t = (now - clock.current) / 1000;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
      last = now;
      lx += (tx - lx) * 0.05;
      ly += (ty - ly) * 0.05;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#02030a';
      ctx.fillRect(0, 0, W, H);

      const p = ease(clamp((t - T_DEPART) / (T_ARRIVE - T_DEPART)));
      const ig = litAt.current === null ? -1 : (now - litAt.current) / 1000;
      const dim = Math.max(smooth(0.1, 1, p) * 0.6, ig > 0 ? smooth(0.5, 2.5, ig) * 0.15 : 0);
      const kick = ig > 0 ? Math.sin(clamp(ig / 2) * Math.PI) : 0;
      const o = target();
      drawSky(t, dim, kick);
      drawFree(t);
      const warp = ig > 0 ? 0 : Math.pow(Math.sin(Math.PI * clamp((t - T_DEPART - 0.7) / (T_ARRIVE - T_DEPART - 1.2))), 1.5);
      drawWarp(warp, dt, o);
      if (t >= T_DEPART - 0.2 && p < 1) drawJourney(t, p, o);
      else if (p >= 1) trail = [];
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / W - 0.5) * 2;
      ty = (e.clientY / H - 0.5) * 2;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);
    const id = window.setTimeout(() => {
      build();
      if (!alive) return;
      clock.current = performance.now();
      last = clock.current;
      built.current();
      raf = requestAnimationFrame(frame);
    }, 30);

    return () => {
      alive = false;
      window.clearTimeout(id);
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, [clock, targetRef]);

  return <canvas ref={cv} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
