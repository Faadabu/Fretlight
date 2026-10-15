import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createInstrument} from '../src/guitar-model.js';
test('guitar tuning coordinates and independent string highlighting are consistent',()=>{const model=createInstrument(T);assert.equal(model.strings.length,6);assert.equal(new Set(model.strings.map(s=>s.material)).size,6);assert.ok(Math.abs(model.fx(12)-(-5.4+9.65/2))<1e-9);assert.ok(model.sy(6)>model.sy(1));for(let s=1;s<=6;s++){assert.ok(Math.abs(model.strings[s-1].position.y-model.sy(s))<.001);}model.group.traverse(o=>{const a=o.geometry?.attributes.position?.array;if(a)assert.ok(a.every(Number.isFinite));});model.dispose();});
