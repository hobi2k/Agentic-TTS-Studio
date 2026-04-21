# Agentic-TTS-Studio Claude Guide

## 프로젝트 구조

- `frontend/`: Next.js UI
- `backend/`: NestJS API + Prisma schema
- `scripts/`: 로컬 모델 실행 스크립트
- `data/`: generated, presets, uploads
- `models`: `/mnt/d/Agentic-TTS-Studio/models` 심볼릭 링크

## 작업 원칙

1. 프런트 작업은 `frontend/` 안에서 끝낸다.
2. 백엔드 작업은 `backend/` 안에서 끝낸다.
3. 모델 파일은 프로젝트 내부에 직접 넣지 않는다.
4. 큰 구조 변경 시 `docs/cookbook` 문서도 같이 갱신한다.

## 참고 문서

- `docs/cookbook/13-split-frontend-backend-architecture.md`
- `docs/cookbook/12-symlink-model-storage.md`
- `docs/cookbook/14-claude-agents-and-memory.md`
