const seed = {
  project: "Northstar Retail",
  scans: [
    { label: "Jun 7", score: 58 },
    { label: "Jun 14", score: 67 },
    { label: "Jun 20", score: 72 }
  ],
  findings: [
    {
      id: "dialog-focus",
      severity: "critical",
      status: "open",
      title: "Coupon dialog can trap keyboard focus",
      criterion: "WCAG 2.1.2, 2.4.3, 4.1.2",
      selector: "#coupon-dialog",
      impact: "Keyboard and screen reader users can become stuck after the dialog closes visually.",
      fix: "Restore focus to the trigger, remove hidden focusable content, and close on Escape."
    },
    {
      id: "contrast",
      severity: "serious",
      status: "in-progress",
      title: "Low contrast promotional text",
      criterion: "WCAG 1.4.3",
      selector: ".promo-banner .muted",
      impact: "Low-vision users may not be able to read the offer.",
      fix: "Use foreground and background tokens that meet 4.5:1 contrast."
    },
    {
      id: "label",
      severity: "serious",
      status: "open",
      title: "Email input missing accessible label",
      criterion: "WCAG 1.3.1, 3.3.2, 4.1.2",
      selector: "input[name='email']",
      impact: "Screen reader and speech input users may not understand the form field.",
      fix: "Associate a visible label with the input using for/id or aria-labelledby."
    },
    {
      id: "pdf",
      severity: "needs-review",
      status: "needs-review",
      title: "Linked PDF requires manual accessibility verification",
      criterion: "WCAG 1.3.1, 2.4.2, 3.1.1",
      selector: "a[href$='.pdf']",
      impact: "PDFs need tag, reading order, language, table, and metadata checks.",
      fix: "Audit the document with a PDF accessibility workflow and assistive technology review."
    },
    {
      id: "target-size",
      severity: "moderate",
      status: "open",
      title: "Mobile filter chips have small touch targets",
      criterion: "WCAG 2.5.8",
      selector: ".filter-chip",
      impact: "Users with motor disabilities may activate the wrong control.",
      fix: "Increase targets to at least 24 by 24 CSS pixels and add spacing."
    }
  ],
  manual: [
    {
      id: "alt-quality",
      principle: "perceivable",
      title: "Alt text quality and context",
      status: "fail",
      notes: "Hero and product imagery need contextual text."
    },
    {
      id: "keyboard-flow",
      principle: "operable",
      title: "Keyboard-only completion of major flows",
      status: "fail",
      notes: "Checkout coupon popover traps focus."
    },
    {
      id: "captions",
      principle: "perceivable",
      title: "Captions and transcript accuracy",
      status: "not-started",
      notes: "Review prerecorded media."
    },
    {
      id: "errors",
      principle: "understandable",
      title: "Error prevention for checkout forms",
      status: "pass",
      notes: "Payment step has field-level summaries."
    },
    {
      id: "screen-reader",
      principle: "robust",
      title: "Screen reader sanity review",
      status: "not-started",
      notes: "Run NVDA, JAWS, VoiceOver, or TalkBack smoke tests."
    }
  ]
};

const state = loadState();
let severityFilter = "all";

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => showView(tab.dataset.view));
});

document.querySelectorAll(".filter").forEach((filter) => {
  filter.addEventListener("click", () => {
    severityFilter = filter.dataset.severity;
    document.querySelectorAll(".filter").forEach((item) => item.classList.toggle("is-active", item === filter));
    renderFindings();
  });
});

document.getElementById("finding-search").addEventListener("input", renderFindings);
document.getElementById("theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("accessaudit-theme", document.body.classList.contains("dark") ? "dark" : "light");
});

document.getElementById("demo-scan").addEventListener("click", () => {
  const nextScore = Math.min(96, state.scans.at(-1).score + 3);
  state.scans.push({ label: "Demo", score: nextScore });
  saveState();
  renderDashboard();
});

document.getElementById("download-json").addEventListener("click", () => {
  download("accessaudit-demo.json", JSON.stringify(state, null, 2), "application/json");
});

document.getElementById("download-csv").addEventListener("click", () => {
  const header = "id,severity,status,criterion,title,selector,fix";
  const rows = state.findings.map((finding) =>
    [finding.id, finding.severity, finding.status, finding.criterion, finding.title, finding.selector, finding.fix]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );
  download("accessaudit-findings.csv", [header, ...rows].join("\n"), "text/csv");
});

if (localStorage.getItem("accessaudit-theme") === "dark") {
  document.body.classList.add("dark");
}

