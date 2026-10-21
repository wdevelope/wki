# WKI 단어장

[NGSL](https://www.newgeneralservicelist.com/new-general-service-list) 2,809 단어를 간격 반복(FSRS)으로 외우는 개인용 PWA입니다. 서버 없이 브라우저(IndexedDB)에만 기록을 저장하고, 설치하면 오프라인에서도 동작합니다.

## 기능

- **오늘의 학습**: 기한이 된 복습 카드를 먼저, 그다음 새 카드를 빈도 순위 순으로 보여 줍니다. 하루 새 카드 수는 기본 30개입니다.
- **카드**: 앞면에는 단어와 발음 버튼이 있습니다. 탭하면 뒷면에 뜻, 예문(해당 단어 강조), 예문 해석이 나옵니다.
- **평가**: Again / Hard / Good / Easy 버튼마다 다음 복습까지의 간격을 미리 보여 줍니다.
- **진행 현황**: 오늘 학습 수, 누적 학습 단어 수, 연속 학습 일수를 보여 줍니다.
- **설정**: 하루 새 카드 수, 시작 순위, 발음 자동 재생을 바꿀 수 있습니다.
- **백업**: 설정과 학습 기록 전체를 JSON으로 내보내고 가져옵니다.
- 날짜 기준은 Asia/Seoul(자정)입니다. 다크 모드는 시스템 설정을 따릅니다.

## 개발

Node.js 22.12 이상이 필요합니다.

```bash
npm install
npm run dev      # data/ngsl.csv → public/ngsl.json 변환 후 개발 서버
npm test         # Vitest (CSV 변환, 일정 계산, 큐, 날짜, 강조, 백업 검증)
npm run build    # 타입 검사 + 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 확인
```

| 경로 | 내용 |
|---|---|
| `data/ngsl.csv` | 원본 단어 데이터 (순위, 단어, 뜻, 예문, 예문 해석) |
| `scripts/build-ngsl.ts` | CSV를 `public/ngsl.json`으로 변환 (빌드 산출물, 커밋하지 않음) |
| `src/lib/` | 순수 로직: CSV 파싱, FSRS 래퍼, 학습 큐, KST 날짜, 예문 강조, 백업 검증 |
| `src/db/` | Dexie 스키마, 첫 실행 단어 적재, 조회 훅, 저장 액션, 백업 |
| `src/screens/` | 오늘, 학습, 설정 화면 |

## 배포

`main` 브랜치에 push하면 GitHub Actions가 테스트와 빌드를 거쳐 GitHub Pages에 배포합니다. 처음 한 번은 저장소의 **Settings → Pages → Source**를 **GitHub Actions**로 바꿔야 합니다.

Vite `base`와 PWA `scope`/`start_url`은 저장소 이름에 맞춰 `/wki/`로 설정되어 있습니다. 저장소 이름을 바꾸면 `vite.config.ts`의 `BASE`도 함께 바꾸세요.

## 출처와 라이선스

- **단어 목록**: [New General Service List (NGSL) 1.2](https://www.newgeneralservicelist.com/new-general-service-list), Browne, C., Culligan, B., & Phillips, J. 원본 목록은 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 라이선스를 따릅니다.
- **단어 데이터** (`data/ngsl.csv`, 생성되는 `ngsl.json`): 원본 목록에 한국어 뜻, 예문, 예문 해석을 더한 것으로, 같은 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 라이선스로 배포합니다.
- **코드**: [MIT](LICENSE)
