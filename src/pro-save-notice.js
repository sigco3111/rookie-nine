// Mount outside replaceable mode screens. No destructive recovery or silent reset.
import { PRO_KEY } from './pro-storage.js';
export function mountProSaveNotice(store,{parent=document.body,onStatus=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-save-notice';el.hidden=true;el.setAttribute('role','alert');
 const title=document.createElement('strong'),detail=document.createElement('p'),button=document.createElement('button');button.className='btn warn';button.textContent='프로 기록 저장 다시 시도';button.type='button';el.append(title,detail,button);parent.append(el);
 let removed=false;
 function draw(){
  if(removed)return;const state=store.load(),status=store.status();el.hidden=state.ok&&!status.pending&&!status.conflict;
  button.hidden=!state.ok||status.conflict||!status.pending;
  if(!state.ok){title.textContent='프로 기록을 읽지 못했습니다';detail.textContent='저장된 원본은 바꾸지 않았습니다. 새 구단으로 덮어쓰지 말고 브라우저 저장 설정을 확인하세요. 기록 복구 전에는 프로 진행을 멈춥니다. 고교 육성 기록은 별도입니다.';}
  else if(status.conflict){title.textContent='다른 창의 프로 기록과 충돌했습니다';detail.textContent='이 창의 미저장 진행과 다른 창의 저장 기록을 모두 덮어쓰지 않고 보존했습니다. 이 창을 닫거나 새로고침하지 마세요. 어느 기록을 이어갈지 정하기 전에는 프로 진행을 멈춥니다.';}
  else {title.textContent='프로 진행을 저장하지 못했습니다';detail.textContent='최신 진행은 이 창에만 있습니다. 창을 닫거나 새로고침하면 잃을 수 있습니다. 저장 공간·브라우저 설정을 확인한 뒤 다시 시도하세요. 고교 육성 기록은 별도입니다.';}
  onStatus({blocked:!state.ok||status.conflict,pending:status.pending,ok:el.hidden});
 }
 button.onclick=()=>{store.retry();draw();};const unsubscribe=store.subscribe(draw);
 const storageChanged=e=>{if(e.key===PRO_KEY||e.key===null)draw();};window.addEventListener('storage',storageChanged);draw();
 return {element:el,refresh:draw,destroy(){removed=true;unsubscribe();window.removeEventListener('storage',storageChanged);el.remove();}};
}
