# Phase 2 W{N}-W{N+3} Chunk-End Report (TEMPLATE)

> 이 파일은 4주 단위 chunk-end report 양식. 사용 시:
> 1. 파일명 변경: `_template-...` → `phase2-w{N}-w{N+3}-chunk-end.md`
> 2. {N} placeholder를 실제 주차로 (예: W1-W4, W5-W8, W9-W12)
> 3. 각 §에 4주 데이터 채우기
> 4. 본 template 자체는 commit에 그대로 유지

---

# Phase 2 W{N}-W{N+3} Chunk-End Report

> 작성: YYYY-MM-DD (4주 chunk 종료 직후)
> Phase 2 PRD: [prd-oelp-mvp-phase2.md](../01-plan/prd-oelp-mvp-phase2.md) §6 마일스톤
> Stability v2: [stability-roadmap-v2.md](./stability-roadmap-v2.md) §5.1 chunk 정책
> Status: ✅ / ⏳ / ❌ — chunk 결과

---

## 0. 한 줄 요약

W{N}-W{N+3} 동안 {핵심 진행 사항}. 다음 chunk 진입 조건 {O/X}.

---

## 1. KPI 측정 (Phase 2 PRD §4)

### 1.1 자동 측정 (K1-K4)
| KPI | 임계 | 측정값 | 상태 |
|---|---|---|---|
| K1: main CI green-streak | ≥ 60일 | __ 일 | ✓/✗ |
| K2: dogfooding 빈도 | ≥ 4회/월 | __ 회 | ✓/✗ |
| K3: vocab-cat-test smoke pass | 4주 연속 | __ /4 | ✓/✗ |
| K4: regression-history append 비율 | 100% | __% | ✓/✗ |

### 1.2 외부 의존 (K5-K7)
| KPI | 임계 | 측정값 | 상태 |
|---|---|---|---|
| K5: 외부 학습자 누적 | ≥ 1명 (W4) / ≥ 5 (W8) / ≥ 10 (W12) | __ 명 | ✓/✗ |
| K6: 외부 응답 누적 | 400 / 2000 / 4000 | __ 응답 | ✓/✗ |
| K7: 첫 PASS calibration 발생 | (chunk 내 1회) | YYYY-MM-DD or N/A | — |

### 1.3 정성 (K8-K10)
| KPI | 본인 평가 (5점 척도) |
|---|---|
| K8: C2.1 Map 도메인 납득도 | __ /5 |
| K9: C3.3 학습 ROI 4세션 | __ /5 |
| K10: 외부 학습자 만족도 | __ /5 (해당 시) |

---

## 2. 백로그 진행 (phase2-backlog-v2)

### 2.1 Stage A (Claude 자율) 완료 항목
- [ ] 항목 1
- [ ] 항목 2
- ...

### 2.2 Stage B (본인 결단) 완료 항목
- [ ] T5.1 Cloud Run 배포
- [ ] T5.2 EBS Firebase config
- ...

### 2.3 Stage C (학습자 채널) 진입 여부
- 학습자 ≥ 1명 확보: ✓/✗
- P-3 Phonics / P-5 Teacher Dashboard 시작 여부: ✓/✗

### 2.4 잔여 보류 항목
| 항목 | 보류 사유 |
|---|---|
| (예: P-3 Phonics) | (예: 페르소나 P1 인터뷰 1-3명 미확보) |

---

## 3. 안전망 활동 (Tier 1-4 + W9 exploration)

### 3.1 C4.1 게이트 발동 (이번 chunk)
| 이벤트 | 결과 | rollback? |
|---|---|---|
| (calibration trigger 1) | pass/fail | ✓/✗ |
| ... | | |

### 3.2 Test count + Coverage
| 시점 | tests | files | lines coverage |
|---|---:|---:|---:|
| chunk 시작 | __ | __ | __% |
| chunk 종료 | __ | __ | __% |
| Δ | +__ | +__ | +__pp |

### 3.3 P-1 W9 exploration policy 활동
- Exploration sessions (chunk 동안): __ 회
- Starved QTs 변화: __ → __
- posteriorBalance 변화: __ → __

---

## 4. 리스크 모니터링 (Phase 2 PRD §5)

| 리스크 | 발생 빈도 | 대응 |
|---|---|---|
| R1: 학습자 채널 미확보 | (예: 4주 모두 미확보 / 1명 확보) | (대응 또는 Plan B 진입) |
| R2: 첫 calibration 지연 | | |
| R3: D5 게이트 catch (의도 동작) | __ 회 | 정상 |
| R5: exploration policy long-run 한계 | (외부 N>200 시점만 의미 — chunk 초반엔 N/A) | — |

---

## 5. simulator 점진 제거 (stability v2 §3.3)

| 시점 | 외부 비율 | simulator 가중치 | 운영 |
|---|---|---|---|
| chunk 시작 | __% | __% | __ |
| chunk 종료 | __% | __% | __ |

---

## 6. 본 chunk의 핵심 발견

(예시 1) {외부 학습자 1명이 D2 weakness를 simulator preset과 다른 패턴으로 보임 → keyVariable mapping 재검토 필요}

(예시 2) {Cloud Run cold start가 15초 → AdaptiveDiagnostic UI 첫 응답 지연 — 본인이 always-warm 또는 keep-alive ping 검토}

---

## 7. 다음 chunk (W{N+4}-W{N+7}) 진입 조건

### 7.1 진입 가능 (KPI 7/10 통과 시)
- 진입 조건 1
- 진입 조건 2

### 7.2 미달 → Phase 2.5 안정화 4주
- 미달 항목 1: 보강 작업 (예: 학습자 모집 추가 4주)
- 미달 항목 2: 보강 작업

---

## 8. 본인 결단 잔여 (next 4주)

1. ☐ 항목 1
2. ☐ 항목 2

---

## 9. Claude 자율 가능 (next 4주)

1. ☐ 항목 1
2. ☐ 항목 2

---

## 10. 변경 이력
- YYYY-MM-DD: 본 chunk-end report 작성
