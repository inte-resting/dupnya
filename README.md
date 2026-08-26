# 덥냐?

미니앱 「덥냐?」와, 그 앱이 읽는 `data.json`을 만드는 GitHub Actions를
함께 담은 저장소입니다.

GitHub Actions가 10분마다 [Open-Meteo](https://open-meteo.com/)에서 도시 172곳의
현재 기온을 받아 `data.json` 한 파일로 굳힙니다. 앱은 그 파일만 읽습니다.
사용자가 몇 명이든 원본 API 호출량은 하루 720건으로 고정됩니다.

## 파일

| 파일 | 하는 일 |
|---|---|
| `index.html` | 앱 본체 |
| `cities.mjs` | 관측 대상 도시 목록. 세계 127곳 + 한국 45곳 |
| `fetch.mjs` | 기온을 받아 `data.json`으로 씁니다 |
| `.github/workflows/temps.yml` | 10분마다 `fetch.mjs`를 돌리고 커밋합니다 |
| `data.json` | 결과물. 앱이 읽는 유일한 파일 |

## 처음 설정

이 저장소는 `inte-resting/dupnya` 하나로 데이터 수집(`fetch.mjs`)과
앱(`index.html`)을 함께 둡니다. 앱의 `DATA_URL`은 `./data.json` 상대경로를 씁니다.

1. **공개(public) 저장소**입니다. 앱이 인증 없이 읽어가야 하니까요.
2. Settings → Actions → General → Workflow permissions 에서
   **Read and write permissions** 를 켜세요. 봇이 커밋을 못 하면 여기가 원인입니다.
3. Settings → Pages 에서 **Source: Deploy from a branch**, Branch: `main` / `(root)` 로 설정하세요.
4. Actions 탭 → temps → **Run workflow** 로 한 번 수동 실행해 `data.json`을 채우세요.
5. Pages가 배포되면 `https://inte-resting.github.io/dupnya/` 에서 앱이 뜹니다.

## data.json 모양

```json
{
  "at": "2026-08-26T10:23:11.000Z",
  "world": [["쿠웨이트시티, 쿠웨이트", 46.8], ["싱가포르", 30.2]],
  "korea": [["대구", 35.4], ["대관령", 20.8]]
}
```

앱은 이 모양만 압니다. 나중에 다른 기상 API로 갈아타더라도
`fetch.mjs`의 `fetchAll()` 안쪽만 바꾸면 앱은 손댈 필요가 없습니다.

## 알아둘 것

- 크론은 정각을 피해 3, 13, 23…분에 돌게 해두었습니다. GitHub 스케줄러가
  정각에 가장 붐비기 때문입니다. 그래도 혼잡하면 밀리거나 건너뛸 수 있어서
  앱은 "최근 확인 HH:mm"만 표시합니다.
- 수집 결과가 20% 이상 비면 실패시켜 직전 `data.json`을 지킵니다.
- Open-Meteo 데이터는 CC BY 4.0입니다. 앱 화면에 출처를 표기해야 합니다.
  무료 API 서비스 자체는 비상업 용도 조건이라, 광고를 붙이는 시점에는
  유료 플랜이나 다른 공급자로 옮겨야 합니다.
