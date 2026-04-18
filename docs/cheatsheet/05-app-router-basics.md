# App Router Basics

## App Router는 왜 중요한가

Next.js를 배우는 초심자가 가장 먼저 익혀야 하는 개념 중 하나가 App Router입니다.

왜냐하면 App Router를 이해해야:

- 페이지가 어디서 만들어지는지
- API가 어디에 있는지
- URL과 파일 경로가 어떻게 연결되는지

를 이해할 수 있기 때문입니다.

## 기본 규칙

`app/` 폴더 아래의 파일은 라우팅 규칙을 가집니다.

예:

- `app/page.tsx` -> `/`
- `app/about/page.tsx` -> `/about`
- `app/api/chat/route.ts` -> `/api/chat`

## `page.tsx`

페이지 UI를 렌더링합니다.

사용자가 브라우저에서 보는 화면입니다.

## `route.ts`

서버 API입니다.

JSON을 반환하거나 파일을 반환할 수 있습니다.

## 동적 경로

`[id]`처럼 대괄호를 쓰면 동적 파라미터를 받을 수 있습니다.

예:

- `app/api/audio/[id]/route.ts`

이 파일은 `/api/audio/123`, `/api/audio/abc` 같은 경로를 처리할 수 있습니다.

## catch-all 경로

`[...slug]`는 여러 단계 경로를 모두 받는 문법입니다.

예:

- `/docs/cookbook/00-index.md`
- `/docs/cheatsheet/01-javascript-basics.md`

둘 다 한 파일에서 받을 수 있습니다.

## 이 프로젝트에서 어떻게 쓰였나

이 프로젝트는 App Router를 다음처럼 사용합니다.

- 메인 홈 화면
- chat API
- health API
- audio API
- docs browser

즉 App Router의 장점을 고루 사용하고 있습니다.
