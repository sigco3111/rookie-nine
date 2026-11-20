// Derived only from complete, validated league scores. No medals, rewards or synthetic champions.
import {leagueClubForSeason,validateClubLeague} from './pro-league.js';
import {leagueIdentity} from './pro-league-identities.js';
export function leagueSeasonRecap(club,season=club.season){
 const view=leagueClubForSeason(club,season);if(!view)return null;
 const table=validateClubLeague(view);if(!table.done)return null;
 const own=table.rows.find(r=>r.id===view.league.managedTeamId),tied=table.rows.filter(r=>r.rank===own.rank).length;
 const top=table.rows.filter(r=>r.rank===1).map(r=>({id:r.id,name:leagueIdentity(r.id).name}));
 const recap={season,teamId:own.id,name:leagueIdentity(own.id).name,rank:own.rank,tied:tied>1,rankLabel:`${tied>1?'공동 ':''}${own.rank}위`,record:{games:own.games,wins:own.wins,losses:own.losses,runsFor:own.runsFor,runsAgainst:own.runsAgainst},top,previous:null};
 const older=(club.leagueHistory??[]).filter(h=>h.season<season).sort((a,b)=>b.season-a.season)[0];
 if(older){const previousView=leagueClubForSeason(club,older.season),previousTable=validateClubLeague(previousView),previous=previousTable.rows.find(r=>r.id===previousView.league.managedTeamId);
  if(previous.id===own.id)recap.previous={season:older.season,wins:previous.wins,losses:previous.losses,rank:previous.rank,winDifference:own.wins-previous.wins,rankDifference:previous.rank-own.rank};
 }
 return recap;
}
export function showLeagueRecap(parent,club,season=club.season){
 const recap=leagueSeasonRecap(club,season);if(!recap)return;
 const box=document.createElement('article');box.className='pro-league-recap';parent.append(box);
 const add=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;box.append(e);return e;};
 add('small',`${recap.season}시즌 · 정규 일정 56경기 완료`);add('h3',`${recap.name} · ${recap.rankLabel}`);
 add('p',`${recap.record.wins}승 ${recap.record.losses}패 · ${recap.record.games}경기`);add('p',`득점 ${recap.record.runsFor} · 실점 ${recap.record.runsAgainst}`);
 add('p',`${recap.top.length>1?'공동 1위':'정규 일정 1위'}: ${recap.top.map(t=>t.name).join(' · ')}`);
 if(recap.previous){const d=recap.previous.winDifference;add('small',`${recap.previous.season}시즌보다 ${d===0?'승수 동일':`${Math.abs(d)}승 ${d>0?'증가':'감소'}`}. 당시 ${recap.previous.rank}위. 동률은 공동순위로 남깁니다.`);}
 add('small','포스트시즌이나 별도 우승 결정전을 진행한 결과는 아닙니다. 다음 시즌을 시작해도 이 결과와 명단은 보존됩니다.');
 return box;
}
