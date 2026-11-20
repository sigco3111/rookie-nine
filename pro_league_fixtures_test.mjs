import assert from 'node:assert/strict';
import {createLeagueFixtures,validateLeagueFixtures,leagueStandings} from './src/pro-league-fixtures.js';
import {newClub,beginClubGame} from './src/pro.js';
import {fillClubRoster} from './src/pro-teammates.js';
import {createClubSession,runClubAuto,validateClubSession} from './src/pro-match.js';
const ids=Array.from({length:8},(_,i)=>`test-region-${i}`),input={id:'eight-team-check',season:1,teamIds:ids,innings:3};
const raw=JSON.stringify(input),schedule=createLeagueFixtures(input),snapshot=JSON.stringify(schedule);
assert.equal(JSON.stringify(input),raw);assert.deepEqual(validateLeagueFixtures(JSON.parse(snapshot)),schedule);
const pairs=new Map(),homeCounts=new Map(ids.map(id=>[id,0])),awayCounts=new Map(ids.map(id=>[id,0]));
const all=schedule.rounds.flatMap(r=>r.games);
assert.equal(new Set(all.map(f=>f.id)).size,56);
for(const round of schedule.rounds){assert.equal(round.games.length,4);assert.equal(new Set(round.games.flatMap(g=>[g.home,g.away])).size,8);for(const f of round.games){assert.notEqual(f.home,f.away);const pair=[f.home,f.away].sort().join('|');pairs.set(pair,(pairs.get(pair)||0)+1);homeCounts.set(f.home,homeCounts.get(f.home)+1);awayCounts.set(f.away,awayCounts.get(f.away)+1);}}
assert.equal(pairs.size,28);assert.ok([...pairs.values()].every(n=>n===2));assert.ok([...homeCounts.values(),...awayCounts.values()].every(n=>n===7));
for(const [i,round]of schedule.rounds.slice(0,7).entries())for(const [j,f]of round.games.entries()){const reverse=schedule.rounds[i+7].games[j];assert.equal(f.home,reverse.away);assert.equal(f.away,reverse.home);}
const empty=leagueStandings(schedule,[]);assert.equal(empty.completedRounds,0);assert.ok(empty.rows.every(r=>r.rank===null&&r.winRate===null));
const clubs=new Map(ids.map(id=>[id,fillClubRoster(newClub({id,name:id}))])),clubSnapshot=JSON.stringify([...clubs]),results=[];
for(const round of schedule.rounds){for(const fixture of round.games){
 const home=beginClubGame(clubs.get(fixture.home),{id:fixture.id,opponent:fixture.away}).pending,away=beginClubGame(clubs.get(fixture.away),{id:fixture.id,opponent:fixture.home}).pending;
 // Existing engine takes our team first; this isolated check passes home first. Home advantage is not modeled.
 const pending=createClubSession(home,{opponent:away,innings:fixture.innings,seed:fixture.seed});
 const complete=runClubAuto(pending);assert.equal(complete.done,true);validateClubSession(complete);
 const resumed=runClubAuto(JSON.parse(JSON.stringify(pending)));assert.deepEqual(resumed,complete);
 results.push({id:fixture.id,home:fixture.home,away:fixture.away,homeScore:complete.scores[0],awayScore:complete.scores[1]});
 }
 const restored=JSON.parse(JSON.stringify(results)),standing=leagueStandings(schedule,restored);
 assert.equal(standing.completedRounds,round.number);assert.ok(standing.rows.every(r=>r.games===round.number));
 assert.equal(standing.rows.reduce((n,r)=>n+r.wins,0),restored.length);assert.equal(standing.rows.reduce((n,r)=>n+r.losses,0),restored.length);
 assert.equal(standing.rows.reduce((n,r)=>n+r.runsFor,0),standing.rows.reduce((n,r)=>n+r.runsAgainst,0));
}
const done=leagueStandings(schedule,results);assert.equal(done.done,true);assert.ok(done.rows.every(r=>r.games===14));
assert.equal(JSON.stringify([...clubs]),clubSnapshot);assert.equal(JSON.stringify(schedule),snapshot);
const season2=createLeagueFixtures({...input,season:2});assert.ok(season2.rounds.flatMap(r=>r.games).every(f=>!all.some(old=>old.id===f.id)));assert.notEqual(season2.rounds[0].games[0].seed,all[0].seed);
for(const invalid of [[],[...ids.slice(0,7),ids[0]],[...ids,'ninth']])assert.throws(()=>createLeagueFixtures({...input,teamIds:invalid}));
for(const mutate of [s=>s.rounds[0].games.reverse(),s=>s.rounds[0].games[0].seed++,s=>s.rounds[1].games[0].home=s.rounds[1].games[0].away,s=>s.rounds[0].games[0].innings++]){const bad=structuredClone(schedule);mutate(bad);assert.throws(()=>validateLeagueFixtures(bad));}
for(const bad of [results.slice(0,1),[results[1],results[0],...results.slice(2)],[...results, ...results.slice(0,4)]])assert.throws(()=>leagueStandings(schedule,bad));
for(const mutate of [r=>r[0].homeScore=r[0].awayScore,r=>r[0].homeScore=-1,r=>r[0].away='unknown',r=>r[0].homeScore=.5,r=>r[0].id='other-season']){const bad=structuredClone(results);mutate(bad);assert.throws(()=>leagueStandings(schedule,bad));}
// Four winners share first place; row order is stable, not an invented run-difference tie-break rule.
const tied=schedule.rounds[0].games.map(f=>({id:f.id,home:f.home,away:f.away,homeScore:1,awayScore:0}));
const table=leagueStandings(schedule,tied);assert.deepEqual(table.rows.map(r=>r.rank),[1,1,1,1,5,5,5,5]);
console.log('eight-team foundation:14rounds/56actualenginegames/eachpairtwice/7home7away/reload-exact/standings reconcile/sharedrank/invalid/stale guards/input immutable passed');
console.log(JSON.stringify(done,null,2));
