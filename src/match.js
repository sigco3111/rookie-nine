import { THREEX as THREE, scene, camera, renderer, makeChibi, setBatterPose, setPitcherPose, addShadow } from './scene.js';
import { cal, oppStrength, teamStrength, isRegular, rnd, chance, applyMatchResult } from './growth.js';
import { TEAMS } from './data.js';

const ZW = 0.45, ZH = 0.4, ZY = 0.9;
const PITCHES = [{ n: '직구', Tm: 1, c: 0, drop: 0 }, { n: '커브', Tm: 1.38, c: 0.55, drop: 0.35 }, { n: '슬라이더', Tm: 1.12, c: -0.5, drop: 0.1 }, { n: '체인지업', Tm: 1.28, c: 0.05, drop: 0.2 }];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let G = null; // 현재 씬 요소
const tickers = new Set();
export const addTicker = (f) => tickers.add(f);
export const delTicker = (f) => tickers.delete(f);
let last = performance.now();
export function frame() { const n = performance.now(); const dt = Math.min(0.05, (n - last) / 1000); last = n; for (const f of [...tickers]) f(dt, n / 1000); renderer.render(scene, camera); requestAnimationFrame(frame); }

function ensureG() {
  if (G) return G;
  const g = new THREE.Group();
  const batter = makeChibi({ shirt: 0x2b6cb0, cap: 0x1a365d, bat: true }); batter.position.set(-1.0, 0, 0.5); batter.rotation.y = Math.PI / 2; addShadow(batter); setBatterPose(batter, 0); g.add(batter);
  const pitcher = makeChibi({ shirt: 0xc53030, cap: 0x742a2a, glove: true }); pitcher.position.set(0, 0.35, -18.44); pitcher.scale.setScalar(1.3); g.add(pitcher);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); ball.visible = false; g.add(ball);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 16), new THREE.MeshBasicMaterial({ color: 0xd33 })); ball.add(seam);
  const zone = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(ZW * 2, ZH * 2)), new THREE.LineBasicMaterial({ color: 0xffffff })); zone.position.set(0, ZY, 0); g.add(zone);
  const ret = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.2, 28), new THREE.MeshBasicMaterial({ color: 0xffd23f, side: THREE.DoubleSide, depthTest: false })); ret.position.set(0, ZY, 0.05); ret.renderOrder = 10; g.add(ret);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.018, 8), new THREE.MeshBasicMaterial({ color: 0xffd23f, depthTest: false })); dot.renderOrder = 10; ret.add(dot);
  const catcher = makeChibi({ shirt: 0x444444, cap: 0x222222, glove: true }); catcher.position.set(0, 0, 1.3); catcher.rotation.y = Math.PI; catcher.scale.setScalar(0.0001); g.add(catcher);
  scene.add(g); G = { g, batter, pitcher, ball, zone, ret };
  return G;
}
export function showHome() { // 홈 화면 배경: 선수가 천천히 스윙 연습
  const o = ensureG(); o.g.visible = true; o.ret.visible = false; o.zone.visible = false; o.ball.visible = false;
  camera.position.set(2.6, 1.7, 4.2); camera.lookAt(-0.6, 1.0, 0);
  const f = (dt, t) => { const c = (t % 3.2) / 3.2; setBatterPose(o.batter, c > 0.6 ? Math.min(1, (c - 0.6) / 0.12) : 0); setPitcherPose(o.pitcher, 0); camera.position.x = 2.6 + Math.sin(t * 0.3) * 0.6; camera.lookAt(-0.6, 1.0, 0); };
  tickers.clear(); tickers.add(f);
}

