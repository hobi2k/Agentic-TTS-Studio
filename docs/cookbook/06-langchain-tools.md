# LangChain Tools

## 관련 파일

- [lib/server/langchain/tools.ts](/mnt/d/Agentic-TTS-Studio/lib/server/langchain/tools.ts)

## Tool이란 무엇인가

Tool은 LLM이 직접 할 수 없는 실제 작업을 대신 수행하는 함수입니다.

예를 들어 모델은 설명은 잘하지만:

- 파일 저장
- 오디오 생성
- 로컬 폴더 검사

같은 작업은 직접 하지 못합니다.

그래서 tool이 필요합니다.

## 현재 tool 목록

### `inspect_local_models`

로컬 모델 폴더가 존재하는지 점검합니다.

역할:

- Gemma 폴더 확인
- Qwen TTS 폴더 확인
- Whisper 폴더 확인

### `generate_speech`

텍스트를 음성으로 바꾸는 tool입니다.

실제로는 `runLocalSpeechGeneration()`을 호출합니다.

### `save_preset`

현재 음성 힌트를 프리셋 JSON으로 저장합니다.

즉 채팅 요청으로 "이 스타일 저장해줘"를 처리할 수 있게 해줍니다.

### `list_presets`

저장된 프리셋 목록을 읽습니다.

현재 UI에서는 아직 크게 쓰지 않지만, 다음 기능 확장을 위한 기반입니다.

## `DynamicStructuredTool`을 쓰는 이유

각 tool은 `DynamicStructuredTool`로 만들어집니다.

이 방식의 장점:

- 이름이 명확함
- 설명이 붙음
- 입력 schema를 구조화할 수 있음

즉 "이 tool은 무엇을 받고 무엇을 하는가"가 코드에서 분명해집니다.

## 왜 tool마다 책임을 작게 나누나

좋은 tool 설계의 핵심은 하나의 tool이 너무 많은 일을 하지 않게 만드는 것입니다.

예를 들어:

- 모델 점검
- 음성 생성
- 프리셋 저장

이 세 가지는 분리하는 편이 좋습니다.

이유:

- 테스트가 쉬움
- 실패 원인이 명확함
- 에이전트가 조합해서 쓰기 쉬움

## `toolTrace`는 왜 필요한가

`toolTrace`는 어떤 도구가 실제로 실행되었는지 기록합니다.

이 값은 사용자 메시지 아래에 표시되어 디버깅에 도움을 줍니다.

초심자 입장에서는 이게 특히 유용합니다.

"왜 이런 답이 나왔지?"라는 질문에 대해,

- 어떤 tool이 호출되었고
- 어떤 순서로 불렸는지

눈으로 바로 확인할 수 있기 때문입니다.
