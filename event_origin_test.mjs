import assert from 'node:assert/strict';
import * as G from './src/growth.js';
import { EVENTS } from './src/data.js';
Math.random=()=>0;
for(const pos of ['bat','pit'])for(const e of EVENTS.filter(e=>e.req)){
 const p=G.newPlayer('검사','contact',pos),source=EVENTS.find(x=>x.id===e.req);
 assert.equal(G.eventOrigin(p,e),null);
 G.resolveEvent(p,source,e.reqChoice?.[1]??0);
 const origin=G.eventOrigin(p,e);assert.equal(origin.title,source.title);assert.equal(origin.choice,e.reqChoice?source.choices[e.reqChoice[1]].label:'');
 const result=G.resolveEvent(p,e,0);assert.deepEqual(result.origin,origin);assert.deepEqual(JSON.parse(JSON.stringify(p)).eventHistory[0].origin,origin);
 if(e.reqChoice){p.eventChoices[e.reqChoice[0]]=[1-e.reqChoice[1]];assert.equal(G.eventOrigin(p,e),null)}
}
assert.equal(G.eventOrigin(G.newPlayer('검사','contact'),EVENTS.find(e=>!e.req)),null);
console.log('both positions / all followup origins / precise choice or no invented choice / missing and conflicting prerequisite / result and JSON history passed');
