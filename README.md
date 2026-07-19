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

## Canary proxy (`/canary/*`)

`https://collinpfeifer.dev/canary/*` is served by a separate Next.js app
("Canary") hosted on Fly.io at `https://canary-collinpfeifer.fly.dev`, built
with `basePath: "/canary"`. This repo reverse-proxies that app so it appears at
`collinpfeifer.dev/canary` **without changing the URL in the browser**.

### Why a proxy service (not just a `_redirects` rewrite)

A Render static-site rewrite *can* point at an external URL, but it gives **no
control** over two things Canary needs:

1. **The upstream `Host` header** — must be `canary-collinpfeifer.fly.dev`.
2. **Response buffering** — Canary streams investigation progress over
   Server-Sent Events (SSE). A buffering proxy holds the whole response and
   flushes it at once, which kills the live stream.

So `/canary/*` is routed to a tiny **Render web service**
(`proxy/server.mjs`, zero dependencies) that:

- preserves the `/canary` prefix verbatim (the Next.js basePath expects it),
- sets `Host: canary-collinpfeifer.fly.dev` upstream,
- pipes the response through with **no buffering** (raw `http` stream pipe),
- talks HTTPS to Fly.

Render **web** services are origin services (the type people run
SSE/WebSocket apps on), so they stream. The proxy forwards requests with
`requestTimeout = 0` so long-running investigations aren't cut off.

```
collinpfeifer.dev/canary/*
  --(static-site rewrite, status 200)-->  https://canary-proxy.onrender.com/canary/*
                                                |
                                                v   streaming · Host set · prefix kept
                                   https://canary-collinpfeifer.fly.dev/canary/*
```

### Deploy

1. **Deploy the proxy.** In the Render Dashboard, create a Blueprint from this
   repo (or add the `canary-proxy` service from `render.yaml`). It runs
   `node proxy/server.mjs` on the Node runtime with no build step. Note its
   public URL, e.g. `https://canary-proxy-xxxx.onrender.com`.
2. **Add one rewrite rule to the `collinpfeifer.dev` static site** (Dashboard →
   that static site → Redirects/Rewrites → add; or in its own blueprint
   `routes:`):

   | Source | Destination | Action |
   | --- | --- | --- |
   | `/canary`    | `https://canary-proxy-xxxx.onrender.com/canary`    | Rewrite |
   | `/canary/*`  | `https://canary-proxy-xxxx.onrender.com/canary/*`  | Rewrite |

   (Rewrite = status 200, a reverse proxy — the browser URL stays
   `collinpfeifer.dev/canary/*`.)

3. Wait for both deploys to go live, then verify below.

### Verify

**Local** (proxy hits the real Fly backend):

```sh
PORT=8081 node proxy/server.mjs &
curl -sI localhost:8081/canary          # -> 200, x-powered-by: Next.js, server: Fly
```

**Local streaming self-check** (proves the proxy does not buffer SSE):

```sh
# origin that emits one line every 250ms
cat > /tmp/origin.mjs <<'EOF'
import http from "node:http";
http.createServer((_, res) => {
  res.writeHead(200, { "content-type": "text/event-stream" });
  let i = 0;
  const t = setInterval(() => {
    res.write(`data: chunk-${i} @ ${Date.now()}\n\n`);
    if (++i >= 4) { clearInterval(t); res.end(); }
  }, 250);
}).listen(9099);
EOF
node /tmp/origin.mjs &
UPSTREAM=http://localhost:9099 PORT=8082 node proxy/server.mjs &
curl -sN localhost:8082/canary          # 4 lines ~250ms apart => streamed, not buffered
```

**Production** (after deploy):

```sh
curl -sI https://collinpfeifer.dev/canary            # -> 200, served by Canary
# SSE: connect to a Canary stream endpoint and watch chunks arrive live, e.g.
curl -sN https://collinpfeifer.dev/canary/api/<stream-endpoint>
```

### Notes

- The Fly backend is public; no secrets are involved.
- On the Render **free** plan the proxy web service spins down after ~15 min of
  inactivity (first request after idle takes a few seconds to wake). Use a paid
  plan if you need always-on latency.
- Do **not** strip the `/canary` prefix anywhere — Fly's `basePath: "/canary"`
  expects to receive it.
