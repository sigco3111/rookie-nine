// Visual defense paths only. No catch, throw or outcome decisions.
const bound = (x,z) => { const r=Math.hypot(x,z),k=r>91?91/r:1;return [x*k,z*k]; };
export function defensePaths(homes,x,z){
 const target=bound(x,z),ranked=homes.map(([hx,hz],index)=>({index,d:Math.hypot(target[0]-hx,target[1]-hz)})).sort((a,b)=>a.d-b.d);
 if(!ranked.length)return [];
 const paths=[{index:ranked[0].index,target,delay:.18,speed:7,role:'pursuit'}];
 if(ranked.length>1){
  const r=Math.hypot(...target),k=r?8/r:0,cover=bound(target[0]*(1+k),target[1]*(1+k));
  const backup=ranked.slice(1).sort((a,b)=>Math.hypot(cover[0]-homes[a.index][0],cover[1]-homes[a.index][1])-Math.hypot(cover[0]-homes[b.index][0],cover[1]-homes[b.index][1]))[0];
  paths.push({index:backup.index,target:cover,delay:.35,speed:5.5,role:'backup'});
 }
 return paths.map(path=>({...path,home:homes[path.index],distance:Math.hypot(path.target[0]-homes[path.index][0],path.target[1]-homes[path.index][1])}));
}
export function defenseStep(path,t){
 const travel=Math.min(path.distance,Math.max(0,t-path.delay)*path.speed),k=path.distance?travel/path.distance:0;
 return {x:path.home[0]+(path.target[0]-path.home[0])*k,z:path.home[1]+(path.target[1]-path.home[1])*k,remaining:path.distance-travel,moving:travel>0&&travel<path.distance};
}

// Horizontal attention toward the projected landing point, not a catch decision.
export function defenseLookYaw(x,z,facing,targetX,targetZ){
 const dx=targetX-x,dz=targetZ-z;
 if(Math.hypot(dx,dz)<.1)return 0;
 const offset=Math.atan2(dx,dz)-facing;
 return Math.max(-.6,Math.min(.6,Math.atan2(Math.sin(offset),Math.cos(offset))));
}

// Ground-out completion plan. Outcome remains the caller's existing decision.
export function groundOutPlan(positions,ball,returnBase=[19.4,-19.4]){
 if(positions.length<2)return null;
 const base=[...returnBase];
 const ranked=positions.map(([x,z],index)=>({index,d:Math.hypot(x-ball[0],z-ball[1])})).sort((a,b)=>a.d-b.d);
 const collector=ranked[0].index;
 const receiver=positions.map(([x,z],index)=>({index,d:Math.hypot(x-base[0],z-base[1])})).filter(a=>a.index!==collector).sort((a,b)=>a.d-b.d)[0].index;
 const gather=Math.max(.35,ranked[0].d/7),cover=Math.hypot(positions[receiver][0]-base[0],positions[receiver][1]-base[1])/7;
 const approach=Math.max(gather,cover),transfer=.5,flight=Math.max(.45,Math.hypot(ball[0]-base[0],ball[1]-base[1])/24),hold=.4;
 return {collector,receiver,base,ball:[...ball],approach,transfer,flight,hold,total:approach+transfer+flight+hold};
}
export function groundOutPhase(plan,t){
 if(t<plan.approach)return {phase:'approach',k:t/plan.approach};
 t-=plan.approach;if(t<plan.transfer)return {phase:'transfer',k:t/plan.transfer};
 t-=plan.transfer;if(t<plan.flight)return {phase:'throw',k:t/plan.flight};
 return {phase:'receive',k:Math.min(1,(t-plan.flight)/plan.hold)};
}

// A preselected air-out follows the nearest fielder, not a new outcome roll.
export function airOutPlan(positions,landing,minDuration=1){
 if(!positions.length)return null;
 const ranked=positions.map(([x,z],index)=>({index,d:Math.hypot(x-landing[0],z-landing[1])})).sort((a,b)=>a.d-b.d);
 const collector=ranked[0].index,duration=Math.max(.5,minDuration,.18+ranked[0].d/7);
 return {collector,from:[...positions[collector]],landing:[...landing],duration};
}
export function airOutStep(plan,t){
 const k=Math.min(1,Math.max(0,(t-.18)/(plan.duration-.18)));
 return {x:plan.from[0]+(plan.landing[0]-plan.from[0])*k,z:plan.from[1]+(plan.landing[1]-plan.from[1])*k,k};
}

// Runner visual progress follows an already selected hit, never an out roll.
export function hitRunStep(bases,progress){
 const pts=[[0,0],[19.4,-19.4],[0,-38.8],[-19.4,-19.4],[0,0]],count=bases===4?4:bases===3?3:bases===2?2:1;
 const distance=Math.max(0,Math.min(1,progress))*count;
 const leg=Math.min(count-1,Math.floor(distance)),k=distance-leg,a=pts[leg],b=pts[leg+1];
 return {x:a[0]+(b[0]-a[0])*k,z:a[1]+(b[1]-a[1])*k,yaw:Math.atan2(b[0]-a[0],b[1]-a[1]),arrived:progress>=1,bases:count};
}

// One-base race in world-space seconds. Reception ties go to the runner.
export function groundRace(plan,elapsed=0,speed=7){
 const runnerTime=Math.hypot(19.4,19.4)/speed;
 const receiveTime=elapsed+plan.approach+plan.transfer+plan.flight;
 return {runnerTime,receiveTime,safe:runnerTime<=receiveTime,margin:runnerTime-receiveTime};
}
