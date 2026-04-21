# Runtime And Models Memory

- `models`는 `/mnt/d/Agentic-TTS-Studio/models`를 가리키는 심볼릭 링크
- 큰 모델 파일은 외장하드에 저장
- 프런트 `.env.local`은 외장하드 모델 경로를 직접 참조
- 백엔드는 `MODELS_ROOT`로 모델 경로를 읽음
