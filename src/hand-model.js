// Continuous, tapered teaching meshes in guitar-local coordinates.
function surface(T,points,radii,material,{radial=16,segments=36,ellipse=1}={}){
 const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal'),frames=curve.computeFrenetFrames(segments,false),positions=[],uv=[],indices=[];
 for(let i=0;i<=segments;i++){const t=i/segments,p=curve.getPointAt(t),ri=t*(radii.length-1),j=Math.min(radii.length-2,Math.floor(ri)),r0=T.MathUtils.lerp(radii[j],radii[j+1],ri-j),r=t>.83?radii.at(-2)*Math.sqrt(Math.max(.0001,1-((t-.83)/.17)**2)):r0;for(let k=0;k<=radial;k++){const a=k/radial*Math.PI*2,v=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*r).addScaledVector(frames.binormals[i],Math.sin(a)*r*ellipse);positions.push(v.x,v.y,v.z);uv.push(k/radial,t);}}
 for(let i=0;i<segments;i++)for(let k=0;k<radial;k++){const a=i*(radial+1)+k,b=a+radial+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();const mesh=new T.Mesh(geometry,material);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;
}
function palmMesh(T,material,anchor){
 const levels=[[-1.95,.23,.155,.27],[-1.7,.26,.18,.31],[-1.4,.34,.21,.37],[-1.1,.45,.23,.44],[-.82,.46,.22,.46],[-.61,.43,.185,.45],[-.49,.32,.14,.43],[-.46,.04,.04,.43]],p=[],uv=[],idx=[],radial=24;
 for(let j=0;j<levels.length;j++){const [y,w,d,z]=levels[j];for(let k=0;k<=radial;k++){const a=k/radial*Math.PI*2;p.push(anchor+.28+Math.cos(a)*w,y,z+Math.sin(a)*d*(1+.035*Math.sin(3*a)));uv.push(k/radial,j/(levels.length-1));}}
 for(let j=0;j<levels.length-1;j++)for(let k=0;k<radial;k++){const a=j*(radial+1)+k,b=a+radial+1;idx.push(a,b,a+1,b,b+1,a+1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;return m;
}
function nail(T,material,x,y,z,tilt=.6,width=.073,length=.105){const m=new T.Mesh(new T.SphereGeometry(1,20,12),material);m.scale.set(width,length,.018);m.position.set(x,y,z);m.rotation.x=tilt;m.castShadow=true;return m;}
function disposeMeshes(group){group.traverse(o=>o.geometry?.dispose());group.clear();}
export function createFrettingHand(T,skin,nails=skin){
 const group=new T.Group();group.name='Anatomical fretting hand';let key='';
 function update(notes=[],fx,sy){const incoming=JSON.stringify(notes);if(key===incoming&&group.children.length)return false;key=incoming;disposeMeshes(group);const fretted=notes.filter(n=>n.fret>0),minFret=fretted.length?Math.min(...fretted.map(n=>n.fret)):2,anchor=fx(minFret)-.16;
 group.add(palmMesh(T,skin,anchor));group.add(surface(T,[[anchor+.24,-3.7,.08],[anchor+.27,-2.8,.16],[anchor+.28,-2.05,.25],[anchor+.28,-1.69,.31]],[.35,.32,.255,.245],skin,{ellipse:.78}));
 const fingertips=[],bases=[-.075,.15,.38,.59];for(let finger=1;finger<=4;finger++){
 const assigned=fretted.filter(n=>n.finger===finger),pressed=assigned.length>0;let x=pressed?fx(assigned[0].fret)-.07:anchor+bases[finger-1]+.04,y=pressed?sy(assigned[0].string):-.23-(finger===4?.12:0);
 const base=[anchor+bases[finger-1],-.65-(finger===4?.07:0),.47],reach=Math.max(.25,y-base[1]),knuckle=[base[0]+(x-base[0])*.24,base[1]+reach*.28,.87-(finger===4?.08:0)],middle=[x-.035,y-.18,pressed?.67:.69],distal=[x,y-.035,pressed?.35:.54],contact=[x,y,pressed?.205:.43],width=[.115,.125,.119,.10][finger-1];
 const mesh=surface(T,[base,knuckle,middle,distal,contact],[width*1.13,width*1.03,width*.96,width*.81,.004],skin);mesh.name=`Finger ${finger}`;group.add(mesh);group.add(nail(T,nails,x,y-.066,pressed?.397:.59,.92,width*.62,.093));
 if(assigned.length>1&&assigned.every(n=>n.fret===assigned[0].fret)){const ys=assigned.map(n=>sy(n.string));group.add(surface(T,[[x,Math.min(...ys),.22],[x,(Math.min(...ys)+Math.max(...ys))/2,.25],[x,Math.max(...ys),.22]],[.03,.075,.03],skin,{segments:18}));}
 fingertips.push({finger,position:contact,pressed});}
 const thumb=surface(T,[[anchor-.12,-1.18,.37],[anchor-.40,-.68,.1],[anchor-.29,-.12,-.34],[anchor-.12,.30,-.26],[anchor-.05,.43,-.025]],[.19,.18,.155,.125,.015],skin,{segments:40});thumb.name='Thumb behind neck';group.add(thumb);group.add(nail(T,nails,anchor-.05,.425,.005,-.4,.08,.1));group.userData.fingertips=fingertips;return true;
 }return {group,update,dispose(){disposeMeshes(group);}};
}
export function createPickingHand(T,skin,nails=skin){
 const group=new T.Group();group.name='Anatomical picking hand';const palm=palmMesh(T,skin,-.25);palm.rotation.z=Math.PI;group.add(palm);group.add(surface(T,[[-.1,3.4,.5],[.03,2.3,.48],[.02,1.7,.3],[.02,1.3,.36]],[.36,.32,.26,.25],skin,{ellipse:.8}));
 group.add(surface(T,[[-.25,.68,.44],[-.38,.32,.48],[-.25,.02,.30],[-.07,-.02,.23]],[.14,.13,.105,.015],skin));group.add(surface(T,[[.32,1.02,.46],[.43,.62,.48],[.29,.30,.31],[.025,.08,.27]],[.18,.16,.12,.015],skin));group.add(nail(T,nails,.06,.12,.32,1.3,.09,.12));
 for(let i=0;i<3;i++){const x=-.05+i*.20;group.add(surface(T,[[x,.71,.5],[x-.11,.34,.55],[x-.07,.16,.36],[x+.01,.36,.24]],[.125-i*.012,.12-i*.01,.095-i*.008,.012],skin));}
 const shape=new T.Shape();shape.moveTo(-.10,.10);shape.quadraticCurveTo(-.13,.03,0,-.15);shape.quadraticCurveTo(.13,.03,.1,.1);shape.quadraticCurveTo(0,.16,-.1,.1);const pickMaterial=new T.MeshPhysicalMaterial({color:'#b97028',roughness:.32,clearcoat:.35}),pick=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:2}),pickMaterial);pick.position.set(0,0,.02);pick.rotation.x=.8;pick.name='Plectrum';group.add(pick);
 function update(event=null,phase=0,sy=s=>(s-3.5)*.12){const notes=event?.notes||[],low=notes.length?Math.max(...notes.map(n=>n.string)):6,high=notes.length?Math.min(...notes.map(n=>n.string)):1,progress=Math.min(1,Math.max(0,phase*4)),down=event?.direction!=='up',from=sy(down?low:high),to=sy(down?high:low),y=notes.length>1?from+(to-from)*progress:notes.length?sy(notes[0].string):0;group.position.set(2.82,y+.10,.27);group.rotation.x=-.17+Math.sin(progress*Math.PI)*.06;group.rotation.z=notes.length>1?(down?-1:1)*(.1-progress*.2):0;group.userData.pickTip=[2.82,y,.20];return true;}
 return {group,update,dispose(){disposeMeshes(group);pickMaterial.dispose();}};
}
