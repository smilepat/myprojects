# 옵션 A' — D1_Form plateau 해결 정식 PR plan (C4.1 호환)

> 작성: 2026-05-24 (v10 sprint, 옵션 A1 단독 실패 후)
> 선행: [`dogfooding-8-learning-curve-d1-plateau.md`](../03-analysis/dogfooding-8-learning-curve-d1-plateau.md)
> Status: 📋 **설계만** — 4 파일 동시 수정 PR 필요 (1일 작업)

---

## 0. 한 줄

옵션 A1 (TYPE-제목 D1 weight 0.05→0.20) 단독은 C4.1 게이트에 의해 거부 — "선언만 있고 keyVariables 근거 없음" 모순 catch. 정식 해결책은 form-related keyVariables 신규 추가 + weight 동시 업데이트 = **옵션 A'**.

---

## 1. 옵션 A1 단독 실패 — v10 sprint 검증 결과

dogfood-8 시뮬은 옵션 A1이 D1 plateau를 66-70% 회복시킴을 입증. 그러나 실제 `lib/ontology-weights.json` 변경 + C4.1 게이트 실행 결과:

```
Kendall tau (median): 0.600 → ✅ PASS (≥0.4)
도메인 모순 (50셀 중): 1 → ❌ FAIL

제목 추론 (TYPE-제목):
  ⚠️ D1 Form: 선언 20%이지만 keyVariables에서 근거 없음
```

**최종 판정**: FAIL — gate가 옵션 A1을 거부.

원인: `lib/kv-dim-mapping.ts`의 21 keyVariables 모두 D2-D5만 매핑. D1_Form을 다루는 keyVariable이 0개. C4.1 derived 계산상 모든 QT에서 D1 = 0% 자동 산출.

→ weight 단독 boost는 도메인 안전망에 의해 항상 차단됨. **이는 안전망 정상 작동 — 가중치 변경에 도메인 증거 요구**.

---

## 2. 옵션 A' 설계 — keyVariables + weight 동시

### 2.1 신규 keyVariables 3개 추가

`lib/kv-dim-mapping.ts` 와 `myprojects/docs/01-plan/dimension-mapping.md §3` 양쪽 동시 갱신:

```typescript
// 신규 추가
morphological_complexity: ["D1_Form", "D2_Meaning"],
// 단어의 어근/접사 분리 난이도. 제목 단어가 multi-morpheme이면 의미 추출 어려움
// EFL 도메인 합치: 제목 후보 단어의 형태론적 복잡도가 직접 D1 영향

orthographic_irregularity: ["D1_Form"],
// 철자 불규칙성 (예: enough, although, queue). 제목 인지 시 D1 차원 직접

word_length_distribution: ["D1_Form", "D5_Usage"],
// 평균 단어 길이 + 분산. 긴 단어 비율이 form 부담 증가
```

→ 21 → 24 keyVariables, D1_Form 매핑 0개 → 3개.

### 2.2 TYPE-제목 keyVariables 배열 갱신

`lib/ontology.ts` `QUESTION_TYPES` 의 TYPE-제목 entry:

```typescript
{
  id: "TYPE-제목",
  name: "제목 추론",
  keyVariables: [
    "title_abstractness",      // 기존
    "abstractness",            // 기존
    "advanced_vocab",          // 기존
    "metaphor_density",        // 기존
    "morphological_complexity", // ⭐ 신규
    "orthographic_irregularity", // ⭐ 신규
  ],
},
```

이제 derived 계산 시:
- title_abstractness (D4, D3) → 0.5/0.5
- abstractness (D3, D4) → 0.5/0.5
- advanced_vocab (D2, D4) → 0.5/0.5
- metaphor_density (D4) → 1.0
- **morphological_complexity (D1, D2) → 0.5/0.5**
- **orthographic_irregularity (D1) → 1.0**

normalize 후 derived D1_Form ≈ 0.25, derived D4 감소.

### 2.3 ontology-weights.json TYPE-제목 weight 갱신

```json
"TYPE-제목": {
  "D1_Form": 0.20,
  "D2_Meaning": 0.08,
  "D3_Context": 0.29,
  "D4_Network": 0.34,
  "D5_Usage": 0.09
}
```

