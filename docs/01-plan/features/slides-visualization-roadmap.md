# Visualization Roadmap — SLIDES_GAP_TO_PROGRESS

**Feature ID:** `slides-visualization-roadmap`
**Created:** 2026-05-18
**Status:** Active backlog
**Owner:** smilepat
**Related:** [SLIDES_GAP_TO_PROGRESS.md](../../../SLIDES_GAP_TO_PROGRESS.md), [slides-cohort-replacement.plan.md](slides-cohort-replacement.plan.md)

---

## 1. Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 현재 슬라이드에 19개 차트가 있으나, 일부 강력한 데이터 자산(시장 규모·경쟁 포지셔닝·유닛 이코노믹스·19×12 풀 매트릭스 등)이 표·텍스트로만 존재해 시각적 임팩트가 약함. |
| **Solution** | 데이터 가용성·임팩트·노력을 평가한 **시각화 백로그**를 유지하고, P1(즉시) → P2(중기) → P3(데이터 대기) 3단계로 순차 적용. |
| **Function · UX Effect** | 슬라이드별 차트 ID 추적, 빌드 파이프라인(Reveal.js + Mermaid) 그대로 활용, 신규 차트 추가 시 PR 단위로 리뷰. |
| **Core Value** | 슬라이드가 *말하지 않고 보여주는* 자료가 됨 → 투자자·교육청 컨텍스트에서 인지 부하 감소, 메시지 전달 속도 향상. |

---

## 2. Current Inventory — 19개 차트 (2026-05-18 기준)

```
Part 1 갭 인식         │ 1-A Lexile · 1-B 어휘 누적
Part 2 역량 괴리       │ 2-A 12 skill 갭 · 2-B B-03 네트워크 · 2-C Skill 영향력 ★
Part 3 진단            │ 3-A b_value 분포 · 3-B CAT flowchart · 3-C 4-mastery
Part 4 거리·로드맵      │ 4-A 선수관계 DAG · 4-B Recommender flowchart · 4-C 추천 막대 ★
Part 5 계량화된 학습   │ 5-A 자산 (7 항목) · 5-B step↔b_value · 5-C 2-Stage+9검증기
                       │ 5-D Issue Code 6 카테고리 · 5-E 운영 KPI
Part 6 Progress       │ 6-A Before/After · 6-B 마스터리 분포 · 6-C θ 곡선 · 6-D 닫힌 루프
요약                  │ 한 줄 요약 flowchart ★

★ = 최근 추가된 차트 (slides-visualization-data-driven-charts 커밋)
```

표·텍스트로만 남은 섹션: **1-C · 부록 데이터 출처**. 슬라이드 외부 자산(LECTURE_V2.md)에 차트화되지 않은 데이터 다수 존재.

---

## 3. Backlog — 우선순위별 정리

### Priority Legend
- **Effort:** S (15분 이내) / M (30분~1시간) / L (1시간+)
- **Impact:** 🌟 (High, 메시지 결정적) / 🌗 (Medium) / 🌑 (Low)
- **Data:** ✅ 실측 / 🟡 추정 또는 가공 필요 / 🔴 새 데이터 필요

---

### P1 — Quick Wins (즉시 가능, 데이터 ✅)

| ID | 슬라이드 위치 | 차트 유형 | 데이터 출처 | Effort | Impact |
|---|---|---|---|---|---|
| **VIZ-01** | 신규 **1-D** | TAM/SAM/SOM 피라미드 (또는 funnel 막대) | `LECTURE_V2.md` 슬라이드 20: 50만/연 학생 · 3만 교사 · 17개 교육청 | S | 🌟 |
| **VIZ-02** | 신규 **2-D** | 19 유형 × 12 skill 풀 히트맵 (Primary는 진한색, Secondary는 옅은색) | `csat-text-graph-maker/.../micro-skills.ts` `QUESTION_TYPE_SKILL_MAP` 전수 | M | 🌟 |
| **VIZ-03** | 신규 **3-D** 또는 5-B 보강 | IRT 캘리브레이션 Phase 1→2→3 timeline (Cold-Start → Empirical b → 2PL a 해금) | `md-graph-db/docs/IRT_CALIBRATION_GUIDELINE.md` | M | 🌗 |
| **VIZ-04** | 신규 **5-F** 또는 별도 비즈니스 섹션 | 단가 비교 막대 (인간 강사 8천~1만5천원 vs ET-Craft 85원, 100-180배) | `LECTURE_V2.md` 슬라이드 19 | S | 🌟 |
| **VIZ-05** | 신규 **5-G** | D5 모드 vs 인간 1:1 — 단가·도달빈도·일관성 3축 비교 (그룹화 막대) | `LECTURE_V2.md` 슬라이드 18 | S | 🌟 |
| **VIZ-06** | 신규 부록 또는 1-C 강화 | 4-axis radar: 학교 내신 vs 수능 (Bloom·시간·문항유형·D5) | `lecture_v2.md` 슬라이드 9 | M | 🌗 |
| **VIZ-07** | 신규 비즈니스 섹션 | 경쟁 포지셔닝 — 4 플레이어 × 5축 heatmap (★0–3 stars) | `LECTURE_V2.md` 슬라이드 20 | M | 🌟 |
| **VIZ-08** | 신규 마무리 | 마일스톤 timeline (2026.06 베타 → 2027 하반기 sLLM) | `LECTURE_V2.md` 슬라이드 21 | M | 🌟 |

