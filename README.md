# Agentic-TTS-Studio

`Qwen3-TTS-Demo`의 작업 흐름을 참고해서, 이를 `Next.js + LangChain + 로컬 Gemma` 중심의 채팅형 음성 작업실로 재구성한 프로젝트입니다.

핵심 목표는 하나입니다.

- 사용자는 채팅창에 자연어로 요청한다.
- LangChain 에이전트는 의도를 해석한다.
- 로컬 Gemma 4B IT는 대화와 계획 수립을 담당한다.
- 로컬 TTS/음성 도구는 실제 음성 생성, 프리셋 저장, 장문 스크립트 처리 같은 작업을 담당한다.

현재 저장소에는 다음이 포함되어 있습니다.

- `Next.js App Router` 기반 UI
- `LangChain` 기반 오케스트레이션 계층
- 로컬 모델 폴더를 전제로 하는 `Gemma`/`Qwen TTS` 러너 스크립트
- 모델이 아직 없을 때도 흐름을 검증할 수 있는 `simulation fallback`
- `docs/cookbook` 아키텍처/파이프라인 문서
- `docs/cheatsheet` 초심자용 상세 학습 문서

## 빠른 시작

```bash
cd /mnt/d/Agentic-TTS-Studio
cp .env.example .env.local
npm install
npm run dev
```

기본 접속 주소:

- `http://127.0.0.1:3000`

## 폴더 개요

```text
Agentic-TTS-Studio/
  app/
    api/
      chat/route.ts
      health/route.ts
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

## 모델 정책

이 프로젝트는 “모델을 전부 로컬 폴더에 저장한다”는 전제를 기본값으로 둡니다.

- Gemma 채팅 모델: `models/gemma-3-4b-it/`
- Qwen TTS 계열: `models/qwen/`
- Whisper: `models/whisper/`

자세한 구조와 실행 흐름은 아래 문서를 참고하세요.

- [Cookbook 인덱스](docs/cookbook/00-index.md)
- [프로젝트 맵](docs/cookbook/01-project-map.md)
- [LangChain 에이전트 설명](docs/cookbook/05-langchain-agent.md)
- [WSL 외장하드 전략과 복구](docs/cookbook/11-wsl-external-storage-and-recovery.md)
- [초심자용 학습 경로](docs/cheatsheet/00-learning-path.md)
- [JavaScript 기초](docs/cheatsheet/01-javascript-basics.md)
- [TypeScript 기초](docs/cheatsheet/02-typescript-basics.md)
