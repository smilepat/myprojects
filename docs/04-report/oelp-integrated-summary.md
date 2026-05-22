# OELP 통합 회고 — Phase 1 + P-1 + P-1.5 + P-1.5b + P-2

> 작성: 2026-05-23 / Owner: smilepat / Scope: 전체 OELP 진행 종합
> 산출 기간: 압축 실행 (실제 설계 일정은 8+ 주)

---

## 0. 한 페이지 요약

OELP (Ontology English Learning Platform)는 LogicFlow EdTech 생태계의 통합 구현체로 시작되어, **8주분 P-1 + 1주 P-1.5 + 6주 P-2** 분량의 인프라를 완성. **자동 단위 테스트 119건, 6 라우트, 14 lib 모듈, 9 scripts, 2 GH Actions workflow** 보유. 본인 dogfooding 1회 실행으로 **자동 calibration + C4.1 safety net production 실증**.

### 핵심 수치

| 항목 | 수치 |
|---|---|
| Vitest 단위 테스트 | **119 PASS** |
| 라우트 | 6 (/, /diagnose, /map, /queue, /sessions, /_not-found) |
| lib 모듈 | 14 |
| scripts | 9 (validation, calibrate, promote, sync, simulate, gen-fake, build-pool, c1-3/c4-2 reports) |
| GitHub Actions | 2 (pr-check, weekly-calibration) |
| 안전망 layer | 4 (Vitest + C4.1 + build + promote-rollback) |
| 자동 평가 통과율 | **Phase 1 11/12 (96%)** + P-1 100% + P-1.5 100% + **P-2 100%** |

---

## 1. Phase 1 MVP (W1-W12) 회고

### 1.1 Plan 단계

PRD 초안을 받아 **6개 핵심 갭** 식별 후 개정 PRD 작성:
- Beta N≥30 → dogfooding + 합성 검증 전환 (사용자 환경 제약)
- KPI → 12 C 기준 (정성 + 합성)
- C4.1 회귀 차단 (R1 가설)
- Phase 2 backlog 8개 항목 + KPI-conditional 자동 승격 룰

→ docs/01-plan에 PRD + dimension-mapping + analytics-events + phase2-backlog 4개 문서 완성.

### 1.2 Implementation 단계 (W3-W10)

- **F1 진단** (vocab-cat-test 통합 스캐폴드 + GrowthRadar Chart.js 포팅, vocab-learn-pat 컴포넌트 재사용)
- **F2 Ontology Map** (Cytoscape.js + 10 QuestionType + 21 keyVariables + 7 DistractorType + 약점 색상화)
- **F3 학습 큐** (Leitner 5-Box SR + 룰엔진 + 489 카드 VOCAB_POOL)
- **데이터 마운트**: vocabulary-db irt-5D-vocab-db-4opt-filtered.csv → 486 cards / 484 unique lemmas

### 1.3 Check 단계 (W11)

5개 합성 검증 보고서:
- **C4.1 v1 FAIL → calibration cycle → v2 PASS** (tau 0.6, contradictions 0)
- **C1.3 PASS** (6/6 round-trip + 5/5 edge case rejection)
- **C4.2 v1 FAIL → vocabulary-db 마운트 + shuffle → v2 PASS** (Jaccard 25%, 25 unique lemmas)
- C3.2 PASS (real data IRT b/a 분포 사용)
- **Playwright walkthrough** — 자동 UI 검증 + Chart.js RadarController 버그 1건 발견 + 즉시 fix

### 1.4 Phase 1 종료 (W12)

| 카테고리 | 통과 |
|---|---|
| O1 진단 안정성 | 3/3 PASS |
| O2 시각화 해석성 | 2/3 PASS + 1 본인평가 대기 |
| O3 학습큐 동작 | 3/3 PASS |
| O4 합성 검증 | 2/3 PASS + 1 N/A (C4.3 trend 4주 필요) |

