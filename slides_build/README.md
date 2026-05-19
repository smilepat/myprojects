# slides_build — 슬라이드 빌드 파이프라인

`SLIDES_GAP_TO_PROGRESS.md` → `SLIDES_GAP_TO_PROGRESS.html` 자체실행 슬라이드 생성.

## 빌드 (메인 deck)

```powershell
cd slides_build
node build_revealjs.js
```

## 파이프라인

```
SLIDES_GAP_TO_PROGRESS.md
  │
  ├─ Step 1a: ECharts SSR ──→  rendered-echarts-*.svg (5개)
  │                            (```echarts JSON 블록을 ECharts native SSR로 SVG화,
  │                             jsdom 불필요, deterministic)
  │
  ├─ Step 1b: mmdc + theme ──→  rendered.md + rendered-*.svg (31개)
  │                            (Mermaid 코드블록을 mermaid-config.json 테마로 SVG화)
  │
  ├─ Step 2: base64 인라인 ──→  rendered.md 내 image refs를
  │                            data:image/svg+xml;base64 데이터 URI로 치환
  │
  └─ Step 3: Reveal.js wrap ──→  ../SLIDES_GAP_TO_PROGRESS.html
                                  (self-contained, theme.css 인라인,
                                   디자인 토큰 + 4 슬라이드 마스터 적용)
```

## 산출물 특성

- **단일 파일 자체실행** — USB·이메일 전송 가능 (약 650 KB)
- **차트 인라인** — Mermaid / ECharts CDN 차단 환경에서도 차트 보임 (모두 사전 렌더링됨)
- **Reveal.js / Pretendard만 CDN 로드** — 첫 로드 시 인터넷 필요, 이후 캐시
- **재현 가능** — 2회 연속 빌드 시 SHA256 diff 0건 (`animation: false` for ECharts, themed Mermaid)
- **빌드 시간** ~25초 (5 ECharts SSR + 31 mmdc + 인라인 + wrap)

## 파일 구조

| 파일 | 역할 |
|---|---|
| `build_revealjs.js` | 메인 빌드 스크립트 (3 단계 파이프라인) |
| `mermaid-config.json` | Mermaid 통일 테마 (themeVariables, xyChart palette) |
| `theme.css` | 디자인 토큰 + 4 슬라이드 마스터 + 유틸 클래스 |
| `echarts-ssr.js` | ECharts 5.x native SSR 헬퍼 (et-craft 테마 등록) |
| `package.json` | echarts, jsdom 의존성 |
| `inline_svgs.js` | 구버전 Marp 파이프라인용 (보존) |

## 디자인 시스템

- **22 디자인 토큰** (`theme.css` `:root`) — color/space/radius/shadow
- **4 슬라이드 마스터**:
  - `layout-cover` (또는 Marp `lead`) — 표지·요약: 그라데이션 배경 + 그래디언트 텍스트
  - `layout-section` — 파트 인트로: 좌측 8px primary 보더 + 큰 헤딩
  - `layout-chart-focus` — 차트 중심: max-height 540px + 그림자 + 보더 헤딩
  - `layout-2col` — 차트(좌) + 표·텍스트(우) 자동 분배 (image-aware grid)
- 마크다운에서 적용: `<!-- _class: layout-section -->`

## 의존성

- Node.js 18+
- npx (자동으로 `@mermaid-js/mermaid-cli` 다운로드)
- `npm install` (echarts, jsdom — 본 디렉토리에서 1회)

## 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 차트가 raw 코드로 보임 | 빌드 실패로 인라인 안 됨 | `node build_revealjs.js` 재실행, 출력 확인 |
| ECharts 한글 깨짐 | Pretendard SVG 임베드 실패 | `echarts-ssr.js`의 FONT_FAMILY 확인, 한글 정상이면 OK |
| 한글 깨짐 (전반) | Pretendard CDN 차단 | 시스템 폰트 fallback 작동 (영향 미미) |
| 슬라이드 빈 화면 | Reveal.js CDN 차단 | 오프라인 환경이면 reveal.js 로컬 사본으로 교체 가능 |
| mmdc 실패 | Chromium 미설치 | `npx puppeteer browsers install chrome` 1회 실행 |
| 빌드 SVG가 매번 다름 | 재현성 실패 | `animation: false` 확인 (`echarts-ssr.js:105`) |

---

## 보조 deck — PITCH_DECK.marp.md

Apple Keynote 스타일 다크 모드 deck (별도 디자인 정체성). Marp CLI로 빌드.

```powershell
cd ..
npx --yes --package=@marp-team/marp-cli marp PITCH_DECK.marp.md -o PITCH_DECK.html --html
```

- 본 deck은 메인 deck과 **타이포 토큰만 공유** (Pretendard Variable), 색상은 의도적으로 분리 (`#FF3B30` Apple SF Red vs 메인의 `#2563eb`)
- `PDF` 산출: `... -o PITCH_DECK.pdf --pdf`
- `PPTX` 산출: `... -o PITCH_DECK.pptx --pptx`
