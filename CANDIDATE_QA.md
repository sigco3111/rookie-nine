# First candidate checks

## Checked 2026-11-19 13:54 KST
- Current runtime: 5b31fbf, index-BLv0ow_e.js.
- Seed42 automated UI career, local and deployed, batter and pitcher. No week jumps or injected stats. Every weekly command, automatic match, event choice, learned-trait notice and year review was clicked through the game UI.
- 144 weekly commands each. Batter:21 automatic matches/30 events/4 injury-treatment weeks. Pitcher:20 matches/24 events/11 treatment weeks. Two year reviews plus final year record, graduation and one Hall-of-Fame entry. Same-position inheritance starts at week0.
- Reload at weeks24/48/72/96/120/144 preserves player JSON exactly. Ending reload does not duplicate Hall-of-Fame entry.
- This is scripted selection and seeded random, with rendering reduced. The PRNG restarts at each reload. All matches in this check were automatic. It is NOT natural-time, direct-match career, mobile-device or balance approval.
- Both routes got first overall pick with score88, despite batter10W11L and pitcher12W8L. This is one scripted policy/seed, not a distribution. Focused offensive skills reached99 while field/speed remained low. Need alternative policy/seed comparison before tuning.

## Required before candidate review
- Mixed direct/automatic career for both positions, with direct match results carried through later years and final records.
- Normal-clock representative direct batting and pitching, without forced contact/debug timestep or scripted outcome rolls. Separate from long-career scripted UI checks.
- Real-phone touch, portrait fit, frame rate, loading and sound. No real-device route verified yet. Desktop software rendering is not evidence for phone performance.
- Broader seeds/policies for graduation outcome and progression. Keep easy batting; do not silently retune it.
- Pending match/result/event/learned/year review interruption checks and exact record/ability deltas in integrated careers, beyond six week-boundary reloads.
- Final must-fix list: crashes, progression dead ends, lost/duplicated state, inconsistent action/score/records, unreadable primary controls.

## Current simplifying limits, not newly approved scope changes
- Selected batting appearances and pitcher innings, with remaining action automatic. No full9-inning all-player control.
- Abstract runner context for batting; automatic tiebreak and simplified advancement/scoring.
- Double plays, tag-up, errors and tactical base-running exceptions remain outside current implementation.
- Save is browser-local. No verified cross-device sync.
- Detailed art/content expansion is separate from fixing the core candidate path.

## Mixed career check 2026-11-19 14:18 KST
- Local and deployed, both positions, same no-week/stat-injection UI career. One direct game in each year at weeks7/55/103, automatic remainder.
- Controlled direct batter: three called-strikeout appearances per game,0 hits,4:10. Controlled pitcher:3 innings/9 strikeouts per game,0:1 automatic-tiebreak loss. Debug timestep, shortened waits and fixed per-game random. NOT natural direct play or varied in-play coverage.
- Immediate career AB/IP, hits/hits-allowed, strikeouts and win/loss deltas match each result. Reload before each direct result confirmation preserves exact player JSON. Then weeks through144, reviews, one HoF entry and inheritance passed.
- Deployed batter ending68OVR/8W12L,60AB15H; pitcher71OVR/9W11L,94IP82HA75SO. Each20 matches including3 direct. No runtime errors.
- Remaining mixed-career coverage: fair contact/runner and varied pitching outcomes inside a long career, exact final totals summed across every match, saved pending events and mid-game restart. Do not mark the whole mixed/direct criterion complete yet.
- UI tidy pending from parent: ending first-pick text leaves last Korean character on a separate line at390px. No gameplay block.

## Match ledger check 2026-11-19 14:37 KST
- Every result was copied before confirmation into a test-only ledger; sums compared with final player totals and HoF career fields, not just the retained20-row recent history.
- Batter mixed varied route local/deployed: year1 direct0H/3AB, year2 controlled3H/3RBI, year3 controlled3HR/6RBI. Final20-game ledger60AB21H7HR14RBI10W10L matches player and HoF. Forced fair balls, fixed random and accelerated time, not natural batting.
- Pitcher mixed route deployed:20-game ledger94IP82HA75SO9W11L matches player and HoF. Direct games remain9K each, varied pitcher contact still pending.
- Both finish144 weeks, reviews, ending reload and inheritance with no runtime errors. This closes tested-route final-ledger accounting only. Broader event/seed and natural/device checks still open.

