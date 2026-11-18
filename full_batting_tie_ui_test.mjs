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
await p.evaluate(()=>{const p=window.__game.P;p.week=7;p.ev.coach=p.ev.captain=p.ev.team=90;p.injury=null;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();window.__dt=.5;window.__rk.renderer.setPixelRatio(.5);const old=window.setTimeout;window.setTimeout=(f,ms,...a)=>old(f,Math.min(ms,30),...a);window.__pitches=0;window.__batPitchRelease=d=>{if(d.phase==='windup'&&d.t===0)window.__pitches++;};});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#ok',{timeout:90000});await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_bat_tie_result${process.env.TEST_URL?'_live':''}.png`});
const state=await p.evaluate(()=>({r:window.__game.P.pendingResult.result,pitches:window.__pitches,note:document.querySelector('.tiebreak-note')?.innerText}));if(state.pitches!==12||state.r.ab!==0||state.r.hits!==0||!state.r.automaticTiebreak||state.r.playedScore.my!==0||state.r.playedScore.opp!==0||state.r.my!==0||state.r.opp!==1||state.note.includes('실점')||!state.note.includes('정규 진행'))throw Error(JSON.stringify(state));console.log('3 batting PA/12 pitches/fullgame/tie disclosure',state);
await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#ok');const saved=await p.evaluate(()=>window.__game.P.pendingResult.result);if(JSON.stringify(saved)!==JSON.stringify(state.r))throw Error('resume changed');await p.click('#ok');console.log('resume + confirm passed');if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
