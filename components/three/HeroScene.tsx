"use client";

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Billboard, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Scene3D from "./Scene3D";
import { HERO_LAYERS, Starfield, scaleLayers, useReducedMotion } from "./Starfield";
import ArchiveModel from "@/components/models/ArchiveModel";
import type { Asset3D, Planet } from "@/data/types";

/* deterministic pseudo-random so the scene is stable across renders */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CRATERS = (() => {
  const rnd = mulberry32(7);
  return Array.from({ length: 64 }).map(() => ({
    x: (rnd() - 0.5) * 160,
    z: (rnd() - 0.5) * 140,
    r: 1.2 + rnd() * 7,
    depth: 0.25 + rnd() * 0.9,
  }));
})();

function heightAt(x: number, z: number) {
  // broad rolling ground
  let h =
    Math.sin(x * 0.11) * 0.42 +
    Math.cos(z * 0.13) * 0.36 +
    Math.sin((x + z) * 0.055) * 1.05 +
    Math.cos(x * 0.31 + z * 0.23) * 0.18 +
    Math.sin(x * 0.9 + z * 0.7) * 0.045;
  // long ridge that gives the horizon a silhouette
  const ridge = Math.exp(-Math.pow((z + 34) / 15, 2)) * (1.5 + Math.sin(x * 0.16) * 0.9);
  h += ridge;
  // craters
  for (const c of CRATERS) {
    const d = Math.hypot(x - c.x, z - c.z);
    if (d < c.r) h -= Math.cos((d / c.r) * Math.PI * 0.5) * c.depth;
    else if (d < c.r * 1.4) h += Math.sin(((d - c.r) / (c.r * 0.4)) * Math.PI) * c.depth * 0.4;
  }
  // flatten a landing pad so the machine sits convincingly on the ground
  const d = Math.hypot(x, z);
  const k = Math.min(1, Math.max(0, (d - 2.6) / 6));
  const smooth = k * k * (3 - 2 * k);
  return h * smooth;
}

/* ------------------------------------------------------------------ ground */

function makeGroundTexture(planet: Planet) {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rnd = mulberry32(planet === "mars" ? 11 : 23);
  const base = planet === "mars" ? "#c6b0a2" : "#bfc3cb";
  const warm = planet === "mars" ? "#e6d2c4" : "#dde1e8";
  const dark = planet === "mars" ? "#8d7466" : "#7f838c";

  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // large dust drifts
  for (let i = 0; i < 260; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 8 + rnd() * 52;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const c = rnd() > 0.5 ? warm : dark;
    g.addColorStop(0, c);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.1 + rnd() * 0.22;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // gravel
  for (let i = 0; i < 26000; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 0.4 + Math.pow(rnd(), 2.4) * 2.4;
    ctx.globalAlpha = 0.06 + rnd() * 0.34;
    ctx.fillStyle = rnd() > 0.45 ? warm : dark;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (0.55 + rnd() * 0.7), rnd() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // small impact craters with lit rims
  for (let i = 0; i < 340; i++) {
    const x = rnd() * size;
    const y = rnd() * size;
    const r = 1.6 + rnd() * 9;
    ctx.globalAlpha = 0.1 + rnd() * 0.28;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 0.8 + rnd() * 1.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = warm;
    ctx.beginPath();
    ctx.arc(x - r * 0.16, y - r * 0.16, r * 0.86, 0, Math.PI * 2);
    ctx.fill();
  }

  // fine grain
  const img = ctx.getImageData(0, 0, size, size);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 26;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n));
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(72, 72);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Both worlds are synthesised once and then kept. Stamping 26k gravel ellipses and
 * displacing 40k vertices costs tens of milliseconds; doing it on every destination
 * switch is what made Mars ↔ Moon feel sticky. */
const groundTextures = new Map<Planet, THREE.Texture>();
const terrainGeometries = new Map<Planet, THREE.BufferGeometry>();

function groundTexture(planet: Planet) {
  let tex = groundTextures.get(planet);
  if (!tex) {
    tex = makeGroundTexture(planet);
    groundTextures.set(planet, tex);
  }
  return tex;
}

function terrainGeometry(planet: Planet) {
  let cached = terrainGeometries.get(planet);
  if (cached) return cached;

  const build = () => {
    const g = new THREE.PlaneGeometry(400, 400, 200, 200);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const base = new THREE.Color(planet === "mars" ? "#9d5430" : "#6f7278");
    const light = new THREE.Color(planet === "mars" ? "#cf8b60" : "#a9adb6");
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = heightAt(x, z);
      pos.setY(i, h);
      c.copy(base).lerp(light, THREE.MathUtils.clamp((h + 1.2) / 3.2, 0, 1));
      colors.push(c.r, c.g, c.b);
    }
    g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  };

  cached = build();
  terrainGeometries.set(planet, cached);
  return cached;
}

