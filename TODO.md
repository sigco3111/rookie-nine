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

## 15:58 Nov 17
- Practice-ban UI now disables banned training commands with 연습 금지 중 label instead of allowing an effectless click to spend a week. Refresh/rest/study/alba/shop stay available as existing engine rules allow; ban duration/penalties unchanged. Actual blocked click consumes no week, study advances week and ban3->2, reload retains disabled state, expiry reenables commands tested. Portrait pixels inspected. Engine fallback for invalid callers unchanged; no hitting/guide/motion changes.

## 16:19 Nov 17
- Replaced undersized flat shoe attachment with rounded full-foot sized mesh, preserving foot anchors and color material; actual meshes now stored in shoes array. Runner now receives owned-shoe red color on match entry as batter already did. Local actual pitcher shop shoes->reload red footwear close render passed; actual direct hit->runner close render shows both red shoes, no JS/HTTP errors. Synthetic gear/forced homer/fixed dt and close cameras, not natural timing/device QA. Simple rounded footwear, not finished laces/sole detail; hand/swing timing untouched.

## 16:40 Nov 17
- Event result now keeps scenario title/chosen response beside actual capped deltas, explicit zero-delta text and record location. Saves unconfirmed result+weekly messages; Continue after reload resumes the same result without rolling/applying it again. Confirmation clears pending state, subsequent reload opens home. Both batter/pitcher actual weekly command->event choice->reload->confirm->reload passed, including capped100 evaluation/99 condition zero case. Synthetic state/fixed RNG, not natural long-run balance/device QA. Portrait pixels inspected; difficulty/guide/motion and event rewards/chances unchanged.

## 16:59 Nov 17
- Added two one-time followups to regular_resolve: coach-preparation choice opens preparation-note training/rest; teammate-thanks choice opens returned support with joint defense practice/social rest. Minimum week32; no current regular requirement, no repeated grant. Uses existing req/reqChoice eligibility and24% overall event gate, changes eligible pool composition only; rewards are small field/relationship/condition choices and no position-only stats. Both positions/prerequisite/min/once/JSON/effect-finite tests plus prior selection tests passed. Actual weekly command->branch event->choice->reload passed with prerequisite state/fixed RNG injected; portrait inspected. Not a guaranteed next event; detailed balance remains deferred. Hitting/guide/swing untouched.

## 17:21 Nov 17
- Centralized equipment appearance assignment for home/batter/runner/pitcher. Direct pitching explicitly applies current player's gloves/shoes and resets opponent bat/shoes; direct batting resets opponent pitcher gear. Prevents reused scene actors from inheriting former player's purchased colors across title/new-position flow and stops reliance on a previous home render. Same-session owned batter->new pitcher->direct entry test asserts own gold glove/red shoes, opponent default wood bat/black shoes; year3 team palette intact. Runner regression passed. Close-camera and normal portrait pixels inspected. Test gear/week values injected, not full purchases or device QA. Geometry/prices/stats/batting acceptance unchanged.

## 17:42 Nov 17
- Direct batting flight/base-running now hides/disables SWING and batting instruction; timing guide remains hidden. Phase chip says 타구 비행/베이스 러닝 instead of stale pitch speed; next pitch restores button/hint/guide and pitch label. Existing no-input phase made explicit, no swing timing/acceptance/physics changed. Actual forced homer->flight->run->next-pitch test passed with hidden/disabled controls and restored guide; portrait pixels inspected. Uses fixed dt/forced hit/synthetic regular status, not human or device QA. Does not add catches/throws.

## 18:02 Nov 17
- Year/team palette now updates cap/helmet dark shade along with shirt, using tagged cap material. Previously pitcher kept red cap and batter blue helmet despite teal/orange or opponent shirt. Shared setShirt covers home/batting/runner/pitching/fielders without touching logo/skin/hair/gear. Both positions years1/2/3 cap colors checked and close pixels inspected; direct pitching verifies own/opponent/7fielder hat shade vs shirt plus prior gear ownership. Synthetic year/gear values, not natural3-year/device QA. Batting mechanics untouched.

