import { readSchoolBackups, schoolBackupDownload } from './school-backups.js';
export function mountSchoolBackups(parent,storage){
 const shade=document.createElement('div');shade.className='modal school-preview';const panel=document.createElement('section');panel.className='panel';shade.append(panel);parent.append(shade);let removed=false;
 const add=(tag,text,target=panel)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};
 add('h2','고교 기록 원문 백업');add('p','명시적 복원 직전에 보존한 원문입니다. 조회·내려받기만 하며 현재 저장을 바꾸지 않습니다. 브라우저 기록을 지우면 이 백업도 사라질 수 있습니다.');const list=add('div',''),status=add('p','');status.setAttribute('role','status');
 function draw(){if(removed)return;list.replaceChildren();const read=readSchoolBackups(storage);for(const error of read.errors)add('p',error,list);if(!read.items.length)add('p','읽을 수 있는 백업이 없습니다.',list);
  for(const item of read.items){const card=add('article','',list);add('strong',`백업 ${item.id}`,card);add('p',item.valid?'원문 보존 파일':'파일 형식 확인 필요 · 원문 그대로 보존',card);const b=add('button','이 백업 내려받기',card);b.type='button';b.className='btn gray';b.onclick=()=>{try{const raw=schoolBackupDownload(storage,item),url=URL.createObjectURL(new Blob([raw],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`rookie9-school-backup-${item.id.replace(/[^a-zA-Z0-9_-]/g,'_')}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);status.textContent='다운로드를 요청했습니다. 다운로드 목록에서 저장됐는지 확인하세요. 원본과 현재 기록은 바꾸지 않았습니다.';}catch(e){status.textContent=e.message;}};}
 }
 const refresh=add('button','목록 다시 읽기');refresh.type='button';refresh.className='btn gray';refresh.onclick=draw;const close=add('button','닫기');close.type='button';close.className='btn';close.onclick=()=>{removed=true;shade.remove();};draw();return {destroy(){removed=true;shade.remove();}};
}
