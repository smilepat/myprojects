# Stage C 활성화 시뮬레이션 보고서

> 실시: 2026-05-23 (v3 sprint 후속)
> 스크립트: [smilepat/oelp scripts/dogfood-stage-c-sim.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-stage-c-sim.mjs)
> 목적: phase2-backlog-v2 Stage C (학습자 채널 ≥ 1명) 활성화 시 무엇이 일어나는지 사전 forecasting

---

## 0. 핵심 결과

**Stage C 활성화 = 외부 학습자 등장.** 1명 추가로는 OELP 안전망이 prod weights를 갱신하지 않음. 두 시나리오 모두 C4.1 게이트 FAIL → 자동 rollback.

| 시나리오 | 외부 응답 | 결합 N | unique dims | tau | contradictions | 결과 |
|---|---:|---:|---:|---:|---:|---|
| 외부 1명 × 8 sessions | 80 | 1680 | 48 | 0.60 | 2 | ❌ rollback |
| 외부 1명 × 40 sessions (재시도) | 400 | 2000 | 80 | 0.60 | 2 | ❌ rollback |

→ **시스템은 안전 상태 유지**. 외부 학습자 추가가 곧바로 prod 가중치 변경을 의미하지 않음.

---

## 1. 시뮬레이션 설계

### 1.1 외부 학습자 페르소나 (preset 어디에도 없는 신규 profile)

```json
{
  "id": "ext-001",
  "baseDims": {
    "D1_Form": 70,
    "D2_Meaning": 38,
    "D3_Context": 55,
    "D4_Network": 42,
    "D5_Usage": 60
  }
}
```

D2 + D4 동시 약점 — 4 preset (α D3/D4, β D1/D5, γ D2, δ even) 어느 것과도 일치하지 않음. 재수생/B1 가정.

### 1.2 응답 생성
세션마다 ±5 dim noise (mood/fatigue). correctness는 preset과 동일 모델이지만 **bias 폭 ±0.15 (preset은 ±0.05)** — 실제 인간 응답 분산이 시뮬레이터보다 큰 점 반영.

### 1.3 결합
`data/dogfood-3-presets-1600.json` (preset base) + 외부 ext-001 응답.

---

## 2. 두 시나리오 분석

### 2.1 외부 1명 × 8 sessions (80 응답)
- combined: 1680 응답, 48 unique dims, accuracy 50%
- 새 QT 등장: TYPE-주제 (preset 데이터에 없던 30 응답)
- **auto-lambda**: λ=1.0 (N range 500-2000)
- **C4.1**: tau=0.60 ✓, **contradictions=2** ✗ → rollback
- λ=2.0 강제 retry: tau=0.50 ✓, contradictions=2 → rollback

### 2.2 외부 1명 × 40 sessions (400 응답, ~17% 비율)
- combined: 2000 응답, 80 unique dims (preset 40 + 외부 40)
- **auto-lambda**: λ=0.7 (N range 2000-10000)
- **C4.1**: tau=0.60, contradictions=2 → rollback

---

## 3. 게이트 catch 모순 분석

calibrated weights에서 변화량 큰 항목:
- TYPE-심경 D5_Usage 10% → 26-34% (시나리오마다 변동)
- TYPE-제목 D5_Usage 10% → 24-34%
- TYPE-주제 D5_Usage 5% → 0%

→ Pass-3와 동일 패턴: D5_Usage이 simulator 노이즈를 어쩌다 신호로 흡수. 외부 학습자 데이터도 같은 noise dimension에서 흔들림.

**구조적 발견**: simulator + 외부 학습자 small N 결합에서 D5_Usage 모순이 **반복 등장**. simulator 자체 모델 문제 가능성 시사. 외부 학습자 N 충분히 누적되면 자연 해소될 가능성.

---

## 4. 정량 forecasting

| 외부 학습자 비율 | 추정 결과 |
|---|---|
| < 5% (현재 80/1680 = 4.8%) | simulator noise 우세 → 게이트 FAIL 유지 |
| 10-20% (시도 400/2000 = 17%) | 여전히 FAIL — simulator 모델 bias 흡수 부족 |
| 30-50% | 외부 신호가 simulator noise를 압도하기 시작 — PASS 가능성 등장 |
| > 50% | 외부 학습자 단독 calibration이 더 정합 가능 — simulator 제거 권장 |

→ **첫 prod 가중치 갱신 조건 forecast**: 외부 학습자 응답 **≥ 50% 비율** (즉 외부 ≥ 1600 응답 = 40 sessions × 4 learners 정도).

이 forecasting은 simulator를 baseline으로 가정. 실제 외부 데이터는 simulator보다 깨끗할 수 있으며, 그 경우 임계가 낮아질 수 있음.

---

## 5. Stage C 활성화 운영 권장

### 5.1 즉시
- 외부 학습자 1명 확보 시 phase2-backlog-v2 Stage C "활성화" 표시
- 그러나 **첫 6주 데이터는 calibration 적용 X** (synthetic baseline 우세 기간)

### 5.2 6-12주차 (외부 학습자 ≥ 50% 비율 달성 시)
- simulator base 점진 제거 (`data/dogfood-3-presets-1600.json` weight 감소)
- 외부 학습자 단독 calibration 시도
- λ schedule 재조정 (현재 thresholds는 simulator 가정)

### 5.3 12주차+ (실제 calibration 첫 PASS 가능성)
- 첫 자동 prod weight ratchet 발생 예상
- regression-history에 "first external-driven calibration" 이벤트 기록
- C4.3 trend-analysis UI 통합

---

## 6. 학습된 교훈

### L1. 1명 외부 학습자 ≠ 즉시 calibration shift
"Stage C 활성화"는 **모니터링 모드 진입**이지, 즉시 prod 가중치 변경 트리거가 아님. 안전망이 6주 이상 "외부 응답을 보지만 적용은 안 함" 상태 유지.

### L2. D5_Usage 모순의 구조적 반복
3 cycle (Pass-3, Stage C 1명, Stage C 40세션) 모두 D5_Usage에서 over-declared 모순 검출. simulator의 D5 모델링이 약하다는 신호. **외부 데이터 도착 시점에 simulator의 D5 weight를 다시 검토 권장**.

### L3. auto-lambda의 한계
N>500 → λ ≤ 1.0이 prior pull 약화. simulator noise 비율이 높을 때 외부 학습자 효과를 압도. **외부 학습자 비율이 낮을 때는 λ를 외부 비율과 연동시키는 정책 (예: λ = max(1.0, 1.0 / external_ratio))** 도 검토 가능.

---

## 7. 다음 액션

### 본인 (Stage C 활성화 시 시작)
1. 외부 학습자 1명 확보 → OELP `/diagnose` preset α 또는 paste-import로 시작
2. 4주 누적 시 `/sessions` calibration JSON export
3. `node scripts/calibrate.mjs --responses <export> --auto-lambda` 실행 (apply 없이 dry-run)
4. C4.1 결과 본 보고서 기준과 비교

### Claude 자율
- Stage C 활성화 트리거: phase2-backlog-v2 갱신 (현재 "보류" → "monitoring")
- C4.3 trend UI 활성화 시점 forecast 갱신
- 시뮬레이터 D5_Usage 모델 검증 (L2 후속)

---

## 8. 변경 이력
- 2026-05-23: 초기 Stage C 활성화 forecasting (외부 1명 시뮬레이션)
