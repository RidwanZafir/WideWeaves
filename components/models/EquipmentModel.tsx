"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { Asset3D, ModelComponent, ModelKey } from "@/data/types";
import { MODEL_COMPONENTS } from "@/data/components";
import { CameraOptics, CollarBands, FoilPanel, MountingRing, RadialSolarPanel, SurfacePanel, combineGeometry, useDetailGeometry, useModelReducedMotion } from "./ModelDetails";

/* ------------------------------------------------------------------ */
/* materials                                                           */
/* ------------------------------------------------------------------ */
export const M = {
  white: "#d7dce4",
  warmWhite: "#e6e2d8",
  grey: "#8b939d",
  midGrey: "#5b636e",
  dark: "#2b3038",
  black: "#141719",
  gold: "#c99a34",
  foil: "#e5b845",
  silver: "#b4bec9",
  blue: "#1d3f72",
  solar: "#16224a",
  solarCell: "#2c5d9e",
  red: "#a8352a",
  copper: "#a8672f",
  tire: "#202327",
  wheel: "#464c55",
  teal: "#1c6f7a",
};

/* ------------------------------------------------------------------ */
/* explode / selection context                                         */
/* ------------------------------------------------------------------ */
interface ModelCtx {
  amount: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  showLabels: boolean;
  model: ModelKey;
  reducedMotion?: boolean;
  /** Component metadata for the current record; falls back to the legacy per-model list. */
  parts?: ModelComponent[];
  variant?: Asset3D["variant"];
}

export const ModelContext = createContext<ModelCtx>({
  amount: 0,
  selected: null,
  onSelect: () => {},
  showLabels: false,
  model: "mer",
  reducedMotion: false,
});

/* ------------------------------------------------------------------ */
/* primitives                                                          */
/* ------------------------------------------------------------------ */
export function Strut({
  from,
  to,
  radius = 0.022,
  color = M.midGrey,
  metalness = 0.7,
  roughness = 0.4,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius?: number;
  color?: string;
  metalness?: number;
  roughness?: number;
}) {
  const { position, quaternion, length } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const dir = new THREE.Vector3().subVectors(b, a);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize(),
    );
    return { position: mid.toArray() as [number, number, number], quaternion: q, length: len };
  }, [from, to]);

  return (
    <mesh position={position} quaternion={quaternion} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, 8]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
}

export function Wheel({
  position,
  radius = 0.13,
  width = 0.16,
  cleats = 8,
  mesh = false,
  axis = "x",
  treadPattern = "straight",
  color = M.tire,
}: {
  position: [number, number, number];
  radius?: number;
  width?: number;
  cleats?: number;
  mesh?: boolean;
  axis?: "x" | "z";
  treadPattern?: "straight" | "chevron" | "curved";
  color?: string;
}) {
  // Every piece is built around the same local Z axle, then oriented for the chassis.
  const tread = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [];
    const count = Math.max(6, cleats);
    for (let i = 0; i < count; i++) {
      const angle = i * Math.PI * 2 / count;
      if (treadPattern === "chevron") {
        for (const side of [-1, 1]) pieces.push(new THREE.BoxGeometry(radius * 0.065, radius * 0.04, width * 0.58)
          .rotateY(side * 0.45).translate(0, radius * 1.01, side * width * 0.24).rotateZ(angle));
      } else if (treadPattern === "curved") {
        for (let segment = 0; segment < 4; segment++) {
          const z = (segment / 3 - 0.5) * width * 0.8;
          pieces.push(new THREE.BoxGeometry(radius * 0.05, radius * 0.035, width * 0.3)
            .rotateY((segment / 3 - 0.5) * 0.65)
            .translate(radius * 0.11 * (1 - (2 * z / width) ** 2), radius * 1.01, z).rotateZ(angle));
        }
      } else pieces.push(new THREE.BoxGeometry(radius * 0.1, radius * 0.075, width * 1.06)
        .translate(0, radius * 1.005, 0).rotateZ(angle));
    }
    if (mesh) {
      // A woven wire wheel reads as an open cage, rather than a second solid tire.
      for (const side of [-1, 1]) {
        pieces.push(new THREE.TorusGeometry(radius * 0.89, radius * 0.027, 5, 28)
          .translate(0, 0, side * width * 0.45));
        for (let i = 0; i < 12; i++) {
          pieces.push(new THREE.BoxGeometry(radius * 1.7, radius * 0.018, radius * 0.018)
            .rotateZ(i * Math.PI / 12 + side * 0.12).translate(0, 0, side * width * 0.4));
        }
      }
    }
    return combineGeometry(pieces);
  }, [radius, width, cleats, mesh, treadPattern]);
  const hubs = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [
      new THREE.CylinderGeometry(radius * 0.3, radius * 0.3, width * 1.2, 16).rotateX(Math.PI / 2),
    ];
    for (const side of [-1, 1]) {
      pieces.push(new THREE.TorusGeometry(radius * 0.7, radius * 0.028, 5, 24)
        .translate(0, 0, side * width * 0.52));
      for (let i = 0; i < 6; i++) {
        const angle = i * Math.PI / 3;
        pieces.push(new THREE.CylinderGeometry(radius * 0.034, radius * 0.034, radius * 0.028, 6)
          .rotateX(Math.PI / 2).translate(Math.cos(angle) * radius * 0.47, Math.sin(angle) * radius * 0.47, side * width * 0.54));
        pieces.push(new THREE.BoxGeometry(radius * 0.4, radius * 0.045, radius * 0.025)
          .translate(radius * 0.46, 0, side * width * 0.53).rotateZ(angle));
      }
    }
    return combineGeometry(pieces);
  }, [radius, width]);
  return (
    <group position={position} rotation={[0, axis === "x" ? Math.PI / 2 : 0, 0]}>
      {mesh ? (
        <mesh scale={[1, 1, width / (radius * 0.2)]} castShadow receiveShadow>
          <torusGeometry args={[radius * 0.9, radius * 0.1, 6, 28]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.7} roughness={0.54} wireframe />
        </mesh>
      ) : (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[radius, radius, width, 28]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.75} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[radius * 0.73, radius * 0.73, width * 1.025, 24]} />
            <meshStandardMaterial color={M.wheel} metalness={0.75} roughness={0.43} />
          </mesh>
        </>
      )}
      <mesh geometry={tread} castShadow receiveShadow>
        <meshStandardMaterial color={mesh ? M.silver : M.midGrey} metalness={0.75} roughness={0.46} />
      </mesh>
      <mesh geometry={hubs}>
        <meshStandardMaterial color={M.silver} metalness={0.82} roughness={0.34} />
      </mesh>
    </group>
  );
}

export function SolarPanel({
  size,
  position,
  rotation = [0, 0, 0],
  cells = 5,
  color = M.solar,
}: {
  size: [number, number];
  position: [number, number, number];
  rotation?: [number, number, number];
  cells?: number;
  color?: string;
}) {
  const [w, h] = size;
  const rows = Math.max(2, Math.round(cells * h / w));
  const cellGeometry = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [];
    for (let column = 0; column < cells; column++) {
      for (let row = 0; row < rows; row++) {
        pieces.push(new THREE.BoxGeometry(w / cells - w * 0.015, 0.003, h / rows - h * 0.024)
          .translate(-w / 2 + w / cells * (column + 0.5), 0.017, -h / 2 + h / rows * (row + 0.5)));
      }
    }
    return combineGeometry(pieces);
  }, [w, h, cells, rows]);
  const frame = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [];
    for (const side of [-1, 1]) {
      pieces.push(new THREE.BoxGeometry(w, 0.012, 0.014).translate(0, 0.017, side * (h / 2 - 0.007)));
      pieces.push(new THREE.BoxGeometry(0.014, 0.012, h).translate(side * (w / 2 - 0.007), 0.017, 0));
    }
    for (let column = 0; column < cells; column++) {
      pieces.push(new THREE.BoxGeometry(0.003, 0.002, h * 0.94)
        .translate(-w / 2 + w / cells * (column + 0.5), 0.021, 0));
    }
    for (let row = 1; row < rows; row++) {
      pieces.push(new THREE.BoxGeometry(w * 0.96, 0.002, 0.003)
        .translate(0, 0.021, -h / 2 + row * h / rows));
    }
    const screwRadius = Math.min(w, h) * 0.012;
    for (const x of [-1, 1]) for (const z of [-1, 1]) {
      pieces.push(new THREE.CylinderGeometry(screwRadius, screwRadius, 0.004, 6)
        .translate(x * (w / 2 - screwRadius - 0.012), 0.02, z * (h / 2 - screwRadius - 0.012)));
    }
    return combineGeometry(pieces);
  }, [w, h, cells, rows]);
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, 0.025, h]} />
        <meshStandardMaterial
          color={color}
          metalness={0.45}
          roughness={0.4}
        />
      </mesh>
      <mesh geometry={cellGeometry} receiveShadow>
        <meshStandardMaterial color="#25487c" metalness={0.55} roughness={0.28} emissive="#234777" emissiveIntensity={0.1} />
      </mesh>
      <mesh geometry={frame}>
        <meshStandardMaterial color="#8ba4bc" metalness={0.75} roughness={0.38} />
      </mesh>
    </group>
  );
}

