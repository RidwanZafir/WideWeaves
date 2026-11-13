import type { ModelComponent, ModelKey } from "./types";

export const MODEL_COMPONENTS: Record<ModelKey, ModelComponent[]> = {
  mer: [
    {
      id: "chassis",
      label: "Warm Electronics Box",
      group: "Structure",
      description:
        "The rover's body and brain. It holds the computer, power electronics and heaters, insulated against Martian nights that drop to −90 °C.",
      spec: "About 1.1 m wide",
    },
    {
      id: "solar",
      label: "Solar Panel Deck",
      group: "Power",
      description:
        "Three gallium-arsenide panels supplied up to ~140 W of power at noon. Dust accumulating on them slowly starved both rovers.",
      spec: "1.3 m² of cells",
    },
    {
      id: "mast",
      label: "Pancam Mast Assembly",
      group: "Sensing",
      description:
        "A 1.5 m mast carrying the stereo panoramic camera. Raising the cameras above the rover's own dust gave the team a clean 360° view.",
      spec: "Two 1024×1024 CCDs",
    },
    {
      id: "antenna",
      label: "High-Gain Antenna",
      group: "Communications",
      description:
        "A steerable dish that beamed data directly to Earth's Deep Space Network. The low-gain antenna provided a slower backup link.",
    },
    {
      id: "arm",
      label: "Robotic Arm (IDD)",
      group: "Manipulation",
      description:
        "The Instrument Deployment Device placed four tools against rocks: a microscope, two spectrometers and the Rock Abrasion Tool.",
      spec: "5 degrees of freedom",
    },
    {
      id: "wheels",
      label: "Wheels",
      group: "Mobility",
      description:
        "Six aluminium wheels with cleats, each with its own drive motor. Steering used the four corner wheels, allowing the rover to turn in place.",
      spec: "26 cm diameter",
    },
    {
      id: "suspension",
      label: "Rocker-Bogie Suspension",
      group: "Mobility",
      description:
        "A passive six-wheel linkage that keeps all wheels in contact with uneven ground, letting the rover climb rocks taller than its wheels.",
    },
    {
      id: "instruments",
      label: "Mini-TES & APXS",
      group: "Science",
      description:
        "Mini-TES read infrared spectra of distant rocks; the Alpha Particle X-ray Spectrometer measured elemental chemistry at close range.",
    },
  ],
  msl: [
    {
      id: "chassis",
      label: "Rover Body & Avionics",
      group: "Structure",
      description:
        "A titanium-and-aluminium chassis housing redundant computers, the sample-handling mechanism and the rover's thermal control system.",
    },
    {
      id: "rtg",
      label: "Radioisotope Generator",
      group: "Power",
      description:
        "The Multi-Mission Radioisotope Thermoelectric Generator converts heat from plutonium-238 decay into electricity, working day and night through dust storms.",
      spec: "About 110 W at start of mission",
    },
    {
      id: "mast",
      label: "Remote Sensing Mast",
      group: "Sensing",
      description:
        "A remote sensing mast places Mastcam, navigation cameras and the ChemCam laser optical head about 2.1 m above the ground. ChemCam reads glowing plasma from distant rock targets.",
    },
    {
      id: "antenna",
      label: "High-Gain Antenna",
      group: "Communications",
      description:
        "A hexagonal flat-panel antenna that points at Earth for direct-to-ground data return, supplemented by orbiter relays.",
    },
    {
      id: "arm",
      label: "Robotic Arm & Turret",
      group: "Manipulation",
      description:
        "A 2.1 m arm carrying a drill, a dust-removal brush, a close-up imager and spectrometers. It can drill, sieve and deliver powder to onboard labs.",
      spec: "5 degrees of freedom",
    },
    {
      id: "wheels",
      label: "Wheels",
      group: "Mobility",
      description:
        "Six aluminium wheels with titanium spokes, each independently driven and steerable at the four corners. Each wheel has 24 chevron-patterned grousers for traction.",
      spec: "About 50.8 cm diameter",
    },
    {
      id: "suspension",
      label: "Rocker-Bogie Suspension",
      group: "Mobility",
      description:
        "A scaled-up version of the MER design that lets a 900 kg laboratory cross terrain that would stop a smaller rover.",
    },
    {
      id: "instruments",
      label: "Sample Analysis Bay",
      group: "Science",
      description:
        "The body holds SAM and CheMin, which heat and X-ray powdered rock to identify minerals and organic molecules.",
    },
  ],
  sojourner: [
    {
      id: "body",
      label: "Rover Body",
      group: "Structure",
      description:
        "A 10.6 kg aluminium box holding the computer, batteries and communications equipment, sealed against Martian dust.",
    },
    {
      id: "solar",
      label: "Solar Panel",
      group: "Power",
      description:
        "A single flat panel on top of the body produced about 16 W at noon — enough for a few hours of driving per sol.",
    },
    {
      id: "wheels",
      label: "Six Wheels",
      group: "Mobility",
      description:
        "Aluminium wheels with cleats, each with its own motor, using a rocker-bogie linkage for climbing over rocks.",
    },
    {
      id: "camera",
      label: "Body-Mounted Cameras",
      group: "Sensing",
      description:
        "Two front monochrome cameras and one rear color camera sit on the body. Front laser striping helped detect obstacles; Sojourner had no tall camera mast.",
    },
    {
      id: "apxs",
      label: "APXS",
      group: "Science",
      description:
        "The rear-mounted Alpha Proton X-ray Spectrometer was the rover's chemistry instrument. A deployment mechanism placed its sensor against rocks and soil.",
    },
  ],
  lrv: [
    {
      id: "chassis",
      label: "Tubular Chassis",
      group: "Structure",
      description:
        "An aluminium space-frame 3.1 m long, designed to fold into a 1.5 m bay on the Lunar Module and unfold on the surface.",
    },
    {
      id: "wheels",
      label: "Wire-Mesh Wheels",
      group: "Mobility",
      description:
        "Four 81 cm wheels woven from zinc-coated piano wire, with titanium bump stops. The mesh flexed over rocks like a bicycle tyre.",
      spec: "81 cm diameter",
    },
    {
      id: "seats",
      label: "Crew Seats & Harness",
      group: "Crew",
      description:
        "Two folding fibreglass seats with Velcro-and-nylon harnesses, positioned so astronauts could reach the controls with heavy gloves.",
    },
    {
      id: "console",
      label: "Control & Display Console",
      group: "Control",
      description:
        "A T-shaped hand controller between the seats, with a heading indicator and speed display — the first steering wheel on another world.",
    },
    {
      id: "battery",
      label: "Silver-Zinc Batteries",
      group: "Power",
      description:
        "Two 36 V silver-zinc batteries, non-rechargeable and good for about 92 km of driving in total. They are still bolted to the parked rovers.",
    },
    {
      id: "antenna",
      label: "Umbrella Antenna",
      group: "Communications",
      description:
        "A 90 cm parabolic high-gain antenna that folded out like an umbrella, allowing live television from the lunar surface.",
    },
    {
      id: "fenders",
      label: "Dust Fenders",
      group: "Mobility",
      description:
        "Simple fenders over each wheel. Apollo 17's crew famously repaired a broken fender with laminated maps and grey tape.",
    },
  ],
  lm: [
    {
      id: "descent",
      label: "Descent Stage",
      group: "Structure",
      description:
        "The octagonal lower half, wrapped in gold and silver thermal foil. It carried the descent engine, propellant, landing gear and the storage bays for experiments.",
      spec: "About 4.3 m across",
    },
    {
      id: "ascent",
      label: "Ascent Stage Cabin",
      group: "Structure",
      description:
        "The pressurised crew cabin with two windows, two hatches and about 4.5 m³ of volume for two astronauts standing side by side.",
    },
    {
      id: "legs",
      label: "Landing Legs & Footpads",
      group: "Structure",
      description:
        "Four legs with crushable aluminium honeycomb struts and large circular footpads, designed to absorb the touchdown without tipping.",
    },
    {
      id: "engine",
      label: "Descent Engine",
      group: "Propulsion",
      description:
        "A throttleable engine that could be varied from 4,500 to 44,000 newtons, allowing a controlled hover and soft touchdown.",
    },
    {
      id: "ladder",
      label: "Ladder & Porch",
      group: "Access",
      description:
        "Nine rungs and a small porch. The bottom rung sits about 60 cm above the surface — Armstrong's famous 'one small step'.",
    },
    {
      id: "rcs",
      label: "Reaction Control Thrusters",
      group: "Propulsion",
      description:
        "Small thrusters around the ascent stage that controlled attitude during descent, rendezvous and docking.",
    },
    {
      id: "antenna",
      label: "Antennas",
      group: "Communications",
      description:
        "S-band steerable and omni antennas carried voice and telemetry; a high-gain dish was used for television and high-rate data.",
    },
  ],
  surveyor: [
    {
      id: "body",
      label: "Central Body",
      group: "Structure",
      description:
        "A hexagonal frame carrying the battery, transmitters and electronics, protected by thermal blankets and a sunshade.",
    },
    {
      id: "legs",
      label: "Tripod Landing Legs",
      group: "Structure",
      description:
        "Three legs with crushable aluminium honeycomb shock absorbers and footpads that let Surveyor settle on slopes up to 12°.",
    },
    {
      id: "solar",
      label: "Solar Panel",
      group: "Power",
      description:
        "A flat array that supplied about 85 W at lunar noon, keeping the lander alive for one lunar day.",
    },
    {
      id: "camera",
      label: "Television Camera",
      group: "Sensing",
      description:
        "A slow-scan vidicon camera that returned thousands of images, including the first close-ups of the lunar surface.",
    },
    {
      id: "scoop",
      label: "Soil Mechanics Scoop",
      group: "Science",
      description:
        "A remote-controlled scoop on a folding arm — the first tool to dig into another world, measuring soil strength and bearing capacity.",
    },
    {
      id: "antenna",
      label: "Planar Array Antenna",
      group: "Communications",
      description:
        "A flat high-gain antenna pointed at Earth for direct image transmission, with a smaller omni antenna for commands.",
    },
  ],
  lunokhod: [
    {
      id: "body",
      label: "Pressurised Tub",
      group: "Structure",
      description:
        "A sealed bathtub-shaped body holding instruments in a nitrogen atmosphere, kept warm at night by a radioisotope heat source.",
    },
    {
      id: "lid",
      label: "Hinged Solar Lid",
      group: "Power",
      description:
        "A solar panel lid that opened to face the Sun by day and closed at night, protecting the rover and retaining heat.",
    },
    {
      id: "wheels",
      label: "Eight Wheels",
      group: "Mobility",
      description:
        "Eight independently driven metal wheels with wire cleats, letting the rover climb slopes and cross craters under remote control.",
      spec: "51 cm diameter",
    },
    {
      id: "antenna",
      label: "Cone Antenna",
      group: "Communications",
      description:
        "A large conical high-gain antenna used to send television images and receive driving commands from Earth.",
    },
    {
      id: "spectrometer",
      label: "X-Ray Spectrometer",
      group: "Science",
      description:
        "Lowered onto the soil to measure elemental composition, it performed hundreds of analyses across the traverse.",
    },
    {
      id: "boom",
      label: "Camera & Instrument Mounts",
      group: "Science",
      description:
        "Simplified external mounts for rover cameras and science sensors. Lunokhod 1 carried radiation and X-ray instruments; the magnetometer was added on Lunokhod 2.",
    },
    {
      id: "reflector",
      label: "Laser Retroreflector",
      group: "Science",
      description:
        "A French-built corner-cube array that bounces laser pulses straight back to Earth, measuring the Moon's distance to millimetres.",
    },
  ],
  insight: [
    {
      id: "deck",
      label: "Lander Deck",
      group: "Structure",
      description:
        "A circular platform carrying the seismometer, robotic arm, cameras and communications equipment.",
    },
    {
      id: "solar",
      label: "Fan Solar Arrays",
      group: "Power",
      description:
        "Two 2.2 m circular arrays that unfolded like fans. Dust accumulation on them eventually ended the mission.",
    },
    {
      id: "legs",
      label: "Landing Legs",
      group: "Structure",
      description:
        "Three legs with crushable struts that absorbed the touchdown on Elysium Planitia.",
    },
    {
      id: "seismometer",
      label: "SEIS Seismometer",
      group: "Science",
      description:
        "A broadband seismometer in a wind-and-thermal shield, sensitive enough to detect a magnitude 3 event on the other side of the planet.",
    },
    {
      id: "mole",
      label: "HP3 Heat Probe",
      group: "Science",
      description:
        "The 40 cm self-hammering mole needed to reach at least 3 m to measure heat flow. Insufficient soil friction prevented that measurement. The model shows the deployment support and tether; the probe was shallowly buried at the end of the attempt.",
    },
    {
      id: "mast",
      label: "Instrument Deployment Arm",
      group: "Manipulation",
      description:
        "A robotic arm that lifted SEIS and HP3 onto the surface and positioned the camera for panoramas.",
    },
  ],
  phoenix: [
    {
      id: "deck",
      label: "Lander Deck",
      group: "Structure",
      description:
        "A circular deck carrying the wet chemistry lab, TEGA ovens and the robotic arm's root joint.",
    },
    {
      id: "solar",
      label: "Fan Solar Arrays",
      group: "Power",
      description:
        "Two circular fan arrays supplied power through the polar summer, but frost and dust ended the mission as autumn arrived.",
    },
    {
      id: "arm",
      label: "Robotic Arm & Scoop",
      group: "Manipulation",
      description:
        "A 2.35 m arm with a scoop and rasp that dug trenches and delivered icy soil to the onboard ovens.",
    },
    {
      id: "mast",
      label: "Stereo Camera Mast",
      group: "Sensing",
      description:
        "A 1.9 m mast with stereo imagers that produced panoramas of the polygon-patterned polar surface.",
    },
    {
      id: "legs",
      label: "Landing Legs",
      group: "Structure",
      description:
        "Three legs with crushable honeycomb struts, designed for a soft touchdown on uncertain polar terrain.",
    },
    {
      id: "antenna",
      label: "UHF & X-Band Antennas",
      group: "Communications",
      description:
        "A UHF link relayed data through Mars orbiters; an X-band dish allowed direct communication with Earth.",
    },
  ],
  viking: [
    {
      id: "body",
      label: "Hexagonal Lander Body",
      group: "Structure",
      description:
        "A 1.5 m hexagonal aluminium body containing the biological laboratory, computers and power systems.",
    },
    {
      id: "legs",
      label: "Landing Legs",
      group: "Structure",
      description:
        "Three legs with crushable aluminium honeycomb, designed to land safely on slopes and rocks without tipping.",
    },
    {
      id: "rtg",
      label: "Radioisotope Generators",
      group: "Power",
      description:
        "Two SNAP-19 RTGs inside wind covers supplied about 70 W, allowing the lander to run through Martian winters.",
    },
    {
      id: "arm",
      label: "Sampler Arm",
      group: "Manipulation",
      description:
        "A 3 m articulated boom with a scoop that delivered soil to the biology experiments and the GCMS.",
    },
    {
      id: "camera",
      label: "Facsimile Cameras",
      group: "Sensing",
      description:
        "Two cylindrical facsimile scanners built images line by line rather than using a vidicon television tube. Viking 1 returned the first successful surface photographs from Mars.",
    },
    {
      id: "antenna",
      label: "Parabolic Antenna",
      group: "Communications",
      description:
        "A steerable high-gain dish for direct-to-Earth data, supplemented by a relay link through the Viking orbiter. The displayed mount and dish are simplified.",
    },
  ],
};

