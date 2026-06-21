# WCAG, ADA, and Section 508 Mapping

Primary target: WCAG 2.2 Level A and AA.

Secondary modes:

- WCAG 2.1 AA for ADA Title II web/mobile rule alignment.
- Section 508 mode mapped to WCAG 2.0 A/AA where relevant.
- Optional AAA checks are informational and labeled as enhanced guidance.

Examples:

| Check | WCAG | Typical Source |
| --- | --- | --- |
| Missing alt text | 1.1.1 Non-text Content | axe/custom |
| Missing form label | 1.3.1, 3.3.2, 4.1.2 | axe |
| Low color contrast | 1.4.3 Contrast Minimum | axe |
| Keyboard trap | 2.1.2 No Keyboard Trap | keyboard explorer |
| Missing skip link | 2.4.1 Bypass Blocks | custom/manual |
| Focus not visible | 2.4.7 Focus Visible | keyboard explorer |
| Touch target risk | 2.5.8 Target Size Minimum | visual/custom |
| PDF accessibility | Multiple criteria | manual review |

Automated findings should be confirmed in context, especially when severity, legal impact, or exception handling matters.
