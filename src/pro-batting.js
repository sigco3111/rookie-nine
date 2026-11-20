import {leagueIdentity} from './pro-league-identities.js';
// Shared 3D single-appearance adapter. No school player or growth result is involved.
import { playMatch } from './match.js';
export async function playProBatting(context,hud){
 if(context.mode!=='bat'||context.batter?.pos!=='bat'||context.pitcher?.pos!=='pit')throw Error('타격 출전 정보를 확인하세요.');
 const b=context.batter,p=context.pitcher.abilities;
 const player={name:b.name,pos:'bat',...structuredClone(b.abilities),traits:structuredClone(b.traits),gear:structuredClone(b.gear),week:0,will:50,ev:{coach:99,captain:99,team:50},cnt:{}};
 const result=await playMatch(player,{name:'프로 타석',kind:'pro'},hud,{ownTeamId:context.ownTeamId,opponentTeamId:context.opponentTeamId,inning:context.inning,bases:context.bases,scores:context.scores,strength:(p.velo+p.ctrl+p.brk)/3,opponent:leagueIdentity(context.opponentTeamId)?.name||context.pitcher.name});
 const kind={single:1,double:2,hr:4,walk:'walk',k:'k',out:'out',infield:'infield',forceSafe:'forceSafe',forceOut:'forceOut'}[result.res];
 if(kind===undefined)throw Error('타석 결과를 확인할 수 없습니다.');return kind;
}
