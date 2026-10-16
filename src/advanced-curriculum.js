// Additive curriculum expansion for Fretlight. All studies are original
// exercises; none are transcriptions or replicas of recorded songs.

const note = (string, fret, finger) => ({ string, fret, finger: finger ?? (fret === 0 ? 0 : Math.min(4, fret)) });
const ev = (beat, notes, direction = beat % 2 ? 'up' : 'down', label = '', duration = 1) => ({
  beat, duration, notes: Array.isArray(notes) ? notes : [notes], direction, label
});

const melody = (id, title, genre, description, bpm, pattern) => ({
  id, title, genre,
  description: description.startsWith('Original') ? description : `Original study: ${description}`,
  bpm,
  events: pattern.map((notes, beat) => ev(beat, notes, beat % 2 ? 'up' : 'down', `${beat + 1}`))
});
const timedMelody = (id, title, genre, description, bpm, pattern) => ({
  id, title, genre,
  description: description.startsWith('Original') ? description : `Original study: ${description}`,
  bpm,
  events: pattern.map((item, index) => ev(item.beat, item.notes, item.direction || (index % 2 ? 'up' : 'down'), `${index + 1}`, item.duration || 0.5))
});

const chord = (...ns) => ns;
const n = note;

const studies = [
  melody('study-rock-pulse', 'Granite Pulse', 'rock', 'Original steady rock pulse with a movable low-string hook.', 92, [n(6,0),n(6,3,3),n(5,0),n(5,3,3),n(6,0),n(6,5,4),n(5,3,3),n(5,0),n(6,0),n(6,3,3),n(5,5,4),n(5,3,3),n(6,0),n(6,5,4),n(5,3,3),n(5,0)]),
  melody('study-rock-octaves', 'Streetlight Octaves', 'rock', 'Clean octave movement across the middle strings.', 84, [n(4,2,1),n(3,4,3),n(4,4,3),n(3,6,4),n(4,5,4),n(3,7,4),n(4,7,4),n(3,9,4),n(4,7,4),n(3,7,4),n(4,5,4),n(3,5,3),n(4,4,3),n(3,4,2),n(4,2,1),n(3,2,1)]),
  melody('study-rock-anthem', 'Open Chord Lift', 'rock', 'Original open-chord arpeggio with a broad chorus lift.', 78, [chord(n(6,0),n(4,2,2)),chord(n(5,2,2),n(3,0)),chord(n(4,2,3),n(2,0)),chord(n(3,0),n(1,0)),chord(n(6,3,3),n(4,2,2)),chord(n(5,2,2),n(3,0)),chord(n(4,0),n(2,3,3)),chord(n(1,3,4)),chord(n(6,0),n(4,2,2)),chord(n(5,2,2),n(3,0)),chord(n(4,2,3),n(2,0)),chord(n(3,0),n(1,0)),chord(n(6,3,3),n(4,2,2)),chord(n(5,2,2),n(3,0)),chord(n(4,0),n(2,3,3)),chord(n(1,0))]),
  melody('study-fingerstyle-river', 'River Thumb', 'fingerstyle', 'Alternating-thumb study with a singing high-string answer.', 66, [n(6,0),n(3,2,2),n(2,1,1),n(1,0),n(5,2,2),n(3,2,2),n(2,0),n(1,3,3),n(4,2,3),n(3,0),n(2,1,1),n(1,0),n(5,0),n(3,2,2),n(2,0),n(1,3,3)]),
  melody('study-fingerstyle-lattice', 'Lattice Waltz', 'fingerstyle', 'Three-voice waltz pattern using bass, inner voice, and treble.', 72, [n(6,3,3),n(3,0),n(1,0),n(4,2,2),n(3,2,3),n(1,3,4),n(5,2,2),n(3,0),n(1,0),n(6,0),n(3,2,3),n(1,3,4),n(5,3,3),n(3,0),n(2,1,1),n(1,0)]),
  melody('study-fingerstyle-hammer', 'Soft Hammer Garden', 'fingerstyle', 'Manual hammer-on and pull-off exercise; events show the landing notes only.', 58, [n(2,0),n(2,1,1),n(2,3,3),n(1,0),n(1,1,1),n(1,3,3),n(2,3,3),n(2,1,1),n(2,0),n(1,3,3),n(1,1,1),n(1,0),n(2,0),n(2,1,1),n(1,0),n(1,3,3)]),
  melody('study-flamenco-echo', 'Cedar Rasgueado', 'flamenco-inspired', 'Original flamenco-inspired cadence; rasgueado is a manual right-hand gesture.', 96, [n(6,0),chord(n(5,3,3),n(4,2,2),n(3,0),n(2,1,1),n(1,0)),n(3,0),chord(n(5,3,3),n(4,2,2),n(3,0),n(2,1,1),n(1,0)),n(5,3,3),n(4,2,2),n(3,0),chord(n(5,3,3),n(4,2,2),n(3,0),n(2,1,1),n(1,0)),n(6,0),n(5,3,3),n(4,2,2),n(3,0),n(2,1,1),n(1,0),n(1,0),n(1,0)]),
  melody('study-flamenco-compas', 'Quiet Compás', 'flamenco-inspired', 'Manual golpe and accent practice over an original minor cadence.', 88, [n(6,0),n(5,2,2),n(4,2,3),n(3,1,1),n(2,0),n(1,0),n(3,1,1),n(2,0),n(6,0),n(5,2,2),n(4,2,3),n(3,1,1),n(2,0),n(1,0),n(2,0),n(1,0)]),
  melody('study-classical-sequence', 'Glass Sequence', 'classical', 'Original position-shifting sequence in A minor.', 70, [n(1,0),n(1,1,1),n(1,3,3),n(2,0),n(2,1,1),n(2,3,3),n(3,0),n(3,2,2),n(3,4,4),n(2,4,4),n(2,3,3),n(2,1,1),n(1,3,3),n(1,1,1),n(1,0),n(2,1,1)]),
  melody('study-classical-bass', 'Moonlit Counterpoint', 'classical', 'Two-register counterpoint with a deliberate bass line.', 62, [n(6,0),n(1,0),n(5,2,2),n(1,1,1),n(4,2,3),n(1,3,3),n(5,0),n(1,0),n(6,0),n(1,3,3),n(5,2,2),n(1,1,1),n(4,0),n(1,0),n(5,0),n(1,0)]),
  melody('study-classical-arpeggio', 'Stone Arpeggio', 'classical', 'Broken triads for even right-hand alternation.', 76, [n(5,0),n(3,2,2),n(2,1,1),n(1,0),n(5,3,3),n(3,0),n(2,1,1),n(1,0),n(6,0),n(3,2,3),n(2,0),n(1,3,3),n(5,2,2),n(3,2,3),n(2,0),n(1,0)]),
  melody('study-jazz-shells', 'Shell Voicings', 'jazz', 'Original ii–V–I inspired shell-voicing study; no song quotation.', 92, [chord(n(5,5,1),n(4,5,2)),chord(n(3,5,3),n(2,5,4)),chord(n(5,5,1),n(4,5,2)),chord(n(3,6,3),n(2,6,4)),chord(n(6,5,1),n(4,5,2)),chord(n(3,5,3),n(2,5,4)),chord(n(5,3,1),n(4,4,2)),chord(n(3,4,3),n(2,3,1)),chord(n(5,5,1),n(4,5,2)),chord(n(3,5,3),n(2,5,4)),chord(n(5,5,1),n(4,5,2)),chord(n(3,6,3),n(2,6,4)),chord(n(6,5,1),n(4,5,2)),chord(n(3,5,3),n(2,5,4)),chord(n(5,3,1),n(4,4,2)),chord(n(3,4,3),n(2,3,1))]),
  melody('study-jazz-walking', 'Sidewalk Walking Bass', 'jazz', 'Four-string walking line with chromatic approach tones.', 100, [n(6,3,1),n(6,4,2),n(6,5,3),n(5,2,1),n(5,3,2),n(5,4,3),n(5,5,4),n(4,2,1),n(4,3,2),n(4,4,3),n(4,5,4),n(3,2,1),n(3,3,2),n(3,4,3),n(3,5,4),n(4,2,1)]),
  melody('study-jazz-melody', 'Blue Hour Melody', 'jazz', 'Original syncopated melody over a muted pulse.', 84, [n(2,3,3),n(2,5,4),n(1,3,2),n(1,5,4),n(2,5,4),n(2,3,2),n(1,5,4),n(1,3,2),n(2,1,1),n(2,3,3),n(1,0),n(1,3,3),n(2,3,3),n(2,1,1),n(1,0),n(1,3,3)]),
  melody('study-funk-muted', 'Pocket Muting', 'funk', 'Manual left-hand muting drill with a short fretted accent line.', 104, [n(6,3,1),n(6,3,1),n(4,5,3),n(6,3,1),n(5,5,3),n(6,3,1),n(4,5,3),n(6,3,1),n(6,3,1),n(4,5,3),n(5,5,3),n(6,3,1),n(4,5,3),n(6,3,1),n(5,3,1),n(6,3,1)]),
  melody('study-funk-chop', 'Copper Chops', 'funk', 'Short chord stabs with rests between each clean attack.', 108, [chord(n(5,3,1),n(4,5,3),n(3,4,2)),n(6,3,1),chord(n(5,3,1),n(4,5,3),n(3,4,2)),n(6,3,1),chord(n(5,5,1),n(4,5,2),n(3,5,3)),n(6,5,1),chord(n(5,5,1),n(4,5,2),n(3,5,3)),n(6,5,1),chord(n(5,3,1),n(4,5,3),n(3,4,2)),n(6,3,1),chord(n(5,3,1),n(4,5,3),n(3,4,2)),n(6,3,1),chord(n(5,5,1),n(4,5,2),n(3,5,3)),n(6,5,1),chord(n(5,5,1),n(4,5,2),n(3,5,3)),n(6,5,1)]),
  melody('study-reggae-skank', 'Lagoon Skank', 'reggae', 'Original offbeat chord pattern; rests are muted on the manual instrument.', 78, [n(6,0),chord(n(5,3,3),n(4,2,2),n(3,0),n(2,1,1)),n(6,0),chord(n(5,3,3),n(4,2,2),n(3,0),n(2,1,1)),n(5,0),chord(n(6,3,3),n(5,2,2),n(4,0),n(3,0)),n(5,0),chord(n(6,3,3),n(5,2,2),n(4,0),n(3,0)),n(6,0),chord(n(5,3,3),n(4,2,2),n(3,0),n(2,1,1)),n(6,0),chord(n(5,3,3),n(4,2,2),n(3,0),n(2,1,1)),n(5,0),chord(n(6,3,3),n(5,2,2),n(4,0),n(3,0)),n(5,0),chord(n(6,3,3),n(5,2,2),n(4,0),n(3,0))]),
  melody('study-reggae-bass', 'Harbor Bass', 'reggae', 'A sparse low-string bass line with offbeat response notes.', 82, [n(6,3,1),n(4,5,3),n(6,3,1),n(4,7,4),n(5,3,1),n(4,5,3),n(5,3,1),n(4,4,2),n(6,3,1),n(4,5,3),n(6,3,1),n(4,7,4),n(5,3,1),n(4,5,3),n(5,3,1),n(4,4,2)]),
  melody('study-metal-gallop', 'Iron Gallop', 'metal', 'Manual palm-muting and gallop picking exercise on low E.', 120, [n(6,0),n(6,0),n(6,3,3),n(6,0),n(6,0),n(6,5,4),n(6,0),n(6,0),n(6,3,3),n(6,0),n(6,0),n(6,7,4),n(6,0),n(6,0),n(6,5,4),n(6,3,3)]),
  melody('study-metal-tritone', 'Tritone Forge', 'metal', 'Original two-string chromatic tension study; use distortion only if comfortable.', 112, [n(6,0),n(5,1,1),n(6,1,1),n(5,2,2),n(6,3,3),n(5,4,4),n(6,3,3),n(5,2,2),n(6,5,4),n(5,4,3),n(6,3,2),n(5,2,1),n(6,1,1),n(5,1,1),n(6,0),n(5,2,2)]),
  melody('study-blues-turn', 'Porch Turnaround', 'blues', 'Original 12-bar fragment condensed into a 16-event turnaround drill.', 76, [n(5,0),n(5,3,3),n(4,0),n(4,2,2),n(5,0),n(5,3,3),n(4,2,2),n(4,0),n(3,0),n(3,2,2),n(2,0),n(2,3,3),n(1,0),n(1,3,3),n(2,0),n(1,0)]),
  melody('study-blues-bend', 'Manual Blue Note', 'blues', 'Original target-note melody. Separately, practice a half-step bend from string 3 fret 2 toward the pitch at fret 3; the simulator does not animate bends.', 68, [n(3,2,2),n(3,4,4),n(2,3,3),n(2,5,4),n(1,3,2),n(1,5,4),n(2,5,4),n(2,3,2),n(3,4,4),n(3,2,2),n(2,3,3),n(2,1,1),n(1,0),n(1,3,3),n(2,1,1),n(1,0)]),
  melody('study-country-train', 'Distant Train', 'country', 'Alternating bass and treble pick pattern in an original country feel.', 88, [n(6,0),n(2,0),n(5,2,2),n(1,0),n(6,0),n(2,1,1),n(5,2,2),n(1,3,3),n(6,3,3),n(2,0),n(5,2,2),n(1,0),n(6,3,3),n(2,1,1),n(5,0),n(1,3,3)]),
  melody('study-latin-sun', 'Sun Courtyard', 'latin', 'Original syncopated chord melody with a gentle Latin accent.', 94, [n(5,0),n(3,2,2),n(2,1,1),n(1,0),n(4,2,3),n(3,0),n(2,1,1),n(1,3,3),n(5,3,3),n(3,0),n(2,0),n(1,3,4),n(4,2,2),n(3,0),n(2,1,1),n(1,0)]),
  melody('study-modal-dorian', 'Dorian Lantern', 'modal', 'An A Dorian melody across neighboring strings for hearing a raised sixth.', 74, [n(3,0),n(3,2,2),n(3,3,3),n(3,5,4),n(2,0),n(2,1,1),n(2,3,3),n(2,5,4),n(1,0),n(1,1,1),n(1,3,3),n(1,5,4),n(2,5,4),n(2,3,3),n(2,1,1),n(2,0)]),
  melody('study-percussion-body', 'Hand Drum Map', 'percussive', 'Manual body percussion map alternating bass notes and muted taps.', 90, [n(6,0),n(3,2,2),n(6,0),n(2,1,1),n(5,2,2),n(3,0),n(6,0),n(1,0),n(6,0),n(3,2,2),n(5,2,2),n(2,1,1),n(6,0),n(3,0),n(5,2,2),n(1,0)])
];

