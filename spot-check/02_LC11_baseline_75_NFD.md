# 검수 카드 — 02_LC11_baseline_75_NFD

> **LOW 점수 케이스 (LC11, P2 적용 전, D4=75)**. distractor 4·5번 매력도 10·20%로 NFD 판정. 사람이 보기에도 명백히 약한 오답인지 확인.

## 메타
| 항목 | 값 |
|---|---|
| Item No | 11 (LC) |
| Request ID | `c42540d1-1818-4d86-9024-b6270f74e39a` |
| 자체 validator | PASS |
| smilepat overall | **95** / 100 (통과) |
| smilepat D4 (distractor) | **75** |
| Blocking dims | (없음) |

## 지문 / Script

```
M: Hi, Susan. I’m really looking forward to our camping trip this weekend.
W: Me too, Mike. I’ve already bought all the food. Is your new tent ready?
M: It is. I practiced setting it up in my backyard yesterday. It’s quite spacious.
W: That’s great to hear. By the way, did you check the weather forecast?
M: I did this morning. It’s supposed to be clear and sunny on Saturday.
W: Perfect! What about Saturday night? I’m worried it might get cold.
M: Well, the forecast said the temperature will drop significantly after sunset.
W: Oh, I see. I was only planning on bringing a light blanket.
M: I don’t think that will be enough. You should probably bring a thick sleeping bag.
W: The problem is, I don’t have one. I was going to borrow one from my brother, but he’s using it this weekend.
M: Hmm. I have an extra one that I bought last year. It’s very warm.
W: Really? That’s a relief.
M: It’s in my car right now. I can go and get it for you if you’d like.
```

## 발문

대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]

## 선지

| # | 선지 | smilepat plaus | 정답 | 검수자 노트 |
|---|---|---|---|---|
| 1 | Oh, that would be great! Thank you so much for your help. _정답_ | 100% | ✅ | |
| 2 | Don't worry. I've already packed a thick winter coat. _적절한 교란지_ | 50% |  | |
| 3 | Okay. I'll go get it from your car while you pack. _주체 오류_ | 60% |  | |
| 4 | I'm sorry, but I don't think your car is spacious enough. _비기능 distractor(NFD)_ | 10% |  | |
| 5 | No, thanks. I think my light blanket will be just fine. _일관성 부족_ | 20% |  | |

## 정답

선지 **1** — Oh, that would be great! Thank you so much for your help.

## 해설

대화의 마지막 부분에서 남자는 밤에 추울 것을 걱정하면서도 두꺼운 침낭이 없는 여자에게 자신의 여분 침낭을 차에서 가져다주겠다고 친절하게 제안하고 있다. 이러한 제안에 대해 여자가 할 가장 적절한 응답은 제안을 수락하며 감사를 표하는 것이다. 따라서 '아, 정말 좋겠네요! 도와줘서 정말 고마워요.'라고 말하는 1번이 정답이다.
[오답 풀이]
2번: 두꺼운 겨울 코트를 챙겼다는 것은 침낭이 필요한 문제에 대한 직접적인 해결책이 아니므로 적��하지 않다.
3번: 남자가 '내가' 가져다주겠다고 제안했는데, '내가' 가지러 가겠다고 응답하는 것은 제안의 의도를 제대로 파악하지 못한 어색한 대답이다.
4번: 남자의 차 공간이 충분하지 않다고 말하는 것은 대화의 주제(침낭)와 전혀 관련이 없는 엉뚱한 응답이다.
5번: 조금 전까지 밤에 추울 것을 걱정하던 여자가 갑자기 가벼운 담요로도 괜찮을 것이라고 말하는 것은 대화의 흐름상 일관성이 없다.

## smilepat audit 하이라이트

**Distractor plausibility** (선지별 매력도): `100%  50%  60%  10%  20%`

**자동 수정 제안**:
- (D4) 오답 4번은 대화의 주제와 무관하여 매력도가 매우 낮습니다. 침낭 문제나 캠핑 준비와 관련된, 그러나 오답인 내용을 담은 선지로 교체하여 오답의 매력도를 높여야 합니다.
- (D4) 오답 5번은 여자의 이전 발언과 모순되어 일관성이 부족합니다. 여자가 침낭을 거절할 만한 다른 이유(예: '다른 친구에게 빌리기로 했어' 또는 '생각해보니 코트가 충분할 것 같아')를 제시하여 오답의 매력도를 높여야 합니다.

**Distractor 전략 분석**:
오답 2번은 여자의 걱정(추위)을 다루지만 남자의 제안(침낭)에 대한 직접적인 응답이 아니라는 점에서 교란합니다. 오답 3번은 남자의 제안(내가 가져다주겠다)의 주체를 잘못 이해하도록 유도하는 매력적인 오답입니다. 그러나 오답 4번은 대화의 주제와 무관하며, 오답 5번은 여자의 이전 발언과 모순되어 매력도가 낮습니다.

**Polarity 확인**: 정답 선지는 남자의 제안에 대한 긍정적 수락으로, 대화의 흐름과 일치하며 진리값에 오류가 없습니다.

---

## 검수자 노트 (사람이 작성)

### A. 풀어보고 정답 도달 가능?

- [ ] 명확한 근거 있음
- [ ] 모호함 (이유: )

### B. 오답 변별력 (각 선지를 학생 관점에서 평가)

매력도가 너무 높거나 너무 낮은 선지가 있는가? smilepat이 놓친 게 있는가?

### C. KICE 출제 적합도

- [ ] 그대로 출고 가능
- [ ] 미세 수정 필요 (포인트: )
- [ ] 재생성 권장

### D. 기타 의견


---

_파일: `C:/tmp/csat-batch-out/12-item11.json`_  
_Audit: `C:\audit-agent-variants-portable\audit-agent-variants-portable\profiles\smilepat\reports\batch-12-item11.csat_strict.2026-05-18T17-52-35-073Z.json`_