/** Explicit Perseverance metadata: shares rover architecture, not Curiosity's science payload. */
export const PERSEVERANCE_COMPONENTS: ModelComponent[] = MODEL_COMPONENTS.msl.map(component => {
  switch (component.id) {
    case "mast": return { ...component, label: "Mastcam-Z & SuperCam Mast", description: "The remote sensing mast carries zoomable stereo Mastcam-Z imagers, navigation cameras and the SuperCam optical head. The displayed optics distinguish it from Curiosity's mast." };
    case "arm": return { ...component, label: "Sampling Arm & Science Turret", description: "A 2.1 m arm carries a larger turret with a coring drill, PIXL and SHERLOC/WATSON. It inspects rock and collects intact cores for sealed sample tubes; it does not feed Curiosity's powder laboratories.", spec: "Coring drill · PIXL · SHERLOC/WATSON" };
    case "wheels": return { ...component, description: "Six aluminum wheels with curved titanium spokes. Each has 48 gently curved grousers, compared with Curiosity's 24 chevron grousers. Front and rear pairs steer independently.", spec: "52.5 cm diameter · 48 grousers" };
    case "suspension": return { ...component, description: "A rocker-bogie suspension links all six wheels and lets the rover cross uneven ground while keeping wheel loads distributed." };
    case "instruments": return { ...component, label: "Sample Caching Assembly", description: "The body contains an internal sample-handling arm, bit carousel and tube storage. This cutaway-free model marks the front handling opening schematically; the internal mechanism is not shown." };
    default: return component;
  }
});

