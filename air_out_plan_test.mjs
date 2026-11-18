import assert from 'node:assert/strict';
import {airOutPlan,airOutStep} from './src/defense.js';
const ps=[[-24,-24],[-11,-36],[11,-36],[24,-24],[-48,-65],[0,-78],[48,-65]];
for(const landing of [[0,-18],[45,-70],[-15,-42],[0,-80]]){
 const before=JSON.stringify(ps),p=airOutPlan(ps,landing,1.5);assert.equal(JSON.stringify(ps),before);
 const nearest=ps.map(([x,z],i)=>({i,d:Math.hypot(x-landing[0],z-landing[1])})).sort((a,b)=>a.d-b.d)[0];
 assert.equal(p.collector,nearest.i);assert(p.duration>=1.5);assert(p.duration>=nearest.d/7+.18);
 assert.equal(airOutStep(p,0).k,0);assert.equal(airOutStep(p,.18).k,0);assert.equal(airOutStep(p,p.duration).k,1);
 const end=airOutStep(p,p.duration+5);assert.deepEqual([end.x,end.z],landing);
 const t=.5,a=airOutStep(p,t),b=airOutStep(p,t+.01);assert(Math.hypot(b.x-a.x,b.z-a.z)<=.070000001);
}
assert.equal(airOutPlan([], [0,0]),null);console.log('air-out nearest collector, min duration/travel speed, delay, endpoint, no mutation passed');
