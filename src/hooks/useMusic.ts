import { useCallback, useState } from 'react';
import { sfx } from '../lib/sfx';

// There is no background track any more: the page's sound is the set of sound effects that go with its animations
// (see lib/sfx.ts). This hook keeps the same shape the rest of the app uses, now as a simple sound on/off switch.
export interface Music {
  playing: boolean;
  muted: boolean;
  volume: number;
  start: () => void; // unlock sound (call from a user gesture)
  toggle: () => void;
  toggleMute: () => void;
  setVolume: (v: number) => void;
}

export function useMusic(): Music {
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);
  const start = useCallback(() => {
    sfx.unlock();
    setStarted(true);
  }, []);
  const toggleMute = useCallback(() => {
    sfx.unlock();
    setMuted((m) => !m);
  }, []);
  return { playing: started && !muted, muted, volume: 1, start, toggle: toggleMute, toggleMute, setVolume: () => undefined };
}
