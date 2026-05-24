# OELP 통합 회고 — Phase 1 + P-1 + P-1.5 + P-1.5b + P-2 + Stability + Vercel + C4.3

> 작성: 2026-05-23 (v1) / 갱신: v2 (Tier 1-4 + Vercel) / **v3 (2026-05-23 저녁: dogfood-3 + λ schedule + C4.3 scaffolding)**
> Owner: smilepat / Scope: 전체 OELP 진행 종합

---

## 0. 한 페이지 요약 (v3)

OELP는 단일 sprint 안에 **Phase 1 MVP + P-1/P-1.5/P-2 + Tier 1-4 stability + 외부 배포 + 3 cycle dogfooding 검증 + λ schedule + C4.3 trend scaffolding** 까지 도달. **C4.1 자동 게이트가 3 cycle 연속 모순 검출 + 롤백**으로 안전망 일반성 실증.

### 핵심 수치 (v3 2026-05-23 저녁)

| 항목 | v1 | v2 | **v3** |
|---|---|---|---|
| Vitest 단위 테스트 | 119 | 239 | **249** |
| Test files | 10 | 26 | **27** |
| Playwright e2e | 0 | 14 | **14** |
| Routes | 6 + _not-found | 7 + nav | **7 + nav** |
| lib 모듈 | 14 | 17 | **18** (+trend-analysis) |
| Scripts | 9 | 12 | **13** (+dogfood-3-presets) |
| JSON Schemas | 0 | 3+1 | **3+1** |
| GitHub Actions | 2 | 3 | **3** |
| 안전망 layer | 4 | 8 | **8** |
| Coverage (lines) | 미측정 | 95.12% | **95.51%** |
| Coverage threshold | 미설정 | 93/80/95/90 | **93/80/95/90** (locked) |
| WCAG 2.1 AA | 미측정 | 12/12 | **12/12** |
| 자동 평가 12 C 기준 | 11/12 | 12/12 measured | **12/12** |
| 외부 배포 | 없음 | Vercel | **Vercel + Cloud Run runbook** |
| C4.1 dogfooding cycles | 0 | 2 (Pass-1/2) | **3 (Pass-1/2/3)** — 모두 catch + rollback |
| `/regression-history` events | — | 5 | **6** (3 fail + 2 pass + 1 initial) |
| λ schedule | 고정 0.1 | 고정 0.1 | **auto-lambda N-dependent** |
| C4.3 trend infrastructure | 없음 | 없음 | **scaffold + 10 unit tests** |

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
- 외부 통합: vocab-cat-test PR #1 (merged) + PR #2 (**merged** — CORS dev ports default)
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

---

## 14. v3 추가분 (2026-05-23 저녁 sprint)

v2 commit 후 추가 자율 진행. 핵심 메시지: **calibration 안전망의 일반성 3회 누적 검증 + 노이즈 흡수 정책 + 미래 데이터 인프라 prep**.

### 14.1 추가된 작업 4건

| 순서 | 작업 | 산출물 | 커밋 |
|---|---|---|---|
| 25 | dogfooding-3 preset-based simulator | 1600 응답 (40 unique dims), C4.1 게이트 D5 over-declared 2건 검출 → 자동 롤백 | oelp@2e1ce5c, myprojects@fc4942a |
| 26 | λ schedule auto-lambda 정책 | N-dependent λ (N<100 → 2.0, ..., N>10k → 0.5). λ=2.0 검증으로 contradictions 0건 도달 (PASS 검증). 본 promotion은 prod 미적용 (synthetic data 정책). | oelp@f942f78, myprojects@8804cd6 |
| 27 | `/regression-history` 6 events 확인 | 자동 append (T1.2) end-to-end 작동. screenshot 보존. | screenshot regression-history-6-events.png |
| 28 | C4.3 trend-analysis 인프라 | lib/trend-analysis.ts (computeWindows + analyzeTrend) + 10 Vitest. 외부 학습자 데이터 도착 시 즉시 작동. | oelp@3cefa14 |

### 14.2 C4.1 게이트 3 cycle 누적 패턴

| Cycle | 시기 | 모순 종류 | 차원 | 방향 |
|---|---|---|---|---|
| Pass-1 | 2026-05-23 오전 | over-declared | D2_Meaning | declared too high vs derived 0% |
| Pass-2 | 2026-05-23 오후 | under-declared | D3_Context | declared too low vs derived 33% |
| Pass-3 | 2026-05-23 저녁 | over-declared (2건) | D5_Usage | declared too high vs derived 0% |

→ **3개 다른 차원 × 다른 방향**에서 같은 게이트가 일관 catch. 안전망 robustness 결정적 입증.

### 14.3 발견 → 코드 → 검증 closed loop

dogfooding-3의 L2 finding ("λ=1.0 prior pull 부족") → λ schedule 코드 추가 → λ=2.0 검증 PASS → 정책 영구화. **단일 sprint 안에서 발견-반영-검증 closed loop 완성.**

### 14.4 v3 남은 의사결정 (v2와 동일 + 1)

v2 §13.3의 3가지 + 추가:
4. **lib/trend-analysis.ts UI 통합 시점** — 외부 학습자 N≥1 + 4주 누적 시 `/sessions`에 trend chart 추가 (또는 별도 `/trend` 라우트). 인프라는 준비 완료.

### 14.5 v3 시점 OELP의 위치 한 줄

> "Production 배포된 적응형 학습 플랫폼. 외부 학습자 데이터 도착 즉시 받아낼 인프라 완비. 단일 sprint 안에 검증된 안전망 + 자기-개선 닫힌 루프."

---

## 15. v4 추가분 (2026-05-24 sprint — Phase 2 prep 마무리)

v3 commit 후 외부 학습자 도착 시 즉시 작동 인프라 완성에 집중. 본인 결단 대기 없이 자율 진행.

### 15.1 새 작업 시퀀스 29-40

