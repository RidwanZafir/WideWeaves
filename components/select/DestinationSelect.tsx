"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFrame } from "@react-three/fiber";
import { Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { ArrowRight, Compass, Info, Rocket, Sparkles } from "lucide-react";
import Scene3D from "@/components/three/Scene3D";
import { Logo } from "@/components/ui/Atoms";
import { PLANETS } from "@/data/planets";
import { MOON_COUNT, MARS_COUNT } from "@/data/equipment";
import { useAfterlight } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";
import type { Planet } from "@/data/types";

function SelectablePlanet({
  planet,
  position,
  radius,
  hovered,
  onHover,
  onSelect,
}: {
  planet: Planet;
  position: [number, number, number];
  radius: number;
  hovered: boolean;
  onHover: (p: Planet | null) => void;
  onSelect: (p: Planet) => void;
}) {
  const meta = PLANETS[planet];
  const tex = useTexture(meta.texture);
  const mesh = useRef<THREE.Mesh>(null);
  const group = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (mesh.current) mesh.current.rotation.y += dt * (hovered ? 0.24 : 0.08);
    if (group.current) {
      const target = hovered ? 1.12 : 1;
      group.current.scale.x = THREE.MathUtils.damp(group.current.scale.x, target, 4, dt);
      group.current.scale.y = THREE.MathUtils.damp(group.current.scale.y, target, 4, dt);
      group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, target, 4, dt);
      group.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 0.6 + position[0]) * 0.12;
    }
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(planet);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onHover(null);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(planet);
      }}
    >
      <mesh ref={mesh} castShadow>
        <sphereGeometry args={[radius, 96, 96]} />
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0.02} />
      </mesh>
      {/* atmosphere */}
      <mesh scale={1.045}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshBasicMaterial
          color={planet === "mars" ? "#ff8a4c" : "#a9d6ff"}
          transparent
          opacity={hovered ? 0.22 : 0.12}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* selection ring */}
      <mesh rotation={[Math.PI / 2.2, 0.3, 0]} visible={hovered}>
        <torusGeometry args={[radius * 1.32, 0.012, 8, 120]} />
        <meshBasicMaterial color={planet === "mars" ? "#ffc93c" : "#8fdcff"} transparent opacity={0.75} />
      </mesh>
      <pointLight
        position={[0, 0, radius * 1.6]}
        intensity={hovered ? 26 : 10}
        color={planet === "mars" ? "#ff9a5c" : "#9fd0ff"}
        distance={radius * 3}
      />
    </group>
  );
}

function CameraRig({ focus }: { focus: Planet | null }) {
  useFrame((state, dt) => {
    const target = focus === "moon" ? -3.2 : focus === "mars" ? 3.2 : 0;
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, target * 0.28 + state.pointer.x * 0.6, 1.6, dt);
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, focus ? 12.2 : 13.6, 1.6, dt);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, 0.3 + state.pointer.y * 0.4, 1.6, dt);
    state.camera.lookAt(0, 0.2, 0);
  });
  return null;
}

