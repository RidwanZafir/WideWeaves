"use client";

import { Component, createContext, Suspense, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Asset3D, Planet } from "@/data/types";
import ArchiveModel from "@/components/models/ArchiveModel";
import { supportsWebGL } from "@/lib/webgl";
import { useAdaptiveRenderProfile, type RenderProfile, type RenderQuality } from "@/lib/render-profile";
import RenderBudgetMonitor, { type FrameBudgetSample } from "./RenderBudgetMonitor";

export type RootExpeditionMode = "intro" | "moon" | "mars" | "selection";

type Props = {
  className?: string;
  mode: RootExpeditionMode;
  selectedWorld?: Planet | null;
  onPlanetHover?: (planet: Planet | null) => void;
  onPlanetSelect?: (planet: Planet) => void;
};

type TerrainKind = "moon" | "mars";
const RootRenderContext = createContext<RenderProfile | null>(null);
function useRootRenderProfile() {
  const profile = useContext(RootRenderContext);
  if (!profile) throw new Error("Root rendering budget is unavailable");
  return profile;
}

class RootSceneBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const ROOT_TEXTURES = {
  moon: "/textures/moon.jpg",
  mars: "/assets/root-expedition/textures/mars/mars-global-2k.webp",
  earth: "/assets/root-expedition/textures/earth/earth.jpg",
} as const;
const ROOT_DRACO_PATH = "/assets/root-expedition/draco/gltf/";

const STAGE_ASSETS: Record<"moon" | "mars" | "selection", { textures: string[]; models: string[] }> = {
  moon: {
    textures: [
      ROOT_TEXTURES.moon,
      ROOT_TEXTURES.earth,
      "/assets/root-expedition/terrain/moon/apollo-11-lola-height.png",
      "/assets/root-expedition/terrain/moon/apollo-11-lola-height.png",
    ],
    models: ["/assets/root-expedition/models/moon/apollo-lunar-module.glb"],
  },
  mars: {
    textures: [
      ROOT_TEXTURES.mars,
      ROOT_TEXTURES.earth,
      "/assets/root-expedition/terrain/mars/jezero-hirise-ortho-25cm.webp",
      "/assets/root-expedition/terrain/mars/jezero-hirise-dtm-1m-1024.png",
    ],
    models: [],
  },
  selection: {
    textures: [
      ROOT_TEXTURES.moon,
      ROOT_TEXTURES.mars,
      ROOT_TEXTURES.earth,
      "/assets/root-expedition/terrain/moon/apollo-11-lola-height.png",
      "/assets/root-expedition/terrain/moon/apollo-11-lola-height.png",
    ],
    models: [],
  },
};

type TerrainResourceKey = `${TerrainKind}:${RenderQuality}`;
// Two worlds × three finite quality budgets; no unbounded renderer-keyed cache.
const TERRAIN_RESOURCES = new Map<TerrainResourceKey, { geometry: THREE.BufferGeometry; material: THREE.MeshPhysicalMaterial }>();
const SURFACE_ROCK_GEOMETRIES = new Map<RenderProfile["rockDetail"], THREE.BufferGeometry>();
const SURFACE_ROCK_MATERIALS = new Map<TerrainKind, THREE.MeshStandardMaterial>();
function surfaceRockGeometry(detail: RenderProfile["rockDetail"]) {
  const cached = SURFACE_ROCK_GEOMETRIES.get(detail);
  if (cached) return cached;
  const geo = new THREE.IcosahedronGeometry(1, detail);
  const vertices = geo.attributes.position as THREE.BufferAttribute;
  const point = new THREE.Vector3();
  const normals = new Float32Array(vertices.count * 3);
  for (let i = 0; i < vertices.count; i++) {
    point.fromBufferAttribute(vertices, i);
    const relief = 1 + Math.sin(point.x * 7.3 + point.z * 3.1) * 0.085 + Math.cos(point.y * 6.7 - point.x * 4.2) * 0.055;
    point.multiplyScalar(relief);
    vertices.setXYZ(i, point.x, point.y, point.z);
    point.normalize();
    normals.set([point.x, point.y, point.z], i * 3);
  }
  geo.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  SURFACE_ROCK_GEOMETRIES.set(detail, geo);
  return geo;
}

function surfaceRockMaterial(kind: TerrainKind) {
  let material = SURFACE_ROCK_MATERIALS.get(kind);
  if (!material) {
    material = new THREE.MeshStandardMaterial({ color: kind === "moon" ? "#77736e" : "#8e4e36", roughness: 0.98, metalness: 0 });
    SURFACE_ROCK_MATERIALS.set(kind, material);
  }
  return material;
}

function terrainResources(kind: TerrainKind, source: THREE.Texture, elevation: THREE.Texture, maxAnisotropy: number, profile: RenderProfile) {
  const key: TerrainResourceKey = `${kind}:${profile.quality}`;
  const cached = TERRAIN_RESOURCES.get(key);
  if (cached) return cached;

  const image = elevation.image as HTMLImageElement;
  const width = image.naturalWidth || image.width;
  const height = image.naturalHeight || image.height;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const columns = profile.terrainSegments;
  const rows = kind === "moon" ? Math.round(columns * 0.75) : columns;
  const geo = new THREE.PlaneGeometry(120, 104, columns, rows);
  // Turn the plane horizontal before applying the DEM so sampled elevation
  // moves vertices vertically instead of bending the terrain in depth.
  geo.rotateX(-Math.PI / 2);
  if (context) {
    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;
    const uv = geo.attributes.uv as THREE.BufferAttribute;
    const vertices = geo.attributes.position as THREE.BufferAttribute;
    const heightScale = kind === "moon" ? 5.2 : 4.8;
    for (let i = 0; i < vertices.count; i++) {
      const x = Math.min(width - 1, Math.round(uv.getX(i) * (width - 1)));
      const y = Math.min(height - 1, Math.round((1 - uv.getY(i)) * (height - 1)));
      const relief = pixels[(y * width + x) * 4] / 255;
      vertices.setY(i, (relief - 0.5) * heightScale);
    }
    geo.computeVertexNormals();
  }
  source.colorSpace = THREE.SRGBColorSpace;
  source.anisotropy = Math.min(profile.quality === "performance" ? 4 : profile.quality === "balanced" ? 8 : 12, maxAnisotropy);
  elevation.colorSpace = THREE.NoColorSpace;
  elevation.anisotropy = source.anisotropy;
  source.needsUpdate = elevation.needsUpdate = true;

  const material = new THREE.MeshPhysicalMaterial({
    map: source,
    bumpMap: elevation,
    bumpScale: kind === "moon" ? 0.34 : 0.22,
    roughness: kind === "moon" ? 0.98 : 0.93,
    metalness: 0,
    clearcoat: 0.01,
    clearcoatRoughness: 0.96,
  });
  const resources = { geometry: geo, material };
  TERRAIN_RESOURCES.set(key, resources);
  return resources;
}

