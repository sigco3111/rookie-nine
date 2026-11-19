import { mountSchoolBackups } from './school-backups-ui.js';
import { createSchoolRestorer } from './school-restore.js';
import { mountSchoolRecoveryPreview } from './school-import-preview-ui.js';
import './school-import-preview-ui.css';
import { UNIFORMS, STAT_NAME, grade, GRADE_COLOR, practicesFor, OTHER_CMDS, TRAITS, itemsFor, itemDescription, keysOf, traitGoals, requirementValue } from './data.js';
import { playPitching } from './pitching.js';
import * as G from './growth.js';
import { frame, showHome, playMatch, playTrainingAnim } from './match.js';
import { unlock, sfx } from './audio.js';
import { ic } from './icons.js';
addEventListener('pointerdown', unlock, { once: false });
import { buildField } from './scene.js';
buildField();

const ui = document.getElementById('ui');
let P = null;
const $ = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstChild; };
const clear = () => { ui.innerHTML = ''; };
const show = (el) => { ui.appendChild(el); return el; };
const barColor = (v) => GRADE_COLOR[grade(v)];
const evName = { coach: '감독', captain: '캡틴', team: '팀메이트', scout: '스카우트' };
// Keep the warning outside cleared game screens and never imply an unsuccessful write is saved.
const saveWarning=document.createElement('div');saveWarning.id='save-warning';saveWarning.setAttribute('role','alert');saveWarning.hidden=true;
saveWarning.innerHTML='<b>저장하지 못했습니다</b><div class="save-detail"></div><small>이 창을 닫거나 새로고침하면 최근 진행을 잃을 수 있습니다. 저장 공간·브라우저 설정을 확인한 뒤 다시 시도하세요.</small><button class="btn warn" id="retry-save">저장 다시 시도</button><button class="btn gray" id="export-school">원문·대기 기록 내려받기</button><button class="btn gray" id="preview-school">복구 파일 살펴보기</button><small id="export-school-status" role="status"></small>';
document.body.appendChild(saveWarning);
function drawSaveWarning(){const status=G.storageStatus(),sourceIssue=status.issues.some(i=>i.state!=='rejected'),rejected=status.issues.some(i=>i.state==='rejected');saveWarning.hidden=status.ok;saveWarning.querySelector('b').textContent=sourceIssue?'저장 원문 확인이 필요합니다':rejected?'새 기록을 저장하지 않았습니다':'저장하지 못했습니다';saveWarning.querySelector('.save-detail').textContent=[...status.pending,...status.issues.map(i=>`${i.record}: ${i.error}`)].join(' · ');saveWarning.querySelector('small').textContent=sourceIssue?'원본은 삭제·초기화하지 않았습니다. 덮어쓰기를 멈췄습니다. 브라우저 설정을 확인한 뒤 다시 시도하세요. 대기 중인 새 기록은 이 창을 닫으면 잃을 수 있습니다.':rejected?'새 기록의 형식에 문제가 있어 이전 저장과 정상 대기 기록을 보존했습니다. 먼저 기록을 내려받아 두세요. 재시도만으로 잘못된 값이 수정되지는 않습니다.':'이 창을 닫거나 새로고침하면 최근 진행을 잃을 수 있습니다. 저장 공간·브라우저 설정을 확인한 뒤 다시 시도하세요.';const note=document.querySelector('#hof-save-note');if(note)note.textContent=status.pending.includes('명예의 전당')?'명예의 전당 저장 대기 중입니다. 위의 저장 안내를 확인하세요.':'선수는 명예의 전당에 저장되었습니다.';}