## 18:24 Nov 17
- Direct pitching now moves nearest fielder toward hit landing area during flight instead of leaving all7 stationary; shared pursuit with batting uses reaction .18s/speed7, target radius capped91 inside stylized95 fence. Arms retain ready-pose baseline while running, stops return ready limbs. Explicit full reset on pitching entry and flight completion. No collision/catch/throw or outcome probability change. Local actual pitching throw->hit->fielder displacement>1.5->all7 home/legs reset passed; prior batting foul->next pitch reset regression passed. Close render inspected (synthetic RNG/year/fixed dt, not full device or natural balance QA). First test clicked before throw readiness, timed out; test now waits for aim instruction before click. No release claim from failed test.

## 18:43 Nov 17
- Direct pitching controls now reflect real input state: disabled 준비 중 before throw-wait and during windup/pitch, enabled 던지기 only when callback armed, picker/hint hidden during hit flight, restored for next throw. Prevents misleading live-looking button before actual readiness and pitch-type change while ball already in motion. Flight chip says 타구 비행. Actual throw->locked->flight hidden->allfielders reset->next enabled test passed; portrait flight/ready pixels inspected. Fixed RNG/time/gear/year values, not device QA. No pitch probabilities, stat effects or batting changes.

## 19:04 Nov 17
- Unchosen event now saves exact scenario and weekly messages before displaying choices; Continue resumes same choice without rerolling gate/scenario or applying rewards. Selecting clears pending choice and atomically saves existing pending result. Both positions choice screen->reload->same text/state/no early counter->choose->result reload->confirm->home reload passed, plus capped-zero case. Portrait inspected. Synthetic week/evaluation/RNG setup, not full lifecycle/device QA. Choice RNG success remains evaluated once at selection as before; no persistent random-seed guarantee for outcome manipulation. Does not yet recover unshown annual-review/trait/match prompts.

## 19:25 Nov 17
- Annual review now remains pending/saved until confirmation and Continue restores it. Retains weekly messages; confirmation clears/saves before following event selection so no repeated week or snapshot computation. Corrected first-year comparison label to 입학 rather than 작년; other years 전 학년. Zero stat delta says no change rather than no comparison data. Both positions year1/year2 boundary via actual rest command->review->reload identical state/text->confirm->reload home passed. Injected boundary weeks/field+5/RNG, not full natural years; portrait inspected. Other interruption surfaces remain open. Growth snapshot rules, batting mechanics and rewards unchanged.

## 19:45 Nov 17
- Trait acquisition notification now saves pending learned IDs/messages and restores on Continue before annual review; confirmation clears without granting again, then resumes review/event/home. Explicitly states ability already applied. Both positions ordinary week/year boundary rest->actual acquired trait->reload identical state/text->confirm->review reload/confirm->home reload verified single trait, no repeated week. Threshold/counter/RNG injected, not natural earning/device QA. Portrait inspected. Acquisition35%/conditions/trait effects and batting rules unchanged. Match prompts/mid-match recovery remain separate.

## 20:06 Nov 17
- Match selection now persists exact match, weekly messages, prior traits and pre-result evaluation snapshot. Continue restores prompt without reapplying training or skipping the match. Starting direct play marks interruption; reload returns to prematch selection with explicit warning that pitches/at-bats/score are not restored. This is a prematch checkpoint, not mid-game resumption. Result atomically replaces pending match and uses existing result restore/finalization. Batter/pitcher actual command->same prompt after reload->direct match entry->reload prematch exact stats->auto result->reload same result->one game/week->home reload passed. Portrait warning/buttons inspected. Synthetic week/evaluation/RNG, not full device/long-run QA. No match probabilities, rewards, batting mechanics change. Test owns and awaits local Vite server shutdown.

## 20:26 Nov 17
- Added two once-only bench-choice followups from week36: choosing fundamentals leads to shared defense practice/recovery plan; choosing team help leads to coach positioning review/shared preparation and rest. No ongoing candidate-status lock, so earlier choices can matter after promotion. Existing req/reqChoice gate and24% event chance unchanged; eligible pool expands, small field/trust/condition/will rewards affect balance. Both positions prerequisites/opposite exclusion/week35-36/after promotion/once/JSON/finite choices passed. Actual rest->support event->choice->result reload saved history passed with prerequisite/week/RNG injection; portrait choice pixels inspected. Not guaranteed next event, natural pacing/balance/device QA deferred. Batting mechanics unchanged.

