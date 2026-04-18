# Home Page And Studio Shell

## 관련 파일

- [app/page.tsx](/mnt/d/Agentic-TTS-Studio/app/page.tsx)
- [components/studio-shell.tsx](/mnt/d/Agentic-TTS-Studio/components/studio-shell.tsx)
- [app/globals.css](/mnt/d/Agentic-TTS-Studio/app/globals.css)
- [lib/constants.ts](/mnt/d/Agentic-TTS-Studio/lib/constants.ts)

## 메인 페이지 구조

[app/page.tsx](/mnt/d/Agentic-TTS-Studio/app/page.tsx)는 매우 짧지만 중요한 파일입니다.

이 파일은 다음 일을 합니다.

1. 서버에서 현재 런타임 상태를 가져온다
2. 그 값을 `StudioShell` 컴포넌트에 전달한다

즉 이 파일은 "페이지 진입점"입니다.

## 왜 `app/page.tsx`가 서버 컴포넌트인가

이 파일에는 `"use client"`가 없습니다.

그래서 Next.js는 이 파일을 서버 컴포넌트로 취급합니다.

이 방식의 장점:

- 초기 렌더 전에 서버에서 데이터를 가져올 수 있음
- 브라우저로 불필요한 코드가 덜 내려감

이 프로젝트에서는 `getRuntimeHealth()`를 서버에서 먼저 호출하는 것이 자연스럽습니다.

## `StudioShell`은 무엇을 하나

[components/studio-shell.tsx](/mnt/d/Agentic-TTS-Studio/components/studio-shell.tsx)는 실제 화면 대부분을 담당합니다.

여기에는 다음이 들어 있습니다.

- 환영 메시지
- 런타임 상태 카드
- 문서 링크 사이드바
- 채팅 기록 표시
- 프롬프트 입력창
- 전송 버튼

즉 "사용자가 직접 보는 거의 모든 것"이 여기 있습니다.

## 왜 `"use client"`가 필요한가

`StudioShell` 맨 위에는 `"use client"`가 있습니다.

이 뜻은:

- 이 컴포넌트는 브라우저에서 실행됩니다
- `useState`, `useMemo`, `useTransition` 같은 React hook을 사용할 수 있습니다

채팅 입력, 버튼 클릭, fetch 요청은 브라우저 상호작용이므로 클라이언트 컴포넌트가 맞습니다.

## 상태(state)는 어떻게 나뉘어 있나

`StudioShell`의 상태를 보면 이 컴포넌트가 무엇을 책임지는지 알 수 있습니다.

- `messages`
  대화 기록
- `prompt`
  현재 입력창 텍스트
- `voiceHint`
  사용자가 선택한 음성 힌트
- `isPending`
  서버 요청 진행 중 여부

이 네 가지를 보면, 이 컴포넌트의 역할이 "채팅 UX 관리"라는 점이 분명해집니다.

## 요청 전송 흐름

`handleSubmit()`는 다음 순서로 동작합니다.

1. 기본 form 제출 동작을 막는다
2. 빈 입력은 무시한다
3. 사용자 메시지를 `messages`에 먼저 추가한다
4. 입력창을 비운다
5. `/api/chat`으로 요청을 보낸다
6. 응답을 assistant 메시지로 추가한다

이 흐름은 채팅 UI의 기본 패턴입니다.

## 스타일 파일은 왜 따로 두나

[app/globals.css](/mnt/d/Agentic-TTS-Studio/app/globals.css)는 전역 스타일입니다.

여기에는 다음이 들어 있습니다.

- 색상 변수
- 레이아웃
- 카드 스타일
- 말풍선 스타일
- 모바일 반응형 규칙

초심자 관점에서 중요한 점:

전역 스타일은 "앱 전체에 공통으로 적용되는 것"을 넣는 곳입니다.

## 이 구조가 주는 장점

- 서버 데이터 로딩과 브라우저 상호작용이 분리됩니다.
- 메인 페이지는 짧고 읽기 쉽습니다.
- 실제 UI 복잡도는 `StudioShell`에 모아서 관리합니다.
