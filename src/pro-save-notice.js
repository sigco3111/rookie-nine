// Mount outside replaceable mode screens. Recovery always verifies backups before selecting a version.
import { PRO_KEY } from './pro-storage.js';
export function mountProSaveNotice(store,{parent=document.body,onStatus=()=>{},onRecovered=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-save-notice';el.hidden=true;el.setAttribute('role','alert');
 const title=document.createElement('strong'),detail=document.createElement('p'),button=document.createElement('button');button.className='btn warn';button.textContent='프로 기록 저장 다시 시도';button.type='button';
 const choices=document.createElement('div'),confirm=document.createElement('div'),message=document.createElement('p');message.className='recovery-message';let selected=null,removed=false;
 const makeButton=(text,action)=>{const b=document.createElement('button');b.type='button';b.className='btn warn';b.textContent=text;b.onclick=action;return b;};
 const local=makeButton('이 창의 진행 선택',()=>choose('local')),disk=makeButton('다른 창의 저장 선택',()=>choose('disk'));
 choices.append(local,disk);const question=document.createElement('p'),yes=makeButton('두 기록 백업 후 선택 확정',()=>{
  if(!selected)return;try{const result=store.recover(selected);if(result.ok){selected=null;draw();onRecovered(result);}else {message.textContent=result.error;draw();}}
  catch{message.textContent='복구할 기록을 확인하지 못했습니다. 원본을 보존하고 진행을 멈춥니다.';draw();}
 }),no=makeButton('취소',()=>{selected=null;draw();});confirm.append(question,yes,no);el.append(title,detail,button,choices,confirm,message);parent.append(el);
 function choose(choice){selected=choice;message.textContent='';draw();}
 const summary=r=>r?`저장판 ${r.revision} · ${r.clubs.map(c=>`${c.name} ${c.games}경기 ${c.wins}승${c.losses}패${c.pending?' (진행 중 경기 있음)':''}`).join(' / ')||'구단 없음'}`:'저장 기록 없음';
 function draw(){
  if(removed)return;const state=store.load(),status=store.status();el.hidden=state.ok&&!status.pending&&!status.conflict;
  button.hidden=!state.ok||status.conflict||!status.pending;choices.hidden=true;confirm.hidden=true;
  if(!state.ok){title.textContent='프로 기록을 읽지 못했습니다';detail.textContent='저장된 원본은 바꾸지 않았습니다. 새 구단으로 덮어쓰지 말고 브라우저 저장 설정을 확인하세요. 기록 복구 전에는 프로 진행을 멈춥니다. 고교 육성 기록은 별도입니다.';}
  else if(status.conflict){
   title.textContent='다른 창의 프로 기록과 충돌했습니다';detail.textContent='이 창의 미저장 진행과 다른 창의 저장 기록을 보존했습니다. 선택 전에는 창을 닫거나 새로고침하지 마세요. 두 기록의 백업을 저장·확인한 뒤 선택한 기록으로 이어갑니다. 선택하지 않은 진행은 현재 경기에서 빠지며 백업에 남습니다.';
   try{const versions=store.recoveryOptions();if(versions){local.textContent='이 창 선택: '+summary(versions.local);disk.textContent='다른 창 선택: '+summary(versions.disk);disk.disabled=!versions.disk;choices.hidden=!!selected;confirm.hidden=!selected;question.textContent=(selected==='local'?'이 창의 미저장 진행':'다른 창의 저장 기록')+'으로 이어갈까요? 선택하지 않은 기록은 백업에만 남습니다. 다른 창에서도 동시에 진행하지 마세요.';}}
   catch{message.textContent='다른 창의 기록을 읽을 수 없어 자동 복구하지 않습니다. 두 기록을 보존했습니다.';}
  }
  else {selected=null;title.textContent='프로 진행을 저장하지 못했습니다';detail.textContent='최신 진행은 이 창에만 있습니다. 창을 닫거나 새로고침하면 잃을 수 있습니다. 저장 공간·브라우저 설정을 확인한 뒤 다시 시도하세요. 고교 육성 기록은 별도입니다.';}
  onStatus({blocked:!state.ok||status.conflict,pending:status.pending,ok:el.hidden});
 }
 button.onclick=()=>{store.retry();draw();};const unsubscribe=store.subscribe(draw);
 const storageChanged=e=>{if(e.key===PRO_KEY||e.key===null){selected=null;draw();}};window.addEventListener('storage',storageChanged);
 const beforeUnload=e=>{if(store.status().pending){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',beforeUnload);draw();
 return {element:el,refresh:draw,destroy(){removed=true;unsubscribe();window.removeEventListener('storage',storageChanged);window.removeEventListener('beforeunload',beforeUnload);el.remove();}};
}
