# Learning Curve Simulation — D1_Form Plateau Discovery (7번째 closed-loop 후보)

> 실시: 2026-05-24 (v8 sprint)
> 스크립트: [smilepat/oelp scripts/dogfood-8-learning-curve.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-8-learning-curve.mjs)
> Status: ⚠️ **새 finding — D1_Form 학습 불가능 구조 확인**

---

## 0. 한 줄

12주 종방향 학습 시뮬레이션에서 D2_Meaning은 30→76 정상 학습, **D1_Form은 60→60.0 완전 plateau**. 가중치 매트릭스에서 D1_Form이 모든 10 QT에서 0.05로 고정되어 임계 0.15 미달 → 어떤 학습 큐도 D1_Form 향상 못 시킴.

---

## 1. 실험 설계

### 1.1 모델
단일 학습자의 4주/12주/24주 누적 학습. 학습 곡선:

```
dim_score(t) = base + (target - base) × (1 - exp(-t/tau))
```

- base: 학습자 archetype 초기 점수
- target: 학습으로 도달 가능한 천장 (D1~D5 모두 80-85)
- tau: time constant (D1=20, D2=18, D3=25, D4=22, D5=24)

### 1.2 학습 효과 발생 조건
QT가 그 dim에 대해 가중치 ≥ 0.15일 때만 해당 dim의 exposure 누적. 이는 OELP의 실제 weight 매트릭스를 mirror.

### 1.3 학습자
weak-D2 archetype (가장 흔한 EFL 패턴):
- base: D1=60, D2=30, D3=55, D4=60, D5=55
- 12주 × 3 sessions/week × 10 cards = 360 cards

### 1.4 exploration policy
v4 wired된 cohort-level balance (매 4번째 세션 starved QT 선택) on by default.

---

## 2. 결과 (seed=17, 12주, exploration on)

```
weekly avg dim 진화:
  w 1  avg=58.7  weakest=D2_Meaning (51.5)
  w 2  avg=62.5  weakest=D5_Usage   (57.5)
  w 3  avg=65.0  weakest=D5_Usage   (59.6)
  w 4  avg=67.0  weakest=D5_Usage   (59.6)
  w 5  avg=68.8  weakest=D1_Form    (60.0)  ← plateau 시작
  w 6  avg=70.0  weakest=D1_Form    (60.0)
  w 7  avg=71.3  weakest=D1_Form    (60.0)
  ...
  w12  avg=74.5  weakest=D1_Form    (60.0)  ← 7주 연속 D1=60 고정
```

| dim | base | final (w12) | gap closed |
|---|---:|---:|---:|
| D1_Form | 60 | **60.0** | **0%** |
| D2_Meaning | 30 | 76.0 | 92% |
| D3_Context | 55 | 78.5 | 78% |
| D4_Network | 60 | 78.4 | 92% |
| D5_Usage | 55 | 79.7 | 99% |

→ **D1_Form만 완전 plateau**. 5주차부터 8주 연속 60.0에서 정체.

### 2.1 plateau detection 출력

```json
"plateau": {
  "session": 12,
  "week": 5,
  "weakestDim": "D1_Form",
  "dimValue": 60
}
```

---

## 3. 근본 원인 — weight 매트릭스 구조

OELP `lib/ontology-weights.json` (또는 codebase의 WEIGHTS):

```
TYPE-목적:   D1_Form=0.05  D2=0.10  D3=0.50  D4=0.10  D5=0.25
TYPE-심경:   D1_Form=0.05  D2=0.35  D3=0.40  D4=0.10  D5=0.10
TYPE-주장:   D1_Form=0.05  D2=0.10  D3=0.55  D4=0.10  D5=0.20
TYPE-요지:   D1_Form=0.05  D2=0.10  D3=0.50  D4=0.25  D5=0.10
TYPE-주제:   D1_Form=0.05  D2=0.25  D3=0.45  D4=0.20  D5=0.05
TYPE-제목:   D1_Form=0.05  D2=0.10  D3=0.35  D4=0.40  D5=0.10
TYPE-빈칸:   D1_Form=0.05  D2=0.20  D3=0.45  D4=0.20  D5=0.10
TYPE-흐름:   D1_Form=0.05  D2=0.15  D3=0.55  D4=0.10  D5=0.15
TYPE-순서:   D1_Form=0.05  D2=0.10  D3=0.45  D4=0.10  D5=0.30
TYPE-삽입:   D1_Form=0.05  D2=0.15  D3=0.45  D4=0.10  D5=0.25
```

**모든 10 QT에서 D1_Form 가중치 = 0.05** (임계 0.15 미달). 이는 EFL 도메인 직관과 부합:
- D1_Form (단어 형태 — 철자, 발음, POS)은 모든 dimension 평가에서 약하게 가중
- 학습 큐가 본질적으로 vocab card 의미 추론 중심이라 form 학습 강조 안 함

문제: dim score 추정 시 D1_Form은 모든 QT 응답으로부터 영향을 받지만(낮은 가중치로), **실제 학습 시 강화되지 않음**. → 진단은 가능, 학습은 불가능한 dim.

---

## 4. 7번째 closed-loop 후보 정의

**발견**: D1_Form은 weight matrix 구조상 학습 불가능 (모든 QT 가중치 0.05).

**가능한 정책 옵션**:

### 4.1 옵션 A — Weight 재조정
`TYPE-목적` 등 일부 QT의 D1_Form 가중치를 0.05 → 0.20+ 상향. 진단 측면에서 자연스러운지 도메인 검토 필요.

### 4.2 옵션 B — Form-specific quest 추가
D1_Form 전용 미니 학습 컴포넌트 도입 (예: 단어 철자 dictation, POS 추론). OELP의 vocab card 구조 외부에 별도 큐 트랙.