export const ROTOR_FRAGMENT_COMPONENTS: ModelComponent[] = [
  { id: "fragment", label: "Detached Blade Fragment", group: "Structure", description: "A simplified blade segment, separated from Ingenuity after the final flight. Its position, exact fracture outline and dimensions are not recovered engineering geometry." },
  { id: "layers", label: "Illustrative Internal Layers", group: "Structure", description: "A schematic edge exposing the lightweight blade's internal structure. Layer thickness and fracture detail are illustrative, not a verified damage scan." },
];

export const PETAL_CAPSULE_COMPONENTS: ModelComponent[] = [
  { id: "body", label: "Landing Capsule", group: "Structure", description: "A compact pressure capsule shown after deployment. The shell proportions are simplified and are not flight CAD." },
  { id: "petals", label: "Four Opening Petals", group: "Deployment", description: "Four hinged covers opened after touchdown to stabilise the capsule and expose its instruments. They are not conventional landing legs." },
  { id: "camera", label: "Scanning Camera", group: "Sensing", description: "A simplified scanning-camera head. Luna 9 used one panoramic television camera; Luna 13 added a second, one of which failed." },
  { id: "antenna", label: "Whip Antennas", group: "Communications", description: "Slender communications antennas deployed around the capsule. Antenna routing and camera details differ between missions." },
];

