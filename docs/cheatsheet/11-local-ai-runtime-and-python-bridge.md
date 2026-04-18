# Local AI Runtime And Python Bridge

## 왜 Python bridge가 필요한가

웹 앱은 TypeScript/Node로 만들었지만, 실제 모델 추론 코드는 Python 생태계가 훨씬 풍부합니다.

그래서 Next.js 서버가 Python 스크립트를 호출하는 구조를 씁니다.

## 실제 흐름

1. Next.js 서버가 요청을 받음
2. TypeScript가 Python 스크립트를 child process로 실행
3. Python이 모델을 돌리거나 placeholder 파일을 생성
4. 결과 경로를 다시 Next.js가 관리

## simulation fallback이 왜 좋은가

모델 다운로드가 오래 걸리거나 아직 준비되지 않았을 때도 앱의 전체 배관을 먼저 검증할 수 있기 때문입니다.
