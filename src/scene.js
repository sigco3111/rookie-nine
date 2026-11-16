import * as THREE from 'three';
export const canvas = document.getElementById('gl');
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8fd0ff);
scene.fog = new THREE.Fog(0x8fd0ff, 60, 170);
export const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 400);
const mats = {};
const M = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
scene.add(new THREE.HemisphereLight(0xffffff, 0x6aa84f, 1.0));
const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-20, 40, 25); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); { const c = sun.shadow.camera; c.left = -45; c.right = 45; c.top = 45; c.bottom = -45; c.near = 1; c.far = 120; } sun.target.position.set(0, 0, -20); scene.add(sun.target); scene.add(sun);

function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.fov = w / h < 0.8 ? 62 : 50; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();

// ---- 구장 ----
export function buildField() {
  const g = new THREE.Group();
  const grass = new THREE.Mesh(new THREE.CircleGeometry(150, 48), M(0x5cb85c)); grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; g.add(grass);
  // 외야 잔디 줄무늬
  for (let i = 0; i < 8; i++) { const s = new THREE.Mesh(new THREE.RingGeometry(30 + i * 8, 34 + i * 8, 48, 1, Math.PI * 0.25 * 0 + 0, Math.PI * 2), M(i % 2 ? 0x56ae56 : 0x63c063)); s.rotation.x = -Math.PI / 2; s.position.y = 0.01; s.position.z = 0; g.add(s); }
  // 홈 중심 부채꼴은 방향 문제를 피하려고 두 원으로 구성
  const dirt = new THREE.Mesh(new THREE.CircleGeometry(7, 32), M(0xc99a63)); dirt.rotation.x = -Math.PI / 2; dirt.position.set(0, 0.04, 0); dirt.receiveShadow = true; g.add(dirt);
  const dirtDiamond = new THREE.Mesh(new THREE.PlaneGeometry(27.4, 27.4), M(0xc99a63)); dirtDiamond.rotation.x = -Math.PI / 2; dirtDiamond.rotation.z = Math.PI / 4; dirtDiamond.position.set(0, 0.035, -19.4); dirtDiamond.receiveShadow = true; g.add(dirtDiamond);
  const inGrass = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), M(0x63c063)); inGrass.rotation.x = -Math.PI / 2; inGrass.rotation.z = Math.PI / 4; inGrass.position.set(0, 0.045, -19.4); inGrass.receiveShadow = true; g.add(inGrass);
  const mound = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 3, 0.35, 24), M(0xc99a63)); mound.position.set(0, 0.17, -18.44); g.add(mound);
  const rubber = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.06, 0.15), M(0xffffff)); rubber.position.set(0, 0.37, -18.44); g.add(rubber);
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 5), M(0xffffff)); plate.position.set(0, 0.08, 0); plate.rotation.y = Math.PI; g.add(plate);
  for (const [x, z] of [[19.4, -19.4], [0, -38.8], [-19.4, -19.4]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.6), M(0xffffff)); b.position.set(x, 0.1, z); g.add(b); }
  // 파울라인
  const line = (a, b) => { const len = Math.hypot(b[0] - a[0], b[1] - a[1]); const l = new THREE.Mesh(new THREE.PlaneGeometry(0.15, len), M(0xffffff)); l.rotation.x = -Math.PI / 2; l.rotation.z = -Math.atan2(b[0] - a[0], -(b[1] - a[1])) + 0; l.position.set((a[0] + b[0]) / 2, 0.06, (a[1] + b[1]) / 2); g.add(l); };
  line([0, 0], [-80, -80]); line([0, 0], [80, -80]);
  // 외야 펜스
  const fence = new THREE.Mesh(new THREE.CylinderGeometry(95, 95, 3, 64, 1, true, Math.PI * 0.3, Math.PI * 1.4), M(0x1f6f3a, { side: THREE.DoubleSide }));
  fence.position.set(0, 1.5, 0); fence.rotation.y = 0; g.add(fence);
  // 관중석 띠
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(112, 100, 14, 64, 1, true, Math.PI * 0.3, Math.PI * 1.4), M(0x4d6bb3, { side: THREE.DoubleSide }));
  stand.position.set(0, 7, 0); g.add(stand);
  // 관중: 색 점 인스턴스
  const cm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 1.6, 0.6), new THREE.MeshLambertMaterial({ color: 0xffffff }), 2200);
  const dm = new THREE.Object3D(); const cols = [0xff6b6b, 0xffd23f, 0x4dabf7, 0xffffff, 0x69db7c, 0xf783ac];
  for (let i = 0; i < 2200; i++) { const a = Math.PI * 0.3 + Math.random() * Math.PI * 1.4; const r = 101 + Math.random() * 9; const y = 1 + (r - 101) * 1.4; dm.position.set(Math.sin(a) * r, y, Math.cos(a) * r); dm.lookAt(0, y, 0); dm.updateMatrix(); cm.setMatrixAt(i, dm.matrix); cm.setColorAt(i, new THREE.Color(cols[i % cols.length])); }
  g.add(cm);
  // 백네트
  const net = new THREE.Mesh(new THREE.PlaneGeometry(14, 7), new THREE.MeshBasicMaterial({ color: 0x223, transparent: true, opacity: 0.18, side: THREE.DoubleSide })); net.position.set(0, 3.5, 9); net.name = 'net'; g.add(net);
  // 백스톱 벽 + 홈 뒤 스탠드(투구 시점에서 빈 하늘을 덮는다)
  const wall = new THREE.Mesh(new THREE.BoxGeometry(46, 5, 1), M(0x1f5f3a)); wall.position.set(0, 2.5, 15); g.add(wall);
  const band = new THREE.Mesh(new THREE.BoxGeometry(46, 0.8, 1.05), M(0xf2c94c)); band.position.set(0, 3.6, 15); g.add(band);
  const back = new THREE.Mesh(new THREE.BoxGeometry(110, 22, 2), M(0x35508f)); back.position.set(0, 11, 30); g.add(back);
  for (let r = 0; r < 4; r++) { const t = new THREE.Mesh(new THREE.BoxGeometry(110, 1.2, 8), M(r % 2 ? 0x44609f : 0x3a5594)); t.position.set(0, 5 + r * 4, 25 + r * 1.5); g.add(t); }
  const hc = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 1.1, 0.5), new THREE.MeshLambertMaterial({ color: 0xffffff }), 600);
  const hd = new THREE.Object3D(); const hcol = [0xff6b6b, 0xffd23f, 0x4dabf7, 0xffffff, 0x69db7c, 0xf783ac];
  for (let i = 0; i < 600; i++) { const row = i % 4; hd.position.set((Math.random() - 0.5) * 100, 6.2 + row * 4, 22.5 + row * 1.5); hd.updateMatrix(); hc.setMatrixAt(i, hd.matrix); hc.setColorAt(i, new THREE.Color(hcol[i % 6])); }
  g.add(hc);
  // 전광판 + 조명탑
  const sb = new THREE.Mesh(new THREE.BoxGeometry(30, 11, 1.5), M(0x161a24)); sb.position.set(0, 20, -112); g.add(sb);
  const sbp = new THREE.Mesh(new THREE.BoxGeometry(27, 8, 0.2), new THREE.MeshBasicMaterial({ color: 0x1b5e3a })); sbp.position.set(0, 20, -111.2); g.add(sbp);
  for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 0.1), new THREE.MeshBasicMaterial({ color: i < 4 ? 0xffd23f : 0xff6b6b })); d.position.set(-9 + i * 2.25, 20, -111.05); g.add(d); }
  for (const a of [-1.0, -0.55, 0.55, 1.0]) { const x = Math.sin(a) * 118, z = -Math.cos(a) * 118; const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 38, 8), M(0x8a909c)); pole.position.set(x, 19, z); g.add(pole); const head = new THREE.Mesh(new THREE.BoxGeometry(9, 5, 1.2), new THREE.MeshBasicMaterial({ color: 0xfff6c8 })); head.position.set(x, 40, z); head.lookAt(0, 20, 0); g.add(head); }
  scene.add(g); return g;
}

