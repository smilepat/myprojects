# C4.1 합성 검증 결과 — keyVariable 분포 vs §2 가중치

> 실행: 2026-05-22T06:00:08.871Z · 출처: smilepat/oelp/scripts/synthetic-validation-c4-1.mjs
> 기준: [PRD §B-5 C4.1](../01-plan/prd-oelp-mvp-phase1.md) · [dimension-mapping §2](../01-plan/dimension-mapping.md)

## 0. 종합 결과

- **Kendall tau (median)**: 0.400 → ✅ PASS (≥0.4)
- Tau range: 0.200 ~ 0.800
- **도메인 모순 (50셀 중)**: 5 → ❌ FAIL

**최종 판정**: FAIL — dimension-mapping §2 가중치 재산정 필요

---

## 1. QuestionType별 비교표

| QT | tau | 모순수 | D1 (decl/derv) | D2 | D3 | D4 | D5 |
|---|---:|---:|---|---|---|---|---|
| 목적 파악 | 0.20 | 1 | 5% / 0% | 20% / 0% | 55% / 50% | 10% / 0% | 10% / 50% |
| 심경·분위기 | 0.60 | 1 | 5% / 0% | 25% / 75% | 45% / 25% | 20% / 0% | 5% / 0% |
| 필자 주장 | 0.20 | 1 | 5% / 0% | 20% / 0% | 50% / 75% | 15% / 0% | 10% / 25% |
| 요지 파악 | 0.40 | 1 | 5% / 0% | 20% / 0% | 50% / 75% | 15% / 25% | 10% / 0% |
| 주제 파악 | 0.80 | 0 | 5% / 0% | 25% / 17% | 45% / 50% | 20% / 33% | 5% / 0% |
| 제목 추론 | 0.60 | 1 | 5% / 0% | 20% / 0% | 40% / 25% | 30% / 75% | 5% / 0% |
| 빈칸 추론 | 0.80 | 0 | 5% / 0% | 20% / 13% | 45% / 50% | 20% / 25% | 10% / 13% |
| 흐름무관 문장 | 0.40 | 0 | 5% / 0% | 15% / 0% | 55% / 75% | 10% / 0% | 15% / 25% |
| 순서 배열 | 0.40 | 0 | 5% / 0% | 10% / 0% | 45% / 33% | 10% / 0% | 30% / 67% |
| 문장 삽입 | 0.40 | 0 | 5% / 0% | 15% / 0% | 45% / 33% | 10% / 0% | 25% / 67% |

범례: 셀은 `declared / derived`. declared = §2 휴리스틱, derived = keyVariables 의미 매핑 기반.

## 2. 도메인 모순 상세

### 목적 파악 (TYPE-목적)

- ⚠️ **D2 Meaning**: 선언 20%이지만 keyVariables에서 근거 없음

### 심경·분위기 (TYPE-심경)

- ⚠️ **D4 Network**: 선언 20%이지만 keyVariables에서 근거 없음

### 필자 주장 (TYPE-주장)

- ⚠️ **D2 Meaning**: 선언 20%이지만 keyVariables에서 근거 없음

### 요지 파악 (TYPE-요지)

- ⚠️ **D2 Meaning**: 선언 20%이지만 keyVariables에서 근거 없음

### 제목 추론 (TYPE-제목)

- ⚠️ **D2 Meaning**: 선언 20%이지만 keyVariables에서 근거 없음


## 3. keyVariable 의미 매핑 (auditable)

본 검증의 핵심 가정. 변경 시 결과 변동.

| keyVariable | 매핑 차원 (균등 분배) |
|---|---|
| `coherence_gap` | D3_Context, D5_Usage |
| `coherence_disruption` | D5_Usage, D3_Context |
| `connective_density` | D5_Usage |
| `discourse_marker_density` | D5_Usage |
| `discourse_structure` | D5_Usage, D3_Context |
| `paragraph_dependency` | D5_Usage, D3_Context |
| `given_sentence_role` | D5_Usage, D3_Context |
| `topic_consistency` | D3_Context |
| `topic_sentence_position` | D3_Context |
| `purpose_indirectness` | D3_Context |
| `emotional_indirectness` | D3_Context, D2_Meaning |
| `claim_explicitness` | D3_Context |
| `topic_abstractness` | D3_Context, D4_Network |
| `title_abstractness` | D4_Network, D3_Context |
| `abstractness` | D3_Context, D4_Network |
| `context_clue` | D3_Context |
| `argument_structure` | D5_Usage, D3_Context |
| `advanced_vocab` | D2_Meaning, D4_Network |
| `emotion_vocab_density` | D2_Meaning |
| `metaphor_density` | D4_Network |
| `text_type_variation` | D5_Usage |

## 4. 방법론

1. 각 QT의 keyVariables를 §3 매핑 표로 차원에 분배 (한 변수가 N차원 → 각 1/N 기여).
2. 합을 1로 normalize → derived weight vector.
3. declared vs derived 두 벡터의 차원 순위(rank) 비교 → Kendall tau.
4. 도메인 모순: declared ≥0.2 인데 derived=0 (선언만 있고 증거 없음) OR derived ≥0.2 인데 declared <0.05 (증거 있는데 저평가).
5. D1_Form(0.05 균일)은 모든 QT에서 동일하게 무관하다는 가정 — keyVariables가 form/spelling을 다루지 않으므로 derived=0. 본 검증에서는 D1을 사실상 무시.
