// Common pro-match engine preparation. Not connected to a menu or the 3D renderer.
// Caller supplies rules and opponent, so this does not decide club admission or season length.
import { advanceBases, forceResult } from './bases.js';
const copy=v=>structuredClone(v),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function assertTeam(team){
 if(!team||!Array.isArray(team.batters)||team.batters.length!==9||new Set(team.batters.map(p=>p.id)).size!==9||team.batters.some(p=>p.pos!=='bat')||team.pitcher?.pos!=='pit')throw Error('타자 9명과 선발 투수가 필요합니다.');
 for(const p of [...team.batters,team.pitcher])for(const n of Object.values(p.abilities||{}))if(!Number.isFinite(n)||n<0||n>99)throw Error('능력치를 확인하세요.');
 for(const p of team.batters)for(const key of ['meet','power','speed','field','arm','stamina'])if(!Number.isFinite(p.abilities?.[key]))throw Error('타자 능력치를 확인하세요.');
 for(const key of ['velo','ctrl','brk','field','speed','stamina'])if(!Number.isFinite(team.pitcher.abilities?.[key]))throw Error('투수 능력치를 확인하세요.');
}
export function createClubSession(game,{opponent,innings,seed}){
 assertTeam(game);assertTeam(opponent);
 if(!game.id||!Number.isInteger(innings)||innings<1||innings>9||!Number.isInteger(seed)||seed<1||seed>0xffffffff)throw Error('경기 규칙과 난수 시드를 확인하세요.');
 const rows=t=>Object.fromEntries([...t.batters.map(p=>[p.id,{ab:0,hits:0,hr:0,rbi:0}]),[t.pitcher.id,{outs:0,so:0,hitsAllowed:0,er:0}]]);
 return {schema:1,gameId:game.id,teams:[copy(game),copy(opponent)],innings,seed,state:seed,inning:1,side:0,outs:0,bases:0,scores:[0,0],order:[0,0],players:[rows(game),rows(opponent)],events:[],done:false};
}
// Thresholds are provisional simulation rules, not a tested balance setting or a change to school batting.
export function appearanceChances(batter,pitcher,defense){
 const b=batter.abilities,p=pitcher.abilities,traits=new Set(batter.traits),pt=new Set(pitcher.traits);
 const bb=clamp(.07+(45-p.ctrl)*.001+(traits.has('walk')?.025:0),.025,.16);
 const hit=clamp(.23+(b.meet-50)*.0024+(b.speed-50)*.00035-(p.brk-50)*.0007-(p.velo-50)*.0005-(defense-50)*.0005+(traits.has('avg')?.02:0),.09,.43);
 const hr=clamp(.02+(b.power-50)*.0007+(traits.has('pwr')?.018:0),.003,.07);
 const k=clamp(.2+(p.velo-50)*.001+(p.brk-50)*.0012-(b.meet-50)*.001+(pt.has('aura')?.02:0),.07,.36);
 return {bb,hit,hr,k};
}
function random(session){let x=session.state;x^=x<<13;x^=x>>>17;x^=x<<5;session.state=x>>>0;return session.state/4294967296;}
export function stepClubAppearance(input,manual){
 if(input.done)throw Error('종료된 경기입니다.');const s=copy(input),side=s.side,def=1-side,batters=s.teams[side].batters,pitcher=s.teams[def].pitcher,batter=batters[s.order[side]%9];
 const row=s.players[side][batter.id],pit=s.players[def][pitcher.id];
 const defense=s.teams[def].batters.reduce((a,p)=>a+p.abilities.field,0)/9;
 const c=appearanceChances(batter,pitcher,defense);let kind=manual;
 if(kind===undefined){const r=random(s);kind=r<c.bb?'walk':r<c.bb+c.hr?4:r<c.bb+c.hr+c.hit?(random(s)<.23?2:1):random(s)<c.k?'k':'out';}
 if(!['walk','k','out','infield','forceSafe','forceOut',1,2,3,4].includes(kind))throw Error('타석 결과를 확인하세요.');
 let runs=0;
 if(kind!=='walk')row.ab++;
 if(kind==='k'||kind==='out'){s.outs++;pit.outs++;if(kind==='k')pit.so++;}
 else {const forced=kind==='forceSafe'||kind==='forceOut',next=forced?forceResult(s.bases,kind==='forceSafe'):advanceBases(s.bases,kind==='infield'&&(s.bases&1)?1:kind);if(forced&&!((s.bases&1)))throw Error('포스 상황이 아닙니다.');if(next.outs){s.outs+=next.outs;pit.outs+=next.outs;}s.bases=next.bases;runs=next.runs;row.rbi+=runs;pit.er+=runs;s.scores[side]+=runs;if(typeof kind==='number'||kind==='infield'){row.hits++;pit.hitsAllowed++;if(kind===4)row.hr++;}}
 s.events.push({inning:s.inning,side,batter:batter.id,pitcher:pitcher.id,kind,rolled:manual===undefined,runs,outs:s.outs,bases:s.bases});s.order[side]++;
 // Both clubs finish each inning. No walk-off, errors or runner substitutions in this prototype.
 if(s.outs===3){s.outs=0;s.bases=0;if(side===0)s.side=1;else if(s.inning>=s.innings&&s.scores[0]!==s.scores[1])s.done=true;else {s.side=0;s.inning++;}}
 return s;
}
export function runClubAuto(input,{maxAppearances=2000}={}){
 if(!Number.isInteger(maxAppearances)||maxAppearances<1||maxAppearances>10000)throw Error('자동 진행 한도를 확인하세요.');
 let s=copy(input);for(let i=0;i<maxAppearances&&!s.done;i++)s=stepClubAppearance(s);return s;
}
export function clubSessionResult(s){
 if(!s.done||s.scores[0]===s.scores[1])throw Error('경기가 아직 끝나지 않았습니다.');
 return {id:s.gameId,my:s.scores[0],opp:s.scores[1],players:copy(s.players[0]),complete:true};
}

// Replay validates a saved engine checkpoint before resuming. Invalid data is never repaired in place.
export function validateClubSession(session){
 if(!session||session.schema!==1||!Array.isArray(session.events)||session.events.length>10000)throw Error('경기 중간 기록을 확인하세요.');
 let rebuilt=createClubSession(session.teams?.[0],{opponent:session.teams?.[1],innings:session.innings,seed:session.seed});
 for(const e of session.events){if(!e||typeof e.rolled!=='boolean')throw Error('타석 기록을 확인하세요.');rebuilt=stepClubAppearance(rebuilt,e.rolled?undefined:e.kind);}
 if(JSON.stringify(rebuilt)!==JSON.stringify(session))throw Error('경기 중간 기록이 맞지 않습니다.');return rebuilt;
}
