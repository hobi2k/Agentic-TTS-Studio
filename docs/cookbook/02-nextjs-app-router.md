# Next.js App Router

## 이 문서의 목적

이 문서는 "Next.js App Router가 처음인 사람"이 이 프로젝트의 `app/` 폴더를 이해하도록 돕습니다.

## App Router란 무엇인가

Next.js의 App Router는 `app/` 폴더 기준으로 페이지와 서버 라우트를 만드는 방식입니다.

쉽게 말하면:

- 파일을 만들면
- 그 파일이 URL 또는 서버 엔드포인트가 됩니다

예를 들어 이 프로젝트에서는:

- [app/page.tsx](/mnt/d/Agentic-TTS-Studio/app/page.tsx) -> `/`
- [app/api/chat/route.ts](/mnt/d/Agentic-TTS-Studio/app/api/chat/route.ts) -> `/api/chat`
- [app/api/health/route.ts](/mnt/d/Agentic-TTS-Studio/app/api/health/route.ts) -> `/api/health`
- [app/api/audio/[id]/route.ts](/mnt/d/Agentic-TTS-Studio/app/api/audio/[id]/route.ts) -> `/api/audio/:id`
- [app/docs/[...slug]/page.tsx](/mnt/d/Agentic-TTS-Studio/app/docs/[...slug]/page.tsx) -> `/docs/...`

## `page.tsx`와 `route.ts`의 차이

### `page.tsx`

사용자가 브라우저로 보는 화면입니다.

예:

- 메인 홈페이지
- 문서 페이지

### `route.ts`

브라우저에 JSON이나 파일을 반환하는 서버 엔드포인트입니다.

예:

- 채팅 요청 처리
- 헬스체크
- 오디오 바이너리 반환

즉:

- `page.tsx`는 HTML/React UI
- `route.ts`는 API

## `layout.tsx`는 무엇인가

[app/layout.tsx](/mnt/d/Agentic-TTS-Studio/app/layout.tsx)는 앱의 공통 껍데기입니다.

여기서 하는 일:

- `<html>`과 `<body>` 정의
- 전역 CSS 연결
- 메타데이터 설정

모든 페이지는 이 레이아웃 안에서 렌더링됩니다.

## 왜 이 프로젝트에 App Router가 잘 맞는가

이 프로젝트는 단순 블로그가 아니라, 다음 요소가 동시에 필요합니다.

- 메인 UI
- 채팅 API
- 런타임 상태 API
- 생성 오디오 파일 제공
- 문서 브라우저

App Router는 이런 “화면 + 서버 기능” 조합을 한 저장소 안에서 자연스럽게 다루기 좋습니다.

## 코드 읽기 팁

App Router를 읽을 때는 항상 이렇게 보세요.

1. 이 파일은 `page.tsx`인가 `route.ts`인가
2. 그렇다면 이 파일은 화면인가 API인가
3. URL은 무엇이 되는가
4. 누가 이 파일을 호출하는가

이 기준만 잡혀도 처음 읽을 때 훨씬 덜 헷갈립니다.
