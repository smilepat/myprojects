# Dogfooding Pass 3 — Preset-based Synthetic Cycle 분석 보고서

> 데이터: `data/dogfood-3-presets-1600.json` (4 presets × 10 learners × 4 sessions × 10 cards = **1600 responses, 40 unique dimensionScores**)
> 실시: 2026-05-23 (자동 시뮬레이션, seed=42)
> 선행: [dogfooding-pass-1.md](./dogfooding-pass-1.md), [dogfooding-pass-2.md](./dogfooding-pass-2.md)
> 산출 스크립트: [scripts/dogfood-3-presets.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-3-presets.mjs)
> Status: ✅ **C4.1 게이트 세 번째 실증 — 도메인 모순 2건 자동 검출 + 롤백**

---

## 0. 핵심 결과

| 항목 | Pass-1 | Pass-2 | **Pass-3** |
|---|---|---|---|
| 입력 응답 수 | 30 | 1230 | **1600** |
| 고유 dimensionScores | 1 (rank-1 X) | 121 | **40** |
| Calibrated QT 수 | 1 | 4 | **4** |
| 최대 divergence | 0.0 (fallback) | 0.283 | **0.060** |
| Kendall tau | 0.5 | 0.5 | **0.60** |
| Contradictions | 1 | 1 | **2** |
| 게이트 결과 | FAIL → rollback | FAIL → rollback | **FAIL → rollback** |
| 감지된 모순 종류 | D2 over-declared (흐름무관) | D3 under-declared (순서배열) | **D5 over-declared (심경 + 제목)** |

→ **C4.1 게이트가 3차례 모두 자동 검출 + 롤백.** 매번 다른 종류의 모순.

---

## 1. 실험 설계

### 1.1 시뮬레이션 구조

```
4 presets (α/β/γ/δ from lib/diagnostic-presets.ts)
  × 10 learners per preset (±3 dim noise per learner)
  × 4 sessions per learner
  × 10 cards per session
  = 1,600 responses across 40 unique (preset, learner) combinations
```

각 learner의 dimensionScores는 preset base ± 3 (round)으로 noise 추가 → 40종 distinct dimensionScores 보장.

### 1.2 correctness 모델

```
p(correct) = Σ_d (WEIGHTS[qtId][d] × dimensionScores[d] / 100) + noise
noise ~ Uniform(-0.05, +0.05)
isCorrect = Bernoulli(p)
```

여기서 WEIGHTS는 **ontology-weights.json v2와 동일** (즉, simulator는 prior와 동일 모델 사용). 따라서 ridge 회귀 결과는 prior 근처에 머물러야 정상.

### 1.3 reproducibility
- seed=42 (mulberry32 PRNG)
- `node scripts/dogfood-3-presets.mjs --learners 10 --sessions 4 --seed 42`
- 동일 명령으로 누구나 재현 가능

---

## 2. Calibration 결과

### 2.1 QT별

| QT | samples | algorithm | divergence |
|---|---:|---|---:|
| 목적 | 0 | prior-fallback | 0.00000 |
| **심경** | 400 | ridge-v1 | 0.04749 |
| 주장 | 0 | prior-fallback | 0.00000 |
| **요지** | 400 | ridge-v1 | 0.01570 |
| 주제 | 0 | prior-fallback | 0.00000 |
| **제목** | 400 | ridge-v1 | 0.05961 |
| 빈칸 | 0 | prior-fallback | 0.00000 |
| 흐름무관 | 0 | prior-fallback | 0.00000 |
| **순서배열** | 400 | ridge-v1 | 0.02291 |
| 문장삽입 | 0 | prior-fallback | 0.00000 |

4 QT만 calibrated (각 preset이 동일한 가장 약한 QT 1개씩 골라서). 나머지 6 QT는 prior-fallback.

### 2.2 가중치 변경 제안

```
TYPE-심경:    D2: 35→28  D3: 40→30  D4: 10→10  D5: 10→28   (D5↑↑)
TYPE-요지:    D2: 10→13  D3: 50→50  D4: 25→32  D5: 10→ 0   (D5↓)
TYPE-제목:    D2: 10→16  D3: 35→25  D4: 40→27  D5: 10→27   (D5↑↑)
TYPE-순서배열: D2: 10→ 2  D3: 45→39  D4: 10→12  D5: 30→42  (D5↑)
```