window.addEventListener('rookie9-storage',drawSaveWarning);saveWarning.querySelector('#retry-save').onclick=()=>{G.retryStorage();if(document.querySelector('#new'))titleScreen();};
let recoveryPreview=null;
saveWarning.querySelector('#preview-school').onclick=()=>{recoveryPreview?.destroy();recoveryPreview=mountSchoolRecoveryPreview(document.body,{onClose:()=>recoveryPreview=null,restorer:createSchoolRestorer({getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v)},()=>{if(!document.querySelector('.screen #new'))throw Error('진행 중인 화면에서는 복원할 수 없습니다. 메뉴에서 제목 화면으로 돌아간 뒤 다시 확인하세요.');return G.schoolRecoverySnapshot();}),onRestored:()=>{P=null;recoveryPreview?.destroy();recoveryPreview=null;G.retryStorage();titleScreen();}});};
saveWarning.querySelector('#export-school').onclick=()=>{
 try{const data=G.schoolRecoverySnapshot(),blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='rookie9-school-recovery.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);saveWarning.querySelector('#export-school-status').textContent='다운로드를 요청했습니다. 파일 앱·다운로드 목록에서 저장됐는지 확인하세요. 원본은 바꾸지 않았고, 읽지 못한 원문은 파일에 상태만 남깁니다. 복구 파일 살펴보기에서 유효한 기록을 선택하고 별도로 확인할 수 있습니다.';}
 catch{saveWarning.querySelector('#export-school-status').textContent='파일을 준비하지 못했습니다. 이 창을 유지하고 다시 시도하세요.';}
};



function titleScreen() {
  clear(); showHome(typeof P !== 'undefined' && P ? P.pos : 'bat', typeof P !== 'undefined' ? P : null);
  const sv = G.load();
  const resumable = sv && (!sv.done || sv.result);
  const h = G.hof();
  drawSaveWarning();
  const playerBlocked=G.storageStatus().issues.some(i=>i.record==='선수 기록'),hofBlocked=G.storageStatus().issues.some(i=>i.record==='명예의 전당');
  const el = show($(`<div class="screen"><div class="title">${ic('ball')} 루키나인<div style="font-size:15px;font-weight:700;margin-top:4px">3년의 고교야구, 한 명의 선수를 키우자</div></div><div class="spacer"></div>
    <div class="sub">3D 야구 · 주간 훈련 · 성장 모드</div>
    ${resumable ? `<button class="btn big" id="cont">${sv.done ? '졸업 결과 다시 보기' : `이어하기 (${sv.name} · ${G.cal(sv.week).year}학년 ${G.cal(sv.week).month}월)`}</button>` : ''}
    <button class="btn big alt" id="new">새 선수 만들기</button>
    <button class="btn gray" id="hof">명예의 전당 (${h.length})</button><button class="btn gray" id="school-backups">원문 백업 보기</button></div>`));
  el.querySelector('#new').disabled=playerBlocked;el.querySelector('#hof').disabled=hofBlocked;
  el.querySelector('#new').onclick = createScreen;
  if (resumable) el.querySelector('#cont').onclick = () => { P = sv; if (P.pendingResult) { const q = P.pendingResult; resultModal(q.result, q.msgs, () => finishWeek(q.msgs, new Set(q.previousTraits))); } else if (P.pendingMatch) { clear(); showHome(P.pos, P); const q = P.pendingMatch; matchPrompt(q.match, q.msgs, new Set(q.previousTraits), () => finishWeek(q.msgs, new Set(q.previousTraits))); } else if (P.pendingEvent) { clear(); showHome(P.pos, P); eventChoiceModal(P.pendingEvent); } else if (P.pendingEventResult) { clear(); showHome(P.pos, P); eventResultModal(P.pendingEventResult); } else if (P.pendingLearned) { clear(); showHome(P.pos, P); learnedModal(P.pendingLearned); } else if (P.review) { clear(); showHome(P.pos, P); yearReviewModal(P.review.msgs || []); } else homeScreen(); };
  el.querySelector('#hof').onclick = hofScreen;
  el.querySelector('#school-backups').onclick=()=>mountSchoolBackups(document.body,localStorage);
}

function hofScreen() {
  const h = G.hof().slice().reverse();
  const career = e => {
    const c=e.career;
    if(!c)return e.pos==='pit'?'이전 기록: 투수 세부 성적 미저장':`홈런 ${e.hr??0} · 이전 기록은 일부 성적만 저장됨`;
    return `${c.wins}승 ${c.losses}패 · ${e.pos==='pit'?`${c.ip}이닝 ${c.so}탈삼진 ${c.hitsAllowed}피안타`:`${c.ab}타수 ${c.hits}안타 ${c.hr}홈런 ${c.rbi}타점`}`;
  };
  const stats=e=>(e.pos==='pit'?['구속','제구','변화구','주력','수비','체력']:['미트','파워','주력','송구','수비','체력']).map((name,i)=>`${name} ${e.stats[i]}`).join(' · ');
  const m = show($(`<div class="modal"><div class="panel"><h2>${ic('trophy')} 명예의 전당</h2><div style="max-height:65vh;overflow:auto">${h.length ? h.map((e,i) => `<div class="panel" style="margin:8px 0"><b>${e.name}</b> · ${e.pos==='pit'?'투수':'타자'} · 종합 ${e.ovr}<div style="color:#ffd23f;margin:6px 0">${e.rank ? e.rank + '순위 ' + e.team : '미지명'}</div><p style="font-size:13px;margin:6px 0">${career(e)}</p><small style="color:#b5c6dd">${stats(e)}</small><div class="chips" style="margin-top:6px">${e.traits.map((t) => `<span class="chip up">${TRAITS[t].name}</span>`).join('') || '<span class="chip">특능 없음</span>'}</div>${e.yearReviews?.length?`<button class="btn alt" data-hofyears="${i}" style="width:100%;margin-top:8px">학년별 성장 기록</button>`:'<small style="display:block;margin-top:8px;color:#b5c6dd">이전 선수: 학년별 결산 미저장</small>'}</div>`).join('') : '<p>아직 졸업한 선수가 없습니다.</p>'}</div><button class="btn" style="width:100%;margin-top:8px" id="x">닫기</button></div></div>`));
  m.querySelectorAll('[data-hofyears]').forEach(b=>b.onclick=()=>{m.remove();yearHistoryModal(false,h[+b.dataset.hofyears].yearReviews);});
  m.querySelector('#x').onclick = () => m.remove();
}

function createScreen() {
  clear();
  const BUILDS = { bat: [['contact', '교타형', '미트가 높다. 안타 장인'], ['slugger', '장타형', '파워가 높다. 한 방'], ['runner', '준족형', '주력·수비가 높다'], ['allround', '만능형', '고르게 높다']],
    pit: [['power', '강속구형', '구속이 높다. 힘으로 승부'], ['contact', '제구형', '컨트롤이 높다. 코너 공략'], ['runner', '변화구형', '변화구 위력이 높다'], ['allround', '만능형', '고르게 높다']] };
  let pos = 'bat'; let builds = BUILDS.bat; let sel = 'contact';
  const el = show($(`<div class="screen"><div class="title" style="margin-top:3vh;font-size:26px">선수 만들기</div>
    <div class="panel"><div style="font-size:13px;margin-bottom:6px">이름</div><input class="input" id="nm" maxlength="8" value="신인" /></div>
    <div class="panel"><div style="font-size:13px;margin-bottom:6px">포지션</div><div class="build" id="pos"><button data-p="bat" class="sel"><b>타자</b><br><small>직접 타격, 미트/파워가 핵심</small></button><button data-p="pit"><b>투수</b><br><small>직접 투구, 구속/제구/변화구</small></button></div></div>
    <div class="panel"><div style="font-size:13px;margin-bottom:6px">타입</div><div class="build" id="bd"></div></div>
    ${G.hof().length ? `<div class="panel"><div style="font-size:13px;margin-bottom:6px">선배의 가르침 (명예의 전당 계승)</div><select class="input" id="inh"><option value="">계승 안 함</option>${G.hof().map((e, i) => ({ e, i })).sort((a, b) => b.e.ovr - a.e.ovr).slice(0, 6).map(({ e, i }) => `<option value="${i}">${e.name} (${e.pos === 'pit' ? '투수' : '타자'} 종합 ${e.ovr})</option>`).join('')}</select><small id="inhd" style="opacity:.8">선배의 노하우로 전 능력치 소폭 상승, 같은 포지션이면 특수능력 계승.</small></div>` : ''}
    <div class="spacer"></div><button class="btn big" id="go">입학하기</button><button class="btn gray" id="bk">뒤로</button></div>`));
  const drawInheritance = () => {
    const select=el.querySelector('#inh'), note=el.querySelector('#inhd');if(!select)return;
    const e=select.value===''?null:G.hof()[+select.value],info=G.inheritanceInfo(e,pos);
    note.style.display='block';note.style.marginTop='8px';
    note.textContent=info?`${e.name} 선배: 전 능력 +${info.bonus} · 의지 +5 · 감독 +6. ${info.trait?`계승 특능: ${TRAITS[info.trait].name}`:e.pos===pos?'계승할 특능 없음':'포지션이 달라 특능은 계승하지 않습니다.'}`:'계승 없이 시작합니다. 선배를 고르면 입학 전 보너스를 확인할 수 있습니다.';
  };
  if(el.querySelector('#inh'))el.querySelector('#inh').onchange=drawInheritance;
  drawInheritance();
  const drawB = () => { const bd = el.querySelector('#bd'); bd.innerHTML = builds.map((b) => `<button data-b="${b[0]}" class="${b[0] === sel ? 'sel' : ''}"><b>${b[1]}</b><br><small>${b[2]}</small></button>`).join(''); bd.querySelectorAll('button').forEach((b) => b.onclick = () => { sel = b.dataset.b; drawB(); }); };
  drawB();
  el.querySelectorAll('#pos button').forEach((b) => b.onclick = () => { pos = b.dataset.p; builds = BUILDS[pos]; sel = 'contact'; drawInheritance(); el.querySelectorAll('#pos button').forEach((x) => x.classList.toggle('sel', x === b)); drawB(); });
  el.querySelector('#bk').onclick = titleScreen;
  el.querySelector('#go').onclick = () => { P = G.newPlayer(el.querySelector('#nm').value.trim() || '신인', sel, pos); { const sv = el.querySelector('#inh'); if (sv && sv.value !== '') { const e = G.hof()[+sv.value]; const info = G.inheritanceInfo(e,pos), b = info.bonus; for (const k of keysOf(P)) P[k] += b; P.will += 5; P.ev.coach += 6; P.log.unshift(`${e.name} 선배의 가르침을 받았다. (능력치 +${b})`); if (info.trait && !P.traits.includes(info.trait)) { P.traits.push(info.trait); P.log.unshift('선배의 특수능력을 이어받았다!'); } } } G.save(P); homeScreen(); };
}

function statsHtml(showCommand = false) {
  const lastDiff = showCommand ? P.commandReport?.statFx || {} : {};
  return `<div class="stats">${keysOf(P).map((k) => `<div class="st"><span>${STAT_NAME[k]}</span><span><b style="color:${barColor(P[k])}">${grade(P[k])}</b> ${P[k]}${lastDiff[k] ? `<small style="color:${lastDiff[k] > 0 ? '#3bd16f' : '#ff6b6b'};font-weight:900"> ${lastDiff[k] > 0 ? '+' : ''}${lastDiff[k]}</small>` : ''}</span></div>`).join('')}</div>`;
}
function topHtml() {
  const c = G.cal(P.week); const [cl, cc] = G.condLabel(P.cond);
  return `<div class="top"><span class="chip">${c.year}학년 ${c.month}월 ${c.wk}주</span><span class="chip">${ic('coin')} ${P.money}</span><span class="chip" style="background:${cc}">${cl} ${P.cond}</span></div>`;
}
function evHtml() {
  return `<div class="row" style="gap:6px">${Object.keys(evName).map((k) => `<div style="font-size:11px;text-align:center">${evName[k]}<div class="bar"><i style="width:${P.ev[k]}%;background:${P.ev[k] > 60 ? '#3bd16f' : P.ev[k] > 35 ? '#ffd23f' : '#e5484d'}"></i></div></div>`).join('')}</div>`;
}

function commandReportHtml() {
  const names = { cond: '컨디션', money: '용돈', study: '학업', tough: '터프도', will: '의지', ...evName };
  const fx = Object.entries(P.commandReport?.fx || {});
  if (!fx.length) return '';
  return `<div class="command-report"><small>${P.commandReport.year}학년 ${P.commandReport.month}월 ${P.commandReport.wk}주 명령 직후<br>능력 옆 증감도 같은 시점 · 주말 회복/경기/이벤트 제외</small><div class="chips">${fx.map(([k,v]) => `<span class="chip ${v>0?'up':'dn'}">${names[k]} ${v>0?'+':''}${v}</span>`).join('')}</div></div>`;
}
function homeScreen(msgs) {
  const selectionNotice = G.selectionChange(P);
  clear(); showHome(typeof P !== 'undefined' && P ? P.pos : 'bat', typeof P !== 'undefined' ? P : null); G.save(P);
  if (P.done) return endingScreen();
  const m = G.matchOfWeek(P);
  const c = G.cal(P.week);
  const el = show($(`<div class="screen">${topHtml()}
    ${selectionNotice ? `<div class="panel" style="border:2px solid ${selectionNotice.regular ? '#66e692' : '#ffd23f'};background:#20375e"><b style="font-size:20px;color:${selectionNotice.regular ? '#66e692' : '#ffd23f'}">${selectionNotice.title}</b><div style="font-size:13px;margin-top:5px">${selectionNotice.text}</div></div>` : ''}
    <div class="panel homepanel"><div class="top"><span>${ic("cap")} ${P.name} <small>종합 ${G.ovr(P)}</small></span><span style="font-size:12px">${G.isRegular(P) ? '● 레귤러' : '○ 후보'}</span></div>${statsHtml(true)}
      <div style="margin-top:4px">${evHtml()}</div>
      <div class="ev" style="margin-top:6px">${P.traits.map((t) => `<span class="tr ${TRAITS[t].good ? '' : 'bad'}">${TRAITS[t].name}</span>`).join('') || '<small style="opacity:.7">특수능력 없음</small>'}${P.banWeeks ? `<span class="tr bad">연습 금지 ${P.banWeeks}주</span>` : ''}${P.injury ? `<span class="tr bad">입원 ${P.injury.name} ${P.injury.weeks}주</span>` : ''}</div></div>
    <div class="spacer"></div>
    <div class="panel log">${(msgs || P.log.slice(0,2)).map(x=>'· '+x).join('<br>')}${commandReportHtml()}</div>
    ${m ? `<div class="panel" style="border-color:#ffd23f"><b>${ic('ball')} 이번 주 시합: ${m.name}</b></div>` : ''}
    <div class="cmds" id="cmds"></div>
    <div class="row"><button class="btn gray" id="menu">메뉴</button><button class="btn alt" id="stat">상세 능력</button></div></div>`));
  const box = el.querySelector('#cmds');
  const inj = !!P.injury;
  for (const pr of practicesFor(P)) {
    const lv = G.level(P, pr.id);
    const blocked = inj || (P.banWeeks > 0 && pr.id !== 'refresh');
    const b = $(`<button ${blocked ? 'disabled aria-disabled="true"' : ''} class="cmd ${inj || blocked ? 'dis' : ''}"><span class="ic">${ic(pr.id)}</span>${pr.name}<small>${inj ? '입원 중 · 치료 필요' : blocked ? '연습 금지 중' : pr.desc}</small>${blocked ? '' : riskBadge(pr)}${P.cnt[pr.id] ? `<span class="lv">Lv${lv}</span>` : ''}</button>`);
    b.onclick = () => { if (!blocked) runWeek(pr.id); }; box.appendChild(b);
  }
  for (const o of OTHER_CMDS) {
    const blocked = inj && o.id !== 'shop';
    const b = $(`<button ${blocked ? 'disabled aria-disabled="true"' : ''} class="cmd ${blocked ? 'dis' : ''}" style="background:#2c4580"><span class="ic">${ic(o.id)}</span>${o.name}<small>${blocked ? '입원 중 · 치료 필요' : o.desc}</small></button>`);
    b.onclick = () => { if (!blocked) o.id === 'shop' ? shopModal() : runWeek(o.id); }; box.appendChild(b);
  }
  if (inj) { const b = $(`<button class="cmd" style="grid-column:1/-1;background:#c92a2a;font-size:18px"><span class="ic">${ic('hospital')}</span>한 주 쉬며 치료하기<small style="font-size:12px;line-height:1.4">${P.injury.name} · 남은 ${P.injury.weeks}주 → ${P.injury.weeks-1}주<br>치료 직후 컨디션 +${Math.min(6,99-P.cond)} (주말 회복 별도)<br>훈련/알바/공부는 쉬어갑니다</small></button>`); b.onclick = () => runWeek('hospital'); box.prepend(b); }
  el.querySelector('#stat').onclick = detailModal;
  el.querySelector('#menu').onclick = menuModal;
}

function riskBadge(pr) { const r = Math.round(G.trainingRisk(P, pr) * 100); return r >= 3 ? `<small style="color:${r >= 6 ? '#ff6b6b' : '#ffd23f'}">부상 약 ${r}%</small>` : ''; }
function detailModal() {
  const m = show($(`<div class="modal"><div class="panel"><h2>${P.name}의 상세</h2>
    <table class="mini">${keysOf(P).map((k) => `<tr><td>${STAT_NAME[k]}</td><td><b style="color:${barColor(P[k])}">${grade(P[k])}</b> ${P[k]}</td><td style="width:50%"><div class="bar"><i style="width:${P[k]}%;background:${barColor(P[k])}"></i></div></td></tr>`).join('')}
    <tr><td>의지</td><td>${P.will}</td><td></td></tr><tr><td>터프도</td><td>${P.tough}</td><td></td></tr><tr><td>학업</td><td>${P.study}</td><td></td></tr></table>
    <button class="btn alt" id="academic" style="width:100%;margin-top:8px">학업과 다음 시험</button><h2 style="margin-top:10px">평가</h2>${Object.keys(evName).map((k) => `${evName[k]} ${P.ev[k]}`).join(' / ')}
    <button class="btn alt" id="selection" style="width:100%;margin-top:8px">출전 기회와 신뢰</button><button class="btn alt" id="draft" style="width:100%;margin-top:8px">지명 목표와 현재 평가</button><h2 style="margin-top:10px">전적</h2>${P.wins}승 ${P.losses}패 · ${P.pos === 'pit' ? `${P.so || 0}탈삼진 · ${P.hits}피안타 · ${P.ab}이닝` : `${P.hits}/${P.ab} · 홈런 ${P.hr} · 타점 ${P.rbi}`}<button class="btn alt" id="matches" style="width:100%;margin-top:8px">최근 경기 기록</button>
    <h2 style="margin-top:10px">특수능력</h2>${P.traits.map((t) => `<div><b>${TRAITS[t].name}</b> <small>${TRAITS[t].desc}</small></div>`).join('') || '없음'}
    <button class="btn alt" id="years" style="width:100%;margin-top:10px">학년별 성장 돌아보기</button>
    <button class="btn alt" id="commands" style="width:100%;margin-top:8px">최근 주간 행동 기록</button>
    <button class="btn alt" id="mastery" style="width:100%;margin-top:10px">훈련 숙련도와 다음 레벨</button>
    <button class="btn alt" id="goals" style="width:100%;margin-top:10px">특수능력 성장 목표</button>
    <button class="btn alt" id="evhistory" style="width:100%;margin-top:8px">선택의 기록</button>
    <button class="btn alt" id="equipment" style="width:100%;margin-top:8px">내 장비와 유니폼</button><h2 style="margin-top:10px">기록</h2><div class="log">${P.log.slice(0, 8).map((x) => '· ' + x).join('<br>')}</div><br><button class="btn" style="width:100%" id="x">닫기</button></div></div>`));
  m.querySelector('#years').onclick = () => { m.remove(); yearHistoryModal(); };
  m.querySelector('#commands').onclick=()=>{m.remove();commandHistoryModal();};
  m.querySelector('#mastery').onclick = () => { m.remove(); masteryModal(); };
  m.querySelector('#draft').onclick = () => { m.remove(); draftModal(); };
  m.querySelector('#equipment').onclick = () => { m.remove(); equipmentModal(); };
  m.querySelector('#academic').onclick = () => { m.remove(); academicModal(); };
  m.querySelector('#selection').onclick = () => { m.remove(); selectionModal(); };
  m.querySelector('#matches').onclick = () => { m.remove(); matchHistoryModal(); };
  m.querySelector('#evhistory').onclick = () => { m.remove(); eventHistoryModal(); };
  m.querySelector('#goals').onclick = () => { m.remove(); goalsModal(); };
  m.querySelector('#x').onclick = () => m.remove();
}
function commandHistoryModal() {
  const names={...STAT_NAME,will:'의지',tough:'근성',cond:'컨디션',money:'용돈',study:'학업',...evName};
  const rows=P.commandHistory||[];
  const m=show($(`<div class="modal"><div class="panel"><h2>최근 주간 행동 기록</h2><p style="font-size:12px;color:#b5c6dd">최근 12회 · 명령 직후 변화만 기록합니다.<br>경기·주말 회복·이벤트는 제외합니다. 기록 전 행동은 복원하지 않습니다.</p><div id="commandlist" style="max-height:55vh;overflow:auto">${rows.map(r=>`<div style="background:#20375e;border-radius:10px;padding:12px;margin:8px 0"><small>${r.year}학년 ${r.month}월 ${r.wk}주</small><h3 style="margin:6px 0">${r.label}</h3><p style="font-size:12px">${r.messages.join('<br>')}</p><div class="chips">${Object.entries({...r.statFx,...r.fx}).filter(([,v])=>v).map(([k,v])=>`<span class="chip ${v>0?'up':'dn'}">${names[k]||k} ${v>0?'+':''}${v}</span>`).join('')||'<span class="chip">능력·상태 수치 변화 없음</span>'}</div></div>`).join('')||'<p>아직 기록된 주간 행동이 없습니다.</p>'}</div><button class="btn" id="backcommands" style="width:100%">상세 능력으로</button></div></div>`));
  m.querySelector('#backcommands').onclick=()=>{m.remove();detailModal();};
}
function masteryModal() {
  const m=show($(`<div class="modal"><div class="panel"><h2>훈련 숙련도</h2><p style="font-size:13px;color:#b5c6dd">같은 훈련을 반복하면 성장 계산의 숙련 배율이 올라갑니다. 실제 능력 상승량은 컨디션·특성·현재 능력·무작위에 따라 달라집니다.</p><div style="max-height:53vh;overflow:auto" id="masterylist">${practicesFor(P).map(pr=>{
    const t=G.trainingMastery(P,pr.id), start=t.level===1?0:t.level===2?7:16;
    return `<div data-training="${pr.id}" style="background:#20375e;border-radius:10px;padding:12px;margin:8px 0"><b>${pr.name} · Lv${t.level}</b><span style="float:right;color:#ffd23f">×${t.multiplier.toFixed(1)}</span><div class="bar" style="margin:8px 0"><i style="width:${t.next?100*(t.count-start)/(t.next-start):100}%;background:#66e692"></i></div><small>${t.count}회 완료 · ${t.next?`Lv${t.level+1}까지 ${t.remaining}회 (누적 ${t.next}회)`:'최고 레벨 도달'}</small></div>`;
  }).join('')}</div><p style="font-size:12px;color:#b5c6dd">완료 횟수는 정상 실행된 훈련만 셉니다. 입원·연습 금지로 실행하지 못한 주는 제외됩니다. 레벨 상승은 다음 훈련부터 적용됩니다. 리프레쉬는 회복·치료용이며 숙련 배율로 회복량이 늘지 않습니다.</p><button class="btn" id="backmastery" style="width:100%">상세 능력으로</button></div></div>`));
  m.querySelector('#backmastery').onclick=()=>{m.remove();detailModal();};
}
function draftModal() {
  const d=G.draftStatus(P), fmt=n=>(Math.floor(n*100+1e-8)/100).toFixed(2);
  const m=show($(`<div class="modal"><div class="panel"><h2>지명 목표와 현재 평가</h2><small style="color:#b5c6dd">지금 졸업한다면 · 확정 결과 아님</small><div style="background:#20375e;padding:12px;border-radius:10px;margin:10px 0"><b>${d.band}</b><div style="font-size:28px;font-weight:900;margin:8px 0">${fmt(d.score)} / ${d.need}</div><div class="bar"><i style="width:${Math.min(100,d.score/d.need*100)}%;background:#ffd23f"></i></div><small>${d.shortfall?`최소 지명 기준까지 ${(Math.ceil(d.shortfall*100-1e-8)/100).toFixed(2)} 필요`:'최소 지명 기준 도달'}</small></div><table class="mini">${d.parts.map(([name,value])=>`<tr><td>${name}</td><td style="text-align:right">${fmt(value)}점</td></tr>`).join('')}</table><p style="font-size:12px;color:#b5c6dd">표시 점수는 소수 셋째 자리 이하는 버립니다.<br>기준: 54 하위 라운드 · 64 지명 · 74 상위 · 82 1순위. 졸업 시점의 실제 수치로 정해지며 구단과 일부 순위는 무작위입니다.<br>현재 규칙은 투수도 같은 항목을 씁니다. 능력·특능·경기·평가 선택으로 전망이 달라집니다.</p><button class="btn" id="backdraft" style="width:100%">상세 능력으로</button></div></div>`));
  m.querySelector('#backdraft').onclick=()=>{m.remove();detailModal();};
}

function equipmentModal() {
  const gear = P.gear || {}, year = Math.min(3, G.cal(P.week).year);
  const equipment = [
    ...(P.pos === 'pit' ? [] : [{ id:'bat', label:'배트', owned:'새 배트 · 금색', base:'기본 배트 · 나무색', color:gear.bat?'#f2c94c':'#deb887' }]),
    { id:'glove', label:'글러브', owned:'새 글러브 · 금색', base:'기본 글러브 · 갈색', color:gear.glove?'#f2c94c':'#7b4a1e' },
    { id:'shoes', label:'신발', owned:'러닝화 · 빨간색', base:'기본 신발 · 검은색', color:gear.shoes?'#e53935':'#222222' }
  ];
  const m=show($(`<div class="modal"><div class="panel"><h2>내 장비와 유니폼</h2><div style="padding:12px;background:#20375e;border-radius:10px;margin-bottom:10px"><b>${year}학년 유니폼 · 현재</b><small style="display:block;margin:6px 0;color:#b5c6dd">학년이 올라가면 자동으로 바뀝니다.</small><div style="display:flex;gap:6px">${UNIFORMS.map((color,i)=>`<div style="flex:1;text-align:center;padding:7px 3px;border-radius:7px;background:#142a44;border:1px solid ${i+1===year?'#ffd23f':'#ffffff22'}"><svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true"><path d="M15 10L4 17L10 27L15 24V42H33V24L38 27L44 17L33 10L28 14H20Z" fill="#${color.toString(16).padStart(6,'0')}" stroke="#ffffff88"/><path d="M20 15L24 19L28 15M24 19V40" fill="none" stroke="#ffffff88"/><text x="27" y="30" fill="white" font-size="9" font-weight="bold">9</text></svg><small style="display:block">${i+1}학년${i+1===year?' · 현재':''}</small></div>`).join('')}</div><small style="display:block;margin-top:7px;color:#b5c6dd">셔츠와 같은 계열의 모자·헬멧 적용</small></div>${equipment.map(e=>`<div style="padding:12px;background:#20375e;border-radius:10px;margin-bottom:8px"><small>${e.label} · ${gear[e.id]?'구입 장비 적용 중':'기본 장비 사용 중'}</small><div style="margin-top:5px"><span style="display:inline-block;width:14px;height:14px;border:1px solid #ffffff66;border-radius:50%;background:${e.color};margin-right:8px"></span><b>${gear[e.id]?e.owned:e.base}</b></div></div>`).join('')}<p style="font-size:12px;color:#b5c6dd">구입한 장비 외형은 자동 적용됩니다. 타격·투구·주루 등 장면에 따라 보이는 장비는 다릅니다.<br>구매 때 오른 능력치는 현재 능력에 포함돼 있습니다. 이 화면을 열어도 추가로 오르지 않습니다.</p><button class="btn" id="backequipment" style="width:100%">상세 능력으로</button></div></div>`));
  m.querySelector('#backequipment').onclick=()=>{m.remove();detailModal();};
}

function academicModal() {
  const s = G.academicStatus(P), c = s.nextWeek == null ? null : G.cal(s.nextWeek);
  const m = show($(`<div class="modal"><div class="panel"><h2>학업과 다음 시험</h2><div class="chip ${s.banned?'dn':'up'}">${s.banned?`연습 금지 ${s.banned}주`:'현재 연습 가능'}</div>${c?`<p>${c.year}학년 ${c.month}월 ${c.wk}주 · ${s.remaining}주 진행 뒤 시험</p><div style="background:#20375e;padding:14px;border-radius:10px"><b>현재 학업 / 통과 기준</b><div style="font-size:28px;font-weight:900;margin:8px 0">${s.study} / ${s.need}</div><div class="bar"><i style="width:${Math.min(100,s.study/s.need*100)}%;background:${s.study>=s.need?'#69db93':'#ffd23f'}"></i></div><p style="margin-bottom:0">${s.study>=s.need?'현재 수치면 통과 가능':`현재 기준 ${s.need-s.study} 부족`}</p></div><p>공부 명령이나 이벤트로 학업을 올릴 수 있습니다. 시험 전 이벤트 선택으로 수치가 달라질 수 있습니다.</p>`:'<p>졸업 전 남은 시험이 없습니다.</p>'}<p style="font-size:13px;color:#b5c6dd">시험에 미달하면 연습 금지 3주와 감독 평가 -5. 통과 여부와 관계없이 시험 후 학업은 12 줄어듭니다. 금지 중에도 공부·휴식·리프레쉬는 가능합니다.</p><button class="btn" id="backacademic" style="width:100%">상세 능력으로</button></div></div>`));
  m.querySelector('#backacademic').onclick=()=>{m.remove();detailModal();};
}
function selectionModal() {
  const s = G.selectionStatus(P);
  const row = (name, value, need) => `<div style="background:#20375e;padding:12px;border-radius:10px;margin:10px 0"><b>${name}</b><div style="font-size:22px;font-weight:900;margin:6px 0">${value.toFixed(1)} / ${need}</div><div class="bar"><i style="width:${Math.min(100,value/need*100)}%;background:#69db93"></i></div><small>${value >= need ? '조건 달성' : `앞으로 ${(need-value).toFixed(1)} 필요`}</small></div>`;
  const m = show($(`<div class="modal"><div class="panel"><h2>출전 기회와 신뢰</h2><div class="chip ${s.regular ? 'up' : 'dn'}">현재 ${s.regular ? '레귤러' : '후보'}</div><p>두 조건 중 하나를 채우면 레귤러로 출전합니다. 기준은 학년이 올라가면 높아집니다.</p>${row('실력으로 인정받기 · 종합',s.overall,s.overallNeed)}${row('신뢰로 인정받기 · 평가 평균',s.trust,s.trustNeed)}<div style="max-height:18vh;overflow:auto"><table class="mini" style="width:100%"><tr><th>학년</th><th>종합</th><th>신뢰 평균</th></tr>${[1,2,3].map(y=>{const r=G.selectionRequirements(y);return `<tr style="color:${y===G.cal(P.week).year?'#ffd23f':'#b5c6dd'}"><td>${y}학년${y===G.cal(P.week).year?' · 현재':''}</td><td>${r.overallNeed}</td><td>${r.trustNeed}</td></tr>`}).join('')}</table></div><small style="color:#b5c6dd">각 학년에서도 두 기준 중 하나만 충족하면 됩니다.<br>진급 뒤에는 새 기준으로 다시 판단합니다.</small><p style="font-size:13px;color:#b5c6dd">신뢰는 감독·캡틴·팀메이트 평가의 평균입니다. 훈련·경기·이벤트 선택으로 달라집니다. 스카우트 평가는 출전 조건에 포함되지 않습니다.</p><button class="btn" id="backselection" style="width:100%">상세 능력으로</button></div></div>`));
  m.querySelector('#backselection').onclick = () => { m.remove(); detailModal(); };
}

function matchGrowthHtml(r) {
  if(!r.growthDelta)return '<small style="display:block;color:#b5c6dd;margin-top:8px">당시 평가·컨디션 변화 미저장</small>';
  const names={...evName,cond:'컨디션'},entries=Object.entries(r.growthDelta).filter(([,v])=>v);
  return `<small style="display:block;color:#b5c6dd;margin-top:10px">경기 직후 변화 · 훈련/주말 회복/이벤트 제외</small><div class="chips" style="margin-top:6px">${entries.map(([k,v])=>`<span class="chip ${v>0?'up':'dn'}">${names[k]} ${v>0?'+':''}${v}</span>`).join('')||'<span class="chip">변화 없음</span>'}</div>`;
}
function tiebreakHtml(r){
 if(!r.automaticTiebreak||!r.playedScore)return '';
 const pitcher=typeof r.ip==='number';
 return `<p class="tiebreak-note" style="font-size:12px;line-height:1.6;color:#ffd23f;word-break:keep-all">${pitcher?'직접 투구':'정규 진행'} 종료 ${r.playedScore.my} : ${r.playedScore.opp}${pitcher?` · ${r.playedScore.opp}실점`:''}<br>동점 추가 승부는 자동 결정했습니다. 최종 점수${pitcher&&!r.win?'와 실점 기록':''}에 결정 1점이 포함됩니다. 추가 이닝 직접 플레이는 없습니다.</p>`;
}
function matchHistoryModal(all = false) {
  const history=P.matchHistory||[],rows=all?history:history.slice(0,8);
  const m = show($(`<div class="modal"><div class="panel"><h2>최근 경기 기록</h2><p style="font-size:13px;color:#b5c6dd">${all?`저장된 전체 ${history.length}경기`:`최근 8경기 중 ${rows.length}경기 표시`} · 최신순</p><button class="btn alt" id="matchview" style="width:100%;margin-bottom:8px">${all?'최근 8경기만 보기':`저장된 전체 보기 (${history.length}경기)`}</button><small style="display:block;color:#b5c6dd">최근 20경기까지 보존됩니다. 이전 누락 기록은 복원하지 않습니다.</small><div id="matchlist" style="max-height:47vh;overflow:auto">${rows.map(r => `<div style="background:#20375e;border-radius:10px;padding:12px;margin-bottom:8px"><small>${r.year}학년 ${r.month}월 ${r.wk}주 · ${r.title}</small><div style="font-size:22px;font-weight:900;color:${r.win ? '#7aeb99' : '#ff9c9c'};margin:6px 0">${r.win ? '승리' : '패배'} ${r.my} : ${r.opp}</div><div>${r.pos === 'pit' ? `${r.ip}이닝 ${r.so}탈삼진 ${r.hitsAllowed}피안타 ${r.er}실점` : `${r.ab}타수 ${r.hits}안타 ${r.hr}홈런 ${r.rbi}타점`}</div>${tiebreakHtml(r)}${matchGrowthHtml(r)}</div>`).join('') || '<p>아직 기록된 경기가 없습니다.</p>'}</div><button class="btn" id="backmatches" style="width:100%;margin-top:10px">상세 능력으로</button></div></div>`));
  m.querySelector('#matchview').onclick=()=>{m.remove();matchHistoryModal(!all);};
  m.querySelector('#backmatches').onclick = () => { m.remove(); detailModal(); };
}

function eventOriginHtml(origin) {
  return origin ? `<div style="padding:10px;background:#142a44;border-left:3px solid #ffd23f;border-radius:6px;margin:10px 0;font-size:12px;color:#b5c6dd">이전 이야기 · ${origin.title}${origin.choice ? `<br><span style="color:#ffd23f">그때의 선택: ${origin.choice}</span>` : ''}<br>그 경험에서 이어진 이야기입니다.</div>` : '';
}

function eventOutcomeHtml(e) {
  return `<div class="chips" style="margin:8px 0"><span class="chip ${e.success===true?'up':e.success===false?'dn':''}">${e.success===true?'성공':e.success===false?'실패':'결과 미저장'}</span><span class="chip">${Number.isFinite(e.chance)?`선택 당시 성공률 ${e.chance}%`:'당시 성공률 미저장'}</span></div>`;
}
function eventValuesHtml(e) {
  const names={...STAT_NAME,will:'의지',tough:'근성',cond:'컨디션',money:'용돈',study:'학업',...evName};
  const values=Object.entries(e.values||{}).filter(([,v])=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite)&&v[0]!==v[1]);
  return values.length ? `<div style="margin-top:8px;padding:8px;background:#142a44;border-radius:6px;font-size:12px;color:#b5c6dd">선택 직전 → 직후${values.map(([k,v])=>`<div style="display:flex;justify-content:space-between;margin-top:4px"><span>${names[k]||k}</span><b>${v[0]} → ${v[1]}</b></div>`).join('')}</div>` : '';
}
function eventHistoryModal(all = false) {
  const names = {...STAT_NAME, will:'의지', tough:'근성', cond:'컨디션', money:'용돈', study:'학업', ...evName};
  const history=P.eventHistory||[], rows=all?history:history.slice(0,12);
  const m=show($(`<div class="modal"><div class="panel"><h2>선택의 기록</h2><small>${all?`저장된 전체 ${history.length}개`:`최근 12개 중 ${rows.length}개 표시`} · 최신순</small><button class="btn alt" id="historyview" style="width:100%;margin-top:8px">${all?'최근 12개만 보기':`저장된 전체 보기 (${history.length}개)`}</button><small style="display:block;margin-top:8px;color:#b5c6dd">최근 30개까지 보존됩니다. 그보다 오래되거나 기록 전의 선택은 복원하지 않습니다.</small><div id="historylist" style="max-height:48vh;overflow:auto;margin:12px 0">${rows.map(e=>`<div style="background:#20375e;border-radius:10px;padding:10px;margin-bottom:8px"><small>${e.year}학년 ${e.month}월 ${e.wk}주</small><div><b>${e.title}</b></div>${eventOutcomeHtml(e)}${eventOriginHtml(e.origin)}<p style="margin:6px 0;color:#ffd23f">${e.choice}</p><small>${e.msg}</small><div class="chips">${Object.entries(e.fx || {}).filter(([,v])=>v).map(([k,v])=>`<span class="chip ${v>0?'up':'dn'}">${names[k]||k} ${v>0?'+':''}${v}</span>`).join('')||'<span class="chip">능력·상태 수치 변화 없음</span>'}</div>${eventValuesHtml(e)}</div>`).join('')||'<p>아직 기록된 선택이 없습니다.<br>이벤트를 겪으면 선택과 결과가 남습니다.</p>'}</div><button class="btn" id="backhistory" style="width:100%">상세 능력으로</button></div></div>`));
  m.querySelector('#historyview').onclick=()=>{m.remove();eventHistoryModal(!all);};
  m.querySelector('#backhistory').onclick=()=>{m.remove();detailModal();};
}
function goalsModal(all = false) {
  const names = { ...STAT_NAME, will: '의지', 'cnt.bat': '배팅연습', 'cnt.power': '파워훈련', 'cnt.run': '주루연습', 'cnt.arm': '송구연습', 'cnt.defense': '수비연습', 'cnt.mental': '멘탈훈련', 'cnt.velo': '구속훈련', 'cnt.ctrl': '제구훈련', 'cnt.brk': '변화구훈련' };
  const available = traitGoals(P), goals = all ? available : available.slice(0,3);
  const m = show($(`<div class="modal"><div class="panel"><h2>다음 성장 목표</h2><p style="font-size:13px">${all ? `미습득 특수능력 전체 ${available.length}개` : '가장 가까운 미습득 특수능력 3개'}<br>조건을 채우면 주간 명령 후 각각 35% 확률로 습득합니다.</p><button class="btn alt" id="goalview" style="width:100%;margin-bottom:8px">${all ? '가까운 목표만 보기' : `전체 목표 보기 (${available.length}개)`}</button><div style="max-height:52vh;overflow:auto" id="goallist">${goals.map(({id,req,progress})=>`<div style="margin:12px 0;padding:10px;background:#20375e;border-radius:10px"><b>${TRAITS[id].name}</b><small style="display:block;margin:4px 0">${TRAITS[id].desc}</small><div class="bar"><i style="width:${Math.round(progress*100)}%;background:#ffd23f"></i></div>${req.map(([k,n])=>`<small style="display:block;color:${requirementValue(P,k)>=n?'#8ce99a':'#fff'}">${names[k]||k} ${requirementValue(P,k)}/${n}${k.startsWith('cnt.')?'회':''}${requirementValue(P,k)>=n?' · 달성':''}</small>`).join('')}</div>`).join('')||'<p>모든 성장 목표를 달성했습니다.</p>'}</div><button class="btn" id="backgoal" style="width:100%">상세 능력으로</button></div></div>`));
  m.querySelector('#goalview').onclick=()=>{m.remove();goalsModal(!all);};
  m.querySelector('#backgoal').onclick=()=>{m.remove();detailModal();};
}
function menuModal() {
  const m = show($(`<div class="modal"><div class="panel"><h2>메뉴</h2><div style="display:grid;gap:8px"><button class="btn" id="x">계속하기</button><button class="btn alt" id="t">타이틀로</button><button class="btn warn" id="r">이 선수 포기하고 초기화</button></div></div></div>`));
  m.querySelector('#x').onclick = () => m.remove();
  m.querySelector('#t').onclick = () => { G.save(P); titleScreen(); };
  m.querySelector('#r').onclick = () => { if (prompt('정말 삭제합니까? "초기화"를 입력하세요') === '초기화') { G.clearSave(); titleScreen(); } };
}
function purchaseReportHtml() {
  const r = P.purchaseReport; if (!r) return '';
  const names = { ...STAT_NAME, cond: '컨디션', money: '용돈' };
  return `<div class="chips" style="margin:6px 0 10px">${Object.entries(r.fx).map(([k,v])=>`<span class="chip ${v>0?'up':'dn'}">${names[k]} ${v>0?'+':''}${v}</span>`).join('')}${r.cured.map(t=>`<span class="chip up">${TRAITS[t].name} 치료</span>`).join('')}${r.insured?'<span class="chip up">다음 부상 보험 적용</span>':''}${r.gear?'<span class="chip up">장비 적용</span>':''}</div>`;
}
function purchasePreviewHtml(id) {
  const r=G.purchasePreview(P,id),names={...STAT_NAME,cond:'컨디션',money:'용돈'};
  const chips=Object.entries(r.fx).filter(([k])=>k!=='money').map(([k,v])=>`${names[k]} ${v>0?'+':''}${v}`);
  if(r.cured.length)chips.push(...r.cured.map(t=>`${TRAITS[t].name} 치료`));
  if(r.insured)chips.push(r.repeat?'보험 이미 적용 중 · 중첩되지 않음':'다음 부상 입원 기간 반감');
  if(!chips.length)chips.push('현재 능력·상태 변화 없음');
  return `<small style="display:block;color:#b9efcd;margin-top:5px">구매 직후: ${chips.join(' · ')}</small>${r.repeat&&!r.insured?'<small style="display:block;color:#ffd23f">이미 보유 · 다시 사도 외형은 그대로</small>':''}${!r.affordable?'<small style="display:block;color:#ffb58f">현재 용돈 부족</small>':''}`;
}
function shopModal() {
  const draw = (note) => {
    const m = show($(`<div class="modal"><div class="panel"><h2> 쇼핑 (${ic('coin')} ${P.money})</h2>${note ? `<div class="log" style="color:#ffd23f">${note}</div>${purchaseReportHtml()}` : ''}<div style="display:grid;gap:6px;max-height:56vh;overflow:auto">${itemsFor(P).map((i) => `<button class="btn alt" data-i="${i.id}" style="text-align:left;display:flex;justify-content:space-between"><span>${i.name}<br><small>${itemDescription(P, i)}</small>${purchasePreviewHtml(i.id)}</span><span>${i.price}</span></button>`).join('')}</div><div class="row" style="margin-top:8px"><button class="btn gray" id="x">그만 사기</button><button class="btn" id="end" style="font-size:14px">${P.injury ? '쇼핑 끝 · 한 주 치료' : '쇼핑 끝 (한 주 소비)'}</button></div></div></div>`));
    m.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { const r = G.buy(P, b.dataset.i); G.save(P); m.remove(); draw(r); });
    m.querySelector('#x').onclick = () => { m.remove(); G.save(P); homeScreen(); };
    m.querySelector('#end').onclick = () => { m.remove(); runWeek('shop'); };
  }; draw();
}

function runWeek(id) {
  const previousTraits = new Set(P.traits);
  let msgs = G.doCommand(P, id === 'hospital' ? 'x' : id);
  const m = G.matchOfWeek(P);
  playTrainingAnim(id);
  sfx.ui();
  if (m && !P.injury) matchPrompt(m, msgs, previousTraits, () => finishWeek(msgs, previousTraits)); else finishWeek(msgs, previousTraits);
}

function finishWeek(msgs, previousTraits) {
  P.pendingResult = null;
    const e = G.endWeek(P); msgs = msgs.concat(e); G.save(P);
    const learned = P.traits.filter(t => !previousTraits.has(t) && TRAITS[t]?.good);
    if (!learned.length) return afterWeekEvent(msgs);
    P.pendingLearned = { learned, msgs }; G.save(P); sfx.good(); learnedModal(P.pendingLearned);
}

function learnedModal(q) {
  const { learned, msgs } = q;
  const m = show($(`<div class="modal"><div class="panel"><h2 style="color:#ffd23f">특수능력 습득!</h2><p>꾸준한 훈련이 새로운 강점이 됐다.</p><div style="max-height:50vh;overflow:auto">${learned.map(t=>`<div style="padding:14px;background:#20375e;border-radius:10px;margin:8px 0"><b style="font-size:22px;color:#ffd23f">${TRAITS[t].name}</b><p style="margin:6px 0 0">${TRAITS[t].desc}</p></div>`).join('')}</div><p style="font-size:12px;color:#b5c6dd">능력은 이미 적용됐습니다.<br>확인 전 재접속해도 이 알림을 이어서 봅니다.</p><button class="btn" id="oklearned" style="width:100%;margin-top:10px">계속</button></div></div>`));
  m.querySelector('#oklearned').onclick=()=>{P.pendingLearned=null;G.save(P);m.remove();afterWeekEvent(msgs);};
}

function afterWeekEvent(msgs) {
  if (P.done) { G.save(P); return homeScreen(); }
  if (P.review) return yearReviewModal(msgs);
  const ev = G.randomEvent(P);
  if (!ev) return homeScreen(msgs);
  P.pendingEvent = { ev, msgs }; G.save(P);
  eventChoiceModal(P.pendingEvent);
}

function yearHistoryModal(fromEnding = false, archive = null) {
  const names={...STAT_NAME,will:'의지',tough:'근성'},current=P?G.currentYearGrowth(P):null,rows=archive||[...(P.finalYearReview?[P.finalYearReview]:[]),...(current&&!P.done?[{...current,current:true}]:[]),...(P.yearHistory||[])];
  const m=show($(`<div class="modal"><div class="panel"><h2>학년별 성장 돌아보기</h2><p style="font-size:13px;color:#b5c6dd">진행 중인 학년과 저장된 학년별 결산입니다. 기록이 없는 과거 학년은 추정하지 않습니다.</p><div style="max-height:56vh;overflow:auto">${rows.map(r=>`<div style="background:#20375e;padding:14px;border-radius:10px;margin:10px 0"><b>${r.year}학년 ${r.current?'진행 중':'결산'}</b><p>종합 ${r.prevOvr} → ${r.ovr}</p><small>${r.year===1?'입학 때':'전 학년 결산 때'}와 비교</small><div class="chips" style="margin-top:8px">${r.diffs.filter(([,v])=>v).map(([k,v])=>`<span class="chip ${v>0?'up':'dn'}">${names[k]} ${v>0?'+':''}${v}</span>`).join('')||'<span class="chip">능력 수치 변화 없음</span>'}</div></div>`).join('')||'<p>아직 저장된 학년 결산이 없습니다.<br>기존 저장에서 누락된 결산은 추정하지 않습니다.</p>'}</div><button class="btn" id="backyears" style="width:100%">${archive?'명예의 전당으로':fromEnding?'졸업 결과로':'상세 능력으로'}</button></div></div>`));
  m.querySelector('#backyears').onclick=()=>{m.remove();if(archive)hofScreen();else if(!fromEnding)detailModal();};
}
function yearReviewModal(msgs) {
  const rv = P.review; rv.msgs = msgs; G.save(P);
  const NM = { ...STAT_NAME, will: '의지', tough: '근성' };
  const chips = rv.diffs.filter(([,d]) => d).map(([k,d]) => `<span class="chip ${d>0?'up':'dn'}">${NM[k]||k} ${d>0?'+':''}${d}</span>`).join('') || '<span class="chip">능력 수치 변화 없음</span>';
  const rmod = show($(`<div class="modal"><div class="panel"><h2>${rv.year}학년 결산</h2><p>종합 ${rv.ovr}${rv.prevOvr!=null?` (${rv.year===1?'입학':'전 학년'} ${rv.prevOvr}, ${rv.ovr-rv.prevOvr>=0?'+':''}${rv.ovr-rv.prevOvr})`:''}</p><div class="chips">${chips}</div><p style="font-size:13px;color:#b5c6dd">${rv.year===1?'입학 때':'지난 학년 결산 때'}와 비교한 성장입니다.<br>확인 전 재접속해도 이 결산을 이어서 봅니다.</p><button class="btn" id="okrv" style="margin-top:12px;width:100%">다음 학년으로</button></div></div>`));
  rmod.querySelector('#okrv').onclick = () => { P.review = null; G.save(P); rmod.remove(); sfx.ui(); afterWeekEvent(msgs); };
}

function eventPreviewHtml(choice) {
  const p=G.eventEffectPreview(P,choice),names={...STAT_NAME,...evName,cond:'컨디션',will:'의지',tough:'근성',study:'학업',money:'용돈'};
  const row=(label,fx)=>`<span style="display:block;font-size:11px;line-height:1.5;color:#cbd9ea;margin-top:5px">${label}: ${Object.entries(fx).map(([k,v])=>`${names[k]||k} ${v>0?'+':''}${v}`).join(' · ')||'수치 변화 없음'}</span>`;
  return row('성공',p.success)+(p.failure?row('실패',p.failure):'');
}

function eventChoiceModal(q) {
  const { ev, msgs } = q;
  const mod = show($(`<div class="modal"><div class="panel"><h2>${ev.title}</h2>${eventOriginHtml(G.eventOrigin(P, ev))}<p>${ev.text}</p><div style="display:grid;gap:8px">${ev.choices.map((c, i) => `<button class="btn alt" data-c="${i}">${c.label} <small>(성공률 ${c.chance}%)</small>${eventPreviewHtml(c)}</button>`).join('')}</div><small style="display:block;margin-top:10px;color:#b5c6dd;font-size:11px">현재 수치와 상한·하한을 반영한 예상 변화입니다.</small></div></div>`));
  mod.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { const r = G.resolveEvent(P, ev, +b.dataset.c); mod.remove(); sfx.ui();
    P.pendingEvent = null;
    P.pendingEventResult = { title: ev.title, choice: ev.choices[+b.dataset.c].label, result: r, msgs };
    G.save(P); eventResultModal(P.pendingEventResult); });
}

