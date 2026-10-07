<?php

declare(strict_types=1);

namespace App\Enums;

enum TrackingPlatform: string
{
    case GoogleTag = 'google_tag';
    case GoogleAds = 'google_ads';
    case GoogleTagManager = 'google_tag_manager';
    case GoogleSearchConsole = 'google_search_console';
    case MetaPixel = 'meta_pixel';
    case TikTokPixel = 'tiktok_pixel';
    case LinkedInInsight = 'linkedin_insight';
    case XPixel = 'x_pixel';
    case SnapchatPixel = 'snapchat_pixel';
    case PinterestTag = 'pinterest_tag';
    case MicrosoftClarity = 'microsoft_clarity';

    public function label(): string
    {
        return match ($this) {
            self::GoogleTag => 'Google tag',
            self::GoogleAds => 'Google Ads',
            self::GoogleTagManager => 'Google Tag Manager',
            self::GoogleSearchConsole => 'Google Search Console',
            self::MetaPixel => 'Meta Pixel',
            self::TikTokPixel => 'TikTok Pixel',
            self::LinkedInInsight => 'LinkedIn Insight Tag',
            self::XPixel => 'X Pixel',
            self::SnapchatPixel => 'Snapchat Pixel',
            self::PinterestTag => 'Pinterest Tag',
            self::MicrosoftClarity => 'Microsoft Clarity',
        };
    }

    public function category(): string
    {
        return match ($this) {
            self::GoogleTag,
            self::GoogleAds,
            self::GoogleTagManager,
            self::GoogleSearchConsole => 'Google',
            self::MetaPixel,
            self::TikTokPixel,
            self::LinkedInInsight,
            self::XPixel,
            self::SnapchatPixel,
            self::PinterestTag => 'Advertising pixels',
            self::MicrosoftClarity => 'Behavior analytics',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::GoogleTag => 'Connect Google Analytics 4, Google Ads, or another Google destination with a G-, GT-, AW-, or DC- tag ID.',
            self::GoogleAds => 'Connect a Google Ads destination for remarketing and conversion measurement with an AW- tag ID.',
            self::GoogleTagManager => 'Load a GTM container so tags and events can be managed from Google Tag Manager.',
            self::GoogleSearchConsole => 'Publish a Google site-verification meta token for ownership verification.',
            self::MetaPixel => 'Measure page views and campaign activity with Meta Events Manager.',
            self::TikTokPixel => 'Send page-view activity to a TikTok Events Manager pixel.',
            self::LinkedInInsight => 'Enable LinkedIn campaign attribution and website demographics.',
            self::XPixel => 'Measure visits and conversion activity for X Ads campaigns.',
            self::SnapchatPixel => 'Send page-view events to Snapchat Ads Manager.',
            self::PinterestTag => 'Measure visits and campaign conversions with Pinterest.',
            self::MicrosoftClarity => 'Enable privacy-aware session insights and heatmaps from Microsoft Clarity.',
        };
    }

    public function placeholder(): string
    {
        return match ($this) {
            self::GoogleTag => 'G-XXXXXXXXXX',
            self::GoogleAds => 'AW-XXXXXXXXX',
            self::GoogleTagManager => 'GTM-XXXXXXX',
            self::GoogleSearchConsole => 'Verification token',
            self::MetaPixel => '123456789012345',
            self::TikTokPixel => 'CXXXXXXXXXXXXXXXXX',
            self::LinkedInInsight => '1234567',
            self::XPixel => 'abc12',
            self::SnapchatPixel => 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            self::PinterestTag => '1234567890123',
            self::MicrosoftClarity => 'abcdefghij',
        };
    }

    public function idLabel(): string
    {
        return match ($this) {
            self::GoogleTag => 'Google tag ID',
            self::GoogleAds => 'Google Ads destination ID',
            self::GoogleTagManager => 'Container ID',
            self::GoogleSearchConsole => 'Verification token',
            self::MetaPixel => 'Dataset / Pixel ID',
            self::TikTokPixel => 'Pixel ID',
            self::LinkedInInsight => 'Partner ID',
            self::XPixel => 'Pixel ID',
            self::SnapchatPixel => 'Pixel ID',
            self::PinterestTag => 'Tag ID',
            self::MicrosoftClarity => 'Project ID',
        };
    }

    public function placement(): string
    {
        return match ($this) {
            self::GoogleTagManager => 'Head bootstrap + body fallback',
            self::GoogleSearchConsole => 'Homepage head metadata',
            self::MetaPixel,
            self::LinkedInInsight,
            self::PinterestTag => 'Head bootstrap + image fallback',
            self::GoogleTag,
            self::GoogleAds,
            self::TikTokPixel,
            self::XPixel,
            self::SnapchatPixel,
            self::MicrosoftClarity => 'Head bootstrap',
        };
    }

