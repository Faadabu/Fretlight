# Fretlight

A local, beginner acoustic-guitar learning web app. Built from scratch with procedural Three.js guitar and hand geometry, vanilla JavaScript, Vite, Web Audio, and PDF.js. No API key, subscription, account, or uploaded music is required.

## Start

Double-click **Start Fretlight.cmd** inside this folder, or **Fretlight.cmd** on the Desktop. This starts a hidden local Node server and opens http://127.0.0.1:47831. Node.js must remain installed. The packaged build runs without an internet connection. Progress is stored per browser and URL, so use the launcher consistently.

## Learn and practise

- **Practice studio:** play/pause, 25–125% speed, metronome, timeline seeking, one-bar back/forward, and A–B loops. A and B are zero-based beat positions, not seconds. To practise a passage, seek to its beginning, choose Set here for A, seek to its end, choose Set here for B, and enable Loop.
- **Learning path:** 28 days of beginner exercises. Completion is self-reported; the app does not listen to your real guitar or grade your playing. Use a separate tuner to tune your instrument. Save a practice reflection in the journal.
- **Songs & genres:** ten short exercises/melodies, including the simplified Ode to Joy opening and original chord studies. Folk, blues-inspired straight-time, country, and waltz rhythm demonstrations are included. This is a starter curriculum, not a commercial song catalogue.
- **Music theory:** pitch, intervals, scales, triads, chord progressions, rhythm, and practice concepts illustrated through guitar positions.
- **Fretboard explorer:** hear individual notes, highlight scales, and practise note-location questions.
- **Settings:** hand opacity, default speed, and progress export.

String 1 is the thin high E; string 6 is low E. Fretting fingers: 1 index, 2 middle, 3 ring, 4 little finger; 0 means an open string. The model supports standard tuning and a right-handed setup.

## Sheet import and its current limits

PDF and photo files are decoded locally. PDFs have page navigation. Experimental optical recognition handles only clear, horizontal, printed five-line treble staves and basic filled notehead candidates. It assumes guitar notation sounds an octave below written pitch. It does **not** reliably read complete scores: rhythm, rests, key signatures, accidentals, chords, ties, clef changes, handwritten notation, and photographic skew are not understood. Recognized notes are uniform quarter-note drafts, and false positives/missed notes remain possible. Review every note and duration against the source before playback. Pages are processed individually; drafts are not automatically combined across pages.

Editable notation and uncompressed MusicXML are also accepted. MusicXML uses the first part, supports divisions, chords, rests, backup/forward voice timing, technical string/fret/finger fields, and explicit chromatic/octave transpose. Repeats, ties, expressive articulations, tempo changes, and compressed MXL are not implemented. Unspecified string/fret placements are suggestions and can require manual correction. Without a transpose declaration or technical string/fret data, MusicXML pitches are treated as written and the app warns about guitar's octave convention.

Notation format (beats start at zero; durations are in quarter-note beats):

```text
# beat duration string:fret:finger ... direction
0 1 6:0 down
1 1 5:2:2 down
2 1 4:2:3 up
3 1
4 4 6:0 5:2:2 4:2:3 3:0 2:0 1:0 down
```

A line with no notes is a rest. Multiple notes on a line form a chord. ASCII tablature is interpreted on a uniform eighth-note column grid, which must be corrected if its spacing is not rhythmic. Save edited notation before leaving or refreshing the page.

The transparent hands are simplified articulated teaching models. Fingertip targets match the supplied positions for basic shapes, but complex barres, stretches, fingerstyle digit assignments, bends, slides, and lifelike hand biomechanics are not fully simulated. Generated plucked-string audio is synthetic, not recorded acoustic samples. Playback speed changes timing without transposing notes. The timeline seeks backward; it does not play audio in reverse.

## Development

```text
npm install
npm run dev
npm test
npm run build
```

The launcher serves `dist`, so rebuild after source edits. The development server uses port 5173; the launcher uses 47831 and listens only on loopback. The hidden launcher server remains running until Windows exits or its Node process is stopped.

## Validation

26 Node tests cover tuning, tab parsing, invalid chords, lesson references, Ode to Joy timing/pitches, MusicXML transpose/voices/rests, synthetic optical recognition, playback speed, loop wrap, and simultaneous voices. The production build passes. Dependency audit reported zero vulnerabilities after updating PDF.js to 6.2.108 or newer.

Chrome checks confirmed the studio and 3D model render, Play changes to Pause, theory navigation, and review-gated editable notation reaching the player. Browser automation became intermittent afterward, so full interactive coverage, actual audio quality, PDF/photo upload end-to-end, and responsive visual QA remain unverified. Synthetic image tests do not establish real-world score recognition accuracy.

Official references consulted: [Three.js WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer), [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html), [MusicXML technical fingering](https://www.w3.org/2021/06/musicxml40/musicxml-reference/elements/fingering/), [PDF.js](https://github.com/mozilla/pdf.js), and [Web Audio](https://www.w3.org/TR/webaudio-1.0/).

## Reference-based 3D revision

The fretting view now follows the supplied photo orientation: body left, neck rising to the right, bass string 6 above treble string 1. Four presets provide fretting close-up, full guitar, player-eye angle, and picking-hand detail. There are visible string numbers, active-string highlights, fingertip labels, and an on-stage opacity slider. Solid skin is the default for new settings; reduce opacity to see strings through the hand.

The meshes now have continuous tapered fingers, curved knuckles, nails, an attached thumb behind the neck, a forearm, and a thumb/index plectrum grip. The instrument has a soundhole cut through the soundboard, wood grain, binding, a rounded bridge, six tuners, and different string gauges. Materials use physical lighting, reflections, and shadows. These are enhanced procedural teaching models, not photogrammetric or fully photoreal human scans. Advanced barres and finger collisions can still require refinement.

Posture references: [Fender fretting guidance](https://www.fender.com/articles/techniques/play-guitar-left-handed), [JustinGuitar Positive Finger Placement](https://www.justinguitar.com/guitar-lessons/positive-finger-placement-b1-103), and the user-supplied hand photographs.

## Jointed finger correction

The fretting hand uses three-bone SkinnedMesh fingers and an analytic two-link reach solver plus a distal fingertip joint. Actual skinned fingertip vertices are checked against the guitar strings in the Am/Em regression test. Playback interpolates joints; paused seeks set the target immediately. Both forearms have been removed. The teaching view is closer and oblique to expose finger curvature. Initial and selected songs now use a common fingering planner with common chord shapes and stable melodic hand positions. The planner is heuristic, not a biomechanical optimizer; unusual stretches, barres and overlapping polyphony still need review. These remain procedural teaching hands, not photoreal scans.

Architecture reference: https://threejs.org/docs/pages/SkinnedMesh.html and https://threejs.org/docs/pages/Skeleton.html . Chord reference: https://www.fender.com/articles/chords/how-to-read-a-chord-chart .

## Chord study and contact checks

The studio now includes a Study a chord selector for C, G, D, Am, Em, E, A, Dm, F and Bm. Wide chord poses share a reachable palm position; barre fingers use the continuous straight skeletal finger across the string span. Picking positions are calculated from the actual transformed plectrum tip. 35 tests pass, including all common chord fingertip targets, F barre surface proximity on strings 1/2/6, and up/down pick contacts with a mirrored/rotated guitar parent. The F shape was also visually checked in the production browser. This does not establish collision-free anatomy for every imported score. Transform reference: https://threejs.org/docs/pages/Object3D.html .
