const CACHE = 'portfolio-v2-public';
const PUBLIC_FILES = ['/offline.html', '/favicon.svg', '/apple-touch-icon.png'];
self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PUBLIC_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
    event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('portfolio-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('X-Inertia')) return;
    // Only public document navigations receive an offline fallback. Never cache HTML or JSON.
    if (request.mode === 'navigate' && (url.pathname === '/' || /^\/work\/[a-z0-9-]+$/.test(url.pathname))) {
        event.respondWith(fetch(request).catch(() => caches.match('/offline.html')));
        return;
    }
    // No authenticated routes, storage media, query strings or API data are cached.
    if (url.search || !PUBLIC_FILES.includes(url.pathname)) return;
    event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(request)) || fetch(request)));
});
