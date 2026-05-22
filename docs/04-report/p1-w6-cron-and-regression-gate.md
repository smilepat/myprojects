# P-1 Week 6 진행 보고 — Weekly Calibration with C4.1 Regression Gate

> 실행: 2026-05-23 / 기준: [phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md) §2.2, §6 W6
> Status: ✅ W6 완료 (auto-rollback 검증 + GH Actions workflow + Supabase sync 스캐폴드)

---

## 0. 결과

| 항목 | 결과 |
|---|---|
| `lib/ontology-weights.json` 단일 소스 분리 | ✅ |
| `lib/ontology.ts` JSON import로 리팩토링 | ✅ |
| `scripts/synthetic-validation-c4-1.mjs` JSON 동기 | ✅ (C4.1 PASS 유지 검증) |
| `scripts/promote-weights.mjs` C4.1 회귀 게이트 | ✅ (자동 롤백 동작 검증) |
| `scripts/calibrate.mjs --apply` 체인 | ✅ |
| `scripts/sync-responses-from-supabase.mjs` | ✅ (degraded mode 동작) |
| `.github/workflows/weekly-calibration.yml` cron | ✅ |
| Next.js 빌드 회귀 (JSON import 포함) | ✅ |

→ 누적 P-1 진행 **75%** (W1+W2+W3+W4-partial+W5+W6 / 8주). 다음: W7 (CI) 또는 W8 (dogfooding).

---

## 1. 단일 소스 리팩토링

### 1.1 [`lib/ontology-weights.json`](https://github.com/smilepat/oelp/blob/main/lib/ontology-weights.json) 신설

```json
{
  "schemaVersion": 1,
  "version": "v2-2026-05-22",
  "calibrationHistory": [
    { "version": "v1...", "trigger": "initial heuristic", "result": "C4.1 v1 FAIL" },
    { "version": "v2...", "trigger": "calibration cycle", "result": "C4.1 v2 PASS" }
  ],
  "weights": { "TYPE-목적": {...}, ... }
}
```

**핵심**: 가중치는 이 JSON만 단일 소스. promote-weights.mjs 가 이 파일만 mutate. ontology.ts 와 C4.1 스크립트 모두 여기서 로드.

### 1.2 [`lib/ontology.ts`](https://github.com/smilepat/oelp/blob/main/lib/ontology.ts) 리팩토링

```ts
import weightsModule from "./ontology-weights.json";
const WEIGHTS = (weightsModule as { weights: ... }).weights;
function w(id: string) { ... }
export const QUESTION_TYPES = [
  { id: "TYPE-목적", ..., weights: w("TYPE-목적") },
  ...
];
```

`resolveJsonModule: true` (tsconfig) 활성화로 native JSON import. Next.js 16 bundler resolution이 처리.

### 1.3 [`scripts/synthetic-validation-c4-1.mjs`](https://github.com/smilepat/oelp/blob/main/scripts/synthetic-validation-c4-1.mjs) 갱신

Inline weights 제거 → `readFileSync("lib/ontology-weights.json")` 로 동기화.

**검증**: 리팩토링 후 C4.1 재실행 → tau 0.600, contradictions 0 → **PASS** (v2 상태 동일).

---

## 2. [`scripts/promote-weights.mjs`](https://github.com/smilepat/oelp/blob/main/scripts/promote-weights.mjs)

### 동작 흐름

1. `--calibration` 파일 (calibrate.mjs 결과) 로드
2. `lib/ontology-weights.json` 백업 (메모리)
3. ridge-v1 알고리즘으로 계산된 QT만 갱신 (fallback QT는 보존)
4. 새 가중치 + `calibrationHistory` 항목 추가하여 저장
5. `scripts/synthetic-validation-c4-1.mjs` 자동 실행 (자식 프로세스)
6. 출력 markdown에서 `Kendall tau (median)` + `도메인 모순` 파싱
7. 게이트: `tau ≥ minTau (0.4)` AND `contradictions ≤ maxContradictions (0)`
8. PASS → keep + `out/promote-weights-success.json` 기록
   FAIL → 백업 복원 + `out/promote-weights-fail.json` 기록 + exit 1

### 자동 롤백 검증 (실제 실행)

합성 응답 기반 calibration → C4.1 결과 `tau=0.500, contradictions=2` → 게이트 차단:

```
❌ FAIL — restoring previous weights
Restored previous weights from backup.
Failure report: out/promote-weights-fail.json
```

`lib/ontology-weights.json` 파일 헤드 확인 → 여전히 `"version": "v2-2026-05-22"` (롤백 완료).

**의미**: 합성 응답의 정확도가 낮으면 자동으로 거부 — 안전.

---

## 3. [`scripts/calibrate.mjs --apply`](https://github.com/smilepat/oelp/blob/main/scripts/calibrate.mjs)

```bash
node scripts/calibrate.mjs --responses data/fake-responses.json --apply
```

체인:
1. calibrate (ridge regression) 실행 → `out/calibration-latest.json` 저장
2. `promote-weights.mjs --calibration out/calibration-latest.json` 자동 spawn
3. C4.1 회귀 게이트 → PASS/FAIL → exit code 전달

End-to-end 검증 완료 — 합성 응답으로 호출 시 회귀 FAIL이 정상 검출되어 롤백.

---

