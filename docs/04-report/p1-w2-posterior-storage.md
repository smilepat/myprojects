# P-1 Week 2 진행 보고 — Beta Posterior Storage + Session Wiring

> 실행: 2026-05-23 / 기준: [phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md) §6 W2
> Status: ✅ W2 완료 (11/11 store 테스트 통과 + queue 세션 자동 영속화)

---

## 0. 결과

| 항목 | 결과 |
|---|---|
| `lib/recommendation-store.ts` (localStorage 영속화) | ✅ 구현 완료 |
| Diagnostic fingerprint 기반 drift detection | ✅ |
| Prior reseed (blend 0.7×old + 0.3×new) | ✅ |
| `persistSessionResponses` — 세션 종료 시 일괄 반영 | ✅ |
| Multi-user 격리 (key prefix `oelp.posteriors.{userId}`) | ✅ |
| Schema version + 손상 JSON fallback | ✅ |
| `app/queue/page.tsx` — 세션 종료 시 자동 영속화 | ✅ |
| UI: Thompson posterior 표시 (α, β, samples, confidence) | ✅ |
| 단위 테스트 11건 | ✅ **11/11 PASS** |
| Next.js 프로덕션 빌드 회귀 | ✅ |

→ Week 3 (`buildQueueV2` 통합) 시작 가능.

---

## 1. 구현 상세

### 1.1 [`lib/recommendation-store.ts`](https://github.com/smilepat/oelp/blob/main/lib/recommendation-store.ts)

| Function | 역할 |
|---|---|
| `diagnosticFingerprint(scores)` | 5D 점수를 5단위 bucket으로 양자화한 안정 fingerprint |
| `loadPosteriors(scores, userId?)` | localStorage 로드 + fingerprint 비교 시 자동 reseed |
| `savePosteriors(posteriors, scores, userId?)` | 영속화 + 메타 (version, updatedAt, fingerprint) 기록 |
| `clearPosteriors(userId?)` | 사용자별 storage wipe |
| `reseedPosteriors(old, newScores, blendOld=0.7)` | drift 시 blend mean (0.7×old + 0.3×prior) |
| `persistSessionResponses(responses, scores, userId?)` | 세션 종료 시 일괄 update + save |
| `syncFromSupabase(userId?)` | Phase 1.5+ stub (현재 no-op) |

### 1.2 핵심 결정 사항

**Storage key**: `oelp.posteriors.{userId}` — dogfooding 환경은 `default`, 추후 multi-user 시 자연 확장.

**Fingerprint 양자화 5단위**: D3 점수 45 → 47 같은 미세 jitter는 같은 bucket(`D3_Context=45`)으로 매핑 → 매 진단마다 reseed 발생 방지.

**Reseed blend policy**:
- 진단이 의미 있게 변할 때(예: D3 45 → 70)에만 reseed
- Hard reset 대신 `0.7 × old + 0.3 × new prior`로 학습자 신호 보존
- Sample count는 `floor(old.samples × 0.7)`로 감쇠

**Schema version 1**: 향후 스키마 변경 시 fresh prior로 fallback (T10 검증).

### 1.3 [`app/queue/page.tsx`](https://github.com/smilepat/oelp/blob/main/app/queue/page.tsx) 통합

세션 finalize 시점:
1. Leitner SR 적용 (기존)
2. **`persistSessionResponses` 호출** → posterior + storage 갱신
3. Summary 패널에 Thompson posterior 표시 (α, β, samples, confidence)

Response 인터페이스에 `qtId` 추가 — 세션 카드는 모두 동일 QT이므로 `plan.targetQuestionType.id` 사용.

---

## 2. 단위 테스트 ([scripts/test-recommendation-store.mjs](https://github.com/smilepat/oelp/blob/main/scripts/test-recommendation-store.mjs))

```
✓ T1: First load (empty storage) returns initial priors
✓ T2: Save → load round-trip preserves posteriors
✓ T3: diagnosticFingerprint stable across small jitter (±2 within bucket)
✓ T4: diagnosticFingerprint changes when score crosses bucket
✓ T5: Load with drifted diagnostic triggers reseed (not raw load)
✓ T6: Reseed blends old mean with new prior mean
✓ T7: persistSessionResponses updates and saves
✓ T8: clearPosteriors wipes state
✓ T9: Corrupted JSON falls back to initial priors
✓ T10: Schema version mismatch triggers fresh prior
✓ T11: Multi-user — independent storage keys

11 / 11 tests passed
```

