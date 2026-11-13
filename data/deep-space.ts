export interface DeepSpaceChapter {
  id: string;
  title: string;
  body: string;
}

export interface DeepSpaceProbe {
  id: string;
  name: string;
  launched: string;
  active: boolean;
  status: string;
  location: string;
  note: string;
  hardware: string;
  discovery: string;
  ending: string;
  sourceUrl: string;
  sources?: readonly { label: string; url: string }[];
  chapters: readonly DeepSpaceChapter[];
}

type MissionRecord = Omit<DeepSpaceProbe, "chapters">;

/** Historical locations and mission states, rather than a live position feed. */
const MISSIONS: readonly MissionRecord[] = [
  {
    id: "voyager-1",
    name: "Voyager 1",
    launched: "5 September 1977",
    active: true,
    status: "Operating · extended interstellar mission",
    location: "Interstellar space · beyond the heliopause since August 2012",
    note: "Voyager 1 flew past Jupiter in 1979 and Saturn in 1980. Its encounter with Saturn's moon Titan sent it out of the plane of the planets. The spacecraft later became the first to cross the heliopause, the boundary of the Sun's protective bubble of particles and magnetic fields.",
    hardware: "Radioisotope thermoelectric generators turn heat from radioactive decay into electricity far from the Sun. A large dish keeps contact with Earth through the Deep Space Network. Cameras documented its planetary flybys; particle, plasma-wave and magnetic-field instruments helped investigate the space beyond them. A Golden Record travels on the spacecraft.",
    discovery: "Voyager 1's Jupiter encounter revealed active volcanoes on Io, showing that a moon could be geologically alive. Its instruments later detected the change in the surrounding particle environment that helped establish the crossing into interstellar space. Interstellar space here means beyond the heliosphere, not beyond every object gravitationally bound to the Sun.",
    ending: "NASA continues the mission while conserving its declining electrical power. Systems and individual science instruments are being switched off to extend operations. When communication eventually ends, Voyager 1 will keep travelling on its outward trajectory with the Golden Record aboard; an exact end date is not promised.",
    sourceUrl: "https://science.nasa.gov/mission/voyager/",
  },
  {
    id: "voyager-2",
    name: "Voyager 2",
    launched: "20 August 1977",
    active: true,
    status: "Operating · extended interstellar mission",
    location: "Interstellar space · beyond the heliopause since November 2018",
    note: "Launched before Voyager 1, Voyager 2 followed a different route. Gravity assists carried it past Jupiter, Saturn, Uranus and Neptune. It remains the only spacecraft to have visited all four giant planets, and it crossed the heliopause in November 2018.",
    hardware: "Its radioisotope power supply and communications dish supported a journey too far from the Sun for ordinary solar-powered operations. Imaging, infrared and ultraviolet instruments studied the planets and moons. Particle, plasma and magnetic-field measurements then turned the spacecraft into an observer of the heliosphere's boundary.",
    discovery: "Voyager 2 supplied humanity's first close views of Uranus and Neptune. It found new moons and examined their rings, weather and unusual magnetic fields. Images of Neptune's moon Triton revealed active geyser-like plumes. Its later boundary crossing let scientists compare the heliopause in a different direction from Voyager 1.",
    ending: "Voyager 2 is still an operating mission, with power conservation extending the time available for science. Its supply of electrical power declines as the radioisotope generators age. The spacecraft will continue outward after its final transmission, carrying the same Golden Record message as its twin.",
    sourceUrl: "https://science.nasa.gov/mission/voyager/",
  },
  {
    id: "new-horizons",
    name: "New Horizons",
    launched: "19 January 2006",
    active: true,
    status: "Operating · extended outer solar system mission",
    location: "Kuiper Belt exploration · travelling outward within the heliosphere",
    note: "New Horizons used a Jupiter gravity assist on its way to Pluto. It flew past Pluto and its moons on 14 July 2015, then continued to the Kuiper Belt object Arrokoth on 1 January 2019. These were flybys: it did not land or enter orbit at either target.",
    hardware: "A radioisotope thermoelectric generator supplies electricity. The LORRI telescope takes detailed images, Ralph observes visible and infrared light, and Alice studies ultraviolet light. Other instruments measure particles and dust. The spacecraft stores encounter data and transmits it to Earth over the long radio link after a fast flyby.",
    discovery: "Its images showed Pluto's mountains of water ice and the vast nitrogen-ice glacier Sputnik Planitia, revealing a world with a complex geological history. Arrokoth's two joined lobes provided evidence about how small bodies formed in the early solar system. A distant point of light became a place whose shape and surface could be studied.",
    ending: "NASA lists New Horizons as an active mission. It continues travelling outward and studying the environment of the outer solar system, with hibernation used between periods of activity. It has not made a confirmed heliopause crossing. Its completed flybys and continuing science should be distinguished from the retired spacecraft in this archive.",
    sourceUrl: "https://science.nasa.gov/mission/new-horizons/",
  },
  {
    id: "pioneer-10",
    name: "Pioneer 10",
    launched: "2 March 1972",
    active: false,
    status: "Retired · last signal received 23 January 2003",
    location: "Outbound solar escape trajectory · no current telemetry",
    note: "Pioneer 10 became the first spacecraft to cross the main asteroid belt and fly past Jupiter. Its December 1973 encounter tested whether a spacecraft could survive the giant planet's intense radiation environment. Designed for a 21-month mission, it remained in contact for more than 30 years.",
    hardware: "Radioisotope generators supplied electrical power and a high-gain antenna sent measurements home. Its imaging photopolarimeter scanned Jupiter while instruments measured radiation, magnetic fields, plasma and dust. An engraved plaque depicts humans and describes the spacecraft's origin for any future finder.",
    discovery: "Pioneer 10 made the first close measurements of Jupiter's atmosphere and magnetic environment, preparing the way for later missions. The asteroid-belt crossing demonstrated that passage through that region was feasible. Continuing measurements on its outward path extended the science far beyond the original Jupiter flyby.",
    ending: "Routine contact ended in 1997. The last telemetry arrived in April 2002 and the last detectable signal on 23 January 2003. Declining radioisotope power left too little electricity for the transmitter. Pioneer 10 continues on an escape trajectory, but without measurements a heliopause crossing and a current distance cannot be confirmed here.",
    sourceUrl: "https://science.nasa.gov/mission/pioneer-10/",
  },
  {
    id: "pioneer-11",
    name: "Pioneer 11",
    launched: "6 April 1973",
    active: false,
    status: "Retired · mission ended in 1995",
    location: "Outbound solar escape trajectory · no current telemetry",
    note: "Pioneer 11 followed its sister spacecraft through the asteroid belt and past Jupiter. Jupiter's gravity redirected it towards Saturn, where it made the first close flyby on 1 September 1979. The spacecraft carried a second Pioneer plaque and continued outward after its planetary encounters.",
    hardware: "Like Pioneer 10, it used radioisotope electrical power, a dish antenna and instruments for imaging, radiation, plasma, magnetic fields and dust. Its path through Saturn's environment let scientists assess hazards that later travellers would face. The spacecraft's instruments could sample a region that telescopes could only observe from far away.",
    discovery: "Pioneer 11 investigated Saturn's rings and magnetic field at close range and detected the planet's narrow F ring and a new satellite. Its journey showed that a spacecraft could reach Saturn safely and helped prepare the route for Voyager. The Jupiter flyby also provided a view from above the planet's polar regions.",
    ending: "NASA Ames made its last routine contact on 30 September 1995. A few minutes of engineering data were received on 24 November 1995 before contact was lost again. Pioneer 11 has continued on its outward escape trajectory since then. Its silence prevents a measured confirmation of any heliopause crossing.",
    sourceUrl: "https://science.nasa.gov/mission/pioneer-11/",
  },
  {
    id: "dawn",
    name: "Dawn",
    launched: "27 September 2007",
    active: false,
    status: "Retired · mission concluded 1 November 2018",
    location: "Orbit around dwarf planet Ceres · main asteroid belt",
    note: "Dawn explored two different worlds in the main asteroid belt between Mars and Jupiter. It orbited Vesta from 2011 to 2012, departed, and entered orbit around Ceres in March 2015. The mission was the first to orbit two different extraterrestrial bodies during one journey.",
    hardware: "Solar arrays powered ion engines that accelerated charged xenon atoms, providing a small but sustained push for thousands of days. That efficiency made the move from Vesta orbit to Ceres orbit possible. Framing cameras, a visible-and-infrared spectrometer and a gamma-ray and neutron detector mapped the worlds and investigated their composition.",
    discovery: "Vesta and Ceres preserved different chapters of solar system history. Dawn mapped Vesta's giant impact basins and investigated its rocky structure. At Ceres, bright deposits proved to include carbonates and other salts; water-related minerals and evidence of subsurface ice revealed a world shaped by water and geological activity.",
    ending: "Dawn depleted its hydrazine on 31 October 2018, and NASA announced the mission's conclusion on 1 November. Hydrazine controlled its orientation: without it, Dawn could no longer reliably point its solar arrays at the Sun or its antenna at Earth. It was left in orbit around Ceres rather than deliberately crashed onto a world of scientific interest.",
    sourceUrl: "https://science.nasa.gov/mission/dawn/",
    sources: [
      { label: "NASA · ion propulsion", url: "https://science.nasa.gov/mission/dawn/technology/ion-propulsion/" },
      { label: "NASA · science at Ceres", url: "https://science.nasa.gov/mission/dawn/science/ceres/" },
      { label: "NASA · mission ending", url: "https://science.nasa.gov/mission/dawn/mission-status/" },
    ],
  },
  {
    id: "near-shoemaker",
    name: "NEAR Shoemaker",
    launched: "17 February 1996",
    active: false,
    status: "Retired · last contact 28 February 2001",
    location: "Surface of asteroid 433 Eros · a near-Earth asteroid",
    note: "The Near Earth Asteroid Rendezvous spacecraft flew past asteroid Mathilde before reaching Eros. An aborted engine burn delayed its planned rendezvous, but the team recovered the mission. On 14 February 2000 it became the first spacecraft to orbit an asteroid; a year later it became the first to land on one.",
    hardware: "Solar panels powered a multispectral camera, infrared spectrometer, X-ray and gamma-ray spectrometer, laser rangefinder and magnetometer. Radio tracking helped measure the asteroid's gravity. Combining surface images with composition and gravity measurements let scientists investigate both the outside and the inside of a small world.",
    discovery: "NEAR mapped Eros' craters, ridges and boulders, studied its composition and found no detectable magnetic field. Its slow descent returned detailed pictures of the surface. The spacecraft was built as an orbiter, yet it survived the 12 February 2001 touchdown and continued sending data, including gamma-ray measurements, for about two weeks.",
    ending: "The final contact came on 28 February 2001. A later attempt to reach the spacecraft was unsuccessful. NEAR Shoemaker remains on the surface of Eros: its story ends with an unexpected landing, not a journey towards interstellar space. NASA named the mission for geologist Eugene M. Shoemaker.",
    sourceUrl: "https://science.nasa.gov/mission/near-shoemaker/",
  },
  {
    id: "kepler",
    name: "Kepler",
    launched: "7 March 2009 UTC · 6 March at the launch site",
    active: false,
    status: "Retired · 30 October 2018",
    location: "Earth-trailing heliocentric orbit · circling the Sun",
    note: "Kepler searched for planets around other stars while orbiting our own Sun behind Earth. It watched a field of stars for tiny, repeated changes in brightness. Unlike a planetary probe, it did not travel to the worlds it discovered: the evidence arrived as starlight at its telescope.",
    hardware: "A specially designed telescope and detector array measured stellar brightness with extraordinary precision. Reaction wheels held its aim. After two wheels failed, engineers balanced the pressure of sunlight with the remaining wheels and thrusters, enabling a second observing mission called K2.",
    discovery: "When a planet crosses in front of its star, the star's measured brightness briefly dips. Repeated transits can reveal a planet's size relative to the star and how long it takes to orbit. Kepler and K2 showed that planets are widespread in our galaxy; their archived observations continue to support planet discoveries and studies of stars.",
    ending: "Kepler ran out of fuel needed for further science operations. NASA retired it on 30 October 2018 in a safe orbit away from Earth. The telescope remains in an Earth-trailing orbit around the Sun, while its data remain available to researchers. The spacecraft's retirement did not end the scientific life of its observations.",
    sourceUrl: "https://science.nasa.gov/mission/kepler/",
    sources: [
      { label: "NASA · mission chronology and launch time", url: "https://science.nasa.gov/mission/kepler/in-depth/" },
    ],
  },
];

export const DEEP_SPACE = {
  id: "deepspace",
  name: "Deep Space",
  subtitle: "From asteroid explorers to interstellar messengers",
  intro: "Beyond the Moon and Mars, spacecraft have mapped asteroids, unveiled Pluto and searched the light of distant stars. Some still send science home. Others rest on a surface, circle another world, or travel silently outward. Their hardware, discoveries and endings tell different stories.",
  statusAsOf: "13 November 2026",
  probes: MISSIONS.map((mission): DeepSpaceProbe => ({
    ...mission,
    chapters: [
      { id: "journey", title: "The journey", body: mission.note },
      { id: "hardware", title: "How it worked", body: mission.hardware },
      { id: "discovery", title: "What it found", body: mission.discovery },
      { id: "ending", title: mission.active ? "The continuing mission" : "Where it remains", body: mission.ending },
    ],
  })),
} as const;
