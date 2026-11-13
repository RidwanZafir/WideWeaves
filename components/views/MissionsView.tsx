"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Rocket, Check, CircleDot } from "lucide-react";
import { Breadcrumb, SectionHeader, SourceLink } from "@/components/ui/Atoms";
import { TIMELINE_BY_YEAR } from "@/data/timeline";
import { PLANETS } from "@/data/planets";
import { getEquipment } from "@/data/equipment";
import { useAfterlight } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";
import type { Planet } from "@/data/types";

export default function MissionsView() {
  const { go, openEquipment, setPlanet } = useAfterlight();
  const openRecord = (id: string) => {
    const record = getEquipment(id);
    if (!record) return;
    setPlanet(record.planet);
    openEquipment(record.id, "overview");
  };
  const target = useNavigation((state) => state.missionTarget);
  const [filter, setFilter] = useState<Planet | "deep" | "all">("all");
  const [active, setActive] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const eventPanel = useRef<HTMLDivElement>(null);
  const pendingTargetRequest = useRef<number | null>(null);

  useEffect(() => {
    if (!target) return;
    const navigation = useNavigation.getState();
    if (target.request <= navigation.consumedMissionRequest) return;
    const index = TIMELINE_BY_YEAR.findIndex((entry) => entry.id === target.id);
    if (index < 0) return;
    navigation.consumeMissionRequest(target.request);
    pendingTargetRequest.current = target.request;
    setFilter("all");
    setActive(index);
  }, [target]);

  const events = useMemo(
    () => (filter === "all" ? TIMELINE_BY_YEAR : TIMELINE_BY_YEAR.filter((e) => e.planet === filter)),
    [filter],
  );
  const event = events[Math.min(active, events.length - 1)];
  const equipment = event?.equipmentId ? getEquipment(event.equipmentId) : null;
  const firstYear = events[0]?.year;
  const lastYear = events[events.length - 1]?.year;

  useEffect(() => {
    if (!target || target.id !== event?.id || pendingTargetRequest.current !== target.request) return;
    let secondFrame = 0;
    const frame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        eventPanel.current?.scrollIntoView({ block: "center", behavior: "auto" });
        pendingTargetRequest.current = null;
      });
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(secondFrame); };
  }, [target, event?.id]);

  // Keep the selected milestone visible in the year rail, whichever way it was chosen.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const node = rail.current?.querySelectorAll<HTMLElement>("[data-year-index]")[active];
    node?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [active]);

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "Missions" }]} />
      <SectionHeader
        className="mt-4"
        eyebrow={`${firstYear}–${lastYear} · ${events.length} milestones`}
        title={
          <>
            A timeline of machines and <span className="text-gradient-ice">first attempts</span>
          </>
        }
        description="From lunar landings and Mars rovers to spacecraft at asteroids and beyond. Select a milestone, follow its mission reference and open the hardware's story."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "moon", "mars", "deep"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setFilter(f);
                  setActive(0);
                }}
                className="chip"
                data-active={filter === f}
              >
                {f === "all" ? "All" : f === "deep" ? "Deep space" : PLANETS[f].name}
              </button>
            ))}
          </div>
        }
      />

      {/* year rail */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-deep/25">
        <div ref={rail} className="flex items-center gap-2 overflow-x-auto hide-scrollbar px-3 py-3">
          {events.map((e, i) => (
            <button
              key={e.id}
              data-year-index={i}
              aria-label={`${e.year}: ${e.title}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={`group flex shrink-0 flex-col items-center gap-1 rounded-xl px-3 py-2 transition ${
                i === active ? "bg-white/10" : "hover:bg-white/5"
              }`}
            >
              <span
                className={`data text-[0.66rem] ${i === active ? "text-gold" : "text-slate-400"}`}
              >
                {e.year}
              </span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  i === active
                    ? "bg-gold shadow-[0_0_10px_3px_rgba(255,201,60,0.5)]"
                    : e.planet === "mars"
                      ? "bg-ember/60"
                      : "bg-cyan/60"
                }`}
              />
            </button>
          ))}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-cyan/30 to-transparent" />
        <div className="flex items-center justify-between px-3 py-2">
          <span className="data text-[0.55rem] uppercase tracking-[0.16em] text-slate-500">
            {event ? `${events.indexOf(event) + 1} / ${events.length}` : "—"} · {event?.date}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActive((a) => Math.max(0, a - 1))}
              disabled={active === 0}
              className="icon-btn !h-8 !w-8 disabled:opacity-30"
              aria-label="Previous milestone"
            >
              <ArrowLeft size={14} />
            </button>
            <button
              onClick={() => setActive((a) => Math.min(events.length - 1, a + 1))}
              disabled={active >= events.length - 1}
              className="icon-btn !h-8 !w-8 disabled:opacity-30"
              aria-label="Next milestone"
            >
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* active event */}
      {event && (
        <motion.div
          ref={eventPanel}
          key={event.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`mt-3 grid scroll-mt-36 gap-3 rounded-2xl lg:grid-cols-[1.3fr_1fr] ${target?.id === event.id ? "ring-2 ring-gold/50" : ""}`}
        >
          <div className="relative overflow-hidden rounded-2xl border border-cyan/25 bg-[linear-gradient(160deg,rgba(12,30,60,0.85),rgba(2,5,12,0.95))] p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="data rounded-md bg-gold/15 px-2 py-1 text-[0.58rem] uppercase tracking-[0.12em] text-gold">
                {event.date}
              </span>
              <span className="data rounded-md bg-white/8 px-2 py-1 text-[0.56rem] uppercase tracking-[0.12em] text-slate-300">
                {event.agency}
              </span>
              <span className="data rounded-md bg-cyan/10 px-2 py-1 text-[0.56rem] uppercase tracking-[0.12em] text-cyan">
                {PLANETS[event.planet as Planet]?.name ?? "Deep space"}
              </span>
              {event.milestone === "first" && (
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-400/10 px-2 py-1 text-[0.56rem] uppercase tracking-[0.12em] text-emerald-300">
                  <Check size={10} /> first
                </span>
              )}
            </div>
            <h3 className="display mt-3 text-2xl text-white sm:text-3xl">{event.title}</h3>
            {target?.id === event.id && <p role="status" className="mt-2 text-xs text-gold">Selected milestone</p>}
            <p className="mt-2 max-w-xl text-[0.82rem] leading-relaxed text-slate-300">{event.summary}</p>
            <div className="mt-3 space-y-2 text-xs">
              {event.sources?.map((source) => <div key={source.url}><SourceLink href={source.url}>{source.label}</SourceLink>{source.note && <p className="mt-1 text-xs leading-relaxed text-slate-400">{source.note}</p>}</div>)}
            </div>

            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan via-electric to-gold"
                initial={{ width: 0 }}
                animate={{ width: `${((events.indexOf(event) + 1) / events.length) * 100}%` }}
                transition={{ duration: 0.7 }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[0.55rem] uppercase tracking-[0.14em] text-slate-500">
              <span>{firstYear}</span>
              <span>{lastYear}</span>
            </div>

            {equipment && (
              <button
                onClick={() => openRecord(equipment.id)}
                className="btn btn-gold mt-4 !py-2.5 !text-[0.64rem]"
              >
                <Rocket size={13} /> Open {equipment.name}
              </button>
            )}
            {event.deepSpaceId && <button onClick={() => { useNavigation.getState().targetDeepSpace(event.deepSpaceId!); go("deepspace"); }} className="btn btn-gold mt-4 !min-h-11 !text-xs"><Rocket size={13} /> Read the spacecraft story</button>}
          </div>

          {equipment ? (
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-deep/25">
              <img
                src={equipment.image}
                alt={equipment.imageCaption}
                className="h-40 w-full object-cover"
              />
              <div className="p-3">
                <span className="data text-[0.52rem] uppercase tracking-[0.18em] text-cyan/70">
                  {equipment.mission}
                </span>
                <h4 className="display text-lg text-white">{equipment.name}</h4>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-slate-400">{equipment.tagline}</p>
                <p className="mt-2 text-[0.54rem] uppercase tracking-[0.1em] text-slate-600">
                  Image: {equipment.imageCredit}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid place-items-center rounded-2xl border border-white/10 bg-deep/25 p-6 text-center">
              <div>
                <CircleDot size={20} className="mx-auto text-cyan/70" />
                <p className="mt-2 text-[0.74rem] text-slate-400">
                  This milestone is a mission-level record. Browse the archive for the machines
                  involved.
                </p>
                <button onClick={() => go("explore")} className="btn btn-ghost mt-3 !py-2 !text-[0.6rem]">
                  Equipment archive
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* full list */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-deep/20 p-3 md:p-4">
        <span className="data text-[0.56rem] uppercase tracking-[0.2em] text-cyan/70">
          All milestones
        </span>
        <div className="mt-2 grid grid-cols-1 gap-x-6 md:grid-cols-2">
          {events.map((e, i) => (
            <button
              key={e.id}
              onClick={() => setActive(i)}
              className={`group flex min-w-0 items-start gap-3 border-b border-white/6 py-2.5 text-left last:border-0 ${
                i === active ? "text-white" : "text-slate-300"
              }`}
            >
              <span className={`data mt-0.5 w-10 shrink-0 text-[0.62rem] ${i === active ? "text-gold" : "text-slate-500"}`}>
                {e.year}
              </span>
              <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${e.planet === "mars" ? "bg-ember" : "bg-cyan"}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-[0.78rem] font-medium group-hover:text-cyan">{e.title}</span>
                <span className="block truncate text-[0.6rem] text-slate-500">{e.agency} · {e.date}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
