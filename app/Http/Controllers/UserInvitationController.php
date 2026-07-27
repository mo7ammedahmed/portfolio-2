<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserInvitationRequest;
use App\Models\UserInvitation;
use App\Notifications\UserInvitationNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class UserInvitationController extends Controller
{
    public function store(
        StoreUserInvitationRequest $request,
    ): RedirectResponse {
        $token = Str::random(64);
        $invitation = $request->user()->invitations()->updateOrCreate(
            ['email' => $request->validated('email')],
            [
                'role_id' => $request->integer('role_id'),
                'token_hash' => hash('sha256', $token),
                'expires_at' => now()->addDays(7),
                'accepted_at' => null,
            ],
        );

        Notification::route('mail', $invitation->email)->notify(
            new UserInvitationNotification($invitation, $token),
        );

        return to_route('portfolio.team')
            ->with('success', 'Invitation sent.');
    }

    public function destroy(
        UserInvitation $invitation,
    ): RedirectResponse {
        Gate::authorize('delete', $invitation);
        $invitation->delete();

        return to_route('portfolio.team')
            ->with('success', 'Invitation removed.');
    }
}
