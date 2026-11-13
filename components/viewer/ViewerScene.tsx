"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type PhysicalMesh = { mesh: THREE.Mesh; parts: THREE.Object3D[] };
type GroundSupport = { parts: THREE.Object3D[]; baseY: number };

export type ViewerLayout = {
  bounds: THREE.Box3;
  center: THREE.Vector3;
  size: THREE.Vector3;
  radius: number;
  ready: boolean;
  ground: GroundSupport[];
};

export function createViewerLayout(): ViewerLayout {
  return {
    bounds: new THREE.Box3(),
    center: new THREE.Vector3(),
    size: new THREE.Vector3(),
    radius: 1,
    ready: false,
    ground: [],
  };
}

/** Collect geometry once, excluding callouts and selection indicators. */
function collectMeshes(root: THREE.Object3D): PhysicalMesh[] {
  const meshes: PhysicalMesh[] = [];
  root.traverseVisible((object) => {
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || !mesh.geometry) return;
    const parts: THREE.Object3D[] = [];
    let parent: THREE.Object3D | null = mesh;
    while (parent && parent !== root) {
      if (parent.userData.excludeFromBounds) return;
      if (parent.userData.afterlightPart) parts.push(parent);
      parent = parent.parent;
    }
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    if (mesh.geometry.boundingBox) meshes.push({ mesh, parts });
  });
  return meshes;
}

const VIEWER_LABEL_ASPECTS = new WeakMap<THREE.Sprite, number>();

/** Callouts keep a readable screen size as the model or viewport changes. */
function sizeViewerLabels(root: THREE.Object3D, camera: THREE.PerspectiveCamera, height: number) {
  root.updateWorldMatrix(true, true);
  const worldScale = new THREE.Vector3();
  const scale = 48 * Math.tan(THREE.MathUtils.degToRad(camera.fov) * 0.5) / height;
  root.traverseVisible((object) => {
    const sprite = object as THREE.Sprite;
    if (!sprite.isSprite || !sprite.userData.excludeFromBounds) return;
    const image = sprite.material.map?.image as { width?: number; height?: number } | undefined;
    const aspect = image?.width && image.height ? image.width / image.height
      : VIEWER_LABEL_ASPECTS.get(sprite) ?? sprite.scale.x / Math.max(0.0001, sprite.scale.y);
    VIEWER_LABEL_ASPECTS.set(sprite, aspect);
    worldScale.set(1, 1, 1);
    sprite.parent?.getWorldScale(worldScale);
    sprite.scale.set(scale * aspect / Math.max(0.0001, worldScale.x), scale / Math.max(0.0001, worldScale.y), 1);
    if (sprite.material.sizeAttenuation) {
      sprite.material.sizeAttenuation = false;
      sprite.material.needsUpdate = true;
    }
  });
}

/** Cache one lowest point per moving Part, rather than revisiting its meshes. */
function collectGroundSupports(root: THREE.Object3D, meshes: PhysicalMesh[], box: THREE.Box3): GroundSupport[] {
  root.updateWorldMatrix(true, true);
  const groups = new Map<string, GroundSupport>();
  for (const { mesh, parts } of meshes) {
    if (!mesh.geometry.boundingBox) continue;
    box.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
    let baseY = box.min.y;
    for (const part of parts) {
      if (!part.parent) continue;
      const e = part.parent.matrixWorld.elements;
      baseY -= e[1] * part.position.x + e[5] * part.position.y + e[9] * part.position.z;
    }
    const key = parts.map((part) => part.uuid).join("/");
    const group = groups.get(key);
    if (group) group.baseY = Math.min(group.baseY, baseY);
    else groups.set(key, { parts, baseY });
  }
  return Array.from(groups.values());
}

/**
 * Part only animates its translation. Shift each physical mesh to the intended
 * end position, so fitting does not depend on a timeout or the frame rate.
 */