const replaceStudyEvents = (id, pattern) => {
  const study = studies.find(item => item.id === id);
  study.events = pattern.map((notes, beat) => ev(beat, notes, beat % 2 ? 'up' : 'down', `${beat + 1}`));
};
replaceStudyEvents('study-rock-octaves', [
  chord(n(4,2,1),n(2,5,4)),chord(n(4,4,3),n(2,7,4)),chord(n(4,5,4),n(2,8,4)),chord(n(4,7,4),n(2,10,4)),
  chord(n(4,5,4),n(2,8,4)),chord(n(4,4,3),n(2,7,4)),chord(n(4,2,1),n(2,5,4)),chord(n(4,0),n(2,3,3)),
  chord(n(4,2,1),n(2,5,4)),chord(n(4,4,3),n(2,7,4)),chord(n(4,5,4),n(2,8,4)),chord(n(4,7,4),n(2,10,4)),
  chord(n(4,5,4),n(2,8,4)),chord(n(4,4,3),n(2,7,4)),chord(n(4,2,1),n(2,5,4)),chord(n(4,0),n(2,3,3))
]);
replaceStudyEvents('study-modal-dorian', [
  n(5,0),n(5,2,2),n(5,3,3),n(4,0),n(4,2,2),n(4,4,4),n(3,0),n(3,2,2),
  n(2,0),n(2,1,1),n(2,3,3),n(1,0),n(1,1,1),n(1,3,3),n(2,3,3),n(2,1,1)
]);
const timed = (id, beats, durations) => {
  const study = studies.find(item => item.id === id);
  study.events = study.events.map((event, index) => ({ ...event, beat: beats[index], duration: durations[index] }));
};
timed('study-funk-chop', [0,1.5,3,4.5,6,7.5,9,10.5,12,13.5,15,16.5,18,19.5,21,22.5], Array(16).fill(0.5));
timed('study-metal-gallop', [0,.5,1.5,2,2.5,3.5,4,4.5,5.5,6,6.5,7.5,8,8.5,9.5,10], Array(16).fill(.5));
studies.find(item => item.id === 'study-fingerstyle-lattice').meter = 3;
const jazzDyads = studies.find(item => item.id === 'study-jazz-shells');
jazzDyads.title = 'Shell-like Dyads';
jazzDyads.description = 'Original jazz dyad study for practicing compact voice movement; it is not a named ii–V–I transcription.';

