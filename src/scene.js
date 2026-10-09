/* The observation viewport.
 *
 * Three.js renders the archive as a surface you can look at: two strips of
 * ground, five things left standing on them. It is deliberately *not* a
 * glossy 3D showcase — the renderer draws into a low-resolution target and
 * blits it up with nearest-neighbour filtering, so the picture stays in the
 * instrument's own pixel language. Colour is certainty; shape is what it is.
 *
 * Design notes worth keeping:
 * - The two 3D strips use flatShading so facets are visible, same voice as
 *   the 2D pixel strips they replace.
 * - The marks are sampled through a shader that reads ONLY the alpha
 *   channel. The shipped PNGs are masks (uniform RGB, shape in alpha), so
 *   multiplying by a tint would turn them black. The lower third is shaded
 *   darker, which reads as a post planted in ground.
 * - Marker spacing is even on purpose: these objects are not positioned by
 *   coordinates we know, and implying otherwise is the exact false
 *   precision the app argues against.
 *
 * Everything here degrades to the 2D pixel map: if WebGL is unavailable, or
 * the context is lost and never returns, init() returns ok:false and the
 * caller keeps the DOM map it already drew.
 */

import * as THREE from "../vendor/three.module.js";

const VOID = new THREE.Color("#070910");

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Deterministic value noise on a lattice, so the terrain is the same every
   run and the test hook can report a stable surface. */
function makeNoise(seed) {
  const rand = mulberry32(seed);
  const size = 64;
  const lattice = new Float32Array(size * size);
  for (let i = 0; i < lattice.length; i++) lattice[i] = rand();
  const at = (x, y) => lattice[((y % size) + size) % size * size + (((x % size) + size) % size)];
  const smooth = (t) => t * t * (3 - 2 * t);
  return function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const tx = smooth(x - xi), ty = smooth(y - yi);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + d * tx) * ty;
  };
}

const MARK_GEOMETRY = new THREE.PlaneGeometry(5.6, 9.8);
/* Half the mark's height, so a mark can be planted on the exact ground point
   the raycast found. Marks were once placed at ground + 1.5, which buried
   every one of them several units under the surface once they got bigger. */
const MARK_HALF_HEIGHT = MARK_GEOMETRY.parameters.height / 2;
const BASE_GEOMETRY = new THREE.CylinderGeometry(1.2, 1.5, 0.5, 8);
const groupMarkers = [MARK_GEOMETRY];

