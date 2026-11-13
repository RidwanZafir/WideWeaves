import type { TimelineEvent } from "./types";
import { missionSources, resource } from "./resources";

const MILESTONES: TimelineEvent[] = [
  {
    id: "luna-9",
    year: 1966,
    date: "3 February 1966",
    title: "First soft landing on the Moon",
    planet: "moon",
    agency: "Soviet Union",
    milestone: "first",
    summary:
      "Luna 9 survives an airbag landing in Oceanus Procellarum and returns the first photographs from the lunar surface.",
  },
  {
    id: "surveyor-1",
    year: 1966,
    date: "2 June 1966",
    title: "Surveyor proves the ground will hold",
    planet: "moon",
    agency: "NASA",
    milestone: "first",
    summary:
      "Surveyor 1 makes the first American soft landing, four months after Luna 9. It shows that the regolith can support an Apollo lander; six more Surveyors are launched, with four further successful landings.",
  },
  {
    id: "apollo-8",
    year: 1968,
    date: "24 December 1968",
    title: "Humans orbit the Moon",
    planet: "moon",
    agency: "NASA",
    milestone: "first",
    summary:
      "Apollo 8 carries three astronauts around the Moon and photographs Earthrise, changing how humanity sees its own planet.",
  },
  {
    id: "apollo-11",
    year: 1969,
    date: "20 July 1969",
    title: "First crewed landing on another world",
    planet: "moon",
    agency: "NASA",
    milestone: "first",
    equipmentId: "apollo-lunar-module",
    summary:
      "Eagle lands in Mare Tranquillitatis on 20 July UTC; Armstrong's first step follows on 21 July UTC. Armstrong and Aldrin spend about 21.5 hours on the surface and leave the descent stage behind.",
  },
  {
    id: "apollo-12",
    year: 1969,
    date: "19 November 1969",
    title: "A pinpoint landing beside a robot",
    planet: "moon",
    agency: "NASA",
    milestone: "major",
    equipmentId: "apollo-12-descent-stage",
    summary:
      "Intrepid sets down about 160 metres from Surveyor 3, proving crews could be sent to a chosen target rather than a broad safe zone. Conrad and Bean walk to the robot and bring pieces of it home.",
  },
  {
    id: "apollo-13",
    year: 1970,
    date: "17 April 1970",
    title: "The landing that never happened",
    planet: "moon",
    agency: "NASA",
    milestone: "end",
    summary:
      "An oxygen tank explosion cripples Apollo 13 on the way to the Moon. The crew uses the lunar module as a lifeboat, then returns to Earth in the command module. The mission becomes a rescue instead of a landing.",
  },
  {
    id: "luna-16",
    year: 1970,
    date: "24 September 1970",
    title: "A robot brings Moon rock home",
    planet: "moon",
    agency: "Soviet Union",
    milestone: "first",
    equipmentId: "luna-16",
    summary:
      "Luna 16 drills into Mare Fecunditatis, seals the core in a capsule and launches it back to Earth — the first automatic sample return from another world, 101 grams of regolith.",
  },
  {
    id: "lunokhod-1",
    year: 1970,
    date: "17 November 1970",
    title: "The first rover on another world",
    planet: "moon",
    agency: "Soviet Union",
    milestone: "first",
    equipmentId: "lunokhod-1",
    summary:
      "Luna 17 delivers Lunokhod 1 to Mare Imbrium. The rover operates under remote control through 1971. Its historical odometer figure was about 10.5 km; later orbital-image mapping revised the traced route to about 9.9 km.",
  },
  {
    id: "apollo-15-lrv",
    year: 1971,
    date: "31 July 1971",
    title: "A car on the Moon",
    planet: "moon",
    agency: "NASA",
    milestone: "major",
    equipmentId: "apollo-lrv",
    summary:
      "Apollo 15 deploys the first Lunar Roving Vehicle, extending the astronauts' exploration range and transforming lunar geology.",
  },
  {
    id: "viking-1",
    year: 1976,
    date: "20 July 1976",
    title: "First fully successful Mars landing",
    planet: "mars",
    agency: "NASA",
    milestone: "first",
    equipmentId: "viking-1",
    summary:
      "Viking 1 lands in Chryse Planitia and returns the first clear photographs from the surface of Mars, then runs for six years. Mars 3 had achieved a brief soft landing in 1971.",
  },
  {
    id: "apollo-17",
    year: 1972,
    date: "11 December 1972",
    title: "The last footprints, for now",
    planet: "moon",
    agency: "NASA",
    milestone: "end",
    equipmentId: "apollo-17-descent-stage",
    summary:
      "Challenger lands in Taurus-Littrow with the only geologist to walk on the Moon. Cernan and Schmitt leave the descent stage, a lunar rover and a full experiment suite behind.",
  },
  {
    id: "mars-3",
    year: 1971,
    date: "2 December 1971",
    title: "First soft landing on Mars",
    planet: "mars",
    agency: "Soviet Union",
    milestone: "first",
    equipmentId: "mars-3-lander",
    summary:
      "Mars 3 reaches the surface in a planet-wide dust storm and begins transmitting, but falls silent after about twenty seconds. It is still the first controlled landing on Mars.",
  },
  {
    id: "pathfinder",
    year: 1997,
    date: "4 July 1997",
    title: "A rover bounces onto Mars",
    planet: "mars",
    agency: "NASA",
    milestone: "first",
    equipmentId: "sojourner",
    summary:
      "Mars Pathfinder lands with airbags and releases Sojourner, the first wheeled vehicle to operate on Mars.",
  },
  {
    id: "mer-2004",
    year: 2004,
    date: "25 January 2004",
    title: "Twin rovers arrive",
    planet: "mars",
    agency: "NASA",
    milestone: "major",
    equipmentId: "opportunity",
    summary:
      "Spirit lands on 4 January in Gusev Crater and Opportunity on 25 January in Meridiani Planum. Both were designed to last 90 sols.",
  },
  {
    id: "phoenix-2008",
    year: 2008,
    date: "25 May 2008",
    title: "Touching Martian ice",
    planet: "mars",
    agency: "NASA",
    milestone: "major",
    equipmentId: "phoenix",
    summary:
      "Phoenix lands near the north pole and digs into subsurface water ice within weeks of arrival.",
  },
  {
    id: "curiosity-2012",
    year: 2012,
    date: "6 August 2012",
    title: "The sky crane lands a laboratory",
    planet: "mars",
    agency: "NASA",
    milestone: "major",
    equipmentId: "curiosity",
    summary:
      "Curiosity touches down in Gale Crater using an untried sky-crane descent and finds evidence of an ancient freshwater lake within months.",
  },
  {
    id: "change-4",
    year: 2019,
    date: "3 January 2019",
    title: "First landing on the far side",
    planet: "moon",
    agency: "CNSA",
    milestone: "first",
    equipmentId: "chang-e-4-lander",
    summary:
      "Chang'e 4 touches down inside Von Kármán crater in the ancient South Pole–Aitken basin, relaying data through Queqiao, and deploys Yutu-2 to explore the far-side surface.",
  },
  {
    id: "opportunity-end",
    year: 2019,
    date: "13 February 2019",
    title: "Goodnight, Opportunity",
    planet: "mars",
    agency: "NASA",
    milestone: "end",
    equipmentId: "opportunity",
    summary:
      "After a planet-wide dust storm and more than a thousand wake-up attempts, NASA declares Opportunity's mission complete after 14 years.",
  },
  {
    id: "insight-2018",
    year: 2018,
    date: "26 November 2018",
    title: "Listening to Mars' heartbeat",
    planet: "mars",
    agency: "NASA",
    milestone: "major",
    equipmentId: "insight",
    summary:
      "InSight lands on Elysium Planitia and begins the first seismic survey of another planet's interior.",
  },
  {
    id: "mars2020",
    year: 2021,
    date: "18 February 2021",
    title: "Perseverance and Ingenuity arrive",
    planet: "mars",
    agency: "NASA",
    milestone: "major",
    equipmentId: "perseverance",
    summary:
      "Perseverance lands in Jezero Crater with 23 cameras, and its hitchhiking helicopter makes the first powered flight on another planet on 19 April 2021.",
  },
  {
    id: "change-5",
    year: 2020,
    date: "17 December 2020",
    title: "Moon samples come home again",
    planet: "moon",
    agency: "CNSA",
    milestone: "major",
    equipmentId: "chang-e-5-lander",
    summary:
      "Chang'e 5 drills and scoops 1,731 grams of young mare basalt, launches an ascent stage from the surface and returns the capsule to Inner Mongolia — the first lunar sample return in 44 years.",
  },
  {
    id: "zhurong-2021",
    year: 2021,
    date: "15 May 2021",
    title: "China lands on Mars",
    planet: "mars",
    agency: "CNSA",
    milestone: "first",
    equipmentId: "zhurong",
    summary:
      "Tianwen-1 delivers the Zhurong rover to Utopia Planitia, making China the second nation to operate a rover on Mars.",
  },
  {
    id: "chandrayaan-3",
    year: 2023,
    date: "23 August 2023",
    title: "Landing near the south pole",
    planet: "moon",
    agency: "ISRO",
    milestone: "first",
    equipmentId: "chandrayaan-3-vikram",
    summary:
      "Vikram sets down at about 69 degrees south, making India the fourth country to achieve a lunar soft landing. It is the first soft landing this far south, outside the permanently shadowed polar craters. Pragyan drives out and measures the regolith.",
  },
  {
    id: "luna-25",
    year: 2023,
    date: "19 August 2023",
    title: "A crash four days before the landing",
    planet: "moon",
    agency: "Roscosmos",
    milestone: "end",
    equipmentId: "luna-25",
    summary:
      "Luna 25 loses control during a pre-landing orbit burn and strikes the surface, ending Russia's first lunar landing attempt in 47 years and leaving a fresh crater near Pontes.",
  },
  {
    id: "slim",
    year: 2024,
    date: "19 January 2024",
    title: "A pinpoint landing, upside down",
    planet: "moon",
    agency: "JAXA",
    milestone: "major",
    equipmentId: "slim",
    summary:
      "SLIM lands about 55 metres from its target but settles nose-down after losing an engine nozzle, limiting its solar power. JAXA distinguishes the actual touchdown offset from the estimated roughly 10-metre guidance accuracy before the engine anomaly.",
  },
  {
    id: "im-1",
    year: 2024,
    date: "22 February 2024",
    title: "A commercial lander reaches the Moon",
    planet: "moon",
    agency: "Intuitive Machines / NASA",
    milestone: "first",
    summary:
      "Odysseus becomes the first privately built spacecraft to land softly on the Moon, carrying NASA instruments to the south polar region before tipping onto its side.",
  },
  {
    id: "change-6",
    year: 2024,
    date: "25 June 2024",
    title: "Samples from the far side",
    planet: "moon",
    agency: "CNSA",
    milestone: "first",
    equipmentId: "chang-e-6-lander",
    summary:
      "Chang'e 6 collects 1,935 grams from the South Pole–Aitken basin and returns them to Earth — the first samples ever brought back from the lunar far side.",
  },
  {
    id: "blue-ghost",
    year: 2025,
    date: "2 March 2025",
    title: "Blue Ghost lands in Mare Crisium",
    planet: "moon",
    agency: "Firefly Aerospace / NASA",
    milestone: "major",
    summary:
      "Blue Ghost lands in Mare Crisium carrying ten NASA science and technology instruments. It operates through a lunar day, records the sunset and concludes its surface mission on 16 March.",
  },
  {
    id: "ingenuity-end",
    year: 2024,
    date: "25 January 2024",
    title: "NASA closes the helicopter's flight mission",
    planet: "mars",
    agency: "NASA",
    milestone: "end",
    equipmentId: "ingenuity",
    summary:
      "Ingenuity's 72nd and final flight on 18 January ends with rotor damage. On 25 January NASA announces the flight mission's end, after a planned five-flight demonstration became 128.8 minutes of flight.",
  },
  {
    id: "sample-cache",
    year: 2023,
    date: "Ongoing",
    title: "The sample cache waits",
    planet: "mars",
    agency: "NASA / ESA",
    milestone: "ongoing",
    equipmentId: "perseverance",
    summary:
      "Perseverance completes a ten-tube backup sample depot at Three Forks in January 2023. The tubes remain available for a possible future return campaign; the return mission's design and schedule are not guaranteed.",
  },
  {
    id: "perseverance-distance-2026", year: 2026, date: "11 October 2026",
    title: "Perseverance passes Opportunity's distance record", planet: "mars", agency: "NASA",
    milestone: "major", equipmentId: "perseverance",
    summary: "NASA reports Perseverance reached 45.22 km of driving, surpassing Opportunity's 45.16 km off-Earth rover record. Opportunity's completed journey remains a historical benchmark; Perseverance's figure is a dated measurement.",
    sources: [{ label: "NASA — Perseverance's dated driving distance", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" }, resource("mer")],
  },
];

const DEEP_MILESTONES: TimelineEvent[] = [
  { id: "pioneer-10-jupiter", year: 1973, date: "3 December 1973", title: "Pioneer 10 reaches Jupiter", planet: "deep", agency: "NASA", milestone: "first", deepSpaceId: "pioneer-10", summary: "Pioneer 10 makes the first close flyby of Jupiter. Its radiation detectors help engineers understand the hazards that later missions will face." },
  { id: "pioneer-11-saturn", year: 1979, date: "1 September 1979", title: "Pioneer 11 scouts Saturn", planet: "deep", agency: "NASA", milestone: "first", deepSpaceId: "pioneer-11", summary: "The first Saturn flyby studies the planet and its rings before Pioneer 11 continues outward. Its reconnaissance helps prepare the Voyager encounters." },
  { id: "near-eros", year: 2001, date: "12 February 2001", title: "An orbiter comes to rest on Eros", planet: "deep", agency: "NASA", milestone: "first", deepSpaceId: "near-shoemaker", summary: "After a year orbiting asteroid 433 Eros, NEAR Shoemaker makes a controlled landing. A spacecraft designed as an orbiter continues sending measurements from the surface." },
  { id: "dawn-ceres", year: 2015, date: "6 March 2015", title: "Dawn reaches its second orbital world", planet: "deep", agency: "NASA", milestone: "first", deepSpaceId: "dawn", summary: "Ion propulsion carries Dawn from Vesta to Ceres, making it the first spacecraft to orbit two extraterrestrial destinations. The mission eventually ends in orbit around Ceres." },
  { id: "kepler-retirement", year: 2018, date: "30 October 2018", title: "Kepler retires, its discoveries keep growing", planet: "deep", agency: "NASA", milestone: "end", deepSpaceId: "kepler", summary: "NASA retires Kepler after its fuel runs out. The telescope remains in an Earth-trailing orbit around the Sun, while its archived brightness measurements continue supporting exoplanet research." },
  { id: "dawn-end", year: 2018, date: "1 November 2018", title: "Dawn falls silent at Ceres", planet: "deep", agency: "NASA", milestone: "end", deepSpaceId: "dawn", summary: "NASA announces the end of Dawn after it runs out of hydrazine for pointing. Its final resting place is orbit around Ceres, separate from the Moon and Mars surface archive." },
];

const EVENT_SOURCES: Record<string, TimelineEvent["sources"]> = {
  "mars2020": [{ label: "NASA Science — Perseverance / Mars 2020", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" }, resource("ingenuity")],
  "apollo-13": [{ label: "NASA History — Apollo 13 crew returns safely to Earth", url: "https://www.nasa.gov/history/apollo-13-crew-returns-safely-to-earth/" }],
  "luna-9": [{ label: "NASA — 2012 lunar hardware catalogue (Luna 9 entry)", url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf" }],
  "luna-16": [{ label: "NASA — 2012 lunar hardware catalogue (Luna 16 entry)", url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf" }],
  "lunokhod-1": [{ label: "NASA — 2012 lunar hardware catalogue (Luna 17 and Lunokhod entries)", url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf" }],
  "mars-3": [{ label: "NASA NSSDCA — Mars 3 spacecraft record", url: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-049A", note: "Mission catalogue reference; original landing coordinates remain uncertain." }],
  "change-4": [{ label: "CNSA — research starting point", url: "https://www.cnsa.gov.cn/english/", note: "Agency portal; search the relevant mission report for supporting details." }],
  "change-5": [{ label: "CNSA — research starting point", url: "https://www.cnsa.gov.cn/english/", note: "Agency portal; search the relevant mission report for supporting details." }],
  "change-6": [{ label: "CNSA — research starting point", url: "https://www.cnsa.gov.cn/english/", note: "Agency portal; search the relevant mission report for supporting details." }],
  "zhurong-2021": [{ label: "CNSA — research starting point", url: "https://www.cnsa.gov.cn/english/", note: "Agency portal; search the relevant mission report for supporting details." }],
  "chandrayaan-3": [{ label: "ISRO — Chandrayaan-3", url: "https://www.isro.gov.in/Chandrayaan3_Details.html" }],
  "luna-25": [{ label: "NASA LRO — crater likely from Luna 25 impact", url: "https://www.nasa.gov/humans-in-space/nasas-lro-observes-crater-likely-from-luna-25-impact/" }],
  slim: [{ label: "JAXA — SLIM touchdown and guidance accuracy", url: "https://global.jaxa.jp/press/2024/01/20240125-1_e.html" }, { label: "JAXA — SLIM lunar activities conclusion", url: "https://global.jaxa.jp/press/2024/08/20240826-1_e.html" }],
  "im-1": [{ label: "NASA — Odysseus lands on the Moon", url: "https://www.nasa.gov/image-article/odysseus-lands-on-the-moon/" }],
  "blue-ghost": [{ label: "NASA — Blue Ghost lands on the Moon", url: "https://www.nasa.gov/image-article/blue-ghost-lands-on-moon/" }, { label: "NASA — Blue Ghost captures lunar sunset", url: "https://www.nasa.gov/image-article/goodnight-moon-nasa-cameras-on-blue-ghost-capture-lunar-sunset/" }],
};

export const TIMELINE: TimelineEvent[] = [...MILESTONES, ...DEEP_MILESTONES].map((event) => ({
  ...event,
  sources: event.sources ?? EVENT_SOURCES[event.id] ?? missionSources({
    id: event.deepSpaceId ?? event.equipmentId ?? event.id,
    mission: event.title, planet: event.planet, agency: event.agency,
  }),
}));

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

/** UTC event date; an ongoing state has no single sortable occurrence. */
export function timelineDateKey(event: TimelineEvent): number | null {
  const match = event.date.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!match || event.milestone === "ongoing") return null;
  const month = MONTHS.indexOf(match[2].toLowerCase());
  return month < 0 ? null : Date.UTC(Number(match[3]), month, Number(match[1]));
}

export const TIMELINE_BY_YEAR = [...TIMELINE].sort(
  (a, b) => a.year - b.year || (timelineDateKey(a) ?? Infinity) - (timelineDateKey(b) ?? Infinity),
);
