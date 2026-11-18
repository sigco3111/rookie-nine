import assert from 'node:assert/strict';import {hitRunStep} from './src/defense.js';
for(const bases of [1,2]){const a=hitRunStep(bases,-1);assert.deepEqual([a.x,a.z],[0,0]);assert(!a.arrived);const b=hitRunStep(bases,1);assert.deepEqual([b.x,b.z],bases===1?[19.4,-19.4]:[0,-38.8]);assert(b.arrived);assert.deepEqual(hitRunStep(bases,2),b);}
const turn=hitRunStep(2,.5);assert.deepEqual([turn.x,turn.z],[19.4,-19.4]);assert(!turn.arrived);assert(Math.abs(turn.yaw+Math.PI*.75)<1e-6);console.log('single/double runner routes, 1B turn, endpoint clamp passed');
