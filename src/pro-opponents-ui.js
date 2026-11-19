import {clubOpponentRecords} from './pro-opponents.js';
import './pro-opponents-ui.css';
export function showProOpponents(parent,club,{season=club.season,fixtures=null,showFixtures=false}={}){
 const data=clubOpponentRecords(club,{season,fixtures}),el=document.createElement('section');el.className='pro-opponents';parent.append(el);
 const add=(tag,text,target=el)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};
 add('h3',season===null?'누적 상대별 맞대결':`${season}시즌 상대별 맞대결`);add('small','우리 구단 기준 실제 반영한 경기만 집계합니다. 같은 상대 이름끼리 묶으며, 다른 구단 간 경기나 리그 순위는 계산하지 않습니다.');
 for(const r of data.opponents){const card=add('article','');card.className='pro-opponent-row';add('strong',r.name,card);add('p',`${r.games}경기 · ${r.wins}승 ${r.losses}패 · 득점 ${r.runsFor} / 실점 ${r.runsAgainst}`,card);add('small',`${r.scheduled?`저장 일정 ${r.scheduled}경기`:'저장 일정 없음'}${r.pending?' · 진행 중 경기 있음':''}`,card);}
 if(!data.opponents.length)add('p','아직 저장된 상대나 반영한 경기가 없습니다.');
 if(data.unlisted)add('p',`저장 일정에 없는 이전 결과 ${data.unlisted}경기도 맞대결 성적에 포함했습니다.`);
 if(showFixtures&&data.fixtures.length){const details=add('details','');details.className='pro-fixture-list';add('summary',`전체 일정 ${data.fixtures.length}경기 보기`,details);const list=add('ol','',details);for(const f of data.fixtures){const li=add('li','',list);li.dataset.state=f.state;add('strong',`${f.number} · ${f.name}`,li);add('span',f.state==='completed'?`${f.win?'승':'패'} ${f.my} : ${f.opp}`:f.state==='pending'?'진행 중 · 결과 미반영':`예정 · ${f.innings}이닝`,li);}}
 return el;
}
