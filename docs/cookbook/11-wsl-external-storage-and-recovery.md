# WSL External Storage And Recovery

## 이 문서의 목적

이 문서는 `Agentic-TTS-Studio`를 외장하드(`/mnt/d`)에 두면서 용량을 절약하려고 했던 실제 작업 기록과, 그 결과, 그리고 복구 방법을 정리한 운영 문서입니다.

즉 "이론"이 아니라 "실제로 실행한 작업"을 남기는 문서입니다.

## 왜 이 작업을 시도했는가

이 프로젝트는 다음 두 가지를 동시에 만족해야 합니다.

1. 모델과 생성 산출물은 용량이 커서 외장하드에 두는 것이 유리하다
2. `npm install`, `npm run build` 같은 Node 작업은 WSL의 `/mnt/d` 같은 마운트 경로에서 권한/rename 문제를 일으킬 수 있다

그래서 아래 전략을 실험했습니다.

- 프로젝트 루트는 `/mnt/d/Agentic-TTS-Studio`
- 모델과 생성 데이터도 `/mnt/d/Agentic-TTS-Studio`
- `node_modules`, `.next`만 `/home/hosung/.cache/agentic-tts-studio`로 빼기
- 루트에는 심볼릭 링크로 연결하기

## 실제 실행한 작업

다음 명령을 실제로 실행했습니다.

### 1. 리눅스 캐시 디렉터리 준비

```bash
mkdir -p /home/hosung/.cache/agentic-tts-studio/node_modules
mkdir -p /home/hosung/.cache/agentic-tts-studio/.next
```

### 2. `/mnt/d` 쪽 기존 디렉터리 제거

```bash
rm -rf /mnt/d/Agentic-TTS-Studio/node_modules
rm -rf /mnt/d/Agentic-TTS-Studio/.next
```

### 3. 심볼릭 링크 생성

```bash
ln -s /home/hosung/.cache/agentic-tts-studio/node_modules /mnt/d/Agentic-TTS-Studio/node_modules
ln -s /home/hosung/.cache/agentic-tts-studio/.next /mnt/d/Agentic-TTS-Studio/.next
```

### 4. `.env.local` 생성 및 모델 경로를 `/mnt/d` 기준으로 고정

실제로는 `.env.example`을 복사한 뒤 아래 값으로 맞췄습니다.

```env
GEMMA_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/gemma-3-4b-it
QWEN_TTS_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/qwen
WHISPER_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/whisper
```

### 5. 설치 및 빌드 시도

```bash
cd /mnt/d/Agentic-TTS-Studio
npm install
npm run build
```

## 실제 관찰 결과

### 결과 1. `.env.local` 설정은 정상

모델 경로를 `/mnt/d/.../models/...`로 유지하는 것은 문제 없었습니다.

즉 "무거운 모델 파일은 외장하드에 둔다"는 원칙은 그대로 유효합니다.

### 결과 2. `npm install`이 루트 `node_modules` 심볼릭 링크를 유지하지 않음

설치 시작 시 아래 경고가 관찰되었습니다.

```text
npm WARN reify Removing non-directory /mnt/d/Agentic-TTS-Studio/node_modules
```

이 메시지는 `npm`이 심볼릭 링크를 일반 디렉터리처럼 유지하지 않고, 제거 후 다시 처리하려 한다는 뜻입니다.

실제 확인 결과:

- `/home/hosung/.cache/agentic-tts-studio/node_modules` 는 남아 있었음
- `/mnt/d/Agentic-TTS-Studio/node_modules` 는 심볼릭 링크가 아니라 일반 디렉터리로 바뀌었음

즉 이 전략은 `npm`과 안정적으로 맞지 않았습니다.

### 결과 3. `npm run build`는 `next`를 찾지 못해 실패

실행 결과:

```text
> agentic-tts-studio@0.1.0 build
> next build

sh: 1: next: not found
```

이것은 설치가 끝까지 안정적으로 완료되지 않았기 때문에 생긴 후속 실패입니다.

## 이번 실험의 결론

### 결론 1. 모델과 생성물은 외장하드에 두는 것이 맞다

