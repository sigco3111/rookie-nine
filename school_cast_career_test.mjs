import assert from 'node:assert/strict';
import {createSchoolCast} from './src/school-cast.js';
import {decodeSchoolRecord} from './src/school-record-read.js';
import {keysOf} from './src/data.js';
const disk=new Map();globalThis.localStorage={getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k)};
const G=await import('./src/growth.js');
const graduates=[{id:'junior',name:'지난 타자',pos:'bat',ovr:80,stats:[80,80,80,80,80,80],traits:[],career:{ab:80,hits:40},team:'지명 이력'},{id:'rival',name:'지난 투수',pos:'pit',ovr:70,stats:[70,70,70,70,70,70],traits:[],career:{ip:18,so:20},team:'다른 지명 이력'}];
const cast=createSchoolCast({junior:graduates[0],rival:graduates[1]}),snapshot=JSON.stringify(cast),source=JSON.stringify(graduates),native=Math.random;let state=1,totalMatches=0,totalAssists=0;
try{for(const pos of ['bat','pit'])for(const seed of [1,77,2026]){state=seed;Math.random=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);disk.set('rookie9.hof.v1',source);disk.set('rookie9.pro.v1','unchanged-pro');let p=G.newPlayer('연속 성장','contact',pos);if(!process.env.NOCAST)p.schoolCast=structuredClone(cast);const expectedCast=JSON.stringify(p.schoolCast);let firstCapWeek=null,matches=0,assists=0,rivals=0,events=0,injured=0,banned=0;assert.equal(G.save(p),true);
for(let week=0;week<144;week++){
 assert.equal(p.week,week);assert.equal(p.done,false);assert.equal(JSON.stringify(p.schoolCast),expectedCast);const cmd=p.injury?'x':p.cond<35?'rest':p.study<G.examNeed(p.week)+5?'study':'basic';if(p.injury)injured++;if(p.banWeeks)banned++;
 const msgs=G.doCommand(p,cmd),assisted=msgs.some(t=>t.includes('후배와 합동훈련'));if(assisted){assert.ok(week>=48);assert.equal(p.schoolCastTrainingWeek,week);assists++;}
 const m=G.matchOfWeek(p);if(m&&!p.injury){const before=p.matchHistory?.length||0;const r=G.simulateMatch(p,m);assert.equal(p.matchHistory.length,Math.min(20,before+1));if(week%48===27&&!process.env.NOCAST){assert.ok(r.title.includes('지난 투수'));rivals++;}matches++;}
 G.endWeek(p);p.review=null;const ev=G.randomEvent(p);if(ev){G.resolveEvent(p,ev,0);events++;}
 assert.equal(G.save(p),true,`save ${pos}/${seed}/${week}`);const raw=disk.get('rookie9.save.v1'),decoded=decodeSchoolRecord(raw,'player');assert.equal(decoded.ok,true,decoded.error);p=G.load();assert.equal(JSON.stringify(p.schoolCast),expectedCast);for(const k of keysOf(p))assert.ok(p[k]>=0&&p[k]<=99);if(firstCapWeek===null&&keysOf(p).every(k=>p[k]===99))firstCapWeek=p.week;assert.equal(disk.get('rookie9.pro.v1'),'unchanged-pro');if(week<143)assert.equal(disk.get('rookie9.hof.v1'),source);
}
assert.equal(p.week,144);assert.equal(p.done,true);assert.equal(p.yearHistory.length,2);assert.equal(p.finalYearReview.year,3);const h=G.hof();assert.equal(h.length,3);assert.deepEqual(h.slice(0,2),graduates);assert.equal(h[2].pos,pos);assert.equal(h[2].yearReviews.length,3);assert.equal(decodeSchoolRecord(disk.get('rookie9.hof.v1'),'hof').ok,true);const savedArchive=disk.get('rookie9.hof.v1');G.save(p);G.load();assert.equal(disk.get('rookie9.hof.v1'),savedArchive);if(!process.env.NOCAST){assert.ok(assists>0);assert.ok(rivals>0);}else {assert.equal(assists,0);assert.equal(rivals,0);}totalMatches+=matches;totalAssists+=assists;console.log({pos,seed,matches,assists,rivals,events,injured,banned,firstCapWeek,cast:!process.env.NOCAST,overall:p.result.ovr});}}
finally{Math.random=native;}
console.log('six sequential144week careers: actualcommands/matches/events/allweeks-save-reload/junior-rival/yearreviews/graduation-once/sourceprefix-proexact passed',{totalMatches,totalAssists});
