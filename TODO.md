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

## 09:29 Nov 18 - core ground-out fielding
- Both direct batting ground-outs and pitching in-play outs now wait for nearest-fielder approach, ground-ball pickup/transfer, throw to a separate 1B receiver and glove reception before advancing the result/out count. Ball follows world-space glove/hand positions; runner visible on batting ground-outs; fielders/pitcher reset after completion. Pitcher clears nearby pickup space.
- Existing hit/out probabilities and easy batting window unchanged. Pitching generic in-play outs currently use this ground-ball presentation. Not physics/race-driven hit/out simulation; air catches, error/throw races, hit retrieval and double plays remain.
- Deterministic plan/phase tests, pursuit regression, pitcher count-after-reception and batter full1PA/reset tests passed. Local 390x844 actual pixels inspected for pickup/throw/reception, not physical-device QA. Late detailed balance/device tests retained.

## 09:38 Nov 18 - air-out glove reception
- Preselected batting line/fly/pop outs now let the nearest fielder travel to the catch point at <=7 world units/s after reaction delay. Flight duration extends for travel; final ball path reaches that fielder's actual glove, then holds before result progression. Pitching in-play out visuals now split ground/air using the already-generated visual distance, without extra random calls or changed outcome odds. Air out count waits for reception/hold. Nearby pitcher clears catch space and restores.
- Plan travel/endpoint/no-mutation tests, batting line15/fly35/pop65 full1PA+reset tests, pitching count-after-glove test, both groundout regressions passed. 390x844 actual local game-camera flight/catch frames inspected. Existing easy batting unchanged. Still preselected outcomes, not catch success/failure simulation; hit retrieval/errors/races/double plays and late detailed QA remain.

## 10:09 Nov 18 - hit recovery and infield relay
- Non-HR hits in both direct roles now keep the ball live for nearest-fielder retrieval, pickup/transfer, throw back to a separate receiver at 2B and glove reception before the existing hit/runner flow. The return target is explicit and separate from the existing 1B out completion. Ball settles to ground level during approach; fielders/pitcher restore afterward. HR/foul do not enter recovery. Hit/out probabilities and easy batting unchanged.
- Batter direct1PA 1hit full result/reset and pitcher recovery/no-out/next-pitch tests passed locally; relay target/receiver and air/defense pure regressions passed. Groundout pitcher regression passed after faster deterministic test clock/less narrow capture trigger (earlier capture timeout, not game error). Actual 390x844 game-camera relay/reception inspected. Existing runner sequence starts after recovery, not simultaneous safe/out race simulation; returns currently go to2B for all non-HR hits. Detailed balance/device QA deferred.

## 10:21 Nov 18 - concurrent hit baserunning
- Batter singles/doubles now run to the selected hit base while fielders retrieve/relay the ball, rather than waiting for the relay then starting a second runner sequence. Double runner turns at1B and continues2B; runner reaches selected base before completion and stops leg motion. Relay receiver waits beside2B (3,-41.8) rather than overlapping the runner on the bag. Wider temporary game camera frames runner and relay, then restores FOV. HR loop unchanged; pitcher recovery remains no-out.
- Pure single/double route/turn/end clamp tests, actual single and double direct1PA/concurrent-visible runner/base endpoint/all7reset tests passed, plus pitcher no-out recovery and defense plan regressions. Local actual portrait double throw/reception inspected; first high camera had heavy fog, replaced with closer65-degree view and rechecked. Results still preselected and run time fitted to visual play, not speed-driven safe/out simulation. Late detailed balance/device QA remains.
- Live single/double concurrency/base endpoint/FOV restoration passed on index-BJVd2Jfn.js. Initial verification wrongly expected desktop50 FOV; portrait source sets62. Corrected test to compare captured original FOV and reran both live cases successfully. Game code unchanged by this test correction.

## 10:43 Nov 18 - opponent baserunning during pitching defense
- Direct pitching non-HR hits now show the opponent batter-runner advancing concurrently with field recovery/relay: single1B, double via1B to2B, triple via1B/2B to3B. Opponent groundouts also show the batter-runner while the throw reaches1B first. Opponent shirt/cap matches batter and owned equipment is cleared; scene restores batter/runner after completion.
- Shared hit camera now centered with76-degree view to include3B in portrait. First triple image cropped3B, fixed and inspected actual game-camera pickup/reception. Groundout and single/double/triple pitching phase/count/route tests passed; minified candidate double/triple tests passed. Runner pure route/clamp, ground plan, batting direct1PA double/all7reset/FOV restore regression passed. Tests force outcomes/time, not natural or physical-device QA. Outcome odds/easy batting unchanged; visual running is fitted to preselected outcome, not safe/out competition. Existing simplified pitcher baserunner-count/scoring model unchanged, prior runners not rendered; errors/doubleplays remain.
- Test RNG selection changed from function-name stacks to contact flash followed by hit-decision draws, works on minified build without adding production-only test selection behavior.

## 10:57 Nov18 - home run circuit before score advance
- Direct pitcher HR now shows opponent circling1B/2B/3B/home before score advances and next pitch opens, with no field recovery/relay for a ball beyond the park. Shared home run route also replaces old batter loop's almost-home endpoint and narrow camera: exact home stop, short hold, full diamond view, FOV/visibility restoration. Existing hit/out/HR odds and existing baserunner count/scoring unchanged. Only hitter circuit shown, not other baserunners.
- Pure all-four-base/endpoint tests, actual pitching HR0:0 until home then0:1/nextpitch/FOV46/runner hidden, batting full1PA1HR/all4bases/home/FOV62restore, batting double recovery regression passed. Actual portrait game camera3B/home pixels inspected. Forced hit/time/RNG, not natural pacing or physical-device QA; detailed balance/races/errors/doubleplay remain.

## 11:18 Nov18 - actual pitcher base occupancy
- Replaced direct pitcher's count-only runners with 3-bit1B/2B/3B occupancy and compact highlighted HUD labels/accessibility text. Hits advance all existing runners by hit base count (explicit simplified policy; no extra-base choices); home run clears bases and scores all plus hitter; walks move forced runners only. Inning starts clear occupancy. Fixes prior empty-base double/triple randomly scoring hitter, duplicated scored runners remaining on base, and unforced walk runs. Removes previous55% extra score roll, so direct pitcher scoring/balance changes intentionally, while hit/out/type odds/easy batting are unchanged. No simulated-match/batter scoring change.
- Exhaustive8occupancy x4hit runner conservation and walk/empty-extra-base/HR tests passed. Actual triple→double→single→3runHR gives masks4→2→5→0 and scores0→1→1→4; labels/next-pitch checked and portrait HUD pixels inspected. Pitcher HR and triple-recovery regressions passed; build passed. Forced RNG/time, not natural pacing/device QA. HUD tracks prior runners but their3D models/movement not yet rendered; outs hold runners, no tags/advances/errors/doubleplays.
- Rule grounding: MLB walk awards1B https://www.mlb.com/glossary/standard-stats/walk and triple batter reaches3B https://www.mlb.com/glossary/standard-stats/triple . Uniform advance by hit distance is this game's simplified policy, not claimed as exhaustive baseball rules.

## 11:51 Nov18 - prior runners rendered in pitcher play
- Added3 opponent-colored/unequipped prior-runner models, visible on occupied bases between pitches. During nonHR hits they advance by same hit-distance policy alongside batter-runner and field recovery; home-scoring runners exit on arrival. HR prior runners start at their bases and leave home before hitter arrives. HUD/score still updates only after completion. Walks place runners at new occupied bases without travel animation. Outs hold existing runners, scene/home/batter play/inning reset clears stale runners.
- Base path pure tests cover3starts x5advances/endpoints/home removal; all occupancy/scoring tests unchanged. Actual triple→double→single→3runHR verifies model mask=HUD mask4→2→5→0, existing runner during hit, HR runners gone before hitter. Actual portrait pickup screenshot shows2B→3B runner and batter→1B concurrently. Batter fullHR/reset regression and build passed. First UI test wrongly required already-scored3B runner to remain visible, corrected; subsequent slow-browser timeouts traced to leftover local Chrome sessions after failed tests, cleared and sequence passed. No production exception observed. Forced clock/RNG not natural/device perf QA. No probability/scoring changes this batch; races/errors/doubleplays/extra advancement remain.

## 11:58 Nov18 - walk forced advancement animation
- Four-ball pitching walks now hide input and show batter walking1B plus only forced prior runners walking next base (3B forced runner scores/exits). Other runners hold. Occupancy/score updates after destination/hold; pitching camera/FOV and input resume. No odds/scoring-policy changes.
- All8force-chain masks pure tests passed plus actual two4-ball walks empty→1B→1B/2B,0runs, exact hitter1B/forced2B endpoints and FOV46restore. Actual portrait forced-walk frame inspected, build passed. Test first attempted mouse over HUD instead of canvas and got strikes, corrected target dispatch; passed. Walk test uses forced aim/RNG/time, no physical-device QA. Existing races/errors/doubleplay/extra-advance simplifications remain.

## 12:20 Nov18 - batter walk and followup scoring route
- Batter4-ball PA now walks to1B before walk result. Existing probabilistic followup-hit score now sends own runner from1B (single/walk) or2B (double) via remaining bases/home before score/banner; exact home stop and original camera/FOV/visibility restore. This is the already-decided followup run, not a simulated extra pitch/contact; outcome odds/scoring unchanged. Batter prior teammates still not tracked/rendered by this PA-focused model.
- Actual4balls→walk1B→followup1B/2B/3B/home→full0AB0hits result/FOV62restore passed, double-hit recovery/full1PA regression and base path pure tests/build passed. Portrait followup frame inspected. First test expected runs field not present in existing public result, removed that incorrect expectation; original scoring not changed. Forced RNG/time, not physical-device/natural QA. Races/tagups/errors/doubleplays remain.

## 12:44 Nov18 - empty-base pitcher ground-ball race
- First timed safe/out decision for direct pitching ground balls with empty bases. Runner starts on contact at fixed6worldunits/s, continuing across flight and retrieval; arrival time at1B compared with actual planned glove reception time (flight+approach+transfer+throw, excluding hold). Runner wins tie. Slow handling produces1B infield hit/no out, fast throw out/no occupancy; score/hit-count/nextpitch use result after reception. Existing preselection remains for contact/base hits/air outs/occupied-base grounders; this additional conversion changes pitcher hit/out balance. Batter easy batting unchanged. No RNG draw added for race.
- Pure fast/slow/tie/speed race tests, local actual out margin+0.322s versus safe-0.284s (simulation times, not wall-clock/device latency), properout1/baseempty vsout0/base1/nextpitch passed. Existing pitcher groundout and batter2B/full1PA/reset regressions passed, build passed. Actual portrait safe/out HUD/gamecamera frames inspected;1B runner partially occluded by receiver at bag. Forced RNG/time, not natural/device/balance QA. Occupied-base grounders still old one-out presentation, no force/doubleplay/errors/tagups.
- MLB hit glossary grounds infield hit when batter reaches1B before throw: https://www.mlb.com/glossary/standard-stats/hit .6unit/s speed is game design constant, not measured player data. Earlier dedicated infield-hit URL fetch failed, this verified source used instead.
- Follow-up visual correction: race camera shifts right toward1B and runner runs through bag up to2worldunits after touching, separating blue runner from taller1B receiver. Safe local receipt frame re-inspected, outcome/arrival clocks unchanged.

## 13:04 Nov18 - pitcher catcher reception
- Direct pitching called ball/strike and swing-miss pitches now travel final segment into catcher's real world-space glove, hold briefly, then count/result updates and next pitch. Catcher arm moves into reception and resets, ball hides only after glove hold. Pitch/contact/count odds unchanged, no dropped-third-strike mechanic added.
- Actual called strike, aimed outside ball, high-velocity swing-miss tests verify glove coincidence, no early count, one correct ball/strike after hold and nextpitch. Portrait ordinary pitching camera pixels inspected: ball visible at catcher mitt, HUD count still zero while held. Whiff's first forced RNG parameters produced contact instead, adjusted test pitcher velo100 and reran; no game probabilities changed. Build passed; forced RNG/aim/clock, not real-device/long-run QA. Also includes test-only #new readiness fix from previous live race test.

