# djake.onahill.co

Static blog: Markdown in `posts/`, built by `build.js` into `dist/`, served by nginx on Fly.

## Writing

Add `posts/<slug>.md`:

```
---
title: My post
date: 2026-10-19
draft: true   # optional; omit or remove to publish
---

Body in Markdown.
```

The file name becomes the URL: `posts/my-post.md` → `/my-post/`.
Images and other files go in `static/` and are copied to the site root (`static/img/a.png` → `/img/a.png`).

## Local preview

```
npm install
npm run build && npm run serve
```

## Deploy

Fly's GitHub integration deploys on every push to `main`. Publishing a post is just commit + push.

Custom domain: `djake.onahill.co` has a certificate in the Fly dashboard, with DNS `CNAME djake → djake-blog.fly.dev`.
