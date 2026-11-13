import type { Planet, Source } from "./types";

export interface NASAResource extends Source {
  id: string;
  destination: "moon" | "mars" | "deep" | "all";
  kind: "mission" | "archive" | "platform";
  scope: string;
  access: string;
  use: string;
}

export const CHALLENGE_SOURCE: Source = {
  label: "NASA Space Apps 2026 — Discarded Equipment Storytelling resources",
  url: "https://www.spaceappschallenge.org/2026/challenges/nasas-discarded-equipment-storytelling/?tab=resources",
  note: "The challenge supplies research starting points. Each mission's actual destination and source content determine how it is used here.",
};

/** Preserve the challenge's original links alongside explicit corrections to its aliases. */
export const NASA_RESOURCES: NASAResource[] = [
  {
    ...CHALLENGE_SOURCE,
    id: "challenge", destination: "all", kind: "archive",
    scope: "The published challenge brief and resource list that inspired AFTERLIGHT.",
    access: "Public web page; no Space Apps API key is required.",
    use: "Connect the expedition and classroom research to the original challenge.",
  },
  {
    id: "nssdca", label: "NASA Space Science Data Coordinated Archive (NSSDCA)",
    url: "https://nssdc.gsfc.nasa.gov/", destination: "all", kind: "archive",
    scope: "Spacecraft and experiment catalogue records, identifiers and archived mission references.",
    access: "Public catalogue pages; service availability can vary. No NASA API key is needed for browsing.",
    use: "Trace a spacecraft identifier and distinguish its parent mission from hardware left on a surface.",
    note: "The catalogue is a research index, not a complete or live inventory of discarded equipment.",
  },
  {
    id: "open-data", label: "NASA Open Data Portal", url: "https://data.nasa.gov/",
    destination: "all", kind: "platform",
    scope: "Discover NASA datasets and their publishers, descriptions and distribution links.",
    access: "Public discovery; access and authentication depend on the dataset's provider.",
    use: "Find a dataset, inspect its metadata and document what it can support before using its numbers.",
    note: "AFTERLIGHT's catalogue remains curated locally; this portal does not supply a live equipment count.",
  },
  {
    id: "api", label: "NASA APIs", url: "https://api.nasa.gov/",
    destination: "all", kind: "platform",
    scope: "Documentation and access guidance for NASA's public API services.",
    access: "Many endpoints use a NASA API key; DEMO_KEY has limited quotas. The separate NASA Image and Video Library API is keyless.",
    use: "Learn how to select an endpoint, read its parameters and preserve returned source metadata.",
    note: "There is no challenge-specific Space Apps API key. AFTERLIGHT's offline image scripts use images-api.nasa.gov, not a keyed runtime feed.",
  },
  {
    id: "earthdata", label: "NASA Earthdata", url: "https://www.earthdata.nasa.gov/",
    destination: "all", kind: "platform",
    scope: "Earth observation data discovery, documentation and access services.",
    access: "Public documentation and discovery; many downloads and services require a free Earthdata Login.",
    use: "Compare how scientists document an Earth observation with a planetary image, including scale, instrument and processing.",
    note: "Earthdata is an Earth science research path, not a source of Moon or Mars equipment inventory totals.",
  },
  {
    id: "jpl", label: "NASA Jet Propulsion Laboratory", url: "https://www.jpl.nasa.gov/",
    destination: "all", kind: "platform",
    scope: "Robotic mission histories, engineering explanations, science reports and media.",
    access: "Public web pages; follow each image or dataset's credit and usage notice.",
    use: "Follow the engineering and science behind a mission, then cite the specific mission or image page.",
    note: "The JPL homepage is a research starting point, not evidence for an individual object's location.",
  },
  {
    id: "apollo-lm", label: "NSSDCA — Apollo 11 Lunar Module Eagle spacecraft record (1969-059C)",
    url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059C",
    destination: "moon", kind: "mission",
    scope: "The parent Apollo 11 lunar module spacecraft record supplied under the challenge's Lunar Module heading.",
    access: "Public catalogue page; if unavailable, use the linked NASA mission history.",
    use: "Connect Eagle's mission identity to its descent-stage story and separate the spacecraft from the hardware that remained.",
    note: "Parent spacecraft reference: not an individual descent-stage inventory record, engineering CAD or coordinate proof.",
  },
  {
    id: "lrv", label: "NSSDCA — Apollo 15 Lunar Module Falcon spacecraft record (1971-063C)",
    url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063C",
    destination: "moon", kind: "mission",
    scope: "The Apollo 15 parent spacecraft record linked under the challenge's Lunar Roving Vehicle heading.",
    access: "Public catalogue page; the Apollo Lunar Surface Journal supplies rover deployment context.",
    use: "Trace the mission that delivered the first crewed lunar rover, then examine the vehicle's separate history.",
    note: "This identifier describes Falcon, not a standalone LRV hardware record or proof of a rover's final coordinates.",
  },
  {
    id: "alsep", label: "NSSDCA — Apollo 12 Lunar Module Intrepid spacecraft record (1969-099C)",
    url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099C",
    destination: "moon", kind: "mission",
    scope: "The Apollo 12 parent spacecraft record linked under the challenge's ALSEP heading.",
    access: "Public catalogue page; the Apollo Lunar Surface Journal provides experiment and deployment context.",
    use: "Connect Intrepid's landing to the first full ALSEP station and investigate the experiment hardware separately.",
    note: "Parent spacecraft reference: not a standalone ALSEP record, instrument census or location measurement.",
  },
  {
    id: "surveyor", label: "NASA Science — Surveyor 3", url: "https://science.nasa.gov/mission/surveyor-3/",
    destination: "moon", kind: "mission",
    scope: "Surveyor 3's robotic lunar landing and its later visit by the Apollo 12 crew.",
    access: "Public NASA mission page; no key required.",
    use: "Explain a robot's landing, its science and why Apollo astronauts retrieved parts of it.",
    note: "Mission history supports the story; map coordinates need their own location evidence.",
  },
  {
    id: "pathfinder", label: "NASA Science — Mars Pathfinder", url: "https://science.nasa.gov/mission/mars-pathfinder/",
    destination: "mars", kind: "mission",
    scope: "The Pathfinder lander, Sojourner rover and their 1997 Mars mission.",
    access: "Public NASA mission page; no key required.",
    use: "Link Sojourner's mobility and science to the lander's airbag delivery system.",
    note: "Mission context is distinct from evidence identifying an individual discarded component.",
  },
  {
    id: "mer", label: "NASA Science — Mars Exploration Rovers Spirit and Opportunity",
    url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/",
    destination: "mars", kind: "mission",
    scope: "The twin rover mission, engineering, geological discoveries and eventual mission endings.",
    access: "Public NASA mission page; no key required.",
    use: "Compare two related machines whose landing sites and final chapters were different.",
    note: "A shared mission page does not make Spirit's photographs or coordinates evidence for Opportunity.",
  },
  {
    id: "viking", label: "NASA Science — Viking 1", url: "https://science.nasa.gov/mission/viking-1/",
    destination: "mars", kind: "mission",
    scope: "Viking 1's orbiter and lander, the 1976 landing and surface experiments.",
    access: "Public NASA mission page; no key required.",
    use: "Connect the first successful US Mars landing with its instruments and the limits of its life-detection results.",
    note: "This is the Viking 1 reference. Viking 2 records use their own mission page.",
  },
  {
    id: "phoenix", label: "NASA Science — Phoenix", url: "https://science.nasa.gov/mission/phoenix/",
    destination: "mars", kind: "mission",
    scope: "Phoenix's 2008 polar landing, soil and ice investigations, and seasonal loss of power.",
    access: "Public NASA mission page; no key required.",
    use: "Support Phoenix hardware and water-ice stories with the correct mission reference.",
    note: "The challenge's Phoenix label opens InSight. This separate official Phoenix page corrects that alias.",
  },
  {
    id: "insight", label: "NASA Science — InSight", url: "https://science.nasa.gov/mission/insight/",
    destination: "mars", kind: "mission",
    scope: "InSight's geophysical investigations of Mars and the dust-related end of its surface mission.",
    access: "Public NASA mission page; no key required.",
    use: "Connect the lander, deployed seismometer and heat-flow probe to their different scientific outcomes.",
    note: "The challenge links here for both InSight and Phoenix; this page describes InSight, not Phoenix.",
  },
  {
    id: "dawn", label: "NASA Science — Dawn", url: "https://science.nasa.gov/mission/dawn/",
    destination: "deep", kind: "mission",
    scope: "Dawn's ion-propelled exploration of Vesta and Ceres, ending in orbit around Ceres.",
    access: "Public NASA mission page; no key required.",
    use: "Show how propulsion enabled two orbital destinations and why the silent spacecraft remains at Ceres.",
    note: "Dawn belongs to the asteroid belt and Ceres, although the challenge groups its link under Mars resources.",
  },
  {
    id: "near", label: "NASA Science — NEAR Shoemaker", url: "https://science.nasa.gov/mission/near-shoemaker/",
    destination: "deep", kind: "mission",
    scope: "NEAR's study of asteroid Eros and its controlled landing after the orbital mission.",
    access: "Public NASA mission page; no key required.",
    use: "Tell how an orbiter became hardware resting on an asteroid and compare its ending with planetary landers.",
    note: "NEAR rests on Eros, not on Mars.",
  },
  {
    id: "pioneer-10", label: "NASA Science — Pioneer 10", url: "https://science.nasa.gov/mission/pioneer-10/",
    destination: "deep", kind: "mission",
    scope: "Pioneer 10's Jupiter flyby and outward trajectory after contact ended in 2003.",
    access: "Public NASA mission page; no key required.",
    use: "Explain how a silent flyby spacecraft keeps travelling and distinguish its history from Pioneer 11.",
    note: "The challenge's Pioneer 10 and Pioneer 11 labels both open this Pioneer 10 page.",
  },
  {
    id: "pioneer-11", label: "NASA Science — Pioneer 11", url: "https://science.nasa.gov/mission/pioneer-11/",
    destination: "deep", kind: "mission",
    scope: "Pioneer 11's Jupiter and Saturn flybys and the loss of contact in 1995.",
    access: "Public NASA mission page; no key required.",
    use: "Compare the two Pioneers using separate destinations, timelines and mission endings.",
    note: "This separate official mission page corrects the challenge's Pioneer 11 link to Pioneer 10.",
  },
  {
    id: "ingenuity", label: "NASA Science — Ingenuity Mars Helicopter",
    url: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/",
    destination: "mars", kind: "mission",
    scope: "The helicopter technology demonstration carried by Perseverance and its 72-flight mission.",
    access: "Public NASA mission page; no key required.",
    use: "Connect rotor design, thin-air flight and the damaged hardware left after the final flight.",
    note: "The original challenge URL remains the working mission reference; precise final-site coordinates require separate evidence.",
  },
  {
    id: "kepler", label: "NASA Science — Kepler", url: "https://science.nasa.gov/mission/kepler/",
    destination: "deep", kind: "mission",
    scope: "Kepler and K2 exoplanet observations, engineering adaptation and retirement in 2018.",
    access: "Public NASA mission page; no key required.",
    use: "Connect a space telescope's hardware limits to its planet discoveries and its Earth-trailing solar orbit.",
    note: "Kepler is a retired space telescope in heliocentric orbit, not equipment on Mars.",
  },
];

