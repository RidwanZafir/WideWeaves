const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "shots");
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-debug-"));
app.setPath("userData", TMP);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const { initDb, closeDb } = require(path.join(ROOT, "src", "db"));
  const { seedIfEmpty } = require(path.join(ROOT, "src", "seed"));
  const { registerHandlers } = require(path.join(ROOT, "src", "renderer-handlers"));

  await initDb({ userDataDir: TMP });
  await seedIfEmpty();
  registerHandlers({ ipcMain });

  fs.mkdirSync(OUT, { recursive: true });

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    backgroundColor: "#0b0e14",
    webPreferences: {
      devTools: false,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(ROOT, "src", "preload.js"),
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: false
    }
  });

  const run = (js) => win.webContents.executeJavaScript(js, true);

  win.webContents.on("console-message", (event) => {
    // Electron console-message level is numeric: 0/log 1/info 2/warn 3/error
    const level = event.level;
    const msg = String(event.message || "");
    if (level >= 2) {
      console.log(`[console-${level === 3 ? "error" : level === 2 ? "warn" : "log"}] ${msg.slice(0, 400)}`);
    }
  });

  win.webContents.on("preload-error", (_e, preloadPath, error) => {
    console.log(`[preload-error ${preloadPath}] ${error && error.message}`);
  });
  win.webContents.on("render-process-gone", (_e, details) => {
    console.log(`[render-process-gone] ${JSON.stringify(details)}`);
  });

  await win.loadFile(path.join(ROOT, "dist", "index.html"));
  await sleep(700);

  win.showInactive();
  await sleep(450);

  console.log("=== rendering first three frames to disk ===");
  for (let i = 0; i < 3; i++) {
    await sleep(350);
    const img = await win.webContents.capturePage();
    const png = img.toPNG();
    const file = path.join(OUT, `debug-frame-${i + 1}.png`);
    fs.writeFileSync(file, png);
    console.log(`  wrote ${file}  ${Math.round(png.length / 1024)} KB`);
  }

  await win.webContents.reload();
  await sleep(700);
  win.showInactive();
  await sleep(450);

  const img2 = await win.webContents.capturePage();
  const png2 = img2.toPNG();
  const file2 = path.join(OUT, `debug-reload.png`);
  fs.writeFileSync(file2, png2);
  console.log(`  wrote ${file2}  ${Math.round(png2.length / 1024)} KB`);

  console.log("=== done ===");

  closeDb();
  try {
    fs.rmSync(TMP, { recursive: true, force: true });
  } catch (_) {}
  app.exit(0);
}

app.whenReady().then(() =>
  main().catch((err) => {
    console.log(`[harness error] ${err && err.stack ? err.stack.split("\n")[0] : String(err)}`);
    app.exit(1);
  })
);
