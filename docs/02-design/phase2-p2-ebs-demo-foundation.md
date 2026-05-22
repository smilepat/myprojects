# Phase 2 P-2 — EBS-demo Content Generator Integration

> Spec for [phase2-backlog](../01-plan/phase2-backlog.md) §2 P-2 (6주)
> Status: Foundation Design (W1-W2 equivalent)
> Owner: smilepat
> Prerequisites: P-1.5b complete (varied diagnostic + session export ready) ✓

---

## 0. Foundation Scope

이 문서는 P-2의 처음 2주 분량 (interface + stub + validators) 의 설계. 본 단계의 산출물은 EBS-demo를 실제로 호출하지 않고도 OELP가 콘텐츠 생성 의존성에 대해 합리적 추상화를 갖도록 한다.

**Foundation 범위**:
- ContentGenerator interface 정의
- LocalPoolGenerator (기존 VOCAB_POOL 기반) — 즉시 동작
- EBSCriteriaEngineGenerator stub — 향후 Firebase 설정 후 활성화
- 9 validator chain — VocabCard 무결성 보장
- 단위 테스트 + 통합 테스트

**Foundation 비-목표**:
- EBS-demo 실제 호출 (W3+ 작업)
- LLM 비용 최적화 (W4+)
- IRT cold-start 알고리즘 (W5+)

---

## 1. EBS-demo 레포 분석 ([smilepat/EBS-demo](https://github.com/smilepat/EBS-demo))

### 1.1 핵심 패키지: criteria-engine

```
packages/criteria-engine/src/
├── constraints/     # grade-bounds (학년/유형 제약)
├── data/           # achievement-standards 1077건, RAG hints 999건, EBS gold samples
├── nlp/            # nlp-engine, vocabAnalyzer
├── prompt/         # prompt-engine, synthesize (T3에서 server-only로 분리)
├── types/          # question types
└── validators/
    ├── item-validator.ts  (13KB, 12 validation rules)
    ├── passage.ts         (6KB)
    └── verification.ts    (5KB)
```

### 1.2 6 Criterion 시스템 (index.ts 주석)
1. NLP 분석 (Lexile, FK, Coleman-Liau, Coherence, Abstractness, Inference)
2. STAX 스키마 + 프롬프트 합성
3. 12 검증 규칙 (item-validator)
4. 5 검증 원칙 (verification.ts)
5. 학년/타입 제약 (constraints/grade-bounds.ts)
6. 정적 데이터 (achievement-standards 1077, RAG hints 999, EBS gold samples)

### 1.3 핵심 검증 결과 타입 (item-validator.ts)

```ts
export interface ValidationIssue {
  itemIndex: number;
  severity: 'error' | 'warning';
  code: string;       // 머신 판독용
  message: string;    // 사람 친화적 한국어
}

export interface ItemValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  perItem: { itemIndex: number; status: 'pass' | 'warn' | 'fail'; issueCount: number }[];
}
```

→ OELP P-2는 이 타입 패턴을 차용한다.

### 1.4 EBS-demo 통합 비용 추정

| 옵션 | 비용 | 가치 |
|---|---|---|
| **(A) npm package 게시 + 의존성 추가** | EBS-demo 측 publish 작업 필요 (지금은 미게시) | 가장 깨끗 |
| **(B) git submodule** | OELP에 EBS-demo 전체 추가, build 복잡 | 즉시 가능하나 무겁다 |
| **(C) 필요 파일만 copy + 동기 유지** | 수동 동기 필요 (drift 위험) | 단순한 시작 |
| **(D) Adapter pattern + 미래 plug-in** | 인터페이스만 정의, 구현은 future | **권장** (foundation 단계) |

**결정**: 옵션 D — interface + stub로 시작. EBS-demo 실제 통합은 W3+ 작업.

---

## 2. P-2 인터페이스 설계

### 2.1 ContentGenerator 인터페이스

