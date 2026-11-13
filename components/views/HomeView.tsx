"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Gamepad2,
  Globe2,
  Rocket,
  Satellite,
  Sparkles,
  Telescope,
  Plane,
  Cog,
  Mountain,
} from "lucide-react";
import HeroScene from "@/components/three/HeroScene";
import EquipmentCard from "@/components/sections/EquipmentCard";
import { AnimatedNumber, FadeIn, SectionHeader } from "@/components/ui/Atoms";
import { PLANETS, DEEP_SPACE } from "@/data/planets";
import { EQUIPMENT, equipmentByPlanet, assetOf, CATEGORY_LABEL, getEquipment } from "@/data/equipment";
import { TIMELINE } from "@/data/timeline";
import { KNOWLEDGE } from "@/data/knowledge";
import { homepageStatCards } from "@/data/home-stats";
import { useAfterlight, type DetailTab } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";
import type { EquipmentCategory, Planet } from "@/data/types";

const CATEGORY_ICONS = {
  rover: Mountain,
  lander: Satellite,
  mobility: Cog,
  aircraft: Plane,
  instrument: Telescope,
} as const;

export default function HomeView() {
  const { planet, setPlanet, go, setStage, openEquipment } = useAfterlight();
  const chooseWorld = (world: Planet) => {
    useNavigation.getState().chooseArchiveDestination(world);
    setPlanet(world);
  };
  const openRecord = (id: string, tab: DetailTab = "overview") => {
    const record = getEquipment(id);
    if (!record) return;
    setPlanet(record.planet);
    openEquipment(record.id, tab);
  };
  const meta = PLANETS[planet];
  const fleet = useMemo(() => equipmentByPlanet(planet), [planet]);
  const featured = fleet[0] ?? EQUIPMENT[0];
  const stats = useMemo(() => homepageStatCards(planet), [planet]);
  const events = useMemo(
    () => TIMELINE.filter((t) => t.planet === planet).slice(-4).reverse(),
    [planet],
  );
  const facts = useMemo(() => KNOWLEDGE.slice(planet === "mars" ? 0 : 3, planet === "mars" ? 3 : 6), [planet]);

  return (
    <div className="w-full pb-8">
      {/* ---------------- hero ---------------- */}
      <section className="relative mx-3 mt-3 overflow-hidden rounded-2xl border border-cyan/20 md:mx-5">
        <div className="relative min-h-[min(38rem,78svh)] md:min-h-[36rem]">
          <HeroScene planet={planet} asset={assetOf(featured)} fallbackImage={{ src: featured.image, alt: featured.imageCaption }} className="absolute inset-0" />
          {/* desktop: scrim from the left so the headline column stays legible */}
          <div className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(96deg,rgba(3,7,16,0.96)_0%,rgba(3,7,16,0.82)_26%,rgba(3,7,16,0.42)_48%,rgba(3,7,16,0.06)_62%,rgba(3,7,16,0.35)_100%)] md:block" />
          {/* portrait: scrim from the top — the machine lives in the bottom third */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(3,7,16,0.9)_0%,rgba(3,7,16,0.84)_34%,rgba(3,7,16,0.55)_52%,rgba(3,7,16,0.1)_70%,rgba(3,7,16,0.42)_100%)] md:hidden" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-ink via-ink/45 to-transparent" />

          <div className="relative flex min-h-[min(38rem,78svh)] flex-col justify-between px-4 pb-28 pt-6 sm:px-6 sm:pb-36 md:min-h-[36rem] md:px-9 md:pb-24 md:pt-8">
            <div className="flex min-w-0 max-w-[50rem] flex-col md:pr-24 lg:pr-0">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
                <span className="eyebrow text-[0.56rem] tracking-[0.16em] sm:text-[0.68rem] sm:tracking-[0.34em]">Real machines · real discoveries</span>
              </motion.div>

              <motion.h1
                key={planet}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="display mt-3 max-w-[52rem] leading-[0.9] text-white"
                style={{ fontSize: "clamp(1.85rem, 4.1vw, 4.1rem)", textWrap: "balance" }}
              >
                THE MISSIONS <span className="text-gradient-mars">ENDED.</span>
                <br />
                THE STORIES <span className="text-gradient-ice">DIDN&rsquo;T.</span>
              </motion.h1>

              <p className="mt-4 max-w-md text-[0.9rem] leading-relaxed text-slate-100 [text-shadow:0_1px_14px_rgba(3,7,16,0.95),0_0_2px_rgba(3,7,16,0.9)] sm:text-base">
                {meta.intro}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-2.5">
                <button onClick={() => go("explore")} className="btn btn-gold">
                  Equipment archive <ArrowRight size={15} />
                </button>
                <button
                  onClick={() => go("map")}
                  className="hidden items-center gap-2 text-[0.66rem] uppercase tracking-[0.16em] text-cyan/80 transition hover:text-cyan sm:flex"
                >
                  <Globe2 size={13} /> Surface map
                </button>
              </div>

              <div className="mt-7 hidden flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-4 sm:flex">
                {[
                  { label: stats[0].label, value: stats[0].value == null ? "—" : `${stats[0].value.toLocaleString("en-US")}${stats[0].suffix}`, sub: stats[0].sub, sourceUrl: stats[0].sourceUrl },
                  { label: stats[1].label, value: stats[1].value == null ? "—" : `${stats[1].value.toLocaleString("en-US")}${stats[1].suffix}`, sub: stats[1].sub, sourceUrl: stats[1].sourceUrl },
                  { label: "In-depth profiles", value: `${fleet.length} machines`, sub: "Current equipment archive", sourceUrl: undefined },
                ].map((s) => (
                  <div key={s.label} className="[text-shadow:0_1px_10px_rgba(3,7,16,0.95)]">
                    <div className="text-[0.5rem] uppercase tracking-[0.2em] text-slate-300">{s.label}</div>
                    <div className="data text-[0.78rem] text-white">{s.value}</div>
                    <div className="mt-1 max-w-[28ch] text-xs leading-relaxed text-slate-300">{s.sub}</div>
                    {s.sourceUrl && <a href={s.sourceUrl} target="_blank" rel="noreferrer noopener" className="text-action inline-flex min-h-11 items-center gap-1 text-xs text-cyan hover:underline">Source <ArrowUpRight size={11} /></a>}
                  </div>
                ))}
              </div>
            </div>

            {/* destination rail */}
            <div className="absolute right-5 top-6 hidden flex-col items-end gap-3 md:right-9 md:top-10 md:flex">
              <span className="data text-[0.52rem] uppercase tracking-[0.24em] text-slate-500">
                Destination
              </span>
              {[
                { id: "moon" as Planet, label: "Moon", n: "01" },
                { id: "mars" as Planet, label: "Mars", n: "02" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => chooseWorld(d.id)}
                  className="group flex items-center gap-2.5"
                >
                  <span className="flex flex-col items-end">
                    <span className="data text-[0.55rem] text-slate-500">{d.n}</span>
                    <span
                      className={`text-[0.8rem] font-medium transition ${
                        planet === d.id ? "text-white" : "text-slate-400 group-hover:text-white"
                      }`}
                    >
                      {d.label}
                    </span>
                  </span>
                  <span
                    className={`h-2 w-2 rounded-full transition ${
                      planet === d.id
                        ? "bg-gold shadow-[0_0_12px_3px_rgba(255,201,60,0.65)]"
                        : "bg-white/25 group-hover:bg-cyan/70"
                    }`}
                  />
                </button>
              ))}
              <button
                onClick={() => {
                  setStage("explore");
                  go("deepspace");
                }}
                className="group flex items-center gap-2.5"
              >
                <span className="flex flex-col items-end">
                  <span className="data text-[0.55rem] text-slate-500">03</span>
                  <span className="text-[0.8rem] font-medium text-slate-400 transition group-hover:text-white">
                    Deep space
                  </span>
                </span>
                <span className="h-2 w-2 rounded-full bg-white/25 transition group-hover:bg-cyan/70" />
              </button>
            </div>

            {/* mobile visitors switch worlds from the header toggle and the
                destination cards below — no duplicate tab row inside the hero */}
          </div>
        </div>
      </section>

      {/* ---------------- destinations ---------------- */}
      <section className="mx-3 mt-3 md:mx-5">
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(10,23,46,0.88),rgba(2,5,12,0.92))] p-3 backdrop-blur-xl md:p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="data text-[0.58rem] uppercase tracking-[0.24em] text-cyan/80">
              Choose a destination
            </span>
            <span className="hidden text-[0.58rem] uppercase tracking-[0.16em] text-slate-500 sm:block">
              Tap a world to switch the expedition
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            {(["moon", "mars"] as const).map((p) => {
              const pm = PLANETS[p];
              const active = planet === p;
              return (
                <button
                  key={p}
                  onClick={() => chooseWorld(p)}
                  className={`group flex min-w-0 items-center gap-3 rounded-xl border p-3 text-left transition ${
                    active
                      ? p === "mars"
                        ? "border-gold/70 bg-[linear-gradient(120deg,rgba(80,34,10,0.55),rgba(6,10,20,0.7))]"
                        : "border-cyan/60 bg-[linear-gradient(120deg,rgba(8,28,56,0.6),rgba(6,10,20,0.7))]"
                      : "border-white/10 hover:border-cyan/40 hover:bg-white/5"
                  }`}
                >
                  <span className="relative grid h-14 w-14 shrink-0 place-items-center">
                    <img
                      src={pm.globe}
                      alt={`${pm.name} globe`}
                      width={56}
                      height={56}
                      className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.45)]"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display block text-base text-white">{pm.name}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-slate-300">{pm.subtitle}</span>
                    <span className="data mt-1 block break-words text-[0.65rem] leading-relaxed text-cyan/80">
                      {pm.countLine}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={15}
                    className={`shrink-0 transition ${active ? "text-gold" : "text-slate-500 group-hover:text-cyan"}`}
                  />
                </button>
              );
            })}
            <button
              onClick={() => {
                setStage("explore");
                go("deepspace");
              }}
              className="group flex min-w-0 items-center gap-3 rounded-xl border border-white/10 p-3 text-left transition hover:border-cyan/40 hover:bg-white/5"
            >
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-white/15 bg-deep/50">
                <Rocket size={20} className="text-cyan/80" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="display block text-base text-white">{DEEP_SPACE.name}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-300">{DEEP_SPACE.subtitle}</span>
                <span className="data mt-1 block break-words text-[0.65rem] leading-relaxed text-cyan/80">
                  {DEEP_SPACE.probes.length} spacecraft stories · asteroid explorers to interstellar missions
                </span>
              </span>
              <ArrowUpRight size={15} className="shrink-0 text-slate-500 group-hover:text-cyan" />
            </button>
          </div>
        </div>
      </section>

      {/* ---------------- choose what to explore ---------------- */}
      <section className="mx-3 mt-10 md:mx-5">
        <SectionHeader
          eyebrow={`Choose what to explore · ${meta.name}`}
          title={
            <>
              Documented machines,{" "}
              <span className="text-gradient-mars">each with a story</span>
            </>
          }
          description="Filter by type, then open a machine to inspect its 3D reconstruction, follow its six-stage story and trace what it discovered."
          action={
            <button onClick={() => go("explore")} className="btn btn-ghost !py-2.5 !text-[0.66rem]">
              View all {EQUIPMENT.length} machines <ArrowRight size={14} />
            </button>
          }
        />

        <div className="mt-5 flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {Object.entries(CATEGORY_LABEL).map(([key, label]) => {
            const Icon = CATEGORY_ICONS[key as keyof typeof CATEGORY_ICONS];
            const count = fleet.filter((e) => e.category === key).length;
            if (!count) return null;
            return (
              <button
                key={key}
                onClick={() => {
                  useNavigation.getState().archiveCategory(planet, key as EquipmentCategory);
                  go("explore");
                }}
                className="group flex shrink-0 items-center gap-2 rounded-[0.55rem] border-2 border-white/15 bg-deep/40 px-3 py-2 transition hover:border-cyan/60 hover:bg-deep/60"
              >
                <Icon size={14} className="text-cyan/70" />
                <span className="text-[0.7rem] font-semibold text-slate-200">{label}</span>
                <span className="data rounded-[0.35rem] border border-white/15 bg-ink/50 px-1.5 py-0.5 text-[0.55rem] text-slate-400">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="archive-grid mt-4 gap-3">
          {fleet.slice(0, 4).map((e, i) => (
            <FadeIn key={e.id} delay={i * 0.05}>
              <EquipmentCard equipment={e} onOpen={() => openRecord(e.id)} />
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---------------- games ---------------- */}
      <section className="mx-3 mt-6 md:mx-5">
        <div className="flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-[0.7rem] border-2 border-gold/50 bg-[linear-gradient(150deg,rgba(50,30,6,0.55),rgba(2,5,12,0.95))] p-4 md:p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[0.55rem] border-2 border-gold/70 bg-gold/20 text-gold">
              <Gamepad2 size={22} />
            </span>
            <div>
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold/80">Luffy&rsquo;s game hideout</p>
              <p className="mt-0.5 text-[0.88rem] font-bold leading-snug text-white">Snap the machines, ace the quiz, land the lander.</p>
              <p className="mt-0.5 text-[0.68rem] leading-snug text-slate-400">Five short games with real space facts. Win stars for your log.</p>
            </div>
          </div>
          <button onClick={() => go("games")} className="btn btn-gold">
            Play games <ArrowRight size={15} />
          </button>
        </div>
      </section>

      {/* ---------------- stats teaser ---------------- */}
      <section className="mx-3 mt-12 md:mx-5">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(140deg,rgba(12,28,58,0.85),rgba(2,5,12,0.95))] p-5 md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div>
              <Satellite size={18} className="text-cyan" />
              <h3 className="display mt-2 text-2xl text-white sm:text-3xl">
                How much did humanity leave behind?
              </h3>
              <p className="mt-2 max-w-lg text-[0.8rem] leading-relaxed text-slate-400">
                An item count is not a machine count. AFTERLIGHT separates published catalogues
                from independent estimates — and says so when a number does not exist.
              </p>
              <button onClick={() => go("stats")} className="btn btn-gold mt-4 !py-2.5 !text-[0.66rem]">
                See the numbers & definitions <ArrowRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {stats.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-white/8 bg-ink/40 p-3"
                >
                  <div className="display text-2xl text-white sm:text-[1.7rem]">
                    {s.value == null ? "—" : <AnimatedNumber value={s.value} decimals={Number.isInteger(s.value) ? 0 : 1} suffix={s.suffix} />}
                  </div>
                  <div className="mt-0.5 text-[0.62rem] leading-tight text-slate-300">{s.label}</div>
                  <div className="mt-1 text-xs leading-relaxed text-cyan/70">{s.sub}</div>
                  {s.sourceUrl && <a href={s.sourceUrl} target="_blank" rel="noreferrer noopener" className="text-action mt-1 inline-flex min-h-11 items-center gap-1 text-xs text-cyan hover:underline">Source <ArrowUpRight size={11} /></a>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- timeline + knowledge ---------------- */}
      <section className="mx-3 mt-12 grid gap-4 md:mx-5 lg:grid-cols-[1.15fr_1fr]">
        <div className="rounded-2xl border border-white/10 bg-deep/25 p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={15} className="text-gold" />
              <span className="data text-[0.56rem] uppercase tracking-[0.22em] text-slate-400">
                {meta.name} · recent milestones
              </span>
            </div>
            <button
              onClick={() => go("missions")}
              className="text-[0.56rem] uppercase tracking-[0.14em] text-cyan/70 hover:text-cyan"
            >
              Full timeline
            </button>
          </div>
          <div className="mt-3 space-y-0">
            {events.map((e, i) => (
              <div key={e.id} className="rail pb-4 last:pb-0">
                <span className="rail-dot" />
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="data text-[0.62rem] text-gold/90">{e.date}</span>
                  <span className="text-[0.55rem] uppercase tracking-[0.14em] text-slate-500">{e.agency}</span>
                </div>
                <button
                  onClick={() => {
                    if (e.equipmentId) openRecord(e.equipmentId);
                    else {
                      useNavigation.getState().targetMission(e.id);
                      go("missions");
                    }
                  }}
                  className="mt-0.5 block text-left text-[0.86rem] font-medium text-white transition hover:text-cyan"
                >
                  {e.title}
                </button>
                <p className="mt-1 line-clamp-2 text-[0.68rem] leading-relaxed text-slate-400">{e.summary}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-cyan/20 bg-[linear-gradient(150deg,rgba(12,32,60,0.7),rgba(2,5,12,0.9))] p-4 md:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={15} className="text-cyan" />
              <span className="data text-[0.56rem] uppercase tracking-[0.22em] text-slate-400">
                Luffy&rsquo;s knowledge cards
              </span>
            </div>
            <button
              onClick={() => go("learn")}
              className="text-[0.56rem] uppercase tracking-[0.14em] text-cyan/70 hover:text-cyan"
            >
              All cards
            </button>
          </div>
          <div className="mt-3 space-y-2">
            {facts.map((k) => (
              <button
                key={k.id}
                onClick={() => {
                  useNavigation.getState().targetFact(k.id);
                  go("learn");
                }}
                className="group flex w-full items-start gap-3 rounded-xl border border-white/8 bg-ink/30 p-2.5 text-left transition hover:border-cyan/40"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan/10 text-cyan">
                  <Sparkles size={12} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.76rem] font-medium leading-snug text-white">
                    {k.question}
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-[0.64rem] leading-snug text-slate-400">
                    {k.answer}
                  </span>
                </span>
                <ArrowRight size={13} className="mt-1 shrink-0 text-slate-600 group-hover:text-cyan" />
              </button>
            ))}
          </div>
          <button
            onClick={() => openRecord(featured.id, "model")}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gold/30 bg-gold/8 py-2 text-[0.6rem] uppercase tracking-[0.16em] text-gold transition hover:bg-gold/15"
          >
            <Rocket size={12} /> Try the exploded-view models
          </button>
        </div>
      </section>
    </div>
  );
}