function markMaterial(map, color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: map },
      uColor: { value: new THREE.Color(color) },
      uLit: { value: new THREE.Color("#ffffff") }
    },
    transparent: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform vec3 uColor;
      uniform vec3 uLit;
      varying vec2 vUv;
      void main() {
        float a = texture2D(uMap, vUv).a;
        if (a < 0.5) discard;
        float base = vUv.y < 0.28 ? 0.58 : 1.0;
        gl_FragColor = vec4(uColor * base, 1.0);
      }
    `
  });
}

function buildTerrain(width, depth, seed, color, craterSeed, moonLike) {
  const segX = 110;
  const segZ = 34;
  const geometry = new THREE.PlaneGeometry(width, depth, segX, segZ);
  geometry.rotateX(-Math.PI / 2);

  const noise = makeNoise(seed);
  const craterNoise = makeNoise(craterSeed);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    let y = noise(x * 0.16, z * 0.16) * 0.75 + noise(x * 0.42, z * 0.42) * 0.28;

    if (moonLike) {
      // Craters as radial basins: onions of noise, not one smoothed ring.
      for (let c = 0; c < 9; c++) {
        const cx = (c * 7.31) % width - width / 2;
        const cz = (c * 3.17) % depth - depth / 2;
        const r = 1.1 + (c % 4) * 0.5;
        const d = Math.hypot(x - cx, z - cz);
        if (d < r) {
          const t = d / r;
          y -= (1 - t * t) * (0.4 + craterNoise(cx + c, cz + c) * 0.4);
        }
      }
    } else {
      // Mars: dune ridges plus a soft basin, calmer than the Moon's pocking.
      y += Math.sin(x * 0.5 + craterNoise(x * 0.1, z * 0.1) * 2.0) * 0.16;
      const cx = width * 0.12, cz = 0;
      const d = Math.hypot(x - cx, z - cz);
      if (d < 7) y -= (1 - (d / 7) * (d / 7)) * 0.42;
    }

    // The far edge settles down so the strip reads as ground receding, and the
    // near edge barely lifts — a slab with a cliff across the front reads as a
    // floating platform, not as a surface.
    const edge = Math.abs(z) / (depth / 2);
    y -= Math.pow(edge, 4) * 0.7;
    y += (1 - edge) * 0.25;
    pos.setY(i, y);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    color: color,
    vertexColors: false,
    flatShading: true,
    roughness: 1,
    metalness: 0
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  return mesh;
}

function heightAt(terrain, x, z) {
  const raycaster = new THREE.Raycaster(new THREE.Vector3(x, 50, z), new THREE.Vector3(0, -1, 0));
  const hits = raycaster.intersectObject(terrain, false);
  return hits.length ? hits[0].point.y : 0;
}

const CERTAINTY_TINT = {
  high: "#7fae8a",
  medium: "#d3ab52",
  variable: "#92a0b8",
  low: "#c48072",
  unknown: "#c48072"
};

export async function init(mount, options) {
  const opts = options || {};
  const markers = opts.markers || [];
  const onSelect = opts.onSelect || function () {};
  const getSelected = opts.getSelected || function () { return null; };

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "default" });
  } catch (err) {
    return { ok: false, reason: "webgl unavailable" };
  }
  if (!renderer || !renderer.getContext) return { ok: false, reason: "no context" };

  const hostWidth = mount.clientWidth || 960;
  const hostHeight = mount.clientHeight || 300;

  renderer.setPixelRatio(1);
  renderer.setSize(hostWidth, hostHeight, false);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.setAttribute("aria-label", "Observation viewport: the Moon and Mars from above");
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = VOID;
  // Depth haze, not a fade: far enough out that neither strip is washed away.
  scene.fog = new THREE.Fog(VOID, 48, 130);

  const camera = new THREE.PerspectiveCamera(38, hostWidth / hostHeight, 0.1, 200);

  /* The mark sprites are masks: uniform RGB, shape in the alpha channel. So
     they are decoded with the nearest filter only and sampled through a
     shader that reads alpha — a tint multiplied through them would render
     black. */
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const markPaths = opts.markPaths || {};
  const textures = {};
  try {
    await Promise.all(
      Object.keys(markPaths).map(
        (key) =>
          new Promise((resolve) => {
            const tex = loader.load(markPaths[key], () => resolve(), undefined, () => resolve());
            tex.minFilter = THREE.NearestFilter;
            tex.magFilter = THREE.NearestFilter;
            tex.generateMipmaps = false;
            tex.colorSpace = THREE.NoColorSpace;
            textures[key] = tex;
            resolve();
          })
      )
    );
  } catch (_) {
    /* A texture that never arrives leaves that kind drawn without a mark;
       the archive still works. Not worth failing the viewport over. */
  }

  /* Low sun: the LRO captions in the archive talk about long shadows, so the
     light sits near the horizon rather than overhead. */
  const sun = new THREE.DirectionalLight("#fff0dc", 2.5);
  sun.position.set(-16, 10, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 90;
  sun.shadow.camera.left = -30;
  sun.shadow.camera.right = 30;
  sun.shadow.camera.top = 20;
  sun.shadow.camera.bottom = -20;
  sun.shadow.bias = -0.0006;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight("#3d4a5f", "#14100c", 0.95));

  /* Deep enough that the strip's far edge falls out of the haze instead of
     showing a plane with a corner: a slab you can see the side of reads as a
     floating platform, not as a surface. */
  const STRIP_WIDTH = 34;
  const STRIP_DEPTH = 46;

  const moon = buildTerrain(STRIP_WIDTH, STRIP_DEPTH, 20250602, "#8d8b86", 4711, true);
  moon.position.set(-19, 0, 0);
  scene.add(moon);

  const mars = buildTerrain(STRIP_WIDTH, STRIP_DEPTH, 91111, "#9c5f3d", 22881, false);
  mars.position.set(19, 0, 0);
  scene.add(mars);

  const groups = [];
  const markerMeshes = [];

  const byWorld = { moon: [], mars: [], other: [] };
  markers.forEach((m) => {
    const key = m.worldCode === "moon" ? "moon" : m.worldCode === "mars" ? "mars" : "other";
    byWorld[key].push(m);
  });

  Object.keys(byWorld).forEach((key) => {
    if (!byWorld[key].length) return;
    groups.push({ key: key, items: byWorld[key] });
  });

  const stripCenter = { moon: -20, mars: 20 };

  const groupMarkers = [MARK_GEOMETRY];
  const groupBodies = [];
  groups.forEach((g, gIndex) => {
    const terrain = g.key === "moon" ? moon : mars;
    const cx = stripCenter[g.key] !== undefined ? stripCenter[g.key] : -20 + gIndex * 40;
    const span = Math.min(24, 7 * g.items.length);
    g.items.forEach((m, i) => {
      const x = cx - span / 2 + (span / Math.max(1, g.items.length)) * (i + 0.5);
      const z = (i % 2 === 0 ? 1 : -1) * (1.2 + (i % 3) * 0.7);
      const y = heightAt(terrain, x - cx, z);

      const material = markMaterial(textures[m.mark], CERTAINTY_TINT[m.certainty] || CERTAINTY_TINT.unknown);
      const mesh = new THREE.Mesh(MARK_GEOMETRY, material);
      // Planted, not hovering: the mark's bottom edge lands on the ground the
      // raycast found. Marks were once placed at ground + 1.5, which buried
      // every one of them once they were drawn at size.
      mesh.position.set(x, y + MARK_HALF_HEIGHT + 0.04, z);
      mesh.castShadow = true;
      mesh.userData = { id: m.id, name: m.name, base: 1 };
      scene.add(mesh);
      markerMeshes.push(mesh);

      // A thin base disc hides the join and reads as something set on ground.
      const base = new THREE.Mesh(BASE_GEOMETRY, new THREE.MeshStandardMaterial({ color: "#14110d", roughness: 1, metalness: 0 }));
      base.position.set(x, y + 0.1, z);
      base.receiveShadow = true;
      scene.add(base);
      groupBodies.push(base);
    });
  });

  /* ---- camera: orbit, with an idle drift so it is never a dead frame ----
     The first frame fits the marks rather than trusting a hand-picked
     distance. The canvas is wide and short, so width is the binding
     constraint, not height — a camera framed by the vertical fov alone puts
     the whole archive in a thin band down the middle of a wide frame. A
     camera that happens to exclude a record also makes that record
     unclickable, which is a dead end wearing a nice camera angle. */
  const bounds = new THREE.Box3().setFromObject(scene);
  const sphere = bounds.getBoundingSphere(new THREE.Sphere());
  const boxSize = new THREE.Vector3();
  bounds.getSize(boxSize);

  let azimuth = -0.34;
  let polar = 1.06;
  let radius = 46;
  const TARGET = new THREE.Vector3().copy(sphere.center);

  function fit() {
    const vTan = Math.tan(((camera.fov * Math.PI) / 180) / 2);
    const hTan = vTan * (camera.aspect || 1);
    // Both strips plus a little air, in world units.
    const wNeeded = boxSize.x * 0.5 + 2.5;
    const hNeeded = boxSize.z * 0.5 + 4.5;
    const forWidth = wNeeded / hTan;
    const forHeight = hNeeded / vTan;
    radius = Math.max(18, Math.min(90, Math.max(forWidth, forHeight) * 1.04));
  }
  fit();

  const lookTarget = new THREE.Vector3().copy(TARGET);

  function place() {
    const x = TARGET.x + radius * Math.sin(polar) * Math.sin(azimuth);
    const y = TARGET.y + radius * Math.cos(polar);
    const z = TARGET.z + radius * Math.sin(polar) * Math.cos(azimuth);
    camera.position.set(x, y, z);
    camera.lookAt(TARGET);
  }
  place();

  let dragging = false;
  let dragMoved = 0;
  let lastX = 0, lastY = 0;
  let idleAt = 0;

  renderer.domElement.addEventListener("pointerdown", (e) => {
    dragging = true;
    dragMoved = 0;
    lastX = e.clientX;
    lastY = e.clientY;
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    dragMoved += Math.abs(dx) + Math.abs(dy);
    lastX = e.clientX;
    lastY = e.clientY;
    azimuth -= dx * 0.005;
    polar = Math.max(0.42, Math.min(1.38, polar - dy * 0.004));
    idleAt = performance.now();
    place();
  });
  const endDrag = (e) => {
    if (dragging && dragMoved < 6) pickAt(e);
    dragging = false;
    idleAt = performance.now();
  };
  renderer.domElement.addEventListener("pointerup", endDrag);
  renderer.domElement.addEventListener("pointercancel", () => { dragging = false; });

  renderer.domElement.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      radius = Math.max(22, Math.min(72, radius + e.deltaY * 0.03));
      idleAt = performance.now();
      place();
    },
    { passive: false }
  );

  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function pickAt(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(markerMeshes, false);
    if (hits.length && hits[0].object.userData.id) {
      onSelect(hits[0].object.userData.id);
    }
  }

  /* ---- the pixel pass: draw low, blit up, no smoothing ---- */
  const rt = new THREE.WebGLRenderTarget(384, 240);
  rt.texture.minFilter = THREE.NearestFilter;
  rt.texture.magFilter = THREE.NearestFilter;
  rt.texture.generateMipmaps = false;

  const quadScene = new THREE.Scene();
  const quadCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshBasicMaterial({ map: rt.texture }));
  quadScene.add(quad);

  let selectedId = getSelected() || null;
  const focusPoint = new THREE.Vector3();

  function applySelection() {
    const id = getSelected();
    if (id === selectedId) return;
    selectedId = id;
    markerMeshes.forEach((m) => {
      const on = m.userData.id === id;
      m.userData.base = on ? 1.22 : 1;
      m.scale.setScalar(m.userData.base);
      if (on) {
        m.material.uniforms.uColor.value.set("#edbd8c");
        // Pull the orbit in a little toward the thing being read, so the
        // viewport and the record agree about what is being looked at.
        focusPoint.setFromMatrixPosition(m.matrixWorld);
        lookTarget.set(focusPoint.x, focusPoint.y + 1.1, focusPoint.z);
      } else {
        const src = markers.find((x) => x.id === m.userData.id);
        m.material.uniforms.uColor.value.set(CERTAINTY_TINT[(src && src.certainty) || "unknown"] || CERTAINTY_TINT.unknown);
      }
    });
  }

  let frames = 0;

  /* Where each mark lands on screen, in CSS pixels. The harness uses it to
     click the real control rather than guessing at coordinates. */
  const projected = new THREE.Vector3();
  function screenPositions() {
    const w = mount.clientWidth || 1;
    const h = mount.clientHeight || 1;
    return markerMeshes.map((m) => {
      projected.setFromMatrixPosition(m.matrixWorld);
      projected.project(camera);
      return {
        id: m.userData.id,
        name: m.userData.name,
        x: (projected.x * 0.5 + 0.5) * w,
        y: (-projected.y * 0.5 + 0.5) * h,
        behind: projected.z > 1
      };
    });
  }
  function resize() {
    const w = mount.clientWidth || hostWidth;
    const h = mount.clientHeight || hostHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    fit();
  }

  let raf = 0;
  let disposed = false;
  let paused = false;

  function frame(now) {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (paused) return;
    applySelection();

    if (!dragging && now - idleAt > 2600) {
      azimuth += 0.0011;
      place();
    }

    // Ease the orbit toward whatever is being read: the viewport follows the
    // reader, the way the rail and the record column do.
    if (!selectedId && lookTarget.lengthSq() > 0) {
      const back = new THREE.Vector3().copy(sphere.center);
      lookTarget.lerp(back, 0.04);
      if (lookTarget.distanceTo(back) < 0.02) lookTarget.copy(back);
    }
    if (TARGET.distanceTo(lookTarget) > 0.01) {
      TARGET.lerp(lookTarget, 0.06);
      place();
    }

    // Internal target is fixed-resolution on purpose: the pixelation IS the
    // style, and it keeps the raster cost flat on any window size.
    renderer.setRenderTarget(rt);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(quadScene, quadCamera);
    frames++;
  }
  raf = requestAnimationFrame(frame);

  const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
  if (observer) observer.observe(mount);

  const onLost = (event) => {
    event.preventDefault();
    disposed = true;
    cancelAnimationFrame(raf);
    if (observer) try { observer.disconnect(); } catch (_) {}
    if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    // The 2D pixel map is the fallback, not a lesser mode: if the GPU gives
    // up, the archive keeps working and says the same thing in pixels.
    if (opts.onFail) opts.onFail("the observation viewport stopped responding");
  };
  renderer.domElement.addEventListener("webglcontextlost", onLost);

  return {
    ok: true,
    frames: () => frames,
    markerCount: () => markerMeshes.length,
    distinctMarks: () => new Set(markers.map((m) => m.mark)).size,
    pixelTarget: () => [384, 240],
    screenPositions: screenPositions,
    pause: () => { paused = true; },
    resume: () => { paused = false; },
    camera: () => ({ x: camera.position.x, y: camera.position.y, z: camera.position.z }),
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      if (observer) try { observer.disconnect(); } catch (_) {}
      scene.traverse((obj) => {
        if (obj.geometry && obj.geometry !== MARK_GEOMETRY) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          obj.material.dispose();
        }
      });
      rt.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
    }
  };
}
