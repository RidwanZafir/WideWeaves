"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, RotateCcw, Star, X } from "lucide-react";
import { QUIZ_QUESTIONS } from "@/data/games";
import { KNOWLEDGE } from "@/data/knowledge";
import { useAfterlight } from "@/lib/store";

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const ROUND = 10;

export default function QuizGame() {
  const { addGameStars, say, unlockFact } = useAfterlight();
  const [order, setOrder] = useState(() => shuffled(QUIZ_QUESTIONS).slice(0, ROUND));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = order[index];
  const evidence = KNOWLEDGE.find((card) => card.id === q.knowledgeId)?.source;

  const reset = () => {
    setOrder(shuffled(QUIZ_QUESTIONS).slice(0, ROUND));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.answer;
    if (correct) {
      setScore((s) => s + 1);
      unlockFact(q.knowledgeId);
    }
    if (correct) say(q.luffy);
  };

  const next = () => {
    if (index + 1 >= order.length) {
      setDone(true);
      const stars = score >= 9 ? 5 : score >= 7 ? 4 : score >= 5 ? 3 : score >= 3 ? 2 : 1;
      addGameStars(stars);
      say({
        text:
          score >= 7
            ? "Amazing quiz score! You are a true space explorer!"
            : "Good trying! Every explorer learns by wondering. Try the quiz again!",
        expression: score >= 7 ? "wow" : "grin",
        pose: "wave",
      });
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  if (done) {
    return (
      <div className="py-4 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[0.6rem] border-2 border-gold/70 bg-gold/15 text-gold">
          <Star size={28} />
        </div>
        <h3 className="display mt-3 text-2xl text-white">You scored {score} / {order.length}</h3>
        <p className="mx-auto mt-2 max-w-md text-[0.78rem] leading-relaxed text-slate-400">
          {score >= 9
            ? "Perfect mission control! Luffy is cheering for you."
            : score >= 6
              ? "Great flying, explorer! Your knowledge is lifting off."
              : "Every great explorer started by asking questions. Play again!"}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button onClick={reset} className="btn btn-gold">
            <RotateCcw size={15} /> Play again
          </button>
          <button onClick={next} className="btn btn-ghost hidden" aria-hidden tabIndex={-1}>
            Next
          </button>
        </div>
        <p className="mt-3 text-[0.58rem] uppercase tracking-[0.14em] text-slate-600">Stars earned were saved to your log</p>
      </div>
    );
  }

  const correct = picked === q.answer;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="chip !cursor-default">Question {index + 1} / {order.length}</span>
        <span className="chip !cursor-default">Score {score}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-[0.4rem] bg-white/10">
        <motion.div
          className="h-full rounded-[0.4rem] bg-gradient-to-r from-cyan to-gold"
          animate={{ width: `${((index + (picked !== null ? 1 : 0)) / order.length) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
          className="mt-4"
        >
          <h3 className="text-[1.05rem] font-bold leading-snug text-white">{q.question}</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {q.options.map((opt, i) => {
              const isPicked = picked === i;
              const isAnswer = i === q.answer;
              const showState = picked !== null;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={showState}
                  className={`flex min-h-[52px] items-center gap-2.5 rounded-[0.55rem] border-2 p-3 text-left text-[0.78rem] font-medium leading-snug transition ${
                    showState && isAnswer
                      ? "border-emerald-400/80 bg-emerald-400/15 text-white"
                      : showState && isPicked && !isAnswer
                        ? "border-rose-400/80 bg-rose-400/15 text-white"
                        : "border-white/12 bg-deep/40 text-slate-200 hover:border-cyan/60 hover:bg-deep/70"
                  }`}
                >
                  <span
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-[0.45rem] border-2 text-[0.7rem] font-extrabold ${
                      showState && isAnswer
                        ? "border-emerald-300 bg-emerald-400/30 text-white"
                        : showState && isPicked
                          ? "border-rose-300 bg-rose-400/30 text-white"
                          : "border-cyan/40 bg-ink/40 text-cyan"
                    }`}
                  >
                    {showState && isAnswer ? <Check size={13} /> : showState && isPicked ? <X size={13} /> : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          {picked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-3 rounded-[0.55rem] border-2 p-3 ${correct ? "border-emerald-400/50 bg-emerald-400/10" : "border-cyan/30 bg-deep/40"}`}
            >
              <p className="text-[0.78rem] leading-relaxed text-slate-200">
                <span className="font-bold text-white">{correct ? "Yes! " : "Good try! "}</span>
                {q.why}
              </p>
              {evidence && <a href={evidence.url} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-10 items-center text-[0.65rem] text-cyan underline decoration-cyan/40 underline-offset-4 hover:decoration-cyan">Read the evidence · {evidence.label}</a>}
              <button onClick={next} className="btn btn-gold mt-3 !py-2 !text-[0.62rem]">
                {index + 1 >= order.length ? "See my score" : "Next question"} <ArrowRight size={13} />
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
