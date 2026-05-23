# OELP Phase 2 — Product Requirements Document

> 작성: 2026-05-23 (Phase 1 v3 sprint 종료 직후)
> Owner: smilepat / Reviewer: 본인 단독
> 선행: [PRD Phase 1](./prd-oelp-mvp-phase1.md), [phase2-backlog-v2.md](./phase2-backlog-v2.md), [oelp-integrated-summary v3](../04-report/oelp-integrated-summary.md), [stage-c-activation-simulation.md](../03-analysis/stage-c-activation-simulation.md)

---

## 0. Phase 2 정체성 한 줄

> "외부 학습자 1명 → 50명 누적 구간을 거쳐 자기-개선 calibration loop가 자연 발효하는 시스템으로의 전환."

Phase 1이 "혼자서도 작동하는 시스템 + 안전망 인프라"였다면, Phase 2는 **그 인프라가 외부 신호를 받아 점진적으로 자기를 갱신하는 단계**.

---

## 1. 진입 조건 (Phase 1 종료 + Phase 2 시작)

| 조건 | 상태 (2026-05-23) | Phase 2 진입 가능 여부 |
|---|---|---|
| 자동 평가 12 C 기준 | 12/12 measured PASS | ✅ |
| 본인 정성 평가 잔여 | 2건 (C2.1, C3.3) — 자율 가능 | ⏳ 진입 시작은 가능, 동시 진행 |
| vocab-cat-test 통합 | resolved (Python venv 경로) + PR #1 merged | ✅ |
| Vercel Production 배포 | 본인 완료 | ✅ |
| Cloud Run vocab-cat-test 배포 | runbook 준비됨 | ⏳ 본인 30분 잔여 |
| EBS-demo Firebase config | 코드 wired, env 미설정 | ⏳ 본인 30분 잔여 |
| 학습자 채널 ≥ 1명 | 0명 | ⏳ 본인 모집 노력 |
| Tier 1-4 stability | 완료 | ✅ |

→ **Phase 2 진입 가능 (자율 가능 부분 즉시), 외부 의존 4건은 본인 결단 의존**.

---

## 2. Phase 2 목표 (12주, 2026-08-14 시작 가정 또는 본인 결단 시점)

### O1 — 외부 학습자 데이터 흐름 안정화
- KR1.1: 외부 학습자 1명 이상 4주 연속 dogfooding 참여
- KR1.2: 학습자 응답 ≥ 400건 누적 (외부 50% 비율 첫 도달 기대)
- KR1.3: vocab-cat-test ↔ OELP /diagnose 흐름 외부 환경에서 5회 성공

### O2 — 첫 자기-개선 calibration 도달
- KR2.1: 외부 학습자 데이터 단독으로 calibration cycle 1회 PASS (C4.1)
- KR2.2: regression-history에 "first external-driven calibration" 이벤트 기록
- KR2.3: C4.3 trend-analysis UI 활성화 + 본인 외 학습자 1명 trend 표시

### O3 — 콘텐츠 풀 확장 (P-2 W7+)
- KR3.1: EBSCriteriaEngineGenerator (이미 wired) Firebase config → 5회 실제 LLM 항목 생성
- KR3.2: 생성된 항목 중 ≥ 60% V1-V12 validator 통과
- KR3.3: OELP /queue에 EBS-demo 항목이 LocalPool과 chain으로 사용 — 본인 검증 후

### O4 — 안전망 진화
- KR4.1: λ schedule을 외부 학습자 비율 기반으로 재조정 (현재 N-only → external_ratio-aware)
- KR4.2: simulator D5_Usage 모델 검토 + 보정 (Stage C sim L2 학습)
- KR4.3: vocab-cat-test smoke cron 4주 연속 PASS

---

## 3. 백로그 우선순위 (phase2-backlog-v2 Stage A/B/C/D 기반)

### Stage A — Claude 자율 가능 (즉시 시작 가능)
1. **A2 vocab-cat-test smoke CI 모니터링 강화** (현재 weekly cron, Phase 2엔 보고서 자동 issue 발행)
2. **A5+ /sessions trend chart** (lib/trend-analysis.ts UI 통합 + 학습자 1명 도착 후만 의미)
3. **A6+ Coverage 100% 도전** (현재 95.5%, 잔여 4.5%는 unreachable error path)
4. **A8 (신규) regression-history 검색/필터** (6+ events 누적 후 사용성)

### Stage B — 본인 1-2h 결단
1. **B1 Cloud Run vocab-cat-test 배포** (runbook 준비됨)
2. **B2 EBS-demo Firebase config** (코드는 이미 wired)
3. **B3 Vercel custom domain** (선택, 도메인 보유 시)

### Stage C — 학습자 채널 의존 (이전 v1 backlog 활성화)
1. **P-3 Phonics 활성화** (페르소나 P1 정의 + reading-roadmap 재활성화) — 6주
2. **P-5 Teacher Dashboard** (페르소나 P2 + Supabase teacher role) — 8주
3. **P-1 W9+ Recommendation refinement** (외부 학습자 데이터로 ridge calibration) — 4주

### Stage D — 재평가 트리거 후 (Phase 3 후보)
1. **P-7 Neo4j re-evaluation** (학습자 ≥ 1000 또는 multi-hop 명시 요구 시)
2. **P-4 R/N hybrid mobile** (Phase 2 마지막 또는 Phase 3)
3. **P-6 AI Tutor conversational** (Rate limit + hallucination 정책 정립 후)

---

## 4. KPI (12주 측정)

