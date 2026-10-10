const { getDb, saveDb } = require("./db");

/*
 * The IPC boundary is a trust boundary, not a formality.
 *
 * Everything below arrives from a renderer that is itself fed by the database,
 * and the app's whole argument is that a record should not carry a claim it
 * cannot support. The same standard applies to what it lets itself write. Each
 * handler below therefore validates its own arguments rather than assuming the
 * UI already did — the UI's `maxlength` is a courtesy to the typist, and the
 * bridge is reachable without it.
 *
 * These were real, reproducible behaviours before:
 *   - searching `%` or `_` returned every record, because LIKE read them as
 *     wildcards; typing `surv%yor` matched "Surveyor".
 *   - filing a next action against object id 999999 returned `true` and wrote a
 *     row no record could ever show, because `PRAGMA foreign_keys` was off.
 *   - `objects(null)` threw `Cannot read properties of null` at the boundary.
 */

// Field budget, mirroring the form: action 140, why 400.
const ACTION_MAX = 140;
const WHY_MAX = 400;
// A search box needs no more than this, and an unbounded LIKE is a free scan.
const QUERY_MAX = 200;

function asNonEmptyText(value, max) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  return text.length > max ? text.slice(0, max) : text;
}

function asObjectId(value) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

/* `%` and `_` are LIKE wildcards. A user typing "100%" or "surv%yor" means those
   characters literally, so they are escaped and the query declares its escape
   character. Backslash is escaped first, or it would escape the escapes. */
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (ch) => "\\" + ch);
}

function parseJsonArray(text) {
  if (!text) return [];
  try {
    const v = JSON.parse(text);
    return Array.isArray(v) ? v : [];
  } catch (err) {
    return [];
  }
}

