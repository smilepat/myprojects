# OELP Stability Roadmap v2 — Tier 5-6 모니터링 + Phase 2 운영 가드

> 작성: 2026-05-23 (v3++ sprint 종료 시점)
> 선행: [stability-roadmap-tier-1-3-complete.md](./stability-roadmap-tier-1-3-complete.md) v1
> Scope: v1 Tier 1-4 완료 이후 새 운영 가드 + Phase 2 전환 안정성

---

## 0. v1과의 차이

| 측면 | v1 (2026-05-23 morning) | **v2 (2026-05-23 evening)** |
|---|---|---|
| Tier 범위 | 1-3 (데이터 계약 / 자동 동기화 / 외부 dep) + Tier 4.1 | Tier 5 (외부 블로커) + Tier 6 (Phase 2 진화) |
| Sprint 결과 | 7 작업 완료 + A11y baseline | Tier 5-6 항목들에 대한 모니터링 인프라 정립 |
| 운영 모드 | "PR 차단 8 stages" | "PR 차단 9 stages + weekly cron 모니터링 + auto-promote 안전망" |

---

## 1. v3++ 종료 시점 안전망 종합

### 1.1 자동 PR Gate (9 stages)
```
PR 발생 →
  1. ESLint
  2. Vitest 272 단위 테스트
  3. Coverage threshold 93/80/95/90 (lines/branches/funcs/stmts)
  4. JSON Schema validation (3 schemas)
  5. README counter freshness
  6. C4.1 dimension-mapping regression (tau ≥ 0.4 + contradictions = 0)
  7. C4.2 diversity sanity (non-blocking)
  8. Next.js production build
  9. A11y e2e (axe-core, 6 routes × 2 viewports = 12 WCAG 2.1 AA)
→ 9 stages 모두 통과 시 merge 가능
```

### 1.2 Weekly Cron (모니터링)
- `weekly-calibration.yml`: 일요일 02:00 UTC — Supabase events → calibrate.mjs → PR 자동 생성
- `vocab-cat-test-smoke.yml`: 일요일 03:00 UTC — vocab-cat-test backend 통합 smoke

### 1.3 Auto-promote 안전망 (가중치 변경 시)
- `promote-weights.mjs` 자동 호출 시 C4.1 게이트 → FAIL 시 자동 롤백
- regression-history.json auto-append (T1.2 기록)
- 3 cycles 누적 검증 (dogfooding-1/2/3 모두 catch + rollback)

---

## 2. Tier 5 — 외부 블로커 추적 (본인 결단 의존)

| Tier | 작업 | 본인 시간 | 현재 상태 | 자동 모니터 |
|---|---|---|---|---|
| T5.1 | vocab-cat-test Cloud Run 배포 | 30분 | runbook 준비됨, 미실행 | weekly smoke cron이 실행 시점 자동 감지 |
| T5.2 | EBS-demo Firebase config | 30분 | 코드 wired, env 미설정 | `defaultGeneratorChain()` 자동 fallback (LocalPool), config 시 즉시 활성 |
| T5.3 | vocab-cat-test PR #2 merge | instant | ✅ **MERGED 2026-05-23** | ALLOWED_ORIGINS 기본값에 OELP dev ports 자동 포함 → env 지정 불필요 |
| T5.4 | Vercel custom domain (선택) | 30분 | 기본 vercel.app URL 사용 중 | DNS 변경 시 Vercel이 자동 SSL |

### 2.1 자동 모니터링 정책

본인이 외부 블로커 해소 시 다음이 자동 작동:
- **T5.1 해소** → vocab-cat-test-smoke.yml weekly cron이 새 Cloud Run URL 자동 감지 가능 (env var 갱신만)
- **T5.2 해소** → /queue의 GeneratorChainStatus가 즉시 "ebs-criteria-engine-v1 활성" 표시
- **T5.3 해소** → 본인 dev 환경에서 매번 ALLOWED_ORIGINS env 지정 불필요
- **T5.4 해소** → 모든 docs의 URL 자동 갱신 (수동 sed 필요)

→ **본인 결단이 즉시 시스템 진화로 이어지는 구조 완비**.

---

## 3. Tier 6 — Phase 2 운영 진화 (학습자 채널 의존)

### 3.1 Stage C 활성화 트리거

| 조건 | 현재 | Stage C 활성 시 |
|---|---|---|
| 외부 학습자 수 | 0명 | ≥ 1명 |
| 외부 응답 비율 | 0% | > 50% 목표 ([stage-c-activation-simulation.md](../03-analysis/stage-c-activation-simulation.md) forecast) |
| calibrate.mjs `--auto-lambda` | N-based만 | external_ratio-based 추가 (Phase 2 KR4.1) |
| C4.3 trend UI | scaffolded | 외부 학습자 4주 누적 시 활성 |
| `/sessions` TrendPanel | placeholder | live data 표시 |
| P-1 exploration target | helper만 | `/queue`의 alternative target chip로 노출 |