// A Dorian: A B C D E F-sharp G A, then descend.
{const positions=[[5,0,0],[5,2,2],[5,3,3],[4,0,0],[4,2,2],[4,4,4],[3,0,0],[3,2,2]];studies.find(s=>s.id==='study-modal-dorian').events=[...positions,...positions.slice().reverse()].map(([string,fret,finger],beat)=>({beat,duration:1,notes:[{string,fret,finger}],direction:beat%2?'up':'down',label:['A','B','C','D','E','F♯','G','A','A','G','F♯','E','D','C','B','A'][beat]}));}
const stages = [
  ['Foundation', [
    ['Open-string timing','pulse, counting, and clean releases','study-rock-pulse'],
    ['Two-string reading','name string, fret, and finger before playing','study-classical-sequence'],
    ['First movable shape','shift a two-note idea without squeezing','study-rock-octaves'],
    ['Chord tone picking','pick one note from a held open chord','study-fingerstyle-river'],
    ['Rest discipline','keep a silent beat as intentional as a note','study-reggae-skank'],
    ['Easy dynamics','play the same phrase at two controlled volumes','study-fingerstyle-lattice'],
    ['Metronome ladder','find a clean tempo and change it by five bpm','study-country-train'],
    ['Memory loop','repeat a four-bar idea without looking down','study-rock-anthem'],
    ['Finger independence','lift one fretting finger while others stay relaxed','study-classical-arpeggio'],
    ['Foundation recording','record one take and identify one repair target','study-blues-turn']
  ]],
  ['Intermediate', [
    ['Alternating bass','keep the thumb steady under a melody','study-fingerstyle-river'],
    ['Waltz texture','accent beat one while voices remain even','study-fingerstyle-lattice'],
    ['Position shift','slide between fifth and seventh position silently','study-jazz-shells'],
    ['Syncopated rests','keep the hand moving through empty beats','study-funk-muted'],
    ['Offbeat chords','place skanks consistently behind the beat','study-reggae-skank'],
    ['Pentatonic phrasing','make a four-note question and four-note answer','study-blues-bend'],
    ['Chromatic approach','resolve a passing note into a stable chord tone','study-jazz-walking'],
    ['Palm-mute control','change muting depth without changing tempo','study-metal-gallop'],
    ['Chord melody','let melody notes ring above a chord shape','study-latin-sun'],
    ['Intermediate set','connect three studies with no reset between them','study-country-train']
  ]],
  ['Advanced', [
    ['Voice leading','move the smallest possible distance between shells','study-jazz-shells'],
    ['Counterpoint','bring out bass and treble as separate lines','study-classical-bass'],
    ['Right-hand independence','keep a thumb ostinato under changing treble notes','study-fingerstyle-hammer'],
    ['Rasgueado preparation','practice individual finger flicks silently, then add strings','study-flamenco-echo'],
    ['Compás accents','mark the accent cycle with foot and wrist','study-flamenco-compas'],
    ['Funk pocket','play short stabs with immediate left-hand release','study-funk-chop'],
    ['Gallop stamina','use small pick motion and stop before tension arrives','study-metal-gallop'],
    ['Modal color','compare the raised sixth with a natural minor phrase','study-modal-dorian'],
    ['Manual bends','bend to a target pitch by ear; simulator records landing note','study-blues-bend'],
    ['Advanced arrangement','choose bass, harmony, and melody roles for one study','study-classical-bass']
  ]],
  ['Performance', [
    ['Set pacing','plan a warm opening, contrast, and clear finish','study-rock-anthem'],
    ['Stage dynamics','reserve the loudest phrase for the final section','study-fingerstyle-lattice'],
    ['Count-in leadership','give four audible beats before the study begins','study-rock-pulse'],
    ['Recovery skills','rejoin on the next downbeat after a missed note','study-jazz-walking'],
    ['Loop arrangement','build an intro, groove, and ending from one motif','study-funk-muted'],
    ['Manual percussion','coordinate body taps while keeping fretted notes steady','study-percussion-body'],
    ['Recording critique','listen once for time, once for tone, once for noise','study-jazz-melody'],
    ['Genre contrast','perform two studies with clearly different touch','study-reggae-bass'],
    ['Audience communication','look up at phrase endings without losing pulse','study-latin-sun'],
    ['Capstone set','perform four original studies with spoken titles and rests','study-metal-tritone']
  ]]
];

