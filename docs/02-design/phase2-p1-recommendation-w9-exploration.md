# Phase 2 P-1 W9+ — Exploration-Aware Recommendation Refinement

> 작성: 2026-05-23 (v3++ sprint 종료 시점)
> 선행: [phase2-p1-recommendation-v2.md](./phase2-p1-recommendation-v2.md) W1-W8 design
> 코드: smilepat/oelp `lib/recommendation.ts` `findExplorationTarget` + `posteriorBalance` (commit `db10d64`)
> 상태: ✅ scaffolded — UI 통합은 외부 학습자 도착 시 활성화

---

## 0. 한 줄 요약

Phase 2 W9 이후 외부 학습자 데이터가 들어오면 Thompson sampling 단독으로는 **cold-branch starvation** (under-sampled QT가 영구히 sample 0으로 남는 문제) 발생 가능. 이를 방지하는 explicit exploration mechanism 추가.

---

## 1. 문제 정의

### 1.1 Thompson sampling의 한계

기존 W1-W8 구현 (`recommendQuestionType`):
- 각 QT에 대해 Beta(α, β)로 θ_qt sample → argmin θ 선택
- prior에서 시작하면 모든 QT 균등하게 시도 (탐색 자동)
- 그러나 일정 sample 누적 후, **posterior가 좁아진 QT는 영구히 미선택될 수 있음**

특히 OELP 현재 dogfooding 상태:
- 4 QT (심경/요지/제목/순서배열) — 400 samples each
- 6 QT (목적/주장/주제/빈칸/흐름무관/문장삽입) — 0 samples (prior fallback)

→ 사용자의 진단이 weak point를 특정 QT 4개로 좁히는 경우, **다른 6 QT는 영원히 학습 큐에 등장하지 않을 수 있음**.

### 1.2 학습자 관점 문제

- "이 분야는 안 풀어봐서 모름" — sample 0 = predicted correctness = prior 만
- 진단의 약점 식별이 prior weights에 의존 → C4.1 매핑 정확도에 종속
- 외부 학습자 N≥1 도착 시 starvation 정도가 새 dim emerge → posterior balance 1.0 → 0.5 떨어짐

---

## 2. 설계: Exploration Target

### 2.1 정의

`findExplorationTarget(posteriors, opts)`:
- 입력: 전체 QT의 Beta posterior map
- 출력: 가장 **information value** 높은 QT 또는 null (모두 well-explored)
- information value = `variance / (1 + samples)` — variance 높고 samples 적을수록 high

### 2.2 정책

| 외부 학습자 수 | exploration target 활성 | UI 노출 |
|---|---|---|
| 0명 (현재 본인 환경) | 항상 활성 — sample 0 QT 다수 | `/queue` alternative chip만 |
| 1-5명 | starvation 감지 시 활성 | `/sessions` posterior balance 위젯 + `/queue` chip |
| ≥ 50명 | 거의 비활성 (모든 QT well-explored) | 위젯에 "well-balanced" 표시 |

### 2.3 algorithm

```typescript
// pseudo:
for each qt in QUESTION_TYPES:
  skip if excluded
  skip if samples >= maxSamplesToConsider (default 20)
  mean = α / (α + β)
  variance = αβ / ((α+β)² (α+β+1))
  info = variance / (1 + samples)
  candidates.push({qt, samples, mean, info})
return candidates.argmax(info) or null
```

### 2.4 변수 설명

- **variance**: posterior의 불확실성 — 높을수록 sample이 도움 됨
- **samples damping**: `1 + samples` → 이미 본 QT에는 페널티
- **maxSamplesToConsider = 20**: "well-explored" 임계 (Phase 2 W12 시점에 외부 학습자 데이터로 재조정)

---

## 3. 설계: Posterior Balance

### 3.1 정의

`posteriorBalance(posteriors)`:
- 입력: posterior map
- 출력: `min(samples) / mean(samples)` ∈ [0, 1]

### 3.2 해석

| 값 | 의미 | 운영 액션 |
|---|---|---|
| 1.0 | 완벽 balanced | exploration target 비활성 OK |
| 0.5-0.99 | 약간 uneven | UI 알림 없음 |
| 0.1-0.5 | starvation 감지 | exploration target 권장 |
| < 0.1 | 심각한 starvation | UI에 경고, 다음 큐에 exploration 강제 |
| 0 | 데이터 없음 | prior-fallback 단계 |

### 3.3 외부 학습자 등장 시 예상 변화

```
본인 단독 (현재): posteriorBalance = 0.0 (6 QT가 sample 0)
+ 외부 학습자 1명 (preset 다른 QT 풀이): 0.0 → 0.05~0.15
+ 외부 학습자 N≥50: 0.5 → 0.9 점진 증가
```

---

## 4. UI 통합 계획

### 4.1 `/queue` (Stage A — Claude 자율 즉시)

기존 plan badges (algorithm + confidence + 대안) 옆에:
- `exploration: {QT 이름} ({samples} samples)` chip
- hover: "이 QT는 가장 정보 부족한 영역입니다. 한 번 풀어볼래요?"
- 클릭: 다음 큐를 이 QT로 강제 생성 옵션 제공

### 4.2 `/sessions` (Stage A — Claude 자율 즉시)

기존 TrendPanel 위 또는 아래:
- "Posterior Balance: 0.X" 게이지
- starvation QT 리스트 (samples = 0인 QT)
- "well-balanced" / "exploration recommended" / "starvation alert" 상태 표시

### 4.3 dogfooding-4 (검증)

새 시뮬레이션:
- 4 preset × 10 learners × 4 sessions = 1600 응답 base
- exploration target을 매 4번째 세션마다 적용 → starvation QT에 응답 누적
- posteriorBalance 변화 + C4.1 게이트 영향 측정

---

## 5. 비-목표

- **explore/exploit trade-off 최적화**: ε-greedy / UCB / KL-UCB 등 본격 알고리즘은 Phase 3+
- **Adaptive maxSamplesToConsider**: 현재 fixed 20. 외부 학습자 50+ 시점에 dynamic tuning 검토.
- **Multi-armed bandit theory 정식 채택**: 본 module은 heuristic. 학습자 100+ 시점에 정식화.

---

## 6. 의존성

- `lib/recommendation.ts`: `findExplorationTarget`, `posteriorBalance`, `BetaPosterior` (이미 구현)
- `lib/queue.ts`: `buildQueueV3` 가 explore target 받아서 큐 생성 가능하도록 확장 필요 (W9+)
- `lib/recommendation-store.ts`: 변경 없음 (storage 그대로)

---

## 7. 검증 기준

| 측정 | 목표 |
|---|---|
| 외부 학습자 4명 × 4세션 × 4 preset → posteriorBalance | 0.3 → 0.7 (4주 안에) |
| starvation QT (samples = 0) 수 | 6 → 0 (Phase 2 W12 시점) |
| exploration target 채택률 | 본인 평가 4/5 ("적절한 시점에 권장됨") |
| C4.1 게이트와 호환 | exploration 활성 후도 게이트 통과 비율 유지 |

---

## 8. 변경 이력
- 2026-05-23: 초기 작성 (코드 scaffolded 직후)
