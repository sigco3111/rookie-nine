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
