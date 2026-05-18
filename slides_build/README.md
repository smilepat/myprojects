# slides_build — 슬라이드 빌드 파이프라인

`SLIDES_GAP_TO_PROGRESS.md` → `SLIDES_GAP_TO_PROGRESS.html` 자체실행 슬라이드 생성.

## 빌드

```powershell
cd slides_build
node build_revealjs.js
```

## 파이프라인

```
SLIDES_GAP_TO_PROGRESS.md
  │
  ├─ Step 1: mmdc        ──→  rendered.md + rendered-*.svg (36개)
  │                            (Mermaid 코드블록을 SVG로 사전 렌더)
  │
  ├─ Step 2: base64 인라인 ──→  rendered.md 내 image refs를
  │                            data:image/svg+xml;base64 데이터 URI로 치환
  │
  └─ Step 3: Reveal.js wrap ──→  ../SLIDES_GAP_TO_PROGRESS.html
                                  (self-contained, 차트는 인라인 SVG)
```

## 산출물 특성

- **단일 파일 자체실행** — USB·이메일 전송 가능
- **차트 인라인** — Mermaid CDN 차단 환경에서도 차트 보임
- **Reveal.js / Pretendard만 CDN 로드** — 첫 로드 시 인터넷 필요, 이후 캐시
- 크기: 약 640 KB (36 차트 base64 SVG 포함)

## 의존성

- Node.js 18+
- npx (자동으로 `@mermaid-js/mermaid-cli` 다운로드)

## 트러블슈팅

| 증상 | 원인 | 해결 |
|---|---|---|
| 차트가 raw 코드로 보임 | 빌드 실패로 인라인 안 됨 | `node build_revealjs.js` 재실행, 출력 확인 |
| 한글 깨짐 | Pretendard CDN 차단 | 시스템 폰트 fallback 작동 (영향 미미) |
| 슬라이드 빈 화면 | Reveal.js CDN 차단 | 오프라인 환경이면 reveal.js 로컬 사본으로 교체 가능 |
| mmdc 실패 | Chromium 미설치 | `npx puppeteer browsers install chrome` 1회 실행 |

## 보조 스크립트

- `inline_svgs.js` — Marp 파이프라인용 SVG 인라인 (구버전, 보존)
