// Candidate helper for measured growth pacing. Not used by the shipped game yet.
// Fractional gains are stochastic-rounded, without a minimum +1 bypassing high-stat slowdown.
export function candidateTrainingGain({base,multiplier,current,basic=false,roll}){
 if(!Number.isFinite(base)||base<0||!Number.isFinite(multiplier)||multiplier<0||!Number.isFinite(current)||current<0||current>99||!Number.isFinite(roll)||roll<0||roll>=1)throw Error('훈련 증가량 입력을 확인하세요.');
 const taper=current>=90?.25:current>=75?.45:current>=60?.7:1;
 const expected=base*multiplier*taper*(basic?.72:1),whole=Math.floor(expected),fraction=expected-whole;
 return Math.min(99-current,whole+(roll<fraction?1:0));
}
