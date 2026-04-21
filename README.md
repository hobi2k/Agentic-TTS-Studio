# Agentic-TTS-Studio

`Agentic-TTS-Studio`는 로컬 Gemma와 로컬 TTS 런타임을 사용하는 채팅형 음성 작업실입니다.

이 저장소는 이제 `research/chat-toptoon`, `research/chat-admin`와 같은 방향으로 `frontend`와 `backend`를 물리적으로 분리한 구조를 사용합니다.

## 현재 구조

```text
Agentic-TTS-Studio/
  frontend/   # Next.js UI
  backend/    # NestJS API + Prisma schema + LangChain orchestration
  docs/       # 구조 문서, 운영 문서, 학습 문서
  scripts/    # 로컬 모델 실행 스크립트
  data/       # generated, presets, uploads
  models -> /mnt/d/Agentic-TTS-Studio/models
  .claude/
    CLAUDE.md
    agents/
    memory/
```

## 핵심 방향

- `frontend`
  채팅 UI, 문서 브라우저, 오디오 재생, 백엔드 API 클라이언트
- `backend`
  `/api/chat`, `/api/audio/:id`, `/api/health`, `/api/presets`, `/api/generations`, `/api/runtime/models`
- `LangChain`
  `backend/src/studio/chat.service.ts`에서 `ChatPromptTemplate`, `RunnableSequence`, `RunnableLambda`, `DynamicStructuredTool`를 사용해 로컬 Gemma와 TTS 도구를 조정
- `models`
  외장하드 모델 저장소 심볼릭 링크

## 빠른 시작

프런트엔드:

```bash
cd frontend
npm install
npm run dev
```

백엔드:

```bash
cd backend
npm install
npm run start:dev
```

## 현재 검증 상태

- `frontend`: `npm run build` 통과
- `backend`: `npm run build` 통과
- API 책임: 프런트의 `app/api/*`가 아니라 `backend/`가 전담
- 모델 저장: `/mnt/d/Agentic-TTS-Studio/models`를 심볼릭 링크로 연결

## 문서 시작점

- [Split Architecture Guide](docs/cookbook/13-split-frontend-backend-architecture.md)
- [Backend API Ownership](docs/cookbook/04-backend-api-ownership.md)
- [LangChain Agent Guide](docs/cookbook/05-langchain-agent.md)
- [LangChain Tools Guide](docs/cookbook/06-langchain-tools.md)
- [Symlink Model Storage Guide](docs/cookbook/12-symlink-model-storage.md)
- [Claude Agent Guide](docs/cookbook/14-claude-agents-and-memory.md)
- [Cheatsheet Learning Path](docs/cheatsheet/00-learning-path.md)
