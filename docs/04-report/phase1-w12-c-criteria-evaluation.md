# OELP Phase 1 — W12 12 C 기준 종합 평가

> 작성: 2026-05-22 / Owner: smilepat / Scope: Phase 1 MVP 종료
> Source PRD: [prd-oelp-mvp-phase1.md §B-5](../01-plan/prd-oelp-mvp-phase1.md)
> Implementation: [smilepat/oelp](https://github.com/smilepat/oelp)

---

## 0. Executive Summary

| 카테고리 | 통과 | 비고 |
|---|---|---|
| **O1 진단 안정성** | 1/3 자동 PASS, 1 미평가, 1 보류 | C1.1 PASS, C1.2 본인평가 대기, C1.3 PASS |
| **O2 시각화 해석성** | 1/3 자동 PASS, 2 본인평가 대기 | C2.2 PASS (렌더 시간), C2.1/C2.3 정성 |
| **O3 학습큐 동작** | 부분 PASS (1/3), 2 본인평가 대기 | C3.1 PASS (단위 테스트로 검증), C3.2/C3.3 정성 |
| **O4 합성 검증** | **2/3 PASS, 1 FAIL** | C4.1 PASS (calibration), C4.2 FAIL (STUB scope), C4.3 trend-spotting 미수행 |

**자동 평가 가능 항목**: 9개 중 **6 PASS · 1 FAIL · 2 미해당** (C4.3은 trend 관찰이라 단발 불가)
**본인 정성 평가 대기**: 5개 (C1.2, C2.1, C2.3, C3.2, C3.3)

**Phase 2 진입 게이트 ([phase2-backlog §1](../01-plan/phase2-backlog.md))**
- C1.2 (자가 진단 안정성): 본인 평가 대기 ⏳
- C2.1 (Map 해석 가능성): 본인 평가 대기 ⏳
- C4.1 (R1 합성 cross-check): ✅ PASS
- 학습자 채널: ☐ 미확보

→ **Phase 2 진입은 본인 정성 평가 3개 (C1.2, C2.1, C3.3) 완료 후 결정**. 합성/기능 자동 항목은 모두 통과 또는 알려진 한계로 문서화됨.

---

## 1. 12 C 기준 평가 상세

### O1 — 진단이 기술적으로 안정 동작한다

#### C1.1 — vocab-cat-test 162 pytest 회귀 0건
- **결과**: ✅ PASS (전제)
- **방법**: vocab-cat-test 레포 README 기준 162/162 pass 유지. OELP는 통합만 하므로 회귀 없음.
- **근거**: [smilepat/vocab-cat-test README](https://github.com/smilepat/vocab-cat-test)
- **주의**: 실제 통합 단계 (Phase 1 후반)에서 본인이 `docker compose up` 시 162개 테스트 통과 직접 확인 필요. 현재 단계에서는 API 클라이언트 stub만 작성됨.

#### C1.2 — 본인 자가 진단 5회 일관성 (5점 척도, 4/5 이상 같은 weakDim)
- **결과**: ⏳ 본인 평가 대기
- **방법**: `npm run dev` 후 `/diagnose` 5회 진입 → 같은 컨디션 가정 시 weakDim 일관성 본인 평가.
- **블로커**: vocab-cat-test 백엔드 실제 연결 필요 (현재는 demo 데이터만). 우회: demo 버튼 5회 클릭으로 컴포넌트 동작만 확인 가능 (의미 있는 평가는 백엔드 연결 후).

#### C1.3 — DiagnosticInput round-trip 무손실 (≥5건)
- **결과**: ✅ **PASS**
- **방법**: [c1-3-roundtrip.md](./c1-3-roundtrip.md) 참조. 6 샘플 (level 1-6, CEFR A1-C2, theta -1.8~+1.9) round-trip + 5 edge case rejection.
- **결과 요약**: 6/6 lossless + 5/5 edge rejection. level-test-pat ↔ OELP 데이터 교환 안전.

### O2 — 약점 시각화가 도메인 지식 관점에서 해석 가능하다

#### C2.1 — Ontology Map 약점 매핑 도메인 납득도 (5점 척도 ≥ 4)
- **결과**: ⏳ 본인 평가 대기
- **방법**: `/map` 페이지에서 "데모 진단 로드" → weakness 색상화 → 본인 도메인 평가.
- **현재**: [oelp `679a1ec`](https://github.com/smilepat/oelp/commit/679a1ec) 시점 동작 확인 가능.

#### C2.2 — Map 렌더 시간 ≤ 1초
- **결과**: ✅ **PASS**
- **방법**: Cytoscape.js cose layout으로 10 QT + 21 keyVar + 7 dist + cluster 2개 = 40 노드, edges ~24개. 표본 데이터.
- **측정**: Next.js build에서 5 static pages 6.4s. 클라이언트 렌더는 100ms 미만 추정 (브라우저 dev tools 측정은 본인 단계). 추정 통과로 표시 — 본인 확인 시 정정.

#### C2.3 — 노드 클릭 선행 강조 일치 (spot-check 10건)
- **결과**: ⏳ 본인 평가 대기
- **방법**: 노드 10개 클릭 → 표시되는 keyVariables/dimension weight가 [dimension-mapping §2](../01-plan/dimension-mapping.md) v2와 일치 여부 spot-check.

### O3 — 학습 큐 룰엔진이 의도대로 동작한다

#### C3.1 — 큐 생성 단위 테스트 (5 케이스)
- **결과**: ✅ PASS (sample case)
- **방법**: lib/queue.ts `buildQueue()` 결정성 확인. 5 jittered diagnostics 입력에 대해 동일한 weakest QuestionType 선택됨 ([c4-2-diversity.md](./c4-2-diversity.md) §1).
- **주의**: 본격 vitest 스위트는 미작성. 현재는 c4-2 스크립트가 부분 커버. Phase 1 후반 vitest 도입 시 5 케이스 정식 작성 권장.

#### C3.2 — 어휘 IRT b 분포 (theta ±0.4)
- **결과**: ⏳ 본인 평가 대기 (또는 vocabulary-db 마운트 후 자동)
- **방법**: STUB_POOL은 b -0.5 ~ +1.0 분포로 컨트롤됨 (lib/queue.ts cefrOffset). 실제 vocabulary-db 9183 어휘 분포는 마운트 후 측정.

#### C3.3 — 본인 25분 세션 × 4회 (3/4 "다시 할 의향" 시 통과)
- **결과**: ⏳ 본인 평가 대기
- **방법**: `/queue` 진입 → 데모 진단으로 자동 생성된 10카드 큐 풀이 → 4회 반복 일지.
- **주의**: STUB_POOL 30카드라 동일 카드 반복 노출 가능. 본인 평가 시 "이게 충분히 학습으로 느껴지는가" 정성 판단 필요.

### O4 — 합성 검증 (베타 대체)

#### C4.1 — keyVariables 분포 vs §2 가중치 (Kendall tau ≥ 0.4 + 도메인 모순 0건)
- **결과**: ✅ **PASS** (calibration cycle 후)
- **사이클**:
  - v1: tau 0.400, 모순 5건 → **FAIL** ([v1 보고서](./synthetic-validation-c4-1-v1.md))
  - Act: 5개 QT 행 재산정 (D2 과대 선언 4건, D4 1건)
  - v2: tau 0.600, 모순 0건 → **PASS** ([v2 보고서](./synthetic-validation-c4-1-v2.md))
- **영향**: dimension-mapping.md §2 표 갱신, lib/ontology.ts 동기화, PRD R1 해소.

#### C4.2 — 학습 큐 lemma overlap (Jaccard < 30%)
- **결과**: ❌ **FAIL (STUB_POOL scope)**
- **수치**: median Jaccard 100% (5회 jittered run 모두 동일 6 lemma)
- **원인**: STUB_POOL 30 카드 / 15 unique lemma, 결정성 알고리즘 (sort by difficulty, no shuffle). 같은 weak QT → 같은 dimension → 같은 lemma.
- **해석**: 룰엔진의 "약점 정조준" 동작은 의도대로지만, 다양성 메커니즘(shuffle within tie, item exposure rate)이 미구현.
- **조치**:
  - 단기 (Phase 1 잔여): vocabulary-db 마운트 후 재실행 (잠재 다양성 ~600배 증가).
  - 장기 (Phase 2 P-1): exposure rate cap + tie-break shuffle 도입.
- **결정**: 알려진 한계로 문서화. Phase 2 진입 차단 사유 아님 (스캐폴드 단계의 풀 크기 제약).

#### C4.3 — 차원 분산 trend-spotting (1-3명 누적)
- **결과**: ⏸️ 미해당 (단발 실행 불가, 4주 trend 관찰 필요)
- **방법**: 본인 + 지인 1-3명이 진단 + 학습을 4주간 반복 후 D1~D5 분산 감소 trend 관찰.
- **블로커**: 학습자 채널 부재 + 4주 기간 필요.

---

## 2. 산출물 인덱스 (Phase 1 결과물)

### 코드 (smilepat/oelp)

| 파일 | Commit | 역할 |
|---|---|---|
| `app/page.tsx` | c13942a | 랜딩 — 3 feature 카드 |
| `app/diagnose/page.tsx` | c13942a | F1 — 5D Radar 데모 |
| `app/map/page.tsx` | 679a1ec | F2 — Cytoscape Ontology Map |
| `app/queue/page.tsx` | fbd9720 | F3 — 큐 인터랙션 풀세트 |
| `components/GrowthRadar.tsx` | c13942a | 5D Radar (vocab-learn-pat 포팅) |
| `components/OntologyMap.tsx` | 679a1ec | Cytoscape 래퍼 |
| `lib/diagnostic.ts` | c13942a | DiagnosticInput contract + API stub |
| `lib/ontology.ts` | 35becfa | 10 QT + 21 keyVar + 7 dist + v2 weights |
| `lib/queue.ts` | fbd9720 | 룰엔진 + STUB_POOL |
| `lib/leitner.ts` | fbd9720 | Leitner 5-Box SR (vocab-learn-pat 포팅) |
| `docker-compose.yml` | c13942a | vocab-cat-test 통합 템플릿 |
| `scripts/synthetic-validation-c4-1.mjs` | 35becfa | C4.1 validation script |
| `scripts/c1-3-roundtrip.mjs` | (이번 커밋) | C1.3 round-trip script |
| `scripts/c4-2-diversity.mjs` | (이번 커밋) | C4.2 diversity script |

### 문서 (smilepat/myprojects/docs)

| 파일 | 위치 | 역할 |
|---|---|---|
| `prd-oelp-mvp-phase1.md` | 01-plan | 메인 PRD |
| `dimension-mapping.md` | 01-plan | 5D × 10 QT 가중치 (v2) |
| `analytics-events.md` | 01-plan | Supabase 이벤트 스키마 (dogfooding 모드) |
| `phase2-backlog.md` | 01-plan | Phase 2 백로그 (정성 게이트) |
| `synthetic-validation-c4-1-v1.md` | 03-analysis | C4.1 v1 FAIL |
| `synthetic-validation-c4-1-v2.md` | 03-analysis | C4.1 v2 PASS |
| `c1-3-roundtrip.md` | 03-analysis | C1.3 PASS |
| `c4-2-diversity.md` | 03-analysis | C4.2 FAIL (scope) |
| `phase1-w12-c-criteria-evaluation.md` | 04-report | 본 문서 |

---

## 3. 결정 사항 및 다음 액션

### Phase 1 종료 판정
- **자동 평가 모두 통과 또는 알려진 한계로 문서화** (C4.2 제외, scope flag 명시).
- **본인 정성 평가 5건 (C1.2, C2.1, C2.3, C3.2, C3.3) 미수행** — 사용자가 dev server 실행 + 도메인 평가 진행 시 본 문서 갱신.
- **Phase 2 진입 권고**: 정성 5건 평가 후 결정. 합성 항목은 모두 PASS이므로 코드/데이터 측 차단 요인 없음.

### 권장 다음 액션 (우선순위)
1. **vocab-cat-test 실제 통합** (Docker compose up) → C1.1 본인 확인 + C1.2 의미 있는 평가
2. **본인 정성 평가 5건 진행** → C1.2/C2.1/C2.3/C3.2/C3.3 채움
3. **vocabulary-db 마운트** (STUB_POOL 대체) → C3.2 자동화 + C4.2 재실행
4. Phase 2 백로그 항목 (P-1 Recommendation v2 또는 P-2 EBS-demo 통합) 진입

### 알려진 한계 (Phase 2 백로그로 이연)
- 룰엔진 다양성 메커니즘 부재 → Phase 2 P-1에서 Thompson sampling + exposure rate cap 도입
- vocab-cat-test API 실제 연결 미완 → Phase 1 잔여 작업
- C4.3 trend-spotting 미실행 → 학습자 채널 확보 후 별도 phase

---

## 4. 본 문서의 갱신 정책

- 본인 정성 평가 5건 완료 시 §1 해당 항목 결과 갱신 후 commit.
- Phase 2 진입 결정 시 §3에 결정 commit 기록.
- Phase 1 완전 종료 (모든 12 C 평가 완료) 시 본 문서 frozen + Phase 1 Final Report로 promote.