const theory = [
  ['intervals','Intervals on the neck','An interval is the distance between two pitches. On one string, fret 3 to fret 5 is a whole step; on strings 3 and 2, compare the actual pitch rather than fret numbers.','Play study-rock-octaves and name the octave pairs.'],
  ['triads','Triads and chord tones','Major, minor, and diminished triads use three scale degrees. For C major, find C at string 5 fret 3, E at string 4 fret 2, and G at open string 3.','Circle the root notes in study-classical-arpeggio.'],
  ['sevenths','Seventh chord color','Adding a seventh changes a chord’s pull and mood. Shell voicings omit duplicate notes to leave room for the seventh.','Play study-jazz-shells slowly and identify the moving voice.'],
  ['syncopation','Syncopation','Syncopation places an attack between strong beats. Keep counting evenly through every gap.','Count “1 and 2 and” while playing study-funk-chop.'],
  ['swing','Straight and swung subdivision','Straight eighths divide evenly; swung eighths make the first subdivision longer. This module labels the feel so the simulator does not imply a hidden swing engine.','Tap straight eighths, then play study-jazz-melody with a gentle swing feel manually.'],
  ['modal','Modes as altered scale views','A mode keeps a parent scale but changes the tonal center. Dorian has a natural sixth against a minor third.','Compare F-sharp at string 4 fret 4 with F at string 4 fret 3 over an open A bass.'],
  ['voice-leading','Voice leading','Voice leading moves each chord tone smoothly. Hold common notes while shifting only the voices that must change.','Play study-jazz-shells and isolate the top note.'],
  ['cadence','Cadence and arrival','A cadence creates expectation and release. A final long note can make a small exercise feel complete.','Add a two-beat ending to study-flamenco-compas.'],
  ['articulation','Articulation choices','Slides, hammer-ons, pull-offs, bends, and muting alter the attack. The simulator stores target frets; manual gestures stay written in the lesson.','Practice the landing notes of study-fingerstyle-hammer manually.'],
  ['groove','Pocket and subdivision','Pocket is the repeatable relationship between attacks and the beat. A short note needs precise release as well as attack.','Mute the strings and count the rests in study-funk-muted.'],
  ['arrangement','Bass, harmony, melody','An arrangement assigns different musical jobs to different registers. Low strings support; high strings communicate the tune.','Perform study-classical-bass with bass notes slightly stronger.'],
  ['practice-loop','Loop design','A useful loop has a clear start, a repeatable middle, and an ending cue. Four or eight bars are enough for focused practice.','Create an eight-bar loop from study-reggae-skank and stop on beat one.'],
  ['standard-tuning','Standard tuning map','From string 6 to 1, standard tuning is E A D G B E. Adjacent strings are a perfect fourth apart except G to B, which is a major third.','Say the open pitch before every string change in study-classical-sequence.'],
  ['dynamic-arc','Dynamic arc','A dynamic arc shapes a passage over time: settle, grow, peak, and release. Tempo should remain stable while volume changes.','Perform study-rock-anthem with a four-bar crescendo.']
];

