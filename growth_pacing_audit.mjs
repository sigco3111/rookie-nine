// Measurement, not a target balance specification. No production values are changed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {keysOf} from './src/data.js';
import {createSchoolCast} from './src/school-cast.js';
import {decodeSchoolRecord} from './src/school-record-read.js';
const disk=new Map();
globalThis.localStorage={getItem:k=>disk.get(k)??null,setItem:(k,v)=>disk.set(k,v),removeItem:k=>disk.delete(k)};
const G=await import(process.env.GROWTH_MODULE||'./src/growth.js');
const graduates=[{id:'junior',name:'측정 후배',pos:'bat',ovr:80,stats:[80,80,80,80,80,80],traits:[],career:{ab:80,hits:40},team:'졸업 지명'},{id:'rival',name:'측정 라이벌',pos:'pit',ovr:70,stats:[70,70,70,70,70,70],traits:[],career:{ip:18,so:20},team:'졸업 지명'}];
const archive=JSON.stringify(graduates),castTemplate=createSchoolCast({junior:graduates[0],rival:graduates[1]});
const skillTargets=p=>p.pos==='pit'?[['ctrl','ctrl'],['brk','brk'],['velo','velo']]:[['meet','bat'],['power','power'],['speed','run']];
const policies={
 basic:p=>'basic',
 specialist:p=>{const targets=p.pos==='pit'?[['ctrl','ctrl'],['brk','brk'],['velo','velo']]:[['meet','bat'],['power','power'],['speed','run']];return targets.find(([key])=>p[key]<99)?.[1]||'basic';},
 target85:p=>skillTargets(p).find(([key])=>p[key]<85)?.[1]||'basic',
 rotate:p=>{const targets=skillTargets(p);const lowest=[...targets].sort((a,b)=>p[a[0]]-p[b[0]])[0];return lowest[1];},
 balanced:p=>{const map=p.pos==='pit'?{velo:'velo',ctrl:'ctrl',brk:'brk',speed:'run',field:'defense',stamina:'cond'}:{meet:'bat',power:'power',speed:'run',arm:'arm',field:'defense',stamina:'cond'};const lowest=keysOf(p).reduce((a,b)=>p[a]<=p[b]?a:b);return map[lowest];},
 rest:p=>'rest'
};
const activePolicies=process.env.EXTENDED?Object.keys(policies):['basic','specialist','rest'];
const eventModes=process.env.EXTENDED?['first','alternate']:['first'];
const stages=['command','match','week','event'];
function run({pos,seed,cast,policy,eventMode='first'}){
 let randomState=seed>>>0;
 Math.random=()=>((randomState=(Math.imul(randomState,1664525)+1013904223)>>>0)/4294967296);
 disk.clear();disk.set('rookie9.hof.v1',archive);disk.set('rookie9.pro.v1','untouched-pro');
 let p=G.newPlayer('성장 속도 측정','contact',pos);if(cast)p.schoolCast=structuredClone(castTemplate);
 const keys=keysOf(p),initial=Object.fromEntries(keys.map(k=>[k,p[k]])),deltas=Object.fromEntries(stages.map(s=>[s,Object.fromEntries(keys.map(k=>[k,0]))]));
 const commands={},years=[],milestones={ovr60:null,ovr80:null,ovr90:null,all99:null};
 let matches=0,assists=0,injuredWeeks=0,banWeeks=0,events=0;
 const measure=(stage,fn)=>{const before=keys.map(k=>p[k]);const out=fn();keys.forEach((k,i)=>deltas[stage][k]+=p[k]-before[i]);return out;};
 assert.equal(G.save(p),true);
 for(let week=0;week<144;week++){
  assert.equal(p.week,week);assert.equal(p.done,false);
  if(p.injury)injuredWeeks++;if(p.banWeeks)banWeeks++;
  const id=p.injury?'rest':p.cond<35?'rest':p.study<G.examNeed(p.week)+5?'study':policies[policy](p);
  commands[id]=(commands[id]||0)+1;
  const messages=measure('command',()=>G.doCommand(p,id));
  if(messages.some(m=>m.includes('후배와 합동훈련')))assists++;
  const match=G.matchOfWeek(p);if(match&&!p.injury){measure('match',()=>G.simulateMatch(p,match));matches++;}
  measure('week',()=>G.endWeek(p));p.review=null;
  const event=G.randomEvent(p);if(event){measure('event',()=>G.resolveEvent(p,event,eventMode==='alternate'?week%event.choices.length:0));events++;}
  const overall=G.ovr(p);
  for(const [mark,threshold]of [['ovr60',60],['ovr80',80],['ovr90',90]])if(milestones[mark]===null&&overall>=threshold)milestones[mark]=p.week;
  if(milestones.all99===null&&keys.every(k=>p[k]===99))milestones.all99=p.week;
  if(p.week%48===0)years.push({week:p.week,overall,abilities:Object.fromEntries(keys.map(k=>[k,p[k]])),capped:keys.filter(k=>p[k]===99).length});
  assert.equal(G.save(p),true);
  assert.equal(decodeSchoolRecord(disk.get('rookie9.save.v1'),'player').ok,true);
  p=G.load();assert.equal(disk.get('rookie9.pro.v1'),'untouched-pro');
  if(week<143)assert.equal(disk.get('rookie9.hof.v1'),archive);
  for(const k of keys)assert.ok(Number.isFinite(p[k])&&p[k]>=0&&p[k]<=99);
 }
 assert.equal(p.done,true);assert.equal(p.week,144);assert.equal(p.yearHistory.length,2);assert.equal(p.finalYearReview.year,3);
 const hof=G.hof();assert.equal(hof.length,3);assert.deepEqual(hof.slice(0,2),graduates);assert.equal(hof[2].ovr,G.ovr(p));
 const final=Object.fromEntries(keys.map(k=>[k,p[k]]));
 for(const k of keys)assert.equal(stages.reduce((n,s)=>n+deltas[s][k],initial[k]),final[k],`attribution ${k}`);
 const savedArchive=disk.get('rookie9.hof.v1');G.save(p);G.load();assert.equal(disk.get('rookie9.hof.v1'),savedArchive);
 if(!cast)assert.equal(assists,0);
 return {pos,seed,cast,policy,eventMode,initial,years,final,overall:G.ovr(p),rank:p.result.rank,draftScore:p.result.score,draftParts:G.draftStatus(p).parts,milestones,commands,matches,assists,injuredWeeks,banWeeks,events,deltas};
}
const originalRandom=Math.random,rows=[];
const seeds=[1,7,19,31,77,101,311,509,1024,2026,4093,9991];
try{
 for(const pos of ['bat','pit'])for(const policy of activePolicies)for(const cast of [false,true])for(const seed of seeds)for(const eventMode of eventModes)rows.push(run({pos,seed,cast,policy,eventMode}));
 const repeat=run({pos:'pit',seed:77,cast:true,policy:'specialist'});
 assert.deepEqual(repeat,rows.find(r=>r.pos==='pit'&&r.seed===77&&r.cast&&r.policy==='specialist'));
}finally{Math.random=originalRandom;}
const range=a=>[Math.min(...a),Math.max(...a)];
const summaries=[];
for(const pos of ['bat','pit'])for(const policy of activePolicies)for(const cast of [false,true])for(const eventMode of eventModes){
 const group=rows.filter(r=>r.pos===pos&&r.policy===policy&&r.cast===cast&&r.eventMode===eventMode),caps=group.filter(r=>r.milestones.all99!==null);
 const deltaTotals=Object.fromEntries(stages.map(s=>[s,group.reduce((sum,r)=>sum+Object.values(r.deltas[s]).reduce((a,b)=>a+b,0),0)]));
 summaries.push({pos,policy,cast,eventMode,runs:group.length,yearOverall:[0,1,2].map(i=>range(group.map(r=>r.years[i].overall))),graduateAll99:caps.length,all99Week:caps.length?range(caps.map(r=>r.milestones.all99)):null,topPick:group.filter(r=>r.rank===1).length,abilityDeltaTotals:deltaTotals});
}
const report={schema:1,kind:'rookie9-pacing-measurement',runtimeLabel:process.env.RUNTIME_LABEL||'unchanged-runtime',seeds,eventModes,activePolicies,notes:['Current engine measurement, not target thresholds or a balance fix.','Same seed is not a paired causal comparison: strategies/cast change RNG consumption.','Event modes are first choice or week-modulo option count; automatic school games, adaptive rest/study, no shopping/inheritance.','Rest policy means no chosen practice, not no event ability rewards.','All144weeks save/load each career; not manual144week UI play or real phone performance.','Deltas are net clamped ability changes by stage; junior bonus is included in command.'],summaries,rows};
if(process.env.REPORT)fs.writeFileSync(process.env.REPORT,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({careers:rows.length,weeks:rows.length*144,summaries},null,2));
console.log('pacing matrix: stage deltas reconcile; everyweek save/reload; yearreview+graduation once; archive/pro isolation; deterministic repeat passed');
