# myprojects — Claude Code 작업 가이드

> Last updated: 2026-05-23 (OELP v3 sprint 종료 시점)
> Maintainer: smilepat (solo)
> Sibling repos: smilepat/oelp · smilepat/vocab-cat-test · smilepat/vocab-learn-pat · smilepat/vocabulary-db · smilepat/csat-graphdb-318 · smilepat/csat-text-master · smilepat/EBS-demo · smilepat/illustration-studio · smilepat/reading-roadmap (archived) · smilepat/usb_csat_mj_generator

## 1. 이 레포가 뭔가

**LogicFlow EdTech 생태계의 docs hub.** 코드 없음 (md만). 47+ 레포에 흩어진 학습 플랫폼 구성 요소들의 PRD, 설계, 분석, 보고서 중앙화.

핵심 레포 OELP의 작업 기준 문서가 모두 여기. PRD §B-3 데이터모델, dimension-mapping, phase 백로그, dogfooding 분석, 통합 회고 등.

## 2. 디렉토리 구조

```
docs/
├── INDEX.md          # auto-generated docs index (run: scripts/build-docs-index.mjs)
├── 01-plan/          # PRD (Phase 1 + 2) + dimension-mapping + analytics-events + 백로그 (6 files)
├── 02-design/        # P-1 v2/W9 / P-1.5 Bridge / P-2 Foundation (4 files)
├── 03-analysis/      # C4.1, dogfooding 4 cycles, vocab-cat-test runbooks (resolved + Cloud Run),
│                     # vercel-deployment, p7-neo4j-spike, d5-bias-root-cause,
│                     # stage-c-activation-sim, exploration-policy-long-run (17 files)
└── 04-report/        # W12 평가, P-1 W1-W8, stability v1/v2,
                      # oelp-integrated-summary v3, Phase 2 chunk-end template (14 files)
```

전체 색인: [`docs/INDEX.md`](./docs/INDEX.md). CI 검증: `scripts/build-docs-index.mjs --check` (.github/workflows/docs-check.yml).

## 3. 자주 갱신되는 문서 (drift 주의)

| 파일 | 갱신 트리거 |
|---|---|
| `docs/04-report/oelp-integrated-summary.md` | OELP major sprint 종료 시 (v1 → v2 → v3 패턴) |
| `docs/03-analysis/dogfooding-pass-*.md` | C4.1 게이트 신규 발동 시 자동 생성 |
| `docs/01-plan/phase2-backlog-v2.md` | 학습자 채널 / 외부 dep 상태 변경 시 |
| `docs/04-report/phase1-w12-c-criteria-evaluation.md` | C 기준 measured PASS 승격 시 |

## 4. OELP 측 자동 동기화

`smilepat/oelp` 의 tests/dimension-mapping-consistency.test.ts 안에 `DIM_MAPPING_SNAPSHOT` 상수가 본 레포 `docs/01-plan/dimension-mapping.md §1.2` 표의 동결 복사본. 본 문서 변경 시 OELP 측 snapshot도 같은 PR에서 갱신 — 단, 본 레포는 OELP CI에서 직접 fetch 불가하므로 **수동 동기화 약속**이다.

## 5. dogfooding cycle 누적 (2026-05-24 기준)

5 cycle: C4.1 게이트 3건 + sampling 2건. 모두 다른 종류 모순 또는 다른 측정 축:

| Cycle | 종류 | 차원/축 | 결과 | report |
|---|---|---|---|---|
| Pass-1 | C4.1 | D2_Meaning | over-declared → rollback | `dogfooding-pass-1.md` |
| Pass-2 | C4.1 | D3_Context | under-declared → rollback | `dogfooding-pass-2.md` |
| Pass-3 | C4.1 | D5_Usage | over-declared (2건) → rollback | `dogfooding-pass-3.md` |
| Pass-4 | sampling | exploration target | starved 6→0, balance 0→0.05 | `dogfooding-pass-4.md` |
| Pass-5 | sampling | adaptive frequency | balance 0→0.095 (50 sess), → 0.030 (500 sess) | + [`exploration-policy-long-run-analysis.md`](./docs/03-analysis/exploration-policy-long-run-analysis.md) |

