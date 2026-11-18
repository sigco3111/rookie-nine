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
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');

await p.evaluate(()=>{window.__dt=1/8;let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};Math.random=()=>{if(draw<0)return .1;const n=draw++;if(window.__single)return .1;if(n===0)return .99;if(n===1)return .99;if(n===2)return window.__distDraw??.5;if(n===3)return window.__angleDraw??.5;return .5;};window.__single=true;});
await p.waitForFunction(()=>document.querySelector('#pi').innerText.includes('목표를'));await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled);await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:60000});
const first=await p.evaluate(()=>document.querySelector('#bases [data-base="1"]').dataset.occupied);if(first!=='true')throw Error('setup single');
await p.evaluate(({dist,angle})=>{window.__single=false;window.__distDraw=dist;window.__angleDraw=angle;window.__phases=[];window.__defensePlay=d=>{
 if(!d.forceSecond||!d.race)throw Error('not second force');window.__race=d.race;window.__last=d;window.__baseModels=d.baseRunners;
 if(d.plan.base[0]!==0||d.plan.base[1]!==-38.8)throw Error('not second target');
 if(!d.runner.visible)throw Error('batter hidden');
 if(window.__phases.at(-1)!==d.phase)window.__phases.push(d.phase);
 if(d.phase==='throw'&&d.k>.3&&!window.__shot){window.__shot=true;window.__dt=.00001;}
 if(d.phase==='receive'&&!window.__receive){window.__receive=true;if(document.querySelectorAll('#cnt .dot.s.on').length!==0)throw Error('early out');const {THREE}=window.__rk;const glove=d.receiver.userData.glove.localToWorld(new THREE.Vector3(0,0,.22));if(d.ball.position.distanceTo(glove)>1e-6)throw Error('not glove');if(d.baseRunners[0].visible!==d.race.safe)throw Error('retired runner visibility');window.__dt=.00001;}
 };},{dist:Number(process.env.DIST??(process.env.SAFE?0:.5)),angle:Number(process.env.ANGLE??.5)});
await p.click('#throw');await p.waitForFunction(()=>window.__shot,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_force_${process.env.SAFE?'safe':'out'}_throw${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);await p.waitForFunction(()=>window.__receive,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_force_${process.env.SAFE?'safe':'out'}_receive${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);
await p.waitForFunction(()=>!document.querySelector('#throw').disabled,{timeout:60000});const state=await p.evaluate(()=>({race:window.__race,outs:document.querySelectorAll('#cnt .dot.s.on').length,mask:[...document.querySelectorAll('#bases [data-base]')].reduce((m,b)=>m|(b.dataset.occupied==='true'?1<<(Number(b.dataset.base)-1):0),0),modelMask:window.__baseModels.reduce((m,r,i)=>m|(r.visible?1<<i:0),0),phases:window.__phases,score:document.querySelector('#sc').textContent,runner:[window.__last.runner.position.x,window.__last.runner.position.z]}));console.log(state);if(state.race.safe!==!!process.env.SAFE||state.outs!==(process.env.SAFE?0:1)||state.mask!==(process.env.SAFE?3:1)||state.modelMask!==state.mask||!state.score.includes('0 : 0')||Math.hypot(state.runner[0]-19.4,state.runner[1]+19.4)>.001)throw Error(JSON.stringify(state));
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
