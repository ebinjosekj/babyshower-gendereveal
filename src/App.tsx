import { lazy, Suspense, useEffect, useState } from 'react';
import Opening from './components/Opening';
import Nav from './components/Nav';
import MusicPlayer from './components/MusicPlayer';
import Intro from './components/Intro';
import { ScrollOrb } from './components/Orb';
import Countdown from './components/Countdown';
import Atmosphere from './components/Atmosphere';
import Extras from './components/Extras';
import { Divider, SwipeCue } from './components/ui';
import { MotionProvider, useMotion } from './context/MotionContext';
import { useMusic } from './hooks/useMusic';
import { useSmoothScroll } from './hooks/useSmoothScroll';

// Everything below the fold loads on demand so the opening appears fast on phones.
const RevealGame = lazy(() => import('./components/RevealGame'));
const EventDetails = lazy(() => import('./components/EventDetails'));
const Rsvp = lazy(() => import('./components/Rsvp'));
const Finale = lazy(() => import('./components/Finale'));
const AdminApp = lazy(() => import('./components/admin/AdminApp'));

function Experience() {
  const { simple } = useMotion();
  const [entered, setEntered] = useState(false);
  const [showOpening, setShowOpening] = useState(true);
  // the heavy sparkle layer waits until the opening has finished fading, so the hand-over stays smooth
  const [calm, setCalm] = useState(false);
  useEffect(() => {
    if (!entered) {
      setCalm(false);
      return;
    }
    const id = window.setTimeout(() => setCalm(true), 3200);
    return () => window.clearTimeout(id);
  }, [entered]);
  const music = useMusic();
  useSmoothScroll(entered, !simple);

  const replay = () => {
    window.scrollTo(0, 0);
    setEntered(false);
    setShowOpening(true);
  };

  return (
    <>
      {showOpening && <Opening onStartMusic={music.start} onEnter={() => setEntered(true)} onDone={() => setShowOpening(false)} />}
      {entered && <ScrollOrb />}
      {entered && calm && !simple && <Atmosphere />}
      {entered && !simple && <Extras />}
      <Nav visible={entered} />
      <MusicPlayer music={music} visible={entered} />

      <main className="relative z-10">
        <Intro entered={entered} />
        <SwipeCue to="countdown" />
        <Countdown />
        <SwipeCue to="reveal" />
        <Suspense fallback={<div className="min-h-[100svh]" aria-hidden="true" />}>
          <Divider />
          <RevealGame />
          <SwipeCue to="details" />
          <Divider />
          <EventDetails />
          <SwipeCue to="rsvp" />
          <Divider />
          <Rsvp />
          <SwipeCue to="finale" />
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
        <Suspense fallback={<div className="p-10 text-center font-display text-ocean">Loading…</div>}>
          <AdminApp />
        </Suspense>
      ) : (
        <Experience />
      )}
    </MotionProvider>
  );
}
