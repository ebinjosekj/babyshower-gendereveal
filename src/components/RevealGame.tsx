import { useCallback, useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { TEAM_LABEL } from '../config';
import { confetti } from '../lib/confetti';
import { cleanName, isConfigured, supabase, type Team } from '../lib/supabase';
import { CloudLayer, Motes, SKY } from './atmosphere';
import { Reveal, SectionHead } from './ui';
import { Spark, StarSculpture, SunSculpture } from './world';

const KEY = 'wonder-team';
const TEAMS: Team[] = ['boy', 'girl'];

interface Saved {
  team: Team;
  name: string;
}
interface Member {
  name: string;
  team: Team;
}

const isTeam = (t: unknown): t is Team => t === 'boy' || t === 'girl';

const readSaved = (): Saved | null => {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? (JSON.parse(raw) as Saved) : null;
    return v && isTeam(v.team) ? v : null;
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
  const [roster, setRoster] = useState<Member[]>([]);
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) return;
    const { data, error: err } = await supabase.rpc('team_roster');
    if (err || !Array.isArray(data)) {
      setLoadError(true);
      return;
    }
    setLoadError(false);
    setRoster((data as Member[]).filter((m) => isTeam(m.team) && typeof m.name === 'string'));
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
    confetti({ x: e.clientX, y: e.clientY, count: 70 });
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
              ? 'That name has already joined a team. If you are someone different, please add your last initial.'
              : 'We couldn’t save that. Please try again in a moment.',
          );
          return;
        }
        void refresh();
      } else {
        setRoster((r) => [...r, { name: clean, team: pick }]); // this device only
      }
      const record: Saved = { team: pick, name: clean };
      try {
        localStorage.setItem(KEY, JSON.stringify(record));
      } catch {
        /* private mode */
      }
      setSaved(record);
      setPick(null);
      confetti({ count: 140 });
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const members = (t: Team) => roster.filter((m) => m.team === t);

  // plain render function (not a nested component) so cards keep their animation state
  const renderTeam = (team: Team) => {
    const gold = team === 'girl';
    const active = (pick ?? saved?.team) === team;
    return (
      <motion.button
        key={team}
        type="button"
        onClick={(e) => choose(team, e)}
        disabled={!!saved}
        aria-pressed={active}
        whileHover={saved ? undefined : { y: -8 }}
        whileTap={saved ? undefined : { scale: 0.96 }}
        animate={active ? { scale: 1.04 } : { scale: 1 }}
        className={`relative flex flex-col items-center overflow-hidden rounded-[30px] border-2 px-3 pb-6 pt-8 text-center transition-shadow disabled:cursor-default sm:pb-8 sm:pt-10 ${
          active ? 'shadow-[0_0_0_4px_rgba(240,185,75,.8),0_30px_60px_-20px_rgba(0,0,0,.7)]' : 'shadow-[0_24px_40px_-24px_rgba(0,0,0,.8)]'
        } ${saved && !active ? 'opacity-55 saturate-50' : ''}`}
        style={{
          background: gold
            ? 'linear-gradient(160deg,#F2D48A 0%,#E0A04A 55%,#B8643A 100%)'
            : 'linear-gradient(160deg,#4E9A92 0%,#27605F 55%,#14323C 100%)',
          borderColor: gold ? '#F2D48A' : '#77B7B0',
        }}
      >
        {gold ? <SunSculpture className="h-24 w-24 sm:h-32 sm:w-32" /> : <StarSculpture className="h-24 w-24 sm:h-32 sm:w-32" />}
        <span className={`mt-3 font-display text-3xl font-semibold sm:text-4xl ${gold ? 'text-ocean' : 'text-ivory'}`}>{TEAM_LABEL[team]}</span>
        <span className={`mt-1 text-xs font-medium uppercase tracking-[0.2em] ${gold ? 'text-ocean/85' : 'text-ivory/85'}`}>
          {saved ? `${members(team).length} on the team` : 'Tap to join'}
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
    <section id="reveal" aria-label="Join a team" className="relative overflow-hidden px-4 pb-28 pt-28 sm:pt-36" style={{ background: SKY.dusk }}>
      <CloudLayer count={3} seed={131} depth={0.25} top={[2, 30]} />
      <Motes count={14} seed={23} />

      <SectionHead dark kicker="Who will our little wonder be?" title="Join a Team" sub="Pick Team Boy or Team Girl — the real answer stays a surprise until the celebration." />

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl">
        <div className="grid grid-cols-2 gap-3 sm:gap-8">{TEAMS.map(renderTeam)}</div>

        <div aria-live="polite">
          {saved && (
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass mt-6 rounded-2xl px-5 py-4 text-center font-display text-xl text-ocean" role="status">
              Welcome, {saved.name}! You joined <strong>{TEAM_LABEL[saved.team]}</strong>.
            </motion.p>
          )}
        </div>

        {/* team list — directly below the join options */}
        <div className="glass-dark mt-8 rounded-[28px] p-5 text-ivory sm:p-7" aria-label="Team lists">
          <h3 className="text-center font-sans text-xs font-medium uppercase tracking-[0.35em] text-sun">Team lists</h3>
          <div className="mt-5 grid gap-6 sm:grid-cols-2">
            {TEAMS.map((t) => {
              const list = members(t);
              return (
                <div key={t}>
                  <p className="flex items-baseline justify-between border-b border-champagne/40 pb-2 font-display text-2xl font-semibold">
                    {TEAM_LABEL[t]}
                    <span className="tabular-nums text-sun">{list.length}</span>
                  </p>
                  {list.length ? (
                    <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1 text-base" data-lenis-prevent>
                      {list.map((m, i) => (
                        <li key={`${m.name}-${i}`} className="flex items-center gap-2">
                          <Spark className="w-3 shrink-0" /> {m.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-sm italic text-ivory/75">No one has joined yet — be the first!</p>
                  )}
                </div>
              );
            })}
          </div>
          {!isConfigured && (
            <p className="mt-5 rounded-xl bg-ocean/60 p-3 text-center text-xs italic">
              Preview mode: joins are only kept on this device. To save and share the lists with every guest, the Supabase database needs to be connected (see README).
            </p>
          )}
          {loadError && <p className="mt-4 text-center text-xs italic">The lists will refresh when we’re back online.</p>}
        </div>
      </Reveal>

      <AnimatePresence>
        {pick && !saved && (
          <motion.div
            className="fixed inset-0 z-[140] flex items-end justify-center bg-ocean/75 p-3 backdrop-blur-sm sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Join ${TEAM_LABEL[pick]}`}
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
              <p className="text-center font-display text-2xl font-semibold text-ocean">Join {TEAM_LABEL[pick]}</p>
              <p className="mt-1 text-center text-sm font-medium text-ink-soft">Just your name, so we can add you to the list.</p>
              <label htmlFor="predict-name" className="sr-only">
                Your name
              </label>
              <input id="predict-name" className="field mt-4" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} autoComplete="name" autoFocus aria-invalid={!!error} aria-describedby="predict-error" />
              <p id="predict-error" className="mt-2 min-h-[1.25rem] text-sm font-semibold text-[#B5412C]" role="alert">
                {error}
              </p>
              <div className="mt-3 flex gap-3">
                <button type="button" className="btn-ghost flex-1" onClick={() => { setPick(null); setError(''); }}>
                  Back
                </button>
                <button type="submit" className="btn-sun flex-[2]" disabled={busy}>
                  {busy ? 'Joining…' : 'Join team'}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
