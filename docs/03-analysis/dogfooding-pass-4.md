# Dogfooding Pass 4 — Exploration Target Effect Verification

> 실시: 2026-05-23 (v3++ sprint 종료 시점)
> 스크립트: [smilepat/oelp scripts/dogfood-4-exploration.mjs](https://github.com/smilepat/oelp/blob/main/scripts/dogfood-4-exploration.mjs)
> 검증 대상: [phase2-p1-recommendation-w9-exploration.md](../02-design/phase2-p1-recommendation-w9-exploration.md) 가설
> Status: ✅ **starvation 6 → 0, balance 0 → 0.05** — exploration target 효과 정량 검증

---

## 0. 핵심 결과

| 측정 | Before (dogfood-3 baseline) | After (+30 sessions, 매 4번째 exploration) |
|---|---:|---:|
| posteriorBalance | 0.00 | **0.05** |
| Starved QTs (samples=0) | **6** | **0** ✓ |
| Total samples | 1600 | 1900 (+300) |
| Exploration sessions | — | 7 |
| Exploitation sessions | — | 23 |

→ **Phase 2 P-1 W9 design doc §7 검증 기준 일부 달성**: starvation QT 6 → 0 ✓ (4주 안 목표 0).

---

## 1. 실험 설계

### 1.1 Setup
- **Base posterior**: dogfood-3 결과 모사
  - 4 QT × 400 samples = 1600 (심경/요지/제목/순서배열)
  - 6 QT × 0 samples (목적/주장/주제/빈칸/흐름무관/문장삽입)
- **Learner profile**: ext-001 (Stage C sim과 동일 — D2/D4 약점, B1 재수생)
- **Run**: 30 additional sessions × 10 cards = 300 추가 응답

### 1.2 Selection policy
- **Every 4th session**: `findExplorationTarget(posteriors, exclude=[weakest])` 사용 → starved QT 1개 선택
- **Other sessions**: pickWeakest(dims) 사용 → TYPE-심경 (weakest)

### 1.3 Determinism
seed=11 (mulberry32) — 동일 명령 재실행 시 결과 동일.

---

## 2. 결과 상세

### 2.1 Per-QT samples 변화
```
TYPE-목적        0 →  10   (+10, exploration 1회)
TYPE-심경      400 → 630   (+230, 23 exploit sessions)
TYPE-주장        0 →  10   (+10, exploration 1회)
TYPE-요지      400 → 400   (변동 없음, primary 후보 아님)
TYPE-주제        0 →  10   (+10, exploration 1회)
TYPE-제목      400 → 400
TYPE-빈칸추론    0 →  20   (+20, exploration 2회)
TYPE-흐름무관    0 →  10
TYPE-순서배열  400 → 400
TYPE-문장삽입    0 →  10
```

7 exploration sessions → 7개 cold QT 모두 sample 확보 (1개는 2번 선택 — 빈칸추론).

### 2.2 PosteriorBalance trajectory

Initially 0 → after 30 sessions: 0.05.

balance = min(samples) / mean(samples) = 10 / 190 = 0.0526.

**0.3 목표에 도달하려면**: min(samples) ≥ 0.3 × mean(samples). 현재 trajectory에서:
- mean = 190
- 0.3 × 190 = 57
- min을 57까지 끌어올리려면 cold QT 각 ~50 samples 추가 필요
- exploration 7 sessions × 10 cards = 70 cards 분배 — 7 QT에 평균 10
- ⇒ **40-50 사이클 (160-200 sessions)** 후 0.3 도달 forecast

### 2.3 운영 의미

- 외부 학습자 4명 × 4 sessions/week × 4 weeks = 64 sessions / 학습자 → 256 sessions/4 learners → 이 중 1/4 = 64 exploration sessions
- 64 explorations × 10 cards = 640 추가 cards 분배 → cold QT 90+ samples each → balance ≥ 0.3 도달
- **Phase 2 W4-W8 시점에 starvation 자연 해소 forecast**

---

## 3. C4.1 게이트 영향

본 시뮬레이션은 calibration cycle을 trigger하지 않음 (단순 sample 누적). 그러나 가설 검증:

- 만약 cold QTs (6개) 가 sample 충분히 누적되면 → ridge regression이 더 신뢰성 있는 weight 추정
- 결국 dogfooding-3 cycle 에서 검출된 D5 over-declared 패턴도 **외부 학습자 단독 calibration 으로 자연 해소** 가능성

→ exploration target = **장기 게이트 통과 확률 상승** 메커니즘.

---

## 4. 한계 + 후속

### 4.1 본 시뮬레이션의 한계
- correctness 모델이 dogfood-3와 동일 — 외부 학습자 실제 응답 패턴은 다를 수 있음
- exploration 빈도 (매 4번째) 는 휴리스틱 — 학습자 fatigue / motivation 고려 안 됨
- queue builder (`buildQueueV3`) 가 exploration target을 실제로 사용하는 통합은 미구현 (UI chip만 노출 — 사용자 선택 의존)

### 4.2 후속 작업
- **buildQueueV3 옵션 확장**: `--use-exploration` 옵션으로 매 N번째 큐를 exploration target으로 생성
- **adaptive exploration frequency**: posteriorBalance에 따라 동적 조정 (현재 < 0.1 → 매 2번, 0.1-0.5 → 매 4번, ≥ 0.5 → 비활성)
- **외부 학습자 데이터 실험**: Stage C 활성화 후 실제 응답으로 재실행

---

## 5. 산출물

| 파일 | 내용 |
|---|---|
| `scripts/dogfood-4-exploration.mjs` | seeded simulator (reproducible) |
| `out/dogfood-4-exploration-11.json` | 본 실행 결과 + trajectory snippet |
| `lib/recommendation.ts` `findExplorationTarget` | code helper (이미 commit) |
| `app/queue/page.tsx` exploration chip | UI 노출 (이미 commit) |
| `components/PosteriorBalancePanel.tsx` | /sessions 실시간 모니터 (이미 commit) |

---

## 6. 누적 비교 (4 cycles)

| Cycle | 응답 | unique dims | balance | starved | C4.1 결과 |
|---|---:|---:|---:|---:|---|
| Pass-1 | 30 | 1 | — | 6 | FAIL (D2 over) |
| Pass-2 | 1230 | 121 | — | 6 | FAIL (D3 under) |
| Pass-3 | 1600 | 40 | 0 | 6 | FAIL (D5 over) |
| **Pass-4** | **1900** | **48** | **0.05** | **0** | (calibrate untriggered, exploration only) |

→ Pass-4는 **calibration cycle이 아닌 sampling distribution cycle**. C4.1 게이트와 직교하지만, 장기 게이트 통과율 상승 메커니즘 제공.

---

## 7. 변경 이력
- 2026-05-23: 본 시뮬레이션 작성 (Phase 2 P-1 W9 design doc 검증)
