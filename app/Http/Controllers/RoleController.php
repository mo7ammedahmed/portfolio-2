<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Models\Role;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class RoleController extends Controller
{
    public function store(StoreRoleRequest $request): RedirectResponse
    {
        $request->user()->roles()->create($request->validated());

        return to_route('portfolio.team')
            ->with('success', 'Role created.');
    }

    public function update(
        UpdateRoleRequest $request,
        Role $role,
    ): RedirectResponse {
        $role->update($request->validated());

        return to_route('portfolio.team')
            ->with('success', 'Role updated.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        Gate::authorize('delete', $role);

        if ($role->users()->exists() || $role->invitations()->exists()) {
            return back()->withErrors([
                'role' => 'Move members and remove invitations before deleting this role.',
            ]);
        }

        $role->delete();

        return to_route('portfolio.team')
            ->with('success', 'Role deleted.');
    }
}
