import { describe, expect, it } from "vitest";
import { isPrivateOrLocalHost, isSameOrSubdomain, validateScanUrl } from "@/lib/security/url-validation";

describe("URL validation and SSRF protection", () => {
  it("accepts public HTTPS URLs", () => {
    const result = validateScanUrl("https://www.example.com/products");
    expect(result.ok).toBe(true);
  });

  it("blocks localhost and private network targets by default", () => {
    expect(validateScanUrl("http://localhost:3000").ok).toBe(false);
    expect(validateScanUrl("http://127.0.0.1:3000").ok).toBe(false);
    expect(validateScanUrl("http://192.168.1.10").ok).toBe(false);
    expect(validateScanUrl("http://169.254.169.254/latest/meta-data").ok).toBe(false);
  });

  it("blocks URLs outside an allow-list", () => {
    const result = validateScanUrl("https://evil.example.net", { allowedDomains: ["example.com"] });
    expect(result.ok).toBe(false);
  });

  it("allows same-domain and subdomain matches", () => {
    expect(isSameOrSubdomain("www.example.com", "example.com")).toBe(true);
    expect(isSameOrSubdomain("example.net", "example.com")).toBe(false);
  });

  it("detects local hostnames", () => {
    expect(isPrivateOrLocalHost("service.local")).toBe(true);
  });
});
