// 시스템 구조만 참고한 독자 구현 데이터
export const STAT_KEYS = ['meet', 'power', 'speed', 'arm', 'field', 'stamina'];
export const PIT_KEYS = ['velo', 'ctrl', 'brk', 'speed', 'field', 'stamina'];
export const keysOf = (p) => (p.pos === 'pit' ? PIT_KEYS : STAT_KEYS);
export const STAT_NAME = { meet: '미트', power: '파워', speed: '주력', arm: '송구', field: '수비', stamina: '체력', velo: '구속', ctrl: '제구', brk: '변화구' };
export const grade = (v) => v >= 90 ? 'S' : v >= 80 ? 'A' : v >= 70 ? 'B' : v >= 60 ? 'C' : v >= 50 ? 'D' : v >= 40 ? 'E' : v >= 25 ? 'F' : 'G';
export const GRADE_COLOR = { S: '#ff5a5f', A: '#ff8a3d', B: '#f4c20d', C: '#7bd23f', D: '#36c2a3', E: '#3aa0e8', F: '#8a94a6', G: '#6b7280' };

// 연습 10종. gain: 주 능력치 증가량 기준, cost: 컨디션 소모, risk: 부상 위험
export const PRACTICES = [
  { id: 'chore', name: '잡무', icon: '', desc: '평가와 용돈. 능력치 소폭', cost: 6, risk: 0.01, gain: { stamina: 1 }, eval: { coach: 3, team: 2 }, money: 8 },
  { id: 'basic', name: '기초훈련', icon: '', desc: '전 능력 골고루. 안전', cost: 10, risk: 0.015, gain: { meet: 1, power: 1, speed: 1, arm: 1, field: 1, stamina: 1 }, eval: { coach: 2 } },
  { id: 'power', pos: 'bat', name: '파워훈련', icon: '', desc: '파워 중심', cost: 16, risk: 0.04, gain: { power: 4, stamina: 1 }, eval: { captain: 1 } },
  { id: 'bat', pos: 'bat', name: '배팅연습', icon: '', desc: '미트 중심', cost: 14, risk: 0.03, gain: { meet: 4, power: 1 }, eval: { coach: 2 } },
  { id: 'velo', pos: 'pit', name: '구속업', icon: '', desc: '직구 구속', cost: 16, risk: 0.045, gain: { velo: 4, stamina: 1 }, eval: { captain: 1 } },
  { id: 'ctrl', pos: 'pit', name: '제구연습', icon: '', desc: '컨트롤', cost: 13, risk: 0.025, gain: { ctrl: 4 }, eval: { coach: 2 } },
  { id: 'brk', pos: 'pit', name: '변화구연습', icon: '', desc: '변화구 위력', cost: 14, risk: 0.035, gain: { brk: 4, ctrl: 1 }, eval: { coach: 2 } },
  { id: 'defense', name: '수비연습', icon: '', desc: '수비·송구', cost: 14, risk: 0.03, gain: { field: 4, arm: 1 }, eval: { coach: 2, team: 1 } },
  { id: 'run', name: '주루연습', icon: '', desc: '주력', cost: 14, risk: 0.04, gain: { speed: 4, stamina: 1 }, eval: { captain: 1 } },
  { id: 'arm', pos: 'bat', name: '송구연습', icon: '', desc: '송구', cost: 14, risk: 0.04, gain: { arm: 4 }, eval: { team: 1 } },
  { id: 'cond', name: '체력훈련', icon: '', desc: '체력과 터프도', cost: 18, risk: 0.03, gain: { stamina: 4 }, tough: 2, eval: { captain: 2 } },
  { id: 'mental', name: '멘탈훈련', icon: '', desc: '의지와 특능 습득', cost: 8, risk: 0.005, gain: { meet: 1 }, will: 6, eval: { scout: 1 } },
  { id: 'refresh', name: '리프레쉬', icon: '', desc: '컨디션 회복', cost: -28, risk: 0, gain: {}, cureBad: true },
];
export const practicesFor = (p) => PRACTICES.filter((x) => !x.pos || x.pos === (p.pos || 'bat'));
export const OTHER_CMDS = [
  { id: 'rest', name: '휴식', icon: '', desc: '컨디션 크게 회복' },
  { id: 'alba', name: '알바', icon: '', desc: '돈 +, 컨디션 -' },
  { id: 'study', name: '공부', icon: '', desc: '학업 +. 시험 대비' },
  { id: 'shop', name: '쇼핑', icon: '', desc: '장비·음료 구입' },
];

