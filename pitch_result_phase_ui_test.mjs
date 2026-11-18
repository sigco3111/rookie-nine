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
console.log('opening game');if(process.env.FAIL_MODEL){await p.setRequestInterception(true);p.on('request',r=>r.url().includes('/models/player.fbx')?r.abort():r.continue());}await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.waitForSelector('#new');await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Same scene: first give the old batter owned equipment, then create a pitcher.
await p.evaluate(()=>{const p=window.__game.P;p.gear={bat:true,shoes:true};window.__game.skipWeeks(0);});

await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.gear={glove:true,shoes:true};p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');


await p.evaluate(()=>{window.__dt=.5;window.__rk.renderer.setPixelRatio(.5);const timer=window.setTimeout;window.setTimeout=(fn,ms,...args)=>timer(fn,(ms===900&&window.__mode==='ground'?10000:Math.min(ms,30)),...args);let draw=-1;const append=Element.prototype.appendChild;Element.prototype.appendChild=function(child){if(child.style?.background==='rgb(255, 255, 255)'&&child.style?.opacity==='0.55')draw=0;return append.call(this,child);};window.__mode='ball';Math.random=()=>{if(window.__mode==='ball'||window.__mode==='strike')return .99;if(draw<0)return .1;const n=draw++;if(window.__mode==='single')return .1;if(window.__mode==='hr')return n===1?.99:.1;if(window.__mode==='foul')return n===0?.99:.1;return n<2?.99:window.__mode==='air'?.6:.5;};window.__innings=[];window.__inningChange=d=>{window.__innings.push(d.inning);if(d.baseRunners.some(r=>r.visible))throw Error('stale inning runners');};});
await p.evaluate(()=>{window.__resultLabels=[];new MutationObserver(()=>{const t=document.querySelector('.banner')?.textContent;if(t&&(/허용|포스 아웃|야수선택/.test(t)||['땅볼 아웃','뜬공 아웃','볼넷','밀어내기 볼넷 (1실점)'].includes(t))){if(document.querySelector('#pi').textContent!==t)throw Error('stale result phase '+t);if(window.__resultLabels.at(-1)!==t)window.__resultLabels.push(t);}}).observe(document.querySelector('#ui'),{subtree:true,childList:true});});
const plan=['ball','ball','ball','ball','single','foul','hr','ground','air','ground'];
for(const [i,mode] of plan.entries()){
 await p.waitForFunction(()=>document.querySelector('#throw')&&!document.querySelector('#throw').disabled,{timeout:30000});
 await p.evaluate(mode=>{window.__mode=mode;const {THREE,camera}=window.__rk;const v=new THREE.Vector3(mode==='ball'?.8:0,mode==='ball'?1.6:.9,0).project(camera),cv=document.querySelector('#gl'),r=cv.getBoundingClientRect();cv.dispatchEvent(new PointerEvent('pointerdown',{clientX:(v.x+1)*r.width/2+r.left,clientY:(1-v.y+.1)*r.height/2+r.top,bubbles:true}));window.dispatchEvent(new PointerEvent('pointerup'));},mode);
 await p.click('#throw');await p.waitForFunction(()=>document.querySelector('#throw').disabled,{timeout:30000});if(i===7){await p.waitForFunction(()=>document.querySelector('#pi').textContent==='땅볼 아웃',{timeout:30000});await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_pitch_ground_result_phase${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__rk.renderer.setPixelRatio(.5));}await p.waitForFunction(()=>document.querySelector('#ok')||!document.querySelector('#throw')?.disabled,{timeout:30000});console.log('pitch',i,mode,await p.evaluate(()=>({score:document.querySelector('#sc')?.textContent,count:document.querySelector('#cnt')?.innerText})));
}
await p.waitForSelector('#ok',{timeout:30000});await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_full_pitch_result${process.env.TEST_URL?'_live':''}.png`});
const state=await p.evaluate(()=>({result:window.__game.P.pendingResult?.result,innings:window.__innings,history:window.__game.P.matchHistory?.[0]}));console.log('result labels',await p.evaluate(()=>window.__resultLabels));console.log('full game',JSON.stringify(state));if(state.result.ip!==1||state.result.so!==0||state.result.er!==3||state.result.hitsAllowed!==2||state.innings.join(',')!=='1')throw Error(JSON.stringify(state));
await p.reload();await p.waitForSelector('#cont',{timeout:30000});await p.click('#cont');await p.waitForSelector('#ok',{timeout:30000});const reloaded=await p.evaluate(()=>window.__game.P.pendingResult?.result);if(JSON.stringify(reloaded)!==JSON.stringify(state.result))throw Error('result reload changed');await p.click('#ok');console.log('result persisted and confirmed');if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
