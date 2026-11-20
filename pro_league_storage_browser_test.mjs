import assert from 'node:assert/strict';import puppeteer from 'puppeteer-core';import {spawn} from 'node:child_process';
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'pipe'});let browser;
try{
 browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const page=await browser.newPage();
 await page.goto('http://localhost:8123/');await page.waitForSelector('#new');await page.click('#new');await page.click('#go');
 const school=await page.evaluate(()=>localStorage.getItem('rookie9.save.v1'));
 await page.evaluate(async()=>{
  const S=await import('/src/pro-storage.js'),P=await import('/src/pro.js'),T=await import('/src/pro-teammates.js');const store=S.createProStore(localStorage),root=S.emptyProSave();
  root.clubs=[T.fillClubRoster(P.newClub({id:'browser-league',name:'선택 전'}))];root.selected='browser-league';store.save(root);const current=store.load().data;
  store.enterLeague('browser-league','suwon',{expectedRoot:JSON.stringify(current),confirmed:true});
 });
 for(let round=0;round<14;round++){
  const summary=await page.evaluate(async round=>{
   const S=await import('/src/pro-storage.js'),F=await import('/src/pro-fixtures.js'),C=await import('/src/pro-controller.js');const store=S.createProStore(localStorage),club=store.load().data.clubs[0];
   F.prepareNextClubFixture(store,club.id,club.schedule.fixtures);const ctl=C.createProController(store,club.id);ctl.auto(2000);const original=localStorage.getItem(S.PRO_KEY),native=Storage.prototype.setItem;let writes=0;
   Storage.prototype.setItem=function(k,v){if(k===S.PRO_KEY){writes++;if(round===5)throw new DOMException('QA','QuotaExceededError');}return native.call(this,k,v);};
   let saved;try{saved=ctl.finish();}finally{Storage.prototype.setItem=native;}
   if(writes!==1)throw Error('round was not one write');
   if(round===5){if(saved.ok||localStorage.getItem(S.PRO_KEY)!==original||!store.status().pending)throw Error('quota did not retain atomic round');if(!store.retry())throw Error('retry failed');}
   const c=store.load().data.clubs[0];return {games:c.record.games,results:c.league.results.length,name:c.name};
  },round);
  assert.deepEqual(summary,{games:round+1,results:(round+1)*4,name:'수원 몬스터'});
  await page.reload();await page.waitForSelector('#cont');
  const restored=await page.evaluate(async()=>{const S=await import('/src/pro-storage.js'),L=await import('/src/pro-league.js');const read=S.createProStore(localStorage).load();if(!read.ok)throw Error('round reload failed');return L.validateClubLeague(read.data.clubs[0]);});
  assert.equal(restored.completedRounds,round+1);assert.ok(restored.rows.every(r=>r.games===round+1));
 }
 const final=await page.evaluate(async()=>{
  const S=await import('/src/pro-storage.js');const store=S.createProStore(localStorage),root=store.load().data,club=root.clubs[0],snapshot=JSON.stringify(club.league),history=JSON.stringify(club.history);
  store.enterLeague(club.id,'suwon',{expectedRoot:JSON.stringify(root),confirmed:true});const next=store.load().data.clubs[0];
  if(JSON.stringify(next.leagueHistory[0].league)!==snapshot||JSON.stringify(next.history)!==history)throw Error('archive changed');
  return {school:localStorage.getItem('rookie9.save.v1'),season:next.season,results:next.league.results.length,games:next.record.games};
 });
 assert.deepEqual(final,{school,season:2,results:0,games:14});
 console.log('realChromium actuallocalStorage eightteam14rounds56results/reloadEVERYround/quotaonewrite+retry/nextseasonarchiveexact/schoolunchanged passed; no UI or device-feel claim');
}finally{await browser?.close();server.kill('SIGTERM');await new Promise(r=>server.exitCode!==null?r():server.once('exit',r));}
