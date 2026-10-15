import test from 'node:test';
import assert from 'node:assert/strict';
import { planFingering } from '../src/fingering.js';

const ev = notes => ({ beat: 0, duration: 1, notes });
const chord = (label, frets, beat = 0) => ({ ...ev(Object.entries(frets).map(([string, fret]) => ({ string: Number(string), fret }))), beat, label });

test('recognises common C, Am and F chord shapes', () => {
  const result = planFingering([
    chord('C', { 5: 3, 4: 2, 3: 0, 2: 1, 1: 0 }, 0),
    chord('Am', { 5: 0, 4: 2, 3: 2, 2: 1, 1: 0 }, 1),
    chord('F', { 6: 1, 5: 3, 4: 3, 3: 2, 2: 1, 1: 1 }, 2)
  ]);
  assert.deepEqual(result.events.map(e => Object.fromEntries(e.notes.map(n => [n.string, n.finger]))), [
    { 1: 0, 2: 1, 3: 0, 4: 2, 5: 3 },
    { 1: 0, 2: 1, 3: 3, 4: 2, 5: 0 },
    { 1: 1, 2: 1, 3: 2, 4: 4, 5: 3, 6: 1 }
  ]);
  assert.equal(result.warnings.length, 0);
  assert.ok(result.events.every(e => e.fingeringSource === 'chord-shape'));
});

test('plans an ascending melody in one stable position', () => {
  const result = planFingering([1, 2, 3].map((fret, i) => ({ beat: i, duration: 1, notes: [{ string: 1, fret }] })));
  assert.deepEqual(result.events.map(e => e.notes[0].finger), [1, 2, 3]);
  assert.deepEqual(result.events.map(e => e.handPosition), [1, 1, 1]);
});

test('preserves explicit fingers and open strings retain position', () => {
  const result = planFingering([
    { beat: 0, duration: 1, notes: [{ string: 1, fret: 7, finger: 3 }] },
    { beat: 1, duration: 1, notes: [{ string: 1, fret: 0 }] }
  ]);
  assert.equal(result.events[0].notes[0].finger, 3);
  assert.equal(result.events[0].handPosition, 5);
  assert.equal(result.events[1].handPosition, 5);
});

test('moves position for a large jump and reports impossible poses', () => {
  const jump = planFingering([{ beat: 0, duration: 1, notes: [{ string: 1, fret: 1 }] }, { beat: 1, duration: 1, notes: [{ string: 1, fret: 12 }] }]);
  assert.equal(jump.events[1].handPosition, 9);
  const impossible = planFingering([ev([{ string: 6, fret: 1, finger: 1 }, { string: 5, fret: 4, finger: 1 }])]);
  assert.ok(impossible.events[0].fingeringIssue);
  assert.ok(impossible.warnings.length > 0);
});

test('does not mutate caller input', () => {
  const input = [ev([{ string: 1, fret: 3 }])];
  const before = JSON.stringify(input);
  planFingering(input);
  assert.equal(JSON.stringify(input), before);
});
