// Read-only head-to-head results. Names are the only opponent identity in old ledgers.
export function clubOpponentRecords(club,{season=club.season,fixtures=null}={}){
 const schedules=[...(club.scheduleHistory??[]),...(club.schedule?[club.schedule]:[])].filter(s=>season===null||s.season===season);
 const planned=fixtures??schedules.flatMap(s=>s.fixtures),games=club.history.filter(g=>season===null||g.season===season),byId=new Map(games.map(g=>[g.id,g])),groups=new Map();
 const group=name=>{if(!groups.has(name))groups.set(name,{name,scheduled:0,games:0,wins:0,losses:0,runsFor:0,runsAgainst:0,pending:false});return groups.get(name);};
 const rows=planned.map((f,index)=>{const g=byId.get(f.id),pending=!g&&club.pending?.id===f.id;const r=group(f.name);r.scheduled++;if(pending)r.pending=true;return {id:f.id,name:f.name,number:index+1,innings:f.innings,state:g?'completed':pending?'pending':'scheduled',...(g?{my:g.my,opp:g.opp,win:g.my>g.opp}: {})};});
 for(const g of games){const r=group(g.opponent);r.games++;r[g.my>g.opp?'wins':'losses']++;r.runsFor+=g.my;r.runsAgainst+=g.opp;}
 return {season,opponents:[...groups.values()],fixtures:rows,unlisted:games.filter(g=>!planned.some(f=>f.id===g.id)).length};
}
