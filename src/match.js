import { TRAITS } from './data.js';
import { THREEX as THREE, scene, camera, renderer, makeChibi, setBatterPose, setPitcherPose, addShadow, setUniform, setShirt, OPP_COLORS } from './scene.js';
import { cal, battingAssist, oppStrength, teamStrength, isRegular, rnd, chance, applyMatchResult } from './growth.js';
import { TEAMS } from './data.js';
import { sfx } from './audio.js';

const ZW = 0.45, ZH = 0.4, ZY = 0.9;
const PITCHES = [{ n: '직구', Tm: 1, c: 0, drop: 0 }, { n: '커브', Tm: 1.38, c: 0.55, drop: 0.35 }, { n: '슬라이더', Tm: 1.12, c: -0.5, drop: 0.1 }, { n: '체인지업', Tm: 1.28, c: 0.05, drop: 0.2 }];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let G = null; // 현재 씬 요소
const tickers = new Set();
const permanent = new Set();
export const addTicker = (f) => tickers.add(f);
export const delTicker = (f) => tickers.delete(f);
let last = performance.now();
export function frame() { const n = performance.now(); const dt = window.__dt || Math.min(0.05, (n - last) / 1000); last = n; for (const f of [...tickers]) f(dt, n / 1000); for (const f of permanent) f(dt); renderer.render(scene, camera); requestAnimationFrame(frame); }