### P2 — Mid-effort Enhancements (데이터 가공 필요, 🟡)

| ID | 슬라이드 위치 | 차트 유형 | 데이터 출처 | Effort | Impact |
|---|---|---|---|---|---|
| **VIZ-09** | 1-B 강화 | 9,183 단어 CEFR 분포 donut (A1~C2) | `md-graph-db/docs/DATABASE_ARCHITECTURE.md` `CEFR_Level_*.csv` (실측 카운트 필요) | M | 🌗 |
| **VIZ-10** | 3-A 강화 | 9,017 IRT 문항의 b_value 실제 분포 (현재는 개념적 분포 → 실측 히스토그램) | `vocab_master.sqlite` 쿼리 1회 | M | 🌟 |
| **VIZ-11** | 4-A 강화 | DAG에 학습자 mastery 색상 매핑 (현재 mastery 데이터 있으면 노드 색상 = mastery level) | `learnerMastery` (코호트 형성 후) | L | 🌗 |
| **VIZ-12** | 5-B 강화 | learning_step에 학습자 분포 bell curve 오버레이 | 가공 필요 — 학습자가 어떤 step을 풀고 있는지 집계 | M | 🌗 |
| **VIZ-13** | 5-D 보강 | 9 검증기 × 6 Issue Code 카테고리 Sankey (어느 검증기가 어느 코드를 발행하는가) | `usb_csat_mj_generator/PRD_IMPROVEMENT_2026.md` 매핑 | L | 🌗 |
| **VIZ-14** | 5-E 보강 | KPI 5종 radar (현재 vs 목표 spider chart) — 현재 단순 막대 → 다축 비교 | 同 5-E 데이터 | S | 🌗 |
| **VIZ-15** | 신규 6-E 또는 부록 | 4 mastery level 게이트별 학습자 비율 변화 (Sankey) | `learnerMastery` 코호트 시계열 | L | 🌟 |
| **VIZ-16** | 부록 | 레포 자산 sunburst (md-graph-db → docs → 137,745 / micro-skills.ts 등 계층) | 종합 | L | 🌑 |

### P3 — Aspirational / Data-pending (🔴 신규 데이터 또는 코호트 필요)

| ID | 슬라이드 위치 | 차트 유형 | 데이터 출처 | 트리거 |
|---|---|---|---|---|
| **VIZ-17** | 6-A 실측 교체 | Before/After 코호트 실측 막대 | `slides-cohort-replacement.plan.md` §8.4 트리거 | n≥30 페어드 코호트 |
| **VIZ-18** | 6-C 실측 교체 | θ 곡선 실측 | 同上 | 8주 코호트 형성 |
| **VIZ-19** | 신규 6-F | ROI 곡선 — 시간 투자(hr) × 등급 상승 quartile별 | 누적 학습 로그 | pilot 100명+ |
| **VIZ-20** | 신규 6-G | Skill 진단 마스터리 heatmap (학생 100명 × 12 skill, 색상 = score) | learnerMastery | pilot 학생 풀 |
| **VIZ-21** | 신규 비즈니스 | LTV / CAC / payback 곡선 | 운영 데이터 | 1단계 매출 발생 후 |
| **VIZ-22** | 신규 진단 | D5 진단 — 학생별 click pattern / hesitation 시각화 (heatmap or trajectory) | `learnerLogs` action·responseTimeMs 누적 | 풀이 로그 1만 건+ |

---

## 4. Sequencing — 권장 진행 순서

### Sprint 1 (즉시, ~2시간) — 비즈니스 메시지 보강

> 투자자 deck로서 가장 시급한 자산.

1. **VIZ-01** TAM/SAM/SOM (S, 🌟)
2. **VIZ-04** 단가 비교 100-180배 (S, 🌟)
3. **VIZ-07** 경쟁 포지셔닝 heatmap (M, 🌟)
4. **VIZ-08** 마일스톤 timeline (M, 🌟)
5. **VIZ-05** D5 모드 vs 인간 코칭 (S, 🌟)

