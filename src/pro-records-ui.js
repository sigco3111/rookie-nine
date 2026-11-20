import {regionalClubLabel} from './pro-regions.js';
import { showProOpponents } from './pro-opponents-ui.js';
import { clubSeasonRecords } from './pro-season-records.js';
// Read-only club ledger. No schedule, admission or next-season policy is chosen here.
export function mountProRecords(parent,store,clubId){
 const el=document.createElement('section');el.className='pro-records';parent.append(el);let removed=false,selected='all';
 const add=(tag,value,target=el)=>{const e=document.createElement(tag);e.textContent=value;target.append(e);return e;};
 const innings=n=>`${Math.floor(n/3)}.${n%3}`;
 const stat=(row,key)=>Number.isSafeInteger(row[key])?row[key]:'미기록';
 const ip=row=>Number.isSafeInteger(row.outs)?innings(row.outs):'미기록';
 function draw(){
  if(removed)return;el.replaceChildren();add('h2','구단 기록');const loaded=store.load();if(!loaded.ok){add('p',loaded.error).setAttribute('role','alert');return;}
  const club=loaded.data.clubs.find(c=>c.id===clubId);if(!club){add('p','구단을 찾을 수 없습니다.');return;}
  add('h3',club.name);const r=club.record;add('div',`${r.games}경기 · ${r.wins}승 ${r.losses}패`).className='pro-record-total';add('p',`누적 득점 ${r.runsFor} · 실점 ${r.runsAgainst}`);
  const status=store.status();if(status.pending||status.conflict)add('p',status.conflict?'저장 충돌이 있습니다. 아래는 현재 읽은 기록입니다.':'저장 대기 중인 기록이 포함되어 있습니다.').setAttribute('role','status');
  if(club.pending)add('p',`${regionalClubLabel(club.pending.opponent)}전 진행 중 · 종료 후 결과를 반영하면 누적됩니다.`);
  const seasons=clubSeasonRecords(club);if(selected!=='all'&&!seasons.some(s=>String(s.season)===selected))selected='all';
  const filter=add('label','표시 기록'),select=add('select','',filter);select.setAttribute('aria-label','기록 시즌');const all=add('option','전체 누적',select);all.value='all';for(const s of seasons){const o=add('option',`${s.season}시즌${s.current?' · 진행 중':''}`,select);o.value=String(s.season);}select.value=selected;select.onchange=()=>{selected=select.value;draw();};
  add('h3','시즌별 성적');for(const s of seasons){const card=add('article','');card.className='pro-season-record';add('strong',`${s.season}시즌${s.current?' · 현재 시즌':' · 이전 시즌'}`,card);add('p',`${s.record.games}경기 · ${s.record.wins}승 ${s.record.losses}패 · 득점 ${s.record.runsFor} · 실점 ${s.record.runsAgainst}`,card);add('small',s.scheduled===null?'이전 기록: 저장된 일정 없음':`저장 일정 ${s.completed} / ${s.scheduled}경기 반영`,card);}
  const chosen=seasons.find(s=>String(s.season)===selected),shown=chosen?club.history.filter(g=>g.season===chosen.season):club.history;
  showProOpponents(el,club,{season:chosen?.season??null});
  add('h3',chosen?`${chosen.season}시즌 선수 기록`:'선수 누적 기록');add('small','프로 기록만 표시합니다. 이닝의 소수 자리는 아웃 수입니다.');
  for(const p of club.roster){const row=chosen?chosen.players.find(r=>r.id===p.id):p.pro,card=add('article','');add('strong',`${p.name}${p.source==='graduate'?' · 육성':''}`,card);add('p',p.pos==='bat'?`${row.games}경기 · ${stat(row,'ab')}타수 ${stat(row,'hits')}안타 ${stat(row,'hr')}홈런 ${stat(row,'rbi')}타점`:`${row.games}경기 · ${ip(row)}이닝 ${stat(row,'so')}탈삼진 · ${stat(row,'hitsAllowed')}피안타 ${stat(row,'er')}자책`,card);}
  add('h3',chosen?`${chosen.season}시즌 경기 이력`:'경기 이력');if(!shown.length)add('p','아직 반영한 경기가 없습니다.');
  for(const g of [...shown].reverse()){
   const card=add('details',''),summary=add('summary',`${g.number}번째 · ${g.my>g.opp?'승':'패'} ${g.my} : ${g.opp} · ${regionalClubLabel(g.opponent)}`,card);
   summary.setAttribute('aria-label',`경기 ${g.number} 상세`);add('p',`${g.season}시즌 · 누적 ${g.number}번째 경기`,card);add('p',g.complete?'출전자 전체 기록':'일부 기록만 남아 있는 경기',card);
   for(const id of g.participants){const p=club.roster.find(p=>p.id===id),row=g.players[id];if(!row){add('p',`${p?.name||'명단 외 선수'} · 개인 기록 없음`,card);continue;}add('p',`${p?.name||'명단 외 선수'} · ${p?.pos==='pit'?`${ip(row)}이닝 ${stat(row,'so')}탈삼진 ${stat(row,'hitsAllowed')}피안타 ${stat(row,'er')}자책`:`${stat(row,'ab')}타수 ${stat(row,'hits')}안타 ${stat(row,'hr')}홈런 ${stat(row,'rbi')}타점`}`,card);}
  }
 }
 const unsub=store.subscribe(draw);draw();return {element:el,refresh:draw,destroy(){removed=true;unsub();el.remove();}};
}
