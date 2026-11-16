import { STAT_KEYS, PRACTICES, keysOf, STAT_NAME, practicesFor, TRAITS, INJURIES, EVENTS, ITEMS, TEAMS, PRO } from './data.js';
const clamp = (v, a = 0, b = 99) => Math.max(a, Math.min(b, Math.round(v)));
export const rnd = (a, b) => a + Math.random() * (b - a);
export const chance = (p) => Math.random() * 100 < p;
const KEY = 'rookie9.save.v1', HOF = 'rookie9.hof.v1';

export function newPlayer(name, build, pos = 'bat') {
  const base = pos === 'pit' ? { velo: 30, ctrl: 30, brk: 30, speed: 30, field: 30, stamina: 30 } : { meet: 30, power: 30, speed: 30, arm: 30, field: 30, stamina: 30 };
  const bonus = (pos === 'pit' ? { power: { velo: 12, stamina: 4 }, contact: { ctrl: 12, brk: 4 }, runner: { brk: 12, ctrl: 4 }, allround: { velo: 5, ctrl: 5, brk: 5, stamina: 5 } } : { contact: { meet: 12, speed: 4 }, slugger: { power: 12, arm: 4 }, runner: { speed: 12, field: 4 }, allround: { meet: 5, power: 5, speed: 5, field: 5, arm: 3 } })[build];
  for (const k in bonus) base[k] += bonus[k];
  return { name, build, pos, so: 0, ...base, cond: 70, will: 30, tough: 20, money: 50, study: 40, week: 0, traits: [],
    ev: { coach: 30, captain: 30, team: 30, scout: 15 }, cnt: {}, injury: null, banWeeks: 0, insured: false,
    wins: 0, losses: 0, hits: 0, ab: 0, hr: 0, rbi: 0, tour: [], log: ['입학했다. 3년 뒤 프로 지명을 목표로!'], pendingMatch: null, done: false, result: null };
}
export const ovr = (p) => p.pos === 'pit' ? Math.round((p.velo * 1.3 + p.ctrl * 1.3 + p.brk + p.stamina + p.field * 0.5 + p.speed * 0.3) / 5.4) : Math.round((p.meet * 1.4 + p.power * 1.2 + p.speed + p.arm * 0.7 + p.field * 0.9 + p.stamina * 0.8) / 6);
export const cal = (w) => { const y = 1 + Math.floor(w / 48); const m = ((Math.floor(w / 4) + 3) % 12) + 1; return { year: y, month: m, wk: (w % 4) + 1 }; };
export const condLabel = (c) => c >= 80 ? ['절호조', '#ff5a5f'] : c >= 60 ? ['호조', '#ff8a3d'] : c >= 40 ? ['보통', '#f4c20d'] : c >= 20 ? ['부진', '#3aa0e8'] : ['절부진', '#6b7280'];

export function save(p) { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {} }
export function load() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
export function clearSave() { try { localStorage.removeItem(KEY); } catch (e) {} }
export function hof() { try { return JSON.parse(localStorage.getItem(HOF)) || []; } catch (e) { return []; } }
export function pushHof(e) { const h = hof(); h.push(e); try { localStorage.setItem(HOF, JSON.stringify(h)); } catch (x) {} }

export const level = (p, id) => { const n = p.cnt[id] || 0; return n >= 16 ? 3 : n >= 7 ? 2 : 1; };
const LV_MUL = [0, 1, 1.3, 1.6];

// 이번 주가 시합 주인지: {kind:'league'|'tour', round}
export function matchOfWeek(p) {
  const c = cal(p.week);
  if (c.wk === 4 && [5, 6, 9, 10].includes(c.month)) return { kind: 'league', name: '리그전' };
  if (c.month === 7 && c.wk >= 2) { const key = c.year + ':sum'; if (p.tour.includes(key + ':out')) return null; return { kind: 'tour', name: '여름 대회 ' + (c.wk - 1) + '회전', key }; }
  if (c.month === 11 && c.wk === 3) { const key = c.year + ':fall'; return { kind: 'tour', name: '가을 대회', key }; }
  return null;
}
export const oppStrength = (p) => { const c = cal(p.week); return 38 + (c.year - 1) * 9 + (c.month % 4) * 2 + Math.random() * 8; };
export const teamStrength = (p) => 34 + ovr(p) * 0.35 + (p.ev.team - 30) * 0.15 + (p.cnt.chore || 0) * 0.02;
export const isRegular = (p) => { const avg = (p.ev.coach + p.ev.captain + p.ev.team) / 3; const need = [28, 40, 50][cal(p.week).year - 1]; return ovr(p) >= need + 6 || avg >= need + 14; };

