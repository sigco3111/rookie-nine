import {showLeagueRecap} from './pro-league-recap.js';
import {mountLeagueEntry,showLeagueTable} from './pro-league-ui.js';
import {regionalClubLabel} from './pro-regions.js';
import {showProOpponents} from './pro-opponents-ui.js';
import {clubFixtureProgress,prepareNextClubFixture} from './pro-fixtures.js';
export function mountProFixtures(parent,store,clubId,fixtures,{onStart=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-session';parent.append(el);let removed=false,message='',entry=null;
 const add=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;el.append(e);return e;};
 function draw(){if(removed)return;entry?.destroy();entry=null;el.replaceChildren();add('h2','구단 일정');try{
  const state=store.load();if(!state.ok)throw Error(state.error);const club=state.data.clubs.find(c=>c.id===clubId);if(!club)throw Error('구단을 확인하세요.');
  const progress=clubFixtureProgress(club,fixtures);add('h3',`${club.name} · ${club.season}시즌 · ${progress.completed} / ${progress.total}경기 반영`);
  add('p',club.league?'내 경기 확정 시 같은 라운드의 다른 3경기를 함께 저장합니다. 직접 만든 가상 구단이며 공식 구단 로고는 사용하지 않습니다.':'기존 6경기 시즌입니다. 저장된 일정을 그대로 마친 뒤 8팀 리그에 참가할 수 있습니다.');
  if(message)add('p',message).setAttribute('role','status');
  if(progress.done){showLeagueRecap(el,club);add('p','이번 일정을 모두 마쳤습니다. 이전 결과와 명단은 보존됩니다.');entry=mountLeagueEntry(el,store,{clubId,onDone:()=>onStart()});}
  else{add('p',`다음: ${regionalClubLabel(progress.next.name)}전 · ${progress.next.innings}이닝 예정 · 동점이면 연장`);
   const b=add('button',progress.pending?'진행 중 경기 이어가기':'다음 경기 준비'),status=store.status();b.type='button';b.disabled=status.pending||status.conflict;
   b.onclick=()=>{try{const result=prepareNextClubFixture(store,clubId,fixtures);if(result.ok)onStart(result);else{message='경기 준비 저장 대기 중입니다. 저장 안내에서 재시도하세요.';draw();}}catch(e){message=e.message;draw();}};
  }
  showLeagueTable(el,club);showProOpponents(el,club,{fixtures,showFixtures:true});
 }catch(e){add('p',e.message).setAttribute('role','alert');}}
 const unsub=store.subscribe(draw);draw();return {element:el,destroy(){removed=true;entry?.destroy();unsub();el.remove();}};
}
