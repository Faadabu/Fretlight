import test from 'node:test';
import assert from 'node:assert/strict';
import {songs,lessons} from '../src/curriculum.js';
import {validateEvents,midiFor} from '../src/notation.js';
test('all lessons have playable, non-overlapping exercises',()=>{assert.ok(lessons.length>=68);for(const lesson of lessons)assert.ok(songs.find(s=>s.id===lesson.exerciseId));for(const song of songs){const result=validateEvents(song.events);assert.equal(result.valid,true,`${song.title}: ${result.warnings.join('; ')}`);assert.equal(song.events[0].beat,0);assert.ok(Math.max(...song.events.map(e=>e.beat+e.duration))>=6);}});
test('Ode opening pitches and bar offsets match the melody',()=>{const song=songs.find(s=>s.id==='etude-09');assert.deepEqual(song.events.map(e=>midiFor(e.notes[0].string,e.notes[0].fret)),[64,64,65,67,67,65,64,62,60,60,62,64,64,62,62]);assert.equal(song.events.at(-1).beat+song.events.at(-1).duration,16);});
test('Em uses only E G B and Am uses only A C E',()=>{for(const [id,pitches] of [['etude-04',[4,7,11]],['am-em',[9,0,4]]]){const event=songs.find(s=>s.id===id).events[0];assert.ok(event.notes.length>=5);assert.ok(event.notes.every(n=>pitches.includes(midiFor(n.string,n.fret)%12)));}});