export function resource(id: string): NASAResource {
  const found = NASA_RESOURCES.find((entry) => entry.id === id);
  if (!found) throw new Error(`Unknown NASA resource: ${id}`);
  return found;
}

function missionPage(label: string, slug: string): Source {
  return {
    label: `${slug.startsWith("apollo") ? "NASA" : "NASA Science"} — ${label}`,
    // Apollo destinations were read from NASA's programme page and verified;
    // robotic mission destinations use the separately verified Science pages.
    url: slug === "apollo" ? "https://www.nasa.gov/the-apollo-program/" : `https://${slug.startsWith("apollo-") ? "www" : "science"}.nasa.gov/mission/${slug}/`,
    note: "Mission history and science context; individual hardware claims and precise coordinates require their own supporting evidence.",
  };
}

const LM_HISTORY: Source = {
  label: "NASA History — Apollo Lunar Surface Journal (lunar module context)",
  url: "https://www.nasa.gov/history/alsj/",
  note: "Surface operations and lunar module context; consult the relevant mission journal and distinguish the descent stage from the ascent stage.",
};

const LRV_HISTORY: Source = {
  label: "NASA History — Apollo Lunar Surface Journal (lunar rover deployment)",
  url: "https://www.nasa.gov/history/alsj/",
  note: "Apollo 15, 16 and 17 surface journals document rover deployment and use; the linked NSSDCA entry is the Apollo 15 parent lunar module.",
};