function random(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

const STAR_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSparkle;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uDpr;
  uniform float uIntro;
  uniform float uReveal;
  uniform vec2 uPointer;
  varying float vGlow;
  varying float vSparkle;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    p.xy -= uPointer * (0.14 + aSize * 0.055);
    float wave = 0.5 + 0.5 * sin(uTime * aSpeed + aPhase);
    float twinkle = wave * wave;
    float flash = pow(max(0.0, sin(uTime * (0.18 + aSpeed * 0.22) + aPhase * 2.1)), 15.0) * aSparkle;
    float cinematicFlash = pow(max(0.0, sin(uTime * (0.16 + aSpeed * 0.17) + aPhase * 2.4)), 21.0) * aSparkle;
    float cinematicGlow = 0.28 + twinkle * 0.9 + cinematicFlash * 0.62;
    vGlow = mix(0.3 + twinkle * 0.68 + flash, cinematicGlow, uIntro);
    vSparkle = mix(flash, cinematicFlash, uIntro);
    vColor = mix(aColor, vec3(0.92, 0.98, 1.0), vSparkle * 0.72);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = clamp(aSize * uDpr * (34.0 / -mv.z), 1.0, 15.0 * uDpr);
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  uniform float uReveal;
  varying float vGlow;
  varying float vSparkle;
  varying vec3 vColor;
  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = length(p);
    float core = exp(-d * d * 8.0);
    float halo = pow(max(0.0, 1.0 - d), 2.3);
    float crossA = pow(max(0.0, 1.0 - abs(p.x) * 5.0), 5.0) * pow(max(0.0, 1.0 - abs(p.y)), 2.0);
    float crossB = pow(max(0.0, 1.0 - abs(p.y) * 5.0), 5.0) * pow(max(0.0, 1.0 - abs(p.x)), 2.0);
    float sparkle = (crossA + crossB) * vSparkle * 1.8;
    float alpha = (core * 0.95 + halo * 0.36 + sparkle) * vGlow * uReveal;
    gl_FragColor = vec4(vColor * (1.0 + vSparkle * 0.75), alpha);
  }
