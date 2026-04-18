# TypeScript Basics

## TypeScript는 무엇인가

TypeScript는 JavaScript에 타입 시스템을 추가한 언어입니다.

중요한 점은:

- JavaScript를 완전히 버리는 것이 아닙니다
- JavaScript 위에 더 많은 안전장치를 얹는 것입니다

즉 "JavaScript의 확장판"으로 이해하면 됩니다.

## 왜 TypeScript를 쓰는가

프로젝트가 커질수록 아래 문제가 생깁니다.

- 어떤 값이 문자열인지 숫자인지 헷갈림
- 함수가 무엇을 받는지 불명확함
- API 응답 구조가 자주 틀어짐

TypeScript는 이런 문제를 코드 작성 단계에서 더 빨리 발견하게 도와줍니다.

## 타입이란 무엇인가

타입은 "이 값이 어떤 종류인지"를 나타내는 정보입니다.

예:

- 문자열: `string`
- 숫자: `number`
- 참/거짓: `boolean`

```ts
const title: string = "Agentic TTS Studio";
const count: number = 3;
const ready: boolean = true;
```

## 함수 타입

```ts
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

여기서:

- `name: string`은 입력 타입
- `: string`은 반환 타입

## 객체 타입

```ts
type User = {
  name: string;
  role: string;
};
```

이제 `User` 모양에 맞는 객체만 사용하도록 도울 수 있습니다.

## 왜 React/Next.js에서 특히 유용한가

웹 앱은 데이터가 자주 오갑니다.

- 폼 입력
- 서버 응답
- 컴포넌트 props

이때 데이터 구조가 틀리면 화면이 깨집니다.

TypeScript는 이런 실수를 줄여줍니다.

## 이 프로젝트에서의 실제 예

[lib/types.ts](/mnt/d/Agentic-TTS-Studio/lib/types.ts)에는 다음 같은 타입이 있습니다.

- `ChatMessage`
- `ChatResponse`
- `RuntimeHealth`
- `GeneratedAudioRecord`

이 타입들이 있기 때문에 프런트와 서버가 같은 데이터 구조를 공유할 수 있습니다.

## `type`과 `interface`

초보자는 이 둘 차이에서 자주 헷갈립니다.

이 프로젝트에서는 단순하고 명확하게 `type`을 주로 쓰고 있습니다.

처음에는 이렇게 이해해도 충분합니다.

- 둘 다 객체 구조를 설명할 수 있다
- 작은 프로젝트에서는 `type`만으로도 충분한 경우가 많다

## TypeScript가 잡아주는 대표 실수

- 문자열이어야 하는데 숫자를 넣음
- 없는 필드에 접근함
- 함수에 잘못된 형태의 인자를 넘김

즉 런타임에서 터질 문제를 개발 중 더 빨리 알려줍니다.
