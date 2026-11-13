"use client";

import { useEffect, useMemo, useState, type DependencyList } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

type Vec3 = [number, number, number];

/** One live preference per model; nested model providers inherit it without another listener. */
export function useModelReducedMotion(inherited?: boolean) {
  const [reduced, setReduced] = useState(() => inherited ?? (
    typeof window !== "undefined" && (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false)
  ));
  useEffect(() => {
    if (inherited !== undefined) return;
    const preference = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!preference) return;
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, [inherited]);
  return inherited ?? reduced;
}

/** Repeated hardware shares a draw call; temporary source geometry never reaches the GPU. */
export function combineGeometry(pieces: THREE.BufferGeometry[]) {
  const geometry = mergeGeometries(pieces, false)!;
  pieces.forEach((piece) => piece.dispose());
  return geometry;
}

export function useDetailGeometry(factory: () => THREE.BufferGeometry, dependencies: DependencyList) {
  const geometry = useMemo(factory, dependencies);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

/** Shallow XY service plate: seams, corner screws and louvers share one hardware mesh. */
export function SurfacePanel({
  size,
  position,
  rotation = [0, 0, 0],
  louvers = 0,
  color = "#343c47",
  depth: suppliedDepth,
}: {
  size: [number, number];
  position: Vec3;
  rotation?: Vec3;
  louvers?: number;
  color?: string;
  depth?: number;
}) {
  const [w, h] = size;
  const edge = Math.min(w, h) * 0.035;
  const depth = suppliedDepth ?? Math.min(w, h) * 0.012;
  const hardware = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [];
    for (const side of [-1, 1]) {
      pieces.push(new THREE.BoxGeometry(w, edge, depth).translate(0, side * (h - edge) / 2, depth));
      pieces.push(new THREE.BoxGeometry(edge, h - edge * 2, depth).translate(side * (w - edge) / 2, 0, depth));
      for (const end of [-1, 1]) {
        pieces.push(new THREE.CylinderGeometry(edge * 0.48, edge * 0.48, depth, 6)
          .rotateX(Math.PI / 2).translate(side * (w / 2 - edge * 1.4), end * (h / 2 - edge * 1.4), depth * 1.5));
      }
    }
    for (let i = 0; i < louvers; i++) {
      pieces.push(new THREE.BoxGeometry(w * 0.72, h * 0.035, depth)
        .translate(0, (i - (louvers - 1) / 2) * h * 0.65 / Math.max(1, louvers), depth));
    }
    return combineGeometry(pieces);
  }, [w, h, edge, depth, louvers]);
  return <group position={position} rotation={rotation}>
    <mesh><boxGeometry args={[w, h, depth]} /><meshStandardMaterial color={color} metalness={0.58} roughness={0.48} /></mesh>
    <mesh geometry={hardware}><meshStandardMaterial color="#a2adba" metalness={0.78} roughness={0.4} /></mesh>
  </group>;
}

/** Collar highlights stay close to an existing barrel rather than changing its profile. */
export function CollarBands({
  position,
  radius,
  height,
  rotation = [0, 0, 0],
  count = 3,
  color = "#9aa6b5",
}: {
  position: Vec3;
  radius: number;
  height: number;
  rotation?: Vec3;
  count?: number;
  color?: string;
}) {
  const geometry = useDetailGeometry(() => combineGeometry(Array.from({ length: count }, (_, i) =>
    new THREE.TorusGeometry(radius * 0.982, radius * 0.018, 4, 20)
      .rotateX(Math.PI / 2).translate(0, (i / Math.max(1, count - 1) - 0.5) * height * 0.8, 0),
  )), [radius, height, count]);
  return <mesh geometry={geometry} position={position} rotation={rotation}>
    <meshStandardMaterial color={color} metalness={0.8} roughness={0.38} />
  </mesh>;
}

/** Horizontal equipment flange, with repeated screw heads merged into its ring. */
export function MountingRing({ position, radius, color = "#a3aeba" }: { position: Vec3; radius: number; color?: string }) {
  const geometry = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [new THREE.TorusGeometry(radius, radius * 0.016, 4, 28).rotateX(Math.PI / 2)];
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4;
      pieces.push(new THREE.CylinderGeometry(radius * 0.025, radius * 0.025, radius * 0.025, 6)
        .translate(Math.cos(angle) * radius, radius * 0.012, Math.sin(angle) * radius));
    }
    return combineGeometry(pieces);
  }, [radius]);
  return <mesh geometry={geometry} position={position}>
    <meshStandardMaterial color={color} metalness={0.78} roughness={0.42} />
  </mesh>;
}

/** Tapered shell seams follow the existing surface; they are schematic panel joints. */
export function ShellSeams({ position, top, bottom, height, count = 12, color = "#a4a9ab" }: {
  position: Vec3;
  top: number;
  bottom: number;
  height: number;
  count?: number;
  color?: string;
}) {
  const geometry = useDetailGeometry(() => {
    const seamRadius = bottom * 0.003;
    const pieces = Array.from({ length: count }, (_, i) => {
      const angle = i * Math.PI * 2 / count;
      const start = new THREE.Vector3(Math.cos(angle) * bottom * 0.996, -height / 2 + seamRadius, Math.sin(angle) * bottom * 0.996);
      const end = new THREE.Vector3(Math.cos(angle) * top * 0.996, height / 2 - seamRadius, Math.sin(angle) * top * 0.996);
      const delta = end.clone().sub(start);
      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize());
      const middle = start.add(end).multiplyScalar(0.5);
      return new THREE.CylinderGeometry(seamRadius, seamRadius, delta.length(), 4)
        .applyQuaternion(quaternion).translate(middle.x, middle.y, middle.z);
    });
    return combineGeometry(pieces);
  }, [top, bottom, height, count]);
  return <mesh geometry={geometry} position={position}><meshStandardMaterial color={color} metalness={0.4} roughness={0.65} /></mesh>;
}

