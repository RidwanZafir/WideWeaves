import { equipmentByPlanet } from "./equipment";
import { MARS_STATS, MOON_STATS } from "./stats";
import type { Planet, StatEntry } from "./types";

export interface HomepageStatCard {
  id: string;
  value: number | null;
  suffix: string;
  label: string;
  sub: string;
  sourceUrl?: string;
}

function card(stat: StatEntry): HomepageStatCard {
  return {
    id: stat.id,
    value: stat.count,
    suffix: stat.suffix ?? (stat.id === "mars-total" ? "+" : stat.id === "moon-mass" ? " kg" : ""),
    label: stat.label,
    sub: `${stat.kind === "published" ? "Published catalogue" : stat.kind === "estimate" ? "Estimate" : "Mission compilation"} · ${stat.asOf}`,
    sourceUrl: stat.sourceUrl,
  };
}

/** Snapshot counts retain their cutoff; archive status comes from the shared records. */
export function homepageStatCards(planet: Planet): HomepageStatCard[] {
  const stats = planet === "moon" ? MOON_STATS : MARS_STATS;
  const byId = (id: string) => stats.find((stat) => stat.id === `${planet}-${id}`)!;
  const fleet = equipmentByPlanet(planet);
  const mobile = fleet.filter((equipment) => equipment.category === "rover" || equipment.category === "mobility" || equipment.category === "aircraft");
  const operating = mobile.filter((equipment) => equipment.status === "active");
  return [
    card(byId("total")),
    card(byId(planet === "moon" ? "landers" : "missions")),
    {
      id: `${planet}-archive-active-mobile`,
      value: operating.length,
      suffix: "",
      label: "Mobile explorers marked active",
      sub: operating.length ? `${operating.map((equipment) => equipment.name).join(" · ")} · archive status` : "No mobile records marked active · archive status",
      sourceUrl: operating[0]?.sources[0]?.url,
    },
    card(byId("mass")),
  ];
}
