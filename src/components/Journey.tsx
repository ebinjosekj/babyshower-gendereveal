import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useMotion } from '../context/MotionContext';
import { CloudLayer, Motes, SKY } from './atmosphere';
import { Balloon, Butterfly, CastleIsland, FloatingIsland, GardenIsland, Mist, RainbowArch, Tree, Flowers } from './world';

const SCENES = [
  { id: 'garden', name: 'Garden of Love', line: 'Love is what makes a family.', sky: SKY.day },
  { id: 'bridge', name: 'Dream Bridge', line: 'Every new beginning brings infinite possibilities.', sky: SKY.golden },
  { id: 'castle', name: 'Golden Destination', line: 'Our most beautiful chapter is about to begin.', sky: SKY.dusk },
] as const;

function Art({ i }: { i: number }) {
  if (i === 0)
    return (
      <>
        <CloudLayer count={3} seed={71} depth={0.3} top={[4, 30]} />
        <Butterfly className="ambient absolute left-0 top-[40%] w-9" style={{ animation: 'flyAcross 24s linear infinite' }} />
        <Butterfly className="ambient absolute left-0 top-[52%] w-7" a="#F0B94B" b="#8974BD" style={{ animation: 'flyBack 30s linear -9s infinite' }} />
        <div className="absolute inset-x-0 bottom-[8%] mx-auto w-[min(100vw,600px)]">
          <div className="ambient" style={{ animation: 'bob 10s ease-in-out infinite' }}>
            <GardenIsland className="w-full drop-shadow-[0_28px_30px_rgba(10,35,45,.5)]" />
          </div>
        </div>
      </>
    );
  if (i === 1)
    return (
      <>
        <CloudLayer count={3} seed={81} depth={0.25} top={[4, 28]} />
        <div className="absolute left-[-12%] bottom-[16%] w-[48%] max-w-[300px]">
          <FloatingIsland className="w-full" falls={[330]}>
            <Tree x={70} y={126} s={0.9} tone={2} />
            <Flowers x={200} y={134} w={100} n={10} seed={7} />
          </FloatingIsland>
        </div>
        <div className="absolute right-[-12%] bottom-[16%] w-[48%] max-w-[300px]">
          <FloatingIsland className="w-full" falls={[80]}>
            <Tree x={320} y={126} s={0.9} tone={1} blossom />
            <Flowers x={190} y={134} w={100} n={10} seed={17} />
          </FloatingIsland>
        </div>
        <div className="absolute inset-x-0 bottom-[38%] mx-auto w-[min(130vw,900px)]" style={{ left: 0, right: 0 }}>
          <RainbowArch className="w-full opacity-95" />
        </div>
        <Balloon className="ambient absolute left-[40%] top-[24%] w-14 sm:w-20" colors={['#8974BD', '#F1E8D6']} style={{ animation: 'bob 9s ease-in-out infinite' }} />
        <Balloon className="ambient absolute right-[14%] top-[34%] w-10" colors={['#E98C56', '#F0B94B']} style={{ animation: 'bob 12s ease-in-out -3s infinite' }} />
        <CloudLayer count={4} seed={91} depth={0.95} top={[72, 96]} />
      </>
    );
  return (
    <>
      <Motes count={22} seed={13} />
      <div className="absolute inset-x-0 bottom-[8%] mx-auto w-[min(100vw,620px)]">
        <div className="ambient" style={{ animation: 'bob 11s ease-in-out infinite' }}>
          <CastleIsland className="w-full drop-shadow-[0_30px_36px_rgba(0,0,0,.5)]" />
        </div>
      </div>
      <Balloon className="ambient absolute left-[8%] top-[26%] w-12 sm:w-16" colors={['#F0B94B', '#F1E8D6']} style={{ animation: 'bob 10s ease-in-out infinite' }} />
      <CloudLayer count={3} seed={101} depth={0.9} top={[78, 98]} />
    </>
  );
}

function Copy({ i }: { i: number }) {
  return (
    <div className="absolute inset-x-0 top-[9%] z-10 px-5 text-center">
      <p className="kicker !text-sun">
        {i + 1} · {SCENES[i].name}
      </p>
      <p className="mx-auto mt-3 max-w-xl font-display text-[8.2vw] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-ivory [text-shadow:0_3px_22px_rgba(10,35,45,.65)] sm:text-5xl">
        {SCENES[i].line}
      </p>
    </div>
  );
}

function Layer({ i, p, children }: { i: number; p: MotionValue<number>; children: ReactNode }) {
  const ranges: [number[], number[]][] = [
    [[0, 0.3, 0.38], [1, 1, 0]],
    [[0.3, 0.4, 0.6, 0.7], [0, 1, 1, 0]],
    [[0.62, 0.72, 1], [0, 1, 1]],
  ];
  const sc: [number[], number[]][] = [
    [[0, 0.38], [1, 0.82]],
    [[0.3, 0.42, 0.7], [1.25, 1, 0.82]],
    [[0.62, 0.74, 1], [1.25, 1, 1]],
  ];
  const opacity = useTransform(p, ranges[i][0], ranges[i][1]);
  const scale = useTransform(p, sc[i][0], sc[i][1]);
  return (
    <motion.div className="absolute inset-0" style={{ opacity, background: SCENES[i].sky }}>
      <motion.div className="absolute inset-0" style={{ scale, transformOrigin: '50% 70%' }}>
        {children}
      </motion.div>
      <Copy i={i} />
    </motion.div>
  );
}

// The camera glides from the garden, over the rainbow bridge, to the castle — driven by scroll.
export default function Journey() {
  const ref = useRef<HTMLElement>(null);
  const { simple } = useMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const ribbon = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  if (simple) {
    // simplified mode: three calm, stacked scenes
    return (
      <section id="journey" aria-label="The grand rainbow journey">
        {SCENES.map((sc, i) => (
          <div key={sc.id} className="relative h-[100svh] min-h-[560px] overflow-hidden" style={{ background: sc.sky }}>
            <Art i={i} />
            <Mist className="absolute inset-x-0 bottom-0 h-[14%] w-full" />
            <Copy i={i} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section ref={ref} id="journey" aria-label="The grand rainbow journey" className="relative h-[360svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {SCENES.map((_, i) => (
          <Layer key={i} i={i} p={scrollYProgress}>
            <Art i={i} />
          </Layer>
        ))}
        <Mist className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[12%] w-full" />
        <div className="pointer-events-none absolute inset-x-8 bottom-5 z-20 h-1 overflow-hidden rounded-full bg-ivory/25" aria-hidden="true">
          <motion.div className="h-full rounded-full bg-gradient-to-r from-coral via-sun to-turquoise" style={{ width: ribbon }} />
        </div>
      </div>
    </section>
  );
}
