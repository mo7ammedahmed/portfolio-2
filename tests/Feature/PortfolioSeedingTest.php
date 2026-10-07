<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\LocalPreviewSeeder;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Storage::fake('public');
    config(['filesystems.default' => 'public', 'portfolio.seed_owner_id' => null]);
});

test('empty local databases bootstrap the owner before importing and repeat safely', function () {
    $this->app['env'] = 'local';
    $this->seed(DatabaseSeeder::class);
    $owner = User::query()->where('email', LocalPreviewSeeder::OWNER_EMAIL)->firstOrFail();
    $password = $owner->password;
    $owner->profile()->update(['name_en' => 'Edited profile']);
    $project = $owner->projects()->firstOrFail();
    $project->update(['description_en' => 'Edited project']);
    $this->seed(DatabaseSeeder::class);
    expect(User::query()->count())->toBe(1)
        ->and($owner->projects()->count())->toBe(6)
        ->and($owner->fresh()->password)->toBe($password)
        ->and($owner->profile()->firstOrFail()->name_en)->toBe('Edited profile')
        ->and($project->fresh()->description_en)->toBe('Edited project')
        ->and(Storage::disk('public')->allFiles())->toHaveCount(6);
});

test('populated local databases require a deliberate owner selection', function () {
    $this->app['env'] = 'local';
    $owner = User::factory()->create();
    expect(fn () => $this->seed(DatabaseSeeder::class))->toThrow(RuntimeException::class, 'already contains accounts');
    expect(User::query()->count())->toBe(1)->and($owner->projects()->count())->toBe(0);
    config(['portfolio.seed_owner_id' => $owner->id]);
    $this->seed(DatabaseSeeder::class);
    expect($owner->projects()->count())->toBe(6);
});

test('nonlocal seeding never bootstraps a preview account', function () {
    expect(fn () => $this->seed(DatabaseSeeder::class))->toThrow(RuntimeException::class, 'PORTFOLIO_SEED_OWNER_ID');
    expect(User::query()->count())->toBe(0);
});

test('a team member cannot be treated as the local preview owner', function () {
    $this->app['env'] = 'local';
    $owner = User::factory()->create();
    $member = User::factory()->create(['email' => LocalPreviewSeeder::OWNER_EMAIL, 'owner_id' => $owner->id]);
    expect(fn () => $this->seed(DatabaseSeeder::class))->toThrow(RuntimeException::class, 'intended owner');
    expect($member->projects()->count())->toBe(0)->and($member->profile)->toBeNull();
});
