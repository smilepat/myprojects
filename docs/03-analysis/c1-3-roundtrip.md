# C1.3 합성 검증 결과 — DiagnosticInput round-trip

> 실행: 2026-05-22T06:13:47.602Z · 출처: smilepat/oelp/scripts/c1-3-roundtrip.mjs
> 기준: [PRD §B-5 C1.3](../01-plan/prd-oelp-mvp-phase1.md)

## 0. 종합 결과

- **Round-trip lossless**: 6 / 6 → ✅ PASS
- **Edge case rejection**: 5 / 5 → ✅ PASS

**최종 판정**: PASS — DiagnosticInput 컨트랙트 안정. level-test-pat ↔ OELP 데이터 교환 안전

---

## 1. Round-trip 결과 (6 샘플)

| # | 학습자 | level | encoded len | decode | deep equal | 통과 |
|---:|---|---:|---:|:---:|:---:|:---:|
| 1 | 초등 4학년 | 1 | 396 | ✓ | ✓ | ✅ |
| 2 | 중1 학생 | 2 | 375 | ✓ | ✓ | ✅ |
| 3 | 고1 학생 | 4 | 391 | ✓ | ✓ | ✅ |
| 4 | 고3 수험생 P0 | 5 | 382 | ✓ | ✓ | ✅ |
| 5 | 재수생 | 5 | 386 | ✓ | ✓ | ✅ |
| 6 | 유학준비생 | 6 | 411 | ✓ | ✓ | ✅ |

샘플은 level 1~6, CEFR A1~C2, theta -1.8~+1.9의 풀 레인지를 커버.

## 2. Edge case rejection (5건)

| 케이스 | 기대 | 결과 | 통과 |
|---|---|---|:---:|
| empty string | null 반환 | null | ✅ |
| invalid base64 | null 반환 | null | ✅ |
| valid base64 non-JSON | null 반환 | null | ✅ |
| missing required field | null 반환 | null | ✅ |
| level out of range | null 반환 | null | ✅ |

## 3. 방법론

- `encodeResultParam`: JSON.stringify → UTF-8 → base64 → URL-safe (`+/=` → `-_` 제거)
- `decodeResultParam`: 역순 + `isDiagnosticInput` 가드
- 비교: 재귀적 deep equality (객체/배열/원시값)
- 본 검증은 lib/diagnostic.ts의 함수를 mirror한 .mjs 구현으로 실행. 프로덕션 lib와 동일한 인코딩 보장.
