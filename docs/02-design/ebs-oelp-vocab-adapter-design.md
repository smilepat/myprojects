# EBS-demo OELP vocab adapter — 설계 문서 (옵션 α PR plan)

> 작성: 2026-05-24 (v8 sprint, 옵션 B 재정의 후속)
> 선행: [`docs/03-analysis/ebs-demo-integration-gap.md`](../03-analysis/ebs-demo-integration-gap.md)
> Status: 📋 **설계만 — 구현은 별도 PR 1-2일**
> 목적: OELP가 EBS-demo의 Gemini를 활용해 VocabCard 생성 가능하게

---

## 0. 한 줄

EBS-demo에 신규 endpoint `/api/oelp-vocab` 추가. OELP의 `EBSCriteriaEngineGenerator`가 호출 가능한 contract. Gemini로 어휘 카드 합성. 인증은 OELP 전용 token으로.

---

## 1. 동기

[ebs-demo-integration-gap.md §2.1 옵션 α](../03-analysis/ebs-demo-integration-gap.md):
- EBS-demo는 이미 Gemini API + Firebase 설정 완료, 17일 production 운영
- OELP는 LocalPool 486 카드 한정, 학습자 N=10+ 도달 시 부족
- EBS의 Gemini 자산을 재사용해서 OELP용 카드 동적 생성

---

## 2. API contract 설계

### 2.1 Request (OELP → EBS)

```typescript
POST /api/oelp-vocab
Authorization: Bearer <OELP_TO_EBS_TOKEN>
Content-Type: application/json

{
  qtId: "TYPE-요지",                // 학습 큐 타겟 QT
  targetDimensions: ["D3_Context", "D4_Network"],  // 강화 대상
  difficultyRange: { min: -0.5, max: 0.7 },        // IRT b
  count: 10,                        // 요청 카드 수
  excludeItemIds: ["card-123"],     // 중복 회피
  learnerHints?: {                  // 선택 (Stage C 이후)
    cefr: "B2",
    archetype?: "weak-D2"
  }
}
```

### 2.2 Response

```typescript
{
  cards: Array<{
    itemId: string,                 // 안정적 ID (해시 기반)
    dimension: VocabDimension,      // D1_Form | D2_Meaning | ...
    difficulty: number,             // IRT b, -2..+2
    cefr: "A1" | "A2" | "B1" | "B2" | "C1" | "C2",
    questionText: string,           // "다음 단어의 의미로 가장 적절한 것은?"
    options: string[4],             // 4지선다
    answerIdx: 0 | 1 | 2 | 3,
    rationaleKo: string,            // 정답 해설 (1-2문장)
    sourceWord?: string,            // optional 원어휘
  }>,
  generator: "ebs-gemini-vocab-v1",
  generatedAt: "2026-05-24T...",
  issues: Array<{ code, message, severity }>  // 0개 또는 generator-level 경고
}
```

### 2.3 OELP 측 contract 일치

OELP `lib/content-generator.ts` `ContentGeneratorResult` 인터페이스와 1:1 매칭. 추가 변환 불필요.

---

## 3. EBS 측 구현 (apps/web/src/app/api/oelp-vocab/route.ts)

### 3.1 인증 미들웨어

```typescript
// 환경변수: OELP_TO_EBS_TOKEN (Vercel secret, 양쪽 등록)
function verifyOelpToken(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  return auth.slice(7) === process.env.OELP_TO_EBS_TOKEN;
}
```

CSRF/replay 방지: token rotation 90일 (EBS SECURITY.md 정책과 일치).

### 3.2 Gemini 프롬프트

```typescript
const SYSTEM_PROMPT = `
You are an EFL vocabulary item generator for the LogicFlow OELP platform.
Generate {count} multiple-choice vocabulary cards targeting:
  - QT: {qtId}
  - Strengthening dimensions: {targetDimensions.join(", ")}
  - IRT difficulty range: b ∈ [{min}, {max}]
  - CEFR level inferred from difficulty (b=-2 → A1, b=+2 → C2)

Each card must:
  - Test ONE word's MEANING (D2_Meaning) or CONTEXTUAL use (D3_Context)
  - Have exactly 4 options, 1 correct
  - Have a Korean rationale (1-2 sentences) explaining the correct answer
  - Provide a stable itemId (hash of word + difficulty)

Output strictly as JSON matching:
{ "cards": [...] }
`;
```

### 3.3 Validators

