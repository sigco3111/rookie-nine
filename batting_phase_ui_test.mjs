import puppeteer from 'puppeteer-core';
import fs from 'fs';
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;

const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
p.on('framenavigated', () => {}); const errs = []; p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });

await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.screenshot({ path: '/tmp/a_title.png' });
await p.evaluate(() => [...document.querySelectorAll('button')].find(b => b.id === 'new').click());
await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
await p.screenshot({ path: '/tmp/a_home.png' });
// 훈련 몇 번
for (let i = 0; i < 3; i++) { await p.evaluate(() => document.querySelectorAll('.cmd')[3].click()); await new Promise(r => setTimeout(r, 300)); await p.evaluate(() => { const m = document.querySelector('.modal [data-c]'); if (m) m.click(); }); await new Promise(r => setTimeout(r, 300)); }
await p.screenshot({ path: '/tmp/a_home2.png' });
// 시합 주로 이동: 5월 4주 = week 4*1+3 -> (month5 index: week/4 =1 → month=((1+3)%12)+1=5) wk4 => week 7
await p.evaluate(() => { const g = window.__game; g.P.week = 7; g.P.injury = null; g.P.cond = 90;g.P.gear={shoes:true};g.P.ev.coach=g.P.ev.captain=g.P.ev.team=90; g.G.save(g.P); });
await p.evaluate(() => window.__game.skipWeeks(0));
await p.evaluate(() => document.querySelectorAll('.cmd')[3].click()); await new Promise(r => setTimeout(r, 400));
await p.screenshot({ path: '/tmp/a_prompt.png' });
await p.evaluate(() => {
 window.__dt=1/30;window.__force={angle:8,launch:30,v:50};window.__stage='pitch';let swung=false;
 window.__dbgShot=(st,T,o)=>{window.__ob=o;if(!swung&&st.t>=T-0.075-1/60){swung=true;document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));}else if(window.__stage==='runner'){window.__stage='next';window.__dt=.00001;}};
 window.__flog=()=>{if(window.__stage==='pitch'){window.__stage='flight';window.__dt=.00001;}};
});
await p.click('#play');await p.waitForFunction(()=>window.__stage==='flight',{timeout:60000});
async function hidden(){return p.evaluate(()=>{const sw=document.querySelector('.swing'),hint=document.querySelector('.hint');return sw.disabled&&getComputedStyle(sw).display==='none'&&getComputedStyle(hint).display==='none'&&getComputedStyle(document.querySelector('#timingguide')).display==='none';});}
if(!await hidden()||await p.$eval('#pi',e=>e.innerText)!=='타구 비행')throw Error('flight UI');
await p.screenshot({path:`/downloads/rookie9_clean_flight${process.env.TEST_URL?'_live':''}.png`});
await p.evaluate(()=>{window.__dt=1/30;window.__watch=setInterval(()=>{if(window.__ob.runner.visible&&window.__stage==='flight'){window.__stage='runner';window.__dt=.00001;clearInterval(window.__watch);}},10)});
await p.waitForFunction(()=>window.__stage==='runner',{timeout:60000});if(!await hidden()||await p.$eval('#pi',e=>e.innerText)!=='베이스 러닝')throw Error('running UI');
await p.screenshot({path:`/downloads/rookie9_clean_runner${process.env.TEST_URL?'_live':''}.png`});
await p.evaluate(()=>window.__dt=1/30);await p.waitForFunction(()=>window.__stage==='next',{timeout:60000});
const restored=await p.evaluate(()=>{const b=document.querySelector('.swing');return !b.disabled&&getComputedStyle(b).display!=='none'&&getComputedStyle(document.querySelector('.hint')).display!=='none'&&getComputedStyle(document.querySelector('#timingguide')).display!=='none';});
if(!restored)throw Error('next pitch controls missing');if(errs.length)throw Error(errs.join('|'));console.log('flight/run hidden, next pitch restored, no errors');await b.close();
