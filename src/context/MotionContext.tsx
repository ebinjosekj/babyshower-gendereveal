import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

// "Simplified animation mode": switched on automatically for reduced-motion,
// low-memory / low-core / data-saver devices, and can be toggled by the guest.

interface MotionCtx {
  simple: boolean;
  toggleSimple: () => void;
}

const Ctx = createContext<MotionCtx>({ simple: false, toggleSimple: () => undefined });
const KEY = 'wonder-simple-motion';

const detectSimple = (): boolean => {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === '1') return true;
    if (saved === '0') return false;
  } catch {
    /* storage blocked — fall through to detection */
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lowMemory = (nav.deviceMemory ?? 8) <= 2;
  const lowCores = (nav.hardwareConcurrency ?? 8) <= 3;
  const saveData = nav.connection?.saveData === true;
  return reduce || lowMemory || lowCores || saveData;
};

export function MotionProvider({ children }: { children: ReactNode }) {
  const [simple, setSimple] = useState<boolean>(detectSimple);

  useEffect(() => {
    document.documentElement.classList.toggle('simple', simple);
  }, [simple]);

  const toggleSimple = useCallback(() => {
    setSimple((s) => {
      const next = !s;
      try {
        localStorage.setItem(KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ simple, toggleSimple }), [simple, toggleSimple]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useMotion = () => useContext(Ctx);
