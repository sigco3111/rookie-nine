import assert from 'node:assert/strict';
import {candidateTrainingGain as gain}from './src/training-gain-candidate.js';
for(const base of [0,1,4])for(const multiplier of [.25,.5,1,1.6])for(const current of [0,30,59,60,74,75,89,90,98,99])for(const basic of [false,true]){
 const input={base,multiplier,current,basic},raw=JSON.stringify(input),values=Array.from({length:1000},(_,i)=>gain({...input,roll:(i+.5)/1000}));
 assert.equal(JSON.stringify(input),raw);assert.ok(values.every(v=>Number.isInteger(v)&&v>=0&&v<=99-current));
 const taper=current>=90?.25:current>=75?.45:current>=60?.7:1,expected=Math.min(99-current,base*multiplier*taper*(basic?.72:1));
 assert.ok(Math.abs(values.reduce((a,b)=>a+b,0)/values.length-expected)<.0011);
}
for(const roll of [0,.1,.5,.9,.999]){
 const at=current=>gain({base:1,multiplier:.8,current,basic:true,roll});
 assert.ok(at(60)<=at(59));assert.ok(at(75)<=at(74));assert.ok(at(90)<=at(89));assert.equal(at(99),0);
 assert.ok(gain({base:4,multiplier:.8,current:80,roll})>=gain({base:1,multiplier:.8,current:80,roll}));
}
for(const bad of [{base:-1},{multiplier:Infinity},{current:100},{roll:1},{roll:-.1},{current:NaN}])assert.throws(()=>gain({base:1,multiplier:1,current:30,roll:.2,...bad}));
assert.equal(gain({base:1,multiplier:.5,current:95,roll:.59}),0,'no unrelated60% minimum overwhelms highstat taper');
console.log('experimental gain:unbiased fractionalrounding/monotonic taper/cap/badinput/specialistperstatadvantage/noinputmutation passed. NOT production approval.');
