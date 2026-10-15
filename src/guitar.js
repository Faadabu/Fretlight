import * as T from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export function createGuitar(container) {
 const scene=new T.Scene(); scene.background=new T.Color('#e8ebe4');
 const camera=new T.PerspectiveCamera(34,1,.1,100); camera.position.set(0,-8,15);
 const renderer=new T.WebGLRenderer({antialias:true}); renderer.setPixelRatio(Math.min(devicePixelRatio,2)); container.append(renderer.domElement);
 const controls=new OrbitControls(camera,renderer.domElement); controls.target.set(-.4,0,0); controls.enableDamping=true; controls.minDistance=5;controls.maxDistance=24;
 scene.add(new T.HemisphereLight(0xffffff,0x626554,3)); const light=new T.DirectionalLight(0xffffff,3);light.position.set(-3,-4,9);scene.add(light);
 const wood=new T.MeshStandardMaterial({color:'#c28b47',roughness:.42}); const dark=new T.MeshStandardMaterial({color:'#3c2922',roughness:.7});
 const metal=new T.MeshStandardMaterial({color:'#c7c4b2',metalness:.75,roughness:.35});
 function box(w,h,d,x,y,z,mat=dark){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);scene.add(m);return m;}
 function ball(x,y,z,r,mat,parent=scene){const m=new T.Mesh(new T.SphereGeometry(r,14,10),mat);m.position.set(x,y,z);parent.add(m);return m;}
 function rod(a,b,r,mat,parent=scene){const v=new T.Vector3().subVectors(b,a); const m=new T.Mesh(new T.CylinderGeometry(r,r,v.length(),10),mat);m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());parent.add(m);return m;}
 const shape=new T.Shape(); shape.moveTo(1.3,0);shape.bezierCurveTo(1.3,1,1.8,1.35,2.5,1.18);shape.bezierCurveTo(3.05,.65,3.25,1.6,4.3,1.5);shape.bezierCurveTo(5.8,1.5,5.8,-1.5,4.3,-1.5);shape.bezierCurveTo(3.25,-1.6,3.05,-.65,2.5,-1.18);shape.bezierCurveTo(1.8,-1.35,1.3,-1,1.3,0);
 const body=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.46,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.09,bevelThickness:.06}),wood);body.position.z=-.5;scene.add(body);
 const hole=new T.Mesh(new T.CircleGeometry(.48,48),dark);hole.position.set(2.75,0,.035);scene.add(hole);
 const ring=new T.Mesh(new T.RingGeometry(.5,.56,48),metal);ring.position.set(2.75,0,.04);scene.add(ring);
 box(7.1,.75,.18,-1.85,0,0);box(.25,1,.18,4.25,0,.1);box(.12,.82,.1,-5.4,0,.12,metal);box(1.1,.95,.2,-6,0,-.03,wood);
 const nut=-5.4,scale=9.65,fx=f=>nut+scale*(1-Math.pow(2,-f/12)),sy=s=>(3.5-s)*.12;
 for(let f=1;f<=20;f++)box(.025,.76,.035,fx(f),0,.12,metal);
 for(const f of [3,5,7,9,12,15,17]){const dot=new T.Mesh(new T.CircleGeometry(.045,12),metal);dot.position.set((fx(f)+fx(f-1))/2,0,.107);scene.add(dot);}
 const strings=[];for(let s=1;s<=6;s++){strings.push(rod(new T.Vector3(-5.55,sy(s),.19),new T.Vector3(4.26,sy(s),.19),.006+s*.0017,metal));box(.15,.17,.12,-6.3+(s%3)*.3,s<4?.58:-.58,0,metal);}
 const skin=new T.MeshStandardMaterial({color:'#e3b18f',transparent:true,opacity:.48,roughness:.65,depthWrite:false});
 const hand=new T.Group();scene.add(hand); const right=new T.Group();scene.add(right);const markers=new T.Group();scene.add(markers);
 function clear(g){while(g.children.length){const o=g.children.pop();o.geometry?.dispose();}}
 function finger(parent,points,r=.065){for(let i=0;i<points.length-1;i++)rod(new T.Vector3(...points[i]),new T.Vector3(...points[i+1]),r,skin,parent);points.slice(1).forEach(p=>ball(...p,r,skin,parent));}
 let current=null;
 function pose(notes=[]){clear(hand);clear(markers);const fretted=notes.filter(n=>n.fret>0);const anchor=fretted.length?Math.min(...fretted.map(n=>fx(n.fret)-.12)):fx(2)-.12;
 const palm=ball(anchor+.35,-.86,.48,.3,skin,hand);palm.scale.set(1.45,1,.46);finger(hand,[[anchor+.55,-1.5,.35],[anchor+.4,-1.05,.45]],.18);
 for(let f=1;f<=4;f++){const n=fretted.find(n=>n.finger===f)||fretted.filter(n=>!n.finger)[f-1];const x=n?fx(n.fret)-.08:anchor+(f-1)*.19;const y=n?sy(n.string):-.46;finger(hand,[[anchor+(f-2)*.16,-.75,.48],[x,-.4,.69],[x,y,.25]],.055);}
 finger(hand,[[anchor+.6,-.85,.4],[anchor+.75,-.3,-.18],[anchor+.4,.25,-.12]],.085);
 for(const n of notes){const mat=new T.MeshBasicMaterial({color:n.fret?'#dd6d37':'#3e9386'});const m=ball(n.fret?fx(n.fret)-.08:nut-.1,sy(n.string),.21,.065,mat,markers);m.userData=n;}
 }
 const rp=ball(3,-.45,.8,.26,skin,right);rp.scale.set(1,1.3,.45);finger(right,[[3,-1.4,1],[3,-.65,.8]],.17);for(let f=0;f<4;f++)finger(right,[[2.85+f*.12,-.3,.8],[2.78+f*.13,.04,.58],[2.86+f*.12,.18,.36]],.055);finger(right,[[2.8,-.47,.8],[2.58,-.17,.55],[2.68,.03,.28]],.075);
 pose([]);
 const obs=new ResizeObserver(()=>{const {width,height}=container.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});obs.observe(container);
 renderer.setAnimationLoop(()=>{controls.update();renderer.render(scene,camera);});
 return { update(event,phase=0){if(event!==current){current=event;pose(event?.notes||[]);}const strummed=event?.notes?.length>1;const target=event?.notes?.[0]?.string||3;right.position.y=strummed?(event?.direction==='up'?1:-1)*(.5-Math.min(phase*4,1))*.7:sy(target)-.1;right.position.z=Math.sin(Math.min(phase*4,1)*Math.PI)*.12;},opacity(v){skin.opacity=v;},view(kind){camera.position.set(...(kind==='neck'?[-2,-3.4,7]:kind==='top'?[-.4,0,17]:[0,-8,15]));controls.target.set(kind==='neck'?-2:-.4,0,0);controls.update();},dispose(){obs.disconnect();renderer.setAnimationLoop(null);renderer.dispose();controls.dispose();}};
}