## 13:21 Nov18 - catcher return throw
- No-contact pitch loop now continues from catcher mitt→throwing hand→arc back to pitcher's world-space glove, brief hold, original catcher/pitcher arms restored, then next pitch. Input remains disabled until returned. Called ball/strike/whiff odds/count unchanged, only between-pitch duration extends about1.2simulation seconds. This is standard return presentation even on3rdstrike/4thball before following outcome, no special inning-ending discard.
- Called strike/ball/whiff UI tests verify both mitt coincidences, no early count/input, return travel/hold, correct subsequent count and nextpitch. Actual portrait return-flight pixels inspected; build passed. Controlled RNG/clock not device/performance/longrun QA. No race/error/doubleplay scope expansion.

## 13:46 Nov18 - occupied first-base force at second
- Direct pitcher grounders with only1B occupied now choose2B, send prior1B runner toward2B and batter toward1B from contact, then compare6unit/s runner arrival with actual planned collection/transfer/throw reception time. Early2B reception retires prior runner/holds batter1B; late/tied reception leaves1B/2B both safe. Count/base HUD and nextpitch wait for completed play. Receiver stands on2B, ball reaches actual mitt, retired runner hides. Existing empty-base1B race and easy batting unchanged. Actual out/occupancy balance changes for this state. Both outcomes use simplified fielder-choice scoring (no added hit), without official-scorer alternative-play judgments. No doubleplay, no other occupied-base state rule expansion.
- Local forced single→grounder both branches passed: out margin+0.339s, safe−0.465s, exact batter1B endpoint,2Bglove coincidence, no early out, proper masks1/3 and matching3D models/nextpitch. Actual390x844 throw/receive pixels inspected. Emptybase safe/out and batting full1PA groundout/reset regressions passed, base/ground pure tests and build passed. First safe test angle selected a valid out, corrected deterministic input to center slow grounder; no tuning changed. Controlled clock/RNG, not natural/device/balance QA. MLB force-play rule https://www.mlb.com/glossary/rules/force-play .

## 14:23 Nov18 - lead force chain and home reception
- Pitcher ground-force decisions now cover all occupancies containing1B:1B or1B/3B→2B,1B/2B→3B,loaded→home. All forced runners/batter start at contact; unforced3B runner holds. Earliest lead force selected, fixed6unit/s compare with pickup/transfer/reception, tie safe. Force out removes lead runner and puts batter/other forced runners on next base, no run; safe moves full chain and loaded safe scores1. Home reception explicitly uses catcher at plate, restores his position/rotation/limbs afterward. Only one force attempt, no doubleplay or secondary base choice. All FC/no-hit simplified scoring retained; direct pitching out/score balance changes for added states. Easy batting/swing untouched.
- All8force-target/safe-out conservation/no-run-on-force-out pure tests and fixedcatcher plan test passed. Local actual1B/2B,1B/3B,loaded each safe/out passed (6cases); stationary unforced3B inspected via test; loaded catcher mitt exact/pose reset passed. Loaded3successive home force outs→nextinning opponent0runs/emptybases passed; own attack legitimately added1run (initial test incorrectly demanded own0 too, corrected assertion). Existing1B force and batter fullgroundout/reset regressions passed; portrait3Bthrow/homecatch pixels inspected. Detailed natural/device/balance QA remains. Test-run latency caused by3orphan test Chrome sessions after earlier assertions, cleaned only those test sessions; rerun passed without production changes.
- Rule source https://www.mlb.com/glossary/rules/force-play . No steal/tagup/error/doubleplay; states without1B still prior groundout policy. Always defending lead force is game policy, not smart tactical AI.

## 14:53 Nov18 - first-empty occupied ground race
- Timed pitcher1B ground reception race now applies to2B-only,3B-only,2B/3B as well as empty bases. Existing unforced runners hold throughout; batter races from contact at6unit/s. Fast throw adds out with unchanged occupancy, slow/tie adds batter1B as infield hit without forcing/scoring prior runners. New explicit infield occupancy policy avoids applying general single's uniform advancement to a held3B runner. All8occupancies now have one timed ground-force target (first if no1B, lead force otherwise); still no secondary throw/doubleplay/tagups/errors/tactical choice. Out/hit balance changes in added states; easy batting/swing unchanged.
- Local2B/3B/2B3B eachsafe/out (6cases), no early out, gloveendpoint, exact fixed priorrunner positions, model/HUD occupancy,0runs/nextpitch passed. Prior loadedhome out/catcherrestore and groundplan regressions/pure infield state tests/build passed. Portrait2B/3B hold plus1Bthrow pixels inspected. First test incorrectly expected forceBase1 for a nonforce1B throw; corrected to0.2B/3B setup originally scored lead runner with triple→double, corrected tosingle→double. Obsolete testChrome cleared after failed tests. Controlled clock/RNG, not natural/device/balance QA.

## 15:07 Nov18 - pitching foul flight and dead-ball reset
- Pitcher foul contacts now show an uncaught arc outside first/third foul line, ground landing and short dead-ball hold before count/nextpitch. Side derives from existing contact location, adds no RNG draw, no fielder chase/catch or base advance; original2strike foul cap unchanged. Camera widens temporarily then restores pitching view. This adds2simulation seconds to a foul, no probability/score/easybatting changes. No foul-tip/bunt-thirdstrike/caughtfoul rules claimed.
- Pure bothside/clamped/nonnegative foul path tests passed. Local actual3fouls with3B occupied verifies strikes1→2→2/noout/noearlycount/noadvance/noscore and nextpitch, existing catcherreturn regression/build passed. Initial76degreeview cropped landed ball, replaced90degree wider view and rechecked actualportrait: whiteball outsideleftline and3Brunner visible. Controlled RNG/clock not natural/device QA. Rule sources https://www.mlb.com/glossary/rules/foul-ball and https://www.mlb.com/glossary/rules/foul-tip (ordinary foul vs caught tip distinction).

## 15:36 Nov18 - batting foul paths share dead-ball sequence
- Shared runFoul now handles both roles with unchanged outside-line arc/deadball hold; restores saved camera/zone/reticle afterward. Batting weak/timing-edge foul previously vanished immediately, angle>46 foul previously used general field pursuit and advanced count early; both now await actual foul landing/hold before count and nextpitch. Swing/guide disabled during deadball. No timing/radius/odds/easybatting changes, no catch chance added. Each batting foul now adds2simulation-second presentation; old angle-specific distance replaced with same fixed foul path.
- Actual local weakcontact and forcedwideangle each3fouls→groundout/full1PA result0hits passed; noearlycount,2strikecap, inputdisabled duringfoul tested. Pitcher3Boccupied3foul regression/purepath/build passed. Actual390x844 both batting foul landings inspected. Test initially failed because first sample dt=.125 missed t<.1 initialization, corrected firstframe guard; obsolete failed-test browser cleaned. Controlled RNG/time/forcedwideangle, not natural/device QA. Batting swingpose criteria maintained; caughtfoul/tip/bunt exceptions remain.

## 15:58 Nov18 - defensive half-inning state cleanup
- At3outs directpitching now immediately clears baseHUD/priorrunners/ball/reticle/zone, disables picker/input and hides defensive lineup before automatic own-attack summary. Formerly stranded opponent runners and aiming zone persisted until nextdefensiveinning. Nextdefensiveinning restores lineup/aim and emptybases;3outs shown during change, count0B0S. Automatic attack still summary-only, no simulated batting added. Score/probabilities/easybatting unchanged.
- Loaded3singles→3homeforceouts→ownattack→seconddefensiveinning localtest passed: no staleobjects/occupiedHUD/input duringchange, restoredallfielders/pitcher/catcher/aim at2ndinning with0opponentruns/emptybases. Ownattack1run existingRNG. Basepuretests/buildpassed. Actualportrait transition inspected after extending onlytest wallclockhold8sec for screenshot; first screenshot arrived after1sec transition and showednextinning instead, corrected testcapture. Test uses .5simdt/lowrenderresolution during setup, fullresolution attransition, controllednotnatural/device QA. Longexisting combinedtest exceeded timebudget, dedicatedsmallerinningscope passed. Productiontransition duration stays1sec.

## 16:08 Nov18 - mobile HUD word-wrap cleanup
- Parent feedback: changeHUD finalKorean syllable alone. Shortened change status to공수교대·공격중, matchcount/status flex-wrap with gap/nonshrinkingcount;status moves whole tosecondrow if needed, Korean keep-all and width bound. Matchbanner now responsive24–38px +keep-all so320px nextbatter banner avoids singlelastsyllable. No globalchip changes beyondmatch#pi/no gameplaymath.
- ActualHUD test320/390 widths ×4statuslabels checks one textline/statusnoclip/nooverlap/countwithinviewport; actualbothsizes screenshots inspected. Test manually substitutes labels and nextbatterbanner on real ready-pitch HUD for layout, not actualtransition gameplay; previousinninggametest covers flow. Initialscreenshot racedfirstpitchstatusset, corrected wait-ready before layout. Buildpassed. No claims ofrealdeviceQA.

## 16:29 Nov18 - pitching throwing-hand release
- Directpitcher windup ball now stays at realworld throwinghand eachposeframe, snapshots handpoint then blends into existing pitch trajectory for first.14sec. Previously hiddenwindup then fixed-coordinate appearance. Original T/target/curve/odds/count preserved after first.14sec, no extraRNG. Ballscale reset1 beforewindup. Batter mode untouched/easybattingunchanged.
- Local calledstrike/outsideball/whiff3cases handcoincidence17windup samples, departure/normalflight, catcherreception/return beforecount, correctcount/nextpitch passed. Actual390portrait handball windup inspected; visible ball perspective larger closecamera, actualscene radiusunchanged. Buildpassed. Forced RNG/aim/dt notnatural/deviceQA.

## 16:50 Nov18 - pitcher air-out return throw
- Pitcher airout finish now keeps collector at catchpoint after.65sec glovehold, transfersglove→throwhand .35sec then returns arc to pitcher worldglove, holds.3sec before reset/nextpitch/outupdate. Pitcher restores mound before return, armrestoredafter; fielders reset afterreturn instead of atcatch. Shared battingairout defaultunchanged. No new catch/outchance/tagup/doubleplay. Adds.35+throwdistance/24(min.65)+.3simsec return presentation.
- Local actualpitcherairout catchglovecoincidence/returnendpoint/inputdisabled/countunchanged beforereturn thenout1 passed, actualportraitflight inspected; battingairoutfull1PA/resetregression andgroundpuretests/buildpassed. Forced RNG/dt, notnatural/deviceQA. Existing preselectedairout/priorrunnersholdpolicy unchanged.

## 17:14 Nov18 - mixed full pitching game and automatic tie disclosure
- Controlled3inning19pitch integration:4ballwalk/singles/foul/3runHR/groundforce/airreturn/strikeout→all3inningchanges→result/growth/historysave→reloadContinue→confirm passed.3hits,1SO,playedscore3:3. Found pre-existing automatic tie resolution adds1finalpoint without extra inning; losing tie also increments pitcherER (final3:4/4ER). This batch does NOT change scoring/evaluation/randomness; records playedScore+automaticTiebreak and plainly discloses original directly-played score/ER and automatic extra-point inclusion on result/history. No official rule claim; simplified game policy, still not playable extra inning. Older records not inferred.
- Actual390portrait result note inspected, fully readable withnextbutton. First expectation mistakenly4hits/3ER, corrected to3hits + pre-existingtie4ER and explicitplayed3. Reload initially waited#ok before titleContinue, corrected actualresumeflow. Testclockaccelerated/walltimers30ms/setuphalfresolution, fullresultresolution; notnaturalpacing/device/balanceQA. Build/live checks follow.

