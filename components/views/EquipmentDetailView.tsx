"use client";

import { useEffect } from "react";
import EquipmentExperience from "@/components/equipment/EquipmentExperience";
import {
  EQUIPMENT,
  getEquipment,
  nextEquipment,
  prevEquipment,
} from "@/data/equipment";
import { useAfterlight } from "@/lib/store";
import { useNavigation } from "@/lib/navigation";
import { SITES } from "@/data/sites";

function introFor(name: string, description: string) {
  const words = description.trim().split(/\s+/).filter(Boolean);
  const short = words.length > 28 ? `${words.slice(0, 28).join(" ")}…` : words.join(" ");
  return `Meet ${name}. ${short}`;
}

export default function EquipmentDetailView() {
  const { equipmentId, openEquipment, planet, setPlanet, setSiteId, go, say, markDiscovered } = useAfterlight();
  const equipment = getEquipment(equipmentId ?? "") ?? EQUIPMENT[0];
  const openRecord = (id: string) => {
    const record = getEquipment(id);
    if (!record) return;
    setPlanet(record.planet);
    openEquipment(record.id, "overview");
  };

  const compare = () => {
    const { comparison, setComparison } = useNavigation.getState();
    const existing = [comparison.rightId, comparison.leftId]
      .find((id) => id !== equipment.id && getEquipment(id));
    const counterpart = existing ?? nextEquipment(equipment.id, equipment.planet).id;
    setComparison(equipment.id, counterpart);
    go("compare");
  };

  const findOnMap = () => {
    const site = SITES.find((entry) => entry.planet === equipment.planet && entry.equipmentId === equipment.id);
    useNavigation.getState().targetMapEquipment(equipment.id);
    setPlanet(equipment.planet);
    setSiteId(site?.id ?? null);
    go("map");
  };

  useEffect(() => {
    const current = useAfterlight.getState();
    if (current.view === "equipment" && current.equipmentId === equipment.id && equipment.planet !== planet) {
      setPlanet(equipment.planet);
    }
  }, [equipment.id, equipment.planet, planet, setPlanet]);

  useEffect(() => {
    markDiscovered(equipment.id);
    say({ text: introFor(equipment.shortName, equipment.record?.what ?? equipment.summary), expression: "grin", pose: "point" });
    // Route changes deliberately replay the record introduction once per machine.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [equipment.id]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const { menuOpen, searchOpen } = useAfterlight.getState();
      if (event.defaultPrevented || menuOpen || searchOpen) return;
      const target = event.target as HTMLElement | null;
      if (target && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable)) return;
      if (document.body.dataset.storyOpen === "1") return;
      const record = event.key === "ArrowRight" ? nextEquipment(equipment.id, equipment.planet)
        : event.key === "ArrowLeft" ? prevEquipment(equipment.id, equipment.planet) : null;
      if (record) {
        setPlanet(record.planet);
        openEquipment(record.id, "overview");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [equipment.id, equipment.planet, openEquipment, setPlanet]);

  return (
    <EquipmentExperience
      equipment={equipment}
      onPrevious={() => openRecord(prevEquipment(equipment.id, equipment.planet).id)}
      onNext={() => openRecord(nextEquipment(equipment.id, equipment.planet).id)}
      onArchive={() => go("explore")}
      onCompare={compare}
      onMap={findOnMap}
    />
  );
}
