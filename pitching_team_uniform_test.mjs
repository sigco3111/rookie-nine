import puppeteer from 'puppeteer-core';
import fs from 'fs';
const fontB64 = fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64');
const css = `@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:100 900}*{font-family:TKR,sans-serif!important}`;
const year=+(process.argv[2]||3), regular=process.argv[3]==='regular';
const b = await puppeteer.launch({ executablePath: '/usr/bin/google-chrome', headless: 'new', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage(); await p.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.text().includes('UNI')) errs.push(m.text()); });
await p.evaluateOnNewDocument((c) => { document.addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = c; document.head.appendChild(st); }); }, css);
await p.goto('http://localhost:8123/'); await new Promise(r => setTimeout(r, 1500));
await p.evaluate(() => document.querySelector('#new').click()); await new Promise(r => setTimeout(r, 300));
await p.evaluate(() => document.querySelector('#go').click()); await new Promise(r => setTimeout(r, 800));
// Create pitcher from title again so controls follow the real creation flow.
await p.click('#menu');await p.click('#t');await p.click('#new');await p.click('[data-p="pit"]');await p.click('#go');
await p.evaluate(({year,regular})=>{const p=window.__game.P;p.week=7+48*(year-1);p.injury=null;p.velo=p.ctrl=p.brk=p.stamina=p.field=p.speed=30;if(regular)p.ev.coach=p.ev.captain=p.ev.team=90;Math.random=()=>.99;window.__game.skipWeeks(0);document.querySelector('.cmd').click();},{year,regular});
await p.waitForSelector('#play');await p.click('#play');await p.waitForSelector('#throw');
const colors=await p.evaluate(()=>{
 const {scene}=window.__rk;let g;scene.traverse(o=>{if(o.children.filter(c=>c.userData.home).length===7)g=o;});
 if(!g)throw Error('game group missing');
 const shirt=o=>{const c=new Set();o.traverse(m=>{if(m.isMesh)for(const a of (Array.isArray(m.material)?m.material:[m.material]))if(a.userData.isShirt)c.add(a.color.getHexString());});return [...c];};
 const pitcher=g.children.find(o=>o.userData.hasGlove&&Math.abs(o.position.z+18.44)<.01);
 const batter=g.children.find(o=>o.userData.hasBat);
 return {pitcher:shirt(pitcher),batter:shirt(batter),fielders:g.children.filter(o=>o.userData.home).map(shirt),title:document.querySelector('#t').innerText};
});
const expected=['2b6cb0','1f8a70','d98a1f'][year-1];if(colors.pitcher[0]!==expected||colors.fielders.some(a=>a[0]!==expected)||colors.batter[0]===expected||!colors.title.includes(regular?'선발':'구원'))throw Error(JSON.stringify(colors));
await p.screenshot({path:'/downloads/rookie9_pitching_team_uniform.png'});console.log(colors);if(errs.length)throw Error(errs.join('|'));await b.close();
