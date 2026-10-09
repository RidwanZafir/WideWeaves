const path = require("path");
const { app, BrowserWindow, ipcMain } = require("electron");
const { initDb, closeDb } = require("./src/db");
const { seedIfEmpty } = require("./src/seed");
const { registerHandlers } = require("./src/renderer-handlers");
const { createWindow } = require("./src/window");

/*
 * The archive is opened before the window, because the window is a view of it.
 *
 * "Before" must not mean "instead of", though. This used to be:
 *
 *   app.on("ready", async () => { await bootstrap(); createWindow(); });
 *
 * so a failure inside bootstrap skipped `createWindow()` entirely. With a
 * damaged archive the app became a windowless process — three live processes and
 * nothing on screen, and the only trace an `UnhandledPromiseRejectionWarning` on
 * a stderr that nobody running a packaged app will ever look at. Worse, the
 * renderer already knew how to draw exactly this: its `fatal()` state reads
 * "The archive did not open." — a screen that could never appear, because the
 * renderer was never loaded to draw it.
 *
 * So the window always opens, and the failure travels to the renderer as the
 * reason every archive call rejects. The error screen is now reachable, which is
 * the whole point of having written it.
 */

let bootFailure = null;

async function bootstrap() {
  await initDb({ userDataDir: app.getPath("userData") });
  await seedIfEmpty();
}

/*
 * Turn a raw failure into something a curator can act on. The archive path is
 * named because the useful next step is to find that file, and the copy is
 * explicitly left in place — an app that silently replaces an unreadable archive
 * with a fresh one destroys the thing it exists to preserve.
 */
function describeBootFailure(err) {
  const raw = (err && err.message) || String(err) || "unknown error";
  const archivePath = path.join(app.getPath("userData"), "data", "archive.db");

  if (/not a database|malformed|encrypted|no such table/i.test(raw)) {
    return (
      "the file at " +
      archivePath +
      " is not a readable archive. It may be damaged or only partly written. " +
      "Move it aside and reopen the app to start a fresh archive — the existing " +
      "file is left exactly where it is, so nothing is discarded."
    );
  }
  if (/SQLITE_(CANTOPEN|READONLY|PERM|BUSY)|EBUSY|EACCES|EPERM/i.test(raw)) {
    return (
      "the archive at " +
      archivePath +
      " could not be opened — another copy of the app may be holding it, or the " +
      "folder may not be writable."
    );
  }
  return raw;
}

async function start() {
  try {
    await bootstrap();
    bootFailure = null;
  } catch (err) {
    bootFailure = describeBootFailure(err);
    // Not the report to the user — the window is. This is for a developer
    // running from a terminal.
    console.error("[boot] the archive could not be opened:", bootFailure);
  }
}

/*
 * Every channel is still registered on a failed boot, so the renderer's calls
 * reject with the reason instead of failing with "no handler registered for
 * archive:worlds" — an error about the plumbing rather than about the problem.
 */
function registerHandlersForBoot() {
  const target = bootFailure
    ? {
        handle: (channel) =>
          ipcMain.handle(channel, () => Promise.reject(new Error(bootFailure)))
      }
    : ipcMain;
  registerHandlers({ ipcMain: target });
}

app.on("ready", async () => {
  await start();
  registerHandlersForBoot();
  createWindow();
});

app.on("window-all-closed", () => {
  closeDb();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  closeDb();
});

module.exports = {
  bootstrap,
  describeBootFailure,
  registerHandlersForBoot,
  getBootFailure: () => bootFailure,
  setBootFailure: (value) => {
    bootFailure = value;
  }
};
