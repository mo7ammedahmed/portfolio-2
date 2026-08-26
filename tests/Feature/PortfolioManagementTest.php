<?php

use App\Models\Category;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

function portfolioProfilePayload(): array
{
    return [
        'name_ar' => 'محمد أحمد',
        'name_en' => 'Mohammed Ahmed',
        'role_ar' => 'مطور برمجيات',
        'role_en' => 'Full Stack Developer',
        'short_description_ar' => 'نبذة قصيرة.',
        'short_description_en' => 'A short introduction.',
        'description_ar' => 'سيرة مهنية مفصلة.',
        'description_en' => 'A detailed professional biography.',
        'location_ar' => 'أبها',
        'location_en' => 'Abha',
        'email' => 'mohammed@example.com',
        'contact_notification_email' => 'inbox@example.com',
        'contact_notification_subject_template' => 'New enquiry: {subject}',
        'contact_notification_body_template' => "From {name}\n\n{message}",
        'contact_auto_reply_enabled' => true,
        'contact_auto_reply_subject_template' => 'Thanks: {subject}',
        'contact_auto_reply_body_template' => 'Hi {name}, thanks for your message.',
        'theme_dark_accent' => '#ff5b35',
        'theme_light_accent' => '#006c55',
        'theme_dark_background' => '#070707',
        'theme_dark_surface' => '#0d0d0d',
        'theme_dark_foreground' => '#f4f4f1',
        'theme_dark_muted' => '#a4a4a0',
        'theme_light_background' => '#f4f3ee',
        'theme_light_surface' => '#ffffff',
        'theme_light_foreground' => '#0a0a0a',
        'theme_light_muted' => '#686864',
        'glass_effect_enabled' => true,
        'glass_blur' => 1.25,
        'glass_surface_opacity' => 0.64,
        'glass_border_opacity' => 0.22,
        'glass_saturation' => 1.35,
        'is_available' => true,
        'is_visible' => true,
    ];
}

function portfolioSkillPayload(array $overrides = []): array
{
    return [
        'name_ar' => 'لارافيل',
        'name_en' => 'Laravel',
        'description_ar' => 'تطوير تطبيقات ويب متكاملة.',
        'description_en' => 'Full-stack web application development.',
        'group_ar' => 'الخلفية',
        'group_en' => 'Backend',
        'proficiency' => 95,
        'is_visible' => true,
        'sort_order' => 1,
        ...$overrides,
    ];
}

test('the public portfolio only exposes visible content', function () {
    $user = User::factory()->create();
    Profile::factory()->for($user)->create();
    Project::factory()->for($user)->create([
        'name_en' => 'Public project',
        'is_visible' => true,
    ]);
    Project::factory()->for($user)->create([
        'name_en' => 'Private project',
        'is_visible' => false,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('welcome')
            ->where('profile.name_en', $user->profile->name_en)
            ->has('projects', 1)
            ->where('projects.0.name_en', 'Public project'));
});

test('public experience years come from the earliest visible experience', function () {
    $this->travelTo(Carbon::parse('2026-07-26'));

    $user = User::factory()->create();
    Profile::factory()->for($user)->create();

    Experience::factory()->for($user)->create([
        'started_at' => '2019-01-01',
        'ended_at' => '2024-04-30',
        'is_current' => false,
        'is_visible' => true,
    ]);
    Experience::factory()->for($user)->create([
        'started_at' => '2025-01-01',
        'ended_at' => null,
        'is_current' => true,
        'is_visible' => true,
    ]);
    Experience::factory()->for($user)->create([
        'started_at' => '2010-01-01',
        'is_visible' => false,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where('stats.years', 7));
});

test('guests cannot access the content studio', function () {
    $this->get(route('portfolio.projects.index'))
        ->assertRedirect(route('login'));
});

test('an owner can create a project with category and skills', function () {
    $user = User::factory()->create();
    $category = Category::factory()->for($user)->create();
    $skill = Skill::factory()->for($user)->create();

    $this->actingAs($user)
        ->post(route('portfolio.projects.store'), [
            'name_ar' => 'منصة جديدة',
            'name_en' => 'New platform',
            'description_ar' => 'وصف عربي واضح للمشروع.',
            'description_en' => 'A clear English project description.',
            'category_id' => $category->id,
            'skill_ids' => [$skill->id],
            'url' => 'https://example.com',
            'repository_url' => null,
            'is_featured' => true,
            'is_visible' => true,
            'sort_order' => 1,
        ])
        ->assertRedirect(route('portfolio.projects.index'));

    $project = Project::query()->where('name_en', 'New platform')->firstOrFail();

    expect($project->user_id)->toBe($user->id)
        ->and($project->category_id)->toBe($category->id)
        ->and($project->skills()->pluck('skills.id')->all())->toBe([$skill->id]);
});

test('project relationships must belong to the signed in owner', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $foreignCategory = Category::factory()->for($otherUser)->create();
    $foreignSkill = Skill::factory()->for($otherUser)->create();

    $this->actingAs($user)
        ->post(route('portfolio.projects.store'), [
            'name_ar' => 'مشروع',
            'name_en' => 'Project',
            'description_ar' => 'وصف المشروع.',
            'description_en' => 'Project description.',
            'category_id' => $foreignCategory->id,
            'skill_ids' => [$foreignSkill->id],
            'is_featured' => false,
            'is_visible' => true,
            'sort_order' => 0,
        ])
        ->assertSessionHasErrors(['category_id', 'skill_ids.0']);
});

test('users cannot edit projects owned by someone else', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $project = Project::factory()->for($owner)->create();

    $this->actingAs($intruder)
        ->get(route('portfolio.projects.edit', $project))
        ->assertForbidden();
});

