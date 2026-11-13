"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { ArrowLeft, ArrowRight, SkipForward, Volume2, VolumeX, RotateCcw, Globe2 } from "lucide-react";
import type { RootExpeditionMode } from "@/components/three/RootExpeditionScene";
import Luffy from "@/components/guide/Luffy";
import { Logo } from "@/components/ui/Atoms";
import { INTRO } from "@/data/guide";
import { useAfterlight } from "@/lib/store";
import { speak, stopSpeech } from "@/lib/speech";

const RootExpeditionScene = dynamic(() => import("@/components/three/RootExpeditionScene"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-[#020817]" />,
});

export default function IntroSequence({ onChooseDestination }: { onChooseDestination: () => void | Promise<void> }) {
  const { completeIntro, soundOn, toggleSound, setStage, go } = useAfterlight();
  const [step, setStep] = useState(-1); // -1 = title card
  const [typed, setTyped] = useState("");
  const [talking, setTalking] = useState(false);
  const [replayVersion, setReplayVersion] = useState(0);
  const messageRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const previousStepRef = useRef(-1);

  const line = step >= 0 ? INTRO[step] : null;
  const sceneMode: RootExpeditionMode =
    step < 1 ? "intro" : step === 1 ? "moon" : step === 2 ? "mars" : "selection";

  const skip = useCallback(() => {
    stopSpeech();
    void onChooseDestination();
  }, [onChooseDestination]);

  const goToMap = () => {
    stopSpeech();
    completeIntro();
    setStage("explore");
    go("map");
  };

  const finish = useCallback(() => {
    stopSpeech();
    void onChooseDestination();
  }, [onChooseDestination]);

  const next = useCallback(() => {
    stopSpeech();
    if (step === -1) {
      setStep(0);
      return;
    }
    if (step >= INTRO.length - 1) {
      finish();
      return;
    }
    setStep((s) => s + 1);
  }, [step, finish]);

  const replay = () => {
    stopSpeech();
    setReplayVersion((version) => version + 1);
  };

  const previous = useCallback(() => {
    stopSpeech();
    setStep((current) => Math.max(-1, current - 1));
  }, []);

  // typewriter for the current line
  useEffect(() => {
    if (!line) return;
    setTyped("");
    let i = 0;
    const step = Math.max(12, Math.min(24, 1100 / Math.max(line.text.length, 1)));
    const id = window.setInterval(() => {
      i += 1;
      setTyped(line.text.slice(0, i));
      if (i >= line.text.length) {
        window.clearInterval(id);
      }
    }, step);
    return () => window.clearInterval(id);
  }, [line, replayVersion]);

  // narration
  useEffect(() => {
    setTalking(false);
    if (!line || !soundOn) return;
    let live = true;
    const cancel = speak(line.text, {
      rate: 1,
      onStart: () => { if (live) setTalking(true); },
      onEnd: () => { if (live) setTalking(false); },
    });
    return () => { live = false; cancel(); };
  }, [line, soundOn, replayVersion]);

  // The long title can still be leaving while dialogue enters in normal flow.
  // Reveal the message once per step, without following every typewriter tick.
  useEffect(() => {
    const beganDialogue = previousStepRef.current < 0 && step >= 0;
    previousStepRef.current = step;
    if (step < 0) return;
    const frame = requestAnimationFrame(() => {
      if (beganDialogue) nextRef.current?.focus({ preventScroll: true });
      // Instant scrolling adds no motion, including for reduced-motion visitors.
      messageRef.current?.scrollIntoView({ block: "end", inline: "nearest", behavior: "instant" });
    });
    return () => cancelAnimationFrame(frame);
  }, [step]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { searchOpen, menuOpen } = useAfterlight.getState();
      if (searchOpen || menuOpen || e.defaultPrevented) return;
      if (e.key === "Escape") {
        skip();
        return;
      }

      // Let focused controls handle their own keyboard activation. Without
      // this guard, Enter on Replay, Previous, or a progress dot is consumed
      // here and advances the expedition instead of activating that control.
      const target = e.target as HTMLElement | null;
      if (target?.closest("button, a, input, textarea, select, [contenteditable='true']")) return;

      if (e.key === "Enter" || e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") previous();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, previous, skip]);

  return (
    <div className="fixed inset-0 z-50 overflow-x-hidden overflow-y-auto overscroll-contain bg-ink">
      <div className="fixed inset-0">
        <RootExpeditionScene className="absolute inset-0" mode={sceneMode} />
      </div>

      {/* cinematic scrims */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_30%,rgba(2,4,10,0.82)_100%)]" />
      {step === -1 && <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(2,8,23,0.8),rgba(2,8,23,0.6))] sm:bg-[linear-gradient(90deg,rgba(2,8,23,0.78),rgba(2,8,23,0.45)_42%,transparent_66%)]" />}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/60 to-transparent" />

      <div className="pointer-events-none relative z-10 flex min-h-full flex-col">
      {/* top bar */}
      <div className="pointer-events-auto relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5 md:px-10">
        <Logo />
        <div className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
          <button onClick={toggleSound} className="icon-btn" aria-label={soundOn ? "Mute narration" : "Enable narration"}>
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button onClick={skip} className="btn btn-ghost !px-4 !py-2 !text-[0.62rem]">
            Skip intro <SkipForward size={13} />
          </button>
        </div>
      </div>

      {/* title card */}
      <AnimatePresence mode="wait">
        {step === -1 && (
          <motion.div
            key="title"
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto relative z-10 flex w-full flex-1 flex-col justify-center px-4 py-6 sm:px-5 md:px-10"
          >
            <span className="eyebrow mb-4">A space apps expedition · 2026</span>
            <h1 className="display text-[11.5vw] leading-[0.88] text-white drop-shadow-[0_2px_12px_rgba(2,8,23,0.9)] sm:w-[56%] sm:text-[6vw] lg:text-[clamp(3.5rem,6vw,7.5rem)]">
              <span className="block">THE MISSIONS</span>
              <span className="block text-gradient-mars">ENDED.</span>
              <span className="block">THE STORIES</span>
              <span className="block text-gradient-ice">DIDN&rsquo;T.</span>
            </h1>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-slate-100 [text-shadow:0_1px_12px_#020817] md:text-base">
              Humanity left machines on the Moon and Mars. Most have gone silent. Every one of
              them still has a story — and a guide who wants to hear it.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button onClick={next} className="btn btn-gold root-depth-button !px-7 !py-3.5">
                Begin the expedition <ArrowRight size={16} />
              </button>
              <button onClick={goToMap} className="btn btn-ghost root-depth-button root-depth-button--blue">
                <Globe2 size={14} /> Straight to the map
              </button>
            </div>
            <div className="mt-8 flex items-center gap-4 text-[0.6rem] uppercase tracking-[0.2em] text-slate-500">
              <span className="h-px w-10 shrink-0 bg-cyan/40" />
              Sound on for narration · press enter to continue
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* dialogue */}
      {line && (
        <div className="pointer-events-auto relative z-10 mt-auto px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:px-10 md:pb-8">
          <div className="flex w-full flex-col items-center gap-2.5 md:gap-3">
            <motion.div
              key={`luffy-${step}`}
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="relative h-[clamp(4.5rem,26dvh,18.75rem)] w-[22vw] min-w-[90px] max-w-[240px] shrink-0"
            >
              <div className="absolute inset-x-0 bottom-0 h-2/3 rounded-full bg-[radial-gradient(circle,rgba(63,231,255,0.22),transparent_70%)] blur-2xl" />
              <Luffy
                className="relative h-full w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                expression={line.expression}
                pose={line.pose}
                talking={talking}
              />
            </motion.div>

            <div ref={messageRef} className="min-w-0 w-full max-w-[38rem] pb-1">
              <div className="mb-2 flex flex-wrap items-center justify-center gap-3">
                <span className="data text-[0.58rem] uppercase tracking-[0.28em] text-cyan">
                  Luffy · expedition guide
                </span>
                <span className="h-1 w-1 rounded-full bg-cyan/60" />
                <span className="data text-[0.55rem] uppercase tracking-[0.2em] text-slate-500">
                  {step + 1} / {INTRO.length}
                </span>
              </div>

              <div className="relative w-full max-w-[38rem] rounded-2xl border border-cyan/35 bg-[linear-gradient(150deg,rgba(11,28,56,0.95),rgba(3,8,18,0.96))] px-3 py-3 shadow-[0_30px_80px_-30px_#000] backdrop-blur-xl md:px-5 md:py-4">
                <span className="absolute -top-2 left-1/2 hidden h-4 w-4 -translate-x-1/2 rotate-45 border-l border-t border-cyan/35 bg-[#081226] md:block" />
                <p className="relative font-sans text-[1.05rem] font-medium leading-[1.4] tracking-normal text-white sm:text-lg md:text-xl">
                  {/* Reserve the finished line's height so Next stays visible while typing. */}
                  <span aria-hidden="true" className="invisible">
                    {line.text}<span className="ml-1 inline-block h-[0.9em] w-[2px] align-middle" />
                  </span>
                  <span className="absolute inset-0">
                    {typed}
                    <span className="ml-1 inline-block h-[0.9em] w-[2px] animate-pulse bg-cyan/70 align-middle" />
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-1.5">
                    {INTRO.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { if (i !== step) { stopSpeech(); setStep(i); } }}
                        aria-label={`Go to step ${i + 1}`}
                        aria-current={i === step ? "step" : undefined}
                        className="grid h-11 w-11 place-items-center rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan"
                      >
                        <span aria-hidden="true" className={`h-1.5 rounded-full transition-all ${
                          i === step ? "w-7 bg-cyan" : i < step ? "w-3 bg-cyan/50" : "w-3 bg-white/15"
                        }`} />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                    <button onClick={previous} className="btn btn-ghost !min-h-11 !px-3 !py-2 !text-[0.6rem]">
                      <ArrowLeft size={12} /> Previous
                    </button>
                    <button onClick={replay} className="btn btn-ghost !min-h-11 !px-3 !py-2 !text-[0.6rem]" title="Replay dialogue">
                      <RotateCcw size={12} /> Replay
                    </button>
                    <button ref={nextRef} onClick={next} className="btn btn-gold !min-h-11 !px-4 !py-2.5 !text-[0.66rem]">
                      {step === INTRO.length - 1 ? "Choose destination" : "Next"}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>

      {/* film grain */}
      <div className="pointer-events-none fixed inset-0 noise opacity-[0.35]" />
    </div>
  );
}