const genreAdditions = [
  ['rock','Rock','A firm backbeat, repeating riff, and controlled sustain.','D D - U D - U','Keep the pick motion compact and release tension after each riff.'],
  ['fingerstyle','Fingerstyle','Independent thumb and fingers create layered accompaniment.','T i m a m i','Let the bass stay even while the top voice speaks.'],
  ['flamenco-inspired','Flamenco-inspired','Sharp accents, cadence shapes, and manual right-hand color.','down rasgueado up golpe','Rasgueado and golpe are manual exercises; the event stream only marks target notes.'],
  ['classical','Classical','Balanced voices, clear releases, and deliberate phrasing.','p i m a m i','Listen for separate bass and treble lines.'],
  ['jazz','Jazz','Shell voicings, chromatic approach tones, and conversational phrasing.','bass chord - chord','Keep the pulse steady while leaving air between ideas.'],
  ['funk','Funk','Short attacks, rests, and a steady subdivision.','D - U - D U -','Muting is a manual gesture and should be practiced away from the simulator.'],
  ['reggae','Reggae','Offbeat chord responses with a spacious low-end role.','bass - skank -','Count the empty beats so the skank lands consistently.'],
  ['metal','Metal','Low-string riffs, palm-muted control, and precise accents.','D D U D D U','Build speed only while the wrist and shoulder remain relaxed.'],
  ['latin','Latin','Syncopated chord melody with a gentle dance pulse.','bass chord - chord','Keep the bass clear and let the treble answer it.'],
  ['modal','Modal','A sustained tonal center with a distinctive scale color.','low note melody melody rest','Hear the characteristic scale degree against the drone.'],
  ['percussive','Percussive','Manual taps and muted attacks add rhythm around pitched notes.','bass tap bass chord','Body percussion is not encoded as a fret event; treat it as a separate exercise.'],
  ['country','Country','Alternating bass, bright treble, and a relaxed forward pulse.','bass treble bass treble','Make the bass notes even before adding ornamentation.']
];

