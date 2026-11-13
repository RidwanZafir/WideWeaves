"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Image as ImageIcon, ShieldCheck, Keyboard, Accessibility, Link2, TriangleAlert } from "lucide-react";
import { Breadcrumb, SourceLink } from "@/components/ui/Atoms";
import ResourceLibrary from "@/components/resources/ResourceLibrary";
import creditData from "@/data/nasa-credits.json";
import { CHALLENGE_SOURCE } from "@/data/resources";
import { MARS_COUNT, MOON_COUNT, TOTAL_EQUIPMENT } from "@/data/equipment";
import { TIMELINE } from "@/data/timeline";
import { KNOWLEDGE } from "@/data/knowledge";
import { SITES } from "@/data/sites";
import { useAfterlight } from "@/lib/store";

type Credit = {
  slug: string;
  file?: string | null;
  title?: string;
  nasaId?: string;
  credit?: string;
  source?: string;
  center?: string;
};

const CREDITS = (creditData.images as Credit[]).filter((c) => c.file);

const SOURCE_GROUPS = [
  {
    title: "Datasets & catalogues",
    links: [
      {
        label: "NASA — Final Catalogue of Manmade Material on the Moon (5 July 2012)",
        url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf",
      },
      { label: "spaceartefacts.com — Human objects on Mars (independent estimate)", url: "https://spaceartefacts.com/human-objects-on-mars" },
      { label: "Wikipedia — List of artificial objects on the Moon (secondary coordinate compilation)", url: "https://en.wikipedia.org/wiki/List_of_artificial_objects_on_the_Moon" },
      { label: "Wikipedia — List of artificial objects on Mars (secondary coordinate compilation)", url: "https://en.wikipedia.org/wiki/List_of_artificial_objects_on_Mars" },
    ],
  },
  {
    title: "Mission science",
    links: [
      { label: "NASA Science — Curiosity (Mars Science Laboratory)", url: "https://science.nasa.gov/mission/msl-curiosity/" },
      { label: "NASA Science — Perseverance (Mars 2020)", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" },
      { label: "NASA — Apollo program", url: "https://www.nasa.gov/the-apollo-program/" },
      { label: "NASA History — Apollo Lunar Surface Journal", url: "https://www.nasa.gov/history/alsj/" },
    ],
  },
  {
    title: "Imagery, textures & models",
    links: [
      { label: "NASA Image and Video Library (images-api.nasa.gov)", url: "https://images.nasa.gov/" },
      { label: "NASA 3D Resources", url: "https://science.nasa.gov/3d-resources/" },
      { label: "NASA SVS — CGI Moon Kit (LROC imagery and LOLA elevation)", url: "https://svs.gsfc.nasa.gov/4720/" },
      { label: "USGS Astrogeology — Jezero HiRISE terrain and orthomosaic", url: "https://astrogeology.usgs.gov/search/map/mars-sample-return-terrain-relative-navigation-hirise-dtm-mosaic" },
      { label: "AFTERLIGHT — Root scene asset manifest and creator credits", url: "/assets/root-expedition/ASSET_SOURCES.md" },
      { label: "NASA — Images and media usage guidelines", url: "https://www.nasa.gov/nasa-brand-center/images-and-media/" },
      { label: "Solar System Scope textures — CC BY 4.0", url: "https://www.solarsystemscope.com/textures/" },
      { label: "Moon texture on Wikimedia Commons (CC BY 4.0)", url: "https://commons.wikimedia.org/wiki/File:Solarsystemscope_texture_2k_moon.jpg" },
      { label: "Mars texture on Wikimedia Commons (CC BY 4.0)", url: "https://commons.wikimedia.org/wiki/File:Solarsystemscope_texture_2k_mars.jpg" },
    ],
  },
];

export default function AboutView() {
  const { go } = useAfterlight();
  const [showAll, setShowAll] = useState(false);

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "About & sources" }]} />

      <section className="relative mt-4 overflow-hidden rounded-2xl border border-cyan/20 bg-[linear-gradient(160deg,rgba(11,28,56,0.9),rgba(3,7,16,0.96))] p-5 md:p-8">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-20" />
        <div className="relative">
          <span className="eyebrow">About the expedition</span>
          <h1 className="display mt-2 max-w-3xl text-3xl leading-[1.02] text-white sm:text-4xl md:text-[3rem]">
            THE MISSIONS ENDED.
            <br />
            THE STORIES DIDN&rsquo;T.
          </h1>
          <p className="mt-4 max-w-2xl text-[0.86rem] leading-relaxed text-slate-300">
            AFTERLIGHT is a student-built, interactive archive of the machines humanity has left on
            the Moon and Mars, with mission stories from farther across the Solar System. It began with the NASA Space Apps Challenge 2026 brief
            &ldquo;NASA&rsquo;s Discarded Equipment Storytelling&rdquo; — storytelling about discarded equipment on
            the Moon and Mars — and grew into a place where you can spin the hardware, read its last
            days and see what its science changed.
          </p>
          <div className="mt-3 text-sm">
            <SourceLink href={CHALLENGE_SOURCE.url}>{CHALLENGE_SOURCE.label}</SourceLink>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: String(TOTAL_EQUIPMENT), v: `catalogued machines · ${MOON_COUNT} Moon / ${MARS_COUNT} Mars` },
              { k: String(SITES.length), v: "landing sites mapped" },
              { k: String(TIMELINE.length), v: "timeline milestones" },
              { k: String(KNOWLEDGE.length), v: "knowledge cards" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border border-white/8 bg-ink/40 p-3">
                <div className="display text-2xl text-white">{s.k}</div>
                <div className="text-[0.58rem] uppercase tracking-[0.14em] text-slate-500">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {[
          {
            icon: Database,
            title: "How the data is handled",
            body: "Every figure is labelled published (traceable to its catalogue or mission record), estimate (an independent inventory), or counted by AFTERLIGHT from the stated records. The statistics page shows each definition, source and cutoff date. If no public count exists, a dash means unknown. Mission summaries support the stories; they do not establish the precise coordinates shown on a map.",
          },
          {
            icon: TriangleAlert,
            title: "A note on the '796' figure",
            body: "796 is a published line-item count in NASA's Final Catalogue of Manmade Material on the Moon (5 July 2012, NASA/TP-2012-216051). It includes hardware and other objects, rather than 796 intact machines, and excludes later landings. Mars's 190+ figure is an independent estimate from spaceartefacts.com. Neither figure is the size of AFTERLIGHT's curated equipment catalogue.",
          },
          {
            icon: ShieldCheck,
            title: "Model provenance",
            body: "Equipment viewers distinguish educational reconstructions, shared hardware-class schematics and illustrative debris. Published diagrams and photographs guide recognizable features; a class schematic does not reproduce every mission's exact layout or final condition. Official NASA 3D downloads are linked where available, separately from the hand-built viewer geometry. The introduction renders an official NASA Apollo Lunar Module model and a reconstructed Mars rover. The root asset manifest credits retained assets and their creators.",
          },
          {
            icon: ImageIcon,
            title: "Photography & licensing",
            body: "Mission photography retains its NASA/JPL credit and source link. Captions distinguish photographs of an object from illustrations and representative terrain or context imagery. NASA media are generally public domain in the United States, subject to source-page and third-party notices. Planet thumbnails and the introduction's Earth texture use credited Solar System Scope maps (CC BY 4.0); the introduction also uses NASA and USGS imagery/elevation.",
          },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/10 bg-deep/25 p-4"
            >
              <Icon size={16} className="text-cyan" />
              <h3 className="mt-2 text-base font-semibold text-white">{c.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{c.body}</p>
            </motion.div>
          );
        })}
      </div>

      <ResourceLibrary />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan/20 bg-cyan/5 p-4">
        <p className="max-w-2xl text-sm leading-relaxed text-slate-300">Turn a source into a question: compare hardware, explain a mission ending or trace a discovery to its instrument.</p>
        <button type="button" onClick={() => go("students")} className="btn btn-ice !text-xs">Student investigations</button>
      </div>

      {/* guide character */}
      <section className="mt-3 rounded-2xl border border-gold/25 bg-[linear-gradient(150deg,rgba(38,26,8,0.55),rgba(2,5,12,0.92))] p-4 md:p-5">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex-1">
            <span className="data text-[0.55rem] uppercase tracking-[0.2em] text-gold/80">
              The guide
            </span>
            <h3 className="display mt-1 text-xl text-white">Luffy, expedition guide</h3>
            <p className="mt-2 max-w-2xl text-[0.74rem] leading-relaxed text-slate-300">
              Luffy is the voice of the archive: he introduces missions, reacts to discoveries and
              narrates the story chapters with ElevenLabs’ Harry voice, with subtitles always on.
              In this build his artwork is an <strong className="font-semibold text-white">original vector
                fan illustration</strong> of Monkey D. Luffy. The character belongs to
              Eiichiro Oda and Shueisha/Toei; this illustration is not an official character asset
              and the project is not affiliated with those rights holders.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-ink/40 p-3 text-[0.66rem] text-slate-400">
            <div className="text-[0.52rem] uppercase tracking-[0.14em] text-slate-500">Narration</div>
            <p className="mt-1">Harry by ElevenLabs. Browser voice fallback when unavailable.</p>
            <div className="mt-2 text-[0.52rem] uppercase tracking-[0.14em] text-slate-500">Motion</div>
            <p className="mt-1">
              Respects the OS reduced-motion setting: parallax, camera drift and transitions stop,
              while the starfield keeps a slower, gentler twinkle.
            </p>
          </div>
        </div>
      </section>

      {/* sources */}
      <section className="mt-3 rounded-2xl border border-white/10 bg-deep/25 p-4 md:p-5">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-cyan" />
          <h3 className="display text-xl text-white">Further citations & asset sources</h3>
        </div>
        <p className="mt-1 text-[0.72rem] leading-relaxed text-slate-400">
          Each equipment record lists its own sources. These additional references support catalogue
          definitions, coordinate context, photography and terrain. Wikipedia links are secondary
          compilations; follow their cited evidence before treating a coordinate as established.
        </p>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {SOURCE_GROUPS.map((group) => (
            <div key={group.title}>
              <h4 className="data mb-2 text-[0.55rem] uppercase tracking-[0.18em] text-cyan/70">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((l) => (
                  <li key={l.url} className="text-[0.68rem] leading-snug">
                    <SourceLink href={l.url}>{l.label}</SourceLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* image credits */}
      <section className="mt-3 rounded-2xl border border-white/10 bg-deep/25 p-4 md:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ImageIcon size={16} className="text-cyan" />
            <h3 className="display text-xl text-white">Photograph credits</h3>
          </div>
          <span className="data text-[0.55rem] uppercase tracking-[0.16em] text-slate-500">
            {CREDITS.length} images · fetched {new Date(creditData.fetchedAt).toLocaleDateString("en-GB")}
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {CREDITS.slice(0, showAll ? CREDITS.length : 6).map((c) => (
            <div key={c.slug} className="flex min-w-0 items-start gap-2.5 overflow-hidden rounded-lg border border-white/8 bg-ink/30 p-2">
              <img src={c.file!} alt={c.title ?? c.slug} loading="lazy" className="h-12 w-16 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[0.68rem] text-slate-200">{c.title ?? c.slug}</div>
                <div className="truncate text-[0.55rem] text-slate-500">
                  Credit: {c.credit} · {c.nasaId}
                </div>
                {c.source && (
                  <a
                    href={c.source}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block truncate text-[0.52rem] uppercase tracking-[0.1em] text-cyan/60 hover:text-cyan"
                  >
                    View on images.nasa.gov ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
        {CREDITS.length > 6 && (
          <button
            onClick={() => setShowAll((s) => !s)}
            className="mt-2 text-[0.6rem] uppercase tracking-[0.14em] text-cyan/70 hover:text-cyan"
          >
            {showAll ? "Show fewer" : `Show all ${CREDITS.length} credits`}
          </button>
        )}
      </section>

      {/* accessibility & tech */}
      <section className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-deep/25 p-4">
          <Accessibility size={16} className="text-cyan" />
          <h3 className="mt-2 text-[0.88rem] font-semibold text-white">Accessibility & performance</h3>
          <ul className="mt-2 space-y-1.5 text-[0.7rem] leading-relaxed text-slate-400">
            <li>• Every 3D scene is lazy-mounted and replaced by photography when WebGL is unavailable.</li>
            <li>• Reduced-motion preferences disable camera drift, auto-rotation and long transitions.</li>
            <li>• All scientific text remains readable without any 3D rendering.</li>
            <li>• Keyboard navigation: arrow keys move between machines and story chapters.</li>
          </ul>
        </div>
        <div className="rounded-2xl border border-white/10 bg-deep/25 p-4">
          <Keyboard size={16} className="text-cyan" />
          <h3 className="mt-2 text-[0.88rem] font-semibold text-white">Keyboard shortcuts</h3>
          <div className="mt-2 space-y-1.5">
            {[
              ["/ or Ctrl K", "Search the archive"],
              ["← →", "Previous / next machine or chapter"],
              ["Esc", "Close overlays, skip the intro"],
              ["Enter", "Advance the intro dialogue"],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 text-[0.68rem]">
                <kbd className="rounded border border-white/15 bg-ink/60 px-1.5 py-0.5 text-[0.58rem] text-slate-300">
                  {k}
                </kbd>
                <span className="text-slate-400">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="mt-3 text-[0.66rem] leading-relaxed text-slate-500">
        Independent student project. Not affiliated with, endorsed by, or sponsored by NASA. All
        trademarks belong to their respective owners.
      </p>
    </div>
  );
}
