# Slide PDFs (수능 영어 역량 관련)

생성일: 2026-05-25
생성 방법: [@marp-team/marp-cli](https://github.com/marp-team/marp-cli) v4.4.0 (`.md` → PDF), Microsoft Edge headless (`.html` → PDF)

수능 영어 학습자 역량(skill map), 교육과정 ↔ 수능 갭, 문항 생성·자가개선 시스템을 다루는 슬라이드/브리프 자료의 PDF 스냅샷 모음입니다.

## 디렉터리 구조

```
slides_build/pdf/
├── README.md                                 ← 이 파일
├── myprojects/                               ← 본 레포 자체 자료 (6개)
└── external/                                 ← 외부 레포 출처 (4개)
    ├── apple/                                ← smilepat/apple (PRIVATE)
    └── usb_csat_mj_generator/                ← smilepat/usb_csat_mj_generator (PRIVATE)
```

## myprojects (이 레포 자체)

| PDF | 원본 |
|---|---|
| `myprojects/PITCH_DECK.pdf` | [PITCH_DECK.marp.md](../../PITCH_DECK.marp.md) — Marp 슬라이드 본판 |
| `myprojects/PITCH_DECK_plain.pdf` | [PITCH_DECK.md](../../PITCH_DECK.md) — 일반 마크다운판 |
| `myprojects/PITCH_DECK_VIEW.pdf` | [PITCH_DECK_VIEW.html](../../PITCH_DECK_VIEW.html) — 브라우저 뷰어 렌더 (marked.js 런타임 fetch 한계로 본판 PDF 대비 보조용) |
| `myprojects/SKILL_MAP_SLIDE_BRIEF.pdf` | [SKILL_MAP_SLIDE_BRIEF.md](../../SKILL_MAP_SLIDE_BRIEF.md) — "수능 문항은 단일 능력이 아니라 여러 역량의 결합" |
| `myprojects/SLIDES_GAP_TO_PROGRESS.pdf` | [SLIDES_GAP_TO_PROGRESS.md](../../SLIDES_GAP_TO_PROGRESS.md) — 학교 내신 vs 수능 역량 갭 |
| `myprojects/landing.pdf` | [slides_build/landing.html](../landing.html) — 슬라이드 인덱스 페이지 |
| `myprojects/LECTURE_CSAT_SKILL_MAP.pdf` | [LECTURE_CSAT_SKILL_MAP.marp.md](../../LECTURE_CSAT_SKILL_MAP.marp.md) — "수능영어와 교육과정의 괴리 · 데이터와 바이브 코딩으로 해결책을 찾다" (EdTech 경영자 강의, 30장, 45–55분) |
| `myprojects/SLIDES_CSAT_SOLUTION_PROJECT.pdf` | [SLIDES_CSAT_SOLUTION_PROJECT.marp.md](../../SLIDES_CSAT_SOLUTION_PROJECT.marp.md) — "What's Built · CSAT Solution Project 자산 지도" ([csat-solution-project.md](../../csat-solution-project.md)의 슬라이드 버전, 14장, ~15분) |

## external/apple (smilepat/apple, PRIVATE)

원본 위치: `smilepat/apple` 레포의 `consortium-pitch/` 디렉터리. Apple 컨소시엄 파트너 쇼케이스(7분 피치) 준비 자료.

| PDF | 원본 (smilepat/apple) |
|---|---|
| `external/apple/PITCH_DECK.pdf` | `consortium-pitch/PITCH_DECK.md` |
| `external/apple/PITCH_DECK_VIEW.pdf` | `consortium-pitch/PITCH_DECK_VIEW.html` |
| `external/apple/SKILL_MAP_SLIDE_BRIEF.pdf` | `consortium-pitch/SKILL_MAP_SLIDE_BRIEF.md` |

## external/usb_csat_mj_generator (smilepat/usb_csat_mj_generator, PRIVATE)

원본 위치: `smilepat/usb_csat_mj_generator` 레포.

| PDF | 원본 (smilepat/usb_csat_mj_generator) |
|---|---|
| `external/usb_csat_mj_generator/system_workflow_slides.pdf` | `docs/system_workflow_slides.md` — 수능 영어 문항 생성·자가개선 시스템 워크플로우 |

## 재생성 방법

```bash
# 1) Marp로 .md → PDF
marp --pdf --allow-local-files <input.md> -o <output.pdf>

# 2) Edge headless로 .html → PDF (Windows)
msedge --headless=new --disable-gpu --no-pdf-header-footer \
       --virtual-time-budget=15000 --run-all-compositor-stages-before-draw \
       --print-to-pdf=<output.pdf> file:///<absolute-path-to-input.html>
```
