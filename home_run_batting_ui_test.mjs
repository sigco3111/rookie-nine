import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
await p.evaluate(()=>{const p=window.__game.P;p.week=7;Math.random=()=>.01;window.__game.skipWeeks(0);[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click();window.__force={angle:0,launch:35,v:100};window.__dbgIn=true;window.__dbgShot=(st,T)=>{if(st.swingT==null&&st.t>=T-.375){Math.random=()=>.01;document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));}};window.__dt=1/16;window.__initialFov=window.__rk.camera.fov;window.__turns=[];window.__homeRunPlay=({runner,t,duration,arrived})=>{const q=Math.min(4,Math.floor(t/duration*4));if(window.__turns.at(-1)!==q)window.__turns.push(q);if(q===3&&!window.__mid){window.__mid=true;window.__dt=.00001;window.__capture=true;}if(arrived){if(Math.hypot(runner.position.x,runner.position.z)>.001)throw Error('home endpoint');window.__home=true;}};});
await p.waitForSelector('#play');await p.click('#play');await p.waitForFunction(()=>window.__capture,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_hr_bat_third${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);await p.waitForSelector('#ok',{timeout:60000});const r=await p.evaluate(()=>({result:window.__game.P.pendingResult.result,turns:window.__turns,home:window.__home,fov:window.__rk.camera.fov,original:window.__initialFov}));if(!r.home||r.turns.join(',')!=='0,1,2,3,4'||r.result.hr!==1||r.result.hits!==1||r.fov!==r.original)throw Error(JSON.stringify(r));console.log('batter HR all bases/home before full1PA result/FOV restored',r);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
