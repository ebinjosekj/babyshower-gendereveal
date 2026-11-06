import { useId } from 'react';
import { Flowers, Lantern, Tree } from './world';

const uid = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, '');
const rnd = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// A detailed arched garden gate set into a small floating island. viewBox 400×500.
// The opening spans x 140–260, springs at y 300 and peaks at y 240; the doors swing open.
export default function GateScene({ open, fast }: { open: boolean; fast?: boolean }) {
  const id = uid(useId());
  const dur = fast ? '.4s' : '1.5s';
  const doorStyle = (hinge: number, dir: 1 | -1) => ({
    transformBox: 'view-box' as const,
    transformOrigin: `${hinge}px 320px`,
    transform: open ? `scaleX(.12) skewY(${dir * 5}deg)` : 'scaleX(1) skewY(0deg)',
    transition: `transform ${dur} cubic-bezier(.5,.1,.2,1)`,
  });
  // one door leaf, drawn for the left side then mirrored for the right
  const leaf = (mirror: boolean) => (
    <g transform={mirror ? 'translate(400 0) scale(-1 1)' : undefined}>
      <path d="M140 400V300A60 60 0 0 1 200 240V400Z" fill={`url(#wd${id})`} />
      {[156, 172, 188].map((x) => (
        <path key={x} d={`M${x} ${x < 160 ? 296 : x < 175 ? 276 : 252}V400`} stroke="#2A1B10" strokeOpacity=".55" strokeWidth="1" />
      ))}
      <path d="M146 330H196M146 372H196" stroke="#1E2A2C" strokeWidth="5" />
      {[152, 168, 184, 196].map((x) => (
        <g key={x}>
          <circle cx={x} cy="330" r="1.8" fill="#B8A16A" />
          <circle cx={x} cy="372" r="1.8" fill="#B8A16A" />
        </g>
      ))}
      <path d="M150 360V312Q150 296 164 292M184 360V300Q184 280 196 272" stroke="#D9B06E" strokeOpacity=".55" strokeWidth="1.2" fill="none" />
      <circle cx="193" cy="348" r="5" fill="none" stroke="#B8A16A" strokeWidth="2" />
      <path d="M140 400V300A60 60 0 0 1 200 240V400Z" fill="url(#ds${id})" />
    </g>
  );

  return (
    <svg viewBox="0 0 400 500" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`rk${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A6A4E" />
          <stop offset=".5" stopColor="#4C5148" />
          <stop offset="1" stopColor="#1E3238" />
        </linearGradient>
        <linearGradient id={`gr${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6FB080" />
          <stop offset="1" stopColor="#2D6E64" />
        </linearGradient>
        <linearGradient id={`sn${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6B7570" />
          <stop offset=".5" stopColor="#4A5656" />
          <stop offset="1" stopColor="#2F3C40" />
        </linearGradient>
        <pattern id={`bk${id}`} width="26" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 0H26M0 8H26M0 16H26M13 0V8M0 8V16M26 8V16" stroke="#1C2A2D" strokeOpacity=".55" strokeWidth="1" fill="none" />
        </pattern>
        <radialGradient id={`gl${id}`} cx=".5" cy=".62" r=".7">
          <stop offset="0" stopColor="#FFF3C4" />
          <stop offset=".35" stopColor="#FFD275" />
          <stop offset=".75" stopColor="#E08F3C" />
          <stop offset="1" stopColor="#9A5A2E" />
        </radialGradient>
        <linearGradient id={`wd${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6B4A2E" />
          <stop offset="1" stopColor="#4A311E" />
        </linearGradient>
        <linearGradient id={`ds${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity=".35" />
          <stop offset=".5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#FFD275" stopOpacity=".12" />
        </linearGradient>
        <radialGradient id={`halo${id}`} cx=".5" cy=".55" r=".5">
          <stop offset="0" stopColor="#FFD98A" stopOpacity=".7" />
          <stop offset="1" stopColor="#FFD98A" stopOpacity="0" />
        </radialGradient>
        <clipPath id={`op${id}`}>
          <path d="M140 400V300A60 60 0 0 1 260 300V400Z" />
        </clipPath>
      </defs>

      {/* glow around the gate */}
      <ellipse cx="200" cy="320" rx="190" ry="190" fill={`url(#halo${id})`} className="ambient" style={{ animation: 'gatePulse 4s ease-in-out infinite' }} />

      {/* island rock */}
      <path d="M6 396Q30 424 76 444L128 476Q160 492 200 498Q240 492 272 476L324 444Q370 424 394 396Z" fill={`url(#rk${id})`} />
      <path d="M30 420Q100 436 200 424T370 420M70 448Q140 460 200 450T330 448" stroke="#2A3A3C" strokeOpacity=".6" strokeWidth="2" fill="none" />
      <path d="M44 412l20 30-6 24M330 420l-16 28 8 20" stroke="#B3A07A" strokeOpacity=".25" strokeWidth="2" fill="none" />
      {/* roots + vines hanging below the lip */}
      {[60, 120, 270, 340].map((x, i) => (
        <path key={x} d={`M${x} 412q-6 ${16 + i * 4} 0 ${34 + i * 6}t0 ${20}`} stroke="#3F8B5B" strokeWidth="2" fill="none" className="sway ambient" style={{ transformOrigin: `${x}px 412px`, animationDuration: `${5 + i}s` }} />
      ))}

      {/* stone wall with arched opening */}
      <path d="M96 400V252Q96 192 200 184Q304 192 304 252V400Z" fill={`url(#sn${id})`} />
      <path d="M96 400V252Q96 192 200 184Q304 192 304 252V400Z" fill={`url(#bk${id})`} />
      <path d="M84 400V300Q84 240 96 232" stroke="none" fill="none" />
      {/* inside: warm light and a glimpse of the world beyond */}
      <g clipPath={`url(#op${id})`}>
        <rect x="140" y="236" width="120" height="170" fill={`url(#gl${id})`} />
        <path d="M140 360Q170 330 200 346T260 336V400H140Z" fill="#2F7D6E" opacity=".75" />
        <path d="M140 372Q180 350 220 366T260 358V400H140Z" fill="#1E5A56" opacity=".85" />
        <g transform="translate(212 322) scale(.5)" opacity=".7">
          <rect x="-8" y="-26" width="16" height="26" fill="#6E5A46" />
          <path d="M-10 -26L0 -46L10 -26Z" fill="#4B3A30" />
          <rect x="-1.5" y="-18" width="3" height="5" fill="#FFE08A" />
        </g>
        <path d="M150 340Q200 262 250 340" stroke="#F0B94B" strokeOpacity=".5" strokeWidth="5" fill="none" />
        <path d="M156 340Q200 274 244 340" stroke="#E98C56" strokeOpacity=".35" strokeWidth="4" fill="none" />
      </g>
      {/* door leaves */}
      <g style={doorStyle(140, 1)}>{leaf(false)}</g>
      <g style={doorStyle(260, -1)}>{leaf(true)}</g>
      {/* carved arch surround + keystone */}
      <path d="M132 400V300A68 68 0 0 1 268 300V400" stroke="#B8A16A" strokeWidth="7" fill="none" strokeLinejoin="round" />
      <path d="M132 400V300A68 68 0 0 1 268 300V400" stroke="#E8D49A" strokeOpacity=".55" strokeWidth="1.4" fill="none" />
      <path d="M190 230l20 0 4 18h-28z" fill="#CDB77C" />
      <circle cx="200" cy="242" r="3.6" fill="#8A6D3A" />
      {/* steps */}
      <path d="M128 400h144l8 10H120Z" fill="#7B8580" />
      <path d="M120 410h160l10 10H110Z" fill="#69736E" />
      <path d="M110 420h180l10 10H100Z" fill="#59635F" />
      {/* light spilling out when the doors open */}
      <path d="M150 400L60 470H340L250 400Z" fill="#FFD98A" opacity={open ? 0.5 : 0} style={{ transition: `opacity ${dur} ease .4s` }} />
      <ellipse cx="200" cy="440" rx="110" ry="14" fill="#FFE9A8" opacity={open ? 0.6 : 0} style={{ transition: `opacity ${dur} ease .5s` }} />

      {/* grass crown, flowers and trees */}
      <path d="M0 396Q60 376 110 392L96 400H0Z M304 400L290 392Q340 376 400 396V400Z" fill={`url(#gr${id})`} />
      <path d="M0 402Q60 382 120 400Q60 412 0 410Z M280 400Q340 382 400 402V410Q340 412 280 400Z" fill={`url(#gr${id})`} />
      <Tree x={50} y={400} s={1.5} blossom tone={1} />
      <Tree x={352} y={402} s={1.35} blossom tone={0} />
      <Flowers x={72} y={404} w={64} n={10} seed={61} />
      <Flowers x={330} y={404} w={64} n={10} seed={71} />

      {/* climbing vines and blossoms framing the arch */}
      {[0, 1].map((side) => (
        <g key={side} transform={side ? 'translate(400 0) scale(-1 1)' : undefined}>
          <path d="M112 396Q100 340 118 300T134 236Q150 212 186 200" stroke="#2F7A55" strokeWidth="3" fill="none" className="sway ambient" style={{ transformOrigin: '112px 396px', animationDuration: '7s' }} />
          {Array.from({ length: 16 }).map((_, i) => {
            const t = i / 15;
            const px = 112 + Math.sin(t * 5) * 14 + t * 70;
            const py = 396 - t * 196;
            return <ellipse key={i} cx={px + (i % 2 ? 6 : -6)} cy={py} rx="6" ry="3.2" fill={i % 3 ? '#4C9A6A' : '#6DB27A'} transform={`rotate(${i % 2 ? 30 : -30} ${px} ${py})`} />;
          })}
          {Array.from({ length: 9 }).map((_, i) => {
            const t = (i + 1) / 10;
            const px = 112 + Math.sin(t * 5) * 14 + t * 70;
            const py = 396 - t * 196;
            const c = ['#F1E8D6', '#8974BD', '#E98C56'][i % 3];
            return <circle key={i} cx={px + (rnd(i) - 0.5) * 10} cy={py + (rnd(i + 4) - 0.5) * 8} r={3 + rnd(i + 9) * 2} fill={c} />;
          })}
        </g>
      ))}
      {/* wisteria hanging from the arch */}
      {[160, 176, 224, 240].map((x, i) => (
        <g key={x} className="sway ambient" style={{ transformOrigin: `${x}px 214px`, animationDuration: `${4.5 + i}s` }}>
          <path d={`M${x} 210V${232 + (i % 2) * 8}`} stroke="#3F8B5B" strokeWidth="1.2" />
          {[0, 1, 2, 3].map((j) => (
            <circle key={j} cx={x + (j % 2 ? 2 : -2)} cy={226 + j * 6 + (i % 2) * 4} r={3 - j * 0.35} fill={j % 2 ? '#8974BD' : '#A892D6'} />
          ))}
        </g>
      ))}

      {/* lanterns either side */}
      <Lantern x={112} y={258} s={1.5} hang={22} />
      <Lantern x={288} y={258} s={1.5} hang={22} />
      <path d="M112 232H100M288 232H300" stroke="#2A2A2A" strokeWidth="2" />
    </svg>
  );
}
