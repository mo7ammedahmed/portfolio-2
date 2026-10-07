/* Local, seeded preview only. Playwright can be supplied through PLAYWRIGHT_MODULE. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.PORTFOLIO_QA_URL || 'http://127.0.0.1:8127';

if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname)) {
throw new Error('QA submissions are restricted to localhost.');
}

const output = 'storage/app/portfolio-qa';
fs.mkdirSync(output, { recursive: true });

(async () => {
    const browser = await chromium.launch({ headless: true });
    const results = [];

    try {
        for (const width of [390, 1440]) {
            for (const locale of ['en', 'ar']) {
                for (const theme of ['light', 'dark']) {
                    const context = await browser.newContext({ viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: 'reduce' });
                    await context.addCookies([{ name: 'portfolio_locale', value: locale, url: base }, { name: 'appearance', value: theme, url: base }]);
                    const page = await context.newPage();
                    const errors = [];
                    page.on('pageerror', error => errors.push(error.message));
                    await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 180000 });
                    await page.locator('.portfolio-project-plate').first().waitFor({ timeout: 60000 });
                    assert.equal(await page.locator('.portfolio-project-plate').count(), 6);
                    assert.equal(await page.locator('html').getAttribute('dir'), locale === 'ar' ? 'rtl' : 'ltr');

                    for (const img of await page.locator('.portfolio-project-plate img').all()) {
                        await img.scrollIntoViewIfNeeded();
                        await img.evaluate(el => el.decode());
                    }

                    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
                    await page.evaluate(() => scrollTo(0, 0));
                    await page.screenshot({ path: `${output}/${width}-${locale}-${theme}.png`, fullPage: true, animations: 'disabled' });
                    await page.locator('.portfolio-project-plate a[href^="/work/"]').first().click();
                    await page.locator('.folio-case h1').waitFor();
                    assert.equal(await page.locator('.folio-case h1').innerText(), locale === 'ar' ? 'Aether — منصة إدارة المدارس' : 'Aether School OS');
                    assert.equal(await page.locator('link[rel=canonical]').count(), 1);
                    assert.ok((await page.locator('link[rel=canonical]').getAttribute('href')).endsWith('/work/aether-school-os'));
                    await page.reload({ waitUntil: 'domcontentloaded' });
                    await page.locator('.folio-case h1').waitFor();
                    assert.equal(await page.locator('html').getAttribute('lang'), locale);
                    await page.screenshot({ path: `${output}/case-${width}-${locale}-${theme}.png`, animations: 'disabled' });
                    assert.deepEqual(errors, []);
                    results.push({ width, locale, theme, passed: true });
                    await context.close();
                }
            }
        }

        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(base, { waitUntil: 'domcontentloaded', timeout: 180000 });
        await page.getByRole('button', { name: 'التبديل إلى العربية' }).click();
        await page.waitForFunction(() => document.documentElement.lang === 'ar');
        await page.reload({ waitUntil: 'domcontentloaded' });
        assert.equal(await page.locator('html').getAttribute('lang'), 'ar');
        await page.getByRole('button', { name: 'Switch to English' }).click();
        await page.waitForFunction(() => document.documentElement.lang === 'en');
        await page.locator('#contact-name').fill('Local portfolio QA');
        await page.locator('#contact-email').fill('qa@example.test');
        await page.locator('#contact-subject').fill('Local preview verification');
        await page.locator('#contact-message').fill('Automated local-only check of the portfolio contact form.');
        await page.getByRole('button', { name: 'Send message', exact: true }).click();
        await page.getByText('Message sent. I’ll get back to you soon.', { exact: true }).waitFor();
        results.push({ contact: true, localePersistence: true });
        await context.close();
    } finally {
        fs.writeFileSync(`${output}/results.json`, JSON.stringify(results, null, 2));
        await browser.close();
    }

    console.log(JSON.stringify(results, null, 2));
})().catch(error => {
 console.error(error); process.exitCode = 1; 
});
