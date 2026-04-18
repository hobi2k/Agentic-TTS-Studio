# React State And Events

## 왜 이 문서가 필요한가

Next.js를 배울 때 React 기초가 약하면 금방 막힙니다.

특히 채팅 UI는 다음 개념을 같이 씁니다.

- state
- 이벤트
- 비동기 요청
- 렌더링

## state란 무엇인가

state는 화면이 기억해야 하는 값입니다.

이 프로젝트의 예:

- 현재 채팅 목록
- 입력창 값
- 음성 힌트
- 로딩 중 여부

이 값이 바뀌면 화면도 다시 그려집니다.

## `useState`

`useState`는 상태를 만드는 hook입니다.

## 이벤트 핸들러

사용자가 행동할 때 실행되는 함수입니다.

예:

- `onChange`
- `onSubmit`
- `onClick`

## `useTransition`

이 hook은 비동기 작업 중에도 UI를 덜 답답하게 보이게 할 때 유용합니다.

이 프로젝트에서는 요청을 보내는 동안 버튼 문구를 바꾸는 데 사용합니다.
