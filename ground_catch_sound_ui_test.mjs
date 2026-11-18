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
await p.waitForSelector('#new');await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');await p.evaluate(()=>window.__rk.renderer.setPixelRatio(.5));
await p.evaluate(()=>{window.__mittSounds=0;const C=window.AudioContext||window.webkitAudioContext,make=C.prototype.createBuffer;C.prototype.createBuffer=function(ch,n,rate){if(Math.abs(n/rate-.08)<1/rate)window.__mittSounds++;return make.call(this,ch,n,rate);};});
await p.evaluate(v=>window.__wantSafe=v,!!process.env.SAFE);
await p.evaluate(()=>{window.__groundReturn=d=>{if(window.__mittSounds!==(d.k>=1?3:2))throw Error('return sound timing');if(!document.querySelector('#throw').disabled)throw Error('input before return');if(document.querySelectorAll('#cnt .dot.s.on').length)throw Error('out before return');if(d.k>=1){window.__returned=true;if(d.ball.position.distanceTo(d.target)>1e-6)throw Error('return not glove');}if(d.k>.4&&!window.__returnCapture){window.__returnCapture=true;window.__dt=.00001;}};});
await p.evaluate(()=>{
 let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};Math.random=()=>{const n=draw<0?-1:draw++;return window.__wantSafe&&n===2?0:.5;};window.__dt=1/8;window.__phases=[];window.__caught=false;window.__received=false;
 window.__defensePlay=d=>{const expected=d.phase==='receive'?2:d.t>=d.plan.approach+d.plan.transfer*.45?1:0;if(window.__mittSounds!==expected)throw Error('ground catch sound timing '+d.phase+' '+window.__mittSounds+' expected '+expected);if(!d.race)throw Error('missing race');window.__race=d.race;if(!d.runner?.visible)throw Error('opponent ground runner missing');if(window.__phases.at(-1)!==d.phase)window.__phases.push(d.phase);if(d.phase==='transfer'&&d.k>.1&&!window.__caught){window.__caught=true;window.__dt=.00001;window.__capture=true;}if(d.phase==='throw'&&d.k>.4&&!window.__thrown){window.__thrown=true;window.__dt=.00001;window.__throwCapture=true;}if(d.phase==='receive'&&!window.__received){if(document.querySelectorAll('#cnt .dot.s.on').length)throw Error('out advanced before reception');const {THREE}=window.__rk;const glove=d.receiver.userData.glove.localToWorld(new THREE.Vector3(0,0,.22));if(d.ball.position.distanceTo(glove)>1e-6||Math.hypot(d.receiver.position.x-19.4,d.receiver.position.z+19.4)>.001)throw Error('ball not in 1B glove');window.__received=true;window.__dt=.00001;window.__receiveCapture=true;}};
});
await p.waitForFunction(()=>document.querySelector('#pi').innerText.includes('목표를'));await p.click('#throw');await p.waitForFunction(()=>window.__capture,{timeout:60000});
async function renderShot(name){await p.screenshot({path:`/downloads/rookie9_race_${process.env.SAFE?'safe':'out'}_${name}${process.env.TEST_URL?'_live':''}.png`});}
await renderShot('pickup');await p.evaluate(()=>window.__dt=1/8);await p.waitForFunction(()=>window.__throwCapture,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_groundout_throw_${"pit"}${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);await p.waitForFunction(()=>window.__receiveCapture,{timeout:60000});await renderShot('receive');
const phaseCheck=await p.evaluate(()=>{const phases=[...window.__phases];window.__dt=1/8;return phases});if(phaseCheck.join(',')!=='approach,transfer,throw,receive')throw Error(phaseCheck);
await p.waitForFunction(()=>window.__returnCapture,{timeout:60000});await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_ground_return${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);
await p.waitForFunction(()=>document.querySelector('#pi').innerText.includes('목표를'),{timeout:60000});if(!await p.evaluate(()=>window.__returned))throw Error('missing return');const state=await p.evaluate(()=>({race:window.__race,outs:document.querySelectorAll('#cnt .dot.s.on').length,base1:document.querySelector('#bases [data-base="1"]').dataset.occupied}));if(state.race.safe!==!!process.env.SAFE||state.outs!==(process.env.SAFE?0:1)||state.base1!==(process.env.SAFE?'true':'false'))throw Error(JSON.stringify(state));console.log('timed first-base race result and next-pitch occupancy',state);
if(await p.evaluate(()=>window.__mittSounds)!==3)throw Error('duplicate catch sound');if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
