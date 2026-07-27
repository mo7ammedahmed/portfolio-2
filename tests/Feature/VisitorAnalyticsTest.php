<?php

use App\Models\PageView;
use App\Models\Profile;
use App\Models\User;
use App\Models\VisitorSession;
use Inertia\Testing\AssertableInertia as Assert;

function analyticsPayload(array $overrides = []): array
{
    return [
        'event' => 'start',
        'session_id' => '0198a112-e1ac-7173-a958-7cfa9bd44e1a',
        'page_id' => '0198a112-e1ac-7173-a958-7cfa9bd44e1b',
        'path' => '/#home',
        'title' => 'Portfolio',
        'referrer' => 'https://example.com/article',
        'duration_seconds' => 0,
        'page_duration_seconds' => 0,
        'language' => 'en-US',
        'timezone' => 'Asia/Riyadh',
        'screen_width' => 1440,
        'screen_height' => 900,
        ...$overrides,
    ];
}

test('the collector creates an anonymous visitor session and page view', function () {
    $profile = Profile::factory()->create();

    $this->withHeader(
        'User-Agent',
        'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/126.0',
    )
        ->postJson(route('analytics.collect'), analyticsPayload())
        ->assertAccepted()
        ->assertJson(['accepted' => true]);

    $session = VisitorSession::query()->firstOrFail();

    expect($session->profile_id)->toBe($profile->id)
        ->and($session->visitor_hash)->toHaveLength(64)
        ->and($session->visitor_hash)->not->toContain('127.0.0.1')
        ->and($session->browser)->toBe('Chrome')
        ->and($session->platform)->toBe('Windows')
        ->and($session->page_views_count)->toBe(1);

    expect(PageView::query()->firstOrFail()->path)->toBe('/#home');
});

test('heartbeats update session and page attention time without duplicating views', function () {
    Profile::factory()->create();

    $this->postJson(route('analytics.collect'), analyticsPayload())
        ->assertAccepted();

    $this->postJson(route('analytics.collect'), analyticsPayload([
        'event' => 'heartbeat',
        'duration_seconds' => 74,
        'page_duration_seconds' => 64,
    ]))->assertAccepted();

    expect(VisitorSession::query()->sole()->duration_seconds)->toBe(74)
        ->and(VisitorSession::query()->sole()->page_views_count)->toBe(1)
        ->and(PageView::query()->sole()->duration_seconds)->toBe(64);
});

test('the dashboard exposes traffic summaries and recent sessions to the owner', function () {
    $user = User::factory()->create();
    $profile = Profile::factory()->for($user)->create();
    VisitorSession::query()->create([
        'profile_id' => $profile->id,
        'session_uuid' => '0198a112-e1ac-7173-a958-7cfa9bd44e2a',
        'visitor_hash' => str_repeat('a', 64),
        'started_at' => now(),
        'last_seen_at' => now(),
        'duration_seconds' => 95,
        'page_views_count' => 2,
        'landing_page' => '/',
        'last_page' => '/#work',
        'browser' => 'Chrome',
        'platform' => 'Windows',
        'device_type' => 'Desktop',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('dashboard')
            ->where('analytics.summary.visitors', 1)
            ->where('analytics.summary.sessions', 1)
            ->where('analytics.summary.pageViews', 2)
            ->where('analytics.summary.averageDuration', 95)
            ->has('analytics.daily', 14)
            ->has('analytics.recentVisitors', 1));
});

test('the analytics page exposes detailed period-scoped insights to the owner', function () {
    $user = User::factory()->create();
    $profile = Profile::factory()->for($user)->create();
    $session = VisitorSession::query()->create([
        'profile_id' => $profile->id,
        'session_uuid' => '0198a112-e1ac-7173-a958-7cfa9bd44e3a',
        'visitor_hash' => str_repeat('b', 64),
        'started_at' => now(),
        'last_seen_at' => now(),
        'duration_seconds' => 125,
        'page_views_count' => 2,
        'landing_page' => '/#home',
        'last_page' => '/#work',
        'utm_source' => 'newsletter',
        'utm_campaign' => 'portfolio-launch',
        'browser' => 'Chrome',
        'platform' => 'Android',
        'device_type' => 'Mobile',
        'language' => 'en-US',
        'timezone' => 'Asia/Riyadh',
        'screen_width' => 390,
        'screen_height' => 844,
    ]);
    PageView::query()->create([
        'visitor_session_id' => $session->id,
        'page_uuid' => '0198a112-e1ac-7173-a958-7cfa9bd44e3b',
        'path' => '/#work',
        'title' => 'Portfolio work',
        'entered_at' => now(),
        'left_at' => now(),
        'duration_seconds' => 80,
    ]);

    $otherProfile = Profile::factory()->create();
    VisitorSession::query()->create([
        'profile_id' => $otherProfile->id,
        'session_uuid' => '0198a112-e1ac-7173-a958-7cfa9bd44e4a',
        'visitor_hash' => str_repeat('c', 64),
        'started_at' => now(),
        'last_seen_at' => now(),
        'duration_seconds' => 300,
        'page_views_count' => 5,
        'landing_page' => '/private',
        'last_page' => '/private',
    ]);

    $this->actingAs($user)
        ->get(route('portfolio.analytics', ['period' => 7]))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('admin/analytics/index')
            ->where('hasProfile', true)
            ->where('filters.period', 7)
            ->has('analytics.daily', 7)
            ->where('analytics.summary.visitors.value', 1)
            ->where('analytics.summary.sessions.value', 1)
            ->where('analytics.summary.pageViews.value', 1)
            ->where('analytics.summary.averageDuration.value', 125)
            ->where('analytics.summary.bounceRate.value', 0)
            ->where('analytics.sources.0.label', 'newsletter')
            ->where('analytics.devices.0.label', 'Mobile')
            ->where('analytics.topPages.0.path', '/#work')
            ->where('analytics.recentSessions.0.visitor', 'BBBBBBBB')
            ->missing('analytics.recentSessions.0.visitor_hash')
            ->has('analytics.recentSessions', 1));
});

test('analytics periods are allowlisted and analytics require authentication', function () {
    $user = User::factory()->create();
    Profile::factory()->for($user)->create();

    $this->get(route('portfolio.analytics'))
        ->assertRedirect(route('login'));

    $this->actingAs($user)
        ->get(route('portfolio.analytics', ['period' => 999]))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('admin/analytics/index')
            ->where('filters.period', 30)
            ->has('analytics.daily', 30));
});

test('analytics show an empty state before a portfolio profile exists', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('portfolio.analytics'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('admin/analytics/index')
            ->where('hasProfile', false)
            ->where('analytics.summary.visitors.value', 0)
            ->has('analytics.recentSessions', 0));
});

test('the web app manifest uses the saved portfolio theme', function () {
    Profile::factory()->create([
        'name_en' => 'Mohammed Ahmed',
        'theme_accent' => '#ff5b35',
        'theme_dark_background' => '#101010',
        'theme_light_background' => '#f7f3ea',
    ]);

    $this->get(route('pwa.manifest'))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/manifest+json')
        ->assertJson([
            'short_name' => 'Mohammed Ahmed',
            'theme_color' => '#ff5b35',
            'background_color' => '#101010',
            'display' => 'standalone',
        ]);
});
