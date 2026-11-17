import assert from 'node:assert/strict';import {newPlayer,buy} from './src/growth.js';
for(const pos of ['bat','pit']){
 const p=newPlayer('상한','contact',pos);p.money=1000;p.cond=98;buy(p,'drink');assert.deepEqual(p.purchaseReport.fx,{cond:1,money:-20});
 p.field=99;buy(p,'glove');assert.deepEqual(p.purchaseReport.fx,{money:-80});assert.equal(p.purchaseReport.gear,true);
 p.traits=['cold','sleep'];buy(p,'cure');assert.deepEqual(p.purchaseReport.cured,['cold']);
 buy(p,'insure');assert.equal(p.purchaseReport.insured,true);
 const report=JSON.parse(JSON.stringify(p)).purchaseReport;assert.deepEqual(report,p.purchaseReport);
 p.money=0;buy(p,'drink');assert.equal(p.purchaseReport,null);
}
console.log('actual purchase deltas caps/gear/cure/insurance/failure/JSON passed');
