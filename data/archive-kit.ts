import type {
  ArchiveKind,
  Asset3D,
  Discovery,
  Equipment,
  EquipmentCategory,
  EquipmentStatus,
  GalleryShot,
  Importance,
  ModelComponent,
  Planet,
  RecordStory,
  Source,
} from "./types";
import { imagePresentation, publishedGalleryShot } from "./image-provenance";

/* ------------------------------------------------------------------ */
/* Source library — every URL here is a real, citable destination.      */
/* ------------------------------------------------------------------ */
export const L = {
  moonCatalogue: {
    label: "NASA — Catalogue of Manmade Material on the Moon (2012)",
    url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf",
  } as Source,
  lroc: {
    label: "LROC — Lunar Reconnaissance Orbiter Camera",
    url: "https://lroc.im-ldi.com/",
  } as Source,
  lpi: {
    label: "Lunar and Planetary Institute — lunar science archive",
    url: "https://www.lpi.usra.edu/lunar/",
  } as Source,
  moon: { label: "NASA Science — The Moon", url: "https://science.nasa.gov/moon/" } as Source,
  mars: { label: "NASA Science — Mars", url: "https://science.nasa.gov/mars/" } as Source,
  apollo: {
    label: "NASA — Apollo program mission records",
    url: "https://www.nasa.gov/the-apollo-program/",
  } as Source,
  pds: { label: "NASA Planetary Data System", url: "https://pds.nasa.gov/" } as Source,
  photojournal: {
    label: "NASA/JPL Photojournal",
    url: "https://photojournal.jpl.nasa.gov/",
  } as Source,
  images: {
    label: "NASA Image and Video Library",
    url: "https://images.nasa.gov/",
  } as Source,
  svs: { label: "NASA Scientific Visualization Studio", url: "https://svs.gsfc.nasa.gov/" } as Source,
  nasa3d: {
    label: "NASA 3D Resources — model index",
    url: "https://science.nasa.gov/3d-resources/",
  } as Source,
  nasa3dGit: {
    label: "NASA 3D Resources on GitHub (public domain)",
    url: "https://github.com/nasa/NASA-3D-Resources",
  } as Source,
  marsArtefacts: {
    label: "Space Artefacts — manmade objects on Mars",
    url: "https://spaceartefacts.com/human-objects-on-mars",
  } as Source,
  isro: { label: "ISRO — Indian Space Research Organisation", url: "https://www.isro.gov.in/" } as Source,
  esa: { label: "ESA — European Space Agency", url: "https://www.esa.int/" } as Source,
  jaxa: { label: "JAXA — Japan Aerospace Exploration Agency", url: "https://global.jaxa.jp/" } as Source,
  cnsa: { label: "CNSA — China National Space Administration", url: "https://www.cnsa.gov.cn/english/" } as Source,
  roscosmos: { label: "Roscosmos — Russian space programme", url: "https://roscosmos.ru/" } as Source,
} as const;

/** Official agency 3D models, as published by NASA. */
export const M3D = {
  lm: {
    label: "NASA 3D model — Apollo Lunar Module",
    url: "https://science.nasa.gov/3d-resources/apollo-lunar-module/",
  } as Source,
  viking: {
    label: "NASA 3D model — Viking Lander",
    url: "https://science.nasa.gov/3d-resources/viking-lander/",
  } as Source,
  perseverance: {
    label: "NASA 3D model — Mars 2020 Perseverance rover",
    url: "https://science.nasa.gov/3d-resources/mars-2020-perseverance-rover/",
  } as Source,
  mer: {
    label: "NASA 3D model — Spirit and Opportunity rover",
    url: "https://science.nasa.gov/resource/spirit-and-opportunity-rover-3d-model/",
  } as Source,
  curiosity: {
    label: "NASA 3D model — Curiosity rover",
    url: "https://science.nasa.gov/resource/curiosity-rover-3d-model/",
  } as Source,
  insight: {
    label: "NASA 3D model — InSight lander",
    url: "https://science.nasa.gov/resource/insight-lander-3d-model/",
  } as Source,
} as const;

/** A real NASA image-library search for the object, not an invented deep link. */
export function imageSearch(query: string): Source {
  return {
    label: `NASA image library — “${query}”`,
    url: `https://images.nasa.gov/search?q=${encodeURIComponent(query)}`,
  };
}

