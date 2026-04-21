# Symlink Model Storage Guide

## 이 문서의 목적

이 문서는 `Agentic-TTS-Studio`에서 큰 모델 파일을 외장하드(`/mnt/d`)에 두고, 실제 프로젝트는 리눅스 파일시스템 쪽에서 작업할 때 사용하는 `심볼릭 링크` 방식의 운영 방법을 설명합니다.

이 문서에는 아래 내용이 들어 있습니다.

- 심볼릭 링크가 무엇인지
- 이번 프로젝트에서 실제로 어떻게 연결했는지
- 연결 상태를 확인하는 방법
- 링크를 해제하는 방법
- 문제가 생겼을 때 복구하는 방법

## 심볼릭 링크란 무엇인가

심볼릭 링크는 "다른 경로를 가리키는 특수한 바로가기 파일"이라고 생각하면 이해하기 쉽습니다.

예를 들어 프로젝트 안에:

```text
/home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

가 있는데, 이것이 실제 폴더가 아니라 아래 경로를 가리킬 수 있습니다.

```text
/mnt/d/Agentic-TTS-Studio/models
```

그러면 프로젝트 코드는 `models/`를 평소처럼 사용하지만, 실제 모델 파일은 외장하드에 저장됩니다.

## 왜 이 방식을 쓰는가

이 프로젝트에서 큰 용량을 차지하는 것은 보통 아래 항목입니다.

- Gemma 모델
- Qwen TTS 모델
- Whisper 모델
- 나중에 추가될 생성 자산이나 데이터

이런 파일을 리눅스 홈 디렉터리에 모두 두면 저장 공간이 빨리 부족해질 수 있습니다.

그래서:

- 코드와 개발 환경은 `/home/hosung/pytorch-demo/Agentic-TTS-Studio`
- 큰 모델 파일은 `/mnt/d/Agentic-TTS-Studio/models`

로 나누는 것이 실용적입니다.

## 현재 프로젝트에 실제로 적용한 구조

현재 구조는 아래와 같습니다.

```text
/home/hosung/pytorch-demo/Agentic-TTS-Studio
  models -> /mnt/d/Agentic-TTS-Studio/models

/mnt/d/Agentic-TTS-Studio
  models/
```

즉 새로 클론한 프로젝트는 리눅스 파일시스템에 있고, 그 안의 `models` 폴더만 외장하드 경로를 가리키도록 연결했습니다.

## 실제로 실행한 방법

이번에 실제로 수행한 작업은 다음과 같습니다.

### 1. 새 프로젝트를 리눅스 쪽에 준비

프로젝트는 다음 위치에 클론했습니다.

```text
/home/hosung/pytorch-demo/Agentic-TTS-Studio
```

### 2. 외장하드 쪽 모델 폴더 준비

```bash
mkdir -p /mnt/d/Agentic-TTS-Studio/models
```

### 3. 클론된 프로젝트 안의 기본 `models` 폴더 제거

```bash
rm -rf /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

### 4. 심볼릭 링크 생성

```bash
ln -s /mnt/d/Agentic-TTS-Studio/models /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

이 명령을 실행하면 프로젝트 안의 `models`가 실제 디렉터리가 아니라 외장하드 경로를 가리키는 링크가 됩니다.

### 5. `.env.local`도 외장하드 모델 경로 기준으로 설정

현재 `.env.local`은 아래처럼 설정했습니다.

```env
GEMMA_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/gemma-3-4b-it
QWEN_TTS_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/qwen
WHISPER_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/whisper
PYTHON_BIN=python3
LOCAL_RUNTIME_MODE=auto
```

즉 애플리케이션도 외장하드 모델 위치를 직접 참조하도록 맞춰 둔 상태입니다.

## 연결 상태 확인 방법

### 방법 1. `ls -l`로 확인

```bash
ls -ld /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

정상이라면 아래처럼 보입니다.

```text
lrwxrwxrwx ... /home/hosung/pytorch-demo/Agentic-TTS-Studio/models -> /mnt/d/Agentic-TTS-Studio/models
```

앞의 첫 글자가 `l`이면 심볼릭 링크입니다.

### 방법 2. `readlink`로 확인

```bash
readlink /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

정상이라면 출력은 다음과 같아야 합니다.

```text
/mnt/d/Agentic-TTS-Studio/models
```

### 방법 3. 외장하드에 실제 모델 폴더가 생기는지 보기

예를 들어 Gemma 모델을 받았다면 아래 경로에 생겨야 합니다.

```text
/mnt/d/Agentic-TTS-Studio/models/gemma-3-4b-it
```

## 링크 해제 방법

심볼릭 링크만 지우고 싶다면 아래처럼 합니다.

```bash
rm /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

중요:

이 명령은 링크만 지우며, 링크가 가리키는 실제 외장하드 폴더 `/mnt/d/Agentic-TTS-Studio/models`는 지우지 않습니다.

즉 링크 제거와 실제 데이터 삭제는 다른 작업입니다.

## 링크 해제 후 일반 폴더로 되돌리는 방법

만약 다시 프로젝트 안에 일반 `models` 폴더를 두고 싶다면:

```bash
rm /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
mkdir -p /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

이제 `models`는 더 이상 링크가 아니라 프로젝트 내부의 실제 디렉터리가 됩니다.

그 뒤 `.env.local`도 필요하면 프로젝트 내부 경로로 수정해야 합니다.

예:

```env
GEMMA_MODEL_DIR=./models/gemma-3-4b-it
QWEN_TTS_MODEL_DIR=./models/qwen
WHISPER_MODEL_DIR=./models/whisper
```

## 문제가 생겼을 때 복구 방법

### 경우 1. 링크가 깨졌을 때

예를 들어 `/mnt/d/Agentic-TTS-Studio/models`가 없는데 링크만 남아 있으면 깨진 링크가 됩니다.

복구 방법:

```bash
mkdir -p /mnt/d/Agentic-TTS-Studio/models
```

또는 링크를 다시 만들고 싶다면:

```bash
rm /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
ln -s /mnt/d/Agentic-TTS-Studio/models /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

### 경우 2. 실수로 일반 폴더로 바뀌었을 때

`models`가 링크가 아니라 일반 폴더가 되어버렸다면:

```bash
rm -rf /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
ln -s /mnt/d/Agentic-TTS-Studio/models /home/hosung/pytorch-demo/Agentic-TTS-Studio/models
```

주의:

이 작업 전에는 프로젝트 안 `models` 폴더에 따로 넣어둔 중요한 파일이 없는지 먼저 확인해야 합니다.

### 경우 3. `.env.local` 경로가 꼬였을 때

`.env.local`이 프로젝트 내부 경로나 예전 경로를 가리키고 있으면, 다시 아래처럼 맞춥니다.

```env
GEMMA_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/gemma-3-4b-it
QWEN_TTS_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/qwen
WHISPER_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/whisper
```

## 이 프로젝트에서 권장하는 운영 원칙

1. 코드는 `/home/hosung/pytorch-demo/Agentic-TTS-Studio`에서 작업합니다.
2. 큰 모델 파일은 `/mnt/d/Agentic-TTS-Studio/models`에 둡니다.
3. 프로젝트 안 `models`는 외장하드 모델 폴더를 가리키는 심볼릭 링크로 유지합니다.
4. 모델 경로는 `.env.local`에서 절대경로로 명시합니다.

이 방식이면:

- 코드 작업은 리눅스 파일시스템에서 안정적으로 하고
- 큰 모델 파일은 외장하드에 저장해 용량을 절약할 수 있습니다.
