"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Compass,
  BookOpen,
  Sparkles,
  Globe2,
  ArrowRight,
  RotateCcw,
  Printer,
  Play,
} from "lucide-react";
import { Breadcrumb, SectionHeader, ProgressBar, StatusPill, SourceLink } from "@/components/ui/Atoms";
import { EQUIPMENT, getEquipment } from "@/data/equipment";
import { KNOWLEDGE, knownFactIds } from "@/data/knowledge";
import { PLANETS } from "@/data/planets";
import { resource } from "@/data/resources";
import { RESEARCH_ACTIVITIES, type ResearchAction } from "@/data/research-activities";
import { SITES } from "@/data/sites";
import { useNavigation } from "@/lib/navigation";
import { useAfterlight } from "@/lib/store";

export default function StudentsView() {
  const { go, setPlanet, setSiteId, discovered, storiesDone, factsUnlocked, destinations, resetProgress, openEquipment, gameStars, gamesPlayed } =
    useAfterlight();

  const total = EQUIPMENT.length;
  const discoveredEq = useMemo(
    () => EQUIPMENT.filter((e) => discovered.includes(e.id)),
    [discovered],
  );
  const nextUp = useMemo(() => EQUIPMENT.find((e) => !discovered.includes(e.id)), [discovered]);
  const completedStories = useMemo(
    () => new Set(EQUIPMENT.filter((equipment) => storiesDone.includes(equipment.id)).map((equipment) => equipment.id)),
    [storiesDone],
  );
  const factCount = useMemo(() => knownFactIds(factsUnlocked).length, [factsUnlocked]);
  const lastEquipment = useMemo(
    () => [...discovered].reverse().map((id) => getEquipment(id)).find((equipment) => equipment !== undefined) ?? getEquipment("opportunity"),
    [discovered],
  );
  const discoveredCount = discoveredEq.length;
  const storyCount = completedStories.size;
  const destinationCount = new Set(destinations.filter((destination) => destination === "moon" || destination === "mars")).size;
  const overallExact =
    ((discoveredCount / total) * 0.4 +
      (storyCount / total) * 0.35 +
      (factCount / KNOWLEDGE.length) * 0.25) *
    100;
  const overall = Math.round(overallExact);

  const openRecord = (id: string) => {
    const equipment = getEquipment(id);
    if (!equipment) return;
    setPlanet(equipment.planet);
    openEquipment(equipment.id, "overview");
  };
  const findOnMap = (id: string) => {
    const equipment = getEquipment(id);
    if (!equipment) return;
    const site = SITES.find((entry) => entry.planet === equipment.planet && entry.equipmentId === equipment.id);
    useNavigation.getState().targetMapEquipment(equipment.id);
    setPlanet(equipment.planet);
    setSiteId(site?.id ?? null);
    go("map");
  };
  const runResearchAction = (action: ResearchAction) => {
    if (action.kind === "equipment") return openRecord(action.id);
    if (action.kind === "map") return findOnMap(action.id);
    if (action.kind === "compare") {
      const left = getEquipment(action.ids[0]);
      const right = getEquipment(action.ids[1]);
      if (!left || !right) return;
      useNavigation.getState().setComparison(left.id, right.id);
      setPlanet(left.planet);
      go("compare");
      return;
    }
    go(action.view);
  };

  const badges = [
    { id: "start", label: "First contact", detail: "Open your first machine", done: discoveredCount >= 1, icon: Compass },
    { id: "both", label: "Two worlds", detail: "Visit the Moon and Mars", done: destinationCount >= 2, icon: Globe2 },
    { id: "five", label: "Field researcher", detail: "Profile 5 machines", done: discoveredCount >= 5, icon: Sparkles },
    { id: "story", label: "Storyteller", detail: "Finish a full story", done: storyCount >= 1, icon: Play },
    { id: "all-stories", label: "Chronicler", detail: "Finish 3 stories", done: storyCount >= 3, icon: BookOpen },
    { id: "facts", label: "Curious mind", detail: "Unlock 5 knowledge cards", done: factCount >= 5, icon: Award },
  ];

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "For students" }]} />
      <SectionHeader
        className="mt-4"
        eyebrow="Research missions & expedition log"
        title={
          <>
            Progress saved on <span className="text-gradient-ice">this device</span>
          </>
        }
        description="Ask a question, investigate a machine and follow the original NASA source. Your expedition progress stays in this browser, so you can return where you left off."
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} className="btn btn-ghost !py-2.5 !text-[0.62rem]">
              <Printer size={13} /> Print log
            </button>
            <button
              onClick={() => {
                if (window.confirm("Reset your expedition log on this device?")) resetProgress();
              }}
              className="btn btn-ghost !py-2.5 !text-[0.62rem]"
            >
              <RotateCcw size={13} /> Reset
            </button>
          </div>
        }
      />

      <section aria-labelledby="student-research-title" className="mt-6 rounded-2xl border border-cyan/20 bg-deep/30 p-4 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <span className="eyebrow">Make the archive your evidence</span>
            <h2 id="student-research-title" className="display mt-2 text-2xl text-white md:text-3xl">Choose an investigation</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Work alone or in a small group. Start with the question, inspect the hardware, then check
              the cited source. Record a source title, the detail it supports and anything still uncertain.
              Ages are suggestions; younger learners can work with a teacher or family member.
            </p>
          </div>
          <button type="button" onClick={() => go("about")} className="btn btn-ice !text-xs">NASA research library <ArrowRight size={14} /></button>
        </div>
        <div className="mt-4 rounded-xl border border-gold/20 bg-gold/5 p-3 text-sm leading-relaxed text-slate-300">
          <strong className="font-semibold text-gold">Your research notes are yours.</strong> These activities do not
          add completion badges or save written answers. Open an activity and print this page, or use a notebook. Opening machines,
          reading full stories and unlocking knowledge cards continue to count toward the expedition log below.
        </div>

        <div className="mt-4 grid items-start gap-3 xl:grid-cols-2">
          {RESEARCH_ACTIVITIES.map((activity, index) => (
            <details key={activity.id} className="group min-w-0 rounded-xl border border-white/12 bg-ink/40 open:border-cyan/30">
              <summary className="min-h-11 cursor-pointer rounded-xl p-4 marker:text-cyan">
                <span className="data text-xs uppercase tracking-[0.08em] text-cyan/80">{String(index + 1).padStart(2, "0")} · {activity.topic}</span>
                <span className="mt-2 block text-lg font-semibold leading-snug text-white">{activity.title}</span>
                <span className="mt-1 block text-sm leading-relaxed text-slate-300">{activity.question}</span>
                <span className="mt-2 block text-xs text-slate-400">{activity.age} · <span className="group-open:hidden">Open activity</span><span className="hidden group-open:inline">Close activity</span></span>
              </summary>
              <div className="border-t border-white/8 px-4 pb-4 pt-3">
                <h3 className="text-sm font-semibold text-white">Investigate</h3>
                <ol className="mt-2 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-slate-300">
                  {activity.steps.map((step) => <li key={step} className="pl-1">{step}</li>)}
                </ol>
                <div className="mt-4 rounded-lg border border-cyan/15 bg-cyan/5 p-3">
                  <h3 className="text-sm font-semibold text-cyan">Make something from your evidence</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-300">{activity.outcome}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {activity.actions.map((action) => (
                    <button key={action.label} type="button" onClick={() => runResearchAction(action)} className="btn btn-ghost !px-3 !py-2.5 !text-xs">
                      {action.label} <ArrowRight size={12} />
                    </button>
                  ))}
                </div>
                <h3 className="mt-4 text-sm font-semibold text-white">Read the evidence</h3>
                <p className="mt-1 text-xs text-slate-400">Source links open in a new tab.</p>
                <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                  {activity.sourceIds.map((id) => {
                    const source = resource(id);
                    return (
                      <li key={id}>
                        <SourceLink href={source.url}>{source.label}</SourceLink>
                        {source.note && <p className="mt-1 text-xs leading-relaxed text-slate-400">{source.note}</p>}
                      </li>
                    );
                  })}
                  {activity.extraSources?.map((source) => <li key={source.url}><SourceLink href={source.url}>{source.label}</SourceLink></li>)}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-cyan/25 bg-[linear-gradient(160deg,rgba(11,30,58,0.85),rgba(2,5,12,0.95))] p-4 md:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="data text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
                Expedition completion
              </span>
              <div className="display mt-1 text-4xl text-white">
                {overallExact > 0 && overall < 1 ? "<1" : overall}%
              </div>
              <p className="text-[0.52rem] uppercase tracking-[0.14em] text-slate-600">
                weighted: machines 40 · stories 35 · facts 25
              </p>
            </div>
            <div className="text-right text-[0.58rem] uppercase tracking-[0.14em] text-slate-500">
              <div>{discoveredCount} / {total} machines</div>
              <div>{storyCount} stories · {factCount} facts</div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <ProgressBar
              value={(discoveredCount / total) * 100}
              label={`Machines profiled · ${discoveredCount}/${total}`}
            />
            <ProgressBar
              value={(storyCount / total) * 100}
              label={`Stories completed · ${storyCount}/${total}`}
            />
            <ProgressBar
              value={(factCount / KNOWLEDGE.length) * 100}
              label={`Knowledge cards · ${factCount}/${KNOWLEDGE.length}`}
            />
          </div>

          {nextUp && (
            <div className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-3">
              <span className="data text-[0.5rem] uppercase tracking-[0.16em] text-gold/80">
                Suggested next
              </span>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex-1 basis-40 break-words">
                  <div className="text-[0.84rem] font-semibold text-white">{nextUp.name}</div>
                  <div className="text-[0.6rem] text-slate-400">
                    {PLANETS[nextUp.planet].name} · {nextUp.mission}
                  </div>
                </div>
                <button
                  onClick={() => openRecord(nextUp.id)}
                  className="btn btn-gold !py-2 !text-[0.6rem]"
                >
                  Open <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-deep/25 p-4">
          <span className="data text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">Badges</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={b.id}
                  whileHover={{ y: -2 }}
                  className={`rounded-xl border p-2.5 ${
                    b.done
                      ? "border-gold/45 bg-[linear-gradient(150deg,rgba(50,34,8,0.6),rgba(6,10,20,0.8))]"
                      : "border-white/8 bg-ink/30 opacity-60"
                  }`}
                >
                  <Icon size={14} className={b.done ? "text-gold" : "text-slate-500"} />
                  <div className="mt-1.5 text-[0.7rem] font-medium text-white">{b.label}</div>
                  <div className="text-[0.54rem] leading-snug text-slate-500">{b.detail}</div>
                  <div className="mt-1 text-[0.46rem] uppercase tracking-[0.14em] text-slate-600">
                    {b.done ? "unlocked" : "locked"}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-deep/25 p-4">
        <div className="flex items-center justify-between">
          <span className="data text-[0.55rem] uppercase tracking-[0.2em] text-cyan/70">
            Machines you have opened
          </span>
          <button onClick={() => go("explore")} className="text-[0.56rem] uppercase tracking-[0.14em] text-cyan/70 hover:text-cyan">
            Archive →
          </button>
        </div>
        {discoveredEq.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-white/12 p-6 text-center">
            <p className="text-[0.76rem] text-slate-400">
              Nothing logged yet. Open a machine to start your expedition.
            </p>
            <button onClick={() => go("explore")} className="btn btn-gold mt-3 !py-2 !text-[0.62rem]">
              Explore the fleet
            </button>
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {discoveredEq.map((e) => (
              <button
                key={e.id}
                onClick={() => openRecord(e.id)}
                className="flex min-w-0 items-center gap-2.5 rounded-xl border border-white/8 bg-ink/30 p-2 text-left transition hover:border-cyan/40"
              >
                <img src={e.image} alt={e.name} className="h-12 w-16 shrink-0 rounded-md object-cover" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.74rem] text-white">{e.name}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-1.5">
                    <StatusPill status={e.status} />
                    {completedStories.has(e.id) && (
                      <span className="text-[0.48rem] uppercase tracking-[0.1em] text-emerald-300">story read</span>
                    )}
                  </span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {[
          {
            title: "For a classroom",
            body: "Pick one machine per group, read its story chapters aloud, then present the discovery that mattered most. The comparison page works well as a debate prompt.",
          },
          {
            title: "For self-study",
            body: "Start with one investigation and keep a source notebook. Read a machine's story, follow its mission evidence and compare what you learn with another record. Operating status is a dated mission summary; follow the publisher for the latest reporting.",
          },
          {
            title: "How to read the data",
            body: "Check the badge on every figure: published, estimate, or counted from mission records. If a number does not exist, AFTERLIGHT shows a dash instead of guessing.",
          },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border border-white/10 bg-deep/20 p-4">
            <h4 className="text-[0.84rem] font-semibold text-white">{c.title}</h4>
            <p className="mt-1 text-[0.7rem] leading-relaxed text-slate-400">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[0.65rem] border-2 border-gold/50 bg-[linear-gradient(150deg,rgba(50,30,6,0.5),rgba(2,5,12,0.95))] p-4">
        <div>
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-gold/80">Game stars {gameStars} · finished {gamesPlayed}</p>
          <p className="mt-0.5 text-[0.78rem] font-semibold text-white">Take a break and play Luffy&rsquo;s games.</p>
          <p className="mt-0.5 text-[0.68rem] leading-relaxed text-slate-400">Machine Snap, Rocket Quiz and Soft Landing — all made from the real missions.</p>
        </div>
        <button onClick={() => go("games")} className="btn btn-gold">
          Play games <ArrowRight size={14} />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[0.65rem] border-2 border-cyan/25 bg-deep/30 p-4">
        <p className="text-[0.72rem] leading-relaxed text-slate-400">
          {discoveredCount > 0 ? `Return to ${lastEquipment?.name} on the surface map.` : "Start with a mission's landing site, then follow its hardware and discoveries."}
        </p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { if (lastEquipment) findOnMap(lastEquipment.id); else go("map"); }} className="btn btn-ghost !py-2.5 !text-[0.64rem]">
            Surface map
          </button>
          <button onClick={() => go("learn")} className="btn btn-gold !py-2.5 !text-[0.64rem]">
            Knowledge cards
          </button>
        </div>
      </div>
    </div>
  );
}
