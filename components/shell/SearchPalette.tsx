"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, MapPin, Rocket, Search, Sparkles, X } from "lucide-react";
import { useAfterlight } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";
import { EQUIPMENT, searchText } from "@/data/equipment";
import { SITES } from "@/data/sites";
import { KNOWLEDGE } from "@/data/knowledge";
import { TIMELINE } from "@/data/timeline";
import { PLANETS } from "@/data/planets";
import { DEEP_SPACE } from "@/data/deep-space";

/* ------------------------------------------------------------------ */
type Result = {
  id: string;
  title: string;
  subtitle: string;
  kind: "equipment" | "site" | "fact" | "mission" | "deep";
  score: number;
  onSelect: () => void;
};

const KIND_LABEL = { equipment: "Equipment record", site: "Landing site", fact: "Knowledge card", mission: "Mission milestone", deep: "Deep space story" };

function relevance(title: string, query: string) {
  const text = title.toLowerCase();
  if (text === query) return 4;
  if (text.startsWith(query)) return 3;
  return text.includes(query) ? 2 : 1;
}

export function SearchPalette() {
  const { searchOpen, setSearchOpen, openEquipment, go, say, setPlanet, setSiteId, setStage } = useAfterlight();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!searchOpen) return;
    setQuery("");
    setActive(0);
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    const keepFocus = (event: FocusEvent) => {
      const dialog = dialogRef.current;
      if (dialog && !dialog.contains(event.target as Node)) inputRef.current?.focus({ preventScroll: true });
    };
    document.addEventListener("focusin", keepFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("focusin", keepFocus);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [searchOpen]);

  const results: Result[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items: Result[] = [];

    EQUIPMENT.forEach((e) => {
      const hay = searchText(e);
      if (!q || hay.includes(q)) {
        items.push({
          id: `eq-${e.id}`,
          title: e.name,
          subtitle: `${PLANETS[e.planet].name} · ${e.mission} · ${e.years}`,
          kind: "equipment",
          score: relevance(e.name, q),
          onSelect: () => {
            setStage("explore");
            setPlanet(e.planet);
            openEquipment(e.id, "overview");
          },
        });
      }
    });

    SITES.forEach((s) => {
      const hay = `${s.name} ${s.mission} ${s.description} ${s.planet} ${s.year}`.toLowerCase();
      if (q && hay.includes(q)) {
        items.push({
          id: `site-${s.id}`,
          title: s.name,
          subtitle: `${PLANETS[s.planet].name} · ${s.year} · ${s.lat.toFixed(2)}°, ${s.lon.toFixed(2)}°`,
          kind: "site",
          score: relevance(s.name, q),
          onSelect: () => {
            setStage("explore");
            useNavigation.getState().targetMapEquipment(null);
            setPlanet(s.planet);
            setSiteId(s.id);
            go("map");
            say({
              text: `${s.name}. ${s.description}`,
              expression: "curious",
              pose: "point",
            });
          },
        });
      }
    });

    TIMELINE.forEach((t) => {
      if (q && `${t.title} ${t.summary} ${t.year} ${t.date} ${t.agency} ${t.planet}`.toLowerCase().includes(q)) {
        items.push({
          id: `tl-${t.id}`,
          title: t.title,
          subtitle: `${t.date} · ${t.agency}`,
          kind: "mission",
          score: relevance(t.title, q),
          onSelect: () => {
            setStage("explore");
            if (t.planet === "moon" || t.planet === "mars") setPlanet(t.planet);
            useNavigation.getState().targetMission(t.id);
            go("missions");
          },
        });
      }
    });

    DEEP_SPACE.probes.forEach((probe) => {
      if (q && `${probe.name} ${probe.location} ${probe.hardware} ${probe.discovery} ${probe.ending}`.toLowerCase().includes(q)) {
        items.push({
          id: `deep-${probe.id}`, title: probe.name, subtitle: probe.location,
          kind: "deep", score: relevance(probe.name, q),
          onSelect: () => {
            setStage("explore");
            useNavigation.getState().targetDeepSpace(probe.id);
            go("deepspace");
          },
        });
      }
    });

    KNOWLEDGE.forEach((k) => {
      if (q && `${k.question} ${k.answer} ${k.category}`.toLowerCase().includes(q)) {
        items.push({
          id: `kn-${k.id}`,
          title: k.question,
          subtitle: k.category,
          kind: "fact",
          score: relevance(k.question, q),
          onSelect: () => {
            setStage("explore");
            useNavigation.getState().targetFact(k.id);
            go("learn");
          },
        });
      }
    });

    if (!q) return items.slice(0, 9);
    const ranked = items.sort((a, b) => b.score - a.score);
    // Reserve the strongest match from each collection before filling the list.
    // Broad mission terms otherwise let the much larger equipment archive win all nine slots.
    const selected: Result[] = [];
    for (const kind of ["equipment", "site", "mission", "fact", "deep"] as const) {
      const match = ranked.find((item) => item.kind === kind);
      if (match) selected.push(match);
    }
    for (const item of ranked) {
      if (selected.length >= 9) break;
      if (!selected.includes(item)) selected.push(item);
    }
    return selected.sort((a, b) => b.score - a.score);
  }, [query, openEquipment, go, setPlanet, say, setSiteId, setStage]);

  useEffect(() => {
    if (!searchOpen) return;
    resultsRef.current?.querySelector<HTMLElement>(`[data-result-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, results, searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!searchOpen || e.isComposing) return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setSearchOpen(false);
        return;
      }
      if (e.key === "Tab") {
        const controls = [...dialog.querySelectorAll<HTMLElement>(
          'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), [tabindex="0"]',
        )].filter((control) => control.getClientRects().length > 0);
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
      // Native buttons (including Close) keep their own Enter activation.
      if (e.target !== inputRef.current) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        e.stopPropagation();
        setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        e.stopPropagation();
        setActive((a) => Math.max(a - 1, 0));
      }
      if (e.key === "Enter") {
        const r = results[active];
        if (r) {
          e.preventDefault();
          e.stopPropagation();
          r.onSelect();
          setSearchOpen(false);
        }
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [searchOpen, results, active, setSearchOpen]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/80 px-3 py-3 backdrop-blur-md sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSearchOpen(false)}
        >
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, y: -18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="flex max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-cyan/25 bg-[linear-gradient(160deg,rgba(6,14,30,0.98),rgba(4,9,20,0.99))] shadow-[0_40px_120px_-40px_#000] sm:max-h-[calc(100dvh-2rem)]"
            role="dialog"
            aria-modal="true"
            aria-label="Search AFTERLIGHT"
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex shrink-0 items-center gap-2 border-b border-white/10 px-3 py-2 sm:gap-3 sm:px-4">
              <Search size={17} className="shrink-0 text-cyan" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                placeholder="Search equipment, sites, missions, deep space…"
                className="min-h-11 min-w-0 flex-1 rounded-md bg-transparent px-1 text-sm text-white placeholder:text-slate-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-cyan/50"
                aria-label="Search AFTERLIGHT"
                role="combobox"
                aria-expanded={searchOpen}
                aria-controls="afterlight-search-results"
                aria-activedescendant={results[active] ? `afterlight-result-${results[active].id}` : undefined}
                aria-autocomplete="list"
              />
              <button onClick={() => setSearchOpen(false)} className="icon-btn shrink-0" aria-label="Close search" title="Close search (Escape)">
                <X size={17} />
              </button>
            </div>
            <div ref={resultsRef} id="afterlight-search-results" role="listbox" aria-label="Search results" className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
              {results.length === 0 && (
                <p className="px-3 py-8 text-center text-sm text-slate-400">
                  Nothing found for “{query}”. Try “Opportunity”, “Apollo”, “ice” or “dust”.
                </p>
              )}
              {results.map((r, i) => (
                <button
                  key={r.id}
                  id={`afterlight-result-${r.id}`}
                  data-result-index={i}
                  role="option"
                  aria-selected={active === i}
                  tabIndex={-1}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => {
                    r.onSelect();
                    setSearchOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    active === i ? "bg-cyan/10" : "hover:bg-white/5"
                  }`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-cyan/25 bg-abyss/70 text-cyan">
                    {r.kind === "equipment" ? (
                      <Rocket size={14} />
                    ) : r.kind === "site" ? (
                      <MapPin size={14} />
                    ) : r.kind === "fact" ? (
                      <Sparkles size={14} />
                    ) : r.kind === "deep" ? (
                      <Rocket size={14} />
                    ) : (
                      <Clock size={14} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-white">{r.title}</span>
                    <span className="block truncate text-xs text-cyan/70">{KIND_LABEL[r.kind]} · {r.subtitle}</span>
                  </span>
                  <ArrowRight size={13} className="shrink-0 text-slate-500" />
                </button>
              ))}
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-white/10 px-3 py-2 text-[0.6rem] uppercase tracking-[0.12em] text-slate-500 sm:px-4">
              <span>↑↓ to move · enter to open</span>
              <span className="text-cyan/60">{EQUIPMENT.length} surface records · {DEEP_SPACE.probes.length} deep space stories</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
