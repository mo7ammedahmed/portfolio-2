<?php

use App\Models\Profile;
use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('multiple repositories validate, remain public and can be cleared', function () {
    $owner = User::factory()->create();
    Profile::factory()->for($owner)->create(['glass_border_enabled' => false, 'glass_light_opacity' => 0.85, 'glass_dark_opacity' => 0.4]);
    $project = Project::factory()->for($owner)->create(['is_visible' => true]);
    $payload = $project->only(['name_ar', 'name_en', 'description_ar', 'description_en', 'is_visible', 'is_featured', 'sort_order']);
    $repositories = [['label' => 'Frontend', 'url' => 'https://github.com/example/frontend'], ['label' => 'Backend', 'url' => 'https://github.com/example/backend']];
    $this->actingAs($owner)->put(route('portfolio.projects.update', $project), [...$payload, 'repositories' => $repositories])->assertSessionHasNoErrors();
    $this->get(route('work.show', $project->slug))->assertInertia(fn (Assert $page) => $page->where('project.repositories', $repositories)->where('profile.glass_border_enabled', false)->where('profile.glass_light_opacity', 0.85)->where('profile.glass_dark_opacity', 0.4));
    $this->put(route('portfolio.projects.update', $project), [...$payload, 'repositories' => [['label' => 'Bad', 'url' => 'javascript:alert(1)']]])->assertSessionHasErrors('repositories.0.url');
    $this->put(route('portfolio.projects.update', $project), [...$payload, 'repositories_present' => true])->assertSessionHasNoErrors();
    expect($project->fresh()->repositories)->toBe([]);
});

test('console editing preserves fields and requires fresh owner scoped identity', function () {
    $owner = User::factory()->create();
    $project = Project::factory()->for($owner)->create();
    $other = Project::factory()->create();
    $project->refresh();
    $args = ['action' => 'update', '--owner' => (string) $owner->id, '--project' => (string) $project->id, '--expected' => $project->updated_at->toISOString(), '--data' => json_encode(['description_en' => 'Updated through chat'])];
    $this->artisan('portfolio:projects', [...$args, '--dry-run' => true])->assertSuccessful();
    expect($project->fresh()->description_en)->not->toBe('Updated through chat');
    $this->artisan('portfolio:projects', [...$args, '--project' => (string) $other->id])->assertFailed();
    $this->artisan('portfolio:projects', [...$args, '--expected' => 'stale'])->assertFailed();
    $this->artisan('portfolio:projects', [...$args, '--data' => json_encode(['user_id' => $other->user_id])])->assertFailed();
    $this->artisan('portfolio:projects', $args)->assertSuccessful();
    expect($project->fresh()->description_en)->toBe('Updated through chat')->and($project->fresh()->name_en)->toBe($project->name_en);
});

test('cover recovery only restores missing seeded images', function () {
    Storage::fake('public');
    config(['filesystems.default' => 'public']);
    $owner = User::factory()->create();
    $project = Project::factory()->for($owner)->create(['seed_key' => 'anwan-print', 'image' => 'missing.jpg']);
    $this->artisan('portfolio:repair-covers', ['--owner' => (string) $owner->id, '--dry-run' => true])->assertSuccessful();
    expect($project->fresh()->image)->toBe('missing.jpg');
    $this->artisan('portfolio:repair-covers', ['--owner' => (string) $owner->id])->assertSuccessful();
    Storage::disk('public')->assertExists($project->fresh()->image);
    $project->update(['image' => 'custom.jpg']);
    Storage::disk('public')->put('custom.jpg', 'existing custom image');
    $this->artisan('portfolio:repair-covers', ['--owner' => (string) $owner->id])->assertSuccessful();
    expect($project->fresh()->image)->toBe('custom.jpg');
});
