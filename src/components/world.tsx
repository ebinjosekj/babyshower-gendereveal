import { useId, type CSSProperties, type ReactNode } from 'react';

// Little Wonderland scenery — layered, gradient-lit inline SVG (no image downloads).
// Palette: ocean #183D4B, forest #263B42, jade #347D76, turquoise #77B7B0,
// sun #F0B94B, champagne #B8A16A, coral #E98C56, lavender #8974BD, ivory #F1E8D6.

interface P {
  className?: string;
  style?: CSSProperties;
}

const uid = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, '');
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/* ───────────────────────── clouds & mist ───────────────────────── */

// Volumetric cumulus: shaded belly, lit crown, golden rim on the sun side.
export function Cumulus({ className, style, warm = true }: P & { warm?: boolean }) {
  const id = uid(useId());
  const puffs: [number, number, number][] = [
    [60, 96, 38],
    [110, 76, 50],
    [168, 88, 44],
    [214, 100, 34],
    [92, 108, 36],
    [150, 112, 40],
    [30, 108, 24],
  ];
  return (
    <svg viewBox="0 0 250 140" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`cb${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF7E4" />
          <stop offset=".55" stopColor="#E7E4D6" />
          <stop offset="1" stopColor="#A9C6C4" />
        </linearGradient>
        <radialGradient id={`cl${id}`} cx=".3" cy=".25" r=".8">
          <stop offset="0" stopColor={warm ? '#FFE6A6' : '#FFFFFF'} stopOpacity=".95" />
          <stop offset="1" stopColor="#FFF7E4" stopOpacity="0" />
        </radialGradient>
        <filter id={`cf${id}`} x="-10%" y="-10%" width="120%" height="130%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>
      <g filter={`url(#cf${id})`}>
        {puffs.map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={`url(#cb${id})`} />
        ))}
        {puffs.slice(0, 5).map(([x, y, r], i) => (
          <circle key={`l${i}`} cx={x - r * 0.18} cy={y - r * 0.22} r={r * 0.78} fill={`url(#cl${id})`} />
        ))}
        <rect x="14" y="108" width="226" height="26" rx="13" fill="#B7CFCB" opacity=".55" />
      </g>
    </svg>
  );
}

export function Mist({ className, style }: P) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 400 100" className={className} style={style} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`m${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F1E8D6" stopOpacity="0" />
          <stop offset=".6" stopColor="#F1E8D6" stopOpacity=".55" />
          <stop offset="1" stopColor="#F1E8D6" stopOpacity=".9" />
        </linearGradient>
      </defs>
      <path d="M0 60Q40 20 90 46T200 40T310 48T400 30V100H0Z" fill={`url(#m${id})`} />
    </svg>
  );
}

/* ───────────────────────── plants (SVG groups) ───────────────────────── */

interface G {
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
}
const place = ({ x, y, s = 1, flip }: G) => `translate(${x} ${y}) scale(${flip ? -s : s} ${s})`;