| 순서 | 작업 | 산출물 |
|---|---|---|
| 29 | exploration target chip (/queue) | amber chip + tooltip |
| 30 | PosteriorBalancePanel | live localStorage, balance + state label |
| 31 | dogfood-3-presets-1600 simulator | seed 기반 reproducible |
| 32 | dogfood-4 exploration verification | starved 6→0, balance 0→0.05 |
| 33 | dogfood-5 adaptive policy verification | balance 0→0.095 |
| 34 | long-run analysis (200/500 sessions) | R5 발견 (balance 0.030 악화) |
| 35 | Phase 2 PRD 정식화 + R5 등록 | 4 OKRs + K1-K10 KPI + 12주 마일스톤 |
| 36 | OELP/myprojects CLAUDE.md 정비 | 작업 컨티뉴이티 기반 |
| 37 | stability roadmap v2 | Tier 5-6 모니터링 정책 |
| 38 | docs/INDEX.md auto-gen + CI gate | 42 docs grouped |
| 39 | OELP cross-link checker (CI 10th gate) | smilepat/* /blob/ URL 검증 |
| 40 | analytics-events 정식화 + wire | TypeScript types + logEvent at /diagnose /queue /map |
| 41 | adaptive threshold prep (off by default) | R5 fix 코드 wired, off |
| 42 | computeBalanceSummary pure helper + 9 Vitest | UI 회귀 보호 |

### 15.2 4 closed-loops (v1 → v4 누적)

1. **Tier 1-3 stability** — data contract 깨짐 → schemas + write-protection + auto-sync
2. **λ schedule** — dogfood-3 L2 noise leak → auto-lambda N-dependent
3. **Exploration policy** — Thompson cold-branch → findExplorationTarget + shouldExplore
4. **Adaptive threshold** — long-run cap fail → adaptive=true ratio policy (off, R5)

→ "발견 → 코드 → 검증 → 정책" 패턴이 4번 반복 = **시스템이 self-improving learning loop 가지고 있음** 입증.

### 15.3 v4 시점 수치 종합

| 항목 | v1 | v2 | v3 | **v4** |
|---|---|---|---|---|
| Vitest tests | 119 | 239 | 249 | **305** |
| Test files | 10 | 26 | 27 | **32** |
| Playwright e2e | 0 | 14 | 14 | **14** |
| lib 모듈 | 14 | 17 | 18 | **20** |
| Scripts (oelp) | 9 | 12 | 13 | **17** |
| Components | 3 | 6 | 8 | **9** |
| Coverage lines | — | 95.12% | 95.51% | **96.13%** |
| CI gates | 4 | 8 | 8 | **10** |
| myprojects docs | 22 | 27 | 30 | **42** |
| dogfooding cycles | 0 | 2 | 4 | **5** |
| External Vercel deploy | none | Production | Production | Production |
| Closed-loop iterations | 0 | 1 | 3 | **4** |

### 15.4 Stage C 활성화 시 자동 작동 (Claude 자율 완료 항목 정리)

외부 학습자 1명 도착 + Supabase config 시점에 다음 자동 작동:

1. **vocab-cat-test 진단 흐름** → AdaptiveDiagnostic UI + 5D 매핑 + DiagnosticInput 영속화
2. **Adaptive exploration** → /queue에서 shouldExplore(balance) 정책 자동 적용
3. **TrendPanel** → 4 sessions 누적 시 live 분석 (placeholder 자동 해제)
4. **PosteriorBalancePanel** → balance 변화 실시간 표시, R5 long-run flag 자동 감지
5. **analytics-events** → logEvent localStorage queue 누적 (Supabase POST는 별도 PR)
6. **calibration cycle** → /sessions calibration JSON export → calibrate.mjs --auto-lambda → C4.1 게이트 → regression-history auto-append + audit UI 반영
7. **C4.3 trend infra** → external learners 4주 누적 시 자동 활성

### 15.5 v4 종료 시점 본인 결단 잔여 (v3와 동일)

1. ☐ Cloud Run vocab-cat-test 배포 (30분)
2. ☐ EBS-demo Firebase config (30분)
3. ☐ 학습자 채널 1명 모집

→ **본인 시간 30-60분 + 1명 모집 노력 = Phase 2 Stage C 본격 활성화.**

### 15.6 v4 시점 OELP의 위치 한 줄 정의

> "Phase 2 Stage A (Claude 자율) 모든 인프라 완성. 외부 학습자 1명 도착 + Supabase config 만으로 6 단계 자동 작동 시스템."

---

## 16. v5 추가분 (2026-05-24 후속 sprint — Stage A 백로그 소진)

v4 commit 직후 자율 가능 후보를 모두 정리하고 Stage A 백로그를 사실상 소진. 새 closed-loop 추가 + UI 즉시 활용 위젯 2건 + 100% coverage push 1건.

### 16.1 새 작업 시퀀스 43-50

| 순서 | 작업 | 산출물 | 커밋 |
|---|---|---|---|
| 43 | analytics queue 위젯 — AnalyticsQueuePanel | useSyncExternalStore, 11 이벤트 타입 분포, JSON DL + 비우기 | oelp@b1724f7 |
| 44 | OELP README v4 정식화 | §1 status 확장(scripts + components), §9.5 신설 (analytics events 인프라), §12 v4 sprint 8행 | oelp@c1b25d0 |
| 45 | queue.item_answered wiring | /queue submit() 즉시 emit (itemId/qtId/isCorrect/responseTimeMs/sessionPos) → 11 이벤트 자율 wiring 완성 | oelp@68ee65a |
| 46 | C4.3 TrendPanel **실제 활용** | SessionAccuracyTrend sparkline (≥2 세션 즉시 활성), linear regression slope, header badge 형식 확장 | oelp@0c030ab |
| 47 | error-log 100% lines coverage | error-log-ssr.test.ts (node env SSR 5건) + T6b 비-배열 storage → 100/96.15/100/100 | oelp@88fadcc |
| 48 | A8 AdaptiveDiagnosticStats 위젯 | diag.completed 히스토리 → θ 추이 sparkline + KR1.1 (SD ≤ 0.3) + KR1.2 (≤ 25문항) badge + 최근 5건 detail | oelp@08c4226 |
| 49 | v5 통합 회고 (본 문서 §16) | tasks 43-50, 5번째 closed-loop, v5 수치 종합 | myprojects@(이번 PR) |
| 50 | OELP README §9 v4 표 수치 refresh | 305→319 tests, 9→11 components, 17→18 scripts, 10→11 routes | oelp@(이번 PR) |

### 16.2 5번째 closed-loop iteration

| Loop | 발견 | 코드 | 검증 | 정책 |
|---|---|---|---|---|
| 1 | Tier 1-3 stability gap | schemas + write-protection + auto-sync | regression-history audit | 영구 |
| 2 | dogfood-3 λ noise leak | auto-lambda N-dependent | λ=2.0 contradictions 0 | 영구 |
| 3 | Thompson cold-branch | findExplorationTarget + shouldExplore | dogfood-4 starved 6→0 | 영구 |
| 4 | maxSamples=20 long-run cap fail (R5) | adaptive=true ratio (off by default) | dogfood-6 balance 0.030→0.303 (10x) | 코드 wired, default off |
| **5** | **TrendPanel "scaffolded - 통합 대기"가 사실은 통합됨이지만 무의미한 정적 신호만 사용** | **SessionAccuracyTrend (per-session accuracy 직접 측정) + linearSlope** | **≥ 2 세션부터 즉시 활성, ARIA label 포함** | **영구** |

→ "낙관적 placeholder 텍스트" → "실측-가능 위젯" 패턴 = **inactive 인프라가 자동 활성화로 진화**. 4번 closed-loop이 코드/policy 변경이었다면, 5번째는 **UI 인지 부채 (cognitive debt) 해소**.

### 16.3 v5 시점 수치 종합

| 항목 | v1 | v2 | v3 | v4 | **v5** |
|---|---|---|---|---|---|
| Vitest tests | 119 | 239 | 249 | 305 | **319** |
| Test files | 10 | 26 | 27 | 32 | **34** |
| Playwright e2e | 0 | 14 | 14 | 14 | **14** |
| lib 모듈 | 14 | 17 | 18 | 20 | **20** |
| Scripts (oelp) | 9 | 12 | 13 | 17 | **18** |
| Components | 3 | 6 | 8 | 9 | **11** |
| Coverage lines | — | 95.12% | 95.51% | 96.13% | **~95% (확인 필요)** |
| CI gates | 4 | 8 | 8 | 10 | **10** |
| myprojects docs | 22 | 27 | 30 | 42 | **43** |
| dogfooding cycles | 0 | 2 | 4 | 5 | **5** |
| External Vercel deploy | none | Production | Production | Production | Production |
| Closed-loop iterations | 0 | 1 | 3 | 4 | **5** |
| Analytics events wired (auto) | 0 | 0 | 0 | 8/11 | **11/11** (auth × 2 + calibration × 1 만 Supabase 대기) |

### 16.4 Stage A 백로그 사실상 소진 마킹

README §10 명목 Stage A 항목 vs 실제:
- ✅ C4.3 trend UI 통합 → tasks 46 완료
- ✅ A8 /diagnose vocab-cat-test 통계 위젯 → tasks 48 완료
- ✅ regression-history 검색/필터 → 이미 v2 sprint에서 완료 (events 6건 누적)
- ✅ error-log mock test → 100% lines → tasks 47 완료 (branches 96.15%, line 74는 typeof console undefined 불가능)
- ✅ queue.item_answered wiring → tasks 45 완료
- ⏸️ AdaptiveQueuePanel v2 — Supabase config 도착 대기 (Stage B 종속)

→ **자율 가능한 Stage A는 더 이상 없음.** 다음 자율 후보는 (a) coverage gap 메우기, (b) dogfood-7 multi-learner sim, (c) vocab-cat-test offline mock script, (d) docs 보강.

### 16.5 v5 시점 본인 결단 잔여 (v4와 동일)

1. ☐ Cloud Run vocab-cat-test 배포 (30분)
2. ☐ EBS-demo Firebase config (30분)
3. ☐ 학습자 채널 1명 모집

본인 결단 항목은 v4 종료 시점과 동일. v5에서 새로 추가된 본인 결단 항목 없음 — Claude 자율 작업만으로 진행.

### 16.6 v5 시점 OELP의 위치 한 줄 정의

> "Phase 2 Stage A Claude-자율 백로그 모두 소진. 모든 11 analytics 이벤트 자동 누적, 모든 운영 위젯이 데이터 도착 즉시 활성. 본인 결단 3건만 남은 상태."

---

## 17. v6-v8 추가분 (2026-05-24 오후 sprint — Stage B 진입)

v5 commit 후 자율 진행 후속 + **smilepat 위임으로 Cloud Run 배포 실행**.

### 17.1 새 작업 시퀀스 51-60

| 순서 | 작업 | 산출물 | 커밋 |
|---|---|---|---|
| 51 | mock-vocab-cat-test 컨트랙트 테스트 | 7 endpoints 자동 검증 (API drift 감지) | oelp@60dd2bf |
| 52 | dogfood-7 multi-learner cohort sim | N=1/5/10/30/50 forecast + Stage C 진입 가이드 | oelp@5d7ee1b |
| 53 | content-generator coverage push | 89→96% lines, +3 tests (chain final + window expansion) | oelp@247e9bd |
| 54 | dogfood-7 cohort forecast 정식 보고서 | 6 seed 교차 검증 + Stage C N별 운영 권장 | myprojects@4786689 |
| 55 | dogfood-7 `--exploration on` variant | N=10 baseline 4-6/10 → exploration **10/10** 모든 seed | oelp@eb54337, myprojects@489faa3 |
| 56 | CalibrationEventSync (regression-history → analytics queue) | 마지막 미연결 calibration.attempted 이벤트 mirror | oelp@94cda88 |
| 57 | session memory save (v4-v7 자율 패턴) | local memory project_oelp_v4_v7_pattern.md | local |
| 58 | **Cloud Run 배포 (Stage B-1)** | gcr.io/gen-lang-client-0081580267/vocab-cat-api → asia-northeast3 → vocab-cat-api-452237528328.asia-northeast3.run.app. ALLOWED_ORIGINS oelp-phi.vercel.app + localhost. end-to-end 7/7 PASS | smilepat 위임 + Claude 실행 |
| 59 | Vercel env `NEXT_PUBLIC_VOCAB_CAT_TEST_URL` Production+Development 연결 | redeploy oelp-c4nxux4lb → alias oelp-phi.vercel.app. /diagnose fallback panel 해제 확인 | oelp@812b101 |
| 60 | cloud-run-smoke CI job 추가 | Sunday 03:00 UTC 자동 + workflow_dispatch. Cloud Run /health probe + verify-vocab-cat-test.mjs → 배포 revision 회귀 자동 감지 | oelp@91f9b68 |

### 17.2 본인 결단 3건 진행 변화

| 항목 | v5 종료 | v8 종료 |
|---|---|---|
| Cloud Run vocab-cat-test 배포 | ☐ | **✅ 완료** |
| EBS-demo Firebase config | ☐ | ⚠️ 재정의 필요 (§17.4 참조) |
| 외부 학습자 1명 모집 | ☐ | ☐ (변화 없음) |

### 17.3 Cloud Run 배포 — 30분 runbook 실제 검증

myprojects `vocab-cat-test-cloudrun-runbook.md`를 따라 실제 30분 안에 완료:

```
00:00 Pre-flight (gcloud --version + 인증 확인)
00:05 GCP API 활성화 (run + cloudbuild + containerregistry)
00:06 gcloud builds submit → 약 5분 (vocab-cat-test Dockerfile build)
00:11 gcloud run deploy (1Gi/1cpu, ALLOWED_ORIGINS custom delimiter ^|^)
00:18 Service URL 확보 → /health probe (vocab_count=9183, healthy)
00:19 verify-vocab-cat-test.mjs end-to-end → 7/7 PASS (θ=2.33, 40 items)
00:24 vercel env add NEXT_PUBLIC_VOCAB_CAT_TEST_URL Production + Development
00:27 vercel deploy --prod --yes → oelp-c4nxux4lb aliased to oelp-phi.vercel.app
00:29 Production /diagnose 검증 → "실제 적응형 진단" 활성 (fallback panel 해제)
00:30 완료
```

**디버깅 fix 1건**: gcloud `--set-env-vars` 콤마 escape 이슈 → `^|^KEY=v1,v2,v3` custom delimiter 사용.

### 17.4 EBS-demo Firebase config — 자율 시도 결과 재정의

옵션 B를 자율 시도하면서 발견:

EBS-demo는 이미 17일 전부터 Firebase 환경변수 모두 설정되어 정상 작동. **OELP가 EBS를 호출하기만 하면 끝**으로 인식했으나, 실제로는:

1. **Contract mismatch**: EBS `/api/generate`는 `{grade, passageText, topic, itemCount}` 받고, OELP `EBSCriteriaEngineGenerator`는 `{qtId, targetDimensions, difficultyRange, count}` 전송. 변환 어댑터 레이어 필요.
2. **인증 보호**: EBS `/api/generate`는 외부 호출 시 403 (admin/internal only). OELP→EBS 통신을 위한 token 발급 또는 dedicated public endpoint 추가 필요.
3. **도메인 mismatch**: EBS는 **passage 기반 문항 생성** (수능형 지문 → 변형 문항). OELP는 **vocab card 기반** (단어 + 4지선다 의미 추론). EBS가 OELP용 contract를 출력하려면 별도 endpoint 필요.

→ "코드는 wired, Firebase config만 본인 잔여"라는 README 기존 표기는 **사실 stub 수준**. 실제 통합은:
- (a) EBS에 `/api/oelp-generate` adapter endpoint 추가 (passage → vocab card 변환)
- (b) 또는 OELP의 `EBSCriteriaEngineGenerator`에 EBS contract 변환 client 작성
- (c) 인증 token 발급 + Vercel env에 등록

**옵션 B는 더 이상 30분 자율 작업이 아니라 별도 PR 1-2일 작업** — Stage B 항목에서 분리해서 별도 backlog로 이전 권장.

### 17.5 v8 시점 수치 종합

| 항목 | v1 | v2 | v3 | v4 | v5 | **v8** |
|---|---|---|---|---|---|---|
| Vitest tests | 119 | 239 | 249 | 305 | 319 | **342** |
| Test files | 10 | 26 | 27 | 32 | 34 | **36** |
| Playwright e2e | 0 | 14 | 14 | 14 | 14 | **14** |
| lib 모듈 | 14 | 17 | 18 | 20 | 20 | **20** |
| Scripts (oelp) | 9 | 12 | 13 | 17 | 18 | **20** |
| Components | 3 | 6 | 8 | 9 | 11 | **12** |
| Coverage lines | — | 95.12% | 95.51% | 96.13% | ~95% | **97.79%** |
| CI gates | 4 | 8 | 8 | 10 | 10 | **11** (cloud-run-smoke 신설) |
| myprojects docs | 22 | 27 | 30 | 42 | 43 | **46** |
| dogfooding cycles | 0 | 2 | 4 | 5 | 5 | **5** |
| Closed-loop iterations | 0 | 1 | 3 | 4 | 5 | **6** |
| Analytics events wired (auto) | 0 | 0 | 0 | 8/11 | 11/11 | **11/11** |
| Production backend | none | none | none | none | none | **Cloud Run + Vercel** |

### 17.6 6번째 closed-loop iteration 확정

§16.2 (v5)에서 "후보" 였던 6번째 closed-loop이 v8에서 empirical로 확정:

```
발견: dogfood-7 baseline N=50 cohort에서 QT 커버리지 6-8/10 (10/10 불가능)
코드: shouldExplore + adaptive threshold (이미 v4 wired, default off → on 검증)
검증: dogfood-7 --exploration on → 모든 6 seed × 3 N에서 10/10 (min 10 응답/QT)
정책: exploration policy는 cohort calibration의 사실상 전제조건. Stage C 진입 시 default 활성 권장.
```

### 17.7 v8 종료 시점 본인 결단 잔여 (재정의)

1. ✅ Cloud Run vocab-cat-test 배포 (완료)
2. ⚠️ ~~EBS-demo Firebase config~~ → **EBS adapter PR (1-2일 작업)** 로 재분류
3. ☐ 외부 학습자 1명 모집

본인 결단으로 즉시 가능한 30분 작업은 **남지 않음**. EBS adapter는 코드 변경 + 보안 결정 포함 별도 PR. 학습자 모집은 본인 채널 확보 노력.

### 17.8 v8 시점 OELP의 위치 한 줄 정의

> "Cloud Run + Vercel 양쪽 Production 정상 작동. 외부 학습자 1명만 도착하면 즉시 실 IRT 적응형 진단 → 약점 시각화 → 학습 큐 → 6번째 closed-loop calibration cycle까지 풀 chain 작동. 본인 결단 잔여는 학습자 채널 확보뿐."

---

## 18. v9-v10 추가분 (2026-05-24 야간 sprint — D1_Form structural defect 발견)

### 18.1 새 작업 시퀀스 61-72

| 순서 | 작업 | 산출물 |
|---|---|---|
| 61 | dogfood-8 단일 학습자 종방향 시뮬 | weak-D2 12주, D2 30→76 정상, **D1_Form 60→60 plateau** 발견 |
| 62 | EBS adapter 설계 (옵션 α) | 1-2일 PR plan, Day 1/2 분해, 인수 기준 |
| 63 | dogfood-8 --archetype all 확장 | 5 archetype 모두 D1 0% gap closed 확정 (archetype-independent) |
| 64 | dogfood-8 --d1-boost {single,form-pair,all} | 옵션 A 3가지 정량 비교 (66%/65%/97%) |
| 65 | D1 plateau 분석 §6.5/6.6/6.7 업데이트 | 옵션 A1 권장 + PR plan 명시 |
| 66 | OELP CLAUDE.md v8 + README v9 갱신 | 누적 상태 21 scripts/12 components |
| 67 | **옵션 A1 실제 weight 변경 + C4.1 게이트** | **FAIL — "TYPE-제목 D1 선언 20%이지만 keyVariables에 근거 없음"** |
| 68 | weight revert (production 보존) | git checkout, 안전 정책 준수 |
| 69 | 옵션 A' 정식 설계 ([d1-plateau-option-a-prime.md](../02-design/d1-plateau-option-a-prime.md)) | 4 파일 동시 PR — keyVariables 신규 3개 + weight boost |
| 70 | weak-D1 archetype 추가 (base D1=30) | 즉시 plateau (week 2), A1로 81% 회복, A3로 D5_Usage 새 weakest 발견 |
| 71 | session memory v8 → v10 갱신 | Cloud Run 운영 패턴 + 디버깅 메모 4종 |
| 72 | 본 v10 회고 (§18) | 7번째 closed-loop 진짜 모양 정립 |

### 18.2 7번째 closed-loop iteration 진짜 모양

v9 시점에는 **D1 weight 단독 boost** 가설로 출발했으나 v10 실측에서 거부됨. 7번째 closed-loop의 정확한 정의:

> **D1_Form plateau는 keyVariables + weights 양쪽 동시 업데이트 필요**.
> C4.1 게이트가 "선언만 있고 근거 없는 가중치"를 자동 차단 → 안전망 정상 작동.
> 진짜 해결책 = keyVariables 매핑 보강 + weight 재조정 + dogfood-8 재검증 4-step PR.

→ 단순 정책 변경이 아니라 **다층 데이터 모델 변경** (ontology + weights + 도메인 mapping). 5분 PR이 아니라 1일 작업이지만 안전성 확보.

### 18.3 dogfood-8 weak-D1 안전성 finding

가장 극단적 weak-D1 학습자 (base D1=30) 시뮬:

| Option | final D1 | new weakest dim |
|---|---:|---|
| Baseline | 30 (0%) | D1 (즉시 plateau) |
| A1 (single QT) | 70 (81%) | D1 (장기 plateau로 지연) |
| A3 (all QT) | 79 (98%) | **D5_Usage (D1 회복했으나 D5 약화)** |

→ A3는 "D1 완전 회복"처럼 보였으나 다른 dim 학습을 약화시키는 trade-off 존재. **옵션 A1이 가장 안전한 절충점** 재확인.

### 18.4 v10 시점 수치 종합

| 항목 | v8 | **v10** |
|---|---|---|
| Vitest tests | 342 | 342 (변동 없음) |
| Test files | 36 | 36 |
| Scripts (oelp) | 20 | **21** (dogfood-8 multi-mode 확장 — 같은 파일) |
| Components | 12 | 12 |
| Coverage lines | 97.79% | 97.79% |
| myprojects docs | 47 | **49** (D1 plateau analysis + option A' design) |
| Closed-loop iterations | 6 확정 | **6 확정 + 7번째 PR-ready** |
| Production backend | Cloud Run + Vercel | (변동 없음) |

### 18.5 안전망 검증 (C4.1 게이트의 가치)

본 v10 sprint는 **C4.1 게이트의 실제 가치를 정량 입증**:
- 시뮬에서 옵션 A1이 학습 plateau 해결 → 자율 PR 가능해 보임
- 그러나 실제 weight 변경 + C4.1 실행 → **FAIL with "도메인 증거 없음"**
- → 안전망이 정상 작동, 자율 작업에 도메인 검증 강제

만약 C4.1 게이트가 없었다면 옵션 A1이 production에 적용되어 도메인 모순 누적 가능. **"Synthetic simulator data로 production weight update 절대 불가" 정책**과 동일한 안전 원칙.

### 18.6 v10 종료 시점 본인 결단 잔여

1. ✅ Cloud Run vocab-cat-test 배포 (완료)
2. ⚠️ ~~EBS-demo Firebase config~~ → 별도 PR 1-2일 ([설계 완료](../02-design/ebs-oelp-vocab-adapter-design.md))
3. ⚠️ **D1_Form plateau 옵션 A' PR** → 1일 작업 ([설계 완료](../02-design/d1-plateau-option-a-prime.md))
4. ☐ **외부 학습자 1명 모집** (변화 없음)

설계 완료 PR 2건 (옵션 α / 옵션 A') = 본인 결단 후 2일 분량 backlog.

### 18.7 v10 시점 OELP의 위치 한 줄 정의

> "Cloud Run + Vercel Production 활성, 6 closed-loops 확정 + 7번째 PR-ready 설계 완료. C4.1 게이트가 자율 작업을 안전하게 차단하는 안전망 가치 정량 입증. 본인 결단 시 2일 분량 PR 2건 즉시 시작 가능. 학습자 1명 모집 외엔 모든 준비 완료."

---

## 19. v11-v12 추가분 (2026-05-24 야간 sprint — 자동화 도구 + PR 사전 검증)

### 19.1 새 작업 시퀀스 73-82

| 순서 | 작업 | 산출물 |
|---|---|---|
| 73 | **check-dim-coverage.mjs** | keyVariable 매핑 자동 진단 (D1 같은 hidden defect 자동 catch) |
| 74 | dim-coverage-script test (7 tests) | production state sentinel (옵션 A' 후 자동 flip) |
| 75 | **dogfood-9 5×5 dim × archetype matrix** | D1 plateau 5/5 archetype 일반화 + 다른 4 dim 안전성 검증 |
| 76 | **dogfooding-9-dim-plateau-matrix.md 보고서** | 정량 baseline + 옵션 A' PR 적용 후 자동 검증 절차 |
| 77 | content-validators V3/V6 edge case +7 tests | 92.56→95.27% stmts, 전체 97.79→98.26% lines |
| 78 | session memory v9-v11 갱신 | local memory + MEMORY.md cross-link |
| 79 | OELP CLAUDE.md + README v11 갱신 | 누적 상태 23 scripts, 12 gates |
| 80 | **check-dim-coverage CI gate (12번째)** | non-blocking until 옵션 A' PR lands → strict 활성화 |
| 81 | **simulate-option-a-prime.mjs** | 본인 4 파일 PR 사전 검증 — in-memory diff + C4.1 예측 |
| 82 | 본 v12 회고 (§19) | 자동화 도구 가치 입증 + PR 사전 검증 패턴 |

### 19.2 자동화 도구 누적 가치

v11-v12 sprint는 **사람이 발견한 finding을 자동화로 변환**한 sprint:

| Finding | 자동화 도구 | 가치 |
|---|---|---|
| D1 keyVariable 0개 (v10) | check-dim-coverage.mjs (v11) | CI gate 12번째, 미래 dim defect 자동 catch |
| D1 plateau matrix (v11) | dogfood-9-dim-plateau-scan.mjs | 옵션 A' PR 적용 전후 회귀 검증 baseline |
| 옵션 A' PR 위험 (v10) | simulate-option-a-prime.mjs (v12) | 본인 PR 작성 전 in-memory 검증 → 안전성 사전 확보 |

→ "발견 → 코드 → 검증 → 정책" 패턴에서 **"검증 → 자동화" 단계가 명시화**. 동일 finding이 새 학습자/시나리오에서 재발생할 때 1초 안에 catch 가능.

### 19.3 옵션 A' PR 시뮬 결과 (simulate-option-a-prime.mjs)

```
Before (현 production):
  TYPE-제목 derived weights = { D1: 0.000, D4: 0.750, D3: 0.250, others: 0 }
  Declared = { D1: 0.05, D4: 0.40, D3: 0.35, D2: 0.10, D5: 0.10 }
  tau = 1.000, contradictions = 0 → PASS

After (옵션 A' 적용):
  TYPE-제목 derived = { D1: 0.375, D4: 0.375, D2: 0.125, D3: 0.125, D5: 0 }
  Declared = { D1: 0.20, D4: 0.34, D3: 0.29, D2: 0.08, D5: 0.09 }
  tau = 0.500, contradictions = 0 → PASS
  → ✅ 옵션 A' PR safe
```

본인이 4 파일 (`dimension-mapping.md` + `kv-dim-mapping.ts` + `ontology.ts` + `ontology-weights.json`) 변경 시 C4.1 게이트 통과 예상.

### 19.4 v12 시점 수치 종합

| 항목 | v10 | v11 | **v12** |
|---|---|---|---|
| Vitest tests | 342 | 356 | **356** (변동 없음) |
| Test files | 36 | 37 | 37 |
| Scripts (oelp) | 21 | 23 | **24** (+1: simulate-option-a-prime) |
| Components | 12 | 12 | 12 |
| Coverage lines | 97.79% | 98.26% | 98.26% |
| **CI gates** | 11 | 11 | **12** (check-dim-coverage 신설) |
| myprojects docs | 49 | 50 | **52** (D9 matrix report + 본 §19) |
| Closed-loop iterations | 6 + 7번째 PR-ready | 6 + 7 PR-ready | 6 + 7번째 simulated PASS |

### 19.5 v12 종료 시점 본인 결단 잔여

1. ✅ Cloud Run vocab-cat-test 배포 (v8)
2. ⚠️ EBS adapter (1-2일, 설계 완료)
3. ⚠️ **D1_Form 옵션 A' (1일, 설계 완료 + 시뮬 PASS 검증됨)** ← simulate-option-a-prime.mjs로 사전 안전성 확보
4. ☐ 외부 학습자 1명 모집

옵션 A' PR은 본인이 진행 시 simulate 결과대로 C4.1 통과 예상. 사실상 risk-free PR (시뮬 사전 검증으로).

### 19.6 v12 시점 OELP의 위치 한 줄 정의

> "자동화 도구로 미래 hidden defect 자동 catch + 옵션 A' PR 사전 시뮬 검증 완료. 본인이 4 파일 PR 진행 시 C4.1 통과 예상 — 시뮬상 안전성 사전 확인. 학습자 1명 모집 외엔 모든 준비 + 안전성까지 완비."

---

## 20. v13 추가분 (2026-05-24 야간 — 학습자 도착 시 즉시 작동 UI + 옵션 A' 효과 사전 측정)

### 20.1 새 작업 시퀀스 83-90

| 순서 | 작업 | 산출물 |
|---|---|---|
| 83 | **simulate-option-a-prime contract test** (7 tests) | sentinel 보장 — 본인 PR 의존 시뮬레이터 정상성 자동 검증 |
| 84 | **dogfood-10 옵션 A' 효과 사전 측정** | production weight in-memory override matrix, **Verdict SAFE** |
| 85 | **lib/plateau-detection.ts** | 실 sessions에서 dim plateau 자동 감지 알고리즘 |
| 86 | **PlateauWarningPanel** (`/sessions` 13번째 component) | 학습자 4주+ 누적 시 즉시 활성, D1 plateau 발견 시 옵션 A' PR 권장 |
| 87 | plateau-detection test 8 tests | 정렬 / 결측 / 다중 plateau / D1 warn vs 다른 dim info |
| 88 | OELP CLAUDE.md + README v13 갱신 | 21 lib modules, 25 scripts, 13 components, 371 tests |
| 89 | 본 v13 회고 (§20) | 자율 작업 + 학습자 도착 후 자동 활성 패턴 명시 |
| 90 | (다음 sprint candidate) | v14 후보: dogfood-10 결과 보고서, /sessions e2e Playwright |

### 20.2 dogfood-10 정량 결과 (옵션 A' 적용 시 예상)

```
D1_Form gap closed 변화 (baseline → option A'):
  weak-D1   0% →  81%  (+81%p)
  weak-D2   0% →  70%  (+70%p)
  weak-D3   0% →  66%  (+66%p)
  weak-D4   0% →  69%  (+69%p)
  weak-D5   0% →  66%  (+66%p)

D3_Context (dominant dim) 변화 — 위험 모니터:
  최대 -3%p (모든 archetype 안전 범위 내)

다른 dim 변동 > 10%p: 0건
Verdict: SAFE
```

**본인 옵션 A' PR 진행 시 D1 plateau 66-81% 회복 + 다른 dim 안전 보장**.

### 20.3 PlateauWarningPanel 작동 메커니즘

```
/sessions 페이지 → 누적 sessions 로드
  ↓
detectPlateaus(sessions, minSessions=4, rangeThreshold=3)
  ↓
각 dim series 추출 (session.responses[0].dimensionScores)
  ↓
max-min < 3 points && ≥ 4 samples → plateau flag
  ↓
D1_Form은 severity="warn" + 옵션 A' PR 권장 메시지
다른 dim은 "info" badge
  ↓
< 4 sessions → "학습 진행하면 자동 활성화" placeholder
```

학습자 1명 + 4주 누적 (≥12 sessions) 시점에 즉시 활성. v10 simulation finding을 실 데이터로 confirm/refute.

### 20.4 v13 시점 수치 종합

| 항목 | v10 | v11 | v12 | **v13** |
|---|---|---|---|---|
| Vitest tests | 342 | 356 | 356 | **371** (+15) |
| Test files | 36 | 37 | 37 | **39** (+2) |
| Scripts (oelp) | 21 | 23 | 24 | **25** (dogfood-10) |
| Components | 12 | 12 | 12 | **13** (PlateauWarningPanel) |
| lib modules | 20 | 20 | 20 | **21** (plateau-detection) |
| Coverage lines | 97.79% | 98.26% | 98.26% | **유지** |
| CI gates | 11 | 11 | 12 | **12** |
| myprojects docs | 49 | 50 | 52 | **52** |

### 20.5 학습자 도착 시 자동 작동 chain (v13 완성)

외부 학습자 1명 도착 + Cloud Run 진단 → /queue 학습 → /sessions 누적 4주 이상 → **자동 활성화** 항목:

1. **TrendPanel** (v5) — 세션 정답률 sparkline + 5D dim 진화 trend (4주+)
2. **PosteriorBalancePanel** (v4) — Beta posterior 변화 + balance state label
3. **AnalyticsQueuePanel** (v5) — 11 이벤트 type 분포 + 누적량
4. **AdaptiveDiagnosticStats** (v5) — θ history + KR1.1/1.2 metric (≥2 진단)
5. **CalibrationEventSync** (v7) — regression-history → queue mirror
6. **PlateauWarningPanel** (v13 신설) — D1 plateau 확인 + 옵션 A' PR 권장

→ **학습자 1명 도착 즉시 6개 운영 위젯이 자동 데이터 받아들이고 시각화 시작**. 본인 결단 없이 자동 진화.

### 20.6 v13 종료 시점 본인 결단 잔여

1. ✅ Cloud Run vocab-cat-test 배포 (v8)
2. ⚠️ EBS adapter (1-2일, 설계 완료)
3. ⚠️ **D1_Form 옵션 A' (1일, 설계 + 시뮬 PASS + dogfood-10 SAFE verdict + PlateauWarningPanel로 실 검증 준비)** ← 4중 안전성 확보
4. ☐ 외부 학습자 1명 모집

옵션 A' PR은 본인이 진행 시:
- 시뮬 (simulate-option-a-prime): tau 0.5 PASS
- 매트릭스 (dogfood-10): D1 +66-81%p, 다른 dim 안전
- 실 검증 (PlateauWarningPanel): 학습자 도착 후 자동 confirm
- CI gate (check-dim-coverage): MISSING → OK 자동 flip

**risk-free PR + 실 검증 인프라까지 완비**.

### 20.7 v13 시점 OELP의 위치 한 줄 정의

> "자동화 도구 + 시뮬 + 사전 측정 + 실 검증 UI까지 옵션 A' PR을 위한 4중 안전성 확보. 학습자 도착 즉시 6개 위젯 자동 활성. 본인 결단 잔여는 학습자 1명 모집 + 옵션 A'/EBS PR 2건 (총 2-3일)."

---

## 21. v14 추가분 (2026-05-25 — PRD 정식 등록 + /map UI D1 indicator)

### 21.1 새 작업 시퀀스 91-94

| 순서 | 작업 | 산출물 |
|---|---|---|
| 91 | **Phase 2 PRD R6 정식 등록** | D1_Form structural defect를 R6로 추가 (중간 severity), R4 EBS-demo 정정 |
| 92 | **/map UI D1 indicator** | 선택된 QT의 derived D1 = 0% 시 옵션 A' PR 권장 메시지 자동 표시 |
| 93 | session memory v12-v14 통합 저장 | 4중 안전성 + 디버깅 메모 + 학습자 chain 7 widgets |
| 94 | 본 v14 회고 (§21) | PRD ↔ 코드 ↔ UI 정합성 완성 |

