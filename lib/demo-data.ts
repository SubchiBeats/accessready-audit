import { TOOL_VERSION } from "@/lib/constants";
import { calculateScoreSummary } from "@/lib/scoring";
import type { AuditData, Finding, ManualCheck } from "@/lib/types";
import { wcagReferences } from "@/lib/wcag";

const now = new Date("2026-06-21T05:30:00.000Z").toISOString();

const manualChecks: ManualCheck[] = [
  {
    id: "manual-alt-quality",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    principle: "perceivable",
    title: "Alt text quality and context",
    description: "Review meaningful images in core flows and confirm alt text conveys the same purpose as the visual.",
    wcag: [wcagReferences["1.1.1"]],
    status: "fail",
    notes: "Hero and product-card imagery need contextual text, not file-name derived labels.",
    assignee: "Maya Chen",
    priority: "high",
    dueDate: "2026-07-01",
    remediationStatus: "in-progress",
    evidenceFileIds: [],
    updatedAt: now
  },
  {
    id: "manual-keyboard-flow",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    principle: "operable",
    title: "Keyboard-only completion of major user flows",
    description: "Complete navigation, search, cart, checkout, and account sign-in using only the keyboard.",
    wcag: [wcagReferences["2.1.1"], wcagReferences["2.4.3"]],
    status: "fail",
    notes: "Checkout coupon popover traps focus after applying a code.",
    assignee: "Jordan Patel",
    priority: "critical",
    dueDate: "2026-06-27",
    remediationStatus: "open",
    evidenceFileIds: [],
    updatedAt: now
  },
  {
    id: "manual-captions",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    principle: "perceivable",
    title: "Captions and transcript accuracy",
    description: "Verify prerecorded videos have accurate captions and equivalent transcript content.",
    wcag: [wcagReferences["1.2.2"], wcagReferences["1.2.3"]],
    status: "not-started",
    priority: "medium",
    remediationStatus: "needs-review",
    evidenceFileIds: [],
    updatedAt: now
  },
  {
    id: "manual-errors",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    principle: "understandable",
    title: "Error prevention for checkout forms",
    description: "Confirm form errors are clear, programmatically associated, and prevent irreversible mistakes.",
    wcag: [wcagReferences["3.3.1"], wcagReferences["3.3.3"], wcagReferences["3.3.4"]],
    status: "pass",
    notes: "Payment step has field-level summaries and inline suggestions.",
    assignee: "Maya Chen",
    priority: "high",
    remediationStatus: "fixed",
    evidenceFileIds: [],
    updatedAt: now
  },
  {
    id: "manual-screen-reader",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    principle: "robust",
    title: "Screen reader sanity review",
    description: "Run NVDA/JAWS/VoiceOver smoke tests on primary templates and compare announced names, roles, and states.",
    wcag: [wcagReferences["4.1.2"], wcagReferences["4.1.3"]],
    status: "not-started",
    priority: "high",
    remediationStatus: "needs-review",
    evidenceFileIds: [],
    updatedAt: now
  }
];

