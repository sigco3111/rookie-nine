import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const checkpointFile=process.env.CHECKPOINT;const saved=checkpointFile&&fs.existsSync(checkpointFile)?JSON.parse(fs.readFileSync(checkpointFile,'utf8')):null;let chunked=false;
const css=`@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64')})}*{font-family:TKR,sans-serif!important}`;
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const pos=process.env.POS||'bat',seed=+(process.env.SEED||42);const p=await b.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
try{
 await p.evaluateOnNewDocument(c=>document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=c;document.head.append(s)}),css);
 const restoreScript=saved?await p.evaluateOnNewDocument(raw=>localStorage.setItem('rookie9.save.v1',raw),saved.raw):null;
 await p.goto(process.env.TEST_URL||'http://localhost:8123/');if(restoreScript)await p.removeScriptToEvaluateOnNewDocument(restoreScript.identifier);if(saved){await p.waitForSelector('#cont');await p.click('#cont');}else{await p.waitForSelector('#new');await p.click('#new');await p.click(`[data-p="${pos}"]`);await p.click('#go');}
 async function setup(){await p.evaluate(seed=>{let n=seed;Math.random=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};window.__rk.renderer.setPixelRatio(.1);},seed);}
 await setup();const {log=[],reloads=[],direct=[],ledger=[],interrupts=[],restarts=[],modalCounts={}}=saved||{};
 for(let step=0;step<800;step++){
  const state=await p.evaluate(()=>({week:window.__game.P.week,done:window.__game.P.done,again:!!document.querySelector('#again'),pending:document.querySelector('.modal')?.innerText.slice(0,70)}));
  if(state.again)break;
  if(process.env.INTERRUPT){
   const kind=await p.evaluate(()=>['#auto','#ok','#oklearned','#okrv','#okev','.modal [data-c]'].find(sel=>document.querySelector(sel))||null);
   if(kind&&!interrupts.some(x=>x.kind===kind)){
    const snap=await p.evaluate(()=>JSON.stringify(window.__game.P));await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector(kind);if(await p.evaluate(()=>JSON.stringify(window.__game.P))!==snap)throw Error('pending reload changed '+kind);interrupts.push({kind,week:state.week});await setup();
    if(kind==='#okev')await p.screenshot({path:`/downloads/rookie9_career_${pos}_pending_event${process.env.TEST_URL?'_live':''}.png`});
   }
  }
  const year=Math.floor(state.week/48)+1;
  if(process.env.MIXED&&await p.$('#auto')&&!direct.some(d=>d.year===year)){
   const before=await p.evaluate(()=>{const p=window.__game.P;return {ab:p.ab,hits:p.hits,so:p.so,wins:p.wins,losses:p.losses};});
   if(process.env.RESTART){
    const beforeStart=await p.evaluate(()=>structuredClone(window.__game.P));
    await p.evaluate(({pos,year})=>{
     window.__dt=.5;window.__careerTimer=window.setTimeout;window.setTimeout=(fn,ms,...a)=>window.__careerTimer(fn,Math.min(ms,1),...a);Math.random=()=>pos==='pit'?.99:.01;window.__restartReached=null;
     const hook=d=>{if(year===1&&d.phase==='flight'&&!window.__restartReached)window.__restartReached={phase:'pitch-flight',t:d.t};};window.__batPitchRelease=hook;window.__pitchRelease=hook;
     new MutationObserver(()=>{const label=document.querySelector('#pi')?.innerText;if(year===2&&document.querySelectorAll('#cnt .s.on').length>=1)window.__restartReached={phase:'count-recorded',label};if(year===3&&(pos==='bat'?label==='삼진 아웃':label?.startsWith('삼진 · 1아웃')))window.__restartReached={phase:'appearance-completed',label};}).observe(document.querySelector('#ui')||document.body,{childList:true,subtree:true});
    },{pos,year});
    await p.click('#play');if(pos==='pit')await p.evaluate(()=>{window.__careerPitch=setInterval(()=>{const b=document.querySelector('#throw');if(b&&!b.disabled)b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));},20);});
    await p.waitForFunction(()=>!!window.__restartReached,{timeout:90000,polling:10});
    const checkpoint=await p.evaluate(()=>({phase:window.__restartReached,player:structuredClone(window.__game.P),label:document.querySelector('#pi')?.innerText}));beforeStart.pendingMatch.started=true;
    if(JSON.stringify(checkpoint.player)!==JSON.stringify(beforeStart))throw Error('partial game mutated career '+year);
    await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#play');const resumed=await p.evaluate(()=>({player:structuredClone(window.__game.P),text:document.querySelector('.modal').innerText}));
    if(JSON.stringify(resumed.player)!==JSON.stringify(beforeStart)||!resumed.text.includes('중단 전 투구·타석·점수는 복구되지 않습니다.'))throw Error('restart state/warning mismatch '+year);
    restarts.push({year,week:state.week,phase:checkpoint.phase,ab:resumed.player.ab,hits:resumed.player.hits,so:resumed.player.so,played:resumed.player.wins+resumed.player.losses});
    if(year===3)await p.screenshot({path:`/downloads/rookie9_career_${pos}_restart_prompt${process.env.TEST_URL?'_live':''}.png`});await setup();
   }
   await p.evaluate(pos=>{window.__dt=.5;window.__careerTimer=window.setTimeout;window.setTimeout=(fn,ms,...a)=>window.__careerTimer(fn,Math.min(ms,10),...a);Math.random=()=>pos==='pit'?.99:.01;},pos);
   if(process.env.VARIED&&pos==='bat')await p.evaluate(year=>{window.__dbgIn=true;window.__force=year===2?{angle:0,launch:15,v:35}:year===3?{angle:0,launch:30,v:50}:null;if(year>1)window.__dbgShot=(st,T)=>{if(st.swingT==null&&st.t>=T-.4)document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));};},year);
   await p.click('#play');if(pos==='pit'&&process.env.VARIED){
    await p.waitForSelector('#throw');await p.evaluate(()=>{let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};window.__mode='ball';Math.random=()=>{if(window.__mode==='ball'||window.__mode==='strike')return .99;if(draw<0)return .1;const n=draw++;if(window.__mode==='single')return .1;if(window.__mode==='hr')return n===1?.99:.1;if(window.__mode==='foul')return n===0?.99:.1;return n<2?.99:window.__mode==='air'?.6:.5;};window.__variedLabels=[];new MutationObserver(()=>{const t=document.querySelector('#pi')?.innerText;if(window.__variedLabels.at(-1)!==t)window.__variedLabels.push(t);}).observe(document.querySelector('#pi'),{childList:true,subtree:true});});
    const plan=['ball','ball','ball','ball','single','foul','hr','ground','air','ground','single','ground','air','ground','strike','strike','strike','ground','air'];
    for(const mode of plan){
     await p.waitForFunction(()=>document.querySelector('#ok')||(document.querySelector('#throw')&&!document.querySelector('#throw').disabled),{timeout:45000});if(await p.$('#ok'))break;
     await p.evaluate(mode=>{window.__mode=mode;const {THREE,camera}=window.__rk;const v=new THREE.Vector3(mode==='ball'?.8:0,mode==='ball'?1.6:.9,0).project(camera),cv=document.querySelector('#gl'),r=cv.getBoundingClientRect();cv.dispatchEvent(new PointerEvent('pointerdown',{clientX:(v.x+1)*r.width/2+r.left,clientY:(1-v.y+.1)*r.height/2+r.top,bubbles:true}));window.dispatchEvent(new PointerEvent('pointerup'));},mode);
     await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#ok')||!document.querySelector('#throw')?.disabled,{timeout:45000});
    }
   }else if(pos==='pit')await p.evaluate(()=>{window.__careerPitch=setInterval(()=>{const b=document.querySelector('#throw');if(b&&!b.disabled)b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));},20);});
   await p.waitForFunction(()=>!!document.querySelector('#ok'),{timeout:90000,polling:30}).catch(async e=>{throw Error('direct game failed year'+year+':'+e.message)});
   const after=await p.evaluate(()=>{const p=window.__game.P;return {r:p.pendingResult.result,ab:p.ab,hits:p.hits,so:p.so,wins:p.wins,losses:p.losses,history:p.matchHistory[0]};});
   if(pos==='pit'&&process.env.VARIED){after.labels=await p.evaluate(()=>window.__variedLabels);if(after.r.ip!==3||after.r.hitsAllowed!==3||after.r.so!==1||!after.labels.some(x=>x?.includes('볼넷'))||!after.labels.some(x=>x?.includes('홈런')))throw Error('varied game mismatch '+JSON.stringify(after));await p.screenshot({path:`/downloads/rookie9_career_pit_varied_year${year}${process.env.TEST_URL?'_live':''}.png`});}
   const r=after.r;if(after.ab-before.ab!==(pos==='pit'?r.ip:r.ab)||after.hits-before.hits!==(pos==='pit'?r.hitsAllowed:r.hits)||after.so-before.so!==(pos==='pit'?r.so:0)||after.wins+after.losses-before.wins-before.losses!==1)throw Error('direct delta mismatch '+JSON.stringify({before,after}));
   const snap=await p.evaluate(()=>JSON.stringify(window.__game.P));await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#ok');if(await p.evaluate(()=>JSON.stringify(window.__game.P))!==snap)throw Error('direct result reload changed');await setup();
   direct.push({year,week:state.week,before,after});console.log('direct game carried',pos,year,r);if(checkpointFile){fs.writeFileSync(checkpointFile,JSON.stringify({raw:await p.evaluate(()=>JSON.stringify(window.__game.P)),log,reloads,direct,ledger,interrupts,restarts,modalCounts}));chunked=true;break;}continue;
  }
  if(await p.$('#ok'))ledger.push(await p.evaluate(()=>structuredClone(window.__game.P.pendingResult.result)));
  const action=await p.evaluate(()=>{
   for(const sel of ['#auto','#ok','#oklearned','#okrv','#okev','.modal [data-c]']){const el=document.querySelector(sel);if(el){el.click();return {type:sel,week:window.__game.P.week};}}
   const q=window.__game.P;if(q.done)throw Error('done without ending');
   const choices=[...document.querySelectorAll('.cmd')].filter(b=>!b.disabled);let name=q.injury?'치료':q.study<42?'공부':q.cond<45?'휴식':q.week%7===0?'멘탈훈련':q.week%5===0?'잡무':q.pos==='pit'?(q.week%2?'제구연습':'구속업'):(q.week%2?'배팅연습':'파워훈련');
   const el=choices.find(b=>b.innerText.includes(name))||choices.find(b=>b.innerText.includes('리프레쉬'));if(!el)throw Error('no command '+name);el.click();return {type:name,week:q.week};
  });
  log.push(action);modalCounts[action.type]=(modalCounts[action.type]||0)+1;
  const current=await p.evaluate(()=>window.__game.P.week);
  if(current<state.week||current>state.week+1)throw Error('week jump');
  if(current!==state.week&&[24,48,72,96,120,144].includes(current)){
   const before=await p.evaluate(()=>JSON.stringify(window.__game.P));await p.reload();await p.waitForSelector('#cont');await p.click('#cont');
   if(await p.evaluate(()=>JSON.stringify(window.__game.P))!==before)throw Error('reload changed career '+current);reloads.push(current);await setup();
   if(current===48||current===96)await p.screenshot({path:`/downloads/rookie9_career_${pos}_week${current}${process.env.TEST_URL?'_live':''}.png`});
  }
 }
 if(!chunked){await p.waitForSelector('#again');const end=await p.evaluate(()=>({p:window.__game.P,h:window.__game.G.hof()}));if(end.p.week!==144||!end.p.done||end.h.length!==1||end.p.yearHistory.length!==2||end.h[0].yearReviews.length!==3)throw Error('bad ending '+JSON.stringify(end));
 const sums={ab:0,hits:0,hr:0,rbi:0,so:0,wins:0,losses:0};for(const r of ledger){sums.ab+=pos==='pit'?(r.ip||0):(r.ab||0);sums.hits+=pos==='pit'?(r.hitsAllowed||0):(r.hits||0);sums.hr+=r.hr||0;sums.rbi+=r.rbi||0;sums.so+=r.so||0;sums[r.win?'wins':'losses']++;}for(const k of Object.keys(sums))if(end.p[k]!==sums[k])throw Error('final ledger mismatch '+k+' '+end.p[k]+' != '+sums[k]);
 const archived=end.h[0].career;for(const [k,v]of Object.entries(pos==='pit'?{ip:sums.ab,so:sums.so,hitsAllowed:sums.hits,wins:sums.wins,losses:sums.losses}:{ab:sums.ab,hits:sums.hits,hr:sums.hr,rbi:sums.rbi,wins:sums.wins,losses:sums.losses}))if(archived[k]!==v)throw Error('HoF ledger mismatch '+k);
 for(const [k,v]of Object.entries(end.p)){if(typeof v==='number'&&!Number.isFinite(v))throw Error('nonfinite '+k);}
 await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_career_${pos}${process.env.MIXED?'_mixed':''}${process.env.VARIED?'_varied':''}${process.env.INTERRUPT?'_interrupt':''}${process.env.RESTART?'_restart':''}_ending${process.env.TEST_URL?'_live':''}.png`});
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#again');if(await p.evaluate(()=>window.__game.G.hof().length)!==1)throw Error('duplicate hof');
 await p.click('#again');await p.waitForSelector('#inh');await p.click(`[data-p="${pos}"]`);await p.select('#inh','0');await p.click('#go');await p.waitForSelector('#stat');const next=await p.evaluate(()=>window.__game.P);if(next.week!==0||next.done||!next.log.some(x=>x.includes('선배의 가르침')))throw Error('inheritance not applied');
 if(process.env.RESTART&&restarts.length!==3)throw Error('missing restarts');if(process.env.MIXED&&direct.length!==3)throw Error('missing direct years');if(process.env.INTERRUPT&&interrupts.length!==6)throw Error('missing pending type '+JSON.stringify(interrupts));const report={pos,seed,restarts,interrupts,direct,ledger,sums,mode:process.env.MIXED?'UI career with one controlled direct game per year, seeded auto remainder, no week/stat injection':'UI commands, seeded random, automatic matches, no week/stat injection',modalCounts,reloads,week:end.p.week,stats:{ovr:end.h[0].ovr,wins:end.p.wins,losses:end.p.losses,ab:end.p.ab,hits:end.p.hits,traits:end.p.traits,result:end.p.result},events:end.p.eventHistory?.length,matchHistory:end.p.matchHistory?.length,yearReviews:end.h[0].yearReviews.length,inheritance:next.log.slice(0,2),errors:errs};fs.writeFileSync(`/downloads/rookie9_career_${pos}${process.env.MIXED?'_mixed':''}${process.env.VARIED?'_varied':''}${process.env.INTERRUPT?'_interrupt':''}${process.env.RESTART?'_restart':''}_report${process.env.TEST_URL?'_live':''}.json`,JSON.stringify(report,null,2));if(errs.length)throw Error(errs.join('|'));console.log(JSON.stringify(report,null,2));if(checkpointFile)fs.unlinkSync(checkpointFile);}
}finally{await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}}
