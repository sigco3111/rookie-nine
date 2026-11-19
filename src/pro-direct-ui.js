import { playProBatting } from './pro-batting.js';
import { showHome } from './match.js';
import { playProPitching } from './pro-pitching.js';
// Caller keeps the pending-game screen alive. This overlay owns only the current appearance HUD.
export async function playProDirect(context,{parent=document.body,onExit=()=>{}}={}){
 const el=document.createElement('section');el.className='pro-direct';el.setAttribute('aria-label','프로 직접 플레이');
 const header=document.createElement('div');header.className='pro-direct-header';const title=document.createElement('strong'),score=document.createElement('span'),count=document.createElement('div'),pitch=document.createElement('div'),banner=document.createElement('div'),hint=document.createElement('p'),controls=document.createElement('div');
 banner.className='pro-direct-banner';controls.className='pro-direct-controls';hint.className='pro-direct-hint';header.append(title,score,count,pitch);el.append(header,banner,hint,controls);parent.append(el);
 let swing=null,picker=null;const flashTimers=new Set();
 const hud={
  setTitle:t=>title.textContent=t,setScore:(i,a,b)=>score.textContent=`${i}회 ${a} : ${b}`,setCount:(c,o)=>count.textContent=`B ${c.b} · S ${c.s}${o==null?'':` · O ${o}`}`,setPitch:t=>pitch.textContent=t,
  banner(t,ms=1000){banner.textContent=t;const timer=setTimeout(()=>{banner.textContent='';flashTimers.delete(timer);},ms);flashTimers.add(timer);},
  small:t=>pitch.textContent=t,flash(){el.classList.add('pro-contact');const t=setTimeout(()=>{el.classList.remove('pro-contact');flashTimers.delete(t);},180);flashTimers.add(t);},
  onSwing:f=>swing=f,offSwing:()=>swing=null,
  setBattingContext:c=>{if(c)hint.textContent=c.runner?'주자 있음 · 노란 링을 공에 맞추고 SWING':'노란 링을 공에 맞추고 SWING';},
  setTiming(progress,target,ready){if(context.mode!=='bat')return;const b=controls.querySelector('.swing');if(b)b.textContent=progress!=null&&Math.abs(progress-target)<=ready?'지금!':'SWING';},
  setBattingActive(active){const b=controls.querySelector('.swing');if(b){b.disabled=!active;b.style.visibility=active?'visible':'hidden';}hint.hidden=!active;},
  setBases:mask=>{hint.dataset.bases=mask;},
  pitchPicker(types,onSelect,onThrow){
   controls.replaceChildren();picker=document.createElement('div');picker.className='pro-pitch-picker';
   const choices=document.createElement('div');for(const [i,type]of types.entries()){const b=document.createElement('button');b.type='button';b.textContent=type.n;b.dataset.selected=String(i===0);b.onclick=()=>{onSelect(type.id);for(const sibling of choices.children)sibling.dataset.selected=String(sibling===b);};choices.append(b);}
   const b=document.createElement('button');b.type='button';b.id='pro-throw';b.textContent='던지기';b.onpointerdown=e=>{e.preventDefault();onThrow();};picker.append(choices,b);controls.append(picker);
  },
  setPitchingActive(active,flight=false){if(!picker)return;picker.hidden=flight;for(const b of picker.querySelectorAll('button'))b.disabled=!active;hint.hidden=!active;},
  removePicker(){picker?.remove();picker=null;}
 };
 if(context.mode==='bat'){const b=document.createElement('button');b.type='button';b.className='swing';b.textContent='SWING';b.onpointerdown=e=>{e.preventDefault();swing?.();};controls.append(b);hint.textContent='노란 링을 공에 맞추고 원이 겹칠 때 SWING';}
 else hint.textContent='구종 선택 · 화면을 드래그해 조준 · 던지기';
 // Parent's action buttons must not receive taps while the renderer owns input.
 const previous=parent.dataset.proDirect;parent.dataset.proDirect='active';
 try{return context.mode==='bat'?await playProBatting(context,hud):await playProPitching(context,hud);}
 finally{for(const t of flashTimers)clearTimeout(t);el.remove();if(previous===undefined)delete parent.dataset.proDirect;else parent.dataset.proDirect=previous;const player=context.mode==='bat'?context.batter:context.pitcher;showHome(player.pos,{...structuredClone(player.abilities),pos:player.pos,traits:player.traits,gear:player.gear,will:50});onExit();}
}
