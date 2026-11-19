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

const runner=process.env.RUNNER!=='0',trait=process.env.TRAIT!=='0';
await p.evaluate(({runner,trait})=>{const p=window.__game.P;p.week=7;Math.random=()=>runner?.01:.99;window.__game.skipWeeks(0);[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click();p.meet=20;p.traits=trait?['clutch']:[];window.__dbgIn=true;window.__dt=.025;window.__pitchStarted=false;
window.__batPitchRelease=d=>{if(d.phase==='windup'&&d.t===0){window.__pitchStarted=true;const {THREE,camera}=window.__rk,v=new THREE.Vector3(.29,.9,0).project(camera),cv=document.querySelector('#gl'),r=cv.getBoundingClientRect();cv.dispatchEvent(new PointerEvent('pointerdown',{clientX:r.left+(v.x+1)*r.width/2,clientY:r.top+(1-v.y+.12)*r.height/2,bubbles:true}));window.dispatchEvent(new PointerEvent('pointerup'));}};
window.__dbgShot=(st,T,o)=>{window.__ob=o;if(st.swingT==null&&st.t>=T-.075-.0125){document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));window.__swing={t:st.t,T,ret:[o.ret.position.x,o.ret.position.y],meet:p.meet,traits:[...p.traits]};}};
window.__flog=()=>{window.__hit=true;window.__dt=.00001;};
}, {runner,trait});
await p.waitForSelector('#play');await p.click('#play');await p.waitForFunction(()=>window.__pitchStarted,{timeout:30000});
await p.waitForFunction(()=>window.__hit||document.querySelector('#pi')?.innerText==='파울 · 라인 밖 타구',{timeout:60000});const state=await p.evaluate(()=>({hit:!!window.__hit,swing:window.__swing,phase:document.querySelector('#pi').innerText}));if(state.hit!==(runner&&trait))throw Error(JSON.stringify({runner,trait,state}));if(Math.abs(state.swing.ret[0]-.29)>.0001)throw Error('aim not applied');await p.screenshot({path:`/downloads/rookie9_clutch_r${+runner}_t${+trait}${process.env.TEST_URL?'_live':''}.png`});console.log('actual contact boundary',runner,trait,state);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
