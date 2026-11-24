# fourth-space

## Fourth Space: Immersive + Continuous W (0.3.0)

A standalone first-person 3D window into a genuine four-coordinate maze.

## Play on your laptop

Download this repository with **Code → Download ZIP**, unzip it, then open `index.html` (or `dist/index.html`) in a current Chrome, Edge, Firefox or Safari browser. No install, server, account or network needed. The repository also includes the original flat-map version at `classic/Fourth-Space-classic.html`.

The maze uses **room-by-room first-person navigation**, with smooth camera transitions, rather than free-flight controls. Ordinary passages have actual three-dimensional floors, ceilings, walls and doorframes. Every legal move still changes exactly one of four coordinates.

## New: continuous W slice lab

Choose **Explore continuous W** from the opening screen, or open **Expeditions → One object. Many cross-sections.** The original maze remains available. Visiting the lab keeps your current maze position, steps and history in memory; **Return to maze** restores them. Reloading still resets everything except comfort settings.

This mode is a specimen-view laboratory rather than a first-person maze. It computes an XYZ section at a continuously varying W from a **fixed four-dimensional equation**. It does not fade between unrelated scenes or animate the object itself.

- **Ball:** a 4D solid ball. Its 3D sections have radius √(2.7² − W²). Entering, growing, shrinking and leaving follow this one equation.
- **Cube:** a tesseract held at a 30° tilt in the XW plane. Each section is an exact box whose X bounds move or narrow while Y/Z stay fixed. At the extreme it touches along a square, not a point.
- **Loop:** one connected 4D solid tube around a circle in XW. A slice can show two separate pieces, then a point contact, then one joined piece. The point contact is at |W| = 1.15.

The gold **fixed XYZ probe** reports whether one chosen XYZ point belongs to the solid at your current W. It is intentionally an X-ray marker, visible through the object. Its membership comes from the equation, independently of the display mesh. Open **A fixed XYZ point** to change the point. Reference grid and axes are not part of the 4D object.

### A gentle first pass

1. Choose Ball, then **Largest**.
2. Press **+W**, pause, then press **−W**. The same W always returns the same section.
3. Use **Inspect first contact** to see the exact boundary. A labeled dot represents the zero-volume point, not a tiny physical sphere.
4. Try Cube. Watch X change while the Y/Z spans stay fixed.
5. Try Loop. **Inspect the joining point** shows why two pieces in one XYZ slice can belong to one connected object through W.

You do not need to mentally picture all four dimensions at once. Track the relations: four independent coordinates, only W changing, one static solid, and a slice that can change shape or connectivity. **Why this is 4D** and **Understand this change** provide the reasoning in the app.

### Lab controls

- Slider: select W continuously, paused.
- **−W / +W:** begin travel in that direction. **Play/Pause:** stop or resume. **Reverse:** reverse the selected direction, preserving the current play/pause state.
- Hold **Q / E**: travel in W− / W+; release to pause. **Space** or **P**: play/pause. **V**: reverse.
- Speed: Slow, Steady or Quick. The range ends stop travel automatically.
- Drag the scene to orbit; scroll to zoom. Viewpoint changes do not change the slice.
- Opening a panel, leaving the window, or hiding the tab pauses travel. It does not restart automatically.

The lab starts paused, including with reduced-motion preferences. Its explicit Play/travel controls permit motion even when maze “Instant movement” is enabled. Curved surfaces are tessellated approximations of exact boundaries; very thin necks can be hard to see. The equations, membership, bounds and reported topology are calculated directly. This is not continuous maze collision physics or evidence of a validated training effect.

## Expeditions

1. **Beyond the wall:** a six-step guided route that requires leaving W = 0 and returning.
2. **The ascending path:** an eleven-step route requiring independent travel through X, Y, Z and W.
3. **The hypermaze:** a deterministic 144-room maze, selectable/randomizable seed, unique routes and a goal requiring all four axes.
4. **The observatory:** an open 3 × 3 × 3 × 3 lattice with all eight directions available at its center.

