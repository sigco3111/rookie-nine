import {battingAverage,earnedRunAverage,sortBattingRows} from './pro-contributions.js';
import './pro-contributions-ui.css';
export function showProContributions(parent,rows,{title='선수별 경기 기록',sort='roster',onSort=null}={}){
 const el=document.createElement('section');el.className='pro-contributions';parent.append(el);const add=(tag,text,target=el)=>{const e=document.createElement(tag);e.textContent=text;target.append(e);return e;};const n=v=>Number.isSafeInteger(v)?v:'미기록';
 add('h3',title);if(onSort){const label=add('label','타자 비교 순서'),select=add('select','',label);select.setAttribute('aria-label','타자 비교 순서');for(const [key,name]of [['roster','명단 순'],['hits','안타 많은 순'],['rbi','타점 많은 순'],['hr','홈런 많은 순']]){const option=add('option',name,select);option.value=key;}select.value=sort;select.onchange=()=>onSort(select.value);}
 add('small','표시한 범위의 실제 기록입니다. 동률은 명단 순이며, 종합 기여도나 수상 순위가 아닙니다. 타율은 안타/타수, 평균자책은 9이닝 기준입니다.');
 const ordered=[...sortBattingRows(rows.filter(p=>p.pos==='bat'),sort),...rows.filter(p=>p.pos==='pit')];
 for(const p of ordered){const card=add('article','');card.className='pro-contribution-row';card.dataset.player=p.id;const name=add('strong',p.name+(p.source==='graduate'?' · 육성':''),card);name.className='pro-contribution-name';const s=p.stats;if(Number.isSafeInteger(s.games))add('small',`${s.games}경기`,card);
 if(p.pos==='bat'){add('p',`${n(s.ab)}타수 ${n(s.hits)}안타 · ${n(s.hr)}홈런 ${n(s.rbi)}타점`,card);add('small',`타율 ${battingAverage(s)??'- (타수 없거나 미기록)'}`,card);}
 else{add('p',`${Number.isSafeInteger(s.outs)?`${Math.floor(s.outs/3)}.${s.outs%3}`:'미기록'}이닝 · ${n(s.so)}탈삼진`,card);add('small',`${n(s.hitsAllowed)}피안타 ${n(s.er)}자책 · 평균자책 ${earnedRunAverage(s)??'- (아웃 없거나 미기록)'}`,card);}
 }
 if(!ordered.length)add('p','표시할 선수 기록이 없습니다.');return el;
}
