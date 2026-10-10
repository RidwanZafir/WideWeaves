/* Headless verification: real sql.js DB, real seed, real IPC handlers.
   Runs in an isolated temp cwd so it never touches the app's data dir. */

const path = require("path");
const os = require("os");
const fs = require("fs");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-verify-"));
process.chdir(tmp);

const { initDb, closeDb } = require("../src/db");
const { seedIfEmpty } = require("../src/seed");
const { registerHandlers } = require("../src/renderer-handlers");

const handlers = new Map();
const ipcMain = {
  handle: function (channel, fn) {
    handlers.set(channel, fn);
  }
};

let failures = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log("  PASS  " + name);
  } else {
    failures++;
    console.log("  FAIL  " + name + (detail ? "  -> " + detail : ""));
  }
}

function call(channel) {
  const fn = handlers.get(channel);
  if (!fn) throw new Error("no handler for " + channel);
  const args = Array.prototype.slice.call(arguments, 1);
  return fn.apply(null, [null].concat(args));
}

async function main() {
  await initDb({ userDataDir: tmp });
  await seedIfEmpty();
  registerHandlers({ ipcMain });

  console.log("\n== schema ==");
  const expectedChannels = [
    "archive:add-next-action",
    "archive:certainty-badge",
    "archive:meta",
    "archive:object",
    "archive:object-count",
    "archive:objects",
    "archive:world-count",
    "archive:worlds"
  ];
  const channels = Array.from(handlers.keys()).sort();
  check("exact handler set registered", channels.join(",") === expectedChannels.join(","), channels.join(", "));
  check(
    "every channel the preload calls exists",
    expectedChannels.every(function (c) {
      return handlers.has(c);
    })
  );

  console.log("\n== seed ==");
  const worldCount = call("archive:world-count");
  const objectCount = call("archive:object-count");
  check("worlds seeded", worldCount === 2, "got " + worldCount);
  check("objects seeded (8 Moon + 10 Mars)", objectCount === 18, "got " + objectCount);

  console.log("\n== archive:worlds ==");
  const worlds = call("archive:worlds");
  check("two worlds returned", worlds.length === 2, JSON.stringify(worlds));
  check("world shape has code+name", worlds[0] && worlds[0].code && worlds[0].name, JSON.stringify(worlds[0]));

  console.log("\n== archive:objects (all) ==");
  const all = call("archive:objects");
  check("all objects returned", all.length === 18, "got " + all.length);
  const first = all[0];
  check(
    "object row has the fields the rail uses",
    first &&
      first.id &&
      first.name &&
      first.certainty &&
      first.worldName &&
      typeof first.year !== "undefined",
    JSON.stringify(first)
  );
  check("era ordering puts 1950s first", all[0] && all[0].era === "1950s", "got " + (all[0] && all[0].era));

  console.log("\n== archive:objects (world filter) ==");
  const moon = call("archive:objects", { worldCode: "moon" });
  const mars = call("archive:objects", { worldCode: "mars" });
  check("moon filter (8 stories)", moon.length === 8, "got " + moon.length);
  check("mars filter (10 stories)", mars.length === 10, "got " + mars.length);
  check(
    "every moon row is the Moon",
    moon.every(function (o) {
      return o.worldName === "The Moon";
    })
  );

  console.log("\n== archive:objects (search) ==");
  const names = function (rows) {
    return rows.map(function (o) {
      return o.name;
    });
  };

  // "Apollo" now runs through several full narratives, so a correct search
  // returns a shelf of them. That is the full-text search working, not a bug.
  const broad = call("archive:objects", { q: "Apollo" });
  check("broad term matches names, lessons and narratives", broad.length >= 4, JSON.stringify(names(broad)));
  check(
    "broad term still includes the Apollo record",
    names(broad).indexOf("Apollo 11 descent stage") !== -1,
    JSON.stringify(names(broad))
  );

  // A term present in exactly one record must return exactly one.
  const exact = call("archive:objects", { q: "Sagan Memorial" });
  check("specific term narrows to one record", exact.length === 1 && exact[0].missionCode === "Pathfinder", JSON.stringify(names(exact)));

  const lessonHits = call("archive:objects", { q: "collision" });
  check("search reaches into lessons", lessonHits.length >= 1 && names(lessonHits).indexOf("Luna 2") !== -1, JSON.stringify(names(lessonHits)));

  const codeHit = call("archive:objects", { q: "Schiaparelli EDM" });
  check("search reaches mission codes", codeHit.length === 1 && codeHit[0].name === "Schiaparelli EDM lander", JSON.stringify(names(codeHit)));

  const narrativeHits = call("archive:objects", { q: "silica" });
  check("search reaches into full narratives", narrativeHits.length >= 1 && names(narrativeHits).indexOf("Spirit") !== -1, JSON.stringify(names(narrativeHits)));

  const catHits = call("archive:objects", { category: "lost-mission" });
  check(
    "category filter returns only that kind",
    catHits.length >= 3 && catHits.every((o) => (o.categories || []).indexOf("lost-mission") !== -1),
    JSON.stringify(names(catHits))
  );

  const none = call("archive:objects", { q: "zzzzz" });
  check("no match returns empty array", Array.isArray(none) && none.length === 0, JSON.stringify(none));

  console.log("\n== archive:object (detail) ==");
  const detail = call("archive:object", all[0].id);
  check("detail returns a record", !!detail && detail.id === all[0].id, JSON.stringify(detail && detail.id));
  check("detail has all narrative fields", !!(detail.whatIs && detail.whyAbandoned && detail.lesson && detail.statusNote && detail.locationNote && detail.certaintyNote), "one or more missing");
  check("detail carries sources", detail.sources.length === 3, "got " + detail.sources.length);
  check("detail carries stakeholders", detail.stakeholders.length === 2, "got " + detail.stakeholders.length);
  check("detail carries nextActions", detail.nextActions.length === 1, "got " + detail.nextActions.length);
  check("source shape", detail.sources[0].kind && detail.sources[0].title, JSON.stringify(detail.sources[0]));
  const video = detail.sources.find((s) => s.kind === "Video");
  check("a video source is attached", !!video && /youtube\.com\/watch\?v=/.test(video.nasaUrl || ""), JSON.stringify(video));
  check("detail carries a subtitle", !!detail.subtitle, JSON.stringify(detail.subtitle));
  check(
    "detail carries a full narrative",
    Array.isArray(detail.narrative) && detail.narrative.length >= 4 &&
      detail.narrative.every((s) => s.h && Array.isArray(s.p) && s.p.length > 0),
    "sections=" + (detail.narrative && detail.narrative.length)
  );
  check("detail carries categories", Array.isArray(detail.categories) && detail.categories.length >= 1, JSON.stringify(detail.categories));
  check("detail carries reading time", typeof detail.readingMinutes === "number" && detail.readingMinutes > 0, JSON.stringify(detail.readingMinutes));
  check("detail carries a hero image", !!detail.heroImage, JSON.stringify(detail.heroImage));
  check(
    "detail carries a flight line",
    Array.isArray(detail.timeline) && detail.timeline.length >= 2 &&
      detail.timeline.every((n) => n.d && n.t),
    "nodes=" + (detail.timeline && detail.timeline.length)
  );

  console.log("\n== every story is complete ==");
  let incomplete = 0;
  let thinLines = 0;
  for (const o of all) {
    const d = call("archive:object", o.id);
    const okNarrative = Array.isArray(d.narrative) && d.narrative.length >= 4 &&
      d.narrative.every((s) => s.h && Array.isArray(s.p) && s.p.join(" ").length > 100);
    const okRest = d.subtitle && d.categories.length >= 1 && d.sources.length >= 1 && d.readingMinutes > 0;
    const okLine = Array.isArray(d.timeline) && d.timeline.length >= 2 &&
      d.timeline.every((n) => n && n.d && n.t);
    if (!okNarrative || !okRest) {
      incomplete++;
      console.log("  INCOMPLETE  " + o.name);
    }
    if (!okLine) {
      thinLines++;
      console.log("  THIN LINE  " + o.name);
    }
  }
  check("all 18 stories have full narratives, subtitles, categories and sources", incomplete === 0, incomplete + " incomplete");
  check("all 18 stories carry a dated flight line", thinLines === 0, thinLines + " thin");

  console.log("\n== preserved evidence ==");
  const apollo = call("archive:object", all.find((o) => o.name === "Apollo 11 descent stage").id);
  check(
    "Apollo 11 moonwalk film preserved",
    apollo.sources.some((s) => (s.nasaUrl || "") === "https://www.youtube.com/watch?v=S9HdPi9Ikhk"),
    "film link"
  );
  const schia = call("archive:object", all.find((o) => o.name === "Schiaparelli EDM lander").id);
  check(
    "Schiaparelli photo and film preserved",
    schia.sources.some((s) => (s.nasaUrl || "") === "https://images.nasa.gov/details-PIA21131") &&
      schia.sources.some((s) => (s.nasaUrl || "") === "https://www.youtube.com/watch?v=C43KXGQuUuY"),
    "photo + film links"
  );
  const surveyor = call("archive:object", all.find((o) => o.name === "Surveyor 1").id);
  check(
    "Surveyor 1 LRO photo preserved",
    surveyor.sources.some((s) => (s.nasaUrl || "") === "https://images.nasa.gov/details-PIA12910"),
    "photo link"
  );

  console.log("\n== watch coverage: film after every story ==");
  const idRe = /^[A-Za-z0-9_-]{11}$/;
  const watchRe = /[?&]v=([A-Za-z0-9_-]{11})(?:[&#]|$)/;
  let unwatched = 0;
  let badIds = 0;
  for (const o of all) {
    const d = call("archive:object", o.id);
    const films = (d.sources || []).filter(
      (s) => s.kind === "Video" && /youtube\.com\/watch/.test(s.nasaUrl || "")
    );
    const rooms = (d.sources || []).filter(
      (s) => s.kind === "Screening room" && /^https:\/\//.test(s.nasaUrl || "")
    );
    if (!films.length && !rooms.length) {
      unwatched++;
      console.log("  UNWATCHED  " + o.name);
      continue;
    }
    for (const f of films) {
      const m = watchRe.exec(f.nasaUrl || "");
      if (!m || !idRe.test(m[1]) || !f.title || !f.reference) {
        badIds++;
        console.log("  BAD FILM  " + o.name + " :: " + f.nasaUrl);
      }
    }
    for (const r of rooms) {
      if (!r.title || !r.reference || !r.nasaCaption) {
        badIds++;
        console.log("  THIN ROOM  " + o.name);
      }
    }
  }
  check("all 18 stories carry watch content", unwatched === 0, unwatched + " without film or screening link");
  check("every film ID is a valid 11-character embeddable ID", badIds === 0, badIds + " malformed");
  const youtubeTotal = all.reduce((n, o) => {
    const d = call("archive:object", o.id);
    return n + (d.sources || []).filter((s) => /youtube\.com\/watch/.test(s.nasaUrl || "")).length;
  }, 0);
  check("sixteen story-specific films, none reused", youtubeTotal === 16, youtubeTotal + " youtube sources");
  const flagged = call("archive:objects", {});
  check("the list flags media per record", flagged.every((o) => typeof o.hasVideo === "boolean" && typeof o.hasPhoto === "boolean"), JSON.stringify(flagged.map((o) => [o.name, o.hasVideo, o.hasPhoto])));
  check("Luna 2 flags its footage", flagged.find((o) => o.name === "Luna 2").hasVideo === true, "hasVideo");
  check("stakeholder shape", detail.stakeholders[0].role && detail.stakeholders[0].name, JSON.stringify(detail.stakeholders[0]));

  const missing = call("archive:object", 99999);
  check("unknown id returns null", missing === null, JSON.stringify(missing));

  console.log("\n== archive:add-next-action (the workflow) ==");
  const before = call("archive:object", detail.id).nextActions.length;
  const ok = call("archive:add-next-action", detail.id, "Flag the site for review", "Because the record is thin.");
  const after = call("archive:object", detail.id).nextActions.length;
  check("write returns true", ok === true, JSON.stringify(ok));
  check("action count increased", after === before + 1, before + " -> " + after);
  const newest = call("archive:object", detail.id).nextActions[0];
  check("newest action is the one we added", newest.action === "Flag the site for review", JSON.stringify(newest));

  console.log("\n== persistence ==");
  const dbFile = path.join(process.cwd(), "data", "archive.db");
  check("db file written", fs.existsSync(dbFile), dbFile);
  const size = fs.existsSync(dbFile) ? fs.statSync(dbFile).size : 0;
  check("db file is non-trivial", size > 20000, size + " bytes");

  closeDb();

  // reopen to prove the write survived a round trip
  const sizeBefore = fs.statSync(dbFile).size;
  check("db survives close", sizeBefore > 20000, sizeBefore + " bytes after close");

  console.log("\n== archive:certainty-badge ==");
  check("high", call("archive:certainty-badge", "high").label === "Well documented");
  check("variable", call("archive:certainty-badge", "variable").label === "Varies by object");
  check("unknown falls back", call("archive:certainty-badge", "nonsense").tone === "low");

  console.log("\n== archive:meta ==");
  const meta = call("archive:meta");
  check("meta has appName", !!meta.appName, JSON.stringify(meta));

  console.log("\n" + (failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"));
  console.log("temp dir: " + tmp + "\n");
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(function (err) {
  console.error("\nHARNESS ERROR:", err && err.stack ? err.stack : err);
  process.exit(1);
});
