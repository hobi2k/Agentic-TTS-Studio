# Backend API Ownership

## 이 문서의 목적

이 문서는 현재 저장소에서 "누가 화면을 맡고, 누가 API를 맡는가"를 가장 먼저 분명하게 설명하기 위한 문서입니다.

초심자가 가장 많이 헷갈리는 부분이 바로 이것입니다.

- Next.js가 있으니 API도 프런트가 맡는 것 아닌가
- `app/api`가 없는데 채팅은 어디서 처리하나
- 오디오는 누가 내려주나

현재 답은 간단합니다.

- 화면은 `frontend/`
- API는 `backend/`

## 현재 책임 분리

### `frontend/`

`frontend/`는 Next.js 앱입니다.

역할:

- `/` 메인 채팅 화면 렌더링
- `/docs/...` 문서 페이지 렌더링
- 사용자 입력 수집
- 백엔드 API 호출
- 오디오 재생 UI 표시

즉 사용자가 직접 보는 것은 대부분 `frontend/`입니다.

### `backend/`

`backend/`는 NestJS 앱입니다.

역할:

- `/api/chat`
- `/api/health`
- `/api/audio/:id`
- `/api/presets`
- `/api/generations`
- `/api/runtime/models`

즉 데이터 처리, 런타임 점검, LangChain 오케스트레이션, 파일 제공은 `backend/`가 맡습니다.

## 왜 이렇게 나눴는가

이전 단일 앱 구조에서는 Next.js 안에 UI와 API가 함께 있었습니다.

하지만 지금은 다음 이유 때문에 분리했습니다.

- `research/chat-toptoon`, `chat-admin`처럼 역할을 명확히 맞추기 위해
- DB, 인증, 작업 큐를 백엔드 중심으로 확장하기 쉽게 만들기 위해
- 프런트와 백엔드 빌드, 실행, 배포를 독립적으로 가져가기 위해

## 프런트는 API를 어떻게 호출하나

프런트는 [api.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/frontend/lib/api.ts)를 통해 백엔드 URL을 조합합니다.

핵심 함수:

- `getPublicApiBaseUrl()`
- `getServerApiBaseUrl()`
- `apiUrl(path, mode)`

즉 프런트 컴포넌트는 하드코딩된 URL 대신 이 함수를 통해 `/api/chat`, `/api/health` 같은 백엔드 경로를 부릅니다.

## `/api/chat` 요청 흐름

1. 사용자가 프런트 채팅 UI에서 메시지를 보냅니다
2. `frontend/components/studio-shell.tsx`가 `apiUrl("/chat")`로 요청을 보냅니다
3. `backend/src/studio/chat.controller.ts`가 요청을 받습니다
4. `chatRequestSchema`로 입력을 검증합니다
5. `backend/src/studio/chat.service.ts`가 LangChain + 로컬 런타임을 사용해 응답을 만듭니다
6. 프런트가 응답을 받아 채팅 메시지와 오디오 카드를 표시합니다

## 초심자가 꼭 기억할 한 줄

이 프로젝트는 "Next.js 하나로 화면과 API를 다 하는 앱"이 아니라,  
"Next.js 프런트엔드가 NestJS 백엔드를 호출하는 분리형 구조"입니다.