const findings: Finding[] = [
  {
    id: "finding-dialog-focus",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    title: "Coupon dialog can trap keyboard focus",
    issueKey: "keyboard-trap::coupon-dialog",
    description: "The coupon dialog keeps focus cycling inside the panel after it closes visually.",
    whyItMatters:
      "Keyboard-only and screen reader users can become stuck and may be unable to continue checkout without refreshing the page.",
    whoItAffects: ["Keyboard users", "Screen reader users", "Switch-control users"],
    severity: "critical",
    confidence: "high",
    source: "keyboard",
    wcag: [wcagReferences["2.1.2"], wcagReferences["2.4.3"], wcagReferences["4.1.2"]],
    adaMapping: "Likely ADA Title II WCAG 2.1 AA blocker for public-sector web content.",
    section508Mapping: "Maps to Section 508 software and web provisions through WCAG 2.0 2.1.2 / 4.1.2.",
    selector: "#coupon-dialog",
    htmlSnippet: "<div id=\"coupon-dialog\" role=\"dialog\" aria-modal=\"true\">...</div>",
    status: "open",
    remediation: {
      plainEnglish: "When the dialog closes, send focus back to the button that opened it and remove hidden focusable content.",
      accessibilityImpact: "Users who cannot use a mouse need a predictable way to leave dialogs and continue checkout.",
      fix: "Use a tested dialog primitive, hide inactive content with inert, close on Escape, and restore focus to the trigger.",
      exampleCode:
        "const trigger = document.activeElement;\ncloseDialog();\nif (trigger instanceof HTMLElement) trigger.focus();",
      tests: [
        "Open the dialog with Enter.",
        "Press Escape and confirm focus returns to Apply coupon.",
        "Tab through checkout and confirm focus does not loop."
      ]
    },
    stepsToReproduce: [
      "Open /checkout with a keyboard.",
      "Tab to Apply coupon and press Enter.",
      "Press Escape, then Tab several times.",
      "Observe focus remains inside hidden dialog controls."
    ],
    templateKey: "checkout-template",
    componentName: "CouponDialog",
    firstSeenAt: now,
    lastSeenAt: now
  },
  {
    id: "finding-color-contrast",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    title: "Low contrast promotional text",
    issueKey: "color-contrast::promo-banner",
    description: "Promotional banner text has a contrast ratio below WCAG AA minimum for normal text.",
    whyItMatters: "Low-vision users and users in bright environments may not be able to read the discount message.",
    whoItAffects: ["Low-vision users", "Color vision deficient users", "Mobile users in glare"],
    severity: "serious",
    confidence: "high",
    source: "automated",
    wcag: [wcagReferences["1.4.3"]],
    adaMapping: "Common ADA web accessibility risk when important content is not perceivable.",
    section508Mapping: "Maps to Section 508/WCAG contrast minimum.",
    selector: ".promo-banner .muted",
    htmlSnippet: "<p class=\"muted\">Free shipping on orders over $50</p>",
    status: "in-progress",
    remediation: {
      plainEnglish: "Increase contrast between the banner text and its background.",
      accessibilityImpact: "The message becomes readable for people with low vision and many situational impairments.",
      fix: "Use foreground and background tokens that meet at least 4.5:1 for normal text.",
      exampleCode: ".promo-banner .muted { color: #0b2c4f; background: #e8f4f3; }",
      tests: ["Run axe color-contrast.", "Verify computed contrast is at least 4.5:1."]
    },
    stepsToReproduce: ["Open /home.", "Run automated contrast checks.", "Inspect .promo-banner .muted."],
    templateKey: "marketing-template",
    componentName: "PromoBanner",
    firstSeenAt: now,
    lastSeenAt: now
  },
  {
    id: "finding-form-label",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    title: "Email input missing accessible label",
    issueKey: "label::newsletter-email",
    description: "The newsletter email field relies on placeholder text instead of a persistent programmatic label.",
    whyItMatters: "Screen reader users may not know what information is expected after the placeholder disappears.",
    whoItAffects: ["Screen reader users", "Cognitive disability users", "Speech input users"],
    severity: "serious",
    confidence: "high",
    source: "automated",
    wcag: [wcagReferences["1.3.1"], wcagReferences["3.3.2"], wcagReferences["4.1.2"]],
    selector: "input[name='email']",
    htmlSnippet: "<input name=\"email\" placeholder=\"Email address\" />",
    status: "open",
    remediation: {
      plainEnglish: "Add a real label that stays available to assistive technology.",
      accessibilityImpact: "Users can identify the control and complete the form with screen readers or voice commands.",
      fix: "Associate a visible label with the input using htmlFor/id, or use aria-label only when a visible label cannot fit.",
      exampleCode: "<label for=\"newsletter-email\">Email address</label>\n<input id=\"newsletter-email\" name=\"email\" type=\"email\" />",
      tests: ["Inspect the accessibility tree.", "Run axe label checks.", "Submit with an empty value and confirm error is announced."]
    },
    stepsToReproduce: ["Open /home.", "Navigate to newsletter form.", "Inspect input accessible name."],
    templateKey: "marketing-template",
    componentName: "NewsletterForm",
    firstSeenAt: now,
    lastSeenAt: now
  },
  {
    id: "finding-pdf-review",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    title: "Linked PDF requires manual accessibility verification",
    issueKey: "pdf-review::annual-report",
    description: "The page links to a PDF that cannot be fully assessed by page-level HTML scanning.",
    whyItMatters: "PDFs often need tags, reading order, document language, bookmarks, and form semantics checked separately.",
    whoItAffects: ["Screen reader users", "Keyboard users", "Low-vision users"],
    severity: "needs-review",
    confidence: "medium",
    source: "needs-review",
    wcag: [wcagReferences["1.3.1"], wcagReferences["2.4.2"], wcagReferences["3.1.1"]],
    selector: "a[href$='.pdf']",
    htmlSnippet: "<a href=\"/reports/annual-report.pdf\">Annual report</a>",
    status: "needs-review",
    remediation: {
      plainEnglish: "Audit the PDF with a document accessibility workflow.",
      accessibilityImpact: "Users need the PDF content to preserve structure, reading order, and equivalent access.",
      fix: "Check tags, headings, language, alt text, table headers, form fields, reading order, and metadata.",
      tests: ["Run PAC or Acrobat accessibility checks.", "Test reading order with a screen reader.", "Confirm a tagged PDF is available."]
    },
    stepsToReproduce: ["Open /about.", "Find Annual report link.", "Download and manually test the PDF."],
    templateKey: "content-template",
    componentName: "DocumentLink",
    firstSeenAt: now,
    lastSeenAt: now
  },
  {
    id: "finding-target-size",
    projectId: "project-demo",
    scanId: "scan-demo-latest",
    title: "Mobile filter chips have small touch targets",
    issueKey: "target-size::filter-chip",
    description: "Several mobile filter controls are below the WCAG 2.2 target size minimum.",
    whyItMatters: "People with motor disabilities may activate the wrong filter or be unable to use the control reliably.",
    whoItAffects: ["Motor disability users", "Mobile users", "Users with tremors"],
    severity: "moderate",
    confidence: "medium",
    source: "visual",
    wcag: [wcagReferences["2.5.8"]],
    selector: ".filter-chip",
    htmlSnippet: "<button class=\"filter-chip\">XL</button>",
    status: "open",
    remediation: {
      plainEnglish: "Increase the tappable area for compact filter controls.",
      accessibilityImpact: "Controls become easier to activate accurately on touch devices.",
      fix: "Use min-height/min-width of 24 CSS pixels for WCAG 2.2 AA and larger spacing where possible.",
      exampleCode: ".filter-chip { min-width: 2rem; min-height: 2rem; padding-inline: .75rem; }",
      tests: ["Run mobile viewport scan.", "Measure target bounding boxes.", "Test with browser zoom at 200%."]
    },
    stepsToReproduce: ["Open /products at 390px width.", "Inspect size filter chips.", "Measure interactive target dimensions."],
    templateKey: "product-listing-template",
    componentName: "FilterChip",
    firstSeenAt: now,
    lastSeenAt: now
  }
];

