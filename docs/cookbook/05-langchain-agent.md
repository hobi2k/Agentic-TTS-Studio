# LangChain Agent Layer

## 관련 파일

- [lib/server/langchain/agent.ts](/mnt/d/Agentic-TTS-Studio/lib/server/langchain/agent.ts)
- [lib/server/langchain/model.ts](/mnt/d/Agentic-TTS-Studio/lib/server/langchain/model.ts)
- [lib/server/langchain/tools.ts](/mnt/d/Agentic-TTS-Studio/lib/server/langchain/tools.ts)

## 에이전트란 무엇인가

이 프로젝트에서 에이전트는 "사용자의 자연어 요청을 읽고, 어떤 작업을 할지 정하는 조정자"입니다.

중요한 점은:

- 에이전트가 직접 오디오 파일을 만들지는 않습니다
- 에이전트는 어떤 tool을 쓸지 결정하고, 최종 설명을 구성합니다

즉 에이전트는 `controller`에 가깝습니다.

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

## 실제 실행 순서

`runStudioAgent()`는 대략 이렇게 동작합니다.

1. 최신 사용자 메시지 추출
2. 프롬프트 생성
3. tool 배열 준비
4. 의도 분류
5. 필요한 tool 실행
6. Gemma planning 호출
7. 최종 응답 조합

이 흐름이 중요한 이유는, "실행"과 "설명"을 분리했기 때문입니다.

- tool은 실제 일
- Gemma는 설명과 계획

## 현재가 진짜 LangChain agent인가

엄밀히 말하면 지금 구조는 완전 자동 tool-calling agent보다는 "LangChain을 사용한 오케스트레이션 계층"에 가깝습니다.

하지만 이것이 오히려 초심자에게 좋습니다.

왜냐하면 처음부터 너무 복잡한 agent executor를 넣으면:

- 디버깅이 어려워지고
- 실제 동작을 이해하기 어렵고
- 코드가 불필요하게 커지기 때문입니다

지금 구조는 "LangChain을 프로젝트에 건강하게 도입하는 첫 단계"로 적절합니다.
