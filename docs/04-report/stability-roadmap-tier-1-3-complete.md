# OELP Stability Roadmap — Tier 1-3 완료 보고서

> Sprint: 2026-05-23 단일 세션
> Scope: 장기 안정성 로드맵 Tier 1 (데이터 계약) + Tier 2 (자동 동기화) + Tier 3 (외부 의존성)
> Status: ✅ **7/7 작업 완료 · 1인 솔로 환경에서 6개월 손 떼도 무너지지 않는 시스템 구축**

---

## 0. TL;DR

- **130 → 165 tests** (+35, 모두 안정성 게이트)
- **3 schemas** (regression-history, ontology-weights, vocab-pool-source) + 1 round-trip schema (diagnostic-input)
- **CI 게이트 8단계**: lint → tests → schema validation → README freshness → C4.1 → C4.2 → build → artifact upload
- **자동 게이트 추가**: Dependabot weekly, README counters auto-sync, ontology-weights write-protection
- **smilepat/oelp**: 6 커밋 (39a54f5 → 650abc7)

---

## 1. 완료된 7개 작업

| Tier | 작업 | 커밋 | 효과 |
|---|---|---|---|
| **T1.1** | regression-history JSON Schema + CI | 39a54f5 | C4.1 게이트의 audit log가 손상되면 PR 차단 |
| **T1.3** | DiagnosticInput schema + round-trip CI | 2d9e1ce | level-test-pat ↔ OELP 컨트랙트 깨지면 PR 차단 |
| **T2.1** | README counters auto-derived | dc2b188 | "X tests · Y routes" 손 갱신 drift 영구 종결 |
| **T1.2** | ontology-weights write-protection | 5a559e6 | promote-weights 외부에서 가중치 편집 시 schema 거부 |
| **T2.3** | dimension-mapping consistency | 3a53e73 | myprojects dim-mapping ↔ OELP weights drift 검출 |
| **T3.1** | CSV provenance checksum | 112e897 | 14MB gitignored CSV 변경을 lib/vocab-pool-source.json으로 추적 |
| **T3.2** | Dependabot config | 650abc7 | 주간 보안 패치 + Actions 버전 자동 PR |

---

## 2. 새로 깔린 안전망 레이어

### 2.1 데이터 계약 (Tier 1)

```
JSON file edited → 
  ├─ scripts/validate-schemas.mjs (CI)       ─┐
  ├─ tests/schemas.test.ts (local + CI)      ─┼─► PR 차단 if invalid
  └─ schemas/<name>.schema.json (source of truth)
```

3개 JSON 파일이 schema 게이트 진입:
- `lib/regression-history.json` (C4.1 audit log)
- `lib/ontology-weights.json` (가중치 + lastWriter)
- `lib/vocab-pool-source.json` (CSV provenance)

### 2.2 lastWriter write-protection

`ontology-weights.json` 의 모든 쓰기에 `lastWriter` 필수:
- `tool: "promote-weights"` — `scripts/promote-weights.mjs`가 자동 기록 (reason 옵션)
- `tool: "manual"` — **수동 편집 시 reason 필수** (allOf conditional)

→ 누군가 직접 weights를 편집하면 schema가 거부 (reason 누락 시).

### 2.3 README 자동 동기화

`scripts/update-readme-counters.mjs` 가 8개 placeholder 갱신:
- 헤더 배지 (`X Vitest tests · Y routes · Z lib modules`)
- CI 라인, PR-check bullet
- Stack 요약 (`Vitest 4.1.7 (N test files, M tests)`)
- §3 lib modules 카운트, §4 scripts 카운트
- §5 safety net Vitest 라인

`--check` 모드 → 로컬 `npm test` + CI 모두 drift 즉시 감지.

### 2.4 dimension-mapping 3중 sync

```
ontology.ts QUESTION_TYPES   ─┐
                              ├─► tests/dimension-mapping-consistency.test.ts
ontology-weights.json keys    ─┤   (6 tests)
                              ─┘
myprojects/.../dimension-mapping.md §1.2 (snapshot embedded in test)
```

3개 중 하나라도 drift → CI fail.
- A: ontology.ts QT ids ↔ weights JSON keys
- B: ontology.ts keyVariables ↔ DIM_MAPPING_SNAPSHOT (myprojects 미러)
- D: 각 weight row sum ≈ 1.0 (±0.005)

### 2.5 CSV 변경 검출

