import { CloudLayer, Meadow, Motes, SKY } from './atmosphere';
import { Reveal } from './ui';
import { Balloon, Butterfly, ExplorerIsland, Mist } from './world';

export default function Explorer() {
  return (
    <section id="explorer" aria-label="The little explorer" className="relative overflow-hidden px-5 pb-36 pt-24 sm:pt-32" style={{ background: SKY.day }}>
      <CloudLayer count={4} seed={51} depth={0.3} top={[0, 35]} />
      <Motes count={14} seed={61} />
      <Balloon className="ambient absolute right-[6%] top-[14%] w-14 sm:w-20" colors={['#E98C56', '#F1E8D6']} style={{ animation: 'bob 11s ease-in-out infinite' }} />
      <Butterfly className="ambient absolute left-0 top-[52%] w-8" style={{ animation: 'flyAcross 30s linear infinite' }} />

      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="kicker !text-ivory">The little explorer</p>
          <h2 className="mt-4 font-display text-4xl font-semibold uppercase leading-[1.08] text-ivory [text-shadow:0_3px_22px_rgba(10,35,45,.55)] sm:text-6xl">
            A tiny explorer
            <br />
            <span className="text-sun">is on the way.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-md font-display text-xl italic text-ivory [text-shadow:0_2px_14px_rgba(10,35,45,.65)] sm:text-2xl">
            A whole world of love, happiness and adventures is waiting.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="relative mx-auto mt-10 w-[min(96vw,620px)]">
          <div className="ambient" style={{ animation: 'bob 10s ease-in-out infinite' }}>
            <ExplorerIsland className="w-full drop-shadow-[0_30px_34px_rgba(10,35,45,.5)]" />
          </div>
        </Reveal>
      </div>
      <Mist className="absolute inset-x-0 bottom-0 h-[14%] w-full" />
      <Meadow className="pointer-events-none absolute inset-x-0 bottom-0 h-[8%] w-full" />
    </section>
  );
}
