# har-viewer

Inspect a DevTools `.har` (HTTP Archive) capture, entirely in your browser. Request
list, per-request timing waterfall, full header/body/cookie detail, and warnings for
values that look like tokens, keys, or session cookies. Files are processed on your
device and never uploaded. Open source, works offline (PWA).

Part of [runlocally](https://runlocally.app) — small tools that run locally on your device.

## How it works

A `.har` file is plain JSON (the HAR 1.2 format DevTools exports from its Network
panel), so parsing is just `JSON.parse` plus a shape check (`log.entries` must be an
array) — see `src/utils/harParse.ts`. No third-party HAR library, no WASM. The request
list reuses the exact windowed-rendering approach from this codebase's `csv-viewer`
tool (`src/utils/virtualWindow.ts`) so a capture with thousands of entries stays
responsive. The timing waterfall is plain CSS stacked `div`s sized from each entry's
`timings.{blocked,dns,connect,send,wait,receive}` — no charting library.

On load, every entry's header values, query-string parameter values, and cookie values
are scanned for common secret/token shapes (`src/utils/secretDetect.ts`): an
`Authorization: Bearer` token, a JWT (`eyJ...`, three dot-separated base64url
segments), an AWS access key (`AKIA...`), a GitHub token (`ghp_`/`gho_`), an `sk-`
prefixed API key, a query parameter named `api_key`/`access_token`/`token`, or simply
the presence of a `Cookie`/`Set-Cookie` header. Matches are highlighted in the detail
view — never hidden or redacted; the point is local visibility, not censorship.
Request/response **bodies are not scanned** — that's explicitly out of scope for this
version.

This is a viewer only. It does not sanitize, redact, or re-export a "cleaned" HAR file
— that's a different job with its own tradeoffs, and Cloudflare already publishes an
open-source client-side tool built specifically for it.

## Features

- Request list (method, URL, status, type, size, time) with windowed rendering for
  large captures
- Per-request timing waterfall (blocked/DNS/connect/send/wait/receive)
- Full request/response headers, query parameters, cookies, and pretty-printed
  (when JSON) bodies on click
- Flags requests whose headers, query parameters, or cookies look like they carry a
  token or secret
- Works offline (PWA), installable

## Develop

```bash
npm install
npm run dev      # dev server
npm run build    # type-check + production build to dist/
```

Stack: Astro + Preact + TypeScript. No Web Worker and no third-party runtime
dependency — HAR parsing is native `JSON.parse`, fast enough to run directly on the
main thread.

## Browser support

Works in any current browser. There is no WASM, no worker, and no dependency on
non-standard APIs — just `JSON.parse`, the DOM, and CSS.

## License

[MIT](./LICENSE). Built and maintained by Geppetto. Some code is written with AI
assistance; all review and decisions are the maintainer's.