function addEv(p, k, v) { p.ev[k] = clamp(p.ev[k] + v, 0, 100); }
export function applyFx(p, fx) {
  const ev = ['coach', 'captain', 'team', 'scout'];
  for (const k in fx) {
    if (k === 'msg') continue;
    if (ev.includes(k)) addEv(p, k, fx[k]);
    else if (k === 'money') p.money = Math.max(0, p.money + fx[k]);
    else if (typeof p[k] === 'number') p[k] = clamp(p[k] + fx[k]);
  }
}

// 한 주 진행. 결과 메시지 배열 반환
export function doCommand(p, id, arg) {
  const out = [];
  const bad = (t) => p.traits.includes(t);
  if (p.injury) {
    out.push(`${p.injury.name} 치료로 입원 중. 남은 ${p.injury.weeks}주`);
    p.injury.weeks--; p.cond = clamp(p.cond + 6);
    if (p.injury.weeks <= 0) { out.push('퇴원했다!'); p.injury = null; }
    return out;
  }
  if (id === 'rest') { p.cond = clamp(p.cond + (bad('cold') ? 22 : 40)); out.push('푹 쉬어서 컨디션이 회복됐다.'); }
  else if (id === 'alba') { const m = Math.round(rnd(35, 55)); p.money += m; p.cond = clamp(p.cond - 8); p.will = clamp(p.will + 1); out.push(`알바로 ${m}원을 벌었다.`); }
  else if (id === 'study') { p.study = clamp(p.study + 10 + rnd(0, 4)); p.cond = clamp(p.cond - 3); out.push('공부했다. 학업 상승.'); }
  else if (id === 'shop') { /* 구매는 별도 처리 */ out.push('쇼핑을 즐겼다.'); }
  else {
    const pr0 = PRACTICES.find((x) => x.id === id); const pr = id === 'basic' ? { ...pr0, gain: Object.fromEntries(keysOf(p).map((k) => [k, 1])) } : pr0;
    const lv = level(p, id);
    if (p.banWeeks > 0 && id !== 'refresh') { out.push('시험 성적 탓에 연습 금지! 효과 없음.'); p.cond = clamp(p.cond - 3); }
    else {
      const cmul = 0.6 + p.cond / 100 * 0.7; // 컨디션이 좋을수록 효율
      let mul = 0.5 * LV_MUL[lv] * cmul * (bad('lazy') ? 0.7 : 1) * rnd(0.85, 1.2);
      const gained = [];
      for (const k in pr.gain) { const g = Math.max(pr.gain[k] > 0 && Math.random() < 0.6 ? 1 : 0, Math.round(pr.gain[k] * mul * (p[k] > 60 ? 0.5 : 1))); if (g) { p[k] = clamp(p[k] + g); gained.push(`${STAT_NAME[k]} +${g}`); } }
      if (pr.will) { p.will = clamp(p.will + Math.round(pr.will * mul)); gained.push('의지 상승'); }
      if (pr.tough) p.tough = clamp(p.tough + pr.tough);
      if (pr.money) p.money += pr.money;
      for (const k in (pr.eval || {})) addEv(p, k, pr.eval[k]);
      const cost = pr.cost > 0 ? pr.cost * (bad('sleep') ? 1.3 : 1) : pr.cost;
      p.cond = clamp(p.cond - cost);
      if (pr.cureBad) { const b = p.traits.find((t) => !TRAITS[t].good); if (b && chance(60)) { p.traits = p.traits.filter((t) => t !== b); out.push(`${TRAITS[b].name} 치료!`); } }
      p.cnt[id] = (p.cnt[id] || 0) + 1;
      const nl = level(p, id); if (nl > lv) out.push(`${pr.name} Lv${nl} 달성! 효율 상승`);
      out.push(`${pr.name}: ${gained.join(', ') || '컨디션 회복'}`);
      // 부상 판정
      let risk = pr.risk * (1.6 - p.cond / 100) * (1 - p.tough * 0.005) * ((id === 'arm' || id === 'velo') && bad('bomb') ? 2 : 1);
      if (p.cond < 25) risk *= 2;
      if (pr.risk > 0 && Math.random() < risk) {
        const idx = Math.min(INJURIES.length - 1, Math.floor(Math.pow(Math.random(), 2.2) * 6 + (p.cond < 25 ? 1 : 0)));
        const inj = INJURIES[idx]; const wk = p.insured ? Math.ceil(inj.weeks / 2) : inj.weeks; p.insured = false;
        p.injury = { name: inj.name, weeks: wk }; addEv(p, 'coach', -4); out.push(`${inj.name} 부상! ${wk}주 입원`);
      }
    }
  }
  // 나쁜 상태 발생
  if (p.cond < 20 && chance(18) && !p.traits.includes('cold')) { p.traits.push('cold'); out.push('감기에 걸렸다.'); }
  if (((p.cnt.arm || 0) + (p.cnt.velo || 0)) > 8 && p.cond < 40 && chance(8) && !p.traits.includes('bomb')) { p.traits.push('bomb'); out.push('어깨에 폭탄이 생겼다.'); }
  if (id === 'rest' && (p.cnt.rest = (p.cnt.rest || 0) + 1) > 12 && chance(10) && !p.traits.includes('lazy')) { p.traits.push('lazy'); out.push('게을러졌다.'); }
  // 특수능력 획득
  for (const t in TRAITS) { const T = TRAITS[t]; if (T.test && !p.traits.includes(t) && T.test(p) && chance(35)) { p.traits.push(t); out.push(`특수능력 획득: ${T.name}`); } }
  return out;
}

