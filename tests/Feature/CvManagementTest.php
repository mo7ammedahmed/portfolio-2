<?php

use App\Enums\PortfolioPermission;
use App\Models\CV;
use App\Models\Role;
use App\Models\User;
use App\Services\CvCompleteness;
use Inertia\Testing\AssertableInertia as Assert;

test('authorized team members manage the owner CV and cannot create duplicates', function () {
    $owner = User::factory()->create();
    $role = Role::factory()->create(['owner_id' => $owner->id, 'permissions' => [PortfolioPermission::ManageCV->value]]);
    $member = User::factory()->create(['owner_id' => $owner->id, 'role_id' => $role->id]);
    $this->actingAs($member)->post(route('portfolio.cv.store'), ['title' => 'Developer'])->assertRedirect();
    $cv = CV::query()->sole();
    expect($cv->user_id)->toBe($owner->id);
    $this->get(route('portfolio.cv.index'))->assertInertia(fn (Assert $page) => $page->where('cv.id', $cv->id));
    $this->get(route('portfolio.cv.create'))->assertRedirect(route('portfolio.cv.edit', $cv));
    $this->post(route('portfolio.cv.store'), ['title' => 'Accidental duplicate'])->assertRedirect();
    expect(CV::query()->count())->toBe(1)->and($cv->fresh()->title)->toBe('Developer');
    $this->put(route('portfolio.cv.update', $cv), ['title' => 'Senior Developer'])->assertRedirect();
    expect($cv->fresh()->title)->toBe('Senior Developer');
    $this->get(route('portfolio.cv.preview', $cv))->assertOk()->assertSee('Senior Developer')->assertSee('window.print()');
    $this->delete(route('portfolio.cv.destroy', $cv))->assertRedirect();
    expect(CV::query()->count())->toBe(0);
});

test('CV editing and previews reject other owners and members without permission', function () {
    $owner = User::factory()->create();
    $cv = $owner->cv()->create(['title' => 'Private CV']);
    $other = User::factory()->create();
    $member = User::factory()->create(['owner_id' => $owner->id]);
    foreach ([$other, $member] as $user) {
        $this->actingAs($user)->put(route('portfolio.cv.update', $cv), ['title' => 'Changed'])->assertForbidden();
        $this->get(route('portfolio.cv.preview', $cv))->assertForbidden();
        $this->delete(route('portfolio.cv.destroy', $cv))->assertForbidden();
    }
    expect($cv->fresh()->title)->toBe('Private CV');
});

test('CV completeness is deterministic and ignores empty entries', function () {
    $cv = new CV(['title' => 'Developer', 'skills' => [['name' => ' ']], 'experience' => [[]], 'education' => [[]]]);
    $scorer = app(CvCompleteness::class);
    expect(array_sum($scorer->scores($cv)))->toBe(10);
    $cv->fill([
        'summary' => 'I build web applications.',
        'contact_info' => ['email' => 'dev@example.test', 'phone' => '123', 'location' => 'Abha'],
        'skills' => [['name' => 'Laravel']],
        'experience' => [['title' => 'Developer', 'company' => 'Company', 'start_date' => '2024-01-01', 'current' => true, 'description' => 'Built applications.']],
        'education' => [['institution' => 'University', 'degree' => 'Degree']],
    ]);
    expect(array_sum($scorer->scores($cv)))->toBe(100)->and($scorer->scores($cv))->toBe($scorer->scores($cv));
});

test('CV preview escapes content and does not expose scripts', function () {
    $owner = User::factory()->create();
    $cv = $owner->cv()->create(['title' => '<script>alert(1)</script>']);
    $this->actingAs($owner)->get(route('portfolio.cv.preview', $cv))->assertOk()
        ->assertDontSee('<script>alert(1)</script>', false)->assertSee('&lt;script&gt;', false);
});