export function Dish({
  position,
  radius = 0.2,
  rotation = [0, 0, 0],
  color = M.warmWhite,
}: {
  position: [number, number, number];
  radius?: number;
  rotation?: [number, number, number];
  color?: string;
}) {
  const profile = useMemo(() => Array.from({ length: 11 }, (_, i) => {
    const fraction = i / 10;
    return new THREE.Vector2(radius * fraction, radius * fraction * fraction * 0.28);
  }), [radius]);
  const dishGeometry = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [new THREE.LatheGeometry(profile, 24)];
    for (let rib = 0; rib < 6; rib++) {
      const angle = rib * Math.PI / 3;
      const points = Array.from({ length: 7 }, (_, i) => {
        const fraction = 0.3 + i / 6 * 0.66;
        return new THREE.Vector3(Math.cos(angle) * radius * fraction, radius * fraction * fraction * 0.28 - radius * 0.012, Math.sin(angle) * radius * fraction);
      });
      pieces.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 7, radius * 0.008, 3));
    }
    return combineGeometry(pieces);
  }, [radius, profile]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={dishGeometry} castShadow>
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.48} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, radius * 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, radius * 0.025, 5, 24]} />
        <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.36} />
      </mesh>
      <mesh position={[0, radius * 0.22, 0]}>
        <cylinderGeometry args={[radius * 0.035, radius * 0.035, radius * 0.44, 6]} />
        <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, radius * 0.46, 0]}>
        <sphereGeometry args={[radius * 0.06, 8, 6]} />
        <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -radius * 0.12, 0]}>
        <cylinderGeometry args={[radius * 0.16, radius * 0.12, radius * 0.3, 10]} />
        <meshStandardMaterial color={M.midGrey} metalness={0.7} roughness={0.42} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* LabelSprite: GPU-drawn callout (no DOM portals inside the canvas)   */
