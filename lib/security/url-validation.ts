import { isIP } from "node:net";
import { z } from "zod";

export interface UrlValidationOptions {
  allowPrivateNetwork?: boolean;
  allowedDomains?: string[];
}

const urlSchema = z.string().url().max(2048);

export function validateScanUrl(input: string, options: UrlValidationOptions = {}) {
  const parsed = urlSchema.safeParse(input.trim());
  if (!parsed.success) {
    return { ok: false as const, reason: "Enter a valid absolute URL." };
  }

  let url: URL;
  try {
    url = new URL(parsed.data);
  } catch {
    return { ok: false as const, reason: "Enter a valid absolute URL." };
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return { ok: false as const, reason: "Only http and https URLs can be scanned." };
  }

  if (url.username || url.password) {
    return { ok: false as const, reason: "Credentials must not be embedded in URLs." };
  }

  const hostname = url.hostname.toLowerCase();
  if (!options.allowPrivateNetwork && isPrivateOrLocalHost(hostname)) {
    return { ok: false as const, reason: "Private, loopback, link-local, and metadata hosts are blocked." };
  }

  if (options.allowedDomains?.length) {
    const allowed = options.allowedDomains.some((domain) => isSameOrSubdomain(hostname, domain));
    if (!allowed) {
      return { ok: false as const, reason: "URL is outside the configured project domain allow-list." };
    }
  }

  return { ok: true as const, url: url.toString(), hostname };
}

export function isPrivateOrLocalHost(hostname: string) {
  const normalized = hostname.replace(/^\[(.*)\]$/, "$1").toLowerCase();
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized === "0.0.0.0" ||
    normalized === "::" ||
    normalized === "::1"
  ) {
    return true;
  }

  if (normalized === "169.254.169.254") return true;

  if (isIP(normalized) === 4) return isPrivateIpv4(normalized);
  if (isIP(normalized) === 6) return isPrivateIpv6(normalized);

  return false;
}

export function isSameOrSubdomain(hostname: string, domain: string) {
  const cleanHost = hostname.toLowerCase().replace(/\.$/, "");
  const cleanDomain = domain.toLowerCase().replace(/^\*\./, "").replace(/\.$/, "");
  return cleanHost === cleanDomain || cleanHost.endsWith(`.${cleanDomain}`);
}

function isPrivateIpv4(ip: string) {
  const parts = ip.split(".").map(Number);
  const [a, b] = parts;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127) ||
    a >= 224
  );
}

function isPrivateIpv6(ip: string) {
  const normalized = ip.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}