`;

function StarLayers({ compact, reduced, cinematic }: { compact: boolean; reduced: boolean; cinematic: boolean }) {
  const profile = useRootRenderProfile();
  const pointer = useRef(new THREE.Vector2());
  const geometry = useMemo(() => {
    const count = Math.round((cinematic ? (compact ? 210 : 360) : compact ? 1150 : 2450) * profile.starScale);
    const geo = new THREE.BufferGeometry();
    const position = new Float32Array(count * 3);
    const size = new Float32Array(count);
    const phase = new Float32Array(count);
    const speed = new Float32Array(count);
    const sparkle = new Float32Array(count);
    const color = new Float32Array(count * 3);
    const rnd = random(481516);
    const colors = [new THREE.Color("#f2f7ff"), new THREE.Color("#afd7ff"), new THREE.Color("#62dfff"), new THREE.Color("#428cff")];
    const sparkleCount = compact ? 7 : 10;
    for (let i = 0; i < count; i++) {
      const isIntroSparkle = cinematic && i < sparkleCount;
      position[i * 3] = isIntroSparkle ? (rnd() - 0.5) * (compact ? 10 : 40) : (rnd() - 0.5) * 94;
      position[i * 3 + 1] = isIntroSparkle ? (rnd() - 0.5) * (compact ? 10 : 18) + 1 : (rnd() - 0.5) * 60;
      position[i * 3 + 2] = isIntroSparkle ? -11 - rnd() * (compact ? 12 : 24) : -8 - rnd() * 64;
      size[i] = isIntroSparkle ? 2.1 + rnd() * 1.1 : 0.7 + Math.pow(rnd(), 2.2) * 2.4;
      phase[i] = rnd() * Math.PI * 2;
      speed[i] = 0.3 + rnd() * 1.2;
      sparkle[i] = isIntroSparkle ? 1 : cinematic ? 0 : rnd() > 0.93 ? 1 : 0;
      const c = colors[Math.floor(rnd() * colors.length)];
      color[i * 3] = c.r;
      color[i * 3 + 1] = c.g;
      color[i * 3 + 2] = c.b;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
    geo.setAttribute("aSpeed", new THREE.BufferAttribute(speed, 1));
    geo.setAttribute("aSparkle", new THREE.BufferAttribute(sparkle, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(color, 3));
    return geo;
  }, [compact, cinematic, profile.starScale]);
  const material = useMemo(() => new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uDpr: { value: 1 },
      uIntro: { value: cinematic ? 1 : 0 },
      uReveal: { value: 1 },
      uPointer: { value: new THREE.Vector2() },
    },
    vertexShader: STAR_VERTEX,
    fragmentShader: STAR_FRAGMENT,
  }), []);
  const dpr = useThree((state) => state.viewport.dpr);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame((state, dt) => {
    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, reduced ? 0 : state.pointer.x, 2.3, dt);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, reduced ? 0 : state.pointer.y, 2.3, dt);
    const elapsed = state.clock.elapsedTime;
    material.uniforms.uIntro.value = cinematic ? 1 : 0;
    // Reduced motion slows the intro star cycle instead of freezing it, so the
    // night sky remains alive without the brighter, faster twinkle cadence.
    material.uniforms.uTime.value += Math.min(dt, 0.05) * (reduced ? (cinematic ? 0.18 : 0.45) : 1);
    material.uniforms.uReveal.value = cinematic && !reduced ? THREE.MathUtils.smoothstep(elapsed, 0.12, 1.05) : 1;
    material.uniforms.uDpr.value = Math.min(dpr, 1.5);
    material.uniforms.uPointer.value.copy(pointer.current);
  });
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={-2} />;
}

function CameraFlight({ mode, reduced }: { mode: RootExpeditionMode; reduced: boolean }) {
  const { camera } = useThree();
  const pointer = useRef(new THREE.Vector2());
  const look = useRef(new THREE.Vector3());
  useFrame((state, dt) => {
    const target = CAMERA_TARGETS[mode];
    const calm = reduced ? 1.35 : 1.9;
    pointer.current.x = THREE.MathUtils.damp(pointer.current.x, reduced ? 0 : state.pointer.x, calm, dt);
    pointer.current.y = THREE.MathUtils.damp(pointer.current.y, reduced ? 0 : state.pointer.y, calm, dt);
    const introSettle = mode === "intro" && !reduced ? THREE.MathUtils.smoothstep(state.clock.elapsedTime, 0, 1.6) : 0;
    const introDriftX = mode === "intro" && !reduced ? Math.sin(state.clock.elapsedTime * 0.075) * 0.1 * introSettle : 0;
    const introDriftY = mode === "intro" && !reduced ? Math.sin(state.clock.elapsedTime * 0.12 + 1.2) * 0.045 * introSettle : 0;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, target.position.x + pointer.current.x * 0.42 + introDriftX, 4.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, target.position.y + pointer.current.y * 0.26 + Math.sin(state.clock.elapsedTime * 0.11) * (reduced ? 0 : 0.12) + introDriftY, 4.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, target.position.z, 4.5, dt);
    look.current.lerp(target.look, 1 - Math.exp(-dt * 4.5));
    camera.lookAt(look.current);
  });
  return null;
}

const CAMERA_TARGETS: Record<RootExpeditionMode, { position: THREE.Vector3; look: THREE.Vector3 }> = {
  intro: { position: new THREE.Vector3(0, 0.5, 18), look: new THREE.Vector3(0, 0.2, -7) },
  moon: { position: new THREE.Vector3(0, 2.6, 17), look: new THREE.Vector3(0, 0.5, -7) },
  mars: { position: new THREE.Vector3(0, 2.1, 17), look: new THREE.Vector3(0, 0.1, -7) },
  selection: { position: new THREE.Vector3(0, 0.3, 15), look: new THREE.Vector3(0, 0, 0) },
};

const LIGHT_TARGETS: Record<RootExpeditionMode, { sun: THREE.Color; fill: THREE.Color; ground: THREE.Color }> = {
  intro: { sun: new THREE.Color("#f6f8ff"), fill: new THREE.Color("#4a9bff"), ground: new THREE.Color("#37201a") },
  moon: { sun: new THREE.Color("#f6f8ff"), fill: new THREE.Color("#4a9bff"), ground: new THREE.Color("#252b34") },
  mars: { sun: new THREE.Color("#ffc06e"), fill: new THREE.Color("#e86e43"), ground: new THREE.Color("#37201a") },
  selection: { sun: new THREE.Color("#f6f8ff"), fill: new THREE.Color("#4a9bff"), ground: new THREE.Color("#252b34") },
};

function Surface({ kind, position = [0, -2.35, -13] }: { kind: TerrainKind; position?: [number, number, number] }) {
  const profile = useRootRenderProfile();
  const source = useTexture(kind === "moon"
    ? ROOT_TEXTURES.moon
    : "/assets/root-expedition/terrain/mars/jezero-hirise-ortho-25cm.webp");
  const elevation = useTexture(kind === "moon"
    ? "/assets/root-expedition/terrain/moon/apollo-11-lola-height.png"
    : "/assets/root-expedition/terrain/mars/jezero-hirise-dtm-1m-1024.png");
  const renderer = useThree((state) => state.gl);
  const resources = useMemo(
    () => terrainResources(kind, source, elevation, renderer.capabilities.getMaxAnisotropy(), profile),
    [elevation, kind, renderer, source, profile.quality, profile.terrainSegments],
  );
  // Six bounded terrain resource sets are kept warm across guide stages;
  // disable auto-disposal because their geometry/material are intentionally shared.
  return <mesh geometry={resources.geometry} material={resources.material} position={position} receiveShadow dispose={null} />;
}

function SurfaceBoulders({ kind, compact, clearRight = false }: { kind: TerrainKind; compact: boolean; clearRight?: boolean }) {
  const profile = useRootRenderProfile();
  const geometry = useMemo(() => surfaceRockGeometry(profile.rockDetail), [profile.rockDetail]);
  const material = useMemo(() => surfaceRockMaterial(kind), [kind]);
  const rocks: Array<{ position: [number, number, number]; scale: [number, number, number]; rotation: number }> = compact
    ? [
        { position: [-7.2, -1.83, 1], scale: [0.78, 0.52, 0.66], rotation: 0.4 },
        { position: [7.1, -1.8, -1.5], scale: [0.62, 0.45, 0.56], rotation: -0.7 },
      ]
    : [
        { position: [-9.2, -1.7, 1.2], scale: [1.02, 0.65, 0.82], rotation: 0.4 },
        { position: [9.4, -1.77, 0.2], scale: [0.82, 0.58, 0.72], rotation: -0.7 },
        { position: [-13.2, -1.97, -7.5], scale: [0.52, 0.38, 0.48], rotation: 1.1 },
        { position: [13.4, -1.93, -9.2], scale: [0.6, 0.42, 0.52], rotation: -0.3 },
      ];
  return (
    <group>
      {rocks.map((rock, index) => (
        <mesh
          key={`${kind}-${index}`}
          geometry={geometry}
          material={material}
          position={clearRight && rock.position[0] > 0 ? [rock.position[0] + 10, rock.position[1], rock.position[2]] : rock.position}
          scale={rock.scale}
          rotation={[0.08, rock.rotation, 0.12]}
          castShadow
          receiveShadow
          dispose={null}
        />
      ))}
    </group>
  );
}

function DustMotes({ color, reduced = false, cinematic = false }: { color: string; reduced?: boolean; cinematic?: boolean }) {
  const profile = useRootRenderProfile();
  const ref = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = Math.round(110 * profile.starScale);
    const positions = new Float32Array(count * 3);
    const rnd = random(337);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (rnd() - 0.5) * 52;
      positions[i * 3 + 1] = (rnd() - 0.5) * 26 - 2;
      positions[i * 3 + 2] = -4 - rnd() * 36;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [profile.starScale]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((state, dt) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    const motion = reduced && cinematic ? 0 : 1;
    ref.current.rotation.y += dt * 0.0018 * motion;
    ref.current.position.y = Math.sin(t * 0.13) * 0.24 * motion;
    ref.current.position.x = Math.cos(t * 0.09) * 0.18 * motion;
    if (cinematic && ref.current.material instanceof THREE.PointsMaterial) {
      ref.current.material.opacity = 0.4 + Math.sin(t * 0.28) * 0.025;
    }
  });
  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial color={color} size={0.09} sizeAttenuation transparent opacity={0.48} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function CelestialBody({
  planet,
  position,
  radius,
  hovered = false,
  selectable = false,
  introHoverable = false,
  reduced = false,
  onHover,
  onSelect,
}: {
  planet: Planet | "earth";
  position: [number, number, number];
  radius: number;
  hovered?: boolean;
  selectable?: boolean;
  introHoverable?: boolean;
  reduced?: boolean;
  onHover?: (planet: Planet | null) => void;
  onSelect?: (planet: Planet) => void;
}) {
  const profile = useRootRenderProfile();
  const texture = useTexture(ROOT_TEXTURES[planet]);
  const relief = useTexture(planet === "moon"
    ? "/assets/root-expedition/terrain/moon/apollo-11-lola-height.png"
    : ROOT_TEXTURES.earth);
  const renderer = useThree((state) => state.gl);
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const [pointed, setPointed] = useState(false);
  const highlighted = hovered || pointed;
  useEffect(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(profile.quality === "performance" ? 4 : 8, renderer.capabilities.getMaxAnisotropy());
    relief.colorSpace = THREE.NoColorSpace;
    relief.anisotropy = texture.anisotropy;
    texture.needsUpdate = true;
    relief.needsUpdate = true;
  }, [relief, renderer, texture, profile.quality]);
  useFrame((state, dt) => {
    if (mesh.current) mesh.current.rotation.y += dt * (planet === "mars" ? 0.018 : 0.012) * (reduced || profile.reducedMotion ? 0.18 : 1);
    if (group.current && selectable) {
      const scale = highlighted ? 1.06 : 1;
      group.current.scale.setScalar(THREE.MathUtils.damp(group.current.scale.x, scale, 3.2, dt));
      group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.32 + position[0]) * (profile.reducedMotion ? 0.015 : 0.07);
    }
  });
  return (
    <group
      ref={group}
      position={position}
      onPointerOver={selectable || introHoverable ? (event) => {
        event.stopPropagation();
        if (selectable) onHover?.(planet as Planet);
        if (introHoverable) setPointed(true);
      } : undefined}
      onPointerOut={selectable || introHoverable ? (event) => {
        event.stopPropagation();
        if (selectable) onHover?.(null);
        if (introHoverable) setPointed(false);
      } : undefined}
      onClick={selectable ? (event) => { event.stopPropagation(); onSelect?.(planet as Planet); } : undefined}
    >
      <mesh ref={mesh}>
        <sphereGeometry args={[radius, profile.sphereSegments, profile.sphereRings]} />
        <meshPhysicalMaterial
          map={texture}
          bumpMap={planet === "moon" ? relief : texture}
          bumpScale={planet === "moon" ? 0.085 : 0.018}
          displacementMap={planet === "moon" ? relief : undefined}
          displacementScale={planet === "moon" ? 0.035 : 0}
          roughness={planet === "earth" ? 0.87 : 0.96}
          metalness={0}
          clearcoat={planet === "earth" ? 0.08 : 0}
          clearcoatRoughness={0.9}
        />
      </mesh>
      {planet === "earth" && <pointLight position={[0, 0, radius * 1.4]} intensity={1.1} color="#a8d7ff" distance={radius * 4} />}
      {(planet === "mars" || planet === "earth") && <AtmosphereShell planet={planet} radius={radius} />}
      {planet === "moon" && highlighted && (
        <mesh scale={1.035}>
          <sphereGeometry args={[radius, Math.min(72, profile.sphereSegments), Math.min(56, profile.sphereRings)]} />
          <meshBasicMaterial color="#c7e8ff" transparent opacity={0.11} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}
      {planet === "mars" && introHoverable && highlighted && (
        <mesh scale={1.025}>
          <sphereGeometry args={[radius, Math.min(72, profile.sphereSegments), Math.min(56, profile.sphereRings)]} />
          <meshBasicMaterial color="#ff9b5c" transparent opacity={0.075} side={THREE.BackSide} depthWrite={false} />
        </mesh>
      )}
      {highlighted && (selectable || introHoverable) && (
        <pointLight position={[0, 0, radius * 1.5]} intensity={selectable ? 13 : 4.5} distance={radius * (selectable ? 3 : 2.3)} color={planet === "mars" ? "#ff9b5c" : "#9fddff"} />
      )}
    </group>
  );
}

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormalView;
  varying vec3 vPositionView;
  void main() {
    vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
    vNormalView = normalize(normalMatrix * normal);
    vPositionView = viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uTint;
  uniform float uTime;
  varying vec3 vNormalView;
  varying vec3 vPositionView;
  void main() {
    vec3 viewDirection = normalize(-vPositionView);
    float fresnel = pow(1.0 - max(dot(normalize(vNormalView), viewDirection), 0.0), 2.35);
    float bands = 0.88 + 0.12 * sin(vPositionView.y * 0.68 + uTime * 0.12);
    float alpha = fresnel * bands * 0.56;
    gl_FragColor = vec4(uTint * (0.72 + fresnel * 0.82), alpha);
  }
`;