function measureAtAmount(
  root: THREE.Object3D,
  meshes: PhysicalMesh[],
  amount: number,
  bounds: THREE.Box3,
  scratchBox: THREE.Box3,
  shift: THREE.Vector3,
  selectedPart?: THREE.Object3D,
) {
  root.updateWorldMatrix(true, true);
  bounds.makeEmpty();
  for (const { mesh, parts } of meshes) {
    if (selectedPart && !parts.includes(selectedPart)) continue;
    const localBounds = mesh.geometry.boundingBox;
    if (!localBounds) continue;
    scratchBox.copy(localBounds).applyMatrix4(mesh.matrixWorld);
    shift.set(0, 0, 0);
    for (const part of parts) {
      const offset = part.userData.explodeOffset as [number, number, number] | undefined;
      if (!offset || !part.parent) continue;
      const dx = offset[0] * amount - part.position.x;
      const dy = offset[1] * amount - part.position.y;
      const dz = offset[2] * amount - part.position.z;
      const e = part.parent.matrixWorld.elements;
      shift.x += e[0] * dx + e[4] * dy + e[8] * dz;
      shift.y += e[1] * dx + e[5] * dy + e[9] * dz;
      shift.z += e[2] * dx + e[6] * dy + e[10] * dz;
    }
    scratchBox.translate(shift);
    bounds.union(scratchBox);
  }
}

