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
await p.waitForSelector('#new');await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');await p.evaluate(()=>window.__rk.renderer.setPixelRatio(.5));

await p.evaluate(()=>{window.__rk.renderer.setPixelRatio(.5);Math.random=()=>.5;window.__steps=[];window.__start=performance.now();window.__gaps=[];let last=performance.now();const sample=n=>{window.__gaps.push(n-last);last=n;window.__raf=requestAnimationFrame(sample);};window.__raf=requestAnimationFrame(sample);window.__defensePlay=d=>{if(window.__steps.at(-1)!==d.phase)window.__steps.push(d.phase);if(!document.querySelector('#throw').disabled)throw Error('active during fieldplay');window.__race=d.race;};window.__groundReturn=d=>{if(window.__steps.at(-1)!=='return')window.__steps.push('return');if(!document.querySelector('#throw').disabled)throw Error('active during return');if(d.k>=1){window.__arrived=true;if(d.ball.position.distanceTo(d.target)>1e-6)throw Error('not glove');}};});
await p.waitForFunction(()=>!document.querySelector('#throw').disabled);const begin=Date.now();await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled);await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:90000});const state=await p.evaluate(()=>({steps:window.__steps,arrived:window.__arrived,race:window.__race,outs:document.querySelectorAll('#cnt .dot.s.on').length,dt:window.__dt,pi:document.querySelector('#pi').innerText,frameStats:{frames:window.__gaps.length,meanMs:window.__gaps.reduce((a,b)=>a+b,0)/window.__gaps.length,over50:window.__gaps.filter(n=>n>50).length}}));state.wallSeconds=(Date.now()-begin)/1000;if(state.steps.join(',')!=='approach,transfer,throw,receive,return'||!state.arrived||state.outs!==1||state.dt!==undefined||!state.pi.includes('목표를'))throw Error(JSON.stringify(state));
await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_natural_pitch_ready${process.env.TEST_URL?'_live':''}.png`});console.log('unaccelerated frame-clock one-pitch flow',state);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
