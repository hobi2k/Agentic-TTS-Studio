# Local Runtime

## 관련 파일

- [lib/server/local-runtime.ts](/mnt/d/Agentic-TTS-Studio/lib/server/local-runtime.ts)
- [lib/server/config.ts](/mnt/d/Agentic-TTS-Studio/lib/server/config.ts)
- [scripts/run_gemma_chat.py](/mnt/d/Agentic-TTS-Studio/scripts/run_gemma_chat.py)
- [scripts/run_qwen_tts.py](/mnt/d/Agentic-TTS-Studio/scripts/run_qwen_tts.py)

## 이 레이어의 역할

이 레이어는 Next.js 서버와 로컬 AI 실행 환경 사이의 경계입니다.

쉽게 말하면:

- 브라우저/Next.js 세계
- Python/모델 실행 세계

이 둘이 만나는 곳입니다.

## `getRuntimeHealth()`

이 함수는 현재 로컬 모델 폴더 상태를 확인합니다.

확인 대상:

- Gemma
- Qwen TTS
- Whisper

그리고 결과를 바탕으로 `simulationMode` 여부를 결정합니다.

## simulation mode란 무엇인가

모델이 아직 준비되지 않았을 때도 앱 전체 흐름을 테스트할 수 있도록 넣은 안전장치입니다.

예를 들어:

- 채팅 API
- 도구 호출
- 오디오 카드 표시
- 결과 파일 저장

이런 흐름은 실제 모델이 없어도 먼저 확인할 수 있습니다.

초기 개발에서는 매우 유용합니다.

## `runPythonScript()`

이 함수는 Node에서 Python 스크립트를 실행합니다.

즉 TypeScript 코드가 Python 러너를 자식 프로세스로 호출하는 방식입니다.

왜 이 방식이 좋은가:

- Python AI 생태계를 그대로 활용 가능
- 기존 inference 코드를 재사용 가능
- Next.js 코드는 얇게 유지 가능

## `runLocalSpeechGeneration()`

이 함수는 음성 생성의 실제 입구입니다.

흐름:

1. 고유 id 생성
2. 출력 wav 경로 생성
3. 런타임 상태 확인
4. 실제 TTS Python 스크립트 실행 또는 simulation fallback
5. 생성 메타데이터 저장

## `runLocalGemma()`

이 함수는 계획/설명용 Gemma 호출을 담당합니다.

모델이 없으면 fallback 메시지를 반환하고,
모델이 있으면 Python 스크립트를 호출합니다.

즉 "대화 모델 실행" 책임이 여기에 있습니다.

## 이 분리가 중요한 이유

만약 이 로직이 전부 API route 안에 섞여 있으면:

- 코드가 길어지고
- 테스트가 어려워지고
- 재사용이 힘들어집니다

그래서 런타임 로직은 별도 모듈로 빼는 것이 좋습니다.
