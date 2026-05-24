# Dogfooding Without Backend — `mock-vocab-cat-test.mjs` 사용 가이드

> 작성: 2026-05-24 (v6 sprint)
> 코드: smilepat/oelp `scripts/mock-vocab-cat-test.mjs` (commit 26ff713)
> 검증: smilepat/oelp `tests/mock-vocab-cat-test.test.ts` (7 contract tests PASS)
> 적용 시점: vocab-cat-test FastAPI 백엔드를 띄우지 않고도 `/diagnose`
> AdaptiveDiagnostic 전체 흐름을 실행하고 싶을 때

---

## 0. 한 줄

```bash
node scripts/mock-vocab-cat-test.mjs &
NEXT_PUBLIC_VOCAB_CAT_TEST_URL=http://localhost:8000 npm run dev
```

이걸로 vocab-cat-test FastAPI / Python venv / 9183 vocab DB / IRT 2PL 셋업
없이도 진단 → 학습 큐 → 세션 누적 → analytics 이벤트 발화까지 dogfooding 가능.

---

## 1. 왜 필요한가

vocab-cat-test 실제 백엔드는:

- Python 3.14 venv + FastAPI + 9183 단어 SQLite
- IRT 2PL/3PL 추정 로직 + Fisher Information item selection
- 162 pytest, θ variance 0.03 검증된 실제 학습 엔진

단점: 본인 환경에서 띄우려면 venv + uvicorn + DB 초기화 = **5-10분 셋업**.
짧은 dogfooding 세션이나 UI regression check 때 매번 부담.

→ mock은 **API 컨트랙트만 흉내**. theta 추정은 가짜 (running accuracy
shrunk toward grade baseline + noise). 5D 점수는 theta에서 sigmoid 변환.

**사용 가능**:
- AdaptiveDiagnostic UI 회귀 검증
- /queue → /sessions 흐름 dogfooding
- analytics-events queue 누적 확인
- AdaptiveDiagnosticStats 위젯 (≥2 진단 후 θ trend sparkline)
- A11y 스캔 (실제 진단 상태로)

**사용 불가**:
- C4.1 calibration 검증 (가짜 theta + 합성 dim score → 무의미)
- IRT 알고리즘 정확도 검증 (실제 학습 엔진 ≠ mock)
- 실제 학습자 데이터로 가중치 업데이트 (synthetic data 정책 위반)

---

## 2. 실행

### 2.1 기본
```bash
cd /path/to/oelp
node scripts/mock-vocab-cat-test.mjs
# → listening on http://localhost:8000  seed=23  items_total=15
```

### 2.2 옵션
```bash
node scripts/mock-vocab-cat-test.mjs --port 8001 --seed 42 --items 20
```

| 옵션 | 기본 | 효과 |
|---|---|---|
| `--port` | 8000 | HTTP 포트 |
| `--seed` | 23 | mulberry32 RNG 시드 (동일 시드 → 동일 trajectory) |
| `--items` | 15 | 진단 종료까지 문항 수 |

### 2.3 OELP dev 서버에 연결
`oelp/.env.local`:
```
NEXT_PUBLIC_VOCAB_CAT_TEST_URL=http://localhost:8000
```
또는 인라인:
```bash
NEXT_PUBLIC_VOCAB_CAT_TEST_URL=http://localhost:8000 npm run dev
```

→ `/diagnose` 페이지의 AdaptiveDiagnostic 위젯이 "백엔드 미연결" fallback
대신 정상 입력 폼을 표시.

---

## 3. API 컨트랙트 (mock이 구현하는 4 endpoints)

### 3.1 `GET /health`
```json
{ "status": "ok", "mock": true, "seed": 23, "sessions": 0 }
```

### 3.2 `POST /api/v1/test/start`
요청:
```json
{ "nickname": "test", "grade": "고2", "self_assess": "intermediate",
  "exam_experience": "수능", "question_type": 0 }
```
응답: `session_id`, `first_item { item_id, word, stem, correct_answer,
options[4], pos, cefr }`, `progress { items_completed: 0, ... is_complete: false }`

### 3.3 `POST /api/v1/test/{sid}/respond`
요청:
```json
{ "item_id": 10000, "is_correct": true, "response_time_ms": 4000 }
```
응답: `next_item` (or null if complete), `progress { items_completed, accuracy,
current_theta, current_se, is_complete }`. SE 감소: `1 / sqrt(items + 1)`.