/* ------------------------------------------------------------------ */
/* Image pool. Nothing here is presented as a photograph of an object  */
/* that has never been photographed: imageKind drives the UI label.    */
/* ------------------------------------------------------------------ */
export const POOL = {
  moonLM: "/images/lunar-module.jpg",
  moonSurface: "/images/moon-surface.jpg",
  moonFootprint: "/images/apollo-footprint.jpg",
  moonCloseup: "/images/lunar-closeup.jpg",
  moonEarthrise: "/images/earthrise.jpg",
  moonLRV: "/images/lrv.jpg",
  moonSurveyor: "/images/surveyor.jpg",
  moonLunokhod: "/images/lunokhod.jpg",
  marsSurface: "/images/mars-surface.jpg",
  marsHorizon: "/images/mars-horizon.jpg",
  marsCuriosity: "/images/curiosity.jpg",
  marsOpportunity: "/images/opportunity.jpg",
  marsSpirit: "/images/spirit.jpg",
  marsPerseverance: "/images/perseverance.jpg",
  marsSojourner: "/images/sojourner.jpg",
  marsIngenuity: "/images/ingenuity.jpg",
  marsViking: "/images/viking.jpg",
  marsInsight: "/images/insight.jpg",
  marsPhoenix: "/images/phoenix.jpg",
  marsZhurong: "/images/zhurong.jpg",
} as const;

/** Terrain context frame for objects that have never been photographed up close. */
export function contextFrame(planet: Planet): { image: string; caption: string; credit: string } {
  return planet === "moon"
    ? {
        image: POOL.moonCloseup,
        caption:
          "Representative terrain: a fresh crater on the southwest rim of Metius B, imaged by LRO (NASA PIA12915). This is not a photograph of the object's landing site.",
        credit: "NASA/GSFC/Arizona State University",
      }
    : {
        image: POOL.marsSurface,
        caption:
          "Representative terrain: Curiosity's Naukluft Plateau panorama in Gale Crater, 4 April 2016 (NASA PIA20332). This is not a photograph of the object's landing site.",
        credit: "NASA/JPL-Caltech/MSSS",
      };
}

