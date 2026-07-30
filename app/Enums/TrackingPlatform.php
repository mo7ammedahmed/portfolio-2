<?php

declare(strict_types=1);

namespace App\Enums;

enum TrackingPlatform: string
{
    case GoogleTag = 'google_tag';
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

    public function validationPattern(): string
    {
        return match ($this) {
            self::GoogleTag => '/^(?:G|GT|AW|DC)-[A-Z0-9]+$/i',
            self::GoogleTagManager => '/^GTM-[A-Z0-9]+$/i',
            self::GoogleSearchConsole => '/^[A-Z0-9_-]{20,200}$/i',
            self::MetaPixel,
            self::LinkedInInsight,
            self::PinterestTag => '/^[0-9]{5,30}$/',
            self::TikTokPixel,
            self::XPixel,
            self::MicrosoftClarity => '/^[A-Z0-9]{5,40}$/i',
            self::SnapchatPixel => '/^[A-Z0-9-]{10,64}$/i',
        };
    }
}
