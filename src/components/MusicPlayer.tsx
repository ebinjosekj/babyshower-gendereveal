import { useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import type { Music } from '../hooks/useMusic';
import { sfx } from '../lib/sfx';

// The sound on/off button, bottom right, visible from the very first screen (above the opening overlay).
export default function MusicPlayer({ music }: { music: Music; visible?: boolean }) {
  const wasLocked = useRef(false);
  const label = !music.on ? (music.muted ? 'Turn sound on' : 'Tap for sound') : 'Turn sound off';
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[130]">
      <button
        type="button"
        // a first tap both unlocks sound and must leave it ON, so remember whether it was locked before the page-wide unlock runs
        onPointerDownCapture={() => {
          wasLocked.current = !sfx.running();
        }}
        onClick={() => {
          if (wasLocked.current) {
            sfx.setMuted(false);
            sfx.unlock();
          } else music.toggle();
        }}
        aria-label={label}
        aria-pressed={music.on}
        className="glass relative flex h-12 w-12 items-center justify-center rounded-full text-plum"
      >
        {music.on && <span className="ambient pointer-events-none absolute inset-0 rounded-full border border-sun/70" style={{ animation: 'tickRing 2.6s ease-out infinite' }} aria-hidden="true" />}
        {music.on ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}