```ts
// lib/content-generator.ts

import type { VocabCard } from "./vocabulary-pool";
import type { VocabDimension } from "./diagnostic";

export interface ContentGeneratorContext {
  qtId: string;                              // Target QuestionType
  targetDimensions: VocabDimension[];        // Top-2 from buildQueueV2
  difficultyRange: { min: number; max: number };
  count: number;                             // 보통 10
  /** Optional: avoid these item IDs (already shown to learner) */
  excludeItemIds?: string[];
}

export interface ContentGeneratorResult {
  cards: VocabCard[];
  /** Track which generator produced these — for analytics + auto-rollback */
  generator: string;
  /** Validation issues encountered (filtered out cards before return) */
  issues: ValidatorIssue[];
}

export interface ContentGenerator {
  /** Stable identifier — used in event logs */
  readonly name: string;
  generate(ctx: ContentGeneratorContext): Promise<ContentGeneratorResult>;
}
```

### 2.2 구현체 1: LocalPoolGenerator (즉시 사용)

```ts
import { VOCAB_POOL } from "./vocabulary-pool";

export class LocalPoolGenerator implements ContentGenerator {
  readonly name = "local-pool-v1";
  async generate(ctx: ContentGeneratorContext): Promise<ContentGeneratorResult> {
    const candidates = VOCAB_POOL.filter(c =>
      ctx.targetDimensions.includes(c.dimension) &&
      c.difficulty >= ctx.difficultyRange.min &&
      c.difficulty <= ctx.difficultyRange.max &&
      !(ctx.excludeItemIds?.includes(c.itemId))
    );
    // Fisher-Yates shuffle + slice
    const shuffled = shuffleClone(candidates);
    const cards = shuffled.slice(0, ctx.count);
    const { issues } = validateCardBatch(cards);
    return { cards, generator: this.name, issues };
  }
}
```

### 2.3 구현체 2: EBSCriteriaEngineGenerator (stub)

```ts
export class EBSCriteriaEngineGenerator implements ContentGenerator {
  readonly name = "ebs-criteria-engine-v1";
  constructor(private endpoint: string) {}
  async generate(ctx: ContentGeneratorContext): Promise<ContentGeneratorResult> {
    if (!process.env.NEXT_PUBLIC_EBS_DEMO_URL) {
      return { cards: [], generator: this.name, issues: [
        { cardIndex: -1, code: "EBS_NOT_CONFIGURED", message: "EBS-demo endpoint not set",
          severity: "error" },
      ]};
    }
    // TODO (W3-W4): wire to EBS-demo's synthesize.ts API
    // → POST { qtId, targetDimensions, difficulty } → returns generated items
    // → Run validateCardBatch + EBS-demo's 12-rule item-validator
    // → Return validated subset
    throw new Error("EBSCriteriaEngineGenerator: integration pending W3");
  }
}
```

### 2.4 9 Validator Chain (Foundation subset)

EBS-demo의 12 rules 전체 포팅은 W4-W5 작업. Foundation에서는 OELP `VocabCard` 무결성에 필수인 9개만 구현:

```
V1: Structure       — itemId, word, dimension 모두 non-empty
V2: Options shape   — options 배열 length === 4
V3: Answer valid    — answerIdx ∈ [0, 3]
V4: Unique options  — 모든 options 문자열 unique
V5: Non-empty opts  — 각 option 문자열 non-empty
V6: IRT params      — b ∈ [-3, 3], a ∈ [0.5, 2.5]
V7: Dimension valid — D1_Form ~ D5_Usage 중 하나
V8: CEFR valid      — A1-C2 중 하나
V9: questionText    — non-empty + length > 5
```

각 validator는 `(card: VocabCard, idx: number) => ValidatorIssue[]` 시그니처. 결과 누적해서 `ValidationResult` 반환.

EBS-demo의 추가 검증 (Q3 어휘 검증, anagram, 다중 빈칸 등)은 OELP가 사용하는 단순 4지선다 어휘 카드 범위에서는 불필요 — V1-V9가 충분.

---

## 3. 통합 흐름 (큐 빌드 시점)