function registerHandlers({ ipcMain }) {
  ipcMain.handle("archive:world-count", () => {
    const db = getDb();
    const rows = db.exec("SELECT COUNT(*) AS c FROM worlds");
    return rows[0] && rows[0].values[0][0];
  });

  ipcMain.handle("archive:worlds", () => {
    const db = getDb();
    const rows = db.exec("SELECT code, name FROM worlds ORDER BY name");
    if (!rows.length || !rows[0].values.length) return [];
    return rows[0].values.map((r) => ({ code: r[0], name: r[1] }));
  });

  ipcMain.handle("archive:object-count", () => {
    const db = getDb();
    const rows = db.exec("SELECT COUNT(*) AS c FROM objects");
    return rows[0] && rows[0].values[0][0];
  });

  ipcMain.handle("archive:objects", (_, rawOpts) => {
    const db = getDb();
    // A default parameter only covers `undefined`; `null` used to throw here.
    const opts = rawOpts && typeof rawOpts === "object" ? rawOpts : {};
    const where = [];
    const params = [];

    const worldCode = typeof opts.worldCode === "string" ? opts.worldCode.trim() : "";
    if (worldCode) {
      where.push(`o.world_id IN (SELECT id FROM worlds WHERE code = ?)`);
      params.push(worldCode);
    }

    // Categories travel as a JSON array; a quoted LIKE match avoids prefix
    // collisions between tags ("robot" vs "robotic-explorer").
    const category = asNonEmptyText(opts.category, 60);
    if (category) {
      where.push(`o.categories LIKE ? ESCAPE '\\'`);
      params.push(`%"${escapeLike(category)}"%`);
    }

    const term = asNonEmptyText(opts.q, QUERY_MAX);
    if (term) {
      const q = `%${escapeLike(term)}%`;
      where.push(
        `(o.name LIKE ? ESCAPE '\\' OR o.mission_code LIKE ? ESCAPE '\\' OR o.summary LIKE ? ESCAPE '\\' OR o.lesson LIKE ? ESCAPE '\\' OR o.subtitle LIKE ? ESCAPE '\\' OR o.narrative LIKE ? ESCAPE '\\' OR o.categories LIKE ? ESCAPE '\\')`
      );
      params.push(q, q, q, q, q, q, q);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

    const rows = db.exec(
      `
        SELECT
          o.id, o.name, o.sort_title, o.summary,
          o.mark,
          o.era, o.mission_code, o.year, o.certainty, o.status,
          o.location_note, w.name AS world_name, w.code AS world_code,
          o.subtitle, o.categories, o.reading_minutes, o.hero_image,
          EXISTS(SELECT 1 FROM sources s WHERE s.object_id = o.id AND s.nasa_url LIKE '%youtube.com%') AS has_video,
          EXISTS(SELECT 1 FROM sources s WHERE s.object_id = o.id AND s.nasa_id LIKE 'PIA%') AS has_photo
        FROM objects o
        JOIN worlds w ON w.id = o.world_id
        ${whereSql}
        ORDER BY
          CASE o.era
            WHEN '1950s' THEN 1
            WHEN '1960s' THEN 2
            WHEN 'Apollo' THEN 3
            WHEN '1970s' THEN 4
            WHEN 'Mars landing era' THEN 5
            WHEN '1990s' THEN 6
            WHEN '2000s' THEN 7
            WHEN '2010s' THEN 8
            ELSE 9
          END,
          o.sort_title
      `,
      params
    );

    if (!rows.length || !rows[0].values.length) return [];

    return rows[0].values.map((r) => ({
      id: r[0],
      name: r[1],
      sortTitle: r[2],
      summary: r[3],
      // Which kind of thing this is. The renderer picks the silhouette from it,
      // so the map says what was left, not only how well we know it.
      mark: r[4],
      era: r[5],
      missionCode: r[6],
      year: r[7],
      certainty: r[8],
      status: r[9],
      locationNote: r[10],
      worldName: r[11],
      // The world's stable code travels with the row so the renderer can pick
      // that world's ground without parsing a display name.
      worldCode: r[12],
      subtitle: r[13] || "",
      categories: parseJsonArray(r[14]),
      readingMinutes: r[15] == null ? null : Number(r[15]),
      heroImage: r[16] || "",
      // Media flags so the rail can say which records carry footage before
      // they are opened. LIKE patterns are constants, not user input.
      hasVideo: r[17] === 1,
      hasPhoto: r[18] === 1
    }));
  });

  ipcMain.handle("archive:object", (_, rawId) => {
    const id = asObjectId(rawId);
    // An unusable id is a miss, not a crash: the renderer turns `null` into its
    // own "could not open this record" state.
    if (id === null) return null;

    const db = getDb();
    const rows = db.exec(
      `
        SELECT
          o.id, o.name, o.sort_title, o.summary,
          o.what_is, o.why_abandoned, o.lesson,
          o.status, o.status_note, o.location_note,
          o.certainty, o.certainty_note, o.mark,
          o.era, o.mission_code, o.year,
          o.subtitle, o.narrative, o.hero_image, o.hero_credit,
          o.categories, o.reading_minutes,
          w.code AS world_code, w.name AS world_name
        FROM objects o
        JOIN worlds w ON w.id = o.world_id
        WHERE o.id = ?
      `,
      [id]
    );

    if (!rows.length || !rows[0].values.length) return null;
    const r = rows[0].values[0];

    const stakeholders = db
      .exec(`SELECT role, name, note FROM stakeholders WHERE object_id = ? ORDER BY role`, [id])
      .flatMap((batch) => batch.values.map((row) => ({ role: row[0], name: row[1], note: row[2] })));

    const sources = db
      .exec(`SELECT kind, title, reference, nasa_id, nasa_url, nasa_caption FROM sources WHERE object_id = ? ORDER BY created_at`, [id])
      .flatMap((batch) => batch.values.map((row) => ({ kind: row[0], title: row[1], reference: row[2], nasaId: row[3], nasaUrl: row[4], nasaCaption: row[5] })));

    const nextActions = db
      .exec(`SELECT id, made_by, made_at, action, why, status FROM next_actions WHERE object_id = ? ORDER BY made_at DESC`, [id])
      .flatMap((batch) => batch.values.map((row) => ({ id: row[0], madeBy: row[1], madeAt: row[2], action: row[3], why: row[4], status: row[5] })));

    return {
      id: r[0],
      name: r[1],
      sortTitle: r[2],
      summary: r[3],
      whatIs: r[4],
      whyAbandoned: r[5],
      lesson: r[6],
      status: r[7],
      statusNote: r[8],
      locationNote: r[9],
      certainty: r[10],
      certaintyNote: r[11],
      mark: r[12],
      era: r[13],
      missionCode: r[14],
      year: r[15],
      subtitle: r[16] || "",
      narrative: parseJsonArray(r[17]),
      heroImage: r[18] || "",
      heroCredit: r[19] || "",
      categories: parseJsonArray(r[20]),
      readingMinutes: r[21] == null ? null : Number(r[21]),
      worldCode: r[22],
      worldName: r[23],
      stakeholders,
      sources,
      nextActions
    };
  });

  ipcMain.handle("archive:certainty-badge", (_, certainty) => {
    const map = {
      high: { label: "Well documented", tone: "high" },
      medium: { label: "Reasonably certain", tone: "medium" },
      variable: { label: "Varies by object", tone: "variable" },
      low: { label: "Uncertain", tone: "low" },
      unknown: { label: "Not yet established", tone: "low" }
    };
    return map[certainty] || map.unknown;
  });

  ipcMain.handle("archive:add-next-action", (_, rawObjectId, rawAction, rawWhy) => {
    const objectId = asObjectId(rawObjectId);
    const action = asNonEmptyText(rawAction, ACTION_MAX);
    const why = asNonEmptyText(rawWhy, WHY_MAX);

    if (objectId === null) throw new Error("No record was selected, so the action was not filed.");
    if (!action) throw new Error("An action needs to say what should happen.");
    if (!why) throw new Error("An action needs a reason — that is the part worth keeping.");

    const db = getDb();

    /* The schema declares the foreign key and `PRAGMA foreign_keys = ON` now
       enforces it, but an explicit check lets the failure arrive as a sentence
       the curator can act on rather than as a constraint violation. */
    const target = db.exec("SELECT 1 FROM objects WHERE id = ?", [objectId]);
    if (!target.length || !target[0].values.length) {
      throw new Error(`No record with id ${objectId} exists, so the action was not filed.`);
    }

    db.run(`INSERT INTO next_actions (object_id, made_by, made_at, action, why, status) VALUES (?, 'reviewer', ?, ?, ?, 'open')`, [objectId, new Date().toISOString(), action, why]);
    saveDb();
    return true;
  });

  ipcMain.handle("archive:meta", () => ({
    appName: "Abandoned but Not Forgotten",
    description: "A desktop workspace for NASA's abandoned hardware on the Moon and Mars — memory as a real, preservable thing.",
    version: "1.0.0"
  }));
}

module.exports = { registerHandlers };