/** One owner for model fitting, selected-part focus, resize and reset. */
export function ViewerRig({
  modelRef,
  controls,
  layout,
  modelId,
  amount,
  selected,
  fitRequest,
  reducedMotion,
  motionActive,
  ready,
  insets,
  labelsVisible,
}: {
  modelRef: RefObject<THREE.Group | null>;
  controls: RefObject<OrbitControlsImpl | null>;
  layout: ViewerLayout;
  modelId: string;
  amount: number;
  selected: string | null;
  fitRequest: number;
  reducedMotion: boolean;
  motionActive: RefObject<boolean>;
  ready: boolean;
  insets?: { top: number; bottom: number };
  labelsVisible?: boolean;
}) {
  const { camera, size, invalidate } = useThree();
  const meshes = useRef<PhysicalMesh[]>([]);
  const lastModel = useRef<string | null>(null);
  const lastRequest = useRef(-1);
  const lastSelection = useRef<string | null>(selected);
  const focusSelection = useRef(false);
  const saveFit = useRef(false);
  const elapsed = useRef(0);
  const collectPending = useRef(true);
  const fitPending = useRef(true);
  const verifyInitial = useRef(true);
  const startupRetry = useRef(0);
  const labelsPending = useRef(true);
  const scratch = useMemo(() => ({
    box: new THREE.Box3(),
    focus: new THREE.Box3(),
    shift: new THREE.Vector3(),
    center: new THREE.Vector3(),
    corner: new THREE.Vector3(),
    direction: new THREE.Vector3(),
    right: new THREE.Vector3(),
    up: new THREE.Vector3(),
    cameraGoal: new THREE.Vector3(),
    targetGoal: new THREE.Vector3(),
  }), []);

  useLayoutEffect(() => {
    // Canvas and its child renderer have separate commit phases. Schedule work
    // for a real scene frame, after both geometry and controls have attached.
    collectPending.current = true;
    fitPending.current = true;
    verifyInitial.current = true;
    layout.ready = false;
    invalidate();
    return () => {
      meshes.current = [];
      layout.ready = false;
      layout.ground = [];
      collectPending.current = true;
      fitPending.current = true;
      verifyInitial.current = true;
    };
  }, [modelId, layout, ready, invalidate]);

  const applyFit = useCallback((forceHome = false) => {
    const root = modelRef.current;
    const orbit = controls.current;
    if (!root || !orbit || !(camera as THREE.PerspectiveCamera).isPerspectiveCamera || !size.width || !size.height) return false;
    if (collectPending.current || !meshes.current.length) {
      meshes.current = collectMeshes(root);
      if (!meshes.current.length) return false;
      layout.ground = collectGroundSupports(root, meshes.current, scratch.box);
      collectPending.current = false;
    }
    measureAtAmount(root, meshes.current, amount, layout.bounds, scratch.box, scratch.shift);
    if (layout.bounds.isEmpty()) return false;
    layout.bounds.getCenter(layout.center);
    layout.bounds.getSize(layout.size);
    layout.radius = Math.max(0.05, layout.size.length() * 0.5);
    layout.ready = true;

    const freshModel = lastModel.current !== modelId;
    const resetRequested = lastRequest.current !== fitRequest;
    // The tour preselects its first documented component. Keep that highlight,
    // but open on the whole machine; zoom only after the selection changes.
    if (freshModel || resetRequested) focusSelection.current = false;
    else if (selected !== lastSelection.current) focusSelection.current = selected !== null;
    lastSelection.current = selected;
    const part = selected && focusSelection.current ? root.getObjectByName(selected) : undefined;
    if (part) measureAtAmount(root, meshes.current, amount, scratch.focus, scratch.box, scratch.shift, part);
    const bounds = part && !scratch.focus.isEmpty() ? scratch.focus : layout.bounds;
    bounds.getCenter(scratch.center);

    // Consume any pending orbit/pan delta once, rather than letting damping
    // compete with the camera transition on subsequent frames.
    const damping = orbit.enableDamping;
    orbit.enableDamping = false;
    orbit.update();
    orbit.enableDamping = damping;

    if (freshModel || resetRequested || forceHome) scratch.direction.set(0.62, 0.42, 1).normalize();
    else scratch.direction.copy(camera.position).sub(orbit.target).normalize();
    if (scratch.direction.lengthSq() < 0.5) scratch.direction.set(0.62, 0.42, 1).normalize();
    scratch.right.set(0, 1, 0).cross(scratch.direction).normalize();
    scratch.up.copy(scratch.direction).cross(scratch.right).normalize();

    const perspective = camera as THREE.PerspectiveCamera;
    const tanV = Math.tan(THREE.MathUtils.degToRad(perspective.fov) * 0.5);
    const tanH = tanV * (size.width / size.height);
    // Keep geometry within the space between the title and bottom toolbar.
    const insetCap = size.height * (insets ? 0.45 : 0.24);
    const top = 1 - (2 * Math.min(insets?.top ?? 112, insetCap)) / size.height;
    const bottom = -1 + (2 * Math.min(insets?.bottom ?? 100, insetCap)) / size.height;
    const centerY = (top + bottom) * 0.5;
    const halfX = size.width < 640 ? 0.84 : 0.87;
    let distance = 0.1;
    for (let i = 0; i < 8; i++) {
      scratch.corner.set(
        i & 1 ? bounds.max.x : bounds.min.x,
        i & 2 ? bounds.max.y : bounds.min.y,
        i & 4 ? bounds.max.z : bounds.min.z,
      ).sub(scratch.center);
      const x = scratch.corner.dot(scratch.right);
      const y = scratch.corner.dot(scratch.up);
      const z = scratch.corner.dot(scratch.direction);
      distance = Math.max(
        distance,
        z + Math.abs(x) / (tanH * halfX),
        (y + top * tanV * z) / ((top - centerY) * tanV),
        (-y - bottom * tanV * z) / ((centerY - bottom) * tanV),
      );
    }
    distance *= 1.12;
    scratch.targetGoal.copy(scratch.center).addScaledVector(scratch.up, -centerY * distance * tanV);
    scratch.cameraGoal.copy(scratch.targetGoal).addScaledVector(scratch.direction, distance);
    orbit.minDistance = Math.max(0.05, Math.min(distance * 0.2, layout.radius * 0.45));
    orbit.maxDistance = Math.max(distance * 4, layout.radius * 12);
    perspective.near = Math.max(0.005, Math.min(0.1, distance * 0.005));
    perspective.far = Math.max(100, orbit.maxDistance + layout.radius * 4);
    perspective.updateProjectionMatrix();
    sizeViewerLabels(root, perspective, size.height);
    labelsPending.current = false;

    saveFit.current = bounds === layout.bounds;
    elapsed.current = 0;
    motionActive.current = true;
    if (freshModel || reducedMotion || forceHome) {
      camera.position.copy(scratch.cameraGoal);
      orbit.target.copy(scratch.targetGoal);
      orbit.update();
      if (saveFit.current) orbit.saveState();
      motionActive.current = false;
    }
    lastModel.current = modelId;
    lastRequest.current = fitRequest;
    invalidate();
    return true;
  }, [modelId, amount, selected, fitRequest, reducedMotion, size.width, size.height, camera, controls, modelRef, layout, scratch, invalidate, motionActive, insets?.top, insets?.bottom]);

  useLayoutEffect(() => {
    fitPending.current = true;
    invalidate();
  }, [applyFit, ready, invalidate]);

  useLayoutEffect(() => {
    labelsPending.current = true;
    invalidate();
  }, [labelsVisible, invalidate]);

  useFrame((_, dt) => {
    if (fitPending.current) {
      if (!applyFit(verifyInitial.current)) {
        invalidate();
        return;
      }
      fitPending.current = false;
      if (verifyInitial.current) {
        verifyInitial.current = false;
        startupRetry.current = 2;
      }
    } else if (startupRetry.current > 0) {
      startupRetry.current -= 1;
      invalidate();
      if (startupRetry.current === 0) {
        // Verify once after the first rendered frame. This also catches geometry
        // attachments completed by child effects, then leaves the camera alone.
        collectPending.current = true;
        if (!applyFit(true)) fitPending.current = true;
      }
    }
    if (labelsPending.current && modelRef.current && size.height) {
      sizeViewerLabels(modelRef.current, camera as THREE.PerspectiveCamera, size.height);
      labelsPending.current = false;
    }
    const orbit = controls.current;
    if (!motionActive.current || !orbit) return;
    elapsed.current += dt;
    const blend = 1 - Math.exp(-Math.min(dt, 0.1) * 8);
    camera.position.lerp(scratch.cameraGoal, blend);
    orbit.target.lerp(scratch.targetGoal, blend);
    if (elapsed.current > 1.2 || camera.position.distanceToSquared(scratch.cameraGoal) < 0.000001) {
      camera.position.copy(scratch.cameraGoal);
      orbit.target.copy(scratch.targetGoal);
      motionActive.current = false;
      if (saveFit.current) orbit.saveState();
    }
    orbit.update();
    invalidate();
  });

  return null;
}