function AtmosphereShell({ planet, radius }: { planet: Planet | "earth"; radius: number }) {
  const profile = useRootRenderProfile();
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTint: { value: new THREE.Color(planet === "mars" ? "#f08355" : "#4c9ffb") },
      uTime: { value: 0 },
    },
    vertexShader: ATMOSPHERE_VERTEX,
    fragmentShader: ATMOSPHERE_FRAGMENT,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }), [planet]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame((_, dt) => { material.uniforms.uTime.value += Math.min(dt, 0.05); });
  return (
    <mesh scale={1.045}>
      <sphereGeometry args={[radius, Math.min(100, profile.sphereSegments), Math.min(80, profile.sphereRings)]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function OrbitingRock({ position, scale, speed }: { position: [number, number, number]; scale: [number, number, number]; speed: number }) {
  const profile = useRootRenderProfile();
  const ref = useRef<THREE.Mesh>(null);
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, profile.rockDetail);
    const vertices = geo.attributes.position as THREE.BufferAttribute;
    const point = new THREE.Vector3();
    for (let i = 0; i < vertices.count; i++) {
      point.fromBufferAttribute(vertices, i);
      const variation = 1 + Math.sin(point.x * 8.7 + point.y * 4.1) * 0.075 + Math.cos(point.z * 10.2 - point.y * 6.4) * 0.045;
      point.multiplyScalar(variation);
      vertices.setXYZ(i, point.x, point.y, point.z);
    }
    geo.computeVertexNormals();
    return geo;
  }, [profile.rockDetail]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * speed;
    ref.current.rotation.x += dt * speed * 0.13;
  });
  return (
    <mesh ref={ref} geometry={geometry} position={position} scale={scale}>
      <meshStandardMaterial color="#9a6249" roughness={0.98} metalness={0} flatShading />
    </mesh>
  );
}

