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
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');
await p.evaluate(()=>{Math.random=()=>.99;window.__dt=.25;window.__walks=[];window.__walkPlay=d=>{if(window.__walks.at(-1)!==d.mask)window.__walks.push(d.mask);if(d.mask===1&&d.t>d.duration*.45&&!window.__walkShot){window.__walkShot=true;window.__dt=.00001;}if(d.t>=d.duration){if(Math.hypot(d.runner.position.x-19.4,d.runner.position.z+19.4)>.001)throw Error('walk1B endpoint');if(d.mask===1&&Math.hypot(d.baseRunners[0].position.x,d.baseRunners[0].position.z+38.8)>.001)throw Error('forced2B endpoint');window.__walkArrived=true;}};});
for(const target of [1,3]){
 for(let pitch=0;pitch<4;pitch++){
  await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:30000});
  await p.evaluate(()=>{const c=document.querySelector('#gl');c.dispatchEvent(new PointerEvent('pointerdown',{clientX:10,clientY:600,bubbles:true}));window.dispatchEvent(new PointerEvent('pointerup'));});await p.click('#throw');
  await p.waitForFunction(()=>document.querySelector('#throw').disabled);
  if(pitch===3&&target===3){await p.waitForFunction(()=>window.__walkShot,{timeout:30000});await p.screenshot({path:`/downloads/rookie9_walk_forced${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=.25);}
  await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:30000});
 }
 const state=await p.evaluate(()=>({mask:[...document.querySelectorAll('#bases [data-base]')].reduce((m,b)=>m|(b.dataset.occupied==='true'?1<<(Number(b.dataset.base)-1):0),0),score:document.querySelector('#sc').textContent,arrived:window.__walkArrived,fov:window.__rk.camera.fov}));if(state.mask!==target||!state.score.includes('0 : 0')||!state.arrived||state.fov!==46)throw Error(JSON.stringify(state));console.log('4ball walk destination',state);
}
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
