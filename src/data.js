// 시스템 구조만 참고한 독자 구현 데이터
export const STAT_KEYS = ['meet', 'power', 'speed', 'arm', 'field', 'stamina'];
export const STAT_NAME = { meet: '미트', power: '파워', speed: '주력', arm: '송구', field: '수비', stamina: '체력' };
export const grade = (v) => v >= 90 ? 'S' : v >= 80 ? 'A' : v >= 70 ? 'B' : v >= 60 ? 'C' : v >= 50 ? 'D' : v >= 40 ? 'E' : v >= 25 ? 'F' : 'G';
export const GRADE_COLOR = { S: '#ff5a5f', A: '#ff8a3d', B: '#f4c20d', C: '#7bd23f', D: '#36c2a3', E: '#3aa0e8', F: '#8a94a6', G: '#6b7280' };

// 연습 10종. gain: 주 능력치 증가량 기준, cost: 컨디션 소모, risk: 부상 위험
export const PRACTICES = [
  { id: 'chore', name: '잡무', icon: '', desc: '평가와 용돈. 능력치 소폭', cost: 6, risk: 0.01, gain: { stamina: 1 }, eval: { coach: 3, team: 2 }, money: 8 },
  { id: 'basic', name: '기초훈련', icon: '', desc: '전 능력 골고루. 안전', cost: 10, risk: 0.015, gain: { meet: 1, power: 1, speed: 1, arm: 1, field: 1, stamina: 1 }, eval: { coach: 2 } },
  { id: 'power', name: '파워훈련', icon: '', desc: '파워 중심', cost: 16, risk: 0.04, gain: { power: 4, stamina: 1 }, eval: { captain: 1 } },
  { id: 'bat', name: '배팅연습', icon: '', desc: '미트 중심', cost: 14, risk: 0.03, gain: { meet: 4, power: 1 }, eval: { coach: 2 } },
  { id: 'defense', name: '수비연습', icon: '', desc: '수비·송구', cost: 14, risk: 0.03, gain: { field: 4, arm: 1 }, eval: { coach: 2, team: 1 } },
  { id: 'run', name: '주루연습', icon: '', desc: '주력', cost: 14, risk: 0.04, gain: { speed: 4, stamina: 1 }, eval: { captain: 1 } },
  { id: 'arm', name: '송구연습', icon: '', desc: '송구', cost: 14, risk: 0.04, gain: { arm: 4 }, eval: { team: 1 } },
  { id: 'cond', name: '체력훈련', icon: '', desc: '체력과 터프도', cost: 18, risk: 0.03, gain: { stamina: 4 }, tough: 2, eval: { captain: 2 } },
  { id: 'mental', name: '멘탈훈련', icon: '', desc: '의지와 특능 습득', cost: 8, risk: 0.005, gain: { meet: 1 }, will: 6, eval: { scout: 1 } },
  { id: 'refresh', name: '리프레쉬', icon: '', desc: '컨디션 회복', cost: -28, risk: 0, gain: {}, cureBad: true },
];
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
  cold: { name: '감기', good: false, desc: '컨디션 회복이 느림', test: null },
  sleep: { name: '불면증', good: false, desc: '컨디션 소모 증가', test: null },
  bomb: { name: '어깨 폭탄', good: false, desc: '송구 연습 시 부상 위험 상승', test: null },
  lazy: { name: '게으름', good: false, desc: '연습 효율 감소', test: null },
};

export const ITEMS = [
  { id: 'drink', name: '스포츠음료', price: 20, desc: '컨디션 +25', fx: (p) => { p.cond = Math.min(99, p.cond + 25); } },
  { id: 'bat', name: '새 배트', price: 80, desc: '미트 +2', fx: (p) => { p.meet = Math.min(99, p.meet + 2); } },
  { id: 'glove', name: '새 글러브', price: 80, desc: '수비 +2', fx: (p) => { p.field = Math.min(99, p.field + 2); } },
  { id: 'shoes', name: '러닝화', price: 80, desc: '주력 +2', fx: (p) => { p.speed = Math.min(99, p.speed + 2); } },
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
];

export const TEAMS = ['청룡고', '백호고', '한성고', '대양고', '북산고', '제일고', '동명고', '서해고'];
export const PRO = ['서울 베어스', '부산 마린스', '대구 라이온스', '광주 타이거스', '인천 스카이', '대전 이글스'];