export function FoilPanel({
  size,
  position,
  rotation = [0, 0, 0],
  color = "#d1a348",
}: {
  size: Vec3;
  position: Vec3;
  rotation?: Vec3;
  color?: string;
}) {
  const [w, h, d] = size;
  const geometry = useDetailGeometry(() => {
    const foil = new THREE.BoxGeometry(w, h, d, 10, 8, 2);
    const vertices = foil.getAttribute("position");
    const normals = foil.getAttribute("normal");
    const amplitude = Math.min(Math.max(w, h, d) * 0.014, Math.min(w, h, d) * 0.42);
    for (let i = 0; i < vertices.count; i++) {
      const x = vertices.getX(i);
      const y = vertices.getY(i);
      const z = vertices.getZ(i);
      const wrinkle = Math.sin(x * 83 + y * 61 + z * 47) * Math.cos(x * 37 - y * 53 + z * 71);
      vertices.setXYZ(i,
        x + normals.getX(i) * wrinkle * amplitude,
        y + normals.getY(i) * wrinkle * amplitude,
        z + normals.getZ(i) * wrinkle * amplitude,
      );
    }
    foil.computeVertexNormals();
    return foil;
  }, [w, h, d]);
  return (
    <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={0.78} roughness={0.43} flatShading />
    </mesh>
  );
}

/** Optical faces point forward (+Z), matching the rover camera housings. */
export function CameraOptics({
  positions,
  radius = 0.045,
  depth = 0.06,
}: {
  positions: Vec3[];
  radius?: number;
  depth?: number;
}) {
  const coordinates = positions.flat().join(",");
  const housings = useDetailGeometry(() => combineGeometry(positions.map(([x, y, z]) =>
    new THREE.CylinderGeometry(radius, radius * 1.16, depth, 16)
      .rotateX(Math.PI / 2).translate(x, y, z),
  )), [coordinates, radius, depth]);
  const rims = useDetailGeometry(() => combineGeometry(positions.map(([x, y, z]) =>
    new THREE.TorusGeometry(radius * 0.83, radius * 0.1, 5, 16)
      .translate(x, y, z + depth * 0.52),
  )), [coordinates, radius, depth]);
  const glass = useDetailGeometry(() => combineGeometry(positions.map(([x, y, z]) =>
    new THREE.CircleGeometry(radius * 0.73, 16).translate(x, y, z + depth * 0.53),
  )), [coordinates, radius, depth]);
  return (
    <group>
      <mesh geometry={housings} castShadow><meshStandardMaterial color="#242930" metalness={0.7} roughness={0.37} /></mesh>
      <mesh geometry={rims}><meshStandardMaterial color="#a8b4c3" metalness={0.8} roughness={0.3} /></mesh>
      <mesh geometry={glass}><meshStandardMaterial color="#102940" metalness={0.5} roughness={0.14} emissive="#1c4568" emissiveIntensity={0.12} /></mesh>
    </group>
  );
}

/** Accordion-style lander array: concentric cells and radial ribs, three draw calls. */
export function RadialSolarPanel({ position, radius = 1 }: { position: Vec3; radius?: number }) {
  const sectors = 16;
  const cells = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [];
    for (let sector = 0; sector < sectors; sector++) {
      for (let row = 0; row < 5; row++) {
        pieces.push(new THREE.RingGeometry(
          radius * (0.13 + row * 0.16),
          radius * (0.13 + (row + 1) * 0.16) - radius * 0.013,
          3, 1, sector * Math.PI * 2 / sectors + 0.014, Math.PI * 2 / sectors - 0.028,
        ).rotateX(-Math.PI / 2).translate(0, 0.018, 0));
      }
    }
    return combineGeometry(pieces);
  }, [radius]);
  const ribs = useDetailGeometry(() => {
    const pieces: THREE.BufferGeometry[] = [new THREE.TorusGeometry(radius * 0.97, radius * 0.012, 5, 48).rotateX(Math.PI / 2)];
    for (let i = 0; i < sectors; i++) {
      const angle = i * Math.PI * 2 / sectors;
      pieces.push(new THREE.BoxGeometry(radius * 0.86, 0.011, radius * 0.008)
        .translate(radius * 0.55, 0.022, 0).rotateY(angle));
    }
    return combineGeometry(pieces);
  }, [radius]);
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <circleGeometry args={[radius, 48]} />
        <meshStandardMaterial color="#14213d" metalness={0.45} roughness={0.47} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={cells} receiveShadow>
        <meshStandardMaterial color="#25477a" metalness={0.52} roughness={0.3} emissive="#203c63" emissiveIntensity={0.08} />
      </mesh>
      <mesh geometry={ribs}><meshStandardMaterial color="#8098b1" metalness={0.75} roughness={0.4} /></mesh>
    </group>
  );
}
