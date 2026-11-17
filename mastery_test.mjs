import assert from 'node:assert/strict';
import {newPlayer,trainingMastery,doCommand} from './src/growth.js';
import {practicesFor} from './src/data.js';
for(const pos of ['bat','pit'])for(const pr of practicesFor(newPlayer('a','contact',pos)))for(const [count,lv,mul,next] of [[0,1,1,7],[6,1,1,7],[7,2,1.3,16],[15,2,1.3,16],[16,3,1.6,null],[20,3,1.6,null]]){
 const p=newPlayer('a','contact',pos);p.cnt[pr.id]=count;const before=JSON.stringify(p),t=trainingMastery(p,pr.id);assert.equal(JSON.stringify(p),before);assert.deepEqual([t.level,t.multiplier,t.next,t.remaining],[lv,mul,next,next==null?0:next-count]);
}
const old=Math.random;Math.random=()=>.99;
try{for(const pos of ['bat','pit']){const p=newPlayer('a','contact',pos);p.cnt.basic=6;doCommand(p,'basic');assert.equal(trainingMastery(p,'basic').level,2);assert.equal(p.cnt.basic,7);p.injury={name:'타박',weeks:2};doCommand(p,'basic');assert.equal(p.cnt.basic,7);p.injury=null;p.banWeeks=2;doCommand(p,'basic');assert.equal(p.cnt.basic,7);}}finally{Math.random=old}
console.log('mastery boundaries both positions; no mutation; successful/blocked/injured counting');
