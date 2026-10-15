import test from 'node:test';
import assert from 'node:assert/strict';
import {recognizeScore} from '../src/optical.js';

function raster(width=240,height=90) {
  const data=new Uint8ClampedArray(width*height*4); data.fill(255);
  const put=(x,y)=>{if(x>=0&&x<width&&y>=0&&y<height){const p=(y*width+x)*4;data[p]=data[p+1]=data[p+2]=0;data[p+3]=255;}};
  [25,31,37,43,49].forEach(y=>{for(let x=15;x<225;x++)put(x,y);});
  return {data,width,height,put};
}
function head(img,cx,cy) {
  for(let y=-3;y<=3;y++) for(let x=-5;x<=5;x++) if((x*x)/25+(y*y)/9<=1) img.put(cx+x,cy+y);
  for(let y=cy-18;y<cy-2;y++) img.put(cx+4,y);
}

test('blank staff is rejected',()=>{const img=raster(); const out=recognizeScore(img); assert.equal(out.staffCount,1); assert.equal(out.detectedCount,0); assert.deepEqual(out.events,[]);});
test('no staff is rejected',()=>{const img=raster(); for(let y=0;y<img.height;y++) for(let x=0;x<img.width;x++) {const p=(y*img.width+x)*4;img.data[p]=img.data[p+1]=img.data[p+2]=255;} const out=recognizeScore(img); assert.equal(out.staffCount,0); assert.deepEqual(out.events,[]);});
test('clear notehead yields playable guitar event',()=>{const img=raster(); head(img,80,49); const out=recognizeScore(img); assert.equal(out.staffCount,1); assert.equal(out.detectedCount,1); assert.equal(out.events[0].beat,0); assert.equal(out.events[0].notes[0].string,4); assert.equal(out.events[0].notes[0].fret,2);});
test('written pitch option is explicit',()=>{const img=raster(); head(img,80,49); const written=recognizeScore(img,{guitarOctave:false}); const sounding=recognizeScore(img,{guitarOctave:true}); assert.notDeepEqual(written.events[0].notes[0],sounding.events[0].notes[0]);});

