import { decodeSchoolRecord } from './school-record-read.js';
// Inspect a downloaded recovery file only. No storage, writes, repair or default choice.
export function previewSchoolRecovery(text){
 if(typeof text!=='string'||text.length>8*1024*1024)throw Error('8MB 이하의 복구 기록 파일을 선택하세요.');
 let file;try{file=JSON.parse(text);}catch{throw Error('복구 기록 파일을 해석할 수 없습니다.');}
 if(!file||file.schema!==1||file.kind!=='rookie9-school-recovery'||!file.sources||typeof file.sources!=='object'||Array.isArray(file.sources))throw Error('지원하는 복구 기록 파일이 아닙니다.');
 const candidates=[],notices=[];
 function inspect(record,raw,source){
  if(!['player','hof'].includes(record)||typeof raw!=='string'){notices.push(`${source}: 읽을 수 있는 원문이 없습니다.`);return;}
  const result=decodeSchoolRecord(raw,record);if(!result.ok){notices.push(`${source}: ${result.error}`);return;}
  const data=result.data;candidates.push({record,source,raw,summary:record==='player'?`${data.name} · ${data.pos==='pit'?'투수':'타자'} · ${data.week}주 경과`:`졸업 선수 ${data.length}명`});
 }
 for(const record of ['player','hof']){const source=file.sources[record];if(!source||typeof source!=='object'){notices.push(`${record}: 원문 상태가 없습니다.`);continue;}if(Object.hasOwn(source,'raw'))inspect(record,source.raw,record==='player'?'원본 선수':'원본 졸업 명단');else notices.push(`${record}: 원문을 읽지 못한 상태만 남아 있습니다.`);}
 for(const [key,label]of [['pendingWrites','대기 기록'],['rejectedWrites','거부 기록']]){
  if(file[key]!=null&&!Array.isArray(file[key]))throw Error('복구 기록의 대기 목록 형식이 올바르지 않습니다.');
  for(const [i,row]of (file[key]||[]).entries()){if(!row||typeof row!=='object')notices.push(`${label} ${i+1}: 형식을 확인하세요.`);else inspect(row.record,row.raw,`${label} ${i+1}`);}
 }
 if(file.pendingGraduates!=null&&!Array.isArray(file.pendingGraduates))throw Error('복구 기록의 졸업 대기 목록을 확인하세요.');
 if(file.pendingGraduates?.length)inspect('hof',JSON.stringify(file.pendingGraduates),'별도 대기 졸업 선수');
 return {candidates,notices,warning:'미리보기만 만들었습니다. 현재 기록은 바꾸지 않았습니다. 대기 졸업 명단은 전체 원본 명단이 아니며 자동으로 합치지 않습니다.'};
}
