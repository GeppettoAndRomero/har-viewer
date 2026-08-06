import type { ToolContent } from './types';

export const en: ToolContent = {
  htmlLang: 'en',

  meta: {
    title: 'HAR Viewer — Inspect DevTools Network Captures in Your Browser | runlocally',
    description:
      'Inspect a .har (HTTP Archive) capture from your browser DevTools: request list, timing waterfall, headers, bodies and cookies. Flags values that look like tokens, keys or session cookies. The file is read on your device and never uploaded. Open source, works offline.',
    ogTitle: 'HAR Viewer — Inspect DevTools Network Captures, No Upload',
    ogDescription:
      'Open a .har file in your browser: request list, waterfall, and warnings for tokens or session cookies. Nothing is uploaded. Open source, works offline.',
  },

  hero: {
    h1: 'HAR Viewer',
    tagline:
      'Inspect a DevTools .har capture in your browser — request list, timing waterfall, and warnings for values that look like tokens or session cookies. Nothing is uploaded.',
  },

  intro: {
    h2: 'Inspect HAR files in your browser',
    paras: [
      'A .har (HTTP Archive) file is the network capture your browser\'s DevTools exports: every request and response, with headers, timing, cookies and bodies. This tool opens one and shows a scrollable request list, a per-request timing breakdown, and full header/body detail for anything you click on.',
      "A HAR capture is also one of the most sensitive files a browser can produce — it can contain live session cookies, bearer tokens and API keys, exactly as they were sent. This is not hypothetical: in the 2023 Okta support-system breach, an attacker used a session token captured inside a HAR file that a customer had uploaded to a support case. On load, this tool scans headers, query parameters and cookies for value shapes that commonly indicate a secret, and flags the requests that contain them — so you can see what you're about to share before you share it.",
    ],
  },

  privacy: {
    h2: 'Why your file stays on your device',
    lead: 'Privacy here is structural, not a promise. There is no upload step because there is no server to send the file to — which matters more here than in most tools, since a HAR file can carry the same session tokens an attacker would want:',
    points: [
      'The file is read and parsed entirely in your browser.',
      'The page is served as static files and makes no request that carries your data.',
      'The source is open and anyone can read it (MIT).',
      'It works offline, which is only possible because nothing leaves the device.',
    ],
    note: "If you want to check for yourself, open your browser's Network panel while you open a file — no request carries its contents.",
    sourceLinkText: 'Read the source.',
  },

  howto: {
    h2: 'How to use it',
    steps: [
      {
        h3: 'Open a file',
        p: 'Click to choose a .har file exported from your browser\'s DevTools (Network panel → Export HAR), or drop it anywhere on the page. The file is read locally.',
      },
      {
        h3: 'Scan the request list',
        p: 'Method, URL, status, type, size and time for every request, with a small timeline bar per row. A warning icon marks any request whose headers, query parameters or cookies look like they contain a token or secret.',
      },
      {
        h3: 'Open a request for detail',
        p: 'Click a row to see its full request/response headers, query parameters, cookies, and pretty-printed bodies. Flagged values are highlighted in place — never hidden — so you can see exactly what was sent.',
      },
    ],
  },

  faqHeading: 'FAQ',
  faq: [
    {
      q: 'Is my HAR file uploaded anywhere?',
      a: "No. The file is read and parsed entirely in your browser. There is no server component, so its contents — including anything sensitive it contains — have no path off your device. The source is open and you can confirm this in your browser's Network panel.",
    },
    {
      q: 'What does the warning icon mean?',
      a: "It means that request's headers, query-string parameters, or cookies contain a value shaped like a common secret: an Authorization: Bearer token, a JWT (starts with eyJ, three dot-separated segments), an AWS access key (AKIA...), a GitHub token (ghp_/gho_...), an sk- prefixed API key, a query parameter named api_key/access_token/token, or simply the presence of a Cookie/Set-Cookie header.",
    },
    {
      q: 'Does it hide or redact the flagged values?',
      a: 'No — on purpose. The point is local visibility: seeing what your own capture contains before you decide whether to share it with anyone. Flagged values are highlighted in the detail view, not masked.',
    },
    {
      q: 'Does it scan request and response bodies too?',
      a: 'Not in this version. Detection is limited to header values, query-string parameter values, and cookie values. Bodies can contain secrets too, but scanning them is a larger, separate problem left for a future version.',
    },
    {
      q: 'Can it remove tokens and export a cleaned HAR file?',
      a: "No — this is a viewer, and sanitizing/redacting HAR files on purpose is a different job with its own tradeoffs. If you need that, Cloudflare publishes an open-source client-side HAR sanitizer built specifically for it.",
    },
    {
      q: 'What is the timeline bar showing?',
      a: "Each request's blocked/DNS/connect/send/wait/receive phases (from the HAR's timings), drawn as a stacked bar sized against the whole capture's duration — so a request that took a large share of the session shows a long bar, and a quick one shows a short bar.",
    },
    {
      q: 'Does it work offline?',
      a: 'Yes. It is a PWA. After the first visit it is cached, so it opens without a network connection. You can also install it to your home screen.',
    },
  ],

  footer: {
    openSourceLabel: 'Open source (MIT)',
    partOf: 'part of',
    brandTail: '— small tools that run locally on your device.',
    colophon:
      "Built and maintained by Geppetto. Some code is written with AI assistance; all review and decisions are the maintainer's.",
    securityText: 'Security',
  },

  related: {
    h2: 'Related tools',
    blogLinkText: 'Read the technical notes',
  },
};