const score = calculateScoreSummary({
  findings,
  manualChecks,
  pagesScanned: 8
});

export function createDemoData(): AuditData {
  return {
    users: [
      {
        id: "user-demo",
        email: "auditor@example.com",
        fullName: "Demo Auditor",
        createdAt: now
      }
    ],
    organizations: [
      {
        id: "org-demo",
        name: "Northstar Retail Accessibility Team",
        createdAt: now
      }
    ],
    projects: [
      {
        id: "project-demo",
        organizationId: "org-demo",
        name: "Northstar Retail",
        primaryUrl: "https://example.com",
        complianceMode: "wcag22-aa",
        allowedDomains: ["example.com"],
        tags: ["demo", "commerce", "wcag-aa"],
        createdAt: now,
        updatedAt: now,
        responsibleUseAcceptedAt: now
      }
    ],
    projectMembers: [
      {
        id: "member-demo",
        projectId: "project-demo",
        userId: "user-demo",
        role: "owner"
      }
    ],
    scanConfigs: [
      {
        id: "config-demo",
        projectId: "project-demo",
        urls: ["https://example.com", "https://example.com/products", "https://example.com/checkout"],
        crawlDepth: 2,
        maxPages: 25,
        scanMode: "wcag22-aa",
        includePatterns: [],
        excludePatterns: ["/logout", "/account/delete"],
        sitemapUrl: "https://example.com/sitemap.xml",
        sameDomainOnly: true,
        desktopViewport: { width: 1440, height: 1000 },
        mobileViewport: { width: 390, height: 844 },
        responsiveWidths: [320, 390, 768, 1024, 1440],
        rateLimitMs: 750,
        auth: {
          loginUrl: "https://example.com/login",
          username: "accessibility-auditor@example.com",
          hasStoredSecret: true
        },
        createdAt: now,
        updatedAt: now
      }
    ],
    scans: [
      {
        id: "scan-demo-previous",
        projectId: "project-demo",
        configId: "config-demo",
        status: "completed",
        startedAt: "2026-06-07T14:00:00.000Z",
        completedAt: "2026-06-07T14:10:00.000Z",
        pagesScanned: 7,
        urlsQueued: 12,
        toolVersion: TOOL_VERSION,
        summary: { ...score, riskScore: 58, criticalBlockers: 2, seriousIssues: 5, label: "High risk" },
        createdAt: "2026-06-07T14:00:00.000Z"
      },
      {
        id: "scan-demo-latest",
        projectId: "project-demo",
        configId: "config-demo",
        status: "completed",
        startedAt: "2026-06-20T15:00:00.000Z",
        completedAt: "2026-06-20T15:13:00.000Z",
        pagesScanned: 8,
        urlsQueued: 15,
        toolVersion: TOOL_VERSION,
        summary: score,
        createdAt: "2026-06-20T15:00:00.000Z"
      }
    ],
    scannedPages: [
      {
        id: "page-home-desktop",
        scanId: "scan-demo-latest",
        projectId: "project-demo",
        url: "https://example.com",
        canonicalUrl: "https://example.com/",
        title: "Northstar Retail",
        httpStatus: 200,
        viewport: "desktop",
        screenshotPath: "/demo/home-desktop.png",
        domSnapshotPath: "/demo/home.html",
        rawAxePath: "/demo/home-axe.json",
        discoveredLinks: ["https://example.com/products", "https://example.com/checkout"],
        createdAt: now
      },
      {
        id: "page-checkout-desktop",
        scanId: "scan-demo-latest",
        projectId: "project-demo",
        url: "https://example.com/checkout",
        canonicalUrl: "https://example.com/checkout",
        title: "Checkout | Northstar Retail",
        httpStatus: 200,
        viewport: "desktop",
        screenshotPath: "/demo/checkout-desktop.png",
        domSnapshotPath: "/demo/checkout.html",
        rawAxePath: "/demo/checkout-axe.json",
        discoveredLinks: ["https://example.com/cart"],
        createdAt: now
      },
      {
        id: "page-products-mobile",
        scanId: "scan-demo-latest",
        projectId: "project-demo",
        url: "https://example.com/products",
        canonicalUrl: "https://example.com/products",
        title: "Products | Northstar Retail",
        httpStatus: 200,
        viewport: "mobile",
        screenshotPath: "/demo/products-mobile.png",
        domSnapshotPath: "/demo/products.html",
        rawAxePath: "/demo/products-axe.json",
        discoveredLinks: ["https://example.com/products/coat"],
        createdAt: now
      }
    ],
    findings,
    findingInstances: [
      {
        id: "instance-dialog-focus",
        findingId: "finding-dialog-focus",
        scanId: "scan-demo-latest",
        pageId: "page-checkout-desktop",
        projectId: "project-demo",
        url: "https://example.com/checkout",
        selector: "#coupon-dialog",
        htmlSnippet: "<div id=\"coupon-dialog\" role=\"dialog\" aria-modal=\"true\">...</div>",
        screenshotPath: "/demo/coupon-focus.png",
        viewport: "desktop",
        impact: "critical",
        createdAt: now
      },
      {
        id: "instance-color-home",
        findingId: "finding-color-contrast",
        scanId: "scan-demo-latest",
        pageId: "page-home-desktop",
        projectId: "project-demo",
        url: "https://example.com",
        selector: ".promo-banner .muted",
        htmlSnippet: "<p class=\"muted\">Free shipping on orders over $50</p>",
        viewport: "desktop",
        impact: "serious",
        createdAt: now
      },
      {
        id: "instance-label-home",
        findingId: "finding-form-label",
        scanId: "scan-demo-latest",
        pageId: "page-home-desktop",
        projectId: "project-demo",
        url: "https://example.com",
        selector: "input[name='email']",
        htmlSnippet: "<input name=\"email\" placeholder=\"Email address\" />",
        viewport: "desktop",
        impact: "serious",
        createdAt: now
      },
      {
        id: "instance-pdf-about",
        findingId: "finding-pdf-review",
        scanId: "scan-demo-latest",
        pageId: "page-home-desktop",
        projectId: "project-demo",
        url: "https://example.com/about",
        selector: "a[href$='.pdf']",
        htmlSnippet: "<a href=\"/reports/annual-report.pdf\">Annual report</a>",
        viewport: "desktop",
        impact: "needs-review",
        createdAt: now
      },
      {
        id: "instance-target-products",
        findingId: "finding-target-size",
        scanId: "scan-demo-latest",
        pageId: "page-products-mobile",
        projectId: "project-demo",
        url: "https://example.com/products",
        selector: ".filter-chip",
        htmlSnippet: "<button class=\"filter-chip\">XL</button>",
        viewport: "mobile",
        impact: "moderate",
        createdAt: now
      }
    ],
    manualChecks,
    evidenceFiles: [],
    comments: [
      {
        id: "comment-demo",
        projectId: "project-demo",
        findingId: "finding-dialog-focus",
        body: "Engineering confirmed this is in the shared checkout dialog component.",
        authorName: "Demo Auditor",
        createdAt: now
      }
    ],
    remediationTasks: [
      {
        id: "task-dialog-focus",
        projectId: "project-demo",
        findingId: "finding-dialog-focus",
        title: "Replace checkout coupon dialog with accessible dialog primitive",
        owner: "Jordan Patel",
        dueDate: "2026-06-27",
        status: "doing",
        createdAt: now,
        updatedAt: now
      }
    ],
    reports: [
      {
        id: "report-demo-exec",
        projectId: "project-demo",
        scanId: "scan-demo-latest",
        kind: "executive-pdf",
        title: "Northstar Retail Executive Accessibility Summary",
        generatedAt: now
      }
    ]
  };
}
