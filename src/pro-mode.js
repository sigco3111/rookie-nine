import {openSoundSettings} from './audio-settings-ui.js';
import { mountProGraduates } from './pro-graduates-ui.js';
import './pro-graduates-ui.css';
import { clubFixtureProgress } from './pro-fixture-progress.js';
import { mountProFixtures } from './pro-fixtures-ui.js';
// Policy-neutral prepared-club mode. The caller owns admission and season scheduling.
import { mountProRecords } from './pro-records-ui.js';
import './pro-records-ui.css';
import { mountProGameSetup } from './pro-game-setup.js';
import { mountProRoster } from './pro-roster-ui.js';
import './pro-roster-ui.css';
import { mountProSession } from './pro-session-ui.js';
import { mountProSaveNotice } from './pro-save-notice.js';
import { mountProBackups } from './pro-backups-ui.js';
import { playProDirect } from './pro-direct-ui.js';
import './pro-session-ui.css';import './pro-save-notice.css';import './pro-backups-ui.css';import './pro-direct-ui.css';
export function mountPreparedProMode(parent,storage,store,clubId,{onBack=()=>{},onResult=()=>{},fixture=null,fixtures=null,getGraduates=null}={}){
 const shell=document.createElement('div'),nav=document.createElement('nav'),content=document.createElement('div');shell.className='pro-mode';nav.className='pro-mode-nav';shell.append(nav,content);parent.append(shell);let active=null,direct=false,removed=false;
 const button=(text,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{if(!direct)fn();};nav.append(b);return b;};
 const gameButton=button('구단 경기',()=>showGame()),backupButton=button('프로 백업',()=>showBackups()),back=button('나가기',onBack);
 button('소리 설정',openSoundSettings);
 button('명단 편성',()=>showRoster());button('구단 기록',()=>showRecords());
 if(getGraduates)button('졸업 선수 입단',()=>showGraduates());
 const notice=mountProSaveNotice(store,{parent:shell,onRecovered:()=>showGame()});
 function clear(){active?.destroy();active=null;content.replaceChildren();}
 function showGame(){if(removed||direct)return;clear();const club=store.load().data?.clubs.find(c=>c.id===clubId);let resolved=fixtures;try{if(club?.schedule){if(fixtures!==null&&JSON.stringify(fixtures)!==JSON.stringify(club.schedule.fixtures))throw Error('저장된 경기 목록과 전달된 목록이 다릅니다.');resolved=club.schedule.fixtures;}if(club&&resolved!==null)clubFixtureProgress(club,resolved);}catch(e){const p=document.createElement('p');p.textContent=e.message;p.setAttribute('role','alert');content.append(p);return;}if(!club?.pending&&resolved!==null){active=mountProFixtures(content,store,clubId,resolved,{onStart:()=>showGame()});return;}if(!club?.pending){active=mountProGameSetup(content,store,clubId,{fixture,onStart:()=>showGame()});return;}active=mountProSession(content,store,clubId,{onBack,onResult,playDirect:async ctx=>{direct=true;for(const b of nav.children)b.disabled=true;try{return await playProDirect(ctx,{parent:shell});}finally{direct=false;for(const b of nav.children)b.disabled=false;}}});}
 function showGraduates(){if(removed||direct)return;clear();try{active=mountProGraduates(content,getGraduates(),store,{destinationClubId:clubId});}catch(e){const p=document.createElement('p');p.textContent=e.message;p.setAttribute('role','alert');content.append(p);}}
 function showRecords(){if(removed||direct)return;clear();active=mountProRecords(content,store,clubId);}
 function showRoster(){if(removed||direct)return;clear();active=mountProRoster(content,store,clubId);}
 function showBackups(){if(removed||direct)return;clear();active=mountProBackups(content,storage,store,{onRestore:()=>notice.refresh()});}
 showGame();return {element:shell,showGame,showBackups,showRoster,showRecords,destroy(){if(direct)throw Error('직접 플레이가 끝난 뒤 나가세요.');removed=true;clear();notice.destroy();shell.remove();}};
}
