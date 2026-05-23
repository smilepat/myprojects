# Vercel 배포 Runbook — OELP V1 (30분, 1회)

> 선행: [vocab-cat-test-integration-resolved.md](./vocab-cat-test-integration-resolved.md) (완료 권장 — 통합 backend는 Cloud Run 별도 배포)
> Status: smilepat/oelp 측 100% 배포 준비됨 ([f9e5874](https://github.com/smilepat/oelp/commit/f9e5874) 기준)
> Owner action: Vercel 계정 + 본 runbook 1회 실행 (대부분 클릭)

---

## 0. 무엇이 풀리는가

본 runbook 완료 시:
- OELP **외부 접근 URL** (`https://oelp-*.vercel.app`) 1개 확보
- 본인 외 사용자가 한 명이라도 클릭 가능 → Stage C(외부 학습자 의존 항목) 활성화 가능
- PR마다 자동 Preview 배포 (vocabulary-db 마운트 없는 환경에서 동작 검증)
- Production 배포는 main branch push 시 자동
- Vercel Analytics (선택): 사용자 행동 정량 데이터 시작점

---

## 1. Pre-flight (3분)

| Step | 명령/확인 | 기대 |
|---|---|---|
| 1.1 | https://vercel.com/signup | Vercel 계정 (GitHub 계정 sign-in 권장) |
| 1.2 | https://github.com/smilepat/oelp | 레포 접근 권한 (본인 소유) |
| 1.3 | `git status` (smilepat/oelp dir에서) | clean — 미커밋 변경 없음 |
| 1.4 | `npm run build` (로컬) | ✓ 9 routes 정적 생성 |

---

## 2. Vercel 프로젝트 연결 (5분, 클릭)

### 2.1 Import Repository
1. https://vercel.com/new 접속
2. "Import Git Repository" → smilepat 검색 → **smilepat/oelp** 선택 → "Import"

### 2.2 Configure Project
- **Project Name**: `oelp` (기본값)
- **Framework Preset**: Next.js (자동 감지)
- **Root Directory**: `./`
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값, 변경 X)
- **Install Command**: `npm ci` (기본값)

### 2.3 Environment Variables — **중요**
이 단계에서 다음 추가:

| Key | Value | 적용 환경 |
|---|---|---|
| `NEXT_PUBLIC_VOCAB_CAT_TEST_URL` | (비워둠) | Production, Preview, Development |

→ Production 환경에서 vocab-cat-test backend Cloud Run 배포 전까지는 비워두면 AdaptiveDiagnostic이 graceful 경고 표시. Preset/Paste 진단은 backend 무관하게 동작.

**그 외 env vars**:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 본 Phase 1에서 미사용 → 비워둠 가능
- 분석/Sentry 키: 없으면 자동 비활성화

### 2.4 Deploy
- "Deploy" 버튼 → 첫 빌드 약 2-3분
- 완료 시 `https://oelp-XXX.vercel.app` URL 자동 생성
- "Visit" 클릭 → 랜딩 페이지 확인

---

## 3. 검증 (5분)

배포 URL에서:

| 경로 | 기대 |
|---|---|
| `/` | 5개 feature 카드 표시 |
| `/diagnose` | preset α/β/γ/δ 4개 카드 + AdaptiveDiagnostic 안내 (env var 미설정 시 amber 경고) |
| `/map` | Cytoscape 그래프 렌더링 |
| `/queue` | "활성 진단 없음" 또는 preset 사용 시 큐 표시 |
| `/sessions` | 빈 상태 (localStorage 새 도메인) |
| `/regression-history` | 5 events 카드 |

빠른 mobile 확인: `https://oelp-XXX.vercel.app` 을 폰 브라우저로 열기 → 5 routes 모두 작동.

---

## 4. Custom Domain (선택, 5분)

본인 도메인 보유 시:
1. Vercel 프로젝트 → Settings → Domains
2. `oelp.smilepat.com` 등 입력
3. DNS A/CNAME 레코드 설정 (Vercel이 안내)
4. 자동 SSL (Let's Encrypt)

도메인 없으면 Vercel 기본 URL (`oelp-XXX.vercel.app`) 그대로 사용.

---

## 5. CI 연결 (이미 됨)

- 모든 PR → Vercel이 자동 Preview URL 생성
- main 브랜치 push → Vercel이 자동 Production 배포
- pr-check.yml의 Vitest/coverage/build gate가 먼저 통과해야 Vercel 배포 진행

본인이 손댈 일 없음.

---

## 6. Analytics (선택, 추후)

Vercel Analytics를 켜면:
- 페이지뷰, 라우트별 방문
- Core Web Vitals (LCP, CLS, INP)
- 무료 (월 2,500 events)

`npm install @vercel/analytics` + `app/layout.tsx`에 `<Analytics />` 추가 → 본인이 결정 후 진행. 본 단계는 외부 사용자 ≥ 1명 확보 후가 의미 있음.

---

## 7. vocab-cat-test backend Cloud Run 배포 (선택, 30분)

**Phase 1 V1 출시에는 필수 아님**. AdaptiveDiagnostic 컴포넌트는 backend 없으면 amber 안내 + Preset/Paste 진단으로 fallback.

진행하려면:
1. `cd C:\tmp\vocab-cat-test`
2. `vercel.json` 또는 `CLOUD_RUN_DEPLOYMENT.md` 참고 (레포에 이미 있음)
3. Cloud Run에 deploy → `https://vocab-cat-test-XXX.run.app` URL 확보
4. Vercel OELP 프로젝트 Settings → Environment Variables → `NEXT_PUBLIC_VOCAB_CAT_TEST_URL` 갱신
5. Vercel redeploy → AdaptiveDiagnostic 활성화

(이 단계는 별도 1시간 runbook 필요 시 본인 요청 시 Claude가 작성)

---

## 8. 배포 후 본 문서 갱신 (1분)

배포 URL 확보 시:
```bash
cd /c/tmp/myprojects
# docs/03-analysis/vercel-deployment-runbook.md 끝에 "Resolved 2026-05-XX, URL=..." 추가
git add docs/03-analysis/
git commit -m "docs: Vercel deployment resolved (URL recorded)"
git push
```

myprojects 메인 README + smilepat/oelp README에도 URL 추가 권장.

---

## 9. 실패 시 Rollback

Vercel 배포가 OELP의 무엇이라도 깨면:
- Vercel 프로젝트 → Deployments → 이전 배포 → "Promote to Production"
- 또는 main 브랜치에 revert commit push → 자동 재배포

본인 환경 영향 없음 (Vercel은 git push trigger).

---

## 10. 이 한 가지가 풀리면

- **Stage C 활성화 가능**: phase2-backlog-v2.md의 학습자 채널 의존 항목 (P-3 Phonics, P-5 Teacher Dashboard) 시도 시작
- **외부 dogfooding** 모집 가능 — 1-3명 지인에게 URL 공유
- **K5 KPI 트래킹 시작**: 외부 학습자 ≥ 1명 확보 진행도
- **모바일 실험**: PWA install banner 추가 후 모바일 진단 dogfooding

→ 본인 30분 × 1회 = **OELP가 외부 세계에 노출 가능한 시스템으로 전환**.

---

## 11. 변경 이력

- 2026-05-23 작성: Vercel 배포 단계 + Cloud Run 후속 + Rollback (Claude)
- 본인 실행 시 §8 절차로 resolved 표시
