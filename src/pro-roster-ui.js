import {appendProTraits} from './pro-traits-ui.js';
import {suggestClubLineup} from './pro-lineup-suggest.js';
import { setLineup } from './pro.js';
import { STAT_NAME,keysOf } from './data.js';
export function mountProRoster(parent,store,clubId){
 const el=document.createElement('section');el.className='pro-roster';parent.append(el);let removed=false,message='';
 const add=(tag,text,target=el)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};
 function draw(){
  if(removed)return;el.replaceChildren();const state=store.load();add('h2','출전 명단 편성');
  if(!state.ok){add('p',state.error);return;}const club=state.data.clubs.find(c=>c.id===clubId);if(!club){add('p','구단을 확인하세요.');return;}
  const status=store.status(),locked=!!club.pending||status.pending||status.conflict;
  add('p',club.pending?'진행 중인 경기를 마친 뒤 편성을 바꿀 수 있습니다.':status.conflict?'저장 충돌을 먼저 확인하세요.':status.pending?'미저장 진행을 먼저 저장하세요.':'타순 9명과 선발 투수를 선택하세요. 선택만으로는 저장되지 않습니다.');
  if(message)add('p',message).setAttribute('role','status');
  const draft=add('p','');draft.className='pro-roster-draft';draft.setAttribute('aria-live','polite');
  const form=add('form',''),selects=[],previews=[];let starter,suggested=false;
  const delegate=add('button','편성 위임 · 제안 보기',form);delegate.type='button';delegate.disabled=locked;delegate.className='btn';
  const method=add('small','타자: 미트·파워·주력 합이 높은 9명을 같은 순서로, 선발: 구속·제구·변화구 합이 가장 높은 선수. 동점은 명단 순서입니다. 특능·최근 성적은 계산하지 않습니다.',form);method.className='pro-delegate-method';
  const delegation=add('div','',form);delegation.className='pro-delegate-confirm';delegation.hidden=true;
  const quickSave=add('button','편성 저장',form);quickSave.type='submit';quickSave.className='btn';quickSave.disabled=locked;
  const picker=(label,value,pos)=>{
   const box=add('div','',form);box.className='pro-lineup-slot';const row=add('label',label,box),select=add('select','',row);select.disabled=locked;select.setAttribute('aria-label',label);
   const blank=add('option','미편성',select);blank.value='';blank.textContent='미편성';for(const p of club.roster.filter(p=>p.pos===pos)){const option=add('option',p.name+(p.source==='graduate'?' · 육성':' · 기본'),select);option.value=p.id;}select.value=value||'';
   const preview=add('p','',box);preview.className='pro-slot-preview';previews.push({select,preview,box});select.onchange=()=>updateDraft();return select;
  };
  for(let i=0;i<9;i++)selects.push(picker(`${i+1}번 타자`,club.lineup[i],'bat'));starter=picker('선발 투수',club.starter,'pit');
  const button=add('button','편성 저장',form);button.type='submit';button.className='btn';button.disabled=locked;
  const heading=add('h3','구단 선수');const rosterCards=[];
  for(const p of club.roster){const card=add('article','');card.dataset.playerId=p.id;const badge=add('small','',card);badge.className='pro-roster-role';add('strong',`${p.name} · ${p.pos==='pit'?'투수':'타자'} · ${p.source==='graduate'?'육성 선수':'기본 선수'}`,card);add('p',keysOf(p).map(k=>`${STAT_NAME[k]} ${p.abilities[k]}`).join(' · '),card);appendProTraits(card,p,{rules:club.league?(club.pending?(club.pending.session?.rules??1):2):1});rosterCards.push({p,badge});}
  function updateDraft(){
   const ids=selects.map(s=>s.value),seen=ids.filter(Boolean),duplicates=new Set(seen.filter((id,i)=>seen.indexOf(id)!==i));
   const changed=ids.some((id,i)=>id!==(club.lineup[i]||''))||starter.value!==(club.starter||'');
   draft.dataset.dirty=String(changed);draft.textContent=`${changed?'변경 미저장':'저장된 편성'}${suggested?' · 위임안 적용 중':''} · 타자 ${new Set(seen).size} / 9명 · 선발 ${starter.value?'1 / 1명':'미편성'}${duplicates.size?' · 같은 선수를 두 번 편성할 수 없습니다.':''}`;
   for(const {select,preview,box}of previews){const p=club.roster.find(p=>p.id===select.value),duplicate=duplicates.has(select.value);select.setAttribute('aria-invalid',String(duplicate));box.dataset.duplicate=String(duplicate);preview.textContent=p?keysOf(p).slice(0,3).map(k=>`${STAT_NAME[k]} ${p.abilities[k]}`).join(' · '):'선수를 선택하면 주요 능력치를 표시합니다.';}
   heading.textContent=changed?'구단 선수 · 편집 중 선택 기준':'구단 선수 · 저장된 편성 기준';
   for(const {p,badge}of rosterCards){const places=ids.flatMap((id,i)=>id===p.id?[`${i+1}번 타자`]:[]);badge.textContent=places.length?places.join(' · '):p.id===starter.value?'선발 투수':'대기';badge.dataset.selected=String(places.length>0||p.id===starter.value);}
  }
  delegate.onclick=()=>{try{const proposal=suggestClubLineup(club);delegation.replaceChildren();delegation.hidden=false;
   add('strong','위임 제안 · 아직 적용하지 않았습니다',delegation);add('p',proposal.batters.map((id,i)=>`${i+1}번 ${club.roster.find(p=>p.id===id).name}`).join(' · '),delegation);add('p','선발 '+club.roster.find(p=>p.id===proposal.starter).name,delegation);add('small','적용하면 이 화면의 편집 중 선택을 바꿉니다. 기존 저장은 그대로이며, 확인 후 편성 저장을 눌러야 기록됩니다.',delegation);
   const apply=add('button','위임안 편집에 적용',delegation);apply.type='button';apply.onclick=()=>{selects.forEach((s,i)=>s.value=proposal.batters[i]);starter.value=proposal.starter;suggested=true;delegation.hidden=true;updateDraft();};const cancel=add('button','위임 취소',delegation);cancel.type='button';cancel.onclick=()=>{delegation.hidden=true;};
  }catch(e){delegation.replaceChildren();delegation.hidden=false;add('p',e.message,delegation).setAttribute('role','alert');}};
  const restore=add('button','저장된 편성으로 되돌리기',form);restore.type='button';restore.disabled=locked;restore.className='btn';restore.onclick=()=>{selects.forEach((s,i)=>s.value=club.lineup[i]||'');starter.value=club.starter||'';suggested=false;delegation.hidden=true;updateDraft();};
  updateDraft();
  form.onsubmit=e=>{e.preventDefault();try{const latest=store.load();if(!latest.ok||latest.data.revision!==state.data.revision)throw Error('기록이 바뀌었습니다. 새 명단을 확인하세요.');const index=latest.data.clubs.findIndex(c=>c.id===clubId);latest.data.clubs[index]=setLineup(latest.data.clubs[index],{batters:selects.map(s=>s.value||null),starter:starter.value||null});const saved=store.save(latest.data);message=saved.ok?'출전 명단을 저장했습니다.':'편성 저장 대기 중입니다. 저장 안내를 확인하세요.';}catch(e){message=e.message;}draw();};
 }
 const unsub=store.subscribe(draw);draw();return {element:el,refresh:draw,destroy(){removed=true;unsub();el.remove();}};
}
