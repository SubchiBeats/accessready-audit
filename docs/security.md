# Security and Responsible Use

Access Audit is designed for authorized testing.

## Guardrails

- Only `http` and `https` URLs are allowed.
- Credentials embedded in URLs are rejected.
- Localhost, loopback, link-local, private IP ranges, multicast, and cloud metadata hosts are blocked unless `ACCESS_AUDIT_ALLOW_PRIVATE_NETWORK=true`.
- Same-domain crawling is enabled by default.
- Scan requests are rate-limited by configuration.
- Passwords are not logged. Demo mode stores only whether a secret was provided.
- HTML snippets are sanitized before persistence.

## Production Recommendations

- Use Supabase Auth and RLS.
- Store credentials in Supabase Vault or a dedicated secret manager.
- Run scanners in isolated workers with egress restrictions.
- Add tenant-specific scan quotas.
- Add audit logs for every scan start, status change, export, and credential update.
- Review robots.txt and contractual scanning permissions.
