<?php

use App\Enums\PortfolioPermission;
use App\Models\Project;
use App\Models\Role;
use App\Models\User;
use App\Models\UserInvitation;
use App\Notifications\UserInvitationNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('the portfolio owner can create custom roles', function () {
    $owner = User::factory()->create();

    $this->actingAs($owner)
        ->post(route('portfolio.roles.store'), [
            'name' => 'Content editor',
            'permissions' => [
                PortfolioPermission::ManageProjects->value,
                PortfolioPermission::ManageSkills->value,
            ],
        ])
        ->assertRedirect(route('portfolio.team'));

    $role = Role::query()->sole();

    expect($role->owner_id)->toBe($owner->id)
        ->and($role->permissions)->toBe([
            PortfolioPermission::ManageProjects->value,
            PortfolioPermission::ManageSkills->value,
        ]);
});

test('only the portfolio owner can manage roles and invitations', function () {
    $owner = User::factory()->create();
    $role = Role::factory()->create(['owner_id' => $owner->id]);
    $member = User::factory()->create([
        'owner_id' => $owner->id,
        'role_id' => $role->id,
    ]);

    $this->actingAs($member)
        ->get(route('portfolio.team'))
        ->assertForbidden();

    $this->actingAs($member)
        ->post(route('portfolio.invitations.store'), [
            'email' => 'new-member@example.com',
            'role_id' => $role->id,
        ])
        ->assertForbidden();
});

test('the owner can send a role-based invitation', function () {
    Notification::fake();

    $owner = User::factory()->create();
    $role = Role::factory()->create(['owner_id' => $owner->id]);

    $this->actingAs($owner)
        ->post(route('portfolio.invitations.store'), [
            'email' => 'collaborator@example.com',
            'role_id' => $role->id,
        ])
        ->assertRedirect(route('portfolio.team'));

    $invitation = UserInvitation::query()->sole();

    expect($invitation->owner_id)->toBe($owner->id)
        ->and($invitation->role_id)->toBe($role->id)
        ->and($invitation->email)->toBe('collaborator@example.com')
        ->and($invitation->token_hash)->toHaveLength(64)
        ->and($invitation->isPending())->toBeTrue();

    Notification::assertSentOnDemand(
        UserInvitationNotification::class,
        fn (UserInvitationNotification $notification): bool => $notification->connection === 'background',
    );
});

test('an invited user can accept a valid invitation once', function () {
    $owner = User::factory()->create();
    $role = Role::factory()->create(['owner_id' => $owner->id]);
    $token = Str::random(64);
    $invitation = UserInvitation::factory()->create([
        'owner_id' => $owner->id,
        'role_id' => $role->id,
        'email' => 'collaborator@example.com',
        'token_hash' => hash('sha256', $token),
    ]);

    $this->post(route('invitations.accept.store', $invitation), [
        'name' => 'Invited Collaborator',
        'token' => $token,
        'password' => 'password',
        'password_confirmation' => 'password',
    ])->assertRedirect(route('dashboard'));

    $member = User::query()
        ->where('email', 'collaborator@example.com')
        ->sole();

    $this->assertAuthenticatedAs($member);
    expect($member->owner_id)->toBe($owner->id)
        ->and($member->role_id)->toBe($role->id)
        ->and($member->email_verified_at)->not->toBeNull()
        ->and($invitation->fresh()->accepted_at)->not->toBeNull();
});

test('a role permission grants access to the owners portfolio only', function () {
    $owner = User::factory()->create();
    $otherOwner = User::factory()->create();
    $role = Role::factory()->create([
        'owner_id' => $owner->id,
        'permissions' => [PortfolioPermission::ManageProjects->value],
    ]);
    $member = User::factory()->create([
        'owner_id' => $owner->id,
        'role_id' => $role->id,
    ]);
    $project = Project::factory()->create(['user_id' => $owner->id]);
    Project::factory()->create(['user_id' => $otherOwner->id]);

    $this->actingAs($member)
        ->get(route('portfolio.projects.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/projects/index')
            ->has('projects.data', 1)
            ->where('projects.data.0.id', $project->id));

    $this->actingAs($member)
        ->get(route('portfolio.skills.index'))
        ->assertForbidden();
});

test('the owner can change or revoke a team members access', function () {
    $owner = User::factory()->create();
    $otherOwner = User::factory()->create();
    $initialRole = Role::factory()->create(['owner_id' => $owner->id]);
    $nextRole = Role::factory()->create(['owner_id' => $owner->id]);
    $foreignRole = Role::factory()->create(['owner_id' => $otherOwner->id]);
    $member = User::factory()->create([
        'owner_id' => $owner->id,
        'role_id' => $initialRole->id,
    ]);

    $this->actingAs($owner)
        ->put(route('portfolio.team-members.update', $member), [
            'role_id' => $foreignRole->id,
        ])
        ->assertSessionHasErrors('role_id');

    $this->actingAs($owner)
        ->put(route('portfolio.team-members.update', $member), [
            'role_id' => $nextRole->id,
        ])
        ->assertRedirect(route('portfolio.team'));

    expect($member->fresh()->role_id)->toBe($nextRole->id);

    $this->actingAs($owner)
        ->delete(route('portfolio.team-members.destroy', $member))
        ->assertRedirect(route('portfolio.team'));

    $this->assertModelMissing($member);
});