function ensureG() {
  if (G) return G;
  const g = new THREE.Group();
  const batter = makeChibi({ shirt: 0x2b6cb0, cap: 0x1a365d, bat: true, helmet: true, num: 9 }); batter.position.set(-0.5, 0, 0.2); batter.scale.setScalar(0.72); batter.rotation.y = Math.PI / 2 - 1.4; addShadow(batter); setBatterPose(batter, 0); g.add(batter);
  const pitcher = makeChibi({ shirt: 0xc53030, cap: 0x742a2a, glove: true }); pitcher.position.set(0, 0.35, -18.44); pitcher.scale.setScalar(1.3); g.add(pitcher);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); ball.visible = false; g.add(ball);
  const bshadow = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35 })); bshadow.rotation.x = -Math.PI / 2; bshadow.position.y = 0.07; bshadow.renderOrder = 2; g.add(bshadow);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 16), new THREE.MeshBasicMaterial({ color: 0xd33 })); ball.add(seam);
  const zone = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(ZW * 2, ZH * 2)), new THREE.LineBasicMaterial({ color: 0xffffff })); zone.position.set(0, ZY, 0); g.add(zone);
  const ret = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.2, 28), new THREE.MeshBasicMaterial({ color: 0xffd23f, side: THREE.DoubleSide, depthTest: false })); ret.position.set(0, ZY, 0.05); ret.renderOrder = 10; g.add(ret);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.018, 8), new THREE.MeshBasicMaterial({ color: 0xffd23f, depthTest: false })); dot.renderOrder = 10; ret.add(dot);
  const catcher = makeChibi({ shirt: 0x444444, cap: 0x222222, glove: true }); catcher.position.set(0, 0, 1.3); catcher.rotation.y = Math.PI; catcher.scale.setScalar(0.0001); g.add(catcher);
  const fielders = [[-24, -34], [0, -42], [24, -34], [-52, -62], [0, -72], [52, -62], [-14, -24], [14, -24]].map(([x, z], i) => { const f = makeChibi({ shirt: 0xc53030, cap: 0x742a2a, glove: true }); f.position.set(x, 0, z); f.scale.setScalar(2.2); f.rotation.y = Math.atan2(-x, 0 - z) ; f.userData.home = [x, z]; addShadow(f); g.add(f); return f; });
  
  const runner = makeChibi({ shirt: 0x2b6cb0, cap: 0x1a365d, helmet: true, num: 9 }); runner.visible = false; runner.scale.setScalar(1.6); g.add(runner);
  scene.add(g); G = { g, batter, pitcher, ball, zone, ret, fielders, runner, bshadow }; permanent.add((dt) => { const b = G.ball; G.bshadow.visible = b.visible; G.bshadow.position.x = b.position.x; G.bshadow.position.z = b.position.z; const sc2 = Math.max(0.5, 1.4 - b.position.y * 0.1); G.bshadow.scale.setScalar(sc2); });
  return G;
}
let homeAnim = null;
export function playTrainingAnim(kind) { homeAnim = { kind, t: 0 }; }
function applyLook(a, p) {
  if (!p) return; const u = a.userData; const pw = p.pos === 'pit' ? p.velo : p.power; const st = p.stamina || 30;
  const w = 0.9 + Math.min(0.4, Math.max(0, (pw - 30) / 140) + Math.max(0, (st - 30) / 300));
  u.body.scale.x = w; u.body.scale.z = w; u.armL.scale.x = u.armR.scale.x = 0.9 + (w - 0.9) * 1.2; u.legL.scale.x = u.legR.scale.x = 0.95 + (w - 0.9) * 0.8;
  const n = p.traits.filter((t) => TRAITS[t] && TRAITS[t].good).length;
  if (!u.star) { u.star = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd23f })); u.star.position.set(0, 0.29, 0.1); u.head.add(u.star); }
  u.star.visible = n >= 1; u.star.scale.setScalar(0.8 + Math.min(n, 4) * 0.35);
  if (!u.band) { u.band = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 6, 12), new THREE.MeshBasicMaterial({ color: 0xff5a5a })); u.band.rotation.x = Math.PI / 2; u.band.position.y = -0.3; u.armR.add(u.band); }
  u.band.visible = p.will >= 50;
  const gr = p.gear || {};
  if (u.bat) u.bat.material.color.set(gr.bat ? 0xf2c94c : 0xdeb887);
  if (u.glove) { u.glove.material.color.set(gr.glove ? 0xf2c94c : 0x7b4a1e); u.glove.scale.set(gr.glove ? 1.2 : 1, gr.glove ? 1.3 : 1.1, 0.55); }
  for (const s of u.shoes) s.material.color.set(gr.shoes ? 0xe53935 : 0x222222);
}
export function showHome(pos, pl) { const pit = pos === 'pit'; // 홈 화면 배경: 선수가 대기/훈련 모션
  const o = ensureG(); o.g.visible = true; o.ret.visible = false; o.zone.visible = false; o.ball.visible = false;
  o.batter.position.set(-0.6, 0, 0.3); o.batter.rotation.y = Math.PI / 2 - 0.5; o.batter.scale.setScalar(0.44);
  for (const fd of o.fielders) { fd.position.set(fd.userData.home[0], 0, fd.userData.home[1]); fd.visible = !pit; }
  o.batter.visible = !pit; o.pitcher.visible = true; o.pitcher.position.set(pit ? -0.6 : 0, pit ? 0 : 0.35, pit ? 0.3 : -18.44); o.pitcher.rotation.y = pit ? Math.PI / 2 - 0.9 : 0; o.pitcher.scale.setScalar(pit ? 0.5 : 1.3);
  if (o.catcher) { o.catcher.visible = false; o.ump.visible = false; }
  const pu = o.pitcher.userData; applyLook(pit ? o.pitcher : o.batter, pl); if (pl) { setUniform(o.batter, cal(pl.week).year); if (pit) setUniform(o.pitcher, cal(pl.week).year); else setShirt(o.pitcher, 0xc53030); }
  const u = o.batter.userData;
  const f = (dt, t) => {
    const T = homeAnim; if (T) T.t += dt;
    const k = T ? T.kind : 'idle';
    if (pit) {
      pu.legL.rotation.x = pu.legR.rotation.x = 0; o.pitcher.position.y = 0; pu.armL.rotation.set(-1.2, 0, 0.3); pu.armR.rotation.set(0, 0, 0.1); pu.head.rotation.x = 0;
      if (T && ['velo', 'ctrl', 'brk', 'basic', 'power'].includes(k)) { const c = (T.t * 1.3) % 1; setPitcherPose(o.pitcher, c < 0.8 ? c / 0.8 : 0.8 + (c - 0.8)); }
      else if (T && k === 'run') { pu.armR.rotation.x = Math.sin(T.t * 14) * 1.1; pu.armL.rotation.x = -Math.sin(T.t * 14) * 1.1; pu.legL.rotation.x = Math.sin(T.t * 14) * 0.9; pu.legR.rotation.x = -Math.sin(T.t * 14) * 0.9; }
      else if (T && (k === 'cond' || k === 'chore')) { pu.armR.rotation.x = pu.armL.rotation.x = -3.0 + Math.sin(T.t * 8) * 0.4; o.pitcher.position.y = Math.abs(Math.sin(T.t * 4)) * 0.1; }
      else if (T) { pu.armR.rotation.set(0, 0, 0.2); pu.armL.rotation.set(0, 0, -0.2); pu.head.rotation.x = 0.35; }
      else { const c = (t % 3.6) / 3.6; setPitcherPose(o.pitcher, c > 0.75 ? (c - 0.75) / 0.25 * 0.9 : 0); }
      if (T && T.t > 1.4) homeAnim = null;
      camera.position.set(1.2 + Math.sin(t * 0.3) * 0.2, 1.0, 4.6); camera.lookAt(-0.35, -0.5, 0); return;
    }
    u.legL.rotation.x = u.legR.rotation.x = 0; o.batter.position.y = 0; o.batter.position.x = -0.6;
    if (k === 'bat' || k === 'power' || (T && !['run', 'cond', 'defense', 'arm', 'refresh', 'rest', 'study', 'alba', 'chore', 'mental'].includes(k))) { const c = (T.t * 1.6) % 1; setBatterPose(o.batter, c > 0.45 ? Math.min(1, (c - 0.45) / 0.15) : 0); if (k === 'power') o.batter.position.y = Math.abs(Math.sin(T.t * 6)) * 0.08; }
    else if (k === 'run') { setBatterPose(o.batter, -1); u.armR.rotation.x = Math.sin(T.t * 14) * 1.1; u.armL.rotation.x = -Math.sin(T.t * 14) * 1.1; u.legL.rotation.x = Math.sin(T.t * 14) * 0.9; u.legR.rotation.x = -Math.sin(T.t * 14) * 0.9; o.batter.position.y = Math.abs(Math.sin(T.t * 14)) * 0.07; }
    else if (k === 'cond' || k === 'chore') { setBatterPose(o.batter, -1); u.armR.rotation.x = u.armL.rotation.x = -3.0 + Math.sin(T.t * 8) * 0.4; o.batter.position.y = Math.abs(Math.sin(T.t * 4)) * 0.1; }
    else if (k === 'defense' || k === 'arm') { setBatterPose(o.batter, -1); u.armL.rotation.x = -1.4; u.armR.rotation.x = -Math.PI * (0.5 + Math.sin(T.t * 7) * 0.5); }
    else if (k === 'rest' || k === 'refresh' || k === 'study' || k === 'alba' || k === 'mental') { setBatterPose(o.batter, -1); u.armR.rotation.set(0, 0, 0.2); u.armL.rotation.set(0, 0, -0.2); u.head.rotation.x = 0.35 + Math.sin(T.t * 2) * 0.05; }
    else { const c = (t % 3.4) / 3.4; setBatterPose(o.batter, c > 0.7 ? Math.min(1, (c - 0.7) / 0.1) : 0); u.head.rotation.x = 0; }
    if (T && T.t > 1.4) { homeAnim = null; u.head.rotation.x = 0; }
    setPitcherPose(o.pitcher, 0);
    camera.position.set(1.2 + Math.sin(t * 0.3) * 0.2, 1.0, 4.6); camera.lookAt(-0.35, -0.5, 0);
  };
  tickers.clear(); tickers.add(f);
}

