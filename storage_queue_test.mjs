import assert from 'node:assert/strict';
const disk=new Map();let fail=false;
globalThis.localStorage={setItem(k,v){if(fail)throw Error('fault');disk.set(k,v)},getItem(k){return disk.get(k)??null},removeItem(k){if(fail)throw Error('fault');disk.delete(k)}};
const G=await import('./src/growth.js');const a=G.newPlayer('기록','contact','bat');G.save(a);a.week=1;fail=true;G.save(a);assert.equal(G.load().week,1);assert.equal(JSON.parse(disk.get('rookie9.save.v1')).week,0);G.clearSave();assert.equal(G.load(),null);assert.equal(G.storageStatus().ok,false);const b=G.newPlayer('다음','contact','pit');G.save(b);assert.equal(G.load().pos,'pit');fail=false;G.retryStorage();assert.equal(JSON.parse(disk.get('rookie9.save.v1')).pos,'pit');assert.equal(G.storageStatus().ok,true);
fail=true;G.pushHof({name:'첫째'});G.pushHof({name:'둘째'});assert.equal(G.hof().length,2);fail=false;G.retryStorage();assert.equal(G.hof().length,2);G.retryStorage();assert.equal(G.hof().length,2);
console.log('latest queued player/deletion/new-player/HoF retry passed');