## 17:38 Nov18 - ground-play receiver returns ball to pitcher
- Directpitching groundout/force/infieldhit and normalnonHRhit relay now continue from receiving defender through handtransfer(.35sec), arc tomound(distance/24,min.65sec), glovehold(.3sec), then reset/count/nextpitch. Groundrace finishes before return starts; no race/RNG/score/easybatting changes. Catcher homeforce restores originalposition/arms afterreturn. Shared batting default leaves oldflowunchanged.
- Local1B out+safe, loadedhomeforce/catcherreset and mixed19pitch3inning fullgame/result/reload passed. Returngloveendpoint, noearlyout/input verified. Actualportraitreturnflight inspected. Puregroundpath/build passed. Tests accelerated/controlled, notnaturalpacing/deviceQA. One integration attempt useddefault1inning but expected3, corrected3regular andpassed; some slow screenshot-heavy combinedchecks exceededwalllimit, replacedwithsmallerrender/accelerated dedicatedchecks. Automatic tie extraER policy remains unchanged/disclosed, notfixed.
- Live f3b8968/index-Dnl_b-5q.js groundout→return→nextpitch passed with actualgloveendpoint/noearlycount/input. Actual390portraitreturn screenshot inspected. Initial live check saw priorPagesbundle; afternewbundle, overlylarge.5teststep skippedbrieftransfercapture, correctedteststep.125 andpassed. Runtimecodeunchanged bytestfix.

## 17:51 Nov18 - pitching aim locked outside ready state
- Pitcher canvasaim now only accepts pointerdown/move while waitingforThrow; locking clears dragstate, hides target/zone from windup through ballflight/fielding/return, then nextpitch restores same targetandzone. Prevents moving chasecamera from turning incidentaldrag into nextpitchtarget. PitcherRNG/trajectory/difficulty and batting/swing unchanged.
- Local actualwindup/flight/groundfielding/return injectedpointers cannot movegoal, reticle/zonehidden, nextready restoresgoal/showsaim/acceptsnewdrag. Existing1Bout/returnglove/count+inputchecks passed. Actual390portrait nextreadyinspected,1outandnewtargetvisible. Buildpassed. Controlledtime/RNG desktopheadless, notphysicaldevice/balanceQA.

## 18:11 Nov18 - selected pitch applies to the immediate throw
- Fixed preexisting selectionlag: throwBall capturedselPitch before waitingforinput, so selectingcurve whilefirstready stillthrewfastball. Now snapshotselectionafterthrowcommit. Readystatus updatesimmediatelywithselection, invalid/lockedselectionignored. No pitchformula/RNG/easybattingchanges.
- Actualpitcher3yearbrk60, sameatbat selects curve→slide→fork→fast; each immediatepitch correctname/110,118,116,122kmh, expectedflightend2.0/1.625/1.75/1.5under.125steps. Actual390portraitcurveflightselectedoutline/name/speed inspected. ControlledRNG/render/time notnatural/deviceQA.

## 18:33 Nov18 - batting-view pitcher hand release
- Battingview opponentpitcher ball nowvisible atactualthrowinghand through24windupposes; snapshotsreleasepoint once then blendsintoexistingtrajectory forfirst.14sec. Previouswinduphiddenball/flightblendfollowedmovinghand. Pitchduration/target/odds/easybattingwindow/swingpose unchanged.
- Local24winduphandcoincidences/post.14oldflightendpoint/firstcalledstrike passed; actualfull1PAgroundout→fielding/reset/result regressionpassed. Actual390portraitrelease inspected. InitialtestassumedfixedT/strikeunderRNG.99(curve/outside), correcteduseactualT andcontrolled.1inzone. Test-onlyhook exposesT; no productionformulachange. Controlledtime/RNG notnatural/deviceQA.

## 18:56 Nov18 - normal hit runners start at contact
- Directpitching nonHRhits now showbatterrunner andexistingrunners moving duringballflight; continuationuseselapsedflighttime throughpickup/relay, fixed9worldunit/sec andexisting1/2/3basepath. Waitsforrunnerarrival ifrelayendsfirst, thenexistingpitcherreturn. Previouslyrunnerstartedonlyafterlanding. Wide76degreeflightcamera includesdiamond/runners;nextpitchcamrestores46. Nohitroll/scoring/advancepolicychanges, noextraadvance/tagout/steal. Battingmodeunaffected.
- Local1/2/3basehits flightmotion→relaycontinuity→targetarrival/batterrestored/nextpitch passed,1Bexistingrunnerinflightmovementpassed. Fullmixed19pitch3inning/result/history/reload passed(old3:3→automatictie3:4/4ERunchanged). Actualportraitfirstcameraexcludedrunners, correctedwideflightview andvisuallyrechecked visiblebatterrunner/priorrunner duringflight. Initialimplementationwouldrestorehiddenbatterafterhit, caughtandfixedbeforecommit. AcceleratedRNG/time/desktopnotnatural/deviceQA.

## 19:14 Nov18 - batting aim locked during deadball/fielding
- Battingcanvasaim onlyactive duringpitch preparation/flight, disabledanddragcleared whenpitchfinalizes; returnsactive nextpitch. Previouslyfoul/fielding/run camera touches could changefuturegoal. Pitch flightaim remainsavailable, no battingwindow/timing/swingchange.
- Local3fouls→groundout/full1PA:54deadballpointerinjections leaveaimunchanged,4pitchphasesacceptnewaim,2strikefoulcap/noearlycount/fullresultpassed. Battinghandrelease/postblendtrajectory/calledstrike regressionpassed. Actual390portraitfoul landing withhiddenaiminspected. ControlledRNG/time notnatural/deviceQA.

## 19:35 Nov18 - batting hits run from contact
- Batting single/double runner now startsduringflight withsame9unit/sec hitpath, elapsedflightcontinuesintorelay, waitsarrival andrestorespreflightFOV. Wideflightcamera showsdiamond/runner. Existinghitroll/easybatting/scoring/followupscoreunchanged; teammatebaserunnersstillnotmodeled. Groundout/HR separateflowunchanged.
- Local single+double full1PA:visibleflight→noresetatrelay→correctbasearrival→FOVrestore→existingfollowupscore/result passed. Actual390portraitflightwithrunnerinspected. Initialtestcheckedrunnerpositiononlyatfinalresult, butexistingfollowupHRrunmovedsameavatar; correctedassertionatrelayarrival. ControlledRNG/time notnatural/deviceQA.

## 19:59 Nov18 - audio randomness independent of match outcomes
- SFX sample noise nowusesprivate xorshiftstream instead ofMath.random. Previouslyeachsound consumedthousands ofgameplayrandomdraws dependingonAudioContext/sampleRate; audioavailability couldalterfutureoutcomesequence. Noiseformat/duration/filter unchanged, exactnoisewaveformchanges. Gameprobabilityformulas unchanged butoldseededoutcomesequence isnotpreserved. Catchermitt SFX movedfromafterfullreturn tofirstglovehold(t>=.18), onceonly.
- Nodeall8sfx zeroMath.randomcalls;4noisebuffers finite/bounded/mixedsign. ActualpitchcatchsoundUI interceptAudioContext verifiesone.08secbuffer atcatch andnoduplicateafterreturn/count;release/glove/inputregressionpassed. Full19pitch3regular/result/history/reloadpassed. Onecombinedchecks exceededwallbudget midfullgame, reranfullgamealonepassed. Noacousticlistening/physicaldeviceQAclaim; audiblewaveformandlatencyQAremain.

## 20:15 Nov18 - defensive mitt sounds at ball reception
- Groundpickupsecuresglove(attransfer.45),base/relayreceive,andgroundreturnpitcherglove noweachone mittSFX. AircatchkeepsoldmittSFX,airreturnpitcherarrivaladdsone. Persequenceflags preventrepeatduringholds. Noanimationduration/RNG/outcome changes(audioownRNGfrom93e6dd8).
- Localground3buffers correctpickup/receive/returntimes,noduplicateandoldrace/out/input/glove passed;air2buffers catch+returnarrival/noduplicate/oldairflowpassed. AudiozeroRNGtest/buildpassed. Actualportraitgroundreturninspected. Buffercreationtimingnotacousticlistening/deviceaudiolatencyQA.

## 20:37 Nov18 - batting automatic tie disclosure/fullgame resume
- Battingmode preexistingcoinflipadds1finalpoint nowrecordedautomaticTiebreak/playedScore; banner no longerclaimsplayedextra innings. Sharedresult/historynote distinguishespitcher(ip) frombatting, battinghasnoERtext. No scoring/probability/evaluationchange; no actualextrainning added, olderrecordnotinferred.
- Fullregularbatgame3PA/12pitches/3walks→0:0→automatic0:1/result/growth/save/reloadContinue/resultconfirmpassed. Actual390portraitnote/nextbuttoninspected. Initialyear3testopponentautoscores5becauseexistingstrengththreshold>1; usedyear1toexercise0:0tie. Thisisnotbalancefix. ControlledRNG/time notnatural/deviceQA.

## 20:57 Nov18 - unaccelerated frame-clock flow sanity
- New natural_pitch_flow_ui_test.mjs leaves__dt undefined andnativewalltimers, forcesRNG.5only; actualonepitchwindup→groundrace→pickup/throw/receive→return→1out/nextaim passedlocal+live. No gameplaycodechanged. Local26.951sec/live27.243sec walltime; live177sampledframes mean156.10ms/175gaps>50ms. Softwaredesktoprendererisslow; gameclampsdt50ms, so thisisflowunderunacceleratedclock NOTnaturaldevicepacing/performanceclearance. Actualdevicemustbecheckedlater. Simraceunchanged4.250receivevs4.573runner.
- Liveactualnextpitch1outscreeninspectedafterfullresolutionrestore. Thisbatchonlyaddsreprotest/evidence; nochangedruntimebundle. No claimthatlongdelayisacceptablemobilepacing.

## 21:21 Nov18 - mixed batting integration catches fallback-hand crash
- Newfull_batting_mixed_ui_test:regular3PA HR→double→calledK(5pitches),HRroundtrip/hitrelay/followuphome/result3AB2H1HR3RBI8:10/growth/history/reloadContinue/confirm passedlocal. Livefirstattempt exposedmodel-loadfailure fallbackmissingthrowHand, causingwindupcrash afterea090a0. AddedactualhandanchorObject3D toproceduralarmR at(0,-.44,0),hasBat/hasGlovemetadata; mainmodelunchanged.
- Explicitabort/models/player.fbx mixedbatfullgame nowpasseslocal;fallback_pitch_ui_test abortsameasset groundrace/return/glove/input/count passed. Buildpassed. No attempttoreloadasset/reuseprivateref. Actualfallbackresultportraitinspected. Thisfixaddressesmissinghandcrash, notmodeldownloadreliability. ControlledRNG/time notnatural/deviceQA. Prioronefailedtestusedlocalhostwithoutserver, correctedownservertest.

## 21:40 Nov18 - fallback full pitching game regression
- Test-only fallback_full_pitch_ui_test.mjs abortsplayer.fbx thenrunsmixed19pitch3inning walk/single/foul/HR/groundforce/airreturn/K,allinningchanges/result/growth/history/reloadContinue/confirm. Local+livepassed3IP3H1SO played3:3/3ER→oldauto3:4/4ER. Actualfallbackliveportraitresultnotebuttoninspected. Noadditionalruntimechange; coverswiderfallbackflowafterec7aef8. ControlledRNG/acceleratedclock notdevice/naturalQA;modeldownloadreliabilitystillunfixed.