export const TRAITS = {
  avg: { name: '애버리지히터', good: true, desc: '컨택 판정 넓음', test: (p) => p.meet >= 65 && p.cnt.bat >= 6 },
  pwr: { name: '파워히터', good: true, desc: '장타 거리 증가', test: (p) => p.power >= 65 && p.cnt.power >= 6 },
  run: { name: '도루', good: true, desc: '주력 보정, 내야안타', test: (p) => p.speed >= 65 && p.cnt.run >= 6 },
  gun: { name: '송구', good: true, desc: '수비 평가 보너스', test: (p) => p.arm >= 65 && p.cnt.arm >= 5 },
  glove: { name: '포구', good: true, desc: '수비 평가 보너스', test: (p) => p.field >= 65 && p.cnt.defense >= 6 },
  clutch: { name: '찬스', good: true, desc: '득점권 컨택 상승', test: (p) => p.will >= 60 && p.cnt.mental >= 5 },
  grit: { name: '역경', good: true, desc: '2스트라이크 후 컨택 유지', test: (p) => p.will >= 75 && p.cnt.mental >= 9 },
  walk: { name: '선구안', good: true, desc: '볼 구분이 쉬움(스트라이크존 확대 표시)', test: (p) => p.meet >= 55 && p.will >= 50 && p.cnt.mental >= 3 },
  fast: { name: '전력투구', good: true, desc: '직구 위력 상승', test: (p) => p.velo >= 65 && p.cnt.velo >= 6 },
  cmd: { name: '안정', good: true, desc: '제구 흔들림 감소', test: (p) => p.ctrl >= 65 && p.cnt.ctrl >= 6 },
  aura: { name: '위압감', good: true, desc: '타자의 컨택 하락', test: (p) => p.velo >= 70 && p.will >= 55 },
  bender: { name: '변화구', good: true, desc: '변화구 위력 상승', test: (p) => p.brk >= 65 && p.cnt.brk >= 6 },
  cold: { name: '감기', good: false, desc: '컨디션 회복이 느림', test: null },
  sleep: { name: '불면증', good: false, desc: '컨디션 소모 증가', test: null },
  bomb: { name: '어깨 폭탄', good: false, desc: '송구 연습 시 부상 위험 상승', test: null },
  lazy: { name: '게으름', good: false, desc: '연습 효율 감소', test: null },
};

// 습득 조건과 진행 표시는 같은 정의를 사용한다.
export const TRAIT_REQUIREMENTS = {
 avg: [['meet',65],['cnt.bat',6]], pwr: [['power',65],['cnt.power',6]], run: [['speed',65],['cnt.run',6]],
 gun: [['arm',65],['cnt.arm',5]], glove: [['field',65],['cnt.defense',6]],
 clutch: [['will',60],['cnt.mental',5]], grit: [['will',75],['cnt.mental',9]], walk: [['meet',55],['will',50],['cnt.mental',3]],
 fast: [['velo',65],['cnt.velo',6]], cmd: [['ctrl',65],['cnt.ctrl',6]], aura: [['velo',70],['will',55]], bender: [['brk',65],['cnt.brk',6]],
};
export const requirementValue = (p, key) => key.startsWith('cnt.') ? (p.cnt[key.slice(4)] || 0) : (p[key] || 0);
for (const [id, req] of Object.entries(TRAIT_REQUIREMENTS)) TRAITS[id].test = (p) => req.every(([k,n]) => requirementValue(p,k) >= n);
export function traitGoals(p) {
 return Object.entries(TRAIT_REQUIREMENTS).filter(([id,req]) => !p.traits.includes(id) && req.every(([k]) => k.startsWith('cnt.') || k in p)).map(([id,req]) => ({id,req,progress:req.reduce((v,[k,n])=>v+Math.min(1,requirementValue(p,k)/n),0)/req.length})).sort((a,b)=>b.progress-a.progress);
}