const NASA_MODELS = {
  lunarModule: "/assets/root-expedition/models/moon/apollo-lunar-module.glb",
} as const;

type PreparedRootModel = { clone: THREE.Group; nativeHeight: number };
const PREPARED_ROOT_MODELS = new Map<string, PreparedRootModel>();

function prepareRootModel(src: string, scene: THREE.Group) {
  const cached = PREPARED_ROOT_MODELS.get(src);
  if (cached) return cached;
  const clone = scene.clone(true);
  clone.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(clone);
  const center = bounds.getCenter(new THREE.Vector3());
  clone.position.set(-center.x, -bounds.min.y, -center.z);
  clone.traverse((object) => {
    if ((object as THREE.Mesh).isMesh) {
      (object as THREE.Mesh).castShadow = true;
      (object as THREE.Mesh).receiveShadow = true;
    }
  });
  const prepared = { clone, nativeHeight: Math.max(bounds.getSize(new THREE.Vector3()).y, 0.0001) };
  PREPARED_ROOT_MODELS.set(src, prepared);
  return prepared;
}

function WarmRootModel({ src }: { src: string }) {
  const { scene } = useGLTF(src, ROOT_DRACO_PATH, true);
  useMemo(() => prepareRootModel(src, scene), [scene, src]);
  return null;
}

function RootNASAAsset({
  src,
  position,
  height,
  rotation = 0,
  introPresentation = false,
  reduced = false,
}: {
  src: string;
  position: [number, number, number];
  height: number;
  rotation?: number;
  introPresentation?: boolean;
  reduced?: boolean;
}) {
  const { scene } = useGLTF(src, ROOT_DRACO_PATH, true);
  const rig = useRef<THREE.Group>(null);
  const warmReflection = useRef<THREE.PointLight>(null);
  const blueReflection = useRef<THREE.PointLight>(null);
  const model = useMemo(() => prepareRootModel(src, scene), [scene, src]);
  const factor = height / model.nativeHeight;
  useFrame((state) => {
    if (!introPresentation || !rig.current) return;
    const t = state.clock.elapsedTime;
    const motion = reduced ? 0 : 1;
    // The Curiosity GLB is a single static mesh; keep it planted and animate
    // only a tiny suspension settle plus moving studio reflections.
    rig.current.position.y = position[1] + Math.sin(t * 0.72) * 0.008 * motion;
    rig.current.rotation.x = Math.sin(t * 0.62 + 0.7) * 0.0018 * motion;
    if (warmReflection.current) {
      warmReflection.current.position.x = (0.5 + Math.sin(t * 0.21) * 0.8) / factor;
      warmReflection.current.intensity = (reduced ? 0.27 : 0.27 + Math.sin(t * 0.32) * 0.035)
        * (reduced ? 1 : THREE.MathUtils.smoothstep(t, 0.25, 1.65));
    }
    if (blueReflection.current) {
      blueReflection.current.position.x = (-0.6 + Math.cos(t * 0.18) * 0.65) / factor;
      blueReflection.current.intensity = (reduced ? 0.16 : 0.16 + Math.cos(t * 0.29) * 0.025)
        * (reduced ? 1 : THREE.MathUtils.smoothstep(t, 0.25, 1.65));
    }
  });
  return (
    <group ref={rig} position={position} rotation={[0, rotation, 0]} scale={factor}>
      <primitive object={model.clone} dispose={null} />
      {introPresentation && (
        <>
          <pointLight ref={warmReflection} color="#ffd1a0" position={[0, 1, 1.5]} intensity={0.27} distance={4 / factor} />
          <pointLight ref={blueReflection} color="#66dfff" position={[-0.6, 0.5, 1.3]} intensity={0.16} distance={3 / factor} />
        </>
      )}
    </group>
  );
}

