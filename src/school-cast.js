// Per-career copies of explicitly selected graduates. Never changes archive/pro records.
import { graduateId, playerFromGraduate } from './pro.js';
import { keysOf, TRAITS } from './data.js';
const copy=v=>structuredClone(v);
export function createSchoolCast({junior=null,rival=null}={}){
 const snapshot=e=>e===null?null:{id:graduateId(e),graduate:copy(e)};
 const cast={schema:1,junior:snapshot(junior),rival:snapshot(rival)};validateSchoolCast(cast);return cast;
}
export function validateSchoolCast(cast){
 if(!cast||cast.schema!==1||!Object.hasOwn(cast,'junior')||!Object.hasOwn(cast,'rival'))throw Error('다회차 선수 역할을 확인하세요.');
 for(const key of ['junior','rival']){const item=cast[key];if(item===null)continue;
  if(!item||typeof item.id!=='string'||!item.id||item.id!==graduateId(item.graduate)||!item.graduate||typeof item.graduate.name!=='string'||!item.graduate.name)throw Error('다회차 선수 원본 사본을 확인하세요.');
  if(!Array.isArray(item.graduate.traits)||item.graduate.traits.some(t=>!TRAITS[t])||(item.graduate.career!=null&&(typeof item.graduate.career!=='object'||Array.isArray(item.graduate.career))))throw Error('다회차 선수 능력·성적 사본을 확인하세요.');
  playerFromGraduate(item.graduate);
 }
 if(cast.junior&&cast.rival&&cast.junior.id===cast.rival.id)throw Error('같은 선수를 후배와 라이벌로 동시에 고를 수 없습니다.');return copy(cast);
}
export function castPlayer(p,role){
 if(!['junior','rival'].includes(role))throw Error('선수 역할을 확인하세요.');if(p.schoolCast==null)return null;const cast=validateSchoolCast(p.schoolCast),item=cast[role];return item?playerFromGraduate(item.graduate):null;
}
// Junior joins after the first school year. Snapshot ability determines the shared skill,
// but the extra reward is bounded and does not consume or rewrite the prior-run player.
export function juniorTrainingPlan(p,practice){
 const junior=castPlayer(p,'junior');if(!junior||p.week<48||p.done||p.injury||p.banWeeks>0||!practice?.gain||practice.cost<=0||p.schoolCastTrainingWeek===p.week)return null;
 const eligible=keysOf(p).filter(k=>practice.gain[k]>0&&junior.abilities[k]>=50&&p[k]<99).sort((a,b)=>junior.abilities[b]-junior.abilities[a]||a.localeCompare(b));
 return eligible.length?{playerId:junior.id,name:junior.name,key:eligible[0],amount:1}:null;
}
export function applyJuniorTraining(p,practice){
 const plan=juniorTrainingPlan(p,practice);if(!plan)return null;
 p[plan.key]=Math.min(99,p[plan.key]+plan.amount);p.schoolCastTrainingWeek=p.week;return plan;
}
// Rival uses the stored complete ability profile, capped to the existing school range.
// It is an aggregate match opponent, not yet a named all-player lineup.
export function schoolRivalContext(p){
 const rival=castPlayer(p,'rival');if(!rival)return null;
 const values=Object.values(rival.abilities),strength=Math.max(38,Math.min(85,values.reduce((a,b)=>a+b,0)/values.length));
 return {id:rival.id,name:rival.name,pos:rival.pos,strength,abilities:copy(rival.abilities)};
}
