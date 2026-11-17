import puppeteer from 'puppeteer-core';
import fs from 'fs';
const css=`@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64')})}*{font-family:TKR,sans-serif!important}`;
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [pos,cap] of [['bat',false],['pit',false],['bat',true]]){
 const p=await b.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.evaluateOnNewDocument(c=>document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=c;document.head.append(s)}),css);
 await p.goto(process.env.TEST_URL||'http://localhost:8123/');await p.waitForSelector('#new');await p.click('#new');await p.click(`[data-p="${pos}"]`);await p.click('#go');
 await p.evaluate(()=>{const p=window.__game.P;p.week=16;p.ev.coach=p.ev.captain=p.ev.team=42;window.__game.skipWeeks(0);Math.random=()=>0;[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click()});
 await p.waitForSelector('[data-c]');
 const beforeChoice=await p.evaluate(()=>JSON.stringify(window.__game.P));const choiceText=await p.$eval('.modal',e=>e.innerText);
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('[data-c]');
 if(await p.evaluate(()=>JSON.stringify(window.__game.P))!==beforeChoice||await p.$eval('.modal',e=>e.innerText)!==choiceText)throw Error('choice changed on reload');
 if(await p.evaluate(()=>window.__game.P.cnt.ev_regular_resolve))throw Error('choice applied early');
 await p.screenshot({path:`/downloads/rookie9_choice_resume_${pos}${cap?'_cap':''}${process.env.TEST_URL?'_live':''}.png`});
 await p.evaluate(()=>Math.random=()=>0);
 if(cap)await p.evaluate(()=>{const p=window.__game.P;p.ev.team=p.ev.captain=100;p.cond=99;});await p.click('[data-c="1"]');await p.waitForSelector('#okev');
 let txt=await p.$eval('.modal',e=>e.innerText);if(!txt.includes('선택:')||!txt.includes('실제 변화'))throw Error(txt);
 if(cap&&!txt.includes('수치 변화 없음'))throw Error('missing zero result');
 const snapshot=await p.evaluate(()=>JSON.stringify(window.__game.P));
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#okev');
 if(await p.evaluate(()=>JSON.stringify(window.__game.P))!==snapshot)throw Error('reapplied result');
 await p.screenshot({path:`/downloads/rookie9_event_resume_${pos}${cap?'_cap':''}${process.env.TEST_URL?'_live':''}.png`});
 await p.click('#okev');await p.waitForSelector('#stat');if(await p.evaluate(()=>window.__game.P.pendingEventResult))throw Error('not cleared');
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#stat');if(await p.$('#okev'))throw Error('replayed after confirm');
 const state=await p.evaluate(()=>window.__game.P);if(state.cnt.ev_regular_resolve!==1||state.eventHistory.length!==1||state.week!==17)throw Error('duplicate effects');
 if(errs.length)throw Error(errs.join('|'));console.log(pos,'choice reload/result reload/confirm/reload no duplicate',txt);await p.close();
}
await b.close();
