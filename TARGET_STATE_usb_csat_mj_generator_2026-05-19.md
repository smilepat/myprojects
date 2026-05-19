# 개선사항 완료 후 기대 결과 — usb_csat_mj_generator

**기준**: 2026-05-19 핸드오프 시점 ([HANDOFF_usb_csat_mj_generator_2026-05-19.md](HANDOFF_usb_csat_mj_generator_2026-05-19.md) §5의 P1~P5)
**작성**: 2026-05-19

---

## Executive Snapshot — "전부 완료 시" 한 화면

| Capability | 현재 (P0만 완료) | **P1~P5 완료 후** |
|---|---|---|
| 24문항 생성 성공률 | 100% | 100% |
| smilepat csat_strict 통과율 | 100% (overall mean 97.7) | **100% (overall mean ≥ 98.5)** |
| Blocking issues | 0 | 0 |
| DB의 options 컬럼 깔끔성 | 일부 JSON 문자열 | **전부 평문** |
| Distractor plausibility 최솟값 | 0.1 (item 11) | **≥ 0.4 보장** |
| 자동 재생성 게이트 | self-validator만 (3겹) | **+ smilepat audit (4겹)** |
| 품질 모니터링 | 없음 | 시간대·prompt version별 추세 + alert |
| Prompt iteration 주기 | 임시 | **데이터 기반, audit < 90 케이스 자동 수집** |
| Repo 상태 | archived (재작업 시 unarchive 필요) | 정책 결정 완료 (어느 시나리오든 명확) |

---

## P1 완료 후 — Normalizer 근본수정 (Issue #1)

