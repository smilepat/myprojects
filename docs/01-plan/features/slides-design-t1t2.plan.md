# Plan — slides-design-t1t2

**Feature ID:** `slides-design-t1t2`
**Created:** 2026-05-18
**Author:** smilepat
**Phase:** Plan
**Related Files:**
- [SLIDES_GAP_TO_PROGRESS.md](../../../SLIDES_GAP_TO_PROGRESS.md) (대상 deck)
- [slides_build/build_revealjs.js](../../../slides_build/build_revealjs.js) (현 빌드 파이프라인)
- [slides-design-upgrade-research.md](slides-design-upgrade-research.md) (5-track 비교 + 결정 로그)
- [slides-cohort-replacement.plan.md](slides-cohort-replacement.plan.md) (병행 PDCA, 데이터 트랙)

---

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 현재 deck은 36개 차트가 정상 렌더링되나 (a) Mermaid 기본 테마라 색상·타이포가 ad-hoc (b) Reveal.js `white` 기본 테마 (c) 슬라이드 마스터·디자인 토큰 없음 (d) Mermaid가 radar/heatmap/sankey 미지원이라 핵심 비교 차트들이 막대로 근사. 결과: "코드 발표급"에서 멈춤. |
| **Solution** | **Phase A (T1):** mmdc themeVariables JSON + Reveal.js 디자인 토큰 CSS + 슬라이드 마스터 4종 정의 (~4h). **Phase B (T2):** ECharts SSR 빌드 통합으로 5개 핵심 차트(2-E radar, 1-G heatmap, 2-D sankey 후보, 2-A·6-A 막대 정밀화) 마이그레이션 (~6h). 마크다운 단일 소스 유지, 빌드 파이프라인만 확장. |
| **Function · UX Effect** | 현재 SVG 인라인 패턴 100% 유지 → 산출물 형태(자체 실행 HTML) 그대로. 시각 일관성 +30% (T1) + 데이터 미학 +25% (T2) 누적 추정 +55%. 교사·교육청 30분+ 강연에서 정보 hierarchy·브랜드 톤 일관됨. |
| **Core Value** | "데이터 회사" 포지셔닝이 *덱 자체의 디자인 시스템화*로 강화됨. 슬라이드 5("계량화된 학습 경험")의 메시지가 *덱의 빌드 파이프라인*에서도 증명됨 — 디자인 토큰, 마스터, 검증 가능한 빌드. |

---

## Context Anchor