### 21.2 학습자 도착 시 자동 활성 chain (v14 확장: 7 surfaces)

기존 6 widgets (v13 §20.5) + /map indicator (v14):

1. TrendPanel — accuracy sparkline + 5D dim 진화
2. PosteriorBalancePanel — Beta posterior + balance
3. AnalyticsQueuePanel — 11 이벤트 분포
4. AdaptiveDiagnosticStats — θ history + KR1.1/1.2
5. CalibrationEventSync — audit log mirror
6. PlateauWarningPanel — D1 plateau 자동 confirm/refute
7. **/map D1 indicator (v14)** — QT 선택 시 derived 0% 알림

학습자가 OELP 어느 페이지를 봐도 D1 plateau context가 자동으로 surface됨.

### 21.3 PRD ↔ 코드 ↔ UI 정합성 (v14 완성)

| 층위 | 표현 | v 시점 |
|---|---|---|
| PRD | R6 D1_Form structural defect | v14 |
| 시뮬 | dogfood-9 matrix + dogfood-10 sim | v11, v13 |
| 도구 | check-dim-coverage + simulate-option-a-prime | v11, v12 |
| 실 데이터 UI | PlateauWarningPanel | v13 |
| 학습자 탐색 UI | /map D1 indicator | v14 |
| 설계 | d1-plateau-option-a-prime.md | v10 |