export function ViewerStage({ layout, reducedMotion }: { layout: ViewerLayout; reducedMotion: boolean }) {
  const floor = useRef<THREE.Group>(null);
  const surface = useRef<THREE.Mesh>(null);
  const contact = useRef<THREE.Mesh>(null);
  const grid = useRef<THREE.GridHelper>(null);
  const [fade, setFade] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.42, "#b8b8b8");
    gradient.addColorStop(0.78, "#242424");
    gradient.addColorStop(1, "#000000");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    // alphaMap holds linear coverage, not colour.
    setFade(texture);
    return () => texture.dispose();
  }, []);

  useLayoutEffect(() => {
    if (!grid.current) return;
    const materials = Array.isArray(grid.current.material) ? grid.current.material : [grid.current.material];
    materials.forEach((material) => {
      material.transparent = true;
      material.opacity = 0.2;
      material.depthWrite = false;
    });
  }, []);

  useFrame((_, dt) => {
    const group = floor.current;
    if (!group || !layout.ready) return;
    let currentMinY = layout.bounds.min.y;
    for (const support of layout.ground) {
      let y = support.baseY;
      for (const part of support.parts) {
        if (!part.parent) continue;
        const e = part.parent.matrixWorld.elements;
        y += e[1] * part.position.x + e[5] * part.position.y + e[9] * part.position.z;
      }
      currentMinY = Math.min(currentMinY, y);
    }
    const targetY = currentMinY - Math.max(0.015, layout.radius * 0.006);
    // Drop before a part moves down; glide upward when the machine reassembles.
    group.position.y = reducedMotion || targetY < group.position.y
      ? targetY
      : THREE.MathUtils.damp(group.position.y, targetY, 8, Math.min(dt, 0.1));
    group.position.x = layout.center.x;
    group.position.z = layout.center.z;
    const radius = Math.max(0.6, Math.hypot(layout.size.x, layout.size.z) * 0.78);
    surface.current?.scale.set(radius, radius, 1);
    grid.current?.scale.set(radius * 1.7, 1, radius * 1.7);
    contact.current?.scale.set(Math.max(0.25, layout.size.x * 0.6), Math.max(0.25, layout.size.z * 0.6), 1);
  });

  return (
    <group ref={floor}>
      <mesh ref={surface} rotation={[-Math.PI / 2, 0, 0]} receiveShadow renderOrder={-2}>
        <circleGeometry args={[1, 64]} />
        <meshStandardMaterial color="#0b1a2e" metalness={0.12} roughness={0.95} transparent opacity={0.7} alphaMap={fade ?? undefined} depthWrite={false} />
      </mesh>
      <mesh ref={contact} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]} renderOrder={-1}>
        <circleGeometry args={[1, 32]} />
        <meshBasicMaterial color="#010308" transparent opacity={0.3} alphaMap={fade ?? undefined} depthWrite={false} />
      </mesh>
      <gridHelper ref={grid} args={[1, 24, "#377399", "#204059"]} position={[0, 0.006, 0]} />
    </group>
  );
}

