// Contextual left-hand fingering planner. Strings are numbered 1 (high E) to 6 (low E).

const SHAPES = [
  { name: 'C', notes: { 1: [0, 0], 2: [1, 1], 3: [0, 0], 4: [2, 2], 5: [3, 3] } },
  { name: 'G', notes: { 1: [3, 4], 2: [0, 0], 3: [0, 0], 4: [0, 0], 5: [2, 2], 6: [3, 3] } },
  { name: 'D', notes: { 1: [2, 2], 2: [3, 3], 3: [2, 1], 4: [0, 0] } },
  { name: 'Am', notes: { 1: [0, 0], 2: [1, 1], 3: [2, 3], 4: [2, 2], 5: [0, 0] } },
  { name: 'Em', notes: { 1: [0, 0], 2: [0, 0], 3: [0, 0], 4: [2, 3], 5: [2, 2], 6: [0, 0] } },
  { name: 'E', notes: { 1: [0, 0], 2: [0, 0], 3: [1, 1], 4: [2, 3], 5: [2, 2], 6: [0, 0] } },
  { name: 'A', notes: { 1: [0, 0], 2: [2, 3], 3: [2, 2], 4: [2, 1], 5: [0, 0] } },
  { name: 'Dm', notes: { 1: [1, 1], 2: [3, 3], 3: [2, 2], 4: [0, 0] } },
  { name: 'F', notes: { 1: [1, 1], 2: [1, 1], 3: [2, 2], 4: [3, 4], 5: [3, 3], 6: [1, 1] } },
  { name: 'Bm', notes: { 1: [2, 1], 2: [3, 2], 3: [4, 4], 4: [4, 3], 5: [2, 1] } }
];

const fretOf = n => Number.isInteger(n?.fret) ? n.fret : null;
const copyEvent = e => ({ ...e, notes: (e?.notes ?? []).map(n => ({ ...n })) });

function shapeFor(notes) {
  const supplied = notes.filter(n => Number.isInteger(n?.string) && Number.isInteger(n?.fret));
  if (supplied.length < 2) return null;
  let best = null;
  for (const shape of SHAPES) {
    let ok = true;
    for (const n of supplied) {
      const expected = shape.notes[n.string];
      if (!expected || expected[0] !== n.fret) { ok = false; break; }
    }
    if (ok && (!best || supplied.length > best.coverage)) best = { shape, coverage: supplied.length };
  }
  return best?.shape ?? null;
}

function issue(event, warnings, message) {
  event.fingeringIssue = message;
  warnings.push(message);
}

function explicitPosition(notes, event, warnings) {
  const positions = [];
  for (const n of notes) if (n.fret > 0 && Number.isInteger(n.finger) && n.finger > 0) positions.push(n.fret - n.finger + 1);
  const valid = positions.filter(p => p >= 1 && p <= 21);
  if (positions.length && (valid.length !== positions.length || new Set(valid).size > 1)) {
    issue(event, warnings, 'explicit fingers require contradictory or out-of-range hand positions');
  }
  return valid.length ? valid[0] : null;
}

