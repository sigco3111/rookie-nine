import { beginClubGame } from './pro.js';
import { createClubSession } from './pro-match.js';
// Atomic preparation: lineup snapshot and engine session enter the same save write.
export function prepareClubFixture(store,clubId,fixture){
 const state=store.load();if(!state.ok)throw Error(state.error);const status=store.status();if(status.pending||status.conflict)throw Error('현재 기록 저장을 먼저 마치세요.');
 const index=state.data.clubs.findIndex(c=>c.id===clubId);if(index<0)throw Error('구단을 확인하세요.');const club=state.data.clubs[index];
 if(club.pending){if(club.pending.id!==fixture.id)throw Error('진행 중인 경기를 먼저 마치세요.');return {ok:true,resumed:true,data:state.data};}
 const next=beginClubGame(club,{id:fixture.id,opponent:fixture.name});next.pending.session=createClubSession(next.pending,{opponent:fixture.opponent,innings:fixture.innings,seed:fixture.seed});state.data.clubs[index]=next;
 return {...store.save(state.data),resumed:false};
}
export function mountProGameSetup(parent,store,clubId,{fixture,onStart=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-session';parent.append(el);let removed=false,message='';
 function draw(){if(removed)return;el.replaceChildren();const h=document.createElement('h2');h.textContent='다음 경기 준비';el.append(h);const state=store.load(),club=state.data?.clubs.find(c=>c.id===clubId);if(!state.ok||!club){const p=document.createElement('p');p.textContent=state.error||'구단을 확인하세요.';el.append(p);return;}
  const p=document.createElement('p');p.textContent=`${club.name} · ${club.record.wins}승 ${club.record.losses}패`;el.append(p);
  const detail=document.createElement('p');detail.textContent=fixture?`${fixture.name}전 · ${fixture.innings}이닝 예정. 동점이면 연장합니다.`:'다음 경기 일정이 아직 준비되지 않았습니다.';el.append(detail);
  if(message){const m=document.createElement('p');m.textContent=message;m.setAttribute('role','status');el.append(m);}
  const b=document.createElement('button');b.type='button';b.textContent=club.pending?'진행 중 경기 이어가기':'현재 편성으로 경기 시작';const status=store.status();b.disabled=!fixture||status.pending||status.conflict;
  b.onclick=()=>{try{const result=prepareClubFixture(store,clubId,fixture);if(result.ok)onStart(result);else {message='경기 준비 저장 대기 중입니다. 저장 안내에서 재시도하세요.';draw();}}catch(e){message=e.message;draw();}};el.append(b);
 }
 const unsub=store.subscribe(draw);draw();return {element:el,refresh:draw,destroy(){removed=true;unsub();el.remove();}};
}
