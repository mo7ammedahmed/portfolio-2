<?php

use App\Enums\TrackingPlatform;
use App\Models\Profile;
use App\Models\Role;
use App\Models\TrackingIntegration;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('an owner can inspect configured pixels and supported connectors', function () {
    $owner = User::factory()->create();
    $profile = Profile::factory()->for($owner)->create();
    TrackingIntegration::factory()->for($profile)->create([
        'platform' => TrackingPlatform::GoogleTag,
        'tracking_id' => 'G-ABC1234567',
        'is_enabled' => true,
    ]);

    $this->actingAs($owner)
        ->get(route('portfolio.integrations.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('admin/integrations/index')
            ->where('hasProfile', true)
            ->has('platforms', count(TrackingPlatform::cases()))
            ->where('platforms.0.key', TrackingPlatform::GoogleTag->value)
            ->where('platforms.0.tracking_id', 'G-ABC1234567')
            ->where('platforms.0.is_enabled', true)
            ->where('platforms.0.id_label', 'Google tag ID')
            ->where('platforms.0.placement', 'Head bootstrap')
            ->where('platforms.0.documentation_url', TrackingPlatform::GoogleTag->documentationUrl())
            ->where('platforms.0.diagnostics_url', TrackingPlatform::GoogleTag->diagnosticsUrl())
            ->where('platforms.0.brand_color', '#4285F4')
            ->where('platforms.0.monogram', 'G')
            ->where('siteUrl', route('home'))
            ->has('detected.googleVerificationFiles'));
});

test('an owner can configure disable and remove a tracking integration', function () {
    $owner = User::factory()->create();
    $profile = Profile::factory()->for($owner)->create();

    $this->actingAs($owner)
        ->put(route('portfolio.integrations.update', TrackingPlatform::MetaPixel), [
            'tracking_id' => '123456789012345',
            'is_enabled' => true,
        ])
        ->assertRedirect(route('portfolio.integrations.index'))
        ->assertSessionHasNoErrors();

    $integration = $profile->trackingIntegrations()->sole();

    expect($integration->platform)->toBe(TrackingPlatform::MetaPixel)
        ->and($integration->tracking_id)->toBe('123456789012345')
        ->and($integration->is_enabled)->toBeTrue();

    $this->actingAs($owner)
        ->put(route('portfolio.integrations.update', TrackingPlatform::MetaPixel), [
            'tracking_id' => '123456789012345',
            'is_enabled' => false,
        ])
        ->assertSessionHasNoErrors();

    expect($integration->fresh()->is_enabled)->toBeFalse();

    $this->actingAs($owner)
        ->delete(route('portfolio.integrations.destroy', TrackingPlatform::MetaPixel))
        ->assertRedirect(route('portfolio.integrations.index'));

    $this->assertModelMissing($integration);
});

test('tracking IDs are validated for their selected platform', function () {
    $owner = User::factory()->create();
    Profile::factory()->for($owner)->create();

    $this->actingAs($owner)
        ->put(route('portfolio.integrations.update', TrackingPlatform::GoogleTagManager), [
            'tracking_id' => 'G-invalid-container',
            'is_enabled' => true,
        ])
        ->assertSessionHasErrors('tracking_id');

    expect(TrackingIntegration::query()->count())->toBe(0);
});

test('the public portfolio only exposes enabled integrations', function () {
    $owner = User::factory()->create();
    $profile = Profile::factory()->for($owner)->create(['is_visible' => true]);
    TrackingIntegration::factory()->for($profile)->create([
        'platform' => TrackingPlatform::GoogleTag,
        'tracking_id' => 'G-ABC1234567',
        'is_enabled' => true,
    ]);
    TrackingIntegration::factory()->for($profile)->create([
        'platform' => TrackingPlatform::MetaPixel,
        'tracking_id' => '123456789012345',
        'is_enabled' => false,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->has('trackingIntegrations', 1)
            ->where('trackingIntegrations.0.platform', 'google_tag')
            ->where('trackingIntegrations.0.tracking_id', 'G-ABC1234567'));
});

test('google tag manager is rendered in the official head and body positions', function () {
    $owner = User::factory()->create();
    $profile = Profile::factory()->for($owner)->create(['is_visible' => true]);
    TrackingIntegration::factory()->for($profile)->create([
        'platform' => TrackingPlatform::GoogleTagManager,
        'tracking_id' => 'GTM-5L7GJKQW',
        'is_enabled' => true,
    ]);

    $content = $this->get(route('home'))
        ->assertOk()
        ->getContent();

    $headClose = mb_strpos($content, '</head>');
    $bodyOpen = mb_strpos($content, '<body');
    $inertiaApp = mb_strpos($content, 'data-page="app"');
    $headBootstrap = mb_strpos($content, 'gtm.start');
    $bodyFallback = mb_strpos($content, 'googletagmanager.com/ns.html?id=GTM-5L7GJKQW');

    expect($content)
        ->toContain('data-tracking-provider="google_tag_manager"')
        ->toContain("'script','dataLayer','GTM-5L7GJKQW'")
        ->and($headBootstrap)->not->toBeFalse()
        ->and($headClose)->not->toBeFalse()
        ->and($headBootstrap)->toBeLessThan($headClose)
        ->and($bodyOpen)->not->toBeFalse()
        ->and($bodyFallback)->not->toBeFalse()
        ->and($bodyFallback)->toBeGreaterThan($bodyOpen)
        ->and($inertiaApp)->not->toBeFalse()
        ->and($bodyFallback)->toBeLessThan($inertiaApp);
});

test('every enabled connector renders its provider bootstrap', function (
    TrackingPlatform $platform,
    string $trackingId,
    array $expectedMarkup,
) {
    $owner = User::factory()->create();
    $profile = Profile::factory()->for($owner)->create(['is_visible' => true]);
    TrackingIntegration::factory()->for($profile)->create([
        'platform' => $platform,
        'tracking_id' => $trackingId,
        'is_enabled' => true,
    ]);

    $content = $this->get(route('home'))
        ->assertOk()
        ->getContent();

    expect($content)->toContain("data-tracking-provider=\"{$platform->value}\"");

    foreach ($expectedMarkup as $expected) {
        expect($content)->toContain($expected);
    }
})->with([
    'Google tag' => [
        TrackingPlatform::GoogleTag,
        'G-ABC1234567',
        ['googletagmanager.com/gtag/js?id=G-ABC1234567', "window.gtag('config', 'G-ABC1234567')"],
    ],
    'Google Tag Manager' => [
        TrackingPlatform::GoogleTagManager,
        'GTM-5L7GJKQW',
        ['gtm.start', 'googletagmanager.com/ns.html?id=GTM-5L7GJKQW'],
    ],
    'Google Search Console' => [
        TrackingPlatform::GoogleSearchConsole,
        'MlBLjk8L0D-TBSquV-4PtBobRbjuJ1pl1PQVatc-wf4',
        ['name="google-site-verification"', 'content="MlBLjk8L0D-TBSquV-4PtBobRbjuJ1pl1PQVatc-wf4"'],
    ],
    'Meta Pixel' => [
        TrackingPlatform::MetaPixel,
        '123456789012345',
        ['connect.facebook.net/en_US/fbevents.js', 'www.facebook.com/tr?id=123456789012345'],
    ],
    'TikTok Pixel' => [
        TrackingPlatform::TikTokPixel,
        'CABC1234567890ABCDE',
        ['analytics.tiktok.com/i18n/pixel/events.js', 'ttq.page()'],
    ],
    'LinkedIn Insight Tag' => [
        TrackingPlatform::LinkedInInsight,
        '1234567',
        ['snap.licdn.com/li.lms-analytics/insight.min.js', 'px.ads.linkedin.com/collect/?pid=1234567'],
    ],
    'X Pixel' => [
        TrackingPlatform::XPixel,
        'abc12',
        ['static.ads-twitter.com/uwt.js', "twq('config', 'abc12')"],
    ],
    'Snapchat Pixel' => [
        TrackingPlatform::SnapchatPixel,
        'ff6f3815-3527-49e3-a5a7-b9681b31daf4',
        ['sc-static.net/scevent.min.js', "snaptr('track', 'PAGE_VIEW')"],
    ],
    'Pinterest Tag' => [
        TrackingPlatform::PinterestTag,
        '1234567890123',
        ['s.pinimg.com/ct/core.js', 'ct.pinterest.com/v3/?event=init'],
    ],
    'Microsoft Clarity' => [
        TrackingPlatform::MicrosoftClarity,
        'abcdefghij',
        ['www.clarity.ms/tag/', '"clarity","script",\'abcdefghij\''],
    ],
]);

test('every connector accepts its documented identifier format', function (
    TrackingPlatform $platform,
    string $trackingId,
) {
    $owner = User::factory()->create();
    $profile = Profile::factory()->for($owner)->create();

    $this->actingAs($owner)
        ->put(route('portfolio.integrations.update', $platform), [
            'tracking_id' => $trackingId,
            'is_enabled' => true,
        ])
        ->assertSessionHasNoErrors();

    $integration = $profile->trackingIntegrations()->sole();

    expect($integration->platform)->toBe($platform)
        ->and($integration->tracking_id)->toBe($trackingId)
        ->and($integration->is_enabled)->toBeTrue();
})->with([
    'Google tag' => [TrackingPlatform::GoogleTag, 'GT-ABC1234567'],
    'Google Tag Manager' => [TrackingPlatform::GoogleTagManager, 'GTM-5L7GJKQW'],
    'Google Search Console' => [TrackingPlatform::GoogleSearchConsole, 'MlBLjk8L0D-TBSquV-4PtBobRbjuJ1pl1PQVatc-wf4'],
    'Meta Pixel' => [TrackingPlatform::MetaPixel, '123456789012345'],
    'TikTok Pixel' => [TrackingPlatform::TikTokPixel, 'CABC1234567890ABCDE'],
    'LinkedIn Insight Tag' => [TrackingPlatform::LinkedInInsight, '1234567'],
    'X Pixel' => [TrackingPlatform::XPixel, 'abc12'],
    'Snapchat Pixel' => [TrackingPlatform::SnapchatPixel, 'ff6f3815-3527-49e3-a5a7-b9681b31daf4'],
    'Pinterest Tag' => [TrackingPlatform::PinterestTag, '1234567890123'],
    'Microsoft Clarity' => [TrackingPlatform::MicrosoftClarity, 'abcdefghij'],
]);

test('disabled connectors do not emit provider markup', function () {
    $owner = User::factory()->create();
    $profile = Profile::factory()->for($owner)->create(['is_visible' => true]);
    TrackingIntegration::factory()->for($profile)->create([
        'platform' => TrackingPlatform::MetaPixel,
        'tracking_id' => '123456789012345',
        'is_enabled' => false,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertDontSee('data-tracking-provider="meta_pixel"', false)
        ->assertDontSee('connect.facebook.net/en_US/fbevents.js', false);
});

test('team members without profile permission cannot manage integrations', function () {
    $owner = User::factory()->create();
    Profile::factory()->for($owner)->create();
    $role = Role::factory()->create([
        'owner_id' => $owner->id,
        'permissions' => [],
    ]);
    $member = User::factory()->create([
        'owner_id' => $owner->id,
        'role_id' => $role->id,
    ]);

    $this->actingAs($member)
        ->get(route('portfolio.integrations.index'))
        ->assertForbidden();
});
