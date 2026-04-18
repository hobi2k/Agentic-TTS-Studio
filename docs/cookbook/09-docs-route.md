# Docs Route

## 관련 파일

- [app/docs/[...slug]/page.tsx](/mnt/d/Agentic-TTS-Studio/app/docs/[...slug]/page.tsx)

## 이 기능이 하는 일

이 기능은 `docs/` 폴더의 markdown 파일을 웹에서 바로 읽게 해줍니다.

예를 들어:

- `/docs/cookbook/00-index.md`
- `/docs/cheatsheet/00-learning-path.md`

같은 경로로 접근할 수 있습니다.

## `[...slug]`는 무엇인가

Next.js의 catch-all route 문법입니다.

이 뜻은:

- `/docs/` 아래에 어떤 깊이의 경로가 와도 받을 수 있다는 뜻입니다

예:

- `/docs/a`
- `/docs/a/b`
- `/docs/a/b/c`

모두 이 파일이 처리합니다.

## 왜 별도 문서 페이지가 필요한가

문서를 GitHub에서만 보게 하면 앱 안 흐름이 끊깁니다.

앱 안에서 바로 문서를 읽을 수 있으면:

- 학습 흐름이 자연스럽고
- 사이드바 링크 관리가 쉬우며
- 데모용으로도 보기 좋습니다

## 현재 구현의 특징

현재는 markdown을 완전한 렌더러로 파싱하지 않고, 텍스트 그대로 `pre` 블록에 보여줍니다.

이 방식의 장점:

- 구현이 단순함
- 파일 읽기 로직을 이해하기 쉬움

나중에 원하면 `remark`나 `next-mdx-remote`로 확장할 수 있습니다.
