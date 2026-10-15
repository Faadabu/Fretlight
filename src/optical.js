// Experimental, deliberately conservative OMR for a clear single-staff image.
// It accepts ImageData-like {data,width,height}; this is not full sheet-music OMR.

const NATURAL = ['C','D','E','F','G','A','B'];
const MIDI = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};

function grayPixels(imageData) {
  const {data,width,height} = imageData || {};
  if (!data || !width || !height || data.length < width * height * 4) return null;
  const gray = new Uint8Array(width * height);
  for (let i=0,p=0; i<gray.length; i++,p+=4) gray[i] = Math.round(.299*data[p] + .587*data[p+1] + .114*data[p+2]);
  return {gray,width,height};
}

function groups(rows) {
  const out=[]; let start=-1;
  rows.forEach((v,i) => { if (v && start<0) start=i; if ((!v || i===rows.length-1) && start>=0) { const end=v&&i===rows.length-1?i:i-1; out.push([start,end]); start=-1; } });
  return out;
}

function findStaves(gray,width,height) {
  const projection = new Uint16Array(height);
  for (let y=0;y<height;y++) for (let x=0;x<width;x++) if (gray[y*width+x] < 150) projection[y]++;
  const candidates = groups(Array.from(projection, n => n > Math.max(12,width*.18)));
  const staves=[];
  for (let i=0;i<candidates.length;) {
    const first=candidates[i], lines=[first];
    for (let j=i+1;j<candidates.length && lines.length<5;j++) {
      const gap=candidates[j][0]-lines.at(-1)[1]-1;
      if (gap > 0 && gap <= Math.max(12,Math.round(height*.025))) lines.push(candidates[j]); else if (gap > Math.max(12,Math.round(height*.025))) break;
    }
    if (lines.length===5) {
      const centers=lines.map(([a,b])=>(a+b)/2), spacing=(centers[4]-centers[0])/4;
      if (spacing>=2 && spacing<=Math.max(40,height*.12)) { staves.push({top:centers[0],bottom:centers[4],spacing,lines:centers}); i+=5; continue; }
    }
    i++;
  }
  return staves;
}

function eraseStaff(gray,width,height,staff) {
  const out = new Uint8Array(gray.length);
  for (let i=0;i<gray.length;i++) out[i] = gray[i] < 150 ? 1 : 0;
  for (const line of staff.lines) for (let y=Math.max(0,Math.round(line)-1);y<=Math.min(height-1,Math.round(line)+1);y++) for (let x=0;x<width;x++) out[y*width+x]=0;
  return out;
}

function components(binary,width,height,staff) {
  const seen=new Uint8Array(binary.length), result=[];
  for (let y=Math.max(0,Math.floor(staff.top-staff.spacing*2)); y<=Math.min(height-1,Math.ceil(staff.bottom+staff.spacing*2)); y++) for (let x=0;x<width;x++) {
    const seed=y*width+x; if (!binary[seed]||seen[seed]) continue;
    const q=[seed]; seen[seed]=1; let minX=x,maxX=x,minY=y,maxY=y,count=0;
    for (let h=0;h<q.length;h++) { const p=q[h], py=Math.floor(p/width), px=p%width; count++; minX=Math.min(minX,px); maxX=Math.max(maxX,px); minY=Math.min(minY,py); maxY=Math.max(maxY,py);
      for (const [nx,ny] of [[px+1,py],[px-1,py],[px,py+1],[px,py-1]]) if(nx>=0&&nx<width&&ny>=0&&ny<height){const np=ny*width+nx;if(binary[np]&&!seen[np]){seen[np]=1;q.push(np);}}
    }
    const w=maxX-minX+1,h=maxY-minY+1;
    // Noteheads are compact dark blobs; stems may make a component taller.
    if(count>=Math.max(4,staff.spacing*staff.spacing*.25) && w>=2 && w<=staff.spacing*3.2 && h>=2 && h<=staff.spacing*5.5) result.push({x:minX+w/2,y:minY+h*.62,w,h,count});
  }
  return result;
}

