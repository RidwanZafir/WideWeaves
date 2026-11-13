"use client";

import { useMemo } from "react";
import { ArrowRight, ArrowLeftRight, Weight, Zap, Gauge, Layers } from "lucide-react";
import { Breadcrumb, SectionHeader, SourceLink, StatusPill } from "@/components/ui/Atoms";
import { CATEGORY_LABEL, EQUIPMENT, getEquipment } from "@/data/equipment";
import { PLANETS } from "@/data/planets";
import { componentsOf } from "@/data/equipment";
import { useAfterlight } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";

function num(s?: string): number | null {
  if (!s) return null;
  const m = s.replace(/,/g, "").match(/(\d+(\.\d+)?)/);
  return m ? parseFloat(m[1]) : null;
}

function Bar({ a, b, label }: { a: number | null; b: number | null; label: string }) {
  const max = Math.max(a ?? 0, b ?? 0, 1);
  return (
    <div className="py-2">
      <div className="mb-1 flex items-center justify-between text-[0.56rem] uppercase tracking-[0.16em] text-slate-500">
        <span className="data text-cyan">{a != null ? a.toLocaleString("en-US") : "—"}</span>
        <span>{label}</span>
        <span className="data text-gold">{b != null ? b.toLocaleString("en-US") : "—"}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="flex flex-1 justify-end">
          <div
            className="h-1.5 rounded-full bg-gradient-to-l from-cyan to-electric"
            style={{ width: `${((a ?? 0) / max) * 100}%` }}
          />
        </div>
        <span className="h-3 w-px bg-white/20" />
        <div className="flex flex-1">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-gold to-ember"
            style={{ width: `${((b ?? 0) / max) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function CompareView() {
  const { go, openEquipment, setPlanet } = useAfterlight();
  const openRecord = (id: string) => {
    const record = getEquipment(id);
    if (!record) return;
    setPlanet(record.planet);
    openEquipment(record.id, "overview");
  };
  const { leftId, rightId } = useNavigation((state) => state.comparison);
  const setComparison = useNavigation((state) => state.setComparison);
  const left = getEquipment(leftId) ?? EQUIPMENT[0];
  const right = getEquipment(rightId) ?? EQUIPMENT.find((entry) => entry.id !== left.id)!;
  const setLeftId = (id: string) => setComparison(id, right.id);
  const setRightId = (id: string) => setComparison(left.id, id);

  const rows = useMemo(
    () => [
      { label: "Planet", a: PLANETS[left.planet].name, b: PLANETS[right.planet].name },
      { label: "Type", a: CATEGORY_LABEL[left.category], b: CATEGORY_LABEL[right.category] },
      { label: "Mission", a: left.mission, b: right.mission },
      { label: "Agency", a: left.agency, b: right.agency },
      { label: "Years", a: left.years, b: right.years },
      { label: "Mass", a: left.mass, b: right.mass },
      { label: "Power source", a: left.power, b: right.power },
      { label: "Distance travelled", a: left.distance ?? "Stationary", b: right.distance ?? "Stationary" },
      { label: "Mission duration", a: left.duration, b: right.duration },
      { label: "Landing site", a: left.site, b: right.site },
      {
        label: "Instruments",
        a: `${left.instruments.length} listed`,
        b: `${right.instruments.length} listed`,
      },
      {
        label: "Modelled components",
        a: `${componentsOf(left).length}`,
        b: `${componentsOf(right).length}`,
      },
      {
        label: "Primary objective",
        a: left.objectives[0],
        b: right.objectives[0],
      },
      {
        label: "Signature discovery",
        a: left.discoveries[0].title,
        b: right.discoveries[0].title,
      },
    ],
    [left, right],
  );

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "Compare" }]} />
      <SectionHeader
        className="mt-4"
        eyebrow="Side by side"
        title={
          <>
            Two machines, two <span className="text-gradient-mars">answers</span>
          </>
        }
        description="Compare size, power, range, instruments and science objectives. Numbers are taken from the same records used across the archive."
        action={
          <button
            onClick={() => {
              setComparison(right.id, left.id);
            }}
            className="btn btn-ghost !py-2.5 !text-[0.64rem]"
          >
            <ArrowLeftRight size={13} /> Swap
          </button>
        }
      />

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {[
          { id: leftId, set: setLeftId, eq: left, accent: "cyan" },
          { id: rightId, set: setRightId, eq: right, accent: "gold" },
        ].map((side) => (
          <div
            key={side.accent}
            className={`overflow-hidden rounded-2xl border bg-[linear-gradient(160deg,rgba(6,14,30,0.8),rgba(2,5,12,0.94))] ${
              side.accent === "cyan" ? "border-cyan/30" : "border-gold/30"
            }`}
          >
            <div className="relative h-32">
              <img src={side.eq.image} alt={side.eq.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050a16] via-[#050a16]/20 to-transparent" />
            </div>
            <div className="p-3">
              <label htmlFor={`compare-${side.accent}`} className="data text-xs uppercase tracking-[0.12em] text-slate-300">
                Machine {side.accent === "cyan" ? "A" : "B"}
              </label>
              <select
                id={`compare-${side.accent}`}
                value={side.id}
                onChange={(e) => side.set(e.target.value)}
                className="mt-2 min-h-11 w-full min-w-0 rounded-lg border border-white/20 bg-deep/60 px-2.5 py-2 text-base text-white focus:border-cyan focus:outline-none sm:text-sm"
              >
                {EQUIPMENT.map((e) => (
                  <option key={e.id} value={e.id} disabled={e.id === (side.accent === "cyan" ? right.id : left.id)} className="bg-abyss">
                    {e.name} — {PLANETS[e.planet].name} ({e.years})
                  </option>
                ))}
              </select>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <StatusPill status={side.eq.status} />
                <button
                  onClick={() => openRecord(side.eq.id)}
                  className="text-action inline-flex min-h-11 items-center gap-1 text-xs font-medium text-cyan/90 hover:text-cyan"
                >
                  Open record <ArrowRight size={11} />
                </button>
              </div>
              <p className="mt-2 text-[0.68rem] leading-relaxed text-slate-400">{side.eq.tagline}</p>
              {side.eq.sources[0] && <div className="mt-3 text-xs"><SourceLink href={side.eq.sources[0].url}>{side.eq.sources[0].label}</SourceLink></div>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-deep/25">
          <div className="border-b border-white/8 px-3 py-2">
            <span className="data text-[0.56rem] uppercase tracking-[0.2em] text-cyan/70">
              Full comparison
            </span>
          </div>
          <div className="divide-y divide-white/5">
            {rows.map((r) => (
              <div key={r.label} className="grid grid-cols-2 gap-2 px-3 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)]">
                <span className="min-w-0 text-sm leading-relaxed text-slate-200 [overflow-wrap:anywhere]">{r.a}</span>
                <span className="order-first col-span-2 text-xs font-medium uppercase tracking-[0.06em] text-cyan/80 sm:order-none sm:col-span-1 sm:text-center">
                  {r.label}
                </span>
                <span className="min-w-0 text-right text-sm leading-relaxed text-slate-200 [overflow-wrap:anywhere]">{r.b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-white/10 bg-deep/25 p-4">
            <div className="flex items-center gap-2">
              <Weight size={14} className="text-cyan" />
              <span className="data text-[0.56rem] uppercase tracking-[0.2em] text-slate-400">
                Relative scale
              </span>
            </div>
            <div className="mt-2">
              <Bar label="Mass (kg)" a={num(left.mass)} b={num(right.mass)} />
              <Bar label="Distance (km)" a={num(left.distance)} b={num(right.distance)} />
              <Bar label="Instruments" a={left.instruments.length} b={right.instruments.length} />
              <Bar label="Objectives" a={left.objectives.length} b={right.objectives.length} />
            </div>
            <p className="mt-2 text-[0.58rem] leading-relaxed text-slate-500">
              Bar lengths are normalised within each row; a stationary machine shows a dash for
              distance rather than zero.
            </p>
          </div>

          <div className="rounded-2xl border border-cyan/20 bg-deep/25 p-4">
            <div className="grid grid-cols-1 gap-3">
              {[
                { icon: Zap, label: "Power", a: left.power, b: right.power },
                { icon: Gauge, label: "Duration", a: left.duration, b: right.duration },
                { icon: Layers, label: "3D", a: "Exploded view", b: "Exploded view" },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-2 border-b border-white/6 pb-2 last:border-0">
                  <row.icon size={12} className="mt-0.5 shrink-0 text-cyan/70" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[0.5rem] uppercase tracking-[0.12em] text-slate-500">{row.label}</div>
                    <div className="break-words text-xs leading-relaxed text-slate-300">
                      A: {row.a}
                    </div>
                    <div className="break-words text-xs leading-relaxed text-slate-300">B: {row.b}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
