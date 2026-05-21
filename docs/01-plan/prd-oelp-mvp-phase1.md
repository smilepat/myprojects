# OELP (Ontology English Learning Platform) — MVP Phase 1 PRD

> Plan file 역할: 사용자 초안 PRD 검토 + 실제 GitHub 자산 기반 개선 PRD 제안.
> 작성일: 2026-05-21 / Owner: smilepat / Scope: MVP Phase 1 (12주)

---

## Context (왜 이 PRD인가)

사용자는 GitHub `smilepat` 조직에 **47+개 레포로 분산된 LogicFlow 영어 교육 생태계**를 이미 구축했다. 초안 PRD("OELP")는 이 생태계를 "처음부터 만드는 신규 플랫폼"처럼 서술하고 있으나, 실제로는 다음이 **이미 존재**한다:

| 초안 PRD에서 "구축 대상"으로 기술한 자산 | 실제 GitHub 현황 |
|---|---|
| PHONICS_DB | `reading-roadmap` Stage 1 (Phonics Readers 20편, 아카이브-문서만) |
| VOCABULARY_DB | `vocabulary-db` (9,183 단어 × **58컬럼**, IRT a/b 파라미터, 137K 학습 문항) — 초안의 9컬럼 가정을 완전 초과 |
| CSAT_ITEM_DB | `csat-text-master` (SQLite, 50지문/774콜로케이션/40토픽) + `csat-graphdb-318` (565 기출문항) |
| ONTOLOGY_SKILL_DB | `csat-graphdb-318` 의 **10 QuestionType + 7 DistractorType + 21 keyVariables** ([상세](./dimension-mapping.md)) + `csat-micro-skills` (Python, 3단계 lexical/syntactic/semantic) |
| Learner Diagnosis Engine | `vocab-cat-test` (IRT 2PL/3PL, FastAPI, 162 pytest pass) |
| Recommendation Engine | `csat-graphdb-318` v4의 mastery/diagnostic 엔진 (진행 중, 가중치 버그 미해결) |
| AI Content Generator | `EBS-demo` (Next.js 16 + Firestore + criteria-engine) — `usb_csat_mj_generator`의 후속 |
| Visualization | `illustration-studio` (Gemini 3.1 + 9-zone region editing, Vercel 배포 완료) |

따라서 **OELP의 본질은 신규 구축이 아니라, 분산된 자산을 단일 학습 경험으로 통합하는 Unification Layer**다. 이를 명시하지 않으면 PRD는 (1) 이미 만든 것을 다시 만들고, (2) 실제 자산의 제약(아카이브된 레포, 진행 중인 버그, 5D 정의 충돌)을 놓친다.

또한 초안 PRD의 5D 정의(Phonics/Vocabulary/Sentence Parsing/Chunking/Inference/...)는 `vocab-learn-pat`이 이미 production으로 운영 중인 **다른 5D(D1_Form / D2_Meaning / D3_Context / D4_Network / D5_Usage)**와 **충돌**한다. PRD 단계에서 이 충돌을 해결하지 않으면 데이터 모델 정합성이 깨진다.

---

## Part A: 사용자 초안 PRD 검토 (Critical Review)

### A-1. 강점 (유지할 것)
- **온톨로지 철학**(역량은 연결되어 있다)은 명확하고 차별적. `csat-graphdb-318`의 microskill 의존성 그래프가 이를 이미 구현 중.
- **"AI는 생성보다 연결/분석에 사용"** 원칙은 `EBS-demo`의 criteria-engine + validator 구조와 일치 — 일관성 있음.
- **MVP Phase 1 우선순위(Diagnosis 중심)**는 합리적. 추천 엔진의 가중치 버그(`csat-graphdb-318` v4)가 미해결인 상황에서 진단을 먼저 잡는 것이 옳음.

### A-2. 치명적 갭 (반드시 수정)

**갭 1: 5D 정의 충돌**
- 초안 PRD: 5D = Phonics, Vocabulary, Sentence, Inference, Discourse (역량 layer)
- `vocab-learn-pat` (production): 5D = D1_Form, D2_Meaning, D3_Context, D4_Network, D5_Usage (어휘 처리 차원)
- `csat-micro-skills`: 3단계 = Lexical / Syntactic / Semantic (Task type)
- → 세 가지가 **다른 축**임. PRD에서 명시적 매핑 테이블 필요. (Part B 데이터모델 섹션에서 해결)

