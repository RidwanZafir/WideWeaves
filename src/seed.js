const { getDb, saveDb } = require("./db");

function now() {
  return new Date().toISOString();
}

const WORLDS = [
  { code: "moon", name: "The Moon" },
  { code: "mars", name: "Mars" }
];

const OBJECTS = [
  {
    world: "moon",
    name: "Surveyor 1",
    summary:
      "A soft-landed probe that survived its mission and then sat on the Moon for the rest of time.",
    what_is:
      "A 280 kg unmanned spacecraft built to photograph and analyse the lunar surface in preparation for Apollo.",
    why_abandoned:
      "It completed its work and was not recovered. Leaving it was not a failure; it was the plan.",
    lesson:
      "Every footprint Apollo left was preceded by robots that proved the ground could hold a spacecraft.",
    status: "intact",
    mark: "lander",
    status_note: "Believed still on the surface at its original landing site.",
    location_note: "Oceanus Procellarum, near the coordinates reported after landing.",
    certainty: "high",
    certainty_note: "Landing coordinates are documented and the site is well established.",
    era: "1960s",
    mission_code: "Surveyor",
    year: 1966,
    stakeholders: [
      { role: "Mission historian", name: "Lunar program records group", note: "Tracks the Surveyor series as the technical proof for Apollo landings." },
      { role: "Heritage advocate", name: "Off-world heritage working group", note: "Argues this site is a candidate for formal preservation status." },
      { role: "Educator", name: "Planetary science outreach", note: "Uses Surveyor as the opening chapter in the Apollo story." }
    ],
    sources: [
      { kind: "Mission record", title: "Surveyor 1 mission summary", reference: "Public mission archive" },
      { kind: "Image archive", title: "Surface photography returned by the lander", reference: "Public image collection", nasaId: "PIA12910", nasaUrl: "https://images.nasa.gov/details-PIA12910", nasaCaption: "NASA Surveyor 1 spacecraft sitting silently on Oceanus Procellarum, the first US spacecraft to land on another planet on June 2, 1966 in this image taken by NASA Lunar Reconnaissance Orbiter." },
      { kind: "Technical report", title: "Soft-landing design and performance notes", reference: "Engineering report series" }
    ],
    next_action: {
      action: "Attach the returned image set to this record",
      why: "The photographs are the object's own testimony. Pairing them with the location makes the record usable for teaching."
    }
  },
  {
    world: "moon",
    name: "Apollo 11 descent stage",
    summary:
      "The lower half of the first lunar module that carried humans down and then stayed behind.",
    what_is: "The descent stage of Eagle, left on the Moon after the ascent stage returned to orbit.",
    why_abandoned:
      "It was spent fuel and structure. There was no way to bring it home and no reason to try.",
    lesson:
      "Human exploration is partly a story of what we leave behind so that the next step can happen.",
    status: "intact",
    mark: "descent",
    status_note: "Documented expectation is that the stage remains at the landing site.",
    location_note: "Sea of Tranquility, the first human landing site.",
    certainty: "high",
    certainty_note: "The primary landing site is well established; the residual hardware follows the documented mission plan.",
    era: "Apollo",
    mission_code: "Apollo 11",
    year: 1969,
    stakeholders: [
      { role: "Mission historian", name: "Apollo archive team", note: "Maintains the primary record for the first landing." },
      { role: "Site planner", name: "Future surface activity planning", note: "Needs the site inventory before any nearby operations are proposed." },
      { role: "Heritage advocate", name: "Off-world heritage working group", note: "Treats this as the most symbolically significant off-world site." }
    ],
    sources: [
      { kind: "Mission record", title: "Apollo 11 mission report", reference: "Public mission archive" },
      { kind: "Policy document", title: "Off-world heritage protection guidance", reference: "Heritage policy discussion" },
      { kind: "Image archive", title: "Surface photography from the landing", reference: "Public image collection" },
      { kind: "Video", title: "Restored Apollo 11 moonwalk — original EVA footage", reference: "NASA official channel · full mission video", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=S9HdPi9Ikhk", nasaCaption: "Original mission video as aired in July 1969: Armstrong and Aldrin's moonwalk." }
    ],
    next_action: {
      action: "Record the site boundary as a protected-consideration zone",
      why: "Any future activity near the site needs an agreed boundary on the record before it becomes a live question."
    }
  },
  {
    world: "moon",
    name: "Luna 2",
    summary:
      "The first human-made object to reach another world, and one that did not survive the meeting.",
    what_is: "A Soviet lunar probe that became the first artificial object to reach the Moon.",
    why_abandoned: "It was destroyed on impact. This is abandonment by vanishing.",
    lesson:
      "The first footprint on the Moon was not made by a person; it was made by a collision.",
    status: "lost",
    mark: "impact",
    status_note: "Impacted the surface; little or nothing identifiable remains at the site.",
    location_note: "Approximately the intended impact area in the Moon's equatorial region.",
    certainty: "medium",
    certainty_note: "The event is well documented; the precise surviving hardware is not.",
    era: "1950s",
    mission_code: "Luna 2",
    year: 1959,
    stakeholders: [
      { role: "Mission historian", name: "Early lunar program records", note: "Documents the first impact as a first-contact milestone." },
      { role: "Educator", name: "Planetary science outreach", note: "Uses Luna 2 to show how much of the story is not American." }
    ],
    sources: [
      { kind: "Mission record", title: "Luna 2 launch and impact summary", reference: "Public mission archive" },
      { kind: "Commemoration", title: "Marker left by a later mission at the impact region", reference: "Commemoration record" },
      { kind: "Video", title: "Tour of the Moon in 4K", reference: "NASA Goddard · LRO visualization", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=nr5Pj6GQL2o", nasaCaption: "Lunar context, honestly labelled: no footage of Luna 2 can exist — it was destroyed on impact. This LRO tour shows the world it reached." }
    ],
    next_action: {
      action: "Mark the location as approximate and say why",
      why: "The uncertainty is part of the record. Recording it prevents the site being described with false precision later."
    }
  },
  {
    world: "mars",
    name: "Schiaparelli EDM lander",
    summary: "A descent module that was meant to land softly and instead fell hard.",
    what_is:
      "The entry, descent, and landing demonstrator module of the ExoMars 2016 mission.",
    why_abandoned:
      "A landing anomaly left it on the surface as wreckage instead of a working station.",
    lesson:
      "Mars does not care how carefully the landing was planned; it only cares whether the sequence closes.",
    status: "wreckage",
    mark: "wreckage",
    status_note: "Impact and debris field expected near the intended landing site.",
    location_note: "Meridiani Planum.",
    certainty: "medium",
    certainty_note: "The landing anomaly is documented; the exact debris distribution is inferred.",
    era: "2010s",
    mission_code: "ExoMars 2016 / EDM",
    year: 2016,
    stakeholders: [
      { role: "Mission historian", name: "ExoMars records group", note: "Holds the anomaly investigation material." },
      { role: "Site planner", name: "Future surface activity planning", note: "Needs debris fields on the map before nearby operations are planned." },
      { role: "Archivist", name: "Engineering lessons archive", note: "Treats descent failures as required reading for future landings." }
    ],
    sources: [
      { kind: "Mission record", title: "ExoMars 2016 descent anomaly investigation", reference: "Public investigation summary" },
      { kind: "Image archive", title: "Orbital imagery of the candidate impact region", reference: "NASA Image and Video Library / HiRISE", nasaId: "PIA21131", nasaUrl: "https://images.nasa.gov/details-PIA21131", nasaCaption: "This Oct. 25, 2016, image shows the area where the European Space Agency's Schiaparelli test lander reached the surface of Mars, viewed by NASA's Mars Reconnaissance Orbiter." },
      { kind: "Video", title: "Schiaparelli's descent to Mars in real time", reference: "ESA · descent visualization", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=C43KXGQuUuY", nasaCaption: "The six-minute descent as planned. The final stages did not happen this way." }
    ],
    next_action: {
      action: "Add the anomaly findings as a linked lesson",
      why: "The value of a wreck is the lesson it carries. Linking the findings turns debris into engineering memory."
    }
  },
  {
    world: "mars",
    name: "Mars landing failures",
    summary:
      "A category record for Mars hardware that arrived and was abandoned by accident.",
    what_is:
      "A curated grouping of Mars landing attempts whose hardware ended up where it was not meant to stay.",
    why_abandoned:
      "Some were lost on arrival and some soon after. In each case the hardware stayed where it stopped.",
    lesson: "Abandonment on Mars often begins at touchdown, before any science gets a chance.",
    status: "mixed",
    mark: "cluster",
    status_note: "Status varies by mission; several cases are inferred rather than confirmed.",
    location_note: "Various Mars sites, depending on the mission.",
    certainty: "variable",
    certainty_note:
      "Some cases are well documented; others rest on reconstructed conclusions. The record marks which is which.",
    era: "Mars landing era",
    mission_code: "various",
    year: null,
    stakeholders: [
      { role: "Archivist", name: "Engineering lessons archive", note: "Collects descent failures as a single body of evidence." },
      { role: "Educator", name: "Planetary science outreach", note: "Teaches risk and failure as a normal part of exploration." },
      { role: "Site planner", name: "Future surface activity planning", note: "Uses the inventory to avoid treating debris as new hardware." }
    ],
    sources: [
      { kind: "Survey", title: "Compiled inventory of Mars landing attempts", reference: "Public mission records" },
      { kind: "Analysis", title: "Reconstruction of descent sequences for failed attempts", reference: "Published analysis" },
      { kind: "Image archive", title: "Candidate impact site imaged from orbit", reference: "NASA Image and Video Library / HiRISE", nasaId: "PIA21131", nasaUrl: "https://images.nasa.gov/details-PIA21131", nasaCaption: "This Oct. 25, 2016, image shows the area where the European Space Agency's Schiaparelli test lander reached the surface of Mars, viewed by NASA's Mars Reconnaissance Orbiter." },
      { kind: "Video", title: "Seven Minutes of Terror", reference: "NASA JPL · Curiosity EDL", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=Ki_Af_o9Q9s", nasaCaption: "Why Mars landings fail so often: seven minutes from atmosphere to ground, no help from Earth." }
    ],
    next_action: {
      action: "Split this grouping into one record per mission",
      why: "A category hides the detail. Individual records let each failure carry its own lesson and location."
    }
  }
];

async function seedIfEmpty() {
  const db = getDb();

  const existing = db.exec("SELECT id FROM worlds LIMIT 1");
  if (existing.length && existing[0].values.length) {
    return;
  }

  const worldIdByCode = {};

  for (const w of WORLDS) {
    db.run("INSERT INTO worlds (code, name, created_at) VALUES (?, ?, ?)", [
      w.code,
      w.name,
      now()
    ]);
    const row = db.exec("SELECT id FROM worlds WHERE code = ?", [w.code]);
    worldIdByCode[w.code] = row[0].values[0][0];
  }

  for (const obj of OBJECTS) {
    const worldId = worldIdByCode[obj.world];
    if (!worldId) continue;

    db.run(
      `INSERT INTO objects (
        world_id, name, sort_title, summary, what_is, why_abandoned,
        lesson, status, status_note, location_note, certainty, certainty_note,
        mark, era, mission_code, year, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        worldId,
        obj.name,
        obj.name,
        obj.summary,
        obj.what_is,
        obj.why_abandoned,
        obj.lesson,
        obj.status,
        obj.status_note,
        obj.location_note,
        obj.certainty,
        obj.certainty_note,
        obj.mark || null,
        obj.era,
        obj.mission_code,
        obj.year,
        now(),
        now()
      ]
    );

    const objectRow = db.exec("SELECT id FROM objects WHERE name = ? AND world_id = ?", [
      obj.name,
      worldId
    ]);
    const objectId = objectRow[0].values[0][0];

    for (const s of obj.stakeholders || []) {
      db.run(
        "INSERT INTO stakeholders (object_id, role, name, note, created_at) VALUES (?, ?, ?, ?, ?)",
        [objectId, s.role, s.name, s.note, now()]
      );
    }

    for (const src of obj.sources || []) {
      db.run(
        "INSERT INTO sources (object_id, kind, title, reference, nasa_id, nasa_url, nasa_caption, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [objectId, src.kind, src.title, src.reference, src.nasaId || null, src.nasaUrl || null, src.nasaCaption || null, now()]
      );
    }

    if (obj.next_action) {
      db.run(
        "INSERT INTO next_actions (object_id, made_by, made_at, action, why, status) VALUES (?, ?, ?, ?, ?, 'open')",
        [objectId, "archive seed", now(), obj.next_action.action, obj.next_action.why]
      );
    }
  }

  saveDb();
}

module.exports = { seedIfEmpty };
