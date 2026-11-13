"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GuideLine, Planet } from "@/data/types";
import { knownFactIds } from "@/data/knowledge";
import { stopSpeech } from "@/lib/speech";

export type View =
  | "home"
  | "explore"
  | "equipment"
  | "games"
  | "map"
  | "stats"
  | "missions"
  | "discoveries"
  | "learn"
  | "about"
  | "students"
  | "compare"
  | "gallery"
  | "deepspace";

export type Stage = "intro" | "select" | "explore";
export type DetailTab =
  | "overview"
  | "record"
  | "model"
  | "story"
  | "discoveries"
  | "gallery"
  | "sources";

interface AfterlightState {
  stage: Stage;
  planet: Planet;
  view: View;
  equipmentId: string | null;
  siteId: string | null;
  detailTab: DetailTab;
  searchOpen: boolean;
  menuOpen: boolean;
  soundOn: boolean;
  guideOpen: boolean;
  guideDismissed: boolean;
  guideLine: GuideLine | null;
  /** view|equipmentId the current line was spoken for, so a reaction does not
      follow the visitor onto the next page. */
  guideCtx: string;
  guideKey: number;
  filmOpen: boolean;

  // progression (persisted)
  discovered: string[];
  storiesDone: string[];
  storyStagesVisited: Record<string, number[]>;
  factsUnlocked: string[];
  destinations: Planet[];
  filmsWatched: number;
  introSeen: boolean;
  gameStars: number;
  gamesPlayed: number;

  setStage: (s: Stage) => void;
  setPlanet: (p: Planet) => void;
  go: (v: View) => void;
  openEquipment: (id: string, tab?: DetailTab) => void;
  setDetailTab: (t: DetailTab) => void;
  setSiteId: (id: string | null) => void;
  setSearchOpen: (o: boolean) => void;
  setMenuOpen: (o: boolean) => void;
  toggleSound: () => void;
  setGuideOpen: (o: boolean) => void;
  dismissGuide: () => void;
  say: (line: GuideLine) => void;
  setFilmOpen: (o: boolean) => void;
  markDiscovered: (id: string) => void;
  markStory: (id: string) => void;
  visitStoryStage: (id: string, index: number) => void;
  unlockFact: (id: string) => void;
  addGameStars: (n: number) => void;
  visitDestination: (p: Planet) => void;
  markFilmWatched: () => void;
  completeIntro: () => void;
  resetProgress: () => void;
}

const STORAGE_KEY = "afterlight-v1";

