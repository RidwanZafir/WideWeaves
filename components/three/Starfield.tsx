"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Animated, layered, additive starfield.
 *
 * Three kinds of star share one draw call per depth layer, separated by a
 * per-vertex `aType`:
 *
 *   A — normal: tiny white/pale-blue points with slow, deep brightness swings.
 *   B — glowing: cyan / electric-blue sprites with a soft halo that fade in and
 *       out over many seconds.
 *   C — sparkling: dim most of the time, then briefly swell into a four-point
 *       blue-white glint on their own timer.
 *
 * Every animated property (phase, twinkle speed, sparkle period, scale, glow)
 * is derived from a per-vertex seed, so no two stars move or flash together and
 * the CPU only pushes a handful of uniforms per frame.
 */

export type StarType = 0 | 1 | 2;

export type StarLayer = {
  /** total stars in this depth layer */
  count: number;
  /** share of those that are sparkling (type C) */
  sparkles: number;
  /** share that are glowing (type B) */
  glows: number;
  /** spherical shell the layer lives on */
  radius: [number, number];
  /** point size in CSS pixels before device pixel ratio */
  size: [number, number];
  /** base brightness 0..1 */
  brightness: [number, number];
  /** world-space wander, kept tiny so movement stays almost imperceptible */
  drift: number;
  /** world-space offset applied to the pointer parallax */
  parallax: number;
};

const TYPE_A = 0;
const TYPE_B = 1;
const TYPE_C = 2;

/* deterministic rng so a reload does not reshuffle the sky */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* deep-blue palette */
const PALETTE = {
  softWhite: new THREE.Color("#EAF5FF"),
  paleBlue: new THREE.Color("#B8DDFF"),
  cyan: new THREE.Color("#62DFFF"),
  electric: new THREE.Color("#399BFF"),
};

