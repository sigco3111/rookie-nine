import assert from 'node:assert/strict';
// Reuse only after an actual144week UI career has reached its ending.
// No record injection or synthetic graduate; every pro game follows normal menus.
export async function runCareerLeagueBridge(page,{pos}){
 const before=await page.evaluate(()=>({school:localStorage.getItem('rookie9.save.v1'),hof:localStorage.getItem('rookie9.hof.v1')}));
 const school=JSON.parse(before.school),graduate=JSON.parse(before.hof)[0];assert.equal(school.week,144);assert.equal(school.done,true);
 const click=async text=>page.evaluate(t=>{const b=[...document.querySelectorAll('button')].find(e=>e.textContent===t&&!e.closest('[hidden]'));if(!b)throw Error('bridge missing '+t);b.click();},text);
 const read=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('rookie9.pro.v1')).clubs[0]);
 const unchanged=async()=>assert.deepEqual(await page.evaluate(()=>({school:localStorage.getItem('rookie9.save.v1'),hof:localStorage.getItem('rookie9.hof.v1')})),before);
 await page.click('#ending-pro');await page.click('[data-team=busan]');await click('선택 구단 참가 내용 확인');await click('이 구단으로 리그 참가 확정');await click('졸업 선수 입단');await click('입단 내용 확인');await click('이 구단으로 입단 확정');
 let club=await read();const player=club.roster.find(p=>p.source==='graduate');assert.deepEqual(Object.values(player.abilities),graduate.stats);assert.equal(player.pro.games,0);
 await click('명단 편성');await page.select(pos==='pit'?'select[aria-label="선발 투수"]':'select[aria-label="1번 타자"]',player.id);await click('편성 저장');await click('구단 경기');
 const games=[];
 for(let i=0;i<14;i++){
  await click('다음 경기 준비');await click('남은 경기 자동 진행');await click('결과 확인·기록 반영');club=await read();assert.equal(club.record.games,i+1);assert.equal(club.league.results.length,(i+1)*4);assert.equal(club.roster.find(p=>p.id===player.id).pro.games,i+1);await unchanged();games.push({game:i+1,wins:club.record.wins,losses:club.record.losses});
  if(i===6){await page.reload();await page.waitForSelector('#pro');await page.click('#pro');await click('부산 갈매기 들어가기');assert.equal((await read()).record.games,7);}else await click('구단 경기');
 }
 if(!await page.$('.pro-league-recap'))await click('구단 경기');assert.equal(await page.$eval('.pro-league-recap',e=>e.textContent.includes('56경기 완료')),true);
 const old=await read();await click('다음 리그 시즌 내용 확인');await click('다음 리그 시즌 시작 확정');club=await read();assert.equal(club.season,2);assert.equal(club.league.results.length,0);assert.equal(club.leagueHistory[0].league.results.length,56);assert.deepEqual(club.history,old.history);assert.deepEqual(club.roster,old.roster);
 await click('구단 기록');await page.select('select[aria-label="기록 시즌"]','1');assert.equal(await page.$eval('.pro-league-table',e=>e.textContent.includes('실제 반영 56 / 56경기')),true);await page.$eval('.pro-league-recap',e=>e.scrollIntoView({block:'start'}));await page.screenshot({path:`/downloads/rookie9_full_career_league_${pos}.png`});await unchanged();
 await page.reload();await page.waitForSelector('#cont');await page.click('#cont');await page.waitForSelector('#again');await unchanged();assert.equal(await page.evaluate(()=>window.__game.G.hof().length),1);
 return {mode:'144week actual UI career→samegraduate admission/lineup→14normalauto leaguegames56scores→midreload→season2→archivedrecap→ending',pos,graduateId:player.id,schoolWeeks:school.week,leagueGames:games,leagueResults:56,proGames:club.roster.find(p=>p.id===player.id).pro.games,sourceExact:true,abilityCopyExact:true,season:club.season};
}
