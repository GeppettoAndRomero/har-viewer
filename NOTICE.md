# Third-party notices

The source code in this repository is licensed under the [MIT License](./LICENSE).

This application has **no third-party runtime dependency** beyond its framework:
Astro, Preact, and `@astrojs/preact` are all distributed under the MIT License. A
`.har` file is plain JSON, so parsing and validating it is done with the browser's
native `JSON.parse` (`src/utils/harParse.ts`) — no external HAR-parsing library is
used. The request list's windowing, the timing waterfall, and the secret/token
detection patterns are all hand-written (`src/utils/virtualWindow.ts`,
`src/utils/waterfall.ts`, `src/utils/secretDetect.ts`) — no charting or
secret-scanning library is used.
