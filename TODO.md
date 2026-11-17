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

## 09:46 Nov 17
- Local aim-height plane experiment: aimHeight passed from reticle; wrist/elbow lift tracks low/center/high. Synthetic callback height overrides (not genuine pointer/pitch generation) yield sampled gaps .065/.078/.114m. High pose still has an awkward raised arm above helmet; not accepted for deployment. No timing/hit-window changes. Local source+dist differ from docs/live. Need high-hand pose constraint and actual drag input evidence before publish; lateral aim and glancing contact timing remain open.

## 10:06 Nov 17
- Limited high-aim wrist lift to .5 and used modest barrel elevation for rest: fewer above-helmet hand artifacts but high gap .141m (worse than .114), not yet a release candidate. Added actual projected canvas PointerEvent test: aim 1.25 yields actual aimHeight 1.2499999999999991 and matches expected plane. Ball height still test-overridden, not natural high-pitch generation. Source/dist LOCAL ONLY, docs/live unchanged. Next prioritize contact-time response to stop ball travelling through bat after apparent intersection; then review pose+timing together rather than over-tuning gap metric.

## 10:29 Nov 17
- Local response experiment: eligible contact resolves at swingT+.075, retaining original timing/location acceptance and foul/hit windows. Follow-through continues from current phase instead of snapping to end pose. Actual center test resolves at1.4333 vs old1.6333 (T1.4208, swing1.35), .2s earlier simulation. +.22 late miss remains canContact false and resolves old deadline; no widened hitting window. Local only pending flight transition and early/late comparison. Pose changes also remain local; docs/live unchanged.

## 10:48 Nov 17
- Rejected contact-response candidate after early/late test. Accepted early swing resolves while ball z=-1.305m, distance to bat centerline1.523m; late resolves at z1.619m. Thus fast response fixes center only and creates/retains disconnected contact elsewhere. Restored BOTH scene.js and match.js to deployed2b1cb5d, rebuilt matching index-B9hagiAY.js. All experiments remain recoverable in local commits but none in active source. docs/live unchanged. Next motion approach must separate input timing error (gameplay) from visual contact clock, or change physics with explicit design; do not widen/narrow acceptance to conceal mismatch. Avoid repeated parameter-only tuning.

## 11:08 Nov 17
- Paused motion tuning to finish narrow pitcher result/history smoke check: actual pitcher creation->auto loss->reload result->finish week->reload->history all passed. Found separate score bug: tied pitcher auto games assigned as losses still showed tied team score (seed7 produced2:2 loss). Now loss-side tie-break adds opponent team run, like existing win-side tie-break; pitcher line stays outing stats. 1000 deterministic seeds verified non-tied score, win flag and saved-history score agreement. No balance probability changes. Motion experiments remain reverted; next motion work requires structural contact solution, not parameter tuning.

## 11:14 Nov 17
- User11:11 asked easier swing judgment. Increased direct batting base timing .07+meet*.0009 -> .10+meet*.001 and contact radius .18+meet*.0015 -> .24+meet*.0018. Trait bonuses preserved; automatic simulation unchanged. At starting meet42 fair-contact timing ±.1078 -> ±.142s, aim radius .243 -> .3156 worldm; foul limits scale as before. HUD explains assistance. Actual direct center pitch no force-hit override: measured late error+.137533 within new .15 window at test meet50 led to flight (old .115 would be foul). Pixel checked; fixed input not human difficulty study. Motion/physical-contact mismatch remains separate and unfixed.

## 11:19 Nov 17
- User11:16 asked timing guide. Added separate shrinking ring at lower left away from ball/zone, target circle + green NOW text, synchronized swing-button green glow/NOW label. Centers on actual input target T-.075 (swing lead), green range65% of current fair timing window; hides immediately after swing/finalization. No hit-probability change. Actual direct game callback paused at t1.35/T1.4208 to inspect ready UI, pointer swing hides guide. Portrait pixels inspected; fixed software test, not actual human success study or device QA. Pitcher controls do not use guide. Motion issue remains independent.

## 11:28 Nov 17
- User11:24 wants reset after swing then pass further swing refinement for now. Added stance reset after non-hit pitch result (whiff/foul/looking) and defensive reset at next pitch entry; fair-hit path retains existing post-flight reset. Actual direct whiff -> following pitch test shows stance mocap16/phase0 and timing guide準備, portrait pixels checked. Timing difficulty/guide unchanged. Further precision swing/contact work paused per user; other project work continues. Fixed-input software test, not real-device QA.

## 11:49 Nov 17
- Added 출전 기회와 신뢰 from detailed stats: exact existing overall or coach/captain/team average thresholds, shortfall, progress bars, current candidate/regular status. Shared selectionStatus helper now drives actual isRegular and screen;300 comparisons across years preserve existing rules. No difficulty/guide/motion change. Portrait UI inspected, next live verification. Purpose: make relationship choices' link to playing opportunities visible, not invent new selection mechanics.

## 12:10 Nov 17
- Added one-time home card + durable log when candidate/regular status changes. Baseline old/new saves silently on first home, no false promotion. Actual same selection rules; year-threshold demotion supported. Logic baseline/promotion/repeat/year-demotion/JSON tests passed; synthetic trust threshold via actual home render plus reload verified one log only. Portrait card layout inspected. Does not pause gameplay with modal; motion/difficulty/guide unchanged.

