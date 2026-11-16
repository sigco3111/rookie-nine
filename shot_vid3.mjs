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
await p.evaluate(() => document.querySelector('#play').click()); await new Promise(r => setTimeout(r, 2500));
await p.screenshot({ path: '/tmp/a_match1.png' });
await p.evaluate(() => { window.__force = { angle: 8, launch: 30, v: 50 }; window.__fl = []; window.__flog = (b, c, k) => { const v = b.position.clone().project(c); const r = b.geometry.parameters.radius * b.scale.x; const dist = c.position.distanceTo(b.position); window.__fl.push([+k.toFixed(2), +v.x.toFixed(2), +v.y.toFixed(2), +(2 * r / dist * 844 / (2 * Math.tan(c.fov * Math.PI / 360))).toFixed(1)]); }; });
import fs2 from 'fs'; fs2.mkdirSync('/tmp/gf',{recursive:true}); for (const f of fs2.readdirSync('/tmp/gf')) fs2.unlinkSync('/tmp/gf/'+f);
const t0 = Date.now(); let swung = false;
for (let i = 0; i < 40; i++) { const el = Date.now() - t0; if (!swung && el > 1500) { swung = true; await p.evaluate(() => document.querySelector('.swing') && document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); } await p.screenshot({ path: '/tmp/gf/f' + String(i).padStart(3, '0') + '.png' }); }
console.log('FL', JSON.stringify((await p.evaluate(() => window.__fl)).filter((x, i) => i % 6 === 0))); console.log('elapsed', Date.now() - t0);
console.log(errs.slice(0, 10).join('\n') || 'no errors');
await b.close();
