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
await p.evaluate((double)=>{const p=window.__game.P;p.week=7;Math.random=()=>.01;window.__game.skipWeeks(0);[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('휴식')).click();window.__force={angle:-20,launch:15,v:double?50:35};window.__dbgIn=true;window.__dbgShot=(st,T)=>{if(st.swingT==null&&st.t>=T-.375){Math.random=()=>.01;document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));}}},!!process.env.DOUBLE);
await p.waitForSelector('#play');await p.evaluate(n=>window.__expectedBases=n,process.env.DOUBLE?2:1);
await p.evaluate(()=>{
 Math.random=()=>.01;window.__dt=1/8;window.__phases=[];window.__caught=false;window.__received=false;
 window.__defensePlay=d=>{if(!d.returnHit)throw Error('not hit retrieval');if(d.hitBases!==window.__expectedBases)throw Error('wrong hit runner route');if(!d.runner?.visible)throw Error('runner absent during recovery');if(d.phase==='throw')window.__runnerDuringThrow=true;if(d.t>=d.plan.total*.95){const target=d.hitBases===2?[0,-38.8]:[19.4,-19.4];if(Math.hypot(d.runner.position.x-target[0],d.runner.position.z-target[1])>.001)throw Error('runner did not reach hit base');window.__runnerArrived=true;}if(window.__phases.at(-1)!==d.phase)window.__phases.push(d.phase);if(d.phase==='transfer'&&d.k>.1&&!window.__caught){window.__caught=true;window.__dt=.00001;window.__capture=true;}if(d.phase==='throw'&&d.k>.4&&!window.__thrown){window.__thrown=true;window.__dt=.00001;window.__throwCapture=true;}if(d.phase==='receive'&&!window.__received){const {THREE}=window.__rk;const glove=d.receiver.userData.glove.localToWorld(new THREE.Vector3(0,0,.22));if(d.ball.position.distanceTo(glove)>1e-6||Math.hypot(d.receiver.position.x-3,d.receiver.position.z+41.8)>.001)throw Error('ball not in relay glove');window.__received=true;window.__dt=.00001;window.__receiveCapture=true;}};
});
await p.click('#play');await p.waitForFunction(()=>window.__capture,{timeout:60000});
async function renderShot(name){await p.screenshot({path:`/downloads/rookie9_hitreturn_bat_${process.env.DOUBLE?'double_':''}${name}${process.env.TEST_URL?'_live':''}.png`});}
await renderShot('pickup');await p.evaluate(()=>window.__dt=1/8);await p.waitForFunction(()=>window.__throwCapture,{timeout:60000});await p.screenshot({path:`/downloads/rookie9_hitreturn_throw_${process.env.DOUBLE?"double_bat":"bat"}${process.env.TEST_URL?'_live':''}.png`});await p.evaluate(()=>window.__dt=1/8);await p.waitForFunction(()=>window.__receiveCapture,{timeout:60000});await renderShot('receive');
const phaseCheck=await p.evaluate(()=>{const phases=[...window.__phases];window.__dt=1/8;return phases});if(phaseCheck.join(',')!=='approach,transfer,throw,receive')throw Error(phaseCheck);
await p.waitForSelector('#ok',{timeout:60000});const result=await p.evaluate(()=>window.__game.P.pendingResult.result);if(result.ab!==1||result.hits!==1||result.hr!==0)throw Error(JSON.stringify(result));const reset=await p.evaluate(()=>{const fs=[];window.__rk.scene.traverse(o=>{if(o.userData.home)fs.push(o)});return fs.every(o=>o.position.x===o.userData.home[0]&&o.position.z===o.userData.home[1])&&window.__rk.camera.fov===50});if(!reset)throw Error('reset');if(!await p.evaluate(()=>window.__runnerArrived&&window.__runnerDuringThrow))throw Error('concurrent runner assertions');console.log('batting hit return full1PA result after four field phases, runner and all7reset',phaseCheck,result);
if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
