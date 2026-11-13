import type { Equipment, Source } from "./types";

const S = {
  lm: [
    { label: "Apollo Lunar Surface Journal — mission transcripts and technical commentary", url: "https://apollojournals.org/alsj/main.html" },
    { label: "NASA — Catalogue of Manmade Material on the Moon (2012)", url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf" },
    { label: "NASA — Apollo program", url: "https://www.nasa.gov/the-apollo-program/" },
    { label: "NASA — Apollo 11 mission", url: "https://www.nasa.gov/mission/apollo-11/" },
  ] as Source[],
  lrv: [
    { label: "Apollo 15 Lunar Surface Journal — rover deployment and traverses", url: "https://apollojournals.org/alsj/a15/a15.html" },
    { label: "NASA — Apollo 15 mission", url: "https://www.nasa.gov/mission/apollo-15/" },
  ] as Source[],
  surveyor: [
    { label: "NASA Science — Surveyor 3", url: "https://science.nasa.gov/mission/surveyor-3/" },
  ] as Source[],
  lunokhod: [
    { label: "NASA History — Beyond Earth (2018), Luna 17 / Lunokhod 1, pp. 97–98", url: "https://www.nasa.gov/wp-content/uploads/2018/09/beyond-earth-tagged.pdf" },
    { label: "NASA 2012 Catalogue of Manmade Material on the Moon", url: "https://www.nasa.gov/wp-content/uploads/2024/02/final-catalogue-of-manmade-material-on-the-moon.pdf" },
  ] as Source[],
};

export const MOON_EQUIPMENT: Equipment[] = [
  {
    id: "apollo-lunar-module",
    name: "Apollo Lunar Module",
    shortName: "LM",
    planet: "moon",
    category: "lander",
    status: "inactive",
    mission: "Apollo 11 – 17",
    agency: "NASA / Grumman",
    years: "1969 – 1972",
    landed: "20 July 1969 (first)",
    site: "Mare Tranquillitatis and five other sites",
    image: "/images/lunar-module.jpg",
    imageCredit: "NASA/JSC",
    imageCaption: "Buzz Aldrin beside the leg of Lunar Module Eagle, photographed by Neil Armstrong, 20 July 1969.",
    tagline: "Six descent stages still stand where humans first walked on another world.",
    summary:
      "The Lunar Module was the only crewed spacecraft designed to fly nowhere but space. Six descent stages were left behind on the Moon; each one is a monument to a landing that changed what it means to be human.",
    model: "lm",
    modelNote:
      "Educational reconstruction from Apollo LM engineering diagrams: octagonal descent stage, ascent stage cabin, four landing legs and footpads, ladder and descent engine bell. Foil and thermal blankets are represented by materials, not simulated.",
    mass: "Fuelled mass varied by mission; touchdown mass was lower after descent propellant use",
    power: "Silver-zinc batteries; the Apollo service module carried the fuel cells",
    duration: "Each surface stay: 21 – 75 hours",
    specs: [
      { label: "Builder", value: "Grumman Aircraft Engineering Corporation" },
      { label: "Height", value: "About 7 m with legs extended" },
      { label: "Descent stage", value: "Octagonal, 4.3 m across, about 10,300 kg fuelled" },
      { label: "Ascent stage", value: "Crew cabin about 4.5 m³, about 4,700 kg fuelled" },
      { label: "Descent engine", value: "Throttleable 4,500–44,000 N" },
      { label: "Surface stays", value: "Apollo 11: 21.5 h, Apollo 17: 75 h" },
      { label: "Left on the Moon", value: "6 descent stages, 6 landing leg sets, ladders, plaques" },
    ],
    instruments: [
      "Primary guidance and navigation system",
      "Rendezvous radar",
      "Landing radar",
      "Descent engine and RCS thrusters",
      "ALSEP / EASEP storage bay",
      "Lunar surface sensing probes",
    ],
    objectives: [
      "Land two astronauts on the Moon and return them safely",
      "Serve as a base for surface operations and sample collection",
      "Deploy scientific experiments and leave instrument packages behind",
    ],
    discoveries: [
      {
        title: "The Moon is ancient and dry",
        year: "1969 – 1972",
        body: "Samples returned from six sites showed the lunar highlands are made of anorthosite, a rock that formed in a global magma ocean more than 4 billion years ago.",
      },
      {
        title: "The Moon shakes",
        year: "1969 – 1977",
        body: "Apollo seismometers recorded moonquakes for years and constrained the crust and mantle. Much later reanalysis of those recordings supported a small core and a partially molten layer around it.",
      },
      {
        title: "A record of the early solar system",
        year: "1969 – 1972",
        body: "382 kg of lunar samples returned by the Apollo crews became the calibration standard for planetary science, still studied today with instruments that did not exist in 1969.",
      },
    ],
    story: {
      beginning: [
        "In 1961 President Kennedy asked NASA to land a man on the Moon before the decade was out. The hardest engineering problem was not the rocket but the landing: how do you set a crewed vehicle down on an airless, unknown surface?",
        "Grumman's answer was the Lunar Module — a two-stage spacecraft so specialised it could never fly in Earth's atmosphere. It was built from aluminium, titanium, and miles of foil-wrapped thermal blanket.",
      ],
      journey: [
        "The LM travelled inside the Saturn V's adapter. After trans-lunar injection, the crew turned the command and service module around, docked with the LM and extracted it for the coast to the Moon.",
        "On arrival in lunar orbit, two astronauts climbed into the LM, separated, and fired the descent engine to drop out of orbit.",
      ],
      landing: [
        "On 20 July 1969 Eagle descended toward the Sea of Tranquillity. Alarms rang as the guidance computer overloaded, and Armstrong took manual control to avoid a boulder field, touching down with limited descent propellant remaining.",
        "Five more crewed landings followed at different sites. All six descent stages were left on the surface, their engines no longer needed after ascent.",
      ],
      mission: [
        "The descent stage became the launch pad for the ascent stage — and, once the crew left, permanent lunar hardware: legs, footpads, ladders, a plaque, a flag and the packaging for the experiments deployed nearby.",
        "Apollo 11 stayed 21.5 hours; Apollo 17 stayed 75 hours. Each mission extended the time, distance and science possible from the LM.",
      ],
      finalDays: [
        "On each of the six landing missions, the ascent stage returned the crew to lunar orbit. Apollo 12, 14, 15 and 17 then deliberately impacted their stages; the eventual fates of the Apollo 11 and 16 ascent stages remain unconfirmed.",
        "The descent stages have been exposed to micrometeorites, radiation and extreme day-night temperatures for more than half a century. Orbital images show their locations but cannot establish the condition of every part.",
      ],
      legacy: [
        "The Apollo LM carried the six crewed lunar landings of 1969–1972. Its surviving descent stages preserve the physical sites of those missions.",
        "Its guidance computer, throttleable engine and lightweight structures remain important examples in the history of spacecraft engineering.",
      ],
    },
    gallery: [
      { src: "/images/lunar-module.jpg", caption: "Buzz Aldrin beside Eagle's landing leg, 20 July 1969.", credit: "NASA/JSC" },
      { src: "/images/apollo-footprint.jpg", caption: "A bootprint in the lunar regolith, Apollo 11.", credit: "NASA/JSC" },
      { src: "/images/moon-surface.jpg", caption: "Apollo 17 Lunar Ejecta and Meteorites Experiment hardware before the mission, November 1972 (NASA S72-37257).", credit: "NASA/JSC" },
      { src: "/images/earthrise.jpg", caption: "Earth over the lunar horizon, Apollo 8, 1968.", credit: "NASA/JSC" },
    ],
    luffy: [
      {
        text: "Wait! Humans actually landed here? Twice? Six times?!",
        expression: "wow",
        pose: "point",
      },
      {
        text: "And the bottom half of the lander is still sitting there. A house on the Moon, left unlocked forever.",
        expression: "curious",
        pose: "idle",
      },
    ],
    sources: S.lm,
    confidence: "verified",
  },
  {
    id: "apollo-lrv",
    name: "Lunar Roving Vehicle",
    shortName: "LRV",
    planet: "moon",
    category: "mobility",
    status: "inactive",
    mission: "Apollo 15, 16, 17",
    agency: "NASA / Boeing & GM",
    years: "1971 – 1972",
    landed: "30 July 1971 (first landing; rover deployed 31 July)",
    site: "Hadley–Apennine, Descartes, Taurus–Littrow",
    image: "/images/lrv.jpg",
    imageCredit: "NASA/MSFC",
    imageCaption: "A Lunar Roving Vehicle photographed during Apollo 16 (NASA 0102627).",
    tagline: "Three electric buggies, folded into a cubic metre, still parked on the Moon.",
    summary:
      "The LRV turned a walking mission into a driving one. Three flight rovers were delivered by Apollo 15, 16 and 17, in addition to vehicles built for testing and training. All three deployed rovers remain on the Moon.",
    model: "lrv",
    modelNote:
      "Educational reconstruction from the LRV operations handbook and Apollo photographs: tubular chassis, four wire-mesh wheels, folded seats, control console, umbrella antenna and battery boxes.",
    mass: "210 kg (490 kg payload)",
    power: "Two 36 V silver-zinc batteries (non-rechargeable)",
    distance: "About 90 km total across three missions",
    duration: "Up to 4.7 hours per traverse",
    specs: [
      { label: "Builder", value: "Boeing with General Motors" },
      { label: "Length", value: "3.1 m, wheelbase 2.3 m" },
      { label: "Wheels", value: "4 × 81 cm wire-mesh tyres with titanium chevron treads" },
      { label: "Stowed size", value: "About 1.5 m × 1.5 m × 1.1 m" },
      { label: "Top speed", value: "About 18 km/h (Apollo 17)" },
      { label: "Distance driven", value: "Apollo 15: 27.8 km · 16: 26.7 km · 17: 35.7 km" },
      { label: "Still on the Moon", value: "3 vehicles (LRV-1, -2, -3)" },
    ],
    instruments: [
      "Lunar Communications Relay Unit",
      "Ground-commanded television camera",
      "Navigation system with directional gyro and odometer",
      "Sample collection bags and tool carrier",
      "Portable life support system mounts",
    ],
    objectives: [
      "Extend the astronauts' exploration range far beyond walking distance",
      "Carry tools, samples and experiments across rugged terrain",
      "Provide a stable platform for a television camera and communications",
    ],
    discoveries: [
      {
        title: "The Genesis Rock",
        year: "1971",
        body: "Apollo 15's crew collected sample 15415, the Genesis Rock, at Spur crater during a rover traverse. The anorthosite helped scientists investigate the ancient lunar highland crust.",
      },
      {
        title: "Orange soil at Shorty Crater",
        year: "1972",
        body: "From the LRV, Apollo 17's Harrison Schmitt spotted orange soil at Shorty Crater — tiny volcanic glass beads from an explosive eruption about 3.6 billion years ago.",
      },
      {
        title: "A real geology expedition",
        year: "1971 – 1972",
        body: "Apollo 15, 16 and 17 returned about 281 kg of rock and soil in total. Their rover traverses let the crews sample many more geological settings than walking alone allowed.",
      },
    ],
    story: {
      beginning: [
        "By 1969 NASA knew that astronauts on foot could only carry so much and walk so far. The LRV was commissioned as a lightweight electric vehicle that could be folded into a wedge of the Lunar Module and unfolded on the surface.",
        "It had to survive launch vibration, vacuum, extreme temperatures and dust, and it had to work on the first try — there was no garage on the Moon.",
      ],
      journey: [
        "Folded into the descent stage's quadrant bay, each LRV travelled to the Moon inside the LM and was deployed by the crew after landing using pulleys, tapes and a lot of careful pulling.",
        "The crew used the deployment tapes to lower and unfold the vehicle from the lander's bay, then prepared it for driving on the surface.",
      ],
      landing: [
        "Apollo 15's crew deployed the first LRV at Hadley–Apennine on 31 July 1971. Within hours they had driven further from the lander than any previous mission could have walked.",
        "Apollo 16 and 17 followed, each with an improved vehicle and a longer list of geological targets.",
      ],
      mission: [
        "The LRV carried two astronauts, their tools and samples, a television camera the ground could control, and a communications relay that allowed live pictures from the surface.",
        "It drove through craters, up slopes and across boulder fields, with navigation by gyro and odometer because there were no roads, no GPS and no map fine enough to steer by.",
      ],
      finalDays: [
        "At the end of each mission the crew parked the LRV a short distance from the LM, set the television camera to show the ascent, and left it behind.",
        "All three vehicles remain on the Moon. Their batteries are dead, their tyres are exposed to vacuum, and some of their fenders are patched with maps and tape.",
      ],
      legacy: [
        "The LRV proved that vehicles could dramatically expand surface exploration, a lesson applied to every rover since — including the Mars rovers.",
        "Its wire-mesh wheels and electric drive are important examples of lunar vehicle engineering. The parked rovers form part of the Apollo historical sites.",
      ],
    },
    gallery: [
      { src: "/images/lrv.jpg", caption: "A Lunar Roving Vehicle photographed during Apollo 16 (NASA 0102627).", credit: "NASA/MSFC" },
      { src: "/images/moon-surface.jpg", caption: "Apollo 17 Lunar Ejecta and Meteorites Experiment hardware before the mission, November 1972 (NASA S72-37257).", credit: "NASA/JSC" },
      { src: "/images/apollo-footprint.jpg", caption: "Regolith compacted by a boot, Apollo 11.", credit: "NASA/JSC" },
    ],
    luffy: [
      {
        text: "A car on the Moon! It folded up like a camping chair and they just left it parked.",
        expression: "grin",
        pose: "wave",
      },
    ],
    sources: S.lrv,
    confidence: "verified",
  },
  {
    id: "surveyor-3",
    name: "Surveyor 3",
    shortName: "Surveyor 3",
    planet: "moon",
    category: "lander",
    status: "inactive",
    mission: "Surveyor",
    agency: "NASA / JPL",
    years: "1967",
    landed: "20 April 1967",
    site: "Oceanus Procellarum",
    image: "/images/surveyor.jpg",
    imageCredit: "NASA/JSC",
    imageCaption: "Surveyor 3 in its crater, photographed by the Apollo 12 crew in November 1969.",
    tagline: "The only robot on the Moon that humans have walked up to and touched.",
    summary:
      "Surveyor 3 measured lunar soil strength and returned close-range pictures. Two and a half years later, Apollo 12 landed about 160 metres away and brought parts of it home — the first visit by humans to a robotic spacecraft on another world.",
    model: "surveyor",
    modelNote:
      "Educational reconstruction of Surveyor 3 before Apollo 12 removed its camera and other parts: tripod legs, solar panel, antenna, camera and soil scoop. This does not reproduce its present condition.",
    mass: "About 300 kg (landed)",
    power: "Solar panel + silver-zinc battery",
    duration: "About 14 days of operation",
    specs: [
      { label: "Launch", value: "17 April 1967, Atlas-Centaur" },
      { label: "Landing", value: "20 April 1967, 00:04 UTC" },
      { label: "Landing site", value: "3.02°S, 23.42°W (Oceanus Procellarum)" },
      { label: "Body", value: "About 3 m across the deployed landing gear" },
      { label: "Images returned", value: "6,326" },
      { label: "Visited by", value: "Apollo 12 EVA 2, 20 November 1969 UTC (about 160 m from Intrepid)" },
    ],
    instruments: [
      "Television camera",
      "Soil mechanics surface sampler (remote scoop)",
      "Solar panel and battery",
      "Planar and directional antennas",
      "Temperature and strain sensors",
    ],
    objectives: [
      "Demonstrate a soft landing on the Moon",
      "Test whether the surface could support an Apollo lander",
      "Photograph the surface and dig into the regolith",
    ],
    discoveries: [
      {
        title: "The Moon's soil is firm enough to land on",
        year: "1967",
        body: "Surveyor 3's scoop dug trenches and pressed into the regolith, measuring bearing strength. Its results reassured engineers that the lunar surface would not swallow the Apollo landers.",
      },
      {
        title: "A basalt plain",
        year: "1967",
        body: "Images and soil mechanics data showed the site was covered in basaltic rock and fine dust, evidence of ancient lava flows filling the basin.",
      },
      {
        title: "The first returned spacecraft parts",
        year: "1969",
        body: "Apollo 12 astronauts removed Surveyor 3's camera and cables and brought them to Earth, where engineers studied two and a half years of exposure to vacuum, radiation and micrometeorites.",
      },
    ],
    story: {
      beginning: [
        "Surveyor was NASA's lunar scout program: seven landers sent ahead of Apollo to find out whether the Moon's surface could hold a spacecraft.",
        "Surveyor 3 carried a remote scoop — the first tool designed to dig on another world.",
      ],
      journey: [
        "Launched on 17 April 1967, Surveyor 3 flew directly to the Moon in about 65 hours and braked into a descent trajectory using a solid-fuel retro-rocket.",
      ],
      landing: [
        "On 20 April 1967 the lander came down inside a shallow crater. Its engines did not shut down at the expected height, so it bounced twice before ground controllers shut them off and it settled at a tilt.",
        "It then photographed the surface, including its own footpads, and began digging trenches with the scoop.",
      ],
      mission: [
        "Surveyor 3 returned 6,326 images and dug four trenches, measuring how lunar soil behaves under load. It operated through its first lunar day until the cold night silenced it.",
        "In November 1969 Apollo 12 touched down about 160 m away, demonstrating a crewed precision landing beside a known robotic target.",
      ],
      finalDays: [
        "Surveyor 3 has been dormant since May 1967. Apollo 12's crew photographed it, walked to it, and removed its camera and a length of cable for return to Earth.",
        "The remaining lander sits in its crater, exposed to the slow lunar cycle of roughly two weeks of daylight followed by two weeks of darkness.",
      ],
      legacy: [
        "Surveyor 3 is the only robotic spacecraft that humans have visited on another planetary body.",
        "The returned camera was studied for the effects of long-term lunar exposure, including the famous — and still debated — report of bacteria surviving inside it.",
      ],
    },
    gallery: [
      { src: "/images/surveyor.jpg", caption: "Surveyor 3 in its crater, imaged by Apollo 12 astronauts.", credit: "NASA/JSC" },
      { src: "/images/apollo-footprint.jpg", caption: "Apollo 11 bootprint in the regolith Surveyor helped characterise.", credit: "NASA/JSC" },
      { src: "/images/lunar-closeup.jpg", caption: "A small fresh crater on the wall of Metius B, seen by LRO.", credit: "NASA/GSFC/Arizona State University" },
    ],
    luffy: [
      {
        text: "Astronauts walked up to this robot and took its camera home. Like borrowing a friend's hat!",
        expression: "grin",
        pose: "point",
      },
    ],
    sources: S.surveyor,
    confidence: "verified",
  },
  {
    id: "lunokhod-1",
    name: "Lunokhod 1",
    shortName: "Luna 17",
    planet: "moon",
    category: "rover",
    status: "inactive",
    mission: "Luna 17",
    agency: "Soviet Union",
    years: "1970 – 1971",
    landed: "17 November 1970",
    site: "Mare Imbrium",
    image: "/images/lunokhod.jpg",
    imageCredit: "NASA/GSFC/Arizona State University",
    imageCaption: "Site image: Luna 17's lander in Mare Imbrium, where it delivered Lunokhod 1, imaged by LRO (NASA PIA12967).",
    tagline: "The first rover on another world — and it was remote-controlled from Earth.",
    summary:
      "Lunokhod 1 was the first wheeled vehicle to drive on the Moon. A ground crew steered it with delayed television images, performing 25 chemical analyses and 537 soil-strength tests. The historic reported traverse was about 10.5 km; later mapping revised it to about 9.9 km.",
    model: "lunokhod",
    modelNote:
      "Educational reconstruction from published Luna 17 / Lunokhod photographs and dimensions: tub-shaped body with hinged solar lid, eight independently driven wheels, cone antenna, instrument booms and X-ray spectrometer.",
    mass: "756 kg",
    power: "Hinged solar panel lid + chemical batteries",
    distance: "About 10.5 km historically reported; about 9.9 km in later mapping",
    duration: "November 1970 – September 1971; contact attempts ended 4 October",
    specs: [
      { label: "Launch", value: "10 November 1970, Proton-K" },
      { label: "Landing", value: "17 November 1970, 03:47 UTC" },
      { label: "Landing site", value: "38.28°N, 35.0°W (Mare Imbrium)" },
      { label: "Dimensions", value: "About 2.15 m across and 1.35 m tall (lid closed)" },
      { label: "Wheels", value: "8, independently driven, 51 cm diameter" },
      { label: "Images returned", value: "More than 20,000 television images and 200 panoramas" },
    ],
    instruments: [
      "Two television cameras and four panoramic photometers",
      "X-ray fluorescence spectrometer",
      "Penetrometer for soil strength",
      "X-ray telescope",
      "Cosmic ray detector",
      "Laser retroreflector array",
      "Odometer",
    ],
    objectives: [
      "Drive a remotely controlled rover across the lunar surface",
      "Analyse lunar soil and rock composition",
      "Return panoramic images and long-term environmental data",
      "Measure radiation and support lunar laser ranging",
    ],
    discoveries: [
      {
        title: "A detailed soil survey",
        year: "1970 – 1971",
        body: "Lunokhod 1 performed 25 X-ray chemical analyses and 537 penetrometer tests, investigating the composition and mechanical behaviour of the regolith along its route.",
      },
      {
        title: "A view along a rover traverse",
        year: "1970 – 1971",
        body: "More than 20,000 television pictures and about 200 panoramas documented the terrain along the route. Lunokhod 1 did not carry the magnetometer later added to Lunokhod 2.",
      },
      {
        title: "A reflector still in use",
        year: "1970 – present",
        body: "The French-built laser retroreflector on Lunokhod 1 allows Earth stations to measure the Moon's distance to millimetres. The reflector was relocated precisely in 2010 with Lunar Reconnaissance Orbiter images and is still ranged today.",
      },
    ],
    story: {
      beginning: [
        "The Soviet Union lost the race to put humans on the Moon, so it built robots instead. Luna 17 carried a 756 kg eight-wheeled rover designed to be driven by a crew on Earth.",
        "Lunokhod was a sealed, pressurised tub with a hinged solar panel lid that closed at night, keeping its instruments warm with a radioisotope heater.",
      ],
      journey: [
        "Launched on 10 November 1970, Luna 17 flew to the Moon in four days and entered a low orbit before beginning its descent.",
      ],
      landing: [
        "On 17 November 1970 the lander touched down in Mare Imbrium. Two ramps unfolded and Lunokhod 1 rolled onto the surface, becoming the first rover ever to drive on another world.",
        "Its first panorama revealed a flat, rock-strewn plain and the tracks it had just made — the first wheel tracks on the Moon.",
      ],
      mission: [
        "A five-person team in Crimea drove the rover using delayed television images. The light-travel round trip alone was about 2.6 seconds, and receiving an image and executing a command took longer.",
        "Across eleven lunar-day operating periods it returned more than 20,000 images, 25 chemical analyses and 537 soil-strength tests. Historic reports gave a route of about 10.5 km; later orbital mapping revised that figure.",
      ],
      finalDays: [
        "Last contact was on 14 September 1971. Controllers ended recovery attempts on 4 October; the precise final failure was not measured by the silent spacecraft. It had been designed for three lunar days.",
        "Lunokhod 1's exact location was uncertain for decades until 2010, when laser ranging and LRO images pinpointed it again.",
      ],
      legacy: [
        "Lunokhod 1 proved that teleoperated rovers could explore the Moon, and its laser reflector continues to contribute to precision tests of gravity.",
        "Its successor, Lunokhod 2, made a much longer traverse in 1973. Later track mapping placed that route at about 42 km, illustrating why historic odometer totals need a date and method.",
      ],
    },
    gallery: [
      { src: "/images/lunokhod.jpg", caption: "Luna 17's lander in Mare Imbrium, where it delivered Lunokhod 1, imaged by LRO (NASA PIA12967).", credit: "NASA/GSFC/Arizona State University" },
      { src: "/images/moon-surface.jpg", caption: "Apollo 17 Lunar Ejecta and Meteorites Experiment hardware before the mission, November 1972 (NASA S72-37257).", credit: "NASA/JSC" },
      { src: "/images/lunar-closeup.jpg", caption: "A small crater on the wall of Metius B, LRO.", credit: "NASA/GSFC/Arizona State University" },
    ],
    luffy: [
      {
        text: "Eight wheels, driven by people back on Earth with delayed pictures. Like a video game — with the Moon as the level!",
        expression: "grin",
        pose: "point",
      },
    ],
    sources: S.lunokhod,
    confidence: "verified",
  },
];
