// Continuous, tapered teaching meshes in guitar-local coordinates.
function surface(T,points,radii,material,{radial=16,segments=36,ellipse=1}={}){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal'),frames=curve.computeFrenetFrames(segments,false),positions=[],uv=[],indices=[];
 for(let i=0;i<=segments;i++){const t=i/segments,p=curve.getPointAt(t),ri=t*(radii.length-1),j=Math.min(radii.length-2,Math.floor(ri)),r0=T.MathUtils.lerp(radii[j],radii[j+1],ri-j),r=t>.83?radii.at(-2)*Math.sqrt(Math.max(.0001,1-((t-.83)/.17)**2)):r0;for(let k=0;k<=radial;k++){const a=k/radial*Math.PI*2,v=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*ellipse);positions.push(v.x,v.y,v.z);uv.push(k/radial,t);}}
 for(let i=0;i<segments;i++)for(let k=0;k<radial;k++){const a=i*(radial+1)+k,b=a+radial+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
function palmMesh(T,material,anchor){
 const levels=[[-1.95,.23,.155,.27],[-1.7,.26,.18,.31],[-1.4,.34,.21,.37],[-1.1,.45,.23,.44],[-.82,.46,.22,.46],[-.61,.43,.185,.45],[-.49,.43,.14,.43],[-.46,.40,.10,.43]],p=[],uv=[],idx=[],radial=24;
 for(let j=0;j<levels.length;j++){const [y,w,d,z]=levels[j];for(let k=0;k<=radial;k++){const a=k/radial*Math.PI*2;p.push(anchor+.28+Math.cos(a)*w,y,z+Math.sin(a)*d*(1+.035*Math.sin(3*a)));uv.push(k/radial,j/(levels.length-1));}}
 for(let j=0;j<levels.length-1;j++)for(let k=0;k<radial;k++){const a=j*(radial+1)+k,b=a+radial+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;return m;
}
function nail(T,material,x,y,z,tilt=.6,width=.073,length=.105){const m=new T.Mesh(new T.SphereGeometry(1,20,12),material);m.scale.set(width,length,.018);m.position.set(x,y,z);m.rotation.x=tilt;m.castShadow=true;return m;}
function disposeMeshes(group){group.traverse(o=>o.geometry?.dispose());group.clear();}
// Each finger is a continuous weighted mesh driven by MCP, PIP and DIP bones.
function fingerRig(T,skin,nails,lengths,width){
 const total=lengths.reduce((a,b)=>a+b,0),pos=[],idx=[],si=[],sw=[],radial=16,rings=40;
 const cuts=[0,lengths[0],lengths[0]+lengths[1],total];
 for(let j=0;j<=rings;j++){const y=j/rings*total,t=y/total,r=width*(1-.22*t)*Math.sqrt(Math.max(.00001,1-Math.max(0,(t-.87)/.13)**2));
  let bone=y<cuts[1]?0:y<cuts[2]?1:2;const blend=.12;let other=bone,w=0;
  for(let k=1;k<=2;k++)if(Math.abs(y-cuts[k])<blend){bone=k-1;other=k;w=(y-cuts[k]+blend)/(2*blend);}
  for(let k=0;k<=radial;k++){const a=k/radial*Math.PI*2;pos.push(Math.cos(a)*r,y,Math.sin(a)*r*.88);si.push(bone,other,0,0);sw.push(1-w,w,0,0);}
 }
 for(let j=0;j<rings;j++)for(let k=0;k<radial;k++){const a=j*(radial+1)+k,b=a+radial+1;idx.push(a,b,a+1,b,b+1,a+1);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));geo.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));geo.setIndex(idx);geo.computeVertexNormals();
 const mesh=new T.SkinnedMesh(geo,skin),bones=lengths.map(()=>new T.Bone());bones[0].name='MCP';bones[1].name='PIP';bones[2].name='DIP';bones[0].add(bones[1]);bones[1].position.y=lengths[0];bones[1].add(bones[2]);bones[2].position.y=lengths[1];mesh.add(bones[0]);const skeleton=new T.Skeleton(bones);mesh.bind(skeleton);mesh.frustumCulled=false;
 const knuckle=new T.Mesh(new T.SphereGeometry(1,20,16),skin);knuckle.scale.set(width*1.12,.16,width*1.15);knuckle.position.set(0,-.055,0);bones[0].add(knuckle);
 const end=new T.Object3D();end.position.y=lengths[2];bones[2].add(end);
 const plate=nail(T,nails,0,lengths[2]-.075,-width*.73,0,width*.65,.07);bones[2].add(plate);
 const axis=new T.Vector3(0,1,0),targets=bones.map(()=>new T.Quaternion());let targetBase=new T.Vector3();
 function solve(base,tip,barre=false){
  targetBase.copy(base);const distal=barre?new T.Vector3(0,1,0):new T.Vector3(0,.12,-.993).normalize();
  const dip=tip.clone().addScaledVector(distal,-lengths[2]),delta=dip.clone().sub(base),d=delta.length(),dir=delta.normalize(),a=lengths[0],b=lengths[1];
  // Hand placement is adjusted before solving; clamping only protects invalid imports.
  const reach=Math.min(a+b-.0001,Math.max(Math.abs(a-b)+.0001,d)),along=(a*a-b*b+reach*reach)/(2*reach),height=Math.sqrt(Math.max(0,a*a-along*along));
  const bend=new T.Vector3(0,0,1).addScaledVector(dir,-dir.z).normalize(),pip=base.clone().addScaledVector(dir,along).addScaledVector(bend,height);
  const world=[new T.Quaternion().setFromUnitVectors(axis,pip.clone().sub(base).normalize()),new T.Quaternion().setFromUnitVectors(axis,dip.clone().sub(pip).normalize()),new T.Quaternion().setFromUnitVectors(axis,distal)];
  targets[0].copy(world[0]);targets[1].copy(world[0]).invert().multiply(world[1]);targets[2].copy(world[1]).invert().multiply(world[2]);
 }
 function tick(amount=1){bones[0].position.lerp(targetBase,amount);bones.forEach((b,i)=>b.quaternion.slerp(targets[i],amount));mesh.updateMatrixWorld(true);skeleton.update();}
 return {mesh,bones,end,solve,tick,dispose(){skeleton.dispose();}};
}
export function createFrettingHand(T,skin,nails=skin){
 const group=new T.Group();group.name='Jointed fretting hand';const palm=palmMesh(T,skin,0);group.add(palm);
 const rigs=[.105,.112,.105,.09].map((w,i)=>fingerRig(T,skin,nails,[[.46,.34,.23],[.49,.36,.24],[.46,.34,.23],[.40,.29,.21]][i],w));rigs.forEach((r,i)=>{r.mesh.name=`Finger ${i+1} skeletal mesh`;group.add(r.mesh);});
 let thumb=null,key='',remaining=0,pressed=[],desired=[];
 function refreshTips(){group.updateMatrixWorld(true);group.userData.fingertips=rigs.map((r,i)=>({finger:i+1,position:group.worldToLocal(r.end.getWorldPosition(new T.Vector3())).toArray(),pressed:pressed[i]}));}
 function update(notes=[],fx,sy,options={}){
  const position=options.handPosition||Math.max(1,Math.min(...notes.filter(n=>n.fret>0).map(n=>n.fret-(n.finger||1)+1),2));
  const next=JSON.stringify([notes,position]);if(next===key)return false;key=next;
  const anchor=fx(position)-.07; palm.position.x=anchor+.10;palm.scale.set(1,.64,.78);palm.position.y=-.12;
  const fretted=notes.filter(n=>n.fret>0);const baseY=fretted.length?Math.min(...fretted.map(n=>sy(n.string)))-.55:-.65;palm.position.y+=baseY+.44;pressed=[];desired=[];
  rigs.forEach((r,i)=>{const assigned=fretted.filter(n=>n.finger===i+1),n=assigned[0],barre=assigned.length>1,peers=n?fretted.filter(m=>m.fret===n.fret&&m.finger!==n.finger):[];
   const x=n?fx(n.fret)-.07-Math.min(.15,peers.filter(m=>m.finger<n.finger).length*.055):anchor+i*.26;
   const tip=new T.Vector3(x,n?Math.max(...assigned.map(m=>sy(m.string))):baseY+.39,n?.205:.49);
   const base=new T.Vector3(anchor+i*.26,baseY-(i===3?.04:0),.43);
   // Splay at the knuckles to accommodate adjacent frets without stretching bones.
   base.x=T.MathUtils.clamp(base.x,x-.22,x+.22);if(barre)base.y=-.65;
   r.solve(base,tip,barre);pressed.push(!!n);desired.push(tip.toArray());
  });
  if(thumb){group.remove(thumb);thumb.geometry.dispose();}thumb=surface(T,[[anchor+.05,-.80,.23],[anchor-.24,-.57,.06],[anchor-.23,-.12,-.48],[anchor-.08,.20,-.48]],[.16,.145,.12,.005],skin);thumb.position.y=baseY+.44;thumb.name='Thumb behind neck';group.add(thumb);
  remaining=options.animate?8:0;if(!remaining){rigs.forEach(r=>r.tick(1));refreshTips();}group.userData.targets=desired;return true;
 }
 function tick(){if(!remaining)return false;rigs.forEach(r=>r.tick(remaining===1?1:.38));remaining--;refreshTips();return true;}
 return {group,update,tick,dispose(){rigs.forEach(r=>r.dispose());disposeMeshes(group);}};
}

