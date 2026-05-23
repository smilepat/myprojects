# Dogfooding Pass 2 — Real(30) + Synthetic(1200) 결합 검증 보고서

> 데이터: `data/dogfood-combined-pass2.json` (real 30 + simulator 1200 = **1230 응답**)
> 실시일: 2026-05-23
> 선행: [dogfooding-pass-1.md](./dogfooding-pass-1.md), [P-1.5b active-diagnostic](./p1-5b-validation.md)
> Status: ✅ **C4.1 게이트 두 번째 실증 — 도메인 모순 1건 자동 검출 + 롤백**

---

## 0. 핵심 결과 (TL;DR)

| 항목 | 결과 |
|---|---|
| 입력 응답 수 | real 30 + synthetic 1,200 = **1,230** |
| 고유 dimensionScores | **121종** (rank > 1 확보 → ridge regression 식별성 OK) |
| Calibrated QT 수 | 4 (주장, 요지, 제목, 순서배열 — min 100 충족) |
| Fallback QT 수 | 6 (목적/심경/주제/빈칸/흐름무관/문장삽입 — sample < 100) |
| 최대 divergence | TYPE-순서배열 = **0.28294** (큰 변화) |
| C4.1 게이트 | tau=0.500 ✓, **contradictions=1 ✗** |
| 자동 롤백 | ✅ 정상 발동 → `lib/ontology-weights.json` 그대로 유지 |
| 실증된 가치 | "C4.1 게이트가 simulator 기반 학습된 큰 변화를 잡아낸다" |

→ **Pass-1과 동일하게 가중치는 변경되지 않았지만, 게이트가 잡아낸 것은 다른 종류의 위험.**

---

## 1. 배경: dogfooding-1의 한계와 우회 전략

### 1.1 dogfooding-1의 rank-1 X 문제
- 본인 세션 30개 모두 DEMO_DIAGNOSTIC (78/82/45/60/71) 사용
- `unique dimensionScores = 1` → ridge regression 정보 행렬 rank 1 → 특이 매트릭스
- 결과: λ=1.0 prior 그대로 회귀 (calibration이 의미를 가지지 못함)

### 1.2 P-1.5b로 깐 우회 경로
- **paste-import + active-diagnostic** 메커니즘 (W2 P-1.5b)
- 4개 varied diagnostic JSON 준비 (α/β/γ/δ — 약점 차원 분산)
- 그러나 dogfooding-2 실제 세션에서도 본인이 paste-import 미사용 → 30개 모두 demo 값

### 1.3 본 보고서의 우회: 합성 데이터 결합
- 본인 실측 30개는 보존 (real signal: 정답률, QT 선택 패턴)
- `scripts/simulate-varied-dogfooding.mjs`의 사전 생성물 1,200개 결합
- 시뮬레이터는 "현재 prior + 노이즈"가 아니라 **약간 다른 TRUE weight 모델**을 가정 → 의도적으로 prior와 어긋나는 신호 생성

---

## 2. Calibration 실행 결과

### 2.1 명령
```bash
node scripts/calibrate.mjs \
  --responses data/dogfood-combined-pass2.json \
  --min 100 --lambda 1.0 \
  --out out/preview-pass2.json
```

### 2.2 QT별 결과

| QT | samples | algorithm | divergence |
|---|---:|---|---:|
| 목적 | 0 | prior-fallback | 0.00000 |
| 심경 | 0 | prior-fallback | 0.00000 |
| **주장** | 110 | ridge-v1 | 0.01180 |
| **요지** | 390 | ridge-v1 | 0.07874 |
| 주제 | 0 | prior-fallback | 0.00000 |
| **제목** | 120 | ridge-v1 | 0.02360 |
| 빈칸 | 0 | prior-fallback | 0.00000 |
| 흐름무관 | 10 | prior-fallback | 0.00000 |
| **순서배열** | 600 | ridge-v1 | **0.28294** ⚠ |
| 문장삽입 | 0 | prior-fallback | 0.00000 |

### 2.3 가중치 변경 제안 (calibrated vs prior)

```
TYPE-주장:    D2: 10→13  D3: 55→62  D4: 10→ 7  D5: 20→13   (소폭, 합리적)
TYPE-요지:    D2: 10→10  D3: 50→37  D4: 25→48  D5: 10→ 0   (중간, D4↑)
TYPE-제목:    D2: 10→ 0  D3: 35→44  D4: 40→46  D5: 10→ 5   (소폭)
TYPE-순서배열: D2: 10→17  D3: 45→ 3  D4: 10→13  D5: 30→62  (대폭, D3↓↓ D5↑↑)
```

