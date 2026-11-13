import type { KnowledgeCard } from "./types";

export const KNOWLEDGE: KnowledgeCard[] = [
  {
    id: "why-dust-storm-kills",
    question: "Why does dust kill a solar-powered rover?",
    answer:
      "Mars dust can coat solar panels and block sunlight in the atmosphere. A severe 2018 dust storm dramatically reduced Opportunity's available solar power, and its last transmission arrived on 10 June. The precise final hardware failure is unknown because the rover never regained contact.",
    category: "Engineering",
    luffy: {
      text: "It's like covering your only lamp with a blanket. No light, no power — and Mars gets really, really cold.",
      expression: "serious",
      pose: "think",
    },
    source: { label: "NASA — Opportunity mission", url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/" },
  },
  {
    id: "rtg",
    question: "What is an RTG and why does it last so long?",
    answer:
      "A radioisotope thermoelectric generator turns heat from decaying plutonium-238 into electricity. It has no moving parts and works through dust storms and long nights. Its electrical output declines over time, constraining operations alongside the condition of the rover's other systems.",
    category: "Power",
    luffy: {
      text: "It's a generator powered by radioactive heat! Curiosity and Perseverance carry one, so they don't depend on sunlight for electricity.",
      expression: "grin",
      pose: "point",
    },
    source: { label: "NASA — Radioisotope power systems", url: "https://science.nasa.gov/planetary-science/programs/radioisotope-power-systems/" },
  },
  {
    id: "thin-atmosphere",
    question: "Why is flying on Mars so hard?",
    answer:
      "The Martian atmosphere is about 1% as dense as Earth's at the surface. A helicopter must spin its blades far faster to push enough air down to lift itself — Ingenuity's rotors turned at about 2,400–2,900 rpm, roughly five times a typical helicopter's.",
    category: "Flight",
    luffy: {
      text: "Flying there is like flying 30 kilometres up on Earth. Ingenuity did it 72 times anyway!",
      expression: "wow",
      pose: "point",
    },
    source: { label: "NASA — Ingenuity Mars Helicopter", url: "https://science.nasa.gov/mission/mars-2020-perseverance/ingenuity-mars-helicopter/" },
  },
  {
    id: "regolith",
    question: "What is lunar regolith?",
    answer:
      "Regolith is the layer of broken rock, dust and glass fragments covering the Moon, produced by billions of years of meteorite impacts. It is sharp, abrasive, electrostatically charged and dangerous to breathe — and it covers almost the entire lunar surface.",
    category: "Geology",
    luffy: {
      text: "Moon dust is basically tiny broken glass. It sticks to everything. Not good for your lungs, or a robot's joints.",
      expression: "curious",
      pose: "think",
    },
    source: { label: "NASA Science — Moon", url: "https://science.nasa.gov/moon/" },
  },
  {
    id: "why-leave-things",
    question: "Why did astronauts leave so much equipment behind?",
    answer:
      "Every kilogram costs fuel to lift off the Moon. To carry home samples, crews had to dump mass: backpacks, cameras, tools, packaging and waste. Science instruments like seismometers were deliberately left running, powered by small nuclear generators.",
    category: "History",
    luffy: {
      text: "Lift-off is expensive, so they traded stuff for rocks. Their loss is our museum!",
      expression: "grin",
      pose: "wave",
    },
    source: { label: "NASA — Apollo Lunar Surface Journal", url: "https://www.nasa.gov/history/alsj/" },
  },
  {
    id: "moon-distance",
    question: "How long does a signal take to reach Mars?",
    answer:
      "Radio travels at light speed, but Mars is far away: a one-way signal takes roughly 3 to 22 minutes depending on the planets' positions. That delay is why rovers must drive semi-autonomously — nobody can steer them in real time.",
    category: "Operations",
    luffy: {
      text: "A command can take minutes to arrive. Rovers follow planned instructions and use onboard navigation instead of a live joystick.",
      expression: "wow",
      pose: "point",
    },
    source: { label: "NASA — Mars communications", url: "https://science.nasa.gov/mars/" },
  },
  {
    id: "blueberries",
    question: "What were the 'blueberries' Opportunity found?",
    answer:
      "Small grey, hematite-rich spheres, a few millimetres across, found in sedimentary rock at Meridiani Planum. Scientists interpreted them as concretions that grew in deposits soaked with mineral-rich groundwater — evidence of a wet Martian past.",
    category: "Discovery",
    luffy: {
      text: "Tiny mineral marbles that helped reveal ancient groundwater. Opportunity found them in its first weeks!",
      expression: "wow",
      pose: "point",
    },
    source: { label: "NASA — Hematite concretions and groundwater", url: "https://www.nasa.gov/image-article/big-spherules-near-victoria/" },
  },
  {
    id: "marsquakes",
    question: "What is a marsquake?",
    answer:
      "Seismic shaking on Mars, caused mostly by the planet cooling and contracting, and by meteorite impacts. InSight recorded more than 1,300 events. Its initial 2021 model estimated a liquid core about 1,830 km in radius; a 2023 analysis of waves passing through the core found it was smaller and denser than first thought.",
    category: "Interior",
    luffy: {
      text: "Mars is creaking like an old ship. InSight put its ear to the ground and heard it.",
      expression: "curious",
      pose: "think",
    },
    source: { label: "NASA — InSight's 2023 refinement of the Martian core", url: "https://www.nasa.gov/missions/insight/nasa-insight-study-provides-clearest-look-ever-at-martian-core/" },
  },
  {
    id: "coordinates",
    question: "How do we know where a rover is on Mars?",
    answer:
      "Orbiters photograph the surface at high resolution. Spacecraft and their tracks show up as small dark marks, and the images are tied to a global coordinate grid. Rovers also navigate with cameras, sun sensors and wheel odometry between orbital fixes.",
    category: "Mapping",
    luffy: {
      text: "We find them from space — little dots and tyre tracks on a giant red map.",
      expression: "grin",
      pose: "point",
    },
    source: { label: "NASA — Mars Reconnaissance Orbiter", url: "https://science.nasa.gov/mission/mars-reconnaissance-orbiter/" },
  },
  {
    id: "artefact-heritage",
    question: "Are these sites protected?",
    answer:
      "The Artemis Accords include a commitment by participating nations to preserve historically significant space artifacts and sites. That commitment does not make every lunar object a universally protected landmark. Future visitors must consider preservation alongside the rules and agreements that apply to their mission.",
    category: "Heritage",
    luffy: {
      text: "These are the first footprints of our whole species. We should treat them like a museum, not a scrapyard.",
      expression: "serious",
      pose: "idle",
    },
    source: { label: "NASA — Artemis Accords, preserving outer space heritage", url: "https://www.nasa.gov/artemis-accords/" },
  },
  {
    id: "moon-no-parachute",
    question: "Why can't a lander use a parachute on the Moon?",
    answer:
      "The Moon has essentially no atmosphere, so a parachute cannot provide useful drag. Soft-landing missions use rocket braking to slow their descent. Some designs, such as Luna 9's capsule, also use cushioning for the final contact with the ground.",
    category: "Landing",
    luffy: {
      text: "No air means no parachute or aerobraking. A lunar lander needs rocket braking before touching down.",
      expression: "serious",
      pose: "point",
    },
    source: { label: "NASA Science — The Moon", url: "https://science.nasa.gov/moon/" },
  },
  {
    id: "sky-crane-why",
    question: "Why lower a rover from a rocket-powered crane?",
    answer:
      "Curiosity and Perseverance are too heavy for the earlier rover airbag systems. A rocket-powered descent stage lowers each rover on a bridle so it can touch down directly on its wheels, without a landing platform to drive off. After touchdown the cables are cut and the descent stage flies away to crash. Both rovers use radioisotope power, not solar panels.",
    category: "Landing",
    luffy: {
      text: "The descent stage is basically a flying crane: it hovers, sets the rover down gently, then zooms off to crash somewhere harmless.",
      expression: "wow",
      pose: "point",
    },
    source: { label: "NASA — Mars 2020 Perseverance", url: "https://science.nasa.gov/mission/mars-2020-perseverance/" },
  },
  {
    id: "retroreflectors-still-work",
    question: "Which abandoned equipment still works today?",
    answer:
      "The laser retroreflector arrays left by Apollo 11, 14 and 15 and by the Soviet Lunokhod rovers. They are passive corner-cube prisms with no power supply, and observatories still bounce laser pulses off them to measure the Earth–Moon distance to within a few centimetres.",
    category: "Instruments",
    luffy: {
      text: "No batteries, no moving parts. Just mirrors that have been answering lasers for over fifty years.",
      expression: "grin",
      pose: "wave",
    },
    source: { label: "NASA — Apollo program records", url: "https://www.nasa.gov/the-apollo-program/" },
  },
  {
    id: "rocker-bogie",
    question: "Why do Mars rovers have six wheels and no springs?",
    answer:
      "The passive rocker-bogie suspension uses pivoted links and a differential to distribute the rover's weight over six wheels on uneven terrain. Each wheel has its own drive motor. The links let wheels move over obstacles while limiting how much the rover body tilts; the rover travels slowly rather than bouncing on springs.",
    category: "Mobility",
    luffy: {
      text: "Six wheels, each with its own motor, on a frame that rocks instead of bouncing. It walks over rocks like a beetle.",
      expression: "curious",
      pose: "think",
    },
    source: { label: "NASA — Perseverance wheels and suspension", url: "https://science.nasa.gov/mission/mars-2020-perseverance/rover-components/" },
  },
  {
    id: "sol-length",
    question: "How long is a day on Mars?",
    answer:
      "A Martian solar day, called a sol, lasts about 24 hours 39 minutes 35 seconds — about 40 minutes longer than an Earth day. Teams sometimes work on Mars time during early surface operations, so those shifts drift later each Earth day.",
    category: "Operations",
    luffy: {
      text: "Forty extra minutes a day sounds tiny until you realise the whole team's sleep schedule slides later and later for months.",
      expression: "curious",
      pose: "think",
    },
    source: { label: "NASA Science — Mars facts", url: "https://science.nasa.gov/mars/" },
  },
  {
    id: "mars-launch-window",
    question: "Why do Mars missions launch only every two years?",
    answer:
      "Fuel-efficient launch opportunities depend on the relative positions of Earth and Mars, repeating roughly every 26 months. A transfer trajectory meets Mars after it has moved along its orbit. Other trajectories are possible, but usually need more energy; several missions often share the favorable window.",
    category: "Operations",
    luffy: {
      text: "It's a train that leaves every 26 months. Miss it and you're waiting two more years with your rover in a box.",
      expression: "wow",
      pose: "point",
    },
    source: { label: "NASA Science — Mars", url: "https://science.nasa.gov/mars/" },
  },
  {
    id: "dust-devil-cleaning",
    question: "Can weather ever help a rover?",
    answer:
      "Yes. Dust devils and gusts occasionally swept Opportunity's and Spirit's solar panels clean, and their power output jumped. Engineers called these 'cleaning events'. Curiosity and Perseverance do not depend on them because they carry nuclear power sources instead.",
    category: "Weather",
    luffy: {
      text: "A little whirlwind giving a dusty rover a free wash. Opportunity got lucky more than once.",
      expression: "grin",
      pose: "wave",
    },
    source: { label: "NASA — Mars Exploration Rovers", url: "https://science.nasa.gov/mission/mars-exploration-rovers-spirit-and-opportunity/" },
  },
  {
    id: "far-side-radio-quiet",
    question: "Why did Chang'e 4 need a relay satellite?",
    answer:
      "The Moon blocks a direct radio link between Earth and Chang'e 4's far-side landing site. Queqiao relays commands and data from a halo orbit around the Earth–Moon L2 region. Shielding from much of Earth's radio interference also makes the far side attractive for radio astronomy.",
    category: "Communications",
    luffy: {
      text: "The Moon blocks Earth from this landing site. A relay satellite passes messages around it.",
      expression: "curious",
      pose: "think",
    },
    source: { label: "CNSA — China National Space Administration", url: "https://www.cnsa.gov.cn/english/" },
  },
  {
    id: "luna-16-robotic-return",
    question: "Can a robot bring Moon rock back without a crew?",
    answer:
      "Yes — the Soviet Luna 16 did it in 1970. It drilled about 35 cm into Mare Fecunditatis, sealed the core in a capsule and launched it back to Earth, returning 101 grams. Luna 20 and 24 repeated the trick, and Chang'e 5 and 6 later brought back kilograms.",
    category: "History",
    luffy: {
      text: "A robot that drills, packs and sends a capsule home. Luna 20 and Luna 24 repeated the feat later in the 1970s.",
      expression: "wow",
      pose: "point",
    },
    source: { label: "NASA — Catalogue of Manmade Material on the Moon", url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf" },
  },
  {
    id: "south-pole-ice",
    question: "Why is everyone landing near the Moon's south pole?",
    answer:
      "Some permanently shadowed crater regions near the lunar poles are cold enough to preserve water ice. Its distribution and accessibility still need investigation. Ice could supply water, oxygen and rocket propellant, while some nearby high terrain receives long periods of sunlight for solar power. A landing near the pole is not necessarily inside an icy shadowed crater.",
    category: "Discovery",
    luffy: {
      text: "Shadowed craters holding ancient ice, right next to sunny ridges. That's why Chandrayaan-3 aimed for the south.",
      expression: "curious",
      pose: "point",
    },
    source: { label: "NASA — The lunar south pole region", url: "https://www.nasa.gov/reference/moonbase-environment/" },
  },
  {
    id: "mars-sample-cache",
    question: "What is the sample cache waiting on Mars?",
    answer:
      "Perseverance placed ten sealed tubes at Three Forks in Jezero Crater: eight containing rock or regolith, one atmosphere sample and one contamination witness tube. The depot is a backup to samples retained aboard the rover. They were prepared for possible return to Earth for laboratory study; a return mission's design and schedule are not guaranteed.",
    category: "Samples",
    luffy: {
      text: "Tubes of Mars sitting in the dust, waiting for a lift home. That's the whole plan — and the hard part is the lift.",
      expression: "serious",
      pose: "idle",
    },
    source: { label: "NASA — Perseverance completes its sample depot", url: "https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-perseverance-rover-completes-mars-sample-depot/" },
  },
];

export const KNOWLEDGE_CATEGORIES = Array.from(new Set(KNOWLEDGE.map((k) => k.category)));

const KNOWLEDGE_IDS = new Set(KNOWLEDGE.map((card) => card.id));

// Older quiz rounds saved the question ID instead of the knowledge card ID.
// Keep those earned facts when reading an existing expedition log.
const LEGACY_QUIZ_FACT_IDS = new Map<string, string>([
  ["dust-kills", "why-dust-storm-kills"],
  ["rtg-power", "rtg"],
  ["thin-air", "thin-atmosphere"],
  ["signal-delay", "moon-distance"],
  ["martian-day", "sol-length"],
  ["no-parachute", "moon-no-parachute"],
  ["six-wheels", "rocker-bogie"],
  ["still-works", "retroreflectors-still-work"],
  ["robot-return", "luna-16-robotic-return"],
  ["marsquake", "marsquakes"],
  ["south-pole", "south-pole-ice"],
]);

/** Canonical, unique cards only; unknown legacy IDs cannot inflate progress. */
export function knownFactIds(ids: readonly string[]): string[] {
  return Array.from(new Set(ids.map((id) => LEGACY_QUIZ_FACT_IDS.get(id) ?? id)))
    .filter((id) => KNOWLEDGE_IDS.has(id));
}
