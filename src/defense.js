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
