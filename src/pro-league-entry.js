import {newClub} from './pro.js';
import {fillClubRoster} from './pro-teammates.js';
import {createClubLeague} from './pro-league.js';
import {leagueIdentity} from './pro-league-identities.js';
export function createLeagueClub(store,managedTeamId){
 const read=store.load(),status=store.status();if(!read.ok)throw Error(read.error);if(status.pending||status.conflict||read.data.clubs.length)throw Error('기존 구단과 저장 상태를 먼저 확인하세요.');
 if(!leagueIdentity(managedTeamId))throw Error('운영할 구단을 직접 선택하세요.');
 const club=fillClubRoster(newClub({id:'own-club',name:'선택 구단'}));Object.assign(club,createClubLeague(club,managedTeamId));
 read.data.clubs.push(club);read.data.selected=club.id;return {...store.save(read.data),clubId:club.id};
}
