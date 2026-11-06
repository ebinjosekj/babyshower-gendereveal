import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// null → "preview mode": the site still works, but nothing is saved or shared.
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

export const isConfigured = supabase !== null;

// Guests are signed in anonymously so each person can only change their own
// reply/vote (enforced by Row Level Security — see supabase/schema.sql).
export async function ensureSession(): Promise<string> {
  if (!supabase) throw new Error('not-configured');
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error || !anon.user) throw error ?? new Error('Could not start a guest session.');
  return anon.user.id;
}

// "  Jane   DOE " → "jane doe"  (stops two people claiming the same name)
export const nameKey = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
