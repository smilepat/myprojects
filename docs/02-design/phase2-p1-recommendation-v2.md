# Phase 2 P-1 — AI Recommendation Engine v2 (Design)

> Spec for [phase2-backlog](../01-plan/phase2-backlog.md) §2 P-1 (예상 효과 8주)
> Status: Draft (2026-05-22)
> Owner: smilepat
> Prerequisites: R1 PASS ✓ ([C4.1 v2](../03-analysis/synthetic-validation-c4-1-v2.md)) · [csat-graphdb-318#5](https://github.com/smilepat/csat-graphdb-318/issues/5) v4 calibration

---

## 0. 목적과 비-목적

### 목적
Phase 1의 결정성 룰엔진([oelp/lib/queue.ts](https://github.com/smilepat/oelp/blob/main/lib/queue.ts) `buildQueue()`)을 **학습형 추천 엔진**으로 교체:
- 동일 진단 입력에 다양한 학습 경로 (exploration)
- 학습자 반응 데이터로 dimension-mapping 가중치 자동 보정 (exploitation)
- 추천 신뢰도 표시 (낮음/중간/높음)

### 비-목적
- 베타 통계 KPI 추구 — Phase 1 검증 전략 ([PRD §B-5](../01-plan/prd-oelp-mvp-phase1.md))대로 dogfooding + 합성 검증 유지
- 신경망/딥러닝 — 학습자 데이터 N<100 단계에서 과적합 위험. 단순 통계 모델로 시작
- Real-time online learning — 응답 즉시 모델 갱신은 Phase 3. P-1은 배치(주1회) calibration

---

## 1. 입력과 출력

### 입력
- `DiagnosticInput` ([lib/diagnostic.ts](https://github.com/smilepat/oelp/blob/main/lib/diagnostic.ts)) — 학습자 진단 결과
- 학습자 응답 누적 로그 (analytics-events.md `queue.item_answered`)
- ([P-2 통합 시] `passage_questions` 응답 — Phase 1 미보유, Phase 2 후반)

### 출력
- `QueuePlan` ([lib/queue.ts](https://github.com/smilepat/oelp/blob/main/lib/queue.ts)) 동일 인터페이스 유지 — 호환성 확보
- 추가 필드:
  - `confidence: "low" | "mid" | "high"` — Thompson sampling SE 기반
  - `algorithm: "rule-v1" | "thompson-v2"` — fallback 표시용
  - `targetQuestionTypeSecondary?: QuestionType` — Top-1 신뢰도 부족 시 대안 노출

---

## 2. 알고리즘

### 2.1 Thompson Sampling for QuestionType selection

각 QuestionType은 베타 분포 `Beta(α, β)`로 모델링 — 학습자에 대한 약점 우선순위.

```
α_qt = prior_α + Σ (학습자가 그 QT 약점 영역에서 정답한 횟수)
β_qt = prior_β + Σ (오답한 횟수)
```

**Prior**: `α = 1 + (1 - predictCorrectness(scores, qt)) × 5`, `β = 1 + predictCorrectness × 5`
→ 진단 시점부터 약점 QT에 prior weight 부여.

**선택 절차**:
1. 각 QT에서 `θ_qt ~ Beta(α_qt, β_qt)` 샘플링
2. **약점 가중 sampling**: `priority_qt = (1 - θ_qt)` ← 낮을수록 약점 ← 1−correctness 분포 sampling으로 약점 우선
3. `argmin priority_qt` 선택

**Confidence**: posterior 분산 `var = αβ/((α+β)²(α+β+1))`.
- `var < 0.02` → "high"
- `var < 0.05` → "mid"
- 그 외 → "low"

### 2.2 Ridge Regression for dimension-mapping calibration

학습자 응답 누적이 `N ≥ 30` per QuestionType (~300 응답 총량) 도달 시 가중치 자동 보정:

```
입력: 학습자 i × QuestionType j 응답 정확도 acc[i,j] (0 또는 1)
모델: acc[i,j] = Σ_d w[j,d] × score[i,d] + ε
목적함수: argmin_w (Σ (acc - pred)² + λ ||w - w_prior||²)
  λ = 0.1 (휴리스틱 prior에 anchored)
```

**제약**:
- `Σ_d w[j,d] = 1` per QT (simplex constraint, normalize after solve)
- `w[j, D1_Form] = 0.05` 고정 (sketch — D1은 vocab level에서 흡수)
- `w[j,d] >= 0` (음수 가중치 금지)

**Trigger**: 매주 1회 batch job (Vercel cron 또는 GitHub Actions). N<30이면 다음 주기로 보류.

**Output**: 갱신된 `lib/ontology.ts` weights → C4.1 검증 재실행 → tau drop 시 자동 롤백.

### 2.3 Item-level selection (Phase 1 룰 유지 + tiebreak shuffle)

QuestionType 선택 후 어휘 선택 단계:
- Phase 1 그대로: dimension top-2 + IRT b ±0.4 필터
- **신규**: 동일 difficulty 그룹 내 shuffle (다양성, C4.2 FAIL 사유 해결)
- **신규**: exposure rate cap — 직전 4 세션에 노출된 itemId는 제외 (반복 학습 의도 시 explicit opt-in)

---

## 3. API 설계

### 3.1 신규 인터페이스 (lib/queue.ts)

```ts
export interface QueuePlanV2 extends QueuePlan {
  confidence: "low" | "mid" | "high";
  algorithm: "rule-v1" | "thompson-v2";
  targetQuestionTypeSecondary?: QuestionType;
  betaPosteriors: Record<string, { alpha: number; beta: number; samples: number }>;
}

export function buildQueueV2(
  diag: DiagnosticInput,
  responseHistory: ResponseLog[],
  opts?: QueueV2Opts
): QueuePlanV2;
```

### 3.2 Fallback 정책

```
if responseHistory.length < 10:
  return buildQueue(diag) wrapped as { ...plan, confidence: "low", algorithm: "rule-v1" }
elif csat-graphdb-318#5 미해결:
  return buildQueue(diag) wrapped (가중치 신뢰 불가)
else:
  return Thompson sampling result
```

---

## 4. 데이터 의존성

### 4.1 응답 로그 (analytics-events.md `queue.item_answered`)
- Supabase events 테이블에서 user_id × queue_id × item_id × correct
- N=300 도달 전까지 rule-v1 fallback
- N=300 도달 추정: dogfooding 환경에서 본인 5세션/주 × 10항목/세션 × 6주 ≈ 300

### 4.2 vocabulary-db 마운트 (P-1 prereq)
- STUB_POOL 30카드로는 다양성 의미 없음
- `lib/vocabulary-pool.ts` (또는 Supabase 마운트)에 ≥500 항목 필요
- Phase 1 후속 작업으로 분리 처리

### 4.3 csat-graphdb-318 마운트 (선택)
- 565 문항 × QT 매핑 데이터 필요 시 P-2 통합 시 가져옴
- P-1 자체는 vocabulary-only로 동작

---

## 5. 검증 계획

### 5.1 합성 검증 (배포 전)
- **C4.1 재실행**: Thompson 갱신 후 weights → tau ≥ 0.4 + 모순 0 유지 확인 (회귀 게이트)
- **C4.2 재실행**: 5 jittered diag × 4 큐 → Jaccard < 30% 확인 (룰엔진 다양성 메커니즘 추가 검증)
- **C3.1 회귀**: 단위 테스트 5 케이스 (rule-v1 fallback 경로 + Thompson 경로 각각)
- **N=10 미만 시 fallback 검증**: rule-v1 결과와 동일성 확인 (호환성)

### 5.2 정성 검증 (배포 후)
- 본인이 동일 진단 다회 시도 → 다양한 QT 노출 체감 (C2.1 보강)
- "추천 신뢰도 표시"가 학습자에게 인지 부하인지 본인 평가 (Phase 1 R2 후속)

---

## 6. 구현 단계 (8주)

| Week | 작업 |
|---|---|
| W1 | Thompson sampling 단독 구현 + 단위 테스트 (mock posterior) |
| W2 | Beta posterior 누적 storage (Supabase `learner_posterior` 테이블 또는 localStorage caching) |
| W3 | `buildQueueV2` 통합 + fallback 정책 |
| W4 | UI: confidence 표시 + algorithm tag (학습 큐 헤더) |
| W5 | Ridge regression 구현 + λ tuning (합성 데이터로) |
| W6 | Weekly batch job (GitHub Actions): 응답 fetch → calibrate → PR auto-open |
| W7 | 합성 회귀 (C4.1/C4.2/C3.1) 자동화 (CI) |
| W8 | dogfooding + 정성 평가 + 문서 |

---

## 7. 알려진 리스크

### R-P1-1 (높음): N=300 도달 불가
- dogfooding 단독으로는 300 응답 누적이 6주+ 소요. 그동안 모델 학습 안 됨.
- Mitigation: rule-v1 fallback 활성 유지. 학습은 누적 시 점진적.

### R-P1-2 (중간): Thompson posterior 발산
- 학습자가 일관되게 동일 패턴 응답 시 분산이 단조 감소하지 않음.
- Mitigation: 매주 prior smoothing (`α, β → 0.9 × α, β + 0.1 × prior`).

### R-P1-3 (중간): Ridge regression vs 휴리스틱 신뢰도
- N=300이 통계적으로 충분한지 모름. tau가 떨어지면 자동 롤백 필수.
- Mitigation: 5.1 회귀 게이트 + 수동 검토 (PR auto-open).

### R-P1-4 (낮음): vocabulary-db scale 부족
- STUB_POOL 환경에서는 Thompson sampling이 큰 차이를 못 만듦.
- Mitigation: vocabulary-db 마운트 P-1 시작 전 prereq로 분리.

---

## 8. 비-결정사항 (다음 의사결정 필요)

- **Posterior storage 위치**: Supabase events vs `learner_posterior` 전용 테이블 vs localStorage cache
- **Ridge λ** 선택: 0.05 / 0.1 / 0.2 중 무엇? 합성 ablation 필요
- **Cron 주기**: 주 1회 vs 응답 100건마다 trigger
- **UI confidence 표시**: 칩(chip) vs 텍스트 vs 색상 — 인지 부하 평가 필요

→ W1-2 구현 시작 전 별도 디자인 sync.

---

## 9. 관련 문서

- 입력 컨트랙트: [lib/diagnostic.ts](https://github.com/smilepat/oelp/blob/main/lib/diagnostic.ts)
- 현재 룰엔진: [lib/queue.ts](https://github.com/smilepat/oelp/blob/main/lib/queue.ts)
- Ontology weights: [lib/ontology.ts](https://github.com/smilepat/oelp/blob/main/lib/ontology.ts) · [dimension-mapping.md](../01-plan/dimension-mapping.md)
- R1 검증 사이클: [C4.1 v1](../03-analysis/synthetic-validation-c4-1-v1.md) → [v2](../03-analysis/synthetic-validation-c4-1-v2.md)
- C4.2 FAIL 원인: [c4-2-diversity.md](../03-analysis/c4-2-diversity.md) → 본 설계 §2.3에서 해결
