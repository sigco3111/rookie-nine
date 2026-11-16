globalThis.localStorage = { s: {}, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = v; }, removeItem(k) { delete this.s[k]; } };
const G = await import('./src/growth.js'); const D = await import('./src/data.js');
const ids = D.PRACTICES.map(p => p.id); const pitIds = D.practicesFor({pos:'pit'}).map(p => p.id);
const res = [];
for (const strat of ['smart', 'random']) for (let n = 0; n < 200; n++) {
  const pit = n % 2 === 1; const p = G.newPlayer('t', pit ? ['power','contact','runner','allround'][n % 4] : ['contact', 'slugger', 'runner', 'allround'][n % 4], pit ? 'pit' : 'bat'); const myIds = pit ? pitIds : ids;
  while (!p.done) {
    let id;
    if (strat === 'random') id = myIds[Math.floor(Math.random() * myIds.length)];
    else id = p.injury ? 'x' : p.cond < 35 ? (Math.random() < .5 ? 'refresh' : 'rest') : p.study < 35 ? 'study' : (pit ? ['velo','ctrl','brk','ctrl','velo','cond','basic','mental'] : ['bat', 'power', 'bat', 'defense', 'run', 'cond', 'basic', 'mental'])[Math.floor(Math.random() * 8)];
    G.doCommand(p, id); const m = G.matchOfWeek(p); if (m && !p.injury) G.simulateMatch(p, m); G.endWeek(p);
  }
  res.push([strat, p.result.rank, G.ovr(p), p.wins, p.losses, p.traits.length]);
}
for (const s of ['smart', 'random']) { const r = res.filter(x => x[0] === s); const avg = i => (r.reduce((a, x) => a + x[i], 0) / r.length).toFixed(1); console.log(s, 'ovr', avg(2), 'wins', avg(3), 'losses', avg(4), 'traits', avg(5), 'drafted', r.filter(x => x[1] > 0).length, 'top5', r.filter(x => x[1] > 0 && x[1] <= 5).length); }
