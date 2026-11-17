import puppeteer from 'puppeteer-core';
import fs from 'fs';
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
const colors=await p.evaluate(()=>{
 const {scene}=window.__rk;let g;scene.traverse(o=>{if(o.children.filter(c=>c.userData.home).length===7)g=o;});
 if(!g)throw Error('game group missing');
 const shirt=o=>{const c=new Set();o.traverse(m=>{if(m.isMesh)for(const a of (Array.isArray(m.material)?m.material:[m.material]))if(a.userData.isShirt)c.add(a.color.getHexString());});return [...c];};
 const validateCap=a=>{let shirt;const caps=[];a.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material])){if(m.userData.isShirt)shirt=m.color;if(m.userData.isCap)caps.push(m.color)}});if(!caps.length||caps.some(c=>!c.equals(shirt.clone().multiplyScalar(.48))))throw Error('cap mismatch')};
 const pitcher=g.children.find(o=>o.userData.hasGlove&&Math.abs(o.position.z+18.44)<.01);
 const batter=g.children.find(o=>o.userData.hasBat);
 [pitcher,batter,...g.children.filter(o=>o.userData.home)].forEach(validateCap);
 return {gear:{pitcherShoes:pitcher.userData.shoes.map(x=>x.material.color.getHexString()),pitcherGlove:pitcher.userData.glove.material.color.getHexString(),opponentShoes:batter.userData.shoes.map(x=>x.material.color.getHexString()),opponentBat:batter.userData.bat.material.color.getHexString()},pitcher:shirt(pitcher),batter:shirt(batter),fielders:g.children.filter(o=>o.userData.home).map(shirt),title:document.querySelector('#t').innerText};
});
const expected=['2b6cb0','1f8a70','d98a1f'][year-1];if(colors.pitcher[0]!==expected||colors.fielders.some(a=>a[0]!==expected)||colors.batter[0]===expected||!colors.title.includes(regular?'선발':'구원'))throw Error(JSON.stringify(colors));
if(colors.gear.pitcherShoes.some(c=>c!=='e53935')||colors.gear.pitcherGlove!=='f2c94c'||colors.gear.opponentShoes.some(c=>c!=='222222')||colors.gear.opponentBat!=='deb887')throw Error(JSON.stringify(colors));
await p.screenshot({path:`/downloads/rookie9_gear_ownership${process.env.TEST_URL?'_live':''}.png`});const closeURL=await p.evaluate(()=>{const {scene,renderer,THREE}=window.__rk;let a;scene.traverse(o=>{if(o.userData.hasGlove&&Math.abs(o.position.z+18.44)<.01)a=o;});const c=new THREE.PerspectiveCamera(40,390/844,.1,200);c.position.set(a.position.x+2,1.8,a.position.z+3.5);c.lookAt(a.position.x,.9,a.position.z);renderer.render(scene,c);return renderer.domElement.toDataURL('image/png');});
fs.writeFileSync(`/downloads/rookie9_gear_player${process.env.TEST_URL?'_live':''}.png`,Buffer.from(closeURL.split(',')[1],'base64'));
console.log(colors);if(errs.length)throw Error(errs.join('|'));await b.close();
