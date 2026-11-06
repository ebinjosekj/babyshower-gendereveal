import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '../lib/gsap';
import { MUSIC_SRC } from '../config';

export interface Music {
  playing: boolean;
  available: boolean;
  start: () => void;
  toggle: () => void;
}

// start() must be called from a user gesture (the envelope seal tap) so mobile
// browsers allow playback.
export function useMusic(): Music {
  const audio = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const a = new Audio();
    a.src = MUSIC_SRC;
    a.loop = true;
    a.preload = 'none';
    a.volume = 0;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => {
      setAvailable(false);
      setPlaying(false);
    };
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    a.addEventListener('error', onError);
    audio.current = a;
    return () => {
      a.pause();
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
      a.removeEventListener('error', onError);
      audio.current = null;
    };
  }, []);

  const start = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    a.volume = 0;
    a.play()
      .then(() => gsap.to(a, { volume: 0.5, duration: 2.5, ease: 'power1.inOut' }))
      .catch(() => {
        /* blocked or missing file — the error event hides the button if missing */
      });
  }, []);

  const toggle = useCallback(() => {
    const a = audio.current;
    if (!a) return;
    if (a.paused) {
      start();
    } else {
      gsap.to(a, { volume: 0, duration: 0.6, onComplete: () => a.pause() });
    }
  }, [start]);

  return { playing, available, start, toggle };
}
