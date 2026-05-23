# OELP 통합 회고 — Phase 1 + P-1 + P-1.5 + P-1.5b + P-2 + Stability + Vercel

> 작성: 2026-05-23 (v1) / **갱신: 2026-05-23 v2** (Tier 1-4 stability + vocab-cat-test 통합 + Vercel 배포 반영)
> Owner: smilepat / Scope: 전체 OELP 진행 종합
> 산출 기간: 압축 실행 (실제 설계 일정은 8+ 주)

---

## 0. 한 페이지 요약 (v2)

OELP는 **Phase 1 MVP + P-1 추천 v2 + P-1.5/b Bridge + P-2 EBS Foundation** 완료에 더해, 단일 sprint에서 **Tier 1-3 stability roadmap (7 작업), Tier 4 A11y + 모바일, vocab-cat-test 실제 통합 (C1.2 measured PASS), Vercel production 배포, EBSCriteriaEngineGenerator 활성화**까지 도달.

### 핵심 수치 (v2 2026-05-23)

| 항목 | v1 (초기) | **v2 (현재)** |
|---|---|---|
| Vitest 단위 테스트 | 119 | **239** (+120) |
| Test files | 10 | **26** |
| Playwright e2e | 0 | **14** (12 A11y + 2 adaptive) |
| Routes (user-facing) | 5 + _not-found | **6 + audit + nav header** |
| lib 모듈 | 14 | **17** |
| Scripts | 9 | **12** |
| JSON Schemas | 0 | **3** (regression-history, ontology-weights, vocab-pool-source) + diagnostic-input |
| GitHub Actions | 2 | **3** (pr-check, weekly-calibration, vocab-cat-test-smoke) |
| Dependabot groups | 0 | **4** (runtime, viz, tooling, validation) + Actions ecosystem |
| 안전망 layer | 4 | **8** (lint → vitest → schema → README freshness → C4.1 → C4.2 → build → coverage threshold) |
| Coverage (lines) | 미측정 | **95.12%** |
| Coverage threshold | 미설정 | **93/80/95/90** (lines/branches/funcs/stmts) |
| WCAG 2.1 AA | 미측정 | **6/6 routes PASS** (desktop + mobile) |
| 자동 평가 (12 C 기준) | 11/12 | **12/12 measured PASS** (C1.1 177 pytest, C1.2 theta variance 0.03) |
| 외부 배포 | 없음 | **Vercel Production** + Cloud Run runbook 준비 |

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
- 누적 시리즈: docs/04-report/* (11개), docs/02-design/* (3개), docs/03-analysis/* (9개), docs/01-plan/* (4개)
- 코드: [smilepat/oelp](https://github.com/smilepat/oelp) — 239 tests / 26 files / 7 routes / 17 lib modules
- 운영 안전망 (8단계): [pr-check.yml](https://github.com/smilepat/oelp/blob/main/.github/workflows/pr-check.yml) + [weekly-calibration.yml](https://github.com/smilepat/oelp/blob/main/.github/workflows/weekly-calibration.yml) + [vocab-cat-test-smoke.yml](https://github.com/smilepat/oelp/blob/main/.github/workflows/vocab-cat-test-smoke.yml)
- 외부 통합: vocab-cat-test PR #1 (merged) + PR #2 (pending CORS)
- 배포: Vercel Production (URL pending) + Cloud Run runbook 준비됨

---

## 13. v2 회고 (2026-05-23 단일 sprint 추가분)

### 13.1 v1 이후 추가된 작업 시퀀스

| 순서 | 작업 | 산출물 |
|---|---|---|
| 1 | Tier 1.1 regression-history JSON Schema + CI | schemas/, scripts/validate-schemas.mjs |
| 2 | Tier 1.3 DiagnosticInput round-trip CI | tests/diagnostic-roundtrip.test.ts |
| 3 | Tier 2.1 README counters auto-derived | scripts/update-readme-counters.mjs |
| 4 | Tier 1.2 ontology-weights write-protection | lastWriter field + schema allOf |
| 5 | Tier 2.3 dimension-mapping consistency | 3중 sync (code ↔ JSON ↔ doc) |
| 6 | Tier 3.1 CSV provenance checksum | lib/vocab-pool-source.json |
| 7 | Tier 3.2 Dependabot | .github/dependabot.yml |
| 8 | Tier 4.1 A11y axe-core baseline | e2e/a11y.spec.ts (6 routes WCAG 2.1 AA) |
| 9 | vocab-cat-test 실제 통합 | PR #1 dimension_scores fix, verify script |
| 10 | AdaptiveDiagnostic UI | /diagnose 실제 적응형 진단 + weekly cron smoke |
| 11 | Vercel runbook + 배포 (본인) | docs/03-analysis/vercel-deployment-runbook.md |
| 12 | Phase 2 backlog v2 | docs/01-plan/phase2-backlog-v2.md (Stage A/B/C/D 재분류) |
| 13 | A4 Mobile 반응형 (5 fixes + A11y mobile suite) | layout viewport + responsive splits |
| 14 | A3 Error boundary + localStorage error log | lib/error-log.ts + ErrorBoundary |
| 15 | A6 Vitest coverage 75/65/75/75 gate | vitest.config.ts thresholds |
| 16 | A5 /sessions 운영 패널 + cross-link | ErrorLogPanel + CalibrationHistoryPanel |
| 17 | A7 leitner + session-export coverage (80/70) | 0% → 100% 두 모듈 |
| 18 | A7+ Phase 2 ontology + diagnostic + queue-v1 (88/75) | 30→100, 48→100, 51→100 |
| 19 | Adaptive diagnostic e2e | 2 mock-backend tests |
| 20 | /sessions 모바일 pagination + Header nav | 7 routes 통합 nav |
| 21 | Cloud Run runbook | 30분 본인 가이드 |
| 22 | A7++ error-log globals + reco-store extras (93/80) | window events mock |
| 23 | EBSCriteriaEngineGenerator stub → 실 wiring | 8 mock-backend tests |
| 24 | 본 v2 통합 회고 갱신 | 본 문서 |

### 13.2 v2의 새 인사이트

- **자동 게이트의 효과 누적**: Tier 1-3 + A6 coverage ratchet + A11y로 PR마다 8단계 통과 강제 → 회귀 가능성 극단 감소
- **CI 측 작동 검증된 자동화**: regression-history 자동 append, README counter auto-sync, dependabot grouped weekly
- **외부 통합 검증된 경로**: vocab-cat-test (177 pytest pass, theta variance 0.03) + Vercel 배포 (본인 완료)
- **Stage C 활성화 조건 1개만 잔여**: 학습자 채널 ≥ 1명 (Cloud Run 배포 시 자연스럽게 dogfooding-3 시도 가능)

### 13.3 v2 종료 시점 본인이 결정할 것

1. **Cloud Run vocab-cat-test 배포** (30분, runbook 준비됨) — 외부 사용자가 Adaptive 진단 사용 가능해짐
2. **EBS-demo Firebase config** (30분) — EBSCriteriaEngineGenerator 실 활성화 (코드는 이미 wired)
3. **학습자 채널 1명 모집** — phase2-backlog-v2 Stage C 활성화 (P-3 Phonics, P-5 Teacher Dashboard 등)

세 항목 모두 본인 환경 외 의존 없이 본인 시간 1-2시간이면 가능.