/* ------------------------------------------------------------------ */
/* Per-family component documentation                                  */
/* ------------------------------------------------------------------ */
export const KIND_COMPONENTS: Record<ArchiveKind, ModelComponent[]> = {
  "descent-stage": [
    { id: "structure", label: "Descent stage structure", group: "Structure", description: "Octagonal aluminium and titanium frame that carried the fuel, oxidiser and the ascent stage above it." },
    { id: "engine", label: "Descent engine", group: "Propulsion", description: "Throttleable ablative-cooled engine used for the final powered descent." },
    { id: "legs", label: "Landing legs and footpads", group: "Landing gear", description: "Four legs with crushable struts and large footpads that absorbed the touchdown and kept the stage level." },
    { id: "ladder", label: "Access ladder", group: "Operations", description: "Nine-rung ladder on the forward leg that the crew used to reach the surface for the first time." },
    { id: "bay", label: "Equipment bay", group: "Payload", description: "Quadrant bay that held the experiment package, tools or, on later flights, the folded lunar roving vehicle." },
  ],
  "ascent-stage": [
    { id: "cabin", label: "Crew cabin", group: "Structure", description: "Pressurised cabin with the flight controls, windows and crew stations; the only part designed to leave the surface." },
    { id: "engine", label: "Ascent engine", group: "Propulsion", description: "Fixed-thrust engine that launched the cabin back into lunar orbit." },
    { id: "antenna", label: "S-band antenna", group: "Communications", description: "Steerable antenna for voice, telemetry and television from the surface and during ascent." },
    { id: "window", label: "Triangular windows", group: "Crew", description: "Forward and overhead windows used to judge the landing and to see the horizon for attitude reference." },
  ],
  "rover-6": [
    { id: "body", label: "Warm electronics box", group: "Structure", description: "Insulated body housing the computer, avionics and heaters for the Martian night." },
    { id: "wheels", label: "Six wheels and rocker-bogie", group: "Mobility", description: "Six independently driven aluminium wheels on a passive rocker-bogie suspension that keeps all wheels loaded." },
    { id: "mast", label: "Camera mast", group: "Sensing", description: "Mast carrying the navigation and science cameras above the deck for a clean view of the terrain." },
    { id: "deck", label: "Instrument deck", group: "Payload", description: "Upper deck with the remote-sensing instruments, sample handling and the high-gain antenna." },
    { id: "antenna", label: "High-gain antenna", group: "Communications", description: "Steerable dish used for direct-to-Earth downlink of images and telemetry." },
  ],
  "rover-4": [
    { id: "body", label: "Body and avionics", group: "Structure", description: "Compact chassis containing the computer, batteries and thermal control." },
    { id: "wheels", label: "Four drive wheels", group: "Mobility", description: "Four wheels on a simple suspension, each with its own motor and grousers for soft soil." },
    { id: "solar", label: "Solar array", group: "Power", description: "Photovoltaic panel that recharged the batteries during the Martian or lunar day." },
    { id: "mast", label: "Camera mast", group: "Sensing", description: "Short mast carrying the navigation and panoramic cameras." },
  ],
  "rover-8": [
    { id: "body", label: "Pressurised tub", group: "Structure", description: "Sealed instrument container kept warm by a radioisotope heater and by closing its lid at night." },
    { id: "lid", label: "Hinged solar lid", group: "Power", description: "Solar panel lid that opened to generate power by day and closed to conserve heat by night." },
    { id: "wheels", label: "Eight wheels", group: "Mobility", description: "Eight independently driven wire-mesh wheels, each with its own motor and brake." },
    { id: "antenna", label: "Cone antenna", group: "Communications", description: "Low-gain helical antenna used for the television link that the ground crew drove the rover through." },
    { id: "boom", label: "Instrument booms", group: "Payload", description: "Deployable arms carrying the spectrometer, penetrometer and soil sampler to the ground." },
  ],
  lander: [
    { id: "body", label: "Lander body", group: "Structure", description: "Main bus holding the avionics, batteries and payload, insulated against the extreme day-night cycle." },
    { id: "legs", label: "Landing legs", group: "Landing gear", description: "Legs with crushable shock absorbers sized to the touchdown velocity of this particular vehicle." },
    { id: "engine", label: "Terminal descent engine", group: "Propulsion", description: "Engine or retro-rocket cluster that reduced the final descent velocity to a survivable touchdown." },
    { id: "dish", label: "Communications antenna", group: "Communications", description: "Antenna used to send data directly to Earth, sometimes relayed through an orbiter." },
    { id: "deck", label: "Payload deck", group: "Payload", description: "Upper structure carrying cameras, weather sensors and solar panels." },
  ],
  station: [
    { id: "station", label: "Central station", group: "Structure", description: "Hub that supplied power and a data link to every experiment deployed around it." },
    { id: "antenna", label: "Antenna and data link", group: "Communications", description: "Antenna that returned experiment data to Earth, often through a relay satellite." },
    { id: "power", label: "Radioisotope power source", group: "Power", description: "Long-lived power unit that kept the instruments running through the two-week lunar night." },
    { id: "boom", label: "Sensor booms", group: "Payload", description: "Short masts that lifted magnetometers and wind sensors clear of the station itself." },
    { id: "cable", label: "Surface cabling", group: "Payload", description: "Ribbon cables that ran power and data to the experiments placed metres away." },
  ],
  instrument: [
    { id: "box", label: "Instrument housing", group: "Structure", description: "Thermally controlled enclosure for the sensors and their electronics." },
    { id: "sensor", label: "Sensor head", group: "Payload", description: "The detecting element — seismometer, spectrometer, camera or antenna — pointed at its target." },
    { id: "antenna", label: "Data antenna", group: "Communications", description: "Short-range radio link or cable that carried readings to the central station." },
    { id: "cable", label: "Power cable", group: "Power", description: "Cable supplying power from the central station or its own small solar panel." },
  ],
  reflector: [
    { id: "array", label: "Corner-cube array", group: "Payload", description: "Array of fused-silica corner cubes that reflect a laser straight back to the station that fired it." },
    { id: "frame", label: "Mounting frame", group: "Structure", description: "Aluminium frame that holds every cube at the correct angle for ranging from Earth." },
    { id: "base", label: "Levelling base", group: "Landing gear", description: "Base that keeps the array pointed near the Earth's position in the lunar sky." },
  ],
  "heat-shield": [
    { id: "shield", label: "Ablative heat shield", group: "Thermal protection", description: "The aeroshell's front face, built from ablator that charred and carried heat away during entry." },
    { id: "rim", label: "Rim and structure", group: "Structure", description: "Composite shell and ring that held the ablator in place under several g of deceleration." },
    { id: "interior", label: "Interior ribs", group: "Structure", description: "Internal stiffening ribs, exposed once the shield came to rest on the surface." },
  ],
  backshell: [
    { id: "shell", label: "Backshell cone", group: "Structure", description: "Aeroshell's rear cover, protecting the parachute and the top of the payload during entry." },
    { id: "rim", label: "Separation ring", group: "Structure", description: "Ring joint that released the backshell from the heat shield before parachute deployment." },
    { id: "vent", label: "Vent and parachute port", group: "Payload", description: "Opening through which the parachute was deployed; the packed canopy sat directly above it." },
  ],
  parachute: [
    { id: "canopy", label: "Parachute canopy", group: "Deceleration", description: "Schematic canopy illustrating atmospheric deceleration. Several NASA Mars missions used a disk-gap-band design; the exact canopy construction differs by mission." },
    { id: "lines", label: "Suspension lines", group: "Deceleration", description: "Tens of metres of lines that spread the load from the canopy into the riser." },
    { id: "riser", label: "Riser", group: "Deceleration", description: "Main load path between the canopy and the backshell, cut at the moment of touchdown or release." },
    { id: "bag", label: "Deployment bag", group: "Deceleration", description: "Bag and mortar assembly that pulled the canopy out cleanly at supersonic speed." },
  ],
  skycrane: [
    { id: "structure", label: "Descent stage structure", group: "Structure", description: "Propulsive descent stage that carried the rover from the backshell to the surface." },
    { id: "thrusters", label: "Thruster cluster", group: "Propulsion", description: "Eight throttleable engines that held a controlled hover during the sky-crane manoeuvre." },
      { id: "legs", label: "Engine support structure", group: "Structure", description: "Schematic braces supporting the engine assemblies. The sky-crane descent stage had no landing legs; it flew away after releasing the rover and impacted the surface." },
    { id: "bridle", label: "Bridle and umbilicals", group: "Operations", description: "Nylon bridle and power/data cable that lowered the rover before being cut." },
  ],
  helicopter: [
    { id: "body", label: "Fuselage", group: "Structure", description: "Ultra-light carbon-fibre box holding the avionics, batteries and flight computer." },
    { id: "rotor", label: "Coaxial rotors", group: "Flight", description: "Two counter-rotating rotor pairs that generate lift in an atmosphere roughly 1% as dense as Earth's." },
    { id: "legs", label: "Landing legs", group: "Landing gear", description: "Four flexible legs that absorbed the landing loads on rocky ground." },
    { id: "panel", label: "Solar panel", group: "Power", description: "Panel above the rotors that recharged the batteries between flights." },
  ],
  impactor: [
    { id: "bus", label: "Schematic hardware body", group: "Structure", description: "A simple body indicates the broad hardware class. It does not establish a penetrator, antenna, engine layout or surviving debris shape for this record." },
  ],
  ballast: [
    { id: "block", label: "Tungsten mass", group: "Payload", description: "Dense metal block jettisoned before entry to trim the centre of mass of the entry vehicle." },
    { id: "bracket", label: "Release bracket", group: "Structure", description: "Pyrotechnic bracket that held the mass until the commanded release." },
  ],
  wreck: [
    { id: "debris", label: "Scattered debris", group: "Structure", description: "Fragments of the entry system and lander, spread over the impact ellipse." },
    { id: "structure", label: "Crumpled structure", group: "Structure", description: "Deformed structural members that show the energy the hardware absorbed on arrival." },
    { id: "panel", label: "Solar panels and covers", group: "Power", description: "Panels and covers that separated from the body during the failure." },
    { id: "engine", label: "Propulsion hardware", group: "Propulsion", description: "Engine and tankage, often the most recognisable pieces found by orbital imaging." },
  ],
};

