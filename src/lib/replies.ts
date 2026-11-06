import { supabase } from './supabase';

// A random private key, kept only in this browser. It proves "this is the same guest" when they change their mind.
export const makeKey = (): string => {
  try {
    return crypto.randomUUID().replace(/-/g, '') + Math.random().toString(36).slice(2);
  } catch {
    return Array.from({ length: 4 }, () => Math.random().toString(36).slice(2)).join('');
  }
};

export type Outcome = { ok: true; key?: string } | { ok: false; message: string };

export const CALL_US = 'please call Ebin or Nikhitha and they will change it for you';

// Calls a save_* function in the database: creates the reply, or updates it when the key matches.
// If the database has not been updated yet (function missing), falls back to the plain insert.
export async function saveReply(
  fn: 'save_prediction' | 'save_rsvp',
  args: Record<string, string>,
  fallback: () => PromiseLike<{ error: { code?: string; message: string } | null }>,
  texts: { taken: string; changeFailed: string; generic: string },
  changing: boolean,
  key: string,
): Promise<Outcome> {
  if (!supabase) return { ok: true, key };
  const { data, error } = await supabase.rpc(fn, { ...args, p_key: key });
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') {
      if (changing) return { ok: false, message: texts.changeFailed };
      const r = await fallback();
      if (!r.error) return { ok: true };
      if (r.error.code === '23505') return { ok: false, message: texts.taken };
      console.error(fn, r.error);
      return { ok: false, message: `${texts.generic} (${r.error.code || r.error.message})` };
    }
    console.error(fn, error);
    return { ok: false, message: `${texts.generic} (${error.code || error.message})` };
  }
  if (data === 'name_taken') return { ok: false, message: changing ? texts.changeFailed : texts.taken };
  return { ok: true, key };
}