이 프로젝트의 큰 용량은 대체로 아래에서 발생합니다.

- 모델 파일
- 생성 결과물
- 업로드 데이터

따라서 이 자산들은 `/mnt/d/Agentic-TTS-Studio`에 두는 것이 합리적입니다.

### 결론 2. 루트 `node_modules`를 심볼릭 링크로 빼는 방식은 `npm` 기준 비권장

아이디어 자체는 좋아 보이지만, 실제로는 `npm`이 `node_modules` 심볼릭 링크를 안정적으로 존중하지 않았습니다.

즉 "루트 `node_modules` 심볼릭 링크"는 이 프로젝트의 운영 전략으로 채택하지 않는 것이 좋습니다.

## 권장 운영 방식

가장 권장하는 방식은 아래 둘 중 하나입니다.

### 방식 A. 권장

- 코드 프로젝트는 리눅스 파일시스템에 둔다
- 모델/생성 데이터만 `/mnt/d`에 둔다

예:

```text
/home/hosung/projects/Agentic-TTS-Studio     # 코드, node_modules, .next
/mnt/d/Agentic-TTS-Studio/models             # 모델
/mnt/d/Agentic-TTS-Studio/data               # 생성물, 업로드, 프리셋
```

이 방식이 가장 안정적입니다.

### 방식 B. 차선

- 프로젝트 전체를 `/mnt/d`에 둔다
- `node_modules`와 `.next`도 그냥 `/mnt/d`에 둔다
- 대신 WSL/마운트 옵션 문제를 감수한다

이 방식은 단순하지만, 이전에 겪었던 `rename`/`EACCES` 문제가 다시 발생할 수 있습니다.

## 현재 상태에서 복구하는 방법

현재 상태:

- `.env.local`은 존재함
- `node_modules`는 심볼릭 링크가 아니라 `/mnt/d` 아래 실제 디렉터리로 돌아간 상태일 수 있음
- `.next`는 심볼릭 링크일 수 있음

### 복구 경로 1. `/mnt/d` 기준 일반 구조로 되돌리기

이 방법은 "일단 단순한 원래 구조로 되돌리고 싶다"는 경우에 사용합니다.

```bash
rm -rf /mnt/d/Agentic-TTS-Studio/node_modules
rm -rf /mnt/d/Agentic-TTS-Studio/.next

mkdir -p /mnt/d/Agentic-TTS-Studio/node_modules
mkdir -p /mnt/d/Agentic-TTS-Studio/.next
```

그 다음 다시 설치:

```bash
cd /mnt/d/Agentic-TTS-Studio
npm install
npm run build
```

주의:

이 방식은 예전처럼 `/mnt/d` 권한/rename 문제를 다시 만날 수 있습니다.

### 복구 경로 2. 권장 구조로 이전하기

이 방법은 "코드는 리눅스 쪽, 모델은 외장하드"라는 장기 운영 방식입니다.

1. 코드 저장소를 리눅스 홈으로 복사하거나 클론
2. `.env.local`에서 모델 경로를 `/mnt/d/.../models/...` 로 유지
3. 필요하면 `data/`도 `/mnt/d`로 분리

예시:

```bash
mkdir -p /home/hosung/projects
cp -r /mnt/d/Agentic-TTS-Studio /home/hosung/projects/Agentic-TTS-Studio
```

그 후 `.env.local` 예시:

```env
GEMMA_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/gemma-3-4b-it
QWEN_TTS_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/qwen
WHISPER_MODEL_DIR=/mnt/d/Agentic-TTS-Studio/models/whisper
```

이 구조에서는 `npm install`, `npm run build`가 리눅스 ext4 위에서 동작하므로 훨씬 안정적입니다.

## 이번 작업에서 남긴 운영 원칙

1. 모델은 외장하드에 둬도 된다
2. `.env.local`로 모델 경로를 절대경로로 고정하는 것은 유효하다
3. 루트 `node_modules` 심볼릭 링크 전략은 `npm`과 잘 맞지 않는다
4. 장기적으로는 "코드는 리눅스, 모델은 외장하드"가 가장 안정적이다
