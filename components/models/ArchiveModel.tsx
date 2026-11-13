"use client";

import { useContext, useMemo, useRef, type ReactElement } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import EquipmentModel, {
  Dish,
  M,
  ModelContext,
  Part,
  SolarPanel,
  Strut,
  Wheel,
} from "@/components/models/EquipmentModel";
import type { ArchiveKind, Asset3D, ModelComponent, ModelKey } from "@/data/types";
import { CameraOptics, CollarBands, FoilPanel, MountingRing, RadialSolarPanel, ShellSeams, SurfacePanel, combineGeometry, useDetailGeometry, useModelReducedMotion } from "./ModelDetails";

const LEGACY: ModelKey[] = [
  "mer",
  "msl",
  "sojourner",
  "lrv",
  "lm",
  "surveyor",
  "lunokhod",
  "insight",
  "phoenix",
  "viking",
];

/** Labels for the original hand-built models, so every record names its 3D family. */
export const LEGACY_LABEL: Record<ModelKey, string> = {
  mer: "Six-wheel rover",
  msl: "Six-wheel rover",
  sojourner: "Six-wheel microrover",
  lrv: "Lunar roving vehicle",
  lm: "Lunar module",
  surveyor: "Soft lander",
  lunokhod: "Eight-wheel rover",
  insight: "Soft lander",
  phoenix: "Soft lander",
  viking: "Soft lander",
};

export const KIND_LABEL: Record<ArchiveKind, string> = {
  "descent-stage": "Lunar descent stage",
  "ascent-stage": "Ascent stage",
  "rover-6": "Six-wheel rover",
  "rover-4": "Four-wheel rover",
  "rover-8": "Eight-wheel rover",
  lander: "Soft lander",
  station: "Surface experiment station",
  instrument: "Deployed instrument",
  reflector: "Laser retroreflector",
  "heat-shield": "Ablative heat shield",
  backshell: "Aeroshell backshell",
  parachute: "Parachute and riser",
  skycrane: "Propulsive descent stage",
  helicopter: "Mars helicopter",
  impactor: "Impact probe",
  ballast: "Entry balance mass",
  wreck: "Impact debris field",
};

const VARIANT_LABEL: Record<NonNullable<Asset3D["variant"]>, string> = {
  "walking-rover": "Walking rover",
  "spherical-rover": "Transformable spherical rover",
  "sample-depot": "Sample tube depot",
  airbags: "Folded airbag clusters",
  cover: "Parachute compartment cover",
  cradle: "Released lander cradle",
  "terminal-stage": "Toroidal terminal descent stage",
  seismometer: "Deployed seismometer",
  "rotor-fragment": "Detached rotor blade fragment",
  perseverance: "Perseverance rover",
  "petal-capsule": "Opening-petal landing capsule",
  "airbag-platform": "Airbag landing platform",
  flag: "Surface flag assembly",
  "tripod-camera": "Tripod-mounted camera",
  "foil-collector": "Solar-wind foil collector",
  penetrator: "Two-body impact penetrator",
  "sample-ascent": "Robotic sample ascent stage",
  "heat-probe": "Heat probe deployment assembly",
  "clamshell-lander": "Clamshell solar lander",
  "slim-lander": "SLIM tipped lander",
  "sample-lander": "Robotic sample-return lander",
  ranger: "Ranger camera probe",
  "spherical-probe": "Spherical impact probe",
  "upper-stage": "Centaur upper stage",
  zhurong: "Solar-powered Zhurong rover",
  yutu: "Yutu solar rover",
  pragyan: "Pragyan solar rover",
  easep: "EASEP seismic unit and reflector",
};

export function assetLabel(asset: Asset3D): string {
  if (asset.variant) return VARIANT_LABEL[asset.variant];
  const kind = asset.kind;
  return isLegacyKind(kind) ? LEGACY_LABEL[kind] : KIND_LABEL[kind];
}

function Panel({
  w,
  h,
  color = M.solar,
  count = 6,
  y = 0,
}: {
  w: number;
  h: number;
  color?: string;
  count?: number;
  y?: number;
}) {
  return (
    <SolarPanel size={[w, h]} position={[0, y, 0]} cells={count} color={color} />
  );
}

function Bell({
  position,
  radius = 0.16,
  height = 0.34,
  rotation = [0, 0, 0] as [number, number, number],
}: {
  position: [number, number, number];
  radius?: number;
  height?: number;
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[radius * 0.35, radius, height, 18, 1, true]} />
        <meshStandardMaterial color={M.midGrey} metalness={0.85} roughness={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, radius * 0.07, 6, 18]} />
        <meshStandardMaterial color={M.silver} metalness={0.9} roughness={0.28} />
      </mesh>
      <mesh position={[0, height * 0.93, 0]}>
        <cylinderGeometry args={[radius * 0.4, radius * 0.4, height * 0.12, 12]} />
        <meshStandardMaterial color={M.dark} metalness={0.65} roughness={0.4} />
      </mesh>
      <CollarBands position={[0, height * 0.93, 0]} radius={radius * 0.4} height={height * 0.08} count={2} />
    </group>
  );
}

function CrushLeg({
  angle,
  reach,
  drop,
  legRadius = 0.03,
}: {
  angle: number;
  reach: number;
  drop: number;
  legRadius?: number;
}) {
  const x = Math.cos(angle) * reach;
  const z = Math.sin(angle) * reach;
  return (
    <group>
      <Strut from={[Math.cos(angle) * 0.18, drop + 0.1, Math.sin(angle) * 0.18]} to={[x, 0.16, z]} radius={legRadius} />
      <Strut from={[x * 0.55, drop + 0.02, z * 0.55]} to={[x * 0.86, 0.14, z * 0.86]} radius={0.015} color={M.silver} />
      <Strut from={[x, 0.16, z]} to={[x, 0.035, z]} radius={legRadius * 1.3} color={M.silver} />
      <mesh position={[x, 0.013, z]} receiveShadow>
        <cylinderGeometry args={[0.16, 0.17, 0.026, 20]} />
        <meshStandardMaterial color={M.silver} metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Families                                                            */
/* ------------------------------------------------------------------ */
function DescentStage({ a }: { a: Asset3D }) {
  const span = a.span ?? 4.3;
  const h = a.height ?? 2.0;
  const r = span / 2;
  return (
    <group>
      <Part id="structure" offset={[0, 0.5, 0]} labelAt={[0, h * 0.62, 0]}>
        <mesh position={[0, h * 0.62, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r, r * 0.96, h * 0.3, 8]} />
          <meshStandardMaterial color={M.foil} metalness={0.45} roughness={0.42} />
        </mesh>
        <mesh position={[0, h * 0.775, 0]}>
          <cylinderGeometry args={[r * 0.98, r * 0.98, h * 0.02, 8]} />
          <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.35} />
        </mesh>
        <MountingRing position={[0, h * 0.795 - r * 0.84 * 0.0245, 0]} radius={r * 0.84} color={M.copper} />
        <mesh position={[0, h * 0.42, 0]} castShadow>
          <boxGeometry args={[r * 1.1, h * 0.14, r * 1.1]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.3} roughness={0.6} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const angle = i * Math.PI / 4 + Math.PI / 8;
          return <FoilPanel key={i} size={[r * 0.72, h * 0.28, 0.04]} position={[Math.sin(angle) * r * 0.925, h * 0.62, Math.cos(angle) * r * 0.925]} rotation={[0, angle, 0]} color={i % 2 ? M.foil : M.gold} />;
        })}
      </Part>

      <Part id="engine" offset={[0, -0.85, 0]} labelAt={[0, h * 0.2, r * 0.3]}>
        <Bell position={[0, h * 0.2, 0]} radius={r * 0.19} height={h * 0.28} />
      </Part>

      <Part id="legs" offset={[0, 0, 0]} labelAt={[r * 0.7, 0.5, r * 0.7]}>
        {[0, 1, 2, 3].map((i) => (
          <CrushLeg key={i} angle={i * (Math.PI / 2)} reach={r * 1.38} drop={h * 0.4} />
        ))}
      </Part>

      <Part id="ladder" offset={[0, 0.6, 0.8]} labelAt={[0, h * 0.5, r * 1.15]}>
        <group>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[0, h * (0.12 + i * 0.075), r * (1.3 - (0.06 + i * 0.075) / 0.72 * 0.34)]}>
              <boxGeometry args={[r * 0.12, 0.022, 0.022]} />
              <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.35} />
            </mesh>
          ))}
          <Strut from={[-r * 0.06, h * 0.06, r * 1.3]} to={[-r * 0.06, h * 0.78, r * 0.96]} radius={0.014} color={M.silver} />
          <Strut from={[r * 0.06, h * 0.06, r * 1.3]} to={[r * 0.06, h * 0.78, r * 0.96]} radius={0.014} color={M.silver} />
        </group>
      </Part>

      <Part id="bay" offset={[0, -0.35, -0.75]} labelAt={[-r * 0.6, h * 0.3, -r * 0.9]}>
        <mesh position={[-r * 0.45, h * 0.5, -r * 0.82]} castShadow>
          <boxGeometry args={[span * 0.4, h * 0.24, 0.14]} />
          <meshStandardMaterial color={M.grey} metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[r * 0.45, h * 0.5, -r * 0.82]} castShadow>
          <boxGeometry args={[span * 0.34, h * 0.2, 0.12]} />
          <meshStandardMaterial color={M.gold} metalness={0.8} roughness={0.3} />
        </mesh>
      </Part>
    </group>
  );
}

function AscentStage({ a }: { a: Asset3D }) {
  const w = a.span ?? 2.4;
  const h = a.height ?? 1.6;
  return (
    <group position={[0, h * 0.4, 0]}>
      <Part id="cabin" offset={[0, 0.5, 0]} labelAt={[0, h * 0.55, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, w * 0.9]} />
          <meshStandardMaterial color={a.tone ?? M.warmWhite} metalness={0.3} roughness={0.5} />
        </mesh>
        <mesh position={[0, h * 0.5 + 0.02, 0]}>
          <boxGeometry args={[w * 0.7, 0.06, w * 0.5]} />
          <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.3} />
        </mesh>
        <SurfacePanel size={[w * 0.38, h * 0.28]} position={[w * 0.2, -h * 0.18, w * 0.451]} />
      </Part>
      <Part id="window" offset={[0, 0, 0.6]} labelAt={[w * 0.42, h * 0.25, w * 0.48]}>
        {a.variant === "sample-ascent" ? <>
          <mesh position={[0, h * 0.16, w * 0.46]}><boxGeometry args={[w * 0.24, h * 0.2, w * 0.06]} /><meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.5} /></mesh>
          <CameraOptics positions={[[w * 0.06, h * 0.17, w * 0.5]]} radius={w * 0.025} depth={w * 0.025} />
        </> : [-0.34, 0.34].map((x) => (
          <mesh key={x} position={[x * w * 0.5, h * 0.18, w * 0.46]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]}>
            <boxGeometry args={[0.26, 0.2, 0.03]} />
            <meshStandardMaterial color="#0b1a2c" metalness={0.5} roughness={0.2} emissive="#1c4b7a" emissiveIntensity={0.3} />
          </mesh>
        ))}
      </Part>
      <Part id="engine" offset={[0, -0.6, 0]} labelAt={[0, -h * 0.5, w * 0.3]}>
        <Bell position={[0, -h * 0.5 - 0.295, 0]} radius={0.14} height={0.3} />
      </Part>
      <Part id="antenna" offset={[0, 0.45, -0.5]} labelAt={[-w * 0.5, h * 0.4, -w * 0.5]}>
        <Dish position={[-w * 0.42, h * 0.34, -w * 0.4]} radius={0.24} rotation={[0.5, 0.6, 0]} />
      </Part>
    </group>
  );
}