## 21:59 Nov18 - bounded player-model retry
- Model fetch nowchecksHTTPstatus andtriesonceagain(cache reload) afterfetch/status/parsefailure, thenexistingproceduralfallback. Maximum2attempts/startup,procqueryskipsboth. No timer/backoff/timeoutadded; slow/hungnetwork stillbrowserfetchbound. Notguaranteedmodeldelivery orofflinecache. No gameplayformula/permissionschange.
- model_retry_ui_test firstHTTP503→secondactualfile givesnormalmodel;twoHTTP503givesproceduralmodel;exactly2initialrequests. Bothlocalmixed3PAHR/double/K/results/history/reloadpassed. Buildpassed. Controlledfaults/RNG/time notnetwork/deviceperformanceQA.

## 22:24 Nov18 - model request timeout
- Eachmodeldownloadattempt nowAbortController10sec coveringfetch+arrayBuffer,clearedfinally; existingmax2attempts thenfallback. Preventsnonrespondingfetch blockingbootstrapforever. Notstrict20secwallpromise(parse/renderoverhead/timertrottlingcanextend), noabortofsyncFBXparse/otherassetloads. No gameplaytimingchange.
- model_timeout_ui_test injectspendingfetchPromise respectingAbortSignal,firsttimeout→actualsecondfile andtwotimeouts→fallback;localbothmixed3PA/result/reloadpassed. Real10sectimer,notshortened. Initialrequestinterceptionholdtesthungnavigation, replacedwithfetchboundarysimulation; testsdomreadywaitbefore#new. Buildpassed. Networkfaultsimulation notphysicalnetwork/deviceQA.

## 22:40 Nov18 - visible startup state
- Static HTML now shows a portrait loading card before JS/model initialization. Model first failure changes text to retry, second failure names procedural-player preparation; title rendering clears the overlay. No fabricated percentage, ETA or animation. Gameplay logic/asset timeout rules unchanged.
- startup_loading_ui_test.mjs uses real 10-second AbortSignal waits for two simulated pending fetches, verifies initial/retry text, fallback title and no stale overlay. Local390x844 screenshots inspected: readable centered content, no cropping. Build and audio-RNG/ground-out-plan regressions passed. Not a physical-network or device-speed check; module/WebGL startup failures remain outside this change.

## 23:02 Nov18 - batting fielders return possession to pitcher
- Batting ground outs, hit relays and air outs now reuse the existing pitcher-return sequence instead of hiding the ball immediately after reception. Waits for pitcher-glove arrival and hold before continuing the plate result; hit advancement and easy batting formulas unchanged.
- bat_pitcher_return_ui_test.mjs independently forces single/ground/air: each verifies disabled swing and no early result during return, actual glove endpoint, restored FOV and expected hit/AB result. All three local passed; mixed regular3PA full batting regression and audio-RNG regression passed. Actual390portrait return frames inspected. Controlled RNG/accelerated clock, not natural/device QA. No base-rule/balance change.

## 23:22 Nov18 - batting ground runner starts at contact
- Ground-out presentation now starts the batter-runner during ball flight (6 world units/sec, matching pitching ground presentation), carries elapsed flight time into fielding, and waits until first-base arrival before returning possession. Broad field view includes runner during flight. Existing probability-picked out remains out, not a new timed safe/out rule. Singles/doubles keep9units/sec.
- bat_ground_run_flight_ui_test.mjs with GROUND=1 checks visible moving runner before landing, no backward reset at relay, arrival and FOV/result0H1AB. Local passed; existing single-run test, regular mixed3PA/result/history/reload, ground-plan logic and build passed. Actual390portrait frame inspected. Controlled RNG/clock, not natural/device/balance QA.

## 23:44 Nov18 - fallback batting defense-return regression
- Extended bat_pitcher_return_ui_test FAIL_MODEL=1 aborts player asset; checks model absence and runs each return path. Local/live single relay, groundout and airout all reached pitcher glove with input disabled/no early result/FOV restored/expected hit-AB outcome. Additional local ground rerun passed after explicit model-absence assertion added. No runtime changes, bundle remainsindex-CB0AAfYO.js. Buildpassed; actualfallback390portrait returnpixels inspected. Controlled faults/RNG/clock, not physicalnetwork/device QA.

## 00:07 Nov19 - consecutive defense test finds hidden batter regression
- New bat_return_sequence_ui_test regular ground→air→single found second-pitch batter.visible=false after67164a7. Flight hides batter for runner; ground completion captured hidden state and kept it. Restore intended batter visibility before ground completion, matching existing hit branch; no outcome/timing formula change.
- Local normal/fallback 3PA/3pitch returns all reach glove before next pitch, fielders back home, batter/zone/reticle restored, runner hidden, 3AB1H result/history and reloadconfirm passed. Normal rerun captured actual secondpitch390portrait visible batter. Firsttwo test failures exposed samebug beforefix. Buildpassed; controlledRNG/clock notnatural/deviceQA.

## 00:26 Nov19 - native-clock batting ground sequence
- Newnatural_bat_ground_ui_test leaves__dt undefined andsetTimeout untouched; forcesgroundcontact/RNG only. Local/live contactrun→approach/transfer/throw/receive/return→nextPA withvisiblebatter,hiddenrunner,zone/reticle andgloveendpoint passed. Buildpassed,runtimeunchanged.
- Softwaredesktop local55.794/live54.724wallsec fromplaybutton throughnextpitch,232sampledframes,mean241.28/236.37ms,227gaps>50ms. Thisincludesscene/inningwaits; notisolatedplayduration. Clamp50msgameclock slowsunderpoorrendering,notchanged. Confirmsflowwithoutacceleratedclock, NOTmobileperformanceclearance oracceptablepaceclaim. Actual390nextPApixels inspected.

## 00:46 Nov19 - catcher return arrival sound
- Pitcher-role catcher→pitcher return nowplaysmitt onceonpitcherglovearrival, matchingground/airreturns. Separateflag preventsholdduplicates. Catchermittsoundstillfirstheldframe. No trajectory/count/probabilitychange.
- pitch_catch_sound_ui_test assertsexactly1mittbeforearrival,2afterarrival/hold/nextpitch;localcalledstrike/ball/fallbackstrikepassed,gloveendpoint/countordering/throwunlockpassed. audio_rngtestbuildpassed. Actual390returnframe inspected. Buffer/timinginspectiononly,noacoustic/deviceQA.

## 01:08 Nov19 - same-session pitching to batting reset
- Newrole_switch_match_ui_test runs9calledstrikes/3K/1IP→resultconfirm→title/newbatter→groundout/return/result withoutreload. Normal/fallback local/livepassed;7fielders visibleat homebeforebatpitch,oldpitchcatcherhidden,battervisible,returngloveendpoint,1AB0Hresult. Buildpassed,runtimeunchanged. Existingautomatic tie1run/ERstillpresentanddisclosed,notrulefix. Actual390resultpixels inspected. ControlledRNG/acceleratedclock,notnatural/deviceQA.

## 01:28 Nov19 - role roundtrip reset
- Extendedrole_switch_match_ui_test throughnewthirdpitcherafterbatresult,withoutreload. Local/live normal/fallback passed catcher/ump/7fielders visible,calledstrike→catcherreturn→pitcherglove→nextthrowready. Previouspitch3K/batgroundresultsstillpassed. Build/runtimesame. Actual390nextpitchUI inspected, no gamecodechange. Controlledclock/RNG,notnatural/deviceQA.

## 01:47 Nov19 - immediate strikeout out-dot refresh
- Thirdstrike increasedoutsafterHUDsetCount, leavingoldoutdotsduringstrikeoutbanner. Refreshcountafterconfirmedstrikeout,stillaftercatcherreturn. Nooutcome/stat/trajectorychange.
- Newstrikeout_count_ui_test 3calledstrikes asserts0outduringreturns and1redoutdot whenstrikeoutbannerappears. Localpassed;actual390banner+reddot inspected. Roleroundtrip9strike3K/batground/newpitchregressionbuildpassed. Controlledclock/RNGnotnatural/deviceQA.

## 02:07 Nov19 - strikeout phase label consistency
- Parentnoticedconfirmedoutscreenstillshowedcatcherreturnphase. Thirdstrikeconfirmation nowsetsphase 삼진 · N아웃, matchingoutdot/banner; no gameplaytimingchange.
- strikeout_count_ui_test nowassertslabelwhenbannerappearsandaftercapture. Testonly900msbetweenturnwaitextended15sec toretainstateforactualpixels;bannerwalltimerunchanged. Localbanner+phase+1outpixelsinspected. Roleroundtripregression/buildpassed. Noacoustic/device/naturalQA.

## 02:35 Nov19 - confirmed field-result phase labels
- Resultbannerhelper nowsetsphase label forground/air/force/hit/walk afterplaycomplete,sooldreturnphasedoesnotlinger. StrikeoutNoutslabelkept. Nooutcome/timingchange.
- Newpitch_result_phase_ui_test 10pitch1IPwalk/single/foul/HR/ground/air/ground verifiesresultlabelmatchesbanner,2H3ER/result/history/reloadconfirm. Localpassed;strikeoutlabelregression/buildpassed. Initial3IPtesttimedoutunderloadedtestChrome;ownorphanbrowserscleaned,scope1IP. Forcebranchchangedbutnotexercisebythisplan. Controlledclock/RNGnotnatural/deviceQA.

## 02:55 Nov19 - force result-label regression
- Newforce_result_phase_ui_test setup1Bsinglethen2Bforceout/safe verifiesresultbanner/phaseonlyafterpitcherreturn,existingrace/outs/basemask/models unchanged. Local/liveout4.233vsrunner4.573sec→1outmask1,safe5.038vs4.573→0outmask3passed. Actual390livephase+out/basespixels inspected. Testonlyendwait10secforcapture;normalruntimeunchanged. Firstcombinedrunhitexecutionlimit,ownorphanChromecleanedthenindividualruns passed. Buildsamebundle. ControlledRNG/clocknotnatural/deviceQA.

## 03:12 Nov19 - pitching ground-flight runner view
- Ground-out-candidate ballflight nowuseswide76FOV/highinfieldview,matchingexistinghitandgroundrelayviews,sofirstbaserunnerisvisiblefromcontact. Aimnextpitchstillrestores46. No runner/balltrajectory/race/outcomechange.
- Newpitch_ground_flight_camera_ui_test checksrunnerprojectsinsidescreeninflight,76FOV/y42,returnarrival/1out/nextFOV46. Localpassed;groundplan/buildpassed. Initialtestprojectionusedstalecameramatrix,correctedtestupdateMatrixWorldbeforeprojection,notgamecamera. Actual390flightpixelsinspected. Controlledclock/RNGnotnatural/deviceQA.

## 03:34 Nov19 - pitcher faces returning fielder
- Ground/hitrelayandairreturns nowturnpitchertowardsenderduringreturn,glovetargettracksupdatedorientation;restoreoldyawafterhold. Existingreturntime/race/outcomeunchanged. Catcherreturnalreadycomesfromhome,nochange.
- bat_pitcher_return_ui_test addsfacing-senderangleandfinalyaw0assertions. Localnormalhit/airandfallbackgroundpassed,gloveendpoint/input/FOV/resultchecksretained. Buildpassed;actual390returnframesinspectedthoughpitcherissmallwideview. Initialcombinedtesttimedout,ownorphanChromecleaned,individualrunspassed. Controlledclock/RNGnotnatural/deviceQA.

## 03:53 Nov19 - full pitching return-direction regression
- Newfull_pitch_return_direction_ui_test full19pitch3IP walk/single/foul/HR/ground/air/force/K acrossinningchanges assertsfacingreturningfielder32sampledreturnframesandrestoredyawbeforeeachpitch. Local/livepassed3IP3H1SO,played3:3→existingauto3:4,result/history/reloadconfirm. Buildsamebundle,actual390resultpixelsinspected. No runtimechange. ControlledRNG/acceleratedclock,notnatural/deviceQA;automaticdecidingrun/ERstilldisclosedunchanged.

