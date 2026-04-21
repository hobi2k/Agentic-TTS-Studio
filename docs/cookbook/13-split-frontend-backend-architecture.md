# Split Frontend Backend Architecture

## 목적

이 문서는 `Agentic-TTS-Studio`를 `research/chat-toptoon`, `research/chat-admin`처럼 `frontend/`와 `backend/`로 물리적으로 분리한 이유와 현재 구조를 설명합니다.

## 현재 구조

```text
Agentic-TTS-Studio/
  frontend/
    app/
    components/
    lib/
    package.json
  backend/
    src/
    prisma/
    package.json
  docs/
  scripts/
  data/
  models -> /mnt/d/Agentic-TTS-Studio/models
```

## 왜 나눴는가

- 프런트엔드와 백엔드 책임을 명확히 나누기 위해
- 관리자 앱이나 배치 작업이 생길 때 확장하기 쉽게 만들기 위해
- DB, 인증, 생성 이력 저장을 백엔드 중심으로 설계하기 위해

## 프런트엔드

`frontend/`는 Next.js 앱입니다.

- 채팅 UI
- 문서 브라우저
- 오디오 재생
- 백엔드 API 호출
- `frontend/lib/api.ts`를 통한 API base URL 관리

중요:

프런트엔드는 더 이상 `app/api/*`로 애플리케이션 API를 직접 제공하지 않습니다.  
현재 API 책임은 `backend/`가 전담합니다.

## 백엔드

`backend/`는 NestJS + Prisma 기준의 서비스 구조입니다.

- `/api/health`
- `/api/runtime/models`
- `/api/chat`
- `/api/audio/:id`
- `/api/presets`
- `/api/generations`

현재는 뼈대 중심이지만, 이후 인증과 작업 큐를 붙일 수 있게 모듈 단위로 나뉘어 있습니다.

특히 `backend/src/studio/chat.service.ts`는 LangChain 기반 오케스트레이션 레이어입니다.

- `ChatPromptTemplate`
- `RunnableSequence`
- `RunnableLambda`
- `DynamicStructuredTool`

를 실제로 사용해서 사용자 입력, 도구 실행, Gemma planning 호출을 연결합니다.

## DB

`backend/prisma/schema.prisma`에는 아래 엔티티를 기본으로 뒀습니다.

- `User`
- `VoicePreset`
- `GenerationRecord`
- `RuntimeModel`

즉 “채팅형 데모”에서 “서비스형 구조”로 넘어가기 위한 최소 DB 토대를 먼저 잡았습니다.

## 현재 검증 상태

- `frontend`: `npm run build` 통과
- `backend`: `npm run build` 통과
- 프런트 fetch: 백엔드 기준 URL로 교체 완료
- API 책임: `frontend/app/api/*` 제거 후 `backend/`로 이관 완료
