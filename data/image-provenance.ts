import type { Asset3D, Equipment, GalleryShot } from "./types";

const CLASS_SCHEMATICS = new Set<Asset3D["kind"]>([
  "descent-stage", "ascent-stage", "rover-6", "rover-4", "rover-8", "lander",
  "station", "instrument", "reflector", "impactor", "ballast", "skycrane",
]);

/** Describes the geometry actually rendered, independently of downloadable agency assets. */
export function modelRepresentationLabel(asset: Asset3D): string {
  if (asset.variant === "rotor-fragment") return "Illustrative fragment reconstruction";
  if (asset.kind === "wreck") return "Illustrative debris arrangement";
  if (asset.kind === "parachute") return "Deployed parachute schematic";
  if (CLASS_SCHEMATICS.has(asset.kind) && !asset.variant) return "Hardware class schematic";
  return "Educational reconstruction · not flight CAD";
}

export function modelRepresentationNote(asset: Asset3D): string {
  if (asset.variant === "easep") return "The solar-powered seismic unit and passive reflector are shown as separately deployed packages. Their spacing is illustrative; EASEP had no ALSEP radioisotope generator.";
  if (asset.variant === "zhurong" || asset.variant === "yutu" || asset.variant === "pragyan") return "The solar array layout and camera placement identify this rover family. Wheel tread, fittings, scientific instruments, dimensions and final surface condition remain simplified; consult the credited mission photos and diagrams.";
  if (asset.variant === "foil-collector") return "Operating-state foil on its support pole. The exposed foil was returned to Earth; the model does not show hardware currently left on the Moon.";
  if (asset.variant === "penetrator") return "The two-body probe is shown assembled to explain its parts. It had no landing engine or dish, and its actual impact state is unknown.";
  if (asset.variant === "petal-capsule") return "A deployed capsule with four opening petals and a scanning-camera arrangement. Camera, antenna and shell details differ between missions and remain schematic.";
  if (asset.variant === "airbag-platform") return "The central face and three opening petals are shown after touchdown. Petal angles, cables and airbags are schematic; detached airbags have separate archive records.";
  if (asset.variant === "rotor-fragment") return "Only a detached blade segment is shown. The fracture outline, layer thickness and resting orientation are illustrative.";
  if (asset.kind === "wreck") return "The scattered pieces illustrate impact debris. Their positions and shapes are not a surveyed debris field.";
  if (asset.kind === "parachute") return "The canopy is shown deployed to explain its function. Its final surface shape and the displayed bag placement are not documented by this model.";
  if (CLASS_SCHEMATICS.has(asset.kind) && !asset.variant) return "A shared class model explains broad parts and function. Mission-specific layout, instruments, dimensions and final surface condition may differ; consult the written record and credited sources.";
  return "The displayed geometry is hand-built for education. Small fittings, material layers and dimensions are simplified, and the pose illustrates operation rather than documenting the final surface condition.";
}