/* ------------------------------------------------------------------ */
export function LabelSprite({
  text,
  active,
  onSelect,
}: {
  text: string;
  active: boolean;
  onSelect: () => void;
}) {
  const texture = useMemo(() => {
    const dpr = 2;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const font = "600 34px ui-sans-serif, system-ui, -apple-system, sans-serif";
    ctx.font = font;
    const textWidth = ctx.measureText(text).width;
    const padX = 26;
    const w = Math.ceil(textWidth + padX * 2);
    const h = 64;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const c = canvas.getContext("2d")!;
    c.scale(dpr, dpr);
    const radius = 16;
    c.beginPath();
    c.moveTo(radius, 0);
    c.arcTo(w, 0, w, h, radius);
    c.arcTo(w, h, 0, h, radius);
    c.arcTo(0, h, 0, 0, radius);
    c.arcTo(0, 0, w, 0, radius);
    c.closePath();
    c.fillStyle = active ? "rgba(30,20,4,0.92)" : "rgba(4,12,26,0.86)";
    c.fill();
    c.lineWidth = 2;
    c.strokeStyle = active ? "rgba(255,201,60,0.95)" : "rgba(96,200,255,0.7)";
    c.stroke();
    c.font = font;
    c.fillStyle = active ? "#ffe9ae" : "#dcf1ff";
    c.textBaseline = "middle";
    c.fillText(text, padX, h / 2 + 1);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [text, active]);
  useEffect(() => () => texture.dispose(), [texture]);

  const aspect = texture.image ? texture.image.width / texture.image.height : 4;
  const height = 0.115;

  return (
    <sprite
      userData={{ excludeFromBounds: true }}
      scale={[height * aspect, height, 1]}
      renderOrder={10}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <spriteMaterial map={texture} transparent depthTest={false} depthWrite={false} />
    </sprite>
  );
}

/* Parts whose labels stay visible even in the assembled view, because the
   callout points at something the viewer cannot otherwise identify. */
const LABELLED = new Set([
  "wheels",
  "mast",
  "arm",
  "solar",
  "suspension",
  "canopy",
  "rotor",
  "dish",
  "antenna",
  "array",
  "nozzle",
  "power",
]);

/* ------------------------------------------------------------------ */
/* Part: movable, selectable, labelled group                           */
/* ------------------------------------------------------------------ */
export function Part({
  id,
  offset,
  labelAt = [0, 0.3, 0],
  children,
}: {
  id: string;
  offset: [number, number, number];
  labelAt?: [number, number, number];
  children: ReactNode;
}) {
  const { amount, selected, onSelect, showLabels, model, parts, reducedMotion = false } = useContext(ModelContext);
  const group = useRef<THREE.Group>(null);
  const target = useMemo(() => new THREE.Vector3(...offset), [offset]);
  const desired = useMemo(() => new THREE.Vector3(), []);
  const [hovered, setHovered] = useState(false);

  useFrame((_, delta) => {
    if (!group.current) return;
    desired.copy(target).multiplyScalar(amount);
    if (reducedMotion) group.current.position.copy(desired);
    else group.current.position.lerp(desired, 1 - Math.exp(-9 * delta));
  });

  const meta = (parts ?? MODEL_COMPONENTS[model])?.find((c) => c.id === id);
  const isSelected = selected === id;

  return (
    <group
      ref={group}
      name={id}
      userData={{ afterlightPart: true, explodeOffset: offset }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(isSelected ? null : id);
      }}
    >
      {children}
      {(isSelected || hovered) && (
        <mesh position={labelAt} userData={{ excludeFromBounds: true }}>
          <sphereGeometry args={[0.055, 10, 8]} />
          <meshBasicMaterial color={isSelected ? "#ffc93c" : "#3fe7ff"} transparent opacity={0.85} />
        </mesh>
      )}
      {showLabels && meta && (amount > 0.35 || LABELLED.has(id)) && (
        <group position={[labelAt[0] + 0.16, labelAt[1] + 0.14, labelAt[2]]}>
          <LabelSprite text={meta.label} active={isSelected} onSelect={() => onSelect(id)} />
        </group>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Models                                                              */
/* ------------------------------------------------------------------ */
function MER() {
  const wheelZ = [-0.56, 0, 0.56];
  return (
    <group position={[0, 0, 0]}>
      {/* ---------------- body ---------------- */}
      <Part id="chassis" offset={[0, 0.75, 0]} labelAt={[0, 0.52, 0.4]}>
        {/* warm electronics box — the gold-foil wrapped body */}
        <RoundedBox args={[0.94, 0.3, 0.72]} radius={0.04} smoothness={3} position={[0, 0.52, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={M.warmWhite} metalness={0.35} roughness={0.55} />
        </RoundedBox>
        {/* gold foil thermal blanket on the flanks */}
        <FoilPanel size={[0.024, 0.26, 0.68]} position={[0.475, 0.52, 0]} />
        <FoilPanel size={[0.024, 0.26, 0.68]} position={[-0.475, 0.52, 0]} />
        {/* front panel with the hazard camera housing */}
        <mesh position={[0, 0.5, 0.36]}>
          <boxGeometry args={[0.8, 0.22, 0.02]} />
          <meshStandardMaterial color={M.dark} metalness={0.5} roughness={0.55} />
        </mesh>
        <CameraOptics positions={[[-0.21, 0.54, 0.39], [0.21, 0.54, 0.39]]} radius={0.028} depth={0.03} />
        <SurfacePanel size={[0.5, 0.18]} position={[0, 0.52, -0.362]} rotation={[0, Math.PI, 0]} louvers={4} />
        {/* top deck plate */}
        <mesh position={[0, 0.675, 0]} receiveShadow>
          <boxGeometry args={[0.9, 0.02, 0.68]} />
          <meshStandardMaterial color={M.silver} metalness={0.75} roughness={0.4} />
        </mesh>
      </Part>

      {/* ---------------- solar array ---------------- */}
      <Part id="solar" offset={[0, 1.35, 0.1]} labelAt={[1, 0.75, 0.02]}>
        <SolarPanel size={[0.86, 0.62]} position={[0.86, 0.72, 0.02]} rotation={[0, 0, 0.11]} cells={4} />
        <SolarPanel size={[0.86, 0.62]} position={[-0.86, 0.72, 0.02]} rotation={[0, 0, -0.11]} cells={4} />
        <SolarPanel size={[0.46, 0.58]} position={[0, 0.74, -0.06]} cells={2} />
        <Strut from={[0.44, 0.68, 0]} to={[0.46, 0.71, 0]} radius={0.022} color={M.foil} />
        <Strut from={[-0.44, 0.68, 0]} to={[-0.46, 0.71, 0]} radius={0.022} color={M.foil} />
      </Part>

      {/* ---------------- pancam mast ---------------- */}
      <Part id="mast" offset={[0.9, 1.0, 0.1]} labelAt={[0.28, 1.42, 0.2]}>
        <mesh position={[0.28, 0.8, 0.12]}>
          <cylinderGeometry args={[0.09, 0.11, 0.08, 16]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.7} roughness={0.45} />
        </mesh>
        <Strut from={[0.28, 0.82, 0.12]} to={[0.28, 1.36, 0.1]} radius={0.035} color={M.silver} />
        <Strut from={[0.2, 0.84, 0.12]} to={[0.26, 1.3, 0.1]} radius={0.012} color={M.midGrey} />
        <Strut from={[0.36, 0.84, 0.12]} to={[0.3, 1.3, 0.1]} radius={0.012} color={M.midGrey} />
        {/* pancam head */}
        <RoundedBox args={[0.4, 0.15, 0.16]} radius={0.03} smoothness={3} position={[0.28, 1.42, 0.1]} castShadow>
          <meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.5} />
        </RoundedBox>
        <CameraOptics positions={[[0.19, 1.42, 0.19], [0.37, 1.42, 0.19]]} radius={0.048} depth={0.07} />
        <mesh position={[0.28, 1.31, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.22, 12]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.65} roughness={0.4} />
        </mesh>
        <mesh position={[0.28, 1.5, 0.06]}>
          <boxGeometry args={[0.34, 0.03, 0.18]} />
          <meshStandardMaterial color={M.silver} metalness={0.65} roughness={0.4} />
        </mesh>
      </Part>

      {/* ---------------- high gain antenna ---------------- */}
      <Part id="antenna" offset={[-1.0, 0.95, -0.25]} labelAt={[-0.32, 1.08, -0.22]}>
        <Strut from={[-0.3, 0.68, -0.2]} to={[-0.32, 1.0, -0.22]} radius={0.028} color={M.silver} />
        <Dish position={[-0.32, 1.06, -0.22]} radius={0.19} rotation={[0.45, 0.35, 0]} color={M.warmWhite} />
        {/* UHF whip */}
        <Strut from={[0.1, 0.68, -0.3]} to={[0.12, 1.18, -0.34]} radius={0.008} color={M.silver} />
      </Part>

      {/* ---------------- robotic arm ---------------- */}
      <Part id="arm" offset={[0, 0.62, 1.15]} labelAt={[0.02, 0.1, 0.86]}>
        <Strut from={[0.06, 0.44, 0.34]} to={[0.26, 0.3, 0.6]} radius={0.033} color={M.silver} />
        <Strut from={[0.26, 0.3, 0.6]} to={[0.1, 0.16, 0.78]} radius={0.028} color={M.silver} />
        <Strut from={[0.1, 0.16, 0.78]} to={[0.02, 0.1, 0.86]} radius={0.022} color={M.foil} />
        {[[0.06, 0.44, 0.34], [0.26, 0.3, 0.6], [0.1, 0.16, 0.78]].map((p, i) => (
          <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.044, 0.044, 0.06, 10]} />
            <meshStandardMaterial color={M.dark} metalness={0.65} roughness={0.43} />
          </mesh>
        ))}
        <mesh position={[0, 0.08, 0.86]} rotation={[0.55, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.09, 14]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.85} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0.02, 0.9]} rotation={[0.55, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.02, 14]} />
          <meshStandardMaterial color={M.dark} metalness={0.4} roughness={0.5} />
        </mesh>
      </Part>

      {/* ---------------- rocker-bogie + wheels ---------------- */}
      <Part id="suspension" offset={[-1.55, 0.35, -0.7]} labelAt={[0.66, 0.26, 0.56]}>
        {[1, -1].map((sx) => (
          <group key={sx}>
            {/* rocker */}
            <Strut from={[sx * 0.44, 0.6, 0.3]} to={[sx * 0.66, 0.26, 0.56]} radius={0.026} color={M.silver} />
            <Strut from={[sx * 0.44, 0.6, -0.24]} to={[sx * 0.66, 0.26, -0.56]} radius={0.026} color={M.silver} />
            {/* bogie */}
            <Strut from={[sx * 0.66, 0.26, 0.56]} to={[sx * 0.68, 0.22, 0]} radius={0.022} color={M.silver} />
            <Strut from={[sx * 0.66, 0.26, -0.56]} to={[sx * 0.68, 0.22, 0]} radius={0.022} color={M.silver} />
            <Strut from={[sx * 0.44, 0.6, 0.3]} to={[sx * 0.6, 0.62, 0.02]} radius={0.02} color={M.midGrey} />
            {wheelZ.map((z) => (
              <Strut key={z} from={[sx * (z === 0 ? 0.68 : 0.66), z === 0 ? 0.22 : 0.26, z]} to={[sx * 0.68, 0.13, z]} radius={0.018} color={M.silver} />
            ))}
          </group>
        ))}
        <mesh position={[0, 0.63, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[1.05, 0.04, 0.3]} />
          <meshStandardMaterial color={M.foil} metalness={0.85} roughness={0.35} />
        </mesh>
      </Part>

      <Part id="wheels" offset={[0, -0.55, 0.2]} labelAt={[0.75, 0.13, 0.56]}>
        {[1, -1].map((sx) =>
          wheelZ.map((z) => (
            <Wheel
              key={`${sx}${z}`}
              position={[sx * 0.68, 0.13, z]}
              radius={0.13}
              width={0.16}
              cleats={12}
            />
          )),
        )}
      </Part>

      {/* ---------------- instruments ---------------- */}
      <Part id="instruments" offset={[0.75, 0.55, -0.85]} labelAt={[-0.3, 0.75, -0.16]}>
        {/* mini-TES on the mast base */}
        <mesh position={[-0.3, 0.68, -0.16]} castShadow>
          <boxGeometry args={[0.22, 0.16, 0.2]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.42} />
        </mesh>
        <mesh position={[-0.3, 0.78, -0.16]}>
          <cylinderGeometry args={[0.06, 0.06, 0.05, 14]} />
          <meshStandardMaterial color={M.gold} metalness={0.85} roughness={0.3} />
        </mesh>
        {/* spectrometer boxes on the deck */}
        <mesh position={[0.36, 0.7, -0.2]} castShadow>
          <boxGeometry args={[0.18, 0.06, 0.16]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[-0.06, 0.7, -0.22]} castShadow>
          <boxGeometry args={[0.14, 0.05, 0.14]} />
          <meshStandardMaterial color={M.dark} metalness={0.5} roughness={0.5} />
        </mesh>
        {/* calibration target */}
        <mesh position={[-0.2, 0.7, 0.28]} rotation={[-0.3, 0, 0]}>
          <cylinderGeometry args={[0.09, 0.09, 0.015, 18]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.2} roughness={0.7} />
        </mesh>
      </Part>
    </group>
  );
}

function MSL() {
  const perseverance = useContext(ModelContext).variant === "perseverance";
  const wheelRadius = perseverance ? 0.2625 : 0.254;
  return (
    <group scale={[1, 0.76, 1]}>
      <Part id="chassis" offset={[0, 0.8, 0]} labelAt={[0, 1.32, 0.73]}>
        <RoundedBox args={[2.0, 0.62, 1.45]} radius={0.08} smoothness={3} position={[0, 1.32, 0]} castShadow receiveShadow>
          <meshStandardMaterial color={M.warmWhite} metalness={0.45} roughness={0.5} />
        </RoundedBox>
        <FoilPanel size={[1.9, 0.04, 1.36]} position={[0, 1.65, 0]} />
        <mesh position={[0.55, 1.33, 0.73]}>
          <boxGeometry args={[0.5, 0.36, 0.04]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.5} />
        </mesh>
        <SurfacePanel size={[0.4, 0.26]} position={[0.55, 1.33, 0.752]} louvers={5} />
      </Part>

      <Part id="rtg" offset={[0, 1.1, -1.6]} labelAt={[0.4, 1.5, -0.95]}>
        <group position={[0, 1.49, -1.03]} rotation={[-Math.PI / 3, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.28, 0.3, 0.62, 12]} />
            <meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.45} />
          </mesh>
          {Array.from({ length: 8 }).map((_, i) => (
            <group key={i} rotation={[0, i * Math.PI / 4, 0]}>
              <mesh position={[0.4, 0, 0]} castShadow>
                <boxGeometry args={[0.32, 0.5, 0.022]} />
                <meshStandardMaterial color={M.midGrey} metalness={0.8} roughness={0.4} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.26, 0.26, 0.05, 12]} />
            <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      </Part>

      <Part id="mast" offset={[1.3, 1.6, 0]} labelAt={[0.58, 2.63, 0.6]}>
        <Strut from={[0.58, 1.6, 0.42]} to={[0.58, 2.55, 0.42]} radius={0.06} color={M.silver} />
        <RoundedBox args={[0.58, perseverance ? 0.28 : 0.24, 0.24]} radius={0.04} smoothness={3} position={[0.58, 2.63, 0.44]} castShadow>
          <meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.45} />
        </RoundedBox>
        {/* Stereo science cameras, outward navigation cameras and the laser optical head. */}
        <CameraOptics positions={[[0.7, 2.61, 0.59], [0.46, 2.61, 0.59]]} radius={0.047} depth={0.12} />
        <CameraOptics positions={[[0.84, 2.66, 0.59], [0.32, 2.66, 0.59]]} radius={0.027} depth={0.09} />
        <CameraOptics positions={[[0.58, perseverance ? 2.77 : 2.75, 0.6]]} radius={perseverance ? 0.073 : 0.06} depth={0.14} />
        <mesh position={[0.58, 2.48, 0.42]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.09, 0.09, 0.28, 12]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.7} roughness={0.42} />
        </mesh>
        <Strut from={[0.64, 1.68, 0.4]} to={[0.64, 2.42, 0.4]} radius={0.017} color={M.dark} />
        <mesh position={[0.58, 2.84, 0.4]}>
          <boxGeometry args={[0.5, 0.06, 0.3]} />
          <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.35} />
        </mesh>
      </Part>

      <Part id="antenna" offset={[-1.5, 1.4, 0.2]} labelAt={[-0.6, 2.04, 0.2]}>
        <Strut from={[-0.6, 1.65, 0.2]} to={[-0.6, 1.95, 0.2]} radius={0.045} color={M.silver} />
        <mesh position={[-0.6, 2.02, 0.2]} rotation={[0.15, 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.34, 0.34, 0.05, 6]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.5} roughness={0.4} />
        </mesh>
      </Part>

      <Part id="arm" offset={[0.2, 0.3, 1.6]} labelAt={[0.28, 0.44, 1.24]}>
        <Strut from={[0.35, 1.15, 0.72]} to={[0.55, 0.78, 1.02]} radius={0.055} color={M.silver} />
        <Strut from={[0.55, 0.78, 1.02]} to={[0.3, 0.5, 1.2]} radius={0.045} color={M.silver} />
        <mesh position={[0.28, 0.44, 1.24]} rotation={[0, 0.3, 0]}>
          <cylinderGeometry args={[perseverance ? 0.21 : 0.16, perseverance ? 0.21 : 0.16, 0.2, 14]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[0.28, 0.28, 1.27]}>
          <cylinderGeometry args={[0.03, 0.02, 0.28, 10]} />
          <meshStandardMaterial color={M.silver} metalness={0.95} roughness={0.2} />
        </mesh>
        {perseverance && <>
          <mesh position={[0.07, 0.44, 1.24]}><boxGeometry args={[0.1, 0.14, 0.16]} /><meshStandardMaterial color={M.warmWhite} metalness={0.6} roughness={0.4} /></mesh>
          <mesh position={[0.42, 0.43, 1.4]}><boxGeometry args={[0.13, 0.15, 0.12]} /><meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.4} /></mesh>
          <CameraOptics positions={[[0.42, 0.43, 1.475]]} radius={0.025} depth={0.04} />
        </>}
      </Part>

      <Part id="suspension" offset={[-1.9, 0.8, -0.6]} labelAt={[1.12, 0.6, 0.92]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <Strut from={[side * 0.9, 1.25, 0.62]} to={[side * 1.12, 0.6, 0.92]} radius={0.05} color={M.silver} />
            <Strut from={[side * 0.9, 1.25, -0.62]} to={[side * 1.12, 0.6, -0.92]} radius={0.05} color={M.silver} />
            <Strut from={[side * 1.12, 0.6, 0.92]} to={[side * 0.95, 0.55, 0]} radius={0.045} color={M.silver} />
            <Strut from={[side * 0.95, 0.55, 0]} to={[side * 1.12, 0.6, -0.92]} radius={0.045} color={M.silver} />
            {[-0.92, 0, 0.92].map((z) => (
              <Strut key={z} from={[side * (z === 0 ? 0.95 : 1.12), z === 0 ? 0.55 : 0.6, z]} to={[side * 1.12, wheelRadius / 0.76, z]} radius={0.035} color={M.silver} />
            ))}
          </group>
        ))}
      </Part>

      <Part id="wheels" offset={[0, -1.1, 0.4]} labelAt={[1.3, wheelRadius / 0.76, 0.92]}>
        {[
          [-1.12, 0.44, 0.92],
          [-1.12, 0.44, 0],
          [-1.12, 0.44, -0.92],
          [1.12, 0.44, 0.92],
          [1.12, 0.44, 0],
          [1.12, 0.44, -0.92],
        ].map((p, i) => (
          <group key={i} position={[p[0], wheelRadius / 0.76, p[2]]} scale={[1, 1 / 0.76, 1]}>
            <Wheel position={[0, 0, 0]} radius={wheelRadius} width={perseverance ? 0.27 : 0.32} cleats={perseverance ? 48 : 24} treadPattern={perseverance ? "curved" : "chevron"} color={M.grey} />
          </group>
        ))}
      </Part>

      <Part id="instruments" offset={[-0.6, 1.5, -1.3]} labelAt={[-0.55, 1.83, -0.1]}>
        <mesh position={[-0.55, 1.68, -0.1]} castShadow>
          <boxGeometry args={[0.4, 0.3, 0.4]} />
          <meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[-0.55, 1.86, -0.1]}>
          <cylinderGeometry args={[0.14, 0.14, 0.1, 14]} />
          <meshStandardMaterial color={M.gold} metalness={0.95} roughness={0.25} emissive="#7a5a12" emissiveIntensity={0.3} />
        </mesh>
        {perseverance && <group position={[0, 1.03, 0.745]}>
          <mesh><boxGeometry args={[0.38, 0.18, 0.05]} /><meshStandardMaterial color={M.dark} metalness={0.65} roughness={0.42} /></mesh>
          <group rotation={[Math.PI / 2, 0, 0]}><MountingRing position={[0, 0.035, 0]} radius={0.065} /></group>
        </group>}
      </Part>
    </group>
  );
}

