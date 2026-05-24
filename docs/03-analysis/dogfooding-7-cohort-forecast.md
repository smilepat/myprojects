# Stage C Cohort Forecast — dogfood-7 multi-learner simulation

> 실시: 2026-05-24 (v6 sprint)
> 스크립트: [smilepat/oelp scripts/dogfood-7-cohort.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-7-cohort.mjs)
> 선행: [dogfooding-stage-c-sim](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-stage-c-sim.mjs) (1 learner)
> Status: ✅ **Stage C 진입 정량 가이드 + QT 커버리지 한계 finding**

---

## 0. 핵심 finding

**N=50 외부 학습자 cohort에서도 QT 커버리지는 6-8/10에 그침.**

원인: 추천 엔진이 항상 학습자별 weakest QT를 고름 → cohort 다양성이 있어도
*특정 QT는 누구의 약점도 아니어서* 응답이 누적되지 않음. 6 seed 교차 확인.

→ **Stage C 진입 시 `shouldExplore` policy를 반드시 활성화해야** calibration이
모든 10 QT에 대해 의미 있게 동작. (현재 oelp `/queue`는 v4부터 wired,
default on.)

---

## 1. 실험 설계

### 1.1 cohort 구성

5 archetype의 확률 mixture로 N 학습자 profile 생성:

| archetype | 비율 | 약점 차원 | 강점 차원 | 의도 페르소나 |
|---|---|---|---|---|
| weak-D2 | 30% | D2_Meaning 30-45 | D3_Context 55-70 | 어휘 의미 약점 (가장 흔한 EFL) |
| weak-D3 | 30% | D3_Context 30-45 | D5_Usage 55-70 | 맥락 약점 (빈칸/순서 어려움) |
| weak-D4 | 20% | D4_Network 30-45 | D1_Form 55-70 | 어휘 isolated 학습자 |
| balanced | 10% | (all 55-75 ±10) | — | 균일 학습자 |
| strong | 10% | — | (all 75-95) | 우수 학습자 |

각 학습자 × 8 sessions × 10 cards = **80 responses/learner**.
세션 간 ±10 dim jitter (mood/fatigue).

### 1.2 추천 시뮬레이션

`pickTargetQT(dims)` — 학습자 dim score 기반 weakest QT 선택 (v4
exploration policy **미적용** 상태로 baseline 측정). 응답은 가중치
×dimension 곱의 sigmoid 확률 ± noise.

### 1.3 측정 지표

| 지표 | 의미 |
|---|---|
| `totalResponses` | cohort 전체 응답 누적량 |
| `uniqueDimensionTuples` | rank-1 X 회피 — 서로 다른 5D 조합 수 |
| `qtCoverage` | 10 QT 중 응답 1+ 받은 QT 수 |
| `qtResponseDistribution` | QT별 응답 분포 (calibration ridge input 직결) |
| `qtAccuracySpread` | QT별 정답률 (가중치 갱신 방향 결정) |

---

## 2. 결과 — 6 seed 교차 검증

```
seed=  7  N=1:1/10  N=5:5/10  N=10:5/10  N=30:8/10  N=50:8/10
seed= 11  N=1:2/10  N=5:4/10  N=10:4/10  N=30:5/10  N=50:6/10
seed= 23  N=1:1/10  N=5:4/10  N=10:5/10  N=30:7/10  N=50:8/10
seed= 42  N=1:1/10  N=5:4/10  N=10:6/10  N=30:7/10  N=50:7/10
seed=100  N=1:1/10  N=5:3/10  N=10:5/10  N=30:7/10  N=50:7/10
seed=200  N=1:2/10  N=5:3/10  N=10:4/10  N=30:6/10  N=50:7/10
```

| N | QT 커버리지 (min-median-max) | 응답 누적 | uniqueDims |
|---:|---|---:|---:|
| 1 | 1 – 1 – 2 | 80 | 8 |
| 5 | 3 – 4 – 5 | 400 | 40 |
| 10 | 4 – 5 – 6 | 800 | 80 |
| 30 | 5 – 7 – 8 | 2,400 | 240 |
| 50 | 6 – 7 – 8 | 4,000 | 400 |

**관찰**:
1. **N=50에서도 평균 7/10 QT만 커버** — 10/10 달성한 seed 없음
2. uniqueDims는 N에 비례 증가 → rank-1 위험 해소는 N≥10에서 안전권
3. seed 간 variance: N=10에서 ±2 QT, N=50에서 ±2 QT (안정성 부족)

---

## 3. 메커니즘 분석 — 왜 N=50에서도 풀 커버리지가 안 되나

추천이 weakest QT 선택 알고리즘이므로:

```
pickTargetQT(learner) = argmin_QT { Σ_dim weight[QT][dim] × learner_score[dim] / 100 }
```

→ 같은 archetype 학습자는 같은 weakest QT로 수렴. 5 archetype × ±10 jitter =
실제로 발현되는 unique weakest는 **5-7개 QT 정도**.

