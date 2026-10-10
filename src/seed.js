const { getDb, saveDb } = require("./db");
const { MOON_STORIES } = require("./stories-moon");
const { MARS_STORIES } = require("./stories-mars");

function now() {
  return new Date().toISOString();
}

const WORLDS = [
  { code: "moon", name: "The Moon" },
  { code: "mars", name: "Mars" }
];

// The full storytelling library: 8 Moon + 10 Mars records. Content lives in
// stories-moon.js / stories-mars.js so prose stays separate from machinery.
const OBJECTS = [...MOON_STORIES, ...MARS_STORIES];

/*
 * Pilot data ships with the app, so it has to be able to REACH an app that has
 * already run.
 *
 * `seedIfEmpty()` used to return the moment it found one world row, which means
 * the archive created on a user's first launch decided what that installation
 * would ever contain: every citation, photo and film added in a later build
 * simply never arrived, and the app looked like it had no resources at all.
 * That is not a demo problem — it is the app silently lying about its contents,
 * which is the one thing this project exists to argue against.
 *
 * So the seed is versioned. An empty archive is seeded whole; an archive from
 * an older build is BACKFILLED — missing citations are added by title, missing
 * stories are inserted by name, and nothing a curator wrote is ever touched or
 * replaced.
 */

const SEED_VERSION = 5;

function ensureMetaTable(db) {
  db.run(`CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT
  )`);
}

function getSeedVersion(db) {
  try {
    const rows = db.exec("SELECT value FROM meta WHERE key = 'seed_version'");
    if (!rows.length || !rows[0].values.length) return 0;
    return Number(rows[0].values[0][0]) || 0;
  } catch (err) {
    return 0;
  }
}

function setSeedVersion(db, version) {
  db.run("INSERT OR REPLACE INTO meta (key, value) VALUES ('seed_version', ?)", [String(version)]);
}

function worldIdByCode(db) {
  const map = {};
  const rows = db.exec("SELECT id, code FROM worlds");
  if (rows.length && rows[0].values.length) {
    for (const [id, code] of rows[0].values) map[code] = id;
  }
  return map;
}

