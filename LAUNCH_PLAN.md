# 앱스토어 출시 계획 — AI 파닉스 → 수능 영어 통합 솔루션

> **코드명**: LogicFlow K-12
> **출시 목표**: iOS App Store + Google Play (Universal Korean K-12 EFL)
> **타임라인**: 12개월 (베타 6개월차, 정식 9개월차)
> **작성일**: 2026-05-15

---

## 0. Executive Summary

기존 47개 EdTech 자산(README.md 기준)은 **어휘 진단(IRT) → 리딩 훈련(4-layer) → 수능 적응(GraphDB)** 까지의 파이프라인이 이미 완성되어 있다. 단일 앱으로 묶을 때 빠진 조각은 **"파닉스 + 사이트 워드"의 입문 단계**와 **모바일 셸/결제/컴플라이언스** 세 가지뿐이다. 신규 개발은 이 3개에만 집중하고, 나머지는 기존 자산을 API/WebView로 통합한다.

**한 줄 가치 제안**: "만 5세 알파벳부터 고3 수능 1등급까지, AI가 진단하고 맞춤 훈련하는 단 하나의 앱"

---

## 1. 학습 경로 (Learning Spine) — 7-Stage

| Stage | 연령/학년 | CEFR | 핵심 모듈 | 기존 자산 활용 |
|-------|----------|------|-----------|--------------|
| **S1 Phonics** | 5–7세 | Pre-A1 | 알파벳·44 phonemes·디코딩 | 🆕 신규 |
| **S2 Sight Words** | 7–9세 | A1 | Dolch/Fry 220 + decodable readers | 🆕 신규(부분) |
| **S3 Early Reading** | 초3–4 | A1–A2 | 짧은 지문 + 기초 어휘 | vocab-learn-pat (subset) |
| **S4 Intermediate** | 초5–중1 | A2–B1 | 5D 어휘 + 문장 골격 | vocab-learn-pat, efl-reading-trainer (Chunk Builder) |
| **S5 Advanced Skills** | 중2–3 | B1–B2 | 4-layer 리딩 + 지문 정독 | efl-reading-trainer (full), sentence-complexity-levels |
| **S6 CSAT Foundation** | 고1–2 | B2 | 수능 기출 적응 D1→D3 | csat-graphdb-318, csat-reading-text-db |
| **S7 CSAT Mastery** | 고3 | B2–C1 | IRT 적응형 D3→D5 + 모의 | csat-item-factory, semantic_link_analyzer |

**전환 기준**: 각 Stage 종료 시 vocab-cat-test + level-test-pat 재진단 → 자동 진급/보강.

---

## 2. 신규 개발 모듈 — AI Phonics Engine

기존 47개 레포 중 파닉스는 없으므로 **유일한 신규 풀스택 개발**.

### 2.1 기능 요구
- **알파벳 인식**: 26자 듣기/말하기/쓰기(터치 트레이싱)
- **음소 학습**: 44 phonemes × short/long vowels × consonant blends
- **디코딩 게임**: CVC → CVCC → blends → digraphs 단계별 진행
- **AI 발음 평가**: 음성 입력 → 음소 단위 정확도 피드백
- **부모 리포트**: 주간 진도/약점 음소 자동 메일

### 2.2 기술 선택
- **STT**: Azure Speech Services (Pronunciation Assessment API) — 음소 단위 점수 제공. Whisper는 음소 평가 불가.
- **TTS**: ElevenLabs (자연스러운 아동 친화 음성) 또는 Azure Neural TTS (저비용)
- **트레이싱**: react-native-skia (60fps 손글씨 인식)
- **게이미피케이션**: Lottie 애니메이션 + 별/배지 시스템

### 2.3 콘텐츠 데이터셋
- 영국 Synthetic Phonics (Letters and Sounds Phase 1–6) 커리큘럼 매핑
- 한국 EFL 특화 음소 약점(/r/–/l/, /f/–/p/, /θ/–/s/) 강화 트랙 별도
- 1,000개 decodable sentence × Claude Haiku 생성 + copyright-cleansing 검증

---

## 3. 기술 스택 — 앱스토어 배포 가능 형태

