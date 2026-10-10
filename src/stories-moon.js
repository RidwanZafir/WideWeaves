/* Abandoned but Not Forgotten — Moon story library.
 *
 * Content lives here, separate from presentation: seed.js inserts these rows,
 * the handlers serve them, and dist/app.js renders them. To add a story, add
 * one object. Fields:
 *   narrative: [{ h: section heading, p: [paragraphs] }] — the full story.
 *   categories: honest tags from the fixed set below.
 *   hero_image: always a vendored local asset (offline archive stays offline).
 *
 * Accuracy rules: no invented quotes, dialogue, or transmissions. Figures are
 * from the public mission record (NASA NSSDC, Apollo Lunar Surface Journal,
 * NASA LRO). Where the record is genuinely uncertain, the text says so.
 */

const MOON_HERO = "assets/nasa-PIA12910.jpg";
const MOON_HERO_CREDIT =
  "Lunar surface context from the archive's vendored NASA collection: the Surveyor 1 site imaged by the Lunar Reconnaissance Orbiter (NASA/GSFC/Arizona State University). Not the story's own hardware unless the caption says so.";

// Honest, fixed vocabulary. Every category must describe the actual story.
const CATS = {
  FIRST: "historic-first",
  ROBOT: "robotic-explorer",
  HUMAN: "human-footprint",
  LOST: "lost-mission",
  LEGACY: "science-legacy",
  LESSON: "engineering-lesson"
};