### T6 핵심 검증

극단적 old posterior (α=90, β=10, mean=0.9) → 새 진단으로 reseed → blended mean ≈ 0.795 (= 0.7 × 0.9 + 0.3 × 0.55). 학습자 신호 70% 보존.

### T11 핵심 검증

Multi-user: userA(정답 1회) vs userB(오답 1회) → 두 storage 분리, posterior mean 다름. 단일 사용자 단일 storage 격리 정상.

---

## 3. UI 변경

세션 완료 패널에 Thompson posterior 정보 추가:

```
Thompson posterior — 요지 파악
α=4.0 · β=4.3 · samples=10 · confidence=mid
다음 큐 추천에 즉시 반영됨 (localStorage 영속화).
```

W3에서 buildQueueV2 통합 시 다음 세션 시작 시점에 본 posterior가 자동 사용됨.

---

## 4. 알려진 한계 (W2 시점)

### L1 — Supabase 동기화 미구현
- `syncFromSupabase()` 는 stub (return `{ synced: 0, reason }`)
- `NEXT_PUBLIC_SUPABASE_URL` 설정 시 자동 활성화 — W6 batch job 작업
- Phase 1 dogfooding 환경에서는 영향 없음

### L2 — buildQueue 미통합
- 현재 W1+W2 작업물은 queue.ts 와 격리됨
- `buildQueue()`는 여전히 결정성 룰엔진
- W3 작업: `buildQueueV2(diag, history?)` — Thompson 결과를 dimension 필터에 적용

### L3 — userId 다일 사용자 단일값 (`default`)
- Supabase Auth 통합 시 `auth.uid()` 활용 예정
- Phase 1.5+ multi-user 대비

### L4 — Reseed blend 가중치 hyperparameter
- 현재 0.7 / 0.3 hardcoded
- 추후 ablation 또는 사용자 선호도 기반 조정 검토 (W5 ridge regression 시점)

---

## 5. 다음 단계

### W3 (queue 통합)
- `lib/queue.ts buildQueueV2()` 신규 — Thompson 결과 + dimension 필터 결합
- Fallback 정책: history null/empty → rule-v1 결과 wrap
- queue page에서 `loadPosteriors → buildQueueV2 → 큐 표시 → finalize 시 persistSessionResponses` 흐름 완성

### Ablation 후보 (W5에서 본격)
- Smoothing strength k ∈ {2, 5, 10}
- Reseed blend weight ∈ {0.5, 0.7, 0.9}
- Fallback threshold N ∈ {5, 10, 20}

---

## 6. 누적 P-1 진행 상황

- **W1 ✓** Thompson sampling 단독 구현 + 10/10 테스트 ([commit 9cf7e5e](https://github.com/smilepat/oelp/commit/9cf7e5e))
- **W2 ✓** Posterior 영속화 + reseed + queue 통합 + 11/11 테스트 (본 작업)
- W3 ☐ `buildQueueV2` 통합
- W4 ☐ UI: confidence + algorithm 태그
- W5 ☐ Ridge regression
- W6 ☐ Weekly batch + Supabase sync
- W7 ☐ CI 자동화
- W8 ☐ dogfooding + 정성 평가

→ 25% 완료 (W1+W2). 코어 라이브러리 모두 단위 테스트 통과.

---

## 7. 인용 위치

- 본 보고서: [04-report/p1-w2-posterior-storage.md](./p1-w2-posterior-storage.md)
- W1 보고서: [04-report/p1-w1-thompson-sampling.md](./p1-w1-thompson-sampling.md)
- 설계: [02-design/phase2-p1-recommendation-v2.md](../02-design/phase2-p1-recommendation-v2.md)
- 구현: [oelp/lib/recommendation-store.ts](https://github.com/smilepat/oelp/blob/main/lib/recommendation-store.ts)
- 테스트: [oelp/scripts/test-recommendation-store.mjs](https://github.com/smilepat/oelp/blob/main/scripts/test-recommendation-store.mjs)
