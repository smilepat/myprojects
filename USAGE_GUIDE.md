# 영어교육 앱 개발 & 학습 활용 가이드

## 1️⃣ 학습자 진단 (Diagnosis) — "지금 내 수준 정확히 알기"

### 어휘 수준 진단 (vocab-cat-test)
- **IRT 2PL + Fisher Information 알고리즘**으로 **15~40문항만에 100문항 고정형 수준의 정확도** 달성
- 9,183개 단어 × 58개 메타데이터 컬럼 기반 → 단순 "맞춤/틀림"이 아닌 **CEFR A1~C1 확률 분포** 자동 산출
- **5차원 분석 영역**: 의미(Meaning) · 관계(Relation) · 맥락(Context) · 형태(Form) · 화용(Pragmatic)
- "이 학생은 B1+ 수준인데 추상 어휘·연어(collocation)에서 약하다" 같은 **세부 약점 자동 추출**
- **기술 스택**: Python 3.13 + FastAPI + NumPy/SciPy (Backend), React 19 + TypeScript + Vite (Frontend), PostgreSQL/SQLite + Alembic, Docker + Cloud Run/Vercel 배포 — **162개 테스트 100% pass**

### 리딩 수준 진단
- **level-test-pat**: 초등~유학 6단계 적응형 진단 → 어떤 텍스트 난이도부터 시작해야 할지 결정
- **csat-graphdb-318**: 565개 수능 기출 중 학습자에게 **적정 난이도의 지문 자동 추천** (R²=0.56 난이도 모델)
- **sentence-complexity-levels**: 문장 단위 복잡도 평가 → "이 학생은 단문은 90% 이해하지만 복문에서 무너진다" 진단

> **앱 개발자가 할 수 있는 것**: 회원가입 직후 5~10분 진단으로 학습 경로를 개인화하는 **콜드 스타트 솔루션** 즉시 구축

---

## 2️⃣ 콘텐츠 생성 (Content Generation) — "원하는 만큼 양질의 문제 생산"

### 어휘 문제 자동 생성
- **vocab-learn-pat (5D Learning Engine)**: 9,000 단어 × 5차원(의미/형태/맥락/연어/의미관계) = **137,745개 학습문항 자동 생성** 완료
- Claude Haiku로 추가 문항 무한 생성 가능 — 객관식/주관식/문맥형/매칭형 등 다양한 유형

### 수능형 문항 생성
- **csat-item-factory**: 자율 운영 수능 영어 문항 생성 AI 시스템 (Paperclip + CSAT Agent Team)
- **EBS-demo**: 2022 개정 교육과정 성취기준에 맞춘 문항 자동 생성
- **copyright-cleansing**: 생성 콘텐츠의 **저작권 안전성 자동 검증** (CopyRight Shield v3.0)

### 리딩 자료 큐레이션
- **csat-reading-text-db**: NL2SQL로 "B2 수준 환경 주제 지문 10개" 같은 **자연어 요청으로 즉시 검색** 가능
- 218 lexile 지문 + 565 수능 지문 + 9,000+ 단어 메타데이터로 **맞춤형 교재 즉석 조합**

> **교사가 할 수 있는 것**: "고2 환경 단원, 어휘는 학생 평균에 맞추고 길이는 200단어, 빈칸유형 10문항" 한 줄 명령으로 워크북 완성

---

## 3️⃣ 학습 훈련 (Training) — "약점 정확히 겨냥한 반복"

### 4층 리딩 스킬 훈련 (efl-reading-trainer)

| 스킬 층위 | 훈련 모듈 | 목적 |
|----------|----------|------|
| Bottom-up | **Chunk Builder** | 의미 덩어리 단위로 끊어 읽기 |
| Bottom-up | **Skeleton Finder** | 문장 골격(주어·동사·목적어) 추출 |
| Bridge | **Logic Connector** | 문장 간 논리 관계 파악 (인과/대조/예시) |
| Top-down | **Main Idea Lab** | 단락 핵심 메시지 도출 |
| Meta | **Reading Profile Dashboard** | 자신의 약한 스킬 시각화 |

→ **한국 EFL 학습자의 고질병인 "번역 의존 → 직독직해" 전환 훈련**에 최적화

