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
const launch=+(process.env.LAUNCH||35);
await p.evaluate((launch)=>{const p=window.__game.P;p.week=7;Math.random=()=>.99;window.__game.skipWeeks(0);[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click();window.__force={angle:-20,launch,v:35};window.__dbgIn=true;window.__dbgShot=(st,T)=>{if(st.swingT==null&&st.t>=T-.375)document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));};},launch);
await p.waitForSelector('#play');
await p.evaluate(()=>{window.__dt=1/30;window.__airPhases=[];window.__airOutPlay=d=>{
 if(window.__airPhases.at(-1)!==d.phase)window.__airPhases.push(d.phase);
 if(d.phase==='flight'&&d.k>.6&&!window.__flew){window.__flew=true;window.__dt=.00001;window.__flightCapture=true;}
 if(d.phase==='caught'&&!window.__caught){const {THREE}=window.__rk;const glove=d.collector.userData.glove.localToWorld(new THREE.Vector3(0,0,.22));if(glove.distanceTo(d.ball.position)>1e-6)throw Error('not glove-held');window.__caught=true;window.__dt=.00001;window.__catchCapture=true;}
};});
await p.click('#play');await p.waitForFunction(()=>window.__flightCapture,{timeout:60000});
await p.screenshot({path:`/downloads/rookie9_airout_flight_${launch}${process.env.TEST_URL?'_live':''}.png`});
await p.evaluate(()=>window.__dt=1/30);await p.waitForFunction(()=>window.__catchCapture,{timeout:60000});
await p.screenshot({path:`/downloads/rookie9_airout_catch_${launch}${process.env.TEST_URL?'_live':''}.png`});
await p.evaluate(()=>window.__dt=1/30);await p.waitForSelector('#ok',{timeout:60000});
const check=await p.evaluate(()=>{const result=window.__game.P.pendingResult.result;const fs=[];window.__rk.scene.traverse(o=>{if(o.userData.home)fs.push(o)});return {result,phases:window.__airPhases,reset:fs.every(o=>o.position.x===o.userData.home[0]&&o.position.z===o.userData.home[1])};});
if(check.result.ab!==1||check.result.hits||check.result.hr||!check.reset||check.phases.join(',')!=='flight,caught')throw Error(JSON.stringify(check));
if(errs.length)throw Error(errs.join('|'));console.log('batting air out after glove hold, full1PA and reset',launch,check);await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
