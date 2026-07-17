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