const MOON_STORIES = [
  {
    world: "moon",
    name: "Luna 2",
    subtitle: "The first human-made object to reach another world",
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
    hero_image: MOON_HERO,
    hero_credit: MOON_HERO_CREDIT,
    categories: [CATS.FIRST, CATS.LEGACY],
    reading_minutes: 3,
    narrative: [
      {
        h: "A flash no telescope saw",
        p: [
          "On 13 September 1959, something built by human hands arrived at the Moon for the first time — and was destroyed in the same instant. Luna 2 had been aimed at the lunar surface with no parachute, no retrorockets, and no expectation of survival. It was a projectile with instruments, and it did exactly what it was designed to do: hit the Moon and report back until the moment it couldn't.",
          "Nobody watched it land. There was no camera on board and no orbiter overhead. The confirmation came from radio telescopes, which heard the probe's signal stop, and from the Soviet tracking network, which had followed it all the way up. First contact with another world was an absence: one minute a signal, the next minute silence."
        ]
      },
      {
        h: "Why throw a spacecraft at the Moon",
        p: [
          "The Luna programme, run by Sergei Korolev's OKB-1 design bureau, was racing the Americans to the Moon in the late 1950s. After several launch failures, Luna 1 had missed the Moon that January and become the first spacecraft to orbit the Sun. Luna 2 was its sterner sibling: a 390-kilogram sphere studded with antennas, carrying magnetometers, radiation detectors, and micrometeorite counters.",
          "Its scientific job was to answer a genuine question — does the Moon have a magnetic field or trapped radiation like Earth's? — and its political job was to prove Soviet rockets could hit a target a quarter of a million miles away. Both jobs were accomplished in the hour before impact."
        ]
      },
      {
        h: "The journey and the measurements",
        p: [
          "Launched on 12 September 1959, Luna 2 coasted for about a day and a half. As it approached, its magnetometer found no lunar magnetic field of any strength comparable to Earth's — the first direct evidence that the Moon lacks a global magnetosphere. Its particle detectors found no trapped radiation belts around the Moon either.",
          "Then, at roughly 21:39 UTC on 13 September, the probe struck the surface east of Mare Imbrium, near the craters Aristides, Archimedes, and Autolycus. It scattered Soviet pennants — small metal spheres designed to survive the crash — across the impact zone. Nobody has ever found them."
        ]
      },
      {
        h: "What was left behind",
        p: [
          "Almost certainly nothing identifiable. An impact at lunar approach velocity, around 3.3 kilometres per second, vaporises and shatters a spacecraft. The pennants may survive as fragments somewhere in the regolith, but no orbiter has ever identified wreckage, and the impact point is known only approximately.",
          "That is why this record's location is marked approximate. Precision would be dishonest: the event is certain, the debris field is not."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Luna 2 proved interplanetary navigation was possible — you could aim at another world and hit it. Its magnetic and radiation readings shaped every later mission design, including the shielding and trajectories of the crewed flights that followed.",
          "It also set the tone for everything this archive keeps: the Moon's story begins not with a footprint but with a crash. Every soft landing since, American, Soviet, Chinese, and Indian, is measured against the fact that the first arrival didn't land at all."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Early lunar program records", note: "Documents the first impact as a first-contact milestone." },
      { role: "Educator", name: "Planetary science outreach", note: "Uses Luna 2 to show how much of the story is not American." }
    ],
    sources: [
      { kind: "Mission record", title: "Luna 2 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1959-014A" },
      { kind: "Commemoration", title: "Marker left by a later mission at the impact region", reference: "Commemoration record" },
      { kind: "Video", title: "Tour of the Moon in 4K", reference: "NASA Goddard · LRO visualization", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=nr5Pj6GQL2o", nasaCaption: "Lunar context, honestly labelled: no footage of Luna 2 can exist — it was destroyed on impact. This LRO tour shows the world it reached." }
    ],
    next_action: {
      action: "Mark the location as approximate and say why",
      why: "The uncertainty is part of the record. Recording it prevents the site being described with false precision later."
    }
  },
  {
    world: "moon",
    name: "Luna 9",
    subtitle: "The first soft landing — a beach ball that phoned home",
    summary:
      "The first spacecraft to land softly on the Moon and send back pictures from the surface.",
    what_is:
      "A Soviet landing capsule that touched down gently and operated for three days on the surface.",
    why_abandoned:
      "Its batteries ran down as designed. There was never a plan to bring it home.",
    lesson:
      "The ground Apollo would walk on was first photographed by a robot the size of a beach ball.",
    status: "intact",
    mark: "lander",
    status_note: "Believed still on the surface at its landing site; long silent.",
    location_note: "Oceanus Procellarum, west of the craters Reiner and Marius.",
    certainty: "high",
    certainty_note: "Landing site identified in Lunar Reconnaissance Orbiter images.",
    era: "1960s",
    mission_code: "Luna 9",
    year: 1966,
    hero_image: MOON_HERO,
    hero_credit: MOON_HERO_CREDIT,
    categories: [CATS.FIRST, CATS.ROBOT],
    reading_minutes: 3,
    narrative: [
      {
        h: "Seven years of crashing, then gentleness",
        p: [
          "Before February 1966, everything humanity had sent to the Moon had either missed, orbited, or crashed. Eleven Soviet attempts and several American ones had failed. The question wasn't just prestige — nobody knew whether the lunar surface could hold a spacecraft at all. One serious theory held that the Moon was covered in deep dust into which any lander would sink.",
          "On 3 February 1966, Luna 9 answered that question by surviving. Its landing capsule, a sphere less than a metre across, bounced, rolled, and came to rest upright — and then unfolded four petals, looked around, and started transmitting."
        ]
      },
      {
        h: "How you land an egg without breaking it",
        p: [
          "The engineering was blunt and brilliant. The main spacecraft braked with a retrorocket, then, four metres above the surface, ejected the sealed landing capsule. Airbags inflated around it. It hit at roughly 15 metres per second, bounced several times, and settled. The airbags were jettisoned, the petals opened to steady it, and antennas deployed.",
          "Inside the 99-kilogram capsule: a television camera, a radiation detector, and a radio. That was enough."
        ]
      },
      {
        h: "The first pictures from another world",
        p: [
          "Luna 9's camera worked like a fax machine, scanning the landscape line by line and radioing each strip to Earth. Over three days it returned a handful of panoramic images: a horizon close and sharp, rocks scattered on firm-looking ground, shadows black and hard in the airless sunlight.",
          "The ground looked solid. The dust-sink theory died the week those panoramas were published. Engineers at NASA and in the Soviet programme alike studied the shadows and stones to calibrate what a landing surface really looks like."
        ]
      },
      {
        h: "What happened to it",
        p: [
          "On 6 February 1966, after three days and four transmission sessions, the batteries died and Luna 9 fell silent. It sits there still, petals open, in Oceanus Procellarum — the same broad plain where Surveyor 1 would land four months later. The Lunar Reconnaissance Orbiter has photographed the site, and the little lander is visible as a bright speck with its shadow.",
          "It was never meant to come home. Landing was the whole mission, and the mission worked."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Luna 9 is the proof that soft landing was possible, delivered months before Surveyor 1 confirmed it for the Americans. Without its panoramas, the confidence to commit Apollo hardware to a surface landing would have come later and cost more.",
          "It also remains a heritage object of the first rank: the first machine to rest intact on another world. Like everything in this archive, it is still exactly where history left it."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Early lunar program records", note: "Holds Luna 9 as the soft-landing milestone against which later landers are measured." },
      { role: "Heritage advocate", name: "Off-world heritage working group", note: "Lists the site among first-landing locations worth formal protection." }
    ],
    sources: [
      { kind: "Mission record", title: "Luna 9 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-006A" },
      { kind: "Image archive", title: "Lunar Reconnaissance Orbiter views of early landing sites", reference: "LROC, Arizona State University", nasaUrl: "https://www.lroc.asu.edu/" }
    ],
    next_action: {
      action: "Pair the LRO site image with this record",
      why: "A first-landing site readers can actually see is worth more than a paragraph saying where it is."
    }
  },
  {
    world: "moon",
    name: "Surveyor 1",
    subtitle: "The robot that proved the ground would hold",
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
    hero_image: MOON_HERO,
    hero_credit: "The Surveyor 1 hardware on Oceanus Procellarum, imaged by NASA's Lunar Reconnaissance Orbiter (NASA/GSFC/Arizona State University). Vendored in this archive's collection.",
    categories: [CATS.ROBOT, CATS.LEGACY],
    reading_minutes: 3,
    narrative: [
      {
        h: "Apollo needed an answer first",
        p: [
          "By 1966 NASA had committed to landing astronauts on the Moon before the decade ended, but one fact remained unverified: would the lunar surface support the weight of a lander? Luna 9 had suggested the ground was firm, yet American engineers needed their own measurements — soil strength, slopes, rock sizes — at a site like the ones Apollo might use.",
          "Surveyor 1 was the instrument sent to get them. It was the first of seven American robotic landers, and the only one whose success the whole Apollo schedule quietly depended on."
        ]
      },
      {
        h: "A controlled fall from 75 kilometres",
        p: [
          "Launched 30 May 1966, Surveyor 1 braked out of its approach with a solid retrorocket, jettisoned it, and finished the descent on throttleable liquid engines and a Doppler radar that read its own altitude and speed. On 2 June it touched down in Oceanus Procellarum at walking pace — the first American soft landing on another world.",
          "The craft stood about three metres tall on three legs, with two solar panels and a television camera on a mast. It weighed roughly 280 kilograms on Earth, about 47 on the Moon."
        ]
      },
      {
        h: "Eleven thousand photographs of the ground",
        p: [
          "Surveyor 1 returned more than 11,000 television images: the horizon, the footpads pressed into the soil, the surface disturbed by the descent engines. The footpads had sunk only a few centimetres. The ground was firm — a load-bearing soil, not bottomless dust.",
          "It also survived the two-week lunar night, which it was never designed to do, and woke up to keep transmitting. The mission ran until January 1967, far past its planned few weeks."
        ]
      },
      {
        h: "Still standing where it landed",
        p: [
          "When the batteries finally died, Surveyor 1 stayed exactly where it was: legs down, camera mast up, on the plain it had certified. In 2010 the Lunar Reconnaissance Orbiter photographed it from above — a small bright machine with a long shadow, surrounded by the disturbed soil of its own landing.",
          "Nobody will service it. There is nothing to service. Its job ended the moment Apollo planners trusted the ground."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Surveyor 1 is the reason the Apollo landings could proceed with confidence in the surface. Its soil measurements fed directly into footpad design, astronaut training, and landing-site selection.",
          "It is also the cleanest example of this archive's thesis: the hardware is fine. What decays is the record of why it is there — and that, unlike the machine, we can still repair."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Lunar program records group", note: "Tracks the Surveyor series as the technical proof for Apollo landings." },
      { role: "Heritage advocate", name: "Off-world heritage working group", note: "Argues this site is a candidate for formal preservation status." },
      { role: "Educator", name: "Planetary science outreach", note: "Uses Surveyor as the opening chapter in the Apollo story." }
    ],
    sources: [
      { kind: "Mission record", title: "Surveyor 1 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1966-045A" },
      { kind: "Mission record", title: "Surveyor 1 mission summary", reference: "Public mission archive", nasaUrl: "https://science.nasa.gov/mission/surveyor-1/" },
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
    name: "Surveyor 3 and its Apollo visitors",
    subtitle: "The lander that waited two years for guests",
    summary:
      "A robotic lander visited, years later, by the Apollo 12 astronauts — who cut pieces off it and brought them home.",
    what_is:
      "NASA's third Surveyor lander, examined on the surface by two moonwalking astronauts in November 1969.",
    why_abandoned:
      "Its mission ended in 1967; parts were retrieved in 1969 and the rest was left where it stood.",
    lesson:
      "The only hardware ever inspected after years on the Moon taught us how the Moon treats machines.",
    status: "intact",
    mark: "lander",
    status_note: "Remains on the surface minus the camera and soil scoop retrieved by Apollo 12.",
    location_note: "Oceanus Procellarum, about 180 metres from the Apollo 12 landing point.",
    certainty: "high",
    certainty_note: "Visited and photographed by astronauts; site precisely known.",
    era: "1960s",
    mission_code: "Surveyor 3 / Apollo 12",
    year: 1967,
    hero_image: MOON_HERO,
    hero_credit: MOON_HERO_CREDIT,
    categories: [CATS.HUMAN, CATS.LEGACY],
    reading_minutes: 4,
    narrative: [
      {
        h: "A landing with a bounce",
        p: [
          "Surveyor 3 set down on 20 April 1967 — and bounced. Its descent engines failed to shut off immediately on touchdown, so the craft lifted off twice more before settling on a slope inside a small crater. It still worked. Over the next weeks its soil scoop dug trenches, its camera photographed them, and engineers got the mechanical data Apollo needed.",
          "Then the lunar night came, the batteries died, and Surveyor 3 joined the silent population. It had been on the Moon for two and a half years when footsteps approached."
        ]
      },
      {
        h: "Apollo 12 comes calling",
        p: [
          "Pete Conrad and Alan Bean landed Intrepid scarcely 180 metres away on 19 November 1969 — a pinpoint landing deliberately targeted at the Surveyor site. On their second moonwalk they hiked to the old lander, photographed it, and, with some effort, cut away its television camera, retrieved soil-scoop parts, and bagged a piece of cable and strut.",
          "It remains the only time humans have visited a previously landed spacecraft on another world: a service call two years late, performed in spacesuits."
        ]
      },
      {
        h: "The microbe that may never have been there",
        p: [
          "Back on Earth, engineers found the bacterium Streptococcus mitis inside the returned camera. For years this was reported as a microbe that had survived nearly three years on the Moon — a sensational claim about life's hardiness.",
          "Later analysis made the likelier story contamination after return: the camera was handled without full sterile precautions, and the supposed lunar survivor was probably a laboratory hitchhiker. The honest version is better than the legend. Surveyor 3 taught planetary-protection science its most quoted cautionary tale: extraordinary claims need an unbroken chain of custody, and this one didn't have it."
        ]
      },
      {
        h: "What the hardware itself revealed",
        p: [
          "More valuable than the microbe story was the corrosion report. Surveyor's surfaces showed micrometeorite pitting, radiation darkening, and dust adhesion after 31 months of exposure. Engineers finally had ground truth on how the lunar environment ages materials — data still cited in designs for long-duration lunar equipment.",
          "The retrieved camera now sits in a museum. The rest of Surveyor 3 sits in its crater, photographed by astronauts and later by orbiters, missing exactly the pieces two men carried away."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Surveyor 3 is the only controlled experiment we have in lunar weathering of real spacecraft, and the only archaeological site on another world that humans have revisited. As Artemis plans long stays and permanent equipment, its pitted surfaces are required reading.",
          "It also marks a first that still stands: no other off-world hardware has ever received human visitors. When the next ones do, Conrad and Bean's walk to the old lander will be the precedent."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Apollo archive team", note: "Keeps the Apollo 12 surface transcripts and the retrieval inventory." },
      { role: "Materials scientist", name: "Lunar exposure research", note: "Cites the retrieved parts as the only long-exposure hardware study." },
      { role: "Heritage advocate", name: "Off-world heritage working group", note: "Treats the joint Surveyor–Apollo site as a protected landscape." }
    ],
    sources: [
      { kind: "Mission record", title: "Surveyor 3 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1967-035A" },
      { kind: "Mission record", title: "Apollo 12 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099A" },
      { kind: "Transcript archive", title: "Apollo Lunar Surface Journal: Apollo 12", reference: "NASA history office", nasaUrl: "https://www.nasa.gov/history/alsj/" }
    ],
    next_action: {
      action: "File the contamination-reanalysis alongside the microbe claim",
      why: "The legend still circulates. The record should carry the correction with equal weight."
    }
  },
  {
    world: "moon",
    name: "Apollo 11 descent stage",
    subtitle: "The lower half of Eagle, still on the Sea of Tranquility",
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
    hero_image: MOON_HERO,
    hero_credit: MOON_HERO_CREDIT,
    categories: [CATS.HUMAN, CATS.FIRST],
    reading_minutes: 3,
    narrative: [
      {
        h: "Half a spacecraft, on purpose",
        p: [
          "The lunar module was two spacecraft in one. The lower half — the descent stage, with the landing legs, the descent engine, and the tanks — existed to get the crew down. The upper half — the ascent stage, the cabin — existed to get them back up. Once Eagle sat on the Sea of Tranquility on 20 July 1969, the descent stage's job was over. It became a launch pad.",
          "When Armstrong and Aldrin lifted off the next day, the ascent engine fired from the descent stage's roof, and the lower half stayed exactly where it had landed. Abandonment wasn't an accident here. It was the design."
        ]
      },
      {
        h: "What it carried down",
        p: [
          "The descent stage brought everything the surface mission needed: the landing gear, water and oxygen tanks, the scientific packages the astronauts deployed, the camera that broadcast the first steps, and the laser retroreflector and seismometer left behind. Its engine bell, still pointing at the ground it blasted clean, is the centre of the most photographed patch of the Moon.",
          "It also carried the plaque: 'Here men from the planet Earth first set foot upon the Moon, July 1969 A.D. We came in peace for all mankind.'"
        ]
      },
      {
        h: "The hours it stood witness",
        p: [
          "For about 21 hours the descent stage was the only human shelter on another world — bedroom, porch, and radio shack at once. Armstrong and Aldrin rested inside the cramped cabin mounted on its back, ate, and prepared for the moonwalk. The television camera fixed to its leg showed some 600 million people the ladder, the footpad, and the first step.",
          "Then the crew climbed back in, depressurised and repressurised, jettisoned what they no longer needed — backpacks, overshoes, cameras — onto the surface around it, and left."
        ]
      },
      {
        h: "What remains",
        p: [
          "The descent stage still stands at Tranquility Base, surrounded by footprints, discarded equipment, the flag, the retroreflector, and the passive seismometer. Orbital images from the Lunar Reconnaissance Orbiter show the hardware, the astronaut tracks, and even the paths of the moonwalk, preserved in vacuum.",
          "Nothing up there decays except meaning. The footprints will outlast every building on Earth; whether anyone remembers why they matter is up to the record, not the regolith."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Tranquility Base is the most symbolically significant site humans have ever made off Earth, and the descent stage is its anchor. Any future lunar activity near it — and the site is scientifically interesting, not just historic — will need agreed boundaries and rules. Several heritage proposals name it first.",
          "This record treats it as what it is: not debris, but the foundation of the first off-world place."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Apollo archive team", note: "Maintains the primary record for the first landing." },
      { role: "Site planner", name: "Future surface activity planning", note: "Needs the site inventory before any nearby operations are proposed." },
      { role: "Heritage advocate", name: "Off-world heritage working group", note: "Treats this as the most symbolically significant off-world site." }
    ],
    sources: [
      { kind: "Mission record", title: "Apollo 11 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059A" },
      { kind: "Mission record", title: "Apollo 11 mission report", reference: "Public mission archive", nasaUrl: "https://science.nasa.gov/mission/apollo-11/" },
      { kind: "Transcript archive", title: "Apollo Lunar Surface Journal", reference: "NASA history office", nasaUrl: "https://www.nasa.gov/history/alsj/" },
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
    name: "Lunokhod 1",
    subtitle: "The Soviet rover that drove for ten months and was found again",
    summary:
      "The first remote-controlled rover on another world — lost for decades, then located from orbit.",
    what_is:
      "An eight-wheeled Soviet rover delivered by Luna 17, operated from Earth for 322 days.",
    why_abandoned:
      "It stopped responding in 1971 and sat unlocated for nearly forty years until LRO images found it.",
    lesson:
      "Robots can explore without astronauts — and even lost robots can be found again.",
    status: "intact",
    mark: "lander",
    status_note: "Located in LRO imagery in 2010; long silent but structurally intact as far as known.",
    location_note: "Mare Imbrium, the Luna 17 landing region.",
    certainty: "high",
    certainty_note: "Position confirmed by orbital imaging; laser ranging to its reflector succeeded.",
    era: "1970s",
    mission_code: "Luna 17 / Lunokhod 1",
    year: 1970,
    hero_image: MOON_HERO,
    hero_credit: MOON_HERO_CREDIT,
    categories: [CATS.ROBOT, CATS.LEGACY],
    reading_minutes: 4,
    narrative: [
      {
        h: "A car on the Moon, driven from Crimea",
        p: [
          "In November 1970, while Apollo crews were still flying, the Soviet Union landed a different kind of explorer: an eight-wheeled rover, driven by remote control from a control room in Crimea with a several-second signal delay. Lunokhod 1 — 'Moon-walker' — was the first rover on another world, decades before the word became familiar.",
          "It was the size of a bathtub, weighed 756 kilograms, carried four television cameras, a French-built laser reflector, soil testers, and an X-ray spectrometer. A hinged lid covered in solar cells opened each lunar morning to charge the batteries and closed each night to conserve heat from a small nuclear heater."
        ]
      },
      {
        h: "Ten months of driving",
        p: [
          "Lunokhod operated for eleven lunar days — about 322 Earth days — far beyond its planned three months. Its five-person driving crews, working in shifts, covered more than 10 kilometres across Mare Imbrium, sent back over 20,000 television images and hundreds of panoramas, and ran 25 soil analyses.",
          "The driving was painstaking: commands crossed the Earth–Moon distance, the rover executed, cameras sent back the result seconds later. Every metre was negotiated with delay. It worked."
        ]
      },
      {
        h: "Silence, then a decades-long disappearance",
        p: [
          "In September 1971 the signal stopped coming. Soviet announcements gave little detail, and for decades the rover's exact position was uncertain — coordinates from the 1970s were too coarse for anyone to point a camera at it with confidence.",
          "Then, in 2010, researchers studying Lunar Reconnaissance Orbiter images spotted the lander, the rover some distance from it, and the twin tracks winding across the plain. Lunar laser-ranging teams bounced a pulse off Lunokhod's reflector and got a return — the lost rover answered, in light, after 39 years."
        ]
      },
      {
        h: "What it left",
        p: [
          "Tracks: kilometres of them, preserved in vacuum, visible from orbit. A French laser reflector that still returns photons and still contributes to Earth–Moon distance measurements. And a precedent: every rover since — Sojourner, Spirit, Opportunity, Curiosity, Yutu, Perseverance — descends from the bathtub with eight wire wheels that drove out of its lander in 1970.",
          "The rover itself sits where it stopped, lid presumably closed against a night that never ended."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Lunokhod 1 proved teleoperated planetary exploration viable a generation before Mars rovers made it routine. Its recovered reflector quietly rejoined science after four silent decades — abandonment, it turns out, is sometimes reversible.",
          "It is also the strongest argument in this archive for looking: the Moon was photographed for years before anyone noticed the tracks. The record improves when somebody bothers to check."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Early lunar program records", note: "Documents Lunokhod as the first planetary rover programme." },
      { role: "Laser ranging scientist", name: "Lunar laser ranging network", note: "Ranges to the recovered reflector as part of Earth–Moon measurement." },
      { role: "Educator", name: "Planetary science outreach", note: "Uses Lunokhod to show rover history did not start at Mars." }
    ],
    sources: [
      { kind: "Mission record", title: "Luna 17 / Lunokhod 1 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1970-095A" },
      { kind: "Image archive", title: "Lunar Reconnaissance Orbiter views of early landing sites", reference: "LROC, Arizona State University", nasaUrl: "https://www.lroc.asu.edu/" }
    ],
    next_action: {
      action: "Log the laser-ranging recovery as part of this record",
      why: "A lost object that rejoined science is the archive's best story — and its proof of purpose."
    }
  },
  {
    world: "moon",
    name: "Apollo 15 and the Hadley rover",
    subtitle: "The first lunar road trip — science at driving speed",
    summary:
      "The first lunar rover mission: astronauts driving geology across Hadley Rille.",
    what_is:
      "Apollo 15's lunar roving vehicle and the ALSEP experiment station left at Hadley–Apennine.",
    why_abandoned:
      "The rover and instruments were left working or spent; the crew came home without them.",
    lesson:
      "Mobility turned moonwalks from visits into expeditions — and the vehicle stayed.",
    status: "intact",
    mark: "lander",
    status_note: "Rover and ALSEP hardware remain at the site; ALSEP long silent.",
    location_note: "Hadley–Apennine: the foot of the Apennine mountains beside Hadley Rille.",
    certainty: "high",
    certainty_note: "Crewed site, documented and later imaged from orbit.",
    era: "Apollo",
    mission_code: "Apollo 15",
    year: 1971,
    hero_image: MOON_HERO,
    hero_credit: MOON_HERO_CREDIT,
    categories: [CATS.HUMAN, CATS.LEGACY],
    reading_minutes: 4,
    narrative: [
      {
        h: "Apollo grows up",
        p: [
          "The first landings were camping trips next to the tent. Apollo 15, in July 1971, was the first expedition: a landing site chosen for geology rather than safety alone, a three-day stay, and a car. Commander David Scott and pilot James Irwin would drive further and see more in three days than all previous missions combined.",
          "Their destination, the Hadley–Apennine region, packed a mountain front, a winding canyon-like rille, and dark mare plains into one landing ellipse — a field geologist's wish list."
        ]
      },
      {
        h: "The rover",
        p: [
          "The lunar roving vehicle folded into a quadrant of the descent stage and unfolded like a deck chair. It ran on batteries, steered all four wire-mesh wheels, and carried television cameras, sample bags, and tools. On the airless Moon it could do about 13 kilometres per hour; Scott got it to roughly that on the run back from one station, with the fenders throwing rooster tails of grey dust.",
          "Over three drives the crew covered some 28 kilometres, set up sixteen geology stations, and brought home 77 kilograms of rock — including the Genesis Rock, an ancient piece of the lunar crust prized by scientists ever since."
        ]
      },
      {
        h: "Hadley Rille and the hammer-feather fall",
        p: [
          "At the rille's edge the astronauts looked across a gorge a kilometre wide and hundreds of metres deep, carved — most researchers conclude — by ancient flowing lava. The basalts they sampled there dated the mare volcanism and rewrote lunar thermal history.",
          "Before leaving, Scott performed the famous hammer-feather drop on live television: geology tools in one hand each, released together, striking the dust simultaneously. Galileo's law, demonstrated on another world with a falcon feather and a geology hammer."
        ]
      },
      {
        h: "What stayed",
        p: [
          "The rover, parked with its camera aimed at the ascent stage to broadcast the liftoff. The ALSEP experiment station — seismometer, magnetometer, heat-flow probes — which transmitted until 1977. A plaque, a small fallen-astronaut statuette left privately by the crew, and bootprints across three days of traverses.",
          "The rover's batteries died within days. The ALSEP central station fell silent when its power ran down. The site has been still ever since, photographed from orbit with the rover, the tracks, and the descent stage all visible."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Apollo 15's samples and heat-flow data still anchor models of the Moon's interior. Operationally, it proved that surface mobility multiplies science return — the direct ancestor of every long rover traverse since, robotic or crewed.",
          "The parked rover is the most evocative machine in this archive: a car with the keys left in, forty-plus years of dust on the seats, waiting at the edge of a canyon no river ever cut."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Apollo archive team", note: "Keeps the traverse maps and sample catalog." },
      { role: "Geologist", name: "Lunar sample science", note: "Works from the Hadley basalts and Genesis Rock to this day." },
      { role: "Site planner", name: "Future surface activity planning", note: "Studies the rover's condition as a decades-exposed hardware case." }
    ],
    sources: [
      { kind: "Mission record", title: "Apollo 15 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-063A" },
      { kind: "Transcript archive", title: "Apollo Lunar Surface Journal: Apollo 15", reference: "NASA history office", nasaUrl: "https://www.nasa.gov/history/alsj/" }
    ],
    next_action: {
      action: "Attach the traverse map to this record",
      why: "The rover's route is the story. A reader who can follow the drives understands the science."
    }
  },
  {
    world: "moon",
    name: "The lunar laser reflectors",
    subtitle: "Mirrors still answering, fifty years on",
    summary:
      "Small mirror arrays left by astronauts and robots that scientists still bounce lasers off today.",
    what_is:
      "Retroreflector arrays placed by Apollo 11, 14, and 15 and by the Lunokhod rovers; still ranged from Earth.",
    why_abandoned:
      "They need no power and no maintenance. Abandonment is their operating mode.",
    lesson:
      "The most scientifically productive things we left on the Moon are also the simplest.",
    status: "intact",
    mark: "lander",
    status_note: "All arrays believed in place; returns still measured, weakening with dust and age.",
    location_note: "Apollo 11, 14, 15 sites and the Luna 17 / Luna 21 rover sites.",
    certainty: "high",
    certainty_note: "Ranged routinely by observatories; positions known to centimetres.",
    era: "Apollo",
    mission_code: "Apollo / Luna",
    year: 1969,
    hero_image: MOON_HERO,
    hero_credit: MOON_HERO_CREDIT,
    categories: [CATS.LEGACY, CATS.FIRST],
    reading_minutes: 4,
    narrative: [
      {
        h: "Science that asks for nothing",
        p: [
          "A retroreflector is a panel of glass corner-cubes that returns any incoming light exactly the way it came. It needs no power, has no moving parts, and cannot break down in any way that matters. Aim a laser at it from Earth, catch the few photons that come back, time the round trip, and you know the Earth–Moon distance to within centimetres.",
          "Five such panels sit on the Moon. Three were carried by Apollo crews; two rode on Soviet Lunokhod rovers. All five are abandoned. All five still work."
        ]
      },
      {
        h: "Placed by hand — and by robot",
        p: [
          "Armstrong and Aldrin set the first array on the dust at Tranquility Base in 1969, levelling it by eye during the single moonwalk. Apollo 14 and 15 placed larger ones. The Soviet arrays went up with Lunokhod 1 in 1970 and Lunokhod 2 in 1973, bolted to the rovers themselves.",
          "Lunokhod 1's reflector was effectively lost with the rover for 39 years — until the 2010 recovery, when a ranging station in New Mexico got a return on the first try. The mirror had been waiting since 1971."
        ]
      },
      {
        h: "What fifty years of photons bought",
        p: [
          "Lunar laser ranging has measured the Moon drifting away from Earth at about 3.8 centimetres per year, tested Einstein's equivalence principle to exquisite precision, mapped the Moon's wobble and tidal flexing, and pinned down the lunar interior's properties.",
          "Few experiments in history have returned so much from so little: a few kilograms of glass, no electronics, no funding line for operations — just observatories on Earth and patience."
        ]
      },
      {
        h: "Fading, but not gone",
        p: [
          "The returns are weakening. Dust, micrometeorite abrasion, and thermal stress have dimmed the Apollo arrays to a fraction of their original efficiency; Lunokhod 2's runs hot in lunar daylight and answers best at night. Ranging stations compensate with stronger lasers and better detectors.",
          "Nobody can service them. The arrays will outlive the stations that range to them, most likely — glass on the Moon, waiting for better lasers."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "The reflectors are the purest case this archive makes: abandonment is not the same as uselessness. These are the only Apollo-era instruments still producing peer-reviewed science, and they do it without anyone touching them.",
          "When mission planners ask what to leave behind that the future can use, the answer is already sitting in five places on the Moon, catching photons."
        ]
      }
    ],
    stakeholders: [
      { role: "Laser ranging scientist", name: "Lunar laser ranging network", note: "Operates the stations that range to all five arrays." },
      { role: "Physicist", name: "Gravitational physics research", note: "Uses ranging data for tests of general relativity." },
      { role: "Heritage advocate", name: "Off-world heritage working group", note: "Notes that working science instruments deserve protection in place." }
    ],
    sources: [
      { kind: "Mission record", title: "Apollo 11 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-059A" },
      { kind: "Transcript archive", title: "Apollo Lunar Surface Journal", reference: "NASA history office", nasaUrl: "https://www.nasa.gov/history/alsj/" }
    ],
    next_action: {
      action: "Record each array's ranging status separately",
      why: "One record saying 'all working' hides that some fade faster. The dimming curve is itself data."
    }
  }
];

module.exports = { MOON_STORIES, MOON_HERO, MOON_HERO_CREDIT, CATS };
