<?php

use App\Models\Profile;
use App\Models\Role;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('the dashboard receives the portfolio owners saved palette', function () {
    $owner = User::factory()->create();
    Profile::factory()->for($owner)->create([
        'theme_dark_accent' => '#ff6a45',
        'theme_light_accent' => '#006c55',
        'theme_dark_background' => '#10131a',
        'theme_light_background' => '#f7f3ea',
    ]);

    $this->actingAs($owner)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where('portfolioTheme.theme_dark_accent', '#ff6a45')
            ->where('portfolioTheme.theme_light_accent', '#006c55')
            ->where('portfolioTheme.theme_dark_background', '#10131a')
            ->where('portfolioTheme.theme_light_background', '#f7f3ea'));
});

test('team members receive the portfolio owners palette', function () {
    $owner = User::factory()->create();
    $role = Role::factory()->create(['owner_id' => $owner->id]);
    $member = User::factory()->create([
        'owner_id' => $owner->id,
        'role_id' => $role->id,
    ]);
    Profile::factory()->for($owner)->create([
        'theme_dark_accent' => '#91a5ff',
        'theme_dark_surface' => '#171a21',
    ]);

    $this->actingAs($member)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where('portfolioTheme.theme_dark_accent', '#91a5ff')
            ->where('portfolioTheme.theme_dark_surface', '#171a21'));
});
