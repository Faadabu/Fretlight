import {FINGER_COLORS,FINGER_NAMES} from './finger-colors.js';
import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createInstrument} from './guitar-model.js';
import {createFrettingHand,createPickingHand} from './hand-model.js';

// Original geometry, materials and posing. Coordinates remain in guitar space;
// presentation transforms place the neck to the viewer's right like a teacher.
export function createGuitar(container){
 const scene=new T.Scene();scene.background=new T.Color('#dedbd2');
 const camera=new T.PerspectiveCamera(35,1,.05,80);
 const renderer=new T.WebGLRenderer({antialias:true,alpha:false});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;container.append(renderer.domElement);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.05);scene.environment=environment.texture;scene.environmentIntensity=.35;room.dispose();pmrem.dispose();
 const key=new T.DirectionalLight('#fff1db',2.5);key.position.set(-3,4,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-8;key.shadow.camera.right=8;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.normalBias=.025;key.shadow.bias=-.0002;scene.add(key);
 const fill=new T.DirectionalLight('#dce8ff',1.25);fill.position.set(5,-2,5);scene.add(fill);scene.add(new T.HemisphereLight('#fff8ec','#4d453e',1));
 const backdrop=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshStandardMaterial({color:'#d6d1c6',roughness:1}));backdrop.position.z=-1.25;backdrop.receiveShadow=true;scene.add(backdrop);
 const assembly=new T.Group();assembly.scale.x=-1;assembly.rotation.z=.18;scene.add(assembly);
 const instrument=createInstrument(T);assembly.add(instrument.group);const {fx,sy}=instrument;
 // Fine pore variation supplies surface breakup without external image assets.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const context=canvas.getContext('2d'),pixels=context.createImageData(256,256);let seed=42;for(let i=0;i<pixels.data.length;i+=4){seed=(1664525*seed+1013904223)>>>0;const v=125+(seed%27);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}context.putImageData(pixels,0,0);const pores=new T.CanvasTexture(canvas);pores.wrapS=pores.wrapT=T.RepeatWrapping;pores.repeat.set(3,3);
 const skin=new T.MeshPhysicalMaterial({color:'#b67e5e',roughness:.49,metalness:0,bumpMap:pores,bumpScale:.008,clearcoat:.045,clearcoatRoughness:.5,sheen:.12,sheenColor:new T.Color('#efb59b'),transparent:true,opacity:.85,depthWrite:false,side:T.FrontSide});
 const nails=new T.MeshPhysicalMaterial({color:'#e8bea7',roughness:.31,clearcoat:.18,transparent:true,opacity:.85,depthWrite:false});
 const left=createFrettting(),right=createPickingHand(T,skin,nails);assembly.add(left.group,right.group);
 function createFrettting(){return createFrettingHand(T,skin,nails);}
 assembly.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.minDistance=2;controls.maxDistance=26;controls.enablePan=true;
 let dirty=true,view='neck',currentEvent=null,currentKey='',anchor=fx(2),disposed=false,lastRender=0;
 const overlay=document.createElement('div');overlay.className='string-guide';overlay.innerHTML='<b>STRINGS</b>'+[6,5,4,3,2,1].map((s,i)=>`<span data-s="${s}"><i>${s}</i> ${['E','A','D','G','B','e'][i]}</span>`).join('');container.append(overlay);
 const hint=document.createElement('div');hint.className='posture-caption';hint.innerHTML=FINGER_NAMES.map((name,i)=>`<span style="display:inline-block;margin-right:8px"><i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${FINGER_COLORS[i]}"></i> ${name}</span>`).join('');container.append(hint);
 const marks=new T.Group();assembly.add(marks);const markMaterials=new Set();
 function clearMarks(){for(const o of [...marks.children]){marks.remove(o);o.geometry?.dispose();o.material?.map?.dispose();o.material?.dispose();}markMaterials.clear();}
 function badge(text,color){const c=document.createElement('canvas');c.width=c.height=96;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.beginPath();ctx.arc(48,48,39,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='white';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 44px Arial';ctx.fillText(text,48,50);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const material=new T.SpriteMaterial({map:texture,depthTest:false,transparent:true});const sprite=new T.Sprite(material);sprite.scale.set(.19,.19,1);sprite.renderOrder=9;return sprite;}
 function positionCamera(){assembly.updateMatrixWorld(true);const local=new T.Vector3(view==='neck'||view==='top'?anchor+.32:view==='picking'?2.9:-.4,view==='neck'||view==='top'?-.35:0,0);const target=assembly.localToWorld(local);let distance;if(view==='neck')distance=Math.max(3.6,3.2/(2*Math.tan(17.5*Math.PI/180)*camera.aspect));else if(view==='picking')distance=Math.max(4,4/(2*Math.tan(17.5*Math.PI/180)*camera.aspect));else if(view==='top')distance=5;else distance=Math.max(7,13.2/(2*Math.tan(17.5*Math.PI/180)*camera.aspect));
 controls.target.copy(target);camera.up.set(0,1,0);const offset=view==='top'?new T.Vector3(.4,3.4,3.8):view==='neck'?new T.Vector3(.12,-distance*.52,distance*.9):new T.Vector3(0,-distance*.14,distance);camera.position.copy(target).add(offset);controls.update();dirty=true;}
 function update(event,phase=0,playing=false){currentEvent=event;const nextKey=JSON.stringify(event?.notes||[]);if(nextKey!==currentKey){currentKey=nextKey;left.update(event?.notes||[],fx,sy,{handPosition:event?.handPosition,animate:playing});clearMarks();const fretted=(event?.notes||[]).filter(n=>n.fret>0);if(fretted.length){const nextAnchor=fx(Math.min(...fretted.map(n=>n.fret)));if(Math.abs(nextAnchor-anchor)>.6){anchor=nextAnchor;if(view==='neck'||view==='top')positionCamera();}}
 for(const n of event?.notes||[]){const marker=badge(n.fret?String(n.finger||'•'):'○',n.fret?(FINGER_COLORS[n.finger]||'#777777'):'#367f72');marker.position.set(n.fret?fx(n.fret)-.07:-5.53,sy(n.string),.33);marks.add(marker);}for(let s=1;s<=6;s++){const active=event?.notes?.some(n=>n.string===s);const str=instrument.strings[s-1];if(str?.material?.emissive){str.material.emissive.set(active?'#b85b17':'#000000');str.material.emissiveIntensity=active?.6:0;}overlay.querySelector(`[data-s="${s}"]`).classList.toggle('lit',!!active);}}
 right.update(event,phase,sy);dirty=true;}
 const observer=new ResizeObserver(()=>{const {width,height}=container.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();positionCamera();});observer.observe(container);
 controls.addEventListener('change',()=>{dirty=true;});renderer.setAnimationLoop(now=>{if(disposed||document.hidden)return;controls.update();if(left.tick())dirty=true;if(dirty&&now-lastRender>30){renderer.render(scene,camera);dirty=false;lastRender=now;}});
 left.update([],fx,sy);right.update(null,0,sy);positionCamera();
 return {update,opacity(value){left.opacity(value);skin.opacity=value;nails.opacity=value;skin.depthWrite=value>=.98;nails.depthWrite=value>=.98;skin.needsUpdate=true;nails.needsUpdate=true;dirty=true;},view(kind){view=kind;positionCamera();},dispose(){disposed=true;observer.disconnect();controls.dispose();renderer.setAnimationLoop(null);clearMarks();left.dispose();right.dispose();instrument.dispose();pores.dispose();skin.dispose();nails.dispose();environment.dispose();backdrop.geometry.dispose();backdrop.material.dispose();renderer.dispose();overlay.remove();hint.remove();renderer.domElement.remove();}};
}
