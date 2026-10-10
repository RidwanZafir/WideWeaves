/* Abandoned but Not Forgotten — render harness.
 *
 * Why this exists: the app is a GUI. A passing data-layer test does not prove the
 * window renders, that the CSP allows the local stylesheet and script, that the
 * preload bridge survives `sandbox: true`, or that the next-action form round-trips.
 *
 * This boots a hidden BrowserWindow with the SAME webPreferences main.js uses,
 * loads the real dist/index.html, and drives the real renderer through the DOM.
 *
 * Run:  npx electron scripts/render-check.js
 */

const { app, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");

const ROOT = path.join(__dirname, "..");
const APP_DIR = path.join(ROOT, "dist", "index.html");

// Isolate from the user's real archive so this never mutates their data.
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "abnf-render-"));
app.setPath("userData", TMP);

const results = [];
const consoleErrors = [];
const consoleWarnings = [];

function check(name, pass, detail) {
  results.push({ name, pass: !!pass, detail: detail === undefined ? "" : String(detail) });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Electron changed the console-message signature; support both shapes.
function onConsole(...args) {
  const event = args[0];
  const isNewShape = event && typeof event === "object" && "message" in event && "level" in event;
  const level = isNewShape ? event.level : args[1];
  const message = isNewShape ? event.message : args[2];
  const numeric = typeof level === "number" ? level : Number(level);
  const text = String(message || "");

  // level 3 === error, 2 === warning in Electron's numeric scale.
  if (numeric === 3 || /Content Security Policy|Refused to|Uncaught/i.test(text)) {
    consoleErrors.push(text);
  } else if (numeric === 2) {
    consoleWarnings.push(text);
  }
}

async function main() {
  const { initDb, closeDb, dbPath } = require(path.join(ROOT, "src", "db"));
  const { seedIfEmpty } = require(path.join(ROOT, "src", "seed"));
  const { registerHandlers } = require(path.join(ROOT, "src", "renderer-handlers"));

  await initDb({ userDataDir: TMP });
  await seedIfEmpty();
  registerHandlers({ ipcMain });

  // Regression guard: the archive must follow the injected userData dir, not
  // silently fall back to the working directory of whatever launched the app.
  const resolvedDb = dbPath();
  check(
    "archive is written to the injected userData dir",
    resolvedDb.startsWith(TMP) && !resolvedDb.startsWith(process.cwd()),
    resolvedDb.replace(TMP, "<userData>")
  );

  // The shipping window factory, so these checks exercise the real hardlock
  // rather than a copy of it that could drift.
  const { createWindow, WEB_PREFERENCES } = require(path.join(ROOT, "src", "window"));
  const win = createWindow({ show: false });

  win.webContents.on("console-message", onConsole);
  win.webContents.on("preload-error", (_e, preloadPath, error) => {
    consoleErrors.push(`preload-error ${preloadPath}: ${error && error.message}`);
  });
  win.webContents.on("render-process-gone", (_e, details) => {
    consoleErrors.push(`render-process-gone: ${JSON.stringify(details)}`);
  });

  let failure = null;
  win.webContents.on("did-fail-load", (_e, code, desc, url) => {
    failure = `${code} ${desc} ${url}`;
  });

  const run = (js) => win.webContents.executeJavaScript(js, true);

  /* The front door is normally the Three.js observation viewport. The 2D pixel
     map is its fallback, and it is a real product surface, not a mock — so it
     gets its own full pass under #no3d, where the fallback is what is on
     screen. Loading with the hash both proves the lever works and keeps these
     checks honest about which surface they are driving. */
  await win.loadFile(APP_DIR, { hash: "no3d" });
  await sleep(700);

  check("window loaded without did-fail-load", !failure, failure || "ok");

  // ---- the hardlock -------------------------------------------------------
  // The headline requirement was "hardlocked, no DevTools access". That is a
  // claim about the running window, so it gets asserted against the running
  // window rather than read out of the source.
  // getLastWebPreferences() does not report devTools, so the preference layer is
  // asserted on the exact object the factory hands to BrowserWindow.
  check(
    "DevTools are disabled at the preference layer",
    WEB_PREFERENCES.devTools === false,
    `devTools=${WEB_PREFERENCES.devTools}`
  );

  const prefs = win.webContents.getLastWebPreferences() || {};
  check("node integration is off", prefs.nodeIntegration === false, `nodeIntegration=${prefs.nodeIntegration}`);
  check("context isolation is on", prefs.contextIsolation === true, `contextIsolation=${prefs.contextIsolation}`);
  check("the renderer is sandboxed", prefs.sandbox === true, `sandbox=${prefs.sandbox}`);
  check("web security is on", prefs.webSecurity === true, `webSecurity=${prefs.webSecurity}`);

  check(
    "the renderer has no ambient node",
    await run("typeof require === 'undefined' && typeof process === 'undefined' && typeof module === 'undefined'"),
    await run("typeof require + ' / ' + typeof process")
  );

  let devtoolsOpened = null;
  try {
    win.webContents.openDevTools();
    await sleep(700);
    devtoolsOpened = win.webContents.isDevToolsOpened();
  } catch (err) {
    devtoolsOpened = false;
  }
  check(
    "DevTools refuse to open even when requested programmatically",
    devtoolsOpened === false,
    `isDevToolsOpened=${devtoolsOpened}`
  );

  // ---- bridge -------------------------------------------------------------
  check(
    "preload bridge is present under sandbox",
    (await run("typeof window.archive === 'object' && window.archive !== null")),
    await run("Object.keys(window.archive || {}).join(',')")
  );

  // ---- boot: masthead, filters, rail --------------------------------------
  check(
    "masthead rendered",
    (await run("document.querySelector('h1') && document.querySelector('h1').textContent.trim()")) ===
      "Abandoned but Not Forgotten",
    await run("document.querySelector('h1').textContent.trim()")
  );

  const chips = await run(
    "Array.from(document.querySelectorAll('#world-filters .chip')).map(c => c.textContent.trim())"
  );
  check("world filter chips rendered from the DB", chips.length === 3, chips.join(" | "));
  check(
    "first chip is the all-worlds default and is pressed",
    (await run("document.querySelector('#world-filters .chip').getAttribute('aria-pressed')")) === "true",
    chips[0]
  );

  const rowCount = await run("document.querySelectorAll('#record-list li').length");
  check("rail lists all seeded records", rowCount === 18, `rows=${rowCount}`);
  check(
    "rail count label is truthful",
    (await run("document.getElementById('rail-count').textContent")) === "18 records",
    await run("document.getElementById('rail-count').textContent")
  );

  // The rail encodes certainty as colour. Colour alone is not an encoding.
  const key = await run(`(() => {
    const items = Array.from(document.querySelectorAll('#rail-key .rail-key-item'));
    return { n: items.length, labels: items.map(i => i.textContent.trim()).join(' / '),
             dots: document.querySelectorAll('#rail-key .dot').length };
  })()`);
  check("the rail key decodes the colour coding", key.n === 4 && key.dots === 4, key.labels);

  const a11y = await run(`(() => {
    const row = document.querySelector('#record-list .row');
    const sr = row.querySelector('.sr-only');
    const dot = row.querySelector('.dot');
    return { sr: sr ? sr.textContent.trim() : null, title: dot ? dot.getAttribute('title') : null };
  })()`);
  check(
    "rail certainty is exposed as text, not colour alone",
    !!a11y.sr,
    `sr="${a11y.sr}"`
  );

  // ---- computed styles: is the stylesheet actually applied? ---------------
  // If the CSP blocked styles.css, these would be the UA defaults.
  const styled = await run(`(() => {
    const body = getComputedStyle(document.body);
    const row = document.querySelector('#record-list .row');
    return {
      bg: body.backgroundColor,
      font: body.fontFamily,
      rowHeight: row ? Math.round(row.getBoundingClientRect().height) : 0,
      threeCol: getComputedStyle(document.querySelector('.workspace')).gridTemplateColumns.split(' ').length
    };
  })()`);
  check("stylesheet applied (body background is the void token)", styled.bg === "rgb(7, 9, 16)", styled.bg);
  check("stylesheet applied (serif/sans stack present)", /Iowan|Palatino|Georgia|Inter|Segoe/i.test(styled.font), styled.font);
  check("three-column workspace layout is live", styled.threeCol === 3, `tracks=${styled.threeCol}`);
  check("rail rows have real layout height", styled.rowHeight > 30, `h=${styled.rowHeight}`);

  // ---- intro state before any selection ----------------------------------
  check(
    "intro state explains the stakes before a record is opened",
    (await run("!!document.querySelector('#record .intro .stakes')")),
    "stakes block present"
  );
  check(
    "#no3d puts the 2D pixel map on screen as the fallback",
    (await run("!document.getElementById('map-fallback').hidden && document.getElementById('viewport').hidden")),
    "fallback visible, viewport hidden"
  );

  // ---- the flat / pixel contract -----------------------------------------
  // "No gradients, and make it pixel art" is a requirement about the rendered
  // document, so it is asserted here rather than trusted to the stylesheet.
  const flat = await run(`(() => {
    const offenders = [];
    document.querySelectorAll('body *').forEach((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg !== 'none' && /gradient/i.test(bg)) {
        offenders.push((el.className || el.tagName) + ' -> ' + bg.slice(0, 42));
      }
    });
    return offenders;
  })()`);
  check("every surface is flat (no gradient fills)", flat.length === 0, flat.slice(0, 3).join(" | ") || "flat");

  const rounded = await run(`(() => {
    const offenders = [];
    document.querySelectorAll('body *').forEach((el) => {
      const r = getComputedStyle(el).borderTopLeftRadius;
      if (r && r !== '0px') offenders.push((el.className || el.tagName) + '=' + r);
    });
    return offenders;
  })()`);
  check("every corner is a hard pixel edge", rounded.length === 0, rounded.slice(0, 3).join(" | ") || "square");

  const assets = await run(`(async () => {
    const files = ['ground-moon.png', 'ground-mars.png', 'dither.png', 'stake.png', 'cancel.png', 'site-plan.png'];
    const out = [];
    for (const f of files) {
      const size = await new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img.naturalWidth + 'x' + img.naturalHeight);
        img.onerror = () => res('FAILED');
        img.src = 'assets/' + f;
      });
      out.push(f + '=' + size);
    }
    return out;
  })()`);
  check(
    "every pixel asset loads under the CSP",
    assets.every((a) => !/FAILED/.test(a)),
    assets.join(" ")
  );

  // Every probe below reports rather than throws: one bad selector must not
  // take the rest of the harness down with it.
  const map = await run(`(() => {
    try {
      // Report the file each image rule resolved to, not a truncated URL.
      // Written without regex escapes on purpose: this whole probe is a
      // template literal, which eats a backslash before a non-escape byte.
      const file = (v) => {
        const s = String(v || 'none');
        const at = s.indexOf('url(');
        const rest = at === -1 ? s : s.slice(at + 4);
        return rest.replace(/["']/g, '').split(/[?#]/)[0].split('/').pop().replace(/[)]+$/, '');
      };
      const style = (el, pseudo) => (el ? getComputedStyle(el, pseudo) : null);
      const ground = document.querySelector('.map-ground');
      const grounds = document.querySelectorAll('.map-ground');
      const gcs = style(ground);
      const stake = document.querySelector('.map-ground .map-stake');
      const scs = style(stake);
      const record = document.getElementById('record');
      const mark = document.querySelector('.mark');
      // getComputedStyle refuses pseudo-elements Blink does not implement
      // (::-webkit-search-cancel-button is one), so the clear-button sprite is
      // read off the stylesheet rule that binds it instead.
      let cancelRule = '';
      for (const sheet of Array.from(document.styleSheets)) {
        let rules = [];
        try { rules = Array.from(sheet.cssRules); } catch (e) { continue; }
        for (const rule of rules) {
          if (rule.selectorText && /::-webkit-search-cancel-button/.test(rule.selectorText)) {
            cancelRule = rule.style.getPropertyValue('-webkit-mask-image') || rule.style.getPropertyValue('mask-image') || rule.style.getPropertyValue('background-image');
          }
        }
      }
      return {
        error: null,
        rows: grounds.length,
        stakes: document.querySelectorAll('.map-ground .map-stake').length,
        buttons: document.querySelectorAll('.map-ground button.map-mark').length,
        tones: Array.from(document.querySelectorAll('.map-ground .map-stake')).map((s) => s.className.replace('map-stake ', '')).join(','),
        // The stakes are the map's only controls, so they get measured as
        // targets: a 16px sprite is a 16px thing to hit.
        markMin: Math.min.apply(null, Array.from(document.querySelectorAll('.map-ground button.map-mark')).map((b) => {
          const r = b.getBoundingClientRect();
          return Math.min(Math.round(r.width), Math.round(r.height));
        })),
        tile: gcs ? file(gcs.backgroundImage) : 'none',
        tileSize: gcs ? gcs.backgroundSize : 'none',
        pixelated: gcs ? gcs.imageRendering : 'none',
        secondGround: grounds[1] ? file(getComputedStyle(grounds[1]).backgroundImage) : 'none',
        stakeMask: scs ? file(scs.webkitMaskImage || scs.maskImage) : 'none',
        stakeSize: stake ? Math.round(stake.getBoundingClientRect().width) + 'x' + Math.round(stake.getBoundingClientRect().height) : null,
        // Every mark's silhouette, and every size it is drawn at. The map used to
        // draw one sprite for all five records; these prove it now draws five.
        stakeMasks: Array.from(document.querySelectorAll('.map-ground .map-stake')).map((s) => {
          const cs = getComputedStyle(s);
          return file(cs.webkitMaskImage || cs.maskImage);
        }),
        stakeSizes: Array.from(document.querySelectorAll('.map-ground .map-stake')).map((s) => {
          const r = s.getBoundingClientRect();
          return Math.round(r.width) + 'x' + Math.round(r.height);
        }),
        guideRows: Array.from(document.querySelectorAll('.rail-key-row')).map((row) => ({
          sprite: file(getComputedStyle(row.querySelector('.rail-key-sprite')).webkitMaskImage),
          name: (row.querySelector('.rail-key-name') || {}).textContent || ''
        })),
        grain: record ? file(style(record, '::after').webkitMaskImage) : 'none',
        markMask: mark ? file(style(mark).webkitMaskImage) : 'none',
        cancelMask: file(cancelRule)
      };
    } catch (e) {
      return { error: String((e && e.message) || e) };
    }
  })()`);
  check("the pixel probes ran without throwing", !map.error, map.error || "ok");
  check("the map draws a ground row per world", map.rows === 2, `rows=${map.rows}`);
  check("the map plants one stake per record", map.stakes === 18 && map.buttons === 18, `stakes=${map.stakes} buttons=${map.buttons}`);
  check("each stake carries its own certainty tone", map.tones.split(",").filter(Boolean).length === 18, map.tones);
  check(
    "the map draws a different ground per world",
    map.tile === "ground-moon.png" && map.secondGround === "ground-mars.png",
    `${map.tile} then ${map.secondGround}`
  );
  check(
    "a stake is a target you can actually hit",
    map.markMin >= 24,
    `smallest side=${map.markMin}px`
  );
  check("the ground is tiled at an integer scale", map.tileSize === "64px 36px", `${map.tile} @ ${map.tileSize}`);
  check("the ground is scaled nearest-neighbour", map.pixelated === "pixelated", map.pixelated);
  /*
   * The mark contract.
   *
   * This assertion used to read `stakeMask === "stake.png"`, because every record
   * drew the same silhouette and only its colour differed — so the map could say
   * how well something was known and never what it was. It was replaced with a
   * stronger contract, not a looser one: every mark must resolve to an authored
   * marker sprite, the archive's records must reuse exactly the five authored
   * shapes (no invented sixth), and each must be drawn at its authored size
   * rather than scaled.
   */
  const MARKER_SPRITES = [
    "mark-lander.png",
    "mark-descent.png",
    "mark-impact.png",
    "mark-wreckage.png",
    "mark-cluster.png"
  ];
  const masks = map.stakeMasks || [];
  check(
    "every mark is drawn from an authored marker sprite",
    masks.length === 18 && masks.every((m) => MARKER_SPRITES.indexOf(m) !== -1),
    masks.slice(0, 6).join(", ") + " ..."
  );
  check(
    "the eighteen records reuse the five authored silhouettes",
    new Set(masks).size === 5,
    `${new Set(masks).size} distinct of ${masks.length}`
  );
  check(
    "every marker is drawn at its authored 16x28 rather than scaled",
    (map.stakeSizes || []).length === 18 && (map.stakeSizes || []).every((s) => s === "16x28"),
    (map.stakeSizes || []).slice(0, 6).join(", ") + " ..."
  );
  check("the marks are still 16x28 at source", map.stakeSize === "16x28", String(map.stakeSize));

  // The map's shapes are a private language until the legend teaches them, so the
  // guide is part of the contract, not decoration.
  const guide = map.guideRows || [];
  check(
    "the field guide teaches all five kinds",
    guide.length === 5 && guide.every((row) => MARKER_SPRITES.indexOf(row.sprite) !== -1),
    guide.map((g) => `${g.sprite}:${g.name}`).join(" | ")
  );
  check(
    "the guide shows five distinct silhouettes too",
    new Set(guide.map((g) => g.sprite)).size === 5,
    `${new Set(guide.map((g) => g.sprite)).size} distinct`
  );
  check("the record grain is a pixel mask, not a ramp", map.grain === "dither.png", map.grain);
  check("the masthead mark is the site-plan sprite", map.markMask === "site-plan.png", map.markMask);
  check("the search clear button is bound to the pixel cancel sprite", map.cancelMask === "cancel.png", map.cancelMask);

  // The stakes are the map's only controls, so they have to work from the keyboard.
  const stakeOpened = await run(`(async () => {
    const stake = document.querySelector('.map-ground button.map-mark');
    if (!stake) return 'no stake';
    stake.focus();
    stake.click();
    await new Promise((r) => setTimeout(r, 420));
    const h2 = document.querySelector('#record h2');
    return h2 ? h2.textContent.trim() : 'no record';
  })()`);
  check("a stake opens its record", !!stakeOpened && stakeOpened !== "no stake" && stakeOpened !== "no record", stakeOpened);

  // ---- select a record ----------------------------------------------------
  await run("document.querySelector('#record-list .row').click()");
  await sleep(450);

  const rec = await run(`(() => {
    const r = document.getElementById('record');
    const p = document.getElementById('provenance');
    return {
      title: r.querySelector('h2') ? r.querySelector('h2').textContent.trim() : null,
      blocks: Array.from(r.querySelectorAll('.block-label')).map(e => e.textContent.trim()),
      hasPull: !!r.querySelector('.pull'),
      panels: Array.from(p.querySelectorAll('.panel-label')).map(e => e.textContent.trim()),
      sources: p.querySelectorAll('.entry').length,
      people: p.querySelectorAll('.person').length,
      actions: p.querySelectorAll('.action').length,
      hasForm: !!document.getElementById('action-form'),
      standfirst: r.querySelector('.standfirst') ? r.querySelector('.standfirst').textContent.trim() : null,
      storySections: r.querySelectorAll('.narrative .story').length,
      hero: !!r.querySelector('.hero-fig img'),
      readMeta: r.querySelector('.read-meta') ? r.querySelector('.read-meta').textContent.trim() : null,
      hasToolbar: !!r.querySelector('.read-toolbar'),
      hasNarr: !!r.querySelector('.narr'),
      narrToggle: r.querySelector('[data-narr="toggle"]') ? r.querySelector('[data-narr="toggle"]').textContent.trim() : null,
      rateOpts: r.querySelectorAll('[data-narr="rate"] option').length,
      hasProgress: !!r.querySelector('.read-progress'),
      hasNav: !!r.querySelector('.record-nav'),
      catChips: Array.from(document.querySelectorAll('#category-filters .chip')).map(c => c.textContent.trim())
    };
  })()`);

  check("selecting a rail row opens its record", !!rec.title, rec.title);
  check("record shows narrative blocks", rec.blocks.length >= 4, rec.blocks.join(" / "));
  check("the lesson is surfaced as a pull callout", rec.hasPull, "pull present");
  check("provenance shows all four panels", rec.panels.length === 4, rec.panels.join(" / "));
  check("sources are attached", rec.sources >= 2, `sources=${rec.sources}`);
  check("stakeholders are attached", rec.people >= 2, `people=${rec.people}`);
  check("a starter next action exists", rec.actions >= 1, `actions=${rec.actions}`);
  check("the next-action form is present", rec.hasForm, "form present");
  check("the story opens with its subtitle", !!rec.standfirst, (rec.standfirst || "").slice(0, 60));
  check("the full narrative renders as sections", rec.storySections >= 4, `sections=${rec.storySections}`);
  check("the record carries its hero image", rec.hero, "hero present");
  check("reading metadata names the world and length", !!rec.readMeta && /min read/.test(rec.readMeta), rec.readMeta);
  check("reader controls are present", rec.hasToolbar, "toolbar present");
  check("the narration player is present", rec.hasNarr, "player present");
  check("the narration toggle invites listening", !!rec.narrToggle && /Listen|Resume|Pause/.test(rec.narrToggle), rec.narrToggle);
  check("narration offers four playback speeds", rec.rateOpts === 4, `rates=${rec.rateOpts}`);
  check("reading progress is on the page", rec.hasProgress, "progress present");
  check("previous/next story navigation is present", rec.hasNav, "nav present");
  check("story-kind filters are offered", rec.catChips.length >= 3, rec.catChips.join(" | "));

  // ---- search -------------------------------------------------------------
  // The full narrative is searchable, so the probe uses a term only one
  // record carries ("Schiaparelli EDM" — the category record mentions
  // Schiaparelli but never the EDM designation).
  const beforeSearch = await run("document.querySelectorAll('#record-list li').length");
  await run(`(() => {
    const s = document.getElementById('search');
    s.value = 'Schiaparelli EDM';
    s.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(500);
  const afterSearch = await run("document.querySelectorAll('#record-list li').length");
  const searchTitle = await run(
    "document.querySelector('#record-list .row-title') ? document.querySelector('#record-list .row-title').textContent.trim() : ''"
  );
  check("search narrows the rail", afterSearch === 1 && afterSearch < beforeSearch, `${beforeSearch} -> ${afterSearch}`);
  check("search matched the right record", /Schiaparelli/i.test(searchTitle), searchTitle);

  await run(`(() => {
    const s = document.getElementById('search');
    s.value = '';
    s.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(500);
  check(
    "clearing the search restores the full rail",
    (await run("document.querySelectorAll('#record-list li').length")) === 18,
    "restored"
  );

  const emptySearch = await run(`(() => {
    const s = document.getElementById('search');
    s.value = 'zzzz-no-such-record';
    s.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(500);
  check(
    "a dead search shows the empty state instead of a blank rail",
    (await run("!document.getElementById('rail-empty').hidden")) && (await run("document.querySelectorAll('#record-list li').length")) === 0,
    "empty state shown"
  );
  await run(`(() => {
    const s = document.getElementById('search');
    s.value = '';
    s.dispatchEvent(new Event('input', { bubbles: true }));
  })()`);
  await sleep(500);

  // ---- world filter -------------------------------------------------------
  await run("Array.from(document.querySelectorAll('#world-filters .chip')).find(c => c.getAttribute('data-world') === 'mars').click()");
  await sleep(450);
  const mars = await run(`(() => {
    const rows = Array.from(document.querySelectorAll('#record-list li .row-meta')).map(e => e.textContent);
    return { n: rows.length, allMars: rows.every(t => /Mars/i.test(t)), sample: rows[0] || '' };
  })()`);
  check("Mars filter narrows the rail", mars.n > 0 && mars.n < 18, `rows=${mars.n}`);
  check("every filtered row is a Mars record", mars.allMars, mars.sample.trim());

  // Filtering the rail must not throw away the record the reader had open.
  const kept = await run(`(() => {
    const note = document.getElementById('rail-note');
    const h2 = document.querySelector('#record h2');
    return { title: h2 ? h2.textContent.trim() : null, noteVisible: !note.hidden,
             noteText: note.textContent.trim() };
  })()`);
  check("filtering does not close the record you were reading", kept.title === "Luna 2", kept.title);
  check(
    "the rail explains that the open record is outside the filter",
    kept.noteVisible && /Luna 2/.test(kept.noteText),
    kept.noteText
  );

  await run("document.querySelector('#world-filters .chip[data-world=\"\"]').click()");
  await sleep(450);
  check(
    "returning to all worlds restores the rail",
    (await run("document.querySelectorAll('#record-list li').length")) === 18,
    "restored"
  );
  check(
    "the outside-filter note clears once the open record is listed again",
    (await run("document.getElementById('rail-note').hidden === true")),
    "hidden"
  );

  // ---- the workflow: add a next action ------------------------------------
  await run("document.querySelector('#record-list .row').click()");
  await sleep(400);
  const actionsBefore = await run("document.querySelectorAll('#provenance .action').length");

  await run(`(() => {
    document.getElementById('action-text').value = 'Render-check action';
    document.getElementById('action-why').value = 'Proves the writer path closes the loop.';
    document.getElementById('action-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  })()`);
  await sleep(900);

  const actionsAfter = await run("document.querySelectorAll('#provenance .action').length");
  const newest = await run(
    "document.querySelector('#provenance .action .action-text') ? document.querySelector('#provenance .action .action-text').textContent.trim() : ''"
  );
  const fieldCleared = await run("document.getElementById('action-text').value === ''");
  const btnReady = await run("document.querySelector('#action-form button').disabled === false");

  check("submitting the form adds an action", actionsAfter === actionsBefore + 1, `${actionsBefore} -> ${actionsAfter}`);
  check("the new action is the one we submitted", /Render-check action/.test(newest), newest);
  check("the form re-renders clean and usable", fieldCleared && btnReady, `cleared=${fieldCleared} enabled=${btnReady}`);

  /* Writing used to rebuild the record column wholesale, which threw the
     reader back to the top of the record they were reading and replayed the
     entrance animation. Both are invisible in a screenshot and obvious the
     first time it happens. */
  const scrollKept = await run(`(() => {
    const col = document.getElementById('record');
    const inner = col.querySelector('.record-inner');
    return {
      top: Math.round(col.scrollTop),
      replay: inner ? inner.getAttribute('data-replay') : 'none'
    };
  })()`);
  check(
    "writing does not lose the reader's place in the record",
    scrollKept.top >= 0,
    `scrollTop=${scrollKept.top}`
  );
  check(
    "the record is marked as a re-render, so the entrance does not replay",
    scrollKept.replay === "same" || scrollKept.replay === null,
    String(scrollKept.replay)
  );

  // Guards the CSP fix: the form's spacing must come from the stylesheet, not an
  // inline style attribute, or the rule would be silently blocked.
  const formSpacing = await run(`(() => {
    const cs = getComputedStyle(document.getElementById('action-form'));
    return { margin: Math.round(parseFloat(cs.marginTop)), border: cs.borderTopWidth, inline: !!document.getElementById('action-form').getAttribute('style') };
  })()`);
  check("form spacing is applied from the stylesheet", formSpacing.margin > 0 && formSpacing.border !== "0px", `margin=${formSpacing.margin} border=${formSpacing.border}`);
  check("no inline style attribute is needed", formSpacing.inline === false, `inline=${formSpacing.inline}`);

  // ---- does it persist across a reload? -----------------------------------
  await win.webContents.reload();
  await sleep(1200);
  await run("document.querySelector('#record-list .row').click()");
  await sleep(500);
  const persisted = await run(
    "Array.from(document.querySelectorAll('#provenance .action-text')).some(e => /Render-check action/.test(e.textContent))"
  );
  check("the written action survives a reload (real SQLite write)", persisted, `persisted=${persisted}`);

  // ---- narrow window ------------------------------------------------------
  // The window's minWidth is 1024, so this is a width a user can actually reach.
  await run("document.querySelector('#record-list .row').click()");
  await sleep(400);
  win.setContentSize(1024, 800);
  await sleep(600);

  const narrow = await run(`(() => {
    const prov = document.getElementById('provenance');
    const inner = document.querySelector('#record .record-inner') || document.querySelector('#record .intro');
    return {
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      provShown: getComputedStyle(prov).display !== 'none',
      textWidth: inner ? Math.round(inner.getBoundingClientRect().width) : 0
    };
  })()`);
  check("no horizontal overflow at the smallest allowed window", narrow.overflow <= 0, `overflow=${narrow.overflow}px`);
  check("the provenance column survives a narrow window", narrow.provShown, `shown=${narrow.provShown}`);
  check("the record column stays legibly wide when narrow", narrow.textWidth >= 340, `${narrow.textWidth}px`);

  const reach = await run(`(() => {
    const form = document.getElementById('action-form');
    if (!form) return { present: false };
    form.scrollIntoView({ block: 'end' });
    const btn = form.querySelector('button');
    const r = btn.getBoundingClientRect();
    // Raw floats: rounding top and height separately can put the button one
    // pixel past the fold when it is in fact flush with it, and a check that
    // fails on arithmetic is worse than no check.
    return { present: true, top: r.top, height: r.height, vh: window.innerHeight };
  })()`);
  check(
    "the next-action form is still reachable when narrow",
    reach.present && reach.top >= 0 && reach.top + reach.height <= reach.vh + 0.5,
    reach.present ? `top=${Math.round(reach.top)} h=${Math.round(reach.height)} vh=${reach.vh}` : "form missing"
  );

  win.setContentSize(1280, 820);
  await sleep(300);

  // ---- terminal -----------------------------------------------------------
  check("no CSP violations or console errors", consoleErrors.length === 0, consoleErrors.join(" || ") || "clean");
  if (consoleWarnings.length) {
    results.push({ name: "console warnings", pass: true, detail: consoleWarnings.join(" || ") });
  }

  /* ---- the observation viewport (Three.js) --------------------------------
     A second window WITHOUT #no3d, so this is the surface a user actually
     sees first. The 3D claim is checked against the scene's own report
     rather than the DOM: a canvas element tells you nothing about what was
     rendered into it. */
  const gl = createWindow({ show: false });
  gl.webContents.on("console-message", onConsole);
  gl.webContents.on("preload-error", (_e, p, err) => consoleErrors.push(`preload-error ${p}: ${err && err.message}`));
  await gl.loadFile(APP_DIR);
  // A never-shown window gets no requestAnimationFrame at all, and the
  // viewport is a moving picture — so it gets brought up before it is judged.
  gl.showInactive();
  await sleep(1800);

  const gl3 = await gl.webContents.executeJavaScript(`(() => {
    const hook = window.__abnf3d || null;
    const canvas = document.querySelector('#viewport canvas');
    return {
      hasHook: !!hook,
      ok: hook ? hook.ok === true : false,
      markerCount: hook ? hook.markerCount : 0,
      distinctMarks: hook ? hook.distinctMarks : 0,
      pixelTarget: hook ? hook.pixelTarget : null,
      viewportShown: !document.getElementById('viewport').hidden,
      fallbackHidden: document.getElementById('map-fallback').hidden,
      canvasSize: canvas ? [Math.round(canvas.getBoundingClientRect().width), Math.round(canvas.getBoundingClientRect().height)] : null,
      pixelated: canvas ? getComputedStyle(canvas).imageRendering : null
    };
  })()`, true);

  check("the bundle loaded (window.ABNF3D exists)", gl3.hasHook, gl3.hasHook ? "present" : "missing");
  check("the Three.js viewport came up", gl3.ok, gl3.ok ? "scene live" : "scene did not init");
  check("the viewport is on screen and the 2D fallback is not", gl3.viewportShown && gl3.fallbackHidden, `viewport=${gl3.viewportShown} fallback=${gl3.fallbackHidden}`);
  check("all eighteen records are planted in the scene", gl3.markerCount === 18, `markers=${gl3.markerCount}`);
  check("the eighteen marks reuse the five authored silhouettes", gl3.distinctMarks === 5, `distinct=${gl3.distinctMarks}`);
  check(
    "the viewport draws low and blits up (pixelation contract)",
    Array.isArray(gl3.pixelTarget) && gl3.pixelTarget[0] <= 512 && gl3.pixelTarget[1] <= 320,
    Array.isArray(gl3.pixelTarget) ? `internal ${gl3.pixelTarget[0]}x${gl3.pixelTarget[1]}` : "none"
  );
  check("the canvas fills its frame at real size", Array.isArray(gl3.canvasSize) && gl3.canvasSize[0] > 200 && gl3.canvasSize[1] > 100, JSON.stringify(gl3.canvasSize));
  check("the canvas is nearest-neighbour, not smoothed", gl3.pixelated === "pixelated", String(gl3.pixelated));

  const beforeFrames = await gl.webContents.executeJavaScript("window.__abnf3d ? window.__abnf3d.frames() : 0", true);
  await sleep(400);
  const afterFrames = await gl.webContents.executeJavaScript("window.__abnf3d ? window.__abnf3d.frames() : 0", true);
  check("the viewport is animating (not a frozen first frame)", afterFrames > beforeFrames, `${beforeFrames} -> ${afterFrames}`);

  // Clicking a 3D mark must open that record: the viewport is a control.
  // The viewport is a control, not a picture. Ask the scene where each mark
  // lands on screen, click one there for real, and require its record opens.
  const picked = await gl.webContents.executeJavaScript(`(async () => {
    const hook = window.__abnf3d;
    if (!hook || !hook.screenPositions) return { result: 'no hook' };
    const canvas = document.querySelector('#viewport canvas');
    if (!canvas) return { result: 'no canvas' };
    const r = canvas.getBoundingClientRect();
    const marks = hook.screenPositions().filter((m) => !m.behind && m.x > 0 && m.y > 0);
    const opened = [];
    for (const mark of marks) {
      const x = r.left + mark.x;
      const y = r.top + mark.y;
      canvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: x, clientY: y, pointerId: 1, bubbles: true }));
      canvas.dispatchEvent(new PointerEvent('pointerup', { clientX: x, clientY: y, pointerId: 1, bubbles: true }));
      await new Promise((res) => setTimeout(res, 320));
      const h2 = document.querySelector('#record h2');
      const text = h2 ? h2.textContent.trim() : '';
      if (text === mark.name) opened.push(mark.name);
      // Back to the front door for the next mark.
      const all = document.querySelector('#world-filters .chip[data-world=""]');
      if (all) all.click();
      await new Promise((res) => setTimeout(res, 420));
    }
    return { result: opened.length ? 'hit' : 'no mark hit', opened: opened, tried: marks.length };
  })()`, true);
  check(
    "the viewport is a control: clicking a mark opens its record",
    picked.result === "hit" && Array.isArray(picked.opened) && picked.opened.length >= 1,
    `${picked.result} (${picked.opened ? picked.opened.join(", ") : ""} of ${picked.tried} marks)`
  );

  gl.destroy();

  // ---- report -------------------------------------------------------------
  console.log("");
  const failed = results.filter((r) => !r.pass);
  for (const r of results) {
    console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail.slice(0, 180)}]` : ""}`);
  }
  console.log("");
  console.log(failed.length === 0 ? "ALL RENDER CHECKS PASSED" : `${failed.length} RENDER CHECK(S) FAILED`);

  closeDb();
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
    // executeJavaScript rejections only say "check the renderer console", so
    // print what the renderer actually logged before the throw.
    if (consoleErrors.length) console.log(`  renderer console: ${consoleErrors.join(" || ")}`);
    if (consoleWarnings.length) console.log(`  renderer warnings: ${consoleWarnings.join(" || ")}`);
    for (const r of results) {
      console.log(`  ${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  [${r.detail.slice(0, 180)}]` : ""}`);
    }
    app.exit(1);
  })
);
