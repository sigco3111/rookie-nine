import * as THREE from 'three';
export const canvas = document.getElementById('gl');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0ff);
scene.fog = new THREE.Fog(0x8fd0ff, 60, 170);
export const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
const mats = {};
const M = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
scene.add(new THREE.HemisphereLight(0xffffff, 0x6aa84f, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-20, 40, 25); scene.add(sun);

function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 62 : 50; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();

// ---- 구장 ----
export function buildField() {
  const g = new THREE.Group();
  const grass = new THREE.Mesh(new THREE.CircleGeometry(150, 48), M(0x5cb85c)); grass.rotation.x = -Math.PI / 2; g.add(grass);
  // 외야 잔디 줄무늬
  for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(new THREE.RingGeometry(30 + i * 8, 34 + i * 8, 48, 1, Math.PI * 0.25 * 0 + 0, Math.PI * 2), M(i % 2 ? 0x56ae56 : 0x63c063)); s.rotation.x = -Math.PI / 2; s.position.y = 0.01; s.position.z = 0; g.add(s); }
  // 홈 중심 부채꼴은 방향 문제를 피하려고 두 원으로 구성
  const dirt = new THREE.Mesh(new THREE.CircleGeometry(7, 32), M(0xc99a63)); dirt.rotation.x = -Math.PI / 2; dirt.position.set(0, 0.04, 0); g.add(dirt);
  const dirtDiamond = new THREE.Mesh(new THREE.PlaneGeometry(27.4, 27.4), M(0xc99a63)); dirtDiamond.rotation.x = -Math.PI / 2; dirtDiamond.rotation.z = Math.PI / 4; dirtDiamond.position.set(0, 0.035, -19.4); g.add(dirtDiamond);
  const inGrass = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), M(0x63c063)); inGrass.rotation.x = -Math.PI / 2; inGrass.rotation.z = Math.PI / 4; inGrass.position.set(0, 0.045, -19.4); g.add(inGrass);
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3, 0.35, 24), M(0xc99a63)); mound.position.set(0, 0.17, -18.44); g.add(mound);
  const rubber = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.15), M(0xffffff)); rubber.position.set(0, 0.37, -18.44); g.add(rubber);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 5), M(0xffffff)); plate.position.set(0, 0.08, 0); plate.rotation.y = Math.PI; g.add(plate);
  for (const [x, z] of [[19.4, -19.4], [0, -38.8], [-19.4, -19.4]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), M(0xffffff)); b.position.set(x, 0.1, z); g.add(b); }
  // 파울라인
  const line = (a, b) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const l = new THREE.Mesh(new THREE.PlaneGeometry(0.15, len), M(0xffffff)); l.rotation.x = -Math.PI / 2; l.rotation.z = -Math.atan2(b[0] - a[0], -(b[1] - a[1])) + 0; l.position.set((a[0] + b[0]) / 2, 0.06, (a[1] + b[1]) / 2); g.add(l); };
  line([0, 0], [-80, -80]); line([0, 0], [80, -80]);
  // 외야 펜스
  const fence = new THREE.Mesh(new THREE.CylinderGeometry(95, 95, 3, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5), M(0x1f6f3a, { side: THREE.DoubleSide }));
  fence.position.set(0, 1.5, 0); fence.rotation.y = 0; g.add(fence);
  // 관중석 띠
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(112, 100, 14, 64, 1, true, Math.PI * 0.75, Math.PI * 0.5), M(0x4d6bb3, { side: THREE.DoubleSide }));
  stand.position.set(0, 7, 0); g.add(stand);
  // 백네트
  const net = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshBasicMaterial({ color: 0x223, transparent: true, opacity: 0.18, side: THREE.DoubleSide })); net.position.set(0, 3.5, 9); g.add(net);
  scene.add(g); return g;
}

// ---- 치비 선수 ----
export function makeChibi({ shirt = 0x2b6cb0, pants = 0xf2f2f2, cap = 0x1a365d, skin = 0xffd3a6, bat = false, glove = false } = {}) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.3, 0.55, 14), M(shirt)); body.position.y = 0.72; g.add(body);
  const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.45, 8), M(pants)); legL.position.set(-0.13, 0.25, 0); g.add(legL);
  const legR = legL.clone(); legR.position.x = 0.13; g.add(legR);
  const head = new THREE.Group(); head.position.y = 1.35; g.add(head);
  const face = new THREE.Mesh(new THREE.SphereGeometry(0.46, 20, 16), M(skin)); head.add(face);
  const capM = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5), M(cap)); capM.position.y = 0.03; head.add(capM);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 16, 1, false, 0, Math.PI), M(cap)); brim.position.set(0, 0.07, 0.34); brim.rotation.y = -Math.PI / 2; head.add(brim);
  for (const x of [-0.17, 0.17]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), M(0x222)); e.position.set(x, -0.04, 0.43); head.add(e); }
  const mk = (x) => { const piv = new THREE.Group(); piv.position.set(x, 0.92, 0); const a = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.4, 8), M(shirt)); a.position.y = -0.18; piv.add(a); const h = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), M(skin)); h.position.y = -0.4; piv.add(h); g.add(piv); return piv; };
  const armL = mk(-0.36), armR = mk(0.36);
  let batMesh = null;
  if (bat) { batMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.065, 0.95, 8), M(0xdeb887)); batMesh.position.set(0, -0.4, 0.0); batMesh.rotation.x = 0; armR.add(batMesh); batMesh.position.set(0, 0.05, 0.1); }
  if (glove) { const gm = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), M(0x7b4a1e)); gm.position.set(0, -0.42, 0.05); armL.add(gm); }
  g.userData = { head, armL, armR, legL, legR, body, bat: batMesh };
  return g;
}

// 타자 포즈
export function setBatterPose(c, swing) { // swing 0..1
  const u = c.userData;
  if (swing <= 0) { u.armR.rotation.set(-2.3, 0.2, 0.5); u.armL.rotation.set(-2.2, 0.1, -0.2); c.rotation.y = -Math.PI / 2 * 0.0; u.body.rotation.y = 0; u.head.rotation.y = 0.8; if (u.bat) { u.bat.rotation.set(0.4, 0, 0); u.bat.position.set(0, 0.35, 0.1); } return; }
  const s = Math.min(1, swing);
  c.userData.body.rotation.y = 0.8 - s * 2.0;
  u.armR.rotation.set(-1.6, -0.6 + s * 2.4, 0.0); u.armL.rotation.set(-1.6, -0.6 + s * 2.4, 0);
  if (u.bat) { u.bat.rotation.set(Math.PI / 2, 0, 0); u.bat.position.set(0, -0.05, 0.55); }
  u.head.rotation.y = 0.8 - s * 0.3;
}
export function setPitcherPose(c, t) { // 0 대기, 0..1 와인드업→릴리스
  const u = c.userData;
  if (t <= 0) { u.armR.rotation.set(0, 0, 0); u.armL.rotation.set(-1.2, 0, 0.3); return; }
  u.armR.rotation.x = -Math.PI * 2 * Math.min(1, t) + (t > 0.7 ? 0 : -0); u.armL.rotation.x = -1.2 + t * 0.5;
}
export function addShadow(g) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.25 })); s.rotation.x = -Math.PI / 2; s.position.y = 0.05; g.add(s); }
export const THREEX = THREE;
