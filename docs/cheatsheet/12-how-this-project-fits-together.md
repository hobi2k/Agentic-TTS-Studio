# How This Project Fits Together

## 전체 이야기

1. 사용자가 채팅창에 요청한다
2. Next.js가 그 요청을 서버로 보낸다
3. 서버는 LangChain 계층으로 요청을 해석한다
4. 필요하면 tool을 실행한다
5. 로컬 AI 런타임이 실제 작업을 한다
6. 결과를 다시 채팅 UI에 보여준다

## 역할별 요약

- 브라우저: 입력과 출력
- Next.js route: 요청과 응답의 입구
- LangChain agent: 의도 해석과 조정
- tools: 실제 작업
- local runtime: Python과 모델 실행
- data folder: 결과 저장
