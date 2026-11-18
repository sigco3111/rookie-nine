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

await p.waitForFunction(()=>!document.querySelector('#throw').disabled);await new Promise(r=>setTimeout(r,1400));
for(const width of [320,390]){
 await p.setViewport({width,height:844,isMobile:true,hasTouch:true});await p.evaluate(()=>{let b=document.querySelector('.banner');if(!b){b=document.createElement('div');b.className='banner';document.querySelector('#ui').appendChild(b);}b.textContent='1회 0아웃 다음 타자';});
 for(const text of ['공수 교대 · 공격 중','포구 · 송구 준비','홈 세이프 · 야수선택','직구 목표를 정하고 던지기!']){
  const state=await p.evaluate(text=>{const pi=document.querySelector('#pi');pi.textContent=text;const status=pi.getBoundingClientRect(),cnt=document.querySelector('#cnt').getBoundingClientRect(),range=document.createRange();range.selectNodeContents(pi);const boxes=[...range.getClientRects()];return {status:{x:status.x,y:status.y,w:status.width,h:status.height},count:{x:cnt.x,y:cnt.y,w:cnt.width,h:cnt.height},textBoxes:boxes.map(r=>({x:r.x,y:r.y,w:r.width,h:r.height})),width:innerWidth};},text);
  if(state.status.x<0||state.status.x+state.status.w>width||state.count.x+state.count.w>width||state.textBoxes.length!==1||state.status.y<state.count.y+state.count.h&&state.status.x<state.count.x+state.count.w)throw Error(JSON.stringify({width,text,state}));console.log('mobile HUD fits without single syllable wrap',width,text,state.status);
  if(text.includes('공수'))await p.screenshot({path:`/downloads/rookie9_hud_${width}${process.env.TEST_URL?'_live':''}.png`});
 }
}
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
