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
if(process.env.FAIL_MODEL){await p.setRequestInterception(true);p.on('request',r=>r.url().includes('/models/player.fbx')?r.abort():r.continue());}
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');
await p.evaluate(()=>{Math.random=()=>.99;window.__dt=.125;window.__rk.renderer.setPixelRatio(.5);const timer=window.setTimeout;window.setTimeout=(f,ms,...a)=>timer(f,ms===900?15000:ms,...a);window.__outs=()=>[...document.querySelectorAll('#cnt .dot')].filter(e=>e.style.background==='rgb(229, 72, 77)').length;window.__pitchReturn=d=>{if(window.__outs()!==0)throw Error('out before return');};new MutationObserver(()=>{if([...document.querySelectorAll('*')].some(e=>e.children.length===0&&e.textContent==='삼진!')){if(window.__outs()!==1)throw Error('strikeout banner before out display');if(document.querySelector('#pi').textContent!=='삼진 · 1아웃')throw Error('stale phase at strikeout');window.__strikeoutCapture=true;window.__dt=.00001;}}).observe(document.querySelector('#ui'),{childList:true,subtree:true});});
for(let i=0;i<3;i++){await p.waitForFunction(()=>!document.querySelector('#throw').disabled);await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled);if(i<2)await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:30000});}
await p.waitForFunction(()=>window.__strikeoutCapture,{timeout:30000});await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_strikeout_out_count${process.env.TEST_URL?'_live':''}.png`});const outs=await p.evaluate(()=>window.__outs());if(outs!==1||await p.$eval('#pi',e=>e.textContent)!=='삼진 · 1아웃')throw Error('wrong out or stale phase');console.log('third strike after return updates out during strikeout banner',outs);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