export default function DestinationSelect() {
  const { setPlanet, setStage, go, visitDestination, say, markFilmWatched } = useAfterlight();
  const [hovered, setHovered] = useState<Planet | null>(null);
  const [travel, setTravel] = useState<Planet | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current);
  }, []);

  const choose = (planet: Planet) => {
    if (travel) return;
    useNavigation.getState().chooseArchiveDestination(planet);
    setTravel(planet);
    setPlanet(planet);
    visitDestination(planet);
    timer.current = window.setTimeout(() => {
      setStage("explore");
      go("home");
      // spoken after the hop so the greeting belongs to the home view
      speakArrival(planet);
      setTravel(null);
    }, 1900);
  };

  const speakArrival = (planet: Planet) => {
    say({
      text:
        planet === "mars"
          ? "Brace yourself — dust storms, thin air, and a lot of very stubborn robots. Welcome to Mars!"
          : "No air, no sound, and footprints that will last forever. Welcome to the Moon!",
      expression: "wow",
      pose: "point",
    });
  };

  return (
    <div className="fixed inset-0 overflow-x-hidden overflow-y-auto overscroll-contain bg-ink">
      {/* the scene is dropped while transiting so the overlay gets the whole GPU */}
      {!travel && (
      <div className="fixed inset-0">
      <Scene3D
        className="absolute inset-0"
        alwaysRender
        cameraPosition={[0, 0.3, 13.6]}
        fov={44}
        dpr={[1, 1.6]}
        fallback={
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#0e2444,#03060e_70%)]" />
        }
      >
        <color attach="background" args={["#02040b"]} />
        <fog attach="fog" args={["#02040b", 18, 40]} />
        <ambientLight intensity={0.32} color="#9dc0ff" />
        <directionalLight position={[7, 5, 8]} intensity={2.6} color="#ffe3c2" />
        <directionalLight position={[-8, -2, 4]} intensity={1.1} color="#3f7dff" />

        <Suspense fallback={null}>
          <Stars radius={100} depth={60} count={4200} factor={4.4} saturation={0} fade speed={0.4} />
          <SelectablePlanet
            planet="moon"
            position={[-4.4, 0.1, 0]}
            radius={2.55}
            hovered={hovered === "moon"}
            onHover={setHovered}
            onSelect={choose}
          />
          <SelectablePlanet
            planet="mars"
            position={[4.4, 0.1, 0]}
            radius={2.75}
            hovered={hovered === "mars"}
            onHover={setHovered}
            onSelect={choose}
          />
          <CameraRig focus={hovered} />
        </Suspense>
      </Scene3D>
      </div>
      )}

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(120%_90%_at_50%_40%,transparent_40%,rgba(2,4,11,0.85)_100%)]" />

      <div className="pointer-events-none relative z-10 flex min-h-full flex-col">
      {/* top */}
      <div className="pointer-events-auto relative z-10 flex flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5 md:px-10">
        <Logo />
        <div className="flex items-center gap-3">
          <span className="hidden text-[0.6rem] uppercase tracking-[0.24em] text-slate-500 sm:block">
            Step 04 · choose a destination
          </span>
          <button
            onClick={() => {
              markFilmWatched();
              setStage("intro");
            }}
            className="btn btn-ghost !px-3.5 !py-2 !text-[0.6rem]"
          >
            Replay intro
          </button>
        </div>
      </div>

      <div className="relative z-10 w-full px-4 py-2 text-center sm:px-5 md:px-10">
        <span className="eyebrow">Two worlds · one shared history</span>
        <h2 className="display mx-auto mt-2 max-w-3xl text-[2rem] leading-[1] text-white sm:text-4xl lg:text-5xl">
          WHERE DO YOU WANT TO <span className="text-gradient-mars">EXPLORE?</span>
        </h2>
      </div>

      {/* destination cards */}
      <div className="pointer-events-auto relative z-10 mt-auto px-4 pt-8 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pt-[clamp(2rem,12dvh,8rem)] md:px-10 md:pb-8">
        <div className="grid w-full gap-3 sm:grid-cols-2">
          {(["moon", "mars"] as const).map((planet) => {
            const meta = PLANETS[planet];
            const count = planet === "moon" ? MOON_COUNT : MARS_COUNT;
            const active = hovered === planet;
            return (
              <motion.button
                key={planet}
                onMouseEnter={() => setHovered(planet)}
                onMouseLeave={() => setHovered(null)}
                onClick={() => choose(planet)}
                whileHover={{ y: -4 }}
                className={`group relative overflow-hidden rounded-2xl border p-4 text-left backdrop-blur-xl transition-colors md:p-5 ${
                  active
                    ? planet === "mars"
                      ? "border-gold/70 bg-[linear-gradient(150deg,rgba(58,24,8,0.9),rgba(8,12,24,0.92))]"
                      : "border-cyan/70 bg-[linear-gradient(150deg,rgba(12,32,62,0.92),rgba(8,12,24,0.92))]"
                    : "border-white/12 bg-[linear-gradient(150deg,rgba(10,22,44,0.8),rgba(2,5,12,0.9))]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="data text-[0.56rem] uppercase tracking-[0.24em] text-cyan/70">
                        {planet === "moon" ? "01 · Lunar" : "02 · Martian"}
                      </span>
                      <Sparkles size={11} className="text-gold/70" />
                    </div>
                    <h3 className="display mt-1 text-2xl text-white md:text-3xl">{meta.name}</h3>
                    <p className="mt-1 max-w-xs text-[0.75rem] leading-relaxed text-slate-400">
                      {meta.subtitle}
                    </p>
                  </div>
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${
                      active
                        ? "border-gold/70 bg-gold/15 text-gold"
                        : "border-cyan/30 bg-cyan/5 text-cyan"
                    }`}
                  >
                    <ArrowRight size={16} />
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="chip max-w-full !cursor-default !whitespace-normal">{meta.catalogued}</span>
                  <span className="chip max-w-full !cursor-default !whitespace-normal">{meta.missions}</span>
                  <span className="chip max-w-full !cursor-default !whitespace-normal">{count} in-depth profiles</span>
                </div>

                <div className="mt-4 hidden grid-cols-2 gap-x-4 gap-y-1 border-t border-white/8 pt-3 sm:grid">
                  {meta.facts.slice(0, 2).map((f) => (
                    <div key={f.label}>
                      <div className="text-[0.52rem] uppercase tracking-[0.16em] text-slate-500">{f.label}</div>
                      <div className="text-[0.68rem] text-slate-200">{f.value}</div>
                    </div>
                  ))}
                </div>

                <span
                  className={`pointer-events-none absolute inset-x-0 -bottom-px h-px ${
                    active ? "bg-gradient-to-r from-transparent via-gold to-transparent" : "bg-transparent"
                  }`}
                />
              </motion.button>
            );
          })}
        </div>

        <div className="mt-3 flex w-full flex-wrap items-center justify-between gap-2">
          <button
            onClick={() => {
              setStage("explore");
              go("deepspace");
            }}
            className="flex min-h-11 max-w-full items-center gap-2 rounded-[0.55rem] border-2 border-white/15 bg-abyss/70 px-4 py-2 text-left text-[0.62rem] font-bold uppercase tracking-[0.16em] text-slate-200 shadow-[0_3px_0_rgba(2,16,38,0.9)] transition hover:border-cyan/60 hover:text-white active:translate-y-0.5 active:shadow-none"
          >
            <Rocket size={12} className="shrink-0" /> 03 · Deep space — probes still travelling
          </button>
          <button
            onClick={() => {
              setStage("explore");
              go("home");
            }}
            className="text-action flex min-h-11 items-center gap-1.5 text-left text-[0.6rem] uppercase tracking-[0.16em] text-slate-500 transition hover:text-cyan"
          >
            <Compass size={12} className="shrink-0" /> Resume last expedition
          </button>
        </div>
      </div>
      </div>

      {/* travel transition */}
      <AnimatePresence>
        {travel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-ink"
          >
            {/* the approach disc: a plain gradient, no blur filter — blurring a
                60vmin layer every frame was the source of the stutter */}
            <motion.div
              initial={{ scale: 0.35, opacity: 0 }}
              animate={{ scale: 2.4, opacity: 1 }}
              transition={{ duration: 1.7, ease: [0.4, 0, 0.2, 1] }}
              className="absolute h-[62vmin] w-[62vmin] rounded-full"
              style={{
                background:
                  travel === "mars"
                    ? "radial-gradient(circle, rgba(255,186,132,0.95) 0%, rgba(168,58,18,0.55) 42%, rgba(20,8,4,0) 72%)"
                    : "radial-gradient(circle, rgba(226,240,255,0.95) 0%, rgba(47,111,176,0.5) 45%, rgba(3,8,16,0) 74%)",
                willChange: "transform, opacity",
              }}
            />
            {/* Warp dashes: short segments thrown outward around the disc. They are
                deliberately not full-length radial rules — a line running from the
                centre out reads as a stray divider across the headline, and at 0°
                it sat exactly on the subtitle. */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                maskImage: "radial-gradient(circle at 50% 50%, transparent 18%, #000 34%, #000 76%, transparent 94%)",
                WebkitMaskImage:
                  "radial-gradient(circle at 50% 50%, transparent 18%, #000 34%, #000 76%, transparent 94%)",
              }}
            >
              {Array.from({ length: 20 }).map((_, i) => {
                const angle = (i / 20) * 360 + 7;
                const radius = 24 + (i % 3) * 6;
                return (
                  <span
                    key={i}
                    className="absolute left-1/2 top-1/2"
                    style={{ transform: `rotate(${angle}deg)` }}
                  >
                    <motion.span
                      className={`block h-px w-[9vmin] ${
                        travel === "mars"
                          ? "bg-gradient-to-r from-amber-200/0 via-amber-200/80 to-amber-200/0"
                          : "bg-gradient-to-r from-sky-100/0 via-sky-100/80 to-sky-100/0"
                      }`}
                      initial={false}
                      animate={{
                        x: [`${radius}vmin`, `${radius + 22}vmin`],
                        opacity: [0, 0.65, 0],
                      }}
                      transition={{
                        duration: 1.35,
                        repeat: Infinity,
                        delay: (i % 5) * 0.11,
                        ease: "easeIn",
                      }}
                    />
                  </span>
                );
              })}
            </div>
            <div className="relative z-10 w-full max-w-xl px-4 text-center">
              <div
                className={`data text-[0.6rem] uppercase tracking-[0.4em] ${
                  travel === "mars" ? "text-gold" : "text-cyan"
                }`}
              >
                Transit in progress
              </div>
              <div className="display mt-3 text-4xl text-white sm:text-6xl">
                {travel === "mars" ? "TO MARS" : "TO THE MOON"}
              </div>
              <div className="data mt-3 text-[0.7rem] text-slate-400">
                {travel === "mars" ? "225,000,000 km · 7 months at cruise" : "384,400 km · 3 days at cruise"}
              </div>
              <div className="mt-1 text-[0.62rem] text-slate-500">
                {travel === "mars"
                  ? "No humans have landed here. Every track was made by a robot."
                  : "The only world where humans have left footprints."}
              </div>
              <div className="mx-auto mt-6 h-1 w-56 max-w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className={`h-full bg-gradient-to-r ${
                    travel === "mars" ? "from-gold to-sand" : "from-cyan to-[#dceeff]"
                  }`}
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1.75, ease: "easeInOut" }}
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[0.58rem] uppercase tracking-[0.2em] text-slate-500">
                <Info size={11} /> distances are averages — planets move
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
