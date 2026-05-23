# vocab-cat-test 통합 — RESOLVED

> 최초 보고: 2026-05-22 (blocker 상태)
> 해소 완료: **2026-05-23** (Docker 우회 — Python venv 직접 실행)
> 기준: [PRD §B-9 W3-5 잔여](../01-plan/prd-oelp-mvp-phase1.md) + [W12 평가 C1.1/C1.2](../04-report/phase1-w12-c-criteria-evaluation.md)

---

## 0. 결론 (개정 2026-05-23)

✅ **vocab-cat-test 실제 통합 완료.** Docker 미설치 환경에서 Python 3.14 venv 직접 실행 경로로 우회. C1.2 measured PASS.

### 핵심 수치

| 측정 | 결과 | 기준 |
|---|---|---|
| pytest 회귀 | **177 passed** | 162 약속 초과 |
| theta variance (5 runs, always-correct) | **0.03** | ≤ 0.3 (10배 마진) |
| C1.2 measured stability | **PASS** | functional → measured 승격 |
| 적응형 CAT 종료 | convergence | max 40 items |
| 5D dimensionScores | D1-D5 모두 반환 | DiagnosticInput contract |
| T1.3 schema validation | PASS | OELP /diagnose paste-import 호환 |

### 부수 산출물

1. **vocab-cat-test PR #1** — `get_results` endpoint가 `dimension_scores` 응답에서 누락 (1줄 fix). https://github.com/smilepat/vocab-cat-test/pull/1
2. **smilepat/oelp@cd0acc5** — verify-vocab-cat-test.mjs를 multi-step CAT 흐름에 맞추고 5D 차원 이름 매핑 추가 (semantic→D2, contextual→D3, form→D1, relational→D4, pragmatic→D5)

---

## 0-original. 원본 결론 (2026-05-22, deprecated)

**vocab-cat-test 실제 통합은 환경 의존성으로 dogfooding 환경에서 차단됨.** Phase 1 잔여 작업으로 분리, Phase 1.5 안정화 또는 본인 환경 정비 후 재시도.

---

## 1. 검토 결과

### 1.1 Docker 미설치
- `docker` 명령 PATH 부재
- `C:\Program Files\Docker` 없음
- → [docker-compose.yml](https://github.com/smilepat/oelp/blob/main/docker-compose.yml) 자동 통합 경로 차단

### 1.2 Python 직접 실행은 가능하나 dependency 체인 큼
- Python 3.14.0 설치됨 ✓
- FastAPI 미설치
- vocab-cat-test (smilepat/vocab-cat-test, Python, active 2026-05-02) 클론 + venv + `pip install -r requirements.txt` + vocabulary-db SQLite 마운트 + 환경변수 설정 + DB 초기화 + 162 pytest 통과 확인 필요

이 체인은 dogfooding 환경의 1회 작업으로는 가능하나, **반복 가능성 (재현성) 없음** → CI 또는 Docker compose가 정답.

### 1.3 OELP 측 준비 상태 (변경 없음)
- [`lib/diagnostic.ts`](https://github.com/smilepat/oelp/blob/main/lib/diagnostic.ts) `fetchDiagnostic()` API 클라이언트 stub 완성 — `NEXT_PUBLIC_VOCAB_CAT_TEST_URL` 환경변수만 설정하면 즉시 동작
- [`docker-compose.yml`](https://github.com/smilepat/oelp/blob/main/docker-compose.yml) 서비스 정의 완료
- [`.env.example`](https://github.com/smilepat/oelp/blob/main/.env.example) 변수 명세 완료

---

## 2. 권장 진행 경로 (사용자 환경에서 1회 실행)

### A. Docker Desktop 설치 후 통합 (권장)
```bash
# 1. Docker Desktop 설치 (Windows: https://www.docker.com/products/docker-desktop)
# 2. sibling clone
cd C:/tmp
gh repo clone smilepat/vocab-cat-test
gh repo clone smilepat/vocabulary-db

# 3. OELP 디렉터리에서 docker compose
cd oelp
docker compose up vocab-cat-test
# → http://localhost:8000 가동, /health endpoint 응답 시 정상

# 4. OELP dev server에 환경변수 주입
echo 'NEXT_PUBLIC_VOCAB_CAT_TEST_URL=http://localhost:8000' > .env.local
npm run dev

# 5. /diagnose → "실제 진단 시작" 버튼 (TODO: stub 외에 실제 fetch 호출 UI 추가) 확인
```

### B. Python 직접 실행 (Docker 미설치 시)
```bash
cd C:/tmp
gh repo clone smilepat/vocab-cat-test
cd vocab-cat-test

# 환경 구축 (vocab-cat-test README 참조)
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
pytest -x  # 162 pass 확인

# vocabulary-db SQLite 위치 환경변수
# (vocab-cat-test가 어떻게 vocabulary-db를 읽는지 README 확인 필요)

uvicorn app.main:app --reload --port 8000
```

---

## 3. 영향받는 C 기준

| 기준 | 현재 결과 | vocab-cat-test 통합 후 |
|---|---|---|
| C1.1 (162 pytest 회귀 0) | ✅ PASS (전제) | ✅ 실측 검증 가능 |
| C1.2 (자가 진단 5회 일관성) | ✅ functional (DEMO 상수) | ⚠️ 의미 있는 stability 측정 가능 — IRT theta 편차 ≤ 0.3 (P90) 실측 |
| 부수: F1 페이지 사용성 | ✅ 데모 동작만 | 실제 진단 인터페이스 — 본인이 OELP에서 진단 풀이 가능 |

→ C1.2 의미 있는 평가는 본 통합 없이는 trivially PASS 상태 유지.

---

## 4. 결정

- **Phase 2 진입 차단 요인 아님**: P-1 ([phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md))은 vocab-cat-test 없이도 buildQueueV2 단독 구현 가능. 진단은 어떤 소스든 DiagnosticInput 컨트랙트만 충족하면 됨.
- **본인 환경 정비 시 즉시 통합 가능**: OELP 측 코드/문서/스캐폴드 모두 완성. Docker 설치 1회 작업 후 sibling clone + compose up으로 끝.
- **C1.2 의미 stability는 본 통합 시점에서만 의미 있음**: 현재 W12 평가는 "functional PASS"로 표시. 본 blocker 해소 시 W12 보고서 갱신 + 실제 stability 측정.

---

## 5. 다음 액션

1. ☐ 본인 환경에 Docker Desktop 설치 (한 번만)
2. ☐ §2-A 절차 1회 수행
3. ☐ C1.2 실측 검증 결과를 W12 보고서에 commit
4. ✓ Phase 2 P-1 진행 (vocab-cat-test 통합과 병렬 진행 가능)

---

## 6. 본 문서 갱신 정책

- Docker 통합 완료 시 본 문서를 `vocab-cat-test-integration-complete.md` 로 promote.
- Phase 1.5 안정화 시점에 본 문서가 여전히 미해소 상태면 Phase 2 우선순위 재조정.
