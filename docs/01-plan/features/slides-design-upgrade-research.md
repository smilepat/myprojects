# Slides Design Upgrade — 옵션 연구

**Feature ID:** `slides-design-upgrade-research`
**Created:** 2026-05-18
**Status:** Research (not yet a Plan — pending decision)
**Owner:** smilepat
**Related:** [SLIDES_GAP_TO_PROGRESS.md](../../../SLIDES_GAP_TO_PROGRESS.md), [slides-visualization-roadmap.md](slides-visualization-roadmap.md)

---

## Executive Summary

| 관점 | 내용 |
|---|---|
| **Problem** | 현재 Reveal.js + 사전 렌더 Mermaid SVG로 36개 차트 표시는 정상이나, **시각 디자인 품질**(차트 미학, 타이포그래피, 색상 시스템, 레이아웃 정교함)이 투자자/강연 수준에 못 미침. |
| **Solution** | **5개 트랙** 옵션 검토. 각 트랙은 effort·control·cost·결과 품질의 다른 조합. **하이브리드 워크플로** 권장: MD 소스를 canonical로 유지하면서 다중 출력 (개발용 ↔ 투자자용). |
| **Function · UX Effect** | (각 트랙별 상이, 본문 §3~§7 참조) |
| **Core Value** | "전문 디자인"이 단순한 *느낌*이 아니라 **타이포그래피 시스템·색상 토큰·일관된 레이아웃 그리드·차트 미학 통제**의 조합임을 인지하고, 어느 레버를 당길지 의식적으로 선택. |

---

## 1. 현재 상태 평가

### 강점 ✅
- **마크다운 단일 소스** — 버전 관리·diff·PR 리뷰 가능
- **36개 차트가 코드** — 데이터 변경 시 즉시 재생성
- **자체 실행 HTML** (644 KB) — USB·이메일 전송 가능
- **Reveal.js 5.x** — 키보드 네비게이션, Overview 모드, hash URL deep-link
- **Pretendard 한국어 폰트** — CDN 로드 작동
- **빌드 파이프라인 재현 가능** — `slides_build/build_revealjs.js`

### 약점 ⚠️
| 영역 | 현황 | 영향 |
|---|---|---|
| Mermaid 차트 디자인 | 기본 테마, 색상 자유도 제한 | 데이터 미학 약함 — radar/heatmap 미지원 → 막대로 근사 |
| Reveal.js 테마 | `white` 기본, 커스텀 CSS 약간 | 평범, "코드 발표" 느낌 |
| 슬라이드 레이아웃 | 좌측 정렬 텍스트 + 차트 1개 패턴 | 비주얼 임팩트 부족, 비교 슬라이드에서 정보 밀도 단조 |
| 아이콘·일러스트 | 없음 (이모지만) | 시각 hierarchy 약함 |
| 색상 시스템 | ad-hoc CSS | 브랜드 일관성 없음 |
| 마스터 슬라이드·템플릿 | 없음 | 신규 슬라이드 추가 시 디자인 일관성 보장 안 됨 |
| 차트 인터랙티비티 | 없음 (SVG 정적) | 발표 중 데이터 탐색 불가 |

---

## 2. 트랙 비교 요약 (의사결정 매트릭스)

| 트랙 | Effort | 디자인 품질 | 통제 | 비용 | MD 호환 | 한글 |
|---|---|---|---|---|---|---|
| **T1.** 현 스택 디자인 업그레이드 | S (~2h) | 🟡 6/10 | 🟢 완전 | 무료 | ✅ | 🟢 |
| **T2.** Mermaid → ECharts/Chart.js | M (~4-6h) | 🟢 8/10 | 🟢 완전 | 무료 | ✅ | 🟢 |
| **T3.** Slidev 마이그레이션 | L (~6-10h) | 🟢 8/10 | 🟢 완전 | 무료 | ✅ | 🟢 |
| **T4a.** Gamma.app | S (~1h) | 🟢 8/10 | 🟡 제한 | $0–8/mo | 🟡 부분 | 🟡 |
| **T4b.** Pitch.com | M (~3h) | 🟢 9/10 | 🟡 제한 | $0–20/mo | 🟡 부분 | 🟢 |
| **T4c.** Beautiful.ai | M (~3h) | 🟢 8/10 | 🟡 자동 | $12+/mo | 🟡 부분 | 🟢 |
| **T4d.** Figma Slides | L (~10h+) | 🟢 10/10 | 🟢 완전 | $0–12/mo | ❌ | 🟢 |
| **T5.** 하이브리드 (권장) | M (~4h 초기) | 🟢 8/10+ | 🟢 완전 | 무료~$8/mo | ✅ | 🟢 |