/** Solar rover silhouettes use mission-specific arrays; fittings remain schematic. */
function SolarRover({ a }: { a: Asset3D }) {
  const pragyan = a.variant === "pragyan";
  const zhurong = a.variant === "zhurong";
  const scale = (a.span ?? 1.6) / 1.6;
  const wr = pragyan ? 0.16 : 0.22;
  const deck = wr + 0.47;
  return <group scale={scale}>
    <Part id="body" offset={[0,0.5,0]} labelAt={[0,deck,0]}>
      <mesh position={[0,deck-0.18,0]} castShadow><boxGeometry args={[0.88,0.36,1.05]} /><meshStandardMaterial color={a.tone ?? M.gold} metalness={0.5} roughness={0.48} /></mesh>
    </Part>
    <Part id="wheels" offset={[0,-0.1,0]} labelAt={[0.58,wr,0.5]}>
      {[-1,1].flatMap(s=>[-0.56,0,0.56].map(z=><group key={`${s}-${z}`}><Wheel position={[s*0.56,wr,z]} radius={wr} width={0.16} cleats={12} /><Strut from={[s*0.28,deck-0.1,z*0.6]} to={[s*0.56,wr,z]} radius={0.026} /></group>))}
    </Part>
    <Part id="solar" offset={[0,0.5,-0.35]} labelAt={[pragyan?0:0.95,deck+0.14,0]}>
      {pragyan ? <SolarPanel size={[1.03,0.9]} position={[0,deck+0.43,-0.34]} rotation={[Math.PI/2,0,0]} cells={6} /> : [-1,1].flatMap(s=>(zhurong?[-1,1]:[0]).map(t=><SolarPanel key={`${s}-${t}`} size={[zhurong?0.86:1.0,zhurong?0.5:0.9]} position={[s*(zhurong?1.02:0.98),deck+0.035,t*0.34]} cells={5} />))}
    </Part>
    <Part id="camera" offset={[0,0.6,0.4]} labelAt={[0,pragyan?deck+0.12:deck+0.87,0.5]}>
      {!pragyan && <Strut from={[0,deck,0.35]} to={[0,deck+0.76,0.35]} radius={0.036} />}
      <mesh position={[0,pragyan?deck+0.05:deck+0.83,0.35]}><boxGeometry args={[0.34,0.16,0.16]} /><meshStandardMaterial color={M.warmWhite} metalness={0.45} roughness={0.5} /></mesh>
      <CameraOptics positions={[[-0.1,pragyan?deck+0.05:deck+0.83,0.45],[0.1,pragyan?deck+0.05:deck+0.83,0.45]]} radius={0.035} depth={0.04} />
    </Part>
    <Part id="communications" offset={[0.5,0.3,-0.4]} labelAt={[0.3,deck+0.36,-0.4]}>
      {pragyan ? <mesh position={[0.45,deck+0.93,-0.34]}><boxGeometry args={[0.12,0.04,0.12]} /><meshStandardMaterial color={M.warmWhite} /></mesh> : <Dish position={[0.3,deck+0.14,-0.35]} radius={0.17} rotation={[0.65,0,0]} />}
    </Part>
  </group>;
}

function Rover6({ a }: { a: Asset3D }) {
  if (a.variant === "zhurong" || a.variant === "yutu" || a.variant === "pragyan") return <SolarRover a={a} />;
  const wr = 0.22;
  // Scale the complete chassis, not just axle spacing: small records must not
  // squeeze full-size wheels into one another or retain a full-size camera mast.
  const scale = (a.span ?? 1.6) / 1.6;
  const len = 1.6;
  const zs = [-len * 0.36, 0, len * 0.36];
  return (
    <group scale={[scale, a.height ? a.height / 1.32 : scale, scale]}>
      <Part id="body" offset={[0, 0.6, 0]} labelAt={[0, 0.86, 0]}>
        <mesh position={[0, 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.86, 0.34, 0.72]} />
          <meshStandardMaterial color={a.tone ?? M.foil} metalness={0.55} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[0.8, 0.2, 0.66]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.6} roughness={0.45} />
        </mesh>
        <SurfacePanel size={[0.54, 0.22]} position={[0, 0.62, 0.362]} louvers={4} />
      </Part>
      <Part id="wheels" offset={[0, -0.12, 0]} labelAt={[0.5, 0.35, 0.6]}>
        {[-1, 1].map((s) =>
          zs.map((z, i) => (
            <group key={`${s}-${z}`}>
              <Wheel position={[s * 0.52, wr, z]} radius={wr} width={0.18} cleats={10} />
              <Strut from={[s * 0.3, 0.36, z]} to={[s * 0.52, wr, z]} radius={0.026} />
              <Strut from={[s * 0.34, 0.5 + (i === 1 ? 0.04 : 0), z]} to={[s * 0.3, 0.36, z]} radius={0.02} />
            </group>
          )),
        )}
        <Strut from={[-0.3, 0.5, -len * 0.36]} to={[0.3, 0.56, len * 0.36]} radius={0.018} color={M.silver} />
      </Part>
      <Part id="mast" offset={[0, 0.75, 0]} labelAt={[-0.36, 1.0, 0]}>
        <mesh position={[-0.24, 0.98, 0.24]} castShadow>
          <cylinderGeometry args={[0.035, 0.045, 0.5, 10]} />
          <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[-0.24, 1.24, 0.24]} castShadow>
          <boxGeometry args={[0.3, 0.14, 0.12]} />
          <meshStandardMaterial color={M.dark} metalness={0.5} roughness={0.4} />
        </mesh>
        <CameraOptics positions={[[-0.315, 1.24, 0.31], [-0.165, 1.24, 0.31]]} radius={0.03} depth={0.045} />
      </Part>
      <Part id="deck" offset={[0, 0.4, 0]} labelAt={[0.3, 0.95, -0.3]}>
        <mesh position={[0.12, 0.8, -0.24]} castShadow>
          <boxGeometry args={[0.44, 0.05, 0.34]} />
          <meshStandardMaterial color={M.grey} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[-0.2, 0.82, -0.3]} castShadow>
          <boxGeometry args={[0.24, 0.08, 0.2]} />
          <meshStandardMaterial color={M.gold} metalness={0.85} roughness={0.28} />
        </mesh>
        <mesh position={[0.13, 0.86, -0.24]}>
          <cylinderGeometry args={[0.085, 0.085, 0.065, 14]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.42} />
        </mesh>
      </Part>
      <Part id="antenna" offset={[0, 0.5, -0.5]} labelAt={[0.4, 1.0, -0.4]}>
        <Dish position={[0.3, 0.95, -0.28]} radius={0.22} rotation={[-0.5, 0.3, 0]} />
      </Part>
    </group>
  );
}

function Rover4({ a }: { a: Asset3D }) {
  if (a.variant === "walking-rover") return <WalkingRover a={a} />;
  if (a.variant === "spherical-rover") return <SphericalRover a={a} />;
  return <FourWheelRover a={a} />;
}

function FourWheelRover({ a }: { a: Asset3D }) {
  const scale = (a.span ?? 0.7) / 0.7;
  const wr = 0.12;
  const bw = 0.7;
  return (
    <group scale={[scale, a.height ? a.height / 0.725 : scale, scale]}>
      <Part id="body" offset={[0, 0.42, 0]} labelAt={[0, 0.52, 0]}>
        <mesh position={[0, wr + 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[bw, 0.24, bw * 0.86]} />
          <meshStandardMaterial color={a.tone ?? M.foil} metalness={0.5} roughness={0.42} />
        </mesh>
        <SurfacePanel size={[bw * 0.65, 0.16]} position={[0, wr + 0.16, bw * 0.432]} louvers={3} />
      </Part>
      <Part id="solar" offset={[0, 0.55, 0]} labelAt={[0, wr + 0.42, 0]}>
        <Panel w={bw * 1.5} h={bw * 1.1} y={wr + 0.3} />
      </Part>
      <Part id="wheels" offset={[0, -0.08, 0]} labelAt={[bw * 0.7, wr, bw * 0.5]}>
        {[-1, 1].map((sx) =>
          [-1, 1].map((sz) => (
            <group key={`${sx}-${sz}`}>
              <Wheel position={[sx * bw * 0.54, wr, sz * bw * 0.4]} radius={wr} width={0.11} cleats={8} />
              <Strut from={[sx * bw * 0.3, wr + 0.18, sz * bw * 0.32]} to={[sx * bw * 0.54, wr, sz * bw * 0.4]} radius={0.018} color={M.silver} />
            </group>
          )),
        )}
      </Part>
      <Part id="mast" offset={[0, 0.4, 0]} labelAt={[-bw * 0.4, wr + 0.6, 0]}>
        <mesh position={[-bw * 0.22, wr + 0.42, 0.1]} castShadow>
          <cylinderGeometry args={[0.022, 0.028, 0.26, 8]} />
          <meshStandardMaterial color={M.silver} metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[-bw * 0.22, wr + 0.56, 0.1]}>
          <boxGeometry args={[0.18, 0.09, 0.08]} />
          <meshStandardMaterial color={M.dark} metalness={0.5} roughness={0.4} />
        </mesh>
        <CameraOptics positions={[[-bw * 0.22, wr + 0.56, 0.155]]} radius={0.028} depth={0.03} />
      </Part>
    </group>
  );
}

