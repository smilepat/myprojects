# Exploration Policy Long-Run 분석 — maxSamplesToConsider 한계 발견

> 실시: 2026-05-24 (Phase 2 P-1 W9 후속)
> 스크립트: [smilepat/oelp scripts/dogfood-5-adaptive.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-5-adaptive.mjs)
> 선행: [dogfooding-pass-4.md](./dogfooding-pass-4.md), [phase2-p1-recommendation-w9-exploration.md](../02-design/phase2-p1-recommendation-w9-exploration.md)
> Status: ⚠ **policy 설계 한계 발견** — `maxSamplesToConsider=20` 고정값이 long-run에서 역효과

---

## 0. 핵심 결과

| sessions | seed | exploreCount | balance before | balance after | starved before/after |
|---:|---:|---:|---:|---:|---:|
| 30 (dogfood-4) | 11 | 7 | 0.000 | 0.053 | 6 → 0 |
| 50 (dogfood-5) | 13 | 12 | 0.000 | 0.095 | 6 → 0 |
| 200 (dogfood-5) | 17 | 12 | 0.000 | **0.056** | 6 → 0 |
| 500 (dogfood-5) | 19 | 12 | 0.000 | **0.030** | 6 → 0 |

→ **balance가 N 증가에 따라 오히려 감소** (0.095 → 0.056 → 0.030).

---

## 1. 무엇이 일어나는가

### 1.1 초기 단계 (sessions 1-50)
- 6 cold QTs (samples = 0)
- balance < 0.1 → 매 2번째 세션 exploration
- 7-12 exploration sessions × 10 cards = 70-120 cards 분배
- 6 cold QTs 각각 20 samples 도달

### 1.2 임계 도달 후 (sessions 50+)
- 모든 cold QTs: samples >= 20
- `findExplorationTarget(maxSamplesToConsider=20)` → **null** (조건 충족 QT 없음)
- buildQueueV3 fallback: primary (weakest QT = TYPE-심경) 사용
- 모든 후속 세션 → TYPE-심경에 누적

### 1.3 결과: 불균형 심화
```
sessions 200 (seed 17):
  cold QTs (6개) : 20 samples each
  warm QTs (3개) : 400 samples each
  TYPE-심경      : 2280 samples (1880 추가 누적!)
  → balance = min(20) / mean(360) = 0.056

sessions 500 (seed 19):
  TYPE-심경 absorption만 5000+ samples
  → balance = min(20) / mean(660) = 0.030
```

starvation은 해소되었으나 **새 imbalance 등장** (warm/very-warm vs cold).

---

## 2. 근본 원인 분석

### 2.1 fixed threshold의 함정
현재 `findExplorationTarget`:
```typescript
if (post.samples >= maxSamplesToConsider) continue;  // 20 hard limit
```

설계 의도: "20 이상 보면 충분히 안다" — short-run 가정.
실제: N=500에서 mean samples=660 → 20 sample QT는 **상대적으로** 여전히 starved.

### 2.2 balance 정의의 측면
`posteriorBalance = min(samples) / mean(samples)`는 absolute가 아닌 **상대 비율**.
N 증가 → mean 증가 → min/mean 감소 (cold QT가 cap에 머무는 한).

→ shouldExplore(balance) policy는 작동하지만 (balance < 0.5 → 매 4번째),
findExplorationTarget이 null 반환 → exploration 발동 자체가 안 됨.

### 2.3 두 함수의 책임 분리 한계
- `shouldExplore(balance, sessionN)`: **시기**를 결정 (이번 세션이 exploration인가?)
- `findExplorationTarget`: **대상**을 결정 (어느 QT가 explore할 만한가?)
- 둘이 합쳤을 때 cold QTs가 cap에 머물면 exploration "기회는 있으나 대상 없음" 무한 루프

---

## 3. 해결책 제안

### 3.1 adaptive maxSamplesToConsider
```typescript
function findExplorationTarget(posteriors, opts = {}) {
  const meanSamples = mean(Object.values(posteriors).map(p => p.samples));
  // 동적 threshold: mean의 30% 이하 = under-sampled
  const maxSamples = opts.maxSamplesToConsider ?? Math.max(20, meanSamples * 0.3);
  // ... 기존 로직
}
```

효과:
- N=50, mean=20 → max=20 (현재와 동일)
- N=200, mean=180 → max=54 (20-sample QT가 여전히 starved로 인식)
- N=500, mean=540 → max=162

→ exploration이 N 증가에 따라 임계 동적 조정.

### 3.2 또는 weakest QT exploration 빈도 cap
다른 접근: 같은 weakest QT가 N번 연속 선택되면 강제 다양화 (round-robin 보조).

### 3.3 또는 cold QTs를 절대값으로 추적
`min(samples) / max(samples)` 또는 `min(samples) / 2nd_max(samples)` 등 outlier-resistant metric.

---

## 4. 운영 결정 (Phase 2 W4 시점)

### 4.1 즉시 (현재 본인 환경)
- 본 분석은 **시뮬레이터** 기반 — 실제 외부 학습자 응답 패턴은 다를 수 있음
- 외부 학습자 1-3명 도착 시 우선 본 정책 그대로 운영
- N > 200 도달 시점에 §3.1 adaptive threshold 도입 검토

### 4.2 Phase 2 W8 정도 (외부 학습자 누적 200+ 시점)
- 본 분석 발견이 실제 데이터에서 재현되는지 검증
- 재현 시 §3.1 또는 §3.2 채택
- 시뮬레이터 fix가 아니라 lib/recommendation.ts findExplorationTarget 수정

### 4.3 Phase 2 PRD §5 R-new 추가 권장
```
R5 (낮음): exploration policy의 long-run 임계 한계
  발견: maxSamplesToConsider=20 고정으로 N>200에서 balance 악화
  검증: 외부 학습자 N=200 누적 시 balance < 0.05 인지 확인
  미달 시: §3.1 adaptive threshold 적용
```

---

## 5. 학습된 교훈

### L1. fixed threshold는 short-run에서만 정답
20-sample cap은 N=30-50 시 효과적 (dogfood-4/5 검증). 그러나 N>100에서 부작용 등장.

### L2. balance metric의 dual nature
- absolute: "starved (samples=0)" 해소 ✓
- relative: "min/mean" 비율은 cold QTs cap + warm growth로 악화 ✗

운영 시 둘 다 모니터해야 (현재 /sessions PosteriorBalancePanel은 starved count만 표시).

### L3. policy의 self-limiting behavior
shouldExplore + findExplorationTarget이 자연스럽게 자체 stop 조건 형성 — long-run 자율성 ✓.
그러나 stop 후 imbalance는 별도 문제.

---

## 6. 다음 액션

### Claude 자율 (지금)
- ✅ 본 분석 commit + push
- Phase 2 PRD §5에 R5 추가
- /sessions PosteriorBalancePanel에 absolute vs relative balance 둘 다 표시 (별도 작업)

### 외부 학습자 누적 후 (Phase 2 W8 forecast)
- 실측 데이터로 본 발견 재현 여부 검증
- 재현 시 §3 해결책 중 하나 채택 + 코드 PR

---

## 7. 변경 이력
- 2026-05-24: 본 분석 작성 (200/500 session long-run 결과 기반)
