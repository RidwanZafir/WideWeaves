"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Star, CheckCircle2 } from "lucide-react";
import { TIMELINE, timelineDateKey } from "@/data/timeline";
import { useAfterlight } from "@/lib/store";

function sortKey(e: (typeof TIMELINE)[number]): number {
  return timelineDateKey(e)!;
}

export default function MissionOrderGame() {
  const { addGameStars, say } = useAfterlight();

  const [seed] = useState(() => Math.random());
  const events = useMemo(() => {
    const pool = TIMELINE.filter((event) => timelineDateKey(event) !== null);
    const picked: typeof TIMELINE = [];
    const used = new Set<string>();
    const usedDates = new Set<number>();
    while (picked.length < 4 && pool.length) {
      const e = pool[Math.floor(Math.random() * pool.length)];
      pool.splice(pool.indexOf(e), 1);
      if (used.has(e.id) || usedDates.has(sortKey(e))) continue;
      used.add(e.id);
      usedDates.add(sortKey(e));
      picked.push(e);
    }
    return picked;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  const correctOrder = useMemo(
    () => [...events].sort((a, b) => sortKey(a) - sortKey(b)),
    [events],
  );

  const [order, setOrder] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState<number>(0);
  const [won, setWon] = useState(false);

  const pool = events.filter((e) => !order.includes(e.id));
  const byId = useMemo(() => Object.fromEntries(events.map((e) => [e.id, e])), [events]);

  const tapPool = (id: string) => {
    if (checked) return;
    setOrder((o) => [...o, id]);
  };
  const tapOrder = (id: string) => {
    if (checked) return;
    setOrder((o) => o.filter((x) => x !== id));
  };

  const check = () => {
    let correct = 0;
    order.forEach((id, i) => {
      if (id === correctOrder[i].id) correct++;
    });
    setResult(correct);
    setChecked(true);
    if (correct === 4) {
      setWon(true);
      addGameStars(3);
      say({ text: "Perfect order! You know the mission timeline by heart!", expression: "wow", pose: "wave" });
    } else if (correct >= 2) {
      addGameStars(1);
    }
  };

  const reset = () => {
    setOrder([]);
    setChecked(false);
    setResult(0);
    setWon(false);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.14em] text-slate-400">
          <span className="chip !cursor-default">Placed {order.length} / 4</span>
          {checked && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-[0.5rem] border-2 px-2.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] ${
                won ? "border-gold/70 bg-gold/15 text-gold" : "border-cyan/40 bg-cyan/10 text-cyan"
              }`}
            >
              {won ? <Star size={12} /> : <CheckCircle2 size={12} />} {result}/4 correct
              {won && " · +3 stars"}
            </span>
          )}
        </div>
        <button onClick={reset} className="btn btn-ghost !min-h-10 !px-3 !py-2 !text-[0.6rem]">
          <RotateCcw size={13} /> Restart
        </button>
      </div>

      <p className="mt-3 text-[0.74rem] leading-relaxed text-slate-300">
        Tap the events in the order they happened — oldest first. Tap a placed event to move it back.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-[0.6rem] border-2 border-white/10 bg-deep/25 p-2.5">
          <span className="data text-[0.52rem] uppercase tracking-[0.18em] text-slate-500">Events to place</span>
          <div className="mt-2 flex flex-col gap-2">
            {pool.map((e) => (
              <button
                key={e.id}
                onClick={() => tapPool(e.id)}
                disabled={checked}
                className="rounded-[0.5rem] border-2 border-cyan/30 bg-abyss/60 px-3 py-2 text-left text-[0.72rem] transition hover:border-cyan/70 disabled:opacity-50"
              >
                <span className="block font-semibold text-white">{e.title}</span>
                <span className="mt-0.5 block text-[0.58rem] text-slate-400">
                  {e.planet === "moon" ? "Moon" : e.planet === "mars" ? "Mars" : "Deep space"} · {e.agency}
                </span>
              </button>
            ))}
            {pool.length === 0 && (
              <p className="text-[0.62rem] italic text-slate-500">All placed — check your order!</p>
            )}
          </div>
        </div>

        <div className="rounded-[0.6rem] border-2 border-gold/30 bg-gold/5 p-2.5">
          <span className="data text-[0.52rem] uppercase tracking-[0.18em] text-gold/80">Your order (oldest → newest)</span>
          <div className="mt-2 flex flex-col gap-2">
            {order.length === 0 && (
              <p className="text-[0.62rem] italic text-slate-500">Tap events on the left to place them here.</p>
            )}
            {order.map((id, i) => {
              const e = byId[id];
              const correct = checked && id === correctOrder[i].id;
              const wrong = checked && id !== correctOrder[i].id;
              return (
                <button
                  key={id}
                  onClick={() => tapOrder(id)}
                  disabled={checked}
                  className={`flex items-center gap-2 rounded-[0.5rem] border-2 px-3 py-2 text-left text-[0.72rem] transition disabled:opacity-90 ${
                    correct
                      ? "border-emerald-400/70 bg-emerald-400/10"
                      : wrong
                        ? "border-rose-400/70 bg-rose-400/10"
                        : "border-gold/40 bg-abyss/60 hover:border-gold/70"
                  }`}
                >
                  <span className="data grid h-6 w-6 shrink-0 place-items-center rounded-[0.35rem] border border-white/20 bg-ink/60 text-[0.62rem] text-slate-300">
                    {i + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-white">{e.title}</span>
                    <span className="mt-0.5 block text-[0.58rem] text-slate-400">{e.date} · {e.year}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          onClick={check}
          disabled={order.length !== 4 || checked}
          className="btn btn-gold !py-2.5 !text-[0.62rem] disabled:opacity-50"
        >
          <CheckCircle2 size={13} /> Check order
        </button>
        {checked && (
          <button onClick={reset} className="btn btn-ghost !py-2.5 !text-[0.62rem]">
            <RotateCcw size={13} /> Try again
          </button>
        )}
      </div>

      {checked && (
        <div className="mt-3 rounded-[0.6rem] border border-white/10 bg-deep/30 p-3 text-[0.66rem] text-slate-300">
          <span className="font-semibold text-white">Correct order:</span>{" "}
          {correctOrder.map((e) => `${e.title} (${e.date})`).join(" → ")}
        </div>
      )}
    </div>
  );
}
