// Policy-neutral prepared-club mode. The caller owns admission and season scheduling.
import { mountProSession } from './pro-session-ui.js';
import { mountProSaveNotice } from './pro-save-notice.js';
import { mountProBackups } from './pro-backups-ui.js';
import { playProDirect } from './pro-direct-ui.js';
import './pro-session-ui.css';import './pro-save-notice.css';import './pro-backups-ui.css';import './pro-direct-ui.css';
export function mountPreparedProMode(parent,storage,store,clubId,{onBack=()=>{},onResult=()=>{}}={}){
 const shell=document.createElement('div'),nav=document.createElement('nav'),content=document.createElement('div');shell.className='pro-mode';nav.className='pro-mode-nav';shell.append(nav,content);parent.append(shell);let active=null,direct=false,removed=false;
 const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{if(!direct)fn();};nav.append(b);return b;};
 const gameButton=button('구단 경기',()=>showGame()),backupButton=button('프로 백업',()=>showBackups()),back=button('나가기',onBack);
 const notice=mountProSaveNotice(store,{parent:shell,onRecovered:()=>showGame()});
 function clear(){active?.destroy();active=null;content.replaceChildren();}
 function showGame(){if(removed||direct)return;clear();active=mountProSession(content,store,clubId,{onBack,onResult,playDirect:async ctx=>{direct=true;for(const b of nav.children)b.disabled=true;try{return await playProDirect(ctx,{parent:shell});}finally{direct=false;for(const b of nav.children)b.disabled=false;}}});}
 function showBackups(){if(removed||direct)return;clear();active=mountProBackups(content,storage,store,{onRestore:()=>notice.refresh()});}
 showGame();return {element:shell,showGame,showBackups,destroy(){if(direct)throw Error('직접 플레이가 끝난 뒤 나가세요.');removed=true;clear();notice.destroy();shell.remove();}};
}