### 3.4 `GET /api/v1/test/{sid}/results`
응답:
```json
{
  "theta": 0.94,
  "se": 0.50,
  "cefr_level": "B2",
  "curriculum_level": "고2",
  "dimension_scores": [
    { "dimension": "semantic",   "score": 74 },
    { "dimension": "contextual", "score": 70 },
    { "dimension": "form",       "score": 76 },
    { "dimension": "relational", "score": 73 },
    { "dimension": "pragmatic",  "score": 69 }
  ],
  "items_completed": 15,
  "total_correct": 12
}
```

→ AdaptiveDiagnostic의 `DIM_MAP` (`semantic → D2_Meaning` 등) 그대로 통과.

---

## 4. theta 추정 알고리즘 (mock)

```
baseline = GRADE_THETA[grade]       // 고2 → 0.8, 중3 → 0.0
accuracy = correct / completed
naive    = (accuracy - 0.5) * 4     // -2..+2 from accuracy
shrunk   = 0.5 * baseline + 0.5 * naive
theta    = shrunk + (rng - 0.5) * 0.2   // small noise
se       = 1 / sqrt(items + 1)          // Fisher decay
```

**의도**: theta가 grade baseline + 실제 정답률 사이에서 안정적으로 수렴.
실제 IRT MLE/MAP 아님 — fast / reproducible / deterministic만 보장.

---

## 5. 시나리오별 사용 예

### 5.1 UI 회귀 보호
```bash
# Terminal 1
node scripts/mock-vocab-cat-test.mjs &
# Terminal 2
NEXT_PUBLIC_VOCAB_CAT_TEST_URL=http://localhost:8000 npx playwright test
```
→ Playwright e2e가 실제 백엔드 없이도 진단 흐름 검증. CI에서는
스폰 + 종료를 spec 안에서 처리하면 됨 (현 `tests/mock-vocab-cat-test.test.ts`
패턴 참고).

### 5.2 analytics-events 누적 확인
```bash
# mock 띄운 상태로
NEXT_PUBLIC_VOCAB_CAT_TEST_URL=http://localhost:8000 npm run dev
# → http://localhost:3000/diagnose 에서 진단 3~4회 진행
# → http://localhost:3000/sessions 의 AnalyticsQueuePanel 확인
# diag.started / diag.item_answered / diag.completed × N 누적 확인
# AdaptiveDiagnosticStats: θ 추이 sparkline + KR1.1 SD 표시
```

### 5.3 reproducible dogfooding
```bash
# 두 명의 dev가 동일 시드로 같은 trajectory 비교 가능
node scripts/mock-vocab-cat-test.mjs --seed 100
# 같은 학년 + 같은 응답 패턴 → 동일 theta / 5D 출력 (mulberry32 결정성)
```

---

## 6. 한계 & 실제 backend로 전환 시점

**전환 트리거**:

1. **C4.1 게이트 검증** 필요 시점 — mock theta는 무의미. 반드시 실제 IRT.
2. **외부 학습자 1명 도착 시** (Stage C 진입) — 실 데이터로만 calibration.
3. **vocab-cat-test API 변경 시** — mock 컨트랙트도 같이 업데이트 필요.
   `tests/mock-vocab-cat-test.test.ts`가 CI에서 잡아냄.

**실제 백엔드 활성화**:
```bash
cd /path/to/vocab-cat-test
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
(또는 Cloud Run 배포 — [`docs/03-analysis/vocab-cat-test-cloudrun-runbook.md`](./vocab-cat-test-cloudrun-runbook.md))

---

## 7. 관련 자료

- 실 통합: [`vocab-cat-test-integration-resolved.md`](./vocab-cat-test-integration-resolved.md)
- Cloud Run runbook: [`vocab-cat-test-cloudrun-runbook.md`](./vocab-cat-test-cloudrun-runbook.md)
- AdaptiveDiagnostic 컴포넌트: [smilepat/oelp components/AdaptiveDiagnostic.tsx](https://github.com/smilepat/oelp/blob/main/components/AdaptiveDiagnostic.tsx)
- mock 스크립트: [smilepat/oelp scripts/mock-vocab-cat-test.mjs](https://github.com/smilepat/oelp/blob/main/scripts/mock-vocab-cat-test.mjs)
- 컨트랙트 테스트: [smilepat/oelp tests/mock-vocab-cat-test.test.ts](https://github.com/smilepat/oelp/blob/main/tests/mock-vocab-cat-test.test.ts)

---

## 8. 변경 이력

- 2026-05-24: 본 문서 작성 (v6 sprint, mock 스크립트 PR 26ff713 + 컨트랙트 테스트 60dd2bf)
