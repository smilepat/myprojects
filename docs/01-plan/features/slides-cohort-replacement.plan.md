# Plan — slides-cohort-replacement

**Feature ID:** `slides-cohort-replacement`
**Created:** 2026-05-18
**Author:** smilepat
**Phase:** Plan
**Related Files:** [SLIDES_GAP_TO_PROGRESS.md](../../../SLIDES_GAP_TO_PROGRESS.md), [LECTURE_V2.md](../../../LECTURE_V2.md)

---

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 투자자·강연용 슬라이드의 학습자 마스터리 수치 3곳(2-A 교과과정 도달, 6-A Before/After, 6-B·C 마스터리 분포·θ 곡선)이 정성적 진단에서 역추정한 **추정치**. 한 개라도 어긋나면 deck 전체 신뢰성에 직격타. |
| **Solution** | `csat-graphdb-318` / `ai-english-platform`의 `learnerMastery` + `learnerEvidence` 테이블에서 정의된 코호트로 평균을 산출해 슬라이드의 추정치를 **실측치**로 교체. n<10 칸은 추정 유지 + 라벨링. |
| **Function · UX Effect** | 슬라이드의 모든 수치 옆에 (n=…) 표기, 신뢰도가 낮은 구간(10–29)은 ⚠️ 주의표시. Marp 빌드 파이프라인(`slides_build/`)에 영향 없음 — 마크다운 텍스트만 교체. |
| **Core Value** | "데이터 회사"라는 포지셔닝의 일관성 — 슬라이드 5("계량화된 학습 경험")와 슬라이드 6("눈에 보이는 progress")의 메시지가 **자기 자신을 적용해서 측정한 결과**로 증명됨. |

---

## Context Anchor

| Key | Value |
|---|---|
| **WHY** | 추정 수치는 투자자 Q&A에서 "그 숫자 어디서 왔습니까?"에 즉답 불가 → 신뢰성 리스크. 데이터 회사가 자기 데이터를 안 쓴다는 모순 해소. |
| **WHO** | 1차: 본인(발표자) · 2차: 투자자·교육청 의사결정자 · 3차: 동료/공동창업자(향후 deck 유지보수자) |
| **RISK** | (a) `learnerMastery` 누적 표본이 적음 (cold-start 직후) (b) 코호트 정의 모호 시 cherry-picking 의심 (c) 학생 데이터 사용의 개인정보 처리 적정성 |
| **SUCCESS** | 슬라이드 2-A, 6-A, 6-B, 6-C의 모든 수치가 ① 실측치(n≥30) 또는 ② 명시적 라벨(추정·n표기)로 교체 + 부록 데이터 출처 갱신 |
| **SCOPE** | 마크다운 텍스트 교체 + 슬라이드 재빌드 + .gitignore. **제외:** 신규 슬라이드 추가, 차트 디자인 변경, 다른 deck(LECTURE_V2.md, PITCH_DECK.marp.md) 동시 수정 |

---

## 1. Requirements

### 1.1 Functional Requirements

| ID | Requirement | Acceptance |
|---|---|---|
| FR-01 | 슬라이드 2-A의 12개 "교과과정 도달치"를 **신규 가입자 첫 진단 평균** 코호트로 교체 | 모든 12 micro-skill (A-01~C-04) 평균 산출, 표 우측에 (n=X) 표기 |
| FR-02 | 슬라이드 6-A의 12 skill Before/After를 **개입 전(첫 진단) vs 8주 경과** 코호트로 교체 | 동일 학생 코호트의 페어드 평균 (drop-out은 분석 대상에서 제외) |
| FR-03 | 슬라이드 6-B의 마스터리 레벨 분포(3,9 → 4,8) 재계산 | 위 8주 코호트의 skill별 마스터리 레벨 카운트 합산 |
| FR-04 | 슬라이드 6-C의 θ 시간곡선(W0–W12) 재계산 | Rasch 척도 기준 평균 θ, x축은 실제 데이터 가용 구간으로 조정 |
| FR-05 | 모든 실측 수치 옆에 표본 크기 표기 `(n=X)` | 10–29 → ⚠️ / <10 → 추정 유지 + "추정" 라벨 |
| FR-06 | 슬라이드 부록(데이터 출처)의 ⚠️ 추정 주석 갱신 | 교체 완료 항목은 추정 주석에서 제거, 미교체 항목만 잔존 |

