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
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');
await p.evaluate(()=>{window.__mittSounds=0;const C=window.AudioContext||window.webkitAudioContext,make=C.prototype.createBuffer;C.prototype.createBuffer=function(ch,n,rate){if(Math.abs(n/rate-.08)<1/rate)window.__mittSounds++;return make.call(this,ch,n,rate);};});
await p.evaluate(()=>{Math.random=()=>.55;window.__dt=1/8;window.__airPhases=[];window.__airReturn=d=>{if(window.__mittSounds!==(d.k>=1?2:1))throw Error('air return sound timing');if(document.querySelectorAll('#cnt .dot.s.on').length)throw Error('out count before return');if(!document.querySelector('#throw').disabled)throw Error('next input before return');if(d.k>=1){if(document.querySelector('#pi').innerText!=='투수 미트 수신')throw Error('missing pitcher receipt phase');if(!window.__receiptShot){window.__receiptShot=true;window.__dt=.00001;}window.__returned=true;if(d.ball.position.distanceTo(d.target)>1e-6)throw Error('return not pitcher glove');}if(d.k>.4&&!window.__returnCapture){window.__returnCapture=true;window.__dt=.00001;}};window.__airOutPlay=d=>{
 if(window.__airPhases.at(-1)!==d.phase)window.__airPhases.push(d.phase);
 if(d.phase==='caught'&&!window.__caught){if(window.__mittSounds!==1)throw Error('catch sound not once');if(document.querySelectorAll('#cnt .dot.s.on').length)throw Error('out before catch');const {THREE}=window.__rk;const glove=d.collector.userData.glove.localToWorld(new THREE.Vector3(0,0,.22));if(glove.distanceTo(d.ball.position)>1e-6)throw Error('not glove-held');window.__caught=true;window.__dt=.00001;window.__catchCapture=true;}
};});
await p.waitForFunction(()=>document.querySelector('#pi').innerText.includes('목표를'));await p.click('#throw');await p.waitForFunction(()=>window.__catchCapture,{timeout:60000});
await p.screenshot({path:`/downloads/rookie9_airout_pitch_catch${process.env.TEST_URL?'_live':''}.png`});
await p.evaluate(()=>window.__dt=1/8);await p.waitForFunction(()=>window.__returnCapture,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_air_return${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);await p.waitForFunction(()=>window.__receiptShot,{timeout:30000});await p.screenshot({path:`/downloads/rookie9_pitcher_receipt_air${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=.125);await p.waitForFunction(()=>document.querySelectorAll('#cnt .dot.s.on').length===1,{timeout:60000});
if(!await p.evaluate(()=>window.__returned))throw Error('return not completed');const phases=await p.evaluate(()=>window.__airPhases);if(phases.join(',')!=='flight,caught')throw Error(phases);if(await p.evaluate(()=>window.__mittSounds)!==2)throw Error('duplicate air sound');if(errs.length)throw Error(errs.join('|'));console.log('pitcher air out count after glove reception',phases);await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