/** Builds the expensive per-planet assets ahead of time so a switch is instant. */
export function prewarmHero(planet?: Planet) {
  if (typeof window === "undefined") return;
  const worlds: Planet[] = planet ? [planet] : ["moon", "mars"];
  for (const p of worlds) {
    groundTexture(p);
    terrainGeometry(p);
  }
}

function Terrain({ planet }: { planet: Planet }) {
  const tex = useMemo(() => groundTexture(planet), [planet]);
  const geo = useMemo(() => terrainGeometry(planet), [planet]);

  return (
    <mesh geometry={geo} receiveShadow position={[0, -0.04, 0]}>
      <meshStandardMaterial
        map={tex}
        vertexColors
        roughness={planet === "mars" ? 0.97 : 0.93}
        metalness={0.02}
        color={planet === "mars" ? "#ffffff" : "#dfe3ea"}
      />
    </mesh>
  );
}

/**
 * A rock, not a dice. Icosahedron vertices are pushed along their own normals
 * by a position-hashed noise field, so split vertices move together and the
 * shell stays watertight, while facet normals give it crumbly, natural breaks.
 */
function makeRockGeometry(seed: number, detail = 1) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n =
      Math.sin(v.x * 3.11 + seed) * 0.5 +
      Math.sin(v.y * 4.67 - seed * 1.7) * 0.3 +
      Math.sin(v.z * 6.13 + v.x * 2.9 + seed) * 0.2;
    v.multiplyScalar(0.82 + n * 0.26);
    v.y *= 0.86;
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function Rocks({ planet }: { planet: Planet }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const rnd = mulberry32(planet === "mars" ? 5 : 9);
    return Array.from({ length: 190 })
      .map(() => {
        const x = (rnd() - 0.5) * 62;
        const z = (rnd() - 0.5) * 50 - 4;
        const near = Math.hypot(x, z) < 16 ? 1.45 : 1;
        const s = (0.06 + Math.pow(rnd(), 2.6) * 0.72) * near;
        return { x, z, s, rot: rnd() * Math.PI, y: heightAt(x, z), keep: Math.hypot(x, z) > 3.2 };
      })
      .filter((r) => r.keep);
  }, [planet]);

  const geometry = useMemo(() => makeRockGeometry(planet === "mars" ? 4.2 : 7.7, 1), [planet]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const rnd = mulberry32(planet === "mars" ? 17 : 19);
    const base = new THREE.Color(planet === "mars" ? "#6f3a1f" : "#5e626a");
    const dust = new THREE.Color(planet === "mars" ? "#9c6a49" : "#8d949f");
    const tint = new THREE.Color();
    data.forEach((r, i) => {
      // stones sit half-buried: sink each one into the ground by a random slice
      const sink = 0.14 + rnd() * 0.24;
      matrix.compose(
        new THREE.Vector3(r.x, r.y + r.s * (0.36 - sink), r.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(r.rot * 0.5, r.rot, r.rot * 0.28)),
        new THREE.Vector3(r.s * (0.8 + rnd() * 0.5), r.s * (0.5 + rnd() * 0.45), r.s * (0.8 + rnd() * 0.5)),
      );
      mesh.setMatrixAt(i, matrix);
      tint.copy(base).lerp(dust, Math.pow(rnd(), 1.6) * 0.55);
      mesh.setColorAt(i, tint);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [data, planet]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, data.length]} castShadow receiveShadow>
      <primitive object={geometry} attach="geometry" />
      <meshStandardMaterial roughness={0.98} metalness={0.03} flatShading />
    </instancedMesh>
  );
}

