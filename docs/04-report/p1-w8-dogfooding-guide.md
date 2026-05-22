# P-1 Week 8 — Dogfooding 가이드 & 정성 평가 템플릿

> 실행 가능 일자: 본인 환경 준비 후 (Phase 1.5 또는 Phase 2 전환 시점)
> 기준: [phase2-p1-recommendation-v2.md §6 W8](../02-design/phase2-p1-recommendation-v2.md) + [W12 평가 잔여 C2.1/C3.3](./phase1-w12-c-criteria-evaluation.md)
> Status: 문서 준비 완료 / 본인 사용 대기

---

## 0. W8의 본질

W7 까지 자동화 가능한 모든 검증은 완료됨 (39 단위 테스트 + C4.1 회귀 + Playwright walkthrough). **W8은 자동화될 수 없는 본인 평가**가 핵심:

- **C1.2 의미 있는 stability** (vocab-cat-test 통합 후)
- **C2.1 도메인 납득도** (5점 척도, EFL 전문가 본인 판단)
- **C3.3 학습 ROI** (4세션 × "다시 할 의향" 정성)
- **본인 추천 메커니즘 체감** (Thompson algorithm 칩이 합리적인가)

본 문서는 본인이 dogfooding을 진행할 때 사용할 **가이드 + 평가 템플릿**을 제공한다.

---

## 1. 사전 준비

### 1.1 환경 확인

```bash
cd C:/tmp/oelp  # 또는 본인 clone 경로
npm install   # vitest 등 최신 의존성
npm run ci    # 39 tests + C4.1 + build 모두 통과 확인
npm run dev   # http://localhost:3001 (port 3000 점유 시 자동 fallback)
```

### 1.2 평가 환경 권장

- **시간**: 25분 세션 × 4회 (최소 권장; 2주에 걸쳐 진행)
- **모드**: 일반 데스크탑 브라우저 (Phase 1은 모바일 최적화 비목표)
- **컨디션 일관성**: 같은 시간대(오후/저녁), 같은 컨디션 가정
- **방해 요소 차단**: 다른 학습 자료 동시 사용 금지

### 1.3 vocab-cat-test 통합 (선택, 권장)

[blocker doc](../03-analysis/vocab-cat-test-integration-blocker.md) §2-A 참조. Docker 설치 + sibling clone 후:

```bash
docker compose up vocab-cat-test
# 별도 터미널
echo 'NEXT_PUBLIC_VOCAB_CAT_TEST_URL=http://localhost:8000' > .env.local
npm run dev
```

→ 진단이 demo constant에서 실제 IRT 응답 기반으로 전환됨. **C1.2 의미 있는 stability** 평가 가능.

미통합 시: DEMO_DIAGNOSTIC 그대로 사용 (C1.2는 functional PASS 유지).

---

## 2. 4 세션 시나리오

### 시나리오 A — 일관성 검증 (Session 1)

**목적**: 초기 진단으로 추천이 합리적인지 본인 판단.

1. `/diagnose` → 데모 진단 로드 (또는 실제 진단)
2. 5D Radar 본인 도메인 평가:
   - "weak: D3_Context, D4_Network — EFL 학습자 typical 약점인가?" (자가 1-5점)
3. `/map` → "데모 진단 로드 (약점 색상)" 토글
   - 약점 QT가 빨강으로 강조 → 본인 도메인 평가: "이게 본인 약점 추정과 일치하는가?" (1-5점)
   - 노드 5개 spot-click → detail panel weight 분포가 "직관적으로 납득되는가?" (1-5점)
4. `/queue` → 추천된 QT + 10카드 풀이
   - 알고리즘 칩 확인: `rule-v1-fallback` (첫 사용)
   - 25분 내 완수
5. 평가 (§5 템플릿 사용)

### 시나리오 B — Thompson 활성화 (Session 2-3)

10회 응답 누적 후 `thompson-v2` 활성화 확인.

1. 시나리오 A 큐 끝까지 풀이 후 새 세션
2. `/queue` 헤더 알고리즘 칩 확인: `thompson-v2` (보라색) 인가?
3. "대안: ..." 표시되는 alternate QT가 합리적인가?
4. 같은 진단으로 3번 재로드 시 매번 다른 QT/카드가 나오는가? (다양성 체감)

### 시나리오 C — 학습 ROI (Session 3-4)

**목적**: 4세션 누적 후 본인이 학습 효과를 체감하는가.

1. Session 1 카드를 기억하는가? (4-5일 후 직접 회상)
2. 동일 QT 반복 노출이 지루한가, 학습 효과가 있는가?
3. Leitner SR 박스 분포 변화가 진척감을 주는가?

### 시나리오 D — 추천 신뢰도 (Session 4)

- Confidence 칩(`low`/`mid`/`high`)이 본인의 학습 진행 신뢰감과 일치하는가?
- `mid`/`high`로 올라간 시점에 추천 정확도가 실제로 더 나아진다고 느끼는가?

---

## 3. 평가 템플릿

각 세션 종료 시 아래 markdown을 복사하여 `docs/05-dogfooding/session-{N}-{YYYY-MM-DD}.md`로 저장.