| Key | Value |
|---|---|
| **WHY** | 교사·교육청(B2B/B2G) 청중은 30분+ 강연에서 정보밀도와 구조 일관성에 민감. 현 deck은 메시지·데이터는 강하나 시각 hierarchy·브랜드 톤이 약함 → 신뢰감 손실. |
| **WHO** | 1차: 교사·교육청 발표 (smilepat 본인) · 2차: 동료 개발자 리뷰(GitHub PR) · 3차: 향후 deck 유지보수자 |
| **RISK** | (a) ECharts SSR이 Pretendard 한국어 폰트를 정확히 임베드하는지 사전 검증 필요 (b) mmdc themeVariables 일부 차트 타입(xychart)에서 적용 범위 제한 가능성 (c) 디자인 트랙에 시간 쏟다 콘텐츠 작업(cohort-replacement 등) 지연 |
| **SUCCESS** | T1 완료 시 36개 차트가 일관 팔레트·폰트로 렌더링, slide-master 4종이 마크다운 `<!-- .slide: class="..." -->` 디렉티브로 적용 가능. T2 완료 시 5개 핵심 차트가 ECharts로 교체되어 radar/heatmap/sankey가 진짜 형태로 표시. 빌드 산출물 1개 HTML 자기완결성 유지. |
| **SCOPE** | `slides_build/`의 빌드 파이프라인 확장, `SLIDES_GAP_TO_PROGRESS.md`의 ① 마스터 디렉티브 부착 ② 5개 차트 블록을 ` ```echarts`로 교체. **제외:** 새 슬라이드 추가, 콘텐츠/메시지 변경, LECTURE_V2.md·PITCH_DECK 동시 수정, Slidev 마이그레이션. |

---

## 1. Requirements

### 1.1 Functional Requirements

#### Phase A (T1 — Same Stack Upgrade)

| ID | Requirement | Acceptance |
|---|---|---|
| FR-A1 | `slides_build/mermaid-config.json` 생성 — theme=base, themeVariables(색·폰트), xyChart/flowchart 옵션 | mmdc 호출에 `-c mermaid-config.json` 추가됨, 모든 36 SVG가 통일 팔레트로 재렌더링 |
| FR-A2 | `slides_build/theme.css` 생성 — 디자인 토큰 (color/space/radius/shadow), Reveal.js 변수 오버라이드 | build_revealjs.js의 인라인 `<style>` 블록이 이 파일을 import 또는 fs.readFile로 inline |
| FR-A3 | 슬라이드 마스터 4종 정의 — `.layout-cover`, `.layout-section`, `.layout-chart-focus`, `.layout-2col` | theme.css에 각 클래스 CSS 정의 + SLIDES_GAP_TO_PROGRESS.md 주요 슬라이드 ≥6개에 디렉티브 부착 |
| FR-A4 | Pretendard 폰트가 모든 차트 SVG에 정확히 적용 | mmdc themeVariables.fontFamily 설정 + SVG 검사로 font-family 확인 |
| FR-A5 | 빌드 재현성 — 동일 src.md에서 동일 SVG 산출 (난수 시드 없음) | 빌드 2회 연속 실행 후 rendered-*.svg diff 없음 |

#### Phase B (T2 — ECharts Partial Migration)

| ID | Requirement | Acceptance |
|---|---|---|
| FR-B1 | build_revealjs.js에 ` ```echarts` 코드블록 추출 → ECharts SSR → SVG 인라인 로직 추가 | mmdc 처리 전/후로 echarts 블록 별도 처리, 결과 SVG가 base64 인라인됨 |
| FR-B2 | 2-E (Performance Descriptor 5축)를 진짜 **radar 차트**로 교체 | Mermaid xychart 막대 2벌 → ECharts radar series 2벌 |
| FR-B3 | 1-G (학년별 CEFR 도달 갭) 또는 5-D (Issue Code 6 카테고리)를 **heatmap**으로 교체 | Mermaid 막대 → ECharts heatmap (둘 중 더 효과적인 1개 선택, Design 단계 결정) |
| FR-B4 | 2-D (19 유형 × 12 skill 매핑)를 **Sankey 또는 Chord**로 교체 | 현재 graph LR 노드망 → 정보밀도가 더 높은 형태 (단, Mermaid graph 유지 옵션도 비교) |
| FR-B5 | 2-A, 6-A (12 skill 비교 막대)를 ECharts grouped bar로 정밀화 | 색상·범례·축 라벨이 디자인 토큰과 일치, 호버 시 값 표시 (HTML export에서도 작동) |
| FR-B6 | Pretendard 폰트가 ECharts SVG에도 임베드되거나 fallback chain이 안전 | 렌더링된 SVG 텍스트 노드에 font-family 확인 + 한글 표시 정상 |

### 1.2 Non-functional Requirements

- **MD canonical 유지:** `SLIDES_GAP_TO_PROGRESS.md`가 진실의 단일 소스. ECharts JSON도 마크다운 코드블록 안에 인라인.
- **빌드 자기완결성:** 산출 HTML 1개 파일에 모든 SVG base64 인라인 유지 (USB 송부 가능).
- **CDN 최소화:** Reveal.js, Pretendard만 CDN. ECharts는 빌드 타임에만 사용 (런타임 로드 X).
- **재현성:** `npm i` 또는 `npx --yes`로 도구 설치, README에 빌드 명령 1줄.
- **개인정보:** 해당 없음 (디자인 작업만).

### 1.3 Out of Scope

- Slidev 마이그레이션 (T3) — 별도 검토 필요 시 분리 PDCA
- 외부 AI 도구(Gamma·Pitch 등) 산출물 (T4) — Q4=절대 유지로 배제
- 데이터 코호트 교체 (slides-cohort-replacement에서 진행)
- LECTURE_V2.md, PITCH_DECK 동시 디자인 업그레이드
- 다크 모드 deck 변종
- CI 자동 빌드 (research §12 open question, 별도 분리)

---

## 2. Approach

### 2.1 High-level Steps

```
Phase A (~4h)
  1. mermaid-config.json 작성 + mmdc 호출 인자 추가
  2. theme.css 작성 (디자인 토큰 + 4 master)
  3. build_revealjs.js에서 theme.css 인라인
  4. SLIDES_GAP_TO_PROGRESS.md 주요 슬라이드 ≥6개에 디렉티브
  5. 빌드 검증 → 시각 회귀 점검

Phase B (~6h)
  6. echarts SSR PoC — node-canvas vs 공식 SSR 모듈 선택 (Design 단계)
  7. build_revealjs.js에 ```echarts 추출·렌더링 로직 추가
  8. 5개 차트 마이그레이션 (2-E, 1-G or 5-D, 2-D, 2-A, 6-A)
  9. 폰트 임베드·한글 표시 검증
  10. 최종 빌드 + 회귀 차트 36 모두 정상
