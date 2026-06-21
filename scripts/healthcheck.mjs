const port = process.env.PORT || "3000";
const url = process.env.ACCESS_AUDIT_HEALTHCHECK_URL || `http://127.0.0.1:${port}/api/health`;

const response = await fetch(url);
if (!response.ok) {
  console.error(`Healthcheck failed: ${response.status} ${response.statusText}`);
  process.exit(1);
}

console.log(`Healthcheck ok: ${url}`);