/** Describes the existing local files, using the NASA IDs in nasa-credits.json. */
const PHOTOS: Record<string, { caption: string; credit: string; subjects?: string[]; siteFor?: string[] }> = {
  "/images/opportunity.jpg": {
    caption: "Opportunity's enhanced-color Marathon Valley panorama at Endeavour Crater, April–May 2016 (NASA PIA20750).",
    credit: "NASA/JPL-Caltech/Cornell Univ./Arizona State Univ.",
    siteFor: ["opportunity"],
  },
  "/images/spirit.jpg": {
    caption: "Spirit's McMurdo panorama from Low Ridge, where the rover stayed during April–October 2006 (NASA PIA16440).",
    credit: "NASA/JPL-Caltech/Cornell Univ./Arizona State Univ.",
    siteFor: ["spirit"],
  },
  "/images/curiosity.jpg": {
    caption: "Curiosity's MAHLI self-portrait at the John Klein drilling site, 3 February 2013 (NASA PIA16764).",
    credit: "NASA/JPL-Caltech/MSSS", subjects: ["curiosity"],
  },
  "/images/perseverance.jpg": {
    caption: "Perseverance's selfie with Ingenuity, taken by the rover's WATSON camera on 6 April 2021 (NASA PIA24542).",
    credit: "NASA/JPL-Caltech/MSSS", subjects: ["perseverance", "ingenuity"],
  },
  "/images/sojourner.jpg": {
    caption: "Full-scale ground models of Sojourner, Spirit/Opportunity and Curiosity, showing their relative sizes (NASA PIA11436).",
    credit: "NASA/JPL-Caltech",
  },
  "/images/ingenuity.jpg": {
    caption: "Artist's illustration of Ingenuity flying on Mars, published before its first flight (NASA PIA24466).",
    credit: "NASA/JPL-Caltech",
  },
  "/images/lrv.jpg": {
    caption: "A Lunar Roving Vehicle photographed during Apollo 16 (NASA 0102627).",
    credit: "NASA/MSFC", subjects: ["apollo-lrv"],
  },
  "/images/lunar-module.jpg": {
    caption: "Buzz Aldrin beside a leg of Lunar Module Eagle, photographed by Neil Armstrong on 20 July 1969 (NASA AS11-40-5902).",
    credit: "NASA/JSC", subjects: ["apollo-lunar-module"],
  },
  "/images/surveyor.jpg": {
    caption: "Surveyor 3 in its crater, photographed during Apollo 12's second moonwalk on 20 November 1969 (NASA AS12-48-7121).",
    credit: "NASA/JSC", subjects: ["surveyor-3"],
  },
  "/images/lunokhod.jpg": {
    caption: "Luna 17's lander in Mare Imbrium, where it delivered Lunokhod 1 in November 1970, imaged by LRO (NASA PIA12967).",
    credit: "NASA/GSFC/Arizona State University", subjects: ["luna-17-lander"], siteFor: ["lunokhod-1"],
  },
  "/images/viking.jpg": {
    caption: "Viking 2's first picture after its September 1976 landing; Viking 1 had already returned surface images in July (NASA PIA00396).",
    credit: "NASA/JPL", siteFor: ["viking-2"],
  },
  "/images/insight.jpg": {
    caption: "Artist's concept of the InSight lander and its deployed instruments, August 2015 (NASA PIA19811).",
    credit: "NASA/JPL-Caltech",
  },
  "/images/phoenix.jpg": {
    caption: "Technicians attach a crane to Phoenix during spacecraft processing at Kennedy Space Center, before launch (NASA KSC-07PD-1085).",
    credit: "NASA/KSC", subjects: ["phoenix"],
  },
  "/images/zhurong.jpg": {
    caption: "HiRISE orbital view of Utopia Planitia terrain that Zhurong might explore, published in 2021 (NASA PIA24914).",
    credit: "NASA/JPL-Caltech/University of Arizona",
  },
  "/images/mars-surface.jpg": {
    caption: "Curiosity's full-circle vista from Naukluft Plateau in Gale Crater, 4 April 2016 (NASA PIA20332).",
    credit: "NASA/JPL-Caltech/MSSS",
  },
  "/images/moon-surface.jpg": {
    caption: "Apollo 17 Lunar Ejecta and Meteorites Experiment hardware, photographed before the mission in November 1972 (NASA S72-37257).",
    credit: "NASA/JSC",
  },
  "/images/apollo-footprint.jpg": {
    caption: "An Apollo 11 bootprint in the lunar soil, July 1969 (NASA AS11-40-5877).",
    credit: "NASA/KSC",
  },
  "/images/earthrise.jpg": {
    caption: "Earth above the lunar horizon, photographed from Apollo 8 on 24 December 1968 (NASA AS08-14-2383).",
    credit: "NASA/JSC",
  },
  "/images/mars-horizon.jpg": {
    caption: "Martian rock rows and Mount Sharp, photographed by Curiosity in Gale Crater (NASA PIA17947).",
    credit: "NASA/JPL-Caltech",
  },
  "/images/lunar-closeup.jpg": {
    caption: "A fresh crater on the southwest rim of Metius B, photographed from lunar orbit by LRO (NASA PIA12915).",
    credit: "NASA/GSFC/Arizona State University",
  },
};

/** Reused imagery describes its real subject rather than inheriting the record's site. */
export function imagePresentation(id: string, src: string, fallback: Pick<Equipment, "imageCaption" | "imageCredit" | "imageKind">): Pick<Equipment, "imageCaption" | "imageCredit" | "imageKind"> {
  const photo = PHOTOS[src];
  if (!photo) return fallback;
  const imageKind = photo.subjects?.includes(id) ? "artifact" : photo.siteFor?.includes(id) ? "site" : "representative";
  const prefix = imageKind === "representative" ? "Representative image: " : imageKind === "site" ? "Site image: " : "";
  return { imageCaption: prefix + photo.caption, imageCredit: photo.credit, imageKind };
}

export function publishedGalleryShot(shot: GalleryShot): GalleryShot {
  const photo = PHOTOS[shot.src];
  return photo ? { ...shot, caption: photo.caption, credit: photo.credit } : shot;
}
