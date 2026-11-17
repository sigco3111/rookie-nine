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

## 02:30 Nov 17
- Training reports actual capped stat/mental gains; maxed training reports 능력 변화 없음 instead of false recovery. Skip off-position gain fields so pitcher mental training doesn't create invalid meet value. Deterministic tests + actual capped-training screen passed.
- Resource check on live goals flow found root favicon.ico 404; game script/model failures not observed in that flow. Match-specific second 404 still unidentified. Not a resolved all-resource check.

## 02:51 Nov 17
- Added 선택의 기록 in 상세 능력: date, event title, selected option, result text and actual delta chips. Stores last 30 events; displays latest 12 in scroll area, also adds summary to player log. Existing old events cannot be reconstructed. Synthetic event path + local portrait screenshot checked; JSON persistence roundtrip/limit test passed. Next: normal event UI -> save/reload check.

## 03:32 Nov 17
- Save immediately after event selection and each shop purchase, before closing modal. Reload while result/shop still open now retains choice/history/reward and gear/money. UI event and purchase reload tests passed. No game-currency prices changed.
- Description audit discovered traits whose advertised effects don't match current mechanics (e.g. walk is contact-radius bonus, description says enlarged zone; clutch/gun/glove may lack gameplay use). Needs focused implementation/description pass, not claimed complete.

## 03:53 Nov 17
- Trait effects: clutch now increases direct batting contact radius by .025 with runner present; gun/glove each add +2 coach/team evaluation after match (direct and auto share applyMatchResult). walk description corrected to direct contact range instead of nonexistent zone enlargement. Pure conditional/helper and paired result tests passed; goals description screenshot checked locally. Not full trait balance audit; runner is abstract single occupied-base flag, not detailed scoring-position state.

## 04:14 Nov 17
- Newly acquired good traits get a dedicated unlock card with effect text before yearly review/random event. Ownership saved before acknowledgement. Actual training-button path tested with threshold stats/counters and fixed RNG; local portrait screenshot passed. No probability changes. Next: live unlock UI and reload check; real growth balance remains deferred.

## 04:55 Nov 17
- Risk preview now uses same formula as execution, including training condition cost, insomnia, shoulder bomb and toughness gain. Previously pre-training condition and missing bomb understated risk. Low-condition bomb+insomnia arm training preview 21% equals execution 21.312%. Label uses approximate rounded percent. Existing injury odds unchanged. Screenshot local; no real-device check.

## 05:37 Nov 17
- Tried matching purchased red shoes to runner as well as batter. Material color updated but actual close-camera runner capture still shows white base-model shoes, so not verified. Reverted code, no deployment. Need check overlay shoe geometry vs model foot before claiming gear visibility. Keep 06:00 latest deployment fc58020 unchanged.

## 06:19 Nov 17
- Shoe investigation: FBX has no separate shoe material (Skin/Shirt/Pants/Belt/Face/Hair only). Tried assigning foot-weighted triangles to shoe material; close run frame showed thin/missing-looking feet rather than clear red shoes. Reverted both model and runner changes, no deployment. Need inspect foot skinning/group selection before using this route. Latest live remains fc58020.

## 06:39 Nov 17
- Choice-sensitive event chains: scout visit requires earlier meeting choice, captain trust requires accepting extra training. Durable per-event choice flags are separate from 30-entry history. Decline/accept/one-shot predicate tests passed, choice-history screen checked. Old saves without flags do not infer an old choice; a qualifying new choice unlocks the follow-up. Next: UI-driven chain eligibility check. No probabilities/reward values changed.

## 06:59 Nov 17
- Match result now shows actual clamped coach/captain/team/scout and condition changes, shared by direct and auto entry paths. Replaced vague updated text with delta chips and brief growth-use explanation. Auto batting UI test with evaluation 99 verifies caps (+1 rather than nominal bonus), negative condition and zero-change omission. Portrait pixels inspected. Detailed direct/pitching/device QA remains open.

