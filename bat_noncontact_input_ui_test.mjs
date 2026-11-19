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

const mode=process.env.MODE||'strike';
await p.evaluate(mode=>{const p=window.__game.P;p.week=7;Math.random=()=>mode==='ball'?.99:.01;window.__game.skipWeeks(0);[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click();window.__dt=.125;window.__labels=[];window.__restores=0;const timer=window.setTimeout;window.setTimeout=(fn,ms,...a)=>timer(fn,ms===450?2500:ms,...a);
window.__batPitchRelease=d=>{if(d.phase==='windup'&&d.t===0){if(document.querySelector('.swing').disabled)throw Error('swing not restored');window.__restores++;}};
window.__dbgShot=(st,T,o)=>{window.__ob=o;if(mode==='whiff'&&st.swingT==null)document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));};
window.__hidden=()=>{const b=document.querySelector('.swing');if(!b.disabled||getComputedStyle(b).display!=='none'||getComputedStyle(document.querySelector('.hint')).display!=='none'||getComputedStyle(document.querySelector('#timingguide')).display!=='none')throw Error('stale batting input');if(window.__ob&&(window.__ob.zone.visible||window.__ob.ret.visible))throw Error('stale aim');};
},mode);
await p.waitForSelector('#play');await p.click('#play');
await p.evaluate(()=>{new MutationObserver(()=>{const t=document.querySelector('#pi').innerText;window.__labels.push(t);if(['볼','스트라이크','헛스윙!'].includes(t)){window.__hidden();window.__settled=true;}if(t==='삼진 아웃'||t.startsWith('상대 자동 공격 · ')||t.startsWith('우리 팀 자동 공격 · '))window.__hidden();}).observe(document.querySelector('#pi'),{childList:true,subtree:true});});
await p.waitForFunction(()=>window.__settled,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_bat_${mode}_settled${process.env.TEST_URL?'_live':''}.png`});await p.waitForFunction(()=>window.__restores>=2,{timeout:30000});console.log(mode,'settled input hidden then next pitch restored');
await p.waitForSelector('#ok',{timeout:60000});const state=await p.evaluate(()=>({r:window.__game.P.pendingResult.result,labels:window.__labels,restores:window.__restores}));if(state.r.hits!==0||state.r.ab!==(mode==='ball'?0:1)||state.restores!==(mode==='ball'?4:3))throw Error(JSON.stringify(state));if(mode!=='ball'&&!state.labels.includes('삼진 아웃'))throw Error('missing strikeout phase');console.log(mode,'result',state);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
