---
marp: true
theme: default
paginate: true
header: "CSAT Solution Project — 5 카테고리 60+ 레포 자산 지도"
footer: "smilepat · LogicFlow EdTech · 2026-05-25"
style: |
  section { font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif; padding: 56px 64px; }
  h1 { color: #0f172a; font-weight: 700; letter-spacing: -0.025em; }
  h2 { color: #0f172a; font-weight: 600; letter-spacing: -0.02em; border-bottom: 2px solid #2563eb; padding-bottom: 6px; }
  h3 { color: #475569; font-weight: 500; }
  strong { color: #2563eb; }
  em { color: #ef4444; font-style: normal; font-weight: 600; }
  blockquote { border-left: 4px solid #2563eb; background: #f1f5f9; padding: 10px 18px; color: #0f172a; font-size: 0.85em; }
  table { font-size: 0.78em; border-collapse: collapse; }
  th { background: #2563eb; color: white; padding: 8px 12px; font-weight: 600; }
  td { padding: 6px 12px; border-bottom: 1px solid #e2e8f0; }
  code { background: #f1f5f9; padding: 2px 6px; border-radius: 4px; color: #db2777; font-size: 0.9em; }
  section.lead { background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%); color: white; }
  section.lead h1 { color: white; font-size: 56px; }
  section.lead h3 { color: #bfdbfe; }
  section.lead strong { color: #fde047; }
  section.cat { background: #f8fafc; }
  section.cat h2 { color: #1e40af; border-bottom-width: 3px; }
  .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 0.7em; font-weight: 600; }
  .prod { background: #dcfce7; color: #166534; }
  .active { background: #dbeafe; color: #1e40af; }
  .exp { background: #fef3c7; color: #92400e; }
  .legacy { background: #f1f5f9; color: #64748b; }
  .footnote { color: #64748b; font-size: 0.7em; }
---

<!-- _class: lead -->

# What's Built

## CSAT Solution Project — **자산 지도**

### 60+ 레포 · 5 카테고리 · 4년 누적

<br>

**[수능영어와 교육과정의 괴리]를 해결하는** *맞물린 시스템*의 현재 상태

<br>

**근거 문서**: `csat-solution-project.md` ·  **연관**: `LECTURE_CSAT_SKILL_MAP.marp.md`

<!-- 발화: 강의에서 다룬 5단계 사슬이 실제 어디에 구현되어 있는지 — 자산 인벤토리. "이미 만들어진 것"을 5분에 보여줌. -->

---

## 왜 자산 지도가 필요한가

**경영자에게 자주 받는 질문 3가지:**

| 질문 | 답이 있는 슬라이드 |
|---|---|
| *"실제로 만들 수 있는 깊이입니까?"* | P-3 ~ P-7 (5 카테고리 각각) |
| *"production 수준입니까, 실험이 대부분입니까?"* | P-8 (성숙도 매트릭스) + P-9 (배포 현황) |
| *"신규 진입자가 따라올 수 있습니까?"* | P-10 (4년 누적의 volume metrics) |

> **이 덱의 명제**: 강의에서 *개념적*으로 보여준 4단계 사슬은
> *실측 가능한 60+ 레포의 작동 시스템*으로 이미 구현되어 있다.

<!-- 발화: 강의 후 자연스러운 follow-up — "그래서 뭘 만들었나요?" 답. exec 의사결정의 합리적 의심 3가지에 데이터로 답함. -->

---

## 해결 사슬 — **5 카테고리의 단방향 데이터 흐름**

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

| # | 카테고리 | 핵심 production |
|---:|---|---|
| ① | 수능 문항 **분석** | `stax-analyzer-hub` · `semantic_link_analyzer` |
| ② | 수능 문항 **생성 로직** | `EBS-demo` · `usb_csat_mj_generator` |
| ③ | **어휘 등 통제 도구** | `vocabulary-db` · `phonics2csat` |
| ④ | **개인 역량 진단** | `vocab-cat-test` · `level-test-pat` |
| ⑤ | **맞춤 로드맵 + 대시보드** | `oelp` · `vocab-learn-pat` |

<!-- 발화: 한 슬라이드로 전체 시스템 — 5 박스가 한 방향으로 연결됨. 다음 5장에서 박스별 상세. -->

---

<!-- _class: cat -->

## ① 수능 문항의 **분석** — STAX 기반

**역할**: 수능 지문·문항을 *측정 가능한 데이터*로 변환

| 레포 | 역할 | 상태 |
|---|---|---|
| **`stax-analyzer-hub`** | 5개 분석 도구 통합 Hub (read-only adapter) | <span class="badge prod">production</span> |
| **`semantic_link_analyzer`** | 의미 연결 자동 측정 → **D1~D5 난이도 판정** | <span class="badge prod">production</span> |
| **`csat-graphdb-318`** | 수능 기출문항 GraphDB 플랫폼 (565 문항) | <span class="badge prod">production</span> |
| **`reading-text-analysis-pipeline`** | Text → Knowledge Graph 파이프라인 | <span class="badge active">active</span> |
| `csat-graphdb` · `graphdb-csat-reading` · `audit-agent-variants` | 분석 라이브러리·대시보드·검수 러너 | 보조 |
| **`copyright-cleansing`** | 저작권 안전 엔진 (분석 배포 전제) | <span class="badge prod">production</span> |

**산출**: 문항별 5차원 라벨링(D1~D5) · 그래프 표현 · 검수 리포트
**dogfooding**: C4.1 게이트 발동 3건 + sampling 2건 (OELP `/regression-history` 6 events)

<!-- 발화: 분석 = 측정의 입구. STAX 통합 Hub가 5개 도구를 단일 진입점으로. moat = 565 문항 × 5차원 = 데이터 양과 깊이. -->

---

<!-- _class: cat -->

## ② 수능 문항의 **생성 로직**

**역할**: LLM × 검증기로 수능 적합 문항을 자동 생성

| 레포 | 역할 | 상태 |
|---|---|---|
| **`EBS-demo`** | AI Exam Generation (2022 개정 교육과정, **ET-Craft current core**) | <span class="badge prod">production</span> |
| **`usb_csat_mj_generator`** | 문항 생성·**자가개선 시스템** (dual Vercel 배포) | <span class="badge prod">production</span> |
| **`csat_itemgen`** | LLM-based 문항 생성 (Claude Code + VS Code) | <span class="badge active">active</span> |
| **`vocabulary_quiz_generator_datatable`** | 어휘문항 자동 생성 | <span class="badge active">active</span> |
| `csat_mj_generator` · `CSAT-Connectedu-company` · `aistudio_CSAT` | 생성기 lineage (legacy/experimental) | <span class="badge legacy">legacy</span> |
| `v0-suneung-mate-ai` | v0 prototype | <span class="badge exp">prototype</span> |

**산출**: **44 수능 유형 풀커버리지** · 41 프롬프트 라이브러리 · **9 검증기** · Issue Code 60+ 분류
**배포**: web-app-pi-ruby.vercel.app (dual Vercel production 운영)

<!-- 발화: 생성 = 콘텐츠 공급 무한. 9 검증기 + Issue Code 분류 = LLM hallucination 우려 정면 돌파. EBS-demo가 현행 코어. -->

---

<!-- _class: cat -->

## ③ 어휘 등 **통제 도구** (콘텐츠 좌표계)

**역할**: 학습 콘텐츠의 *난이도·범위·코퍼스*를 통제

| 레포 | 역할 | 상태 |
|---|---|---|
| **`vocabulary-db`** | Korean English Vocabulary DB — **9,000+ 단어 × 58 속성** | <span class="badge prod">production</span> |
| **`phonics2csat`** | K-12 ontology — **6 layers · 39 micro-skills · prereq DAG** | <span class="badge prod">production</span> |
| **`csat-text-master`** | 수능 영어 통합 DB (콜로케이션·학습카드·Phrasal·IRT) | <span class="badge prod">production</span> |
| **`csat-reading-text-db`** | sheet ↔ RDB ↔ text-to-SQL ↔ ontology graph | <span class="badge prod">production</span> |
| **`logicflow-corpus`** | *discourse-aware corpus infrastructure* | <span class="badge prod">production</span> |
| **`Korea-curri-standards-db`** | 한국 영어 **교육과정 성취기준 DB** | <span class="badge prod">production</span> |
| **`csat-micro-skills`** | 12 skill 좌표계 원천 정의 | <span class="badge prod">production</span> |
| **`md-graph-db`** | 마크다운 지식 그래프 탐색기 | <span class="badge prod">production</span> |
| 추가: `vocab-master-system/-demo` · `reading-roadmap` · `sentence-complexity-levels` · `word_family_maker` · `vocab_insight_analytics` · `book-collector` | 보조 통제 도구 | <span class="badge active">active</span> |

**산출**: 9,183 마스터 어휘 · 137,745 스캐폴딩 · CEFR A1~C2 분할 · 39 micro-skill prereq DAG

<!-- 발화: 통제 도구 = moat의 본진. 9,183 × 58 속성 매트릭스는 단순 단어장이 아닌 콘텐츠 좌표계. 신규 진입자가 가장 따라오기 어려움. -->

---

<!-- _class: cat -->

## ④ 개인의 **역량 진단** (IRT-CAT)

**역할**: IRT-CAT 기반으로 학습자 *현재 좌표*를 측정

| 레포 | 역할 | 상태 |
|---|---|---|
| **`vocab-cat-test`** | IRT-CAT Vocab Diagnostic (FastAPI, **Cloud Run 배포 완료**, dogfooding 본진) | <span class="badge prod">production</span> |
| **`level-test-pat`** | 6단계 적응형 진단 (초·중·고·수능·토플·유학, Next.js 16) | <span class="badge prod">production</span> |
| **`irt-cat-engine`** | IRT-CAT 엔진 (vocab DB + graph DB) | <span class="badge active">library</span> |
| **`english-vocabulary-app`** | AI diagnostic + 학습 app (Next.js 15 + Turso) | <span class="badge active">active</span> |
| `irt-vocab9000` · `irt_vocab9000_google` · `cold_start_IRT_vocabtest` · `adaptive_vocab_test_learn_9000` · `adaptive-vocab-app` | IRT 캘리브레이션·적응형 변형들 | <span class="badge active">active</span> |
| `v0-lexiletest` · `v0_lexile_test_trajectory` · `v0-adaptivevocabulary-leveltest-app` | v0 prototypes | <span class="badge exp">prototype</span> |

**산출**: **9,017 캘리브레이션 문항** · b ∈ [−3.00, +3.67] · CAT **15문항 수렴** · 12 skill θ 좌표
**배포**: Cloud Run (asia-northeast3) + Vercel 다중 환경

<!-- 발화: 진단 = 학습자 LTV의 핵심 metric. 9,017 캘리브레이션은 수년 누적 자산. GMAT·TOEFL과 동일 측정 계열. -->

---

<!-- _class: cat -->

## ⑤ 맞춤화된 **학습 로드맵 + 대시보드**

**역할**: 진단 → 처방 → 콘텐츠 → 재진단의 *닫힌 루프*

| 레포 | 역할 | 상태 |
|---|---|---|
| **`oelp`** | **Ontology English Learning Platform** Phase 1 MVP (LogicFlow hub) | <span class="badge prod">production</span> |
| **`vocab-learn-pat`** | LogicFlow **5D Learning Engine** (vocabulary-db reference) | <span class="badge prod">production</span> |
| **`csat-learning-app`** | 수능 학습앱 MVP (PWA · IRT 적응형 · **Leitner 5-Box**) | <span class="badge prod">production</span> |
| **`ai-english-platform`** | 진단-맞춤학습 (교사 중심 개별화) | <span class="badge active">active</span> |
| **`tesol-bkit`** | TESOL Connect Studio + bkit (강원도 교사 지원) | <span class="badge active">active</span> |
| **`project-dashboard`** | Multi-project STATUS 대시보드 | <span class="badge prod">production</span> |
| **`myprojects`** | LogicFlow EdTech 생태계 **docs hub** | <span class="badge prod">production</span> |
| 5D 학습: `csat_voca_depth_learning` · `5dimension_vocablearning` · `5D-vocab-quiz` · `self_evolving_vocab_learning` · `csat-mastery` | 학습 모드 변형들 | <span class="badge active">active</span> |
| Incidental + 도메인: `Incidental-csat-...` · `hotelier-english` · `writecraft-studio` · `korean-sat-vocabulary` | 도메인 응용 사례 | <span class="badge active">active</span> |
| v0 prototypes (10+) | UI/UX 실험 라인 | <span class="badge exp">prototype</span> |

**산출**: 추천(top-5) · 5D × 3 step 스캐폴딩 · **dogfooding 5 cycles** · regression-history 6 events

<!-- 발화: 로드맵 = 결제 conversion의 핵심. "측정 가능한 변화 시각화"가 retention. OELP가 hub, vocab-learn-pat이 production dogfooding precursor. -->

---

## **Production 배포 현황** — *작동 중인 시스템*

| 배포 | 환경 | 비고 |
|---|---|---|
| **`vocab-cat-test`** | Google **Cloud Run** (asia-northeast3) | FastAPI · IRT CAT 본진 |
| **`usb_csat_mj_generator`** | **Vercel** (dual production) | web-app-pi-ruby.vercel.app |
| **`oelp`** | Vercel | Next.js 16 · cloud-run-smoke CI |
| **`level-test-pat`** | Vercel | Next.js 16 · CAT 엔진 |
| **`csat-learning-app`** | PWA | sql.js + vanilla JS · 오프라인 가능 |
| **`EBS-demo`** | 운영 중 | ET-Craft current core |
| **`project-dashboard`** | Next.js + GitHub API | Multi-repo STATUS |

> **5개 이상의 production 환경** + **dogfooding 5 cycles** + **OELP `/regression-history`**.
> *프로토타입이 아닌 운영 시스템*.

<!-- 발화: production 5+ 배포 = 의심의 여지 없는 운영 자산. exec에게 가장 강력한 증거. -->

---

## **Volume Metrics** — 4년 누적의 깊이

```
9,183 단어 × 58 속성      [vocabulary-db 마스터 매트릭스]
  ──────────────────────────────────────────────────
  9,017 IRT 캘리브레이션 문항  [b ∈ −3.00 ~ +3.67]
  ──────────────────────────────────────────────────
137,745 학습 스캐폴딩      [9,183 × 5D × 3 step]
  ──────────────────────────────────────────────────
     44 수능 유형 풀커버리지 [LC 16 + RC 28]
     41 유형별 프롬프트 라이브러리 [224 KB · 버전 추적]
      9 모듈러 검증기       [common·grammar·gap·chart·listening·format·set]
  ──────────────────────────────────────────────────
     39 micro-skills + prerequisite DAG  [phonics2csat]
     12 수능 micro-skill 좌표계 [GRADE1_TARGETS 정규치]
     19 수능 유형 ↔ 12 skill 매핑 매트릭스
  ──────────────────────────────────────────────────
    47+ 통합 모듈 across 7 hub repos
    60+ 전체 레포 (production + active + experimental)
```

> **45,915번의 Gemini 2.5 Flash 호출** + **9 검증기 layered pipeline**.
> *한 사람 + AI = 4년에 도달한 깊이*. **솔로 + AI = 직원 30명 EdTech가 따라오기 어려운 구조**.

<!-- 발화: 숫자로 압도 — 한 페이지로 4년 누적의 크기. moat가 추상이 아닌 측정 가능한 깊이. -->

---

## **성숙도 매트릭스** — 카테고리 × 단계

| 카테고리 | production | dogfooding | 결과 |
|---|---|---|---|
| ① 분석 | `stax-analyzer-hub` · `semantic_link_analyzer` | C4.1 게이트 3건 + sampling 2건 | regression-history 6 events |
| ② 생성 | `EBS-demo` · `usb_csat_mj_generator` | dual Vercel production 운영 | web-app-pi-ruby.vercel.app |
| ③ 통제 | `vocabulary-db` · `phonics2csat` | 마스터 어휘 안정 · ontology v1.0 | 외부 학습자 CSV 분리 정책 |
| ④ 진단 | `vocab-cat-test` (Cloud Run) · `level-test-pat` | 9,017 캘리브레이션 완료 | dogfooding pass-4·5 (sampling) |
| ⑤ 로드맵 | `oelp` Phase 1 MVP (Next.js 16) | pass-1~5 완료 (D5 모순 정정 등) | dimension-mapping snapshot 동기화 |

> *모든 카테고리에 production 운영 + dogfooding 실측 사이클*.
> 부분 최적이 아니라 **5개 모두 작동 중**.

<!-- 발화: 5×3 매트릭스가 모두 채워져 있음 — 어느 한 카테고리도 비어있지 않음. 시스템의 완결성. -->

---

## **Cross-Cutting Hubs** — 세 개의 중심축

```
                  smilepat/myprojects
                  (docs hub · PRD·설계·분석·보고서 중앙화)
                          │
              ┌───────────┼───────────┐
              ▼           ▼           ▼
       smilepat/oelp   stax-analyzer-hub  vocab-cat-test
       (학습 플랫폼)    (분석 통합)        (진단 본진)
              │           │           │
              └───────────┼───────────┘
                          ▼
                  47+ 모듈 · 60+ 레포
                  (5 카테고리 통합 운영)
```

| Hub | 역할 |
|---|---|
| **`myprojects`** | LogicFlow EdTech 생태계 *docs hub*. 47+ 레포의 PRD·설계·회고를 중앙화 |
| **`oelp`** | *학습 플랫폼 hub*. IRT-CAT + Ontology Map + Learning Queue + regression-history |
| **`stax-analyzer-hub`** | *분석 통합 hub*. 5개 분석 도구를 read-only adapter로 단일 진입점화 |

> 세 hub가 분리된 *47+ 모듈*을 하나의 좌표계로 묶음.
> *단일 화면·단일 데이터·단일 흐름*의 운영 기반.

<!-- 발화: hub가 3개 — 분산된 자산을 한 좌표계로 통합. 솔로 개발자의 manageability를 만드는 구조. -->

---

## **What This Proves** — 경영자 관점 3가지 결론

### ❶ *측정 가능한 깊이*

> 9,183 단어 × 9,017 진단 × 137,745 스캐폴딩 = *moat의 정량*.
> "EdTech의 깊이"는 슬로건이 아니라 *측정되는 숫자*.

### ❷ *바이브 코딩의 실현 가능성*

> 솔로 + AI = 4년에 47+ 모듈 · 5+ production 배포.
> 빅테크 팀이 아니어도 도달 가능. **EdTech 신생 회사의 새 모델**.

### ❸ *맞물린 시스템의 차별화*

> 5 카테고리 모두 production + dogfooding 사이클.
> *부분 최적 솔루션*과 *완결된 좌표계*는 다른 카테고리의 제품.

<!-- 발화: 60초 클로저 — 3개 핵심 결론으로 압축. exec가 가져갈 의사결정 frame. Q&A 진입. -->

---

<!-- _class: lead -->

# 정리

## *측정 좌표계 → 분해 → 진단 → 처방*의 4단계 사슬,
## **60+ 레포로 이미 구현된 시스템**

<br>

**문서 원본**: [`csat-solution-project.md`](csat-solution-project.md) (217줄, 60+ 레포 매핑)

**관련 자료**: [`LECTURE_CSAT_SKILL_MAP.marp.md`](LECTURE_CSAT_SKILL_MAP.marp.md) (30장 강의)

<br>

**Repo 인덱스**: [github.com/smilepat](https://github.com/smilepat) · **Contact**: eltkorea@gmail.com

<!-- 발화: 클로저 — 강의와 자산 지도를 한 짝으로. 다음 대화는 파일럿/협력 제안으로 자연 전환. -->
