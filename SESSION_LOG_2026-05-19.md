# Session Log — 2026-05-19

usb_csat_mj_generator 진단 + P0~P4 머지 + 자산 보존까지의 시간 순 기록.
상세는 [HANDOFF_usb_csat_mj_generator_2026-05-19.md](HANDOFF_usb_csat_mj_generator_2026-05-19.md)와 [TARGET_STATE_usb_csat_mj_generator_2026-05-19.md](TARGET_STATE_usb_csat_mj_generator_2026-05-19.md) 참고.

---

## 1. 진입 — App Factory atlas 진단

- `smilepat/usb_csat_mj_generator` clone (`C:/tmp/`)
- `app-factory studio inspect` 2회 (루트 + `web-app/`)
- **결론**: generic atlas L0~L13은 콘텐츠 도메인 결함을 못 봄

## 2. 도메인 audit 도입

- [project_smilepat_audit](C:/Users/eltko/.claude/projects/C--Users-eltko/memory/project_smilepat_audit.md) profile의 `csat_strict` variant
- 합성 케이스 1건 audit → 93점 → distractor 분포 분석 가능 확인

## 3. 실측 24문항 batch

- web-app 서버 부팅 (sql.js, Gemini 2.5 Pro)
- 23개 신규 생성 → **8개 실패** (item 8, 10, 12, 13, 15, 16, 18, 19)
- 원인: `Wrong API use : tried to bind a value of an unknown type ([object Object])` × 8
- 성공한 15개 audit → 평균 97.5, 통과 15/15

## 4. P0 — sql.js bind fix