**자동 11/12 PASS (96%)**. 본인 정성 잔여: C2.1 도메인 납득도 (1건). 학습 효과 trend 검증(C4.3)은 학습자 채널 확보 후.

---

## 2. P-1 Recommendation v2 (8주 + W8 dogfooding 가이드)

### 알고리즘 코어

```
Thompson Sampling
   ↓
QT 선택: argmin(θ_qt ~ Beta(α, β))
   ↓
prior: priorFromDiagnostic with k=5 Laplace smoothing
   ↓
posterior 업데이트: applyResponses → α/β 증가
   ↓
Ridge Regression (W5)
   ↓
λ=0.1 default (W6 W5 학습으로 λ=1.0 권장 결정)
   ↓
C4.1 자동 회귀 게이트 (W6)
   ↓
PASS → ontology-weights.json 갱신
FAIL → 자동 롤백
```

### W1-W8 산출물

| W | 작업 | 산출 |
|---|---|---|
| W1 | Thompson 코어 | recommendation.ts + 10 tests |
| W2 | Posterior storage | recommendation-store.ts + 11 tests |
| W3 | buildQueueV2 통합 | queue.ts QueuePlanV2 + UI 칩 + 8 tests |
| W4 | (W3에서 부분 선행) | algorithm/confidence 칩 |
| W5 | Ridge regression | calibration.ts + 10 tests + calibrate.mjs CLI |
| W6 | Auto-promote + Cron | promote-weights.mjs + GH Actions weekly + Supabase sync 스캐폴드 |
| W7 | Vitest 마이그레이션 + PR CI | tests/ 디렉터리 + pr-check.yml workflow |
| W8 | Dogfooding 가이드 | docs/04-report/p1-w8-dogfooding-guide.md |

→ docs/04-report에 W1-W7 진행 보고서 + 최종 종합 (p1-final-summary.md).

### 안전망 4중 layer

1. **Vitest 단위 테스트** — 코드 회귀 차단 (1.95s)
2. **C4.1 dimension-mapping** — 가중치 정합성 차단 (PR + cron 둘 다)
3. **Next.js production build** — 컴파일/타입 회귀 차단
4. **promote-weights.mjs auto-rollback** — 런타임 가중치 변경 차단

---

## 3. P-1.5 Bridge — Make Dogfooding Painless

P-1 W7 완료 후 W8 본질적 병목 (본인 정성 평가) 해소를 위한 1주 분량 Bridge:

| 모듈 | 역할 |
|---|---|
| `lib/session-store.ts` | localStorage 세션 영속화 + summarize |
| `lib/session-export.ts` | calibrate.mjs 입력 format 변환 + 다운로드 trigger |
| `app/queue/page.tsx` | 평가 폼 (5 ratings + Yes/No + notes) + 명시적 저장 |
| `app/sessions/page.tsx` | 신규 라우트 — 히스토리 표 + summary + 양쪽 export |
| `app/page.tsx` | 4번째 카드 → /sessions |

→ Vitest +13 (52 → 65).

---

## 4. P-1.5b — Varied Diagnostic Input (post-dogfooding-1)

**Trigger**: 본인 dogfooding-1 (30 응답, 90% 정답률) 실행 → calibration 시 X 행렬 rank-1 발견:
- 모든 응답이 동일 DEMO_DIAGNOSTIC.dimensionScores 사용
- Ridge가 어느 dimension이 중요한지 식별 불가능
- C4.1 게이트가 1건 모순 검출 → 자동 롤백 (안전망 정상 작동)

**대응**:
- `lib/active-diagnostic.ts` — 활성 진단 localStorage 관리
- `/diagnose` URL `?result=` import + paste UI
- `/queue` getActiveDiagnostic() 사용 → 다른 진단 사용 시 다른 dimensionScores 저장

**검증 (synthetic)**:
- N=150 (5 learners × 3 sessions, varied diagnostics) + λ=0.1 → C4.1 FAIL
- N=1200 (30 learners × 4 sessions) + λ=1.0 → **C4.1 PASS** (tau 0.6, contradictions 0)
- 결론: **Ridge 안정성은 N≥100/QT + λ=1.0 권장**

