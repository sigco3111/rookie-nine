import { setLineup } from './pro.js';
import { STAT_NAME,keysOf } from './data.js';
export function mountProRoster(parent,store,clubId){
 const el=document.createElement('section');el.className='pro-roster';parent.append(el);let removed=false,message='';
 function draw(){
  if(removed)return;el.replaceChildren();const state=store.load(),title=document.createElement('h2');title.textContent='출전 명단 편성';el.append(title);
  if(!state.ok){el.append(document.createTextNode(state.error));return;}const club=state.data.clubs.find(c=>c.id===clubId);if(!club){el.append(document.createTextNode('구단을 확인하세요.'));return;}
  const status=store.status(),locked=!!club.pending||status.pending||status.conflict;
  const info=document.createElement('p');info.textContent=club.pending?'진행 중인 경기를 마친 뒤 편성을 바꿀 수 있습니다.':status.pending?'미저장 진행을 먼저 저장하세요.':'타순9명과 선발 투수를 선택하세요. 구단 입단 방식은 이 화면에서 바꾸지 않습니다.';el.append(info);
  if(message){const p=document.createElement('p');p.setAttribute('role','status');p.textContent=message;el.append(p);}
  const form=document.createElement('form'),selects=[];
  const picker=(label,value,pos)=>{const row=document.createElement('label');row.textContent=label;const select=document.createElement('select');select.disabled=locked;select.setAttribute('aria-label',label);const blank=document.createElement('option');blank.value='';blank.textContent='미편성';select.append(blank);for(const p of club.roster.filter(p=>p.pos===pos)){const option=document.createElement('option');option.value=p.id;option.textContent=p.name+(p.source==='graduate'?' · 육성':' · 기본');select.append(option);}select.value=value||'';row.append(select);form.append(row);return select;};
  for(let i=0;i<9;i++)selects.push(picker(`${i+1}번 타자`,club.lineup[i],'bat'));const starter=picker('선발 투수',club.starter,'pit');
  const button=document.createElement('button');button.type='submit';button.className='btn';button.textContent='편성 저장';button.disabled=locked;form.append(button);el.append(form);
  form.onsubmit=e=>{e.preventDefault();try{const latest=store.load();if(!latest.ok||latest.data.revision!==state.data.revision)throw Error('기록이 바뀌었습니다. 새 명단을 확인하세요.');const index=latest.data.clubs.findIndex(c=>c.id===clubId);latest.data.clubs[index]=setLineup(latest.data.clubs[index],{batters:selects.map(s=>s.value||null),starter:starter.value||null});const saved=store.save(latest.data);message=saved.ok?'출전 명단을 저장했습니다.':'편성 저장 대기 중입니다. 저장 안내를 확인하세요.';}catch(e){message=e.message;}draw();};
  const heading=document.createElement('h3');heading.textContent='구단 선수';el.append(heading);
  for(const p of club.roster){const card=document.createElement('article');const strong=document.createElement('strong');strong.textContent=`${p.name} · ${p.pos==='pit'?'투수':'타자'} · ${p.source==='graduate'?'육성 선수':'기본 선수'}`;const stats=document.createElement('p');stats.textContent=keysOf(p).map(k=>`${STAT_NAME[k]} ${p.abilities[k]}`).join(' · ');card.append(strong,stats);el.append(card);}
 }
 const unsub=store.subscribe(draw);draw();return {element:el,refresh:draw,destroy(){removed=true;unsub();el.remove();}};
}
