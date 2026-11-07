import { Volume2, VolumeX } from 'lucide-react';
import type { Music } from '../hooks/useMusic';

// A single sound on/off button for the animation sound effects.
export default function MusicPlayer({ music, visible }: { music: Music; visible: boolean }) {
  if (!visible) return null;
  const on = !music.muted;
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[60]">
      <button
        type="button"
        onClick={music.toggleMute}
        aria-label={on ? 'Turn sound off' : 'Turn sound on'}
        aria-pressed={on}
        className="glass relative flex h-12 w-12 items-center justify-center rounded-full text-plum"
      >
        {on && <span className="ambient pointer-events-none absolute inset-0 rounded-full border border-sun/70" style={{ animation: 'tickRing 2.6s ease-out infinite' }} aria-hidden="true" />}
        {on ? <Volume2 size={20} aria-hidden="true" /> : <VolumeX size={20} aria-hidden="true" />}
      </button>
    </div>
  );
}
