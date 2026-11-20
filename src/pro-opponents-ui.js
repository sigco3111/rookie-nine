import {PRO_REGIONS,regionalClubLabel} from './pro-regions.js';
import {clubOpponentRecords} from './pro-opponents.js';
import './pro-opponents-ui.css';
export function showProOpponents(parent,club,{season=club.season,fixtures=null,showFixtures=false}={}){
 const data=clubOpponentRecords(club,{season,fixtures}),el=document.createElement('section');el.className='pro-opponents';parent.append(el);
 const add=(tag,text,target=el)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};
 add('h3',season===null?'누적 상대별 맞대결':`${season}시즌 상대별 맞대결`);add('small','우리 구단 기준 실제 반영한 경기만 집계합니다. 이전 임시명은 지역명으로 연결해 집계합니다. 아래 맞대결 집계는 내 구단이 참가한 경기만 다룹니다.');
 for(const r of data.opponents){const card=add('article','');card.className='pro-opponent-row';if(PRO_REGIONS.includes(r.name)){const mark=add('span',r.name[0],card);mark.className='pro-region-mark';mark.setAttribute('aria-hidden','true');}add('strong',r.name,card);if(r.previousNames.length)add('small',`이전 이름: ${r.previousNames.join(' · ')} · 저장 원문 유지`,card);add('p',`${r.games}경기 · ${r.wins}승 ${r.losses}패 · 득점 ${r.runsFor} / 실점 ${r.runsAgainst}`,card);add('small',`${r.scheduled?`저장 일정 ${r.scheduled}경기`:'저장 일정 없음'}${r.pending?' · 진행 중 경기 있음':''}`,card);}
 if(!data.opponents.length)add('p','아직 저장된 상대나 반영한 경기가 없습니다.');
 if(data.unlisted)add('p',`저장 일정에 없는 이전 결과 ${data.unlisted}경기도 맞대결 성적에 포함했습니다.`);
 if(showFixtures&&data.fixtures.length){const details=add('details','');details.className='pro-fixture-list';add('summary',`전체 일정 ${data.fixtures.length}경기 보기`,details);const list=add('ol','',details);for(const f of data.fixtures){const li=add('li','',list);li.dataset.state=f.state;add('strong',`${f.number} · ${regionalClubLabel(f.originalName)}`,li);add('span',f.state==='completed'?`${f.win?'승':'패'} ${f.my} : ${f.opp}`:f.state==='pending'?'진행 중 · 결과 미반영':`예정 · ${f.innings}이닝`,li);}}
 return el;
}
