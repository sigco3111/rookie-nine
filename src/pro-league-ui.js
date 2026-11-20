import {appendClubMark} from './pro-club-style.js';
import {LEAGUE_IDENTITIES,leagueIdentity} from './pro-league-identities.js';
import {validateClubLeague} from './pro-league.js';
import {validateClubSchedule} from './pro-schedule.js';
import {createLeagueClub} from './pro-league-entry.js';
import './pro-league-ui.css';
export function mountLeagueEntry(parent,store,{clubId=null,onDone=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-league-entry';parent.append(el);let removed=false,chosen='',plan=null,message='';
 const add=(tag,text,target=el)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};
 function draw(){if(removed)return;el.replaceChildren();const read=store.load(),club=read.data?.clubs.find(c=>c.id===clubId),status=store.status();if(!read.ok){add('p',read.error);return;}
  const repeat=!!club?.league;if(repeat)chosen=club.league.managedTeamId;
  add('h3',repeat?'다음 리그 시즌':'8팀 리그 참가');
  if(club?.pending||(club?.schedule&&!validateClubSchedule(club).done)){add('p','현재 저장된 시즌과 진행 중 경기를 먼저 마치세요. 기존 일정은 그대로 유지됩니다.');return;}
  add('p',repeat?'같은 구단과 명단으로 다음 시즌을 시작합니다.':'운영할 구단 하나를 직접 고르세요. 나머지 7팀이 상대가 됩니다.');
  add('small','팀당 3이닝 14경기 · 전체 56경기. 내 결과를 확정할 때 다른 3경기도 함께 반영합니다. 동률은 공동순위입니다.');
  if(!repeat){const grid=add('div','');grid.className='pro-team-choices';for(const team of LEAGUE_IDENTITIES){const b=add('button',team.name,grid);b.type='button';b.dataset.team=team.id;appendClubMark(b,team.id);b.setAttribute('aria-pressed',String(chosen===team.id));b.disabled=status.pending||status.conflict;b.onclick=()=>{chosen=team.id;plan=null;message='';draw();};}}
  if(message)add('p',message).setAttribute('role','status');
  const review=add('button',repeat?'다음 리그 시즌 내용 확인':'선택 구단 참가 내용 확인');review.type='button';review.disabled=!chosen||status.pending||status.conflict;review.onclick=()=>{plan={id:chosen,expectedRoot:JSON.stringify(store.load().data)};draw();};
  if(plan){const box=add('section','');box.className='pro-admission-confirm';add('h3',leagueIdentity(plan.id).name+' 참가 확인',box);add('p',club?'현재 선수 명단·누적 성적·이전 시즌 일정과 결과를 보존하고 새 14경기를 시작합니다.':'기본 선수 10명으로 시작합니다. 졸업 선수는 별도로 확인해 입단시키며 자동 편성하지 않습니다.',box);add('small','고교 기록과 과거 지명처를 바꾸지 않습니다. 계약·이적·포스트시즌·프로 능력 성장은 아직 포함하지 않습니다.',box);
   const yes=add('button',repeat?'다음 리그 시즌 시작 확정':'이 구단으로 리그 참가 확정',box),no=add('button','참가 취소',box);yes.disabled=status.pending||status.conflict;no.onclick=()=>{plan=null;draw();};yes.onclick=()=>{const selected=plan;plan=null;try{if(JSON.stringify(store.load().data)!==selected.expectedRoot)throw Error('저장 상태가 바뀌어 참가 내용을 다시 확인하세요.');const result=clubId?store.enterLeague(clubId,selected.id,{expectedRoot:selected.expectedRoot,confirmed:true}):createLeagueClub(store,selected.id);if(result.ok){onDone(result);return;}message='리그 참가 저장 대기 중입니다. 저장 안내에서 재시도하세요.';}catch(e){message=e.message;}draw();};
  }
 }
 const unsubscribe=store.subscribe(draw);draw();return {element:el,destroy(){removed=true;unsubscribe();el.remove();}};
}
export function showLeagueTable(parent,club){
 if(!club.league)return;
 const standings=validateClubLeague(club),box=document.createElement('section');box.className='pro-league-table';parent.append(box);
 const add=(tag,text,target=box)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};
 add('h3',`8팀 리그 · ${standings.completedRounds} / 14라운드`);add('p',`실제 반영 ${standings.completedGames} / 56경기 · 승률 동률은 공동순위`);
 const table=add('table','');table.setAttribute('aria-label','8팀 실제 리그 순위');const head=add('thead','',table),hr=add('tr','',head);for(const label of ['순위','팀','경기','승','패','승률'])add('th',label,hr);const body=add('tbody','',table);
 for(const row of standings.rows){const tr=add('tr','',body);if(row.id===club.league.managedTeamId)tr.dataset.owned='true';for(const [index,text]of [row.rank??'-',leagueIdentity(row.id).name,row.games,row.wins,row.losses,row.winRate===null?'-':row.winRate.toFixed(3).replace(/^0/,'')].entries()){const cell=add('td',String(text),tr);if(index===1)appendClubMark(cell,row.id);}}
 add('small','내 구단은 강조 표시됩니다. 타 팀은 고정 능력의 기본 선수로 자동 진행하며 타 팀 개별 선수 누적기록은 아직 저장하지 않습니다.');
 const details=add('details','');add('summary','라운드별 4경기 결과',details);
 for(const round of club.league.schedule.rounds){const scores=club.league.results.slice((round.number-1)*4,round.number*4);const group=add('div','',details);group.className='pro-league-round';add('h4',`${round.number}라운드${scores.length?' · 반영 완료':' · 예정'}`,group);for(const f of round.games){const score=scores.find(r=>r.id===f.id);add('p',`${leagueIdentity(f.home).name} ${score?score.homeScore+' : '+score.awayScore:'vs'} ${leagueIdentity(f.away).name}`,group);}}
}
