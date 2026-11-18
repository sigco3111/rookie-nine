import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => (errs.push(e.message),console.error('PAGEERROR',e.message))); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;p.brk=60;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');

await p.evaluate(()=>{window.__rk.renderer.setPixelRatio(.5);window.__dt=.125;Math.random=()=>.99;window.__releases=[];window.__pitchRelease=d=>{if(d.phase==='flight'&&!window.__releases.some(v=>v===window.__current))window.__releases.push(window.__current);};});
const types=[['curve','커브',110,1.7595],['slide','슬라이더',118,1.428],['fork','포크',116,1.53],['fast','직구',122,1.275]];
for(const [id,name,velo,duration] of types){
 await p.waitForFunction(()=>!document.querySelector('#throw').disabled);
 await p.click(`[data-t="${id}"]`);
 const ready=await p.$eval('#pi',e=>e.textContent);if(!ready.startsWith(name))throw Error('selection not ready '+ready);
 await p.evaluate(id=>{window.__current=id;window.__lastT=0;window.__pitchRelease=d=>{if(d.phase==='flight'){window.__lastT=d.t;if(d.t>=.2&&!window.__flightShot){window.__flightShot=true;window.__dt=.00001;}}};},id);
 await p.click('#throw');await p.waitForFunction(()=>window.__flightShot,{timeout:30000});
 const fired=await p.$eval('#pi',e=>e.textContent);if(fired!==`${name} ${velo}km/h`)throw Error('wrong selected pitch '+fired);
 if(id==='curve'){await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_pitch_choice${process.env.TEST_URL?'_live':''}.png`});}
 await p.evaluate(()=>{window.__flightShot=true;window.__dt=.125;});
 await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:30000});
 const time=await p.evaluate(()=>window.__lastT);if(time<duration+.15||time>duration+.275)throw Error('wrong flight duration '+id+' '+time);
 console.log('selected pitch used immediately',id,fired,'flight end',time);await p.evaluate(()=>{window.__flightShot=false;});
}
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
