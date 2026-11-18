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
await p.evaluate(()=>{const p=window.__game.P;p.week=7;Math.random=()=>.99;window.__game.skipWeeks(0);[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click();window.__dt=.125;window.__initialFov=window.__rk.camera.fov;window.__walkPlay=d=>{if(d.t>d.duration*.4&&!window.__walkShot){window.__walkShot=true;window.__dt=.00001;}if(d.t>=d.duration){window.__walkArrived=true;Math.random=()=>.01;}};window.__followupRun=d=>{if(!window.__walkArrived)throw Error('scoring before walk');if(d.t>d.duration*.5&&!window.__scoreShot){window.__scoreShot=true;window.__dt=.00001;}if(d.arrived){if(Math.hypot(d.runner.position.x,d.runner.position.z)>.001)throw Error('home endpoint');window.__home=true;}};});
await p.waitForSelector('#play');await p.click('#play');await p.waitForFunction(()=>window.__walkShot,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_bat_walk${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=.125);await p.waitForFunction(()=>window.__scoreShot,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_followup_run${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=.125);await p.waitForSelector('#ok',{timeout:60000});const r=await p.evaluate(()=>({result:window.__game.P.pendingResult.result,home:window.__home,fov:window.__rk.camera.fov,original:window.__initialFov}));if(!r.home||r.result.ab!==0||r.result.hits!==0||r.fov!==r.original)throw Error(JSON.stringify(r));console.log('batter4ball walk/1B followup score/home before result',r);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