function Sojourner() {
  return (
    <group>
      <Part id="body" offset={[0, 0.5, 0]} labelAt={[0, 0.19, 0.27]}>
        <RoundedBox args={[0.36, 0.13, 0.5]} radius={0.02} smoothness={3} position={[0, 0.19, 0]} castShadow>
          <meshStandardMaterial color={M.warmWhite} metalness={0.5} roughness={0.45} />
        </RoundedBox>
        <mesh position={[0, 0.18, 0.26]}>
          <boxGeometry args={[0.3, 0.1, 0.02]} />
          <meshStandardMaterial color={M.foil} metalness={0.9} roughness={0.3} />
        </mesh>
        <SurfacePanel size={[0.3, 0.1]} position={[0, 0.19, -0.252]} rotation={[0, Math.PI, 0]} louvers={3} />
      </Part>
      <Part id="solar" offset={[0, 0.5, 0]} labelAt={[0, 0.295, 0]}>
        <SolarPanel size={[0.46, 0.6]} position={[0, 0.28, 0]} cells={3} />
      </Part>
      <Part id="wheels" offset={[0, -0.25, 0]} labelAt={[0.26, 0.065, 0.25]}>
        {[
          [-0.22, 0.065, 0.25],
          [-0.22, 0.065, 0],
          [-0.22, 0.065, -0.25],
          [0.22, 0.065, 0.25],
          [0.22, 0.065, 0],
          [0.22, 0.065, -0.25],
        ].map((p, i) => (
          <group key={i}>
            <Wheel position={p as [number, number, number]} radius={0.065} width={0.075} cleats={6} />
            <Strut from={[Math.sign(p[0]) * 0.16, 0.16, p[2] * 0.65]} to={p as [number, number, number]} radius={0.008} color={M.silver} />
          </group>
        ))}
      </Part>
      <Part id="camera" offset={[0.4, 0.3, 0.4]} labelAt={[0.13, 0.2, 0.29]}>
        {/* Sojourner's cameras are body-mounted; it has no remote-sensing mast. */}
        {[-0.13, 0.13].map(x => <group key={x} position={[x, 0.2, 0.27]}>
          <mesh><boxGeometry args={[0.07, 0.05, 0.04]} /><meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.35} /></mesh>
          <CameraOptics positions={[[0, 0, 0.025]]} radius={0.014} depth={0.02} />
        </group>)}
        <group position={[0.12, 0.2, -0.27]} rotation={[0, Math.PI, 0]}>
          <mesh><boxGeometry args={[0.07, 0.05, 0.04]} /><meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.35} /></mesh>
          <CameraOptics positions={[[0, 0, 0.025]]} radius={0.014} depth={0.02} />
        </group>
      </Part>
      <Part id="apxs" offset={[0, 0.15, -0.5]} labelAt={[0, 0.13, -0.31]}>
        <Strut from={[0, 0.2, -0.24]} to={[0, 0.13, -0.3]} radius={0.008} color={M.silver} />
        <mesh position={[0, 0.13, -0.31]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.07, 12]} />
          <meshStandardMaterial color={M.silver} metalness={0.9} roughness={0.3} />
        </mesh>
      </Part>
    </group>
  );
}

