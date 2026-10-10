const { BrowserWindow, shell } = require("electron");
const path = require("path");

const INDEX_HTML = path.join(__dirname, "..", "dist", "index.html");

/*
 * The hardlock, as one inspectable object.
 *
 * It is exported because `webContents.getLastWebPreferences()` does not report
 * `devTools` at all, so the lock cannot be asserted through the live window.
 * The verification harness checks this object plus the observed behaviour
 * (openDevTools() refused), which together cover both layers.
 */
const WEB_PREFERENCES = Object.freeze({
  // DevTools are off at the preference layer, which is the authoritative lock:
  // with devTools:false, openDevTools() cannot open them at all.
  devTools: false,
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  webSecurity: true,
  allowRunningInsecureContent: false,
  // The renderer gets no ambient Node, so the preload bridge is the only way in.
  preload: path.join(__dirname, "preload.js"),
  spellcheck: false
});

/*
 * The one place a window is configured.
 *
 * main.js and the verification harnesses both call this, so the harness tests
 * the configuration that actually ships instead of a copy that can drift.
 */
function createWindow(options = {}) {
  const { width = 1280, height = 820, show = true } = options;

  const win = new BrowserWindow({
    width,
    height,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    backgroundColor: "#ffffff",
    // Belt and braces with Menu.setApplicationMenu(null): even if something
    // reintroduces a menu, this window will not present one.
    autoHideMenuBar: true,
    webPreferences: { ...WEB_PREFERENCES }
  });

  // Belt and braces: also refuse any DevTools request that reaches the window
  // (menu, accelerator, or a programmatic request).
  win.webContents.on("devtools-requested", (event) => {
    event.preventDefault();
  });

  // NASA/ESA citations are real https links. The archive itself stays offline
  // (connect-src 'none'), so outside navigation never happens inside the
  // instrument: it opens in the system browser and the app window stays put.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\/(images\.nasa\.gov|science\.nasa\.gov|photojournal\.jpl\.nasa\.gov|www\.nasa\.gov|www\.youtube\.com|youtu\.be|www\.esa\.int|esa\.int)\//.test(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });
  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) event.preventDefault();
  });

  if (show) {
    win.once("ready-to-show", () => win.show());
  }

  win.loadFile(INDEX_HTML);

  return win;
}

module.exports = { createWindow, INDEX_HTML, WEB_PREFERENCES };