test('an owner can create and update their singleton portfolio profile', function () {
    $user = User::factory()->create();
    $payload = portfolioProfilePayload();

    $this->actingAs($user)
        ->put(route('portfolio.profile.update'), $payload)
        ->assertRedirect(route('portfolio.profile.edit'));

    expect($user->fresh()->profile?->name_en)->toBe('Mohammed Ahmed');

    $this->actingAs($user)
        ->put(route('portfolio.profile.update'), [
            ...$payload,
            'role_en' => 'Senior Product Engineer',
        ])
        ->assertRedirect(route('portfolio.profile.edit'));

    expect($user->fresh()->profile?->role_en)->toBe('Senior Product Engineer')
        ->and($user->fresh()->profile?->theme_dark_accent)->toBe('#ff5b35')
        ->and($user->fresh()->profile?->theme_light_accent)->toBe('#006c55')
        ->and($user->fresh()->profile?->glass_effect_enabled)->toBeTrue()
        ->and(Profile::query()->where('user_id', $user->id)->count())->toBe(1);
});

test('portfolio theme settings must be valid', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('portfolio.profile.update'), [
            ...portfolioProfilePayload(),
            'theme_dark_background' => 'black',
        ])
        ->assertSessionHasErrors('theme_dark_background');

    expect($user->fresh()->profile)->toBeNull();
});

test('saved theme palettes are shared publicly without forcing a display mode', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->put(route('portfolio.profile.update'), [
            ...portfolioProfilePayload(),
            'theme_dark_background' => '#10131a',
            'theme_light_background' => '#f7f3ea',
        ])
        ->assertRedirect(route('portfolio.profile.edit'))
        ->assertSessionHasNoErrors();

    expect($user->fresh()->profile?->theme_dark_background)->toBe('#10131a')
        ->and($user->fresh()->profile?->theme_light_background)->toBe('#f7f3ea');

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('welcome')
            ->missing('profile.theme_default_mode')
            ->where('profile.theme_dark_accent', '#ff5b35')
            ->where('profile.theme_light_accent', '#006c55')
            ->where('profile.glass_effect_enabled', true)
            ->where('profile.theme_dark_background', '#10131a')
            ->where('profile.theme_light_background', '#f7f3ea'));
});

