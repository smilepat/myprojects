# Phase 1.5 — Make Dogfooding Painless (Bridge Work)

> Bridge between P-1 (complete) and Phase 2 P-2 (next).
> Status: Draft (2026-05-23)
> Owner: smilepat
> Compressed scope: 자율 실행 가능 / 외부 의존성 없음

---

## 0. 동기 (Why Bridge Now)

P-1 7주 완성 후 상황:
- ✅ 인프라/안전망 100% (39 tests + C4.1 + build + auto-rollback)
- ✅ Phase 2 진입 코드 차단 요인 0
- ⏳ W8 dogfooding 본질적 병목 — 본인 정성 평가가 P-1 final 게이트
- ❌ 현재 OELP는 **세션이 휘발성** — 새 세션마다 demo constant부터, 누적 학습 데이터 없음

→ Dogfooding이 **유효한 평가**가 되려면 누적 데이터 필요.

3가지 옵션 비교:

| 옵션 | 가치 | 자율성 | 시간 | 결정 |
|---|---|---|---|---|
| P-1.5 Bridge (이 문서) | dogfooding 가능 + P-2 데이터 공급 | 높음 | 1세션 | **권장** |
| P-2 EBS-demo 통합 | 콘텐츠 풀 확장 | 중간 (Firebase config) | 6주 | 후속 |
| P-7 Neo4j Spike | 정확도 평가 | 중간 (cloud 비용) | 4주 | 후속 |
| Phase 1.5 안정화 (Docker) | C1.2 의미 stability | 낮음 (Docker 설치 본인) | 4주 | 본인 환경 시점 |

P-1.5 Bridge는 다른 옵션의 prerequisite 역할도 함:
- P-2 calibration 시 누적 세션 데이터 공급
- Phase 1.5 안정화 시 dogfooding 평가 폼 그대로 활용

---

## 1. Scope (작은 4개 모듈)

### M1: `lib/session-store.ts` — Session History 영속화

```ts
export interface SessionRecord {
  sessionId: string;
  startedAt: string;
  endedAt: string;
  durationSec: number;
  /** From buildQueueV2 plan */
  targetQuestionType: string;
  algorithm: "rule-v1-fallback" | "thompson-v2";
  confidence: "low" | "mid" | "high";
  alternateQuestionType: string;
  /** Stats */
  correct: number;
  total: number;
  advancements: number;
  boxAfter: Record<string, number>;
  posteriorAfter: BetaPosterior;
  /** Detail (per-card) */
  responses: Array<{
    itemId: string;
    qtId: string;
    isCorrect: boolean;
    /** Dimension scores at the time (for calibration data export) */
    dimensionScores: Partial<Record<VocabDimension, number>>;
    at: string;
  }>;
  /** Optional qualitative evaluation */
  evaluation?: {
    c1_2_diagnostic_consistency: number; // 1-5
    c2_1_map_acceptance: number;          // 1-5
    c2_3_node_intuition: number;          // 1-5
    c3_3_continue_intention: "yes" | "no";
    overall_satisfaction: number;         // 1-5
    notes: string;
  };
}

export function loadSessions(userId?: string): SessionRecord[];
export function saveSession(record: SessionRecord, userId?: string): void;
export function clearSessions(userId?: string): void;
```

**Storage**: `oelp.sessions.{userId}` (default `default`). Schema versioned. Same conventions as `recommendation-store.ts`.

### M2: `lib/session-export.ts` — Calibration-Compatible Export

```ts
import type { SessionRecord } from "./session-store";
import type { CalibrationResponse } from "./calibration";

/**
 * Convert session history → CalibrationResponse[] for scripts/calibrate.mjs.
 * Each per-card response becomes one row.
 */
export function exportSessionsForCalibration(
  sessions: SessionRecord[]
): CalibrationResponse[];
```

→ User runs:
```bash
# Future: in-app "export sessions" button writes data/dogfood-responses.json
node scripts/calibrate.mjs --responses data/dogfood-responses.json --apply
```

### M3: `/queue` 완료 패널 — Evaluation Form

Queue summary 패널 하단에 평가 폼 추가:

```
세션 완료
[정답 X/Y] [정답률 X%] [Box 승격 X/Y] [차원 ...]
[Thompson posterior: α β samples confidence]
[Box 분포 1-5]

── 본 세션 평가 (Optional) ──
C1.2 진단 weakDim 직관 일치도:   [1] [2] [3] [4] [5]
C2.1 Map weakness 도메인 납득도: [1] [2] [3] [4] [5]
C2.3 노드 detail 직관성:         [1] [2] [3] [4] [5]
C3.3 "다시 할 의향":             [Yes] [No]
종합 만족도:                     [1] [2] [3] [4] [5]
메모: [textarea]

[평가 저장 + 새 큐 시작]  [평가 없이 새 큐]
```

평가 폼이 제출되면 `saveSession()` 호출 → localStorage 누적.

### M4: `/sessions` 신규 라우트 — History + Export

```
─── Dogfooding Sessions History ───

총 N 세션 누적 (마지막: 2026-05-23 17:30)
평균 만족도: 3.8 / 5

[Export for Calibration] [Clear All]

| # | 날짜 | QT | algo | conf | correct | satisfaction | notes |
| 1 | 2026-05-23 14:00 | 요지 파악 | rule-v1 | low | 6/10 | 4 | "..." |
| 2 | 2026-05-23 15:00 | 빈칸추론 | thompson-v2 | mid | 5/10 | 5 | "..." |
...
```

Export 클릭 시 `data/sessions-{timestamp}.json` 다운로드 (브라우저 download trigger).

---

## 2. Tests

`tests/session-store.test.ts` — Vitest:
1. Empty state load
2. Save → load round-trip
3. Multi-user 격리
4. Schema version mismatch fallback
5. Evaluation field optional
6. Export → CalibrationResponse 변환 정확

→ 누적 단위 테스트: 39 → **45+**.

---

## 3. UI 변경 요약

| 위치 | 변경 |
|---|---|
| `app/queue/page.tsx` | 평가 폼 + saveSession 호출 |
| `app/sessions/page.tsx` (신규) | 히스토리 표 + export 버튼 |
| `app/page.tsx` | 4번째 카드 "세션 히스토리" 추가 |

---

## 4. Phase 2 진입과의 관계

P-1.5 종료 후:
- **W8 dogfooding 가능**: 본인이 4세션 진행 시 자동으로 누적 + 평가 저장
- **P-2 prerequisite 충족**: EBS-demo 통합 시 calibration 데이터로 활용
- **C2.1/C3.3 본인 평가 인프라 갖춤**: W12 보고서 자동 업데이트 가능

→ Phase 2 진입 시점이 본인 4세션 진행 후로 명확해짐.

---

## 5. 비-목표

- 외부 학습자 데이터 수집 (분석 events.md는 Supabase 기반이라 별도)
- 통계 대시보드 (단순 표만; chart는 W4 후속)
- 진단 변경 기능 (DEMO_DIAGNOSTIC 그대로; vocab-cat-test 통합은 Docker 단계)

---

## 6. 인용

- 본 설계: `02-design/phase1-5-bridge-dogfooding.md`
- 관련:
  - [P-1 final](./../04-report/p1-final-summary.md)
  - [W8 dogfooding guide](./../04-report/p1-w8-dogfooding-guide.md)
  - [P-2 phase2-backlog](./../01-plan/phase2-backlog.md)