/** PROP-M advanced on two reciprocating skis; it did not have rover wheels. */
function WalkingRover({ a }: { a: Asset3D }) {
  const w = a.span ?? 0.4;
  return (
    <group>
      <Part id="body" offset={[0, 0.42, 0]} labelAt={[0, w * 0.55, 0]}>
        <mesh position={[0, w * 0.37, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.58, w * 0.25, w * 0.7]} />
          <meshStandardMaterial color={a.tone ?? M.grey} metalness={0.65} roughness={0.42} />
        </mesh>
        <SurfacePanel size={[w * 0.4, w * 0.18]} position={[0, w * 0.37, w * 0.352]} louvers={3} />
      </Part>
      <Part id="wheels" offset={[0, -0.08, 0]} labelAt={[w * 0.5, w * 0.08, 0]}>
        {[-1, 1].map(s => (
          <group key={s}>
            <mesh position={[s * w * 0.4, w * 0.04, 0]} castShadow receiveShadow>
              <boxGeometry args={[w * 0.15, w * 0.05, w * 1.2]} />
              <meshStandardMaterial color={M.silver} metalness={0.72} roughness={0.45} />
            </mesh>
            {[-1, 1].map(t => <Strut key={t} from={[s * w * 0.25, w * 0.28, t * w * 0.28]} to={[s * w * 0.4, w * 0.07, t * w * 0.4]} radius={w * 0.025} color={M.midGrey} />)}
          </group>
        ))}
      </Part>
      <Part id="solar" offset={[0, 0.55, -0.5]} labelAt={[0, w * 0.3, -w * 0.6]}>
        <mesh position={[0, w * 0.3, -w * 0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[w * 0.16, w * 0.035, 6, 16]} />
          <meshStandardMaterial color={M.copper} metalness={0.5} roughness={0.5} />
        </mesh>
        <Strut from={[0, w * 0.28, -w * 0.35]} to={[w * 0.3, w * 0.03, -w * 0.8]} radius={w * 0.012} color={M.copper} />
        <Strut from={[w * 0.3, w * 0.03, -w * 0.8]} to={[w * 0.8, w * 0.03, -w * 1.4]} radius={w * 0.012} color={M.copper} />
      </Part>
      <Part id="mast" offset={[0, 0.4, 0.5]} labelAt={[0, w * 0.4, w * 0.8]}>
        {[-1, 1].map(s => <Strut key={s} from={[s * w * 0.16, w * 0.36, w * 0.35]} to={[s * w * 0.42, w * 0.22, w * 0.8]} radius={w * 0.015} color={M.silver} />)}
      </Part>
    </group>
  );
}

/** SORA-Q opens its spherical housing into two drive shells and a camera tail. */
function SphericalRover({ a }: { a: Asset3D }) {
  const w = a.span ?? 0.3;
  const r = w * 0.36;
  return (
    <group>
      <Part id="body" offset={[0, 0.42, 0]} labelAt={[0, r * 1.4, 0]}>
        <mesh position={[0, r, 0]} castShadow receiveShadow>
          <boxGeometry args={[w * 0.24, r * 0.7, w * 0.32]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.65} roughness={0.45} />
        </mesh>
        <SurfacePanel size={[w * 0.18, r * 0.48]} position={[0, r, w * 0.161]} />
        <Strut from={[-w * 0.2, r, 0]} to={[w * 0.2, r, 0]} radius={w * 0.045} color={M.silver} />
      </Part>
      <Part id="wheels" offset={[0, -0.08, 0]} labelAt={[w * 0.55, r, 0]}>
        {[-1, 1].map(s => (
          <group key={s} position={[s * w * 0.16, r + w * 0.015, 0]} rotation={[0, 0, -s * Math.PI / 2]}>
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[r, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color={a.tone ?? M.warmWhite} metalness={0.3} roughness={0.55} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[r * 0.95, 20]} />
              <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.4} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      </Part>
      <Part id="solar" offset={[0, 0.55, 0]} labelAt={[0, r * 1.6, -w * 0.15]}>
        <mesh position={[0, r * 1.1, 0]}>
          <boxGeometry args={[w * 0.18, r * 0.3, w * 0.2]} />
          <meshStandardMaterial color={M.gold} metalness={0.6} roughness={0.45} />
        </mesh>
      </Part>
      <Part id="mast" offset={[0, 0.4, -0.5]} labelAt={[0, r * 0.7, -w * 0.45]}>
        <Strut from={[0, r, -w * 0.1]} to={[0, w * 0.04, -w * 0.45]} radius={w * 0.025} color={M.dark} />
        <mesh position={[0, r * 0.72, -w * 0.18]} castShadow>
          <boxGeometry args={[w * 0.18, w * 0.16, w * 0.14]} />
          <meshStandardMaterial color={M.dark} metalness={0.5} roughness={0.4} />
        </mesh>
        <CameraOptics positions={[[0, r * 0.72, -w * 0.18 + w * 0.09]]} radius={w * 0.045} depth={w * 0.06} />
      </Part>
    </group>
  );
}

function Rover8({ a }: { a: Asset3D }) {
  const wr = 0.26;
  const bodyW = a.span ?? 2.2;
  const bodyD = bodyW * 0.9;
  return (
    <group scale={[1, (a.height ?? 1.6) / 1.6, 1]}>
      <Part id="body" offset={[0, 0.5, 0]} labelAt={[0, 0.72, 0]}>
        <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[bodyW * 0.43, bodyW * 0.32, 0.7, 32]} />
          <meshStandardMaterial color={a.tone ?? M.silver} metalness={0.6} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[bodyW * 0.32, bodyW * 0.32, 0.08, 24]} />
          <meshStandardMaterial color={M.dark} metalness={0.4} roughness={0.6} />
        </mesh>
        <CameraOptics positions={[[0, 0.8, bodyW * 0.415], [-bodyW * 0.1, 0.8, bodyW * 0.405]]} radius={bodyW * 0.018} depth={bodyW * 0.035} />
      </Part>
      <Part id="lid" offset={[0, 0.65, -0.4]} labelAt={[0, 0.94, 0]}>
        <group position={[0, 1.05, -bodyW * 0.43]} rotation={[0.78, 0, 0]}>
          <RadialSolarPanel position={[0, 0, -bodyW * 0.43]} radius={bodyW * 0.43} />
        </group>
      </Part>
      <Part id="wheels" offset={[0, -0.1, 0]} labelAt={[bodyW * 0.6, 0.3, bodyD * 0.6]}>
        {[-1, 1].map((s) =>
          [-0.56, -0.19, 0.19, 0.56].map((z) => (
            <group key={`${s}-${z}`}>
              <Wheel position={[s * (bodyW / 2 + 0.1), wr, z * bodyD * 0.86]} radius={wr} width={0.13} cleats={9} mesh />
              <Strut from={[s * bodyW * 0.42, 0.4, z * bodyD * 0.86]} to={[s * (bodyW / 2 + 0.1), wr, z * bodyD * 0.86]} radius={0.02} color={M.silver} />
            </group>
          )),
        )}
      </Part>
      <Part id="antenna" offset={[0, 0.6, -0.5]} labelAt={[-bodyW * 0.4, 0.9, -bodyD * 0.5]}>
        <Strut from={[-bodyW * 0.3, 0.6, -bodyD * 0.46]} to={[-bodyW * 0.3, 0.8, -bodyD * 0.56]} radius={0.024} color={M.silver} />
        <mesh position={[-bodyW * 0.3, 0.94, -bodyD * 0.56]} rotation={[Math.PI - 0.3, 0, 0]} castShadow>
          <coneGeometry args={[0.22, 0.34, 18, 1, true]} />
          <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.35} side={THREE.DoubleSide} />
        </mesh>
      </Part>
      <Part id="boom" offset={[0, 0, 0.8]} labelAt={[bodyW * 0.5, 0.3, bodyD * 0.6]}>
        <Strut from={[bodyW * 0.36, 0.44, -bodyD * 0.42]} to={[bodyW * 0.62, 0.2, bodyD * 0.5]} radius={0.022} color={M.copper} />
        <mesh position={[bodyW * 0.62, 0.18, bodyD * 0.5]}>
          <boxGeometry args={[0.14, 0.1, 0.14]} />
          <meshStandardMaterial color={M.black} metalness={0.5} roughness={0.5} />
        </mesh>
      </Part>
    </group>
  );
}

function PetalCapsule({ a }: { a: Asset3D }) {
  const diameter = a.span ?? 0.6;
  const r = diameter * 0.5;
  const petal = useDetailGeometry(() => {
    const outline = new THREE.Shape();
    outline.moveTo(-r * 0.68, 0); outline.quadraticCurveTo(-r * 0.8, r * 0.65, 0, r * 1.3);
    outline.quadraticCurveTo(r * 0.8, r * 0.65, r * 0.68, 0); outline.lineTo(-r * 0.68, 0);
    return new THREE.ExtrudeGeometry(outline, { depth: r * 0.055, bevelEnabled: false }).rotateX(-Math.PI / 2);
  }, [r]);
  return <group>
    <Part id="body" offset={[0, r, 0]} labelAt={[0, r * 1.15, 0]}>
      <mesh position={[0, r * 0.68, 0]} scale={[1, 0.8, 1]} castShadow receiveShadow><sphereGeometry args={[r * 0.78, 24, 16]} /><meshStandardMaterial color={a.tone ?? M.silver} metalness={0.6} roughness={0.48} /></mesh>
      <MountingRing position={[0, r * 0.68, 0]} radius={r * 0.79} />
    </Part>
    <Part id="petals" offset={[0, -r * 0.4, r]} labelAt={[r, r * 0.15, 0]}>
      {[0,1,2,3].map(i=><group key={i} rotation={[0, i*Math.PI/2, 0]} position={[0,r*0.04,0]}>
        <mesh geometry={petal} position={[0,0,-r*0.55]} castShadow receiveShadow><meshStandardMaterial color={M.warmWhite} metalness={0.5} roughness={0.5} side={THREE.DoubleSide} /></mesh>
      </group>)}
    </Part>
    <Part id="camera" offset={[r, r, 0]} labelAt={[0,r*1.9,0]}>
      {Array.from({length:a.cameras ?? 1},(_,i)=><group key={i} position={[(i-((a.cameras??1)-1)/2)*r*0.45,0,0]}>
        <mesh position={[0,r*1.38,0]}><cylinderGeometry args={[r*0.09,r*0.12,r*0.6,12]} /><meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.4} /></mesh>
        <mesh position={[0,r*1.7,r*0.08]}><boxGeometry args={[r*0.09,r*0.08,r*0.04]} /><meshStandardMaterial color={M.black} roughness={0.4} /></mesh>
      </group>)}
    </Part>
    <Part id="antenna" offset={[-r, r, 0]} labelAt={[-r,r*1.1,0]}>
      {[0,1,2,3].map(i=>{const angle=i*Math.PI/2+Math.PI/4;return <Strut key={i} from={[Math.cos(angle)*r*0.45,r*0.85,Math.sin(angle)*r*0.45]} to={[Math.cos(angle)*r*1.1,r*1.7,Math.sin(angle)*r*1.1]} radius={r*0.012} color={M.silver} />})}
    </Part>
  </group>;
}

function AirbagPlatform({ a }: { a: Asset3D }) {
  const w=a.span ?? 3.2, r=w*0.24, h=w*0.045;
  const panel=useDetailGeometry(()=>{
    const shape=new THREE.Shape();shape.moveTo(-r*0.85,0);shape.lineTo(r*0.85,0);shape.lineTo(0,r*1.48);shape.lineTo(-r*0.85,0);
    return new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false}).rotateX(-Math.PI/2);
  },[r,h]);
  return <group>
    <Part id="body" offset={[0,w*0.15,0]} labelAt={[0,h*2.3,0]}>
      <mesh position={[0,h,0]} rotation={[0,Math.PI/6,0]} castShadow receiveShadow><cylinderGeometry args={[r,r,h*1.2,3]} /><meshStandardMaterial color={a.tone??M.silver} metalness={0.5} roughness={0.5} /></mesh>
    </Part>
    <Part id="petals" offset={[0,0,w*0.22]} labelAt={[0,h,w*0.42]}>
      {[0,1,2].map(i=><group key={i} rotation={[0,i*Math.PI*2/3,0]}>
        <mesh geometry={panel} position={[0,h,-r*0.5]} castShadow receiveShadow><meshStandardMaterial color={M.silver} metalness={0.55} roughness={0.5} /></mesh>
      </group>)}
    </Part>
    <Part id="solar" offset={[0,w*0.15,-w*0.15]} labelAt={[r,h*2,r]}>
      {[0,1,2].map(i=><group key={i} rotation={[0,i*Math.PI*2/3,0]}>
        <mesh geometry={panel} position={[0,h*2.05,-r*0.5]} scale={[0.83,0.06,0.83]} receiveShadow><meshStandardMaterial color={a.panels === 0 ? M.foil : M.solar} metalness={0.4} roughness={0.5} /></mesh>
      </group>)}
    </Part>
    <Part id="deck" offset={[w*0.22,w*0.2,0]} labelAt={[0,w*0.5,0]}>
      {a.panels === 0 ? <mesh position={[0,h*2.2,0]}><boxGeometry args={[r*0.65,h*0.8,r*0.5]} /><meshStandardMaterial color={M.midGrey} metalness={0.6} roughness={0.5} /></mesh> : <>
      <Strut from={[0,h*2,0]} to={[0,w*0.43,0]} radius={w*0.014} color={M.silver} />
      <mesh position={[0,w*0.46,0]}><cylinderGeometry args={[w*0.035,w*0.045,w*0.1,12]} /><meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.5} /></mesh>
      <CameraOptics positions={[[0,w*0.47,w*0.043]]} radius={w*0.013} depth={w*0.02} />
      </>}
    </Part>
  </group>;
}