- 위치: `itemPipeline.js:saveItemResults`
- 원인: Gemini가 일부 유형에서 `options`를 `{option_no/number/id, text}` 객체로 반환
- Fix: `toScalar()` 헬퍼 + 두 INSERT의 `.run()` 인자 보호
- 검증: 같은 8개 유형 재생성 8/8 성공, 평균 audit 98.0
- **PR [#2](https://github.com/smilepat/usb_csat_mj_generator/pull/2) merged** (unarchive → merge → re-archive)
- Issue [#1](https://github.com/smilepat/usb_csat_mj_generator/issues/1) 생성 (P1 follow-up)

## 5. Handoff + Target State 작성

- [HANDOFF_usb_csat_mj_generator_2026-05-19.md](HANDOFF_usb_csat_mj_generator_2026-05-19.md) — 10개 섹션
- [TARGET_STATE_usb_csat_mj_generator_2026-05-19.md](TARGET_STATE_usb_csat_mj_generator_2026-05-19.md) — P1~P5 완료 시 기대 결과
- 권장 진행 순서 (ROI 기준): P1 단독 → P1+P2 → P1+P3 → 전체

## 6. P1 — Normalizer 근본수정

- `jsonUtils.js`에 `normalizeOption()` 헬퍼 추가 + `normalizeItemJson`·`normalizeSetItemJson` 두 곳 적용
- `web-app/scripts/migrate-normalize-options.js` 작성 (idempotent dry-run/apply)
- 검증: 8개 유형 재생성 → 모든 옵션 `string` 타입 8/8
- **PR [#3](https://github.com/smilepat/usb_csat_mj_generator/pull/3) merged**, Issue #1 closed

## 7. P2 — LC11 distractor strategy

- 원인 발견: LC11 prompt가 "distractors must be inappropriate" 명시 → NFD 강제
- Fix: 5종 archetype + plausibility ≥ 0.5 floor + per-distractor self-check
- `update-prompt-from-seed.js` 작성 (running DB 갱신용)
- 검증: 3-run 평균 overall 95→97, **D4 75→90 (+15)**
- **PR [#4](https://github.com/smilepat/usb_csat_mj_generator/pull/4) merged**

## 8. P3 — Layer 4 audit gate (이전 세션, 단계 5 이후 누락된 commit)

- 외부 audit을 4번째 게이트로 통합, `item_metrics`에 `layer4_*` 컬럼 추가
- env opt-in: `EXTERNAL_AUDIT_PROFILE_PATH` + `EXTERNAL_AUDIT_RETRY_BELOW`
- **PR [#5](https://github.com/smilepat/usb_csat_mj_generator/pull/5) merged**

## 9. P2-bis — LC14·LC16 prompt 확장

- LC16: 315 chars → 2907 chars (full rewrite, archetype 4종)
- LC14: archetype 보존 + plausibility floor block append
- 측정: LC14 D4 +2.5 / LC16 D4 +0 → **honest framing: marginal**
- 진짜 안전망은 P3의 retry 게이트라는 점 명시
- **PR [#6](https://github.com/smilepat/usb_csat_mj_generator/pull/6) merged**

## 10. P3-bis — SKIPPED

- `generateSetItems`는 각 item마다 `generateItemPipeline` 호출 → P3가 자동 inherit
- 별도 PR 불필요, handoff에 명시

## 11. P4 — Quality endpoint

- `GET /api/metrics/quality` — 7가지 집계 (distribution / by_item / by_verdict / by_prompt / blocking_freq / low_score / trend)
- `/summary` 확장 (avg_layer4_*, layer4_count 3 필드)
- **PR [#7](https://github.com/smilepat/usb_csat_mj_generator/pull/7) merged**

## 12. Spot-check 카드 작성

- [spot-check/](spot-check/) — README + AGGREGATE + 카드 4종
  - LC01 (overall 99) baseline
  - LC11 baseline (D4 75, NFD 케이스)
  - LC11 after P2 (D4 90)
  - RC19 (overall 100)
- 사용자 1회 spot-check 실시 → **"괜찮은 상태"** 평가

## 13. Handoff 갱신 + Re-archive

- HANDOFF doc §10 추가: 머지된 PR 7건 + KPI 비교표 + 남은 follow-up
- `archived = true` 복귀 (Tier 3-B 라벨 유지)

## 14. myprojects push

- commit `a5c3a0f` — HANDOFF 갱신 + spot-check/ 6 files
- 그 후 원격에 5 commit 더 추가됨 (pitch_view, partner outreach 등 — 다른 작업)
- `git pull` fast-forward로 `33f7d26`까지 정렬

---

## 최종 KPI 표

| 측정값 | Pre-session | After P0~P4 |
|---|---|---|
| 24문항 생성 성공률 | 67% | **100%** |
| LC11 D4 | 75 | **90** |
| LC14 D4 | 90 | 92.5 |
| LC16 D4 | 90 | 90 |
| DB raw JSON 저장 | ~33% | **평문** |
| 외부 audit | 수동 | **자동 (opt-in)** |
| Quality 집계 endpoint | 없음 | **/api/metrics/quality** |

## 머지된 PR 7건

1. [#2](https://github.com/smilepat/usb_csat_mj_generator/pull/2) — sql.js bind fix (P0)
2. [#3](https://github.com/smilepat/usb_csat_mj_generator/pull/3) — normalizer (P1, closes #1)
3. [#4](https://github.com/smilepat/usb_csat_mj_generator/pull/4) — LC11 distractor (P2)
4. [#5](https://github.com/smilepat/usb_csat_mj_generator/pull/5) — Layer 4 audit gate (P3)
5. [#6](https://github.com/smilepat/usb_csat_mj_generator/pull/6) — LC14/LC16 (P2-bis)
6. [#7](https://github.com/smilepat/usb_csat_mj_generator/pull/7) — quality endpoint (P4)

## 남은 (이번 세션 범위 밖)

- 🟢 Dashboard UI — `/api/metrics/quality` 시각화 (React Quality.js 확장)
- 🟢 Set-coherence audit — RC43-45 같은 multi-item 세트 일관성
- 🟢 σ > 5 drift alert (Slack/이메일)
- 🟡 학습자 N=20+ 사전 테스트 통합
- 🟡 smilepat profile을 web-app/npm package로 번들

## Reproducer scripts

`C:/tmp/` 아래 보존 (다음 세션 회귀 테스트용):

- `csat-batch-orchestrator.mjs` — 23 문항 일괄 생성
- `csat-audit-batch.mjs` — 생성 결과 smilepat 감사
- `csat-retry-failed.mjs` — 특정 유형만 재시도
- `csat-p1-retry.mjs`, `csat-p2-verify.mjs`, `csat-p2bis-verify.mjs` — 단계별 검증
- `build-spot-check-cards.mjs` — spot-check md 생성
- `migrate-normalize-options.js`, `update-prompt-from-seed.js` — repo 내 스크립트 (위 PR로 머지됨)
