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
