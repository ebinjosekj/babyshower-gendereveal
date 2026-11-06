import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useMotion } from '../context/MotionContext';
import { Bird, Butterfly, Chest, Cloud, Deer, Elephant, Flower, HotAirBalloon, Moon, Planet, Rabbit, Rainbow, Star, Tree } from './art';
import { SectionHead } from './ui';

const At = ({ x, y, w, children, className = '', style }: { x: number; y: number; w: number; children: ReactNode; className?: string; style?: CSSProperties }) => (
  <div className={`absolute ${className}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, ...style }}>
    {children}
  </div>
);

const SceneCloud = () => (
  <div className="relative h-full w-full">
    <At x={4} y={8} w={92}><Rainbow className="w-full" /></At>
    <At x={0} y={44} w={48}><Cloud className="w-full" /></At>
    <At x={52} y={52} w={46}><Cloud className="w-full" /></At>
    <At x={22} y={22} w={26} className="ambient animate-floaty"><HotAirBalloon className="w-full" /></At>
    <At x={62} y={14} w={20} className="ambient animate-floaty" style={{ animationDelay: '1s' }}>
      <HotAirBalloon className="w-full" colors={['#8EE3C2', '#B8A6F0', '#FFC93C', '#FF9A3C', '#27C4C4']} />
    </At>
    <At x={14} y={70} w={36}><Cloud className="w-full" /></At>
  </div>
);

const SceneForest = () => (
  <div className="relative h-full w-full">
    <At x={2} y={22} w={24}><Tree className="w-full" /></At>
    <At x={74} y={20} w={24}><Tree className="w-full" c1="#27C4C4" c2="#8EE3C2" /></At>
    <At x={28} y={30} w={18}><Tree className="w-full" c1="#FF9A3C" c2="#FFC93C" /></At>
    <At x={16} y={56} w={40}><Elephant className="w-full" /></At>
    <At x={56} y={58} w={16}><Rabbit className="w-full" /></At>
    <At x={70} y={52} w={26}><Deer className="w-full" /></At>
    <At x={44} y={12} w={12} className="ambient animate-floaty"><Bird className="w-full" /></At>
    <At x={62} y={30} w={11} className="ambient animate-floaty"><Butterfly className="w-full" /></At>
    <At x={8} y={84} w={8}><Flower className="w-full" color="#FFC93C" /></At>
    <At x={84} y={84} w={8}><Flower className="w-full" color="#B8A6F0" /></At>
  </div>
);

const SceneStarry = () => (
  <div className="relative h-full w-full">
    <At x={56} y={6} w={24}><Moon className="w-full drop-shadow-[0_0_18px_rgba(255,224,138,.9)]" /></At>
    <At x={6} y={18} w={42} className="ambient animate-floaty"><Planet className="w-full" /></At>
    <At x={44} y={56} w={40} className="ambient animate-floaty" style={{ animationDelay: '1.4s' }}><Planet className="w-full" c1="#FFC93C" c2="#FF7A66" /></At>
    {[
      [10, 8, 9], [86, 36, 10], [30, 6, 7], [20, 62, 8], [78, 80, 9], [48, 40, 6], [92, 14, 8], [4, 84, 9],
    ].map(([x, y, w], i) => (
      <At key={i} x={x} y={y} w={w} className="ambient" style={{ animation: `twinkle 3s ease-in-out ${i * 0.4}s infinite` }}>
        <Star className="w-full" />
      </At>
    ))}
  </div>
);

const SceneTreasure = () => (
  <div className="relative h-full w-full">
    <At x={26} y={36} w={48} className="ambient animate-floaty"><Chest className="w-full" /></At>
    <At x={6} y={52} w={11}><Flower className="w-full" color="#FFC93C" /></At>
    <At x={18} y={60} w={10}><Flower className="w-full" color="#FF7A66" /></At>
    <At x={74} y={56} w={11}><Flower className="w-full" color="#B8A6F0" /></At>
    <At x={86} y={50} w={10}><Flower className="w-full" color="#FF9A3C" /></At>
    {[
      [22, 84, '#8EE3C2'], [32, 90, '#B8A6F0'], [50, 88, '#FFC93C'], [66, 90, '#27C4C4'], [76, 84, '#FF7A66'],
    ].map(([x, y, c], i) => (
      <span key={i} className="absolute h-3 w-4 rounded-full" style={{ left: `${x}%`, top: `${y}%`, background: c as string }} />
    ))}
    {[
      [40, 20], [60, 16], [30, 30], [70, 30], [50, 8],
    ].map(([x, y], i) => (
      <At key={i} x={x} y={y} w={7} className="ambient" style={{ animation: `twinkle 2.4s ease-in-out ${i * 0.4}s infinite` }}>
        <Star className="w-full" />
      </At>
    ))}
  </div>
);

interface Dest {
  id: string;
  title: string;
  text: string;
  Scene: () => JSX.Element;
  bg: string;
  ring: string;
  dark?: boolean;
}

const DESTS: Dest[] = [
  {
    id: 'cloud',
    title: 'The Cloud Kingdom',
    text: 'A little happiness is floating our way.',
    Scene: SceneCloud,
    bg: 'linear-gradient(180deg,#B8A6F0 0%,#FFD6A8 55%,#FFF1C9 100%)',
    ring: '#B8A6F0',
  },
  {
    id: 'forest',
    title: 'The Enchanted Forest',
    text: 'A tiny explorer is about to join our world.',
    Scene: SceneForest,
    bg: 'linear-gradient(180deg,#8EE3C2 0%,#D9F5E8 50%,#FFF1C9 100%)',
    ring: '#1FA67A',
  },
  {
    id: 'starry',
    title: 'The Starry Valley',
    text: 'Our universe is about to become a little brighter.',
    Scene: SceneStarry,
    bg: 'linear-gradient(180deg,#1B0F3A 0%,#4A2A8C 55%,#8E74E0 100%)',
    ring: '#FFC93C',
    dark: true,
  },
  {
    id: 'treasure',
    title: 'The Treasure Island',
    text: 'A beautiful surprise is waiting for us!',
    Scene: SceneTreasure,
    bg: 'linear-gradient(180deg,#FFF1C9 0%,#FFC93C 55%,#FF9A3C 100%)',
    ring: '#FF9A3C',
  },
];

export default function WorldMap() {
  const { simple } = useMotion();
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % DESTS.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i + DESTS.length - 1) % DESTS.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const d = open !== null ? DESTS[open] : null;

  return (
    <section
      id="world"
      aria-label="Explore the wonder world"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#2B1A57_0%,#27C4C4_9%,#8EE3C2_48%,#FFF1C9_100%)] px-5 pb-28 pt-36 sm:pt-44"
    >
      <Cloud className="ambient pointer-events-none absolute left-0 top-[20%] w-48 opacity-90 sm:w-80" style={{ animation: 'drift 90s linear infinite' }} />
      <Cloud className="ambient pointer-events-none absolute left-0 top-[62%] w-40 sm:w-64" style={{ animation: 'drift 70s linear -30s infinite' }} />

      <SectionHead kicker="Explore the wonder world" title="Four Magical Places To Discover" sub="Tap an island to travel there." />

      <div className="relative z-10 mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-8 lg:grid-cols-4">
        {DESTS.map((dest, i) => (
          <button
            key={dest.id}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`Visit ${dest.title}`}
            className="group ambient animate-floaty text-center focus:outline-none"
            style={{ animationDelay: `${i * 0.6}s`, animationDuration: `${5.5 + i * 0.5}s` }}
          >
            <div
              className="relative mx-auto aspect-square w-full max-w-[250px] overflow-hidden rounded-[42%_58%_46%_54%/52%_44%_56%_48%] border-4 shadow-[0_26px_40px_-20px_rgba(43,26,87,.6)] transition duration-500 group-hover:scale-105 group-focus-visible:ring-4 group-focus-visible:ring-sun"
              style={{ background: dest.bg, borderColor: dest.ring }}
            >
              <dest.Scene />
            </div>
            <div className="mx-auto -mt-2 h-4 w-3/5 rounded-full bg-plum/15 blur-md" aria-hidden="true" />
            <p className="mt-3 font-display text-lg font-semibold leading-tight text-plum sm:text-xl">{dest.title}</p>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald">Tap to explore</p>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {d && open !== null && (
          <motion.div
            key="destination"
            data-lenis-prevent
            className="fixed inset-0 z-[150] flex flex-col items-center justify-center overflow-y-auto px-6 py-16 text-center"
            style={{ background: d.bg }}
            initial={{ clipPath: simple ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 60%)', opacity: simple ? 0 : 1 }}
            animate={{ clipPath: 'circle(150% at 50% 50%)', opacity: 1 }}
            exit={{ clipPath: simple ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)', opacity: simple ? 0 : 1 }}
            transition={{ duration: simple ? 0.2 : 0.9, ease: [0.65, 0, 0.35, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={d.title}
          >
            <motion.div
              key={d.id}
              className="relative aspect-square w-[min(82vw,420px)]"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: simple ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <d.Scene />
            </motion.div>
            <motion.h3
              key={`t${d.id}`}
              className={`mt-6 font-display text-4xl font-semibold sm:text-6xl ${d.dark ? 'text-ivory' : 'text-plum'}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: simple ? 0 : 0.6, duration: 0.7 }}
            >
              {d.title}
            </motion.h3>
            <motion.p
              key={`p${d.id}`}
              className={`mt-3 max-w-md font-display text-xl italic sm:text-2xl ${d.dark ? 'text-champagne' : 'text-ink'}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: simple ? 0 : 0.8, duration: 0.7 }}
            >
              “{d.text}”
            </motion.p>

            <div className="mt-8 flex items-center gap-4">
              <button type="button" aria-label="Previous place" onClick={() => setOpen((open + DESTS.length - 1) % DESTS.length)} className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/90 text-plum shadow-lg">
                <ChevronLeft />
              </button>
              <span className={`font-display text-sm tracking-[0.3em] ${d.dark ? 'text-ivory' : 'text-plum'}`}>
                {open + 1} / {DESTS.length}
              </span>
              <button type="button" aria-label="Next place" onClick={() => setOpen((open + 1) % DESTS.length)} className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory/90 text-plum shadow-lg">
                <ChevronRight />
              </button>
            </div>
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-ivory/90 text-plum shadow-lg">
              <X />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