---

## 3. C4.1 게이트 발동 — 모순 검출

### 3.1 게이트 실행 결과
```
C4.1 regression result: tau=0.500, contradictions=1
Gate: tau ≥ 0.4 AND contradictions ≤ 0
❌ FAIL — restoring previous weights
```

### 3.2 모순 발생 위치
**TYPE-순서배열** 의 calibrated weight에서:
- D3_Context **declared = 3%** (< 5% threshold)
- D3_Context **derived  = 33%** (≥ 20% threshold)
- 규칙 위반: "derived ≥ 0.2 인데 declared < 0.05 → 도메인 증거 있음에도 저평가"

### 3.3 왜 발생했는가
- **순서배열 QT의 keyVariables** = `coherence_gap`, `discourse_structure`, `paragraph_dependency`, `given_sentence_role`
- C4.1 매핑 표상 이들은 D3 + D5에 균등 기여 → D3 derived = 33%
- 그러나 simulator의 TRUE weight 모델이 D5를 과도하게 가중 (62%) → D3가 거의 0으로 압축
- ridge가 simulator 신호를 충실히 학습 → 결과적으로 도메인 지식과 모순

### 3.4 자동 롤백 동작 확인
```
Restored previous weights from backup.
Failure report: out/promote-weights-fail.json
```
- `lib/ontology-weights.json` 변경 없음 (git diff = empty)
- 실패 리포트 영속화 ✅

---

## 4. 학습된 교훈

### L1. 게이트는 "출처에 무관"하게 작동한다
- dogfooding-1: 본인 30 응답 → D2 over-declared 검출
- dogfooding-2: real+sim 1230 응답 → D3 under-declared (sim 모델 편향) 검출
- **두 케이스 모두 게이트가 잡아냈다** → 안전망의 일반성 입증

### L2. Simulator는 calibrate 신호이지 ground truth가 아니다
- 시뮬레이터의 TRUE weight 모델 자체가 검증된 적 없음
- 게이트 없이 그대로 적용하면 학습이 도메인 지식을 deviate 시킬 위험
- **운영 원칙**: simulator 데이터는 C4.1 게이트 통과 시에만 weights 적용

### L3. "FAIL → rollback"은 실패가 아닌 시스템 작동
- Pass-1 보고서에서 이미 한 번 강조했으나, Pass-2에서 다른 시나리오로 재확인
- 가중치를 "업데이트해야 안전망이 작동했다"는 오해를 명시적으로 부정

### L4. paste-import UX 개선 필요 (dogfooding-3 백로그)
- 본인이 두 차례(Pass-1, Pass-2) 모두 paste-import 미사용 → demo만 사용
- 가능성:
  - (a) paste 박스 위치/가시성 부족
  - (b) "데모 로드" 버튼이 더 매력적
  - (c) varied diagnostic JSON을 외부 파일/URL로 받는 흐름이 더 자연스러움
- **권장 액션**: `/diagnose` 페이지 상단에 "varied diagnostic 4종 미리보기" 카드 추가, paste 박스를 첫 화면에 노출

---

## 5. 산출물

| 파일 | 내용 |
|---|---|
| `data/dogfood-real-pass2.json` | 본인 실측 30 응답 (export 사본) |
| `data/dogfood-combined-pass2.json` | real + synthetic 결합 1230 응답 |
| `out/preview-pass2.json` | calibration dry-run 결과 (4 QT) |
| `out/promote-weights-fail.json` | C4.1 게이트 실패 리포트 |
| `lib/ontology-weights.json` | **변경 없음 (rollback 후 v2 유지)** |

---

## 6. 다음 액션

### 즉시
- ✅ 본 보고서 commit + push
- 백로그: `/diagnose` paste-import UX 개선 (L4)

### Phase 2 백로그 갱신
- ▶ "Real varied data 수집 캠페인" → 본인 1인 환경 한계 명시 + 합성 신호 비중 영구 의존 인정
- ▶ simulator TRUE weight 모델 자체를 C4.1 게이트에 통과시키는 메타 검증 (W?)

### 데이터 운영
- `data/dogfood-combined-pass2.json` 은 `.gitignore` 제외 (사이즈 큼) — 본인 로컬 보존
- `out/promote-weights-fail.json` 은 commit (실패 사례 박물관)

---

## 7. 변경 이력
- 2026-05-23: dogfooding-pass-2 실행 — real 30 + sim 1200 결합 → C4.1 게이트 D3 under-declared 모순 검출 → 자동 롤백 정상 동작
