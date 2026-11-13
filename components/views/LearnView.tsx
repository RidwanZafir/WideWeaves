"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Lightbulb, ChevronDown, Check, RotateCcw, ArrowRight } from "lucide-react";
import Luffy from "@/components/guide/Luffy";
import { Breadcrumb, ProgressBar, SectionHeader, SourceLink } from "@/components/ui/Atoms";
import { KNOWLEDGE, KNOWLEDGE_CATEGORIES, knownFactIds } from "@/data/knowledge";
import { useAfterlight } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";

export default function LearnView() {
  const { go, factsUnlocked, unlockFact, resetProgress, say } = useAfterlight();
  const [category, setCategory] = useState<string>("all");
  const [open, setOpen] = useState<string | null>(null);
  const factTarget = useNavigation((state) => state.factTarget);
  const reducedMotion = useReducedMotion();
  const handledFactRequest = useRef<number | null>(null);

  useEffect(() => {
    const fact = KNOWLEDGE.find((card) => card.id === factTarget?.id);
    if (!fact || !factTarget) return;
    const navigation = useNavigation.getState();
    const consumed = navigation.consumedFactRequest >= factTarget.request;
    // StrictMode replays effects on the same mount. Repeat the visual work then,
    // while a later ordinary visit must not reuse an already-consumed search.
    if (consumed && handledFactRequest.current !== factTarget.request) return;
    handledFactRequest.current = factTarget.request;
    if (!consumed) {
      navigation.consumeFactRequest(factTarget.request);
      unlockFact(fact.id);
    }
    setCategory("all");
    setOpen(fact.id);
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const card = document.getElementById(`knowledge-${fact.id}`);
        card?.scrollIntoView({ block: "start", behavior: reducedMotion ? "auto" : "smooth" });
        card?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(secondFrame);
    };
  }, [factTarget, unlockFact, reducedMotion]);

  const cards = useMemo(
    () => (category === "all" ? KNOWLEDGE : KNOWLEDGE.filter((k) => k.category === category)),
    [category],
  );

  const unlockedIds = useMemo(() => new Set(knownFactIds(factsUnlocked)), [factsUnlocked]);
  const pct = Math.round((unlockedIds.size / KNOWLEDGE.length) * 100);

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "Learn" }]} />
      <SectionHeader
        className="mt-4"
        eyebrow="Luffy's knowledge deck"
        title={
          <>
            Answer first, then <span className="text-gradient-ice">check</span>
          </>
        }
        description={`${KNOWLEDGE.length} cards on the engineering and science behind the machines. Reveal a card to unlock it in your expedition log — they are saved on this device.`}
        action={
          <div className="flex max-w-full flex-wrap items-center gap-2">
            <div className="w-40 max-w-full">
              <ProgressBar value={pct} label={`Unlocked · ${unlockedIds.size}/${KNOWLEDGE.length}`} />
            </div>
            <button
              onClick={() => {
                if (window.confirm("Reset unlocked cards and expedition progress?")) resetProgress();
              }}
              className="icon-btn !h-11 !w-11"
              title="Reset progress"
              aria-label="Reset progress"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        }
      />

      <div className="hide-scrollbar mt-5 flex items-center gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
        <button onClick={() => setCategory("all")} className="chip shrink-0" data-active={category === "all"}>
          All {KNOWLEDGE.length}
        </button>
        {KNOWLEDGE_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className="chip shrink-0" data-active={category === c}>
            {c}
          </button>
        ))}
      </div>

      <div className="adaptive-card-grid mt-4 gap-3">
        {cards.map((k, i) => {
          const opened = open === k.id;
          const unlocked = unlockedIds.has(k.id);
          return (
            <motion.div
              key={k.id}
              id={`knowledge-${k.id}`}
              layout
              className={`relative scroll-mt-24 overflow-hidden rounded-2xl border p-4 transition ${
                opened
                  ? "border-gold/45 bg-[linear-gradient(160deg,rgba(34,24,8,0.7),rgba(2,5,12,0.92))]"
                  : "border-white/10 bg-[linear-gradient(160deg,rgba(6,14,30,0.7),rgba(2,5,12,0.9))]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="data text-[0.52rem] uppercase tracking-[0.2em] text-cyan/70">
                  {k.category}
                </span>
                {unlocked ? (
                  <span className="inline-flex items-center gap-1 rounded-[0.4rem] border-2 border-emerald-400/50 bg-emerald-400/15 px-1.5 py-0.5 text-[0.48rem] font-bold uppercase tracking-[0.1em] text-emerald-200">
                    <Check size={9} /> unlocked
                  </span>
                ) : (
                  <span className="text-[0.48rem] uppercase tracking-[0.1em] text-slate-600">card {i + 1}</span>
                )}
              </div>

              <h3 className="mt-2 text-[0.92rem] font-semibold leading-snug text-white">{k.question}</h3>

              <AnimatePresence initial={false}>
                {opened ? (
                  <motion.div
                    key="answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 text-[0.74rem] leading-relaxed text-slate-300">{k.answer}</p>
                    <div className="mt-3 flex items-start gap-2 rounded-xl border border-cyan/20 bg-deep/40 p-2.5">
                      <span className="h-10 w-8 shrink-0">
                        <Luffy
                          className="h-full w-full"
                          expression={k.luffy.expression}
                          pose={k.luffy.pose}
                          talking={false}
                        />
                      </span>
                      <p className="text-[0.68rem] leading-snug text-cyan/90">{k.luffy.text}</p>
                    </div>
                    <div className="mt-2.5 text-[0.56rem]">
                      <SourceLink href={k.source.url}>{k.source.label}</SourceLink>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <button
                onClick={() => {
                  setOpen(opened ? null : k.id);
                  if (!opened) {
                    unlockFact(k.id);
                    if (k.luffy) say(k.luffy);
                  }
                }}
                className="mt-3 flex w-full items-center justify-between border-t border-white/8 pt-2.5 text-[0.58rem] uppercase tracking-[0.16em] text-gold/80 transition hover:text-gold"
              >
                {opened ? "Hide answer" : "Reveal answer"}
                <ChevronDown size={13} className={`transition ${opened ? "rotate-180" : ""}`} />
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-[0.65rem] border-2 border-cyan/25 bg-deep/30 p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-[0.5rem] border-2 border-gold/50 bg-gold/15 text-gold">
            <Lightbulb size={16} />
          </span>
          <p className="max-w-xl text-[0.76rem] leading-relaxed text-slate-400">
            Want the deeper story? Every machine has a six-stage account of why it was built,
            how it landed and what happened at the end.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => go("games")} className="btn btn-ember !py-2.5 !text-[0.64rem]">
            Try a game <ArrowRight size={13} />
          </button>
          <button onClick={() => go("explore")} className="btn btn-gold !py-2.5 !text-[0.64rem]">
            Open a mission story <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
