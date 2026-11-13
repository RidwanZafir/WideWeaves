import type { GuideLine, Planet } from "./types";

export const INTRO: GuideLine[] = [
  {
    text: "Hey, adventurer! I'm Luffy. Ready to discover the machines humanity left beyond Earth?",
    expression: "grin",
    pose: "wave",
  },
  {
    text: "First stop, the Moon! Humans walked here, and incredible machines still rest on its dusty surface.",
    expression: "wow",
    pose: "point",
  },
  {
    text: "Next stop, Mars! Rovers explored this red world, and even a tiny helicopter learned to fly!",
    expression: "grin",
    pose: "point",
  },
  {
    text: "Two worlds, countless stories! Where should we explore first, the Moon or Mars?",
    expression: "proud",
    pose: "wave",
  },
];

export const PLANET_GREETING: Record<Planet, GuideLine[]> = {
  moon: [
    {
      text: "The Moon! Six crews walked here, and their landers are still standing in the dust.",
      expression: "wow",
      pose: "point",
    },
    {
      text: "There are rovers up here too — Lunokhod was driven from Earth with roughly a 2.6-second round-trip signal delay. Imagine that!",
      expression: "grin",
      pose: "idle",
    },
  ],
  mars: [
    {
      text: "Mars! No humans yet — only robots. Spirit and Opportunity were planned for 90 Martian sols.",
      expression: "grin",
      pose: "point",
    },
    {
      text: "One drove 45 kilometres. Another flew 72 times. This planet is full of overachievers.",
      expression: "wow",
      pose: "idle",
    },
  ],
};

export const VIEW_LINES: Record<string, GuideLine> = {
  home: {
    text: "Pick a world, then pick a machine. Every one of them has a story that ends somewhere out there.",
    expression: "grin",
    pose: "point",
  },
  explore: {
    text: "Filter by planet, status or type. If a machine is still working, I want to know its secret!",
    expression: "curious",
    pose: "think",
  },
  // record pages get their own line: only a few machines have a scripted
  // reaction, and the rest must not fall back to the catalogue line
  equipment: {
    text: "Here is the whole story — what it was, how it got there, and what it left behind. Read the record, then spin it in 3D.",
    expression: "proud",
    pose: "point",
  },
  games: {
    text: "Game time! Flip the cards, answer the quiz, or land the lander. Every star you win is saved in your log!",
    expression: "grin",
    pose: "wave",
  },
  map: {
    text: "Drag the planet to spin it. Every glowing dot is a place where humans left something behind.",
    expression: "wow",
    pose: "point",
  },
  stats: {
    text: "Numbers like these hide a warning: an item count is not a machine count. Read the definitions!",
    expression: "serious",
    pose: "idle",
  },
  missions: {
    text: "Six decades of mission milestones, one long story. Tap a moment to follow its evidence.",
    expression: "proud",
    pose: "point",
  },
  discoveries: {
    text: "This is why we go: water, organic molecules, marsquakes, and a sky we can finally fly in.",
    expression: "grin",
    pose: "wave",
  },
  learn: {
    text: "Knowledge cards! Answer first, then check. No peeking — okay, peek a little.",
    expression: "curious",
    pose: "think",
  },
  compare: {
    text: "Two machines, side by side. Which one would you take on an adventure?",
    expression: "grin",
    pose: "point",
  },
  gallery: {
    text: "Mission photographs, illustrations and terrain context. Check each caption to see what the image actually shows.",
    expression: "proud",
    pose: "idle",
  },
  students: {
    text: "Pick an investigation, inspect the hardware and follow the original source. Your expedition progress stays on this device.",
    expression: "grin",
    pose: "wave",
  },
  about: {
    text: "Sources, definitions, and what is a reconstruction. Being honest about the data is part of the adventure.",
    expression: "serious",
    pose: "idle",
  },
  deepspace: {
    text: "Some spacecraft still send science home. Others rest on asteroids, orbit Ceres or travel silently onward. Let's find out what each one left behind.",
    expression: "wow",
    pose: "idle",
  },
  viewer: {
    text: "Spin it, zoom it, blow it apart. Every part has a job — tap one to find out what.",
    expression: "grin",
    pose: "point",
  },
  story: {
    text: "Story mode! I'll narrate. You can skip ahead or go back whenever you want.",
    expression: "proud",
    pose: "point",
  },
};

export const REACTIONS: Record<string, GuideLine> = {
  opportunity: {
    text: "Whoa! This little explorer survived on Mars for almost 15 years!",
    expression: "wow",
    pose: "point",
  },
  "apollo-lunar-module": {
    text: "Wait! Humans actually landed here?",
    expression: "wow",
    pose: "point",
  },
  curiosity: {
    text: "It has a laser that vapourises rock and reads the light. A space detective!",
    expression: "grin",
    pose: "think",
  },
  perseverance: {
    text: "It's collecting sealed samples for a possible future trip to Earth. The return mission is still a separate challenge.",
    expression: "grin",
    pose: "wave",
  },
  spirit: {
    text: "Stuck in the sand, but it climbed a mountain first. Never forget the mountain.",
    expression: "serious",
    pose: "idle",
  },
  ingenuity: {
    text: "A tissue-box helicopter flying in air about one percent as dense as Earth's. It completed 72 flights.",
    expression: "wow",
    pose: "point",
  },
  sojourner: {
    text: "The first rover on Mars weighed less than me! Okay, maybe not. But it was tiny!",
    expression: "grin",
    pose: "point",
  },
  "apollo-lrv": {
    text: "Three Moon cars, still parked at their Apollo landing sites. Their wheels were made from wire mesh.",
    expression: "grin",
    pose: "wave",
  },
  "surveyor-3": {
    text: "Astronauts walked up to this robot and took its camera home. Best souvenir ever.",
    expression: "wow",
    pose: "point",
  },
  "lunokhod-1": {
    text: "Eight wheels, driven from Earth with a delay. That's real skill.",
    expression: "proud",
    pose: "think",
  },
  "viking-1": {
    text: "The first clear photographs from the surface of Mars! Viking made those rocks a place we could see.",
    expression: "wow",
    pose: "point",
  },
  insight: {
    text: "It didn't look at Mars — it listened. Over a thousand marsquakes!",
    expression: "curious",
    pose: "think",
  },
  phoenix: {
    text: "It dug into water ice beneath Mars' northern plains. An orbital clue became a surface discovery.",
    expression: "wow",
    pose: "point",
  },
  zhurong: {
    text: "It entered hibernation in May 2022. The mission reports cited here have not confirmed a return to operations.",
    expression: "serious",
    pose: "idle",
  },
};
