/* Abandoned but not Forgotten — design preview server.
 *
 * Why this exists: the app is an Electron window, so the only way to look at the
 * interface during a design pass is to relaunch it and squint at PNGs. This
 * serves the *real* dist/index.html, dist/styles.css and dist/app.js to a
 * browser, with the *real* data layer (src/db.js + src/seed.js +
 * src/renderer-handlers.js) behind a browser-side shim of the preload bridge.
 *
 * It is a design/dev tool. It is not part of the shipped app:
 *   - it never writes to the user's real archive (throwaway userData dir)
 *   - the page keeps its own CSP (no inline script, same-origin scripts only)
 *   - nothing here is loaded by Electron, main.js or the packaged build
 *
 * Run:  npm run preview      (then open http://127.0.0.1:4321)
 */

const http = require("http");
const path = require("path");
const fs = require("fs");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const PORT = Number(process.env.PREVIEW_PORT || 4321);
const HOST = "127.0.0.1";

// Throwaway archive, so a preview session can never touch real user records.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-preview-"));

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2"
};

// The renderer only ever talks to `window.archive`. Collect the real handlers by
// handing registerHandlers a stand-in for Electron's ipcMain.
const handlers = {};
const fakeIpcMain = {
  handle(channel, fn) {
    handlers[channel] = fn;
  }
};

async function main() {
  const { initDb } = require(path.join(ROOT, "src", "db"));
  const { seedIfEmpty } = require(path.join(ROOT, "src", "seed"));
  const { registerHandlers } = require(path.join(ROOT, "src", "renderer-handlers"));

  await initDb({ userDataDir: TMP });
  await seedIfEmpty();
  registerHandlers({ ipcMain: fakeIpcMain });

  const call = (channel, ...args) => {
    const fn = handlers[channel];
    if (!fn) throw new Error(`no handler registered for ${channel}`);
    return fn({}, ...args);
  };

  // One snapshot of the seeded archive, shaped for browser-side filtering that
  // mirrors the SQL in archive:objects (same fields, same LIKE semantics, same
  // ordering that the handler already applied).
  const worlds = call("archive:worlds");
  const list = call("archive:objects", {});
  const details = list.map((row) => call("archive:object", row.id));

  const byId = new Map(details.map((d) => [d.id, d]));
  const fixtureList = list.map((row) => {
    const d = byId.get(row.id);
    return Object.assign({}, row, {
      worldCode: d ? d.worldCode : null,
      lesson: d ? d.lesson : null
    });
  });

  const fixture = { worlds, list: fixtureList, details };

  const ROUTES = {
    // Data as a real script file, so the page's `script-src 'self'` policy holds.
    "/__fixture.js": () =>
      `window.__ABNF_FIXTURE = ${JSON.stringify(fixture)};\n`,

    // A stand-in for src/preload.js. Same surface, same argument shapes, so the
    // renderer runs unmodified. Filtering mirrors the SQL; the write path is
    // in-memory only (persistence is proven by scripts/render-check.js, which
    // runs the real Electron IPC against the real SQLite file).
    "/__bridge.js": () => `(function () {
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
        description: "Design preview of the real renderer.",
        version: "preview"
      });
    }
  };
})();\n`
  };

  const server = http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, `http://${HOST}`).pathname);
    } catch (_) {
      res.writeHead(400).end("bad request");
      return;
    }

    if (pathname === "/") pathname = "/index.html";

    // The shell exactly as it ships, with no bridge: the only way to exercise
    // the renderer's own failure state (`fatal`) outside the packaged app.
    if (pathname === "/raw.html") {
      const raw = fs.readFileSync(path.join(DIST, "index.html"));
      res.writeHead(200, { "content-type": TYPES[".html"], "cache-control": "no-store", "x-abnf-preview": "no-bridge" });
      res.end(raw);
      return;
    }

    if (Object.prototype.hasOwnProperty.call(ROUTES, pathname)) {
      const body = ROUTES[pathname]();
      res.writeHead(200, {
        "content-type": TYPES[".js"],
        "cache-control": "no-store",
        "x-abnf-preview": "shim"
      });
      res.end(body);
      return;
    }

    // Static files come from dist/ only, and never escape it.
    const file = path.resolve(DIST, "." + pathname);
    if (!file.startsWith(DIST + path.sep) && file !== DIST) {
      res.writeHead(403).end("outside dist");
      return;
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { "content-type": "text/plain" }).end("not found: " + pathname);
      return;
    }

    let body = fs.readFileSync(file);
    if (pathname === "/index.html") {
      const shim = '<script src="/__fixture.js"></script><script src="/__bridge.js"></script>';
      const html = body.toString("utf8");
      if (!html.includes('src="app.js"')) {
        console.error("preview: dist/index.html no longer loads app.js — shim not injected");
        res.writeHead(500).end("index.html changed shape");
        return;
      }
      body = Buffer.from(html.replace('<script src="app.js"></script>', shim + "\n    " + '<script src="app.js"></script>'));
    }

    res.writeHead(200, {
      "content-type": TYPES[path.extname(file)] || "application/octet-stream",
      "cache-control": "no-store"
    });
    res.end(body);
  });

  server.listen(PORT, HOST, () => {
    console.log(`preview: http://${HOST}:${PORT}  (real renderer, real data layer; archive in ${TMP})`);
  });
}

main().catch((err) => {
  console.error("preview server failed:", err && err.stack ? err.stack : err);
  process.exit(1);
});