function LRV() {
  return (
    <group>
      <Part id="chassis" offset={[0, 1.1, 0]} labelAt={[0, 0.735, 0.58]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.6, 0.06, 1.4]} />
          <meshStandardMaterial color={M.silver} metalness={0.85} roughness={0.4} />
        </mesh>
        <Strut from={[-1.3, 0.72, 0.55]} to={[1.3, 0.72, 0.55]} radius={0.035} color={M.silver} />
        <Strut from={[-1.3, 0.72, -0.55]} to={[1.3, 0.72, -0.55]} radius={0.035} color={M.silver} />
        <Strut from={[1.3, 0.72, -0.55]} to={[1.3, 0.72, 0.55]} radius={0.03} color={M.silver} />
        <Strut from={[-1.3, 0.72, -0.55]} to={[-1.3, 0.72, 0.55]} radius={0.03} color={M.silver} />
        <mesh position={[0, 0.74, 0.58]}>
          <boxGeometry args={[2.4, 0.02, 0.1]} />
          <meshStandardMaterial color={M.gold} metalness={0.9} roughness={0.3} />
        </mesh>
      </Part>

      <Part id="wheels" offset={[0, -0.9, 0]} labelAt={[1.15, 0.42, 0.96]}>
        {[
          [-1.15, 0.42, 0.84],
          [-1.15, 0.42, -0.84],
          [1.15, 0.42, 0.84],
          [1.15, 0.42, -0.84],
        ].map((p, i) => (
          <group key={i}>
            <Wheel position={p as [number, number, number]} radius={0.42} width={0.24} mesh axis="z" />
            <Strut from={[p[0], 0.42, p[2] * 0.65]} to={p as [number, number, number]} radius={0.035} color={M.silver} />
            <Strut from={[p[0] * 0.85, 0.7, p[2] * 0.72]} to={[p[0], 0.42, p[2] * 0.85]} radius={0.026} color={M.silver} />
          </group>
        ))}
      </Part>

      <Part id="seats" offset={[0, 1.4, -1.1]} labelAt={[-0.14, 1.02, 0.4]}>
        {[-0.4, 0.4].map((z) => (
          <group key={z} position={[0.1, 0.78, z]}>
            <mesh castShadow>
              <boxGeometry args={[0.52, 0.07, 0.44]} />
              <meshStandardMaterial color="#4a5a6a" metalness={0.3} roughness={0.8} />
            </mesh>
            <mesh position={[-0.24, 0.24, 0]} rotation={[0, 0, 0.16]} castShadow>
              <boxGeometry args={[0.07, 0.5, 0.44]} />
              <meshStandardMaterial color="#4a5a6a" metalness={0.3} roughness={0.8} />
            </mesh>
            <Strut from={[-0.2, 0.02, -0.19]} to={[-0.27, 0.45, -0.19]} radius={0.016} color={M.silver} />
            <Strut from={[-0.2, 0.02, 0.19]} to={[-0.27, 0.45, 0.19]} radius={0.016} color={M.silver} />
            <Strut from={[-0.15, -0.07, -0.17]} to={[0.2, -0.01, -0.17]} radius={0.015} color={M.silver} />
            <Strut from={[-0.15, -0.07, 0.17]} to={[0.2, -0.01, 0.17]} radius={0.015} color={M.silver} />
          </group>
        ))}
      </Part>

      <Part id="console" offset={[1.5, 1.2, 0]} labelAt={[0.53, 1.38, 0]}>
        <Strut from={[0.4, 0.78, 0]} to={[0.5, 1.12, 0]} radius={0.03} color={M.silver} />
        <mesh position={[0.5, 1.16, 0]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.3, 0.1, 0.34]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0.62, 1.26, 0]} rotation={[0.1, 0, 0.3]}>
          <boxGeometry args={[0.18, 0.16, 0.24]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.4} />
        </mesh>
        <Strut from={[0.53, 1.2, 0]} to={[0.53, 1.38, 0]} radius={0.018} color={M.silver} />
        <Strut from={[0.53, 1.38, -0.07]} to={[0.53, 1.38, 0.07]} radius={0.018} color={M.black} />
      </Part>

      <Part id="battery" offset={[-1.3, 0.6, 0.9]} labelAt={[-0.45, 0.9, 0.2]}>
        <mesh position={[-0.45, 0.86, 0.2]} castShadow>
          <boxGeometry args={[0.36, 0.24, 0.5]} />
          <meshStandardMaterial color={M.dark} metalness={0.65} roughness={0.45} />
        </mesh>
        <mesh position={[-0.45, 1.0, 0.2]}>
          <boxGeometry args={[0.3, 0.02, 0.44]} />
          <meshStandardMaterial color={M.copper} metalness={0.9} roughness={0.3} />
        </mesh>
        <SurfacePanel size={[0.26, 0.15]} position={[-0.45, 0.86, 0.452]} louvers={3} />
        <mesh position={[0.0, 0.86, -0.5]} castShadow>
          <boxGeometry args={[0.34, 0.24, 0.34]} />
          <meshStandardMaterial color={M.dark} metalness={0.65} roughness={0.45} />
        </mesh>
      </Part>

      <Part id="antenna" offset={[-1.1, 1.9, -0.9]} labelAt={[-0.9, 1.4, -0.5]}>
        <Strut from={[-0.9, 0.78, -0.5]} to={[-0.9, 1.3, -0.5]} radius={0.03} color={M.silver} />
        <Dish position={[-0.9, 1.36, -0.5]} radius={0.42} rotation={[0.6, 0.3, 0]} color={M.warmWhite} />
        <mesh position={[-0.9, 1.62, -0.5]} rotation={[Math.PI / 2.6, 0, 0]}>
          <boxGeometry args={[0.02, 0.5, 0.5]} />
          <meshStandardMaterial color={M.white} metalness={0.2} roughness={0.6} side={THREE.DoubleSide} transparent opacity={0.55} />
        </mesh>
      </Part>

      <Part id="fenders" offset={[0, 0.3, 1.7]} labelAt={[1.15, 0.92, 0.84]}>
        {[
          [-1.15, 0.9, 0.84],
          [-1.15, 0.9, -0.84],
          [1.15, 0.9, 0.84],
          [1.15, 0.9, -0.84],
        ].map((p, i) => (
          <group key={i}>
            <mesh position={p as [number, number, number]} rotation={[0, 0, 0.1]} castShadow>
              <boxGeometry args={[0.86, 0.03, 0.32]} />
              <meshStandardMaterial color="#6f7d8c" metalness={0.6} roughness={0.5} />
            </mesh>
            <Strut from={[p[0], 0.74, p[2] * 0.72]} to={[p[0], 1.0, p[2] * 0.72]} radius={0.018} color={M.silver} />
            <Strut from={[p[0], 1.0, p[2] * 0.72]} to={[p[0], 0.89, p[2]]} radius={0.018} color={M.silver} />
          </group>
        ))}
      </Part>
    </group>
  );
}

