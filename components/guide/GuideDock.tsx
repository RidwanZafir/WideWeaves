"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, VolumeX, RotateCcw, X, MessageCircle, ChevronRight } from "lucide-react";
import Luffy from "./Luffy";
import { useAfterlight } from "@/lib/store";
import { speak, speechSupported } from "@/lib/speech";
import { REACTIONS, VIEW_LINES } from "@/data/guide";
import type { Expression, Pose } from "@/data/types";

function useTypewriter(text: string, enabled: boolean) {
  const [shown, setShown] = useState("");
  const doneRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    doneRef.current = false;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduce) {
      setShown(text);
      doneRef.current = true;
      return;
    }
    setShown("");
    let i = 0;
    const step = Math.max(12, Math.min(26, 2600 / Math.max(text.length, 1)));
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        doneRef.current = true;
        window.clearInterval(id);
        timerRef.current = null;
      }
    }, step);
    timerRef.current = id;
    return () => {
      window.clearInterval(id);
      timerRef.current = null;
    };
  }, [text, enabled]);

  const finish = () => {
    if (!doneRef.current) {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      timerRef.current = null;
      setShown(text);
      doneRef.current = true;
    }
  };

  return { shown, finish, done: shown === text };
}

export default function GuideDock() {
  const {
    view,
    planet,
    guideLine,
    guideCtx,
    guideKey,
    soundOn,
    toggleSound,
    guideOpen,
    setGuideOpen,
    dismissGuide,
    stage,
    equipmentId,
  } = useAfterlight();

  const fallback = useMemo(() => {
    if (view === "equipment" && equipmentId && REACTIONS[equipmentId]) return REACTIONS[equipmentId];
    return VIEW_LINES[view] ?? VIEW_LINES.home;
  }, [view, equipmentId]);

  // a line only applies to the page it was spoken on; otherwise the view's own
  // line takes over instead of an old reaction following the visitor around
  const ctx = `${view}|${equipmentId ?? ""}`;
  const line = (guideLine && guideCtx === ctx ? guideLine : null) ?? fallback;
  const lineKey = `${guideKey}-${line.text}`;
  const { shown, finish, done } = useTypewriter(line.text, guideOpen);
  const [talking, setTalking] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const cancelNarration = useRef<() => void>(() => {});
  const narrationActive = useRef(false);
  const collapseDue = useRef(false);

  useEffect(() => {
    setTalking(false);
    narrationActive.current = false;
    collapseDue.current = false;
    if (!guideOpen || !soundOn || !speechSupported()) return;
    if (stage === "intro" || document.body.dataset.storyOpen === "1") return;
    let live = true;
    narrationActive.current = true;
    const cancel = speak(line.text, {
      onStart: () => { if (live) setTalking(true); },
      onEnd: () => {
        if (!live) return;
        narrationActive.current = false;
        setTalking(false);
        if (collapseDue.current) setGuideOpen(false);
      },
    });
    cancelNarration.current = cancel;
    return () => {
      live = false;
      narrationActive.current = false;
      cancel();
      if (cancelNarration.current === cancel) cancelNarration.current = () => {};
      setTalking(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineKey, replayKey, guideOpen, soundOn, stage]);

  // After a new line is delivered, step back to the avatar so the guide never
  // sits on top of the page the student is reading. Let loading/playback finish
  // if its usual deadline arrives first; manual minimize still cancels at once.
  useEffect(() => {
    if (!guideOpen) return;
    collapseDue.current = false;
    // phones have no room to spare, so Luffy steps back sooner there
    const ms = typeof window !== "undefined" && window.innerWidth < 768 ? 7000 : 12000;
    const t = window.setTimeout(() => {
      if (narrationActive.current) { collapseDue.current = true; return; }
      setGuideOpen(false);
    }, ms);
    return () => window.clearTimeout(t);
  }, [guideOpen, lineKey, replayKey, setGuideOpen]);

  if (stage === "intro") return null;

  const expression: Expression = line.expression ?? "grin";
  const pose: Pose = line.pose ?? "idle";

  return (
    <>
      <AnimatePresence>
        {!guideOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            onClick={() => setGuideOpen(true)}
            className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] left-6 z-40 hidden min-h-11 min-w-11 items-center rounded-[0.6rem] border-2 border-cyan/60 bg-abyss/95 p-1.5 text-xs font-bold uppercase tracking-[0.14em] text-cyan shadow-[0_4px_0_rgba(2,16,38,0.9),0_0_30px_-8px_rgba(63,231,255,0.7)] backdrop-blur focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan md:flex"
            aria-label="Open Luffy's guide"
          >
            <span className="grid h-9 w-9 place-items-center overflow-hidden rounded-[0.45rem] border-2 border-white/25 bg-deep/80">
              <Luffy compact className="h-9 w-9" expression="grin" pose="wave" />
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {guideOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 26, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="fixed bottom-[calc(5.2rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 mx-auto max-w-sm md:bottom-[max(1.25rem,env(safe-area-inset-bottom))] md:left-4 md:right-auto md:mx-0 md:w-[22rem]"
            aria-label="Luffy's expedition guide"
          >
            <div className="relative max-h-[calc(100dvh-10rem)] overflow-y-auto overscroll-contain rounded-2xl border border-cyan/30 bg-[linear-gradient(160deg,rgba(6,14,30,0.94),rgba(3,8,18,0.96))] p-3 shadow-[0_28px_80px_-30px_rgba(0,0,0,0.95),0_0_0_1px_rgba(63,231,255,0.08)] backdrop-blur-xl sm:p-4">
              <span className="pointer-events-none absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-cyan/70 to-transparent" />
              <p className="sr-only" role="status">{line.text}</p>
              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-cyan">Luffy</p>
                  <p className="data text-[0.6rem] uppercase tracking-[0.12em] text-cyan/70">Expedition guide</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => {
                      if (soundOn) setReplayKey((key) => key + 1);
                    }}
                    disabled={!soundOn}
                    className="grid h-11 w-11 place-items-center rounded-lg border border-cyan/15 bg-cyan/5 text-cyan/80 transition hover:border-cyan/50 hover:bg-cyan/15 hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Replay Luffy's line"
                    title={soundOn ? "Replay voice" : "Enable voice to replay"}
                  >
                    <RotateCcw size={16} />
                  </button>
                  <button
                    onClick={toggleSound}
                    className="grid h-11 w-11 place-items-center rounded-lg border border-cyan/15 bg-cyan/5 text-cyan/80 transition hover:border-cyan/50 hover:bg-cyan/15 hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
                    aria-label={soundOn ? "Mute Luffy" : "Unmute Luffy"}
                    aria-pressed={soundOn}
                    title={soundOn ? "Voice on" : "Voice off"}
                  >
                    {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  <button
                    onClick={() => {
                      cancelNarration.current();
                      dismissGuide();
                    }}
                    className="grid h-11 w-11 place-items-center rounded-lg border border-cyan/15 bg-cyan/5 text-cyan/80 transition hover:border-cyan/50 hover:bg-cyan/15 hover:text-cyan focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
                    aria-label="Minimise guide"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="relative -mt-1 h-[4.6rem] w-[3.4rem] shrink-0">
                  <Luffy
                    className="h-full w-full drop-shadow-[0_8px_18px_rgba(0,0,0,0.6)]"
                    expression={expression}
                    pose={pose}
                    talking={talking}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <button
                    onClick={finish}
                    className="text-action block w-full cursor-pointer rounded-md text-left text-sm leading-relaxed break-words text-slate-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan"
                    aria-label={line.text}
                  >
                    {shown}
                    {!done && <span aria-hidden="true" className="ml-0.5 inline-block h-3.5 w-1 animate-pulse bg-cyan align-middle" />}
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t border-cyan/15 pt-2 text-[0.6rem] uppercase tracking-[0.1em] text-cyan/65">
                <MessageCircle size={11} className="shrink-0" />
                <span>{soundOn ? "Voice on" : "Voice off"}</span>
                <ChevronRight size={11} className="ml-auto shrink-0" />
                <span>{planet === "mars" ? "Mars expedition" : "Lunar expedition"}</span>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
