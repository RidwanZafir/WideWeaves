/**
 * Resolve the current catalogue size on demand so the menu does not bundle the
 * full equipment database until a visitor opens it, and never displays a stale
 * hand-maintained count.
 */
export async function getEquipmentCount(): Promise<number> {
  const { EQUIPMENT } = await import("./equipment");
  return EQUIPMENT.length;
}