### 1.2 Non-functional Requirements

- **재현 가능성:** 산출 SQL(또는 API 호출)을 별도 파일 `docs/01-plan/features/slides-cohort-replacement.queries.sql`에 보존
- **개인정보:** 학생 PII는 산출 과정에서 사용 안 함, 평균값만 export
- **빌드 호환:** 기존 mmdc + marp-cli 파이프라인 그대로 사용

### 1.3 Out of Scope

- LECTURE_V2.md, PITCH_DECK.marp.md, PITCH_DECK.md의 동시 수정
- 슬라이드 디자인·테마·레이아웃 변경
- 신규 데이터 수집 인프라 구축 (기존 운영 DB에서만 산출)

---

## 2. Approach

### 2.1 High-level Steps

1. **데이터 가용성 점검** — `csat-graphdb-318`/`ai-english-platform` DB에서 `learnerMastery` 누적 row 수, 8주 이상 유저 수 확인
2. **코호트 쿼리 작성** — 각 슬라이드별 SQL 정의
3. **수치 산출 + 신뢰도 검증** — n≥30 / 10–29 / <10 구간으로 분류
4. **마크다운 교체** — `SLIDES_GAP_TO_PROGRESS.md`의 막대값·표값 치환
5. **재빌드** — `slides_build/`에서 mmdc → marp-cli 재실행
6. **부록 출처 갱신** — 데이터 출처 섹션에서 ⚠️ 추정 주석 정리

### 2.2 데이터 코호트 정의

| 슬라이드 | 코호트 | 측정 시점 | 산출값 |
|---|---|---|---|
| 2-A | 신규 가입 후 첫 진단 완료자 | 가입 7일 이내 | 12 skill 평균 마스터리 |
| 6-A | 첫 진단 ↔ 8주 후 재진단 완료 페어 | T=0, T=56일 | 12 skill 페어드 평균 (Before/After) |
| 6-B | 6-A와 동일 코호트 | T=56일 | skill별 MASTERY_LEVEL 카운트 |
| 6-C | 6-A와 동일 코호트 | W0–W12 | 주별 평균 θ (Rasch 척도) |

### 2.3 SQL 산출 스케치 (검증용)

```sql
-- FR-01: 신규 가입자 첫 진단 평균
SELECT skill_id, AVG(score) AS mean, COUNT(*) AS n
FROM learner_mastery lm
JOIN user_profiles up ON up.uid = lm.uid
WHERE lm.created_at <= up.created_at + INTERVAL 7 DAY
GROUP BY skill_id;

-- FR-02: 8주 페어드 코호트
WITH pairs AS (
  SELECT uid,
         MIN(measured_at) AS t0,
         MAX(measured_at) AS t1
  FROM learner_mastery
  GROUP BY uid
  HAVING DATEDIFF(MAX(measured_at), MIN(measured_at)) BETWEEN 49 AND 63
)
SELECT lm.skill_id,
       AVG(CASE WHEN lm.measured_at = p.t0 THEN lm.score END) AS before_mean,
       AVG(CASE WHEN lm.measured_at = p.t1 THEN lm.score END) AS after_mean,
       COUNT(DISTINCT p.uid) AS n
FROM learner_mastery lm
JOIN pairs p ON p.uid = lm.uid
WHERE lm.measured_at IN (p.t0, p.t1)
GROUP BY lm.skill_id;
```

실제 컬럼명은 `csat-graphdb-318/src/lib/db/schema.ts`의 `learnerMastery` 스키마 확인 후 확정.

---

## 3. Success Criteria

