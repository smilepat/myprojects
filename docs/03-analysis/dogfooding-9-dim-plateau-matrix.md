# 5 dim × 5 archetype Plateau Matrix — D1_Form Systemic Defect 일반화 검증

> 실시: 2026-05-24 (v11 sprint)
> 스크립트: [smilepat/oelp scripts/dogfood-9-dim-plateau-scan.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-9-dim-plateau-scan.mjs)
> 선행: [dogfooding-8-learning-curve-d1-plateau.md](./dogfooding-8-learning-curve-d1-plateau.md)
> Status: ✅ **D1 plateau 5/5 archetype 일반화 + 다른 4 dim 안전성 확인**

---

## 0. 한 줄

dogfood-8 단일 archetype에서 발견한 D1_Form plateau가 5 archetype 모두에서 0% gap closed로 일반화됨. 동시에 D2-D5는 76-101% gap closed로 정상 학습. dim contribution 메트릭 (sum of QT weights ≥ 0.15 임계)이 D1=0.00으로 root cause를 정량 제시.

---

## 1. 실험 설계

### 1.1 매트릭스 차원

- **5 archetype**: weak-D1, weak-D2, weak-D3, weak-D4, weak-D5 (각 dim 약점 시나리오)
- **5 dim**: D1_Form, D2_Meaning, D3_Context, D4_Network, D5_Usage
- 총 25 셀, 각 셀은 12주 누적 학습 후 gap closed (%)

### 1.2 학습 곡선 모델
dogfood-8과 동일: `dim_score(t) = base + (target - base) × (1 - exp(-t/tau))`. 가중치 ≥ 0.15인 dim만 학습 효과 발생 (production weight matrix mirror).

### 1.3 시뮬레이션 셋업
- seed=17, 12주, 3 sessions/week, 10 cards/session
- exploration policy ON (v4 cohort-level balance, 매 4번째 세션)

---

## 2. 결과 매트릭스

```
            D1   D2   D3   D4   D5
weak-D1     0%  85% 101%  89%  80%
weak-D2     0%  92% 101%  87%  76%
weak-D3     0%  83% 100%  82%  81%
weak-D4     0%  83% 101%  92%  79%
weak-D5     0%  83% 101%  87%  89%
```

→ **D1 행 완전 plateau (5/5 = 0% all)**. 다른 20셀 모두 76% 이상 gap closed.

### 2.1 Plateau 분류

| Plateau 유형 | 셀 수 | 위치 |
|---|---:|---|
| Complete plateau (0% gap closed) | 5 | D1 column 전체 |
| Slow plateau (30% < closed < 70%) | 0 | 없음 |
| Normal learning (≥ 70%) | 20 | D2-D5 all |

→ D1 외에는 어떤 (archetype, dim) 조합에서도 plateau 없음.

### 2.2 Overshoot 현상 (≥ 100%)

D3_Context 5/5 archetype 모두 100-101% gap closed. 이는 target dim 도달 후 ±1.5 noise 효과로 약간 초과한 결과. 실 학습자 모델에서는 noise → 실제 응답 variance.

---

## 3. Dim Contribution 메트릭

각 dim이 어느 정도 weight matrix상 학습 강화에 기여하는지:

```
Σ qt_weight[QT][dim] for all QT where qt_weight ≥ 0.15
```

결과:

| dim | contribution | 해석 |
|---:|---:|---|
| D1_Form | **0.00** | 어떤 QT도 임계 미달 → systemic defect |
| D2_Meaning | 1.10 | 1-2 QT에서 ≥ 0.15 |
| D3_Context | **4.65** | 거의 모든 QT에서 0.45+ → dominant |
| D4_Network | 1.05 | 1-2 QT (TYPE-요지/제목) |
| D5_Usage | 1.15 | 2-3 QT (TYPE-순서/문장삽입) |

### 3.1 D1=0.00 의 의미

production weight matrix에서 D1_Form은 모든 10 QT에서 0.05 (임계 0.15 미달). 따라서 **어떤 학습 큐를 받아도 D1_Form은 강화 안 됨**. 진단은 가능하지만 학습 강화 경로 부재 = "측정만 가능한 dim".