> Effort: S=15분~2시간 / M=2~6시간 / L=6시간+

---

## 3. Track 1 — 현재 스택 디자인 업그레이드 (Same Stack)

**소요:** ~2시간 / **비용:** 무료 / **품질 목표:** "보기 좋은 개발자 발표"

### 구체 작업

#### 3.1 Mermaid 테마 통일
현재 build 시 mermaid CDN 기본 테마 사용. `mmdc` 호출 시 `themeVariables` 또는 별도 config 파일 전달:

```javascript
// slides_build/mermaid-config.json
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
  "xyChart": { "width": 900, "height": 480, "plotColorPalette": "#2563eb,#ef4444,#10b981,#f59e0b" }
}
```
호출: `mmdc -c mermaid-config.json -i ... -o ...`

#### 3.2 Reveal.js 커스텀 테마
`slides_build/theme.scss` 또는 인라인 CSS 확장. 디자인 토큰:

```scss
:root {
  --color-primary: #2563eb;
  --color-accent: #ef4444;
  --color-success: #10b981;
  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-bg: #ffffff;
  --color-bg-card: #f8fafc;
  --shadow-card: 0 1px 3px rgba(0,0,0,0.06);
  --radius-card: 8px;
  --space-section: 24px;
}
```

#### 3.3 슬라이드 마스터 패턴
4종 슬라이드 레이아웃 클래스 정의:
- `.layout-cover` — 타이틀 슬라이드 (대형 헤딩, 그라데이션 배경)
- `.layout-section` — 파트 인트로 (큰 번호 + 한 문장)
- `.layout-chart-focus` — 차트 중심 (제목 上, 차트 中, 인사이트 1줄 下)
- `.layout-2col` — 2열 비교 (좌 차트 / 우 표·텍스트)

마크다운에서 `<!-- .slide: class="layout-chart-focus" -->` 디렉티브로 적용.

#### 3.4 일러스트·아이콘 추가
- **Heroicons / Lucide** SVG inline (이미 데이터 URI 패턴 작동)
- **unDraw.co** — 무료 일러스트 (저작권 무관, 단색화 가능)
- 슬라이드 각 Part 인트로에 한 장씩

### 한계
- Mermaid의 **radar/heatmap 미지원**은 여전히 막대 근사
- 차트 미학 한계 (Mermaid는 데이터 보고용이지 *데이터 스토리텔링*용 아님)

---

## 4. Track 2 — Mermaid → ECharts / Chart.js 교체

**소요:** ~4-6시간 (차트 36개 중 데이터 차트 ~20개 마이그레이션) / **비용:** 무료 / **품질 목표:** "데이터 회사 발표급"

### 라이브러리 비교

| | **Apache ECharts** | **Chart.js** | **D3.js** | **Plotly.js** |
|---|---|---|---|---|
| 크기 | 1MB+ (full) | 60 KB | 70 KB | 3 MB |
| 학습 곡선 | 보통 | 쉬움 | 가파름 | 보통 |
| 차트 종류 | 80+ (heatmap·radar·sankey·candlestick 등) | 9 기본 + 플러그인 | 무제한 (DIY) | 40+ |
| 인터랙티비티 | 강력 (hover·zoom·brush) | 기본 | DIY | 강력 |
| 한국어 폰트 | ✅ | ✅ | ✅ | ✅ |
| 정적 export (SVG/PNG) | ✅ | ✅ | ✅ | ✅ |
| 빌드 통합 | 서버 사이드 SVG 출력 OK | 同 | 同 | 同 |
| 사용처 | **복잡 대시보드, BI** | **간단 차트, 빠른** | **창작 자유도 최대** | **과학·통계** |

### 권장 — **ECharts** (이 deck에 최적)

