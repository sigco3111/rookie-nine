import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const css=`@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64')})}*{font-family:TKR,sans-serif!important}`;
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const pos of ['bat','pit']){
 const p=await b.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.evaluateOnNewDocument(c=>document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=c;document.head.append(s)}),css);
 await p.goto(process.env.TEST_URL||'http://localhost:8123/');await p.waitForSelector('#new');await p.click('#new');await p.click(`[data-p="${pos}"]`);await p.click('#go');
 await p.evaluate(()=>{const p=window.__game.P;p.week=7;p.ev={coach:70,captain:70,team:70,scout:20};Math.random=()=>.6;document.querySelectorAll('.cmd')[0].click()});
 await p.waitForSelector('#auto');const prompt=await p.$eval('.modal',e=>e.innerText),snap=await p.evaluate(()=>JSON.stringify(window.__game.P));
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#auto');if(await p.$eval('.modal',e=>e.innerText)!==prompt||await p.evaluate(()=>JSON.stringify(window.__game.P))!==snap)throw Error('prompt changed');
 await p.click('#play');await p.waitForSelector('.scoreb');
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#auto');
 const restored=await p.evaluate(()=>window.__game.P),original=JSON.parse(snap);original.pendingMatch.started=true;if(JSON.stringify(restored)!==JSON.stringify(original))throw Error('prematch state changed');if(!await p.$eval('.modal',e=>e.innerText.includes('점수는 복구되지 않습니다')))throw Error('no warning');
 await p.screenshot({path:`/downloads/rookie9_match_checkpoint_${pos}${process.env.TEST_URL?'_live':''}.png`});
 await p.evaluate(()=>Math.random=()=>.6);await p.click('#auto');await p.waitForSelector('#ok');const result=await p.evaluate(()=>JSON.stringify(window.__game.P));if(JSON.parse(result).pendingMatch)throw Error('pending match not cleared');
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#ok');if(await p.evaluate(()=>JSON.stringify(window.__game.P))!==result)throw Error('result changed');await p.evaluate(()=>Math.random=()=>.99);await p.click('#ok');await p.waitForSelector('#stat');
 const done=await p.evaluate(()=>window.__game.P);if(done.week!==8||done.pendingMatch||done.pendingResult||done.wins+done.losses!==1)throw Error('duplicate/missing week or game');await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#stat');if(await p.$('#auto'))throw Error('repeated prompt');if(errs.length)throw Error(errs.join('|'));console.log(pos,'same prompt -> interrupted direct match -> prematch restore -> auto -> result restore -> single game and week');await p.close();
}}finally{await b.close();if(server){const exited=new Promise(resolve=>server.once('exit',resolve));server.kill('SIGTERM');await exited}}