### 3.2 D3 dominant 의 의미

D3_Context는 대부분 QT의 핵심 차원 (대부분 QT에서 0.40+). 다른 dim의 학습은 자동으로 D3 강화 동반. **D3는 "강요받지 않아도 자동 강화"되는 dim**.

→ 옵션 A' PR (TYPE-제목 D1 weight 상향) 후 D3 학습이 감소하는지 모니터링 우선순위 1.

---

## 4. 시뮬 결과의 신뢰도

### 4.1 RNG 재현성
- mulberry32 seed=17 → 모든 archetype 동일 패턴
- 다른 seed (예: 23, 42)로 재실행 시 미세 변동은 있으나 D1 plateau는 항상 0% (자체 검증됨)

### 4.2 모델 단순화 한계
- 학습 곡선은 power-law approx — 실 학습은 더 복잡 (망각, 개인 차)
- dim 간 상관관계 모델링 없음
- session count 고정 (3/week) — 실 학습자는 변동

→ 절대값보다 **상대 차이 (D1 vs others)**가 핵심 finding.

---

## 5. 의의 및 옵션 A' PR 가이드

### 5.1 옵션 A' PR 우선순위

본 매트릭스를 옵션 A' 적용 전후 비교 baseline으로 사용:

| 검증 항목 | Baseline (v11) | 목표 (옵션 A' 후) |
|---|---|---|
| D1 plateau in all archetype | 0% (5/5) | ≥ 50% (5/5) |
| D2 gap closed | 83-92% | 변동 ≤ 5%p |
| D3 gap closed (dominant) | 100-101% | 변동 ≤ 5%p |
| D4 gap closed | 82-92% | 변동 ≤ 5%p |
| D5 gap closed | 76-89% | 변동 ≤ 5%p |

D3 변동 ≤ 5%p가 가장 큰 위험. dim contribution 4.65에서 약간만 감소해도 학습 효과 미세.

### 5.2 옵션 A' PR 후 자동 검증

```bash
# Before PR
node scripts/dogfood-9-dim-plateau-scan.mjs > out/baseline.json

# Apply option A' (4 파일 동시)
# ...

# After PR
node scripts/dogfood-9-dim-plateau-scan.mjs > out/after.json
diff out/baseline.json out/after.json
```

D1 plateau 해소 + D2-D5 변동 ≤ 5%p 확인. C4.1 게이트 통과 (필수).

---

## 6. CI gate 통합 (v11 → v12)

`scripts/check-dim-coverage.mjs`가 12번째 CI gate로 추가됨 (현재 non-blocking, D1 MISSING 알림). 옵션 A' PR 후 strict mode 활성화 → 모든 dim ≥ 1 keyVariable 강제.

`dogfood-9 matrix scan`은 **synthetic 검증**용 — production weight 변경 PR 시 본 보고서를 baseline으로 사용.

---

## 7. 향후 작업

### 7.1 단기 (Stage C 진입 전)
- 옵션 A' PR 작성 ([d1-plateau-option-a-prime.md](../02-design/d1-plateau-option-a-prime.md))
- dogfood-9를 옵션 A' weight 시뮬 변형으로 실행 → 실 학습 효과 사전 예상

### 7.2 중기 (Stage C N=10+ 도달 후)
- 실 학습자 4주 누적 데이터로 본 매트릭스 검증
- 실측 vs 시뮬 gap 측정 → 모델 calibration

### 7.3 장기
- 다른 dim도 비슷한 hidden defect 가능성 모니터링
- check-dim-coverage CI gate strict mode 활성화

---

## 8. 한계

1. 5 archetype은 본인 직관 기반 합성 — 실 학습자 분포와 다를 수 있음
2. 학습 곡선 power-law 단순화 (forgetting curve, 개인 차 미반영)
3. 12주 cap — 24주+ 시뮬 시 추가 plateau 발견 가능성 (별도)
4. dim 간 상관관계 모델링 없음 (실제로는 D2 향상 시 D3 부분 향상 등)

---

## 9. 변경 이력

- 2026-05-24: 본 보고서 작성 (v11 sprint, dogfood-9 정식 정리)
