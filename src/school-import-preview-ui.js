import { previewSchoolRecovery } from './school-import-preview.js';
// Local inspection with optional caller-owned, explicitly confirmed restore hooks.
export function mountSchoolRecoveryPreview(parent,{onClose=()=>{},restorer=null,onRestored=()=>{}}={}){
 const shade=document.createElement('div');shade.className='modal school-preview';const panel=document.createElement('section');panel.className='panel';shade.append(panel);parent.append(shade);let serial=0,removed=false;
 const add=(tag,text,target=panel)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};
 add('h2','복구 파일 살펴보기');add('p','내려받은 기록의 내용을 확인합니다. 현재 저장을 바꾸거나 파일을 서버에 보내지 않습니다. 복원할 후보를 고른 뒤 별도 확인해야 현재 기록을 바꿉니다.');
 const label=add('label','복구 JSON 파일 선택 (8MB 이하)'),input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','복구 파일 선택');label.append(input);const status=add('p','파일을 선택하세요.'),result=add('div','');status.setAttribute('role','status');
 const confirmBox=add('div','');confirmBox.className='school-restore-confirm';
 const close=add('button','닫기');close.type='button';close.className='btn';close.onclick=()=>{destroy();onClose();};
 function destroy(){removed=true;serial++;shade.remove();}
 input.onchange=async()=>{const token=++serial,file=input.files[0];result.replaceChildren();confirmBox.replaceChildren();if(!file){status.textContent='파일을 선택하세요.';return;}status.textContent='파일을 확인하고 있습니다.';
  try{if(file.size>8*1024*1024)throw Error('8MB 이하의 파일을 선택하세요.');const text=await file.text();if(removed||token!==serial)return;const preview=previewSchoolRecovery(text);status.textContent=restorer?'파일을 읽었습니다. 아직 현재 기록을 바꾸지 않았습니다. 후보 선택 후 별도 확인 버튼을 누르면 선택한 대상이 교체됩니다. 부분 대기 졸업 명단은 자동으로 합치지 않습니다.':preview.warning;
   if(!preview.candidates.length)add('p','형식 검사를 통과한 후보가 없습니다.',result);
   for(const candidate of preview.candidates){const card=add('article','',result);add('strong',candidate.source,card);add('p',candidate.summary,card);add('small',candidate.record==='hof'?'졸업 명단 후보 · 자동 병합하지 않음':'선수 기록 후보 · 자동 선택하지 않음',card);
    if(restorer&&candidate.source!=='별도 대기 졸업 선수'&&!candidate.source.startsWith('거부 기록')){const choose=add('button','이 기록 복원 검토',card);choose.type='button';choose.className='btn gray';choose.onclick=()=>{confirmBox.replaceChildren();try{const plan=restorer.prepare(candidate);add('h3','선택한 기록을 복원할까요?',confirmBox);add('p',`${candidate.source} · ${plan.summary}`,confirmBox);add('p',`${plan.record==='hof'?'명예의 전당 전체를 교체합니다. 합치지 않습니다.':'현재 선수 한 명을 교체합니다.'} 기존 전체 원문을 별도 백업하고 확인한 뒤 바꿉니다. 완료 후 화면을 새로 읽습니다.`,confirmBox);const confirm=add('button','백업 후 이 기록으로 복원',confirmBox),cancel=add('button','취소',confirmBox);confirm.type=cancel.type='button';confirm.className='btn warn';cancel.className='btn gray';cancel.onclick=()=>confirmBox.replaceChildren();confirm.onclick=()=>{confirm.disabled=true;try{const result=restorer.restore(plan,{confirmed:true,backupId:crypto.randomUUID()});input.disabled=true;confirmBox.replaceChildren();status.textContent='복원한 기록을 다시 읽어 확인했습니다. 기존 원문 백업도 보존했습니다.';onRestored(result);}catch(e){status.textContent=e.message;confirmBox.replaceChildren();}};confirmBox.scrollIntoView({block:'nearest'});}catch(e){status.textContent=e.message;}};}
}
   if(preview.notices.length){add('h3','확인할 항목',result);for(const note of preview.notices)add('p',note,result);}
  }catch(e){if(!removed&&token===serial)status.textContent=e.message;}
 };
 return {element:shade,destroy};
}