## 12:30 Nov 17
- Added compact command-only actual resource/evaluation chips under weekly home report: condition, money, study, toughness, coach/captain/team/scout. Captures command execution before weekly recovery, match or event so label explicitly excludes these; no rewards or risk/RNG change. Old saves start next command; latest data survives JSON save, while result chips only appear on the immediate weekly result screen. Batter/pitcher cap/ban/hospital/week recovery tests and actual 잡무 button -> next week -> reload passed. Portrait checked with simultaneous promotion notice; controls fit. No batting/guide/motion changes.

## 12:51 Nov 17
- Added 2 once-per-run selection-status scenarios: regular player's preparation vs team gratitude; candidate after week16 choosing fundamentals vs team trust. Eligibility uses existing isRegular, supports batter/pitcher; existing24% event gate unchanged, neither is guaranteed immediately after status change. Both positions/status/min-week/once/JSON/year-threshold tests passed plus prior win/loss scenarios. Actual weekly button -> regular event -> choice -> reload saved history passed with synthetic state/fixed RNG. Portrait inspected. No hitting/guide/motion changes; full balance deferred.

## 13:12 Nov 17
- Direct pitching now explicitly colors player pitcher +8 fielders with current-year team shirts and opponent batter with selected opponent palette, instead of inheriting batting/home scene colors. Also corrected HUD's always-starting-pitcher label to 선발/구원 from existing selection rule. Local actual creation->weekly command->direct pitching tests for years1/2/3 and regular/candidate passed, inspecting shirt materials; portrait pixels show orange third-year player vs teal opponent and 구원 label. Fielders behind pitching camera verified by material values, not claimed legible in normal view. No probabilities/motion/controls changed.

## 13:33 Nov 17
- Corrected extra defensive fielder:7 fielders (4 infield+3 outfield) plus pitcher/catcher, instead of8. Positions are stylized game placements, not measured real-world defense. Added slight forward lean/glove-ready arm pose and consistent restoration after foul/flight. Actual forced foul->next pitch checks7 home positions/ready limbs restored; close and overhead rendered pixels inspected. Pitching team uniform regression passed with7 fielders. Existing test still reports2 resource404s (not identified/fixed here), no JS error. No hit probability/acceptance/camera change, no actual catching/throwing implementation.

## 13:53 Nov 17
- Tried procedural glove fingers/rim/pocket on existing hand anchor, purchase->reload retained gold color. Close-camera pixels still looked like a round disk with fingers on the side, not a convincing glove; rejected and fully restored scene.js/dist to9644a22. docs/live unchanged. Need glove palm orientation/shape rather than cosmetic overlays. Screenshot retained for rejected-test evidence, no shipped improvement claimed.

## 14:14 Nov 17
- Identified both repeated match-resource404s: same /favicon.ico requested twice, not two missing game assets in this tested path. Added original SVG baseball browser icon with relative link. Local title->creation->training->direct forced foul->following pitch flow now logs no HTTP>=400/request failures/JS errors. Icon pixels checked at128x128. Scoped smoke only, not all-resource/device QA; no gameplay changes. Glove experiment remains reverted.

## 14:34 Nov 17
- Position-safe shop: pitcher no longer sees/can purchase batting-only bat. Meal keeps existing stamina+1 for pitcher without writing nonexistent power (previously NaN/null); pitcher text says 체력+1, batter keeps power+1/stamina+1. Prices unchanged, no added pitching stat bonus. Invalid/unavailable item IDs return safely before spending. Both-position item/effect/cost/JSON/finite tests passed; actual pitcher meal purchase->reload stamina31/money40 and batter bat purchase->reload regressions passed. Portrait shop inspected. Existing malformed optional fields in old saves are not migrated; new purchases stop introducing them.

## 14:56 Nov 17
- Replaced Kenney hand's sphere glove with original extruded palm/thumb/finger silhouette and double-sided pocket seam; not the rejected sphere-overlay experiment. Existing material ownership remains so bought gold glove uses same shape as default brown. Actual pitcher creation->shop glove->reload money/gear/color->direct pitching entry passed; close purchased glove, brown fielder and normal pitching-view pixels checked. Close proof uses separate camera; normal camera/poses unchanged. Geometry-only, no catch/throw logic or gameplay changes. Detailed fingers/hand fit and real-device GPU checks still late QA.

## 15:16 Nov 17
- Shop purchase result now shows actual capped stat/condition changes and actual game-currency cost, plus equipment/insurance/cured-trait outcome chips, instead of repeating nominal product description as achieved gain. Product descriptions/prices remain unchanged. Failed purchase clears last report to avoid stale success chips. Batter/pitcher cap/gear/cure/insurance/failure/JSON logic tests passed; actual drink at condition98 ->99 costs20 and reload retains99/80, pitcher shop regression passed. Portrait result fits390x844. No balance/gameplay changes; report itself is not replayed on reopen, saved values persist.

## 15:37 Nov 17
- Added 학업과 다음 시험 from detailed stats: next actual exam date/weeks, current study vs shared execution threshold, shortfall, current practice ban and exact existing failure/post-exam costs. Shared examNeed used by endWeek so no duplicated drifting formula. Tests across both positions/years/before-after exam/graduation/pass-fail boundary passed; year2 pre-exam shortage portrait inspected. No test threshold/penalty/probability change. Does not promise future pass if events change study.
