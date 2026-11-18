import { THREEX as THREE, scene, camera, renderer, makeChibi, setBatterPose, setPitcherPose, setUniform, setShirt, OPP_COLORS } from './scene.js';
import { internals, applyEquipment, defensivePursuit, resetDefense, completeGroundOut, airOutSequence } from './match.js';
import { oppStrength, teamStrength, isRegular, cal, rnd, chance, applyMatchResult } from './growth.js';
import { TEAMS } from './data.js';
import { sfx } from './audio.js';

const ZW = 0.45, ZH = 0.4, ZY = 0.9;
const PT = [
  { id: 'fast', n: '직구', Tm: 1, c: 0, drop: 0, brk: 0 },
  { id: 'curve', n: '커브', Tm: 1.38, c: 0.5, drop: 0.35, brk: 1 },
  { id: 'slide', n: '슬라이더', Tm: 1.12, c: -0.45, drop: 0.1, brk: 0.8 },
  { id: 'fork', n: '포크', Tm: 1.2, c: 0, drop: 0.5, brk: 1 },
];
const avail = (p) => PT.filter((x) => x.id === 'fast' || (x.id === 'curve' && p.brk >= 30) || (x.id === 'slide' && p.brk >= 40) || (x.id === 'fork' && p.brk >= 55));

