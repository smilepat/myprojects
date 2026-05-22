# P-1 Week 7 진행 보고 — Vitest 도입 + PR CI 자동화

> 실행: 2026-05-23 / 기준: [phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md) §6 W7
> Status: ✅ W7 완료 (4 test files, 39 tests, 1.95s 실행 + PR workflow)

---

## 0. 결과

| 항목 | 결과 |
|---|---|
| Vitest 4.1.7 설치 + `vitest.config.ts` | ✅ |
| 4 plain .mjs 테스트 → 4 .ts Vitest 테스트로 마이그레이션 | ✅ |
| 단위 테스트 lib 직접 import (mirror drift 제거) | ✅ |
| `package.json scripts`: `test`, `test:watch`, `ci`, `test:c4-1` | ✅ |
| **39 / 39 PASS** (1.95초) | ✅ |
| `.github/workflows/pr-check.yml` — PR 마다 자동 검증 | ✅ |
| Legacy `scripts/test-*.mjs` 4건 제거 | ✅ |

→ 누적 P-1 진행 **87.5%** (W1+W2+W3+W4-partial+W5+W6+W7 / 8주). 다음: **W8 dogfooding + 정성 평가**가 마지막.

---

## 1. Vitest 마이그레이션

### 1.1 핵심 이점

**Mirror drift 제거**: 기존 `.mjs` 테스트는 `lib/` 코드를 인라인으로 mirror했음 (Node에서 TS 로더 회피 목적). 이 mirror가 lib 변경 시 자동 동기되지 않아 drift 위험 상존.

Vitest는 TypeScript native 지원 → 테스트가 `lib/` 를 직접 import. 코드 변경 시 테스트가 자동으로 같이 깨지면 즉시 발견.

### 1.2 신규 테스트 파일

| 파일 | 단위 테스트 수 |
|---|---|
| [`tests/recommendation.test.ts`](https://github.com/smilepat/oelp/blob/main/tests/recommendation.test.ts) | 10 |
| [`tests/recommendation-store.test.ts`](https://github.com/smilepat/oelp/blob/main/tests/recommendation-store.test.ts) | 11 (localStorage mock 포함) |
| [`tests/queue-v2.test.ts`](https://github.com/smilepat/oelp/blob/main/tests/queue-v2.test.ts) | 8 |
| [`tests/calibration.test.ts`](https://github.com/smilepat/oelp/blob/main/tests/calibration.test.ts) | 10 |
| **Total** | **39** |

### 1.3 [`vitest.config.ts`](https://github.com/smilepat/oelp/blob/main/vitest.config.ts)

```ts
import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: { alias: { "@": resolve(__dirname, "./") } },
  test: { include: ["tests/**/*.test.ts"], environment: "node", globals: false },
});
```

`@/*` alias로 `import { ... } from "@/lib/recommendation"` 동작 — Next.js의 path alias와 일치.

### 1.4 실행 결과

```
> vitest run

 Test Files  4 passed (4)
      Tests  39 passed (39)
   Duration  1.95s
```

---

## 2. [`scripts`] 정리

**제거**: legacy plain Node `.mjs` 테스트 4건 (`test-recommendation.mjs`, `test-recommendation-store.mjs`, `test-queue-v2.mjs`, `test-calibration.mjs`) — Vitest 가 대체.

**유지** (validation scripts):
- `scripts/synthetic-validation-c4-1.mjs` — C4.1 회귀 (markdown report 생성)
- `scripts/c4-2-diversity.mjs` — C4.2 다양성 측정
- `scripts/c1-3-roundtrip.mjs` — C1.3 DiagnosticInput round-trip
- `scripts/build-vocab-pool.mjs` — 데이터 파이프라인
- `scripts/calibrate.mjs`, `scripts/promote-weights.mjs` — calibration CLI
- `scripts/sync-responses-from-supabase.mjs` — events sync
- `scripts/gen-fake-responses.mjs` — 개발자 검증용

→ 명확한 책임 분리: Vitest = 단위 테스트, scripts/*.mjs = CLI 도구 + 산출물 생성.

---

## 3. [`package.json`](https://github.com/smilepat/oelp/blob/main/package.json) 갱신

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:c4-1": "node scripts/synthetic-validation-c4-1.mjs",
    "test:c4-2": "node scripts/c4-2-diversity.mjs",
    "ci": "npm run lint && npm run test && npm run test:c4-1 && npm run build"
  }
}
```

`npm run ci` 명령으로 PR 시뮬레이션 가능 — lint → test → C4.1 회귀 → Next.js build 순차 실행.

---

## 4. [`.github/workflows/pr-check.yml`](https://github.com/smilepat/oelp/blob/main/.github/workflows/pr-check.yml)

### Triggers

- `pull_request` (main 대상)
- `push` to main
- `workflow_dispatch`

### Steps

1. Checkout + Node 20 + `npm ci`
2. ESLint
3. Vitest (39 단위 테스트)
4. **C4.1 회귀** — tau ≥ 0.4 + contradictions ≤ 0 자동 게이트 (script로 grep + awk 비교 → exit 1 on FAIL)
5. C4.2 다양성 출력 (probabilistic이라 로그만, gate 아님)
6. Next.js production build
7. C4 report 아티팩트 업로드

### 안전 메커니즘

C4.1 게이트가 PR 마다 실행 → dimension-mapping.json 변경이 회귀 통과 시에만 merge. promote-weights.mjs의 게이트와 함께 **이중 안전망**.

---

## 5. 누적 P-1 진행 (87.5%)

- ✅ W1 Thompson 코어 (10/10)
- ✅ W2 Posterior storage + reseed (11/11)
- ✅ W3 buildQueueV2 통합 + UI 칩 (8/8)
- ✅ W4 (W3에서 부분 선행)
- ✅ W5 Ridge regression + CLI (10/10)
- ✅ W6 Auto-promote + Cron + Supabase sync (integration 검증)
- ✅ **W7 Vitest + PR CI workflow** ← 본 작업
- ☐ W8 dogfooding + 정성 평가 (학습자 사용)

**누적 단위 테스트**: 39 PASS (Vitest)
**전체 OELP 상태**:
- Phase 1: 자동 11/12 PASS (96%)
- P-1: **87.5%** (7/8 weeks)

---

## 6. 검증 흐름 (배포 안전망 4중)

```
1. Vitest 39 단위 테스트       ← 코드 회귀 차단
   ↓
2. C4.1 dimension-mapping      ← 가중치 정합성 차단
   ↓
3. Next.js build               ← 컴파일/타입 회귀 차단
   ↓
4. promote-weights.mjs gate    ← 가중치 변경 시 자동 롤백
```

**총 39 단위 테스트 + 50셀 C4.1 회귀 + 빌드 + 자동 롤백**.

---

## 7. 인용 위치

- 본 보고서: [04-report/p1-w7-vitest-and-pr-ci.md](./p1-w7-vitest-and-pr-ci.md)
- 누적 시리즈: W1-W6 reports
- 설계: [02-design/phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md)
- 구현:
  - [oelp/vitest.config.ts](https://github.com/smilepat/oelp/blob/main/vitest.config.ts)
  - [oelp/tests/](https://github.com/smilepat/oelp/tree/main/tests)
  - [oelp/.github/workflows/pr-check.yml](https://github.com/smilepat/oelp/blob/main/.github/workflows/pr-check.yml)