function eventResultModal(q) {
  const r = q.result;
  const NM = { ...STAT_NAME, cond: '컨디션', will: '의지', money: '용돈', coach: '감독평가', captain: '캡틴평가', team: '팀평가', scout: '스카우트', study: '학업', tough: '근성' };
  const chips = Object.entries(r.fx).filter(([k,v]) => typeof v === 'number' && v).map(([k,v]) => `<span class="chip ${v>0?'up':'dn'}">${NM[k]||k} ${v>0?'+':''}${v}</span>`).join('');
  const rm = show($(`<div class="modal"><div class="panel"><small style="color:#b5c6dd">이벤트 결과 · ${q.title}</small>${eventOriginHtml(r.origin)}<h2 style="color:${r.success?'#8ce99a':'#ffb58f'}">${r.success?'성공!':'아쉽다...'}</h2>${Number.isFinite(r.chance)?`<small style="display:block;color:#b5c6dd;margin-bottom:10px">선택 당시 성공률 ${r.chance}% · 이미 확정된 결과</small>`:''}<div style="padding:10px;background:#20375e;border-radius:10px;color:#ffd23f">선택: ${q.choice}</div><p>${r.msg}</p><small style="display:block;margin-bottom:8px;color:#b5c6dd">이번 선택의 실제 변화 · 상한/하한 반영</small><div class="chips">${chips||'<span class="chip">능력·상태 수치 변화 없음</span>'}</div>${eventValuesHtml(r)}<p style="font-size:12px;color:#b5c6dd">상세 능력의 선택의 기록에서 다시 볼 수 있습니다.</p><button class="btn" id="okev" style="margin-top:12px;width:100%">확인</button></div></div>`));
  rm.querySelector('#okev').onclick = () => { P.pendingEventResult = null; G.save(P); rm.remove(); homeScreen(q.msgs.concat([`[이벤트] ${r.msg}`])); };
}

