"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, X, Maximize2, MoveHorizontal } from "lucide-react";
import type { GalleryShot } from "@/data/types";

export default function Lightbox({
  shots,
  index,
  onClose,
  onIndex,
}: {
  shots: GalleryShot[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const touchX = useRef<number | null>(null);
  const shot = index != null ? shots[index] : null;
  const open = Boolean(shot);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [isWide, setIsWide] = useState(false);
  const [pan, setPan] = useState(false);
  const dragRef = useRef<{ startX: number; scrollLeft: number; active: boolean }>({
    startX: 0,
    scrollLeft: 0,
    active: false,
  });

  const prev = useCallback(() => {
    if (index == null) return;
    onIndex((index - 1 + shots.length) % shots.length);
  }, [index, shots.length, onIndex]);

  const next = useCallback(() => {
    if (index == null) return;
    onIndex((index + 1) % shots.length);
  }, [index, shots.length, onIndex]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus({ preventScroll: true }));
    const keepFocus = (event: FocusEvent) => {
      const dialog = dialogRef.current;
      if (dialog && !dialog.contains(event.target as Node)) closeRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("focusin", keepFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("focusin", keepFocus);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      // The image dialog owns keyboard focus until it closes; do not open
      // the lower search layer behind it through a global search shortcut.
      if (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      if (e.key === "Tab") {
        const controls = [...dialog.querySelectorAll<HTMLElement>('button:not([disabled]), [tabindex="0"]')]
          .filter((control) => control.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) {
          e.preventDefault();
          dialog.focus();
        } else if (!dialog.contains(document.activeElement) || (e.shiftKey && document.activeElement === first)) {
          e.preventDefault();
          (e.shiftKey ? last : first).focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if (e.key !== "Escape" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      e.stopPropagation();
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") prev();
      else next();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onClose, prev, next]);

  // Reset pan state when the image changes
  useEffect(() => {
    setIsWide(false);
    setPan(false);
  }, [index]);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const wide = img.naturalWidth / Math.max(1, img.naturalHeight) > 2;
    setIsWide(wide);
    setPan(wide);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pan) return;
    dragRef.current = { startX: e.pageX, scrollLeft: scrollRef.current?.scrollLeft ?? 0, active: true };
    if (scrollRef.current) scrollRef.current.style.cursor = "grabbing";
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !scrollRef.current) return;
    e.preventDefault();
    const dx = e.pageX - dragRef.current.startX;
    scrollRef.current.scrollLeft = dragRef.current.scrollLeft - dx;
  };
  const onMouseUp = () => {
    dragRef.current.active = false;
    if (scrollRef.current) scrollRef.current.style.cursor = "grab";
  };

  return (
    <AnimatePresence>
      {shot && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-ink/95 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          tabIndex={-1}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 50) (dx > 0 ? prev : next)();
            touchX.current = null;
          }}
        >
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3 py-2 sm:px-4 md:px-6">
            <span className="data text-[0.6rem] uppercase tracking-[0.2em] text-cyan/80">
              Gallery · {String((index ?? 0) + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
            </span>
            <div className="ml-auto flex shrink-0 items-center gap-2">
              {isWide && (
                <button
                  onClick={() => setPan((p) => !p)}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-[0.5rem] border-2 px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.12em] transition ${
                    pan
                      ? "border-gold/70 bg-gold/15 text-gold"
                      : "border-white/20 bg-ink/60 text-slate-300 hover:border-cyan/60 hover:text-cyan"
                  }`}
                  aria-pressed={pan}
                  title={pan ? "Fit whole image" : "Pan across the panorama"}
                >
                  <MoveHorizontal size={12} /> {pan ? "Fit" : "Panorama"}
                </button>
              )}
              <button ref={closeRef} onClick={onClose} className="icon-btn" aria-label="Close image viewer">
                <X size={17} />
              </button>
            </div>
          </div>

          {pan && isWide ? (
            <div
              ref={scrollRef}
              className="relative min-h-0 flex-1 overflow-x-auto overflow-y-hidden px-3 pb-2 md:px-14"
              style={{ cursor: "grab" }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <div className="flex h-full items-center">
                <motion.img
                  key={shot.src + index}
                  src={shot.src}
                  alt={shot.caption}
                  onLoad={onImgLoad}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full w-auto max-w-none rounded-lg shadow-[0_40px_120px_-30px_#000]"
                  draggable={false}
                />
              </div>
              <button
                onClick={prev}
                className="absolute left-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-[0.6rem] border-2 border-white/20 bg-ink/80 p-2.5 text-white shadow-[0_3px_0_rgba(2,16,38,0.9)] backdrop-blur transition hover:border-cyan/70 active:translate-y-0 active:shadow-none md:left-4"
                aria-label="Previous image"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={next}
                className="absolute right-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-[0.6rem] border-2 border-white/20 bg-ink/80 p-2.5 text-white shadow-[0_3px_0_rgba(2,16,38,0.9)] backdrop-blur transition hover:border-cyan/70 active:translate-y-0 active:shadow-none md:right-4"
                aria-label="Next image"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 pb-2 md:px-14">
              <motion.img
                key={shot.src + index}
                src={shot.src}
                alt={shot.caption}
                onLoad={onImgLoad}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-h-full max-w-full rounded-lg object-contain shadow-[0_40px_120px_-30px_#000]"
              />
              <button
                onClick={prev}
                className="absolute left-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-[0.6rem] border-2 border-white/20 bg-ink/80 p-2.5 text-white shadow-[0_3px_0_rgba(2,16,38,0.9)] backdrop-blur transition hover:border-cyan/70 active:translate-y-0 active:shadow-none md:left-4"
                aria-label="Previous image"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={next}
                className="absolute right-1 top-1/2 min-h-11 min-w-11 -translate-y-1/2 rounded-[0.6rem] border-2 border-white/20 bg-ink/80 p-2.5 text-white shadow-[0_3px_0_rgba(2,16,38,0.9)] backdrop-blur transition hover:border-cyan/70 active:translate-y-0 active:shadow-none md:right-4"
                aria-label="Next image"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}

          <div tabIndex={0} aria-label="Image caption and credit" className="thin-scroll max-h-[30dvh] shrink-0 overflow-y-auto overscroll-contain border-t border-white/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-cyan md:px-6">
            <p className="text-sm text-slate-200">{shot.caption}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-[0.62rem] text-slate-500">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <Maximize2 size={11} className="shrink-0" /> Credit: {shot.credit}
              </span>
              <span className="uppercase tracking-[0.16em]">
                {isWide ? "← → browse · drag to pan · esc close" : "← → browse · esc close · swipe on mobile"}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
