import { createSchoolCast } from './school-cast.js';
import { playerFromGraduate } from './pro.js';
import { STAT_NAME } from './data.js';
export function mountSchoolCastSelection(parent,entries){
 const el=document.createElement('details');el.className='school-cast-select panel';parent.append(el);const title=document.createElement('summary');title.textContent='다회차 선수 합류 (선택)';el.append(title);const note=document.createElement('p');note.textContent='계승 보너스와 별개입니다. 졸업 선수를 이 회차의 후배나 라이벌로 복사합니다. 원본과 프로 명단은 바꾸지 않습니다. 후배는 2학년부터 공유 능력 훈련에 주 1회 최대 +1, 라이벌은 매년 10월 마지막 주 리그전 상대 팀 전력에 반영됩니다.';el.append(note);
 const choices=structuredClone(entries),selects={},preview=document.createElement('div');
 for(const [role,label]of [['junior','후배'],['rival','라이벌']]){
  const row=document.createElement('label');row.textContent=label;const select=document.createElement('select');select.id='cast-'+role;select.className='input';select.setAttribute('aria-label',label+' 합류');const none=document.createElement('option');none.value='';none.textContent='합류 없음';select.append(none);
  choices.forEach((entry,i)=>{try{const p=playerFromGraduate(entry),o=document.createElement('option');o.value=String(i);o.textContent=p.name+' · '+(p.pos==='pit'?'투수':'타자');select.append(o);}catch{}});
  row.append(select);el.append(row);selects[role]=select;select.onchange=draw;
 }
 el.append(preview);
 function selected(role){return selects[role].value===''?null:choices[Number(selects[role].value)];}
 function capture(){return createSchoolCast({junior:selected('junior'),rival:selected('rival')});}
 function draw(){preview.replaceChildren();try{const cast=capture();for(const role of ['junior','rival']){const item=cast[role];if(!item)continue;const p=playerFromGraduate(item.graduate),line=document.createElement('p');line.textContent=`${role==='junior'?'후배':'라이벌'} ${p.name} · `+Object.entries(p.abilities).map(([k,v])=>`${STAT_NAME[k]} ${v}`).join(' · ');preview.append(line);}}catch(e){const error=document.createElement('p');error.textContent=e.message;error.setAttribute('role','alert');preview.append(error);}}
 draw();return {element:el,capture,destroy(){el.remove();}};
}
