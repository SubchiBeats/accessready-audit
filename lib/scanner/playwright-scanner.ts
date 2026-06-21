import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Page } from "playwright";
import type { NormalizedFindingInput, Scan, ScanConfig, ScannedPage } from "@/lib/types";
import { TOOL_VERSION } from "@/lib/constants";
import { validateScanUrl } from "@/lib/security/url-validation";
import { slugify, unique } from "@/lib/utils";
import { runCustomChecks } from "@/lib/scanner/custom-checks";
import { exploreKeyboard } from "@/lib/scanner/keyboard-explorer";
import { materializeFindings, normalizeAxeViolations } from "@/lib/scanner/normalize";

export interface ScannerResult {
  pages: ScannedPage[];
  findings: ReturnType<typeof materializeFindings>["findings"];
  instances: ReturnType<typeof materializeFindings>["instances"];
}

export async function runPlaywrightScan(scan: Scan, config: ScanConfig): Promise<ScannerResult> {
  const [{ chromium }, axeCore] = await Promise.all([import("playwright"), import("axe-core")]);
  const artifactRoot =
    process.env.ACCESSAUDIT_ARTIFACT_DIR ?? path.join(process.cwd(), ".accessaudit", "artifacts", scan.id);
  await mkdir(artifactRoot, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const pages: ScannedPage[] = [];
  const normalized: NormalizedFindingInput[] = [];
  const queue = await buildInitialQueue(config);
  const visited = new Set<string>();
  const maxPages = Math.min(config.maxPages, Number(process.env.ACCESSAUDIT_MAX_PAGES ?? config.maxPages));

  try {
    while (queue.length && visited.size < maxPages) {
      const item = queue.shift();
      if (!item || visited.has(item.url) || item.depth > config.crawlDepth) continue;
      visited.add(item.url);

      for (const viewport of [
        { name: "desktop" as const, size: config.desktopViewport },
        { name: "mobile" as const, size: config.mobileViewport }
      ]) {
        const context = await browser.newContext({ viewport: viewport.size, reducedMotion: "reduce" });
        const page = await context.newPage();
        const pageResult = await scanPage({
          page,
          scan,
          config,
          url: item.url,
          viewport: viewport.name,
          artifactRoot,
          axeSource: axeCore.source
        });
        pages.push(pageResult.pageRecord);
        normalized.push(...pageResult.findings);
        await context.close();

        if (viewport.name === "desktop") {
          for (const link of pageResult.discoveredLinks) {
            if (visited.size + queue.length >= maxPages) break;
            if (!visited.has(link) && shouldVisit(link, config)) queue.push({ url: link, depth: item.depth + 1 });
          }
        }
      }

      await delay(config.rateLimitMs);
    }
  } finally {
    await browser.close();
  }

  const { findings, instances } = materializeFindings(normalized);
  return { pages, findings, instances };
}

async function scanPage(params: {
  page: Page;
  scan: Scan;
  config: ScanConfig;
  url: string;
  viewport: "desktop" | "mobile";
  artifactRoot: string;
  axeSource: string;
}) {
  const { page, scan, config, url, viewport, artifactRoot, axeSource } = params;
  const pageId = `page-${randomUUID()}`;
  const pageDir = path.join(artifactRoot, `${slugify(url).slice(0, 80)}-${viewport}`);
  await mkdir(pageDir, { recursive: true });

  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
  const status = response?.status();
  const title = await page.title().catch(() => "");
  const canonicalUrl = await page
    .locator("link[rel='canonical']")
    .first()
    .getAttribute("href")
    .catch(() => undefined);
  const screenshotPath = path.join(pageDir, "viewport.png");
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => undefined);

  const html = await page.content();
  const domSnapshotPath = path.join(pageDir, "dom.html");
  await writeFile(domSnapshotPath, html, "utf8");

  await page.addScriptTag({ content: axeSource });
  const axeResults = await page.evaluate(async () => {
    return await window.axe.run(document, {
      runOnly: {
        type: "tag",
        values: [
          "wcag2a",
          "wcag2aa",
          "wcag21a",
          "wcag21aa",
          "wcag22aa",
          "best-practice"
        ]
      }
    });
  });
  const rawAxePath = path.join(pageDir, "axe.json");
  await writeFile(rawAxePath, JSON.stringify(axeResults, null, 2), "utf8");

  const pageRecord: ScannedPage = {
    id: pageId,
    scanId: scan.id,
    projectId: scan.projectId,
    url,
    canonicalUrl: canonicalUrl ?? page.url(),
    title,
    httpStatus: status,
    viewport,
    screenshotPath,
    domSnapshotPath,
    rawAxePath,
    discoveredLinks: await discoverLinks(page),
    createdAt: new Date().toISOString()
  };

  const axeFindings = normalizeAxeViolations({
    violations: axeResults.violations,
    scanId: scan.id,
    projectId: scan.projectId,
    pageId,
    url,
    viewport,
    mode: config.scanMode,
    screenshotPath
  });
  const customFindings = await runCustomChecks(page, {
    scanId: scan.id,
    projectId: scan.projectId,
    pageId,
    url,
    viewport,
    mode: config.scanMode,
    screenshotPath
  });
  const keyboard = viewport === "desktop" ? await exploreKeyboard(page, {
    scanId: scan.id,
    projectId: scan.projectId,
    pageId,
    url,
    mode: config.scanMode,
    artifactDir: pageDir
  }) : { findings: [] };

  return {
    pageRecord,
    discoveredLinks: pageRecord.discoveredLinks,
    findings: [...axeFindings, ...customFindings, ...keyboard.findings]
  };
}

async function buildInitialQueue(config: ScanConfig) {
  const urls = [...config.urls];
  if (config.sitemapUrl) {
    const sitemapUrls = await fetchSitemapUrls(config.sitemapUrl).catch(() => []);
    urls.push(...sitemapUrls);
  }

  return unique(urls)
    .filter((url) => shouldVisit(url, config))
    .map((url) => ({ url, depth: 0 }));
}

async function fetchSitemapUrls(sitemapUrl: string) {
  const validation = validateScanUrl(sitemapUrl, {
    allowPrivateNetwork: process.env.ACCESSAUDIT_ALLOW_PRIVATE_NETWORK === "true"
  });
  if (!validation.ok) return [];
  const response = await fetch(validation.url);
  if (!response.ok) return [];
  const xml = await response.text();
  return Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1].trim()).slice(0, 500);
}

async function discoverLinks(page: Page) {
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll<HTMLAnchorElement>("a[href]"))
      .map((link) => link.href)
      .filter(Boolean);
  });
  return unique(links);
}

function shouldVisit(url: string, config: ScanConfig) {
  const validation = validateScanUrl(url, {
    allowPrivateNetwork: process.env.ACCESSAUDIT_ALLOW_PRIVATE_NETWORK === "true",
    allowedDomains: config.sameDomainOnly ? config.urls.map((item) => new URL(item).hostname) : undefined
  });
  if (!validation.ok) return false;
  if (config.includePatterns.length && !config.includePatterns.some((pattern) => validation.url.includes(pattern))) {
    return false;
  }
  if (config.excludePatterns.some((pattern) => validation.url.includes(pattern))) return false;
  return true;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

declare global {
  interface Window {
    axe: {
      run: (context: Document, options: unknown) => Promise<{ violations: Parameters<typeof normalizeAxeViolations>[0]["violations"] }>;
    };
  }
}

export { TOOL_VERSION };
