// Pro-club data is separate from the school-career save. Pure functions return new values.
import { keysOf, TRAITS } from './data.js';
const copy = value => structuredClone(value);
export const PRO_SCHEMA = 1;
export function graduateId(entry) {
  if (entry.id) return entry.id;
  // Legacy archive records have no ID. Include the original archive payload, never its index.
  const text=JSON.stringify([entry.name,entry.date,entry.pos,entry.build,entry.stats,entry.career,entry.team]);
  return 'legacy-'+encodeURIComponent(text);
}
export function playerFromGraduate(entry) {
  if(!entry||!['bat','pit'].includes(entry.pos)||!Array.isArray(entry.stats))throw Error('선수 기록을 확인할 수 없습니다.');
  const statKeys=keysOf(entry);if(entry.stats.length!==statKeys.length||entry.stats.some(n=>!Number.isFinite(n)||n<0||n>99))throw Error('선수 능력치가 올바르지 않습니다.');
  const abilities=Object.fromEntries(statKeys.map((key,i)=>[key,entry.stats[i]]));
  return {id:graduateId(entry),source:'graduate',name:String(entry.name||'졸업 선수'),pos:entry.pos,build:entry.build,
    abilities,traits:(entry.traits||[]).filter(t=>TRAITS[t]),gear:copy(entry.gear||{}),draft:{rank:entry.rank,team:entry.team},
    school:copy(entry.career||{}),pro:{games:0,ab:0,hits:0,hr:0,rbi:0,ip:0,so:0,hitsAllowed:0,er:0},role:'reserve'};
}
export function newClub({id,name}) {
  if(!id||!name)throw Error('구단을 선택하세요.');
  return {schema:PRO_SCHEMA,id,name,roster:[],lineup:Array(9).fill(null),starter:null,season:1,
    record:{games:0,wins:0,losses:0,runsFor:0,runsAgainst:0},history:[],applied:[],pending:null};
}
export function admitGraduate(club,entry) {
  const player=playerFromGraduate(entry);
  if(club.roster.some(p=>p.id===player.id))return {club:copy(club),added:false,playerId:player.id};
  const next=copy(club);next.roster.push(player);return {club:next,added:true,playerId:player.id};
}
export function setLineup(club,{batters,starter}) {
  if(!Array.isArray(batters)||batters.length!==9)throw Error('타순은 9자리입니다.');
  const ids=batters.filter(Boolean);if(new Set(ids).size!==ids.length)throw Error('같은 선수를 두 번 편성할 수 없습니다.');
  for(const id of ids)if(!club.roster.some(p=>p.id===id&&p.pos==='bat'))throw Error('타자 명단을 확인하세요.');
  if(starter&&!club.roster.some(p=>p.id===starter&&p.pos==='pit'))throw Error('선발 투수를 확인하세요.');
  if(club.pending)throw Error('경기 진행 중에는 편성을 바꿀 수 없습니다.');
  const next=copy(club);next.lineup=copy(batters);next.starter=starter||null;
  for(const p of next.roster)p.role=ids.includes(p.id)?'lineup':p.id===starter?'starter':'reserve';return next;
}
export function beginClubGame(club,{id,opponent}) {
  if(!id||!opponent)throw Error('경기 정보를 확인하세요.');
  if(club.applied.includes(id))throw Error('이미 반영된 경기입니다.');
  if(club.pending){if(club.pending.id!==id)throw Error('진행 중인 경기를 먼저 마치세요.');return copy(club);}
  const batters=club.lineup.map(id=>club.roster.find(p=>p.id===id));const pitcher=club.roster.find(p=>p.id===club.starter);
  if(batters.some(p=>!p||p.pos!=='bat')||!pitcher||pitcher.pos!=='pit')throw Error('타자 9명과 선발 투수를 편성하세요.');
  const next=copy(club);next.pending={id,opponent,season:club.season,number:club.record.games+1,batters:copy(batters),pitcher:copy(pitcher)};return next;
}
export function applyClubResult(club,result) {
  if(!result?.id)throw Error('경기 결과를 확인하세요.');
  if(club.applied.includes(result.id))return {club:copy(club),applied:false};
  const game=club.pending;if(!game||game.id!==result.id)throw Error('대기 중인 경기와 결과가 다릅니다.');
  for(const k of ['my','opp'])if(!Number.isInteger(result[k])||result[k]<0)throw Error('점수가 올바르지 않습니다.');
  if(result.my===result.opp)throw Error('동점 처리 규칙을 먼저 적용하세요.');
  const participants=new Set([...game.batters.map(p=>p.id),game.pitcher.id]);
  const stats=result.players||{};
  for(const [id,row] of Object.entries(stats)){
    if(!participants.has(id))throw Error('출전하지 않은 선수 기록입니다.');
    for(const [key,n]of Object.entries(row))if(!['ab','hits','hr','rbi','ip','so','hitsAllowed','er'].includes(key)||!Number.isInteger(n)||n<0)throw Error('선수 기록이 올바르지 않습니다.');
    if((row.hits||0)>(row.ab||0)||(row.hr||0)>(row.hits||0))throw Error('안타와 타수 기록이 다릅니다.');
    const role=id===game.pitcher.id?'pit':'bat';const allowed=role==='pit'?['ip','so','hitsAllowed','er']:['ab','hits','hr','rbi'];if(Object.keys(row).some(key=>!allowed.includes(key)))throw Error('포지션과 기록 항목이 다릅니다.');
  }
  const next=copy(club);next.record.games++;next.record[result.my>result.opp?'wins':'losses']++;next.record.runsFor+=result.my;next.record.runsAgainst+=result.opp;
  for(const p of next.roster)if(participants.has(p.id)){p.pro.games++;for(const [key,n]of Object.entries(stats[p.id]||{}))p.pro[key]+=n;}
  next.history.push({id:result.id,season:game.season,number:game.number,opponent:game.opponent,my:result.my,opp:result.opp,players:copy(stats)});
  next.applied.push(result.id);next.pending=null;return {club:next,applied:true};
}
