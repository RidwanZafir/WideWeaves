"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Info, Database, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import {
  AnimatedNumber,
  Breadcrumb,
  SectionHeader,
  SourceLink,
} from "@/components/ui/Atoms";
import { HEADLINES, MARS_STATS, MOON_STATS, STAT_NOTES } from "@/data/stats";
import { PLANETS } from "@/data/planets";
import { useAfterlight } from "@/lib/store";

const KIND_LABEL = {
  published: "Published figure",
  estimate: "Labelled estimate",
  counted: "Counted by AFTERLIGHT",
} as const;

const KIND_STYLE = {
  published: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  estimate: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  counted: "border-cyan/40 bg-cyan/10 text-cyan",
} as const;

export default function StatsView() {
  const { go, planet, setPlanet } = useAfterlight();
  const [tab, setTab] = useState<"moon" | "mars">(planet);
  const rows = tab === "moon" ? MOON_STATS : MARS_STATS;
  const max = Math.max(...rows.map((r) => r.count ?? 0), 1);

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => go("home") },
          { label: "The numbers" },
        ]}
      />
      <SectionHeader
        className="mt-4"
        eyebrow="The scale of our presence"
        title={
          <>
            How many objects did humanity <span className="text-gradient-mars">leave behind?</span>
          </>
        }
        description="Two very different numbers are often compared as if they were the same thing. One is a catalogue of individual items; the other is an independent estimate of objects including debris. AFTERLIGHT keeps them separate — and shows where no count exists."
      />

      {/* headline counters */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {HEADLINES.map((h, i) => (
          <motion.div
            key={h.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="hud-corners relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(12,28,58,0.85),rgba(2,5,12,0.94))] p-4"
          >
            <div className="flex items-center justify-between">
              <span className="eyebrow text-[0.52rem]">
                {h.planet === "moon" ? "The Moon" : h.planet === "mars" ? "Mars" : "Both worlds"}
              </span>
              <span className={`rounded-md border px-1.5 py-0.5 text-[0.48rem] uppercase tracking-[0.08em] ${KIND_STYLE[h.kind]}`}>
                {h.kind === "estimate" ? "estimate" : "published"}
              </span>
            </div>
            <div className="display mt-2 text-4xl leading-none text-white sm:text-[2.6rem]">
              {h.prefix}
              <AnimatedNumber value={h.value} suffix={h.suffix ?? ""} decimals={Number.isInteger(h.value) ? 0 : 1} />
            </div>
            <p className="mt-1 text-[0.7rem] leading-snug text-slate-300">{h.label}</p>
            <details className="group mt-2">
              <summary className="cursor-pointer list-none text-[0.55rem] uppercase tracking-[0.14em] text-cyan/60 transition hover:text-cyan">
                Definition +
              </summary>
              <p className="mt-1.5 text-[0.6rem] leading-relaxed text-slate-500">{h.definition}</p>
              <div className="mt-1.5 text-[0.55rem] text-slate-500">
                <SourceLink href={h.sourceUrl}>{h.source}</SourceLink>
              </div>
            </details>
          </motion.div>
        ))}
      </div>

      {/* category breakdown */}
      <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(170deg,rgba(10,23,47,0.9),rgba(2,5,12,0.95))]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3">
          <div className="flex items-center gap-2">
            <Database size={15} className="text-cyan" />
            <span className="data text-[0.58rem] uppercase tracking-[0.2em] text-slate-300">
              Category breakdown
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-[0.55rem] border-2 border-white/15 bg-abyss/70 p-1">
            {(["moon", "mars"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setTab(p);
                  setPlanet(p);
                }}
                className={`rounded-[0.45rem] border-2 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] transition ${
                  tab === p
                    ? p === "mars"
                      ? "border-gold/70 bg-gradient-to-b from-sand to-gold text-[#21160a]"
                      : "border-cyan/70 bg-gradient-to-b from-[#dceeff] to-[#9ec4ea] text-[#08203a]"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {PLANETS[p].name}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {rows.map((r) => (
            <div key={r.id} className="grid gap-2 px-4 py-3.5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] md:gap-6">
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="display text-2xl text-white">
                    {r.count == null ? "—" : (
                      <AnimatedNumber value={r.count} suffix={r.suffix ?? ""} decimals={r.id === "mars-mass" ? 1 : 0} />
                    )}
                  </span>
                  <span className="text-[0.72rem] leading-tight text-slate-300">{r.label}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded border px-1.5 py-0.5 text-[0.46rem] uppercase tracking-[0.08em] ${KIND_STYLE[r.kind]}`}>
                    {KIND_LABEL[r.kind]}
                  </span>
                  <span className="text-[0.5rem] uppercase tracking-[0.1em] text-slate-600">
                    verified {r.asOf}
                  </span>
                </div>
                {r.count != null && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/6">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(3, ((r.count ?? 0) / max) * 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                      className={`h-full rounded-full ${
                        r.kind === "estimate"
                          ? "bg-gradient-to-r from-ember/70 to-gold"
                          : "bg-gradient-to-r from-electric to-cyan"
                      }`}
                    />
                  </div>
                )}
              </div>
              <div>
                <p className="text-[0.7rem] leading-relaxed text-slate-400">{r.definition}</p>
                <div className="mt-1 text-[0.58rem]">
                  <SourceLink href={r.sourceUrl}>{r.source}</SourceLink>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/8 bg-ink/40 px-4 py-3">
          <div className="flex items-start gap-2">
            <Info size={13} className="mt-0.5 shrink-0 text-cyan" />
            <div className="space-y-1.5">
              {STAT_NOTES.map((n) => (
                <p key={n} className="text-[0.64rem] leading-relaxed text-slate-500">
                  {n}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* reading the numbers */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-deep/25 p-4">
        <h3 className="text-sm font-semibold text-white">Check what a dataset counts</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">NASA Open Data and NSSDCA help locate datasets and spacecraft records. A dataset's publication date, definition and coverage decide which claim it supports; a new resource link does not update the historical counts above.</p>
        <div className="mt-3 flex flex-wrap gap-4 text-xs"><SourceLink href="https://data.nasa.gov/">Explore NASA dataset metadata</SourceLink><SourceLink href="https://nssdc.gsfc.nasa.gov/">Research spacecraft records</SourceLink></div>
      </div>
      <div className="adaptive-card-grid mt-8 gap-3">
        {[
          {
            icon: CheckCircle2,
            title: "What is verified",
            body: "Mission dates, landing sites, instrument lists, distances driven and source-backed totals, including 796 entries in NASA's 2012 lunar catalogue and 382 kg of Apollo samples. Each figure above gives its definition and source date.",
            tone: "text-emerald-300",
          },
          {
            icon: AlertTriangle,
            title: "What is estimated",
            body: "The Mars object total (190+) and surface mass (16.8 t) come from an independent, self-described non-exhaustive inventory. The 796 figure is widely cited from NASA's catalogue, which is an item-level list rather than a summary.",
            tone: "text-amber-300",
          },
          {
            icon: TrendingUp,
            title: "What is counted here",
            body: "Rows marked 'counted by AFTERLIGHT' use the stated hardware definition and historical cutoff. Follow their sources to check which vehicles or landings are included; these are snapshots, not live mission totals.",
            tone: "text-cyan",
          },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.title} className="rounded-2xl border border-white/10 bg-deep/25 p-4">
              <Icon size={16} className={c.tone} />
              <h4 className="mt-2 text-[0.86rem] font-semibold text-white">{c.title}</h4>
              <p className="mt-1 text-[0.7rem] leading-relaxed text-slate-400">{c.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan/20 bg-deep/25 p-4">
        <p className="max-w-xl text-[0.76rem] leading-relaxed text-slate-400">
          The numbers are only half the story. Every one of those objects has a mission, a final
          day and a scientific legacy.
        </p>
        <div className="flex gap-2">
          <button onClick={() => go("missions")} className="btn btn-ghost !py-2.5 !text-[0.64rem]">
            Mission timeline
          </button>
          <button onClick={() => go("explore")} className="btn btn-gold !py-2.5 !text-[0.64rem]">
            Browse the machines <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
