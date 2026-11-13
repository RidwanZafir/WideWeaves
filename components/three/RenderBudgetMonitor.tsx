"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export type FrameBudgetSample = { meanMs: number; slowFrameRatio: number; frames: number };

/** Sample actual rendered frames after assets/transitions settle. */
export default function RenderBudgetMonitor({
  enabled,
  onSlowFrames,
  onSample,
  resetKey,
}: {
  enabled: boolean;
  onSlowFrames: () => void;
  onSample?: (sample: FrameBudgetSample | null) => void;
  resetKey?: string;
}) {
  const sample = useRef({ settled: 0, seconds: 0, frames: 0, slowFrames: 0, slowWindows: 0, stallGraceUsed: false });
  useEffect(() => {
    sample.current = { settled: 0, seconds: 0, frames: 0, slowFrames: 0, slowWindows: 0, stallGraceUsed: false };
    onSample?.(null);
  }, [enabled, onSlowFrames, onSample, resetKey]);

  useFrame((_, delta) => {
    if (!enabled || delta <= 0) return;
    const state = sample.current;
    // Give one loading/resume stall a grace reset per visibility/quality period.
    // Further long frames must count, including alternating slow/healthy frames.
    if (delta > 0.25 && !state.stallGraceUsed) {
      state.settled = state.seconds = state.frames = state.slowFrames = state.slowWindows = 0;
      state.stallGraceUsed = true;
      onSample?.(null);
      return;
    }
    state.settled += delta;
    if (state.settled < 3) return;
    state.seconds += delta;
    state.frames += 1;
    if (delta > 1 / 30) state.slowFrames += 1;
    if (state.seconds < 2 || state.frames < 30) return;
    const mean = state.seconds / state.frames;
    const slowFrameRatio = state.slowFrames / state.frames;
    onSample?.({ meanMs: mean * 1000, slowFrameRatio, frames: state.frames });
    const slow = mean > 0.028 || slowFrameRatio > 0.25;
    state.slowWindows = slow ? state.slowWindows + 1 : 0;
    state.seconds = state.frames = state.slowFrames = 0;
    if (state.slowWindows >= 2) {
      state.slowWindows = 0;
      onSlowFrames();
    }
  });
  return null;
}