(기존 D4_Network 0.40 → 0.34 등, 비례 renormalize.)

### 2.4 PRD dimension-mapping 갱신

`myprojects/docs/01-plan/dimension-mapping.md` §3 keyVariable 표에 신규 3개 추가 + §2 가중치 표의 TYPE-제목 행 갱신.

---

## 3. C4.1 게이트 예상 결과 (옵션 A' 후)

| QT | tau (예상) | 모순 |
|---|---|---|
| 제목 추론 | ≥ 0.6 | declared D1=0.20 vs derived ~0.25 → ✅ |
| 다른 QT 모두 | 기존 유지 | tau 0.40-0.80 |

→ **PASS** 예상. 게이트의 "도메인 증거" 요구를 새 keyVariables가 충족.

---

## 4. PR 구성 (1일 작업)

| Step | 파일 | 작업 |
|---|---|---|
| 1 | `myprojects/docs/01-plan/dimension-mapping.md` | §3 keyVariable 표 + §2 가중치 표 갱신 (PRD 우선 — 도메인 직관 검토) |
| 2 | `lib/kv-dim-mapping.ts` | 3 신규 매핑 추가 |
| 3 | `tests/kv-dim-mapping.test.ts` | 신규 3개에 대한 contract test 추가 |
| 4 | `lib/ontology.ts` | TYPE-제목 keyVariables 배열에 2개 추가 |
| 5 | `lib/ontology-weights.json` | TYPE-제목 행 weight 재조정 (`promote-weights.mjs --reason "D1 plateau fix"`) |
| 6 | `npm run ci` | lint + tests + **C4.1 PASS** + build |
| 7 | `dogfood-8 --archetype all` 재실행 | D1_Form plateau 해소 확인 (production weight로) |
| 8 | PR description에 v10 finding + dogfood-8 결과 인용 |

**총 변경**: 5 파일 (oelp 4 + myprojects 1). 약 1일 본인 작업.

---

## 5. Stage C 진입 후 검증

옵션 A' 적용 후:
1. 외부 학습자 1명 도착 → 3-4주 누적 후 dim score 측정
2. D1_Form이 실제로 학습되는지 확인 (시뮬과 실 데이터 일치성)
3. 다른 dim (D2/D3/D4) 학습이 약화되지 않았는지 모니터링
4. 만약 D4가 너무 떨어지면 추가 keyVariable로 보완

---

## 6. 보류 / 미결정

### 6.1 기타 QT도 D1 plateau 발생?
TYPE-제목 외 9 QT도 D1_Form weight 0.05 동일. 본 PR로는 다른 QT D1 plateau는 미해결.

**대안**: TYPE-목적, TYPE-주제, TYPE-제목 3개만 form-related 과제로 분류, 나머지는 D1 무관 — 5D를 4D로 축소 (옵션 C).

### 6.2 morphological_complexity 측정 방법
실제 keyVariable 값 계산 시 어떤 알고리즘? Stage C 데이터로 검증 필요. 임시: Python `nltk.WordNetLemmatizer` + 음절 카운트.

### 6.3 기존 calibration history 영향
이미 누적된 calibration history는 D1 = 0.05 기반. weight 변경 후 historical responses는 재해석되지 않음 — 새 cycle부터 적용.

---

## 7. 본 문서 사용

- **Stage C 진입 전**: 본 PR plan 보류. 시뮬상 검증만으로는 도메인 증거 약함. 본인 EFL 직관으로 morphological_complexity 등 신규 keyVariables 적합성 검토 필요.
- **Stage C N=10+ 도달 후**: 실 데이터에서도 D1 plateau 확인 시 본 PR 추진.
- **Stage C N=30+ 도달 시**: 옵션 A' 적용 후 dogfood-9 (계 만들면 좋겠지만 미구현) — production weight 변경 안전성 시뮬.

---

## 8. 변경 이력

- 2026-05-24: 본 설계 작성 (v10 sprint, 옵션 A1 단독 C4.1 게이트 실패 확인 후 정식 plan)