export function createPickingHand(T,skin,nails=skin){
 const group=new T.Group();group.name='Anatomical picking hand';const palm=palmMesh(T,skin,-.25);palm.rotation.z=Math.PI;group.add(palm);palm.scale.y=.70;
 group.add(surface(T,[[-.25,.68,.44],[-.38,.32,.48],[-.25,.02,.30],[-.07,-.02,.23]],[.14,.13,.105,.015],skin));group.add(surface(T,[[.32,1.02,.46],[.43,.62,.48],[.29,.30,.31],[.025,.08,.27]],[.18,.16,.12,.015],skin));group.add(nail(T,nails,.06,.12,.32,1.3,.09,.12));
 for(let i=0;i<3;i++){const x=-.05+i*.20;group.add(surface(T,[[x,.71,.5],[x-.11,.34,.55],[x-.07,.16,.36],[x+.01,.36,.24]],[.125-i*.012,.12-i*.01,.095-i*.008,.012],skin));}
 const shape=new T.Shape();shape.moveTo(-.10,.10);shape.quadraticCurveTo(-.13,.03,0,-.15);shape.quadraticCurveTo(.13,.03,.1,.1);shape.quadraticCurveTo(0,.16,-.1,.1);const pickMaterial=new T.MeshPhysicalMaterial({color:'#b97028',roughness:.32,clearcoat:.35}),pick=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:2}),pickMaterial);pick.position.set(0,0,.02);pick.rotation.x=.8;pick.name='Plectrum';group.add(pick);
 function update(event=null,phase=0,sy=s=>(s-3.5)*.12){const notes=event?.notes||[],low=notes.length?Math.max(...notes.map(n=>n.string)):6,high=notes.length?Math.min(...notes.map(n=>n.string)):1,progress=Math.min(1,Math.max(0,phase*4)),down=event?.direction!=='up',from=sy(down?low:high),to=sy(down?high:low),y=notes.length>1?from+(to-from)*progress:notes.length?sy(notes[0].string):0;group.position.set(2.82,y+.10,.27);group.rotation.x=-.17+Math.sin(progress*Math.PI)*.06;group.rotation.z=notes.length>1?(down?-1:1)*(.1-progress*.2):0;group.userData.pickTip=[2.82,y,.20];return true;}
 return {group,update,dispose(){disposeMeshes(group);pickMaterial.dispose();}};
}
