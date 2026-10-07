const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

function worker() {
    const handlers = {};
    const deleted = [];
    vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), {
        URL, Promise,
        self: { location: { origin: 'https://portfolio.test' }, addEventListener: (name, fn) => {
 handlers[name] = fn; 
}, clients: { claim() {} }, skipWaiting() {} },
        caches: { keys: async () => ['portfolio-v1-assets', 'portfolio-v1-offline', 'portfolio-v2-public', 'other-app'], delete: async key => deleted.push(key), open: async () => ({ match: async () => 'static-file', addAll: async () => {} }), match: async () => 'offline' },
        fetch: async () => 'network',
    });

    return { handlers, deleted };
}

test('only allowlisted static public files are intercepted for caching', async () => {
    const { handlers } = worker();

    for (const path of ['/dashboard', '/settings/profile', '/analytics/collect', '/storage/private.jpg', '/work/test', '/manifest.webmanifest', '/favicon.svg?private=1']) {
        let intercepted = false;
        handlers.fetch({ request: { url: 'https://portfolio.test' + path, method: 'GET', mode: 'cors', headers: new Headers() }, respondWith() {
 intercepted = true; 
} });
        assert.equal(intercepted, false, path);
    }

    let result;
    handlers.fetch({ request: { url: 'https://portfolio.test/favicon.svg', method: 'GET', mode: 'cors', headers: new Headers() }, respondWith(value) {
 result = value; 
} });
    assert.equal(await result, 'static-file');
});
test('Inertia requests and mutations are never intercepted', () => {
    const { handlers } = worker();

    for (const [method, headers] of [['GET', new Headers({ 'X-Inertia': 'true' })], ['POST', new Headers()]]) {
        handlers.fetch({ request: { url: 'https://portfolio.test/', method, mode: 'navigate', headers }, respondWith() {
 assert.fail('Private response intercepted'); 
} });
    }
});
test('activation removes old portfolio caches without touching another application', async () => {
    const { handlers, deleted } = worker();
    let done;
    handlers.activate({ waitUntil(promise) {
 done = promise; 
} });
    await done;
    assert.deepEqual(deleted.sort(), ['portfolio-v1-assets', 'portfolio-v1-offline']);
});
