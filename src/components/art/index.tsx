import { useId, type CSSProperties } from 'react';

// Original storybook illustrations, drawn as inline SVG (no image downloads).
// Palette: sunshine, tangerine, coral, mint, emerald, turquoise, lavender, ivory, gold.

interface P {
  className?: string;
  style?: CSSProperties;
}

const uid = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, '');

export const Star = ({ className, style }: P) => {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 20 20" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF4B8" />
          <stop offset="1" stopColor="#FFB62E" />
        </linearGradient>
      </defs>
      <path d="M10 0Q11.2 8.8 20 10Q11.2 11.2 10 20Q8.8 11.2 0 10Q8.8 8.8 10 0Z" fill={`url(#s${id})`} />
    </svg>
  );
};

export const Cloud = ({ className, style }: P) => {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 220 110" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`c${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#EDE4FF" />
        </linearGradient>
      </defs>
      <path
        d="M44 92a28 28 0 0 1 3-55 36 36 0 0 1 68-8 31 31 0 0 1 54 16 25 25 0 0 1 9 47Z"
        fill={`url(#c${id})`}
      />
    </svg>
  );
};

export const Moon = ({ className, style }: P) => {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`m${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF4B8" />
          <stop offset="1" stopColor="#FFC93C" />
        </linearGradient>
        <mask id={`mm${id}`}>
          <rect width="100" height="100" fill="#fff" />
          <circle cx="68" cy="40" r="36" fill="#000" />
        </mask>
      </defs>
      <circle cx="46" cy="52" r="38" fill={`url(#m${id})`} mask={`url(#mm${id})`} />
    </svg>
  );
};

export const Sun = ({ className, style }: P) => {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 120 120" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`sun${id}`} cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#FFF4B8" />
          <stop offset=".6" stopColor="#FFC93C" />
          <stop offset="1" stopColor="#FF9A3C" />
        </radialGradient>
      </defs>
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x="56" y="2" width="8" height="20" rx="4" fill="#FFB62E" transform={`rotate(${i * 30} 60 60)`} />
      ))}
      <circle cx="60" cy="60" r="34" fill={`url(#sun${id})`} />
      <circle cx="49" cy="55" r="3.6" fill="#2B1A57" />
      <circle cx="71" cy="55" r="3.6" fill="#2B1A57" />
      <path d="M48 68q12 11 24 0" stroke="#2B1A57" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      <ellipse cx="43" cy="66" rx="6" ry="4" fill="#FF7A66" opacity=".5" />
      <ellipse cx="77" cy="66" rx="6" ry="4" fill="#FF7A66" opacity=".5" />
    </svg>
  );
};

export const Butterfly = ({ className, style, a = '#FF9A3C', b = '#B8A6F0' }: P & { a?: string; b?: string }) => (
  <svg viewBox="0 0 60 50" className={className} style={style} aria-hidden="true">
    <g className="flap ambient">
      <path d="M30 25C22 4 3 6 6 22c1 9 15 11 24 3Z" fill={a} />
      <path d="M30 27C19 30 8 36 14 44c6 5 15-3 16-17Z" fill={b} />
      <circle cx="15" cy="17" r="3" fill="#FFF8EA" opacity=".8" />
    </g>
    <g transform="translate(60 0) scale(-1 1)">
      <g className="flap ambient">
        <path d="M30 25C22 4 3 6 6 22c1 9 15 11 24 3Z" fill={a} />
        <path d="M30 27C19 30 8 36 14 44c6 5 15-3 16-17Z" fill={b} />
        <circle cx="15" cy="17" r="3" fill="#FFF8EA" opacity=".8" />
      </g>
    </g>
    <ellipse cx="30" cy="27" rx="2.4" ry="11" fill="#2B1A57" />
    <path d="M29 17q-5-9-9-9M31 17q5-9 9-9" stroke="#2B1A57" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

export const HotAirBalloon = ({
  className,
  style,
  colors = ['#FFC93C', '#FF7A66', '#8EE3C2', '#B8A6F0', '#FF9A3C'],
}: P & { colors?: string[] }) => {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 100 150" className={className} style={style} aria-hidden="true">
      <defs>
        <clipPath id={`b${id}`}>
          <path d="M50 4C22 4 6 26 6 50c0 22 16 36 30 48h28c14-12 30-26 30-48C94 26 78 4 50 4Z" />
        </clipPath>
        <radialGradient id={`bh${id}`} cx=".3" cy=".25" r=".7">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g clipPath={`url(#b${id})`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={6 + i * 14.7} y="0" width="14.8" height="110" fill={colors[i % colors.length]} />
        ))}
        <rect x="0" y="0" width="100" height="110" fill={`url(#bh${id})`} />
      </g>
      <path d="M36 98 40 120M64 98 60 120M50 98v22" stroke="#8A5A3B" strokeWidth="1.6" />
      <rect x="37" y="118" width="26" height="17" rx="3" fill="#C98A4B" />
      <path d="M37 126h26M44 118v17M50 118v17M56 118v17" stroke="#9C6632" strokeWidth="1" />
      <ellipse cx="50" cy="108" rx="5" ry="7" fill="#FFC93C" className="ambient" style={{ animation: 'twinkle 1.2s ease-in-out infinite' }} />
    </svg>
  );
};

