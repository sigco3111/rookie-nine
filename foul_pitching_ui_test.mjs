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
const errs = []; p.on('pageerror', (e) => {errs.push(e.message);console.log('PAGEERROR',e.message)}); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
console.log('opening game');await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.waitForSelector('#new');await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');

await p.evaluate(()=>{window.__dt=1/8;let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};Math.random=()=>{if(draw<0)return .1;const n=draw++;if(window.__single)return n===1?window.__setupHit:.1;if(n===0)return .99;if(n===1)return .99;if(n===2)return window.__distDraw??.5;if(n===3)return window.__angleDraw??.5;return .5;};window.__single=true;});

await p.evaluate(()=>{window.__single=true;window.__setupHit=.9;});await p.waitForFunction(()=>document.querySelector('#pi').innerText.includes('목표를'));await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled);await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:60000});
await p.evaluate(()=>{let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};Math.random=()=>draw<0?.1:draw++===0?.99:.1;window.__dt=.125;window.__foulN=0;window.__foulPlay=d=>{const expected=Math.min(2,window.__foulN);if(document.querySelectorAll('#cnt .dot.s.on').length!==expected||document.querySelectorAll('#cnt .dot.o.on').length)throw Error('early foul count or out');if(document.querySelector('#bases [data-base="3"]').dataset.occupied!=='true'||!d.baseRunners[2].visible)throw Error('prior3B missing');if(Math.hypot(d.baseRunners[2].position.x+19.4,d.baseRunners[2].position.z+19.4)>.001)throw Error('runner advanced on foul');if(d.landed){if(Math.abs(d.ball.position.x)<=-d.ball.position.z)throw Error('not outside line');window.__landed=true;if(!window.__shot&&window.__foulN===0){window.__shot=true;window.__dt=.00001;}}};});
for(let n=0;n<3;n++){
 await p.evaluate(n=>{window.__foulN=n;window.__landed=false;},n);await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled);if(n===0){await p.waitForFunction(()=>window.__shot,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_pitch_foul${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=.125);}
 await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:60000});const state=await p.evaluate(()=>({landed:window.__landed,strikes:document.querySelectorAll('#cnt .dot.s.on').length,outs:document.querySelectorAll('#cnt .dot.o.on').length,score:document.querySelector('#sc').textContent,base3:document.querySelector('#bases [data-base="3"]').dataset.occupied,pi:document.querySelector('#pi').innerText}));if(!state.landed||state.strikes!==Math.min(2,n+1)||state.outs!==0||state.base3!=='true'||!state.score.includes('0 : 0'))throw Error(JSON.stringify(state));console.log('foul count/hold/next pitch',state);
}
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
