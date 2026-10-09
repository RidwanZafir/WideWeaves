/* Abandoned but Not Forgotten — renderer
   Reads the archive through the preload bridge only.
   No node access, no network, no inline anything.
   The bridge is async (ipcRenderer.invoke), so every read below awaits it. */

(function () {
  "use strict";

  var bridge = window.archive;

  var CERTAINTY_LABEL = {
    high: "Well documented",
    medium: "Reasonably certain",
    variable: "Varies",
    low: "Uncertain",
    unknown: "Not yet established"
  };

  // Local thumbnails vendored under dist/assets, so the card works with
  // connect-src 'none'. The credit link still points at the NASA library page
  // and opens in the system browser via the main-process window-open handler.
  var NASA_THUMBS = {
    PIA12910: "assets/nasa-PIA12910.jpg",
    PIA21131: "assets/nasa-PIA21131.jpg"
  };

  var state = {
    worlds: [],
    world: null,
    q: "",
    objects: [],
    allObjects: [],
    selectedId: null,
    record: null,
    /* A failure the reader has to see. Kept separate from `record` so a record
       that will not open does not also wipe the record already on screen. */
    notice: "",
    /* A failed boot. While set, the workspace shows the failure instead of an
       empty shell — an error screen that cannot be reached is worse than none. */
    fatal: "",
    booted: false
  };

  var refs = {
    app: null,
    filters: document.getElementById("world-filters"),
    search: document.getElementById("search"),
    list: document.getElementById("record-list"),
    listEmpty: document.getElementById("rail-empty"),
    listNote: document.getElementById("rail-note"),
    key: document.getElementById("rail-key"),
    count: document.getElementById("rail-count"),
    readout: document.getElementById("readout"),
    record: document.getElementById("record"),
    provenance: document.getElementById("provenance")
  };

  var escapeHtml = function (s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  var certaintyLabel = function (c) {
    return CERTAINTY_LABEL[c] || CERTAINTY_LABEL.unknown;
  };

  var dotClass = function (c) {
    return c === "unknown" ? "low" : c || "low";
  };

  /* ---- bridge reads (every one can reject on a failed boot) ---- */

  async function readObjects(opts) {
    if (!bridge) throw new Error("no bridge");
    return await bridge.objects(opts || {});
  }

  /* ---- media: the evidence, in the reading flow ----
     Photos and film live with the story they support — not in the masthead,
     which has one job (find things). Thumbs are vendored locally so the
     offline archive stays offline; the links open outside the app. */

  function isVideoSource(src) {
    return /youtube\.com\/watch/.test(src.nasaUrl || "");
  }

  function thumbFor(src) {
    var m = /[?&]v=([A-Za-z0-9_-]{11})/.exec(src.nasaUrl || "");
    if (m) return "assets/yt-" + m[1] + ".jpg";
    return NASA_THUMBS[src.nasaId] || null;
  }

  function mediaForRecord(record) {
    var out = [];
    var sources = (record && record.sources) || [];
    for (var i = 0; i < sources.length; i++) {
      var src = sources[i];
      if (!src.nasaUrl) continue;
      var thumb = thumbFor(src);
      if (!thumb) continue;
      out.push({
        video: isVideoSource(src),
        url: src.nasaUrl,
        thumb: thumb,
        kind: isVideoSource(src) ? ("Film · " + src.reference) : ("Photo · NASA " + src.nasaId),
        title: src.title,
        caption: src.nasaCaption || ""
      });
    }
    return out;
  }

  function renderMedia(media) {
    if (!media.length) return "";
    var cards = media.map(function (m) {
      return (
        '<a class="media-card' + (m.video ? " media-card--video" : "") + '"' +
        ' href="' + escapeHtml(m.url) + '" target="_blank" rel="noopener">' +
        '<span class="media-thumb-wrap">' +
        '<img class="media-thumb" src="' + escapeHtml(m.thumb) + '" alt="" loading="lazy" />' +
        (m.video ? '<span class="media-play" aria-hidden="true"></span>' : "") +
        "</span>" +
        '<span class="media-body">' +
        '<span class="media-kind">' + escapeHtml(m.kind) + "</span>" +
        '<span class="media-title">' + escapeHtml(m.title) + "</span>" +
        (m.caption ? '<span class="media-caption">' + escapeHtml(m.caption) + "</span>" : "") +
        "</span></a>"
      );
    }).join("");
    return (
      '<div class="media">' +
      '<div class="media-label">The evidence</div>' +
      '<div class="media-grid">' + cards + "</div>" +
      '<p class="media-note">Opens outside the archive, in your browser.</p>' +
      "</div>"
    );
  }

  /* ---- intro: the archive as a pixel landscape ---- */

  function renderIntro() {
    var groups = {};
    var order = [];
    state.allObjects.forEach(function (o) {
      var code = o.worldCode || "unknown";
      if (!groups[code]) {
        groups[code] = {
          name: o.worldName || code,
          code: code,
          items: []
        };
        order.push(code);
      }
      groups[code].items.push(o);
    });

    var map = "";
    order.forEach(function (code) {
      var g = groups[code];
      var marks = g.items.map(function (o) {
        var certainty = o.certainty || "unknown";
        var mark = o.mark || "lander";
        return (
          '<button type="button" class="map-mark" data-id="' + o.id + '"' +
          ' aria-label="' + escapeHtml(o.name + ", " + certaintyLabel(certainty)) + '">' +
          '<span class="map-stake ' + certainty + " map-stake--" + escapeHtml(mark) + '" aria-hidden="true"></span>' +
          "</button>"
        );
      }).join("");
      map +=
        '<div class="map-row">' +
        '<div class="map-world"><span class="map-world-name">' + escapeHtml(g.name) + '</span>' +
        '<span class="map-world-count">' + g.items.length + "</span></div>" +
        '<div class="map-ground map-ground--' + escapeHtml(code) + '">' + marks + "</div>" +
        "</div>";
    });

    var stakes = order.map(function (code) {
      var g = groups[code];
      return (
        '<div class="stake"><dt>' + escapeHtml(g.name) + "</dt>" +
        "<dd>" + g.items.length + (g.items.length === 1 ? " record" : " records") + " on this ground.</dd></div>"
      );
    }).join("");

    refs.record.innerHTML =
      '<div class="intro">' +
      "<h2>Everything here is still out there.</h2>" +
      '<p class="lede">Five records of hardware we left on the Moon and Mars. ' +
      "Colour is certainty; shape is kind.</p>" +
      '<div class="map">' + map + "</div>" +
      '<dl class="stakes">' + stakes + "</dl>" +
      '<p class="intro-hint">Two ways in: the map above, the index on the left. ' +
      '<span class="k">/</span> jumps to search. Every mark opens its record.</p>' +
      "</div>";
  }

  function renderFatal() {
    refs.record.innerHTML =
      '<div class="intro intro-error">' +
      "<h2>The archive did not open.</h2>" +
      "<p class=\"lede\">" + escapeHtml(state.fatal) + "</p>" +
      '<p class="intro-hint">The file was left exactly where it is, so nothing is discarded.</p>' +
      "</div>";
  }

  /* ---- record column ---- */

  function renderRecord() {
    if (!refs.record) return;

    if (state.fatal) {
      renderFatal();
      return;
    }

    if (!state.record) {
      if (state.allObjects.length) renderIntro();
      else refs.record.innerHTML = "";
      return;
    }

    var r = state.record;
    var certainty = r.certainty || "unknown";

    var badges = "";
    if (r.status) {
      badges +=
        '<span class="badge ' + certainty + '">' +
        escapeHtml(r.status) +
        "</span>";
    }
    if (r.year != null) {
      badges +=
        '<span class="badge ' + certainty + '">' +
        escapeHtml(r.era) + " · " + escapeHtml(String(r.year)) +
        "</span>";
    }
    badges += '<span class="badge ' + certainty + '">' + escapeHtml(certaintyLabel(certainty)) + "</span>";

    var blocks = "";
    if (r.whatIs) {
      blocks +=
        '<div class="block block-1">' +
        '<div class="block-label">What it is</div>' +
        "<p>" + escapeHtml(r.whatIs) + "</p></div>";
    }
    if (r.whyAbandoned) {
      blocks +=
        '<div class="block block-2">' +
        '<div class="block-label">Why it was abandoned</div>' +
        "<p>" + escapeHtml(r.whyAbandoned) + "</p></div>";
    }
    if (r.lesson) {
      blocks +=
        '<div class="block block-3 block--lesson">' +
        '<div class="block-label">What it taught</div>' +
        '<div class="pull"><p>' + escapeHtml(r.lesson) + "</p></div></div>";
    }
    if (r.locationNote) {
      blocks +=
        '<div class="block block-4">' +
        '<div class="block-label">Where it is now</div>' +
        "<p>" + escapeHtml(r.locationNote) + "</p></div>";
    }
    if (r.certaintyNote) {
      blocks +=
        '<div class="block block-5">' +
        '<div class="block-label">How well we know this</div>' +
        "<p>" + escapeHtml(r.certaintyNote) + "</p></div>";
    }

    var html =
      '<div class="record-inner">' +
      '<div class="eyebrow"><span>Record</span>' +
      (r.mark ? '<span class="world"> · ' + escapeHtml(r.mark) + "</span>" : "") +
      "</div>" +
      '<h2 tabindex="-1">' + escapeHtml(r.name) + "</h2>";

    if (badges) {
      html += '<div class="badges">' + badges + "</div>";
    }

    if (r.summary) {
      html += '<p class="lede">' + escapeHtml(r.summary) + "</p>";
    }

    html += renderMedia(mediaForRecord(r));
    html += blocks + "</div>";

    refs.record.innerHTML = html;
    showNotice();
  }

  /* A failure the reader has to see: announced, edged, and it never eats the
     record already on screen. */
  function showNotice() {
    if (!refs.record) return;
    var existing = refs.record.querySelector(".record-notice");
    if (!state.notice) {
      if (existing) existing.remove();
      return;
    }
    if (existing) {
      existing.textContent = state.notice;
    } else {
      var node = document.createElement("div");
      node.className = "record-notice";
      node.setAttribute("role", "alert");
      node.textContent = state.notice;
      refs.record.insertBefore(node, refs.record.firstChild);
    }
  }

  /* ---- provenance column: exactly four panels ---- */

  function renderProvenance() {
    if (!refs.provenance) return;

    if (state.fatal || !state.record) {
      refs.provenance.innerHTML = "";
      return;
    }

    var r = state.record;
    var people = r.stakeholders || [];
    var actions = r.nextActions || [];
    var sources = r.sources || [];

    var panels = "";

    if (sources.length) {
      var srcs = "";
      for (var i = 0; i < sources.length; i++) {
        var src = sources[i];
        var ext = "";
        if (src.nasaUrl && isVideoSource(src)) {
          ext = ' · <a href="' + escapeHtml(src.nasaUrl) +
            '" target="_blank" rel="noopener">Watch on YouTube</a>';
        } else if (src.nasaId && src.nasaUrl) {
          ext = ' · <a href="' + escapeHtml(src.nasaUrl) +
            '" target="_blank" rel="noopener">NASA ' + escapeHtml(src.nasaId) + "</a>";
        }
        srcs +=
          '<div class="entry">' +
          '<span class="entry-kind">' + escapeHtml(src.kind) + "</span>" +
          '<p class="entry-title">' + escapeHtml(src.title) + "</p>" +
          '<p class="entry-sub">' + escapeHtml(src.reference) + ext + "</p></div>";
      }
      panels +=
        '<div class="panel">' +
        '<div class="panel-label"><span>Sources</span><span class="count">' + sources.length + "</span></div>" +
        '<div class="stack">' + srcs + "</div></div>";
    } else {
      panels +=
        '<div class="panel">' +
        '<div class="panel-label"><span>Sources</span><span class="count">0</span></div>' +
        '<p class="blank">No sources on this record yet.</p></div>';
    }

    if (people.length) {
      var p = "";
      for (var j = 0; j < people.length; j++) {
        var person = people[j];
        var initials = String(person.name || "")
          .replace(/[^A-Za-z]/g, "")
          .slice(0, 2)
          .toUpperCase();
        p +=
          '<div class="person">' +
          '<div class="avatar">' + escapeHtml(initials) + "</div>" +
          "<div>" +
          '<div class="person-role">' + escapeHtml(person.role) + "</div>" +
          '<div class="person-name">' + escapeHtml(person.name) + "</div>" +
          '<p class="person-note">' + escapeHtml(person.note) + "</p>" +
          "</div></div>";
      }
      panels +=
        '<div class="panel">' +
        '<div class="panel-label"><span>Who cares</span><span class="count">' +
        people.length + "</span></div>" +
        '<div class="stack">' + p + "</div></div>";
    } else {
      panels +=
        '<div class="panel">' +
        '<div class="panel-label"><span>Who cares</span><span class="count">0</span></div>' +
        '<p class="blank">No one is watching this one yet.</p></div>';
    }

    if (actions.length) {
      var list = "";
      for (var k = 0; k < actions.length; k++) {
        var a = actions[k];
        list +=
          '<div class="action">' +
          '<p class="action-text">' + escapeHtml(a.action) + "</p>" +
          '<p class="action-why">' + escapeHtml(a.why) + "</p>" +
          '<p class="action-by">Filed ' + escapeHtml(a.madeAt) +
          " by " + escapeHtml(a.madeBy) + "</p></div>";
      }
      panels +=
        '<div class="panel">' +
        '<div class="panel-label"><span>What should happen next</span><span class="count">' +
        actions.length + "</span></div>" +
        '<div class="stack">' + list + "</div></div>";
    } else {
      panels +=
        '<div class="panel">' +
        '<div class="panel-label"><span>What should happen next</span><span class="count">0</span></div>' +
        '<p class="blank">No proposed actions yet. This is the one place in the record a reader can act.</p></div>';
    }

    panels +=
      '<div class="panel action-form">' +
      '<div class="panel-label"><span>Propose a next action</span></div>' +
      '<form id="action-form" novalidate>' +
      '<div class="field">' +
      '<label for="action-text">What should happen next</label>' +
      '<input id="action-text" name="action" maxlength="140" placeholder="One concrete next step." required />' +
      "</div>" +
      '<div class="field">' +
      '<label for="action-why">Why this matters</label>' +
      '<textarea id="action-why" name="why" maxlength="400" placeholder="One sentence on the reason." required></textarea>' +
      "</div>" +
      '<button class="btn" type="submit">Add to the record</button></form></div>';

    refs.provenance.innerHTML = panels;
  }

  /* ---- rail ---- */

  function renderRailKey() {
    if (!refs.key) return;

    var tones = ["high", "medium", "variable", "low"];
    var legend = tones.map(function (t) {
      return (
        '<span class="rail-key-item"><span class="dot ' + t + '" aria-hidden="true"></span>' +
        escapeHtml(certaintyLabel(t === "low" ? "low" : t)) + "</span>"
      );
    }).join("");

    refs.key.innerHTML =
      '<div class="rail-key-title">The key</div>' +
      '<p class="rail-key-subtitle">Colour says how well we know it. Shape says what it is.</p>' +
      legend +
      '<div class="rail-key-row">' +
      '<span class="rail-key-sprite rail-key-sprite--lander" aria-hidden="true"></span>' +
      '<span class="rail-key-name">Lander</span>' +
      "</div>" +
      '<div class="rail-key-row">' +
      '<span class="rail-key-sprite rail-key-sprite--descent" aria-hidden="true"></span>' +
      '<span class="rail-key-name">Descent stage</span>' +
      "</div>" +
      '<div class="rail-key-row">' +
      '<span class="rail-key-sprite rail-key-sprite--impact" aria-hidden="true"></span>' +
      '<span class="rail-key-name">Impact site</span>' +
      "</div>" +
      '<div class="rail-key-row">' +
      '<span class="rail-key-sprite rail-key-sprite--wreckage" aria-hidden="true"></span>' +
      '<span class="rail-key-name">Wreckage</span>' +
      "</div>" +
      '<div class="rail-key-row">' +
      '<span class="rail-key-sprite rail-key-sprite--cluster" aria-hidden="true"></span>' +
      '<span class="rail-key-name">Several missions</span>' +
      "</div>" +
      '<p class="rail-key-hint">Every mark on the map is one of these. The map is the archive, not an illustration.</p>';
  }

  function renderRail() {
    if (!refs.list) return;

    if (state.fatal) {
      refs.list.innerHTML = "";
      if (refs.listEmpty) refs.listEmpty.hidden = true;
      if (refs.listNote) refs.listNote.hidden = true;
      return;
    }

    if (!state.objects.length) {
      refs.list.innerHTML = "";
      if (refs.listEmpty) refs.listEmpty.hidden = false;
    } else {
      if (refs.listEmpty) refs.listEmpty.hidden = true;

      var html = "";
      for (var i = 0; i < state.objects.length; i++) {
        var o = state.objects[i];
        var certainty = o.certainty || "unknown";
        var eraYear = o.era || "";
        if (o.year != null) eraYear += " · " + String(o.year);
        // One glance says which records carry footage, so nobody has to hunt.
        var mediaTag = o.hasVideo && o.hasPhoto ? "photo · film"
          : o.hasVideo ? "film"
          : o.hasPhoto ? "photo" : "";
        html +=
          '<li><button type="button" class="row" data-id="' + o.id + '"' +
          (o.id === state.selectedId ? ' aria-current="true"' : "") +
          ">" +
          '<span class="row-title">' +
          '<span class="dot ' + dotClass(certainty) + '" title="' + escapeHtml(certaintyLabel(certainty)) + '" aria-hidden="true"></span>' +
          escapeHtml(o.name) +
          '<span class="sr-only">(' + escapeHtml(certaintyLabel(certainty)) + ")</span>" +
          "</span>" +
          '<span class="row-meta">' +
          '<span class="row-world">' + escapeHtml(o.worldName || "") + "</span>" +
          '<span class="row-right">' +
          (mediaTag ? '<span class="row-media">' + mediaTag + "</span>" : "") +
          '<span class="row-era">' + escapeHtml(eraYear) + "</span>" +
          "</span>" +
          "</button></li>";
      }
      refs.list.innerHTML = html;
    }

    // Filtering never costs the reader their place: the open record stays,
    // and the rail says so when it falls outside the view.
    if (refs.listNote) {
      var visible = state.objects.some(function (o) { return o.id === state.selectedId; });
      if (state.record && state.selectedId != null && !visible && state.objects.length) {
        refs.listNote.innerHTML =
          "Still reading <b>" + escapeHtml(state.record.name) + "</b> — outside this filter.";
        refs.listNote.hidden = false;
      } else {
        refs.listNote.hidden = true;
      }
    }
  }

  function renderCount() {
    if (!refs.count) return;
    if (state.fatal) {
      refs.count.textContent = "unavailable";
      return;
    }
    refs.count.textContent = state.objects.length + " records";
  }

  async function renderReadout() {
    if (!refs.readout) return;
    if (state.fatal || !bridge) {
      refs.readout.textContent = "";
      return;
    }
    // The rail count already says how many are shown; the masthead says how
    // big the archive is. Two identical numbers would be a repeated KPI.
    try {
      var total = await bridge.objectCount();
      var worlds = state.worlds && state.worlds.length ? state.worlds.length : (await bridge.worlds()).length;
      refs.readout.textContent = total + " records · " + worlds + " worlds";
    } catch (e) {
      refs.readout.textContent = "";
    }
  }

  function markBooted() {
    if (!state.booted) {
      state.booted = true;
      if (refs.app) refs.app.removeAttribute("data-boot");
    }
  }

  async function render() {
    renderRailKey();
    renderRecord();
    renderProvenance();
    renderRail();
    renderCount();
    await renderReadout();
    markBooted();
  }

  function renderFatalState() {
    if (refs.list) refs.list.innerHTML = "";
    if (refs.listEmpty) refs.listEmpty.hidden = true;
    if (refs.listNote) refs.listNote.hidden = true;
    if (refs.count) refs.count.textContent = "unavailable";
    if (refs.readout) refs.readout.textContent = "";
    if (refs.provenance) refs.provenance.innerHTML = "";
    renderFatal();
    markBooted();
  }

  /* ---- selection & filters (selection survives both) ---- */

  async function selectObject(id, opts) {
    var keyboard = !!(opts && opts.keyboard);
    state.selectedId = id;
    var detail = null;
    try {
      detail = bridge ? await bridge.object(id) : null;
    } catch (e) {
      state.notice = "The record could not be opened.";
      await render();
      return;
    }

    if (!detail) {
      state.notice = "That record was not found.";
      await render();
      return;
    }

    state.notice = "";
    state.record = detail;
    await render();

    if (keyboard && refs.record) {
      var h2 = refs.record.querySelector("h2");
      if (h2) h2.focus();
    }
  }

  async function reloadObjects() {
    var opts = {};
    if (state.world) opts.worldCode = state.world;
    if (state.q) opts.q = state.q;
    try {
      state.objects = await readObjects(opts);
    } catch (e) {
      state.objects = [];
    }
  }

  async function setQuery(q) {
    state.q = q;
    await reloadObjects();
    await render();
  }

  async function setWorld(code) {
    state.world = code;
    await reloadObjects();
    await render();
  }

  /* ---- chrome ---- */

  var clearField = function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.value = "";
    el.disabled = false;
  };

  var setFieldError = function (id, msg) {
    var el = document.getElementById(id);
    if (!el) return;
    var wrap = el.parentNode;
    var err = wrap.querySelector(".form-error");
    if (!err) {
      err = document.createElement("p");
      err.className = "form-error";
      wrap.appendChild(err);
    }
    err.textContent = msg;
  };

  async function buildFilters() {
    if (!refs.filters) return;

    var html = '<button type="button" class="chip" data-world="" aria-pressed="true">All worlds</button>';
    var worlds = [];
    try {
      worlds = bridge ? await bridge.worlds() : [];
    } catch (e) {
      worlds = [];
    }
    for (var i = 0; i < worlds.length; i++) {
      var w = worlds[i];
      html +=
        '<button type="button" class="chip" data-world="' + escapeHtml(w.code) +
        '" aria-pressed="false">' + escapeHtml(w.name) + "</button>";
    }
    refs.filters.innerHTML = html;

    Array.prototype.forEach.call(refs.filters.children, function (btn) {
      btn.addEventListener("click", function () {
        var code = btn.getAttribute("data-world") || null;
        Array.prototype.forEach.call(refs.filters.children, function (c) {
          c.setAttribute("aria-pressed", c === btn ? "true" : "false");
        });
        setWorld(code);
      });
    });
  }

  function bindSearch() {
    if (!refs.search) return;

    refs.search.addEventListener("input", function () {
      var val = refs.search.value.trim();
      setQuery(val.length ? val : "");
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "/" && document.activeElement !== refs.search) {
        e.preventDefault();
        refs.search.focus();
      }
    });
  }

  function isKeyboardClick(e) {
    // A genuine mouse click carries detail >= 1; keyboard activation and
    // programmatic clicks carry 0. Only the keyboard path moves focus, so a
    // mouse click never sprouts an outline on the record heading.
    return (e.detail || 0) === 0;
  }

  function wireList() {
    if (refs.list) {
      refs.list.addEventListener("click", function (e) {
        var row = e.target.closest("[data-id]");
        if (!row) return;
        selectObject(Number(row.getAttribute("data-id")), { keyboard: isKeyboardClick(e) });
      });

      refs.list.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var row = e.target.closest("[data-id]");
        if (!row) return;
        e.preventDefault();
        selectObject(Number(row.getAttribute("data-id")), { keyboard: true });
      });
    }

    if (refs.record) {
      refs.record.addEventListener("click", function (e) {
        var mark = e.target.closest(".map-mark");
        if (!mark) return;
        selectObject(Number(mark.getAttribute("data-id")), { keyboard: isKeyboardClick(e) });
      });

      refs.record.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var mark = e.target.closest(".map-mark");
        if (!mark) return;
        e.preventDefault();
        selectObject(Number(mark.getAttribute("data-id")), { keyboard: true });
      });
    }
  }

  function bindForm() {
    if (!refs.provenance) return;
    // The form is re-rendered with the provenance column, so listen once on
    // the container rather than on an element that gets replaced.
    refs.provenance.addEventListener("submit", function (e) {
      if (!e.target || e.target.id !== "action-form") return;
      e.preventDefault();
      var actionEl = document.getElementById("action-text");
      var whyEl = document.getElementById("action-why");
      var action = actionEl ? actionEl.value.trim() : "";
      var why = whyEl ? whyEl.value.trim() : "";

      if (!action) {
        setFieldError("action-text", "Say what should happen next.");
        return;
      }
      if (!why) {
        setFieldError("action-why", "Give the record one sentence on why.");
        return;
      }

      if (!state.record) {
        state.notice = "Open a record before proposing a next action.";
        render();
        return;
      }

      var id = state.record.id;
      Promise.resolve(bridge.addNextAction(id, action, why)).then(
        function (ok) {
          if (!ok) {
            setFieldError("action-why", "That write was not accepted.");
            return;
          }
          clearField("action-text");
          clearField("action-why");
          selectObject(id, { keyboard: false });
        },
        function (err) {
          var msg = err && err.message ? String(err.message) : "The write failed.";
          setFieldError("action-why", msg);
        }
      );
    });
  }

  /* ---- init ---- */

  async function init() {
    refs.app = document.querySelector(".app");

    await buildFilters();
    bindSearch();
    wireList();
    bindForm();

    if (!bridge) {
      state.fatal = "The archive did not open.";
      renderFatalState();
      return;
    }

    try {
      state.worlds = await bridge.worlds();
    } catch (e) {
      state.worlds = [];
    }

    try {
      state.allObjects = await readObjects({});
      state.objects = state.allObjects.slice();
    } catch (e) {
      state.fatal = e && e.message ? String(e.message) : "The archive did not open.";
      renderFatalState();
      return;
    }

    // Rebuild the filter chips from the worlds that actually answered, so the
    // rail cannot disagree with the database.
    await buildFilters();
    await render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
