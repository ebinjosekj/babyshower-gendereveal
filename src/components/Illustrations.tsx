import type { CSSProperties } from 'react';

// Hand-built gold / ivory SVG illustrations. No pink, no blue.

interface P {
  className?: string;
  style?: CSSProperties;
}

const GoldDefs = ({ id }: { id: string }) => (
  <defs>
    <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#F6E4B0" />
      <stop offset=".5" stopColor="#D8B469" />
      <stop offset="1" stopColor="#A9822F" />
    </linearGradient>
  </defs>
);

export const Teddy = ({ className, style }: P) => (
  <svg viewBox="0 0 200 230" className={className} style={style} role="img" aria-label="Teddy bear">
    <defs>
      <radialGradient id="fur" cx=".4" cy=".3" r=".9">
        <stop offset="0" stopColor="#F1DDB4" />
        <stop offset="1" stopColor="#CDA66A" />
      </radialGradient>
      <linearGradient id="bow" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#F6E4B0" />
        <stop offset="1" stopColor="#B8903A" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="222" rx="62" ry="6" fill="#4A3626" opacity=".12" />
    <circle cx="52" cy="46" r="23" fill="url(#fur)" />
    <circle cx="148" cy="46" r="23" fill="url(#fur)" />
    <circle cx="52" cy="46" r="11" fill="#E8D3B0" />
    <circle cx="148" cy="46" r="11" fill="#E8D3B0" />
    <ellipse cx="100" cy="162" rx="52" ry="54" fill="url(#fur)" />
    <ellipse cx="100" cy="170" rx="31" ry="35" fill="#F6EAD2" />
    <ellipse cx="68" cy="208" rx="24" ry="14" fill="url(#fur)" />
    <ellipse cx="132" cy="208" rx="24" ry="14" fill="url(#fur)" />
    <ellipse cx="68" cy="210" rx="12" ry="7" fill="#E8D3B0" />
    <ellipse cx="132" cy="210" rx="12" ry="7" fill="#E8D3B0" />
    <ellipse cx="50" cy="156" rx="16" ry="27" transform="rotate(24 50 156)" fill="url(#fur)" />
    <ellipse cx="150" cy="156" rx="16" ry="27" transform="rotate(-24 150 156)" fill="url(#fur)" />
    <circle cx="100" cy="76" r="53" fill="url(#fur)" />
    <ellipse cx="100" cy="94" rx="23" ry="18" fill="#F6EAD2" />
    <ellipse cx="100" cy="85" rx="7.5" ry="5.5" fill="#6B4A2B" />
    <path d="M100 90v6M100 96q-6 6-12 2M100 96q6 6 12 2" stroke="#6B4A2B" strokeWidth="2.4" fill="none" strokeLinecap="round" />
    <circle cx="81" cy="68" r="5" fill="#4A3320" />
    <circle cx="119" cy="68" r="5" fill="#4A3320" />
    <circle cx="82.8" cy="66.2" r="1.7" fill="#fff" />
    <circle cx="120.8" cy="66.2" r="1.7" fill="#fff" />
    <circle cx="68" cy="90" r="7" fill="#E4C08E" opacity=".6" />
    <circle cx="132" cy="90" r="7" fill="#E4C08E" opacity=".6" />
    <path d="M100 127 78 114v26zM100 127l22-13v26z" fill="url(#bow)" />
    <circle cx="100" cy="127" r="6.5" fill="#9A7A2F" />
  </svg>
);

export const Cloud = ({ className, style }: P) => (
  <svg viewBox="0 0 220 110" className={className} style={style} aria-hidden="true">
    <defs>
      <linearGradient id="cloud" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#FFFEFA" />
        <stop offset="1" stopColor="#F0E4CC" />
      </linearGradient>
    </defs>
    <path
      d="M44 92a28 28 0 0 1 3-55 36 36 0 0 1 68-8 31 31 0 0 1 54 16 25 25 0 0 1 9 47Z"
      fill="url(#cloud)"
    />
  </svg>
);