// Find local notehead-shaped blobs in the original raster. Staff lines are
// deliberately not erased here: a line has ink in one row, while a notehead
// has ink across several adjacent rows. This avoids splitting heads on lines.
function noteheads(gray,width,height,staff) {
  const s=staff.spacing, candidates=[];
  const y0=Math.max(1,Math.floor(staff.top-s*1.6)), y1=Math.min(height-2,Math.ceil(staff.bottom+s*1.6));
  for(let y=y0;y<=y1;y++) for(let x=Math.ceil(s);x<width-Math.ceil(s);x++) {
    const rx=Math.max(2,Math.round(s*.62)), ry=Math.max(2,Math.round(s*.42));
    let score=0, rows=0;
    for(let yy=-ry;yy<=ry;yy++) { let row=0; for(let xx=-rx;xx<=rx;xx++) if((xx*xx)/(rx*rx)+(yy*yy)/(ry*ry)<=1 && gray[(y+yy)*width+x+xx]<145) row++; if(row>=Math.max(2,rx*.35)) rows++; score+=row; }
    if(rows<3 || score < s*s*.7) continue;
    let peak=true;
    for(let dy=-1;dy<=1;dy++) for(let dx=-2;dx<=2;dx++) if(dx||dy) { const nx=x+dx,ny=y+dy; if(nx>0&&nx<width&&ny>0&&ny<height) { let local=0; for(let yy=-ry;yy<=ry;yy++) for(let xx=-rx;xx<=rx;xx++) if((xx*xx)/(rx*rx)+(yy*yy)/(ry*ry)<=1&&gray[(ny+yy)*width+nx]<145)local++; if(local>score) peak=false; } }
    if(peak) candidates.push({x,y});
  }
  // Collapse nearby pixels into one head; stems can produce several maxima.
  const merged=[];
  candidates.sort((a,b)=>a.x-b.x||a.y-b.y).forEach(c=>{const prior=merged.find(m=>Math.hypot(m.x-c.x,m.y-c.y)<s*.75); if(prior){prior.x=(prior.x+c.x)/2;prior.y=(prior.y+c.y)/2;} else merged.push({...c});});
  return merged;
}

function pitchAt(y,staff) {
  const diatonic=Math.round((staff.bottom-y)/(staff.spacing/2));
  const base=4*7+2; // E4, counted as natural-note index C0 + 30.
  const idx=base+diatonic, octave=Math.floor(idx/7), letter=NATURAL[((idx%7)+7)%7];
  return {letter,octave,midi:12*(octave+1)+MIDI[letter]};
}

function guitarPosition(midi) {
  const open=[40,45,50,55,59,64]; // strings 6..1
  let best=null;
  open.forEach((m,i)=>{const fret=midi-m;if(fret>=0&&fret<=12){const candidate={string:6-i,fret,finger:fret===0?0:Math.min(4,fret),_score:fret+(i*.01)};if(!best||candidate._score<best._score)best=candidate;}});
  if (best) { delete best._score; return best; }
  return null;
}

export function recognizeScore(imageData, options={}) {
  const warnings=['Experimental draft: review every result; clef, rhythm, accidentals, key signatures, ties, and voices are not recognized.','All detected notes are returned as uniform quarter-note events.'];
  const source=grayPixels(imageData);
  if (!source) return {events:[],warnings:[...warnings,'No usable ImageData (expected RGBA data, width, and height).'],detectedCount:0,staffCount:0};
  const {gray,width,height}=source, staves=findStaves(gray,width,height);
  if (!staves.length) return {events:[],warnings:[...warnings,'No usable five-line staff was detected.'],detectedCount:0,staffCount:0};
  const events=[]; let rejected=0;
  const guitarOctave=options.guitarOctave===undefined?true:Boolean(options.guitarOctave);
  if(guitarOctave) warnings.push('Treble pitches are interpreted as guitar written pitches (standard guitar sounds one octave lower).');
  staves.forEach((staff,staffIndex)=>noteheads(gray,width,height,staff).sort((a,b)=>a.x-b.x).forEach(c=>{const pitch=pitchAt(c.y,staff), position=guitarPosition(pitch.midi-(guitarOctave?12:0)); if(!position){rejected++;return;} events.push({beat:events.length,duration:1,notes:[position],direction:'down',label:`${pitch.letter}${pitch.octave}`,staff:staffIndex});}));
  if (rejected) warnings.push(`${rejected} detected note${rejected===1?' was':'s were'} outside the simple fretboard range and omitted.`);
  if (!events.length) warnings.push('Staff lines were found, but no confidently playable noteheads were detected.');
  return {events,warnings,detectedCount:events.length,staffCount:staves.length};
}
