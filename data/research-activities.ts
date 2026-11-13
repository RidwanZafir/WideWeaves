export type ResearchAction =
  | { kind: "equipment"; id: string; label: string }
  | { kind: "map"; id: string; label: string }
  | { kind: "compare"; ids: [string, string]; label: string }
  | { kind: "view"; view: "deepspace" | "discoveries" | "missions" | "stats" | "about"; label: string };

export interface ResearchActivity {
  id: string;
  topic: string;
  age: string;
  title: string;
  question: string;
  steps: string[];
  outcome: string;
  sourceIds: string[];
  extraSources?: { label: string; url: string }[];
  actions: ResearchAction[];
}

export const RESEARCH_ACTIVITIES: ResearchActivity[] = [
  {
    id: "moon-hardware",
    topic: "Moon · engineering & history",
    age: "Ages 10+",
    title: "Four jobs on the lunar surface",
    question: "Why did a landing craft, a rover, a robot and a science station need such different designs?",
    steps: [
      "Open the Apollo Lunar Module and Lunar Roving Vehicle. Find one component that lets each do its main job; read the model's provenance note before using it as evidence.",
      "Read the ALSEP and Surveyor sources. List one measurement each mission could make and explain why it needed that instrument.",
      "Use the surface map and mission histories to place these jobs in context. Separate what stayed on the Moon from what returned to Earth; identify the particular Apollo mission used by each record.",
    ],
    outcome: "Make a four-row table: machine → component → job → evidence. Include a source title and one question your evidence cannot answer.",
    sourceIds: ["apollo-lm", "lrv", "alsep", "surveyor", "nssdca"],
    extraSources: [
      { label: "NASA History — Apollo journals (lunar module and surface operations)", url: "https://www.nasa.gov/history/alsj/" },
      { label: "NASA History — Lunar Roving Vehicle", url: "https://www.nasa.gov/mission/apollo-15/" },
    ],
    actions: [
      { kind: "equipment", id: "apollo-lunar-module", label: "Lunar Module" },
      { kind: "equipment", id: "apollo-12-alsep", label: "ALSEP station" },
      { kind: "compare", ids: ["apollo-lrv", "surveyor-3"], label: "Compare rover & Surveyor" },
      { kind: "map", id: "apollo-lunar-module", label: "Lunar landing site" },
    ],
  },
  {
    id: "mars-landing",
    topic: "Mars · engineering",
    age: "Ages 10+",
    title: "Getting safely to the ground",
    question: "How did Mars landing systems change as the machines became larger and their science goals changed?",
    steps: [
      "Read the Viking, Mars Pathfinder and Mars Exploration Rovers sources. Sketch the landing sequence for each and label the heat shield, parachute and final touchdown method.",
      "Open Pathfinder's lander and airbags, then compare Sojourner with Opportunity. Match each rover to its correct landing system; do not assume all rovers landed the same way.",
      "Choose one design tradeoff: mass, protection, mobility or site safety. Use a cited mission detail to explain why an engineer might accept it.",
    ],
    outcome: "Create three annotated landing diagrams and a short explanation of one engineering tradeoff, with a source for each diagram.",
    sourceIds: ["viking", "pathfinder", "mer", "jpl"],
    actions: [
      { kind: "equipment", id: "pathfinder-lander", label: "Pathfinder lander" },
      { kind: "equipment", id: "pathfinder-airbags", label: "Landing airbags" },
      { kind: "compare", ids: ["sojourner", "opportunity"], label: "Compare the rovers" },
      { kind: "map", id: "viking-1", label: "Viking landing site" },
    ],
  },
  {
    id: "mars-last-days",
    topic: "Mars · science & mission endings",
    age: "Ages 11+",
    title: "The machine stopped. What survived?",
    question: "How can a finished mission leave useful science behind?",
    steps: [
      "Choose Phoenix, InSight or Ingenuity. Read its six story chapters and the linked mission source. Record the last operation date and the documented reason its mission ended.",
      "Connect one instrument or hardware feature to a result: Phoenix's ice investigation, InSight's interior measurements or Ingenuity's flight demonstration. Distinguish an observation from a scientific interpretation.",
      "Follow NASA/JPL's reporting to check the ending. A last transmission, the end of science operations and the formal mission-end announcement may be different dates.",
    ],
    outcome: "Write a 150-word museum label: what the machine did, why it stopped and what its work still teaches us. Cite the mission source and mark any uncertainty.",
    sourceIds: ["phoenix", "insight", "ingenuity", "jpl"],
    actions: [
      { kind: "equipment", id: "phoenix", label: "Phoenix story" },
      { kind: "equipment", id: "insight", label: "InSight story" },
      { kind: "equipment", id: "ingenuity", label: "Ingenuity story" },
      { kind: "view", view: "discoveries", label: "Explore the discoveries" },
    ],
  },
  {
    id: "deep-fate",
    topic: "Beyond Moon & Mars · mission history",
    age: "Ages 11+",
    title: "Where does a spacecraft go afterward?",
    question: "Does every retired spacecraft end up on a planet's surface?",
    steps: [
      "Read the Dawn, NEAR Shoemaker, Pioneer 10, Pioneer 11 and Kepler sources alongside the Deep Space stories.",
      "Group their documented fates: orbit around Ceres, landing on Eros, escape trajectories or orbit around the Sun. Keep a mission's visited target separate from where its hardware ended up.",
      "Compare a planned landing or retirement with a loss of contact. Identify which statements have direct mission evidence and which describe a predicted trajectory rather than a measured current position.",
    ],
    outcome: "Draw a fate map with five spacecraft. Give each an ending, a location category and a citation; explain why these craft do not belong in a Mars surface inventory.",
    sourceIds: ["dawn", "near", "pioneer-10", "pioneer-11", "kepler"],
    actions: [{ kind: "view", view: "deepspace", label: "Open Deep Space stories" }],
  },
  {
    id: "earth-planet-data",
    topic: "Earth & planets · reading scientific data",
    age: "Ages 12+",
    title: "Similar maps, different worlds",
    question: "What changes when you investigate Earth with Earthdata and another world with planetary mission data?",
    steps: [
      "Browse Earthdata for an Earth-observation dataset, such as clouds, surface temperature or vegetation. Record the instrument, measured variable, coverage, units and observation date.",
      "Browse the NASA Planetary Data System (PDS) for a Moon or Mars mission product. Record the target body, instrument, product type and available labels or documentation; a web preview and a science data file serve different purposes.",
      "Compare the two descriptions before comparing their values. Explain one reason that units, resolution, time coverage or processing could make a direct comparison misleading. Check access instructions: some Earthdata services require Earthdata Login.",
    ],
    outcome: "Make a dataset comparison sheet and one fair question the two datasets could help investigate. You can complete this from metadata without downloading large science files.",
    sourceIds: ["earthdata", "nssdca"],
    extraSources: [{ label: "NASA Planetary Data System — planetary science archive", url: "https://pds.nasa.gov/" }],
    actions: [{ kind: "view", view: "about", label: "Source & access guidance" }],
  },
  {
    id: "open-data-metadata",
    topic: "NASA Open Data · source literacy",
    age: "Ages 12+",
    title: "Check the record before the number",
    question: "How can you tell whether a dataset can support a claim?",
    steps: [
      "Find one space-related record in NASA Open Data. Read the description, publisher, update date and linked distribution or documentation.",
      "Follow the distribution link. Identify whether it leads to a file, an API, a document or another catalogue. A portal search result is metadata, not proof that a value is current or that a download is usable.",
      "Compare this with an AFTERLIGHT statistic. Write down its definition, units, source and cutoff. Explain why NASA's 796 lunar catalogue items cannot be substituted for the number of intact machines or AFTERLIGHT records.",
    ],
    outcome: "Write a five-point source checklist and use it to accept, qualify or reject one numerical claim.",
    sourceIds: ["open-data"],
    actions: [{ kind: "view", view: "stats", label: "Check the archive's statistics" }],
  },
  {
    id: "api-planning",
    topic: "NASA APIs · optional coding",
    age: "Ages 14+",
    title: "Plan a request before writing code",
    question: "Which NASA service fits your question, and what does it need from you?",
    steps: [
      "Choose a small research question. Use the NASA API documentation to find a matching endpoint and read its parameters, example response, authentication and rate limits.",
      "Compare that with the NASA Image and Video Library API: images-api.nasa.gov is a separate keyless service. Some api.nasa.gov endpoints accept a registered NASA API key or a limited DEMO_KEY; Space Apps does not issue a special challenge key.",
      "Sketch the request and label the response fields you need. Explain how you would show an empty result or a rate-limit error, and keep any personal credentials out of shared notes. Coding is optional; AFTERLIGHT does not run your request or store API keys.",
    ],
    outcome: "Produce a request plan with endpoint, parameters, access requirements and a credited example result. If you code it, follow the chosen service's documentation.",
    sourceIds: ["api"],
    extraSources: [{ label: "NASA Image and Video Library API — keyless documentation", url: "https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf" }],
    actions: [{ kind: "view", view: "about", label: "Research library" }],
  },
];
