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

## 1-A. 10년 종단 Lexile — 학년별 4 cohort 분기

```mermaid
xychart-beta
    title "초3→고3 Lexile 4-cohort (목표·상위5%·평균·하위25%)"
    x-axis ["초3","초4","초5","초6","중1","중2","중3","고1","고2","고3"]
    y-axis "Lexile (L)" 0 --> 1300
    line [300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200]
    line [350, 450, 550, 650, 750, 850, 950, 1050, 1150, 1250]
    line [250, 320, 400, 480, 550, 620, 700, 780, 850, 950]
    line [150, 200, 250, 300, 350, 400, 450, 500, 550, 600]
```

위에서부터: 🔵 **상위 5%** / 🟦 **목표 궤적 (수능 1200L 도달)** / 🟧 **평균 학생** / 🔴 **하위 25%**.

- **MetaMetrics 2023:** *"43% of Korean 12th graders were reading below 1000L"* (수능 지문 도달 불가)
- **수능 지문:** 1,100–1,300L · **고3 평균:** ~950L → **고3 1년 동안 250–350L 격차** 잔존
- 학년 진행에 따라 cohort 간 격차가 **단조 증가** → 일괄 커리큘럼은 cohort 분기를 메우지 못함

> 출처: [`Korea_English_Solution/components/learning-trajectory.tsx`](https://github.com/smilepat/Korea_English_Solution/blob/main/components/learning-trajectory.tsx) + MetaMetrics 2023 Annual Reading Report for Korea.

---

## 1-D. 한국 vs 미국 — 읽기 노출량 **약 44배 격차**

```mermaid
xychart-beta
    title "초3→고3 누적 영어 읽기 노출량 (만 단어)"
    x-axis ["초등(3-6)","중학(7-9)","고등(10-12)","합계(3-12)"]
    y-axis "누적 단어 (만)" 0 --> 1000
    bar [3.6, 6.75, 9, 19.3]
    bar [150, 225, 600, 975]
```

상단 = 한국 학생 / 하단 = 미국 학생 (단위: 만 단어)

| 학교급 | 한국 | 미국 | 격차 배율 |
|---|---:|---:|---:|
| 초등 (3–6) | 32K–40K | 1.5M | **약 40배** |
| 중학 (7–9) | 60K–75K | 2.25M | **약 33배** |
| 고등 (10–12) | 75K–105K | 6.0M | **약 66배** |
| **합계** | **167K–220K** | **9.75M** | **약 44배** |

> 한국 학생은 미국 학생 대비 **1/44 수준의 영어 텍스트**에만 노출. 교과서 중심·제한된 읽기 환경의 구조적 귀결.
> 출처: `Korea_English_Solution/EDUCATION_ANALYSIS.md` §1.1.

---

## 1-E. 수업시간 부족 — CEFR B1 도달이 **수학적으로 불가능**

```mermaid
xychart-beta
    title "영어 학습 누적 시간 (초3→고3 10년)"
    x-axis ["한국 정규 수업","CEFR B1 (하한)","CEFR B1 (상한)"]
    y-axis "시간 (hours)" 0 --> 2200
    bar [980, 1200, 2000]
```

| 항목 | 시간 |
|---|---:|
| 한국 정규 영어 수업 누적 (초3–고3, 10년) | **980시간** |
| CEFR B1 (중급 하) 달성 최소 필요 | 1,200시간 |
| CEFR B1 (중급 하) 달성 권장 | 2,000시간 |
| **부족분** | **220–1,020시간 (22–51%)** |

> 현재 교육과정 시수만으로는 **CEFR B1조차 구조적으로 도달 불가**. 사교육 의존도가 *경제적 선택*이 아니라 *수학적 필연*이 되는 이유.
> 출처: `Korea_English_Solution/EDUCATION_ANALYSIS.md` §1.2.

---

## 1-F. 격차율 누진 — 학년 진행에 따라 **단조 증가**

```mermaid
xychart-beta
    title "학년별 교육과정 목표 대비 실제 성취 격차율 (%)"
    x-axis ["초6","중3","고2"]
    y-axis "격차율 (%)" 0 --> 100
    bar [35, 58, 72]
```

| 학년 | 격차율 | 주요 결손 영역 |
|---|---:|---|
| 초6 | 35% | 기본 구문 이해 |
| 중3 | 58% | 복합문 분석 |
| 고2 | **72%** | 추론적 독해 |

> 격차는 학년이 올라갈수록 **더 빨리 커진다** → **고2에서 메꿀 수 없음**. 조기 진단·개인화의 정량 근거.
> 출처: `Korea_English_Solution/components/charts.tsx` (GEPS 2017–2022, CSAT 텍스트 분석, 2023 수능 33번 분석).

---

## 1-G. 교육과정 vs CEFR — **학년별 도달 갭** 매트릭스

```mermaid
xychart-beta
    title "한국 교육과정 목표 CEFR vs 실제 도달 (학년별, 1=A1·2=A2·3=B1·4=B2)"
    x-axis ["초3-4","초5-6","중1","중2-3","고1","고2-3"]
    y-axis "CEFR 단계" 0 --> 5
    line [1.0, 1.5, 2.0, 2.5, 3.0, 3.5]
    line [0.8, 1.0, 1.5, 2.0, 2.0, 2.5]
```

상단(목표) vs 하단(실제) — 모든 학년에서 **목표 미달** + 고2–3에서 **격차 최대 1단계**.

| 학교급 | 학년 | 한국 목표 | CEFR | **실제 도달 (다수)** |
|---|---|---|---|---|
| 초등 | 3-4 | 기초 의사소통 | **A1** | A1 미만 ⚠️ |
| 초등 | 5-6 | 친숙 주제 듣/말 | A1~A2 | A1 |
| 중학 | 1 | 일상 듣/읽 이해 | A2 | A1~A2 |
| 중학 | 2-3 | 친숙 주제 말/쓰기 | A2~B1 | A2 |
| 고등 | 1 | 복합 이해·표현 | **B1** | A2~B1 |
| 고등 | 2-3 | 추상 주제 해석 | **B1~B2** | **B1 미만 ⚠️** |

> 모든 학년에서 *지속적 갭* — 누적 효과로 고2–3에서 **B1 미만** 다수.
> 출처: `Korea_English_Solution/EDUCATION_ANALYSIS.md` §1.3.

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

## 1-C. 평가 비대칭 — 학교 내신 vs 수능 (4축 비교)

```mermaid
xychart-beta
    title "4축 평가 비대칭 (0–10 정규화 · 높을수록 강도 높음)"
    x-axis ["문항복잡도","Bloom 인지수준","시간 압박","D5 전략 측정"]
    y-axis "강도 (0–10)" 0 --> 10
    bar [3, 3, 2, 1]
    bar [9, 9, 9, 8]
```

상단 = **학교 내신** / 하단 = **수능** (높을수록 강도 높음)

| 항목 | 학교 내신 | 수능 | 출처 |
|---|---|---|---|
| 문항 유형 | 어휘·문법 객관식, 본문 암기 | 추론·빈칸·함의·요약 | `lecture_v2.md` slide 9 |
| Bloom 인지 수준 | 하위 (기억·이해) | 상위 (분석·평가) | 同 |
| 시간 압박 | 낮음 | **문항당 93초** | 同 |
| D5 전략 측정 | 거의 없음 | **결정 변수** | 同 |

> **귀결:** *"학교 1등급 → 수능 3등급"* 현상은 학생의 노력 부족이 아니라 **측정 좌표계 자체가 달라서** 발생. 4축 모두에서 수능이 *극단적으로* 우측 이동.

---

# 2 │ 학습자의 역량과 시험 문항 해결력의 괴리

> 수능 영어를 푼다는 건 **12개 micro-skill의 조합 동작**이다.
> 한 개 micro-skill의 결함이 **여러 문항 유형을 동시에 무력화**한다.
> 출처: [`csat-text-graph-maker/src/lib/logicflow/micro-skills.ts`](https://github.com/smilepat/csat-text-graph-maker/blob/main/src/lib/logicflow/micro-skills.ts)

---

## 2-A. 12 micro-skill: 1등급 목표 vs 교과과정 도달 추정

```mermaid
xychart-beta
    title "수능 1등급 목표 (GRADE1_TARGETS, 실측) vs 교과과정 도달 (추정)"
    x-axis ["A-01","A-02","A-03","A-04","B-01","B-02","B-03","B-04","C-01","C-02","C-03","C-04"]
    y-axis "마스터리 (0–100)" 0 --> 100
    bar [85,80,80,75,80,85,80,75,90,85,80,80]
    bar [65,60,55,50,50,45,40,45,55,35,40,35]
```

- **상단 막대 (실측):** `csat-text-graph-maker/src/lib/logicflow/micro-skills.ts` `GRADE1_TARGETS` 정규치
- **하단 막대 (추정):** 정성적 진단에서 역추정한 *placeholder*. production 학습자 코호트(n≥30) 형성 후 실측 교체 예정 — 트리거 조건은 [Plan §8.4](docs/01-plan/features/slides-cohort-replacement.plan.md) 참조
- **Layer 평균 갭 (추정 기준):** A −22.5 → B −35.0 → **C −42.5** (상위 인지로 갈수록 갭 단조 증가)

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

## 2-C. Skill 영향력 — 어느 skill이 가장 많은 유형을 좌우하나

```mermaid
xychart-beta
    title "19개 수능 유형 중 해당 skill이 Primary로 쓰이는 횟수"
    x-axis ["A-01","A-02","A-03","A-04","B-01","B-02","B-03","B-04","C-01","C-02","C-03","C-04"]
    y-axis "유형 수 (0–7)" 0 --> 7
    bar [3,1,1,0,5,3,5,1,6,3,3,1]
    bar [3,0,0,1,3,4,2,1,1,0,1,2]
```

**상단(Primary) + 하단(Secondary)** = 해당 skill에 영향받는 총 유형 수. 출처: `QUESTION_TYPE_SKILL_MAP` 19개 유형 × 12 skill 전수 집계.

| 영향력 순위 | skill | Primary 유형 수 | Total (P+S) | 시사점 |
|---:|---|---:|---:|---|
| 🥇 | **B-01** 지시 추적 | 5 | **8 / 19** | 응집성 핵심 — 보강 효율 최대 |
| 🥈 | **C-01** 주제 도출 | **6** | 7 / 19 | Primary 단독 최다 — 1등급 게이트 |
| 🥈 | **B-03** 패러프레이즈 | 5 | 7 / 19 | 5개 유형 일제히 무력화 가능 |
| 🥈 | **B-02** 논리 전환 | 3 | 7 / 19 | 흐름 이해의 허브 |
| ⬇️ | A-04 수식어 / B-04 어휘연쇄 | 0–1 | 1–2 / 19 | leverage 낮음 — 후순위 가능 |

> **시사점:** 12개 skill이 동등하지 않다. **B-01·C-01·B-03 3개만 보강해도 19개 중 13개 유형이 영향권**에 들어옴 → 추천 알고리즘의 우선순위 가중치 기반.

---

## 2-D. 19 수능 유형 ↔ 12 skill 풀 매핑 그래프

```mermaid
graph LR
    subgraph 유형["📝 19 수능 유형"]
        direction TB
        T1["빈칸추론"]:::rc
        T2["순서배열"]:::rc
        T3["문장삽입"]:::rc
        T4["무관문장"]:::rc
        T5["주제·제목"]:::rc
        T6["요지·요약"]:::rc
        T7["함의추론"]:::rc
        T8["어법"]:::gr
        T9["어휘선택"]:::lex
        T10["내용일치"]:::rc
        T11["장문"]:::rc
        T12["기타<br/>(공지·도표·심경·필자의도)"]:::misc
    end
    subgraph skill["🎯 12 micro-skill"]
        direction TB
        S_A01["A-01<br/>어휘"]:::a
        S_A02["A-02<br/>구문"]:::a
        S_A03["A-03<br/>절경계"]:::a
        S_B01["B-01<br/>지시추적<br/>★ 8/19"]:::b_strong
        S_B02["B-02<br/>논리전환<br/>★ 7/19"]:::b_strong
        S_B03["B-03<br/>패러프레이즈<br/>★ 7/19"]:::b_strong
        S_B04["B-04<br/>어휘연쇄"]:::b
        S_C01["C-01<br/>주제도출<br/>★ 7/19"]:::c_strong
        S_C02["C-02<br/>암묵추론"]:::c
        S_C03["C-03<br/>필자의도"]:::c
        S_C04["C-04<br/>논증구조"]:::c
    end

    T1 ==> S_C02
    T1 ==> S_B03
    T2 ==> S_B02
    T2 ==> S_B04
    T3 ==> S_B02
    T3 ==> S_B01
    T4 ==> S_C01
    T4 ==> S_B02
    T5 ==> S_C01
    T6 ==> S_C01
    T6 ==> S_C03
    T7 ==> S_C02
    T8 ==> S_A02
    T8 ==> S_A03
    T9 ==> S_A01
    T10 ==> S_B03
    T10 ==> S_B01
    T11 ==> S_C01
    T11 ==> S_C02
    T12 -.-> S_C03
    T12 -.-> S_A01

    classDef rc fill:#e0f2fe,stroke:#0284c7
    classDef gr fill:#fef3c7,stroke:#ca8a04
    classDef lex fill:#dcfce7,stroke:#16a34a
    classDef misc fill:#f3e8ff,stroke:#9333ea
    classDef a fill:#fef9c3,stroke:#a16207
    classDef b fill:#dbeafe,stroke:#1d4ed8
    classDef b_strong fill:#bfdbfe,stroke:#1e40af,stroke-width:3px
    classDef c fill:#fce7f3,stroke:#be185d
    classDef c_strong fill:#fbcfe8,stroke:#9d174d,stroke-width:3px
```

굵은 화살표 = **Primary** 의존. 점선 = secondary. **굵은 테두리 노드 = 영향력 ★ 표시 skill**.

> 출처: `csat-text-graph-maker/.../micro-skills.ts` `QUESTION_TYPE_SKILL_MAP` 전수.

---

## 2-E. Performance Descriptor 5축 — 목표 vs 고2 실측

```mermaid
xychart-beta
    title "한국교육과정평가원 Performance Descriptor 5축 — 목표 vs 고2 실측"
    x-axis ["문법 정확성","어휘 다양성","논리 구성력","창의성","맥락 적절성"]
    y-axis "성취도 (0–100)" 0 --> 100
    bar [80, 75, 70, 65, 75]
    bar [35, 25, 20, 15, 5]
```

상단(목표) vs 하단(고2 실측) — 모든 축에서 **목표의 ½ 미만**. 특히 **맥락 적절성 5점**(목표 75)으로 **D5 전략 차원의 사각지대**가 외부 출처에서도 확인됨.

| 축 | 목표 | 고2 실측 | 갭 |
|---|---:|---:|---:|
| 문법 정확성 | 80 | 35 | −45 |
| 어휘 다양성 | 75 | 25 | −50 |
| 논리 구성력 | 70 | 20 | −50 |
| 창의성 | 65 | 15 | −50 |
| **맥락 적절성** | 75 | **5** | **−70** |

> 12 micro-skill 갭(슬라이드 2-A)과 **독립 출처에서 일관**된 결론.
> 출처: `Korea_English_Solution/components/charts.tsx::RadarChart`, 한국교육과정평가원 Performance Descriptor.

---

## 2-F. 학습 결손 영역 — 어디서 가장 자주 막히나

```mermaid
pie showData
    title 영어 학습 결손 영역 분포 (2022–23 영어교육 실태조사)
    "어휘력 부족" : 30
    "문법 이해 부족" : 25
    "독해력 부족" : 20
    "듣기 이해 부족" : 15
    "말하기/쓰기 부족" : 10
```

> **합계 어휘+문법+독해 = 75%** — 12 micro-skill 중 Layer A·B(어휘·구문·응집성)와 직접 대응. 음성·생산 영역은 시험 비중이 낮아 후순위.
> 출처: `Korea_English_Solution/components/charts.tsx::PieChart`, 2022–2023 영어교육 실태조사.

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

## 3-D. IRT 캘리브레이션 로드맵 — Phase 1→2→3

```mermaid
gantt
    title IRT 모형 진화 (Cold-Start → Empirical → 2PL → 3PL)
    dateFormat YYYY-MM
    axisFormat %Y.%m
    section Phase 0
    1PL Rasch Cold-Start (a=1.0 고정, b=Zipf 빈도순위) :done, p0, 2026-01, 6M
    section Phase 1
    실정답률 기반 b 재추정 (n≥수만 건)  :active, p1, 2026-07, 9M
    section Phase 2
    a 해금 → 2PL (변별도 0.5–2.2)         :p2, 2027-04, 9M
    section Phase 3
    Guessing c 모델링 → 3PL                :p3, 2028-01, 12M
    section 항상
    Warm-start (학년·CEFR 사전정보)        :warm, 2026-01, 36M
```

| Phase | 모델 | 핵심 작업 | 기대 효과 |
|---|---|---|---|
| **0** ✅ | 1PL Rasch | a=1.0 고정, b는 빈도순위 매핑 (Cold-Start) | 출시 가능한 최소 진단 시스템 |
| **1** 🔄 | 1PL+ | 실 정답률 로그로 **b 재이동** | b가 한국 학습자 특성에 맞춰 −3.0~+3.0 자동 조정 |
| **2** | 2PL | **a 해금** (변별도 동적 계산) | 매력적 오답 문항 a→1.5–2.2 자동 승격 = **특급 진단 문항** |
| **3** | 3PL | guessing parameter c | 찍기 보정, 하위권 정확도 추가 향상 |

> **데이터 네트워크 효과:** 풀이 로그가 쌓일수록 모델이 자동 정교화 → 신규 진입자가 따라오기 어려운 자산.
> 출처: `md-graph-db/docs/IRT_CALIBRATION_GUIDELINE.md`.

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

## 4-C. 학습자 예시: 추천 로드맵 (5단계 우선순위)

```mermaid
xychart-beta
    title "예시 학습자: top-5 추천 skill의 현재 vs 목표 (gap 시각화)"
    x-axis ["①A-02 구문","②B-02 논리","③B-03 패러","④C-01 주제","⑤C-02 추론"]
    y-axis "마스터리 (0–100)" 0 --> 100
    bar [60, 45, 40, 55, 35]
    bar [80, 85, 80, 90, 85]
```

상단(현재) → 하단(목표). 막대 길이 차이 = gap.

| # | skill | 현재 → 목표 | gap | reason (recommender 자동 생성) |
|---:|---|---:|---:|---|
| ① | **A-02** 구문 분석 | 60 → 80 | −20 | 선수 차단 — B-02·C-04 진행 불가 |
| ② | **B-02** 논리 전환 | 45 → 85 | **−40** | 집중 훈련 필요 |
| ③ | **B-03** 패러프레이즈 | 40 → 80 | **−40** | 5개 유형 동시 영향 (2-C 참조) |
| ④ | **C-01** 주제 도출 | 55 → 90 | −35 | B-01·B-02 충족 후 진입 |
| ⑤ | **C-02** 암묵적 추론 | 35 → 85 | **−50** | B-03 보강 후 단계 진입 |

> **모든 학습자에게 다른 5개** 가 출력됨 → 일괄 커리큘럼의 종언. **순서는 gap 크기가 아니라 선수관계 우선** (4-A·4-B 참조).

---

## 4-D. 케이스 스터디 — Student B: 410L → 1000L (2년 계획)

```mermaid
xychart-beta
    title "Student B 2년 Lexile 상승 계획 (현재 410L → 목표 1000L)"
    x-axis ["현재","6개월","12개월","18개월","24개월"]
    y-axis "Lexile (L)" 0 --> 1100
    line [410, 560, 710, 860, 1000]
    line [410, 410, 410, 410, 410]
```

상단(목표 경로) vs 하단(개입 없음 = 정체) — **390L 상승**이 분기점별 약 150L씩.

```python
def calculate_required_time(current_level, target_level):
    CEFR_gap = target_level - current_level
    return CEFR_gap * 300  # CEFR 1단계당 300시간 필요
```

| 항목 | 값 |
|---|---|
| **현재 Lexile** | **410L** (중1 수준, 평균 학생 궤적) |
| **목표 Lexile** | **1000L** (고1 수준, 목표 궤적) |
| **필요 상승** | 390L |
| **예상 소요** | **2년** (주 3회, **45분/회** 집중 학습) |
| **CEFR 1단계당** | 약 300시간 |
| **중점 학습 영역** | 다독, 복합문 분석, 추론적 독해, 학술 어휘 확장 |

> **추상→구체 ROI:** "390L가 2년 × 주 3회 × 45분 = 약 234시간"으로 *측정 가능한 목표*가 됨. 학부모·교사·학생이 같은 좌표축으로 의사결정.
> 출처: `Korea_English_Solution/components/personalized-roadmap.tsx`.

---

# 5 │ 계량화된 기반의 학습 경험 제공

> 진단 좌표가 정해지면, **거기에 정확히 맞는 문항을 거기서 즉시 생성**할 수 있어야 한다.
> 출처: `DATABASE_ARCHITECTURE.md` — 137,745 학습 문항 자산.

---

## 5-A. 학습 문항 자산 — 데이터 + 생성 시스템

```mermaid
xychart-beta
    title "ET-Craft 자산 규모 (대수 척도)"
    x-axis ["어휘DB","IRT진단","스캐폴딩","CEFR분할","수능유형","프롬프트","검증기"]
    y-axis "log10(개수)" 0 --> 6
    bar [3.96, 3.96, 5.14, 0.78, 1.64, 1.61, 0.95]
```

| 자산 | 규모 | 비고 |
|---|---:|---|
| **마스터 어휘** | 9,183 단어 × 58 속성 | `vocab_master.sqlite` |
| **IRT 진단 문항** | 9,017 | 1PL Rasch, b ∈ [−3.00, +3.67] |
| **학습 스캐폴딩** | **137,745 문항** | 9,183 × 5D × 3 step (Gemini 2.5 Flash × 45,915 호출) |
| **CEFR 분할 패키지** | 6 | A1~C2 `learning_{Level}.json` |
| **수능 유형 풀커버리지** | **44** | LC 16 + RC 28 (`csat_itemgen` 모듈별 spec) |
| **유형별 프롬프트 라이브러리** | **41** | 224 KB, 버전·메트릭 추적 *(ET-Craft lineage, current core: EBS-demo)* |
| **모듈러 검증기** | **9** | common · grammar · gap · chart · listening · format · set 등 *(同上)* |

> 자산 차트는 자릿수 차이가 크므로 log10 척도. 핵심은 *"양"이 아니라 **구조화된 자산의 폭"*.

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

## 5-C. 2-Stage LLM × 9 검증기 × Issue Code 분기

```mermaid
flowchart LR
    P["지문 + 유형 코드<br/>(44종 중 1)"] --> S1
    S1["Stage 1<br/>지문 분석<br/>(담화구조·핵심어휘)"] --> S2
    S2["Stage 2<br/>문항 생성<br/>(컨텍스트 주입)"] --> V

    V["3-Layer × 9 검증기"]
    V --> L1["L1 구조<br/>common · format"]
    V --> L2["L2 내용<br/>grammar · gap · chart · listening · set"]
    V --> L3["L3 적합성<br/>itemEvaluator (5D)"]

    L1 --> IC{"Issue Code<br/>분류"}
    L2 --> IC
    L3 --> IC
    IC -->|"severity=error"| FAIL["❌ 재시도<br/>(promptEvaluator 피드백)"]
    IC -->|"warning + auto_fixable"| FIX["🛠 autoRepair"]
    IC -->|"PASS"| OUT["✅ 학습자에게"]
    FIX --> V
    FAIL --> S1

    style OUT fill:#d4edda
    style FAIL fill:#f8d7da
    style FIX fill:#fff3cd
```

- **9 검증기 모듈** (`validator_common`, `_grammar`, `_gap`, `_chart`, `_listening`, `_format`, `_set` 등) — 유형별 전용 spec
- **3-Layer 검증** L1 구조 → L2 내용 → L3 수능 적합성
- **Issue Code 분기** 결과를 severity·auto_fixable 메타데이터로 라우팅 (`failed → 재시도` / `warning → autoRepair` / `pass → 출력`)

> 출처: ET-Craft 문항생성 계열 (`csat_itemgen` PRD, current core: `EBS-demo`).

---

## 5-D. Issue Code 분류 체계 — 검증의 메타데이터화

```mermaid
xychart-beta
    title "60+ Issue Code의 6개 카테고리 분포"
    x-axis ["P 지문","Q 문제","O 선택지","A 정답","F 형식","S 세트"]
    y-axis "코드 수" 0 --> 20
    bar [12, 8, 18, 6, 10, 6]
```

| 접두 | 영역 | 대표 코드 |
|---|---|---|
| **P0xx** | 지문 (Passage) | P001 너무 짧음 · P003 주제 이탈 |
| **Q0xx** | 문제 (Question) | Q001 지시문 불명확 · Q002 유형 불일치 |
| **O0xx** | 선택지 (Options) | O001 개수 오류 · **O003 매력도 낮음** · O005 복수정답 |
| **A0xx** | 정답 (Answer) | A001 정답 모호 · A002 범위 초과 |
| **F0xx** | 형식 (Format) | F001 JSON 구조 · F002 필드 누락 |
| **S0xx** | 세트 (Set) | S001 공통지문 불일치 (16-17·41-42·43-45) |

```json
{ "code": "O003", "severity": "warning", "auto_fixable": false,
  "message": "선택지 ②의 매력도가 낮음",
  "suggestion": "지문 맥락 관련 오답으로 교체",
  "location": "options[1]" }
```

> **함의:** 검증이 *분류·심각도·수정가능성* 3축으로 메타데이터화 → 자동 보정·재시도·통계 모두 가능. *"PASS/FAIL"이 아니라 **분류된 처방"*.

---

## 5-E. 문항 생성 시스템 운영 KPI — 현재 vs 목표 5축 비교

```mermaid
xychart-beta
    title "5축 KPI 현재 추정 vs 목표 (모두 0–100 정규화, 클수록 좋음)"
    x-axis ["1회 통과율","검증 커버리지","오답 매력도","응답속도","재생성 절약"]
    y-axis "정규화 점수 (0–100)" 0 --> 100
    bar [30, 60, 40, 50, 30]
    bar [70, 95, 80, 90, 85]
```

상단(현재 추정) vs 하단(목표) — 5축 모두 *명확한 갭*. **검증 커버리지**가 가장 가까움, **재생성 절약과 1회 통과율이 가장 멀리**.

| KPI | 현재 | **목표** | 정규화 산식 | 측정 방법 |
|---|---:|---:|---|---|
| 1회 통과율 | 측정 인프라 구축 중 | **70%+** | 값 그대로 (%) | 생성 → 검증 PASS 비율 |
| 재생성 평균 횟수 | 同 | **≤ 1.5회** | (3 − 횟수)/3 × 100 | 최종 OK까지 LLM 호출 수 |
| 검증 커버리지 | ~60% (구조만) | **95%+** | 값 그대로 (%) | spec 대비 검증 항목 비율 |
| 오답 매력도 점수 | 미측정 | **80점+** | 값 그대로 | `itemEvaluator` 평균 distractor 점수 |
| 단일 문항 응답 | 미측정 | **< 30초** | (60 − 초)/60 × 100 | API 응답 시간 |

> 출처: ET-Craft lineage `PRD_IMPROVEMENT_2026.md` §2.2. **데이터 회사 포지셔닝의 정량 증거** — 콘텐츠가 아니라 *통제된 생성 시스템*.

---

# 6 │ 눈에 보이는 progress

> 진단·학습·재진단의 닫힌 루프 → **점수가 아닌 좌표의 이동**으로 성장을 본다.

---

## 6-A. Before / After — 12 skill 좌표 이동 (예시·추정)

```mermaid
xychart-beta
    title "8주 학습 후 12 micro-skill 좌표 이동 (예시 학습자 · 추정값)"
    x-axis ["A-01","A-02","A-03","A-04","B-01","B-02","B-03","B-04","C-01","C-02","C-03","C-04"]
    y-axis "마스터리 (0–100)" 0 --> 100
    bar [65,60,55,50,50,45,40,45,55,35,40,35]
    bar [78,75,72,68,72,72,68,68,75,62,65,62]
```

> ⚠️ **추정값**: 상단(Before)·하단(After) 모두 정성적 진단 기반의 예시 학습자 시나리오. 실제 production 코호트(개입 전 첫 진단 vs 8주 경과 재진단의 페어드 평균, n≥30)로 교체 예정 — 트리거 조건은 [Plan §8.4](docs/01-plan/features/slides-cohort-replacement.plan.md) 참조.

**의미 설명:** B-03 패러프레이즈 40→68 (+28)의 효과로 빈칸·요지·내용일치 유형이 일제히 상승하는 *메커니즘*은 `QUESTION_TYPE_SKILL_MAP`이 보장(실측).

---

## 6-B. 마스터리 레벨 이동 — 시각적 카운트 (예시·추정)

```mermaid
xychart-beta
    title "마스터리 레벨별 skill 수 (Before → After · 추정)"
    x-axis ["Novice","Developing","Proficient","Mastered"]
    y-axis "skill 개수" 0 --> 12
    bar [3, 9, 0, 0]
    bar [0, 4, 8, 0]
```

> ⚠️ **추정값**: 6-A와 동일한 예시 학습자 시나리오에서 파생. 실측 시 6-A 페어드 코호트의 skill별 `MASTERY_LEVELS` 카운트로 교체.

**Before:** Novice 3 / Developing 9 → **After:** Developing 4 / Proficient 8.
다음 8주: **Proficient → Mastered** 게이트 진입 → 수능 1등급 영역.

---

## 6-C. 누적 학습 시간 ↔ θ 상승 — "노력의 가시화" (예시·추정)

```mermaid
xychart-beta
    title "누적 학습 시간 vs 평균 θ (학습자 코호트 · 추정 곡선)"
    x-axis ["W0","W2","W4","W6","W8","W10","W12"]
    y-axis "평균 θ (Rasch 척도)" -1.5 --> 1.5
    line [-1.2, -0.8, -0.4, 0.0, 0.4, 0.7, 1.0]
```

> ⚠️ **추정 곡선**: 실측 시 production 코호트의 주별 평균 θ (Rasch 척도)로 교체. `learnerEvidence`(evidence event 로그)를 mastery-engine으로 시점별 재생하여 산출.

**핵심:** θ가 0.0(=수능 평균 난이도 정답률 50%) → +1.0(=수능 상위권)으로 직진. **좌표축은 실측**(`md-graph-db/docs/IRT_CALIBRATION_GUIDELINE.md` b 범위 −3.00~+3.67), **진행 속도는 추정**.

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

# 7 │ 시장·비즈니스 (Investor section)

> *교육적 진단을 끝낸 뒤*, **왜 이 시장에 진입하고, 왜 이 가격에 작동하며, 어떻게 카테고리를 점하는가**.
> 출처: `LECTURE_V2.md` 슬라이드 18–21.

---

## 7-A. TAM — 3개 세그먼트 × 3개 채널

```mermaid
xychart-beta
    title "한국 영어교육 시장 도달 가능 세그먼트 (규모, 만 명/개)"
    x-axis ["고교생 (B2C)","영어교사 (B2B)","교육청 (B2G)"]
    y-axis "규모" 0 --> 60
    bar [50, 3, 0.0017]
```

| 세그먼트 | 규모 | 도달 채널 | 우선 진입 |
|---|---:|---|---|
| 고교 재학생 (수능 응시군) | **약 50만/연** | B2C / B2B2C | 🥇 |
| 영어교사 | 약 **3만** | B2B (ET-Craft 교사 도구) | 🥈 |
| 교육청·학교 | **17개 시·도** | B2G (LMS 어댑터) | 🥉 |

> **베이치헤드:** B2B(교사 도구)로 진입 — 교사 1명 → 학급 30명 = **1:30 레버리지**. 교사 신뢰 확보 후 B2C·B2G로 확장.

---

## 7-B. 단가 비교 — 인간 강사 대비 **100–180배** 저렴

```mermaid
xychart-beta
    title "문항 1개 제작 단가 (원, 로그 스케일)"
    x-axis ["AI 원가","Stage 2 생성","Stage 1 분석","검증·후처리","인간강사 (저)","인간강사 (고)"]
    y-axis "log10(원)" 0 --> 4.5
    bar [1.93, 1.70, 1.48, 0.70, 3.90, 4.18]
```

| 비용 항목 | 단가 |
|---|---:|
| Stage 1 분석 (~1.5K 토큰) | 약 **30원** |
| Stage 2 생성 (~2K 토큰) | 약 **50원** |
| 검증·후처리 (CPU) | 약 **5원** |
| **AI 원가 (문항 1개)** | **약 85원** |
| 인간 강사 제작 단가 (시급 환산) | 약 8,000–15,000원 |
| → **비용 차이** | **약 100–180배** |

> 마진율이 충분히 두꺼워 토큰 가격 인상도 흡수 가능. 자체 데이터 기반 sLLM 파인튜닝 시 비용 추가 1/10.
> 출처: `LECTURE_V2.md` 슬라이드 19 (Azure OpenAI GPT-4-turbo 기준 추정치).

---

## 7-C. D5 모드 vs 인간 1:1 코칭 — 카테고리 정의

```mermaid
xychart-beta
    title "월 단가·시간 도달·일관성 비교"
    x-axis ["월 단가 (만원)","주당 세션","일관성 (0-10)"]
    y-axis "값 (단위 별 정규화)" 0 --> 80
    bar [65, 1.5, 5]
    bar [2, 7, 9]
```

상단 = **인간 1:1 코칭** / 하단 = **ET-Craft D5 모드**

| 항목 | 인간 1:1 코칭 | ET-Craft D5 모드 | 비율 |
|---|---|---|---|
| 월 단가 | 약 **50–80만원** | 약 **1–3만원** (크레딧) | **1/20–1/50** |
| 시간 도달 | 주 1–2회 | **매일** | 5–7배 |
| 데이터 일관성 | 강사별 편차 | 일관 (로그 기반) | — |
| 효용 (인간 코칭 = 100%) | 100% | **70–80%** | — |

> **카테고리 정의:** *70–80% 효용을 1/20–1/50 단가에*. 인간 코칭 시장 자체를 재정의하는 비율.
> 출처: `LECTURE_V2.md` 슬라이드 18.

---

## 7-D. 경쟁 포지셔닝 — 5축에서 우리만 풀스택

```mermaid
xychart-beta
    title "5축 평가 (★ 0–3, 총점)"
    x-axis ["인강(메가·EBSi)","학습지 앱","일반 AI 챗봇","ET-Craft"]
    y-axis "5축 누적 ★" 0 --> 15
    bar [3, 4, 3, 14]
```

| 플레이어 | 콘텐츠 자산 | 진단 깊이 | 생성 자동화 | 저작권 엔진 | LMS 통합 | 총점 |
|---|---|---|---|---|---|---:|
| 인강(메가·EBSi) | ★★★ | ★ | ✗ | ✗ | ✗ | 4 |
| 학습지 앱 | ★★ | ★★ | ✗ | ✗ | ✗ | 4 |
| 일반 AI 챗봇 | ★ | ✗ | ★★ | ✗ | ✗ | 3 |
| **ET-Craft** | ★★ | **★★★** | **★★★** | **★★★** | **★★★** | **14** |

> 인강 회사가 이 자리에 오려면 **AI팀을 처음부터**, AI 회사는 **18년치 수능 데이터를 새로**. 둘 다 시간으로만 살 수 있는 자산.
> 출처: `LECTURE_V2.md` 슬라이드 20.

---

## 7-E. 마일스톤 — 2026.06 베타 → 2027 하반기 sLLM

```mermaid
gantt
    title ET-Craft 로드맵 (체크 가능한 KPI 포함)
    dateFormat YYYY-MM
    section MVP·확장
    베타 런칭 (학교 100명)         :a1, 2026-06, 6M
    B2C 학생 응시 시스템             :a2, after a1, 6M
    section 정책·확장
    B2G 시·도 교육청 계약 3건       :b1, 2027-01, 6M
    sLLM 파인튜닝 (토큰 1/3 절감)   :b2, 2027-07, 6M
    section 장기
    인접 도메인 이식 (국어 비문학)   :c1, 2028-01, 12M
```

| 시점 | 마일스톤 | 핵심 KPI |
|---|---|---|
| **2026.06** | 베타 런칭 (일부 학교) | 교사 100명, 문항 생성 5,000건 |
| **2026 하반기** | B2C 학생 응시 시스템 | 학급 단위 시험 1,000건 |
| **2027 상반기** | B2G 시·도 교육청 확장 | 계약 3건 |
| **2027 하반기** | sLLM 파인튜닝 | 토큰 비용 **1/3** 절감 |
| **장기** | 인접 도메인 (국어 비문학) | 5D 프레임 재사용 |

> 마일스톤마다 *체크 가능한 숫자*. 투자 후 6·12개월 KPI 합의에 그대로 사용 가능.
> 출처: `LECTURE_V2.md` 슬라이드 21.

---

<!-- _class: lead -->

# 한 줄 요약

> **"학습자의 거리, 좌표로 측정한다."**

```mermaid
flowchart LR
    S1["① 갭 인식<br/>Lexile · 어휘 · Bloom"]
    S2["② 역량 분해<br/>12 micro-skill<br/>× 4 mastery"]
    S3["③ 진단<br/>1PL Rasch IRT<br/>CAT"]
    S4["④ 로드맵<br/>Prerequisite DAG<br/>+ Recommender"]
    S5["⑤ 학습<br/>137,745 문항<br/>× 2-Stage LLM"]
    S6["⑥ Progress<br/>θ 이동 +<br/>마스터리 게이트"]

    S1 --> S2 --> S3 --> S4 --> S5 --> S6
    S6 -.재진단.-> S3

    style S1 fill:#fee2e2,stroke:#dc2626
    style S2 fill:#fed7aa,stroke:#ea580c
    style S3 fill:#fef3c7,stroke:#ca8a04
    style S4 fill:#d1fae5,stroke:#059669
    style S5 fill:#dbeafe,stroke:#2563eb
    style S6 fill:#e9d5ff,stroke:#9333ea
```

| 단계 | 핵심 출처 |
|---|---|
| ① 갭 인식 | `md-graph-db/et-craft/lecture_v2.md` |
| ② 역량 분해 | `csat-text-graph-maker/.../micro-skills.ts` (12 skill × `MASTERY_LEVELS`) |
| ③ 진단 | `md-graph-db/docs/IRT_CALIBRATION_GUIDELINE.md` (b ∈ [−3.00, +3.67]) |
| ④ 로드맵 | `.../logicflow/recommender.ts` (`getRecommendations`) |
| ⑤ 학습 | `md-graph-db/docs/DATABASE_ARCHITECTURE.md` (137,745) + ET-Craft lineage (9 검증기, Issue Code) |
| ⑥ Progress | `csat-graphdb-318/.../schema.ts` (`learnerMastery`, `learnerEvidence`) |

---

# 부록 — 데이터 출처 (재현성)

## ✅ 실측 · 정규(canonical) 자료

- 12 micro-skill 정의·목표·선수관계 — `csat-text-graph-maker/src/lib/logicflow/micro-skills.ts` (`GRADE1_TARGETS`)
- 12-canonical 결정 (Layer A+B+C, D 제외) — `logicflow-corpus/docs/skill-mapping.md` (D2, 2026-05-17)
- 학습 자산 137,745 · 진단 9,017 · 어휘 9,183 — `md-graph-db/docs/DATABASE_ARCHITECTURE.md`
- IRT 1PL Rasch · b 범위 −3.00~+3.67 · Warm-start — `md-graph-db/docs/IRT_CALIBRATION_GUIDELINE.md`
- 교과과정 누적 어휘 800/2,300/4,000/6,000 word families — `ai-english-platform/app/api/dashboard/vocab-level/route.ts` (`CURRICULUM_BANDS`)
- Lexile 학년 표(중3 700L~수능 1200L) · Bloom 비대칭 · 93초/문항 — `md-graph-db/et-craft/lecture_v2.md`
- Recommender 우선순위·reason 로직 — `csat-text-graph-maker/src/lib/logicflow/recommender.ts`
- 2-Stage 파이프라인 · 3-Layer 검증 — `md-graph-db/et-craft/ET-Craft_Presentation.md`
- 19개 수능 유형 ↔ 12 skill 매핑 — `csat-text-graph-maker/.../micro-skills.ts` `QUESTION_TYPE_SKILL_MAP`
- `learnerMastery` / `learnerEvidence` / `diagnosticSessions` 스키마 — `csat-graphdb-318/src/lib/db/schema.ts`

## ⚠️ 추정 · 보류 자료 (실측 대기 중)

다음 슬라이드의 학습자 수치는 정성 진단에서 역추정한 **placeholder**입니다. 추정 사실은 본문 슬라이드에도 명시 라벨링되어 있습니다.

| 슬라이드 | 추정 항목 | 실측 산출 방법 (예정) |
|---|---|---|
| 2-A 하단 막대 | 12 skill 교과과정 도달치 (65/60/55/50/50/45/40/45/55/35/40/35) | 신규 가입 7일 이내 첫 진단 완료자의 skill별 평균 (`learnerMastery`, n≥30) |
| 6-A Before/After | 12 skill × 2(Before·After) = 24개 수치 | 개입 전 첫 진단 vs 56일 후 재진단의 페어드 코호트 평균 (`learnerEvidence` 시점 재생) |
| 6-B 마스터리 분포 | (3,9,0,0) → (0,4,8,0) | 6-A와 동일 코호트의 skill별 `MASTERY_LEVELS` 카운트 |
| 6-C θ 곡선 | W0–W12 7개 값 | 6-A 코호트의 주별 평균 θ (Rasch 척도, mastery-engine 재생) |

**현 상태 (2026-05-18):**

- 스키마 점검: ✅ 모든 테이블·컬럼 존재 (`csat-graphdb-318` 검증 완료)
- 데이터 점검: ❌ production 학습자 누적 0 (3개 레포 모두 demo-user / visitor=default MVP 단계)
- 재개 트리거: production 배포 후 distinct uid 30+, 또는 학원·학교 pilot 코호트 형성 시
- PDCA 추적: [docs/01-plan/features/slides-cohort-replacement.plan.md](docs/01-plan/features/slides-cohort-replacement.plan.md) §8 (Plan-B)

**투자자 Q&A 응대 가이드:** "이 수치는 추정입니다 — 다만 ① 어떤 코호트로 ② 어떤 쿼리로 교체할지 ③ 어떤 임계값(n≥30)에서 신뢰할지가 모두 Plan §8에 명시되어 있고, 동일 시스템(`learnerMastery` API)이 운영 중입니다. 데이터 회사답게 *측정 방법론을 먼저 정의*하고 있습니다."