function matchPrompt(m, msgs, previousTraits, cont) {
  if (!P.pendingMatch) P.pendingMatch = { match: m, msgs, previousTraits: [...previousTraits], before: { ...P.ev, cond: P.cond }, started: false };
  G.save(P);
  const q = P.pendingMatch;
  const before = q.before;
  const report = (r) => {
    r.growthDelta = Object.fromEntries([...Object.keys(P.ev), 'cond'].map(k => [k, (k === 'cond' ? P.cond : P.ev[k]) - before[k]]));
    P.pendingMatch = null;
    P.pendingResult = { result: r, msgs, previousTraits: [...previousTraits] };
    G.save(P);
    resultModal(r, msgs, cont);
  };
  const mod = show($(`<div class="modal"><div class="panel"><h2>${ic('ball')} ${m.name}</h2><p class="match-copy">${P.pos === 'pit' ? (G.isRegular(P) ? '선발로 등판합니다. 3이닝을 직접 던집니다.' : '아직 후보입니다. 구원으로 1이닝만 던집니다.') : (G.isRegular(P) ? '레귤러로 출전합니다. 타석 3번을 직접 칠 수 있어요.' : '아직 후보입니다. 대타로 1타석만 기회가 옵니다.')}</p><p class="match-copy" style="font-size:12px;color:#b5c6dd">${q.started ? '중단된 경기를 경기 시작 전부터 다시 진행합니다.<br>중단 전 투구·타석·점수는 복구되지 않습니다.' : '선택 전 재접속해도 같은 경기를 이어서 선택합니다.'}<br>이번 주 훈련은 다시 적용되지 않습니다.</p><div style="display:grid;gap:8px"><button class="btn big" id="play">직접 플레이</button><button class="btn gray" id="auto">자동 진행</button></div></div></div>`));
  mod.querySelector('#auto').onclick = () => { mod.remove(); const r = G.simulateMatch(P, m); report(r); };
  mod.querySelector('#play').onclick = async () => { q.started = true; G.save(P); mod.remove(); const r = await startMatch(m); report(r); };
}

