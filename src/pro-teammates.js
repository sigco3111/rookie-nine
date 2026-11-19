// Fictional replacement players fill empty slots, independent of the eventual admission policy.
import { setLineup, playerFromGraduate } from './pro.js';
const copy=v=>structuredClone(v);
export function fillClubRoster(input){
 if(input.pending)throw Error('경기 중에는 명단을 채울 수 없습니다.');let club=copy(input);
 function teammate(pos,number){
  const id='generated:'+encodeURIComponent(club.id)+':'+pos+':'+number;
  if(club.roster.some(p=>p.id===id))throw Error('기본 선수 식별자가 겹칩니다.');
  const stats=pos==='pit'?[48,52,46,43,50,57]:[48,45,48,47,49,53];
  const p=playerFromGraduate({id,name:pos==='pit'?'기본 투수':'기본 타자 '+number,pos,stats,traits:[],career:{}});p.source='generated';p.draft={rank:null,team:null};return p;
 }
 const batterIds=club.roster.filter(p=>p.pos==='bat').map(p=>p.id);
 const lineup=Array(9).fill(null).map((_,i)=>club.lineup[i]||null);const used=new Set(lineup.filter(Boolean));
 if(used.size!==lineup.filter(Boolean).length)throw Error('중복 편성을 확인하세요.');
 for(let slot=0;slot<9;slot++)if(!lineup[slot]){
  let next=batterIds.find(id=>!used.has(id));
  if(!next){let n=1;while(club.roster.some(p=>p.id==='generated:'+encodeURIComponent(club.id)+':bat:'+n))n++;const p=teammate('bat',n);club.roster.push(p);batterIds.push(p.id);next=p.id;}
  lineup[slot]=next;used.add(next);
 }
 let starter=club.starter||club.roster.find(p=>p.pos==='pit')?.id;
 if(!starter){const p=teammate('pit',1);club.roster.push(p);starter=p.id;}
 return setLineup(club,{batters:lineup,starter});
}