export const AIRBAG_PLATFORM_COMPONENTS: ModelComponent[] = [
  { id: "body", label: "Tetrahedral Platform", group: "Structure", description: "The central face of a tetrahedral airbag lander, shown open after touchdown. Detached airbags are separate catalogue records." },
  { id: "petals", label: "Three Opening Petals", group: "Deployment", description: "Three hinged triangular petals surround the central face, providing a route for the rover to reach the surface. No conventional landing feet or descent engine remain on this platform." },
  { id: "solar", label: "Petal Surface Panels", group: "Structure", description: "Simplified panels on the unfolded faces. Pathfinder carried solar cells here; MER platforms show structural and thermal covers instead." },
  { id: "deck", label: "Surface Operations Deck", group: "Operations", description: "Pathfinder's mast camera and instruments are shown schematically; MER platforms show the rover support interface. Final deployment angles and remaining cables differ." },
];

export const PENETRATOR_COMPONENTS: ModelComponent[] = [
  { id: "aftbody", label: "Surface Aftbody", group: "Communications", description: "The wider rear section was designed to remain near the surface, holding the batteries and Mars-orbiter radio. Its actual resting state is unknown." },
  { id: "forebody", label: "Penetrating Forebody", group: "Science", description: "A narrow forward section was designed to penetrate the soil and carry temperature and water-detection experiments. Neither Deep Space 2 probe was heard from after entry." },
  { id: "antenna", label: "Radio Antenna", group: "Communications", description: "A small radio antenna on the aftbody. The probe had no high-gain dish or landing engine." },
  { id: "cable", label: "Inter-body Cable", group: "Operations", description: "A flexible electrical connection joined the forebody and aftbody after separation on impact; shown shortened and assembled for explanation." },
];

