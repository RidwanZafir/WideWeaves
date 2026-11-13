import "server-only";

import { EQUIPMENT, chaptersFor, componentsOf, STATUS_LABEL } from "../data/equipment";
import { INTRO, REACTIONS, VIEW_LINES } from "../data/guide";
import { QUIZ_QUESTIONS } from "../data/games";
import { KNOWLEDGE } from "../data/knowledge";
import { SITES } from "../data/sites";
import type { Equipment } from "../data/types";
import { MAX_NARRATION_LENGTH, normalizeNarration } from "./voice-config";

// The provider accepts only dialogue the application can actually deliver.
// Keep this module server-only: it intentionally loads the complete catalogue.
const allowedNarration = new Set<string>();

function allow(text: string) {
  const line = normalizeNarration(text);
  if (line && line.length <= MAX_NARRATION_LENGTH) allowedNarration.add(line);
}

// Matches EquipmentExperience's visible stage summaries, including punctuation
// trimming. Record introductions use a separate 28-word rule below.
function compactCopy(text: string | undefined, maxWords: number) {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ").replace(/[,:;—-]$/, "")}…`;
}

function storyText(equipment: Equipment, key: "what" | "history" | "journey" | "fate" | "legacy") {
  if (equipment.record?.[key]) return equipment.record[key];
  const value = {
    what: equipment.summary,
    history: equipment.story.beginning,
    journey: equipment.story.journey,
    fate: equipment.story.finalDays,
    legacy: equipment.story.legacy,
  }[key];
  return Array.isArray(value) ? value.join(" ") : value;
}

for (const line of [...INTRO, ...Object.values(VIEW_LINES), ...Object.values(REACTIONS)]) {
  allow(line.text);
}

for (const equipment of EQUIPMENT) {
  // EquipmentDetailView.introFor does not strip trailing punctuation.
  const words = (equipment.record?.what ?? equipment.summary).trim().split(/\s+/).filter(Boolean);
  const introduction = words.length > 28 ? `${words.slice(0, 28).join(" ")}…` : words.join(" ");
  allow(`Meet ${equipment.shortName}. ${introduction}`);

  // EquipmentExperience.guideLineFor, for each stage and selectable component.
  allow(`Meet ${equipment.shortName}. ${compactCopy(storyText(equipment, "what"), 22)}`);
  const objective = equipment.objectives[0];
  allow(objective
    ? `It was built to ${compactCopy(objective, 22)}`
    : `Its mission was ${compactCopy(storyText(equipment, "history"), 22)}`);
  for (const component of componentsOf(equipment)) {
    allow(`${component.label}: ${compactCopy(component.description, 21)}`);
  }
  allow(`Choose a labeled part to explore this ${equipment.category}.`);
  allow(`Follow its journey. ${compactCopy(storyText(equipment, "journey"), 22)}`);
  allow(`${STATUS_LABEL[equipment.status]}. ${compactCopy(storyText(equipment, "fate"), 22)}`);
  allow(`Its legacy: ${compactCopy(storyText(equipment, "legacy"), 22)}`);

  for (const chapter of chaptersFor(equipment)) {
    allow(`${chapter.title}. ${chapter.body.join(" ")}`);
  }
}

for (const card of KNOWLEDGE) allow(card.luffy.text);
for (const question of QUIZ_QUESTIONS) allow(question.luffy.text);
for (const site of SITES) {
  allow(site.description); // MapView's "Hear the story" action.
  allow(`${site.name}. ${site.description}`); // SearchPalette site selection.
}

// Fixed reactions in DestinationSelect, the five games and DeepSpaceView.
// These strings are deliberately explicit rather than accepting a template
// supplied by the visitor.
for (const line of [
  "Brace yourself — dust storms, thin air, and a lot of very stubborn robots. Welcome to Mars!",
  "No air, no sound, and footprints that will last forever. Welcome to the Moon!",
  "You found every rover's landing site! Map master!",
  "You matched every machine! Memory champion of the Moon and Mars!",
  "Perfect order! You know the mission timeline by heart!",
  "Amazing quiz score! You are a true space explorer!",
  "Good trying! Every explorer learns by wondering. Try the quiz again!",
  "Soft landing! You are a master pilot of the Moon!",
  "That landing bounce is a lesson. Try again, pilot!",
  "Voyager 1 is over 25 billion kilometres away and still talking. That's the bravest kind of explorer.",
]) allow(line);

export function isNarrationAllowed(text: string): boolean {
  const line = normalizeNarration(text);
  return line.length > 0 && line.length <= MAX_NARRATION_LENGTH && allowedNarration.has(line);
}
