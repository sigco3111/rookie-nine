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
await p.evaluate(() => { window.__frames = []; window.__dbgIn = true; window.__dt = 1 / 30; let swung = false; const { THREE, renderer, scene } = window.__rk; const cam = new THREE.PerspectiveCamera(40, 390 / 844, 0.1, 300);
  window.__dbgShot = (st, T, o, sN) => { if (!swung && st.t >= T - 0.075 - 1 / 30 + (window.__po || 0)) { swung = true; document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }
    let kind = null; if (st.t < 0.35) { kind = 'rel'; const pu = o.pitcher.userData; pu.sync && pu.sync(); const hp = pu.throwHand.getWorldPosition(new THREE.Vector3()); const hd = o.ball.position.distanceTo(hp); window.__hd = hd; cam.position.set(hp.x + 3.2, hp.y + 0.4, hp.z + 1.0); cam.up.set(0, 1, 0); cam.lookAt(hp.x, hp.y, hp.z); } else if (st.t > T - 0.2 && st.t < T + 0.25) { kind = 'hit'; cam.position.set(-0.3, 5.2, 0.9); cam.up.set(0, 0, -1); cam.lookAt(-0.3, 0, 0.0); }
    if (!kind) return; cam.updateMatrixWorld(true); const wantImg = kind === 'rel' || st.swingAnim > 0; if (wantImg) renderer.render(scene, cam); let dist = null; if (kind === 'hit' && o.batter.userData.batMesh) { const m = o.batter.userData.batMesh; m.updateWorldMatrix(true, false); const c = m.getWorldPosition(new THREE.Vector3()); const ax = new THREE.Vector3(0, 1, 0).transformDirection(m.matrixWorld); const L = 0.425 * m.getWorldScale(new THREE.Vector3()).y; const a = c.clone().addScaledVector(ax, -L), b = c.clone().addScaledVector(ax, L); const bp = o.ball.position; const ab = b.clone().sub(a); const tt = Math.max(0, Math.min(1, bp.clone().sub(a).dot(ab) / ab.lengthSq())); window.__bat = [a.toArray().map(v=>+v.toFixed(2)), b.toArray().map(v=>+v.toFixed(2)), bp.toArray().map(v=>+v.toFixed(2))]; dist = +a.clone().addScaledVector(ab, tt).distanceTo(bp).toFixed(2); }
    window.__frames.push({ hd: kind==='rel'?+(window.__hd).toFixed(2):null, bat: window.__bat, dist, kind, t: +st.t.toFixed(3), T: +T.toFixed(3), rel: +(st.t - T).toFixed(3), swingAnim: +(st.swingAnim || 0).toFixed(2), url: wantImg ? renderer.domElement.toDataURL('image/jpeg', 0.8) : 'data:,' }); }; });
await p.evaluate(() => document.querySelector('#play').click()); await new Promise(r => setTimeout(r, 2500));
await p.screenshot({ path: '/tmp/a_match1.png' });
await p.evaluate(() => { window.__force = { angle: 8, launch: 30, v: 50 }; window.__po = +('0.15'); });
await new Promise(r => setTimeout(r, 22000));
const fr = await p.evaluate(() => window.__frames); import fs3 from 'fs'; fs3.mkdirSync('/tmp/dbg', { recursive: true });
fr.filter(f => f.url.length > 10).forEach((f, k) => { fs3.writeFileSync(`/tmp/dbg/${f.kind}_${String(k).padStart(2, '0')}_t${f.t}_rel${f.rel}_sw${f.swingAnim}.jpg`, Buffer.from(f.url.split(',')[1], 'base64')); });
console.log(fr.map(f => f.kind + ' t=' + f.t + ' T=' + f.T + ' rel=' + f.rel + ' sw=' + f.swingAnim + ' ballToBat=' + f.dist + ' hd=' + f.hd + ' knob/tip/ball=' + JSON.stringify(f.bat)).join('\n'));
console.log(errs.slice(0, 10).join('\n') || 'no errors');
await b.close();