## 04:15 Nov19 - noncontact pitch next-aim regression
- Extended pitch_catch_sound_ui_test asserts exact ball/strike/whiff result banner and next aim instruction after catcher return. Local three paths and live three paths passed; fallback local whiff also passed.17 release windup samples, hand release flight, mitt arrival/count ordering and exactly2mitt sounds retained. Actual390live whiff next-aim pixels inspected:1strike,throwenabled,aiminstruction. Banner assertion preceded image; screenshotdoesnotretainbriefbanner.
- Initial suspected nonending phase residue disproved by actual test: next throw already replaces return phase. Discarded experimental game edit, runtime unchanged07b35e0/index-BK1hFrUR.js. Buildpassed. ControlledRNG/clock notdevice/natural/acousticQA.

## 04:40 Nov19 - loaded home-force return regression
- force_result_phase_ui_test accepts home/otherbase resultlabels and checks pitcher facing returner/gloveendpoint/yawreset. Local/live loadedhomeforceoutandsafepassedafter3setuphits:outreceive4.2667<runner4.5726sec→1out0run;safe4.6214>4.5726→0out1run;bothmask7andcatcherresetx0/z1.6/arm-1.4. Actual390liveout/safepixelsinspectedphase/banner/outdots/score/loadedbases.
- Firstcombinedrunexecutionlimit afteroutcapture,individualrerunspassed. No runtimechange,buildsamebundle07b35e0/index-BK1hFrUR.js. ControlledRNG/clocknotdevice/naturalQA;notnewrule/exceptioncoverage.

## 04:56 Nov19 - continuous fielder ball attention
- Ground completion andground/airpitcherreturn nowupdateall7fieldersheadyawtowardactualballusingexisting±.6radattentionlimit. Previouslypursuit/airflightattentionstoppedatthesehandoffs. No bodymovement/path/race/outcomechange;resetDefenseclearsgazeasusual.
- Extendedbat_pitcher_return_ui_test assertsall7returngazesandresultreset. Localnormalground/air/hitandfallbackgroundpassedwithgloveendpoint/pitcherfacing/input/FOV/resultchecks. Buildpassed,actual390returnpixelsinspected;wideviewheadsaretoosmallforpreciseangleQA. Controlledclock/RNGnotnatural/deviceQA.

## 05:15 Nov19 - close return visual inspection
- Returntestnowrendersinspection-onlyclosecameraafteractualgamecapture,withoutchanginggamecamera. Localground/liveairgaze+return+resetchecksandlooklogic/buildpassed,samebundle. Actualclosepixelsinspected:airfielderclear;groundrevealsbatter-runneroverlaps1Breceiverwhilewaitingforreturn. Newvisualissuefornextbatch;gameplayoutcomeunchanged. Wideviewhidthisissue. Groundclosecropisnotnormalgamecamera.

## 05:37 Nov19 - batting ground runner clears first receiver
- Battingpreselectedgroundoutrunnercontinues4unitsbeyond1Batexistingspeed6,ratherthanstoppinginsidereceiverduringpitcherreturn. Keepstepsuntilrunoutends;minpostarrivalwindow.25→.7secforthisvisualonlypath.Nooutcome/prebasespeedchange;hitstillonbase,pitchingexistingracepathunchanged.
- Localnormal/fallbackgroundreturnchecks>=4separation,gaze/glove/input/FOV/reset/resultpassed;contactflightcontinuityandnormalhitregressionpassed. Buildpassed,actualclosefallbackpixelsinspectednosamespotrunner;gamecameraunchanged. Controlledclock/RNGnotdevice/naturalQA.

## 05:58 Nov19 - pitching full flow after batting runout
- Extendedfull_pitch_return_direction_ui_test checksall7fieldergazesinreturnhooks. Local/live19pitch3IPmixedwalk/single/foul/HR/ground/force/air/Kpassed32returnframes/pitcherfacingandnextyawreset/inningchange/result/history/reloadconfirm. Same3IP3H1SO,played3:3/3ER→existingauto3:4/4ER. Confirmsbattingrunoutdidnotalterthispitchingplan. Buildsameindex-0aO5wjLg.js;actualliveresultpixelsinspected. No runtimechange;controlledRNG/clocknotnatural/deviceQA.

## 06:19 Nov19 - next batter reset after run-through
- Extendedbat_return_sequence_ui_test assertsgroundreturnrunner>=4fromreceiverand7fieldergazerestorednextpitch. Local/live normal/fallback3PAground→air→singlepassedallreturns,battervisible/runnerhidden/zone-reticle/fieldershome/input/result3AB1H1:2/history/reloadconfirm. Buildsameindex-0aO5wjLg.js. Actual390livenextbatterpixelsinspectedvisiblebluebatter/swingUI. No runtimechange;controlledRNG/clocknotnatural/deviceQA.

## 06:39 Nov19 - guard batting flight arrival pose
- Removedaccidentalground-onlythroughreferencefrombattinghitflightlegstopconditionintroducedd7014bd. Normalflightmax2.6secisless1Btime3.048sec,sonormalclocknotobservedblocked. Preventivefix,notconfirmeduserflowhang.
- bat_hit_run_flight_ui_test ARRIVE_IN_FLIGHT usesdeliberate7secdebugstepaftercapturetoexecutearrivalbranchandassertstoppedlegs;localdefault/doubleconfigpassedresult. Groundreturnseparation/gaze/glove/resultregressionpassed. Buildpassed. Artificialboundarychecknotnatural/deviceQA.

## 06:59 Nov19 - native clock run-through regression
- Extendednatural_bat_ground_ui_test checks4unitrunner/receiverseparationthroughreturnwithout__dtortimeracceleration. Local/livecontact→approach/transfer/throw/receive/return→nextPApassed,battervisible/runnerhidden/zone/reticle/glove/inputretained. ActuallivenextPApixelsinspected. Buildsameindex-BneULsHz.js,no runtimechange.
- Playbutton→nextPAwall36.337/38.106sec;sample259/257framesmean140.86/148.60ms,256/252>50ms. Includesinningwaits/softwaredesktoprenderingand50msdtclamp;NOTdeviceperformanceoracceptablepaceclaim. Forcedcontact/RNG/automaticswingremain.

## 07:21 Nov19 - pitcher race runout stops its legs
- Sharedrunnerstopthresholdnowdistinguishespitchrace2unitrunoutfrombat4unitrunout. Nonforcepitchracepostarrivalminimum.25→.4sectoreach2unitsatexisting6speed;forceunchanged. Receiverarrival/racemargin/outcomeunchanged.
- ground_race_pitching_ui_test checksrunnerlegs/ygroundedduringpitcherreturn;localout/safepassedreceive4.250/4.856vsrunner4.573→1outempty/0out1B. Batground4unitreturnregressionpassed. Buildpassed. Controlledclock/RNGnotdevice/naturalQA.

## 07:40 Nov19 - live out runout close inspection
- Groundrace test rendersinspection-onlyrunnerclosecameraafteractualreturncapture. Liveoutpassedstoppedlegs/y0throughreturnandnextpitch1outempty,receive4.250vsrunner4.573 unchanged. Actualclosepixelsinspectedrunnerfeetgrounded/legsneutral/separatefromreceiver;notnormalgamecamera. Buildsameindex-DVDUn-eX.js,nogamechange. ControlledRNG/clocknotdevice/naturalQA.

## 08:02 Nov19 - isolate runout visual step
- ExtractedrunThroughStep(elapsed,speed,distance)topuredefensehelper;sharedrunnerusesreturnedthrough/movingforbody/legsstop. Exactexisting2/4unitdistanceandstoppingconditionpreserved.Nooutcome/time/pacechange.
- Newrun_through_step_test before/atarrival/mid/exactstop/afterclampbothdistancespassed;groundplanlogic,localbatgroundseparationandpitchoutreturnstoppedlegs/resultpassed. Buildpassed. Internalrefactornotnewfeature;controlledRNG/clocknotdeviceQA.

## 08:26 Nov19 - third-base force regression
- Force_resulttestnowassertstargetbasenameinconfirmedlabel. Localout/liveoutandsafe1B+2B→3Bforcepassedreceiver/glove/pitcherreturn/yawreset/phase/occupancymodels. Out4.250vsrunner4.573→1outmask3;safereceive4.856→0outmask7,noruns. Actual390livepixelsinspected3Blabels/outdots/basesmatch;briefcenterbanneralreadygoneincaptures. Buildsameindex--84fGhps.js,nogamechange. ControlledRNG/clocknotdevice/naturalQA.

## 08:43 Nov19 - explicit automatic offense handoff
- Pitcherhalfinningphaseandscorebannerexplicitlyname우리팀자동공격ratherthanjust공격중. Newsummaryphaseincludesaddpoints. Automaticoffenseformula/inputscope/timingunchanged.
- Inningtestassertshandoffandautomatic-summarylabels,loaded3outs→emptyfield/disabledthrow→restoredempty2ndinningpassedlocal1:0. Buildpassed;actual390summarypixelsinspected. ControlledRNG/clocknotdevice/naturalQA.

## 09:04 Nov19 - fallback automatic offense handoff
- InningtestFAIL_MODELblocksplayerassetandassertsKenneyabsent;afterautomaticoffensechecksrunner/ballhiddenand7gazesreset. Local/livefallbackloaded→3outs→auto1point→empty2ndinning1:0passedlabels/fieldhide/throwlock/restore. Actual390livefallbacksummarypixelsinspectedbanner+phase/3outs/emptybases/score. Buildsameindex-B5xFmXsW.js,nogamechange. ControlledRNG/clocknotdevice/naturalQA.

## 09:25 Nov19 - zero automatic offense regression
- InningtestZERO_OFFENSEswitchesoffensenon-scoringdrawonlyathalfinning;assertsexact0/1pointsummaryandnextscore. Localnormal/livefallbackloaded→3outs→auto0→empty2nd0:0passedfield/input/runnerball/gazerestore. Actual390live0pointphase+banner,3outs,emptybases0:0pixelsinspected. Buildsameindex-B5xFmXsW.js,nogamechange. ControlledRNG/clocknotdevice/naturalQA.

## 09:46 Nov19 - complete automatic offense score branches
- InningtestOFFENSE_POINTSgeneralizes0/1/2draws;ZERO_OFFENSEcompatkept. Local/live2point→empty2nd2:0passedlabels/hide/lock/restore. Actual390live2pointphase/banner,3outs,emptybases2:0inspected. Prior0/1flowevidenceaboveremains;thiscompletescurrent3summarybranches,notallgameQA. Buildsameindex-B5xFmXsW.js,nogamechange. ControlledRNG/clocknotdevice/naturalQA.

## 10:08 Nov19 - angled batting ground return regression
- BatreturntestANGLEcontrolsforcedballhorizontalangleanddistinctcapturepaths. Local/live±35groundpassed1Brelay/return/glove/pitcherfacing/7gazes/reset/input/FOV/runner>=4separation/result1AB0H. Actual390livebothreturnpixelsinspectedleft/rightcollectorplacementsandseparaterunner. Buildsameindex-B5xFmXsW.js,nogamechange. ControlledRNG/clocknotdevice/naturalQA.

## 10:27 Nov19 - fielder attention on catcher return
- Pitcherrolecatcher→pitcherreturnnowupdates7fielderheadyawtowardballusingexistingattentionlimit,zerosgazeafterholdbeforenextpitch. No body/path/timing/count/soundchange.
- Extendedpitch_catch_soundtestasserts7returngazesandnextreset;localstrike/ball/fallbackwhiffpassedrelease/glove/countorder/exact2mitt/result/nextaimchecks.Buildpassed,actual390returnpixelsinspected;fieldersoffcamera,gazeisassertionevidencenotpictureproof. ControlledRNG/clocknotdevice/naturalQA.

