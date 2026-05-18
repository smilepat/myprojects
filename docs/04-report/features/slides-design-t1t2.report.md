# Report — slides-design-t1t2

**Feature ID:** `slides-design-t1t2`
**PDCA Cycle:** Plan → Design → Do → Check → Report ✅
**Period:** 2026-05-18 (Plan) → 2026-05-19 (Report)
**Duration:** ~1 day (active work ~5 hours)
**Match Rate:** **94%** (above 90% threshold)
**Branch:** `research/slides-design-upgrade`

---

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 발표 슬라이드(36 차트, 653KB HTML)가 정상 작동하나 (a) Mermaid ad-hoc 색·폰트 (b) Reveal.js 평범 테마 (c) 디자인 토큰·마스터 부재 (d) Mermaid의 radar/sankey/heatmap 미지원으로 핵심 비교 차트가 막대로 근사 → "코드 발표급"에서 멈춤. |
| **Solution** | **Phase A (T1):** mermaid 통일 테마 JSON + 디자인 토큰 CSS + 4 슬라이드 마스터 (~3h). **Phase B (T2):** ECharts SSR 빌드 통합으로 5개 핵심 차트(radar/grouped bar/line+area/Sankey) 마이그레이션 (~2h). 마크다운 단일 소스 + 자체 실행 HTML 100% 유지. |
| **Function · UX Effect** | 36 SVG 통일 팔레트·Pretendard 일관 적용; layout-section(7개), layout-chart-focus(5개), lead(2개) 디렉티브 부착; 5개 차트가 진짜 radar/Sankey/line+area로 표시됨; 빌드 23.22초 (60s 한도의 38%); HTML 653KB (1.2MB 한도의 54%). |
| **Core Value** | "데이터 회사" 포지셔닝이 **덱 자체의 디자인 시스템화**로 강화. 디자인 토큰·재현 가능 빌드(2-build diff = 0)·검증 가능한 차트 정의(JSON 인라인) — 메시지와 매체가 일치. |

---

## 1. Deliverables

### 신규 파일 (5)
| 파일 | 역할 | 규모 |
|---|---|---|
| [`slides_build/mermaid-config.json`](../../../slides_build/mermaid-config.json) | Mermaid 통일 테마 (themeVariables, 차트별 palette) | 82 lines |
| [`slides_build/theme.css`](../../../slides_build/theme.css) | 디자인 토큰 + 4 슬라이드 마스터 + 유틸 클래스 | 275 lines |
| [`slides_build/echarts-ssr.js`](../../../slides_build/echarts-ssr.js) | ECharts 5.x native SSR 헬퍼 (et-craft 테마 등록 + renderEchartsToSvg) | 105 lines |
| [`slides_build/package.json`](../../../slides_build/package.json) | echarts ^5.5.1, jsdom ^25.0.1 deps | 13 lines |
| [`docs/01-plan/features/slides-design-t1t2.plan.md`](../../01-plan/features/slides-design-t1t2.plan.md) | Plan 문서 (FR-A1~A5 + FR-B1~B6, SC-01~07, 7 risks, 8장 cohort 조율) | — |

