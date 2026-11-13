"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Menu as MenuIcon,
  X,
  GraduationCap,
  Compass,
  Home,
  Clock,
  Sparkles,
  BookOpen,
  Info,
  Globe2,
  BarChart3,
  Images,
  GitCompare,
  Rocket,
  Gamepad2,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronRight,
} from "lucide-react";
import { Logo, ProgressBar } from "@/components/ui/Atoms";
import { useAfterlight, type View } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";
import { PLANETS } from "@/data/planets";
import { getEquipmentCount } from "@/data/catalog-count";

const NAV: { id: View; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "explore", label: "Equipment archive" },
  { id: "games", label: "Games" },
  { id: "missions", label: "Missions" },
  { id: "discoveries", label: "Discoveries" },
  { id: "learn", label: "Learn" },
  { id: "about", label: "About" },
];

const MENU: { id: View; label: string; icon: typeof Home; blurb: string }[] = [
  { id: "home", label: "Home", icon: Home, blurb: "Your destination dashboard" },
  { id: "explore", label: "Equipment archive", icon: Compass, blurb: "Browse every machine" },
  { id: "games", label: "Games", icon: Gamepad2, blurb: "Machine Snap, quiz & landing" },
  { id: "map", label: "Planetary map", icon: Globe2, blurb: "Find hardware on the surface" },
  { id: "missions", label: "Missions", icon: Clock, blurb: "50 years of exploration" },
  { id: "discoveries", label: "Discoveries", icon: Sparkles, blurb: "What the machines found" },
  { id: "learn", label: "Learn", icon: BookOpen, blurb: "Knowledge cards & facts" },
  { id: "compare", label: "Compare", icon: GitCompare, blurb: "Two machines, side by side" },
  { id: "gallery", label: "Gallery", icon: Images, blurb: "NASA mission photography" },
  { id: "stats", label: "The numbers", icon: BarChart3, blurb: "How much is out there" },
  { id: "deepspace", label: "Deep space", icon: Rocket, blurb: "Probes that never returned" },
  { id: "students", label: "For students", icon: GraduationCap, blurb: "Your expedition log" },
  { id: "about", label: "About & sources", icon: Info, blurb: "How this was built" },
];

