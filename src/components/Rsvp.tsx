import { useState, type FormEvent } from 'react';
import { useGuest } from '../context/GuestContext';
import { isConfigured, supabase } from '../lib/supabase';
import { Reveal, SectionTitle } from './ui';

type Status = 'coming' | 'blessing-online' | 'cannot-attend';

const OPTIONS: { value: Status; title: string; note: string; icon: string }[] = [
  { value: 'coming', title: 'I’m coming', note: 'We’ll see you there', icon: '✦' },
  { value: 'blessing-online', title: 'Sending blessings', note: 'Celebrating from afar', icon: '❦' },
  { value: 'cannot-attend', title: 'Can’t make it', note: 'We’ll miss you', icon: '◌' },
];

export default function Rsvp() {
  const { name, setName, register } = useGuest();
  const [status, setStatus] = useState<Status>('coming');
  const [party, setParty] = useState(1);
  const [message, setMessage] = useState('');
  const [phase, setPhase] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setPhase('saving');
    setFeedback('');
    try {
      const uid = await register();
      if (supabase && isConfigured) {
        const { error } = await supabase.from('rsvps').upsert(
          {
            user_id: uid,
            status,
            party_size: status === 'coming' ? party : 1,
            message: message.trim() || null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        );
        if (error) throw new Error('We couldn’t save your reply. Please try again.');
      }
      setPhase('saved');
      setFeedback(
        isConfigured
          ? 'Thank you! Your reply is saved — you can update it anytime.'
          : 'Preview mode: connect Supabase to save replies for real.',
      );
    } catch (err) {
      setPhase('error');
      setFeedback(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <section className="px-5 py-20 sm:py-28" aria-label="RSVP">
      <SectionTitle kicker="Kindly reply" title="Will you be joining us?" sub="Let us know so we can save you a seat." />
      <Reveal delay={0.1} className="mx-auto mt-12 max-w-xl">
        <form onSubmit={submit} className="glass rounded-[28px] p-6 sm:p-10" noValidate>
          <label htmlFor="guest-name" className="text-[11px] uppercase tracking-[0.35em] text-gold-deep">
            Your name
          </label>
          <input
            id="guest-name"
            className="field mt-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="name"
            placeholder="Type your name"
            required
          />

          <fieldset className="mt-7">
            <legend className="text-[11px] uppercase tracking-[0.35em] text-gold-deep">Your reply</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  aria-pressed={status === o.value}
                  onClick={() => setStatus(o.value)}
                  className={`rounded-2xl border px-3 py-4 text-center transition active:scale-[0.98] ${
                    status === o.value
                      ? 'border-gold bg-champagne/50 shadow-[0_10px_25px_-12px_rgba(154,122,47,.8)]'
                      : 'border-gold/30 bg-ivory/60 hover:bg-champagne/25'
                  }`}
                >
                  <span className="block font-display text-2xl text-gold-deep" aria-hidden="true">
                    {o.icon}
                  </span>
                  <span className="mt-1 block font-display text-lg leading-tight text-cocoa">{o.title}</span>
                  <span className="mt-1 block text-xs text-mocha">{o.note}</span>
                </button>
              ))}
            </div>
          </fieldset>

          {status === 'coming' && (
            <div className="mt-7 flex items-center justify-between rounded-2xl border border-gold/30 bg-ivory/60 px-4 py-3">
              <span className="font-display text-lg text-cocoa">How many guests?</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="h-10 w-10 rounded-full border border-gold/50 text-xl text-gold-deep"
                  onClick={() => setParty((p) => Math.max(1, p - 1))}
                  aria-label="One fewer guest"
                >
                  −
                </button>
                <span className="w-6 text-center font-display text-2xl" aria-live="polite">
                  {party}
                </span>
                <button
                  type="button"
                  className="h-10 w-10 rounded-full border border-gold/50 text-xl text-gold-deep"
                  onClick={() => setParty((p) => Math.min(10, p + 1))}
                  aria-label="One more guest"
                >
                  +
                </button>
              </div>
            </div>
          )}

          <label htmlFor="guest-note" className="mt-7 block text-[11px] uppercase tracking-[0.35em] text-gold-deep">
            A little note (optional)
          </label>
          <textarea
            id="guest-note"
            className="field mt-2 min-h-[96px] resize-y"
            maxLength={500}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Wishes for the little one…"
          />

          <button type="submit" className="btn-gold mt-8 w-full" disabled={phase === 'saving'}>
            {phase === 'saving' ? 'Saving…' : phase === 'saved' ? 'Update my reply' : 'Send my reply'}
          </button>
          <p
            className={`mt-4 min-h-[1.5rem] text-center text-sm ${phase === 'error' ? 'text-[#8A3B2A]' : 'text-mocha'}`}
            role="status"
            aria-live="polite"
          >
            {feedback}
          </p>
        </form>
      </Reveal>
    </section>
  );
}
