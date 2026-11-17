import assert from 'node:assert/strict';import * as G from './src/growth.js';import {EVENTS} from './src/data.js';
let count=0;for(const pos of ['bat','pit'])for(const cap of [false,true])for(const ev of EVENTS)for(let ci=0;ci<ev.choices.length;ci++){
 const p=G.newPlayer('검사','contact',pos);if(cap){p.cond=99;p.money=0;for(const k of Object.keys(p.ev))p.ev[k]=100;for(const k of ['meet','power','speed','arm','field','stamina','velo','ctrl','brk','will','tough','study'])if(k in p)p[k]=99;}
 const before=JSON.stringify(p);const preview=G.eventEffectPreview(p,ev.choices[ci]);assert.equal(JSON.stringify(p),before);
 for(const success of [true,false]){if(!success&&ev.choices[ci].chance===100)continue;Math.random=()=>success?0:.999999;const q=structuredClone(p),r=G.resolveEvent(q,ev,ci);assert.deepEqual(Object.fromEntries(Object.entries(r.fx).filter(([,v])=>v)),success?preview.success:preview.failure);count++;}
}console.log(count,'preview vs actual selected outcome checks; both positions/caps/low money; no preview mutation');
