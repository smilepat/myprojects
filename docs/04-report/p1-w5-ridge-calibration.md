# P-1 Week 5 진행 보고 — Ridge Regression Calibration

> 실행: 2026-05-23 / 기준: [phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md) §2.2, §6 W5
> Status: ✅ W5 완료 (10/10 calibration 테스트 + CLI end-to-end 검증)
> Note: W4 (UI 추가 시각화)는 W3에서 부분 선행 → W5로 점프

---

## 0. 결과

| 항목 | 결과 |
|---|---|
| `lib/calibration.ts` — closed-form ridge regression | ✅ |
| Linear algebra (transpose, matmul, inverse) 자체 구현 | ✅ |
| Per-QT 독립 fit + sum-to-1 + D1 fixed 제약 | ✅ |
| Divergence 메트릭 (자동 롤백용) | ✅ |
| `scripts/calibrate.mjs` CLI (W6 cron 진입점) | ✅ |
| `scripts/gen-fake-responses.mjs` (개발자 검증용) | ✅ |
| 단위 테스트 10건 (합성 데이터 기반) | ✅ **10/10 PASS** |
| End-to-end CLI 실행 (230 응답 → 3 QT 칼리브레이션) | ✅ |
| Next.js 프로덕션 빌드 회귀 | ✅ |

→ 누적 P-1 진행 **50%** (4/8주 분량, W1+W2+W3+W5). 다음: W6 (cron + Supabase) 또는 W7 (CI).

---

## 1. 구현 상세

### 1.1 [`lib/calibration.ts`](https://github.com/smilepat/oelp/blob/main/lib/calibration.ts)

**알고리즘**: ridge regression (closed form) per QuestionType.

```
Model:   acc[i,j] = Σ_d w[j,d] × score[i,d] / 100 + ε
Loss:    Σ_i (acc - pred)² + λ ||w - w_prior||²
Solution: w = (X'X + λI)⁻¹ (X'y + λ w_prior)
```

**제약** (post-processing):
- D1_Form 고정 0.05 (vocab-level 흡수, design §2.2)
- D2-D5 계수 ≥ 0 (clip)
- Σ(D2-D5) = 0.95 (normalize) → 합 = 1.0

**Fallback**: per-QT 응답 수 < `minSamplesPerQT` (기본 30) → 해당 QT는 prior 그대로.

### 1.2 Public API

```ts
calibrateWeights(input: CalibrationInput, opts?: CalibrateOpts): CalibrationResult
```

Returns:
- `weights` — 갱신된 (또는 prior 그대로) 가중치 맵
- `perQTSampleCount` — QT별 응답 수
- `perQTAlgorithm` — `"ridge-v1"` 또는 `"prior-fallback"`
- `perQTDivergence` — Σ (w_new - w_prior)² (자동 롤백 게이트)
- `meta` — λ, threshold, 통과 수, 시각

### 1.3 [`scripts/calibrate.mjs`](https://github.com/smilepat/oelp/blob/main/scripts/calibrate.mjs) CLI

```bash
node scripts/calibrate.mjs --responses data/responses.json \
                           [--lambda 0.1] [--min 30] \
                           [--out out/calibration.json] [--apply]
```

`--apply` 플래그는 lib/ontology.ts 자동 갱신 + C4.1 회귀를 트리거할 자리(아직 미구현, W6 작업).

**현재 동작** (dry-run):
- 응답 파일 읽기 → calibrate → 표 출력 + JSON 저장
- 가중치 diff 표시 ("D3_Context: 50% → 28%" 등)

### 1.4 [`scripts/gen-fake-responses.mjs`](https://github.com/smilepat/oelp/blob/main/scripts/gen-fake-responses.mjs)

개발자가 CLI를 검증할 수 있는 합성 응답 생성기. 진짜 응답 도착 전까지 dogfooding 환경에서 활용.

---

## 2. 단위 테스트 ([scripts/test-calibration.mjs](https://github.com/smilepat/oelp/blob/main/scripts/test-calibration.mjs))

```
✓ T1: Empty responses → all QTs fallback to prior
✓ T2: < minSamples for QT → fallback
✓ T3: N=300 noise-free → learned weights ≈ truth (D3 top dim 일치)
✓ T4: Sum-to-1 constraint preserved (|sum - 1.0| < 0.001)
✓ T5: D1_Form fixed at 0.05
✓ T6: All weights non-negative (high noise even)
✓ T7: High λ → 작은 divergence (prior 우세)
       Low λ → 큰 divergence (MLE 우세)
✓ T8: Divergence > 0 when truth ≠ prior
✓ T9: Mixed (some QT enough, others not) → 부분 calibration
✓ T10: 동일 입력 → 동일 출력 (closed-form, Math.random 없음)

10 / 10 tests passed
```

