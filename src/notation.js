// String 1 is the highest pitched (thin) string; string 6 is low E.
const OPEN_MIDI = [64, 59, 55, 50, 45, 40];
const STEPS = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

const warning = (warnings, message, line) => warnings.push(line == null ? message : `Line ${line}: ${message}`);
const number = (value) => Number(value);

export function midiFor(string, fret) {
  if (!Number.isInteger(string) || string < 1 || string > 6 || !Number.isInteger(fret) || fret < 0) return null;
  return OPEN_MIDI[string - 1] + fret;
}

export function noteName(string, fret) {
  const midi = midiFor(string, fret);
  if (midi == null) return null;
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  return `${names[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

function validateEvent(event, index, warnings) {
  if (!event || !Number.isFinite(event.beat) || event.beat < 0) warning(warnings, 'beat must be a finite non-negative number', index + 1);
  if (!event || !Number.isFinite(event.duration) || event.duration <= 0) warning(warnings, 'duration must be a finite positive number', index + 1);
  const notes = event && Array.isArray(event.notes) ? event.notes : [];
  const strings = new Set();
  const fingers = new Set();
  for (const note of notes) {
    if (!note || !Number.isInteger(note.string) || note.string < 1 || note.string > 6) warning(warnings, 'string must be an integer from 1 to 6', index + 1);
    if (!note || !Number.isInteger(note.fret) || note.fret < 0 || note.fret > 24) warning(warnings, 'fret must be an integer from 0 to 24', index + 1);
    if (note && strings.has(note.string)) warning(warnings, 'a chord cannot contain two notes on the same string', index + 1);
    if (note) strings.add(note.string);
    if (note && note.finger != null) {
      if (!Number.isInteger(note.finger) || note.finger < 0 || note.finger > 4 || (note.finger === 0 && note.fret !== 0)) warning(warnings, 'finger must be 1 to 4, or 0 only for an open string', index + 1);
      else if (note.finger !== 0) fingers.add(note.finger);
    }
  }
  if (fingers.size > 4 && !event.barre) warning(warnings, 'a chord uses more than four distinct fretting fingers', index + 1);
  if (event && event.direction != null && event.direction !== 'up' && event.direction !== 'down') warning(warnings, 'direction must be up or down', index + 1);
}

export function validateEvents(events) {
  const warnings = [];
  if (!Array.isArray(events)) return { valid: false, warnings: ['events must be an array'] };
  events.forEach((event, index) => validateEvent(event, index, warnings));
  const occupied = new Map();
  events.forEach((event, index) => {
    for (const note of event?.notes ?? []) {
      if (!Number.isInteger(note?.string)) continue;
      const prior = occupied.get(note.string) ?? [];
      if (prior.some((range) => event.beat < range.end && event.beat + event.duration > range.start)) warning(warnings, `string ${note.string} overlaps another event`, index + 1);
      prior.push({ start: event.beat, end: event.beat + event.duration }); occupied.set(note.string, prior);
    }
  });
  return { valid: warnings.length === 0, warnings };
}

function parseColumnToken(token, warnings, line) {
  const bits = token.split(':');
  if (bits.length < 2 || bits.length > 3 || !/^\d+$/.test(bits[0]) || !/^\d+$/.test(bits[1]) || (bits[2] != null && !/^\d+$/.test(bits[2]))) {
    warning(warnings, `invalid note token “${token}”`, line); return null;
  }
  return { string: number(bits[0]), fret: number(bits[1]), ...(bits[2] == null ? {} : { finger: number(bits[2]) }) };
}

function parseAscii(lines, warnings) {
  const rows = lines.filter((line) => /^\s*[eEbBgGdDaA][^|]*\|/.test(line));
  if (rows.length !== 6) return [];
  const byString = new Map();
  rows.forEach((row, rowIndex) => {
    const match = row.match(/^\s*([eEbBgGdDaA])[^|]*\|(.*)$/);
    if (!match) return;
    const open = { e: 1, a: 5, d: 4, g: 3, b: 2 }[match[1].toLowerCase()] ?? 6;
    const string = rowIndex === 0 ? 1 : (rowIndex === 5 ? 6 : open);
    byString.set(string, match[2]);
  });
  const width = Math.max(...[...byString.values()].map((v) => v.length));
  const columns = new Map();
  for (const [string, content] of byString) {
    for (const match of content.matchAll(/\d+/g)) {
      const col = match.index;
      const notes = columns.get(col) ?? [];
      notes.push({ string, fret: number(match[0]) });
      columns.set(col, notes);
    }
  }
  const events = [...columns.entries()].sort((a, b) => a[0] - b[0]).map(([col, notes]) => ({ beat: col / 2, duration: 0.5, notes }));
  if (events.length) warning(warnings, 'ASCII tab columns are interpreted as a uniform eighth-note grid');
  return events;
}

export function parseTab(text) {
  const warnings = [];
  const errors = [];
  const input = String(text ?? '');
  const lines = input.split(/\r?\n/);
  const ascii = parseAscii(lines, warnings);
  const isAscii = lines.filter((line) => /^\s*[eEbBgGdDaA][^|]*\|/.test(line)).length === 6;
  const explicit = [];
  if (isAscii) return { events: ascii, warnings, errors };
  lines.forEach((raw, i) => {
    const trimmed = raw.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    if (!/^\d+(?:\.\d+)?(?:\s+.*)?$/.test(trimmed)) { errors.push(`Line ${i + 1}: malformed notation row`); return; }
    const parts = trimmed.split(/\s+/);
    if (parts.length < 2) { errors.push(`Line ${i + 1}: notation row needs beat and duration`); return; }
    const beat = number(parts.shift());
    const duration = number(parts.shift());
    let label;
    const labelIndex = parts.findIndex((part) => part.startsWith('label='));
    if (labelIndex >= 0) label = parts.splice(labelIndex, 1)[0].slice(6);
    let direction;
    if (parts.at(-1) === 'up' || parts.at(-1) === 'down') direction = parts.pop();
    const before = warnings.length;
    const notes = parts.map((part) => parseColumnToken(part, warnings, i + 1)).filter(Boolean);
    errors.push(...warnings.slice(before));
    explicit.push({ beat, duration, notes, ...(direction ? { direction } : {}), ...(label ? { label } : {}) });
  });
  const events = explicit;
  const result = validateEvents(events);
  warnings.push(...result.warnings);
  return { events, warnings, errors };
}

function children(node, name) { return node ? [...node.getElementsByTagName(name)].filter((item) => item.parentNode === node) : []; }
function textOf(node, name) { return children(node, name)[0]?.textContent?.trim() ?? ''; }

export function parseMusicXML(text) {
  const warnings = [];
  if (typeof DOMParser === 'undefined') return { events: [], warnings: ['MusicXML parsing requires a browser DOMParser'] };
  const doc = new DOMParser().parseFromString(String(text ?? ''), 'application/xml');
  if (!doc.documentElement || doc.getElementsByTagName('parsererror').length) return { events: [], warnings: ['Invalid MusicXML document'] };
  const part = doc.getElementsByTagName('part')[0];
  if (!part) return { events: [], warnings: ['MusicXML contains no part'] };
  const events = []; let beat = 0; let divisions = 1; let transpose = 0; let lastStart = 0; let warnedWrittenOctave = false;
  for (const measure of children(part, 'measure')) {
    const measureStart = beat; let measureEnd = measureStart;
    for (const item of [...measure.children]) {
      const name = item.localName || item.nodeName;
      if (name === 'attributes') { const d = Number(textOf(item, 'divisions')); if (Number.isFinite(d) && d > 0) divisions = d; const t = children(item, 'transpose')[0]; if (t) transpose = Number(textOf(t, 'chromatic') || 0) + 12 * Number(textOf(t, 'octave-change') || 0); }
      else if (name === 'backup' || name === 'forward') { const d = Number(textOf(item, 'duration')); if (Number.isFinite(d)) beat += (name === 'backup' ? -1 : 1) * d / divisions; }
      else if (name === 'direction' && (item.getElementsByTagName('metronome').length || item.getElementsByTagName('sound').length)) warning(warnings, 'tempo changes are ignored');
      else if (name === 'barline' && item.getElementsByTagName('repeat').length) warning(warnings, 'repeats are ignored');
      else if (name === 'note') {
        const d = Number(textOf(item, 'duration')); const duration = Number.isFinite(d) && d > 0 ? d / divisions : 0;
        const chord = children(item, 'chord').length > 0; const start = chord ? lastStart : beat;
        if (children(item, 'rest').length) { if (!chord) { events.push({ beat, duration, notes: [] }); measureEnd = Math.max(measureEnd, beat + duration); beat += duration; } continue; }
        const pitch = children(item, 'pitch')[0];
        if (!pitch || !duration) { warning(warnings, 'note without pitch or duration is ignored'); if (!chord) beat += duration; continue; }
        const midi = (STEPS[textOf(pitch, 'step')] ?? 0) + 12 * (Number(textOf(pitch, 'octave')) + 1) + Number(textOf(pitch, 'alter') || 0) + transpose;
        if (!item.getElementsByTagName('technical').length && !warnedWrittenOctave) { warning(warnings, 'MusicXML guitar pitches without technical string/fret are interpreted as written treble pitches; sounding octave may differ'); warnedWrittenOctave = true; }
        if (item.getElementsByTagName('tie').length || item.getElementsByTagName('articulations').length) warning(warnings, 'ties and articulations are ignored');
        const tech = item.getElementsByTagName('technical')[0]; let string = Number(textOf(tech, 'string')); let fret = Number(textOf(tech, 'fret'));
        if (!Number.isInteger(string) || string < 1 || string > 6 || !Number.isInteger(fret) || fret < 0 || fret > 24) { const choices = OPEN_MIDI.map((open, idx) => ({ string: idx + 1, fret: midi - open })).filter((x) => x.fret >= 0 && x.fret <= 24); const choice = choices.sort((a, b) => a.fret - b.fret)[0]; string = choice?.string; fret = choice?.fret; }
        if (string == null) warning(warnings, `pitch ${midi} cannot be placed on guitar`); else {
          const event = events.find((x) => x.beat === start && x.duration === duration);
          const note = { string, fret }; const fingering = textOf(tech, 'fingering'); if (fingering) note.finger = Number(fingering);
          if (event && chord) event.notes.push(note); else { events.push({ beat: start, duration, notes: [note] }); lastStart = start; }
        }
        if (!chord) { measureEnd = Math.max(measureEnd, beat + duration); beat += duration; }
      }
    }
    beat = measureEnd;
  }
  events.sort((a, b) => a.beat - b.beat || a.duration - b.duration);
  return { events, warnings: warnings.concat(validateEvents(events).warnings) };
}

export function formatTab(events) {
  const check = validateEvents(events); if (!check.valid) throw new Error(check.warnings.join('; '));
  return events.map((event) => [event.beat, event.duration, ...event.notes.map((n) => `${n.string}:${n.fret}${n.finger == null ? '' : `:${n.finger}`}`), event.direction ?? '', event.label == null ? '' : `label=${event.label}`].filter((value) => value !== '').join(' ')).join('\n');
}

export default { parseTab, parseMusicXML, validateEvents, noteName, midiFor, formatTab };
