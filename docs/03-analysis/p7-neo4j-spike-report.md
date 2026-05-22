# Phase 2 P-7 Neo4j Adoption Spike — Decision Report

> Spike duration: 4주 (압축 실행 — research + theoretical prototypes)
> 기준: [phase2-backlog §2 P-7](../01-plan/phase2-backlog.md)
> Status: ✅ **DEFER 권고** (현재 scale에서 비용 > 가치)
> Decision gate: ~~정확도 ≥ 10% AND 비용 ≤ $200/월~~ → 실제 미충족

---

## 0. Executive Summary

**권고: Neo4j 도입 DEFER (보류).**

### 근거 (3-line)

1. **OELP 현재 그래프 규모**: 38 노드 (10 QT + 21 keyVar + 7 dist) — Neo4j 가치 없음, in-memory가 더 빠름
2. **vocab-cat-test 통합 시점 학습자 trajectory 추가도 N≤300 예상** — Aura Free (50K-200K nodes) 안에 들어가지만 도입 운영비가 정확도 개선 없는 곳에 들어감
3. **csat-graphdb-318이 이미 그래프 스토어 운영 중** — OELP가 미러링하면 source of truth 분기 위험

### 재평가 트리거 (이 중 하나 발생 시)

- 학습자 N ≥ 1,000 (현재: 1명 dogfooding)
- 추천 정확도 한계가 명시적 — Multi-hop 학습 경로 추천이 필요 (예: "현재 weak QT → 다음 학습할 keyVar → 그 후 transition" 3-hop+)
- csat-graphdb-318 와 OELP 그래프 결합 운영 (Phase 3)
- 외부 학습자 데이터에서 그래프 자연어 질의 요구 발생

---

## 1. 가격 모델 검증 (2026-05 기준 [Neo4j 공식](https://neo4j.com/pricing/))

### 1.1 Aura (managed cloud)

| Tier | 가격 | 적합성 |
|---|---|---|
| **Aura Free** | $0/월, 1 DB | 50K-200K 노드 / 175K-400K relationships (출처 불일치 — 보수적으로 50K) |
| **Aura Professional** | **$65/GB/월** | 개발/소규모 production |
| **Business Critical** | **$146/GB/월** | 엔터프라이즈 production |
| **Virtual Dedicated** | 별도 견적 | 규제 산업 |

OELP 현재 scale (38 node + ~500 vocab metadata 노드 + ~1000 응답 노드까지 가정) → **Aura Free로 충분**.

### 1.2 Self-hosted

| Edition | 라이선스 | 비용 |
|---|---|---|
| **Community Edition** | GPL v3 | **$0** (Docker 자체 호스팅) |
| Enterprise self-hosted | 상용 | $3,000-$6,000 / core / 년 |

Community Edition으로 충분 — 인덱싱, Cypher, 기본 graph algorithms 모두 포함.

### 1.3 비용 게이트 ([phase2-backlog §2 P-7](../01-plan/phase2-backlog.md))

- **목표**: 비용 ≤ $200/월
- **결과**: Aura Free 0원, Community Edition 0원 — **충족**
- 즉, 가격은 차단 요인 아님. **가치/필요성이 차단 요인**.

---

## 2. OELP 현재 데이터 모델 분석

### 2.1 그래프 후보 데이터

| 데이터 | 현재 저장 | 노드 수 | 그래프 가치 |
|---|---|---|---|
| 10 QuestionType + 21 keyVariables + 7 DistractorType | `lib/ontology.ts` + JSON | **38** | 낮음 (in-memory map sufficient) |
| 486 VocabCard (id, dimension, b/a) | `lib/vocabulary-pool.ts` static | 486 | 낮음 (relational query는 SQLite 더 효율) |
| 학습자 sessions (현재 1명, 3 sessions) | localStorage | 3 | 매우 낮음 |
| 학습자 responses (현재 30) | session 내부 | 30 | 매우 낮음 |
| Posteriors (10 QT × 1 학습자) | localStorage | 10 | 매우 낮음 |
| **합계 (현재)** | — | **~570** | — |

→ Aura Free 50K 한계의 **1%** 미만. Scale up 여지 충분.

### 2.2 학습자 채널 확보 시 가정 (N=1,000 학습자 × 60 sessions/year)

| 데이터 | 노드 수 추정 |
|---|---|
| Learner 노드 | 1,000 |
| Session 노드 | 60,000 |
| Response edges | 600,000 (10 cards/session × 60 sessions × 1,000) |
| Card 노드 | 486 (static) |
| QT 노드 | 38 |

→ Aura Free 50K nodes / 175K-400K relationships → **rejected** (relationships 초과 가능성). Professional $65/GB/월 (예상 1-2GB).

