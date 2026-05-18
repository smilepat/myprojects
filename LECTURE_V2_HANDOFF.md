# HANDOFF — ET-Craft 강의안 v2 작업 세션

> **세션 일자:** 2026-05-18
> **참여자:** Pat (smilepat) · Claude (Opus 4.7)
> **목적:** EdTech 경영자·투자자 대상 60분 강연안 v1을 ET-Craft 실레포 데이터 기반으로 v2 풀버전 재작성
> **산출물:** `et-craft/lecture_v2.md` (이 문서와 동일 폴더)

---

## 1. 세션 개요

### 입력
- v1 강의안 마크다운 (사용자 직접 제공): "수능 영어와 교과과정의 갭, 그리고 AI 맞춤 학습이라는 해법"
- 23 슬라이드 + 부록 3종 구성, `[데이터 확인]` 표시 8곳

### 사용자 요구사항
- **청중 비중:** 경영자·투자자 중심으로 재배분 (개발자는 일부)
- **레퍼런스:** GitHub 레포 `smilepat/md-graph-db`에서 실제 데이터·아키텍처 정보 추출하여 강의안 개선
- **LLM 서사:** v1의 "한국 모델 우위" 서사를 **엔터프라이즈 Azure + 멀티모달 Gemini** 서사로 정정
- **결과물 저장:** `C:\tmp\lecture_v2.md` (로컬), 이후 레포 `et-craft/` 폴더로 푸시

---

## 2. 분석 결과: v1 vs. 실제 레포 갭

| 항목 | v1 강의안 기재 | 실제 레포 사실 | 정정 우선순위 |
|------|---------------|----------------|---------------|
| 제품명 | LogicFlow Dashboard | **ET-Craft** (English Teaching Craft) | 🔴 신뢰성 |
| LLM 스택 | EXAONE 3.5 / Solar Pro / Qwen 2.5 | **Azure OpenAI GPT-4-turbo + Google Gemini 2.5 Flash** | 🔴 사실관계 |
| 지식 그래프 | Neo4j + HNSW vector, 12 노드 × 17 엣지 | **SQLite + JSON 배포** (`vocab_master.sqlite`, `graph_data.json`). Graph DB는 `DB_REFINEMENT_PROPOSAL.md`의 향후 제안 | 🔴 사실관계 |
| IRT 모델 | 2PL/3PL 단정 | **현재 1PL Rasch (Cold-Start)**, 2PL/3PL은 캘리브레이션 Phase 2 로드맵 | 🟡 단계 서술 |
| 진단 프레임 | 12 Micro-skill × Layer A–D | **5D Diagnostic (D1 Form ~ D5 Usage) × 3단계** | 🟡 통일 |
| 데이터 규모 | `[데이터 확인]` (8곳) | 9,183 단어 / 9,017 IRT 문항 / 70,000 퀴즈 / **137,745 학습 문항** / 44 수능 유형 | 🟢 교체 |
| 성과 지표 | `[데이터 확인]` | **20초 내 문항 생성, 교사 시간 85% 절감** | 🟢 교체 |
| B2G | 경기도교육청 채택 | 레포 내 확인 불가 (Java Spring LMS 연동 구조는 확인) | 🟡 본인 검증 |

---

## 3. 실데이터 레퍼런스 (향후 강연·문서 작성 시 재사용)

### 어휘 데이터 자산 (출처: `docs/DATABASE_ARCHITECTURE.md`)
- **9,183 단어** × 58 속성 (`9000word_full_db.csv` — 마스터)
- **CEFR 6단계** 분할 (A1 ~ C2)
- **Lexile 분할** (100L ~ 1300L 단계별)
- AWL · CSAT · TOEFL 별 카테고리 분리
- 진단·학습 도메인 분리 운영

