import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGuest } from '../context/GuestContext';
import { isConfigured, supabase } from '../lib/supabase';
import { Bow, Crown } from './Illustrations';
import { Reveal, SectionTitle, Tilt } from './ui';

type Team = 'boy' | 'girl';
interface Voter {
  id: string;
  team: Team;
  name: string;
}

const TEAMS: { team: Team; title: string; sub: string; Icon: typeof Crown; tone: string }[] = [
  {
    team: 'boy',
    title: 'Team Boy',
    sub: 'Little Prince',
    Icon: Crown,
    tone: 'from-[#8A6A4A] via-[#6E5640] to-[#4A3626] text-ivory',
  },
  {
    team: 'girl',
    title: 'Team Girl',
    sub: 'Little Princess',
    Icon: Bow,
    tone: 'from-[#FFFEFA] via-[#F6EEDF] to-[#E9DCC3] text-cocoa',
  },
];

const Burst = () => (
  <span className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
    {Array.from({ length: 14 }).map((_, i) => {
      const a = (i / 14) * Math.PI * 2;
      return (
        <motion.span
          key={i}
          className="absolute h-2 w-2 rounded-full bg-gradient-to-br from-[#F6E4B0] to-[#B8903A]"
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: Math.cos(a) * 110, y: Math.sin(a) * 110, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      );
    })}
  </span>
);

export default function Voting() {
  const { name, setName, register } = useGuest();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [mine, setMine] = useState<Team | null>(null);
  const [burst, setBurst] = useState<{ team: Team; n: number } | null>(null);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('votes')
      .select('user_id, team, updated_at, guests(guest_name)')
      .order('updated_at', { ascending: true });
    if (error || !data) return;
    setVoters(
      data.map((r: any) => {
        const g = Array.isArray(r.guests) ? r.guests[0] : r.guests;
        return { id: r.user_id as string, team: r.team as Team, name: (g?.guest_name as string) ?? 'A guest' };
      }),
    );
  }, []);

  // initial load + live updates
  useEffect(() => {
    if (!supabase) return;
    void load();
    const channel = supabase
      .channel('votes-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'votes' }, () => void load())
      .subscribe();
    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [load]);

  const vote = async (team: Team) => {
    if (busy) return;
    setBusy(true);
    setMsg('');
    try {
      const uid = await register();
      if (supabase && isConfigured) {
        const { error } = await supabase
          .from('votes')
          .upsert({ user_id: uid, team, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
        if (error) throw new Error('We couldn’t save your vote. Please try again.');
        await load();
      } else {
        // preview mode: keep the vote in memory only
        setVoters((v) => [...v.filter((x) => x.id !== 'me'), { id: 'me', team, name: name.trim() || 'You' }]);
      }
      setMine(team);
      setBurst({ team, n: Date.now() });
      setMsg(`You’re on Team ${team === 'boy' ? 'Boy' : 'Girl'}! ${isConfigured ? '' : '(Preview mode — not saved.)'}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const { boy, girl } = useMemo(
    () => ({ boy: voters.filter((v) => v.team === 'boy'), girl: voters.filter((v) => v.team === 'girl') }),
    [voters],
  );
  const total = boy.length + girl.length;
  const boyPct = total ? Math.round((boy.length / total) * 100) : 50;

  return (
    <section className="px-5 py-20 sm:py-28" aria-label="Team voting">
      <SectionTitle
        kicker="The big question"
        title="Which team are you on?"
        sub="Add your name, then tap a team to cast your prediction. You can change it anytime."
      />

      <Reveal delay={0.1} className="mx-auto mt-12 max-w-3xl">
        <div className="mx-auto mb-8 max-w-sm">
          <label htmlFor="vote-name" className="sr-only">
            Your name
          </label>
          <input
            id="vote-name"
            className="field text-center"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="name"
            placeholder="Your name"
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-6">
          {TEAMS.map(({ team, title, sub, Icon, tone }) => (
            <Tilt key={team} max={10}>
              <button
                type="button"
                onClick={() => vote(team)}
                disabled={busy}
                aria-pressed={mine === team}
                className={`relative flex w-full flex-col items-center overflow-hidden rounded-[24px] border bg-gradient-to-br px-3 py-8 text-center transition active:scale-[0.97] sm:py-12 ${tone} ${
                  mine === team ? 'border-gold ring-4 ring-champagne' : 'border-gold/50'
                }`}
                style={{ boxShadow: '0 28px 50px -24px rgba(74,54,38,.6), inset 0 1px 0 rgba(255,255,255,.35)' }}
              >
                <Icon className="h-10 w-14 drop-shadow-[0_4px_8px_rgba(0,0,0,.25)] sm:h-14 sm:w-20" />
                <span className="mt-4 font-display text-2xl font-medium sm:text-3xl">{title}</span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.3em] opacity-80 sm:text-xs">{sub}</span>
                <span className="mt-4 font-display text-4xl tabular-nums text-[#E8C877] sm:text-5xl">
                  {team === 'boy' ? boy.length : girl.length}
                </span>
                {burst?.team === team && <Burst key={burst.n} />}
              </button>
            </Tilt>
          ))}
        </div>

        {/* split bar */}
        <div className="mt-8 h-3 overflow-hidden rounded-full border border-gold/40 bg-champagne/40" aria-hidden="true">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#6E5640] to-[#A8864F]"
            animate={{ width: `${boyPct}%` }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        <p className="mt-3 text-center text-xs uppercase tracking-[0.3em] text-mocha">
          {total === 0 ? 'No votes yet — be the first!' : `${total} ${total === 1 ? 'vote' : 'votes'} so far`}
        </p>
        <p className="mt-3 min-h-[1.5rem] text-center text-sm text-mocha" role="status" aria-live="polite">
          {msg}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {([['Team Boy', boy], ['Team Girl', girl]] as const).map(([label, list]) => (
            <div key={label} className="glass rounded-2xl p-5">
              <h3 className="font-display text-xl text-cocoa">{label}</h3>
              <ul className="mt-3 flex min-h-[2rem] flex-wrap gap-2">
                <AnimatePresence initial={false}>
                  {list.map((v) => (
                    <motion.li
                      key={v.id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="rounded-full border border-gold/40 bg-champagne/40 px-3 py-1 text-sm text-cocoa"
                    >
                      {v.name}
                    </motion.li>
                  ))}
                </AnimatePresence>
                {list.length === 0 && <li className="text-sm italic text-mocha/70">Waiting for the first vote…</li>}
              </ul>
            </div>
          ))}
        </div>
        {!isConfigured && (
          <p className="mt-6 text-center text-xs italic text-mocha/70">
            Preview mode — connect Supabase to share votes between guests.
          </p>
        )}
      </Reveal>
    </section>
  );
}