function insertObject(db, obj, worldIds, stamp) {
  const worldId = worldIds[obj.world];
  if (!worldId) return null;

  db.run(
    `INSERT INTO objects (
      world_id, name, sort_title, summary, what_is, why_abandoned,
      lesson, status, status_note, location_note, certainty, certainty_note,
      mark, era, mission_code, year,
      subtitle, narrative, hero_image, hero_credit, categories, reading_minutes,
      timeline,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      worldId,
      obj.name,
      obj.name,
      obj.summary,
      obj.what_is,
      obj.why_abandoned,
      obj.lesson,
      obj.status,
      obj.status_note,
      obj.location_note,
      obj.certainty,
      obj.certainty_note,
      obj.mark || null,
      obj.era,
      obj.mission_code,
      obj.year,
      obj.subtitle || null,
      obj.narrative ? JSON.stringify(obj.narrative) : null,
      obj.hero_image || null,
      obj.hero_credit || null,
      obj.categories ? JSON.stringify(obj.categories) : null,
      obj.reading_minutes || null,
      obj.timeline ? JSON.stringify(obj.timeline) : null,
      stamp,
      stamp
    ]
  );

  const objectRow = db.exec("SELECT id FROM objects WHERE name = ? AND world_id = ?", [
    obj.name,
    worldId
  ]);
  const objectId = objectRow[0].values[0][0];

  for (const s of obj.stakeholders || []) {
    db.run(
      "INSERT INTO stakeholders (object_id, role, name, note, created_at) VALUES (?, ?, ?, ?, ?)",
      [objectId, s.role, s.name, s.note, stamp]
    );
  }

  for (const src of obj.sources || []) {
    db.run(
      "INSERT INTO sources (object_id, kind, title, reference, nasa_id, nasa_url, nasa_caption, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [objectId, src.kind, src.title, src.reference, src.nasaId || null, src.nasaUrl || null, src.nasaCaption || null, stamp]
    );
  }

  if (obj.next_action) {
    db.run(
      "INSERT INTO next_actions (object_id, made_by, made_at, action, why, status) VALUES (?, ?, ?, ?, ?, 'open')",
      [objectId, "archive seed", stamp, obj.next_action.action, obj.next_action.why]
    );
  }

  return objectId;
}

/*
 * Bring citations forward on an archive that predates them.
 *
 * An archive written by an older build already has most of the pilot SOURCE
 * ROWS — just without the citation on them. So this does not only insert; it
 * also ENRICHES a row whose title already exists but whose citation is empty.
 * Skipping on a title match alone looked fine and silently dropped two of the
 * three NASA photographs, because the row was "already there".
 *
 * Only rows the pilot set declares are touched, and only their citation
 * columns: a curator's own additions are invisible here, and nothing is ever
 * read, moved, rewritten or deleted.
 */
function backfillCitations(db) {
  let added = 0;
  let enriched = 0;

  const objectRows = db.exec("SELECT id, name FROM objects");
  if (!objectRows.length) return { added: 0, enriched: 0 };
  const byName = {};
  for (const [id, name] of objectRows[0].values) byName[name] = id;

  for (const obj of OBJECTS) {
    const objectId = byName[obj.name];
    if (objectId === undefined) continue;

    for (const src of obj.sources || []) {
      if (!src.nasaId && !src.nasaUrl) continue;

      const existing = db.exec(
        "SELECT id, nasa_id FROM sources WHERE object_id = ? AND title = ?",
        [objectId, src.title]
      );

      if (existing.length && existing[0].values.length) {
        const [rowId, currentNasa] = existing[0].values[0];
        if (currentNasa) continue; // already carries its citation
        db.run("UPDATE sources SET nasa_id = ?, nasa_url = ?, nasa_caption = ? WHERE id = ?", [
          src.nasaId || null,
          src.nasaUrl || null,
          src.nasaCaption || null,
          rowId
        ]);
        enriched++;
        continue;
      }

      db.run(
        "INSERT INTO sources (object_id, kind, title, reference, nasa_id, nasa_url, nasa_caption, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [objectId, src.kind, src.title, src.reference, src.nasaId || null, src.nasaUrl || null, src.nasaCaption || null, now()]
      );
      added++;
    }
  }

  return { added, enriched };
}

/*
 * Seed v3 backfill: insert stories the older seed never declared, and fill the
 * storytelling columns on rows that predate them. New columns cannot hold
 * curator data (they did not exist), so filling only NULL cells never
 * overwrites a curator's words. Curator-added rows are invisible here.
 */
function backfillStories(db) {
  const worldIds = worldIdByCode(db);
  let inserted = 0;
  let filled = 0;

  const objectRows = db.exec("SELECT id, name FROM objects");
  const byName = {};
  if (objectRows.length && objectRows[0].values.length) {
    for (const [id, name] of objectRows[0].values) {
      if (byName[name] === undefined) byName[name] = id;
    }
  }

  const stamp = now();

  for (const obj of OBJECTS) {
    const objectId = byName[obj.name];
    if (objectId === undefined) {
      insertObject(db, obj, worldIds, stamp);
      inserted++;
      continue;
    }

    const cols = db.exec(
      "SELECT subtitle, narrative, hero_image, hero_credit, categories, reading_minutes, timeline FROM objects WHERE id = ?",
      [objectId]
    );
    if (!cols.length || !cols[0].values.length) continue;
    const [subtitle, narrative, heroImage, heroCredit, categories, readingMinutes, timeline] = cols[0].values[0];

    const updates = [];
    const params = [];
    const want = [
      ["subtitle", subtitle, obj.subtitle || null],
      ["narrative", narrative, obj.narrative ? JSON.stringify(obj.narrative) : null],
      ["hero_image", heroImage, obj.hero_image || null],
      ["hero_credit", heroCredit, obj.hero_credit || null],
      ["categories", categories, obj.categories ? JSON.stringify(obj.categories) : null],
      ["reading_minutes", readingMinutes, obj.reading_minutes || null],
      ["timeline", timeline, obj.timeline ? JSON.stringify(obj.timeline) : null]
    ];
    for (const [col, current, next] of want) {
      if ((current === null || current === undefined) && next !== null && next !== undefined) {
        updates.push(`${col} = ?`);
        params.push(next);
      }
    }
    if (updates.length) {
      params.push(objectId);
      db.run(`UPDATE objects SET ${updates.join(", ")} WHERE id = ?`, params);
      filled++;
    }
  }

  return { inserted, filled };
}

async function seedIfEmpty() {
  const db = getDb();
  ensureMetaTable(db);

  const existing = db.exec("SELECT id FROM worlds LIMIT 1");

  if (existing.length && existing[0].values.length) {
    // An archive that already exists. If it predates the current pilot data,
    // bring the citations and stories forward rather than leaving it stranded.
    if (getSeedVersion(db) < SEED_VERSION) {
      backfillCitations(db);
      backfillStories(db);
      setSeedVersion(db, SEED_VERSION);
      saveDb();
    }
    return;
  }

  const worldIds = {};

  for (const w of WORLDS) {
    db.run("INSERT INTO worlds (code, name, created_at) VALUES (?, ?, ?)", [
      w.code,
      w.name,
      now()
    ]);
    const row = db.exec("SELECT id FROM worlds WHERE code = ?", [w.code]);
    worldIds[w.code] = row[0].values[0][0];
  }

  const stamp = now();
  for (const obj of OBJECTS) {
    insertObject(db, obj, worldIds, stamp);
  }

  setSeedVersion(db, SEED_VERSION);
  saveDb();
}

module.exports = { seedIfEmpty, SEED_VERSION };