이유:
- **radar·heatmap·sankey 네이티브 지원** (현재 Mermaid 막대 근사 해결)
- **2-D 19×12 매핑** → Sankey 또는 Chord diagram으로 더 명료
- **2-E Performance Descriptor** → 진짜 radar 차트
- **5-D Issue Code 6 카테고리** → 진짜 heatmap
- **공식 SSR 지원** — 빌드 타임 SVG 생성 가능 (Mermaid 파이프라인 패턴 그대로 활용)

### 마이그레이션 전략

```
build_revealjs.js (현재)
  ├─ Mermaid → mmdc → SVG
  └─ wrap in HTML

build_revealjs.js (T2 후)
  ├─ Mermaid (flowchart·gantt·graph만) → mmdc → SVG
  ├─ ECharts (xychart·radar·heatmap·pie 대체) → node-canvas → SVG
  └─ wrap in HTML
```

마크다운에서 ECharts 차트 표현 방식 (예):

````markdown
```echarts
{
  "title": { "text": "Skill 영향력" },
  "radar": { "indicator": [...] },
  "series": [...]
}
```
````

빌드 스크립트에서 ` ```echarts` 블록을 추출 → ECharts SSR → SVG 인라인.

### 비용
- 무료 (오픈소스)
- 학습 시간 4-6시간 (스키마 익히기)
- 36개 차트 중 ~15개 마이그레이션 (Mermaid 잘 맞는 flowchart·gantt는 유지)

---

## 5. Track 3 — Slidev 마이그레이션 (Vue 기반)

**소요:** ~6-10시간 / **비용:** 무료 / **품질 목표:** "기술 발표 베스트 인 클래스"

### 장점
- **Shiki 코드 하이라이트** — 가장 정확한 syntax highlighting
- **Vue 컴포넌트 임베드** — 슬라이드 안에 인터랙티브 위젯
- **VS Code 통합** — 라이브 프리뷰
- **Pretendard 폰트 frontmatter 1줄로 설정**
- **Theme Gallery** — 30+ 커뮤니티 테마 (academic, the-unnamed 등 즉시 활용)
- **실시간 협업** (2026)
- **Twoslash, Magic Move** — 코드 차트가 *애니메이션됨*

### 단점
- Vue 학습 (간단하나 진입 비용)
- 마크다운에서 약간 다른 디렉티브 문법
- 빌드 산출물이 SPA (Reveal.js처럼 단일 HTML 가능하나 더 큼)

### 권장 사유
**현재 Reveal.js 만족도가 낮다면** Slidev로 갈아타는 게 옵션. 만족하면 T1+T2가 더 빠른 ROI.

### 마이그레이션 비용
- frontmatter·디렉티브 변환 (대부분 호환)
- Mermaid 블록은 Slidev 네이티브 지원
- 빌드 산출물 형태 변경 → README·script 업데이트

---

## 6. Track 4 — 외부 AI/디자인 도구

### 6.1 Gamma.app (T4a) — 가장 추천 AI 도구

| | |
|---|---|
| 가격 | Free / Plus $8/mo / Pro $15/mo |
| 강점 | 마크다운 import 지원, AI 디자인 자동, 웹 네이티브, 빠름 |
| 약점 | Mermaid 차트 import 어색 (캡처 이미지로 전환됨), 디자인 제어 제한, 한국어 폰트 자동 인식 부분적 |
| 추천 시나리오 | **빠른 투자자 mini-deck 1회 출력** — Part 7만 import해 AI로 디자인 |
| 워크플로 | (1) Part 7 마크다운만 추출 → (2) Gamma "Import from text" → (3) 디자인 자동 적용 → (4) PPTX/PDF export |
| 출처 | Gamma 3.0 (2025-09)·Imagine (2026-03) |

### 6.2 Pitch.com (T4b) — 협업·브랜드 일관성

| | |
|---|---|
| 가격 | Free / Pro $20/mo / Business $80/mo |
| 강점 | **실시간 협업·video meetings 내장**, 브랜드 가이드 강제, Figma 프로토타입 임베드 |
| 약점 | AI 디자인은 Gamma보다 약함, 마크다운 import 미지원 (수동 복붙) |
| 추천 시나리오 | **공동 작업자가 있을 때** (공동창업자·디자이너) |

### 6.3 Beautiful.ai (T4c) — Smart Slide 자동 그리드

| | |
|---|---|
| 가격 | $12/mo (Smart Slide AI 포함) |
| 강점 | 입력 시 텍스트/아이콘/차트가 그리드에 *자동 스냅* → 디자인 일관성 보장 |
| 약점 | 자동 레이아웃이 강제됨 (자유도 낮음), 한국어 템플릿 부족 |
| 추천 시나리오 | 디자이너가 없고 **레이아웃을 자동화하고 싶을 때** |

### 6.4 Decktopus AI

| | |
|---|---|
| 강점 | 음성 내레이션 포함 AI 생성, 폼·CTA 임베드 (마케팅 deck용) |
| 약점 | 기술 발표보다 **세일즈 deck** 지향 |

### 6.5 Tome.app — AI 네이티브 스토리텔링

| | |
|---|---|
| 가격 | Free / Pro $10/mo |
| 강점 | "프롬프트 → 영화같은 슬라이드", AI 이미지 생성 |
| 약점 | 데이터 차트 약함 (이 deck에 부적합) |

### 6.6 Canva (디자인 자산 최대)

| | |
|---|---|
| 가격 | Free / Pro $13/mo |
| 강점 | **수십만 개 한국어 템플릿·일러스트**, 가장 쉬움 |
| 약점 | 데이터 차트는 정적 (인터랙티브 X), 코드 통합 X |

### 6.7 Figma Slides (디자인 최고, 코드 통합 약)

| | |
|---|---|
| 가격 | Free / Pro $12/mo |
| 강점 | 디자인 자유도 최고, 컴포넌트 시스템, 디자인 시스템 완전 통제 |
| 약점 | **마크다운 import 없음** (수동), 차트는 디자인하거나 외부 임베드 |
| 추천 시나리오 | 디자이너와 협업하는 **최종 투자자 deck** (1-shot) |

---

## 7. Track 5 — **하이브리드 워크플로 (강력 권장)**

### 7.1 개념

```
                       ┌───────────────────────────┐
                       │  Markdown Canonical Source │  ← 진실
                       │  SLIDES_GAP_TO_PROGRESS.md │
                       └─────────────┬─────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
   [개발/리뷰용 deck]        [강연/교육용 deck]       [투자자/세일즈 deck]
   Reveal.js + Mermaid      Reveal.js + ECharts      Gamma 또는 Figma
   (현재 상태)              (T1+T2 결합)             (1회 디자인 패스)
   빠름·자동                보기 좋음·자동           매우 보기 좋음·수동
   git diff·PR로 추적       同                       (export만 PR 추적)