**갭 2: KPI/OKR 부재**
- 초안 PRD에는 "DAU", "mastery 진단 정확도", "추천 적중률" 같은 **정량 지표가 0개**. 12주 MVP로 무엇이 "성공"인지 측정 불가.

**갭 3: 추천 엔진 가중치 버그 무시**
- `csat-graphdb-318` v4의 알려진 문제: (1) mastery 수식 버그, (2) item-skill 가중치 1.0 균일화, (3) 정답률 백필 미완 — 초안 PRD는 이 위에 "AI Recommendation Engine"을 얹는다. **이대로면 추천 정확도가 무의미.**

**갭 4: Neo4j 도입 비용 누락**
- 초안 PRD는 Neo4j를 무비판적 채택. `csat-graphdb-318`은 이미 동작 중인 그래프 스토어가 있고(README상 v4까지 운영), 별도 Neo4j 도입은 **마이그레이션 비용 + 운영 인력 비용**이 발생. MVP Phase 1에서는 기존 스토어 재사용 권장.

**갭 5: 아카이브 자산 의존**
- `irt-cat-engine`(아카이브, 빈 레포), `usb_csat_mj_generator`(아카이브)는 초안 PRD가 인용했으나 **유지보수 불가**. 후속 레포(`vocab-cat-test`, `EBS-demo`)로 대체 명시 필요.

**갭 6: 페르소나/Job Story 부재**
- 학습자가 초/중/고/재수생/성인 EFL 중 누구인지 불분명. MVP scope를 잡으려면 **하나로 좁혀야** 함. (사용자 답변에서 페르소나는 후순위였으나, MVP scope 정의를 위해 최소 1개 primary persona 필수)

**갭 7: cold-start & 데이터 품질 리스크**
- 첫 사용자가 진단 데이터를 충분히 쌓기 전까지 추천이 동작하지 않는 문제 미언급. `csat-graphdb-318` v4의 정답률 백필 미완은 cold-start를 더 악화시킴.

### A-3. 부차적 개선 (선택)
- 17장 "Google Sheets → CSV → Turso/Supabase → Neo4j → LLM" 흐름은 이미 `vocabulary-db`(CSV+SQLite 완비)에서 거친 단계. **건너뛰고** 바로 SQLite + 기존 그래프 스토어 사용 권장.
- 11장 "데이터 흐름"의 "역량 추정 → ontology mapping → weakness detection"은 `vocab-cat-test`의 Fisher Information 기반 알고리즘과 직접 매칭 — PRD에서 알고리즘을 명시하면 모호성이 사라짐.

---

## Part B: 개선 PRD (MVP Phase 1, 12주)

### B-1. 제품 정의

**제품명**: OELP (Ontology English Learning Platform) — internal codename. 외부 브랜드는 LogicFlow 유지.
**한 줄 정의**: 분산된 LogicFlow 자산을 **단일 학습자 페르소나용 진단-처방 경험**으로 통합하는 웹앱.
**MVP Phase 1 범위**: 진단(Diagnosis) + 약점 시각화(Ontology Map) + Phase 1 학습 큐 — **추천/콘텐츠 생성은 Phase 2로 이연**.

### B-2. Primary Persona (1개로 좁힘)

**페르소나 P0: "수능 D-365 고2 학습자"**
- CEFR 추정: B1 ~ B1+ (편차 큼)
- 페인포인트: 어휘는 외웠는데 지문에서 막힘 → "왜 막히는지" 모름
- 측정 가능 행동: 주 3회 25분 세션, 모의고사 1회/월
- 선택 이유: `csat-graphdb-318`(수능 565문항) + `vocabulary-db`(IRT 137K) 자산이 가장 두꺼운 구간
- 비고: 초등(파닉스) 페르소나는 `reading-roadmap`이 아카이브 상태이므로 Phase 2로 보류

