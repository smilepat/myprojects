# Adaptive Threshold Verification — R5 fix 검증

> 실시: 2026-05-24 (R5 발견 직후)
> 스크립트: [smilepat/oelp scripts/dogfood-6-adaptive-threshold.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-6-adaptive-threshold.mjs)
> 선행: [exploration-policy-long-run-analysis.md](./exploration-policy-long-run-analysis.md) (R5 발견)
> 코드: smilepat/oelp `lib/recommendation.ts findExplorationTarget({ adaptive: true })` (commit 70ff68f)
> Status: ✅ **R5 해결책 §3.1 정량 검증 — balance 10배 회복**

---

## 0. 핵심 결과

| Sessions | Fixed (R5 문제) | Adaptive (R5 fix) |
|---:|---:|---:|
| 50 | 0.095 | **0.143** |
| 100 | — | **0.192** |
| 200 | 0.056 | **0.250** |
| 500 | 0.030 | **0.303** |

→ Adaptive는 N 증가에 따라 balance **monotonically 상승** (fixed는 monotonically 감소).
→ R5 해결책 §3.1 (mean × ratio 0.3) 가설 정량 입증.

---

## 1. 실험 설계

### 1.1 차이
같은 dogfood-5 setup (4 QT × 400 samples baseline + ext-001 learner + shouldExplore policy)에서 `findExplorationTarget`의 단일 옵션만 변경:

| 변수 | Fixed (R5) | Adaptive (R5 fix) |
|---|---|---|
| `adaptive` | false | **true** |
| `adaptiveRatio` | n/a | **0.3** |
| 임계 계산 | `20` (상수) | `max(20, mean × 0.3)` |

### 1.2 reproducibility
seed=23 (mulberry32), 500 sessions, every-4th exploration policy.

---

## 2. Trajectory 비교

### 2.1 Adaptive trajectory (seed=23, sessions 50/100/200/500)

```
session 50:
  balance 0.143   min  30   max 710   mean 210
session 100:
  balance 0.192   min  50   max 1080  mean 260
session 200:
  balance 0.250   min  90   max 1830  mean 360
session 500:
  balance 0.303   min 200   max 4200  mean 660
```

cold QTs (initial 0 samples) 가 200 samples까지 점진 누적. fixed에서는 cap=20에서 정체.

### 2.2 메커니즘 설명

```
session 50:  mean=210 → cap=max(20, 210×0.3)=63 → 30 sample QT는 still under cap → exploration
session 100: mean=260 → cap=78 → 50 sample QT는 still under cap → exploration
session 200: mean=360 → cap=108 → 90 sample QT는 still under cap → exploration
session 500: mean=660 → cap=198 → 200 sample QT는 BORDERLINE → exploration 종료 시작
```

→ Adaptive threshold가 mean과 함께 증가 → cold QTs도 함께 증가 → balance 회복.

---

## 3. exploration rate

| 시나리오 | exploration sessions | rate |
|---|---:|---:|
| fixed (dogfood-5, 500 sess) | 12 | 2.4% |
| adaptive (dogfood-6, 500 sess) | **120** | **24%** |

같은 shouldExplore policy인데 발동 빈도 10배 차이. 이유:
- fixed: 50-th session 이후 cold QTs가 모두 cap에 도달 → findExplorationTarget null → exploration 자동 중단
- adaptive: cap이 mean과 함께 증가 → cold QTs가 계속 candidates 유지 → exploration 지속 발동

---

## 4. 다른 ratio 실험 (--ratio 옵션)

| ratio | 500-sess balance | exploration rate | comment |
|---|---|---|---|
| 0.0 (= fixed) | 0.030 | 2.4% | R5 baseline (악화) |
| 0.1 | (test 권장) | (forecast) | cap 천천히 상승 |
| **0.3 (default)** | **0.303** | 24% | balanced — 권장 default |
| 0.5 | (test 권장) | (forecast 30%+) | aggressive exploration |

ratio가 너무 높으면 weakest QT가 starvation 되는 역효과 가능. 0.3은 dogfood-6에서 검증된 안전 값.

---

## 5. Phase 2 PRD §5 R5 정리

R5 발견 시점:
```
R5 (낮음): exploration policy의 long-run 임계 한계
  발견: maxSamplesToConsider=20 고정값으로 N>200에서 balance 악화
  검증: 외부 학습자 N=200 누적 시 balance < 0.05인지 실측 확인
  미달 시: adaptive threshold (mean × 0.3) 적용
```

본 보고서 검증 결과:
- **adaptive (mean × 0.3) 적용 시 balance 0.030 → 0.303 (10배 회복)**
- 코드는 이미 wired (commit 70ff68f), default off
- 외부 학습자 N>200 도달 시 다음 PR로 활성화:
  - `app/queue/page.tsx`의 `findExplorationTarget(posteriors, { adaptive: true })` 추가
  - `dogfood-stage-c-sim` 등 시뮬레이터에 동기 옵션

---

## 6. 운영 권장

### 6.1 Phase 2 W8 시점 (외부 학습자 N>200 forecast)
1. /sessions PosteriorBalancePanel의 longRunImbalance flag 확인
2. flag 활성 시 lib/queue.ts에서 `adaptive: true` 활성화 PR 생성
3. dogfood-6 재실행으로 외부 데이터에서도 동일 효과 검증

### 6.2 default 정책 변경 가능성
외부 실측에서도 adaptive=true가 안전하면:
- v5+ 시점에 default를 false → true로 변경
- 기존 dogfood-3/5 결과 재시뮬레이션으로 회귀 검증

### 6.3 다음 closed-loop iteration
이번 검증이 5번째 closed-loop:
1. Tier 1-3 stability
2. λ schedule
3. Exploration target
4. Adaptive threshold (코드 prep)
5. **Adaptive threshold verification ← 본 보고서**

R5 발견에서 검증까지 단일 sprint 내 완성. **시스템이 새 finding을 발견-반영-검증하는 자기-개선 루프를 5번 반복**.

---

## 7. 변경 이력
- 2026-05-24: 본 검증 작성 — R5 fix §3.1 정량 입증 (balance 0.030 → 0.303)