```

### 2.2 Phase A 구체 산출물

#### `slides_build/mermaid-config.json`
```json
{
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#dbeafe",
    "primaryBorderColor": "#2563eb",
    "primaryTextColor": "#0f172a",
    "lineColor": "#64748b",
    "fontFamily": "'Pretendard Variable', sans-serif",
    "fontSize": "16px"
  },
  "flowchart": { "curve": "basis", "padding": 20 },
  "xyChart": {
    "width": 900, "height": 480,
    "plotColorPalette": "#2563eb,#ef4444,#10b981,#f59e0b"
  }
}
```

#### `slides_build/theme.css` (요지)
```css
:root {
  --color-primary: #2563eb;
  --color-accent:  #ef4444;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-text:    #0f172a;
  --color-text-muted: #64748b;
  --color-bg:      #ffffff;
  --color-bg-card: #f8fafc;
  --shadow-card:   0 1px 3px rgba(0,0,0,0.06);
  --radius-card:   8px;
  --space-section: 24px;
}
.layout-cover    { /* 대형 헤딩, 그라데이션 배경 */ }
.layout-section  { /* 큰 파트 번호 + 한 문장 */ }
.layout-chart-focus { /* 제목上, 차트中, 인사이트 1줄下 */ }
.layout-2col     { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-section); }
```

#### 디렉티브 부착 후보 슬라이드 (최소 6개)
| 슬라이드 | 권장 layout |
|---|---|
| `# 수능 영어, 거리로 보다` (cover) | `.layout-cover` |
| `# 1 │ 교육과정과 수능영어수준의 격차` (part intro) | `.layout-section` |
| `# 2 │ 학습자의 역량과 시험 문항 해결력의 괴리` | `.layout-section` |
| `1-D. 한국 vs 미국 — 약 44배 격차` (chart + table) | `.layout-2col` |
| `2-E. Performance Descriptor 5축` (radar focus) | `.layout-chart-focus` |
| `# 한 줄 요약` (cover style) | `.layout-cover` |

### 2.3 Phase B 구체 선택지

#### ECharts SSR 통합 방식 (Design 단계 결정)
| 방식 | 장점 | 단점 |
|---|---|---|
| `echarts` + `jsdom` + `xmlserializer` | 공식 권장, SVG renderer 사용 가능 | jsdom 의존성 크기 |
| `echarts-ssr` 패키지 (있다면) | 간단 | 유지보수 미확인 |
| puppeteer + 브라우저 렌더 | 가장 정확 | 무거움, CI 어려움 |

권장: **echarts + jsdom + SVG renderer** (오프라인, deterministic).

#### 마크다운 표현
````markdown
```echarts
{
  "title": { "text": "Performance Descriptor 5축" },
  "radar": {
    "indicator": [
      { "name": "문법 정확성", "max": 100 },
      { "name": "어휘 다양성", "max": 100 },
      { "name": "논리 구성력", "max": 100 },
      { "name": "창의성",     "max": 100 },
      { "name": "맥락 적절성", "max": 100 }
    ]
  },
  "series": [{
    "type": "radar",
    "data": [
      { "name": "목표",      "value": [80, 75, 70, 65, 75] },
      { "name": "고2 실측",  "value": [35, 25, 20, 15, 5] }
    ]
  }]
}
```
````

