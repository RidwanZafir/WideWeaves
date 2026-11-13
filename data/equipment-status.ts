import type { EquipmentStatus } from "./types";

// Shared presentation tokens stay separate from the dynamically loaded archive.
export const STATUS_LABEL: Record<EquipmentStatus, string> = {
  active: "Still operating",
  inactive: "Inactive / silent",
  destroyed: "Destroyed",
  unknown: "Uncertain",
};

export const STATUS_TONE: Record<EquipmentStatus, string> = {
  active: "text-emerald-300 border-emerald-400/40 bg-emerald-400/10",
  inactive: "text-amber-200 border-amber-400/40 bg-amber-400/10",
  destroyed: "text-rose-300 border-rose-400/40 bg-rose-400/10",
  unknown: "text-slate-300 border-slate-400/40 bg-slate-400/10",
};