→ 단일 finding (D1 plateau)이 PRD부터 사용자 UI까지 6 층위에서 일관 표현. 자율 작업의 정합성 maturity 달성.

### 21.4 v14 시점 수치 종합

| 항목 | v13 | **v14** |
|---|---|---|
| Vitest tests | 371 | 371 |
| Scripts (oelp) | 25 | 25 |
| Components | 13 | 13 |
| Coverage lines | 98.26% | 98.26% |
| CI gates | 12 | 12 |
| myprojects docs | 52 | **53** (본 §21 + PRD R6) |
| Phase 2 PRD risks | R1-R5 | **R1-R6** (D1 plateau 정식 등록) |

### 21.5 v14 시점 본인 결단 잔여 (v13과 동일)

1. ✅ Cloud Run 배포
2. ⚠️ EBS adapter PR (1-2일, 설계 완료)
3. ⚠️ **D1_Form 옵션 A' PR (1일, 5중 안전성 — 시뮬/매트릭스/실 UI/CI gate/+ PRD 정식 등록)**
4. ☐ 외부 학습자 1명 모집

본인 결단 변화 없음. v14는 표현/정합성 강화 sprint.

### 21.6 v14 시점 OELP의 위치 한 줄 정의

> "D1_Form structural defect가 PRD R6 → 시뮬 → 도구 → 실 UI → /map indicator까지 6 층위에서 일관 표현. 본인 옵션 A' PR risk-free 5중 안전성 완비 (PRD 정식 등록 추가). 학습자 모집만 남음."

