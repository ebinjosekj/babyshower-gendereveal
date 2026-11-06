import { lazy, Suspense, useEffect, useState } from 'react';
import Opening from './components/Opening';
import Nav from './components/Nav';
import MusicPlayer from './components/MusicPlayer';
import Adventure from './components/Adventure';
import Countdown from './components/Countdown';
import { MotionProvider, useMotion } from './context/MotionContext';
import { useMusic } from './hooks/useMusic';
import { useSmoothScroll } from './hooks/useSmoothScroll';

// Everything below the fold loads on demand so the opening appears fast on phones.
const WorldMap = lazy(() => import('./components/WorldMap'));
const RevealGame = lazy(() => import('./components/RevealGame'));
const EventDetails = lazy(() => import('./components/EventDetails'));
const Rsvp = lazy(() => import('./components/Rsvp'));
const Gallery = lazy(() => import('./components/Gallery'));
const Finale = lazy(() => import('./components/Finale'));
const AdminApp = lazy(() => import('./components/admin/AdminApp'));

function Experience() {
  const { simple } = useMotion();
  const [entered, setEntered] = useState(false);
  const music = useMusic();
  useSmoothScroll(entered, !simple);

  const replay = () => {
    window.scrollTo(0, 0);
    setEntered(false);
  };

  return (
    <>
      {!entered && <Opening onStartMusic={music.start} onEnter={() => setEntered(true)} />}
      <Nav visible={entered} />
      <MusicPlayer music={music} visible={entered} />

      <main>
        <Adventure />
        <Countdown />
        <Suspense fallback={<div className="min-h-[100svh]" aria-hidden="true" />}>
          <WorldMap />
          <RevealGame />
          <EventDetails />
          <Rsvp />
          <Gallery />
          <Finale onReplay={replay} />
        </Suspense>
      </main>
    </>
  );
}

const isAdminHash = () => window.location.hash.startsWith('#/admin');

export default function App() {
  const [admin, setAdmin] = useState(isAdminHash);
  useEffect(() => {
    const on = () => setAdmin(isAdminHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  return (
    <MotionProvider>
      {admin ? (
        <Suspense fallback={<div className="p-10 text-center font-display text-plum">Loading…</div>}>
          <AdminApp />
        </Suspense>
      ) : (
        <Experience />
      )}
    </MotionProvider>
  );
}
