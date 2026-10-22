const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
    const browser = await chromium.launch();
    const output = 'storage/app/portfolio-qa';
    fs.mkdirSync(output, { recursive: true });

    try {
        for (const mobile of [false, true]) {
            const context = await browser.newContext({
                viewport: {
                    width: mobile ? 390 : 1440,
                    height: mobile ? 844 : 1000,
                },
                isMobile: mobile,
                hasTouch: mobile,
            });
            const page = await context.newPage();
            const errors = [];
            page.on('pageerror', (error) => errors.push(error.message));
            await page.goto('http://127.0.0.1:8127/', {
                waitUntil: 'networkidle',
            });
            await page.waitForFunction(
                () =>
                    document.querySelector('.portfolio-three-stage')?.dataset
                        .maAssembly === '0.000',
            );
            const client = mobile ? await context.newCDPSession(page) : null;
            const swipe = async (from, to) => {
                await client.send('Input.dispatchTouchEvent', {
                    type: 'touchStart',
                    touchPoints: [{ x: 180, y: from }],
                });

                for (let index = 1; index <= 6; index += 1) {
                    await client.send('Input.dispatchTouchEvent', {
                        type: 'touchMove',
                        touchPoints: [
                            { x: 180, y: from + ((to - from) * index) / 6 },
                        ],
                    });
                }

                await client.send('Input.dispatchTouchEvent', {
                    type: 'touchEnd',
                    touchPoints: [],
                });
            };

            if (mobile) {
                await swipe(700, 180);
            } else {
                await page.mouse.wheel(0, 580);
            }

            await page.waitForFunction(
                () =>
                    scrollY > 50 &&
                    Number(
                        document.querySelector('.portfolio-three-stage').dataset
                            .maAssembly,
                    ) > 0.001,
            );
            await page.evaluate(() =>
                scrollTo(
                    0,
                    (document.documentElement.scrollHeight - innerHeight) / 6,
                ),
            );

            await page.waitForFunction(
                () =>
                    Number(
                        document.querySelector('.portfolio-three-stage').dataset
                            .maAssembly,
                    ) > 0.85,
            );
            await page.locator('.portfolio-three-stage canvas').screenshot({
                path: `${output}/ma-${mobile ? 'touch' : 'desktop'}.png`,
            });

            const beforeReverse = await page.evaluate(() => scrollY);

            if (mobile) {
                await swipe(180, 740);
                await swipe(180, 740);
            } else {
                await page.mouse.wheel(0, -900);
            }

            await page.waitForFunction(
                (before) => scrollY < before - 50,
                beforeReverse,
            );
            await page.evaluate(() => scrollTo(0, 0));

            await page.waitForFunction(
                () =>
                    Number(
                        document.querySelector('.portfolio-three-stage').dataset
                            .maAssembly,
                    ) < 0.05,
            );
            await page.locator('#work').scrollIntoViewIfNeeded();
            await page.waitForFunction(
                () =>
                    document.querySelector('.portfolio-three-stage').dataset
                        .maInfluence === '1.000',
            );
            assert.deepEqual(errors, []);
            console.log(
                JSON.stringify({
                    mobile,
                    scrollAssembly: true,
                    reverse: true,
                    fullPageBackdrop: true,
                }),
            );
            await context.close();
        }
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