/* ------------------------------------------------------------------ */
/* Record input shape and builder                                      */
/* ------------------------------------------------------------------ */
export type Trio = [string, string, string];

export interface ArchiveRec {
  id: string;
  name: string;
  short?: string;
  cat: EquipmentCategory;
  status: EquipmentStatus;
  imp: Importance;
  mission: string;
  agency: string;
  country: string;
  years: string;
  landed: string;
  site: string;
  image?: string;
  imgCredit?: string;
  imgCaption?: string;
  imgKind?: "artifact" | "site" | "representative";
  tagline: string;
  summary: string;
  mass?: string;
  power?: string;
  distance?: string;
  duration?: string;
  specs: [string, string][];
  instruments: string[];
  objectives: string[];
  disc: Trio[];
  what: string;
  history: string;
  journey: string;
  landing: string;
  fate: string;
  legacy: string;
  sources: Source[];
  asset: Asset3D;
  components?: ModelComponent[];
  downloads?: Source[];
  gallery?: GalleryShot[];
  luffy?: { text: string }[];
  confidence?: "verified" | "reconstruction";
}

const DEFAULT_LUFFY: Record<Importance, string[]> = {
  iconic: [
    "This is one of the machines that changed what humanity thought it could do.",
    "Spin it around in the 3D view — the parts are labelled, so you can see exactly what was left behind.",
  ],
  major: [
    "Real hardware with a place in another world's exploration history.",
    "Open the 3D model and switch to exploded view to see how it was put together.",
  ],
  archive: [
    "Small object, real history. This is one of the pieces most catalogues skip.",
    "The 3D view shows the hardware class it belongs to, based on published dimensions.",
  ],
};

