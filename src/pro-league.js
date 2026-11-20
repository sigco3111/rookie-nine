// Complete-round league state, independent of DOM/storage. Managed-club records remain authoritative.
import {LEAGUE_IDENTITIES,leagueIdentity} from './pro-league-identities.js';
import {createLeagueFixtures,validateLeagueFixtures,leagueStandings} from './pro-league-fixtures.js';
import {newClub,beginClubGame} from './pro.js';
import {fillClubRoster} from './pro-teammates.js';
import {createClubSession,runClubAuto} from './pro-match.js';
const copy=v=>structuredClone(v);
const fail=()=>{throw Error('리그 경기와 구단 기록이 다릅니다. 원본을 보존했습니다.');};
function opponentTeam(identity){
 const club=fillClubRoster(newClub({id:`league:${identity.id}`,name:identity.name}));
 return beginClubGame(club,{id:`snapshot:${identity.id}`,opponent:'리그 편성'}).pending;
}
// Cache only verified fixed-team deterministic score pairs, never managed-player outcomes.
const automaticScores=new Map();
function automaticScore(fixture,teams){
 const key=JSON.stringify(fixture);if(automaticScores.has(key))return [...automaticScores.get(key)];
 const home=teams.find(t=>t.id===fixture.home).snapshot,away=teams.find(t=>t.id===fixture.away).snapshot;
 const session=createClubSession({...copy(home),id:fixture.id},{opponent:copy(away),innings:fixture.innings,seed:fixture.seed});
 const done=runClubAuto(session);if(!done.done)throw Error('다른 구단의 경기가 종료되지 않아 라운드를 저장하지 않았습니다.');
 const scores=[...done.scores];if(automaticScores.size>=256)automaticScores.delete(automaticScores.keys().next().value);automaticScores.set(key,scores);return [...scores];
}
export function createClubLeague(club,managedTeamId){
 const identity=leagueIdentity(managedTeamId);if(!identity||club.pending||club.league)fail();
 const teams=LEAGUE_IDENTITIES.map(t=>({id:t.id,name:t.name,snapshot:opponentTeam(t)}));
 const schedule=createLeagueFixtures({id:`${club.id}:league`,season:club.season,teamIds:teams.map(t=>t.id),innings:3});
 const league={schema:1,managedTeamId,teams,schedule,results:[]};
 const fixtures=schedule.rounds.map(round=>{
  const fixture=round.games.find(g=>g.home===managedTeamId||g.away===managedTeamId),other=fixture.home===managedTeamId?fixture.away:fixture.home,team=teams.find(t=>t.id===other);
  return {id:fixture.id,name:team.name,opponent:copy(team.snapshot),innings:fixture.innings,seed:fixture.seed};
 });
 return {league,schedule:{schema:1,id:`${club.id}:season:${club.season}`,season:club.season,startGame:club.record.games,fixtures},name:identity.name};
}
export function validateClubLeague(club){
 const league=club.league;if(league==null)return null;
 if(!league||league.schema!==1||club.name!==leagueIdentity(league.managedTeamId)?.name||!leagueIdentity(league.managedTeamId)||!Array.isArray(league.teams)||league.teams.length!==8)fail();
 const ids=LEAGUE_IDENTITIES.map(t=>t.id);if(JSON.stringify(league.teams.map(t=>t.id))!==JSON.stringify(ids))fail();
 for(const [i,team]of league.teams.entries()){
  if(team.name!==LEAGUE_IDENTITIES[i].name||JSON.stringify(team.snapshot)!==JSON.stringify(opponentTeam(LEAGUE_IDENTITIES[i])))fail();
 }
 validateLeagueFixtures(league.schedule);
 if(league.schedule.id!==`${club.id}:league`||league.schedule.season!==club.season||JSON.stringify(league.schedule.teamIds)!==JSON.stringify(ids)||league.schedule.innings!==3)fail();
 const standings=leagueStandings(league.schedule,league.results),ownSchedule=club.schedule;
 if(!ownSchedule||ownSchedule.fixtures.length!==14)fail();
 for(const [i,round]of league.schedule.rounds.entries()){
  const f=round.games.find(g=>g.home===league.managedTeamId||g.away===league.managedTeamId),opponentId=f.home===league.managedTeamId?f.away:f.home,team=league.teams.find(t=>t.id===opponentId);
  const expected={id:f.id,name:team.name,opponent:copy(team.snapshot),innings:f.innings,seed:f.seed};
  if(JSON.stringify(ownSchedule.fixtures[i])!==JSON.stringify(expected))fail();
 }
 for(let round=0;round<standings.completedRounds;round++)for(let i=0;i<4;i++){
  const fixture=league.schedule.rounds[round].games[i];if(fixture.home===league.managedTeamId||fixture.away===league.managedTeamId)continue;
  const expected=automaticScore(fixture,league.teams),result=league.results[round*4+i];
  if(result.homeScore!==expected[0]||result.awayScore!==expected[1])fail();
 }
 const history=club.history.slice(ownSchedule.startGame);
 if(history.length!==standings.completedRounds)fail();
 history.forEach((game,i)=>{
  const fixture=ownSchedule.fixtures[i],score=league.results.slice(i*4,i*4+4).find(r=>r.id===fixture.id);
  if(!score||game.id!==fixture.id||game.season!==club.season||game.opponent!==fixture.name)fail();
  const ownHome=score.home===league.managedTeamId;
  if(game.my!==(ownHome?score.homeScore:score.awayScore)||game.opp!==(ownHome?score.awayScore:score.homeScore))fail();
 });
 return standings;
}
// Called after applying exactly one managed-club result to a copied club. No writes occur here.
export function completeLeagueRound(before,after){
 const table=validateClubLeague(before);if(!table||table.done||after.history.length!==before.history.length+1)fail();
 const next=copy(after),league=copy(before.league),round=league.schedule.rounds[table.completedRounds],own=after.history.at(-1);
 for(const fixture of round.games){
  let homeScore,awayScore;
  if(fixture.home===league.managedTeamId||fixture.away===league.managedTeamId){
   if(own.id!==fixture.id)fail();const home=fixture.home===league.managedTeamId;homeScore=home?own.my:own.opp;awayScore=home?own.opp:own.my;
  }else{
   [homeScore,awayScore]=automaticScore(fixture,league.teams);
  }
  league.results.push({id:fixture.id,home:fixture.home,away:fixture.away,homeScore,awayScore});
 }
 next.league=league;validateClubLeague(next);return next;
}

// Build a read-only season view. Missing legacy league data remains missing, never reconstructed.
export function leagueClubForSeason(club,season){
 if(season===club.season&&club.league)return copy(club);
 const archive=club.leagueHistory?.find(item=>item.season===season),schedule=club.scheduleHistory?.find(item=>item.season===season);
 if(!archive||!schedule)return null;
 const view={...copy(club),season,name:leagueIdentity(archive.league.managedTeamId)?.name,league:copy(archive.league),schedule:copy(schedule),history:copy(club.history.slice(0,archive.endGame)),pending:null};
 validateClubLeague(view);return view;
}
