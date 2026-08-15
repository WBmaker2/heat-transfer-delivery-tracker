# 열 이동 배달 추적소

초등학교 5~6학년이 고정된 온도 자료를 읽으며 열의 알짜 이동 방향과 전도·대류·복사를 비교하는 정적 학습 웹앱입니다.

## 학습 흐름

안내 활동 → 조건 확인 → 방향 예측 → 시점별 온도 자료 열기 → 방향 확인 → 방식과 근거 선택 → 추적 기록 확인 순서로 진행합니다. 모든 자료는 검수된 고정 모형이며 실제 물체의 안전 온도나 제품 성능을 뜻하지 않습니다.

## 실행과 검증

```bash
npm install
npm run dev
npm run lint
npm test
npm run build
```

Cloudflare Worker 호환 ESM으로 빌드됩니다.

## GitHub Pages

이 프로젝트는 고정된 학습 자료와 브라우저 상태만 사용하는 정적 앱으로
GitHub Pages에서도 사용할 수 있습니다.

- `npm run build:pages`: GitHub Pages용 정적 사이트 빌드
- 공개 주소: https://wbmaker2.github.io/heat-transfer-delivery-tracker/
- 배포 방식: `.github/workflows/deploy-pages.yml`
- 정적 진입점: `pages/index.html`

## 개인정보와 안전

로그인, 이름 입력, 브라우저 저장, 센서 권한, 외부 API, 추적 도구를 사용하지 않습니다. 실제 열 실험은 교사가 안전 온도와 절차를 확인한 뒤 별도로 진행해야 합니다.

자세한 내용은 [docs](./docs)를 참고하세요.