function makeGeometry(layer: StarLayer, seed: number) {
  const rnd = mulberry32(seed);
  const n = layer.count;
  const position = new Float32Array(n * 3);
  const tint = new Float32Array(n * 3);
  const size = new Float32Array(n);
  const bright = new Float32Array(n);
  const seedAttr = new Float32Array(n);
  const typeAttr = new Float32Array(n);
  const freq = new Float32Array(n);
  const phase = new Float32Array(n);

  for (let i = 0; i < n; i++) {
    // uniform distribution over the shell, so density is even in every direction
    const y = rnd() * 2 - 1;
    const theta = rnd() * Math.PI * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const r = layer.radius[0] + rnd() * (layer.radius[1] - layer.radius[0]);
    position[i * 3] = Math.cos(theta) * ring * r;
    position[i * 3 + 1] = y * r;
    position[i * 3 + 2] = Math.sin(theta) * ring * r;

    const type = i < layer.sparkles ? TYPE_C : i < layer.sparkles + layer.glows ? TYPE_B : TYPE_A;
    typeAttr[i] = type;

    let color: THREE.Color;
    let sizeRange: [number, number];
    let brightRange: [number, number];
    if (type === TYPE_C) {
      color = rnd() < 0.5 ? PALETTE.softWhite : PALETTE.cyan;
      sizeRange = [2.2, 3.4];
      brightRange = [0.8, 1.0];
      freq[i] = 0.5; // the glint cycle is driven by aSeed, not by this
    } else if (type === TYPE_B) {
      color = rnd() < 0.55 ? PALETTE.cyan : PALETTE.electric;
      sizeRange = [2.3, 4.2];
      brightRange = [0.5, 0.85];
      freq[i] = 0.33 + rnd() * 0.34; // 1.5–3 s swells
    } else {
      const pick = rnd();
      color = pick < 0.55 ? PALETTE.softWhite : pick < 0.92 ? PALETTE.paleBlue : PALETTE.electric;
      sizeRange = [1.1, 2.6];
      brightRange = [0.65, 1.0];
      freq[i] = 0.25 + Math.pow(rnd(), 1.2) * 0.75; // 1–4 s twinkles
    }

    tint[i * 3] = color.r;
    tint[i * 3 + 1] = color.g;
    tint[i * 3 + 2] = color.b;

    // most stars are tiny; a few carry the scene
    const s = Math.pow(rnd(), 2.4);
    size[i] = sizeRange[0] + s * (sizeRange[1] - sizeRange[0]);
    bright[i] = brightRange[0] + rnd() * (brightRange[1] - brightRange[0]);
    seedAttr[i] = rnd();
    phase[i] = rnd();
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geo.setAttribute("aTint", new THREE.BufferAttribute(tint, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
  geo.setAttribute("aBright", new THREE.BufferAttribute(bright, 1));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seedAttr, 1));
  geo.setAttribute("aType", new THREE.BufferAttribute(typeAttr, 1));
  geo.setAttribute("aFreq", new THREE.BufferAttribute(freq, 1));
  geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), layer.radius[1] * 1.1);
  return geo;
}

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aBright;
  attribute float aSeed;
  attribute float aType;   // 0 normal · 1 glowing · 2 sparkling
  attribute float aFreq;   // per-star twinkle speed (Hz)
  attribute float aPhase;  // per-star phase 0..1
  attribute vec3  aTint;

  uniform float uTime;
  uniform float uRatio;
  uniform vec2  uPointer;
  uniform float uDrift;
  uniform float uParallax;
  uniform float uCalm;     // 1 when the OS asks for reduced motion

  varying float vAlpha;
  varying float vSpark;
  varying vec3  vTint;

  const float TAU = 6.2831853;

  float hash11(float n) { return fract(sin(n * 127.1) * 43758.5453123); }

  void main() {
    float t = uTime;
    /* Calm mode slows and trims the swing — it never stops the clock. A frozen
       sky read as a broken render, not as an accessibility courtesy. */
    float pace = mix(1.0, 0.75, uCalm);
    float lo = mix(0.13, 0.26, uCalm);
    float hi = mix(1.34, 1.14, uCalm);

    vec3 p = position;
    // a slow wander, unique per star, far below the threshold of "moving"
    p.x += sin(t * 0.05 + aSeed * 31.0) * uDrift;
    p.y += cos(t * 0.041 + aSeed * 57.0) * uDrift * 0.8;
    p.z += sin(t * 0.033 + aSeed * 19.0) * uDrift * 0.6;
    // depth parallax: near layers respond more than far ones, sliding against
    // the cursor the way a camera would
    p.xy -= uPointer * uParallax;

    float isA = step(aType, 0.5);
    float isB = step(0.5, aType) * step(aType, 1.5);
    float isC = step(1.5, aType);

    /* ---- A · 1–4 s twinkle, every star on its own clock ---- */
    float w = TAU * aFreq * pace;
    float s1 = sin(t * w + aPhase * TAU);
    float s2 = sin(t * w * 1.73 + aPhase * 12.7);   // detuned, so it never looks periodic
    float raw = 0.5 + 0.5 * (s1 * 0.7 + s2 * 0.3);
    float tw = raw * raw * (3.0 - 2.0 * raw);       // smoothstep ease
    float brightA = mix(lo, hi, tw);
    float sizeA = 0.88 + tw * 0.55;

    /* ---- B · 1.5–3 s cyan swell ---- */
    float gs = 0.5 + 0.5 * sin(t * TAU * aFreq * pace + aPhase * TAU);
    float glowB = pow(gs, 1.6);
    float brightB = mix(lo * 1.5, hi * 0.95, glowB);
    float sizeB = 0.9 + glowB * 0.7;

    /* ---- C · 2–6 s cycle: 0.25–0.5 s swell, then a 0.3–0.7 s fade ---- */
    float period = 2.2 + aSeed * 4.0;
    float spin = t / (period / pace) + aPhase * 11.0;
    float cyc = floor(spin);
    float lt = fract(spin) * (period / pace);

    // each glint reappears somewhere else on the sphere; the hop happens while
    // the star is dark, so it reads as a new sparkle rather than a drifting one
    float hop = (1.0 - smoothstep(0.0, 0.05, lt)) * isC;
    vec3 off = vec3(
      hash11(aSeed * 91.3 + cyc),
      hash11(aSeed * 37.7 + cyc * 1.7),
      hash11(aSeed * 13.9 + cyc * 2.3)
    ) - 0.5;
    p += off * mix(26.0, 19.0, uCalm) * hop;

    float rise = smoothstep(0.01, 0.36, lt);
    float fall = 1.0 - smoothstep(0.36, 0.95, lt);
    float pulse = pow(rise * fall, 1.15);
    // a quiet idle level so the sparkler is still a star the rest of the time
    float idleC = 0.18 + 0.16 * (0.5 + 0.5 * sin(t * 0.6 + aPhase * TAU));
    float brightC = idleC + pulse * mix(2.1, 1.6, uCalm);
    float sizeC = 1.0 + pulse * mix(10.0, 7.0, uCalm);

    vAlpha = clamp(aBright * (brightA * isA + brightB * isB + brightC * isC), 0.0, 1.0);
    vSpark = pulse * isC;
    // whiten toward the centre of a sparkle
    vTint = mix(aTint, vec3(0.94, 0.98, 1.0), vSpark * 0.6);

    float sizeMul = sizeA * isA + sizeB * isB + sizeC * isC;
    gl_PointSize = clamp(aSize * uRatio * sizeMul, 1.2 * uRatio, 34.0 * uRatio);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vAlpha;
  varying float vSpark;
  varying vec3  vTint;

  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;

    float halo = pow(clamp(1.0 - d, 0.0, 1.0), 2.4);
    float core = exp(-d * d * 5.5);

    // four-point glint: two thin spikes through the centre, tapering to the tips
    float ax = abs(p.x);
    float ay = abs(p.y);
    float spikeH = pow(max(0.0, 1.0 - ay * 2.9), 7.0) * pow(max(0.0, 1.0 - ax), 1.5);
    float spikeV = pow(max(0.0, 1.0 - ax * 2.9), 7.0) * pow(max(0.0, 1.0 - ay), 1.5);
    float star = clamp(spikeH + spikeV, 0.0, 1.0);

    // the round halo steps back a little while the spikes are flaring
    float round = (core * 0.95 + halo * 0.8) * vAlpha * (1.0 - vSpark * 0.2);
    float glint = star * vSpark * 2.2;
    float a = clamp(round + glint, 0.0, 1.0);

    gl_FragColor = vec4(vTint * (1.0 + core * 0.3 + vSpark * 1.0), a);
  }
