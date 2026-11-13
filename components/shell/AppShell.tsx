"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { Header, MenuDrawer } from "./Navigation";
import MobileNav from "./MobileNav";
import Footer from "./Footer";
import GuideDock from "@/components/guide/GuideDock";
import BootScreen from "./BootScreen";
import IntroSequence from "@/components/intro/IntroSequence";
import DestinationSelect from "@/components/select/DestinationSelect";
import StarfieldBackdrop from "@/components/three/StarfieldBackdrop";
import { useAfterlight, type View } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";
import { PLANETS } from "@/data/planets";
import type { Planet } from "@/data/types";

const VIEWS: Record<View, React.ComponentType> = {
  home: dynamic(() => import("@/components/views/HomeView")),
  explore: dynamic(() => import("@/components/views/ExploreView")),
  equipment: dynamic(() => import("@/components/views/EquipmentDetailView")),
  games: dynamic(() => import("@/components/views/GamesView")),
  map: dynamic(() => import("@/components/views/MapView")),
  stats: dynamic(() => import("@/components/views/StatsView")),
  missions: dynamic(() => import("@/components/views/MissionsView")),
  discoveries: dynamic(() => import("@/components/views/DiscoveriesView")),
  learn: dynamic(() => import("@/components/views/LearnView")),
  students: dynamic(() => import("@/components/views/StudentsView")),
  compare: dynamic(() => import("@/components/views/CompareView")),
  gallery: dynamic(() => import("@/components/views/GalleryView")),
  about: dynamic(() => import("@/components/views/AboutView")),
  deepspace: dynamic(() => import("@/components/views/DeepSpaceView")),
};

const ALL_VIEWS = new Set(Object.keys(VIEWS));
const SearchPalette = dynamic(() => import("./SearchPalette").then((module) => module.SearchPalette), { ssr: false });

function preloadImage(url: string) {
  return new Promise<void>((resolve, reject) => {
    const image = new Image();
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      image.onload = null;
      image.onerror = null;
      if (error) reject(error);
      else resolve();
    };
    const onLoad = () => {
      if (image.naturalWidth > 0) finish();
      else finish(new Error(`Destination texture could not be loaded: ${url}`));
    };
    image.onload = onLoad;
    image.onerror = () => finish(new Error(`Destination texture could not be loaded: ${url}`));
    image.src = url;
    if (image.complete) onLoad();
  });
}

