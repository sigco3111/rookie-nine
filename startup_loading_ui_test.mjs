import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => {errs.push(e.message);console.log(e.message)}); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.evaluateOnNewDocument(()=>{const original=window.fetch;window.__modelRequests=0;window.fetch=(url,opts)=>{if(!String(url).includes('models/player.fbx'))return original(url,opts);window.__modelRequests++;return new Promise((resolve,reject)=>opts.signal.addEventListener('abort',()=>reject(new DOMException('Timeout test','AbortError')),{once:true}));};});
await p.goto(process.env.TEST_URL||'http://localhost:8123/',{waitUntil:'domcontentloaded'});await p.waitForSelector('#boot');const first=await p.$eval('#boot-status',e=>e.textContent);if(!first.includes('경기장'))throw Error(first);await p.screenshot({path:`/downloads/rookie9_startup_loading${process.env.TEST_URL?'_live':''}.png`});
await p.waitForFunction(()=>document.querySelector('#boot-status')?.textContent.includes('다시'),{timeout:15000});await p.screenshot({path:`/downloads/rookie9_startup_retry${process.env.TEST_URL?'_live':''}.png`});await p.waitForSelector('#new',{timeout:20000});if(await p.$('#boot'))throw Error('loading not removed');console.log('loading→retry→fallbacktitle, no stale overlay',await p.evaluate(()=>window.__modelRequests));if(errs.length)throw Error(errs.join('|'));await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}
