import puppeteer from 'puppeteer-core';
import fs from 'fs';
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;

const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
p.on('framenavigated', () => {}); const errs = []; p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });

await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.screenshot({ path: '/tmp/a_title.png' });
await p.evaluate(() => [...document.querySelectorAll('button')].find(b => b.id === 'new').click());
await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
await p.screenshot({ path: '/tmp/a_home.png' });
// 훈련 몇 번
for (let i = 0; i < 3; i++) { await p.evaluate(() => document.querySelectorAll('.cmd')[3].click()); await new Promise(r => setTimeout(r, 300)); await p.evaluate(() => { const m = document.querySelector('.modal [data-c]'); if (m) m.click(); }); await new Promise(r => setTimeout(r, 300)); }
await p.screenshot({ path: '/tmp/a_home2.png' });
// 시합 주로 이동: 5월 4주 = week 4*1+3 -> (month5 index: week/4 =1 → month=((1+3)%12)+1=5) wk4 => week 7
await p.evaluate(() => { const g = window.__game; g.P.week = 7; g.P.injury = null; g.P.cond = 90; g.G.save(g.P); });
await p.evaluate(() => window.__game.skipWeeks(0));
await p.evaluate(() => document.querySelectorAll('.cmd')[3].click()); await new Promise(r => setTimeout(r, 400));
await p.screenshot({ path: '/tmp/a_prompt.png' });
await p.evaluate(() => {
 window.__dbgIn=true;window.__dt=1/15;window.__force={angle:55,launch:30,v:50};window.__shots=[];let swung=false;const taken=new Set();
 window.__dbgShot=(st,T)=>{if(window.__flew&&!window.__restored){window.__restored=true;queueMicrotask(()=>{const {renderer,scene,camera}=window.__rk;renderer.render(scene,camera);window.__restoreURL=renderer.domElement.toDataURL('image/png');window.__camPos=camera.position.toArray();});}if(!swung&&st.t>=T-0.075-1/30){swung=true;document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));}};
 window.__flog=(ball,cam,k)=>{window.__flew=true;for(const target of [0.2,0.5,0.8])if(k>=target&&!taken.has(target)){taken.add(target);queueMicrotask(()=>{const {renderer,scene}=window.__rk;cam.updateMatrixWorld();renderer.render(scene,cam);const q=ball.position.clone().project(cam);window.__shots.push({k:+k.toFixed(3),x:q.x,y:q.y,url:renderer.domElement.toDataURL('image/png')});});}};
});
await p.evaluate(() => document.querySelector('#play').click()); await new Promise(r => setTimeout(r, 2500));
await p.screenshot({ path: '/tmp/a_match1.png' });
await new Promise(r=>setTimeout(r,45000));
const shots=await p.evaluate(()=>window.__shots);for(const f of shots){fs.writeFileSync('/downloads/rookie9_flight_'+Math.round(f.k*100)+'.png',Buffer.from(f.url.split(',')[1],'base64'));console.log('flight',f.k,f.x,f.y);}
const restored=await p.evaluate(()=>({url:window.__restoreURL,cam:window.__camPos}));if(restored.url){fs.writeFileSync('/downloads/rookie9_foul_restore.png',Buffer.from(restored.url.split(',')[1],'base64'));console.log('RESTORED',restored.cam);}console.log(errs.join('|')||'no errors');await b.close();
