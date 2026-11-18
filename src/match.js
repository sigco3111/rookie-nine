import { baseRunStep, walkAdvance } from './bases.js';
import { defensePaths, defenseStep, defenseLookYaw, groundOutPlan, groundOutPhase, airOutPlan, airOutStep, hitRunStep, groundRace, foulBallStep } from './defense.js';
import { TRAITS } from './data.js';
import { THREEX as THREE, scene, camera, renderer, makeChibi, setBatterPose, setPitcherPose, addShadow, setUniform, setShirt, OPP_COLORS } from './scene.js';
import { cal, battingWindow, oppStrength, teamStrength, isRegular, rnd, chance, applyMatchResult } from './growth.js';
import { TEAMS } from './data.js';
import { sfx } from './audio.js';

const ZW = 0.45, ZH = 0.4, ZY = 0.9;
const PITCHES = [{ n: '직구', Tm: 1, c: 0, drop: 0 }, { n: '커브', Tm: 1.38, c: 0.55, drop: 0.35 }, { n: '슬라이더', Tm: 1.12, c: -0.5, drop: 0.1 }, { n: '체인지업', Tm: 1.28, c: 0.05, drop: 0.2 }];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let G = null; // 현재 씬 요소
const tickers = new Set();
const permanent = new Set();
export const addTicker = (f) => tickers.add(f);
export const delTicker = (f) => tickers.delete(f);
let last = performance.now();
export function frame() { const n = performance.now(); const dt = window.__dt || Math.min(0.05, (n - last) / 1000); last = n; for (const f of [...tickers]) f(dt, n / 1000); for (const f of permanent) f(dt); renderer.render(scene, camera); requestAnimationFrame(frame); }