function ClamshellLander({ a }: { a: Asset3D }) {
  const r=(a.span??0.65)/2;
  return <group>
    <Part id="body" offset={[0,r*0.6,0]} labelAt={[0,r*0.3,0]}>
      <mesh position={[0,r*0.15,0]} castShadow receiveShadow><cylinderGeometry args={[r,r,r*0.25,32]} /><meshStandardMaterial color={M.gold} metalness={0.5} roughness={0.5} /></mesh>
      <mesh position={[0,r*0.29,0]}><cylinderGeometry args={[r*0.6,r*0.6,r*0.03,24]} /><meshStandardMaterial color={M.silver} metalness={0.6} roughness={0.5} /></mesh>
    </Part>
    <Part id="panels" offset={[0,r,0]} labelAt={[r*1.8,r*0.15,0]}>
      {[0,1,2,3].map(i=><group key={i} rotation={[0,i*Math.PI/2,0]}>
        <mesh position={[r*1.8,r*0.12,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[r*0.8,24]} /><meshStandardMaterial color={M.solar} side={THREE.DoubleSide} roughness={0.55} /></mesh>
        <Strut from={[r*0.7,r*0.15,0]} to={[r*1.4,r*0.15,0]} radius={r*0.025} color={M.silver} />
      </group>)}
    </Part>
    <Part id="payload" offset={[r*0.8,r*0.4,0]} labelAt={[r*0.2,r*0.55,0]}>
      <Strut from={[r*0.2,r*0.3,0]} to={[r*0.8,r*0.5,r*0.2]} radius={r*0.05} color={M.silver} />
      <mesh position={[r*0.8,r*0.5,r*0.2]}><boxGeometry args={[r*0.3,r*0.2,r*0.22]} /><meshStandardMaterial color={M.grey} metalness={0.6} roughness={0.45} /></mesh>
    </Part>
  </group>;
}

function SlimLander({ a }: { a: Asset3D }) {
  const w=a.span??1,h=a.height??1.5;
  // Display the observed tipped attitude; contact locations are illustrative.
  return <group position={[0,w*0.65,0]} rotation={[0,0,Math.PI/2]}>
    <Part id="body" offset={[0,h*0.35,0]} labelAt={[0,h*0.7,0]}><mesh position={[0,h*0.42,0]} castShadow><boxGeometry args={[w,h,w*0.78]} /><meshStandardMaterial color={M.foil} metalness={0.5} roughness={0.5} /></mesh></Part>
    <Part id="feet" offset={[0,-h*0.25,0]} labelAt={[w*0.7,0,0]}>
      {[[-0.5,-0.1,-0.4],[0.5,-0.1,-0.4],[-0.5,-0.1,0.4],[0.5,-0.1,0.4],[0,h*0.95,w*0.48]].map((p,i)=><group key={i} position={p as [number,number,number]}>
        <Strut from={[0,0,0]} to={[Math.sign(p[0])*w*0.2,-h*0.08,Math.sign(p[2])*w*0.12]} radius={w*0.025} color={M.silver} />
        <mesh position={[Math.sign(p[0])*w*0.2,-h*0.08,Math.sign(p[2])*w*0.12]}><sphereGeometry args={[w*0.11,12,10]} /><meshStandardMaterial color={M.grey} metalness={0.55} roughness={0.6} /></mesh>
      </group>)}
    </Part>
    <Part id="engines" offset={[0,-h*0.3,0]} labelAt={[0,-h*0.1,w*0.3]}>{[-1,1].map(s=><Bell key={s} position={[s*w*0.22,-h*0.2,0]} radius={w*0.1} height={h*0.2} />)}</Part>
    <Part id="solar" offset={[w*0.4,h*0.2,0]} labelAt={[w*0.52,h*0.4,0]}><SolarPanel size={[w*0.72,h*0.78]} position={[w*0.51,h*0.4,0]} rotation={[0,0,Math.PI/2]} cells={6} /></Part>
  </group>;
}

function SampleLander({ a }: { a: Asset3D }) {
  const w=a.span??2.2,h=a.height??1.3,r=w*0.28;
  return <group>
    <Part id="body" offset={[0,h*0.35,0]} labelAt={[0,h*0.7,0]}>
      <mesh position={[0,h*0.62,0]}><cylinderGeometry args={[r,r,h*0.3,8]} /><meshStandardMaterial color={a.tone??M.silver} metalness={0.55} roughness={0.5} /></mesh>
      {[-1,1].flatMap(s=>[-1,1].map(t=><mesh key={`${s}-${t}`} position={[s*r*0.75,h*0.78,t*r*0.75]}><sphereGeometry args={[r*0.35,16,12]} /><meshStandardMaterial color={M.silver} metalness={0.6} roughness={0.45} /></mesh>))}
    </Part>
    <Part id="legs" offset={[0,-h*0.2,w*0.2]} labelAt={[w*0.45,h*0.2,0]}>{[0,1,2,3].map(i=><CrushLeg key={i} angle={i*Math.PI/2+Math.PI/4} reach={w*0.48} drop={h*0.48} />)}</Part>
    <Part id="engine" offset={[0,-h*0.3,0]} labelAt={[0,h*0.2,0]}><Bell position={[0,h*0.12,0]} radius={r*0.24} height={h*0.35} /></Part>
    <Part id="drill" offset={[w*0.4,0,0]} labelAt={[w*0.47,h*0.4,0]}>
      <Strut from={[r,h*0.7,0]} to={[w*0.48,h*0.62,0]} radius={w*0.028} color={M.silver} />
      <Strut from={[w*0.48,h*0.62,0]} to={[w*0.48,h*0.05,0]} radius={w*0.023} color={M.dark} />
    </Part>
    <Part id="ascent" offset={[0,h*0.8,0]} labelAt={[0,h*1.3,0]}>
      <mesh position={[0,h*1.1,0]}><cylinderGeometry args={[r*0.25,r*0.4,h*0.65,16]} /><meshStandardMaterial color={M.gold} metalness={0.5} roughness={0.5} /></mesh>
      <mesh position={[0,h*1.48,0]}><sphereGeometry args={[r*0.3,16,12]} /><meshStandardMaterial color={M.silver} metalness={0.6} roughness={0.4} /></mesh>
    </Part>
  </group>;
}

function Lander({ a }: { a: Asset3D }) {
  if (a.variant === "petal-capsule") return <PetalCapsule a={a} />;
  if (a.variant === "airbag-platform") return <AirbagPlatform a={a} />;
  if (a.variant === "clamshell-lander") return <ClamshellLander a={a} />;
  if (a.variant === "slim-lander") return <SlimLander a={a} />;
  if (a.variant === "sample-lander") return <SampleLander a={a} />;
  const span = a.span ?? 1.6;
  const h = a.height ?? 1.0;
  const legs = a.legs ?? 4;
  const r = span / 2;
  return (
    <group>
      <Part id="body" offset={[0, 0.5, 0]} labelAt={[0, h * 1.25, 0]}>
        <mesh position={[0, h * 0.95, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r * 0.82, r * 0.9, h * 0.6, 8]} />
          <meshStandardMaterial color={a.tone ?? M.warmWhite} metalness={0.35} roughness={0.5} />
        </mesh>
        <MountingRing position={[0, h * 1.25, 0]} radius={r * 0.73} color={M.copper} />
      </Part>
      <Part id="legs" offset={[0, 0, 0]} labelAt={[r * 0.8, h * 0.5, r * 0.8]}>
        {Array.from({ length: legs }).map((_, i) => (
          <CrushLeg key={i} angle={(Math.PI / legs) + i * ((Math.PI * 2) / legs)} reach={r * 0.96} drop={h * 0.65} legRadius={Math.max(0.03, span * 0.012)} />
        ))}
      </Part>
      <Part id="engine" offset={[0, -0.7, 0]} labelAt={[0, h * 0.3, r * 0.4]}>
        <Bell position={[0, h * 0.23 + 0.005, 0]} radius={r * 0.3} height={h * 0.42} />
      </Part>
      <Part id="dish" offset={[0, 0.6, -0.4]} labelAt={[-r * 0.7, h * 1.5, -r * 0.5]}>
        <Dish position={[-r * 0.5, h * 1.16, -r * 0.3]} radius={r * 0.22} rotation={[1.1, 0.4, 0]} />
      </Part>
      <Part id="deck" offset={[0, 0.7, 0]} labelAt={[r * 0.4, h * 1.35, r * 0.4]}>
        <Strut from={[r * 0.2, h * 1.24, r * 0.3]} to={[r * 0.2, h * 1.27, r * 0.3]} radius={0.015} color={M.silver} />
        <SolarPanel size={[span * 0.5, span * 0.34]} position={[r * 0.2, h * 1.27, r * 0.3]} cells={4} />
        <mesh position={[r * 0.1, h * 1.4, r * 0.3]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, h * 0.3, 8]} />
          <meshStandardMaterial color={M.silver} metalness={0.85} roughness={0.3} />
        </mesh>
        <mesh position={[r * 0.1, h * 1.56, r * 0.3]}>
          <boxGeometry args={[0.12, 0.1, 0.1]} />
          <meshStandardMaterial color={M.dark} metalness={0.55} roughness={0.45} />
        </mesh>
        <CameraOptics positions={[[r * 0.1, h * 1.56, r * 0.3 + 0.066]]} radius={0.025} depth={0.028} />
      </Part>
    </group>
  );
}

function Easep({ a }: { a: Asset3D }) {
  const scale=(a.span??0.9)/0.9;
  return <group scale={scale}>
    <Part id="seismic" offset={[0,0.4,0]} labelAt={[0,0.27,0]}><mesh position={[0,0.17,0]}><boxGeometry args={[0.34,0.3,0.34]} /><meshStandardMaterial color={M.silver} metalness={0.6} roughness={0.45} /></mesh></Part>
    <Part id="solar" offset={[0,0.3,-0.3]} labelAt={[0.48,0.12,0]}>{[-1,1].map(s=><SolarPanel key={s} size={[0.48,0.38]} position={[s*0.4,0.06,0]} cells={5} />)}</Part>
    <Part id="antenna" offset={[0,0.4,0.2]} labelAt={[0,0.68,0]}><Strut from={[0,0.32,0]} to={[0,0.66,0]} radius={0.008} color={M.silver} /><mesh position={[0,0.67,0]}><boxGeometry args={[0.18,0.015,0.16]} /><meshStandardMaterial color={M.warmWhite} /></mesh></Part>
    <Part id="reflector" offset={[0.6,0.2,0.2]} labelAt={[1.15,0.2,0]}><group position={[1.15,0.13,0]} rotation={[-0.6,0,0]}><mesh><boxGeometry args={[0.4,0.035,0.4]} /><meshStandardMaterial color={M.silver} metalness={0.6} roughness={0.4} /></mesh>{Array.from({length:100},(_,i)=><mesh key={i} position={[(i%10-4.5)*0.033,0.025,(Math.floor(i/10)-4.5)*0.033]}><boxGeometry args={[0.025,0.012,0.025]} /><meshStandardMaterial color="#bccce4" metalness={0.35} roughness={0.18} /></mesh>)}</group></Part>
  </group>;
}

function Station({ a }: { a: Asset3D }) {
  if (a.variant === "easep") return <Easep a={a} />;
  const span = a.span ?? 1.4;
  return (
    <group scale={[1, (a.height ?? 0.94) / 0.94, 1]}>
      <Part id="station" offset={[0, 0.55, 0]} labelAt={[0, 0.5, 0]}>
        <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
          <boxGeometry args={[span * 0.6, 0.44, span * 0.5]} />
          <meshStandardMaterial color={a.tone ?? M.grey} metalness={0.5} roughness={0.5} />
        </mesh>
        <SurfacePanel size={[span * 0.42, 0.28]} position={[0, 0.34, span * 0.251]} louvers={4} />
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[span * 0.5, 0.06, span * 0.42]} />
          <meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.5} />
        </mesh>
        {[-1, 1].flatMap((s) => [-1, 1].map((t) => (
          <mesh key={`${s}-${t}`} position={[s * span * 0.26, 0.06, t * span * 0.2]}>
            <boxGeometry args={[0.04, 0.12, 0.04]} />
            <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.35} />
          </mesh>
        )))}
      </Part>
      <Part id="antenna" offset={[0, 0.6, -0.5]} labelAt={[0, 0.98, -span * 0.4]}>
        <group position={[0, 0.66, -span * 0.2]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.02, 0.02, 0.42, 8]} />
            <meshStandardMaterial color={M.silver} metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.215, 0]}>
            <boxGeometry args={[0.26, 0.02, 0.26]} />
            <meshStandardMaterial color={M.warmWhite} metalness={0.4} roughness={0.45} />
          </mesh>
        </group>
      </Part>
      <Part id="power" offset={[span * 0.9, 0, span * 0.6]} labelAt={[span * 0.9, 0.55, span * 0.6]}>
        <mesh position={[span * 0.85, 0.26, span * 0.54]} castShadow>
          <cylinderGeometry args={[0.13, 0.13, 0.5, 12]} />
          <meshStandardMaterial color={M.dark} metalness={0.7} roughness={0.35} />
        </mesh>
        {[0.1, 0.26, 0.42].map((y) => (
          <mesh key={y} position={[span * 0.85, y, span * 0.54]}>
            <cylinderGeometry args={[0.2, 0.2, 0.012, 12]} />
            <meshStandardMaterial color={M.silver} metalness={0.9} roughness={0.25} />
          </mesh>
        ))}
      </Part>
      <Part id="boom" offset={[-span * 0.8, 0.5, 0]} labelAt={[-span * 0.9, 0.8, 0]}>
        <Strut from={[-span * 0.3, 0.5, 0]} to={[-span * 0.95, 0.86, 0]} radius={0.016} color={M.silver} />
        <mesh position={[-span * 0.95, 0.88, 0]}>
          <boxGeometry args={[0.1, 0.08, 0.1]} />
          <meshStandardMaterial color={M.black} metalness={0.5} roughness={0.5} />
        </mesh>
      </Part>
      <Part id="cable" offset={[0, -0.3, 0.7]} labelAt={[span * 0.4, 0.16, span * 0.9]}>
        <mesh position={[span * 0.3, 0.03, span * 0.75]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[span * 1.4, 0.02, 0.08]} />
          <meshStandardMaterial color={M.copper} metalness={0.5} roughness={0.5} />
        </mesh>
      </Part>
    </group>
  );
}

function TripodCamera({ a }: { a: Asset3D }) {
  const w=a.span ?? 0.4, h=a.height ?? w*2;
  return <group>
    <Part id="camera" offset={[0,h*0.4,0]} labelAt={[0,h,w*0.3]}>
      <mesh position={[0,h*0.83,0]} castShadow><boxGeometry args={[w,h*0.23,w*0.7]} /><meshStandardMaterial color={a.tone??M.silver} metalness={0.6} roughness={0.48} /></mesh>
      <CameraOptics positions={[[0,h*0.83,w*0.37]]} radius={w*0.12} depth={w*0.12} />
    </Part>
    <Part id="tripod" offset={[0,-h*0.1,w*0.3]} labelAt={[w*0.5,h*0.25,0]}>
      {[0,1,2].map(i=>{const angle=i*Math.PI*2/3;return <Strut key={i} from={[0,h*0.7,0]} to={[Math.cos(angle)*w*0.65,0.015,Math.sin(angle)*w*0.65]} radius={w*0.025} color={M.silver} />})}
    </Part>
  </group>;
}

