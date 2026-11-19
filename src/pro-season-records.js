// Read-only projections from the persisted result ledger, never synthetic standings.
export function clubSeasonRecords(club){
 const seasons=new Set([club.season,...club.history.map(g=>g.season),...(club.scheduleHistory??[]).map(s=>s.season)]);
 return [...seasons].sort((a,b)=>b-a).map(season=>{
  const games=club.history.filter(g=>g.season===season),schedule=season===club.season?club.schedule:(club.scheduleHistory??[]).find(s=>s.season===season);
  const record=games.reduce((r,g)=>{r.games++;r[g.my>g.opp?'wins':'losses']++;r.runsFor+=g.my;r.runsAgainst+=g.opp;return r;},{games:0,wins:0,losses:0,runsFor:0,runsAgainst:0});
  return {season,current:season===club.season,record,scheduled:schedule?.fixtures.length??null,completed:schedule?games.filter(g=>schedule.fixtures.some(f=>f.id===g.id)).length:null,players:club.roster.map(p=>{
   const rows=games.filter(g=>g.participants.includes(p.id)),keys=p.pos==='pit'?['outs','so','hitsAllowed','er']:['ab','hits','hr','rbi'],stats=Object.fromEntries(keys.map(k=>[k,rows.every(g=>Number.isSafeInteger(g.players?.[p.id]?.[k]))?rows.reduce((n,g)=>n+g.players[p.id][k],0):null]));
   return {id:p.id,games:rows.length,...stats};
  })};
 });
}