export async function playMatch(p, m, hud) {
  const o = ensureG(); { const P = window.__game && window.__game.P; if (P) { const y = cal(P.week).year; setUniform(o.batter, y); const gr = P.gear || {}; { const u = o.batter.userData; if (u.bat) u.bat.material.color.set(gr.bat ? 0xf2c94c : 0xdeb887); for (const s of u.shoes) s.material.color.set(gr.shoes ? 0xe53935 : 0x222222); } if (o.runner) setUniform(o.runner, y); } } o.g.visible = true; o.zone.visible = true; o.ret.visible = true; tickers.clear(); { const n = scene.getObjectByName('net'); if (n) n.visible = true; } o.pitcher.visible = true; o.pitcher.position.set(0, 0.35, -18.44); o.pitcher.rotation.y = 0; o.pitcher.scale.setScalar(1.3); if (o.catcher) { o.catcher.visible = false; o.ump.visible = false; } o.batter.visible = true; o.batter.position.set(-0.5, 0, 0.2); o.batter.rotation.y = Math.PI / 2 - 1.4; o.batter.scale.setScalar(0.72); o.batter.userData.head.rotation.x = 0;
  const opp = TEAMS[Math.floor(Math.random() * TEAMS.length)]; { const oc = OPP_COLORS[TEAMS.indexOf(opp) % OPP_COLORS.length]; setShirt(o.pitcher, oc); o.fielders.forEach((f) => setShirt(f, oc)); }
  const regular = isRegular(p);
  const strength = oppStrength(p);
  const traits = p.traits;
  const s = { ab: 0, hits: 0, hr: 0, rbi: 0, runs: 0 };
  let my = 0, oppRuns = 0;
  const pas = regular ? [1, 3, 5] : [4];
  const innings = 5;
  camera.position.set(-0.15, 1.8, 5.4); camera.lookAt(-0.25, -0.35, -9);
  setPitcherPose(o.pitcher, 0);
  hud.setTitle(`${m.name} vs ${opp}${regular ? '' : ' (대타 출전)'}`);
  const ret = o.ret;
  // 입력
  let cx = 0, cy = ZY;
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const setRet = (x, y) => { cx = Math.max(-0.95, Math.min(0.95, x)); cy = Math.max(0.1, Math.min(1.7, y)); ret.position.set(cx, cy, 0.05); o.batter.userData.aimHeight = cy; };
  const pt = (e) => { const r = renderer.domElement.getBoundingClientRect(); const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1 + 0.12); ray.setFromCamera(v, camera); const hit = new THREE.Vector3(); ray.ray.intersectPlane(plane, hit); if (hit) setRet(hit.x, hit.y); };
  let down = false;
  const onD = (e) => { down = true; pt(e); }, onM = (e) => { if (down || e.pointerType === 'mouse') pt(e); }, onU = () => { down = false; };
  const cv = renderer.domElement; cv.addEventListener('pointerdown', onD); cv.addEventListener('pointermove', onM); window.addEventListener('pointerup', onU);
  setRet(0, ZY);
  let swingReq = null; // 투구 시작 후 스윙 시각
  let pitching = null; const sbOp = (a) => { const b = document.querySelector('.swing'); if (b) { b.style.opacity = a; b.style.transition = 'opacity .2s'; } };
  const doSwing = () => { if (pitching && pitching.swingT == null) { pitching.swingT = pitching.t; pitching.swingAnim = 0.0001; sfx.swing(); } };
  hud.onSwing(doSwing);
  const key = (e) => { if (e.code === 'Space') { e.preventDefault(); doSwing(); } }; window.addEventListener('keydown', key);

  // 한 번의 투구
  const pitchOnce = (count, scoringChance = false) => new Promise(async (res) => {
    o.zone.visible = true; o.ret.visible = true;
    const pt_ = PITCHES[Math.floor(Math.random() * (strength > 50 ? 4 : strength > 42 ? 3 : 2))];
    const T = Math.max(0.78, Math.min(1.5, (1.5 - (strength - 35) * 0.012) * pt_.Tm));
    const inZone = chance(62);
    const bx = window.__dbgIn ? 0 : inZone ? rnd(-ZW * 0.9, ZW * 0.9) : (chance(50) ? 1 : -1) * rnd(ZW * 1.15, ZW * 1.9);
    const by = window.__dbgIn ? ZY : inZone ? ZY + rnd(-ZH * 0.9, ZH * 0.9) : ZY + (chance(50) ? 1 : -1) * rnd(ZH * 1.2, ZH * 2.0);
    hud.setPitch(`${pt_.n} ${Math.round(105 + (1.5 - T) * 60 * (pt_.Tm === 1 ? 1.15 : 0.9))}km/h`);
    // 와인드업
    for (let t = 0; t < 0.7; t += 0.03) { setPitcherPose(o.pitcher, t / 0.7 * 0.65); await wait(30); }
    o.ball.visible = true;
    const st = { t: 0, swingT: null, swingAnim: 0 }; pitching = st; sbOp(1);
    let done = false;
    const f = (dt) => {
      if (done) return;
      st.t += dt;
      const sN = st.t / T;
      setPitcherPose(o.pitcher, Math.min(1, 0.65 + st.t * 2));
      const ss = Math.min(1.12, sN);
      const x = bx * ss + pt_.c * Math.sin(Math.PI * Math.min(1, ss)) * 0.6 * (1 - ss * 0.2);
      const y = 1.7 + (by - 1.7) * ss - pt_.drop * Math.sin(Math.PI * Math.min(1, ss)) * 0.0 - pt_.drop * ss * ss * 0.5 + 0.0 + (pt_.drop ? pt_.drop * 0.5 * ss * ss * 0 : 0);
      o.ball.position.set(x, y + (pt_.drop * 0.5 * ss * ss) , -17.8 + 17.8 * ss);
      if (st.t < 0.14) { const pu = o.pitcher.userData; if (pu.throwHand) { pu.sync(); const hp = pu.throwHand.getWorldPosition(new THREE.Vector3()); let k = st.t / 0.14; k = k * k * (3 - 2 * k); o.ball.position.lerp(hp, 1 - k); } } // 릴리스: 투수 손 위치에서 출발
      o.ball.rotation.z += dt * 20;
      if (st.swingAnim > 0) { st.swingAnim += dt / 0.22; setBatterPose(o.batter, st.swingAnim); }
      if (window.__dbgShot) window.__dbgShot(st, T, o, sN);
      if (st.t >= T + 0.2) { done = true; delTicker(f); finalize(); }
    };
    const finalize = () => {
      pitching = null; sbOp(0.25); o.ball.visible = false; setBatterPose(o.batter, st.swingT != null ? 1 : 0);
      if (st.swingT == null) { sfx.mitt(); res({ kind: inZone ? 'strike' : 'ball', looking: true }); return; }
      const FRC = window.__force; const err = FRC ? 0 : st.swingT + 0.075 - T; // 0.075s = 스윙 시작~배트 컨택트 프레임(모캡 85번) 지연
      const assist = battingAssist(p, count.s, scoringChance);
      const w = 0.07 + p.meet * 0.0009 + assist.timing;
      const r = 0.18 + p.meet * 0.0015 + assist.radius;
      const ballPos = o.ball.position; // 도달 위치 보정
      const dist = FRC ? 0 : Math.hypot(cx - bx, cy - by);
      const tm = Math.abs(err) < w * 0.3 ? 'PERFECT' : err < 0 ? '빠름' : '늦음';
      if (Math.abs(err) > w * 1.5 || dist > r * 1.6) { sfx.mitt(); res({ kind: 'whiff', tm: Math.abs(err) > w * 1.5 ? tm : '위치' }); return; }
      if (Math.abs(err) > w || dist > r) { sfx.crack(0.3); res({ kind: 'foul', tm }); return; }
      const q = 1 - (Math.abs(err) / w * 0.5 + dist / r * 0.5);
      const angle = FRC ? FRC.angle : -err / w * 38 + rnd(-6, 6) + (cx - bx) * 20;
      const launch = FRC ? FRC.launch : 11 + (by - cy) * 70 + rnd(-6, 6);
      const v = FRC ? FRC.v : 28 + q * 14 + p.power * 0.2 + (traits.includes('pwr') ? 5 : 0) + rnd(-2, 2);
      const dst = v * v * Math.sin(2 * Math.max(0.05, launch * Math.PI / 180)) / 9.8 * 0.52;
      sfx.crack(q); hud.flash(); res({ kind: 'hit', tm, q, angle, launch, v, dst: Math.max(5, dst), hr: 0 });
    };
    tickers.add(f);
  });

  // 타구 연출 후 결과 판정
  const flight = (h) => new Promise((res) => {
    o.zone.visible = false; o.ret.visible = false;
    const a = h.angle * Math.PI / 180; const dir = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
    const dur = Math.max(0.9, Math.min(2.6, h.dst / 38 + 0.6)); const peak = Math.max(0.3, Math.min(30, h.dst * Math.tan(Math.max(0, h.launch) * Math.PI / 180) * 0.28));
    o.ball.visible = true; let t = 0;
    const land = [dir.x * h.dst, dir.z * h.dst + 0.3];
    let near = null, nd = 1e9; for (const fd of o.fielders) { const dd = Math.hypot(fd.userData.home[0] - land[0], fd.userData.home[1] - land[1]); if (dd < nd) { nd = dd; near = fd; } }
    const f = (dt) => {
      if (near) { const hx = near.userData.home[0], hz = near.userData.home[1]; const distance = Math.hypot(land[0] - hx, land[1] - hz); const travel = Math.min(distance, Math.max(0, t - 0.18) * 7); const k2 = distance > 0 ? travel / distance : 0;
        near.position.x = hx + (land[0] - hx) * k2; near.position.z = hz + (land[1] - hz) * k2; near.rotation.y = Math.atan2(land[0] - hx, land[1] - hz);
        const stride = travel > 0 && travel < distance ? Math.sin(t * 13) : 0; near.userData.legL.rotation.x = stride * 0.65; near.userData.legR.rotation.x = -stride * 0.65; near.userData.armL.rotation.x = -stride * 0.45; near.userData.armR.rotation.x = stride * 0.45; }
      t += dt; const k = Math.min(1, t / dur);
      const d = h.dst * k; let y = 1 + 4 * peak * k * (1 - k) - (h.launch < 8 ? 0.9 * k : 0);
      if (h.launch < 8) y = 0.15 + Math.abs(Math.sin(k * Math.PI * 4)) * 0.5 * (1 - k);
      o.ball.position.set(dir.x * d, Math.max(0.1, y), dir.z * d + 0.3); o.ball.scale.setScalar(Math.min(5, Math.max(1, camera.position.distanceTo(o.ball.position) / 9))); if (window.__flog) window.__flog(o.ball, camera, k);
      const tgt = o.ball.position; camera.position.lerp(new THREE.Vector3(tgt.x * 0.25, 2.6 + k * 2.5, Math.min(11, 5 + Math.max(0, -tgt.z) * 0.06)), 0.06); camera.lookAt(tgt.x * 0.6, 1 + k * 3, tgt.z * 0.65 - 3);
      if (k >= 1) { delTicker(f); setTimeout(() => { o.ball.visible = false; o.ball.scale.setScalar(1); resetFielders(); res(); }, 250); }
    }; tickers.add(f);
  });
  const runBases = (kind) => new Promise((res) => {
    const pts = { single: [[0, 0], [19.4, -19.4]], double: [[0, 0], [19.4, -19.4], [0, -38.8]], hr: [[0, 0], [19.4, -19.4], [0, -38.8], [-19.4, -19.4], [0, 0]] }[kind] || [[0, 0], [19.4, -19.4]];
    const rn = o.runner; rn.visible = true; o.batter.visible = false; let t = 0; const dur = 0.9 * (pts.length - 1);
    camera.position.set(0, 14, 16); camera.lookAt(0, 0, -18);
    const f = (dt) => { t += dt; const k = Math.min(0.9999, t / dur) * (pts.length - 1); const i = Math.floor(k), fr = k - i; const a = pts[i], b = pts[i + 1];
      rn.position.set(a[0] + (b[0] - a[0]) * fr, Math.abs(Math.sin(t * 14)) * 0.15, a[1] + (b[1] - a[1]) * fr); rn.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); rn.userData.legL.rotation.x = Math.sin(t * 14); rn.userData.legR.rotation.x = -Math.sin(t * 14);
      if (t >= dur) { delTicker(f); setTimeout(() => { rn.visible = false; o.batter.visible = true; res(); }, 300); } };
    tickers.add(f);
  });
  const resetFielders = () => { for (const fd of o.fielders) { fd.position.set(fd.userData.home[0], 0, fd.userData.home[1]); for (const k of ['legL','legR','armL','armR']) fd.userData[k].rotation.x = 0; fd.rotation.y = Math.atan2(-fd.position.x, -fd.position.z); } };
  const resetCam = () => { camera.position.set(-0.15, 1.8, 5.4); camera.lookAt(-0.25, -0.35, -9); setBatterPose(o.batter, 0); };

  // 타석
  const plateAppearance = async (inn, base) => {
    const c = { b: 0, s: 0 }; let guard = 0;
    hud.setCount(c); resetCam();
    hud.banner(`${inn}회 ${s.ab + 1}번째 타석`, 1100); await wait(1200);
    while (guard++ < 30) {
      await wait(450);
      const r = await pitchOnce(c, !!base);
      if (r.tm && r.kind !== 'hit') hud.small(r.tm);
      if (r.kind === 'ball') { c.b++; hud.banner('볼', 600); }
      else if (r.kind === 'strike') { c.s++; hud.banner('스트라이크', 600); }
      else if (r.kind === 'whiff') { c.s++; hud.banner('헛스윙!', 700); }
      else if (r.kind === 'foul') { if (c.s < 2) c.s++; hud.banner('파울', 600); }
      else {
        const h = r; const ang = Math.abs(h.angle); if (h.tm) hud.small(h.tm + (h.q > 0.75 ? ' · 완벽한 타구' : ''));
        let res_ = 'out', label = '';
        if (ang > 46) { if (c.s < 2) c.s++; await flight({ ...h, angle: h.angle > 0 ? 55 : -55, dst: Math.min(h.dst, 60) }); hud.banner('파울', 600); hud.setCount(c); resetCam(); resetFielders(); continue; }
        const L = h.launch;
        if (L > 22 && L <= 50 && h.dst >= 88) { res_ = 'hr'; label = '홈런!!'; }
        else if (L < 8) { const pr = 0.2 + h.q * 0.4 + p.speed * 0.002 + (traits.includes('run') ? 0.06 : 0); res_ = chance(pr * 100) ? 'single' : 'out'; label = res_ === 'out' ? '땅볼 아웃' : '내야 안타'; }
        else if (L <= 22) { const pr = 0.5 + h.q * 0.35; if (chance(pr * 100)) { res_ = h.dst > 62 && chance(50 + p.speed * 0.3) ? 'double' : 'single'; label = res_ === 'double' ? '2루타!' : '안타!'; } else label = '라인드라이브 잡힘'; }
        else if (L <= 50) { if (h.dst > 70 && chance(h.q * 55 + 15)) { res_ = 'double'; label = '2루타!'; } else { label = '뜬공 아웃'; } }
        else label = '내야 플라이 아웃';
        await flight(h);
        if (res_ !== 'out') await runBases(res_);
        resetCam();
        return { res: res_, label };
      }
      hud.setCount(c);
      if (c.b >= 4) return { res: 'walk', label: '볼넷' };
      if (c.s >= 3) return { res: 'k', label: '삼진 아웃' };
    }
    return { res: 'out', label: '아웃' };
  };

  let runner = 0;
  for (let inn = 1; inn <= innings; inn++) {
    hud.setScore(inn, my, oppRuns); hud.setCount({ b: 0, s: 0 });
    const lam = Math.max(0.1, 0.35 + (teamStrength(p) - 40) / 25);
    runner = chance(35) ? 1 : 0; // 앞 타자 출루
    if (pas.includes(inn)) {
      const r = await plateAppearance(inn);
      let sc = 0; s.ab += r.res === 'walk' ? 0 : 1;
      if (r.res === 'hr') { s.hits++; s.hr++; sc = 1 + runner; s.rbi += sc; s.runs++; }
      else if (r.res === 'double') { s.hits++; if (runner && chance(75)) { sc = 1; s.rbi++; } }
      else if (r.res === 'single') { s.hits++; if (runner && chance(40)) { sc = 1; s.rbi++; } }
      if (r.res === 'walk') { sc = 0; }
      my += sc;
      if (r.res === 'hr') sfx.cheer(2); else if (sc || r.res === 'single' || r.res === 'double') sfx.cheer(1); else if (r.res === 'k' || r.res === 'out') sfx.out();
      hud.banner(r.label + (sc ? ` (+${sc}점)` : ''), 1500); hud.setScore(inn, my, oppRuns); await wait(1700);
      // 출루 후 득점
      if (['single', 'double', 'walk'].includes(r.res) && chance(35 + p.speed * 0.2)) { s.runs++; my++; hud.banner('후속 안타로 홈인!', 1100); hud.setScore(inn, my, oppRuns); await wait(1200); }
    } else {
      const add = Math.random() < lam * 0.7 ? (chance(25) ? 2 : 1) : 0; my += add;
      hud.banner(`${inn}회 우리 팀 ${add}점`, 900); hud.setScore(inn, my, oppRuns); await wait(950);
    }
    const oa = Math.random() < Math.max(0.1, 0.28 + (strength - 40) / 28) ? (chance(25) ? 2 : 1) : 0; oppRuns += oa;
    hud.banner(`${inn}회 상대 ${oa}점`, 900); hud.setScore(inn, my, oppRuns); await wait(950);
  }
  // 정리
  cv.removeEventListener('pointerdown', onD); cv.removeEventListener('pointermove', onM); window.removeEventListener('pointerup', onU); window.removeEventListener('keydown', key);
  hud.offSwing();
  let win = my > oppRuns; if (my === oppRuns) { win = chance(50 + p.ev.team * 0.1); if (win) my++; else oppRuns++; hud.banner('연장 승부 끝에 ' + (win ? '승리' : '패배'), 1400); await wait(1500); }
  const r = { ab: s.ab, hits: s.hits, hr: s.hr, rbi: s.rbi, my, opp: oppRuns, win, kind: m.kind, title: m.name + ' vs ' + opp };
  applyMatchResult(p, r);
  return r;
}

export const internals = () => ({ o: ensureG(), tickers, delTicker, wait });
