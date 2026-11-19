// Read-only club ledger. No schedule, admission or next-season policy is chosen here.
export function mountProRecords(parent,store,clubId){
 const el=document.createElement('section');el.className='pro-records';parent.append(el);let removed=false;
 const add=(tag,value,target=el)=>{const e=document.createElement(tag);e.textContent=value;target.append(e);return e;};
 const innings=n=>`${Math.floor(n/3)}.${n%3}`;
 const stat=(row,key)=>Number.isSafeInteger(row[key])?row[key]:'미기록';
 const ip=row=>Number.isSafeInteger(row.outs)?innings(row.outs):'미기록';
 function draw(){
  if(removed)return;el.replaceChildren();add('h2','구단 기록');const loaded=store.load();if(!loaded.ok){add('p',loaded.error).setAttribute('role','alert');return;}
  const club=loaded.data.clubs.find(c=>c.id===clubId);if(!club){add('p','구단을 찾을 수 없습니다.');return;}
  add('h3',club.name);const r=club.record;add('div',`${r.games}경기 · ${r.wins}승 ${r.losses}패`).className='pro-record-total';add('p',`누적 득점 ${r.runsFor} · 실점 ${r.runsAgainst}`);
  const status=store.status();if(status.pending||status.conflict)add('p',status.conflict?'저장 충돌이 있습니다. 아래는 현재 읽은 기록입니다.':'저장 대기 중인 기록이 포함되어 있습니다.').setAttribute('role','status');
  if(club.pending)add('p',`${club.pending.opponent}전 진행 중 · 종료 후 결과를 반영하면 누적됩니다.`);
  add('h3','선수 누적 기록');add('small','프로 기록만 표시합니다. 이닝의 소수 자리는 아웃 수입니다.');
  for(const p of club.roster){const row=p.pro,card=add('article','');add('strong',`${p.name}${p.source==='graduate'?' · 육성':''}`,card);add('p',p.pos==='bat'?`${row.games}경기 · ${row.ab}타수 ${row.hits}안타 ${row.hr}홈런 ${row.rbi}타점`:`${row.games}경기 · ${innings(row.outs)}이닝 ${row.so}탈삼진 · ${row.hitsAllowed}피안타 ${row.er}자책`,card);}
  add('h3','경기 이력');if(!club.history.length)add('p','아직 반영한 경기가 없습니다.');
  for(const g of [...club.history].reverse()){
   const card=add('details',''),summary=add('summary',`${g.number}번째 · ${g.my>g.opp?'승':'패'} ${g.my} : ${g.opp} · ${g.opponent}`,card);
   summary.setAttribute('aria-label',`경기 ${g.number} 상세`);add('p',g.complete?'출전자 전체 기록':'일부 기록만 남아 있는 경기',card);
   for(const id of g.participants){const p=club.roster.find(p=>p.id===id),row=g.players[id];if(!row){add('p',`${p?.name||'명단 외 선수'} · 개인 기록 없음`,card);continue;}add('p',`${p?.name||'명단 외 선수'} · ${p?.pos==='pit'?`${ip(row)}이닝 ${stat(row,'so')}탈삼진 ${stat(row,'hitsAllowed')}피안타 ${stat(row,'er')}자책`:`${stat(row,'ab')}타수 ${stat(row,'hits')}안타 ${stat(row,'hr')}홈런 ${stat(row,'rbi')}타점`}`,card);}
  }
 }
 const unsub=store.subscribe(draw);draw();return {element:el,refresh:draw,destroy(){removed=true;unsub();el.remove();}};
}
