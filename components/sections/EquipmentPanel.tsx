"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  Box,
  BookOpen,
  Sparkles,
  Images,
  ArrowRight,
  ArrowLeft,
  Play,
  Gauge,
  Weight,
  Zap,
  CalendarClock,
  MapPin,
  Layers,
  ChevronDown,
  ExternalLink,
  FileText,
  Download,
} from "lucide-react";
import type { Equipment } from "@/data/types";
import {
  CATEGORY_LABEL,
  IMPORTANCE_LABEL,
  STATUS_LABEL,
  IMPORTANCE_TONE,
  assetOf,
  componentsOf,
  downloadsOf,
  importanceOf,
  nextEquipment,
  prevEquipment,
} from "@/data/equipment";
import { assetLabel } from "@/components/models/ArchiveModel";
import { modelRepresentationLabel, modelRepresentationNote } from "@/data/image-provenance";
import EquipmentViewer from "@/components/viewer/EquipmentViewer";
import StoryMode from "@/components/story/StoryMode";
import Lightbox from "@/components/sections/Lightbox";
import { StatusPill, SourceLink } from "@/components/ui/Atoms";
import { useAfterlight, type DetailTab } from "@/lib/store";

const TABS: { id: DetailTab; label: string; icon: typeof Box }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "record", label: "Full record", icon: FileText },
  { id: "model", label: "3D model", icon: Box },
  { id: "story", label: "Mission story", icon: BookOpen },
  { id: "discoveries", label: "Discoveries", icon: Sparkles },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "sources", label: "Sources & files", icon: Download },
];

