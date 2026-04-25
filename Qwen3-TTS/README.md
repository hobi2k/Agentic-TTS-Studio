# Qwen3-TTS Layout

이 폴더는 `Agentic-TTS-Studio` 안에서 `Qwen3-TTS-Demo`와 같은 역할별 구조를 드러내기 위한 진입점입니다.

- `inference/voicebox/`
  VoiceBox 전용 추론 진입점
- `fusion/`
  CustomVoice -> VoiceBox 변환 진입점
- `finetuning/`
  VoiceBox 재학습 진입점

현재 이 저장소의 VoiceBox 스크립트는 로컬에 함께 있는
`/home/hosung/pytorch-demo/Qwen3-TTS-Demo/Qwen3-TTS/...`
canonical 구현으로 위임합니다.
