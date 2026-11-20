import {regionalClubLabel} from './pro-regions.js';
import { showProOpponents } from './pro-opponents-ui.js';
import { createSeasonTransition } from './pro-season.js';
import { clubFixtureProgress, prepareNextClubFixture } from './pro-fixtures.js';
export function mountProFixtures(parent,store,clubId,fixtures,{onStart=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-session';parent.append(el);let removed=false,message='',plan=null;const transition=createSeasonTransition(store);const add=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;el.append(e);return e;};
 function draw(){if(removed)return;el.replaceChildren();add('h2','구단 일정');try{const state=store.load();if(!state.ok)throw Error(state.error);const club=state.data.clubs.find(c=>c.id===clubId);if(!club)throw Error('구단을 확인하세요.');const progress=clubFixtureProgress(club,fixtures);add('h3',`${club.name} · ${club.season}시즌 · ${progress.completed} / ${progress.total}경기 반영`);add('p','저장된 일정 순서대로 진행합니다. 경기 결과는 구단 기록에 누적됩니다. 지역명은 가상 구단의 이름이며 실제 구단과는 무관합니다.');if(message)add('p',message).setAttribute('role','status');
  if(progress.done){add('p','저장된 일정을 모두 마쳤습니다. 결과는 구단 기록에서 확인하세요.');
   if(club.schedule&&JSON.stringify(club.schedule.fixtures)===JSON.stringify(fixtures)){
    const status=store.status(),b=add('button','다음 시즌 내용 확인');b.type='button';b.disabled=status.pending||status.conflict;b.onclick=()=>{try{plan=transition.prepare(clubId);message='';}catch(e){message=e.message;}draw();};
    if(plan){const box=add('section','');box.className='pro-admission-confirm';const line=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;box.append(e);return e;};line('h3',`${plan.to}시즌으로 진행할까요?`);line('p',`${plan.clubName} · ${plan.innings}이닝 ${plan.games}경기. 명단과 누적 성적, 이전 시즌 일정·결과를 그대로 보존합니다.`);line('small','순위 경쟁·계약·선수 성장 등은 아직 준비 중입니다. 자동으로 선수를 입단시키거나 편성을 바꾸지 않습니다.');const yes=line('button','다음 시즌 시작 확정'),no=line('button','취소');yes.type=no.type='button';yes.disabled=status.pending||status.conflict;no.onclick=()=>{plan=null;draw();};yes.onclick=()=>{const selected=plan;plan=null;try{const r=transition.confirm(selected,{confirmed:true});if(r.ok){onStart();return;}message='다음 시즌 저장 대기 중입니다. 저장 안내에서 재시도하세요.';}catch(e){message=e.message;}draw();};box.scrollIntoView({block:'nearest'});}
   }showProOpponents(el,club,{fixtures,showFixtures:true});return;}
  add('p',`다음: ${regionalClubLabel(progress.next.name)}전 · ${progress.next.innings}이닝 예정 · 동점이면 연장`);const b=add('button',progress.pending?'진행 중 경기 이어가기':'다음 경기 준비');b.type='button';const status=store.status();b.disabled=status.pending||status.conflict;b.onclick=()=>{try{const result=prepareNextClubFixture(store,clubId,fixtures);if(result.ok)onStart(result);else {message='경기 준비 저장 대기 중입니다. 저장 안내에서 재시도하세요.';draw();}}catch(e){message=e.message;draw();}};showProOpponents(el,club,{fixtures,showFixtures:true});
 }catch(e){add('p',e.message).setAttribute('role','alert');}}
 const unsub=store.subscribe(draw);draw();return {element:el,destroy(){removed=true;unsub();el.remove();}};
}
