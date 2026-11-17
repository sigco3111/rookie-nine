import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const css=`@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64')})}*{font-family:TKR,sans-serif!important}`;
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const pos of ['bat','pit'])for(const learn of [false,true]){
 const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.evaluateOnNewDocument(c=>document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=c;document.head.append(s)}),css);
 await p.goto(process.env.TEST_URL||'http://localhost:8123/');await p.waitForSelector('#new');await p.click('#new');await p.click(`[data-p="${pos}"]`);await p.click('#go');
 await p.evaluate(({pos,learn})=>{const p=window.__game.P;p.week=143;p.ab=pos==='pit'?25:80;p.so=34;p.hr=6;if(learn){p[pos==='bat'?'meet':'velo']=65;p.cnt[pos==='bat'?'bat':'velo']=6;}window.__game.skipWeeks(0);Math.random=()=>learn?0:.99;[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click()},{pos,learn});
 if(learn){await p.waitForSelector('#oklearned');await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#oklearned');await p.click('#oklearned');}
 await p.waitForSelector('#again');const text=await p.$eval('#ui',e=>e.innerText),snap=await p.evaluate(()=>JSON.stringify(window.__game.P));
 for(let i=0;i<2;i++){await p.reload();await p.waitForSelector('#cont');if(!await p.$eval('#cont',e=>e.innerText.includes('졸업 결과')))throw Error('wrong title');await p.click('#cont');await p.waitForSelector('#again');if(await p.$eval('#ui',e=>e.innerText)!==text||await p.evaluate(()=>JSON.stringify(window.__game.P))!==snap)throw Error('ending changed');if(await p.evaluate(()=>window.__game.G.hof().length)!==1)throw Error('duplicate hof');}
 if(pos==='pit'&&!text.includes('25이닝 · 34탈삼진'))throw Error('pitcher summary');
 if(!learn)await p.screenshot({path:`/downloads/rookie9_ending_resume_${pos}${process.env.TEST_URL?'_live':''}.png`});
 await p.click('#again');await p.waitForSelector('#go');await p.click('#go');await p.waitForSelector('#stat');if(await p.evaluate(()=>window.__game.P.done||window.__game.P.week!==0||window.__game.G.hof().length!==1))throw Error('restart bad');if(errs.length)throw Error(errs.join('|'));console.log(pos,learn,'ending restored twice; last-week trait chain; one hof; new-player flow');await ctx.close();
}}finally{await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done}}