export default function AppShell() {
  const {
    stage,
    view,
    planet,
    equipmentId,
    setStage,
    go,
    setPlanet,
    openEquipment,
    setSearchOpen,
    setMenuOpen,
    menuOpen,
    searchOpen,
    markFilmWatched,
  } = useAfterlight();
  const [mounted, setMounted] = useState(false);
  const [booted, setBooted] = useState(false);
  const [preparingDestination, setPreparingDestination] = useState(false);
  const bootstrapped = useRef(false);
  const destinationPending = useRef(false);
  const destinationTexturesReady = useRef(false);
  const loaderEntranceReady = useRef(false);
  const lastPlanet = useRef(planet);
  const [washing, setWashing] = useState<Planet | null>(null);

  const finishDestinationSelection = useCallback(() => {
    if (!destinationPending.current || !destinationTexturesReady.current || !loaderEntranceReady.current) return;
    markFilmWatched();
    setStage("select");
    destinationPending.current = false;
    setPreparingDestination(false);
  }, [markFilmWatched, setStage]);

  const onBootEntranceComplete = useCallback(() => {
    loaderEntranceReady.current = true;
    finishDestinationSelection();
  }, [finishDestinationSelection]);

  const startDestinationSelection = useCallback(async () => {
    if (destinationPending.current) return;
    destinationPending.current = true;
    destinationTexturesReady.current = false;
    loaderEntranceReady.current = false;
    setPreparingDestination(true);
    try {
      await Promise.all([preloadImage(PLANETS.moon.texture), preloadImage(PLANETS.mars.texture)]);
      destinationTexturesReady.current = true;
      finishDestinationSelection();
    } catch (error) {
      console.error("Unable to prepare the destination selection textures.", error);
      destinationPending.current = false;
      setPreparingDestination(false);
    }
  }, [finishDestinationSelection]);

  // avoid hydration mismatch from persisted state, and hold the boot screen long
  // enough to read instead of letting it flash for one frame
  useEffect(() => {
    setMounted(true);
    const timer = window.setTimeout(() => setBooted(true), 620);
    return () => window.clearTimeout(timer);
  }, []);

  /** Turns a URL hash (#/mars/explore, #/moon/equipment/id, #/select) into app state. */
  const applyHash = useCallback(
    (raw: string) => {
      const hash = raw.replace(/^#\/?/, "");
      if (!hash) return;
      const [p, v, id] = hash.split("/");
      if (p === "select") {
        setStage("select");
        return;
      }
      if ((p === "moon" || p === "mars") && v === "equipment") {
        const openHashArchive = () => {
          if (window.location.hash !== raw) return;
          window.history.replaceState(null, "", `#/${p}/explore`);
          setPlanet(p);
          setStage("explore");
          go("explore");
          useNavigation.getState().chooseArchiveDestination(p);
        };
        if (!id) { openHashArchive(); return; }
        // The record determines its world, even when an old/malformed hash names
        // another world. Replace that hash so Back does not enter a correction loop.
        void import("@/data/equipment")
          .then(({ getEquipment }) => {
            if (window.location.hash !== raw) return;
            const record = getEquipment(id);
            if (!record) { openHashArchive(); return; }
            const canonical = `#/${record.planet}/equipment/${record.id}`;
            if (window.location.hash !== canonical) window.history.replaceState(null, "", canonical);
            setPlanet(record.planet);
            setStage("explore");
            openEquipment(record.id, "overview");
          })
          .catch(openHashArchive);
        return;
      }
      if (p === "moon" || p === "mars") {
        setPlanet(p);
        setStage("explore");
      }
      if (v && ALL_VIEWS.has(v as View)) {
        setStage("explore");
        go(v as View);
      }
    },
    [setPlanet, setStage, go, openEquipment],
  );

  // restore location from the URL once
  useEffect(() => {
    if (!mounted || bootstrapped.current) return;
    bootstrapped.current = true;
    applyHash(window.location.hash);
  }, [mounted, applyHash]);

  // browser back / forward should move through the expedition, not reload it
  useEffect(() => {
    const onPop = () => applyHash(window.location.hash);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [applyHash]);

  // keep the URL in sync, pushing a history entry so Back works
  useEffect(() => {
    if (!mounted || stage === "intro") return;
    const base = stage === "select" ? "#/select" : `#/${planet}/${view}${view === "equipment" && equipmentId ? `/${equipmentId}` : ""}`;
    if (window.location.hash !== base) {
      window.history.pushState(null, "", base);
    }
  }, [mounted, stage, planet, view, equipmentId]);

  // Warm only the chosen world after the introduction. Building both full
  // terrain sets while the guide is speaking competes with the visible scene.
  useEffect(() => {
    if (!booted || stage !== "select") return;
    const warm = () => {
      void import("@/components/three/HeroScene").then((m) => m.prewarmHero(planet));
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(warm, { timeout: 5000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(warm, 1800);
    return () => window.clearTimeout(timer);
  }, [booted, stage, planet]);

  // a soft planetary wash marks the change of world; it is deliberately short
  // and light, because the view itself now stays mounted and swaps in place
  useEffect(() => {
    if (lastPlanet.current === planet) return;
    lastPlanet.current = planet;
    setWashing(planet);
    const timer = window.setTimeout(() => setWashing(null), 320);
    return () => window.clearTimeout(timer);
  }, [planet]);

  // scroll to top when the view changes
  useEffect(() => {
    // ExploreView restores its own saved position once its cards are mounted.
    if (view === "explore" && stage === "explore") return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [view, equipmentId, stage]);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    // Zustand subscribers run at navigation time, before React's exit animation
    // and scroll reset. Saving during view unmount would capture the reset instead.
    const unsubscribe = useAfterlight.subscribe((next, previous) => {
      if (previous.stage === "explore" && previous.view === "explore" &&
          (next.view !== "explore" || next.stage !== "explore")) {
        useNavigation.getState().saveArchiveScroll(window.scrollY);
      }
    });
    return () => {
      unsubscribe();
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  // global shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const target = e.target as HTMLElement | null;
      const overlays = useAfterlight.getState();
      if (target?.closest('[aria-modal="true"]') && !overlays.menuOpen && !overlays.searchOpen) return;
      const typing =
        target && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable);
      if (!typing && ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/")) {
        e.preventDefault();
        setMenuOpen(false);
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        const overlays = useAfterlight.getState();
        if (overlays.searchOpen || overlays.menuOpen) e.preventDefault();
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen, setMenuOpen]);

  if (!mounted || !booted || preparingDestination) {
    return <BootScreen onEntranceComplete={preparingDestination ? onBootEntranceComplete : undefined} />;
  }

  if (stage === "intro") {
    return (
      <>
        <IntroSequence onChooseDestination={startDestinationSelection} />
        {searchOpen && <SearchPalette />}
      </>
    );
  }

  if (stage === "select") {
    return (
      <>
        <DestinationSelect />
        {searchOpen && <SearchPalette />}
      </>
    );
  }

  const ViewComponent = VIEWS[view];

  return (
    <>
      <StarfieldBackdrop />
      <Header />
      <main className="w-full pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          {/* keyed by view, never by planet: changing world re-renders the same
              tree, so the WebGL context is not torn down and rebuilt */}
          <motion.div
            key={`${view}-${view === "equipment" ? equipmentId : ""}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <ViewComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
      <GuideDock />
      <MobileNav />
      <AnimatePresence>
        {washing && (
          <motion.div
            key={washing}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
            className="pointer-events-none fixed inset-0 z-40"
            style={{
              background:
                washing === "mars"
                  ? "radial-gradient(120% 90% at 50% 55%, rgba(255,140,70,0.34), rgba(10,4,2,0.9) 62%)"
                  : "radial-gradient(120% 90% at 50% 55%, rgba(140,200,255,0.3), rgba(3,6,14,0.92) 62%)",
            }}
          />
        )}
      </AnimatePresence>
      {searchOpen && <SearchPalette />}
      <MenuDrawer />
      {menuOpen && <div className="sr-only">Menu open</div>}
    </>
  );
}
