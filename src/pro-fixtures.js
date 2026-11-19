import { createClubSession } from './pro-match.js';
import { prepareClubFixture } from './pro-game-setup.js';
// Caller owns the complete list. No fixed season length, opponent choice or new-season action.
export function clubFixtureProgress(club,fixtures){
 if(!Array.isArray(fixtures)||fixtures.some(f=>!f||typeof f.id!=='string'||!f.id||typeof f.name!=='string'||!f.name)||new Set(fixtures.map(f=>f.id)).size!==fixtures.length)throw Error('명시한 경기 목록을 확인하세요.');
 // Use the same engine validator, without modifying either supplied team or save.
 for(const f of fixtures)createClubSession({...f.opponent,id:f.id},{opponent:f.opponent,innings:f.innings,seed:f.seed});
 const ids=new Set(fixtures.map(f=>f.id)),history=club.history.filter(g=>ids.has(g.id));
 // A list may start after earlier games, but games in this list must form a prefix.
 for(let i=0;i<history.length;i++)if(history[i].id!==fixtures[i]?.id)throw Error('경기 목록과 완료 기록의 순서가 다릅니다.');
 for(const g of history)if(g.opponent!==fixtures.find(f=>f.id===g.id).name)throw Error('완료한 경기의 상대 이름이 바뀌었습니다.');
 const next=fixtures[history.length]||null;
 if(club.pending&&(!next||club.pending.id!==next.id||club.pending.opponent!==next.name))throw Error('진행 중인 경기와 다음 일정이 다릅니다.');
 if(club.pending?.session){const s=club.pending.session;if(s.innings!==next.innings||s.seed!==next.seed||JSON.stringify(s.teams[1])!==JSON.stringify(next.opponent))throw Error('진행 중인 경기 규칙·상대가 바뀌었습니다.');}
 return {completed:history.length,total:fixtures.length,done:history.length===fixtures.length,next:next?structuredClone(next):null,pending:!!club.pending};
}
export function prepareNextClubFixture(store,clubId,fixtures){const state=store.load();if(!state.ok)throw Error(state.error);const club=state.data.clubs.find(c=>c.id===clubId);if(!club)throw Error('구단을 확인하세요.');const progress=clubFixtureProgress(club,fixtures);if(progress.done)throw Error('명시된 경기 목록을 모두 마쳤습니다.');return prepareClubFixture(store,clubId,progress.next);}
