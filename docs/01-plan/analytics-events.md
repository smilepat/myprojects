# OELP Analytics Event Schema

> Week 3 Deliverable for [PRD MVP Phase 1](./prd-oelp-mvp-phase1.md)
> Status: Draft (2026-05-22)
> Owner: smilepat
> Storage: Supabase `events` 테이블 (단일 테이블, PRD §B-8 결정사항)

---

## 0. 본 문서의 목적 (2026-05-22 개정)

**개정 배경**: 베타 50명 모집 불가 확인 후 검증 전략이 dogfooding + 합성 검증으로 전환됨 (PRD [§B-5](./prd-oelp-mvp-phase1.md#b-5-검증-기준-2026-05-22-개정-베타-모집-불가-반영)).

본 문서의 **용도가 재정의**됨:
- **구**: 베타 N≥50명의 통계 KPI 측정용 이벤트 로깅
- **신**: (a) 본인 + 지인 1-3명의 dogfooding 행동 로그, (b) 합성 검증 입력 데이터, (c) **향후 학습자 접근 채널 확보 시 즉시 통계 KPI 활성화** 준비

따라서 §2 이벤트 타입 10개는 그대로 유지한다 (통계 분석은 못해도 1인 행동 자체는 기록 가치 있음). §4 KPI 측정 쿼리 6개는 N=1~3에서 의미 없지만 **장차 N≥30 도달 시 즉시 활성화** 가능하도록 보존.

설계 원칙:
- **단일 테이블** — Supabase `events` 1개로 모든 이벤트 수용. JSONB `properties` 컬럼으로 확장.
- **이벤트 타입 ≤ 12개** — 분석 복잡도 통제. 추가 필요 시 PR + 리뷰 필수.
- ~~KPI 역추적 — 모든 이벤트가 KR과 매핑~~ → **변경**: 이벤트는 행동 로깅 + 합성 검증 입력 + 미래 KPI 활성화 준비 3가지 용도. KR과 직접 매핑은 미래 활성화 시 효력.

**현재 단계의 분석 방식**:
- 본인 행동 로그는 1인 정성 일지 작성에 보조 자료로 사용.
- 합성 검증(R1 Kendall tau 등)은 events 테이블 없이 csat-graphdb-318/vocabulary-db 직접 SQL로 처리.
- 통계 쿼리 §4는 보존하되 **Week 12 평가에서는 실행하지 않음** (N 부족).

---

## 1. 테이블 스키마

```sql
create table public.events (
  id           bigint generated always as identity primary key,
  occurred_at  timestamptz not null default now(),
  user_id      uuid not null references auth.users(id),
  session_id   text not null,                      -- 클라이언트 생성 uuid v4, 25분 세션 단위
  event_type   text not null,                      -- ENUM (§2 참조)
  properties   jsonb not null default '{}'::jsonb, -- 이벤트별 페이로드 (§3)
  client_ts    timestamptz,                        -- 클라이언트 측 타임스탬프 (서버 시각과 분리)
  app_version  text                                 -- e.g. "0.1.0"
);

create index events_user_time on public.events (user_id, occurred_at desc);
create index events_type_time on public.events (event_type, occurred_at desc);
create index events_session   on public.events (session_id);
create index events_props_gin on public.events using gin (properties);
```

**RLS 정책**: 자기 자신의 이벤트만 INSERT 가능, SELECT는 admin만. (베타 분석은 admin 권한으로 직접 쿼리)

---

## 2. 이벤트 타입 (10종, ENUM)

| event_type | 트리거 시점 | KR 매핑 |
|---|---|---|
| `auth.signed_up` | 회원가입 완료 | (집계용, 직접 KR 없음) |
| `auth.signed_in` | 로그인 성공 | (집계용) |
| `diag.started` | 진단 첫 문항 진입 | O1 KR1.3 분모 |
| `diag.item_answered` | 진단 1문항 응답 (정/오답 무관) | O1 KR1.2 (평균 문항수) |
| `diag.completed` | 진단 종료 (theta/dimensionScores 확정) | O1 KR1.1, KR1.3 |
| `map.viewed` | Ontology Map 화면 진입 | O2 KR2.1, KR2.2 분모 |
| `map.node_clicked` | microskill 노드 클릭 (detail view) | O2 KR2.2 보조 |
| `queue.started` | 학습 큐 첫 항목 진입 | O2 KR2.2, O3 KR3.1 분모 |
| `queue.item_answered` | 큐 내 단어/지문 항목 응답 | O3 KR3.2 (회상률) |
| `queue.completed` | 25분 세션 큐 완수 | O3 KR3.1 |

**의도적으로 제외한 이벤트**:
- 페이지뷰, 클릭 트래킹 일반 — 베타 50명 단계에서 노이즈만 증가
- 에러 로깅 — Sentry 등 별도 채널 사용 (events 테이블은 행동 데이터 전용)
- 학습 큐 항목 표시(impression) — 응답(answered) 이벤트로 충분히 추정 가능

---

## 3. 이벤트별 페이로드 스펙

### 3.1 `auth.signed_up` / `auth.signed_in`
```jsonc
{
  "provider": "email" | "google" | "kakao",
  "is_returning": boolean
}
```

### 3.2 `diag.started`
```jsonc
{
  "diagnostic_source": "level-test-pat" | "embedded",  // 외부 진단 임포트인지
  "prior_theta": number | null                         // 재진단인 경우 이전 theta
}
```

### 3.3 `diag.item_answered`
```jsonc
{
  "diagnostic_session_id": "uuid",          // 진단 1회 = 1 uuid
  "item_index": integer,                    // 1-based, CAT 진행 순서
  "item_id": "string",                      // vocab_master.sqlite item id
  "dimension": "D1_Form" | ... | "D5_Usage",
  "is_correct": boolean,
  "response_ms": integer,                   // 응답 소요 시간
  "theta_estimate_after": number,           // 응답 후 theta 갱신값
  "se_after": number                        // standard error after
}
```

### 3.4 `diag.completed`
```jsonc
{
  "diagnostic_session_id": "uuid",
  "items_count": integer,                   // 최종 문항 수 (KR1.2 분자)
  "theta_final": number,
  "level": 1 | 2 | 3 | 4 | 5 | 6,
  "cefr": "A1" | ... | "C2",
  "dimension_scores": {                     // DiagnosticInput 컨트랙트와 동일
    "D1_Form": 78, "D2_Meaning": 82, "D3_Context": 45,
    "D4_Network": 60, "D5_Usage": 71
  },
  "weak_dims": ["D3_Context", "D4_Network"],
  "predicted_question_types": {             // dimension-mapping.md 역추정 결과
    "TYPE-빈칸추론": 0.48, "TYPE-순서배열": 0.52, ...
  },
  "abandoned": false                        // true면 KR1.3 분자에서 제외
}
```

### 3.5 `map.viewed`
```jsonc
{
  "trigger": "post_diagnostic" | "manual_nav",  // 진단 직후 자동 진입인지
  "load_ms": integer                            // 1초 이내 SLO (PRD F2 DoD)
}
```

### 3.6 `map.node_clicked`
```jsonc
{
  "node_type": "QuestionType" | "keyVariable" | "DistractorType",
  "node_id": "TYPE-빈칸추론",
  "is_weak": boolean                        // 약점 노드인지
}
```

### 3.7 `queue.started`
```jsonc
{
  "trigger": "from_map" | "direct_nav" | "resume",
  "queue_id": "uuid",
  "target_question_type": "TYPE-빈칸추론",   // 룰엔진이 선택한 약점 type
  "vocab_count": integer,                    // 10 (PRD F3)
  "passage_count": integer                   // 1 (PRD F3)
}
```

### 3.8 `queue.item_answered`
```jsonc
{
  "queue_id": "uuid",
  "item_kind": "vocab" | "passage_question",
  "item_id": "string",
  "is_correct": boolean,
  "response_ms": integer,
  "leitner_box_before": 1 | 2 | 3 | 4 | 5,
  "leitner_box_after": 1 | 2 | 3 | 4 | 5,
  "elapsed_session_min": number              // 세션 시작 후 경과 분
}
```

### 3.9 `queue.completed`
```jsonc
{
  "queue_id": "uuid",
  "session_duration_min": number,            // 25 ± 5 정상 범위
  "items_correct": integer,
  "items_total": integer,
  "vocab_recall_score": integer,             // 큐 10개 어휘 중 box1→box2 진입 수 (KR3.2)
  "completed": boolean                       // false = 25분 전 이탈
}
```

---

## 4. KPI 측정 쿼리 (참조용)

### O1 KR1.1 — 재진단 theta 편차 ≤ 0.3 (P90)
```sql
with paired as (
  select user_id,
         abs(properties->>'theta_final')::numeric - lag(...) ... -- (의사 SQL)
  from events
  where event_type = 'diag.completed'
)
select percentile_cont(0.9) within group (order by theta_diff)
from paired;
```

### O1 KR1.2 — CAT 평균 종료 문항수 ≤ 25
```sql
select avg((properties->>'items_count')::numeric)
from events
where event_type = 'diag.completed'
  and (properties->>'abandoned')::boolean = false;
```

### O2 KR2.1 — 진단 완료 → Map 열람 ≥ 80%
```sql
-- diag.completed → 이후 24h 내 map.viewed 한 학습자 수 / diag.completed 학습자 수
```

### O2 KR2.2 — Map 열람 → 큐 시작 ≥ 50%
```sql
-- map.viewed → 이후 24h 내 queue.started / map.viewed 학습자 수
```

### O3 KR3.1 — 큐 완수율 ≥ 60%
```sql
select count(*) filter (where (properties->>'completed')::boolean)::numeric
  / nullif(count(*), 0)
from events
where event_type = 'queue.completed';
```

### O3 KR3.2 — 큐 어휘 회상 ≥ 6/10
```sql
select avg((properties->>'vocab_recall_score')::numeric)
from events
where event_type = 'queue.completed';
```

### O3 KR3.3 — 4주 후 theta 향상 ≥ +0.2
- 동일 user_id 의 첫 `diag.completed` 와 28일 이후 첫 `diag.completed` 의 theta 차이 평균.

---

## 5. 미해결 결정사항

- **세션 정의** — 25분 inactivity로 자동 종료? 명시적 종료 버튼? Week 4까지 결정.
- **GDPR/개인정보** — beta는 한국 학습자 중심이라 GDPR 직접 적용은 아니나, 이벤트 RLS + 30일 보존 정책 검토 필요.
- **A/B 실험 컬럼** — Phase 1은 단일 룰엔진이라 미필요. Phase 2에서 `properties.experiment_id` 추가 예정.

---

## 6. 변경 정책

- 동결 시점 (개정): **향후 학습자 접근 채널 확보 후 첫 외부 사용자 가입 1일 전** — 그 이후 변경은 마이그레이션 PR 필수. dogfooding 단계에서는 자유 변경 가능 (스키마는 어차피 재설치 가능).
- 신규 이벤트 추가: KR 매핑 명시 + 본 문서 §2 표 업데이트가 PR의 필수 체크.
- 기존 properties 필드 삭제 금지 (deprecated 마킹만 허용).
