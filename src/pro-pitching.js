import {leagueIdentity} from './pro-league-identities.js';
// Single opponent appearance. No whole-game or school-growth side effects.
import { playPitching } from './pitching.js';
export async function playProPitching(context,hud){
 if(context.mode!=='pit'||context.batter?.pos!=='bat'||context.pitcher?.pos!=='pit')throw Error('투구 출전 정보를 확인하세요.');
 const p=context.pitcher,b=context.batter.abilities;
 const player={name:p.name,pos:'pit',...structuredClone(p.abilities),traits:structuredClone(p.traits),gear:structuredClone(p.gear),week:0,will:50,ev:{coach:99,captain:99,team:50},cnt:{}};
 const result=await playPitching(player,{name:'프로 투구',kind:'pro'},hud,{ownTeamId:context.ownTeamId,opponentTeamId:context.opponentTeamId,inning:context.inning,outs:context.outs,bases:context.bases,scores:context.scores,strength:(b.meet+b.power)/2,opponent:leagueIdentity(context.opponentTeamId)?.name||context.batter.name});
 if(result.kind==='hit'){return result.infield?'infield':result.t;}
 if(result.kind==='force')return result.safe?'forceSafe':'forceOut';
 if(['walk','k','out'].includes(result.kind))return result.kind;
 throw Error('투구 타석 결과를 확인할 수 없습니다.');
}
