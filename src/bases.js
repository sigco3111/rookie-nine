// Three-bit occupancy: 1B=1, 2B=2, 3B=4. Hits advance each runner
// by the hit's base count; extra advances, tags and errors are not modeled.
export function advanceBases(mask,kind){
 mask=mask&7;
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
