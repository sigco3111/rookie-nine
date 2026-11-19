import puppeteer from 'puppeteer-core';
import fs from 'fs';
import {spawn} from 'child_process';
const server=process.env.TEST_URL?null:spawn(process.execPath,['node_modules/vite/bin/vite.js','--host','127.0.0.1','--port','8123'],{stdio:'ignore'});
const css=`@font-face{font-family:TKR;src:url(data:font/woff2;base64,${fs.readFileSync('node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-700-normal.woff2').toString('base64')})}*{font-family:TKR,sans-serif!important}`;
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const pos=process.env.POS||'bat',seed=+(process.env.SEED||42);const p=await b.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
try{
 await p.evaluateOnNewDocument(c=>document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent=c;document.head.append(s)}),css);
 await p.goto(process.env.TEST_URL||'http://localhost:8123/');await p.waitForSelector('#new');await p.click('#new');await p.click(`[data-p="${pos}"]`);await p.click('#go');
 async function setup(){await p.evaluate(seed=>{let n=seed;Math.random=()=>{n=(1664525*n+1013904223)>>>0;return n/4294967296;};window.__rk.renderer.setPixelRatio(.25);},seed);}
 await setup();const log=[],reloads=[];const modalCounts={};
 for(let step=0;step<800;step++){
  const state=await p.evaluate(()=>({week:window.__game.P.week,done:window.__game.P.done,again:!!document.querySelector('#again'),pending:document.querySelector('.modal')?.innerText.slice(0,70)}));
  if(state.again)break;
  const action=await p.evaluate(()=>{
   for(const sel of ['#auto','#ok','#oklearned','#okrv','#okev','.modal [data-c]']){const el=document.querySelector(sel);if(el){el.click();return {type:sel,week:window.__game.P.week};}}
   const q=window.__game.P;if(q.done)throw Error('done without ending');
   const choices=[...document.querySelectorAll('.cmd')].filter(b=>!b.disabled);let name=q.injury?'치료':q.study<42?'공부':q.cond<45?'휴식':q.week%7===0?'멘탈훈련':q.week%5===0?'잡무':q.pos==='pit'?(q.week%2?'제구연습':'구속업'):(q.week%2?'배팅연습':'파워훈련');
   const el=choices.find(b=>b.innerText.includes(name))||choices.find(b=>b.innerText.includes('리프레쉬'));if(!el)throw Error('no command '+name);el.click();return {type:name,week:q.week};
  });
  log.push(action);modalCounts[action.type]=(modalCounts[action.type]||0)+1;
  const current=await p.evaluate(()=>window.__game.P.week);
  if(current<state.week||current>state.week+1)throw Error('week jump');
  if(current!==state.week&&[24,48,72,96,120,144].includes(current)){
   const before=await p.evaluate(()=>JSON.stringify(window.__game.P));await p.reload();await p.waitForSelector('#cont');await p.click('#cont');
   if(await p.evaluate(()=>JSON.stringify(window.__game.P))!==before)throw Error('reload changed career '+current);reloads.push(current);await setup();
   if(current===48||current===96)await p.screenshot({path:`/downloads/rookie9_career_${pos}_week${current}${process.env.TEST_URL?'_live':''}.png`});
  }
 }
 await p.waitForSelector('#again');const end=await p.evaluate(()=>({p:window.__game.P,h:window.__game.G.hof()}));if(end.p.week!==144||!end.p.done||end.h.length!==1||end.p.yearHistory.length!==2||end.h[0].yearReviews.length!==3)throw Error('bad ending '+JSON.stringify(end));
 for(const [k,v]of Object.entries(end.p)){if(typeof v==='number'&&!Number.isFinite(v))throw Error('nonfinite '+k);}
 await p.evaluate(()=>window.__rk.renderer.setPixelRatio(1));await p.screenshot({path:`/downloads/rookie9_career_${pos}_ending${process.env.TEST_URL?'_live':''}.png`});
 await p.reload();await p.waitForSelector('#cont');await p.click('#cont');await p.waitForSelector('#again');if(await p.evaluate(()=>window.__game.G.hof().length)!==1)throw Error('duplicate hof');
 await p.click('#again');await p.waitForSelector('#inh');await p.click(`[data-p="${pos}"]`);await p.select('#inh','0');await p.click('#go');await p.waitForSelector('#stat');const next=await p.evaluate(()=>window.__game.P);if(next.week!==0||next.done||!next.log.some(x=>x.includes('선배의 가르침')))throw Error('inheritance not applied');
 const report={pos,seed,mode:'UI commands, seeded random, automatic matches, no week/stat injection',modalCounts,reloads,week:end.p.week,stats:{ovr:end.h[0].ovr,wins:end.p.wins,losses:end.p.losses,ab:end.p.ab,hits:end.p.hits,traits:end.p.traits,result:end.p.result},events:end.p.eventHistory?.length,matchHistory:end.p.matchHistory?.length,yearReviews:end.h[0].yearReviews.length,inheritance:next.log.slice(0,2),errors:errs};fs.writeFileSync(`/downloads/rookie9_career_${pos}_report${process.env.TEST_URL?'_live':''}.json`,JSON.stringify(report,null,2));if(errs.length)throw Error(errs.join('|'));console.log(JSON.stringify(report,null,2));
}finally{await b.close();if(server){const done=new Promise(r=>server.once('exit',r));server.kill('SIGTERM');await done;}}
