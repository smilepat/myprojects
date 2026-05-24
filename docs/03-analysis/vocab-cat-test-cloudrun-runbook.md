# vocab-cat-test Cloud Run 배포 → OELP 연결 Runbook

> 선행:
> - [vocab-cat-test-integration-resolved.md](./vocab-cat-test-integration-resolved.md) (로컬 통합 완료)
> - [vercel-deployment-runbook.md](./vercel-deployment-runbook.md) (OELP Vercel 배포 완료)
> Status: OELP `/diagnose` 의 AdaptiveDiagnostic 컴포넌트가 Production에서도 작동하려면 backend가 외부 URL 필요
> Owner action: Cloud Run 1회 배포 + Vercel env 갱신 = 본인 약 30분

---

## 0. 무엇이 풀리는가

본 runbook 완료 시:
- **OELP Production**(Vercel)에서 적응형 진단 동작
- 외부 사용자가 접근 가능한 vocab-cat-test FastAPI URL 확보
- AdaptiveDiagnostic 컴포넌트의 amber "백엔드 미연결" 경고 → 실제 동작으로 전환

---

## 1. Pre-flight (5분)

| Step | 명령 | 기대 |
|---|---|---|
| 1.1 | `gcloud --version` | `Google Cloud SDK 4xx.x.x` |
| 1.2 | `gcloud auth list` | 활성 계정 확인 |
| 1.3 | `gcloud config get-value project` | GCP 프로젝트 ID |
| 1.4 | Vercel 프로젝트 OELP URL 보유 | https://oelp-XXX.vercel.app |

gcloud 미설치: https://cloud.google.com/sdk/docs/install → 설치 후 `gcloud init`.

GCP 프로젝트 없으면 https://console.cloud.google.com/ 에서 신규 생성 (무료, 카드 인증 필요).

---

## 2. vocab-cat-test 측 작업 (15분)

