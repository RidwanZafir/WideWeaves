"use client";

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { supportsWebGL } from "@/lib/webgl";
import { useAdaptiveRenderProfile } from "@/lib/render-profile";
import RenderBudgetMonitor, { type FrameBudgetSample } from "./RenderBudgetMonitor";

// A successful probe cannot guarantee that a later renderer or model will load.
// Keep the photograph and written record available if the canvas throws.
class SceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * A lazily-mounted, WebGL-checked, reduced-motion-aware canvas wrapper.
 * When 3D is unavailable the children are replaced by the fallback content,
 * so the scientific information is never lost.
 */
export default function Scene3D({
  children,
  className,
  fallback,
  cameraPosition = [0, 2, 6],
  fov = 42,
  dpr = [1, 1.7],
  shadows = true,
  background,
  alwaysRender = false,
}: {
  children: ReactNode;
  className?: string;
  fallback?: ReactNode;
  cameraPosition?: [number, number, number];
  fov?: number;
  dpr?: [number, number];
  shadows?: boolean;
  background?: string;
  alwaysRender?: boolean;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(alwaysRender);
  const [active, setActive] = useState(alwaysRender);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [profile, lowerQuality] = useAdaptiveRenderProfile();
  const [lastSample, setLastSample] = useState<FrameBudgetSample | null>(null);

  useEffect(() => {
    setSupported(supportsWebGL());
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const ceiling = Math.min(dpr[1], profile.dprMax);
  const renderDpr: [number, number] = [Math.min(dpr[0], ceiling), ceiling];

  useEffect(() => {
    if (!hostRef.current) return;
    const el = hostRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.isIntersecting && entry.intersectionRatio > 0;
          if (visible) setInView(true);
          setActive(visible);
        }
      },
      { rootMargin: "220px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      data-render-quality={profile.quality}
      data-render-sample-ms={lastSample?.meanMs.toFixed(2)}
      data-render-slow-ratio={lastSample?.slowFrameRatio.toFixed(3)}
      style={{ position: className?.includes("absolute") ? undefined : "relative" }}
    >
      {supported === false ? (
        <div className="absolute inset-0">{fallback}</div>
      ) : supported === null || !inView ? (
        <div data-cursor="loading" className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3 opacity-70">
            <span className="h-10 w-10 animate-spin rounded-full border-2 border-cyan/30 border-t-cyan" />
            <span className="data text-[0.75rem] uppercase tracking-[0.16em] text-cyan/85">
              Loading 3D scene
            </span>
          </div>
        </div>
      ) : (
        <SceneBoundary fallback={<div className="absolute inset-0">{fallback}</div>}>
          <Canvas
            fallback={<div className="absolute inset-0">{fallback}</div>}
            shadows={shadows && profile.shadows ? { type: THREE.PCFShadowMap } : false}
            dpr={renderDpr}
            frameloop={active && pageVisible ? "always" : "demand"}
            gl={{ antialias: true, powerPreference: "high-performance", alpha: !background }}
            camera={{ position: cameraPosition, fov, near: 0.1, far: 400 }}
            onCreated={({ gl, scene }) => {
              gl.toneMapping = THREE.ACESFilmicToneMapping;
              gl.toneMappingExposure = 1.05;
              if (background) {
                scene.background = new THREE.Color(background);
              }
            }}
          >
            <RenderBudgetMonitor enabled={active && pageVisible} onSlowFrames={lowerQuality} onSample={setLastSample} />
            {children}
          </Canvas>
        </SceneBoundary>
      )}
    </div>
  );
}
