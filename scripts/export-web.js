/* Abandoned but Not Forgotten — static web export for Vercel.
 *
 * The shipped app is Electron (dist/ + SQLite via IPC). Vercel can't run
 * Electron or Node servers, so this bakes the same preview fixture the
 * preview server builds dynamically into a static folder:
 *
 *   node scripts/export-web.js   ->   web/index.html + web/__fixture.js + web/__bridge.js + assets
 *
 * Vercel serves `web/` as-is (see vercel.json). The renderer runs unmodified:
 * __bridge.js provides the same `window.archive` surface as src/preload.js,
 * backed by a snapshot of the real seed data. Writes are in-memory only —
 * same contract as `npm run preview`.
 */

const fs = require("fs");
const path = require("path");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(ROOT, "web");

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry));
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

function bridgeJs() {
  // Same shim as scripts/preview-server.js — same surface, same shapes.
  return `(function () {
  var f = window.__ABNF_FIXTURE;
  var details = f.details.map(function (d) { return Object.assign({}, d); });

  function find(id) { return details.find(function (d) { return d.id === Number(id); }); }
  function like(value, q) { return String(value || "").toLowerCase().indexOf(q) !== -1; }

  window.archive = {
    worldCount: function () { return Promise.resolve(f.worlds.length); },
    worlds: function () { return Promise.resolve(f.worlds); },
    objectCount: function () { return Promise.resolve(f.list.length); },
    objects: function (opts) {
      opts = opts || {};
      var q = opts.q ? String(opts.q).toLowerCase() : "";
      var rows = f.list.filter(function (o) {
        if (opts.worldCode && o.worldCode !== opts.worldCode) return false;
        if (!q) return true;
        return like(o.name, q) || like(o.missionCode, q) || like(o.summary, q) || like(o.lesson, q);
      });
      return Promise.resolve(rows.map(function (o) { return Object.assign({}, o); }));
    },
    object: function (id) { return Promise.resolve(find(id) || null); },
    certaintyBadge: function (c) {
      var map = {
        high: { label: "Well documented", tone: "high" },
        medium: { label: "Reasonably certain", tone: "medium" },
        variable: { label: "Varies by object", tone: "variable" },
        low: { label: "Uncertain", tone: "low" },
        unknown: { label: "Not yet established", tone: "low" }
      };
      return Promise.resolve(map[c] || map.unknown);
    },
    addNextAction: function (objectId, action, why) {
      var d = find(objectId);
      if (d) {
        d.nextActions.unshift({
          id: Date.now(), madeBy: "reviewer", madeAt: new Date().toISOString(),
          action: action, why: why, status: "open"
        });
      }
      return Promise.resolve(true);
    },
    meta: function () {
      return Promise.resolve({
        appName: "Abandoned but Not Forgotten",
        description: "Web preview of the real renderer.",
        version: "web"
      });
    }
  };
})();
`;
}

async function main() {
  const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-export-"));
  const { initDb } = require(path.join(ROOT, "src", "db"));
  const { seedIfEmpty } = require(path.join(ROOT, "src", "seed"));
  const { registerHandlers } = require(path.join(ROOT, "src", "renderer-handlers"));

  await initDb({ userDataDir: TMP });
  await seedIfEmpty();

  const handlers = {};
  registerHandlers({ ipcMain: { handle(channel, fn) { handlers[channel] = fn; } } });
  const call = (channel, ...args) => handlers[channel]({}, ...args);

  const worlds = await call("archive:worlds");
  const list = await call("archive:objects", {});
  const details = [];
  for (const row of list) details.push(await call("archive:object", row.id));

  const byId = new Map(details.map((d) => [d.id, d]));
  const fixtureList = list.map((row) => {
    const d = byId.get(row.id);
    return Object.assign({}, row, {
      worldCode: d ? d.worldCode : null,
      lesson: d ? d.lesson : null
    });
  });
  const fixture = { worlds, list: fixtureList, details };

  // Fresh output dir, seeded from dist/ verbatim.
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  copyRecursive(DIST, OUT);

  fs.writeFileSync(
    path.join(OUT, "__fixture.js"),
    `window.__ABNF_FIXTURE = ${JSON.stringify(fixture)};\n`
  );
  fs.writeFileSync(path.join(OUT, "__bridge.js"), bridgeJs());

  // Inject the shim into index.html, same as the preview server does at runtime.
  const indexPath = path.join(OUT, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  if (!html.includes('src="app.js"')) {
    throw new Error("export-web: dist/index.html no longer loads app.js");
  }
  const shim = '<script src="__fixture.js"></script><script src="__bridge.js"></script>';
  html = html.replace('<script src="app.js"></script>', shim + "\n    " + '<script src="app.js"></script>');
  fs.writeFileSync(indexPath, html);

  console.log(`export-web: wrote ${OUT} (${fixtureList.length} records, ${worlds.length} worlds)`);
}

main().catch((err) => {
  console.error("export-web failed:", err && err.stack ? err.stack : err);
  process.exit(1);
});
