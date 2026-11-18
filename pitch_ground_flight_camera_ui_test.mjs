import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => {errs.push(e.message);console.log(e.message)}); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.waitForSelector('#new');await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');await p.evaluate(()=>window.__rk.renderer.setPixelRatio(.5));

await p.evaluate(()=>{window.__rk.renderer.setPixelRatio(.5);Math.random=()=>.5;window.__dt=.125;window.__pitchGroundFlight=d=>{if(d.camera.fov!==76||d.camera.position.y!==42||!d.runner.visible)throw Error('ground not wide');d.camera.updateMatrixWorld();const v=d.runner.position.clone().project(d.camera);if(Math.abs(v.x)>1||Math.abs(v.y)>1)throw Error('runner outside screen');if(d.t>.5&&!window.__capture){window.__capture=true;window.__dt=.00001;}};window.__groundReturn=d=>{if(d.k>=1)window.__arrived=true;};});
await p.waitForFunction(()=>!document.querySelector('#throw').disabled);await p.click('#throw');await p.waitForFunction(()=>window.__capture,{timeout:60000});await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_pitch_ground_flight${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=.125);await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:60000});const state=await p.evaluate(()=>({arrived:window.__arrived,fov:window.__rk.camera.fov,outs:document.querySelectorAll('#cnt .dot.s.on').length}));if(!state.arrived||state.fov!==46||state.outs!==1)throw Error(JSON.stringify(state));console.log('wide ground flight runner on screen→return→next ready',state);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