async function startMatch(m) {
  clear();
  const hud = $(`<div class="screen" style="padding:6px 10px"><div class="scoreb"><span id="t" style="font-size:13px"></span><span id="sc">0 : 0</span></div><div class="top"><div class="dots" id="cnt"></div><div class="chip" id="pi"></div></div></div>`);
  show(hud); const bn = $(`<div></div>`); ui.appendChild(bn);
  const sw = $(`<button class="swing">SWING</button>`); show(sw);
  const timing = $(`<div id="timingguide" style="position:absolute;left:14px;bottom:145px;width:100px;text-align:center;pointer-events:none;display:none"><svg viewBox="0 0 100 100" style="width:86px;height:86px;overflow:visible"><circle cx="50" cy="50" r="25" fill="#102039cc" stroke="#ffffff66" stroke-width="3"/><circle id="timingring" cx="50" cy="50" r="43" fill="none" stroke="#ffd23f" stroke-width="5"/><text id="timingword" x="50" y="55" text-anchor="middle" fill="white" font-size="15" font-weight="900">준비</text></svg><div style="color:white;font-size:12px;font-weight:900;text-shadow:0 2px 2px #000">원이 겹칠 때 SWING</div></div>`); show(timing);
  const battingHint = show($(`<div class="hint">화면을 드래그해 노란 링을 공 위치에 맞추고, 공이 홈플레이트에 닿을 때 SWING!<br><small>타격 보조: 타이밍·조준이 조금 빗나가도 맞힐 수 있어요.</small></div>`));
  let swFn = null;
  const act = (e) => { e.preventDefault(); if (swFn) swFn(); }; sw.addEventListener('pointerdown', act);
  const api = {
    setBattingActive: (active) => {
      sw.style.display = active ? '' : 'none'; sw.disabled = !active;
      battingHint.style.display = active ? '' : 'none';
      if (!active) api.setTiming(null);
    },
    setTiming: (progress, target, ready) => {
      if (progress == null) { timing.style.display = 'none'; sw.style.boxShadow = ''; sw.textContent = 'SWING'; return; }
      timing.style.display = 'block';
      const near = Math.abs(progress - target) <= ready;
      timing.querySelector('#timingring').setAttribute('r', String(Math.max(12, 25 + (target - progress) * 30)));
      timing.querySelector('#timingring').setAttribute('stroke', near ? '#66f593' : '#ffd23f');
      timing.querySelector('#timingword').textContent = near ? '지금!' : progress > target ? '늦음' : '준비';
      sw.style.boxShadow = near ? '0 0 0 4px #66f593,0 0 24px #66f593aa' : '';
      sw.textContent = near ? '지금!' : 'SWING';
    },
    setTitle: (t) => hud.querySelector('#t').textContent = t,
    setScore: (i, a, b) => hud.querySelector('#sc').textContent = `${i}회  ${a} : ${b}`,
    setCount: (c) => hud.querySelector('#cnt').innerHTML = `B ${[0, 1, 2, 3].map((i) => `<span class="dot b ${i < c.b ? 'on' : ''}"></span>`).join('')} S ${[0, 1, 2].map((i) => `<span class="dot s ${i < c.s ? 'on' : ''}"></span>`).join('')}`,
    setPitch: (t) => hud.querySelector('#pi').textContent = t,
    flash: () => { const f = $(`<div style="position:absolute;inset:0;background:#fff;opacity:.55;pointer-events:none;transition:opacity .25s"></div>`); ui.appendChild(f); requestAnimationFrame(() => f.style.opacity = 0); setTimeout(() => f.remove(), 300); },
    small: (t) => { const e = $(`<div style="position:absolute;left:0;right:0;top:24%;text-align:center;font-size:22px;font-weight:900;color:#ffd23f;text-shadow:0 2px 0 #000;pointer-events:none">${t}</div>`); ui.appendChild(e); setTimeout(() => e.remove(), 900); },
    banner: (t, ms) => { bn.innerHTML = `<div class="banner">${t}</div>`; clearTimeout(api._t); api._t = setTimeout(() => bn.innerHTML = '', ms); },
    onSwing: (f) => { swFn = f; }, offSwing: () => { swFn = null; },
  };
  api.setBattingContext = (context) => {
    let row=hud.querySelector('#battingcontext');
    if(!context){row?.remove();return;}
    if(!row){row=$('<div id="battingcontext" style="display:table;margin-top:3px;padding:4px 8px;background:#102039dd;border-radius:8px;font-size:11px;font-weight:900;color:#c4d2e4"></div>');hud.appendChild(row);}
    row.textContent=context.runner?(context.clutch?'주자 있음 · 찬스 효과 적용':'주자 있음'):'주자 없음';
    row.style.color=context.clutch?'#ffd23f':'#c4d2e4';
  };
  api.setBases = (mask) => {
    let row=hud.querySelector('#bases');if(!row){row=$('<div id="bases" style="display:flex;gap:5px;width:max-content;margin-top:3px;padding:4px 7px;background:#102039dd;border-radius:8px;font-size:11px;font-weight:900"></div>');hud.appendChild(row);}
    row.setAttribute('aria-label',`주자: ${[1,2,3].filter(b=>mask&(1<<(b-1))).map(b=>b+'루').join(', ')||'없음'}`);
    row.innerHTML=[1,2,3].map(b=>`<span data-base="${b}" data-occupied="${!!(mask&(1<<(b-1)))}" style="padding:2px 5px;border:1px solid ${mask&(1<<(b-1))?'#ffd23f':'#687991'};border-radius:4px;background:${mask&(1<<(b-1))?'#ffd23f':'transparent'};color:${mask&(1<<(b-1))?'#102039':'#c4d2e4'}">${b}루</span>`).join('');
  };
  api.setCount = (c, outs) => hud.querySelector('#cnt').innerHTML = `B ${[0, 1, 2, 3].map((i) => `<span class="dot b ${i < c.b ? 'on' : ''}"></span>`).join('')} S ${[0, 1, 2].map((i) => `<span class="dot s ${i < c.s ? 'on' : ''}"></span>`).join('')}${outs != null ? ` O ${[0, 1, 2].map((i) => `<span class="dot s ${i < outs ? 'on' : ''}" style="background:${i < outs ? '#e5484d' : ''}"></span>`).join('')}` : ''}`;
  if (P.pos === 'pit') {
    sw.remove(); ui.querySelectorAll('.hint').forEach((h) => h.remove());
    let picker = null;
    api.pitchPicker = (types, onSel, onThrow) => {
      picker = $(`<div style="position:absolute;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));display:flex;gap:6px;align-items:stretch"><div id="pt" style="display:flex;gap:6px;flex:1;flex-wrap:wrap"></div><button class="btn warn" id="throw" style="flex:0 0 120px;font-size:20px">던지기</button></div>`);
      const box = picker.querySelector('#pt'); const mk = () => { box.innerHTML = types.map((t, i) => `<button class="btn alt" data-t="${t.id}" style="flex:1 1 40%;padding:10px 4px;font-size:14px;${i === 0 ? 'outline:3px solid #ffd23f' : ''}">${t.n}</button>`).join(''); box.querySelectorAll('button').forEach((b) => b.onclick = () => { onSel(b.dataset.t); box.querySelectorAll('button').forEach((x) => x.style.outline = x === b ? '3px solid #ffd23f' : ''); }); }; mk();
      picker.querySelector('#throw').addEventListener('pointerdown', (e) => { e.preventDefault(); onThrow(); }); ui.appendChild(picker);
      ui.appendChild($(`<div class="hint" style="bottom:calc(86px + env(safe-area-inset-bottom));max-width:90%">구종을 고르고 화면을 드래그해 목표 위치를 정한 뒤 던지기! 제구가 낮으면 목표에서 빗나갑니다.</div>`));
    };
    api.setPitchingActive = (active, flight = false) => {
      if (!picker) return;
      picker.style.display = flight ? 'none' : 'flex';
      picker.querySelectorAll('button').forEach(b => { b.disabled = !active; b.style.opacity = active ? '1' : '.45'; });
      picker.querySelector('#throw').textContent = active ? '던지기' : '준비 중';
      ui.querySelectorAll('.hint').forEach(h => h.style.display = active ? '' : 'none');
    };
    api.removePicker = () => { if (picker) picker.remove(); ui.querySelectorAll('.hint').forEach((h) => h.remove()); };
    return await playPitching(P, m, api);
  }
  const r = await playMatch(P, m, api);
  return r;
}

