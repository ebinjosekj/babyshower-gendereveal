import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { TEAM_LABEL } from '../config';
import { confetti } from '../lib/confetti';
import { cleanName, isConfigured, supabase, type Team } from '../lib/supabase';
import { CloudLayer, Motes, SKY } from './atmosphere';
import { Spark, StarSculpture, SunSculpture } from './world';
import { Reveal, SectionHead } from './ui';

const KEY = 'wonder-prediction';
interface Saved {
  team: Team;
  name: string;
}
interface Counts {
  sunshine: number;
  wonder: number;
}

const readSaved = (): Saved | null => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
};

export default function RevealGame() {
  const [saved, setSaved] = useState<Saved | null>(readSaved);
  const [pick, setPick] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [counts, setCounts] = useState<Counts>({ sunshine: 0, wonder: 0 });
  const [loadError, setLoadError] = useState(false);
  
  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase.rpc('prediction_counts');
    if (err || !data) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    const d = data as Partial<Counts>;
    setCounts({ sunshine: Number(d.sunshine ?? 0), wonder: Number(d.wonder ?? 0) });
  }, []);

  useEffect(() => {
    void refresh();
    const id = window.setInterval(() => {
      if (!document.hidden) void refresh();
    }, 15000);
    return () => window.clearInterval(id);
  }, [refresh]);

  const choose = (team: Team, e: MouseEvent) => {
    if (saved) return;
    setPick(team);
    setError('');
    confetti({ x: e.clientX, y: e.clientY, count: 90 });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pick) return;
    const clean = cleanName(name);
    if (clean.length < 2) return setError('Please add your name (at least 2 letters).');
    if (clean.length > 60) return setError('Please keep your name under 60 characters.');

    setBusy(true);
    setError('');
    try {
      if (supabase) {
        const { error: err } = await supabase.from('predictions').insert({ guest_name: clean, selected_team: pick });
        if (err) {
          setError(
            err.code === '23505'
              ? 'That name has already made a prediction. Please add your last initial if you are someone different.'
              : 'We couldn’t save your prediction. Please try again.',
          );
          return;
        }
        void refresh();
      } else {
        setCounts((c) => ({ ...c, [pick]: c[pick] + 1 }));
      }
      const record: Saved = { team: pick, name: clean };
      try {
        localStorage.setItem(KEY, JSON.stringify(record));
      } catch {
        /* private mode */
      }
      setSaved(record);
      setPick(null);
      confetti({ count: 150 });
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const total = counts.sunshine + counts.wonder;
  const sunPct = total ? Math.round((counts.sunshine / total) * 100) : 50;

  // A plain render function (not a nested component) so the cards keep their animation state.
  const renderTeam = (team: Team) => {
    const sun = team === 'sunshine';
    const active = (pick ?? saved?.team) === team;
    return (
      <motion.button
        key={team}
        type="button"
        onClick={(e) => choose(team, e)}
        disabled={!!saved}
        aria-pressed={active}
        whileHover={saved ? undefined : { y: -8, rotate: sun ? -1.5 : 1.5 }}
        whileTap={saved ? undefined : { scale: 0.96 }}
        animate={active ? { scale: 1.04 } : { scale: 1 }}
        className={`relative flex flex-col items-center overflow-hidden rounded-[30px] border-4 px-3 pb-6 pt-8 text-center transition-shadow disabled:cursor-default sm:pb-8 sm:pt-10 ${
          active ? 'shadow-[0_0_0_6px_rgba(255,255,255,.7),0_30px_60px_-20px_rgba(43,26,87,.6)]' : 'shadow-[0_24px_40px_-24px_rgba(43,26,87,.6)]'
        } ${saved && !active ? 'opacity-60 saturate-50' : ''}`}
        style={{
          background: sun
            ? 'linear-gradient(160deg,#F7E3A6 0%,#F0B94B 50%,#E98C56 100%)'
            : 'linear-gradient(160deg,#A9D6D1 0%,#347D76 55%,#183D4B 100%)',
          borderColor: sun ? '#F7E3A6' : '#77B7B0',
        }}
      >
        {sun ? <SunSculpture className="h-28 w-28 sm:h-36 sm:w-36" /> : <StarSculpture className="h-28 w-28 sm:h-36 sm:w-36" />}
        <span className={`mt-3 font-display text-2xl font-semibold sm:text-4xl ${sun ? 'text-ocean' : 'text-ivory'}`}>{TEAM_LABEL[team]}</span>
        <span className={`mt-1 text-xs font-medium uppercase tracking-[0.2em] ${sun ? 'text-ocean/80' : 'text-ivory/80'}`}>{sun ? 'Warm & golden' : 'Deep & dreamy'}</span>
        <span className={`mt-3 font-display text-4xl font-semibold tabular-nums sm:text-5xl ${sun ? 'text-ocean' : 'text-ivory'}`}>
          <motion.span key={sun ? counts.sunshine : counts.wonder} initial={{ scale: 1.5, opacity: 0.4 }} animate={{ scale: 1, opacity: 1 }} className="inline-block">
            {sun ? counts.sunshine : counts.wonder}
          </motion.span>
        </span>
        {active && (
          <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-ocean text-sun">
            <Check size={18} aria-hidden="true" />
          </span>
        )}
      </motion.button>
    );
  };

  return (
    <section
      id="reveal"
      aria-label="Gender reveal prediction game"
      className="relative overflow-hidden px-4 pb-28 pt-28 sm:pt-36"
      style={{ background: SKY.golden }}
    >
      <CloudLayer count={3} seed={131} depth={0.3} top={[2, 30]} />
      <Motes count={14} seed={23} />

      <SectionHead dark kicker="Make a prediction" title="Who Will Our Little Wonder Be?" sub="Make your prediction before the big surprise!" />

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl">
        <p className="mx-auto mb-6 max-w-md text-center text-sm font-medium uppercase tracking-[0.18em] text-ivory [text-shadow:0_2px_10px_rgba(10,35,45,.6)]">
          Just two friendly prediction teams — neither is a clue!
        </p>

        <div className="grid grid-cols-2 gap-3 sm:gap-8">
          {renderTeam('sunshine')}
          {renderTeam('wonder')}
        </div>

        {/* live scoreboard */}
        <div className="glass mt-8 rounded-[28px] p-5 sm:p-7" aria-live="polite">
          <h3 className="text-center font-display text-sm uppercase tracking-[0.35em] text-ink-soft">Live scoreboard</h3>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-3xl font-semibold text-tangerine sm:text-4xl">{counts.sunshine}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-soft sm:text-xs">Team Sunshine</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-plum sm:text-4xl">{total}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-soft sm:text-xs">Total predictions</p>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold text-jade sm:text-4xl">{counts.wonder}</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-ink-soft sm:text-xs">Team Wonder</p>
            </div>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-jade/25" aria-hidden="true">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-sun to-coral" animate={{ width: `${sunPct}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} />
          </div>
          {!isConfigured && <p className="mt-3 text-center text-xs italic text-ink-soft">Preview mode — predictions are not shared yet.</p>}
          {loadError && <p className="mt-3 text-center text-xs italic text-ink-soft">The scoreboard will refresh when we’re back online.</p>}
        </div>

        {saved && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 text-center font-display text-xl text-ivory [text-shadow:0_2px_10px_rgba(10,35,45,.6)]" role="status">
            Thank you, {saved.name}! You’re on <strong>{TEAM_LABEL[saved.team]}</strong>. Your prediction is locked in.
          </motion.p>
        )}

        <div className="mt-14 text-center">
          <Spark className="ambient mx-auto w-8" style={{ animation: 'twinkle 3s ease-in-out infinite' }} />
          <p className="mx-auto mt-4 max-w-sm font-display text-2xl font-semibold text-ivory [text-shadow:0_2px_14px_rgba(10,35,45,.6)] sm:text-3xl">
            The big surprise will be revealed at the celebration.
          </p>
        </div>
      </Reveal>

      {/* name sheet */}
      <AnimatePresence>
        {pick && !saved && (
          <motion.div
            className="fixed inset-0 z-[140] flex items-end justify-center bg-ocean/70 p-3 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Confirm your prediction"
            data-lenis-prevent
          >
            <motion.form
              onSubmit={submit}
              noValidate
              className="glass w-full max-w-md rounded-[28px] p-6"
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 80, opacity: 0 }}
              transition={{ type: 'spring', damping: 24, stiffness: 240 }}
            >
              <p className="text-center font-display text-2xl font-semibold text-plum">Great choice! You picked {TEAM_LABEL[pick]}.</p>
              <p className="mt-1 text-center text-sm font-semibold text-ink-soft">Add your name to lock in your prediction.</p>
              <label htmlFor="predict-name" className="sr-only">
                Your name
              </label>
              <input
                id="predict-name"
                className="field mt-4"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                autoComplete="name"
                autoFocus
                aria-invalid={!!error}
                aria-describedby="predict-error"
              />
              <p id="predict-error" className="mt-2 min-h-[1.25rem] text-sm font-semibold text-[#B5412C]" role="alert">
                {error}
              </p>
              <div className="mt-3 flex gap-3">
                <button type="button" className="btn-ghost flex-1" onClick={() => { setPick(null); setError(''); }}>
                  Back
                </button>
                <button type="submit" className="btn-sun flex-[2]" disabled={busy}>
                  {busy ? 'Saving…' : 'Lock it in'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
