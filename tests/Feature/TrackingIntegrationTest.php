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
