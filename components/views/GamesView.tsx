"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Gamepad2, Layers, HelpCircle, Rocket, Star, RotateCcw, MapPin, ListOrdered } from "lucide-react";
import { Breadcrumb, SectionHeader } from "@/components/ui/Atoms";
import { useAfterlight } from "@/lib/store";
import MemoryGame from "@/components/games/MemoryGame";
import QuizGame from "@/components/games/QuizGame";
import LandingGame from "@/components/games/LandingGame";
import FindRoverGame from "@/components/games/FindRoverGame";
import MissionOrderGame from "@/components/games/MissionOrderGame";

type GameId = "memory" | "quiz" | "landing" | "findrover" | "order";

const GAMES: { id: GameId; title: string; tab: string; blurb: string; icon: typeof Layers; how: string }[] = [
  {
    id: "memory",
    title: "Machine Snap",
    tab: "Snap",
    blurb: "Flip the cards and match Opportunity, Curiosity, the Lunar Module, Lunokhod, Ingenuity and Viking.",
    icon: Layers,
    how: "Tap two cards. If they are the same machine, they stay face-up. Find all 6 pairs!",
  },
  {
    id: "quiz",
    title: "Rocket Quiz",
    tab: "Quiz",
    blurb: "10 real space questions from the Learn cards. Answer, then Luffy explains why.",
    icon: HelpCircle,
    how: "Pick the right answer. Every question teaches a real mission fact.",
  },
  {
    id: "landing",
    title: "Soft Landing",
    tab: "Landing",
    blurb: "Stop the needle in the green zone to land gently, 5 times in a row.",
    icon: Rocket,
    how: "Watch the meter bounce. Press Land (or Space) when it is inside the green!",
  },
  {
    id: "findrover",
    title: "Find the Rover",
    tab: "Find",
    blurb: "Match a machine to its landing site on a mini-map. 5 rounds, 3 stars.",
    icon: MapPin,
    how: "Look at the machine, then tap the dot whose landing site matches. 5 rounds.",
  },
  {
    id: "order",
    title: "Mission Order",
    tab: "Order",
    blurb: "Put four mission events in the order they happened.",
    icon: ListOrdered,
    how: "Tap events to place them oldest to newest, then check your order.",
  },
];

export default function GamesView() {
  const { go, gameStars, gamesPlayed, resetProgress } = useAfterlight();
  const [active, setActive] = useState<GameId>("memory");

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "Games" }]} />
      <SectionHeader
        className="mt-4"
        eyebrow="Luffy's game hideout"
        title={
          <>
            Play, learn, <span className="text-gradient-mars">win stars</span>
          </>
        }
        description="Five short games built from the real machines on this site. Stars are saved in your expedition log on this device — no account needed."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-[0.5rem] border-2 border-gold/60 bg-gold/10 px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-gold">
              <Star size={14} /> {gameStars} stars
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-[0.5rem] border-2 border-cyan/40 bg-cyan/10 px-3 py-2 text-[0.66rem] font-bold uppercase tracking-[0.12em] text-cyan">
              <Gamepad2 size={14} /> {gamesPlayed} finished
            </span>
            <button
              onClick={() => {
                if (window.confirm("Reset your game stars and expedition progress?")) resetProgress();
              }}
              className="icon-btn !h-10 !w-10"
              title="Reset progress"
              aria-label="Reset progress"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        }
      />

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {GAMES.map((g) => {
          const Icon = g.icon;
          const isActive = active === g.id;
          return (
            <button
              key={g.id}
              onClick={() => setActive(g.id)}
              className={`rounded-[0.65rem] border-2 p-4 text-left transition ${
                isActive
                  ? "border-gold/80 bg-[linear-gradient(160deg,rgba(50,30,6,0.55),rgba(2,5,12,0.9))] shadow-[0_0_28px_-10px_rgba(255,201,60,0.7)]"
                  : "border-white/12 bg-[linear-gradient(160deg,rgba(6,14,30,0.7),rgba(2,5,12,0.9))] hover:border-cyan/50"
              }`}
              aria-pressed={isActive}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-[0.5rem] border-2 ${isActive ? "border-gold/70 bg-gold/20 text-gold" : "border-cyan/40 bg-cyan/10 text-cyan"}`}>
                <Icon size={20} />
              </span>
              <span className="mt-2 block text-[0.95rem] font-bold text-white">{g.title}</span>
              <span className="mt-1 block text-[0.72rem] leading-relaxed text-slate-400">{g.blurb}</span>
              {isActive && <span className="mt-2 inline-block rounded-[0.4rem] border border-gold/50 bg-gold/10 px-2 py-1 text-[0.56rem] font-bold uppercase tracking-[0.12em] text-gold">Now playing</span>}
            </button>
          );
        })}
      </div>

      <div className="mt-4 overflow-hidden rounded-[0.7rem] border-2 border-cyan/30 bg-[linear-gradient(170deg,rgba(10,24,48,0.92),rgba(2,5,12,0.96))] p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div>
            <h3 className="display text-xl text-white">{GAMES.find((g) => g.id === active)?.title}</h3>
            <p className="mt-0.5 text-[0.72rem] text-slate-400">{GAMES.find((g) => g.id === active)?.how}</p>
          </div>
          <div className="flex gap-1.5">
            {GAMES.map((g) => (
              <button
                key={g.id}
                onClick={() => setActive(g.id)}
                className="chip"
                data-active={active === g.id}
                aria-label={g.title}
              >
                {g.tab}
              </button>
            ))}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="pt-4"
          >
            {active === "memory" && <MemoryGame />}
            {active === "quiz" && <QuizGame />}
            {active === "landing" && <LandingGame />}
            {active === "findrover" && <FindRoverGame />}
            {active === "order" && <MissionOrderGame />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[0.65rem] border-2 border-cyan/25 bg-deep/25 p-4">
        <p className="max-w-xl text-[0.76rem] leading-relaxed text-slate-400">
          Want the deeper story behind a game star? Every machine in Machine Snap has a full 3D
          reconstruction and a six-stage mission story in the equipment archive.
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => go("explore")} className="btn btn-ghost !py-2.5 !text-[0.64rem]">
            Open the machines
          </button>
          <button onClick={() => go("learn")} className="btn btn-gold !py-2.5 !text-[0.64rem]">
            Learn the science
          </button>
        </div>
      </div>
    </div>
  );
}
