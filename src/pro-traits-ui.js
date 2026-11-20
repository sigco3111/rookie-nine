import {TRAITS} from './data.js';
// Presentation only. These are current pro pathways, not new effects or school rules.
const bat={
 avg:['타격 타이밍 허용 폭 증가','안타 판정 확률 보정'],
 pwr:['타구 속도 증가','홈런 판정 확률 보정'],
 run:['짧은 타구의 안타 판정 확률 보정. 도루 조작은 없습니다.','별도 특능 보정 없음'],
 clutch:['주자 있을 때 조준 허용 범위 증가','별도 특능 보정 없음'],
 grit:['2스트라이크에서 타이밍 허용 폭 증가','별도 특능 보정 없음'],
 walk:['조준 허용 범위 소폭 증가','볼넷 판정 확률 보정']
};
const pit={
 fast:['구속 표시와 공 도달 시간 보정','별도 특능 보정 없음'],
 cmd:['목표 위치의 제구 흔들림 감소','별도 특능 보정 없음'],
 aura:['상대 타자의 컨택 판정 감소','삼진 판정 확률 보정'],
 bender:['변화구 선택 시 상대 컨택 판정 감소','별도 특능 보정 없음']
};
export function proTraitRows(player){
 return (player.traits||[]).filter(id=>TRAITS[id]).map(id=>{
  let pair=(player.pos==='pit'?pit:bat)[id];
  if(['gun','glove'].includes(id))pair=['프로에서는 학교 감독·팀 평가를 올리지 않습니다.','프로에서는 학교 감독·팀 평가를 올리지 않습니다.'];
  if(['cold','sleep','bomb','lazy'].includes(id))pair=['학교 회복·훈련용 상태. 프로 경기에는 별도 효과 없음','학교 회복·훈련용 상태. 프로 경기에는 별도 효과 없음'];
  return {id,name:TRAITS[id].name,direct:pair?.[0]||'이 포지션의 프로 직접 경기에는 별도 효과 없음',auto:pair?.[1]||'이 포지션의 프로 자동 경기에는 별도 효과 없음'};
 });
}
export function appendProTraits(parent,player){
 const rows=proTraitRows(player);if(!rows.length)return null;
 const details=document.createElement('details');details.className='pro-trait-scope';parent.append(details);const summary=document.createElement('summary');summary.textContent=`특능 ${rows.length}개 · 프로 적용 범위`;details.append(summary);
 const note=document.createElement('p');note.textContent='직접·자동은 서로 다른 판정입니다. 없는 효과를 추가하거나 학교 기록을 바꾸지 않습니다.';details.append(note);
 for(const row of rows){const box=document.createElement('div'),title=document.createElement('b'),direct=document.createElement('p'),auto=document.createElement('p');title.textContent=row.name;direct.textContent='직접: '+row.direct;auto.textContent='자동: '+row.auto;box.append(title,direct,auto);details.append(box);}return details;
}
