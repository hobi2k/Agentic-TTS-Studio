# Project Map

## 이 문서의 목적

이 문서는 저장소 전체를 처음 보는 사람이 "무슨 파일이 어디에 있고, 왜 거기에 있는지"를 파악하도록 돕기 위한 안내서입니다.

코드를 읽기 전에 먼저 지도를 보는 이유는 간단합니다.

- 길을 모르면 파일 하나를 읽어도 전체 그림이 잡히지 않습니다.
- 역할을 알면 같은 코드라도 훨씬 쉽게 읽힙니다.

## 현재 폴더 구조

```text
Agentic-TTS-Studio/
  frontend/
    app/
      docs/[...slug]/page.tsx
      globals.css
      layout.tsx
      page.tsx
    components/
      studio-shell.tsx
    lib/
      api.ts
      constants.ts
      types.ts
  backend/
    src/
      app.module.ts
      common/
      health/
      runtime/
      studio/
    prisma/
      schema.prisma
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

### `frontend/`

Next.js App Router 기반 사용자 UI입니다.

- 페이지
- 전역 스타일
- API client

이 프로젝트에서 `frontend/`는 사용자가 직접 보는 웹 애플리케이션의 입구입니다.

### `backend/`

NestJS 기반 API 서버입니다.

- 채팅 API
- 오디오 제공 API
- 런타임 상태 API
- LangChain 오케스트레이션
- Prisma schema

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

1. [page.tsx](/home/hosung/pytorch-demo/Agentic-TTS-Studio/frontend/app/page.tsx)
2. [studio-shell.tsx](/home/hosung/pytorch-demo/Agentic-TTS-Studio/frontend/components/studio-shell.tsx)
3. [api.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/frontend/lib/api.ts)
4. [chat.controller.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/chat.controller.ts)
5. [chat.service.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/chat.service.ts)
6. [local-runtime.service.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/local-runtime.service.ts)
7. [audio.controller.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/audio.controller.ts)
8. [schema.prisma](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/prisma/schema.prisma)
9. [run_gemma_chat.py](/home/hosung/pytorch-demo/Agentic-TTS-Studio/scripts/run_gemma_chat.py)
10. [run_qwen_tts.py](/home/hosung/pytorch-demo/Agentic-TTS-Studio/scripts/run_qwen_tts.py)

이 순서는 "화면에서 시작해서 안쪽으로 들어가는" 순서입니다.

## 이 구조가 왜 좋은가

- `frontend`와 `backend` 책임이 명확하게 분리됩니다.
- Next.js UI와 NestJS API를 각각 독립적으로 확장할 수 있습니다.
- LangChain과 로컬 런타임 로직이 백엔드에 모여 있어 구조를 읽기 쉽습니다.
- 모델이 아직 없어도 시뮬레이션으로 흐름을 검증할 수 있습니다.
