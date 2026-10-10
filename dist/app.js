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
    category: null,
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
    booted: false,
    // Reader preferences. In-memory only: the archive keeps records, not UI.
    readSize: 0,
    focusMode: false
  };

  var refs = {
    app: null,
    filters: document.getElementById("world-filters"),
    catFilters: document.getElementById("category-filters"),
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

  /* An archive stamp a curator can read, not an ISO string. Filed times are
     provenance, so they belong in the record sheet's own voice. */
  var archiveDate = function (iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "unknown date";
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
  };

  var archiveStamp = function (iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
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

  /* ---- story kinds: the fixed category vocabulary ----
     Labels live here so the filter row, the rail, and the record sheet can
     never disagree about what a tag means. */
  var CATEGORY_LABELS = {
    "historic-first": "Historic firsts",
    "robotic-explorer": "Robotic explorers",
    "human-footprint": "Human footprints",
    "lost-mission": "Lost missions",
    "science-legacy": "Lasting science",
    "engineering-lesson": "Engineering lessons"
  };

  var categoryLabel = function (c) {
    return CATEGORY_LABELS[c] || c;
  };

  var recordCategories = function (r) {
    return (r && r.categories) || [];
  };

  /* ---- bridge reads (every one can reject on a failed boot) ---- */

  async function readObjects(opts) {
    if (!bridge) throw new Error("no bridge");
    return await bridge.objects(opts || {});
  }

  /* ---- media: the evidence, in the reading flow ----
     Photos live with the story they support — not in the masthead, which has
     one job (find things). Film lives in its own Watch section after the
     narrative, never mixed into the photo evidence. Thumbs for the four
     launch-era films are vendored locally so those cards work with
     connect-src 'none'; newer films use the video's own thumbnail with a
     graceful offline fallback. Links open outside the app. */

  function isVideoSource(src) {
    return /youtube\.com\/watch/.test(src.nasaUrl || "");
  }

  // A YouTube ID is exactly 11 URL-safe characters. Anything else is not
  // embedded — an untrusted or malformed URL becomes a plain external link.
  function videoIdFor(src) {
    var m = /[?&]v=([A-Za-z0-9_-]{11})(?:[&#]|$)/.exec(src.nasaUrl || "");
    if (!m) return null;
    return /^[A-Za-z0-9_-]{11}$/.test(m[1]) ? m[1] : null;
  }

  // Films whose thumbnails shipped with the app (offline-safe). Everything
  // newer loads the video's own thumbnail, which fails gracefully offline.
  var VENDORED_YT = {
    S9HdPi9Ikhk: true,
    nr5Pj6GQL2o: true,
    C43KXGQuUuY: true,
    Ki_Af_o9Q9s: true
  };

  function thumbFor(src) {
    var id = videoIdFor(src);
    if (id) {
      if (VENDORED_YT[id]) return "assets/yt-" + id + ".jpg";
      return "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
    }
    return NASA_THUMBS[src.nasaId] || null;
  }

  function embedUrlFor(id) {
    // youtube-nocookie, no autoplay parameter: nothing plays until invited.
    return "https://www.youtube-nocookie.com/embed/" + id;
  }

  // Every story carries at least one watch entry: YouTube films (embedded
  // on click) or, where no verifiable YouTube copy exists, a screening-room
  // link to the verified official page. Never an invented ID.
  function watchForRecord(record) {
    var films = [];
    var screenings = [];
    var sources = (record && record.sources) || [];
    for (var i = 0; i < sources.length; i++) {
      var src = sources[i];
      if (isVideoSource(src)) {
        var id = videoIdFor(src);
        if (!id) continue;
        films.push({
          id: id,
          url: src.nasaUrl,
          thumb: thumbFor(src),
          remote: !VENDORED_YT[id],
          title: src.title,
          channel: src.reference || "",
          caption: src.nasaCaption || ""
        });
      } else if (src.kind === "Screening room" && src.nasaUrl) {
        screenings.push({
          url: src.nasaUrl,
          title: src.title,
          channel: src.reference || "",
          caption: src.nasaCaption || ""
        });
      }
    }
    return { films: films, screenings: screenings };
  }

  function mediaForRecord(record) {
    var out = [];
    var sources = (record && record.sources) || [];
    for (var i = 0; i < sources.length; i++) {
      var src = sources[i];
      if (!src.nasaUrl || isVideoSource(src)) continue;
      var thumb = thumbFor(src);
      if (!thumb) continue;
      out.push({
        url: src.nasaUrl,
        thumb: thumb,
        kind: "Photo · NASA " + src.nasaId,
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
        '<a class="media-card"' +
        ' href="' + escapeHtml(m.url) + '" target="_blank" rel="noopener">' +
        '<span class="media-thumb-wrap">' +
        '<img class="media-thumb" src="' + escapeHtml(m.thumb) + '" alt="" loading="lazy" />' +
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

  /* ---- watch: film after the story, never instead of it ----
     Click-to-load facades: no iframe, no network, and no autoplay until the
     reader invites the film in. A blocked or offline embed still leaves the
     title, the attribution, and a working link to the original. */

  function renderWatch(watch) {
    if (!watch.films.length && !watch.screenings.length) return "";
    var cards = watch.films.map(function (f) {
      return (
        '<div class="video" data-video="' + escapeHtml(f.id) + '">' +
        '<button type="button" class="video-facade" data-play="' + escapeHtml(f.id) + '"' +
        ' aria-label="Play video: ' + escapeHtml(f.title) + '">' +
        '<span class="video-thumb-wrap">' +
        (f.thumb ? '<img class="video-thumb"' + (f.remote ? ' data-remote="true"' : "") +
          ' src="' + escapeHtml(f.thumb) + '" alt="" loading="lazy" />' : "") +
        '<span class="media-play" aria-hidden="true"></span>' +
        "</span>" +
        '<span class="video-play-label" aria-hidden="true">Play film</span>' +
        "</button>" +
        '<div class="video-body">' +
        '<p class="video-title">' + escapeHtml(f.title) + "</p>" +
        (f.channel ? '<p class="video-channel">' + escapeHtml(f.channel) + "</p>" : "") +
        (f.caption ? '<p class="video-caption">' + escapeHtml(f.caption) + "</p>" : "") +
        '<p class="video-link"><a href="' + escapeHtml(f.url) + '" target="_blank" rel="noopener">Watch on YouTube</a></p>' +
        "</div></div>"
      );
    }).join("");
    var rooms = watch.screenings.map(function (s) {
      return (
        '<div class="video video--room">' +
        '<div class="video-body">' +
        '<p class="video-title">' + escapeHtml(s.title) + "</p>" +
        (s.channel ? '<p class="video-channel">' + escapeHtml(s.channel) + "</p>" : "") +
        (s.caption ? '<p class="video-caption">' + escapeHtml(s.caption) + "</p>" : "") +
        '<p class="video-link"><a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">Open the official page</a></p>' +
        "</div></div>"
      );
    }).join("");
    return (
      '<section class="watch" aria-label="Related video">' +
      '<div class="watch-label">Watch Related Video</div>' +
      '<div class="watch-list">' + cards + rooms + "</div>" +
      "</section>"
    );
  }

  function mountVideoFrame(box, id) {
    if (!box || box.querySelector("iframe")) return;
    var facade = box.querySelector(".video-facade");
    var frame = document.createElement("iframe");
    frame.setAttribute("src", embedUrlFor(id));
    frame.setAttribute("title", "Related video");
    frame.setAttribute("loading", "lazy");
    frame.setAttribute("allow", "accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture");
    frame.setAttribute("allowfullscreen", "");
    frame.className = "video-frame";
    var stage = document.createElement("div");
    stage.className = "video-stage";
    stage.appendChild(frame);
    if (facade) box.replaceChild(stage, facade);
    else box.insertBefore(stage, box.firstChild);
    box.setAttribute("data-playing", "true");
  }

  /* ---- intro: the archive as a surface you can look at ----
     A Three.js observation viewport is the front door, with the 2D pixel map
     as its fallback rather than its inferior. Both read the same rows, so the
     picture cannot disagree with the data whichever one is on screen. */

  /* #no3d forces the 2D path, so the pixel-map contract can be tested in an
     environment where WebGL does come up. It is a test lever, not a feature. */
  var force2d = function () {
    try {
      return /(^|[#&?])no3d\b/.test(location.hash + location.search);
    } catch (e) {
      return false;
    }
  };

  var MARK_PATHS = {
    lander: "assets/mark-lander.png",
    descent: "assets/mark-descent.png",
    impact: "assets/mark-impact.png",
    wreckage: "assets/mark-wreckage.png",
    cluster: "assets/mark-cluster.png"
  };

  var sceneApi = null;
  var sceneTried = false;

  function stopScene() {
    if (sceneApi) {
      try { sceneApi.dispose(); } catch (e) {}
      sceneApi = null;
    }
  }

  function setMode(viewportId, fallbackId, threeD) {
    var viewport = document.getElementById(viewportId);
    var fallback = document.getElementById(fallbackId);
    if (!viewport || !fallback) return;
    viewport.hidden = !threeD;
    fallback.hidden = threeD;
  }

  async function mountScene() {
    var viewport = document.getElementById("viewport");
    var fallback = document.getElementById("map-fallback");
    if (!viewport || !fallback) return;

    stopScene();
    sceneTried = true;

    if (force2d() || !window.ABNF3D || typeof window.ABNF3D.init !== "function") {
      setMode("viewport", "map-fallback", false);
      return;
    }

    try {
      var api = await window.ABNF3D.init(viewport, {
        markers: state.allObjects.map(function (o) {
          return {
            id: o.id,
            name: o.name,
            mark: o.mark || "lander",
            worldCode: o.worldCode,
            certainty: o.certainty
          };
        }),
        markPaths: MARK_PATHS,
        onSelect: function (id) { selectObject(id, { keyboard: false }); },
        getSelected: function () { return state.selectedId; },
        onFail: function () { setMode("viewport", "map-fallback", false); }
      });

      if (!api || !api.ok) {
        setMode("viewport", "map-fallback", false);
        return;
      }

      sceneApi = api;
      setMode("viewport", "map-fallback", true);

      // Exposed for the render harness: the 3D claim has to be checkable, not
      // asserted from the DOM.
      window.__abnf3d = {
        ok: true,
        markerCount: api.markerCount(),
        distinctMarks: api.distinctMarks(),
        pixelTarget: api.pixelTarget(),
        screenPositions: api.screenPositions,
        pause: api.pause,
        resume: api.resume,
        frames: function () { return api.frames(); }
      };
    } catch (e) {
      setMode("viewport", "map-fallback", false);
    }
  }

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
        "<dd>" + g.items.length + (g.items.length === 1 ? " record" : " records") + " left on this ground.</dd></div>"
      );
    }).join("");

    var eyebrow = state.allObjects.length + " records · " + order.length + " worlds";

    // Collection entries and featured stories are drawn from the same rows
    // as the map, so the front door cannot disagree with the archive.
    var cards = order.map(function (code) {
      var g = groups[code];
      return (
        '<div class="collection-card" data-world="' + escapeHtml(code) + '">' +
        '<p class="collection-eyebrow">Collection · ' + g.items.length + (g.items.length === 1 ? " story" : " stories") + "</p>" +
        "<h3>" + escapeHtml(g.name) + "</h3>" +
        "<p>" + escapeHtml(collectionLede(code)) + "</p>" +
        '<button type="button" class="btn" data-world-jump="' + escapeHtml(code) + '">Explore the collection</button>' +
        "</div>"
      );
    }).join("");

    var featured = ["moon", "mars"].map(function (code) {
      var g = groups[code];
      if (!g || !g.items.length) return "";
      var o = g.items[0];
      return (
        '<div class="feature" data-world="' + escapeHtml(code) + '">' +
        (o.heroImage ? '<img class="feature-thumb" src="' + escapeHtml(o.heroImage) + '" alt="" loading="lazy" />' : "") +
        '<div class="feature-body">' +
        '<p class="feature-kicker">Featured · ' + escapeHtml(g.name) + "</p>" +
        '<p class="feature-title">' + escapeHtml(o.name) + "</p>" +
        (o.subtitle ? '<p class="feature-sub">' + escapeHtml(o.subtitle) + "</p>" : "") +
        '<button type="button" class="toolbtn" data-id="' + o.id + '">Read the full story</button>' +
        "</div></div>"
      );
    }).join("");

    refs.record.innerHTML =
      '<div class="intro">' +
      '<div class="hero">' +
      '<p class="hero-eyebrow">A curatorial archive · ' + escapeHtml(eyebrow) + "</p>" +
      '<h2 class="hero-title">Abandoned but Not Forgotten</h2>' +
      '<p class="hero-lede">Every machine we left on the Moon and Mars is still out there. ' +
      "This archive keeps eighteen of their stories — complete narratives, evidence, and film — " +
      "so the hardware is remembered for what it did, not only for where it stopped.</p>" +
      '<div class="viewport-wrap">' +
      '<div class="viewport" id="viewport" hidden></div>' +
      '<div class="map-fallback" id="map-fallback" hidden>' +
      '<div class="map">' + map + "</div>" +
      '<p class="map-key">Colour says how well we know it. Shape says what it is.</p>' +
      "</div>" +
      "</div>" +
      '<p class="hero-caption">' +
      "<span>Drag to orbit · click a mark to open its record</span>" +
      '<span class="hero-rule">Colour is how well we know it. Shape is what it is.</span>' +
      "</p>" +
      "</div>" +
      '<div class="collections">' + cards + "</div>" +
      '<div class="featured-row">' +
      '<p class="featured-label">Featured stories</p>' + featured +
      "</div>" +
      '<dl class="stakes">' + stakes + "</dl>" +
      '<p class="why-line">These missions failed, ended, or were left behind — and each one taught ' +
      "the next mission how to survive. That is why the archive keeps them.</p>" +
      '<p class="intro-hint"><span class="k">/</span> jumps to search. ' +
      "Every mark on either ground is one of the five kinds in the key.</p>" +
      "</div>";

    mountScene();
  }

  var WORLD_LEDE = {
    moon: "Eight stories from the world we walked on — first impacts, soft landings, rovers, and the mirrors still answering.",
    mars: "Ten stories from the world that eats landers — triumphs, traps, storms, and the wrecks that taught us."
  };

  var WORLD_NAMES = { moon: "The Moon", mars: "Mars" };

  function collectionLede(code) {
    return WORLD_LEDE[code] || "Stories left on this ground.";
  }

  function worldName(code) {
    if (state.worlds) {
      for (var i = 0; i < state.worlds.length; i++) {
        if (state.worlds[i].code === code) return state.worlds[i].name;
      }
    }
    return WORLD_NAMES[code] || code;
  }

  /* ---- collection view: one world, introduced, then listed ----
     Reached by choosing a collection (front door, breadcrumb) with no record
     open. The rail keeps working alongside it; nothing about filtering or
     selection changes. */

  function renderCollection(code) {
    stopScene();
    var name = worldName(code);
    var items = state.objects.filter(function (o) { return o.worldCode === code; });
    var total = state.allObjects.filter(function (o) { return o.worldCode === code; }).length;

    var head =
      '<div class="collection" data-world="' + escapeHtml(code) + '">' +
      '<nav class="crumbs" aria-label="Archive location">' +
      '<button type="button" data-go="home">Archive</button>' +
      '<span aria-hidden="true"> · </span><span>' + escapeHtml(name) + "</span>" +
      "</nav>" +
      '<p class="eyebrow">Collection</p>' +
      "<h2>" + escapeHtml(name) + "</h2>" +
      '<p class="standfirst">' + escapeHtml(collectionLede(code)) + "</p>" +
      '<p class="read-meta">' + total + (total === 1 ? " story" : " stories") + "</p>";

    if (!items.length) {
      refs.record.innerHTML = head +
        '<p class="blank">Nothing in this collection matches the current search. Clear the search to see all ' + total + ".</p></div>";
      refs.record.scrollTop = 0;
      showNotice();
      return;
    }

    var first = items[0];
    var feature =
      '<div class="collection-featured">' +
      (first.heroImage ? '<img class="feature-thumb" src="' + escapeHtml(first.heroImage) + '" alt="" loading="lazy" />' : "") +
      '<div class="feature-body">' +
      '<p class="feature-kicker">Featured</p>' +
      '<p class="feature-title">' + escapeHtml(first.name) + "</p>" +
      (first.subtitle ? '<p class="feature-sub">' + escapeHtml(first.subtitle) + "</p>" : "") +
      (first.summary ? '<p class="feature-summary">' + escapeHtml(first.summary) + "</p>" : "") +
      '<button type="button" class="btn" data-id="' + first.id + '">Read the full story</button>' +
      "</div></div>";

    var rows = items.map(function (o, i) {
      var bits = [];
      if (o.year != null) bits.push(String(o.year));
      if (o.readingMinutes != null) bits.push(String(o.readingMinutes) + " min");
      if (o.hasVideo) bits.push("film");
      else if (o.hasPhoto) bits.push("photo");
      return (
        '<button type="button" class="index-row" data-id="' + o.id + '">' +
        '<span class="index-no" aria-hidden="true">' + (i + 1 < 10 ? "0" + (i + 1) : String(i + 1)) + "</span>" +
        '<span class="index-body">' +
        '<span class="index-title">' + escapeHtml(o.name) + "</span>" +
        (o.subtitle ? '<span class="index-sub">' + escapeHtml(o.subtitle) + "</span>" : "") +
        (bits.length ? '<span class="index-meta">' + escapeHtml(bits.join(" · ")) + "</span>" : "") +
        "</span></button>"
      );
    }).join("");

    refs.record.innerHTML = head + feature +
      '<div class="collection-index" role="list" aria-label="Stories in this collection">' + rows + "</div></div>";
    refs.record.scrollTop = 0;
    showNotice();
  }

  function renderFatal() {
    refs.record.innerHTML =
      '<div class="intro intro-error">' +
      "<h2>The archive did not open.</h2>" +
      "<p class=\"lede\">" + escapeHtml(state.fatal) + "</p>" +
      '<p class="intro-hint">The file was left exactly where it is, so nothing is discarded.</p>' +
      "</div>";
  }

  /* ---- narration: listen to the story ----
     Browser speech, honestly labelled. The Web Speech API needs no keys and
     no backend; the narration layer is shaped so a neural provider could be
     plugged in later (one function turns a record into speakable text, one
     turns text into chunks). Long stories are chunked so nothing is cut off;
     leaving a record always stops its voice. */

  var narr = {
    activeId: null,
    chunks: [],
    offsets: [],
    totalChars: 0,
    index: 0,
    playing: false,
    rate: 1,
    voiceURI: null,
    voices: [],
    elapsed: 0,
    elapsedTimer: null,
    error: ""
  };

  var speech = function () {
    try {
      return window.speechSynthesis || null;
    } catch (e) {
      return null;
    }
  };

  var narrSupported = function () {
    return !!speech();
  };

  // One record -> one speakable text. Title, subtitle, then every section in
  // order. The complete story, never just the summary.
  var narrText = function (r) {
    var parts = [];
    if (r.name) parts.push(r.name + ".");
    if (r.subtitle) parts.push(r.subtitle + ".");
    var sections = (r && r.narrative) || [];
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i] || {};
      if (s.h) parts.push(s.h + ".");
      var paras = s.p || [];
      for (var j = 0; j < paras.length; j++) {
        if (paras[j]) parts.push(paras[j]);
      }
    }
    return parts.join(" ");
  };

  // speechSynthesis implementations truncate or wander on very long inputs,
  // so pack sentences into ~240-character chunks at sentence boundaries.
  var chunkStory = function (text) {
    var sentences = String(text || "").match(/[^.!?]+[.!?]+["'”’)]?|\S[^.!?]*$/g) || [];
    var chunks = [];
    var current = "";
    for (var i = 0; i < sentences.length; i++) {
      var s = sentences[i].trim();
      if (!s) continue;
      if ((current + " " + s).trim().length > 240 && current) {
        chunks.push(current.trim());
        current = s;
      } else {
        current = (current + " " + s).trim();
      }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.length ? chunks : [String(text || "").slice(0, 240)];
  };

  var narrPanel = function () {
    return refs.record ? refs.record.querySelector(".narr") : null;
  };

  var narrStatusText = function () {
    if (narr.error) return narr.error;
    if (!narr.chunks.length) return "Browser narration. Press play to hear the full story.";
    if (narr.playing) return "Reading aloud · part " + (narr.index + 1) + " of " + narr.chunks.length + ".";
    if (narr.index > 0 && narr.index < narr.chunks.length) return "Paused · part " + (narr.index + 1) + " of " + narr.chunks.length + ".";
    if (narr.index >= narr.chunks.length) return "Finished the story.";
    return "Ready. Press play to hear the full story.";
  };

  var narrElapsedText = function () {
    var s = Math.floor(narr.elapsed || 0);
    var m = Math.floor(s / 60);
    var r = s % 60;
    return (m < 10 ? "0" + m : "" + m) + ":" + (r < 10 ? "0" + r : "" + r);
  };

  var stopElapsedTimer = function () {
    if (narr.elapsedTimer) {
      try { clearInterval(narr.elapsedTimer); } catch (e) {}
      narr.elapsedTimer = null;
    }
  };

  var startElapsedTimer = function () {
    stopElapsedTimer();
    narr.elapsedTimer = setInterval(function () {
      narr.elapsed += 1;
      var el = refs.record ? refs.record.querySelector(".narr-elapsed") : null;
      if (el) el.textContent = narrElapsedText();
      else stopElapsedTimer();
    }, 1000);
  };

  var paintNarr = function () {
    var panel = narrPanel();
    if (!panel) {
      stopElapsedTimer();
      return;
    }
    panel.setAttribute("data-state", narr.playing ? "playing" : (narr.index > 0 && narr.index < narr.chunks.length) ? "paused" : (narr.index >= narr.chunks.length && narr.chunks.length ? "done" : "idle"));
    var toggle = panel.querySelector('[data-narr="toggle"]');
    if (toggle) toggle.textContent = narr.playing ? "Pause narration" : (narr.index > 0 && narr.index < narr.chunks.length) ? "Resume narration" : "Listen to Story";
    var status = panel.querySelector(".narr-status");
    if (status) status.textContent = narrStatusText();
    var bar = panel.querySelector(".narr-progress span");
    // CSP forbids inline styles, so progress moves in 10% buckets carried by
    // a data attribute the stylesheet turns into widths (see styles.css).
    var pct = narr.chunks.length ? Math.round((Math.min(narr.index, narr.chunks.length) / narr.chunks.length) * 100) : 0;
    var bucket = Math.round(pct / 10) * 10;
    var track = panel.querySelector(".narr-progress");
    if (track) track.setAttribute("data-pct", String(bucket));
    var count = panel.querySelector(".narr-count");
    if (count) count.textContent = narr.chunks.length ? (Math.min(narr.index + (narr.playing ? 1 : 0), narr.chunks.length) + " / " + narr.chunks.length) : "";
    var elapsed = panel.querySelector(".narr-elapsed");
    if (elapsed) elapsed.textContent = narrElapsedText();
  };

  var pickVoice = function () {
    var s = speech();
    if (!s) return null;
    var voices = [];
    try { voices = s.getVoices() || []; } catch (e) { voices = []; }
    narr.voices = voices;
    if (narr.voiceURI) {
      for (var i = 0; i < voices.length; i++) {
        if (voices[i].voiceURI === narr.voiceURI) return voices[i];
      }
    }
    for (var j = 0; j < voices.length; j++) {
      if (voices[j].default) return voices[j];
    }
    var en = null;
    for (var k = 0; k < voices.length; k++) {
      if (/^en/i.test(voices[k].lang || "")) {
        en = en || voices[k];
        if (/en[-_]US/i.test(voices[k].lang || "")) return voices[k];
      }
    }
    return en || voices[0] || null;
  };

  var fillVoiceSelect = function () {
    var panel = narrPanel();
    if (!panel) return;
    var sel = panel.querySelector('[data-narr="voice"]');
    if (!sel) return;
    var voices = narr.voices && narr.voices.length ? narr.voices : (function () { pickVoice(); return narr.voices; })();
    var html = "";
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      var selected = narr.voiceURI ? v.voiceURI === narr.voiceURI : !!v.default;
      html += '<option value="' + escapeHtml(v.voiceURI) + '"' + (selected ? " selected" : "") + ">" +
        escapeHtml(v.name + " · " + (v.lang || "")) + "</option>";
    }
    sel.innerHTML = html || '<option value="">Default voice</option>';
  };

  var speakChunk = function () {
    var s = speech();
    if (!s || narr.index >= narr.chunks.length) {
      narr.playing = false;
      stopElapsedTimer();
      paintNarr();
      return;
    }
    var text = narr.chunks[narr.index];
    var u;
    try {
      u = new SpeechSynthesisUtterance(text);
    } catch (e) {
      narr.error = "Narration could not start in this browser.";
      narr.playing = false;
      paintNarr();
      return;
    }
    u.rate = narr.rate;
    var voice = pickVoice();
    if (voice) {
      try { u.voice = voice; } catch (e) {}
    }
    var chunkIndex = narr.index;
    u.onend = function () {
      if (narr.activeId == null || chunkIndex !== narr.index) return;
      narr.index += 1;
      if (narr.index >= narr.chunks.length) {
        narr.playing = false;
        stopElapsedTimer();
      }
      paintNarr();
      if (narr.playing) speakChunk();
    };
    u.onerror = function (ev) {
      if (chunkIndex !== narr.index) return;
      // "interrupted" is us (pause/stop call cancel); anything else is real.
      if (ev && ev.error === "interrupted") return;
      narr.playing = false;
      stopElapsedTimer();
      narr.error = "Narration stopped unexpectedly. Press play to try again.";
      paintNarr();
    };
    try {
      s.speak(u);
    } catch (e) {
      narr.playing = false;
      narr.error = "Narration could not start in this browser.";
      paintNarr();
    }
  };

  var startNarr = function () {
    var s = speech();
    if (!s || !state.record) return;
    if (narr.activeId !== state.record.id || !narr.chunks.length) {
      narr.chunks = chunkStory(narrText(state.record));
      narr.index = 0;
      narr.elapsed = 0;
      narr.activeId = state.record.id;
    }
    if (narr.index >= narr.chunks.length) {
      narr.index = 0;
      narr.elapsed = 0;
    }
    narr.error = "";
    narr.playing = true;
    try { s.cancel(); } catch (e) {}
    startElapsedTimer();
    paintNarr();
    speakChunk();
  };

  var pauseNarr = function () {
    var s = speech();
    narr.playing = false;
    try { if (s) s.pause(); } catch (e) {}
    paintNarr();
  };

  var resumeNarr = function () {
    var s = speech();
    if (!s) return;
    narr.error = "";
    try {
      // If the synthesizer is paused mid-chunk, resume it; otherwise the
      // queue was cancelled (e.g. after a rate change) and we speak on.
      if (s.paused) {
        narr.playing = true;
        startElapsedTimer();
        s.resume();
        paintNarr();
      } else {
        narr.playing = true;
        startElapsedTimer();
        paintNarr();
        speakChunk();
      }
    } catch (e) {
      narr.playing = true;
      paintNarr();
      speakChunk();
    }
  };

  var stopNarr = function () {
    var s = speech();
    narr.playing = false;
    try { if (s) s.cancel(); } catch (e) {}
    stopElapsedTimer();
    narr.index = 0;
    narr.elapsed = 0;
    narr.error = "";
    paintNarr();
  };

  // A new record silences the old one: two stories never narrate at once,
  // and leaving a story always cleans up its voice.
  var silenceForRecord = function (id) {
    if (narr.activeId != null && narr.activeId !== id) {
      var s = speech();
      try { if (s) s.cancel(); } catch (e) {}
      stopElapsedTimer();
      narr.activeId = null;
      narr.chunks = [];
      narr.index = 0;
      narr.playing = false;
      narr.elapsed = 0;
      narr.error = "";
    }
  };

  var bindNarr = function () {
    if (!refs.record || refs.record.getAttribute("data-narr-bound")) return;
    refs.record.setAttribute("data-narr-bound", "true");
    refs.record.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-narr]");
      if (!btn || btn.tagName === "SELECT") return;
      var action = btn.getAttribute("data-narr");
      if (action === "toggle") {
        if (!narrSupported()) return;
        if (narr.playing) pauseNarr();
        else if (narr.index > 0 && narr.index < narr.chunks.length && narr.activeId === (state.record && state.record.id)) resumeNarr();
        else startNarr();
      } else if (action === "restart") {
        if (!narrSupported()) return;
        narr.index = 0;
        narr.elapsed = 0;
        if (state.record) {
          narr.chunks = chunkStory(narrText(state.record));
          narr.activeId = state.record.id;
        }
        startNarr();
      } else if (action === "stop") {
        stopNarr();
      }
    });
    refs.record.addEventListener("change", function (e) {
      var sel = e.target.closest && e.target.closest("[data-narr]");
      if (!sel) return;
      var kind = sel.getAttribute("data-narr");
      if (kind === "rate") {
        var rate = Number(sel.value) || 1;
        narr.rate = rate;
        // Rate applies to the next chunk: restart the current one if playing.
        if (narr.playing) {
          var s = speech();
          try { if (s) s.cancel(); } catch (err) {}
          speakChunk();
        }
      } else if (kind === "voice") {
        narr.voiceURI = sel.value || null;
        if (narr.playing) {
          var sp = speech();
          try { if (sp) sp.cancel(); } catch (err) {}
          speakChunk();
        }
      }
    });
    try {
      var s = speech();
      if (s && typeof s.addEventListener === "function") {
        s.addEventListener("voiceschanged", function () {
          pickVoice();
          fillVoiceSelect();
        });
      }
    } catch (e) {}
  };

  /* ---- record column ---- */

  var lastRecordId = -1;

  function renderRecord() {
    if (!refs.record) return;

    if (state.fatal) {
      renderFatal();
      return;
    }

    if (!state.record) {
      if (state.world && state.allObjects.length) renderCollection(state.world);
      else if (state.allObjects.length) renderIntro();
      else refs.record.innerHTML = "";
      return;
    }

    var r = state.record;
    var certainty = r.certainty || "unknown";

    // Leaving the front door: the viewport is GPU time the record does not need.
    stopScene();

    /* Re-rendering the same record — after a write, or a filter that does not
       close it — must not replay the entrance animation or lose the reader's
       place. Both of those used to happen, because the column's HTML is
       rebuilt wholesale. */
    var sameRecord = lastRecordId === r.id;
    var savedScroll = sameRecord ? refs.record.scrollTop : 0;

    /* Status and era are facts, not states: three bordered chips made the one
       chip that means something (certainty) compete with two that do not. */
    var facts = [];
    if (r.status) facts.push(escapeHtml(r.status));
    if (r.year != null) {
      facts.push(escapeHtml(r.era) + " · " + escapeHtml(String(r.year)));
    }
    var factLine = facts.length ? '<p class="record-facts">' + facts.join('<span class="sep">/</span>') + "</p>" : "";

    var badgesLine = '<div class="badges"><span class="badge ' + certainty + '">' +
      escapeHtml(certaintyLabel(certainty)) + "</span></div>";

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
      '<div class="record-inner" data-world="' + escapeHtml(r.worldCode || "") + '" data-readsize="' + state.readSize + '"' +
      (state.focusMode ? ' data-focus="on"' : "") +
      (sameRecord ? ' data-replay="same"' : "") + ">" +
      '<div class="read-progress" data-pct="0" aria-hidden="true"><span></span></div>' +
      '<nav class="crumbs" aria-label="Archive location">' +
      '<button type="button" data-go="home">Archive</button>' +
      '<span aria-hidden="true"> · </span>' +
      '<button type="button" data-go="collection" data-world="' + escapeHtml(r.worldCode || "") + '">' + escapeHtml(r.worldName || "Collection") + "</button>" +
      '<span aria-hidden="true"> · </span><span>' + escapeHtml(r.name) + "</span>" +
      "</nav>" +
      '<div class="eyebrow"><span>Record</span>' +
      (r.mark ? '<span class="world"> · ' + escapeHtml(r.mark) + "</span>" : "") +
      "</div>" +
      '<h2 tabindex="-1">' + escapeHtml(r.name) + "</h2>" + factLine + badgesLine;

    if (r.subtitle) {
      html += '<p class="standfirst">' + escapeHtml(r.subtitle) + "</p>";
    }

    if (r.summary) {
      html += '<p class="lede">' + escapeHtml(r.summary) + "</p>";
    }

    // Reading metadata: how long, where, what kind. One line, no dashboard.
    var readBits = [];
    if (r.worldName) readBits.push(escapeHtml(r.worldName));
    if (r.readingMinutes != null) readBits.push(escapeHtml(String(r.readingMinutes)) + " min read");
    var cats = recordCategories(r);
    for (var ci = 0; ci < cats.length; ci++) {
      readBits.push('<span class="cat">' + escapeHtml(categoryLabel(cats[ci])) + "</span>");
    }
    if (readBits.length) {
      html += '<p class="read-meta">' + readBits.join('<span class="sep"> · </span>') + "</p>";
    }

    html += renderReadToolbar() + renderNarrPanel();
    html += renderHero(r);
    html += renderNarrative(r);
    // The film comes after the complete story, never before it — and the
    // photo evidence stays its own section rather than mixing with video.
    html += renderWatch(watchForRecord(r));
    html += renderMedia(mediaForRecord(r));
    html += blocks + renderRecordNav(r) + "</div>";

    refs.record.innerHTML = html;
    refs.record.scrollTop = savedScroll;
    lastRecordId = r.id;
    applyFocusMode();
    updateReadProgress();
    fillVoiceSelect();
    paintNarr();
    showNotice();
  }

  /* ---- reader chrome: toolbar, hero, narrative, prev/next ----
     Everything here is additive: the five fact blocks, the evidence media,
     and the provenance panels render exactly as before. */

  function renderReadToolbar() {
    return (
      '<div class="read-toolbar" role="toolbar" aria-label="Reading controls">' +
      '<span class="read-toolbar-label">Reading</span>' +
      '<button type="button" class="toolbtn" data-read="smaller" aria-label="Smaller text">A−</button>' +
      '<button type="button" class="toolbtn" data-read="larger" aria-label="Larger text">A+</button>' +
      '<button type="button" class="toolbtn" data-read="focus" aria-pressed="' + (state.focusMode ? "true" : "false") + '">' +
      (state.focusMode ? "Exit focus" : "Focus") + "</button>" +
      "</div>"
    );
  }

  function renderNarrPanel() {
    if (!narrSupported()) {
      return (
        '<div class="narr" data-state="unsupported">' +
        '<p class="narr-status" role="status">Listening is not supported in this browser — the full story above is always available to read.</p>' +
        "</div>"
      );
    }
    var rates = [0.75, 1, 1.25, 1.5];
    var rateOpts = rates.map(function (x) {
      return '<option value="' + x + '"' + (narr.rate === x ? " selected" : "") + ">" + x + "×</option>";
    }).join("");
    return (
      '<div class="narr" data-state="idle">' +
      '<div class="narr-row">' +
      '<button type="button" class="btn narr-main" data-narr="toggle">Listen to Story</button>' +
      '<button type="button" class="toolbtn" data-narr="restart" aria-label="Restart narration">Restart</button>' +
      '<button type="button" class="toolbtn" data-narr="stop" aria-label="Stop narration">Stop</button>' +
      '<label class="narr-field">Speed <select data-narr="rate" aria-label="Narration speed">' + rateOpts + "</select></label>" +
      '<label class="narr-field">Voice <select data-narr="voice" aria-label="Narration voice"><option value="">Default voice</option></select></label>' +
      "</div>" +
      '<div class="narr-progress" data-pct="0" aria-hidden="true"><span></span></div>' +
      '<p class="narr-meta"><span class="narr-status" role="status">Browser narration. Press play to hear the full story.</span> ' +
      '<span class="narr-count" aria-hidden="true"></span> <span class="narr-elapsed" aria-label="Elapsed time">00:00</span></p>' +
      '<p class="narr-note">Read aloud by your browser — not an AI voice, and nothing leaves the archive.</p>' +
      "</div>"
    );
  }

  function renderHero(r) {
    if (!r.heroImage) return "";
    return (
      '<figure class="hero-fig">' +
      '<img class="hero-img" src="' + escapeHtml(r.heroImage) + '" alt="Archive imagery for ' + escapeHtml(r.name) + '" loading="lazy" />' +
      (r.heroCredit ? "<figcaption>" + escapeHtml(r.heroCredit) + "</figcaption>" : "") +
      "</figure>"
    );
  }

  function renderNarrative(r) {
    var sections = (r && r.narrative) || [];
    if (!sections.length) return "";
    var out = '<div class="narrative" aria-label="Full story">';
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i] || {};
      out += '<section class="story">';
      if (s.h) out += "<h3>" + escapeHtml(s.h) + "</h3>";
      var paras = s.p || [];
      for (var j = 0; j < paras.length; j++) {
        if (paras[j]) out += "<p>" + escapeHtml(paras[j]) + "</p>";
      }
      out += "</section>";
    }
    return out + "</div>";
  }

  function recordNeighbour(offset) {
    var list = state.allObjects && state.allObjects.length ? state.allObjects : state.objects;
    if (!list.length || !state.record) return null;
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === state.record.id) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return null;
    var n = list[idx + offset];
    return n || null;
  }

  function renderRecordNav(r) {
    var prev = recordNeighbour(-1);
    var next = recordNeighbour(1);
    if (!prev && !next) return "";
    var out = '<nav class="record-nav" aria-label="More stories">';
    out += prev
      ? '<button type="button" class="btn nav-btn" data-nav="' + prev.id + '"><span class="nav-dir">Previous story</span><span class="nav-name">' + escapeHtml(prev.name) + "</span></button>"
      : '<span class="nav-btn nav-btn--empty" aria-hidden="true"></span>';
    out += next
      ? '<button type="button" class="btn nav-btn" data-nav="' + next.id + '"><span class="nav-dir">Next story</span><span class="nav-name">' + escapeHtml(next.name) + "</span></button>"
      : '<span class="nav-btn nav-btn--empty" aria-hidden="true"></span>';
    return out + "</nav>";
  }

  function applyFocusMode() {
    try {
      if (state.focusMode) document.body.classList.add("reading-focus");
      else document.body.classList.remove("reading-focus");
    } catch (e) {}
    // The toolbar button is re-rendered with the record; keep its state true.
    if (refs.record) {
      var btn = refs.record.querySelector('[data-read="focus"]');
      if (btn) btn.setAttribute("aria-pressed", state.focusMode ? "true" : "false");
    }
  }

  function updateReadProgress() {
    if (!refs.record) return;
    var track = refs.record.querySelector(".read-progress");
    if (!track) return;
    var max = refs.record.scrollHeight - refs.record.clientHeight;
    var pct = max > 0 ? Math.round((refs.record.scrollTop / max) * 100) : 0;
    if (pct < 0) pct = 0;
    if (pct > 100) pct = 100;
    // Buckets, not inline styles: style-src forbids the latter (see paintNarr).
    track.setAttribute("data-pct", String(Math.round(pct / 10) * 10));
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
        /* No initial-avatars: two letters in a grey square is the most
           recognisable piece of generated-interface furniture there is, and it
           repeated the role label sitting directly underneath it. The role is
           already the visual; the note is the value. */
        p +=
          '<div class="person">' +
          '<div class="person-role">' + escapeHtml(person.role) + "</div>" +
          '<div class="person-name">' + escapeHtml(person.name) + "</div>" +
          '<p class="person-note">' + escapeHtml(person.note) + "</p>" +
          "</div>";
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
          '<p class="action-by">Filed ' + escapeHtml(archiveDate(a.madeAt)) +
          " · " + escapeHtml(archiveStamp(a.madeAt)) + " · " + escapeHtml(a.madeBy) + "</p></div>";
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
      '<label for="action-text">Proposed action</label>' +
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
        if (o.readingMinutes != null) eraYear += " · " + String(o.readingMinutes) + " min";
        // One glance says which records carry footage, so nobody has to hunt.
        var mediaTag = o.hasVideo && o.hasPhoto ? "photo · film"
          : o.hasVideo ? "film"
          : o.hasPhoto ? "photo" : "";
        // The preview must read like a preview: a subtitle and a promise of
        // the full story, never the story itself.
        var sub = o.subtitle
          ? '<span class="row-sub">' + escapeHtml(o.subtitle) + "</span>"
          : "";
        var fullTag = '<span class="row-full">Full story</span>';
        html +=
          '<li><button type="button" class="row" data-id="' + o.id + '"' +
          (o.id === state.selectedId ? ' aria-current="true"' : "") +
          ">" +
          '<span class="row-title">' +
          '<span class="dot ' + dotClass(certainty) + '" title="' + escapeHtml(certaintyLabel(certainty)) + '" aria-hidden="true"></span>' +
          escapeHtml(o.name) +
          '<span class="sr-only">(' + escapeHtml(certaintyLabel(certainty)) + ")</span>" +
          "</span>" +
          sub +
          '<span class="row-meta">' +
          '<span class="row-world">' + escapeHtml(o.worldName || "") + "</span>" +
          '<span class="row-right">' +
          (mediaTag ? '<span class="row-media">' + mediaTag + "</span>" : "") +
          fullTag +
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
    stopNarr();
    state.focusMode = false;
    try { document.body.classList.remove("reading-focus"); } catch (e) {}
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
    silenceForRecord(id);
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
    if (state.category) opts.category = state.category;
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

  async function setCategory(code) {
    state.category = code;
    await reloadObjects();
    await render();
  }

  /* ---- views: home, collection, story ----
     Chips filter; these travel. Going home or opening a collection clears
     the open record (and its voice) so the front door or the shelf is what
     is on screen. Filter chips are rebuilt so their pressed states agree. */

  function pressedChips(container, attr, value) {
    if (!container) return;
    Array.prototype.forEach.call(container.children, function (c) {
      c.setAttribute("aria-pressed", (c.getAttribute(attr) || "") === (value || "") ? "true" : "false");
    });
  }

  async function goHome() {
    silenceForRecord(null);
    state.selectedId = null;
    state.record = null;
    state.notice = "";
    state.world = null;
    state.category = null;
    state.q = "";
    if (refs.search) refs.search.value = "";
    pressedChips(refs.filters, "data-world", "");
    pressedChips(refs.catFilters, "data-category", "");
    await reloadObjects();
    if (refs.record) refs.record.scrollTop = 0;
    await render();
  }

  async function showCollection(code) {
    silenceForRecord(null);
    state.selectedId = null;
    state.record = null;
    state.notice = "";
    state.world = code;
    state.category = null;
    state.q = "";
    if (refs.search) refs.search.value = "";
    pressedChips(refs.filters, "data-world", code);
    pressedChips(refs.catFilters, "data-category", "");
    await reloadObjects();
    if (refs.record) refs.record.scrollTop = 0;
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

  /* Story-kind filters live in their own group so the world chips keep their
     exact shape (and count). Options come from the archive itself, so a kind
     with no stories can never appear. */
  async function buildCategoryFilters() {
    if (!refs.catFilters) return;
    var seen = {};
    var order = [];
    var list = state.allObjects || [];
    for (var i = 0; i < list.length; i++) {
      var cats = list[i].categories || [];
      for (var j = 0; j < cats.length; j++) {
        if (!seen[cats[j]]) {
          seen[cats[j]] = true;
          order.push(cats[j]);
        }
      }
    }
    order.sort();
    var html = '<button type="button" class="chip chip--cat" data-category="" aria-pressed="true">All kinds</button>';
    for (var k = 0; k < order.length; k++) {
      html +=
        '<button type="button" class="chip chip--cat" data-category="' + escapeHtml(order[k]) +
        '" aria-pressed="false">' + escapeHtml(categoryLabel(order[k])) + "</button>";
    }
    refs.catFilters.innerHTML = html;

    Array.prototype.forEach.call(refs.catFilters.children, function (btn) {
      btn.addEventListener("click", function () {
        var code = btn.getAttribute("data-category") || null;
        Array.prototype.forEach.call(refs.catFilters.children, function (c) {
          c.setAttribute("aria-pressed", c === btn ? "true" : "false");
        });
        setCategory(code);
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
        if (mark) {
          selectObject(Number(mark.getAttribute("data-id")), { keyboard: isKeyboardClick(e) });
          return;
        }
        // Front door, shelves, and index rows all open by record id.
        var opener = e.target.closest("[data-id]");
        if (opener && !opener.classList.contains("row")) {
          selectObject(Number(opener.getAttribute("data-id")), { keyboard: isKeyboardClick(e) });
          return;
        }
        // Breadcrumb travel: home, or this record's collection.
        var go = e.target.closest("[data-go]");
        if (go) {
          if (go.getAttribute("data-go") === "home") goHome();
          else showCollection(go.getAttribute("data-world"));
          return;
        }
        // Collection entries on the front door.
        var jump = e.target.closest("[data-world-jump]");
        if (jump) {
          showCollection(jump.getAttribute("data-world-jump"));
          return;
        }
        // A film is invited in, never autoplayed.
        var play = e.target.closest("[data-play]");
        if (play) {
          var box = play.closest(".video");
          var id = play.getAttribute("data-play");
          if (box && /^[A-Za-z0-9_-]{11}$/.test(id || "")) mountVideoFrame(box, id);
          return;
        }
        // Previous / next story navigation.
        var nav = e.target.closest("[data-nav]");
        if (nav) {
          selectObject(Number(nav.getAttribute("data-nav")), { keyboard: isKeyboardClick(e) });
          return;
        }
        // Reading controls: text size and focus mode.
        var tool = e.target.closest("[data-read]");
        if (tool) {
          var action = tool.getAttribute("data-read");
          if (action === "smaller" && state.readSize > -2) state.readSize -= 1;
          if (action === "larger" && state.readSize < 2) state.readSize += 1;
          if (action === "focus") {
            state.focusMode = !state.focusMode;
            // Focus is a reading posture, not a place: return to the top.
            refs.record.scrollTop = 0;
          }
          render();
          return;
        }
      });

      refs.record.addEventListener("keydown", function (e) {
        if (e.key !== "Enter" && e.key !== " ") return;
        var mark = e.target.closest(".map-mark");
        if (!mark) return;
        e.preventDefault();
        selectObject(Number(mark.getAttribute("data-id")), { keyboard: true });
      });

      // Reading progress follows the record column's own scroll.
      refs.record.addEventListener("scroll", function () {
        updateReadProgress();
      }, { passive: true });

      // Remote film thumbnails fail offline. Error events do not bubble, so
      // listen in capture: mark the broken image (the stylesheet hides it —
      // inline styles are forbidden here) and let the flat wrapper, the
      // title, and the link below carry the entry instead.
      refs.record.addEventListener("error", function (e) {
        var img = e.target;
        if (img && img.tagName === "IMG" && img.getAttribute("data-remote") === "true") {
          img.setAttribute("data-gone", "true");
          var wrap = img.closest(".video-thumb-wrap");
          if (wrap) wrap.setAttribute("data-broken", "true");
        } else if (img && img.tagName === "IMG" && img.classList.contains("feature-thumb")) {
          img.setAttribute("data-gone", "true");
        }
      }, true);
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
    await buildCategoryFilters();
    bindSearch();
    wireList();
    bindForm();
    bindNarr();

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
    await buildCategoryFilters();
    await render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
