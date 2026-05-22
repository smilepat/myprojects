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

### B-5. 검증 기준 (2026-05-22 개정: 베타 모집 불가 반영)

**검증 전략 전환**: 사용자(smilepat) 환경 제약상 N≥10 EFL 학습자 베타 모집이 비현실적임이 확인됨 (2026-05-22). 본 섹션은 통계 KPI 대신 **dogfooding (본인+지인 1-3명) + 기존 LogicFlow 데이터 합성 검증** 기준으로 재작성. 구 KPI는 [§B-5-archive](#b-5-archive-deprecated-kpis) 참조.

**O1 — 진단이 기술적으로 안정 동작한다 (기능 + 합성)**
- C1.1: vocab-cat-test 162 pytest 그대로 통과 (회귀 0건). 이미 pass — Phase 1 통합 시 유지만 확인.
- C1.2: 본인 자가 진단 5회 → dimensionScores 변동이 동일 컨디션 가정 시 직관적 일관성 (1인 정성, 5점 척도). 5회 중 4회 이상 같은 weakDim 출현 시 통과.
- C1.3: **합성 검증** — level-test-pat의 기존 진단 결과 샘플(localStorage 또는 export) ≥ 5건을 OELP에 import → DiagnosticInput 컨트랙트 round-trip 무손실.

**O2 — 약점 시각화가 EFL 도메인 지식 관점에서 해석 가능하다 (1인 정성)**
- C2.1: 본인(EFL 콘텐츠 개발자) 도메인 지식 관점에서 본인 진단 결과의 weakDim → Ontology Map의 약점 QuestionType 매핑이 "납득 가능한가" 5점 척도 ≥ 4점.
- C2.2: Ontology Map 렌더 시간 ≤ 1초 (기계 측정).
- C2.3: 노드 클릭 → 선행 microskill 강조 동작이 [dimension-mapping.md §2 가중치](./dimension-mapping.md#2-매핑-테이블-5d--10-questiontype)와 일치하는지 spot-check 10건.

**O3 — 학습 큐 룰엔진이 의도대로 동작한다 (기능 + 1인 정성)**
- C3.1: 큐 생성 단위 테스트 — 입력 dimensionScores 5종 케이스에 대해 예상 QuestionType이 선택되는지 (코드 레벨 검증).
- C3.2: 어휘 10개의 IRT b가 학습자 theta ± 0.4 범위에 분포 (벡터 분포 측정).
- C3.3: 본인이 25분 세션 4회 직접 진행 → 큐 분량/난이도 적절성 정성 평가 일지. 4회 중 3회 "다시 할 의향 있음" 시 통과.

**O4 — 합성 검증 (Synthetic Validation, 베타 대체)**
- C4.1: dimension-mapping.md §2 가중치를 csat-graphdb-318 565문항의 keyVariables 분포와 cross-check. **휴리스틱과 실제 키변수 출현 빈도가 단조 대응** 시 통과 (예: D5_Usage 가중치 높은 QuestionType이 실제로 connective_density·discourse_marker 등을 더 많이 가짐).
- C4.2: vocabulary-db 9183 어휘의 IRT a/b 분포를 본인 theta 추정치 근방 ±0.4에서 sampling → 10단어 큐가 다양성 확보되는지 (lemma overlap < 30%).
- C4.3: 본인 + 지인 1-3명의 진단 결과를 D1~D5 5D Radar에 누적 → 차원 간 분산이 학습 진행 후 감소하는 정성 추세 관찰 (statistically meaningful이 아닌 trend-spotting).

**비-측정 항목 (의도적 drop)**:
- DAU/MAU, retention, P90, Spearman 상관 — 모두 N≥30 베타 가정. dogfooding으로는 무의미.
- 4주 후 theta 향상 (구 KR3.3) — 본인은 EFL 전문가라 학습 효과 측정 부적합. C4.3 trend-spotting으로 대체.

**핵심 게이트**: 위 12개 C 기준 중 9개 이상 충족 시 Phase 2 진입 검토. 그 외는 Phase 1.5 안정화로 전환.

#### B-5-archive (DEPRECATED KPIs)

> 베타 50명 가정 기반 원안. 2026-05-22 검증 전략 전환으로 비활성화. 향후 학습자 접근 채널 확보 시 재활성화 가능하도록 보존.

- ~~KR1.1: theta 편차 ≤ 0.3 (P90)~~ → C1.2로 대체
- ~~KR1.2: CAT 평균 종료 문항수 ≤ 25~~ → vocab-cat-test 기존 평균치 그대로 사용
- ~~KR1.3: 진단 완료율 ≥ 70%~~ → dogfooding 1인 환경에서 무의미
- ~~KR2.1/2.2/2.3: Map 열람률 / 큐 전환율 / 7일 retention~~ → 1-3명에선 통계 무의미, C2.1로 정성 대체
- ~~KR3.1/3.2/3.3: 큐 완수율 / 회상 6/10 / 4주 후 theta +0.2~~ → C3.3, C4.3로 대체

### B-6. 리스크 & 가설 검증

**R1 (높음): csat-graphdb-318 v4 가중치 버그가 마이크로스킬 추정을 오염** — tracking: [csat-graphdb-318#5](https://github.com/smilepat/csat-graphdb-318/issues/5)
- 가설: 가중치 1.0 균일화 상태에서도 dimension-mapping.md §2 휴리스틱 가중치가 csat-graphdb-318의 keyVariables 출현 빈도와 단조 대응한다
- 검증 (2026-05-22 개정): 통계 베타 → **합성 cross-check**. csat-graphdb-318 565문항의 keyVariables 분포를 추출 → §2 가중치 행렬과 Kendall tau 계산. tau ≥ 0.4 시 통과 (1인 dogfooding으로는 사용자 데이터 부족, 데이터-데이터 비교로 대체).
- 미달 시: Phase 2에서 가중치 calibration을 최우선 백로그로 승격 (전문가 패널 5인 도입 검토)

**R2 (높음): Cold-start — 첫 진단으로 10 QuestionType 예상 정답률 추정이 부정확**
- 가설: 본인(EFL 콘텐츠 개발자) 도메인 지식 관점에서 예측 weak QuestionType이 본인 실제 약점과 일치한다
- 검증 (2026-05-22 개정): 베타 30명 인터뷰 → **본인 자가 평가 + 지인 1-3명 retrospective 평가**. 자가 평가 5점 척도 ≥ 4점, 지인 평가 ≥ 3점 평균 시 통과.
- 미달 시: F2 출시 시 "예측 신뢰도 표시"(낮음/중간/높음) 추가 + N 누적 시 Phase 2에서 재검증

**R3 (중간): 5D 정의 충돌이 UI에서 혼동 유발**
- 가설: 별도 탭 분리 시 혼동 없음
- 검증 (2026-05-22 개정): 사용성 테스트 5명 → **본인 + 지인 1-3명 think-aloud**. 첫 사용 5분 내 "어디가 어휘이고 어디가 독해인지" 무리 없이 구분 시 통과.
- 미달 시: 마이크로스킬을 5D 그룹화 라벨 1단계로 추상화

**R4 (중간 → 낮음): 콘텐츠 풀 부족**
- 가설: dogfooding 규모(1-3명 × 4주 = 약 12 세션)에서 csat-text-master 50지문 + csat-graphdb-318 565문항은 **압도적으로 충분**.
- 검증: 산술 — 12 세션 × 큐당 지문 1개 = 12 지문 소비 vs 보유 50+565 = 615. 리스크 자연 해소.
- 미달 시: 해당 없음 (구 가정인 50명 × 12주 = 6,000 문항이 불필요해짐)

**R6 (신규, 중간): 합성 검증이 학습 효과 가설을 입증하지 못함**
- 문제: dogfooding + 합성 데이터로는 "OELP가 실제로 영어 실력을 올린다"는 핵심 가설은 검증 불가.
- 수용: **Phase 1은 학습 효과 입증을 목표로 하지 않음**. F1/F2/F3가 의도대로 동작 + 본인이 사용 가치를 느낌 = 통과. 학습 효과는 향후 학습자 접근 채널 확보 시 별도 phase에서 검증.
- 미달 시: Phase 2 진입을 보류하고 학습자 접근 채널 확보 (학원·교사 협력)를 선행.

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

### B-9. 12주 마일스톤 (2026-05-22 개정: 베타 제거)

- W1~2: 데이터 모델 확정 ✓ ([dimension-mapping.md](./dimension-mapping.md))
- W3~5: F1 진단 통합 (vocab-cat-test 임베드 + 5D Radar) + 본인 진단 5회 (C1.2)
- W6~8: F2 Ontology Map (Cytoscape + microskill 그래프 export) + 본인 + 지인 1-3명 think-aloud (R3)
- W9~10: F3 학습 큐 룰엔진 + Leitner 통합 + 단위 테스트 (C3.1) + 본인 25분 × 4회 (C3.3)
- W11: 합성 검증 일괄 — C1.3 (DiagnosticInput round-trip), C4.1 (keyVariables cross-check, R1 Kendall tau), C4.2 (큐 다양성)
- W12: 12 C 기준 평가 + R1~R6 결과 정리 → [Phase 2 백로그](./phase2-backlog.md) 자동 승격 룰 트리거

---

## Verification (이 PRD가 실행 가능한지 확인하는 방법)

1. **자산 존재 검증** — 각 재사용 모듈을 직접 clone & build:
   - `gh repo clone smilepat/vocab-cat-test` 후 `docker compose up` → 162 pytest pass 확인
   - `gh repo clone smilepat/vocab-learn-pat` 후 `npm run dev` → 5D Radar 동작 확인
   - `gh repo clone smilepat/csat-graphdb-318` 후 v4 README 재확인 (가중치 버그 상태)
2. **데이터 정합성 검증** — `vocabulary-db/vocab_master.sqlite` 와 `csat-text-master/csat_text_master.sqlite` 의 lemma JOIN 가능성 확인 (sample 100 lemma 매칭률 ≥ 90% 목표)
3. **5D 매핑 동결 검증** — Week 2 종료 시점에 10 QuestionType × 5D 매핑 테이블이 markdown 1개 파일(`docs/01-plan/dimension-mapping.md`)로 존재 ✓ (2026-05-22 commit `d54439b`)
4. **검증 가능성 검증 (2026-05-22 개정)** — 이벤트 스키마는 dogfooding/합성 검증 범위로 축소 ([analytics-events.md](./analytics-events.md) v2 참조). 10개 이벤트 타입은 유지하되 KPI 측정용 → 본인 행동 로깅 + 합성 검증 입력용으로 용도 전환.
5. **Cold-start 가설 검증 (R2)** — Week 8에 본인 + 지인 1-3명 자가/타가 평가 일지 작성, [§B-6 R2](#b-6-리스크--가설-검증) 기준 충족 여부 명시.

---

## 다음 액션 진행 상황

1. ✓ PRD commit — [`docs/01-plan/prd-oelp-mvp-phase1.md`](./prd-oelp-mvp-phase1.md) (2026-05-21 `23276b6`)
2. ✓ Dimension mapping — [`docs/01-plan/dimension-mapping.md`](./dimension-mapping.md) (2026-05-22 `d54439b`)
3. ✓ 가중치 버그 tracking — [csat-graphdb-318#5](https://github.com/smilepat/csat-graphdb-318/issues/5) (2026-05-22)
4. ✓ Analytics event schema — [`docs/01-plan/analytics-events.md`](./analytics-events.md) (2026-05-22 `d51d172`)
5. ~~베타 50명 모집~~ → ✓ 비현실적임 확인 (2026-05-22). 검증 전략 dogfooding + 합성으로 전환 ([§B-5](#b-5-검증-기준-2026-05-22-개정-베타-모집-불가-반영))
6. ✓ Phase 2 백로그 — [`docs/01-plan/phase2-backlog.md`](./phase2-backlog.md) (2026-05-22 `bddc5a3`). 8개 항목 + KPI-conditional 자동 승격 룰 + 분기별 시퀀스
7. ✓ OELP 구현 레포 — [smilepat/oelp](https://github.com/smilepat/oelp) 신규 생성 (2026-05-22, public). README + .gitignore 완료. Next.js 16 스캐폴드는 implementation phase 시작 시 `npx create-next-app` 실행 예정. vocab-learn-pat이 Vite 기반이라 마이그레이션 비용이 컸기 때문에 신규 결정.

---

## Phase 1 진행 상황 요약 (2026-05-22)

**완료 (Plan 단계)**:
- PRD + dimension-mapping + analytics-events + phase2-backlog 4개 문서 (검증 전략 dogfooding 전환 반영)
- 가중치 버그 tracking 이슈
- OELP 구현 레포 생성 + README

**다음 단계 (Implementation)**:
- [ ] W3-5: F1 진단 통합 — vocab-cat-test 임베드 + 5D Radar 컴포넌트 import
- [ ] W6-8: F2 Ontology Map — Cytoscape.js + csat-graphdb-318 microskill 그래프 export
- [ ] W9-10: F3 학습 큐 룰엔진 + Leitner SR 통합
- [ ] W11: 합성 검증 일괄 (C1.3, C4.1, C4.2)
- [ ] W12: 12 C 기준 평가 + Phase 2 자동 승격 룰 트리거
