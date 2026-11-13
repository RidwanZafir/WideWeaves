"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Star } from "lucide-react";
import { SITES } from "@/data/sites";
import { getEquipment } from "@/data/equipment";
import { useAfterlight } from "@/lib/store";

type Site = (typeof SITES)[number];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function posOf(sites: Site[]) {
  const lats = sites.map((s) => s.lat);
  const lons = sites.map((s) => s.lon);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLon = Math.min(...lons), maxLon = Math.max(...lons);
  const latRange = Math.max(0.001, maxLat - minLat);
  const lonRange = Math.max(0.001, maxLon - minLon);
  return sites.map((s) => ({
    site: s,
    x: 12 + ((s.lon - minLon) / lonRange) * 86,
    y: 12 + (1 - (s.lat - minLat) / latRange) * 76,
  }));
}

export default function FindRoverGame() {
  const { addGameStars, say } = useAfterlight();
  const pool = useMemo(
    () =>
      SITES.filter((s) => s.verified && s.equipmentId && getEquipment(s.equipmentId)?.image),
    [],
  );

  const [rounds] = useState(() => shuffle(pool).slice(0, 5));
  const [round, setRound] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [lock, setLock] = useState(false);

  const target = rounds[round];
  const targetEq = target ? getEquipment(target.equipmentId!) : null;

  const candidates = useMemo(() => {
    if (!target) return [];
    const same = pool.filter((s) => s.planet === target.planet && s.id !== target.id && s.equipmentId !== target.equipmentId);
    const distractors = shuffle(same).slice(0, 4);
    return shuffle([target, ...distractors]);
  }, [target, pool]);

  const dots = useMemo(() => posOf(candidates), [candidates]);

  const pick = (site: Site) => {
    if (lock || done || picked) return;
    setPicked(site.id);
    const ok = site.id === target.id;
    if (ok) {
      setCorrectCount((c) => c + 1);
      setLock(true);
      window.setTimeout(() => {
        setPicked(null);
        setLock(false);
        if (round + 1 >= rounds.length) {
          setDone(true);
          addGameStars(3);
          say({ text: "You found every rover's landing site! Map master!", expression: "wow", pose: "wave" });
        } else {
          setRound((r) => r + 1);
        }
      }, 900);
    } else {
      setLock(true);
      window.setTimeout(() => {
        setPicked(null);
        setLock(false);
      }, 700);
    }
  };

  const reset = () => {
    setRound(0);
    setPicked(null);
    setCorrectCount(0);
    setDone(false);
    setLock(false);
  };

  if (!target || !targetEq) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.14em] text-slate-400">
          <span className="chip !cursor-default">Round {Math.min(round + 1, rounds.length)} / {rounds.length}</span>
          <span className="chip !cursor-default">Found {correctCount}</span>
          {done && (
            <span className="inline-flex items-center gap-1.5 rounded-[0.5rem] border-2 border-gold/70 bg-gold/15 px-2.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold">
              <Star size={12} /> +3 stars
            </span>
          )}
        </div>
        <button onClick={reset} className="btn btn-ghost !min-h-10 !px-3 !py-2 !text-[0.6rem]">
          <RotateCcw size={13} /> Restart
        </button>
      </div>

      {!done ? (
        <>
          <div className="mt-4 flex flex-col items-center gap-3 rounded-[0.6rem] border-2 border-cyan/30 bg-deep/30 p-3 sm:flex-row">
            <img
              src={targetEq.image}
              alt={targetEq.imageCaption}
              className="h-20 w-20 shrink-0 rounded-[0.5rem] border-2 border-white/15 object-cover"
            />
            <div className="min-w-0">
              <p className="text-[0.58rem] uppercase tracking-[0.16em] text-cyan/80">Find this machine's landing site</p>
              <p className="mt-1 text-[0.86rem] font-bold text-white">{targetEq.shortName || targetEq.name}</p>
              <p className="mt-0.5 text-[0.66rem] text-slate-400">
                {targetEq.mission} · {target.year}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <svg viewBox="0 0 100 100" className="h-64 w-full rounded-[0.6rem] border-2 border-cyan/30 bg-[radial-gradient(circle_at_50%_45%,rgba(30,80,160,0.35),rgba(3,7,16,0.95))]" role="img" aria-label="Map of candidate landing sites">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(63,231,255,0.18)" strokeWidth="0.6" />
              {dots.map(({ site, x, y }) => {
                const isPicked = picked === site.id;
                const isTarget = site.id === target.id;
                const color =
                  isPicked && isTarget
                    ? "#ffc93c"
                    : isPicked
                      ? "#ff5a7a"
                      : "#3fe7ff";
                return (
                  <g key={site.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isPicked ? 5.5 : 4.2}
                      fill={color}
                      stroke="rgba(255,255,255,0.6)"
                      strokeWidth="0.6"
                      className="cursor-pointer"
                      onClick={() => pick(site)}
                      style={{ filter: isPicked ? "drop-shadow(0 0 6px " + color + ")" : undefined }}
                    />
                    <text
                      x={x}
                      y={y + 9}
                      textAnchor="middle"
                      fontSize="2.6"
                      fill="rgba(220,235,255,0.85)"
                      className="pointer-events-none select-none"
                    >
                      {site.name.length > 16 ? site.name.slice(0, 14) + "…" : site.name}
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="mt-1.5 text-center text-[0.56rem] uppercase tracking-[0.14em] text-slate-500">
              Match the named site · schematic layout, not a map to scale
            </p>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[0.6rem] border-2 border-gold/50 bg-gold/10 p-3"
        >
          <p className="text-[0.78rem] font-semibold text-gold">
            Brilliant! All {rounds.length} machines found on the map.
          </p>
          <button onClick={reset} className="btn btn-gold !py-2 !text-[0.62rem]">
            Play again
          </button>
        </motion.div>
      )}
    </div>
  );
}