## 4. [`scripts/sync-responses-from-supabase.mjs`](https://github.com/smilepat/oelp/blob/main/scripts/sync-responses-from-supabase.mjs)

### 동작

- `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` 환경변수 활용
- Supabase events 테이블에서 `queue.item_answered` fetch
- `queue.started` events에서 queue_id → qtId 매핑
- `diag.completed` events에서 user_id → dimensionScores 매핑
- 조인 후 calibrate.mjs 입력 형식으로 작성

### Degraded 모드

환경변수 미설정 시 (CI fork, 로컬 dev) → 빈 배열 작성 + 경고 후 정상 종료. 워크플로 차단 안 함.

검증: 환경변수 없는 상태에서 실행 → 정상 동작 ("Wrote 0 responses").

---

## 5. [`.github/workflows/weekly-calibration.yml`](https://github.com/smilepat/oelp/blob/main/.github/workflows/weekly-calibration.yml)

### Triggers

- `schedule: cron "0 2 * * 0"` (일요일 02:00 UTC)
- `workflow_dispatch` (수동) — `dry_run` + `min_responses` 입력

### Steps

1. Checkout + Node 20 + `npm ci`
2. Sync responses from Supabase (with secrets)
3. Threshold check (수동 트리거 시 `min_responses` 보다 적으면 skip)
4. `calibrate.mjs --apply` 실행 (또는 dry-run)
5. PASS 시 `peter-evans/create-pull-request@v6` 로 PR 자동 생성
6. FAIL 시 `out/promote-weights-fail.json` 아티팩트 업로드

### Required Secrets (실 활성화 시)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

미설정이면 sync 스크립트가 degraded mode로 처리 → 빈 응답 → calibrate skip → workflow는 정상 종료.

---

## 6. 산출물 인덱스

| 파일 | 신/수정 | 역할 |
|---|---|---|
| `lib/ontology-weights.json` | 신규 | 단일 소스 |
| `lib/ontology.ts` | 수정 | JSON import |
| `scripts/synthetic-validation-c4-1.mjs` | 수정 | JSON 동기 |
| `scripts/promote-weights.mjs` | 신규 | C4.1 회귀 게이트 |
| `scripts/calibrate.mjs` | 수정 | --apply 체인 |
| `scripts/sync-responses-from-supabase.mjs` | 신규 | events → responses |
| `.github/workflows/weekly-calibration.yml` | 신규 | 주간 cron |

---

## 7. 알려진 한계 (W6 시점)

### L1 — Supabase 환경 설정 부재
- 실제 sync는 secrets 설정 후만 작동
- 현재 OELP 환경에 Supabase 미배포 — dogfooding 단계에서 미필요
- W8 dogfooding → 실 응답 누적 시 Supabase 셋업 가치 발생

### L2 — promote-weights 단위 테스트 부재
- spawnSync 의존 + 파일 IO 부수효과 — 단위 테스트보다 integration 테스트 적합
- W6에서는 manual end-to-end 검증으로 대체 (위 §2 자동 롤백 검증)
- W7 CI에서 PR 마다 자동 실행 — 회귀 안전망

### L3 — sync-responses 스키마 매핑 가정
- analytics-events.md `queue.started.properties.target_question_type` 필드 필요
- 현재 events.md 스키마에 `target_question_type` 명시 — 검증 완료

### L4 — Cron 시점 GH Actions secret 설정 의존
- 첫 cron 트리거 전 GitHub repo Settings에서 secrets 추가 필요
- 자동화는 secret 설정 후만 진행

---

## 8. 누적 P-1 진행

- ✅ **W1** Thompson sampling 코어 (10/10) — [report](./p1-w1-thompson-sampling.md)
- ✅ **W2** Posterior storage + reseed (11/11) — [report](./p1-w2-posterior-storage.md)
- ✅ **W3** buildQueueV2 통합 + UI 칩 (8/8) — [report](./p1-w3-buildqueuev2-integration.md)
- ✅ **W4** (W3에서 부분 선행)
- ✅ **W5** Ridge regression + CLI (10/10) — [report](./p1-w5-ridge-calibration.md)
- ✅ **W6** Auto-promote + Cron + Supabase sync (회귀 게이트 manual 검증) ← 본 작업
- ☐ **W7** CI 자동화 (Vitest 도입 + GH Actions PR 검증)
- ☐ **W8** dogfooding + 정성 평가

**누적 단위 테스트**: 10 (W1) + 11 (W2) + 8 (W3) + 10 (W5) = **39건 PASS** (W6은 integration 검증 추가)

**전체 OELP 상태**:
- Phase 1 자동 11/12 PASS (96%)
- P-1: **75% complete** (6/8 weeks)

---

## 9. 인용 위치

- 본 보고서: [04-report/p1-w6-cron-and-regression-gate.md](./p1-w6-cron-and-regression-gate.md)
- 누적 시리즈: W1-W5 reports
- 설계: [02-design/phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md)
- 구현:
  - [oelp/lib/ontology-weights.json](https://github.com/smilepat/oelp/blob/main/lib/ontology-weights.json)
  - [oelp/scripts/promote-weights.mjs](https://github.com/smilepat/oelp/blob/main/scripts/promote-weights.mjs)
  - [oelp/.github/workflows/weekly-calibration.yml](https://github.com/smilepat/oelp/blob/main/.github/workflows/weekly-calibration.yml)