export const ITEMS = [
  { id: 'drink', name: '스포츠음료', price: 20, desc: '컨디션 +25', fx: (p) => { p.cond = Math.min(99, p.cond + 25); } },
  { id: 'bat', name: '새 배트', price: 80, desc: '미트 +2', fx: (p) => { p.meet = Math.min(99, p.meet + 2); (p.gear = p.gear || {}).bat = true; } },
  { id: 'glove', name: '새 글러브', price: 80, desc: '수비 +2', fx: (p) => { p.field = Math.min(99, p.field + 2); (p.gear = p.gear || {}).glove = true; } },
  { id: 'shoes', name: '러닝화', price: 80, desc: '주력 +2', fx: (p) => { p.speed = Math.min(99, p.speed + 2); (p.gear = p.gear || {}).shoes = true; } },
  { id: 'meal', name: '단백질 식단', price: 60, desc: '파워 +1, 체력 +1', fx: (p) => { p.power = Math.min(99, p.power + 1); p.stamina = Math.min(99, p.stamina + 1); } },
  { id: 'insure', name: '부상 보험', price: 120, desc: '다음 부상 입원 기간 반감', fx: (p) => { p.insured = true; } },
  { id: 'cure', name: '종합 감기약', price: 40, desc: '나쁜 상태 하나 치료', fx: (p) => { const b = p.traits.find((t) => !TRAITS[t].good); if (b) p.traits = p.traits.filter((t) => t !== b); } },
];

export const INJURIES = [
  { name: '타박', weeks: 1 }, { name: '염좌', weeks: 2 }, { name: '근육 파열', weeks: 4 },
  { name: '인대 손상', weeks: 6 }, { name: '골절', weeks: 10 }, { name: '복합 골절', weeks: 16 },
];

