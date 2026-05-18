---
marp: true
theme: default
paginate: true
header: "ET-Craft — 측정 가능한 영어교육"
footer: "수능 1등급까지의 거리, 계량화하다"
---

<!-- _class: lead -->

# 수능 영어, 거리로 보다
### 교육과정 ↔ 수능 ↔ 학습자 역량을 하나의 좌표계에 올리는 시스템

**근거 레포:** `md-graph-db` · `csat-text-graph-maker` · `ai-english-platform` · `vocabulary-db`

---

# 1 │ 교육과정과 수능영어수준의 격차

> *교과과정의 약속*과 *수능이 요구하는 능력* 사이에는 **수학적·구조적 갭**이 존재한다.
> 출처: [`et-craft/lecture_v2.md`](https://github.com/smilepat/md-graph-db/blob/main/et-craft/lecture_v2.md), [`docs/DATABASE_ARCHITECTURE.md`](https://github.com/smilepat/md-graph-db/blob/main/docs/DATABASE_ARCHITECTURE.md)

---

## 1-A. Lexile 곡선 — "고2 → 수능"에서 200–400L 점프

```mermaid
xychart-beta
    title "학년별 권장 텍스트 난이도 (Lexile)"
    x-axis ["중3","고1","고2","수능","미국대학"]
    y-axis "Lexile (L)" 500 --> 1400
    line [700, 850, 950, 1200, 1350]
    bar  [700, 850, 950, 1200, 1350]
```

**한 줄:** 정규 수업 주 4시간으로 200–400L를 메우는 건 *수학적으로* 불가능 → 사교육 의존이 **구조적으로** 형성됨.

---

## 1-B. 어휘 누적 곡선 — 초등 800 → 수능 6,000 word families

```mermaid
xychart-beta
    title "교과과정 누적 어휘 (Word Families) — 출처: ai-english-platform/CURRICULUM_BANDS"
    x-axis ["초등(A1)","중학(A2)","고1-2(B1)","수능(B2)","대학(C1+)"]
    y-axis "누적 단어" 0 --> 9000
    bar [800, 2300, 4000, 6000, 8500]
```

| 구간 | CEFR | 누적 word family | 출처 |
|---|---|---:|---|
| 초등 | A1 | 800 | `app/api/dashboard/vocab-level/route.ts` |
| 중학 | A2 | 2,300 | 同上 |
| 고1–2 | B1 | 4,000 | 同上 |
| **수능** | **B2** | **6,000** | 同上 |

---

## 1-C. 평가 비대칭 — 학교 내신 vs 수능

| 항목 | 학교 내신 | 수능 | 출처 |
|---|---|---|---|
| 문항 유형 | 어휘·문법 객관식, 본문 암기 | 추론·빈칸·함의·요약 | `lecture_v2.md` slide 9 |
| Bloom 인지 수준 | 하위 (기억·이해) | 상위 (분석·평가) | 同 |
| 시간 압박 | 낮음 | **문항당 93초** | 同 |
| D5 전략 측정 | 거의 없음 | **결정 변수** | 同 |

> **귀결:** *"학교 1등급 → 수능 3등급"* 현상은 학생의 노력 부족이 아니라 **측정 좌표계 자체가 달라서** 발생.

---

# 2 │ 학습자의 역량과 시험 문항 해결력의 괴리

> 수능 영어를 푼다는 건 **12개 micro-skill의 조합 동작**이다.
> 한 개 micro-skill의 결함이 **여러 문항 유형을 동시에 무력화**한다.
> 출처: [`csat-text-graph-maker/src/lib/logicflow/micro-skills.ts`](https://github.com/smilepat/csat-text-graph-maker/blob/main/src/lib/logicflow/micro-skills.ts)

---

## 2-A. 12 micro-skill: 1등급 목표 vs 교과과정 도달 추정

```mermaid
xychart-beta
    title "수능 1등급 목표(GRADE1_TARGETS) vs 교과과정 도달 추정"
    x-axis ["A-01","A-02","A-03","A-04","B-01","B-02","B-03","B-04","C-01","C-02","C-03","C-04"]
    y-axis "마스터리 (0–100)" 0 --> 100
    bar [85,80,80,75,80,85,80,75,90,85,80,80]
    bar [65,60,55,50,50,45,40,45,55,35,40,35]
```

**Layer 평균 갭:** A −22.5 → B −35.0 → **C −42.5** (상위 인지로 갈수록 갭 단조 증가)

---

## 2-B. 1개 결함이 N개 문항 유형을 무력화한다

**B-03 "패러프레이즈 매핑"이 결함일 때 영향받는 수능 문항 유형:**

```mermaid
graph LR
    B03["⚠️ B-03<br/>패러프레이즈 매핑<br/>도달 40 / 목표 80"]
    B03 --> Q1["빈칸추론<br/>(blank_inference)"]
    B03 --> Q2["요지·주제<br/>(gist)"]
    B03 --> Q3["내용일치<br/>(content_match)"]
    B03 --> Q4["어휘 활용<br/>(vocabulary_usage)"]
    B03 --> Q5["공지문/도표<br/>(notice, graph)"]

    style B03 fill:#ffcccc,stroke:#cc0000
```

출처: `QUESTION_TYPE_SKILL_MAP` (micro-skills.ts) — 19개 수능 유형이 12개 skill의 조합.

---

## 2-C. 유형 ↔ skill 의존 매트릭스 (요약)

| 수능 유형 | Primary skill | Secondary skill |
|---|---|---|
| 빈칸추론 (blank_inference) | C-02, B-03 | A-01, B-02 |
| 어법 (grammar) | A-02, A-03 | A-04 |
| 주제·제목 | C-01 | C-03 |
| 함의 (implication) | C-02 | B-01, C-04 |
| 문장삽입 | B-02, B-01 | C-04 |
| 어휘 선택 | A-01 | B-03 |

> **시사점:** 같은 "오답 1개"라도 원인이 다르면 처방이 다르다. **분해 없이 처방 없다.**

---

# 3 │ 해결책 — 학습자의 역량 진단

> "어렵다 / 쉽다"가 아니라 **수치로 정의되는 진단**.
> 출처: [`docs/IRT_CALIBRATION_GUIDELINE.md`](https://github.com/smilepat/md-graph-db/blob/main/docs/IRT_CALIBRATION_GUIDELINE.md), 9,017 캘리브레이션 문항.

---

## 3-A. IRT 1PL Rasch — 문항·학습자를 동일 척도 위에

```mermaid
xychart-beta
    title "9,017 문항의 b_value 분포 (난이도 척도, Z-score)"
    x-axis ["−3.0","−2.0","−1.0","0.0","+1.0","+2.0","+3.0","+3.67"]
    y-axis "문항 수 (개념적 분포)" 0 --> 2200
    bar [180, 720, 1620, 2100, 1850, 1280, 980, 287]
```

- **b_value 범위:** −3.00 ~ +3.67 (`IRT_CALIBRATION_GUIDELINE.md`)
- **a_value:** 1.0 고정 (Cold-Start, 라쉬)
- 학습자 능력 θ도 같은 척도 → **거리 = (목표 b) − (현재 θ)** 가 그대로 계산됨

---

## 3-B. 적응형 진단 수렴 — 평균 풀이 단계 절반으로

```mermaid
flowchart LR
    A["사전정보<br/>(학년·CEFR)"] -->|Warm-start| B["Target θ ≈ 0.0"]
    B --> C{"문항 출제<br/>b ≈ θ̂"}
    C -->|정답| D["θ̂ 상향"]
    C -->|오답| E["θ̂ 하향"]
    D --> F{"수렴?<br/>(SE < 0.3)"}
    E --> F
    F -->|No| C
    F -->|Yes| G["진단 종료<br/>12 skill 좌표 출력"]

    style G fill:#ccffcc,stroke:#009900
```

CAT 표준: 고정형 대비 풀이 단계 약 **50% 단축** (Wainer 2000, `logicflow-prd/PRD_RESOURCES.md`).

---

## 3-C. 4단계 마스터리 게이트 — 학습자의 현재 좌표

```mermaid
xychart-beta
    title "MASTERY_LEVELS — micro-skills.ts"
    x-axis ["Novice","Developing","Proficient","Mastered"]
    y-axis "마스터리 점수" 0 --> 100
    bar [30, 60, 85, 100]
```

| Level | 점수 | 라벨 | 의미 |
|---|---:|---|---|
| Novice | 0–30 | 입문 | 진단 미실시 또는 핵심 결함 |
| Developing | 31–60 | 발전 | **교과과정 도달의 평균 구간** |
| Proficient | 61–85 | 숙련 | 수능 2–3등급 영역 |
| **Mastered** | **86–100** | **마스터** | **수능 1등급 영역** |

---

# 4 │ 목표까지의 거리와 로드맵

> 12 skill 사이엔 **선수관계(prerequisites)** 가 있다 → 학습 순서가 수학적으로 결정됨.
> 출처: `micro-skills.ts` (`prerequisites` 필드) + `recommender.ts`

---

## 4-A. Skill 선수관계 DAG — 학습 경로의 골격

```mermaid
graph TD
    A01["A-01<br/>어휘 의미 변별<br/>🎯 85"]
    A02["A-02<br/>구문 분석<br/>🎯 80"]
    A03["A-03<br/>절 경계<br/>🎯 80"]
    A04["A-04<br/>수식어 연결<br/>🎯 75"]

    B01["B-01<br/>지시 추적<br/>🎯 80"]
    B02["B-02<br/>논리 전환<br/>🎯 85"]
    B03["B-03<br/>패러프레이즈<br/>🎯 80"]
    B04["B-04<br/>어휘 연쇄<br/>🎯 75"]

    C01["C-01<br/>주제 도출<br/>🎯 90"]
    C02["C-02<br/>암묵적 추론<br/>🎯 85"]
    C03["C-03<br/>필자 의도<br/>🎯 80"]
    C04["C-04<br/>논증 구조<br/>🎯 80"]

    A02 --> A03
    A02 --> A04
    A01 --> B01
    A02 --> B01
    A03 --> B02
    A01 --> B03
    A01 --> B04
    B01 --> C01
    B02 --> C01
    B01 --> C02
    B03 --> C02
    C01 --> C03
    B02 --> C04
    C01 --> C04

    style C01 fill:#ffe4b5
    style C02 fill:#ffe4b5
    style C04 fill:#ffe4b5
```

색칠된 노드 = **갭이 −40 이상**인 우선 보강 대상.

---

## 4-B. Recommender 알고리즘 — 우선순위 자동 결정

```mermaid
flowchart TD
    M["12 skill 진단 결과<br/>θ_i (i=1..12)"] --> G["gap_i = target_i − θ_i"]
    G --> P["미해결 선수관계 점검<br/>(prereq.gap > 20)"]
    P --> S["우선순위 정렬<br/>① 선수 미충족 차단<br/>② gap 크기 내림차순"]
    S --> R["상위 5개 reason 부착"]

    R --> R1["gap > 30 → '집중 훈련 필요'"]
    R --> R2["15 < gap ≤ 30 → '보완 필요'"]
    R --> R3["gap ≤ 15 → '근접, 마무리'"]
    R --> R4["prereq 미충족 → '선수 ___ 먼저'"]
```

출처: [`csat-text-graph-maker/src/lib/logicflow/recommender.ts`](https://github.com/smilepat/csat-text-graph-maker/blob/main/src/lib/logicflow/recommender.ts) `getRecommendations()`.

---

## 4-C. 학습자 예시: 추천 로드맵 (5단계)

| # | skill | 현재 → 목표 | gap | reason |
|---:|---|---:|---:|---|
| 1 | **A-02** 구문 분석 | 60 → 80 | −20 | 선수 차단(B-02·C-04 진행 불가) |
| 2 | **B-02** 논리 전환 | 45 → 85 | −40 | 집중 훈련 필요 |
| 3 | **B-03** 패러프레이즈 | 40 → 80 | −40 | 5개 유형 동시 영향 |
| 4 | **C-01** 주제 도출 | 55 → 90 | −35 | B-01·B-02 충족 후 진입 |
| 5 | **C-02** 암묵적 추론 | 35 → 85 | −50 | B-03 보강 후 단계 진입 |

> **모든 학습자에게 다른 5개** 가 출력됨 → 일괄 커리큘럼의 종언.

---

# 5 │ 계량화된 기반의 학습 경험 제공

> 진단 좌표가 정해지면, **거기에 정확히 맞는 문항을 거기서 즉시 생성**할 수 있어야 한다.
> 출처: `DATABASE_ARCHITECTURE.md` — 137,745 학습 문항 자산.

---

## 5-A. 학습 문항 자산 — 9,183 × 5D × 3단계

```mermaid
xychart-beta
    title "학습 자산 규모 (개)"
    x-axis ["어휘 마스터DB","IRT 진단 문항","학습 스캐폴딩","CEFR 분할 파일"]
    y-axis "개수" 0 --> 150000
    bar [9183, 9017, 137745, 6]
```

- **마스터 어휘:** 9,183 단어 × 58 속성
- **IRT 진단 문항:** 9,017 (1PL Rasch)
- **학습 스캐폴딩:** **137,745 문항** = 9,183 × 5D × 3 step (Gemini 2.5 Flash × 45,915 호출 생성)
- **배포:** `learning_{Level}.json` × A1~C2 6개

---

## 5-B. 난이도가 좌표로 제어됨 — `learning_step` ↔ `b_value`

```mermaid
xychart-beta
    title "learning_step별 b_value 중심값 (난이도 정밀 제어)"
    x-axis ["step 1<br/>매우쉬움","step 3<br/>평균","step 5<br/>심화"]
    y-axis "b_value (중심)" -2.0 --> 2.0
    bar [-1.0, 0.0, 1.0]
```

| step | 의미 | b_value | 용도 |
|---:|---|---:|---|
| 1 | 매우 쉬움 | b−1.0 | 자신감 회복·기초 |
| 3 | 평균 | b±0 | 표준 학습 |
| 5 | 심화 | b+1.0 | 1등급 굳히기 |

같은 단어라도 **5D × 3step**로 15가지 학습 패턴 → "어려우면 더 쉬운 같은 단어"가 즉시 출제됨.

---

## 5-C. 2-Stage LLM 파이프라인 — 품질 결정 구조

```mermaid
flowchart LR
    P["지문 + 유형 코드"] --> S1
    S1["Stage 1<br/>지문 분석<br/>(담화구조, 핵심어휘)"] --> S2
    S2["Stage 2<br/>문항 생성<br/>(컨텍스트 주입)"] --> V["3-Layer 검증"]
    V --> V1["Layer 1: 구조<br/>(필드·5지·정답)"]
    V --> V2["Layer 2: 내용<br/>(정답 유일성·매력도)"]
    V --> V3["Layer 3: 수능 적합성<br/>(난이도·유형 부합)"]
    V3 --> OK{"통과?"}
    OK -->|Yes| OUT["✅ 즉시 학습자에게"]
    OK -->|No| RETRY["재시도·백오프"]
```

출처: `et-craft/ET-Craft_Presentation.md` (validator_common.js, validator_grammar/gap/chart/set.js).

---

# 6 │ 눈에 보이는 progress

> 진단·학습·재진단의 닫힌 루프 → **점수가 아닌 좌표의 이동**으로 성장을 본다.

---

## 6-A. Before / After — 12 skill 좌표 이동

```mermaid
xychart-beta
    title "8주 학습 후 12 micro-skill 좌표 이동 (예시 학습자)"
    x-axis ["A-01","A-02","A-03","A-04","B-01","B-02","B-03","B-04","C-01","C-02","C-03","C-04"]
    y-axis "마스터리 (0–100)" 0 --> 100
    bar [65,60,55,50,50,45,40,45,55,35,40,35]
    bar [78,75,72,68,72,72,68,68,75,62,65,62]
```

상단(Before) → 하단(After) 모두 표시. **B-03 패러프레이즈 40→68(+28)** 의 효과로 빈칸·요지·내용일치 유형이 일제히 상승.

---

## 6-B. 마스터리 레벨 이동 — 시각적 카운트

```mermaid
xychart-beta
    title "마스터리 레벨별 skill 수 (Before → After)"
    x-axis ["Novice","Developing","Proficient","Mastered"]
    y-axis "skill 개수" 0 --> 12
    bar [3, 9, 0, 0]
    bar [0, 4, 8, 0]
```

**Before:** Novice 3 / Developing 9 → **After:** Developing 4 / Proficient 8.
다음 8주: **Proficient → Mastered** 게이트 진입 → 수능 1등급 영역.

---

## 6-C. 누적 학습 시간 ↔ θ 상승 — "노력의 가시화"

```mermaid
xychart-beta
    title "누적 학습 시간 vs 평균 θ (학습자 코호트, 예시)"
    x-axis ["W0","W2","W4","W6","W8","W10","W12"]
    y-axis "평균 θ (Rasch 척도)" -1.5 --> 1.5
    line [-1.2, -0.8, -0.4, 0.0, 0.4, 0.7, 1.0]
```

**핵심:** θ가 0.0(=수능 평균 난이도 정답률 50%) → +1.0(=수능 상위권)으로 직진. 학습자·학부모·교사가 같은 좌표축으로 진행을 본다.

---

## 6-D. 진단 → 학습 → 재진단 루프

```mermaid
flowchart LR
    D["📍 진단<br/>12 skill θ 측정"] --> R["🧭 Recommender<br/>top-5 우선순위"]
    R --> L["📚 학습<br/>137,745 풀에서<br/>step별 출제"]
    L --> Q["📝 풀이 로그<br/>(User, Item, Correct)"]
    Q --> U["θ 업데이트<br/>(Bayes/EAP)"]
    U --> D

    Q --> C["IRT 재캘리브레이션<br/>Phase 1→2→3"]
    C --> D

    style D fill:#cce5ff
    style L fill:#fff3cd
    style C fill:#d4edda
```

**모트(Moat):** 풀이 로그가 쌓일수록 b·a 파라미터가 한국 학습자에 맞춰 재조정됨 → **데이터 네트워크 효과**.

---

<!-- _class: lead -->

# 한 줄 요약

> **"학습자의 거리, 좌표로 측정한다."**

| 단계 | 핵심 산출 | 근거 레포 |
|---|---|---|
| ① 갭 인식 | Lexile · 어휘 · Bloom 비대칭 | `md-graph-db/et-craft/lecture_v2.md` |
| ② 역량 분해 | 12 micro-skill × 4 mastery | `csat-text-graph-maker/.../micro-skills.ts` |
| ③ 진단 | 1PL Rasch IRT CAT | `md-graph-db/docs/IRT_CALIBRATION_GUIDELINE.md` |
| ④ 로드맵 | Prerequisite DAG + Recommender | `.../logicflow/recommender.ts` |
| ⑤ 학습 | 137,745 문항 × 2-Stage LLM | `md-graph-db/docs/DATABASE_ARCHITECTURE.md` |
| ⑥ Progress | θ 이동 + 마스터리 게이트 | 同上 + `MASTERY_LEVELS` |

---

# 부록 — 데이터 출처 (재현성)

- 12 micro-skill 정의·목표·선수관계 — `csat-text-graph-maker/src/lib/logicflow/micro-skills.ts`
- canonical 결정 — `logicflow-corpus/docs/skill-mapping.md` (D2, 2026-05-17)
- 학습 자산 137,745 · 진단 9,017 · 어휘 9,183 — `md-graph-db/docs/DATABASE_ARCHITECTURE.md`
- IRT 1PL Rasch·b 범위·Warm-start — `md-graph-db/docs/IRT_CALIBRATION_GUIDELINE.md`
- 교과과정 누적 어휘 800/2,300/4,000/6,000 — `ai-english-platform/app/api/dashboard/vocab-level/route.ts`
- Lexile 학년 표 · Bloom 비대칭 · 93초 — `md-graph-db/et-craft/lecture_v2.md`
- Recommender 우선순위·reason — `csat-text-graph-maker/src/lib/logicflow/recommender.ts`
- 2-Stage 파이프라인 · 3-Layer 검증 — `md-graph-db/et-craft/ET-Craft_Presentation.md`

**주의:** 슬라이드 2-A 하단 막대(교과과정 도달치 65/45/35…), 슬라이드 6-A·6-B의 학습자 사례는 정성적 진단에서 역추정한 예시값입니다. 실측 코호트 평균으로 교체 가능합니다.
