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
await p.evaluate(()=>{
 Math.random=()=>0;window.__dt=1/30;window.__fs=[];window.__rk.scene.traverse(o=>{if(o.userData.home)window.__fs.push(o)});
 window.__watch=setInterval(()=>{const moved=window.__fs.filter(o=>Math.hypot(o.position.x-o.userData.home[0],o.position.z-o.userData.home[1])>1.5);if(moved.length===2&&!window.__moved){window.__moved=true;window.__dt=.00001;clearInterval(window.__watch);}},10);
});
await p.waitForFunction(()=>document.querySelector('#pi').innerText.includes('목표를'));await p.click('#throw');await p.waitForFunction(()=>window.__moved,{timeout:60000});
const shot=await p.evaluate(()=>{
 const{scene,renderer,THREE}=window.__rk;const moved=window.__fs.filter(o=>Math.hypot(o.position.x-o.userData.home[0],o.position.z-o.userData.home[1])>1.5);
 if(moved.length!==2)throw Error('not two fielders');if(window.__fs.some(o=>Math.abs(o.userData.head.rotation.y)>.60001))throw Error('head bound');if(!window.__fs.some(o=>Math.abs(o.userData.head.rotation.y)>.05))throw Error('no attention');const center=moved[1].position.clone(),gap=0;
 const c=new THREE.PerspectiveCamera(45,390/844,.1,300);c.position.set(center.x+5,5,center.z+9);c.lookAt(center.x,1,center.z);renderer.render(scene,c);
 return{url:renderer.domElement.toDataURL('image/png'),paths:moved.map(a=>({home:a.userData.home,pos:a.position.toArray()}))};
});
fs.writeFileSync(`/downloads/rookie9_defense_attention${process.env.TEST_URL?'_live':''}.png`,Buffer.from(shot.url.split(',')[1],'base64'));
await p.evaluate(()=>{window.__dt=1/15;window.__resetWatch=setInterval(()=>{if(window.__fs.every(o=>o.position.x===o.userData.home[0]&&o.position.z===o.userData.home[1]&&o.userData.legL.rotation.x===0&&o.userData.head.rotation.y===0)){window.__reset=true;clearInterval(window.__resetWatch)}},10)});
await p.waitForFunction(()=>window.__reset,{timeout:60000});
console.log('pitching two-field pursuit/backup and all7 reset passed',shot.paths);if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
