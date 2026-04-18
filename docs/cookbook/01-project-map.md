# Project Map

## 이 문서의 목적

이 문서는 저장소 전체를 처음 보는 사람이 "무슨 파일이 어디에 있고, 왜 거기에 있는지"를 파악하도록 돕기 위한 안내서입니다.

코드를 읽기 전에 먼저 지도를 보는 이유는 간단합니다.

- 길을 모르면 파일 하나를 읽어도 전체 그림이 잡히지 않습니다.
- 역할을 알면 같은 코드라도 훨씬 쉽게 읽힙니다.

## 현재 폴더 구조

```text
Agentic-TTS-Studio/
  app/
    api/
      audio/[id]/route.ts
      chat/route.ts
      health/route.ts
    docs/[...slug]/page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    studio-shell.tsx
  lib/
    constants.ts
    types.ts
    server/
      config.ts
      filesystem.ts
      generation-store.ts
      local-runtime.ts
      langchain/
        agent.ts
        model.ts
        tools.ts
  scripts/
    bootstrap-local-models.sh
    download-models.sh
    run_gemma_chat.py
    run_qwen_tts.py
  data/
    generated/
    presets/
    uploads/
  docs/
    cookbook/
    cheatsheet/
```

## 최상위 폴더 역할

### `app/`

Next.js App Router의 핵심 폴더입니다.

- 페이지
- API route
- 전역 스타일

이 프로젝트에서 `app/`은 웹 애플리케이션의 입구입니다.

### `components/`

화면을 구성하는 React 컴포넌트를 넣는 곳입니다.

현재는 [studio-shell.tsx](/mnt/d/Agentic-TTS-Studio/components/studio-shell.tsx)가 가장 중요한 화면 컴포넌트입니다.

### `lib/`

공용 코드와 서버 유틸을 넣는 곳입니다.

- 타입
- 상수
- 서버 설정
- 파일 저장
- LangChain 관련 코드

즉 `lib/`는 “여러 파일이 같이 쓰는 코드”를 모으는 곳입니다.

### `scripts/`

Node/TypeScript 바깥에서 실행하는 도구 모음입니다.

이 프로젝트는 최종적으로 로컬 AI 모델을 사용하려고 하므로, Python 스크립트가 자연스럽게 필요합니다.

### `data/`

사용 중에 생기는 산출물을 저장합니다.

- 생성된 음성
- 프리셋
- 업로드 파일

즉 코드는 Git으로 관리하고, 생성 데이터는 `data/`에 둡니다.

### `docs/`

프로젝트를 공부하기 위한 문서입니다.

- `cookbook`: 코드베이스 설명서
- `cheatsheet`: 학습용 교재

## 읽는 순서 추천

처음 보는 사람에게는 아래 순서를 추천합니다.

1. [app/page.tsx](/mnt/d/Agentic-TTS-Studio/app/page.tsx)
2. [components/studio-shell.tsx](/mnt/d/Agentic-TTS-Studio/components/studio-shell.tsx)
3. [app/api/chat/route.ts](/mnt/d/Agentic-TTS-Studio/app/api/chat/route.ts)
4. [lib/types.ts](/mnt/d/Agentic-TTS-Studio/lib/types.ts)
5. [lib/server/langchain/agent.ts](/mnt/d/Agentic-TTS-Studio/lib/server/langchain/agent.ts)
6. [lib/server/langchain/tools.ts](/mnt/d/Agentic-TTS-Studio/lib/server/langchain/tools.ts)
7. [lib/server/local-runtime.ts](/mnt/d/Agentic-TTS-Studio/lib/server/local-runtime.ts)
8. [scripts/run_gemma_chat.py](/mnt/d/Agentic-TTS-Studio/scripts/run_gemma_chat.py)
9. [scripts/run_qwen_tts.py](/mnt/d/Agentic-TTS-Studio/scripts/run_qwen_tts.py)

이 순서는 "화면에서 시작해서 안쪽으로 들어가는" 순서입니다.

## 이 구조가 왜 좋은가

- Next.js 기준으로 정석적인 구조입니다.
- 서버 전용 코드와 클라이언트 코드를 분리했습니다.
- LangChain 도입부를 최소 단위로 넣어 확장하기 쉽습니다.
- 모델이 아직 없어도 시뮬레이션으로 흐름을 검증할 수 있습니다.
