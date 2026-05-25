# CSAT Solution Project — 자산 지도

> **목적**: 수능영어와 교육과정 사이의 *괴리*를 해결하기 위해 누적된 5개 카테고리 · 60+ 레포의 자산을 한 곳에서 조망.
> **연관 자료**: [`LECTURE_CSAT_SKILL_MAP.marp.md`](LECTURE_CSAT_SKILL_MAP.marp.md) · [`PITCH_DECK.marp.md`](PITCH_DECK.marp.md) · [`SKILL_MAP_SLIDE_BRIEF.md`](SKILL_MAP_SLIDE_BRIEF.md) · [`SLIDES_GAP_TO_PROGRESS.md`](SLIDES_GAP_TO_PROGRESS.md)
> **마지막 갱신**: 2026-05-25

---

## 해결 사슬 — 5 카테고리의 단방향 데이터 흐름

```
③ 통제 도구 (어휘·코퍼스·기준)
      │  (자산 공급)
      ▼
② 생성 로직 ──→ ① 분석 도구 (STAX)
      │           │  (라벨링 피드백)
      ▼           ▼
   문항 풀 (44 유형 · 137,745 스캐폴딩 · 9,017 진단)
      │
      ▼
④ 진단 (IRT-CAT) ──→ θ 좌표 + 12 skill 마스터리
      │
      ▼
⑤ 로드맵 + 대시보드 ──→ 재진단 (루프 폐쇄)
```

## 카테고리 요약

| # | 카테고리 | 핵심 production | 산출 |
|---:|---|---|---|
| ① | 수능 문항의 **분석** | `stax-analyzer-hub`, `semantic_link_analyzer` | D1~D5 라벨링 · 그래프 표현 |
| ② | 수능 문항의 **생성 로직** | `EBS-demo` (current core), `usb_csat_mj_generator` | 44 유형 · 41 프롬프트 · 9 검증기 |
| ③ | 어휘 등 **통제 도구** | `vocabulary-db`, `phonics2csat` | 9,183 단어 · 39 micro-skill DAG |
| ④ | 개인의 **역량 분석** | `vocab-cat-test`, `level-test-pat` | 9,017 캘리브레이션 · CAT 15문항 수렴 |
| ⑤ | 맞춤 **로드맵 + 대시보드** | `oelp`, `vocab-learn-pat` | 진단·추천·5D 스캐폴딩·dogfooding 5 cycle |

---

## ① 수능 문항의 **분석** — STAX 기반

수능 지문·문항을 *측정 가능한 데이터*로 변환하는 분석 인프라.

| 레포 | 역할 | 상태 |
|---|---|---|
| **`stax-analyzer-hub`** | STAX-style 분석 도구 통합 Hub — 5개 도구를 read-only adapter pattern으로 묶음 | production |
| **`semantic_link_analyzer`** | 수능 지문의 *의미 연결*을 자동 측정 → D1~D5 난이도 자동 판정 엔진 | production |
| **`csat-graphdb-318`** | 수능 영어 기출문항 GraphDB 플랫폼 (PRD v2.0) — 565 문항 + 그래프 | production |
| **`csat-graphdb`** | Reusable Graph DB package for CSAT English | library |
| **`reading-text-analysis-pipeline`** | CSAT Reading Analysis Pipeline — Text → Knowledge Graph | active |
| **`graphdb-csat-reading`** | Streamlit 대시보드 (시험유형·문장길이·연결어 밀도 분석) | demo |
| **`audit-agent-variants-portable/profiles/smilepat`** | Gemini 키 연결 · CEFR/CSAT 검수 러너 (감사 프로필) | active |
| **`copyright-cleansing`** | 수능 교육 콘텐츠 저작권 안전 엔진 (분석 결과 배포의 전제) | production |

**산출**: 문항별 5차원 라벨링(D1~D5) + 그래프 표현 + 검수 리포트

---

## ② 수능 문항의 **생성 로직** 구현

LLM × 검증기로 *수능 적합* 문항을 자동 생성하는 파이프라인.

