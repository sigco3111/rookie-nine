import { validateClubSchedule } from './pro-schedule.js';
// Preparation only. One root write holds all clubs, snapshots and result ledgers.
import { PRO_SCHEMA, applyClubResult, setLineup } from './pro.js';
import { keysOf } from './data.js';
import { validateClubSession } from './pro-match.js';
export const PRO_KEY='rookie9.pro.v1';
const clone=v=>structuredClone(v);
const fail=()=>{throw Error('프로 기록을 확인할 수 없습니다. 원본은 변경하지 않았습니다.');};
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const id=s=>typeof s==='string'&&s.length>0;
const counters=['games','ab','hits','hr','rbi','outs','so','hitsAllowed','er'];
function validPlayer(p){
  if(!p||!id(p.id)||!id(p.name)||!['bat','pit'].includes(p.pos)||!['graduate','generated'].includes(p.source)||!p.abilities||!p.school||!Array.isArray(p.traits)||!p.pro)fail();
  for(const k of keysOf(p))if(!Number.isFinite(p.abilities[k])||p.abilities[k]<0||p.abilities[k]>99)fail();
  if(counters.some(k=>!integer(p.pro[k])))fail();
}
export function validateClub(club){
  if(!club||club.schema!==PRO_SCHEMA||!id(club.id)||!id(club.name)||!Number.isSafeInteger(club.season)||club.season<1||!Array.isArray(club.roster)||!Array.isArray(club.history)||!Array.isArray(club.applied))fail();
  club.roster.forEach(validPlayer);const ids=club.roster.map(p=>p.id);if(new Set(ids).size!==ids.length)fail();
  const clean=clone(club);clean.pending=null;setLineup(clean,{batters:club.lineup,starter:club.starter});
  let rebuilt={...clean,roster:clean.roster.map(p=>({...p,pro:Object.fromEntries(counters.map(k=>[k,0]))})),record:{games:0,wins:0,losses:0,runsFor:0,runsAgainst:0},history:[],applied:[],pending:null};
  for(const game of club.history){
    if(!game||!id(game.id)||!id(game.opponent)||!Number.isSafeInteger(game.season)||game.season<1||game.season>club.season||game.number!==rebuilt.record.games+1||!Array.isArray(game.participants)||game.participants.length!==10||new Set(game.participants).size!==10)fail();
    const players=game.participants.map(i=>clean.roster.find(p=>p.id===i));if(players.some(p=>!p)||players.filter(p=>p.pos==='pit').length!==1)fail();
    rebuilt.pending={id:game.id,season:game.season,number:game.number,opponent:game.opponent,batters:players.filter(p=>p.pos==='bat'),pitcher:players.find(p=>p.pos==='pit')};
    const result=applyClubResult(rebuilt,game);if(!result.applied)fail();rebuilt=result.club;
  }
  if(JSON.stringify(rebuilt.applied)!==JSON.stringify(club.applied))fail();
  for(const k of Object.keys(rebuilt.record))if(rebuilt.record[k]!==club.record?.[k])fail();
  for(let i=0;i<ids.length;i++)for(const k of counters)if(rebuilt.roster[i].pro[k]!==club.roster[i].pro[k])fail();
  if(club.pending){const p=club.pending;
    if(!id(p.id)||!id(p.opponent)||club.applied.includes(p.id)||p.season!==club.season||p.number!==club.record.games+1||!Array.isArray(p.batters)||p.batters.length!==9)fail();
    const expected=club.lineup.map(i=>club.roster.find(p=>p.id===i));const pitcher=club.roster.find(v=>v.id===club.starter);
    if(expected.some(v=>!v)||!pitcher||JSON.stringify(expected)!==JSON.stringify(p.batters)||JSON.stringify(pitcher)!==JSON.stringify(p.pitcher))fail();
    if(p.session){const session=validateClubSession(p.session);if(session.gameId!==p.id||JSON.stringify(session.teams[0].batters)!==JSON.stringify(p.batters)||JSON.stringify(session.teams[0].pitcher)!==JSON.stringify(p.pitcher))fail();}
  }
  if(club.schedule!=null)validateClubSchedule(club);
  return clone(club);
}
export function emptyProSave(){return {schema:PRO_SCHEMA,revision:0,clubs:[],selected:null};}
export function validateProSave(root){
  if(!root||root.schema!==PRO_SCHEMA||!integer(root.revision)||!Array.isArray(root.clubs))fail();
  const clubs=root.clubs.map(validateClub),ids=clubs.map(c=>c.id);
  if(new Set(ids).size!==ids.length||(root.selected!==null&&!ids.includes(root.selected)))fail();
  return {schema:PRO_SCHEMA,revision:root.revision,clubs,selected:root.selected};
}
// In-memory pending state is authoritative until retry succeeds. Never silently turn unreadable data into a blank save.
export function createProStore(storage){
  let pending,hasPending=false,baseRaw=null,conflict=false;const listeners=new Set();
  const notice=()=>{for(const fn of listeners)fn();};
  function load(){
    try{const raw=hasPending?pending:storage.getItem(PRO_KEY);return {ok:true,data:raw===null?emptyProSave():validateProSave(JSON.parse(raw)),pending:hasPending};}
    catch{return {ok:false,data:null,pending:hasPending,error:'프로 기록을 읽을 수 없습니다. 원본을 보존했습니다.'};}
  }
  function flush(){try{if(storage.getItem(PRO_KEY)!==baseRaw){conflict=true;return false;}storage.setItem(PRO_KEY,pending);hasPending=false;conflict=false;return true;}catch{return false;}}
  function save(data){const current=load();if(!current.ok||data.revision!==current.data.revision)fail();for(const club of current.data.clubs)if(club.schedule&&JSON.stringify(data.clubs?.find(c=>c.id===club.id)?.schedule)!==JSON.stringify(club.schedule))fail();const valid=validateProSave(data);valid.revision++;if(!hasPending)baseRaw=storage.getItem(PRO_KEY);pending=JSON.stringify(valid);hasPending=true;const ok=flush();notice();return {ok,data:load().data};}
  function result(clubId,outcome){const state=load();if(!state.ok)fail();const index=state.data.clubs.findIndex(c=>c.id===clubId);if(index<0)fail();const applied=applyClubResult(state.data.clubs[index],outcome);if(!applied.applied)return {ok:!hasPending,applied:false,data:state.data};state.data.clubs[index]=applied.club;return {...save(state.data),applied:true};}
  function recoveryOptions(){
    if(!hasPending||!conflict)return null;
    const summarize=r=>({revision:r.revision,clubs:r.clubs.map(c=>({name:c.name,games:c.record.games,wins:c.record.wins,losses:c.record.losses,pending:!!c.pending}))});
    const external=storage.getItem(PRO_KEY);
    return {local:summarize(validateProSave(JSON.parse(pending))),disk:external===null?null:summarize(validateProSave(JSON.parse(external)))};
  }
  function recover(choice){
    if(!['local','disk'].includes(choice)||!hasPending||!conflict)throw Error('복구할 충돌 기록이 없습니다.');
    const external=storage.getItem(PRO_KEY),local=pending;
    // Both versions must be readable before either can become the selected save.
    const localData=validateProSave(JSON.parse(local));let diskData=null;
    if(external!==null)diskData=validateProSave(JSON.parse(external));
    if(choice==='disk'&&!diskData)throw Error('다른 창의 저장 기록이 없습니다.');
    const backup=JSON.stringify({schema:1,createdAt:Date.now(),local,external,choice});
    const backupKey=PRO_KEY+'.recovery.'+Date.now()+'.'+Math.random().toString(36).slice(2);
    try{
      if(storage.getItem(backupKey)!==null)throw Error('백업 식별자가 겹칩니다.');
      storage.setItem(backupKey,backup);
      if(storage.getItem(backupKey)!==backup)throw Error('두 기록의 백업을 확인하지 못했습니다.');
      if(storage.getItem(PRO_KEY)!==external)throw Error('백업 중 다른 창의 기록이 바뀌었습니다.');
      const selected=clone(choice==='local'?localData:diskData);selected.revision=Math.max(localData.revision,diskData?.revision||0)+1;
      const selectedRaw=JSON.stringify(validateProSave(selected));storage.setItem(PRO_KEY,selectedRaw);
      if(storage.getItem(PRO_KEY)!==selectedRaw)throw Error('복구 저장을 확인하지 못했습니다.');
      hasPending=false;pending=undefined;conflict=false;notice();return {ok:true,backupKey,data:selected};
    }catch(error){notice();return {ok:false,backupKey,error:'복구를 마치지 못했습니다. 두 기록을 덮어쓰지 말고 다시 확인하세요.'};}
  }
  return {load,save,result,recover,recoveryOptions,retry(){const ok=!hasPending||flush();notice();return ok;},subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);},status(){if(hasPending){try{if(storage.getItem(PRO_KEY)!==baseRaw)conflict=true;}catch{}}return {pending:hasPending,conflict};}};
}
