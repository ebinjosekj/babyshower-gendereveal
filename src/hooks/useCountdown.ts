import { useEffect, useState } from 'react';

export interface Remaining {
  done: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calc = (target: number): Remaining => {
  const d = Math.max(0, target - Date.now());
  return {
    done: d === 0,
    days: Math.floor(d / 86_400_000),
    hours: Math.floor((d % 86_400_000) / 3_600_000),
    minutes: Math.floor((d % 3_600_000) / 60_000),
    seconds: Math.floor((d % 60_000) / 1000),
  };
};

export function useCountdown(targetISO: string): Remaining {
  const target = new Date(targetISO).getTime();
  const [t, setT] = useState<Remaining>(() => calc(target));
  useEffect(() => {
    const id = window.setInterval(() => setT(calc(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  return t;
}