function LM() {
  return (
    <group>
      <Part id="descent" offset={[0, -1.4, 0]} labelAt={[0, 1.15, 1.9]}>
        <mesh position={[0, 1.15, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.9, 1.9, 1.18, 8]} />
          <meshStandardMaterial color={M.gold} metalness={0.95} roughness={0.32} />
        </mesh>
        <mesh position={[0, 1.78, 0]} castShadow>
          <cylinderGeometry args={[1.88, 1.88, 0.08, 8]} />
          <meshStandardMaterial color="#8a7a5a" metalness={0.7} roughness={0.55} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const angle = i * Math.PI / 4 + Math.PI / 8;
          return <FoilPanel key={i} size={[1.39, 1.05, 0.045]} position={[Math.sin(angle) * 1.77, 1.15, Math.cos(angle) * 1.77]} rotation={[0, angle, 0]} color={i % 2 ? M.foil : M.gold} />;
        })}
      </Part>

      <Part id="ascent" offset={[0, 1.9, 0]} labelAt={[-0.38, 2.7, 0.9]}>
        <RoundedBox args={[1.6, 1.35, 1.75]} radius={0.12} smoothness={3} position={[0, 2.55, 0]} castShadow>
          <meshStandardMaterial color="#a7a49a" metalness={0.65} roughness={0.55} />
        </RoundedBox>
        <mesh position={[0, 3.28, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.8, 0.35, 8]} />
          <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.45} />
        </mesh>
        <mesh position={[-0.38, 2.7, 0.88]} rotation={[0, 0, 0.12]}>
          <boxGeometry args={[0.42, 0.35, 0.03]} />
          <meshStandardMaterial color="#1a2733" metalness={0.9} roughness={0.15} emissive="#2b4a63" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0.38, 2.7, 0.88]} rotation={[0, 0, -0.12]}>
          <boxGeometry args={[0.42, 0.35, 0.03]} />
          <meshStandardMaterial color="#1a2733" metalness={0.9} roughness={0.15} emissive="#2b4a63" emissiveIntensity={0.25} />
        </mesh>
        <mesh position={[0, 2.0, 0.9]}>
          <boxGeometry args={[0.6, 0.5, 0.04]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.5} />
        </mesh>
        <mesh position={[0, 2.0, 0.93]}>
          <boxGeometry args={[0.43, 0.36, 0.022]} />
          <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.42} />
        </mesh>
        <SurfacePanel size={[0.35, 0.28]} position={[0, 2.0, 0.943]} color="#8c9196" />
        <Strut from={[0.13, 1.96, 0.95]} to={[0.13, 2.1, 0.95]} radius={0.018} color={M.dark} />
        <FoilPanel size={[0.035, 0.64, 1.0]} position={[-0.815, 2.35, -0.12]} color="#b5b3a8" />
      </Part>

      <Part id="legs" offset={[0, -0.6, 1.6]} labelAt={[2.19, 0.09, 2.19]}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
          const x = Math.cos(a) * 1.55;
          const z = Math.sin(a) * 1.55;
          return (
            <group key={i}>
              <Strut from={[x * 0.75, 1.7, z * 0.75]} to={[x * 2, 0.09, z * 2]} radius={0.07} color={M.silver} />
              <Strut from={[x * 1.25, 1.1, z * 1.25]} to={[x * 2, 0.09, z * 2]} radius={0.04} color={M.gold} />
              <mesh position={[x * 2.0, 0.04, z * 2.0]} castShadow>
                <cylinderGeometry args={[0.34, 0.34, 0.08, 18]} />
                <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.4} />
              </mesh>
            </group>
          );
        })}
      </Part>

      <Part id="engine" offset={[0, -1.9, 0]} labelAt={[0, 0.55, 0.46]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.62, 0.7, 20, 1, true]} />
          <meshStandardMaterial color="#5b5f66" metalness={0.85} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      </Part>

      <Part id="ladder" offset={[0, 0.4, 1.4]} labelAt={[0, 1.05, 2.08]}>
        <mesh position={[0, 1.83, 1.52]} castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.06, 1.2]} />
          <meshStandardMaterial color={M.silver} metalness={0.75} roughness={0.44} />
        </mesh>
        <group position={[0, 1.74, 2.08]}>
          {Array.from({ length: 9 }).map((_, i) => (
            <mesh key={i} position={[0, -i * 0.17, 0]}>
              <boxGeometry args={[0.34, 0.03, 0.04]} />
              <meshStandardMaterial color={M.silver} metalness={0.9} roughness={0.35} />
            </mesh>
          ))}
          <Strut from={[-0.18, 0.05, 0]} to={[-0.18, -1.4, 0]} radius={0.016} color={M.silver} />
          <Strut from={[0.18, 0.05, 0]} to={[0.18, -1.4, 0]} radius={0.016} color={M.silver} />
        </group>
      </Part>

      <Part id="rcs" offset={[1.6, 1.6, 0.6]} labelAt={[1.02, 3.05, 0.93]}>
        {[
          [1.02, 3.05, 0.93],
          [-1.02, 3.05, 0.93],
          [1.02, 3.05, -0.93],
          [-1.02, 3.05, -0.93],
        ].map((p, i) => {
          const directions: [number, number, number][] = [[0, 1, 0], [0, -1, 0], [Math.sign(p[0]), 0, 0], [0, 0, Math.sign(p[2])]];
          return (
            <group key={i}>
              <Strut from={[p[0] * 0.74, p[1], p[2] * 0.75]} to={p as [number, number, number]} radius={0.035} color={M.silver} />
              <group position={p as [number, number, number]}>
                <mesh><boxGeometry args={[0.18, 0.16, 0.18]} /><meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.4} /></mesh>
                {directions.map((direction, index) => {
                  const axis = new THREE.Vector3(...direction);
                  const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), axis);
                  return (
                    <mesh key={index} quaternion={orientation} position={axis.multiplyScalar(0.13)}>
                      <cylinderGeometry args={[0.035, 0.075, 0.14, 10, 1, true]} />
                      <meshStandardMaterial color={M.dark} metalness={0.72} roughness={0.4} side={THREE.DoubleSide} />
                    </mesh>
                  );
                })}
              </group>
            </group>
          );
        })}
      </Part>

      <Part id="antenna" offset={[-1.7, 1.6, -0.5]} labelAt={[-0.95, 3.15, -0.9]}>
        <Dish position={[-0.95, 3.15, -0.9]} radius={0.32} rotation={[1.1, 0.4, 0]} color={M.warmWhite} />
        <mesh position={[0.7, 3.4, 0.3]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 6]} />
          <meshStandardMaterial color={M.silver} metalness={0.9} roughness={0.3} />
        </mesh>
      </Part>
    </group>
  );
}

function Surveyor() {
  return (
    <group>
      <Part id="body" offset={[0, 0.8, 0]} labelAt={[0, 0.95, 0.75]}>
        {/* Open triangular truss, with insulated electronics boxes attached. */}
        {[0,1,2].map(i=>{const angle=i*Math.PI*2/3+0.6,next=angle+Math.PI*2/3;const p:[number,number,number]=[Math.cos(angle)*0.72,0.83,Math.sin(angle)*0.72];return <group key={i}>
          <Strut from={p} to={[Math.cos(next)*0.72,0.83,Math.sin(next)*0.72]} radius={0.026} color={M.silver} />
          <Strut from={p} to={[0,1.42,0]} radius={0.022} color={M.silver} />
          <mesh position={[p[0]*0.66,0.9,p[2]*0.66]}><boxGeometry args={[0.34,0.24,0.26]} /><meshStandardMaterial color={M.warmWhite} metalness={0.45} roughness={0.5} /></mesh>
        </group>})}
        <mesh position={[0,0.7,0]}><cylinderGeometry args={[0.16,0.25,0.34,16]} /><meshStandardMaterial color={M.midGrey} metalness={0.6} roughness={0.5} /></mesh>
      </Part>

      <Part id="legs" offset={[0, -0.5, 1.3]} labelAt={[0.95, 0.06, 0.65]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.6;
          const x = Math.cos(a) * 1.15;
          const z = Math.sin(a) * 1.15;
          return (
            <group key={i}>
              <Strut from={[x * 0.5, 0.9, z * 0.5]} to={[x, 0.055, z]} radius={0.045} color={M.silver} />
              <Strut from={[x * 0.55, 0.62, z * 0.55]} to={[x * 0.92, 0.055, z * 0.92]} radius={0.03} color={M.gold} />
              <mesh position={[x, 0.025, z]}>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 14]} />
                <meshStandardMaterial color={M.silver} metalness={0.85} roughness={0.35} />
              </mesh>
            </group>
          );
        })}
      </Part>

      <Part id="solar" offset={[0, 1.7, 0]} labelAt={[1, 1.43, -0.15]}>
        <Strut from={[0.55, 1.16, -0.15]} to={[1.0, 1.39, -0.15]} radius={0.028} color={M.silver} />
        <SolarPanel size={[1.15, 1.0]} position={[1.0, 1.4, -0.15]} rotation={[0.1, -0.3, 0.06]} cells={4} />
      </Part>

      <Part id="camera" offset={[0.9, 1.0, 0.9]} labelAt={[0.2, 1.6, 0.2]}>
        <Strut from={[0.2, 1.2, 0.2]} to={[0.2, 1.55, 0.2]} radius={0.025} color={M.silver} />
        <group position={[0.2, 1.6, 0.2]} rotation={[0.2, 0.5, 0]}>
          <mesh><boxGeometry args={[0.2, 0.16, 0.26]} /><meshStandardMaterial color={M.warmWhite} metalness={0.5} roughness={0.4} /></mesh>
          <CameraOptics positions={[[0, 0, 0.155]]} radius={0.05} depth={0.06} />
        </group>
      </Part>

      <Part id="scoop" offset={[0, 0.2, 1.5]} labelAt={[0.3, 0.28, 1.4]}>
        <Strut from={[0.1, 0.85, 0.5]} to={[0.35, 0.5, 1.05]} radius={0.03} color={M.silver} />
        <Strut from={[0.35, 0.5, 1.05]} to={[0.3, 0.32, 1.35]} radius={0.024} color={M.silver} />
        <mesh position={[0.3, 0.28, 1.4]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.18, 0.05, 0.2]} />
          <meshStandardMaterial color={M.gold} metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </Part>

      <Part id="antenna" offset={[-1.4, 0.9, -0.6]} labelAt={[-0.55, 1.5, -0.2]}>
        <mesh position={[-0.55, 1.5, -0.2]} rotation={[0.5, 0.4, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.03, 4]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.4} />
        </mesh>
        <Strut from={[-0.5, 1.2, -0.2]} to={[-0.55, 1.5, -0.2]} radius={0.022} color={M.silver} />
      </Part>
    </group>
  );
}