## 10:47 Nov19 - catcher-return close evidence
- Pitchcatchtestrendersinspection-onlyrightfieldercloseviewduringpausedreturn;localnormalstrike/livefallbackwhiffpassed7gazes/reset/release/glove/count/2mitt/nextaim. Actualclosepixelsinspectednormal/fallbackmodelshapesandhead/body,preciseyawstillnumericalnotanglemeasurement. Buildsameindex-BAfGSsZ6.js,nogamechange. ControlledRNG/clocknotdevice/naturalQA.

## 11:08 Nov19 - fallback uniform material tags
- Proceduralfallbacktorso+4sleevepartsmarkedisShirt,cap/helmetpiecesisCap;setShirt/setUniformnowupdatesyear/teamcolorslikenormalmodel. Skin/pants/gearuntouched,socksexistinginitialcapcolorunchanged.
- Localproc capuniformbat/pitall3yearscolorsmatched;addedshirtassertiontocaptest. Forcedmodel-failurewhiffreturn/gaze/count/soundresetpassed;actualclosefallbackpixelsinspectedyear3orangeinsteadred. Buildpassed. Notdevice/naturalQA.

## 11:29 Nov19 - fallback role-switch team color regression
- Role-switchtestassertsshirtmaterialsexistandall7battingdefendersred,thenall7newpitchdefendersyear1blueinthesamescene. Local/liveforcedfallbackpitch3K→newbatgroundreturn→newpitchcatchreturn/nextreadypassedcolors/visibility/input/endpoint/results. Actual390liveroundtrippixelsinspectedbluepitcher/catcherandtealbatter. Buildsameindex-DP4uEBi-.js,nogamechange;existingautomatictiepoint/ERunchanged. ControlledRNG/clocknotdevice/naturalQA.

## 11:50 Nov19 - breaking pitch catcher-return integration
- CatchsoundtestPITCHselectscurve/slide/forkandunlocksalltypesatbrk60;assertsallpitchbuttonslockduringwindup/flight/catch/returnandrestoreafterreturnwithselectednamepreserved. Perpitchcapturesavoidcollision.
- Local/livecurve-calledstrike,slider-ball,fork-fallbackwhiffpassedrelease/gloves/7gaze/reset/returnbeforecount/exact2mitt/nextinput. Localdefaultfastpassedtoo. Actual390livecurve-returnandfork-confirmedpixelsinspectedselectedoutline/lock→ready/one-strike. Buildsameindex-DP4uEBi-.js,nogamechange. ControlledRNG/clocknotdevice/naturalQA.

## 12:19 Nov19 - explicit pitcher glove receipt phase
- Catcher/ground/airreturnnowchangesHUDto투수미트수신exactlyonceontheexistingmitt-soundarrival,retainingexistinghold/nextinput/count/outcome/path/timing. No batting/swing changes.
- Extended3soundtestsassertlabelontargetarrivalandcapturereceiptbeforecount/input. Localcatcher/groundout/airoutpassedgloves/countorder/soundtotals2/3/2andnextready. Actual390all3receiptpixelsinspectedlabelandlockedinput;ground/airwideviewballsmall,endpointassertionnotpixelproof. Somecombinedrunsinterruptedby120seclimit;afterstaleprocesscleanupindividualrunsallpassed. Buildindex-B1vxF_bQ.js. ControlledRNG/clocknotdevice/naturalQA.

## 12:32 Nov19 - batting result and automatic phase sync
- BattingHUDnowmatchesconfirmedPAresult(+runs),followuphomein,own/opponentautomaticoffensepoints,andautomatictiebreakratherthanretainingpitcherreceipt/previousphase. Existingbanner/textoutcomes,scoreformula,timers,input,swing/easybatunchanged.
- Batreturntestobservesresult→automaticphasesandcapturesconfirmedresult. Localground/air1AB0H6:7andhit1AB1H1RBI11:10passedreturn/gloves/gaze/yaw/FOV/resultsand0/2pointautolabels. Hitinitialexactlabeltestmissedlegitimate(+1점)suffix;changedprefixcheckthenpassed. Actual390ground/hitresultpixelsinspectedmatchingbanner/phaseandhiddeninput. Buildindex-CFvHLQxd.js. ControlledRNG/clocknotdevice/naturalQA.

## 12:53 Nov19 - noncontact batting input lifecycle
- HideSWING/hint/timing/zone/reticleatmatchstartautomaticplayandateachpitchfinalize,restoreonlynextpitch. Ball/looking/whiffHUDnowmatchesresult. Preventsstaleactionpromptsafterstrikeout/duringautomaticplay;aim/actualdoSwingalreadygated. Timingwindows/pose/outcomes/sleepsunchanged.
- Newnoncontacttestlocalstrike/whiff3pitch→Kandball4pitch→walkpassedhiddenresults/automaticphases,nextpitchrestorecounts3/4,finalAB/hits1/0or0/0. Initialtestcaughtenabledcontrolsinthefirstautomaticinnings,alsocoveredbyentryhidefix. Localgroundreturnregressionpassedunchanged6:7/1AB0H. Actual390strike/whiffpixelsinspected1strike/noswing-guide-zone. Buildindex-CT7SXNiT.js. ControlledRNG/clocknotdevice/naturalQA.

## 13:12 Nov19 - connect clutch trait to existing runner context
- FoundplateAppearance(inn,base)calleromittedrunner,soscoringChancealwaysfalseandclutchradiusbonusneverapplied. Passesexistingrunnerflagonly. Existing+0.025bonus/basewindow/formulasunchanged;doesnotguaranteehit.
- Newactualcontactboundarytestnoforcedhit,meet20/aimoffset.29:base.276vsclutch.301. All4runner/traitcombinationspassed:onlybothproducefaircontactflight,other3foul;timingnearcenter. Actual390localfairflight/foulpixelsinspected. Notstatisticalbalance/natural/deviceQA. Buildindex-DGWlJ1nv.js.

## 13:34 Nov19 - batting runner and clutch context
- SmallHUDrowduringPAshows주자있음/없음andgold찬스효과적용onlywhenbothactive. ClearedafterPA;nofictionalbaseoccupancyforthisabstractbattingrunner. Nooutcome/window/inputchange.
- Localrunner+trait/empty+trait/runner+notraitlabelandactualboundarycontactpassed;noncontactKfullgameverifiescontextabsentduringautomaticplayandnextpitchrestore. Actual390contextpixelsinspectedreadablebelowcountwithoutoverlap;buildindex-BLv0ow_e.js. ControlledRNG/clocknotdevice/naturalQA.

## 13:54 Nov19 - first full UI career integration baseline
- Newcareer_ui_integration_testclicks144actualweeklycommands+allmodals,seed42,automaticmatches,withoutskipWeeks/statinjection. Local/livebat/pitpassed:21/20matches,30/24events,4/11treatmentweeks,2yearreviews+final,oneHoF,inheritancenewweek0.
- Reload24/48/72/96/120/144exactplayerJSONandendingnoduplicate. Actual390livebothendingpixelsinspectedrank/record/buttons. Notdirectmatchcareer,natural/deviceorbalanceQA;PRNGreseedsonreload. Bothrank1score88isreviewleadnotbalanceproof. AddedCANDIDATE_QArequired/deferredmatrix. Buildsameindex-BLv0ow_e.js,nogamechange.

## 14:18 Nov19 - mixed direct/auto career baseline
- CareerMIXEDoptionplaysfirstmatchperyearweeks7/55/103thenremainderauto;noper-week/statinjection. Local/livebat+pit144weeks/ending/HoF/inheritancepassed. DirectimmediateAB/IP/hits/HA/SO/WLdeltaandpreconfirmreloadexactPchecked.
- Controlledbat3K/0H4:10each;pit3IP9K0:1each(autoTB). Livebat68OVR8W12L60AB15H,pit71OVR9W11L94IP82HA75SO;20matcheseach. Debugdt/shortwaits/fixedgamerandom,naturalorvariedinplaynotdone. Actual390liveendingrecordsinspected;titlewordwrappingstillpending. Buildsameindex-BLv0ow_e.js,nogamechange. CandidateQAupdatedremainingpartialcriteria.

## 14:37 Nov19 - full match ledger and varied batting carryover
- Careerledgercapturesallresultsbeforeconfirm,sumsfinalP+HoFfields. Variedbatlocal/liveyear1K/year2forced3H3RBI/year3forced3HR6RBI→20game60AB21H7HR14RBI10W10Lmatched. Livepit20game94IP82HA75SO9W11Lmatched. Ending/reload/HoF/inheritancepassed. Actual390livebatending10W10L7HR89scoreinspected.
- ControlledRNG/forcedballs/debugtime,naturalplaynotdone;pitchdirectstillall9K. CandidateQAupdatedpartialchecks. Buildsameindex-BLv0ow_e.js,nogamechange.

## 14:55 Nov19 - native random, normal-clock one-pitch sample
- NewtestUIresttofirstmatchwithoutweek/stats/RNG/forcedball/dt/timerchanges. Scriptedbatcallbacktimingstillused. Livebatfoul→deadball→nextpitch;localpitairout→return→ready/livepitcalledstrike→catchreturn→ready passed. Actual390live1strike/nextinputpixelsinspected.
- Softwaredesktop.5pixelratio140–152msmeanframegap/most>50ms,12–21swall. Existing50msdtcapmeansslowgameclock;NOTsmoothrealtimenormalspeed/device/humanfeelclearance. Fullnaturalcareerremains. Buildsameindex-BLv0ow_e.js,nogamechange.

## 15:19 Nov19 - six pending states inside complete careers
- INTERRUPTcareeroptionreloadsonceeachchoice/eventresult/matchchoice/matchresult/learned/yearreview;exactPJSONsurviveslocal/livebat+pitthrough144weeks/ledger/HoF/inheritance. Livebat19games57AB19H4HR6RBI10W9L,pit21games105IP96HA78SO15W6L. Actual390liveeventresult+pitendinginspected.
- Seedreset/scriptedauto,natural/device/middirectgame/allbranchesnotdone. Sameindex-BLv0ow_e.jsbuild,nogamechange. CandidateQAupdated.

## 15:52 Nov19 - mid-direct restart inside 3year career
- RESTART+MIXEDlocal/livebat+pit: year1pitchflight/year2strikecount/year3completedPAreload→exactpregameP+startedflag/warning, nosecondtraining. Then3completedgames/144weeks/allledger/P/HoF/oneentry/inheritancepassed. Livebat60AB15H4HR5RBI8W12L,pit94IP82HA75SO9W11L.
- Slowpitrunsexceeded120s;CHECKPOINTsplitsafterdirectgames,samePserializedintoafreshbrowser+ledgercountercarry. ControlledRNG/dt/timers/.1rendering,natural/device/allphasesnotdone. Actual390livewarning+pitendingchecked,wordsplitstillpending. Buildsamebundle,noruntimechange.

## 15:58 Nov19 - scoped Korean word wrapping
- Endingresultbalancedkeep-all;matchdescription+restartnotekeep-all. Synthetic320/360/390/430firstpick+regularbatresume: nooverflow/singlecharline;actual390pixelschecked. Localendingresume4routespassed. Noformula/savedatachange. JSindex-sKm7PEFd/CSSindex-DGcw16Tq.

## 16:26 Nov19 - varied pitcher mixed career
- MIXEDVARIEDpitlocal/liveeachyearwalk/single/foul/HR/ground/air/2Bforce/K→3IP3HA1SO. Year10:3/3ER;year2+3played3:3autoTBfinal3:4/4ER. Directdelta/reload144ledger/P/HoFone/inheritancepassed. Final20games94IP91HA51SO9W11LOVR71score86.
- Exactcheckpointcarry/scriptedaim/RNG/debugtime/notnaturaldevice. Actual390liveyear3result+endingchecked. BuildsameJSsKm7PEFd/CSSDGcw16Tq. Firstcandidateestimate75%unchanged.

