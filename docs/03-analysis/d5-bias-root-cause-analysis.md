# D5_Usage 모순 근본 원인 분석 — R3 가설 정정

> 실시: 2026-05-23 (Phase 2 PRD §5 R3 검증)
> 선행: [dogfooding-pass-3.md](./dogfooding-pass-3.md), [stage-c-activation-simulation.md](./stage-c-activation-simulation.md)
> Status: ✅ **R3 가설 부정** — 실제 원인은 simulator 모델이 아니라 prior weights × C4.1 매핑의 구조적 불일치

---

## 0. 핵심 결과

3 cycle (Pass-3, Stage C 1명, Stage C 40세션) 모두 D5_Usage에서 over-declared 모순 검출. 두 가설을 순차 검증:

| 가설 | 검증 결과 |
|---|---|
| R3.a: simulator의 D5 모델링 약함 | ❌ 부정 — preset 간 D5 inter-variance 가장 큰 차원 아님 (D2가 더 큼) |
| R3.b: D5 prior weight inter-QT 변산 작음 | ❌ 부정 — D3가 D5보다 더 작은 변산 (D5=0.0071 vs D3=0.0039) |
| **R3.c: 심경/제목 QT의 D5 derived weight = 0** | ✅ **확인** — 진짜 원인 |

---

## 1. 진짜 원인 (R3.c)

`docs/01-plan/dimension-mapping.md §3` keyVariable → dimension 매핑상:

### 1.1 TYPE-심경 (감정·분위기)
- keyVariables: `emotional_indirectness`, `emotion_vocab_density`
- 매핑 결과: `emotional_indirectness` → D3_Context (단독) + `emotion_vocab_density` → D2_Meaning (단독)
- **D5_Usage 매핑 = 0**
- 도메인 직관: 심경 파악은 어휘·문맥 신호로 결정되며, 화용 (D5_Usage) 단서 별로 없음

### 1.2 TYPE-제목 (제목 추론)
- keyVariables: `title_abstractness`, `metaphor_density`
- 매핑 결과: `title_abstractness` → D4_Network + D3_Context (균등) + `metaphor_density` → D4_Network (단독)
- **D5_Usage 매핑 = 0**
- 도메인 직관: 제목은 추상성/은유로 결정 — 콜로케이션/화용 (D5) 단서 별로 없음

### 1.3 C4.1 게이트의 두 모순 규칙
```
declared ≥ 0.2 AND derived = 0  → contradiction (선언만 있고 증거 없음)
declared < 0.05 AND derived ≥ 0.2 → contradiction (증거 있는데 저평가)
```

심경/제목의 D5는 derived = 0 (위 §1.1-1.2). prior에서 D5 declared = 0.10 (5% < 10% < 20%, 안전 영역). ridge가 simulator noise로 D5를 0.20+ 올리면 즉시 `declared ≥ 0.2 AND derived = 0` 트리거.

---

## 2. 왜 D5만 반복 catch 되는가

각 차원의 prior declared 표 (10 QT 평균):

| Dim | prior mean | prior min | prior max |
|---|---:|---:|---:|
| D1_Form | 0.05 | 0.05 | 0.05 |
| D2_Meaning | 0.16 | 0.10 | 0.35 |
| D3_Context | 0.46 | 0.35 | 0.55 |
| D4_Network | 0.18 | 0.10 | 0.40 |
| D5_Usage | 0.16 | 0.05 | 0.30 |

D5 mean = 0.16, max = 0.30 (TYPE-순서배열). 즉 일부 QT에서 D5 declared가 안전 영역(0.10) 인데, derived = 0인 QT가 다수 (심경, 제목, 요지, 주제, 빈칸추론, 흐름무관, 순서배열, 문장삽입 — 7/10). 노이즈가 D5를 살짝 올리면 즉시 0.20 통과 → catch.

D2의 경우 derived ≥ 0.2인 QT가 있어 ridge가 올린 D2를 derived가 받쳐줌 → contradiction 빈도 낮음.

---

## 3. 결론

### 3.1 R3.c 진단
**Simulator는 정상.** prior weights (ontology-weights.json v2)도 정상. C4.1 매핑도 정상. 셋이 결합되는 지점에 구조적 sensitivity 존재:

> **7개 QT에서 D5_derived = 0인데 D5_declared ≈ 0.10 으로 borderline. ridge noise → 즉시 모순.**

이는 게이트가 의도대로 작동하는 결과이지, simulator 또는 weight 결함이 아님.

### 3.2 운영 의미
- **현 상태 유지가 정답**: 게이트가 D5 over-declared를 catch하는 것은 정상. 도메인 expert가 D5와 무관하다고 판단한 QT에 자동 가중치가 들어가지 못하도록 보호.
- **simulator를 "fix"할 필요 없음**: simulator noise가 D5로 흘러도 게이트가 잡음. 의도된 안전망.
- **외부 학습자 데이터 도착 시 변화**: 실제 학습자에서 D5 신호가 진짜로 측정되면 (즉, 화용 단서가 심경 파악에 기여한다는 도메인 외 증거가 데이터로 등장), C4.1 매핑을 정정해야 할 수 있음. 그 때까지 현 상태가 보호 정답.

---

## 4. Phase 2 PRD §5 R3 수정 권장

원본:
> R3 (중간): simulator D5_Usage 구조적 bias
> 가설: simulator's bias term 모델이 D5 차원을 과도하게 가중

정정:
> R3 (낮음): D5_Usage 게이트 catch는 simulator 결함이 아닌 구조적 sensitivity
> 발견: 7개 QT가 D5 derived = 0인데 prior declared ≈ 0.10 borderline → 모든 ridge noise가 즉시 catch. 게이트의 의도된 동작. simulator/weights 변경 불필요.
> 후속: 외부 학습자 데이터에서 D5 신호가 실측 시 keyVariable 매핑 재검토 트리거.

---

## 5. 학습된 교훈

### L1. 가설은 정량 검증 후만 신뢰
"simulator 모델이 약하다" 직관은 정량 검증에서 부정. preset 분산 표 + prior 분산 표 + keyVariable 매핑 정렬을 통해 진짜 원인 파악.

### L2. 안전망이 옳다는 신호도 다 모순 catch가 아니다
3 cycle 같은 차원에서 catch되는 패턴은 simulator/weight를 의심하게 만들지만, 실제로는 **게이트가 그 영역의 sensitivity를 올바르게 보호**하는 신호.

### L3. dimension-mapping ↔ ontology-weights ↔ simulator 3중 정렬 점검
세 곳 모두 변경 가능한 상태에서, "왜 catch가 되는가"를 답하려면 셋의 결합 sensitivity를 보아야. 본 보고서가 그 점검 patterns 제공.

---

## 6. 다음 액션

### Claude 자율
- ✅ 본 보고서 commit + push
- Phase 2 PRD §5 R3 정정 (severity "중간" → "낮음", 가설 정정)

### 미래 (외부 학습자 데이터 도착 시)
- 외부 학습자에서 D5 정답률과 D5 score의 실측 상관 측정
- 상관 > 0.3 시 keyVariable mapping에 D5 cue 보강 (도메인 expert 결재)

---

## 7. 변경 이력
- 2026-05-23: 본 분석 작성 — R3.a/b 부정, R3.c 진단 (Phase 2 PRD R3 수정 트리거)
