# Cave reference

Primary reference: Joshua’s attached cave-diving photograph (DF6FCEE3-901C-4756-BC22-B873EAE9A2A8). The image shows a low limestone roof, dense irregular formations, a narrow dark passage and a continuous guideline. The image itself is not shipped or used as a scene texture.

The procedural scene follows those features, with a diver facing into the passage and swimming a slow continuous circuit with paired frog kicks and glide phases. The camera tracks alongside at a steady distance, keeping the diver horizontal in view. Two sidemount tanks sit beside the torso; exhalation packets rise from the regulator in world space. The guideline runs from the near entrance into the passage. Orange directional markers point along the line toward the entrance (+Z), opposite the initial inward swimming direction.

Marker reference: [TDI directional and non-directional markers](https://www.tdisdi.com/tdi-diver-news/cave-diving-directional-and-non-directional-markers-101/). This is a visual scene, not a surveyed cave route or navigation resource.

Earlier art references were the visible previews of Kin Ha and Tajma Ha videos. The supplied photograph now takes precedence. No third-party footage is shipped. The fallback poster is a render of the mesh scene.

## Surface material and geometry revision

Photographic color, height and roughness maps come from [Rock Face 03, Poly Haven](https://polyhaven.com/a/rock_face_03), licensed CC0. They are projected onto the 3D surfaces from three axes to avoid stretched UVs. Source, license and SHA-256 hashes are kept beside the local files in public/assets/materials/. No external image request is made by the site.

Formation displacement is proportional to radius, preventing inverted, blade-like shapes. A continuous roof and annular side-wall topology connect to an actual branching tunnel. Rock shadow artifacts were removed; directional fill, a distant passage light and a restrained volumetric torch provide depth. The diver has a shaped torso, harness, brushed-metal tanks, valves, gloves, knee pads and shaped fins.