function FlagAssembly({ a }: { a: Asset3D }) {
  const w=a.span ?? 0.9,h=a.height??1.7;
  return <group>
    <Part id="pole" offset={[0,h*0.2,0]} labelAt={[0,h*0.6,0]}>
      <Strut from={[0,0,0]} to={[0,h,0]} radius={h*0.008} color={M.silver} />
      <Strut from={[0,h*0.98,0]} to={[w,h*0.98,0]} radius={h*0.005} color={M.silver} />
    </Part>
    <Part id="flag" offset={[w*0.3,h*0.2,0]} labelAt={[w*0.5,h*0.75,0]}>
      <mesh position={[w*0.5,h*0.8,0]}><planeGeometry args={[w,h*0.36,8,4]} /><meshStandardMaterial color={a.tone??M.warmWhite} side={THREE.DoubleSide} roughness={0.95} /></mesh>
    </Part>
  </group>;
}

function FoilCollector({ a }: { a: Asset3D }) {
  const w=a.span??0.3,h=a.height??1.4;
  return <group>
    <Part id="mast" offset={[0,h*0.2,0]} labelAt={[0,h*0.5,0]}><Strut from={[0,0,0]} to={[0,h,0]} radius={h*0.006} color={M.silver} /></Part>
    <Part id="foil" offset={[w,h*0.15,0]} labelAt={[0,h*0.8,w*0.3]}>
      <mesh position={[0,h*0.71,0]}><planeGeometry args={[w,h*0.5]} /><meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.46} side={THREE.DoubleSide} /></mesh>
      <Strut from={[-w*0.55,h*0.96,0]} to={[w*0.55,h*0.96,0]} radius={h*0.004} color={M.silver} />
    </Part>
  </group>;
}

function HeatProbe({ a }: { a: Asset3D }) {
  const w=a.span??0.4;
  return <group>
    <Part id="support" offset={[0,w*0.4,0]} labelAt={[-w*0.2,w*0.5,0]}>
      <mesh position={[-w*0.24,w*0.3,0]} castShadow><boxGeometry args={[w*0.45,w*0.6,w*0.3]} /><meshStandardMaterial color={M.gold} metalness={0.6} roughness={0.45} /></mesh>
    </Part>
    <Part id="probe" offset={[w*0.6,w*0.25,0]} labelAt={[w*0.45,w*0.09,0]}>
      {/* Cutaway-free surface depiction: a shallow hole marks the buried probe. */}
      <mesh position={[w*0.45,w*0.015,0]}><cylinderGeometry args={[w*0.1,w*0.1,w*0.025,16]} /><meshStandardMaterial color={M.dark} roughness={0.95} /></mesh>
    </Part>
    <Part id="tether" offset={[0,0,w*0.4]} labelAt={[w*0.12,w*0.07,0]}><Strut from={[-w*0.2,w*0.08,0]} to={[w*0.45,w*0.04,0]} radius={w*0.016} color={M.copper} /></Part>
  </group>;
}

function Instrument({ a }: { a: Asset3D }) {
  if (a.variant === "seismometer") return <Seismometer a={a} />;
  if (a.variant === "flag") return <FlagAssembly a={a} />;
  if (a.variant === "tripod-camera") return <TripodCamera a={a} />;
  if (a.variant === "foil-collector") return <FoilCollector a={a} />;
  if (a.variant === "heat-probe") return <HeatProbe a={a} />;
  const w = a.span ?? 0.6;
  const h = a.height ?? 0.36;
  const detailDepth = Math.min(w, h) * 0.003;
  return (
    <group>
      <Part id="box" offset={[0, 0.45, 0]} labelAt={[0, h * 0.8, 0]}>
        <mesh position={[0, h * 0.6, detailDepth]} castShadow receiveShadow>
          <boxGeometry args={[w, h * 0.8, w * 0.8 - detailDepth * 2]} />
          <meshStandardMaterial color={a.tone ?? M.warmWhite} metalness={0.4} roughness={0.5} />
        </mesh>
        <SurfacePanel size={[w * 0.68, h * 0.48]} position={[0, h * 0.6, -w * 0.4 + detailDepth * 2]} rotation={[0, Math.PI, 0]} louvers={3} depth={detailDepth} />
        {[-0.25, 0, 0.25].map((f) => (
          <mesh key={f} position={[w * f * 0.7, h * 0.6, w * 0.41]}>
            <boxGeometry args={[0.02, h * 0.6, 0.01]} />
            <meshStandardMaterial color={M.grey} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {[-1, 1].map((s) =>
          [-1, 1].map((t) => (
            <mesh key={`${s}-${t}`} position={[s * w * 0.34, h * 0.1, t * w * 0.28]}>
              <boxGeometry args={[0.05, h * 0.2, 0.05]} />
              <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.35} />
            </mesh>
          )),
        )}
      </Part>
      <Part id="sensor" offset={[0, 0.55, w]} labelAt={[0, h * 1.05, w * 0.7]}>
        <mesh position={[0, h * 0.98, w * 0.42]} rotation={[0.5, 0, 0]} castShadow>
          <cylinderGeometry args={[w * 0.16, w * 0.2, h * 0.4, 14]} />
          <meshStandardMaterial color={M.silver} metalness={0.85} roughness={0.28} />
        </mesh>
      </Part>
      <Part id="antenna" offset={[w, 0.3, 0]} labelAt={[w * 0.45, h * 1.2, 0]}>
        <Strut from={[w * 0.4, h * 0.8, 0]} to={[w * 0.85, h * 1.5, 0]} radius={0.01} color={M.silver} />
        <mesh position={[w * 0.85, h * 1.55, 0]}>
          <boxGeometry args={[0.06, 0.05, 0.06]} />
          <meshStandardMaterial color={M.black} metalness={0.5} roughness={0.5} />
        </mesh>
      </Part>
      <Part id="cable" offset={[-w, -0.2, 0]} labelAt={[-w * 0.9, 0.1, 0]}>
        <Strut from={[-w * 0.38, h * 0.23, 0]} to={[-w * 0.55, 0.02, 0]} radius={0.008} color={M.copper} />
        <mesh position={[-w * 0.85, 0.02, 0]}>
          <boxGeometry args={[w * 1.2, 0.015, 0.05]} />
          <meshStandardMaterial color={M.copper} metalness={0.5} roughness={0.5} />
        </mesh>
      </Part>
    </group>
  );
}

function Seismometer({ a }: { a: Asset3D }) {
  const w = a.span ?? 0.6;
  const r = w / 2;
  return (
    <group>
      <Part id="box" offset={[0, 0.45, 0]} labelAt={[0, r * 0.7, 0]}>
        <mesh position={[0, r * 0.15, 0]} scale={[1, 0.75, 1]} castShadow receiveShadow>
          <sphereGeometry args={[r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={a.tone ?? M.warmWhite} metalness={0.35} roughness={0.55} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, r * 0.12, 0]}>
          <cylinderGeometry args={[r * 1.02, r * 1.02, r * 0.06, 24, 1, true]} />
          <meshStandardMaterial color={M.grey} metalness={0.5} roughness={0.5} side={THREE.DoubleSide} />
        </mesh>
        <MountingRing position={[0, r * 0.15, 0]} radius={r * 0.985} />
      </Part>
      <Part id="sensor" offset={[0, 0.55, w]} labelAt={[0, r * 0.4, r * 0.3]}>
        <mesh position={[0, r * 0.08, 0]} scale={[1, 0.6, 1]} castShadow>
          <sphereGeometry args={[r * 0.6, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={M.gold} metalness={0.65} roughness={0.45} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, r * 0.08, 0]}>
          <cylinderGeometry args={[r * 0.64, r * 0.64, r * 0.06, 20]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.65} roughness={0.4} />
        </mesh>
      </Part>
      <Part id="antenna" offset={[w, 0.3, 0]} labelAt={[-r * 0.3, r * 0.08, 0]}>
        {[0, 1, 2].map(i => {
          const angle = i * Math.PI * 2 / 3;
          const x = Math.cos(angle) * r * 0.62;
          const z = Math.sin(angle) * r * 0.62;
          return <group key={i}>
            <mesh position={[x, r * 0.09, z]} castShadow receiveShadow>
              <cylinderGeometry args={[r * 0.08, r * 0.1, r * 0.18, 10]} />
              <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.45} />
            </mesh>
            <Strut from={[x, r * 0.16, z]} to={[x * 0.45, r * 0.08, z * 0.45]} radius={r * 0.025} color={M.midGrey} />
          </group>;
        })}
      </Part>
      <Part id="cable" offset={[-w, -0.2, 0]} labelAt={[-r * 1.15, 0.03, 0]}>
        <Strut from={[-r * 0.6, 0.06, 0]} to={[-r * 1.3, 0.018, 0]} radius={0.007} color={M.copper} />
        <Strut from={[-r * 1.3, 0.018, 0]} to={[-r * 2.5, 0.018, r * 0.3]} radius={0.007} color={M.copper} />
      </Part>
    </group>
  );
}

function Reflector({ a }: { a: Asset3D }) {
  if (a.variant === "sample-depot") return <SampleDepot a={a} />;
  return <ReflectorArray a={a} />;
}

function ReflectorArray({ a }: { a: Asset3D }) {
  const n = Math.max(1, Math.min(12, Math.round(a.panels ?? 3)));
  const w = a.span ?? 0.6;
  const tilt = 0.42;
  const centerY = w * 0.62;
  // Cubes and backing plate share one plane. Translating cubes in world Z
  // after rotating each cube separately left rows floating through the frame.
  const cubes = useDetailGeometry(() => combineGeometry(
    Array.from({ length: n * n }, (_, index) => new THREE.BoxGeometry(w / n * 0.82, w / n * 0.82, w * 0.08)
      .translate((index % n - (n - 1) / 2) * (w / n), (Math.floor(index / n) - (n - 1) / 2) * (w / n), w * 0.065)),
  ), [w, n]);
  return (
    <group scale={[1, a.height ? a.height / (w * 1.11) : 1, 1]}>
      <Part id="array" offset={[0, 0.5, 0]} labelAt={[0, w * 0.7, 0]}>
        <mesh geometry={cubes} position={[0, centerY, 0]} rotation={[tilt, 0, 0]} castShadow>
          <meshStandardMaterial color="#dfe9f5" metalness={0.15} roughness={0.08} emissive="#8fc4ff" emissiveIntensity={0.12} />
        </mesh>
      </Part>
      <Part id="frame" offset={[0, 0.3, 0]} labelAt={[w * 0.7, w * 0.35, 0]}>
        <mesh position={[0, centerY, 0]} rotation={[tilt, 0, 0]} castShadow>
          <boxGeometry args={[w * 1.06, w * 1.06, w * 0.046]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.7} roughness={0.4} />
        </mesh>
        <group position={[0, centerY, 0]} rotation={[tilt, 0, 0]}>
          <SurfacePanel size={[w * 1.05, w * 1.05]} position={[0, 0, w * 0.023]} color={M.midGrey} depth={w * 0.001} />
        </group>
      </Part>
      <Part id="base" offset={[0, -0.3, 0]} labelAt={[0, 0.12, w * 0.5]}>
        {[-1, 1].map((s) => (
          <group key={s}>
            <Strut from={[s * w * 0.4, centerY - w * 0.3 * Math.cos(tilt), -w * 0.3 * Math.sin(tilt)]} to={[s * w * 0.52, 0.02, -w * 0.6]} radius={0.014} color={M.silver} />
            <Strut from={[s * w * 0.4, centerY + w * 0.3 * Math.cos(tilt), w * 0.3 * Math.sin(tilt)]} to={[s * w * 0.52, 0.02, w * 0.6]} radius={0.014} color={M.silver} />
          </group>
        ))}
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.024, 12]} />
          <meshStandardMaterial color={M.silver} metalness={0.6} roughness={0.5} />
        </mesh>
      </Part>
    </group>
  );
}

