import { Volume2, VolumeX } from 'lucide-react';
import type { Music } from '../hooks/useMusic';

// The sound on/off button, bottom right, visible from the very first screen (above the opening overlay).
export default function MusicPlayer({ music }: { music: Music; visible?: boolean }) {
  const label = music.on ? 'Mute sound' : music.muted ? 'Turn sound on' : 'Tap for sound';
  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[130]">
      <button
        type="button"
        onClick={music.toggle}
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
