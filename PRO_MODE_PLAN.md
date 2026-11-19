# First-candidate pro-club connection

## Authority and scope
- First-completion scope expanded2026-11-19 to first-completion inclusion after the question describing graduate admission→team roster→use in games→saved team results/progression.
- Earlier75% and3–5additional-day estimate only covered school-career candidate. Do not apply them to this scope.
- Working estimate50–55%,7–12additional days, judgment only, not a deadline. Device/engine problems can extend beyond2weeks. RefineNov20~13:35.
- Pending user choice, held until main's06:00 report: gather multiple graduates in one managed club, or retain each graduate's drafted club. Neither is decided. Common domain below supports either policy; no admission gate or transfer rule implemented.

## Shared implementation preparation
- Graduate immutable school record→pro roster copy, stable identity, ability/trait values retained. School and pro statistics separate. Old archives supported without changing their payload.
- Club schema1: roster,9batting slots,starting pitcher,season,team record,history,applied result IDs,pending game.
- Validate duplicate lineups, batter/pitcher role, missing roster members. Game starts by copying selected lineup and pitcher. Until pending game resolves, roster selection cannot change.
- Applying a result checks pending ID/participants/score/stat fields, changes team totals once and maintains a full ledger. Reapplying returns unchanged state. Not a browser transaction yet.
- src/pro.js and src/pro-storage.js are preparation, not a playable mode. pro_domain_test covers copy isolation/admission duplicate/lineup roles/pending snapshot/serialization/rejected outcomes/result idempotency. The store adapter is tested with actual browser localStorage but is not imported by the running game. Nothing is wired into menus, the direct match engine or season schedule yet.

## Next integrations
1. Shared storage queue with separate pro save key and error state; validate/migrate saves without overwriting school/HoF. Persist game checkpoint/result application together.
2. Club/roster UI and starter/lineup edits, graduate selection after user's admission-policy answer. Provide generated fictional teammates for unfilled roles. Generated templates are not archived graduates.
3. Adapt direct match inputs: existing engine mutates a school player, evaluations and condition. Pro mode must use a session copy with pro context and route result to pro ledger, never school graduate or evaluation stats. Multiple selected graduates must affect appropriate appearances/starting pitcher, not only a cosmetic list.
4. Team game schedule/standings/season progress, automatic games with same ledger path, completed-season review and next-season save. Short schedule counts/rules are implementation proposals, not agreed user requirements.
5. Full graduate→admission→lineup→direct+auto→season→reload flow and interruption/exact record checks. Device/human feel and outstanding school-save audit remain shared gates.

## Outside the current explicit request, not removed from the whole project
- Contract salary/economy/transfer negotiations, real-world club/player licensed assets, full9inning all-player tactical control are not silently added.
- Junior/rival reuse was discussed in original plan but not yet implemented; pro integration does not retroactively mark it done.

## 19:05 shared persistence preparation
- Separate rookie9.pro.v1 root holds multiple clubs without choosing their admission policy. Full result+ledger+pending state is one localStorage write, not separate partial counter updates. School/HoF keys are never touched.
- Club validation replays ledger entries and compares all team/player totals; schema, duplicate roster/history/club IDs, lineup roles and pending snapshots checked. Unreadable/mismatched records remain untouched and return error, never an empty successful load. No previous deployed pro schema requires migration yet.
- Queued failures retain latest state in the same store instance. Retry writes once; browser closure before retry leaves the last successfully saved pending match, not half-applied results. Save revisions reject stale callers; retry compares original disk payload and holds if another instance wrote in between. This is an optimistic conflict check, not a distributed lock or cross-tab transaction. Conflict recovery UI remains to implement.
- Pro pitching uses outs as an integer, not decimal innings, so partial innings can be represented without rounding. School archive remains unchanged.
- Unit tests cover malformed JSON/schema, altered totals/participants, quota failure, retry, duplicate result, stale caller and another-instance conflict. Real Chromium test uses2clubs/24games with a real reload after every game, quota failure/retry, and exact school-save preservation. No pro UI is available yet.

