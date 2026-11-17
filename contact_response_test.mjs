import puppeteer from 'puppeteer-core';
import fs from 'fs';
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;

const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
p.on('framenavigated', () => {}); const errs = []; p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()); });

await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.screenshot({ path: '/tmp/a_title.png' });
await p.evaluate(() => [...document.querySelectorAll('button')].find(b => b.id === 'new').click());
await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
await p.screenshot({ path: '/tmp/a_home.png' });
// 훈련 몇 번
for (let i = 0; i < 3; i++) { await p.evaluate(() => document.querySelectorAll('.cmd')[3].click()); await new Promise(r => setTimeout(r, 300)); await p.evaluate(() => { const m = document.querySelector('.modal [data-c]'); if (m) m.click(); }); await new Promise(r => setTimeout(r, 300)); }
await p.screenshot({ path: '/tmp/a_home2.png' });
// 시합 주로 이동: 5월 4주 = week 4*1+3 -> (month5 index: week/4 =1 → month=((1+3)%12)+1=5) wk4 => week 7
await p.evaluate(() => { const g = window.__game; g.P.week = 7; g.P.injury = null; g.P.cond = 90; g.G.save(g.P); });
await p.evaluate(() => window.__game.skipWeeks(0));
await p.evaluate(() => document.querySelectorAll('.cmd')[3].click()); await new Promise(r => setTimeout(r, 400));
await p.screenshot({ path: '/tmp/a_prompt.png' });
const offset=Number(process.argv[2]||0),tag=process.argv[3]||'perfect';
await p.evaluate((offset)=>{
 window.__dbgIn=true;window.__dt=1/60;Math.random=()=>0.2;window.__shots=[];window.__timing=[];window.__response=null;window.__flog=(ball,cam,k)=>{if(k<0.3){const {renderer,scene}=window.__rk;renderer.render(scene,cam);window.__shots.push(renderer.domElement.toDataURL('image/png'));}};window.__contactLog=x=>window.__response=x;let swung=false,firstT=null;
 window.__dbgShot=(st,T,o)=>{firstT??=T;if(!swung&&st.t>=T-0.075+offset){swung=true;document.querySelector('.swing').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));}if(st.t>=T-0.24&&st.t<=T+0.21&&window.__shots.length<27){const {renderer,scene,camera,THREE}=window.__rk;renderer.render(scene,camera);const bat=o.batter.userData.batMesh;const a=bat.localToWorld(new THREE.Vector3(0,-.425,0)),b=bat.localToWorld(new THREE.Vector3(0,.425,0));const delta=b.clone().sub(a);const k=Math.max(0,Math.min(1,o.ball.position.clone().sub(a).dot(delta)/delta.lengthSq()));const near=a.clone().addScaledVector(delta,k);window.__shots.push(renderer.domElement.toDataURL('image/png'));window.__timing.push({t:st.t,T,swingT:st.swingT,phase:st.swingAnim,distance:near.distanceTo(o.ball.position),ball:o.ball.position.toArray(),batA:a.toArray(),batB:b.toArray()});}};
},offset);
await p.click('#play');await p.waitForFunction(()=>window.__response,{timeout:60000});await new Promise(r=>setTimeout(r,12000));const data=await p.evaluate(()=>({shots:window.__shots,timing:window.__timing}));fs.mkdirSync('/downloads/'+tag,{recursive:true});data.shots.forEach((url,i)=>fs.writeFileSync('/downloads/'+tag+'/frame_'+String(i).padStart(3,'0')+'.png',Buffer.from(url.split(',')[1],'base64')));fs.writeFileSync('/downloads/'+tag+'/timing.json',JSON.stringify(data.timing,null,2));const hit=data.timing.filter(x=>x.swingT!=null).reduce((a,b)=>!a||a.distance>b.distance?b:a,null);console.log(tag,'response',await p.evaluate(()=>window.__response),'closest',hit);console.log(errs.join('|')||'no errors');await b.close();
