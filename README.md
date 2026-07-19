# Astro Starter Kit: Basics

```sh
bun create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
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

## Canary routing (`/canary/*`)

`https://collinpfeifer.dev/canary/*` is served by a separate Next.js app
("Canary") hosted on Fly.io at `https://canary-collinpfeifer.fly.dev`, built
with `basePath: "/canary"`. We route that app under `collinpfeifer.dev/canary`
**without changing the URL in the browser** (no 301/302).

### How: one static-site rewrite (free, no extra service)

Render static-site **rewrites** can target a full external URL and serve it at
the original path. Per the [Render docs](https://render.com/docs/redirects-rewrites),
a Rewrite (status 200) fetches the destination behind the scenes — the browser
stays on `collinpfeifer.dev/canary/*`. For a full-URL destination this is a
reverse proxy: the prefix is preserved, HTTPS is used, and the upstream `Host`
is the destination host automatically (the CDN must send it to open the TLS
connection).

Add this rule to the `collinpfeifer.dev` static site (Render Dashboard → that
static site → Redirects/Rewrites → add):

| Source | Destination | Action |
| --- | --- | --- |
| `/canary`   | `https://canary-collinpfeifer.fly.dev/canary`   | Rewrite |
| `/canary/*` | `https://canary-collinpfeifer.fly.dev/canary/*` | Rewrite |

That's the entire setup — no proxy service, no extra cost, no code.

### The one thing to verify after deploy: SSE streaming

Canary streams investigation progress over Server-Sent Events. Most CDNs
(Render static sites run behind Cloudflare) pass `text/event-stream` through
unbuffered, so this *should* stream live — but buffering can't be confirmed
without a deploy (the rewrite only exists on Render's CDN, not locally).

After the rewrite is live, confirm SSE is not buffered:

```sh
# 1. Canary page loads at the collinpfeifer.dev URL (browser bar unchanged):
curl -sI https://collinpfeifer.dev/canary              # -> 200, served by Canary

# 2. SSE: stream chunks must arrive incrementally, not all at once.
#    Point this at whichever /canary/api/* route Canary streams from:
curl -sN https://collinpfeifer.dev/canary/api/<stream-endpoint>
```

If chunks arrive live → done, shipping the free setup.

### Fallback if SSE buffers

If step 2 shows buffering (all chunks dump at once after a delay), the free
rewrite can't guarantee streaming. The fallback is a tiny zero-dependency
Node reverse-proxy service that pipes responses with no buffering. That proxy
(`proxy/server.mjs`) lives in git history on this branch — restore it and route
`/canary/*` at the proxy's URL instead of at Fly directly. See the first commit
on branch `canary-proxy` for the proxy + `render.yaml`.

### Notes

- The Fly backend is public; no secrets are involved.
- Do **not** strip the `/canary` prefix — Fly's `basePath: "/canary"` expects
  to receive it.
