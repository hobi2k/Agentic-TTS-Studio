# Claude Agents And Memory

## 목적

이 문서는 이 저장소가 `.claude/agents`와 `.claude/memory`를 통해 에이전트 작업에 적합하도록 정리된 이유를 설명합니다.

## 현재 구성

```text
.claude/
  CLAUDE.md
  agents/
    frontend-developer.md
    backend-developer.md
    debugger.md
  memory/
    architecture.md
    runtime-and-models.md
```

## 에이전트 역할

- `frontend-developer`
  `frontend/` 디렉터리 전담, Next.js UI와 API client 변경 담당
- `backend-developer`
  `backend/` 디렉터리 전담, NestJS API, Prisma, LangChain 서비스 변경 담당
- `debugger`
  빌드 에러, 타입 에러, 런타임 오류 분석 전담

## memory 파일 역할

- `architecture.md`
  현재 저장소 구조, frontend/backend 경계, API 책임 요약
- `runtime-and-models.md`
  모델 경로, 심볼릭 링크, 데이터 경로 운영 규칙 요약

## 왜 필요한가

에이전트가 코드만 읽는 것보다,

- 구조 규칙
- 모델 저장 전략
- 작업 경계

를 함께 알고 있어야 더 일관된 수정이 가능하기 때문입니다.

현재 저장소는 프런트와 백엔드가 분리되어 있고, 백엔드 안에는 LangChain 에이전트 계층까지 들어 있습니다.  
그래서 에이전트 문서는 단순 코딩 스타일 문서가 아니라, "어디까지 건드려도 되는가"와 "어떤 책임이 어느 디렉터리에 있는가"를 명확히 알려주는 운영 문서 역할도 합니다.
