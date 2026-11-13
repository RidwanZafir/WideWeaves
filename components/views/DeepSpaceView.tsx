"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, ChevronDown, Disc3, MapPin, Radio, Volume2 } from "lucide-react";
import { Breadcrumb, SectionHeader, SourceLink } from "@/components/ui/Atoms";
import { DEEP_SPACE, type DeepSpaceProbe } from "@/data/deep-space";
import { useNavigation } from "@/lib/navigation";
import { useAfterlight } from "@/lib/store";

type MissionFilter = "all" | "active" | "retired";

const FILTERS: readonly { id: MissionFilter; label: string }[] = [
  { id: "all", label: "All missions" },
  { id: "active", label: "Still operating" },
  { id: "retired", label: "Retired" },
];

function MissionStory({
  probe,
  index,
  expanded,
  selected,
  onToggle,
}: {
  probe: DeepSpaceProbe;
  index: number;
  expanded: boolean;
  selected: boolean;
  onToggle: (open: boolean) => void;
}) {
  const [chapterIndex, setChapterIndex] = useState(0);
  const say = useAfterlight((state) => state.say);
  const soundOn = useAfterlight((state) => state.soundOn);
  const chapter = probe.chapters[chapterIndex] ?? probe.chapters[0];

  return (
    <article className={`min-w-0 rounded-2xl border bg-ink/80 p-4 sm:p-5 ${selected ? "border-gold/50 ring-1 ring-gold/30" : "border-white/15"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="data text-[0.65rem] uppercase tracking-[0.15em] text-slate-400">
            Mission {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="display mt-1 text-2xl text-white [overflow-wrap:anywhere]">{probe.name}</h3>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${probe.active ? "border-cyan/35 bg-cyan/10 text-cyan" : "border-white/20 bg-white/5 text-slate-300"}`}>
          {probe.active ? <Radio size={12} aria-hidden="true" /> : <Disc3 size={12} aria-hidden="true" />}
          {probe.active ? "Operating" : "Retired"}
        </span>
      </div>

      <dl className="mt-4 space-y-3 border-t border-white/10 pt-3">
        <div className="grid gap-1 sm:grid-cols-[5rem_1fr] sm:gap-3">
          <dt className="text-xs text-slate-400">Launched</dt>
          <dd className="text-sm text-slate-200">{probe.launched}</dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[5rem_1fr] sm:gap-3">
          <dt className="inline-flex items-center gap-1 text-xs text-slate-400"><MapPin size={11} aria-hidden="true" /> Location</dt>
          <dd className="text-sm leading-relaxed text-slate-200">{probe.location}</dd>
        </div>
        <div className="grid gap-1 sm:grid-cols-[5rem_1fr] sm:gap-3">
          <dt className="text-xs text-slate-400">Mission state</dt>
          <dd className="text-sm leading-relaxed text-slate-200">{probe.status}</dd>
        </div>
      </dl>

      <details
        open={expanded}
        onToggle={(event) => onToggle(event.currentTarget.open)}
        className="group mt-4 border-t border-white/10 pt-1"
      >
        <summary
          id={`deep-space-${probe.id}`}
          className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-1 text-sm font-semibold text-cyan outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-cyan [&::-webkit-details-marker]:hidden"
        >
          <span className="inline-flex items-center gap-2"><BookOpen size={15} aria-hidden="true" /> Read {probe.name}&apos;s story</span>
          <ChevronDown size={15} className="shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden="true" />
        </summary>

        <div className="pt-3">
          <div role="group" aria-label={`${probe.name} story chapters`} className="flex flex-wrap gap-2">
            {probe.chapters.map((entry, entryIndex) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={chapterIndex === entryIndex}
                aria-controls={`deep-space-chapter-${probe.id}`}
                onClick={() => setChapterIndex(entryIndex)}
                className={`min-h-11 rounded-lg border px-3 py-2 text-xs outline-none transition focus-visible:ring-2 focus-visible:ring-cyan ${chapterIndex === entryIndex ? "border-cyan/50 bg-cyan/10 text-cyan" : "border-white/15 text-slate-300 hover:border-white/35 hover:text-white"}`}
              >
                {entryIndex + 1}. {entry.title}
              </button>
            ))}
          </div>
          <section id={`deep-space-chapter-${probe.id}`} aria-labelledby={`deep-space-chapter-title-${probe.id}`} className="mt-4 rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <h4 id={`deep-space-chapter-title-${probe.id}`} className="display text-lg text-white">{chapter.title}</h4>
            <p className="mt-2 max-w-[70ch] text-sm leading-7 text-slate-300">{chapter.body}</p>
            <button
              type="button"
              onClick={() => say({ text: `${probe.name}. ${chapter.title}. ${chapter.body}`, expression: "curious", pose: "think" })}
              className="btn btn-ghost mt-4 min-h-11 !py-2 !text-xs"
            >
              <Volume2 size={14} aria-hidden="true" /> {soundOn ? "Listen to this chapter" : "Send this chapter to the guide"}
            </button>
            {!soundOn && <p className="mt-2 text-xs leading-relaxed text-slate-400">Sound is off. The guide can show this text; turn sound on in the header to hear narration.</p>}
          </section>
        </div>
      </details>

      {!expanded && <p className="mt-2 max-w-[70ch] text-sm leading-7 text-slate-300">{probe.note}</p>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-3 text-xs">
        <SourceLink href={probe.sourceUrl}>NASA · {probe.name}</SourceLink>
        {probe.sources?.map((source) => <SourceLink key={source.url} href={source.url}>{source.label}</SourceLink>)}
      </div>
      {selected && <p role="status" className="mt-3 text-xs text-gold">Selected mission story</p>}
    </article>
  );
}

