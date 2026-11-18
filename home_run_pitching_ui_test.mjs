import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');
await p.evaluate(()=>{
 let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};Math.random=()=>draw>=0&&draw++===1?.99:.1;
 window.__dt=1/16;window.__turns=[];window.__homeRunPlay=({runner,t,duration,arrived})=>{
 if(!runner.visible)throw Error('runner invisible');const q=Math.min(4,Math.floor(t/duration*4));if(window.__turns.at(-1)!==q)window.__turns.push(q);
 window.__hrRunner=runner;if(!document.querySelector('#ui').innerText.includes('0 : 0'))throw Error('score before home');
 if(q===2&&!window.__mid){window.__mid=true;window.__dt=.00001;window.__midCapture=true;}
 if(arrived&&!window.__home){if(Math.hypot(runner.position.x,runner.position.z)>.001||runner.userData.legL.rotation.x!==0)throw Error('home endpoint');window.__home=true;window.__dt=.00001;window.__homeCapture=true;}
 };
});
await p.waitForFunction(()=>document.querySelector('#pi').innerText.includes('목표를'));await p.click('#throw');await p.waitForFunction(()=>window.__midCapture,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_hr_pit_second${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/16);await p.waitForFunction(()=>window.__homeCapture,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_hr_pit_home${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);await p.waitForFunction(()=>document.querySelector('#pi').innerText.includes('목표를'),{timeout:60000});
const result=await p.evaluate(()=>({turns:window.__turns,score:document.querySelector('#ui').innerText, fov:window.__rk.camera.fov,hidden:!window.__hrRunner.visible}));if(result.turns.join(',')!=='0,1,2,3,4'||result.fov!==46||!result.hidden||!result.score.includes('0 : 1'))throw Error(JSON.stringify(result));console.log('pitcher HR visits all bases, exact home before next pitch/score, FOV restored',result.turns);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