export const TRIPOD_CAMERA_COMPONENTS: ModelComponent[] = [
  { id: "camera", label: "Camera Housing & Optics", group: "Sensing", description: "A simplified camera or telescope housing with its optical opening. Television-camera and ultraviolet-camera internals are not interchangeable and are not shown." },
  { id: "tripod", label: "Tripod Support", group: "Structure", description: "Three support legs position the instrument above the lunar surface. Exact deployment angles and attached cables are simplified." },
];

export const FOIL_COLLECTOR_COMPONENTS: ModelComponent[] = [
  { id: "mast", label: "Collector Pole", group: "Structure", description: "The pole supported the Solar Wind Composition Experiment's exposed foil during the surface stay. It carried no radio antenna." },
  { id: "foil", label: "Solar Wind Foil", group: "Science", description: "The foil trapped solar wind particles for later laboratory analysis. The astronauts rolled up and returned the exposed foil; this model depicts its operating state." },
];

export const HEAT_PROBE_COMPONENTS: ModelComponent[] = [
  { id: "support", label: "Deployment Support", group: "Structure", description: "The support that positioned InSight's 40 cm mole at the start of the penetration attempt; shown beside the shallow hole schematically." },
  { id: "probe", label: "Shallow Probe Location", group: "Science", description: "A surface hole marks the buried mole. The geometry does not display a probe standing above ground or claim that the intended 3–5 m depth was achieved." },
  { id: "tether", label: "Science Tether", group: "Science", description: "The tether connected the probe and lander and carried temperature sensors; its surface route is schematic." },
];

