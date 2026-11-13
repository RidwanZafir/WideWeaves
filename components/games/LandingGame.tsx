"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, RotateCcw, Star, Wind } from "lucide-react";
import { useAfterlight } from "@/lib/store";

const ROUNDS = 5;

function randomZone() {
  const center = 30 + Math.random() * 40; // 30..70
  const half = 9; // zone width 18
  return { lo: center - half, hi: center + half, center };
}

export default function LandingGame() {
  const { addGameStars, say } = useAfterlight();
  const [running, setRunning] = useState(false);
  const [round, setRound] = useState(1);
  const [pos, setPos] = useState(0);
  const [dir, setDir] = useState(1);
  const [zone, setZone] = useState(randomZone);
  const [result, setResult] = useState<null | { ok: boolean; perfect: boolean; pos: number }>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const raf = useRef(0);
  const last = useRef(0);

  const speed = 68; // units per second

  const loop = useCallback(
    (t: number) => {
      if (!last.current) last.current = t;
      const dt = Math.min(0.05, (t - last.current) / 1000);
      last.current = t;
      setPos((p) => {
        let n = p + dir * speed * dt;
        if (n >= 100) {
          n = 100;
          setDir(-1);
        } else if (n <= 0) {
          n = 0;
          setDir(1);
        }
        return n;
      });
      raf.current = requestAnimationFrame(loop);
    },
    [dir],
  );

  useEffect(() => {
    if (!running) return;
    last.current = 0;
    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [running, loop]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { searchOpen, menuOpen, filmOpen } = useAfterlight.getState();
      if (e.defaultPrevented || searchOpen || menuOpen || filmOpen) return;
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select, [contenteditable='true']") || target?.isContentEditable) return;
      if (e.code === "Space" && running && !result) {
        e.preventDefault();
        land();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const land = () => {
    if (result) return;
    setRunning(false);
    cancelAnimationFrame(raf.current);
    const p = pos;
    const inside = p >= zone.lo && p <= zone.hi;
    const perfect = Math.abs(p - zone.center) <= 4;
    setResult({ ok: inside, perfect, pos: p });
    if (inside) setScore((s) => s + (perfect ? 2 : 1));
  };

  const next = () => {
    if (round >= ROUNDS) {
      setDone(true);
      const stars = score >= 9 ? 5 : score >= 7 ? 4 : score >= 5 ? 3 : score >= 2 ? 2 : 1;
      addGameStars(stars);
      say({
        text: score >= 5 ? "Soft landing! You are a master pilot of the Moon!" : "That landing bounce is a lesson. Try again, pilot!",
        expression: score >= 5 ? "wow" : "grin",
        pose: score >= 5 ? "wave" : "point",
      });
      return;
    }
    setRound((r) => r + 1);
    setZone(randomZone());
    setResult(null);
    setPos(Math.random() * 20);
    setDir(1);
    setRunning(true);
  };

  const reset = () => {
    setRound(1);
    setScore(0);
    setZone(randomZone());
    setResult(null);
    setDone(false);
    setPos(0);
    setRunning(true);
  };

  useEffect(() => {
    setRunning(true);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="chip !cursor-default">Landing {Math.min(round, ROUNDS)} / {ROUNDS}</span>
        <span className="chip !cursor-default">Score {score}</span>
        <button onClick={reset} className="btn btn-ghost !min-h-10 !px-3 !py-2 !text-[0.6rem]">
          <RotateCcw size={13} /> Restart
        </button>
      </div>

      <div className="mt-4 rounded-[0.6rem] border-2 border-cyan/30 bg-[linear-gradient(180deg,#071326,#02060f)] p-3">
        <div className="flex items-center justify-between text-[0.58rem] uppercase tracking-[0.16em] text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Rocket size={13} className="text-cyan" /> Probe descending
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Wind size={13} className="text-gold" /> Tap Land in the green!
          </span>
        </div>
        <p className="mt-1 text-[0.62rem] text-slate-500">Press <kbd className="rounded border border-white/20 px-1">Space</kbd> or the Land button.</p>

        <div className="relative mt-3 h-16 overflow-hidden rounded-[0.5rem] border-2 border-white/10 bg-ink/60">
          {/* safe zone */}
          <div
            className="absolute inset-y-0 rounded-[0.3rem] border-2 border-emerald-400/80 bg-emerald-400/25"
            style={{ left: `${zone.lo}%`, width: `${zone.hi - zone.lo}%` }}
            aria-hidden
          />
          <div
            className="absolute inset-y-0 w-[3px] rounded bg-gold"
            style={{ left: `${zone.center}%`, transform: "translateX(-50%)" }}
            aria-hidden
          />
          {/* moving needle */}
          <motion.div
            className="absolute inset-y-0 z-10 w-[6px] -translate-x-1/2 rounded bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
            style={{ left: `${pos}%` }}
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-1 text-center text-[0.52rem] uppercase tracking-[0.18em] text-slate-500">ground</div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {result ? (
            <>
              <span
                className={`rounded-[0.5rem] border-2 px-3 py-2 text-[0.72rem] font-bold uppercase tracking-[0.12em] ${
                  result.ok ? "border-emerald-400/70 bg-emerald-400/15 text-emerald-200" : "border-rose-400/70 bg-rose-400/15 text-rose-200"
                }`}
              >
                {result.ok ? (result.perfect ? "Perfect touchdown!" : "Soft landing!") : "Bounced! Try again"}
              </span>
              <button onClick={next} className="btn btn-gold !py-2.5 !text-[0.64rem]">
                {round >= ROUNDS ? "See my stars" : "Next landing"} <Rocket size={13} />
              </button>
            </>
          ) : done ? (
            <span className="inline-flex items-center gap-1.5 text-[0.72rem] font-semibold text-gold">
              <Star size={13} /> Mission complete!
            </span>
          ) : (
            <button onClick={land} className="btn btn-ember w-full !py-3 !text-[0.78rem]">
              <Rocket size={16} /> Land now!
            </button>
          )}
        </div>
      </div>

      {done && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-[0.55rem] border-2 border-gold/50 bg-gold/10 p-3">
          <p className="text-[0.78rem] font-semibold text-gold">You finished {score} points across {ROUNDS} landings.</p>
          <button onClick={reset} className="btn btn-gold !py-2 !text-[0.62rem]">
            Fly again
          </button>
        </div>
      )}
    </div>
  );
}
