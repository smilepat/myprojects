# Phase 1.5 — Bridge Work 완료 보고

> 작업: P-1.5 (P-1 완료 후 Phase 2 진입 사이의 dogfooding 인프라)
> Status: ✅ 완료 (52/52 tests + new /sessions route + 평가 폼 + export)
> 기준: [02-design/phase1-5-bridge-dogfooding.md](../02-design/phase1-5-bridge-dogfooding.md)

---

## 0. 결과

| 모듈 | 결과 |
|---|---|
| M1: `lib/session-store.ts` (세션 영속화) | ✅ |
| M2: `lib/session-export.ts` (calibration 호환 export) | ✅ |
| M3: `/queue` 평가 폼 (5 ratings + notes) + 명시적 저장 | ✅ |
| M4: `/sessions` 라우트 (히스토리 + summary + export + clear) | ✅ |
| 랜딩 페이지 4번째 카드 추가 | ✅ |
| Vitest 13 신규 테스트 (session-store + export) | ✅ **52/52 PASS** |
| Next.js build (6 static routes) | ✅ |
| `npm run ci` (lint + test + C4.1 + build) | ✅ |

→ **W8 dogfooding 가능 상태**. 본인이 `npm run dev` 실행 후 4세션 진행 시 자동 누적 + 평가 저장 + export 가능.

---

## 1. 사용 흐름 (변화)

### Before (P-1 W7까지)
```
1. /queue 진입 → DEMO_DIAGNOSTIC 기반 큐
2. 10카드 풀이
3. "세션 완료" 패널 → Box 분포 + posterior 표시
4. "새 큐 시작" → 페이지 reload (휘발성, 기록 없음)
```

### After (P-1.5)
```
1. /queue 진입 → DEMO_DIAGNOSTIC + 누적 posterior 기반 큐
2. 10카드 풀이
3. "세션 완료" 패널 → Box 분포 + posterior 표시
4. 평가 폼 (5 ratings + notes) — 선택
5. "평가와 함께 저장" 또는 "평가 없이 저장" → localStorage 누적
6. /sessions 에서 히스토리 + summary 확인
7. "Calibration JSON 내보내기" → scripts/calibrate.mjs 입력으로 사용 가능
```

---

## 2. 산출물 인덱스

### 코드 (smilepat/oelp)

| 파일 | 신/수정 | 역할 |
|---|---|---|
| `lib/session-store.ts` | 신규 | SessionRecord 영속화 + summarize |
| `lib/session-export.ts` | 신규 | Calibration JSON 변환 + 다운로드 |
| `app/queue/page.tsx` | 수정 | 평가 폼 + 명시적 저장 + restart→reload |
| `app/sessions/page.tsx` | 신규 | 히스토리 표 + summary + export + clear |
| `app/page.tsx` | 수정 | 4번째 카드 (/sessions) |
| `tests/session-store.test.ts` | 신규 | 13 단위 테스트 |

### 문서 (myprojects)

| 파일 | 위치 | 역할 |
|---|---|---|
| `phase1-5-bridge-dogfooding.md` | 02-design | P-1.5 설계 |
| 본 문서 | 04-report (`p1-5-bridge-complete.md`) | 완료 보고 |

---

## 3. 단위 테스트 결과 (52/52)

```
 RUN  v4.1.7
 Test Files  5 passed (5)
      Tests  52 passed (52)
   Duration  1.23s
```

- recommendation: 10
- recommendation-store: 11
- queue-v2: 8
- calibration: 10
- **session-store: 13 (신규)**

### session-store 핵심 검증 (T1-T10)
- 영속화 round-trip, multi-user 격리, schema version fallback
- evaluation 선택 필드, summarizeSessions 통계
- `exportSessionsForCalibration` qtId/scores/correct 보존

---

## 4. UI 변경 스크린샷 (텍스트 묘사)

### /queue 완료 패널 (P-1.5)

```
세션 완료
[정답 X/10] [정답률 X0%] [Box 승격 X/10] [차원 ...]
[Thompson posterior: α β samples confidence]
[Box 분포 1-5]

─── 세션 평가 (선택 — W8 dogfooding) ───
C1.2 진단 weakDim 직관 일치도:   [1][2][3][4][5]
C2.1 Map weakness 도메인 납득도: [1][2][3][4][5]
C2.3 노드 detail 직관성:         [1][2][3][4][5]
C3.3 다시 할 의향?               [Yes][No]
종합 만족도:                     [1][2][3][4][5]
[메모 textarea]

[평가와 함께 저장 | 저장하지 않고 새 큐 시작]
```

### /sessions