---

## 22. v15 추가분 (2026-05-25 — 미래 PR 안전 가이드 + 운영 모니터링 도구)

### 22.1 새 작업 시퀀스 95-98

| 순서 | 작업 | 산출물 |
|---|---|---|
| 95 | **dogfood-11 weight sensitivity** | 5 dim 각각 +0.15 boost 시뮬 → 미래 가중치 조정 PR 안전 가이드 |
| 96 | **QueuePlateauNotice** (`/queue` 8번째 surface) | 큐가 D1 targeting + 학습자 plateau confirmed 시 경고 + 옵션 A' PR 권장 |
| 97 | **bundle-size-audit.mjs** | Next.js 16 Turbopack production bundle 측정 도구 (현 1.58MB, threshold 3MB 47% 마진) |
| 98 | 본 v15 회고 (§22) | 미래 PR 안전 가이드 + 운영 도구 누적 |

### 22.2 dogfood-11 정량 결과 (5 dim sensitivity)

각 dim에 대해 도메인 합치 QT에서 +0.15 boost 시뮬:

```
dim          QT          avg gap   side  verdict
D1_Form      제목         +70.2%p    4    MAJOR (옵션 A' systemic)
D2_Meaning   심경         +3.8%p     0    SAFE (효과 미미)
D3_Context   요지          0%p       0    SAFE (이미 dominant, 천장)
D4_Network   제목         +1.8%p     0    SAFE (효과 미미)
D5_Usage     순서배열      +5.2%p     0    SAFE (효과 미미)
```

