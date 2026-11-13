export type Planet = "moon" | "mars";

export type EquipmentCategory =
  | "rover"
  | "lander"
  | "mobility"
  | "aircraft"
  | "instrument";

export type EquipmentStatus = "active" | "inactive" | "destroyed" | "unknown";

export type ModelKey =
  | "mer"
  | "msl"
  | "sojourner"
  | "lrv"
  | "lm"
  | "surveyor"
  | "lunokhod"
  | "insight"
  | "phoenix"
  | "viking";

/**
 * Historical importance, used to prioritise the archive and to decide which
 * records get the deepest documentation.
 */
export type Importance = "iconic" | "major" | "archive";

/**
 * Geometry families for the parametric 3D archive. Each family is a distinct
 * hardware class (a 6-wheel rover, a heat shield, a parachute…) and every record
 * picks one, with explicit variants where a family needs a different shape.
 */
export type ArchiveKind =
  | "descent-stage"
  | "ascent-stage"
  | "rover-6"
  | "rover-4"
  | "rover-8"
  | "lander"
  | "station"
  | "instrument"
  | "reflector"
  | "heat-shield"
  | "backshell"
  | "parachute"
  | "skycrane"
  | "helicopter"
  | "impactor"
  | "ballast"
  | "wreck";

/** A record's 3D representation: geometry family plus the parameters that make it specific. */
export interface Asset3D {
  kind: ModelKey | ArchiveKind;
  /** Distinct hardware within a shared geometry family; never inferred from prose. */
  variant?: "walking-rover" | "spherical-rover" | "sample-depot" | "airbags" | "cover" | "cradle" | "terminal-stage" | "seismometer" | "rotor-fragment" | "perseverance"
    | "petal-capsule" | "airbag-platform" | "flag" | "tripod-camera" | "foil-collector" | "penetrator" | "sample-ascent" | "heat-probe"
    | "clamshell-lander" | "slim-lander" | "sample-lander" | "ranger" | "spherical-probe" | "upper-stage" | "zhurong" | "yutu" | "pragyan" | "easep";
  /** "official" only when a genuine agency-published model of this object exists. */
  source: "official" | "reconstruction";
  note: string;
  /** Hex accent used for the machine's housings. */
  tone?: string;
  legs?: number;
  wheels?: number;
  panels?: number;
  cameras?: number;
  span?: number;
  height?: number;
  dish?: boolean;
}

/** Long-form sections of a full equipment record. */
export interface RecordStory {
  what: string;
  history: string;
  journey: string;
  landing: string;
  fate: string;
  legacy: string;
}

export type Pose = "idle" | "wave" | "point" | "think";
export type Expression = "grin" | "wow" | "curious" | "proud" | "serious";

export interface GuideLine {
  text: string;
  expression?: Expression;
  pose?: Pose;
}

export interface Source {
  label: string;
  url: string;
  note?: string;
}

export interface SpecRow {
  label: string;
  value: string;
}

export interface Discovery {
  title: string;
  body: string;
  year?: string;
}

export interface ChapterBody {
  id: string;
  number: string;
  title: string;
  kicker: string;
  body: string[];
  image?: string;
  caption?: string;
}

export interface GalleryShot {
  src: string;
  caption: string;
  credit: string;
}

export interface ModelComponent {
  id: string;
  label: string;
  group: string;
  description: string;
  spec?: string;
}

export interface Equipment {
  id: string;
  name: string;
  shortName: string;
  planet: Planet;
  category: EquipmentCategory;
  status: EquipmentStatus;
  mission: string;
  agency: string;
  years: string;
  landed: string;
  site: string;
  image: string;
  imageCredit: string;
  imageCaption: string;
  tagline: string;
  summary: string;
  model?: ModelKey;
  modelNote?: string;
  /** Historical importance tier. Defaults to "major" for legacy records. */
  importance?: Importance;
  country?: string;
  asset?: Asset3D;
  components?: ModelComponent[];
  downloads?: Source[];
  license?: string;
  /** "artifact" = published photograph of this object; "site" = the terrain it sits on. */
  imageKind?: "artifact" | "site" | "representative";
  /** Full-record prose: overview, history, journey, landing, fate, legacy. */
  record?: RecordStory;
  /** Numeric sort key, derived from `years` when absent. */
  sortYear?: number;
  mass: string;
  power: string;
  distance?: string;
  duration: string;
  specs: SpecRow[];
  instruments: string[];
  objectives: string[];
  discoveries: Discovery[];
  story: {
    beginning: string[];
    journey: string[];
    landing: string[];
    mission: string[];
    finalDays: string[];
    legacy: string[];
  };
  gallery: GalleryShot[];
  luffy: GuideLine[];
  sources: Source[];
  confidence: "verified" | "reconstruction";
}

export type MarkerKind = "surface" | "rover" | "debris" | "impact" | "uncertain";

export interface LandingSite {
  id: string;
  name: string;
  planet: Planet;
  lat: number;
  lon: number;
  year: number;
  mission: string;
  kind: MarkerKind;
  status: string;
  equipmentId?: string;
  description: string;
  verified: boolean;
  coordinateSource: string;
  /** A discovery reference for the existing coordinate compilation, not a fresh measurement. */
  coordinateReference?: Source;
  /** Mission context must not be presented as evidence for the exact coordinates. */
  sources?: Source[];
}

export interface StatEntry {
  id: string;
  label: string;
  count: number | null;
  suffix?: string;
  kind: "published" | "estimate" | "counted";
  definition: string;
  source: string;
  sourceUrl: string;
  asOf: string;
}

export interface TimelineEvent {
  id: string;
  year: number;
  date: string;
  title: string;
  planet: Planet | "deep";
  agency: string;
  summary: string;
  equipmentId?: string;
  milestone: "first" | "major" | "end" | "ongoing";
  deepSpaceId?: string;
  sources?: Source[];
}

export interface KnowledgeCard {
  id: string;
  question: string;
  answer: string;
  category: string;
  luffy: GuideLine;
  source: Source;
}