## 19:26 common match-session prototype
- pro-match.js prepares a pure all9-batter/starter match session. Caller explicitly supplies opponent snapshot, inning count and seed. Team allocation, season schedule and default rules remain undecided; nothing is imported by main.js.
- A plate appearance accepts a manual outcome or draws an automatic outcome. Batting order continues between innings; bases reset at three outs. Shared base-advance logic and individual box scores produce team runs. Multiple graduates' abilities are used at their own turns; starting pitcher abilities affect opponent appearances. This is a simulation prototype, not3D batting/pitching integration.
- Seed/RNG state, order, outs, bases, score, box scores and events survive serialization. Checkpoint validation replays outcomes and confirms own-team snapshot matches the pending lineup. It checks internal consistency, not cryptographic authenticity of client-side data.
- Complete-result path requires all10participants, valid role fields, RBI total equal to own runs and earned runs equal to opponent runs. Prototype has no errors, walk-off, substitutions, fatigue or sac flies. Those are not claimed complete. Opponents bat as a full team too. Tied full innings continue; automatic run has a bounded-appearance limit and returns unfinished instead of inventing a winner.
- Probability thresholds are provisional isolated rules. They do not modify school batting feel or certify balance. Basic meet/power/speed, pitcher velocity/control/break and fielding affect outcomes; not every trait or ability has been modeled.
- Tests:120seed games all10player totals/team score/replay/school preservation; manual walk/HR/strikeout; interruption/reload exactly equals uninterrupted continuation; invalid checkpoint rejected. Actual Chromium10checkpoints/30PA with reload after each confirms exact final result and once-only save; corrupt total remains untouched. Storage browser2clubs/24games regression still passes.

## 19:44 adapter/controller and empty-slot preparation
- pro-teammates.js fills empty batting slots and missing starter with explicitly generated fictional base players. It preserves chosen slots/starting pitcher and prefers existing roster players. Graduates retain source=graduate, base players source=generated. This does not admit anyone to a particular club or settle one-club vs drafted-club policy.
- pro-controller.js passes copied current batter/pitcher and inning/base/score context to a future async renderer adapter, validates the returned PA outcome, then saves the next checkpoint. It does not call existing3D batting/pitching code yet. Callback tests are not3D integration evidence.
- Busy guard prevents simultaneous commands; missing/error/cancelled outcomes leave the checkpoint unchanged. While awaiting a renderer result, a newer stored revision invalidates that result rather than applying it to a changed game. A pending failed save blocks starting direct play. Automatic checkpoint/result writes still use store retry semantics.
- Unit tests use trained batter and trained pitcher, callback copy isolation, generated roster idempotency, async collision, exception/undefined outcome, quota/retry and exact previous-checkpoint restore. Actual Chromium15callbacks with reload after each/cancel/automatic finish/graduate stats preserved passed. No new UI exists and the live bundle remains unchanged.

## 20:15 actual3D single-batting-appearance connection
- Existing playMatch accepts an optional single-appearance context. It uses supplied opponent strength/name/base mask/score, runs the same batting inputs and animations, then returns a PA result before school growth/whole-game simulation. Default school path remains unchanged. Pro player is a copied ability/trait/gear object with no school-save reference.
- pro-batting.js converts current pro batter/pitcher context to this path and maps the returned hit/walk/out to the pro session. This helper is not imported by the normal game entrypoint yet. There is still no pro menu or player-accessible pro match.
- Local actual3D browser tests via controller: strikeout, forcedHR, walk each committed one PA, reloaded the checkpoint and preserved school-save bytes. Tests accelerate clocks/rendering and control RNG/outcomes. This proves animation/result plumbing, not human input feel or natural balance. A prototype screenshot explicitly labels development-only UI. Initial HR harness lacked flash() and timed out; corrected harness then passed. No game logic fault was inferred from that harness failure.
- School default full3PA forcedHR match still applies growth, survives exact result reload and advances one week on confirmation.4ending routes and quota warning/retry regression passed. Pro pitching3D adapter and production warning/conflict/roster/season UI remain outstanding.

## 20:28 actual3D single-pitching-appearance connection
- Optional single-appearance context in playPitching uses supplied inning/outs/bases/score and opposing batter strength, returns one opponent PA before automatic offense or school result effects. pro-pitching.js passes a copied current pitcher and maps outcomes into the pro controller. Not imported by main.js; no pro menu exposed yet.
- Pro session manual outcomes now include infield hit and force-safe/out, using shared forced-runner logic. Basic replay/base/RBI assertions cover them. These paths do not add errors or substitutions.
- Local actual3D tests: strikeout, targeted-outside-zone walk, controlled single and HR each commit exactly one opposing PA, reload and preserve school-save bytes. Tests accelerate time, use software rendering and controlled random values; no claim of normal pacing/device feel. Force-play3D-specific adapter paths still need dedicated integration tests, although existing school force logic and pure pro mapping are tested.
- School role-switch regression passed: complete1IP3K→batting groundout/return→new pitching catcher/ump/fielders and return restored. Screenshot actual pixels inspected. Additional school/pro unit suite passes. Generated basic pitcher is used in the QA image, not a claim of trained-pitcher UI; trained-pitcher ability copying is covered separately by controller tests.
