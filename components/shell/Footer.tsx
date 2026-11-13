"use client";

import { useState } from "react";
import { ArrowUp, Earth, Satellite, MousePointerClick } from "lucide-react";
import { Logo, SourceLink } from "@/components/ui/Atoms";
import { useAfterlight } from "@/lib/store";

const SOURCES = [
  {
    label: "NASA — Final Catalogue of Manmade Material on the Moon (2012)",
    url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf",
  },
  { label: "NASA Science — Mars", url: "https://science.nasa.gov/mars/" },
  { label: "NASA Science — Moon", url: "https://science.nasa.gov/moon/" },
  { label: "NASA Image and Video Library", url: "https://images.nasa.gov/" },
  { label: "NASA 3D Resources", url: "https://science.nasa.gov/3d-resources/" },
  { label: "spaceartefacts.com — Human objects on Mars (estimate)", url: "https://spaceartefacts.com/human-objects-on-mars" },
  { label: "Solar System Scope textures — CC BY 4.0", url: "https://www.solarsystemscope.com/textures/" },
];

export default function Footer() {
  const { go, setStage } = useAfterlight();
  const [open, setOpen] = useState(false);

  return (
    <footer className="relative mt-12 border-t border-white/8 bg-[linear-gradient(180deg,rgba(2,5,12,0.4),rgba(3,6,14,0.95))] md:mt-16">
      <div className="w-full px-4 pt-10 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-5 sm:pt-12 md:px-8 md:pb-28">
        <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              AFTERLIGHT is an educational expedition through the machines humanity has left on
              the Moon and Mars — their missions, their final days, and the science they made
              possible — with spacecraft stories from farther across the Solar System.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="chip !cursor-default">Space Apps 2026</span>
              <span className="chip !cursor-default">Public-domain NASA imagery</span>
              <span className="chip !cursor-default">Open educational resource</span>
            </div>
          </div>

          <div className="min-w-0">
            <h4 className="data mb-3 text-[0.68rem] uppercase tracking-[0.2em] text-cyan/85">Explore</h4>
            <ul className="space-y-1 text-sm text-slate-400">
              {[
                ["Equipment archive", "explore"],
                ["Games for kids", "games"],
                ["Planetary map", "map"],
                ["Mission timeline", "missions"],
                ["Discoveries", "discoveries"],
                ["Compare machines", "compare"],
                ["The numbers", "stats"],
                ["Deep space stories", "deepspace"],
                ["Student investigations", "students"],
              ].map(([label, view]) => (
                <li key={view}>
                  <button
                    onClick={() => {
                      setStage("explore");
                      go(view as never);
                    }}
                    className="text-action min-h-11 py-2 text-left transition hover:text-cyan"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
            <button onClick={() => { setStage("explore"); go("about"); }} className="text-action mt-3 min-h-11 text-left text-sm text-cyan/85 hover:text-cyan">NASA research library →</button>
          </div>

          <div className="min-w-0">
            <h4 className="data mb-3 text-[0.68rem] uppercase tracking-[0.2em] text-cyan/85">Sources & crediting</h4>
            <ul className="space-y-3 text-[0.82rem] leading-relaxed text-slate-400">
              {SOURCES.slice(0, open ? SOURCES.length : 4).map((s) => (
                <li key={s.url}>
                  <SourceLink href={s.url} className="min-h-11 py-1">{s.label}</SourceLink>
                </li>
              ))}
            </ul>
            {!open && (
              <button
                onClick={() => setOpen(true)}
                className="text-action mt-2 min-h-11 text-left text-[0.68rem] uppercase tracking-[0.14em] text-cyan/85 hover:text-cyan"
                aria-expanded={open}
              >
                Show all sources
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/8 pt-6 text-[0.7rem] text-slate-400 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-3">
            <span className="inline-flex items-center gap-1.5"><Earth size={12} className="shrink-0" /> Earth · Moon · Mars</span>
            <span className="inline-flex items-center gap-1.5"><Satellite size={12} className="shrink-0" /> {new Date().getFullYear()} AFTERLIGHT</span>
            <span className="inline-flex min-w-0 items-center gap-1.5"><MousePointerClick size={12} className="shrink-0" /> 3D reconstructions are educational, not flight hardware</span>
          </div>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })}
            className="text-action inline-flex min-h-11 shrink-0 items-center gap-1.5 self-start uppercase tracking-[0.14em] text-cyan/85 transition hover:text-cyan"
          >
            Back to top <ArrowUp size={12} />
          </button>
        </div>

        <p className="mt-6 max-w-[100ch] text-[0.7rem] leading-relaxed text-slate-400">
          NASA imagery is generally not subject to copyright in the United States and is used here
          for educational purposes; individual credits appear with each photograph. Planetary
          textures are by Solar System Scope (CC BY 4.0), sourced from its texture library and Wikimedia
          Commons. Luffy&rsquo;s artwork is an original fan illustration of a One Piece character
          belonging to Eiichiro Oda and Shueisha/Toei. AFTERLIGHT is an independent student project and is not affiliated with
          or endorsed by NASA.
        </p>
      </div>
    </footer>
  );
}