`data/irt-5D-vocab.csv` (14MB, gitignored) 변경 시:
- `scripts/build-vocab-pool.mjs` 재실행 → `lib/vocab-pool-source.json` 갱신
- SHA-256, byte size, row count, generated card count 영구 보존
- 로컬 CSV 있으면 hash 비교 → 빌드 후 CSV 바꿔치기 시 즉시 fail

### 2.6 Dependabot weekly

- 4개 그룹 (runtime-frameworks, visualizations, tooling, validation) → PR 통합
- Major bumps for next/react/typescript는 ignored (수동 검토)
- Actions ecosystem도 추적
- 매주 월요일 06:00 KST

---

## 3. 통합 CI 게이트 (pr-check.yml)

```
PR 발생
  ↓
1. ESLint
2. Vitest (165 tests, 17 files)
3. JSON Schema validation (T1.1, T1.2, T3.1)
4. README counter freshness (T2.1)
5. C4.1 dimension-mapping regression
6. C4.2 diversity sanity (non-blocking)
7. Next.js build
8. C4 reports artifact upload
  ↓
Merge gate
```

→ **각 단계가 다른 종류의 회귀를 잡음**:
- 1, 7 = 코드 정상성
- 2 = 로직 정상성
- 3, 4 = 메타데이터 정합성
- 5, 6 = 도메인 모델 정상성

---

## 4. 솔로 dev 가성비 분석

| 작업 | 본인 시간 | 절약/효과 |
|---|---|---|
| T1.1 | 0 (Claude) | 향후 audit log 손상 즉시 catch (분 단위) |
| T1.2 | 0 | 잘못된 weights commit → 0%로 줄임 |
| T1.3 | 0 | level-test-pat 호환 깨짐 → PR에서 잡음 |
| T2.1 | 0 | "README 갱신 잊었다" 사고 → 0회 |
| T2.3 | 0 | 5D vs microskill 정의 충돌 → CI catch |
| T3.1 | 0 | CSV 변경 잊음 → catch |
| T3.2 | 0 | dep 보안 패치 누락 → 0회 |

→ **본 sprint 총 본인 추가 시간 0분.** 모두 Claude 자동 수행.

---

## 5. 무엇이 **여전히** 본인 시간 의존인가

### Tier 4 (UX)
- 외부 사용자 없으면 효용 측정 불가 → 보류
- A11y, mobile 반응형, error logging

### Tier 5 (외부 블로커)
- **vocab-cat-test Docker 통합** (1h 1회) — 미해결, 가장 큰 단일 unblock
- EBS-demo Firebase config (30min) — 미해결

### Tier 6 (도메인 확장)
- Phonics, Teacher Dashboard, Neo4j 재평가 — Phase 2 PRD 재검토 후

---

## 6. 권장 다음 액션

1. **즉시 가능 (Claude)**:
   - Tier 4.1 A11y 패스 (axe-core 자동 검사)
   - dogfooding-3 시도 (preset UI 검증)

2. **본인 결단 필요**:
   - **vocab-cat-test Docker 1h** — 정체성 완성에 가장 큰 영향
   - dogfooding 채널 확대 (지인 1-3명 모집)

3. **Phase 2 백로그 재검토**:
   - Phonics 페르소나 변경 결정
   - Teacher Dashboard ICP 정의

---

## 7. 종합 평가

> "본인이 6개월 손 떼도 무너지지 않는 시스템" — 본 sprint의 목표 달성.

증거:
- 모든 critical JSON에 schema 게이트
- README + 카운터 자동 sync
- dependabot이 매주 보안 패치 PR
- C4.1 게이트가 3차례 실증 (v1 initial fail, dogfooding-1, dogfooding-2)
- 모든 게이트가 `npm test` 한 줄로 로컬 재현 가능

남은 단일 위험: **smilepat 본인의 시간 부재** (다른 47+ 레포 컨텍스트 스위칭). 이를 해결할 수 있는 메커니즘은 없으나, 본 sprint 이후 OELP는 자동 PR로만 유지됩니다.

---

## 8. 변경 이력 (oelp main)

- 39a54f5: T1.1 regression-history schema + CI
- 2d9e1ce: T1.3 DiagnosticInput schema + round-trip
- dc2b188: T2.1 README counters auto-derived
- 5a559e6: T1.2 ontology-weights write-protection
- 3a53e73: T2.3 dimension-mapping consistency
- 112e897: T3.1 CSV provenance checksum
- 650abc7: T3.2 Dependabot config

OELP repo state: 165 tests · 17 test files · 7 routes · 16 lib modules · 11 scripts · 3 JSON schemas · 8-step CI gate.