build_revealjs.js에서 ` ```echarts` 블록 추출 → ECharts SSR → SVG 문자열 → base64 인라인 (현 mmdc 처리 패턴과 동일 구조).

### 2.4 마이그레이션 우선순위 (5개 선정 사유)

| # | 슬라이드 | 현재 | ECharts | 선정 이유 |
|---:|---|---|---|---|
| 1 | 2-E | xychart 막대 2벌 | **radar** | 5축 동시 비교는 radar가 정답, 막대는 정보 손실 |
| 2 | 1-G | xychart 막대 (CEFR 도달 갭) | **heatmap** (6학년×4단계) | 학년-단계 매트릭스는 heatmap이 자연스러움 |
| 3 | 2-D | mermaid graph LR (19×12) | **Sankey** | 노드망보다 흐름·가중치 시각화 우수 |
| 4 | 2-A | xychart 막대 (12 skill 비교) | **grouped bar** (정밀) | 가장 자주 보이는 차트, 색·축·범례 통제 필요 |
| 5 | 6-A | xychart 막대 (Before/After) | **grouped bar with delta** | Before-After 강조에 delta arrow 가능 |

> 31개 차트(flowchart·gantt·pie·간단 막대)는 Mermaid 유지 — Mermaid의 강점 영역.

---

## 3. Success Criteria

| ID | Criterion | Measurement |
|---|---|---|
| SC-01 | T1 완료 후 36 SVG가 통일 팔레트 (primary #2563eb 등) 사용 | rendered-*.svg grep으로 색 코드 일치 확인 |
| SC-02 | 슬라이드 마스터 디렉티브 ≥6곳 부착, HTML에서 .slide[class] 적용 확인 | 빌드 후 HTML grep `class="layout-` |
| SC-03 | T2 완료 후 5개 차트가 ECharts로 교체, 한글 정상 표시 | 렌더링된 SVG에 한글 텍스트 노드 존재 + 시각 검수 |
| SC-04 | 빌드 1회 호출로 SLIDES_GAP_TO_PROGRESS.html 산출, 자체 실행 (CDN 차단해도 차트 표시) | offline 브라우저에서 차트 36 모두 보임 |
| SC-05 | 빌드 시간 ≤ 60초 (현 baseline ~30초 + ECharts 추가분 허용) | `time node build_revealjs.js` |
| SC-06 | HTML 파일 크기 ≤ 1.2MB (현재 644KB + ECharts SVG 추가분 허용) | `ls -lh SLIDES_GAP_TO_PROGRESS.html` |
| SC-07 | 시각 회귀 — Phase A 전후 슬라이드 캡처 비교, 콘텐츠 동일 디자인 일관 향상 | 수동 정독 + 1-2 슬라이드 스크린샷 첨부 |

---

## 4. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| ECharts SSR이 Pretendard 한국어 폰트를 정확히 임베드 못 함 | 중 | 높음 | 사전 PoC (Phase B Step 6)에서 차트 1개 먼저 검증. 실패 시 fontFamily fallback chain + SVG embed font subset |
| mmdc themeVariables가 xychart에 부분 적용 (Mermaid 알려진 한계) | 중 | 중 | 적용 안 되는 차트는 T2 ECharts 마이그레이션 후보로 승격 (FR-B 범위 조정) |
| 디자인 트랙에 시간 쏟다 cohort-replacement 등 콘텐츠 작업 지연 | 중 | 중 | 80/20 — **Phase A는 무조건 완료**, Phase B는 시점 보고 진입 결정 |
| ECharts SSR 의존성(jsdom 등) 설치 실패 | 낮음 | 중 | npx --yes 패턴 유지 + package.json devDependencies 명시 |
| Reveal.js theme.css 인라인 시 CSS specificity 충돌로 일부 스타일 무시 | 중 | 낮음 | 빌드 후 DevTools로 직접 확인, 필요 시 `:where()` 또는 더 구체적 셀렉터 |
| 마스터 슬라이드 디렉티브가 일부 슬라이드와 안 어울려 디자인 일관성 떨어짐 | 낮음 | 중 | 처음엔 6개만 부착, 점진 확장. 안 어울리면 디렉티브 제거가 비파괴 |
| Mermaid에서 ECharts로 교체 시 정보 손실 (특히 2-D Sankey vs graph) | 중 | 중 | Design 단계에서 각 차트 mockup 비교, 마음에 안 들면 Mermaid 유지 가능 (FR-B는 후보, 실제 채택은 Design 결정) |

---

## 5. Timeline (Estimate)

| 단계 | 예상 소요 | 산출물 |
|---|---|---|
| Design | 60분 | `docs/02-design/features/slides-design-t1t2.design.md` (ECharts SSR 방식 확정, 5개 차트 mockup, theme.css 전체 코드) |
| Do — Phase A | 4시간 | mermaid-config.json + theme.css + build_revealjs.js 수정 + SLIDES_GAP_TO_PROGRESS.md 디렉티브 |
| Do — Phase A 검증 | 30분 | 빌드 + 시각 회귀 검수 + SC-01·02 확인 |
| Do — Phase B Step 6 (SSR PoC) | 60분 | 차트 1개 ECharts 마이그레이션 + 폰트 검증 |
| Do — Phase B Steps 7-9 (4 chart) | 4시간 | 나머지 4개 차트 마이그레이션 + 빌드 통합 |
| Check (gap-detector) | 30분 | `docs/03-analysis/slides-design-t1t2.analysis.md` |
| Report | 30분 | `docs/04-report/slides-design-t1t2.report.md` |
| **합계** | **약 11시간** | PR 1~2개 (Phase A / Phase B 분리 권장) |

> Phase A·B 분리 PR 권장 — Phase A만으로도 deck 품질이 상당히 개선되므로 머지 후 사용하다가 Phase B 진입 결정 가능.

