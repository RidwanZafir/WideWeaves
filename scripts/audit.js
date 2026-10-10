/* Trust-boundary and data-integrity audit: the real sql.js DB, the real seed,
   and the real IPC handlers, in an isolated temp directory.

   Every assertion here failed before the audit pass. They are kept as a suite
   because each one is a behaviour a curator would notice and no other harness
   covers: a search that quietly returns the wrong rows, and a write that is
   accepted against a record that does not exist. */

const path = require("path");
const os = require("os");
const fs = require("fs");
const crypto = require("crypto");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-audit-"));
process.chdir(tmp);

const { initDb, closeDb, getDb } = require("../src/db");
const { seedIfEmpty } = require("../src/seed");
const { registerHandlers } = require("../src/renderer-handlers");

const handlers = new Map();
registerHandlers({ ipcMain: { handle: (c, fn) => handlers.set(c, fn) } });

let failures = 0;

function check(name, condition, detail) {
  if (condition) {
    console.log("  PASS  " + name);
  } else {
    failures++;
    console.log("  FAIL  " + name + (detail !== undefined ? "  -> " + detail : ""));
  }
}

function call(channel) {
  const fn = handlers.get(channel);
  if (!fn) throw new Error("no handler for " + channel);
  return fn.apply(null, [null].concat(Array.prototype.slice.call(arguments, 1)));
}

function refusal(fn) {
  try {
    const value = fn();
    return { threw: false, value: value };
  } catch (err) {
    return { threw: true, message: (err && err.message) || String(err) };
  }
}