    public function documentationUrl(): string
    {
        return match ($this) {
            self::GoogleTag => 'https://developers.google.com/tag-platform/gtagjs',
            self::GoogleAds => 'https://support.google.com/google-ads/answer/15756614',
            self::GoogleTagManager => 'https://support.google.com/tagmanager/answer/14847097',
            self::GoogleSearchConsole => 'https://support.google.com/webmasters/answer/9008080',
            self::MetaPixel => 'https://www.facebook.com/help/messenger-app/952192354843755',
            self::TikTokPixel => 'https://ads.tiktok.com/help/article/get-started-pixel',
            self::LinkedInInsight => 'https://www.linkedin.com/help/linkedin/answer/a418882',
            self::XPixel => 'https://business.x.com/en/help/campaign-measurement-and-analytics/conversion-tracking-for-websites',
            self::SnapchatPixel => 'https://developers.snap.com/marketing-api/Ads-API/snap-pixel',
            self::PinterestTag => 'https://help.pinterest.com/en/business/article/install-the-pinterest-tag',
            self::MicrosoftClarity => 'https://learn.microsoft.com/clarity/setup-and-installation/clarity-setup',
        };
    }

    public function diagnosticsUrl(): string
    {
        return match ($this) {
            self::GoogleTag,
            self::GoogleAds,
            self::GoogleTagManager => 'https://tagassistant.google.com/',
            self::GoogleSearchConsole => 'https://search.google.com/search-console',
            self::MetaPixel => 'https://business.facebook.com/events_manager2',
            self::TikTokPixel => 'https://ads.tiktok.com/i18n/events_manager/',
            self::LinkedInInsight => 'https://www.linkedin.com/campaignmanager/',
            self::XPixel => 'https://ads.x.com/',
            self::SnapchatPixel => 'https://ads.snapchat.com/',
            self::PinterestTag => 'https://ads.pinterest.com/conversions/',
            self::MicrosoftClarity => 'https://clarity.microsoft.com/projects',
        };
    }

    public function diagnosticsLabel(): string
    {
        return match ($this) {
            self::GoogleTag,
            self::GoogleAds,
            self::GoogleTagManager => 'Open Tag Assistant',
            self::GoogleSearchConsole => 'Open Search Console',
            self::MetaPixel => 'Open Events Manager',
            self::TikTokPixel => 'Open Events Manager',
            self::LinkedInInsight => 'Open Campaign Manager',
            self::XPixel => 'Open X Ads',
            self::SnapchatPixel => 'Open Ads Manager',
            self::PinterestTag => 'Open Conversions',
            self::MicrosoftClarity => 'Open Clarity',
        };
    }

    public function brandColor(): string
    {
        return match ($this) {
            self::GoogleTag => '#4285F4',
            self::GoogleAds => '#F9AB00',
            self::GoogleTagManager => '#246FDB',
            self::GoogleSearchConsole => '#34A853',
            self::MetaPixel => '#1877F2',
            self::TikTokPixel => '#25F4EE',
            self::LinkedInInsight => '#0A66C2',
            self::XPixel => '#111111',
            self::SnapchatPixel => '#F5D90A',
            self::PinterestTag => '#E60023',
            self::MicrosoftClarity => '#1683FF',
        };
    }

    public function monogram(): string
    {
        return match ($this) {
            self::GoogleTag => 'G',
            self::GoogleAds => 'ADS',
            self::GoogleTagManager => 'GTM',
            self::GoogleSearchConsole => 'GSC',
            self::MetaPixel => 'M',
            self::TikTokPixel => 'TT',
            self::LinkedInInsight => 'in',
            self::XPixel => 'X',
            self::SnapchatPixel => 'S',
            self::PinterestTag => 'P',
            self::MicrosoftClarity => 'C',
        };
    }

    public function hasBodyFallback(): bool
    {
        return match ($this) {
            self::GoogleTagManager,
            self::MetaPixel,
            self::LinkedInInsight,
            self::PinterestTag => true,
            default => false,
        };
    }

    public function headCodeMarker(): string
    {
        return match ($this) {
            self::GoogleTag => 'googletagmanager.com/gtag/js',
            self::GoogleAds => 'googletagmanager.com/gtag/js',
            self::GoogleTagManager => 'googletagmanager.com/gtm.js',
            self::GoogleSearchConsole => 'google-site-verification',
            self::MetaPixel => 'connect.facebook.net',
            self::TikTokPixel => 'analytics.tiktok.com',
            self::LinkedInInsight => 'snap.licdn.com',
            self::XPixel => 'static.ads-twitter.com',
            self::SnapchatPixel => 'sc-static.net',
            self::PinterestTag => 's.pinimg.com',
            self::MicrosoftClarity => 'clarity.ms/tag',
        };
    }

    public function bodyCodeMarker(): ?string
    {
        return match ($this) {
            self::GoogleTagManager => 'googletagmanager.com/ns.html',
            self::MetaPixel => 'facebook.com/tr',
            self::LinkedInInsight => 'px.ads.linkedin.com',
            self::PinterestTag => 'ct.pinterest.com',
            default => null,
        };
    }

    public function validationPattern(): string
    {
        return match ($this) {
            self::GoogleTag => '/^(?:G|GT|AW|DC)-[A-Z0-9]+$/i',
            self::GoogleAds => '/^AW-\d{5,30}$/',
            self::GoogleTagManager => '/^GTM-[A-Z0-9]+$/i',
            self::GoogleSearchConsole => '/^[A-Z0-9_-]{20,200}$/i',
            self::MetaPixel,
            self::LinkedInInsight,
            self::PinterestTag => '/^\d{5,30}$/',
            self::TikTokPixel,
            self::XPixel,
            self::MicrosoftClarity => '/^[A-Z0-9]{5,40}$/i',
            self::SnapchatPixel => '/^[A-F0-9]{8}-(?:[A-F0-9]{4}-){3}[A-F0-9]{12}$/i',
        };
    }
}
