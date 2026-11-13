import type { GuideLine } from "./types";

export interface QuizQuestion {
  id: string;
  knowledgeId: string;
  question: string;
  options: string[];
  answer: number;
  why: string;
  source: string;
  luffy: GuideLine;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "dust-kills",
    knowledgeId: "why-dust-storm-kills",
    question: "Why did dust make Opportunity go silent?",
    options: [
      "Dust covered its solar panels and blocked the sunlight",
      "Dust broke all its wheels",
      "The Moon's gravity pulled it down",
      "It ran out of radio signals",
    ],
    answer: 0,
    why: "The 2018 storm blocked sunlight and drastically reduced solar power. Opportunity stopped communicating during the storm; its exact final hardware failure is unknown.",
    source: "NASA — Opportunity mission",
    luffy: { text: "Like putting a blanket over your lamp. No light, no power!", expression: "serious", pose: "think" },
  },
  {
    id: "rtg-power",
    knowledgeId: "rtg",
    question: "What powers Curiosity and Perseverance through dust storms?",
    options: [
      "A huge solar panel",
      "A generator powered by radioactive heat (an RTG)",
      "Wind turbines",
      "The rover's own rockets",
    ],
    answer: 1,
    why: "An RTG turns heat from plutonium-238 into electricity. It has no moving parts and keeps working in storms and at night.",
    source: "NASA — Radioisotope power systems",
    luffy: { text: "A generator powered by radioactive heat! It does not need sunlight.", expression: "grin", pose: "point" },
  },
  {
    id: "thin-air",
    knowledgeId: "thin-atmosphere",
    question: "Why is it so hard to fly on Mars?",
    options: [
      "There is too much wind",
      "The air is about 1% as thick as Earth's",
      "Mars has no sky",
      "Helicopters cannot spin there",
    ],
    answer: 1,
    why: "Mars air is super thin, so Ingenuity's rotors spun about 2,400–2,900 times a minute — five times faster than a normal helicopter.",
    source: "NASA — Ingenuity Mars Helicopter",
    luffy: { text: "Flying there is like flying 30 kilometres up on Earth!", expression: "wow", pose: "point" },
  },
  {
    id: "signal-delay",
    knowledgeId: "moon-distance",
    question: "How long does one message take to reach Mars?",
    options: [
      "About 1 second",
      "About 3 to 22 minutes",
      "About 3 days",
      "It is instant",
    ],
    answer: 1,
    why: "Radio travels at light speed, but Mars is very far. Rovers have to drive by themselves — nobody can steer them in real time.",
    source: "NASA — Mars communications",
    luffy: { text: "Commands take minutes to arrive, so rovers use planned drives and onboard navigation.", expression: "wow", pose: "point" },
  },
  {
    id: "martian-day",
    knowledgeId: "sol-length",
    question: "How long is one day on Mars (a sol)?",
    options: [
      "12 hours",
      "24 hours 39 minutes 35 seconds",
      "48 hours",
      "The same as Earth, exactly",
    ],
    answer: 1,
    why: "One sol is about 40 minutes longer than an Earth day, so rover teams' sleep times drifted later every day.",
    source: "NASA Science — Mars facts",
    luffy: { text: "Forty extra minutes sounds tiny… until your bedtime keeps sliding!", expression: "curious", pose: "think" },
  },
  {
    id: "no-parachute",
    knowledgeId: "moon-no-parachute",
    question: "Why can't a lander use a parachute on the Moon?",
    options: [
      "The Moon's gravity is too strong",
      "The Moon has almost no air to fill the parachute",
      "Parachutes are not invented yet",
      "It would fall too slowly",
    ],
    answer: 1,
    why: "The Moon has essentially no atmosphere for parachute drag. Soft landers need rocket braking; some designs also cushion their final contact with the ground.",
    source: "NASA Science — The Moon",
    luffy: { text: "No air, no parachute! Rocket braking slows a lunar lander before touchdown.", expression: "serious", pose: "point" },
  },
  {
    id: "blueberries",
    knowledgeId: "blueberries",
    question: "What were the 'blueberries' Opportunity found?",
    options: [
      "Hematite-rich mineral spheres linked to ancient groundwater",
      "Real blueberries from Earth",
      "Small Moon rocks",
      "Ice cubes from a comet",
    ],
    answer: 0,
    why: "Scientists interpreted the spheres as concretions that grew inside deposits soaked with mineral-rich groundwater, adding evidence for ancient water on Mars.",
    source: "NASA — Mars Exploration Rovers science",
    luffy: { text: "Tiny mineral marbles that helped reveal ancient groundwater!", expression: "wow", pose: "point" },
  },
  {
    id: "six-wheels",
    knowledgeId: "rocker-bogie",
    question: "Why do big Mars rovers have six wheels?",
    options: [
      "To go faster",
      "The rocker-bogie keeps all wheels on the ground over rocks",
      "So they can jump",
      "To carry more batteries",
    ],
    answer: 1,
    why: "Pivoted links and a differential distribute weight over six independently driven wheels. The suspension lets the rover move slowly over uneven terrain while limiting body tilt.",
    source: "NASA — Spirit and Opportunity rovers",
    luffy: { text: "Six wheels walking over rocks like a beetle!", expression: "curious", pose: "think" },
  },
  {
    id: "still-works",
    knowledgeId: "retroreflectors-still-work",
    question: "Which left-behind equipment still works today?",
    options: [
      "The Apollo cameras",
      "Laser reflectors that bounce light back to Earth",
      "The Lunar Roving Vehicles",
      "Solar panels on Surveyor",
    ],
    answer: 1,
    why: "Corner-cube reflectors from Apollo and Lunokhod need no power. Observatories still bounce lasers off them to measure the Earth–Moon distance.",
    source: "NASA — Apollo programme records",
    luffy: { text: "Mirrors that have answered lasers for over fifty years!", expression: "grin", pose: "wave" },
  },
  {
    id: "robot-return",
    knowledgeId: "luna-16-robotic-return",
    question: "Which robot brought Moon rock back to Earth first?",
    options: ["Luna 16 in 1970", "Curiosity", "Sojourner", "Perseverance"],
    answer: 0,
    why: "The Soviet Luna 16 drilled into the Moon, packed the core and launched it home — 101 grams of lunar soil, with no crew.",
    source: "NASA — Catalogue of Manmade Material on the Moon",
    luffy: { text: "A robot that packed itself a trip home!", expression: "wow", pose: "point" },
  },
  {
    id: "marsquake",
    knowledgeId: "marsquakes",
    question: "What is a marsquake?",
    options: [
      "A storm on Mars",
      "Seismic shaking as Mars cools and contracts",
      "A rover driving over rocks",
      "A dust devil",
    ],
    answer: 1,
    why: "InSight recorded more than 1,300 seismic events. Their waves revealed a liquid core, and later analysis refined scientists' estimates of its size and density.",
    source: "NASA — InSight seismic observations and the 2023 core refinement",
    luffy: { text: "Mars creaks like an old ship. InSight listened to it.", expression: "curious", pose: "think" },
  },
  {
    id: "south-pole",
    knowledgeId: "south-pole-ice",
    question: "Why are so many landers aiming for the Moon's south pole?",
    options: [
      "It is the warmest place",
      "Some permanently shadowed craters preserve water ice",
      "It is closest to Earth",
      "There is wind there",
    ],
    answer: 1,
    why: "Polar ice is a science target and a possible resource for water, oxygen and fuel. Some nearby high terrain receives long periods of sunlight, but ice distribution and access still need investigation.",
    source: "LROC — Lunar Reconnaissance Orbiter Camera",
    luffy: { text: "Polar shadows can preserve ice. Finding accessible deposits is part of the exploration.", expression: "curious", pose: "point" },
  },
];

/** Legacy equipment used for the memory game (all verified in equipment.ts). */
export const MEMORY_IDS = [
  "opportunity",
  "curiosity",
  "apollo-lunar-module",
  "lunokhod-1",
  "ingenuity",
  "viking-1",
] as const;

export const GAME_META = [
  {
    id: "memory",
    title: "Machine Snap",
    blurb: "Flip the cards and match the six machines. Find all the pairs!",
    icon: "layers",
  },
  {
    id: "quiz",
    title: "Rocket Quiz",
    blurb: "10 questions per round from a bank of 12. How many can you get right?",
    icon: "help",
  },
  {
    id: "landing",
    title: "Soft Landing",
    blurb: "Stop the lander in the green zone for a gentle touchdown.",
    icon: "rocket",
  },
  {
    id: "findrover",
    title: "Find the Rover",
    blurb: "Match a machine to its landing site on a mini-map.",
    icon: "map-pin",
  },
  {
    id: "order",
    title: "Mission Order",
    blurb: "Put four mission events in the order they happened.",
    icon: "list-ordered",
  },
] as const;
