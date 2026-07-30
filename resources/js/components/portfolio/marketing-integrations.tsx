import { Head } from '@inertiajs/react';
import { useEffect } from 'react';
import type { TrackingIntegration } from '@/types';

type Command = (...args: unknown[]) => void;

type QueuedCommand = Command & {
    callMethod?: Command;
    loaded?: boolean;
    push?: QueuedCommand;
    queue: unknown[][];
    version?: string;
};

type TikTokInstance = unknown[] & {
    _u?: string;
};

type TikTokQueue = unknown[][] & {
    _i?: Record<string, TikTokInstance>;
    _o?: Record<string, object>;
    _t?: Record<string, number>;
    load?: (trackingId: string, options?: object) => void;
    page?: Command;
};

type TrackingWindow = Window & {
    _linkedin_data_partner_ids?: string[];
    _linkedin_partner_id?: string;
    clarity?: QueuedCommand;
    dataLayer?: unknown[];
    fbq?: QueuedCommand;
    gtag?: Command;
    pintrk?: QueuedCommand;
    snaptr?: QueuedCommand;
    ttq?: TikTokQueue;
    twq?: QueuedCommand;
};

const initializedIntegrations = new Set<string>();

function loadScript(id: string, source: string): void {
    if (document.getElementById(id)) {
        return;
    }

    const script = document.createElement('script');

    script.id = id;
    script.async = true;
    script.src = source;
    document.head.append(script);
}

function createQueuedCommand(): QueuedCommand {
    const command = ((...args: unknown[]) => {
        if (command.callMethod) {
            command.callMethod(...args);
        } else {
            command.queue.push(args);
        }
    }) as QueuedCommand;

    command.queue = [];

    return command;
}

function createTikTokQueue(): TikTokQueue {
    const entries: unknown[][] = [];

    return Object.assign(entries, {
        page: (...args: unknown[]) => {
            entries.push(['page', ...args]);
        },
    });
}

