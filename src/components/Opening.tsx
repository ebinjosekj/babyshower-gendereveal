import { useEffect, useRef } from 'react';
import { useMotion } from '../context/MotionContext';
import OpeningSimple from './OpeningSimple';
import { mountEnvelope } from './envelope/mountEnvelope';
import './envelope/envelope.css';

interface Props {
  onStartMusic: () => void; // runs inside a user gesture
  onEnter: () => void; // the light is swelling → the real page starts its entrance underneath
  onDone: () => void; // the overlay is finished → remove it
}

// The first thing guests see: a sealed envelope. A comet falls, the envelope spins in, two shooting stars circle it and
// merge into the seal. Tap and the seal cracks, the flap opens and a ball of light rises out and swells into the page's orb.
// (Reduced-motion / "simple" mode keeps the quiet tap-the-light screen.)
export default function Opening(props: Props) {
  const { simple } = useMotion();
  if (simple) return <OpeningSimple {...props} />;
  return <EnvelopeOpening {...props} />;
}

function EnvelopeOpening({ onStartMusic, onEnter, onDone }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const hooks = useRef({ onStartMusic, onEnter, onDone });
  hooks.current = { onStartMusic, onEnter, onDone };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return mountEnvelope(el, {
      onStartMusic: () => hooks.current.onStartMusic(),
      onEnter: () => hooks.current.onEnter(),
      onDone: () => hooks.current.onDone(),
    });
  }, []);

  return (
    <div
      id="envx"
      ref={ref}
      role="dialog"
      aria-label="Invitation introduction: tap the envelope to open"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          (e.target as HTMLElement).click();
        }
      }}
    />
  );
}
