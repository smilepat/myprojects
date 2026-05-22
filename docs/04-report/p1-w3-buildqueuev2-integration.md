# P-1 Week 3 진행 보고 — buildQueueV2 통합 + UI 노출

> 실행: 2026-05-23 / 기준: [phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md) §3.1, §6 W3
> Status: ✅ W3 완료 (8/8 buildQueueV2 테스트 + queue 페이지 algorithm/confidence 가시화)

---

## 0. 결과

| 항목 | 결과 |
|---|---|
| `lib/queue.ts` — `QueuePlanV2` + `buildQueueV2` | ✅ 구현 |
| Fallback 정책 (rule-v1-fallback ↔ thompson-v2) 자동 전환 | ✅ |
| `app/queue/page.tsx` — `buildQueueV2` 사용 + 영속 posterior 로드 | ✅ |
| UI: algorithm 칩 + confidence 칩 + alternate QT 표시 | ✅ |
| 단위 테스트 8건 | ✅ **8/8 PASS** |
| Next.js 프로덕션 빌드 회귀 | ✅ |

→ 누적 P-1 진행 **37.5%** (W1 + W2 + W3 / 8주). W4 (UI confidence + algorithm tag) 일부 본 W3에서 선행.

---

## 1. 구현 상세

### 1.1 [`lib/queue.ts`](https://github.com/smilepat/oelp/blob/main/lib/queue.ts) `buildQueueV2(diag, posteriors, opts?)`

신규 시그니처:

```ts
export function buildQueueV2(
  diag: DiagnosticInput,
  posteriors: Record<string, BetaPosterior>,
  opts?: QueueOpts
): QueuePlanV2;

export interface QueuePlanV2 extends QueuePlan {
  confidence: ConfidenceLevel;
  algorithm: "rule-v1-fallback" | "thompson-v2";
  alternateQuestionType: QuestionType;
  targetThetaSample: number;
}
```

**알고리즘 (4단계)**:
1. `recommendQuestionType(scores, posteriors)` 호출 → target + algorithm + confidence + alternate
2. Target QT의 top-2 dimension 추출 (V1 동일)
3. POOL 필터 + theta ±0.4 window (V1 동일)
4. Closeness 정렬 + Fisher-Yates shuffle (V1 동일)

**핵심 결정**: V2는 step 1만 V1과 다름. Step 2-4는 코드/동작 동일 → C4.2 다양성 보장 자동 유지.

**V1 (`buildQueue`) 보존**: 후방 호환 + 비교 테스트용.

### 1.2 [`app/queue/page.tsx`](https://github.com/smilepat/oelp/blob/main/app/queue/page.tsx) 통합

```tsx
const plan = useMemo(() => {
  const posteriors = loadPosteriors(DEMO_DIAGNOSTIC.dimensionScores);
  return buildQueueV2(DEMO_DIAGNOSTIC, posteriors);
}, []);
```

**플로우**:
1. Page mount → `loadPosteriors` (localStorage 또는 초기 prior)
2. `buildQueueV2` → algorithm/confidence/alternate 포함된 plan
3. 사용자 카드 풀이 → `persistSessionResponses` 로 posterior 갱신
4. 다음 진입 시 갱신된 posterior로 다른 추천 가능

**UI**: 헤더에 3개 칩 추가
- 알고리즘 칩 (`rule-v1-fallback` 회색 / `thompson-v2` 보라)
- Confidence 칩 (`high` 녹색 / `mid` 노랑 / `low` 회색)
- Alternate QT 텍스트 (top-2)

---

## 2. 단위 테스트 ([scripts/test-queue-v2.mjs](https://github.com/smilepat/oelp/blob/main/scripts/test-queue-v2.mjs))

```
✓ T1: With no posterior history, algorithm = rule-v1-fallback
✓ T2: Fallback picks same QT as deterministic argmin(predictCorrectness)
✓ T3: With ≥10 samples + skewed posteriors → algorithm = thompson-v2
✓ T4: Thompson picks 요지 majority of trials (200 runs)
✓ T5: Queue has exactly 10 cards
✓ T6: targetDimensions are top-2 weights of selected QT
✓ T7: Cards' dimensions are in targetDimensions
✓ T8: Repeat calls produce varied cards (shuffle works)

8 / 8 tests passed
```

### 핵심 검증

