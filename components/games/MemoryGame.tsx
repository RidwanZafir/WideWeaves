"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Star, Rocket } from "lucide-react";
import { getEquipment } from "@/data/equipment";
import { MEMORY_IDS } from "@/data/games";
import { useAfterlight } from "@/lib/store";

type Card = { uid: string; id: string; name: string; image: string };

function buildDeck(): Card[] {
  const base = MEMORY_IDS.map((id) => getEquipment(id)).filter((e) => e != null).map((e) => ({
    id: e!.id,
    name: e!.shortName || e!.name,
    image: e!.image,
  }));
  const doubled = [...base, ...base].map((c, i) => ({ ...c, uid: `${c.id}-${i}` }));
  for (let i = doubled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [doubled[i], doubled[j]] = [doubled[j], doubled[i]];
  }
  return doubled;
}

export default function MemoryGame() {
  const { addGameStars, say } = useAfterlight();
  const [deck, setDeck] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [lock, setLock] = useState(false);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const matchedCount = useMemo(() => matched.length / 2, [matched]);

  const reset = () => {
    setDeck(buildDeck());
    setFlipped([]);
    setMatched([]);
    setLock(false);
    setMoves(0);
    setWon(false);
  };

  const flip = (card: Card) => {
    if (lock || flipped.includes(card.uid) || matched.includes(card.uid)) return;
    const nextFlipped = [...flipped, card.uid];
    setFlipped(nextFlipped);
    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
      const [a, b] = nextFlipped.map((uid) => deck.find((c) => c.uid === uid));
      const isMatch = a && b && a.id === b.id;
      window.setTimeout(() => {
        if (isMatch && a && b) {
          const newMatched = [...matched, a.uid, b.uid];
          setMatched(newMatched);
          setFlipped([]);
          setLock(false);
          if (newMatched.length === deck.length) {
            setWon(true);
            addGameStars(4);
            say({
              text: "You matched every machine! Memory champion of the Moon and Mars!",
              expression: "wow",
              pose: "wave",
            });
          }
        } else {
          setFlipped([]);
          setLock(false);
        }
      }, 650);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.08em] text-slate-300">
          <span className="chip !cursor-default">Pairs {matchedCount} / 6</span>
          <span className="chip !cursor-default">Moves {moves}</span>
          {won && (
            <span className="inline-flex items-center gap-1.5 rounded-[0.5rem] border-2 border-gold/70 bg-gold/15 px-2.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-gold">
              <Star size={12} /> +4 stars
            </span>
          )}
        </div>
        <button onClick={reset} className="btn btn-ghost !min-h-10 !px-3 !py-2 !text-[0.6rem]">
          <RotateCcw size={13} /> Shuffle
        </button>
      </div>

      <div className="mx-auto mt-4 grid w-full max-w-[42rem] grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
        {deck.map((card) => {
          const isUp = flipped.includes(card.uid) || matched.includes(card.uid);
          const isMatched = matched.includes(card.uid);
          return (
            <button
              key={card.uid}
              onClick={() => flip(card)}
              className={`relative aspect-square overflow-hidden rounded-[0.6rem] border-2 text-left transition ${
                isMatched
                  ? "border-gold/80 bg-gold/10 shadow-[0_0_22px_-8px_rgba(255,201,60,0.8)]"
                  : isUp
                    ? "border-cyan/70 bg-deep/60"
                    : "border-cyan/30 bg-[linear-gradient(150deg,#12305e,#050b18)] hover:border-cyan/70"
              }`}
              aria-label={isUp ? `${card.name} card` : "Hidden card"}
            >
              <AnimatePresence mode="wait">
                {isUp ? (
                  <motion.div
                    key={`${card.uid}-front`}
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.82 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0"
                  >
                    <img src={card.image} alt={card.name} className="h-full w-full object-cover" loading="lazy" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/60 to-transparent px-2 pb-1.5 pt-6">
                      <span className="block truncate text-[0.62rem] font-bold uppercase tracking-[0.08em] text-white">
                        {card.name}
                      </span>
                      {isMatched && <span className="text-[0.54rem] uppercase tracking-[0.12em] text-gold">Matched!</span>}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={`${card.uid}-back`}
                    initial={{ opacity: 0, scale: 0.82 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.82 }}
                    transition={{ duration: 0.18 }}
                    className="absolute inset-0 grid place-items-center"
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-[0.5rem] border-2 border-white/25 bg-ink/40 text-cyan">
                      <Rocket size={18} />
                    </span>
                    <span className="absolute bottom-2 text-[0.5rem] uppercase tracking-[0.18em] text-cyan/60">Tap</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </div>

      {won && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[0.6rem] border-2 border-gold/50 bg-gold/10 p-3"
        >
          <p className="text-[0.78rem] font-semibold text-gold">Brilliant! All six machines matched in {moves} moves.</p>
          <button onClick={reset} className="btn btn-gold !py-2 !text-[0.62rem]">
            Play again
          </button>
        </motion.div>
      )}
    </div>
  );
}
