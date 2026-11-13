"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles, Microscope, Droplets, Wind, Mountain, Search, X } from "lucide-react";
import { Breadcrumb, SectionHeader, SourceLink } from "@/components/ui/Atoms";
import { resource } from "@/data/resources";
import { EQUIPMENT, importanceOf, getEquipment } from "@/data/equipment";
import { PLANETS } from "@/data/planets";
import { useAfterlight } from "@/lib/store";
import type { Discovery, Equipment, Importance, Planet } from "@/data/types";

const IMPORTANCE_RANK: Record<Importance, number> = { iconic: 0, major: 1, archive: 2 };
const PAGE = 24;

type Finding = Discovery & { equipment: Equipment };

/** Icon chosen from what the finding is about, not from its position in the list. */
function iconFor(d: Discovery) {
  const text = `${d.title} ${d.body}`.toLowerCase();
  if (/water|ice\b|brine|hydrolog|lake|river|ocean/.test(text)) return Droplets;
  if (/organic|carbon|sample|chemist|mineral|lab|isotope/.test(text)) return Microscope;
  if (/atmos|weather|dust|wind|cloud|methane/.test(text)) return Wind;
  if (/seismic|quake|core|magnet|gravity/.test(text)) return Mountain;
  return Sparkles;
}

export default function DiscoveriesView() {
  const { go, openEquipment, setPlanet: setDestination } = useAfterlight();
  const openRecord = (id: string) => {
    const record = getEquipment(id);
    if (!record) return;
    setDestination(record.planet);
    openEquipment(record.id, "discoveries");
  };
  const [planet, setPlanet] = useState<Planet | "all">("all");
  const [scope, setScope] = useState<"important" | "all">("important");
  const [q, setQ] = useState("");
  const [limit, setLimit] = useState(PAGE);

  const findings = useMemo<Finding[]>(() => {
    const seen = new Set<string>();
    const list = EQUIPMENT.filter((e) => planet === "all" || e.planet === planet)
      .filter((e) => scope === "all" || importanceOf(e) !== "archive")
      .sort((a, b) => IMPORTANCE_RANK[importanceOf(a)] - IMPORTANCE_RANK[importanceOf(b)]);

    const out: Finding[] = [];
    for (const e of list) {
      for (const d of e.discoveries) {
        // Several catalogue entries share the same instrument-level statement;
        // show each distinct finding once, credited to the machine that made it.
        const key = `${d.title}|${d.body}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ ...d, equipment: e });
      }
    }

    const needle = q.trim().toLowerCase();
    if (!needle) return out;
    return out.filter((f) =>
      `${f.title} ${f.body} ${f.equipment.name} ${f.equipment.mission} ${f.equipment.agency}`
        .toLowerCase()
        .includes(needle),
    );
  }, [planet, scope, q]);

  const shown = findings.slice(0, limit);
  const machines = new Set(findings.map((f) => f.equipment.id));
  const iconic = findings.filter((f) => importanceOf(f.equipment) === "iconic").length;
  const moonShare = findings.filter((f) => f.equipment.planet === "moon").length;

  const allFindings = EQUIPMENT.reduce((n, e) => n + e.discoveries.length, 0);

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "Discoveries" }]} />
      <SectionHeader
        className="mt-4"
        eyebrow={`${findings.length} findings · ${machines.size} machines`}
        title={
          <>
            What the abandoned machines <span className="text-gradient-mars">found</span>
          </>
        }
        description="Water. Organic carbon. A liquid core. Weather on another world. These results came from instruments sent to explore the Moon and Mars, and they are still being analysed. Historic and major machines lead the list; choose Everything for all findings."
        action={
          <div className="flex items-center gap-1.5">
            {(["all", "moon", "mars"] as const).map((f) => (
              <button
                key={f}
                onClick={() => {
                  setPlanet(f);
                  setLimit(PAGE);
                }}
                className="chip"
                data-active={planet === f}
              >
                {f === "all" ? "Both worlds" : PLANETS[f].name}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-5 flex flex-wrap items-center gap-2 rounded-[0.65rem] border-2 border-white/12 bg-deep/30 p-2.5">
        <div className="flex min-w-0 basis-full items-center gap-2 rounded-[0.55rem] border-2 border-white/15 bg-ink/60 px-3 py-2 focus-within:border-cyan/70 focus-within:ring-2 focus-within:ring-cyan/30 sm:min-w-[15rem] sm:flex-1">
          <Search size={14} className="text-slate-500" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Search findings, machines, missions…"
            aria-label="Search discoveries"
            className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-slate-400 focus:outline-none sm:text-sm"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="text-action grid min-h-11 min-w-11 place-items-center text-slate-300 hover:text-white"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              setScope("important");
              setLimit(PAGE);
            }}
            className="chip"
            data-active={scope === "important"}
          >
            Historic &amp; major
          </button>
          <button
            onClick={() => {
              setScope("all");
              setLimit(PAGE);
            }}
            className="chip"
            data-active={scope === "all"}
          >
            Everything
          </button>
        </div>
        <p className="data ml-auto text-[0.55rem] uppercase tracking-[0.14em] text-slate-500">
          {shown.length} of {findings.length} shown
        </p>
      </div>

      {shown.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-white/10 bg-deep/30 p-10 text-center">
          <p className="text-sm text-slate-300">No findings match this search.</p>
          <button
            onClick={() => {
              setQ("");
              setScope("all");
            }}
            className="btn btn-ghost mt-3 !py-2 !text-[0.62rem]"
          >
            Show every finding
          </button>
        </div>
      ) : (
        <div className="adaptive-card-grid mt-3 gap-3">
          {shown.map((d, i) => {
            const Icon = iconFor(d);
            const level = importanceOf(d.equipment);
            return (
              <motion.div
                key={`${d.equipment.id}-${d.title}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: (i % 3) * 0.06 }}
                className={`hud-corners relative flex flex-col rounded-2xl border bg-[linear-gradient(160deg,rgba(12,28,56,0.75),rgba(2,5,12,0.9))] p-4 ${
                  level === "iconic" ? "border-gold/30" : "border-white/10"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-cyan/25 bg-cyan/8 text-cyan">
                    <Icon size={14} />
                  </span>
                  <div className="flex items-center gap-2">
                    {level === "iconic" && (
                      <span className="data inline-flex items-center gap-1 rounded border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[0.46rem] uppercase tracking-[0.14em] text-gold">
                        <Sparkles size={8} /> iconic
                      </span>
                    )}
                    {d.year && (
                      <span className="data text-[0.55rem] uppercase tracking-[0.18em] text-gold/80">
                        {d.year}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mt-2.5 text-[0.92rem] font-semibold leading-snug text-white">{d.title}</h3>
                <p className="mt-1.5 flex-1 text-[0.72rem] leading-relaxed text-slate-400">{d.body}</p>
                {d.equipment.sources[0] && <div className="mt-3 text-xs"><SourceLink href={d.equipment.sources[0].url}>{d.equipment.sources[0].label}</SourceLink></div>}
                <button
                  onClick={() => openRecord(d.equipment.id)}
                  className="mt-3 flex items-center justify-between gap-2 border-t border-white/8 pt-2.5 text-left"
                >
                  <span>
                    <span className="block text-[0.52rem] uppercase tracking-[0.14em] text-slate-500">
                      {PLANETS[d.equipment.planet].name} · {d.equipment.mission}
                    </span>
                    <span className="block text-[0.72rem] text-slate-200">{d.equipment.name}</span>
                  </span>
                  <ArrowUpRight size={14} className="text-cyan/70" />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      {findings.length > shown.length && (
        <div className="mt-3 flex justify-center">
          <button onClick={() => setLimit((l) => l + PAGE)} className="btn btn-ghost !py-2.5 !text-[0.64rem]">
            Show {Math.min(PAGE, findings.length - shown.length)} more findings
          </button>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-cyan/20 bg-deep/25 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-[0.76rem] leading-relaxed text-slate-400">
            Every discovery here is tied to a specific instrument and mission. Open a machine to see
            which instruments produced the result, and check its sources.
          </p>
          <button onClick={() => go("learn")} className="btn btn-ghost !py-2.5 !text-[0.64rem]">
            Learn the science <ArrowUpRight size={13} />
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs"><SourceLink href={resource("jpl").url}>Investigate the mission at JPL</SourceLink><SourceLink href="https://pds.nasa.gov/">Find planetary measurements in NASA PDS</SourceLink></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "findings in this view", value: String(findings.length) },
            { label: "machines credited", value: String(machines.size) },
            { label: "from iconic machines", value: String(iconic) },
            { label: "Moon / Mars split", value: `${moonShare} / ${findings.length - moonShare}` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-white/8 bg-ink/40 p-2.5">
              <div className="data text-[0.72rem] text-white">{s.value}</div>
              <div className="text-[0.54rem] uppercase tracking-[0.1em] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[0.58rem] uppercase tracking-[0.12em] text-slate-600">
          {allFindings} findings and mission contributions accompany the {EQUIPMENT.length} catalogue entries
        </p>
      </div>
    </div>
  );
}