```
사용자가 /queue 진입
   ↓
buildQueueV2(diag, posteriors) [기존]
   ↓
target QT + targetDimensions 결정
   ↓
contentGenerator.generate({ qtId, targetDimensions, difficultyRange, count: 10 })
   ↓
LocalPoolGenerator (default) 또는
EBSCriteriaEngineGenerator (env 설정 시 fallback chain)
   ↓
validateCardBatch(cards) — 자동 검증
   ↓
[issues에 errors가 있으면 다음 generator로 fallback] [W4 work]
   ↓
cards → /queue UI 표시
```

### 3.1 Generator Chain Fallback (W3)

```
const generators: ContentGenerator[] = [
  new EBSCriteriaEngineGenerator(process.env.NEXT_PUBLIC_EBS_DEMO_URL),
  new LocalPoolGenerator(),  // always-available fallback
];
```

EBS 실패 (env 없음, API timeout, validators FAIL) → LocalPool로 fallback. 무중단.

### 3.2 IRT cold-start (W5)

EBS-demo 생성 항목은 IRT b/a 모름. Cold start 정책:
- 첫 노출: `b = 학습자 theta`, `a = 1.0`
- 50회 응답 누적 후: 실제 정답률로 b/a 재추정 (Phase 2 후속)

---

## 4. Foundation 산출물

### 4.1 신규 파일

| 파일 | 역할 | LOC 예상 |
|---|---|---|
| `lib/content-generator.ts` | Interface + LocalPoolGenerator + EBS stub | ~150 |
| `lib/content-validators.ts` | 9 validators + chain runner | ~200 |
| `tests/content-generator.test.ts` | 10+ Vitest tests | ~150 |
| `tests/content-validators.test.ts` | 9 validator tests + chain | ~200 |

### 4.2 수정 파일

- `app/queue/page.tsx` — buildQueueV2 결과 카드를 generator로 한번 더 통과? — Foundation에서는 NO (현재 vocabulary-pool 그대로 사용 유지). W3에서 wire-in.

---

## 5. Foundation 후속 단계 (W3-W6)

| W | 작업 |
|---|---|
| W3 | EBSCriteriaEngineGenerator 실제 구현 (Firebase config + REST 호출) |
| W4 | Generator chain fallback (queue page wire-in) |
| W5 | IRT cold-start (b=theta, 50회 후 재추정) |
| W6 | EBS-demo의 12-rule item-validator 추가 포팅 |

---

## 6. 의존성 + 변경 영향

### 6.1 추가 의존성: **0건**
- 이번 Foundation은 interface + stubs만 — npm 패키지 추가 없음
- Future EBS-demo 실제 호출 시: `fetch` 만 사용 (already available)

### 6.2 기존 코드 영향
- `lib/vocabulary-pool.ts`: 영향 없음 (LocalPoolGenerator가 import만)
- `lib/queue.ts`: 영향 없음 (W3에서 wire-in)
- 모든 기존 39 + 9 + 13 = **61 Vitest 통과 유지** 필수

---

## 7. Risk 분석

### R-P2-1 (낮음): Validator drift
- OELP V1-V9 vs EBS-demo 12-rule이 시간이 지나며 drift
- 완화: V6 (EBS validator 추가 포팅) 시 동기 정책 명시

### R-P2-2 (중간): EBS-demo 통합 비용
- EBS-demo Firebase config가 본인 환경 의존
- 완화: LocalPoolGenerator always-available, EBS는 enhancement

### R-P2-3 (낮음): IRT cold-start 불확실
- 생성 항목의 진짜 난이도 알 수 없음
- 완화: theta-based 초기화 + 50회 응답 후 재추정 (W5)

---

## 8. 인용

- 본 설계: [02-design/phase2-p2-ebs-demo-foundation.md](./phase2-p2-ebs-demo-foundation.md)
- 백로그: [01-plan/phase2-backlog.md §2 P-2](../01-plan/phase2-backlog.md)
- EBS-demo: [smilepat/EBS-demo](https://github.com/smilepat/EBS-demo)
- EBS criteria-engine: [packages/criteria-engine/src/](https://github.com/smilepat/EBS-demo/tree/main/packages/criteria-engine/src)
- VocabCard 정의: [oelp/lib/vocabulary-pool.ts](https://github.com/smilepat/oelp/blob/main/lib/vocabulary-pool.ts)
