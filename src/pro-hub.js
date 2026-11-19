import { createOwnClub, addDefaultClubSchedule } from './pro-bootstrap.js';
import { mountPreparedProMode } from './pro-mode.js';
import { mountProSaveNotice } from './pro-save-notice.js';
export function mountProHub(parent,storage,store,{onBack=()=>{},getGraduates=()=>[]}={}){
 const el=document.createElement('div');el.className='pro-mode';parent.append(el);let mode=null,removed=false,message='';
 let notice=mountProSaveNotice(store,{parent:el,onRecovered:()=>draw()});const content=document.createElement('section');content.className='pro-session';el.append(content);
 const add=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;content.append(e);return e;};
 function open(id){mode?.destroy();content.hidden=true;el.className='';notice.destroy();mode=mountPreparedProMode(el,storage,store,id,{getGraduates,onBack:()=>{mode.destroy();mode=null;content.hidden=false;el.className='pro-mode';notice=mountProSaveNotice(store,{parent:el,onRecovered:()=>draw()});draw();}});}
 function draw(){if(removed||mode)return;content.replaceChildren();add('h2','프로 구단');add('p','여러 육성 회차의 졸업 선수를 한 내 구단에 모아 출전시킬 수 있습니다. 고교 지명 이력은 그대로 남깁니다.');if(message)add('p',message).setAttribute('role','status');
  const b=add('button','제목 화면으로');b.onclick=onBack;const state=store.load();if(!state.ok){add('p',state.error).setAttribute('role','alert');return;}const status=store.status();
  if(!state.data.clubs.length){add('h3','내 구단 시작');add('p','기본 선수 10명과 3이닝 6경기를 만듭니다. 졸업 선수는 따로 확인해 입단시키며 자동 편성하지 않습니다.');add('small','현재는 첫 6경기까지 지원합니다. 다음 시즌 전환·순위 경쟁은 아직 준비 중입니다.');const b=add('button','내 구단 만들기');b.disabled=status.pending||status.conflict;b.onclick=()=>{try{const r=createOwnClub(store);if(r.ok)open(r.clubId);else{message='구단 생성 저장 대기 중입니다. 위의 저장 안내에서 재시도하세요.';draw();}}catch(e){message=e.message;draw();}};return;}
  for(const club of state.data.clubs){add('h3',club.name);add('p',`${club.record.wins}승 ${club.record.losses}패 · ${club.record.games}경기 누적`);const b=add('button',club.name+' 들어가기');b.onclick=()=>open(club.id);
   if(!club.schedule&&!club.pending){const schedule=add('button','이 구단에 3이닝 6경기 추가');schedule.disabled=status.pending||status.conflict;schedule.onclick=()=>{try{const r=addDefaultClubSchedule(store,club.id);message=r.ok?'경기 일정을 저장했습니다.':'일정 저장 대기 중입니다. 저장 안내를 확인하세요.';}catch(e){message=e.message;}draw();};}}
 }
 const unsub=store.subscribe(draw);draw();return {element:el,destroy(){removed=true;mode?.destroy();unsub();notice.destroy();el.remove();}};
}
