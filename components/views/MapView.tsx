"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OrbitControls, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  Search,
  X,
  ArrowUpRight,
  MapPin,
  Crosshair,
  Layers3,
  Info,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Scene3D from "@/components/three/Scene3D";
import { PLANETS } from "@/data/planets";
import { SITES, MARKER_COLOR, MARKER_LABEL, sitesByPlanet } from "@/data/sites";
import { getEquipment } from "@/data/equipment";
import { Breadcrumb, SectionHeader, SourceLink, StatusPill } from "@/components/ui/Atoms";
import { resource } from "@/data/resources";
import { useAfterlight } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";
import type { LandingSite, MarkerKind, Planet } from "@/data/types";

function latLonToVec3(lat: number, lon: number, radius: number) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function Marker({
  site,
  selected,
  onSelect,
  dimmed,
}: {
  site: LandingSite;
  selected: boolean;
  onSelect: () => void;
  dimmed: boolean;
}) {
  const pos = useMemo(() => latLonToVec3(site.lat, site.lon, 1.015), [site.lat, site.lon]);
  const ring = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const color = MARKER_COLOR[site.kind];

  useFrame((state) => {
    if (!ring.current) return;
    const t = (state.clock.elapsedTime * 0.6 + site.lat * 0.02) % 1;
    const scale = 1 + t * 2.6;
    ring.current.scale.setScalar(scale);
    const mat = ring.current.material as THREE.MeshBasicMaterial;
    mat.opacity = (1 - t) * 0.55;
  });

  return (
    <group position={pos}>
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "auto";
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <sphereGeometry args={[selected ? 0.026 : hover ? 0.022 : 0.017, 14, 14]} />
        <meshBasicMaterial color={color} transparent opacity={dimmed ? 0.2 : 1} />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.028, 0.033, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      {selected && !dimmed && (
        <mesh position={[0, 0, 0]} scale={selected ? 1.15 : 1}>
          <ringGeometry args={[0.042, 0.05, 28]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}

function Globe({
  planet,
  selectedId,
  onSelect,
  activeKinds,
}: {
  planet: Planet;
  selectedId: string | null;
  onSelect: (s: LandingSite) => void;
  activeKinds: MarkerKind[];
}) {
  const tex = useTexture(PLANETS[planet].texture);
  const group = useRef<THREE.Group>(null);
  const sites = sitesByPlanet(planet);
  const target = useRef<THREE.Quaternion | null>(null);

  useEffect(() => {
    const site = sites.find((s) => s.id === selectedId);
    if (!site || !group.current) {
      target.current = null;
      return;
    }
    const v = latLonToVec3(site.lat, site.lon, 1);
    const q = new THREE.Quaternion().setFromUnitVectors(v.clone().normalize(), new THREE.Vector3(0, 0, 1));
    target.current = q;
  }, [selectedId, sites]);

  useFrame((state, dt) => {
    if (!group.current) return;
    if (target.current) {
      group.current.quaternion.slerp(target.current, Math.min(1, dt * 2.4));
    } else {
      group.current.rotation.y += dt * 0.035;
    }
    const v = state.camera.position;
    if (v.length() < 1.9) state.camera.position.setLength(1.9);
    if (v.length() > 6) state.camera.position.setLength(6);
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial map={tex} roughness={0.92} metalness={0.03} />
      </mesh>
      <mesh scale={1.02}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color={planet === "mars" ? "#ff8a4c" : "#9ed6ff"}
          transparent
          opacity={0.14}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {sites.map((s) => (
        <Marker
          key={s.id}
          site={s}
          selected={selectedId === s.id}
          onSelect={() => onSelect(s)}
          dimmed={activeKinds.length > 0 && !activeKinds.includes(s.kind)}
        />
      ))}
    </group>
  );
}

export default function MapView() {
  const { planet, setPlanet, siteId, setSiteId, openEquipment, say, go } = useAfterlight();
  const openRecord = (id: string) => {
    const record = getEquipment(id);
    if (!record) return;
    setPlanet(record.planet);
    openEquipment(record.id, "overview");
  };
  const requestedEquipmentId = useNavigation((state) => state.mapEquipmentId);
  const requestedEquipment = requestedEquipmentId ? getEquipment(requestedEquipmentId) : null;
  const sites = useMemo(() => sitesByPlanet(planet), [planet]);
  const [query, setQuery] = useState("");
  const [kinds, setKinds] = useState<MarkerKind[]>([]);
  const [mobileList, setMobileList] = useState(false);

  const selected = sites.find((s) => s.id === siteId) ?? null;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites.filter((s) => {
      if (kinds.length && !kinds.includes(s.kind)) return false;
      if (!q) return true;
      return `${s.name} ${s.mission} ${s.description} ${s.year}`.toLowerCase().includes(q);
    });
  }, [sites, query, kinds]);

  const select = (s: LandingSite | null) => {
    useNavigation.getState().targetMapEquipment(null);
    setSiteId(s?.id ?? null);
    setQuery("");
    setKinds([]);
  };

  const step = (dir: 1 | -1) => {
    const idx = filtered.findIndex((s) => s.id === siteId);
    const next = filtered[(idx + dir + filtered.length) % filtered.length];
    if (next) select(next);
  };

  const equipment = selected?.equipmentId ? getEquipment(selected.equipmentId) : null;
  const kindsPresent = Array.from(new Set(sites.map((s) => s.kind))) as MarkerKind[];

  return (
    <div className="w-full px-4 pt-5 md:px-6">
      <Breadcrumb
        items={[
          { label: "Home", onClick: () => go("home") },
          { label: PLANETS[planet].name, onClick: () => go("home") },
          { label: "Surface map" },
        ]}
      />
      <SectionHeader
        className="mt-4"
        eyebrow={`Interactive surface map · ${PLANETS[planet].name}`}
        title={
          <>
            Every dot is a place we <span className="text-gradient-ice">left something</span>
          </>
        }
        description="Drag to spin the world, scroll or pinch to zoom, and click a marker to open its record. Coordinates come from orbiter targeting where available; uncertain positions are labelled."
        action={
          <div className="flex items-center gap-1 rounded-[0.55rem] border-2 border-white/15 bg-abyss/70 p-1">
            {(["moon", "mars"] as Planet[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  useNavigation.getState().chooseArchiveDestination(p);
                  setPlanet(p);
                  useNavigation.getState().targetMapEquipment(null);
                  setSiteId(null);
                }}
                className={`rounded-[0.45rem] border-2 px-3.5 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] transition ${
                  planet === p
                    ? p === "mars"
                      ? "border-gold/70 bg-gradient-to-b from-sand to-gold text-[#21160a]"
                      : "border-cyan/70 bg-gradient-to-b from-[#dceeff] to-[#9ec4ea] text-[#08203a]"
                    : "border-transparent text-slate-400 hover:text-white"
                }`}
              >
                {PLANETS[p].name}
              </button>
            ))}
          </div>
        }
      />

      {requestedEquipment?.planet === planet && !selected && (
        <div role="status" className="mt-4 rounded-xl border border-gold/25 bg-gold/5 p-4 text-sm leading-relaxed text-slate-300">
          The surface map has no documented site linked to {requestedEquipment.name}. Its record lists {requestedEquipment.site}; browse the documented sites below.
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_clamp(300px,26vw,380px)]">
        {/* globe */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan/20 bg-[radial-gradient(120%_100%_at_50%_0%,#0b1c38,#03060e)]">
          <div className="relative h-[52vh] min-h-[340px] w-full lg:h-[calc(100vh-19rem)] lg:min-h-[520px]">
            <Scene3D
              alwaysRender
              className="absolute inset-0"
              cameraPosition={[0, 0.9, 3.1]}
              fov={38}
              fallback={
                <div className="absolute inset-0 grid place-items-center">
                  <img
                    src={PLANETS[planet].globe}
                    alt={`${PLANETS[planet].name} map`}
                    className="h-2/3 w-2/3 object-contain opacity-80"
                  />
                </div>
              }
            >
              <color attach="background" args={["#04070f"]} />
              <ambientLight intensity={0.5} color="#9dc0ff" />
              <directionalLight position={[4, 2.5, 4]} intensity={2.5} color="#fff0d8" />
              <directionalLight position={[-4, -1, -3]} intensity={0.7} color="#3f7dff" />
              <Suspense fallback={null}>
                <Globe
                  planet={planet}
                  selectedId={siteId}
                  onSelect={(s) => select(s)}
                  activeKinds={kinds}
                />
              </Suspense>
              <OrbitControls
                enablePan={false}
                minDistance={1.9}
                maxDistance={5.5}
                rotateSpeed={0.55}
                zoomSpeed={0.7}
                enableDamping
                dampingFactor={0.08}
              />
            </Scene3D>

            {/* HUD */}
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1 rounded-[0.55rem] border border-white/10 bg-ink/75 px-2.5 py-1.5 backdrop-blur">
              <span className="data text-[0.52rem] uppercase tracking-[0.2em] text-cyan/80">
                {PLANETS[planet].name} · {sites.length} documented sites
              </span>
              <span className="text-[0.55rem] uppercase tracking-[0.14em] text-slate-400">
                drag to rotate · scroll to zoom
              </span>
            </div>

            <div className="absolute right-3 top-3 hidden flex-col items-end gap-1.5 sm:flex">
              <div className="rounded-lg border border-white/10 bg-ink/70 px-2 py-1.5 backdrop-blur">
                {kindsPresent.map((k) => (
                  <div key={k} className="flex items-center gap-1.5 py-0.5">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: MARKER_COLOR[k], boxShadow: `0 0 6px ${MARKER_COLOR[k]}` }}
                    />
                    <span className="text-[0.52rem] uppercase tracking-[0.1em] text-slate-400">
                      {MARKER_LABEL[k]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* search + filters */}
            <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center gap-2">
              <div className="flex min-w-[10rem] flex-1 items-center gap-2 rounded-[0.55rem] border-2 border-white/15 bg-ink/85 px-3 py-2 backdrop-blur focus-within:border-cyan/70 focus-within:ring-2 focus-within:ring-cyan/30">
                <Search size={13} className="text-slate-500" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find equipment or a site…"
                  className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-slate-400 focus:outline-none sm:text-sm"
                  aria-label="Search sites"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="text-action grid min-h-11 min-w-11 place-items-center" aria-label="Clear search">
                    <X size={12} className="text-slate-500" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
                {kindsPresent.map((k) => (
                  <button
                    key={k}
                    onClick={() =>
                      setKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]))
                    }
                    className="chip !bg-ink/80 !backdrop-blur"
                    data-active={kinds.includes(k)}
                    title={MARKER_LABEL[k]}
                    aria-label={MARKER_LABEL[k]}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: MARKER_COLOR[k] }} />
                    <span className="hidden sm:inline">{MARKER_LABEL[k]}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* site list / detail */}
        <div className="min-h-0">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-gold/30 bg-[linear-gradient(165deg,rgba(26,18,8,0.72),rgba(5,9,18,0.95))]"
              >
                <div className="flex items-start justify-between gap-2 border-b border-white/8 p-3">
                  <div className="min-w-0">
                    <span className="data text-[0.52rem] uppercase tracking-[0.2em] text-gold/80">
                      {selected.kind === "rover" ? "Rover site" : MARKER_LABEL[selected.kind]}
                    </span>
                    <h3 className="display mt-0.5 truncate text-xl text-white">{selected.name}</h3>
                    <p className="text-[0.6rem] uppercase tracking-[0.14em] text-slate-500">
                      {selected.mission} · {selected.year}
                    </p>
                  </div>
                  <button onClick={() => select(null)} className="text-slate-400 hover:text-white" aria-label="Close site card">
                    <X size={15} />
                  </button>
                </div>

                <div className="thin-scroll flex-1 overflow-y-auto p-3">
                  {equipment && (
                    <img
                      src={equipment.image}
                      alt={equipment.imageCaption}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                  )}
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="label-pill">
                      <Crosshair size={10} /> {selected.lat.toFixed(3)}°, {selected.lon.toFixed(3)}°
                    </span>
                    <span
                      className={`rounded-md border px-1.5 py-1 text-[0.52rem] uppercase tracking-[0.1em] ${
                        selected.verified
                          ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                          : "border-amber-400/40 bg-amber-400/10 text-amber-200"
                      }`}
                    >
                      {selected.verified ? "Identified site · approximate coordinates" : "Estimated location"}
                    </span>
                  </div>
                  <p className="mt-2.5 text-[0.74rem] leading-relaxed text-slate-300">
                    {selected.description}
                  </p>
                  <dl className="mt-3 space-y-1.5 border-t border-white/8 pt-2.5 text-[0.66rem]">
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-500">Status</dt>
                      <dd className="text-right text-slate-200">{selected.status}</dd>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <dt className="text-slate-500">Coordinates</dt>
                      <dd className="text-right text-slate-400">{selected.coordinateSource}</dd>
                    </div>
                    {equipment && (
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500">Equipment</dt>
                        <dd className="text-right text-slate-200">{equipment.name}</dd>
                      </div>
                    )}
                  </dl>
                  <div className="mt-3 space-y-2 border-t border-white/8 pt-3 text-xs">
                    {selected.coordinateReference && <SourceLink href={selected.coordinateReference.url}>Coordinate compilation · {selected.verified ? "identified site" : "estimated location"}</SourceLink>}
                    {(selected.sources ?? []).map((source) => <div key={source.url}><SourceLink href={source.url}>{source.label}</SourceLink></div>)}
                    <p className="text-[0.68rem] leading-relaxed text-slate-400">Mission references explain the hardware and its history. Map coordinates remain the existing approximate positions; they have not been remeasured from these pages.</p>
                  </div>
                  {equipment && (
                    <div className="mt-2.5">
                      <StatusPill status={equipment.status} />
                    </div>
                  )}
                </div>

                <div className="border-t border-white/8 p-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => step(-1)} className="icon-btn !h-8 !w-8" aria-label="Previous site">
                      <ArrowLeft size={13} />
                    </button>
                    <button onClick={() => step(1)} className="icon-btn !h-8 !w-8" aria-label="Next site">
                      <ArrowRight size={13} />
                    </button>
                    <button
                      onClick={() => {
                        if (equipment) openRecord(equipment.id);
                        else
                          say({
                            text: selected.description,
                            expression: "curious",
                            pose: "point",
                          });
                      }}
                      className="btn btn-gold ml-auto !py-2 !text-[0.6rem]"
                    >
                      {equipment ? "Open equipment record" : "Hear the story"} <ArrowUpRight size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => setMobileList(true)}
                    className="mt-2 w-full text-center text-[0.55rem] uppercase tracking-[0.14em] text-cyan/60 hover:text-cyan lg:hidden"
                  >
                    Browse all {filtered.length} sites
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-deep/25"
              >
                <div className="flex items-center justify-between border-b border-white/8 px-3 py-2.5">
                  <span className="data text-[0.56rem] uppercase tracking-[0.2em] text-slate-400">
                    {filtered.length} sites
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.52rem] uppercase tracking-[0.12em] text-slate-600">
                    <Layers3 size={10} /> click to focus
                  </span>
                </div>
                <div className="thin-scroll max-h-[60vh] flex-1 overflow-y-auto p-2 lg:max-h-[calc(100vh-19rem)]">
                  {filtered.length === 0 && (
                    <p className="px-3 py-8 text-center text-[0.72rem] text-slate-400">
                      No sites match “{query}”.
                    </p>
                  )}
                  {filtered.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => select(s)}
                      className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition hover:bg-white/5"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: MARKER_COLOR[s.kind], boxShadow: `0 0 8px ${MARKER_COLOR[s.kind]}` }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[0.74rem] text-slate-200 group-hover:text-white">
                          {s.name}
                        </span>
                        <span className="block text-[0.55rem] uppercase tracking-[0.1em] text-slate-500">
                          {s.year} · {s.mission}
                        </span>
                      </span>
                      <MapPin size={11} className="shrink-0 text-slate-600 group-hover:text-cyan" />
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/8 p-2.5">
                  <p className="flex items-start gap-1.5 text-[0.58rem] leading-relaxed text-slate-500">
                    <Info size={11} className="mt-0.5 shrink-0" />
                    Positions are approximate within the map projection; open a site for its
                    coordinate source.
                  </p>
                  <a
                    href={planet === "moon" ? "https://en.wikipedia.org/wiki/List_of_artificial_objects_on_the_Moon" : "https://en.wikipedia.org/wiki/List_of_artificial_objects_on_Mars"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-1.5 inline-flex items-center gap-1 text-[0.56rem] uppercase tracking-[0.12em] text-cyan/60 hover:text-cyan"
                  >
                    Coordinate references <ExternalLink size={9} />
                  </a>
                  <div className="mt-2 text-xs"><SourceLink href={resource("nssdca").url}>Research a spacecraft in NSSDCA</SourceLink></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* mobile sheet for the site list */}
      <AnimatePresence>
        {mobileList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-ink/80 p-3 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileList(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              className="mt-16 max-h-[70vh] overflow-hidden rounded-2xl border border-cyan/25 bg-abyss"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
                <span className="data text-[0.6rem] uppercase tracking-[0.2em] text-cyan">
                  {PLANETS[planet].name} · all sites
                </span>
                <button onClick={() => setMobileList(false)} aria-label="Close">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="thin-scroll max-h-[60vh] overflow-y-auto p-2">
                {sites.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      select(s);
                      setMobileList(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left hover:bg-white/5"
                  >
                    <span className="h-2 w-2 rounded-full" style={{ background: MARKER_COLOR[s.kind] }} />
                    <span className="text-[0.76rem] text-slate-200">{s.name}</span>
                    <span className="ml-auto text-[0.58rem] text-slate-500">{s.year}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
