import { AnimatePresence, motion } from 'framer-motion';
import type { Music } from '../hooks/useMusic';

export default function MusicPlayer({ music, visible }: { music: Music; visible: boolean }) {
  const show = visible && music.available;
  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={music.toggle}
          aria-label={music.playing ? 'Pause background music' : 'Play background music'}
          aria-pressed={music.playing}
          className="glass fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-[120] flex h-12 w-12 items-center justify-center rounded-full"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          whileTap={{ scale: 0.92 }}
        >
          {music.playing ? (
            <span className="flex h-5 items-end gap-[3px]" aria-hidden="true">
              {[0, 0.25, 0.5, 0.15].map((d) => (
                <span
                  key={d}
                  className="h-full w-[3px] origin-bottom animate-eq rounded-full bg-gold-deep"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </span>
          ) : (
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-gold-deep" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
