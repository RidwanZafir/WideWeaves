/* Abandoned but Not Forgotten — Mars story library.
 *
 * Same contract as stories-moon.js: content separate from presentation.
 * Accuracy rules: no invented quotes or transmissions. The famous
 * "my battery is low" line about Opportunity is a journalist's paraphrase,
 * not rover telemetry — the text says so. Where boards found a probable
 * cause rather than a certain one, the text says that too.
 */

const MARS_HERO = "assets/nasa-PIA21131.jpg";
const MARS_HERO_CREDIT =
  "Martian surface context from the archive's vendored NASA collection: the Schiaparelli impact region imaged by the Mars Reconnaissance Orbiter (NASA/JPL/University of Arizona). Not the story's own hardware unless the caption says so.";

const CATS = {
  FIRST: "historic-first",
  ROBOT: "robotic-explorer",
  LOST: "lost-mission",
  LEGACY: "science-legacy",
  LESSON: "engineering-lesson"
};

const MARS_STORIES = [
  {
    world: "mars",
    name: "Mars 3",
    subtitle: "Fourteen seconds on the surface of Mars",
    timeline: [
      { d: "1971", t: "Launch; the cruise to Mars runs straight into a planet-wide dust storm" },
      { d: "2 Dec 1971", t: "Soft landing in the Ptolemaeus region; about fourteen seconds of signal" }
    ],
    summary:
      "The Soviet lander that touched down softly — and spoke for seconds.",
    what_is:
      "The Soviet Mars 3 lander, the first spacecraft to achieve a soft landing on Mars.",
    why_abandoned:
      "Its signal stopped seconds after landing, for reasons never established.",
    lesson:
      "Mars kept its first landed guest for less than half a minute — and kept the mystery ever since.",
    status: "lost",
    mark: "lander",
    status_note: "On the surface in Ptolemaeus Crater region; silent since 1971.",
    location_note: "Ptolemaeus Crater region, southern highlands.",
    certainty: "medium",
    certainty_note: "Landing confirmed by the brief signal; exact final state unknown.",
    era: "1970s",
    mission_code: "Mars 3",
    year: 1971,
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.FIRST, CATS.LOST],
    reading_minutes: 3,
    narrative: [
      {
        h: "Landing into a planet-wide storm",
        p: [
          "Mars 3 arrived at the worst possible moment. In late 1971 one of the largest dust storms ever observed wrapped the entire planet, hiding the surface from cameras and churning the thin atmosphere. The Soviet lander descended through that storm on 2 December 1971 anyway — there was no option to wait; orbital mechanics had set the date years earlier.",
          "Against every odd, it survived the descent: parachute, retrorockets, touchdown at walking speed. The Soviet Union had just achieved the first soft landing on Mars."
        ]
      },
      {
        h: "What fourteen seconds sounds like",
        p: [
          "The lander began transmitting a television panorama — and then stopped. The signal from the surface lasted about fourteen seconds before vanishing. The orbiter flying overhead recorded a fragment of video data so degraded that almost nothing can be read from it: a grey field with no discernible detail.",
          "Whether the lander died outright or merely lost its link is unknown. The orbiter kept listening. Mars 3 never spoke again."
        ]
      },
      {
        h: "Why it probably died",
        p: [
          "No board ever closed the case. The leading explanations all run through the dust storm: wind-blown dust may have shorted or corona-discharged across the lander's surfaces, or the storm may simply have overwhelmed a design already operating at the edge. Some engineers suspected the landing itself damaged the antenna.",
          "Honesty requires the phrase 'unknown.' Mars 3 is a record with a hole in it, and the hole is part of the story."
        ]
      },
      {
        h: "What remains",
        p: [
          "Somewhere in the Ptolemaeus region sits a 4.5-foot lander with its petals open, carrying a small walking rover — the Prop-M — that never got to crawl down its ramp on skis. Had the link survived, that tiny rover would have been the first wheeled vehicle on Mars, 26 years before Sojourner.",
          "In 2013, enthusiasts reported a possible lander, parachute, and heat shield in Mars Reconnaissance Orbiter images of the area, but the identification was never confirmed. The site is a candidate, not a certainty."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Mars 3 proved a survivable Mars landing was possible even through a global dust storm — the descent worked. Everything after touchdown is a lesson in margins: power, antennas, and dust tolerance, the same margins every later lander budget guards.",
          "It is also the loneliest object in this archive: the first machine to rest intact on Mars, unheard for more than fifty years."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Early Mars program records", note: "Keeps Mars 3 as the first-landing milestone with its open questions intact." },
      { role: "Engineer", name: "Entry, descent and landing research", note: "Studies the storm landing as a descent success and a surface-link failure." }
    ],
    sources: [
      { kind: "Mission record", title: "Mars 3 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-049A" },
      { kind: "Video", title: "MARS 2 & 3 — Lander and Rover models", reference: "Retro Space HD · independent space-history channel", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=SCqiG3xciC4", nasaCaption: "The Mars 2 and 3 landers and the Prop-M rover, from a third-party space-history channel — not an agency source." }
    ],
    next_action: {
      action: "Keep the landing-site candidacy marked as unconfirmed",
      why: "A hopeful identification is not a location. The record must not upgrade it by repetition."
    }
  },
  {
    world: "mars",
    name: "Mars Pathfinder and Sojourner",
    subtitle: "Airbags, a backyard rover, and a new way to explore",
    timeline: [
      { d: "4 Jul 1997", t: "Airbag landing bounces to rest in Ares Vallis; petals open" },
      { d: "Jul 1997", t: "Sojourner rolls out; first rock chemistry from the Martian surface" },
      { d: "27 Sep 1997", t: "Signal stops mid-communication; both machines stay where they worked" }
    ],
    summary:
      "The bouncing landing that delivered the first rover to Mars.",
    what_is:
      "NASA's 1997 lander and its 11-kilogram rover, the first wheeled vehicle driven on Mars.",
    why_abandoned:
      "Contact was lost after three months; both craft remain where they worked.",
    lesson:
      "Cheap, bold, and fast can work: Pathfinder rewrote how missions are built.",
    status: "intact",
    mark: "lander",
    status_note: "Lander (Sagan Memorial Station) and rover remain at the site; silent since 1997.",
    location_note: "Ares Vallis, an ancient flood channel.",
    certainty: "high",
    certainty_note: "Tracked landing site, photographed from orbit.",
    era: "1990s",
    mission_code: "Pathfinder",
    year: 1997,
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.FIRST, CATS.ROBOT],
    reading_minutes: 4,
    narrative: [
      {
        h: "Faster, better, cheaper — and bouncing",
        p: [
          "By the 1990s Mars had defeated almost everything sent at it. NASA's answer was a Discovery-class mission built fast and cheap: instead of expensive retrorockets, Pathfinder would fall into the atmosphere, brake with a parachute, and then inflate giant airbags and simply bounce — landing like a beach ball thrown at the planet.",
          "Engineers who proposed it were told it was reckless. On 4 July 1997, the beach ball bounced about sixteen times across Ares Vallis and came to rest. The petals opened. It worked."
        ]
      },
      {
        h: "Sojourner rolls out",
        p: [
          "The lander carried a passenger the size of a microwave oven: Sojourner, an 11-kilogram six-wheeled rover named for abolitionist Sojourner Truth. Driving it meant coping with an eleven-minute signal delay — operators sent a day's commands, the rover executed them, and everyone found out the next morning what had happened.",
          "Sojourner was a technology demonstration with a spectrometer. It crawled to rocks with cartoon names — Barnacle Bill, Yogi, Scooby Doo — and pressed its alpha-proton X-ray instrument against them, proving the rocks were volcanic basalts, some surprisingly rich in silica."
        ]
      },
      {
        h: "Three months of abundance",
        p: [
          "The lander, renamed the Carl Sagan Memorial Station, photographed panoramas, tracked windsocks and dust, and relayed rover data. The mission was planned for a month; it ran for nearly three, returning thousands of images and the first in-situ rock chemistry from Mars.",
          "The public watched in unprecedented numbers — the mission website's tens of millions of hits briefly made it one of the most visited sites on the early internet. Mars exploration became something people followed daily."
        ]
      },
      {
        h: "Silence in September",
        p: [
          "On 27 September 1997, after 83 sols of rover operations, the signal stopped mid-communication. Engineers suspect the lander's batteries finally failed — without enough charge, the electronics froze during the cold Martian night and never woke. Attempts to re-establish contact continued into 1998 and failed.",
          "Both machines sit where they stopped: the pyramid-shaped lander with open petals, the little rover parked against a rock it was studying."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Pathfinder proved three things that shaped the next thirty years: airbag landings work, rovers can be operated across interplanetary delay, and a focused small mission can return flagship-grade attention and science. The Mars Exploration Rovers were its direct children — Spirit and Opportunity inherited its operations playbook outright.",
          "Sojourner's tracks, a few dozen metres of them, are the shortest rover traverse in history and one of the most consequential."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Mars program records group", note: "Keeps Pathfinder as the mission that restarted American Mars exploration." },
      { role: "Rover engineer", name: "Surface mobility research", note: "Traces remote-driving practice to Sojourner's operations." },
      { role: "Educator", name: "Planetary science outreach", note: "Uses the rock names and daily updates as the template for public mission storytelling." }
    ],
    sources: [
      { kind: "Mission record", title: "Mars Pathfinder NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-068A" },
      { kind: "Mission archive", title: "Mars Pathfinder mission page", reference: "NASA/JPL", nasaUrl: "https://science.nasa.gov/mission/mars-pathfinder/" },
      { kind: "Video", title: "NASA's Mars Pathfinder & Sojourner Rover (360 View)", reference: "NASA Jet Propulsion Laboratory · official channel", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=9HGRReKUzfU", nasaCaption: "A 360-degree panorama of the landing site with Sojourner among the rocks." }
    ],
    next_action: {
      action: "Link the Sojourner driving logs to this record",
      why: "The command-delay operations were the real experiment. The logs are the evidence."
    }
  },
  {
    world: "mars",
    name: "Mars Global Surveyor",
    subtitle: "The mapper that redrew Mars, then went quiet",
    timeline: [
      { d: "Nov 1996", t: "Launch; a damaged solar panel forces a year-long improvised aerobraking" },
      { d: "1997", t: "Mapping orbit reached; laser altimeter and camera begin the nine-year survey" },
      { d: "2 Nov 2006", t: "Contact lost after commanding leaves it power-starved; orbit decays still" }
    ],
    summary:
      "The orbiter that mapped Mars in detail for a decade — then fell silent.",
    what_is:
      "NASA's long-lived Mars orbiter: camera, laser altimeter, magnetometer, and relay.",
    why_abandoned:
      "Contact was lost in 2006 after commanding left it power-starved; it orbits still.",
    lesson:
      "A mission can end not with a bang but with a battery — and keep giving through its maps.",
    status: "intact",
    mark: "cluster",
    status_note: "Believed in Mars orbit, slowly decaying; silent since 2006.",
    location_note: "Mars orbit (not on the surface).",
    certainty: "medium",
    certainty_note: "Loss reconstructed from records; the spacecraft itself was never imaged.",
    era: "1990s",
    mission_code: "MGS",
    year: 1996,
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.LEGACY, CATS.LESSON],
    reading_minutes: 4,
    narrative: [
      {
        h: "The mission that came back from the dead",
        p: [
          "Mars Global Surveyor nearly died before it began. Launched in November 1996, it arrived at Mars to find one of its solar panels damaged — a stuck damper arm that threatened to snap the panel during aerobraking. Controllers spent months improvising a gentler braking campaign, dipping through the atmosphere hundreds of times, and coaxed the spacecraft into its mapping orbit more than a year late.",
          "What followed was one of the most productive missions in planetary science: nine years of systematic mapping."
        ]
      },
      {
        h: "A new Mars, measured",
        p: [
          "MGS carried the Mars Orbiter Laser Altimeter, which fired millions of laser pulses at the surface and built the first precise global topographic map — the elevation model every later mission landed with. Its camera returned hundreds of thousands of images, including the famous face-on-Mars debunking photo, possible gully flows, and the landing sites of later missions.",
          "Its magnetometer found stripes of magnetised crust in the southern highlands — the ghost of an ancient global magnetic field, and evidence that early Mars was a very different, possibly wetter and warmer world."
        ]
      },
      {
        h: "The quiet end",
        p: [
          "On 2 November 2006, controllers lost contact two days after commanding a solar-array positioning move. The onboard fault protection did what it was designed to do, but the spacecraft's batteries were already depleted, and without power it could neither phone home nor recover. The investigation concluded that a command sequence had exposed the spacecraft to conditions its power system couldn't survive — an operational error, not a hardware death of old age.",
          "It was the longest-operating Mars spacecraft of its time: nearly ten years at Mars."
        ]
      },
      {
        h: "An orbiter's afterlife",
        p: [
          "Unlike the landers in this archive, Surveyor was never on the surface. It is presumably still circling Mars, dead, its orbit decaying slowly toward an eventual atmospheric entry decades hence. Nothing marks its position; no camera has ever spotted it.",
          "But its afterlife is enormous: the MOLA elevation maps, the magnetic stripes, the image archive. Spirit, Opportunity, Phoenix, and Curiosity all landed using Surveyor's Mars."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Surveyor is this archive's only orbital resident, kept because the definition of 'abandoned hardware' should include the machines overhead. Its end is the cautionary tale every operations team studies: spacecraft die from commanding as surely as from components.",
          "And its maps remain the ground every Mars story in this collection stands on — including the landing ellipses of rovers that outlived it."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Mars program records group", note: "Holds Surveyor as the mapping mission all later landings depend on." },
      { role: "Cartographer", name: "Planetary mapping research", note: "Maintains the MOLA elevation model as the base map of Mars." },
      { role: "Operations engineer", name: "Mission operations review", note: "Teaches the 2006 loss as a commanding-discipline case." }
    ],
    sources: [
      { kind: "Mission record", title: "Mars Global Surveyor NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1996-062A" },
      { kind: "Mission archive", title: "Mars Global Surveyor mission page", reference: "NASA/JPL", nasaUrl: "https://science.nasa.gov/mission/mars-global-surveyor/" },
      { kind: "Screening room", title: "Mars Discoveries — MOC gullies and new craters (JPL video page)", reference: "NASA Jet Propulsion Laboratory · official video page", nasaUrl: "https://www.jpl.nasa.gov/videos/mars-discoveries/", nasaCaption: "JPL's film on the gully and new-crater discoveries from Surveyor's camera. No independently verifiable YouTube copy could be confirmed, so the archive links the official page instead of embedding a guess." }
    ],
    next_action: {
      action: "Attach the loss investigation summary to this record",
      why: "An operational ending needs its report beside it, or the lesson fades into rumor."
    }
  },
  {
    world: "mars",
    name: "Mars Polar Lander",
    subtitle: "The silent south pole",
    timeline: [
      { d: "1999", t: "Launch toward the southern polar layered terrain, penetrators riding along" },
      { d: "3 Dec 1999", t: "Entry over the pole; the expected confirmation never comes" },
      { d: "1999–2000", t: "Searches find nothing; the review board reports the leading hypothesis" }
    ],
    summary:
      "The lander that reached the Martian south pole — and never phoned home.",
    what_is:
      "NASA's 1999 polar lander, built to dig for water ice near the southern cap.",
    why_abandoned:
      "Lost during landing in December 1999; the leading explanation is a premature engine shutdown.",
    lesson:
      "A single sensor reading, trusted at the wrong moment, can end a mission.",
    status: "lost",
    mark: "lander",
    status_note: "Presumed wreckage near the south polar layered terrain; never located.",
    location_note: "Ultimi Scopuli region, near the south polar cap.",
    certainty: "low",
    certainty_note: "No signal was ever received after entry; the failure is reconstructed, not observed.",
    era: "1990s",
    mission_code: "MPL",
    year: 1999,
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.LOST, CATS.LESSON],
    reading_minutes: 3,
    narrative: [
      {
        h: "A lander aimed at the pole",
        p: [
          "Mars Polar Lander was NASA's second attempt at the low-cost Mars playbook that Pathfinder had proven: a fixed lander, built fast, sent to dig. Its target was the edge of the southern polar layered terrain — ancient stacked ice and dust that held the climate history of Mars. A robotic arm would dig trenches, a camera would watch, and two Deep Space 2 penetrators would slam into the soil nearby and report from underground.",
          "It reached Mars on 3 December 1999. Nothing was ever heard from it again."
        ]
      },
      {
        h: "Twelve minutes of silence",
        p: [
          "Entry, descent, and landing at Mars takes about twelve minutes, during which the spacecraft is on its own — signals take eleven minutes to reach Earth, so controllers always watch history, never live events. Polar Lander entered as planned. The expected confirmation never came.",
          "Listening campaigns ran for weeks: the orbiter overhead, radio telescopes on Earth. The penetrators, meant to phone home independently, were silent too. Three spacecraft lost in one morning."
        ]
      },
      {
        h: "The likeliest failure",
        p: [
          "The failure review board's leading hypothesis is painfully specific: when the landing legs deployed during descent, a jolt triggered the touchdown sensors — which were designed to shut the engines off on contact. The software, trusting the sensors, most likely cut the descent engines while the lander was still tens of metres in the air. It fell the rest of the way.",
          "This was never proven; without telemetry it cannot be. But the board found the scenario reproducible in testing, and later missions changed their touchdown logic because of it. Phoenix, the lander's rebuilt successor, carried explicit safeguards against exactly this failure."
        ]
      },
      {
        h: "Never found",
        p: [
          "Searches of the landing ellipse in orbiter images never identified the wreckage with confidence — the polar terrain is bright, rough, and seasonally frosted, and a small crumpled lander hides well in it. The Deep Space 2 penetrators, the size of grapefruits, were never seen either.",
          "It is the only record in this archive whose hardware has never been imaged at all. The location here is the target, not a confirmed grave."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Polar Lander's loss, weeks after the Mars Climate Orbiter burned up from the infamous metric-imperial unit mismatch, forced NASA to rebuild its Mars programme around testing discipline and independent review. Out of that wreckage came the successful 2000s: Spirit, Opportunity, and Phoenix — the last literally rebuilt from Polar Lander's spare hardware.",
          "Its lesson is the archive's shortest and sternest: trust, but verify — especially a sensor telling you that you have landed."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "Mars program records group", note: "Keeps the loss as the case that reformed Mars mission oversight." },
      { role: "Engineer", name: "Entry, descent and landing research", note: "Cites the touchdown-sensor hypothesis in every landing design review." }
    ],
    sources: [
      { kind: "Mission record", title: "Mars Polar Lander NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1999-001A" },
      { kind: "Mission archive", title: "Mars Polar Lander mission page", reference: "NASA/JPL", nasaUrl: "https://science.nasa.gov/mission/mars-polar-lander/" },
      { kind: "Video", title: "JPL and the Space Age: The Breaking Point", reference: "NASA Jet Propulsion Laboratory · official channel", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=kuYDkVRyMkg", nasaCaption: "Feature-length JPL documentary on the loss of Mars Polar Lander (and Mars Climate Orbiter) and the end of Faster, Better, Cheaper." }
    ],
    next_action: {
      action: "Keep the failure cause labelled as leading hypothesis, not fact",
      why: "Upgrading a probable cause into a certain one would repeat the original sin: trusting a reading too far."
    }
  },
  {
    world: "mars",
    name: "Beagle 2",
    subtitle: "Found after eleven years: the watch that almost ticked",
    timeline: [
      { d: "Dec 2003", t: "Release from Mars Express; a silent Christmas Day on Isidis Planitia" },
      { d: "Jan 2015", t: "Identified in orbiter images, partially deployed, parachute nearby" },
      { d: "2015", t: "Diagnosis: unopened panels covered the antenna; millimetres from success" }
    ],
    summary:
      "The British lander lost on arrival in 2003 — found intact from orbit in 2015.",
    what_is:
      "A small British-built Mars lander that rode to Mars with ESA's Mars Express.",
    why_abandoned:
      "It landed but never called home; orbital images later showed it with unopened panels.",
    lesson:
      "Failure can be a millimetre wide: one undeployed panel silenced a whole mission.",
    status: "intact",
    mark: "lander",
    status_note: "Imaged from orbit in 2015; panels partly undeployed, silent.",
    location_note: "Isidis Planitia, the planned landing ellipse.",
    certainty: "high",
    certainty_note: "Identified in HiRISE imagery with parachute and hardware nearby.",
    era: "2000s",
    mission_code: "Beagle 2 / Mars Express",
    year: 2003,
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.LOST, CATS.LESSON],
    reading_minutes: 4,
    narrative: [
      {
        h: "A pocket-watch spacecraft",
        p: [
          "Beagle 2 was small, British, and beloved: a 33-kilogram lander shaped like a pocket watch, designed to open like one — four solar-panel petals unfolding to expose the instruments inside. Named for the ship that carried Darwin, built on a shoestring by a team led by Colin Pillinger, it hitched a ride to Mars aboard the European Space Agency's Mars Express orbiter.",
          "Its job: land in Isidis Planitia on Christmas Day 2003, deploy, and hunt for signs of past or present life — including the famous 'mole' sampler and a mass spectrometer to sniff rock for the chemistry of biology."
        ]
      },
      {
        h: "Christmas silence",
        p: [
          "The landing itself used airbags, like Pathfinder's. But 25 December 2003 came and went with no signal — not directly, not via Mars Express overhead, not via NASA's Odyssey orbiter listening in. Weeks of attempts failed. In February 2004 the mission was declared lost.",
          "For eleven years the assumption was a crash: Beagle 2 joined the long list of Mars wreckage, another victim of entry, descent, and landing."
        ]
      },
      {
        h: "Found, nearly whole",
        p: [
          "In January 2015, researchers examining High Resolution Imaging Science Experiment (HiRISE) images found it: the lander sitting in Isidis Planitia, with its parachute and heat shield nearby — and crucially, with only two or three of its four petals open. Beagle 2 had landed. It had nearly worked.",
          "The diagnosis wrote itself: with petals unopened, the radio antenna — mounted beneath them — stayed covered. The lander may have woken, tried to transmit, and shouted into its own solar panels. A partial deployment, millimetres from success, silenced everything."
        ]
      },
      {
        h: "What it still holds",
        p: [
          "Beagle 2 sits where it has sat since 2003, panels frozen mid-bloom. Its instruments never ran. But the recovery changed the story from 'crashed on arrival' to 'landed and nearly phoned home' — which is why this record's status is intact, not wreckage, and why the lesson is about margins rather than descent.",
          "The team never got their data. They got something rarer: an answer, eleven years late, photographed from 300 kilometres up."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Beagle 2 is the closest Mars has ever come to a successful failure — proof that small, cheap landers can survive arrival, and a warning that deployment mechanisms need redundancy and telemetry. Every later small-lander design carries its lesson in the margins.",
          "It is also the archive's best argument for re-examining old data with new eyes. The images that found Beagle 2 had existed for years before anyone looked at them properly."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission scientist", name: "Beagle 2 science team", note: "Led the life-detection payload and the long search for the lander." },
      { role: "Orbiter team", name: "Mars Express operations (ESA)", note: "Delivered Beagle 2 and later helped confirm the site." },
      { role: "Imaging scientist", name: "HiRISE operations", note: "Located the lander in orbital imagery in 2015." }
    ],
    sources: [
      { kind: "Mission record", title: "Beagle 2 NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-022C" },
      { kind: "Mission archive", title: "Mars Express mission page", reference: "European Space Agency", nasaUrl: "https://www.esa.int/Science_Exploration/Space_Science/Mars_Express" },
      { kind: "Video", title: "Professor Mark Sims on finding Beagle 2 (University of Leicester interview)", reference: "University of Leicester · university channel", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=iAKAJR4N6zQ", nasaCaption: "Beagle 2's mission manager on the search and the 2015 recovery in orbiter images. Title as described in the University's release." }
    ],
    next_action: {
      action: "Note the panel count as the mission's key evidence",
      why: "Three open petals versus four is the whole story. The record should lead with it."
    }
  },
  {
    world: "mars",
    name: "Spirit",
    subtitle: "The rover that became a lander, then a memory",
    timeline: [
      { d: "4 Jan 2004", t: "Landing in Gusev Crater for a 90-day mission" },
      { d: "2004–09", t: "Columbia Hills, silica deposits, Home Plate carbonates" },
      { d: "May 2009", t: "Breakthrough into soft sulfate sand at Troy; extraction fails" },
      { d: "22 Mar 2010", t: "Last contact before the deep winter" }
    ],
    summary:
      "The rover that climbed hills, survived dust, and finally sank in soft soil.",
    what_is:
      "NASA's Mars Exploration Rover A: a 185-kilogram six-wheeled geologist built for 90 days.",
    why_abandoned:
      "Trapped in soft soil in 2009, unable to survive winter; last contact March 2010.",
    lesson:
      "Exploration ends where the ground stops holding you — Spirit taught rovers to read soil.",
    status: "intact",
    mark: "lander",
    status_note: "Stuck at Troy near Home Plate; silent since 2010.",
    location_note: "Gusev Crater: the Columbia Hills and Home Plate.",
    certainty: "high",
    certainty_note: "Tracked position, photographed from orbit and by itself.",
    era: "2000s",
    mission_code: "MER-A",
    year: 2004,
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.ROBOT, CATS.LEGACY],
    reading_minutes: 4,
    narrative: [
      {
        h: "Ninety days, six years",
        p: [
          "Spirit landed in Gusev Crater on 4 January 2004, three weeks before its twin Opportunity, with a warranty of 90 Martian days. It worked for more than six years — over 2,600 sols — climbing into the Columbia Hills, surviving dust-choked winters by parking on sun-facing slopes, and driving nearly eight kilometres on wheels designed for a fraction of that.",
          "The twin-rover mission was NASA's answer to the 1999 failures: redundant spacecraft, proven airbag landings, and operations teams ready to improvise."
        ]
      },
      {
        h: "What it found",
        p: [
          "Gusev looked like an old lakebed from orbit; on the ground it was basaltic plains. Spirit drove to the hills and found the payoff: layered rocks, hematite, goethite, and — most exciting — nearly pure silica in soil its dragging wheel had churned up. Silica in that form on Earth is made by hot springs or fumaroles: water, heat, energy. The kind of place life likes.",
          "Later, at a low plateau called Home Plate, Spirit found carbonate rocks — more water chemistry. Gusev had been wet, more than once, in more than one way."
        ]
      },
      {
        h: "The trap",
        p: [
          "In May 2009, driving around Home Plate, Spirit broke through a crust into soft, sulfate-rich sand. Its wheels — already weakened, with one dead since 2006 — spun without purchase. Months of extraction attempts followed: engineers in California re-enacted the trap in a sandbox with a test rover, trying every combination of wheel turns. The rover shifted centimetres. Mars kept it.",
          "With winter coming and the solar panels dust-covered and tilted away from the sun, the team reclassified Spirit as a stationary science platform. It kept measuring — soil, atmosphere, wobble — from exactly one spot."
        ]
      },
      {
        h: "The last winter",
        p: [
          "The winter of 2009–2010 was too deep. Without enough power to run its heaters, Spirit likely froze through cold it was never built to survive unpowered. The last communication came on 22 March 2010. More than a thousand further attempts heard nothing. In May 2011, NASA ended the mission.",
          "It sits at a place the team named Troy, tilted, dust-covered, one wheel dug in — a lander again, as it began."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Spirit proved watery, habitable-environment history in Gusev's hills and wrote the handbook on rover longevity: dust management, winter parking, driving with broken wheels. Every later rover's operations carry its scars — including the care with which Curiosity and Perseverance read soil before committing.",
          "Its trap is the most instructive square metre of Mars ever studied. Exploration, Spirit showed, ends not at a border but at a soil type."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission scientist", name: "Mars Exploration Rover science team", note: "Operated Spirit through six years and the Troy extraction campaign." },
      { role: "Rover engineer", name: "Surface mobility research", note: "Uses the Troy trap as the reference case for soil-risk driving." },
      { role: "Educator", name: "Planetary science outreach", note: "Tells Spirit's longevity as the benchmark rover story." }
    ],
    sources: [
      { kind: "Mission record", title: "Spirit (MER-A) NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-027A" },
      { kind: "Mission archive", title: "Mars Exploration Rovers mission page", reference: "NASA/JPL", nasaUrl: "https://mars.nasa.gov/mer/" },
      { kind: "Video", title: "The Curious Life of a Mars Rover", reference: "National Geographic · Nat Geo Live", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=7zpojhD4hpI", nasaCaption: "A National Geographic talk on the Mars Exploration Rovers — how Spirit and Opportunity worked and what they found." }
    ],
    next_action: {
      action: "Attach the Troy soil analysis to this record",
      why: "The trap's chemistry is the scientific dividend of the loss. Keep them together."
    }
  },
  {
    world: "mars",
    name: "Opportunity",
    subtitle: "Five thousand sols: the rover that refused to die — until the sky did",
    timeline: [
      { d: "25 Jan 2004", t: "Bounce into Eagle Crater; bedrock and hematite within weeks" },
      { d: "2004–18", t: "The long traverse: Endurance, Victoria, Endeavour — over 45 kilometres" },
      { d: "Jun 2018", t: "Planet-wide dust storm; skies go dark at noon, then silence" },
      { d: "13 Feb 2019", t: "Mission declared complete after a thousand unanswered calls" }
    ],
    summary:
      "The rover built for 90 days that explored for nearly 15 years.",
    what_is:
      "NASA's Mars Exploration Rover B: Spirit's twin, landed at Meridiani Planum.",
    why_abandoned:
      "A planet-wide dust storm in 2018 starved it of sunlight; over a thousand recovery commands went unanswered.",
    lesson:
      "Endurance is a design feature — and even endurance has a sky.",
    status: "intact",
    mark: "lander",
    status_note: "At Perseverance Valley, Endeavour Crater rim; silent since June 2018.",
    location_note: "Meridiani Planum to Endeavour Crater: a 45-kilometre traverse.",
    certainty: "high",
    certainty_note: "Tracked traverse, final position known.",
    era: "2000s",
    mission_code: "MER-B",
    year: 2004,
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.ROBOT, CATS.LEGACY],
    reading_minutes: 4,
    narrative: [
      {
        h: "A hole-in-one into deep time",
        p: [
          "Opportunity landed on 25 January 2004 and effectively scored a hole-in-one: its airbags bounced it into Eagle Crater, a small pit whose walls exposed bedrock — the first bedrock ever seen on Mars. Within weeks the rover's spectrometers found what the mission had crossed the solar system to find: hematite concretions ('blueberries') and sulfate salts, the chemistry of rock soaked in ancient standing water.",
          "Ninety sols were planned. Opportunity worked for 5,352."
        ]
      },
      {
        h: "The long traverse",
        p: [
          "What followed was the greatest road trip in exploration history: out of Eagle Crater to Endurance, across the plains to Victoria — where the rover spent two years circling and entering the crater — then a three-year trek to Endeavour, a 22-kilometre crater with clay minerals older than anything yet sampled. Total odometry: over 45 kilometres, a Martian and off-world driving record.",
          "Along the way it survived dust-choked winters, a stuck heater, a failing shoulder joint investigators worked around for years, and flash memory failures that forced a complete reliance on daily downlinks."
        ]
      },
      {
        h: "The storm",
        p: [
          "In June 2018 a dust storm grew to encircle the planet. At Perseverance Valley on Endeavour's rim, Opportunity's skies went dark at noon; solar power fell to nothing. The rover entered a low-power fault mode and went silent on 10 June. Its final telemetry showed a dark sky and a draining battery.",
          "A note on the famous last words: 'My battery is low and it's getting dark' is a journalist's poetic paraphrase of that telemetry, not a transmission the rover sent. The rover sent numbers. A human being translated them into a sentence the whole world understood — which is itself worth remembering about how these stories travel."
        ]
      },
      {
        h: "A thousand unanswered calls",
        p: [
          "When the skies cleared, engineers spent eight months trying to wake it: over a thousand commands, listening on every frequency, sweeping for a fault-mode beep. Nothing answered. On 13 February 2019, NASA declared the mission complete — nearly fifteen years after landing, fifty-nine times its design life.",
          "Opportunity sits on the valley slope, panels dust-covered, arm extended toward a rock it was studying. The last panorama it sent is one of the great landscapes of exploration."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Opportunity proved ancient Mars had persistent, habitable surface water — not brief floods but long-lived chemistry — across multiple epochs and sites. Operationally it set the standard every rover mission is still measured against: graceful degradation, winter survival, driving broken hardware for years.",
          "It also taught the programme its hardest lesson about the sky: solar power on Mars is weather. Every power budget since carries the June 2018 storm in it."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission scientist", name: "Mars Exploration Rover science team", note: "Operated Opportunity across 45 kilometres and fifteen years." },
      { role: "Geologist", name: "Aqueous Mars research", note: "Works from the Meridiani sulfates and Endeavour clays." },
      { role: "Power engineer", name: "Surface power systems", note: "Sizes solar margins against the 2018 storm record." }
    ],
    sources: [
      { kind: "Mission record", title: "Opportunity (MER-B) NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2003-032A" },
      { kind: "Mission archive", title: "Mars Exploration Rovers mission page", reference: "NASA/JPL", nasaUrl: "https://mars.nasa.gov/mer/" },
      { kind: "Video", title: "Opportunity: NASA Rover Completes Mars Mission", reference: "NASA Jet Propulsion Laboratory · official channel", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=1Ll-VHYxWXU", nasaCaption: "JPL's farewell retrospective: fifteen years, proof of ancient liquid water, and the off-world driving record." }
    ],
    next_action: {
      action: "File the storm tau record with the final telemetry note",
      why: "The darkness measurement is the mission's last datum. It deserves a place, not just a paraphrase."
    }
  },
  {
    world: "mars",
    name: "Phoenix",
    subtitle: "Touching ice at the top of the world",
    timeline: [
      { d: "25 May 2008", t: "Retrorocket landing at Vastitas Borealis; bright soil already showing" },
      { d: "2008", t: "Trench-and-wait test confirms water ice; ovens, clays, perchlorates" },
      { d: "Nov 2008", t: "Light fades and cold ends it; orbiters later see the broken panels" }
    ],
    summary:
      "The polar lander that confirmed water ice in Martian soil.",
    what_is:
      "NASA's 2008 arctic lander: arm, ovens, and microscopes at Vastitas Borealis.",
    why_abandoned:
      "The polar winter darkened and froze it; orbiters later saw its broken panels.",
    lesson:
      "Mars has accessible water ice — Phoenix touched it with a scoop.",
    status: "wreckage",
    mark: "lander",
    status_note: "Panels broken by winter ice load, imaged from orbit; silent since 2008.",
    location_note: "Vastitas Borealis, near the Martian north pole.",
    certainty: "high",
    certainty_note: "Tracked site; post-winter orbiter imagery shows the damage.",
    era: "2000s",
    mission_code: "Phoenix",
    year: 2008,
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.ROBOT, CATS.LEGACY],
    reading_minutes: 4,
    narrative: [
      {
        h: "Rebuilt from a failure",
        p: [
          "Phoenix was resurrection hardware: much of it inherited from the cancelled 2001 Surveyor lander and from Mars Polar Lander's spares, rebuilt with the touchdown-sensor safeguards Polar Lander's loss had demanded. Its destination was the Martian arctic — the smooth plains of Vastitas Borealis, where orbiters had seen hydrogen suggesting ice just under the soil.",
          "On 25 May 2008 it landed with retrorockets — no airbags could work at those latitudes' thin margins — and sent back a picture of its own footpad with bright material exposed beneath: already, possibly, ice."
        ]
      },
      {
        h: "Digging to the ice",
        p: [
          "The two-metre robotic arm scraped and dug trenches with fairy-tale names — Dodo, Goldilocks, Snow White — and hit a hard, bright layer centimetres down. The decisive test was beautifully simple: the team photographed bright clods in a trench, waited, and photographed again. Four sols later the clods were gone. They had sublimated. Only water ice behaves that way.",
          "Delivered to the onboard ovens, the soil released water vapour on heating — direct confirmation. The microscopes found clays and carbonates. A Canadian weather station recorded snow falling from clouds above the site."
        ]
      },
      {
        h: "Perchlorates and the plot twist",
        p: [
          "The chemistry analyser also found perchlorates — chlorine salts that lower water's freezing point and can serve as energy for some microbes, but that are also harsh oxidants. The discovery complicated the habitability story in the best way: the arctic soil was neither dead-simple nor Earth-like, but a real alien chemistry with real implications for future explorers (perchlorates are also a health hazard for astronauts).",
          "Phoenix's soil results are still the ground truth for everything said about Martian arctic chemistry."
        ]
      },
      {
        h: "The winter it was built to miss",
        p: [
          "Phoenix was a solar-powered summer mission; nobody pretended it would survive the polar night. It worked 155 sols — nearly twice its planned 90 — until November 2008, when fading light and cold ended communications with a final 'triumph' message from the team. Later, the Mars Reconnaissance Orbiter photographed the site: the lander's solar panels, cracked and bowed under winter ice load.",
          "There was never a spring wake-up. The wreckage is documented, which is why this record says wreckage and not intact."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Phoenix proved accessible water ice — the resource every human-Mars plan depends on — and characterised it. Its trench-and-wait sublimation test is one of the elegant experiments in planetary science: no complex instrument, just patience and a camera.",
          "Built from failure's spares, killed by a winter it was never meant to meet, photographed in ruin from above: Phoenix is the complete arc of exploration in one mission."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission scientist", name: "Phoenix science team", note: "Operated the arm, ovens, and the sublimation campaign." },
      { role: "Resource scientist", name: "In-situ resource research", note: "Cites the ice confirmation as the basis for polar resource planning." },
      { role: "Engineer", name: "Power and survival design", note: "Uses the winter loss as the honest bound of solar-powered polar missions." }
    ],
    sources: [
      { kind: "Mission record", title: "Phoenix NSSDC master catalog entry", reference: "NASA Space Science Data Coordinated Archive", nasaUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=2007-034A" },
      { kind: "Mission archive", title: "Phoenix Mars mission page", reference: "NASA/JPL", nasaUrl: "https://mars.nasa.gov/phoenix/" },
      { kind: "Video", title: "Phoenix Mars Landing: Nerves and Joy", reference: "NASA Jet Propulsion Laboratory · official channel", nasaId: "YouTube", nasaUrl: "https://www.youtube.com/watch?v=hH5pNFROlYU", nasaCaption: "Landing-day animation and mission-control audio from 25 May 2008." }
    ],
    next_action: {
      action: "Pair the sublimation image pair with this record",
      why: "Two photographs four sols apart are the whole discovery. Readers should see both."
    }
  },
  {
    world: "mars",
    name: "Schiaparelli EDM lander",
    subtitle: "Six minutes that ended four kilometres early",
    timeline: [
      { d: "19 Oct 2016", t: "Descent under parachute; the sensor saturates and the software gives up early" },
      { d: "Oct 2016", t: "Orbiter images find the new crater, parachute and heat shield" },
      { d: "2016", t: "Open inquiry findings become every landing review's required reading" }
    ],
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
    hero_image: MARS_HERO,
    hero_credit: "The Schiaparelli impact region imaged by NASA's Mars Reconnaissance Orbiter (NASA/JPL/University of Arizona). Vendored in this archive's collection.",
    categories: [CATS.LOST, CATS.LESSON],
    reading_minutes: 4,
    narrative: [
      {
        h: "A rehearsal with an audience",
        p: [
          "Schiaparelli was never meant to do science for long. The European Space Agency built it as a technology rehearsal for the ExoMars rover: survive entry, descent, and landing, phone home for a few days on battery power, and prove Europe could land on Mars. It rode to Mars with the ExoMars Trace Gas Orbiter, which would relay its telemetry live.",
          "On 19 October 2016, the rehearsal had the largest audience in landing history — every second of data relayed to Earth in near real time."
        ]
      },
      {
        h: "What the data showed",
        p: [
          "The early sequence worked: atmospheric entry, heat shield, parachute, heat-shield release. Then the inertial measurement unit — the sensor telling the module how it was moving — saturated during the parachute phase, feeding the navigation software impossible rotation readings. The software did the worst reasonable thing: it concluded the module had already landed.",
          "It cut the parachute, fired the braking thrusters for three seconds instead of thirty, and switched on the surface science package — while still nearly four kilometres above Meridiani Planum. Schiaparelli fell the rest of the way at hundreds of kilometres per hour."
        ]
      },
      {
        h: "The crater that wasn't on the map",
        p: [
          "Days later, NASA's Mars Reconnaissance Orbiter photographed the site: a new dark crater, with the parachute and heat shield scattered nearby. The impact had excavated a pit where a lander should have stood. The European inquiry board published its findings openly — sensor saturation, unhandled by software that had no plausibility check for 'landed but still falling.'",
          "That openness is why this record is detailed. Failure investigated in public becomes engineering memory; failure buried becomes tuition paid twice."
        ]
      },
      {
        h: "What survived",
        p: [
          "Almost all of the descent telemetry survived — the module talked all the way down, which is precisely how engineers know what went wrong. The Trace Gas Orbiter went on to a successful science mission, returning the atmospheric data Schiaparelli's ride had enabled.",
          "On the ground: a crater, a parachute, fragments. The debris field near Meridiani is mapped and avoided by later traverse planning."
        ]
      },
      {
        h: "Why it matters today",
        p: [
          "Schiaparelli's lesson is now a design rule quoted in every landing review: never trust a single sensor about touchdown; check plausibility across instruments. The ExoMars rover programme redesigned its landing system around that rule.",
          "It is the youngest wreck in this archive and the best-documented failure on Mars — proof that the value of a wreck is the lesson it carries, if someone writes it down."
        ]
      }
    ],
    stakeholders: [
      { role: "Mission historian", name: "ExoMars records group", note: "Holds the anomaly investigation material." },
      { role: "Site planner", name: "Future surface activity planning", note: "Needs debris fields on the map before nearby operations are planned." },
      { role: "Archivist", name: "Engineering lessons archive", note: "Treats descent failures as required reading for future landings." }
    ],
    sources: [
      { kind: "Mission record", title: "ExoMars 2016 descent anomaly investigation", reference: "Public investigation summary", nasaUrl: "https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Exploration/ExoMars" },
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
    subtitle: "A field guide to the hardest six minutes in exploration",
    timeline: [
      { d: "1971", t: "Mars 2 crashes in; Mars 3 lands softly and speaks for seconds" },
      { d: "1999", t: "Mars Climate Orbiter burns up; Mars Polar Lander never phones home" },
      { d: "2003–16", t: "Beagle 2 lands mute; Schiaparelli narrates its own fall" }
    ],
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
    hero_image: MARS_HERO,
    hero_credit: MARS_HERO_CREDIT,
    categories: [CATS.LOST, CATS.LESSON],
    reading_minutes: 4,
    narrative: [
      {
        h: "Why Mars eats landers",
        p: [
          "Landing on Mars is famously the hardest routine operation in spaceflight. The atmosphere is thick enough to burn an incoming spacecraft and too thin to slow it with parachutes alone; the final touchdown needs rockets, airbags, or a sky crane, executed in about six minutes with no help from Earth — signals take up to 22 minutes each way. Engineers call it the seven minutes of terror, and the name is earned: roughly half of all Mars landing attempts have failed.",
          "This record is the map of those failures: the category that individual mission records, elsewhere in this archive, each tell in full."
        ]
      },
      {
        h: "The early Soviet attempts",
        p: [
          "Mars 2 arrived in 1971 and became the first human object to touch Mars — by crashing, its descent system failing under a steep entry. Mars 6 reached the surface in 1974 and died on impact or immediately after. Mars 7 missed the planet entirely. Each failure taught the programme something about entry angles, descent sequencing, and dust, paid for in years of work.",
          "Mars 3, kept as its own record here, is the bittersweet exception: it landed softly and spoke for seconds."
        ]
      },
      {
        h: "The 1990s losses",
        p: [
          "Mars Polar Lander and its Deep Space 2 penetrators vanished in December 1999 — the touchdown-sensor failure that is this archive's sternest lesson. Weeks earlier, Mars Climate Orbiter had burned up in the atmosphere because one team used imperial units and another metric — a unit mismatch that destroyed a $125 million orbiter and reformed NASA's review culture.",
          "These back-to-back losses ended the faster-better-cheaper era and rebuilt Mars exploration around testing discipline. Spirit, Opportunity, and Phoenix are their direct heirs."
        ]
      },
      {
        h: "Beagle and Schiaparelli",
        p: [
          "Beagle 2 (2003) survived arrival and died of a half-opened panel — the cruellest failure in the set, millimetres from success, found eleven years later. Schiaparelli (2016) survived almost all of descent and died of a confused sensor four kilometres up, its telemetry narrating its own fall.",
          "Each has a full record in this archive. Read them there; remember them here."
        ]
      },
      {
        h: "Why keep a category record",
        p: [
          "Because the pattern matters as much as the cases. Mars failures cluster at interfaces: between atmosphere and parachute, between sensor and software, between teams and units. The planet doesn't defeat missions; the seams do.",
          "This record stays as the index. Its own standing instruction — split the grouping into one record per mission — is now substantially done: open any Mars story in this archive and you are reading the split."
        ]
      }
    ],
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

module.exports = { MARS_STORIES, MARS_HERO, MARS_HERO_CREDIT, CATS };
