import puppeteer from 'puppeteer-core';
import fs from 'fs';
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const pos of ['bat','pit']){
 const p=await b.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto(process.env.TEST_URL||'http://localhost:8123/');await p.waitForSelector('#new');await p.click('#new');await p.click(`[data-p="${pos}"]`);await p.click('#go');
 for(const year of [1,2,3]){
  await p.evaluate(year=>{window.__game.P.week=(year-1)*48;window.__game.skipWeeks(0)},year);
  const state=await p.evaluate(({pos,year})=>{const{scene,renderer,THREE}=window.__rk;let actor;scene.traverse(o=>{if(o.visible&&(pos==='bat'?o.userData.hasBat:o.userData.hasGlove)&&Math.abs(o.position.x+.6)<.01)actor=o});
   const caps=new Set(),shirts=new Set();actor.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material])){if(m.userData.isCap)caps.add(m.color.getHexString());if(m.userData.isShirt)shirts.add(m.color.getHexString());}});
   const expected=new THREE.Color([0x2b6cb0,0x1f8a70,0xd98a1f][year-1]).multiplyScalar(.48).getHexString();if(caps.size!==1||!caps.has(expected))throw Error('wrong cap');const shirtExpected=new THREE.Color([0x2b6cb0,0x1f8a70,0xd98a1f][year-1]).getHexString();if(shirts.size!==1||!shirts.has(shirtExpected))throw Error('wrong shirt');
   const v=actor.position,c=new THREE.PerspectiveCamera(38,390/844,.1,200);c.position.set(v.x+1.5,v.y+1,v.z+2.8);c.lookAt(v.x,v.y+.5,v.z);renderer.render(scene,c);return{url:renderer.domElement.toDataURL('image/png'),caps:[...caps],shirts:[...shirts]};
  },{pos,year});
  fs.writeFileSync(`/downloads/rookie9_cap_${pos}_${year}${process.env.TEST_URL?'_live':''}.png`,Buffer.from(state.url.split(',')[1],'base64'));console.log(pos,year,state.caps,state.shirts);
 }
 if(errs.length)throw Error(errs.join('|'));await p.close();
}
await b.close();