EBS의 기존 `validateGeneratedItems` 재사용 + OELP V1-V12 contract 추가:
- V1 itemId uniqueness
- V2 answerIdx ∈ [0, 3]
- V3 options[answerIdx] non-empty
- V4-V12 (OELP의 content-validators.ts 12 rules)

Validator failure 시 issues에 적재, fallback은 OELP의 LocalPoolGenerator chain이 처리.

### 3.4 Rate limiting

`x-ratelimit-*` 헤더 + 분당 60 req / 일당 1000 req. OELP의 1인 dogfooding 충분, 외부 학습자 N=50까지 안전.

---

## 4. OELP 측 변경

### 4.1 EBSCriteriaEngineGenerator 인증 추가

`lib/content-generator.ts`:

```typescript
export class EBSCriteriaEngineGenerator implements ContentGenerator {
  constructor(
    private endpoint?: string,
    private token?: string  // 추가
  ) {}

  async generate(ctx: ContentGeneratorContext): Promise<ContentGeneratorResult> {
    if (!this.endpoint || !this.token) {
      return { cards: [], generator: this.name, issues: [{...EBS_NOT_CONFIGURED}] };
    }
    const res = await fetch(`${this.endpoint}/api/oelp-vocab`, {  // ← 경로 변경
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.token}`,
      },
      // 나머지는 기존과 동일
    });
    // ...
  }
}

export function defaultGeneratorChain(): GeneratorChain {
  const ebsUrl = process.env.NEXT_PUBLIC_EBS_DEMO_URL;
  const ebsToken = process.env.EBS_OELP_TOKEN;  // server-only, NOT NEXT_PUBLIC_
  return new GeneratorChain([
    new EBSCriteriaEngineGenerator(ebsUrl, ebsToken),
    new LocalPoolGenerator(),
  ]);
}
```

### 4.2 Vercel env 설정

- `NEXT_PUBLIC_EBS_DEMO_URL=https://ebs-demo.vercel.app` (public)
- `EBS_OELP_TOKEN=<random 32-byte hex>` (server-only)
- EBS 측에도 동일한 `OELP_TO_EBS_TOKEN` 등록

---

## 5. PR 구성 (1-2일 작업)

### Day 1
1. EBS 측 `/api/oelp-vocab` route 구현 (2-3 hours)
2. Gemini 프롬프트 작성 + 테스트 (3-4 hours)
3. EBS 측 validators 어댑터 (1-2 hours)

### Day 2
1. OELP 측 EBSCriteriaEngineGenerator 인증 추가 (1 hour)
2. Token 발급 + Vercel env 양쪽 등록 (30 min)
3. End-to-end 검증: OELP /queue에서 EBS 카드 받아오는 것 확인 (2 hours)
4. cloud-run-smoke 변형 — EBS-vocab-smoke CI job 추가 (1 hour)
5. README 두 레포 모두 갱신 (1 hour)

### 인수 기준
- OELP `/queue` 페이지에서 EBS generator 카드 표시 (LocalPool fallback 안 됨)
- 카드 quality: 본인 5점 척도 평균 ≥ 4.0 (50 카드 sample)
- Validators failure rate < 5%
- Rate limit 정상 작동
- Cost: Gemini API 분 당 60 req 한계 안에서 운영

---

## 6. 보류 사항 / 미결정

1. **Gemini 비용**: 카드당 약 $0.001. 학습자 N=50 × 일 10 cards × 30일 = 15,000 카드 = 약 $15/월. 본인 부담 의향?
2. **Card quality**: Gemini 출력 일관성 — 본인이 50 카드 sample 보고 의사결정 필요
3. **D1_Form 미해결**: 본 adapter도 D1_Form 학습 강화에는 기여 안 함 ([dogfood-8 finding](../03-analysis/dogfooding-8-learning-curve-d1-plateau.md) 별도 해결 필요)
4. **EBS-demo 학습자 영향**: EBS는 교사용 도구로 운영 중. OELP traffic이 EBS의 Gemini quota를 잠식하면 영향. quota 분리 검토

---

## 7. 본 문서의 사용

- **Stage C 진입 전**: 학습자 N=10+ 도달까지 옵션 α 보류. LocalPool 486 카드로 충분
- **Stage C 진입 후 N=10+ 도달 시**: 본 문서를 PR description으로 사용해서 1-2일 작업 시작
- **N=50+ 도달 시**: rate limit, cost monitoring, validators 정밀화 필요

---

## 8. 변경 이력

- 2026-05-24: 본 설계 문서 작성 (v8 sprint, 옵션 α 후속 PR 준비)