export const Moon = ({ className, style }: P) => (
  <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden="true">
    <GoldDefs id="moon" />
    <mask id="moonmask">
      <rect width="100" height="100" fill="#fff" />
      <circle cx="66" cy="42" r="36" fill="#000" />
    </mask>
    <circle cx="46" cy="52" r="38" fill="url(#moon-gold)" mask="url(#moonmask)" />
  </svg>
);

export const Star = ({ className, style }: P) => (
  <svg viewBox="0 0 20 20" className={className} style={style} aria-hidden="true">
    <GoldDefs id="star" />
    <path d="M10 0Q11 9 20 10Q11 11 10 20Q9 11 0 10Q9 9 10 0Z" fill="url(#star-gold)" />
  </svg>
);

export const Balloon = ({ className, style, pearl }: P & { pearl?: boolean }) => (
  <svg viewBox="0 0 80 160" className={className} style={style} aria-hidden="true">
    <defs>
      <radialGradient id={pearl ? 'bl-pearl' : 'bl-gold'} cx=".35" cy=".3" r=".8">
        <stop offset="0" stopColor={pearl ? '#FFFEFA' : '#FBEDC0'} />
        <stop offset=".6" stopColor={pearl ? '#EADFC9' : '#D8B469'} />
        <stop offset="1" stopColor={pearl ? '#CDBB98' : '#A9822F'} />
      </radialGradient>
    </defs>
    <ellipse cx="40" cy="48" rx="34" ry="42" fill={`url(#${pearl ? 'bl-pearl' : 'bl-gold'})`} />
    <ellipse cx="28" cy="32" rx="7" ry="12" fill="#fff" opacity=".45" transform="rotate(20 28 32)" />
    <path d="m40 90-6 8h12z" fill={pearl ? '#CDBB98' : '#A9822F'} />
    <path d="M40 98c-8 18 8 28 0 60" stroke="#9A7A2F" strokeWidth="1.2" fill="none" opacity=".7" />
  </svg>
);

export const Shoes = ({ className, style }: P) => (
  <svg viewBox="0 0 200 70" className={className} style={style} aria-hidden="true">
    <GoldDefs id="shoe" />
    {[0, 100].map((x) => (
      <g key={x} transform={`translate(${x} 0)`}>
        <path
          d="M10 44c0-19 14-28 29-26 9 1 14 8 22 10 14 3 34 5 34 20 0 7-4 11-12 11H22c-8 0-12-5-12-15Z"
          fill="url(#shoe-gold)"
        />
        <rect x="10" y="54" width="85" height="9" rx="4.5" fill="#F6EEDF" stroke="#C9A24E" strokeWidth="1.2" />
        <path d="M36 22q8 4 16 2M32 30q10 4 22 2" stroke="#fff" strokeOpacity=".7" strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="66" cy="31" r="4.5" fill="#F6EEDF" />
      </g>
    ))}
  </svg>
);

export const Crown = ({ className, style }: P) => (
  <svg viewBox="0 0 64 48" className={className} style={style} aria-hidden="true">
    <GoldDefs id="crown" />
    <path d="M6 38 4 12l15 13L32 6l13 19L60 12l-2 26Z" fill="url(#crown-gold)" />
    <rect x="6" y="38" width="52" height="6" rx="3" fill="#9A7A2F" />
    <circle cx="32" cy="8" r="3" fill="#FBEDC0" />
  </svg>
);

export const Bow = ({ className, style }: P) => (
  <svg viewBox="0 0 64 44" className={className} style={style} aria-hidden="true">
    <GoldDefs id="bow2" />
    <path d="M32 22 6 6v32zM32 22l26-16v32z" fill="url(#bow2-gold)" />
    <path d="M22 36 16 44M42 36l6 8" stroke="#B8903A" strokeWidth="3" strokeLinecap="round" />
    <circle cx="32" cy="22" r="6" fill="#9A7A2F" />
  </svg>
);

export const Ornament = ({ className }: P) => (
  <div className={`flex items-center justify-center gap-3 ${className ?? ''}`} aria-hidden="true">
    <span className="h-px w-14 bg-gradient-to-r from-transparent to-gold" />
    <Star className="h-4 w-4" />
    <span className="h-px w-14 bg-gradient-to-l from-transparent to-gold" />
  </div>
);