export default function EquipmentPanel({
  equipment,
  embedded = false,
}: {
  equipment: Equipment;
  embedded?: boolean;
}) {
  const { detailTab, setDetailTab, openEquipment, markDiscovered, planet } = useAfterlight();
  const [storyOpen, setStoryOpen] = useState(false);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const tab = detailTab;
  const components = componentsOf(equipment);
  const asset = assetOf(equipment);

  useEffect(() => {
    markDiscovered(equipment.id);
  }, [equipment.id, markDiscovered]);

  return (
    <div className="relative">
      <div className="grid gap-4 lg:grid-cols-[clamp(190px,15vw,220px)_1fr]">
        {/* sidebar */}
        <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="flex w-full min-w-0 max-w-full gap-1.5 overflow-x-auto hide-scrollbar rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(6,14,30,0.85),rgba(2,5,12,0.9))] p-1.5 lg:flex-col lg:overflow-visible lg:p-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setDetailTab(t.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[0.74rem] font-medium transition lg:w-full ${
                    active
                      ? "bg-gradient-to-r from-gold/25 to-transparent text-gold shadow-[inset_0_0_0_1px_rgba(255,201,60,0.45)]"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  <Icon size={15} className={active ? "text-gold" : "text-slate-500"} />
                  <span className="whitespace-nowrap">{t.label}</span>
                  {active && <span className="ml-auto hidden h-1 w-1 rounded-full bg-gold lg:block" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 hidden rounded-2xl border border-white/10 bg-deep/25 p-3 lg:block">
            <div className="data text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
              Mission record
            </div>
            <dl className="mt-2 space-y-2 text-[0.7rem]">
              <div>
                <dt className="text-[0.55rem] uppercase tracking-[0.12em] text-slate-500">Mission</dt>
                <dd className="text-slate-200">{equipment.mission}</dd>
              </div>
              <div>
                <dt className="text-[0.55rem] uppercase tracking-[0.12em] text-slate-500">Landed</dt>
                <dd className="text-slate-200">{equipment.landed}</dd>
              </div>
              <div>
                <dt className="text-[0.55rem] uppercase tracking-[0.12em] text-slate-500">Site</dt>
                <dd className="text-slate-200">{equipment.site}</dd>
              </div>
              <div>
                <dt className="text-[0.55rem] uppercase tracking-[0.12em] text-slate-500">Agency</dt>
                <dd className="text-slate-200">{equipment.agency}</dd>
              </div>
            </dl>
            <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-cyan/20 bg-cyan/5 px-2 py-1.5 text-[0.58rem] text-cyan/80">
              <Layers size={10} /> 3D is an educational reconstruction
            </div>
          </div>
        </aside>

        {/* content */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {tab === "overview" && (
                <div className="grid gap-4 xl:grid-cols-[1.15fr_1fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="eyebrow">{CATEGORY_LABEL[equipment.category]} · {equipment.planet === "mars" ? "Mars" : "Moon"}</span>
                      <StatusPill status={equipment.status} />
                      <span
                        className={`data rounded-md border px-1.5 py-1 text-[0.5rem] uppercase tracking-[0.16em] ${IMPORTANCE_TONE[importanceOf(equipment)]}`}
                      >
                        {IMPORTANCE_LABEL[importanceOf(equipment)]}
                      </span>
                    </div>
                    <h3 className="display mt-2 text-3xl text-white sm:text-4xl">{equipment.name}</h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="data rounded-md bg-mars/15 px-2 py-1 text-[0.62rem] text-ember">
                        {equipment.years}
                      </span>
                      <span className="data rounded-md bg-white/5 px-2 py-1 text-[0.62rem] text-slate-300">
                        {equipment.shortName}
                      </span>
                    </div>
                    <p className="mt-4 text-[0.88rem] leading-relaxed text-slate-300">{equipment.summary}</p>
                    <p className="mt-3 text-[0.82rem] leading-relaxed text-slate-400">{equipment.tagline}</p>
                    {equipment.record && (
                      <p className="mt-3 rounded-xl border border-cyan/15 bg-cyan/5 px-3 py-2.5 text-[0.78rem] leading-relaxed text-slate-300">
                        <span className="data mr-1 text-[0.52rem] uppercase tracking-[0.18em] text-cyan/70">
                          What it is ·{" "}
                        </span>
                        {equipment.record.what}
                      </p>
                    )}

                    <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { icon: Weight, label: "Mass", value: equipment.mass },
                        { icon: Zap, label: "Power", value: equipment.power },
                        { icon: Gauge, label: "Distance", value: equipment.distance ?? "Stationary" },
                        { icon: CalendarClock, label: "Duration", value: equipment.duration },
                      ].map((s) => {
                        const Icon = s.icon;
                        return (
                          <div key={s.label} className="rounded-xl border border-white/8 bg-deep/30 p-2.5">
                            <Icon size={13} className="mb-1.5 text-cyan/70" />
                            <div className="text-[0.52rem] uppercase tracking-[0.12em] text-slate-500">
                              {s.label}
                            </div>
                            <div className="mt-0.5 text-[0.7rem] leading-snug text-slate-200">{s.value}</div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button onClick={() => setDetailTab("model")} className="btn btn-gold !py-2.5 !text-[0.66rem]">
                        <Box size={14} /> Explore in 3D
                      </button>
                      <button
                        onClick={() => {
                          setChapterIndex(0);
                          setStoryOpen(true);
                        }}
                        className="btn btn-ghost !py-2.5 !text-[0.66rem]"
                      >
                        <Play size={13} /> Story mode
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={equipment.image}
                        alt={equipment.imageCaption}
                        loading="lazy"
                        className="h-44 w-full object-cover sm:h-52"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/40 to-transparent p-2.5">
                        <p className="text-[0.62rem] leading-snug text-slate-300">{equipment.imageCaption}</p>
                        <p className="mt-0.5 text-[0.54rem] uppercase tracking-[0.12em] text-slate-500">
                          Credit: {equipment.imageCredit}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-deep/25 p-3">
                      <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                        Scientific payload
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {equipment.instruments.slice(0, 6).map((i) => (
                          <span
                            key={i}
                            className="rounded-md border border-white/10 bg-ink/40 px-1.5 py-1 text-[0.58rem] text-slate-300"
                          >
                            {i}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-deep/25 p-3">
                      <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                        Mission objectives
                      </div>
                      <ul className="space-y-1.5">
                        {equipment.objectives.map((o) => (
                          <li key={o} className="flex gap-2 text-[0.64rem] leading-snug text-slate-400">
                            <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-gold/70" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* specs + sources */}
                  <div className="xl:col-span-2">
                    <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                      <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                        <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                          Specification sheet
                        </div>
                        <dl className="divide-y divide-white/5">
                          {equipment.specs.map((s) => (
                            <div key={s.label} className="flex items-baseline justify-between gap-3 py-1.5">
                              <dt className="text-[0.62rem] uppercase tracking-[0.08em] text-slate-500">
                                {s.label}
                              </dt>
                              <dd className="text-right text-[0.68rem] text-slate-200">{s.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                      <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                        <div className="data mb-2 flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                          <MapPin size={10} /> Sources & verification
                        </div>
                        <ul className="space-y-2">
                          {equipment.sources.map((s) => (
                            <li key={s.url} className="text-[0.64rem] leading-snug">
                              <SourceLink href={s.url}>{s.label}</SourceLink>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-3 border-t border-white/5 pt-2 text-[0.58rem] leading-relaxed text-slate-500">
                          Figures compiled from NASA mission records and cross-checked against
                          published mission summaries. Where a value is uncertain it is labelled as
                          an estimate on the statistics pages.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tab === "record" && (
                <div className="space-y-3">
                  <div>
                    <span className="eyebrow">Complete record</span>
                    <h3 className="display mt-1 text-2xl text-white sm:text-3xl">{equipment.name}</h3>
                    <p className="mt-1 text-[0.62rem] uppercase tracking-[0.14em] text-slate-500">
                      {equipment.mission} · {equipment.agency} · {equipment.years}
                    </p>
                    <div className="mt-2.5 rounded-xl border border-gold/25 bg-gold/[0.06] p-3.5">
                      <div className="data text-[0.55rem] uppercase tracking-[0.2em] text-gold/80">
                        Overview · what it is
                      </div>
                      <p className="mt-1.5 text-[0.8rem] leading-relaxed text-slate-200">
                        {equipment.record?.what ?? equipment.summary}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 lg:grid-cols-[1.35fr_1fr]">
                    <div className="space-y-2">
                      {[
                        { key: "history" as const, title: "Mission history", kicker: "Who built it, when it launched and why", meta: `${equipment.agency} · ${equipment.years}` },
                        { key: "journey" as const, title: "The journey", kicker: `How it reached ${equipment.planet === "mars" ? "Mars" : "the Moon"}`, meta: "Cruise and descent" },
                        { key: "landing" as const, title: "Landing and deployment", kicker: "How it got onto the surface", meta: equipment.landed },
                        { key: "fate" as const, title: "What happened to it", kicker: "Its actual final known status", meta: STATUS_LABEL[equipment.status] },
                        { key: "legacy" as const, title: "Why it still matters", kicker: "The long-term significance", meta: IMPORTANCE_LABEL[importanceOf(equipment)] },
                      ].map((s, i) => (
                        <div
                          key={s.key}
                          className="rounded-xl border border-white/8 bg-[linear-gradient(150deg,rgba(12,26,52,0.55),rgba(2,5,12,0.6))] p-3.5"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="display text-2xl text-white/15">{String(i + 1).padStart(2, "0")}</span>
                            <div className="min-w-0">
                              <div className="text-[0.82rem] font-semibold text-white">{s.title}</div>
                              <div className="text-[0.54rem] uppercase tracking-[0.14em] text-cyan/60">{s.kicker}</div>
                            </div>
                            <span className="ml-auto hidden shrink-0 text-[0.52rem] uppercase tracking-[0.12em] text-slate-600 sm:block">
                              {s.meta}
                            </span>
                          </div>
                          <p className="mt-2 text-[0.74rem] leading-relaxed text-slate-400">
                            {equipment.record?.[s.key]}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                        <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">Key facts</div>
                        <dl className="divide-y divide-white/5">
                          {[
                            ["Mission", equipment.mission],
                            ["Agency", equipment.agency],
                            ["Country", equipment.country ?? "International"],
                            ["Year", equipment.years],
                            ["Landed / released", equipment.landed],
                            ["Site", equipment.site],
                            ["Status", STATUS_LABEL[equipment.status]],
                            ["Importance", IMPORTANCE_LABEL[importanceOf(equipment)]],
                            ["Catalogue type", equipment.specs[0]?.value ?? "Hardware"],
                          ].map(([label, value]) => (
                            <div key={label} className="flex items-baseline justify-between gap-3 py-1.5">
                              <dt className="text-[0.58rem] uppercase tracking-[0.08em] text-slate-500">{label}</dt>
                              <dd className="text-right text-[0.68rem] text-slate-200">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                        <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                          Specification sheet
                        </div>
                        <dl className="divide-y divide-white/5">
                          {equipment.specs.map((s) => (
                            <div key={s.label} className="flex items-baseline justify-between gap-3 py-1.5">
                              <dt className="text-[0.58rem] uppercase tracking-[0.08em] text-slate-500">{s.label}</dt>
                              <dd className="text-right text-[0.68rem] text-slate-200">{s.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>

                      <button
                        onClick={() => setDetailTab("sources")}
                        className="flex w-full items-center justify-between rounded-xl border border-cyan/25 bg-cyan/5 px-3.5 py-2.5 text-left transition hover:border-cyan/50"
                      >
                        <span>
                          <span className="block text-[0.68rem] font-medium text-white">Sources and files</span>
                          <span className="block text-[0.54rem] uppercase tracking-[0.12em] text-cyan/60">
                            {equipment.sources.length} references · {downloadsOf(equipment).length} downloads
                          </span>
                        </span>
                        <ArrowRight size={13} className="shrink-0 text-cyan/70" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2 lg:grid-cols-3">
                    <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                      <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                        Scientific discoveries
                      </div>
                      <ul className="space-y-2">
                        {equipment.discoveries.slice(0, 3).map((d) => (
                          <li key={d.title}>
                            <div className="text-[0.72rem] font-medium text-white">{d.title}</div>
                            {d.year && (
                              <span className="data text-[0.5rem] uppercase tracking-[0.14em] text-cyan/60">
                                {d.year}
                              </span>
                            )}
                            <p className="mt-0.5 line-clamp-3 text-[0.68rem] leading-relaxed text-slate-400">
                              {d.body}
                            </p>
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => setDetailTab("discoveries")}
                        className="mt-2.5 inline-flex items-center gap-1 text-[0.56rem] uppercase tracking-[0.14em] text-cyan/70 hover:text-cyan"
                      >
                        All {equipment.discoveries.length} findings <ArrowRight size={10} />
                      </button>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                      <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                        Components
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {components.map((c) => (
                          <span
                            key={c.id}
                            className="rounded border border-white/12 bg-white/[0.03] px-1.5 py-1 text-[0.56rem] text-slate-300"
                          >
                            {c.label}
                          </span>
                        ))}
                      </div>
                      <p className="mt-2 text-[0.62rem] leading-relaxed text-slate-500">
                        {components.length} documented assemblies. Select any of them in the model to read its
                        description, or pull the machine apart in exploded view.
                      </p>
                      <button
                        onClick={() => setDetailTab("model")}
                        className="mt-2.5 inline-flex items-center gap-1 text-[0.56rem] uppercase tracking-[0.14em] text-cyan/70 hover:text-cyan"
                      >
                        Open the 3D model <Box size={10} />
                      </button>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                      <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                        Gallery
                      </div>
                      <div className="flex gap-1.5">
                        {equipment.gallery.slice(0, 3).map((g, i) => (
                          <button
                            key={`${g.src}-${i}`}
                            onClick={() => setDetailTab("gallery")}
                            className="relative aspect-[4/3] flex-1 overflow-hidden rounded-lg border border-white/10"
                            aria-label={`Gallery image ${i + 1}`}
                          >
                            <img src={g.src} alt={g.caption} className="h-full w-full object-cover" loading="lazy" />
                          </button>
                        ))}
                      </div>
                      <p className="mt-2 line-clamp-2 text-[0.62rem] leading-relaxed text-slate-500">
                        {equipment.imageKind === "artifact"
                          ? "Published photographs of this hardware."
                          : "Representative imagery — this object has not been photographed on the surface."}
                      </p>
                      <button
                        onClick={() => setDetailTab("gallery")}
                        className="mt-2.5 inline-flex items-center gap-1 text-[0.56rem] uppercase tracking-[0.14em] text-cyan/70 hover:text-cyan"
                      >
                        Open gallery <Images size={10} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tab === "model" && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                      <span className="eyebrow">Interactive reconstruction</span>
                      <h3 className="display mt-1 text-2xl text-white">{equipment.name} in 3D</h3>
                      <p className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.14em] text-slate-500">
                        <span className="rounded border border-white/15 px-1.5 py-0.5">
                          {assetLabel(asset)}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.5 ${
                            asset.source === "official"
                              ? "border-emerald-400/40 text-emerald-300"
                              : "border-cyan/30 text-cyan/80"
                          }`}
                        >
                          {modelRepresentationLabel(asset)}
                        </span>
                        <span className="rounded border border-white/15 px-1.5 py-0.5">{components.length} components</span>
                      </p>
                    </div>
                    <p className="max-w-sm text-[0.66rem] leading-relaxed text-slate-400">
                      {asset.note} {modelRepresentationNote(asset)}
                    </p>
                  </div>
                  <EquipmentViewer equipment={equipment} />
                  <div className="grid gap-2 sm:grid-cols-2">
                    {components.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        className="rounded-xl border border-white/8 bg-deep/25 p-3 text-left transition hover:border-cyan/40"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <span className="data text-[0.5rem] uppercase tracking-[0.16em] text-cyan/60">
                              {c.group}
                            </span>
                            <div className="text-[0.78rem] font-medium text-white">{c.label}</div>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`shrink-0 text-slate-500 transition ${expanded === c.id ? "rotate-180" : ""}`}
                          />
                        </div>
                        <AnimatePresence>
                          {expanded === c.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <p className="mt-2 text-[0.7rem] leading-relaxed text-slate-400">
                                {c.description}
                              </p>
                              {c.spec && (
                                <span className="mt-2 inline-block rounded border border-gold/30 px-1.5 py-0.5 data text-[0.56rem] text-gold/90">
                                  {c.spec}
                                </span>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {tab === "story" && (
                <div>
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <span className="eyebrow">Every machine has a story</span>
                      <h3 className="display mt-1 text-2xl text-white sm:text-3xl">
                        Seven chapters, one mission
                      </h3>
                    </div>
                    <button
                      onClick={() => {
                        setChapterIndex(0);
                        setStoryOpen(true);
                      }}
                      className="btn btn-gold !py-2.5 !text-[0.66rem]"
                    >
                      <Play size={13} /> Play story mode
                    </button>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {["beginning", "journey", "landing", "mission", "finalDays", "legacy"].map((key, i) => {
                      const titles = [
                        "The Beginning",
                        "The Journey",
                        "The Landing",
                        "The Mission",
                        "The Final Days",
                        "The Legacy",
                      ];
                      const kickers = [
                        "Why it was built",
                        "From Earth to another world",
                        "The moment everything could fail",
                        "What it did out there",
                        "How the mission ended",
                        "Why it still matters",
                      ];
                      const body = equipment.story[key as keyof Equipment["story"]];
                      return (
                        <div
                          key={key}
                          className="rounded-xl border border-white/8 bg-[linear-gradient(150deg,rgba(12,26,52,0.55),rgba(2,5,12,0.6))] p-3.5"
                        >
                          <div className="flex items-baseline gap-2">
                            <span className="display text-2xl text-white/15">{String(i + 1).padStart(2, "0")}</span>
                            <div>
                              <div className="text-[0.78rem] font-semibold text-white">{titles[i]}</div>
                              <div className="text-[0.54rem] uppercase tracking-[0.14em] text-cyan/60">
                                {kickers[i]}
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 line-clamp-4 text-[0.7rem] leading-relaxed text-slate-400">
                            {body.join(" ")}
                          </p>
                          <button
                            onClick={() => {
                              setChapterIndex(i);
                              setStoryOpen(true);
                            }}
                            className="mt-2 inline-flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.16em] text-gold/80 transition hover:text-gold"
                          >
                            Read chapter <ArrowRight size={11} />
                          </button>
                        </div>
                      );
                    })}
                    <div className="rounded-xl border border-gold/30 bg-[linear-gradient(150deg,rgba(40,26,6,0.5),rgba(2,5,12,0.7))] p-3.5">
                      <div className="flex items-baseline gap-2">
                        <span className="display text-2xl text-gold/30">07</span>
                        <div>
                          <div className="text-[0.78rem] font-semibold text-white">Its Components</div>
                          <div className="text-[0.54rem] uppercase tracking-[0.14em] text-gold/60">
                            Explore the machine part by part
                          </div>
                        </div>
                      </div>
                      <p className="mt-2 text-[0.7rem] leading-relaxed text-slate-400">
                        Open the 3D model and switch to exploded view to see how the machine was
                        assembled and what each component does.
                      </p>
                      <button
                        onClick={() => setDetailTab("model")}
                        className="mt-2 inline-flex items-center gap-1 text-[0.6rem] uppercase tracking-[0.16em] text-gold transition hover:text-sand"
                      >
                        Open 3D model <Box size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {tab === "discoveries" && (
                <div>
                  <span className="eyebrow">Science that outlived the machine</span>
                  <h3 className="display mt-1 text-2xl text-white sm:text-3xl">
                    What {equipment.name} found
                  </h3>
                  <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                    {equipment.discoveries.map((d, i) => (
                      <motion.div
                        key={d.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="hud-corners relative rounded-xl border border-cyan/20 bg-[linear-gradient(160deg,rgba(12,32,62,0.6),rgba(4,9,20,0.8))] p-3.5"
                      >
                        {d.year && (
                          <span className="data text-[0.55rem] uppercase tracking-[0.2em] text-gold/80">
                            {d.year}
                          </span>
                        )}
                        <h4 className="mt-1 text-[0.86rem] font-semibold leading-snug text-white">
                          {d.title}
                        </h4>
                        <p className="mt-1.5 text-[0.7rem] leading-relaxed text-slate-400">{d.body}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-3 rounded-xl border border-white/8 bg-deep/25 p-3.5">
                    <div className="data mb-1 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                      Verification
                    </div>
                    <p className="text-[0.7rem] leading-relaxed text-slate-400">
                      Findings summarised from peer-reviewed results and NASA mission science
                      reports. Instrument names are listed on the Overview tab; full references are
                      in the Sources panel below.
                    </p>
                  </div>
                </div>
              )}

              {tab === "gallery" && (
                <div>
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <span className="eyebrow">Mission photography</span>
                      <h3 className="display mt-1 text-2xl text-white sm:text-3xl">
                        {equipment.name} in images
                      </h3>
                    </div>
                    <span className="data text-[0.6rem] uppercase tracking-[0.16em] text-slate-500">
                      {equipment.gallery.length} frames
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {equipment.gallery.map((g, i) => (
                      <button
                        key={g.src + i}
                        onClick={() => setLightbox(i)}
                        className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-white/10"
                      >
                        <img
                          src={g.src}
                          alt={g.caption}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 to-transparent p-2 opacity-0 transition group-hover:opacity-100">
                          <p className="line-clamp-2 text-[0.58rem] leading-snug text-slate-200">{g.caption}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Lightbox
                    shots={equipment.gallery}
                    index={lightbox}
                    onClose={() => setLightbox(null)}
                    onIndex={setLightbox}
                  />
                </div>
              )}

              {tab === "sources" && (
                <div className="space-y-3">
                  <div>
                    <span className="eyebrow">Sources and downloads</span>
                    <h3 className="display mt-1 text-2xl text-white sm:text-3xl">
                      Where this record comes from
                    </h3>
                    <p className="mt-1.5 max-w-2xl text-[0.74rem] leading-relaxed text-slate-400">
                      Every entry links to official mission documentation, imagery and, where one
exists, a published 3D model. Nothing here is a generic homepage: links point at the
                      mission record, the imagery archive or the model file itself.
                    </p>
                  </div>

                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                      <div className="data mb-2 flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                        <MapPin size={10} /> Historical and technical sources
                      </div>
                      <ul className="space-y-2">
                        {equipment.sources.map((s) => (
                          <li key={s.url} className="text-[0.7rem] leading-snug">
                            <SourceLink href={s.url}>{s.label}</SourceLink>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl border border-gold/20 bg-[linear-gradient(160deg,rgba(40,28,6,0.35),rgba(2,5,12,0.6))] p-3.5">
                      <div className="data mb-2 flex items-center gap-1.5 text-[0.55rem] uppercase tracking-[0.2em] text-gold/80">
                        <Download size={10} /> Model and file sources
                      </div>
                      <ul className="space-y-2">
                        {downloadsOf(equipment).map((s) => (
                          <li key={s.url} className="text-[0.7rem] leading-snug">
                            <SourceLink href={s.url}>{s.label}</SourceLink>
                          </li>
                        ))}
                      </ul>
                      <p className="mt-3 border-t border-white/5 pt-2 text-[0.52rem] uppercase tracking-[0.16em] text-gold/70">
                        Usage and licence
                      </p>
                      <p className="mt-1 text-[0.6rem] leading-relaxed text-slate-400">
                        {equipment.license}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                      <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                        Image attribution
                      </div>
                      <p className="text-[0.7rem] leading-relaxed text-slate-300">{equipment.imageCaption}</p>
                      <p className="mt-1 text-[0.58rem] uppercase tracking-[0.12em] text-slate-500">
                        Credit: {equipment.imageCredit}
                      </p>
                      <p className="mt-2 rounded-md border border-amber-400/25 bg-amber-400/5 px-2 py-1.5 text-[0.6rem] leading-relaxed text-amber-200/90">
                        {equipment.imageKind === "artifact"
                          ? "Published photograph of this object or its mission hardware."
                          : "Representative image: the terrain this object sits on. No published close-up of this specific object exists."}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/8 bg-deep/25 p-3.5">
                      <div className="data mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                        Catalogue note
                      </div>
                      <p className="text-[0.7rem] leading-relaxed text-slate-400">
                        This entry counts one separately documented hardware unit — a complete machine, an
                        experiment station or a jettisoned component such as a heat shield or parachute. It is
                        not a count of every object at the site: tools, packaging and small items are not
                        catalogued separately here. Where coordinates, mass or condition are uncertain, the
                        record says so instead of estimating.
                      </p>
                      <p className="mt-2 text-[0.6rem] uppercase tracking-[0.12em] text-slate-600">
                        {equipment.sources.length} references · {equipment.instruments.length} instruments ·{" "}
                        {componentsOf(equipment).length} documented components
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* footer nav */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/8 bg-deep/25 px-3 py-2.5">
            <button
              onClick={() => openEquipment(prevEquipment(equipment.id, planet).id, "overview")}
              className="flex items-center gap-2 text-left text-[0.66rem] text-slate-300 transition hover:text-cyan"
            >
              <ArrowLeft size={13} />
              <span>
                <span className="block text-[0.5rem] uppercase tracking-[0.16em] text-slate-500">Previous machine</span>
                {prevEquipment(equipment.id, planet).name}
              </span>
            </button>
            <a
              href={equipment.sources[0]?.url}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden items-center gap-1 text-[0.58rem] uppercase tracking-[0.16em] text-cyan/60 transition hover:text-cyan sm:flex"
            >
              Primary source <ExternalLink size={10} />
            </a>
            <button
              onClick={() => openEquipment(nextEquipment(equipment.id, planet).id, "overview")}
              className="flex items-center gap-2 text-right text-[0.66rem] text-slate-300 transition hover:text-cyan"
            >
              <span>
                <span className="block text-[0.5rem] uppercase tracking-[0.16em] text-slate-500">Next machine</span>
                {nextEquipment(equipment.id, planet).name}
              </span>
              <ArrowRight size={13} />
            </button>
          </div>

          {!embedded && (
            <p className="mt-2 px-1 text-[0.58rem] uppercase tracking-[0.16em] text-slate-600">
              Use ← / → on your keyboard to move between machines
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {storyOpen && (
          <StoryMode
            equipment={equipment}
            startAt={chapterIndex}
            onClose={() => setStoryOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
