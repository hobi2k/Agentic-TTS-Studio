# Audio Route And Storage

## 관련 파일

- [app/api/audio/[id]/route.ts](/mnt/d/Agentic-TTS-Studio/app/api/audio/[id]/route.ts)
- [lib/server/generation-store.ts](/mnt/d/Agentic-TTS-Studio/lib/server/generation-store.ts)
- [lib/server/filesystem.ts](/mnt/d/Agentic-TTS-Studio/lib/server/filesystem.ts)

## 왜 오디오 전용 API가 필요한가

음성 파일은 텍스트 JSON과 다릅니다.

브라우저의 `<audio>` 태그는 실제 wav 바이너리를 받아야 재생할 수 있습니다.

그래서 `/api/audio/:id` 같은 전용 route가 필요합니다.

## 저장 흐름

음성이 생성되면:

1. `data/generated/<id>.wav` 파일이 생깁니다
2. `data/generated/<id>.json` 메타데이터가 생깁니다
3. `index.json`에 최근 항목이 갱신됩니다

즉 음성 데이터와 메타데이터를 같이 관리합니다.

## `generation-store.ts`

이 파일은 생성 결과 저장 전용 모듈입니다.

역할:

- 개별 record 저장
- 최근 목록 index 저장
- UI용 오디오 카드 데이터 생성

좋은 점:

- 저장 로직이 한곳에 모입니다
- 나중에 DB로 바꿀 때도 이 경계만 바꾸면 됩니다

## `filesystem.ts`

이 파일은 파일 시스템 유틸을 모아둔 곳입니다.

예:

- 디렉터리 생성
- JSON 읽기/쓰기
- silent wav 생성

초심자가 배울 포인트는 이것입니다.

파일 관련 코드를 여러 곳에 흩뿌리지 말고, 유틸로 모아두면 유지보수가 쉬워집니다.

## 오디오 route의 동작

[app/api/audio/[id]/route.ts](/mnt/d/Agentic-TTS-Studio/app/api/audio/[id]/route.ts)는:

1. id로 메타데이터 JSON을 읽고
2. 실제 wav 경로를 찾고
3. 바이너리 파일을 읽어
4. `audio/wav`로 반환합니다

즉 브라우저는 이 route를 통해 파일을 스트리밍받는 셈입니다.
