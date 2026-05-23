# OELP Phase 2 Backlog — v2 재검토 (2026-05-23)

> 원본: [phase2-backlog.md](./phase2-backlog.md) (2026-05-22 작성)
> 트리거: P-1, P-2 W1-6, P-7 spike, P-1.5b, dogfooding-1/2, Tier 1-3 stability roadmap 모두 완료 (2026-05-22~23)
> Status: Draft v2 — Phase 1 boundary 재정의 필요

---

## 0. 왜 v2가 필요한가

원본 phase2-backlog.md 작성 직후(2026-05-22), Phase 2 항목 일부(P-1, P-2 W1-6, P-7)가 **Phase 1 일정 안에서 이미 완료**됨. 또한:

1. **베타 채널 부재 확정** — 원본의 P-3/P-4/P-5는 모두 학습자 채널 의존
2. **dogfooding-1/2 결과**: rank-1 X 문제 → calibration이 본인 데이터만으로는 의미 회귀를 못 함
3. **Tier 1-3 stability roadmap 완료** — 원본에 없는 인프라 작업이 실제 시간을 잡아먹음
4. **vocab-cat-test 통합 미완** — Phase 1 의도된 finishing이지만 본인 환경 의존

→ 원본 백로그를 그대로 진행하면 (a) 이미 한 일 중복, (b) 채널 없는 항목 시도, (c) 인프라 누락. 본 v2가 reset.

---

## 1. 현재 시점 (2026-05-23) 자산 종합

| 항목 | 상태 | 비고 |
|---|---|---|
| Phase 1 F1/F2/F3 | ✅ 완료 | 6 routes user-facing + 1 audit = 7 |
| P-1 Recommendation v2 | ✅ 완료 | Thompson + Ridge + Auto-promote |
| P-1.5 Bridge | ✅ 완료 | Session history + eval form |
| P-1.5b Varied Diagnostic | ✅ 완료 | + preset UI (4종 1-click) |
| P-2 W1-6 EBS Content Foundation | ✅ 완료 | 12 validators, IRT cold-start, buildQueueV3 |
| P-2 W7+ EBS Firebase Real | ⏳ 미완 | Firebase config 본인 30min 필요 |
| P-7 Neo4j Spike | ✅ DEFER | 4 재평가 트리거 문서화 |
| **Tier 1-3 stability roadmap** | ✅ 완료 | 7건, 130→165 tests, 8-step CI gate |
| **A11y baseline (Tier 4.1)** | ✅ 완료 | 6/6 routes WCAG 2.1 AA |
| **vocab-cat-test Docker** | ⏳ 미완 | 본인 1h runbook 준비 완료 |
| dogfooding-1/2 | ✅ 완료 | C4.1 게이트 2회 자동 검출 |
| Real EBS Firebase | ⏳ 미완 | Tier 5.2 |

---

## 2. 새로운 분류: 솔로 환경 적합도별 4단계

### Stage A — 즉시 자율 가능 (Claude 단독, ~1-3 세션)

| 항목 | 추정 | 가치 | 추천도 |
|---|---|---|---|
| **A1.** 실제 진단 시작 UI on /diagnose | 30min | preset 외에 vocab-cat-test API 호출 옵션 노출 | ★★★ |
| **A2.** vocab-cat-test smoke test CI workflow | 30min | weekly cron으로 Docker 통합 상태 모니터 | ★★ |
| **A3.** error boundary + localStorage error log | 1세션 | 다른 환경에서 사용 시 디버깅 자료 확보 | ★★★ |
| **A4.** Mobile 반응형 패스 (Tailwind sm/md) | 1세션 | 페르소나 P0 (고2)의 자투리 시간 학습 대비 | ★★ |
| **A5.** /sessions에 calibration history 시각화 | 1세션 | regression-history와 짝을 이루는 운영 UI | ★ |
| **A6.** vitest coverage 측정 + 임계치 게이트 | 30min | 165 tests 중 실제 코드 커버리지 측정 | ★★ |

### Stage B — 본인 1회 30-60분 (외부 블로커 해소)

| 항목 | 추정 | 가치 | 추천도 |
|---|---|---|---|
| **B1.** vocab-cat-test Docker 통합 (T5.1) | 본인 1h | C1.2 measured PASS, OELP 정체성 완성 | ★★★ |
| **B2.** EBS-demo Firebase config (T5.2) | 본인 30min | EBSCriteriaEngineGenerator 활성화 | ★★ |
| **B3.** Vercel production 배포 | 본인 30min | 배포 URL 1개 — 향후 외부 접근 채널 첫 단계 | ★★ |

### Stage C — 보류 (학습자 채널 등장 시 활성화)

| 항목 | 원본 | 보류 사유 |
|---|---|---|
| P-3 Phonics | reading-roadmap 재활성화 | 새 페르소나 P1 정의 + 인터뷰 1-3명 필요 |
| P-4 Mobile R/N | Expo 하이브리드 | PWA로 충분한 단계, R/N은 ≥10명 사용자 후 |
| P-5 Teacher Dashboard | B2B 진입 | 학습자 채널 선행 필수 |
| P-6 AI Tutor | LLM 응답 | hallucination + 비용 변수, 채널 확보 후 |
| P-8 Adaptive Curriculum | 학습 경로 | Phase 3 (P-1 + P-3 데이터 누적 후) |

