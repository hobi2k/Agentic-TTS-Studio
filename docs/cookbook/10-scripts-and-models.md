# Scripts And Models

## 관련 파일

- [scripts/bootstrap-local-models.sh](/mnt/d/Agentic-TTS-Studio/scripts/bootstrap-local-models.sh)
- [scripts/download-models.sh](/mnt/d/Agentic-TTS-Studio/scripts/download-models.sh)
- [scripts/run_gemma_chat.py](/mnt/d/Agentic-TTS-Studio/scripts/run_gemma_chat.py)
- [scripts/run_qwen_tts.py](/mnt/d/Agentic-TTS-Studio/scripts/run_qwen_tts.py)
- [.env.example](/mnt/d/Agentic-TTS-Studio/.env.example)

## 왜 스크립트를 따로 두나

웹 앱 코드와 모델 준비 코드를 한곳에 섞으면 복잡해집니다.

그래서 다음을 분리했습니다.

- 웹 애플리케이션 코드
- 모델 준비 스크립트
- 로컬 추론 러너

## `bootstrap-local-models.sh`

처음 프로젝트를 준비할 때 빈 폴더 구조를 만들어주는 스크립트입니다.

하는 일:

- `models/` 폴더 생성
- `data/` 폴더 생성
- `.env.local` 기본 복사

즉 "초기 뼈대 만들기" 스크립트입니다.

## `download-models.sh`

실제 모델을 로컬 디렉터리로 내려받기 위한 스크립트입니다.

기본 대상:

- Gemma
- Qwen TTS
- Whisper

중요한 원칙:

이 프로젝트는 모델을 원격 API가 아니라 로컬 폴더 기준으로 관리합니다.

## `run_gemma_chat.py`

현재는 stub 러너입니다.

역할:

- 모델 폴더 존재 여부 확인
- 프롬프트 길이와 실행 방향을 출력

나중에는 여기에 실제 Gemma 추론 코드를 넣으면 됩니다.

## `run_qwen_tts.py`

현재는 placeholder wav 생성기입니다.

역할:

- 모델 폴더 확인
- 출력 경로 준비
- dummy wav 생성

나중에는 여기에 실제 Qwen TTS inference를 연결하면 됩니다.

## `.env.example`

환경 변수 샘플입니다.

초심자가 배울 핵심:

환경 변수는 "코드를 안 바꾸고도 실행 환경을 바꾸기 위한 값"입니다.

예:

- 어느 Python을 쓸지
- 모델 폴더가 어디인지
- simulation 모드인지

이런 값은 코드에 하드코딩하지 않고 env로 빼두는 편이 좋습니다.
