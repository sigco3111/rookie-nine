import assert from 'node:assert/strict';import * as P from './src/pro.js';import * as M from './src/pro-match.js';import {validateClub,createProStore,emptyProSave}from './src/pro-storage.js';
function club(id){let c=P.newClub({id,name:id});for(let i=0;i<10;i++)c=P.admitGraduate(c,{id:id+i,name:id+i,pos:i===9?'pit':'bat',stats:[60,50,40,50,45,70],traits:[],career:{ab:10}}).club;return P.setLineup(c,{batters:c.roster.slice(0,9).map(p=>p.id),starter:id+9});}
const home=club('home'),away=club('away');let pending=P.beginClubGame(home,{id:'g1',opponent:'away'});const enemy=P.beginClubGame(away,{id:'a1',opponent:'home'}).pending,raw=JSON.stringify(pending);
const session=seed=>M.createClubSession(pending.pending,{opponent:enemy,innings:3,seed});let s=session(1);
for(const kind of ['walk','walk','walk','walk',4,'k','out','out'])s=M.stepClubAppearance(s,kind);
assert.equal(s.scores[0],5);assert.equal(s.players[0].home3.rbi,1);assert.equal(s.players[0].home4.rbi,4);assert.equal(s.side,1);assert.equal(s.bases,0);assert.equal(s.outs,0);
assert.throws(()=>M.clubSessionResult(s));assert.throws(()=>M.stepClubAppearance(s,'invented'));assert.throws(()=>session(0));
let interrupted=session(777);for(let i=0;i<11;i++)interrupted=M.stepClubAppearance(interrupted);const reload=M.runClubAuto(M.validateClubSession(JSON.parse(JSON.stringify(interrupted))));assert.deepEqual(reload,M.runClubAuto(session(777)));
let totals=0;
for(let seed=1;seed<=120;seed++){
 const done=M.runClubAuto(session(seed));assert.equal(done.done,true);const r=M.clubSessionResult(done);const c=P.applyClubResult(pending,r).club;validateClub(c);assert.equal(c.roster[9].pro.outs,done.inning*3);assert.equal(Object.keys(r.players).length,10);assert.equal(c.record.games,1);assert.equal(P.applyClubResult(c,r).applied,false);assert.deepEqual(c.roster.map(p=>p.school),home.roster.map(p=>p.school));totals+=r.my;
 for(const side of [0,1]){const rows=Object.values(done.players[side]);assert.equal(rows.filter(r=>'rbi'in r).reduce((a,r)=>a+r.rbi,0),done.scores[side]);assert.equal(rows.find(r=>'er'in r).er,done.scores[1-side]);}
 if(seed===1){const bad=structuredClone(r);delete bad.players.home0;assert.throws(()=>P.applyClubResult(pending,bad));const wrong=structuredClone(r);wrong.my+=1;assert.throws(()=>P.applyClubResult(pending,wrong));}
}
assert.equal(JSON.stringify(pending),raw);assert.equal(M.runClubAuto(session(9),{maxAppearances:1}).done,false);
const batter=pending.pending.batters[0],pit=enemy.pitcher,base=M.appearanceChances(batter,pit,50);const trained=structuredClone(batter);trained.abilities.meet=99;trained.abilities.power=99;const better=M.appearanceChances(trained,pit,50);assert(better.hit>base.hit&&better.hr>base.hr);const p2=structuredClone(pit);p2.abilities.velo=99;p2.abilities.brk=99;assert(M.appearanceChances(batter,p2,50).k>base.k);
console.log('pro all9batters/starter120seed games/boxscore totals/reload continuation/manual outcomes/no archive mutation passed;sample runs',totals);

assert.deepEqual(M.validateClubSession(s),s);
const disk=new Map(),io={getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v)};let store=createProStore(io),root=emptyProSave();root.selected=pending.id;root.clubs=[structuredClone(pending)];root.clubs[0].pending.session=interrupted;store.save(root);store=createProStore(io);const restored=store.load().data.clubs[0].pending.session;assert.deepEqual(restored,interrupted);const final=M.clubSessionResult(M.runClubAuto(restored));store.result(pending.id,final);assert.equal(createProStore(io).load().data.clubs[0].record.games,1);
for(const mutate of [s=>s.scores[0]++,s=>s.state++,s=>s.events[0].runs++,s=>s.order[0]++,s=>s.events[0].rolled='yes']){const bad=structuredClone(interrupted);mutate(bad);assert.throws(()=>M.validateClubSession(bad));}
console.log('pro checkpoint replay validation/store reload/result commit/tamper preservation passed');
const changed=structuredClone(pending);changed.pending.session=structuredClone(interrupted);changed.pending.session.teams[0].batters[0].abilities.meet++;assert.throws(()=>validateClub(changed));

let forced=session(45);forced=M.stepClubAppearance(forced,'walk');forced=M.stepClubAppearance(forced,'forceOut');assert.equal(forced.outs,1);assert.equal(forced.players[0].home1.hits,0);forced=M.stepClubAppearance(forced,'forceSafe');assert.equal(forced.bases,3);forced=M.stepClubAppearance(forced,'infield');assert.equal(forced.players[0].home3.hits,1);assert.equal(forced.bases,7);forced=M.stepClubAppearance(forced,'forceSafe');assert.equal(forced.scores[0],1);assert.deepEqual(M.validateClubSession(forced),forced);assert.throws(()=>M.stepClubAppearance(session(3),'forceOut'));
console.log('forceOut/forceSafe/infield base occupancy and replay passed');