// ---- 치비 선수 ----
export function makeChibi({ shirt = 0x2b6cb0, pants = 0xf2f2f2, cap = 0x1a365d, skin = 0xffd3a6, bat = false, glove = false, helmet = false, num = 9 } = {}) {
  const g = new THREE.Group();
  const add = (parent, geo, color, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, M(color)); m.position.set(x, y, z); parent.add(m); return m; };
  // 다리: 바지 + 스터럽 양말 + 스파이크
  const mkLeg = (x) => { const l = new THREE.Group(); l.position.set(x, 0.86, 0);
    add(l, new THREE.CylinderGeometry(0.118, 0.105, 0.5, 12), pants, 0, -0.26, 0);
    add(l, new THREE.CylinderGeometry(0.088, 0.082, 0.3, 10), cap, 0, -0.58, 0);
    add(l, new THREE.CylinderGeometry(0.09, 0.09, 0.06, 10), 0xffffff, 0, -0.5, 0);
    const sh = add(l, new THREE.BoxGeometry(0.17, 0.09, 0.32), 0x222222, 0, -0.81, 0.06); g.add(l); return [l, sh]; };
  const [legL, shL] = mkLeg(-0.12), [legR, shR] = mkLeg(0.12);
  // 몸통: 유니폼 상의 + 벨트 + 등번호
  const body = new THREE.Group(); body.position.set(0, 0.86, 0); g.add(body);
  add(body, new THREE.CylinderGeometry(0.22, 0.205, 0.2, 14), pants, 0, 0.02, 0).scale.z = 0.78;
  const torso = add(body, new THREE.CylinderGeometry(0.27, 0.225, 0.6, 16), shirt, 0, 0.32, 0); torso.scale.z = 0.76;
  add(body, new THREE.CylinderGeometry(0.228, 0.228, 0.06, 16), 0x2b2b2b, 0, 0.1, 0).scale.z = 0.78;
  add(body, new THREE.TorusGeometry(0.1, 0.03, 8, 14), 0xffffff, 0, 0.62, 0).rotation.x = Math.PI / 2;
  { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); c.fillStyle = '#fff'; c.font = 'bold 44px sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(num), 32, 34);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv), transparent: true })); pl.position.set(0, 0.36, -0.2); pl.rotation.y = Math.PI; body.add(pl); }
  // 머리: 목, 얼굴, 귀, 눈썹, 눈, 코, 입, 머리카락
  const head = new THREE.Group(); head.position.y = 1.67; g.add(head);
  add(head, new THREE.CylinderGeometry(0.085, 0.095, 0.16, 10), skin, 0, -0.22, 0);
  const face = add(head, new THREE.SphereGeometry(0.25, 24, 18), skin); face.scale.set(0.92, 1.02, 0.95);
  for (const x of [-1, 1]) { add(head, new THREE.SphereGeometry(0.05, 10, 8), skin, x * 0.235, -0.01, 0).scale.z = 0.6;
    const eye = add(head, new THREE.SphereGeometry(0.034, 10, 8), 0x1a1a1a, x * 0.09, -0.01, 0.222); eye.scale.set(0.9, 1.4, 0.5);
    const hl = add(head, new THREE.SphereGeometry(0.01, 6, 6), 0xffffff, x * 0.09 + 0.01, 0.005, 0.238);
    const br = add(head, new THREE.BoxGeometry(0.085, 0.016, 0.02), 0x2a2018, x * 0.095, 0.065, 0.225); br.rotation.z = -x * 0.12;
    add(head, new THREE.SphereGeometry(0.03, 8, 6), 0xff9c8a, x * 0.15, -0.075, 0.19).scale.set(1, 0.6, 0.4); }
  add(head, new THREE.SphereGeometry(0.03, 8, 8), 0xe8b48a, 0, -0.04, 0.245).scale.set(0.9, 0.9, 0.7);
  add(head, new THREE.BoxGeometry(0.065, 0.012, 0.012), 0x8a3b2e, 0, -0.115, 0.232);
  add(head, new THREE.SphereGeometry(0.262, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.64), 0x2a2018, 0, 0.02, -0.025);
  if (helmet) {
    add(head, new THREE.SphereGeometry(0.285, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), cap, 0, 0.03, 0);
    const fl = add(head, new THREE.SphereGeometry(0.15, 12, 10, 0, Math.PI, 0, Math.PI * 0.8), cap, -0.215, -0.06, 0.02); fl.rotation.y = -Math.PI / 2; fl.scale.set(0.5, 1, 1);
    const bill = add(head, new THREE.CylinderGeometry(0.28, 0.28, 0.025, 16, 1, false, 0, Math.PI), cap, 0, 0.1, 0.03); bill.rotation.y = -Math.PI / 2; bill.scale.set(0.5, 1, 0.9);
  } else {
    add(head, new THREE.SphereGeometry(0.275, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), cap, 0, 0.04, 0);
    const brim = add(head, new THREE.CylinderGeometry(0.34, 0.34, 0.03, 18, 1, false, 0, Math.PI), cap, 0, 0.075, 0.02); brim.rotation.y = -Math.PI / 2; brim.scale.set(0.8, 1, 1);
    add(head, new THREE.SphereGeometry(0.045, 8, 8), 0xffffff, 0, 0.16, 0.245).scale.set(1, 1, 0.3);
  }
  // 팔: 소매 + 손(+글러브)
  let armGlove = null;
  const mkArm = (x) => { const piv = new THREE.Group(); piv.position.set(x, 1.38, 0);
    add(piv, new THREE.SphereGeometry(0.095, 10, 8), shirt);
    add(piv, new THREE.CylinderGeometry(0.078, 0.066, 0.4, 10), shirt, 0, -0.2, 0);
    add(piv, new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), 0xffffff, 0, -0.38, 0);
    add(piv, new THREE.SphereGeometry(0.065, 10, 8), skin, 0, -0.44, 0);
    g.add(piv); return piv; };
  const armL = mkArm(-0.34), armR = mkArm(0.34);
  if (glove) { armGlove = add(armL, new THREE.SphereGeometry(0.15, 12, 10), 0x7b4a1e, 0, -0.5, 0.08); armGlove.scale.set(1, 1.1, 0.55);
    add(armL, new THREE.SphereGeometry(0.05, 8, 8), 0x5a3414, 0.1, -0.44, 0.1); }
  let batMesh = null;
  if (bat) { batMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.068, 0.95, 10), M(0xdeb887)); armR.add(batMesh); batMesh.position.set(0, 0.05, 0.1); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  g.userData = { head, armL, armR, legL, legR, body, bat: batMesh, glove: armGlove, shoes: [shL, shR] };
  return g;
}

