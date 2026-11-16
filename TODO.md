# 루키나인 개발 메모 (비공개)
현재: 기본 골격(성장 루프 + 3D 타석). 완성품 아님. 마무리 여부는 사용자가 결정.
다음 작업
1. 타격 체감: 투구 궤적/존 시인성, 타구 카메라, 홈 구도, 구장 입체감
2. 홈 화면에서 캐릭터가 패널에 가리지 않는 구도
3. 성장 선택 결과 연결: 빌드별 특화, 특능 이벤트 (투수 육성/직접 투구는 v0.3에 기본 구현됨, 다듬기 필요)
4. 시나리오/이벤트 확장, 다회차(명예의 전당 선수 계승)
5. 후반 정밀검증: 밸런스(현재 너무 쉬움), 실기기, 예외 처리
원칙: 원작 코드/데이터/이름/대사 미사용, 구조만 참고. 공개 배포는 사용자 승인 후.

## 10:05 update
- Done: pitcher view camera/catcher/ump/backstop, position-specific home character, hit-flight in pitching, HoF inheritance, 8 new events (pos/trait/build specific), applyFx NaN guard for other-position stats.
- Next: batter hit camera + runner visual check, rival/scout scenario chains, crowd/stadium detail, more special-ability events. Late phase: balance (smart strategy top5 ~100%), device QA.
- 2026-11-16: Kenney player model integrated (scene.js makeKenney). Next: tune batting/pitching/run bone poses (elbow bend, bat grip), wristband/gear shoes on new model, number on jersey back.

## 16:30
- Done: per-year batter uniform (blue/teal/orange). Next: equipment on player, event result presentation, fielder detail, growth-choice consequences.

## 16:50
- Done: event result modal with stat chips. Next: equipment on player, fielder detail, growth-choice consequences.

## 17:35
- Done: yearly review modal (stat deltas vs last year). Next: equipment on player, fielder detail, more scenario events.

## 17:52
- Done: purchased gear (bat/shoes) shown on batter in match. Next: fielder detail, more scenario events.

## 18:15
- Done: +4 scenario events (rain, scout call, part-time, rival gift). Next: fielder detail; reports paused until 06:00 KST.

## 18:35
- Done: opponent shirt color per team (8 palettes). Next: fielder size/detail, hit-result animation check, partial-contact check.

## 18:55
- Checked (real game, wall-clock screenshots, slow): after contact -> field camera + runner -> "홈런!! (+2점)" text -> next at-bat. Ball not clearly visible in field view; SWING button stays on screen during hit view. Evidence /downloads/rookie9_hitseq.png. For 06:00 report.

## 19:36
- Done: SWING button dims outside the pitch window (hit/result view). Evidence /downloads/rookie9_hitseq3.png.

## 20:17
- Home screen: torso hidden behind log panel (home composition item 2 still open), so year uniform on home char is not visible/verified; not pushed. Next: home composition so the character is not covered, field-view ball visibility.

## 20:40
- Done: home composition: character full body visible between stat panel and log (scale 0.44, lookAt y -0.5). Home char still uses default blue shirt (year uniform not applied at home). Evidence /downloads/rookie9_home_v2.png.

## 20:58
- Tried year uniform on home char via showHome: shirt stayed blue in capture (cause unknown, maybe different mesh/call path); reverted, not pushed.

## 21:20
- Done: home char wears year uniform (verified orange in year 3 crop /downloads/rookie9_home_crop.png). In that capture the log panel covers the legs; torso/head visible.

## 21:40
- Tried ball scale-up with high camera: ball still not visible in field view frames (forced homer, wall-clock screenshots too slow to judge). Reverted. Needs fixed-dt capture with ball-screen-position log.

## 22:02
- Done: hit-flight ball scaled by camera distance (1..5x). Logged projection in game: on screen, projected diameter 24px at start down to 6px at landing (forced homer). Wall-clock screenshots miss most flight frames. Debug hook window.__flog inactive unless set.

## 22:42
- Done: 2 chained events (e_scout_visit after e_scoutcall, e_rival_match after e_rival_gift). 42 events total. Build + event flow ran without errors; new event screens not captured.

## 23:45
- Event chips now show actual clamped changes, not nominal rewards (731de71). Live event screenshot verified.
- Annual review baseline captured before first action/save rather than after first training. Removed unused fallback variables. Batter/pitcher deterministic two-year checks passed; normal weekly path 47 -> 48 review -> year 2 date passed. Existing saves without snapshot begin comparison at next capture; prior missing growth cannot be reconstructed.
- Open: middle-flight ball visual proof, glancing contact, pitcher follow-through direction, balance/device QA.

## 00:05 Nov 17
- Closed limited flight visibility check: fixed-dt (1/30) actual game flight callback captured canvas at flight progress 20.5% and 50%. White ball visibly separates from sky/stadium in both rendered frames. /downloads/rookie9_flight_21.png, rookie9_flight_50.png. Forced homer parameters, local build, canvas only (no HTML HUD). Not real-device or normal hit-frequency evidence. End-flight 80% not captured during wait.
- Visible follow-up: strike-zone/aim marker remains in hit-flight view and should be hidden then restored for next pitch. No game code changed this run.

## 00:26 Nov 17
- Hide strike-zone/aim guides during hit flight; restore at pitchOnce entry (including foul continuation). Rendered 50% and 81% flight frames checked: guides absent, white ball visible. 81% ball overlaps crowd and is lower contrast. Restoration wired but not visually captured yet. Fixed dt/forced homer/local canvas test, no device measurement.

## 00:48 Nov 17
- Foul continuation restored batting camera and fielders (previously continued with flight camera). Forced-foul actual-game test at fixed 1/15 s: next pitch camera [-0.15,1.8,5.4]; screenshot shows zone and yellow aiming ring restored. /downloads/rookie9_foul_restore.png. Local canvas, not device test.

## 01:08 Nov 17
- Growth goal screen from 상세 능력: nearest 3 unlearned traits, ability/training requirements, progress bars, 35% acquisition explanation. Shared requirement definitions drive both checks and UI. Local portrait screenshot verified; batter/pitcher eligibility tests passed. No balance changes. Next: live check and pitcher screen; fielders/motion limitations remain.

## 01:51 Nov 17
- Fielders: replaced full-distance slide-to-landing with 0.18s reaction delay + max 7 world m/s pursuit; arms/legs alternate during travel and reset after flight. Local fixed-dt close-camera pose test at 26/50/76% checked. This does not implement real catches/throws or change hit-result probability. No claim of natural motion or device measurements. Main game camera unchanged.