```

### 7.2 단계별 실행

**Phase A (즉시, ~4시간):**
1. T1 적용 — Mermaid 테마 통일, Reveal.js 커스텀 CSS, 슬라이드 마스터 4종
2. **그 결과로 36개 차트가 미관상 일관되고 색상 시스템 일치** → "개발자 발표급 → 보기 좋은 발표급"으로 한 단계 상승

**Phase B (선택, ~6시간):**
3. T2 적용 — ECharts로 5개 차트만 교체 (radar 2개·heatmap 1개·sankey 1개·복잡 막대 1개)
4. 나머지 31개 Mermaid 유지 (flowchart·gantt·simple bar는 충분히 좋음)

**Phase C (투자자 미팅 임박 시, 1-shot):**
5. 마크다운에서 Part 7 비즈니스 섹션만 추출 → **Gamma.app에 import**
6. Gamma의 AI 디자인 적용 → PPTX/PDF로 export
7. **별도 파일** `SLIDES_INVESTOR_polished.pdf` 보존 (마크다운 동기화는 안 됨 — 1회 산출물)

### 7.3 왜 하이브리드가 강력한가

| 시나리오 | 선택 산출물 |
|---|---|
| 매주 데이터 업데이트 → 자동 차트 재생성 | Reveal.js + Mermaid/ECharts |
| 교육청·학교 강연 (50분, 화면 공유) | Reveal.js (Overview 모드, hash URL) |
| **투자자 1:1 미팅 (15분, PPTX 송부)** | **Gamma export** |
| 공동 작업자 리뷰 | Reveal.js + GitHub PR |
| 데이터 회사 포지셔닝 강조 | 코드 기반 자동 생성 자체가 메시지 |

---

## 8. 비용·시간 의사결정 매트릭스

| 우선순위 | 옵션 | 시간 | 비용 | 새 시각 임팩트 |
|---|---|---|---|---|
| 🥇 즉시 (4h) | T1 디자인 토큰 + 마스터 슬라이드 | 4h | $0 | **+30%** (일관성·정렬·여백) |
| 🥈 단기 (+6h) | T2 ECharts 부분 교체 (5개) | 6h | $0 | **+25%** (radar·heatmap·sankey 정상화) |
| 🥉 1회 (+1h) | T4a Gamma export — Part 7만 | 1h | $0–8 | **+40%** (투자자 deck 한정) |
| 🟡 장기 (+8h) | T3 Slidev 마이그레이션 | 8h | $0 | +15% (코드 발표 영역) |
| 🟡 1회 (+10h) | T4d Figma 슬라이드 (디자이너 협업 시) | 10h+ | $0–12/mo | **+50%** (최종 deck) |

> "임팩트 %"는 현재 baseline 대비 *체감 디자인 품질* 추정. 누적 적용 시 단순 합산 안 됨.

---

## 9. 추천 액션 플랜

### 시나리오 A: "다음 주에 투자자 미팅"
1. **오늘**: Phase C — Part 7만 Gamma에 import, AI 디자인 → PDF로 1회 산출물
2. **소요**: 약 1시간
3. **비용**: Free 또는 Plus $8/mo

### 시나리오 B: "1개월 내 발표·자료 정리"
1. **Week 1**: Phase A — T1 디자인 토큰 + 마스터 슬라이드 4종
2. **Week 2**: Phase B — ECharts로 5개 차트 교체 (radar 2-E·heatmap 1-G·sankey 2-D 등)
3. **Week 3 (선택)**: Phase C — 투자자 mini-deck export

### 시나리오 C: "장기 자산화·재사용 가능 시스템"
1. **Sprint 1**: T3 Slidev로 마이그레이션 + Pretendard 폰트 + academic 테마 fork
2. **Sprint 2**: T2 ECharts 통합 (Slidev는 Vue 컴포넌트로 ECharts 직접 임베드 쉬움)
3. **Sprint 3**: 디자인 시스템 (color tokens, layout components, slide masters) Figma에 미러
4. **결과**: 향후 모든 deck에 재사용 가능한 기반

---

## 10. 의사결정 질문

작업 착수 전 결정 필요:

| Q | 옵션 |
|---|---|
| Q1. 이 deck의 **1차 청중**은? | (a) 투자자 (b) 교사·교육청 (c) 학습자 (d) 동료 개발자 |
| Q2. 다음 deck **사용 시점**은? | (a) 이번 주 (b) 1개월 (c) 3개월+ |
| Q3. 디자이너 **협업 가능**? | (a) 없음 — 본인이 다 함 (b) 있음 — Figma·Sketch 받을 수 있음 |
| Q4. 마크다운 단일 소스 **유지 우선순위**? | (a) 절대 유지 (b) 한 번 export 후 분리 OK |
| Q5. **월 구독료** 허용? | (a) 무료만 (b) ~$10/mo OK (c) ~$50/mo OK |

답변 조합으로 트랙 결정:
- Q1=a + Q2=a → **시나리오 A** (Gamma 1회)
- Q1=b + Q2=b → **시나리오 B** (T1+T2)
- Q3=b + Q4=b → **T4d Figma 협업**
- Q5=a + Q4=a → **T1 + T2 only**

---

## 11. 리스크

| 리스크 | 완화 |
|---|---|
| 외부 AI 도구로 export → 마크다운 소스와 분리 → 데이터 변경 시 재export 필요 | Phase C 산출물은 *snapshot*으로 명명 (`SLIDES_INVESTOR_2026-05.pdf`) |
| ECharts 학습 곡선이 예상보다 길음 | 우선 1-2개 차트만 마이그레이션해 paifrog |
| Gamma·Pitch가 한국어 polish 약함 | export 후 PowerPoint·Keynote에서 수동 보정 |
| Slidev 마이그레이션이 막판에 비호환 발생 | 별도 브랜치에서 PoC 후 결정 |
| 디자인 트랙에 시간 쏟다 콘텐츠 작업 지연 | 80/20 룰 — T1은 무조건, 나머지는 일정 보고 |

---

## 12. Open Questions

- 슬라이드 빌드를 **CI 자동화**할까? (GitHub Actions로 push 시 HTML 자동 생성·publish)
- **Pretendard 외 추가 폰트** 도입? (수능 deck 분위기에 어울리는 serif — Noto Serif KR 검토)
- **다크 모드 deck**도 만들까? (강연장 조명 환경에 따라 유용)
- **차트 데이터를 별도 JSON 파일**로 분리할까? (지금은 마크다운 내 인라인, 데이터 재사용 어려움)
- ECharts SSR이 Pretendard 폰트를 정확히 임베드하는지 사전 검증 필요

---

## Sources

조사 출처 (2026-05 기준):

- [PkgPulse: Slidev vs Marp vs Reveal.js 2026](https://www.pkgpulse.com/guides/slidev-vs-marp-vs-revealjs-code-first-presentations-2026)
- [Slidev — Why Slidev](https://sli.dev/guide/why)
- [Slidev — Theme Gallery](https://sli.dev/resources/theme-gallery)
- [Slidev — Configure Fonts](https://sli.dev/custom/config-fonts)
- [Gamma vs Pitch — Fahim AI](https://www.fahimai.com/gamma-vs-pitch)
- [Gamma App Pricing 2026](https://flowith.io/blog/gamma-app-pricing-2026-free-vs-plus-vs-pro/)
- [Gamma vs Tome 2026](https://thesoftwarescout.com/gamma-vs-tome-2026-which-ai-presentation-tool-actually-delivers/)
- [Best AI Pitch Deck Generators 2026 — Alai](https://getalai.com/blog/top-ai-pitch-deck-generators)
- [10 Best AI Pitch Deck Generators 2026 — Hebbia](https://www.hebbia.com/resources/ai-pitch-deck-generators)
- [Beautiful.ai Pitch Decks](https://www.beautiful.ai/pitch-decks)
- [Decktopus — Best Pitch Deck Generators](https://www.decktopus.com/blog/best-pitch-deck-generators)
- [JavaScript Chart Libraries 2026 — Luzmo](https://www.luzmo.com/blog/best-javascript-chart-libraries)
- [When to Use D3, ECharts, Recharts, Plotly — Medium](https://medium.com/@pallavi8khedle/when-to-use-d3-echarts-recharts-or-plotly-based-on-real-visualizations-ive-built-08ba1d433d2b)
- [JavaScript Charting Libraries Complete Guide 2026](https://lalatenduswain.medium.com/the-complete-guide-to-javascript-charting-libraries-in-2026-choosing-the-right-visualization-tool-dac9aeb15f60)
- [Pretendard — Noonnu](https://noonnu.cc/en/font_page/694)

---

## Sign-off

- [x] Research drafted: 2026-05-18 (smilepat)
- [x] Decision logged: **시나리오 B (T1+T2)** — 2026-05-18 (smilepat)
- [x] PDCA Plan spawned: [slides-design-t1t2.plan.md](slides-design-t1t2.plan.md)

### Decision Log (2026-05-18)

§10 의사결정 매트릭스 답변:

| Q | 답변 | 영향 |
|---|---|---|
| Q1. 1차 청중 | **교사·교육청** (B2B/B2G, 30분+ 강연) | 정보밀도·구조 중심 → 코드 기반 트랙 적합 |
| Q2. 사용 시점 | **3개월+** (장기 자산화) | 단계적 접근 가능, 즉시 1-shot 산출물 불필요 |
| Q3. 디자이너 협업 | **없음 — 혼자** | T4d Figma 협업 트랙 배제 |
| Q4. MD 단일 소스 | **절대 유지** | T4a~c 외부 AI 도구 배제 (snapshot 산출만 허용) |
| Q5. 구독료 | (생략) | — |

**선택된 트랙:** §8 우선순위 매트릭스의 🥇 + 🥈 — **T1 (디자인 토큰 + 마스터 슬라이드) + T2 (ECharts 부분 교체)**.

**배제 트랙:**
- T3 Slidev: Q2가 3개월+로 시간 여유가 있지만, T1+T2 누적 효과(+55%)가 T3 단독(+15%)보다 높음. T3는 PoC만 별도 브랜치 고려.
- T4a–c (Gamma/Pitch/Beautiful.ai): Q4=절대 유지와 충돌.
- T4d Figma: Q3=혼자와 충돌.

**규모:** Phase A (T1) ~4h + Phase B (T2 / 5개 차트만) ~6h = **~10h 합계**.
