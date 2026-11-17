import puppeteer from 'puppeteer-core';
import fs from 'fs';
const css=`@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64')})}*{font-family:TKR,sans-serif!important}`;
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const pos of ['bat','pit'])for(const year of [1,2]){
 const p=await b.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.evaluateOnNewDocument(c=>document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=c;document.head.append(s)}),css);
 await p.goto(process.env.TEST_URL||'http://localhost:8123/');await p.waitForSelector('#new');await p.click('#new');await p.click(`[data-p="${pos}"]`);await p.click('#go');
 await p.evaluate(year=>{const p=window.__game.P;p.week=year*48-1;p.field+=5;window.__game.skipWeeks(0);Math.random=()=>.99;[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click()},year);
 await p.waitForSelector('#okrv');const text=await p.$eval('.modal',e=>e.innerText);const snap=await p.evaluate(()=>JSON.stringify(window.__game.P));
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#okrv');if(await p.$eval('.modal',e=>e.innerText)!==text||await p.evaluate(()=>JSON.stringify(window.__game.P))!==snap)throw Error('review changed');
 await p.screenshot({path:`/downloads/rookie9_review_resume_${pos}_${year}${process.env.TEST_URL?'_live':''}.png`});
 await p.evaluate(()=>Math.random=()=>.99);await p.click('#okrv');await p.waitForSelector('#stat');await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#stat');
 const state=await p.evaluate(()=>window.__game.P);if(state.review||state.week!==year*48||state.pendingEvent)throw Error('bad confirm');if(errs.length)throw Error(errs.join('|'));console.log(pos,year,'review reload identical then cleared',text);await p.close();
}
await b.close();