```markdown
# Session N — YYYY-MM-DD

## 메타
- 시작: HH:MM / 종료: HH:MM (목표 25분 내)
- 진단 소스: demo / vocab-cat-test
- Theta: 0.30 (또는 실제값)
- 알고리즘 칩: rule-v1-fallback / thompson-v2
- Confidence 칩: low / mid / high
- Target QT: <이름>
- Alternate QT: <이름>

## 자동 통계 (큐 완료 패널에서 복사)
- 정답: X / 10 (X0%)
- Box 승격: X / 10
- Box 분포 종료 후: { "1": _, "2": _, "3": _, "4": _, "5": _ }
- Thompson posterior: α=_ β=_ samples=_ confidence=_

## 정성 평가 (1-5점)
- C1.2 진단 weakDim 본인 직관 일치도: [ ] / 5
- C2.1 Map weakness 색상화 도메인 납득도: [ ] / 5
- C2.3 노드 클릭 detail weight 분포 직관성: [ ] / 5
- C3.3 큐 ROI ("다시 할 의향"): Yes / No
- 만족도 종합: [ ] / 5

## 자유 메모
(놀라움, 짜증, 발견, 개선 아이디어 자유 기술)

## 발견된 버그/이슈
- (있으면 기술, 없으면 "없음")
```

### 평가 통과 기준 (Phase 2 진입 게이트)

[W12 평가](./phase1-w12-c-criteria-evaluation.md) §1 그대로:

- **C1.2**: 4세션 중 3회 이상 같은 weakDim 일관성 (그대로 통과 시 ✓)
- **C2.1**: 4세션 평균 ≥ 4점 (그대로 통과 시 ✓)
- **C2.3**: 10 spot-check 중 8회 이상 직관 일치
- **C3.3**: 4세션 중 3회 "다시 할 의향: Yes"

3/4 통과 시 → Phase 2 진입.
2/4 이하 → P-1 후속 작업 또는 P-A0/A1 조건부 진입.

---

## 4. 데이터 수집 방식

### 권장 (단순)

본 markdown 템플릿을 `docs/05-dogfooding/` 폴더에 4개 파일로 저장. 4세션 종료 후 본인이 종합 분석 → `docs/04-report/p1-w8-result.md` 작성.

### 향후 자동화 (Phase 2)

- Supabase events 테이블 활용 (analytics-events.md §3.6)
- UI 내 in-app 평가 폼 추가 (W4 잔여)
- Slack/Discord webhook으로 평가 push

현재 dogfooding 환경은 본인 단독이므로 markdown으로 충분.

---

## 5. Edge Case 처리

### 학습자 컨디션 차이
- 같은 진단으로 5회 반복 시 정답률이 흔들리는 것은 정상 (피로, 집중도 등)
- C1.2는 weakDim 일관성만 평가 (정답률 절대값 아님)

### 데이터 부족
- 4세션이 너무 적다고 느끼면 8세션으로 확장 — 부정적 결과를 신뢰성 있게 입증하려면 N 증가
- 단, 8세션을 시작 시점에 commit (post-hoc N 변경은 cherry-picking)

### Thompson 효과 부재
- 4세션 (40 응답) 으로는 Thompson posterior가 극적으로 prior에서 멀어지지 않음
- "rule-v1 fallback과 별 차이를 못 느낀다"가 정상 — Thompson 진가는 100+ 응답에서 발현

### Calibrate 시점 결정
- W6 weekly cron이 본인 환경에서 동작하지 않으므로 수동 실행:
  ```bash
  # 본인이 누적된 4세션 응답을 JSON으로 만들어
  node scripts/calibrate.mjs --responses data/dogfood-responses.json --apply
  # → C4.1 회귀 통과 시 가중치 자동 갱신, FAIL 시 자동 롤백
  ```

---

## 6. W8 종료 조건

본 문서가 처리하는 W8 deliverable:

- ✅ 본 가이드 + 템플릿 작성 — 사용 준비 완료
- ☐ 본인이 4세션 진행 → `docs/05-dogfooding/session-{1..4}.md` 작성
- ☐ 본인 종합 분석 → `docs/04-report/p1-w8-result.md` 작성
- ☐ Phase 2 진입 결정 (게이트 통과/실패)

자동 진행 가능한 것은 본 문서까지. 이후는 본인 의지 + 시간.

---

## 7. 사용자(smilepat) 권장 사용 시점

### 즉시 시작 가능
- 시나리오 A (Session 1) — demo 진단 + 5D Radar + Map + Queue 10카드
- 가이드 + 템플릿 그대로 사용

### Docker 설치 후
- vocab-cat-test 통합 → C1.2 의미 있는 stability 평가 가능
- Phase 1.5 안정화 시점 권장

### 학습자 채널 확보 후 (장기)
- W8 본인 평가 + N≥30 학습자 데이터 모집
- 통계 KPI (P-1 design 원안) 재활성화

---

## 8. 인용 위치

- 본 문서: [04-report/p1-w8-dogfooding-guide.md](./p1-w8-dogfooding-guide.md)
- W12 정성 잔여: [phase1-w12-c-criteria-evaluation.md §1](./phase1-w12-c-criteria-evaluation.md)
- vocab-cat-test 통합: [03-analysis/vocab-cat-test-integration-blocker.md](../03-analysis/vocab-cat-test-integration-blocker.md)
- 분석 이벤트 스키마: [01-plan/analytics-events.md](../01-plan/analytics-events.md)
