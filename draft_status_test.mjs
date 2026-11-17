import assert from 'node:assert/strict';import * as G from './src/growth.js';import {TRAITS} from './src/data.js';
global.localStorage={getItem(){return null},setItem(){}};
for(const pos of ['bat','pit'])for(let i=0;i<150;i++){
 const p=G.newPlayer('검사','contact',pos);for(const k of (pos==='pit'?['velo','ctrl','brk','field','speed','stamina']:['meet','power','speed','arm','field','stamina']))p[k]=i%100;p.ev.coach=i%100;p.ev.scout=(i*7)%100;p.wins=i%40;p.hr=pos==='bat'?i%15:0;p.traits=Object.keys(TRAITS).filter(t=>TRAITS[t].good).slice(0,i%6);
 const old=G.ovr(p)*.7+p.ev.scout*.2+p.ev.coach*.1+p.traits.filter(t=>TRAITS[t].good).length*1.2+Math.min(8,p.wins*.3)+p.hr*.4;
 const s=G.draftStatus(p);assert.equal(s.score,old);assert(Math.abs(s.parts.reduce((v,[,n])=>v+n,0)-old)<1e-9);p.week=143;G.endWeek(p);assert.equal(p.result.score,Math.round(old));assert.equal(p.result.rank===0,old<54);
}
for(const [score,band] of [[53.999,'지명 기준 미달'],[54,'하위 라운드'],[63.999,'하위 라운드'],[64,'지명'],[74,'상위 지명'],[82,'1순위']]){const p=G.newPlayer('검사','contact');p.ev.coach=p.ev.scout=0;p.hr=(score-G.ovr(p)*.7)/.4;assert.equal(G.draftStatus(p).band,band)}console.log('300 old/new exact formula and actual finish comparisons; score components; rank thresholds passed');
