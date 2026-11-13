# Root Expedition Asset Sources

This manifest covers assets isolated to the root guided introduction. The new scene loads only the models and textures required by its active stage. NASA and USGS are credited as the source agencies; AFTERLIGHT is not affiliated with or endorsed by NASA.

NASA imagery and model files are subject to the notices on their individual source pages. NASA's media guidance asks users to avoid implying endorsement and to respect third-party copyright notices. Verify the live source-page notice before redistribution outside this project.

## 3D models

| Local file | Source / creator | Usage and attribution | Format / size | Processing |
|---|---|---|---:|---|
| `models/moon/apollo-lunar-module.glb` | [NASA Apollo Lunar Module 3D resource](https://science.nasa.gov/3d-resources/apollo-lunar-module/); model credit: Michael D. Carbajal | NASA source page; retain the creator credit. See NASA's [media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). No NASA endorsement is implied. | GLB, 716,840 bytes | Original downloaded model. Draco decoder supplied locally because the GLB uses `KHR_draco_mesh_compression`; model geometry was not recreated. |
| `models/mars/perseverance.glb` | [NASA/JPL-Caltech Perseverance rover 3D model](https://science.nasa.gov/resource/mars-perseverance-rover-3d-model/) | Credit NASA/JPL-Caltech; source-page terms and any embedded third-party notices apply. | GLB, 11,687,880 bytes | Original downloaded model; normalized at runtime for root-scene placement. |
| `models/mars/perseverance.draco.glb` | Derived from the NASA/JPL-Caltech model above | Credit NASA/JPL-Caltech; source-page terms and any embedded third-party notices apply. | GLB, 3,876,448 bytes | Draco geometry compression with glTF Transform 4.5.1; mesh simplification, joining, flattening, and texture recompression disabled. Original retained alongside it. |
| `models/mars/curiosity.glb` | [NASA Curiosity rover 3D model](https://science.nasa.gov/resource/curiosity-3d-model/); NASA Visualization Technology Applications and Development (VTAD) | Credit NASA and VTAD as indicated by the source. | GLB, 11,860,016 bytes | Original downloaded model; normalized at runtime for root-scene placement. |
| `models/mars/curiosity.draco.glb` | Derived from the NASA/VTAD model above | Credit NASA and VTAD as indicated by the source. | GLB, 6,669,420 bytes | Draco geometry compression with mesh simplification, joining, flattening, and texture recompression disabled. Original retained alongside it. |
| `models/mars/ingenuity.glb` | [NASA/JPL-Caltech Ingenuity helicopter 3D model](https://science.nasa.gov/resource/mars-ingenuity-helicopter-3d-model/) | Credit NASA/JPL-Caltech; source-page terms and any embedded third-party notices apply. | GLB, 1,809,044 bytes | Original downloaded model; normalized at runtime for root-scene placement. |

## Planetary imagery and elevation

| Local file | Source / creator | Format / size | Processing |
|---|---|---:|---|
| `textures/moon/lroc-color-4k.webp` | [NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), made from Lunar Reconnaissance Orbiter Camera (LROC) data | WebP, 4096 × 2048, 1,761,958 bytes; source TIFF was 13,095,388 bytes | Equirectangular LROC color mosaic converted from TIFF to WebP for the root scene. NASA SVS describes this as a global lunar map derived from LROC observations. |
| `terrain/moon/lola-height-2k.png` | [NASA SVS CGI Moon Kit](https://svs.gsfc.nasa.gov/4720/), Lunar Orbiter Laser Altimeter (LOLA) elevation data | PNG, 2048 × 1024, 1,172,436 bytes | Resampled from the 16-pixel-per-degree LOLA global elevation TIFF (33,201,026 bytes) for sphere displacement and bump detail. |
| `terrain/moon/apollo-11-lola-height.png` | Same NASA SVS / LOLA global elevation source | PNG, 512 × 512, 6,123 bytes | Region cropped around Apollo 11 landing coordinates from the global 16-pixel-per-degree elevation raster, then normalized for local terrain displacement. It represents broad surface relief; it is not a meter-scale landing-site DEM. |
| `textures/mars/mars-global-2k.webp` | [NASA Mars 3D resource](https://science.nasa.gov/3d-resources/mars/); NASA/JPL-Caltech, based on Viking image maps processed at USGS | WebP, 1440 × 720, 240,968 bytes; source TIFF was 3,137,136 bytes | Source color map converted to WebP. Its downloaded source raster is 1440 × 720 (the filename retains the requested project naming convention). |
| `terrain/mars/jezero-hirise-dtm-1m-1024.png` | [USGS Astrogeology Jezero HiRISE DTM product](https://astrogeology.usgs.gov/search/map/mars-sample-return-terrain-relative-navigation-hirise-dtm-mosaic), NASA HiRISE data | PNG, 1024 × 1024, 277,419 bytes | Windowed crop of the 1 m/pixel Jezero DTM source, converted to an 8-bit grayscale height image for WebGL terrain displacement. Height range in the sampled crop: −2572.037 m to −2565.356 m. The source product is much larger than the local crop. |
| `terrain/mars/jezero-hirise-dtm-1m.png` | Same USGS/NASA Jezero DTM | PNG, 256 × 256, 37,942 bytes | Lower-resolution crop retained as a compact source derivative; the root environment uses the 1024-pixel crop. |
| `terrain/mars/jezero-hirise-ortho-25cm.webp` | Same USGS/NASA Jezero HiRISE orthomosaic; product DOI [10.5066/P9REJ9JN](https://doi.org/10.5066/P9REJ9JN) | WebP, 1024 × 1024, 197,502 bytes | A 25 cm/pixel panchromatic orthomosaic crop was windowed, converted to a warm Mars-toned visualization, and saved as WebP for local terrain color. It is not a natural-color image. |
| `textures/earth/earth.jpg` | [Solar System Scope textures](https://www.solarsystemscope.com/textures/), [2K Earth day map](https://www.solarsystemscope.com/textures/download/2k_earth_daymap.jpg), CC BY 4.0 | JPEG, 2048 × 1024 | Downloaded unchanged on 13 November 2026 to replace the earlier asset of unrecorded provenance. Credit Solar System Scope; this is a rendered global texture, not a single NASA photograph. |

## Runtime support

| Local file | Source / license | Purpose |
|---|---|---|
| `draco/gltf/draco_decoder.js`, `draco/gltf/draco_decoder.wasm`, `draco/gltf/draco_wasm_wrapper.js` | Google Draco decoder distributed with the project's installed Three.js dependencies; MIT license copy in `draco/THREE-LICENSE.txt` | Local decoder for the official Apollo GLB. Avoids an external decoder download at runtime. |

## Source pages and usage notes

- NASA 3D resource library: <https://science.nasa.gov/3d-resources/>.
- NASA imagery/model media guidance: <https://www.nasa.gov/nasa-brand-center/images-and-media/>.
- NASA LROC/LOLA Moon texture source: <https://svs.gsfc.nasa.gov/4720/>.
- USGS HiRISE Jezero DTM and orthomosaic source: <https://astrogeology.usgs.gov/search/map/mars-sample-return-terrain-relative-navigation-hirise-dtm-mosaic>.
- Source asset pages and product metadata remain authoritative for creator credit, reuse terms, and third-party materials. Keep those credits with any redistributed copies.