---

## 6. Dependencies

- **로컬 도구:** node, npx, mmdc (`@mermaid-js/mermaid-cli`, 이미 사용 중), `echarts` + `jsdom` (Phase B 시 추가)
- **외부 자원:** Pretendard CDN, Reveal.js CDN (현재와 동일)
- **다른 PDCA:** 없음 (slides-cohort-replacement와 **파일 충돌 무관** — cohort는 본문 수치, t1t2는 빌드 파이프라인+디렉티브 추가)
- **레포 자료:** [research §3-§7](slides-design-upgrade-research.md), [build_revealjs.js](../../../slides_build/build_revealjs.js)

---

## 7. Open Questions for Design Phase

- ECharts SSR 방식 3가지 중 어느 것? (echarts+jsdom 권장 — Design에서 PoC로 확정)
- 5개 차트 중 2-D를 Sankey로 갈지 Chord로 갈지 graph 유지할지? (mockup 3종 비교 후 결정)
- 1-G vs 5-D 중 어느 것을 heatmap으로? (둘 다 후보, 정보밀도가 더 큰 쪽 선택)
- theme.css를 `slides_build/`에 둘지 별도 `slides_build/themes/` 디렉토리로 분리할지? (향후 dark mode·variant 고려 시 디렉토리)
- 차트 데이터를 별도 JSON으로 분리할지 마크다운 인라인 유지할지? (research §12, 이번 PDCA에선 **인라인 유지** — 데이터 분리는 별도 PDCA)
- Phase A·B를 PR 1개로 묶을지 분리할지? (분리 권장하나 사용자 결정)

---

## 8. Coordination with `slides-cohort-replacement`

| 항목 | slides-cohort-replacement | slides-design-t1t2 |
|---|---|---|
| 다루는 것 | 본문의 학습자 수치 (2-A·6-A·6-B·6-C) | 빌드 파이프라인, theme, 마스터, 차트 라이브러리 |
| 수정 파일 | `SLIDES_GAP_TO_PROGRESS.md` (수치 텍스트) | `slides_build/*` + `SLIDES_GAP_TO_PROGRESS.md` (디렉티브·차트 블록) |
| 충돌 위험 | 2-A·6-A 차트 데이터 — design-t1t2의 FR-B5가 2-A·6-A를 ECharts로 옮기면 cohort가 데이터를 채울 때 ECharts JSON에 써야 함 | 同上 |
| 해결 | design-t1t2가 먼저 머지되면 cohort는 ECharts JSON 안에 (추정) 라벨 + 향후 실측 수치 교체. cohort가 먼저면 design-t1t2 FR-B5에서 라벨 보존 | 두 PDCA 모두 (추정) 라벨 정책을 공유 — 라벨이 디자인 토큰화되도록 theme.css에 `.estimated` 스타일 정의 권장 |
| 순서 권장 | **design-t1t2 Phase A 먼저** (~4h, 콘텐츠 안 건드림) → cohort 라벨 작업 머지 확인 → design-t1t2 Phase B | — |

---

## 9. Out-of-Scope Backlog (Future PDCAs)

- **T3 Slidev 마이그레이션** — research §5, 별도 브랜치 PoC 후 결정
- **CI 자동 빌드** (GitHub Actions에서 push 시 HTML 산출·publish) — research §12
- **데이터 차트 JSON 분리** (마크다운에서 ECharts JSON을 별도 파일로) — research §12
- **다크 모드 variant deck** — research §12
- **LECTURE_V2.md, PITCH_DECK.md 동일 디자인 시스템 적용** — 본 PDCA 안정화 후 패턴 재사용

---

## Sign-off

- [x] Plan reviewed by: smilepat (2026-05-18)
- [x] Decision basis logged: [research doc Decision Log](slides-design-upgrade-research.md#decision-log-2026-05-18)
- [x] Design phase: 핵심 결정만 압축 (별도 문서 없이 본 Plan + 분석 단계에서 확정) — 2026-05-19
- [x] Phase A complete (T1) — 2026-05-19, ~3h
- [x] Phase B complete (T2) — 2026-05-19, ~2h
- [x] Check / Gap Analysis: [slides-design-t1t2.analysis.md](../../03-analysis/features/slides-design-t1t2.analysis.md), **Match Rate 94%**
- [x] Report generated: [slides-design-t1t2.report.md](../../04-report/features/slides-design-t1t2.report.md)
- [ ] SC-07 사용자 시각 검수 (브라우저 검수 진행 중)
- [ ] PR 생성 결정 (사용자)
