/** Public playback protocol only. Credentials and voice settings belong on the server. */
export const NARRATION_VERSION = "harry-flash-v1";
export const MAX_NARRATION_LENGTH = 600;

export function normalizeNarration(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}