| 레포 | 역할 | 상태 |
|---|---|---|
| **`EBS-demo`** | AI-powered English Exam & Question Generation (2022 개정 교육과정, **ET-Craft current core**) | production |
| **`usb_csat_mj_generator`** | 수능 영어 문항 생성·자가개선 시스템 (web-app, dual Vercel 배포) | production |
| **`csat_itemgen`** | CSAT English Item Generator — LLM-based (Claude Code + VS Code) | active |
| **`csat_mj_generator`** | 문항 생성기 (legacy lineage) | legacy |
| **`CSAT-Connectedu-company`** | 수능 영어 문항생성기 (회사 라인) | legacy |
| **`csat_connectedu_company`** | 同上 (mirror) | legacy |
| **`aistudio_CSAT`** | AI Studio 기반 CSAT 생성 실험 | experimental |
| **`vocabulary_quiz_generator_datatable`** | vocabulary master data 기반 어휘문항 생성 | active |
| **`v0-suneung-mate-ai`** | v0 prototype — 수능 메이트 AI | prototype |

**산출**: 44 수능 유형 풀커버리지 · 41 프롬프트 라이브러리 · 9 검증기 · Issue Code 60+ 분류

---

## ③ 어휘 등 **통제 도구** 구현 (콘텐츠 좌표계)

학습 콘텐츠의 *난이도·범위·코퍼스*를 통제하는 기준 자산.

| 레포 | 역할 | 상태 |
|---|---|---|
| **`vocabulary-db`** | Korean English Education Vocabulary DB — **9,000+ 단어 × 58 속성** (마스터 자산) | production |
| **`vocab-master-system`** | Node.js + Express + SQLite 관리 도구 | active |
| **`vocab-master-demo`** | Demo Mode obfuscation + data protection | demo |
| **`csat-text-master`** | 수능 영어 주제별 통합 DB (콜로케이션 + 학습카드 + Phrasal + IRT) | production |
| **`csat-text-database`** | csat-database (legacy/snapshot) | legacy |
| **`csat-database`** | CSAT 데이터베이스 | legacy |
| **`csat-reading-text-db`** | reading 진단·학습 기반 DB (sheet ↔ RDB ↔ text-to-SQL ↔ ontology graph) | production |
| **`logicflow-corpus`** | 수능 영어 Processing Layer — *discourse-aware corpus infrastructure* | production |
| **`Korea-curri-standards-db`** | 한국 영어 교육과정 **성취기준 DB** (EFL 앱 생태계 기반) | production |
| **`csat-micro-skills`** | micro-skill 정의 (12 skill 좌표계 원천) | production |
| **`phonics2csat`** | K-12 영어 ontology — **6 layers · 39 micro-skills · prerequisite DAG** | production |
| **`reading-roadmap`** | EFL Reading Ladder — *파닉스→학술지문 7단계* Text DB | active |
| **`sentence-complexity-levels`** | 문장 복잡도 레벨 정의 | active |
| **`standard_template`** | 어휘·리딩 레벨 상관관계 테이블 | reference |
| **`word_family_maker`** | word family 생성 도구 | active |
| **`vocab_insight_analytics`** | google sheet 기반 vocabulary analytics | active |
| **`book-collector`** | 책 집필 도구 (지식 그래프 보조) — *용어가 보이면 개발이 보인다* | active |
| **`md-graph-db`** | D:\T7 + GitHub 마크다운 지식 그래프 탐색기 | production |

**산출**: 9,183 마스터 어휘 + 137,745 스캐폴딩 문항 + CEFR A1~C2 분할 + 39 micro-skill prereq DAG

---

## ④ 개인의 **역량 분석 도구** (진단)

IRT-CAT 기반으로 학습자 *현재 좌표*를 측정.

