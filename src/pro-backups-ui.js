import { PRO_KEY } from './pro-storage.js';
import { listProBackups,readProBackup,exportProBackup,restoreProBackup } from './pro-backups.js';
export function mountProBackups(parent,storage,store,{onRestore=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-backups';parent.append(el);
 let selected=null,problem='',removed=false;
 const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.className='btn';b.textContent=text;b.onclick=fn;return b;};
 const text=(tag,content)=>{const node=document.createElement(tag);node.textContent=content;el.append(node);return node;};
 const describe=s=>`저장판 ${s.revision} · ${s.clubs.map(c=>`${c.name} ${c.games}경기 ${c.wins}승 ${c.losses}패${c.pending?' · 경기 진행 중':''}`).join(' / ')||'구단 없음'}`;
 function draw(){
  if(removed)return;el.replaceChildren();text('h2','프로 기록 백업');text('p','이 브라우저에 보관한 충돌 복구본입니다. 자동으로 지우지 않습니다. 내보낸 파일은 개인 기기에 저장되며 다른 사람에게 전송하지 않습니다.');
  if(problem)text('p',problem).setAttribute('role','alert');
  if(selected){
   text('h3','백업 기록으로 되돌리기');text('p',selected.summary);text('p','현재 프로 진행은 선택한 기록으로 바뀝니다. 현재 기록도 새 백업에 먼저 보관합니다. 다른 창의 프로 진행을 멈춘 뒤 확정하세요. 고교 육성은 바뀌지 않습니다.');
   el.append(button('현재 기록 백업 후 되돌리기 확정',()=>{try{const result=restoreProBackup(storage,store,selected);if(!result.ok){problem=result.error;draw();return;}selected=null;problem='백업 기록으로 되돌렸습니다. 바꾸기 전 기록도 백업에 남겼습니다.';draw();onRestore(result);}catch(error){problem=error.message;selected=null;draw();}}),button('취소',()=>{selected=null;problem='';draw();}));return;
  }
  let entries;try{entries=listProBackups(storage);}catch{problem='백업 목록을 읽을 수 없습니다. 저장 설정을 확인하세요.';text('p',problem);return;}
  if(!entries.length)text('p','아직 복구 백업이 없습니다.');
  for(const entry of entries){
   const card=document.createElement('article');card.className='pro-backup-card';el.append(card);const date=document.createElement('h3');date.textContent=entry.ok?new Date(entry.createdAt).toLocaleString('ko-KR'):'읽을 수 없는 백업';card.append(date);
   if(!entry.ok){const p=document.createElement('p');p.textContent='원본을 유지했습니다. 이 항목은 되돌리지 않습니다.';card.append(p);continue;}
   for(const version of ['local','external'])if(entry.summaries[version]){
    const label=version==='local'?'당시 이 창':'당시 저장된 기록',p=document.createElement('p');p.textContent=label+': '+describe(entry.summaries[version]);card.append(p);
    card.append(button(label+'으로 되돌리기',()=>{try{if(store.status().pending)throw Error('미저장 진행을 먼저 보존하세요.');const backup=readProBackup(storage,entry.key);selected={key:entry.key,version,expectedRaw:storage.getItem(PRO_KEY),summary:label+': '+describe(backup.summaries[version])};problem='';draw();}catch(e){problem=e.message;draw();}}));
   }
   card.append(button('두 기록 파일로 내보내기',()=>{try{const output=exportProBackup(storage,entry.key),url=URL.createObjectURL(new Blob([output.text],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=output.filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{problem='백업 파일을 만들지 못했습니다. 원본은 유지했습니다.';draw();}}));
  }
 }
 draw();return {element:el,refresh:draw,destroy(){removed=true;el.remove();}};
}
