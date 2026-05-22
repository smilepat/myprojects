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

## 1. Phase 2 진입 조건 (Entry Criteria) — 2026-05-22 개정: 정성 게이트로 전환

**개정 배경**: 베타 50명 모집 불가 확인 ([PRD §B-5](./prd-oelp-mvp-phase1.md#b-5-검증-기준-2026-05-22-개정-베타-모집-불가-반영)). 통계 KPI 게이트는 무의미하므로 **정성 + 합성** 게이트로 치환.

Phase 1 종료 시점(Week 12) 다음을 충족해야 Phase 2 시작:

| 항목 | 신 기준 (2026-05-22) | 미달 시 |
|---|---|---|
| C1.2 (자가 진단 안정성) | 5회 중 4회 이상 같은 weakDim | P-A1 최우선 |
| C2.1 (Map 해석 가능성) | 본인 5점 척도 ≥ 4점 | P-A0 (가중치 재산정) |
| C4.1 (R1 합성 cross-check) | Kendall tau ≥ 0.4, 도메인 모순 0건 | [csat-graphdb-318#5](https://github.com/smilepat/csat-graphdb-318/issues/5) 해결 Phase 2 1순위 |
| 학습자 접근 채널 | (선택) 외부 학습자 ≥ 1명 가입 의향 확보 | Phase 2 신규 시장 항목(P-3/P-5)은 보류, 합성/단일 검증 가능 항목(P-1/P-2/P-7)만 진행 |

**미달 항목이 2개 이상이면 Phase 2를 시작하지 않고 Phase 1.5 (안정화 4주) 운영** — 베타 환경 부재로 안정화 기간은 6주 → 4주로 단축.

**원안 (DEPRECATED)**: theta P90/4주 향상/Spearman/retention 모두 N≥30 가정. 학습자 접근 채널 확보 시 즉시 부활 가능 (본 표 §1-archive 보존).

<details>
<summary>§1-archive (DEPRECATED 베타 가정 게이트)</summary>

| 항목 | 기준 | 미달 시 |
|---|---|---|
| O1 KR1.1 | theta 편차 ≤ 0.3 (P90) | Phase 2 시작 보류, P-A1 최우선 |
| O3 KR3.3 | 4주 후 theta 향상 ≥ +0.2 | Phase 2 시작 보류, P-A0 |
| R1 가설 | Spearman ≥ 0.5 | csat-graphdb-318#5 1순위 |
| 베타 retention | 7일 ≥ 30% | 페르소나 재정의 |

</details>

---

## 2. 백로그 (우선순위 동결, KPI-conditional reranking)

### P-A0. (조건부) 콘텐츠 효과성 재검증 — `4주, 진입 조건 C2.1 미달 시`
- 문제: dimension-mapping 가중치 산정이 본인 도메인 평가에서 모순이 발견되면 콘텐츠 난이도 자체를 의심해야 한다.
- 액션: csat-text-master 50지문 + vocabulary-db 9183 단어의 **합성 난이도 cross-check** — IRT b 파라미터와 본인이 풀어본 ≥30문항 retrospective 정답률의 단조성 검증.
- 산출물: `docs/03-analysis/content-calibration-report.md` + b 파라미터 보정 PR.

### P-A1. (조건부) 진단 신뢰도 강화 — `3주, 진입 조건 C1.2 미달 시`
- 문제: 본인 자가 진단 5회 중 weakDim 변동이 잦으면 CAT 종료 조건/item pool 다양성 문제.
- 액션: SE threshold 강화 (0.30 → 0.25), item exposure rate 제한 도입.
- 의존성: `vocab-cat-test` 백엔드 수정 (사용자 본인 레포라 PR 직진 가능).

### P-1. AI Recommendation Engine (룰엔진 → 학습형) — `8주`
- 문제: Phase 1 룰엔진은 "약점 1개 + IRT b 매칭"으로 단순. 학습 ROI 최적화 부족.
- 액션:
  - Multi-armed bandit (Thompson sampling) for QuestionType 선택
  - Item-Skill 가중치 행렬을 [`dimension-mapping.md`](./dimension-mapping.md) 휴리스틱 → **외부 학습자 데이터 누적 후** ridge regression으로 학습 (학습자 채널 확보 시점에 활성화)
  - 추천 SE 표시 ("신뢰도: 낮음/중간/높음")
- 의존성:
  - [csat-graphdb-318#5](https://github.com/smilepat/csat-graphdb-318/issues/5) **완전 해결 필수**
  - **외부 학습자 ≥ 5명 데이터 보유** (없으면 Thompson sampling 부분만 구현, 가중치 학습은 보류)
- 산출물: `docs/02-design/recommendation-v2.md` + 통합 PR.
- 효과 목표 (정성): 본인 평가에서 추천된 학습 큐가 "랜덤보다 약점 정조준" 5점 척도 ≥ 4점.

### P-2. EBS-demo Content Generator 통합 — `6주`
- 문제: 콘텐츠 풀 한계 — 학습자 채널 확보 후 사용량 증가 시 소진 위험 ([PRD R4](./prd-oelp-mvp-phase1.md#b-6-리스크--가설-검증) 재활성화 대비).
- 액션:
  - `EBS-demo` (Next.js 16 + Firestore + criteria-engine)의 문항 생성 API를 OELP 학습 큐에 연결.
  - **생성 항목은 즉시 게재 금지** — validator (`EBS-demo`의 9개 validator 재사용) 통과한 항목만 풀에 추가.
  - 생성된 항목의 IRT 파라미터는 cold-start로 b=0, a=1로 시작, **외부 학습자 50회 응답 누적 후** calibration.
- 산출물: `docs/02-design/content-generation-pipeline.md`.
- 리스크: LLM 생성 항목의 품질 일관성 — `EBS-demo` validator의 정확도는 본인 도메인 평가로 1차 측정 (sample 30문항), 외부 학습자 데이터는 2차.

### P-3. Phonics 단계 활성화 — `6주`
- 문제: PRD 페르소나가 고2 1개로 좁혀져 있어 초/중등 시장 미커버.
- 액션:
  - [`reading-roadmap`](https://github.com/smilepat/reading-roadmap) 아카이브 해제 + Stage 1 (Phonics Readers 20편) 실제 데이터화.
  - 새 페르소나 P1 정의: "초등 4-6학년 EFL 시작 학습자".
  - D1_Form 차원에 phoneme-grapheme 매핑 sub-dimension 추가 (D1_Form.phonics).
- 의존성: P1 페르소나 인터뷰 1-3명 (지인 자녀 등 접근 가능 범위) 또는 EFL 교사 전문가 의견.
- 산출물: `docs/02-design/phonics-integration.md` + 새 페르소나 PRD addendum.

### P-4. Mobile (PWA → React Native) — `8주`
- 문제: 25분 세션이 데스크탑 가정 — 실제 학습자는 모바일 비중 높음.
- 액션:
  - 1차: PWA 최적화 (manifest, offline cache, push notification) — 2주.
  - 2차: React Native shell (Expo) + 웹뷰 하이브리드 — 6주.
- 의존성: 본인 사용에서 모바일 우선순위가 있는지 + 향후 학습자 채널이 모바일 중심인지에 따라 결정. dogfooding만으로는 PWA로 충분, R/N은 외부 학습자 확보 후.
- 산출물: 별도 레포 `smilepat/oelp-mobile` (또는 oelp 본 레포 monorepo).

### P-5. Teacher Dashboard — `8주`
- 문제: B2B (학교/학원) 수익화 진입 필요.
- 액션:
  - 교사용 별도 인증 role (`teacher` claim in Supabase JWT).
  - 학급(class) 엔티티 + 학생 매핑 + 학급 단위 KPI 대시보드.
  - 21 keyVariables 노출 (PRD §B-3.2 keyVariables는 학습자 UI 비공개 정책 유지, 교사에게만).
- 의존성: 학습자 접근 채널 확보가 **선행 조건**. dogfooding 환경에서는 B2B 시연 콘텐츠가 부족하므로 본 항목은 사실상 외부 학습자 확보 시점에 활성화.
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

## 5. 자동 승격 룰 (2026-05-22 개정: 정성 게이트 기반)

Week 11에 12개 C 기준 ([PRD §B-5](./prd-oelp-mvp-phase1.md#b-5-검증-기준-2026-05-22-개정-베타-모집-불가-반영)) 중간 평가 → 다음 분기 진입 조건:

```
if C2.1 (Map 해석 가능성) 5점척도 < 4 → P-A0 1순위 승격, P-1 보류
elif C1.2 (자가 진단 안정성) 5/5 중 4 미만 → P-A1 1순위 승격, P-1 보류
elif C4.1 (R1 합성 cross-check, Kendall tau < 0.4) → P-1 보류, csat-graphdb-318#5 해결 우선
elif 학습자 채널 0명 → 시장 확장 항목 (P-3 Phonics, P-5 Teacher) 보류, 합성 검증 가능 항목만 (P-1/P-2/P-7) 진행
elif 모든 C 기준 9/12 통과 → 시퀀스 그대로 진행
```

승격 룰이 트리거되면 본 문서를 commit으로 갱신, PRD에 그 결과 반영.

**원안 (DEPRECATED)** — 베타 KPI 기반 룰은 학습자 채널 확보 시 §1-archive와 함께 부활 가능하도록 보존 중.

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
