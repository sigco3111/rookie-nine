import { clubFixtureProgress } from './pro-fixture-progress.js';
// Stored, caller-authored schedule. Admission/default season generation is separate.
export function validateClubSchedule(club){
 const s=club.schedule;if(!s||s.schema!==1||typeof s.id!=='string'||!s.id||!Number.isInteger(s.season)||s.season!==club.season||!Number.isSafeInteger(s.startGame)||s.startGame<0||s.startGame>club.record.games||!Array.isArray(s.fixtures))throw Error('저장된 경기 목록을 확인하세요.');
 const progress=clubFixtureProgress(club,s.fixtures);if(club.record.games-s.startGame!==progress.completed)throw Error('경기 목록과 누적 경기 수가 다릅니다.');return progress;
}
export function attachClubSchedule(store,clubId,{id,fixtures}){
 const state=store.load(),status=store.status();if(!state.ok)throw Error(state.error);if(status.pending||status.conflict)throw Error('현재 기록 저장을 먼저 마치세요.');const club=state.data.clubs.find(c=>c.id===clubId);if(!club)throw Error('구단을 확인하세요.');if(club.pending)throw Error('진행 중인 경기를 먼저 마치세요.');if(club.schedule)throw Error('이미 저장된 경기 목록이 있습니다. 덮어쓰지 않았습니다.');if(!Array.isArray(fixtures)||fixtures.some(f=>club.applied.includes(f.id)))throw Error('이미 반영한 경기가 목록에 있습니다.');
 club.schedule={schema:1,id,season:club.season,startGame:club.record.games,fixtures:structuredClone(fixtures)};validateClubSchedule(club);return store.save(state.data);
}

// Archived schedules are complete immutable prefixes. Validate them against their own end,
// not today's total, while retaining every original fixture/rule snapshot.
export function validateScheduleHistory(club){
 const history=club.scheduleHistory??[];if(!Array.isArray(history))throw Error('이전 시즌 일정을 확인하세요.');
 let end=null,season=null;const ids=new Set();
 for(const schedule of history){
  if(!schedule||!Array.isArray(schedule.fixtures)||!schedule.fixtures.length||schedule.season>=club.season||(season!==null&&schedule.season!==season+1)||(end!==null&&schedule.startGame!==end))throw Error('이전 시즌 순서가 다릅니다.');
  end=schedule.startGame+schedule.fixtures.length;if(end>club.record.games)throw Error('이전 시즌 경기 수가 다릅니다.');
  const snapshot={...club,season:schedule.season,schedule,pending:null,history:club.history.slice(0,end),record:{...club.record,games:end}};
  if(!validateClubSchedule(snapshot).done)throw Error('이전 시즌 일정이 끝나지 않았습니다.');
  for(const f of schedule.fixtures){if(ids.has(f.id))throw Error('시즌 경기 식별자가 겹칩니다.');ids.add(f.id);}
  for(const g of club.history.slice(schedule.startGame,end))if(g.season!==schedule.season)throw Error('이전 시즌 경기 기록이 다릅니다.');season=schedule.season;
 }
 if(history.length&&(!club.schedule||club.schedule.startGame!==end||club.schedule.season!==season+1))throw Error('현재 시즌 연결이 다릅니다.');
 if(club.schedule){for(const f of club.schedule.fixtures){if(ids.has(f.id))throw Error('시즌 경기 식별자가 겹칩니다.');ids.add(f.id);}for(const g of club.history.slice(club.schedule.startGame))if(g.season!==club.season)throw Error('현재 시즌 경기 기록이 다릅니다.');}
 return true;
}
