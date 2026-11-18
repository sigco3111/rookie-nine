import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => {errs.push(e.message);console.log(e.message)}); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
await p.evaluate(()=>{const p=window.__game.P;p.week=7;Math.random=()=>.99;window.__game.skipWeeks(0);[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click();Math.random=()=>.1;window.__dbgIn=true;window.__dt=.0625;window.__wind=0;window.__flights=0;
 window.__batPitchRelease=d=>{if(d.phase==='windup'){window.__wind++;if(!d.ball.visible||d.ball.position.distanceTo(d.hand)>1e-8)throw Error('not hand anchored');if(window.__wind===12){window.__shot=true;}}
 else{window.__flights++;if(d.blend>=1){const expected=-17.8+17.8*Math.min(1.12,d.t/d.T);if(Math.abs(d.ball.position.z-expected)>1e-7)throw Error('old trajectory changed');}if(d.t>.14&&!window.__flightShot){window.__flightShot=true;window.__dt=.00001;}}};
 });
await p.waitForSelector('#play');await p.click('#play');await p.waitForFunction(()=>window.__flightShot,{timeout:30000});await p.screenshot({path:`/downloads/rookie9_bat_pitch_release${process.env.TEST_URL?'_live':''}.png`});
await p.evaluate(()=>window.__dt=.125);await p.waitForFunction(()=>document.querySelectorAll('#cnt .dot.s.on').length===1,{timeout:30000});const state=await p.evaluate(()=>({wind:window.__wind,flights:window.__flights}));if(state.wind!==24||state.flights<3)throw Error(JSON.stringify(state));console.log('batting hand release and old postblend trajectory, first called strike',state);if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
