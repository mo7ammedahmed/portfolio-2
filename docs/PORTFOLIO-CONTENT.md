# Portfolio content and import guide

## Content sources and attribution

The owner confirmed full development of Aether School OS, Al Noor School, Speed Rocket, Anwan Print and Portfolio, and **backend development only** for Shawerma Krakow. All six start as `in_progress`; a working public URL is not evidence of completion.

| Seed key | Evidence | Notes |
| --- | --- | --- |
| aether-school-os | https://github.com/mo7ammedahmed/school | Multi-school platform; the public demo at https://school112.laravel.cloud/ is branded Al Noor. This is distinct from the single-school project below. |
| al-noor-school | https://github.com/mo7ammedahmed/school-system | Single-school management; https://school-system.laravel.cloud/ |
| speed-rocket | https://github.com/mo7ammedahmed/speed-rocket-laravel | Laravel, Alpine.js and Tailwind, not React. https://speed-rocket.laravel.cloud/ redirects to `/en`. |
| anwan-print | https://anwanprint.com/ | Website development, not authorship of printed designs or branding. No unverified framework tags. |
| shawerma-krakow | https://shawermakrakow.com/ | Public root redirects to `/KlubHaus/`. Backend contribution only; no unverified payment/order/technology claims. |
| portfolio | https://github.com/mo7ammedahmed/portfolio-2 | Laravel, React, Inertia, TypeScript, Tailwind; https://mohammedahmed.laravel.cloud/ |

Screenshots under `database/content/images/` are genuine public-page captures at 1440×1000, captured on 2026-10-06. They depict the sites at capture time, including any public demo text, and do not establish the developer's business results. The portfolio cover depicts the currently published version. No authenticated screens or private information were captured.

Editorial text is in `database/content/projects.php`. Outcomes describe implemented capabilities rather than growth percentages. Unknown details are left empty. Arabic and English describe the same contribution. The screenshots are editable/replacable through the dashboard after import.

## Local setup

Requirements: PHP compatible with `composer.lock`, Composer, Node and npm, SQLite with PDO enabled.

```powershell
composer install
npm ci
# Create .env from .env.example only if no .env already exists.
# Set APP_URL to the actual local server URL and FILESYSTEM_DISK=public.
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan db:seed --class=LocalPreviewSeeder
# Use the owner ID printed by LocalPreviewSeeder:
php artisan portfolio:import --owner=1 --dry-run
php artisan portfolio:import --owner=1
npm run build
php artisan serve --host=127.0.0.1 --port=8127
```

`LocalPreviewSeeder` runs only in `APP_ENV=local`, creates a minimal visible profile if missing, and uses an unknown random password for a newly created preview owner. It does not replace an existing password or expose credentials. To sign in locally, run `php artisan portfolio:local-access --owner=1` (use the actual owner ID). Open its private, expiring link and choose a password, then sign in with the owner email printed by the command. No password is overwritten by this command and no email is sent. It is unavailable outside `APP_ENV=local`. The normal password-reset flow is also available; local mail goes to the log. Existing production owners do not need this seeder.

`DemoPortfolioSeeder` preserves the old sample dataset for explicit demo use. Do not run it to import real work. `ProjectSeeder` requires `PORTFOLIO_SEED_OWNER_ID` in the environment. `DatabaseSeeder` also supports a fresh local setup: with `APP_ENV=local`, no selected owner and an empty users table, it creates the local preview owner/profile before importing. Subsequent local runs use that known preview email and preserve existing edits/passwords. A populated database without that preview owner still requires an explicit owner; nonlocal environments never bootstrap preview accounts.

## Import behavior

```powershell
php artisan portfolio:import --owner=123 --dry-run
php artisan portfolio:import --owner=123
php artisan portfolio:import --owner=123 --overwrite --dry-run
php artisan portfolio:import --owner=123 --overwrite
```

- Default: create missing projects and preserve all existing project fields, gallery and skill links.
- `--overwrite`: update manifest-managed content and skill links only. Existing public slugs and dashboard galleries remain stable. No unrelated records are deleted.
- A single legacy Speed Rocket is adopted by name or its known previous/current URLs. The default run adds its seed identity but preserves its description, links and skills. Use explicit overwrite to apply the verified new copy and Alpine.js tags. Multiple legacy matches stop the entire import before writes.
- Dry run validates the entire manifest and local image paths without writing records, media or seed identities.
- Public slugs are globally unique. Seed keys are unique per owner. A collision with another project fails explicitly.
- Categories and skills belong to the selected owner. Existing category/skill descriptions are not rewritten. Media filenames include owner, key and content hash, so repeats do not duplicate files.
- An image/storage failure rolls back database writes and removes newly created files. Import does not garbage-collect old files or overwrite unrelated media.
- Use a publicly readable configured media disk. Development uses `public`; S3-compatible deployment uses its existing configuration. Changing disks does not automatically migrate old assets.

## Add a project

1. Add a record to `database/content/projects.php` with a new stable `seed_key` and `slug`.
2. Supply both names/summaries, contribution, verified optional story fields, category, technologies, ordering and visibility.
3. Add a genuine JPEG screenshot under `database/content/images/` and set its `cover` path. A null cover is permitted; the UI renders a text fallback.
4. Run the dry run, then import for the intended owner. Do not use `migrate:fresh` on an existing database.
5. Open the project in the dashboard to refine content or add up to 12 gallery images with Arabic/English descriptions and ordering. Empty optional sections are hidden publicly.

## Checks and deployment

```powershell
php artisan wayfinder:generate --with-form
npm run types:check
npm run lint:check
npm run format:check
composer test
npm run build
node --test tests/browser/service-worker.test.cjs
```

Feature tests use SQLite in memory, fake media disks and fake mail. Run the browser script against a local seeded database only (it submits one clearly labeled QA message): `PORTFOLIO_QA_URL` sets the server URL. Install Playwright separately or provide `PLAYWRIGHT_MODULE` to its module location, then run `node scripts/portfolio-browser-check.cjs`.

Deployment remains a separate action. Back up the database/media, run additive migrations, preview the import with the actual owner ID, import, build, and confirm sitemap/metadata/media URLs. Keep the queue worker running for contact notifications; local `MAIL_MAILER=log` must not be mistaken for email delivery to a real inbox.

Public pages use `/` and `/work/{slug}`. `/sitemap.xml` includes only visible projects for the first visible profile, matching the homepage. Locale is persisted by the `portfolio_locale` cookie. The service worker caches only explicitly listed public static files and never HTML, Inertia payloads or authenticated data.


## Independent navigation appearance

Open **Dashboard → Profile → شريط التنقل / Navigation bar**. Set the background, regular/hover text, active background/text and border colors. Enable **Glass navigation** to reveal the chosen background with adjustable opacity (10–100%) and blur (0–40px). The preview updates immediately; use **Save profile** to persist changes.

These settings are independent of page light/dark palettes and the global glass option. Existing installations receive defaults that preserve the dark navigation bar. Run `php artisan migrate` when installing this update. Browsers without backdrop-filter use an opaque background for readability.


### Recover from a local reset that stopped during seeding

Once migrations have completed, run `php artisan db:seed`; another `migrate:refresh` is unnecessary. The default local seeder now initializes an empty database in the correct order and imports the six projects. This recreates the shipped content, not any manual data deleted by the reset. An explicitly configured `PORTFOLIO_SEED_OWNER_ID` must refer to an existing owner; the seeder never silently replaces it with another account.

The local preview email is `mohammed.abozamel112@gmail.com`; `test@example.com` is not created by the real-project seeders. Do not use sample-account credentials from the old demo data.
