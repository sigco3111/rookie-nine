import { defaultClubSchedule } from './pro-bootstrap.js';
import { validateClubSchedule } from './pro-schedule.js';
export function createSeasonTransition(store){
 const plans=new WeakMap();
 return {
  prepare(clubId){const state=store.load(),status=store.status();if(!state.ok)throw Error(state.error);if(status.pending||status.conflict)throw Error('현재 프로 기록 저장을 먼저 마치세요.');const club=state.data.clubs.find(c=>c.id===clubId);
   if(!club||club.pending||!club.schedule?.fixtures.length||!validateClubSchedule(club).done)throw Error('저장된 일정을 먼저 마치세요.');
   const schedule=defaultClubSchedule({...club,season:club.season+1,schedule:null});
   const plan=Object.freeze({clubName:club.name,from:club.season,to:club.season+1,games:schedule.fixtures.length,innings:3});plans.set(plan,{clubId,schedule,expectedRoot:JSON.stringify(state.data)});return plan;
  },
  confirm(plan,{confirmed=false}={}){const prepared=plans.get(plan);if(!prepared||confirmed!==true)throw Error('다음 시즌 내용을 먼저 확인하세요.');const result=store.rollover(prepared.clubId,prepared.schedule,{expectedRoot:prepared.expectedRoot,confirmed:true});plans.delete(plan);return result;}
 };
}
