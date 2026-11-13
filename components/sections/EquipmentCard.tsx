"use client";

import { useRef } from "react";
import { ArrowUpRight, MapPin, Calendar, Gauge, Box } from "lucide-react";
import type { Equipment } from "@/data/types";
import {
  CATEGORY_LABEL,
  IMPORTANCE_LABEL,
  PLANET_LABEL,
  STATUS_LABEL,
  assetOf,
  importanceOf,
} from "@/data/equipment";
import { StatusPill } from "@/components/ui/Atoms";

export default function EquipmentCard({
  equipment,
  onOpen,
  compact = false,
}: {
  equipment: Equipment;
  onOpen: () => void;
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const imageLabel = equipment.imageKind === "artifact"
    ? "Object photo"
    : equipment.imageKind === "site"
      ? "Site image"
      : equipment.imageKind === "representative"
        ? /artist.s (illustration|concept)/i.test(equipment.imageCaption)
          ? "Mission illustration"
          : /ground models/i.test(equipment.imageCaption)
            ? "Ground model photo"
            : "Context image"
        : "Mission photo";

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg) translateY(-4px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className="tilt-card group relative min-w-0 w-full overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(165deg,rgba(12,27,56,0.82),rgba(2,5,12,0.94))] text-left"
    >
      <button onClick={onOpen} className="equipment-card-action block h-full w-full text-left" aria-label={`Open ${equipment.name}`}>
        <div className={`relative overflow-hidden ${compact ? "h-36" : "h-44"} bg-deep/60`}>
          <img
            src={equipment.image}
            alt={equipment.imageCaption}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04070f] via-[#04070f]/25 to-transparent" />
          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5">
              <span className="data rounded-md border border-cyan/35 bg-ink/85 px-1.5 py-1 text-[0.68rem] uppercase tracking-[0.08em] text-cyan">
                {PLANET_LABEL[equipment.planet]}
              </span>
              <span className="data rounded-md border border-white/15 bg-ink/85 px-1.5 py-1 text-[0.68rem] uppercase tracking-[0.06em] text-slate-300">
                {equipment.years}
              </span>
            </div>
            {importanceOf(equipment) !== "archive" && (
              <span
                className={`data shrink-0 rounded-md border px-1.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.06em] ${
                  importanceOf(equipment) === "iconic"
                    ? "border-gold/60 bg-ink/85 text-gold shadow-[0_0_18px_-6px_rgba(255,201,60,0.9)]"
                    : "border-cyan/50 bg-ink/85 text-cyan"
                }`}
              >
                {importanceOf(equipment) === "iconic" ? "★ Iconic" : IMPORTANCE_LABEL[importanceOf(equipment)]}
              </span>
            )}
          </div>
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <div className="data text-[0.68rem] uppercase tracking-[0.08em] text-slate-300">
                {CATEGORY_LABEL[equipment.category]}
              </div>
              <h3 className="display mt-1 line-clamp-2 text-xl leading-tight text-white [overflow-wrap:anywhere]">{equipment.name}</h3>
            </div>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <ArrowUpRight size={13} />
            </span>
          </div>
        </div>

        <div className="p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <StatusPill status={equipment.status} />
            <span className="data min-w-0 text-[0.68rem] uppercase tracking-[0.08em] text-slate-400 [overflow-wrap:anywhere]">
              {equipment.shortName}
            </span>
          </div>
          <p className="mt-2 line-clamp-2 text-[0.72rem] uppercase tracking-[0.06em] text-cyan/85">
            {equipment.mission}
            {equipment.country ? ` · ${equipment.country}` : ""}
          </p>
          {!compact && (
            <p className="mt-2.5 line-clamp-3 text-[0.84rem] leading-relaxed text-slate-300">
              {equipment.summary}
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[0.75rem] text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} className="shrink-0" /> {equipment.landed}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} className="shrink-0" /> {equipment.site.split(",")[0]}
            </span>
            {equipment.distance && (
              <span className="inline-flex items-center gap-1">
                <Gauge size={12} className="shrink-0" /> {equipment.distance}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5">
            <span className="inline-flex items-center gap-1 text-[0.7rem] uppercase tracking-[0.05em] text-cyan/85">
              <Box size={12} /> 3D model
            </span>
            <span className="data text-[0.68rem] uppercase tracking-[0.04em] text-slate-400">
              {assetOf(equipment).source === "official" ? "Official" : "Reconstruction"}
            </span>
          </div>
          <p className="mt-2 text-[0.7rem] text-slate-400">{imageLabel}</p>
        </div>
      </button>

      <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/0 transition group-hover:ring-gold/40" />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan/50 to-transparent opacity-0 transition group-hover:opacity-100" />
      <span className="sr-only">{STATUS_LABEL[equipment.status]}</span>
    </div>
  );
}
