/* Procedural acoustic guitar. The host supplies its Three.js namespace so this
 * file can be used by the browser bundle without owning a second Three copy. */
export function createInstrument(T) {
  const group = new T.Group(); group.name = 'AcousticGuitar';
  const fx = (f) => -5.4 + 9.65 * (1 - Math.pow(2, -f / 12));
  // Display convention: the bass (6th) string is on the upper edge.
  const sy = (s) => (s - 3.5) * 0.12;
  const owned = [];
  const mats = [];
  const mat = (name, options) => { const m = new T.MeshPhysicalMaterial(options); m.name = name; mats.push(m); return m; };
  const rosewood = mat('Rosewood sides and back', { color: 0x3d1913, roughness: .46, clearcoat: .22, clearcoatRoughness: .2 });
  const neckWood = mat('Mahogany neck', { color: 0x6c321e, roughness: .52, clearcoat: .18 });
  const ebony = mat('Ebony fingerboard', { color: 0x211c1a, roughness: .3, clearcoat: .12 });
  const cream = mat('Cream binding', { color: 0xe7d2a8, roughness: .3, clearcoat: .2 });
  const dark = mat('Soundhole cavity', { color: 0x090504, roughness: .92 });
  const metal = mat('Nickel fretwork', { color: 0xc6c7c1, metalness: .88, roughness: .22 });
  const chrome = mat('Chrome tuners', { color: 0xdfe6e7, metalness: .96, roughness: .14, clearcoat: .4 });
  const bronze = mat('Bronze wound strings', { color: 0xa87942, metalness: .78, roughness: .3 });
  const plainString = mat('Plain steel strings', { color: 0xe9e6d6, metalness: .88, roughness: .2 });

  function mesh(g, material, name, parent = group) { const o = new T.Mesh(g, material); o.name = name; parent.add(o); owned.push(o); return o; }
  function rod(a, b, radius, material, name, parent = group, radial = 8) {
    const d = new T.Vector3().subVectors(b, a), o = mesh(new T.CylinderGeometry(radius, radius, d.length(), radial), material, name, parent);
    o.position.copy(a).add(b).multiplyScalar(.5); o.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); return o;
  }
  function shapeOutline() {
    const s = new T.Shape();
    s.moveTo(1.32, 0); s.bezierCurveTo(1.28, .68, 1.7, 1.38, 2.54, 1.36);
    s.bezierCurveTo(3.02, 1.34, 3.25, .76, 3.52, .73);
    s.bezierCurveTo(3.82, 1.02, 4.03, 1.58, 4.72, 1.62);
    s.bezierCurveTo(5.55, 1.66, 5.62, .77, 5.48, 0);
    s.bezierCurveTo(5.62, -.77, 5.55, -1.66, 4.72, -1.62);
    s.bezierCurveTo(4.03, -1.58, 3.82, -1.02, 3.52, -1.03);
    s.bezierCurveTo(3.25, -.76, 3.02, -1.34, 2.54, -1.36);
    s.bezierCurveTo(1.7, -1.38, 1.28, -.68, 1.32, 0); return s;
  }
  function woodCanvas() {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const x = c.getContext('2d');
    x.fillStyle = '#c99155'; x.fillRect(0, 0, c.width, c.height);
    const grad = x.createLinearGradient(0, 0, 0, c.height); grad.addColorStop(0, 'rgba(255,235,178,.2)'); grad.addColorStop(.5, 'rgba(90,38,14,.07)'); grad.addColorStop(1, 'rgba(255,230,160,.14)'); x.fillStyle = grad; x.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 150; i++) { const y = i * 3.45 + Math.sin(i * 1.7) * 4; x.strokeStyle = `rgba(72,35,16,${.035 + (i % 5) * .009})`; x.lineWidth = .8 + (i % 3) * .25; x.beginPath(); x.moveTo(0, y); for (let j = 0; j <= 16; j++) x.lineTo(j * 64, y + Math.sin(j * .65 + i * .2) * 4); x.stroke(); }
    const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace; tex.wrapS = tex.wrapT = T.RepeatWrapping; tex.repeat.set(1.4, 1); return tex;
  }
  const topTexture = woodCanvas();
  const topMat = mat('Sitka spruce top, fine grain', { color: 0xd4a16a, map: topTexture, roughness: .39, clearcoat: .3, clearcoatRoughness: .22 });

  // Deep body, then a thin spruce soundboard with an actual circular opening.
  const shellShape = shapeOutline(); const shellHole = new T.Path(); shellHole.absarc(2.75, 0, .50, 0, Math.PI * 2); shellShape.holes.push(shellHole);
  const body = mesh(new T.ExtrudeGeometry(shellShape, { depth: .68, bevelEnabled: true, bevelSegments: 4, steps: 2, bevelSize: .10, bevelThickness: .08 }), rosewood, 'Rosewood body shell'); body.position.z = -.68;
  const topShape = shapeOutline(); const hole = new T.Path(); hole.absarc(2.75, 0, .50, 0, Math.PI * 2); topShape.holes.push(hole);
  const top = mesh(new T.ExtrudeGeometry(topShape, { depth: .07, bevelEnabled: true, bevelSegments: 2, bevelSize: .025, bevelThickness: .02 }), topMat, 'Spruce soundboard'); top.position.z = -.035;
  mesh(new T.CylinderGeometry(.47, .54, .50, 64), dark, 'Soundhole dark cavity').rotation.x = Math.PI / 2;
  const cavity = group.children[group.children.length - 1]; cavity.position.set(2.75, 0, -.29);
  const rosette1 = mesh(new T.RingGeometry(.535, .575, 72), cream, 'Rosette outer ring'); rosette1.position.set(2.75, 0, .042); rosette1.rotation.x = 0;
  const rosette2 = mesh(new T.RingGeometry(.505, .525, 72), rosewood, 'Rosette inner ring'); rosette2.position.set(2.75, 0, .044);
  // Binding follows the silhouette as a slightly larger, cream outline.
  // A line loop leaves the soundhole genuinely open while reading as binding at
  // the perimeter (a filled extruded copy would incorrectly cover the hole).
  const borderPoints = shapeOutline().getPoints().map(p => new T.Vector3(p.x * 1.012, p.y * 1.012, .035));
  const bindingMat = new T.LineBasicMaterial({ color: 0xe7d2a8, linewidth: 2 }); mats.push(bindingMat);
  const binding = new T.LineLoop(new T.BufferGeometry().setFromPoints(borderPoints), bindingMat); binding.name = 'Body cream binding'; group.add(binding); owned.push(binding);

  // Neck and tapered ebony board.
  const neckS = new T.Shape(); neckS.moveTo(-5.47, -.39); neckS.lineTo(1.84, -.59); neckS.lineTo(1.84, .59); neckS.lineTo(-5.47, .39); neckS.closePath();
  const neck = mesh(new T.ExtrudeGeometry(neckS, { depth: .47, bevelEnabled: true, bevelSegments: 4, bevelSize: .09, bevelThickness: .08 }), neckWood, 'Rounded mahogany neck'); neck.position.z = -.39;
  const boardS = new T.Shape(); boardS.moveTo(-5.43, -.335); boardS.lineTo(1.84, -.54); boardS.lineTo(1.84, .54); boardS.lineTo(-5.43, .335); boardS.closePath();
  const board = mesh(new T.ExtrudeGeometry(boardS, { depth: .075, bevelEnabled: true, bevelSegments: 2, bevelSize: .035, bevelThickness: .018 }), ebony, 'Tapered ebony fingerboard'); board.position.z = .085;
  mesh(new T.BoxGeometry(.10, .78, .10), cream, 'Bone nut').position.set(-5.43, 0, .17);
  for (let f = 1; f <= 20; f++) { const x = fx(f); const t = (x + 5.43) / 7.27, w = .67 + t * .40; const fr = mesh(new T.BoxGeometry(.026, w, .045), metal, `Fret ${f}`); fr.position.set(x, 0, .17); fr.rotation.z = 0; }
  for (const f of [3, 5, 7, 9, 15, 17]) { const p = (fx(f) + fx(f - 1)) / 2; mesh(new T.CylinderGeometry(.075, .075, .012, 20), cream, `Position dot ${f}`).rotation.x = Math.PI / 2; const d = group.children[group.children.length - 1]; d.position.set(p, 0, .17); }
  const d12 = mesh(new T.CylinderGeometry(.075, .075, .012, 20), cream, 'Double position dot 12'); d12.rotation.x = Math.PI / 2; d12.position.set((fx(11) + fx(12)) / 2, -.19, .17); const d12b = d12.clone(); d12b.name = 'Double position dot 12b'; d12b.position.y = .19; group.add(d12b); owned.push(d12b);

  // Sculpted bridge, saddle, and six individual pins.
  const bridgeShape = new T.Shape(); bridgeShape.moveTo(4.04, -.40); bridgeShape.quadraticCurveTo(4.04, -.51, 4.15, -.51); bridgeShape.lineTo(4.35, -.51); bridgeShape.quadraticCurveTo(4.46, -.51, 4.46, -.40); bridgeShape.lineTo(4.46, .40); bridgeShape.quadraticCurveTo(4.46, .51, 4.35, .51); bridgeShape.lineTo(4.15, .51); bridgeShape.quadraticCurveTo(4.04, .51, 4.04, .40); bridgeShape.closePath();
  mesh(new T.ExtrudeGeometry(bridgeShape, { depth: .19, bevelEnabled: true, bevelSegments: 3, bevelSize: .035, bevelThickness: .02 }), rosewood, 'Sculpted rosewood bridge').position.z = .105;
  const saddle = mesh(new T.BoxGeometry(.07, .88, .085), cream, 'Bridge bone saddle'); saddle.position.set(4.19, 0, .235);
  for (let s = 1; s <= 6; s++) { const pin = mesh(new T.SphereGeometry(.065, 12, 8), cream, `Bridge pin ${s}`); pin.position.set(4.39, sy(s), .225); }

  // Headstock, one continuous-looking transition from the neck, with routed posts.
  const headS = new T.Shape(); headS.moveTo(-5.38, -.39); headS.lineTo(-6.18, -.56); headS.bezierCurveTo(-6.55, -.58, -6.7, -.3, -6.64, 0); headS.bezierCurveTo(-6.7, .3, -6.55, .58, -6.18, .56); headS.lineTo(-5.38, .39); headS.closePath();
  const head = mesh(new T.ExtrudeGeometry(headS, { depth: .30, bevelEnabled: true, bevelSegments: 4, bevelSize: .10, bevelThickness: .06 }), neckWood, 'Shaped headstock'); head.position.z = -.28;
  const tuners = [];
  for (let s = 1; s <= 6; s++) { const row = s <= 3 ? -.55 : .55; const x = [-5.72, -6.03, -6.34][(s - 1) % 3]; const post = mesh(new T.CylinderGeometry(.055, .055, .34, 16), chrome, `Tuner post ${s}`); post.rotation.x = Math.PI / 2; post.position.set(x, row, .06); const gear = mesh(new T.CylinderGeometry(.13, .13, .035, 20), chrome, `Tuner gear ${s}`); gear.rotation.x = Math.PI / 2; gear.position.set(x, row, .065); const key = mesh(new T.BoxGeometry(.16, .30, .055), chrome, `Tuner oval key ${s}`); key.position.set(x - .04, row + (row < 0 ? -.16 : .16), .065); key.scale.x = .72; tuners.push({ x, y: row }); }
  // Strings are individual meshes and are routed over the nut to their actual posts.
  const strings = []; const gauges = [.004, .005, .007, .009, .012, .015];
  for (let s = 1; s <= 6; s++) { const y = sy(s); const material = (s >= 4 ? bronze : plainString).clone(); material.name = `String ${s} highlight material`; material.emissive = new T.Color(0x000000); mats.push(material); const str = rod(new T.Vector3(tuners[s - 1].x, tuners[s - 1].y, .18), new T.Vector3(-5.43, y, .20), gauges[s - 1], material, `String ${s} headstock run`, group, 8); const run = rod(new T.Vector3(-5.43, y, .20), new T.Vector3(4.22, y, .20), gauges[s - 1], material, `String ${s}`, group, 8); strings.push(run); str.userData.string = s; run.userData.string = s; }
  // A small end block and end pin reinforce the construction visually.
  const endBlock = mesh(new T.CylinderGeometry(.18, .18, .38, 20), rosewood, 'End block'); endBlock.rotation.x = Math.PI / 2; endBlock.position.set(5.43, 0, -.2);

  const fxMap = fx, syMap = sy;
  return { group, fx: fxMap, sy: syMap, strings, dispose() { const geometries = new Set(), materials = new Set(), textures = new Set(); for (const o of owned) { if (o.geometry) geometries.add(o.geometry); const list = Array.isArray(o.material) ? o.material : [o.material]; for (const m of list) if (m) { materials.add(m); if (m.map) textures.add(m.map); } } for (const m of mats) { materials.add(m); if (m.map) textures.add(m.map); } for (const g of geometries) g.dispose(); for (const t of textures) t.dispose(); for (const m of materials) m.dispose(); group.clear(); } };
}
