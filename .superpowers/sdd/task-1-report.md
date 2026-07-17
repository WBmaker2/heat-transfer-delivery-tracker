# Task 1 implementation report

## Status

Complete. The Sites starter was replaced with the Korean educational MVP `열 이동 배달 추적소`.

## Files changed

- App shell, Korean metadata, responsive styles, dialogs, model guide, scenario flow, workbench, graph, and accessible temperature table
- Fixed content catalog for the five required scenarios and shared domain types/rules
- Direction, catalog-validation, sequential-reveal, and rendered-Korean-content tests
- README and six focused documents in `docs/`
- Starter preview files and `react-loading-skeleton` removed

## RED evidence

Command:

```bash
npm run test:unit
```

Observed expected failure before implementation:

```text
ERR_MODULE_NOT_FOUND: Cannot find module src/domain/heatDirectionJudge.ts
```

The failing test referenced the planned direction judge, scenario catalog, and reveal-state rules before those modules existed.

## GREEN and full verification

```bash
npm run test:unit
# 3 passed: direction judgment, five-scenario catalog validation, sequential reveal

npm run lint
# passed

npm run build
# passed: vinext/Cloudflare Worker-compatible build

npm test
# 5 passed total: 3 domain tests and 2 rendered-output tests

git diff --check
# passed
```

`npm install --package-lock-only --ignore-scripts` refreshed the lockfile after removing the unused skeleton dependency. npm reported 14 pre-existing dependency audit findings; no audit remediation was applied because it is outside the MVP scope.

## Self-review

- The model guide explicitly distinguishes heat from a carried object and requires a number-based direction choice.
- All five fixed scenarios are rendered from one shared frame catalog; workbench text, chart, table, and result record use the same frame data.
- Frame reveal is sequential and requires an observation confirmation; future table/chart values are not rendered.
- Direction, transfer mode, and required evidence must be selected before a readable result record appears.
- The header includes Help, Teacher Guide, and the required dated `2026-07-17 · v1.0.0` update dialog.
- No browser storage, login, personal input, external font, sensor, upload, tracker, or external API was added.
- Controls use native button/radio/checkbox semantics, visualizations have text/table equivalents, styles include a 320px layout and reduced-motion support.
- All authored application code files are under 500 lines.

## Concerns

- The parent-owned development server was intentionally not started or replaced. Local ports 3000 and 5173 were not reachable during this task, so visual browser walkthrough/screenshot QA remains for the parent’s existing server session.
- The repository’s `npm install` audit reports 14 dependency findings (1 low, 7 moderate, 6 high), which were already outside this feature’s requested dependency scope.

## Commit

`fd18c9fa9cbe447d01d77a2e6d3f0c2d387b2186` — `feat: build heat transfer delivery tracker MVP`

---

## Review-fix wave (2026-07-17)

All Critical, Important, and Minor findings in `task-1-review.md` were addressed in one change wave.

### RED evidence

```bash
npm run test:unit && npm run build && node --test tests/rendered-html.test.mjs
```

Observed expected RED failure before production changes:

```text
ERR_MODULE_NOT_FOUND: Cannot find module src/domain/learningRecord.ts
```

The expanded tests referenced the planned final-direction acceptance/result rule and fixed chart-domain rule before those modules existed.

### GREEN and full verification

```bash
npm run test:unit
# 5 passed: direction judgment, catalog shapes, sequential reveal,
# final-direction acceptance/revision, full-scenario fixed chart domain

npm run lint
# passed

npm run build
# passed

node --test tests/rendered-html.test.mjs
# 2 passed: Korean rendered content plus dialog/card-table structure checks

npm test
# 7 passed total: 5 domain tests and 2 rendered-output tests

git diff --check
# passed
```

### Review fixes

- Workbench now renders frame-edge endpoints; chart and table render every scenario body, including the source-event surrounding room.
- Wrong final directions now remain on the review step with specific feedback. Result records show the accepted student final choice, initial prediction, maintained/revised status, selected mode, and selected evidence.
- The solid-conduction scenario now has four positions. Scenario 5 is a three-station conduction/convection/radiation audit with a three-path result record.
- Chart limits derive once from all scenario frames, not revealed frames. Small screens use stacked data cards instead of a horizontally scrolling table.
- Dialogs set initial focus, keep Tab/Shift+Tab inside, close on Escape, and restore focus to their trigger.
- Package metadata is now `heat-transfer-delivery-tracker` version `1.0.0`.

### Fix commit

`7ad37f5f095e2ec0ca2e76b38c980efa59d966e7` — `fix: address educational MVP review findings`

---

## Re-review fix wave (2026-07-17)

Scenario 5 now uses the same condition → prediction → sequential frame reveal → final review → mode/evidence → result-record contract as every other scenario.

### RED evidence

```bash
npm run test:unit
```

Observed expected RED failure before implementation:

```text
SyntaxError: learningRecord.ts does not provide an export named areAcceptedFrameDirections
```

The expanded tests required frame-derived final-audit direction and mode answers before the derivation helper existed.

### GREEN and full verification

```bash
npm run test:unit
# 6 passed: adds final-audit frame-derived directions and modes

npm run lint
# passed

npm run build
# passed

node --test tests/rendered-html.test.mjs
# 2 passed: rendered Korean content plus no separate audit-flow branch

npm test
# 8 passed total: 6 domain tests and 2 rendered-output tests

git diff --check
# passed
```

### Re-review fix