### IRT 캘리브레이션 (출처: `docs/IRT_CALIBRATION_GUIDELINE.md`)
- **9,017 문항** 1PL Rasch 적용
- `b_value` 범위 `−3.00 ~ +3.67` (Z-score 변환)
- `a_value = 1.0` 고정 (Cold-Start)
- 빈도순위(Zipf's law) 기반 초기 캘리브레이션
- 로드맵: Phase 1 실정답률 기반 b 재추정 → Phase 2 a 해금 2PL → Phase 3 Warm-Start

### 학습 DB (출처: `docs/DATABASE_ARCHITECTURE.md` 섹션 6)
- **137,745개 학습 문항** = 9,183 단어 × 5D × 3단계
- `learning_step` = 1(매우 쉬움, b−1.0) / 3(평균, b±0) / 5(심화, b+1.0)
- CEFR 레벨별 `learning_{Level}.json` 패키징
- Gemini 2.5 Flash × **45,915 호출**로 생성

### ET-Craft 제품 (출처: `et-craft/ET-Craft_Presentation.md`)
- **44개 수능 문항 유형** (RC18~RC45 독해 28종 + LC01~LC17 듣기 16종)
- **2-Stage LLM 파이프라인** (Stage 1 분석 → Stage 2 생성)
- **Type Router** = 규칙 45% + LLM 55% 가중합
- **6-규칙 저작권 엔진** (Shingle, 3-gram Jaccard, 사실무결성, 구문구조, 어휘밀집도, 담화구조) + Grade A~F 분류 + light/medium/deep 변환 제안
- Pydantic 스키마 + Response Normalizer 이중 검증
- **20초 내 1문항 생성**, 교사 시간 **85% 절감** 목표

### 기술 스택
- **Frontend:** Next.js 15.5.9 · React 19.2.3 · TypeScript 5 · Tailwind v4 · @dnd-kit · recharts 3
- **Backend:** FastAPI 0.115 · Pydantic 2.11 · SQLAlchemy 2.0 · Redis (UUID 토큰, JWT 미사용)
- **LLM:** Azure OpenAI (GPT-4-turbo) 주력 · Google Gemini 2.5 Flash 이미지·폴백
- **TTS:** Microsoft Edge TTS (6개 영어 음성)
- **외부:** Java Spring API (기존 학사 LMS 어댑터) · Azure Blob Storage

### 운영 인프라
- 프롬프트 3-환경: `production/` · `staging/` · `archive/`
- `/api/generate/compare` 엔드포인트 — 동일 지문 production vs staging A/B
- 약 3일 주기 staging → production 롤아웃 사이클
- 증거: `lc_backup_20260206/`, `base_production_backup_20260209.py`

---

## 4. 결정 사항 (의사결정 기록)

| 결정 | 옵션 | 채택 | 근거 |
|------|------|------|------|
| 작업 범위 | (a) 풀버전 v2 (b) 부분 정정 (c) 신규 슬라이드만 (d) 구조 재설계 | **(a) 풀버전 v2** | 사실관계·데이터·톤·구조 모두 손볼 항목이 많아 일괄 처리가 효율적 |
| LLM 서사 | (a) Azure/Gemini로 정정 (b) 한국 모델은 로드맵 (c) LLM 종속 최소화 | **(a) Azure/Gemini로 정정** | 실제 스택과 일치, B2G 데이터 주권·SLA 서사가 더 강함 |
| 저장 위치 | (a) C:\tmp (b) 홈 (c) 레포 | **(a) C:\tmp + 이후 레포 푸시** | 검토 후 푸시 단계 분리 |
| 푸시 위치 | (a) et-craft/ master 직접 (b) 서브폴더 (c) PR | **(a) et-craft/ master 직접** | 기존 ET-Craft 문서들과 같은 위치, 소유자 본인이 master 직접 운영 중 |

---

## 5. v2에서 변경된 내용 (변경 추적)

### 사실관계 정정
- 제품명 · LLM 스택 · 그래프 DB · IRT 모델 · 진단 프레임 모두 실레포 기반으로 수정

### 실데이터 교체 (`[데이터 확인]` → 실수치)
- 슬라이드 13 (데이터 자산), 14 (IRT), 15 (생성 파이프라인), 18 (D5), 19 (유닛 이코노믹스), 20 (TAM·경쟁) 모두 실수치 적용

### 신규 슬라이드 3장
- **#16 6-규칙 저작권 엔진** — 한국 EdTech 카테고리 정의급 차별화
- **#17 Java Spring LMS 어댑터** — B2G 도입 장벽 우회 GTM
- **#19 유닛 이코노믹스** — 문항당 약 85원 vs 인간 강사 100–180배 비용 곡선

### 톤 조정 (경영자·투자자 중심)
- Part 1 (역량 정의) 12분
- Part 2 (갭 정량화) 10분
- **Part 3 (해법·사업) 18분** (← v1 12분에서 확대, 기술 디테일 압축)
- 기술 슬라이드는 12·14·15만 유지, 나머지는 부록 Q&A로 이관

### 부록 강화
- 부록 A: Q&A 5문항 사전 답변 (한국 모델 / 1PL 선택 / 저작권 / 교사 대체 / Azure 의존도)
- 부록 B: Talk Track 강조 포인트 + 시간 배분 가이드
- 부록 C: v1 → v2 변경 추적 표
- 부록 D: 데이터 출처 + 본인 검증 필요 항목

---

## 6. Open Items (발표 전 본인 검증 필요)

| 항목 | 현재 상태 | 검증 액션 |
|------|----------|----------|
| 경기도교육청 채택 실제 여부 | 레포에서 미확인 | 채택 시 슬라이드 17·20 보강, 미채택 시 "교육청 협력 모델" 수준으로 톤다운 |
| 문항당 85원 추정치 | Azure GPT-4-turbo 토큰 단가 기반 추정 | 실제 운영 로그로 실측 (입력/출력 토큰 평균 계측) |
| 베타 KPI 합의 | 슬라이드 21에 임의 목표 (교사 100명·문항 5,000건) | 팀 내부 합의 후 확정 |
| 17 시·도 교육청 B2G 단가 | 슬라이드 20에서 `?` 표기 | 1개 교육청 PoC 기준 단가 확정 후 갱신 |
| 슬라이드 8·9 도식화 | 마크다운 표 형태 | PPT 변환 시 차트·도식 재구성 권장 |

---

## 7. 다음 단계 옵션

세션 종료 시점에 사용자에게 제안된 후속 작업:

- **A. PPT 자동 변환** — pptxgenjs로 .pptx 파일 생성 (각 H2 → 슬라이드 제목, blockquote → speaker note)
- **B. 슬라이드별 50분 Talk Track 풀버전** — 각 슬라이드별 실제 발화 스크립트 작성
- **C. 도식·차트 시각화 가이드** — 슬라이드 8·9·12·15·17 도식 디자인 가이드
- **D. 투자자 IR 1-pager** — 강의안 핵심을 1장 IR 자료로 압축
- **E. Q&A 시나리오 트레이닝** — 부록 A 5문항 외 예상 질문 확장

다음 세션 시작 시 위 옵션 중 선택 또는 신규 작업 지시 가능.

---

## 8. 산출물 파일 매니페스트

| 파일 | 경로 | 크기 | 설명 |
|------|------|------|------|
| 강의안 v2 | `et-craft/lecture_v2.md` | 약 26 KB | 23 슬라이드 + 부록 4종, 경영자·투자자 톤 |
| 핸드오프 | `et-craft/HANDOFF.md` | 이 파일 | 세션 기록·실데이터 레퍼런스·미해결 항목 |

**로컬 원본 (작업용):** `C:\tmp\lecture_v2.md`, `C:\tmp\HANDOFF.md`

---

## 9. 작업 메소드 (재현 가능성)

향후 같은 종류의 작업(레포 기반 강연·문서 작성)을 자동화·재현하기 위한 메모:

1. **레포 탐색** — `gh search repos` → `gh api repos/.../contents` → 핵심 문서 base64 디코드
2. **갭 매트릭스 작성** — v1 기재 vs 실레포 사실 비교표 우선 작성 (신뢰성 리스크 식별이 1순위)
3. **수치 교체** — `[데이터 확인]` 표시 일괄 검색 후 실수치 매핑
4. **신규 슬라이드 후보** — 레포에 있으나 v1에 빠진 *카테고리 정의급 차별화 요소* 식별
5. **톤 재배분** — 청중 비중에 따른 시간·슬라이드 가중치 재계산
6. **부록 강화** — Q&A 예측·변경 추적·데이터 출처를 별도 부록으로 분리

---

> **세션 종료 메모:** 강의안 v2는 데이터 기반으로 v1 대비 신뢰성·정량성·차별화 메시지가 강화되었으나, 사용자 본인의 사실 검증(경기도교육청·실측 비용·내부 KPI) 없이 발표에 그대로 사용하면 안 됨. 부록 D의 검증 체크리스트를 발표 전 반드시 통과시킬 것.
