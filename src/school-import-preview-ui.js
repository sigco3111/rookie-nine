import { previewSchoolRecovery } from './school-import-preview.js';
// Local inspection only. No restore or storage API is available to this component.
export function mountSchoolRecoveryPreview(parent,{onClose=()=>{}}={}){
 const shade=document.createElement('div');shade.className='modal school-preview';const panel=document.createElement('section');panel.className='panel';shade.append(panel);parent.append(shade);let serial=0,removed=false;
 const add=(tag,text,target=panel)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};
 add('h2','복구 파일 살펴보기');add('p','내려받은 기록의 내용을 확인합니다. 현재 저장을 바꾸거나 파일을 서버에 보내지 않습니다. 복원 기능은 아직 없습니다.');
 const label=add('label','복구 JSON 파일 선택 (8MB 이하)'),input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.setAttribute('aria-label','복구 파일 선택');label.append(input);const status=add('p','파일을 선택하세요.'),result=add('div','');status.setAttribute('role','status');
 const close=add('button','닫기');close.type='button';close.className='btn';close.onclick=()=>{destroy();onClose();};
 function destroy(){removed=true;serial++;shade.remove();}
 input.onchange=async()=>{const token=++serial,file=input.files[0];result.replaceChildren();if(!file){status.textContent='파일을 선택하세요.';return;}status.textContent='파일을 확인하고 있습니다.';
  try{if(file.size>8*1024*1024)throw Error('8MB 이하의 파일을 선택하세요.');const text=await file.text();if(removed||token!==serial)return;const preview=previewSchoolRecovery(text);status.textContent=preview.warning;
   if(!preview.candidates.length)add('p','형식 검사를 통과한 후보가 없습니다.',result);
   for(const candidate of preview.candidates){const card=add('article','',result);add('strong',candidate.source,card);add('p',candidate.summary,card);add('small',candidate.record==='hof'?'졸업 명단 후보 · 자동 병합하지 않음':'선수 기록 후보 · 자동 선택하지 않음',card);}
   if(preview.notices.length){add('h3','확인할 항목',result);for(const note of preview.notices)add('p',note,result);}
  }catch(e){if(!removed&&token===serial)status.textContent=e.message;}
 };
 return {element:shade,destroy};
}