/* Dark boulders close to the lens frame the shot and sell the depth of field. */
function ForegroundBoulders({ planet }: { planet: Planet }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const rockGeo = useMemo(() => makeRockGeometry(planet === "mars" ? 12.5 : 14.5, 1), [planet]);
  useEffect(() => () => rockGeo.dispose(), [rockGeo]);
  const data = useMemo(() => {
    const rnd = mulberry32(planet === "mars" ? 31 : 37);
    return Array.from({ length: 14 }).map((_, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (6.2 + rnd() * 6.5);
      const z = 5.5 + rnd() * 5;
      return {
        x,
        z,
        s: 0.55 + rnd() * 1.25,
        y: -0.55 + rnd() * 0.5,
      };
    });
  }, [planet]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    data.forEach((r, i) => {
      m.compose(
        new THREE.Vector3(r.x, r.y, r.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(r.x, r.z, r.x * 0.4)),
        new THREE.Vector3(r.s, r.s * 0.8, r.s),
      );
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, data.length]}>
      <primitive object={rockGeo} attach="geometry" />
      <meshStandardMaterial
        color={planet === "mars" ? "#331608" : "#151b26"}
        roughness={1}
        flatShading
      />
    </instancedMesh>
  );
}

/* Distant ridge line: flat, hazy and wide so it reads as terrain, not scenery. */
function BackRidges({ planet }: { planet: Planet }) {
  const geometry = useMemo(() => {
    const rnd = mulberry32(planet === "mars" ? 61 : 67);
    const segs = 96;
    const width = 640;
    const g = new THREE.PlaneGeometry(width, 1, segs, 1);
    const pos = g.attributes.position as THREE.BufferAttribute;
    // one jagged ridge line across the plane
    const heights: number[] = [];
    for (let i = 0; i <= segs; i++) {
      const x = i / segs;
      const h =
        Math.sin(x * 9.1) * 0.32 +
        Math.sin(x * 21.3 + 1.7) * 0.18 +
        Math.sin(x * 3.7 + 0.6) * 0.5 +
        (rnd() - 0.5) * 0.1;
      heights.push(Math.max(0.06, h * 0.5 + 0.42));
    }
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const idx = Math.round(((x + width / 2) / width) * segs);
      const h = heights[Math.min(segs, Math.max(0, idx))];
      // top row (y>0) follows the ridge, bottom row sits below the horizon
      pos.setY(i, y > 0 ? h : -0.6);
    }
    g.computeVertexNormals();
    return g;
  }, [planet]);
  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} position={[0, -0.2, -150]} scale={[1, 34, 1]}>
      <meshBasicMaterial
        color={planet === "mars" ? "#ef8f52" : "#5f7fa8"}
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </mesh>
  );
}

function Dust({ planet }: { planet: Planet }) {
  const ref = useRef<THREE.Points>(null);
  const count = 420;
  const positions = useMemo(() => {
    const rnd = mulberry32(planet === "mars" ? 3 : 8);
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rnd() - 0.5) * 30;
      arr[i * 3 + 1] = rnd() * 7;
      arr[i * 3 + 2] = (rnd() - 0.5) * 24;
    }
    return arr;
  }, [planet]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    const pos = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let x = pos.getX(i) + dt * 0.42;
      let y = pos.getY(i) + Math.sin(state.clock.elapsedTime * 0.3 + i) * dt * 0.16;
      if (x > 15) x = -15;
      pos.setX(i, x);
      pos.setY(i, y);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color={planet === "mars" ? "#ffc79a" : "#d6ecff"}
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}