## 16:44 Nov19 - policy/seed UI careers
- Live12careersbat/pit×focused/balanced/rest×seed7/123all144/ledger/P/HoFone/inheritancepassed. Localpitrest7+batbalanced123exactmatch. Actual390pitundrafted37score+batfirstpick99scoreinspected.
- All8focused/balancedfirstpick;rest3/4lowround1undrafted. PitrestsameOVR37score37vs60/autowins7vs15suggestevents/evals/randomsensitive;notbalancedclearance. 2seedsresetatsixreloads/firsteventoption/allauto/scripted. Noformulatune/easybatunchanged. Candidateestimate75%unchanged.

## 17:05 Nov19 - continuous QA random+alternate events
- CONTINUOUSpersistssessionPRNGacrossreloads;live12morebat/pit×3policies×seeds2026/99991eventchoiceweek%options,144ledger/P/HoFone/inheritancepassed. Localbatrest2026+pitbalanced99991exactmatch. Actual390undraftedbat53score+balancedpit85scoreinspected.
- 8/8trainedfirstpickagain,rest3undrafted1lowround. Combined16/16trainedfirstpick/rest4of8drafted,selectedpolicyoutcomesnotfairnessproof. Noformulatune. Userphonepathgivenparentwithsaveoverwritecaution;parentwillask. Progress75%unchanged.

## 17:23 Nov19 - native full-game window and candidate gates
- FULL=1nativeRNG/nodt/noforced/notimer95swindow:livebatinning5fairflight140msmeanframes/localpitinning1twoonfairflight168ms. Neitherresultreached,notfullgamepass/notdeadlockproof/NOTphoneperformance. Actual390pixelschecked. Needretainedbrowsermultiwindowcompletion.
- CandidateQArequired/followupgatesseparated;phonecheckmainwilloffer,policyfirstpicksaturationuntuned. Progress75%unchanged. Build/runtimeunchanged.

## 17:51 Nov19 - native-random batting results
- Live1AB1H1:5loss47.58s/local3AB1H3:2win93.84s,noRNG/dt/timer/forcechanges,scriptedtiming. Bothresultreloadexact+confirmoneweekpassed. Actual390resultschecked.139–141mssoftwareframesnotphone/humanfeelclearance.
- NullcountHUDtestfixedafterresult. Longpitretentionexperimentnotreliable,testonlyremoved/noactivebrowser. Normalfullpitcherstillpending. Progress75%/runtimeunchanged.

## 18:03 Nov19 - storage write fault transparency
- Reproducedsilentquotaexceptionweek1memory/week0disk. Pendinglatestwritequeue/player+HoF+delete,topwarning+retry,HoFpendingnotfalsesaved. Faultretrykeepswarning/recoveryexactP/reload/oneHoFpassed;normalending4/full144batpassed. Actual390warninghome+endingchecked. Noability/ruleschange. Notdurabilitywhenwritesdenied/closedtab/crosstab. Progress75%.

## 18:23 Nov19 - unsaved same-tab continuation
- loadpreferslatestpendingplayer/deletion,nottheoldonsdisk. Faultmenu/title/continuePexact+warningkept,unitqueueddelete/newplayer/twoHoFretrypass. Normalending4/144batpassed. JSBV3UPLfL/CSSDyhpIlXV.
- Parent18:20scopequestion:75%onlygrowthcandidate,noproclub/graduateplayerroster. Originalplannothermodenextrun/juniorrivalreusebroaderthanimplementedbonustraitcarry. Parenthasoriginalsource/findings,notnewscopeinstruction.

## 18:43 Nov19 - pro-club shared domain preparation
- Newscopefirstcompletionapproved18:23sourceinPRO_MODE_PLAN. Prior75%/3–5daysnotapplicable;working50–55%/7–12daysjudgmentpendingimplementation/devicerisk,refineNov20~13:35.
- Purepro.jspreparesgraduatetoimmutablecopy/abilitytraitmapping/legacyID/school-prostatseparation/9slotsstarter/snapshotpending/resultIDidempotency+recordvalidation;pro_domain_testpassed. Notmenupersistence/directengine/seasonimplemented. Existingbuildunchanged.
- Parent18:41keepsoneclubvsdraftedclubschoiceunresolveduntil06userreport. Nochoicehardcoded;commonpreponly. PRO_MODE_PLANremainingintegration/gatesdocumentsit. NoUIchanges/pixelsnotapplicablethisbatch.

## Nov19 19:05 - pro storage preparation, not a playable mode
- pro-storage.js prepares separate multi-club root/single-write ledger+totals/pending snapshot persistence; replay validation/corrupt-original preservation/revision stale-call and retry-disk-change guards. Uses integer outs, keeps school stats.
- pro_storage_test + pro_domain_test + growth storage_queue_test pass. Actual Chromium localStorage2clubs/24games+reload each/quota retry/duplicate and exact school save unchanged pass. Build unchanged index-BV3UPLfL.
- Still not imported into running game. Need shared warning/retry UI and conflict handling; club allocation remains unresolved. Admission/menu/direct engine/season still pending. No visual change in this batch.

## Nov19 19:26 - common pro match-session prototype
- All9batters/starter pure PA engine and explicit opponent/innings/seed, shared bases and own/opponent box score, manual outcome hook for later3D integration. Ties continue; bounded run does not fabricate result. No default season/admission policy selected.
- Pending checkpoint stores RNG/order/bases/score/events; replay validation checks it against frozen own roster. Completeboxscores require10players/RBIandERscoreagreement. No main.js imports or live visual change; not playable pro mode yet.
-120seed games+manualwalk/HR/K+exactresume+archiveisolation+completeinvalidrecords passed; actualChromium10checkpoints/30PA/reload exact/resultonce/corruptpreserve passed. Unit/storage2clubs24gameregression/build passed. Next common save warning/conflict UI and3D adapter, then admission policy/menu/season remain.

## Nov19 19:44 - common adapter controller and fictional roster filler
- Fill missing roles with tagged generated base players without admission policy; preserve current choices/graduate stats. Asynccontroller supplies copied current players/context to future3D renderer, saves returned PA once;busy/error/missingoutcome/staleasync/pendingwriteguard.
- Unit tests and actualChromium15callbackPA/reload each/cancel/auto finish/graduate unchanged passed. These are adapter callback tests, NOT real3D batting/pitching tests. No runtime/main.js import or visual change. School difficulty unchanged. Need actual3Dhook+save/error/conflict UI, then admission/menu/season.

## Nov19 20:15 - actual3D single-batting adapter
- Optional onePA context in existing batting renderer returns before school applyMatchResult; pro-batting maps it into controller. No entrypoint/import/menu for pro yet. Copied actual batter abilities/traits/gear, opponent strength/name, base mask/score. School default unchanged.
- Localactual3D K/forcedHR/walk eachonePA→controller→reload passed, exact school save bytes untouched. Accelerated controlledtests, not nativeclock/device/humanfeel. QA screenshot development label inspected.
- School full3PAHR growth+exactresultreload+onceweek regression,4ending routes,storagefailure UI passed. EarlierHRharnessmissingflash caused timeout, fixedtest passed. Needpro pitching3D and real production UI/season.
-20:15 deployed11c6a5f/index-DKWvKAFV verified. Live school3PA3HR/resultgrowth/exactreload/onceweek test passed; actual live result screenshot inspected readable390x844. Pro QA screenshot also inspected with development-only label; not presented as a playable pro menu.

## Nov19 20:28 - pro3D one-opponent-PA pitching adapter
- Optional appearance mode in pitching.js returns before school result/automatic offense. pro-pitching maps copiedcurrentpitcher/opponentcontext to session. No normal pro menu/import yet. Manual infield/forceSafe/forceOut mapped to pure engine/base/replay.
- Actual3D localK/walk/single/HR→onePA save/reload and exact school bytes passed. Accelerated controlled test only. Force3Dadapterdedicatedteststillpending. Schoolrole-switch1IP3K→batgroundout→newpitcher/restoredcatcherumpfieldersreturnpassed. Pro/domain/storage/controller120seed/base/replay suites and build pass. QA image pixels inspected, development label; generated basic pitcher not trainedpitcherUIclaim.

## Nov19 20:47 - pro storage warnings and conflict command guard
- Added store subscription; controller blocksauto/direct/finish for diskconflict before retry. Pending neweststate and externaldisk both retained. Pro notice pending/retry/conflict/readerror states, no destructive reset/overwrite. Notmountedmainyet.
- ActualDOMwidth320–430/pendingretry/conflict/corruptpreservation/destroy passed. Fixed QAviewportafterfirsttinyimage; re-inspected3screenshotsreadable390x844. Need productionmount/unload/recoverychoiceflow. Unitcontroller/storage/domain120seedreplay pass;buildsameindex-ghBQ-Ogm. No live change.

## Nov19 21:08 - conflict backup/explicit selection and unload guard
- Recoverlocal/disk writes+readsback bothrawversions to separate local backup before switch, rechecks competingraw, selectedrevision higher; quota/race/corrupt preserve pending. UI summaries/choice/confirm/cancel, no automatic overwrite. Backuplist/export/restoreUIstillmissing;notmountedproduction.
- beforeunload standardbrowserwarningrequest whilepending (browser/mobilemayignore;notguarantee). Unitbothchoices/rawbackup/quota-backup+main/race/corrupt;realDOMcancel/confirm/fail/success/unload passed.2screenshotsactualpixelsreadable. Buildsameindex-ghBQ-Ogm.

## Nov19 21:28 - local pro backup list/export/restore preparation
- New pro-backups.js/ui/css list two versions/export exact JSON/explicit restore+confirm/current-save guard backup. Neverauto-delete/upload; refusepending/corrupt-current/stalecomparison. Mainunchangeduntilbackupreadbackverified. Import/corruptmainrepairnotincluded.
- Scopedunitlist/export/restore/undocopy/quota/race/corrupt and browserdownloadexact/cancel/restoreguard/schoolisolation/320–430 pass.2previewactualpixelsreadable. No full3D/career rerun. BuildsameghBQ-Ogm;notmountedproductionyet. Nextinternalintegrationorforceprotest,policyunresolved.

## Nov19 21:49 - common pendinggame screen linked to controller/save notice
- pro-session-ui.js/css optionalcomponent inning/side/score/base/currentplayers/rosterstats/directcallback/auto/resultconfirm/back. No mainimport/normalmenu/admissionpolicy/season.
- ScopedrealDOMcallback checkpoint/remount/cancel/auto/resultonce/320–430 +alongside save notice quota→3controlsblocked→retryunblocked pass. Actualpreview+resultpixelsreadable. No3D/longcareerregressionrepeat. BuildunchangedghBQ-Ogm. Next renderer-screen lifecycle or pendingpolicy rosterUI.

## Nov19 22:10 - real direct appearance HUD/lifecycle
- Newpro-direct-ui/js-css actualbat/pitHUD+input+scores/count/banner/contact, hidescallerprosession, adapter→controllerresult, cleanupandhome-scenerestore. Notmainimportyet.
- Scopedactual3DbatK+pitK onePA/controller/save/reload/schoolbytes/overlaycleanup pass acceleratedcontrollednotdevicehuman.2pixels390x844inspected. No fullcareers/old3Dcasesrerun. Nextsession-screen+actualoverlay+noticenavigationmajorlink. BuildsameghBQ-Ogm.

## Nov19 22:32 - prepared mode major link
- pro-mode.js session/actualdirectoverlay/notice/backupnavigation/cleanup assembled independentofadmissionpolicy. Actualbat+pitPA→sameUIcheckpoint, navblocked, backupreturn, autofinish/resultonce, destroy/schoolrawunchanged integration pass.
- Pixelcheckfoundshadow/see-throughpanel;scopedsolidfullheightmode/transparentonlydirect/hidenav/removeshadowsfixedandupdateddirect-return-resultpixelsread. Notmainimport/normalmenu/season/admission yet. BuildsameghBQ-Ogm. Controlledacceleratednotdevicehuman.