function SampleDepot({ a }: { a: Asset3D }) {
  const w = a.span ?? 0.4;
  const count = Math.max(1, Math.min(12, Math.round(a.panels ?? 10)));
  const radius = w * 0.045;
  const length = w * 0.65;
  const positions = useMemo(() => Array.from({ length: count }, (_, i) => [
    (i % 2 ? 1 : -1) * w * 0.32, radius + 0.012, (i - (count - 1) / 2) * w * 0.36,
  ] as [number, number, number]), [w, count, radius]);
  const cartridges = useDetailGeometry(() => combineGeometry(positions.map(([x, y, z]) =>
    new THREE.CylinderGeometry(radius * 0.72, radius * 0.72, length, 12).rotateX(Math.PI / 2).translate(x, y, z),
  )), [positions, radius, length]);
  const sleeves = useDetailGeometry(() => combineGeometry(positions.flatMap(([x, y, z]) => [
    new THREE.CylinderGeometry(radius, radius, length, 14, 1, true).rotateX(Math.PI / 2).translate(x, y, z),
    ...[-1, 1].map(side => new THREE.TorusGeometry(radius, radius * 0.14, 5, 14).translate(x, y, z + side * length * 0.48)),
    ...[-1, 1].map(side => new THREE.CylinderGeometry(radius * 0.9, radius * 0.9, radius * 0.16, 12)
      .rotateX(Math.PI / 2).translate(x, y, z + side * length * 0.47)),
    ...[-1, 1].map(side => new THREE.TorusGeometry(radius * 0.98, radius * 0.04, 4, 14).translate(x, y, z + side * length * 0.3)),
  ])), [positions, radius, length]);
  const markers = useDetailGeometry(() => combineGeometry(positions.map(([x, , z]) =>
    new THREE.CylinderGeometry(radius * 0.3, radius * 0.3, 0.024, 6).translate(x + w * 0.1, 0.012, z),
  )), [positions, radius, w]);
  return (
    <group>
      <Part id="array" offset={[0, 0.5, 0]} labelAt={[0, 0.16, 0]}>
        <mesh geometry={cartridges} castShadow receiveShadow><meshStandardMaterial color={M.gold} metalness={0.75} roughness={0.35} /></mesh>
      </Part>
      <Part id="frame" offset={[0, 0.3, 0]} labelAt={[w * 0.45, 0.08, 0]}>
        <mesh geometry={sleeves} castShadow receiveShadow><meshStandardMaterial color={M.silver} metalness={0.78} roughness={0.35} side={THREE.DoubleSide} /></mesh>
      </Part>
      <Part id="base" offset={[0, -0.3, 0]} labelAt={[w * 0.6, 0.03, w * 0.7]}>
        <mesh geometry={markers} receiveShadow><meshStandardMaterial color={M.grey} metalness={0.35} roughness={0.8} /></mesh>
      </Part>
    </group>
  );
}

function HeatShield({ a }: { a: Asset3D }) {
  const r = (a.span ?? 2.4) / 2;
  const d = a.height ?? 0.6;
  return (
    <group>
      {/* Ablative face: a shallow cap with its wide rim up, resting on its apex. */}
      <Part id="shield" offset={[0, 0.5, 0]} labelAt={[0, d * 0.55, 0]}>
        <mesh position={[0, d * 0.5, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[r, r * 0.16, d, 40, 1, true]} />
          <meshStandardMaterial color="#8a6a52" metalness={0.1} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[r * 0.16, 40]} />
          <meshStandardMaterial color="#5a4034" metalness={0.1} roughness={1} side={THREE.DoubleSide} />
        </mesh>
      </Part>
      <Part id="rim" offset={[0, 0.3, 0]} labelAt={[r * 0.8, 0.12, 0]}>
        <mesh position={[0, d * 0.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 0.99, 0.05, 8, 40]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.75} roughness={0.4} />
        </mesh>
      </Part>
      <Part id="interior" offset={[0, -0.25, 0]} labelAt={[0, d * 1.25, r * 0.45]}>
        <MountingRing position={[0, d * (0.12 + 0.82 * 0.56 / 0.96), 0]} radius={r * 0.56} />
        {Array.from({ length: 10 }).map((_, i) => {
          const ang = (i / 10) * Math.PI * 2;
          return (
            <Strut
              key={i}
              from={[0, d * 0.12, 0]}
              to={[Math.cos(ang) * r * 0.96, d * 0.94, Math.sin(ang) * r * 0.96]}
              radius={0.018}
              color={M.silver}
            />
          );
        })}
      </Part>
    </group>
  );
}

function Backshell({ a }: { a: Asset3D }) {
  const r = (a.span ?? 2.2) / 2;
  const h = a.height ?? 1.2;
  return (
    <group position={[0, h * 0.5, 0]}>
      <Part id="shell" offset={[0, 0.45, 0]} labelAt={[0, h * 0.8, 0]}>
        <ShellSeams position={[0, 0, 0]} top={r * 0.42} bottom={r} height={h} />
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[r * 0.42, r, h, 28, 1, true]} />
          <meshStandardMaterial color={a.tone ?? M.warmWhite} metalness={0.4} roughness={0.55} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, h * 0.5, 0]}>
          <cylinderGeometry args={[r * 0.42, r * 0.42, 0.04, 28]} />
          <meshStandardMaterial color={M.grey} metalness={0.6} roughness={0.4} />
        </mesh>
      </Part>
      <Part id="rim" offset={[0, 0.3, 0]} labelAt={[r * 0.7, -0.1, 0]}>
        <mesh position={[0, -h * 0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r * 0.97, 0.05, 8, 28]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.7} roughness={0.4} />
        </mesh>
      </Part>
      <Part id="vent" offset={[0, 0.75, -0.4]} labelAt={[-r * 0.5, h * 0.9, 0]}>
        <mesh position={[0, h * 0.5 + 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.24, 0.16, 16]} />
          <meshStandardMaterial color={M.dark} metalness={0.6} roughness={0.45} />
        </mesh>
        <CollarBands position={[0, h * 0.5 + 0.08, 0]} radius={0.2} height={0.14} count={3} />
      </Part>
    </group>
  );
}

function Parachute({ a }: { a: Asset3D }) {
  const r = (a.span ?? 2.6) / 2;
  const h = a.height ?? 2.6;
  const lines = useMemo(() => Array.from({ length: 12 }).map((_, i) => (i / 12) * Math.PI * 2), []);
  const seams = useDetailGeometry(() => {
    const pieces = lines.map((angle) => {
      const points = Array.from({ length: 10 }, (_, i) => {
        const arc = i / 9 * Math.PI / 2;
        return new THREE.Vector3(
          Math.cos(angle) * r * Math.sin(arc),
          h * 0.55 + h * 0.35 * Math.cos(arc),
          Math.sin(angle) * r * Math.sin(arc),
        );
      });
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 12, r * 0.003, 3, false);
    });
    return combineGeometry(pieces);
  }, [r, h, lines]);
  return (
    <group>
      <Part id="canopy" offset={[0, 1.0, 0]} labelAt={[0, h + 0.2, 0]}>
        {/* Convex crown, seen from outside like a deployed canopy. */}
        <mesh position={[0, h * 0.55, 0]} scale={[1, h * 0.35 / r, 1]} castShadow receiveShadow>
          <sphereGeometry args={[r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={a.tone ?? "#ece9e2"} metalness={0.05} roughness={0.8} side={THREE.DoubleSide} />
        </mesh>
        {/* Disk-gap-band skirt hanging below the crown. */}
        <mesh position={[0, h * 0.4, 0]} castShadow>
          <cylinderGeometry args={[r * 0.96, r * 0.84, h * 0.22, 32, 1, true]} />
          <meshStandardMaterial color="#d8d5cc" metalness={0.05} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
        <mesh geometry={seams}>
          <meshStandardMaterial color="#b5b8b4" metalness={0.05} roughness={0.9} />
        </mesh>
        <ShellSeams position={[0, h * 0.4, 0]} top={r * 0.96} bottom={r * 0.84} height={h * 0.22} color="#b9bab4" />
      </Part>
      <Part id="lines" offset={[0, 0.4, 0]} labelAt={[r * 0.8, h * 0.4, 0]}>
        {lines.map((ang) => (
          <Strut
            key={ang}
            from={[Math.cos(ang) * r * 0.84, h * 0.29, Math.sin(ang) * r * 0.84]}
            to={[0, h * 0.08, 0]}
            radius={0.007}
            color="#cfd6de"
          />
        ))}
      </Part>
      <Part id="riser" offset={[0, 0.45, 0]} labelAt={[0, h * 0.14, 0.4]}>
        <Strut from={[0, h * 0.08, 0]} to={[0, 0, 0]} radius={0.03} color={M.silver} />
      </Part>
      <Part id="bag" offset={[r * 0.8, 0.2, r * 0.5]} labelAt={[r * 0.7, 0.3, r * 0.4]}>
        <mesh position={[r * 0.62, 0.16, r * 0.42 - 0.0024]} castShadow>
          <boxGeometry args={[0.5, 0.3, 0.3952]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.4} roughness={0.6} />
        </mesh>
        <SurfacePanel size={[0.38, 0.2]} position={[r * 0.62, 0.16, r * 0.42 + 0.1952]} color="#5c636c" />
      </Part>
    </group>
  );
}

function SkyCrane({ a }: { a: Asset3D }) {
  if (a.variant === "cradle" || a.variant === "terminal-stage") return <Cradle a={a} powered={a.variant === "terminal-stage"} />;
  const w = a.span ?? 3.4;
  const h = a.height ?? 1.6;
  return (
    <group position={[0, h * 0.5, 0]}>
      <Part id="structure" offset={[0, 0.45, 0]} labelAt={[0, h * 0.72, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h * 0.44, w * 0.8]} />
          <meshStandardMaterial color={a.tone ?? M.gold} metalness={0.6} roughness={0.4} />
        </mesh>
        <SurfacePanel size={[w * 0.42, h * 0.28]} position={[0, 0, w * 0.401]} louvers={4} />
        <mesh position={[0, h * 0.3, 0]}>
          <cylinderGeometry args={[0.5, 0.5, h * 0.24, 16]} />
          <meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.35} />
        </mesh>
      </Part>
      <Part id="thrusters" offset={[0, 0.6, 0]} labelAt={[w * 0.55, h * 0.1, w * 0.5]}>
        {[-1, 1].map((s) =>
          [-1, 1].map((t) => (
            <group key={`${s}-${t}`}>
              {[-1, 1].map((pair) => <Bell key={pair} position={[s * w * 0.42, -h * 0.22 - 0.26, t * w * 0.3 + pair * 0.15]} radius={0.11} height={0.26} />)}
            </group>
          )),
        )}
      </Part>
      <Part id="legs" offset={[0, 0, 0]} labelAt={[w * 0.5, -h * 0.1, w * 0.5]}>
        {/* Engine supports, not landing gear: the descent stage flew away and impacted. */}
        {[-1, 1].flatMap(s => [-1, 1].map(t => <group key={`${s}-${t}`}>
          <Strut from={[s * w * 0.25, 0, t * w * 0.22]} to={[s * w * 0.48, -h * 0.17, t * w * 0.36]} radius={0.035} color={M.silver} />
          <Strut from={[s * w * 0.32, h * 0.14, t * w * 0.32]} to={[s * w * 0.48, -h * 0.17, t * w * 0.36]} radius={0.025} color={M.midGrey} />
        </group>))}
      </Part>
      <Part id="bridle" offset={[0, -1.1, 0]} labelAt={[0, -h * 0.5, w * 0.4]}>
        <Strut from={[0, -h * 0.2, 0]} to={[0, -h * 1.4, 0]} radius={0.02} color="#d8d2c4" />
        <mesh position={[0, -h * 1.5, 0]}>
          <boxGeometry args={[0.5, 0.16, 0.34]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.5} roughness={0.5} />
        </mesh>
      </Part>
    </group>
  );
}

