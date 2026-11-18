import assert from 'node:assert/strict';import {hitRunStep} from './src/defense.js';
for(const bases of [1,2,3]){const a=hitRunStep(bases,-1);assert.deepEqual([a.x,a.z],[0,0]);assert(!a.arrived);const b=hitRunStep(bases,1);assert.deepEqual([b.x,b.z],bases===1?[19.4,-19.4]:bases===2?[0,-38.8]:[-19.4,-19.4]);assert(b.arrived);assert.deepEqual(hitRunStep(bases,2),b);}
const turn=hitRunStep(2,.5);assert.deepEqual([turn.x,turn.z],[19.4,-19.4]);assert(!turn.arrived);assert(Math.abs(turn.yaw+Math.PI*.75)<1e-6);console.log('single/double runner routes, 1B turn, endpoint clamp passed');

const turn2=hitRunStep(3,2/3);assert.deepEqual([turn2.x,turn2.z],[0,-38.8]);console.log('triple route via1B/2B to3B passed');