OELP `/regression-history` 페이지에서 6 events 시각화 (3 pass + 3 fail).

### D5 모순 정정 (2026-05-23)
초기 가설 "simulator D5 모델 약함"은 정량 검증으로 부정. 진짜 원인: 7개 QT의 D5 derived = 0 인데 prior declared ≈ 0.10 borderline → **게이트의 의도된 sensitivity 동작**. Phase 2 PRD §5 R3 정정.

## 6. Phase 2 백로그 두 버전 공존

- `01-plan/phase2-backlog.md` (v1, 2026-05-22) — 학습자 채널 가정 (deprecated 아닌 보존)
- `01-plan/phase2-backlog-v2.md` (v2, 2026-05-23) — 솔로 환경 재분류 (Stage A/B/C/D)

학습자 채널 ≥ 1명 확보 시 v1 부활. 그 전까지 v2 우선.

## 7. 작업 시 권장 패턴

### 7.1 새 dogfooding cycle 보고서 추가
- `docs/03-analysis/dogfooding-pass-{N}.md` 생성
- OELP 측 `lib/regression-history.json` 도 동시 갱신 (auto-append via promote-weights.mjs)
- 통합 회고 oelp-integrated-summary.md 의 §13~ 또는 §14~ 에 한 줄 추가

### 7.2 PRD 변경
- 본 레포에서 변경 → commit
- OELP CLAUDE.md §8 "자주 참조하는 docs" 표 갱신 (변경 사실 기록만)
- Sprint 종료 시 oelp-integrated-summary 도 갱신

### 7.3 신규 runbook 추가 (외부 통합)
- 본인이 1회 수행할 작업의 단계별 가이드
- `docs/03-analysis/<name>-runbook.md` 형식
- 본인 완료 시 본 문서 promote → `<name>-resolved.md`

## 8. 잘못 쓰는 패턴 (피하기)

- ❌ OELP repo 내부에 design doc 작성 (코드 레포에는 CLAUDE.md / README만)
- ❌ phase2-backlog.md 직접 편집 (학습자 채널 가정 보존용) — v2 쓰기
- ❌ markdown 표를 Excel/HTML로 변환 (CI lint warning 발생; 다 무시 가능하지만 노이즈)
- ❌ Korean character가 들어가는 commit message에 PowerShell `Out-File` 사용 (BOM 추가) — git CLI나 heredoc 사용

## 9. 사이즈 / 정리

- 25+ markdown files / ~250KB total
- 모두 텍스트 — git lfs 불필요
- 외부 학습자 데이터 (csv 등)는 본 레포 X. vocabulary-db / csat-text-master 별도 레포
- 영상/이미지 자료는 본 레포 X. 별도 매체

## 10. Sibling repos 관계 요약

```
                    smilepat/myprojects (docs)
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
        smilepat/oelp   vocab-cat-test    vocab-learn-pat
        (Next.js 16 +   (FastAPI +        (Production
         Vercel)        IRT CAT)          dogfooding precursor)
              │               │                │
              ▼               ▼                ▼
        vocabulary-db   csat-text-master   csat-graphdb-318
        (private)       (50 지문)         (565 문항 + 그래프)
```

OELP가 hub. myprojects는 OELP의 docs.

## 11. 잔여 본인 결정 (2026-05-23 v3 종료 시점)

1. ☐ Cloud Run vocab-cat-test 배포 (30분, [runbook](docs/03-analysis/vocab-cat-test-cloudrun-runbook.md))
2. ☐ EBS-demo Firebase config (30분)
3. ☐ vocab-cat-test PR #2 merge (CORS 1줄)
4. ☐ 학습자 채널 ≥ 1명 확보 → phase2-backlog-v2 Stage C 활성화
5. ☐ Vercel 배포 URL을 본 문서 + OELP README + integrated summary에 기록

## 12. 변경 이력

- 2026-05-23: 본 CLAUDE.md 초기 작성 (OELP v3 sprint 결과 반영)
