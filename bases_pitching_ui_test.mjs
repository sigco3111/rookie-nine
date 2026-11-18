import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => (errs.push(e.message),console.error('PAGEERROR',e.message))); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');
await p.evaluate(()=>{window.__dt=1/8;window.__priorSeen=[];window.__defensePlay=d=>{window.__lastPhase=d.phase;window.__baseModels=d.baseRunners;if(d.priorBases===2&&d.phase==='approach'&&d.k>.5&&!window.__priorShot){window.__priorShot=true;window.__dt=.00001;}if(d.priorBases&&d.phase==='transfer'){if(d.priorBases===2&&!d.baseRunners.some(r=>r.visible))throw Error('prior runner not visible during hit');window.__priorSeen.push(d.priorBases);}};window.__homeRunPlay=d=>{if(d.priorBases===5){window.__hrPrior=true;if(d.t>d.duration*.8&&d.baseRunners.some(r=>r.visible))throw Error('prior HR runners did not exit before hitter');}};let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};Math.random=()=>draw>=0&&draw++===1?window.__hitDraw:.1;});
const results=[];
for(const [draw,mask,runs] of [[.9,4,0],[.7,2,1],[.1,5,1],[.99,0,4]]){
 await p.waitForFunction(()=>document.querySelector('#throw')&&!document.querySelector('#throw').disabled,{timeout:60000});await p.evaluate(d=>window.__hitDraw=d,draw);await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled);if(mask===5){await p.waitForFunction(()=>window.__priorShot,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_prior_run${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);}await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:60000}).catch(async e=>{console.log('DEBUG',await p.evaluate(()=>({text:document.querySelector('#ui').innerText,draw:window.__hitDraw,phase:window.__lastPhase,errs:window.__priorSeen})));await p.screenshot({path:'/downloads/rookie9_debug_bases.png'});await b.close();server?.kill('SIGTERM');throw e;});
 const state=await p.evaluate(()=>({mask:[...document.querySelectorAll('#bases [data-base]')].reduce((m,b)=>m|(b.dataset.occupied==='true'?1<<(Number(b.dataset.base)-1):0),0),label:document.querySelector('#bases').getAttribute('aria-label'),score:document.querySelector('#sc').textContent,modelMask:window.__baseModels.reduce((m,r,i)=>m|(r.visible?1<<i:0),0),priorSeen:window.__priorSeen,hrPrior:window.__hrPrior}));if(state.modelMask!==mask||state.mask!==mask||!state.score.includes(`0 : ${runs}`))throw Error(JSON.stringify({state,mask,runs}));results.push(state);console.log(state);if(mask===5||mask===4)await p.screenshot({path:`/downloads/rookie9_base_${mask}${process.env.TEST_URL?'_live':''}.png`});
}
if(!results.at(-1).hrPrior||!results.at(-1).priorSeen.includes(4)||!results.at(-1).priorSeen.includes(2))throw Error('prior animation hooks');
console.log('pitching triple/double/single/3runHR occupancy and score sequence passed',results);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