const INTRO_ROVER: Asset3D = {
  kind: "msl",
  source: "reconstruction",
  note: "Stylized Curiosity reconstruction; not flight CAD.",
};

function IntroRover() {
  const rig = useRef<THREE.Group>(null);
  const model = useRef<THREE.Group>(null);
  const size = useThree((state) => state.size);
  const { quality } = useRootRenderProfile();

  useLayoutEffect(() => {
    if (!rig.current || !model.current) return;
    // Measure the assembled reconstruction once per viewport change. Keeping
    // it in this canvas preserves the terrain, lighting, and intro lifecycle.
    rig.current.position.set(0, 0, 0);
    rig.current.scale.setScalar(1);
    model.current.position.set(0, 0, 0);
    model.current.updateWorldMatrix(true, true);
    const bounds = new THREE.Box3().setFromObject(model.current);
    if (bounds.isEmpty()) return;
    const dimensions = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    model.current.position.set(-center.x, -bounds.min.y, -center.z);

    const portrait = size.width / Math.max(size.height, 1) < 0.95;
    const z = portrait ? -14 : -6;
    const frameHeight = 2 * (CAMERA_TARGETS.intro.position.z - z) * Math.tan(THREE.MathUtils.degToRad(47 / 2));
    const frameWidth = frameHeight * size.width / Math.max(size.height, 1);
    const scale = Math.min(
      frameHeight * (portrait ? 0.3 : 0.4) / dimensions.y,
      frameWidth * (portrait ? 0.55 : 0.34) / dimensions.x,
    );
    const x = frameWidth * (portrait ? 0.23 : 0.27);

    // Land on the same DEM as the visible surface rather than a guessed floor.
    const terrain = TERRAIN_RESOURCES.get(`mars:${quality}`);
    let floor = -2.35;
    if (terrain) {
      const surface = new THREE.Mesh(terrain.geometry, terrain.material);
      surface.position.set(0, -2.35, -13);
      surface.updateMatrixWorld(true);
      const ray = new THREE.Raycaster(new THREE.Vector3(x, 10, z), new THREE.Vector3(0, -1, 0));
      floor = ray.intersectObject(surface, false)[0]?.point.y ?? floor;
    }
    rig.current.scale.setScalar(scale);
    rig.current.position.set(x, floor + 0.04, z);
  }, [size.width, size.height, quality]);

  return (
    <group ref={rig}>
      <group ref={model} rotation={[0, -0.62, 0]}>
        <ArchiveModel asset={INTRO_ROVER} amount={0} showLabels={false} />
      </group>
    </group>
  );
}

function ShootingStars({ enabled }: { enabled: boolean }) {
  const streak = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const startAt = useRef(0);
  const nextAt = useRef(0);
  const wasEnabled = useRef(false);
  const geometry = useMemo(() => new THREE.PlaneGeometry(2.25, 0.075), []);
  const coreGeometry = useMemo(() => new THREE.PlaneGeometry(2.1, 0.018), []);
  const glowMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#3aaaff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }), []);
  const coreMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    color: "#e5f8ff", transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }), []);
  useEffect(() => () => {
    geometry.dispose();
    coreGeometry.dispose();
    glowMaterial.dispose();
    coreMaterial.dispose();
  }, [coreGeometry, coreMaterial, geometry, glowMaterial]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (enabled !== wasEnabled.current) {
      wasEnabled.current = enabled;
      if (enabled) nextAt.current = t + 1.8 + Math.random() * 1.5;
      else if (streak.current) streak.current.visible = false;
    }
    if (!streak.current) return;
    if (!enabled) {
      streak.current.visible = false;
      return;
    }
    if (t >= nextAt.current) {
      startAt.current = t;
      nextAt.current = t + 12 + Math.random() * 7;
    }
    const progress = (t - startAt.current) / 0.95;
    const active = progress >= 0 && progress < 1;
    streak.current.visible = active;
    if (!active) return;
    const eased = progress * progress * (3 - 2 * progress);
    streak.current.position.set(-14 + eased * 28, 8.5 - eased * 5.5, -14);
    const fade = Math.sin(Math.PI * progress) ** 0.72;
    if (glow.current) glow.current.opacity = fade * 0.42;
    if (core.current) core.current.opacity = fade * 0.82;
  });
  return (
    <group ref={streak} visible={false} rotation={[0, 0, -0.2]}>
      <mesh geometry={geometry} material={glowMaterial} />
      <mesh geometry={coreGeometry} material={coreMaterial} position={[0.04, 0.008, 0.01]} />
    </group>
  );
}

