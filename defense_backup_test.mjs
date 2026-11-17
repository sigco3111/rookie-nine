import assert from 'node:assert/strict';
import {defensePaths,defenseStep} from './src/defense.js';
const homes=[[-24,-24],[-11,-36],[11,-36],[24,-24],[-48,-65],[0,-78],[48,-65]];
for(const target of [[0,0],[-25,-40],[30,-70],[0,-180],[150,-30],[-160,-170]]){
 const paths=defensePaths(homes,...target);assert.equal(paths.length,2);assert.notEqual(paths[0].index,paths[1].index);
 for(const path of paths){assert(Math.hypot(...path.target)<=91.00001);for(const t of [0,.1,.2,.4,1,3,100]){const s=defenseStep(path,t);assert(Number.isFinite(s.x)&&Number.isFinite(s.z));assert(Math.hypot(s.x-path.home[0],s.z-path.home[1])<=Math.max(0,t-path.delay)*path.speed+.00001);if(t===100){assert.equal(s.moving,false);assert.equal(s.remaining,0);assert(Math.hypot(s.x-path.target[0],s.z-path.target[1])<.00001)}}}
}
assert.equal(defensePaths([],0,0).length,0);assert.equal(defensePaths([[0,0]],0,0).length,1);console.log('distinct pursuit/backup; bounded targets; delayed speed-limited movement; arrival stop; empty/single squad passed');
