# Pat의 EdTech 프로젝트 소개

> **EFL Content Developer & EdTech Builder** | 강원도, 대한민국
> 수능 영어를 중심으로 한 **온톨로지 기반 통합 학습 생태계** 구축 중

---

## 📌 한 줄 요약

수능 영어를 중심으로 어휘·지문·교육과정 데이터를 온톨로지 그래프로 통합하고, AI 분석 엔진과 EFL 학습자·교사용 앱을 결합해 "구조적 이해" 기반 학습 생태계 **LogicFlow**를 구축하는 EdTech 프로젝트입니다.

---

## 🎯 핵심 비전

**LogicFlow** — 수능 영어 종합 학습 플랫폼 (베타 2026.6 목표)
온톨로지(개념 간 관계)와 그래프 DB를 활용해 "암기"가 아닌 "구조적 이해"로 영어를 배우는 학습 생태계.

---

## 🏛️ 프로젝트 아키텍처 (3-Layer)

### 🟦 Layer 1 — Data Infrastructure (데이터 계층)

| 프로젝트 | 규모 | 역할 |
|---------|------|------|
| **[vocabulary-db](https://github.com/smilepat/vocabulary-db)** | 9,000+ 단어, 58컬럼 | 한국 영어교육 어휘 마스터 DB |
| **vocab-knowledge-graph** | 8,958 단어 / 50,000+ 관계 | Neo4j 기반 어휘 지식 그래프 |
| **[csat-reading-text-db](https://github.com/smilepat/csat-reading-text-db)** | 565 지문, 12,849 문장 | 수능 리딩 텍스트 DB + NL2SQL 도구 |
| **csat-graphdb-318** | 565 Question 노드, R²=0.56 난이도모델 | 수능 기출 GraphDB 플랫폼 |
| **[Korea-curri-standards-db](https://github.com/smilepat/Korea-curri-standards-db)** | — | 한국 영어 교육과정 성취기준 DB |

### 🟩 Layer 2 — Processing & Analysis (처리/분석 계층)

| 프로젝트 | 기능 |
|---------|------|
| **[logicflow-corpus](https://github.com/smilepat/logicflow-corpus)** | Discourse-aware corpus infrastructure (담화 인식 코퍼스) |
| **[semantic_link_analyzer](https://github.com/smilepat/semantic_link_analyzer)** | 수능 지문 의미 연결 자동 측정 → D1~D5 난이도 자동 판정 |
| **[stax-analyzer-hub](https://github.com/smilepat/stax-analyzer-hub)** | 5개 분석 도구 통합 Hub (read-only adapter) |
| **[copyright-cleansing](https://github.com/smilepat/copyright-cleansing)** | 수능 교육 콘텐츠 저작권 안전 엔진 (CopyRight Shield v3.0) |
| **[sentence-complexity-levels](https://github.com/smilepat/sentence-complexity-levels)** | 문장 복잡도 레벨링 |

### 🟨 Layer 3 — Learning Applications (학습 앱 계층)

| 프로젝트 | 타겟 사용자 |
|---------|------------|
| **[ontology-english-learning-solution](https://github.com/smilepat/ontology-english-learning-solution)** | LogicFlow 메인 구현체 |
| **efl-reading-trainer** ([Live](https://efl-reading-trainer.vercel.app)) | 문법번역식 EFL 학습자 → 읽기 과정 훈련 (4 스킬 모듈) |
| **[vocab-cat-test](https://github.com/smilepat/vocab-cat-test)** | IRT 2PL + Fisher Information 기반 적응형 어휘 진단 (Python/FastAPI + React 19, 162 tests pass) — 5차원 분석 + CEFR A1~C1 자동 매핑, 15~40문항으로 100문항급 정확도 |
| **[level-test-pat](https://github.com/smilepat/level-test-pat)** | 6단계 적응형 영어 레벨 테스트 (초~유학) |
| **[vocab-learn-pat](https://github.com/smilepat/vocab-learn-pat)** | 5D Learning Engine — 137,745 학습문항 |
| **[hotelier-english](https://github.com/smilepat/hotelier-english)** | 호텔리어 영어 응대 훈련 |
| **[ai-english-platform](https://github.com/smilepat/ai-english-platform)** | 교사 중심 개별화 교육 플랫폼 |

---

## 🛠️ 표준 기술 스택

```
Frontend   │  Next.js 15/16 + TypeScript + React 19 + Tailwind v4 + shadcn/ui
Charts     │  Recharts v3, D3.js
DB         │  Turso/LibSQL (edge) + Firebase (auth+storage) + Neo4j Aura (graph)
AI         │  Claude API (Haiku), Gemini 2.0 Flash (semantic + embedding)
Hosting    │  Vercel (team: prompt-improvement-dm-pat)
IDE        │  VS Code + Claude Code
```

---

## 🌟 차별화 포인트

1. **온톨로지 기반 통합** — 어휘·문장·지문·스킬이 단일 지식 그래프로 연결
2. **수능 특화** — 565개 기출 지문 분석, IRT/CEFR/Lexile 다중 측정
3. **데이터 기반 난이도** — AI 의미연결 분석으로 D1~D5 자동 판정 (R²=0.56)
4. **EFL 학습자 맞춤** — 한국 학습자의 번역 의존 → 직독직해 전환 훈련
5. **교사 협업** — TESOL Connect Studio로 현장 교사도 콘텐츠 생성 가능

---

## 🤝 비즈니스 연결

- **[tesol-bkit](https://github.com/smilepat/tesol-bkit)** — 강원도 영어교육 혁신 AI 교사 지원 플랫폼 제안서
- **[EBS-demo](https://github.com/smilepat/EBS-demo)** — 2022 개정 교육과정 문항 생성 시스템
- **[csat-item-factory](https://github.com/smilepat/csat-item-factory)** — 자율 운영 수능 문항 생성 AI 회사

---

📂 **GitHub**: [github.com/smilepat](https://github.com/smilepat) | 활성 레포 47개+
