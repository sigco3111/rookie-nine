import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const mask=Number(process.env.MASK??1);
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => {errs.push(e.message);console.log('PAGEERROR',e.message)}); p.on('console', (m) => { if(m.text()==='CHANGE_CAPTURE')p.screenshot({path:`/downloads/rookie9_inning_change${process.env.TEST_URL?'_live':''}.png`});if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
console.log('opening game');await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.waitForSelector('#new');await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');

await p.evaluate(()=>{window.__dt=1/8;let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};Math.random=()=>{if(draw<0)return .1;const n=draw++;if(window.__single)return n===1?window.__setupHit:.1;if(n===0)return .99;if(n===1)return .99;if(n===2)return window.__distDraw??.5;if(n===3)return window.__angleDraw??.5;return .5;};window.__single=true;});

if(process.env.PRIOR){await p.evaluate(()=>{window.__dt=.5;window.__setupHit=.1;});await p.waitForFunction(()=>!document.querySelector('#throw').disabled);await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled);await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:30000});}
await p.evaluate(n=>window.__hitBases=n,Number(process.env.HIT||1));
await p.evaluate(()=>{window.__dt=.125;window.__rk.renderer.setPixelRatio(.5);window.__setupHit=window.__hitBases===3?.9:window.__hitBases===2?.7:.1;window.__flightSeen=false;window.__relaySeen=false;window.__lastDistance=0;window.__hitRunFlight=d=>{const r=d.runner,dist=Math.hypot(r.position.x,r.position.z);if(!r.visible)throw Error('runner absent in flight');if(dist<window.__lastDistance-.001)throw Error('runner backwards');window.__lastDistance=dist;if(d.priorBases){if(!d.baseRunners[0].visible||d.baseRunners[0].position.distanceTo(new window.__rk.THREE.Vector3(19.4,0,-19.4))<.01)throw Error('prior runner static');window.__priorMoved=true;}window.__flightSeen=true;window.__flightRunnerEnd=r.position.clone();if(d.t>.5&&!window.__shot){window.__shot=true;window.__dt=.00001;}};
 window.__defensePlay=d=>{if(!d.returnHit)return;if(!window.__flightSeen)throw Error('no flight run');if(!window.__relaySeen){window.__relaySeen=true;if(d.runner.position.distanceTo(window.__flightRunnerEnd)<.001)throw Error('runner not continued');if(d.runner.position.length()<window.__flightRunnerEnd.length()-.01)throw Error('runner reset on landing');}window.__lastRunner=d.runner;};});
await p.waitForFunction(()=>!document.querySelector('#throw').disabled);await p.click('#throw');await p.waitForFunction(()=>window.__shot,{timeout:30000});await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_hit_run_flight${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=.125);
await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:60000});const state=await p.evaluate(()=>({flight:window.__flightSeen,relay:window.__relaySeen,runner:[window.__lastRunner.position.x,window.__lastRunner.position.z],base:document.querySelector(`#bases [data-base="${window.__hitBases}"]`).dataset.occupied,hit:window.__hitBases,batter:(()=>{let b;window.__rk.scene.traverse(o=>{if(o.userData.hasBat&&o.scale.x===1)b=o;});return b?.visible;})()}));if(!state.flight||!state.relay||state.base!=='true'||Math.hypot(state.runner[0]-[0,19.4,0,-19.4][state.hit],state.runner[1]-[0,-19.4,-38.8,-19.4][state.hit])>.001||!state.batter)throw Error(JSON.stringify(state));console.log('hit run begins in flight, continues through relay, arrives before nextpitch',state);
if(process.env.PRIOR&&!await p.evaluate(()=>window.__priorMoved))throw Error('no prior movement');if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