export const PartyBalloon = ({ className, style, color = '#FFC93C' }: P & { color?: string }) => (
  <svg viewBox="0 0 60 120" className={className} style={style} aria-hidden="true">
    <ellipse cx="30" cy="38" rx="26" ry="33" fill={color} />
    <ellipse cx="20" cy="24" rx="6" ry="10" fill="#fff" opacity=".4" transform="rotate(20 20 24)" />
    <path d="m30 70-5 7h10z" fill={color} />
    <path d="M30 77c-7 14 7 22 0 42" stroke="#8A6D9E" strokeWidth="1.2" fill="none" opacity=".7" />
  </svg>
);

export const Rainbow = ({ className, style }: P) => {
  const cols = ['#FF7A66', '#FF9A3C', '#FFC93C', '#8EE3C2', '#27C4C4', '#B8A6F0'];
  return (
    <svg viewBox="0 0 200 105" className={className} style={style} aria-hidden="true">
      {cols.map((c, i) => {
        const r = 92 - i * 10;
        return <path key={c} d={`M${100 - r} 102A${r} ${r} 0 0 1 ${100 + r} 102`} stroke={c} strokeWidth="10.5" fill="none" />;
      })}
    </svg>
  );
};

export const Island = ({ className, style }: P) => {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 300 210" className={className} style={style} aria-hidden="true">
      <defs>
        <linearGradient id={`r${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#B58A63" />
          <stop offset="1" stopColor="#6F4E3A" />
        </linearGradient>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8EE3C2" />
          <stop offset="1" stopColor="#1FA67A" />
        </linearGradient>
      </defs>
      <path d="M16 94Q150 112 284 94L246 154Q214 196 168 206L150 190L128 208Q88 196 54 154Z" fill={`url(#r${id})`} />
      <path d="M96 158l14 18M196 150l-10 22M150 140v26" stroke="#5A3F2E" strokeWidth="3" opacity=".35" strokeLinecap="round" />
      <ellipse cx="150" cy="92" rx="140" ry="30" fill={`url(#g${id})`} />
      <ellipse cx="150" cy="86" rx="126" ry="21" fill="#9BEBCB" opacity=".75" />
    </svg>
  );
};

export const Tree = ({ className, style, c1 = '#1FA67A', c2 = '#8EE3C2' }: P & { c1?: string; c2?: string }) => (
  <svg viewBox="0 0 60 90" className={className} style={style} aria-hidden="true">
    <rect x="26" y="50" width="9" height="38" rx="4" fill="#8A5A3B" />
    <circle cx="16" cy="48" r="14" fill={c1} />
    <circle cx="45" cy="48" r="14" fill={c1} />
    <circle cx="30" cy="32" r="24" fill={c1} />
    <circle cx="23" cy="26" r="11" fill={c2} opacity=".7" />
    <circle cx="38" cy="38" r="3" fill="#FFC93C" />
    <circle cx="22" cy="40" r="3" fill="#FF7A66" />
  </svg>
);

export const Flower = ({ className, style, color = '#FFC93C' }: P & { color?: string }) => (
  <svg viewBox="0 0 40 60" className={className} style={style} aria-hidden="true">
    <path d="M20 26v32" stroke="#1FA67A" strokeWidth="3" strokeLinecap="round" />
    <path d="M20 46q-10-2-12-10 9 0 12 10ZM20 50q10-2 12-10-9 0-12 10Z" fill="#1FA67A" />
    {Array.from({ length: 6 }).map((_, i) => (
      <ellipse key={i} cx="20" cy="9" rx="6" ry="9" fill={color} transform={`rotate(${i * 60} 20 20)`} />
    ))}
    <circle cx="20" cy="20" r="6" fill="#FFF8EA" />
    <circle cx="20" cy="20" r="3" fill="#FF9A3C" />
  </svg>
);

export const Elephant = ({ className, style }: P) => (
  <svg viewBox="0 0 130 110" className={className} style={style} aria-hidden="true">
    <ellipse cx="68" cy="103" rx="48" ry="5" fill="#2B1A57" opacity=".12" />
    <rect x="52" y="78" width="16" height="24" rx="7" fill="#C9BCF0" />
    <rect x="86" y="78" width="16" height="24" rx="7" fill="#C9BCF0" />
    <ellipse cx="78" cy="68" rx="40" ry="31" fill="#D9CEF7" />
    <path d="M114 62q12 2 10 16" stroke="#C9BCF0" strokeWidth="5" fill="none" strokeLinecap="round" />
    <ellipse cx="52" cy="52" rx="19" ry="23" fill="#BFAEEC" />
    <circle cx="38" cy="56" r="25" fill="#E6DDFB" />
    <path d="M22 66q-14 8-11 28 1 7 9 5 5-1 3-8-2-11 10-17Z" fill="#E6DDFB" />
    <circle cx="30" cy="52" r="3.2" fill="#2B1A57" />
    <circle cx="31" cy="51" r="1" fill="#fff" />
    <ellipse cx="25" cy="64" rx="5" ry="3.5" fill="#FF7A66" opacity=".45" />
  </svg>
);

export const Rabbit = ({ className, style }: P) => (
  <svg viewBox="0 0 70 100" className={className} style={style} aria-hidden="true">
    <g stroke="#E8D3A0" strokeWidth="1.4">
      <ellipse cx="25" cy="22" rx="8" ry="22" fill="#FFF8EA" transform="rotate(-8 25 22)" />
      <ellipse cx="46" cy="22" rx="8" ry="22" fill="#FFF8EA" transform="rotate(10 46 22)" />
      <ellipse cx="36" cy="76" rx="26" ry="22" fill="#FFF8EA" />
      <circle cx="35" cy="52" r="20" fill="#FFF8EA" />
      <circle cx="60" cy="84" r="8" fill="#FFF8EA" />
    </g>
    <ellipse cx="25" cy="24" rx="3.6" ry="15" fill="#FFCDB8" transform="rotate(-8 25 24)" />
    <ellipse cx="46" cy="24" rx="3.6" ry="15" fill="#FFCDB8" transform="rotate(10 46 24)" />
    <circle cx="28" cy="50" r="2.8" fill="#2B1A57" />
    <circle cx="43" cy="50" r="2.8" fill="#2B1A57" />
    <ellipse cx="35.5" cy="57" rx="3" ry="2.2" fill="#FF7A66" />
    <path d="M35.5 59v3M31 63q4.5 3 9 0" stroke="#2B1A57" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    <ellipse cx="22" cy="58" rx="4" ry="3" fill="#FF7A66" opacity=".3" />
    <ellipse cx="49" cy="58" rx="4" ry="3" fill="#FF7A66" opacity=".3" />
  </svg>
);

export const Deer = ({ className, style }: P) => (
  <svg viewBox="0 0 110 120" className={className} style={style} aria-hidden="true">
    <ellipse cx="56" cy="116" rx="38" ry="4" fill="#2B1A57" opacity=".12" />
    {[30, 40, 68, 78].map((x) => (
      <rect key={x} x={x} y="88" width="6" height="28" rx="3" fill="#E08E3C" />
    ))}
    <ellipse cx="55" cy="78" rx="35" ry="22" fill="#F2A65A" />
    <path d="M70 66 84 38l14 6-8 34Z" fill="#F2A65A" />
    <circle cx="89" cy="34" r="14" fill="#F2A65A" />
    <ellipse cx="99" cy="40" rx="8" ry="6" fill="#FFE2B8" />
    <circle cx="103" cy="39" r="2" fill="#2B1A57" />
    <circle cx="90" cy="30" r="2.6" fill="#2B1A57" />
    <ellipse cx="79" cy="21" rx="4" ry="8" fill="#E08E3C" transform="rotate(-30 79 21)" />
    <ellipse cx="97" cy="18" rx="4" ry="8" fill="#E08E3C" transform="rotate(25 97 18)" />
    {[
      [42, 72],
      [56, 66],
      [66, 80],
      [48, 86],
      [34, 82],
    ].map(([x, y]) => (
      <circle key={`${x}${y}`} cx={x} cy={y} r="3" fill="#FFF8EA" opacity=".85" />
    ))}
    <ellipse cx="21" cy="72" rx="6" ry="9" fill="#FFF8EA" />
  </svg>
);

export const Bird = ({ className, style }: P) => (
  <svg viewBox="0 0 50 40" className={className} style={style} aria-hidden="true">
    <path d="M6 18 0 12l12 3Z" fill="#FF9A3C" />
    <ellipse cx="25" cy="22" rx="17" ry="13" fill="#FFC93C" />
    <circle cx="36" cy="16" r="9" fill="#FFC93C" />
    <path d="M44 15l6 3-6 3Z" fill="#FF7A66" />
    <circle cx="38" cy="14" r="1.8" fill="#2B1A57" />
    <path d="M14 24q10 10 22-2-10-6-22 2Z" fill="#FF9A3C" className="ambient" style={{ transformOrigin: '20px 22px', animation: 'flap .5s ease-in-out infinite alternate' }} />
  </svg>
);

export const Planet = ({ className, style, c1 = '#B8A6F0', c2 = '#27C4C4' }: P & { c1?: string; c2?: string }) => {
  const id = uid(useId());
  return (
    <svg viewBox="0 0 130 100" className={className} style={style} aria-hidden="true">
      <defs>
        <radialGradient id={`p${id}`} cx=".35" cy=".3" r=".85">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c2} />
        </radialGradient>
      </defs>
      <path d="M8 62C8 44 36 32 65 32s57 12 57 30" stroke="#FFC93C" strokeWidth="6" fill="none" opacity=".7" />
      <circle cx="65" cy="52" r="30" fill={`url(#p${id})`} />
      <ellipse cx="52" cy="40" rx="9" ry="5" fill="#fff" opacity=".3" transform="rotate(-25 52 40)" />
      <path d="M8 62c0 18 28 30 57 30s57-12 57-30" stroke="#FFC93C" strokeWidth="6" fill="none" strokeLinecap="round" />
    </svg>
  );
};

