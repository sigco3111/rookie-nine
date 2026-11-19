import * as THREE from 'three';
import { UNIFORMS } from './data.js';
export { UNIFORMS } from './data.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { sample as mcSample } from './mocap.js';
import { clone as skClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
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
function makeChibiProc({ shirt = 0x2b6cb0, pants = 0xf2f2f2, cap = 0x1a365d, skin = 0xffd3a6, bat = false, glove = false, helmet = false, num = 9 } = {}) {
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
  const torso = add(body, new THREE.CylinderGeometry(0.27, 0.225, 0.6, 16), shirt, 0, 0.32, 0); torso.scale.z = 0.76;torso.material.userData.isShirt=true;
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
    add(head, new THREE.SphereGeometry(0.285, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.52), cap, 0, 0.03, 0).material.userData.isCap=true;
    const fl = add(head, new THREE.SphereGeometry(0.15, 12, 10, 0, Math.PI, 0, Math.PI * 0.8), cap, -0.215, -0.06, 0.02); fl.material.userData.isCap=true;fl.rotation.y = -Math.PI / 2; fl.scale.set(0.5, 1, 1);
    const bill = add(head, new THREE.CylinderGeometry(0.28, 0.28, 0.025, 16, 1, false, 0, Math.PI), cap, 0, 0.1, 0.03); bill.material.userData.isCap=true;bill.rotation.y = -Math.PI / 2; bill.scale.set(0.5, 1, 0.9);
  } else {
    add(head, new THREE.SphereGeometry(0.275, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), cap, 0, 0.04, 0).material.userData.isCap=true;
    const brim = add(head, new THREE.CylinderGeometry(0.34, 0.34, 0.03, 18, 1, false, 0, Math.PI), cap, 0, 0.075, 0.02); brim.material.userData.isCap=true;brim.rotation.y = -Math.PI / 2; brim.scale.set(0.8, 1, 1);
    add(head, new THREE.SphereGeometry(0.045, 8, 8), 0xffffff, 0, 0.16, 0.245).scale.set(1, 1, 0.3);
  }
  // 팔: 소매 + 손(+글러브)
  let armGlove = null;
  const mkArm = (x) => { const piv = new THREE.Group(); piv.position.set(x, 1.38, 0);
    add(piv, new THREE.SphereGeometry(0.095, 10, 8), shirt).material.userData.isShirt=true;
    add(piv, new THREE.CylinderGeometry(0.078, 0.066, 0.4, 10), shirt, 0, -0.2, 0).material.userData.isShirt=true;
    add(piv, new THREE.CylinderGeometry(0.07, 0.07, 0.04, 10), 0xffffff, 0, -0.38, 0);
    add(piv, new THREE.SphereGeometry(0.065, 10, 8), skin, 0, -0.44, 0);
    g.add(piv); return piv; };
  const armL = mkArm(-0.34), armR = mkArm(0.34);
  if (glove) { armGlove = add(armL, new THREE.SphereGeometry(0.15, 12, 10), 0x7b4a1e, 0, -0.5, 0.08); armGlove.scale.set(1, 1.1, 0.55);
    add(armL, new THREE.SphereGeometry(0.05, 8, 8), 0x5a3414, 0.1, -0.44, 0.1); }
  let batMesh = null;
  if (bat) { batMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.068, 0.95, 10), M(0xdeb887)); armR.add(batMesh); batMesh.position.set(0, 0.05, 0.1); }
  g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
  const throwHand=new THREE.Object3D();throwHand.position.set(0,-.44,0);armR.add(throwHand);
  g.userData = { head, armL, armR, legL, legR, body, throwHand,hasBat:!!bat,hasGlove:!!glove,bat: batMesh, glove: armGlove, shoes: [shL, shR] };
  return g;
}


