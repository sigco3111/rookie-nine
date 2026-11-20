// Deterministic ability-based starting suggestion, not an optimal tactics claim.
// Never modifies the club or its persisted lineup. Caller reviews and saves explicitly.
export function suggestClubLineup(club){
 if(club.pending)throw Error('진행 중인 경기를 마친 뒤 위임할 수 있습니다.');
 const rank=(pos,keys)=>club.roster.map((p,index)=>({p,index})).filter(({p})=>p.pos===pos).map(({p,index})=>{
  if(keys.some(k=>!Number.isFinite(p.abilities?.[k])))throw Error('선수 능력치를 확인하세요.');
  return {id:p.id,index,score:keys.reduce((n,k)=>n+p.abilities[k],0)};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 const bats=rank('bat',['meet','power','speed']),pitchers=rank('pit',['velo','ctrl','brk']);
 if(bats.length<9||!pitchers.length)throw Error('위임하려면 타자 9명과 투수 1명 이상이 필요합니다.');
 return {batters:bats.slice(0,9).map(p=>p.id),starter:pitchers[0].id};
}
