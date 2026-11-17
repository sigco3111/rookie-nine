import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto(process.env.TEST_URL||'http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(()=>{window.__game.P.money=1000;Math.random=()=>.99;[...document.querySelectorAll('.cmd')].find(b=>b.innerText.includes('쇼핑')).click();});
await p.click('[data-i="shoes"]');await p.click('#x');
await p.reload();await p.waitForSelector('#cont');await p.click('#cont');
const state=await p.evaluate(()=>{
 if(!window.__game.P.gear.shoes||window.__game.P.money!==920)throw Error('purchase save');
 const {scene,camera,renderer,THREE}=window.__rk;let pitcher;scene.traverse(o=>{if(o.userData.hasGlove&&o.visible&&Math.abs(o.position.x+.6)<.01)pitcher=o;});
 if(pitcher.userData.shoes.length!==2)throw Error('shoe count');for(const sh of pitcher.userData.shoes){if(sh.material.color.getHex()!==0xe53935||sh.parent.children.filter(c=>c.name==='shoe-sole').length!==1||sh.parent.children.filter(c=>c.name==='shoe-lace').length!==3)throw Error('trim missing');}window.__rk.setPitcherPose(pitcher,0);pitcher.rotation.y=0;const target=pitcher.position.clone();const c=new THREE.PerspectiveCamera(38,390/844,.1,200);
 c.position.set(target.x+.5,target.y+.65,target.z+1.25);c.lookAt(target.x,target.y+.04,target.z);renderer.render(scene,c);
 return {url:renderer.domElement.toDataURL('image/png'),parts:pitcher.userData.shoes.map(sh=>sh.parent.children.map(c=>({name:c.name,pos:c.getWorldPosition(new THREE.Vector3()).toArray()})))};
});
fs.writeFileSync(`/downloads/rookie9_shoe_trim${process.env.TEST_URL?'_live':''}.png`,Buffer.from(state.url.split(',')[1],'base64'));if(errs.length)throw Error(errs.join('|'));console.log('actual shoes purchase/reload: red uppers,2 soles/6 laces retained');await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