```
모바일 셸    │ Expo (React Native) + EAS Build
            │   ├─ react-native-webview (기존 Next.js 모듈 즉시 통합)
            │   └─ Native 모듈: Phonics(Skia), Speech(Azure SDK)
Web 기존자산 │ Next.js 15 그대로 → Vercel 호스팅 → WebView로 로드
Backend     │ Turso (학습 데이터) + Firebase (Auth/Storage)
            │ Neo4j Aura (vocab-knowledge-graph) — 기존 유지
AI          │ Claude Haiku (콘텐츠/피드백 생성, 캐싱 필수)
            │ Azure Speech (발음 평가, 음소 단위)
            │ Gemini 2.0 Flash (semantic_link_analyzer 연동)
결제        │ RevenueCat (iOS IAP + Android Billing 통합)
분석        │ PostHog (이벤트) + Sentry (크래시)
빌드        │ EAS Cloud Build (C드라이브 NTFS 이슈 회피)
```

### 3.1 하이브리드 전략의 근거
- 기존 efl-reading-trainer, vocab-cat-test 등은 **Next.js 기반 PWA** → WebView로 그대로 탑재하면 재개발 0.
- 파닉스만 **네이티브 컴포넌트**로 구현 (드로잉/음성 지연 최소화).
- 6개월 후 PMF 확인되면 핵심 모듈부터 React Native 네이티브로 점진 이전.

---

## 4. 마일스톤 (12개월)

| 월 | 마일스톤 | 산출물 |
|----|---------|--------|
| M1 | 모노레포 셋업 + Expo 셸 초기화 | EAS 빌드 파이프라인, RC iOS/Android |
| M2 | 파닉스 PoC (알파벳 5자) | Azure Speech 통합, Skia 트레이싱 |
| M3 | 진단 통합 (vocab-cat-test + level-test-pat WebView) | 5분 콜드스타트 진단 흐름 |
| M4 | Stage S1–S2 콘텐츠 완성 | 1,000 decodable sentence + 게이미피케이션 |
| M5 | Stage S3–S5 통합 (efl-reading-trainer 임베드) | 4-layer 트레이너 모바일 UX 최적화 |
| **M6** | **Closed Beta — TestFlight + Play Internal** | 200명 모집 (강원도 교사 네트워크 활용) |
| M7 | 결제 통합 (RevenueCat) + 부모 대시보드 | Freemium → Pro 전환 흐름 |
| M8 | Stage S6 (CSAT Foundation) + copyright 최종 검증 | 565 지문 사용권 정리 |
| **M9** | **정식 출시 v1.0** | App Store + Play Store 동시 |
| M10 | Stage S7 (CSAT Mastery) 정식 오픈 | IRT 적응형 모의고사 |
| M11 | B2B 학원/학교 라이선스 페이지 | tesol-bkit 연동 |
| M12 | v1.1 — 성장 리포트 자동 생성 + 학부모 알림 | 재진단 → 다음 학기 계획 자동화 |

---

## 5. 수익화 모델

| 플랜 | 가격 | 포함 |
|------|------|------|
| Free | ₩0 | 진단 1회, S1 파닉스 30% |
| Pro Monthly | ₩14,900/월 | 전 Stage 무제한 |
| Pro Annual | ₩119,000/년 (33% 할인) | 전 Stage + 월간 리포트 |
| Family | ₩24,900/월 | 자녀 3명 + 부모 대시보드 |
| CSAT Sprint | ₩99,000/일시불 | 고3 D-100 집중 패키지 |
| B2B 학원 | 학생당 ₩9,000/월 (50명+) | 강사 대시보드 + 숙제 자동 출제 |

**LTV 가정**: Pro 평균 구독 기간 4.5개월 → ARPU ₩67,000. 광고비 CAC ₩20,000 이하 유지가 목표.

---

## 6. 컴플라이언스 & 앱스토어 정책

### 6.1 iOS 특이사항
- **Kids Category 회피 권장**: 일반 카테고리로 출시하되 "12+" 등급 + 부모 게이트 적용. Kids Category는 광고/외부 링크 전면 금지로 운영 부담 큼.
- **IAP 강제**: 외부 결제 링크 금지 → RevenueCat이 양쪽 통합 처리.
- **개인정보 라벨**: App Privacy 정성 입력 (음성 데이터, 학습 기록 명시).

### 6.2 한국 법규
- **만 14세 미만 법정대리인 동의** (KISA 가이드): 회원가입 시 부모 이메일 인증 필수.
- **개인정보 처리방침 + 이용약관** 한국어 정식 필요.
- **PG 등록**: B2B 결제용 (앱 내 결제는 IAP, 웹 결제는 별도 PG).

### 6.3 COPPA (미국 진출 시)
- 13세 미만 데이터 분리 처리. v1에서는 일단 한국만, v2에서 글로벌 옵션.

