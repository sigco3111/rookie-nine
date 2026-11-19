import { clubFixtureProgress } from './pro-fixture-progress.js';
export { clubFixtureProgress } from './pro-fixture-progress.js';
import { prepareClubFixture } from './pro-game-setup.js';
export function prepareNextClubFixture(store,clubId,fixtures){const state=store.load();if(!state.ok)throw Error(state.error);const club=state.data.clubs.find(c=>c.id===clubId);if(!club)throw Error('구단을 확인하세요.');const progress=clubFixtureProgress(club,fixtures);if(progress.done)throw Error('명시된 경기 목록을 모두 마쳤습니다.');return prepareClubFixture(store,clubId,progress.next);}