export async function playPitching(p, m, hud) {
  const { o, tickers, delTicker, wait } = internals();
  tickers.clear(); o.g.visible = true; o.zone.visible = true; o.ret.visible = true; o.ball.visible = false;
  const opp = TEAMS[Math.floor(Math.random() * TEAMS.length)]; const regular = isRegular(p);
  const innings = regular ? 3 : 1; const strength = oppStrength(p); const traits = p.traits;
  const S = { so: 0, er: 0, ha: 0, outsTotal: 0 };
  let my = 0;
  // 장면: 마운드 뒤에서 타석을 본다. 타자는 상대(붉은 팀), 투수는 사용자
  o.batter.position.set(-1.0, 0, 0.1); o.batter.rotation.y = Math.PI / 2; o.batter.scale.setScalar(1.0); o.batter.visible = true; o.batter.userData.head.rotation.x = 0;
  o.pitcher.position.set(0.7, 0.35, -18.44); o.pitcher.rotation.y = 0; o.pitcher.scale.setScalar(0.85); o.pitcher.visible = true;
  // 투구에서는 야수가 우리 팀, 타자가 상대 팀이다. 이전 장면의 색을 물려받지 않는다.
  const year = cal(p.week).year;
  setUniform(o.pitcher, year); applyEquipment(o.pitcher, p.gear);
  applyEquipment(o.batter);
  setShirt(o.batter, OPP_COLORS[TEAMS.indexOf(opp) % OPP_COLORS.length]);
  resetDefense(o.fielders);
  for (const fd of o.fielders) { fd.visible = true; setUniform(fd, year); }
  if (!o.catcher) { o.catcher = makeChibi({ shirt: 0x333a44, pants: 0x333a44, cap: 0x222222, glove: true }); o.catcher.rotation.y = Math.PI; o.catcher.position.set(0, 0, 1.6); o.catcher.scale.set(1.0, 0.8, 1.0); o.catcher.userData.armL.rotation.set(-1.4, 0, 0.2); o.g.add(o.catcher);
    o.ump = makeChibi({ shirt: 0x111111, pants: 0x555555, cap: 0x111111 }); o.ump.rotation.y = Math.PI; o.ump.position.set(0.7, 0, 3.0); o.ump.scale.setScalar(1.0); o.g.add(o.ump); }
  setUniform(o.catcher, year); applyEquipment(o.catcher);
  o.catcher.visible = true; o.ump.visible = true; o.pitcher.userData.armL.rotation.set(-1.2, 0, 0.3);
  const cam = () => { camera.position.set(0.1, 3.1, -24.8); camera.fov = 46; camera.updateProjectionMatrix(); camera.lookAt(-0.05, 0.95, 0); { const n = scene.getObjectByName('net'); if (n) n.visible = false; } };
  cam();
  hud.setTitle(`${m.name} vs ${opp} (${regular ? '선발' : '구원'} 투수)`);
  let cx = 0, cy = ZY; const ray = new THREE.Raycaster(); const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const setRet = (x, y) => { cx = Math.max(-0.8, Math.min(0.8, x)); cy = Math.max(0.2, Math.min(1.6, y)); o.ret.position.set(cx, cy, -0.05); };
  const pt = (e) => { const r = renderer.domElement.getBoundingClientRect(); const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1 + 0.1); ray.setFromCamera(v, camera); const h = new THREE.Vector3(); if (ray.ray.intersectPlane(plane, h)) setRet(h.x, h.y); };
  let down = false; const onD = (e) => { down = true; pt(e); }, onM = (e) => { if (down || e.pointerType === 'mouse') pt(e); }, onU = () => { down = false; };
  const cv = renderer.domElement; cv.addEventListener('pointerdown', onD); cv.addEventListener('pointermove', onM); window.addEventListener('pointerup', onU); setRet(0, ZY);
  let selPitch = PT[0]; let throwNow = null;
  const types = avail(p);
  hud.pitchPicker(types.map((t) => ({ id: t.id, n: t.n })), (id) => { selPitch = PT.find((x) => x.id === id); }, () => { if (throwNow) throwNow(); });

  hud.setPitchingActive?.(false);

  const throwBall = (count) => new Promise(async (res) => {
    const pit = selPitch; hud.setPitch(`${pit.n}  목표를 정하고 던지기!`);
    await new Promise((r) => { throwNow = () => { throwNow = null; hud.setPitchingActive?.(false); r(); }; hud.setPitchingActive?.(true); });
    // 실제 위치: 목표 + 제구 흔들림
    const wob = Math.max(0.03, 0.34 - p.ctrl * 0.0032 - (traits.includes('cmd') ? 0.04 : 0) + (pit.brk ? 0.05 * (1 - p.brk * 0.006) : 0));
    const bx = cx + rnd(-wob, wob) * 1.6, by = cy + rnd(-wob, wob);
    const inZone = Math.abs(bx) <= ZW && Math.abs(by - ZY) <= ZH;
    const veloKm = Math.round(105 + p.velo * 0.55 + (traits.includes('fast') ? 4 : 0) - (pit.Tm - 1) * 30);
    const T = Math.max(0.7, 1.5 - p.velo * 0.0075 * 1.0 - (traits.includes('fast') ? 0.05 : 0)) * pit.Tm;
    hud.setPitch(`${pit.n} ${veloKm}km/h`);
    sfx.swing();
    for (let t = 0; t < 0.5; t += 0.03) { setPitcherPose(o.pitcher, t / 0.5 * 0.65); await wait(30); }
    o.ball.visible = true; let t = 0, done = false; const bat = { swing: false, at: 0 };
    // 타자 스윙 결정
    const q = (strength - 40) - (traits.includes('aura') ? 5 : 0) + 4;
    const pSwing = inZone ? 0.78 : 0.3 + (Math.abs(bx) < ZW * 1.4 ? 0.1 : 0);
    const willSwing = chance(pSwing * 100);
    const f = (dt) => {
      if (done) return; t += dt; const s = t / T; const ss = Math.min(1.1, s);
      o.ball.position.set(bx * ss + pit.c * Math.sin(Math.PI * Math.min(1, ss)) * 0.6, 1.7 + (by - 1.7) * ss + pit.drop * 0.5 * ss * ss, -17.8 + 17.8 * ss); o.ball.rotation.z += dt * 20;
      setPitcherPose(o.pitcher, Math.min(1, 0.65 + t * 2));
      if (willSwing && !bat.swing && s > 0.86) { bat.swing = true; bat.at = 0.0001; sfx.swing(); }
      if (bat.swing) { bat.at += dt / 0.22; setBatterPose(o.batter, bat.at); }
      if (t >= T + 0.15) { done = true; delTicker(f); fin(); }
    };
    const fly = (kind, r, after) => { hud.setPitchingActive?.(false, true); hud.setPitch('타구 비행'); const dist = kind === 'out' ? 16 + Math.random() * 12 : kind === 'foul' ? 12 : [0, 26, 42, 58, 125][r.t]; const hi = kind === 'out' ? 7 : r && r.t === 4 ? 32 : 5 + (r ? r.t * 2 : 0); const dx = (Math.random() - 0.5) * (r && r.t === 4 ? 40 : 30); let dur = 0.9 + dist / 70;const outAir=kind==='out'&&dist>22;const air=outAir?airOutSequence(o,hud,[bx+dx*.5,-dist*.9],dur):null;if(air)dur=air.plan.duration;
      const chase = defensivePursuit(o.fielders, bx + dx * .5, -dist * .9);
      o.ball.visible = true; let k = 0; const g2 = (dt) => { k += dt / dur; chase(k * dur); const s = Math.min(1, k); o.ball.position.set(bx + dx * s * 0.5, kind==='out'&&!outAir?.15+Math.abs(Math.sin(s*Math.PI*4))*.5*(1-s):1.0 + Math.sin(Math.PI * s) * hi, -dist * s * 0.9); if(air){const glove=air.step(k*dur);o.ball.position.lerp(glove,Math.max(0,(s-.85)/.15));window.__airOutPlay?.({phase:'flight',k:s,t:k*dur,plan:air.plan,ball:o.ball,collector:o.fielders[air.plan.collector]});}const tg = o.ball.position; camera.lookAt(tg.x * 0.6, Math.max(0.8, tg.y * 0.7), Math.max(tg.z * 0.5, -40) + 4); camera.position.y = 3.1 + Math.min(4, tg.y * 0.1);
        if (s >= 1) { delTicker(g2); if(air)air.finish().then(()=>{cam();after('air');});else if(kind==='out')completeGroundOut(o,hud).then(()=>{cam();after('ground');});else{o.ball.visible = false;resetDefense(o.fielders);cam();after();} } }; tickers.add(g2); };
    const fin = () => {
      o.ball.visible = false; setBatterPose(o.batter, 0); setPitcherPose(o.pitcher, 0);
      if (!willSwing) { sfx.mitt(); res({ kind: inZone ? 'strike' : 'ball', looking: true }); return; }
      // 컨택 확률: 구속/변화구/코너 공략이 낮춘다
      const edge = Math.min(1, Math.max(Math.abs(bx) / ZW, Math.abs(by - ZY) / ZH));
      let pc = 0.66 - (p.velo - 40) * 0.0035 - pit.brk * (p.brk - 30) * 0.004 - edge * 0.16 + q * 0.007 - (inZone ? 0 : 0.2) - (traits.includes('aura') ? 0.04 : 0) - (traits.includes('bender') && pit.brk ? 0.05 : 0);
      pc = Math.max(0.06, Math.min(0.92, pc));
      if (!chance(pc * 100)) { sfx.mitt(); res({ kind: 'whiff' }); return; }
      sfx.crack(0.8); hud.flash();
      const ph = 0.26 + q * 0.006 - (p.velo - 40) * 0.0018 - edge * 0.05; // 인플레이 안타 확률
      if (chance(Math.max(0.08, ph * 100))) { const r = Math.random(); const rr = { kind: 'hit', t: r < 0.64 ? 1 : r < 0.88 ? 2 : r < 0.93 ? 3 : 4 }; if (rr.t === 4) sfx.cheer(1); fly('hit', rr, () => res(rr)); }
      else if (chance(32 - (inZone ? 0 : 10))) res({ kind: 'foul' }); else fly('out', null, (fieldType) => res({ kind: 'out', fieldType }));
    };
    tickers.add(f);
  });

  let bases = 0; // 주자 수(단순)
  for (let inn = 1; inn <= innings; inn++) {
    hud.setScore(inn, my, S.er); let outs = 0; bases = 0; const bn = (t, ms) => hud.banner(t, ms);
    while (outs < 3) {
      const c = { b: 0, s: 0 }; hud.setCount(c, outs); let ended = false;
      bn(`${inn}회 ${outs}아웃  다음 타자`, 900); await wait(1000);
      while (!ended) {
        const r = await throwBall(c);
        if (r.kind === 'ball') { c.b++; bn('볼', 500); } else if (r.kind === 'strike') { c.s++; bn('스트라이크', 600); } else if (r.kind === 'whiff') { c.s++; bn('헛스윙!', 600); } else if (r.kind === 'foul') { if (c.s < 2) c.s++; bn('파울', 500); }
        else if (r.kind === 'out') { outs++; ended = true; sfx.out(); bn(r.fieldType==='air'?'뜬공 아웃':'땅볼 아웃', 900); }
        else { // 안타
          S.ha++; const adv = r.t; if (r.t === 4) { const sc = bases + 1; S.er += sc; bases = 0; bn(`홈런 허용 (${sc}실점)`, 1200); sfx.cheer(1.5); }
          else { let sc = 0; bases += 1; if (adv >= 2 && bases > 1) { sc += Math.min(bases - 1, adv); } if (bases > 3) { sc += bases - 3; bases = 3; } if (adv >= 2 && bases) { if (chance(55)) { sc++; bases = Math.max(0, bases - 1); } } S.er += sc; bn(`${['', '안타', '2루타', '3루타'][adv]} 허용${sc ? ` (${sc}실점)` : ''}`, 1100); sfx.cheer(0.8); } ended = true;
        }
        hud.setCount(c, outs);
        if (!ended && c.b >= 4) { ended = true; S.ha += 0; bases++; let sc = 0; if (bases > 3) { sc = 1; bases = 3; } S.er += sc; bn('볼넷', 800); }
        else if (!ended && c.s >= 3) { ended = true; outs++; S.so++; sfx.out(); bn('삼진!', 1000); }
        hud.setScore(inn, my, S.er);
        if (ended) await wait(900);
        if (outs >= 3) break;
      }
    }
    // 우리 팀 공격
    const lam = Math.max(0.1, 0.35 + (teamStrength(p) - 40) / 25); const add = Math.random() < lam * 0.7 ? (chance(25) ? 2 : 1) : 0; my += add;
    hud.banner(`${inn}회말 우리 팀 ${add}점`, 900); hud.setScore(inn, my, S.er); await wait(1000);
  }
  cv.removeEventListener('pointerdown', onD); cv.removeEventListener('pointermove', onM); window.removeEventListener('pointerup', onU); hud.removePicker(); window.dispatchEvent(new Event('resize'));
  let win = my > S.er; if (my === S.er) { win = chance(50 + p.ev.team * 0.1); if (win) my++; else S.er++; }
  const r = { ip: innings, so: S.so, er: S.er, hitsAllowed: S.ha, my, opp: S.er, win, kind: m.kind, title: m.name + ' vs ' + opp, ab: 0, hits: 0, hr: 0, rbi: 0 };
  applyMatchResult(p, r); return r;
}
