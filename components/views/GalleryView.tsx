"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Images, ArrowUpRight, Maximize2 } from "lucide-react";
import { Breadcrumb, SectionHeader, SourceLink } from "@/components/ui/Atoms";
import Lightbox from "@/components/sections/Lightbox";
import { EQUIPMENT } from "@/data/equipment";
import { imagePresentation } from "@/data/image-provenance";
import { PLANETS } from "@/data/planets";
import { useAfterlight } from "@/lib/store";
import creditData from "@/data/nasa-credits.json";
import type { Equipment, GalleryShot, Planet } from "@/data/types";

const PAGE_SIZE = 24;
type GalleryFrame = GalleryShot & { context: boolean };

const IMAGE_SOURCES = new Map(creditData.images.filter((credit) => credit.file).map((credit) => [credit.file, credit.source]));

/** A source photograph is one frame, even when several records reuse it. */
export function collectGalleryFrames(equipment: Equipment[]): GalleryFrame[] {
  const frames = new Map<string, { captions: Set<string>; credits: Set<string>; context: boolean }>();
  for (const record of equipment) {
    for (const shot of record.gallery) {
      const provenance = imagePresentation(record.id, shot.src, {
        imageCaption: shot.caption,
        imageCredit: shot.credit,
        imageKind: shot.src === record.image ? record.imageKind : undefined,
      });
      const context = provenance.imageKind === "site" || provenance.imageKind === "representative"
        || /^(terrain context|representative|context image)|artist.s (illustration|concept)|ground models/i.test(shot.caption.trim());
      const existing = frames.get(shot.src);
      if (existing) {
        existing.captions.add(shot.caption);
        existing.credits.add(shot.credit);
        existing.context = existing.context && context;
      } else {
        frames.set(shot.src, { captions: new Set([shot.caption]), credits: new Set([shot.credit]), context });
      }
    }
  }
  return Array.from(frames, ([src, frame]) => ({
    src,
    caption: Array.from(frame.captions).join(" "),
    credit: Array.from(frame.credits).join(" · "),
    context: frame.context,
  }));
}

export default function GalleryView() {
  const { go } = useAfterlight();
  const reduced = useReducedMotion();
  const [planet, setPlanet] = useState<Planet | "all">("all");
  const [index, setIndex] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const shots = useMemo(() => collectGalleryFrames(
    EQUIPMENT.filter((equipment) => planet === "all" || equipment.planet === planet),
  ), [planet]);
  const visibleShots = shots.slice(0, visibleCount);

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb items={[{ label: "Home", onClick: () => go("home") }, { label: "Gallery" }]} />
      <SectionHeader
        className="mt-4"
        eyebrow="Mission image archive"
        title={
          <>
            Images behind <span className="text-gradient-ice">mission stories</span>
          </>
        }
        description="NASA photography, illustrations, and terrain imagery, credited per unique frame. Context images are labeled. Open any image in the fullscreen viewer, then use the arrow keys or swipe through the archive."
        action={
          <div className="flex flex-wrap items-center gap-1.5">
            {(["all", "moon", "mars"] as const).map((f) => (
              <button key={f} onClick={() => { setPlanet(f); setVisibleCount(PAGE_SIZE); setIndex(null); }} className="chip" data-active={planet === f}>
                {f === "all" ? "All worlds" : PLANETS[f].name}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-3 flex items-center justify-between">
        <p className="data text-[0.75rem] uppercase tracking-[0.08em] text-slate-400">
          {shots.length} unique frames · credits preserved
        </p>
        <p className="hidden items-center gap-1.5 text-[0.72rem] uppercase tracking-[0.08em] text-slate-400 sm:flex">
          <Maximize2 size={11} /> click to enlarge
        </p>
      </div>

      <div className="gallery-grid mt-3 gap-3">
        {visibleShots.map((s, i) => (
          <motion.div
            key={s.src}
            initial={reduced ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : (i % 4) * 0.04 }}
            className="group relative flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-ink/70 text-left"
          >
            <button onClick={() => setIndex(i)} aria-label={`Enlarge: ${s.caption}`} className="equipment-card-action w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan">
            <img
              src={s.src}
              alt={s.caption}
              loading="lazy"
              decoding="async"
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
            />
            <div className="relative flex-1 border-t border-white/10 bg-ink/95 p-3.5 text-left">
              <p className="data mb-1.5 text-[0.68rem] uppercase tracking-[0.08em] text-cyan/85">{/artist.s (illustration|concept)/i.test(s.caption) ? "Mission illustration" : /ground models/i.test(s.caption) ? "Ground model photo" : s.context ? "Context image" : "Mission photograph"}</p>
              <p className="line-clamp-3 text-[0.84rem] leading-relaxed text-slate-200">{s.caption}</p>
              <p className="mt-2 text-[0.72rem] leading-relaxed text-slate-400">{s.credit}</p>
            </div>
            </button>
            {IMAGE_SOURCES.get(s.src) && <div className="border-t border-white/8 px-3.5 py-3 text-xs"><SourceLink href={IMAGE_SOURCES.get(s.src)!}>Original NASA image and metadata</SourceLink></div>}
          </motion.div>
        ))}
      </div>

      {shots.length > visibleCount && (
        <div className="mt-5 flex justify-center">
          <button onClick={() => setVisibleCount((count) => Math.min(count + PAGE_SIZE, shots.length))} className="btn btn-ghost">
            Load more images · {Math.min(visibleCount, shots.length)} of {shots.length}
          </button>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan/20 bg-deep/25 p-4">
        <div className="flex items-center gap-2.5">
          <Images size={16} className="text-cyan" />
          <p className="max-w-xl text-sm leading-relaxed text-slate-300">
            These frames appear in equipment records across the archive. Reused photographs appear once here.
            Open an equipment record for its full story and model provenance.
          </p>
        </div>
        <button onClick={() => go("explore")} className="btn btn-ghost !py-2.5 !text-[0.75rem]">
          Equipment archive <ArrowUpRight size={13} />
        </button>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs"><SourceLink href="https://images.nasa.gov/">Search NASA's keyless image library</SourceLink><SourceLink href="https://www.jpl.nasa.gov/images/">JPL mission imagery</SourceLink></div>

      <Lightbox shots={shots} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </div>
  );
}
