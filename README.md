# Astro Starter Kit: Basics

```sh
bun create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of an Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Canary (`canary.collinpfeifer.dev`)

Canary is a separate Next.js app (a safety investigator) hosted on Fly.io.
It's served at **`https://canary.collinpfeifer.dev`** via a direct subdomain
CNAME to Fly — no proxy, no CDN buffering, so its Server-Sent Events (live
investigation progress) stream in real time.

### Why a subdomain (not a path)

`collinpfeifer.dev` is a static site on Render, served behind Cloudflare. A
path-based reverse proxy (`/canary/*`) was attempted two ways:

1. **Static-site rewrite to Fly** — Cloudflare buffers the response, killing
   SSE (confirmed: TTFB = 13.7s = total response time).
2. **Proxy web service** (streams perfectly when hit directly) — but the
   static-site rewrite routes through Cloudflare again, re-introducing the
   buffering.

Render's CDN sits in front of all static sites and buffers SSE. A subdomain
CNAME to Fly bypasses Render entirely.

### Setup

**DNS** (wherever `collinpfeifer.dev` is managed):

| Type | Name | Target | Proxy |
| --- | --- | --- | --- |
| CNAME | `canary` | `canary-collpfeifer.fly.dev` | DNS only (no Cloudflare orange cloud) |

> If DNS is on Cloudflare, set the record to **DNS only** (grey cloud), not
> proxied — a proxied record routes through Cloudflare again, which buffers SSE.

**Fly** (in the Canary repo):

1. Add `canary.collinpfeifer.dev` as a custom domain on the Fly app.
2. Set Next.js `basePath` to `"/"` (was `"/canary"`) so the app serves at the
   root of the subdomain.

**Old links** (`collinpfeifer.dev/canary`):

Add a 302 redirect on the static site (Render Dashboard → Redirects/Rewrites)
so existing links don't break:

| Source | Destination | Action |
| --- | --- | --- |
| `/canary` | `https://canary.collinpfeifer.dev` | Redirect (302) |
| `/canary/*` | `https://canary.collinpfeifer.dev` | Redirect (302) |

### Verify

```sh
curl -sI https://canary.collinpfeifer.dev           # -> 200, served by Canary
# SSE streams live (TTFB < 1s, chunks arrive incrementally):
curl -sN https://canary.collinpfeifer.dev/api/investigate \
  -H "Content-Type: application/json" \
  -d '{"url":"https://github.com/vercel/next.js"}'
```