function assignChord(event, warnings) {
  const notes = event.notes;
  const shape = shapeFor(notes);
  if (shape) {
    for (const n of notes) {
      if (n.finger != null) continue;
      n.finger = shape.notes[n.string]?.[1] ?? 0;
    }
    event.fingeringSource = 'chord-shape';
    event.handPosition = Math.max(1, Math.min(...notes.filter(n => n.fret > 0).map(n => n.fret), 21));
    return;
  }
  const fretted = notes.filter(n => n.fret > 0);
  const explicitByFinger = new Map();
  for (const n of fretted) if (n.finger > 0) {
    const prior = explicitByFinger.get(n.finger);
    if (prior != null && prior !== n.fret) issue(event, warnings, `finger ${n.finger} is explicitly assigned to distinct frets`);
    explicitByFinger.set(n.finger, n.fret);
  }
  if (fretted.some(n => n.finger === 0)) issue(event, warnings, 'impossible explicit chord fingering');

  // Prefer one finger per fret; repeated frets may share a finger only when they
  // form a physically valid barre (no sounding string above the barre is skipped).
  const byFret = new Map();
  for (const n of fretted) {
    if (n.finger > 0) continue;
    if (!byFret.has(n.fret)) byFret.set(n.fret, []);
    byFret.get(n.fret).push(n);
  }
  const used = new Set(fretted.filter(n => n.finger > 0).map(n => n.finger));
  let next = 1;
  for (const [fret, group] of [...byFret.entries()].sort((a, b) => a[0] - b[0])) {
    while (used.has(next) && next <= 4) next++;
    const available = next <= 4 ? next++ : 4;
    group.forEach(n => { n.finger = available; });
    used.add(available);
    if (group.length > 1 && available === 4) {
      const strings = new Set(group.map(n => n.string));
      const lo = Math.min(...strings), hi = Math.max(...strings);
      if (notes.some(n => n.string > lo && n.string < hi && !strings.has(n.string) && n.fret <= fret))
        issue(event, warnings, `barre at fret ${fret} is blocked by an intervening sounding string`);
    }
  }
  const span = fretted.length ? Math.max(...fretted.map(n => n.fret)) - Math.min(...fretted.map(n => n.fret)) : 0;
  if (span > 4) issue(event, warnings, `chord span ${span} frets exceeds conservative hand span`);
  event.handPosition = fretted.length ? Math.max(1, Math.min(Math.min(...fretted.map(n => n.fret)), 21)) : (event.handPosition ?? 1);
  event.fingeringSource = 'planned';
}

function planMelody(events, warnings) {
  let previous = 1;
  const plans = [];
  for (const event of events) {
    const fretted = event.notes.filter(n => n.fret > 0);
    if (!fretted.length) { event.handPosition = previous; event.fingeringSource = 'planned'; plans.push(event); continue; }
    const forced = explicitPosition(event.notes, event, warnings);
    const candidates = forced ? [forced] : Array.from({ length: 21 }, (_, i) => i + 1).filter(p => fretted.every(n => n.fret >= p && n.fret <= p + 3));
    if (!candidates.length) { issue(event, warnings, 'no hand position fits the fretted notes'); event.handPosition = previous; event.fingeringSource = 'planned'; plans.push(event); continue; }
    let best = candidates[0], bestCost = Infinity;
    for (const p of candidates) {
      const motion = Math.abs(p - previous) * 3;
      const lowBonus = previous === 1 ? 0 : (p === 1 && fretted.every(n => n.fret <= 4) ? -2 : 0);
      const cost = motion + lowBonus + (p === 1 && fretted.every(n => n.fret <= 4) ? -1 : 0);
      if (cost < bestCost) { best = p; bestCost = cost; }
    }
    event.handPosition = best;
    for (const n of event.notes) if (n.fret > 0 && n.finger == null) n.finger = Math.min(4, n.fret - best + 1);
    for (const n of event.notes) if (n.fret === 0 && n.finger == null) n.finger = 0;
    event.fingeringSource = 'score'; previous = best; plans.push(event);
  }
  return plans;
}

export function planFingering(input) {
  const warnings = [];
  if (!Array.isArray(input)) return { events: [], warnings: ['events must be an array'] };
  const events = input.map(copyEvent);
  const chordEvents = [];
  for (const event of events) {
    if (!event.notes.length) { event.handPosition = event.handPosition ?? 1; event.fingeringSource = 'planned'; continue; }
    if (event.notes.length > 1) { assignChord(event, warnings); chordEvents.push(event); }
  }
  planMelody(events.filter(e => e.notes.length <= 1), warnings);
  // Held notes reserve their finger; flag contradictory simultaneous changes rather than inventing a pose.
  for (let i = 0; i < events.length; i++) for (let j = i + 1; j < events.length; j++) {
    if ((events[i].beat ?? 0) >= (events[j].beat ?? 0) + (events[j].duration ?? 0)) continue;
    if ((events[j].beat ?? 0) >= (events[i].beat ?? 0) + (events[i].duration ?? 0)) continue;
    const old = events[i], next = events[j];
    for (const a of old.notes) for (const b of next.notes) if (a.string === b.string && a.finger > 0 && b.finger > 0 && a.finger !== b.finger)
      warnings.push(`overlapping notes on string ${a.string} require a finger change before release`);
  }
  return { events, warnings };
}

export { SHAPES };
