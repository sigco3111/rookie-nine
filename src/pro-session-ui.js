import {gameContributionRows} from './pro-contributions.js';
import {showProContributions} from './pro-contributions-ui.js';
import {regionalClubLabel} from './pro-regions.js';
// Shared pending-game screen. Admission policy and season scheduling live outside this component.
import { createProController } from './pro-controller.js';
export function mountProSession(parent,store,clubId,{playDirect,onBack=()=>{},onResult=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-session';parent.append(el);const ctl=createProController(store,clubId);let busy=false,removed=false,error='',lastResult=null;
 const button=(label,action,disabled=false)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=label;b.disabled=disabled;b.onclick=action;el.append(b);return b;};
 const text=(tag,value)=>{const e=document.createElement(tag);e.textContent=value;el.append(e);return e;};
 function act(fn){if(busy)return;error='';try{fn();}catch(e){error=e.message;}draw();}
 function draw(){
  if(removed)return;el.replaceChildren();text('h2','구단 경기');if(error)text('p',error).setAttribute('role','alert');
  let state;try{state=ctl.current();}catch(e){if(lastResult){text('h3',`경기 결과 ${lastResult.my} : ${lastResult.opp}`);text('p',store.status().pending?'결과 저장 대기 중입니다. 저장 안내를 확인하세요.':'결과를 구단 기록에 반영했습니다.');showProContributions(el,lastResult.rows,{title:'이번 경기 선수 기록'});}else text('p',e.message);button('돌아가기',onBack,busy);return;}
  const team=state.teams[0];text('h3',`${regionalClubLabel(team.opponent)}전 · ${state.inning}회 ${state.side===0?'우리 공격':'우리 수비'}`);text('div',`${state.scores[0]} : ${state.scores[1]}`).className='pro-score';
  text('p',`${state.outs}아웃 · 주자 ${[1,2,3].filter(b=>state.bases&(1<<(b-1))).map(b=>b+'루').join(' · ')||'없음'}`);
  const batter=state.teams[state.side].batters[state.order[state.side]%9],pitcher=state.teams[1-state.side].pitcher;
  text('p',`타자 ${batter.name} · 투수 ${pitcher.name}`);const status=store.status(),blocked=busy||status.pending||status.conflict;
  if(state.done){text('p','경기가 끝났습니다. 결과를 확인해 구단 기록에 반영하세요.');button('결과 확인·기록 반영',()=>act(()=>{lastResult={my:state.scores[0],opp:state.scores[1],rows:gameContributionRows(state)};const result=ctl.finish();onResult(result);}),blocked);showProContributions(el,gameContributionRows(state),{title:'이번 경기 선수 기록 · 반영 전'});}
  else {
   button(busy?'직접 플레이 진행 중':state.side===0?'이번 타석 직접 타격':'이번 타석 직접 투구',async()=>{if(busy||!playDirect)return;busy=true;draw();try{await ctl.direct(context=>playDirect(context));}catch(e){error=e.message;}finally{busy=false;draw();}},blocked||!playDirect);
   button('한 타석 자동 진행',()=>act(()=>ctl.auto(1)),blocked);button('남은 경기 자동 진행',()=>act(()=>ctl.auto(2000)),blocked);
  }
  const lineup=document.createElement('details'),heading=document.createElement('summary');heading.textContent='출전 명단·개인 기록';lineup.append(heading);
  for(const p of team.batters){const row=state.players[0][p.id],line=document.createElement('p');line.textContent=`${team.batters.indexOf(p)+1}번 ${p.name}${p.source==='graduate'?' · 육성':''} ${row.ab}타수 ${row.hits}안타 ${row.hr}홈런`;lineup.append(line);}
  const pit=team.pitcher,row=state.players[0][pit.id],line=document.createElement('p');line.textContent=`선발 ${pit.name}${pit.source==='graduate'?' · 육성':''} ${Math.floor(row.outs/3)}.${row.outs%3}이닝 ${row.so}탈삼진`;lineup.append(line);el.append(lineup);
  text('small','직접 플레이 도중 창을 닫으면 마지막 완료 타석부터 이어갑니다.');button('경기 나가기',onBack,busy);
 }
 const unsub=store.subscribe(()=>{if(!busy)draw();});draw();return {element:el,refresh:draw,destroy(){removed=true;unsub();el.remove();}};
}