function Cradle({ a, powered }: { a: Asset3D; powered: boolean }) {
  const w = a.span ?? 1.8;
  const h = a.height ?? 0.9;
  const r = w * 0.34;
  const linkRadius = w * 0.015;
  const linkCount = Math.max(4, Math.min(16, Math.ceil(h * 0.5 / (linkRadius * 1.5))));
  const chain = useDetailGeometry(() => combineGeometry(Array.from({ length: linkCount }, (_, i) =>
    new THREE.TorusGeometry(linkRadius, linkRadius * 0.2, 5, 12).rotateY(i % 2 ? Math.PI / 2 : 0)
      .translate(0, h * (0.14 + i / (linkCount - 1) * 0.42), 0),
  )), [h, linkCount, linkRadius]);
  return (
    <group>
      <Part id="structure" offset={[0, 0.45, 0]} labelAt={[0, h * 0.75, 0]}>
        <MountingRing position={[0, h * 0.6 + w * 0.03, 0]} radius={r} />
        <mesh position={[0, h * 0.6, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <torusGeometry args={[r, w * 0.045, 8, 28]} />
          <meshStandardMaterial color={a.tone ?? M.grey} metalness={0.7} roughness={0.45} />
        </mesh>
        <Strut from={[-r, h * 0.6, 0]} to={[r, h * 0.6, 0]} radius={w * 0.02} color={M.silver} />
        {powered && [0, 1, 2, 3].map(i => {
          const angle = i * Math.PI / 2 + Math.PI / 4;
          return <mesh key={i} position={[Math.cos(angle) * r, h * 0.72, Math.sin(angle) * r]} scale={[1, 0.85, 1]} castShadow>
            <sphereGeometry args={[w * 0.09, 14, 10]} />
            <meshStandardMaterial color={M.silver} metalness={0.65} roughness={0.45} />
          </mesh>;
        })}
      </Part>
      <Part id="thrusters" offset={[0, 0.6, 0]} labelAt={[r, h * 0.4, 0]}>
        {powered ? [0, 1, 2, 3].map(i => {
          const angle = i * Math.PI / 2;
          return <Bell key={i} position={[Math.cos(angle) * r, h * 0.3, Math.sin(angle) * r]} radius={w * 0.045} height={h * 0.24} />;
        }) : [-1, 1].map(s => <mesh key={s} position={[s * r, h * 0.64, 0]} castShadow>
          <cylinderGeometry args={[w * 0.025, w * 0.025, h * 0.08, 10]} />
          <meshStandardMaterial color={M.gold} metalness={0.7} roughness={0.4} />
        </mesh>)}
      </Part>
      <Part id="legs" offset={[0, 0, 0]} labelAt={[w * 0.3, h * 0.2, w * 0.3]}>
        {[-1, 1].flatMap(s => [-1, 1].map(t => <group key={`${s}-${t}`}>
          <Strut from={[s * r * 0.7, h * 0.6, t * r * 0.7]} to={[s * w * 0.34, w * 0.025, t * w * 0.34]} radius={w * 0.02} color={M.midGrey} />
          <mesh position={[s * w * 0.34, w * 0.015, t * w * 0.34]} castShadow receiveShadow>
            <boxGeometry args={[w * 0.1, w * 0.03, w * 0.1]} />
            <meshStandardMaterial color={M.silver} metalness={0.65} roughness={0.5} />
          </mesh>
        </group>))}
      </Part>
      <Part id="bridle" offset={[0, -0.7, 0]} labelAt={[0, h * 0.3, 0]}>
        <mesh geometry={chain} castShadow><meshStandardMaterial color={M.silver} metalness={0.75} roughness={0.45} /></mesh>
      </Part>
    </group>
  );
}

function Helicopter({ a }: { a: Asset3D }) {
  if (a.variant === "rotor-fragment") return <RotorFragment a={a} />;
  return <IntactHelicopter a={a} />;
}

/** Detached blade only; the jagged edge and internal layers are illustrative. */
function RotorFragment({ a }: { a: Asset3D }) {
  const length = a.span ?? 0.5;
  const chord = length * 0.15;
  const thickness = Math.max(length * 0.012, 0.004);
  const blade = useDetailGeometry(() => {
    const outline = new THREE.Shape();
    outline.moveTo(-length * 0.5, -chord * 0.3);
    outline.lineTo(-length * 0.5, chord * 0.32);
    outline.lineTo(length * 0.5, chord * 0.44);
    outline.lineTo(length * 0.48, chord * 0.08);
    outline.lineTo(length * 0.5, -chord * 0.1);
    outline.lineTo(length * 0.46, -chord * 0.25);
    outline.lineTo(length * 0.5, -chord * 0.35);
    outline.lineTo(-length * 0.5, -chord * 0.3);
    return new THREE.ExtrudeGeometry(outline, { depth: thickness, bevelEnabled: false, steps: 1 }).rotateX(-Math.PI / 2);
  }, [length, chord, thickness]);
  return <group position={[0, thickness * 0.5, 0]} rotation={[0, 0.3, 0]}>
    <Part id="fragment" offset={[0, 0.12, 0]} labelAt={[0, thickness, chord * 0.5]}>
      <mesh geometry={blade} castShadow receiveShadow><meshStandardMaterial color={M.dark} roughness={0.75} metalness={0.08} /></mesh>
    </Part>
    <Part id="layers" offset={[0, 0.15, 0.1]} labelAt={[length * 0.4, thickness, 0]}>
      <mesh position={[length * 0.485, thickness * 0.5, 0]}>
        <boxGeometry args={[length * 0.025, thickness * 0.6, chord * 0.45]} />
        <meshStandardMaterial color="#a1906d" roughness={0.85} />
      </mesh>
    </Part>
  </group>;
}

function IntactHelicopter({ a }: { a: Asset3D }) {
  const lowerRotor = useRef<THREE.Group>(null);
  const upperRotor = useRef<THREE.Group>(null);
  const { reducedMotion } = useContext(ModelContext);
  useFrame((_, dt) => {
    if (reducedMotion) return;
    const turn = Math.min(dt, 0.1) * 0.25;
    if (lowerRotor.current) lowerRotor.current.rotation.y += turn;
    if (upperRotor.current) upperRotor.current.rotation.y -= turn;
  });
  const span = a.span ?? 1.2;
  const w = span * 0.16;
  const h = a.height ?? span * 0.42;
  return (
    <group scale={[1, h / 0.95, 1]}>
      <Part id="body" offset={[0, 0.5, 0]} labelAt={[0, 0.42, 0]}>
        <mesh position={[0, 0.34, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, 0.22, w * 1.5]} />
          <meshStandardMaterial color={a.tone ?? M.grey} metalness={0.6} roughness={0.4} />
        </mesh>
        <SurfacePanel size={[w * 0.7, 0.14]} position={[0, 0.34, w * 0.751]} louvers={3} />
        <mesh position={[0, 0.44, -w * 0.3]} castShadow>
          <boxGeometry args={[w * 0.7, 0.1, w * 0.5]} />
          <meshStandardMaterial color={M.dark} metalness={0.5} roughness={0.5} />
        </mesh>
      </Part>
      <Part id="rotor" offset={[0, 0.85, 0]} labelAt={[0, 0.86, 0]}>
        <group position={[0, 0.62, 0]}>
          {[0, 1].map((k) => (
            <group key={k} ref={k === 0 ? lowerRotor : upperRotor} name={k === 0 ? "lower-rotor" : "upper-rotor"} position={[0, k * 0.09, 0]} rotation={[0, k * Math.PI * 0.5, 0]}>
              <CollarBands position={[0, 0, 0]} radius={span * 0.026} height={span * 0.008} count={2} />
              <mesh castShadow>
                <boxGeometry args={[span, span * 0.008, span * 0.055]} />
                <meshStandardMaterial color={M.dark} metalness={0.4} roughness={0.6} />
              </mesh>
            </group>
          ))}
        </group>
      </Part>
      <Part id="legs" offset={[0, 0, 0]} labelAt={[w * 0.8, 0.16, w * 0.7]}>
        {[-1, 1].map((s) =>
          [-1, 1].map((t) => (
            <Strut
              key={`${s}-${t}`}
              from={[s * span * 0.06, 0.26, t * span * 0.08]}
              to={[s * span * 0.24, 0.015, t * span * 0.24]}
              radius={span * 0.012}
              color={M.dark}
            />
          )),
        )}
      </Part>
      <Part id="panel" offset={[0, 0.6, 0]} labelAt={[0, 0.96, w * 0.6]}>
        <Strut from={[0, 0.44, 0]} to={[0, 0.92, 0]} radius={span * 0.015} color={M.silver} />
        <group name="helicopter-solar"><Panel w={span * 0.35} h={span * 0.3} y={0.92} count={6} /></group>
      </Part>
    </group>
  );
}

function Penetrator({ a }: { a: Asset3D }) {
  const w=a.span??0.136,h=a.height??0.207;
  return <group>
    <Part id="aftbody" offset={[0,h*0.6,0]} labelAt={[0,h,w*0.4]}>
      <mesh position={[0,h*0.72,0]} castShadow><cylinderGeometry args={[w*0.5,w*0.5,h*0.35,20]} /><meshStandardMaterial color={a.tone??M.silver} metalness={0.6} roughness={0.5} /></mesh>
      <mesh position={[0,h*0.93,0]}><cylinderGeometry args={[w*0.34,w*0.5,h*0.09,20]} /><meshStandardMaterial color={M.warmWhite} metalness={0.45} roughness={0.5} /></mesh>
    </Part>
    <Part id="forebody" offset={[0,-h*0.5,0]} labelAt={[0,h*0.22,w*0.2]}>
      <mesh position={[0,h*0.31,0]}><cylinderGeometry args={[w*0.17,w*0.17,h*0.42,16]} /><meshStandardMaterial color={M.midGrey} metalness={0.65} roughness={0.5} /></mesh>
      <mesh position={[0,h*0.065,0]} rotation={[Math.PI,0,0]}><coneGeometry args={[w*0.17,h*0.13,16]} /><meshStandardMaterial color={M.silver} metalness={0.65} roughness={0.4} /></mesh>
    </Part>
    <Part id="antenna" offset={[w*0.5,h*0.2,0]} labelAt={[w*0.3,h*1.15,0]}><Strut from={[w*0.29,h*0.88,0]} to={[w*0.29,h*1.34,0]} radius={w*0.012} color={M.silver} /></Part>
    <Part id="cable" offset={[w*0.5,0,w*0.2]} labelAt={[w*0.2,h*0.5,0]}><Strut from={[w*0.17,h*0.58,0]} to={[w*0.17,h*0.4,0]} radius={w*0.012} color={M.copper} /></Part>
  </group>;
}

function Ranger({ a }: { a: Asset3D }) {
  const w=a.span??1.5,h=a.height??1.1;
  return <group>
    <Part id="bus" offset={[0,h*0.4,0]} labelAt={[0,h*0.5,0]}><mesh position={[0,h*0.35,0]}><cylinderGeometry args={[w*0.3,w*0.3,h*0.32,6]} /><meshStandardMaterial color={M.gold} metalness={0.5} roughness={0.5} /></mesh></Part>
    <Part id="cameras" offset={[0,h*0.7,0]} labelAt={[0,h,w*0.2]}><mesh position={[0,h*0.85,0]}><cylinderGeometry args={[w*0.11,w*0.23,h*0.7,8]} /><meshStandardMaterial color={M.silver} metalness={0.6} roughness={0.5} /></mesh><CameraOptics positions={[[-w*0.08,h*0.62,w*0.2],[w*0.08,h*0.62,w*0.2]]} radius={w*0.025} depth={w*0.03} /></Part>
    <Part id="solar" offset={[w*0.4,h*0.2,0]} labelAt={[w*0.8,h*0.5,0]}>{[-1,1].map(s=><SolarPanel key={s} size={[w*0.7,w*0.45]} position={[s*w*0.68,h*0.42,0]} cells={5} />)}</Part>
    <Part id="antenna" offset={[0,h*0.5,-w*0.3]} labelAt={[0,h*0.45,-w*0.6]}><Dish position={[0,h*0.36,-w*0.36]} radius={w*0.24} rotation={[0.75,0,0]} /></Part>
  </group>;
}

function SphericalProbe({ a }: { a: Asset3D }) {
  const r=(a.span??0.9)/2;
  return <group>
    <Part id="bus" offset={[0,r,0]} labelAt={[0,r*1.6,0]}><mesh position={[0,r,0]}><sphereGeometry args={[r,24,16]} /><meshStandardMaterial color={M.silver} metalness={0.7} roughness={0.4} /></mesh><MountingRing position={[0,r,0]} radius={r*1.015} /></Part>
    <Part id="antenna" offset={[r,r,0]} labelAt={[r,r*2.5,0]}>{[0,1,2,3].map(i=>{const angle=i*Math.PI/2;return <Strut key={i} from={[Math.cos(angle)*r*0.7,r*1.5,Math.sin(angle)*r*0.7]} to={[Math.cos(angle)*r*1.8,r*3,Math.sin(angle)*r*1.8]} radius={r*0.022} color={M.silver} />})}</Part>
  </group>;
}

function UpperStage({ a }: { a: Asset3D }) {
  const w=a.span??3,h=a.height??12;
  return <group>
    <Part id="tank" offset={[0,h*0.3,0]} labelAt={[0,h*0.6,w*0.5]}><mesh position={[0,h*0.58,0]}><cylinderGeometry args={[w*0.5,w*0.5,h*0.8,24]} /><meshStandardMaterial color={M.warmWhite} metalness={0.5} roughness={0.5} /></mesh><CollarBands position={[0,h*0.58,0]} radius={w*0.5} height={h*0.8} count={4} /></Part>
    <Part id="engines" offset={[0,-h*0.2,0]} labelAt={[w*0.2,h*0.1,0]}>{[-1,1].map(s=><Bell key={s} position={[s*w*0.2,h*0.02,0]} radius={w*0.16} height={h*0.16} />)}</Part>
  </group>;
}

function Impactor({ a }: { a: Asset3D }) {
  if (a.variant === "penetrator") return <Penetrator a={a} />;
  if (a.variant === "ranger") return <Ranger a={a} />;
  if (a.variant === "spherical-probe") return <SphericalProbe a={a} />;
  if (a.variant === "upper-stage") return <UpperStage a={a} />;
  const r = (a.span ?? 1.2) / 2;
  const h = a.height ?? 1.4;
  return (
    <group>
      <Part id="bus" offset={[0, 0.55, 0]} labelAt={[0, h * 0.7, 0]}>
        <mesh position={[0, h * 0.62, 0]} castShadow receiveShadow>
          <boxGeometry args={[r*2,h,r*1.6]} />
          <meshStandardMaterial color={a.tone ?? M.warmWhite} metalness={0.5} roughness={0.45} />
        </mesh>
      </Part>
    </group>
  );
}

function Ballast({ a }: { a: Asset3D }) {
  if (a.variant === "airbags") return <Airbags a={a} />;
  if (a.variant === "cover") return <Cover a={a} />;
  const w = a.span ?? 0.5;
  return (
    <group scale={[1, a.height ? a.height / (w * 0.6 + 0.06) : 1, 1]}>
      <Part id="block" offset={[0, 0.5, 0]} labelAt={[0, 0.4, 0]}>
        {[-1, 1].map((s) => (
          <group key={s}>
            <mesh position={[s * w * 0.6, 0.06 + w * 0.299, 0]} castShadow receiveShadow>
              <boxGeometry args={[w * 0.9, w * 0.598, w * 0.7]} />
              <meshStandardMaterial color="#4a4f57" metalness={0.85} roughness={0.35} />
            </mesh>
            <SurfacePanel size={[w * 0.68, w * 0.5]} position={[s * w * 0.6, 0.06 + w * 0.598, 0]} rotation={[-Math.PI / 2, 0, 0]} color="#555c65" depth={w * 0.001} />
          </group>
        ))}
      </Part>
      <Part id="bracket" offset={[0, 0.3, 0]} labelAt={[0, 0.08, w * 0.5]}>
        <mesh position={[0, 0.03, 0]}>
          <boxGeometry args={[w * 2.3, 0.06, w * 0.5]} />
          <meshStandardMaterial color={M.silver} metalness={0.8} roughness={0.35} />
        </mesh>
      </Part>
    </group>
  );
}

function Airbags({ a }: { a: Asset3D }) {
  const w = a.span ?? 1.2;
  const bags = useDetailGeometry(() => combineGeometry([-1, 1].flatMap(s => [-1, 1].flatMap(t =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = i * Math.PI / 3;
      return new THREE.SphereGeometry(w * 0.12, 14, 10).scale(1, 0.32, 1)
        .translate(s * w * 0.23 + Math.cos(angle) * w * 0.08, w * 0.075, t * w * 0.23 + Math.sin(angle) * w * 0.08);
    }),
  ))), [w]);
  const stitching = useDetailGeometry(() => combineGeometry([-1, 1].flatMap(s => [-1, 1].flatMap(t =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = i * Math.PI / 3;
      const centerX = s * w * 0.23 + Math.cos(angle) * w * 0.08;
      const centerZ = t * w * 0.23 + Math.sin(angle) * w * 0.08;
      const points = Array.from({ length: 13 }, (_, step) => {
        const x = Math.cos(step / 12 * Math.PI) * w * 0.118;
        const y = w * 0.075 + w * 0.0384 * Math.sqrt(1 - (x / (w * 0.12)) ** 2) - w * 0.0012;
        return new THREE.Vector3(centerX + x, y, centerZ);
      });
      return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 12, w * 0.0012, 3);
    }),
  ))), [w]);
  return (
    <group>
      <Part id="block" offset={[0, 0.5, 0]} labelAt={[0, w * 0.17, 0]}>
        <mesh geometry={bags} castShadow receiveShadow><meshStandardMaterial color="#b7a58b" metalness={0.02} roughness={0.95} /></mesh>
        <mesh geometry={stitching}><meshStandardMaterial color="#807765" metalness={0.02} roughness={0.95} /></mesh>
      </Part>
      <Part id="bracket" offset={[0, 0.3, 0]} labelAt={[0, w * 0.05, w * 0.35]}>
        {[-1, 1].flatMap(s => [-1, 1].map(t => <group key={`${s}-${t}`}>
          <mesh position={[s * w * 0.23, w * 0.05, t * w * 0.23]} castShadow>
            <cylinderGeometry args={[w * 0.05, w * 0.05, w * 0.075, 12]} />
            <meshStandardMaterial color={M.midGrey} metalness={0.65} roughness={0.5} />
          </mesh>
          <Strut from={[s * w * 0.23, w * 0.04, t * w * 0.23]} to={[0, w * 0.035, 0]} radius={w * 0.015} color={M.copper} />
        </group>))}
      </Part>
    </group>
  );
}

