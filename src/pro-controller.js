// Mode-neutral orchestration. UI/render adapters receive copies, never the school save.
import { validateClubSession, createClubSession, stepClubAppearance, runClubAuto, clubSessionResult } from './pro-match.js';
const copy=v=>structuredClone(v);
export function createProController(store,clubId){
 function read(){const state=store.load();if(!state.ok)throw Error(state.error);const club=state.data.clubs.find(c=>c.id===clubId);if(!club?.pending)throw Error('대기 중인 구단 경기가 없습니다.');return {root:state.data,club};}
 function saveSession(root,club,session){club.pending.session=session;const saved=store.save(root);return {saved:saved.ok,session:copy(session)};}
 function session(){const {club}=read();if(!club.pending.session)throw Error('경기 준비를 먼저 마치세요.');return validateClubSession(club.pending.session);}
 let busy=false;
 return {
  prepare(options){const {root,club}=read();if(club.pending.session)return {saved:!store.status().pending,session:session()};return saveSession(root,club,createClubSession(club.pending,options));},
  current:session,
  auto(maxAppearances=1){if(busy)throw Error('직접 플레이 결과를 기다리고 있습니다.');const {root,club}=read();return saveSession(root,club,runClubAuto(session(),{maxAppearances}));},
  async direct(adapter){
   if(busy)throw Error('직접 플레이 결과를 기다리고 있습니다.');if(typeof adapter!=='function')throw Error('직접 플레이 입력이 필요합니다.');
   // Do not start an external renderer while the checkpoint exists only in memory or is conflicted.
   if(store.status().pending)throw Error('현재 경기 저장을 마친 뒤 직접 플레이하세요.');
   const {root,club}=read(),before=session();if(before.done)throw Error('종료된 경기입니다.');
   const batter=before.teams[before.side].batters[before.order[before.side]%9],pitcher=before.teams[1-before.side].pitcher;
   const token=JSON.stringify(before),revision=root.revision;busy=true;
   try{
    const kind=await adapter({mode:before.side===0?'bat':'pit',batter:copy(batter),pitcher:copy(pitcher),inning:before.inning,outs:before.outs,bases:before.bases,scores:copy(before.scores)});
    if(kind===undefined)throw Error('직접 플레이 결과가 없습니다.');
    const latest=read();if(latest.root.revision!==revision||JSON.stringify(latest.club.pending.session)!==token)throw Error('경기 기록이 다른 곳에서 변경되었습니다. 다시 불러오세요.');
    return saveSession(latest.root,latest.club,stepClubAppearance(before,kind));
   }finally{busy=false;}
  },
  finish(){if(busy)throw Error('직접 플레이 결과를 기다리고 있습니다.');return store.result(clubId,clubSessionResult(session()));},
  status(){return {...store.status(),busy};}
 };
}
