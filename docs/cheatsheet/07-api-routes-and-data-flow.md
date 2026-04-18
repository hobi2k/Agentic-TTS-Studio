# API Routes And Data Flow

## API route란 무엇인가

API route는 브라우저가 서버에게 데이터를 요청하는 창구입니다.

이 프로젝트에서 가장 중요한 API는 `/api/chat`입니다.

## 데이터 흐름을 한 번에 보기

```text
사용자 입력
  -> 브라우저의 fetch("/api/chat")
  -> Next.js route.ts
  -> 입력 검증
  -> 에이전트 실행
  -> JSON 응답
  -> 브라우저 상태 업데이트
```

## 왜 이 흐름을 알아야 하나

초심자는 종종 "버튼을 누르면 그냥 뭔가 된다"고 느끼기 쉽습니다.

하지만 실제 앱은 여러 단계를 거칩니다.

각 단계를 이해해야:

- 버그를 찾을 수 있고
- 어디를 고쳐야 할지 알 수 있습니다

## `/api/chat`

역할:

- 요청 JSON 수신
- schema 검증
- agent 함수 호출
- 결과 JSON 반환

## `/api/health`

역할:

- 현재 런타임 상태 확인

## `/api/audio/:id`

역할:

- 생성된 오디오 파일을 브라우저에 전달

이 route 덕분에 `<audio src="/api/audio/xxx">`가 동작합니다.