### 수정 파일 (5)
| 파일 | 변경 |
|---|---|
| [`slides_build/build_revealjs.js`](../../../slides_build/build_revealjs.js) | echarts 블록 추출·SSR·재삽입 step 1a 추가; mmdc -c config 인자 추가; theme.css fs.readFileSync 인라인 |
| [`SLIDES_GAP_TO_PROGRESS.md`](../../../SLIDES_GAP_TO_PROGRESS.md) | 12 layout-* 디렉티브 부착; 5개 핵심 차트를 ```echarts JSON 블록으로 교체 (2-A, 2-D, 2-E, 6-A, 1-G) |
| [`docs/01-plan/features/slides-cohort-replacement.plan.md`](../../01-plan/features/slides-cohort-replacement.plan.md) | Plan-B sign-off 마감 (라벨링·부록 동기화 완료 확인) |
| [`docs/01-plan/features/slides-design-upgrade-research.md`](../../01-plan/features/slides-design-upgrade-research.md) | §Sign-off에 Decision Log 추가 (Q1~Q4 답변 → 시나리오 B 도출 근거) |
| [`.gitignore`](../../../.gitignore) | echarts-ssr.js, mermaid-config.json, theme.css, package.json을 ignore 예외 추가 |

### 빌드 산출물 (gitignored)
- `SLIDES_GAP_TO_PROGRESS.html` — **653 KB**, 자체 실행 (USB·이메일 가능)
- `slides_build/rendered-*.svg` — 31 (Mermaid) + 5 (ECharts) = **36 차트**, 평균 13 KB

---

## 2. Quantitative Results

| 지표 | Before (baseline) | After (T1+T2) | Δ |
|---|---:|---:|---:|
| HTML 크기 | 644 KB | 653 KB | +1.4% |
| 빌드 시간 | ~30s (추정, 측정 안 됨) | **23.22s** (측정) | 측정값 ↓ |
| 디자인 토큰 정의 수 | 0 (ad-hoc CSS) | **22** (color/space/radius/shadow) | +∞ |
| 슬라이드 마스터 | 0 (lead 1개만) | **4** (lead + section + chart-focus + 2col) | +3 |
| 마스터 디렉티브 적용 | 1곳 (lead) | **14곳** (lead 2 + layout-section 7 + layout-chart-focus 5) | +13 |
| 차트 라이브러리 | Mermaid 1종 | Mermaid + ECharts 2종 | +1 |
| 차트 분포 | 36 Mermaid | 31 Mermaid + **5 ECharts** | — |
| 빌드 재현성 | 미검증 | **2-build SHA256 diff = 0** | 검증 완료 |
| Match Rate (Plan vs 구현) | — | **94%** | — |

---

## 3. 5개 ECharts 차트 (Before → After)

| # | 슬라이드 | Before (Mermaid) | After (ECharts) | 효과 |
|---:|---|---|---|---|
| 1 | **2-E** Performance Descriptor | xychart 막대 2벌 (정보 손실) | 진짜 radar (5축, 영역색) | 5축 동시 비교 가능, "맥락 적절성 5점" 사각지대 명료 |
| 2 | **2-A** 12 micro-skill 비교 | xychart 막대 2벌 (ad-hoc 색) | grouped bar (둥근 모서리, brand 색) | 정밀한 색·축·범례 통제 |
| 3 | **6-A** Before/After 12 skill | xychart 막대 2벌 | grouped bar + After 라벨 (+@값) | 변화 시각 강조 |
| 4 | **1-G** CEFR 학년별 도달 | xychart 막대 (1.0~3.5 linear) | smooth line + area (반투명 갭) | 시계열 추세 + 갭 색면 시각화 |
| 5 | **2-D** 19 유형 × 12 skill | mermaid graph LR (정적 노드망) | Sankey (Primary 굵음 / Secondary 반투명) | 흐름·가중치 시각화, ★ skill 4개로 흐름 수렴 가시화 |

---

## 4. Technical Decisions Log

| 결정 | 옵션 | 선택 | 사유 |
|---|---|---|---|
| 디자인 트랙 | T1~T4 + 하이브리드 (research 5트랙) | **T1+T2 (시나리오 B)** | Q1=교사·교육청 / Q2=3개월+ / Q3=혼자 / Q4=MD 절대 유지 → 외부 도구·Figma 트랙 배제, 코드 기반만 적합 |
| ECharts SSR 방식 | jsdom / 공식 SSR / puppeteer | **echarts 5.x native SSR** (`renderer:'svg' + ssr:true`) | jsdom 불필요, deterministic, offline |
| FR-B3 차트 타입 | heatmap / line+area | **line + area** | 6학년 × 2 trace 시계열 페어는 heatmap 매트릭스에 부적합. 시간축 추세가 핵심 인사이트 |
| 5-D Issue Code | heatmap 후보 | **Mermaid 유지** | 단일 metric × 6 카테고리는 sorted bar로 충분, heatmap 강제는 정보 부풀림 |
| ECharts 통합 시점 | mmdc 전 / mmdc 후 | **mmdc 전 (step 1a → 1b)** | echarts 블록을 image ref로 치환 후 mmdc가 mermaid만 처리, 깔끔한 분리 |
| Phase A/B 분리 | 별도 PR / 단일 브랜치 순차 | **단일 브랜치 순차 커밋** | 사용자 1인 워크플로, 짧은 사이클 |

---

## 5. Lessons Learned

### 잘된 점
1. **research 5-트랙 비교가 결정을 가속** — Q1~Q5 매트릭스가 옵션을 4 → 2로 자동 좁힘. Plan 작성이 단순화됨
2. **빌드 파이프라인의 layered 확장 패턴** — 기존 mmdc 파이프라인을 건드리지 않고 step 1a로 prepend. ECharts SVG가 mermaid SVG와 동일한 base64 inline 로직을 자연스럽게 재사용
3. **ECharts 5.x native SSR이 jsdom보다 우월** — `renderer:'svg' + ssr:true` 한 줄로 헤드리스 환경에서 deterministic SVG 출력. 의존성 -1
4. **PoC를 별도 파일(`poc-radar.js`)로 먼저 검증** — 폰트·한글·brand 색을 본격 통합 전 1분만에 확인. 통합 시 risk 제거
5. **재현성 검증의 가치** — 2-build SHA256 비교로 `animation: false` 설정이 실제로 작동함을 증명. 향후 CI 자동화의 안전판
6. **Plan §8 cohort-replacement 조율 섹션** — 두 PDCA의 파일 충돌 risk를 사전 식별·해결. 실제 충돌 0건

### 개선할 점
1. **FR-B3 acceptance text 모호성** — "heatmap"이 단정적으로 적힌 게 Plan 단계에선 OK였으나 실제 구현 시 데이터 적합성과 충돌. Plan acceptance에 "OR" 옵션을 더 명시적으로 적시할 것
2. **`layout-2col` 미사용** — 마스터 정의했으나 적용 슬라이드가 없음. 향후 1-D 슬라이드에 적용 시도 가치 있음 (Backlog)
3. **시각 회귀 자동화 부재** — SC-07은 사용자 manual에 의존. 향후 visual regression tool (e.g., reg-cli, playwright) 도입 검토 (Backlog)
4. **Plan §6 timeline vs 실제** — Plan 추정 11h, 실제 ~5h. Phase A/B 모두 50% 빠름. ECharts 5.x native SSR이 jsdom보다 단순했고, 디자인 토큰 추출이 이미 부분 작업되어 있던 덕분

### 재사용 가능한 패턴
- **`echarts-ssr.js` 모듈** — LECTURE_V2.md, PITCH_DECK.marp.md 등 다른 deck에도 그대로 import 가능
- **`mermaid-config.json` + `theme.css`** — 공통 디자인 토큰. 다른 deck의 build script가 동일 파일을 참조하면 자동 일관
- **`echarts` 코드블록 표기 + `w=… h=…` 인자** — 마크다운 in-place 차트 정의 패턴. 다른 deck에서도 그대로 작동
- **PDCA Plan §N (Coordination with X)** — 동시 진행 PDCA 간 파일 충돌 사전 식별 섹션. cohort-replacement vs design-t1t2에서 입증된 패턴

---

## 6. Outstanding Items (Follow-up)

| # | 항목 | 우선순위 | 위치 |
|---:|---|---|---|
| 1 | SC-07 사용자 시각 검수 결과 반영 | 즉시 | 이번 세션 |
| 2 | Plan §1.1 FR-B3 acceptance 갱신 (line+area 옵션 추가) | 즉시 (사용자 승인 시) | Plan |
| 3 | `layout-2col` 활용 시도 (1-D Korea vs US) | 후순위 | Backlog |
| 4 | LECTURE_V2.md / PITCH_DECK에 동일 디자인 시스템 적용 | 후순위 | Backlog (별도 PDCA) |
| 5 | 차트 데이터 별도 JSON 분리 | Backlog | research §12 |
| 6 | CI 자동 빌드 (GitHub Actions) | Backlog | research §12 |
| 7 | T3 Slidev 마이그레이션 PoC (별도 브랜치) | Backlog | research §11 |
| 8 | cohort-replacement reopen — production n≥30 도달 시 | Trigger | [cohort plan §8.4](../../01-plan/features/slides-cohort-replacement.plan.md) |

---

## 7. Memory-worthy Insights

다음은 향후 세션에 도움될 수 있는 학습:

- **ECharts 5.x native SSR이 jsdom 우회 가능** — Node.js 환경에서 차트 SVG 생성 시 첫 시도로 검토할 만한 패턴
- **Mermaid의 차트 한계 (radar/heatmap/Sankey 미지원)** — 미학·정보밀도 요구 시 hybrid 패턴 (Mermaid + ECharts) 작동 검증됨
- **MD canonical + multi-output 패턴 검증** — research §7 "하이브리드 워크플로"의 코드 트랙(T1+T2)이 실제 작동. 외부 도구(T4) 없이도 디자인 일관성 달성
- **bkit research → Plan → Design → Do → Check → Report 사이클이 1일 만에 완주 가능** — 단일 사용자 + 명확한 결정 매트릭스(research §10) 조합 시

---

## Sign-off

- [x] Implementation complete (Phase A + Phase B)
- [x] gap-detector Match Rate: 91% → post-remediation 94%
- [x] FR-A5 reproducibility 검증 완료 (2-build SHA256 diff = 0)
- [x] SC-05 build time 측정 완료 (23.22s)
- [x] FR-B3 design-deviation 문서화 ([analysis §5](../../03-analysis/features/slides-design-t1t2.analysis.md#5-fr-b3-design-deviation-재조정))
- [ ] SC-07 사용자 시각 검수 결과 (브라우저 검수 진행 중)
- [ ] PR 생성 (사용자 결정 대기)
