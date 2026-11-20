// City facts checked 2026-11-20 against KBO's official franchise list:
// https://www.koreabaseball.com/Kbo/League/TeamInfo.aspx
// These are fictional game clubs, not the real clubs or their brands.
export const PRO_REGIONS=Object.freeze(['서울','부산','대구','광주','인천','대전','수원','창원']);
export const DEFAULT_OPPONENT_REGIONS=Object.freeze(['서울','부산','광주']);
const legacy=Object.freeze({'새벽 구단':'서울','노을 구단':'부산','바람 구단':'광주'});
export const regionalClubName=name=>legacy[name]??name;
export const regionalClubLabel=name=>legacy[name]?`${legacy[name]} (이전: ${name})`:name;
