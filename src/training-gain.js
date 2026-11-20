// Version2 applies only to newly created careers. No minimum+1 can bypass taper.
export function trainingGainV2({base,multiplier,current,basic=false,roll}){
 if(!Number.isFinite(base)||base<0||!Number.isFinite(multiplier)||multiplier<0||!Number.isFinite(current)||current<0||current>99||!Number.isFinite(roll)||roll<0||roll>=1)throw Error('훈련 증가량 입력을 확인하세요.');
 const taper=current>=90?.25:current>=75?.45:current>=60?.7:1;
 const expected=base*multiplier*taper*(basic?.4:1),whole=Math.floor(expected);
 return Math.min(99-current,whole+(roll<expected-whole?1:0));
}
export function growthPacingText(player){return player.growthRules===2?'새 성장 판정 · 기초훈련은 넓고 완만하게, 전문훈련은 선택 능력 중심으로 성장합니다. 능력 60·75·90부터 점차 느려지며 소수 증가량은 확률로 반영합니다.':'기존 성장 판정 유지 · 이 선수는 이전 훈련 증가량으로 계속 진행합니다. 새 성장 판정은 새로 만든 선수부터 적용됩니다.';}
