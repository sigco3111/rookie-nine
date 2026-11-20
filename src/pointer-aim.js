// One active drag per canvas. Cancelled/abandoned touches cannot keep aiming.
// Mouse hover aiming is retained. This does not pause a game or change saves.
export function bindPointerAim(canvas,{active,point,host=window,doc=document}){
 let pointer=null,disposed=false;
 const reset=()=>{pointer=null;};
 const down=e=>{if(!active()||doc.hidden||pointer!==null||e.button>0)return;pointer=e.pointerId;point(e);};
 const move=e=>{if(!active()||doc.hidden){reset();return;}if(pointer!==null?e.pointerId===pointer:e.pointerType==='mouse')point(e);};
 const end=e=>{if(e.pointerId===pointer)reset();};
 const hidden=()=>{if(doc.hidden)reset();};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);
 host.addEventListener('pointerup',end);host.addEventListener('pointercancel',end);canvas.addEventListener('lostpointercapture',end);host.addEventListener('blur',reset);doc.addEventListener('visibilitychange',hidden);
 const dispose=()=>{if(disposed)return;disposed=true;reset();canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);host.removeEventListener('pointerup',end);host.removeEventListener('pointercancel',end);canvas.removeEventListener('lostpointercapture',end);host.removeEventListener('blur',reset);doc.removeEventListener('visibilitychange',hidden);};
 return {reset,dispose};
}