export const Chest = ({ className, style }: P) => (
  <svg viewBox="0 0 120 100" className={className} style={style} aria-hidden="true">
    <ellipse cx="60" cy="96" rx="50" ry="5" fill="#2B1A57" opacity=".15" />
    <rect x="12" y="44" width="96" height="48" rx="6" fill="#B86B2F" />
    <path d="M12 48Q12 10 60 10Q108 10 108 48Z" fill="#CF7F3A" />
    <rect x="12" y="44" width="96" height="8" fill="#FFC93C" />
    <rect x="26" y="13" width="9" height="79" fill="#E8B23A" />
    <rect x="85" y="13" width="9" height="79" fill="#E8B23A" />
    <rect x="51" y="38" width="18" height="22" rx="4" fill="#FFE08A" stroke="#C9A24E" strokeWidth="1.5" />
    <circle cx="60" cy="47" r="3.4" fill="#6F4E3A" />
    <rect x="58.6" y="48" width="2.8" height="8" rx="1" fill="#6F4E3A" />
    <circle cx="44" cy="26" r="4" fill="#8EE3C2" />
    <circle cx="60" cy="20" r="4" fill="#B8A6F0" />
    <circle cx="76" cy="26" r="4" fill="#27C4C4" />
  </svg>
);

export const Ornament = ({ className, dark }: { className?: string; dark?: boolean }) => (
  <div className={`flex items-center justify-center gap-3 ${className ?? ''}`} aria-hidden="true">
    <span className={`h-px w-12 bg-gradient-to-r from-transparent ${dark ? 'to-champagne' : 'to-gold'}`} />
    <Star className="h-4 w-4" />
    <span className={`h-px w-12 bg-gradient-to-l from-transparent ${dark ? 'to-champagne' : 'to-gold'}`} />
  </div>
);