### 4.1 자동 측정 (Claude 모니터링)
- K1: main 브랜치 CI green-streak (목표 ≥ 60일)
- K2: dogfooding 빈도 (월 4회+ 본인 또는 외부)
- K3: vocab-cat-test 통합 활성도 (smoke cron 4주 연속 PASS)
- K4: regression-history auto-append 비율 (100% — 이미 T1.2로 달성)

### 4.2 외부 의존 (본인 모집 활동)
- K5: 외부 학습자 누적 (1명 → 10명 목표)
- K6: 외부 응답 누적 (400 → 4000 응답)
- K7: 첫 PASS calibration 발생 시점 (KR2.1)

### 4.3 정성 (분기별 회고)
- K8: C2.1 Map 도메인 납득도 (본인 5점 척도) — Phase 2 진입 시점에 평가
- K9: C3.3 학습 ROI 4세션 (본인 또는 외부 평가)
- K10: 외부 학습자 만족도 (≥ 1명 가입 시)

---

## 5. 리스크 & 가설 검증

### R1 (높음): 학습자 채널 미확보 시 Phase 2 정체
- 가설: 본인의 EFL 전문가 네트워크에서 1-3명 dogfooding 모집 가능
- 검증: Phase 2 시작 4주 안에 ≥ 1명 확보 시도 (실패 시 P-3/P-5 보류, Stage A/B만 진행)
- 미달 시: phase2-backlog-v2 v3 (학습자 0명 영구 가정) 작성

### R2 (높음): 첫 외부 calibration 도달 지연
- Stage C 시뮬레이션 forecast: 외부 50% 비율 = 1600 응답 = 학습자 4명 × 40 sessions
- 본인 환경에선 4명도 어려울 수 있음
- 미달 시: simulator 데이터 점진 제거 시점 추가 forecasting + λ 재조정

### R5 (낮음, 추가 2026-05-24): exploration policy의 long-run 임계 한계
- 발견: `maxSamplesToConsider=20` 고정값으로 N>200에서 balance 악화 (0.095 → 0.030).
  cold QTs가 cap에 도달하면 exploration 자동 중단 → warm QTs가 모든 후속 samples 흡수.
- 분석: [exploration-policy-long-run-analysis.md](../03-analysis/exploration-policy-long-run-analysis.md)
- 검증: 외부 학습자 N=200 누적 시 balance < 0.05인지 실측 확인.
- 미달 시: `findExplorationTarget`에 adaptive threshold (mean × 0.3) 적용.

### R3 (낮음, 정정 2026-05-23): D5_Usage 게이트 catch는 의도된 안전망 동작
- 3 cycle 모두 D5에서 over-declared 모순 검출 — **그러나 정량 분석 후 simulator 결함 아님**.
- 정정 발견 ([d5-bias-root-cause-analysis.md](../03-analysis/d5-bias-root-cause-analysis.md)):
  - 7개 QT에서 D5 derived = 0 (keyVariable mapping상 D5 단서 없음)
  - prior declared D5 ≈ 0.10 (안전 영역, borderline)
  - ridge 노이즈가 D5를 살짝 올리면 즉시 `declared ≥ 0.2 AND derived = 0` 트리거
- **결론**: 게이트가 의도대로 작동. simulator/weights 변경 불필요.
- 후속 트리거: 외부 학습자 데이터에서 D5 신호가 실측 시 keyVariable mapping 재검토.

### R4 (낮음): EBS-demo Firebase config 실패
- 가설: 본인 30분 후 config 가능 (코드는 이미 wired)
- 미달 시: EBSCriteriaEngineGenerator는 LocalPoolGenerator fallback으로 계속 작동 (영향 작음)

---

## 6. 단계별 마일스톤 (12주)

```
주차 1-2:  Stage B 외부 의존 해소 (Cloud Run + Firebase config)
         + 학습자 ≥ 1명 모집 시도

주차 3-6:  외부 학습자 monitoring (calibration 적용 X, 데이터 누적)
         + Stage A 자율 작업 진행 (trend UI 활성화 prep)

주차 7-10: 외부 학습자 ≥ 50% 비율 도달 시도
         + 첫 PASS calibration 가능성 등장 (KR2.1)
         + simulator D5 모델 수정 (R3)

주차 11-12: Phase 2 종료 평가
         + Phase 3 백로그 정리 (Stage D 항목 재평가)
```

---

## 7. Non-goal (Phase 2에서 안 하는 것)

- VR/AR 학습 — Phase 3+
- 자체 LLM 파인튜닝 — 데이터 ≥ 10000 응답 후
- 글로벌 확장 (L1 ≠ 한국어) — 한국 EFL P0/P1 검증 우선
- 소셜/경쟁 기능 — 학습 본질 흐림 위험
- Phase 2 P-7 Neo4j 마이그레이션 (이미 DEFER 결정)

---

## 8. Phase 2 종료 → Phase 3 진입 게이트

- Phase 2 KR ≥ 7/10 (10 KPI) 통과 시 Phase 3 시작
- 외부 학습자 ≥ 5명 확보 시 Stage D 항목 재평가
- 미달 시 Phase 2.5 (안정화 4주) 운영 후 재검토

---

## 9. 본 PRD의 위치

- phase2-backlog-v2.md는 백로그 (작업 우선순위)
- 본 PRD는 정식 Phase 2 헌장 (목표, KPI, 리스크)
- 두 문서는 짝. 백로그 변경 시 본 PRD §3 갱신.

---

## 10. 변경 이력
- 2026-05-23: 초기 작성 (Phase 1 v3 sprint 종료 + Stage C 시뮬레이션 직후)
