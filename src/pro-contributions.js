// Display-only baseball rate stats from the saved ledger. No new evaluation score.
const count=n=>Number.isSafeInteger(n)&&n>=0;
export function battingAverage(row){return count(row.ab)&&count(row.hits)&&row.ab>0?(row.hits/row.ab).toFixed(3):null;}
export function earnedRunAverage(row){return count(row.outs)&&count(row.er)&&row.outs>0?(row.er*27/row.outs).toFixed(2):null;}
export function sortBattingRows(rows,key='roster'){
 if(!['roster','hits','rbi','hr'].includes(key))throw Error('선수 비교 항목을 확인하세요.');
 return rows.map((r,index)=>({...r,index})).sort((a,b)=>key==='roster'?a.index-b.index:(count(b.stats[key])?b.stats[key]:-1)-(count(a.stats[key])?a.stats[key]:-1)||a.index-b.index).map(({index,...r})=>r);
}
export function gameContributionRows(state){
 const team=state.teams[0];return [...team.batters,team.pitcher].map(p=>({id:p.id,name:p.name,pos:p.pos,source:p.source,stats:structuredClone(state.players[0][p.id])}));
}