The atlas shows exact XY maps for each Z/W slice, with fog of discovery and optional reveal. Breadcrumbs mark visited rooms. A hint names the next axis, and Retrace reverses your actual history. Completion compares your forward-step total to the shortest route, without a timer.

## Controls

- W/A/S/D or arrow keys: one room forward/left/back/right relative to the nearest compass heading.
- Drag the 3D view: look around, without cursor lock.
- J/L: turn left/right by 90 degrees.
- R/F: rise/descend through Z hatches.
- Q/E: W−/W+ where the room has a fourth-axis passage.
- M: atlas. H: next-step hint. Backspace: retrace.
- On smaller screens, equivalent touch buttons appear.
- Comfort: instant movement, floor breadcrumbs, keyboard shortcuts.

Read the bottom compass/exits line for exact axes. In the first room, take one forward step, then E (or W+). The wall ahead is sealed in W=0 but has an opening in W=1.

The top-right W− (Q) and W+ (E) buttons always show which fourth-axis directions are available. The keyboard W key means forward, not the W axis. Hints state the relevant key. You do not need to aim at, click, or step onto a pad. The glowing floor pad marks W exits. The violet hatch marks Z exits. The amber beacon is the goal. A W step does not change X, Y or Z. In rooms with several exit types, check the exit labels.

## What is and is not four-dimensional

The retained engine is a finite orthogonal 4D graph: `(x,y,z,w)` integer coordinates, legal ±1 adjacency along one axis, no wrapping or teleport links. Goal detection compares all four components. W is spatial, not time.

In the original maze mode, the renderer shows an XYZ slice at the player's W. Phase travel fades between adjacent slices; this is **an explanatory interpolation between discrete rooms**, not an exact continuous intersection of a 4D solid. Z travel uses vertical openings. The architecture is an illustration of the graph rather than a continuous collision/physics model.

This is not a recreation of any research study or a validated training intervention. The software 3D fallback uses a painter's algorithm, so complex overlapping surfaces can show minor ordering artifacts; the WebGL path uses a depth buffer.

## Privacy, compatibility and access

Everything is self-contained, including the shaders. There are no remote scripts, images, fonts, telemetry or calls. Only comfort/breadcrumb settings persist in local storage; a reload resets the current run. Keyboard preference resets each load. Storage failures are nonfatal.

WebGL is used when available. If unavailable, the game automatically uses a software 3D renderer. Large mazes can be slower without graphics acceleration; instant movement reduces motion and animation work. GPU shader/rendering and physical Safari/iPhone coverage remain unverified in this environment; see QA.md.

The layout supports phone-size browsers, but iOS attachment previews may not execute HTML. For the most reliable experience, download the repository and open the local HTML file on a laptop. GitHub’s file viewer displays source rather than running the game; a hosted gameplay site is not configured by this repository upload.

Controls have accessible labels and text feedback, but this spatial canvas does not offer full nonvisual gameplay. No accessibility-conformance claim is made.

## Source

Node.js 18+ is needed only to develop/build. No dependencies or install step.

- `npm run check`: syntax checks, 38 automated tests, standalone build.
- `npm test`: engine, navigation, geometry and fallback checks.
- `npm run build`: inline all source into `dist/index.html` and the identical root `index.html`.
- `src/engine.js`: original pure 4D graph and levels.
- `src/nav.js`: view-relative cardinal movement and coordinate mapping.
- `src/render.js`: WebGL and software perspective rendering.
- `src/app.js`: maze UI, movement, atlas, progression, settings.
- `src/continuous.js`: fixed 4D solids, exact slice parameters and probe membership.
- `src/lab.js`: continuous-W transport, specimen view, readouts and guidance.
- `src/styles.css`, `src/index.html`: responsive interface.

No open-source license has been selected. Public source availability does not itself grant a license to reuse the code.