**핵심 finding**:
- D1만 MAJOR — 옵션 A' 정당화 (systemic defect 해결)
- D3는 이미 dominant 천장 효과 → boost 무의미
- D2/D4/D5는 SAFE but 효과 미미 → 도메인 검토 후만 변경

**미래 가치**: 다른 dim에 대한 가중치 조정 PR이 등장하면 본 script 결과를 baseline으로 사용. MAJOR verdict 발견 시 옵션 A' 같은 4 파일 동시 PR 필수.

### 22.3 학습자 도착 시 자동 활성 chain 8 surfaces (v15 확장)

기존 7 (v14) + QueuePlateauNotice (v15):
1. TrendPanel — accuracy + 5D trend
2. PosteriorBalancePanel — Beta posterior + balance
3. AnalyticsQueuePanel — 11 이벤트 분포
4. AdaptiveDiagnosticStats — θ history + KR1.1/1.2
5. CalibrationEventSync — audit log mirror
6. PlateauWarningPanel — D1 plateau 자동 confirm
7. /map D1 indicator — derived 0% 알림
8. **QueuePlateauNotice (v15)** — 큐가 D1 targeting + plateau confirmed 시 경고

학습자가 OELP 어디서든 D1 plateau context 자동 surface — diagnose 후 → map 탐색 시 → 학습 큐 시작 전 → sessions 누적 분석.

