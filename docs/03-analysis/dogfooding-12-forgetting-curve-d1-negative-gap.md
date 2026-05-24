# Forgetting Curve Simulation — D1_Form Negative Gap 발견 (시간 차원 정당화)

> 실시: 2026-05-25 (v16 sprint)
> 스크립트: [smilepat/oelp scripts/dogfood-12-forgetting-curve.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-12-forgetting-curve.mjs)
> 선행: [dogfooding-9-dim-plateau-matrix.md](./dogfooding-9-dim-plateau-matrix.md) (D1 plateau matrix)
> Status: ✅ **D1 시간 차원 정당화 — plateau (정체) → negative gap (적극적 악화)**

---

## 0. 한 줄

기존 dogfood-8~11은 "학습된 dim은 영구 유지" 가정. v16에서 Ebbinghaus forgetting curve 추가 시 D1_Form은 **시간 갈수록 base 아래로 떨어짐** (-72% gap closed). 옵션 A' PR의 정당화가 "더 강해지지 않음" → **"시간 갈수록 더 약해짐"** 으로 강화.

---

## 1. 모델 차이

### 1.1 기존 모델 (dogfood-8~11)

학습 곡선만:
```
dim_score(t) = base + (target - base) × (1 - exp(-exposure / tau))
```

가정: 한 번 학습된 dim은 영구 유지. 학습 없으면 base에서 정체 (D1_Form의 경우 = plateau).

### 1.2 dogfood-12 모델 (forgetting 추가)

학습 곡선 + 망각:
```
gain (session t):
  dim_score = max(current, base + (target - base) × (1 - exp(-exposure / tau)))

decay (session t since last exposure > grace):
  dim_score = max(floor, dim_score × decay_rate^(sessions_since - grace))
```

파라미터:
- `decay_rate = 0.97` per session (post-grace)
- `grace = 3 sessions` (1주, 단기 기억 보호)
- `floor = base × 0.7` (절대 잊지 않음 보장)

---

## 2. 결과 (seed=17, 24주, weak-D2 archetype)

```
dim              dogfood-8 (시간 무시)   dogfood-12 (forgetting)
D1_Form              0% plateau            -72% negative gap
D2_Meaning           92%                    99%
D3_Context          100%                   102%
D4_Network           87%                   102%
D5_Usage             76%                    92%
```

### 2.1 D1_Form 시간 진화

```
session 0 (week 0): base 60
session 3 (week 1): 60 (학습 없음, grace 끝)
session 4 (week 2): 60 × 0.97 = 58.2
session 30 (week 10): 60 × 0.97^27 ≈ 26 → floor 42
...
session 72 (week 24): floor 42 (모든 시간 동안 floor 유지)

최종: 42 (base 60 → 42, 변화 -18, gap 25 중 -18 = -72%)
```

### 2.2 다른 dim은 forgetting 회복 정상

D2-D5는 학습 큐가 가중치 ≥ 0.15로 D2/D3/D4/D5를 cover하므로 정기 노출. forgetting decay가 적용되지만 학습 gain이 자동 회복. 결과적으로 100% 안팎의 정상 학습 곡선.

---

## 3. 정당화 진화

### 3.1 v9 finding (시간 무시)
> "D1_Form은 weight matrix상 모든 QT에서 0.05 (임계 0.15 미달). 어떤 학습 큐도 D1을 강화하지 않음."

→ 단순히 "D1이 더 강해지지 않음"

### 3.2 v16 finding (시간 포함)
> "D1_Form은 학습 강화 없음 + Ebbinghaus forgetting 누적 → 시간 갈수록 base 아래로 떨어짐 (negative gap)"

→ "시간 갈수록 D1이 더 약해짐 = 학습자가 더 못 함"

이는 옵션 A' PR이 단순 plateau 해소가 아니라 **악화 방지 + 회복**임을 정량 입증.

---

## 4. exploration policy의 forgetting 측면 가치

dogfood-12에서 exploration on/off 비교:

```
dim              no-exp gap closed   with-exp gap closed   delta
D1_Form              -72%                   -72%             0
D2_Meaning            99%                    99%             0
D3_Context           102%                   102%             0
D4_Network           102%                    99%            -3 (overshoot 감소)
D5_Usage              92%                    93%            +1
```

해석:
- **D1은 exploration으로 회복 불가능** (학습 path 자체 부재)
- 다른 dim은 forgetting 환경에서도 exploration 가치 미미
- exploration policy의 v4 발견 이유는 다른 측면 (cohort calibration의 QT 커버)이지 individual learner forgetting과 무관

---

## 5. 옵션 A' PR이 forgetting 환경에서 미치는 영향 (예측)

옵션 A' (TYPE-제목 D1 weight 0.05 → 0.20) 적용 시:
- D1 weight ≥ 0.15 임계 통과 → 학습 큐가 D1을 강화 시작
- 학습 gain이 forgetting decay와 균형 또는 학습 우세 (gain > decay)
- D1 gap closed: -72% → 추정 +50~70% (dogfood-10 매트릭스 + forgetting 결합 sim 필요)

→ **dogfood-13 후속 task로 정량 검증 예정** (v17 sprint).

---

## 6. 한계

1. **decay rate 0.97 단순 가정** — 실 학습자는 dim별로 다른 망각 곡선 (item-level Leitner SR과 결합 필요)
2. **floor 0.7 가정** — "절대 못 잊는 단어" 비율은 학습자 개인차
3. **24주 cap** — 더 긴 기간 (52주+) 시뮬 미실행
4. **grace 3 sessions** — 1주 단기 기억 보호. 실 학습은 더 짧을 수도 (개인차)

→ Stage C 외부 학습자 1명 + 8주+ 누적 시 실 데이터로 모델 calibration 필요.

---

## 7. 향후 작업

### 7.1 단기 (v17)
- dogfood-13: forgetting + 옵션 A' 결합 sim → D1 회복 효과 정량 측정
- PlateauWarningPanel에 "시간 차원" 메시지 추가 (negative gap 발견 시)

### 7.2 중기 (Stage C 진입 후)
- 실 학습자 8주+ 누적 데이터로 forgetting 모델 calibration
- decay_rate / floor 파라미터 실측 fitting
- Leitner SR (lib/leitner.ts)과 dim-level forgetting 통합

### 7.3 장기
- 다른 archetype에서 forgetting 시나리오 매트릭스 scan (dogfood-9 확장)
- 옵션 A' 적용 후 dogfood-12 재실행으로 시간 차원 회복 확인

---

## 8. 변경 이력

- 2026-05-25: 본 보고서 작성 (v16 sprint, dogfood-12 결과 정리)