function World({
  mode,
  compact,
  reduced,
  selectedWorld,
  onPlanetHover,
  onPlanetSelect,
}: Pick<Props, "mode" | "selectedWorld" | "onPlanetHover" | "onPlanetSelect"> & { compact: boolean; reduced: boolean }) {
  const profile = useRootRenderProfile();
  const sun = useRef<THREE.DirectionalLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);
  const hemisphere = useRef<THREE.HemisphereLight>(null);
  const ambient = useRef<THREE.AmbientLight>(null);
  const bounce = useRef<THREE.PointLight>(null);
  const lastMode = useRef(mode);
  const modeBlend = useRef(1);
  const fromSun = useRef(LIGHT_TARGETS[mode].sun.clone());
  const fromFill = useRef(LIGHT_TARGETS[mode].fill.clone());
  const fromGround = useRef(LIGHT_TARGETS[mode].ground.clone());
  useFrame((state, dt) => {
    if (lastMode.current !== mode) {
      if (sun.current) fromSun.current.copy(sun.current.color);
      if (fill.current) fromFill.current.copy(fill.current.color);
      if (hemisphere.current) fromGround.current.copy(hemisphere.current.groundColor);
      lastMode.current = mode;
      modeBlend.current = 0;
    }
    modeBlend.current = Math.min(1, modeBlend.current + Math.min(dt, 0.08) / 0.72);
    const blend = THREE.MathUtils.smoothstep(modeBlend.current, 0, 1);
    const targetLight = LIGHT_TARGETS[mode];
    if (sun.current) sun.current.color.lerpColors(fromSun.current, targetLight.sun, blend);
    if (fill.current) fill.current.color.lerpColors(fromFill.current, targetLight.fill, blend);
    if (hemisphere.current) hemisphere.current.groundColor.lerpColors(fromGround.current, targetLight.ground, blend);

    if (mode !== "intro") return;
    const t = state.clock.elapsedTime;
    const reveal = reduced ? 1 : THREE.MathUtils.smoothstep(t, 0.08, 1.45);
    const variation = reduced ? 1 : 1 + Math.sin(t * 0.24) * 0.025;
    if (sun.current) sun.current.intensity = 3.45 * reveal * variation;
    if (fill.current) fill.current.intensity = 0.95 * reveal * (reduced ? 1 : 1 + Math.sin(t * 0.18 + 1.4) * 0.035);
    if (hemisphere.current) hemisphere.current.intensity = 0.72 * reveal;
    if (ambient.current) ambient.current.intensity = 0.22 * reveal;
    if (bounce.current) bounce.current.intensity = 1.25 * reveal * (reduced ? 1 : 1 + Math.sin(t * 0.17) * 0.025);
  });
  return (
    <>
      <color attach="background" args={["#020817"]} />
      <hemisphereLight ref={hemisphere} args={["#c4ddff", "#37201a", 0.72]} />
      <ambientLight ref={ambient} intensity={0.22} color="#8eb8ed" />
      <directionalLight
        ref={sun}
        position={[-8, 15, 8]}
        intensity={mode === "intro" ? 3.45 : 3.1}
        color="#f6f8ff"
        castShadow={profile.shadows}
        shadow-mapSize={[profile.shadowMapSize, profile.shadowMapSize]}
        shadow-camera-left={-42}
        shadow-camera-right={42}
        shadow-camera-top={32}
        shadow-camera-bottom={-30}
        shadow-camera-far={90}
        shadow-bias={-0.00018}
        shadow-normalBias={0.035}
      />
      <directionalLight ref={fill} position={[9, 3, 5]} intensity={0.95} color="#4a9bff" />
      <pointLight ref={bounce} position={[0, 8, -16]} intensity={1.25} color="#dcecff" distance={48} />
      <DustMotes color={mode === "mars" ? "#ffbc78" : "#91dfff"} reduced={reduced} cinematic={mode === "intro"} />
      <ShootingStars enabled={mode === "intro" && !reduced} />

      {mode === "intro" && (
        <>
          <Surface kind="mars" position={[0, -2.35, -13]} />
          <SurfaceBoulders kind="mars" compact={compact} clearRight />
          <IntroRover />
          <CelestialBody planet="moon" position={compact ? [-3.4, 9.5, -30] : [-8.6, 13.5, -34]} radius={compact ? 1.45 : 3.35} introHoverable reduced={reduced} />
          <CelestialBody planet="mars" position={compact ? [4.6, 7.2, -39] : [10.3, 8.5, -38]} radius={compact ? 2.05 : 4.15} introHoverable reduced={reduced} />
          <CelestialBody planet="earth" position={compact ? [2.6, 8.2, -54] : [14, 13, -62]} radius={compact ? 0.1 : 0.16} />
        </>
      )}

      {mode === "moon" && (
        <>
          <Surface kind="moon" />
          <SurfaceBoulders kind="moon" compact={compact} />
          <CelestialBody planet="earth" position={compact ? [0, 6.5, -23] : [-5.5, 6.8, -26]} radius={compact ? 2 : 2.65} />
          {!compact && <CelestialBody planet="moon" position={[11, 6, -34]} radius={3.7} />}
          <Suspense fallback={null}>
            <RootNASAAsset src={NASA_MODELS.lunarModule} position={compact ? [-3.2, -2.15, -13] : [-6.2, -2.15, -13]} height={compact ? 2.5 : 3.65} rotation={-0.4} />
          </Suspense>
        </>
      )}

      {mode === "mars" && (
        <>
          <Surface kind="mars" />
          <SurfaceBoulders kind="mars" compact={compact} />
          <OrbitingRock position={compact ? [-1.65, 6.3, -19] : [-1.8, 7.3, -24]} scale={compact ? [0.32, 0.23, 0.29] : [0.42, 0.31, 0.37]} speed={0.04} />
          <OrbitingRock position={compact ? [1.55, 5.6, -24] : [3.2, 5.2, -29]} scale={compact ? [0.17, 0.13, 0.15] : [0.25, 0.19, 0.22]} speed={-0.025} />
          <CelestialBody planet="earth" position={compact ? [-4.5, 8.5, -48] : [13.8, 10, -54]} radius={compact ? 0.07 : 0.095} />
        </>
      )}

      {mode === "selection" && (
        <>
          <CelestialBody planet="moon" position={compact ? [-1.2, 2.25, 0] : [-3.25, 2.55, 0]} radius={compact ? 1.08 : 2.15} selectable hovered={selectedWorld === "moon"} onHover={onPlanetHover} onSelect={onPlanetSelect} />
          <CelestialBody planet="mars" position={compact ? [1.2, 2.25, -0.4] : [3.15, 2.55, -0.4]} radius={compact ? 0.98 : 1.82} selectable hovered={selectedWorld === "mars"} onHover={onPlanetHover} onSelect={onPlanetSelect} />
          <CelestialBody planet="earth" position={compact ? [-2.15, 5.45, -12] : [-4.8, 6.4, -19]} radius={compact ? 0.42 : 0.88} />
          <OrbitingRock position={compact ? [2.3, 4.2, -5] : [5.35, 5, -6]} scale={compact ? [0.12, 0.085, 0.1] : [0.19, 0.13, 0.16]} speed={0.025} />
          <OrbitingRock position={compact ? [0.1, 4.6, -8] : [1.15, 5.35, -10]} scale={compact ? [0.07, 0.055, 0.065] : [0.11, 0.08, 0.09]} speed={-0.018} />
        </>
      )}
    </>
  );
}

