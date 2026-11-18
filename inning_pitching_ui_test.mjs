import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const mask=Number(process.env.MASK??1);
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => {errs.push(e.message);console.log('PAGEERROR',e.message)}); p.on('console', (m) => { if(m.text()==='CHANGE_CAPTURE')p.screenshot({path:`/downloads/rookie9_inning_change${process.env.TEST_URL?'_live':''}.png`});if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
console.log('opening game');await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.waitForSelector('#new');await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');


await p.evaluate(()=>{window.__dt=.5;window.__rk.renderer.setPixelRatio(.6);let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};const timer=window.setTimeout;window.setTimeout=(fn,ms,...args)=>timer(fn,window.__changeSeen&&ms===1000&&!window.__delayed?(window.__delayed=true,8000):ms,...args);window.__setup=true;Math.random=()=>{if(draw<0||window.__setup)return .1;const n=draw++;return n<2?.99:.5;};window.__inningChange=d=>{if(document.querySelector('#pi').textContent!=='공수 교대 · 우리 팀 자동 공격')throw Error('missing automatic offense phase');const occupied=[...document.querySelectorAll('#bases [data-base]')].some(b=>b.dataset.occupied==='true');if(occupied||d.baseRunners.some(r=>r.visible)||d.o.runner.visible||d.o.ball.visible||d.o.zone.visible||d.o.ret.visible||d.o.batter.visible||d.o.pitcher.visible||d.o.catcher.visible||d.o.fielders.some(r=>r.visible))throw Error('stale field during half inning');if(!document.querySelector('#throw').disabled)throw Error('input active at change');window.__rk.renderer.setPixelRatio(1);window.__changeSeen=true;window.__changeO=d.o;};});
for(let i=0;i<5;i++){
 await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:30000});await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled);await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:30000});if(i===2)await p.evaluate(()=>window.__setup=false);
}
await p.click('#throw');await p.waitForFunction(()=>window.__changeSeen,{timeout:30000});if(!await p.evaluate(()=>document.querySelector('#pi').textContent.startsWith('우리 팀 자동 공격 ·')))throw Error('missing automatic offense summary');await p.screenshot({path:`/downloads/rookie9_inning_change${process.env.TEST_URL?'_live':''}.png`});await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:30000});const end=await p.evaluate(()=>({restored:window.__changeO.zone.visible&&window.__changeO.ret.visible&&window.__changeO.pitcher.visible&&window.__changeO.catcher.visible&&window.__changeO.fielders.every(r=>r.visible),score:document.querySelector('#sc').textContent,occupied:[...document.querySelectorAll('#bases [data-base]')].some(b=>b.dataset.occupied==='true')}));if(!end.restored||!end.score.includes('2회')||!end.score.endsWith(' : 0')||end.occupied)throw Error(JSON.stringify(end));console.log('loaded3outs→emptyfield halfinning→restored empty secondinning',end);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
