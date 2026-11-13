import { MARS_EQUIPMENT } from "./equipment-mars";
import { MOON_EQUIPMENT } from "./equipment-moon";
import { MOON_ARCHIVE } from "./archive-moon";
import { MARS_ARCHIVE } from "./archive-mars";
import { L, M3D, KIND_COMPONENTS } from "./archive-kit";
import { MODEL_COMPONENTS, PERSEVERANCE_COMPONENTS, ROTOR_FRAGMENT_COMPONENTS, PETAL_CAPSULE_COMPONENTS, AIRBAG_PLATFORM_COMPONENTS, PENETRATOR_COMPONENTS, TRIPOD_CAMERA_COMPONENTS, FOIL_COLLECTOR_COMPONENTS, HEAT_PROBE_COMPONENTS, SPECIAL_MODEL_COMPONENTS } from "./components";
import { imagePresentation, publishedGalleryShot } from "./image-provenance";
import { missionSources } from "./resources";
import type {
  ArchiveKind,
  Asset3D,
  ChapterBody,
  Equipment,
  EquipmentCategory,
  Importance,
  ModelComponent,
  ModelKey,
  Planet,
  Source,
} from "./types";

/**
 * One central database. Legacy IDs and catalogue ordering remain stable as
 * evidence corrections are applied to the legacy and expanded records.
 */
const LEGACY_IMPORTANCE: Record<string, Importance> = {
  "apollo-lunar-module": "iconic",
  "apollo-lrv": "iconic",
  "lunokhod-1": "iconic",
  "surveyor-3": "major",
  "viking-1": "iconic",
  opportunity: "iconic",
  spirit: "iconic",
  curiosity: "iconic",
  perseverance: "iconic",
  sojourner: "major",
  ingenuity: "major",
  insight: "major",
  phoenix: "major",
  zhurong: "major",
};

const LEGACY_MODEL: Record<string, Source> = {
  "apollo-lunar-module": M3D.lm,
  "viking-1": M3D.viking,
  perseverance: M3D.perseverance,
  spirit: M3D.mer,
  opportunity: M3D.mer,
  curiosity: M3D.curiosity,
  insight: M3D.insight,
};

function countryOfAgency(agency: string): string {
  if (/soviet/i.test(agency)) return "Soviet Union";
  if (/china|cnsa/i.test(agency)) return "China";
  if (/nasa|jpl|grumman|boeing|lockheed|martin/i.test(agency)) return "United States";
  if (/esa|europe/i.test(agency)) return "Europe";
  if (/isro|india/i.test(agency)) return "India";
  if (/jaxa|japan/i.test(agency)) return "Japan";
  return "International";
}

