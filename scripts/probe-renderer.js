/* Renderer smoke probe — "is the workspace actually drawing anything?"
 *
 * This started as a throwaway written while the renderer was reading the async
 * preload bridge synchronously: the app booted, the harness passed, and the
 * rail was empty. A screenshot would have shown it, but this prints the two
 * numbers that matter in one line, which is faster than looking.
 *
 * It is deliberately NOT part of any suite. It duplicates no contract — it
 * exists so that "is the UI alive?" can be answered in one command without
 * waiting on 85 checks that are about something else.
 *
 * Run:  npx electron scripts/probe-renderer.js
 */

const { app, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-probe-"));
app.setPath("userData", TMP);

async function main() {
  const db = require(path.join(ROOT, "src", "db"));
  const { seedIfEmpty } = require(path.join(ROOT, "src", "seed"));
  const { registerHandlers } = require(path.join(ROOT, "src", "renderer-handlers"));

  await db.initDb({ userDataDir: TMP });
  await seedIfEmpty();
  registerHandlers({ ipcMain });

  const { createWindow } = require(path.join(ROOT, "src", "window"));
  const win = createWindow({ show: false });

  win.webContents.on("console-message", (e) => {
    console.log(`[console level=${e.level}] ${String(e.message).slice(0, 800)}`);
  });
  win.webContents.on("preload-error", (_e, p, err) => console.log(`[preload-error] ${err.message}`));

  await win.loadFile(path.join(ROOT, "dist", "index.html"));
  await new Promise((r) => setTimeout(r, 1200));

  try {
    const out = await win.webContents.executeJavaScript(
      `(function () {
        var rows = document.querySelectorAll('#record-list li').length;
        var key = document.querySelector('#rail-key');
        var canvas = document.querySelector('#viewport canvas');
        return rows + ' rows / key:' + (key ? key.textContent.slice(0, 60) : 'NO-KEY') +
          ' / 3d:' + (canvas ? 'canvas present' : 'fallback map');
      })()`,
      true
    );
    console.log("PROBE: " + out);
  } catch (err) {
    console.log("PROBE THREW: " + err.message);
  }

  app.exit(0);
}

app.whenReady().then(main);