## Native-random normal-clock sample 2026-11-19 14:55 KST
- New normal_random_pitch_ui_test uses actual UI rest weeks to first match, no week/stat injection, no random override, no forced ball or debug timestep, no shortened waits. Inputs are scripted; batter swings from internal timing callback. This is not human play feel.
- Local bat first foul transition sampled; deployed bat foul→dead ball→next pitch confirmed. Local pitcher airout→return→next ready; deployed pitcher called strike→catcher return→next ready. Each only one pitch, not full natural career.
- Software desktop at390x844 and0.5pixel ratio: mean frame gaps140–152ms, most over50ms. Wall flows roughly12–21s. Game's existing50ms timestep cap means clock is NOT real-time at this frame rate. Do not call this smooth normal-speed/mobile clearance. Phone performance remains an explicit blocker to that criterion.

## Pending-state integrated reload 2026-11-19 15:19 KST
- INTERRUPT=1 career test: reload one instance of each pending type within a real144-command UI career: event choice/result at week1, match choice/result week7, learned-trait notice week34bat/46pit, year review week48.
- Local/deployed both positions preserve exact player JSON after each reload. Whole career then finishes with all-match ledger equal to player/HoF, one archived player and inheritance. Batter19games57AB19H4HR6RBI10W9L; pitcher21games105IP96HA78SO15W6L.
- Fixed/restarted seed, scripted commands, automatic games. Does not cover browser termination during a mutation, mid-direct-game restart, all event branches or every pending instance.

## Mid-direct-game restart integrated check 2026-11-19 15:52 KST
- RESTART=1 MIXED=1, local/deployed both positions: year1week7 reload during pitch flight, year2week55 after at least one strike count, year3week103 after a completed strikeout/appearance. No week or player-stat injection.
- Each interrupted attempt leaves player JSON unchanged except persisted pendingMatch.started=true. Reload restores that exact pre-game state with the explicit warning that pitch/appearance/score is not restored and training is not applied again. Existing behavior is restart from match start, not pitch-exact resume.
- Then one completed direct game each year, automatic remainder,144 weeks, full match ledger=player=HoF, one HoF entry, ending reload and inheritance passed. Deployed bat60AB15H4HR5RBI8W12L; pit94IP82HA75SO9W11L. Abandoned partial attempts do not add completed-match records to the checked route.
- CHECKPOINT file option splits this slow test after direct games, copies exact serialized player save into a fresh browser, and carries ledger/test counters forward. Local pitcher and deployed both used this split. The PRNG resets on reload, scripted no-swing/strikeout policy, reduced rendering and accelerated time remain. Does not validate all mid-play phases, mobile background lifecycle, disk failure, cross-tab races or natural play.
- Actual390px deployed restart prompt and pitcher ending inspected. Existing Korean word splitting remains a UI tidy item; controls/warning readable.

## Korean wrap tidy 2026-11-19 15:58 KST
- Scoped ending result and match explanation to word-based Korean wrapping. Ending headline balances its lines. No rules/save/stat changes.
- Synthetic first-pick ending and resumed regular-batter match fixtures at320/360/390/430px: no clipped text/horizontal overflow/single-character lines. Actual390px ending and match prompt pixels checked. Fixtures are layout checks, not earned progression.
- Ending resume regression: bat/pit with/without last-week learned trait, twice reload exact player+text, one HoF entry and new-player flow passed locally.

## Varied pitching inside mixed career 2026-11-19 16:26 KST
- MIXED=1 VARIED=1 POS=pit CHECKPOINT route local/deployed: each year's direct game includes four-ball walk, singles, foul, home run allowed, ground/air outs, second-base force outs and one strikeout. Result labels logged. No player-stat/week injection; selected RNG produces the intended outcomes, with accelerated time/render reduction and scripted aim/buttons.
- Each game3IP/3HA/1SO. Year1:0:3/3ER; years2/3:3:4, played3:3 with automatic tiebreak final point included in ER, matching existing disclosed rule.
- Direct result delta and pre-confirm reload,144weeks, all-match ledger/player/HoF totals, one HoF entry, ending reload and inheritance passed. Final20-game totals94IP91HA51SO9W11L,OVR71/score86. Exact saved-player checkpoints between direct games as earlier check.
- Actual deployed year3 result and ending inspected. Existing long-career pitcher route now includes fair-contact/walk/foul/runner/force outcomes, but not all outcomes or native input/random/device clearance. Estimated first-candidate progress stays about75%, since natural play, real-phone and policy/balance work remain.


