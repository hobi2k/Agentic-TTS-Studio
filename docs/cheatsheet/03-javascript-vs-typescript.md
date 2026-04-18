# JavaScript Vs TypeScript

## 가장 짧은 차이

- JavaScript는 기본 언어
- TypeScript는 JavaScript에 타입을 더한 확장판

## 왜 둘 다 알아야 하나

Next.js 프로젝트를 읽다 보면 실제 문법은 JavaScript 문법인데, 그 위에 타입 표기가 얹혀 있는 형태가 많습니다.

즉 TypeScript를 보려면 JavaScript를 먼저 알아야 합니다.

## 같은 코드 비교

### JavaScript

```js
function greet(name) {
  return `Hello, ${name}`;
}
```

### TypeScript

```ts
function greet(name: string): string {
  return `Hello, ${name}`;
}
```

차이는 타입 정보가 추가되었다는 점입니다.

## 이 프로젝트는 왜 TypeScript를 쓰나

이 프로젝트에는 다음 종류의 데이터가 자주 오갑니다.

- 채팅 메시지
- API 응답
- 오디오 메타데이터
- 런타임 상태

이런 데이터 구조를 명확하게 유지하기 위해 TypeScript를 쓰는 것이 유리합니다.

## 초심자가 기억할 핵심

코드를 읽다가 타입 표기를 빼고 보면 JavaScript 코드가 보입니다.

예:

```ts
const [prompt, setPrompt] = useState("");
```

이 코드는 React 문법이기도 하지만, 기본적으로는 JavaScript 변수와 함수 호출 위에 올라가 있는 구조입니다.

## 추천 학습 순서

1. JavaScript 기본 문법 익히기
2. 함수, 객체, 배열, async/await 익히기
3. TypeScript 타입 표기 읽는 법 익히기
4. 그 다음 React/Next.js 보기

이 순서가 가장 덜 헷갈립니다.
