import { useEffect, useState } from 'react';

// The part of the screen that is actually visible. On phones the on-screen keyboard covers the bottom of the page without
// resizing it, so anything pinned to the bottom (like a pop-up sheet) ends up hidden behind the keyboard. Sizing a pop-up to
// this box keeps it above the keyboard.
export function useVisibleBox(active: boolean) {
  const [box, setBox] = useState<{ top: number; height: number; keyboard: boolean } | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) {
      setBox(null);
      return;
    }
    const update = () => setBox({ top: vv.offsetTop, height: vv.height, keyboard: vv.height < window.innerHeight - 120 });
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
    };
  }, [active]);
  return box;
}
