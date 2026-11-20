// Original geometric game marks. No third-party club artwork or city emblems.
import {leagueIdentity} from './pro-league-identities.js';
const styles={
 seoul:{shirt:'#20354d',cap:'#be9353',accent:'#e8c487',symbol:'bear'},
 busan:{shirt:'#ede6ce',cap:'#087e82',accent:'#24b9b7',symbol:'gull'},
 gwangju:{shirt:'#633475',cap:'#d2a950',accent:'#f1c963',symbol:'tiger'},
 daegu:{shirt:'#2463b0',cap:'#132b51',accent:'#e4f1ff',symbol:'lion'},
 daejeon:{shirt:'#ea7c29',cap:'#29333e',accent:'#ffd8a1',symbol:'eagle'},
 incheon:{shirt:'#a83f4d',cap:'#4b2639',accent:'#f4d4ad',symbol:'bulldog'},
 suwon:{shirt:'#40bca1',cap:'#123749',accent:'#d1ff80',symbol:'monster'},
 changwon:{shirt:'#7952c2',cap:'#32295a',accent:'#ccf36b',symbol:'dino'}
};
const paths={
 bear:'<circle cx="31" cy="30" r="14"/><circle cx="69" cy="30" r="14"/><path d="M22 44Q20 22 50 22T78 44V65Q73 84 50 85T22 65Z"/><ellipse cx="50" cy="64" rx="18" ry="13" fill="var(--ink)"/><circle cx="37" cy="48" r="4" fill="var(--ink)"/><circle cx="63" cy="48" r="4" fill="var(--ink)"/><path d="m44 60 6 7 6-7Z"/>',
 gull:'<path d="M9 38Q27 13 50 41Q73 13 91 38L73 37 56 52 50 65 44 52 27 37Z"/><path d="M17 75Q33 65 50 75T83 75" fill="none" stroke="currentColor" stroke-width="6"/>',
 tiger:'<path d="m23 35-3-18 23 10h14l23-10-3 18 9 20-15 22-21 12-21-12-15-22Z"/><path d="m24 46 16 5m20 0 16-5M50 29v15M21 59l17 5m24 0 17-5" fill="none" stroke="var(--ink)" stroke-width="6"/><path d="m43 69 7 8 7-8Z" fill="var(--ink)"/>',
 lion:'<path d="m50 10 12 10 15 1 2 15 12 14-10 14-4 16-16 1-11 10-11-10-16-1-4-16L9 50l12-14 2-15 15-1Z"/><path d="M29 39Q50 22 71 39L68 65 50 79 32 65Z" fill="var(--ink)"/><path d="m34 45 9 3m14 0 9-3M44 62h12l-6 7Z" stroke="currentColor" stroke-width="5" fill="currentColor"/>',
 eagle:'<path d="M7 23 38 41 51 15 64 41 93 23 80 57 61 62 50 88 39 62 20 57Z"/><path d="m48 39 19 7-16 9 2-9Z" fill="var(--ink)"/><path d="m16 35 21 15M84 35 65 50" stroke="var(--ink)" stroke-width="5"/>',
 bulldog:'<path d="m21 27 22 8h14l22-8 6 31-16 22H31L15 58Z"/><path d="M30 49h12m16 0h12" stroke="var(--ink)" stroke-width="6"/><path d="M27 64q23-23 46 0L65 78H35Z" fill="var(--ink)"/><path d="m44 59 6 7 6-7M35 68v8m30-8v8" stroke="currentColor" stroke-width="5"/>',
 monster:'<path d="M25 38 17 12 40 28h20l23-16-8 26q15 38-8 45H33Q10 76 25 38Z"/><ellipse cx="50" cy="50" rx="20" ry="15" fill="var(--ink)"/><circle cx="50" cy="50" r="8"/><path d="M37 73h26" stroke="var(--ink)" stroke-width="7"/>',
 dino:'<path d="M20 82V48L34 19h34l17 23v20H63L48 50v32Z"/><path d="m30 20 9-12 9 12m4 0L61 8l8 13"/><circle cx="61" cy="35" r="5" fill="var(--ink)"/><path d="M58 51h24M68 52v8m10-8v8" stroke="var(--ink)" stroke-width="4"/>'
};
export function clubStyle(id){const value=styles[id];return value?{...value}:null;}
export function clubMarkSvg(id){const team=leagueIdentity(id),style=clubStyle(id);if(!team||!style)return '';
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 108" role="img" aria-label="${team.name} 자체 배지" style="--ink:${style.shirt};color:${style.accent}"><path d="m50 3 44 18-5 51-39 32L11 72 6 21Z" fill="${style.shirt}" stroke="${style.accent}" stroke-width="4"/><g fill="currentColor">${paths[style.symbol]}</g></svg>`;
}
export function appendClubMark(parent,id){if(!leagueIdentity(id))return;const mark=document.createElement('span');mark.className='pro-club-mark';mark.innerHTML=clubMarkSvg(id);parent.prepend(mark);return mark;}
