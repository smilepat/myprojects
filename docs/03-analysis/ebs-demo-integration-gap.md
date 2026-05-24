# EBS-demo ↔ OELP 통합 — 실제 갭 분석

> 작성: 2026-05-24 (v8 sprint, 옵션 B 자율 시도 결과)
> Status: ⚠️ **README 기존 표기 "코드 완료, Firebase config 잔여" 오해 정정 필요**
> 결론: Stage B-2는 30분 작업 아님. 별도 PR (1-2일) 필요.

---

## 0. 한 줄

OELP는 EBS-demo의 `/api/generate` 호출 코드만 있을 뿐, **실제로는 contract / 인증 / 도메인 3가지 mismatch로 작동 불가**. Firebase config는 EBS-demo에 이미 17일 전부터 설정되어 있으나 그것이 통합을 활성화하지 않음.

---

## 1. v5 README의 표기와 실제 갭

[smilepat/oelp README §9](https://github.com/smilepat/oelp/blob/main/README.md):
```
P-2 W7 EBS real wiring | 100% (코드 완료, Firebase config 본인 잔여)
```

→ 자율 시도 결과 이 표기가 misleading. 실제로는 stub 수준.

### 1.1 OELP가 기대하는 contract

[smilepat/oelp lib/content-generator.ts](https://github.com/smilepat/oelp/blob/main/lib/content-generator.ts) `EBSCriteriaEngineGenerator`:

```typescript
const res = await fetch(`${this.endpoint}/api/generate`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    qtId: ctx.qtId,                    // 예: "TYPE-요지"
    targetDimensions: ctx.targetDimensions,  // ["D3_Context", "D4_Network"]
    difficultyRange: ctx.difficultyRange,    // { min: -0.5, max: 0.7 }
    count: ctx.count,                  // 10
    excludeItemIds: ctx.excludeItemIds ?? [],
  }),
});
```

응답 기대: `VocabCard[]` 형식 — 어휘 카드 (4지선다 의미 추론).

### 1.2 EBS-demo가 실제 받는 contract

[smilepat/EBS-demo apps/web/src/app/api/generate/route.ts](https://github.com/smilepat/EBS-demo/blob/main/apps/web/src/app/api/generate/route.ts):

```typescript
const { grade, passageText, topic, itemCount, optionCount, apiKey } = body;

if (!grade || !passageText || typeof passageText !== 'string' || passageText.trim().length < 20) {
  return Response("grade and passageText (>=20 chars) are required", 400);
}
```

응답: STAX schema 기반 **passage-grounded 문항** (수능 변형 — 빈칸/순서/요지 추론).

→ **모든 입력 필드가 다름**. OELP의 호출은 EBS에서 400 반환.

### 1.3 인증 보호

```bash
$ curl -X POST https://ebs-demo.vercel.app/api/generate \
    -H "Content-Type: application/json" \
    -d '{"grade":"고1","passageText":"..."}'
{"error":{"code":"403","message":"Forbidden",...}}
```

→ Vercel WAF 또는 EBS 내부 미들웨어에서 외부 호출 차단. admin token 또는 server-side 인증 필요.

### 1.4 도메인 mismatch

| 시스템 | 입력 | 출력 | 사용처 |
|---|---|---|---|
| OELP `/queue` | qtId + 5D + 난이도 | VocabCard (단어 + 4지선다 의미) | 어휘 SRS 학습 큐 |
| EBS `/api/generate` | grade + passageText | STAX 문항 (passage 기반) | 수능형 문항 생성기 (교사용) |

→ 같은 LogicFlow 생태계지만 **서로 다른 학습 모듈**. OELP는 어휘 mastery, EBS는 reading comprehension. 직접 통합 불가능.

---

## 2. 실제 통합하려면 무엇이 필요한가

### 2.1 옵션 α — EBS에 OELP용 adapter endpoint 추가

```
POST /api/oelp-vocab-generate
  body: { qtId, targetDimensions, difficultyRange, count }
  body 내부에서 grade/passageText 추론 또는 Gemini로 vocab card 직접 생성
  response: VocabCard[] (OELP 스키마)
```

**작업량**: EBS 측 신규 endpoint 1개 + Gemini 프롬프트 작성 + OELP 호출 contract 매칭. 약 1일.

### 2.2 옵션 β — OELP의 EBSCriteriaEngineGenerator를 EBS contract로 변환

OELP 측에서 `qtId → grade`, `targetDimensions → passageText template` 변환 로직 작성. 그러나 EBS는 passage-based 출력이라 OELP의 VocabCard 스키마에 맞지 않음.

**적합도 낮음**. EBS의 출력을 OELP에서 vocab card로 후처리 변환해야 함 — 데이터 손실 큼.

### 2.3 옵션 γ — 별도 vocab 생성기 추가 (EBS와 무관)

EBS-demo는 reading용으로 남기고, OELP용 새 vocab generator를 별도로 띄움 (예: Gemini 호출 mini-service). OELP의 EBSCriteriaEngineGenerator를 그쪽으로 리다이렉트.

**작업량**: vocab generator 신규 1-2일 + Vercel 또는 Cloud Run 배포. 인증/rate limit 별도.

---

## 3. 권장 의사결정

### 3.1 단기 (Stage C 1명 도착 전)
- OELP의 `EBSCriteriaEngineGenerator`는 stub 유지. Chain의 LocalPoolGenerator로만 fallback.
- README §9의 "EBS real wiring 100%" 표기를 **"stub — adapter PR 필요"** 로 정정.
- 본 분석 문서를 별도 backlog 항목으로 명시 (Phase 2 v3 PRD).

### 3.2 중기 (외부 학습자 N=10+ 도달 후)
- LocalPool 486 카드로 vocab 양이 부족해질 때 옵션 α 추진.
- 옵션 γ도 비교 검토 (vocabulary-db CSV 9183 단어를 LLM으로 다양화).

### 3.3 장기 (Phase 3)
- EBS-demo + OELP를 단일 LogicFlow 학습 경로로 통합 (어휘 → 지문 → 종합 평가).
- 이때만 도메인 mismatch 해소 가능.

---

## 4. 영향받는 다른 문서 정정 사항

- [smilepat/oelp README §9](https://github.com/smilepat/oelp/blob/main/README.md) — "P-2 W7 EBS real wiring 100%" → "stub, adapter PR 필요"
- [smilepat/oelp README §10 Stage B](https://github.com/smilepat/oelp/blob/main/README.md) — "EBS-demo Firebase config (30분)" → "EBS adapter PR (1-2일)" 로 재분류
- [oelp-integrated-summary §17.7](./oelp-integrated-summary.md) (v8) — 이미 재정의 반영됨

---

## 5. 관련 자료

- OELP EBSCriteriaEngineGenerator: [lib/content-generator.ts](https://github.com/smilepat/oelp/blob/main/lib/content-generator.ts)
- EBS generate route: [apps/web/src/app/api/generate/route.ts](https://github.com/smilepat/EBS-demo/blob/main/apps/web/src/app/api/generate/route.ts)
- 본 갭 발견 sprint: [oelp-integrated-summary §17.4](./oelp-integrated-summary.md)
- Stage B-1 (Cloud Run) 완료 runbook: [vocab-cat-test-cloudrun-runbook.md](./vocab-cat-test-cloudrun-runbook.md)

---

## 6. 변경 이력

- 2026-05-24: 본 문서 작성 (v8 sprint, 옵션 B 자율 시도 후 발견)
