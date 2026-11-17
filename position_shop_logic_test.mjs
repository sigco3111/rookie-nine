import assert from 'node:assert/strict';
import {newPlayer,buy} from './src/growth.js';import {itemsFor,itemDescription,ITEMS} from './src/data.js';
for(const pos of ['bat','pit']) {
 const p=newPlayer('상점','contact',pos);p.money=1000;
 assert.equal(itemsFor(p).some(i=>i.id==='bat'),pos==='bat');
 const before=p.money;const r=buy(p,'bat');
 if(pos==='pit'){assert.equal(p.money,before);assert.equal('meet'in p,false);assert.ok(r.includes('사용할 수 없는'));}else {assert.equal(p.meet,44);assert.equal(p.money,before-80);}
 const stamina=p.stamina,power=p.power;buy(p,'meal');assert.equal(p.stamina,stamina+1);assert.equal(p.power,pos==='pit'?undefined:power+1);assert.equal(itemDescription(p,ITEMS.find(i=>i.id==='meal')),pos==='pit'?'체력 +1':'파워 +1, 체력 +1');
 for(const i of itemsFor(p))buy(p,i.id);
 for(const [k,v]of Object.entries(p))if(typeof v==='number')assert.ok(Number.isFinite(v),k);
 p.money=0;assert.ok(buy(p,'glove').includes('부족'));assert.ok(buy(p,'no-such-item').includes('사용할 수 없는'));
 assert.equal(JSON.parse(JSON.stringify(p)).stamina,p.stamina);
}
console.log('position shop: eligibility/effects/cost/descriptions/finiteness/JSON passed');