function EarthSky() {
  const earth = useTexture("/textures/earth.jpg");
  const r = 6.6;
  return (
    // Earth hangs well above the horizon and clear of the machine's silhouette,
    // so it reads as a distant world instead of a moon resting on the lander.
    <group position={[-19, 16, -74]} rotation={[0.2, -1.15, 0.14]}>
      <mesh>
        <sphereGeometry args={[r, 64, 64]} />
        <meshBasicMaterial map={earth} />
      </mesh>
      <mesh scale={1.06} rotation={[0, 0, 0.1]}>
        <sphereGeometry args={[r, 48, 48]} />
        <meshBasicMaterial
          color="#8fd0ff"
          transparent
          opacity={0.22}
          side={THREE.BackSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

function MarsSky() {
  return (
    <group>
      {/* Earth from Mars: the brightest evening star, with a faint glow */}
      <Billboard position={[-9.5, 9.6, -40]}>
        <mesh scale={[4.6, 4.6, 1]}>
          <planeGeometry args={[1, 1]} />
          <GlowMaterial color="#74b0ff" power={2.4} alpha={0.5} />
        </mesh>
        <mesh scale={[0.5, 0.5, 1]}>
          <planeGeometry args={[1, 1]} />
          <GlowMaterial color="#eaf5ff" power={0.8} alpha={1} />
        </mesh>
      </Billboard>
    </group>
  );
}

/** A soft radial glow with no hard rim — used for the sun and bright stars. */
function GlowMaterial({ color, power, alpha }: { color: string; power: number; alpha: number }) {
  return (
    <shaderMaterial
      transparent
      depthWrite={false}
      depthTest={false}
      blending={THREE.AdditiveBlending}
      uniforms={{
        uColor: { value: new THREE.Color(color) },
        uPower: { value: power },
        uAlpha: { value: alpha },
      }}
      vertexShader={`varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
      fragmentShader={`
        uniform vec3 uColor; uniform float uPower; uniform float uAlpha; varying vec2 vUv;
        void main(){
          float d = length(vUv - 0.5) * 2.0;
          float a = pow(clamp(1.0 - d, 0.0, 1.0), uPower) * uAlpha;
          gl_FragColor = vec4(uColor, a);
        }`}
    />
  );
}

function SunGlow({ planet }: { planet: Planet }) {
  const halo = planet === "mars" ? "#ff9c55" : "#8fbcff";
  const core = planet === "mars" ? "#fff4e2" : "#ffffff";
  return (
    <Billboard position={planet === "mars" ? [-23, 3.6, -54] : [-22, 4.4, -58]}>
      {[
        { size: 34, color: halo, power: 2.6, alpha: 0.5 },
        { size: 9, color: halo, power: 1.6, alpha: 0.7 },
        { size: 2.2, color: core, power: 0.6, alpha: 1 },
      ].map((layer, i) => (
        <mesh key={i} scale={[layer.size, layer.size, 1]}>
          <planeGeometry args={[1, 1]} />
          <GlowMaterial color={layer.color} power={layer.power} alpha={layer.alpha} />
        </mesh>
      ))}
    </Billboard>
  );
}

/* ------------------------------------------------------------------- rig */

/**
 * Frames the machine from its measured bounding box, so every model — a
 * 1-unit Sojourner or an 8-unit Lunar Module — fills the frame the same way.
 */
function Rig({ targetRef, model }: { targetRef: React.RefObject<THREE.Group | null>; model: string }) {
  const { camera, gl } = useThree();
  const reduced = useReducedMotion();
  const box = useMemo(() => ({
    bounds: new THREE.Box3(), center: new THREE.Vector3(),
    size: new THREE.Vector3(), radius: 0.25, ready: false,
  }), []);
  const vectors = useMemo(() => ({
    goal: new THREE.Vector3(), look: new THREE.Vector3(),
    direction: new THREE.Vector3(0.56, 0.1, 1).normalize(),
    right: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0),
  }), []);
  const first = useRef(true);
  const checksRemaining = useRef(3);

  useLayoutEffect(() => {
    box.ready = false;
    first.current = true;
    checksRemaining.current = 3;
  }, [model, box]);

  useFrame((state, dt) => {
    const obj = targetRef.current;
    if (!obj) return;

    // A few real frames cover child mounting, without React updates or a
    // steady-state traversal. The same cached bounds handle viewport changes.
    if (!box.ready || checksRemaining.current > 0) {
      box.bounds.setFromObject(obj);
      if (box.bounds.isEmpty()) return;
      box.bounds.getCenter(box.center);
      box.bounds.getSize(box.size);
      box.radius = Math.max(box.size.length() * 0.5, 0.25);
      box.ready = true;
      checksRemaining.current = Math.max(0, checksRemaining.current - 1);
    }

    const el = gl.domElement;
    const aspect = el.clientWidth / Math.max(1, el.clientHeight);
    if (!(aspect > 0.05)) return;
    const fov = THREE.MathUtils.degToRad((camera as THREE.PerspectiveCamera).fov);
    const vHalf = Math.tan(fov / 2);
    const hHalf = vHalf * aspect;

    // Desktop: the machine shares the frame with the headline column.
    // Portrait: the copy owns the top half, so the machine shrinks and parks low.
    const portrait = aspect < 0.95;
    const distW = box.size.x / 2 / hHalf / (portrait ? 0.88 : 0.52);
    const distH = box.size.y / 2 / vHalf / (portrait ? 0.26 : 0.46);
    const { direction: dir, right, goal, look } = vectors;
    const dist = Math.max(distW, distH, box.radius * (portrait ? 1.4 : 1.9));

    const t = state.clock.elapsedTime;
    const driftX = reduced ? 0 : Math.sin(t * 0.12) * 0.05 + state.pointer.x * 0.06;
    const driftY = reduced ? 0 : Math.sin(t * 0.19) * 0.03 + state.pointer.y * 0.04;

    // push the subject right of centre so the headline column breathes
    right.crossVectors(vectors.up, dir).normalize();
    look
      .copy(box.center)
      .addScaledVector(right, portrait ? 0 : -dist * hHalf * 0.4);
    look.y += box.size.y * (portrait ? 0.8 : 0.04);

    goal.copy(box.center).addScaledVector(dir, dist * (first.current && !reduced ? 1.12 : 1));
    goal.x += driftX * dist * 0.3;
    goal.y += driftY * dist * 0.3;

    const speed = first.current ? 100 : 2.2;
    if (reduced) camera.position.copy(goal);
    else {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, goal.x, speed, dt);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, goal.y, speed, dt);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, goal.z, speed, dt);
    }
    camera.lookAt(look);
    first.current = false;
  });

  return null;
}

/**
 * A cheap procedural studio environment: metals need something to reflect or
 * they read as chalk. Built from a canvas gradient so nothing is downloaded.
 */
/* The PMREM environment is planet-specific but stable, so it is generated once
 * per renderer and reused across destination switches instead of rebuilt. */
const envCache = new WeakMap<THREE.WebGLRenderer, Map<Planet, THREE.WebGLRenderTarget>>();

function StudioEnv({ planet }: { planet: Planet }) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  // Keep both planetary reflections while this canvas lives, then release
  // their framebuffers together when the scene leaves the canvas.
  useEffect(() => () => {
    envCache.get(gl)?.forEach((target) => target.dispose());
    envCache.delete(gl);
  }, [gl]);

  useEffect(() => {
    let cache = envCache.get(gl);
    if (!cache) {
      cache = new Map();
      envCache.set(gl, cache);
    }
    const cached = cache.get(planet);
    if (cached) {
      scene.environment = cached.texture;
      scene.environmentIntensity = 0.75;
      return () => {
        if (scene.environment === cached.texture) scene.environment = null;
      };
    }


    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const g = ctx.createLinearGradient(0, 0, 0, 128);
    if (planet === "mars") {
      g.addColorStop(0, "#0d0a14");
      g.addColorStop(0.55, "#4a2413");
      g.addColorStop(0.72, "#a95a2c");
      g.addColorStop(1, "#2a1208");
    } else {
      g.addColorStop(0, "#05070f");
      g.addColorStop(0.55, "#12233d");
      g.addColorStop(0.72, "#3d5b82");
      g.addColorStop(1, "#0a1424");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
    // key light
    const sun = ctx.createRadialGradient(70, 42, 0, 70, 42, 46);
    sun.addColorStop(0, planet === "mars" ? "#fff1dd" : "#ffffff");
    sun.addColorStop(0.35, planet === "mars" ? "#ffc287" : "#cfe2ff");
    sun.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sun;
    ctx.fillRect(0, 0, 256, 128);
    // cool bounce on the opposite side
    const rim = ctx.createRadialGradient(200, 60, 0, 200, 60, 40);
    rim.addColorStop(0, planet === "mars" ? "#7ba7ff" : "#8fbcff");
    rim.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, 256, 128);

    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    let env: THREE.WebGLRenderTarget | null = null;
    const pmrem = new THREE.PMREMGenerator(gl);
    try {
      env = pmrem.fromEquirectangular(tex);
      scene.environment = env.texture;
      scene.environmentIntensity = 0.75;
      if (env && cache) cache.set(planet, env);
    } catch {
      /* environment is a nicety, never a blocker */
    } finally {
      pmrem.dispose();
      tex.dispose();
    }
    // cached environments outlive this mount, so they are never disposed here
    const kept = env && cache?.get(planet) === env ? env : null;
    return () => {
      if (kept && scene.environment === kept.texture) scene.environment = null;
      else if (!kept && scene.environment === env?.texture) scene.environment = null;
      if (!kept) env?.dispose();
    };
  }, [planet, gl, scene]);

  return null;
}

export default function HeroScene({
  planet,
  asset,
  className,
  interactive = true,
  fallbackImage,
}: {
  planet: Planet;
  asset: Asset3D;
  className?: string;
  interactive?: boolean;
  fallbackImage?: { src: string; alt: string };
}) {
  const groupRef = useRef<THREE.Group>(null);

  return (
    <Scene3D
      className={className}
      alwaysRender
      cameraPosition={[2.4, 1.6, 4]}
      fov={44}
      dpr={[1, 1.4]}
      fallback={
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 72% 24%, rgba(40,104,208,0.3), transparent 58%), linear-gradient(180deg, #041329, #020817 62%, #020a1a)",
          }}
        >
          {fallbackImage && <img src={fallbackImage.src} alt={fallbackImage.alt} className="absolute inset-0 h-full w-full object-cover opacity-25" />}
          <div className="absolute inset-0 grid-lines opacity-20" />
          <p className="absolute bottom-5 right-5 max-w-sm rounded-xl border border-white/10 bg-ink/80 p-3 text-xs leading-relaxed text-slate-300">
            3D rendering unavailable. {asset.note}
          </p>
        </div>
      }
    >
      <color attach="background" args={["#020817"]} />
      <fog attach="fog" args={[planet === "mars" ? "#6b3016" : "#16273f", 55, 210]} />
      {/* sky dome — deep navy overhead, with a single lit band at the horizon.
          Both worlds share the same cosmic backdrop; only the horizon glow
          changes, so Mars keeps its dust without turning the sky blue-grey. */}
      <mesh renderOrder={-1} scale={[1, 1, 1]}>
        <sphereGeometry args={[180, 32, 24]} />
        <shaderMaterial
          side={THREE.BackSide}
          depthWrite={false}
          uniforms={{
            top: { value: new THREE.Color("#020817") },
            mid: { value: new THREE.Color("#041329") },
            low: { value: new THREE.Color(planet === "mars" ? "#06162c" : "#071a36") },
            horizon: { value: new THREE.Color(planet === "mars" ? "#a34f2b" : "#2c5f9e") },
            horizonAmount: { value: planet === "mars" ? 0.6 : 0.45 },
          }}
          vertexShader={`varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`}
          fragmentShader={`
            uniform vec3 top; uniform vec3 mid; uniform vec3 low;
            uniform vec3 horizon; uniform float horizonAmount; varying vec3 vP;
            void main(){
              float h = clamp(vP.y / 180.0 * 0.5 + 0.5, 0.0, 1.0);
              vec3 c = mix(low, mid, smoothstep(0.44, 0.62, h));
              c = mix(c, top, smoothstep(0.6, 0.94, h));
              // thin lit band hugging the horizon line
              float band = smoothstep(0.57, 0.5, h) * smoothstep(0.4, 0.49, h);
              c = mix(c, horizon, band * horizonAmount);
              gl_FragColor = vec4(c, 1.0);
            }`}
        />
      </mesh>

      {/* env off */}
      <ambientLight intensity={planet === "mars" ? 0.5 : 0.28} color={planet === "mars" ? "#ffd2ab" : "#cfdcf0"} />
      <hemisphereLight
        args={[planet === "mars" ? "#ffc79a" : "#cfdcf0", planet === "mars" ? "#401806" : "#10161f", planet === "mars" ? 1.1 : 0.7]}
      />
      <directionalLight
        position={planet === "mars" ? [14, 9, 8] : [12, 12, 7]}
        intensity={planet === "mars" ? 4.2 : 3.8}
        color={planet === "mars" ? "#ffe0bb" : "#ffffff"}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-bias={-0.0012}
      />
      <directionalLight position={[-9, 5, -7]} intensity={1.9} color={planet === "mars" ? "#6f9dff" : "#7fa9ff"} />
      <pointLight position={[-2.4, 2.2, 3.2]} intensity={planet === "mars" ? 1.4 : 1.1} color={planet === "mars" ? "#ffb073" : "#a9d6ff"} distance={9} />

      <Suspense fallback={null}>
        <Starfield
          layers={interactive ? HERO_LAYERS : scaleLayers(HERO_LAYERS, 0.55)}
          depthTest
        />
        {planet === "mars" ? <MarsSky /> : <EarthSky />}
        <StudioEnv planet={planet} />
        <SunGlow planet={planet} />
        {/* atmospheric haze that fuses the ground into the sky */}
        <mesh position={[0, 1.2, -120]} renderOrder={1}>
          <planeGeometry args={[520, 32]} />
          <meshBasicMaterial
            color={planet === "mars" ? "#ffa068" : "#4f86c9"}
            transparent
            opacity={planet === "mars" ? 0.26 : 0.14}
            depthWrite={false}
          />
        </mesh>
        <BackRidges planet={planet} />
        <Terrain planet={planet} />
        <Rocks planet={planet} />
        <Dust planet={planet} />
        <group ref={groupRef} position={[0, 0.02, 0]} rotation={[0, planet === "mars" ? -0.62 : -0.5, 0]}>
          <ArchiveModel asset={asset} amount={0} showLabels={false} />
        </group>
        <ForegroundBoulders planet={planet} />
        <Rig targetRef={groupRef} model={`${planet}|${JSON.stringify(asset)}`} />
      </Suspense>
    </Scene3D>
  );
}
