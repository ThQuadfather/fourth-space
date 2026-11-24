# Verification: November 9, 2026

## Passed

- JavaScript syntax checks; complete standalone build.
- All 17 Node tests: 11 original engine regressions plus 6 navigation/renderer tests.
- Original engine coverage includes 100 generated seeds; connectivity, exact four-coordinate goals, all-axis routes, no illegal/diagonal/wrapped moves, W independence, and deterministic generation.
- New coverage: view-relative cardinal controls across many camera angles, XYZ/W mapping, bounded camera easing, finite geometry in every slice of all experiences, software near-plane clipping at multiple angles/positions, no network dependencies.
- Chrome browser UI through the supported preview: desktop landing and actual 3D rendering using the software fallback.
- Completed both guided levels through keyboard input, in exactly 6 and 11 forward steps.
- Confirmed independent Z and W movement in the open observatory.
- Seed randomization, hypermaze launch, hints, atlas reveal, modal dismissal and return to gameplay.
- 390 × 844 phone-sized frame visual inspection and touch forward/W controls; 390 × 700 frame testing of touch movement, W shifts, retrace, hint and atlas open/close. These are size simulations, not physical-phone tests.
- Comfort instant-movement toggle persisted through reload; animated forward motion checked before enabling it.
- Fixed an opposite-direction rounding-boundary bug found by new tests.
- Final software rendering has no application errors observed. Browser extension metadata errors were unrelated to the game.

## Limits

- Cloud Chrome does not expose WebGL here. Its absence was verified and prompted implementation/testing of the automatic software renderer. Hardware WebGL shader linking/rendering was not browser-tested. Shader varying precision was explicitly matched in final source.
- No physical iPhone, Safari, Firefox or Edge test; no physical touchscreen or device-performance benchmark.
- Software rendering sorts polygons by depth and can have minor ordering artifacts in complex overlap. It remains genuinely perspective 3D.
- No file:// browser run in the restricted preview environment; the bundle has no fetch/module imports or remote resources and is structurally self-contained.
- No backend or telemetry. Browser testing was local; no hosted deployment was tested.

## November 11, 2026: direction-feedback fix (0.2.1)

- A rejected W− attempt could show the misleading generic message “No W passage in this room” even when W+ was available.
- Fixed feedback to distinguish a blocked direction from absence of all W exits. Added always-visible W direction buttons, keyboard labels, no-aiming cue and explicit key hints.
- Added regression tests for W round trips, identical pad geometry before/after return, opposite exits and blocked-sign feedback. All 19 tests pass.
- Browser-tested W+ then W− return, rejected W− at the original coordinate, hint reporting E, new W+ button working, and continuing to complete the first lesson. Checked new buttons at 390 × 700 phone size.
- No topology/maze engine or renderer changes were needed. Earlier GPU/device verification limits remain.


## November 11, 2026: continuous W lab (0.3.0)

### Passed

- Full `npm run check`: all source syntax checks, 38 Node tests, standalone build.
- Eight new geometry tests: exact 4D-ball sections and analytic volumes, support and dimension-correct tangencies, rotated-tesseract inequalities, 4D-loop connectivity changes, independent numerical checks of analytic loop volume, exact probe membership, finite valid meshes and deterministic reversibility.
- Independent read-only mathematics review checked the fixed equations, topology, manifold edge counts, face orientation, camera mapping and explanatory claims. No core mathematical error found.
- Ten controller tests: paused entry, travel speed, reverse, frame-gap cap, endpoint stopping, slider/scene/modal pauses, blur/tab-hide pause, held-key release, probe input bounds, point glyphs, preserved lab position on re-entry, invalid-input rejection.
- Continuous renderer tested in software across all specimens, all support boundaries, empty slices and several camera angles. All geometry and projections remained finite.
- New scripts included in the offline/no-network dependency checks.
- Browser UI through the supported local preview: all three specimens, continuous W travel, pause, reverse travel, held E/release, endpoint stop, exact ball-point contact, cube-square contact, loop joining point, field-guide opening during travel, and editable XYZ probe with bounds synchronization.
- Desktop visual inspection plus 390 × 700 and 390 × 844 simulated phone layouts. Phone controls tested for specimen changes, joining-point jump, W travel/pause, probe disclosure and numeric input.
- Maze visit → lab → maze preserved XYZ/W, step count and room history. Both guided mazes completed again in exactly 6 and 11 forward steps with instant movement enabled.
- Fixed two independent-review findings: zero-dimensional contacts now get a clearly labeled display point instead of looking empty, and out-of-range probe inputs stay synchronized with the point actually tested.

### Limits and scope

- Actual browser QA used the existing software fallback. Hardware WebGL and physical Safari/iPhone/Android coverage remain unverified. No cross-browser certification or frame-rate benchmark.
- Local file URL navigation was unavailable in the test browser; the supported static HTTP preview was used. The output remains one inline HTML file with no imports, dependencies or network requests.
- Curved sections are rendered as polygon meshes. Topology and membership come from exact equations, while tiny necks and near-contact shapes have finite display resolution. Software rendering uses depth-sorted faces, so close or intersecting views can have ordering artifacts.
- Play scans a spatial coordinate of a static solid. W is not time. The lab is an orbitable specimen view, not collision-based free movement through a continuous 4D maze.
- No public hosting, account, telemetry or new persistent storage was added to the game.

## Repository upload verification: November 11, 2026

- Upload package is version 0.3.0, including continuous W and the direction-feedback fix.
- Re-ran syntax checks, all 38 tests and the standalone build successfully.
- Generated root and dist HTML match the latest standalone attachment byte for byte.
- No additional browser or device coverage is claimed beyond the checks recorded above.


## Public-copy preparation: November 17, 2026

- This separate v0.3.0 copy removes the personalized landing dedication and private character joke.
- Both standalone HTML outputs were rebuilt from sanitized source. Game logic, geometry, tests and the classic archive are unchanged.
- Syntax checks, all 38 tests and the build passed again. No new browser/device verification is claimed.
- Text scan found no personal names, email addresses, user-specific URLs, service IDs or local workspace paths.
- This copy has not been uploaded or published. Earlier byte-for-byte attachment equivalence applies to the original release, not this sanitized copy.
