# Project review — 22 October 2026

## Fixes

- Removed the obsolete `public/sitemap.xml` that bypassed Laravel's dynamic sitemap on real web servers. Added a regression assertion that this file stays absent.
- Fixed CV update authorization to check the actual CV, rather than calling an instance policy with a class name.
- Scoped CV listing and creation to the portfolio owner for authorized team members. Repeated creation preserves the existing CV and its edits instead of failing on the unique owner constraint.
- Connected the CV Delete action to its authorized endpoint. Added an owner-authorized, escaped, printable preview with browser Save as PDF support; replaced the nonfunctional download placeholder.
- Replaced randomly generated CV scores with a deterministic ten-item content checklist, consistent between the form and server. Existing saved CVs display a fresh checklist without requiring a data rewrite. The UI no longer promises ATS acceptance. Corrected score chart scaling.
- Retained existing portraits and project/skill images until database changes succeed. New portrait uploads are cleaned up if saving fails.
- Made appearance persistence tolerate blocked browser storage and honor an existing appearance cookie. Invalid cookie values fall back to system appearance.
- Restricted the settings entry redirect to GET/HEAD. This avoids generating unsupported QUERY methods after the framework security update.
- Updated vulnerable dependencies within the existing package constraints. Both npm and Composer audits report no known vulnerabilities.
- Improved browser checks to wait for lazy image loading, verify theme cookies, inspect the real sitemap response, and exercise blocked storage and unavailable WebGL. Excluded runtime storage files from ESLint.

## Verification

- Baseline: 148 PHP tests passed before review changes.
- Final PHP suite, including animation settings, multiple repositories and console editing: 160 tests, 1002 assertions passed.
- PHPStan, Pint, TypeScript, ESLint and Prettier passed.
- Three service-worker tests passed, including private/Inertia cache exclusions.
- Production client build succeeded.
- Browser checks passed for eight combinations of mobile/desktop, Arabic/English and light/dark appearance, including project images and case studies.
- Local contact submission, language persistence, sitemap, mobile login, blocked localStorage and WebGL fallback passed.

## Scope and remaining limits

The follow-up adds theme-aware glass settings, border controls, in-page project
details, a shared case-study presentation, multiple repositories, owner-scoped
console content commands with stale-update protection, and missing-cover recovery.
TypeScript and the production build passed; PHPStan passed with a 512 MB CLI limit.
The initial default 128 MB PHPStan run exhausted memory. Local browser inspection
confirmed the full project dialog and restored cover. Deployment verification is
separate from these local checks.

The checks above describe local verification before release. Deployment status must be confirmed separately in Laravel Cloud. Existing portfolio content, credentials and project-section animations were preserved. This release includes the safe experience seeder and the site-wide, scroll-linked MA background with dashboard controls; mouse and touch scrolling, including reverse scrolling, passed browser checks.

The browser contact test uses an in-memory mail transport on the local preview server. Production email delivery, S3 credentials, third-party integrations and hosting configuration require verification in their actual deployment environment. PDF export uses the browser print dialog.

The build still reports a large, lazy-loaded Three.js chunk and an optional font-fallback optimization notice. Neither prevents the build or the tested pages from working. This review fixes reproduced issues and adds coverage; passing checks cannot establish the absence of every possible defect.