// ---- Quaternius Ultimate Animated Character Pack (CC0) 기반 선수 ----
let kBase = null, kImg = null; const kTex = {};
const USE_PROC = new URLSearchParams(location.search).has('proc');
if (!USE_PROC) {
  const base = import.meta.env.BASE_URL || './';
  for(let attempt=0;attempt<2&&!kBase;attempt++){
    const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
    try{
      const response=await fetch(base+'models/player.fbx',{...(attempt?{cache:'reload'}:{}),signal:controller.signal});
      if(!response.ok)throw new Error('player model HTTP '+response.status);
      const buf=await response.arrayBuffer();kBase=new FBXLoader().parse(buf,'./');
    }catch(e){const status=document.getElementById('boot-status');if(status)status.textContent=attempt===0?'선수 자료를 다시 불러오고 있어요.':'기본 선수로 경기장을 준비하고 있어요.';if(attempt===1){console.warn('player model load failed after retry',e);kBase=null;}}finally{clearTimeout(timeout);}
  }
}
const css = (c) => '#' + new THREE.Color(c).getHexString();
function kTexture(shirt, pants, trim, redShoes) {
  const key = shirt + '|' + pants + '|' + trim + '|' + (redShoes ? 1 : 0); if (kTex[key]) return kTex[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = 1024; const x = cv.getContext('2d'); x.drawImage(kImg, 0, 0);
  x.fillStyle = shirt; x.fillRect(150, 490, 345, 534); x.fillStyle = trim; x.fillRect(150, 490, 345, 22); x.fillRect(150, 1000, 345, 24); x.fillRect(150, 490, 10, 534); x.fillRect(485, 490, 10, 534);
  x.fillStyle = shirt; x.fillRect(42, 490, 72, 534); x.fillRect(528, 490, 70, 534); x.fillStyle = '#ffffff'; x.fillRect(300, 780, 80, 90);
  x.fillStyle = pants; x.fillRect(611, 764, 413, 260); x.fillStyle = '#111'; x.fillRect(611, 895, 413, 12);
  if (redShoes) { const id = x.getImageData(639, 134, 185, 390), d = id.data; for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2]; if (g > r + 40 && g > b + 10) { d[i] = 229; d[i + 1] = 57; d[i + 2] = 53; } } x.putImageData(id, 639, 134); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; kTex[key] = t; return t;
}
const kAll = [];
const Q = (e) => new THREE.Quaternion().setFromEuler(e);
function makeKenney({ shirt = 0x2b6cb0, pants = 0xf2f2f2, cap = 0x1a365d, bat = false, glove = false, helmet = false } = {}) {
  const g = new THREE.Group(); const inner = new THREE.Group(); g.add(inner);
  const q = skClone(kBase); inner.add(q);
  const pcss = css(pants === 0xf2f2f2 ? 0xe9e9e9 : pants), scss = css(shirt), ccss = css(cap);
  const skinC = 0xd9a87c, hairC = 0x2a1c10;
  const B = {}; q.traverse((b) => { if (b.isBone) B[b.name] = b; if (b.isMesh) { b.frustumCulled = false; b.castShadow = true;
    const list = (Array.isArray(b.material) ? b.material : [b.material]).map((m) => { const n = new THREE.MeshLambertMaterial({ color: 0xffffff }); const nm = m.name;
      n.color.set(nm === 'Skin' ? skinC : nm === 'Shirt' ? (n.userData.isShirt = true, shirt) : nm === 'Pants' ? (pants === 0xf2f2f2 ? 0xeeeeee : pants) : nm === 'Hair' ? hairC : nm === 'Belt' ? 0x222222 : nm === 'Face' ? 0xfff3dc : m.color); return n; });
    b.material = list.length === 1 ? list[0] : list; } });
  Object.assign(B, { Spine: B.Abdomen, LeftArm: B.UpperArmL, RightArm: B.UpperArmR, LeftHand: B.FistL, RightHand: B.FistR, LeftForeArm: B.LowerArmL, RightForeArm: B.LowerArmR, LeftUpLeg: B.UpperLegL, RightUpLeg: B.UpperLegR });
  const H = 1.9; { const bb = new THREE.Box3().setFromObject(q); q.scale.multiplyScalar(H / (bb.max.y - bb.min.y)); }
  g.updateMatrixWorld(true);
  const wq = (b) => b.getWorldQuaternion(new THREE.Quaternion());
  const wp = (b) => b.getWorldPosition(new THREE.Vector3());
  const arms = [['LeftArm', 'LeftHand', 'LeftForeArm'], ['RightArm', 'RightHand', 'RightForeArm']].map(([a, h, f]) => ({ bone: B[a], hand: B[h], fore: B[f], sign: Math.sign(wp(B[a]).x) }));
  const armPlus = arms.find((a) => a.sign > 0), armMinus = arms.find((a) => a.sign < 0); // +x쪽 = 칩비 armR
  const legs = [['LeftUpLeg'], ['RightUpLeg']].map(([n]) => ({ bone: B[n], x: wp(B[n]).x }));
  const legPlus = legs.find((l) => l.x > 0).bone, legMinus = legs.find((l) => l.x <= 0).bone;
  const rest = {}; for (const n of ['Spine', 'Head', 'LeftArm', 'RightArm', 'LeftUpLeg', 'RightUpLeg', 'LeftForeArm', 'RightForeArm']) rest[B[n].name] = wq(B[n]); rest.Spine = rest[B.Spine.name]; rest.Head = rest[B.Head.name];
  // --- 모캡 리타깃 준비: 바인드(휴식) 자세의 월드 회전/방향 ---
  const RQ = {}, RD = {}; for (const n in B) { if (B[n] && B[n].isBone) RQ[n] = wq(B[n]); }
  const dirTo = (a, b) => wp(b).sub(wp(a)).normalize();
  const bn = (n) => B[n];
  Object.assign(RD, { UpperArmL: dirTo(B.UpperArmL, B.LowerArmL), LowerArmL: dirTo(B.LowerArmL, B.FistL), UpperArmR: dirTo(B.UpperArmR, B.LowerArmR), LowerArmR: dirTo(B.LowerArmR, B.FistR),
    UpperLegL: dirTo(B.UpperLegL, B.LowerLegL), LowerLegL: dirTo(B.LowerLegL, B.LowerLegL.children[0] || B.FootL), UpperLegR: dirTo(B.UpperLegR, B.LowerLegR), LowerLegR: dirTo(B.LowerLegR, B.LowerLegR.children[0] || B.FootR) });
  const legEnd = { L: B.LowerLegL.children[0], R: B.LowerLegR.children[0] };
  const restFootY = wp(legEnd.L).y; const restHipY = wp(B.UpperLegL).y; const modelLeg = restHipY - restFootY;
  const down = () => new THREE.Quaternion();
  const Dplus = down(1), Dminus = down(-1);
  const proxy = () => new THREE.Group();
  const u = { head: proxy(), armL: proxy(), armR: proxy(), legL: proxy(), legR: proxy(), body: proxy() };
  u.armL.rotation.order = u.armR.rotation.order = 'YXZ'; u.armL.elbow = u.armR.elbow = 0;
  // 부착물 앵커 (머리: 바인드 방향 상쇄, 손: 팔을 내린 자세 기준 상쇄)
  const anchor = (bone, cancelQ, sc = 1) => { const gr = new THREE.Group(); gr.quaternion.copy(cancelQ.clone().invert()); const ws = bone.getWorldScale(new THREE.Vector3()).x; const wrap = new THREE.Group(); wrap.scale.setScalar(sc / ws); wrap.add(gr); bone.add(wrap); return gr; };
  const mt = (c) => new THREE.MeshLambertMaterial({ color: c });
  { const a = anchor(B.Head, rest.Head, 1), m = mt(cap); m.userData.isCap = true; // 모자 또는 헬멧
    const dome = new THREE.Mesh(new THREE.SphereGeometry(helmet ? 0.34 : 0.325, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.position.set(0, 0.36, 0);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.025, 16, 1, false, -Math.PI / 2, Math.PI), m); brim.position.set(0, 0.37, 0.23); brim.scale.set(1, 1, helmet ? 0.8 : 1.1);
    a.add(dome, brim);
    if (helmet) { const fl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8, 0, Math.PI, 0, Math.PI * 0.8), m); fl.position.set(armPlus.sign * 0.27, 0.22, 0); fl.scale.setScalar(1.3); fl.rotation.y = Math.PI / 2; fl.scale.set(0.6, 1, 1); a.add(fl); }
    const logo = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); logo.position.set(0, 0.68, 0.22); logo.scale.set(1, 1, 0.3); a.add(logo);
    u.hat = a; }
  const gold = { bat: false };
  u.bat = new THREE.Group(); u.bat.material = { color: { set() {} } }; u.glove = null;
  const shoes = [], shoeMat = mt(0x222222), trimMat = mt(0xe6e7e9);
  const upperGeo = new THREE.SphereGeometry(1, 10, 7), soleGeo = new THREE.SphereGeometry(1, 10, 5), laceGeo = new THREE.BoxGeometry(.105,.012,.018);
  for (const n of ['FootL', 'FootR']) {
    const fa2 = anchor(B[n], wq(B[n]), 1);
    const sh = new THREE.Mesh(upperGeo, shoeMat); sh.scale.set(.12,.09,.24); sh.position.set(0,.09,.10); sh.castShadow=true;fa2.add(sh);shoes.push(sh);
    const sole = new THREE.Mesh(soleGeo, trimMat);sole.name='shoe-sole';sole.scale.set(.125,.03,.245);sole.position.set(0,.075,.10);fa2.add(sole);
    for(const z of [.14,.19,.24]){const lace=new THREE.Mesh(laceGeo,trimMat);lace.name='shoe-lace';lace.position.set(0,.10+.09*Math.sqrt(1-((z-.10)/.24)**2),z);fa2.add(lace);}
  }
  u.shoes = shoes;
  const mkBat = () => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.05, 0.85, 10), mt(0xdeb887));
    // 본체 색과 독립된 그립. 타격 판정과 배트 길이는 그대로 둔다.
    const gripMat=mt(0x252934),lineMat=mt(0x78818f);
    const grip=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.25,10),gripMat);grip.name='bat-grip';grip.position.y=-.28;b.add(grip);
    const ringGeo=new THREE.TorusGeometry(.053,.0035,4,10);
    for(const y of [-.37,-.32,-.27,-.22,-.17]){const ring=new THREE.Mesh(ringGeo,lineMat);ring.name='bat-grip-wrap';ring.rotation.x=Math.PI/2;ring.position.y=y;b.add(ring);}
    const knob=new THREE.Mesh(new THREE.CylinderGeometry(.068,.068,.024,10),gripMat);knob.name='bat-knob';knob.position.y=-.426;b.add(knob);
    const a = anchor(armPlus.hand, wq(armPlus.hand), 1); b.scale.y = 1.25; b.position.set(0, 0.34 * 1.25, 0.02); a.add(b); a.userData.hand = armPlus.hand; b.castShadow = true; return b;
  };
  if (bat) { const b = mkBat(); u.bat = new THREE.Group(); u.bat.material = b.material; u.batMesh = b; u.batAnchor = b.parent; u.bat.rotation.set(-0.5, 0, 0); }
  if (glove) {
    const a = anchor(armMinus.hand, wq(armMinus.hand), 1);
    const outline = new THREE.Shape();
    outline.moveTo(-0.08, -0.15);
    outline.quadraticCurveTo(-0.19, -0.10, -0.19, 0.03);
    outline.quadraticCurveTo(-0.22, 0.13, -0.16, 0.14);
    outline.lineTo(-0.10, 0.07); outline.lineTo(-0.09, 0.23);
    outline.quadraticCurveTo(-0.075, 0.27, -0.05, 0.23);
    outline.lineTo(-0.035, 0.12); outline.lineTo(-0.02, 0.27);
    outline.quadraticCurveTo(0, 0.30, 0.025, 0.26);
    outline.lineTo(0.04, 0.12); outline.lineTo(0.065, 0.24);
    outline.quadraticCurveTo(0.09, 0.27, 0.11, 0.22);
    outline.lineTo(0.11, 0.10); outline.lineTo(0.14, 0.19);
    outline.quadraticCurveTo(0.18, 0.21, 0.18, 0.14);
    outline.lineTo(0.17, -0.01); outline.quadraticCurveTo(0.16, -0.13, 0.06, -0.15); outline.closePath();
    const geo = new THREE.ExtrudeGeometry(outline, { depth: 0.09, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.018, bevelSegments: 2, steps: 1, curveSegments: 6 });
    geo.translate(0, 0, -0.045); geo.rotateZ(Math.PI / 2);
    const gl = new THREE.Mesh(geo, mt(0x7b4a1e)); gl.scale.set(1, 1.15, 0.6); gl.position.set(0, -0.08, 0.1); a.add(gl); gl.castShadow = true;
    // 손 방향이 바뀌어도 보이도록 양면에 포켓 바느질을 둔다.
    for (const side of [-1, 1]) {
      const seam = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.008, 4, 14, Math.PI * 1.4), mt(0xe6bd86));
      seam.position.set(0.005, 0, side * 0.073); seam.rotation.z = Math.PI * 0.2; gl.add(seam);
    }
    u.glove = gl;
  }
  // 장식(별/띠)은 부착 대상으로 리다이렉트
  { const hA = u.hat; u.head.add = (o) => { o.position.set(0, 0.72, 0.1); o.scale.setScalar(1.4); hA.add(o); return u.head; }; const fa = anchor(armPlus.fore, wq(armPlus.fore), 1); u.armR.add = (o) => { o.position.set(0, -0.2, 0); fa.add(o); return u.armR; }; }
  const posedBones = [['Spine', null], ['Head', null]];
  const order = [
    { bone: B.Spine, rest: rest.Spine, src: u.body, kind: 'spine' }, { bone: B.Head, rest: rest.Head, src: u.head, kind: 'head' },
    { bone: armPlus.bone, rest: rest[armPlus.bone.name], D: Dplus, src: u.armR, kind: 'arm' }, { bone: armMinus.bone, rest: rest[armMinus.bone.name], D: Dminus, src: u.armL, kind: 'arm' },
    { bone: armPlus.fore, rest: rest[armPlus.fore.name], D: Dplus, src: u.armR, kind: 'fore' }, { bone: armMinus.fore, rest: rest[armMinus.fore.name], D: Dminus, src: u.armL, kind: 'fore' },
    { bone: legPlus, rest: rest[legPlus.name], src: u.legR, kind: 'leg' }, { bone: legMinus, rest: rest[legMinus.name], src: u.legL, kind: 'leg' },
  ];
  g.userData = u; g.userData.isKenney = true; u.throwHand = armPlus.hand; u.hasBat = !!bat; u.hasGlove = !!glove; u.mocap = null;
  const frameQ = (up, side) => { const y = up.clone().normalize(); const x = side.clone().sub(y.clone().multiplyScalar(side.dot(y))).normalize(); const z = new THREE.Vector3().crossVectors(x, y); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); };
  const setW = (bone, W, invG) => { const par = bone.parent; par.updateWorldMatrix(true, false); const pq = par.getWorldQuaternion(new THREE.Quaternion()).premultiply(invG); bone.quaternion.copy(pq.invert().multiply(W)); };
  const mocapSync = () => {
    const m = u.mocap, J = mcSample(m.clip, m.f, m), invG = g.getWorldQuaternion(new THREE.Quaternion()).invert();
    const sub = (a, b) => J[a].clone().sub(J[b]);
    const hipSide = sub('hpL', 'hpR'), shSide = sub('shL', 'shR');
    const spineUp = sub('chest', 'hips'), upper = sub('neck', 'chest');
    if (m.lean != null) { const Y = new THREE.Vector3(0, 1, 0); for (const v of [spineUp, upper]) { const l = v.length(); v.normalize().lerp(Y, m.lean).normalize().multiplyScalar(l); } }
    const qPel = frameQ(spineUp, hipSide), qSh = frameQ(upper, shSide);
    const qMid = qPel.clone().slerp(qSh, 0.5);
    const rq = (n) => RQ[B[n].name] || RQ[n];
    setW(B.Body, qPel.clone().multiply(RQ.Body), invG);
    setW(B.Abdomen, frameQ(spineUp.clone().lerp(upper, 0.5), hipSide.clone().lerp(shSide, 0.5)).multiply(RQ.Abdomen), invG);
    setW(B.Torso, qSh.clone().multiply(RQ.Torso), invG);
    setW(B.Head, frameQ(sub('head', 'neck').normalize().lerp(upper.clone().normalize(), 0.55), shSide).multiply(RQ.Head), invG);
    const lim = (a, b, n) => new THREE.Quaternion().setFromUnitVectors(RD[n], sub(a, b).normalize()).multiply(RQ[n]);
    for (const S of ['L', 'R']) {
      setW(B['UpperArm' + S], lim('el' + S, 'sh' + S, 'UpperArm' + S), invG);
      setW(B['LowerArm' + S], lim('wr' + S, 'el' + S, 'LowerArm' + S), invG);
      setW(B['UpperLeg' + S], lim('kn' + S, 'hp' + S, 'UpperLeg' + S), invG);
      setW(B['LowerLeg' + S], lim('an' + S, 'kn' + S, 'LowerLeg' + S), invG);
    }
    // 뿌리 이동: 모캡 hips를 모델 다리 길이 비율로 축소, 발이 바닥을 뚫지 않게 높이 보정
    const k = modelLeg / 0.9; inner.position.set(J.hips.x * k * (m.travel ?? 1), 0, J.hips.z * k * (m.travel ?? 1)); g.updateWorldMatrix(true, true);
    let minY = 1e9; for (const S of ['L', 'R']) minY = Math.min(minY, wp(legEnd[S]).y - g.getWorldPosition(new THREE.Vector3()).y / Math.max(1e-6, g.scale.y));
    const lift = (restFootY - minY); inner.position.y = lift; g.updateWorldMatrix(true, true);
    for (const S of ['L', 'R']) { const foot = B['Foot' + S], e = wp(legEnd[S]); foot.position.copy(foot.parent.worldToLocal(e.clone())); foot.position.y = Math.max(foot.position.y, 0);
      const heading = Math.atan2(J['to' + S].x - J['an' + S].x, J['to' + S].z - J['an' + S].z); const W = Q(new THREE.Euler(0, heading, 0)).multiply(RQ['Foot' + S]); setW(foot, W, invG); }
    if (u.batAnchor) { const gq = g.getWorldQuaternion(new THREE.Quaternion());
      const fa = sub('wrR', 'elR').add(sub('wrL', 'elL')).normalize();
      const d0 = fa.clone().add(new THREE.Vector3(0, m.batUp ?? 0.35, 0)).normalize();
      const hz = new THREE.Vector3(fa.x, 0, fa.z); if (hz.lengthSq() < 1e-4) hz.set(0, 0, 1); hz.normalize();
      const d1 = hz.clone().add(new THREE.Vector3(0, m.batUp2 ?? 0.1, 0)).normalize();
      const dir = d0.clone().lerp(d1, m.batBlend ?? 0).normalize();
      // 윗손(R)을 배트 손잡이 위쪽으로 2본 IK
      const Sw = wp(B.UpperArmR), Ew = wp(B.LowerArmR), Fw = wp(B.FistR), Lf = wp(B.FistL);
      const l1 = Ew.distanceTo(Sw), l2 = Fw.distanceTo(Ew), hl = wp(B.UpperArmL).distanceTo(wp(B.LowerArmL));
      const T = Lf.clone().add(dir.clone().applyQuaternion(gq).multiplyScalar(hl * 0.55));
      const a = T.clone().sub(Sw); let dist = Math.min(a.length(), l1 + l2 - 1e-3); a.normalize();
      const x = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist), hh = Math.sqrt(Math.max(0, l1 * l1 - x * x));
      const pole = Ew.clone().sub(Sw).normalize(); const perp = pole.sub(a.clone().multiplyScalar(pole.dot(a))).normalize();
      const E2 = Sw.clone().add(a.clone().multiplyScalar(x)).add(perp.multiplyScalar(hh)), T2 = Sw.clone().add(a.clone().multiplyScalar(dist));
      const toL = (v) => v.clone().normalize().applyQuaternion(invG);
      setW(B.UpperArmR, new THREE.Quaternion().setFromUnitVectors(RD.UpperArmR, toL(E2.clone().sub(Sw))).multiply(RQ.UpperArmR), invG);
      setW(B.LowerArmR, new THREE.Quaternion().setFromUnitVectors(RD.LowerArmR, toL(T2.clone().sub(E2))).multiply(RQ.LowerArmR), invG);
      const hand = u.batAnchor.userData.hand; g.updateWorldMatrix(true, true); const hq = hand.getWorldQuaternion(new THREE.Quaternion()).premultiply(invG);
      const target = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); u.batAnchor.quaternion.copy(hq.invert().multiply(target)); }
  };
  const sync = () => {
    g.updateWorldMatrix(true, true);
    const invG = g.getWorldQuaternion(new THREE.Quaternion()).invert();
    inner.scale.set(u.body.scale.x, 1, u.body.scale.z); if (!u.mocap) inner.position.set(0, 0, 0);
    u.sync_after = true;
    if (u.mocap) { mocapSync(); } else
    for (const o of order) {
      const d = Q(o.src.rotation); let W = d.clone();
      if (o.kind === 'spine') W = Q(new THREE.Euler(u.body.rotation.x, u.body.rotation.y, 0, 'YXZ')).multiply(o.rest);
      else if (o.kind === 'head') W = d.multiply(o.rest);
      else if (o.kind === 'arm') W = d.multiply(o.D).multiply(o.rest);
      else if (o.kind === 'fore') W = Q(new THREE.Euler(-(o.src.elbow || 0), 0, 0)).multiply(d).multiply(o.D).multiply(o.rest);
      else W = d.multiply(o.rest);
      const par = o.bone.parent; par.updateWorldMatrix(true, false);
      const pq = par.getWorldQuaternion(new THREE.Quaternion()).premultiply(invG);
      o.bone.quaternion.copy(pq.invert().multiply(W));
    }
    if (u.batAnchor && !u.mocap) { const hand = u.batAnchor.userData.hand; hand.updateWorldMatrix(true, false); const hq = hand.getWorldQuaternion(new THREE.Quaternion()).premultiply(invG);
      const yaw = Q(new THREE.Euler(0, u.body.rotation.y, 0)); const target = yaw.multiply(Q(u.bat.rotation));
      u.batAnchor.quaternion.copy(hq.invert().multiply(target)); }
  };
  g.userData.sync = sync; kAll.push(g); sync();
  return g;
}
const _render = renderer.render.bind(renderer);
renderer.render = (s, c) => { for (const g of kAll) { if (g.visible && g.parent) g.userData.sync(); } _render(s, c); };
export function makeChibi(o = {}) { return kBase ? makeKenney(o) : makeChibiProc(o); }


