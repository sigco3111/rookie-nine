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
const shot=await p.evaluate(async()=>{
 const {defensivePursuit,resetDefense}=await import('/src/match.js');const {scene,renderer,THREE}=window.__rk;const fs=[];scene.traverse(o=>{if(o.userData.home)fs.push(o)});const animate=defensivePursuit(fs,-22,-25);animate(100);
 const moved=fs.filter(o=>Math.hypot(o.position.x-o.userData.home[0],o.position.z-o.userData.home[1])>.01);if(moved.length!==2)throw Error('roles');for(const f of moved){if(f.userData.legL.rotation.x!==0||Math.abs(f.rotation.y-Math.atan2(-f.position.x,-f.position.z))>.0001)throw Error('not settled toward plate')}
 const c=new THREE.PerspectiveCamera(40,390/844,.1,300);c.position.set(-14,10,-4);c.lookAt(-22,2,-28);renderer.render(scene,c);const url=renderer.domElement.toDataURL('image/png');resetDefense(fs);if(fs.some(f=>f.position.x!==f.userData.home[0]||f.position.z!==f.userData.home[1]))throw Error('reset');return {url};
});fs.writeFileSync('/downloads/rookie9_defense_settled.png',Buffer.from(shot.url.split(',')[1],'base64'));
console.log('two arrivals settle ready facing plate, all reset');if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