- **T2**: Fallback 시 V1과 동일한 QT 선택 — 호환성 확인
- **T4**: 극단 posteriors (요지 weak, 순서배열 strong) 200 trials → 요지 majority + 순서배열 < 10% (Thompson exploitation)
- **T7**: 카드 차원 = targetDimensions 부분집합 → 룰 무결성

---

## 3. 사용자 시나리오

### 처음 사용자 (posterior 없음)
- `totalSamples = 0 < 10` → `rule-v1-fallback`
- Confidence 칩: `low` (회색)
- 알고리즘 칩: `rule-v1-fallback`
- 큐 결과: V1과 동일 (요지 파악 등 deterministic 약점)

### 10회+ 응답 누적 후
- `totalSamples ≥ 10` → `thompson-v2`
- Confidence 칩: posterior 분산에 따라 `mid` 또는 `high`
- 알고리즘 칩: `thompson-v2` (보라)
- 큐 결과: 약점 QT 가중치 우선 sampling, exploration 포함
- "대안: 흐름무관" 등 runner-up 표시 → 학습자가 alternative 인지 가능

### 진단 drift (예: 학습 후 D3 향상)
- `loadPosteriors`가 fingerprint 변화 감지 → `reseedPosteriors` 자동 호출
- Old posterior 70% 보존 + new prior 30% blend
- 학습자가 신호 잃지 않음

---

## 4. 알려진 한계 (W3 시점)

### L1 — Ridge regression 가중치 보정 미구현
- 현재 `lib/ontology.ts` weights는 휴리스틱 v2 (C4.1 calibration)
- W5에서 응답 누적 시 자동 학습 → 더 나은 prior 매칭
- 현재는 Thompson posterior만 학습됨

### L2 — Supabase 동기화 미구현
- localStorage only — 단일 디바이스 (W6 작업)

### L3 — 다이아그노스틱 multi-source 미지원
- DEMO_DIAGNOSTIC hardcoded
- vocab-cat-test 통합 (`fetchDiagnostic`) 시 자동으로 V2도 동작 — 코드 변경 불필요

### L4 — UI confidence 칩의 학습 효과 검증 부재
- 학습자가 confidence를 의식해 행동 바꾸는지 모름
- W8 dogfooding 정성 평가 대상

---

## 5. 다음 단계

### W4 (UI confidence + algorithm 태그) — 일부 본 W3에서 선행
- 현재: 헤더에 3개 칩 표시
- W4 잔여: 세션 완료 패널에 "이번 세션 학습 효과" 시각화 (posterior α/β bar 등)

### W5 (Ridge regression)
- 응답 누적 데이터 → dimension-mapping §2 weights 자동 보정
- 합성 데이터 ablation: λ ∈ {0.05, 0.1, 0.2}

### W6 (Weekly batch + Supabase)
- GitHub Actions cron
- `syncFromSupabase` 실제 구현

---

## 6. 누적 P-1 진행

- **W1 ✓** Thompson sampling 코어 (10/10) — [report](./p1-w1-thompson-sampling.md)
- **W2 ✓** Posterior storage + reseed + queue wiring (11/11) — [report](./p1-w2-posterior-storage.md)
- **W3 ✓** buildQueueV2 통합 + UI 칩 (8/8) — 본 보고서
- W4 ☐ UI 추가 시각화
- W5 ☐ Ridge regression
- W6 ☐ Weekly batch + Supabase sync
- W7 ☐ CI 자동화 (Vitest 도입 + GH Actions)
- W8 ☐ dogfooding + 정성 평가

**누적 단위 테스트**: 10 + 11 + 8 = **29건 PASS** (recommendation 코어 + storage + queue v2).

---

## 7. 인용 위치

- 본 보고서: [04-report/p1-w3-buildqueuev2-integration.md](./p1-w3-buildqueuev2-integration.md)
- 누적 W1-W3 시리즈: [p1-w1-thompson-sampling.md](./p1-w1-thompson-sampling.md), [p1-w2-posterior-storage.md](./p1-w2-posterior-storage.md)
- 설계: [02-design/phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md)
- 구현: [oelp/lib/queue.ts](https://github.com/smilepat/oelp/blob/main/lib/queue.ts) `buildQueueV2`
- 테스트: [oelp/scripts/test-queue-v2.mjs](https://github.com/smilepat/oelp/blob/main/scripts/test-queue-v2.mjs)
