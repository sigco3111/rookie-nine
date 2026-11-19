import { playerFromGraduate } from './pro.js';
import { STAT_NAME, TRAITS } from './data.js';
// Read-only bridge preview. The caller supplies archive data; this never assigns a club.
export function mountProGraduates(parent,entries,store){
 const el=document.createElement('section');el.className='pro-graduates';parent.append(el);let removed=false;
 const add=(tag,value,target=el)=>{const e=document.createElement(tag);e.textContent=value;target.append(e);return e;};
 function draw(){
  if(removed)return;el.replaceChildren();add('h2','졸업 선수 확인');add('p','프로 입단 전 능력과 고교 기록을 확인합니다. 이 화면에서는 입단·복사·이적을 하지 않습니다.');
  if(!Array.isArray(entries)){add('p','졸업 명단을 읽을 수 없습니다. 원본 기록을 확인하세요.').setAttribute('role','alert');return;}
  const loaded=store.load();if(!loaded.ok){add('p',loaded.error).setAttribute('role','alert');return;}
  if(!entries.length){add('p','아직 졸업한 선수가 없습니다.');return;}
  for(const [i,entry]of [...entries].entries()){
   const card=add('article','');let p;try{p=playerFromGraduate(entry);}catch{add('strong',`졸업 기록 ${i+1} · 확인 필요`,card);add('p','능력·포지션 정보가 올바르지 않아 입단용 미리보기를 만들지 않았습니다. 원본은 바꾸지 않았습니다.',card);continue;}
   add('h3',`${p.name} · ${p.pos==='pit'?'투수':'타자'}`,card);add('p',p.draft.rank&&p.draft.team?`고교 지명 기록: ${p.draft.team} ${p.draft.rank}순위`:'고교 지명 기록: 미지명 또는 기록 없음',card);
   const clubs=loaded.data.clubs.filter(c=>c.roster.some(r=>r.id===p.id)).map(c=>c.name);add('p',clubs.length?`프로 명단에 있음: ${clubs.join(' · ')}`:'프로 명단에 아직 없음',card).className='pro-graduate-state';
   const abilities=add('div','',card);abilities.className='pro-graduate-abilities';for(const [k,v]of Object.entries(p.abilities))add('span',`${STAT_NAME[k]||k} ${v}`,abilities);
   add('p',p.traits.length?`특수능력: ${p.traits.map(t=>TRAITS[t].name).join(' · ')}`:'특수능력 없음',card);
   const school=add('details','',card);add('summary','고교 기록',school);const keys=p.pos==='pit'?[['wins','승'],['losses','패'],['ip','이닝'],['so','탈삼진'],['hitsAllowed','피안타']]:[['wins','승'],['losses','패'],['ab','타수'],['hits','안타'],['hr','홈런'],['rbi','타점']];add('p',keys.map(([k,label])=>`${label} ${p.school[k]??'미기록'}`).join(' · '),school);add('small','고교 기록은 원본 그대로 두고 프로 기록과 분리합니다.',card);
  }
 }
 const unsub=store.subscribe(draw);draw();return {element:el,refresh:draw,destroy(){removed=true;unsub();el.remove();}};
}