## Nov19 22:51 - existing-club roster UI
- Existingroster9slots/starter/abilitysourcecards/pending-save-conflictlock/revisioncheck in pro-roster-ui, preparedmode nav added, NOadmissionpolicy/mainimport/season.
- Scopedbrowsertrainedbat+starter/save/duplicateunchanged/reload/pendinglock/archivebytes/320–430passed,actualpreviewreadable390. Nextlineup→newpending→actualselected3Dintegration atnextlink;notclaimcomplete.

## Nov19 23:13 - pregame fixture and selected lineup actual3D integration
- prepareClubFixture atomicfrozenlineup+session/rootwrite;explicitcallerfixture(id/opp/name/innings/seed),invalidnowrite/quota/retry/samependingresume/differentpendingreject. Pro-mode pregame ifnopending.
- ActualUItrainedbat+starterchoose/save→pregame/start→actualselectedbat/pit3D→UI/auto/result/schoolbytes bothpass. Scopedunitatomicguards pass. Actualpixelssetup+selectedpitreadable390. Notmain/admission/season;test3inningsnotpolicy. Harnesspost-removalassertfixed,notgamedefect.

## Nov19 23:34 - dedicated pro pitching force/infield link checked
- Real prepared3D pitching overlay homeforceout/safe+secondforceout/safe+infieldsafe(nonforced2B)→onecheckpoint/UI/ledger/exactreload/schoolpreserve pass. Noearlycommitduringreceive;safehome1ER/nohit;outnoER;infield1hit/nonforcedhold. Actualpixels390homeout+safereturninspected. Controlleddraw/acceleratedNOTphonehuman. Testsetupdoublebaselineassertcorrected to delta;productionunchanged. No runtime/fullcareerrepeat. Admission/normalentry/season/policy remain open.

## Nov19 23:53 - club records prepared UI
- Readonlyaggregate/proplayertotals/reversehistory/expandindividualrows withpreparedmodenav. Missinglegacystat=unrecorded,inningsintegerouts. Empty→2enginegames/result→reactiveview/reload/readonly/schoolpreserve/320-430/destroy pass. Actualaggregate+detail390pixels inspected. No season/admissionpolicy/normalentry/livechange.

## Nov20 00:16 - pro batting ground race
- appearanceonlygroundphysicalrace/force→forceSafe/forceOut/infieldengine;freshbattinghomeforceinitializescatcher/ump. Actual3Dhomeout/safe+nonforced2Binfield→UI/checkpoint/statdelta/reload/schoolpreservepass. Receivephasebeforecommit;390homeout/safepixelsinspected. Schoolgroundfull1PA+proHRregressionpass. Acceleratednotdevice/balance;constantspeed6provisional. Mainentry/admission/seasonnotdone.

## Nov20 00:34 - graduate bridge preview only
- Readonlysuppliedarchive→abilities/traits/draft/highschoolstats/currentproregistration;invalidrowwarn/notmutate/missingstatsunrecorded. No destination/admit/copy/transfer/mainhook. Focusedbatpit/invalid/nonarray/readonly/schoolproexact/320-430/destroyPASS,pixels390read. Schoolcorruptsaveauditstilloutstanding.

## Nov20 00:55 - school read audit foundation, risk NOT fixed yet
- load/hof currently conflate unreadable/corrupt withmissing;hofnonarrayaccepted→possibleoverwriteonnewsave/archiveappend. Parentinformed,notactualuserdata-lossclaim.
- New nonmutating school-record-read.js explicitstates/rawpreserve/coreplayerarchivechecks;batpit/legacy/malformed/unreadable/nowritePASS. NOTgrowth/mainimported,nestedpendingconsistencynotvalidated. NEXTwriteguard+readerrorUI+recovery+queuecompatibility.

## Nov20 01:17 - school overwrite guard integration
- growthrealdisksourcevalidatedbeforeeachsave/delete/hofwrite;invalid/unreadableblock/preserveexact/queueplayer+separategraduateappend/retryvalidarchiveonce. load/hofstatevalidation. Titlebadsourcebuttonsdisabled+distinctpersistentwarning/retry/noautoerase. Getteraccessdenialhandled.
- Pureguard+queue+readtestsPASS;quota→same-tabcontinue/retry/reload/graduationHofUIregressionPASS;corrupttitle/directpaths/rawexact/validsourceretryonceUIpass;actualwarning390pixelsread. NOTcorruptrepair/download/import/fullnestedeventvalidation/exhaustivelegacy. Actualuserlossnotconfirmed. Deploymentperparentreport.

## Nov20 01:36 - school original/pending export
- No-writeexactraw/state+pendingwrites+pendinggraduatesnapshot;unreadablehasnoraw. Warningdownloadbutton/browseractualfileJSONverified/clone/no-write/pixels390PASS. Notrestore/import/repair;UIaskscheckDownloads. Deploymentperreport.

## Nov20 01:58 - nested resume record checks
- Nestedmatch/result/event/learned/review/yearhistorystructurechecks;optionallegacyabsentallowed/rawpreserved. Allcurrentevent+batpit/yeartransitionpurePASS;actual6pendingUIreloadresumes+malformedblockPASS;existingquota/gradrecoveryUIpass. Notsemanticreplay/exhaustivelegacy. No visualchange/fullcareerrepeat.

## Nov20 02:18 - outgoing school value guard
- Validateincomingserializedwritebeforetouchdisk/pending;badvalue→separaterejectedWritesexport/warning,validqueuepreserved,retrynotclearrejected,later-valid-saveclear. Badgradnotappendqueue. Focusedpure/UI+existingqueue/sourceguard/event/quota-gradUIpass. No semanticreplayclaim. Fonttestharnesscorrectedbeforevisualreport.

## Nov20 02:39 - warning distinction and import preview foundation
- Sourceproblem vs outgoingrejectexplicitwarning/pixels390inspected;outgoing+exportUIpass. Pure8MBrecoveryenvelopepreview validatesallrawcandidates independently/nochoice/nomerge/nowrite/norepair. TestsPASS. PreviewNOTmounted/importNOTimplemented. Deploymentperreport.

## Nov20 03:00 - readonly recovery file inspect UI
- warning→localfilepicker→candidates+notices/nochoose/nomerge/norestore. Asyncstaletoken/sizeguard/textContent. Actualfilecontrolvalid/invalidclear/literalname/no-storage/320-430/closePASS,pixels390read. No upload/import/repair. Restore requires separate guarded design.

## Nov20 03:20 - guarded restore foundation only
- Opaque explicitcandidateplan+confirm,refusepending/rejected/unreadable;fullsourcesbackupexactreadback/freshID/stalesourcebeforeafterbackup/singletargetreadback/once. FocusedfaulttestsPASS. NOTmounted/nolivechange/norestoreUI;must handle reload/currentplayerwhenmounted. No semanticrepair/crosstabatomicityclaim.

## Nov20 03:42 - explicit restore UI link
- validnonpartial/nonrejectedcandidate→reviewconfirm/cancel;fullrawbackupreadback/stalesourceguard/singletarget. Titleonly;refusepending/rejected/unreadable;successPclear/titlefromdisk. Localactualfile/cancel/staleblock/confirm/backupraw/selectedP/reloadPASS,pixels390read. No autochoose/merge/repair/reset;backup-listUIabsent. Deploymentperparentreport.

## Nov20 04:02 - local original backups accessible
- Title→ownprefixlist+exactJSONdownload,malformedrawpreserved/denial/staleguard/norestore-nodelete/noirrelevantkeys. Pure+actualdownloadUI/320-430/no-writePASS,pixels390read. School recovery expansion paused;resume pro corepolicy-independent work.

## Nov20 04:23 - admission transaction foundation
- Explicitexistingdestinationprepare/confirm/copiedgraduate/staleroot/singleroot/quotaretry;no draft/shareddefault/transfer. FocusedtestsPASS. NoUI/mainhook/policydecision.

## Nov20 04:44 - optional explicitdestination admission UI
- Readonlydefaultretained;callerdestinationenablesprepare→summaryconfirm/cancel→saved/pending/registration;noautolineup. ActualUIcancel/confirm/readonlysource/pro0/reload/320-430/destroyPASS;defaultpreview+controllerPASS;pixels390read. NOTmainmenu/policydecision.

## Nov20 05:05 - admission→records major link
- UnadmittedgraduateUIconfirmboth→rosterselection→pregame→actualselectedbat/pit3D→sameUI/checkpoint/autofinish/result→records+independentreload/team1+bothgraduate1game/archive-schoolrawexactPASS. Actualpitch/records390pixelsread. Controlledacceleratednotphonehuman;explicitinjectedclub/test3inningsnotpolicy. Normalentry/seasonstillabsent.

## Nov20 05:25 - explicit fixturelist progress foundation
- Callerlistunique/enginerules/prefixhistory/pendingexactguard→nextatomicprepare/donerefusereplay. 3enginegames/reload/badlist/order/pendingrules/inputexactPASS. No seasonlength/opponentgen/nextseason/listpersistpolicy. Historicalcompletedrulefingerprintsnotstored;notfullscheduleidentityproof. UI next.

## Nov20 05:46 - explicit fixture progress UI
- Prepared optionalfixturesarray→progress/explicitnextprepare/resultnavnext/donenoreplay;singlefixturecompatible. Actual2games/resumestore/result/next/done/2records/schoolrawPASS;pureguards/buildpass;390pixelsread. Test1inningnotpolicy;normalentry/seasonpersistenceabsent.

## Nov20 06:07 - persisted schedule identity
- Optional club.schedule exactcallerlist/id/season/startGame validated,normalstorecannotreplace/remove;legacyaccepted. Modeusesstoredlist/noexternalneeded andvalidatespendingentry. Quota/retry/reload2games/seed-orderguard+persistedactualUI+storageatomicPASS. No defaultseason/rolloveryet. Parent06:01oneownclubimplementationdefault allowed/notusertaste;noquestionblock. Estimate60–65%/5–8daysjudgment,13:35refine.

## Nov20 06:30 normal pro entry
- Title→hub→explicit ownclub creation(10fictionalbaseplayers/3innings6games)→archiveconfirmed admission→lineup→persisted schedule/resume/direct3Dbatting/results/6records/exit-reenter reachable. Oneownclub/default6games are delegated implementationdefaults notuserpreferences. Schooldraft/source preserved. No autoadmit/autolineup.
- Purequota/retry/6games/reload/frozenlist and normalUI/sourceexact/320-430 + corruptpro/no-create,quotaUIretry,invalidarchiveblocked PASS. Actual390pixels inspected. Buildpass. Firstsixgamesonly/nextseasonnotready stated. Next safe explicit rollover + normalpitching/device boundaries. No phonefeel/balancecompletion claim.

## Nov20 06:50 - next season persistent transition
- Completedsavedseason→preview/cancel/confirm→archiveoldschedule+season+new6games one atomicwrite,retainroster/cumulative/results. Exactroot/stale/pending/conflict guards,normalwritescannotchange season/archive. Archivedprefix/order/boundary/ID/seasonlabelvalidation added,legacyaccepted.
- Pure12games/2seasons→3rd/reload/quotaretry/guards PASS; normalUI6→cancel→quota-confirm/retry→2season/reload→7thgame/7records/oldsix+scheduleexact/sourcebytespreserved PASS. Actual430confirm/newseasonpixelsread. Notfullleague/contracts/probalance; nextseason summary/history display andnormalpitch/device.

## Nov20 07:10 season records
- Readonlyseason summaries,W/L/runs/schedulecounts,all-seasonfilterforplayer+game rows,explicitseasonlabels;legacy/incompleteunrecorded preserved. Pureaggregate/playerreconcile+empty/partial/legacy/readonly PASS;recordsUI+normalUI6+1games/2seasons/filter6-1-7/rawexact PASS;390pixelsread. Nextnormalpitching/device boundary.
