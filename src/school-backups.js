const PREFIX='rookie9.school.backup.';
// Enumerates this game's school backups only, never deletes or repairs them.
export function readSchoolBackups(storage){
 const items=[],errors=[];let keys;try{keys=[];for(let i=0;i<storage.length;i++){const k=storage.key(i);if(k?.startsWith(PREFIX))keys.push(k);}}catch{return {items,errors:['백업 목록을 읽지 못했습니다. 브라우저 설정을 확인하세요.']};}
 for(const key of [...new Set(keys)].sort()){
  let raw;try{raw=storage.getItem(key);}catch{errors.push('백업 하나를 읽지 못했습니다. 원본은 바꾸지 않았습니다.');continue;}if(raw===null){errors.push('목록을 읽는 중 백업이 바뀌었습니다. 다시 확인하세요.');continue;}
  let valid=false;try{const file=JSON.parse(raw);valid=file?.kind==='rookie9-school-recovery'&&file.schema===1&&!!file.sources;}catch{}
  items.push({key,id:key.slice(PREFIX.length),raw,valid});
 }
 return {items,errors};
}
export function schoolBackupDownload(storage,item){
 if(!item?.key?.startsWith(PREFIX)||typeof item.raw!=='string')throw Error('백업을 다시 선택하세요.');
 const raw=storage.getItem(item.key);if(raw!==item.raw)throw Error('백업이 바뀌었습니다. 목록을 다시 여세요.');return raw;
}
