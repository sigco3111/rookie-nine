# First-candidate pro-club connection

## Authority and scope
- User2026-11-19 18:23 KST, phonemsg-01M7SHWGKVYVSZ1FAHW89H7PHK approves first-completion inclusion after the question describing graduate admission→team roster→use in games→saved team results/progression.
- Earlier75% and3–5additional-day estimate only covered school-career candidate. Do not apply them to this scope.
- Working estimate50–55%,7–12additional days, judgment only, not a deadline. Device/engine problems can extend beyond2weeks. RefineNov20~13:35.
- Pending user choice, held until main's06:00 report: gather multiple graduates in one managed club, or retain each graduate's drafted club. Neither is decided. Common domain below supports either policy; no admission gate or transfer rule implemented.

## Shared implementation preparation
- Graduate immutable school record→pro roster copy, stable identity, ability/trait values retained. School and pro statistics separate. Old archives supported without changing their payload.
- Club schema1: roster,9batting slots,starting pitcher,season,team record,history,applied result IDs,pending game.
- Validate duplicate lineups, batter/pitcher role, missing roster members. Game starts by copying selected lineup and pitcher. Until pending game resolves, roster selection cannot change.
- Applying a result checks pending ID/participants/score/stat fields, changes team totals once and maintains a full ledger. Reapplying returns unchanged state. Not a browser transaction yet.
- src/pro.js is pure preparation, not a playable mode. pro_domain_test covers copy isolation/admission duplicate/lineup roles/pending snapshot/serialization/rejected outcomes/result idempotency. Nothing is wired into menus, direct match engine, local persistence or season schedule yet.

## Next integrations
1. Shared storage queue with separate pro save key and error state; validate/migrate saves without overwriting school/HoF. Persist game checkpoint/result application together.
2. Club/roster UI and starter/lineup edits, graduate selection after user's admission-policy answer. Provide generated fictional teammates for unfilled roles. Generated templates are not archived graduates.
3. Adapt direct match inputs: existing engine mutates a school player, evaluations and condition. Pro mode must use a session copy with pro context and route result to pro ledger, never school graduate or evaluation stats. Multiple selected graduates must affect appropriate appearances/starting pitcher, not only a cosmetic list.
4. Team game schedule/standings/season progress, automatic games with same ledger path, completed-season review and next-season save. Short schedule counts/rules are implementation proposals, not agreed user requirements.
5. Full graduate→admission→lineup→direct+auto→season→reload flow and interruption/exact record checks. Device/human feel and outstanding school-save audit remain shared gates.

## Outside the current explicit request, not removed from the whole project
- Contract salary/economy/transfer negotiations, real-world club/player licensed assets, full9inning all-player tactical control are not silently added.
- Junior/rival reuse was discussed in original plan but not yet implemented; pro integration does not retroactively mark it done.