| 레포 | 역할 | 상태 |
|---|---|---|
| **`vocab-cat-test`** | IRT-based **Computerized Adaptive Vocabulary Diagnostic Test** (FastAPI + IRT CAT, **production dogfooding 본진**, Cloud Run 배포 완료) | production |
| **`level-test-pat`** | 6단계 영어 어휘 적응형 진단평가 (초·중·고·수능·토플·유학, Next.js 16) | production |
| **`irt-cat-engine`** | IRT-CAT engine — vocab DB + graph DB 기반 | library |
| **`irt-vocab9000`** | 9,000 어휘 IRT 진단 | active |
| **`irt_vocab9000_google`** | 同上 Google Sheets 연동 | active |
| **`cold_start_IRT_vocabtest`** | Cold-start IRT vocab test (warm-up 실험) | experimental |
| **`cold_start_IRT_vocabtest-`** | 동일 라인 (mirror) | experimental |
| **`adaptive_vocab_test_learn_9000`** | 적응형 어휘 테스트 9000 | active |
| **`adaptive-vocab-app`** | adaptive vocab app | active |
| **`v0-adaptivevocabulary-leveltest-app`** | v0 — adaptive level test | prototype |
| **`v0-lexiletest`** | v0 — Lexile 테스트 | prototype |
| **`v0_lexile_test_trajectory`** | v0 — Lexile 궤적 | prototype |
| **`english-vocabulary-app`** | AI-based diagnostic + 학습 app (Next.js 15 + Turso) | active |
| **`vocab-graph-app`** | vocab graph 시각화 | active |
| **`vocabularylist`** | vocabulary list 자산 | reference |
| **`test-html`** | vocab-test-html (legacy HTML 프로토타입) | legacy |

**산출**: 9,017 캘리브레이션 문항 · b ∈ [−3.00, +3.67] · CAT 15문항 수렴 · 12 skill θ 좌표

---

## ⑤ 맞춤화된 **학습 로드맵 + 대시보드**

진단 좌표 → 처방 → 콘텐츠 → 재진단의 *닫힌 루프*.

| 레포 | 역할 | 상태 |
|---|---|---|
| **`oelp`** | **Ontology English Learning Platform** — Phase 1 MVP (Diagnosis IRT-CAT + Ontology Map + Learning Queue) — **LogicFlow 생태계 hub** | production |
| **`vocab-learn-pat`** | LogicFlow **5D Learning Engine** (vocabulary-db reference impl, production dogfooding precursor) | production |
| **`csat-learning-app`** | 수능 영어 학습앱 MVP (sql.js + vanilla JS PWA · IRT 적응형 · Phrasal · Leitner 5-Box) | production |
| **`csat_voca_depth_learning`** | 수능 어휘 *심층* 학습 | active |
| **`5dimension_vocablearning`** | 5차원 어휘 학습 | active |
| **`5D-vocab-quiz`** | 5차원 어휘 퀴즈 | active |
| **`self_evolving_vocab_learning`** | 자가진화 어휘 학습 | experimental |
| **`csat-mastery`** | mastery layer | active |
| **`v0_self_evolving_vocab_sentencestructure`** | v0 — self-evolving 문장구조 | prototype |
| **`v0_word_family`** | v0 — 단어 가족 | prototype |
| **`v0_word_family_original`** | v0 — 단어 가족 (원본) | prototype |
| **`v0_twenty_questions_vocabulary`** | v0 — 20-questions 어휘 게임 | prototype |
| **`v0-english-learning-platform`** | v0 — 통합 학습 플랫폼 | prototype |
| **`v0-english-reading-trainer`** | v0 — reading trainer | prototype |
| **`v0_ontology_readingprogram`** | v0 — ontology reading 프로그램 | prototype |
| **`v0_discourse_markers_writing`** | v0 — 담화 표지 쓰기 | prototype |
| **`v0_snowball_writing`** | v0 — 스노볼 쓰기 | prototype |
| **`v0-hangman-google-sheet-db`** | v0 — hangman + Google Sheet | prototype |
| **`v0_personal_growth_journal`** | v0 — 성장 저널 | prototype |
| **`v0-github`** | v0 — github 통합 실험 | prototype |
| **`v0-data_table_schema-builder-app`** | v0 — 데이터 테이블 스키마 빌더 | prototype |
| **`v0--test-project`** | v0 — test project | prototype |
| **`Incidental-csat-ontolroji-reading-replit`** | Incidental learning solution for CSAT reading (replit) | active |
| **`Incidental-suneungdoghae-ontolroji-gibanhagseub-replit`** | 수능 독해 온톨로지 기반 학습 (replit) | active |
| **`korean-sat-vocabulary`** | 수능 영어 어휘 학습 도구 | active |
| **`ai-english-platform`** | AI 기반 영어 진단-맞춤학습 (**교사 중심 개별화 교육**) | active |
| **`hotelier-english`** | 호텔리어 영어 응대 훈련 (도메인 응용 사례) | active |
| **`writecraft-studio`** | writing 학습 스튜디오 | active |
| **`tesol-bkit`** | 강원도 영어교육 혁신 — **TESOL Connect Studio + bkit** (교사 지원 플랫폼) | active |
| **`Connect-HJ-1`** | Connect 시리즈 | active |
| **`TESOL-framework-Connect-5`** | TESOL framework Connect 5 | active |
| **`project-dashboard`** | Multi-project STATUS.md dashboard (Next.js + GitHub API) | production |
| **`myprojects`** | LogicFlow EdTech 생태계 **docs hub** (PRD·설계·분석·보고서 중앙화) | production |

