import assert from 'node:assert/strict';
import * as P from './src/pro.js';import * as S from './src/pro-storage.js';
let failed=false;const disk=new Map([['rookie9.save.v1','school-data'],['rookie9.hof.v1','archive-data']]);
const io={getItem:k=>disk.get(k)??null,setItem(k,v){if(failed)throw Error('quota');disk.set(k,v);}};
let store=S.createProStore(io),root=S.emptyProSave();assert.deepEqual(store.load().data,root);
let club=P.newClub({id:'club',name:'검증 구단'});
for(let i=0;i<10;i++)club=P.admitGraduate(club,{id:'p'+i,name:'선수'+i,pos:i===9?'pit':'bat',stats:[60,50,40,50,45,70],traits:[],career:{ab:10}}).club;
club=P.setLineup(club,{batters:club.roster.slice(0,9).map(p=>p.id),starter:'p9'});
root={schema:1,revision:0,clubs:[club],selected:'club'};assert.equal(store.save(root).ok,true);root=store.load().data;
club=P.beginClubGame(club,{id:'s1-g1',opponent:'상대'});root.clubs[0]=club;store.save(root);root=store.load().data;
store=S.createProStore(io);assert.deepEqual(store.load().data.clubs[0].pending,club.pending);
const before=disk.get(S.PRO_KEY),outcome={id:'s1-g1',my:3,opp:1,players:{p0:{ab:3,hits:1,hr:1,rbi:3},p9:{outs:8,so:4,hitsAllowed:2,er:1}}};
failed=true;assert.equal(store.result('club',outcome).ok,false);assert.equal(disk.get(S.PRO_KEY),before);assert.equal(store.load().data.clubs[0].record.games,1);assert.equal(store.result('club',outcome).applied,false);assert.equal(store.retry(),false);
// A close before a successful write keeps the old pending match, not half-applied totals.
const closed=S.createProStore(io);assert.equal(closed.load().data.clubs[0].record.games,0);assert.equal(closed.load().data.clubs[0].pending.id,'s1-g1');
failed=false;assert.equal(store.retry(),true);store=S.createProStore(io);assert.equal(store.result('club',outcome).applied,false);assert.equal(store.load().data.clubs[0].record.wins,1);assert.equal(store.load().data.clubs[0].roster[9].pro.outs,8);
for(const mutate of [r=>r.schema=99,r=>r.clubs[0].record.wins++,r=>r.clubs[0].roster[0].pro.hits++,r=>r.clubs[0].applied=[],r=>r.clubs[0].history[0].participants[0]='absent',r=>r.clubs.push(r.clubs[0]),r=>r.selected='absent']){const bad=store.load().data;mutate(bad);const raw=JSON.stringify(bad);disk.set(S.PRO_KEY,raw);assert.equal(S.createProStore(io).load().ok,false);assert.equal(disk.get(S.PRO_KEY),raw);disk.set(S.PRO_KEY,JSON.stringify(root));store=S.createProStore(io);store.result('club',outcome);}
for(const raw of ['{','null','[]']){disk.set(S.PRO_KEY,raw);assert.equal(S.createProStore(io).load().ok,false);assert.equal(disk.get(S.PRO_KEY),raw);}
assert.throws(()=>S.createProStore(io).save(root));
disk.delete(S.PRO_KEY);const a=S.createProStore(io),b=S.createProStore(io),stale=b.load().data;a.save(S.emptyProSave());assert.throws(()=>b.save(stale));
const current=a.load().data;failed=true;a.save(current);failed=false;b.save(b.load().data);const external=disk.get(S.PRO_KEY);assert.equal(a.retry(),false);assert.equal(a.status().conflict,true);assert.equal(disk.get(S.PRO_KEY),external);
assert.equal(disk.get('rookie9.save.v1'),'school-data');assert.equal(disk.get('rookie9.hof.v1'),'archive-data');
assert.throws(()=>P.applyClubResult(club,{...outcome,players:{p0:{outs:1}}}));assert.throws(()=>P.applyClubResult(club,{...outcome,players:{p9:{ab:1}}}));
console.log('pro save atomic result/reload/quota retry/duplicate/corrupt preservation/school isolation passed');
