"use client";

import { Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import Scene3D from "./Scene3D";

function Planet({
  position,
  radius,
  texture,
  speed = 0.04,
  tilt = 0.2,
  glow,
}: {
  position: [number, number, number];
  radius: number;
  texture: string;
  speed?: number;
  tilt?: number;
  glow: string;
}) {
  const tex = useTexture(texture);
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return (
    <group position={position} rotation={[tilt, 0, 0.1]}>
      <mesh ref={ref}>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial map={tex} roughness={0.94} metalness={0} />
      </mesh>
      <mesh scale={1.035}>
        <sphereGeometry args={[radius, 40, 40]} />
        <meshBasicMaterial color={glow} transparent opacity={0.13} side={THREE.BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function Ship() {
  const group = useRef<THREE.Group>(null);
  const engine = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.055) % 1;
    if (!group.current) return;
    group.current.position.set(-22 + t * 50, 5.5 - t * 2.2, -12 - Math.sin(t * Math.PI) * 4);
    group.current.rotation.set(0.15, Math.PI * 0.92 + Math.sin(t * 6) * 0.04, 0.08 + Math.cos(t * 5) * 0.05);
    if (engine.current) {
      const pulse = 0.75 + Math.sin(state.clock.elapsedTime * 22) * 0.2;
      engine.current.scale.setScalar(pulse);
    }
  });

  return (
    <group ref={group} scale={0.8}>
      <mesh>
        <coneGeometry args={[0.22, 1.3, 10]} />
        <meshStandardMaterial color="#c9d3e0" metalness={0.85} roughness={0.28} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, -0.1]}>
        <boxGeometry args={[1.5, 0.06, 0.4]} />
        <meshStandardMaterial color="#7d8794" metalness={0.9} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.2, 0.15]}>
        <sphereGeometry args={[0.13, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#3fe7ff" emissive="#3fe7ff" emissiveIntensity={1.6} metalness={0.4} roughness={0.2} />
      </mesh>
      <mesh ref={engine} position={[0, 0, -0.72]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial color="#8fd8ff" transparent opacity={0.9} />
      </mesh>
      <pointLight position={[0, 0, -0.9]} intensity={3} color="#63c8ff" distance={6} />
    </group>
  );
}

function Nebula() {
  const tex = useTexture("/textures/stars.jpg");
  return (
    <mesh position={[0, 0, -60]} scale={[90, 52, 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial map={tex} transparent opacity={0.4} depthWrite={false} />
    </mesh>
  );
}

function Drift() {
  const { camera } = useThree();
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, Math.sin(t * 0.07) * 1.6 + state.pointer.x * 0.8, 1.4, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, Math.cos(t * 0.05) * 0.9 + state.pointer.y * 0.5, 1.4, dt);
    camera.lookAt(0, 0.4, -10);
  });
  return null;
}

export default function IntroScene({ className }: { className?: string }) {
  return (
    <Scene3D
      className={className}
      alwaysRender
      cameraPosition={[0, 0, 15]}
      fov={48}
      dpr={[1, 1.6]}
      fallback={<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,#0d2a52,#03060e_70%)]" />}
    >
      <color attach="background" args={["#02040a"]} />
      <fog attach="fog" args={["#02040a", 26, 80]} />
      <ambientLight intensity={0.5} color="#9dc0ff" />
      <directionalLight position={[9, 6, 6]} intensity={2.4} color="#ffe2bd" />
      <directionalLight position={[-10, -4, 2]} intensity={0.9} color="#3b7dff" />

      <Suspense fallback={null}>
        <Stars radius={140} depth={70} count={5200} factor={5} saturation={0.2} fade speed={0.6} />
        <Nebula />
        <Planet position={[-6.2, 2.1, -6]} radius={3.1} texture="/textures/moon.jpg" speed={0.035} glow="#bcd8ff" />
        <Planet position={[6.8, -1.6, -8]} radius={2.5} texture="/textures/mars.jpg" speed={0.05} tilt={0.3} glow="#ff9a5c" />
        <group position={[10.5, 6.4, -26]}>
          <mesh>
            <sphereGeometry args={[4.6, 40, 40]} />
            <meshStandardMaterial color="#3d5d8a" roughness={0.9} emissive="#0b1a30" emissiveIntensity={0.7} />
          </mesh>
          <mesh rotation={[1.2, 0.3, 0]}>
            <torusGeometry args={[7.2, 0.09, 8, 90]} />
            <meshStandardMaterial color="#9fc7ff" transparent opacity={0.35} />
          </mesh>
        </group>
        <Ship />
        <Drift />
      </Suspense>
    </Scene3D>
  );
}
