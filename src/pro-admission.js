import { admitGraduate, playerFromGraduate } from './pro.js';
// Caller supplies an explicit existing destination. No draft-team or shared-team default.
export function createProAdmission(store){
 const plans=new WeakMap();
 function read(){const state=store.load(),status=store.status();if(!state.ok)throw Error(state.error);if(status.pending||status.conflict)throw Error('현재 프로 기록 저장을 먼저 마치세요.');return state.data;}
 return {
  prepare(entry,clubId){const root=read(),player=playerFromGraduate(entry),club=root.clubs.find(c=>c.id===clubId);if(!club)throw Error('입단할 기존 구단을 명시해 주세요.');if(club.pending)throw Error('진행 중인 경기를 먼저 마치세요.');
   const registered=root.clubs.filter(c=>c.roster.some(p=>p.id===player.id));if(registered.length)throw Error('이미 프로 명단에 등록된 선수입니다. 입단이 아니라 기존 등록을 확인하세요.');
   const plan=Object.freeze({playerName:player.name,playerId:player.id,pos:player.pos,clubId,clubName:club.name});plans.set(plan,{root:JSON.stringify(root),entry:structuredClone(entry)});return plan;
  },
  confirm(plan,{confirmed=false}={}){const prepared=plans.get(plan);if(!prepared)throw Error('입단 내용을 다시 확인하세요.');if(confirmed!==true)throw Error('선수와 입단 구단을 확인해야 합니다.');const root=read();if(JSON.stringify(root)!==prepared.root)throw Error('프로 기록이 바뀌었습니다. 입단 내용을 다시 확인하세요.');const index=root.clubs.findIndex(c=>c.id===plan.clubId),applied=admitGraduate(root.clubs[index],prepared.entry);if(!applied.added)throw Error('이미 등록된 선수입니다.');root.clubs[index]=applied.club;const result=store.save(root);plans.delete(plan);return {...result,playerId:plan.playerId,clubId:plan.clubId};
  }
 };
}
