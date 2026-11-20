import {mountLeagueEntry} from './pro-league-ui.js';
import { mountPreparedProMode } from './pro-mode.js';
import { mountProSaveNotice } from './pro-save-notice.js';
export function mountProHub(parent,storage,store,{onBack=()=>{},getGraduates=()=>[]}={}){
 const el=document.createElement('div');el.className='pro-mode';parent.append(el);let mode=null,entry=null,removed=false,message='';
 let notice=mountProSaveNotice(store,{parent:el,onRecovered:()=>draw()});const content=document.createElement('section');content.className='pro-session';el.append(content);
 const add=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;content.append(e);return e;};
 function open(id){entry?.destroy();entry=null;mode?.destroy();content.hidden=true;el.className='';notice.destroy();mode=mountPreparedProMode(el,storage,store,id,{getGraduates,onBack:()=>{mode.destroy();mode=null;content.hidden=false;el.className='pro-mode';notice=mountProSaveNotice(store,{parent:el,onRecovered:()=>draw()});draw();}});}
 function draw(){if(removed||mode)return;entry?.destroy();entry=null;content.replaceChildren();add('h2','프로 구단');add('p','여러 육성 회차의 졸업 선수를 한 내 구단에 모아 출전시킬 수 있습니다. 고교 지명 이력은 그대로 남깁니다.');if(message)add('p',message).setAttribute('role','status');
  const b=add('button','제목 화면으로');b.onclick=onBack;const state=store.load();if(!state.ok){add('p',state.error).setAttribute('role','alert');return;}const status=store.status();
  if(!state.data.clubs.length){entry=mountLeagueEntry(content,store,{onDone:r=>open(r.clubId)});return;}
  for(const club of state.data.clubs){add('h3',club.name);add('p',`${club.record.wins}승 ${club.record.losses}패 · ${club.record.games}경기 누적`);const b=add('button',club.name+' 들어가기');b.onclick=()=>open(club.id);
   if(!club.schedule&&!club.pending)entry=mountLeagueEntry(content,store,{clubId:club.id,onDone:()=>open(club.id)});}
 }
 const unsub=store.subscribe(draw);draw();return {element:el,destroy(){removed=true;entry?.destroy();mode?.destroy();unsub();notice.destroy();el.remove();}};
}