function initializeGoogleTags(integrations: TrackingIntegration[]): void {
    const trackingWindow = window as TrackingWindow;
    const googleTags = integrations.filter(
        ({ platform }) => platform === 'google_tag',
    );

    if (googleTags.length === 0) {
        return;
    }

    trackingWindow.dataLayer ??= [];
    trackingWindow.gtag ??= (...args: unknown[]) => {
        trackingWindow.dataLayer?.push(args);
    };

    const firstTag = googleTags[0].tracking_id;

    loadScript(
        'portfolio-google-tag',
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(firstTag)}`,
    );
    trackingWindow.gtag('js', new Date());

    googleTags.forEach(({ tracking_id: trackingId }) => {
        trackingWindow.gtag?.('config', trackingId);
    });
}

function initializeGoogleTagManager(trackingId: string): void {
    const trackingWindow = window as TrackingWindow;

    trackingWindow.dataLayer ??= [];
    trackingWindow.dataLayer.push({
        'gtm.start': Date.now(),
        event: 'gtm.js',
    });
    loadScript(
        `portfolio-${trackingId}`,
        `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(trackingId)}`,
    );
}

function initializeMetaPixel(trackingId: string): void {
    const trackingWindow = window as TrackingWindow;

    trackingWindow.fbq ??= createQueuedCommand();
    trackingWindow.fbq.push = trackingWindow.fbq;
    trackingWindow.fbq.loaded = true;
    trackingWindow.fbq.version = '2.0';
    loadScript(
        'portfolio-meta-pixel',
        'https://connect.facebook.net/en_US/fbevents.js',
    );
    trackingWindow.fbq('init', trackingId);
    trackingWindow.fbq('track', 'PageView');
}

function initializeTikTokPixel(trackingId: string): void {
    const trackingWindow = window as TrackingWindow;
    const queue = (trackingWindow.ttq ??= createTikTokQueue());
    queue.load ??= (pixelId, options = {}) => {
        queue._i ??= {};
        queue._i[pixelId] = [] as TikTokInstance;
        queue._i[pixelId]._u =
            'https://analytics.tiktok.com/i18n/pixel/events.js';
        queue._t ??= {};
        queue._t[pixelId] = Date.now();
        queue._o ??= {};
        queue._o[pixelId] = options;
        const source = queue._i[pixelId]._u;

        loadScript(
            `portfolio-tiktok-${pixelId}`,
            `${source}?sdkid=${encodeURIComponent(pixelId)}&lib=ttq`,
        );
    };

    queue.load?.(trackingId);
    queue.page?.();
}

function initializeLinkedInInsight(trackingId: string): void {
    const trackingWindow = window as TrackingWindow;

    trackingWindow._linkedin_partner_id = trackingId;
    trackingWindow._linkedin_data_partner_ids ??= [];
    trackingWindow._linkedin_data_partner_ids.push(trackingId);
    loadScript(
        'portfolio-linkedin-insight',
        'https://snap.licdn.com/li.lms-analytics/insight.min.js',
    );
}

function initializeXPixel(trackingId: string): void {
    const trackingWindow = window as TrackingWindow;

    trackingWindow.twq ??= createQueuedCommand();
    trackingWindow.twq.version = '1.1';
    loadScript('portfolio-x-pixel', 'https://static.ads-twitter.com/uwt.js');
    trackingWindow.twq('config', trackingId);
}

function initializeSnapchatPixel(trackingId: string): void {
    const trackingWindow = window as TrackingWindow;

    trackingWindow.snaptr ??= createQueuedCommand();
    loadScript(
        'portfolio-snapchat-pixel',
        'https://sc-static.net/scevent.min.js',
    );
    trackingWindow.snaptr('init', trackingId);
    trackingWindow.snaptr('track', 'PAGE_VIEW');
}

function initializePinterestTag(trackingId: string): void {
    const trackingWindow = window as TrackingWindow;

    trackingWindow.pintrk ??= createQueuedCommand();
    loadScript('portfolio-pinterest-tag', 'https://s.pinimg.com/ct/core.js');
    trackingWindow.pintrk('load', trackingId);
    trackingWindow.pintrk('page');
}

function initializeMicrosoftClarity(trackingId: string): void {
    const trackingWindow = window as TrackingWindow;

    trackingWindow.clarity ??= createQueuedCommand();
    loadScript(
        'portfolio-microsoft-clarity',
        `https://www.clarity.ms/tag/${encodeURIComponent(trackingId)}`,
    );
}

function initializeIntegration(integration: TrackingIntegration): void {
    const key = `${integration.platform}:${integration.tracking_id}`;

    if (initializedIntegrations.has(key)) {
        return;
    }

    initializedIntegrations.add(key);

    switch (integration.platform) {
        case 'google_tag_manager':
            initializeGoogleTagManager(integration.tracking_id);
            break;
        case 'meta_pixel':
            initializeMetaPixel(integration.tracking_id);
            break;
        case 'tiktok_pixel':
            initializeTikTokPixel(integration.tracking_id);
            break;
        case 'linkedin_insight':
            initializeLinkedInInsight(integration.tracking_id);
            break;
        case 'x_pixel':
            initializeXPixel(integration.tracking_id);
            break;
        case 'snapchat_pixel':
            initializeSnapchatPixel(integration.tracking_id);
            break;
        case 'pinterest_tag':
            initializePinterestTag(integration.tracking_id);
            break;
        case 'microsoft_clarity':
            initializeMicrosoftClarity(integration.tracking_id);
            break;
    }
}

export function MarketingIntegrations({
    integrations,
}: {
    integrations: TrackingIntegration[];
}) {
    const isServerRendered =
        typeof document !== 'undefined' &&
        document.body.dataset.trackingServerRendered === 'true';
    const verificationToken = integrations.find(
        ({ platform }) => platform === 'google_search_console',
    )?.tracking_id;

    useEffect(() => {
        if (document.body.dataset.trackingServerRendered === 'true') {
            return;
        }

        initializeGoogleTags(integrations);
        integrations.forEach(initializeIntegration);
        document.body.dataset.trackingServerRendered = 'client';
    }, [integrations]);

    return verificationToken && !isServerRendered ? (
        <Head>
            <meta
                head-key="google-site-verification"
                name="google-site-verification"
                content={verificationToken}
            />
        </Head>
    ) : null;
}