### 핵심 검증

- **T3**: N=300 noise-free 환경에서 D3=0.6 (truth) 회귀 → learned `|D3_learned - 0.6| < 0.1`. Ridge가 진실 가중치를 회복함을 입증.
- **T7**: λ=0.001 (low) vs λ=10 (high) 비교 → divergence가 단조 감소 — anchor strength 동작 확인.
- **T10**: closed-form solution의 결정성 검증 (재현 가능성).

---

## 3. End-to-end CLI 검증

### 합성 응답 생성

```
230 responses across 4 QTs (TYPE-요지 100, 순서배열 80, 빈칸추론 50, 요지 +10)
True weights differ from v2 prior — simulates real-world drift
```

### Calibrate 실행 결과

```
λ = 0.1 · min samples = 30 · QTs calibrated = 3 · fallback = 7

QT                samples  algorithm        divergence
TYPE-요지         100      ridge-v1         0.14197
TYPE-빈칸추론      50      ridge-v1         0.11796
TYPE-순서배열      80      ridge-v1         0.10822
(나머지 7 QT)        0      prior-fallback   0.00000
```

가중치 변화 예 (TYPE-요지):
- D2_Meaning: 10% → 13%
- D3_Context: 50% → 28%
- D4_Network: 25% → 54%
- D5_Usage: 10% → 0%

**주의**: 합성 응답이라 결과가 불안정. 실제 운영 시 `--apply` 전 C4.1 회귀 게이트로 자동 검증 예정 (W6 작업).

---

## 4. 알려진 한계 (W5 시점)

### L1 — `--apply` 미구현
- `lib/ontology.ts` 자동 갱신 + C4.1 자동 회귀는 W6
- 현재는 dry-run 출력만

### L2 — Logistic regression 아님
- 응답이 binary (0/1)인데 linear ridge 사용 — approximation
- 정확도 우선 모델은 logistic ridge. Phase 2 후반 고려 대상

### L3 — λ tuning 미수행
- 0.1 hardcoded. Ablation은 ablation 후보 ({0.05, 0.1, 0.2})
- W6 cron에 ablation 슬롯 포함 예정

### L4 — Per-learner heterogeneity 무시
- 현재는 모든 학습자 응답을 pool. 학습자별 weight skew는 무시
- Phase 3 multi-level model 후보

---

## 5. 다음 단계

### W6 (Weekly batch + Supabase sync)
- `syncFromSupabase` 실제 구현 (events → responses)
- GitHub Actions cron: 주 1회 calibrate → PR auto-open
- `--apply` 와이어업: ontology.ts 코드 수정 → C4.1 검증 → PASS 시만 merge

### W7 (CI 자동화)
- Vitest 도입 (현재 plain node:assert)
- GitHub Actions: PR 시 모든 39 단위 테스트 + C4.1/C4.2 회귀 + build 자동 실행

### W8 (dogfooding + 정성 평가)
- 본인이 OELP 사용 → 실 응답 누적
- Calibrate 결과 검토 + 도메인 판단

---

## 6. 누적 P-1 진행

- **W1 ✓** Thompson sampling 코어 (10/10)
- **W2 ✓** Posterior storage + reseed + queue wiring (11/11)
- **W3 ✓** buildQueueV2 통합 + UI 칩 (8/8)
- **W4 (부분 선행)** UI confidence + algorithm 칩 (W3 commit `dd96932`)
- **W5 ✓** Ridge regression + CLI (10/10) ← 본 작업
- W6 ☐ Cron + Supabase sync + --apply 와이어업
- W7 ☐ CI 자동화 (Vitest + GH Actions)
- W8 ☐ dogfooding + 정성 평가

**누적 단위 테스트**: 10 (W1) + 11 (W2) + 8 (W3) + 10 (W5) = **39건 PASS**

---

## 7. 인용 위치

- 본 보고서: [04-report/p1-w5-ridge-calibration.md](./p1-w5-ridge-calibration.md)
- W1-W3 시리즈: [p1-w1-thompson-sampling.md](./p1-w1-thompson-sampling.md), [p1-w2-posterior-storage.md](./p1-w2-posterior-storage.md), [p1-w3-buildqueuev2-integration.md](./p1-w3-buildqueuev2-integration.md)
- 설계: [02-design/phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md)
- 구현: [oelp/lib/calibration.ts](https://github.com/smilepat/oelp/blob/main/lib/calibration.ts)
- CLI: [oelp/scripts/calibrate.mjs](https://github.com/smilepat/oelp/blob/main/scripts/calibrate.mjs)
- 테스트: [oelp/scripts/test-calibration.mjs](https://github.com/smilepat/oelp/blob/main/scripts/test-calibration.mjs)