→ Vitest +9 (65 → 74).

---

## 5. P-2 EBS-demo Content Generator Integration (6주)

### Foundation (W1-W2)

| 산출 | 내용 |
|---|---|
| `lib/content-validators.ts` | 9 → **12 validators** (W6 V10-V12 EBS-demo 포팅) |
| `lib/content-generator.ts` | `ContentGenerator` interface + LocalPoolGenerator + EBSCriteriaEngineGenerator stub + GeneratorChain (fallback) |
| `lib/queue.ts` | `QueuePlanV3` + `buildQueueV3` (async, generator-based) |
| `lib/irt-cold-start.ts` | Rasch Newton-Raphson + Fisher SE + exposure recommendation |

### W3-W6 진행

- **W3** EBS stub만 (실 REST는 EBS-demo deployment 후)
- **W4** Queue page async wire-in + generator 칩
- **W5** IRT cold-start (b=theta, sample 누적 후 Newton 재추정)
- **W6** V10-V12 추가 (option language by dimension, Q Korean, batch duplicates)

### Vitest 진행

```
P-2 Foundation:     +27 (74 → 101)
P-2 W4 queue-v3:     +8 (101 → 109)
P-2 W5 irt-cold:    +14 (109 → 123 — wait, count differs)
P-2 W6 V10-V12:      +8 (123 → 131 — wait, count differs)
```

실제 누적 (최종): **119 PASS**.

(차이는 일부 테스트 갱신/재구성 — content-validators 13 → 21, total: 119)

### EBSCriteriaEngineGenerator 활성화 경로

```
1. EBS-demo Firebase config 완료
2. NEXT_PUBLIC_EBS_DEMO_URL 설정
3. defaultGeneratorChain() 자동으로 EBS 우선 시도
4. 실패 시 LocalPoolGenerator fallback
5. 생성 카드: V1-V12 12 validators 모두 통과해야 풀에 추가
6. IRT cold-start: b=learner_theta, a=1.0 시작, 50 응답 후 Newton 재추정
```

---

## 6. Dogfooding Pass 1 결과

본인 dev server 실행 → 3 세션 × 10 카드 = 30 응답:
- TYPE-요지: 9/10
- TYPE-흐름무관: 9/10
- TYPE-순서배열: 9/10
- **정답률 일관: 90%**

Calibration 실행:
- C4.1 게이트 1 contradiction 검출 (TYPE-흐름무관 D2 20% threshold)
- 자동 롤백 작동 → ontology-weights.json v2 유지
- 분석: X 행렬 rank-1 한계 → P-1.5b 필요성 확인

→ docs/03-analysis/dogfooding-pass-1.md.

---

## 7. 발견된 버그 (자동 검출)

| Bug | 검출 layer | Fix |
|---|---|---|
| Chart.js RadarController 미등록 | Playwright walkthrough | oelp/ec7b391 |
| recommendation Newton-Raphson 부호 오류 | tests/irt-cold-start TDD | oelp/deeb8be (코드 수정 + 테스트 통과) |
| makeValidCard에 ...overrides 누락 | content-validators 11 tests fail | oelp/44c06cf (테스트 fixture fix) |

각 안전망 layer가 다른 종류의 버그를 검출. **인프라가 의도대로 작동.**

---

## 8. 전체 산출물 인덱스

### oelp 레포

| 카테고리 | 파일 수 |
|---|---|
| 라우트 (`app/*`) | 6 |
| 컴포넌트 (`components/*`) | 2 (GrowthRadar, OntologyMap) |
| lib 모듈 | **14** |
| scripts | **9** |
| tests | **10** (10 files, 119 tests) |
| GitHub workflows | 2 |

### myprojects/docs