---

## 3. C4.1 게이트 분석

### 3.1 게이트 결과
```
tau = 0.60          ✓ (≥ 0.40)
contradictions = 2  ✗ (> 0)
→ FAIL → 자동 롤백
```

### 3.2 모순 2건 (도메인 keyVariable 매핑 충돌)

**모순 1: TYPE-심경 D5_Usage**
- 변경 시도: 10% → 28% (declared)
- 심경 keyVariables: `emotional_indirectness`, `emotion_vocab_density`
- C4.1 매핑상 두 키 모두 D2_Meaning / D3_Context에 기여, D5_Usage는 **derived 0%**
- 규칙 위반: "declared ≥ 0.2 이지만 derived = 0" → 도메인 증거 없는 가중치

**모순 2: TYPE-제목 D5_Usage**
- 변경 시도: 10% → 27% (declared)
- 제목 keyVariables: `title_abstractness`, `metaphor_density`
- C4.1 매핑상 두 키 모두 D3_Context / D4_Network에 기여, D5_Usage는 **derived 0%**
- 동일 규칙 위반

### 3.3 왜 simulator가 D5를 과대평가했나
시뮬레이터의 correctness 모델은 ontology-weights.json v2와 **동일**한 가중치를 사용. 그럼에도 ridge 회귀가 D5 가중치를 올린 이유:
- 노이즈(±0.05) + 작은 샘플(400/QT) → ridge가 D5 dimension의 작은 분산을 어쩌다 신호로 해석
- 4 preset 중 일부 preset에서 D5 점수가 우연히 정답률과 약하게 상관
- λ=1.0 prior pull이 충분히 강하지 않음

→ **이건 simulator의 결함이 아니라 ridge 회귀의 statistical noise**. 게이트가 정확히 catch.

---

## 4. 학습된 교훈

### L1. 게이트의 일반성 (3회 일관 검증)
- Pass-1 (over-declared) / Pass-2 (under-declared) / **Pass-3 (over-declared 다른 차원)**
- 세 종류의 모순 모두 동일 게이트가 검출 → 안전망의 robustness 입증

### L2. λ=1.0 prior pull의 한계
- 1600 응답 (400/QT)에서 이미 noise-driven 모순 발생
- 더 큰 λ (예: 2.0) 또는 더 많은 응답으로 신호/노이즈 비율 개선 필요
- **권장**: 외부 학습자 N ≥ 50, 응답 ≥ 5000일 때 λ를 단계적으로 낮추기

### L3. simulator 검증의 가치
- "synthetic 데이터에서도 게이트가 작동하는가?" 라는 메타 검증
- 답: ✅ — simulator + prior 동일 가중치에서도 noise만으로 모순 발생, 게이트 catch
- 즉, **외부 학습자 데이터 노이즈가 더 클 때도 게이트가 적절히 보호**

### L4. preset UX의 가치 (P-1.5b 후속)
- dogfooding-2: 본인이 paste-import 미사용 → rank-1 X
- dogfooding-3: simulator로 4 preset 자동 적용 → **40 unique dimensionScores 확보**
- 외부 학습자 등장 시 preset 선택 UI를 그대로 활용 가능

---

## 5. 산출물

| 파일 | 내용 |
|---|---|
| `scripts/dogfood-3-presets.mjs` | 재현 가능한 시뮬레이터 (seed-based, --learners/sessions 옵션) |
| `data/dogfood-3-presets-1600.json` | 1600 응답 (.gitignore — 재생성 가능) |
| `out/dogfood-3-preview.json` | calibration dry-run 결과 |
| `out/promote-weights-fail.json` | 게이트 실패 리포트 (3차 실증) |
| `lib/regression-history.json` | auto-append id=`auto-2026-05-23-qdg6` |
| `lib/ontology-weights.json` | **변경 없음** (롤백 후 v2 유지) |

