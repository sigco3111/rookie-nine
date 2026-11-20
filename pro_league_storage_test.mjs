import assert from 'node:assert/strict';
import {newClub} from './src/pro.js';
import {fillClubRoster} from './src/pro-teammates.js';
import {LEAGUE_IDENTITIES} from './src/pro-league-identities.js';
import {leagueClubForSeason,validateClubLeague} from './src/pro-league.js';
import {createProStore,PRO_KEY,validateProSave,emptyProSave} from './src/pro-storage.js';
import {createProController} from './src/pro-controller.js';
import {prepareNextClubFixture} from './src/pro-fixtures.js';
import {createOwnClub} from './src/pro-bootstrap.js';
const disk=new Map([['rookie9.save.v1','untouched-school'],['rookie9.hof.v1','untouched-archive']]);let quota=false,writes=0;
const io={getItem:k=>disk.get(k)??null,setItem(k,v){writes++;if(quota)throw Error('quota');disk.set(k,v);}};
let store=createProStore(io);
const start=()=>{const root=emptyProSave();root.clubs=[fillClubRoster(newClub({id:'owned',name:'明示 구단'}))];root.selected='owned';store.save(root);};
const enter=id=>store.enterLeague(store.load().data.clubs[0].id,id,{expectedRoot:JSON.stringify(store.load().data),confirmed:true});
const club=()=>store.load().data.clubs[0];
// Validate every approved spelling and that caller must explicitly select one of the eight teams.
assert.deepEqual(LEAGUE_IDENTITIES.map(t=>t.name),['서울 곰돌이','부산 갈매기','광주 호랑이','대구 사자','대전 독수리','인천 불독','수원 몬스터','창원 디노']);
start();assert.throws(()=>enter('unknown'));assert.equal(club().name,'明示 구단');
assert.throws(()=>store.enterLeague('owned','seoul',{expectedRoot:JSON.stringify(store.load().data)}));
const stale=JSON.stringify(store.load().data);store.save(store.load().data);assert.throws(()=>store.enterLeague('owned','seoul',{expectedRoot:stale,confirmed:true}));
quota=true;const beforeEnter=disk.get(PRO_KEY);assert.equal(enter('incheon').ok,false);assert.equal(disk.get(PRO_KEY),beforeEnter);assert.equal(club().name,'인천 불독');quota=false;assert.equal(store.retry(),true);store=createProStore(io);
assert.equal(club().schedule.fixtures.length,14);assert.equal(club().league.results.length,0);assert.equal(club().league.teams.length,8);assert.ok(!club().schedule.fixtures.some(f=>f.name==='인천 불독'));
for(let round=0;round<14;round++){
 const c=club();prepareNextClubFixture(store,c.id,c.schedule.fixtures);const ctl=createProController(store,c.id);ctl.auto(2000);
 const old=disk.get(PRO_KEY),beforeWrites=writes;quota=round===3;const doneSession=ctl.current(),saved=ctl.finish();assert.equal(writes,beforeWrites+1);
 const next=club();assert.equal(validateClubLeague(next).completedRounds,round+1);assert.equal(next.league.results.length,(round+1)*4);
 if(quota){assert.equal(saved.ok,false);assert.equal(disk.get(PRO_KEY),old);assert.equal(store.status().pending,true);assert.throws(()=>enter('incheon'));quota=false;assert.equal(store.retry(),true);}
 const oldApplied=disk.get(PRO_KEY);assert.equal(store.result(c.id,{id:doneSession.gameId}).applied,false);assert.equal(disk.get(PRO_KEY),oldApplied);assert.throws(()=>ctl.finish());
 store=createProStore(io);assert.equal(store.load().ok,true);assert.equal(club().record.games,round+1);
 const raw=disk.get(PRO_KEY);validateProSave(JSON.parse(raw));assert.equal(disk.get(PRO_KEY),raw);
}
const seasonOne=structuredClone(club()),oldLedger=JSON.stringify(seasonOne.history),oldLeague=JSON.stringify(seasonOne.league),oldRoster=JSON.stringify(seasonOne.roster);
assert.equal(validateClubLeague(seasonOne).done,true);assert.equal(seasonOne.league.results.length,56);
for(const mutate of [c=>c.league.results.pop(),c=>c.league.teams.reverse(),c=>c.league.schedule.rounds[0].games[0].seed++,c=>c.league.results[0].homeScore++]){const bad=store.load().data;mutate(bad.clubs[0]);assert.throws(()=>store.save(bad));}
const corruptedAI=store.load().data;const ai=corruptedAI.clubs[0].league.results.find(r=>r.home!=='incheon'&&r.away!=='incheon');ai.homeScore+=100;assert.throws(()=>validateProSave(corruptedAI));
enter('incheon');assert.equal(club().season,2);assert.equal(club().league.results.length,0);assert.equal(club().schedule.startGame,14);assert.equal(JSON.stringify(club().history),oldLedger);assert.equal(JSON.stringify(club().roster),oldRoster);assert.equal(JSON.stringify(club().leagueHistory[0].league),oldLeague);
const next=club();prepareNextClubFixture(store,next.id,next.schedule.fixtures);const ctl=createProController(store,next.id);ctl.auto(2000);ctl.finish();assert.equal(club().record.games,15);assert.equal(club().league.results.length,4);assert.deepEqual(club().history.slice(0,14),seasonOne.history);assert.deepEqual(club().scheduleHistory[0],seasonOne.schedule);
const sourceForView=JSON.stringify(club());const seasonOneView=leagueClubForSeason(club(),1);assert.equal(validateClubLeague(seasonOneView).completedGames,56);assert.equal(JSON.stringify(seasonOneView.league),oldLeague);assert.equal(JSON.stringify(club()),sourceForView);assert.equal(leagueClubForSeason(club(),99),null);
const badArchive=store.load().data;badArchive.clubs[0].leagueHistory[0].league.results=[];assert.throws(()=>store.save(badArchive));
// Existing six-game schedules/pending/history are not converted in place.
disk.delete(PRO_KEY);store=createProStore(io);createOwnClub(store);const legacyStart=JSON.stringify(club());assert.throws(()=>enter('busan'));assert.equal(JSON.stringify(club()),legacyStart);
for(let i=0;i<6;i++){const c=club();prepareNextClubFixture(store,c.id,c.schedule.fixtures);if(i===0){const raw=disk.get(PRO_KEY);assert.throws(()=>enter('busan'));assert.equal(disk.get(PRO_KEY),raw);}const ctl=createProController(store,c.id);ctl.auto(2000);ctl.finish();}
const legacy=structuredClone(club());enter('busan');assert.equal(club().season,2);assert.equal(club().name,'부산 갈매기');assert.deepEqual(club().history,legacy.history);assert.deepEqual(club().roster,legacy.roster);assert.deepEqual(club().scheduleHistory[0],legacy.schedule);assert.equal(club().schedule.startGame,6);assert.equal(club().league.results.length,0);
// A quota-pending complete round cannot overwrite another instance's newer record.
const c=club();prepareNextClubFixture(store,c.id,c.schedule.fixtures);const ctl2=createProController(store,c.id);ctl2.auto(2000);const diskBefore=disk.get(PRO_KEY);quota=true;assert.equal(ctl2.finish().ok,false);quota=false;const competing=JSON.parse(diskBefore);competing.revision++;disk.set(PRO_KEY,JSON.stringify(competing));const competingRaw=disk.get(PRO_KEY);assert.equal(store.retry(),false);assert.equal(store.status().conflict,true);assert.equal(disk.get(PRO_KEY),competingRaw);assert.equal(club().league.results.length,4);
assert.equal(disk.get('rookie9.save.v1'),'untouched-school');assert.equal(disk.get('rookie9.hof.v1'),'untouched-archive');
console.log('eight-team persistedround:14games56results/onewriteown+3AI/quota-retry/conflict/reload/idempotency/season2archiveexact/legacy6pendingpreserved/confirmednames/sourceisolation passed');
