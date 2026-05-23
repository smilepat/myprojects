# vocab-cat-test 통합 — 1시간 Runbook

> 선행: [vocab-cat-test-integration-blocker.md](./vocab-cat-test-integration-blocker.md) (2026-05-22)
> Status: ✅ smilepat/oelp 측은 100% 준비됨 (verify-vocab-cat-test.mjs 추가 됨)
> Owner action: Docker Desktop 설치 + 본 runbook 1회 실행

본 문서는 **본인이 30-60분 안에 끝낼 수 있게** 모든 명령과 예상 출력을 표시합니다. 각 단계마다 "이 결과가 나와야 합니다" 라인이 있습니다. 안 나오면 멈추고 다음 단계로 가지 마세요.

---

## 0. Pre-flight (5분)

| Step | 명령 | 예상 출력 |
|---|---|---|
| 0.1 | `docker --version` | `Docker version 24.x.x` 이상 |
| 0.2 | `docker compose version` | `Docker Compose version v2.x.x` 이상 |
| 0.3 | `gh auth status` | `Logged in to github.com as smilepat` |
| 0.4 | `wsl --status` (Windows만) | `WSL version: 2.x` |
| 0.5 | 디스크 여유 ≥ 5GB | `df -h /c` (PowerShell: `Get-PSDrive C`) |

**0.1이 실패하면**: https://www.docker.com/products/docker-desktop → 설치 → 재부팅 → Docker Desktop 실행 (system tray에 고래 아이콘 떠야 함) → `docker --version` 재시도.

WSL2 백엔드를 묻는 다이얼로그 나오면 "WSL2 사용" 선택. 초기 다운로드 ~500MB.

---

## 1. Sibling clone (3분)

```bash
cd C:/tmp
gh repo clone smilepat/vocab-cat-test
gh repo clone smilepat/vocabulary-db   # 이미 있으면 skip
```

**예상**: `C:/tmp/vocab-cat-test/`, `C:/tmp/vocabulary-db/`, `C:/tmp/oelp/` 세 폴더가 sibling으로 존재.

---

## 2. docker compose 기동 (10분 첫회, 이후 1분)

```bash
cd C:/tmp/oelp
docker compose up -d vocab-cat-test
```

**첫 실행 시**: Python 이미지 다운로드 + dependency install로 5-8분.
**예상 출력**:
```
[+] Running 1/1
 ✔ Container oelp-vocab-cat-test-1 Started
```

확인:
```bash
docker compose ps
```
→ vocab-cat-test 상태 `running` + 포트 `0.0.0.0:8000->8000/tcp`.

**문제 발생 시**:
- "no such service": `docker-compose.yml` 이 OELP 루트에 있는지 확인
- "port already in use": 8000 점유 프로세스 확인 (`netstat -ano | findstr :8000`)
- "build failed": 로그 확인 `docker compose logs vocab-cat-test`

---

## 3. Health check (1분)

```bash
curl http://localhost:8000/health
```
**예상**: `{"status":"ok"}` 또는 유사 JSON.

PowerShell:
```powershell
Invoke-RestMethod http://localhost:8000/health
```

응답 없으면 §2의 컨테이너 로그 확인.

---

## 4. 자동 검증 스크립트 (2분)

```bash
cd C:/tmp/oelp
node scripts/verify-vocab-cat-test.mjs
```

**예상**:
```
[OK] health check → 200
[OK] diagnose endpoint → DiagnosticInput contract pass
[OK] 5D fields present
[OK] schema validation: schemas/diagnostic-input.schema.json
✓ vocab-cat-test integration verified — C1.2 ready for measurement
```

스크립트는 다음을 자동 검사:
1. `/health` 응답 200
2. `/api/diagnose` POST → DiagnosticInput 컨트랙트 통과 (T1.3 schema 적용)
3. 5D dimensionScores 모두 존재
4. weakDim/strongDim arrays
5. (선택) theta 안정성 — 동일 입력 5회 호출 시 편차 ≤ 0.3 (C1.2)

---

## 5. OELP dev server 연결 (3분)

```bash
cd C:/tmp/oelp
echo 'NEXT_PUBLIC_VOCAB_CAT_TEST_URL=http://localhost:8000' > .env.local
npm run dev
```

브라우저 → http://localhost:3000/diagnose →
- preset 4종 외에 **"실제 진단 시작"** 버튼 활성화됨 (TODO: UI 패치 필요 — §7 참조)
- 호출 시 vocab-cat-test가 적응형 CAT 진단 수행 → DiagnosticInput 반환

---

## 6. 통합 결과 commit (5분)

본 runbook 완료 시:

```bash
# myprojects 레포에서
cd C:/tmp/myprojects
mv docs/03-analysis/vocab-cat-test-integration-blocker.md \
   docs/03-analysis/vocab-cat-test-integration-resolved.md
# 본 runbook 옆에 resolved 노트 추가
git add docs/03-analysis/
git commit -m "docs: vocab-cat-test integration resolved (1h runbook executed)"
git push
```

OELP W12 평가도 갱신:
```bash
cd C:/tmp/myprojects
# docs/04-report/phase1-w12-c-criteria-evaluation.md 의 C1.2 표 갱신
# "functional PASS" → "measured PASS, theta variance N (P90)"
```

---

## 7. 남은 OELP 측 작업 (Claude가 할 수 있음)

본 runbook 완료 후 Claude에게 요청:
- [ ] `/diagnose` 페이지에 "실제 진단 시작" 버튼 추가 (현재 preset만 노출)
- [ ] verify-vocab-cat-test.mjs 결과를 `lib/integration-status.json`에 영구화
- [ ] CI에 vocab-cat-test 통합 smoke test 추가 (별도 workflow, 매주 1회)
- [ ] W12 평가 자동 갱신 스크립트

---

## 8. Rollback (만일을 위해)

본 통합이 OELP를 깨면:

```bash
cd C:/tmp/oelp
rm .env.local                           # 환경변수 제거
docker compose down vocab-cat-test     # 컨테이너 중지
npm run dev                            # OELP는 preset/demo로 정상 동작
```

OELP는 환경변수가 없으면 `fetchDiagnostic`이 throw하지만, 그 함수는 UI에서 호출되지 않습니다 (preset만 활성). 따라서 rollback이 100% 안전.

---

## 9. 영구 보존 가치

본 통합이 풀리면:
1. **C1.2 의미 측정**: theta 편차 ≤ 0.3 (P90) 실측 → Phase 1 완전 PASS
2. **dogfooding 진단 정밀화**: preset 4종 대신 adaptive CAT 25문항 → 실제 약점 식별
3. **vocab-cat-test 162 pytest의 가치 실현**: 현재 코드만 있고 OELP에서 사용 안 됨
4. **OELP "통합 레이어" 정체성 완성**: 분산 자산 → 단일 학습 경험의 마지막 missing piece

→ 본인 시간 1시간 × 1회 = **OELP 전체 PRD §B-2 페르소나 P0 진단 신뢰성 완성**.

---

## 10. 변경 이력

- 2026-05-23 작성: blocker 문서 위에 step-by-step runbook 추가 (Claude)
- 본인 실행 완료 시 §6 절차로 resolved 문서로 promote
