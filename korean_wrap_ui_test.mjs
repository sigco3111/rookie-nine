import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const css=`@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64')})}*{font-family:TKR,sans-serif!important}`;
const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.evaluateOnNewDocument(c=>document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=c;document.head.append(s)}),css);
await page.goto(process.env.TEST_URL||'http://localhost:8123/');await page.waitForSelector('#new');await page.click('#new');await page.click('#go');const base=await page.evaluate(()=>structuredClone(window.__game.P));const report=[];
for(const width of [320,360,390,430])for(const kind of ['ending','match']){
 await page.setViewport({width,height:844,isMobile:true,hasTouch:true});
 await page.evaluate(({base,kind})=>{const p=structuredClone(base);if(kind==='ending'){p.done=true;p.week=144;p.result={rank:1,text:'1순위 지명! 전국이 주목하는 슈퍼 루키',team:'광주 타이거스',ovr:71,score:88};}else{p.week=7;p.ev={coach:99,captain:99,team:99,scout:15};p.pendingMatch={match:{kind:'league',name:'리그전'},msgs:[],previousTraits:[],before:{...p.ev,cond:p.cond},started:true};}localStorage.setItem('rookie9.save.v1',JSON.stringify(p));},{base,kind});
 await page.reload();await page.waitForSelector('#cont');await page.click('#cont');await page.waitForSelector(kind==='ending'?'#again':'#play');await page.evaluate(()=>document.fonts.ready);const snap=await page.evaluate(()=>JSON.stringify(window.__game.P));
 const rows=await page.evaluate(kind=>[...document.querySelectorAll(kind==='ending'?'.ending-result':'.match-copy')].map(e=>{const node=e.firstChild;const lineMap={};const walk=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);while(walk.nextNode()){const n=walk.currentNode;for(let i=0;i<n.length;i++){const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);const b=r.getBoundingClientRect();if(n.textContent[i].trim())lineMap[b.y]=(lineMap[b.y]||'')+n.textContent[i];}}return {lines:Object.values(lineMap),wordBreak:getComputedStyle(e).wordBreak,overflow:e.scrollWidth>e.clientWidth};}),kind);
 if(rows.some(r=>r.wordBreak!=='keep-all'||r.overflow||r.lines.some(x=>x.length===1)))throw Error(JSON.stringify({width,kind,rows}));
 if(await page.evaluate(()=>JSON.stringify(window.__game.P))!==snap)throw Error('layout mutated state');
 await page.screenshot({path:`/downloads/rookie9_wrap_${kind}_${width}${process.env.TEST_URL?'_live':''}.png`});report.push({width,kind,rows});
}
if(errors.length)throw Error(errors.join('|'));fs.writeFileSync(`/downloads/rookie9_wrap_report${process.env.TEST_URL?'_live':''}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();if(server)server.kill('SIGTERM');}
