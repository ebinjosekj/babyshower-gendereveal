import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Download, LogOut, RefreshCw, Search } from 'lucide-react';
import { TEAM_LABEL } from '../../config';
import { isConfigured, supabase, type Attendance, type PredictionRow, type RsvpRow } from '../../lib/supabase';

// Parents-only dashboard at  #/admin
// Protection: Supabase email+password sign-in AND a Row Level Security check against the
// public.admins table, so even a hand-crafted API call cannot read guest data.

type Phase = 'loading' | 'signedOut' | 'denied' | 'ready';
type Tab = 'rsvps' | 'predictions' | 'wishes';

const STATUS_LABEL: Record<Attendance, string> = {
  attending: 'Attending',
  blessing: 'Sending blessings',
  declined: 'Declined',
};

// Prevent spreadsheet formula injection in exported CSV
const csvCell = (v: unknown) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

const download = (name: string, rows: unknown[][]) => {
  const csv = rows.map((r) => r.map(csvCell).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const fmt = (iso: string) => new Date(iso).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' });

// Defined at module level so the inputs inside keep focus while typing.
const Shell = ({ children }: { children: ReactNode }) => (
  <main className="min-h-screen bg-[linear-gradient(180deg,#FFF1C9_0%,#F1E8D6_100%)] px-4 py-10 text-ink">
    <div className="mx-auto max-w-5xl">{children}</div>
  </main>
);

export default function AdminApp() {
  const [phase, setPhase] = useState<Phase>('loading');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [preds, setPreds] = useState<PredictionRow[]>([]);
  const [tab, setTab] = useState<Tab>('rsvps');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | Attendance>('all');
  const [loadErr, setLoadErr] = useState('');

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoadErr('');
    const [r, p] = await Promise.all([
      supabase.from('rsvps').select('*').order('created_at', { ascending: false }),
      supabase.from('predictions').select('*').order('created_at', { ascending: false }),
    ]);
    if (r.error || p.error) {
      setLoadErr('Could not load data. Check that the schema has been run and you are an admin.');
      return;
    }
    setRsvps((r.data ?? []) as RsvpRow[]);
    setPreds((p.data ?? []) as PredictionRow[]);
  }, []);

  const check = useCallback(async () => {
    if (!supabase) return;
    const { data: s } = await supabase.auth.getSession();
    if (!s.session) return setPhase('signedOut');
    const { data, error: err } = await supabase.rpc('is_admin');
    if (err || data !== true) return setPhase('denied');
    setPhase('ready');
    void load();
  }, [load]);

  useEffect(() => {
    void check();
  }, [check]);

  const signIn = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (err) return setError('Sign-in failed. Check your email and password.');
    setPassword('');
    void check();
  };

  const signOut = async () => {
    await supabase?.auth.signOut();
    setRsvps([]);
    setPreds([]);
    setPhase('signedOut');
  };

  const stats = useMemo(() => {
    const attending = rsvps.filter((r) => r.attendance_status === 'attending');
    return {
      total: rsvps.length,
      confirmed: attending.reduce((n, r) => n + r.attendees, 0),
      declined: rsvps.filter((r) => r.attendance_status === 'declined').length,
      blessing: rsvps.filter((r) => r.attendance_status === 'blessing').length,
      sunshine: preds.filter((p) => p.selected_team === 'sunshine').length,
      wonder: preds.filter((p) => p.selected_team === 'wonder').length,
    };
  }, [rsvps, preds]);

  const needle = q.trim().toLowerCase();
  const rsvpRows = rsvps.filter(
    (r) =>
      (filter === 'all' || r.attendance_status === filter) &&
      (!needle || `${r.guest_name} ${r.email ?? ''} ${r.wishes ?? ''}`.toLowerCase().includes(needle)),
  );
  const predRows = preds.filter((p) => !needle || p.guest_name.toLowerCase().includes(needle));
  const wishRows = rsvps.filter((r) => r.wishes && (!needle || `${r.guest_name} ${r.wishes}`.toLowerCase().includes(needle)));

  if (!isConfigured) {
    return (
      <Shell>
        <p className="glass rounded-3xl p-8 text-center font-display text-xl text-plum">
          Supabase isn’t connected yet, so there’s no data to show. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and rebuild.
        </p>
      </Shell>
    );
  }
  if (phase === 'loading') return <Shell><p className="text-center font-display text-plum">Loading…</p></Shell>;

  if (phase === 'signedOut' || phase === 'denied') {
    return (
      <Shell>
        <form onSubmit={signIn} className="glass mx-auto mt-10 max-w-sm rounded-[28px] p-7" noValidate>
          <h1 className="text-center font-display text-3xl font-semibold text-plum">Parents’ Dashboard</h1>
          {phase === 'denied' && (
            <p className="mt-3 rounded-xl bg-coral/20 p-3 text-center text-sm font-semibold text-[#8E2F1E]" role="alert">
              That account is not an admin. Sign out and use the parents’ account.
              <button type="button" onClick={signOut} className="mt-2 block w-full underline">Sign out</button>
            </p>
          )}
          <label htmlFor="adm-email" className="mt-6 block font-display text-xs uppercase tracking-[0.3em] text-ink-soft">Email</label>
          <input id="adm-email" type="email" autoComplete="username" className="field mt-2" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <label htmlFor="adm-pass" className="mt-4 block font-display text-xs uppercase tracking-[0.3em] text-ink-soft">Password</label>
          <input id="adm-pass" type="password" autoComplete="current-password" className="field mt-2" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p className="mt-3 min-h-[1.25rem] text-sm font-semibold text-[#B5412C]" role="alert">{error}</p>
          <button type="submit" className="btn-sun mt-2 w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
          <a href="#/" className="mt-5 block text-center text-sm font-semibold text-ink-soft underline">Back to the invitation</a>
        </form>
      </Shell>
    );
  }

  const tile = (label: string, value: number | string, tone: string) => (
    <div className="glass rounded-2xl p-4 text-center">
      <p className={`font-display text-3xl font-semibold sm:text-4xl ${tone}`}>{value}</p>
      <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.15em] text-ink-soft">{label}</p>
    </div>
  );

  return (
    <Shell>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-plum">Parents’ Dashboard</h1>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost !min-h-[44px] !px-4" onClick={() => void load()}><RefreshCw size={16} aria-hidden="true" /> Refresh</button>
          <button type="button" className="btn-ghost !min-h-[44px] !px-4" onClick={signOut}><LogOut size={16} aria-hidden="true" /> Sign out</button>
        </div>
      </header>

      {loadErr && <p className="mt-4 rounded-xl bg-coral/20 p-3 text-sm font-semibold text-[#8E2F1E]" role="alert">{loadErr}</p>}

      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-label="Summary">
        {tile('RSVP responses', stats.total, 'text-plum')}
        {tile('Confirmed guests', stats.confirmed, 'text-emerald')}
        {tile('Declined', stats.declined, 'text-coral')}
        {tile('Blessings', stats.blessing, 'text-[#8974BD]')}
        {tile(TEAM_LABEL.sunshine, stats.sunshine, 'text-tangerine')}
        {tile(TEAM_LABEL.wonder, stats.wonder, 'text-emerald')}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Data" className="flex gap-1 rounded-full bg-champagne/50 p-1">
          {(['rsvps', 'predictions', 'wishes'] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 font-display text-sm capitalize ${tab === t ? 'bg-plum text-ivory' : 'text-plum'}`}>
              {t === 'rsvps' ? 'RSVPs' : t}
            </button>
          ))}
        </div>
        <div className="relative min-w-[200px] flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-soft" aria-hidden="true" />
          <input aria-label="Search guests" className="field !pl-10" placeholder="Search guests…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {tab === 'rsvps' && (
          <select aria-label="Filter by attendance" className="field !w-auto" value={filter} onChange={(e) => setFilter(e.target.value as 'all' | Attendance)}>
            <option value="all">All replies</option>
            <option value="attending">Attending</option>
            <option value="blessing">Sending blessings</option>
            <option value="declined">Declined</option>
          </select>
        )}
        <button
          type="button"
          className="btn-sun !min-h-[44px] !px-5"
          onClick={() =>
            tab === 'predictions'
              ? download('predictions.csv', [['Name', 'Team', 'Submitted'], ...predRows.map((p) => [p.guest_name, TEAM_LABEL[p.selected_team], p.created_at])])
              : download('guest-list.csv', [
                  ['Name', 'Email', 'Attendance', 'Attendees', 'Wishes', 'Submitted'],
                  ...rsvpRows.map((r) => [r.guest_name, r.email, STATUS_LABEL[r.attendance_status], r.attendees, r.wishes, r.created_at]),
                ])
          }
        >
          <Download size={16} aria-hidden="true" /> Export CSV
        </button>
      </div>

      <div className="mt-5">
        {tab === 'rsvps' && (
          <div className="glass overflow-x-auto rounded-3xl">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="font-display text-xs uppercase tracking-[0.2em] text-ink-soft">
                <tr><th className="p-4">Name</th><th className="p-4">Reply</th><th className="p-4">Guests</th><th className="p-4">Email</th><th className="p-4">Received</th></tr>
              </thead>
              <tbody>
                {rsvpRows.map((r) => (
                  <tr key={r.id} className="border-t border-champagne/60">
                    <td className="p-4 font-semibold text-plum">{r.guest_name}</td>
                    <td className="p-4">{STATUS_LABEL[r.attendance_status]}</td>
                    <td className="p-4">{r.attendance_status === 'attending' ? r.attendees : '—'}</td>
                    <td className="p-4">{r.email ?? '—'}</td>
                    <td className="p-4 text-ink-soft">{fmt(r.created_at)}</td>
                  </tr>
                ))}
                {rsvpRows.length === 0 && <tr><td colSpan={5} className="p-8 text-center italic text-ink-soft">No RSVPs match.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'predictions' && (
          <div className="glass overflow-x-auto rounded-3xl">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="font-display text-xs uppercase tracking-[0.2em] text-ink-soft">
                <tr><th className="p-4">Name</th><th className="p-4">Team</th><th className="p-4">Submitted</th></tr>
              </thead>
              <tbody>
                {predRows.map((p) => (
                  <tr key={p.id} className="border-t border-champagne/60">
                    <td className="p-4 font-semibold text-plum">{p.guest_name}</td>
                    <td className="p-4">{TEAM_LABEL[p.selected_team]}</td>
                    <td className="p-4 text-ink-soft">{fmt(p.created_at)}</td>
                  </tr>
                ))}
                {predRows.length === 0 && <tr><td colSpan={3} className="p-8 text-center italic text-ink-soft">No predictions yet.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'wishes' && (
          <ul className="grid gap-3 sm:grid-cols-2">
            {wishRows.map((r) => (
              <li key={r.id} className="glass rounded-3xl p-5">
                <p className="font-display text-lg font-semibold text-plum">{r.guest_name}</p>
                <p className="mt-2 whitespace-pre-wrap text-ink">{r.wishes}</p>
                <p className="mt-3 text-xs text-ink-soft">{fmt(r.created_at)}</p>
              </li>
            ))}
            {wishRows.length === 0 && <li className="col-span-full p-8 text-center italic text-ink-soft">No wishes yet.</li>}
          </ul>
        )}
      </div>
    </Shell>
  );
}
