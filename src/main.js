import { STAT_KEYS, STAT_NAME, grade, GRADE_COLOR, PRACTICES, OTHER_CMDS, TRAITS, ITEMS } from './data.js';
import * as G from './growth.js';
import { frame, showHome, playMatch } from './match.js';
import { buildField } from './scene.js';
buildField();

const ui = document.getElementById('ui');
let P = null;
const $ = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
const clear = () => { ui.innerHTML = ''; };
const show = (el) => { ui.appendChild(el); return el; };
const barColor = (v) => GRADE_COLOR[grade(v)];
const evName = { coach: '감독', captain: '캡틴', team: '팀메이트', scout: '스카우트' };

function titleScreen() {
  clear(); showHome();
  const sv = G.load();
  const h = G.hof();
  const el = show($(`<div class="screen"><div class="title">⚾ 루키나인<div style="font-size:15px;font-weight:700;margin-top:4px">3년의 고교야구, 한 명의 선수를 키우자</div></div><div class="spacer"></div>
    <div class="sub">3D 야구 · 주간 훈련 · 성장 모드</div>
    ${sv && !sv.done ? `<button class="btn big" id="cont">이어하기 (${sv.name} · ${G.cal(sv.week).year}학년 ${G.cal(sv.week).month}월)</button>` : ''}
    <button class="btn big alt" id="new">새 선수 만들기</button>
    <button class="btn gray" id="hof">명예의 전당 (${h.length})</button></div>`));
  el.querySelector('#new').onclick = createScreen;
  if (sv && !sv.done) el.querySelector('#cont').onclick = () => { P = sv; homeScreen(); };
  el.querySelector('#hof').onclick = hofScreen;
}

function hofScreen() {
  const h = G.hof().slice().reverse();
  const m = show($(`<div class="modal"><div class="panel"><h2>🏆 명예의 전당</h2>${h.length ? h.map((e) => `<div class="panel" style="margin:6px 0"><b>${e.name}</b> · 종합 ${e.ovr} · ${e.rank ? e.rank + '순위 ' + e.team : '미지명'}<br><small>${e.stats.join('/')} · 홈런 ${e.hr} · ${e.traits.map((t) => TRAITS[t].name).join(', ') || '특능 없음'}</small></div>`).join('') : '아직 졸업한 선수가 없습니다.'}<br><button class="btn" style="width:100%" id="x">닫기</button></div></div>`));
  m.querySelector('#x').onclick = () => m.remove();
}

function createScreen() {
  clear();
  const builds = [['contact', '🎯 교타형', '미트가 높다. 안타 장인'], ['slugger', '💥 장타형', '파워가 높다. 한 방'], ['runner', '⚡ 준족형', '주력·수비가 높다'], ['allround', '⭐ 만능형', '고르게 높다']];
  let sel = 'contact';
  const el = show($(`<div class="screen"><div class="title" style="margin-top:3vh;font-size:26px">선수 만들기</div>
    <div class="panel"><div style="font-size:13px;margin-bottom:6px">이름</div><input class="input" id="nm" maxlength="8" value="신인" /></div>
    <div class="panel"><div style="font-size:13px;margin-bottom:6px">타입</div><div class="build">${builds.map((b) => `<button data-b="${b[0]}" class="${b[0] === sel ? 'sel' : ''}"><b>${b[1]}</b><br><small>${b[2]}</small></button>`).join('')}</div></div>
    <div class="spacer"></div><button class="btn big" id="go">입학하기</button><button class="btn gray" id="bk">뒤로</button></div>`));
  el.querySelectorAll('.build button').forEach((b) => b.onclick = () => { sel = b.dataset.b; el.querySelectorAll('.build button').forEach((x) => x.classList.toggle('sel', x === b)); });
  el.querySelector('#bk').onclick = titleScreen;
  el.querySelector('#go').onclick = () => { P = G.newPlayer(el.querySelector('#nm').value.trim() || '신인', sel); G.save(P); homeScreen(); };
}

