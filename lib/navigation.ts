"use client";

import { create } from "zustand";
import type { EquipmentCategory, EquipmentStatus, Importance, Planet } from "@/data/types";

export type ArchiveSort = "name" | "year" | "mission";
export interface ArchiveContext {
  planets: Planet[];
  categories: EquipmentCategory[];
  statuses: EquipmentStatus[];
  importances: Importance[];
  sort: ArchiveSort;
  layout: "grid" | "list";
  q: string;
  visibleCount: number;
  filtersOpen: boolean;
}

export interface SelectionTarget { id: string; request: number }

export function createArchiveContext(planet: Planet): ArchiveContext {
  return {
    planets: [planet], categories: [], statuses: [], importances: ["iconic", "major"],
    sort: "year", layout: "grid", q: "", visibleCount: 24, filtersOpen: false,
  };
}

function filterKey(context: ArchiveContext) {
  return JSON.stringify([
    [...context.planets].sort(), [...context.categories].sort(), [...context.statuses].sort(),
    [...context.importances].sort(), context.q.trim().toLowerCase(), context.sort,
  ]);
}

interface NavigationContext {
  archive: ArchiveContext | null;
  archiveScrollY: number;
  initializeArchive: (planet: Planet) => void;
  updateArchive: (patch: Partial<ArchiveContext>) => void;
  archiveCategory: (planet: Planet, category: EquipmentCategory) => void;
  chooseArchiveDestination: (planet: Planet) => void;
  saveArchiveScroll: (top: number) => void;
  comparison: { leftId: string; rightId: string };
  setComparison: (leftId: string, rightId: string) => void;
  mapEquipmentId: string | null;
  targetMapEquipment: (id: string | null) => void;
  missionTarget: SelectionTarget | null;
  targetMission: (id: string) => void;
  consumedMissionRequest: number;
  consumeMissionRequest: (request: number) => void;
  factTarget: SelectionTarget | null;
  targetFact: (id: string) => void;
  consumedFactRequest: number;
  consumeFactRequest: (request: number) => void;
  deepSpaceTarget: SelectionTarget | null;
  targetDeepSpace: (id: string) => void;
  consumedDeepSpaceRequest: number;
  consumeDeepSpaceRequest: (request: number) => void;
}

/** Navigation context lasts for this session only; it never enters persisted progress. */
export const useNavigation = create<NavigationContext>((set) => ({
  archive: null,
  archiveScrollY: 0,
  initializeArchive: (planet) => set((state) => state.archive ? state : { archive: createArchiveContext(planet) }),
  updateArchive: (patch) => set((state) => {
    const previous = state.archive ?? createArchiveContext("mars");
    const next = { ...previous, ...patch };
    return filterKey(previous) === filterKey(next)
      ? { archive: next }
      : { archive: { ...next, visibleCount: 24 }, archiveScrollY: 0 };
  }),
  archiveCategory: (planet, category) => set((state) => ({
    archive: { ...createArchiveContext(planet), layout: state.archive?.layout ?? "grid", categories: [category], importances: [] },
    archiveScrollY: 0,
  })),
  chooseArchiveDestination: (planet) => set((state) => {
    if (!state.archive || (state.archive.planets.length === 1 && state.archive.planets[0] === planet)) return state;
    return { archive: { ...state.archive, planets: [planet], visibleCount: 24 }, archiveScrollY: 0 };
  }),
  saveArchiveScroll: (top) => set({ archiveScrollY: Math.max(0, top) }),
  comparison: { leftId: "opportunity", rightId: "curiosity" },
  setComparison: (leftId, rightId) => {
    if (leftId !== rightId) set({ comparison: { leftId, rightId } });
  },
  mapEquipmentId: null,
  targetMapEquipment: (mapEquipmentId) => set({ mapEquipmentId }),
  missionTarget: null,
  targetMission: (id) => set((state) => ({ missionTarget: { id, request: (state.missionTarget?.request ?? 0) + 1 } })),
  consumedMissionRequest: 0,
  consumeMissionRequest: (request) => set({ consumedMissionRequest: request }),
  factTarget: null,
  targetFact: (id) => set((state) => ({ factTarget: { id, request: (state.factTarget?.request ?? 0) + 1 } })),
  consumedFactRequest: 0,
  consumeFactRequest: (request) => set({ consumedFactRequest: request }),
  deepSpaceTarget: null,
  targetDeepSpace: (id) => set((state) => ({ deepSpaceTarget: { id, request: (state.deepSpaceTarget?.request ?? 0) + 1 } })),
  consumedDeepSpaceRequest: 0,
  consumeDeepSpaceRequest: (request) => set({ consumedDeepSpaceRequest: request }),
}));
