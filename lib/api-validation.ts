import { z } from "zod";

export const complianceModeSchema = z.enum(["wcag22-aa", "wcag21-aa", "section508", "custom"]);
export const findingStatusSchema = z.enum([
  "open",
  "in-progress",
  "needs-review",
  "fixed",
  "accepted-risk",
  "false-positive"
]);
export const manualStatusSchema = z.enum(["pass", "fail", "not-applicable", "not-started"]);

export const projectCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  primaryUrl: z.string().trim().url(),
  urls: z.array(z.string().trim().url()).min(1).max(200),
  complianceMode: complianceModeSchema,
  crawlDepth: z.number().int().min(0).max(5).default(2),
  maxPages: z.number().int().min(1).max(500).default(25),
  includePatterns: z.array(z.string().trim().max(200)).max(50).default([]),
  excludePatterns: z.array(z.string().trim().max(200)).max(50).default([]),
  sitemapUrl: z.string().trim().url().optional().or(z.literal("")),
  sameDomainOnly: z.boolean().default(true),
  rateLimitMs: z.number().int().min(250).max(10_000).default(750),
  responsibleUseAccepted: z.boolean(),
  auth: z
    .object({
      loginUrl: z.string().trim().url().optional().or(z.literal("")),
      username: z.string().trim().max(200).optional(),
      passwordProvided: z.boolean().optional(),
      cookieImportLabel: z.string().trim().max(200).optional()
    })
    .optional()
});

export const scanStartSchema = z.object({
  projectId: z.string().min(1),
  configId: z.string().optional(),
  demo: z.boolean().optional()
});

export const findingUpdateSchema = z.object({
  status: findingStatusSchema
});

export const manualCheckUpdateSchema = z.object({
  id: z.string().min(1),
  status: manualStatusSchema.optional(),
  notes: z.string().max(4000).optional(),
  assignee: z.string().max(200).optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
  dueDate: z.string().max(40).optional(),
  remediationStatus: findingStatusSchema.optional()
});

export const reportCreateSchema = z.object({
  projectId: z.string().min(1),
  scanId: z.string().min(1),
  kind: z.enum(["executive-pdf", "technical-pdf", "csv", "json", "developer-checklist", "vpat-draft"]),
  title: z.string().trim().min(2).max(180)
});