/** Fills the record-level fields the expanded archive needs on the original 14 entries. */
function normalize(eq: Equipment): Equipment {
  // Explicit identity corrections; builders never guess a machine from its prose.
  const mappedVariant: Asset3D["variant"] = {
    "luna-9": "petal-capsule", "luna-13": "petal-capsule", "mars-3-lander": "petal-capsule",
    "pathfinder-lander": "airbag-platform", "mer-a-spirit-landing-platform": "airbag-platform", "mer-b-opportunity-landing-platform": "airbag-platform",
    "ds2-amundsen": "penetrator", "ds2-scott": "penetrator",
    "apollo-11-tv-camera": "tripod-camera", "apollo-16-far-ultraviolet-camera": "tripod-camera",
    "apollo-11-solar-wind-composition": "foil-collector", "insight-hp3-mole": "heat-probe",
    "chang-e-5-ascent": "sample-ascent", "chang-e-6-ascent": "sample-ascent",
    "beagle-2": "clamshell-lander", slim: "slim-lander",
    "luna-16": "sample-lander", "luna-20": "sample-lander", "luna-24": "sample-lander",
    "ranger-6": "ranger", "ranger-7": "ranger", "ranger-8": "ranger", "ranger-9": "ranger",
    "luna-2": "spherical-probe", "lcross-centaur": "upper-stage",
    zhurong: "zhurong", yutu: "yutu", "yutu-2": "yutu", "chandrayaan-3-pragyan": "pragyan", "apollo-11-easep": "easep",
  }[eq.id] as Asset3D["variant"];
  const variantComponents = mappedVariant === "petal-capsule" ? PETAL_CAPSULE_COMPONENTS
    : mappedVariant === "airbag-platform" ? AIRBAG_PLATFORM_COMPONENTS
    : mappedVariant === "penetrator" ? PENETRATOR_COMPONENTS
    : mappedVariant === "tripod-camera" ? TRIPOD_CAMERA_COMPONENTS
    : mappedVariant === "foil-collector" ? FOIL_COLLECTOR_COMPONENTS
    : mappedVariant === "heat-probe" ? HEAT_PROBE_COMPONENTS
    : mappedVariant === "sample-ascent" ? KIND_COMPONENTS["ascent-stage"].map(part => part.id === "cabin" ? { ...part, label: "Avionics & Sample Structure", description: "Uncrewed ascent vehicle structure holding tanks, avionics and the sample container interface; no crew cabin." } : part.id === "window" ? { ...part, label: "Rendezvous Sensor Face", description: "Schematic rendezvous sensor face on an uncrewed sample-return stage; these are not crew windows." } : part) : mappedVariant ? SPECIAL_MODEL_COMPONENTS[mappedVariant] : undefined;
  let mappedAsset = eq.asset;
  if (mappedVariant === "zhurong") mappedAsset = { kind:"rover-6", source:"reconstruction", note:"Schematic solar-powered Zhurong rover; not flight CAD.", span:2.6, tone:"#c99a34" };
  if (mappedAsset && mappedVariant) {
    const details: Partial<Asset3D> = mappedVariant === "petal-capsule" ? { span: eq.id === "mars-3-lander" ? 1.2 : 0.58, cameras: eq.id === "luna-13" ? 2 : 1, note: "Schematic deployed landing capsule with four opening petals, camera and whip antennas. Capsule family proportions, antenna placement and exact final condition are simplified; not flight CAD." }
      : mappedVariant === "airbag-platform" ? { panels: eq.id === "pathfinder-lander" ? 3 : 0, note: "Schematic open tetrahedral airbag platform: central face and three hinged triangular petals. Pathfinder carries solar panels and a mast; MER platforms show rover supports. Petal angles, cables and final surface condition are simplified." }
      : mappedVariant === "penetrator" ? { span: 0.136, height: 0.207, note: "Schematic Deep Space 2 forebody and aftbody with small radio antenna and shortened inter-body cable. The system had no landing engine or dish. Shown assembled for explanation; actual impact state is unknown." }
      : mappedVariant === "tripod-camera" ? { height: eq.id === "apollo-11-tv-camera" ? 0.8 : 1.1, note: "Schematic tripod-mounted camera housing and optical opening. Instrument-specific electronics, optical train, cables and final pose are simplified." }
      : mappedVariant === "foil-collector" ? { span: 0.3, height: 1.4, note: "Schematic Solar Wind Composition foil deployed on its pole. The exposed foil was returned to Earth; this operating-state model is not a depiction of hardware currently left on the Moon." }
      : mappedVariant === "heat-probe" ? { note: "Schematic InSight HP3 deployment support, tether and shallow probe location. The buried 40 cm mole is not shown as an above-ground mast; the intended heat-flow depth was not reached." }
      : mappedVariant === "clamshell-lander" ? { span: 0.65, note: "Schematic Beagle 2 clamshell body, four circular solar panels and payload assembly in its intended open state. Its actual partial deployment remains inferred from orbital images." }
      : mappedVariant === "slim-lander" ? { span: 1, height: 1.5, note: "Schematic SLIM body, five crushable supports, twin main-engine locations and body solar panel, shown in a tipped attitude. Exact nozzle damage and crushed support geometry are not reproduced." }
      : mappedVariant === "sample-lander" ? { note: "Schematic Soviet Luna sample-return platform with four legs, tanks, drill and ascent capsule. Shown before sample ascent, which left the descent platform; variant-specific dimensions and mechanisms are simplified." }
      : mappedVariant === "ranger" ? { note: "Schematic Ranger camera spacecraft before impact: hexagonal bus, camera tower, two solar wings and high-gain dish. The six-camera optical layout and small fittings are simplified." }
      : mappedVariant === "spherical-probe" ? { span: 0.9, note: "Schematic Luna 2 spherical pressure vessel and antennas before impact. It has no pointed penetrator or large dish; small instrument fittings and the debris state are not reproduced." }
      : mappedVariant === "upper-stage" ? { span: 3.05, height: 12.68, note: "Schematic LCROSS Centaur cylindrical upper stage with twin RL10 engine locations before impact. Exact tank dimensions, bands and engine plumbing are simplified." }
      : mappedVariant === "zhurong" ? { note:"Schematic Zhurong chassis with six wheels, four solar wings and camera mast, based on CNSA's published surface photographs. Panel outlines, radar fittings and dimensions are simplified; no Curiosity RTG or sampling arm." }
      : mappedVariant === "yutu" ? { note:"Schematic Yutu-family six-wheel rover with two solar wings and camera mast. Mission-specific instruments, panel outlines and final pose remain simplified." }
      : mappedVariant === "pragyan" ? { note:"Schematic Pragyan six-wheel rover with upright rectangular solar panel, body navigation cameras and lander radio antenna, based on ISRO deployed rover diagrams. Detailed instrument housings and dimensions are simplified." }
      : mappedVariant === "easep" ? { note:"Schematic Apollo 11 EASEP: solar-powered passive seismic unit and separately deployed passive 100-cube laser reflector. No ALSEP RTG. Package spacing is illustrative, not a site survey." }
      : { note: "Schematic uncrewed sample ascent stage with engine, avionics/sample structure and rendezvous sensor face. No crew cabin or crew windows; detailed tank and sensor geometry is simplified." };
    mappedAsset = { ...mappedAsset, ...details, variant: mappedVariant, source: "reconstruction" };
  }
  const record =
    eq.record ?? {
      what: eq.summary,
      history: eq.story.beginning.join(" "),
      journey: eq.story.journey.join(" "),
      landing: eq.story.landing.join(" "),
      fate: eq.story.finalDays.join(" "),
      legacy: eq.story.legacy.join(" "),
    };
  const downloads = eq.downloads ?? [LEGACY_MODEL[eq.id] ?? L.nasa3d, L.nasa3dGit];
  // Resolve obsolete retained links to verified mission pages or correctly labelled
  // journal context. A working mission link still is not individual-object evidence.
  const retainedSources = eq.sources.map((source): Source => {
    if (source.url === "https://science.nasa.gov/mission/apollo/") return { ...source, label: "NASA — The Apollo Program", url: "https://www.nasa.gov/the-apollo-program/" };
    const apolloNumber = source.url.match(/^https:\/\/science\.nasa\.gov\/mission\/apollo-(8|11|12|14|15|16|17)\/$/)?.[1];
    if (apolloNumber) return { ...source, label: `NASA — Apollo ${apolloNumber}`, url: `https://www.nasa.gov/mission/apollo-${apolloNumber}/` };
    if (source.url === "https://www.nasa.gov/history/apollo-lunar-module/") return { ...source, label: "NASA History — Apollo Lunar Surface Journal (lunar module context)", url: "https://www.nasa.gov/history/alsj/", note: "Consult the relevant mission journal for surface operations and lunar module context." };
    if (source.url === "https://www.nasa.gov/history/lunar-roving-vehicle/") return { ...source, label: "NASA History — Apollo Lunar Surface Journal (lunar rover deployment)", url: "https://www.nasa.gov/history/alsj/", note: "Apollo 15, 16 and 17 surface journals document rover deployment and use." };
    if (source.url === "https://science.nasa.gov/mission/ingenuity-mars-helicopter/") return { ...source, label: "NASA Science — Ingenuity Mars Helicopter", url: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/" };
    if (source.url === "https://science.nasa.gov/mission/mars-polar-lander/" || source.url === "https://science.nasa.gov/mission/deep-space-2/") return { ...source, label: "NASA Science — Mars Polar Lander / Deep Space 2", url: "https://science.nasa.gov/mission/mars-polar-lander-deep-space-2/" };
    return source;
  });
  // The 2012 lunar inventory cannot substantiate hardware delivered after its cutoff.
  const existingSources = eq.planet === "moon" && yearOf(eq) > 2012
    ? retainedSources.filter((source) => source.url !== L.moonCatalogue.url)
    : retainedSources;
  const sourceUrls = new Set<string>();
  const sources = [...missionSources(eq), ...existingSources].filter((source) => {
    if (sourceUrls.has(source.url)) return false;
    sourceUrls.add(source.url);
    return true;
  });
  return {
    ...eq,
    asset: mappedAsset,
    components: variantComponents ?? eq.components,
    ...imagePresentation(eq.id, eq.image, eq),
    gallery: eq.gallery.map(publishedGalleryShot),
    record,
    downloads,
    sources,
    importance: eq.importance ?? LEGACY_IMPORTANCE[eq.id] ?? "major",
    country: eq.country ?? countryOfAgency(eq.agency),
    license:
      eq.license ??
      "NASA media usage guidelines: NASA imagery and models are generally not protected by copyright in the United States.",
  };
}

export const EQUIPMENT: Equipment[] = [
  ...MARS_EQUIPMENT,
  ...MARS_ARCHIVE,
  ...MOON_EQUIPMENT,
  ...MOON_ARCHIVE,
].map(normalize);

/* ------------------------------------------------------------------ */
/* Accessors — every record resolves to a complete, renderable shape.   */
/* ------------------------------------------------------------------ */
export const IMPORTANCE_LABEL: Record<Importance, string> = {
  iconic: "Iconic",
  major: "Major",
  archive: "Archive",
};

export const IMPORTANCE_TONE: Record<Importance, string> = {
  iconic: "text-gold border-gold/50 bg-gold/15",
  major: "text-cyan border-cyan/40 bg-cyan/10",
  archive: "text-slate-300 border-white/20 bg-white/5",
};

export function importanceOf(eq: Equipment): Importance {
  return eq.importance ?? "major";
}

const LEGACY_ASSET: Record<ModelKey, ArchiveKind> = {
  mer: "rover-6",
  msl: "rover-6",
  sojourner: "rover-4",
  lrv: "rover-4",
  lm: "descent-stage",
  surveyor: "lander",
  lunokhod: "rover-8",
  insight: "lander",
  phoenix: "lander",
  viking: "lander",
};

export function assetOf(eq: Equipment): Asset3D {
  if (eq.asset) return eq.asset;
  if (eq.model) {
    return {
      kind: eq.model,
      source: "reconstruction",
      note:
        eq.modelNote ??
        "Educational reconstruction built from published mission photography and engineering diagrams.",
    };
  }
  return {
    kind: LEGACY_ASSET.mer,
    source: "reconstruction",
    note: "Educational reconstruction built from published mission documentation.",
  };
}

export function componentsOf(eq: Equipment): ModelComponent[] {
  if (eq.components?.length) return eq.components;
  if (assetOf(eq).variant === "perseverance") return PERSEVERANCE_COMPONENTS;
  if (assetOf(eq).variant === "rotor-fragment") return ROTOR_FRAGMENT_COMPONENTS;
  if (eq.model) return MODEL_COMPONENTS[eq.model] ?? [];
  return KIND_COMPONENTS[assetOf(eq).kind as ArchiveKind] ?? [];
}

export function downloadsOf(eq: Equipment): Source[] {
  if (eq.downloads?.length) return eq.downloads;
  return [L.nasa3d, L.nasa3dGit];
}

export function yearOf(eq: Equipment): number {
  if (typeof eq.sortYear === "number") return eq.sortYear;
  const m = eq.years.match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}

export const FRAME_DEFAULT = {
  position: [4.4, 3.0, 5.2] as [number, number, number],
  target: [0, 0.9, 0] as [number, number, number],
  zoom: 1,
};

type Frame = typeof FRAME_DEFAULT;

/** Starting camera per family. FitCamera re-frames from the measured bounds afterwards. */
const FRAMES: Record<string, Frame> = {
  lm: { position: [7, 5, 8], target: [0, 2.3, 0], zoom: 1 },
  mer: { position: [3, 2.2, 3.8], target: [0, 0.85, 0], zoom: 1 },
  msl: { position: [4.2, 3, 5], target: [0, 1.2, 0], zoom: 1 },
  sojourner: { position: [1.5, 1.1, 1.8], target: [0, 0.32, 0], zoom: 1 },
  lrv: { position: [4.6, 2.8, 5.2], target: [0, 0.9, 0], zoom: 1 },
  surveyor: { position: [3.4, 2.4, 3.8], target: [0, 0.8, 0], zoom: 1 },
  lunokhod: { position: [3.8, 2.4, 4.2], target: [0, 0.6, 0], zoom: 1 },
  insight: { position: [3.8, 2.4, 4], target: [0, 0.6, 0], zoom: 1 },
  phoenix: { position: [3.6, 2.4, 3.8], target: [0, 0.6, 0], zoom: 1 },
  viking: { position: [4.2, 2.8, 4.4], target: [0, 1, 0], zoom: 1 },
  "descent-stage": { position: [7, 4.6, 7.6], target: [0, 1.4, 0], zoom: 1 },
  "ascent-stage": { position: [5, 3.4, 5.4], target: [0, 1.2, 0], zoom: 1 },
  "rover-6": { position: [3.2, 2.2, 3.6], target: [0, 0.7, 0], zoom: 1 },
  "rover-4": { position: [1.9, 1.3, 2.2], target: [0, 0.35, 0], zoom: 1 },
  "rover-8": { position: [4, 2.4, 4.2], target: [0, 0.6, 0], zoom: 1 },
  lander: { position: [3.2, 2.2, 3.6], target: [0, 0.8, 0], zoom: 1 },
  station: { position: [3, 1.9, 3.2], target: [0, 0.5, 0], zoom: 1 },
  instrument: { position: [1.7, 1.2, 1.9], target: [0, 0.35, 0], zoom: 1 },
  reflector: { position: [1.5, 1.1, 1.7], target: [0, 0.3, 0], zoom: 1 },
  "heat-shield": { position: [3.6, 2.2, 3.8], target: [0, 0.5, 0], zoom: 1 },
  backshell: { position: [3.4, 2.1, 3.6], target: [0, 0.6, 0], zoom: 1 },
  parachute: { position: [4.6, 3.2, 5], target: [0, 1.4, 0], zoom: 1 },
  skycrane: { position: [4.6, 2.8, 4.8], target: [0, 0.8, 0], zoom: 1 },
  helicopter: { position: [2, 1.4, 2.3], target: [0, 0.4, 0], zoom: 1 },
  impactor: { position: [2.4, 1.6, 2.6], target: [0, 0.6, 0], zoom: 1 },
  ballast: { position: [1.6, 1.1, 1.8], target: [0, 0.25, 0], zoom: 1 },
  wreck: { position: [3.4, 2.2, 3.8], target: [0, 0.35, 0], zoom: 1 },
};

export function frameOf(eq: Equipment): Frame {
  return FRAMES[eq.asset?.kind ?? eq.model ?? ""] ?? FRAME_DEFAULT;
}

export const CATEGORY_LABEL: Record<EquipmentCategory, string> = {
  rover: "Rovers",
  lander: "Landers",
  mobility: "Surface mobility",
  aircraft: "Aerial vehicles",
  instrument: "Scientific instruments",
};

export { STATUS_LABEL, STATUS_TONE } from "./equipment-status";

export const PLANET_LABEL: Record<Planet, string> = {
  moon: "The Moon",
  mars: "Mars",
};

export function getEquipment(id: string): Equipment | undefined {
  return EQUIPMENT.find((e) => e.id === id);
}

export function equipmentByPlanet(planet: Planet): Equipment[] {
  return EQUIPMENT.filter((e) => e.planet === planet);
}

const CHAPTER_META: {
  key: keyof Equipment["story"];
  title: string;
  kicker: string;
}[] = [
  { key: "beginning", title: "The Beginning", kicker: "Why it was built" },
  { key: "journey", title: "The Journey", kicker: "From Earth to another world" },
  { key: "landing", title: "The Landing", kicker: "The moment everything could fail" },
  { key: "mission", title: "The Mission", kicker: "What it did out there" },
  { key: "finalDays", title: "The Final Days", kicker: "How the mission ended" },
  { key: "legacy", title: "The Legacy", kicker: "Why it still matters" },
];

export function chaptersFor(eq: Equipment): ChapterBody[] {
  return CHAPTER_META.map((meta, i) => ({
    id: `${eq.id}-ch-${i + 1}`,
    number: String(i + 1).padStart(2, "0"),
    title: meta.title,
    kicker: meta.kicker,
    body: eq.story[meta.key],
    image: i === 2 ? eq.image : i === 4 ? eq.gallery[1]?.src : undefined,
    caption: i === 2 ? eq.imageCaption : undefined,
  }));
}

export function nextEquipment(id: string, planet?: Planet): Equipment {
  const list = planet ? equipmentByPlanet(planet) : EQUIPMENT;
  const idx = list.findIndex((e) => e.id === id);
  return list[(idx + 1) % list.length] ?? list[0];
}

export function prevEquipment(id: string, planet?: Planet): Equipment {
  const list = planet ? equipmentByPlanet(planet) : EQUIPMENT;
  const idx = list.findIndex((e) => e.id === id);
  return list[(idx - 1 + list.length) % list.length] ?? list[0];
}

export const TOTAL_EQUIPMENT = EQUIPMENT.length;
export const MOON_COUNT = equipmentByPlanet("moon").length;
export const MARS_COUNT = equipmentByPlanet("mars").length;
export const ICONIC_COUNT = EQUIPMENT.filter((e) => importanceOf(e) === "iconic").length;

export const COUNTRIES = Array.from(new Set(EQUIPMENT.map((e) => e.country ?? e.agency))).sort();

export function searchText(eq: Equipment): string {
  return [
    eq.name,
    eq.shortName,
    eq.mission,
    eq.planet === "moon" ? "moon lunar" : "mars",
    eq.country ?? "",
    eq.agency,
    eq.years,
    eq.site,
    eq.tagline,
    eq.summary,
    eq.category,
    eq.status,
    eq.record?.what ?? "",
  ]
    .join(" ")
    .toLowerCase();
}
