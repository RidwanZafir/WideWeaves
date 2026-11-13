"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AnimatePresence, motion } from "framer-motion";
import { OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  Box,
  Boxes,
  Maximize2,
  Minimize2,
  RotateCcw,
  Tags,
  X,
  Info,
  Rotate3D,
  ZoomIn,
  Move3d,
} from "lucide-react";
import Scene3D from "@/components/three/Scene3D";
import ArchiveModel, { assetLabel } from "@/components/models/ArchiveModel";
import type { Equipment } from "@/data/types";
import { assetOf, componentsOf, frameOf } from "@/data/equipment";
import { modelRepresentationLabel, modelRepresentationNote } from "@/data/image-provenance";
import { createViewerLayout, ViewerLighting, ViewerRig, ViewerStage } from "./ViewerScene";

type Mode = "assembled" | "exploded";

export default function EquipmentViewer({
  equipment,
  height = "clamp(360px, 52vh, 620px)",
  selectedComponent: controlledSelected,
  onSelectedComponentChange,
  showComponentChips = true,
  showSelectionPanel = true,
}: {
  equipment: Equipment;
  height?: string;
  selectedComponent?: string | null;
  onSelectedComponentChange?: (id: string | null) => void;
  showComponentChips?: boolean;
  showSelectionPanel?: boolean;
}) {
  const [mode, setMode] = useState<Mode>("assembled");
  const [labels, setLabels] = useState(true);
  const [internalSelected, setInternalSelected] = useState<string | null>(null);
  const selected = controlledSelected === undefined ? internalSelected : controlledSelected;
  const [nativeFull, setNativeFull] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [fitRequest, requestFit] = useState(0);
  const full = nativeFull || expanded;
  const [reducedMotion, setReducedMotion] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [insets, setInsets] = useState({ top: 112, bottom: 100 });
  const modelRef = useRef<THREE.Group>(null);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [controlsReady, setControlsReady] = useState(false);
  const motionActive = useRef(false);
  const layout = useMemo(createViewerLayout, []);
  const attachModel = useCallback((model: THREE.Group | null) => {
    modelRef.current = model;
    setModelReady(Boolean(model));
  }, []);
  const attachControls = useCallback((orbit: OrbitControlsImpl | null) => {
    controls.current = orbit;
    setControlsReady(Boolean(orbit));
  }, []);

  const selectComponent = (id: string | null) => {
    setInternalSelected(id);
    onSelectedComponentChange?.(id);
  };

  const asset = assetOf(equipment);
  const frame = frameOf(equipment);
  const components = componentsOf(equipment);
  const selectedMeta = components.find((c) => c.id === selected) ?? null;
  const family = assetLabel(asset);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(preference.matches);
    updateMotion();
    preference.addEventListener("change", updateMotion);
    return () => preference.removeEventListener("change", updateMotion);
  }, []);

  useEffect(() => {
    const host = wrapRef.current;
    const title = titleRef.current;
    const toolbar = toolbarRef.current;
    if (!host || !title || !toolbar) return;
    const measure = () => {
      const hostBox = host.getBoundingClientRect();
      const top = Math.ceil(title.getBoundingClientRect().bottom - hostBox.top + 12);
      const bottom = Math.ceil(toolbar.getBoundingClientRect().height + 12);
      setInsets((current) => current.top === top && current.bottom === bottom ? current : { top, bottom });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    observer.observe(title);
    observer.observe(toolbar);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onFs = () => setNativeFull(document.fullscreenElement === wrapRef.current);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onEscape);
    };
  }, [expanded]);

  const toggleFull = async () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    try {
      if (document.fullscreenElement === wrapRef.current) await document.exitFullscreen();
      else if (wrapRef.current?.requestFullscreen) await wrapRef.current.requestFullscreen();
      else setExpanded(true);
    } catch {
      setExpanded(true);
    }
  };

  const reset = () => {
    setMode("assembled");
    selectComponent(null);
    requestFit((request) => request + 1);
  };

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-[1.1rem] border border-cyan/25 bg-[radial-gradient(120%_100%_at_50%_0%,#132a52_0%,#081227_45%,#04070f_100%)]"
      role="group"
      aria-label={`${equipment.name} interactive 3D model`}
      style={expanded
        ? { position: "fixed", inset: 0, zIndex: 120, width: "100vw", height: "100dvh", borderRadius: 0 }
        : { height: full ? "100dvh" : height, position: "relative" }}
    >
      {/* starfield-ish backdrop for the stage */}
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan/8 to-transparent" />

      <Scene3D
        alwaysRender
        className="absolute inset-0"
        cameraPosition={frame.position}
        fov={38}
        fallback={
          <div className="relative h-full w-full">
            <img src={equipment.image} alt={equipment.imageCaption} className="h-full w-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
            <div className="absolute inset-x-3 bottom-28 rounded-xl border border-gold/40 bg-ink/80 px-3 py-2 text-center text-sm text-gold sm:inset-x-8">
              <p>3D rendering unavailable on this device — showing the credited mission image.</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{equipment.imageCaption}</p>
            </div>
          </div>
        }
      >
        <color attach="background" args={["#050a16"]} />
        <ViewerLighting />

        <group ref={attachModel} position={[0, 0, 0]}>
          <ArchiveModel
            asset={asset}
            components={components}
            amount={mode === "exploded" ? 1 : 0}
            selected={selected}
            onSelect={selectComponent}
            showLabels={labels}
          />
        </group>
        <OrbitControls
          ref={attachControls}
          enablePan
          enableZoom
          zoomSpeed={0.8}
          rotateSpeed={0.7}
          enableDamping
          dampingFactor={0.08}
          autoRotate={false}
          minPolarAngle={0.12}
          maxPolarAngle={Math.PI / 1.85}
          onStart={() => { motionActive.current = false; }}
          makeDefault
        />
        <ViewerRig
          modelRef={modelRef}
          controls={controls}
          layout={layout}
          modelId={equipment.id}
          amount={mode === "exploded" ? 1 : 0}
          selected={selected}
          fitRequest={fitRequest}
          reducedMotion={reducedMotion}
          motionActive={motionActive}
          ready={modelReady && controlsReady}
          labelsVisible={labels}
          insets={insets}
        />
        <ViewerStage layout={layout} reducedMotion={reducedMotion} />
      </Scene3D>

      {/* top-left identity */}
      <div ref={titleRef} className="pointer-events-none absolute left-3 top-3 flex min-w-0 flex-col gap-1 rounded-[0.65rem] border border-white/12 bg-ink/80 px-2.5 py-2 backdrop-blur-md sm:left-4 sm:top-4 sm:px-3" style={{ maxWidth: "min(70%, calc(100% - 8rem))" }}>
        <span className="eyebrow text-[0.55rem] text-cyan/90">Interactive model</span>
        <span className="display line-clamp-2 break-words text-sm text-white sm:text-lg md:text-xl" title={equipment.name}>{equipment.name}</span>
        <span className="data break-words text-[0.625rem] leading-relaxed text-slate-300">
          {family ? `${family} · ` : ""}
          {modelRepresentationLabel(asset)}
        </span>
        <span className="sr-only">{modelRepresentationNote(asset)}</span>
      </div>

      {/* top-right tool buttons */}
      <div className="absolute right-3 top-3 flex items-center gap-1.5">
        <button
          onClick={() => setLabels((l) => !l)}
          className={`icon-btn !h-11 !w-11 ${labels ? "!border-cyan/70 !text-cyan" : ""}`}
          title={labels ? "Hide component labels" : "Show component labels"}
          aria-label={labels ? "Hide component labels" : "Show component labels"}
          aria-pressed={labels}
        >
          <Tags size={15} />
        </button>
        <button
          onClick={toggleFull}
          className="icon-btn !h-11 !w-11"
          title={full ? "Exit fullscreen" : "Fullscreen"}
          aria-label={full ? "Exit fullscreen" : "Fullscreen"}
          aria-pressed={full}
        >
          {full ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* hints */}
      <div className="pointer-events-none absolute bottom-[4.6rem] left-4 hidden items-center gap-3 text-[0.6rem] uppercase tracking-[0.16em] text-slate-400/80 md:flex">
        <span className="inline-flex items-center gap-1"><Rotate3D size={12} /> drag to rotate</span>
        <span className="inline-flex items-center gap-1"><ZoomIn size={12} /> scroll to zoom</span>
        <span className="inline-flex items-center gap-1"><Move3d size={12} /> right-drag to pan</span>
      </div>

      {/* selected component info */}
      <AnimatePresence>
        {showSelectionPanel && selectedMeta && (
          <motion.div
            initial={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reducedMotion ? 0 : 24 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="absolute right-3 top-16 z-10 w-[min(19rem,88%)] rounded-xl border border-gold/35 bg-[linear-gradient(160deg,rgba(28,18,6,0.96),rgba(6,10,20,0.97))] p-3.5 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <div>
                <div className="data text-[0.55rem] uppercase tracking-[0.2em] text-gold/80">
                  {selectedMeta.group}
                </div>
                <h4 className="text-sm font-semibold text-white">{selectedMeta.label}</h4>
              </div>
              <button onClick={() => selectComponent(null)} className="text-action grid min-h-11 min-w-11 place-items-center text-slate-300 hover:text-white" aria-label="Close component">
                <X size={14} />
              </button>
            </div>
            <p className="text-[0.76rem] leading-relaxed text-slate-300">{selectedMeta.description}</p>
            {selectedMeta.spec && (
              <div className="mt-2 inline-flex rounded-md border border-gold/30 px-2 py-1 data text-[0.6rem] text-gold/90">
                {selectedMeta.spec}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* bottom controls — matches the reference ASSEMBLED / EXPLODED / RESET bar */}
      <div ref={toolbarRef} className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-2 border-t border-white/5 bg-gradient-to-t from-ink/95 via-ink/70 to-transparent px-2 pb-3 pt-6 sm:px-3" style={{ paddingBottom: full ? "max(0.75rem, env(safe-area-inset-bottom))" : undefined }}>
        <div className="flex items-center gap-1.5 rounded-[0.55rem] border-2 border-white/15 bg-abyss/90 p-1 backdrop-blur">
          <button
            onClick={() => {
              setMode("assembled");
              selectComponent(null);
            }}
            aria-pressed={mode === "assembled"}
            className={`flex min-h-11 items-center gap-1.5 rounded-[0.45rem] border-2 px-2 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.08em] transition sm:px-3.5 sm:tracking-[0.14em] ${
              mode === "assembled" ? "border-white/25 bg-white/15 text-white" : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Box size={14} /> Assembled
          </button>
          <button
            onClick={() => setMode("exploded")}
            aria-pressed={mode === "exploded"}
            aria-label="Exploded view"
            className={`flex min-h-11 items-center gap-1.5 rounded-[0.45rem] border-2 px-2 py-2 text-[0.6875rem] font-bold uppercase tracking-[0.08em] transition sm:px-3.5 sm:tracking-[0.14em] ${
              mode === "exploded"
                ? "border-gold/80 bg-gradient-to-b from-sand to-gold text-[#21160a] shadow-[0_0_22px_-6px_rgba(255,201,60,0.9)]"
                : "border-transparent text-slate-300 hover:text-white"
            }`}
          >
            <Boxes size={14} /> <span>Exploded<span className="hidden sm:inline"> view</span></span>
          </button>
        </div>
        <button onClick={reset} className="btn btn-ghost !px-3 !py-2.5 !text-[0.66rem] sm:!px-4" aria-label="Reset viewer" title="Reset viewer">
          <RotateCcw size={14} /> <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* component chips */}
      {showComponentChips && <div className="pointer-events-none absolute inset-x-0 top-14 hidden justify-center px-16 lg:flex">
        <div className="pointer-events-auto flex max-w-full flex-wrap justify-center gap-1.5">
          {components.slice(0, 4).map((c) => (
            <button
              key={c.id}
              onClick={() => selectComponent(c.id === selected ? null : c.id)}
              aria-pressed={c.id === selected}
              className={`rounded-[0.45rem] border-2 bg-abyss/85 px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] backdrop-blur transition hover:border-cyan/80 hover:text-white ${c.id === selected ? "border-gold/70 text-gold" : "border-cyan/35 text-slate-200"}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>}

      <div className="pointer-events-none absolute bottom-[4.6rem] right-4 hidden items-center gap-1.5 rounded-[0.5rem] border-2 border-white/15 bg-abyss/85 px-2.5 py-1 text-[0.58rem] text-slate-300 backdrop-blur md:flex">
        <Info size={11} /> {components.length} documented components
      </div>
    </div>
  );
}
