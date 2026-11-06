import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// null → "preview mode": the site works fully, but nothing is saved or shared.
// Only the public anon key is ever used here; never put a service-role key in the frontend.
export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } }) : null;

export const isConfigured = supabase !== null;

export type Team = 'boy' | 'girl';
export type Attendance = 'attending' | 'blessing' | 'declined';

export interface RsvpRow {
  id: string;
  guest_name: string;
  email: string | null;
  attendees: number;
  attendance_status: Attendance;
  wishes: string | null;
  created_at: string;
}

export interface PredictionRow {
  id: string;
  guest_name: string;
  selected_team: Team;
  created_at: string;
}

export const cleanName = (s: string) => s.trim().replace(/\s+/g, ' ');

export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