const concreteInstruction = (focus, exerciseId) => {
  const f = focus.toLowerCase();
  if (f.includes('pulse') || f.includes('timing') || f.includes('metronome')) return `Set the click to the study tempo, tap four even beats, then enter on beat one without rushing ${exerciseId}.`;
  if (f.includes('octave') || f.includes('position') || f.includes('shift')) return `Play the first two positions slowly, release pressure before shifting, and check that both notes in each dyad ring cleanly.`;
  if (f.includes('bass') || f.includes('thumb')) return `Accent only the bass notes with the thumb, then add the treble notes without changing the pulse.`;
  if (f.includes('rest') || f.includes('syncopat') || f.includes('offbeat')) return `Keep the picking hand moving through the silence and count the subdivision aloud before each offbeat attack.`;
  if (f.includes('chord') || f.includes('voic')) return `Name the root, place the shape silently, test each fretted string, and release immediately after the target beat.`;
  if (f.includes('mute') || f.includes('palm')) return `Alternate one muted attack and one fretted attack, keeping the same wrist height and volume.`;
  if (f.includes('bend') || f.includes('rasgueado') || f.includes('percussion')) return `Practice the gesture away from the simulator first, then play the encoded landing notes as a pitch and timing check.`;
  if (f.includes('dynamic') || f.includes('arc')) return `Play one pass softly and one pass firmly while keeping the metronome and note lengths unchanged.`;
  if (f.includes('memory') || f.includes('record') || f.includes('set') || f.includes('performance')) return `Mark the phrase boundaries, give a four-beat count-in, and complete the study without restarting after a small error.`;
  if (f.includes('finger') || f.includes('independence')) return `Place each fingertip just behind its fret, lift only the named finger, and keep the remaining fingers relaxed above the strings.`;
  return `Isolate the first four events of ${exerciseId}, identify the exact string and fret, then connect them to the next four at half tempo.`;
};

