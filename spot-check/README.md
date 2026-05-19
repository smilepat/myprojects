# 출제팀 spot-check — 검수 카드 모음

> 이번 작업 (P0~P4)으로 머지된 변경의 실제 교육 가치 검증.
> smilepat audit (Gemini) + 자체 validator (규칙)만으로는 LLM-self-evaluation 폐쇄 루프라 사람 눈 1차 검수 필요.

## 검수 방법
1. 아래 4개 카드를 순서대로 열고 **풀어본 후** 본인이 도달한 답이 표기된 정답과 일치하는지 확인
2. 각 선지의 매력도를 학생 관점에서 평가 — smilepat plaus와 일치하는지?
3. 카드 하단 "검수자 노트" 4개 항목 채움
4. 4개 다 끝난 후 [`AGGREGATE.md`](AGGREGATE.md)에 종합 의견 작성 (선택)

## 카드 4종

각 카드는 **단일 markdown 파일** — VS Code에서 그대로 보고 수정 가능.

- [01_LC01_purpose_99.md](01_LC01_purpose_99.md) — 높은 점수 케이스 (LC, 목적 찾기, 99/100)
- [02_LC11_baseline_75_NFD.md](02_LC11_baseline_75_NFD.md) — LOW 점수 케이스 (LC11, P2 적용 전, D4=75)
- [03_LC11_after_P2_overall_99.md](03_LC11_after_P2_overall_99.md) — P2 prompt 강화 후 LC11 (D4=90, run 2 overall=99)
- [04_RC19_mood_100.md](04_RC19_mood_100.md) — RC 분위기 추론, audit 100점 만점