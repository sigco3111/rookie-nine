// Caller-owned eight-team league foundation. Not mounted or persisted by normal menus yet.
// Names, uniforms and the managed team remain explicit caller choices.
const copy=value=>structuredClone(value);
const fail=()=>{throw Error('8팀 리그 일정과 경기 기록을 확인하세요.');};
const hash=text=>{let n=2166136261;for(const c of text)n=Math.imul(n^c.charCodeAt(0),16777619)>>>0;return n||1;};
export function createLeagueFixtures({id,season,teamIds,innings=3}){
 if(typeof id!=='string'||!id||!Number.isSafeInteger(season)||season<1||!Array.isArray(teamIds)||teamIds.length!==8||teamIds.some(t=>typeof t!=='string'||!t)||new Set(teamIds).size!==8||!Number.isInteger(innings)||innings<1||innings>9)fail();
 const wheel=[...teamIds],first=[];
 for(let round=1;round<=7;round++){
  const games=[];
  for(let i=0;i<4;i++){
   const pair=[wheel[i],wheel[7-i]];
   if((round+i)%2===0)pair.reverse();
   games.push({home:pair[0],away:pair[1]});
  }
  first.push(games);wheel.splice(1,0,wheel.pop());
 }
 const rounds=[...first,...first.map(games=>games.map(g=>({home:g.away,away:g.home})))].map((games,index)=>({number:index+1,games:games.map((game,i)=>{const fixtureId=`${id}:season:${season}:round:${index+1}:game:${i+1}`;return {id:fixtureId,...game,innings,seed:hash(fixtureId)};})}));
 return {schema:1,id,season,teamIds:[...teamIds],innings,rounds};
}
export function validateLeagueFixtures(schedule){
 if(!schedule||schedule.schema!==1)fail();
 const rebuilt=createLeagueFixtures(schedule);
 if(JSON.stringify(rebuilt)!==JSON.stringify(schedule))fail();
 return rebuilt;
}
// Only complete rounds are accepted, so a persisted round can never silently show half its games.
// A caller must save its own result and the other three results together before advancing.
export function leagueStandings(schedule,results){
 validateLeagueFixtures(schedule);
 if(!Array.isArray(results)||results.length>56||results.length%4!==0)fail();
 const fixtures=schedule.rounds.flatMap(r=>r.games),byTeam=new Map(schedule.teamIds.map(id=>[id,{id,games:0,wins:0,losses:0,runsFor:0,runsAgainst:0}]));
 results.forEach((result,i)=>{
  const fixture=fixtures[i];
  if(!result||result.id!==fixture.id||result.home!==fixture.home||result.away!==fixture.away||!Number.isSafeInteger(result.homeScore)||result.homeScore<0||!Number.isSafeInteger(result.awayScore)||result.awayScore<0||result.homeScore===result.awayScore)fail();
  const home=byTeam.get(result.home),away=byTeam.get(result.away);
  for(const [team,scored,allowed]of [[home,result.homeScore,result.awayScore],[away,result.awayScore,result.homeScore]]){
   team.games++;team[scored>allowed?'wins':'losses']++;team.runsFor+=scored;team.runsAgainst+=allowed;
  }
 });
 const rows=[...byTeam.values()].sort((a,b)=>{
  if(!a.games||!b.games)return schedule.teamIds.indexOf(a.id)-schedule.teamIds.indexOf(b.id);
  return b.wins*a.games-a.wins*b.games||schedule.teamIds.indexOf(a.id)-schedule.teamIds.indexOf(b.id);
 });
 let last=null,rank=0;
 rows.forEach((row,index)=>{
  if(last===null||row.wins*last.games!==last.wins*row.games)rank=index+1;
  row.rank=row.games?rank:null;row.winRate=row.games?row.wins/row.games:null;
  row.runDifference=row.runsFor-row.runsAgainst;last=row;
 });
 return {completedRounds:results.length/4,totalRounds:14,completedGames:results.length,totalGames:56,done:results.length===56,rows:copy(rows)};
}
