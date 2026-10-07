# Local implementation verification — 6 October 2026

## Delivered

- Six bilingual projects, genuine public-site screenshots, explicit contribution scope and in-development status.
- Additive migrations, stable project slugs and seed identities, an owner-scoped repeatable importer, dry-run/overwrite modes and legacy Speed Rocket adoption.
- Editable case studies and ordered bilingual galleries in the existing dashboard.
- Responsive public homepage and case studies, shared navigation, persistent locale, first-response RTL, light/dark themes and reduced motion.
- Initial HTML metadata, dynamic visible-project sitemap, and a service worker restricted to a small static-file allowlist.

See [PORTFOLIO-CONTENT.md](PORTFOLIO-CONTENT.md) for sources, adding projects and import commands.

## Automated verification

- PHP suite: **137 passing tests / 761 assertions**, including import repeatability, edit preservation, ambiguity handling, tenant isolation, hidden projects, gallery rollback, multipart clearing and foreign-image rejection, and a dedicated contact limiter that stays independent of analytics traffic.
- PHPStan: zero errors. TypeScript, ESLint, Prettier and production build checked locally; detailed command output is under `storage/logs/`.
- Service worker: three executable tests verify the static allowlist, exclusion of private/Inertia responses and removal of old portfolio caches.
- Playwright checks 390px and 1440px, English/Arabic, light/dark, covers decoding, overflow, case-study navigation, one canonical URL, locale persistence and local contact submission. Evidence is under `storage/app/portfolio-qa/`.
- Mail uses the local log transport. These checks do not demonstrate external inbox delivery.

The downloaded project has no `.git` history. Existing type/lint problems discovered during verification were corrected, including dashboard metric types, CV form field typing, an unavailable animation import, and analytics collection typing. CV JSON handling now also reads old double-encoded records while writing native arrays. This is not a complete redesign of the existing CV editor or its legacy ATS scoring.

## Design restoration requested by the owner

The original animated homepage has been restored, including its Three.js sculpture, shader backgrounds, floating navigation and horizontal project cards. The six projects, case-study links, contribution/status labels, persistent locale and SEO remain. WebGL initialization failures fall back to static backgrounds. The restored version passes TypeScript, targeted ESLint and production build checks. Browser verification passed all eight viewport/locale/theme combinations, case navigation, locale persistence and contact submission. A separate normal-motion smoke check confirmed two canvas elements with no page errors, and a forced WebGL-unavailable check passed. Screenshot: `storage/app/portfolio-qa/restored-desktop.png`. The following performance comparison describes the earlier minimal design and is **not representative of the restored animated homepage**.

## Before / after performance sample (superseded design)

The original homepage source was saved before replacement. Both versions were built against the same installed dependencies, backend and six seeded projects. Three fresh Chromium contexts per version used a 390 × 844 viewport, reduced motion, localhost and no network/CPU throttling. These are development-machine observations, not Lighthouse or production field measurements.

| Measurement | Original homepage | Updated homepage |
| --- | ---: | ---: |
| Homepage JS chunk, minified bytes | 96,588 | 14,226 |
| Homepage static JS dependency graph, gzip bytes | 208,212 | 111,138 |
| Browser-observed loaded build JS bytes | 1,326,633 | 607,360 |
| Median LCP | 1,136 ms | 1,248 ms |
| Median TTFB | 186 ms | 487 ms |

Loaded JavaScript fell by approximately **54%**. LCP did **not** improve in this small sample; variable local PHP response times prevent a confident rendering-speed conclusion. The public homepage no longer initializes WebGL, so it remains usable without GPU support. Original visual components remain available in the codebase. A final small change restored custom gradient backgrounds after this sample; the report is not a byte-exact fingerprint of the final build.

Raw samples: `storage/app/portfolio-qa/performance.json`. Recheck performance on the eventual deployment with realistic network and device conditions.

## Practical limitations

- Speed Rocket's public page currently renders with sparse imagery and pale text in the capture browser. Its cover records that actual page; it is not a fabricated redesign. Replace the cover when the public site is improved.
- Shawerma Krakow redirects to `/KlubHaus/`; the supplied link and backend-only contribution are preserved without inferring technologies or commerce features.
- Case-study galleries are supported but start empty; the supplied captures are used as covers. Empty story/gallery sections stay hidden.
- No deployment, GitHub push, credentials reset, account settings replacement, or deletion of unrelated projects was performed.


## Navigation appearance update

139 PHP tests / 794 assertions passed after adding independent navigation settings. Additional tests cover persistence, preservation across page-palette changes, editor/public serialization and invalid colors/glass ranges. TypeScript and production build passed. Browser tests injected isolated appearance fixtures to verify colors remain identical across light/dark switches and global glass cannot override navigation glass. An isolated editor rendering test verified color inputs and the live glass preview; actual persistence is covered by authenticated PHP feature tests. Screenshots: `navigation-editor.png`, `nav-glass-false.png`, `nav-glass-true.png` under `storage/app/portfolio-qa/`.


## Sign-in redesign — 7 October 2026

The shared authentication layout now uses an editorial split layout, a subtle CSS sculpture, responsive mobile composition and the public portfolio identity. Login text follows the English/Arabic locale. The logo uses the same visible-profile image as the site and falls back to the owner's initials; the browser favicon follows the same rule. No credentials or authentication flows changed. Passkeys, email/password, remember-me and password-reset navigation remain available.

140 PHP tests / 806 assertions passed, including a branding test that excludes hidden profiles. Browser checks cover English/Arabic at 390px and 1239px, one visible heading, no horizontal overflow and password-reset navigation. Screenshots are saved as `login-{width}-{locale}.png` under `storage/app/portfolio-qa/`.
