import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, animate, motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { confetti } from '../lib/confetti';
import { cleanName, isConfigured, supabase, type Attendance } from '../lib/supabase';
import { changeReply, NOT_FOUND, SAME_NAME_RSVP, UNAVAILABLE } from '../lib/replies';
import { Reveal, SectionHead, base } from './ui';

const KEY = 'wonder-rsvp';

const OPTIONS: { value: Exclude<Attendance, 'declined'>; title: string }[] = [
  { value: 'attending', title: 'Count me in' },
  { value: 'blessing', title: 'Cheering from afar' },
];

// A sideways carousel: the three photos orbit round, one coming to the front at a time, forever.
const SPARKS = [[-124, -56], [120, -64], [-104, 62], [108, 66], [0, -98], [-30, 92]];
const R = 100;
const rad = (d: number) => (d * Math.PI) / 180;

function OrbitPhoto({ n, offset, angle }: { n: number; offset: number; angle: MotionValue<number> }) {
  const th = useTransform(angle, (a) => rad(offset - a));
  const x = useTransform(th, (t) => Math.sin(t) * R);
  const front = useTransform(th, (t) => (Math.cos(t) + 1) / 2); // 1 = in front, 0 = behind
  const scale = useTransform(front, (f) => 0.58 + 0.5 * f);
  const opacity = useTransform(front, (f) => 0.5 + 0.5 * f);
  const rotateY = useTransform(th, (t) => -Math.sin(t) * 38);
  const zIndex = useTransform(front, (f) => Math.round(f * 10));
  return (
    <motion.img
      src={`${base}photos/us-${n}.jpg`}
      alt=""
      className="absolute h-[132px] w-[132px] rounded-full border-[3px] border-sun object-cover shadow-[0_14px_30px_-10px_rgba(26,36,31,.65)]"
      style={{ x, scale, opacity, rotateY, zIndex }}
    />
  );
}

function ThankPhotos() {
  const angle = useMotionValue(0);
  useEffect(() => {
    const t = window.setTimeout(() => confetti({ count: 60 }), 900);
    const id = window.setInterval(() => {
      animate(angle, angle.get() + 120, { duration: 1.2, ease: [0.45, 0, 0.15, 1] });
    }, 3000);
    return () => { window.clearTimeout(t); window.clearInterval(id); };
  }, [angle]);
  return (
    <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.1 }} className="relative mx-auto flex h-48 items-center justify-center" style={{ perspective: 700 }} aria-hidden="true">
      <span className="thank-halo absolute h-44 w-44 rounded-full bg-sun/25" />
      <span className="ambient absolute h-56 w-56 rounded-full border border-dashed border-sun/60" style={{ animation: 'spin 28s linear infinite' }} />
      {SPARKS.map(([x, y], i) => (
        <span key={i} className="absolute" style={{ marginLeft: x, marginTop: y }}>
          <span className="thank-spark block h-2 w-2 bg-sun" style={{ animationDelay: `${0.6 + i * 0.35}s` }} />
        </span>
      ))}
      <OrbitPhoto n={1} offset={0} angle={angle} />
      <OrbitPhoto n={2} offset={120} angle={angle} />
      <OrbitPhoto n={3} offset={240} angle={angle} />
    </motion.div>
  );
}