export function buy(p, id) {
  const it = ITEMS.find((i) => i.id === id);
  if (p.money < it.price) return `돈이 부족하다 (${it.price}원)`;
  p.money -= it.price; it.fx(p); return `${it.name} 구입! ${it.desc}`;
}

// 주 종료 처리: 월말 시험, 달력 진행
export function endWeek(p) {
  const out = [];
  if (p.banWeeks > 0) p.banWeeks--;
  p.cond = clamp(p.cond + 3);
  p.week++;
  const c = cal(p.week);
  if (c.wk === 1 && [6, 12].includes(c.month)) { // 학기말 시험
    if (p.study < 30 + (c.year - 1) * 4) { p.banWeeks = 3; out.push('시험 성적 부진! 3주간 연습 금지'); addEv(p, 'coach', -5); }
    else { out.push('시험 통과'); }
    p.study = clamp(p.study - 12);
  }
  if (p.week >= 144) { finish(p); out.push('졸업식이다. 드래프트가 열린다!'); }
  return out;
}

export function randomEvent(p) {
  if (p.injury || p.week >= 144) return null;
  if (!chance(24)) return null;
  const pool = EVENTS.filter((e) => p.week >= e.min && (!e.pos || e.pos === p.pos) && (!e.trait || p.traits.includes(e.trait)) && (!e.req || (p.cnt['ev_' + e.req] > 0 && !p.cnt['ev_' + e.id])));
  return pool[Math.floor(Math.random() * pool.length)];
}
export function resolveEvent(p, ev, ci) {
  const ch = ev.choices[ci]; p.cnt['ev_' + ev.id] = (p.cnt['ev_' + ev.id] || 0) + 1;
  const success = chance(ch.chance);
  const fx = success ? ch.ok : (ch.ng || ch.ok);
  applyFx(p, fx);
  return { success, msg: fx.msg || '', fx };
}

// 시합 후 결과 반영
export function applyMatchResult(p, r) {
  if (p.pos === 'pit') {
    p.so += r.so || 0; p.hits += r.hitsAllowed || 0; p.ab += r.ip || 0;
    if (r.win) p.wins++; else p.losses++;
    const perf = (r.so || 0) * 3 + (r.ip || 0) * 2 - (r.er || 0) * 4 - (r.hitsAllowed || 0);
    addEv(p, 'coach', Math.round(perf * 0.5) + (r.win ? 3 : 0)); addEv(p, 'captain', r.win ? 4 : 1); addEv(p, 'team', r.win ? 4 : -1);
    addEv(p, 'scout', Math.round(perf * 0.6) + (r.kind === 'tour' ? 4 : 0)); p.cond = clamp(p.cond - 10);
    const k0 = cal(p.week); if (r.kind === 'tour' && !r.win) p.tour.push(k0.year + ':sum:out');
    p.log.unshift(`${r.title}: ${r.win ? '승' : '패'} ${r.my}-${r.opp} / ${r.ip}이닝 ${r.so}K 실점 ${r.er}`); return;
  }
  p.ab += r.ab; p.hits += r.hits; p.hr += r.hr; p.rbi += r.rbi;
  if (r.win) p.wins++; else p.losses++;
  const perf = r.hits * 6 + r.hr * 4 + r.rbi * 3 - (r.ab - r.hits) * 1;
  addEv(p, 'coach', Math.round(perf * 0.5) + (r.win ? 3 : 0));
  addEv(p, 'captain', r.win ? 4 : 0 + (r.hits ? 2 : -1));
  addEv(p, 'team', r.win ? 4 : -1);
  addEv(p, 'scout', Math.round(perf * 0.6) + (r.kind === 'tour' ? 4 : 0));
  p.cond = clamp(p.cond - 8);
  const k = cal(p.week);
  if (r.kind === 'tour' && !r.win) p.tour.push(k.year + ':sum:out');
  p.log.unshift(`${r.title}: ${r.win ? '승' : '패'} ${r.my}-${r.opp} / ${r.hits}안타 ${r.hr}홈런 ${r.rbi}타점`);
}

