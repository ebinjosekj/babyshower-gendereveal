import { useCallback, useEffect, useState } from 'react';
import { sfx } from '../lib/sfx';

// There is no background track: the page's sound is the set of sound effects that go with its animations (lib/sfx.ts).
// This hook is the sound on/off switch the buttons use. Sound is on by default; browsers keep it silent until the first
// tap, so "on" only means audible once sound has been unlocked.
export interface Music {
  on: boolean; // sound is unlocked and not muted
  muted: boolean;
  playing: boolean;
  volume: number;
  start: () => void; // unlock sound (call from a user gesture)
  toggle: () => void; // unlock if locked, otherwise mute/unmute
  toggleMute: () => void;
  setVolume: (v: number) => void;
}

export function useMusic(): Music {
  const [, bump] = useState(0);
  useEffect(() => {
    sfx.tryAuto();
    bump((n) => n + 1);
    return sfx.subscribe(() => bump((n) => n + 1));
  }, []);
  const start = useCallback(() => sfx.unlock(), []);
  const toggle = useCallback(() => {
    sfx.unlock();
    sfx.setMuted(!sfx.isMuted());
  }, []);
  const muted = sfx.isMuted();
  const on = !muted; // sound is meant to be on from the start; browsers only let it be heard after the first tap
  return { on, muted, playing: on, volume: 1, start, toggle, toggleMute: toggle, setVolume: () => undefined };
}
