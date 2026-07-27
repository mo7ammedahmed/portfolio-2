<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateTeamMemberRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class TeamMemberController extends Controller
{
    public function update(
        UpdateTeamMemberRequest $request,
        User $member,
    ): RedirectResponse {
        $member->update(['role_id' => $request->integer('role_id')]);

        return to_route('portfolio.team')
            ->with('success', 'Member role updated.');
    }

    public function destroy(User $member): RedirectResponse
    {
        Gate::authorize('removeFromTeam', $member);
        $member->delete();

        return to_route('portfolio.team')
            ->with('success', 'Member access removed.');
    }
}
