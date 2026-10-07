<?php

use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use App\Services\ImportPortfolioProjects;
use App\Services\SavePortfolioProject;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function projectManifest(): array
{
    return array_map(fn (array $item): array => [...$item, 'cover' => null], require database_path('content/projects.php'));
}

test('six projects import repeatedly while preserving dashboard changes and unrelated work', function () {
    Storage::fake('public');
    config(['filesystems.default' => 'public']);
    $owner = User::factory()->create();
    $other = Project::factory()->for($owner)->create(['name_en' => 'Other work']);
    $import = app(ImportPortfolioProjects::class);
    $import->run($owner, projectManifest());
    $school = $owner->projects()->where('seed_key', 'aether-school-os')->firstOrFail();
    $school->update(['description_en' => 'Edited in dashboard']);
    $school->skills()->detach();
    $import->run($owner, projectManifest());
    expect($owner->projects()->count())->toBe(7)
        ->and($school->fresh()->description_en)->toBe('Edited in dashboard')
        ->and($school->skills()->count())->toBe(0)
        ->and($other->fresh()->name_en)->toBe('Other work');
    $import->run($owner, projectManifest(), overwrite: true);
    expect($school->fresh()->description_en)->not->toBe('Edited in dashboard')
        ->and($school->skills()->count())->toBeGreaterThan(0)
        ->and($owner->projects()->where('seed_key', 'speed-rocket')->firstOrFail()->skills()->where('name_en', 'React')->exists())->toBeFalse()
        ->and($owner->projects()->where('seed_key', 'shawerma-krakow')->firstOrFail()->role_en)->toBe('Backend development only');
});

test('dry run does not create records or adopt legacy projects', function () {
    $owner = User::factory()->create();
    $legacy = Project::factory()->for($owner)->create(['name_en' => 'Speed Rocket']);
    app(ImportPortfolioProjects::class)->run($owner, projectManifest(), dryRun: true);
    expect($owner->projects()->count())->toBe(1)->and($legacy->fresh()->seed_key)->toBeNull()
        ->and($owner->skills()->count())->toBe(0)->and($owner->categories()->count())->toBe(0);
});

test('legacy Speed Rocket is adopted without losing its edits or stable URL', function () {
    $owner = User::factory()->create();
    $legacy = Project::factory()->for($owner)->create(['name_en' => 'Speed Rocket', 'slug' => 'existing-speed', 'description_en' => 'Keep me']);
    app(ImportPortfolioProjects::class)->run($owner, projectManifest());
    expect($owner->projects()->count())->toBe(6)->and($legacy->fresh()->seed_key)->toBe('speed-rocket')
        ->and($legacy->fresh()->description_en)->toBe('Keep me')->and($legacy->fresh()->slug)->toBe('existing-speed');
});

test('ambiguous legacy matches fail before writing any project', function () {
    $owner = User::factory()->create();
    Project::factory()->count(2)->for($owner)->create(['name_en' => 'Speed Rocket']);
    expect(fn () => app(ImportPortfolioProjects::class)->run($owner, projectManifest()))->toThrow(RuntimeException::class, 'Multiple legacy');
    expect($owner->projects()->count())->toBe(2)->and($owner->categories()->count())->toBe(0);
});

test('missing images fail before any database writes', function () {
    $owner = User::factory()->create();
    $manifest = projectManifest();
    $manifest[5]['cover'] = 'database/content/images/missing.jpg';
    expect(fn () => app(ImportPortfolioProjects::class)->run($owner, $manifest))->toThrow(RuntimeException::class, 'Missing or invalid');
    expect($owner->projects()->count())->toBe(0);
});

test('actual covers are stored once and repeat imports do not duplicate them', function () {
    Storage::fake('public');
    config(['filesystems.default' => 'public']);
    $owner = User::factory()->create();
    $manifest = require database_path('content/projects.php');
    app(ImportPortfolioProjects::class)->run($owner, $manifest);
    app(ImportPortfolioProjects::class)->run($owner, $manifest, overwrite: true);
    expect(Storage::disk('public')->allFiles())->toHaveCount(6);
});

test('import requires an owner and never creates accounts', function () {
    $this->artisan('portfolio:import')->assertFailed();
    expect(User::query()->count())->toBe(0);
    $owner = User::factory()->create();
    $member = User::factory()->create(['owner_id' => $owner->id]);
    expect(fn () => app(ImportPortfolioProjects::class)->run($member, projectManifest()))->toThrow(RuntimeException::class);
});

test('case studies and sitemap only expose the active visible portfolio', function () {
    $owner = User::factory()->create();
    Profile::factory()->for($owner)->create(['is_visible' => true]);
    $project = Project::factory()->for($owner)->create(['is_visible' => true]);
    $hidden = Project::factory()->for($owner)->create(['is_visible' => false]);
    $other = Project::factory()->create(['is_visible' => true]);
    $this->get('/work/'.$project->slug)->assertOk()->assertInertia(fn (Assert $page) => $page->component('work/show')->where('project.id', $project->id));
    $this->get('/work/'.$hidden->slug)->assertNotFound();
    $this->get('/work/'.$other->slug)->assertNotFound();
    $this->get('/sitemap.xml')->assertOk()->assertSee('/work/'.$project->slug)->assertDontSee('/work/'.$hidden->slug)->assertDontSee('/work/'.$other->slug)->assertDontSee('#work');
});