// 타자 포즈
export function setBatterPose(c, swing) { // swing 0..1, -1=중립
  const u = c.userData;
  if (swing < 0) { u.armR.rotation.set(0, 0, 0.1); u.armL.rotation.set(0, 0, -0.1); u.body.rotation.y = 0; u.head.rotation.y = 0; if (u.bat) { u.bat.rotation.set(0.4, 0, 0); u.bat.position.set(0.0, -0.3, 0.1); } return; }
  if (swing <= 0) { u.armR.rotation.set(-2.3, 0.2, 0.5); u.armL.rotation.set(-2.2, 0.1, -0.2); c.rotation.y = -Math.PI / 2 * 0.0; u.body.rotation.y = 0; u.head.rotation.y = 0.8; if (u.bat) { u.bat.rotation.set(0.4, 0, 0); u.bat.position.set(0, 0.35, 0.1); } return; }
  const s = Math.min(1, swing);
  c.userData.body.rotation.y = 0.8 - s * 2.0;
  u.armR.rotation.set(-1.6, -0.6 + s * 2.4, 0.0); u.armL.rotation.set(-1.6, -0.6 + s * 2.4, 0);
  if (u.bat) { u.bat.rotation.set(Math.PI / 2, 0, 0); u.bat.position.set(0, -0.05, 0.55); }
  u.head.rotation.y = 0.8 - s * 0.3;
}
export function setPitcherPose(c, t) { // 0 대기, 0..1 와인드업→릴리스
  const u = c.userData; u.body.rotation.x = t > 0 ? Math.sin(Math.min(1, t) * Math.PI) * 0.25 : 0;
  if (t <= 0) { u.armR.rotation.set(0, 0, 0); u.armL.rotation.set(-1.2, 0, 0.3); return; }
  u.armR.rotation.x = -Math.PI * 2 * Math.min(1, t) + (t > 0.7 ? 0 : -0); u.armL.rotation.x = -1.2 + t * 0.5;
}
export function addShadow(g) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.25 })); s.rotation.x = -Math.PI / 2; s.position.y = 0.05; g.add(s); }
export const THREEX = THREE;