function parseYear(years: string): number {
  const m = years.match(/\d{4}/);
  return m ? Number(m[0]) : 0;
}

/** Use explicitly labelled specifications; absence is not evidence of passive hardware. */
function specification(r: ArchiveRec, labels: RegExp): string | undefined {
  const row = r.specs.find(([label]) => labels.test(label));
  return row ? (row[0] === "Mass" || row[0] === "Power" ? row[1] : `${row[1]} (${row[0].toLowerCase()})`) : undefined;
}

export function buildRecords(planet: Planet, recs: ArchiveRec[]): Equipment[] {
  const ctx = contextFrame(planet);
  return recs.map((r) => {
    const record: RecordStory = {
      what: r.what,
      history: r.history,
      journey: r.journey,
      landing: r.landing,
      fate: r.fate,
      legacy: r.legacy,
    };
    const gallery: GalleryShot[] =
      r.gallery ??
      [
        {
          src: r.image ?? ctx.image,
          caption: r.imgCaption ?? ctx.caption,
          credit: r.imgCredit ?? ctx.credit,
        },
        { src: ctx.image, caption: ctx.caption, credit: ctx.credit },
      ];
    return {
      id: r.id,
      name: r.name,
      shortName: r.short ?? r.name,
      planet,
      category: r.cat,
      status: r.status,
      mission: r.mission,
      agency: r.agency,
      country: r.country,
      years: r.years,
      landed: r.landed,
      site: r.site,
      image: r.image ?? ctx.image,
      ...imagePresentation(r.id, r.image ?? ctx.image, {
        imageCredit: r.imgCredit ?? ctx.credit,
        imageCaption: r.imgCaption ?? ctx.caption,
        imageKind: r.imgKind ?? "representative",
      }),
      tagline: r.tagline,
      summary: r.summary,
      asset: r.asset,
      components: r.components ?? KIND_COMPONENTS[r.asset.kind as ArchiveKind] ?? [],
      downloads: r.downloads ?? [L.nasa3d, L.nasa3dGit],
      license:
        "NASA media usage guidelines: NASA imagery and models are generally not protected by copyright in the United States. Educational reconstruction geometry is released for non-commercial reuse.",
      importance: r.imp,
      mass: r.mass ?? specification(r, /^(?:Mass|Mass at landing|Mass at touchdown|Dry mass|Descent stage dry mass|Mass per unit)$/i) ?? "Mass not established for this object",
      power: r.power ?? specification(r, /^Power$/i) ?? (r.asset.kind === "reflector" ? "No electrical power — passive laser reflector" : "Power specification not established for this object"),
      distance: r.distance,
      duration: r.duration ?? specification(r, /^(?:Operational life|Operational lifetime|Surface stay|Duration|Lifetime|Design life)$/i) ?? "Operational duration not established for this object",
      specs: [
        { label: "Record type", value: r.cat === "instrument" ? "Instrument or hardware component" : "Vehicle or mission hardware" },
        ...r.specs.map(([label, value]) => ({ label, value })),
      ],
      instruments: r.instruments,
      objectives: r.objectives,
      discoveries: r.disc.map<Discovery>(([title, year, body]) => ({ title, year, body })),
      story: {
        beginning: [r.history],
        journey: [r.journey],
        landing: [r.landing],
        mission: [r.what],
        finalDays: [r.fate],
        legacy: [r.legacy],
      },
      record,
      gallery: gallery.map(publishedGalleryShot),
      luffy: (r.luffy ?? DEFAULT_LUFFY[r.imp].map((text) => ({ text }))).map((g) => ({
        text: g.text,
        expression: r.imp === "iconic" ? ("wow" as const) : ("curious" as const),
        pose: "point" as const,
      })),
      sources: r.sources,
      confidence: r.confidence ?? "verified",
      sortYear: parseYear(r.years),
    };
  });
}