### 6.4 콘텐츠 저작권
- **수능 기출**: 한국교육과정평가원(KICE) 라이선스 OR csat-item-factory 자체 변형 문항으로 대체. 단순 게재는 위험.
- **모든 AI 생성 콘텐츠**: copyright-cleansing v3.0 사전 통과 필수.
- **이미지/음원**: ElevenLabs(상업 라이선스 포함 플랜) + Unsplash/Pexels Pro.

### 6.5 음성 데이터
- 발음 평가 음성은 **처리 즉시 삭제** (default). 사용자 명시 동의 시에만 30일 보관.

---

## 7. KPI 정의

| 카테고리 | 지표 | 목표 (출시 6개월) |
|---------|------|-----------------|
| 획득 | 일일 신규 가입 | 200명/일 |
| 활성 | D1 / D7 / D30 retention | 50% / 25% / 12% |
| 학습 | 진단 → 첫 학습 완료 전환 | 70% |
| 결제 | Free → Pro 전환율 | 4% |
| 만족 | 앱스토어 평점 | 4.5+ |
| 효과 | 8주차 어휘 성장률 (사전→사후) | 평균 +800단어 |

---

## 8. 리스크 매트릭스

| 리스크 | 영향 | 가능성 | 대응 |
|--------|------|--------|------|
| KICE 수능 기출 라이선스 거절 | 高 | 中 | csat-item-factory 자체 모의고사로 대체. v1은 변형 문항만. |
| Azure Speech 한국어 EFL 음소 인식 정확도 | 中 | 中 | 베타 단계에서 100명 데이터로 임계값 튜닝. 정확도 미달 시 Google Cloud Speech 병행. |
| iOS Kids 심사 지연 | 中 | 高 | 일반 카테고리 12+ 등급으로 우회. |
| 콘텐츠 양산 비용(Claude API) | 中 | 中 | Anthropic prompt caching 필수 적용. 캐시 적중률 70%+ 유지. |
| WebView 성능 (저사양 안드로이드) | 中 | 中 | M5까지 핵심 모듈 네이티브 이전 우선순위 큐 운영. |
| E드라이브 exFAT Turbopack 이슈 | 低 | 高 | 빌드는 EAS Cloud 또는 C드라이브 강제 (CLAUDE.md 기존 규칙). |
| 만 14세 미만 동의 누락 KISA 지적 | 高 | 低 | 가입 흐름 법무 검토 1회 + 부모 이메일 인증 강제. |

---

## 9. 팀 & 자원 (최소 구성)

| 역할 | 인원 | 비고 |
|------|------|------|
| 풀스택 개발(RN+Next.js) | 1 (본인) | Claude Code 페어링 |
| 콘텐츠/EFL 전문가 | 1 | 강원도 교사 네트워크 |
| UI/UX 디자이너 | 0.5 (외주) | 파닉스 게이미피케이션 |
| 음성/AI 통합 | 0.3 (외주) | Azure Speech 파인튜닝 |
| 법무/컴플라이언스 | 0.2 (외주) | 약관/개인정보 1회 검토 |

---

## 10. 즉시 착수 액션 (이번 주)

1. **모노레포 부트스트랩**: `logicflow-app` 신규 레포 (Expo + Turborepo).
2. **Vercel 프로젝트 분기**: `logicflow-mobile-api` (BFF용 Next.js Route Handlers).
3. **Azure Speech 계정**: Pronunciation Assessment 평가용 free tier 시작.
4. **파닉스 콘텐츠 스펙 v0**: Letters and Sounds Phase 1 → JSON 스키마 정의.
5. **개인정보처리방침 초안**: KISA 템플릿 기반 1차 작성.
6. **RevenueCat 계정**: iOS/Android Sandbox 결제 테스트 환경 구축.

---

## 11. 의사결정 필요 (사용자 확정 후 진행)

- 글로벌 출시 여부: v1 한국만 vs v1.5부터 미국/일본 — 컴플라이언스 부담 큼.
- 학습자 연령 하한: 5세 vs 7세 — 5세는 Kids Category 압력 발생.
- 콘텐츠 보유 모델: 자체 생성 only vs 수능 기출 라이선스 협상 병행.
- 베타 모집 채널: 강원도 교사 vs 일반 학부모 커뮤니티 vs 둘 다.

---

**다음 단계 제안**: 11번 의사결정 4건을 먼저 확정한 뒤, 1주차 액션 항목(섹션 10)부터 실행 진입.
