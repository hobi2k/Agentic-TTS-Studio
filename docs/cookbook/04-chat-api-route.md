# Chat API Route

## 관련 파일

- [app/api/chat/route.ts](/mnt/d/Agentic-TTS-Studio/app/api/chat/route.ts)
- [lib/types.ts](/mnt/d/Agentic-TTS-Studio/lib/types.ts)
- [lib/server/langchain/agent.ts](/mnt/d/Agentic-TTS-Studio/lib/server/langchain/agent.ts)

## `/api/chat`의 역할

이 API는 채팅 요청의 입구입니다.

브라우저에서 사용자가 문장을 보내면, 가장 먼저 이 파일이 요청을 받습니다.

## 코드가 짧은 이유

[app/api/chat/route.ts](/mnt/d/Agentic-TTS-Studio/app/api/chat/route.ts)는 일부러 짧게 유지했습니다.

좋은 API route는 보통 아래 역할만 합니다.

1. 요청을 읽는다
2. 입력을 검증한다
3. 실제 비즈니스 로직 함수에 위임한다
4. 결과를 반환한다

이 프로젝트에서도 정확히 그렇게 되어 있습니다.

## 입력 검증

이 API는 [lib/types.ts](/mnt/d/Agentic-TTS-Studio/lib/types.ts)의 `chatRequestSchema`를 사용합니다.

이게 중요한 이유:

- 잘못된 JSON 구조를 초기에 막을 수 있음
- 프런트와 서버가 같은 입력 형태를 공유함
- 디버깅이 쉬워짐

초심자는 "어차피 내가 보내는 거니까 검증 없어도 되지 않나?"라고 생각하기 쉽습니다.

하지만 실제로는 작은 구조 차이 하나로도 전체 흐름이 깨질 수 있으므로, schema 검증은 초반부터 넣는 것이 좋습니다.

## 잘못된 요청이면 어떻게 되나

검증에 실패하면 이 API는 `400` 상태 코드와 함께 오류 정보를 반환합니다.

즉 서버가 무작정 죽는 대신, "입력이 잘못됐다"는 사실을 명확히 알려줍니다.

## 실제 작업은 누가 하나

실제 작업은 `runStudioAgent()`가 합니다.

즉 `route.ts`는 입구이고, 에이전트 함수가 본체입니다.

이렇게 분리하면 좋은 점:

- API 레이어가 얇아짐
- 테스트 포인트가 명확해짐
- 나중에 같은 함수를 다른 route에서 재사용 가능
