import { createProAdmission } from './pro-admission.js';
import { playerFromGraduate } from './pro.js';
import { STAT_NAME, TRAITS } from './data.js';
// Read-only bridge preview. The caller supplies archive data; this never assigns a club.
export function mountProGraduates(parent,entries,store,{destinationClubId=null}={}){
 const el=document.createElement('section');el.className='pro-graduates';parent.append(el);let removed=false,message='',selection=null;const admission=createProAdmission(store);
 const add=(tag,value,target=el)=>{const e=document.createElement(tag);e.textContent=value;target.append(e);return e;};
 function draw(){
  if(removed)return;el.replaceChildren();add('h2','졸업 선수 확인');add('p',destinationClubId?'호출자가 지정한 구단으로 입단 내용을 확인합니다. 고교 지명 기록으로 자동 배정하지 않습니다.':'프로 입단 전 능력과 고교 기록을 확인합니다. 이 화면에서는 입단·복사·이적을 하지 않습니다.');if(message)add('p',message).setAttribute('role','status');
  if(!Array.isArray(entries)){add('p','졸업 명단을 읽을 수 없습니다. 원본 기록을 확인하세요.').setAttribute('role','alert');return;}
  const loaded=store.load();if(!loaded.ok){add('p',loaded.error).setAttribute('role','alert');return;}
  if(!entries.length){add('p','아직 졸업한 선수가 없습니다.');return;}
  for(const [i,entry]of [...entries].entries()){
   const card=add('article','');let p;try{p=playerFromGraduate(entry);}catch{add('strong',`졸업 기록 ${i+1} · 확인 필요`,card);add('p','능력·포지션 정보가 올바르지 않아 입단용 미리보기를 만들지 않았습니다. 원본은 바꾸지 않았습니다.',card);continue;}
   add('h3',`${p.name} · ${p.pos==='pit'?'투수':'타자'}`,card);add('p',p.draft.rank&&p.draft.team?`고교 지명 기록: ${p.draft.team} ${p.draft.rank}순위`:'고교 지명 기록: 미지명 또는 기록 없음',card);
   const clubs=loaded.data.clubs.filter(c=>c.roster.some(r=>r.id===p.id)).map(c=>c.name);add('p',clubs.length?`프로 명단에 있음: ${clubs.join(' · ')}`:'프로 명단에 아직 없음',card).className='pro-graduate-state';
   if(destinationClubId&&!clubs.length){const status=store.status(),b=add('button','입단 내용 확인',card);b.type='button';b.disabled=status.pending||status.conflict;b.onclick=()=>{try{selection=admission.prepare(entry,destinationClubId);message='';draw();}catch(e){message=e.message;draw();}};}
   const abilities=add('div','',card);abilities.className='pro-graduate-abilities';for(const [k,v]of Object.entries(p.abilities))add('span',`${STAT_NAME[k]||k} ${v}`,abilities);
   add('p',p.traits.length?`특수능력: ${p.traits.map(t=>TRAITS[t].name).join(' · ')}`:'특수능력 없음',card);
   const school=add('details','',card);add('summary','고교 기록',school);const keys=p.pos==='pit'?[['wins','승'],['losses','패'],['ip','이닝'],['so','탈삼진'],['hitsAllowed','피안타']]:[['wins','승'],['losses','패'],['ab','타수'],['hits','안타'],['hr','홈런'],['rbi','타점']];add('p',keys.map(([k,label])=>`${label} ${p.school[k]??'미기록'}`).join(' · '),school);add('small','고교 기록은 원본 그대로 두고 프로 기록과 분리합니다.',card);
  }
  if(selection){const box=add('section','');box.className='pro-admission-confirm';add('h3','이 선수의 입단을 확정할까요?',box);add('p',`${selection.playerName} · ${selection.pos==='pit'?'투수':'타자'} → ${selection.clubName}`,box);add('p','고교 원본은 유지하고 프로 기록은 별도로 시작합니다. 입단 뒤 출전 편성은 따로 해야 합니다.',box);const confirm=add('button','이 구단으로 입단 확정',box),cancel=add('button','취소',box);confirm.type=cancel.type='button';cancel.onclick=()=>{selection=null;draw();};confirm.onclick=()=>{const plan=selection;selection=null;try{const result=admission.confirm(plan,{confirmed:true});message=result.ok?'입단을 저장했습니다. 출전 편성을 확인하세요.':'입단 저장 대기 중입니다. 저장 안내에서 재시도하세요.';}catch(e){message=e.message;}draw();};box.scrollIntoView({block:'nearest'});}

 }
 const unsub=store.subscribe(draw);draw();return {element:el,refresh:draw,destroy(){removed=true;unsub();el.remove();}};
}