## 20:47 Nov 17
- Followup event choices/results/history now show the prerequisite story and, only when reqChoice proves it, the exact earlier selected response. Makes growth-choice chains visible without exposing future unencountered events. Shared eventOrigin validates saved prerequisite counter/choice; req-only stories name the earlier encounter without inventing its selection. New result/history snapshot persists origin; old history remains as recorded, no retroactive guess. Both positions/all9 prerequisite stories/missing or contradictory records/result JSON tests plus earlier branch regressions passed. Actual rest->choice origin->result->reload->history origin UI test passed; choice/history portrait pixels inspected. Controlled week/history/RNG, not natural pacing/device QA. Rewards/gates/batting unchanged.

## 21:08 Nov 17
- Shared defense flight movement now sends a second distinct fielder behind the landing target as visual backup, while nearest keeps existing pursuit speed7/reaction. Backup delay.35/speed5.5, target8 behind landing direction and radius capped91. Pure defense path/step module covers distinct roles, fence bounds, reaction/speed limits, arrival stop, no/one fielder. Actual pitching forced hit checks exactly2 fielders move>1.5, then all7 positions/legs reset. Separate wide render inspected showing both moving fielders; special camera is evidence only, not gameplay camera. Fixed RNG/dt/week/gear, not natural full-game/device QA. No catch/throw/collision/outcome logic or probabilities added; cosmetic coverage only. Shared by batting/pitching. Detailed tactics and actual catch/throw remain.

## 21:30 Nov 17
- Kenney-rig footwear now has shared low-poly pale sole trim and three simple lace bars per shoe, upper slightly flatter. Keeps same foot anchors and gear-color assignment for player/runner/fielders; no borrowed new assets. Initial sole/lace placement was hidden by field/pants, corrected after pixel inspection. Final close evidence shows front/side pale trim and exposed laces, with rear lace partly under pants; stylized not detailed cleats. Actual pitcher shoes purchase->reload red uppers/money920 and2sole/6lace geometry passed. Separate static stance/close camera for detail proof only, no gameplay camera/motion change. More GPU objects per rig, shared geometries/material; device performance QA deferred. No stat/price/batting change.

## 21:50 Nov 17
- Title now offers saved graduation/draft result reopening instead of hiding Continue for all done players. Uses existing saved result, retains last-week pending trait notice before ending, no draft reroll/HOF append. Ending pitcher summary now shows innings/strikeouts rather than batter home runs. Both positions with/without last-week earned trait, actual final rest->ending/trait reload->two result reloads exact text/state/one HOF->new player week0 passed. Initial test wrongly shared storage across cases and counted earlier player HOF; corrected isolated contexts, all4 passed. Portrait pitcher result inspected. Boundary week/stats/RNG injected, not natural3year/device QA. Does not make older overwritten saves recoverable; draft rules/batting unchanged.

## 22:10 Nov 17
- Added 상세 능력 -> 내 장비와 유니폼 read-only screen, showing current year shirt palette and actual stored default/purchased bat/glove/shoes colors. Pitcher omits batting-only bat. Explains automatic look, scene-dependent visible gear and purchased stat gains already included, no extra view bonus. No equip toggles or invented upgrade multipliers. Both positions defaults, actual game-currency purchases/reload,3year palette text and state byte-equivalent before/after view passed. Portrait batter loaded3gear screen inspected. Year injection not natural3year/device QA. Visual gear meshes/prices/stats/batting unchanged.

## 22:30 Nov 17
- Added 상세 능력 -> 지명 목표와 현재 평가: read-only current draft score/components, minimum54 shortfall, rank thresholds, explicit not-final and graduation-time/random club/rank caveats. Shares exact original draft formula with actual finish, no new scoring bonus; honestly notes pitcher uses same existing categories including HR. Score display floors at2decimals and shortfall rounds upward so rounding cannot claim a threshold crossed.300 exact original/new/actualfinish comparisons both positions and54/64/74/82 boundaries passed. Both-position UI values/caveats/no-state-mutation/reload passed; portrait inspected. Synthetic week/evaluation/wins, not natural long-term/device QA. Draft/batting balance unchanged.

## 22:52 Nov 17
- Event choices now preview successful and, below100% chance, failed numeric effects before selection. Uses existing applyFx on shallow player+separate eval copy, filters nonexistent position stats and capped-zero changes, money floor included; no RNG consumed/state mutation. Shows current capped expectation, not nominal promise; no-change explicit.544 preview-vs-actual outcome checks across both positions/allchoices/caps/lowmoney passed. Actual branch->choice/result/history/reload flow plus injected saved rival choice success/failure preview passed. Both regular and risk portrait pixels inspected. No gate/chance/effect/batting rule change, but previously hidden numeric tradeoffs now visible. Full UI/device cases deferred.