export function Header() {
  const { view, go, setSearchOpen, setMenuOpen, planet, setPlanet, stage, setStage, soundOn, toggleSound } =
    useAfterlight();

  const isPlanetView = view === "home" || view === "map";

  return (
    <header className="sticky top-0 z-30 px-2 pt-[max(0.5rem,env(safe-area-inset-top))] sm:px-3 md:px-5 md:pt-4">
      <div className="flex w-full flex-col gap-1.5 rounded-2xl border border-white/10 bg-[linear-gradient(120deg,rgba(5,12,26,0.92),rgba(4,9,20,0.88))] px-2.5 py-2 shadow-[0_18px_60px_-40px_#000] backdrop-blur-xl sm:px-3 md:px-5 md:py-2.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setStage("explore");
              go("home");
            }}
            className="text-action flex min-h-11 shrink-0 items-center text-left"
            aria-label="AFTERLIGHT home"
          >
            <Logo />
          </button>

          <nav className="ml-2 hidden min-w-0 items-center gap-4 xl:flex 2xl:ml-4 2xl:gap-5" aria-label="Main">
            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className="nav-link text-action"
                data-active={view === item.id}
                aria-current={view === item.id ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            {stage !== "select" && (
              <div className="hidden items-center gap-1 rounded-[0.55rem] border border-white/15 bg-abyss/70 p-1 md:flex" aria-label="Destination">
                {(["moon", "mars"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPlanet(p);
                      if (!isPlanetView) go("home");
                      useNavigation.getState().chooseArchiveDestination(p);
                    }}
                    aria-pressed={planet === p}
                    className={`min-h-11 rounded-[0.45rem] px-3 text-[0.65rem] font-bold uppercase tracking-[0.12em] transition ${
                      planet === p
                        ? p === "mars"
                          ? "border-2 border-gold/70 bg-gradient-to-b from-sand to-gold text-[#21160a]"
                          : "border-2 border-cyan/70 bg-gradient-to-b from-[#dceeff] to-[#9ec4ea] text-[#08203a]"
                        : "border-2 border-transparent text-slate-400 hover:text-white"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            <button onClick={() => setSearchOpen(true)} className="icon-btn" aria-label="Search (press /)">
              <Search size={16} />
            </button>

            <button
              onClick={() => go("stats")}
              className="hidden min-h-11 items-center gap-2 rounded-[0.55rem] border-2 border-cyan/45 bg-cyan/10 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-cyan shadow-[0_3px_0_rgba(2,16,38,0.9)] transition hover:border-cyan/80 hover:bg-cyan/20 active:translate-y-0.5 active:shadow-none sm:flex"
            >
              <BarChart3 size={14} /> Stats
            </button>

            <button onClick={() => setMenuOpen(true)} className="icon-btn" aria-label="Open menu" aria-haspopup="dialog" aria-controls="site-menu">
              <MenuIcon size={17} />
            </button>
          </div>
        </div>

        {/* mobile destination tabs */}
        <div className="grid grid-cols-[1fr_0.75fr_1.3fr_auto] items-center gap-1.5 md:hidden" aria-label="Destination and narration">
            {(["moon", "mars"] as const).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPlanet(p);
                  // A detail record belongs to one world; leave it when switching
                  // destinations so an old Mars model cannot appear under a Moon URL.
                  if (view === "deepspace" || view === "equipment") go("home");
                  useNavigation.getState().chooseArchiveDestination(p);
                }}
                aria-pressed={planet === p && view !== "deepspace"}
                className={`min-h-11 min-w-0 rounded-[0.5rem] border-2 px-1.5 py-1.5 text-[0.63rem] font-bold uppercase tracking-[0.08em] transition ${
                  planet === p && view !== "deepspace"
                    ? p === "mars"
                      ? "border-gold/80 bg-gradient-to-b from-sand to-gold text-[#21160a]"
                      : "border-cyan/70 bg-gradient-to-b from-[#dceeff] to-[#9ec4ea] text-[#08203a]"
                    : "border-white/20 bg-abyss/50 text-slate-400 hover:border-cyan/50 hover:text-white"
                }`}
              >
                {p === "mars" ? "Mars" : "The Moon"}
              </button>
            ))}
            <button
              onClick={() => go("deepspace")}
              aria-pressed={view === "deepspace"}
              className={`min-h-11 min-w-0 rounded-[0.5rem] border-2 px-1.5 py-1.5 text-[0.63rem] font-bold uppercase tracking-[0.08em] transition ${view === "deepspace" ? "border-cyan/60 bg-cyan/10 text-cyan" : "border-white/20 bg-abyss/50 text-slate-400 hover:border-cyan/50 hover:text-white"}`}
            >
              Deep space
            </button>
          <button onClick={toggleSound} className="icon-btn" aria-label={soundOn ? "Mute narration" : "Enable narration"} aria-pressed={soundOn}>
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* command palette                                                     */
/* ------------------------------------------------------------------ */
/* menu drawer                                                         */
/* ------------------------------------------------------------------ */
export function MenuDrawer() {
  const {
    menuOpen,
    setMenuOpen,
    go,
    view,
    discovered,
    storiesDone,
    factsUnlocked,
    resetProgress,
    soundOn,
    toggleSound,
    planet,
    setPlanet,
  } = useAfterlight();

  const [catalogueCount, setCatalogueCount] = useState<number | null>(null);
  const menuRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => {
      menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    }, 0);
    const keepFocusInMenu = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = menuRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex='0']");
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === menuRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", keepFocusInMenu);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", keepFocusInMenu);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || catalogueCount !== null) return;
    let active = true;
    void getEquipmentCount().then((count) => {
      if (active) setCatalogueCount(count);
    }).catch(() => {
      // The menu remains usable if the count chunk cannot be loaded.
    });
    return () => {
      active = false;
    };
  }, [menuOpen, catalogueCount]);

  const pct = catalogueCount ? Math.min(100, Math.round((discovered.length / catalogueCount) * 100)) : 0;

  return (
    <AnimatePresence>
      {menuOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setMenuOpen(false)}
        >
          <motion.aside
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
            className="absolute right-0 top-0 flex h-dvh max-h-full w-full max-w-[25rem] flex-col border-l border-cyan/20 bg-[linear-gradient(180deg,#081227,#04070f)]"
            onClick={(e) => e.stopPropagation()}
            aria-label="Site menu"
            id="site-menu"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
              <Logo compact />
              <button onClick={() => setMenuOpen(false)} className="icon-btn" aria-label="Close menu">
                <X size={17} />
              </button>
            </div>

            <div className="thin-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
              <div className="mb-4 rounded-xl border border-cyan/20 bg-deep/30 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="data text-[0.58rem] uppercase tracking-[0.2em] text-cyan/80">
                    Expedition log
                  </span>
                  <span className="data text-[0.6rem] text-slate-400">
                    {discovered.length}/{catalogueCount ?? "—"}
                  </span>
                </div>
                <ProgressBar value={pct} />
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: "Machines", value: discovered.length },
                    { label: "Stories", value: storiesDone.length },
                    { label: "Facts", value: factsUnlocked.length },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-white/8 bg-ink/40 py-1.5">
                      <div className="data text-sm text-white">{s.value}</div>
                      <div className="text-[0.6rem] uppercase tracking-[0.1em] text-slate-400">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                {(["moon", "mars"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setPlanet(p);
                      go("home");
                      useNavigation.getState().chooseArchiveDestination(p);
                    }}
                    aria-pressed={planet === p}
                    className={`rounded-xl border px-3 py-2 text-left transition ${
                      planet === p ? "border-gold/60 bg-gold/10" : "border-white/10 hover:border-cyan/40"
                    }`}
                  >
                    <div className="text-[0.58rem] uppercase tracking-[0.16em] text-slate-400">Destination</div>
                    <div className="text-sm font-semibold text-white">{PLANETS[p].name}</div>
                  </button>
                ))}
              </div>

              <nav className="space-y-1" aria-label="All views">
                {MENU.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => go(item.id)}
                      aria-current={view === item.id ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        view === item.id ? "bg-cyan/10 text-white" : "text-slate-300 hover:bg-white/5"
                      }`}
                    >
                      <Icon size={16} className={`shrink-0 ${view === item.id ? "text-cyan" : "text-slate-400"}`} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm">{item.label}</span>
                        <span className="block text-[0.68rem] leading-relaxed text-slate-400">{item.blurb}</span>
                      </span>
                      <ChevronRight size={13} className="shrink-0 text-slate-500" />
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="shrink-0 space-y-2 border-t border-white/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              <div className="flex gap-2">
                <button onClick={toggleSound} aria-pressed={soundOn} className="btn btn-ghost min-w-0 flex-1 !py-2 !text-[0.68rem]">
                  {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  {soundOn ? "Narration on" : "Narration off"}
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Reset all expedition progress on this device?")) resetProgress();
                  }}
                  className="btn btn-ghost !px-3 !py-2 !text-[0.62rem]"
                  title="Reset progress"
                  aria-label="Reset progress"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
              <p className="text-center text-[0.6rem] uppercase tracking-[0.14em] text-slate-400">
                AFTERLIGHT · Space Apps 2026
              </p>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
