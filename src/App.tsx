import { lazy, Suspense, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Envelope from './components/Envelope';
import Particles from './components/Particles';
import Hero from './components/Hero';
import Story from './components/Story';
import Countdown from './components/Countdown';
import Details from './components/Details';
import Closing from './components/Closing';
import MusicPlayer from './components/MusicPlayer';
import { GuestProvider } from './context/GuestContext';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useMusic } from './hooks/useMusic';

// Below-the-fold sections load on demand (keeps the first paint fast on mobile).
const MapSection = lazy(() => import('./components/MapSection'));
const Voting = lazy(() => import('./components/Voting'));
const Rsvp = lazy(() => import('./components/Rsvp'));
const Gallery = lazy(() => import('./components/Gallery'));

export default function App() {
  const [opened, setOpened] = useState(false);
  const music = useMusic();
  useSmoothScroll(opened);

  return (
    <GuestProvider>
      <Particles />
      <AnimatePresence>
        {!opened && <Envelope key="envelope" onSeal={music.start} onOpened={() => setOpened(true)} />}
      </AnimatePresence>

      <main className="relative z-10">
        <Hero active={opened} />
        <Story />
        <Countdown />
        <Details />
        <Suspense fallback={<div className="min-h-[60vh]" aria-hidden="true" />}>
          <MapSection />
          <Voting />
          <Rsvp />
          <Gallery />
        </Suspense>
        <Closing />
      </main>

      <MusicPlayer music={music} visible={opened} />
    </GuestProvider>
  );
}