- Removed `AuditScenarioFlow`, `auditStations`, and duplicated direction/mode answer strings.
- Added frame-linked `predictionFrameIndex`; all prediction and final answers now derive from `TransferEdge` data through `frameDirectionAnswers`.
- Scenario 5 now exposes three sequential frames, each with the three station edges. Its workbench displays all three routes at every revealed frame.
- The common flow records all three initial predictions, their maintained/revised status, all accepted final directions, all selected modes, selected evidence, and the limitation text.

### Fix commit

`6785cfd7a7eb85f795d35925c25a6795ed1203ac` — `fix: unify final audit learning flow`

---

## Final graph-accessibility fix (2026-07-17)

Scenario 5 now assigns six distinct, color-independent visual treatments to its six temperature series.

### RED evidence

```bash
npm run build && node --test tests/rendered-html.test.mjs
```

Observed expected RED failure before production changes:

```text
AssertionError: chart source unexpectedly matched /% 4/
```

The focused rendered/source test caught modulo-four reuse before the six-series treatment was implemented.

### GREEN and full verification

```bash
npm run lint
# passed

npm run build
# passed

node --test tests/rendered-html.test.mjs
# 2 passed, including six unique series/dot/legend class checks

npm test
# 8 passed total: 6 domain tests and 2 rendered-output tests

git diff --check
# passed
```

### Fix

- Removed modulo-four class assignment from the chart.
- Added six unique line patterns and point shapes: filled circle, hollow circle, square, diamond, triangle, and cross.
- Added matching six legend line/shape treatments, so a learner does not have to rely on color alone.

### Fix commit

`76eaa03f0b4f097cd40aa3d13f6d315a6b16621d` — `fix: distinguish all final audit chart series`

---

## Whole-branch pre-publish fix wave (2026-07-17)

All findings 11–16 were addressed, including the approved real-browser Playwright and axe coverage.

### RED evidence

```bash
npm run test:unit; npm run test:e2e
```

Observed expected failures before implementation:

```text
revisionStatus returned 수정함 instead of 조건이 바뀌어 새 경로를 확인함
catalog validation returned only the previous basic-information error
sh: playwright: command not found
```

After installing the focused plan-required dependencies, real E2E also exposed the two implementation issues fixed in this wave: a 320px document width of 340px and an incorrect keyboard test final-direction action.

### GREEN and full verification

```bash
npm run test:unit
# 7 passed

npm run lint
# passed

npm run build
# passed

npm test
# 9 passed total: 7 domain tests and 2 rendered-output tests

npm run test:e2e
# 2 passed in real Chromium: guide/keyboard/sequential feedback and
# dialog/320px/200 percent/reduced-motion/forced-colors/axe coverage

git diff --check
# passed
```

The macOS Chromium process required the permitted unsandboxed test invocation; Playwright's managed web server builds a fresh app on port 4173 and closes it after the suite, without changing the parent development server.

### Review fixes

- Result revision status now uses stable frame-edge path IDs. When the observed path changes in scenarios 2 or 3, it says `조건이 바뀌어 새 경로를 확인함` instead of implying an incorrect student revision.
- Added `mixed` as the surrounding-cooling mode. Scenario 2 now says the object moves heat to the surroundings through several possible ways, rather than claiming direct contact conduction.
- Added focused content validation for endpoint IDs, 0–80°C integer data, open-system source states, evidence/mode presence, equal-temperature no-direction, and the documented closed-pair invariant.
- Stage changes focus a new heading, newly revealed frames announce through `aria-live`, previous-step navigation preserves revealed data, and reset uses a confirmation dialog with focus restoration.
- Added `@playwright/test` and `@axe-core/playwright`, a fresh-build Playwright configuration, and real browser coverage for the approved keyboard, modal, responsive, zoom, media, and axe cases.
- Added a student-readable v1.0.0 update-history note about clearer graph marks and the several-ways cooling clarification.

### Fix commit

`2ee51cb24e8f3f7027a0d4b949b5e8f7d745b4b9` — `fix: complete pre-publish learning and accessibility review`

---

## Browser-depth re-review fixes (2026-07-17)

Findings 17–19 are resolved with real Chromium keyboard and responsive checks.

### Focused RED evidence

```bash
npm run test:e2e
```

The new browser assertions first exposed these production failures:

```text
사건 처음부터: expected min-height 48px, received auto
active 320px scenario: expected document scrollWidth <= 320, received 331
```

The latter came from the workbench's horizontal route layout squeezing a long direction explanation past the 320px document edge.

### GREEN and full verification

```bash
npm run test:e2e
# 2 passed in real Chromium

npm run test:unit
# 7 passed

npm run lint
# passed

npm run build
# passed

npm test
# 9 passed total: 7 domain tests and 2 rendered-output tests

git diff --check
# passed
```

### Fixes and browser proof

- Applied the standard 48px `.button` sizing to `사건 처음부터`.
- Made 320px workbench routes stack vertically, with shrinkable/wrapping direction text and consistent border-box sizing; the active workbench and small-screen card table now have no document-level horizontal overflow at 320px and 200% page scale.
- Replaced action-under-test locator clicks/checks with actual keyboard navigation: Tab, Shift+Tab, Space, Enter, plus radio-group arrow navigation. The representative case reaches the workbench, preserves a revealed frame after Previous, checks a wrong final answer, then completes mode, evidence, and result record.
- Verified newly revealed frame live text, reset-dialog cancel/confirm, and reset focus restoration.
- Ran axe with zero violations on the guide, an active timeline scenario, and an open reset dialog; reduced-motion and forced-colors media queries are asserted as active with applied computed styles.

### Fix commit

`8d9db8fe31976b770d79f0912f78112db387a72a` — `fix: deepen browser accessibility coverage`
