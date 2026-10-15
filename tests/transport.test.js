import test from 'node:test';
import assert from 'node:assert/strict';
import {activeEvents,advanceBeat} from '../src/transport.js';
test('speed changes tempo without changing score position units',()=>{assert.equal(advanceBeat(0,2,60,.25,8,null).beat,.5);});
test('loop wraps and preserves overshoot',()=>{const r=advanceBeat(3.8,1,60,1,8,{a:1,b:4});assert.equal(r.wrapped,true);assert.ok(Math.abs(r.beat-1.8)<1e-9);});
test('playback stops at end',()=>{assert.deepEqual(advanceBeat(7,2,60,1,8,null),{beat:8,ended:true,wrapped:false});});
test('simultaneous voices remain active until their individual durations end',()=>{const events=[{beat:0,duration:4},{beat:1,duration:1}];assert.equal(activeEvents(events,1.5).length,2);assert.equal(activeEvents(events,2).length,1);assert.equal(activeEvents(events,4).length,0);});