**산출**: 진단·추천(top-5) · 5D × 3 step 스캐폴딩 · regression-history 6 events · dogfooding 5 cycles · 통합 회고

---

## 부속 도구·인프라 (전 카테고리 공통)

| 레포 | 역할 |
|---|---|
| **`apple`** | Apple Consortium Pitch (7-min) — 컨소시엄 파트너십 제안 자료 (PRIVATE) |
| **`illustration-studio`** | AI illustration generator (region-based natural-language editing, ebs-demo에서 분리) |
| **`manga-pat`** | manga 패턴 자산 |
| **`claude-config`** / **`claude-md`** / **`claude-design`** | Claude Code 운영·설정·디자인 |
| **`my-dev-sync`** | Dev environment sync across PCs |
| **`my-app-devlog-diary`** / **`mydev-diary`** / **`MyDev_Diary_Google`** / **`myfirstapp_dev_log`** / **`mydev_diary`** | 개발 일지 라인 |
| **`push-diary`** | git push 일지 |
| **`github-lecture`** | GitHub 활용 강의 자료 |
| **`efl-ai-hub`** | EFL AI Hub 통합 |
| **`langextract`** | LLM 기반 구조화 정보 추출 (fork) |
| **`level2-nlp-generationfornlp-nlp-05-lv3`** | NLP generation 학습 과제 |
| **`nlp-vocab-hwang`** | NLP vocab 협업 |
| **`data-harness-web`** | data harness web |
| **`stax-analyzer-hub`** ↔ **`oelp`** ↔ **`myprojects`** | 3대 hub의 cross-cutting 관계 |

---

## 성숙도·운영 현황 (2026-05-25 기준)

| 카테고리 | production | dogfooding | 비고 |
|---|---|---|---|
| ① 분석 | `stax-analyzer-hub`, `semantic_link_analyzer` | C4.1 게이트 발동 3건 + sampling 2건 | OELP `/regression-history` 6 events |
| ② 생성 | `EBS-demo` (current core), `usb_csat_mj_generator` | dual Vercel production 운영 | web-app-pi-ruby.vercel.app |
| ③ 통제 | `vocabulary-db` (9,183), `phonics2csat` (39 skill DAG) | 마스터 어휘 안정 · ontology v1.0 | 외부 학습자 CSV는 별도 레포 분리 정책 |
| ④ 진단 | `vocab-cat-test` (Cloud Run 배포 완료), `level-test-pat` | 9,017 캘리브레이션 완료 | dogfooding pass-4·5 (sampling 축) |
| ⑤ 로드맵 | `oelp` Phase 1 MVP (Next.js 16 + Vercel) | pass-1~5 완료 (D5 모순 정정 · exploration policy long-run) | dimension-mapping snapshot 수동 동기화 |

## OELP-side 자동 동기화 안내

`smilepat/oelp` 의 `tests/dimension-mapping-consistency.test.ts` 안 `DIM_MAPPING_SNAPSHOT` 상수가 본 레포 `docs/01-plan/dimension-mapping.md §1.2` 표의 *동결 복사본*. 본 문서 변경 시 OELP 측 snapshot도 같은 PR에서 갱신 — 단, 본 레포는 OELP CI에서 직접 fetch 불가하므로 **수동 동기화 약속**이다.

## 변경 이력

- **2026-05-25**: 본 문서 초기 작성. 60+ 레포 5 카테고리 매핑 (`LECTURE_CSAT_SKILL_MAP.marp.md` 강의 작업 후속).