export function expandCurriculum({ lessons, songs, genres, theoryTopics }) {
  const existingLessons = new Set(lessons.map(item => item.id));
  for (const [stage, rows] of stages) {
    rows.forEach(([focus, skill, exerciseId], index) => {
      const id = `expanded-${stage.toLowerCase()}-${String(index + 1).padStart(2, '0')}`;
      if (!existingLessons.has(id)) lessons.push({
        id,
        stage,
        title: `${focus}: ${stage}`,
        focus: skill,
        minutes: stage === 'Performance' ? 30 : stage === 'Advanced' ? 28 : 22,
        steps: [
          `Set up the guitar, tune carefully, and play ${exerciseId} once slowly.`,
          concreteInstruction(focus, exerciseId),
          `Play it three times with a metronome, then once from memory.`,
          'Write one observable result: clean notes, steady pulse, relaxed motion, or accurate musical shape.'
        ],
        theory: `Apply ${skill.toLowerCase()} to an original playable study; any bends, taps, rasgueado, or percussion mentioned are manual exercises and are not encoded as unsupported simulator gestures.`,
        mastery: `Perform ${exerciseId} three times at its listed tempo with no lost beat, no accidental string contact, and the stated focus clearly audible.`,
        exerciseId
      });
    });
  }

  const seenSongs = new Set(songs.map(item => item.id));
  studies.forEach(study => { if (!seenSongs.has(study.id)) songs.push(study); });

  const seenTheory = new Set(theoryTopics.map(item => item.id));
  theory.forEach(([id, title, body, exercise]) => {
    if (!seenTheory.has(id)) theoryTopics.push({ id, title, body, exercise });
  });

  const seenGenres = new Set(genres.map(item => item.id));
  genreAdditions.forEach(([id, name, description, pattern, tips]) => {
    if (!seenGenres.has(id)) genres.push({ id, name, description, pattern, tips });
  });

  return { lessons, songs, genres, theoryTopics };
}
