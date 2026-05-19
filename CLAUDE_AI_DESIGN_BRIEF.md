# Claude.ai/design — 메인 deck 재구성 입력 지침

> 본 deck(`SLIDES_GAP_TO_PROGRESS.md`)을 [claude.ai/design](https://claude.ai/design)으로 재구성할 때 사용하는 brief.
> 전체를 단번에 만들기보다 **§A 디자인 시스템 → §B 섹션별 콘텐츠 → §C 출력 요구사항** 순서로 점진적으로 작업하는 걸 권장.

---

## 사용 방법 (3가지 시나리오)

| 시나리오 | 입력 방법 |
|---|---|
| **전체 deck을 한 아티팩트로** | §A + §B 전체 + §C를 그대로 paste, 마지막에 `SLIDES_GAP_TO_PROGRESS.md` 첨부 |
| **섹션별 (권장)** | §A를 시스템 지침으로 paste → "Part N의 슬라이드 X개를 만들어줘" 식으로 반복 호출 |
| **단일 슬라이드 시제품** | §A의 디자인 토큰 + 해당 슬라이드 콘텐츠(Markdown 원문) paste, "이 한 장만 만들어줘" |

---

# §A. 디자인 시스템 지침 (system prompt-friendly)

> 아래 블록을 **그대로 첫 메시지**로 사용. 이후 모든 슬라이드는 이 시스템을 따라야 함.

```
당신은 한국 EdTech 회사 ET-Craft의 발표 슬라이드 디자이너입니다.
청중은 영어 교사·교육청·투자자이며, 30분+ 강연에서 정보 hierarchy·브랜드 톤 일관성이 중요합니다.

# 프로젝트 컨텍스트
- 제품: LogicFlow — 수능 영어 종합 학습 플랫폼 (베타 2026.6)
- 메시지: "측정 가능한 영어교육 — 수능 1등급까지의 거리, 계량화하다"
- 포지셔닝: "데이터 회사" (콘텐츠 회사가 아닌, 통제된 학습 시스템)

# 디자인 토큰 (반드시 따를 것)
## 색상
- Brand primary: #2563eb (blue-600), dark #1e40af, light #dbeafe
- Accent (위험/대비): #ef4444 (red-500), light #fee2e2
- Success (목표 달성): #10b981 (emerald-500), light #dcfce7
- Warning (추정값 배지): #f59e0b (amber-500), light #fef3c7
- Purple: #8b5cf6, light #ede9fe
- 텍스트: #0f172a (강조 #020617, 약함 #64748b, 매우약함 #94a3b8)
- 배경: #ffffff (카드 #f8fafc, 틴트 #f1f5f9)
- Border: #e2e8f0 (강함 #cbd5e1)

## 타이포그래피
- Body/Heading: 'Pretendard Variable', Pretendard, system-ui, sans-serif
- Code: 'JetBrains Mono', 'D2Coding', Consolas, monospace
- Body size 기준 26px, line-height 1.55
- h1 1.7em / h2 1.25em / h3 1.05em (모두 letter-spacing 음수)
- Strong는 항상 더 진하게 (#020617 또는 primary-dark)

## 간격·라운드·그림자
- 간격: xs 4 / sm 8 / md 16 / lg 24 / xl 32 / 2xl 48
- Radius: sm 4 / md 8 / lg 12 / pill 9999
- Shadow-sm: 0 1px 2px rgba(0,0,0,0.04)
- Shadow-card: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
- Shadow-lg: 0 4px 12px rgba(0,0,0,0.08)

# 슬라이드 마스터 4종 (각 슬라이드는 반드시 하나에 해당)

## layout-cover (또는 lead)
- 용도: 표지·각 Part 종료 후 요약·deck 마무리
- 텍스트 center 정렬
- 배경: 다중 radial-gradient
  - top: primary-light → transparent (60%)
  - bottom-right: success-light → transparent (50%)
  - base: white
- h1: 2.4em, primary-dark→primary 선형 그라데이션 텍스트 (-webkit-background-clip: text)
- h3: 1.15em, text-muted, font-weight 400

## layout-section
- 용도: 각 Part(1~7) 인트로 — "7 │ 시장·비즈니스" 같은 한 줄
- 배경: linear-gradient(135deg, bg-card → bg)
- 좌측 8px solid primary 보더
- h1: 2.6em, primary-dark, letter-spacing -0.03em
- blockquote는 한 문장 인사이트 — 좌측 보더 primary, 배경 투명
- flex-column center 정렬

## layout-chart-focus
- 용도: 차트가 메시지인 슬라이드 (단일 chart + insight 1줄)
- h2: 1.4em, 하단 2px primary-light 보더
- img(차트): max-height 540px, shadow-card, 가운데 정렬
- 차트 아래 insight는 short (1~2줄)

## layout-2col (image-aware grid)
- 용도: 차트(좌) + 표/텍스트(우) 평행 비교
- grid-template-columns: 1fr 1.1fr (오른쪽 약간 넓게)
- h2는 grid-column 1/-1 (두 칸 가로지름)
- 첫 이미지는 자동으로 좌측 칸, 표·blockquote는 우측 칸
- 표 font-size 0.62em (작게)
- blockquote font-size 0.72em
- 텍스트 p font-size 0.78em

# 표 스타일
- border-collapse separate, border 1px slate-200, radius md
- 헤더: bg slate-100, weight 600
- 짝수 행 zebra (#fafbfc)
- 본문 폰트 0.65em (chart-focus·일반), 0.62em (2col 내)
- 마지막 행은 합계/결론이면 strong

# blockquote (insight callout)
- 좌측 4px primary 보더
- 배경: 선형 그라데이션 (bg-card 0% → bg 100%)
- radius 0 md md 0
- font-size 0.78em, color #334155 (normal style, NOT italic)
- strong는 primary-dark

# 차트 (Mermaid / ECharts 사전 렌더링된 SVG 가정)
- 항상 base64 data URI로 인라인 (외부 의존 없음)
- 색상: 위 토큰 팔레트 사용
  - Primary 데이터: #2563eb
  - 대비/위험 데이터: #ef4444
  - 보조: #ca8a04 (어법), #16a34a (어휘), #9333ea (기타), #eab308 (Layer A), #1e40af (Layer B), #ec4899 (Layer C)
- ECharts radar/sankey/heatmap: 영역 채움 알파 0.18–0.20
- 폰트는 Pretendard Variable
- 한국어 fully 지원

# 유틸 클래스
- .estimated: amber pill, "추정값" 표시용
- .badge-primary: blue pill
- "⚠️" 이모지로 추정값 명시 (Korea_English_Solution 실측 vs 추정 구분)

# 출력 형태
- 자체 실행 단일 HTML 파일 (USB·이메일 전송 가능, 약 650KB 목표)
- Reveal.js 5.x 기반 (1280×800 뷰포트, hash routing, slide-number c/t)
- Pretendard만 CDN 로드 (cdn.jsdelivr.net/gh/orioncactus/pretendard)
- 모든 차트는 SVG 인라인 (Mermaid/ECharts CDN 차단 환경 작동)
- 단축키: ←/→ 이동, Esc grid view, F 풀스크린

# 작업 원칙
1. **One message per slide** — 한 슬라이드는 한 메시지
2. **Show, don't tell** — 글머리표보다 차트, 차트보다 비교
3. **Numbers with story** — 모든 숫자는 비유와 함께 ("44배 = 1/44 노출")
4. **추정 vs 실측 분리** — 추정값은 반드시 ⚠️ 배지로 표시
5. **출처 명시** — 모든 슬라이드 하단에 작은 글씨로 출처 (`Korea_English_Solution/...`, `LECTURE_V2.md` 등)
```

---

# §B. 슬라이드 콘텐츠 — 38 슬라이드 + 부록 1

> 콘텐츠 원문은 [`SLIDES_GAP_TO_PROGRESS.md`](SLIDES_GAP_TO_PROGRESS.md) (1,127줄). 아래 표는 **각 슬라이드의 ID·마스터·메시지 한 줄·차트 타입**의 요약. 실제 데이터·표·차트 JSON은 원문 참조.

## 표지 (lead × 1)
| ID | 마스터 | 헤드라인 | 부제 |
|---|---|---|---|
| 0 | lead | 수능 영어, 거리로 보다 | 교육과정 ↔ 수능 ↔ 학습자 역량을 하나의 좌표계에 |

## Part 1 │ 갭 인식 (section + 7 슬라이드)
| ID | 마스터 | 메시지 | 차트 | 핵심 수치 |
|---|---|---|---|---|
| P1 | section | "교과과정의 약속과 수능의 요구 사이의 수학적 갭" | — | — |
| 1-A | chart-focus | 10년 종단 Lexile — 학년별 4 cohort 분기 | xychart 4-line | 상위5%/목표/평균/하위25% (초3 150~350 → 고3 600~1250) |
| 1-D | 2col | 한국 vs 미국 — 읽기 노출량 약 44배 격차 | xychart 2-bar | 한 167K~220K vs 미 9.75M |
| 1-E | chart-focus | 수업시간 부족 — CEFR B1 수학적 불가능 | xychart 3-bar | 980h vs 1200~2000h |
| 1-F | chart-focus | 격차율 누진 — 학년 진행 따라 단조 증가 | xychart 3-bar | 초6 35% → 중3 58% → 고2 72% |
| 1-G | chart-focus | 교육과정 vs CEFR — 학년별 도달 갭 | **ECharts line+area** | 6 학년대 목표 vs 실제 |
| 1-B | chart-focus | 어휘 누적 곡선 — 초등 800 → 수능 6,000 | xychart 5-bar | 800/2300/4000/6000/8500 |
| 1-C | 2col | 평가 비대칭 — 학교 vs 수능 (4축) | xychart 2-bar | 4축 모두 수능이 극단적 우측 |

## Part 2 │ 역량과 시험 해결력의 괴리 (section + 6 슬라이드)
| ID | 마스터 | 메시지 | 차트 |
|---|---|---|---|
| P2 | section | "B-03 하나가 5개 유형을 무력화" | — |
| 2-A | chart-focus | 12 micro-skill — 1등급 목표 vs 도달 추정 | **ECharts grouped bar** |
| 2-B | chart-focus | 1개 결함이 N개 유형 무력화 | mermaid graph LR |
| 2-C | 2col | Skill 영향력 — 어느 skill이 가장 많은 유형 좌우 | xychart 2-bar |
| 2-D | chart-focus | 19 유형 ↔ 12 skill 풀 매핑 | **ECharts Sankey** |
| 2-E | chart-focus | Performance Descriptor 5축 — 목표 vs 고2 | **ECharts Radar** |
| 2-F | chart-focus | 학습 결손 영역 분포 | mermaid pie |

## Part 3 │ 진단 (section + 4 슬라이드)
| ID | 마스터 | 메시지 | 차트 |
|---|---|---|---|
| P3 | section | "어렵다·쉽다가 아닌 수치로 정의" | — |
| 3-A | chart-focus | IRT 1PL Rasch — 동일 척도 | xychart b_value 분포 |
| 3-B | chart-focus | 적응형 진단 수렴 — 단계 절반 | mermaid flowchart |
| 3-C | 2col | 4단계 마스터리 게이트 | xychart 4-bar + 표 |
| 3-D | 2col | IRT 캘리브레이션 로드맵 Phase 1→2→3 | **mermaid gantt** + 표 |

## Part 4 │ 거리·로드맵 (section + 4 슬라이드)
| ID | 마스터 | 메시지 | 차트 |
|---|---|---|---|
| P4 | section | "선수관계 DAG로 학습 경로 골격" | — |
| 4-A | chart-focus | Skill 선수관계 DAG | mermaid graph TD (12 노드) |
| 4-B | chart-focus | Recommender 알고리즘 우선순위 결정 | mermaid flowchart TD |
| 4-C | 2col | 학습자 예시 — top-5 추천 | xychart + 5행 표 |
| 4-D | 2col | 케이스 — Student B 410L → 1000L (2년) | xychart 2-line + code + 표 |

## Part 5 │ 계량화된 학습 (section + 5 슬라이드)
| ID | 마스터 | 메시지 | 차트 |
|---|---|---|---|
| P5 | section | "좌표에 정확히 맞는 문항 즉시 생성" | — |
| 5-A | 2col | 학습 자산 — 137,745 문항 외 7항목 | xychart log + 7행 표 |
| 5-B | 2col | learning_step ↔ b_value | xychart + 표 |
| 5-C | chart-focus | 2-Stage LLM × 9 검증기 × Issue Code | mermaid flowchart LR (10+ 노드) |
| 5-D | 2col | Issue Code 6 카테고리 | xychart + 표 + JSON code |
| 5-E | 2col | 운영 KPI 5축 (현재 vs 목표) | xychart 2-bar + 표 |

## Part 6 │ Progress (section + 4 슬라이드)
| ID | 마스터 | 메시지 | 차트 |
|---|---|---|---|
| P6 | section | "점수가 아니라 좌표의 이동" | — |
| 6-A | chart-focus | Before/After — 12 skill 좌표 이동 | **ECharts grouped bar** ⚠️추정 |
| 6-B | chart-focus | 마스터리 레벨 이동 시각 카운트 | xychart 2-bar ⚠️추정 |
| 6-C | chart-focus | 누적 학습시간 ↔ θ 상승 | xychart line ⚠️추정 |
| 6-D | chart-focus | 진단 → 학습 → 재진단 루프 | mermaid flowchart LR |

## Part 7 │ 시장·비즈니스 (section + 5 슬라이드)
| ID | 마스터 | 메시지 | 차트 |
|---|---|---|---|
| P7 | section | "교육 진단 끝낸 뒤 — 왜 이 시장·가격·카테고리" | — |
| 7-A | 2col | TAM — 3 세그먼트 × 3 채널 | xychart 3-bar + 표 |
| 7-B | 2col | 단가 — 인간강사 대비 100–180배 저렴 | xychart log + 표 |
| 7-C | 2col | D5 모드 vs 인간 1:1 — 카테고리 정의 | xychart 2-bar + 표 |
| 7-D | 2col | 경쟁 포지셔닝 — 5축 풀스택 우위 | xychart 4-bar + 표 |
| 7-E | 2col | 마일스톤 — 2026.06 베타 → 2027 sLLM | **mermaid gantt** + 표 |

## 마무리 + 부록
| ID | 마스터 | 메시지 | 차트 |
|---|---|---|---|
| 한 줄 요약 | lead | "학습자의 거리, 좌표로 측정한다." | mermaid flowchart LR 6단계 |
| 부록 | (none) | 데이터 출처 — 실측 vs 추정 분리 | text only |

---

# §C. 출력 요구사항

## 산출물 형태
- **단일 HTML 파일** (자체 실행, 외부 의존 최소화)
- 크기: 약 650 KB 목표 (현재 baseline: 648 KB)
- Reveal.js 5.x 기반 (이미 본 deck이 이 패턴)
  - data-markdown + data-separator로 슬라이드 구분 (`^\n---\n`)
  - `<!-- .slide: class="..." -->` 디렉티브로 마스터 적용

## 차트 처리
- 모든 차트는 **SVG로 사전 렌더링 + base64 data URI 인라인**
- Mermaid 31개 + ECharts 5개 (1-G line, 2-A grouped bar, 2-D Sankey, 2-E radar, 6-A grouped bar)
- 폰트는 Pretendard Variable 임베드 또는 fallback chain

## 재현성·일관성
- 동일 입력 → 동일 SVG 산출 (난수 시드 없음, `animation: false`)
- 22 디자인 토큰 모두 CSS `:root`에 정의
- 4 슬라이드 마스터 CSS 클래스 명시

## 검증 기준
- 36 차트 모두 렌더링 + 색상·폰트 일관
- 38+ 슬라이드 마스터 디렉티브 적용 (cover/section/chart-focus/2col)
- 1280×800 뷰포트에서 텍스트·차트가 화면 내 fit
- USB·이메일 전송 후 오프라인 정상 작동 (Reveal.js·Pretendard CDN만)

---

# 참고 자료 (claude.ai에 별도 paste 가능)

| 파일 | 용도 |
|---|---|
| [`SLIDES_GAP_TO_PROGRESS.md`](SLIDES_GAP_TO_PROGRESS.md) | 콘텐츠 원본 (Markdown + Mermaid + ECharts JSON) |
| [`slides_build/theme.css`](slides_build/theme.css) | 현 디자인 토큰·마스터 CSS (275 lines) |
| [`slides_build/mermaid-config.json`](slides_build/mermaid-config.json) | Mermaid 통일 테마 |
| [`slides_build/build_revealjs.js`](slides_build/build_revealjs.js) | 빌드 파이프라인 (3 단계, 23초) |
| [`docs/04-report/features/slides-design-t1t2.report.md`](docs/04-report/features/slides-design-t1t2.report.md) | 직전 디자인 업그레이드 (94% match) |

---

# 활용 팁

1. **첫 시도는 1-A 한 장만 만들어서 디자인 톤 확인** — 정합되면 Part 1 나머지로 확장
2. **ECharts 5개는 별도 처리** — Mermaid 한계로 막대 근사하던 것을 진짜 형태(radar/sankey/heatmap)로
3. **추정값(⚠️)과 실측 분리** — 6-A, 6-B, 6-C는 추정값. 이 라벨 누락 시 신뢰성 손실
4. **출처 footer는 일관 위치** — 모든 슬라이드 하단 `> 출처: ...` 패턴 유지
5. **만든 결과는 [`PITCH_DECK_VIEW.html`](PITCH_DECK_VIEW.html) 같은 별도 파일로 보존** — 기존 빌드 산출물(`SLIDES_GAP_TO_PROGRESS.html`) 덮어쓰기 금지