**상세는 [smilepat/vocab-cat-test/CLOUD_RUN_DEPLOYMENT.md](https://github.com/smilepat/vocab-cat-test/blob/main/CLOUD_RUN_DEPLOYMENT.md) 참조.** 핵심 명령만 발췌:

```powershell
cd C:\tmp\vocab-cat-test

# 2.1 API 활성화
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 2.2 빌드
$PROJECT = gcloud config get-value project
gcloud builds submit --tag "gcr.io/$PROJECT/vocab-cat-api" .

# 2.3 배포 (PORT=8080 표준)
gcloud run deploy vocab-cat-api `
  --image "gcr.io/$PROJECT/vocab-cat-api" `
  --platform managed `
  --region asia-northeast3 `
  --allow-unauthenticated `
  --set-env-vars "ALLOWED_ORIGINS=https://oelp-XXX.vercel.app,http://localhost:3000,http://localhost:3001" `
  --memory 512Mi `
  --cpu 1
```

→ 마지막 출력에 `Service URL: https://vocab-cat-api-XXX-an.a.run.app` 표시. 복사.

**⚠ ALLOWED_ORIGINS는 본인 Vercel URL을 그대로 입력**. 와일드카드 사용 시 보안 약함.

---

## 3. 헬스 체크 (2분)

```powershell
$URL = "https://vocab-cat-api-XXX-an.a.run.app"  # §2.3에서 복사한 값
curl "$URL/health"
```

기대: `{"status":"healthy","vocab_count":9183,...}`

응답 없으면:
- `gcloud run services logs read vocab-cat-api --limit 50`
- 메모리 부족 (Out of Memory): `--memory 1Gi` 로 재배포
- Cold start: 첫 호출 4-8초 정상 (재시도)

---

## 4. OELP-측 verify (5분)

로컬에서 production URL 직접 검증:

```powershell
cd C:\tmp\oelp
$env:VOCAB_CAT_TEST_URL="https://vocab-cat-api-XXX-an.a.run.app"
node scripts/verify-vocab-cat-test.mjs
```

기대 출력 (로컬 versus 동일):
```
[OK] health — vocab_count=9183 version=0.2.0
[OK] session started — id=XXX initial θ=0.5
[OK] adaptive CAT — N items, accuracy=X% θ=X.X SE=X.X
[OK] results — θ=X.X CEFR=X reason=convergence
[OK] T1.3 DiagnosticInput schema validation passed
✓ vocab-cat-test integration verified end-to-end
```

실패 시 §3 헬스 로그 + ALLOWED_ORIGINS env 확인.

---

## 5. Vercel env var 갱신 (3분)

OELP의 Vercel 프로젝트에서:
1. https://vercel.com/dashboard → OELP 프로젝트 → Settings → **Environment Variables**
2. 기존 `NEXT_PUBLIC_VOCAB_CAT_TEST_URL` 항목 편집 (또는 신규 추가)
3. Value: `https://vocab-cat-api-XXX-an.a.run.app` (Cloud Run URL)
4. Apply to: **Production**, **Preview**, **Development** 모두 체크
5. **Save**
6. Deployments 탭 → 최신 main 배포 → 우상단 **"..."** → **Redeploy** (env 변경은 재배포 필요)

재배포 ~2분 대기.

---

## 6. Production 검증 (3분)

```powershell
# Production OELP URL 열기
start https://oelp-XXX.vercel.app/diagnose
```

브라우저에서:
- 페이지 상단 amber "백엔드 미연결" 안내 **사라짐** 확인
- "실제 적응형 진단" 섹션의 **"진단 시작 →"** 버튼 클릭 가능
- 첫 문항 표시 → 정답 클릭 → 다음 문항 → ... → 종료
- 종료 시 "활성 진단" 으로 자동 설정 → `/queue` 이동 시 사용 중

추가 자동 검증:
```powershell
# OELP 측 weekly smoke test (이미 CI에 깔려 있음) 수동 트리거
gh workflow run vocab-cat-test-smoke.yml -R smilepat/oelp
gh run watch -R smilepat/oelp
```

Action 통과하면 매주 일요일 03:00 UTC 자동 회귀 감지 시작.

---

## 7. 비용 / 한계 (참고)

Cloud Run 무료 한도:
- 월 200만 요청
- 360,000 GB-초 메모리
- 180,000 vCPU-초

대시보드 모니터링 권장:
```
https://console.cloud.google.com/run/detail/asia-northeast3/vocab-cat-api/metrics
```

본인 1인 + 지인 1-3명 dogfooding 부담은 무료 한도 안에 충분. 외부 학습자 10명 이상 시 비용 발생 가능.

---

## 8. Rollback

문제 시:
1. Vercel: 이전 deployment 로 promote (env var 변경 즉시 무효화)
2. Cloud Run: 이전 revision 활성화
   ```powershell
   gcloud run services update-traffic vocab-cat-api --to-revisions=PREVIOUS=100
   ```
3. 임시 해제: Vercel env var 삭제 → OELP는 자동 amber 안내 + Preset/Paste fallback

---

## 9. 본 통합 완료 시 영향

| 항목 | Before | After |
|---|---|---|
| OELP Production AdaptiveDiagnostic | amber 안내만 | 실제 25-40문항 CAT |
| C1.2 측정 환경 | 로컬 본인만 | 외부 사용자도 가능 |
| Phase 2 v2 Stage B2 | ⏳ | ✅ |
| Phase 2 v2 Stage C 활성화 조건 | 채널 부재 | 채널 1개 확보 |

→ OELP가 **외부 학습자 1명만 확보하면 즉시 dogfooding 가능한 시스템**이 됩니다.

---

## 10. 변경 이력

- 2026-05-23 작성: Cloud Run + OELP env var 연결 30분 runbook (Claude)
- **2026-05-24 Resolved**: Cloud Run 배포 + Vercel env var 연결 완료 (smilepat 위임, Claude 실행)
  - Cloud Run URL: `https://vocab-cat-api-452237528328.asia-northeast3.run.app`
  - GCP project: `gen-lang-client-0081580267`
  - Region: `asia-northeast3` (Seoul)
  - Memory: 1Gi, CPU: 1, allow-unauthenticated
  - ALLOWED_ORIGINS: `https://oelp-phi.vercel.app,http://localhost:3000,http://localhost:3001`
  - End-to-end verify: 7/7 PASS (vocab_count=9183, θ=2.33, SE=0.33, 40 items adaptive CAT)
  - Vercel env `NEXT_PUBLIC_VOCAB_CAT_TEST_URL` added (Production + Development)
  - Vercel redeploy `oelp-c4nxux4lb` aliased to `oelp-phi.vercel.app`
  - Production /diagnose: fallback panel 해제 확인 ("실제 적응형 진단" 활성)
  - 빌드/배포 디버깅 fix: `--set-env-vars "^|^KEY=v1,v2,v3"` (콤마 escape용 custom delimiter)
