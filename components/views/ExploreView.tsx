"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, LayoutGrid, List, X, ArrowRight, Compass } from "lucide-react";
import EquipmentCard from "@/components/sections/EquipmentCard";
import { Breadcrumb, SectionHeader, StatusPill } from "@/components/ui/Atoms";
import {
  CATEGORY_LABEL,
  EQUIPMENT,
  ICONIC_COUNT,
  IMPORTANCE_LABEL,
  MARS_COUNT,
  MOON_COUNT,
  STATUS_LABEL,
  TOTAL_EQUIPMENT,
  importanceOf,
  getEquipment,
  searchText,
  yearOf,
} from "@/data/equipment";
import { PLANETS } from "@/data/planets";
import { useAfterlight } from "@/lib/store";
import { createArchiveContext, useNavigation, type ArchiveSort } from "@/lib/navigation";
import type { EquipmentCategory, EquipmentStatus, Importance, Planet } from "@/data/types";

export default function ExploreView() {
  const { planet, setPlanet, openEquipment, go } = useAfterlight();
  const saved = useNavigation((state) => state.archive);
  const initial = useRef(createArchiveContext(planet));
  const { planets, categories, statuses, importances, sort, layout, q, visibleCount, filtersOpen } = saved ?? initial.current;
  const { initializeArchive, updateArchive, saveArchiveScroll } = useNavigation.getState();
  const setPlanets = (value: Planet[]) => updateArchive({ planets: value });
  const setCategories = (value: EquipmentCategory[]) => updateArchive({ categories: value });
  const setStatuses = (value: EquipmentStatus[]) => updateArchive({ statuses: value });
  const setImportances = (value: Importance[]) => updateArchive({ importances: value });
  const setQ = (value: string) => updateArchive({ q: value });
  const setSort = (value: ArchiveSort) => updateArchive({ sort: value });
  const setLayout = (value: "grid" | "list") => updateArchive({ layout: value });
  const lastPlanet = useRef(planet);

  useEffect(() => initializeArchive(planet), [initializeArchive, planet]);
  // A destination switch while the archive is open updates a single-world filter.
  // On remount, saved filters win: a record may have temporarily changed the world.
  useEffect(() => {
    if (lastPlanet.current === planet) return;
    const route = useAfterlight.getState();
    if (route.view !== "explore" || route.stage !== "explore") return;
    lastPlanet.current = planet;
    const current = useNavigation.getState().archive;
    if (current?.planets.length === 1) updateArchive({ planets: [planet] });
  }, [planet, updateArchive]);

  const filtersKey = JSON.stringify([planets, categories, statuses, importances, q.trim().toLowerCase(), sort]);
  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        window.scrollTo({ top: useNavigation.getState().archiveScrollY, behavior: "auto" });
      });
    });
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); };
  }, [filtersKey]);

  const openRecord = (id: string) => {
    const record = getEquipment(id);
    if (!record) return;
    saveArchiveScroll(window.scrollY);
    setPlanet(record.planet);
    openEquipment(record.id, "overview");
  };

  const toggle = <T,>(arr: T[], v: T, set: (n: T[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const results = useMemo(() => {
    const list = EQUIPMENT.filter((e) => {
      if (planets.length && !planets.includes(e.planet)) return false;
      if (categories.length && !categories.includes(e.category)) return false;
      if (statuses.length && !statuses.includes(e.status)) return false;
      if (importances.length && !importances.includes(importanceOf(e))) return false;
      if (q.trim()) {
        if (!searchText(e).includes(q.trim().toLowerCase())) return false;
      }
      return true;
    });
    return list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "mission") return a.mission.localeCompare(b.mission);
      return yearOf(b) - yearOf(a);
    });
  }, [planets, categories, statuses, importances, q, sort]);

  const visibleResults = results.slice(0, visibleCount);

  const activeFilters =
    planets.length + categories.length + statuses.length + importances.length + (q ? 1 : 0);
  const secondaryFilters = planets.length + categories.length + statuses.length + importances.length;

  const clearAll = () => {
    updateArchive({ planets: [], categories: [], statuses: [], importances: [], q: "" });
  };

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Breadcrumb
          items={[
            { label: "Home", onClick: () => go("home") },
            { label: PLANETS[planet].name, onClick: () => go("home") },
            { label: "Equipment archive" },
          ]}
        />
      </div>

      <SectionHeader
        className="mt-4"
        eyebrow="Equipment archive"
        title={
          <>
            Every machine we <span className="text-gradient-mars">left behind</span>
          </>
        }
      />
      <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:hidden">{TOTAL_EQUIPMENT} hardware records across the Moon and Mars. Search a machine or mission; choose Everything for the full archive.</p>
      <p className="mt-3 hidden max-w-[72ch] text-sm leading-relaxed text-slate-400 sm:block">{TOTAL_EQUIPMENT} catalogued hardware entries across two worlds — {MOON_COUNT} on the Moon and {MARS_COUNT} on Mars, including {ICONIC_COUNT} iconic machines. Important machines lead the list. Search by name, mission, agency, country or year, or choose Everything for the full archive.</p>

      <div className="mt-3 flex justify-end">
        <button
          onClick={() => go("map")}
          className="inline-flex items-center gap-1.5 rounded-[0.45rem] border-2 border-cyan/30 bg-cyan/5 px-3 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-cyan/80 transition hover:border-cyan/70 hover:text-cyan"
        >
          <Compass size={12} /> Find on the surface map →
        </button>
      </div>

      {/* filters */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(11,25,50,0.85),rgba(2,5,12,0.9))] p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex min-w-0 basis-full items-center gap-2 rounded-[0.55rem] border-2 border-white/15 bg-ink/60 px-3 py-2 focus-within:border-cyan/70 focus-within:ring-2 focus-within:ring-cyan/30 sm:min-w-[14rem] sm:flex-1">
            <Search size={14} className="text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search machines, missions, sites…"
              className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-slate-400 focus:outline-none sm:text-sm"
              aria-label="Search equipment"
            />
            {q && (
              <button onClick={() => setQ("")} className="text-action grid min-h-11 min-w-11 place-items-center text-slate-300 hover:text-white" aria-label="Clear search">
                <X size={13} />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {(["name", "year", "mission"] as ArchiveSort[]).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className="chip"
                data-active={sort === s}
              >
                {s === "year" ? "Year" : s === "name" ? "A–Z" : "Mission"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-[0.55rem] border-2 border-white/15 bg-abyss/60 p-1">
            <button
              onClick={() => setLayout("grid")}
              className={`grid min-h-11 min-w-11 place-items-center rounded-[0.4rem] border-2 p-1.5 ${layout === "grid" ? "border-cyan/60 bg-white/10 text-white" : "border-transparent text-slate-400"}`}
              aria-label="Grid view"
              aria-pressed={layout === "grid"}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setLayout("list")}
              className={`grid min-h-11 min-w-11 place-items-center rounded-[0.4rem] border-2 p-1.5 ${layout === "list" ? "border-cyan/60 bg-white/10 text-white" : "border-transparent text-slate-400"}`}
              aria-label="List view"
              aria-pressed={layout === "list"}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => updateArchive({ filtersOpen: !filtersOpen })}
          aria-expanded={filtersOpen}
          aria-controls="archive-secondary-filters"
          className="mt-3 flex min-h-11 w-full items-center justify-between gap-2 rounded-lg border border-white/15 px-3 text-sm text-slate-200 sm:hidden"
        >
          <span className="flex items-center gap-2"><SlidersHorizontal size={15} /> Filters · {secondaryFilters} active</span>
          <span className="text-cyan">{filtersOpen ? "Hide" : "Show"}</span>
        </button>
        <div id="archive-secondary-filters" className={`${filtersOpen ? "block" : "hidden"} mt-3 space-y-2 border-t border-white/8 pt-3 sm:block`}>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="data mr-1 text-xs uppercase tracking-[0.12em] text-slate-400">Planet</span>
            {(["moon", "mars"] as Planet[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  toggle(planets, p, setPlanets);
                }}
                className="chip"
                data-active={planets.includes(p)}
              >
                {PLANETS[p].name}
                <span className="ml-1.5 text-[0.5rem] opacity-60">
                  {p === "moon" ? MOON_COUNT : MARS_COUNT}
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="data mr-1 text-xs uppercase tracking-[0.12em] text-slate-400">Type</span>
            {(Object.keys(CATEGORY_LABEL) as EquipmentCategory[]).map((c) => (
              <button
                key={c}
                onClick={() => toggle(categories, c, setCategories)}
                className="chip"
                data-active={categories.includes(c)}
              >
                {CATEGORY_LABEL[c]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="data mr-1 text-xs uppercase tracking-[0.12em] text-slate-400">Status</span>
            {(Object.keys(STATUS_LABEL) as EquipmentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => toggle(statuses, s, setStatuses)}
                className="chip"
                data-active={statuses.includes(s)}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
            {activeFilters > 0 && (
              <button
                onClick={clearAll}
                className="ml-auto inline-flex items-center gap-1 text-[0.58rem] uppercase tracking-[0.14em] text-rose-300/80 hover:text-rose-200"
              >
                <SlidersHorizontal size={11} /> Clear {activeFilters} filters
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="data mr-1 text-xs uppercase tracking-[0.12em] text-slate-400">Importance</span>
            <button
              onClick={() => setImportances(["iconic", "major"])}
              className="chip"
              data-active={importances.includes("iconic") && importances.includes("major") && !importances.includes("archive")}
            >
              Important
              <span className="ml-1.5 text-[0.5rem] opacity-60">
                {EQUIPMENT.filter((e) => importanceOf(e) !== "archive").length}
              </span>
            </button>
            <button
              onClick={() => setImportances([])}
              className="chip"
              data-active={importances.length === 0}
            >
              Everything
              <span className="ml-1.5 text-[0.5rem] opacity-60">{TOTAL_EQUIPMENT}</span>
            </button>
            {(["iconic", "major", "archive"] as Importance[]).map((i) => (
              <button
                key={i}
                onClick={() => toggle(importances, i, setImportances)}
                className="chip"
                data-active={importances.includes(i)}
              >
                {IMPORTANCE_LABEL[i]}
                <span className="ml-1.5 text-[0.5rem] opacity-60">
                  {EQUIPMENT.filter((e) => importanceOf(e) === i).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="data text-[0.62rem] uppercase tracking-[0.16em] text-slate-500">
          {results.length} of {TOTAL_EQUIPMENT} entries match · {visibleResults.length} loaded ·{" "}
          {results.filter((e) => e.planet === "moon").length} Moon ·{" "}
          {results.filter((e) => e.planet === "mars").length} Mars
          {importances.length > 0 && !importances.includes("archive") && (
            <button
              onClick={() => setImportances([])}
              className="ml-2 normal-case tracking-normal text-cyan/70 underline-offset-2 hover:text-cyan hover:underline"
            >
              show all {TOTAL_EQUIPMENT}
            </button>
          )}
        </p>
        <p className="hidden text-[0.6rem] uppercase tracking-[0.14em] text-slate-600 sm:block">
          Click any card for the full record
        </p>
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-deep/30 p-10 text-center">
          <p className="text-sm text-slate-300">No machines match these filters.</p>
          <button onClick={clearAll} className="btn btn-ghost mt-3 !py-2 !text-[0.62rem]">
            Show all machines
          </button>
        </div>
      ) : layout === "grid" ? (
        <motion.div layout className="archive-grid mt-3 gap-3">
          {visibleResults.map((e) => (
            <motion.div key={e.id} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
              <EquipmentCard equipment={e} onOpen={() => openRecord(e.id)} />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="mt-3 space-y-2">
          {visibleResults.map((e) => (
            <button
              key={e.id}
              onClick={() => openRecord(e.id)}
              className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-deep/25 p-2.5 text-left transition hover:border-cyan/40 hover:bg-deep/40"
            >
              <img
                src={e.image}
                alt={e.name}
                loading="lazy"
                className="h-16 w-24 shrink-0 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="display text-base text-white">{e.name}</span>
                  <span className="data text-[0.52rem] uppercase tracking-[0.14em] text-cyan/60">
                    {PLANETS[e.planet].name} · {CATEGORY_LABEL[e.category]}
                  </span>
                  <StatusPill status={e.status} />
                </div>
                <p className="mt-0.5 line-clamp-1 text-[0.7rem] text-slate-400">{e.summary}</p>
                <p className="mt-0.5 text-[0.58rem] uppercase tracking-[0.12em] text-slate-600">
                  {e.mission} · {e.years}
                </p>
              </div>
              <ArrowRight size={15} className="shrink-0 text-slate-600 transition group-hover:text-cyan" />
            </button>
          ))}
        </div>
      )}

      {results.length > visibleCount && (
        <div className="mt-5 flex justify-center">
          <button onClick={() => updateArchive({ visibleCount: Math.min(visibleCount + 24, results.length) })} className="btn btn-ghost">
            Load more machines · {Math.min(visibleCount, results.length)} of {results.length}
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan/20 bg-deep/25 p-4">
        <p className="max-w-lg text-[0.74rem] leading-relaxed text-slate-400">
          Looking for something faster? Compare two machines side by side, or open the surface map
          to find hardware where it actually sits.
        </p>
        <div className="flex gap-2">
          <button onClick={() => go("compare")} className="btn btn-ghost !py-2.5 !text-[0.64rem]">
            Compare machines
          </button>
          <button
            onClick={() => {
              const destination = planet === "mars" ? "moon" : "mars";
              setPlanet(destination);
              go("home");
              useNavigation.getState().chooseArchiveDestination(destination);
            }}
            className="btn btn-gold !py-2.5 !text-[0.64rem]"
          >
            Switch to {planet === "mars" ? "the Moon" : "Mars"}
          </button>
        </div>
      </div>
    </div>
  );
}