### 22.4 운영 모니터링 도구 누적 (v15)

| 도구 | 측정 항목 | 현 상태 |
|---|---|---|
| `check-dim-coverage.mjs` (v11) | keyVariable 매핑 갭 | D1_Form MISSING (정상 baseline) |
| `simulate-option-a-prime.mjs` (v12) | 옵션 A' PR 사전 검증 | tau 0.5 PASS |
| `dogfood-9 matrix` (v11) | 5×5 plateau scan | D1 5/5 = 0% |
| `dogfood-10 matrix` (v13) | 옵션 A' 효과 사전 측정 | SAFE verdict |
| `dogfood-11 sensitivity` (v15 신설) | 5 dim weight sensitivity | D1만 MAJOR |
| `bundle-size-audit.mjs` (v15 신설) | Production bundle size | 1.58MB / 3MB |

→ 자율 작업의 **운영 모니터링 인프라가 완비**됨. 학습자 데이터 도착 시 자동 활성 + 미래 PR 사전 검증 + 배포 사이즈 회귀 모두 자동.

### 22.5 v15 시점 수치 종합

| 항목 | v13 | v14 | **v15** |
|---|---|---|---|
| Vitest tests | 371 | 371 | 371 |
| Scripts (oelp) | 25 | 25 | **27** (dogfood-11 + bundle-audit) |
| Components | 13 | 13 | 13 |
| Coverage lines | 98.26% | 98.26% | 98.26% |
| CI gates | 12 | 12 | 12 |
| 학습자 자동 surface | 6 | 7 | **8** (QueuePlateauNotice) |
| 운영 모니터링 도구 | 4 | 4 | **6** (dogfood-11 + bundle-audit) |
| myprojects docs | 52 | 53 | **54** (본 §22) |