test('Arabic locale and metadata are present in initial HTML', function () {
    $owner = User::factory()->create();
    Profile::factory()->for($owner)->create(['is_visible' => true]);
    $project = Project::factory()->for($owner)->create(['is_visible' => true, 'name_ar' => 'مشروع المدرسة']);
    $this->withUnencryptedCookie('portfolio_locale', 'ar')->get('/work/'.$project->slug)
        ->assertOk()->assertSee('lang="ar"', false)->assertSee('dir="rtl"', false)
        ->assertSee('مشروع المدرسة')->assertSee('property="og:title"', false)->assertSee('rel="canonical"', false);
});

test('gallery saves ordered captions and old cover is removed only after replacement', function () {
    Storage::fake('public');
    config(['filesystems.default' => 'public']);
    $owner = User::factory()->create();
    $project = Project::factory()->for($owner)->create(['image' => 'old.jpg']);
    Storage::disk('public')->put('old.jpg', 'old');
    app(SavePortfolioProject::class)->save($owner, [
        'image' => UploadedFile::fake()->image('cover.jpg'),
        'gallery' => [
            ['file' => UploadedFile::fake()->image('a.jpg'), 'alt_ar' => 'أ', 'alt_en' => 'A', 'sort_order' => 2],
            ['file' => UploadedFile::fake()->image('b.jpg'), 'alt_ar' => 'ب', 'alt_en' => 'B', 'sort_order' => 1],
        ],
    ], $project);
    Storage::disk('public')->assertMissing('old.jpg');
    Storage::disk('public')->assertExists($project->fresh()->image);
    expect($project->images()->pluck('alt_en')->all())->toBe(['B', 'A']);
    app(SavePortfolioProject::class)->save($owner, ['gallery' => []], $project);
    expect($project->images()->count())->toBe(0)->and(Storage::disk('public')->allFiles())->toHaveCount(1);
});

test('a failed gallery write rolls back the cover and keeps the previous asset', function () {
    Storage::fake('public');
    config(['filesystems.default' => 'public']);
    $owner = User::factory()->create();
    $project = Project::factory()->for($owner)->create(['image' => 'old.jpg']);
    Storage::disk('public')->put('old.jpg', 'old');
    expect(fn () => app(SavePortfolioProject::class)->save($owner, [
        'image' => UploadedFile::fake()->image('cover.jpg'),
        'gallery' => [['id' => 999, 'alt_ar' => 'أ', 'alt_en' => 'A', 'sort_order' => 0]],
    ], $project))->toThrow(ModelNotFoundException::class);
    expect($project->fresh()->image)->toBe('old.jpg')->and(Storage::disk('public')->allFiles())->toBe(['old.jpg']);
});

test('project slugs remain stable when the title changes', function () {
    $project = Project::factory()->create(['name_en' => 'First title']);
    $slug = $project->slug;
    $project->update(['name_en' => 'New title']);
    expect($project->fresh()->slug)->toBe($slug);
});

test('multipart editor can clear all gallery images and skills', function () {
    Storage::fake('public');
    config(['filesystems.default' => 'public']);
    $owner = User::factory()->create();
    $project = Project::factory()->for($owner)->create();
    $skill = Skill::factory()->for($owner)->create();
    $project->skills()->attach($skill);
    $project->images()->create(['path' => 'gallery.jpg', 'alt_ar' => 'صورة', 'alt_en' => 'Image', 'sort_order' => 0]);
    Storage::disk('public')->put('gallery.jpg', 'image');
    $payload = $project->only(['name_ar', 'name_en', 'description_ar', 'description_en', 'is_featured', 'is_visible', 'sort_order']);
    $this->actingAs($owner)->post(route('portfolio.projects.update', $project), [
        ...$payload, '_method' => 'put', 'gallery_present' => '1', 'skill_ids_present' => '1',
    ])->assertSessionHasNoErrors()->assertRedirect();
    expect($project->images()->count())->toBe(0)->and($project->skills()->count())->toBe(0);
    Storage::disk('public')->assertMissing('gallery.jpg');
});

test('editor rejects gallery IDs belonging to another project', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->for($owner)->create();
    $other = Project::factory()->create();
    $image = $other->images()->create(['path' => 'other.jpg', 'alt_ar' => 'صورة', 'alt_en' => 'Image', 'sort_order' => 0]);
    $payload = $project->only(['name_ar', 'name_en', 'description_ar', 'description_en', 'is_featured', 'is_visible', 'sort_order']);
    $this->actingAs($owner)->put(route('portfolio.projects.update', $project), [
        ...$payload, 'gallery' => [['id' => $image->id, 'alt_ar' => 'صورة', 'alt_en' => 'Image', 'sort_order' => 0]],
    ])->assertSessionHasErrors('gallery.0.id');
    expect($other->images()->count())->toBe(1)->and($project->images()->count())->toBe(0);
});
