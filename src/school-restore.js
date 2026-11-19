import { decodeSchoolRecord } from './school-record-read.js';
const KEY={player:'rookie9.save.v1',hof:'rookie9.hof.v1'};
const clone=v=>structuredClone(v);
// Guarded restoration foundation only. UI must obtain explicit choice + confirmation.
export function createSchoolRestorer(storage,getSnapshot){
 const plans=new WeakMap();
 function capture(){const snap=getSnapshot();if(snap.kind!=='rookie9-school-recovery'||snap.schema!==1)throw Error('현재 기록 상태를 확인할 수 없습니다.');
  if(snap.pendingWrites?.length||snap.pendingGraduates?.length||snap.rejectedWrites?.length)throw Error('대기·거부 기록을 먼저 보존하고 정리해야 복원할 수 있습니다.');
  for(const kind of ['player','hof'])if(!Object.hasOwn(snap.sources?.[kind]||{},'raw')||snap.sources[kind].state==='unreadable')throw Error('현재 원문을 읽을 수 없어 복원을 멈췄습니다.');return clone(snap);
 }
 return {
  prepare(candidate){if(!candidate||!KEY[candidate.record]||typeof candidate.raw!=='string')throw Error('복원할 기록을 선택하세요.');const decoded=decodeSchoolRecord(candidate.raw,candidate.record);if(!decoded.ok||decoded.state!=='valid')throw Error('복원할 기록 형식을 확인하세요.');
   const before=capture(),plan=Object.freeze({record:candidate.record,summary:candidate.record==='player'?`${decoded.data.name} · ${decoded.data.week}주 경과`:`졸업 선수 ${decoded.data.length}명`,replacesCurrent:before.sources[candidate.record].raw!==null});plans.set(plan,{before,raw:candidate.raw});return plan;
  },
  restore(plan,{confirmed=false,backupId}={}){
   const item=plans.get(plan);if(!item)throw Error('복원 미리보기를 다시 여세요.');if(confirmed!==true)throw Error('선택한 기록의 복원을 확인해야 합니다.');
   if(typeof backupId!=='string'||!/^[a-zA-Z0-9_-]{1,80}$/.test(backupId))throw Error('복원 전 백업 식별자를 확인하세요.');
   if(JSON.stringify(capture())!==JSON.stringify(item.before))throw Error('현재 기록이 바뀌었습니다. 다시 확인하세요.');
   const key='rookie9.school.backup.'+backupId,backup=JSON.stringify(item.before);if(storage.getItem(key)!==null)throw Error('이미 사용한 백업 식별자입니다.');
   storage.setItem(key,backup);if(storage.getItem(key)!==backup)throw Error('백업을 다시 읽어 확인하지 못해 복원을 멈췄습니다.');
   if(JSON.stringify(capture())!==JSON.stringify(item.before))throw Error('백업 중 현재 기록이 바뀌어 복원을 멈췄습니다.');
   // One target only. Archive replacement is never an implicit merge.
   storage.setItem(KEY[plan.record],item.raw);plans.delete(plan);
   if(storage.getItem(KEY[plan.record])!==item.raw)throw Error('복원 결과를 확인하지 못했습니다. 원본 백업은 보존했습니다.');
   return {restored:true,record:plan.record,backupKey:key};
  }
 };
}
