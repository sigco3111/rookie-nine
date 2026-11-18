// Three-bit occupancy: 1B=1, 2B=2, 3B=4. Hits advance each runner
// by the hit's base count; extra advances, tags and errors are not modeled.
export function advanceBases(mask,kind){
 mask=mask&7;
 // A timed infield hit with first empty does not force the lead runners.
 if(kind==='infield'&&!(mask&1))return {bases:mask|1,runs:0};
 if(kind==='walk'){
  let next=mask,force=true,runs=0;
  for(let b=0;b<3&&force;b++){force=!!(mask&(1<<b));next|=1<<b;}
  if(force)runs=1;
  return {bases:next,runs};
 }
 if(Number.isInteger(kind)&&kind>=1&&kind<=4){
  let next=0,runs=kind===4?1:0;
  if(kind<4)next|=1<<(kind-1);
  for(let b=0;b<3;b++)if(mask&(1<<b)){const to=b+kind;if(to>=3)runs++;else next|=1<<to;}
  return {bases:next,runs};
 }
 return {bases:mask,runs:0};
}

// Visual path for an existing runner. Home-scoring runners leave the scene
// on arrival so the next runner does not stack on the plate.
export function baseRunStep(start,advance,progress){
 const pts=[[0,0],[19.4,-19.4],[0,-38.8],[-19.4,-19.4],[0,0]];
 const end=Math.min(4,start+advance),u=Math.max(0,Math.min(1,progress));
 const q=start+(end-start)*u,i=Math.min(3,Math.floor(q)),k=q-i;
 const a=pts[i],b=pts[i+1];
 return {x:a[0]+(b[0]-a[0])*k,z:a[1]+(b[1]-a[1])*k,yaw:Math.atan2(b[0]-a[0],b[1]-a[1]),arrived:u>=1||advance===0,scored:end===4&&u>=1};
}

export function walkAdvance(mask,start){
 // Only the uninterrupted force chain from first base advances.
 return (mask&((1<<start)-1))===((1<<start)-1)?1:0;
}

// Defend the lead runner in the uninterrupted force chain. No tag is needed.
export function forceTarget(mask){
 if(!(mask&1))return 0;
 return (mask&3)!==3?2:(mask&7)!==7?3:4;
}
export function forceResult(mask,safe){
 const target=forceTarget(mask);if(!target)return {bases:mask&7,runs:0,outs:0};
 const next=advanceBases(mask,'walk');
 if(safe)return {...next,outs:0};
 return {bases:target===4?next.bases:next.bases&~(1<<(target-1)),runs:0,outs:1};
}
