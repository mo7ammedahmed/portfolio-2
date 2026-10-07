<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\PortfolioPermission;
use App\Models\Role;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    public function __invoke(Request $request): Response
    {
        Gate::authorize('viewAny', Role::class);

        $user = $request->user();

        return Inertia::render('admin/team/index', [
            'roles' => $user->roles()
                ->withCount(['users', 'invitations'])
                ->orderBy('name')
                ->get()
                ->map(fn (Role $role): array => [
                    'id' => $role->id,
                    'name' => $role->name,
                    'permissions' => $role->permissions,
                    'users_count' => $role->users_count,
                    'invitations_count' => $role->invitations_count,
                ]),
            'invitations' => $user->invitations()
                ->with('role:id,name')
                ->latest()
                ->get()
                ->map(fn (UserInvitation $invitation): array => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role?->only(['id', 'name']),
                    'status' => match (true) {
                        $invitation->accepted_at !== null => 'accepted',
                        $invitation->expires_at->isPast() => 'expired',
                        default => 'pending',
                    },
                    'expires_at' => $invitation->expires_at->toIso8601String(),
                    'created_at' => $invitation->created_at->toIso8601String(),
                ]),
            'members' => $user->teamMembers()
                ->with('role:id,name')
                ->orderBy('name')
                ->get()
                ->map(fn (User $member): array => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'role' => $member->role?->only(['id', 'name']),
                    'created_at' => $member->created_at->toIso8601String(),
                ]),
            'permissionOptions' => collect(PortfolioPermission::cases())
                ->map(fn (PortfolioPermission $permission): array => [
                    'value' => $permission->value,
                    'label' => $permission->label(),
                    'description' => $permission->description(),
                ]),
        ]);
    }
}