## 23:12 Nov 17
- Direct-pitching catcher now receives same current-year shirt/cap palette as player pitcher/fielders on every entry; previously stayed generic dark gray despite changing years. Applies teammate default glove/shoes, never player's purchased colors, ump black unchanged. Same-session new pitcher year1/2/3 direct-entry tests assert catcher shirt/cap vs pitcher, ump black, brown default catcher glove while player owns gold/red. Separate rear-side close render inspected: orange catcher vs teal opponent and black ump; initial front angle hid catcher and was replaced. Camera is test evidence only. No pose/protective mask/catch/throw/physics/stat/batting changes; year/gear/RNG injected, not natural3year/device QA.

## 23:33 Nov 17
- Hall of fame now saves new graduates' position-specific career snapshot (pitcher innings/K/hitsAllowed, batter AB/H/HR/RBI, both W/L) and labels stats instead of ambiguous slash values and universal HR. Old pitcher entries explicitly say detailed stats were not saved, never invent zero Ks; older batter HR retained. Readable cards with scroll and close. Both-position final rest->result2reload->HOF saved career->legacy no-career case->new-player inheritance list preserved passed. Existing300 draft comparisons passed. Initial UI test had omitted pos callback argument, fixed then rerun. Portrait inspected. Boundary/stats/legacy injected, not natural3year/device QA. HOF inheritance fields/draft/batting rules unchanged.

## 23:53 Nov 17
- Player creation now previews selected HOF mentor's exact existing all-stat/will/coach bonus and inherited first trait, updates on position change, explicitly no-trait for cross-position or empty-trait mentors. Shared inheritanceInfo used by preview and actual entry; no bonus formula changes. Dropdown labels mentor position as well as overall. Controlled HOF85 batter -> same-position +6/avg preview -> pitcher cross-position no-trait warning -> batter create exact meet48/will35/coach36/avg ->reload no repeat passed. Portrait inspected, synthetic predecessor not natural3year/device QA. No HOF record mutation, stat-price/batting rules unchanged.

## 00:14 Nov 18
- Added read-only training mastery screen under detailed stats, per-position counts/current level/shared actual multiplier/progress to7 or16 and max-level state. Explains next-training application, successful execution counts only, condition/traits/random gains and refresh recovery exception. Actual training reads same exported mastery multiplier, no formula/threshold change. Both-position practice boundary/no-mutation tests and actual basic6->7 unlock Lv2/1.3x UI passed; injury/ban do not increment. Portrait390x844 inspected (scrolling list + fixed explanation/back). Injected counters/RNG, not natural3year/device QA. Batting/ability rewards unchanged.

## 00:34 Nov 18
- Added2 once-only followups to after_loss_review choices from week44: team review->play notebook defense/coach plan; recovery->light fundamentals/shared recovery. Respects exact prerequisite choice, available even after later wins, no requirement for a still-recent loss. Existing24% event gate unchanged but eligible story pool expands with modest stat/trust/condition tradeoffs. Both positions/prerequisite/opposite exclusion/week43-44/once/JSON/effects and all event-origin regression passed. Actual rest->recovery followup->choice->result reload/history passed; portrait choice with origin and capped effect previews inspected. Week/prerequisite/RNG injected, not natural pacing/long-run balance/device QA. No batting changes.

## 00:55 Nov 18
- Hospital home now disables training/rest/alba/study controls with treatment-needed labels, instead of clickable unrelated commands silently advancing treatment. Dedicated readable treatment button shows remaining weeks transition and immediate capped+6 condition (excludes existing weekend recovery). Shopping remains available as before, its weekly exit explicitly says treatment when hospitalized. No simulation changes. Both positions locked-click state equality/shopping accessible/relabel/treatment2->1/reload/discharge1->0/controls unlock passed, portraits inspected after increasing treatment text. Synthetic injury/RNG, not natural injury or device QA. Training/batting/injury rates/recovery rules unchanged.