function fielderReady(f) {
  const u = f.userData;
  u.head.rotation.set(0,0,0);
  u.body.rotation.x = 0.12;
  u.armL.rotation.set(-0.55, 0, 0.15); u.armR.rotation.set(-0.4, 0, -0.15);
  u.armL.elbow = u.armR.elbow = 0.65;
  u.legL.rotation.set(0, 0, 0.10); u.legR.rotation.set(0, 0, -0.10);
}
export function resetDefense(fielders) {
  for (const fd of fielders) { fd.position.set(fd.userData.home[0], 0, fd.userData.home[1]); fielderReady(fd); fd.rotation.y = Math.atan2(-fd.position.x, -fd.position.z); }
}
export function defensivePursuit(fielders, x, z) {
  // 타구 추적과 뒤를 받치는 이동 연출. 포구/송구/안타 판정과는 별개다.
  const paths = defensePaths(fielders.map(fd=>fd.userData.home),x,z);
  return t => {
    for (const path of paths) {
      const fd=fielders[path.index], step=defenseStep(path,t);
      fd.position.set(step.x,0,step.z);
      if(step.moving) fd.rotation.y=Math.atan2(path.target[0]-path.home[0],path.target[1]-path.home[1]);
      else if(t>=path.delay) fd.rotation.y=Math.atan2(-fd.position.x,-fd.position.z);
      fielderReady(fd);
      if(step.moving){
        const u=fd.userData,stride=Math.sin(t*13)*Math.min(1,step.remaining/3);
        u.legL.rotation.x=stride*.65;u.legR.rotation.x=-stride*.65;
        u.armL.rotation.x=-.55-stride*.45;u.armR.rotation.x=-.4+stride*.45;
      }
    }
    for(const fd of fielders) fd.userData.head.rotation.y=t<.18?0:defenseLookYaw(fd.position.x,fd.position.z,fd.rotation.y,x,z);
  };
}
export function showBaseRunners(o,mask,advance=0,progress=0,t=0){
  o.baseRunners.forEach((r,i)=>{const pos=baseRunStep(i+1,advance,advance?progress*advance/Math.min(advance,3-i):progress);r.visible=!!(mask&(1<<i))&&!pos.scored;
    r.position.set(pos.x,pos.arrived?0:Math.abs(Math.sin(t*14))*.12,pos.z);r.rotation.y=pos.yaw;
    r.userData.legL.rotation.x=pos.arrived?0:Math.sin(t*14);r.userData.legR.rotation.x=pos.arrived?0:-Math.sin(t*14);
  });
}
// Walk and ground-force paths share the same forced advancement chain.
export function showForcedRunners(o,mask,progress,t=0){
 o.baseRunners.forEach((r,i)=>{const advance=walkAdvance(mask,i+1),pos=baseRunStep(i+1,advance,progress);r.visible=!!(mask&(1<<i))&&!pos.scored;
 r.position.set(pos.x,pos.arrived?0:Math.abs(Math.sin(t*14))*.12,pos.z);r.rotation.y=pos.yaw;
 r.userData.legL.rotation.x=pos.arrived?0:Math.sin(t*14);r.userData.legR.rotation.x=pos.arrived?0:-Math.sin(t*14);});
}
export function completeGroundOut(o,hud,{runner=false,returnHit=false,hitBases=1,priorBases=0,raceSpeed=0,runnerElapsed=0,forceBase=0,forceMask=0,returnPitcher=false}={}) {
  const defenders=forceBase===4?[...o.fielders,o.catcher]:o.fielders;
  const catcherRestore=forceBase===4?{position:o.catcher.position.clone(),rotation:o.catcher.rotation.clone(),parts:['head','body','armL','armR','legL','legR'].map(key=>({key,rotation:o.catcher.userData[key].rotation.clone(),elbow:o.catcher.userData[key].elbow}))}:null;
  const forceName=forceBase===4?'홈':`${forceBase}루`;
  const ball=o.ball,land=[ball.position.x,ball.position.z],positions=defenders.map(f=>[f.position.x,f.position.z]);
  const plan=groundOutPlan(positions,land,returnHit?[3,-41.8]:forceBase?[[0,0],[19.4,-19.4],[0,-38.8],[-19.4,-19.4],[0,0]][forceBase]:[19.4,-19.4],forceBase===4?defenders.length-1:null);if(!plan)return Promise.resolve();
  const race=raceSpeed?groundRace(plan,runnerElapsed,raceSpeed):null;const total=race?Math.max(plan.total,race.runnerTime-runnerElapsed+.25):plan.total;
  const collector=defenders[plan.collector],receiver=defenders[plan.receiver],start=ball.position.clone();
  const groundStart=start.clone();if(returnHit)groundStart.y=.15;
  const point=(f,glove=true)=>{f.userData.sync?.();f.updateWorldMatrix(true,true);return glove?f.userData.glove.localToWorld(new THREE.Vector3(0,0,.22)):(f.userData.throwHand||f.userData.armR).getWorldPosition(new THREE.Vector3());};
  const run=(f,from,to,k,t)=>{f.position.set(from[0]+(to[0]-from[0])*k,0,from[1]+(to[1]-from[1])*k);f.rotation.y=Math.atan2(to[0]-from[0],to[1]-from[1]);fielderReady(f);const stride=k<1?Math.sin(t*13):0;f.userData.legL.rotation.x=stride*.65;f.userData.legR.rotation.x=-stride*.65;};
  ball.visible=true;ball.scale.setScalar(2);let t=0,lastPhase='',release=null;
  const oldFov=camera.fov,oldBatter=o.batter.visible,pitcherHome=o.pitcher.position.clone();
  const clearPitcher=o.pitcher.visible&&Math.hypot(pitcherHome.x-land[0],pitcherHome.z-land[1])<5;
  const clearDir=new THREE.Vector3(pitcherHome.x-land[0],0,pitcherHome.z-land[1]);if(clearDir.length()<.1)clearDir.set(-1,0,0);clearDir.normalize().multiplyScalar(5);
  const pitcherCover=new THREE.Vector3(land[0]+clearDir.x,pitcherHome.y,land[1]+clearDir.z);
  if(runner){o.runner.visible=true;o.batter.visible=false;}
  camera.position.set((land[0]+plan.base[0])/2+12,Math.max(24,Math.abs(land[1]-plan.base[1])*.6),(land[1]+plan.base[1])/2+32);camera.lookAt((land[0]+plan.base[0])/2,1,(land[1]+plan.base[1])/2);
  if((returnHit||race)&&runner){camera.fov=76;camera.updateProjectionMatrix();camera.position.set(0,42,28);camera.lookAt(0,0,-28);if(race){camera.position.x=5;camera.lookAt(5,0,-28);}}
  return new Promise(resolve=>{const f=dt=>{t+=dt;const state=groundOutPhase(plan,t),{phase,k}=state;
    if(phase!==lastPhase){lastPhase=phase;hud.setPitch((returnHit?{approach:'안타 타구 회수',transfer:'공 확보 · 중계 준비',throw:'내야로 중계 송구',receive:'중계 수신'}:{approach:'땅볼 처리 · 공으로 접근',transfer:'포구 · 송구 준비',throw:forceBase?`${forceName} 포스 송구`:'1루 송구',receive:forceBase?(race.safe?`${forceName} 세이프 · 야수선택`:`${forceName} 포스 아웃`):race?(race.safe?'1루 세이프 · 내야 안타':'1루 아웃'):'1루 포구'})[phase]);}
    if(phase==='approach'){
      run(collector,positions[plan.collector],land,k,t);run(receiver,positions[plan.receiver],plan.base,k,t);
      ball.position.copy(start).lerp(groundStart,k);collector.userData.body.rotation.x=.12+.55*k;
    }else{
      collector.position.set(land[0],0,land[1]);receiver.position.set(plan.base[0],0,plan.base[1]);fielderReady(collector);fielderReady(receiver);
      collector.rotation.y=Math.atan2(plan.base[0]-land[0],plan.base[1]-land[1]);receiver.rotation.y=Math.atan2(land[0]-plan.base[0],land[1]-plan.base[1]);
      if(phase==='transfer'){
        collector.userData.body.rotation.x=.6*(1-k);collector.userData.armR.rotation.x=-2.1*k;
        const gl=point(collector),hand=point(collector,false);ball.position.copy(k<.45?groundStart.clone().lerp(gl,k/.45):gl.lerp(hand,(k-.45)/.55));
      }else if(phase==='throw'){
        collector.userData.armR.rotation.x=-2.1+2.8*k;collector.userData.body.rotation.x=.3*k;
        if(!release)release=ball.position.clone();const end=point(receiver);ball.position.copy(release).lerp(end,k);ball.position.y+=Math.sin(Math.PI*k)*1.8;
      }else{ball.position.copy(point(receiver));}
    }
    if(clearPitcher)o.pitcher.position.copy(pitcherHome).lerp(pitcherCover,Math.min(1,t/plan.approach));
    if(runner){const u=Math.min(1,race?(t+runnerElapsed)/race.runnerTime:t/(returnHit?plan.total*.85:plan.total+.35)),pos=hitRunStep(returnHit?hitBases:1,u);const through=race&&!forceBase?Math.min(2,Math.max(0,t+runnerElapsed-race.runnerTime)*raceSpeed):0;o.runner.position.set(pos.x+through/Math.SQRT2,pos.arrived?0:Math.abs(Math.sin(t*14))*.12,pos.z-through/Math.SQRT2);o.runner.rotation.y=pos.yaw;o.runner.userData.legL.rotation.x=pos.arrived?0:Math.sin(t*14);o.runner.userData.legR.rotation.x=pos.arrived?0:-Math.sin(t*14);}
    if(forceBase){showForcedRunners(o,forceMask,Math.min(1,(t+runnerElapsed)/race.runnerTime),t);if(phase==='receive'&&!race.safe)o.baseRunners[forceBase-2].visible=false;}
    if(priorBases&&returnHit)showBaseRunners(o,priorBases,hitBases,Math.min(1,t/(plan.total*.85)),t);
    window.__defensePlay?.({phase,k,t,plan,ball,collector,receiver,returnHit,runner:runner?o.runner:null,hitBases,baseRunners:o.baseRunners,priorBases,race,forceSecond:forceBase===2,forceBase,forceMask});
    if(t>=total){delTicker(f);const finish=()=>{ball.visible=false;ball.scale.setScalar(1);if(runner){o.runner.visible=false;o.batter.visible=oldBatter;}camera.fov=oldFov;camera.updateProjectionMatrix();o.pitcher.position.copy(pitcherHome);resetDefense(o.fielders);if(catcherRestore){o.catcher.position.copy(catcherRestore.position);o.catcher.rotation.copy(catcherRestore.rotation);for(const part of catcherRestore.parts){o.catcher.userData[part.key].rotation.copy(part.rotation);o.catcher.userData[part.key].elbow=part.elbow;}}resolve(race);};if(returnPitcher){o.pitcher.position.copy(pitcherHome);returnGroundBall(o,hud,receiver).then(finish);}else finish();}
  };tickers.add(f);});
}
// This return starts only after the ground-play race has finished.
function returnGroundBall(o,hud,receiver){
 const arm=receiver.userData.armR.rotation.clone(),pitArm=o.pitcher.userData.armL.rotation.clone();
 const point=(f,key)=>{f.userData.sync?.();f.updateWorldMatrix(true,true);return f.userData[key].getWorldPosition(new THREE.Vector3());};
 receiver.rotation.y=Math.atan2(o.pitcher.position.x-receiver.position.x,o.pitcher.position.z-receiver.position.z);
 const start=o.ball.position.clone(),duration=Math.max(.65,receiver.position.distanceTo(o.pitcher.position)/24);let t=0,release=null;
 camera.position.set(5,42,28);camera.lookAt(0,0,-28);hud.setPitch('수신 후 · 투수에게 반환');
 return new Promise(resolve=>{const f=dt=>{t+=dt;let k=0;
  if(t<.35){k=t/.35;receiver.userData.armR.rotation.x=arm.x-1.7*k;o.ball.position.copy(start).lerp(point(receiver,'throwHand'),k);}
  else{k=Math.min(1,(t-.35)/duration);receiver.userData.armR.rotation.x=arm.x-1.7+2.4*k;o.pitcher.userData.armL.rotation.x=pitArm.x-.4*k;if(!release)release=point(receiver,'throwHand');const target=point(o.pitcher,'glove');o.ball.position.copy(release).lerp(target,k);o.ball.position.y+=Math.sin(Math.PI*k)*2;window.__groundReturn?.({phase:'return',t,k,ball:o.ball,target,receiver,pitcher:o.pitcher});}
  if(t>=.35+duration+.3){delTicker(f);receiver.userData.armR.rotation.copy(arm);o.pitcher.userData.armL.rotation.copy(pitArm);resolve();}
 };tickers.add(f);});
}
// Uncaught foul: shared by both roles, without fielder chase or runner advance.
export function runFoul(o,hud,side=1){
 const oldFov=camera.fov,oldPosition=camera.position.clone(),oldQuaternion=camera.quaternion.clone();let t=0;
 hud.setBattingActive?.(false);hud.setPitchingActive?.(false,true);hud.setPitch('파울 · 라인 밖 타구');
 const zone=o.zone.visible,ret=o.ret.visible;o.zone.visible=false;o.ret.visible=false;o.ball.visible=true;o.ball.scale.setScalar(2);
 camera.fov=90;camera.updateProjectionMatrix();camera.position.set(0,48,38);camera.lookAt(0,0,-23);
 return new Promise(resolve=>{const f=dt=>{t+=dt;const pos=foulBallStep(side,t/1.6);o.ball.position.set(pos.x,pos.y,pos.z);
  if(pos.landed)hud.setPitch('파울 · 데드볼');
  window.__foulPlay?.({ball:o.ball,t,side,landed:pos.landed,baseRunners:o.baseRunners});
  if(t>=2){delTicker(f);o.ball.visible=false;o.ball.scale.setScalar(1);o.zone.visible=zone;o.ret.visible=ret;camera.fov=oldFov;camera.updateProjectionMatrix();camera.position.copy(oldPosition);camera.quaternion.copy(oldQuaternion);resolve();}
 };tickers.add(f);});
}
// A completed home run still visits every base before the score/result advances.
export function runHomeRun(o,hud,priorBases=0){
  const runner=o.runner,oldBatter=o.batter.visible,oldFov=camera.fov;
  runner.visible=true;o.batter.visible=false;o.ball.visible=false;
  hud.setPitch('홈런 · 베이스 러닝');
  camera.fov=76;camera.updateProjectionMatrix();camera.position.set(0,42,28);camera.lookAt(0,0,-28);
  let t=0;const duration=3.6,hold=.35;
  return new Promise(resolve=>{const f=dt=>{t+=dt;const pos=hitRunStep(4,t/duration);
    runner.position.set(pos.x,pos.arrived?0:Math.abs(Math.sin(t*14))*.15,pos.z);runner.rotation.y=pos.yaw;
    runner.userData.legL.rotation.x=pos.arrived?0:Math.sin(t*14);runner.userData.legR.rotation.x=pos.arrived?0:-Math.sin(t*14);
    if(priorBases)showBaseRunners(o,priorBases,4,t/duration,t);
    window.__homeRunPlay?.({runner,t,duration,arrived:pos.arrived,baseRunners:o.baseRunners,priorBases});
    if(t>=duration+hold){delTicker(f);runner.visible=false;o.batter.visible=oldBatter;camera.fov=oldFov;camera.updateProjectionMatrix();resolve();}
  };tickers.add(f);});
}
// Walk advancement uses the force chain, never advances an unforced runner.
export function runWalk(o,hud,mask){
  const oldBatter=o.batter.visible,oldFov=camera.fov;let t=0;const duration=2.4,hold=.3;
  o.runner.visible=true;o.batter.visible=false;o.ball.visible=false;hud.setPitch('볼넷 · 강제 진루');
  camera.fov=76;camera.updateProjectionMatrix();camera.position.set(0,42,28);camera.lookAt(0,0,-28);
  return new Promise(resolve=>{const f=dt=>{t+=dt;const u=Math.min(1,t/duration);
    const move=(r,start,advance)=>{const pos=baseRunStep(start,advance,u);r.visible=!pos.scored;r.position.set(pos.x,pos.arrived?0:Math.abs(Math.sin(t*9))*.07,pos.z);r.rotation.y=pos.yaw;r.userData.legL.rotation.x=pos.arrived?0:Math.sin(t*9)*.45;r.userData.legR.rotation.x=pos.arrived?0:-Math.sin(t*9)*.45;};
    move(o.runner,0,1);o.baseRunners.forEach((r,i)=>{if(mask&(1<<i))move(r,i+1,walkAdvance(mask,i+1));else r.visible=false;});
    window.__walkPlay?.({runner:o.runner,baseRunners:o.baseRunners,t,duration,mask});
    if(t>=duration+hold){delTicker(f);o.runner.visible=false;o.batter.visible=oldBatter;camera.fov=oldFov;camera.updateProjectionMatrix();resolve();}
  };tickers.add(f);});
}
export function runFollowupScore(o,hud,start){
  const oldBatter=o.batter.visible,oldFov=camera.fov;let t=0;const duration=(4-start)*.9;
  o.runner.visible=true;o.batter.visible=false;hud.setPitch('후속 안타 · 홈으로');
  camera.fov=76;camera.updateProjectionMatrix();camera.position.set(0,42,28);camera.lookAt(0,0,-28);
  return new Promise(resolve=>{const f=dt=>{t+=dt;const pos=baseRunStep(start,4-start,t/duration),r=o.runner;
    r.position.set(pos.x,pos.arrived?0:Math.abs(Math.sin(t*14))*.12,pos.z);r.rotation.y=pos.yaw;r.userData.legL.rotation.x=pos.arrived?0:Math.sin(t*14);r.userData.legR.rotation.x=pos.arrived?0:-Math.sin(t*14);
    window.__followupRun?.({runner:r,t,duration,start,arrived:pos.arrived});
    if(t>=duration+.3){delTicker(f);r.visible=false;o.batter.visible=oldBatter;camera.fov=oldFov;camera.updateProjectionMatrix();resolve();}
  };tickers.add(f);});
}
// Flight duration includes the collector's travel. Ball stays live until glove hold ends.
export function airOutSequence(o,hud,landing,minDuration,returnPitcher=false){
  const plan=airOutPlan(o.fielders.map(f=>[f.position.x,f.position.z]),landing,minDuration);
  if(!plan)return null;
  const collector=o.fielders[plan.collector],pitcherHome=o.pitcher.position.clone();
  const clearPitcher=o.pitcher.visible&&Math.hypot(pitcherHome.x-landing[0],pitcherHome.z-landing[1])<5;
  const away=new THREE.Vector3(pitcherHome.x-landing[0],0,pitcherHome.z-landing[1]);if(away.length()<.1)away.set(-1,0,0);away.normalize().multiplyScalar(5);
  const pitcherCover=new THREE.Vector3(landing[0]+away.x,pitcherHome.y,landing[1]+away.z);
  const glove=()=>{collector.userData.sync?.();collector.updateWorldMatrix(true,true);return collector.userData.glove.localToWorld(new THREE.Vector3(0,0,.22));};
  const step=t=>{
    if(clearPitcher)o.pitcher.position.copy(pitcherHome).lerp(pitcherCover,Math.min(1,t/plan.duration));
    const pos=airOutStep(plan,t);collector.position.set(pos.x,0,pos.z);fielderReady(collector);
    collector.rotation.y=Math.atan2(-landing[0],-landing[1]);
    const stride=pos.k<1?Math.sin(t*13):0;collector.userData.legL.rotation.x=stride*.65;collector.userData.legR.rotation.x=-stride*.65;
    collector.userData.armL.rotation.x=-.55-Math.min(1,t/plan.duration)*.6;
    for(const fd of o.fielders)fd.userData.head.rotation.y=defenseLookYaw(fd.position.x,fd.position.z,fd.rotation.y,o.ball.position.x,o.ball.position.z);
    return glove();
  };
  const finish=()=>new Promise(resolve=>{
    hud.setPitch('뜬공 포구');sfx.mitt();let t=0;o.ball.scale.setScalar(2);
    camera.position.set(landing[0]+10,13,landing[1]+19);camera.lookAt(landing[0],2,landing[1]);
    const throwTime=Math.max(.65,Math.hypot(landing[0]-pitcherHome.x,landing[1]-pitcherHome.z)/24),total=returnPitcher?1+throwTime+.3:.65;
    const arm=o.pitcher.userData.armL.rotation.clone();let release=null;
    const point=(f,key)=>{f.userData.sync?.();f.updateWorldMatrix(true,true);return f.userData[key].getWorldPosition(new THREE.Vector3());};
    const f=dt=>{t+=dt;
      if(!returnPitcher||t<=.65){o.ball.position.copy(glove());window.__airOutPlay?.({phase:'caught',t,plan,ball:o.ball,collector});}
      else{
        // Restore pitcher to mound before receiving the return; collector stays at catch.
        o.pitcher.position.copy(pitcherHome);collector.rotation.y=Math.atan2(pitcherHome.x-landing[0],pitcherHome.z-landing[1]);
        camera.position.set(5,42,28);camera.lookAt(0,0,-28);
        if(t<1){const k=(t-.65)/.35;hud.setPitch('포구 후 · 투수에게 반환');collector.userData.armR.rotation.x=-2.1*k;o.ball.position.copy(glove()).lerp(point(collector,'throwHand'),k);}
        else{const k=Math.min(1,(t-1)/throwTime);collector.userData.armR.rotation.x=-2.1+2.8*k;o.pitcher.userData.armL.rotation.x=arm.x-.4*k;if(!release)release=point(collector,'throwHand');const target=point(o.pitcher,'glove');o.ball.position.copy(release).lerp(target,k);o.ball.position.y+=Math.sin(Math.PI*k)*2;
          window.__airReturn?.({t,k,ball:o.ball,target,collector,pitcher:o.pitcher});}
      }
      if(t>=total){delTicker(f);o.ball.visible=false;o.ball.scale.setScalar(1);o.pitcher.position.copy(pitcherHome);o.pitcher.userData.armL.rotation.copy(arm);resetDefense(o.fielders);resolve();}};tickers.add(f);
  });
  return {plan,step,finish};
}
function ensureG() {
  if (G) return G;
  const g = new THREE.Group();
  const batter = makeChibi({ shirt: 0x2b6cb0, cap: 0x1a365d, bat: true, helmet: true, num: 9 }); batter.position.set(-0.5, 0, 0.2); batter.scale.setScalar(0.72); batter.rotation.y = Math.PI / 2 - 1.4; addShadow(batter); setBatterPose(batter, 0); g.add(batter);
  const pitcher = makeChibi({ shirt: 0xc53030, cap: 0x742a2a, glove: true }); pitcher.position.set(0, 0.35, -18.44); pitcher.scale.setScalar(1.3); g.add(pitcher);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), new THREE.MeshBasicMaterial({ color: 0xffffff })); ball.visible = false; g.add(ball);
  const bshadow = new THREE.Mesh(new THREE.CircleGeometry(0.12, 12), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0.35 })); bshadow.rotation.x = -Math.PI / 2; bshadow.position.y = 0.07; bshadow.renderOrder = 2; g.add(bshadow);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 6, 16), new THREE.MeshBasicMaterial({ color: 0xd33 })); ball.add(seam);
  const zone = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(ZW * 2, ZH * 2)), new THREE.LineBasicMaterial({ color: 0xffffff })); zone.position.set(0, ZY, 0); g.add(zone);
  const ret = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.2, 28), new THREE.MeshBasicMaterial({ color: 0xffd23f, side: THREE.DoubleSide, depthTest: false })); ret.position.set(0, ZY, 0.05); ret.renderOrder = 10; g.add(ret);
  const dot = new THREE.Mesh(new THREE.CircleGeometry(0.018, 8), new THREE.MeshBasicMaterial({ color: 0xffd23f, depthTest: false })); dot.renderOrder = 10; ret.add(dot);
  const catcher = makeChibi({ shirt: 0x444444, cap: 0x222222, glove: true }); catcher.position.set(0, 0, 1.3); catcher.rotation.y = Math.PI; catcher.scale.setScalar(0.0001); g.add(catcher);
  const fielders = [[-24, -24], [-11, -36], [11, -36], [24, -24], [-48, -65], [0, -78], [48, -65]].map(([x, z], i) => { const f = makeChibi({ shirt: 0xc53030, cap: 0x742a2a, glove: true }); f.position.set(x, 0, z); f.scale.setScalar(2.2); f.rotation.y = Math.atan2(-x, 0 - z) ; f.userData.home = [x, z]; fielderReady(f); addShadow(f); g.add(f); return f; });
  
  const runner = makeChibi({ shirt: 0x2b6cb0, cap: 0x1a365d, helmet: true, num: 9 }); runner.visible = false; runner.scale.setScalar(1.6); g.add(runner);
  const baseRunners=Array.from({length:3},()=>{const r=makeChibi({shirt:0x2b6cb0,helmet:true,num:9});r.visible=false;r.scale.setScalar(1.6);g.add(r);return r;});
  scene.add(g); G = { baseRunners,g, batter, pitcher, ball, zone, ret, fielders, runner, bshadow }; permanent.add((dt) => { const b = G.ball; G.bshadow.visible = b.visible; G.bshadow.position.x = b.position.x; G.bshadow.position.z = b.position.z; const sc2 = Math.max(0.5, 1.4 - b.position.y * 0.1); G.bshadow.scale.setScalar(sc2); });
  return G;
}
let homeAnim = null;
export function playTrainingAnim(kind) { homeAnim = { kind, t: 0 }; }
function applyLook(a, p) {
  if (!p) return; const u = a.userData; const pw = p.pos === 'pit' ? p.velo : p.power; const st = p.stamina || 30;
  const w = 0.9 + Math.min(0.4, Math.max(0, (pw - 30) / 140) + Math.max(0, (st - 30) / 300));
  u.body.scale.x = w; u.body.scale.z = w; u.armL.scale.x = u.armR.scale.x = 0.9 + (w - 0.9) * 1.2; u.legL.scale.x = u.legR.scale.x = 0.95 + (w - 0.9) * 0.8;
  const n = p.traits.filter((t) => TRAITS[t] && TRAITS[t].good).length;
  if (!u.star) { u.star = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd23f })); u.star.position.set(0, 0.29, 0.1); u.head.add(u.star); }
  u.star.visible = n >= 1; u.star.scale.setScalar(0.8 + Math.min(n, 4) * 0.35);
  if (!u.band) { u.band = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 6, 12), new THREE.MeshBasicMaterial({ color: 0xff5a5a })); u.band.rotation.x = Math.PI / 2; u.band.position.y = -0.3; u.armR.add(u.band); }
  u.band.visible = p.will >= 50;
  applyEquipment(a, p.gear);
}
export function applyEquipment(a, gr = {}) {
  const u = a.userData;
  if (u.bat) u.bat.material.color.set(gr.bat ? 0xf2c94c : 0xdeb887);
  if (u.glove) { u.glove.material.color.set(gr.glove ? 0xf2c94c : 0x7b4a1e); u.glove.scale.set(gr.glove ? 1.2 : 1, gr.glove ? 1.3 : 1.1, 0.55); }
  for (const s of u.shoes) s.material.color.set(gr.shoes ? 0xe53935 : 0x222222);
}
export function showHome(pos, pl) { const pit = pos === 'pit'; // 홈 화면 배경: 선수가 대기/훈련 모션
  const o = ensureG();showBaseRunners(o,0); o.g.visible = true; o.ret.visible = false; o.zone.visible = false; o.ball.visible = false;
  o.batter.position.set(-0.6, 0, 0.3); o.batter.rotation.y = Math.PI / 2 - 0.5; o.batter.scale.setScalar(0.44);
  resetDefense(o.fielders);
  for (const fd of o.fielders) { fd.visible = !pit; if (!pit) setShirt(fd, 0xc53030); }
  o.batter.visible = !pit; o.pitcher.visible = true; o.pitcher.position.set(pit ? -0.6 : 0, pit ? 0 : 0.35, pit ? 0.3 : -18.44); o.pitcher.rotation.y = pit ? Math.PI / 2 - 0.9 : 0; o.pitcher.scale.setScalar(pit ? 0.5 : 1.3);
  if (o.catcher) { o.catcher.visible = false; o.ump.visible = false; }
  const pu = o.pitcher.userData; applyLook(pit ? o.pitcher : o.batter, pl); if (pl) { setUniform(o.batter, cal(pl.week).year); if (pit) setUniform(o.pitcher, cal(pl.week).year); else setShirt(o.pitcher, 0xc53030); }
  const u = o.batter.userData;
  const f = (dt, t) => {
    const T = homeAnim; if (T) T.t += dt;
    const k = T ? T.kind : 'idle';
    if (pit) {
      pu.legL.rotation.x = pu.legR.rotation.x = 0; o.pitcher.position.y = 0; pu.armL.rotation.set(-1.2, 0, 0.3); pu.armR.rotation.set(0, 0, 0.1); pu.head.rotation.x = 0;
      if (T && ['velo', 'ctrl', 'brk', 'basic', 'power'].includes(k)) { const c = (T.t * 1.3) % 1; setPitcherPose(o.pitcher, c < 0.8 ? c / 0.8 : 0.8 + (c - 0.8)); }
      else if (T && k === 'run') { pu.armR.rotation.x = Math.sin(T.t * 14) * 1.1; pu.armL.rotation.x = -Math.sin(T.t * 14) * 1.1; pu.legL.rotation.x = Math.sin(T.t * 14) * 0.9; pu.legR.rotation.x = -Math.sin(T.t * 14) * 0.9; }
      else if (T && (k === 'cond' || k === 'chore')) { pu.armR.rotation.x = pu.armL.rotation.x = -3.0 + Math.sin(T.t * 8) * 0.4; o.pitcher.position.y = Math.abs(Math.sin(T.t * 4)) * 0.1; }
      else if (T) { pu.armR.rotation.set(0, 0, 0.2); pu.armL.rotation.set(0, 0, -0.2); pu.head.rotation.x = 0.35; }
      else { const c = (t % 3.6) / 3.6; setPitcherPose(o.pitcher, c > 0.75 ? (c - 0.75) / 0.25 * 0.9 : 0); }
      if (T && T.t > 1.4) homeAnim = null;
      camera.position.set(1.2 + Math.sin(t * 0.3) * 0.2, 1.0, 4.6); camera.lookAt(-0.35, -0.5, 0); return;
    }
    u.legL.rotation.x = u.legR.rotation.x = 0; o.batter.position.y = 0; o.batter.position.x = -0.6;
    if (k === 'bat' || k === 'power' || (T && !['run', 'cond', 'defense', 'arm', 'refresh', 'rest', 'study', 'alba', 'chore', 'mental'].includes(k))) { const c = (T.t * 1.6) % 1; setBatterPose(o.batter, c > 0.45 ? Math.min(1, (c - 0.45) / 0.15) : 0); if (k === 'power') o.batter.position.y = Math.abs(Math.sin(T.t * 6)) * 0.08; }
    else if (k === 'run') { setBatterPose(o.batter, -1); u.armR.rotation.x = Math.sin(T.t * 14) * 1.1; u.armL.rotation.x = -Math.sin(T.t * 14) * 1.1; u.legL.rotation.x = Math.sin(T.t * 14) * 0.9; u.legR.rotation.x = -Math.sin(T.t * 14) * 0.9; o.batter.position.y = Math.abs(Math.sin(T.t * 14)) * 0.07; }
    else if (k === 'cond' || k === 'chore') { setBatterPose(o.batter, -1); u.armR.rotation.x = u.armL.rotation.x = -3.0 + Math.sin(T.t * 8) * 0.4; o.batter.position.y = Math.abs(Math.sin(T.t * 4)) * 0.1; }
    else if (k === 'defense' || k === 'arm') { setBatterPose(o.batter, -1); u.armL.rotation.x = -1.4; u.armR.rotation.x = -Math.PI * (0.5 + Math.sin(T.t * 7) * 0.5); }
    else if (k === 'rest' || k === 'refresh' || k === 'study' || k === 'alba' || k === 'mental') { setBatterPose(o.batter, -1); u.armR.rotation.set(0, 0, 0.2); u.armL.rotation.set(0, 0, -0.2); u.head.rotation.x = 0.35 + Math.sin(T.t * 2) * 0.05; }
    else { const c = (t % 3.4) / 3.4; setBatterPose(o.batter, c > 0.7 ? Math.min(1, (c - 0.7) / 0.1) : 0); u.head.rotation.x = 0; }
    if (T && T.t > 1.4) { homeAnim = null; u.head.rotation.x = 0; }
    setPitcherPose(o.pitcher, 0);
    camera.position.set(1.2 + Math.sin(t * 0.3) * 0.2, 1.0, 4.6); camera.lookAt(-0.35, -0.5, 0);
  };
  tickers.clear(); tickers.add(f);
}