export default function Rsvp() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<Exclude<Attendance, 'declined'>>('attending');
  const [trap, setTrap] = useState(''); // honeypot — real guests never see or fill this
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [taken, setTaken] = useState(false);
  const [editing, setEditing] = useState(false);
  const [done, setDone] = useState<{ name: string; status: string } | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as { name: string; status: string }) : null;
    } catch {
      return null;
    }
  });

  const store = (record: { name: string; status: string }) => {
    try {
      localStorage.setItem(KEY, JSON.stringify(record));
    } catch {
      /* private mode */
    }
    setDone(record);
    setEditing(false);
    setTaken(false);
    confetti({ count: 150 });
  };

  // Update an existing reply by name (works from any phone or browser).
  const updateByName = async (clean: string) => {
    setBusy(true);
    setError('');
    try {
      const res = await changeReply('change_rsvp', { p_name: clean, p_status: status });
      if (res === 'updated') store({ name: clean, status });
      else if (res === 'not_found' && done && done.name === clean) {
        // Our earlier reply no longer exists on the server: forget it here and let the guest reply again.
        try {
          localStorage.removeItem(KEY);
        } catch {
          /* private mode */
        }
        setDone(null);
        setEditing(false);
        setName(clean);
        setError('Your earlier reply was removed, so please send it again.');
      } else setError(res === 'unavailable' ? UNAVAILABLE : res === 'not_found' ? NOT_FOUND : 'We couldn’t save your reply. Please try again in a moment.');
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = editing && done ? done.name : cleanName(name);
    if (clean.length < 2) return setError('Please enter your name (at least 2 letters).');
    if (clean.length > 60) return setError('Please keep your name under 60 characters.');
    setError('');
    setTaken(false);

    if (trap) {
      setDone({ name: clean, status });
      return;
    }
    if (editing) return void updateByName(clean);

    setBusy(true);
    try {
      if (supabase) {
        const { error: err } = await supabase.from('rsvps').insert({
          guest_name: clean,
          attendees: status === 'attending' ? 1 : 0,
          attendance_status: status,
        });
        if (err) {
          if (err.code === '23505') {
            setTaken(true);
            setError(SAME_NAME_RSVP);
          } else {
            console.error('RSVP failed', err);
            setError(`We couldn’t save your reply. Please try again in a moment. (${err.code || err.message})`);
          }
          return;
        }
      }
      store({ name: clean, status });
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = () => {
    if (done && (done.status === 'attending' || done.status === 'blessing')) setStatus(done.status);
    setError('');
    setTaken(false);
    setEditing(true);
  };

  return (
    <section id="rsvp" aria-label="RSVP" className="relative px-4 py-28 sm:py-36">
      <SectionHead dark kicker="Kindly reply" title="Will you join us?" sub="Let us know you’re coming, or cheer us on from afar." />

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-xl">
        <AnimatePresence mode="wait">
          {done && !editing ? (
            <motion.div key="thanks" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="glass relative overflow-hidden rounded-[32px] px-6 py-14 text-center" role="status">
              <ThankPhotos />
              <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.8, ease: 'easeOut' }} className="mt-6 font-display text-5xl font-semibold italic text-ocean sm:text-6xl">Thank you, {done.name.split(' ')[0]}!</motion.p>
              <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0, duration: 0.8, ease: 'easeOut' }} className="mx-auto mt-5 max-w-sm font-display text-xl text-forest sm:text-2xl">
                {done.status === 'attending' ? 'We can’t wait to see you.' : 'Your love will be with us on the day.'}
              </motion.p>
              {!isConfigured && <p className="mt-4 text-xs italic text-ink-soft">Preview mode — this reply was not saved.</p>}
              <button type="button" className="btn-ghost mt-6" onClick={startEdit}>
                Changed your mind? Update my reply
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate className="glass rounded-[32px] p-6 sm:p-10" exit={{ opacity: 0, y: -20 }}>
              <label htmlFor="rsvp-name" className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-ink-soft">
                Your name
              </label>
              <input id="rsvp-name" className="field mt-2 read-only:opacity-70" value={editing && done ? done.name : name} readOnly={editing} onChange={(e) => { setName(e.target.value); setTaken(false); }} maxLength={60} autoComplete="name" placeholder="Full name" aria-invalid={!!error} aria-describedby="rsvp-err" />

              <fieldset className="mt-6">
                <legend className="font-sans text-xs font-medium uppercase tracking-[0.3em] text-ink-soft">Your reply</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {OPTIONS.map((o) => (
                    <motion.button
                      key={o.value}
                      type="button"
                      aria-pressed={status === o.value}
                      onClick={() => setStatus(o.value)}
                      whileHover={{ y: -3 }}
                      whileTap={{ scale: 0.94 }}
                      animate={status === o.value ? { scale: [1, 1.07, 1.02] } : { scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className={`rounded-2xl border-2 px-3 py-5 text-center transition ${status === o.value ? 'border-coral bg-sun/40 shadow-lg' : 'border-champagne bg-ivory/70 hover:bg-sun/20'}`}
                    >
                      <span className="block font-display text-2xl font-semibold leading-tight text-ocean">{o.title}</span>
                    </motion.button>
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
                {busy ? 'Sending…' : editing ? 'Update my reply' : 'Send my reply'}
              </button>
              {taken && (
                <button type="button" className="btn-mint mt-3 w-full" disabled={busy} onClick={() => void updateByName(cleanName(name))}>
                  {busy ? 'Updating…' : 'That’s me — update my reply'}
                </button>
              )}
              {editing && (
                <button type="button" className="mt-3 w-full text-center text-sm font-medium text-ink-soft underline underline-offset-4" onClick={() => { setEditing(false); setError(''); }}>
                  Cancel
                </button>
              )}
            </motion.form>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
