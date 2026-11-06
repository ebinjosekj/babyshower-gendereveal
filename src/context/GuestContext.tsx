import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { ensureSession, isConfigured, nameKey, supabase } from '../lib/supabase';

interface GuestCtx {
  name: string;
  setName: (n: string) => void;
  /** Saves the guest's name (once) and returns their user id. Throws a friendly Error. */
  register: () => Promise<string>;
}

const Ctx = createContext<GuestCtx | null>(null);
const STORE = 'guest-name';

const readName = () => {
  try {
    return localStorage.getItem(STORE) ?? '';
  } catch {
    return '';
  }
};

export function GuestProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState(readName);
  const registered = useRef<string>('');

  const setName = useCallback((n: string) => {
    setNameState(n);
    try {
      localStorage.setItem(STORE, n);
    } catch {
      /* private mode — fine */
    }
  }, []);

  const register = useCallback(async () => {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (clean.length < 2) throw new Error('Please add your name first (at least 2 letters).');
    if (clean.length > 40) throw new Error('Please keep your name under 40 characters.');
    if (!isConfigured || !supabase) return 'preview';

    const uid = await ensureSession();
    const key = nameKey(clean);
    if (registered.current === key) return uid;

    const { error } = await supabase
      .from('guests')
      .upsert({ user_id: uid, guest_name: clean, name_key: key }, { onConflict: 'user_id' });
    if (error) {
      if (error.code === '23505') throw new Error('Someone already used that name — please add your last initial.');
      throw new Error('We couldn’t save your name. Please try again.');
    }
    registered.current = key;
    return uid;
  }, [name]);

  const value = useMemo(() => ({ name, setName, register }), [name, setName, register]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useGuest(): GuestCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useGuest must be used inside GuestProvider');
  return c;
}