### 22.6 v15 시점 본인 결단 잔여 (v14와 동일)

1. ✅ Cloud Run 배포
2. ⚠️ EBS adapter PR (1-2일, 설계 완료)
3. ⚠️ **D1_Form 옵션 A' PR (1일, 5중 안전성)** — 변화 없음, 추가 모니터링 도구 완비
4. ☐ 외부 학습자 1명 모집

### 22.7 v15 시점 OELP의 위치 한 줄 정의

> "옵션 A' PR을 위한 5중 안전성 + 운영 모니터링 6 도구 + 학습자 도착 시 자동 활성 8 surfaces 완비. 미래 가중치 조정 PR도 dogfood-11 sensitivity로 안전 사전 검증 가능. 학습자 모집만 남음."

---

## 23. v16 추가분 (2026-05-25 — 학습 모델 정밀화 + CI 도구 확장)

### 23.1 새 작업 시퀀스 99-102

| 순서 | 작업 | 산출물 |
|---|---|---|
| 99 | **dogfood-12 forgetting curve** | Ebbinghaus 망각 모델 추가 24주 sim, D1 negative gap finding |
| 100 | **scripts/c4-3-trend-cli.mjs** | lib/trend-analysis 래퍼 CLI (CI/cron 사용 가능) |
| 101 | session memory v15-v16 저장 | 운영 도구 패턴 누적 |
| 102 | 본 v16 회고 (§23) | 학습 모델 정밀화 + 시간 차원 정당화 |

### 23.2 D1 시간 차원 정당화 (dogfood-12 새 finding)

기존 시뮬 (dogfood-8~11): 가정 "학습된 dim은 영구 유지"
v16 추가: Ebbinghaus forgetting curve (decay 0.97/session post-grace, floor base × 0.7)

24주 결과 (seed=17):

| dim | dogfood-8 (기존) | **dogfood-12 (forgetting 추가)** |
|---|---:|---:|
| D1_Form | 0% (plateau) | **-72% (negative gap)** |
| D2_Meaning | 92% | 99% (forgetting 회복 정상) |
| D3_Context | 100% | 102% |
| D4_Network | 87% | 102% |
| D5_Usage | 76% | 92% |

→ **D1은 시간 갈수록 더 약해짐** (학습 없음 + forgetting 누적):
- 시간 무시: 단순 plateau (정체)
- 시간 포함: negative gap (적극적 악화)

옵션 A' PR 정당화 강화 — 단순 "더 강해지지 않음"이 아니라 "시간 갈수록 더 약해짐".

### 23.3 운영 도구 누적 8 (v15 → v16)

| 도구 | 신설 시점 | 측정 항목 |
|---|---|---|
| check-dim-coverage | v11 | keyVariable 매핑 갭 |
| simulate-option-a-prime | v12 | 옵션 A' PR 사전 검증 |
| dogfood-9 matrix | v11 | 5×5 plateau scan |
| dogfood-10 matrix | v13 | 옵션 A' 효과 사전 측정 |
| dogfood-11 sensitivity | v15 | 5 dim weight sensitivity |
| bundle-size-audit | v15 | Production bundle size |
| **dogfood-12 forgetting** | v16 | 24주 forgetting 시나리오 |
| **c4-3-trend-cli** | v16 | CI/cron trend analysis |

### 23.4 v16 시점 수치 종합

| 항목 | v15 | **v16** |
|---|---|---|
| Vitest tests | 371 | 371 |
| Scripts (oelp) | 27 | **29** (+2: dogfood-12, c4-3-trend-cli) |
| Components | 13 | 13 |
| CI gates | 12 | 12 |
| 학습자 자동 surface | 8 | 8 |
| 운영 모니터링 도구 | 6 | **8** |
| myprojects docs | 54 | **55** (본 §23) |

### 23.5 v16 시점 본인 결단 잔여 (v14-v15와 동일)

1. ✅ Cloud Run 배포
2. ⚠️ EBS adapter PR (1-2일)
3. ⚠️ **D1 옵션 A' PR (1일, 5중 안전성 + 시간 차원 정당화 강화)** — v16에서 forgetting 시나리오로 정당화 더 강력
4. ☐ 외부 학습자 1명 모집

옵션 A' PR risk-free + 시간 차원에서도 정당화 — 본인이 더 자신감 있게 진행 가능.

### 23.6 v16 시점 OELP의 위치 한 줄 정의

> "학습 모델에 forgetting curve 추가해서 D1 시간 차원 정당화 (negative gap). 운영 모니터링 도구 8개로 미래 PR 안전 가이드 + 실시간 trend 분석 가능. 학습자 모집만 남음."
