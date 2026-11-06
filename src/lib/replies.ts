import { supabase } from './supabase';

export type ChangeResult = 'updated' | 'not_found' | 'unavailable' | 'error';

// Changes an existing team pick / RSVP by the guest's name (works from any phone or browser).
export async function changeReply(fn: 'change_team' | 'change_rsvp', args: Record<string, string>): Promise<ChangeResult> {
  if (!supabase) return 'updated'; // preview mode: the caller updates its own copy
  const { data, error } = await supabase.rpc(fn, args);
  if (error) {
    if (error.code === 'PGRST202' || error.code === '42883') return 'unavailable'; // database not updated yet
    console.error(fn, error);
    return 'error';
  }
  return data === 'updated' ? 'updated' : 'not_found';
}

export const SAME_NAME_TEAM =
  'Someone with the same name has already voted. Please enter your full name (first and last) so we can tell you apart. If that vote was yours, tap “That’s me” to change it.';
export const SAME_NAME_RSVP =
  'Someone with the same name has already replied. Please enter your full name (first and last) so we can tell you apart. If that reply was yours, tap “That’s me” to update it.';
export const NOT_FOUND = 'We couldn’t find that name. Please check the spelling and try again.';
export const UNAVAILABLE = 'Changing is not switched on yet. Please call Ebin or Nikki and they will change it for you.';
