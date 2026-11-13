"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  ExternalLink,
  Flag,
  History,
  MapPin,
  Orbit,
  RotateCcw,
  Sparkles,
  Target,
  Telescope,
  Wrench,
} from "lucide-react";
import EquipmentViewer from "@/components/viewer/EquipmentViewer";
import { modelRepresentationLabel, modelRepresentationNote } from "@/data/image-provenance";
import { StatusPill } from "@/components/ui/Atoms";
import {
  CATEGORY_LABEL,
  IMPORTANCE_LABEL,
  IMPORTANCE_TONE,
  PLANET_LABEL,
  STATUS_LABEL,
  assetOf,
  componentsOf,
  importanceOf,
} from "@/data/equipment";
import { TIMELINE } from "@/data/timeline";
import type { Equipment, GuideLine, ModelComponent } from "@/data/types";
import { useAfterlight } from "@/lib/store";
import styles from "./EquipmentExperience.module.css";

const TOUR_STAGES = [
  { title: "Meet the machine", icon: Orbit },
  { title: "Why it was built", icon: Target },
  { title: "Explore components", icon: Wrench },
  { title: "The mission journey", icon: Compass },
  { title: "What happened", icon: Flag },
  { title: "Discover its legacy", icon: Sparkles },
] as const;

function compactCopy(text: string | undefined, maxWords = 38) {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;—-]$/, "")}…`;
}

function storyText(equipment: Equipment, key: "what" | "history" | "journey" | "landing" | "fate" | "legacy") {
  if (equipment.record?.[key]) return equipment.record[key];
  const map = {
    what: equipment.summary,
    history: equipment.story.beginning,
    journey: equipment.story.journey,
    landing: equipment.story.landing,
    fate: equipment.story.finalDays,
    legacy: equipment.story.legacy,
  } as const;
  const value = map[key];
  return Array.isArray(value) ? value.join(" ") : value;
}

function guideLineFor(equipment: Equipment, step: number, component?: ModelComponent | null): GuideLine {
  const objective = equipment.objectives[0];
  const lines = [
    `Meet ${equipment.shortName}. ${compactCopy(storyText(equipment, "what"), 22)}`,
    objective
      ? `It was built to ${compactCopy(objective, 22)}`
      : `Its mission was ${compactCopy(storyText(equipment, "history"), 22)}`,
    component
      ? `${component.label}: ${compactCopy(component.description, 21)}`
      : `Choose a labeled part to explore this ${equipment.category}.`,
    `Follow its journey. ${compactCopy(storyText(equipment, "journey"), 22)}`,
    `${STATUS_LABEL[equipment.status]}. ${compactCopy(storyText(equipment, "fate"), 22)}`,
    `Its legacy: ${compactCopy(storyText(equipment, "legacy"), 22)}`,
  ];
  return { text: lines[step] ?? lines[0], expression: step === 4 ? "serious" : "curious", pose: "point" };
}

function StepHeader({ step, equipment }: { step: number; equipment: Equipment }) {
  const Icon = TOUR_STAGES[step].icon;
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-cyan/25 bg-cyan/10 text-cyan">
          <Icon size={16} />
        </span>
        <div className="min-w-0">
          <div className="data text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">Stage {String(step + 1).padStart(2, "0")}</div>
          <h2 className="truncate text-base font-semibold text-white sm:text-lg">{TOUR_STAGES[step].title}</h2>
        </div>
      </div>
      <span className="data shrink-0 text-xs tracking-[0.16em] text-slate-400">{String(step + 1).padStart(2, "0")} / 06</span>
    </div>
  );
}

function PhotoCard({ equipment, index = 0 }: { equipment: Equipment; index?: number }) {
  const photo = equipment.gallery[index] ?? equipment.gallery[0];
  if (!photo) return null;
  return (
    <figure className="overflow-hidden rounded-xl border border-white/10 bg-abyss/50">
      <img src={photo.src} alt={photo.caption} loading="lazy" decoding="async" className="h-32 w-full object-cover sm:h-40" />
      <figcaption className="px-3 py-2 text-[0.64rem] leading-relaxed text-slate-400">
        <span className="block text-slate-300">{photo.caption}</span>
        <span className="mt-0.5 block text-[0.55rem] text-slate-600">{photo.credit}</span>
      </figcaption>
    </figure>
  );
}

function ObjectiveDiagram({ equipment }: { equipment: Equipment }) {
  const objectives = equipment.objectives.slice(0, 3);
  return (
    <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
      {(objectives.length ? objectives : [equipment.tagline]).map((objective, index) => (
        <div key={`${equipment.id}-objective-${index}`} className="rounded-xl border border-cyan/15 bg-[#07152b]/75 p-3">
          <span className="data mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-cyan/30 text-[0.58rem] text-cyan">0{index + 1}</span>
          <p className="text-[0.72rem] leading-relaxed text-slate-300">{compactCopy(objective, 24)}</p>
        </div>
      ))}
    </div>
  );
}

function TimelineStrip({ equipment }: { equipment: Equipment }) {
  const events = useMemo(
    () => TIMELINE.filter((event) => event.equipmentId === equipment.id).sort((a, b) => a.year - b.year),
    [equipment.id],
  );
  const fallback: { id: string; year?: number; title: string; summary: string }[] = [
    { id: "history", title: "Built for its mission", summary: storyText(equipment, "history") },
    { id: "journey", title: "The journey", summary: storyText(equipment, "journey") },
    { id: "landing", title: "Arrival and operations", summary: storyText(equipment, "landing") },
  ];
  const items: { id: string; year?: number; title: string; summary: string; date?: string }[] = events.length
    ? events.slice(0, 5).map((event) => ({ id: event.id, year: event.year, title: event.title, summary: event.summary, date: event.date }))
    : fallback;

  return (
    <ol className="relative space-y-3 before:absolute before:bottom-3 before:left-[0.62rem] before:top-3 before:w-px before:bg-cyan/20">
      {items.map((event, index) => (
        <li key={event.id} className="relative flex gap-3">
          <span className="relative z-10 mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-cyan/40 bg-[#08162b] text-[0.52rem] text-cyan">{index + 1}</span>
          <div className="min-w-0 flex-1 rounded-xl border border-white/8 bg-white/[0.025] p-3">
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-[0.76rem] font-semibold text-white">{event.title}</h3>
              {event.year && <span className="data text-[0.56rem] text-gold">{"date" in event ? event.date : event.year}</span>}
            </div>
            <p className="text-[0.68rem] leading-relaxed text-slate-400">{compactCopy(event.summary, 28)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function StageContent({
  step,
  equipment,
  components,
  selectedComponent,
  onSelectComponent,
  onStageMounted,
}: {
  step: number;
  equipment: Equipment;
  components: ModelComponent[];
  selectedComponent: string | null;
  onSelectComponent: (id: string | null) => void;
  onStageMounted: (id: string, index: number) => () => void;
}) {
  useEffect(() => onStageMounted(equipment.id, step), [equipment.id, step, onStageMounted]);
  const activeIndex = Math.max(0, components.findIndex((component) => component.id === selectedComponent));
  const activeComponent = components[activeIndex] ?? null;

  switch (step) {
    case 0:
      return (
        <div className="space-y-4">
          <p className="text-[0.86rem] leading-relaxed text-slate-300">{compactCopy(storyText(equipment, "what"), 42)}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><span className="data text-[0.52rem] uppercase tracking-[0.18em] text-slate-500">Mission</span><p className="mt-1 text-xs font-medium text-white">{equipment.mission}</p></div>
            <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3"><span className="data text-[0.52rem] uppercase tracking-[0.18em] text-slate-500">Built by</span><p className="mt-1 text-xs font-medium text-white">{equipment.agency}</p></div>
          </div>
          <div className="flex flex-wrap gap-2 text-[0.58rem] uppercase tracking-[0.12em] text-slate-300">
            <span className="rounded-[0.45rem] border-2 border-white/15 bg-ink/50 px-2.5 py-1">{equipment.country}</span>
            <span className="rounded-[0.45rem] border-2 border-white/15 bg-ink/50 px-2.5 py-1">{equipment.years}</span>
            <span className="rounded-[0.45rem] border-2 border-white/15 bg-ink/50 px-2.5 py-1">{CATEGORY_LABEL[equipment.category]}</span>
          </div>
          <PhotoCard equipment={equipment} />
        </div>
      );
    case 1:
      return (
        <div className="space-y-4">
          <p className="text-[0.8rem] leading-relaxed text-slate-300">{compactCopy(storyText(equipment, "history"), 34)}</p>
          <div className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.18em] text-cyan/65"><Target size={13} /> Mission objectives</div>
          <ObjectiveDiagram equipment={equipment} />
        </div>
      );
    case 2:
      return (
        <div className="space-y-3">
          <p className="text-[0.72rem] leading-relaxed text-slate-400">Select a labeled part on the model or choose a component below. The reconstruction highlights modeled zones; it is not flight CAD.</p>
          {activeComponent ? (
            <div className="rounded-xl border border-gold/25 bg-gold/[0.06] p-3.5">
              <div className="data text-[0.54rem] uppercase tracking-[0.2em] text-gold/75">{activeComponent.group}</div>
              <h3 className="mt-1 text-sm font-semibold text-white">{activeComponent.label}</h3>
              <p className="mt-1.5 text-[0.74rem] leading-relaxed text-slate-300">{activeComponent.description}</p>
              {activeComponent.spec && <span className="mt-2 inline-flex rounded-md border border-gold/25 px-2 py-1 data text-[0.56rem] text-gold/90">{activeComponent.spec}</span>}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-[0.72rem] text-slate-400">This record has no separately documented model components.</div>
          )}
          {components.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {components.map((component) => (
                <button key={component.id} onClick={() => onSelectComponent(component.id === selectedComponent ? null : component.id)} aria-pressed={component.id === selectedComponent} className={`rounded-[0.45rem] border-2 px-2.5 py-1.5 min-h-11 text-xs font-semibold transition ${component.id === selectedComponent ? "border-cyan/70 bg-cyan/15 text-cyan" : "border-white/15 bg-white/[0.03] text-slate-400 hover:border-cyan/40 hover:text-white"}`}>
                  {component.label}
                </button>
              ))}
            </div>
          )}
          {components.length > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-2">
              <span className="data text-[0.55rem] uppercase tracking-[0.16em] text-slate-500">{String(activeIndex + 1).padStart(2, "0")} / {String(components.length).padStart(2, "0")} parts</span>
              <div className="flex gap-1.5">
                <button onClick={() => onSelectComponent(components[(activeIndex - 1 + components.length) % components.length].id)} className="btn btn-ghost !min-h-11 !px-2.5 !py-1.5 !text-xs"><ChevronLeft size={12}/> Previous part</button>
                <button onClick={() => onSelectComponent(components[(activeIndex + 1) % components.length].id)} className="btn btn-ghost !min-h-11 !px-2.5 !py-1.5 !text-xs">Next part <ChevronRight size={12}/></button>
              </div>
            </div>
          )}
        </div>
      );
    case 3:
      return (
        <div className="space-y-4">
          <p className="text-[0.78rem] leading-relaxed text-slate-300">{compactCopy(storyText(equipment, "journey"), 34)}</p>
          <TimelineStrip equipment={equipment} />
          <div className="rounded-xl border border-cyan/15 bg-cyan/[0.04] p-3">
            <div className="data mb-1 text-[0.54rem] uppercase tracking-[0.18em] text-cyan/70">Arrival and deployment</div>
            <p className="text-[0.7rem] leading-relaxed text-slate-300">{compactCopy(storyText(equipment, "landing"), 32)}</p>
          </div>
          <PhotoCard equipment={equipment} index={1} />
        </div>
      );
    case 4:
      return (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={equipment.status} />
            <span className="rounded-[0.45rem] border-2 border-white/15 bg-ink/50 px-2.5 py-1 data text-[0.55rem] uppercase tracking-[0.12em] text-slate-300">{equipment.landed}</span>
          </div>
          <p className="text-[0.82rem] leading-relaxed text-slate-300">{compactCopy(storyText(equipment, "fate"), 40)}</p>
          <div className="rounded-xl border border-orange-300/15 bg-orange-300/[0.035] p-3.5">
            <div className="mb-1 flex items-center gap-2 text-[0.56rem] uppercase tracking-[0.16em] text-orange-200/70"><MapPin size={12} /> Last known location</div>
            <p className="text-sm font-medium text-white">{equipment.site}</p>
            <p className="mt-1 text-[0.66rem] text-slate-500">{PLANET_LABEL[equipment.planet]} · {equipment.mission}</p>
          </div>
          <PhotoCard equipment={equipment} index={1} />
        </div>
      );
    default:
      return (
        <div className="space-y-4">
          <p className="text-[0.82rem] leading-relaxed text-slate-300">{compactCopy(storyText(equipment, "legacy"), 40)}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {equipment.discoveries.slice(0, 4).map((discovery, index) => (
              <article key={`${equipment.id}-${discovery.title}`} className="rounded-xl border border-gold/15 bg-gold/[0.035] p-3">
                <div className="mb-1 flex items-center justify-between gap-2"><span className="data text-[0.52rem] uppercase tracking-[0.15em] text-gold/65">Discovery {String(index + 1).padStart(2, "0")}</span>{discovery.year && <span className="data text-[0.55rem] text-slate-500">{discovery.year}</span>}</div>
                <h3 className="text-[0.72rem] font-semibold text-white">{discovery.title}</h3>
                <p className="mt-1 text-[0.65rem] leading-relaxed text-slate-400">{compactCopy(discovery.body, 24)}</p>
              </article>
            ))}
          </div>
          {equipment.gallery.length > 0 && <PhotoCard equipment={equipment} index={0} />}
        </div>
      );
  }
}

export default function EquipmentExperience({
  equipment,
  onPrevious,
  onNext,
  onArchive,
  onCompare,
  onMap,
}: {
  equipment: Equipment;
  onPrevious: () => void;
  onNext: () => void;
  onArchive: () => void;
  onCompare: () => void;
  onMap: () => void;
}) {
  const { say, setGuideOpen, markStory, visitStoryStage, storyStagesVisited, storiesDone } = useAfterlight();
  const components = useMemo(() => componentsOf(equipment), [equipment]);
  const [tour, setTour] = useState({ equipmentId: equipment.id, step: 0 });
  const [renderedStage, setRenderedStage] = useState<{ equipmentId: string; step: number } | null>(null);
  const step = tour.equipmentId === equipment.id ? tour.step : 0;
  const visitedStages = useMemo(() => storyStagesVisited[equipment.id] ?? [], [storyStagesVisited, equipment.id]);
  const tourComplete = storiesDone.includes(equipment.id);
  const reducedMotion = useReducedMotion();
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const model = useMemo(() => assetOf(equipment), [equipment]);
  const selectedMeta = components.find((component) => component.id === selectedComponent) ?? components[0] ?? null;
  const currentGuideLine = useMemo(() => guideLineFor(equipment, step, selectedMeta), [equipment, selectedMeta, step]);
  const sources = useMemo(() => [...equipment.sources, ...(equipment.downloads ?? [])].filter((item, index, all) => all.findIndex((source) => source.url === item.url) === index), [equipment]);

  useEffect(() => {
    setTour({ equipmentId: equipment.id, step: 0 });
    setSelectedComponent(null);
  }, [equipment.id, components]);

  // Wait-mode transitions may replace a pending stage before it renders.
  // Only the mounted content records a visit; selecting a stage is not a visit.
  const onStageMounted = useCallback((id: string, index: number) => {
    visitStoryStage(id, index);
    setRenderedStage({ equipmentId: id, step: index });
    return () => {
      setRenderedStage((current) => current?.equipmentId === id && current.step === index ? null : current);
    };
  }, [visitStoryStage]);

  useEffect(() => {
    if (
      step === TOUR_STAGES.length - 1 &&
      renderedStage?.equipmentId === equipment.id &&
      renderedStage.step === step &&
      TOUR_STAGES.every((_, index) => visitedStages.includes(index))
    ) {
      markStory(equipment.id);
    }
  }, [equipment.id, step, renderedStage, visitedStages, markStory]);

  const visitLuffy = () => {
    setGuideOpen(true);
    say(currentGuideLine);
  };
  const goToStep = (index: number) => setTour({ equipmentId: equipment.id, step: Math.max(0, Math.min(TOUR_STAGES.length - 1, index)) });

  return (
    <div className={`${styles.experience} w-full px-4 pb-8 pt-4 md:px-6`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-[0.62rem] text-slate-500">
          <button onClick={onArchive} className="text-action transition hover:text-cyan">Equipment archive</button><ChevronRight size={12}/><span className="text-slate-300">{equipment.name}</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={onPrevious} className="btn btn-ghost !min-h-11 !px-2.5 !py-1.5 !text-xs"><ArrowLeft size={12}/> Previous machine</button>
          <button onClick={onNext} className="btn btn-ghost !min-h-11 !px-2.5 !py-1.5 !text-xs">Next machine <ArrowRight size={12}/></button>
        </div>
      </div>

      <header className="relative isolate overflow-hidden rounded-2xl border border-cyan/20 bg-[#071326]">
        <img src={equipment.image} alt={equipment.imageCaption} loading="eager" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover opacity-35" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(100deg,rgba(3,7,16,0.97),rgba(3,7,16,0.78)_58%,rgba(3,7,16,0.42))]" />
        <div className="flex min-h-[170px] flex-col justify-end gap-3 p-4 sm:p-6 md:min-h-[190px] md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              <span className="eyebrow">{PLANET_LABEL[equipment.planet]} · {CATEGORY_LABEL[equipment.category]}</span>
              <StatusPill status={equipment.status}/>
              <span className={`data rounded-md border px-2 py-1 text-[0.52rem] uppercase tracking-[0.12em] ${IMPORTANCE_TONE[importanceOf(equipment)]}`}>{IMPORTANCE_LABEL[importanceOf(equipment)]}</span>
              <span className="data rounded-md border border-cyan/25 bg-cyan/10 px-2 py-1 text-[0.52rem] uppercase tracking-[0.12em] text-cyan">{modelRepresentationLabel(model)}</span>
            </div>
            <h1 className="display text-3xl leading-none text-white sm:text-4xl md:text-5xl">{equipment.name}</h1>
            <p className="mt-2 max-w-3xl text-[0.75rem] leading-relaxed text-slate-300 sm:text-sm">{compactCopy(equipment.tagline, 28)}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.55rem] uppercase tracking-[0.12em] text-slate-400">
              <span>{equipment.mission}</span><span>{equipment.agency} / {equipment.country}</span><span>{equipment.years}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button onClick={onCompare} className="btn btn-ghost !min-h-11 !px-3 !py-1.5 !text-xs">Compare</button>
            <button onClick={onMap} className="btn btn-ghost !min-h-11 !px-3 !py-1.5 !text-xs"><MapPin size={12}/> Find on map</button>
          </div>
        </div>
      </header>
      <div className="mt-3 grid gap-2 rounded-xl border border-white/10 bg-[#071326]/65 p-3 text-xs leading-relaxed text-slate-400 sm:grid-cols-2">
        <p><span className="font-medium text-slate-200">Image evidence. </span>{equipment.imageCaption} <span className="text-slate-500">Credit: {equipment.imageCredit}.</span></p>
        <p><span className="font-medium text-slate-200">Model interpretation. </span>{modelRepresentationNote(model)}</p>
      </div>

      <nav aria-label="Equipment exploration stages" className="my-4 rounded-2xl border border-white/10 bg-[#071326]/80 p-2.5">
        <div className="mb-2 flex items-center justify-between gap-2 px-1 text-xs text-slate-400">
          <span>Choose a stage</span>
          <span className="data text-[0.65rem] text-cyan/80">{visitedStages.length} / {TOUR_STAGES.length} visited</span>
        </div>
        <label className="block sm:hidden">
          <span className="sr-only">Choose an exploration stage</span>
          <select value={step} onChange={(event) => goToStep(Number(event.target.value))} className="min-h-11 w-full rounded-xl border border-cyan/30 bg-[#071326] px-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan">
            {TOUR_STAGES.map((stage, index) => <option key={stage.title} value={index}>{index + 1}. {stage.title}{visitedStages.includes(index) ? " · visited" : ""}</option>)}
          </select>
        </label>
        <ol className="hidden gap-2 sm:grid sm:grid-cols-3 xl:grid-cols-6">
          {TOUR_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            const active = index === step;
            const complete = visitedStages.includes(index);
            return (
              <li key={stage.title} className="min-w-0">
                <button type="button" onClick={() => goToStep(index)} aria-current={active ? "step" : undefined} aria-label={`Stage ${index + 1} of ${TOUR_STAGES.length}: ${stage.title}${complete ? ", visited" : ""}`} className={`flex min-h-16 w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left transition ${active ? "border-cyan/50 bg-cyan/10 text-white" : "border-white/10 bg-white/[0.025] text-slate-300 hover:border-cyan/30 hover:text-white"}`}>
                  <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${complete ? "border-cyan/40 bg-cyan/15 text-cyan" : active ? "border-cyan/60 text-cyan" : "border-white/20 text-slate-400"}`}>{complete ? <Check size={13}/> : <Icon size={13}/>}</span>
                  <span className="min-w-0"><span className="block break-words text-xs font-medium leading-snug">{stage.title}</span><span className={`data mt-1 block text-[0.6rem] ${active ? "text-cyan/80" : "text-slate-400"}`}>{String(index + 1).padStart(2, "0")} / 06</span></span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className={styles.tourLayout}>
        <section className={`${styles.chapterPanel} min-w-0 overflow-hidden rounded-2xl border border-cyan/20 bg-[linear-gradient(165deg,rgba(10,24,48,0.94),rgba(2,5,12,0.98))] p-4 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.9)] sm:p-5`}>
          <StepHeader step={step} equipment={equipment}/>
          <AnimatePresence mode={reducedMotion ? "sync" : "wait"}>
            <motion.div key={`${equipment.id}-${step}`} initial={{opacity:0,y:reducedMotion ? 0 : 8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:reducedMotion ? 0 : -5}} transition={{duration:reducedMotion ? 0 : 0.2}}>
              <StageContent step={step} equipment={equipment} components={components} selectedComponent={selectedComponent} onSelectComponent={setSelectedComponent} onStageMounted={onStageMounted}/>
            </motion.div>
          </AnimatePresence>
          {step === TOUR_STAGES.length - 1 && <p role="status" className="mt-4 rounded-lg border border-cyan/20 bg-cyan/5 px-3 py-2 text-cyan/80">{tourComplete ? "Tour complete — saved to your expedition log." : `You visited ${visitedStages.length} of ${TOUR_STAGES.length} stages. Visit each stage, then return here to complete the tour.`}</p>}
          <div className="mt-4 flex flex-col items-stretch justify-between gap-3 border-t border-white/8 pt-3 sm:flex-row sm:items-center">
            <button onClick={visitLuffy} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[0.55rem] border-2 border-cyan/50 bg-cyan/10 px-3 text-[0.7rem] font-bold uppercase tracking-[0.1em] text-cyan shadow-[0_3px_0_rgba(2,16,38,0.9)] transition hover:border-cyan/80 hover:bg-cyan/20 active:translate-y-0.5 active:shadow-none sm:min-h-10 sm:text-[0.6rem]"><BookOpen size={13}/> Ask Luffy</button>
            <div className="flex flex-wrap gap-2">
              {step > 0 && <button onClick={() => goToStep(step - 1)} className="btn btn-ghost flex-1 !min-h-12 !px-3 !py-2 !text-xs sm:flex-none sm:!min-h-11 sm:!text-xs"><ArrowLeft size={12}/> Previous</button>}
              {step < TOUR_STAGES.length - 1 ? <button onClick={() => goToStep(step + 1)} className="btn btn-gold flex-1 !min-h-12 !px-3.5 !py-2 !text-xs sm:flex-none sm:!min-h-11 sm:!text-xs">Next <ArrowRight size={13}/></button> : <button onClick={onNext} className="btn btn-gold flex-1 !min-h-12 !whitespace-normal !px-3.5 !py-2 !text-xs sm:flex-none sm:!min-h-11 sm:!whitespace-nowrap sm:!text-xs">Explore another machine <ArrowRight size={13}/></button>}
            </div>
          </div>
        </section>
        <section aria-label={`Interactive 3D model of ${equipment.name}`} className={`${styles.viewerPanel} min-w-0`}>
          <EquipmentViewer equipment={equipment} height="var(--tour-viewer-height)" selectedComponent={selectedComponent} onSelectedComponentChange={setSelectedComponent} showComponentChips={false} showSelectionPanel={false}/>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-abyss/35 px-3 py-2 text-[0.56rem] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Telescope size={12} className="text-cyan/70"/> Drag to rotate · scroll or pinch to zoom · right-drag to pan</span>
            <span>{model.note}</span>
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <details className="group rounded-xl border border-white/10 bg-[#071326]/65 p-3.5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[0.7rem] font-medium text-slate-200"><RotateCcw size={13} className="text-cyan"/> Technical specifications <ChevronRight size={13} className="ml-auto transition group-open:rotate-90"/></summary>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {[{label:"Mass",value:equipment.mass},{label:"Power",value:equipment.power},{label:"Mission duration",value:equipment.duration},{label:"Distance",value:equipment.distance ?? "Not published"},...equipment.specs].map((spec,index)=><div key={`${spec.label}-${index}`} className="rounded-lg border border-white/8 bg-white/[0.025] p-2.5"><div className="data text-[0.5rem] uppercase tracking-[0.14em] text-slate-600">{spec.label}</div><p className="mt-1 text-[0.65rem] text-slate-300">{spec.value}</p></div>)}
          </div>
        </details>
        <details className="group rounded-xl border border-white/10 bg-[#071326]/65 p-3.5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[0.7rem] font-medium text-slate-200"><ExternalLink size={13} className="text-cyan"/> Research &amp; sources <ChevronRight size={13} className="ml-auto transition group-open:rotate-90"/></summary>
          <ul className="mt-3 space-y-2">
            {sources.map((source,index)=><li key={`${source.url}-${index}`}><a href={source.url} target="_blank" rel="noreferrer noopener" className="flex items-start justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.025] px-3 py-2 text-[0.65rem] text-slate-300 transition hover:border-cyan/30 hover:text-cyan"><span>{source.label}{source.note&&<span className="mt-0.5 block text-[0.55rem] text-slate-600">{source.note}</span>}</span><ExternalLink size={11} className="mt-0.5 shrink-0"/></a></li>)}
          </ul>
          <p className="mt-3 text-[0.55rem] leading-relaxed text-slate-600">Model source: {model.note} {equipment.license}</p>
        </details>
        <details className="group rounded-xl border border-white/10 bg-[#071326]/65 p-3.5">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-[0.7rem] font-medium text-slate-200"><History size={13} className="text-cyan"/> Full historical record &amp; gallery <ChevronRight size={13} className="ml-auto transition group-open:rotate-90"/></summary>
          <div className="mt-3 space-y-3">
            {([
              ["What it is", "what"], ["History", "history"], ["Journey", "journey"], ["Landing", "landing"], ["What happened", "fate"], ["Legacy", "legacy"],
            ] as const).map(([label,key])=><section key={key} className="rounded-lg border border-white/8 bg-white/[0.025] p-3"><h3 className="data mb-1 text-[0.52rem] uppercase tracking-[0.15em] text-cyan/70">{label}</h3><p className="text-[0.68rem] leading-relaxed text-slate-300">{storyText(equipment,key)}</p></section>)}
            <div className="grid gap-2 sm:grid-cols-2">{equipment.gallery.map((photo,index)=><figure key={`${photo.src}-${index}`} className="overflow-hidden rounded-lg border border-white/8"><img src={photo.src} alt={photo.caption} loading="lazy" decoding="async" className="h-32 w-full object-cover"/><figcaption className="p-2 text-[0.56rem] leading-relaxed text-slate-400">{photo.caption}<span className="mt-1 block text-[0.52rem] text-slate-600">{photo.credit}</span></figcaption></figure>)}</div>
          </div>
        </details>
      </div>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan/15 bg-deep/20 p-4">
        <div><div className="data text-[0.52rem] uppercase tracking-[0.2em] text-cyan/65">Keep exploring</div><p className="mt-1 text-sm text-white">Every machine has another story.</p></div>
        <div className="flex flex-wrap gap-2"><button onClick={onArchive} className="btn btn-ghost !min-h-11 !px-3 !py-2 !text-xs">Back to equipment archive</button><button onClick={onNext} className="btn btn-gold !min-h-11 !px-3.5 !py-2 !text-xs">Explore another machine <ArrowRight size={13}/></button></div>
      </footer>
    </div>
  );
}