function Lunokhod() {
  return (
    <group>
      <Part id="body" offset={[0, 0.7, 0]} labelAt={[0, 0.62, 0.5]}>
        {/* Pressurised, inverted truncated-cone tub; the wheelbase extends beyond it. */}
        <mesh position={[0, 0.73, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.95, 0.72, 0.7, 32]} />
          <meshStandardMaterial color={M.grey} metalness={0.7} roughness={0.45} />
        </mesh>
        <mesh position={[0, 1.09, 0]}>
          <cylinderGeometry args={[0.91, 0.91, 0.035, 32]} />
          <meshStandardMaterial color={M.foil} metalness={0.9} roughness={0.3} />
        </mesh>
        <mesh position={[0.8, 0.75, 0]}>
          <boxGeometry args={[0.035, 0.22, 0.38]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.5} />
        </mesh>
        <CameraOptics positions={[[0, 0.83, 0.925], [-0.24, 0.83, 0.885]]} radius={0.035} depth={0.07} />
      </Part>

      <Part id="lid" offset={[0, 1.9, -0.3]} labelAt={[0, 1.75, -1.35]}>
        <Strut from={[-0.32, 1.08, -0.87]} to={[0.32, 1.08, -0.87]} radius={0.03} color={M.silver} />
        <group position={[0, 1.08, -0.87]} rotation={[0.78, 0, 0]}>
          {/* Circular lid shown open; cell/rib subdivision is schematic. */}
          <RadialSolarPanel position={[0, 0, -0.94]} radius={0.94} />
        </group>
      </Part>

      <Part id="wheels" offset={[0, -0.5, 0]} labelAt={[0.87, 0.28, 0.68]}>
        {[-0.87, -0.29, 0.29, 0.87].map((x, row) =>
          [-0.96, 0.96].map((z, side) => (
            <group key={`${row}-${side}`}>
              <Wheel position={[x, 0.28, z]} radius={0.27} width={0.14} cleats={8} axis="z" />
              <Strut from={[x, 0.45, z * 0.72]} to={[x, 0.28, z]} radius={0.028} color={M.silver} />
            </group>
          )),
        )}
      </Part>

      <Part id="antenna" offset={[-1.2, 1.3, -0.6]} labelAt={[-0.78, 1.64, 0.2]}>
        <Strut from={[-0.5, 0.88, 0.2]} to={[-0.75, 1.5, 0.2]} radius={0.03} color={M.silver} />
        <mesh position={[-0.78, 1.62, 0.2]} rotation={[Math.PI - 0.4, 0.2, 0]} castShadow>
          <coneGeometry args={[0.26, 0.34, 16, 1, true]} />
          <meshStandardMaterial color={M.silver} metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
      </Part>

      <Part id="spectrometer" offset={[0, 0.25, 1.1]} labelAt={[0.35, 0.2, 0.9]}>
        <Strut from={[0.3, 0.55, 0.45]} to={[0.35, 0.24, 0.85]} radius={0.022} color={M.silver} />
        <mesh position={[0.35, 0.2, 0.9]}>
          <cylinderGeometry args={[0.09, 0.09, 0.14, 12]} />
          <meshStandardMaterial color={M.gold} metalness={0.9} roughness={0.3} />
        </mesh>
      </Part>

      <Part id="boom" offset={[1.4, 1.0, 0]} labelAt={[0.93, 0.91, -0.18]}>
        <Strut from={[0.75, 0.76, -0.18]} to={[0.93, 0.91, -0.18]} radius={0.02} color={M.silver} />
        <mesh position={[0.94, 0.92, -0.18]}>
          <boxGeometry args={[0.08, 0.13, 0.1]} />
          <meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.4} />
        </mesh>
      </Part>

      <Part id="reflector" offset={[-0.6, 0.9, 1.2]} labelAt={[-0.35, 0.78, 0.53]}>
        <mesh position={[-0.35, 0.78, 0.5]} rotation={[0.3, -0.4, 0]}>
          <boxGeometry args={[0.22, 0.2, 0.06]} />
          <meshStandardMaterial color={M.silver} metalness={0.95} roughness={0.15} />
        </mesh>
      </Part>
    </group>
  );
}

function InSight() {
  return (
    <group>
      <Part id="deck" offset={[0, 0.9, 0]} labelAt={[0, 0.87, 0]}>
        <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.02, 0.16, 22]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.45} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.86, 0]}>
          <cylinderGeometry args={[0.92, 0.92, 0.04, 22]} />
          <meshStandardMaterial color={M.foil} metalness={0.9} roughness={0.32} />
        </mesh>
        <mesh position={[0.1, 0.95, 0.15]} castShadow>
          <boxGeometry args={[0.5, 0.16, 0.42]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.45} />
        </mesh>
        <SurfacePanel size={[0.4, 0.11]} position={[0.1, 0.95, 0.362]} louvers={3} />
        <MountingRing position={[0, 0.88, 0]} radius={0.85} color={M.copper} />
      </Part>

      <Part id="solar" offset={[0, 1.6, 0]} labelAt={[1.65, 0.88, 0]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <Strut from={[side * 0.75, 0.82, 0]} to={[side * 1.9, 0.86, 0]} radius={0.035} color={M.silver} />
            <RadialSolarPanel position={[side * 1.9, 0.86, 0]} radius={0.94} />
          </group>
        ))}
      </Part>

      <Part id="legs" offset={[0, -0.3, 1.3]} labelAt={[0.78, 0.045, 0.98]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.9;
          const x = Math.cos(a) * 1.25;
          const z = Math.sin(a) * 1.25;
          return (
            <group key={i}>
              <Strut from={[x * 0.5, 0.72, z * 0.5]} to={[x, 0.045, z]} radius={0.035} color={M.silver} />
              <mesh position={[x, 0.02, z]}>
                <cylinderGeometry args={[0.18, 0.18, 0.04, 14]} />
                <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.4} />
              </mesh>
            </group>
          );
        })}
      </Part>

      <Part id="seismometer" offset={[0.2, 0.1, 1.5]} labelAt={[0.5, 0.45, 1.93]}>
        <group position={[0.5, 0.14, 1.65]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.36, 0.4, 0.28, 20]} />
            <meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <sphereGeometry args={[0.3, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.32, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
            <meshStandardMaterial color={M.gold} metalness={0.9} roughness={0.3} />
          </mesh>
        </group>
      </Part>

      <Part id="mole" offset={[1.2, 0.1, 1.0]} labelAt={[1.4, 0.14, 1.22]}>
        {/* Deployment support and tether; the final buried probe is not a tall surface mast. */}
        <group position={[1.4, 0.1, 1.15]}>
          <mesh position={[-0.16, 0.04, -0.12]}>
            <boxGeometry args={[0.23, 0.27, 0.16]} />
            <meshStandardMaterial color={M.gold} metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0.08, -0.075, 0.05]}><cylinderGeometry args={[0.055, 0.055, 0.02, 12]} /><meshStandardMaterial color={M.dark} roughness={0.9} /></mesh>
          <Strut from={[-0.14, 0, -0.04]} to={[0.08, -0.06, 0.05]} radius={0.01} color={M.copper} />
        </group>
        <Strut from={[0.76, 0.73, 0.43]} to={[1.13, 0.03, 1.02]} radius={0.012} color={M.copper} />
      </Part>

      <Part id="mast" offset={[0, 1.0, 0.9]} labelAt={[-0.4, 1.35, 0.83]}>
        <Strut from={[-0.55, 0.9, -0.4]} to={[-0.65, 1.2, 0.12]} radius={0.04} color={M.silver} />
        <Strut from={[-0.65, 1.2, 0.12]} to={[-0.4, 1.35, 0.65]} radius={0.032} color={M.silver} />
        {[[-0.55, 0.9, -0.4], [-0.65, 1.2, 0.12], [-0.4, 1.35, 0.65]].map((point, i) => (
          <mesh key={i} position={point as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.09, 12]} />
            <meshStandardMaterial color={M.midGrey} metalness={0.68} roughness={0.43} />
          </mesh>
        ))}
        <group position={[-0.4, 1.35, 0.72]} rotation={[0.3, 0.4, 0]}>
          <mesh><boxGeometry args={[0.24, 0.2, 0.22]} /><meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.35} /></mesh>
          <CameraOptics positions={[[0, 0, 0.13]]} radius={0.042} depth={0.048} />
        </group>
      </Part>
    </group>
  );
}