### Stage D — Tier 6 (재평가 후 결정)

| 항목 | 결정 트리거 |
|---|---|
| Phase 2 P-7 Neo4j 재평가 | 4개 트리거 중 1개라도 발생 (학습자 1000+, multi-hop 명시 요구, csat-graphdb-318 결합, LLM agent) |
| 영어 외 L1 확장 | 한국 EFL P0 검증 완료 후 |
| VR/AR 학습 | 시장 성숙도 신호 |

---

## 3. 권장 다음 시퀀스 (실현 가능성 우선)

```
Now
 ↓
1. Claude solo:
   A3 (error boundary) → A1 (실제 진단 UI) → A4 (mobile) → A6 (coverage)
   = 3-4 세션 / 본인 시간 0
 ↓
2. 본인 결단 (한 번에 하루 2시간):
   B1 (Docker) → B2 (Firebase) → B3 (Vercel)
   = 본인 2-3시간 / 1주 안에 가능
 ↓
3. B1-3 완료 후 Claude:
   A2 (vocab-cat-test smoke CI) + EBSCriteriaEngineGenerator 실 활성화
   = 2 세션
 ↓
4. dogfooding-3 (지인 1-3명 모집 시도):
   페르소나 P0 적합 1명 찾으면 → Stage C P-3/P-5 활성화 검토
   = 본인 모집 노력 + Claude 운영
 ↓
5. 학습자 ≥ 1명 확보 시:
   원본 phase2-backlog P-3 / P-5 / P-1 W9+ (recommendation refinement) 진입
```

---

## 4. 원본 phase2-backlog.md와의 차이

| 측면 | 원본 (2026-05-22) | v2 (2026-05-23) |
|---|---|---|
| Phase 1/2 경계 | 명확 (12주 종료 후) | Phase 1.5/1.7로 세분화 (이미 P-1, P-2 W6 완료) |
| 진입 조건 | C1.2/C2.1/C4.1 미달 시 P-A0/A1 | C4.1 두 차례 자동 검출 후도 기능 PASS (게이트 작동) — 진입 조건 자체가 의미 약함 |
| 우선순위 | DICE-lite 점수 | Solo 환경 적합도 (Stage A/B/C/D) 분류 |
| 학습자 채널 | "선택" | 명시적 보류 트리거 (Stage C는 채널 없으면 시작 0) |
| 인프라 작업 | 0건 | Tier 1-3 stability + Tier 4.1 A11y 포함 |
| Phase 3 | 별도 | A4 Mobile은 Phase 2.5로 승격 (PWA만, R/N 보류) |

---

## 5. KPI 재정의

원본의 KPI (theta P90, 4주 향상, retention)는 모두 학습자 N≥30 가정. v2에서는 다음으로 재정의:

| 신 KPI | 측정 방법 | 임계치 |
|---|---|---|
| K1: CI green-streak | main 브랜치 PR 연속 통과 일수 | ≥ 30일 |
| K2: dogfooding cycle 빈도 | 본인 + 지인 1+명의 월별 세션 | ≥ 4회/월 |
| K3: vocab-cat-test 통합 활성도 | verify-vocab-cat-test.mjs 주간 자동 실행 결과 | 4주 연속 PASS |
| K4: regression-history 자동 append 비율 | 모든 promote 시도가 audit 되는 비율 | 100% (이미 T1.2로 달성) |
| K5: 외부 학습자 확보 | 본인 외 dogfooding 참여자 | ≥ 1명 (이게 채워지면 Stage C 활성화) |

→ K1-K4는 **자동 측정 가능**. K5만 본인 모집 활동 필요.

---

## 6. 권장 의사결정 (지금 본인이 해야 할 한 가지)

원본/v2 모두에서 가장 큰 unblock 단일 작업은:

**B1. vocab-cat-test Docker 통합 (본인 1시간 1회)**

이게 풀리면:
- C1.2 measured PASS (현재는 functional)
- OELP의 "분산 자산 통합 레이어" 정체성 완성
- /diagnose에 실제 적응형 CAT 옵션 노출
- verify-vocab-cat-test.mjs로 자동 모니터링 시작
- 후속 4개 작업 (A1, A2, B2 Firebase 통합 검증 등) 모두 unblock

→ [vocab-cat-test-integration-runbook.md](../03-analysis/vocab-cat-test-integration-runbook.md) 참고. 본인이 결단할 때 30-60분 안에 끝남.

---

## 7. 본 v2의 위치

- **원본 phase2-backlog.md는 deprecate 하지 않음** — Stage C/D 시점에 부활 가능
- **v2는 dogfooding 중심 솔로 환경의 실용 가이드**
- v2의 Stage 분류는 [stability-roadmap-tier-1-3-complete.md](../04-report/stability-roadmap-tier-1-3-complete.md) §2에서 사용한 Tier 1-6 분류와 자연스럽게 연결됨

다음 갱신 시점:
- B1 (Docker) 완료 → A2 시퀀스 활성화 + 본 문서 §3 진행도 표시
- K5 학습자 1명 확보 → Stage C 활성화 + 원본 phase2-backlog.md 부활
