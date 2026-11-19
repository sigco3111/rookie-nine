// Initial own-club defaults. All opponents are newly generated fictional players.
import { newClub, beginClubGame } from './pro.js';
import { fillClubRoster } from './pro-teammates.js';
import { validateClubSchedule } from './pro-schedule.js';
export function defaultClubSchedule(club){
 if(club.pending||club.schedule)throw Error('진행 중 경기나 기존 일정은 덮어쓰지 않습니다.');
 const names=['새벽 구단','노을 구단','바람 구단'];
 const fixtures=Array.from({length:6},(_,i)=>{
  const n=i%3,id=`${club.id}:season:${club.season}:game:${i+1}`;
  let away=fillClubRoster(newClub({id:`fictional:${n+1}`,name:names[n]}));
  // Small fixed differences, not a claim of final balance.
  for(const p of away.roster)for(const k of Object.keys(p.abilities))p.abilities[k]+=n*3;
  const opponent=beginClubGame(away,{id,opponent:club.name}).pending;
  let seed=2166136261;for(const c of id)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
  return {id,name:names[n],opponent,innings:3,seed:seed||1};
 });
 const schedule={schema:1,id:`${club.id}:season:${club.season}`,season:club.season,startGame:club.record.games,fixtures};
 validateClubSchedule({...club,schedule});return schedule;
}
export function createOwnClub(store){
 const state=store.load(),status=store.status();if(!state.ok)throw Error(state.error);if(status.pending||status.conflict)throw Error('현재 프로 기록 저장을 먼저 마치세요.');
 if(state.data.clubs.length)throw Error('기존 구단이 있습니다. 새로 덮어쓰지 않았습니다.');
 const club=fillClubRoster(newClub({id:'own-club',name:'내 구단'}));club.schedule=defaultClubSchedule(club);
 state.data.clubs.push(club);state.data.selected=club.id;return {...store.save(state.data),clubId:club.id};
}
export function addDefaultClubSchedule(store,clubId){
 const state=store.load(),status=store.status();if(!state.ok)throw Error(state.error);if(status.pending||status.conflict)throw Error('현재 프로 기록 저장을 먼저 마치세요.');
 const club=state.data.clubs.find(c=>c.id===clubId);if(!club)throw Error('구단을 확인하세요.');club.schedule=defaultClubSchedule(club);return store.save(state.data);
}