// 이벤트. chance는 화면에 표시된다.
export const EVENTS = [
  { id: 't_avg', trait: 'avg', pos: 'bat', title: '타격 비법 공유 요청', text: '후배들이 "애버리지히터"의 타격 비결을 알려달라며 몰려왔다.', min: 20, choices: [
    { label: '가르쳐준다', chance: 100, ok: { team: 6, captain: 4, will: 2, msg: '팀 분위기가 한층 좋아졌다.' } },
    { label: '혼자 연구한다', chance: 70, ok: { meet: 3, cond: -6, msg: '새로운 감을 잡았다.' }, ng: { cond: -10, team: -2, msg: '고립되는 느낌이 들었다.' } } ] },
  { id: 't_pwr', trait: 'pwr', pos: 'bat', title: '홈런 레이스 초대', text: '이웃 학교 행사에서 홈런 레이스에 초청받았다.', min: 24, choices: [
    { label: '출전한다', chance: 60, ok: { power: 3, scout: 8, money: 30, msg: '펜스를 넘기며 스카우트의 눈에 띄었다.' }, ng: { cond: -15, will: -2, msg: '힘만 들어가 무너졌다.' } },
    { label: '사양한다', chance: 100, ok: { cond: 6, msg: '체력을 아꼈다.' } } ] },
  { id: 't_run', trait: 'run', pos: 'bat', title: '도루왕 대결', text: '육상부가 주력 대결을 제안한다.', min: 18, choices: [
    { label: '받아들인다', chance: 55, ok: { speed: 3, will: 4, team: 3, msg: '야구부의 자존심을 지켰다.' }, ng: { cond: -14, msg: '근육이 놀랐다.' } },
    { label: '거절한다', chance: 100, ok: { msg: '조용히 넘겼다.' } } ] },
  { id: 't_clutch', trait: 'clutch', title: '큰 경기 전날 밤', text: '내일은 중요한 경기다. 잠이 오지 않는다.', min: 22, choices: [
    { label: '이미지 트레이닝', chance: 80, ok: { will: 6, cond: 5, coach: 3, msg: '마음이 차분해졌다.' }, ng: { cond: -10, msg: '더 긴장됐다.' } },
    { label: '일찍 잔다', chance: 100, ok: { cond: 15, msg: '푹 잤다.' } } ] },
  { id: 't_walk', trait: 'walk', pos: 'bat', title: '심판의 눈', text: '심판 선배가 "너 공 잘 보더라"며 말을 건다.', min: 20, choices: [
    { label: '비결을 묻는다', chance: 100, ok: { meet: 2, will: 3, msg: '존을 보는 법을 배웠다.' } },
    { label: '인사만 한다', chance: 100, ok: { coach: 2, msg: '예의 바르다는 평가를 받았다.' } } ] },
  { id: 't_cmd', trait: 'cmd', pos: 'pit', title: '제구 시범', text: '신입생들 앞에서 제구 시범을 보여달라는 요청을 받았다.', min: 20, choices: [
    { label: '완벽하게 보여준다', chance: 65, ok: { team: 6, ctrl: 2, coach: 3, msg: '박수가 쏟아졌다.' }, ng: { will: -3, msg: '하필 실투가 나왔다.' } },
    { label: '정중히 사양', chance: 100, ok: { msg: '겸손하다는 말을 들었다.' } } ] },
  { id: 't_bomb', trait: 'bomb', title: '어깨가 불안하다', text: '송구 후 어깨가 욱신거린다. "어깨 폭탄"이 도졌다.', min: 10, choices: [
    { label: '재활 스트레칭', chance: 80, ok: { cond: -5, tough: 2, msg: '조금씩 나아지고 있다.' }, ng: { cond: -15, msg: '효과가 없었다.' } },
    { label: '참고 던진다', chance: 35, ok: { will: 5, msg: '버텨냈다.' }, ng: { cond: -30, tough: -2, msg: '어깨가 크게 상했다.' } } ] },
  { id: 't_sleep', trait: 'sleep', title: '불면의 밤', text: '"불면증"으로 며칠째 잠을 설치고 있다.', min: 8, choices: [
    { label: '상담을 받는다', chance: 100, ok: { cond: 10, will: 3, money: -10, msg: '마음이 조금 편해졌다.' } },
    { label: '야간 러닝', chance: 60, ok: { stamina: 2, cond: 8, msg: '지쳐서 푹 잤다.' }, ng: { cond: -12, msg: '더 말똥말똥해졌다.' } } ] },
  { id: 'rival_duel', req: 'rival', title: '라이벌과의 재회', text: '도발했던 라이벌이 연습 경기 후 다시 찾아왔다. "이번엔 진짜 승부다."', min: 40, choices: [
    { label: '정면 승부', chance: 55, ok: { will: 10, team: 6, coach: 4, msg: '라이벌이 악수를 청했다. 서로 인정했다.' }, ng: { will: -5, cond: -15, msg: '졌다. 하지만 이를 갈았다.' } },
    { label: '다음 대회에서', chance: 100, ok: { will: 3, msg: '무대는 대회장으로 미뤘다.' } } ] },
  { id: 'scout_offer', req: 'scout', title: '스카우트의 개인 면담', text: '지난번 그 스카우트가 감독 몰래 면담을 청한다. "드래프트 앞두고 이야기 좀 하죠."', min: 70, choices: [
    { label: '솔직하게 포부를 밝힌다', chance: 70, ok: { scout: 14, will: 4, msg: '"리스트에 올려두겠다"는 말을 들었다.' }, ng: { scout: 3, coach: -3, msg: '감독 귀에도 들어갔다.' } },
    { label: '감독님께 먼저 보고', chance: 100, ok: { coach: 6, scout: 4, msg: '감독이 대견하다며 웃었다.' } } ] },
  { id: 'captain_trust', req: 'captain', title: '캡틴의 고민 상담', text: '특타를 같이 했던 캡틴이 졸업 후 진로를 털어놓는다.', min: 30, choices: [
    { label: '진지하게 들어준다', chance: 100, ok: { captain: 8, team: 4, will: 3, msg: '캡틴이 "너는 꼭 프로 가라"고 했다.' } },
    { label: '훈련하자고 돌린다', chance: 100, ok: { captain: -2, msg: '분위기가 어색해졌다.' } } ] },
  { id: 'p_bullpen', pos: 'pit', title: '불펜 포수의 부탁', text: '포수가 "공 좀 받아줄 테니 변화구 궤적을 같이 잡아보자"고 한다.', min: 6, choices: [
    { label: '변화구 집중', chance: 65, ok: { brk: 4, ctrl: 1, cond: -10, coach: 3, msg: '손끝 감각이 살아났다.' }, ng: { brk: -1, cond: -15, msg: '공이 빠져 손가락이 아팠다.' } },
    { label: '직구 위주', chance: 80, ok: { velo: 3, cond: -8, msg: '직구 위력이 늘었다.' }, ng: { cond: -14, msg: '힘만 들어갔다.' } } ] },
  { id: 'p_rival_bat', pos: 'pit', title: '강타자 라이벌', text: '지난 대회 홈런을 친 4번 타자가 "다시 붙자"고 한다.', min: 20, choices: [
    { label: '승부를 받는다', chance: 55, ok: { will: 8, ctrl: 2, team: 4, msg: '삼진으로 설욕했다!' }, ng: { will: -4, cond: -12, team: -2, msg: '큰 타구를 맞았다.' } },
    { label: '피한다', chance: 100, ok: { will: -1, msg: '다음을 기약했다.' } } ] },
  { id: 'p_form', pos: 'pit', title: '투구폼 점검', text: '코치가 릴리스 포인트가 낮다고 지적한다.', min: 14, choices: [
    { label: '폼을 고친다', chance: 60, ok: { ctrl: 5, coach: 4, msg: '제구가 안정됐다.' }, ng: { ctrl: -3, velo: -1, cond: -8, msg: '폼이 꼬였다.' } },
    { label: '유지한다', chance: 100, ok: { will: 2, msg: '내 공을 믿었다.' } } ] },
  { id: 'b_machine', pos: 'bat', title: '피칭머신 고장', text: '피칭머신이 제멋대로 빠른 공을 쏜다.', min: 8, choices: [
    { label: '끝까지 친다', chance: 60, ok: { meet: 3, power: 1, cond: -12, msg: '눈이 빨라졌다.' }, ng: { cond: -18, msg: '헛스윙만 했다.' } },
    { label: '정비를 기다린다', chance: 100, ok: { cond: 10, msg: '쉬었다.' } } ] },
  { id: 'b_pinch', pos: 'bat', title: '대타 기회', text: '감독이 "다음 경기 대타 준비해라"고 한다.', min: 10, choices: [
    { label: '의욕적으로', chance: 70, ok: { will: 5, coach: 6, msg: '감독 눈에 들었다.' }, ng: { will: -2, msg: '긴장해서 체력만 썼다.' } },
    { label: '담담하게', chance: 100, ok: { coach: 2, msg: '무난했다.' } } ] },
  { id: 't_fast', trait: 'fast', pos: 'pit', title: '강속구 소문', text: '구속이 소문나 다른 학교 스카우트가 찾아온다.', min: 18, choices: [
    { label: '구속을 보여준다', chance: 75, ok: { scout: 12, cond: -8, msg: '스피드건에 놀란 표정이다.' }, ng: { scout: 2, cond: -12, msg: '어깨가 뻐근하다.' } },
    { label: '숨긴다', chance: 100, ok: { will: 2, msg: '비장의 무기로 남겼다.' } } ] },
  { id: 'injury_scare', title: '무릎이 시큰하다', text: '훈련 중 몸에 위화감이 든다. 어떻게 할까?', min: 14, choices: [
    { label: '무리해서 계속', chance: 40, ok: { will: 6, msg: '아무 일도 없었다.' }, ng: { cond: -35, tough: -2, msg: '컨디션이 크게 무너졌다.' } },
    { label: '바로 쉰다', chance: 100, ok: { cond: 12, coach: 2, msg: '빨리 쉰 덕에 괜찮아졌다.' } } ] },
  { id: 'exam_help', title: '친구의 시험 도움', text: '시험 기간, 반 친구가 노트를 빌려준다고 한다.', min: 8, choices: [
    { label: '빌려 공부한다', chance: 100, ok: { study: 6, team: 2, msg: '성적이 올랐다.' } },
    { label: '훈련을 우선한다', chance: 100, ok: { will: 3, study: -3, msg: '야구가 먼저다.' } } ] },
  { id: 'captain', title: '캡틴의 특훈 제안', text: '캡틴이 일요일 밤 특타를 하자고 한다.', min: 0, choices: [
    { label: '따라간다', chance: 70, ok: { meet: 3, captain: 8, cond: -10, msg: '특타 성공! 감이 확 왔다.' }, ng: { cond: -22, captain: 2, msg: '무리해서 몸이 무겁다.' } },
    { label: '거절한다', chance: 100, ok: { captain: -5, msg: '캡틴이 아쉬워했다.' } } ] },
  { id: 'scout', title: '스카우트가 훈련을 지켜본다', text: '낯선 어른이 펜스 너머에서 메모를 하고 있다.', min: 24, choices: [
    { label: '전력으로 어필', chance: 60, ok: { scout: 12, cond: -12, msg: '스카우트가 고개를 끄덕였다.' }, ng: { scout: -4, cond: -12, msg: '긴장해서 실수했다.' } },
    { label: '평소처럼', chance: 100, ok: { scout: 3, msg: '무난하게 넘어갔다.' } } ] },
  { id: 'coach', title: '감독의 개인 면담', text: '감독이 앞으로의 목표를 묻는다.', min: 0, choices: [
    { label: '프로가 되겠습니다', chance: 80, ok: { coach: 8, will: 5, msg: '감독이 기대한다는 눈빛을 보냈다.' }, ng: { coach: -3, msg: '말이 앞섰나 보다.' } },
    { label: '팀에 도움이 되고 싶습니다', chance: 100, ok: { team: 6, coach: 3, msg: '감독이 웃었다.' } } ] },
  { id: 'friend', title: '친구가 놀자고 한다', text: '주말에 친구가 게임센터에 가자고 한다.', min: 0, choices: [
    { label: '논다', chance: 100, ok: { cond: 20, money: -15, team: 3, msg: '리프레시했다.' } },
    { label: '연습한다', chance: 75, ok: { meet: 2, speed: 1, cond: -8, msg: '조용히 땀을 흘렸다.' }, ng: { cond: -15, msg: '집중이 안 됐다.' } } ] },
  { id: 'cat', title: '길고양이', text: '그라운드에 길고양이가 들어왔다.', min: 0, choices: [
    { label: '간식을 준다', chance: 100, ok: { money: -5, will: 3, team: 4, msg: '팀원 모두가 웃었다.' } },
    { label: '쫓아낸다', chance: 100, ok: { team: -2, msg: '분위기가 조금 가라앉았다.' } } ] },
  { id: 'gamble', title: '내기 배팅', text: '선배가 "전력질주 100m, 이기면 용돈 줄게"라고 한다.', min: 4, choices: [
    { label: '도전', chance: 50, ok: { money: 60, speed: 2, team: 3, msg: '이겼다!' }, ng: { money: -30, cond: -10, msg: '졌다...' } },
    { label: '패스', chance: 100, ok: { msg: '현명한 선택이다.' } } ] },
  { id: 'rain', title: '장마철 실내 훈련', text: '비가 계속 와서 실내 연습장만 쓸 수 있다.', min: 0, choices: [
    { label: '실내 스윙 집중', chance: 85, ok: { meet: 3, cond: -8, msg: '스윙 궤도가 정리됐다.' }, ng: { cond: -18, msg: '지루함에 지쳤다.' } },
    { label: '푹 쉰다', chance: 100, ok: { cond: 25, msg: '컨디션이 올랐다.' } } ] },
  { id: 'senior', title: '선배의 조언', text: '졸업한 선배가 배팅 폼을 봐준다.', min: 12, choices: [
    { label: '폼을 바꿔본다', chance: 55, ok: { meet: 5, power: 2, coach: 3, msg: '폼이 딱 맞았다!' }, ng: { meet: -3, cond: -8, msg: '폼이 무너졌다.' } },
    { label: '내 폼을 지킨다', chance: 100, ok: { will: 3, msg: '자신감이 붙었다.' } } ] },
  { id: 'parents', title: '부모님의 응원', text: '도시락과 함께 응원 편지가 왔다.', min: 0, choices: [ { label: '고맙게 먹는다', chance: 100, ok: { cond: 18, will: 4, money: 10, msg: '기운이 났다.' } } ] },
  { id: 'rival', title: '라이벌의 도발', text: '다른 학교 에이스가 "다음엔 삼진이다"라고 한다.', min: 18, choices: [
    { label: '받아친다', chance: 65, ok: { will: 8, meet: 2, msg: '투지가 불타오른다!' }, ng: { will: -3, cond: -10, msg: '괜히 흥분했다.' } },
    { label: '웃어넘긴다', chance: 100, ok: { will: 2, msg: '여유가 있다.' } } ] },
  { id: 'camp', title: '여름 합숙 제안', text: '감독이 방학 합숙 훈련 참가자를 모집한다.', min: 20, choices: [
    { label: '참가한다', chance: 75, ok: { power: 2, stamina: 2, meet: 1, cond: -20, coach: 6, msg: '지옥 같았지만 한 단계 성장했다.' }, ng: { cond: -30, coach: 2, msg: '탈진해서 중간에 쓰러졌다.' } },
    { label: '사양한다', chance: 100, ok: { coach: -3, cond: 8, msg: '조용히 쉬었다.' } } ] },
  { id: 'slump', title: '슬럼프가 왔다', text: '배트가 맞지 않는다. 어떻게 극복할까?', min: 16, choices: [
    { label: '영상 분석', chance: 70, ok: { meet: 3, will: 3, msg: '문제점을 찾았다.' }, ng: { will: -3, msg: '답이 보이지 않는다.' } },
    { label: '무작정 휘두른다', chance: 45, ok: { meet: 4, power: 2, cond: -15, msg: '감이 돌아왔다!' }, ng: { cond: -25, meet: -2, msg: '몸만 지쳤다.' } },
    { label: '쉰다', chance: 100, ok: { cond: 25, msg: '머리가 맑아졌다.' } } ] },
  { id: 'teacher', title: '선생님의 면담', text: '성적이 걱정된다며 보충 수업을 권한다.', min: 6, choices: [
    { label: '받는다', chance: 100, ok: { study: 12, cond: -8, coach: 2, msg: '공부 감각이 돌아왔다.' } },
    { label: '야구가 먼저입니다', chance: 60, ok: { will: 4, coach: 2, msg: '의지를 보였다.' }, ng: { study: -6, coach: -3, msg: '선생님이 한숨을 쉬었다.' } } ] },
  { id: 'glove', title: '글러브 손질', text: '낡은 글러브를 손질해 줄 선배가 있다.', min: 0, choices: [
    { label: '맡긴다', chance: 100, ok: { field: 2, team: 3, msg: '포구가 편해졌다.' } } ] },
  { id: 'fan', title: '후배의 동경', text: '신입 후배가 사인을 부탁한다.', min: 24, choices: [
    { label: '웃으며 해준다', chance: 100, ok: { team: 4, will: 2, msg: '팀 분위기가 좋아졌다.' } },
    { label: '지금은 바쁘다', chance: 100, ok: { cond: 4, msg: '연습에 집중했다.' } } ] },
  { id: 'night', title: '야간 러닝', text: '밤 운동장을 혼자 달리는 캡틴을 봤다.', min: 0, choices: [
    { label: '같이 뛴다', chance: 65, ok: { speed: 2, stamina: 2, captain: 8, cond: -14, msg: '캡틴과 가까워졌다.' }, ng: { cond: -26, captain: 2, msg: '따라가다 지쳤다.' } },
    { label: '지켜본다', chance: 100, ok: { will: 2, msg: '자극을 받았다.' } } ] },
  { id: 'proscout', title: '프로 스카우트의 쪽지', text: '관심 있다는 짧은 쪽지가 도착했다.', min: 60, choices: [
    { label: '더 노력한다', chance: 100, ok: { will: 5, scout: 6, msg: '목표가 선명해졌다.' } } ] },
  { id: 'e_rain', title: '장마철 실내 훈련', text: '비가 계속 내려 운동장을 쓸 수 없다. 실내 연습장은 선배들이 차지했다.', min: 12, choices: [
    { label: '선배들 사이에서 눈치껏 연습한다', chance: 60, ok: { meet: 2, team: 3, msg: '선배들이 자리를 내줬다.' }, ng: { cond: -6, team: -3, msg: '눈치만 보다 하루가 갔다.' } },
    { label: '복도에서 혼자 맨몸 운동', chance: 100, ok: { stamina: 2, tough: 2, msg: '체력이 조금 붙었다.' } } ] },
  { id: 'e_scoutcall', title: '스카우트의 전화', text: '프로 구단 스카우트가 경기를 보고 갔다며 연락해 왔다.', min: 40, choices: [
    { label: '한 번 만나본다', chance: 70, ok: { scout: 8, will: 4, msg: '관심 선수 명단에 이름이 올랐다.' }, ng: { will: -4, coach: -3, msg: '감독이 "운동에 집중하라"고 했다.' } },
    { label: '지금은 연습에 집중', chance: 100, ok: { coach: 4, tough: 2, msg: '감독이 고개를 끄덕였다.' } } ] },
  { id: 'e_part', title: '아르바이트 제안', text: '동네 가게 사장님이 주말 일손을 구한다. 용돈이 필요하긴 하다.', min: 8, choices: [
    { label: '일한다', chance: 100, ok: { money: 40, cond: -12, msg: '용돈은 벌었지만 몸이 무겁다.' } },
    { label: '정중히 거절', chance: 100, ok: { will: 2, msg: '야구에 더 집중하기로 했다.' } } ] },
  { id: 'e_rival_gift', title: '라이벌의 선물', text: '다른 학교 에이스가 새 장갑을 건네며 "다음 대회에서 보자"고 했다.', min: 60, choices: [
    { label: '받는다', chance: 100, ok: { will: 6, field: 1, msg: '묘한 승부욕이 생겼다.' } },
    { label: '돌려준다', chance: 60, ok: { will: 8, team: 2, msg: '"실력으로 이기겠다"고 말했다.' }, ng: { will: -3, msg: '어색한 분위기가 남았다.' } } ] },
  { id: 'e_scout_visit', req: 'e_scoutcall', title: '스카우트의 방문', text: '전화를 주었던 스카우트가 연습을 직접 보러 왔다. 감독도 옆에서 지켜본다.', min: 50, choices: [
    { label: '평소처럼 한다', chance: 80, ok: { scout: 10, coach: 3, msg: '"기본기가 좋다"는 메모를 남기고 갔다.' }, ng: { scout: 2, will: -3, msg: '긴장해서 실수가 이어졌다.' } },
    { label: '무리해서 보여준다', chance: 45, ok: { scout: 16, will: 5, msg: '인상적인 장면을 만들었다!' }, ng: { cond: -15, scout: -3, coach: -2, msg: '무리하다 몸이 무거워졌다.' } } ] },
  { id: 'e_rival_match', req: 'e_rival_gift', title: '에이스와의 재회', text: '선물을 건넸던 라이벌이 연습경기에서 다시 마주쳤다. 눈빛이 달라져 있다.', min: 70, choices: [
    { label: '정면 승부', chance: 55, ok: { will: 10, meet: 2, team: 4, msg: '졌지만 서로를 인정했다. 한 단계 성장했다.' }, ng: { will: 3, cond: -8, msg: '크게 졌지만 다음엔 다르리라 다짐했다.' } },
    { label: '데이터를 모아 분석', chance: 85, ok: { study: 4, ctrl: 2, meet: 1, msg: '약점을 찾아냈다.' }, ng: { msg: '자료만 쌓였을 뿐이다.' } } ] },
];

export const TEAMS = ['청룡고', '백호고', '한성고', '대양고', '북산고', '제일고', '동명고', '서해고'];
export const PRO = ['서울 베어스', '부산 마린스', '대구 라이온스', '광주 타이거스', '인천 스카이', '대전 이글스'];