예시 (실제 cohort report seed=11):
```
qtResponseDistribution (N=50):
  TYPE-목적:      0
  TYPE-심경:    240
  TYPE-주장:      0
  TYPE-요지:    320
  TYPE-주제:      0
  TYPE-제목:    400
  TYPE-빈칸추론: 720
  TYPE-흐름무관: 240
  TYPE-순서배열: 640
  TYPE-문장삽입: 1440
```

→ 4개 QT (목적/주장/주제 등)는 **0 responses**. 어떤 archetype에서도
weakest로 뽑히지 않음. 가중치 calibration이 이 4개 QT에 대해서는
정보 없이 prior에 의존하게 됨.

---

## 4. 해결책: exploration policy 활성화

v4에서 wired된 `shouldExplore(balance, sessionN)`을 켜면:

```
balance < 0.1 → 매 2번째 세션마다 starved QT 강제 선택
balance < 0.5 → 매 4번째 세션마다
balance ≥ 0.5 → primary만
```

→ cohort 내 어떤 학습자도 weakness가 아닌 QT를 강제로 노출.
이론적으로 N=10에서도 풀 QT 커버 가능. (v7 sprint dogfood-7
exploration variant로 정량 검증 예정)

---

## 5. Stage C 진입 권장 — 정량 기준

| Cohort N | calibration 시도 가능? | 권장 조치 |
|---:|---|---|
| **N=1** | 불가 | C4.1 게이트가 의미 없음 (rank-1 + 1 QT only) |
| **N=5** | 시도 가능, 거의 fail 예상 | qtCoverage 3-5/10, 미커버 QT의 가중치는 prior 유지 |
| **N=10** | borderline (tau 0.3-0.5 예상) | **exploration policy 필수 활성화** |
| **N=30** | 첫 안정 cycle 가능 | tau ≥ 0.5 기대, prior 영향력 절반 이하로 감소 |
| **N=50** | robust 가중치 업데이트 | 단 미커버 QT (보통 2-4개)는 여전히 prior + exploration response 의존 |

### 5.1 본인 dogfooding과의 차이

본인 dogfooding-3 (1600 responses, 4 preset = 4 archetypes)와 비교:
- dogfooding-3: 4 archetype × 400 = 1600 responses → QT 커버 4-6/10
- cohort N=20 forecast: 다양한 archetype 20명 × 80 = 1600 responses → QT 커버 5-7/10

→ **동일 응답량이라도 cohort 다양성이 QT 커버를 늘림**.
하지만 절대값으로는 10/10 도달 어려움 (위 §3 메커니즘).

---

## 6. 운영 권장

### 6.1 Stage C 1명 도착 즉시 (현재 시점)
1. `shouldExplore` default **on** 확인 (이미 v4 wired)
2. exploration target chip이 UI에 표시되는지 확인 (already implemented in `/queue`)
3. AdaptiveDiagnosticStats로 진단 SD 모니터링 (KR1.1 ≤ 0.3)

### 6.2 N=5-10 도달 시
1. `dogfood-7-cohort.mjs --seed <varied>` 5회 실행 → qtCoverage spread 측정
2. 실제 cohort qtCoverage ≥ forecast의 median이면 calibration 시도
3. calibrate.mjs `--auto-lambda` 사용 (N-dependent λ, dogfood-3 검증된 정책)
4. C4.1 게이트가 reject하면 가중치 변경 없이 audit log만 누적 → 정상

### 6.3 N=30 도달 시
1. 첫 prod 가중치 업데이트 시도
2. 풀 cohort report → 미커버 QT 식별 → 그 QT의 prior 가중치 재검토 필요
3. exploration policy의 actual exploration rate 측정 (v4 dogfood-5 패턴)

### 6.4 default 정책 변경 가능성
N≥50 + 4주 안정 사이클 후:
- `shouldExplore` thresholds 재튜닝
- adaptive `mean × ratio` adaptive ratio 0.3 → 0.5 상향 검토 (R5 fix 정밀화)

---

## 7. 한계

1. **mock learners ≠ real EFL learners** — archetype mixture는 본인 직관 + 페르소나 P0 기반 합성. 실제 분포와 다를 수 있음
2. **상관관계 없는 dim sampling** — 실제 학습자는 D2-D3, D3-D4 등 강한 상관. 시뮬레이션은 ±10 독립 jitter
3. **session count 고정 (8)** — 실제로는 학습자별 큰 편차 (1-30+) 예상
4. **mood/fatigue 단순화** — ±10 dim jitter로 추정. 실제는 시간대/요일 패턴 존재

→ forecast의 절대값보다 **상대적 추이 + 메커니즘 finding**에 가치.

---

## 8. 변경 이력

- 2026-05-24: 본 문서 작성 (v6 sprint, dogfood-7 시드 6개 교차 검증 결과)