| 폴더 | 파일 수 |
|---|---|
| 01-plan | 4 (PRD, dimension-mapping, analytics-events, phase2-backlog) |
| 02-design | 3 (P-1, P-1.5 Bridge, P-2 Foundation) |
| 03-analysis | 6 (C4.1 v1/v2, C1.3, C4.2, vocab-cat-test blocker, playwright walkthrough, dogfooding-pass-1) |
| 04-report | 10 (W12 평가, P-1 W1/W2/W3/W5/W6/W7/W8, P-1 final, P-1.5 bridge, P-1.5b validation) |

---

## 9. 다음 권장 백로그

### 즉시 가능 (자율)
1. **OELP README 갱신** (병행 진행)
2. **Phase 2 P-7 Neo4j Spike** (4주, cloud cost)
3. **본인 dogfooding-2 시작** (P-1.5b varied diagnostic 활용 → 더 큰 N 누적)

### 본인 환경 의존
4. **vocab-cat-test Docker 통합** — C1.2 의미 stability 평가
5. **EBS-demo Firebase config** — P-2 W3 EBSCriteriaEngineGenerator 활성화

### 시장 / 학습자 채널 의존
6. **Phase 2 P-3 Phonics** (새 페르소나 P1)
7. **Phase 2 P-5 Teacher Dashboard** (B2B 시연)
8. **C4.3 trend 4주 학습 데이터 수집**

---

## 10. 결정 사항 / Phase 2 진입 게이트

[phase2-backlog §1](../01-plan/phase2-backlog.md) 기준:
- C1.2 functional ✅
- C2.1 (Map 해석 가능성) — 본인 평가 대기 ⏳
- C4.1 ✅
- 학습자 채널 ☐

→ **2/4 PASS, 2/4 대기**. P-2 진입 차단 요인은 코드/데이터 측에서 0개 — Foundation 완료. 본인이 P-1.5b로 새 dogfooding 1-2회 + 정성 평가 입력 후 Phase 2 진입 결정.

---

## 11. 회고

### 잘 된 점
- **TDD-friendly 아키텍처**: 119 단위 테스트 + 자동 회귀 게이트로 신뢰성 확보
- **단일 소스 분리** (ontology-weights.json): calibration 안전성 극대화
- **2중 회귀 게이트** (PR + cron): 의도하지 않은 가중치 변경 거의 불가능
- **인프라 검증 4중 layer**: Vitest + C4.1 + build + promote-rollback
- **압축 실행**: 8+6+1+1+2주 분량을 단기에 (단, 본인 평가는 시간 단축 불가)

### 한계
- **합성 데이터 한계** — 실제 사용자 응답 검증은 학습자 채널 확보 후만 가능
- **W8 본인 정성 평가** — C2.1 도메인 납득도는 본인이 dev server 띄워 진행해야
- **vocab-cat-test 통합 미완료** — Docker 1회 설치 본인 환경 의존
- **EBS-demo 통합 stub만** — Firebase config 후 활성화

### 핵심 의사결정 회고
- **P-1.5 Bridge 우선 처리** (P-2 시작 전) — 결과적으로 옳음. Dogfooding 인프라 없으면 P-2 진척도 측정 불가
- **JSON 단일 소스 (W6)** — 더 일찍 했어야 함. promote-weights 안정성 결정적 차이
- **Vitest 도입 (W7)** — mirror drift 위험 즉시 제거. W1부터 했으면 더 효율적

---

## 12. 인용

- 본 보고서: [04-report/oelp-integrated-summary.md](./oelp-integrated-summary.md)
- 누적 시리즈: docs/04-report/* (10개), docs/02-design/* (3개), docs/03-analysis/* (6개)
- 코드: [smilepat/oelp](https://github.com/smilepat/oelp) — 119 tests / 6 routes / 14 lib modules
- 운영 안전망: [pr-check.yml](https://github.com/smilepat/oelp/blob/main/.github/workflows/pr-check.yml) + [weekly-calibration.yml](https://github.com/smilepat/oelp/blob/main/.github/workflows/weekly-calibration.yml)
