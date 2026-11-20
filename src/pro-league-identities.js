// Names explicitly selected by the user 2026-11-20. Original game identities,
// not licensed real-club assets. Stable IDs never depend on translated display names.
export const LEAGUE_IDENTITIES=Object.freeze([
 Object.freeze({id:'seoul',city:'서울',nickname:'곰돌이',name:'서울 곰돌이'}),
 Object.freeze({id:'busan',city:'부산',nickname:'갈매기',name:'부산 갈매기'}),
 Object.freeze({id:'gwangju',city:'광주',nickname:'호랑이',name:'광주 호랑이'}),
 Object.freeze({id:'daegu',city:'대구',nickname:'사자',name:'대구 사자'}),
 Object.freeze({id:'daejeon',city:'대전',nickname:'독수리',name:'대전 독수리'}),
 Object.freeze({id:'incheon',city:'인천',nickname:'불독',name:'인천 불독'}),
 Object.freeze({id:'suwon',city:'수원',nickname:'몬스터',name:'수원 몬스터'}),
 Object.freeze({id:'changwon',city:'창원',nickname:'디노',name:'창원 디노'})
]);
export function leagueIdentity(id){return LEAGUE_IDENTITIES.find(team=>team.id===id)||null;}