export function Tree({ x, y, s = 1, flip, blossom = false, tone = 0 }: G & { blossom?: boolean; tone?: number }) {
  const id = uid(useId());
  const greens = [
    ['#9ED6A0', '#347D76'],
    ['#C7DE8F', '#4C8E5B'],
    ['#8CCDBB', '#2C6B66'],
  ][tone % 3];
  return (
    <g transform={place({ x, y, s, flip })}>
      <defs>
        <radialGradient id={`t${id}`} cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor={greens[0]} />
          <stop offset="1" stopColor={greens[1]} />
        </radialGradient>
        <linearGradient id={`tr${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8A6A48" />
          <stop offset="1" stopColor="#4D3B2B" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="22" ry="4" fill="#183D4B" opacity=".25" />
      <path d="M-5 2C-4 -14 -8 -28 -4 -46H5C2 -28 6 -14 5 2Z" fill={`url(#tr${id})`} />
      <path d="M0 -26L-14 -38M1 -32L12 -44" stroke="#5a442f" strokeWidth="3" strokeLinecap="round" />
      <g className="sway ambient" style={{ transformOrigin: '0px -30px', animationDuration: `${6 + (tone % 3)}s` }}>
        <circle cx="-17" cy="-52" r="19" fill={`url(#t${id})`} />
        <circle cx="17" cy="-54" r="18" fill={`url(#t${id})`} />
        <circle cx="0" cy="-70" r="24" fill={`url(#t${id})`} />
        <circle cx="-4" cy="-48" r="22" fill={`url(#t${id})`} />
        <circle cx="-8" cy="-76" r="9" fill="#FFF1B8" opacity=".35" />
        {blossom &&
          Array.from({ length: 12 }).map((_, i) => (
            <circle key={i} cx={-28 + rnd(i + 3) * 56} cy={-90 + rnd(i + 9) * 52} r={2.2 + rnd(i) * 1.6} fill={i % 3 ? '#F5EBD3' : '#F6C28F'} />
          ))}
      </g>
    </g>
  );
}

export function Flowers({ x, y, w = 80, n = 9, seed = 1 }: { x: number; y: number; w?: number; n?: number; seed?: number }) {
  const cols = ['#E98C56', '#F5EBD3', '#8974BD', '#F0B94B', '#F5EBD3', '#C9A8E8'];
  return (
    <g transform={`translate(${x} ${y})`}>
      {Array.from({ length: n }).map((_, i) => {
        const fx = (rnd(i + seed) - 0.5) * w;
        const h = 8 + rnd(i + seed + 5) * 14;
        const c = cols[Math.floor(rnd(i + seed + 11) * cols.length)];
        return (
          <g key={i} className="sway ambient" style={{ transformOrigin: `${fx}px 0px`, animationDuration: `${3.5 + rnd(i) * 3}s`, animationDelay: `${rnd(i + 2) * 2}s` }}>
            <path d={`M${fx} 0Q${fx + 1} ${-h / 2} ${fx} ${-h}`} stroke="#2C6B66" strokeWidth="1.2" fill="none" />
            <circle cx={fx} cy={-h} r="3.4" fill={c} />
            <circle cx={fx} cy={-h} r="1.2" fill="#F0B94B" />
            <circle cx={fx - 3} cy={-h - 1.5} r="2" fill={c} opacity=".9" />
            <circle cx={fx + 3} cy={-h - 1.5} r="2" fill={c} opacity=".9" />
          </g>
        );
      })}
    </g>
  );
}

export function Gazebo({ x, y, s = 1 }: G) {
  const id = uid(useId());
  return (
    <g transform={place({ x, y, s })}>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F4E7C5" />
          <stop offset="1" stopColor="#C9B27A" />
        </linearGradient>
        <radialGradient id={`gr${id}`} cx=".4" cy=".2" r=".9">
          <stop offset="0" stopColor="#F7E3A6" />
          <stop offset="1" stopColor="#B8A16A" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="40" ry="5" fill="#183D4B" opacity=".25" />
      <rect x="-34" y="-6" width="68" height="8" rx="2" fill="#D8CBA4" />
      {[-30, -10, 10, 30].map((px) => (
        <rect key={px} x={px - 2.5} y="-52" width="5" height="46" rx="2" fill={`url(#g${id})`} />
      ))}
      <path d="M-36 -52Q0 -86 36 -52Z" fill={`url(#gr${id})`} />
      <path d="M-34 -52Q-17 -68 0 -52Q17 -68 34 -52" stroke="#8D7A48" strokeWidth="1.4" fill="none" />
      <circle cx="0" cy="-74" r="3" fill="#F0B94B" />
      {/* hanging wisteria */}
      {[-26, -16, 18, 28].map((vx, i) => (
        <g key={vx}>
          <path d={`M${vx} -52V${-30 + i * 2}`} stroke="#4C8E5B" strokeWidth="1.2" />
          {[0, 1, 2, 3].map((j) => (
            <circle key={j} cx={vx + (j % 2 ? 2 : -2)} cy={-48 + j * 6} r="3" fill={j % 2 ? '#8974BD' : '#A892D6'} />
          ))}
        </g>
      ))}
      <circle cx="0" cy="-24" r="4" fill="#F0B94B" opacity=".9" className="ambient" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />
    </g>
  );
}

export function Castle({ x, y, s = 1 }: G) {
  const id = uid(useId());
  const tower = (cx: number, w: number, h: number, roof: number, win = true) => (
    <g key={cx}>
      <rect x={cx - w / 2} y={-h} width={w} height={h} fill={`url(#st${id})`} />
      <path d={`M${cx - w / 2 - 2} ${-h}L${cx} ${-h - roof}L${cx + w / 2 + 2} ${-h}Z`} fill={`url(#rf${id})`} />
      <path d={`M${cx} ${-h - roof}V${-h - roof - 8}`} stroke="#B8A16A" strokeWidth="1" />
      <path d={`M${cx} ${-h - roof - 8}l7 2.5l-7 2.5Z`} fill="#E98C56" />
      {win && <rect x={cx - 1.6} y={-h + 7} width="3.2" height="6" rx="1.6" fill="#F7D774" />}
    </g>
  );
  return (
    <g transform={place({ x, y, s })}>
      <defs>
        <linearGradient id={`st${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F6EBD0" />
          <stop offset="1" stopColor="#C8B994" />
        </linearGradient>
        <linearGradient id={`rf${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5BAAA0" />
          <stop offset="1" stopColor="#265F61" />
        </linearGradient>
      </defs>
      <ellipse cx="0" cy="2" rx="52" ry="5" fill="#183D4B" opacity=".25" />
      <rect x="-26" y="-34" width="52" height="34" fill={`url(#st${id})`} />
      {[-22, -12, 0, 12, 22].map((bx) => (
        <rect key={bx} x={bx - 3} y="-38" width="6" height="5" fill="#E3D6B4" />
      ))}
      <path d="M-8 0V-14a8 8 0 0 1 16 0V0Z" fill="#6B4D2F" />
      {tower(-38, 14, 54, 20)}
      {tower(38, 14, 48, 18)}
      {tower(-12, 12, 72, 24)}
      {tower(12, 12, 64, 22)}
      {tower(0, 18, 86, 32)}
      <rect x="-18" y="-24" width="3" height="6" rx="1.5" fill="#F7D774" />
      <rect x="15" y="-24" width="3" height="6" rx="1.5" fill="#F7D774" />
    </g>
  );
}

/* ───────────────────────── rainbow bridge ───────────────────────── */

const BANDS = ['#D9715A', '#E98C56', '#F0B94B', '#A9C47F', '#77B7B0', '#8974BD'];

// An arched rainbow bridge between two points on the same level (viewBox units).
export function RainbowArch({ className, style, draw = false }: P & { draw?: boolean }) {
  return (
    <svg viewBox="0 0 400 200" className={className} style={style} aria-hidden="true" fill="none">
      {BANDS.map((c, i) => (
        <path
          key={c}
          d={`M${20 + i * 7} 196A${180 - i * 7} ${176 - i * 7} 0 0 1 ${380 - i * 7} 196`}
          stroke={c}
          strokeWidth="8.6"
          opacity=".92"
          pathLength={1}
          style={draw ? { strokeDasharray: 1, strokeDashoffset: 1, animation: `drawIn 2.4s cubic-bezier(.2,.7,.2,1) ${0.15 * i}s forwards` } : undefined}
        />
      ))}
    </svg>
  );
}

// A walkable rainbow bridge with golden railing, for the journey scenes.
export function RainbowBridge({ x, y, s = 1 }: G) {
  const id = uid(useId());
  return (
    <g transform={place({ x, y, s })}>
      <defs>
        <linearGradient id={`rg${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7E3A6" />
          <stop offset="1" stopColor="#B8A16A" />
        </linearGradient>
      </defs>
      {BANDS.map((c, i) => (
        <path key={c} d={`M0 ${-i * 0} C 40 -78, 140 -78, 180 0`} transform={`translate(0 ${i * 7 + 2})`} stroke={c} strokeWidth="9" fill="none" opacity=".95" />
      ))}
      <path d="M0 -8 C 40 -88, 140 -88, 180 -8" stroke={`url(#rg${id})`} strokeWidth="3" fill="none" />
      {Array.from({ length: 9 }).map((_, i) => {
        const t = i / 8;
        const px = 180 * t;
        const top = -8 - (3 * (1 - t) * (1 - t) * t * 80 + 3 * (1 - t) * t * t * 80);
        return (
          <g key={i}>
            <path d={`M${px} ${top + 1}V${top + 15}`} stroke="#B8A16A" strokeWidth="1.8" />
            <circle cx={px} cy={top} r="2.2" fill="#F0B94B" />
          </g>
        );
      })}
    </g>
  );
}

/* ───────────────────────── floating island ───────────────────────── */

export function Waterfall({ x, top, h, w = 22, delay = 0 }: { x: number; top: number; h: number; w?: number; delay?: number }) {
  const id = uid(useId());
  return (
    <g>
      <defs>
        <linearGradient id={`wf${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E8FBF6" stopOpacity=".95" />
          <stop offset=".7" stopColor="#B4E3DC" stopOpacity=".7" />
          <stop offset="1" stopColor="#F1E8D6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M${x - w / 2} ${top}H${x + w / 2}L${x + w / 2 + 3} ${top + h}H${x - w / 2 - 3}Z`} fill={`url(#wf${id})`} />
      {[-0.3, 0, 0.3].map((k, i) => (
        <path
          key={i}
          d={`M${x + k * w} ${top + 2}V${top + h}`}
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="10 16"
          className="ambient"
          style={{ animation: `flow ${1.1 + i * 0.25}s linear ${delay + i * 0.2}s infinite` }}
          opacity=".85"
        />
      ))}
      <ellipse cx={x} cy={top + h} rx={w * 1.5} ry="7" fill="#F1E8D6" opacity=".7" className="ambient" style={{ animation: 'mistPulse 4s ease-in-out infinite' }} />
    </g>
  );
}

interface IslandProps extends P {
  falls?: number[]; // x positions (viewBox 0..400) of waterfalls over the front edge
  children?: ReactNode; // scenery, drawn in the island's 400×300 viewBox (grass line ≈ y 118)
  vines?: boolean;
}

export function FloatingIsland({ className, style, falls = [], children, vines = true }: IslandProps) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 400 300" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`rk${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A7656" />
          <stop offset=".45" stopColor="#5F5A4C" />
          <stop offset="1" stopColor="#263B42" />
        </linearGradient>
        <linearGradient id={`sh${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F0B94B" stopOpacity=".18" />
          <stop offset=".5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#0E2A33" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`gr${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8FCB8C" />
          <stop offset=".55" stopColor="#4C9A78" />
          <stop offset="1" stopColor="#347D76" />
        </linearGradient>
        <clipPath id={`rc${id}`}>
          <path d="M8 128Q26 152 60 166L92 212Q122 252 170 264L200 296L232 264Q290 252 314 208L342 166Q378 150 392 128Z" />
        </clipPath>
      </defs>
      {/* rock body with strata */}
      <path d="M8 128Q26 152 60 166L92 212Q122 252 170 264L200 296L232 264Q290 252 314 208L342 166Q378 150 392 128Z" fill={`url(#rk${id})`} />
      <g clipPath={`url(#rc${id})`}>
        <path d="M0 150Q100 162 200 150T400 152V176Q300 186 200 174T0 176Z" fill="#A58B62" opacity=".55" />
        <path d="M0 184Q100 198 200 184T400 188V208Q300 220 200 208T0 210Z" fill="#7B6B52" opacity=".6" />
        <path d="M0 220Q100 232 200 222T400 224V240Q300 252 200 242T0 244Z" fill="#4B5A58" opacity=".6" />
        <path d="M60 160L90 206L120 168L150 214L176 176L206 222L236 180L270 214L300 170L330 176V140H60Z" fill="#B3A07A" opacity=".22" />
        <rect width="400" height="300" fill={`url(#sh${id})`} />
      </g>
      {/* waterfalls pouring over the lip, behind scenery */}
      {falls.map((fx, i) => (
        <Waterfall key={fx} x={fx} top={140} h={150 + (i % 2) * 20} delay={i * 0.3} />
      ))}
      {/* grass crown */}
      <path d="M4 128Q100 98 200 106Q300 98 396 128Q380 152 330 146Q200 160 70 146Q20 152 4 128Z" fill={`url(#gr${id})`} />
      <path d="M4 128Q100 98 200 106Q300 98 396 128" stroke="#F0B94B" strokeOpacity=".7" strokeWidth="2" fill="none" />
      {/* moss + vines hanging from the lip */}
      {[34, 76, 118, 168, 232, 282, 326, 364].map((mx, i) => (
        <path key={mx} d={`M${mx} 142q4 ${10 + (i % 3) * 5} 8 0z`} fill="#4C9A78" />
      ))}
      {vines &&
        [48, 130, 252, 340].map((vx, i) => (
          <g key={vx} className="sway ambient" style={{ transformOrigin: `${vx}px 146px`, animationDuration: `${5 + i}s` }}>
            <path d={`M${vx} 146q-6 ${14 + i * 3} 0 ${30 + i * 4}t0 ${22}`} stroke="#3F8B5B" strokeWidth="2" fill="none" />
            {[0, 1, 2, 3].map((j) => (
              <ellipse key={j} cx={vx + (j % 2 ? 4 : -4)} cy={156 + j * 14 + i * 2} rx="4" ry="2.4" fill="#6DB27A" />
            ))}
          </g>
        ))}
      {children}
    </svg>
  );
}

/* ───────────────────────── hot-air balloon ───────────────────────── */

export function Balloon({ className, style, colors = ['#E98C56', '#F1E8D6'], trim = '#F0B94B' }: P & { colors?: [string, string] | string[]; trim?: string }) {
  const id = uid(useId());
  const [a, b] = colors;
  const env = 'M50 4C22 4 6 26 6 52c0 22 14 38 30 50h28c16-12 30-28 30-50C94 26 78 4 50 4Z';
  return (
    <svg viewBox="0 0 100 150" className={className} style={style} aria-hidden="true">
      <defs>
        <clipPath id={`e${id}`}>
          <path d={env} />
        </clipPath>
        <radialGradient id={`hl${id}`} cx=".3" cy=".25" r=".75">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".6" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`sd${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset=".55" stopColor="#183D4B" stopOpacity="0" />
          <stop offset="1" stopColor="#183D4B" stopOpacity=".45" />
        </linearGradient>
        <pattern id={`wv${id}`} width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M0 0L4 4M4 0L0 4" stroke="#5A3F26" strokeWidth=".7" />
        </pattern>
      </defs>
      <g clipPath={`url(#e${id})`}>
        <rect width="100" height="110" fill={b} />
        {/* gore panels */}
        <path d="M50 4C34 20 30 80 40 106H24C8 80 14 20 50 4Z" fill={a} />
        <path d="M50 4C66 20 70 80 60 106H76C92 80 86 20 50 4Z" fill={a} />
        <path d="M0 0H12C6 40 10 80 22 108H0Z" fill={b} />
        <path d="M0 0H100V110H0Z" fill={`url(#sd${id})`} />
        <path d="M0 0H100V110H0Z" fill={`url(#hl${id})`} />
        {/* decorative band */}
        <path d="M0 62Q50 72 100 62V70Q50 80 0 70Z" fill={trim} />
        <g fill="#FFF3C9" opacity=".9">
          {[14, 26, 38, 50, 62, 74, 86].map((cx) => (
            <circle key={cx} cx={cx} cy={cx % 24 === 14 ? 68 : 71.5} r="1.5" />
          ))}
        </g>
      </g>
      {/* stitched seams */}
      <g stroke="#FFF3C9" strokeWidth=".7" strokeDasharray="2 2" fill="none" opacity=".75">
        <path d="M50 4C38 22 36 80 44 104" />
        <path d="M50 4C62 22 64 80 56 104" />
        <path d="M50 4C26 20 22 76 30 102" />
        <path d="M50 4C74 20 78 76 70 102" />
      </g>
      <path d={env} stroke="#183D4B" strokeOpacity=".25" strokeWidth="1" fill="none" />
      {/* burner + ropes */}
      <path d="M36 102H64L62 108H38Z" fill={trim} />
      <path d="M38 108L41 124M62 108L59 124M50 108V124" stroke="#6B5434" strokeWidth=".9" />
      <g className="swing ambient" style={{ transformOrigin: '50px 108px' }}>
        <rect x="38" y="124" width="24" height="17" rx="2.5" fill="#A8794A" />
        <rect x="38" y="124" width="24" height="17" rx="2.5" fill={`url(#wv${id})`} />
        <rect x="37" y="122.5" width="26" height="3.5" rx="1.7" fill={trim} />
        <path d="M38 141Q50 145 62 141" stroke="#6B4A2A" strokeWidth="1" fill="none" />
      </g>
    </svg>
  );
}

/* ───────────────────────── small things ───────────────────────── */

export function Butterfly({ className, style, a = '#E98C56', b = '#8974BD' }: P & { a?: string; b?: string }) {
  return (
    <svg viewBox="0 0 60 50" className={className} style={style} aria-hidden="true">
      <g className="flap ambient">
        <path d="M30 25C22 4 3 6 6 22c1 9 15 11 24 3Z" fill={a} />
        <path d="M30 27C19 30 8 36 14 44c6 5 15-3 16-17Z" fill={b} />
        <circle cx="15" cy="17" r="3" fill="#F1E8D6" opacity=".8" />
      </g>
      <g transform="translate(60 0) scale(-1 1)">
        <g className="flap ambient">
          <path d="M30 25C22 4 3 6 6 22c1 9 15 11 24 3Z" fill={a} />
          <path d="M30 27C19 30 8 36 14 44c6 5 15-3 16-17Z" fill={b} />
          <circle cx="15" cy="17" r="3" fill="#F1E8D6" opacity=".8" />
        </g>
      </g>
      <ellipse cx="30" cy="27" rx="2.4" ry="11" fill="#183D4B" />
      <path d="M29 17q-5-9-9-9M31 17q5-9 9-9" stroke="#183D4B" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Spark({ className, style }: P) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 20 20" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`s${id}`}>
          <stop offset="0" stopColor="#FFF4C8" />
          <stop offset="1" stopColor="#F0B94B" />
        </radialGradient>
      </defs>
      <path d="M10 0Q11.2 8.8 20 10Q11.2 11.2 10 20Q8.8 11.2 0 10Q8.8 8.8 10 0Z" fill={`url(#s${id})`} />
    </svg>
  );
}

// Glowing, dimensional sun sculpture (Team Sunshine)
export function SunSculpture({ className, style }: P) {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 160 160" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`o${id}`} cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#FFF6CF" />
          <stop offset=".5" stopColor="#F0B94B" />
          <stop offset="1" stopColor="#D9733F" />
        </radialGradient>
        <radialGradient id={`gl${id}`}>
          <stop offset="0" stopColor="#F0B94B" stopOpacity=".55" />
          <stop offset="1" stopColor="#F0B94B" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="78" fill={`url(#gl${id})`} />
      <g className="spin ambient" style={{ transformOrigin: '80px 80px' }}>
        {Array.from({ length: 12 }).map((_, i) => (
          <path key={i} d="M80 8L88 34H72Z" fill={i % 2 ? '#F7D98B' : '#E98C56'} transform={`rotate(${i * 30} 80 80)`} />
        ))}
      </g>
      <circle cx="80" cy="80" r="38" fill={`url(#o${id})`} />
      <ellipse cx="68" cy="64" rx="16" ry="9" fill="#FFFFFF" opacity=".35" transform="rotate(-30 68 64)" />
      <circle cx="80" cy="80" r="38" fill="none" stroke="#FFF1B8" strokeOpacity=".6" strokeWidth="1.5" />
    </svg>
  );
}

// Abstract faceted star sculpture (Team Wonder)
export function StarSculpture({ className, style }: P) {
  const id = uid(useId());
  const pts = Array.from({ length: 10 }).map((_, i) => {
    const r = i % 2 ? 26 : 62;
    const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
    return [80 + Math.cos(a) * r, 80 + Math.sin(a) * r] as const;
  });
  const tone = ['#A9D6D1', '#77B7B0', '#347D76', '#8974BD', '#5E4D96'];
  return (
    <svg viewBox="0 0 160 160" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`gl${id}`}>
          <stop offset="0" stopColor="#77B7B0" stopOpacity=".5" />
          <stop offset="1" stopColor="#77B7B0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="80" cy="80" r="78" fill={`url(#gl${id})`} />
      <g className="spin-rev ambient" style={{ transformOrigin: '80px 80px' }}>
        {pts.map((p, i) => {
          const n = pts[(i + 1) % 10];
          return <path key={i} d={`M80 80L${p[0]} ${p[1]}L${n[0]} ${n[1]}Z`} fill={tone[i % 5]} stroke="#F1E8D6" strokeOpacity=".35" strokeWidth=".8" />;
        })}
      </g>
      <circle cx="80" cy="80" r="9" fill="#F7D98B" />
    </svg>
  );
}

// Soft, tasteful animal figures for the little explorer island: muted ceramic look.
export function Rabbit({ x, y, s = 1, flip }: G) {
  return (
    <g transform={place({ x, y, s, flip })}>
      <ellipse cx="0" cy="1" rx="11" ry="2.4" fill="#183D4B" opacity=".25" />
      <ellipse cx="0" cy="-8" rx="9" ry="8" fill="#F1E8D6" />
      <circle cx="7" cy="-15" r="5.6" fill="#F6EEDC" />
      <ellipse cx="5.5" cy="-26" rx="1.9" ry="6.5" fill="#F6EEDC" />
      <ellipse cx="9.5" cy="-25.5" rx="1.8" ry="6" fill="#EAD9BD" />
      <circle cx="9" cy="-16" r=".9" fill="#183D4B" />
      <circle cx="-8.5" cy="-8" r="3" fill="#FFFAF0" />
      <ellipse cx="-3" cy="-1.5" rx="4.5" ry="2.2" fill="#E8DBC0" />
    </g>
  );
}

export function Fawn({ x, y, s = 1, flip }: G) {
  return (
    <g transform={place({ x, y, s, flip })}>
      <ellipse cx="0" cy="1" rx="16" ry="2.6" fill="#183D4B" opacity=".25" />
      <path d="M-12 -14Q-14 -24 -4 -24H10Q14 -24 14 -17L12 -14Z" fill="#C98F58" />
      <path d="M-10 -14V0M-4 -14V0M6 -14V0M11 -14V0" stroke="#A9743F" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 -22Q14 -34 20 -36Q26 -34 25 -30Q22 -26 16 -24Z" fill="#D8A06A" />
      <path d="M17 -36L15 -42M21 -36L23 -42" stroke="#A9743F" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21.5" cy="-33" r=".9" fill="#183D4B" />
      {[-6, 0, 5, -2, 8].map((dx, i) => (
        <circle key={i} cx={dx} cy={-20 + (i % 3) * 2.4} r="1" fill="#F6EEDC" />
      ))}
    </g>
  );
}

export function Songbird({ x, y, s = 1, flip }: G) {
  return (
    <g transform={place({ x, y, s, flip })}>
      <ellipse cx="0" cy="1" rx="7" ry="1.6" fill="#183D4B" opacity=".25" />
      <ellipse cx="0" cy="-7" rx="7" ry="6" fill="#E98C56" />
      <circle cx="5.5" cy="-12" r="4" fill="#F0B94B" />
      <path d="M9 -12l5 1.5L9 -9Z" fill="#B8A16A" />
      <path d="M-5 -7Q-12 -5 -13 0Q-6 -1 -2 -4Z" fill="#8974BD" />
      <circle cx="6.5" cy="-13" r=".8" fill="#183D4B" />
    </g>
  );
}

/* ───────────────────────── ready-made scenes ───────────────────────── */

// The main island used on the opening / hero: gazebo, blossom tree, flowers, falls, castle far away.
export function HeroIsland({ className, style }: P) {
  return (
    <FloatingIsland className={className} style={style} falls={[285, 130]}>
      <Tree x={62} y={124} s={1.05} blossom tone={1} />
      <Gazebo x={150} y={122} s={0.85} />
      <Tree x={246} y={120} s={0.8} tone={0} />
      <Tree x={338} y={128} s={0.7} tone={2} blossom />
      <Flowers x={110} y={134} w={60} n={8} seed={3} />
      <Flowers x={210} y={132} w={70} n={9} seed={11} />
      <Flowers x={300} y={134} w={50} n={7} seed={21} />
    </FloatingIsland>
  );
}

export function CastleIsland({ className, style }: P) {
  return (
    <FloatingIsland className={className} style={style} falls={[110, 300]}>
      <Tree x={50} y={126} s={0.8} tone={2} />
      <Castle x={200} y={116} s={1.45} />
      <Tree x={330} y={126} s={0.85} tone={1} blossom />
      <Flowers x={115} y={132} w={50} n={7} seed={5} />
      <Flowers x={290} y={132} w={50} n={7} seed={8} />
    </FloatingIsland>
  );
}

export function ExplorerIsland({ className, style }: P) {
  return (
    <FloatingIsland className={className} style={style} falls={[352]}>
      <Tree x={40} y={126} s={0.95} blossom tone={0} />
      <Rabbit x={100} y={130} s={1.15} />
      <Fawn x={158} y={129} s={1.15} />
      <Songbird x={206} y={128} s={1.2} flip />
      {/* little stream with a wooden bridge */}
      <path d="M236 132Q290 126 346 138L350 146Q290 138 232 140Z" fill="#9ED6D0" opacity=".9" />
      <g>
        <path d="M252 136Q290 108 328 138" stroke="#A8794A" strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M252 136Q290 108 328 138" stroke="#D9B06E" strokeWidth="1.5" fill="none" strokeDasharray="3 4" />
        <path d="M256 128Q290 98 324 130" stroke="#8D6A3F" strokeWidth="1.6" fill="none" />
        {[262, 276, 290, 304, 318].map((bx, i) => (
          <path key={bx} d={`M${bx} ${[126, 117, 114, 117, 126][i] + 2}V${[134, 125, 122, 125, 134][i] + 2}`} stroke="#8D6A3F" strokeWidth="1.4" />
        ))}
      </g>
      <Tree x={372} y={128} s={0.62} tone={1} />
      <Flowers x={78} y={136} w={40} n={6} seed={2} />
      <Flowers x={196} y={136} w={50} n={7} seed={14} />
    </FloatingIsland>
  );
}

export function GardenIsland({ className, style }: P) {
  return (
    <FloatingIsland className={className} style={style} falls={[200]}>
      <Tree x={40} y={126} s={0.9} blossom tone={1} />
      <Tree x={360} y={126} s={0.85} blossom tone={0} />
      <Flowers x={90} y={134} w={80} n={14} seed={31} />
      <Flowers x={310} y={134} w={80} n={14} seed={41} />
      <Flowers x={200} y={134} w={60} n={9} seed={51} />
      <path d="M150 140Q200 128 250 140" stroke="#9ED6D0" strokeWidth="4" fill="none" opacity=".85" />
    </FloatingIsland>
  );
}
