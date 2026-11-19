import { clubFixtureProgress, prepareNextClubFixture } from './pro-fixtures.js';
export function mountProFixtures(parent,store,clubId,fixtures,{onStart=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-session';parent.append(el);let removed=false,message='';const add=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;el.append(e);return e;};
 function draw(){if(removed)return;el.replaceChildren();add('h2','구단 일정');try{const state=store.load();if(!state.ok)throw Error(state.error);const club=state.data.clubs.find(c=>c.id===clubId);if(!club)throw Error('구단을 확인하세요.');const progress=clubFixtureProgress(club,fixtures);add('h3',`${club.name} · ${progress.completed} / ${progress.total}경기 반영`);add('p','저장된 일정 순서대로 진행합니다. 경기 결과는 구단 기록에 누적됩니다.');if(message)add('p',message).setAttribute('role','status');
  if(progress.done){add('p','저장된 일정을 모두 마쳤습니다. 결과는 구단 기록에서 확인하세요. 다음 시즌 전환은 아직 준비 중입니다.');return;}
  add('p',`다음: ${progress.next.name}전 · ${progress.next.innings}이닝 예정 · 동점이면 연장`);const b=add('button',progress.pending?'진행 중 경기 이어가기':'다음 경기 준비');b.type='button';const status=store.status();b.disabled=status.pending||status.conflict;b.onclick=()=>{try{const result=prepareNextClubFixture(store,clubId,fixtures);if(result.ok)onStart(result);else {message='경기 준비 저장 대기 중입니다. 저장 안내에서 재시도하세요.';draw();}}catch(e){message=e.message;draw();}};
 }catch(e){add('p',e.message).setAttribute('role','alert');}}
 const unsub=store.subscribe(draw);draw();return {element:el,destroy(){removed=true;unsub();el.remove();}};
}