// 자동 진행: 능력치로 타석 시뮬
export function simulateMatch(p, m) {
  if (p.pos === 'pit') {
    const ip = isRegular(p) ? 5 : 1; const q = (p.velo * 1.1 + p.ctrl * 1.1 + p.brk * 0.8) / 3 + (p.traits.includes('aura') ? 4 : 0); const st = oppStrength(p);
    let er = 0, so = 0, ha = 0; for (let i = 0; i < ip * 3; i++) { const e = (st - 40) * 0.006 - (q - 50) * 0.004; if (Math.random() < 0.26 + e) { ha++; if (Math.random() < 0.45) er++; } if (Math.random() < 0.18 + (q - 40) * 0.004) so++; }
    const my = Math.max(0, Math.round(rnd(0, 3) + (teamStrength(p) - 40) / 12 + rnd(-1, 2))); let win = my > er; if (my === er) win = Math.random() < 0.5;
    const r = { ip, so, er, hitsAllowed: ha, my: my + (win && my === er ? 1 : 0), opp: er, win, kind: m.kind, title: m.name, ab: 0, hits: 0, hr: 0, rbi: 0 }; applyMatchResult(p, r); return r;
  }
  const pa = isRegular(p) ? 3 : 1;
  let hits = 0, hr = 0, rbi = 0, ab = 0;
  const avg = 0.16 + p.meet * 0.0029 + (p.traits.includes('avg') ? 0.03 : 0);
  for (let i = 0; i < pa; i++) { ab++; if (Math.random() < avg - (oppStrength(p) - 40) * 0.003) { hits++; if (Math.random() < 0.05 + p.power * 0.0018) { hr++; rbi += 1; } else if (Math.random() < 0.2) rbi++; } }
  return finishMatch(p, m, { ab, hits, hr, rbi });
}
export function finishMatch(p, m, s) {
  let opp = Math.max(0, Math.round(rnd(0, 3) + (oppStrength(p) - 40) / 12 + rnd(-1, 2)));
  let my = Math.max(0, Math.round(rnd(0, 3) + (teamStrength(p) - 40) / 12 + rnd(-1, 2))) + s.rbi;
  my += s.hits >= 2 ? 1 : 0;
  let win = my > opp; if (my === opp) { if (Math.random() < 0.5) { my++; win = true; } else opp++; }
  const r = { ...s, my, opp, win, kind: m.kind, title: m.name };
  applyMatchResult(p, r); return r;
}

function finish(p) {
  p.done = true;
  const score = ovr(p) * 0.7 + p.ev.scout * 0.2 + p.ev.coach * 0.1 + p.traits.filter((t) => TRAITS[t].good).length * 1.2 + Math.min(8, p.wins * 0.3) + p.hr * 0.4;
  let rank, team, text;
  if (score >= 82) { rank = 1; text = '1순위 지명! 전국이 주목하는 슈퍼 루키'; }
  else if (score >= 74) { rank = 2 + Math.floor(Math.random() * 3); text = `${rank}순위 상위 지명`; }
  else if (score >= 64) { rank = 6 + Math.floor(Math.random() * 10); text = `${rank}순위 지명`; }
  else if (score >= 54) { rank = 17 + Math.floor(Math.random() * 20); text = `하위 라운드 ${rank}순위 지명`; }
  else { rank = 0; text = '지명받지 못했다. 사회인 야구에서 도전을 이어간다.'; }
  team = rank ? PRO[Math.floor(Math.random() * PRO.length)] : '-';
  p.result = { rank, team, text, score: Math.round(score), ovr: ovr(p) };
  pushHof({ name: p.name, build: p.build, ovr: ovr(p), rank, team, pos: p.pos, stats: keysOf(p).map((k) => p[k]), traits: p.traits.filter((t) => TRAITS[t].good), hr: p.hr, wins: p.wins, date: Date.now() });
}
