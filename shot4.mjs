import puppeteer from 'puppeteer-core';
import fs from 'fs';
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;

const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
p.on('framenavigated', () => {}); const errs = []; globalThis.process_pit = true; p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });

await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.screenshot({ path: '/tmp/a_title.png' });
await p.evaluate(() => [...document.querySelectorAll('button')].find(b => b.id === 'new').click());
await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#pos [data-p=pit]').click());
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
await p.screenshot({ path: '/tmp/a_home.png' });
await p.screenshot({ path: '/tmp/b_home.png' });
for (let i = 0; i < 3; i++) { await p.evaluate(() => document.querySelectorAll('.cmd')[2].click()); await new Promise(r => setTimeout(r, 300)); await p.evaluate(() => { const m = document.querySelector('.modal [data-c]'); if (m) m.click(); }); await new Promise(r => setTimeout(r, 300)); }
await p.screenshot({ path: '/tmp/b_home2.png' });
await p.evaluate(() => { const g = window.__game; g.P.week = 7; g.P.injury = null; g.P.cond = 90; g.G.save(g.P); window.__game.skipWeeks(0); });
await p.evaluate(() => document.querySelectorAll('.cmd')[3].click()); await new Promise(r => setTimeout(r, 400));
await p.evaluate(() => document.querySelector('#play').click()); await new Promise(r => setTimeout(r, 3500));
await p.screenshot({ path: '/tmp/b_p1.png' });
await p.evaluate(()=>{const _r=Math.random;let n=0;Math.random=()=>{n++;return 0.02};setTimeout(()=>Math.random=_r,60000);});
for (let i = 0; i < 12; i++) { await new Promise(r=>setTimeout(r,330)); await p.screenshot({ path: '/tmp/f_'+i+'.png' }); if(i==0) await p.evaluate(()=>document.querySelector('#throw').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}))); }
for (let i = 0; i < 0; i++) { const th = await p.$('#throw'); if (!th) { await new Promise(r => setTimeout(r, 400)); if (!(await p.$('.scoreb'))) break; continue; } await p.evaluate(() => document.querySelector('#throw').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); await new Promise(r => setTimeout(r, 650)); if (i === 3) await p.screenshot({ path: '/tmp/b_p2.png' }); if (i === 8) await p.screenshot({ path: '/tmp/b_p3.png' }); }
await new Promise(r => setTimeout(r, 2500)); await p.screenshot({ path: '/tmp/b_p4.png' });
console.log(errs.slice(0, 10).join('\n') || 'no errors');
await b.close();
