"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { BACKDROP_LAYERS, Starfield, scaleLayers, useReducedMotion } from "./Starfield";
import { supportsWebGL } from "@/lib/webgl";

/**
 * The sky is decorative, so it does not need 60 frames a second: a slow loop
 * that renders on demand keeps the twinkle smooth and the GPU idle. When the
 * tab is hidden, requestAnimationFrame parks the loop on its own.
 */
function SlowLoop({ fps }: { fps: number }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    const step = 1000 / fps;
    const tick = (now: number) => {
      if (now - last >= step) {
        last = now;
        invalidate();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [invalidate, fps]);
  return null;
}

/**
 * The deep-space sky that sits behind the whole app. One fixed, non-interactive
 * canvas (pointer-events: none) so it never blocks a button or a 3D model, and
 * it is mounted once by AppShell rather than per view.
 */
export default function StarfieldBackdrop() {
  const reduced = useReducedMotion();
  const [supported, setSupported] = useState<boolean | null>(null);
  const [compact, setCompact] = useState(false);
  const pointer = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setSupported(supportsWebGL());
    const mq = window.matchMedia?.("(max-width: 767px), (pointer: coarse)");
    if (!mq) return;
    setCompact(mq.matches);
    const onChange = () => setCompact(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  // the canvas cannot receive pointer events (it sits behind the UI), so the
  // window feeds the parallax instead
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  const getPointer = useCallback(() => pointer.current, []);
  // a stable array, otherwise every render rebuilds the star geometry
  const layers = useMemo(
    () => (compact ? scaleLayers(BACKDROP_LAYERS, 0.5) : BACKDROP_LAYERS),
    [compact],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#020817]"
    >
      {supported ? (
        <Canvas
          className="!absolute inset-0"
          style={{ pointerEvents: "none" }}
          dpr={compact ? [1, 1] : [1, 1.25]}
          frameloop="demand"
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 0, 4], fov: 52, near: 0.1, far: 600 }}
        >
          <color attach="background" args={["#020817"]} />
          <Starfield layers={layers} animate getPointer={getPointer} />
          {/* the sky twinkles even under reduced motion — just slower — so the
              loop always has to run or the canvas freezes on one frame */}
          <SlowLoop fps={reduced ? 20 : compact ? 24 : 30} />
        </Canvas>
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_-10%,#071a36_0%,#041329_46%,#020817_100%)]" />
      )}

      {/* blue atmospheric blooms — kept light so they tint the sky instead of
          veiling the stars */}
      <div className="absolute -left-[22rem] top-[-14%] h-[52rem] w-[52rem] rounded-full bg-[radial-gradient(circle,rgba(28,92,196,0.16),transparent_66%)] blur-3xl" />
      <div className="absolute -right-[20rem] top-[26%] h-[44rem] w-[44rem] rounded-full bg-[radial-gradient(circle,rgba(18,60,124,0.2),transparent_68%)] blur-3xl" />
      <div className="absolute bottom-[-18%] left-1/2 h-[38rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(31,96,180,0.1),transparent_70%)] blur-3xl" />

      {/* vignette keeps the corners deep so the stars never fight the UI */}
      <div className="absolute inset-0 bg-[radial-gradient(125%_105%_at_50%_4%,transparent_46%,rgba(2,8,23,0.5)_100%)]" />
    </div>
  );
}
