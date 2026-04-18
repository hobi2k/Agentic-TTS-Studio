# JavaScript Basics

## 왜 이 문서가 먼저 필요한가

React와 Next.js는 JavaScript 생태계 위에 있습니다.

즉 Next.js를 배우기 전에 최소한 아래 개념은 알고 있어야 합니다.

- 변수
- 함수
- 객체
- 배열
- 조건문
- 반복문
- 비동기 처리

이걸 모르면 Next.js 문법이 아니라 "자바스크립트 문법"에서 먼저 막히게 됩니다.

## JavaScript는 무엇인가

JavaScript는 웹에서 가장 널리 쓰이는 프로그래밍 언어 중 하나입니다.

처음에는 브라우저 안에서 동작하는 언어로 시작했지만, 지금은 다음 영역에서도 많이 씁니다.

- 브라우저 UI
- 서버(Node.js)
- 빌드 도구
- 프레임워크 설정

이 프로젝트에서도 Next.js 서버와 브라우저 UI 모두 JavaScript 계열 문법 위에서 동작합니다.

## 가장 기본이 되는 문법

### 변수

```js
const name = "Agentic TTS Studio";
let count = 0;
```

- `const`: 다시 대입하지 않을 값
- `let`: 나중에 값이 바뀔 수 있는 값

초보자는 일단 `const`를 기본으로 쓰고, 꼭 필요할 때만 `let`을 쓰는 습관이 좋습니다.

### 함수

```js
function greet(userName) {
  return `Hello, ${userName}`;
}
```

함수는 "입력을 받아 결과를 만드는 코드 묶음"입니다.

### 객체

```js
const user = {
  name: "Hosung",
  role: "developer",
};
```

객체는 관련된 값을 한 덩어리로 묶는 자료형입니다.

### 배열

```js
const messages = ["hello", "world"];
```

배열은 여러 값을 순서대로 담는 자료형입니다.

## JavaScript에서 자주 보는 문법

### 화살표 함수

```js
const add = (a, b) => a + b;
```

React 코드에서 매우 자주 나옵니다.

### 구조 분해 할당

```js
const user = { name: "Ari", age: 20 };
const { name, age } = user;
```

객체나 배열에서 값을 꺼낼 때 편리합니다.

### 템플릿 문자열

```js
const title = `Hello, ${name}`;
```

문자열 안에 변수를 넣을 때 자주 사용합니다.

## 비동기 처리

웹 앱에서 매우 중요합니다.

예를 들어 서버에 요청을 보내는 작업은 시간이 걸립니다. 이런 작업을 비동기라고 합니다.

```js
async function loadData() {
  const response = await fetch("/api/health");
  return response.json();
}
```

- `async`: 이 함수 안에서 비동기 처리를 하겠다는 뜻
- `await`: 결과가 올 때까지 기다린다는 뜻

이 프로젝트의 `fetch("/api/chat")`도 같은 흐름입니다.

## 초심자가 자주 막히는 지점

- 객체와 배열 차이를 헷갈림
- `const`와 `let`을 구분 못 함
- `async/await`를 처음 보면 낯설어함
- 함수가 값을 반환하는지 아닌지 혼동함

## 이 프로젝트에서 바로 연결되는 예시

`components/studio-shell.tsx`를 읽을 때:

- `const [prompt, setPrompt] = useState("")`
- `async () => { ... }`
- `messages.map(...)`

이런 표현이 다 JavaScript 기초 위에 있습니다.
