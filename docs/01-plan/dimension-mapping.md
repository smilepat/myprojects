# OELP Dimension Mapping — 5D × 10 QuestionType

> Week 2 Deliverable for [PRD MVP Phase 1](./prd-oelp-mvp-phase1.md)
> Status: Draft (2026-05-22)
> Owner: smilepat

---

## 0. 본 문서의 목적

OELP PRD 작성 과정에서 발견한 **3축 간 정의 충돌**을 해소한다.

- 축 A: 학습자 어휘 능력 5D (`vocab-learn-pat`, `level-test-pat` 의 production 스키마)
- 축 B: 수능 문항 유형 (`csat-graphdb-318` 의 `QUESTION_TYPES` 상수)
- 축 C: 오답 패턴 (`csat-graphdb-318` 의 `DISTRACTOR_TYPES` 상수)

본 매핑은 (1) 진단 결과 → 약점 마이크로스킬 추정과 (2) 학습 큐 룰엔진의 입력값으로 사용된다.

---

## 1. Ground Truth (소스 검증됨)

### 1.1 축 A — VocabDimension (5D)

출처: [smilepat/vocab-learn-pat](https://github.com/smilepat/vocab-learn-pat) `src/types/diagnostic.ts`

```ts
export type VocabDimension =
  | 'D1_Form'      // 어휘 형태 (스펠링·발음)
  | 'D2_Meaning'   // 핵심 의미·번역
  | 'D3_Context'   // 맥락 속 의미 추론
  | 'D4_Network'   // 유의어·반의어·파생어 관계망
  | 'D5_Usage';    // 실제 사용 (콜로케이션·문법)
```

**중요 메모 (코드 주석 그대로 인용)**:
> `level-test-pat 은 D6_Cloze 도 있으나, 본 앱은 학습 큐 기준 5개 사용`

→ `level-test-pat`(진단 소스)에는 **D6_Cloze**가 추가로 존재. OELP는 `vocab-learn-pat` 컨벤션을 따라 5D만 사용하되, D6_Cloze 데이터가 들어오면 **드롭하지 않고 D3_Context로 합산** (가설 R2 영향).

### 1.2 축 B — QUESTION_TYPES (10종)

출처: [smilepat/csat-graphdb-318](https://github.com/smilepat/csat-graphdb-318) `src/domains/csat/graph/csat-schema.ts`

| ID | 이름 | 문항 번호 | 배점 | keyVariables |
|---|---|---|---|---|
| TYPE-목적 | 목적 파악 | 18 | 2 | purpose_indirectness, text_type_variation |
| TYPE-심경 | 심경·분위기 | 19-20 | 2 | emotional_indirectness, emotion_vocab_density |
| TYPE-주장 | 필자 주장 | 22 | 2 | claim_explicitness, argument_structure |
| TYPE-요지 | 요지 파악 | 23 | 2 | topic_abstractness, topic_sentence_position |
| TYPE-주제 | 주제 파악 | 24 | 2 | topic_abstractness, topic_sentence_position, advanced_vocab |
| TYPE-제목 | 제목 추론 | 25 | 2 | title_abstractness, metaphor_density |
| TYPE-빈칸추론 | 빈칸 추론 | 29-34 | 3 | coherence_gap, abstractness, context_clue, advanced_vocab |
| TYPE-흐름무관 | 흐름무관 문장 | 35 | 3 | coherence_disruption, topic_consistency |
| TYPE-순서배열 | 순서 배열 | 36-37 | 3 | paragraph_dependency, discourse_marker_density, discourse_structure |
| TYPE-문장삽입 | 문장 삽입 | 38-39 | 3 | coherence_disruption, connective_density, given_sentence_role |

**PRD 정정**: 초안 PRD가 가정한 "16 microskills"는 **부정확**. 실제로는 **10 QuestionType + 21개 keyVariables** (중복 제거). 본 문서가 정답이며, [PRD](./prd-oelp-mvp-phase1.md) 데이터 모델 섹션을 본 표 기준으로 업데이트한다.

### 1.3 축 C — DISTRACTOR_TYPES (7종, 오답 패턴)

| ID | 이름 | 함정 메커니즘 |
|---|---|---|
| DIST-부분일치 | 부분일치 | 어휘 중복 → 일치하는 것처럼 보임 |
| DIST-반대논지 | 반대논지 | 구조 유사·의미 역전 |
| DIST-과잉일반화 | 과잉일반화 | 특수 사례 확대 해석 |
| DIST-범위이탈 | 범위이탈 | 외부 배경지식 결합 시 그럴듯 |
| DIST-인과혼동 | 인과혼동 | 인과 표면적 파악 시 혼동 |
| DIST-시제조건왜곡 | 시제·조건 왜곡 | 문법 형태 유사·조건 다름 |
| DIST-유사어휘함정 | 유사어휘함정 | 철자·발음 유사 어휘 |

축 C는 학습자 **오답 분석용 secondary axis**. 진단 점수에는 직접 기여하지 않으며 [F2 Ontology Map]의 노드 detail view에서 오답 패턴 분포로 표시.

### 1.4 진단 입력 컨트랙트 (Integration Boundary)

출처: 동일 `src/types/diagnostic.ts`

```ts
interface DiagnosticInput {
  studentName: string;
  theta: number;            // IRT -4.0 ~ +4.0
  level: 1 | 2 | 3 | 4 | 5 | 6;  // 1=초등, 6=유학
  cefr: 'A1'|'A2'|'B1'|'B2'|'C1'|'C2';
  dimensionScores: Partial<Record<VocabDimension, number>>;  // 0~100
  weakDim: VocabDimension[];
  strongDim: VocabDimension[];
  timestamp: string;
  source?: string;
}
```

**OELP는 이 컨트랙트를 그대로 수용**한다. URL `?result=<base64>` / 수동 붙여넣기 / localStorage 3가지 전송 방식도 그대로 지원. PRD MVP Phase 1 의 P0 페르소나(수능 D-365 고2)는 `level: 4` (고등학교) 또는 `level: 5` (수능)에 해당.

---

## 2. 매핑 테이블 (5D × 10 QuestionType)

각 셀: 해당 QuestionType 정답에 그 차원이 기여하는 **가중치 (합계 = 1.0)**.
초안은 keyVariables 분포 + 도메인 지식 기반 **휴리스틱**으로 산정. Week 8 베타 데이터로 calibration 예정 (가설 R1).

| QuestionType \ Dimension | D1_Form | D2_Meaning | D3_Context | D4_Network | D5_Usage | 합 |
|---|---:|---:|---:|---:|---:|---:|
| 목적 파악 | 0.05 | 0.20 | 0.55 | 0.10 | 0.10 | 1.00 |
| 심경·분위기 | 0.05 | 0.25 | 0.45 | 0.20 | 0.05 | 1.00 |
| 필자 주장 | 0.05 | 0.20 | 0.50 | 0.15 | 0.10 | 1.00 |
| 요지 파악 | 0.05 | 0.20 | 0.50 | 0.15 | 0.10 | 1.00 |
| 주제 파악 | 0.05 | 0.25 | 0.45 | 0.20 | 0.05 | 1.00 |
| 제목 추론 | 0.05 | 0.20 | 0.40 | 0.30 | 0.05 | 1.00 |
| 빈칸 추론 | 0.05 | 0.20 | 0.45 | 0.20 | 0.10 | 1.00 |
| 흐름무관 | 0.05 | 0.15 | 0.55 | 0.10 | 0.15 | 1.00 |
| 순서 배열 | 0.05 | 0.10 | 0.45 | 0.10 | 0.30 | 1.00 |
| 문장 삽입 | 0.05 | 0.15 | 0.45 | 0.10 | 0.25 | 1.00 |

### 2.1 가중치 산정 근거 (휴리스틱)

- **D1_Form (0.05 균일)**: 문항 단위에서 형태(스펠링·발음) 기여도는 미미 (어휘 레벨에서 흡수). 진단 자체에는 중요하나 수능 문항 정답성에는 거의 영향 없음.
- **D2_Meaning (0.10~0.25)**: 단순 의미 매핑 기여. 심경/주제처럼 단어 의미군이 결정적인 유형에서 높음.
- **D3_Context (0.40~0.55)**: **모든 유형의 1순위 기여 차원**. 수능 독해는 본질적으로 맥락 추론 기반.
- **D4_Network (0.10~0.30)**: 어휘 관계망(유의어·파생어)이 결정적인 유형 — 제목 추론(메타포), 주제(추상화)에서 높음.
- **D5_Usage (0.05~0.30)**: 문법·연결어 사용 패턴이 결정적인 유형 — 순서 배열, 문장 삽입에서 높음.

### 2.2 역추정 공식 (진단 → microskill)

학습자가 차원별 정답률 $s_d \in [0, 100]$ 을 가질 때, QuestionType $q$ 의 예상 정답률:

$$
\hat{p}(q) = \sum_{d \in 5D} w_{q,d} \cdot s_d / 100
$$

여기서 $w_{q,d}$ 는 위 표의 가중치. **계산 결과가 0.5 미만인 QuestionType이 약점 마이크로스킬**로 분류되어 F2/F3 에서 강조된다.

---

## 3. 미해결 이슈

### 3.1 가중치 보정 (R1)
- 현재 휴리스틱은 사용자 도메인 지식 기반. 베타 50명의 모의고사 영역별 점수와 본 매핑 기반 예측치의 Spearman 상관 ≥ 0.5 시 통과.
- 미달 시: 베타 데이터로 ridge regression 학습 → 가중치 자동 보정. 이는 [csat-graphdb-318 #weight-calibration](https://github.com/smilepat/csat-graphdb-318/issues) 이슈와 연동.

### 3.2 D6_Cloze 처리 (R2 영향)
- `level-test-pat` 에서 D6_Cloze 점수가 들어올 경우 D3_Context 에 합산(가중치 합 유지를 위해 D3 가중치 ×1.0, 들어온 D6 점수와 가중평균).
- 명시적 컨트랙트 변경은 Phase 2에서 결정.

### 3.3 Distractor 분석 통합 (Phase 2)
- 본 매핑은 정답 추정만 다룸. 오답 패턴(축 C) 진단은 학습자가 충분히 오답 데이터를 쌓은 후 Phase 2에서 별도 가중치 행렬 작성 예정.

### 3.4 keyVariables 노출 정책
- 21개 keyVariables(text_type_variation, claim_explicitness, ...)는 학습자 UI에 직접 노출하지 않음 (인지 부하). 교사 dashboard(Phase 3) 에서만 노출.

---

## 4. 본 문서의 변경 정책

- 가중치 행렬(섹션 2) 변경은 Phase 2 calibration 결과 commit 1회로 동결.
- 축 A/B/C 정의 변경은 소스 레포(`vocab-learn-pat`, `csat-graphdb-318`) 변경 시에만 동기화 — **OELP는 follower**.
- 본 문서가 PRD와 충돌 시 본 문서가 우선 (PRD는 본 문서를 정정 인용).
