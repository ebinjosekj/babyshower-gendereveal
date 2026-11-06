import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { confetti } from '../lib/confetti';
import { cleanName, EMAIL_RE, isConfigured, supabase, type Attendance } from '../lib/supabase';
import { Star } from './art';
import { Reveal, SectionHead } from './ui';

const KEY = 'wonder-rsvp';

const OPTIONS: { value: Attendance; title: string; note: string }[] = [
  { value: 'attending', title: 'I’ll be there!', note: 'Save me a seat' },
  { value: 'blessing', title: 'Sending blessings', note: 'Celebrating from afar' },
  { value: 'declined', title: 'Can’t make it', note: 'We’ll miss you' },
];

interface Errors {
  name?: string;
  email?: string;
  form?: string;
}

export default function Rsvp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Attendance>('attending');
  const [attendees, setAttendees] = useState(1);
  const [wishes, setWishes] = useState('');
  const [trap, setTrap] = useState(''); // honeypot — real guests never see or fill this
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(() => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const clean = cleanName(name);
    const mail = email.trim();
    const next: Errors = {};
    if (clean.length < 2) next.name = 'Please enter your name (at least 2 letters).';
    else if (clean.length > 60) next.name = 'Please keep your name under 60 characters.';
    if (mail && (!EMAIL_RE.test(mail) || mail.length > 120)) next.email = 'That email doesn’t look right.';
    setErrors(next);
    if (next.name || next.email) return;

    if (trap) {
      // a bot filled the hidden field — pretend it worked
      setDone(clean);
      return;
    }

    setBusy(true);
    try {
      if (supabase) {
        const { error } = await supabase.from('rsvps').insert({
          guest_name: clean,
          email: mail || null,
          attendees: status === 'attending' ? attendees : 0,
          attendance_status: status,
          wishes: wishes.trim() || null,
        });
        if (error) {
          setErrors({
            form:
              error.code === '23505'
                ? 'We already have an RSVP for that name. To change it, please call Ebin or Nikhitha.'
                : 'We couldn’t save your RSVP. Please try again in a moment.',
          });
          return;
        }
      }
      try {
        localStorage.setItem(KEY, clean);
      } catch {
        /* private mode */
      }
      setDone(clean);
      confetti({ count: 160 });
    } catch {
      setErrors({ form: 'Something went wrong. Please check your connection and try again.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      id="rsvp"
      aria-label="RSVP"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#FFE2A8_0%,#E6DDFB_55%,#B8A6F0_100%)] px-4 pb-28 pt-24 sm:pt-32"
    >
      <SectionHead kicker="Kindly reply" title="Will You Join Our Wonder?" sub="Let us know so we can save you a seat." />

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-xl">
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass relative overflow-hidden rounded-[32px] px-6 py-14 text-center"
              role="status"
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <motion.span
                  key={i}
                  aria-hidden="true"
                  className="hide-simple absolute"
                  style={{ left: `${(i * 7.3 + 4) % 92}%`, bottom: -20 }}
                  initial={{ y: 0, opacity: 0 }}
                  animate={{ y: -420 - (i % 4) * 60, opacity: [0, 1, 0], rotate: 180 }}
                  transition={{ duration: 5 + (i % 5), repeat: Infinity, delay: i * 0.35, ease: 'easeOut' }}
                >
                  <Star className="h-4 w-4" />
                </motion.span>
              ))}
              <p className="title-grad relative font-script text-6xl sm:text-7xl">Thank you, {done.split(' ')[0]}!</p>
              <p className="relative mx-auto mt-5 max-w-sm font-display text-xl font-medium text-plum sm:text-2xl">
                Thank you for being part of our little wonder’s journey!
              </p>
              {!isConfigured && <p className="relative mt-4 text-xs italic text-ink-soft">Preview mode — this reply was not saved.</p>}
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} noValidate className="glass rounded-[32px] p-6 sm:p-10" exit={{ opacity: 0, y: -20 }}>
              <label htmlFor="rsvp-name" className="font-display text-xs uppercase tracking-[0.3em] text-ink-soft">
                Your name
              </label>
              <input
                id="rsvp-name"
                className="field mt-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                autoComplete="name"
                placeholder="Full name"
                aria-invalid={!!errors.name}
                aria-describedby="rsvp-name-err"
              />
              <p id="rsvp-name-err" className="mt-1 min-h-[1.25rem] text-sm font-semibold text-[#B5412C]" role="alert">
                {errors.name}
              </p>

              <fieldset className="mt-4">
                <legend className="font-display text-xs uppercase tracking-[0.3em] text-ink-soft">Will you attend?</legend>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  {OPTIONS.map((o) => (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={status === o.value}
                      onClick={() => setStatus(o.value)}
                      className={`rounded-2xl border-2 px-3 py-4 text-center transition active:scale-[0.97] ${
                        status === o.value ? 'border-tangerine bg-sun/40 shadow-lg' : 'border-champagne bg-ivory/70 hover:bg-sun/20'
                      }`}
                    >
                      <span className="block font-display text-lg font-semibold leading-tight text-plum">{o.title}</span>
                      <span className="mt-1 block text-xs font-semibold text-ink-soft">{o.note}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              {status === 'attending' && (
                <div className="mt-5 flex items-center justify-between rounded-2xl border-2 border-champagne bg-ivory/70 px-4 py-3">
                  <span className="font-display text-lg font-medium text-plum" id="attendees-label">
                    How many attendees?
                  </span>
                  <div className="flex items-center gap-3" role="group" aria-labelledby="attendees-label">
                    <button type="button" aria-label="One fewer attendee" onClick={() => setAttendees((n) => Math.max(1, n - 1))} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-champagne text-plum">
                      <Minus size={18} />
                    </button>
                    <span className="w-6 text-center font-display text-2xl font-semibold" aria-live="polite">
                      {attendees}
                    </span>
                    <button type="button" aria-label="One more attendee" onClick={() => setAttendees((n) => Math.min(10, n + 1))} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-champagne text-plum">
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              )}

              <label htmlFor="rsvp-email" className="mt-5 block font-display text-xs uppercase tracking-[0.3em] text-ink-soft">
                Email <span className="normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="rsvp-email"
                type="email"
                inputMode="email"
                className="field mt-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={120}
                autoComplete="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                aria-describedby="rsvp-email-err"
              />
              <p id="rsvp-email-err" className="mt-1 min-h-[1.25rem] text-sm font-semibold text-[#B5412C]" role="alert">
                {errors.email}
              </p>

              <label htmlFor="rsvp-wishes" className="mt-3 block font-display text-xs uppercase tracking-[0.3em] text-ink-soft">
                Wishes for the parents
              </label>
              <textarea id="rsvp-wishes" className="field mt-2 min-h-[110px] resize-y" maxLength={600} value={wishes} onChange={(e) => setWishes(e.target.value)} placeholder="Share a blessing or a little wish…" />

              {/* honeypot */}
              <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                <label>
                  Website
                  <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
                </label>
              </div>

              <button type="submit" className="btn-sun mt-7 w-full" disabled={busy}>
                {busy ? 'Sending…' : 'Send my RSVP'}
              </button>
              <p className="mt-4 min-h-[1.5rem] text-center text-sm font-semibold text-[#B5412C]" role="alert">
                {errors.form}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
