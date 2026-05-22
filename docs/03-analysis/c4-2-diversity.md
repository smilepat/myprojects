# C4.2 합성 검증 결과 — 학습 큐 다양성 (lemma overlap)

> 실행: 2026-05-22T15:04:37.157Z · 출처: smilepat/oelp/scripts/c4-2-diversity.mjs
> 기준: [PRD §B-5 C4.2](../01-plan/prd-oelp-mvp-phase1.md)

## 0. 종합 결과

- **Pairwise Jaccard median**: 25.0% (목표 < 30.0%) → ✅ PASS
- Jaccard range: 11.1% ~ 42.9%
- 5회 큐 누적 unique lemma: 25 / 50 (50.0%)

**최종 판정**: PASS — VOCAB_POOL (vocabulary-db irt-5D-vocab-db-4opt-filtered.csv) 486 cards / 484 unique lemmas 사용.

## Pool 정보 (2026-05-23 update)

- 출처: smilepat/vocabulary-db/irt-5D-vocab-db-4opt-filtered.csv (8,363 단어 × 63K 문항)
- 샘플링: `scripts/build-vocab-pool.mjs` 가 5D × 7 difficulty bands 균형 추출
- 현재 풀: 486 cards, 484 unique lemmas

---

## 1. 5회 큐 상세

| Run | theta | targetQT | targetDims | cards | unique lemmas |
|---:|---:|---|---|---:|---:|
| 0 | 0.10 | 요지 파악 | D3_Context, D4_Network | 10 | 10 |
| 1 | 0.20 | 요지 파악 | D3_Context, D4_Network | 10 | 10 |
| 2 | 0.30 | 요지 파악 | D3_Context, D4_Network | 10 | 10 |
| 3 | 0.40 | 요지 파악 | D3_Context, D4_Network | 10 | 10 |
| 4 | 0.50 | 요지 파악 | D3_Context, D4_Network | 10 | 10 |

## 2. Pairwise Jaccard overlap

| Run A | Run B | Jaccard |
|---:|---:|---:|
| 0 | 1 | 42.9% |
| 0 | 2 | 25.0% |
| 0 | 3 | 17.6% |
| 0 | 4 | 11.1% |
| 1 | 2 | 25.0% |
| 1 | 3 | 17.6% |
| 1 | 4 | 11.1% |
| 2 | 3 | 42.9% |
| 2 | 4 | 25.0% |
| 3 | 4 | 42.9% |

## 3. 방법론

- 5회 jittered diagnostics: theta ±0.2 shift, dimensionScores ±2 jitter (같은 컨디션 가정).
- 각 회 `buildQueue()` 호출 → 10 카드 묶음.
- Jaccard(A, B) = |A∩B| / |A∪B| (단어 단위, itemId 아님).
- 통과 기준: median Jaccard < 0.30 (즉 평균 70% 이상의 카드가 다름).
- 한계: STUB_POOL 풀 크기(30)가 너무 작아 잠재 overlap 상한이 높음. 실제 vocabulary-db에서 재실행 필요.