const MC = !/nomocap=1/.test(location.search);
const seg = (x, pts) => { for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const [a, fa] = pts[i - 1], [b, fb] = pts[i]; return fa + (fb - fa) * (x - a) / (b - a); } return pts[pts.length - 1][1]; };
function mcBatter(c, swing) { const u = c.userData;
  const s = swing < 0 ? 0 : swing; // -1 중립도 스탠스
  const f = swing <= 0 ? 16 : seg(s, [[0, 24], [0.34, 35], [1, 56]]); // swing.json은 프레임 50에서 시작: 16=스탠스(66), 24=74 시작, 40=90, 76=126
  const bl = Math.max(0, Math.min(1, (s - 0.08) / 0.2)); // 컨택트 직전에 배트를 수평으로
  u.mocap = { clip: 'swing', f, mirror: false, yaw: 0, travel: 0.4, batBlend: swing <= 0 ? 0 : bl * (s > 0.7 ? Math.max(0, 1 - (s - 0.7) / 0.3) : 1), batUp2: 0.1 };
}
function mcPitcher(c, t) { const u = c.userData;
  const f = t <= 0 ? 0 : seg(t, [[0, 10], [0.5, 66], [0.65, 84], [1, 110], [1.2, 125]]);
  u.mocap = { clip: 'pitch', f, mirror: true, yaw: 0.8, travel: 1, lean: 0.55 };
}
export function clearMocap(c) { c.userData.mocap = null; }
// 타자 포즈
const lerp = (a, b, t) => a + (b - a) * t;
function kBatter(c, swing) { const u = c.userData;
  u.armR.rotation.order = u.armL.rotation.order = 'YXZ';
  if (swing < 0) { u.armR.rotation.set(-0.3, 0, -0.15); u.armL.rotation.set(-0.3, 0, 0.15); u.armR.elbow = u.armL.elbow = 0.7; u.body.rotation.set(0, 0, 0); u.head.rotation.y = 0; u.bat.rotation.set(-0.9, 0, -0.2); return; }
  if (swing <= 0) { u.armR.rotation.set(-0.55, 0, -0.35); u.armL.rotation.set(-0.55, 0, 0.35); u.armR.elbow = u.armL.elbow = 1.75; u.body.rotation.set(0.05, 0.8, 0); u.head.rotation.y = 0.8; u.bat.rotation.set(-1.0, 0, -0.1); return; }
  const s = Math.min(1, swing), yaw = 0.8 - s * 2.0;
  u.body.rotation.set(0.05, yaw, 0); u.head.rotation.y = 0.8 - s * 0.3;
  u.armR.rotation.set(-1.35, yaw, -0.05); u.armL.rotation.set(-1.35, yaw, 0.05); u.armR.elbow = u.armL.elbow = lerp(1.7, 0.25, Math.min(1, s * 1.6)); u.bat.rotation.set(lerp(-0.5, Math.PI / 2, Math.min(1, s * 2.2)), 0, 0);
}
export function setBatterPose(c, swing) { // swing 0..1, -1=중립
  const u = c.userData; if (u.isKenney && MC && u.hasBat) return mcBatter(c, swing); if (u.isKenney) { u.mocap = null; return kBatter(c, swing); }
  if (swing < 0) { u.armR.rotation.set(0, 0, 0.1); u.armL.rotation.set(0, 0, -0.1); u.body.rotation.y = 0; u.head.rotation.y = 0; if (u.bat) { u.bat.rotation.set(0.4, 0, 0); u.bat.position.set(0.0, -0.3, 0.1); } return; }
  if (swing <= 0) { u.armR.rotation.set(-2.3, 0.2, 0.5); u.armL.rotation.set(-2.2, 0.1, -0.2); c.rotation.y = -Math.PI / 2 * 0.0; u.body.rotation.y = 0; u.head.rotation.y = 0.8; if (u.bat) { u.bat.rotation.set(0.4, 0, 0); u.bat.position.set(0, 0.35, 0.1); } return; }
  const s = Math.min(1, swing);
  c.userData.body.rotation.y = 0.8 - s * 2.0;
  u.armR.rotation.set(-1.6, -0.6 + s * 2.4, 0.0); u.armL.rotation.set(-1.6, -0.6 + s * 2.4, 0);
  if (u.bat) { u.bat.rotation.set(Math.PI / 2, 0, 0); u.bat.position.set(0, -0.05, 0.55); }
  u.head.rotation.y = 0.8 - s * 0.3;
}
function kPitcher(c, t) { const u = c.userData; u.armR.rotation.order = u.armL.rotation.order = 'YXZ';
  if (t <= 0) { u.armR.rotation.set(-0.5, 0, -0.1); u.armL.rotation.set(-0.7, 0, 0.1); u.armR.elbow = 1.6; u.armL.elbow = 1.6; u.body.rotation.set(0.05, 0, 0); u.legL.rotation.x = u.legR.rotation.x = 0; u.head.rotation.x = 0; return; }
  const k = Math.min(1.2, t);
  if (k < 0.4) { const a = k / 0.4; u.armR.rotation.set(lerp(-0.5, 0.9, a), 0, -0.1); u.armL.rotation.set(lerp(-0.7, -1.5, a), 0, 0.1); u.armR.elbow = lerp(1.6, 0.6, a); u.armL.elbow = lerp(1.6, 0.5, a); u.body.rotation.set(lerp(0.05, -0.2, a), 0, 0); u.legL.rotation.x = lerp(0, -1.3, a); u.legR.rotation.x = 0; }
  else if (k < 0.75) { const a = (k - 0.4) / 0.35; u.armR.rotation.set(lerp(0.9, 2.7, a), 0, -0.2); u.armL.rotation.set(-1.5, 0, 0.3); u.armR.elbow = lerp(0.6, 1.5, a); u.armL.elbow = 0.6; u.body.rotation.set(lerp(-0.2, -0.35, a), 0, 0); u.legL.rotation.x = lerp(-1.3, -0.5, a); u.legR.rotation.x = lerp(0, 0.3, a); }
  else { const a = Math.min(1, (k - 0.75) / 0.25); u.armR.rotation.set(lerp(2.7, -1.6, a), 0, -0.1); u.armL.rotation.set(lerp(-1.5, -0.2, a), 0, 0.5); u.armR.elbow = lerp(1.5, 0.15, a); u.armL.elbow = 1.2; u.body.rotation.set(lerp(-0.35, 0.55, a), 0, 0); u.legL.rotation.x = lerp(-0.5, -0.2, a); u.legR.rotation.x = lerp(0.3, 0.1, a); }
}
export function setPitcherPose(c, t) { // 0 대기, 0..1 와인드업→릴리스
  const u = c.userData; if (u.isKenney && MC && u.hasGlove) return mcPitcher(c, t); if (u.isKenney) { u.mocap = null; return kPitcher(c, t); } u.body.rotation.x = t > 0 ? Math.sin(Math.min(1, t) * Math.PI) * 0.25 : 0;
  if (t <= 0) { u.armR.rotation.set(0, 0, 0); u.armL.rotation.set(-1.2, 0, 0.3); return; }
  u.armR.rotation.x = -Math.PI * 2 * Math.min(1, t) + (t > 0.7 ? 0 : -0); u.armL.rotation.x = -1.2 + t * 0.5;
}
export function addShadow(g) { const s = new THREE.Mesh(new THREE.CircleGeometry(0.4, 16), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.25 })); s.rotation.x = -Math.PI / 2; s.position.y = 0.05; g.add(s); }
export const THREEX = THREE;
window.__rk = { THREE, scene, camera, renderer, makeChibi, setBatterPose, setPitcherPose };

// 학년별 셔츠와 같은 계열의 짙은 모자/헬멧
export function setUniform(ch, year) { setShirt(ch, UNIFORMS[Math.max(0, Math.min(2, year - 1))]); }
export function setShirt(ch, c) {
  const capColor = new THREE.Color(c).multiplyScalar(0.48);
  ch.traverse(b => { if (b.isMesh) for (const m of (Array.isArray(b.material) ? b.material : [b.material])) {
    if (m?.color && m.userData?.isShirt) m.color.set(c);
    if (m?.color && m.userData?.isCap) m.color.copy(capColor);
  } });
}
export const OPP_COLORS = [0xc53030, 0x7b3fa0, 0x9aa3ad, 0x2f2f38, 0x3a8f3a, 0xb5486a, 0x8a5a2b, 0x2a9fb5];
