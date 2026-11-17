import assert from 'node:assert/strict';
import {newPlayer,eventEligible,resolveEvent,isRegular,randomEvent} from './src/growth.js';
import {EVENTS,keysOf} from './src/data.js';
const yes=EVENTS.find(e=>e.id==='regular_resolve'),no=EVENTS.find(e=>e.id==='bench_resolve');
for(const pos of ['bat','pit']) {
 const p=newPlayer('기회','contact',pos);p.week=16;for(const k of keysOf(p))p[k]=30;assert.equal(isRegular(p),false);assert.equal(eventEligible(p,yes),false);assert.equal(eventEligible(p,no),true);
 p.week=15;assert.equal(eventEligible(p,no),false);p.week=16;
 p.ev.coach=p.ev.captain=p.ev.team=42;assert.equal(eventEligible(p,yes),true);assert.equal(eventEligible(p,no),false);
 Math.random=()=>0;assert.equal(randomEvent(p).id,yes.id);const r=resolveEvent(p,yes,1);assert.equal(r.fx.team,5);assert.equal(eventEligible(p,yes),false);
 const q=JSON.parse(JSON.stringify(p));assert.equal(eventEligible(q,yes),false);
 q.week=48;assert.equal(isRegular(q),false);assert.equal(eventEligible(q,no),true);resolveEvent(q,no,1);assert.equal(eventEligible(q,no),false);
 Math.random=()=>.25;assert.equal(randomEvent(q),null);
}
console.log('selection scenarios: both positions/status/min/once/JSON/year change/event rate gate passed');