```
Dogfooding Sessions
누적 세션: N · 평가 첨부: M / N · 평균 만족도: 4.2 / 5 · 다시 할 의향: 75%

[Calibration JSON 내보내기] [모두 삭제]

| # | 날짜 | QT | algo | conf | 정답 | 만족도 | 계속의향 | 메모 |
| 1 | 2026-05-23 14:00 | TYPE-요지 | rule-v1 | low | 6/10 | 4/5 | yes | "..." |
| 2 | 2026-05-23 15:00 | TYPE-빈칸추론 | thompson-v2 | mid | 5/10 | 5/5 | yes | "..." |
```

---

## 5. Calibration 통합 흐름

```
사용자가 4세션 진행 (P-1.5 평가 폼 사용)
   ↓
localStorage.oelp.sessions.default 누적
   ↓
/sessions → "Calibration JSON 내보내기" 클릭
   ↓
브라우저 다운로드: oelp-sessions-YYYY-MM-DD.json
   ↓
data/dogfood-responses.json 으로 저장
   ↓
node scripts/calibrate.mjs --responses data/dogfood-responses.json --apply
   ↓
promote-weights.mjs (C4.1 회귀 게이트)
   ↓
PASS → lib/ontology-weights.json 자동 갱신
FAIL → 자동 롤백
```

이 흐름은 **W8 dogfooding 완료 후 자동 calibration이 본인 환경에서 가능**함을 의미.

---

## 6. 알려진 한계

### L1 — 진단 입력 customize 미지원
- 여전히 `DEMO_DIAGNOSTIC` constant 사용
- vocab-cat-test 통합 시 자동으로 실 진단으로 전환 (Docker 단계)
- 또는 URL 파라미터 `?result=...` (decodeResultParam 기존 구현 활용 가능, UI 추가만 필요) — Phase 2에서 처리

### L2 — Chart 시각화 부재
- /sessions는 단순 표 — 트렌드 chart 없음
- Phase 2 W4 잔여 작업으로 분리

### L3 — Supabase 동기 부재
- 모든 세션 localStorage only
- 디바이스 간 동기 → P-2 work

### L4 — Posterior reseed 시 history 영향 없음
- session-store는 reseed에 무관 (기록은 발생 시점 그대로)
- 의도된 동작 — 시계열 기록 보존

---

## 7. 누적 OELP 상태

### 자동화 산출물
- **테스트**: 52 (Vitest)
- **검증 스크립트**: 8 (.mjs)
- **GH Actions**: 2 (weekly + PR check)
- **라우트**: 5 (/, /diagnose, /map, /queue, /sessions)
- **안전망 layer**: 4 (Vitest + C4.1 + build + auto-rollback)

### Phase별 진행
- Phase 1: 자동 11/12 PASS (96%)
- P-1: 7/8 weeks complete (87.5%) + W8 가이드 작성 완료
- **P-1.5: 100% complete** ← 본 작업

### 본인 정성 평가 잔여
- C1.2 의미 stability (vocab-cat-test 통합 후) ⏳
- C2.1 도메인 납득도 (이제 in-app 평가 가능) ✓ ready
- C3.3 학습 ROI (이제 in-app 평가 가능) ✓ ready

→ **C2.1/C3.3은 dev server 실행 + 4세션 진행으로 즉시 평가 가능**.

---

## 8. 다음 옵션 (재정렬)

### 즉시 가능 (자율)
1. **본인 dogfooding 진행** (가장 가치 큰 다음 단계)
2. **P-2 EBS-demo Content Generator 통합** (6주, 외부 dep)
3. **P-7 Neo4j Spike** (4주, cloud cost)

### 본인 환경 의존
4. **vocab-cat-test 통합** (Docker 1회 설치)
5. **Phase 1.5 안정화 추가** (Chart/A11y/SEO 등 polish)

권장: 본인이 `npm run dev` 실행 후 시나리오 A (Session 1) 시도해보고 — 평가 폼 UX가 painless한지 본인 확인 후 결정.

---

## 9. 인용

- 본 보고서: [04-report/p1-5-bridge-complete.md](./p1-5-bridge-complete.md)
- 설계: [02-design/phase1-5-bridge-dogfooding.md](../02-design/phase1-5-bridge-dogfooding.md)
- W8 가이드: [04-report/p1-w8-dogfooding-guide.md](./p1-w8-dogfooding-guide.md)
- P-1 종합: [04-report/p1-final-summary.md](./p1-final-summary.md)
- 구현:
  - [oelp/lib/session-store.ts](https://github.com/smilepat/oelp/blob/main/lib/session-store.ts)
  - [oelp/app/sessions/page.tsx](https://github.com/smilepat/oelp/blob/main/app/sessions/page.tsx)