function resultModal(r, msgs, cont) {
  clear(); showHome(typeof P !== 'undefined' && P ? P.pos : 'bat', typeof P !== 'undefined' ? P : null);
  const delta = Object.entries(r.growthDelta || {}).filter(([,v]) => v).map(([k,v]) => `<span class="chip ${v > 0 ? 'up' : 'dn'}">${evName[k] || '컨디션'} ${v > 0 ? '+' : ''}${v}</span>`).join('');
  const mod = show($(`<div class="modal"><div class="panel"><h2>${r.win ? '승리!' : '패배'}</h2><div style="font-size:30px;font-weight:900;text-align:center">${r.my} : ${r.opp}</div><p style="text-align:center">${P.pos === 'pit' ? `${r.ip}이닝 ${r.hitsAllowed}피안타 ${r.so}탈삼진 ${r.er}실점` : `${r.ab}타수 ${r.hits}안타 ${r.hr}홈런 ${r.rbi}타점`}</p>${tiebreakHtml(r)}<h3 style="margin-bottom:8px">경기가 남긴 변화</h3><div class="chips">${delta || '<span class="chip">변화 없음</span>'}</div><p style="font-size:13px;color:#b5c6dd">감독·캡틴·팀메이트 평가는 출전 기회에, 스카우트 평가는 졸업 후 지명에 반영됩니다.</p><br><button class="btn big" id="ok">다음</button></div></div>`));
  mod.querySelector('#ok').onclick = () => { mod.remove(); G.save(P); cont(); };
}

