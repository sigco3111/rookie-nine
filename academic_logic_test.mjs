import assert from 'node:assert/strict';import {newPlayer,academicStatus,endWeek} from './src/growth.js';
for(const pos of ['bat','pit'])for(const week of [0,7,8,31,32,47,55,103,127,128,143]){
 const p=newPlayer('시험','contact',pos);p.week=week;const s=academicStatus(p);
 if(s.nextWeek==null){assert.ok(week>=128);continue;}
 assert.ok(s.nextWeek>week);p.week=s.nextWeek-1;p.study=s.need;endWeek(p);assert.equal(p.banWeeks,0);assert.equal(p.study,s.need-12);
 const q=newPlayer('미달','contact',pos);q.week=s.nextWeek-1;q.study=s.need-1;endWeek(q);assert.equal(q.banWeeks,3);assert.equal(q.ev.coach,25);
}
console.log('next exam and execution pass/fail boundary across years/positions passed');