### 직접 결과
- DB의 `option_1` ~ `option_5` 컬럼이 **항상 평문 한국어 문자열** ("`{"number":1,"text":"..."}`" 같은 JSON 문자열 0건)
- `answer` 컬럼도 항상 정수 또는 평문 (객체 0건)
- 일회성 마이그레이션 스크립트 실행 시: 기존 record 중 JSON 문자열로 저장된 N건 → 평문 N건 (Issue #1 머지와 동시)

### 파급 효과 (UI/검색/통계)
- 클라이언트 React Library 페이지에서 옵션이 한 줄 평문으로 깨끗하게 표시 (현재는 일부 record에 `{`로 시작하는 raw JSON 노출 위험)
- DB SQL 검색 (예: `LIKE '%도서관%'`)이 모든 record에서 일관 동작 — 현재는 객체로 저장된 record는 매칭 누락
- 차트·통계 (item_metrics) 집계 시 텍스트 길이·어휘 통계가 정확

### 회귀 보장
- `validators/grammar`, `validators/gap`, `validators/chart`, `validators/set` 가 평문 입력 가정으로 통일 → validator 자체 신뢰도 ↑
- toScalar fallback은 그대로 남아 있어 normalizer를 빠져나간 예외 케이스도 여전히 크래시 안 함 (2겹 방어)

### KPI
- DB 일관성: JSON-as-text columns = **0% (현재 ~33% 추정)**
- UI 렌더 깨짐: **0건 / 100문항** (수동 샘플링)
- Validator pass rate: 변동 없음 (이미 100%)이되 신뢰도 ↑

---

## P2 완료 후 — Distractor plausibility 강화

### 대상
이번 batch에서 D4 ≤ 90인 유형: item 11 (짧은 응답), item 14 (긴 대화), item 16 (강의 주제). 각 유형 prompt에 high-quality distractor 예시 5개 + plausibility ≥ 0.5 명시.

### 직접 결과
| 유형 | 현재 D4 | 현재 최저 plaus | **목표 D4** | **목표 최저 plaus** |
|---|---|---|---|---|
| item 11 | 75 | 0.1 | **≥ 90** | **≥ 0.4** |
| item 14 | 90 | 0.5 | **≥ 95** | **≥ 0.5** |
| item 16 | 90 | (~0.4) | **≥ 95** | **≥ 0.5** |

### 통계적 효과
- 전체 24문항 D4 평균: 92.3 → **≥ 95.0**
- Overall mean: 97.7 → **≥ 98.5**
- NFD (non-functional distractor) 케이스 빈도: 현재 5-6개/24 → **≤ 2개/24**

### 실제 사용성
- 학습자가 만나는 "너무 뻔한 오답"이 줄어 변별력 ↑ — KICE 출제 의도 (적정 정답률 30-70%) 안에 더 잘 들어옴
- 교사 출제 워크플로우에서 "이 선지는 빼야 함" 수정 빈도 감소

---

## P3 완료 후 — smilepat audit을 4번째 게이트로 통합

### 직접 결과
- 모든 신규 생성 문항이 **자체 validator (3겹) + smilepat csat_strict (4번째 겹)** 통과 후에야 OK 상태
- `item_metrics` 테이블 확장: `audit_score`, `audit_verdict`, `blocking_dims`, `distractor_plaus_array` 컬럼 추가
- `overall_score < 90` 또는 `blocking_issues.length > 0`이면 자동 재생성 (max retry 안에서)

### 운영 효과
- 사람 검수 부담 감소: 현재 95-100점 문항 100%가 자체 validator만으로 PASS인데 외부 audit으로 보면 75-100 분포 → 외부 audit 통합 후 출고 문항 평균 점수 **97.5 → 99+**
- 출제팀이 "최종 검수에서 빠꾸하는" 비율 추정 감소: 현재 ~10% → **≤ 2%**

### 비용
- 문항당 추가 Gemini 호출: ~$0.005 (csat_strict는 v2_dimensions 단일 호출)
- 통과 시 즉시 종료, 실패 시만 재생성하므로 평균 추가 비용 ≈ **$0.006 per item**
- 100문항 batch 추가 비용: ~$0.6 (현재 batch 비용 ~$2.0 대비 +30%)

### 데이터 자산화
- 모든 문항에 audit 메타데이터 동시 저장 → 향후 prompt iteration용 dataset 자동 축적
- "audit < 90인 케이스 50개"를 prompt 개선 입력으로 직접 활용 가능

---

## P4 완료 후 — Variance & Quality Monitoring

### 직접 결과 (대시보드)
- 시간대별 audit 점수 평균 추세 그래프 (model drift 감지)
- Prompt version별 audit 평균 비교 (`prompts_v2026-01-19.json` vs `v2026-05-19.json` 등)
- 동일 topic 3회 생성 시 σ > 5면 자동 alert (Slack/이메일 등)

### 의사결정 효과
- "이번 주 Gemini 모델이 평소보다 distractor 약함" 같은 drift를 24-48시간 안에 감지
- Prompt iteration의 성과를 정량적으로 보고 가능: "v2026-05-19에서 D4 평균 +3.2"
- 출제팀에 "오늘 생성 품질 신호" 한 줄 리포트 (현재 자체 validator pass/fail만 보고)

### 데이터
- 시간당 평균 처리량·통과율·평균 점수
- 유형별 점수 분포 boxplot (item 1-45)
- Prompt template별 성과 ranking

---

## P5 완료 후 — Archive 정책 결정

### 선택된 시나리오별 결과

**(a) 영구 archived 유지**
- Issue #1, P1~P4 모두 close → 이 repo는 readonly historical artifact
- 핸드오프 문서가 단일 진실 source: "Tier 3-B로 박물관화, 후속 작업은 없음"
- 자산: 이번 세션의 발견(F1~F4)은 다른 generator 프로젝트로 이식

**(b) 일시 unarchive로 P1·P2만 진행 후 다시 archive**
- main HEAD에 P1 normalizer + P2 prompt 강화 commit 2개 추가
- DB 일관성 + distractor 품질 두 영역만 완성도 ↑
- P3·P4는 포기 (Tier 3-B 자체가 "더 깊게 갈 가치 없음" 의미라면 합리적)

**(c) Tier 승격, archived 영구 해제**
- "이 repo가 production 핵심 도구로 격상" → P1~P4 full roadmap 진행
- Tier 3-B 라벨 → Tier 1 또는 Tier 2로 갱신
- 6-8주 개발 사이클 필요

**(d) v2 repo로 lineage 이전**
- `usb_csat_mj_generator-v2` 생성 → 이번 fix + P1~P4 + 더 큰 리팩터링 (예: Firestore 통합, 모노레포 정리)
- 이 repo는 그대로 archived로 유지, README에 v2 링크
- 가장 큰 effort지만 "백지에서 다시 잘 짜기"

### 권장 (이번 세션 관찰 기반)
**(b) 또는 (d).** Tier 3-B 라벨 자체가 "활발한 개발 영역 아님"을 의미하므로 (c)는 부담스럽고, (a)는 P1을 못 한 채 끝나서 아까움. P1·P2는 작은 effort라 (b)가 합리적이고, 더 큰 야망이라면 (d).

---

## Composite — 모두 완료 시 시스템의 모습

### 시나리오: 출제팀이 "수능 모의고사 1세트 (45문항) 생성" 요청
```
[현재]
1. Client → /api/items/generate/:id × 45회
2. 자체 validator 3겹 → 모두 PASS
3. 결과 노출 → 출제팀 수동 검수 → 약 4-5개 문항에서 "이 오답 너무 약함" 수정
4. 출고

[P1~P4 완료 후]
1. Client → /api/items/generate/:id × 45회
2. 자체 validator 3겹 → PASS
3. **smilepat csat_strict audit (4번째 겹) → 평균 99+ 자동 확인**
4. **overall < 90 or blocking 있는 ~2개 자동 재생성**
5. **DB에 음식 텍스트 + audit 메타데이터 깔끔하게 저장**
6. 결과 노출 → 출제팀 수동 검수 → 약 0-1개 문항에서만 미세 조정
7. **대시보드: "이번 batch 평균 99.1, item 11 D4=95 (이번 prompt iteration 효과)"**
8. 출고
```

### 정량 비교

| KPI | 현재 (P0) | P1 후 | P1+P2 후 | P1~P4 후 |
|---|---|---|---|---|
| 생성 성공률 | 100% | 100% | 100% | 100% |
| Overall mean | 97.7 | 97.7 | **98.5** | **99.1** |
| D4 (distractor) mean | 92.3 | 92.3 | **95.0** | **96.5** |
| Blocking issues | 0 | 0 | 0 | 0 |
| DB JSON-as-text records | ~33% | **0%** | 0% | 0% |
| 수동 검수 수정률 | ~10% | ~10% | ~5% | **≤ 2%** |
| Prompt drift 감지 | 없음 | 없음 | 없음 | **24-48h 안에** |
| 비용 per item | $0.02 | $0.02 | $0.022 | **$0.026** |
| 출고 평균 점수 | 97.5 | 97.5 | 98.5 | **99+** |

---

## 누가 무엇을 얻나 (이해관계자별)

### 출제팀
- **수동 검수 부담 50-80% 감소** — distractor 약한 문항을 사전 차단
- **출고 평균 품질 +1.5~+2점** — 학습자에게 더 변별력 있는 모의고사 제공
- **drift 발생 시 즉시 알림** — "오늘 만든 거 평소보다 어색하다" 직감을 데이터로 확인

### 운영팀 (smilepat 본인)
- **이번 발견(F1~F4)이 다른 generator 프로젝트로 이식 가능** — 일러스트 검수, 데이터 분석 보고서 검수 등
- **portable smilepat profile이 4번째 gate로 실전 검증됨** — 외부 도구가 아니라 핵심 인프라
- **prompt versioning이 데이터 기반** — 직감이 아니라 audit 평균 비교로 결정

### 학습자/사용자
- **출고 문항에서 "너무 뻔한 오답"·"근거 없는 오답" 거의 사라짐**
- **모의고사 변별력 ↑** — 잘 푸는 학생과 못 푸는 학생이 더 잘 구분됨

---

## 만약 P1만 하고 끝낸다면 (최소 ROI)
- 2-4시간 투자 → DB 일관성 + UI 안정성 확보
- 출고 품질 자체는 변화 없음 (이미 100% 통과)
- 다만 데이터 자산화의 기초 — 향후 prompt iteration 시 깨끗한 dataset 보유
- **P1 단독으로도 의미 있음. P2 이상은 선택.**

---

## 만약 P3까지 하면 (가장 큰 inflection point)
- P3는 "외부 audit을 운영에 내재화" — 이것 하나가 도구 → 인프라 전환점
- Audit < 90 케이스의 자동 재생성만으로도 출고 품질 +1.5점
- P4 모니터링은 P3가 만들어낸 audit 데이터를 가공만 하면 됨 → P3 완료 후 P4는 effort 50% 절감

---

## Risk / 가정

### 가정이 깨질 수 있는 지점
- **Gemini 모델 변경**: Pro 2.5에서 3.0 등으로 업그레이드 시 distractor 패턴이 바뀔 수 있음 → P4 monitoring이 일찍 잡아주면 ROI 높음
- **KICE 출제 기준 변경**: smilepat profile의 csat_strict variant도 같이 업데이트 필요 — `audit-agent-variants-portable` 측 작업
- **DB 마이그레이션 실패**: P1의 JSON-string → 평문 변환 중 데이터 손실 위험 → 백업 필수, dry-run 모드 권장

### Low-cost 안전망
- 모든 P1~P4 작업은 feature branch + PR로 진행 → 머지 전 회귀 테스트 (이번 세션의 24문항 batch + audit 그대로 활용)
- P5 결정 전까진 archive 유지 → 실수로 main 망가져도 영향 범위 제한

---

## 측정 가능한 마일스톤 (Definition of Done)

### P1 DoD
- [ ] `normalizer.js`에 `normalizeOption`, `normalizeAnswer` 함수 추가
- [ ] item 12, 13, 18, 19 유형 생성 시 DB의 `option_1` ~ `option_5`가 평문 (회귀 테스트)
- [ ] 기존 DB record 마이그레이션 스크립트 작성 + dry-run 결과 보고
- [ ] PR 머지

### P2 DoD
- [ ] item 11, 14, 16 prompt에 high-quality distractor 예시 + plausibility 가이드 추가
- [ ] 각 유형 5회 재생성 후 평균 D4 ≥ 95 확인
- [ ] Prompt version 메타데이터 업데이트 (`prompts_v2026-05-19.json`)

### P3 DoD
- [ ] `services/externalAudit.js` 작성 + `auditWithSmilepat()` export
- [ ] `itemPipeline.js`에 4번째 gate 통합, retry 로직 연결
- [ ] `item_metrics` 스키마 확장 (audit_score 등 컬럼)
- [ ] 100문항 회귀 테스트: 100% 통과, 평균 ≥ 98.5

### P4 DoD
- [ ] 대시보드 페이지 추가 (`/internal/quality-dashboard`)
- [ ] 시간대별·prompt version별 audit 평균 차트
- [ ] σ > 5 이상치 자동 alert (Slack webhook 또는 이메일)

### P5 DoD
- [ ] (a)~(d) 시나리오 중 선택 명시 (이 문서 § P5에 update)
- [ ] 선택 시나리오의 즉시 다음 단계 commit/PR

---

**작성**: 2026-05-19
**연관 문서**:
- [HANDOFF_usb_csat_mj_generator_2026-05-19.md](HANDOFF_usb_csat_mj_generator_2026-05-19.md) — 작업 내역 + P1~P5 개요
- GitHub Issue #1 — P1 실행 명세