## 07:19 Nov 17
- Added two one-shot match-outcome scenarios: reflect on a recent win (team recovery vs analysis) or loss (team review vs rest). Shared applyMatchResult stores last outcome for batter/pitcher/direct/auto; random-event eligibility checks matching result within four game weeks and per-event once flag. Existing 24% weekly event rate unchanged, so these are eligible candidates, not guaranteed next events. Old saves wait for next played/simulated match; no guessed reconstruction. Both positions win/loss/expiry/once tests passed. Actual auto-match -> next-week event UI -> choice -> reload flow passed with fixed RNG. Local portrait screen inspected; detailed balance/direct/device QA remains deferred.

## 07:40 Nov 17
- Completed-match checkpoint saved before result modal. Reload/Continue restores that exact result and pending week-end continuation, instead of discarding completed match. Next finalizes week once; checkpoint clears and saves at week-end. Training trait baseline carried through reload so unlock detection still has original baseline. UI test: auto match result -> reload -> Continue result has identical week/wins/losses/condition/AB -> Next advances exactly one week -> reload no duplicate. Does not resume mid-pitch/mid-match; those remain open. Portrait restored-result pixels checked.

## 08:01 Nov 17
- Added recent match records from detailed stats: dated result/score and batter or pitcher line. Shared result handler stores last 20, screen shows latest 8; no reconstruction of old matches. Also corrected pitcher cumulative detail line (SO/hits allowed/innings instead of batting HR/RBI). Actual auto game -> reload result -> finish week -> reload -> records UI passed, portrait inspected. Pitcher record/serialization/20 cap tested in logic; direct/pitcher UI not yet captured.

## 08:23 Nov 17
- Returned to unresolved glancing contact evidence rather than adding menus. Actual direct-game callback, center pitch, fixed 1/60 simulation dt, swing requested T-.075+.12. Measured T=1.412616, swingT=1.466667 -> timing error +.129051s (foul band for meet~42). During expected contact swingT+.075≈1.541667 ball already z≈1.626m behind plate, and result finalization still waits until T+.2. Captured 22 rendered game frames at simulation 60fps, encoded 15fps (4x slow). Actual pixels show ball passing behind swing; not resolved and no gameplay deployment. Evidence excludes HUD and uses software-rendered synthetic inputs, not real-device performance. Next fix must align visual/contact response without silently changing hit windows; keep early/perfect/late and miss comparisons.

## 08:44 Nov 17
- Extended actual-game capture to early/perfect/late inputs with same center fastball (T1.4208, fixed RNG/dt). Measured closest ball-center to rendered bat centerline among 27 captured frames: early .655m, perfect .261m, late .405m. These are centerline distances, not collision surface or continuous-time minima; bat radius/ball radius excluded. Perfect frame at t1.4333 shows bat endpoint y .719 vs ball y .893, so timing delay is not the only issue: swing height/path also misses center pitch visually. No game change/deployment; screenshot comparison inspected separately. Need bat path/height adjustment plus timing response, cannot call fixed by earlier finalization alone.

## 09:04 Nov 17
- Tried batUp2 .55 vs .1 on same perfect-center pitch: sampled nearest centerline gap .261 -> .149m. Pixels show steeper diagonal bat, still not clear contact, so rejected rather than shipping cosmetic improvement as fix. Restored scene.js and dist to baseline; docs/live unchanged. Next: raise hand/swing plane with aim rather than tilting barrel only; maintain grip IK and compare early/perfect/late+high/low inputs. Height trial script retained locally, no new asset or dependency.

## 09:26 Nov 17
- Local hand/swing-plane lift experiment: raise sampled wrist directions .25m and elbows half amount with smooth contact-phase envelope, retain grip IK and original barrel angle. Same perfect-center sampled centerline gap .261 -> .078m, pixels show bat crossing ball instead of below it. Early .655m, late .270m: late mismatch remains, no timing-window change. Source experiment is LOCAL ONLY; docs/live unchanged pending high/low aim and continuity checks. Do not claim contact fixed from one center-pitch frame. Fixed-dt software render slow clip captured for parent.