| ID | Criterion | Measurement |
|---|---|---|
| SC-01 | 12 skill × 4개 슬라이드 = **48개 수치**가 모두 처리 (실측 or 명시적 추정 라벨) | 슬라이드 정독으로 검증 — 라벨 없는 추정치 0개 |
| SC-02 | n≥30 코호트로 산출된 수치 비율 ≥ **50%** | 산출 결과 파일 통계 |
| SC-03 | 슬라이드 부록의 ⚠️ 추정 주석이 미교체 항목과 1:1 일치 | 부록 vs 본문 수동 cross-check |
| SC-04 | Marp HTML 재빌드 성공, 16개 차트 모두 정상 렌더링 | `SLIDES_GAP_TO_PROGRESS.html` 파일 크기 ≥ 400KB & 브라우저 로드 |
| SC-05 | 산출 SQL이 `docs/01-plan/features/slides-cohort-replacement.queries.sql`에 보존 | 파일 존재 확인 |

---

## 4. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 8주 페어드 코호트 표본이 너무 작음 (cold-start 단계) | 높음 | 중 | n<10이면 해당 칸은 "추정·n=X" 라벨로 잔존, FR-05 정책 적용 |
| 코호트 정의가 cherry-picking으로 해석될 위험 | 중 | 높음 | SC-05의 SQL 보존으로 재현성 확보, 부록에 코호트 정의 명시 |
| `learnerMastery` 스키마와 12 micro-skill ID 불일치 가능성 (`MICRO_SKILLS` Layer D 4개 제외 여부 등) | 중 | 중 | canonical = `csat-text-graph-maker/src/lib/logicflow/micro-skills.ts`, 매핑 검증을 Design 단계로 이월 |
| 실측치가 추정치보다 **나쁘면** 슬라이드 메시지 약화 | 낮음 | 높음 | 슬라이드 6의 메시지는 "좌표 이동의 가시화"이지 "큰 점프"가 아님 — 작은 이동도 진단 시스템의 가치를 입증함 |
| 학생 데이터 사용 적정성 (개인정보) | 낮음 | 높음 | NFR에 따라 평균만 export, PII 비포함 |

---

## 5. Timeline (Estimate)

| 단계 | 예상 소요 | 산출물 |
|---|---|---|
| Design | 30분 | `docs/02-design/features/slides-cohort-replacement.design.md` (스키마 매핑 + SQL 확정) |
| Do (데이터 산출) | 1시간 | `slides-cohort-replacement.queries.sql` + 산출 CSV |
| Do (마크다운 교체) | 30분 | `SLIDES_GAP_TO_PROGRESS.md` 수정 + 재빌드 |
| Check (gap-detector) | 15분 | `docs/03-analysis/slides-cohort-replacement.analysis.md` |
| Report | 15분 | `docs/04-report/slides-cohort-replacement.report.md` |
| **합계** | **약 2.5시간** | PR 1개 |

---

## 6. Dependencies

- **외부 레포 접근:** `csat-graphdb-318` DB(SQLite) 읽기 권한 또는 `/api/teacher/classes/[id]/analytics` API 호출 권한
- **로컬 도구:** mmdc, marp-cli (이미 설치 확인됨), node
- **다른 PDCA:** 없음 (독립 변경)

---

## 7. Open Questions for Design Phase

- `learnerMastery.measured_at` 컬럼 존재 여부? 없으면 `learnerEvidence.created_at` 집계로 우회
- Layer D 4개 (D-01~D-04) 측정 데이터가 있는지? 12-canonical(A+B+C)에 정렬됨 — 추가 검증 필요
- 8주(56일) 윈도우 외에 4주, 12주 옵션 비교가 필요한가? (Design 시 결정)

---

## 8. Data Availability Findings (2026-05-18) — Plan 보정

Design 단계 진입 전 데이터 가용성 사전 점검 결과, **원본 Plan의 FR-01~FR-04는 현 시점 실행 불가**로 판단됨. Plan-B로 전환.

### 8.1 점검 결과 (3개 레포 횡단)

