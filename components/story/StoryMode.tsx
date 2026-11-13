"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OrbitControls } from "@react-three/drei";
import type * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  ArrowLeft,
  ArrowRight,
  X,
  RotateCcw,
  Volume2,
  VolumeX,
  SkipForward,
  Layers,
  Quote,
} from "lucide-react";
import Scene3D from "@/components/three/Scene3D";
import ArchiveModel from "@/components/models/ArchiveModel";
import { createViewerLayout, ViewerRig } from "@/components/viewer/ViewerScene";
import { useReducedMotion } from "@/components/three/Starfield";
import { assetOf, componentsOf, frameOf } from "@/data/equipment";
import type { Equipment } from "@/data/types";
import { chaptersFor } from "@/data/equipment";
import { speak } from "@/lib/speech";
import { useAfterlight } from "@/lib/store";

export default function StoryMode({
  equipment,
  onClose,
  startAt = 0,
}: {
  equipment: Equipment;
  onClose: () => void;
  startAt?: number;
}) {
  const chapters = useMemo(() => chaptersFor(equipment), [equipment]);
  const [index, setIndex] = useState(startAt);
  const [dir, setDir] = useState(1);
  const [replayVersion, setReplayVersion] = useState(0);
  const { soundOn, toggleSound, markStory } = useAfterlight();
  const chapter = chapters[index];
  const touchX = useRef<number | null>(null);
  const cancelNarration = useRef<() => void>(() => {});
  const modelRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const motionActive = useRef(false);
  const layout = useMemo(createViewerLayout, []);
  const insets = useMemo(() => ({ top: 16, bottom: 64 }), []);
  const reducedMotion = useReducedMotion();
  const [modelReady, setModelReady] = useState(false);
  const [controlsReady, setControlsReady] = useState(false);
  const attachModel = useCallback((model: THREE.Group | null) => {
    modelRef.current = model;
    setModelReady(Boolean(model));
  }, []);
  const attachControls = useCallback((controls: OrbitControlsImpl | null) => {
    controlsRef.current = controls;
    setControlsReady(Boolean(controls));
  }, []);

  const go = (next: number) => {
    const nextIndex = (next + chapters.length) % chapters.length;
    if (nextIndex === index) return;
    cancelNarration.current();
    setDir(next > index ? 1 : -1);
    setIndex(nextIndex);
  };

  const close = useCallback(() => {
    cancelNarration.current();
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (index === chapters.length - 1) markStory(equipment.id);
  }, [index, chapters.length, equipment.id, markStory]);

  // While the story is open it owns the arrow keys — the equipment page's own
  // prev/next handler must not turn the page underneath us.
  useEffect(() => {
    document.body.dataset.storyOpen = "1";
    return () => {
      delete document.body.dataset.storyOpen;
    };
  }, []);

  useEffect(() => {
    if (!soundOn) return;
    const cancel = speak(`${chapter.title}. ${chapter.body.join(" ")}`, { rate: 0.98 });
    cancelNarration.current = cancel;
    return () => {
      cancel();
      if (cancelNarration.current === cancel) cancelNarration.current = () => {};
    };
  }, [chapter, soundOn, replayVersion]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Escape") return;
      e.stopImmediatePropagation();
      if (e.key === "Escape") {
        close();
      }
      if (e.key === "ArrowRight") go(index + 1);
      if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, close]);

  const asset = assetOf(equipment);
  const base = frameOf(equipment);
  // Supply an initial pose; the rig then fits actual meshes at the canvas size.
  const size = Math.max(asset.span ?? 2, asset.height ?? 1.4, 1.2);
  const mul = Math.min(3.6, Math.max(1, size / 2.1));
  const frame = {
    ...base,
    position: base.position.map((v) => v * mul) as [number, number, number],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] overflow-y-auto bg-ink thin-scroll"
      role="dialog"
      aria-modal="true"
      aria-label={`Story mode: ${equipment.name}`}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 60) go(dx > 0 ? index - 1 : index + 1);
        touchX.current = null;
      }}
    >
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.12]" />

      {/* top progress */}
      <div className="sticky top-0 z-20 flex flex-wrap items-center gap-3 border-b border-white/8 bg-ink/85 px-4 py-3 backdrop-blur-xl md:px-8">
        <span className="data min-w-0 break-words text-xs uppercase tracking-[0.12em] text-cyan/80">
          Story mode · {equipment.name}
        </span>
        <div className="order-3 flex w-full items-center gap-1.5 md:order-2 md:w-auto md:flex-1">
          {chapters.map((c, i) => (
            <button
              key={c.id}
              onClick={() => go(i)}
              className="text-action group relative h-11 min-w-0 flex-1 before:absolute before:inset-x-0 before:top-1/2 before:h-1.5 before:-translate-y-1/2 before:rounded-full before:bg-white/10"
              aria-label={`Chapter ${c.number}: ${c.title}`}
            >
              <span
                className={`absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-all ${
                  i < index ? "w-full bg-cyan/50" : i === index ? "w-full bg-gradient-to-r from-cyan to-gold" : "w-0"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="order-2 ml-auto flex items-center gap-1.5 md:order-3">
          <button onClick={toggleSound} className="icon-btn !h-11 !w-11" aria-label={soundOn ? "Mute narration" : "Enable narration"} aria-pressed={soundOn}>
            {soundOn ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <button
            onClick={close}
            className="btn btn-ghost !min-h-11 !px-3 !py-1.5 !text-xs"
          >
            Skip story <X size={12} />
          </button>
        </div>
      </div>

      <div className="relative grid min-h-[calc(100dvh-7rem)] w-full grid-cols-1 content-center gap-6 px-4 pb-24 pt-6 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-10">
        {/* text column */}
        <div className="order-2 lg:order-1">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={chapter.id}
              custom={dir}
              initial={{ opacity: 0, x: dir * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: dir * -30 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-3">
                <span className="display text-5xl text-white/12 sm:text-6xl">{chapter.number}</span>
                <div>
                  <span className="eyebrow text-[0.55rem]">{chapter.kicker}</span>
                  <h2 className="display text-2xl text-white sm:text-3xl md:text-[2.4rem]">
                    {chapter.title}
                  </h2>
                </div>
              </div>

              <div className="mt-5 space-y-5 border-l border-cyan/25 pl-5">
                {chapter.body.map((p, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.12 }}
                    className="text-[0.92rem] leading-[1.75] text-slate-300 first:text-slate-100 sm:text-base"
                  >
                    {p}
                  </motion.p>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 rounded-xl border border-cyan/20 bg-deep/30 px-3 py-2.5">
                <Quote size={14} className="shrink-0 text-cyan" />
                <p className="text-[0.72rem] leading-snug text-slate-400">
                  {equipment.planet === "mars"
                    ? "All dates and figures on this page come from NASA mission records unless marked as an estimate."
                    : "Apollo-era records come from NASA history archives; coordinates are from lunar orbiter targeting."}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center gap-2">
            <button onClick={() => go(index - 1)} className="btn btn-ghost !py-2.5 !text-[0.66rem]">
              <ArrowLeft size={14} /> Previous
            </button>
            <button onClick={() => go(index + 1)} className="btn btn-gold !py-2.5 !text-[0.66rem]">
              {index === chapters.length - 1 ? "Back to chapter 1" : "Next chapter"} <ArrowRight size={14} />
            </button>
            <button
              onClick={() => {
                cancelNarration.current();
                setIndex(0);
                setDir(-1);
                setReplayVersion((version) => version + 1);
              }}
              className="btn btn-ghost !py-2.5 !text-[0.66rem]"
            >
              <RotateCcw size={13} /> Replay
            </button>
            <button onClick={close} className="btn btn-ghost !py-2.5 !text-[0.66rem]">
              <SkipForward size={13} /> Exit story
            </button>
          </div>

          <p className="mt-4 text-[0.6rem] uppercase tracking-[0.18em] text-slate-600">
            Chapter {index + 1} of {chapters.length} · arrow keys navigate · swipe on mobile
          </p>
        </div>

        {/* 3D column */}
        <div className="order-1 lg:order-2">
          <div className="relative overflow-hidden rounded-2xl border border-cyan/25 bg-[radial-gradient(120%_100%_at_50%_0%,#12264a,#04070f)]">
            <Scene3D
              alwaysRender
              className="h-[38vh] min-h-[260px] w-full lg:h-[52vh]"
              cameraPosition={frame.position}
              fov={36}
              fallback={
                <img src={equipment.image} alt={equipment.imageCaption} className="h-full w-full object-cover" />
              }
            >
              <color attach="background" args={["#050b18"]} />
              <ambientLight intensity={0.5} color="#a9ccff" />
              <directionalLight position={[5, 7, 5]} intensity={2.2} color="#ffe2bd" />
              <directionalLight position={[-6, 3, -4]} intensity={0.9} color="#4f9dff" />
              <Suspense fallback={null}>
                <group ref={attachModel} rotation={[0, 0.3, 0]}>
                  <ArchiveModel asset={asset} components={componentsOf(equipment)} showLabels={false} />
                </group>
                <OrbitControls
                  ref={attachControls}
                  enablePan={false}
                  autoRotate={!reducedMotion}
                  autoRotateSpeed={0.7}
                  onStart={() => { motionActive.current = false; }}
                  maxPolarAngle={Math.PI / 1.9}
                />
                <ViewerRig
                  modelRef={modelRef}
                  controls={controlsRef}
                  layout={layout}
                  modelId={equipment.id}
                  amount={0}
                  selected={null}
                  fitRequest={0}
                  reducedMotion={reducedMotion}
                  motionActive={motionActive}
                  ready={modelReady && controlsReady}
                  insets={insets}
                />
              </Suspense>
            </Scene3D>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 to-transparent px-4 pb-3 pt-10">
              <div className="flex items-center justify-between gap-2">
                <span className="data text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                  {equipment.shortName} · drag to inspect
                </span>
                <span className="inline-flex items-center gap-1 text-[0.55rem] uppercase tracking-[0.16em] text-slate-500">
                  <Layers size={10} /> reconstruction
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            {[
              { label: "Mission", value: equipment.mission.split("—")[0] },
              { label: "Landed", value: equipment.landed.split(",")[0] },
              { label: "Status", value: equipment.status === "active" ? "Operating" : "Silent" },
            ].map((s) => (
              <div key={s.label} className="rounded-lg border border-white/8 bg-deep/30 px-2.5 py-2">
                <div className="text-[0.5rem] uppercase tracking-[0.14em] text-slate-500">{s.label}</div>
                <div className="truncate text-[0.68rem] text-slate-200">{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* bottom film controls */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/8 bg-ink/90 px-4 py-3 backdrop-blur-xl md:px-8">
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-mars" />
            Narration {soundOn ? "on" : "muted"} · subtitles always on
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => go(index - 1)} className="icon-btn !h-9 !w-9" aria-label="Previous chapter">
              <ArrowLeft size={15} />
            </button>
            <button onClick={() => go(index + 1)} className="icon-btn !h-9 !w-9" aria-label="Next chapter">
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