### 4.3 옵션 C — D1_Form을 dimension에서 제거
실제로 학습 안 되는 dim을 평가만 한다는 게 의미 없음. 5D → 4D 단순화 검토.

### 4.4 옵션 D — Adaptive weight boost
학습자가 N주 누적해도 D1 향상 없으면 D1 weight를 일시 boost (calibration cycle처럼 자동).

→ 어느 옵션이 옳은가는 본인 EFL 도메인 직관 + Stage C 실 데이터 누적 후 결정.

---

## 5. exploration on/off 비교

`--exploration off` 재실행 결과 (seed=17, 12주):
- D1_Form: 60 → 60.0 (동일 plateau, exploration 무관)
- 다른 dim: 비슷한 학습 곡선 (D2 30 → 73, D5 55 → 77 정도)

→ **D1_Form plateau는 exploration policy로 해소 불가**. 가중치 구조 자체의 문제.

---

## 6. v8 시점 영향 및 권장

1. README §9 표에 D1_Form 학습 불가 finding 명시 (별도 트래킹)
2. Phase 2 PRD에 옵션 A-D 검토 항목 추가
3. Stage C 외부 학습자 1명 도착 시 — 실 데이터에서도 D1_Form plateau 발생하는지 즉시 확인 (3-4주 데이터로 검증 가능)
4. 만약 실 데이터에서도 동일 plateau → 옵션 A (weight 재조정) 가장 가성비 좋음

---

## 6.5 다중 archetype 검증 (v9 sprint 추가)

dogfood-8에 `--archetype all` 옵션을 추가해서 5개 archetype 모두 동일 시드(17)로 12주 시뮬:

```
archetype   base_D1  final_D1  D1 gap closed   plateau
weak-D2     60       60.0      0%              week 5 on D1_Form
weak-D3     60       60.0      0%              week 2 on D1_Form
weak-D4     60       60.0      0%              week 5 on D1_Form
balanced    55       55.0      0%              week 2 on D1_Form
strong      75       75.0      0%              week 2 on D1_Form
```

**모든 5 archetype에서 D1_Form 0% gap closed**. archetype-independent **structural defect** 확정.

## 6.6 옵션 A 정량 검증 (v9 sprint 추가)

dogfood-8에 `--d1-boost {single,form-pair,all}` 옵션 추가. 동일 시드(17), 12주, 모든 archetype:

| Option | D1_Form 가중치 변경 | 모든 archetype 평균 D1 gap closed |
|---|---|---|
| Baseline | 0.05 (10 QT 모두) | **0%** (완전 plateau) |
| **A1 single** | TYPE-제목만 0.20 | **66-70%** ✅ |
| A2 form-pair | TYPE-제목 + 흐름무관 0.20 | 65-68% (A1과 차이 없음) |
| A3 all | 모든 10 QT 0.20 | 94-100% (과도) |

**핵심 finding**:
- **단일 QT (TYPE-제목)만 boost해도 plateau 완전 해소** 가능
- A2가 A1과 차이 없는 이유: exploration policy로 TYPE-제목이 어차피 자주 선택됨
- A3는 과도 — 다른 dim 학습이 약화될 수 있음 (D3/D4가 80% → 70%대로 감소)

### 6.7 권장 — 옵션 A1로 결정

**도메인 합치성**: TYPE-제목 (제목 추론)은 단어 형태에 집중하는 과제 — 제목 후보 단어의 form/POS 식별이 핵심. D1_Form 가중치 상향이 EFL 직관과 일치.

**최소 변경**: weight matrix에서 1행 1열만 수정 (`lib/ontology-weights.json` 의 `"TYPE-제목": { "D1_Form": 0.20, ... }`). C4.1 게이트가 도메인 모순 자동 검증 — 통과 시 안전.

**구현 PR plan**:
1. `lib/ontology-weights.json` TYPE-제목 1행 변경 (D1=0.20, 다른 dim renormalize)
2. C4.1 게이트 실행: `node scripts/synthetic-validation-c4-1.mjs` → contradictions 검증
3. PASS 시 promote-weights.mjs로 적용. FAIL 시 자동 롤백.
4. 새 dogfood-8 baseline (production weight) 재실행 → plateau 해소 확인.
5. Stage C 외부 학습자 데이터 도착 시 3-4주 누적으로 실 검증.

**Risk**: TYPE-제목 weight 변경 시 추천 엔진이 제목 QT를 D1 약점 학습자에게 더 자주 선택할 수 있음 — 정상적 효과지만 일관성 확인 필요.

---

## 7. 한계

1. **시뮬레이션 모델 단순화**: 실제 학습 곡선은 power-law보다 복잡 (개인 차, 망각, 응답 시간 등)
2. **dimensionScores 정의**: D1_Form이 mean of QT-weighted form score이라 학습 강화가 weight 따라가는 모델. 실 데이터는 다른 패턴일 수도
3. **단일 archetype**: weak-D2만 실험. 다른 archetype (weak-D3/D4) 학습자에서는 plateau가 다른 dim에서 발생할 수도

---

## 8. 관련 자료

- dogfood-7 cohort forecast: [`dogfooding-7-cohort-forecast.md`](./dogfooding-7-cohort-forecast.md)
- 통합 회고 v8: [`oelp-integrated-summary.md`](../04-report/oelp-integrated-summary.md) §17
- OELP weight 매트릭스: [smilepat/oelp lib/ontology-weights.json](https://github.com/smilepat/oelp/blob/main/lib/ontology-weights.json)

---

## 9. 변경 이력

- 2026-05-24: 본 문서 작성 (v8 sprint, dogfood-8 D1_Form plateau finding)