export async function playMatch(p, m, hud) {
  const o = ensureG(); o.g.visible = true; o.zone.visible = true; o.ret.visible = true; tickers.clear();
  const opp = TEAMS[Math.floor(Math.random() * TEAMS.length)];
  const regular = isRegular(p);
  const strength = oppStrength(p);
  const traits = p.traits;
  const s = { ab: 0, hits: 0, hr: 0, rbi: 0, runs: 0 };
  let my = 0, oppRuns = 0;
  const pas = regular ? [1, 3, 5] : [4];
  const innings = 5;
  camera.position.set(0.2, 1.7, 5.2); camera.lookAt(0, 0.95, -9);
  setPitcherPose(o.pitcher, 0);
  hud.setTitle(`${m.name} vs ${opp}${regular ? '' : ' (대타 출전)'}`);
  const ret = o.ret;
  // 입력
  let cx = 0, cy = ZY;
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const setRet = (x, y) => { cx = Math.max(-0.95, Math.min(0.95, x)); cy = Math.max(0.1, Math.min(1.7, y)); ret.position.set(cx, cy, 0.05); };
  const pt = (e) => { const r = renderer.domElement.getBoundingClientRect(); const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1 + 0.12); ray.setFromCamera(v, camera); const hit = new THREE.Vector3(); ray.ray.intersectPlane(plane, hit); if (hit) setRet(hit.x, hit.y); };
  let down = false;
  const onD = (e) => { down = true; pt(e); }, onM = (e) => { if (down || e.pointerType === 'mouse') pt(e); }, onU = () => { down = false; };
  const cv = renderer.domElement; cv.addEventListener('pointerdown', onD); cv.addEventListener('pointermove', onM); window.addEventListener('pointerup', onU);
  setRet(0, ZY);
  let swingReq = null; // 투구 시작 후 스윙 시각
  let pitching = null;
  const doSwing = () => { if (pitching && pitching.swingT == null) { pitching.swingT = pitching.t; pitching.swingAnim = 0.0001; } };
  hud.onSwing(doSwing);
  const key = (e) => { if (e.code === 'Space') { e.preventDefault(); doSwing(); } }; window.addEventListener('keydown', key);

  // 한 번의 투구
  const pitchOnce = (count) => new Promise(async (res) => {
    const pt_ = PITCHES[Math.floor(Math.random() * (strength > 50 ? 4 : strength > 42 ? 3 : 2))];
    const T = Math.max(0.78, Math.min(1.5, (1.5 - (strength - 35) * 0.012) * pt_.Tm));
    const inZone = chance(62);
    const bx = inZone ? rnd(-ZW * 0.9, ZW * 0.9) : (chance(50) ? 1 : -1) * rnd(ZW * 1.15, ZW * 1.9);
    const by = inZone ? ZY + rnd(-ZH * 0.9, ZH * 0.9) : ZY + (chance(50) ? 1 : -1) * rnd(ZH * 1.2, ZH * 2.0);
    hud.setPitch(`${pt_.n} ${Math.round(105 + (1.5 - T) * 60 * (pt_.Tm === 1 ? 1.15 : 0.9))}km/h`);
    // 와인드업
    for (let t = 0; t < 0.7; t += 0.03) { setPitcherPose(o.pitcher, t / 0.7 * 0.65); await wait(30); }
    o.ball.visible = true;
    const st = { t: 0, swingT: null, swingAnim: 0 }; pitching = st;
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
      o.ball.rotation.z += dt * 20;
      if (st.swingAnim > 0) { st.swingAnim += dt / 0.16; setBatterPose(o.batter, st.swingAnim); }
      if (st.t >= T + 0.2) { done = true; delTicker(f); finalize(); }
    };
    const finalize = () => {
      pitching = null; o.ball.visible = false; setBatterPose(o.batter, st.swingT != null ? 1 : 0);
      if (st.swingT == null) { res({ kind: inZone ? 'strike' : 'ball', looking: true }); return; }
      const err = st.swingT - T;
      const w = 0.07 + p.meet * 0.0009 + (traits.includes('avg') ? 0.02 : 0) + (count.s === 2 && traits.includes('grit') ? 0.02 : 0);
      const r = 0.18 + p.meet * 0.0015 + (traits.includes('walk') ? 0.02 : 0);
      const ballPos = o.ball.position; // 도달 위치 보정
      const dist = Math.hypot(cx - bx, cy - by);
      if (Math.abs(err) > w * 1.5 || dist > r * 1.6) { res({ kind: 'whiff' }); return; }
      if (Math.abs(err) > w || dist > r) { res({ kind: 'foul' }); return; }
      const q = 1 - (Math.abs(err) / w * 0.5 + dist / r * 0.5);
      const angle = -err / w * 38 + rnd(-6, 6) + (cx - bx) * 20;
      const launch = 11 + (by - cy) * 70 + rnd(-6, 6);
      const v = 28 + q * 14 + p.power * 0.2 + (traits.includes('pwr') ? 5 : 0) + rnd(-2, 2);
      const dst = v * v * Math.sin(2 * Math.max(0.05, launch * Math.PI / 180)) / 9.8 * 0.52;
      res({ kind: 'hit', q, angle, launch, v, dst: Math.max(5, dst), hr: 0 });
    };
    tickers.add(f);
  });

  // 타구 연출 후 결과 판정
  const flight = (h) => new Promise((res) => {
    const a = h.angle * Math.PI / 180; const dir = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
    const dur = Math.max(0.9, Math.min(2.6, h.dst / 38 + 0.6)); const peak = Math.max(0.3, Math.min(30, h.dst * Math.tan(Math.max(0, h.launch) * Math.PI / 180) * 0.28));
    o.ball.visible = true; let t = 0;
    const f = (dt) => {
      t += dt; const k = Math.min(1, t / dur);
      const d = h.dst * k; let y = 1 + 4 * peak * k * (1 - k) - (h.launch < 8 ? 0.9 * k : 0);
      if (h.launch < 8) y = 0.15 + Math.abs(Math.sin(k * Math.PI * 4)) * 0.5 * (1 - k);
      o.ball.position.set(dir.x * d, Math.max(0.1, y), dir.z * d + 0.3);
      const tgt = o.ball.position; camera.position.lerp(new THREE.Vector3(tgt.x * 0.25, 2.6 + k * 4, 5 + Math.max(0, -tgt.z) * 0.18), 0.06); camera.lookAt(tgt.x * 0.6, 1 + k * 3, tgt.z * 0.65 - 3);
      if (k >= 1) { delTicker(f); setTimeout(() => { o.ball.visible = false; res(); }, 250); }
    }; tickers.add(f);
  });
  const resetCam = () => { camera.position.set(0.2, 1.7, 5.2); camera.lookAt(0, 0.95, -9); setBatterPose(o.batter, 0); };

  // 타석
  const plateAppearance = async (inn, base) => {
    const c = { b: 0, s: 0 }; let guard = 0;
    hud.setCount(c); resetCam();
    hud.banner(`${inn}회 ${s.ab + 1}번째 타석`, 1100); await wait(1200);
    while (guard++ < 30) {
      await wait(450);
      const r = await pitchOnce(c);
      if (r.kind === 'ball') { c.b++; hud.banner('볼', 600); }
      else if (r.kind === 'strike') { c.s++; hud.banner('스트라이크', 600); }
      else if (r.kind === 'whiff') { c.s++; hud.banner('헛스윙!', 700); }
      else if (r.kind === 'foul') { if (c.s < 2) c.s++; hud.banner('파울', 600); }
      else {
        const h = r; const ang = Math.abs(h.angle);
        let res_ = 'out', label = '';
        if (ang > 46) { if (c.s < 2) c.s++; await flight({ ...h, angle: h.angle > 0 ? 55 : -55, dst: Math.min(h.dst, 60) }); hud.banner('파울', 600); hud.setCount(c); continue; }
        const L = h.launch;
        if (L > 22 && L <= 50 && h.dst >= 88) { res_ = 'hr'; label = '홈런!!'; }
        else if (L < 8) { const pr = 0.2 + h.q * 0.4 + p.speed * 0.002 + (traits.includes('run') ? 0.06 : 0); res_ = chance(pr * 100) ? 'single' : 'out'; label = res_ === 'out' ? '땅볼 아웃' : '내야 안타'; }
        else if (L <= 22) { const pr = 0.5 + h.q * 0.35; if (chance(pr * 100)) { res_ = h.dst > 62 && chance(50 + p.speed * 0.3) ? 'double' : 'single'; label = res_ === 'double' ? '2루타!' : '안타!'; } else label = '라인드라이브 잡힘'; }
        else if (L <= 50) { if (h.dst > 70 && chance(h.q * 55 + 15)) { res_ = 'double'; label = '2루타!'; } else { label = '뜬공 아웃'; } }
        else label = '내야 플라이 아웃';
        await flight(h);
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
