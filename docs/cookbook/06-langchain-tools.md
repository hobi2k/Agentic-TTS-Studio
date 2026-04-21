# LangChain Tools

## 관련 파일

- [chat.service.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/chat.service.ts)
- [local-runtime.service.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/local-runtime.service.ts)
- [generation-store.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/generation-store.ts)

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

실제 구현은 `LocalRuntimeService.getRuntimeHealth()`를 호출해서 JSON 문자열로 돌려줍니다.

### `generate_speech`

텍스트를 음성으로 바꾸는 tool입니다.

실제로는 `LocalRuntimeService.runLocalSpeechGeneration()`을 호출합니다.

이 tool이 실행되면:

1. 음성 파일을 생성하거나 simulation fallback wav를 만듭니다
2. `data/generated` 아래에 메타데이터를 저장합니다
3. 응답용 오디오 카드를 만들기 위해 `makeGeneratedAudioCard()`를 사용합니다

### `save_preset`

현재 음성 힌트를 저장 요청으로 정리하는 tool입니다.

중요:

현재 이 tool은 실제 영구 저장을 직접 하지 않습니다.  
왜냐하면 프리셋 영속성은 전용 백엔드 preset 모듈이 맡아야 하기 때문입니다.  
그래서 지금은 "채팅 요청을 preset 저장 의도로 정리해 주는 도구"로 동작합니다.

## `DynamicStructuredTool`을 쓰는 이유

각 tool은 `DynamicStructuredTool`로 만들어집니다.

이 방식의 장점:

- 이름이 명확함
- 설명이 붙음
- 입력 schema를 구조화할 수 있음

즉 "이 tool은 무엇을 받고 무엇을 하는가"가 코드에서 분명해집니다.

이 프로젝트에서는 각 tool 입력을 `zod` schema로 정의합니다.  
예를 들어 `generate_speech`는 `text`, `voiceHint`를 받고, `save_preset`은 `name`, `voiceHint`, `notes`를 받습니다.

즉 "자연어 요청"과 "실제 실행 함수" 사이에 구조화된 경계가 생깁니다.

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

현재 백엔드 응답에는 `toolTrace`가 포함되고, 프런트는 그 값을 채팅 응답 아래에서 디버깅 힌트처럼 보여줄 수 있습니다.

## TypeScript에서의 구현 메모

`DynamicStructuredTool`는 런타임에서는 편하지만, TypeScript에서 제네릭 추론이 깊어질 수 있습니다.

그래서 현재 구현은:

- 런타임 객체는 실제 `DynamicStructuredTool`
- 서비스 안에서 쓰는 인터페이스는 얇게 좁힌 타입

으로 나뉘어 있습니다.

이건 LangChain을 뺀 것이 아니라, "실제 tool 객체는 그대로 유지하면서 빌드 안정성을 높이는" 정리 방식입니다.
