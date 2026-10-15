import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createFrettingHand, createPickingHand } from '../src/hand-model.js';

const skin = new THREE.MeshStandardMaterial({ color: 0xb87555 });
const nail = new THREE.MeshStandardMaterial({ color: 0xe7b9a0 });
const fx = (fret) => -5.4 + fret * 0.24;
const sy = (string) => (string - 3.5) * 0.12;

function assertFiniteGeometry(group) {
  group.traverse((object) => {
    if (!object.geometry) return;
    for (const name of ['position', 'normal']) {
      const attribute = object.geometry.getAttribute(name);
      if (!attribute) continue;
      for (let i = 0; i < attribute.count * attribute.itemSize; i++) {
        assert(Number.isFinite(attribute.array[i]), `${name} contains a non-finite value`);
      }
    }
  });
}

test('fretting fingertips honor explicit finger assignments and string/fret targets', () => {
  const rig = createFrettingHand(THREE, skin, nail);
  rig.update([
    { finger: 1, string: 2, fret: 1 },
    { finger: 2, string: 4, fret: 2 },
    { finger: 3, string: 3, fret: 2 },
    { finger: 0, string: 5, fret: 0 },
  ], fx, sy);
  const tips = rig.group.userData.fingertips;
  assert.equal(tips.length, 4);
  for (const tip of tips) assert.deepEqual(Object.keys(tip).sort(), ['finger', 'position', 'pressed']);
  for (const expected of [
    { finger: 1, string: 2, fret: 1 },
    { finger: 2, string: 4, fret: 2 },
    { finger: 3, string: 3, fret: 2 },
  ]) {
    const tip = tips.find((entry) => entry.finger === expected.finger);
    assert.equal(tip.pressed, true);
    assert.ok(Math.abs(tip.position[0] - (fx(expected.fret) - 0.07)) < 0.08);
    assert.ok(Math.abs(tip.position[1] - sy(expected.string)) < 0.08);
    assert.ok(Math.abs(tip.position[2] - 0.20) < 0.015);
  }
  assert.equal(tips.find((entry) => entry.finger === 4).pressed, false);
  assertFiniteGeometry(rig.group);
  assert.doesNotThrow(() => rig.dispose());
  assert.doesNotThrow(() => rig.dispose());
});

test('picking hand follows a downstroke from string 6 toward string 1 and accepts null events', () => {
  const rig = createPickingHand(THREE, skin, nail);
  const event = { direction: 'down', notes: [{ string: 6 }, { string: 1 }] };
  assert.doesNotThrow(() => rig.update(null, 0, sy));
  rig.update(event, 0, sy);
  const start = [...rig.group.userData.pickTip];
  rig.update(event, 0.25, sy);
  const middle = [...rig.group.userData.pickTip];
  assert.ok(middle[1] < start[1], `expected downstroke y ${middle[1]} < ${start[1]}`);
  assertFiniteGeometry(rig.group);
  assert.doesNotThrow(() => rig.dispose());
});

