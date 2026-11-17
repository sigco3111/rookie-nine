import assert from 'node:assert/strict';
import {newPlayer,doCommand,endWeek} from './src/growth.js';
Math.random=()=>.99;
for(const pos of ['bat','pit']) {
 const p=newPlayer('신인','contact',pos);doCommand(p,'chore');
 assert.deepEqual(p.commandReport.fx,{cond:-6,money:8,coach:3,team:2});
 endWeek(p);assert.equal(p.cond,67);assert.equal(p.commandReport.fx.cond,-6);
 const q=JSON.parse(JSON.stringify(p));assert.deepEqual(q.commandReport,p.commandReport);
 q.ev.coach=q.ev.team=100; q.stamina=99;doCommand(q,'chore');assert.equal(q.commandReport.fx.coach,undefined);assert.equal(q.commandReport.fx.team,undefined);
 q.cond=98;doCommand(q,'rest');assert.deepEqual(q.commandReport.fx,{cond:1});
 q.banWeeks=3;doCommand(q,'cond');assert.deepEqual(q.commandReport.fx,{cond:-3});
 q.injury={name:'타박',weeks:1};q.cond=98;doCommand(q,'x');assert.deepEqual(q.commandReport.fx,{cond:1});assert.equal(q.injury,null);
 q.cond=60;q.tough=98;q.banWeeks=0;doCommand(q,'cond');assert.equal(q.commandReport.fx.tough,1);assert.equal(q.commandReport.fx.captain,2);
}
console.log('command-only actual deltas: batter/pitcher/caps/ban/hospital/JSON/week recovery passed');
