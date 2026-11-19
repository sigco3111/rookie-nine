// Recovery copies stay on this browser. No network requests or automatic deletion.
import { PRO_KEY, validateProSave } from './pro-storage.js';
const prefix=PRO_KEY+'.recovery.';
const summarize=data=>({revision:data.revision,clubs:data.clubs.map(c=>({name:c.name,games:c.record.games,wins:c.record.wins,losses:c.record.losses,pending:!!c.pending}))});
export function readProBackup(storage,key){
 if(typeof key!=='string'||!key.startsWith(prefix))throw Error('프로 백업을 선택하세요.');
 const raw=storage.getItem(key),value=JSON.parse(raw);
 if(!value||value.schema!==1||!Number.isSafeInteger(value.createdAt)||typeof value.local!=='string'||!(value.external===null||typeof value.external==='string'))throw Error('백업 원본을 확인할 수 없습니다.');
 const local=validateProSave(JSON.parse(value.local)),external=value.external===null?null:validateProSave(JSON.parse(value.external));
 return {key,raw,createdAt:value.createdAt,local,external,summaries:{local:summarize(local),external:external?summarize(external):null}};
}
export function listProBackups(storage){
 const found=[];
 for(let i=0;i<storage.length;i++){const key=storage.key(i);if(!key?.startsWith(prefix))continue;
  try{const entry=readProBackup(storage,key);found.push({key,createdAt:entry.createdAt,ok:true,summaries:entry.summaries});}
  catch{found.push({key,createdAt:0,ok:false});}
 }
 return found.sort((a,b)=>b.createdAt-a.createdAt||a.key.localeCompare(b.key));
}
export function exportProBackup(storage,key){const entry=readProBackup(storage,key);return {filename:'rookie9-pro-backup-'+entry.createdAt+'.json',text:entry.raw};}
export function restoreProBackup(storage,store,{key,version,expectedRaw}){
 if(!['local','external'].includes(version))throw Error('되돌릴 기록을 선택하세요.');
 if(store.status().pending)throw Error('이 창의 미저장 진행을 먼저 보존하세요.');
 const entry=readProBackup(storage,key),selected=entry[version];if(!selected)throw Error('선택한 백업 기록이 없습니다.');
 const current=storage.getItem(PRO_KEY);if(current!==expectedRaw)throw Error('현재 저장이 바뀌었습니다. 다시 비교하세요.');
 // A corrupt current main record must not be overwritten through the backup picker.
 const currentData=current===null?null:validateProSave(JSON.parse(current));
 const guardRaw=JSON.stringify({schema:1,createdAt:Date.now(),local:JSON.stringify(selected),external:current,choice:'backup-restore',source:key});
 const guardKey=prefix+Date.now()+'.'+Math.random().toString(36).slice(2);
 try{
  if(storage.getItem(guardKey)!==null)throw Error('백업 식별자가 겹칩니다.');storage.setItem(guardKey,guardRaw);
  if(storage.getItem(guardKey)!==guardRaw||storage.getItem(PRO_KEY)!==current)throw Error('되돌리기 전 백업을 확인하지 못했습니다.');
  const data=structuredClone(selected);data.revision=Math.max(data.revision,currentData?.revision||0)+1;
  const raw=JSON.stringify(validateProSave(data));storage.setItem(PRO_KEY,raw);if(storage.getItem(PRO_KEY)!==raw)throw Error('저장 결과를 확인하지 못했습니다.');
  return {ok:true,backupKey:guardKey,data};
 }catch{return {ok:false,error:'백업 되돌리기를 마치지 못했습니다. 원본 백업은 유지했습니다.'};}
}
