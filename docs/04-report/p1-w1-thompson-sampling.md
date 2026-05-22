# P-1 Week 1 진행 보고 — Thompson Sampling 코어

> 실행: 2026-05-23 / 기준: [phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md) §6 W1
> Status: ✅ W1 완료 (10/10 단위 테스트 통과)

---

## 0. 결과

| 항목 | 결과 |
|---|---|
| Thompson sampling 코어 (`lib/recommendation.ts`) | ✅ 구현 완료 |
| Beta posterior + 업데이트 + sampling | ✅ |
| 초기 prior (diagnostic anchor + Laplace smoothing) | ✅ |
| Rule-v1 fallback 정책 (totalSamples < 10) | ✅ |
| Variance 기반 confidence (low/mid/high) | ✅ |
| Top-1 + alternate (runner-up) | ✅ |
| 단위 테스트 10건 | ✅ **10/10 PASS** |
| Next.js 프로덕션 빌드 회귀 | ✅ |

→ Week 2 (Beta posterior storage) 시작 가능.

---

## 1. 구현 상세

### 1.1 [`lib/recommendation.ts`](https://github.com/smilepat/oelp/blob/main/lib/recommendation.ts) (pure functions, no I/O)

| Function | 역할 |
|---|---|
| `priorFromDiagnostic(qt, scores, strength=5)` | Laplace-smoothed prior `α=1+k·p, β=1+k·(1−p)` where `p = predictCorrectness` |
| `initialPosteriors(scores)` | 10 QuestionType 모두에 prior 매핑 |
| `updatePosterior(prev, isCorrect)` | Bayesian update — 정답시 α+1, 오답시 β+1, samples++ |
| `applyResponses(prev, responses[])` | 배치 응답 반영 (세션 종료 시) |
| `sampleBeta(α, β)` | Marsaglia & Tsang gamma → Beta 샘플 |
| `posteriorConfidence(p)` | Variance < 0.02 → high, < 0.05 → mid, else low |
| `recommendQuestionType(scores, posteriors, opts?)` | Top-level — fallback 정책 포함 |

### 1.2 알고리즘 결정 사항

**Prior smoothing strength = 5** (design §2.1 기본값). 의미: 5번 응답까지는 prior(진단 기반)가 우세, 그 이후 데이터가 우세. Strength 조정은 hyperparameter, 후속 ablation 대상.

**Fallback threshold = 10** (`minSamplesForThompson`). totalSamples < 10이면 deterministic argmin(predictCorrectness) — 안전한 동작.

**Top-1 + alternate**: design §1 출력 명세대로 `alternateQuestionType`도 반환. 단일 weak QT에 confidence 부족 시 UI에서 대안 노출 가능.

**Marsaglia & Tsang gamma**: Beta 샘플링의 표준 알고리즘. shape < 1 일 때 boost trick. Box-Muller로 standard normal 생성.

---

## 2. 단위 테스트 ([scripts/test-recommendation.mjs](https://github.com/smilepat/oelp/blob/main/scripts/test-recommendation.mjs))

```
✓ T1: sampleBeta returns value in [0, 1]
✓ T2: sampleBeta mean ≈ α/(α+β) over 5000 samples
✓ T3: updatePosterior — correct adds α, wrong adds β
✓ T4: priorFromDiagnostic — Laplace-smoothed anchor to predictCorrectness
✓ T5: Initial posteriors — weak QT has lower mean
✓ T6: Rule-v1 fallback when totalSamples < minSamplesForThompson
✓ T7: After 100 samples, Thompson picks weak QT majority
✓ T8: posteriorConfidence: high variance → low, narrow → high
✓ T9: applyResponses updates correct keys, ignores unknown
✓ T10: After 100 correct + 0 wrong, posterior mean → 1

10 / 10 tests passed
```

### T7 — 핵심 동작 검증

극단적 posteriors 주입 시 Thompson 선택의 약점 우선성 검증:
- 요지: α=1, β=20 (매우 약함) → 200회 추천 중 100건 이상 선택
- 순서배열: α=20, β=1 (매우 강함) → 200회 중 20건 미만 선택

**실측**: 요지 majority hits, 순서배열 < 20/200 — 룰엔진 약점 정조준 동작 보존하면서 exploration 확보.

---

## 3. 알려진 한계 (W1 시점)

### L1 — 통합 미수행
- `lib/queue.ts buildQueue()`는 아직 결정성 룰엔진 ([commit 7ea2152](https://github.com/smilepat/oelp/commit/7ea2152)). Thompson 통합은 W3 작업.
- 현재 OELP UI에서는 `lib/recommendation.ts` 호출 없음 — 순수 라이브러리만 존재.

### L2 — 응답 storage 미구현
- W2 작업 (`lib/recommendation-store.ts`): localStorage 영속화 + Supabase events 테이블 동기화.
- 현재는 in-memory posteriors 객체만 처리.

### L3 — Vitest 부재
- Vitest 설치 없이 `node:assert/strict` 기반 plain script로 테스트.
- W7 작업 (CI 자동화) 시점에 Vitest 도입 권장.

### L4 — Mirror 코드
- `scripts/test-recommendation.mjs`는 lib 함수를 인라인 mirror (TS 로더 회피).
- 두 곳 동기화 필요 — `lib/recommendation.ts` 변경 시 테스트 스크립트 함께 갱신해야 함.

---

## 4. 다음 단계

### W2 (Beta posterior storage)
- `lib/recommendation-store.ts` — localStorage key `oelp.posteriors.{userId}` schema
- Supabase events 테이블 sync (analytics-events.md `queue.item_answered` 변환 → posteriors)
- 진단 변경 시 prior 재시드 정책 (drop vs blend)

### W3 (queue 통합)
- `buildQueueV2(diag, history?)` — Thompson 결과를 받아 기존 dimension 필터에 적용
- Fallback 정책 검증 (rule-v1 결과와 호환성 확인)

### Ablation 후보
- Smoothing strength k ∈ {2, 5, 10} 비교
- Fallback threshold N ∈ {5, 10, 20} 비교

---

## 5. 본 보고서의 권장 인용 위치

- 본 보고서: [04-report/p1-w1-thompson-sampling.md](./p1-w1-thompson-sampling.md)
- 설계 문서: [02-design/phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md)
- 구현: [oelp/lib/recommendation.ts](https://github.com/smilepat/oelp/blob/main/lib/recommendation.ts)
- 테스트: [oelp/scripts/test-recommendation.mjs](https://github.com/smilepat/oelp/blob/main/scripts/test-recommendation.mjs)