export const useAfterlight = create<AfterlightState>()(
  persist(
    (set, get) => ({
      stage: "intro",
      planet: "mars",
      view: "home",
      equipmentId: "opportunity",
      siteId: null,
      detailTab: "overview",
      searchOpen: false,
      menuOpen: false,
      soundOn: true,
      guideOpen: true,
      guideDismissed: false,
      guideLine: null,
      guideCtx: "",
      guideKey: 0,
      filmOpen: false,

      discovered: [],
      storiesDone: [],
      storyStagesVisited: {},
      factsUnlocked: [],
      destinations: [],
      filmsWatched: 0,
      introSeen: false,
      gameStars: 0,
      gamesPlayed: 0,

      setStage: (stage) => set({ stage }),
      setPlanet: (planet) =>
        set((s) => ({
          planet,
          destinations: s.destinations.includes(planet) ? s.destinations : [...s.destinations, planet],
        })),
      go: (view) => set({ view, menuOpen: false, searchOpen: false }),
      openEquipment: (id, tab) =>
        set((s) => ({
          equipmentId: id,
          view: "equipment",
          detailTab: tab ?? "overview",
          searchOpen: false,
          menuOpen: false,
          discovered: s.discovered.includes(id) ? s.discovered : [...s.discovered, id],
        })),
      setDetailTab: (detailTab) => set({ detailTab }),
      setSiteId: (siteId) => set({ siteId }),
      setSearchOpen: (searchOpen) => set({ searchOpen }),
      setMenuOpen: (menuOpen) => set({ menuOpen }),
      toggleSound: () => {
        if (get().soundOn) stopSpeech();
        set((s) => ({ soundOn: !s.soundOn }));
      },
      setGuideOpen: (guideOpen) =>
        set((s) => ({ guideOpen, guideDismissed: guideOpen ? false : s.guideDismissed })),
      dismissGuide: () => {
        stopSpeech();
        set({ guideOpen: false, guideDismissed: true });
      },
      say: (line) => {
        const s = get();
        set({
          guideLine: line,
          guideCtx: `${s.view}|${s.equipmentId ?? ""}`,
          guideKey: s.guideKey + 1,
          guideOpen: !s.guideDismissed,
        });
      },
      setFilmOpen: (filmOpen) => set({ filmOpen }),
      markDiscovered: (id) =>
        set((s) => ({ discovered: s.discovered.includes(id) ? s.discovered : [...s.discovered, id] })),
      markStory: (id) =>
        set((s) => s.storiesDone.includes(id) ? s : { storiesDone: [...s.storiesDone, id] }),
      visitStoryStage: (id, index) =>
        set((s) => {
          if (!Number.isInteger(index) || index < 0 || index >= 6) return s;
          const visited = s.storyStagesVisited[id] ?? [];
          if (visited.includes(index)) return s;
          return { storyStagesVisited: { ...s.storyStagesVisited, [id]: [...visited, index] } };
        }),
      unlockFact: (id) => {
        const factId = knownFactIds([id])[0];
        if (!factId) return;
        set((s) => s.factsUnlocked.includes(factId) ? s : { factsUnlocked: [...s.factsUnlocked, factId] });
      },
      addGameStars: (n) =>
        set((s) => ({
          gameStars: s.gameStars + Math.max(0, n),
          gamesPlayed: s.gamesPlayed + 1,
        })),
      visitDestination: (p) =>
        set((s) => ({ destinations: s.destinations.includes(p) ? s.destinations : [...s.destinations, p] })),
      markFilmWatched: () => set((s) => ({ filmsWatched: s.filmsWatched + 1, introSeen: true })),
      completeIntro: () => set({ introSeen: true, stage: "select" }),
      resetProgress: () =>
        set({
          discovered: [],
          storiesDone: [],
          storyStagesVisited: {},
          factsUnlocked: [],
          destinations: [],
          filmsWatched: 0,
          introSeen: false,
          gameStars: 0,
          gamesPlayed: 0,
        }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => {
        // Next prerenders client components in Node. Avoid touching Node's
        // experimental global localStorage during that server render.
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => undefined,
            removeItem: () => undefined,
          };
        }
        return window.localStorage;
      }),
      partialize: (s) => ({
        discovered: s.discovered,
        storiesDone: s.storiesDone,
        storyStagesVisited: s.storyStagesVisited,
        factsUnlocked: s.factsUnlocked,
        destinations: s.destinations,
        filmsWatched: s.filmsWatched,
        introSeen: s.introSeen,
        soundOn: s.soundOn,
        planet: s.planet,
        gameStars: s.gameStars,
        gamesPlayed: s.gamesPlayed,
      }),
      merge: (persisted, current) => {
        const saved = persisted as Partial<AfterlightState> | undefined;
        const savedVisits = saved?.storyStagesVisited ?? current.storyStagesVisited;
        return {
          ...current,
          ...saved,
          factsUnlocked: knownFactIds(Array.isArray(saved?.factsUnlocked) ? saved.factsUnlocked : current.factsUnlocked),
          storyStagesVisited: Object.fromEntries(Object.entries(savedVisits).map(([id, visits]) => [
            id,
            Array.isArray(visits) ? Array.from(new Set(visits.filter((index) => Number.isInteger(index) && index >= 0 && index < 6))) : [],
          ])),
          guideDismissed: current.guideDismissed,
        };
      },
    },
  ),
);
