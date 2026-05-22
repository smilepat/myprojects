# OELP Phase 2 Backlog

> Forward-looking planning for [PRD MVP Phase 1](./prd-oelp-mvp-phase1.md) → Phase 2 transition
> Status: Draft (2026-05-22)
> Owner: smilepat
> Earliest start: 2026-08-14 (12주 MVP 종료 후) — depends on Phase 1 KPI 통과

---

## 0. 본 문서의 목적

Phase 1 종료 시점에 **무엇을 다음으로 할지 즉답할 수 있게** 한다. 베타 종료 후 의사결정이 흐려지면 그 사이에 자산이 식는다 (스킬·콘텐츠·학습자 모멘텀 모두).

설계 원칙:
- **백로그는 KPI 결과에 종속** — Phase 1 KR이 미달이면 해당 KR을 고치는 항목이 1순위로 자동 승격.
- **각 항목 ≤ 8주 추정** — 8주 초과 항목은 Phase 3로 이연.
- **기존 자산 우선** — 신규 빌드보다 [LogicFlow 생태계](https://github.com/smilepat/myprojects) 통합/리팩토링 우선.

---

## 1. Phase 2 진입 조건 (Entry Criteria)

Phase 1 종료 시점(Week 12) 다음을 충족해야 Phase 2 시작:

| 항목 | 기준 | 미달 시 |
|---|---|---|
| O1 KR1.1 | theta 편차 ≤ 0.3 (P90) | Phase 2 시작 보류, P-A1 최우선 |
| O3 KR3.3 | 4주 후 theta 향상 ≥ +0.2 | Phase 2 시작 보류, P-A0(콘텐츠 효과성 재검증) |
| R1 가설 | Spearman ≥ 0.5 | [csat-graphdb-318#5](https://github.com/smilepat/csat-graphdb-318/issues/5) 해결이 Phase 2 1순위로 승격 |
| 베타 retention | 7일 ≥ 30% | Phase 2 보류, 페르소나 재정의 |

**미달 항목이 2개 이상이면 Phase 2를 시작하지 않고 Phase 1.5 (안정화 6주) 운영**.

---

## 2. 백로그 (우선순위 동결, KPI-conditional reranking)

### P-A0. (조건부) 콘텐츠 효과성 재검증 — `예상 효과 4주, 진입 조건 R3.3 미달 시`
- 문제: 25분 세션 × 4주가 실제 theta를 못 올리면 룰엔진 문제가 아니라 콘텐츠 문제일 수 있다.
- 액션: csat-text-master 50지문 + vocabulary-db 9183 단어의 **난이도 calibration 검증** (b 파라미터 vs 베타 실제 정답률).
- 산출물: `docs/03-analysis/content-calibration-report.md` + b 파라미터 보정 PR.

### P-A1. (조건부) 진단 신뢰도 강화 — `예상 효과 3주, 진입 조건 R1.1 미달 시`
- 문제: 재진단 편차가 큼 → CAT 종료 조건(SE threshold) 또는 item pool 다양성 문제.
- 액션: SE threshold 강화 (0.30 → 0.25), item exposure rate 제한 도입.
- 의존성: `vocab-cat-test` 백엔드 수정 (사용자 본인 레포라 PR 직진 가능).

### P-1. AI Recommendation Engine (룰엔진 → 학습형) — `8주`
- 문제: Phase 1 룰엔진은 "약점 1개 + IRT b 매칭"으로 단순. 학습 ROI 최적화 부족.
- 액션:
  - Multi-armed bandit (Thompson sampling) for QuestionType 선택
  - Item-Skill 가중치 행렬을 [`dimension-mapping.md`](./dimension-mapping.md) 휴리스틱 → 베타 데이터 ridge regression으로 학습
  - 추천 SE 표시 ("신뢰도: 낮음/중간/높음")
- 의존성: [csat-graphdb-318#5](https://github.com/smilepat/csat-graphdb-318/issues/5) **완전 해결 필수**.
- 산출물: `docs/02-design/recommendation-v2.md` + 통합 PR.
- KPI 목표: O3 KR3.3 (theta 향상)을 +0.2 → +0.35로 상향.

### P-2. EBS-demo Content Generator 통합 — `6주`
- 문제: 콘텐츠 풀 한계 — csat-text-master 50지문이 12주 베타에서 소진 가능 (R4).
- 액션:
  - `EBS-demo` (Next.js 16 + Firestore + criteria-engine)의 문항 생성 API를 OELP 학습 큐에 연결.
  - **생성 항목은 즉시 게재 금지** — validator (`EBS-demo`의 9개 validator 재사용) 통과한 항목만 풀에 추가.
  - 생성된 항목의 IRT 파라미터는 cold-start로 b=0, a=1로 시작, 50회 응답 후 calibration.
- 산출물: `docs/02-design/content-generation-pipeline.md`.
- 리스크: LLM 생성 항목의 품질 일관성 — `EBS-demo` validator가 어떤 false positive/negative 율을 보이는지 베타 데이터로 측정 필요.

### P-3. Phonics 단계 활성화 — `6주`
- 문제: PRD 페르소나가 고2 1개로 좁혀져 있어 초/중등 시장 미커버.
- 액션:
  - [`reading-roadmap`](https://github.com/smilepat/reading-roadmap) 아카이브 해제 + Stage 1 (Phonics Readers 20편) 실제 데이터화.
  - 새 페르소나 P1 정의: "초등 4-6학년 EFL 시작 학습자".
  - D1_Form 차원에 phoneme-grapheme 매핑 sub-dimension 추가 (D1_Form.phonics).
- 의존성: P1 페르소나 인터뷰 5명 선행.
- 산출물: `docs/02-design/phonics-integration.md` + 새 페르소나 PRD addendum.

### P-4. Mobile (PWA → React Native) — `8주`
- 문제: 25분 세션이 데스크탑 가정 — 실제 학습자는 모바일 비중 높음.
- 액션:
  - 1차: PWA 최적화 (manifest, offline cache, push notification) — 2주.
  - 2차: React Native shell (Expo) + 웹뷰 하이브리드 — 6주.
- 의존성: Phase 1 베타 데이터에서 모바일 접근율 ≥ 40% 확인 시에만 R/N 진행. 미만이면 PWA만.
- 산출물: 별도 레포 `smilepat/oelp-mobile` (또는 oelp 본 레포 monorepo).

### P-5. Teacher Dashboard — `8주`
- 문제: B2B (학교/학원) 수익화 진입 필요.
- 액션:
  - 교사용 별도 인증 role (`teacher` claim in Supabase JWT).
  - 학급(class) 엔티티 + 학생 매핑 + 학급 단위 KPI 대시보드.
  - 21 keyVariables 노출 (PRD §B-3.2 keyVariables는 학습자 UI 비공개 정책 유지, 교사에게만).
- 의존성: Phase 1 베타 결과 데이터를 학원/교사 5명에게 시연 → 결제 의향 확보 후 진행.
- 산출물: `docs/02-design/teacher-dashboard.md`.

### P-6. AI Tutor (Conversational) — `8주`
- 문제: 학습자 incidental 학습 (지문 읽다가 모르는 부분 즉답).
- 액션:
  - 지문 viewer에서 "이 문장 설명" / "이 단어 한 줄 정리" 버튼.
  - 응답은 Gemini long-context로 지문 전체 + 학습자 5D 프로파일을 context로 주입.
  - 응답 길이 제한 (≤ 80자 1문장) — Tutor가 강의화되면 학습 시간 잠식.
- 의존성: Rate limit 정책 (Upstash) — `illustration-studio`의 패턴 재사용.
- 리스크: LLM hallucination — 답변 후 학습자 thumbs feedback 수집 + 부정 비율 모니터링.

### P-7. Neo4j 마이그레이션 평가 — `4주 (spike만)`
- 문제: Phase 1은 SQLite + 기존 graph store. P-1 (Recommendation v2)가 추천 정확도에서 단일 저장소 한계에 부딪힐 수 있음.
- 액션: 4주 spike — Neo4j 도입 비용 (호스팅 $/월, 운영 복잡도, 마이그레이션 시간) vs 정확도 개선 효과 측정.
- 결정 게이트: 정확도 개선 ≥ 10% AND 비용 ≤ $200/월일 때만 진행.
- 산출물: `docs/03-analysis/neo4j-spike-report.md`.

### P-8. Adaptive Curriculum (학습 경로 자동 생성) — `Phase 3 후보`
- 문제: 현재는 1세션 단위 추천. 8주~3개월 단위 학습 경로는 룰엔진 + LLM 결합 필요.
- 결정: Phase 3로 이연 (P-1, P-3 결과 필요).

---

## 3. 우선순위 산정 (DICE-lite)

각 항목을 (학습자 가치 × 자산 활용도 / 통합 비용)로 평가:

| 항목 | 학습자 가치 | 자산 활용도 | 통합 비용 | 점수 | 비고 |
|---|:-:|:-:|:-:|---|---|
| P-A0/A1 (조건부) | 9 | 10 | 4 | **22.5** | KPI 미달 시 자동 1순위 |
| P-1 Recommendation | 9 | 8 | 6 | **12** | R1 해결 필수 |
| P-2 EBS-demo 통합 | 8 | 10 | 5 | **16** | 콘텐츠 풀 확장 |
| P-3 Phonics | 7 | 7 | 7 | **7** | 시장 확장 |
| P-4 Mobile | 6 | 5 | 7 | **4.3** | 베타 모바일율 데이터 후 |
| P-5 Teacher | 8 | 4 | 8 | **4** | 수익화, B2B |
| P-6 Tutor | 6 | 6 | 7 | **5.1** | LLM 비용 변수 |
| P-7 Neo4j spike | 4 | 9 | 3 | **12** | spike만, 결정 게이트 |

**기본 시퀀스 (KPI 통과 가정)**: P-1 → P-2 → P-7 (spike) → P-3 → P-5 → P-4 → P-6.

---

## 4. 분기별 계획 (가정: Phase 1 KPI 통과)

```
2026-08 ┐
        │ Week 13-20: P-1 AI Recommendation (8w)
2026-09 │
2026-10 ┤
        │ Week 21-26: P-2 EBS-demo 통합 (6w)
2026-11 │
        │ Week 27-30: P-7 Neo4j spike (4w) → 결정
2026-12 ┤
        │ Week 31-36: P-3 Phonics 활성화 (6w) — 새 페르소나
2027-01 │
        │ Week 37-44: P-5 Teacher Dashboard (8w) — B2B 수익화 시점
2027-02 │
2027-03 ┤
        │ Week 45-52: P-4 Mobile (8w) — 베타 데이터 기반
2027-04 │
```

KPI 미달 시: 이 시퀀스 앞에 P-A0/A1를 4-6주 삽입 → 모든 일정 shift.

---

## 5. 자동 승격 룰 (Phase 1 종료 1주 전 적용)

Week 11에 KPI 중간 측정 → 다음 분기 진입 조건:

```
if R3.3 미달 → P-A0 1순위 승격, P-1 보류
elif R1.1 미달 → P-A1 1순위 승격, P-1 보류
elif retention < 30% → Phase 2 보류, 페르소나 재정의 워크숍 (1주)
elif 모든 KR 통과 → 시퀀스 그대로 진행
elif R1 (가중치 calibration) 미달 → P-1 보류, csat-graphdb-318#5 해결 우선
```

승격 룰이 트리거되면 본 문서를 commit으로 갱신, PRD에 그 결과 반영.

---

## 6. 비-목표 (Phase 2에서 안 함)

- **VR/AR 학습** — 시장 미성숙
- **자체 LLM 파인튜닝** — Phase 3 검토 (데이터 부족)
- **글로벌 확장 (영어 외 L1)** — Phase 3 검토 (한국 EFL 페르소나 P0/P1 검증 우선)
- **소셜/경쟁 기능** — 학습 본질 흐림 위험. 별도 가설 검증 후 결정.

---

## 7. 본 문서의 변경 정책

- Phase 1 진행 중에도 본 문서는 KPI 중간 측정 결과에 따라 갱신.
- Week 12 종료 1주 후 (Week 13 Monday)에 한 번 동결 → Phase 2 첫 항목 착수.
- 항목 추가는 PR + 사용자 단독 결재 (조직 1인이므로).