**Job Story (3개로 압축)**:
1. *"모의고사 점수가 정체될 때, 어떤 마이크로스킬이 약한지 정량적으로 보고 싶다."*
2. *"오늘 25분 학습 시간이 있는데, 가장 ROI 높은 단어 + 지문 한 묶음을 받고 싶다."*
3. *"단어 외우기가 지문 이해로 이어지지 않을 때, 그 연결을 시각적으로 추적하고 싶다."*

### B-3. 데이터 모델 (5D 충돌 해결)

OELP는 **3개 축**을 분리해서 모델링하며, 충돌 해결은 매핑 테이블로 한다.

```
축 A — 학습자 능력 차원 (vocab-learn-pat 5D, 유지)
  D1_Form / D2_Meaning / D3_Context / D4_Network / D5_Usage

축 B — QuestionType (csat-graphdb-318 10개, ground truth)
  목적/심경/주장/요지/주제/제목/빈칸추론/흐름무관/순서배열/문장삽입
  + keyVariables 21개 (purpose_indirectness, coherence_gap, ...)
  → 각 QuestionType은 축 A의 D1~D5에 가중치 매핑 ([dimension-mapping.md](./dimension-mapping.md) 참조)

축 C — DistractorType (csat-graphdb-318 7개, 오답 패턴 — secondary)
  부분일치/반대논지/과잉일반화/범위이탈/인과혼동/시제조건왜곡/유사어휘함정

축 C — 학습 콘텐츠 (reading-roadmap 7-stage, Stage 5~6만 MVP)
  Stage 5 Future/Careers (B2) + Stage 6 CSAT (B2+) 만 MVP 범위
```

**핵심 결정**: 초안 PRD의 5D(Phonics → Discourse)는 **축 B의 microskill 그룹화** 용도로 재정의하고, 축 A의 5D는 **어휘 차원**으로 분리 유지. **PRD 어휘집(Glossary)**에 이를 명시.

**스토리지 결정**:
- 관계형: `vocabulary-db`의 SQLite(`vocab_master.sqlite`) + `csat-text-master`의 SQLite(`csat_text_master.sqlite`) **그대로 사용**
- 그래프: `csat-graphdb-318` 의 기존 스토어 **그대로 사용** (Neo4j 신규 도입 보류)
- 진단 상태: `vocab-cat-test`의 FastAPI 백엔드 **재사용**
- 변경 시점: Phase 2에서 추천 정확도가 단일 스토어 한계에 부딪힐 때 Neo4j 마이그레이션 평가

### B-4. MVP Phase 1 기능 (3개로 압축)