## Policy/seed UI comparison 2026-11-19 16:44 KST
- Deployed12 complete UI careers: bat/pit × focused/balanced/rest × seeds7/123.144weeks, all-match ledger=player=HoF, one HoF, final reload/inheritance all passed. Local pit/rest7 and bat/balanced123 reproduce exact final stats and ledger totals. Actual390px undrafted pit/rest7 and first-pick bat/balanced123 inspected.
- Focused is prior offense/velocity-control policy; balanced cycles8practice/support options with study<42 and condition<45 priorities; rest always rests except forced injury care. All pick first event option. Seed resets at six scheduled reloads. Commands through UI, all games automatic, no week/stat injection, not native human/random or a representative balance distribution.

|Position|Policy|Seed|OVR|Draft score|Rank|W-L|
|---|---|---:|---:|---:|---:|---|
|bat|balanced|123|79|99|1|15-7|
|bat|balanced|7|78|97|1|13-7|
|bat|focused|123|68|90|1|11-10|
|bat|focused|7|69|89|1|12-7|
|bat|rest|123|44|59|32|2-16|
|bat|rest|7|37|60|27|13-9|
|pit|balanced|123|67|87|1|20-4|
|pit|balanced|7|69|84|1|12-8|
|pit|focused|123|71|90|1|20-1|
|pit|focused|7|72|92|1|20-3|
|pit|rest|123|37|60|30|15-4|
|pit|rest|7|37|37|0|7-12|

- Findings to investigate, not a retune decision: all8focused/balanced routes first pick;3of4rest routes lower-round,1undrafted. Rest pitcher sameOVR37 but score37or60 with7or15wins, so events/evaluations and random auto games have material effect. Balanced batter reaches78–79OVR versus focused68–69, while focused pitcher71–72 exceeds balanced67–69.2seeds cannot establish fairness/difficulty; broader continuous-PRNG seeds/event choices needed. No gameplay formulas changed, easy batting preserved. Estimated first-candidate progress stays75%.


## Continuous PRNG and alternate events 2026-11-19 17:05 KST
- CONTINUOUS=1 persists test PRNG state in sessionStorage after each draw and restores at setup after scheduled reloads, instead of reseeding.12additional deployedUIcareers: bat/pit×3policies×seeds2026/99991. Event option index=week modulo option count, rather than always first option. Native game logic still consumes draws outside setup during page construction; this is a seeded QA stream, not natural randomness proof.
- All144weeks/ledger=player=HoF/one archive/reload/inheritance passed. Local bat/rest2026 and pit/balanced99991 exactly match final stats/sums. Actual390px undrafted batter and balanced pitcher ending inspected.

|Position|Policy|Seed|OVR|Score|Rank|W-L|
|---|---|---:|---:|---:|---:|---|
|bat|balanced|2026|82|102|1|11-8|
|bat|balanced|99991|75|97|1|16-3|
|bat|focused|2026|69|91|1|18-4|
|bat|focused|99991|66|89|1|16-5|
|bat|rest|2026|37|53|0|5-13|
|bat|rest|99991|36|59|20|13-7|
|pit|balanced|2026|70|88|1|17-3|
|pit|balanced|99991|69|85|1|10-6|
|pit|focused|2026|69|87|1|15-3|
|pit|focused|99991|66|86|1|14-3|
|pit|rest|2026|37|40|0|10-10|
|pit|rest|99991|36|45|0|9-10|

- Again8of8focused/balanced routes firstpick, rest3undrafted/1lowerround. Across both policy batches16of16trained firstpick, rest4of8drafted. This is evidence that these selected trained policies readily reach the highest draft band, not a balanced-distribution claim or instruction to make batting harder. No gameplay tuning. More gameplay is needed before deciding whether broad graduation thresholds should change. First candidate estimate remains75%.

