# Cookbook Index

이 폴더는 `Agentic-TTS-Studio`를 "기능별"과 "파일별"로 이해하기 위한 문서 모음입니다.

처음 읽는 순서는 아래를 권장합니다.

1. `01-project-map.md`
2. `02-nextjs-app-router.md`
3. `03-home-page-and-shell.md`
4. `04-chat-api-route.md`
5. `05-langchain-agent.md`
6. `06-langchain-tools.md`
7. `07-local-runtime.md`
8. `08-audio-route-and-storage.md`
9. `09-docs-route.md`
10. `10-scripts-and-models.md`
11. `11-wsl-external-storage-and-recovery.md`

## 문서 목록

- [01-project-map.md](./01-project-map.md)
  전체 폴더 구조와 각 디렉터리의 책임을 설명합니다.
- [02-nextjs-app-router.md](./02-nextjs-app-router.md)
  왜 `app/` 기반 구조를 썼는지, 각 route 파일이 어떤 URL이 되는지 설명합니다.
- [03-home-page-and-shell.md](./03-home-page-and-shell.md)
  메인 페이지와 채팅 UI가 어떻게 연결되는지 설명합니다.
- [04-chat-api-route.md](./04-chat-api-route.md)
  `/api/chat`가 어떤 입력을 받고 어떤 응답을 만드는지 설명합니다.
- [05-langchain-agent.md](./05-langchain-agent.md)
  에이전트 계층이 사용자 메시지를 어떻게 해석하는지 설명합니다.
- [06-langchain-tools.md](./06-langchain-tools.md)
  도구 설계와 각 tool의 책임을 설명합니다.
- [07-local-runtime.md](./07-local-runtime.md)
  로컬 Gemma/Qwen 런타임과 simulation fallback을 설명합니다.
- [08-audio-route-and-storage.md](./08-audio-route-and-storage.md)
  생성 결과 저장, 오디오 제공 API, 메타데이터 저장을 설명합니다.
- [09-docs-route.md](./09-docs-route.md)
  `/docs/*` 페이지가 로컬 markdown 파일을 어떻게 읽는지 설명합니다.
- [10-scripts-and-models.md](./10-scripts-and-models.md)
  스크립트와 모델 폴더 운영 원칙을 설명합니다.
- [11-wsl-external-storage-and-recovery.md](./11-wsl-external-storage-and-recovery.md)
  외장하드 저장 전략을 실제로 실행한 기록과 실패 원인, 복구 방법을 설명합니다.
