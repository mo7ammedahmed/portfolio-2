import { router } from '@inertiajs/react';

type AnalyticsEvent = 'start' | 'pageview' | 'heartbeat' | 'end';

const SESSION_KEY = 'portfolio.analytics.session';
const SESSION_STARTED_KEY = 'portfolio.analytics.started';
const heartbeatInterval = 15_000;

const uuid = (): string =>
    typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (value) =>
              (
                  Number(value) ^
                  (crypto.getRandomValues(new Uint8Array(1))[0] &
                      (15 >> (Number(value) / 4)))
              ).toString(16),
          );

const shouldTrack = (): boolean =>
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    window.location.pathname === '/' &&
    navigator.doNotTrack !== '1' &&
    !document.documentElement.dataset.analyticsInitialized;

export function initializeVisitorAnalytics(): void {
    if (!shouldTrack()) {
        return;
    }

    document.documentElement.dataset.analyticsInitialized = 'true';

    const csrfToken =
        document
            .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.getAttribute('content') ?? '';
    const sessionId = sessionStorage.getItem(SESSION_KEY) ?? uuid();
    const storedStartedAt = Number(sessionStorage.getItem(SESSION_STARTED_KEY));
    const sessionStartedAt =
        Number.isFinite(storedStartedAt) && storedStartedAt > 0
            ? storedStartedAt
            : Date.now();

    sessionStorage.setItem(SESSION_KEY, sessionId);
    sessionStorage.setItem(SESSION_STARTED_KEY, String(sessionStartedAt));

    let pageId = uuid();
    let pageStartedAt = Date.now();
    let currentPath = `${window.location.pathname}${window.location.hash}`;
    const initialUrl = new URL(window.location.href);

    const payload = (event: AnalyticsEvent) => ({
        event,
        session_id: sessionId,
        page_id: pageId,
        path: currentPath,
        title: document.title,
        referrer:
            document.referrer &&
            new URL(document.referrer).origin !== location.origin
                ? document.referrer
                : null,
        duration_seconds: Math.max(
            0,
            Math.round((Date.now() - sessionStartedAt) / 1000),
        ),
        page_duration_seconds: Math.max(
            0,
            Math.round((Date.now() - pageStartedAt) / 1000),
        ),
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_width: window.screen.width,
        screen_height: window.screen.height,
        utm_source: initialUrl.searchParams.get('utm_source'),
        utm_medium: initialUrl.searchParams.get('utm_medium'),
        utm_campaign: initialUrl.searchParams.get('utm_campaign'),
    });

    const send = (event: AnalyticsEvent, beacon = false): void => {
        const data = payload(event);

        if (beacon && navigator.sendBeacon) {
            const formData = new FormData();
            formData.set('_token', csrfToken);

            Object.entries(data).forEach(([key, value]) => {
                if (value !== null) {
                    formData.set(key, String(value));
                }
            });

            navigator.sendBeacon('/analytics/collect', formData);

            return;
        }

        void fetch('/analytics/collect', {
            method: 'POST',
            credentials: 'same-origin',
            keepalive: event === 'end',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
            },
            body: JSON.stringify(data),
        }).catch(() => undefined);
    };

    send('start');

    const heartbeat = window.setInterval(() => {
        if (document.visibilityState === 'visible') {
            send('heartbeat');
        }
    }, heartbeatInterval);

    const stopListening = router.on('navigate', () => {
        if (window.location.pathname !== '/') {
            return;
        }

        send('end');
        pageId = uuid();
        pageStartedAt = Date.now();
        currentPath = `${window.location.pathname}${window.location.hash}`;
        send('pageview');
    });

    window.addEventListener('pagehide', () => {
        window.clearInterval(heartbeat);
        stopListening();
        send('end', true);
    });
}
