# 열 이동 배달 추적소 디자인 감사 요약

- 감사일: 2026-07-17
- 범위: 기능·디자인·UI·접근성, 320px·390px 모바일과 학습 흐름
- 최종 평가: 디자인 품질 **B+**, AI 템플릿 흔적 **A**

## 반영한 개선

1. 열 이동 작업대를 좁은 화면에서 `물체 → 방향 → 물체` 세로 흐름으로 바꿔 이름·온도·재료·알짜 방향의 내부 잘림을 없앴습니다.
2. 안내 활동에서 필수 개념을 먼저 제시하고 자료·안전 설명을 펼쳐 보는 보충 안내로 옮겼습니다.
3. 단계 표시를 완료·현재·예정 상태가 있는 순서 목록으로 바꾸고 `aria-current="step"`과 키보드 포커스를 적용했습니다.
4. 온도 그래프를 가로형 비율로 줄여 원자료 표와 다음 행동이 더 가까이 보이게 했습니다.
5. 모바일 회귀 검사에 320px·390px 작업대 내부 잘림, 44px 터치 타깃, 목록 기본 marker·여백, 단계 상태를 추가했습니다.

## 검증

- `npm test` 통과: 단위 7개, 서버 렌더링 2개
- `npm run test:e2e` 통과: Playwright·axe 3개
- `git diff --check` 통과
- 전후 캡처: `screenshots/before-desktop.png`, `screenshots/before-mobile.png`, `screenshots/before-timeline-desktop.png`, `screenshots/before-timeline-mobile.png`, `screenshots/after-desktop.png`, `screenshots/after-mobile.png`, `screenshots/after-timeline-desktop.png`, `screenshots/after-timeline-mobile.png`

## 의도적으로 남긴 차이

좁은 화면의 7단계 목록은 정보를 줄이지 않고 가로 레일로 유지했습니다. 현재 단계는 즉시 보이고, 나머지는 좌우 스크롤과 키보드 포커스로 확인할 수 있습니다.
