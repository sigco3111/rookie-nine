// Non-mutating, fail-closed reads. Missing, unreadable and invalid are distinct states.
import { keysOf, TRAITS } from './data.js';
const object=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
const finite=(v,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isFinite(v)&&v>=min&&v<=max;
function playerError(p){
 if(!object(p)||typeof p.name!=='string'||!['bat','pit'].includes(p.pos))return '선수 기본 정보';
 if(!Number.isInteger(p.week)||p.week<0||p.week>144||typeof p.done!=='boolean')return '선수 진행 정보';
 if(keysOf(p).some(k=>!finite(p[k],0,99)))return '선수 능력';
 if(!Array.isArray(p.traits)||p.traits.some(t=>!TRAITS[t]))return '특수능력';
 if(!Array.isArray(p.log)||p.log.some(t=>typeof t!=='string')||!Array.isArray(p.tour)||p.tour.some(t=>typeof t!=='string'))return '선수 활동 기록';
 if(!object(p.ev)||['coach','captain','team','scout'].some(k=>!finite(p.ev[k],0,100))||!object(p.cnt)||Object.values(p.cnt).some(n=>!Number.isInteger(n)||n<0))return '평가·훈련 기록';
 for(const k of ['cond','will','tough','study'])if(!finite(p[k],0,100))return '선수 상태';
 for(const k of ['money','wins','losses','ab','hits','hr','rbi'])if(!finite(p[k]))return '선수 누적 기록';
 for(const k of ['pendingMatch','pendingResult','pendingEvent','pendingEventResult','pendingLearned','review'])if(p[k]!=null&&!object(p[k]))return '진행 중인 화면 기록';
 return null;
}
function archiveError(h){
 if(!Array.isArray(h))return '명예의 전당 목록';
 for(const e of h){
  if(!object(e)||typeof e.name!=='string'||!['bat','pit'].includes(e.pos)||!finite(e.ovr,0,99))return '졸업 선수 기본 정보';
  if(!Array.isArray(e.stats)||e.stats.length!==keysOf(e).length||e.stats.some(n=>!finite(n,0,99)))return '졸업 선수 능력';
  if(!Array.isArray(e.traits)||e.traits.some(t=>!TRAITS[t]))return '졸업 선수 특수능력';
  if(e.career!=null&&!object(e.career))return '졸업 선수 성적';
  if(e.yearReviews!=null&&!Array.isArray(e.yearReviews))return '졸업 선수 학년 기록';
 }
 return null;
}
export function decodeSchoolRecord(raw,kind){
 if(!['player','hof'].includes(kind))throw Error('기록 종류를 확인하세요.');
 if(raw===null)return {ok:true,state:'missing',data:kind==='hof'?[]:null,raw:null};
 if(typeof raw!=='string')return {ok:false,state:'invalid',error:'저장 원문 형식이 올바르지 않습니다.',raw};
 let data;try{data=JSON.parse(raw);}catch{return {ok:false,state:'invalid',error:'저장 원문을 해석할 수 없습니다.',raw};}
 const error=kind==='player'?playerError(data):archiveError(data);
 return error?{ok:false,state:'invalid',error:`${error}를 확인해야 합니다. 원본은 바꾸지 않았습니다.`,raw}:{ok:true,state:'valid',data,raw};
}
export function readSchoolRecord(storage,key,kind){
 let raw;try{raw=storage.getItem(key);}catch{return {ok:false,state:'unreadable',error:'브라우저에서 저장 기록을 읽지 못했습니다. 설정을 확인한 뒤 다시 시도하세요.'};}
 return decodeSchoolRecord(raw,kind);
}
