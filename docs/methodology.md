# Access Audit Methodology

Access Audit is an accessibility audit assistant. It does not certify ADA, WCAG, or Section 508 compliance by automation alone.

## Automated Phase

- Validate URL scope and block private network targets unless explicitly enabled for local development.
- Crawl rendered pages in Chromium with Playwright.
- Discover links from the rendered DOM.
- Capture HTTP status, page title, canonical URL, screenshots, DOM snapshots, and raw axe JSON.
- Run axe-core with WCAG 2 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA, and best-practice tags.
- Run custom heuristics for headings, landmarks, skip links, PDF links, media, CAPTCHA flags, touch targets, and other manual-review triggers.
- Explore keyboard focus order with Tab and capture focus evidence.

## Manual Phase

Manual checks are organized by POUR:

- Perceivable: alt text quality, captions, transcripts, document accessibility, images of text.
- Operable: keyboard-only flows, focus order, dialogs, menus, time limits, pointer/touch targets.
- Understandable: labels, instructions, error prevention, consistent navigation, plain language.
- Robust: assistive technology sanity checks, name/role/value, status messages, authentication flows.

## Reporting Phase

Reports include methodology, limitations, score rationale, findings, manual checklist status, evidence, and remediation order. VPAT/ACR output is draft preparation support only.
