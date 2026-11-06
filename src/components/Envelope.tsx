import { useState } from 'react';
import { motion } from 'framer-motion';
import { EVENT } from '../config';
import { Star } from './Illustrations';

interface Props {
  onSeal: () => void; // called inside the tap (unlocks audio on mobile)
  onOpened: () => void; // called when the camera "dives" into the invitation
}

// 3D envelope: tap the wax seal → flap flips open → letter rises → we dive in.
export default function Envelope({ onSeal, onOpened }: Props) {
  const [stage, setStage] = useState(0); // 0 closed · 1 flap · 2 letter · 3 leaving

  const open = () => {
    if (stage !== 0) return;
    onSeal();
    setStage(1);
    window.setTimeout(() => setStage(2), 900);
    window.setTimeout(() => {
      setStage(3);
      onOpened();
    }, 2400);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_50%_30%,#FFFDF8_0%,#F6EEDF_55%,#E9DCC3_100%)]"
      exit={{ opacity: 0, transition: { duration: 1.2, ease: 'easeInOut' } }}
    >
      <motion.p
        className="mb-10 font-sans text-[11px] uppercase tracking-[0.55em] text-gold-deep"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 0 ? 1 : 0 }}
        transition={{ duration: 0.8, delay: stage === 0 ? 0.4 : 0 }}
      >
        You are invited
      </motion.p>

      <motion.div
        style={{ perspective: 1600 }}
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={stage === 3 ? { scale: 2.6, opacity: 0, y: 0 } : { scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: stage === 3 ? 1.3 : 1.1, ease: [0.7, 0, 0.3, 1] }}
      >
        <div
          className="relative aspect-[4/3] w-[min(86vw,460px)]"
          style={{ transformStyle: 'preserve-3d', filter: 'drop-shadow(0 30px 38px rgba(74,54,38,.35))' }}
        >
          {/* back of envelope */}
          <div className="absolute inset-0 rounded-md bg-gradient-to-b from-[#E4D2AA] to-[#D2BA88]" />

          {/* the letter */}
          <motion.div
            className="absolute inset-x-[6%] bottom-[8%] top-[8%] rounded-sm border border-gold/40 bg-gradient-to-b from-[#FFFEFA] to-[#F6EEDF] px-4 pt-5 text-center shadow-md"
            style={{ zIndex: 10 }}
            animate={{ y: stage >= 2 ? '-58%' : '0%' }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-sans text-[9px] uppercase tracking-[0.4em] text-gold-deep sm:text-[10px]">
              Baby Shower &amp; Gender Reveal
            </p>
            <p className="gold-text mt-2 font-script text-4xl leading-none sm:text-5xl">{EVENT.parents}</p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="h-px w-8 bg-gold/60" />
              <Star className="h-3 w-3" />
              <span className="h-px w-8 bg-gold/60" />
            </div>
            <p className="mt-2 font-display text-sm text-mocha sm:text-base">November 21, 2026</p>
          </motion.div>

          {/* front pocket */}
          <div
            className="absolute inset-0 rounded-md bg-gradient-to-br from-[#F3E6C9] to-[#E0CA9A]"
            style={{ clipPath: 'polygon(0 0, 50% 56%, 100% 0, 100% 100%, 0 100%)', zIndex: 20 }}
          />

          {/* flap */}
          <motion.div
            className="absolute inset-x-0 top-0 h-[56%] bg-gradient-to-b from-[#EDDDB8] to-[#DAC291]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transformOrigin: 'top center' }}
            animate={stage >= 1 ? { rotateX: 180, zIndex: 5 } : { rotateX: 0, zIndex: 30 }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          />

          {/* wax seal */}
          <motion.button
            type="button"
            onClick={open}
            aria-label="Open the invitation"
            className="absolute left-1/2 top-[56%] z-40 flex h-[68px] w-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-script text-2xl text-cocoa/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-champagne"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #F8E7B4 0%, #D8B469 45%, #A9822F 100%)',
              boxShadow: 'inset 0 2px 3px rgba(255,255,255,.6), inset 0 -4px 8px rgba(110,80,20,.4), 0 8px 18px rgba(74,54,38,.4)',
            }}
            animate={stage >= 1 ? { opacity: 0, scale: 0.6 } : { scale: [1, 1.07, 1] }}
            transition={stage >= 1 ? { duration: 0.4 } : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            N&amp;E
          </motion.button>
        </div>
      </motion.div>

      <motion.p
        className="mt-12 font-display text-lg italic text-mocha"
        initial={{ opacity: 0 }}
        animate={{ opacity: stage === 0 ? [0.4, 1, 0.4] : 0 }}
        transition={stage === 0 ? { duration: 2.4, repeat: Infinity, delay: 1 } : { duration: 0.3 }}
      >
        Tap the seal to open
      </motion.p>
    </motion.div>
  );
}
