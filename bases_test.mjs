import assert from 'node:assert/strict';import {advanceBases as adv} from './src/bases.js';
for(let mask=0;mask<8;mask++){
 const original=mask;
 for(let n=1;n<=4;n++){const r=adv(mask,n);assert(r.bases>=0&&r.bases<=7);assert.equal(r.runs+r.bases.toString(2).replaceAll('0','').length,mask.toString(2).replaceAll('0','').length+1);}
 assert.equal(mask,original);assert.deepEqual(adv(mask,'out'),{bases:mask,runs:0});
}
assert.deepEqual(adv(0,2),{bases:2,runs:0});assert.deepEqual(adv(0,3),{bases:4,runs:0});assert.deepEqual(adv(7,4),{bases:0,runs:4});assert.deepEqual(adv(4,'walk'),{bases:5,runs:0});assert.deepEqual(adv(6,'walk'),{bases:7,runs:0});assert.deepEqual(adv(7,'walk'),{bases:7,runs:1});
let mask=0,total=0;for(const n of [3,'walk',2]){const r=adv(mask,n);mask=r.bases;total+=r.runs;}assert.equal(mask,6);assert.equal(total,1);console.log('all8occupancies/all4hits conservation, empty extra base no phantom score, HR, forced walks passed');