## 01:16 Nov 18
- Weekly command report now saves stat deltas with player instead of global lastDiff, fixing stale prior-player highlights and lost highlights on reload. Home report persists after Continue with original command calendar date, immediate-only/excludes weekend-match-event label; ending has no stray command highlights. Added omitted will delta (mental/alba) to report, no growth calculation change. Both-position mental actual report/reload equality/new-player no stale highlights passed; batter stat delta restored, pitcher has no invented meet delta. Initial test expected will3 but actual existing condition/RNG gives4, corrected assertion and reran. Portrait390x844 inspected; fixed RNG not natural/device QA. Legacy reports without stored stat deltas not backfilled.

## 01:36 Nov 18
- Event results/history now preserve selected chance in snapshot; history shows explicit success/failure badges and capped-zero no-stat-change label instead of ambiguous blank chips. Result says original selection chance/already finalized, old history with absent chance says not saved rather than infer from current data. No probability/reward changes. Both positions success/failure JSON snapshots and read-only restored history/UI legacy/zero case passed;560 effect-preview comparisons and origin regression passed. Portrait inspected. Synthetic event/RNG/history, not natural run/device QA.

## 01:58 Nov 18
- Shop now previews exact capped immediate stat/condition/cure/insurance effects per item before spending game currency, with owned-look/insurance-nonstack/insufficient-funds notes. Clone isolates traits/gear, no preview mutation; existing prices/rebuy/effect rules unchanged. Scrollable items keep exit/week controls visible, smaller exit text avoids awkward wrapping.26 both-position all-item/capped/owned/insurance/cure preview-vs-actual checks and UI capped98glove->99/+1->reopen0effect/purchase-save passed. Portrait inspected, synthetic money/stats/gear not full natural/device QA. No real purchase or batting change.

## 02:18 Nov 18
- Cosmetic fielder arrival polish: pursuit and backup running swing tapers within last3 distance units, settled fielders turn toward plate and return ready legs instead of keeping travel heading. Path speeds/reaction/landing/range unchanged; no catch/throw/collision/outcome change. Pure path remaining0/arrival regression passed; actual pitching two-moving/all7reset passed, separate controlled arrival t100 close render inspected for2ready fielders facing plate. Camera/time/target injection only test evidence, no gameplay camera change/natural-device claim. Shared batting/pitching pursuit.

## 02:38 Nov 18
- Added2 one-time second-year followups to after_win_review choice from week52: shared celebration memory->team defense/rest, opponent analysis->practice/shared key notes. Exact earlier choice needed; later losses do not erase unlocked story. Existing24% gate unchanged, story pool/low stat+trust+condition tradeoffs expand; pacing/balance deferred. Both-position prerequisites/opposite exclusion/week51-52/once/JSON/effects plus all origin and576 preview comparisons passed. Actual rest->analysis followup->choice/result-reload/history passed, portrait inspected. Synthetic week/prerequisite/RNG not natural3year/device QA, no batting change.

## 02:59 Nov 18
- Match history now saves and displays exact capped post-match evaluation/condition deltas for new matches, including defense-trait effects, via common applyMatchResult wrapper for direct/auto both positions. Clearly excludes training/weekend/event; absent legacy delta says not saved. Match reward calculation unchanged. Both-position capped/uncapped/defense-trait result-vs-state/history JSON checks and actual auto-game->result-delta=history->confirm/reload->UI passed. Portrait pitching history inspected. Week/RNG injection not natural3year/direct-fullgame/device QA. No batting or reward rebalance.

## 03:20 Nov 18
- Added detailed stats -> past school-year growth summaries; new year1/2 boundary snapshots preserved independently before pending-review confirmation, per-year dedupe/max2, original overall comparison and ability deltas. Empty/older saves explicit no stored summaries, no inferred reconstruction. Both positions boundary snapshot vs review/independent deep copy/JSON and actual two boundary rest->reviews confirmed->reload archive read-only UI passed, portrait inspected. Boundary/week/field+5/RNG injection, not natural3year/device QA. Existing review/growth/batting rules unchanged; graduation separate.

## 03:41 Nov 18
- Home background now runs full shared resetDefense for all7 fielders, not just position: removes stale running arms/legs/travel headings from an interrupted/reused scene. Batter-home fielders also reset to same default red as background opponent pitcher rather than former pitching-team colors. Hidden pitcher-home fielders still reset. Both-position forced stale transforms->home positions/limbs/visibility/color assertions passed; normal portrait and separate close render inspected. Synthetic pose/color injection not natural full-match/device QA; gameplay camera and match outcomes unchanged. Initial test syntax corrected before running.