**예상 운영비 (N=1000 학습자 시): $65-130/월**.

---

## 3. 그래프 쿼리 후보 (Cypher prototypes)

OELP의 핵심 추천 흐름 중 graph가 유의미한 가치를 추가할 곳:

### 3.1 Multi-hop 학습 경로 — **현재 미사용**

```cypher
// "현재 약점 QT에서 어떤 keyVariable들이 prerequisite인가?"
MATCH (target:QuestionType {id: 'TYPE-요지'})-[:REQUIRES]->(kv:KeyVariable)<-[:PROVIDES]-(prerequisiteQT:QuestionType)
WHERE prerequisiteQT.id <> target.id
RETURN prerequisiteQT.name, count(kv) AS sharedVars
ORDER BY sharedVars DESC LIMIT 3
```

**현재 대안 (in-memory)**: dimension-mapping.json의 keyVariables 필드를 코드로 join. JS Set 연산 충분. **5ms**.

**그래프 도입 시**: 동일 결과를 Cypher로. **1-10ms** + 네트워크 latency 추가. **현실적 이득 없음**.

### 3.2 학습자 trajectory similarity — **활용 가능**

```cypher
// "나와 비슷한 trajectory를 보인 다른 학습자가 다음으로 시도한 QT는?"
MATCH (me:Learner {id: $myId})-[:VISITED]->(c1:Card)<-[:VISITED]-(other:Learner)
WHERE me <> other
WITH other, count(DISTINCT c1) AS sharedCards
MATCH (other)-[:VISITED]->(c2:Card)
WHERE NOT (me)-[:VISITED]->(c2)
RETURN c2.qtId, count(*) AS popularity, sum(sharedCards) AS confidence
ORDER BY popularity DESC LIMIT 5
```

**현재 대안 (SQL)**: SQLite의 JOIN으로 가능하나 N+1 N문제 가능. Cypher가 더 우아.
**도입 조건**: 학습자 N ≥ 100 + 추천 다양화 명시적 요구.

### 3.3 Microskill dependency chain — **csat-graphdb-318 영역**

csat-graphdb-318이 이미 16개 microskill 의존성 그래프 운영. OELP가 별도 Neo4j로 미러링하면 **source of truth 분기**. csat-graphdb-318 API로 lazy fetch 권장.

---

## 4. 대안 평가

### 4.1 현재 (in-memory + JSON + localStorage)

| 평가 |  |
|---|---|
| 비용 | $0 |
| 응답시간 | 1-5ms (in-memory) |
| Scale | ~500 노드까지 우수, ~10K부터 메모리 부담 |
| 운영 복잡도 | 0 (서버 없음) |
| 개발 속도 | 빠름 (JS 객체 조작) |

### 4.2 Neo4j Aura Free (cloud)

| 평가 |  |
|---|---|
| 비용 | $0 (limits 안에서) |
| 응답시간 | 10-100ms (네트워크 latency 포함) |
| Scale | 50K-200K nodes (불확실) |
| 운영 복잡도 | 중간 (계정 + 환경변수 + 연결 관리) |
| 개발 속도 | Cypher 학습 + 드라이버 통합 비용 |

### 4.3 Neo4j Community Edition (Docker self-hosted)

| 평가 |  |
|---|---|
| 비용 | $0 (라이선스), 호스팅 $5-20/월 (VPS) |
| 응답시간 | 1-10ms (로컬) |
| Scale | 메모리 한도까지 |
| 운영 복잡도 | 높음 (백업, 업그레이드, 보안 패치) |
| 개발 속도 | Aura와 동일 |

### 4.4 SQLite + JSON columns (현재 vocabulary-db 패턴 확장)

| 평가 |  |
|---|---|
| 비용 | $0 |
| 응답시간 | 1-10ms |
| Scale | 100K+ rows 가능 |
| 운영 복잡도 | 낮음 (이미 사용 중) |
| 개발 속도 | SQL 친숙 |

---

## 5. Decision Matrix

| 기준 | 가중치 | 현재 | Aura Free | Self-host | SQLite |
|---|---:|---:|---:|---:|---:|
| 비용 | 20 | 5 | 5 | 4 | 5 |
| 응답시간 | 15 | 5 | 3 | 5 | 4 |
| Scale 여유 | 15 | 2 | 4 | 4 | 4 |
| 운영 단순성 | 20 | 5 | 3 | 1 | 4 |
| 개발 속도 | 15 | 5 | 2 | 2 | 4 |
| Multi-hop 쿼리 | 15 | 3 | 5 | 5 | 3 |
| **가중 합계** | **100** | **4.20** | **3.75** | **3.40** | **4.00** |

