/* Abandoned but Not Forgotten — video coverage audit.
 *
 * Every story must carry watch content: a YouTube film with a valid
 * 11-character ID (embedded on click via youtube-nocookie), or — only where
 * no YouTube copy could be independently verified — a screening-room link
 * to the verified official page. IDs are validated, never invented here:
 * this script reads the seed data and reports what it finds.
 *
 * Run:  node scripts/check-videos.js
 */

const { MOON_STORIES } = require("../src/stories-moon");
const { MARS_STORIES } = require("../src/stories-mars");

const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const WATCH_RE = /[?&]v=([A-Za-z0-9_-]{11})(?:[&#]|$)/;

let failures = 0;

function fail(name, detail) {
  failures++;
  console.log("  FAIL  " + name + (detail ? "  -> " + detail : ""));
}

function pass(name) {
  console.log("  PASS  " + name);
}

function main() {
  const stories = [...MOON_STORIES, ...MARS_STORIES];
  console.log("\n== video coverage: " + stories.length + " stories ==");

  for (const s of stories) {
    const tag = s.name;
    const videos = (s.sources || []).filter(
      (src) => src.kind === "Video" && /youtube\.com\/watch/.test(src.nasaUrl || "")
    );
    const rooms = (s.sources || []).filter(
      (src) => src.kind === "Screening room" && src.nasaUrl
    );

    if (!videos.length && !rooms.length) {
      fail(tag + " has no watch content", "no Video or Screening room source");
      continue;
    }

    let ok = true;
    for (const v of videos) {
      const m = WATCH_RE.exec(v.nasaUrl || "");
      if (!m || !ID_RE.test(m[1])) {
        fail(tag + " has a malformed video URL", v.nasaUrl);
        ok = false;
        continue;
      }
      if (!v.title || !v.reference) {
        fail(tag + " video lacks title or channel attribution", v.title);
        ok = false;
      }
      const embed = "https://www.youtube-nocookie.com/embed/" + m[1];
      console.log(`  film  ${tag} :: "${v.title}" :: ${v.reference} :: ${m[1]} :: ${embed}`);
    }
    for (const r of rooms) {
      if (!/^https:\/\//.test(r.nasaUrl || "")) {
        fail(tag + " screening link is not https", r.nasaUrl);
        ok = false;
        continue;
      }
      console.log(`  room  ${tag} :: "${r.title}" :: ${r.reference} :: link-only (no verified YouTube copy)`);
    }
    if (ok) pass(tag + " watch content valid");
  }

  // Duplicates across stories are allowed only when genuinely shared.
  const seen = {};
  for (const s of stories) {
    for (const src of s.sources || []) {
      const m = WATCH_RE.exec(src.nasaUrl || "");
      if (!m) continue;
      seen[m[1]] = seen[m[1]] || [];
      seen[m[1]].push(s.name);
    }
  }
  const dupes = Object.keys(seen).filter((id) => seen[id].length > 1);
  if (dupes.length) {
    for (const id of dupes) fail("video " + id + " reused across stories", seen[id].join(" + "));
  } else {
    pass("every film is story-specific (no cross-story reuse)");
  }

  console.log("\n" + (failures === 0 ? "ALL VIDEO CHECKS PASSED" : failures + " VIDEO CHECK(S) FAILED"));
  process.exit(failures === 0 ? 0 : 1);
}

main();