/** Broad local reflection cards keep metallic parts readable without an HDR download. */
export function ViewerLighting() {
  const { gl, scene } = useThree();

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const base = ctx.createLinearGradient(0, 0, 0, 128);
    base.addColorStop(0, "#6d7a8b");
    base.addColorStop(0.48, "#344354");
    base.addColorStop(1, "#101723");
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 256, 128);
    const key = ctx.createRadialGradient(68, 38, 0, 68, 38, 56);
    key.addColorStop(0, "#fff2dd");
    key.addColorStop(0.38, "#d5dce8");
    key.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = key;
    ctx.fillRect(0, 0, 256, 128);
    const rim = ctx.createRadialGradient(205, 48, 0, 205, 48, 45);
    rim.addColorStop(0, "#a9cee8");
    rim.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rim;
    ctx.fillRect(0, 0, 256, 128);

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(gl);
    let environment: THREE.WebGLRenderTarget | null = null;
    const previous = scene.environment;
    const previousIntensity = scene.environmentIntensity;
    try {
      environment = pmrem.fromEquirectangular(texture);
      scene.environment = environment.texture;
      scene.environmentIntensity = 0.85;
    } catch {
      // Direct lights still provide a usable scene on limited renderers.
    } finally {
      pmrem.dispose();
      texture.dispose();
    }
    return () => {
      if (scene.environment === environment?.texture) {
        scene.environment = previous;
        scene.environmentIntensity = previousIntensity;
      }
      environment?.dispose();
    };
  }, [gl, scene]);

  return (
    <>
      <ambientLight intensity={0.55} color="#c2d6e9" />
      <hemisphereLight args={["#e1edf7", "#302c27", 0.75]} />
      <directionalLight position={[5, 8, 5]} intensity={2.4} color="#fff0d9" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12} shadow-bias={-0.0003} shadow-normalBias={0.03} />
      <directionalLight position={[-6, 4, -4]} intensity={1.2} color="#a0c7ef" />
      <directionalLight position={[-3, 2, 5]} intensity={0.7} color="#d5e3ed" />
    </>
  );
}
