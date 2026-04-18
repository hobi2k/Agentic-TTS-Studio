# Server Vs Client Components

## 이 개념이 왜 어려운가

Next.js를 처음 배우면 많은 사람이 이런 질문을 합니다.

"왜 어떤 파일에는 `use client`가 있고 어떤 파일에는 없나요?"

이 질문은 아주 중요합니다.

## 서버 컴포넌트

기본적으로 App Router의 컴포넌트는 서버 컴포넌트입니다.

특징:

- 서버에서 렌더링됨
- 브라우저 전용 hook 사용 불가
- 초기 데이터 로딩에 적합

예:

- [app/page.tsx](/mnt/d/Agentic-TTS-Studio/app/page.tsx)

## 클라이언트 컴포넌트

파일 맨 위에 `"use client"`를 쓰면 클라이언트 컴포넌트가 됩니다.

특징:

- 브라우저에서 실행됨
- `useState`, `useEffect`, `useTransition` 사용 가능
- 클릭, 입력, fetch 처리 가능

예:

- [components/studio-shell.tsx](/mnt/d/Agentic-TTS-Studio/components/studio-shell.tsx)

## 왜 둘을 나누나

모든 것을 클라이언트로 만들 수도 있지만, 그러면 브라우저에 불필요한 코드가 많이 내려갑니다.

반대로 모든 것을 서버로 만들 수도 없는데, 사용자 입력 처리와 버튼 클릭은 브라우저에서 일어나기 때문입니다.

그래서 역할을 나눕니다.

- 서버 컴포넌트: 초기 데이터 준비
- 클라이언트 컴포넌트: 상호작용 처리

## 초심자를 위한 기억법

- 클릭하고 입력 받고 상태 바꾸면 클라이언트
- 서버에서 먼저 데이터 준비하면 서버
