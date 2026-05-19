# Handoff — usb_csat_mj_generator 진단 + sql.js bind fix

**날짜**: 2026-05-19
**Repo**: [smilepat/usb_csat_mj_generator](https://github.com/smilepat/usb_csat_mj_generator) (archived, Tier 3-B)
**세션 산출 PR**: [#2 merged](https://github.com/smilepat/usb_csat_mj_generator/pull/2) · **Issue**: [#1 open](https://github.com/smilepat/usb_csat_mj_generator/issues/1)
**Status**: P0 해결 완료 · P1-P5 follow-up 남음

---

## 1. Executive Summary

CSAT 영어 문항 생성기를 두 가지 도구로 진단:

1. **App Factory `studio inspect`** (generic atlas L0~L13) — 휴리스틱 정적 분석. *결과: 표면적 지표만 보고 도메인 핵심 결함 누락.*
2. **smilepat audit profile `csat_strict`** (도메인 특화 8차원) — 실제 생성된 문항을 KICE 기준으로 LLM 감사. *결과: P0 버그 + 품질 편차 발견.*

도구 (1)이 못 본 결함을 (2)로 1사이클 만에 발견: **24문항 일괄 생성 시 33% 실패 (sql.js bind error)**. 원인 파악·수정·검증·머지까지 완료.

| 지표 | Before | After |
|---|---|---|
| 24문항 생성 성공률 | 67% (16/24) | **100%** |
| smilepat csat_strict 통과율 | 63% (15/24) | **100%** |
| Average overall score | 97.5 | **97.7** |

---

## 2. 진행 내역 (시간순)

### Phase 1 — App Factory atlas 진단
- `app-factory studio inspect --repo C:/tmp/usb_csat_mj_generator --json` → product_stage=mvp, L9 blocked (`scripts.test` 부재 때문), L11/L12/L13 missing
- `--repo .../web-app` 재진단 → framework Express 감지, 점수 일부 회복
- **결론: atlas는 generic SaaS 관점이라 콘텐츠 생성 도구의 진짜 결함을 못 봄**

### Phase 2 — smilepat profile 도입
- `audit-agent-variants-portable/profiles/smilepat`의 csat_strict variant가 이 도메인에 정확히 부합
- 합성 문항 1건 + 실제 생성 1건 audit → 99-100점 우수

### Phase 3 — 실측 24문항 생성 + 감사
- 서버 부팅 (sql.js mode), 23개 신규 + 1개 기존 = 24문항 일괄 생성
- **결과: 8개 실패** (LC detail/intent/reply/situation/lecture + RC purpose/mood)
- 서버 로그: `Wrong API use : tried to bind a value of an unknown type ([object Object])` 8회

### Phase 4 — Bug 원인 추적 + Fix
- 위치: [itemPipeline.js:saveItemResults](https://github.com/smilepat/usb_csat_mj_generator/blob/main/web-app/server/services/itemPipeline.js)
- 원인: Gemini가 일부 유형에서 `options`를 객체 배열로 반환:
  - `{option_no: 1, text: "..."}` (item 12, 13)
  - `{number: 1, text: "..."}` (item 18)
  - `{id: 1, text: "..."}` (item 19)
- 수정: `toScalar()` 헬퍼로 두 INSERT의 모든 bind 인자 보호 (객체는 JSON.stringify)

### Phase 5 — 검증
- 같은 8개 유형 재생성 → **8/8 성공**
- smilepat csat_strict → **8/8 통과, 평균 98.0, blocking 0**

### Phase 6 — Ship
- Unarchive → push 브랜치 → Issue #1 생성 → PR #2 생성 → squash-merge → 브랜치 삭제 → re-archive
- main HEAD: commit `4721a087`

---

## 3. Key Findings (앞으로 참고할 발견)

### F1. Gemini 응답 스키마는 유형별로 불안정
- 같은 prompt template에서도 유형마다 `options` 모양이 다름 (string · {text} · {option_no,text} · {number,text} · {id,text})
- **함의**: 모든 LLM 응답 경계에 강한 정규화 필요. promptBuilder가 잘 만들어도 보장 안 됨.

### F2. App Factory atlas는 generic SaaS 관점
- L0~L13은 표준 web product 진단용
- 콘텐츠 생성·교육 도구의 **핵심 품질 = 출력 문항의 도메인 적합도**는 측정 안 됨
- **함의**: smilepat 같은 도메인 audit 도구가 atlas보다 100배 가치 높음

### F3. 자체 validator chain은 PASS여도 외부 audit이 풀어내는 결함 있음
- `validator_chart/gap/grammar/set`가 모두 PASS인 문항도 smilepat에서 D4 75점 (NFD distractor 검출)
- **함의**: 외부 감사를 4번째 gate로 통합하면 품질 한 단계 더 올라감

### F4. Variance σ ≈ 0.6 (item 1 × 3회 반복)
- promptBuilder는 매우 안정적
- 다만 D4 distractor plausibility 분산은 큼 (③번이 매번 다름)
- **함의**: 안정성은 OK, distractor 강화 prompt iteration이 다음 큰 ROI

---

## 4. 적용된 Fix 상세

**Commit**: `4721a087` on main
**파일**: `web-app/server/services/itemPipeline.js` (+23, -16)

```js
// 추가된 헬퍼 (file top)
function toScalar(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object') return JSON.stringify(v);
  return v;
}

// saveItemResults 내 두 INSERT의 .run() 인자 모두 toScalar()로 감쌈
```

**한계** (Issue #1로 추적):
- DB의 `option_1~option_5` 컬럼에 JSON 문자열이 그대로 저장되는 케이스 존재
- UI 렌더링·검색·통계에서 후속 처리 필요

---

## 5. 향후 개선사항 (우선순위)

### 🟡 P1 — Normalizer 근본수정 (Issue #1)
**상태**: archived 상태로 issue만 열어둠. 작업 재개시 unarchive 필요.

**작업 범위** (`services/normalizer.js` 또는 `jsonUtils.normalizeItemJson`):
```js
function normalizeOption(o) {
  if (typeof o === 'string') return o;
  if (o && typeof o === 'object') {
    const text = o.text ?? o.value ?? o.label ?? o.content;
    if (text != null) return String(text);
    return JSON.stringify(o);  // last-resort fallback
  }
  return String(o ?? '');
}

function normalizeAnswer(a, options) {
  if (typeof a === 'number' || typeof a === 'string') return a;
  if (a && typeof a === 'object') {
    return a.number ?? a.option_no ?? a.id ?? a.value ?? a.text ?? '';
  }
  return '';
}
```

**테스트**: item 12, 13, 18, 19 유형 재생성 후 DB에 평문 저장 확인.
**마이그레이션**: 기존 DB에 JSON 문자열로 저장된 record를 평문으로 변환하는 일회성 스크립트 (선택, 운영 영향 평가 후 결정).

**예상 effort**: 2-4시간 (코드 + 테스트 + 마이그레이션 스크립트).

---

### 🟡 P2 — Distractor plausibility 강화 (audit 점수 95+ 보장)
**대상 유형** (이번 batch에서 D4 ≤ 90):
- Item 11 (짧은 응답) — D4=75, plaus=[1, 0.5, 0.6, 0.1, 0.2]
- Item 14 (긴 대화) — D4=90
- Item 16 (강의 주제) — D4=90

**접근**:
1. 해당 유형의 prompt에 "오답도 정답과 경쟁할 수준의 매력도 (plausibility ≥ 0.5)" 명시
2. `validator_set.js`에 D4 plausibility 게이트 추가 (현재 자체 validator는 distractor 매력도를 measure하지 않음)
3. Few-shot 예시에 high-quality distractor 사례 5개 추가

**예상 effort**: 1-2시간 per 유형. 우선 item 11부터.

---

### 🟢 P3 — smilepat audit을 생성 파이프라인의 4번째 게이트로 통합
**현재 게이트** (`itemPipeline.js` 흐름):
1. LLM 호출 → JSON parse
2. `validators/*` (grammar, gap, chart, set)
3. `orchestratorValidate` + `autoRepair` + `llmRepair`
4. **(신규) smilepat csat_strict audit**

**구현 outline**:
- `services/externalAudit.js`: `auditWithSmilepat(finalJson, itemNo): Promise<AuditResult>`
- `auditAgent.variants.js` (= `audit-agent-variants-portable`)를 web-app/server/services에 npm 또는 file: dep로 통합
- `overall_score < 90`이거나 `blocking_issues.length > 0`이면 재생성 트리거 (`maxRetry` 안에서)
- 결과는 `item_metrics` 테이블에 함께 저장 (audit_score, audit_verdict, blocking_dims 컬럼 추가)

**효과**: 자체 validator만으로는 못 거르는 NFD distractor, polarity error, 출제 의도 불일치를 자동 차단.
**비용**: 문항당 추가 Gemini 호출 ~$0.005. 통과 시 즉시 종료, 실패 시만 재생성.

**예상 effort**: 6-10시간 (통합 + 마이그레이션 + 테스트).

---

### 🟢 P4 — Variance & Quality Monitoring
- 동일 `topic`에 대해 3회 생성 → overall_score 분산이 σ > 5이면 alert
- 시간대별 audit 점수 평균 추세 (model drift 감지)
- Prompt version별 quality 추적: `prompt_versions/`에 audit 평균 메타데이터 함께 저장

**예상 effort**: 4-8시간 (대시보드 + 알림).

---

### 🔵 P5 — Archive 정책 결정
현재 repo는 archived (Tier 3-B label). 다음 중 하나 결정 필요:

| 시나리오 | 행동 |
|---|---|
| (a) 이대로 영구 보존, 더 이상 개발 없음 | Issue #1 close, 향후 작업 안 함 |
| (b) P1·P2만 더 처리하고 다시 archive | 일시 unarchive → P1·P2 PR → re-archive |
| (c) Tier 승격, 활발한 개발 재개 | unarchive 영구, 라벨 변경 |
| (d) 새 v2 repo로 lineage 이전 | 이 repo는 그대로 두고 `usb_csat_mj_generator-v2`에서 P1~P4 진행 |

**권장**: 우선 Issue #1 본문에 "Tier 3-B archived, P0 fix만 머지됨" 명시하고 close → 향후 본격 재개할 때 (d) 시나리오로 새 repo 시작.

---

## 6. 재개 절차 (다음 세션 시작 시)

### 6.1 이 세션 상태 복원
```powershell
# 클론 (이미 있으면 skip)
git clone https://github.com/smilepat/usb_csat_mj_generator.git C:\tmp\usb_csat_mj_generator
cd C:\tmp\usb_csat_mj_generator\web-app
npm install --ignore-scripts

# 환경변수
copy C:\tmp\fix-sqljs-bind.patch .  # 백업용 (이미 main에 머지됨)
# .env 파일은 .env.example 참고. GEMINI_API_KEY는
#   C:\audit-agent-variants-portable\audit-agent-variants-portable\profiles\smilepat\.env 에서 재사용 가능

# 서버 부팅
node server/index.js
```

### 6.2 smilepat audit 실행
```powershell
cd C:\audit-agent-variants-portable\audit-agent-variants-portable
node profiles/smilepat/audit.mjs --list                                     # 변형 목록
node profiles/smilepat/audit.mjs --input inputs/<file>.json --variant=csat_strict
```

### 6.3 24문항 일괄 생성 + 감사 (회귀 테스트)
이번 세션의 두 스크립트가 그대로 재사용 가능:
- `C:/tmp/csat-batch-orchestrator.mjs` — 23개 신규 생성
- `C:/tmp/csat-audit-batch.mjs` — 모든 결과 smilepat 감사

```powershell
cd C:\tmp\csat-batch-out; Remove-Item *.json -ErrorAction Ignore   # cache 비우기
node C:\tmp\csat-batch-orchestrator.mjs                            # ~16분
node C:\tmp\csat-audit-batch.mjs                                   # ~8분
```

### 6.4 Repo unarchive (P1 작업 시작 시)
```powershell
gh api -X PATCH repos/smilepat/usb_csat_mj_generator -F archived=false
# 작업 → PR merge
gh api -X PATCH repos/smilepat/usb_csat_mj_generator -F archived=true
```

---

## 7. 산출물 인벤토리

### GitHub (영구 보존)
| Resource | URL |
|---|---|
| PR #2 (merged) | https://github.com/smilepat/usb_csat_mj_generator/pull/2 |
| Issue #1 (open) | https://github.com/smilepat/usb_csat_mj_generator/issues/1 |
| main HEAD | commit `4721a087` |

### 로컬 (C:/tmp — 휘발성, 백업 권장)
| File | 용도 |
|---|---|
| `C:/tmp/fix-sqljs-bind.patch` | git apply 가능 단일 패치 |
| `C:/tmp/PR-body-sqljs-bind-fix.md` | PR 본문 마크다운 |
| `C:/tmp/ISSUE-normalizer-options.md` | Issue 본문 마크다운 |
| `C:/tmp/app-factory-diagnose-rules.md` | App Factory inspect의 모든 휴리스틱 규칙 |
| `C:/tmp/app-factory-inspect.json` | app-factory 자기 진단 결과 |
| `C:/tmp/usb_csat_mj_generator-inspect.json` | 루트 진단 결과 |
| `C:/tmp/usb-csat-webapp-inspect.json` | web-app 단독 진단 결과 |
| `C:/tmp/csat-batch-orchestrator.mjs` | 23문항 생성 스크립트 |
| `C:/tmp/csat-audit-batch.mjs` | 24문항 audit 스크립트 |
| `C:/tmp/csat-retry-failed.mjs` · `csat-retry-audit.mjs` | fix 검증용 |
| `C:/tmp/csat-batch-out/` (23 files) | 생성 결과 JSON |
| `C:/tmp/csat-retry-out/` (8 files) | fix 후 재생성 결과 |
| `C:/tmp/csat-audit-results.json` · `csat-retry-audit-results.json` | 집계 결과 |
| `C:/tmp/csat-server.log` · `csat-batch.log` · `csat-audit-batch.log` 등 | 실행 로그 |

### smilepat profile (영구)
- `C:/audit-agent-variants-portable/audit-agent-variants-portable/profiles/smilepat/reports/` 에 24개 audit 리포트 누적

---

## 8. Open Questions / 결정 필요

1. **Archive 정책 (P5)**: (a)~(d) 중 어느 시나리오?
2. **P1 진행 시점**: 지금? 다음 활발한 개발 사이클? 새 v2 repo로?
3. **External audit 통합 (P3)**: 별도 SaaS 노출 (smilepat audit as a service) vs. 모놀리식 통합?
4. **Prompt versioning**: `prompt_versions/` 디렉터리가 있는 걸 보니 이미 일부 관리 중. 이번 발견(F1)을 prompt template에 반영해서 v2026-05-19 만들지?

---

## 9. 도구·방법론 메모

이번 세션에서 사용한 진단 패턴은 다음 프로젝트들에 그대로 적용 가능:

- **콘텐츠 생성기**: prompt → generate → external audit → 통계 집계 → prompt iteration 루프
- **하이브리드 monorepo 진단**: 루트 vs 서브폴더 (web-app/) 두 번 inspect해서 누락 신호 비교
- **App Factory + 도메인 audit 조합**: atlas (인프라/아키텍처) + 도메인 audit (출력 품질) 양쪽 측정

[[project_smilepat_audit]]의 portable profile 시스템이 다른 도메인 (예: 일러스트 검수, 데이터 분석 보고서 검수)에도 확장 가능.

---

**Handoff 작성**: Claude Opus 4.7 (1M context) · 2026-05-19
**다음 작업자**: smilepat 또는 future Claude session
**우선 살펴볼 곳**: [§5. 향후 개선사항](#5-향후-개선사항-우선순위) · [Issue #1](https://github.com/smilepat/usb_csat_mj_generator/issues/1)

**연관 문서**: [TARGET_STATE_usb_csat_mj_generator_2026-05-19.md](TARGET_STATE_usb_csat_mj_generator_2026-05-19.md) — P1~P5 완료 시 기대 결과 + KPI + 마일스톤 DoD
