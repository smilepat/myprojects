# C4.2 합성 검증 결과 — 학습 큐 다양성 (lemma overlap)

> 실행: 2026-05-22T06:13:47.718Z · 출처: smilepat/oelp/scripts/c4-2-diversity.mjs
> 기준: [PRD §B-5 C4.2](../01-plan/prd-oelp-mvp-phase1.md)

## 0. 종합 결과

- **Pairwise Jaccard median**: 100.0% (목표 < 30.0%) → ❌ FAIL
- Jaccard range: 100.0% ~ 100.0%
- 5회 큐 누적 unique lemma: 6 / 50 (12.0%)

**최종 판정**: FAIL — 실제 vocabulary-db (9,183 어휘) 마운트 후 재검증 권장

## ⚠️ Scope 한계

본 검증은 `STUB_POOL` 30 카드 (15 lemma × 2 difficulty)에서 실행됨. 실제 vocabulary-db는 9,183 어휘이므로 다양성 잠재력이 612배 큼. 본 결과는 "룰엔진의 다양성 보장 메커니즘이 작동하는지"의 scaffold-level 확인이며, 실제 다양성 수치는 vocabulary-db 마운트 후 의미 있음.

---

## 1. 5회 큐 상세

| Run | theta | targetQT | targetDims | cards | unique lemmas |
|---:|---:|---|---|---:|---:|
| 0 | 0.10 | 요지 파악 | D3_Context, D4_Network | 10 | 6 |
| 1 | 0.20 | 요지 파악 | D3_Context, D4_Network | 10 | 6 |
| 2 | 0.30 | 요지 파악 | D3_Context, D4_Network | 10 | 6 |
| 3 | 0.40 | 요지 파악 | D3_Context, D4_Network | 10 | 6 |
| 4 | 0.50 | 요지 파악 | D3_Context, D4_Network | 10 | 6 |

## 2. Pairwise Jaccard overlap

| Run A | Run B | Jaccard |
|---:|---:|---:|
| 0 | 1 | 100.0% |
| 0 | 2 | 100.0% |
| 0 | 3 | 100.0% |
| 0 | 4 | 100.0% |
| 1 | 2 | 100.0% |
| 1 | 3 | 100.0% |
| 1 | 4 | 100.0% |
| 2 | 3 | 100.0% |
| 2 | 4 | 100.0% |
| 3 | 4 | 100.0% |

## 3. 방법론

- 5회 jittered diagnostics: theta ±0.2 shift, dimensionScores ±2 jitter (같은 컨디션 가정).
- 각 회 `buildQueue()` 호출 → 10 카드 묶음.
- Jaccard(A, B) = |A∩B| / |A∪B| (단어 단위, itemId 아님).
- 통과 기준: median Jaccard < 0.30 (즉 평균 70% 이상의 카드가 다름).
- 한계: STUB_POOL 풀 크기(30)가 너무 작아 잠재 overlap 상한이 높음. 실제 vocabulary-db에서 재실행 필요.
