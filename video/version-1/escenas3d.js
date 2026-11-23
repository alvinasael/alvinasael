/* Escenas 3D del video de GLP-1 (Three.js r149, local en vendor/).
 * Todo es función del tiempo del guion (τ): el mismo τ siempre da el mismo cuadro.
 *   NH3D.plato(τ)   0–3.2  plato de arroz con habichuelas, la cámara se acerca y baja
 *   NH3D.tunel(τ)   2.6–6.6 interior del intestino; las células sueltan GLP-1
 *   NH3D.vaso(τ)    5.9–20.3 viaje por el vaso sanguíneo: GLP-1 natural se deshace, el medicamento se queda
 * Cada función devuelve el canvas WebGL (1080×1920) listo para dibujar con drawImage.
 */
window.NH3D = (function () {
  const W = 1080, H = 1920;
  THREE.ColorManagement.legacyMode = false;   // los colores hex se interpretan como sRGB (sin deslavarse)
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: false });
  renderer.setPixelRatio(1); renderer.setSize(W, H, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const prog = (t, s, d) => clamp((t - s) / d, 0, 1);
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  const col = h => new THREE.Color(h);

  // ── Piezas compartidas ──────────────────────────────────────────────────
  // GLP-1: péptido en hélice (tubo que sigue una espiral)
  class Helix extends THREE.Curve { getPoint(t, out = new THREE.Vector3()) { const a = t * Math.PI * 2 * 3.2; return out.set(Math.cos(a) * .16, Math.sin(a) * .16, (t - .5) * 1.25); } }
  const helixGeo = new THREE.TubeGeometry(new Helix(), 140, .07, 10, false);
  const glpMat = () => new THREE.MeshStandardMaterial({ color: col('#3D5C4F'), emissive: col('#2B4038'), emissiveIntensity: .25, roughness: .35, metalness: .05, transparent: true });
  const tagGeo = new THREE.SphereGeometry(.11, 20, 16);
  const tagMat = new THREE.MeshStandardMaterial({ color: col('#C4832B'), emissive: col('#C4832B'), emissiveIntensity: .45, roughness: .4, transparent: true });

  // Glóbulo rojo: disco bicóncavo (perfil girado)
  const rbcPts = [];
  for (let i = 0; i <= 24; i++) { const u = i / 24, r = u * 1.0, h = (.12 + .55 * Math.pow(u, 2) - .48 * Math.pow(u, 4)) * Math.sqrt(Math.max(0, 1 - Math.pow(u, 8))); rbcPts.push(new THREE.Vector2(r, h * .55)); }
  for (let i = 24; i >= 0; i--) { const p = rbcPts[i]; rbcPts.push(new THREE.Vector2(p.x, -p.y)); }
  const rbcGeo = new THREE.LatheGeometry(rbcPts.filter((p, i, a) => i === 0 || p.distanceTo(a[i - 1]) > 1e-4), 40);
  rbcGeo.computeVertexNormals();

  // ── Escena 1: el plato ──────────────────────────────────────────────────
  const s1 = new THREE.Scene(); s1.background = col('#F2ECE2');
  const cam1 = new THREE.PerspectiveCamera(42, W / H, .05, 80);
  s1.add(new THREE.HemisphereLight(0xfff6ea, 0xd8c8b4, .9));
  const sun = new THREE.DirectionalLight(0xfff1df, 1.25); sun.position.set(3, 8, 4); s1.add(sun);
  const mesa = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: col('#EDE3D3'), roughness: .95 }));
  mesa.rotation.x = -Math.PI / 2; s1.add(mesa);
  const platoMat = new THREE.MeshStandardMaterial({ color: col('#FFFFFF'), roughness: .25, metalness: .02 });
  const plato = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 1.9, .14, 72), platoMat); plato.position.y = .07; s1.add(plato);
  const borde = new THREE.Mesh(new THREE.TorusGeometry(2.2, .08, 14, 90), platoMat); borde.rotation.x = Math.PI / 2; borde.position.y = .17; s1.add(borde);
  const linea = new THREE.Mesh(new THREE.TorusGeometry(1.95, .012, 8, 90), new THREE.MeshStandardMaterial({ color: col('#C4832B'), roughness: .5 })); linea.rotation.x = Math.PI / 2; linea.position.y = .15; s1.add(linea);
  (function comida() {
    const R = rng(11);
    // arroz: montículo de granos
    const grano = new THREE.CapsuleGeometry(.032, .07, 4, 6);
    const arroz = new THREE.InstancedMesh(grano, new THREE.MeshStandardMaterial({ color: col('#F7F1E4'), roughness: .7 }), 900);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    for (let i = 0; i < 900; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * .95, h = .16 + .55 * Math.pow(1 - d / .95, 1.2) * R() ** .3;
      e.set(R() * 3, R() * 3, R() * 3); q.setFromEuler(e); m.compose(new THREE.Vector3(-.55 + Math.cos(a) * d, h, -.25 + Math.sin(a) * d * .9), q, new THREE.Vector3(1, 1, 1)); arroz.setMatrixAt(i, m); }
    s1.add(arroz);
    // habichuelas: elipsoides rojizos con salsa
    const salsa = new THREE.Mesh(new THREE.CircleGeometry(.62, 40), new THREE.MeshStandardMaterial({ color: col('#7A3326'), roughness: .35 })); salsa.rotation.x = -Math.PI / 2; salsa.position.set(.8, .155, -.45); s1.add(salsa);
    const hab = new THREE.InstancedMesh(new THREE.SphereGeometry(.075, 12, 10), new THREE.MeshStandardMaterial({ color: col('#8C3A2A'), roughness: .3 }), 70);
    for (let i = 0; i < 70; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * .52; e.set(0, R() * 3, R() * .6); q.setFromEuler(e);
      m.compose(new THREE.Vector3(.8 + Math.cos(a) * d, .19 + R() * .07, -.45 + Math.sin(a) * d), q, new THREE.Vector3(1.45, .82, .95)); hab.setMatrixAt(i, m); }
    s1.add(hab);
    // ensalada: hojas verdes y tomate
    const hoja = new THREE.InstancedMesh(new THREE.SphereGeometry(.16, 12, 8), new THREE.MeshStandardMaterial({ color: col('#5E8C4A'), roughness: .6 }), 26);
    for (let i = 0; i < 26; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * .5; e.set(R(), R() * 3, R()); q.setFromEuler(e);
      m.compose(new THREE.Vector3(.35 + Math.cos(a) * d, .22 + R() * .1, .75 + Math.sin(a) * d * .8), q, new THREE.Vector3(1.4, .35, 1)); hoja.setMatrixAt(i, m); }
    s1.add(hoja);
    for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.SphereGeometry(.13, 18, 14), new THREE.MeshStandardMaterial({ color: col('#C2453A'), roughness: .3 })); t.scale.set(1, .6, 1); t.position.set(.2 + i * .19, .27, .6 + (i % 2) * .22); s1.add(t); }
    // tostones (plátano)
    for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.27, .29, .07, 26), new THREE.MeshStandardMaterial({ color: col('#D9A441'), roughness: .55 }));
      t.position.set(-.95 + i * .32, .2 + i * .02, .72 - i * .12); t.rotation.set(.15, 0, -.12 + i * .1); s1.add(t); }
  })();
  function plato_(tau) {
    const p = ease(prog(tau, 0, 3.1));
    cam1.position.set(lerp(1.2, .05, p), lerp(7.6, .9, p), lerp(6.4, .55, p));
    cam1.lookAt(lerp(.1, .02, p), lerp(0, .2, p), lerp(0, -.1, p));
    cam1.fov = lerp(42, 50, p); cam1.updateProjectionMatrix();
    renderer.render(s1, cam1); return renderer.domElement;
  }

  // ── Escena 2: el intestino ──────────────────────────────────────────────
  const s2 = new THREE.Scene(); s2.background = col('#5A2A26'); s2.fog = new THREE.Fog(0x5a2a26, 2, 15);
  const cam2 = new THREE.PerspectiveCamera(70, W / H, .02, 40);
  s2.add(new THREE.HemisphereLight(0xffe2d6, 0x6a2a24, .7));
  const lamp2 = new THREE.PointLight(0xfff0e4, 1.6, 9, 1.6); s2.add(lamp2);
  const path2 = new THREE.CatmullRomCurve3([[0, 0, 0], [.6, .3, -4], [-.5, -.2, -8], [.4, .5, -12], [-.3, 0, -16], [.5, -.3, -20], [0, .2, -24]].map(p => new THREE.Vector3(...p)));
  const tunGeo = new THREE.TubeGeometry(path2, 420, 1.55, 56, false);
  (function vellosidades() {
    const pos = tunGeo.attributes.position, uv = tunGeo.attributes.uv, cnt = pos.count, P = new THREE.Vector3(), c = new THREE.Vector3(), colArr = new Float32Array(cnt * 3);
    const base = col('#E0A090'), deep = col('#B8645A');
    for (let i = 0; i < cnt; i++) {
      const u = uv.getX(i), v = uv.getY(i);
      P.fromBufferAttribute(pos, i); path2.getPointAt(clamp(u, 0, 1), c);
      const dir = P.clone().sub(c).normalize();
      const fold = .5 + .5 * Math.sin(u * 300 + Math.sin(v * 6.283 * 3) * .9), villi = Math.pow(.5 + .5 * Math.sin(u * 2600) * Math.sin(v * 6.283 * 26), 3);
      const inward = .3 * Math.pow(fold, 2) + .07 * villi;
      P.addScaledVector(dir, -inward); pos.setXYZ(i, P.x, P.y, P.z);
      const k = clamp(.25 + .75 * (1 - fold) + .2 * villi, 0, 1); const cc = deep.clone().lerp(base, k); colArr.set([cc.r, cc.g, cc.b], i * 3);
    }
    tunGeo.setAttribute('color', new THREE.BufferAttribute(colArr, 3)); tunGeo.computeVertexNormals();
  })();
  s2.add(new THREE.Mesh(tunGeo, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.BackSide, roughness: .55, metalness: 0 })));
  // células L (puntos ámbar en la pared) que sueltan GLP-1
  const LC = []; (function () { const R = rng(23), c = new THREE.Vector3(), t = new THREE.Vector3(), n = new THREE.Vector3(), b = new THREE.Vector3();
    for (let i = 0; i < 26; i++) { const u = .04 + i * .0145 + R() * .006, a = R() * 6.283; path2.getPointAt(u, c); path2.getTangentAt(u, t);
      n.set(0, 1, 0).cross(t).normalize(); b.copy(t).cross(n).normalize(); const dir = n.clone().multiplyScalar(Math.cos(a)).addScaledVector(b, Math.sin(a));
      const wall = c.clone().addScaledVector(dir, .95);
      const cell = new THREE.Mesh(new THREE.SphereGeometry(.13, 18, 14), new THREE.MeshStandardMaterial({ color: col('#E2B35C'), emissive: col('#C4832B'), emissiveIntensity: .6, roughness: .4 })); cell.position.copy(wall); s2.add(cell);
      const g = new THREE.Mesh(helixGeo, glpMat()); s2.add(g);
      LC.push({ u, wall, dir, cell, g, t0: 2.7 + i * .1 + R() * .15, spin: R() * 6.28 }); } })();
  function tunel_(tau) {
    const u = lerp(.0, .36, ease(prog(tau, 2.5, 4.3))), p = new THREE.Vector3(), la = new THREE.Vector3();
    path2.getPointAt(u, p); path2.getPointAt(Math.min(1, u + .03), la);
    cam2.position.copy(p); cam2.lookAt(la); lamp2.position.copy(p);
    LC.forEach(o => {
      const age = tau - o.t0, a = prog(age, 0, 1.6);
      o.cell.material.emissiveIntensity = .4 + 1.4 * Math.max(0, 1 - Math.abs(age - .1) * 2);
      o.g.visible = age > 0; if (!o.g.visible) return;
      const pos = o.wall.clone().addScaledVector(o.dir, -easeOut(a) * .32); pos.y += Math.sin(tau * 2 + o.spin) * .05;
      o.g.position.copy(pos); o.g.rotation.set(o.spin + tau * .9, tau * .6, o.spin); o.g.scale.setScalar(.15 + .4 * easeOut(prog(age, 0, .7)));
      o.g.material.emissiveIntensity = .25 + .8 * Math.max(0, 1 - age);
    });
    renderer.render(s2, cam2); return renderer.domElement;
  }

  // ── Escena 3: el vaso sanguíneo ─────────────────────────────────────────
  const s3 = new THREE.Scene(); s3.background = col('#3E1210'); s3.fog = new THREE.Fog(0x3e1210, 4, 34);
  const cam3 = new THREE.PerspectiveCamera(62, W / H, .05, 60);
  s3.add(new THREE.HemisphereLight(0xffd8cc, 0x5a1814, .75));
  const key3 = new THREE.DirectionalLight(0xfff0e6, .9); key3.position.set(2, 4, 3); s3.add(key3);
  const lamp3 = new THREE.PointLight(0xffe6da, 1.1, 14, 1.5); s3.add(lamp3);
  const VR = 3.4, VL = 240;
  const vasoGeo = new THREE.CylinderGeometry(VR, VR, VL, 72, 480, true); vasoGeo.rotateX(Math.PI / 2); vasoGeo.translate(0, 0, -VL / 2 + 10);
  (function pared() { const pos = vasoGeo.attributes.position, P = new THREE.Vector3(), n = pos.count, colArr = new Float32Array(n * 3), a = col('#B25548'), b = col('#8E3A32');
    for (let i = 0; i < n; i++) { P.fromBufferAttribute(pos, i); const ang = Math.atan2(P.y, P.x), z = P.z;
      const w = .18 * Math.sin(z * .45 + ang * 3) + .1 * Math.sin(z * 1.3 - ang * 5) + .05 * Math.sin(ang * 17 + z * 2.1);
      const r = VR + w; P.x = Math.cos(ang) * r; P.y = Math.sin(ang) * r; pos.setXYZ(i, P.x, P.y, P.z);
      const k = clamp(.5 + w * 2.2, 0, 1), c = b.clone().lerp(a, k); colArr.set([c.r, c.g, c.b], i * 3); }
    vasoGeo.setAttribute('color', new THREE.BufferAttribute(colArr, 3)); vasoGeo.computeVertexNormals(); })();
  s3.add(new THREE.Mesh(vasoGeo, new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.BackSide, roughness: .8 })));
  // plasma: puntitos de luz para dar profundidad
  (function () { const R = rng(5), n = 700, arr = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const a = R() * 6.283, d = Math.sqrt(R()) * (VR - .3); arr.set([Math.cos(a) * d, Math.sin(a) * d, 8 - R() * 200], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    s3.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0xffd9c8, size: .035, transparent: true, opacity: .55, depthWrite: false }))); })();
  const RB = []; const rbcMat = new THREE.MeshStandardMaterial({ color: col('#B0443A'), roughness: .42, metalness: 0, emissive: col('#3a0c0a'), emissiveIntensity: .25 });
  (function () { const R = rng(9); for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(rbcGeo, rbcMat); s3.add(m);
    const a = R() * 6.283, d = .6 + Math.sqrt(R()) * (VR - 1.4); RB.push({ m, x: Math.cos(a) * d, y: Math.sin(a) * d, z0: -R() * 60, v: .7 + R() * .8, rx: R() * 6, ry: R() * 6, sr: (R() - .5) * 1.2, s: .55 + R() * .2 }); } })();
  const NAT = [], MED = []; (function () { const R = rng(31);
    for (let i = 0; i < 9; i++) { const g = new THREE.Mesh(helixGeo, glpMat()); s3.add(g); const a = R() * 6.283, d = .4 + Math.sqrt(R()) * 1.6; NAT.push({ g, x: Math.cos(a) * d, y: Math.sin(a) * d, z: -6 - i * 2.4 - R() * 1.5, ph: R() * 6.28, die: 8.2 + i * .42 }); }
    for (let i = 0; i < 12; i++) { const g = new THREE.Mesh(helixGeo, glpMat()), tag = new THREE.Mesh(tagGeo, tagMat.clone()); g.add(tag); tag.position.set(.18, -.05, .2); s3.add(g);
      const a = R() * 6.283, d = .3 + Math.sqrt(R()) * 1.7; MED.push({ g, tag, x: Math.cos(a) * d, y: Math.sin(a) * d, z: -4 - i * 2.1 - R() * 1.4, ph: R() * 6.28, born: 13.3 + i * .22 }); } })();
  function vaso_(tau) {
    const t = tau - 5.9, camZ = 6 - t * 2.1;
    cam3.position.set(Math.sin(t * .35) * .35, Math.cos(t * .27) * .25, camZ);
    cam3.lookAt(Math.sin(t * .35 + .6) * .5, Math.cos(t * .3) * .2, camZ - 8);
    lamp3.position.set(0, .6, camZ - 1.5);
    RB.forEach(o => { let z = o.z0 - o.v * t; const rel = ((z - camZ) % 62 + 62) % 62 - 58; o.m.position.set(o.x, o.y, camZ + rel); o.m.rotation.set(o.rx + t * o.sr, o.ry + t * o.sr * .7, 0); o.m.scale.setScalar(o.s); });
    NAT.forEach(o => { const z = camZ + o.z + Math.max(0, t) * .3, life = 1 - prog(tau, o.die, 1.1), pop = Math.sin(prog(tau, o.die, 1.1) * Math.PI);
      o.g.visible = life > .01; o.g.position.set(o.x + Math.sin(t + o.ph) * .15, o.y + Math.cos(t * .8 + o.ph) * .15, z);
      o.g.rotation.set(o.ph + t * .8, t * .5, o.ph); o.g.scale.setScalar(Math.max(.01, life) * (1 + pop * .35));
      o.g.material.opacity = life; o.g.material.emissiveIntensity = .25 + pop * 1.4; });
    MED.forEach(o => { const a = easeOut(prog(tau, o.born, .8)), z = camZ + o.z + Math.max(0, tau - o.born) * .2;
      o.g.visible = a > .01; o.g.position.set(o.x + Math.sin(t + o.ph) * .15, o.y + Math.cos(t * .8 + o.ph) * .15, z);
      o.g.rotation.set(o.ph + t * .7, t * .45, o.ph); o.g.scale.setScalar(.2 + .8 * a); o.g.material.opacity = a; o.tag.material.opacity = a;
      o.g.material.emissiveIntensity = .25 + .9 * Math.max(0, 1 - (tau - o.born)); });
    renderer.render(s3, cam3); return renderer.domElement;
  }

  return { plato: plato_, tunel: tunel_, vaso: vaso_, canvas: renderer.domElement };
})();
