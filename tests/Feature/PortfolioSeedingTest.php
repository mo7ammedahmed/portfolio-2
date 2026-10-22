<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\ExperienceSeeder;
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
    $experience = $owner->experiences()->where('seed_key', 'fid-marketing')->firstOrFail();
    $experience->update(['name_en' => 'Edited title', 'description_en' => 'Edited experience']);
    $this->seed(DatabaseSeeder::class);
    expect(User::query()->count())->toBe(1)
        ->and($owner->projects()->count())->toBe(6)
        ->and($owner->experiences()->count())->toBe(3)
        ->and($owner->fresh()->password)->toBe($password)
        ->and($owner->profile()->firstOrFail()->name_en)->toBe('Edited profile')
        ->and($project->fresh()->description_en)->toBe('Edited project')
        ->and($experience->fresh()->description_en)->toBe('Edited experience')
        ->and($experience->fresh()->display_year)->toBe(2025)
        ->and($experience->fresh()->started_at)->toBeNull()
        ->and($owner->experiences()->where('name_en', 'Freelance Full Stack Developer')->where('is_current', true)->exists())->toBeTrue()
        ->and(Storage::disk('public')->allFiles())->toHaveCount(6);
});

test('populated local databases require a deliberate owner selection', function () {
    $this->app['env'] = 'local';
    $owner = User::factory()->create();
    expect(fn () => $this->seed(DatabaseSeeder::class))->toThrow(RuntimeException::class, 'already contains accounts');
    expect(User::query()->count())->toBe(1)->and($owner->projects()->count())->toBe(0);
    config(['portfolio.seed_owner_id' => $owner->id]);
    $this->seed(DatabaseSeeder::class);
    expect($owner->projects()->count())->toBe(6)->and($owner->experiences()->count())->toBe(3);
    $this->actingAs($owner)->get(route('portfolio.experiences.index'))->assertOk();
    $this->get(route('portfolio.experiences.edit', $owner->experiences()->firstOrFail()))->assertOk();
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

test('career imports adopt a unique legacy record and stay scoped to the owner', function () {
    $owner = User::factory()->create();
    $other = User::factory()->create();
    $legacy = $owner->experiences()->create([
        ...collect((require database_path('content/experiences.php'))[0])->except('seed_key')->all(),
        'description_en' => 'My edited contribution',
    ]);
    $seeder = app(ExperienceSeeder::class);
    $seeder->seedFor($owner);
    $seeder->seedFor($other);
    $seeder->seedFor($owner);
    expect($owner->experiences()->count())->toBe(3)
        ->and($other->experiences()->count())->toBe(3)
        ->and($legacy->fresh()->seed_key)->toBe('fid-marketing')
        ->and($legacy->fresh()->description_en)->toBe('My edited contribution');
});

test('ambiguous career imports roll back without adding partial records', function () {
    $owner = User::factory()->create();
    $data = collect((require database_path('content/experiences.php'))[1])->except('seed_key')->all();
    $owner->experiences()->create($data);
    $owner->experiences()->create($data);
    expect(fn () => app(ExperienceSeeder::class)->seedFor($owner))
        ->toThrow(RuntimeException::class, 'Ambiguous experience');
    expect($owner->experiences()->count())->toBe(2)
        ->and($owner->experiences()->whereNotNull('seed_key')->count())->toBe(0);
});