### 3.2 자동 모니터 + 본인 알림

학습자 1명 도착 시 자동 작동:
- `posteriorBalance(posteriors)`가 1.0 → < 1.0으로 떨어짐 (잘 분포된 → 새 사용자 starvation)
- `findExplorationTarget()`이 non-null 반환 — 새 사용자가 모르는 QT 식별
- TrendPanel snapshot count 증가
- regression-history에 첫 "external-driven calibration" 시도 이벤트 (성공 시 PASS, 실패 시 FAIL — 둘 다 audit)

본인은 `/regression-history` 또는 `/sessions` 에서 변화 즉시 인지 가능.

### 3.3 simulator 점진 제거 (Phase 2 후반)

| 외부 비율 | simulator 가중치 | 운영 |
|---|---|---|
| 0-30% | 100% (현재) | calibrate dry-run만, prod 적용 안 함 |
| 30-50% | 60% | calibrate weekly cron PR 검토 |
| 50-70% | 30% | 외부 데이터 단독 calibrate 시도 |
| > 70% | 0% (제거) | simulator 코드/데이터 deprecate |

이 progressive removal은 Phase 2 §4.1 KR4.1 에 정식 등록.

---

## 4. 리스크 모니터링 (수동/자동 혼합)

| 리스크 | 자동 감지 | 본인 행동 |
|---|---|---|
| **C4.1 게이트 false-positive** (legit weight update가 catch됨) | regression-history fail 빈도 모니터 | 4 cycle 이상 연속 fail 시 R3.c 재검토 (D5 weight 매핑 보강) |
| **vocab-cat-test backend 다운** | weekly smoke cron fail 알람 | 본인 환경에서 uvicorn 재시작 또는 Cloud Run redeploy |
| **dependabot PR 정체** | GitHub UI에서 visible | 4주 이상 누적된 PR 일괄 검토 |
| **README counter drift** | T2.1 freshness check | drift 시 PR 차단됨 (수동 액션 불필요) |
| **regression-history 손상** | T1.1 schema validation + T1.2 append idempotency | drift 시 PR 차단됨 (수동 액션 불필요) |
| **ontology-weights.json 비인가 편집** | T1.2 lastWriter 검증 | manual 편집 시 reason 필수 (PR description) |
| **Vercel 빌드 실패** | Vercel email + GitHub commit status | 본인 PR 재시도 또는 revert |

→ **시스템 알람 7개 중 5개 자동, 2개 (vocab-cat-test 다운 + dependabot 누적) 본인 주기적 확인 필요.**

---

## 5. Phase 2 전환 자체 안전성 — 일정 정책

### 5.1 4주 단위 chunking
Phase 2 12주 마일스톤은 4주 chunk × 3 (PRD §6):
- W1-W4: Stage B 외부 블로커 해소 + 학습자 모집 시도
- W5-W8: 외부 학습자 monitoring + Stage A 자율 작업
- W9-W12: 첫 PASS calibration + Phase 3 백로그 정리

각 4주 종료 시 본 v2 문서 갱신 (chunk-end report 형식).

### 5.2 ratchet 정책 (역행 방지)
v3++ sprint 종료 시점 달성한 수치는 **하향 불가**:
- Vitest tests ≥ 272 (감소 시 CI fail)
- Coverage 93/80/95/90 threshold (감소 시 CI fail)
- A11y 6/6 routes (감소 시 CI fail)
- 9 CI stages (제거 시 PR review 필수)

새 작업 PR이 이 ratchet을 위반하면 강제 검토. 의도적 완화 시 본 v2 §5.2 갱신.

---

## 6. 다음 4주 권장 행동 (Phase 2 W1-W4)

### 본인 단독 결단 (병렬 가능)
1. T5.1 Cloud Run 배포 (30분)
2. T5.3 PR #2 merge (1분)
3. 학습자 1명 모집 시도 (지인 EFL 학습자, 4주 dogfooding 약속)

### Claude 자율 (병렬 진행)
- (계속) 안전망 보강 + Coverage 100% 도전
- Phase 2 design docs 정식화 (P-1 W9+ recommendation refinement, P-3 Phonics persona)
- 본 v2 문서 4주 후 첫 chunk-end 갱신

### 미달 시 Plan B
- 학습자 1명 미확보 → Phase 2.5 (안정화 4주) 진입
- T5.1 미실행 → AdaptiveDiagnostic은 본인 venv 환경에서만 동작 (외부 사용자에게 amber 경고)
- 본 v2를 v2.5로 갱신 + 새 마일스톤 설정

---

## 7. 변경 이력
- 2026-05-23: v1 작성 (Tier 1-3 완료 회고)
- 2026-05-23 evening: **v2 작성** (Tier 5-6 모니터링 + Phase 2 운영 가드 + 4주 chunk 정책)