export const SPECIAL_MODEL_COMPONENTS: Partial<Record<NonNullable<import("./types").Asset3D["variant"]>, ModelComponent[]>> = {
  easep: [
    {id:"seismic",label:"Passive Seismic Experiment",group:"Science",description:"Apollo 11's powered seismic unit, shown separately from the passive laser reflector."},
    {id:"solar",label:"Two Solar Arrays",group:"Power",description:"Two deployable arrays and batteries powered the seismic unit. EASEP had no ALSEP radioisotope generator."},
    {id:"antenna",label:"Seismic Data Antenna",group:"Communications",description:"The seismic unit's antenna sent measurements to Earth; the reflector needed no antenna or electrical power."},
    {id:"reflector",label:"Separate Laser Reflector",group:"Science",description:"The passive 100-corner-cube reflector was deployed separately. The displayed spacing between packages is illustrative."},
  ],
  zhurong: [
    {id:"body",label:"Rover Body",group:"Structure",description:"Schematic six-wheel Zhurong chassis with simplified science housings; no Curiosity radioisotope generator."},
    {id:"wheels",label:"Six Wheels",group:"Mobility",description:"Six driven wheels and suspension links. Tread and suspension geometry are simplified."},
    {id:"solar",label:"Four Solar Wings",group:"Power",description:"Four deployed solar wings power Zhurong. This schematic captures the broad butterfly arrangement, not the exact panel outline."},
    {id:"camera",label:"Mast Cameras",group:"Sensing",description:"Mast-mounted navigation and terrain cameras; small optics and instrument heads remain schematic."},
    {id:"communications",label:"Communications Assembly",group:"Communications",description:"Simplified antenna assembly; exact radio and radar layouts are not reproduced."},
  ],
  yutu: [
    {id:"body",label:"Rover Body",group:"Structure",description:"Schematic Yutu-family warm electronics body and simplified science housings."},
    {id:"wheels",label:"Six Wheels",group:"Mobility",description:"Six driven wheels and simplified suspension links."},
    {id:"solar",label:"Two Solar Wings",group:"Power",description:"Two deployed side arrays generate electrical power. Mission-specific panel outlines and hinges remain schematic."},
    {id:"camera",label:"Camera Mast",group:"Sensing",description:"Elevated stereo camera assembly; Yutu and Yutu-2 instrument details differ."},
    {id:"communications",label:"Communications Assembly",group:"Communications",description:"Simplified antenna face; Yutu-2 communicates through the Queqiao relay rather than directly to Earth."},
  ],
  pragyan: [
    {id:"body",label:"Warm Electronics Body",group:"Structure",description:"Compact Pragyan body with simplified electronics and science housings."},
    {id:"wheels",label:"Six Wheels",group:"Mobility",description:"Six wheels on a rocker-bogie suspension, shown schematically."},
    {id:"solar",label:"Upright Solar Panel",group:"Power",description:"A hinged rectangular panel stands above the rover body in ISRO's deployed rover diagrams."},
    {id:"camera",label:"Body Navigation Cameras",group:"Sensing",description:"Stereo navigation cameras are mounted near the body rather than on a tall rover mast."},
    {id:"communications",label:"Lander Radio Antenna",group:"Communications",description:"An antenna on the solar assembly communicates with Vikram. Pragyan has no direct-to-Earth high-gain dish."},
  ],
  "clamshell-lander": [
    { id: "body", label: "Clamshell Body", group: "Structure", description: "Beagle 2's shallow circular body held its payload under folded solar panels. Shown open for explanation; the actual partial-deployment sequence remains inferred." },
    { id: "panels", label: "Four Solar Panels", group: "Power", description: "Four circular panels unfolded from the central body. The model shows the intended open arrangement rather than asserting how many panels opened on Mars." },
    { id: "payload", label: "Payload Arm & Instruments", group: "Science", description: "A schematic arm and payload interface. The instrument details and final position are simplified." },
  ],
  "slim-lander": [
    { id: "body", label: "Compact Lander Body", group: "Structure", description: "SLIM is shown tipped, matching the reported unexpected landing attitude. The contact geometry is schematic, not a recovered damage survey." },
    { id: "feet", label: "Five Crushable Landing Supports", group: "Landing gear", description: "Five energy-absorbing supports were designed for SLIM's two-step landing. Their exact crushed shapes are not reproduced." },
    { id: "engines", label: "Twin Main Engines", group: "Propulsion", description: "The two main engine locations are shown schematically. One engine nozzle was lost during descent; this operational reconstruction does not reproduce that damage." },
    { id: "solar", label: "Body Solar Panel", group: "Power", description: "Solar cells on the body had an unfavorable initial orientation after touchdown. Later sunlight allowed renewed operations." },
  ],
  "sample-lander": [
    { id: "body", label: "Descent Structure & Tanks", group: "Structure", description: "Schematic Soviet Luna sample-return descent platform and tanks. The variants' fittings, tank routing and dimensions differ." },
    { id: "legs", label: "Four Landing Legs", group: "Landing gear", description: "Four legs support the descent stage while drilling and sample ascent take place." },
    { id: "engine", label: "Descent Engine", group: "Propulsion", description: "The descent engine slowed the platform for touchdown." },
    { id: "drill", label: "Sampling Drill", group: "Science", description: "A drill collected the soil sample. The core drill length and mechanism differ between Luna 16, 20 and 24; this model marks the functional assembly schematically." },
    { id: "ascent", label: "Sample Ascent Assembly", group: "Sample return", description: "The ascent rocket and capsule are shown in the prelaunch operating state; they left the platform to carry the sample home." },
  ],
  ranger: [
    { id: "bus", label: "Hexagonal Spacecraft Bus", group: "Structure", description: "Ranger's hexagonal bus supported the camera tower and deployable systems; shown before impact, with simplified fittings." },
    { id: "cameras", label: "Television Camera Tower", group: "Science", description: "The tower housed six television cameras. Two schematic ports identify the optical assembly; the complete six-camera optical layout is not shown." },
    { id: "solar", label: "Two Solar Wings", group: "Power", description: "Two deployable wings powered the Ranger spacecraft in flight." },
    { id: "antenna", label: "High-Gain Dish", group: "Communications", description: "A dish sent the approach images to Earth. Ranger 6's television system failed; Ranger 7, 8 and 9 returned images." },
  ],
  "spherical-probe": [
    { id: "bus", label: "Spherical Pressure Vessel", group: "Structure", description: "Luna 2's spherical instrument vessel is shown before impact. Surface damage and small fittings are not recovered geometry." },
    { id: "antenna", label: "Antenna Booms", group: "Communications", description: "Slender antennas extended from the sphere. The spacecraft had no large dish or pointed penetrator." },
  ],
  "upper-stage": [
    { id: "tank", label: "Centaur Tank Structure", group: "Structure", description: "A cylindrical Centaur upper stage shown before its LCROSS impact. The tank exterior and structural bands are schematic." },
    { id: "engines", label: "Twin RL10 Engines", group: "Propulsion", description: "Two RL10 engine locations are shown at the tank base; exact plumbing and engine fittings are simplified." },
  ],
};
