const CACHE_VERSION = 'portfolio-v1';
const OFFLINE_CACHE = `${CACHE_VERSION}-offline`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;
const PRECACHE = [
    '/offline.html',
    '/manifest.webmanifest',
    '/favicon.svg',
    '/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(OFFLINE_CACHE)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter(
                            (key) =>
                                key.startsWith('portfolio-') &&
                                key !== OFFLINE_CACHE &&
                                key !== ASSET_CACHE,
                        )
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (
        request.method !== 'GET' ||
        url.origin !== self.location.origin ||
        url.pathname.startsWith('/dashboard') ||
        url.pathname.startsWith('/analytics/') ||
        url.pathname.startsWith('/login') ||
        url.pathname.startsWith('/register')
    ) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('/offline.html')),
        );

        return;
    }

    event.respondWith(
        caches.open(ASSET_CACHE).then(async (cache) => {
            const cached = await cache.match(request);
            const network = fetch(request)
                .then((response) => {
                    if (response.ok) {
                        cache.put(request, response.clone());
                    }

                    return response;
                })
                .catch(() => cached);

            return cached || network;
        }),
    );
});