→ 신규 슬라이드 5개 추가 → 총 슬라이드 35개 내외, 차트 24개.

### Sprint 2 (~1.5시간) — 시스템 깊이 강화

1. **VIZ-02** 19×12 풀 히트맵 (M, 🌟)
2. **VIZ-06** 학교 vs 수능 radar (M, 🌗)
3. **VIZ-03** IRT phase timeline (M, 🌗)
4. **VIZ-14** KPI radar (S, 🌗)

### Sprint 3 (~1시간) — 실측 데이터 1회 확보 가능 시

1. **VIZ-10** IRT b_value 실측 히스토그램 — `vocab_master.sqlite` 1회 쿼리
2. **VIZ-09** CEFR 어휘 donut — CSV 6개 카운트

### Sprint 4 — 코호트 형성 후 (Plan-B 재개)

VIZ-17, 18 (실측 교체) + VIZ-15, 19, 20 (새 시각화).

---

## 5. Data Dependencies — 한눈에

| 데이터 종류 | 상태 | 영향받는 VIZ |
|---|---|---|
| canonical 정의 (micro-skills.ts, GRADE1_TARGETS, QUESTION_TYPE_SKILL_MAP) | ✅ 즉시 | VIZ-02 |
| lecture 텍스트 (TAM, 단가, 경쟁) | ✅ 즉시 | VIZ-01, 04, 05, 06, 07, 08 |
| 운영 DB 1회 쿼리 (vocab_master.sqlite, CEFR CSV) | 🟡 1시간 작업 | VIZ-09, 10 |
| Issue Code × Validator 매핑 | 🟡 PRD 정독 후 가공 | VIZ-13 |
| production cohort (n≥30) | 🔴 트리거 대기 | VIZ-11, 12, 15, 17, 18, 19, 20 |
| 운영 매출·CAC 데이터 | 🔴 매출 발생 후 | VIZ-21 |
| 풀이 로그 1만건+ | 🔴 pilot 후 | VIZ-22 |

---

## 6. Success Criteria

| ID | Criterion |
|---|---|
| SC-VIZ-1 | Sprint 1 완료 시 비즈니스 메시지 5개 슬라이드 신규 차트 추가 (VIZ-01·04·05·07·08) |
| SC-VIZ-2 | 모든 신규 차트가 Mermaid + Reveal.js 빌드 파이프라인에서 정상 렌더 |
| SC-VIZ-3 | 추정·실측 라벨링 정책(Plan-B SC-B1)을 모든 신규 차트에 동일 적용 |
| SC-VIZ-4 | 각 VIZ-XX는 PR 단위 또는 묶음 커밋으로 추적되어 변경 사유가 보존됨 |
| SC-VIZ-5 | 부록 데이터 출처 매트릭스가 신규 차트 출처와 1:1 일치 (재현성) |

---

## 7. Risks

| Risk | Mitigation |
|---|---|
| 신규 차트 추가로 슬라이드 분량 과다 → 50분 강연 시간 초과 | Sprint 1은 비즈니스 deck 분리 빌드 가능 (다른 파일로 export) |
| Mermaid xychart-beta는 일부 차트 유형(radar, heatmap) 미지원 | radar는 다중 막대로 근사, heatmap은 색상 코딩 표로 대체 |
| LECTURE_V2의 단가·시장 데이터가 추정치 → 투자자 검증 시 출처 문의 | 슬라이드 각주에 "추정, 산출 근거 별도 첨부" 명시 |
| 코호트 데이터 형성 지연으로 P3 무기한 대기 | P3는 Sprint 4 시작 트리거(`learnerMastery` distinct uid 30+)로 자동화 |

---

## 8. Open Questions

- VIZ-01 TAM은 학생 수만 표시할지, B2C ARPU × 50만으로 매출 환산까지 표시할지? (투자자 deck이면 후자 권장, 보수적 가정 필요)
- Sprint 1을 별도 "investor mini-deck" 파일로 빌드할지, 현재 SLIDES_GAP_TO_PROGRESS.md에 통합할지? (분리 권장 — 청중 다름)
- Mermaid 외 다른 라이브러리(Chart.js, D3) 도입 검토 필요한가? (radar/heatmap 등 표현력 한계 시) → Sprint 2 시작 시 결정

---

## Sign-off

- [x] Roadmap drafted: 2026-05-18 (smilepat)
- [ ] Sprint 1 시작 승인 필요
- [ ] Sprint 4 트리거 조건 모니터링 (Plan-B SC-B와 연동)
