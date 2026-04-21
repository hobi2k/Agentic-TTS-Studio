# Next.js App Router

## 이 문서의 목적

이 문서는 "Next.js App Router가 처음인 사람"이 이 프로젝트의 `frontend/app/` 폴더를 이해하도록 돕습니다.

## App Router란 무엇인가

Next.js의 App Router는 `app/` 폴더 기준으로 페이지와 서버 라우트를 만드는 방식입니다.

쉽게 말하면:

- 파일을 만들면
- 그 파일이 URL이 됩니다

예를 들어 이 프로젝트에서는:

- [app/page.tsx](/home/hosung/pytorch-demo/Agentic-TTS-Studio/frontend/app/page.tsx) -> `/`
- [app/docs/[...slug]/page.tsx](/home/hosung/pytorch-demo/Agentic-TTS-Studio/frontend/app/docs/[...slug]/page.tsx) -> `/docs/...`

## `page.tsx`와 `route.ts`의 차이

### `page.tsx`

사용자가 브라우저로 보는 화면입니다.

예:

- 메인 홈페이지
- 문서 페이지

현재 이 저장소에서는 프런트엔드 App Router를 화면 전용으로 쓰고, 애플리케이션 API는 `backend/`의 NestJS가 맡습니다.

## `layout.tsx`는 무엇인가

[app/layout.tsx](/home/hosung/pytorch-demo/Agentic-TTS-Studio/frontend/app/layout.tsx)는 앱의 공통 껍데기입니다.

여기서 하는 일:

- `<html>`과 `<body>` 정의
- 전역 CSS 연결
- 메타데이터 설정

모든 페이지는 이 레이아웃 안에서 렌더링됩니다.

## 왜 이 프로젝트에 App Router가 잘 맞는가

이 프로젝트는 단순 블로그가 아니라, 다음 요소가 동시에 필요합니다.

- 메인 UI
- 문서 브라우저
- 오디오 재생 UI
- 백엔드 API 호출

App Router는 이런 “화면 중심 프런트엔드”를 깔끔하게 구성하기 좋습니다.

중요한 점:

- 화면 URL은 `frontend/app`이 담당
- 실제 API URL은 `backend/src`가 담당

즉 이 프로젝트는 Next.js 단일 앱이 아니라 "Next.js 프런트엔드 + NestJS 백엔드" 조합입니다.

## 코드 읽기 팁

App Router를 읽을 때는 항상 이렇게 보세요.

1. 이 파일은 `page.tsx`인가
2. 그렇다면 이 파일은 어떤 화면 URL이 되는가
3. 이 화면은 어느 컴포넌트를 렌더링하는가
4. 이 화면이 호출하는 실제 API는 `frontend/lib/api.ts`에서 어디를 보는가

이 기준만 잡혀도 처음 읽을 때 훨씬 덜 헷갈립니다.