function statsHtml() {
  return `<div class="stats">${STAT_KEYS.map((k) => `<div class="st"><span>${STAT_NAME[k]}</span><span><b style="color:${barColor(P[k])}">${grade(P[k])}</b> ${P[k]}</span></div>`).join('')}</div>`;
}
function topHtml() {
  const c = G.cal(P.week); const [cl, cc] = G.condLabel(P.cond);
  return `<div class="top"><span class="chip">${c.year}학년 ${c.month}월 ${c.wk}주</span><span class="chip">💴 ${P.money}</span><span class="chip" style="background:${cc}">${cl} ${P.cond}</span></div>`;
}
function evHtml() {
  return `<div class="row" style="gap:6px">${Object.keys(evName).map((k) => `<div style="font-size:11px;text-align:center">${evName[k]}<div class="bar"><i style="width:${P.ev[k]}%;background:${P.ev[k] > 60 ? '#3bd16f' : P.ev[k] > 35 ? '#ffd23f' : '#e5484d'}"></i></div></div>`).join('')}</div>`;
}

function homeScreen(msgs) {
  clear(); showHome(); G.save(P);
  if (P.done) return endingScreen();
  const m = G.matchOfWeek(P);
  const c = G.cal(P.week);
  const el = show($(`<div class="screen">${topHtml()}
    <div class="panel"><div class="top"><span>⚾ ${P.name} <small>종합 ${G.ovr(P)}</small></span><span style="font-size:12px">${G.isRegular(P) ? '🟢 레귤러' : '⚪ 후보'}</span></div>${statsHtml()}
      <div style="margin-top:6px">${evHtml()}</div>
      <div class="ev" style="margin-top:6px">${P.traits.map((t) => `<span class="tr ${TRAITS[t].good ? '' : 'bad'}">${TRAITS[t].name}</span>`).join('') || '<small style="opacity:.7">특수능력 없음</small>'}${P.banWeeks ? `<span class="tr bad">연습 금지 ${P.banWeeks}주</span>` : ''}${P.injury ? `<span class="tr bad">🏥 ${P.injury.name} ${P.injury.weeks}주</span>` : ''}</div></div>
    <div class="spacer"></div>
    ${msgs ? `<div class="panel log">${msgs.map((x) => '· ' + x).join('<br>')}</div>` : `<div class="panel log">${P.log.slice(0, 2).map((x) => '· ' + x).join('<br>')}</div>`}
    ${m ? `<div class="panel" style="border-color:#ffd23f"><b>⚾ 이번 주 시합: ${m.name}</b></div>` : ''}
    <div class="cmds" id="cmds"></div>
    <div class="row"><button class="btn gray" id="menu">메뉴</button><button class="btn alt" id="stat">상세 능력</button></div></div>`));
  const box = el.querySelector('#cmds');
  const inj = !!P.injury;
  for (const pr of PRACTICES) {
    const lv = G.level(P, pr.id);
    const b = $(`<button class="cmd ${inj ? 'dis' : ''}"><span class="ic">${pr.icon}</span>${pr.name}<small>${pr.desc}</small>${P.cnt[pr.id] ? `<span class="lv">Lv${lv}</span>` : ''}</button>`);
    b.onclick = () => runWeek(pr.id); box.appendChild(b);
  }
  for (const o of OTHER_CMDS) {
    const b = $(`<button class="cmd ${inj ? 'dis' : ''}" style="background:#2c4580"><span class="ic">${o.icon}</span>${o.name}<small>${o.desc}</small></button>`);
    b.onclick = () => o.id === 'shop' ? shopModal() : runWeek(o.id); box.appendChild(b);
  }
  if (inj) { const b = $(`<button class="cmd" style="grid-column:1/-1;background:#c92a2a"><span class="ic">🏥</span>입원 중: 한 주 쉬며 치료하기</button>`); b.onclick = () => runWeek('hospital'); box.prepend(b); }
  el.querySelector('#stat').onclick = detailModal;
  el.querySelector('#menu').onclick = menuModal;
}

