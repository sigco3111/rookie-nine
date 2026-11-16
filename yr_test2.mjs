import puppeteer from 'puppeteer-core';
import fs from 'fs';
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
await p.evaluate(() => { window.__game.P.injury = null; window.__game.skipWeeks(47); }); await new Promise(r => setTimeout(r, 500));
console.log('before:', await p.evaluate(() => document.querySelector('.top')?.innerText.replace(/\n/g, ' ')));
await p.evaluate(() => document.querySelectorAll('.cmd')[0].click()); await new Promise(r => setTimeout(r, 800));
for (let i = 0; i < 4; i++) { const t = await p.evaluate(() => document.querySelector('.modal')?.innerText.slice(0, 40)); if (t && t.includes('결산')) break; await p.evaluate(() => { const m = document.querySelector('.modal button'); if (m) m.click(); }); await new Promise(r => setTimeout(r, 500)); }
console.log('review:', await p.evaluate(() => document.querySelector('.modal')?.innerText.replace(/\n/g, ' ')));
await p.evaluate(() => document.querySelector('#okrv')?.click()); await new Promise(r => setTimeout(r, 600));
for (let i = 0; i < 3; i++) { await p.evaluate(() => { const m = document.querySelector('.modal button'); if (m) m.click(); }); await new Promise(r => setTimeout(r, 400)); }
console.log('after:', await p.evaluate(() => document.querySelector('.top')?.innerText.replace(/\n/g, ' ')), await p.evaluate(() => window.__game.P.week));
await p.screenshot({ path: '/tmp/yr.png' });
console.log(errs.join('|') || 'ok', await p.evaluate(() => document.querySelector('.modal')?.innerText.slice(0, 120)));
await b.close();