## Unaccelerated full-game window 2026-11-19 17:23 KST
- FULL=1 normal_random_pitch_ui_test extends single-pitch test to95second game-completion window. Native RNG, no forced ball, no timestep or timer changes, scripted per-pitch timing/swing or throw input. This remains software desktop at390x844/pixel ratio0.5, not human timing/mobile hardware.
- Deployed batter:95.44seconds/680frames/140.17ms mean gap,676gaps>50ms, result not reached; screenshot inning5/1:3 fair-ball flight. Local pitcher:95.40seconds/568frames/167.83ms mean,565gaps>50ms, result not reached; screenshot inning1/0:0 with1B+2B runners/ball flight. Earlier pitch outcomes and returns/next input progressed. Neither is full-game clearance or evidence of a deadlock. Existing50ms delta cap slows the game clock in this rendering environment.
- Actual pixels inspected. No runtime or difficulty changes. Need multi-window retained-browser normal-clock test to reach result, plus actual-device signal separately.

## Candidate gate list, current as of 17:23
### Required before calling this a first candidate
- Finish representative native-random/unaccelerated batter and pitcher games, then verify result carry/save/next week. Scripted controls still must be labeled; human feel is a separate gate.
- Actual-phone portrait/touch/loading/frame pacing/audio-after-gesture. Main will offer a short device-specific check, not ask the user to repeat a full career. No phone result yet.
- Review balance goal with observed trained-policy first-pick saturation. Current24automated UI careers show trained16/16firstpick and rest4/8drafted. A convenient policy sample, not a target distribution. No tune until intended challenge and more play evidence support it; preserve easy batting.
- Resolve any reproducible crash/progression stop/lost or duplicate save/inconsistent action-score-record/unreadable primary control found in the remaining checks. Previously checked paths pass, not proof that none exist.
### Follow-up unless it breaks the above core
- More assets/content/animation polish, larger event variation, broad statistical balance beyond obvious progression problems.
- Full9inning/all-player/tactics, doubleplay/tagup/error/steal/bunt expansion. Not included in previously explained first-candidate estimate.
- Cloud/cross-device saves. Current local-browser save and match-from-start restart are disclosed limits, not silent pitch-level resume promises.
### Outlook
- First-candidate management estimate stays about75%(70–80judgment range), implementation54/60+validation20/40 rounded. Not elapsed-time fraction or objective measurement. The3–5additional-day planning estimate fromNov19requires later refinement; a phone issue could extend it. User makes final completion decision.

## Native-random batting result reached 2026-11-19 17:51 KST
- No forced ball/timestep/timer/RNG override, scripted timing input only, software desktop390x844/pixelratio0.5. Deployed batter completed1AB1H,1:5 loss in47.58s(mean141msframes); local batter completed3AB1H,3:2win in93.84s(mean139msframes). Different native-random careers, not a local/live identical-result comparison.
- Both result JSON survives reload exactly; confirmation advances exactly one week. Actual result pixels inspected. This closes one representative native-random batting result/reload/confirmation route, not human timing feel/phone performance or every batting outcome.
- Corrected test reading missing count HUD after result, optional query returns null; earlier reached result triggered a test-only null-element error, not game error.
- Long pitcher session experiments failed to retain browser state across observation windows reliably (test viewport reconnection reloaded page, then attempted persistence route lost process). Those attempts are not gameplay failures or completion evidence. Experimental script removed, no retained browser left. Pitcher normal full-game result still required. Progress remains75%.

## Storage-write failure warning/retry 2026-11-19 18:03 KST
- Found silent catch in player/HoF writes. Reproduced by injected QuotaExceededError: UI week1 while disk remainsweek0, previously no user warning. This is fault injection, not an observed user-device incident.
- Central write queue keeps latest player/HoF/deletion operation in memory, shows persistent top warning outside screen clears, names affected data and closing/refresh loss risk, with retry button. Recovery flushes exact latest JSON without repeating weekly action. HoF read includes pending in-memory list and ending says awaiting save rather than falsely saved. Retry clears warning only after all writes succeed.
- Local fault tests: failed retry keeps warning; restore storage+retry produces exact player JSON; reload exact; HoF and player both denied, then retry/reload creates one archived player, no duplicate. Normal ending4routes and full144week batter career regression pass. Actual390px home+ending warning pixels inspected.
- This is transparent recovery while tab stays open, not durable storage when browser denies writes, not cross-tab synchronization, and not protection against user closing while warning remains. Corrupt-read/migration handling still needs audit. Candidate estimate stays75%.