function Cover({ a }: { a: Asset3D }) {
  const w = a.span ?? 0.4;
  return (
    <group>
      <Part id="block" offset={[0, 0.5, 0]} labelAt={[0, w * 0.18, 0]}>
        <mesh position={[0, w * 0.0392, 0]} castShadow receiveShadow>
          <boxGeometry args={[w, w * 0.0784, w * 0.75]} />
          <meshStandardMaterial color={a.tone ?? M.grey} metalness={0.55} roughness={0.5} />
        </mesh>
        <SurfacePanel size={[w * 0.8, w * 0.55]} position={[0, w * 0.0784, 0]} rotation={[-Math.PI / 2, 0, 0]} color="#69727e" depth={w * 0.0008} />
      </Part>
      <Part id="bracket" offset={[0, 0.3, 0]} labelAt={[-w * 0.4, w * 0.1, 0]}>
        {[-1, 1].map(s => <mesh key={s} position={[s * w * 0.43, w * 0.065, 0]} castShadow>
          <boxGeometry args={[w * 0.08, w * 0.13, w * 0.22]} />
          <meshStandardMaterial color={M.silver} metalness={0.75} roughness={0.4} />
        </mesh>)}
      </Part>
    </group>
  );
}

/** Height of a rotated box's lowest corner, used to rest debris on the surface. */
function restingHeight(size: [number, number, number], rotation: [number, number, number]) {
  const matrix = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rotation)).elements;
  return (Math.abs(matrix[1]) * size[0] + Math.abs(matrix[5]) * size[1] + Math.abs(matrix[9]) * size[2]) / 2;
}

function Wreck({ a }: { a: Asset3D }) {
  const s = a.span ?? 1.8;
  const parts: [number, number, number, number, number][] = [
    [-0.55, 0.03, 0.1, 0.5, 0.06],
    [0.2, 0.05, -0.45, 0.62, 0.06],
    [0.55, 0.02, 0.4, 0.4, 0.05],
    [-0.15, 0.04, 0.5, 0.55, 0.05],
  ];
  return (
    <group scale={[1, a.height ? a.height / (s * 0.34) : 1, 1]}>
      <Part id="debris" offset={[0, 0.4, 0]} labelAt={[0, 0.2, 0]}>
        {parts.map((p, i) => (
          <mesh key={i} position={[p[0] * s, restingHeight([p[3] * s, p[4] * s, p[3] * s * 0.6], [0, i * 0.9, i % 2 ? 0.12 : -0.16]), p[2] * s]} rotation={[0, i * 0.9, i % 2 ? 0.12 : -0.16]} castShadow receiveShadow>
            <boxGeometry args={[p[3] * s, p[4] * s, p[3] * s * 0.6]} />
            <meshStandardMaterial color={i % 3 === 0 ? M.grey : i % 3 === 1 ? M.white : M.black} metalness={0.7} roughness={0.5} />
          </mesh>
        ))}
      </Part>
      <Part id="structure" offset={[0, 0.55, 0]} labelAt={[-s * 0.4, s * 0.3, 0]}>
        <mesh position={[-s * 0.22, restingHeight([s * 0.7, s * 0.24, s * 0.3], [0.14, 0.5, 0.2]), -s * 0.18]} rotation={[0.14, 0.5, 0.2]} castShadow>
          <boxGeometry args={[s * 0.7, s * 0.24, s * 0.3]} />
          <meshStandardMaterial color={M.midGrey} metalness={0.75} roughness={0.45} />
        </mesh>
        <group position={[-s * 0.22, restingHeight([s * 0.7, s * 0.24, s * 0.3], [0.14, 0.5, 0.2]), -s * 0.18]} rotation={[0.14, 0.5, 0.2]}>
          <SurfacePanel size={[s * 0.5, s * 0.15]} position={[0, 0, s * 0.151]} louvers={4} />
        </group>
        <Strut from={[-s * 0.5, 0.02, -s * 0.3]} to={[-s * 0.1, s * 0.3, s * 0.1]} radius={0.02} color={M.silver} />
        <Strut from={[-s * 0.2, 0.02, -s * 0.5]} to={[s * 0.1, s * 0.24, -s * 0.1]} radius={0.02} color={M.silver} />
      </Part>
      <Part id="panel" offset={[s * 0.6, 0.35, 0]} labelAt={[s * 0.5, s * 0.24, s * 0.4]}>
        <mesh position={[s * 0.38, restingHeight([s * 0.55, 0.02, s * 0.45], [-0.22, 0.4, 0.1]), s * 0.3]} rotation={[-0.22, 0.4, 0.1]} castShadow>
          <boxGeometry args={[s * 0.55, 0.02, s * 0.45]} />
          <meshStandardMaterial color={M.solar} metalness={0.6} roughness={0.35} emissive={M.solarCell} emissiveIntensity={0.14} />
        </mesh>
      </Part>
      <Part id="engine" offset={[0, -0.3, -s * 0.5]} labelAt={[s * 0.16, s * 0.1, -s * 0.45]}>
        <group position={[s * 0.14, restingHeight([0.32, s * 0.26, 0.32], [0, 0.6, 1.35]), -s * 0.34]} rotation={[0, 0.6, 1.35]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.09, 0.16, s * 0.26, 14, 1, true]} />
            <meshStandardMaterial color={M.dark} metalness={0.8} roughness={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </Part>
    </group>
  );
}

const BUILDERS: Record<ArchiveKind, (p: { a: Asset3D }) => ReactElement> = {
  "descent-stage": DescentStage,
  "ascent-stage": AscentStage,
  "rover-6": Rover6,
  "rover-4": Rover4,
  "rover-8": Rover8,
  lander: Lander,
  station: Station,
  instrument: Instrument,
  reflector: Reflector,
  "heat-shield": HeatShield,
  backshell: Backshell,
  parachute: Parachute,
  skycrane: SkyCrane,
  helicopter: Helicopter,
  impactor: Impactor,
  ballast: Ballast,
  wreck: Wreck,
};

export function isLegacyKind(kind: string): kind is ModelKey {
  return (LEGACY as string[]).includes(kind);
}

/**
 * One entry point for every record's 3D representation. Legacy records use the original
 * hand-built models; archive records dispatch to a parametric family whose dimensions and
 * accent colour come from the record itself.
 */
export default function ArchiveModel({
  asset,
  components,
  amount = 0,
  selected = null,
  onSelect = () => {},
  showLabels = true,
}: {
  asset: Asset3D;
  components?: ModelComponent[];
  amount?: number;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  showLabels?: boolean;
}) {
  const reducedMotion = useModelReducedMotion();
  if (isLegacyKind(asset.kind)) {
    return (
      <EquipmentModel
        model={asset.kind}
        amount={amount}
        selected={selected}
        onSelect={onSelect}
        showLabels={showLabels}
        reducedMotion={reducedMotion}
        components={components}
        variant={asset.variant}
      />
    );
  }
  const Builder = BUILDERS[asset.kind as ArchiveKind];
  if (!Builder) return null;
  return (
    <ModelContext.Provider
      value={{ amount, selected, onSelect, showLabels, model: "mer", parts: components, reducedMotion }}
    >
      <group>
        <Builder a={asset} />
      </group>
    </ModelContext.Provider>
  );
}
