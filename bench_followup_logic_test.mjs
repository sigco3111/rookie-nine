import assert from 'node:assert/strict';
import * as G from './src/growth.js';
import { EVENTS } from './src/data.js';
for(const pos of ['bat','pit'])for(const choice of [0,1]){
 let p=G.newPlayer('검사',pos==='pit'?'contact':'contact',pos);p.week=40;
 const e=EVENTS.find(e=>e.id===(choice===0?'bench_basics_followup':'bench_support_followup'));
 const opposite=EVENTS.find(e=>e.id===(choice===1?'bench_basics_followup':'bench_support_followup'));
 assert.equal(G.eventEligible(p,e),false);
 Math.random=()=>0;G.resolveEvent(p,EVENTS.find(e=>e.id==='bench_resolve'),choice);
 p=JSON.parse(JSON.stringify(p));assert.equal(G.eventEligible(p,e),true);assert.equal(G.eventEligible(p,opposite),false);p.ev={coach:99,captain:99,team:99,scout:99};assert.equal(G.eventEligible(p,e),true);
 p.week=35;assert.equal(G.eventEligible(p,e),false);p.week=36;assert.equal(G.eventEligible(p,e),true);
 for(const ci of [0,1]){const q=structuredClone(p);const f=G.resolveEvent(q,e,ci);assert.equal(f.success,true);assert.equal(G.eventEligible(JSON.parse(JSON.stringify(q)),e),false);assert.equal(q.cnt['ev_'+e.id],1);for(const val of Object.values(f.fx))assert(Number.isFinite(val));assert.equal(q.eventHistory[0].title,e.title)}
}
console.log('both positions / prerequisite choice / minimum week / once / save / effects passed');
