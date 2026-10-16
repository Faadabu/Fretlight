import test from 'node:test';import assert from 'node:assert/strict';import * as T from 'three';
import {createInstrument} from '../src/guitar-model.js';import {createFrettingHand,createPickingHand} from '../src/hand-model.js';import {SHAPES,planFingering} from '../src/fingering.js';
test('common chord fingers reach strings without changing bone lengths',()=>{
 const instrument=createInstrument(T),rig=createFrettingHand(T,new T.MeshStandardMaterial());
 for(const shape of SHAPES){const notes=Object.entries(shape.notes).map(([s,[f]])=>({string:+s,fret:f}));const event=planFingering([{beat:0,duration:1,notes}]).events[0];rig.update(event.notes,instrument.fx,instrument.sy,{handPosition:event.handPosition});
 for(const n of event.notes.filter(n=>n.fret>0)){const peers=event.notes.filter(p=>p.finger===n.finger&&p.fret>0);if(peers.length>1)continue;const tip=rig.group.userData.fingertips[n.finger-1].position;assert(Math.abs(tip[1]-instrument.sy(n.string))<.006,`${shape.name} finger ${n.finger} misses string: ${tip}`);assert(Math.abs(tip[2]-.205)<.006);}
 }rig.dispose();instrument.dispose();
});
test('F barre has one continuous straight finger across strings',()=>{
 const rig=createFrettingHand(T,new T.MeshStandardMaterial()),instrument=createInstrument(T);const notes=Object.entries(SHAPES.find(s=>s.name==='F').notes).map(([s,[f,finger]])=>({string:+s,fret:f,finger}));rig.update(notes,instrument.fx,instrument.sy,{handPosition:1});const mesh=rig.group.getObjectByName('Finger 1 skeletal mesh');mesh.updateMatrixWorld(true);mesh.skeleton.update();
 for(const s of [1,2,6]){let closest=Infinity;for(let i=0;i<mesh.geometry.attributes.position.count;i++){const p=new T.Vector3();mesh.getVertexPosition(i,p);closest=Math.min(closest,p.distanceTo(new T.Vector3(instrument.fx(1)-.07,instrument.sy(s),.20)));}assert(closest<.03,`barre misses string ${s} by ${closest}`);}rig.dispose();instrument.dispose();
});
test('actual pick tip crosses strings in both directions under a transformed parent',()=>{
 const rig=createPickingHand(T,new T.MeshStandardMaterial()),parent=new T.Group();parent.scale.x=-1;parent.rotation.z=.18;parent.add(rig.group);const sy=s=>(s-3.5)*.12;
 for(const direction of ['down','up'])for(const phase of [0,.125,.25]){rig.update({direction,notes:[{string:6},{string:1}]},phase,sy);const pick=rig.group.getObjectByName('Plectrum');const point=parent.worldToLocal(pick.localToWorld(new T.Vector3(0,-.15,.0125)));const expected=(direction==='down'?1:-1)*(.30-.60*Math.min(1,phase*4));assert(Math.abs(point.x-2.82)<1e-6);assert(Math.abs(point.y-expected)<1e-6);assert(Math.abs(point.z-.20)<1e-6);}
 rig.dispose();
});
