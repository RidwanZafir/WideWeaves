const path = require("path");
const fs = require("fs");
const SQL = require("sql.js");

let db = null;
let dbPathValue = null;
let userDataDirValue = null;
let dbReady = null;

/*
 * Where the archive file lives.
 *
 * The host injects this via initDb({ userDataDir }) — main.js passes Electron's
 * app.getPath("userData"), and the test harnesses pass a temp dir. This module
 * deliberately does NOT require("electron"), because that is what lets
 * scripts/verify.js run under plain node.
 *
 * This used to probe a bare `app` identifier that was never imported, so the
 * branch was dead and every install wrote to process.cwd()/data. In a packaged
 * (asar) app cwd is frequently read-only, which silently dropped user records.
 */
function resolveUserDataDir() {
  return userDataDirValue || process.cwd();
}

function dataDir() {
  return path.join(resolveUserDataDir(), "data");
}

function archiveDbPath() {
  return path.join(dataDir(), "archive.db");
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/*
 * The app's first migration, and an overdue one.
 *
 * `CREATE TABLE IF NOT EXISTS` cannot add a column to a table that already
 * exists, so an archive written before `mark` did not merely lack the value — it
 * lacked the column, and every query naming it would fail outright. Any archive
 * a curator already had would have stopped opening.
 *
 * Additive migrations are idempotent and cheap: read the columns the table
 * actually has and add only the ones that are missing. Returns whether anything
 * changed, so the caller knows to write the file back.
 */
const ADDITIVE_COLUMNS = [
  { table: "objects", column: "mark", definition: "TEXT" },
  { table: "sources", column: "nasa_id", definition: "TEXT" },
  { table: "sources", column: "nasa_url", definition: "TEXT" },
  { table: "sources", column: "nasa_caption", definition: "TEXT" }
];

function migrate() {
  if (!db) return false;
  let changed = false;

  for (const spec of ADDITIVE_COLUMNS) {
    let names = [];
    try {
      const info = db.exec(`PRAGMA table_info(${spec.table})`);
      names = info.length ? info[0].values.map((row) => row[1]) : [];
    } catch (err) {
      console.warn("[db.migrate]", err && err.message);
      continue;
    }

    if (names.length && !names.includes(spec.column)) {
      db.run(`ALTER TABLE ${spec.table} ADD COLUMN ${spec.column} ${spec.definition}`);
      changed = true;
    }
  }

  return changed;
}

/*
 * Connection-scoped settings, applied on open and again after every save.
 *
 * `PRAGMA foreign_keys = ON` looks like it belongs once, at open. It does not.
 * sql.js's `export()` closes and reopens the connection in order to read the
 * database file back, and that silently resets every connection-level pragma.
 * Set only at open, the pragma read back as 1 right up until the first write and
 * then became 0 — the schema's foreign keys were enforced on a brand-new
 * archive and never again, which is the exact failure mode this app exists to
 * complain about: a claim that quietly stops being true.
 *
 * Measured, not assumed: after open the pragma reads 1, after export() it reads
 * 0, and an insert referencing a missing row succeeds again.
 */
function applyConnectionPragmas() {
  if (!db) return;
  try {
    db.run("PRAGMA foreign_keys = ON");
  } catch (err) {
    console.warn("[db.pragma]", err && err.message);
  }
}

async function initDb(options = {}) {
  if (options.userDataDir) {
    userDataDirValue = options.userDataDir;
  }

  ensureDir(dataDir());
  dbPathValue = archiveDbPath();

  if (!dbReady) {
    dbReady = (async () => {
      const SQLModule = await SQL();
      if (fs.existsSync(dbPathValue)) {
        const buf = fs.readFileSync(dbPathValue);
        db = new SQLModule.Database(buf);
        /* Opening a damaged file does not throw — the first statement does, and
           it used to be an unrelated later one, so a corrupt archive reported
           "file is not a database" from inside the seed and killed the boot
           before any window existed. Probe here so the failure is attributed to
           the file we just read, and the caller can say what actually happened. */
        db.exec("SELECT name FROM sqlite_master LIMIT 1");
        applyConnectionPragmas();
        // An archive written by an older build is brought forward in place, and
        // only written back if the schema actually changed.
        if (migrate()) saveDb();
        return db;
      }
      db = new SQLModule.Database();
      /* The schema declares foreign keys; without this they are documentation.
         A next action could be filed against an object that does not exist and
         would then never be reachable from any record. */
      applyConnectionPragmas();
      db.run(`CREATE TABLE IF NOT EXISTS worlds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS objects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        world_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sort_title TEXT NOT NULL,
        summary TEXT NOT NULL,
        what_is TEXT,
        why_abandoned TEXT,
        lesson TEXT,
        status TEXT,
        status_note TEXT,
        location_note TEXT,
        certainty TEXT NOT NULL DEFAULT 'unknown',
        certainty_note TEXT,
        -- Which kind of thing this is, so the map's silhouette can say WHAT was
        -- left where its colour says how well we know it.
        mark TEXT,
        era TEXT,
        mission_code TEXT,
        year INTEGER,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (world_id) REFERENCES worlds(id)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS stakeholders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        object_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        name TEXT NOT NULL,
        note TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (object_id) REFERENCES objects(id)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        object_id INTEGER NOT NULL,
        kind TEXT NOT NULL,
        title TEXT NOT NULL,
        reference TEXT,
        nasa_id TEXT,
        nasa_url TEXT,
        nasa_caption TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (object_id) REFERENCES objects(id)
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS next_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        object_id INTEGER NOT NULL,
        made_by TEXT NOT NULL,
        made_at TEXT NOT NULL,
        action TEXT NOT NULL,
        why TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        FOREIGN KEY (object_id) REFERENCES objects(id)
      )`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_objects_world ON objects(world_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_objects_certainty ON objects(certainty)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_next_actions_object ON next_actions(object_id)`);
      saveDb();
      return db;
    })();
  }

  await dbReady;
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("database not initialized");
  }
  return db;
}

function saveDb() {
  if (!db) return;
  try {
    ensureDir(dataDir());
    const bytes = db.export();
    fs.writeFileSync(dbPathValue, Buffer.from(bytes));
  } catch (err) {
    console.warn("[db.save]", err && err.message);
  } finally {
    // export() reopened the connection, so the pragmas have to be re-applied or
    // the first write of the session is also the last one that was protected.
    applyConnectionPragmas();
  }
}

function closeDb() {
  if (db) {
    try {
      saveDb();
      db.close();
    } catch (err) {
      console.warn("[db.close]", err && err.message);
    }
    db = null;
  }
}

module.exports = { initDb, getDb, saveDb, closeDb, dbPath: archiveDbPath, dataDir };
