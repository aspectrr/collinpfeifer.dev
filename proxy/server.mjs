// Tiny streaming reverse proxy: collinpfeifer.dev/canary/* -> Fly Canary app.
//
// Why this exists (see README "Canary proxy"):
//   Render static-site rewrites can reach an external URL, but they give no
//   control over the upstream Host header and they may buffer responses — which
//   kills Canary's Server-Sent Events progress stream. This service is a Render
//   *web* service (web services stream), pipes the upstream body with zero
//   buffering, and sets Host explicitly so the Next.js basePath resolves.
//
// ponytail: raw node:http + node:https, zero dependencies. Raw http is used
// (not fetch) so we can set the upstream Host header (fetch forbids it) and so
// SSE is flushed chunk-by-chunk via a plain stream pipe with no buffering.

import http from "node:http";
import https from "node:https";

// Overridable so the streaming self-check can point at a local origin.
const UPSTREAM = process.env.UPSTREAM || "https://canary-collinpfeifer.fly.dev";
const upstream = new URL(UPSTREAM);
const PORT = Number(process.env.PORT) || 8080;
// Pick the request driver from the upstream scheme (Fly is https; the local
// self-check origin is http).
const upstreamLib = upstream.protocol === "https:" ? https : http;

// Hop-by-hop headers must not be forwarded across a proxy (RFC 7230 §6.1).
const HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const server = http.createServer((clientReq, clientRes) => {
  // req.url already carries the /canary basePath + query, so the prefix is
  // preserved verbatim (Fly's Next.js basePath expects to receive /canary).
  const headers = {};
  for (const [k, v] of Object.entries(clientReq.headers)) {
    if (!HOP.has(k.toLowerCase())) headers[k] = v;
  }
  // The upstream Host must be the Fly hostname (not collinpfeifer.dev), per the
  // Canary deploy's expectations.
  headers.host = upstream.host;

  const upstreamReq = upstreamLib.request(
    {
      protocol: upstream.protocol,
      hostname: upstream.hostname,
      port: upstream.port || 443,
      method: clientReq.method,
      path: clientReq.url,
      headers,
    },
    (upstreamRes) => {
      const respHeaders = {};
      for (const [k, v] of Object.entries(upstreamRes.headers)) {
        if (!HOP.has(k.toLowerCase())) respHeaders[k] = v;
      }
      // Tell upstream proxies (nginx, Cloudflare) to NOT buffer — SSE must
      // flush chunk-by-chunk. Without this, proxies hold the whole response.
      respHeaders["x-accel-buffering"] = "no";
      respHeaders["cache-control"] = "no-cache";
      clientRes.writeHead(upstreamRes.statusCode ?? 502, respHeaders);
      // Pipe straight through — NO buffering, so Server-Sent Events flush in
      // real time as the investigator makes progress.
      upstreamRes.pipe(clientRes);
    },
  );

  upstreamReq.on("error", (err) => {
    console.error("upstream error:", err.message);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { "content-type": "text/plain" });
    }
    clientRes.end(`Bad Gateway: ${err.message}`);
  });

  // Forward the request body (e.g. POST /canary/api/*).
  clientReq.pipe(upstreamReq);
});

// SSE streams are long-lived; don't let Node's default request/header timeouts
// cut a running investigation.
server.requestTimeout = 0;
server.headersTimeout = 0;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`canary-proxy listening on :${PORT} -> ${UPSTREAM}`);
});
