# Srevil Blog

기록하고 정리하는 블로그 — <https://srevil.com>

GitHub Pages + Jekyll 위에 직접 만든 **Night Log** 커스텀 테마(다크 + 별 배경 + 오렌지 악센트)로 운영합니다.

- 글은 `_posts/YYYY-MM-DD-제목.md` 로 작성합니다 (front matter: `title`, `tags`, 선택 `description`).
- 레이아웃: `_layouts/` (`default`, `home`, `post`, `page`), 조각: `_includes/`, 스타일/스크립트: `assets/css/night.css`, `assets/js/night.js`.
- 홈의 인트로는 세션당 1회만 재생됩니다. 강제 재생은 `/?intro=1`, 건너뛰기는 `/?intro=0`.
- 배포: `main` 푸시 시 `.github/workflows/pages-deploy.yml` 이 빌드·htmlproofer 후 배포합니다.
- 로컬 빌드: `bundle install && bundle exec jekyll serve`
