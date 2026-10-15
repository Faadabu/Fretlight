import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTab, midiFor, noteName, parseTab, validateEvents } from '../src/notation.js';

test('parses editable tab lines and round trips', () => {
  const parsed = parseTab('0 1 6:0 5:2:2 4:2:3 down label=G');
  assert.equal(parsed.warnings.length, 0);
  assert.deepEqual(parsed.events[0], { beat: 0, duration: 1, notes: [{ string: 6, fret: 0 }, { string: 5, fret: 2, finger: 2 }, { string: 4, fret: 2, finger: 3 }], direction: 'down', label: 'G' });
  assert.equal(formatTab(parsed.events), '0 1 6:0 5:2:2 4:2:3 down label=G');
});

test('validates impossible chords', () => {
  const result = validateEvents([{ beat: 0, duration: 1, notes: [{ string: 1, fret: 0 }, { string: 1, fret: 2 }] }]);
  assert.equal(result.valid, false); assert.match(result.warnings.join(' '), /same string/);
});

test('uses high E as string 1 and permits open-string finger 0 only', () => {
  assert.equal(midiFor(1, 0), 64);
  assert.equal(midiFor(6, 0), 40);
  assert.equal(noteName(1, 0), 'E4');
  assert.equal(validateEvents([{ beat: 0, duration: 1, notes: [{ string: 1, fret: 0, finger: 0 }] }]).valid, true);
  assert.equal(validateEvents([{ beat: 0, duration: 1, notes: [{ string: 1, fret: 2, finger: 0 }] }]).valid, false);
});

test('supports ASCII tabs with an explicit uniform-grid warning', () => {
  const parsed = parseTab('e|0-1-|\nB|1-3-|\nG|0-2-|\nD|2-0-|\nA|3---|\nE|x---|');
  assert.ok(parsed.events.length > 0); assert.ok(parsed.warnings.some((w) => /eighth-note/.test(w)));
});

test('reads multi-digit ASCII frets as one note', () => {
  const parsed = parseTab('e|10--|\nB|----|\nG|----|\nD|----|\nA|----|\nE|----|');
  assert.deepEqual(parsed.events[0].notes, [{ string: 1, fret: 10 }]);
});

test('reports malformed editable rows and preserves rests', () => {
  const parsed = parseTab('this is not a notation row\n0 1');
  assert.equal(parsed.events.length, 1);
  assert.deepEqual(parsed.events[0].notes, []);
  assert.equal(parsed.errors.length, 1);
  assert.equal(formatTab(parsed.events), '0 1');
});

test('maps standard tuning pitches', () => { assert.equal(midiFor(6, 0), 40); assert.equal(noteName(1, 0), 'E4'); });