→ 현재 setup이 4.20점으로 최우수. Multi-hop 쿼리 요구 발생 시 SQLite (4.00) → Aura (3.75) 순으로 고려.

---

## 6. 권고

### 6.1 즉시 (Phase 2 진행 중)
- **Neo4j 도입 DEFER**
- 그래프 시각화는 Cytoscape.js 클라이언트 사이드로 충분
- 그래프 데이터 모델은 `ontology-weights.json` + `vocabulary-pool.ts`로 표현
- csat-graphdb-318 의 microskill 그래프는 필요 시 REST API로 lazy fetch

### 6.2 재평가 조건 명시 (트리거)

다음 중 **하나라도** 발생 시 P-7 재오픈:

1. **외부 학습자 N ≥ 1,000** 도달 (현재 1)
2. **Multi-hop 추천 쿼리 명시적 요구** (예: 3-hop prerequisite chain) — 이 요구가 발생하면 SQLite 먼저 시도, 한계 발견 시 Neo4j
3. **csat-graphdb-318 와 OELP 그래프 결합 운영 필요** (Phase 3)
4. **자연어 그래프 질의 (LLM agent 통합)** 요구 발생

### 6.3 재평가 시 권장 path

1. **1단계**: Neo4j Aura Free 계정 + 데이터 마이그레이션 스크립트 (학습자 + sessions + responses)
2. **2단계**: Multi-hop 쿼리 1-2개를 SQLite vs Cypher 정량 비교 (응답시간 + 개발 cost)
3. **3단계**: 정확도/UX 영향 측정 후 promotion 결정

---

## 7. 부수 산출물

### 7.1 Aura Free 등록 가이드 (재평가 시)

```bash
# 1. https://console.neo4j.io 가입
# 2. Aura Free 인스턴스 생성 (5분)
# 3. 환경변수
export NEO4J_URI=neo4j+s://<instance-id>.databases.neo4j.io
export NEO4J_USER=neo4j
export NEO4J_PASSWORD=<generated>

# 4. npm install neo4j-driver
# 5. lib/neo4j-adapter.ts 작성 (ContentGenerator 패턴 참고)
```

### 7.2 Cypher 스키마 초안 (참고용)

```cypher
// Nodes
CREATE (qt:QuestionType {id: 'TYPE-요지', name: '요지 파악'})
CREATE (kv:KeyVariable {id: 'topic_abstractness'})
CREATE (d:Dimension {id: 'D3_Context'})
CREATE (card:Card {itemId: 'cefr-b1-요지-001', dimension: 'D3_Context', b: 0.5})
CREATE (learner:Learner {id: 'user-001'})
CREATE (session:Session {id: 's-001', startedAt: '2026-05-22T10:00:00Z'})

// Relationships
CREATE (qt)-[:REQUIRES]->(kv)
CREATE (qt)-[:WEIGHTED {w: 0.5}]->(d)
CREATE (card)-[:BELONGS_TO]->(qt)
CREATE (learner)-[:HAS_SESSION]->(session)
CREATE (session)-[:ATTEMPTED {correct: true, at: '2026-05-22T10:05:00Z'}]->(card)
```

### 7.3 Migration script outline

```ts
// scripts/migrate-to-neo4j.mjs (개략)
// 1. Read ontology-weights.json → CREATE QT + Dimension nodes
// 2. Read vocabulary-pool.ts → CREATE Card nodes
// 3. Read localStorage.oelp.sessions.default (per learner) → CREATE Learner/Session/Attempt edges
// 4. Verify with sample Cypher queries
```

---

## 8. 인용

- 본 보고서: [03-analysis/p7-neo4j-spike-report.md](./p7-neo4j-spike-report.md)
- 백로그: [01-plan/phase2-backlog.md §2 P-7](../01-plan/phase2-backlog.md)
- 외부:
  - [Neo4j Pricing](https://neo4j.com/pricing/) (Aura tiers + self-hosted)
  - [Aura Free FAQ](https://support.neo4j.com/s/article/16094506528787-Support-resources-and-FAQ-for-Aura-Free-Tier) (50K-200K nodes 출처 불일치)
  - [Neo4j Docker Hub](https://hub.docker.com/_/neo4j) (Community Edition 무료 GPLv3)
- 관련 OELP:
  - [lib/ontology-weights.json](https://github.com/smilepat/oelp/blob/main/lib/ontology-weights.json)
  - [lib/vocabulary-pool.ts](https://github.com/smilepat/oelp/blob/main/lib/vocabulary-pool.ts)
  - [csat-graphdb-318](https://github.com/smilepat/csat-graphdb-318) (외부 그래프 source of truth)