**F1. 진단 (Diagnostic CAT)**
- 입력: 사용자 로그인 → 15~40문항 적응형 어휘 진단
- 엔진: `vocab-cat-test` IRT 2PL/3PL 그대로 임베드
- 출력: D1~D5 5D Radar (vocab-learn-pat 컴포넌트 재사용) + 10 QuestionType 예상 정답률 ([역추정 공식](./dimension-mapping.md#22-역추정-공식-진단--microskill))
- DoD: 동일 학습자 재진단 시 theta 변동 ±0.3 이내 (안정성)

**F2. Ontology Map (약점 시각화)**
- 시각화: 10 QuestionType 노드 + 21 keyVariables 자식 노드 + 의존성 엣지(`csat-graphdb-318`에서 가져옴)를 Cytoscape.js로 렌더
- 약점 노드를 색상으로 강조, 클릭 시 해당 스킬의 선행 microskill 강조
- DoD: 1초 이내 렌더, 노드 20개/엣지 50개 규모

**F3. 학습 큐 (Static, no AI recommendation yet)**
- 룰 기반: 가장 약한 마이크로스킬 1개 선택 → 해당 스킬에 매핑된 어휘 10개(IRT b가 학습자 theta+0.3 근처) + 지문 1개(`csat-text-master`에서 토픽/난이도 매칭) 묶음
- 알고리즘: Fisher Information이 아니라 단순 "Theta 매칭 + Random tie-break" — AI 추천은 Phase 2
- DoD: 25분 세션 1회 완수 가능한 큐 분량 확보, 동일 큐 재출제 방지

**Phase 1 비포함 (명시)**:
- AI Content Generation (`EBS-demo` 통합은 Phase 2)
- AI Recommendation Engine (`csat-graphdb-318` v4 가중치 버그 해결 전까지 보류)
- Teacher Dashboard / Adaptive Curriculum / Tutor Chat / Mobile
- Phonics 단계 (reading-roadmap 활성화 후 Phase 2~3)

### B-5. KPI / OKR (12주 측정)

**O1 — 진단의 신뢰성을 확보한다**
- KR1.1: 동일 학습자 2회 진단 theta 편차 ≤ 0.3 (P90)
- KR1.2: CAT 평균 종료 문항 수 ≤ 25 (현재 vocab-cat-test 평균치 유지)
- KR1.3: 진단 완료율 ≥ 70%

**O2 — 약점 시각화가 실제 학습 행동으로 이어진다**
- KR2.1: 진단 완료 → Ontology Map 열람률 ≥ 80%
- KR2.2: Map 열람 → 학습 큐 시작 전환율 ≥ 50%
- KR2.3: 7일 retention ≥ 30% (P0 페르소나 베타 50명 기준)

**O3 — 학습 큐의 ROI를 측정 가능하게 한다**
- KR3.1: 큐 완수율(25분 세션 기준) ≥ 60%
- KR3.2: 큐 내 어휘 10개 중 사후 즉시 회상 ≥ 6개 (Leitner box1 → box2)
- KR3.3: 4주 후 동일 마이크로스킬 재진단 theta 향상 ≥ +0.2 (Phase 1 효과성 가설)

**비-목표 지표**: DAU/MAU는 베타 단계에서 측정만 하고 목표값 설정 안 함 (50명 베타에서 의미 없음).

### B-6. 리스크 & 가설 검증

**R1 (높음): csat-graphdb-318 v4 가중치 버그가 마이크로스킬 추정을 오염** — tracking: [csat-graphdb-318#5](https://github.com/smilepat/csat-graphdb-318/issues/5)
- 가설: 가중치 1.0 균일화 상태에서도 학습자 ranking은 유지된다
- 검증: 12주차 베타 데이터로 microskill 점수와 모의고사 영역별 점수의 Spearman 상관 ≥ 0.5 확인
- 미달 시: Phase 2에서 가중치 calibration을 최우선 백로그로 승격

**R2 (높음): Cold-start — 첫 진단 25문항만으로 10 QuestionType 예상 정답률 추정이 부정확**
- 가설: CAT 진단 + microskill 매핑만으로 학습자가 "내 약점이 맞다"고 동의(주관적 일치도 ≥ 70%)
- 검증: 베타 50명 중 30명 대상 인터뷰 (Week 8)
- 미달 시: F2 출시 시 "예측 신뢰도 표시"(낮음/중간/높음) 추가

**R3 (중간): 5D 정의 충돌이 학습자 UI에서 혼동 유발**
- 가설: 학습자는 D1~D5(어휘)와 microskill(독해)을 별개 탭으로 분리하면 혼동하지 않는다
- 검증: 사용성 테스트 5명 (Week 6)
- 미달 시: 마이크로스킬을 5D 그룹화 라벨 1단계로 추상화

**R4 (중간): reading-roadmap이 아카이브 상태라 Stage 5/6 텍스트 공급이 부족**
- 가설: csat-text-master 50지문 + csat-graphdb-318 565문항이 12주 MVP 콘텐츠로 충분
- 검증: 50명 × 25분 세션 × 12주 = 약 6,000 문항 소비 예상. 565 + alpha로 커버.
- 미달 시: `efl-reading-trainer`(Vercel 배포 활성) 콘텐츠 import 라인 추가

**R5 (낮음): 사용자가 illustration-studio 시각화를 "재미"로 보고 학습 시간을 잃음**
- 시각화는 Phase 1에서 Ontology Map만 사용, illustration은 Phase 2로 이연 — 이 리스크는 Phase 1에서 자연 회피

### B-7. 의존성 & 재사용 모듈 (critical files)

| 모듈 | 출처 레포 | 재사용 방식 | 통합 비용 추정 |
|---|---|---|---|
| IRT CAT 백엔드 | `vocab-cat-test/` (FastAPI) | API 그대로 호출 | 낮음 (도커 컴포즈 추가) |
| 5D Radar 차트 | `vocab-learn-pat/src/components/GrowthRadar.tsx` | 컴포넌트 import | 낮음 |
| Leitner SR | `vocab-learn-pat/src/lib/spaced-repetition.ts` | 함수 단위 import | 낮음 |
| Vocabulary DB | `vocabulary-db/vocab_master.sqlite` | read-only 마운트 | 낮음 |
| Passage DB | `csat-text-master/csat_text_master.sqlite` | read-only 마운트 | 낮음 |
| Microskill 그래프 | `csat-graphdb-318` | API 호출 또는 export → 정적 JSON | 중간 (v4 진행 중이라 스키마 fix 필요) |
| Region viz (Phase 2) | `illustration-studio/lib/zone9.ts` | Phase 2까지 보류 | — |

### B-8. 기술 스택 결정 (초안 PRD에서 좁힘)

- **Frontend**: Next.js 16 (illustration-studio와 동일 메이저로 통일), Tailwind, Cytoscape.js, Chart.js
- **Backend**: FastAPI (vocab-cat-test 재사용), Node API는 도입하지 않음 — Next.js Route Handler로 충분
- **DB**: SQLite (vocabulary-db + csat-text-master) + 기존 graph store
- **Auth/Storage**: Supabase Auth (간단), Storage는 Phase 1에서 불필요
- **배포**: Vercel (Next.js) + Cloud Run (FastAPI) — 둘 다 사용자가 이미 보유 경험
- **드롭**: Neo4j(Phase 2 평가), Turso(불필요), Node.js app server(중복)

### B-9. 12주 마일스톤 (요약)

- W1~2: 페르소나 P0 인터뷰 5명 + 데이터 모델 확정 (5D vs microskill 매핑 테이블 동결)
- W3~5: F1 진단 통합 (vocab-cat-test 임베드 + 5D Radar)
- W6~8: F2 Ontology Map (Cytoscape + microskill 그래프 export)
- W9~10: F3 학습 큐 룰 엔진 + Leitner 통합
- W11: 베타 50명 모집 + 사용성 테스트
- W12: KPI 측정 + R1~R4 가설 검증 결과 정리 → Phase 2 백로그

---

## Verification (이 PRD가 실행 가능한지 확인하는 방법)

1. **자산 존재 검증** — 각 재사용 모듈을 직접 clone & build:
   - `gh repo clone smilepat/vocab-cat-test` 후 `docker compose up` → 162 pytest pass 확인
   - `gh repo clone smilepat/vocab-learn-pat` 후 `npm run dev` → 5D Radar 동작 확인
   - `gh repo clone smilepat/csat-graphdb-318` 후 v4 README 재확인 (가중치 버그 상태)
2. **데이터 정합성 검증** — `vocabulary-db/vocab_master.sqlite` 와 `csat-text-master/csat_text_master.sqlite` 의 lemma JOIN 가능성 확인 (sample 100 lemma 매칭률 ≥ 90% 목표)
3. **5D 매핑 동결 검증** — Week 2 종료 시점에 10 QuestionType × 5D 매핑 테이블이 markdown 1개 파일(`docs/01-plan/dimension-mapping.md`)로 존재 ✓ (2026-05-22 commit `d54439b`)
4. **KPI 측정 가능성 검증** — F1/F2/F3 각각에 대해 어떤 이벤트를 어떤 스키마로 로깅할지 Week 3 끝에 결정 (Supabase event table 1개로 충분)
5. **Cold-start 가설 검증** — Week 8 인터뷰 30명 결과를 별도 문서에 정리, R2 가설 통과 여부 명시

---

## 다음 액션 (Plan 승인 후)

1. 본 PRD를 `smilepat/myprojects` 또는 신규 레포 `smilepat/oelp` 의 `docs/prd-mvp-phase1.md` 로 commit
2. `docs/dimension-mapping.md` (5D × microskill 매핑) 초안 작성 — Week 2 deliverable
3. `csat-graphdb-318` v4 가중치 버그를 별도 issue로 link (Phase 1은 우회, Phase 2 최우선 처리)
4. 베타 50명 모집 채널 결정 (사용자의 기존 콘텐츠 채널 활용 가능 여부 확인)
5. Phase 2 백로그: AI Recommendation / EBS-demo 통합 / Phonics(reading-roadmap 재활성화) / Mobile / Tutor / Teacher Dashboard
