/* Audit harness for behaviours that only exist once the real window is running:
   where keyboard focus ends up, what the reader is told when something fails,
   and whether the app can still show its own error screen at all.

   Run:  npx electron scripts/audit-window.js

   Every check here corresponds to a defect found in the audit pass. The last
   group is the most important: before it, the renderer's `fatal()` state — the
   screen that says "The archive did not open." — could never appear, because a
   failed boot meant no window was ever created to draw it. */

const { app, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const APP_DIR = path.join(ROOT, "dist", "index.html");

// Isolated from the real archive, like every other harness.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-auditw-"));
app.setPath("userData", TMP);

const results = [];
const consoleErrors = [];

function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail === undefined ? "" : String(detail) });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function onConsole(...args) {
  const event = args[0];
  const isNewShape = event && typeof event === "object" && "message" in event && "level" in event;
  const level = isNewShape ? event.level : args[1];
  const message = isNewShape ? event.message : args[2];
  const numeric = typeof level === "number" ? level : Number(level);
  const text = String(message || "");
  if (numeric === 3 || /Content Security Policy|Refused to|Uncaught/i.test(text)) {
    consoleErrors.push(text);
  }
}

async function main() {
  const db = require(path.join(ROOT, "src", "db"));
  const { seedIfEmpty } = require(path.join(ROOT, "src", "seed"));
  const { registerHandlers } = require(path.join(ROOT, "src", "renderer-handlers"));
  const { createWindow } = require(path.join(ROOT, "src", "window"));

  await db.initDb({ userDataDir: TMP });
  await seedIfEmpty();
  registerHandlers({ ipcMain });

  const win = createWindow({ show: false });
  win.webContents.on("console-message", onConsole);
  const run = (js) => win.webContents.executeJavaScript(js, true);

  await win.loadFile(APP_DIR);
  await sleep(700);

  /* ---- 1. activating a record with the keyboard does not lose the keyboard ---
     The stakes live inside the column that selection redraws, so activating one
     destroyed the focused element and dropped the reader onto <body>. Focus now
     lands on the heading of the record that opened. */
  console.log("\n== keyboard focus survives the column being redrawn ==");

  await win.showInactive();
  await win.webContents.focus();
  // One real key press, so the renderer considers the last interaction a
  // keyboard one and :focus-visible can match what we focus next.
  win.webContents.sendInputEvent({ type: "keyDown", keyCode: "Tab" });
  win.webContents.sendInputEvent({ type: "keyUp", keyCode: "Tab" });
  await sleep(150);

  const armed = await run(`(() => {
    const mark = document.querySelector('.map-mark');
    if (!mark) return { found: false };
    mark.focus();
    return { found: true, focusVisible: mark.matches(':focus-visible'), tag: document.activeElement.tagName };
  })()`);
  check("the intro map drew at least one stake to activate", armed.found, JSON.stringify(armed));
  check(
    "the harness can reproduce a keyboard interaction (:focus-visible matches)",
    armed.focusVisible,
    armed.focusVisible ? "keyboard modality armed" : "could not arm keyboard modality — focus check is inconclusive"
  );

  if (armed.found) {
    const afterFocus = await run(`(async () => {
      const mark = document.querySelector('.map-mark');
      const before = { tag: document.activeElement.tagName, cls: document.activeElement.className };
      mark.click();
      await new Promise((r) => setTimeout(r, 250));
      const active = document.activeElement;
      return {
        before,
        afterTag: active.tagName,
        afterText: (active.textContent || '').slice(0, 60),
        headingText: (document.querySelector('#record h2') || {}).textContent || ''
      };
    })()`);
    check(
      "focus is not dropped onto <body> when the map is replaced",
      afterFocus.afterTag !== "BODY",
      `${afterFocus.before.tag} -> ${afterFocus.afterTag}`
    );
    check(
      "focus lands on the heading of the record that opened",
      afterFocus.afterTag === "H2" &&
        afterFocus.headingText.length > 0 &&
        afterFocus.afterText === afterFocus.headingText,
      `${afterFocus.afterTag} "${afterFocus.afterText}" vs heading "${afterFocus.headingText}"`
    );
  }

  /* ---- 2. a record that will not open says so, and keeps your place -------- */
  console.log("\n== a failed open is reported, not swallowed ==");

  // Open a healthy record first, so we can prove the failure does not also
  // discard what the reader was already looking at.
  await run(`document.querySelector('#record-list .row').click()`);
  await sleep(300);
  const opened = await run(`(document.querySelector('#record h2') || {}).textContent || ''`);
  check("a record opens normally", opened.length > 0, opened);

  // Now remove a different object from underneath the view and click its row.
  const removedId = await run(`(() => {
    const rows = document.querySelectorAll('#record-list .row');
    const current = document.querySelector('#record h2').textContent;
    for (const row of rows) {
      if (row.querySelector('.row-title').textContent.indexOf(current) === -1) {
        return row.getAttribute('data-id');
      }
    }
    return rows.length > 1 ? rows[1].getAttribute('data-id') : null;
  })()`);

  if (removedId) {
    /* The dependent rows go first because the foreign keys are now enforced: a
       bare DELETE of the object is refused while sources, stakeholders or next
       actions still point at it. That is the constraint doing its job — and it
       is also a note for later, because the schema declares no ON DELETE
       CASCADE and the app has no delete path to trigger one. */
    const dbHandle = db.getDb();
    const id = Number(removedId);
    for (const table of ["next_actions", "sources", "stakeholders"]) {
      dbHandle.run(`DELETE FROM ${table} WHERE object_id = ?`, [id]);
    }
    dbHandle.run("DELETE FROM objects WHERE id = ?", [id]);
    await run(`document.querySelector('#record-list .row[data-id="${removedId}"]').click()`);
    await sleep(300);

    const failed = await run(`(() => {
      const notice = document.querySelector('.record-notice');
      return {
        present: !!notice,
        text: notice ? notice.textContent : '',
        role: notice ? notice.getAttribute('role') : null,
        heading: (document.querySelector('#record h2') || {}).textContent || ''
      };
    })()`);

    check("the reader is told the record could not be opened", failed.present && failed.text.length > 0, failed.text);
    check("the notice is announced, not just drawn", failed.role === "alert", String(failed.role));
    check(
      "the record already on screen is kept",
      failed.heading === opened,
      `"${failed.heading}" vs "${opened}"`
    );
  } else {
    check("a second record existed to remove", false, "only one row in the rail");
  }

  /* ---- 3. the new surfaces obey the flat contract -------------------------- */
  console.log("\n== the new notice surfaces obey the flat design contract ==");

  const style = await run(`(() => {
    const el = document.querySelector('.record-notice');
    if (!el) return { present: false };
    const cs = getComputedStyle(el);
    const srgb = (c) => {
      const m = c.match(/[\\d.]+/g).map(Number);
      return m.slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    };
    const lum = (c) => { const [r, g, b] = srgb(c); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
    const fg = lum(cs.color), bg = lum(cs.backgroundColor);
    const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
    return {
      present: true,
      radius: cs.borderTopLeftRadius,
      gradient: cs.backgroundImage,
      color: cs.color,
      background: cs.backgroundColor,
      borderLeft: cs.borderLeftWidth + ' ' + cs.borderLeftColor,
      contrast: Math.round(ratio * 100) / 100
    };
  })()`);

  check("the notice is on screen to measure", style.present);
  if (style.present) {
    check("the notice has hard pixel edges", style.radius === "0px", style.radius);
    check("the notice has no gradient", style.gradient === "none", style.gradient);
    check("the notice text clears AA", style.contrast >= 4.5, style.contrast + ":1");
    check("the notice is marked by an edge, not a glow", style.borderLeft.indexOf("3px") === 0, style.borderLeft);
  }

  /* ---- 4. the boot-failure screen is reachable -----------------------------
     With the archive closed, every channel rejects — which is exactly the state
     a failed bootstrap leaves behind. The renderer must reach its own fatal()
     state instead of showing an empty workspace. */
  console.log("\n== the archive-closed screen is reachable ==");

  db.closeDb();
  await win.webContents.reload();
  await sleep(800);

  const closed = await run(`(() => {
    const record = document.querySelector('#record');
    const count = document.querySelector('#rail-count');
    const boot = document.querySelector('.app');
    const fatal = document.querySelector('.intro-error');
    return {
      recordText: (record ? record.textContent : '').slice(0, 120),
      railCount: count ? count.textContent : '',
      bootAttr: boot ? boot.getAttribute('data-boot') : 'missing',
      hasErrorHeading: !!fatal,
      hasEmptyState: !!document.querySelector('#rail-empty') && !document.querySelector('#rail-empty').hidden
    };
  })()`);

  check(
    "the error screen says the archive did not open",
    /The archive did not open/i.test(closed.recordText),
    closed.recordText.trim()
  );
  check("the rail admits it has nothing rather than showing an empty list", closed.railCount === "unavailable", `"${closed.railCount}"`);
  check("the boot placeholder is cleared", closed.bootAttr === null, String(closed.bootAttr));
  check("the 'nothing matches that' empty state is not used for a failure", !closed.hasEmptyState);
  check("no console errors while failing gracefully", consoleErrors.length === 0, consoleErrors.join(" || ") || "clean");

  /* ---- report ------------------------------------------------------------- */
  console.log("");
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail.slice(0, 150)}]` : ""}`);
  }
  const failed = results.filter((r) => !r.pass);
  console.log("");
  console.log(failed.length === 0 ? "ALL WINDOW AUDIT CHECKS PASSED" : `${failed.length} WINDOW AUDIT CHECK(S) FAILED`);

  try {
    fs.rmSync(TMP, { recursive: true, force: true });
  } catch (_) {}
  app.exit(failed.length === 0 ? 0 : 1);
}

app.whenReady().then(() =>
  main().catch((err) => {
    console.log("");
    console.log("  FAIL  harness threw");
    console.log(err && err.stack ? err.stack : String(err));
    app.exit(1);
  })
);
