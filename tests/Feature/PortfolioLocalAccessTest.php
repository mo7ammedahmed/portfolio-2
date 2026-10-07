<?php

use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;

test('local access issues a working reset token without changing credentials or sending mail', function () {
    $this->app['env'] = 'local';
    Notification::fake();
    $owner = User::factory()->create();
    $original = $owner->password;
    expect(Artisan::call('portfolio:local-access', ['--owner' => $owner->id]))->toBe(0);
    preg_match('~Choose your password: (\S+)~', Artisan::output(), $matches);
    $url = $matches[1];
    $token = basename(parse_url($url, PHP_URL_PATH));
    expect(Password::broker()->tokenExists($owner, $token))->toBeTrue()
        ->and($owner->fresh()->password)->toBe($original);
    Notification::assertNothingSent();
    $this->app['env'] = 'testing';
    $this->get($url)->assertOk();
    $this->post(route('password.update'), ['email' => $owner->email, 'token' => $token, 'password' => 'New-Local-Pass-2026!', 'password_confirmation' => 'New-Local-Pass-2026!'])
        ->assertSessionHasNoErrors();
    $this->post(route('login.store'), ['email' => $owner->email, 'password' => 'New-Local-Pass-2026!'])->assertRedirect('/dashboard');
    $this->assertAuthenticatedAs($owner);
});

test('local access rejects nonlocal environments and invalid owner selections', function () {
    $owner = User::factory()->create();
    $this->artisan('portfolio:local-access', ['--owner' => $owner->id])->assertFailed();
    $this->app['env'] = 'local';
    $this->artisan('portfolio:local-access')->assertFailed();
    $member = User::factory()->create(['owner_id' => $owner->id]);
    $this->artisan('portfolio:local-access', ['--owner' => $member->id])->assertFailed();
});