function endingScreen() {
  clear(); showHome(typeof P !== 'undefined' && P ? P.pos : 'bat', typeof P !== 'undefined' ? P : null);
  const r = P.result;
  const el = show($(`<div class="screen"><div class="title" style="font-size:28px">졸업 · 드래프트</div><div class="panel" style="text-align:center"><div class="ending-result">${r.text}</div>${r.rank ? `<div>${r.team}</div>` : ''}<div style="margin-top:8px">종합 ${r.ovr} · 평가점수 ${r.score}</div><div>${P.wins}승 ${P.losses}패 · ${P.pos === 'pit' ? `${P.ab}이닝 · ${P.so || 0}탈삼진` : `홈런 ${P.hr}`}</div></div>
    <div class="panel">${statsHtml()}<div class="ev" style="margin-top:6px">${P.traits.filter((t) => TRAITS[t].good).map((t) => `<span class="tr">${TRAITS[t].name}</span>`).join('')}</div></div>
    <div class="spacer"></div><div class="panel log" id="hof-save-note">${G.storageStatus().pending.includes('명예의 전당')?'명예의 전당 저장 대기 중입니다. 위의 저장 안내를 확인하세요.':'선수는 명예의 전당에 저장되었습니다.'}</div><button class="btn alt" id="finalyears">학년별 성장 돌아보기</button><button class="btn big" id="again">새 선수로 다시 시작</button><button class="btn gray" id="hof">명예의 전당</button></div>`));
  el.querySelector('#finalyears').onclick = () => yearHistoryModal(true);
  el.querySelector('#again').onclick = () => { G.clearSave(); createScreen(); };
  el.querySelector('#hof').onclick = hofScreen;
}

window.__game = { get P() { return P; }, G, skipWeeks: (n) => { for (let i = 0; i < n; i++) { G.doCommand(P, 'basic'); G.endWeek(P); } homeScreen(); } };
requestAnimationFrame(frame);
titleScreen();