function Phoenix() {
  return (
    <group>
      <Part id="deck" offset={[0, 0.9, 0]} labelAt={[0, 0.95, 0.2]}>
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.85, 0.88, 0.2, 18]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.45} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.94, 0]}>
          <cylinderGeometry args={[0.78, 0.78, 0.04, 18]} />
          <meshStandardMaterial color={M.foil} metalness={0.9} roughness={0.32} />
        </mesh>
        <mesh position={[0.15, 1.05, -0.15]} castShadow>
          <boxGeometry args={[0.42, 0.16, 0.34]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.45} />
        </mesh>
        <SurfacePanel size={[0.32, 0.11]} position={[0.15, 1.05, 0.022]} louvers={3} />
        <MountingRing position={[0, 0.96, 0]} radius={0.7} color={M.copper} />
      </Part>

      <Part id="solar" offset={[0, 1.5, 0]} labelAt={[1.52, 0.96, 0]}>
        {[-1, 1].map((side) => (
          <group key={side}>
            <Strut from={[side * 0.65, 0.9, 0]} to={[side * 1.68, 0.94, 0]} radius={0.03} color={M.silver} />
            <RadialSolarPanel position={[side * 1.68, 0.94, 0]} radius={0.86} />
          </group>
        ))}
      </Part>

      <Part id="arm" offset={[0, 0.2, 1.4]} labelAt={[0.3, 0.14, 1.58]}>
        <Strut from={[0, 0.78, 0.6]} to={[0.45, 0.4, 1.1]} radius={0.035} color={M.silver} />
        <Strut from={[0.45, 0.4, 1.1]} to={[0.3, 0.16, 1.5]} radius={0.03} color={M.silver} />
        <mesh position={[0.3, 0.14, 1.56]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.16, 0.06, 0.2]} />
          <meshStandardMaterial color={M.gold} metalness={0.9} roughness={0.3} />
        </mesh>
      </Part>

      <Part id="mast" offset={[0.9, 1.3, 0]} labelAt={[-0.35, 1.72, 0.22]}>
        <Strut from={[-0.35, 0.9, 0.1]} to={[-0.35, 1.65, 0.1]} radius={0.035} color={M.silver} />
        <mesh position={[-0.35, 1.72, 0.1]}>
          <boxGeometry args={[0.34, 0.14, 0.14]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.45} />
        </mesh>
        <CameraOptics positions={[[-0.27, 1.72, 0.18], [-0.43, 1.72, 0.18]]} radius={0.035} depth={0.08} />
      </Part>

      <Part id="legs" offset={[0, -0.3, 1.2]} labelAt={[0.65, 0.045, 0.82]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.9;
          const x = Math.cos(a) * 1.05;
          const z = Math.sin(a) * 1.05;
          return (
            <group key={i}>
              <Strut from={[x * 0.5, 0.78, z * 0.5]} to={[x, 0.045, z]} radius={0.035} color={M.silver} />
              <mesh position={[x, 0.02, z]}>
                <cylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
                <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.4} />
              </mesh>
            </group>
          );
        })}
      </Part>

      <Part id="antenna" offset={[-1.1, 1.1, -0.8]} labelAt={[-0.55, 1.38, -0.55]}>
        <Strut from={[-0.55, 0.96, -0.55]} to={[-0.55, 1.32, -0.55]} radius={0.022} color={M.silver} />
        <Dish position={[-0.55, 1.35, -0.55]} radius={0.22} rotation={[0.9, 0.3, 0]} color={M.warmWhite} />
        <mesh position={[0.45, 1.5, -0.3]}>
          <cylinderGeometry args={[0.012, 0.012, 0.4, 6]} />
          <meshStandardMaterial color={M.silver} metalness={0.9} roughness={0.3} />
        </mesh>
      </Part>
    </group>
  );
}

function Viking() {
  return (
    <group>
      <Part id="body" offset={[0, 1.0, 0]} labelAt={[0, 0.95, 0.96]}>
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.95, 0.95, 0.4, 6]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.17, 0]}>
          <cylinderGeometry args={[0.88, 0.88, 0.04, 6]} />
          <meshStandardMaterial color={M.foil} metalness={0.9} roughness={0.32} />
        </mesh>
        <MountingRing position={[0, 1.19, 0]} radius={0.8} color={M.copper} />
        <mesh position={[0, 0.66, 0]}>
          <cylinderGeometry args={[0.6, 0.6, 0.2, 6]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.5} />
        </mesh>
      </Part>

      <Part id="legs" offset={[0, -0.3, 1.3]} labelAt={[0.87, 0.055, 1.1]}>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.9;
          const x = Math.cos(a) * 1.4;
          const z = Math.sin(a) * 1.4;
          return (
            <group key={i}>
              <Strut from={[x * 0.55, 0.85, z * 0.55]} to={[x, 0.055, z]} radius={0.045} color={M.silver} />
              <mesh position={[x, 0.025, z]}>
                <cylinderGeometry args={[0.2, 0.2, 0.05, 14]} />
                <meshStandardMaterial color={M.silver} metalness={0.85} roughness={0.35} />
              </mesh>
            </group>
          );
        })}
      </Part>

      <Part id="rtg" offset={[0, 1.8, -0.9]} labelAt={[0.45, 1.4, -0.65]}>
        {[-0.45, 0.45].map((x) => (
          <group key={x} position={[x, 1.4, -0.42]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.42, 12]} />
              <meshStandardMaterial color={M.midGrey} metalness={0.75} roughness={0.45} />
            </mesh>
            <CollarBands position={[0, 0, 0]} radius={0.22} height={0.42} count={4} />
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.31, 0.35, 0.55, 12]} />
              <meshStandardMaterial color={M.warmWhite} metalness={0.45} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </Part>

      <Part id="arm" offset={[0, 0.1, 1.5]} labelAt={[0.42, 0.2, 1.62]}>
        <Strut from={[0.1, 0.78, 0.7]} to={[0.5, 0.42, 1.25]} radius={0.03} color={M.silver} />
        <Strut from={[0.5, 0.42, 1.25]} to={[0.42, 0.22, 1.55]} radius={0.025} color={M.silver} />
        <mesh position={[0.42, 0.2, 1.6]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.2, 0.06, 0.22]} />
          <meshStandardMaterial color={M.gold} metalness={0.9} roughness={0.3} />
        </mesh>
      </Part>

      <Part id="camera" offset={[0.9, 1.4, 0.8]} labelAt={[-0.3, 1.6, 0.41]}>
        {[-0.3, 0.3].map((x) => (
          <group key={x}>
            <Strut from={[x, 1.2, 0.2]} to={[x, 1.55, 0.25]} radius={0.026} color={M.silver} />
            <group position={[x, 1.54, 0.27]} rotation={[0, x < 0 ? 0.3 : -0.3, 0]}>
              <mesh><cylinderGeometry args={[0.075, 0.095, 0.38, 16]} /><meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.45} /></mesh>
              <mesh position={[0, 0.115, 0.071]}><boxGeometry args={[0.045, 0.08, 0.02]} /><meshStandardMaterial color={M.black} roughness={0.3} /></mesh>
              <CollarBands position={[0, 0, 0]} radius={0.094} height={0.28} count={2} />
            </group>
          </group>
        ))}
      </Part>

      <Part id="antenna" offset={[-1.4, 1.3, -0.4]} labelAt={[-0.65, 1.65, -0.2]}>
        <Dish position={[-0.65, 1.6, -0.2]} radius={0.4} rotation={[0.6, 0.4, 0]} color={M.warmWhite} />
        <Strut from={[-0.6, 1.15, -0.2]} to={[-0.65, 1.6, -0.2]} radius={0.03} color={M.silver} />
      </Part>
    </group>
  );
}

export const MODEL_FRAME: Record<ModelKey, { position: [number, number, number]; target: [number, number, number]; zoom: number }> = {
  mer: { position: [3.0, 2.2, 3.8], target: [0, 0.85, 0], zoom: 1 },
  msl: { position: [4.2, 3.0, 5.0], target: [0, 1.2, 0], zoom: 1 },
  sojourner: { position: [1.5, 1.1, 1.8], target: [0, 0.32, 0], zoom: 1 },
  lrv: { position: [4.6, 2.8, 5.2], target: [0, 0.9, 0], zoom: 1 },
  lm: { position: [7.0, 5.0, 8.0], target: [0, 2.3, 0], zoom: 1 },
  surveyor: { position: [3.4, 2.4, 3.8], target: [0, 0.8, 0], zoom: 1 },
  lunokhod: { position: [3.8, 2.4, 4.2], target: [0, 0.6, 0], zoom: 1 },
  insight: { position: [3.8, 2.4, 4.0], target: [0, 0.6, 0], zoom: 1 },
  phoenix: { position: [3.6, 2.4, 3.8], target: [0, 0.6, 0], zoom: 1 },
  viking: { position: [4.2, 2.8, 4.4], target: [0, 1.0, 0], zoom: 1 },
};

const MODELS: Record<ModelKey, () => React.ReactElement> = {
  mer: MER,
  msl: MSL,
  sojourner: Sojourner,
  lrv: LRV,
  lm: LM,
  surveyor: Surveyor,
  lunokhod: Lunokhod,
  insight: InSight,
  phoenix: Phoenix,
  viking: Viking,
};

export default function EquipmentModel({
  model,
  amount = 0,
  selected = null,
  onSelect = () => {},
  showLabels = true,
  reducedMotion: inheritedMotion,
  components,
  variant,
}: {
  model: ModelKey;
  amount?: number;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  showLabels?: boolean;
  reducedMotion?: boolean;
  components?: ModelComponent[];
  variant?: Asset3D["variant"];
}) {
  const Comp = MODELS[model];
  const reducedMotion = useModelReducedMotion(inheritedMotion);
  return (
    <ModelContext.Provider value={{ amount, selected, onSelect, showLabels, model, reducedMotion, parts: components, variant }}>
      <group>
        <Comp />
      </group>
    </ModelContext.Provider>
  );
}
