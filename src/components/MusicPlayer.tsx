import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Music as MusicIcon, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { Music } from '../hooks/useMusic';

export default function MusicPlayer({ music, visible }: { music: Music; visible: boolean }) {
  const [open, setOpen] = useState(false);
  if (!visible) return null;

  return (
    <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 z-[60] flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="glass flex items-center gap-3 rounded-full py-2 pl-2 pr-5"
            role="group"
            aria-label="Music controls"
          >
            <button
              type="button"
              onClick={music.toggle}
              aria-label={music.playing ? 'Pause music' : 'Play music'}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE08A] to-tangerine text-plum"
            >
              {music.playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
            </button>
            <button
              type="button"
              onClick={music.toggleMute}
              aria-label={music.muted ? 'Unmute' : 'Mute'}
              aria-pressed={music.muted}
              className="flex h-10 w-10 items-center justify-center rounded-full text-plum hover:bg-sun/30"
            >
              {music.muted || music.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={music.muted ? 0 : music.volume}
              onChange={(e) => music.setVolume(parseFloat(e.target.value))}
              aria-label="Volume"
              className="h-1.5 w-24 cursor-pointer accent-tangerine"
            />
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Music"
        className="glass relative flex h-12 w-12 items-center justify-center rounded-full text-plum"
      >
        {music.playing && !music.muted && <span className="ambient pointer-events-none absolute inset-0 rounded-full border border-sun/70" style={{ animation: 'tickRing 2.2s ease-out infinite' }} aria-hidden="true" />}
        {music.playing && !music.muted ? (
          <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
            {[0, 0.25, 0.5, 0.15].map((d) => (
              <span key={d} className="ambient h-full w-[3px] origin-bottom animate-eq rounded-full bg-tangerine" style={{ animationDelay: `${d}s` }} />
            ))}
          </span>
        ) : (
          <MusicIcon size={20} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