`;

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export function Starfield({
  layers,
  animate = true,
  depthTest = false,
  getPointer,
}: {
  layers: StarLayer[];
  animate?: boolean;
  /** hero stars live behind the terrain, so they must be depth-tested */
  depthTest?: boolean;
  /** the page backdrop canvas is pointer-events:none, so it feeds the pointer in */
  getPointer?: () => { x: number; y: number };
}) {
  // reduced motion calms the amplitude and pace; it never stops the clock
  const calm = useReducedMotion();
  const dpr = useThree((s) => s.viewport.dpr);

  const geometries = useMemo(
    () => layers.map((layer, i) => makeGeometry(layer, 1337 + i * 7919)),
    [layers],
  );

  /* The material is created here rather than declared as <shaderMaterial>:
   * R3F treats a `uniforms` prop as a mount-time snapshot, so a declarative
   * <shaderMaterial> can end up rendering with copies of the objects we mutate.
   * Owning the material keeps exactly one set of uniform objects for its whole
   * life, which is what makes the shader's clock actually move. */
  const materials = useMemo(
    () =>
      layers.map(
        (layer) =>
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            depthTest,
            blending: THREE.AdditiveBlending,
            uniforms: {
              uTime: { value: 0 },
              uRatio: { value: 1 },
              uPointer: { value: new THREE.Vector2() },
              uDrift: { value: layer.drift },
              uParallax: { value: layer.parallax },
              uCalm: { value: 0 },
            },
            vertexShader: VERTEX,
            fragmentShader: FRAGMENT,
          }),
      ),
    [layers, depthTest],
  );

  useEffect(
    () => () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
    [geometries, materials],
  );

  useEffect(() => {
    for (const m of materials) {
      m.uniforms.uRatio.value = Math.min(dpr, 2);
      m.uniforms.uCalm.value = calm ? 1 : 0;
    }
  }, [materials, dpr, calm]);

  const damped = useRef(new THREE.Vector2());
  const clock = useRef(0);

  useFrame((state, dt) => {
    const raw = getPointer ? getPointer() : state.pointer;
    // calm mode also stills the cursor parallax
    const tx = calm ? 0 : raw?.x ?? 0;
    const ty = calm ? 0 : raw?.y ?? 0;
    damped.current.x = THREE.MathUtils.damp(damped.current.x, tx, 3, dt);
    damped.current.y = THREE.MathUtils.damp(damped.current.y, ty, 3, dt);

    // own accumulator, so a paused loop resumes instead of snapping forward
    if (animate) clock.current += Math.min(dt, 0.1);
    const t = clock.current;
    for (const m of materials) {
      m.uniforms.uTime.value = t;
      m.uniforms.uPointer.value.set(damped.current.x, damped.current.y);
    }
  });

  return (
    <group>
      {materials.map((material, i) => (
        <points key={i} geometry={geometries[i]} material={material} frustumCulled={false} renderOrder={-1} />
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ presets */

/**
 * Deep sky behind the page. Roughly 400 of these are on screen at once; ~12 are
 * mid-sparkle at any moment, spread across three depths.
 */
export const BACKDROP_LAYERS: StarLayer[] = [
  { count: 2500, sparkles: 820, glows: 90, radius: [240, 320], size: [0.9, 2.2], brightness: [0.4, 0.8], drift: 1.1, parallax: 1.4 },
  { count: 900, sparkles: 480, glows: 60, radius: [140, 190], size: [1.1, 2.7], brightness: [0.5, 0.95], drift: 1.5, parallax: 3.0 },
  { count: 260, sparkles: 190, glows: 34, radius: [70, 105], size: [1.4, 3.4], brightness: [0.6, 1.0], drift: 2.0, parallax: 3.2 },
];

/** Denser, slightly brighter field inside the hero canvas. */
export const HERO_LAYERS: StarLayer[] = [
  { count: 3600, sparkles: 520, glows: 90, radius: [160, 190], size: [1.0, 2.4], brightness: [0.5, 0.9], drift: 1.0, parallax: 1.4 },
  { count: 1400, sparkles: 320, glows: 60, radius: [115, 152], size: [1.3, 3.0], brightness: [0.6, 1.0], drift: 1.4, parallax: 2.4 },
  { count: 420, sparkles: 140, glows: 30, radius: [88, 112], size: [1.7, 3.6], brightness: [0.7, 1.0], drift: 1.9, parallax: 3.4 },
];

/** Roughly halves the counts on small screens; the sky still reads full. */
export function scaleLayers(layers: StarLayer[], factor: number): StarLayer[] {
  return layers.map((l) => ({
    ...l,
    count: Math.max(24, Math.round(l.count * factor)),
    sparkles: Math.max(6, Math.round(l.sparkles * factor)),
    glows: Math.max(6, Math.round(l.glows * factor)),
  }));
}