async function main() {
  await initDb({ userDataDir: tmp });
  await seedIfEmpty();

  /* ---- 1. corrupt archives are attributed to the file they came from -------
     Reading a damaged file does not throw at open; the first statement does. It
     used to be an unrelated later statement, so the app reported "file is not a
     database" from inside the seed. */
  console.log("\n== a damaged archive is diagnosed at the point of reading it ==");
  const corruptDir = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-audit-corrupt-"));
  fs.mkdirSync(path.join(corruptDir, "data"), { recursive: true });
  fs.writeFileSync(path.join(corruptDir, "data", "archive.db"), crypto.randomBytes(4096));

  /* initDb opens a connection once per module instance, so exercising the
     corrupt path needs its own instance. The original entry is put back
     afterwards so the rest of the audit runs against the real module. */
  const dbPath = require.resolve("../src/db");
  const original = require.cache[dbPath];
  delete require.cache[dbPath];
  const fresh = require("../src/db");
  const opened = await fresh
    .initDb({ userDataDir: corruptDir })
    .then(() => ({ ok: true }))
    .catch((err) => ({ ok: false, message: (err && err.message) || String(err) }));
  delete require.cache[dbPath];
  require.cache[dbPath] = original;

  check("opening a damaged archive rejects rather than half-opening", !opened.ok, JSON.stringify(opened));
  check(
    "the rejection names the actual problem",
    !opened.ok && /not a database|malformed|encrypted/i.test(opened.message),
    opened.message
  );
  check("the healthy connection is unaffected by the failed open", call("archive:objects", {}).length === 18);
  fs.rmSync(corruptDir, { recursive: true, force: true });

  /* ---- 2. search treats wildcards as characters --------------------------- */
  console.log("\n== search: LIKE wildcards are characters, not operators ==");
  check("baseline is the whole archive", call("archive:objects", {}).length === 18);

  const percent = call("archive:objects", { q: "%" });
  check("a literal % matches nothing", percent.length === 0, percent.length + " rows — % acted as a wildcard");

  const underscore = call("archive:objects", { q: "_" });
  check("a literal _ matches nothing", underscore.length === 0, underscore.length + " rows — _ acted as a wildcard");

  const partiallyWild = call("archive:objects", { q: "surv%yor" });
  check(
    "an embedded % does not complete a word for you",
    partiallyWild.length === 0,
    partiallyWild.length + " rows — 'surv%yor' matched Surveyor"
  );

  const escapedBackslash = call("archive:objects", { q: "\\" });
  check("a lone backslash matches nothing and does not break the query", escapedBackslash.length === 0);

  check("a real term still matches", call("archive:objects", { q: "collision" }).length === 1);
  check("a real term searches missions too", call("archive:objects", { q: "Surveyor" }).length >= 1);
  check(
    "a case-insensitive match still works",
    call("archive:objects", { q: "SURVEYOR" }).length === call("archive:objects", { q: "surveyor" }).length
  );

  const huge = call("archive:objects", { q: "x".repeat(5000) });
  check("an absurd query returns nothing instead of scanning forever", huge.length === 0);

  /* ---- 3. the boundary does not trust its caller -------------------------- */
  console.log("\n== the IPC boundary validates what it is handed ==");
  check("objects(null) does not throw", call("archive:objects", null).length === 18);
  check("objects('a string') does not throw", call("archive:objects", "a string").length === 18);
  check("objects({worldCode: 123}) ignores the malformed filter", call("archive:objects", { worldCode: 123 }).length === 18);
  check("objects({q: null}) does not throw", call("archive:objects", { q: null }).length === 18);

  check("object(undefined) is a miss, not a crash", call("archive:object", undefined) === null);
  check("object(0) is a miss", call("archive:object", 0) === null);
  check("object(-1) is a miss", call("archive:object", -1) === null);
  check("object('nonsense') is a miss", call("archive:object", "nonsense") === null);
  check("object('3') still resolves the numeric string", call("archive:object", "3") !== null);

  /* ---- 4. a next action cannot be filed against nothing ------------------- */
  console.log("\n== a next action must have a real target and real content ==");
  const before = getDb().exec("SELECT COUNT(*) FROM next_actions")[0].values[0][0];

  const ghost = refusal(() => call("archive:add-next-action", 999999, "Flag it", "Because."));
  check("filing against a non-existent object is refused", ghost.threw, JSON.stringify(ghost));
  check(
    "the refusal names the id",
    ghost.threw && /999999/.test(ghost.message),
    ghost.message
  );

  const emptyAction = refusal(() => call("archive:add-next-action", 1, "   ", "Because."));
  check("an empty action is refused", emptyAction.threw, JSON.stringify(emptyAction));

  const emptyWhy = refusal(() => call("archive:add-next-action", 1, "Flag it", ""));
  check("an empty reason is refused", emptyWhy.threw, JSON.stringify(emptyWhy));

  const undefinedWhy = refusal(() => call("archive:add-next-action", 1, "Flag it", undefined));
  check("an undefined reason is refused with a sentence", undefinedWhy.threw && !!undefinedWhy.message, undefinedWhy.message);

  const badTarget = refusal(() => call("archive:add-next-action", "not-an-id", "Flag it", "Because."));
  check("a non-numeric target is refused", badTarget.threw, JSON.stringify(badTarget));

  const after = getDb().exec("SELECT COUNT(*) FROM next_actions")[0].values[0][0];
  check("no refused write reached the table", after === before, before + " -> " + after);

  const orphans = getDb().exec(
    "SELECT COUNT(*) FROM next_actions WHERE object_id NOT IN (SELECT id FROM objects)"
  )[0].values[0][0];
  check("the ledger has no orphan rows", orphans === 0, orphans + " orphans");

  /* ---- 5. the database enforces its own schema ---------------------------- */
  console.log("\n== declared foreign keys are enforced ==");
  const fk = getDb().exec("PRAGMA foreign_keys")[0].values[0][0];
  check("PRAGMA foreign_keys is on", fk === 1, "got " + fk);

  const rawOrphan = refusal(() =>
    getDb().run("INSERT INTO next_actions (object_id, made_by, made_at, action, why, status) VALUES (999999,'reviewer','now','a','b','open')")
  );
  check("a raw orphan insert is rejected by the database, not just the handler", rawOrphan.threw, JSON.stringify(rawOrphan));

  /* ---- 6. the field budget is real --------------------------------------- */
  console.log("\n== the field budget is enforced, not just displayed ==");
  const long = "L".repeat(900);
  const filed = call("archive:add-next-action", 1, long, long);
  check("an oversized action is accepted", filed === true);

  const stored = getDb().exec(
    "SELECT LENGTH(action), LENGTH(why) FROM next_actions ORDER BY id DESC LIMIT 1"
  )[0].values[0];
  check("the stored action is capped at 140", stored[0] === 140, "stored " + stored[0]);
  check("the stored reason is capped at 400", stored[1] === 400, "stored " + stored[1]);

  const readBack = call("archive:object", 1);
  check(
    "the capped action is readable through the record",
    readBack.nextActions.some((a) => a.action.length === 140),
    readBack.nextActions.length + " actions"
  );

  /* ---- 7. the happy path is unchanged ------------------------------------ */
  console.log("\n== the workflow still works ==");
  const ok = call("archive:add-next-action", 1, "Flag the site for review", "Because the record is thin.");
  check("a valid action is accepted", ok === true);
  const reread = call("archive:object", 1);
  const newest = reread.nextActions.map((a) => a.action);
  check("it comes back on the record", newest.indexOf("Flag the site for review") !== -1, newest.join(" | "));

  /* ---- 8. an archive from an older build still opens --------------------- */
  console.log("\n== an archive written before `mark` still opens ==");

  const oldDir = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-audit-old-"));
  fs.mkdirSync(path.join(oldDir, "data"), { recursive: true });

  // Build a real archive with the schema as it was before this column existed.
  const SQLModule = await require("sql.js")();
  const legacy = new SQLModule.Database();
  legacy.run(
    "CREATE TABLE worlds (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, created_at TEXT NOT NULL)"
  );
  legacy.run(`CREATE TABLE objects (
    id INTEGER PRIMARY KEY AUTOINCREMENT, world_id INTEGER NOT NULL, name TEXT NOT NULL,
    sort_title TEXT NOT NULL, summary TEXT NOT NULL, what_is TEXT, why_abandoned TEXT,
    lesson TEXT, status TEXT, status_note TEXT, location_note TEXT,
    certainty TEXT NOT NULL DEFAULT 'unknown', certainty_note TEXT, era TEXT,
    mission_code TEXT, year INTEGER, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)`);
  legacy.run(
    "CREATE TABLE stakeholders (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id INTEGER NOT NULL, role TEXT NOT NULL, name TEXT NOT NULL, note TEXT, created_at TEXT NOT NULL)"
  );
  legacy.run(
    "CREATE TABLE sources (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id INTEGER NOT NULL, kind TEXT NOT NULL, title TEXT NOT NULL, reference TEXT, created_at TEXT NOT NULL)"
  );
  legacy.run(
    "CREATE TABLE next_actions (id INTEGER PRIMARY KEY AUTOINCREMENT, object_id INTEGER NOT NULL, made_by TEXT NOT NULL, made_at TEXT NOT NULL, action TEXT NOT NULL, why TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'open')"
  );
  legacy.run("INSERT INTO worlds (code, name, created_at) VALUES ('moon', 'The Moon', 'then')");
  legacy.run(
    "INSERT INTO objects (world_id, name, sort_title, summary, certainty, created_at, updated_at) VALUES (1, 'Legacy object', 'Legacy object', 'Written by an older build.', 'high', 'then', 'then')"
  );
  fs.writeFileSync(path.join(oldDir, "data", "archive.db"), Buffer.from(legacy.export()));
  legacy.close();

  const legacyPath = require.resolve("../src/db");
  const originalModule = require.cache[legacyPath];
  delete require.cache[legacyPath];
  const legacyDb = require("../src/db");
  const legacyOpen = await legacyDb
    .initDb({ userDataDir: oldDir })
    .then(() => ({ ok: true }))
    .catch((err) => ({ ok: false, message: (err && err.message) || String(err) }));

  check("an archive from the previous schema still opens", legacyOpen.ok, legacyOpen.message || "opened");

  if (legacyOpen.ok) {
    const columns = legacyDb.getDb().exec("PRAGMA table_info(objects)")[0].values.map((r) => r[1]);
    check("the missing column was added in place", columns.indexOf("mark") !== -1, columns.join(", "));

    const kept = legacyDb.getDb().exec("SELECT name, mark FROM objects");
    check(
      "the existing record survived the migration",
      kept[0].values.length === 1 && kept[0].values[0][0] === "Legacy object",
      JSON.stringify(kept[0].values)
    );
    check(
      "the new column is left empty for old records rather than guessed at",
      kept[0].values[0][1] === null,
      JSON.stringify(kept[0].values[0][1])
    );

    // Running it twice must be a no-op: migrations that are not idempotent are
    // how a second launch corrupts what the first one fixed.
    const again = legacyDb.getDb().exec("PRAGMA table_info(objects)")[0].values.filter((r) => r[1] === "mark").length;
    check("the migration did not add the column twice", again === 1, again + " copies");
  }

  legacyDb.closeDb();
  delete require.cache[legacyPath];
  require.cache[legacyPath] = originalModule;
  fs.rmSync(oldDir, { recursive: true, force: true });

  /* ---- an archive that predates the citations must still receive them -----
     This is the defect that shipped: the app created its archive on first run,
     `seedIfEmpty()` then returned early forever, and every NASA photo and film
     added in a later build never reached that installation. The archive looked
     empty of resources and the app looked broken. */
  console.log("\n== an archive from an older build is brought forward ==");

  const staleDir = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-audit-stale-"));

  /* Fresh copies of BOTH modules: seed.js holds a reference to the db module it
     required, so clearing only the db cache would leave seed writing to the
     other database entirely — a test that passes while proving nothing. */
  const staleDbPath = require.resolve("../src/db");
  const staleSeedPath = require.resolve("../src/seed");
  const staleOriginalDb = require.cache[staleDbPath];
  const staleOriginalSeed = require.cache[staleSeedPath];
  delete require.cache[staleDbPath];
  delete require.cache[staleSeedPath];

  const staleDb = require("../src/db");
  const staleSeed = require("../src/seed");

  await staleDb.initDb({ userDataDir: staleDir });
  await staleSeed.seedIfEmpty();

  const sd = staleDb.getDb();
  sd.run("DELETE FROM meta WHERE key = 'seed_version'");
  sd.run("DELETE FROM sources WHERE nasa_id IS NOT NULL");
  const beforeUpgrade = sd.exec("SELECT COUNT(*) FROM sources WHERE nasa_id IS NOT NULL")[0].values[0][0];
  check("the simulated old archive starts with no citations at all", beforeUpgrade === 0, beforeUpgrade + " rows");

  await staleSeed.seedIfEmpty();

  const upgraded = staleDb.getDb();
  const afterUpgrade = upgraded.exec("SELECT COUNT(*) FROM sources WHERE nasa_id IS NOT NULL")[0].values[0][0];
  const videos = upgraded.exec("SELECT COUNT(*) FROM sources WHERE nasa_url LIKE '%youtube%'")[0].values[0][0];
  const photos = upgraded.exec("SELECT COUNT(*) FROM sources WHERE nasa_id LIKE 'PIA%'")[0].values[0][0];
  check("opening the old build's archive delivers every citation", afterUpgrade === 7, afterUpgrade + " of 7");
  // The three photographs are the ones an old archive ALREADY has a row for,
  // with no citation on it. Skipping those on a title match is how two of the
  // three silently vanished the first time this was written.
  check("existing uncited rows are enriched, not skipped", photos === 3, photos + " of 3 photos");
  check("the videos reach it too", videos === 4, videos + " video sources");

  const version = upgraded.exec("SELECT value FROM meta WHERE key = 'seed_version'")[0].values[0][0];
  check("the archive records which pilot set it is on", Number(version) >= 2, "seed_version=" + version);

  // A curator's own work must survive an upgrade untouched.
  const writeTarget = upgraded.exec("SELECT id FROM objects LIMIT 1")[0].values[0][0];
  upgraded.run(
    "INSERT INTO next_actions (object_id, made_by, made_at, action, why, status) VALUES (?, 'curator', 'whenever', 'A note the curator wrote', 'Because.', 'open')",
    [writeTarget]
  );
  await staleSeed.seedIfEmpty();
  const kept = upgraded.exec("SELECT COUNT(*) FROM next_actions WHERE made_by = 'curator'")[0].values[0][0];
  check("an upgrade never touches what a curator wrote", kept === 1, kept + " curator rows");

  await staleSeed.seedIfEmpty();
  const onceMore = upgraded.exec("SELECT COUNT(*) FROM sources WHERE nasa_id IS NOT NULL")[0].values[0][0];
  check("opening again does not duplicate anything", onceMore === afterUpgrade, `${afterUpgrade} -> ${onceMore}`);

  staleDb.closeDb();
  delete require.cache[staleDbPath];
  delete require.cache[staleSeedPath];
  require.cache[staleDbPath] = staleOriginalDb;
  require.cache[staleSeedPath] = staleOriginalSeed;
  fs.rmSync(staleDir, { recursive: true, force: true });

  console.log("");
  console.log(failures === 0 ? "ALL AUDIT CHECKS PASSED" : failures + " AUDIT CHECK(S) FAILED");
  console.log("");
  console.log("  note: the archive-upgrade block above simulates a stale archive by");
  console.log("        stripping citations from a fresh one. The live path is covered by");
  console.log("        package.js --boot, which runs the real .exe against a throwaway");
  console.log("        user-data dir and seeds it from nothing.");

  closeDb();
  try {
    fs.rmSync(tmp, { recursive: true, force: true });
  } catch (_) {}
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.log("");
  console.log("  FAIL  audit harness threw");
  console.log(err && err.stack ? err.stack : String(err));
  process.exit(1);
});