export async function playMatch(p, m, hud) {
  const o = ensureG();showBaseRunners(o,0); const y = cal(p.week).year; setUniform(o.batter, y); applyEquipment(o.batter, p.gear); if (o.runner) { setUniform(o.runner, y); applyEquipment(o.runner, p.gear); } applyEquipment(o.pitcher); o.g.visible = true; o.zone.visible = true; o.ret.visible = true; tickers.clear(); { const n = scene.getObjectByName('net'); if (n) n.visible = true; } o.pitcher.visible = true; o.pitcher.position.set(0, 0.35, -18.44); o.pitcher.rotation.y = 0; o.pitcher.scale.setScalar(1.3); if (o.catcher) { o.catcher.visible = false; o.ump.visible = false; } o.batter.visible = true; o.batter.position.set(-0.5, 0, 0.2); o.batter.rotation.y = Math.PI / 2 - 1.4; o.batter.scale.setScalar(0.72); o.batter.userData.head.rotation.x = 0;
  const opp = TEAMS[Math.floor(Math.random() * TEAMS.length)]; { const oc = OPP_COLORS[TEAMS.indexOf(opp) % OPP_COLORS.length]; setShirt(o.pitcher, oc); o.fielders.forEach((f) => setShirt(f, oc)); }
  const regular = isRegular(p);
  const strength = oppStrength(p);
  const traits = p.traits;
  const s = { ab: 0, hits: 0, hr: 0, rbi: 0, runs: 0 };
  let my = 0, oppRuns = 0;
  const pas = regular ? [1, 3, 5] : [4];
  const innings = 5;
  camera.position.set(-0.15, 1.8, 5.4); camera.lookAt(-0.25, -0.35, -9);
  setPitcherPose(o.pitcher, 0);
  hud.setTitle(`${m.name} vs ${opp}${regular ? '' : ' (대타 출전)'}`);
  const ret = o.ret;
  // 입력
  let cx = 0, cy = ZY;
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const setRet = (x, y) => { cx = Math.max(-0.95, Math.min(0.95, x)); cy = Math.max(0.1, Math.min(1.7, y)); ret.position.set(cx, cy, 0.05); };
  const pt = (e) => { const r = renderer.domElement.getBoundingClientRect(); const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1 + 0.12); ray.setFromCamera(v, camera); const hit = new THREE.Vector3(); ray.ray.intersectPlane(plane, hit); if (hit) setRet(hit.x, hit.y); };
  let down = false;
  const onD = (e) => { down = true; pt(e); }, onM = (e) => { if (down || e.pointerType === 'mouse') pt(e); }, onU = () => { down = false; };
  const cv = renderer.domElement; cv.addEventListener('pointerdown', onD); cv.addEventListener('pointermove', onM); window.addEventListener('pointerup', onU);
  setRet(0, ZY);
  let swingReq = null; // 투구 시작 후 스윙 시각
  let pitching = null; const sbOp = (a) => { const b = document.querySelector('.swing'); if (b) { b.style.opacity = a; b.style.transition = 'opacity .2s'; } };
  const doSwing = () => { if (pitching && pitching.swingT == null) { pitching.swingT = pitching.t; pitching.swingAnim = 0.0001; sfx.swing(); } };
  hud.onSwing(doSwing);
  const key = (e) => { if (e.code === 'Space') { e.preventDefault(); doSwing(); } }; window.addEventListener('keydown', key);

  // 한 번의 투구
  const pitchOnce = (count, scoringChance = false) => new Promise(async (res) => {
    hud.setBattingActive?.(true);
    setBatterPose(o.batter, 0);
    o.zone.visible = true; o.ret.visible = true;
    const pt_ = PITCHES[Math.floor(Math.random() * (strength > 50 ? 4 : strength > 42 ? 3 : 2))];
    const T = Math.max(0.78, Math.min(1.5, (1.5 - (strength - 35) * 0.012) * pt_.Tm));
    const inZone = chance(62);
    const bx = window.__dbgIn ? 0 : inZone ? rnd(-ZW * 0.9, ZW * 0.9) : (chance(50) ? 1 : -1) * rnd(ZW * 1.15, ZW * 1.9);
    const by = window.__dbgIn ? ZY : inZone ? ZY + rnd(-ZH * 0.9, ZH * 0.9) : ZY + (chance(50) ? 1 : -1) * rnd(ZH * 1.2, ZH * 2.0);
    hud.setPitch(`${pt_.n} ${Math.round(105 + (1.5 - T) * 60 * (pt_.Tm === 1 ? 1.15 : 0.9))}km/h`);
    // 와인드업
    const handPoint=()=>{o.pitcher.userData.sync?.();o.pitcher.updateWorldMatrix(true,true);return o.pitcher.userData.throwHand.getWorldPosition(new THREE.Vector3());};
    o.ball.visible=true;o.ball.scale.setScalar(1);
    for (let t = 0; t < 0.7; t += 0.03) { setPitcherPose(o.pitcher, t / 0.7 * 0.65);o.ball.position.copy(handPoint());window.__batPitchRelease?.({phase:'windup',t,ball:o.ball,hand:handPoint()});await wait(30); }
    const release=handPoint();
    hud.setTiming?.(0, 1 - 0.075 / T, 0);
    o.ball.visible = true;
    const st = { t: 0, swingT: null, swingAnim: 0 }; pitching = st; sbOp(1);
    let done = false;
    const f = (dt) => {
      if (done) return;
      st.t += dt;
      const guide = battingWindow(p, count.s, scoringChance);
      hud.setTiming?.(st.swingT == null ? st.t / T : null, 1 - 0.075 / T, guide.timing * 0.65 / T);
      const sN = st.t / T;
      setPitcherPose(o.pitcher, Math.min(1, 0.65 + st.t * 2));
      const ss = Math.min(1.12, sN);
      const x = bx * ss + pt_.c * Math.sin(Math.PI * Math.min(1, ss)) * 0.6 * (1 - ss * 0.2);
      const y = 1.7 + (by - 1.7) * ss - pt_.drop * Math.sin(Math.PI * Math.min(1, ss)) * 0.0 - pt_.drop * ss * ss * 0.5 + 0.0 + (pt_.drop ? pt_.drop * 0.5 * ss * ss * 0 : 0);
      o.ball.position.set(x, y + (pt_.drop * 0.5 * ss * ss) , -17.8 + 17.8 * ss);
      const blend=Math.min(1,st.t/.14),smooth=blend*blend*(3-2*blend);o.ball.position.lerp(release,1-smooth);
      window.__batPitchRelease?.({phase:'flight',t:st.t,T,ball:o.ball,release,blend:smooth});
      o.ball.rotation.z += dt * 20;
      if (st.swingAnim > 0) { st.swingAnim += dt / 0.22; setBatterPose(o.batter, st.swingAnim); }
      if (window.__dbgShot) window.__dbgShot(st, T, o, sN);
      if (st.t >= T + 0.2) { done = true; delTicker(f); finalize(); }
    };
    const finalize = () => {
      hud.setTiming?.(null);
      pitching = null; sbOp(0.25); o.ball.visible = false; setBatterPose(o.batter, st.swingT != null ? 1 : 0);
      if (st.swingT == null) { sfx.mitt(); res({ kind: inZone ? 'strike' : 'ball', looking: true }); return; }
      const FRC = window.__force; const err = FRC ? 0 : st.swingT + 0.075 - T; // 0.075s = 스윙 시작~배트 컨택트 프레임(모캡 85번) 지연
      const { timing: w, radius: r } = battingWindow(p, count.s, scoringChance);
      const ballPos = o.ball.position; // 도달 위치 보정
      const dist = FRC ? 0 : Math.hypot(cx - bx, cy - by);
      const tm = Math.abs(err) < w * 0.3 ? 'PERFECT' : err < 0 ? '빠름' : '늦음';
      if (Math.abs(err) > w * 1.5 || dist > r * 1.6) { sfx.mitt(); res({ kind: 'whiff', tm: Math.abs(err) > w * 1.5 ? tm : '위치' }); return; }
      if (Math.abs(err) > w || dist > r) { sfx.crack(0.3); res({ kind: 'foul', tm }); return; }
      const q = 1 - (Math.abs(err) / w * 0.5 + dist / r * 0.5);
      const angle = FRC ? FRC.angle : -err / w * 38 + rnd(-6, 6) + (cx - bx) * 20;
      const launch = FRC ? FRC.launch : 11 + (by - cy) * 70 + rnd(-6, 6);
      const v = FRC ? FRC.v : 28 + q * 14 + p.power * 0.2 + (traits.includes('pwr') ? 5 : 0) + rnd(-2, 2);
      const dst = v * v * Math.sin(2 * Math.max(0.05, launch * Math.PI / 180)) / 9.8 * 0.52;
      sfx.crack(q); hud.flash(); res({ kind: 'hit', tm, q, angle, launch, v, dst: Math.max(5, dst), hr: 0 });
    };
    tickers.add(f);
  });

  // 타구 연출 후 결과 판정
  const flight = (h, defenseOut = '') => new Promise((res) => {
    hud.setBattingActive?.(false); hud.setPitch('타구 비행');
    o.zone.visible = false; o.ret.visible = false;
    const a = h.angle * Math.PI / 180; const dir = new THREE.Vector3(Math.sin(a), 0, -Math.cos(a));
    let dur = Math.max(0.9, Math.min(2.6, h.dst / 38 + 0.6)); const peak = Math.max(0.3, Math.min(30, h.dst * Math.tan(Math.max(0, h.launch) * Math.PI / 180) * 0.28));
    o.ball.visible = true; let t = 0;
    const land = [dir.x * h.dst, dir.z * h.dst + 0.3];
    const air=defenseOut==='air'?airOutSequence(o,hud,land,dur):null;if(air)dur=air.plan.duration;
    const chase = defensivePursuit(o.fielders, land[0], land[1]);
    const f = (dt) => {
      chase(t);
      t += dt; const k = Math.min(1, t / dur);
      const d = h.dst * k; let y = 1 + 4 * peak * k * (1 - k) - (h.launch < 8 ? 0.9 * k : 0);
      if (h.launch < 8) y = 0.15 + Math.abs(Math.sin(k * Math.PI * 4)) * 0.5 * (1 - k);
      o.ball.position.set(dir.x * d, Math.max(0.1, y), dir.z * d + 0.3); o.ball.scale.setScalar(Math.min(5, Math.max(1, camera.position.distanceTo(o.ball.position) / 9)));
      if(air){const glove=air.step(t),blend=Math.max(0,(k-.85)/.15);o.ball.position.lerp(glove,blend);window.__airOutPlay?.({phase:'flight',t,k,plan:air.plan,ball:o.ball,collector:o.fielders[air.plan.collector]});}
      if (window.__flog) window.__flog(o.ball, camera, k);
      const tgt = o.ball.position; camera.position.lerp(new THREE.Vector3(tgt.x * 0.25, 2.6 + k * 2.5, Math.min(11, 5 + Math.max(0, -tgt.z) * 0.06)), 0.06); camera.lookAt(tgt.x * 0.6, 1 + k * 3, tgt.z * 0.65 - 3);
      if (k >= 1) { delTicker(f); if(defenseOut==='ground')completeGroundOut(o,hud,{runner:true}).then(res);else if(air)air.finish().then(res);else if(defenseOut==='single'||defenseOut==='double')completeGroundOut(o,hud,{returnHit:true,runner:true,hitBases:defenseOut==='double'?2:1}).then(res);else setTimeout(() => { o.ball.visible = false; o.ball.scale.setScalar(1); resetFielders(); res(); }, 250); }
    }; tickers.add(f);
  });
  const runBases = () => runHomeRun(o,hud);
  const resetFielders = () => resetDefense(o.fielders);
  const resetCam = () => { camera.position.set(-0.15, 1.8, 5.4); camera.lookAt(-0.25, -0.35, -9); setBatterPose(o.batter, 0); };

  // 타석
  const plateAppearance = async (inn, base) => {
    const c = { b: 0, s: 0 }; let guard = 0;
    hud.setCount(c); resetCam();
    hud.banner(`${inn}회 ${s.ab + 1}번째 타석`, 1100); await wait(1200);
    while (guard++ < 30) {
      await wait(450);
      const r = await pitchOnce(c, !!base);
      if (r.tm && r.kind !== 'hit') hud.small(r.tm);
      if (r.kind === 'ball') { c.b++; hud.banner('볼', 600); }
      else if (r.kind === 'strike') { c.s++; hud.banner('스트라이크', 600); }
      else if (r.kind === 'whiff') { c.s++; hud.banner('헛스윙!', 700); }
      else if (r.kind === 'foul') {await runFoul(o,hud,r.tm==='빠름'?-1:1);resetCam();if (c.s < 2) c.s++; hud.banner('파울', 600); }
      else {
        const h = r; const ang = Math.abs(h.angle); if (h.tm) hud.small(h.tm + (h.q > 0.75 ? ' · 완벽한 타구' : ''));
        let res_ = 'out', label = '';
        if (ang > 46) {await runFoul(o,hud,h.angle);if (c.s < 2) c.s++; hud.banner('파울', 600); hud.setCount(c); resetCam(); resetFielders(); continue; }
        const L = h.launch;
        if (L > 22 && L <= 50 && h.dst >= 88) { res_ = 'hr'; label = '홈런!!'; }
        else if (L < 8) { const pr = 0.2 + h.q * 0.4 + p.speed * 0.002 + (traits.includes('run') ? 0.06 : 0); res_ = chance(pr * 100) ? 'single' : 'out'; label = res_ === 'out' ? '땅볼 아웃' : '내야 안타'; }
        else if (L <= 22) { const pr = 0.5 + h.q * 0.35; if (chance(pr * 100)) { res_ = h.dst > 62 && chance(50 + p.speed * 0.3) ? 'double' : 'single'; label = res_ === 'double' ? '2루타!' : '안타!'; } else label = '라인드라이브 잡힘'; }
        else if (L <= 50) { if (h.dst > 70 && chance(h.q * 55 + 15)) { res_ = 'double'; label = '2루타!'; } else { label = '뜬공 아웃'; } }
        else label = '내야 플라이 아웃';
        await flight(h,res_==='out'?(L<8?'ground':'air'):res_==='hr'?'':res_);
        if (res_ === 'hr') await runBases(res_);
        resetCam();
        return { res: res_, label };
      }
      setBatterPose(o.batter, 0);
      hud.setCount(c);
      if (c.b >= 4) {hud.setBattingActive?.(false);await runWalk(o,hud,0);resetCam();return { res: 'walk', label: '볼넷' };}
      if (c.s >= 3) return { res: 'k', label: '삼진 아웃' };
    }
    return { res: 'out', label: '아웃' };
  };

  let runner = 0;
  for (let inn = 1; inn <= innings; inn++) {
    hud.setScore(inn, my, oppRuns); hud.setCount({ b: 0, s: 0 });
    const lam = Math.max(0.1, 0.35 + (teamStrength(p) - 40) / 25);
    runner = chance(35) ? 1 : 0; // 앞 타자 출루
    if (pas.includes(inn)) {
      const r = await plateAppearance(inn);
      let sc = 0; s.ab += r.res === 'walk' ? 0 : 1;
      if (r.res === 'hr') { s.hits++; s.hr++; sc = 1 + runner; s.rbi += sc; s.runs++; }
      else if (r.res === 'double') { s.hits++; if (runner && chance(75)) { sc = 1; s.rbi++; } }
      else if (r.res === 'single') { s.hits++; if (runner && chance(40)) { sc = 1; s.rbi++; } }
      if (r.res === 'walk') { sc = 0; }
      my += sc;
      if (r.res === 'hr') sfx.cheer(2); else if (sc || r.res === 'single' || r.res === 'double') sfx.cheer(1); else if (r.res === 'k' || r.res === 'out') sfx.out();
      hud.banner(r.label + (sc ? ` (+${sc}점)` : ''), 1500); hud.setScore(inn, my, oppRuns); await wait(1700);
      // 출루 후 득점
      if (['single', 'double', 'walk'].includes(r.res) && chance(35 + p.speed * 0.2)) { await runFollowupScore(o,hud,r.res==='double'?2:1);resetCam();s.runs++; my++; hud.banner('후속 안타로 홈인!', 1100); hud.setScore(inn, my, oppRuns); await wait(1200); }
    } else {
      const add = Math.random() < lam * 0.7 ? (chance(25) ? 2 : 1) : 0; my += add;
      hud.banner(`${inn}회 우리 팀 ${add}점`, 900); hud.setScore(inn, my, oppRuns); await wait(950);
    }
    const oa = Math.random() < Math.max(0.1, 0.28 + (strength - 40) / 28) ? (chance(25) ? 2 : 1) : 0; oppRuns += oa;
    hud.banner(`${inn}회 상대 ${oa}점`, 900); hud.setScore(inn, my, oppRuns); await wait(950);
  }
  // 정리
  cv.removeEventListener('pointerdown', onD); cv.removeEventListener('pointermove', onM); window.removeEventListener('pointerup', onU); window.removeEventListener('keydown', key);
  hud.offSwing();
  let win = my > oppRuns; if (my === oppRuns) { win = chance(50 + p.ev.team * 0.1); if (win) my++; else oppRuns++; hud.banner('연장 승부 끝에 ' + (win ? '승리' : '패배'), 1400); await wait(1500); }
  const r = { ab: s.ab, hits: s.hits, hr: s.hr, rbi: s.rbi, my, opp: oppRuns, win, kind: m.kind, title: m.name + ' vs ' + opp };
  applyMatchResult(p, r);
  return r;
}

export const internals = () => ({ o: ensureG(), tickers, delTicker, wait });