### 어휘 심화 학습
- **5D Learning**: 한 단어를 5개 차원으로 반복 노출 → 깊이 있는 어휘 지식(Depth of Vocabulary Knowledge) 구축
- **vocab-knowledge-graph**의 50,000+ 관계 데이터로 **연관 단어 자동 추천** (synonym/antonym/hypernym/collocation)

### 적응형 복습
- IRT 기반으로 **틀린 문제만 무한 반복이 아닌, "지금 풀면 80% 맞출 수 있는 난이도" 자동 출제** → 학습 동기 유지

---

## 4️⃣ 분석 & 피드백 (Analytics) — "왜 틀렸는지 구조적으로 설명"

### 지문 난이도 분해 분석
- **semantic_link_analyzer**: 수능 지문의 "의미가 멀어지는 정도"를 D1~D5로 자동 판정 → 학생이 어디서 막혔는지 추적
- **logicflow-corpus**: 담화 표지(discourse marker) 인식으로 **글의 논리 흐름 시각화**
- **stax-analyzer-hub**: 5개 분석 도구를 한 번에 돌려 종합 리포트 생성

### 학습 궤적 시각화
- **Recharts 기반 대시보드**로 어휘량/리딩속도/정답률/스킬별 성장 그래프 제공
- Neo4j 그래프 시각화로 "내가 아는 단어와 모르는 단어의 네트워크" 표시 → 학습 동기부여

> **학생이 얻는 것**: "그냥 틀렸다"가 아니라 **"이 문제는 D4 난이도이고, 너는 추상어휘는 약하지만 논리 연결은 강하니까 단어를 먼저 보완하자"** 같은 **설명 가능한 피드백**

---

## 5️⃣ 교사 협업 (Teacher Empowerment) — "코딩 없이 교사도 콘텐츠 제작"

### TESOL Connect Studio (tesol-bkit, TESOL_vibecoding)
- 교사가 **자신의 학급 데이터로 맞춤 퀴즈/교재 제작**
- 강원도 영어교육 혁신 제안서로 **지자체 교육청 단위 도입** 추진 중

### 다중 사용자 대시보드 (mydev_diary_tesol)
- Firebase Auth로 교사별 계정 관리
- 학급별/학생별 학습 데이터 공유 및 진도 관리

---

## 6️⃣ 통합 활용 시나리오 — "끝에서 끝까지 (E2E)"

### 시나리오 A: 고등학교 1학년 한 학기 코스

```
1주차  진단(level-test-pat + vocab-cat-test)
       → 학생 수준 좌표 결정 (예: B1, 어휘 5,200, 약점=추론)
2~4주  맞춤 지문 추천(csat-reading-text-db)
       + 리딩 스킬 훈련(efl-reading-trainer)
5~8주  약점 보강(5D vocab + Logic Connector 집중)
9~12주 수능 기출 적응(csat-graphdb-318)
       난이도 D1→D5 점진 상승
13주   재진단 → 성장 리포트 + 다음 학기 계획 자동 생성
```

### 시나리오 B: 사교육 영어 학원 운영
- **교재 제작 시간 80% 감축** (csat-item-factory + copyright-cleansing)
- **학생별 맞춤 숙제 자동 생성** (vocab-learn-pat)
- **학부모 리포트 자동 발송** (ai-english-platform 대시보드)

### 시나리오 C: 자기주도 학습 앱
- 매일 10분 적응형 어휘 (5D)
- 매주 1지문 정독 훈련 (efl-reading-trainer)
- 월 1회 수능 모의 (csat-graphdb-318)
- → **3개월 만에 수능 1등급 진입** 가능한 데이터 기반 학습

---

## 🎁 개발자/교육자에게 주는 가치 요약

| 누가 | 무엇을 할 수 있나 |
|------|-----------------|
| **앱 개발자** | DB·진단 엔진·문제 생성기 API만 조합하면 **6개월 걸릴 앱을 1개월에 출시** |
| **공교육 교사** | 교과서 단원에 맞는 문제·지문·진단을 **클릭 한 번에 학급 맞춤 제공** |
| **사교육 운영자** | 강사 1명당 관리 학생 수 2배 확장, 콘텐츠 단가 1/10 절감 |
| **학생** | "왜 못하는지" 설명 가능한 학습 + 자기 수준 정확히 맞는 훈련 |
| **연구자** | 565 수능 지문·9,000 단어·12,849 문장의 **공개 가능 영어교육 코퍼스** 활용 |