function detailModal() {
  const m = show($(`<div class="modal"><div class="panel"><h2>${P.name}의 상세</h2>
    <table class="mini">${STAT_KEYS.map((k) => `<tr><td>${STAT_NAME[k]}</td><td><b style="color:${barColor(P[k])}">${grade(P[k])}</b> ${P[k]}</td><td style="width:50%"><div class="bar"><i style="width:${P[k]}%;background:${barColor(P[k])}"></i></div></td></tr>`).join('')}
    <tr><td>의지</td><td>${P.will}</td><td></td></tr><tr><td>터프도</td><td>${P.tough}</td><td></td></tr><tr><td>학업</td><td>${P.study}</td><td></td></tr></table>
    <h2 style="margin-top:10px">평가</h2>${Object.keys(evName).map((k) => `${evName[k]} ${P.ev[k]}`).join(' / ')}
    <h2 style="margin-top:10px">전적</h2>${P.wins}승 ${P.losses}패 · ${P.hits}/${P.ab} · 홈런 ${P.hr} · 타점 ${P.rbi}
    <h2 style="margin-top:10px">특수능력</h2>${P.traits.map((t) => `<div><b>${TRAITS[t].name}</b> <small>${TRAITS[t].desc}</small></div>`).join('') || '없음'}
    <h2 style="margin-top:10px">기록</h2><div class="log">${P.log.slice(0, 8).map((x) => '· ' + x).join('<br>')}</div><br><button class="btn" style="width:100%" id="x">닫기</button></div></div>`));
  m.querySelector('#x').onclick = () => m.remove();
}
function menuModal() {
  const m = show($(`<div class="modal"><div class="panel"><h2>메뉴</h2><div style="display:grid;gap:8px"><button class="btn" id="x">계속하기</button><button class="btn alt" id="t">타이틀로</button><button class="btn warn" id="r">이 선수 포기하고 초기화</button></div></div></div>`));
  m.querySelector('#x').onclick = () => m.remove();
  m.querySelector('#t').onclick = () => { G.save(P); titleScreen(); };
  m.querySelector('#r').onclick = () => { if (prompt('정말 삭제합니까? "초기화"를 입력하세요') === '초기화') { G.clearSave(); titleScreen(); } };
}
function shopModal() {
  const draw = (note) => {
    const m = show($(`<div class="modal"><div class="panel"><h2>🛍️ 쇼핑 (💴 ${P.money})</h2>${note ? `<div class="log" style="color:#ffd23f">${note}</div>` : ''}<div style="display:grid;gap:6px">${ITEMS.map((i) => `<button class="btn alt" data-i="${i.id}" style="text-align:left;display:flex;justify-content:space-between"><span>${i.name}<br><small>${i.desc}</small></span><span>${i.price}</span></button>`).join('')}</div><div class="row" style="margin-top:8px"><button class="btn gray" id="x">그만 사기</button><button class="btn" id="end">쇼핑 끝 (한 주 소비)</button></div></div></div>`));
    m.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { const r = G.buy(P, b.dataset.i); m.remove(); draw(r); });
    m.querySelector('#x').onclick = () => { m.remove(); G.save(P); homeScreen(); };
    m.querySelector('#end').onclick = () => { m.remove(); runWeek('shop'); };
  }; draw();
}

function runWeek(id) {
  let msgs = G.doCommand(P, id === 'hospital' ? 'x' : id);
  const m = G.matchOfWeek(P);
  const finishAfter = () => { const e = G.endWeek(P); msgs = msgs.concat(e); afterWeekEvent(msgs); };
  if (m && !P.injury) matchPrompt(m, msgs, finishAfter); else finishAfter();
}

function afterWeekEvent(msgs) {
  if (P.done) { G.save(P); return homeScreen(); }
  const ev = G.randomEvent(P);
  if (!ev) return homeScreen(msgs);
  const mod = show($(`<div class="modal"><div class="panel"><h2>📣 ${ev.title}</h2><p>${ev.text}</p><div style="display:grid;gap:8px">${ev.choices.map((c, i) => `<button class="btn alt" data-c="${i}">${c.label} <small>(성공률 ${c.chance}%)</small></button>`).join('')}</div></div></div>`));
  mod.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { const r = G.resolveEvent(P, ev, +b.dataset.c); mod.remove(); homeScreen(msgs.concat([`[이벤트] ${r.success ? '✔' : '✖'} ${r.msg}`])); });
}

function matchPrompt(m, msgs, cont) {
  const mod = show($(`<div class="modal"><div class="panel"><h2>⚾ ${m.name}</h2><p>${G.isRegular(P) ? '레귤러로 출전합니다. 타석 3번을 직접 칠 수 있어요.' : '아직 후보입니다. 대타로 1타석만 기회가 옵니다.'}</p><div style="display:grid;gap:8px"><button class="btn big" id="play">🎮 직접 플레이</button><button class="btn gray" id="auto">⏩ 자동 진행</button></div></div></div>`));
  mod.querySelector('#auto').onclick = () => { mod.remove(); const r = G.simulateMatch(P, m); resultModal(r, msgs, cont); };
  mod.querySelector('#play').onclick = async () => { mod.remove(); const r = await startMatch(m); resultModal(r, msgs, cont); };
}