function UpcomingStageWarmup({ mode }: { mode: RootExpeditionMode }) {
  if (mode === "intro") {
    return (
      <group visible={false}>
        <Surface kind="moon" />
        <WarmRootModel src={NASA_MODELS.lunarModule} />
      </group>
    );
  }
  if (mode === "moon") {
    return (
      <group visible={false}>
        <Surface kind="mars" />
        <WarmRootModel src={NASA_MODELS.lunarModule} />
      </group>
    );
  }
  if (mode === "mars") {
    return (
      <group visible={false}>
        <Surface kind="moon" position={[0, -10.8, -14]} />
      </group>
    );
  }
  return null;
}

export default function RootExpeditionScene({
  className,
  mode,
  selectedWorld = null,
  onPlanetHover,
  onPlanetSelect,
}: Props) {
  const sceneContainer = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const [supported, setSupported] = useState<boolean | null>(null);
  const [profile, lowerQuality] = useAdaptiveRenderProfile();
  const { compact, reducedMotion: reduced } = profile;
  const [lastSample, setLastSample] = useState<FrameBudgetSample | null>(null);
  const [pageVisible, setPageVisible] = useState(true);
  const [active, setActive] = useState(true);
  useEffect(() => {
    setSupported(supportsWebGL());
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncVisibility();
    document.addEventListener("visibilitychange", syncVisibility);
    const host = sceneContainer.current;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting && entry.intersectionRatio > 0));
    if (host) observer.observe(host);
    return () => {
      document.removeEventListener("visibilitychange", syncVisibility);
      observer.disconnect();
    };
  }, []);

  const upcomingMode = mode === "intro" ? "moon" : mode === "moon" ? "mars" : mode === "mars" ? "selection" : null;
  useEffect(() => {
    if (!upcomingMode) return;
    const assets = STAGE_ASSETS[upcomingMode];
    for (const texture of assets.textures) useTexture.preload(texture);
    for (const model of assets.models) useGLTF.preload(model, ROOT_DRACO_PATH, true);
  }, [upcomingMode]);

  useEffect(() => {
    if (supported !== true) return;
    const canvas = sceneContainer.current?.querySelector("canvas");
    const host = sceneContainer.current;
    if (!canvas || !host) return;
    // Canvas props size the R3F wrapper. Size the drawing surface itself as
    // well; otherwise the browser can leave it at the intrinsic 300×150 size.
    Object.assign(canvas.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    });
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const renderer = rendererRef.current;
      if (renderer && rect.width > 0 && rect.height > 0) renderer.setSize(rect.width, rect.height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    window.addEventListener("resize", resize);
    resize();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [compact, supported]);

  const fallback = (
    <div className="absolute inset-0 bg-[#020817]">
      <img src={mode === "moon" ? "/images/lunar-closeup.jpg" : "/images/mars-horizon.jpg"} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
      <p className="absolute right-4 top-4 max-w-xs rounded-xl border border-white/15 bg-ink/85 p-3 text-sm leading-relaxed text-slate-300">
        3D rendering unavailable. {mode === "selection" ? "Use the destination cards to explore the Moon and Mars." : "Mission photographs and written records remain available."}
      </p>
    </div>
  );

  return (
    <div ref={sceneContainer} data-root-expedition-scene="true" data-render-quality={profile.quality} data-render-sample-ms={lastSample?.meanMs.toFixed(2)} data-render-slow-ratio={lastSample?.slowFrameRatio.toFixed(3)} className={className} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "hidden", pointerEvents: "auto" }}>
      <style>{`[data-root-expedition-scene="true"] canvas { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; }`}</style>
      {supported === false ? (
        fallback
      ) : supported === null ? (
        <div className="absolute inset-0 bg-[#020817]" />
      ) : (
        <RootSceneBoundary fallback={fallback}>
        <Canvas
          fallback={fallback}
          className="!absolute inset-0"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "auto" }}
          onCreated={({ gl }) => {
            rendererRef.current = gl;
            // R3F styles the wrapper; explicitly size its canvas element too so
            // the drawing surface tracks the full-viewport root scene.
            Object.assign(gl.domElement.style, {
              position: "absolute",
              inset: "0",
              width: "100%",
              height: "100%",
            });
            const rect = sceneContainer.current?.getBoundingClientRect();
            if (rect && rect.width > 0 && rect.height > 0) gl.setSize(rect.width, rect.height, false);
          }}
          dpr={[1, Math.min(profile.dprMax, 1.35)]}
          frameloop={active && pageVisible ? "always" : "demand"}
          shadows={profile.shadows}
          gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
          camera={{ position: [0, 0.5, 18], fov: 47, near: 0.1, far: 160 }}
          onPointerMissed={() => onPlanetHover?.(null)}
        >
          <RootRenderContext.Provider value={profile}>
            <RenderBudgetMonitor enabled={active && pageVisible} onSlowFrames={lowerQuality} onSample={setLastSample} resetKey={mode} />
            <StarLayers compact={compact} reduced={reduced} cinematic={mode === "intro"} />
            <CameraFlight mode={mode} reduced={reduced} />
            <Suspense fallback={null}>
              <World mode={mode} compact={compact} reduced={reduced} selectedWorld={selectedWorld} onPlanetHover={onPlanetHover} onPlanetSelect={onPlanetSelect} />
            </Suspense>
            <Suspense fallback={null}>
              <UpcomingStageWarmup mode={mode} />
            </Suspense>
          </RootRenderContext.Provider>
        </Canvas>
        </RootSceneBoundary>
      )}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(115%_92%_at_50%_42%,transparent_34%,rgba(2,8,23,0.46)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#020817]/70 via-[#020817]/20 to-transparent" />
    </div>
  );
}