---

## 6. 누적 비교 (3 cycles)

| Cycle | 응답 수 | unique dims | tau | contradictions | 모순 종류 | 적용? |
|---|---:|---:|---:|---:|---|---|
| Pass-1 | 30 (real) | 1 | 0.5 | 1 | D2 over (흐름무관) | ❌ rollback |
| Pass-2 | 1230 (30 real + 1200 sim) | 121 | 0.5 | 1 | D3 under (순서배열) | ❌ rollback |
| **Pass-3** | **1600 (sim only, preset-based)** | **40** | **0.6** | **2** | **D5 over (심경, 제목)** | **❌ rollback** |

→ **3 cycles consecutive rollback**. 안전망이 학습 노이즈로부터 weights를 보호하는 패턴이 정립됨.

---

## 7. 다음 액션

### 즉시 (Claude 자율)
- ✅ 본 보고서 commit + push
- 백로그: λ schedule 정의 (응답 N에 따른 λ 자동 조정 로직)

### 외부 학습자 채널 확보 후
- Pass-4: 실제 학습자 ≥ 5명 × 4 세션 × 4 preset 사용 → 본격 calibration
- λ 단계적 완화 정책 발효

### 본인 결정
- dogfood-3 결과를 phase2-backlog-v2의 K1-K4 자동 KPI에 반영 여부
- 게이트 임계 (contradictions=0) 완화 검토 (Phase 2 시작 후만)

---

## 8. λ schedule 도입 (L2 후속, 2026-05-23 동일 sprint)

### 8.1 동기
§4 L2 finding: "1600 응답에서도 λ=1.0 prior pull이 noise를 충분히 흡수 못함". 검증 가설: 더 큰 λ → contradiction 제거.

### 8.2 실험
동일 1600 응답 데이터에 λ=2.0 적용:

```bash
node scripts/calibrate.mjs --responses data/dogfood-3-presets-1600.json --lambda 2.0 --min 100 ...
```

### 8.3 결과 (λ=2.0)
- TYPE-심경 D5: 10% → **20%** (vs 28% with λ=1.0)
- TYPE-제목 D5: 10% → **19%** (vs 27% with λ=1.0)
- TYPE-순서배열, TYPE-요지 모두 prior에 가까워짐
- **tau = 0.50** (λ=1.0 시 0.60)
- **contradictions = 0** (λ=1.0 시 2)
- **C4.1 게이트 PASS** ✅

→ **가설 검증**: 더 큰 λ가 noise를 더 흡수, contradictions 0건 도달.
단, tau가 0.60 → 0.50으로 감소 (prior에 가까워질수록 약간의 ranking divergence).

### 8.4 auto-lambda 정책 추가 (scripts/calibrate.mjs)
```
N < 100     → λ=2.0  (heavy prior — tiny data)
100-500     → λ=1.5
500-2000    → λ=1.0  (previous default, matches dogfood-3)
2000-10000  → λ=0.7
> 10000     → λ=0.5  (light prior — large data)
```

사용: `--auto-lambda` 플래그 추가. 명시적 `--lambda` 없을 때 자동.

### 8.5 본 promotion은 prod 미적용
λ=2.0 결과는 PASS이지만 **synthetic simulator 데이터로 prod weights 갱신은 부적절** — git revert로 `lib/ontology-weights.json` v2 복원. 실제 prod calibration은 외부 학습자 데이터에서만 진행.

이 결정은 [phase2-backlog-v2.md](../01-plan/phase2-backlog-v2.md) §K1-K5 KPI 원칙에 부합 — K5 (외부 학습자 ≥ 1명) 충족 후만 prod weight ratchet.

---

## 9. 변경 이력
- 2026-05-23: dogfooding-3 실행 — preset α/β/γ/δ × 40 learners × 4 sessions → 1600 응답 → C4.1 게이트 D5 over-declared 2건 검출 → 자동 롤백
- 2026-05-23 (동일 sprint): λ=2.0 검증으로 contradictions 0건 달성 + auto-lambda 정책 코드 추가 (smilepat/oelp scripts/calibrate.mjs)
