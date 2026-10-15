import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {createFrettingHand} from '../src/hand-model.js';
import {createInstrument} from '../src/guitar-model.js';
const skin=new T.MeshStandardMaterial();
test('skinned fingertip vertices reach actual instrument strings and animate between chords',()=>{
 const instrument=createInstrument(T),rig=createFrettingHand(T,skin),{fx,sy}=instrument;
 const am=[{finger:1,string:2,fret:1},{finger:2,string:4,fret:2},{finger:3,string:3,fret:2}];
 rig.update(am,fx,sy,{handPosition:1});
 function verify(notes){for(const n of notes){const mesh=rig.group.getObjectByName(`Finger ${n.finger} skeletal mesh`);assert(mesh.isSkinnedMesh);assert.equal(mesh.skeleton.bones.length,3);assert(mesh.geometry.attributes.normal.getX(0)>0,'finger surface must face outward');mesh.updateMatrixWorld(true);mesh.skeleton.update();const vertex=new T.Vector3();mesh.getVertexPosition(mesh.geometry.attributes.position.count-1,vertex);const actual=rig.group.worldToLocal(mesh.localToWorld(vertex));assert(Math.abs(actual.y-sy(n.string))<.006,`finger ${n.finger} string contact ${actual.y}`);assert(Math.abs(actual.z-.205)<.006,`finger ${n.finger} depth ${actual.z}`);assert(actual.x<fx(n.fret)&&actual.x>fx(n.fret-1));}}
 verify(am);const before=rig.group.userData.fingertips[1].position;
 const em=[{finger:2,string:5,fret:2},{finger:3,string:4,fret:2}];rig.update(em,fx,sy,{handPosition:1,animate:true});assert.deepEqual(rig.group.userData.fingertips[1].position,before);assert(rig.tick());assert.notDeepEqual(rig.group.userData.fingertips[1].position,before);for(let i=0;i<8;i++)rig.tick();verify(em);
 rig.dispose();instrument.dispose();
});
