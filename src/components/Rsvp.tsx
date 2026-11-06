import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { confetti } from '../lib/confetti';
import { cleanName, isConfigured, supabase, type Attendance } from '../lib/supabase';
import { Reveal, SectionHead } from './ui';

const KEY = 'wonder-rsvp';

const OPTIONS: { value: Exclude<Attendance, 'declined'>; title: string }[] = [
  { value: 'attending', title: 'See you!' },
  { value: 'blessing', title: 'Sending blessings' },
];

export default function Rsvp() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Exclude<Attendance, 'declined'>>('attending');
  const [trap, setTrap] = useState(''); // honeypot — real guests never see or fill this
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ name: string; status: string } | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as { name: string; status: string }) : null;
    } catch {
      return null;
    }
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = cleanName(name);
    if (clean.length < 2) return setError('Please enter your name (at least 2 letters).');
    if (clean.length > 60) return setError('Please keep your name under 60 characters.');
    setError('');

    if (trap) {
      setDone({ name: clean, status });
      return;
    }

    setBusy(true);
    try {
      if (supabase) {
        const { error: err } = await supabase.from('rsvps').insert({
          guest_name: clean,
          attendees: status === 'attending' ? 1 : 0,
          attendance_status: status,
        });
        if (err) {
          setError(
            err.code === '23505'
              ? 'We already have a reply for that name. To change it, please call Ebin or Nikhitha.'
              : 'We couldn’t save your reply. Please try again in a moment.',
          );
          return;
        }
      }
      const record = { name: clean, status };
      try {
        localStorage.setItem(KEY, JSON.stringify(record));
      } catch {
        /* private mode */
      }
      setDone(record);
      confetti({ count: 150 });
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section id="rsvp" aria-label="RSVP" className="relative px-4 py-28 sm:py-36">
      <SectionHead dark kicker="Kindly reply" title="Will you join us?" sub="Let us know you’re coming — or send your blessings." />

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-xl">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="thanks" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="glass relative overflow-hidden rounded-[32px] px-6 py-14 text-center" role="status">
              <span className="mx-auto block h-3 w-3 rotate-45 bg-sun" aria-hidden="true" />
              <p className="mt-4 font-display text-5xl font-semibold italic text-ocean sm:text-6xl">Thank you, {done.name.split(' ')[0]}!</p>
              <p className="mx-auto mt-5 max-w-sm font-display text-xl text-forest sm:text-2xl">
                {done.status === 'attending' ? 'We’ll see you at the celebration.' : 'Your blessings mean the world to us.'}
              </p>
              {!isConfigured && <p className="mt-4 text-xs italic text-ink-soft">Preview mode — this reply was not saved.</p>}
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate className="glass rounded-[32px] p-6 sm:p-10" exit={{ opacity: 0, y: -20 }}>
              <label htmlFor="rsvp-name" className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-ink-soft">
                Your name
              </label>
              <input id="rsvp-name" className="field mt-2" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" placeholder="Full name" aria-invalid={!!error} aria-describedby="rsvp-err" />

              <fieldset className="mt-6">
                <legend className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-ink-soft">Your reply</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={status === o.value}
                      onClick={() => setStatus(o.value)}
                      className={`rounded-2xl border-2 px-3 py-5 text-center transition active:scale-[0.97] ${status === o.value ? 'border-coral bg-sun/40 shadow-lg' : 'border-champagne bg-ivory/70 hover:bg-sun/20'}`}
                    >
                      <span className="block font-display text-2xl font-semibold leading-tight text-ocean">{o.title}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </label>
              </div>

              <p id="rsvp-err" className="mt-4 min-h-[1.5rem] text-center text-sm font-semibold text-[#B5412C]" role="alert">
                {error}
              </p>
              <button type="submit" className="btn-sun mt-2 w-full" disabled={busy}>
                {busy ? 'Sending…' : 'Send my reply'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