const SURFACE_JOURNAL: Source = {
  label: "NASA History — Apollo Lunar Surface Journal",
  url: "https://www.nasa.gov/history/alsj/",
  note: "Mission transcripts, photographs and experiment deployment context; consult the relevant mission entry for the hardware being studied.",
};

/** Specific mission references only: research portals are never a primary-source fallback. */
export function missionSources(input: { id?: string; mission?: string; planet?: Planet | "deep"; agency?: string }): Source[] {
  if (input.agency && !/\bNASA\b|\bJPL\b/i.test(input.agency)) return [];
  const id = input.id?.toLowerCase() ?? "";
  const mission = input.mission?.toLowerCase() ?? "";
  const text = `${id} ${mission}`;

  if (input.planet === "moon" || (!input.planet && /apollo|surveyor|ranger|lcross|grail|ladee|lunar-prospector/.test(text))) {
    if (id === "apollo-lunar-module") return [LM_HISTORY, resource("apollo-lm")];
    if (id === "apollo-lrv" || /lunar roving vehicle/.test(mission)) return [LRV_HISTORY, resource("lrv")];
    if (/apollo/.test(text)) {
      const number = id.match(/^apollo-(\d+)(?:-|$)/)?.[1] ?? mission.match(/apollo\s+(\d+)/)?.[1];
      const sources: Source[] = number ? [missionPage(`Apollo ${number}`, `apollo-${number}`)] : [missionPage("Apollo program", "apollo")];
      if (/descent-stage|ascent/.test(id)) sources.push(LM_HISTORY);
      if (/alsep|easep|heat-flow|magnetometer|gravimeter|ultraviolet|seismic|solar-wind|lrrr|tv-camera/.test(id)) sources.push(SURFACE_JOURNAL);
      if (number === "11" && /descent-stage|ascent/.test(id)) sources.push(resource("apollo-lm"));
      if (number === "12" && /alsep/.test(id)) sources.push(resource("alsep"));
      if (number === "15" && /descent-stage/.test(id)) sources.push(resource("lrv"));
      return sources;
    }
    const surveyorNumber = id.match(/^surveyor-(\d+)(?:-|$)/)?.[1] ?? mission.match(/surveyor\s+(\d+)/)?.[1];
    if (surveyorNumber) return [surveyorNumber === "3" ? resource("surveyor") : missionPage(`Surveyor ${surveyorNumber}`, `surveyor-${surveyorNumber}`)];
    const rangerNumber = id.match(/^ranger-(\d+)(?:-|$)/)?.[1] ?? mission.match(/ranger\s+(\d+)/)?.[1];
    if (rangerNumber) return [missionPage(`Ranger ${rangerNumber}`, `ranger-${rangerNumber}`)];
    if (/lcross/.test(text)) return [missionPage("LCROSS", "lcross")];
    if (/grail/.test(text)) return [missionPage("GRAIL", "grail")];
    if (/ladee/.test(text)) return [missionPage("LADEE", "ladee")];
    if (/lunar[- ]prospector/.test(text)) return [missionPage("Lunar Prospector", "lunar-prospector")];
    return [];
  }

  if (input.planet === "mars" || !input.planet) {
    if (/ingenuity/.test(text)) return [resource("ingenuity")];
    if (/insight|interior exploration using seismic/.test(text)) return [resource("insight")];
    if (/phoenix|mars scout program/.test(text)) return [resource("phoenix")];
    if (/pathfinder|sojourner/.test(text)) return [resource("pathfinder")];
    if (/mars exploration rover|\bspirit\b|\bopportunity\b|^mer-/.test(text)) return [resource("mer")];
    if (/viking/.test(text)) return [/viking[- ]2/.test(text) ? missionPage("Viking 2", "viking-2") : resource("viking")];
    if (/curiosity|mars science laboratory|^msl-/.test(text)) return [missionPage("Curiosity / Mars Science Laboratory", "msl-curiosity")];
    if (/perseverance|mars 2020|^m2020-/.test(text)) return [missionPage("Perseverance / Mars 2020", "mars-2020-perseverance")];
    if (/mars polar lander|^mpl-/.test(text)) return [missionPage("Mars Polar Lander / Deep Space 2", "mars-polar-lander-deep-space-2")];
    if (/deep space 2|^ds2-/.test(text)) return [missionPage("Mars Polar Lander / Deep Space 2", "mars-polar-lander-deep-space-2")];
  }

  if (input.planet === "deep" || !input.planet) {
    if (/dawn/.test(text)) return [resource("dawn")];
    if (/\bnear\b/.test(text)) return [resource("near")];
    if (/pioneer[- ]11/.test(text)) return [resource("pioneer-11")];
    if (/pioneer[- ]10/.test(text)) return [resource("pioneer-10")];
    if (/kepler|\bk2\b/.test(text)) return [resource("kepler")];
    if (/voyager/.test(text)) return [missionPage("Voyager", "voyager")];
    if (/new[- ]horizons/.test(text)) return [missionPage("New Horizons", "new-horizons")];
  }
  return [];
}