test('an owner can upload and replace their portfolio portrait', function () {
    config()->set('filesystems.default', 'public');
    Storage::fake('public');

    $user = User::factory()->create();
    $oldImagePath = 'portfolio/profile/old-portrait.jpg';
    Storage::disk('public')->put($oldImagePath, 'old portrait');
    Profile::factory()->for($user)->create(['image' => $oldImagePath]);

    $this->actingAs($user)
        ->post(route('portfolio.profile.update'), [
            ...portfolioProfilePayload(),
            '_method' => 'put',
            'image' => UploadedFile::fake()
                ->image('new-portrait.webp', 1200, 1200)
                ->size(1800),
        ])
        ->assertRedirect(route('portfolio.profile.edit'))
        ->assertSessionHasNoErrors();

    $newImagePath = $user->fresh()->profile?->image;

    expect($newImagePath)->not->toBeNull()
        ->and($newImagePath)->not->toBe($oldImagePath);
    Storage::disk('public')->assertExists($newImagePath);
    Storage::disk('public')->assertMissing($oldImagePath);
});

test('portfolio portraits larger than the server limit are rejected', function () {
    config()->set('filesystems.default', 'public');
    Storage::fake('public');

    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('portfolio.profile.update'), [
            ...portfolioProfilePayload(),
            '_method' => 'put',
            'image' => UploadedFile::fake()
                ->image('oversized-portrait.jpg', 1200, 1200)
                ->size(2100),
        ])
        ->assertSessionHasErrors('image');

    expect($user->fresh()->profile)->toBeNull();
});

test('an owner can replace and remove the custom image used by tech stack', function () {
    config()->set('filesystems.default', 'public');
    Storage::fake('public');

    $user = User::factory()->create();
    Profile::factory()->for($user)->create();
    $oldImagePath = 'portfolio/skills/old-laravel.png';
    Storage::disk('public')->put($oldImagePath, 'old icon');
    $skill = Skill::factory()->for($user)->create([
        'name_en' => 'Laravel',
        'image' => $oldImagePath,
        'is_visible' => true,
    ]);

    $this->actingAs($user)
        ->post(route('portfolio.skills.update', $skill), [
            ...portfolioSkillPayload(),
            '_method' => 'put',
            'image' => UploadedFile::fake()
                ->image('custom-laravel.png', 512, 512)
                ->size(600),
        ])
        ->assertRedirect(route('portfolio.skills.index'))
        ->assertSessionHasNoErrors();

    $newImagePath = $skill->fresh()->image;

    expect($newImagePath)->not->toBeNull()
        ->and($newImagePath)->not->toBe($oldImagePath);
    Storage::disk('public')->assertExists($newImagePath);
    Storage::disk('public')->assertMissing($oldImagePath);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where(
                'skills.0.image_url',
                Storage::disk('public')->url($newImagePath),
            ));

    $this->actingAs($user)
        ->put(route('portfolio.skills.update', $skill), [
            ...portfolioSkillPayload(),
            'remove_image' => true,
        ])
        ->assertRedirect(route('portfolio.skills.index'))
        ->assertSessionHasNoErrors();

    expect($skill->fresh()->image)->toBeNull();
    Storage::disk('public')->assertMissing($newImagePath);
});

test('an owner can choose the preset icon used by tech stack', function () {
    $user = User::factory()->create();
    Profile::factory()->for($user)->create();
    $skill = Skill::factory()->for($user)->create([
        'name_en' => 'Frontend framework',
        'icon_key' => null,
        'is_visible' => true,
    ]);

    $this->actingAs($user)
        ->put(route('portfolio.skills.update', $skill), [
            ...portfolioSkillPayload([
                'name_en' => 'Frontend framework',
                'icon_key' => 'react',
            ]),
        ])
        ->assertRedirect(route('portfolio.skills.index'))
        ->assertSessionHasNoErrors();

    expect($skill->fresh()->icon_key)->toBe('react');

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->where('skills.0.icon_key', 'react'));
});

test('skill preset icons must be from the supported catalog', function () {
    $user = User::factory()->create();
    $skill = Skill::factory()->for($user)->create();

    $this->actingAs($user)
        ->put(route('portfolio.skills.update', $skill), [
            ...portfolioSkillPayload([
                'name_en' => $skill->name_en,
                'icon_key' => 'unsafe-external-icon',
            ]),
        ])
        ->assertSessionHasErrors('icon_key');

    expect($skill->fresh()->icon_key)->toBeNull();
});