## 04:02 Nov 18
- Selection status screen now shows all3 years' exact regular-player thresholds and current-year marker, explaining either overall OR trust condition and re-evaluation after promotion. Common selectionRequirements feeds real eligibility and table, unchanged34/42,46/54,56/64 rules. Both positions3year/trust boundary and read-only year2 UI tests passed, portrait inspected. Initial boundary test forgot pitcher can already qualify on overall; lowered test-only abilities to isolate trust then passed. Synthetic year/abilities not natural progression/device QA. No rewards or batting changes.

## 04:22 Nov 18
- Added2 one-time academic-choice followups from week60: prior exam_help study->shared/personal notes, training-first->short study plan/friend help. Exact prior choices, no guaranteed next event/automatic exam pass. Existing24% event gate unchanged; pool and modest study/trust/will/condition tradeoffs expand. Both positions prerequisites/opposite/week59-60/once/JSON/finite effects, origin regression and592 preview comparisons passed. Actual rest->training-first followup->choice/result-reload/history passed, portrait inspected. Week/prereq/RNG injection not natural pacing/3year/device QA. Exam threshold/ban duration/batting unchanged.

## 04:43 Nov 18
- Growth-goal screen now toggles nearest3/all eligible unlearned special traits, letting user plan beyond top3. Same existing traitGoals/requirements/order/35% explanation; position-only invalid traits remain filtered. Scrollable list keeps mode/back visible. Both-position actual UI nearest->all->nearest state byte-equality and pitcher no batter trait passed, portrait inspected. No learned traits/threshold/reward/batting changes; not natural earning/device QA.

## 05:04 Nov 18
- Extended year summaries to show current-year live growth against existing start/year-review baseline above archived cards; detail entry renamed school-year growth review. Pure currentYearGrowth does not alter snapshot or archive; graduation separate/finished players omit live card, no missing-baseline inference. Both positions no-mutation/current diffs/year-reset/archive separation tests and UI two reviews->reload->current+3 vs archived+5 passed. Portrait inspected. Synthetic boundary/week/stats/RNG not natural3year/device QA; baseline/rewards/batting unchanged.

## 05:24 Nov 18
- Added two final-year coach-choice followups from week100: prior pro ambition -> personal preparation/recovery plan, prior team contribution -> mentoring/shared preparation. Exact prior choice and once-per-followup; no forced occurrence/draft promise/role guarantee. Existing24% gate unchanged but eligible pool and modest growth/trust/condition tradeoffs expand. Both-position prerequisites/opposite/week99-100/once/JSON/effects, all origins and608 previews-vs-effects passed. Actual rest->team branch->result->reload history passed;390x844 choice portrait inspected. Week/prerequisite/RNG injection, not natural pacing/3year/device QA; batting/draft/selection unchanged.

## 05:45 Nov 18
- Added bat grip sleeve, five wrap rings and end knob to the active character model. Dark grip retains its own color for wood and purchased gold bat; body geometry/scale/anchor untouched. Cosmetic only, no swing/timing/contact/reward changes. Actual shop->save->reload checked gold body, independent grip, all7parts and original body dimensions; direct-match swing smoke passed. Wood/gold close renders inspected. First test used nonexistent #swing selector; corrected to real .swing pointer handler and passed. Close camera is test evidence only, gameplay camera unchanged. No natural fullgame/device/performance claim.

## 06:05 Nov 18
- Event results and saved choice history now show exact selected-effect before->after values alongside deltas. Snapshot only the applied numeric keys, including capped and position-filtered effects; old saves omit comparison rather than infer current state. Both positions all events/choices/success-failure/caps/low-money exact-state/JSON and608 preview regression passed. Actual followup->result->reload identical->history after current-stat change passed; portrait inspected. No probability/reward/selection/batting change. Week/prereq/RNG controlled, not natural3year/device QA.

## 06:26 Nov 18
- Added position-specific form-change followups from week76: pitcher p_form change->release practice/recovery notes; batter senior change->basic swing/recovery notes. Exact prior change choice and position; both prior success/failure allowed with outcome-neutral wording, no invented prior success. Each once-only. Both-position opposite-choice/position/week75-76/once/save/origin tests and624 preview regression passed. Actual both-position rest->followup->result->reload->history passed; pitching portrait inspected. Existing24% gate unchanged, eligible pool/modest stats-trust-condition tradeoffs expand; not natural pacing/3year/device/balance QA. No actual swing/pitch animation or difficulty change.