async function startMatch(m) {
  clear();
  const hud = $(`<div class="screen" style="padding:6px 10px"><div class="scoreb"><span id="t" style="font-size:13px"></span><span id="sc">0 : 0</span></div><div class="top"><div class="dots" id="cnt"></div><div class="chip" id="pi"></div></div></div>`);
  show(hud); const bn = $(`<div></div>`); ui.appendChild(bn);
  const sw = $(`<button class="swing">SWING</button>`); show(sw);
  show($(`<div class="hint">화면을 드래그해 노란 링을 공 위치에 맞추고, 공이 홈플레이트에 닿을 때 SWING!</div>`));
  let swFn = null;
  const act = (e) => { e.preventDefault(); if (swFn) swFn(); }; sw.addEventListener('pointerdown', act);
  const api = {
    setTitle: (t) => hud.querySelector('#t').textContent = t,
    setScore: (i, a, b) => hud.querySelector('#sc').textContent = `${i}회  ${a} : ${b}`,
    setCount: (c) => hud.querySelector('#cnt').innerHTML = `B ${[0, 1, 2, 3].map((i) => `<span class="dot b ${i < c.b ? 'on' : ''}"></span>`).join('')} S ${[0, 1, 2].map((i) => `<span class="dot s ${i < c.s ? 'on' : ''}"></span>`).join('')}`,
    setPitch: (t) => hud.querySelector('#pi').textContent = t,
    banner: (t, ms) => { bn.innerHTML = `<div class="banner">${t}</div>`; clearTimeout(api._t); api._t = setTimeout(() => bn.innerHTML = '', ms); },
    onSwing: (f) => { swFn = f; }, offSwing: () => { swFn = null; },
  };
  const r = await playMatch(P, m, api);
  return r;
}

function resultModal(r, msgs, cont) {
  clear(); showHome();
  const mod = show($(`<div class="modal"><div class="panel"><h2>${r.win ? '🎉 승리!' : '😢 패배'}</h2><div style="font-size:30px;font-weight:900;text-align:center">${r.my} : ${r.opp}</div><p style="text-align:center">${r.ab}타수 ${r.hits}안타 ${r.hr}홈런 ${r.rbi}타점</p><div class="log">감독·팀메이트·스카우트 평가가 갱신되었습니다.</div><br><button class="btn big" id="ok">다음</button></div></div>`));
  mod.querySelector('#ok').onclick = () => { mod.remove(); G.save(P); cont(); };
}

function endingScreen() {
  clear(); showHome();
  const r = P.result;
  const el = show($(`<div class="screen"><div class="title" style="font-size:28px">🎓 졸업 · 드래프트</div><div class="panel" style="text-align:center"><div style="font-size:22px;font-weight:900">${r.text}</div>${r.rank ? `<div>${r.team}</div>` : ''}<div style="margin-top:8px">종합 ${r.ovr} · 평가점수 ${r.score}</div><div>${P.wins}승 ${P.losses}패 · 홈런 ${P.hr}</div></div>
    <div class="panel">${statsHtml()}<div class="ev" style="margin-top:6px">${P.traits.filter((t) => TRAITS[t].good).map((t) => `<span class="tr">${TRAITS[t].name}</span>`).join('')}</div></div>
    <div class="spacer"></div><div class="panel log">선수는 명예의 전당에 저장되었습니다.</div><button class="btn big" id="again">새 선수로 다시 시작</button><button class="btn gray" id="hof">명예의 전당</button></div>`));
  el.querySelector('#again').onclick = () => { G.clearSave(); createScreen(); };
  el.querySelector('#hof').onclick = hofScreen;
}

window.__game = { get P() { return P; }, G, skipWeeks: (n) => { for (let i = 0; i < n; i++) { G.doCommand(P, 'basic'); G.endWeek(P); } homeScreen(); } };
requestAnimationFrame(frame);
titleScreen();