const repoLink = document.getElementById("repo-link");
if (location.hostname.endsWith("github.io")) {
  const owner = location.hostname.split(".")[0];
  const repo = location.pathname.split("/").filter(Boolean)[0] || "accessready-audit";
  repoLink.href = `https://github.com/${owner}/${repo}`;
}

renderDashboard();
renderFindings();
renderManual();

function loadState() {
  const stored = localStorage.getItem("accessaudit-demo-state");
  if (!stored) return structuredClone(seed);
  try {
    return { ...structuredClone(seed), ...JSON.parse(stored) };
  } catch {
    return structuredClone(seed);
  }
}

function saveState() {
  localStorage.setItem("accessaudit-demo-state", JSON.stringify(state));
}

function showView(id) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("is-visible", view.id === id));
  document.querySelectorAll(".tab").forEach((tab) => {
    const active = tab.dataset.view === id;
    tab.classList.toggle("is-active", active);
    if (active) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });
  document.getElementById("main").focus();
}

function renderDashboard() {
  const open = state.findings.filter((finding) => !["fixed", "false-positive"].includes(finding.status));
  const critical = open.filter((finding) => finding.severity === "critical").length;
  const reviewDone = state.manual.filter((item) => item.status !== "not-started").length;
  const reviewPercent = Math.round((reviewDone / state.manual.length) * 100);
  const latestScore = state.scans.at(-1).score;

  document.getElementById("metrics").innerHTML = [
    metric("Risk score", latestScore),
    metric("Critical blockers", critical),
    metric("Open findings", open.length),
    metric("Manual review", `${reviewPercent}%`)
  ].join("");

  document.getElementById("trend").innerHTML = state.scans
    .slice(-6)
    .map(
      (scan) => `<div class="trend-row"><span>${scan.label}</span><div class="bar"><span style="width:${scan.score}%"></span></div><strong>${scan.score}</strong></div>`
    )
    .join("");
}

function renderFindings() {
  const query = document.getElementById("finding-search").value.toLowerCase();
  const findings = state.findings.filter((finding) => {
    const text = `${finding.title} ${finding.criterion} ${finding.selector} ${finding.fix}`.toLowerCase();
    return (severityFilter === "all" || finding.severity === severityFilter) && (!query || text.includes(query));
  });

  document.getElementById("finding-list").innerHTML = findings
    .map(
      (finding) => `<article class="finding-card">
        <header>
          <span class="chip ${finding.severity}">${finding.severity.replace("-", " ")}</span>
          <select class="status-select" aria-label="Status for ${escapeHtml(finding.title)}" data-status="${finding.id}">
            ${["open", "in-progress", "needs-review", "fixed", "accepted-risk", "false-positive"]
              .map((status) => `<option value="${status}" ${finding.status === status ? "selected" : ""}>${status.replace("-", " ")}</option>`)
              .join("")}
          </select>
        </header>
        <h3>${escapeHtml(finding.title)}</h3>
        <p><strong>${escapeHtml(finding.criterion)}</strong></p>
        <p>${escapeHtml(finding.impact)}</p>
        <p class="selector">${escapeHtml(finding.selector)}</p>
        <p><strong>Fix:</strong> ${escapeHtml(finding.fix)}</p>
      </article>`
    )
    .join("");

  document.querySelectorAll("[data-status]").forEach((select) => {
    select.addEventListener("change", () => {
      const finding = state.findings.find((item) => item.id === select.dataset.status);
      finding.status = select.value;
      saveState();
      renderDashboard();
    });
  });
}

function renderManual() {
  const done = state.manual.filter((item) => item.status !== "not-started").length;
  document.getElementById("review-progress").textContent = `${Math.round((done / state.manual.length) * 100)}% complete`;
  document.getElementById("manual-list").innerHTML = state.manual
    .map(
      (item) => `<article class="manual-card">
        <header>
          <span class="chip">${item.principle}</span>
          <select class="status-select" aria-label="Manual status for ${escapeHtml(item.title)}" data-manual="${item.id}">
            ${["not-started", "pass", "fail", "not-applicable"]
              .map((status) => `<option value="${status}" ${item.status === status ? "selected" : ""}>${status.replace("-", " ")}</option>`)
              .join("")}
          </select>
        </header>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.notes)}</p>
      </article>`
    )
    .join("");

  document.querySelectorAll("[data-manual]").forEach((select) => {
    select.addEventListener("change", () => {
      const item = state.manual.find((check) => check.id === select.dataset.manual);
      item.status = select.value;
      saveState();
      renderDashboard();
      renderManual();
    });
  });
}

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function download(fileName, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