export default function DeepSpaceView() {
  const go = useAfterlight((state) => state.go);
  const target = useNavigation((state) => state.deepSpaceTarget);
  const [filter, setFilter] = useState<MissionFilter>("all");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const pendingTarget = useRef<number | null>(null);
  const activeCount = DEEP_SPACE.probes.filter((probe) => probe.active).length;
  const visibleProbes = DEEP_SPACE.probes.filter((probe) => filter === "all" || (filter === "active" ? probe.active : !probe.active));

  useEffect(() => {
    if (!target) return;
    const navigation = useNavigation.getState();
    if (target.request <= navigation.consumedDeepSpaceRequest) return;
    navigation.consumeDeepSpaceRequest(target.request);
    if (!DEEP_SPACE.probes.some((probe) => probe.id === target.id)) return;
    pendingTarget.current = target.request;
    setFilter("all");
    setSelectedId(target.id);
    setExpandedIds((previous) => previous.includes(target.id) ? previous : [...previous, target.id]);
  }, [target]);

  useEffect(() => {
    if (!target || selectedId !== target.id || pendingTarget.current !== target.request || filter !== "all" || !expandedIds.includes(target.id)) return;
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        const summary = document.getElementById(`deep-space-${target.id}`);
        summary?.scrollIntoView({ block: "center", behavior: "auto" });
        summary?.focus({ preventScroll: true });
        pendingTarget.current = null;
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(secondFrame);
    };
  }, [target, selectedId, filter, expandedIds]);

  function toggleStory(id: string, open: boolean) {
    setExpandedIds((previous) => {
      if (previous.includes(id) === open) return previous;
      return open ? [...previous, id] : previous.filter((entry) => entry !== id);
    });
  }

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "Deep space" }]} />

      <section className="relative mt-4 overflow-hidden rounded-2xl border border-cyan/25 bg-ink/90">
        <div className="grid md:grid-cols-[1.15fr_1fr]">
          <div className="flex flex-col justify-center p-5 sm:p-7 md:p-8">
            <span className="eyebrow">Beyond the Moon and Mars</span>
            <h1 className="display mt-3 max-w-2xl text-3xl leading-[1.02] text-white sm:text-4xl md:text-5xl">
              MANY JOURNEYS.<br /><span className="text-gradient-ice">DIFFERENT ENDINGS.</span>
            </h1>
            <p className="mt-4 max-w-[60ch] text-sm leading-7 text-slate-300">{DEEP_SPACE.intro}</p>
            <p className="mt-4 text-xs leading-relaxed text-cyan/90">{DEEP_SPACE.probes.length} mission stories · {activeCount} operating · {DEEP_SPACE.probes.length - activeCount} retired</p>
            <button type="button" onClick={() => go("home")} className="btn btn-ghost mt-5 min-h-11 w-fit !py-2.5 !text-xs">
              <ArrowLeft size={14} aria-hidden="true" /> Back to the destinations
            </button>
          </div>
          <figure className="relative min-h-[240px] overflow-hidden border-t border-white/10 md:min-h-[390px] md:border-l md:border-t-0">
            <img src="/images/earthrise.jpg" alt="Earth rising over the Moon's horizon, photographed by Apollo 8" className="absolute inset-0 h-full w-full object-cover object-[50%_45%]" />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink to-transparent px-4 pb-4 pt-14 text-xs leading-relaxed text-slate-300">
              A view of home · Apollo 8, 24 December 1968 · NASA/JSC<br />
              <SourceLink href="https://images.nasa.gov/details/as08-14-2383">Earthrise · AS08-14-2383</SourceLink>
            </figcaption>
          </figure>
        </div>
      </section>

      <SectionHeader className="mt-8" eyebrow="Follow the evidence" title={<>Hardware, discoveries, <span className="text-gradient-ice">and what remains</span></>} description="Open a mission to explore its journey in four chapters. Each story links to NASA's original mission record." />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div role="group" aria-label="Filter missions by operating status" className="flex flex-wrap gap-2">
          {FILTERS.map((entry) => {
            const count = entry.id === "all" ? DEEP_SPACE.probes.length : entry.id === "active" ? activeCount : DEEP_SPACE.probes.length - activeCount;
            return <button key={entry.id} type="button" aria-pressed={filter === entry.id} onClick={() => setFilter(entry.id)} className={`min-h-11 rounded-lg border px-3 py-2 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan ${filter === entry.id ? "border-cyan/50 bg-cyan/10 text-cyan" : "border-white/20 bg-ink/70 text-slate-300 hover:border-white/40 hover:text-white"}`}>{entry.label} <span className="data ml-1 text-xs">{count}</span></button>;
          })}
        </div>
        <p role="status" className="text-xs text-slate-400">Showing {visibleProbes.length} of {DEEP_SPACE.probes.length} missions</p>
      </div>
      <p className="mt-3 max-w-3xl text-xs leading-6 text-slate-400">Mission states checked against NASA references on {DEEP_SPACE.statusAsOf}. Locations describe a surface, orbit or region; they are not a live spacecraft tracker. Only the Voyagers have confirmed heliopause crossings.</p>

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
        {visibleProbes.map((probe) => <MissionStory key={probe.id} probe={probe} index={DEEP_SPACE.probes.indexOf(probe)} expanded={expandedIds.includes(probe.id)} selected={selectedId === probe.id} onToggle={(open) => toggleStory(probe.id, open)} />)}
      </div>

      <section className="mt-6 rounded-2xl border border-gold/25 bg-ink/90 p-5 sm:p-6">
        <span className="eyebrow text-gold">A message for the journey</span>
        <h2 className="display mt-2 text-2xl text-white">The Golden Record</h2>
        <p className="mt-3 max-w-[75ch] text-sm leading-7 text-slate-300">Both Voyagers carry a gold-plated copper phonograph record with greetings, images, natural sounds and music chosen to introduce life on Earth. The Pioneer spacecraft carry engraved plaques. These messages remain with the hardware even after scientific instruments and radio transmitters fall silent.</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <SourceLink href="https://science.nasa.gov/mission/voyager/voyager-golden-record-overview/">NASA · the Golden Record</SourceLink>
          <SourceLink href="https://science.nasa.gov/mission/pioneer-10/">NASA · the Pioneer plaque</SourceLink>
        </div>
        <button type="button" onClick={() => go("students")} className="btn btn-gold mt-5 min-h-11 !py-2.5 !text-xs"><BookOpen size={14} aria-hidden="true" /> Use these missions in a research activity</button>
      </section>
    </div>
  );
}
