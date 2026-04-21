# LangChain Agent Layer

## 관련 파일

- [chat.service.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/chat.service.ts)
- [chat.controller.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/chat.controller.ts)
- [local-runtime.service.ts](/home/hosung/pytorch-demo/Agentic-TTS-Studio/backend/src/studio/local-runtime.service.ts)

## 에이전트란 무엇인가

이 프로젝트에서 에이전트는 "사용자의 자연어 요청을 읽고, 어떤 작업을 할지 정하는 조정자"입니다.

중요한 점은:

- 에이전트가 직접 오디오 파일을 만들지는 않습니다
- 에이전트는 어떤 tool을 쓸지 결정하고, 로컬 Gemma에 넘길 계획 프롬프트를 구성합니다

즉 에이전트는 `controller`에 가깝습니다.

다만 현재 위치는 옛 Next.js 서버 내부가 아니라 `backend/src/studio/chat.service.ts`입니다.  
즉 API는 NestJS가 받고, LangChain 오케스트레이션은 백엔드 서비스에서 실행합니다.

## `latestUserMessage()`

이 함수는 대화 기록에서 가장 최근 사용자 메시지를 찾습니다.

왜 필요할까요?

채팅 배열에는 assistant 메시지도 섞여 있으므로, 현재 사용자의 최신 요구만 뽑아야 하기 때문입니다.

## `inferToolNeed()`

이 함수는 현재 입력을 아주 단순한 규칙으로 분기합니다.

예를 들어:

- "읽어줘" -> 음성 생성 필요
- "프리셋 저장" -> 프리셋 저장 필요
- "모델 점검" -> 런타임 점검 필요

이 방식은 매우 단순하지만 초기에 강력합니다.

이유:

- 동작이 예측 가능함
- 디버깅이 쉬움
- 잘못 분기됐을 때 원인을 찾기 쉬움

## 프롬프트는 왜 따로 만드나

에이전트는 `ChatPromptTemplate`로 Gemma에 줄 프롬프트를 만듭니다.

여기에는:

- 시스템 힌트
- 에이전트 역할 설명
- 최신 사용자 입력

이 들어갑니다.

즉 모델에게 "너는 어떤 방식으로 생각해야 하는가"를 먼저 설명해줍니다.

현재 실제 체인은 `RunnableSequence`로 묶여 있고, 마지막 단계는 `RunnableLambda`를 통해 `LocalRuntimeService.runLocalGemma()`를 호출합니다.

## 실제 실행 순서

`runStudioAgent()`는 대략 이렇게 동작합니다.

1. 최신 사용자 메시지 추출
2. 의도 분류
3. `DynamicStructuredTool` 기반 tool 준비
4. 필요한 tool 실행
5. `ChatPromptTemplate + RunnableSequence`로 planning 호출
6. 최종 응답과 `toolTrace` 조합

이 흐름이 중요한 이유는, "실행"과 "설명"을 분리했기 때문입니다.

- tool은 실제 일
- Gemma는 설명과 계획

## 지금 실제로 쓰는 LangChain 요소

- `ChatPromptTemplate`
- `RunnableSequence`
- `RunnableLambda`
- `DynamicStructuredTool`

즉 "LangChain을 일부만 흉내 내는 구조"가 아니라, 실제 LangChain 객체를 사용해 백엔드 에이전트 레이어를 구성하고 있습니다.

다만 현재는 범용 `AgentExecutor`를 쓰는 방식이 아니라, 이 프로젝트에 필요한 흐름을 코드로 명시적으로 조정하는 형태입니다.

이 방식의 장점:

- 어떤 tool이 언제 호출되는지 읽기 쉽습니다
- 백엔드 빌드와 타입체크를 비교적 안정적으로 유지할 수 있습니다
- 초심자가 LangChain의 핵심 조각을 단계적으로 배우기 좋습니다

한 줄로 정리하면, 현재 구조는 "NestJS 백엔드 안에서 LangChain의 prompt, runnable, structured tool을 실제로 사용하는 명시적 에이전트 계층"입니다.