| 레포 | 스키마 | 운영 데이터 | 결정 |
|---|---|---|---|
| `csat-graphdb-318` | `learnerMastery`, `learnerEvidence`, `diagnosticSessions`, `userProfiles` 모두 존재 | `demo-user` 하드코딩 16곳, seed-sample.ts는 지문만 시드 | 사용 불가 |
| `csat-mastery` | `learner_mastery`, `learner_evidence` (SQL 직접) | `visitor_id = "default"` MVP, "추후 Firebase Auth" 명시 | 사용 불가 |
| `efl-ai-hub` | `learner_evidence` | 동일 MVP 단계 | 사용 불가 |

### 8.2 스키마-Plan 가정 차이

| Plan 가정 | 실제 | 영향 |
|---|---|---|
| `learner_mastery.measured_at` 컬럼 | 미존재 — `updatedAt`만 있음 (rolling aggregate) | Before/After 직접 비교 불가 |
| 8주 페어드 코호트 추출 | `learnerEvidence`(events) 재생 필요 | mastery-engine 실행 + 시점별 스냅샷 구성 필요 |
| n ≥ 30 코호트 | production 학습자 사실상 0 | 산출 자체 불가 |

### 8.3 Plan-B (적용 결정)

| 항목 | 원본 Plan | Plan-B |
|---|---|---|
| FR-01 (2-A 도달치 교체) | 신규 가입 첫 진단 평균 | **deferred** — production n≥30 도달 시 별도 PDCA로 재개 |
| FR-02 (6-A Before/After) | 8주 페어드 평균 | **deferred** — 동일 |
| FR-03 (6-B 분포) | 8주 코호트 카운트 | **deferred** — 동일 |
| FR-04 (6-C θ 곡선) | 주별 평균 θ | **deferred** — 동일 |
| **FR-05 (라벨링)** | 실측 수치 옆 `(n=X)` | **즉시 실행** — 모든 추정 수치에 `(추정)` 라벨 |
| **FR-06 (부록 동기화)** | 미교체 항목만 ⚠️ 잔존 | **즉시 실행** — 부록에 코호트 정의·실측 대기 사실 명시 |

### 8.4 재개 트리거 (Reopen Conditions)

다음 조건 중 **하나라도 충족**되면 이 PDCA를 재개:

1. `csat-graphdb-318` 또는 `csat-mastery`의 production 배포 후 `learnerMastery`에 distinct `uid` 30+ 누적
2. 또는 baseline 진단을 완료한 demo·alpha 사용자 풀이 의도적으로 형성됨 (예: 학원·학교 pilot)
3. 또는 슬라이드 사용 일정(투자자 미팅 등)이 임박해 정성적 라벨로는 부족하다고 판단됨

### 8.5 Plan-B Success Criteria (Override)

원본 SC-01~SC-05를 다음으로 대체:

| ID | Criterion |
|---|---|
| SC-B1 | 슬라이드 2-A, 6-A, 6-B, 6-C의 모든 학습자 추정 수치에 `(추정)` 라벨 부착 — 라벨 누락 0개 |
| SC-B2 | 부록 "데이터 출처" 섹션에 §8 발견사항 + 재개 트리거가 명시됨 |
| SC-B3 | Marp HTML 재빌드 성공, 16개 차트 모두 정상 렌더링 |
| SC-B4 | Plan 문서가 §8을 포함한 상태로 커밋되어, 향후 재개 시 컨텍스트 손실 없음 |

---

## Sign-off

- [x] Plan reviewed by: smilepat (2026-05-18, original)
- [x] Plan-B amendment reviewed by: smilepat (2026-05-18, after data availability check)
- [x] Plan-B execution complete (label-first) — 2026-05-18
  - 2-A 하단 막대: "추정" 명시 + Plan §8.4 트리거 링크 부착 (`SLIDES_GAP_TO_PROGRESS.md`)
  - 6-A, 6-B, 6-C: 각각 ⚠️ 추정값 박스 부착
  - 부록: §"⚠️ 추정·보류 자료 (실측 대기 중)" 신설, 4개 슬라이드별 실측 산출 방법 명시
  - SC-B1~B4 모두 충족 (2-A·6-A·6-B·6-C 라벨 누락 0개, 부록 동기화, Marp HTML 재빌드 성공, Plan §8 보존)
- [x] Original FR-01~04 deferred until reopen trigger met (§8.4 참조)
