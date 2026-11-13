"use client";

import { useMemo, useState } from "react";
import { Database, Link2, Search } from "lucide-react";
import { SourceLink } from "@/components/ui/Atoms";
import { NASA_RESOURCES, type NASAResource } from "@/data/resources";

const ABOUT_RESOURCES = NASA_RESOURCES.filter((entry) => !["jpl", "earthdata", "nssdca"].includes(entry.id));

const FILTERS = [
  { id: "all", label: "All resources" },
  { id: "moon", label: "Moon" },
  { id: "mars", label: "Mars" },
  { id: "deep", label: "Beyond Moon & Mars" },
  { id: "platform", label: "Data & archives" },
] as const;
type Filter = (typeof FILTERS)[number]["id"];

const GROUPS: { title: string; description: string; matches: (entry: NASAResource) => boolean }[] = [
  {
    title: "Challenge, archives & data platforms",
    description: "The project brief, mission catalogue and places to continue your own research.",
    matches: (entry) => entry.kind !== "mission",
  },
  {
    title: "Moon mission evidence",
    description: "Hardware histories, surface experiments and the missions that made lunar exploration possible.",
    matches: (entry) => entry.kind === "mission" && entry.destination === "moon",
  },
  {
    title: "Mars mission evidence",
    description: "Landing systems, robotic science and the records of missions that finished their work.",
    matches: (entry) => entry.kind === "mission" && entry.destination === "mars",
  },
  {
    title: "Beyond Moon & Mars",
    description: "Ceres, Eros, the outer planets and solar orbits have their own hardware stories. These are not Mars surface objects.",
    matches: (entry) => entry.kind === "mission" && entry.destination === "deep",
  },
];

export default function ResourceLibrary() {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const entries = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return ABOUT_RESOURCES.filter((entry) => {
      const inFilter = filter === "all" || (filter === "platform" ? entry.kind !== "mission" : entry.destination === filter);
      const text = [entry.label, entry.scope, entry.use, entry.access, entry.note].join(" ").toLowerCase();
      return inFilter && words.every((word) => text.includes(word));
    });
  }, [filter, query]);

  return (
    <section aria-labelledby="resource-library-title" className="mt-5 rounded-2xl border border-cyan/20 bg-deep/30 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <Link2 size={18} className="shrink-0 text-cyan" aria-hidden="true" />
        <h2 id="resource-library-title" className="display text-2xl text-white">NASA research library</h2>
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
        Mission references support the archive, and selected data platforms help you investigate further.
        Each card explains its scope and how AFTERLIGHT uses it.
      </p>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-ink/40 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
            <Database size={16} className="text-cyan" aria-hidden="true" /> A curated archive
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            Mission stories, dates and sources are curated into this build. Photographs are stored locally with
            credits. Counts are historical snapshots or labelled estimates. Opening a source takes you to its
            publisher; these cards do not fetch live NASA datasets or update mission status automatically.
          </p>
        </div>
        <div className="rounded-xl border border-gold/20 bg-gold/5 p-4">
          <h3 className="text-sm font-semibold text-white">Keys & access</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            NASA mission pages and the NASA Image and Video Library API are keyless. Some api.nasa.gov endpoints
            use a NASA API key or a limited DEMO_KEY; there is no separate Space Apps API key.
            Check the chosen endpoint or dataset documentation before starting.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div role="group" aria-label="Filter research resources" className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`chip min-h-11 !px-3 !text-xs ${filter === item.id ? "!border-cyan/50 !bg-cyan/10 !text-cyan" : "!text-slate-300"}`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <label className="block w-full sm:w-72">
          <span className="mb-1.5 block text-xs font-medium text-slate-300">Find a mission or data platform</span>
          <span className="flex items-center gap-2 rounded-lg border border-white/15 bg-ink/60 px-3 focus-within:border-cyan focus-within:ring-2 focus-within:ring-cyan/25">
            <Search size={15} className="shrink-0 text-slate-400" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try InSight or NASA APIs"
              className="min-h-11 min-w-0 w-full bg-transparent text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
          </span>
        </label>
      </div>
      <p className="mt-3 text-xs text-slate-400" role="status">{entries.length} of {ABOUT_RESOURCES.length} resources shown · source links open in a new tab</p>

      {entries.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/15 p-5">
          <p className="text-sm text-slate-300">No resources match these filters.</p>
          <button type="button" onClick={() => { setFilter("all"); setQuery(""); }} className="btn btn-ghost mt-3 !text-xs">Show all resources</button>
        </div>
      ) : GROUPS.map((group) => {
        const resources = entries.filter(group.matches);
        if (resources.length === 0) return null;
        return (
          <div key={group.title} className="mt-6">
            <h3 className="text-lg font-semibold text-white">{group.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-400">{group.description}</p>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {resources.map((entry) => (
                <article key={entry.id} className="min-w-0 rounded-xl border border-white/10 bg-ink/35 p-4">
                  <h4 className="text-base font-semibold leading-snug"><SourceLink href={entry.url}>{entry.label}</SourceLink></h4>
                  <dl className="mt-3 space-y-3 text-sm leading-relaxed">
                    <div><dt className="font-medium text-slate-200">What it covers</dt><dd className="mt-0.5 text-slate-400">{entry.scope}</dd></div>
                    <div><dt className="font-medium text-slate-200">Used in AFTERLIGHT</dt><dd className="mt-0.5 text-slate-400">{entry.use}</dd></div>
                    <div><dt className="font-medium text-gold/90">Access</dt><dd className="mt-0.5 text-slate-400">{entry.access}</dd></div>
                  </dl>
                  {entry.note && <p className="mt-3 border-t border-white/8 pt-3 text-xs leading-relaxed text-slate-400">{entry.note}</p>}
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
