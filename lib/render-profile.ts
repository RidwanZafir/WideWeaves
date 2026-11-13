"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type RenderQuality = "performance" | "balanced" | "high";

export type RenderProfile = {
  quality: RenderQuality;
  compact: boolean;
  reducedMotion: boolean;
  dprMax: number;
  shadows: boolean;
  shadowMapSize: 1024 | 2048;
  terrainSegments: 96 | 160 | 256;
  sphereSegments: 48 | 80 | 128;
  sphereRings: 32 | 56 | 96;
  rockDetail: 1 | 2 | 4;
  starScale: number;
};

const BUDGETS = {
  performance: { dprMax: 1, shadowMapSize: 1024, terrainSegments: 96, sphereSegments: 48, sphereRings: 32, rockDetail: 1, starScale: 0.55 },
  balanced: { dprMax: 1.3, shadowMapSize: 1024, terrainSegments: 160, sphereSegments: 80, sphereRings: 56, rockDetail: 2, starScale: 0.8 },
  high: { dprMax: 1.6, shadowMapSize: 2048, terrainSegments: 256, sphereSegments: 128, sphereRings: 96, rockDetail: 4, starScale: 1 },
} as const;

/** Unknown memory stays conservative without treating it as a measured limit. */
export function renderProfileFor({
  compact,
  reducedMotion,
  memory,
  cores,
}: {
  compact: boolean;
  reducedMotion: boolean;
  memory?: number;
  cores?: number;
}): RenderProfile {
  const concurrency = cores ?? 4;
  const quality: RenderQuality = compact || reducedMotion || concurrency <= 4 || (memory !== undefined && memory <= 4)
    ? "performance"
    : memory !== undefined && memory >= 8 && concurrency >= 8
      ? "high"
      : "balanced";
  return { quality, compact, reducedMotion, ...BUDGETS[quality], shadows: quality !== "performance" };
}

/** One policy for the cinematic root and reusable canvases; SSR-safe defaults. */
export function useRenderProfile(): RenderProfile {
  const [profile, setProfile] = useState<RenderProfile>(() => renderProfileFor({ compact: false, reducedMotion: false, cores: 6 }));

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 767px), (pointer: coarse)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setProfile(renderProfileFor({
      compact: compactQuery.matches,
      reducedMotion: motionQuery.matches,
      memory: (navigator as Navigator & { deviceMemory?: number }).deviceMemory,
      cores: navigator.hardwareConcurrency,
    }));
    sync();
    compactQuery.addEventListener("change", sync);
    motionQuery.addEventListener("change", sync);
    return () => {
      compactQuery.removeEventListener("change", sync);
      motionQuery.removeEventListener("change", sync);
    };
  }, []);

  return profile;
}

/** Measured slow frames can lower the device budget; it never oscillates up. */
export function useAdaptiveRenderProfile(): [RenderProfile, () => void] {
  const device = useRenderProfile();
  const [ceiling, setCeiling] = useState<RenderQuality>("high");
  const ranks: Record<RenderQuality, number> = { performance: 0, balanced: 1, high: 2 };
  const quality = ranks[device.quality] < ranks[ceiling] ? device.quality : ceiling;
  const lowerQuality = useCallback(() => {
    if (quality === "high") setCeiling("balanced");
    else if (quality === "balanced") setCeiling("performance");
  }, [quality]);
  const profile = useMemo(() => ({ ...device, quality, ...BUDGETS[quality], shadows: quality !== "performance" }), [device, quality]);
  return [profile, lowerQuality];
}
