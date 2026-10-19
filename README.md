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

First time:

```
fly launch --no-deploy --copy-config   # keep the app name in fly.toml or change it
fly deploy
fly certs add djake.onahill.co
```

Then add DNS at your registrar: `CNAME djake → djake-blog.fly.dev` (`fly certs show djake.onahill.co` confirms the target and cert status).

After that, publishing is just `fly deploy`.