## 06:47 Nov 18
- Equipment screen now shows all3 school-year uniform shirt icons together with current-year border/label and auto-promotion explanation. Shared UNIFORMS data drives actual3D and UI instead of duplicate hex arrays; colors/rules unchanged. Both positions years1/2/3 preview-color=active3D-shirt, no player mutation, return controls passed;390x844 portrait inspected. Year injected not natural progression/device QA. Icons are illustrative, not new3D jersey geometry; no rewards/batting change.

## 07:07 Nov 18
- Final-year growth now captured at graduation separately from existing year1/2 archives, viewable from ending via school-year history with return-to-ending. Ending reload preserves year3 snapshot; old endings without snapshot not reconstructed. No extra HOF insertion on viewing. Both-position graduation capture/JSON/archive independence and actual two boundary reviews->final rest->ending/reload->read-only history/back passed; portrait inspected. Week/stats/RNG injected not natural3year/device QA. Draft score/rank/rewards/batting unchanged; final archive lives in career save, not HOF record.

## 07:29 Nov 18
- New graduates copy independent year1/2/3 reviews into HOF; per-entry growth-history button works after new career and fresh title reload with no active player. Old HOF explicitly says not stored, no reconstruction. Archive uses shared read-only card view and returns HOF. Both-position detached career/JSON checks and actual two reviews->graduate->new career->fresh reload->HOF archive/back passed, final-year UI regression passed. First test compared new career to old one, fixed snapshot placement before archive read; passed. Portrait inspected. Week/stat/RNG injection, not natural3year/device QA. No extra HOF entries on read, inheritance/draft/rewards/batting unchanged.

## 07:50 Nov 18
- Choice history can toggle recent12/all saved30, exposing older already-stored decisions with explicit30 cap and no lost-record reconstruction. No storage limit/order/probability/reward changes. Both positions34 controlled resolutions of existing general events->save/reload->latest12/all30/newest-oldest dates/toggle while scrolled/back/state equality passed, before-after result regression passed. Portrait inspected. Forced event sequence and dates not natural eligible pacing/3year/device QA; no batting changes.

## 08:09 Nov 18
- Added final-year camp accept/decline followups from week108: shared stamina/recovery planning vs individual defense/shared preparation. Exact prior choice; accepted camp success/failure wording neutral, each once-only. Both positions/opposite choice/week107-108/JSON/once/effects and640 preview/origin regression passed. Actual rest->decline followup->result/reload/history passed; portrait inspected. Existing24% event gate unchanged but eligible story pool/tradeoffs expand, long-run balance deferred. Week/prereq/RNG controlled not natural3year/device QA; no batting changes.

## 08:31 Nov 18
- Cosmetic defensive attention: all7 fielders turn head horizontally toward projected landing point after reaction delay, max0.6rad local yaw; resetDefense/home clears old head pose too. Two pursuit paths/speeds/arrival/outcomes unchanged, no catch/throw added. Angle wrap/bounds/near-target pure tests and both-position stale-head home reset passed; actual pitching fly->two moving/head attention bound->all7 reset passed. Close render inspected; test-only camera/time/RNG, not gameplay camera change or natural/device QA. Batting/rewards unchanged.

## 08:51 Nov 18
- Recent-match history toggles latest8/all saved20 with explicit retention limit/no reconstruction. Existing dates/order/growth deltas unchanged. Both positions24 simulated games->saved20cap/reload/latest8/all20/date endpoints/scroll toggle/back/read-only passed,390x844 pitching portrait inspected. Initial test used wrong helper name autoMatch, corrected to existing simulateMatch and passed. Forced weeks/RNG and simulated results, not full direct/natural3year/device QA. Match outcomes/rewards/batting unchanged.

## 09:12 Nov 18
- Added latest12 weekly action history storing command name/date/messages and independent exact command-only stat/resource deltas at execution. Detail screen reopens after reload; hospital treatment labeled, old actions not inferred. Both-position12cap/dates/labels/copy/JSON/treatment and actual mental->week->reload->history/read-only/back passed; portrait inspected. Immediate command only, excludes match/weekend/event and individual shop purchase (existing separate report). RNG/will injected, not natural3year/device QA. Growth/reward/batting calculations unchanged.
