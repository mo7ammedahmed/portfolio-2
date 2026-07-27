<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\AcceptUserInvitation;
use App\Http\Requests\AcceptUserInvitationRequest;
use App\Models\UserInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AcceptUserInvitationController extends Controller
{
    public function show(
        Request $request,
        UserInvitation $invitation,
    ): Response {
        $token = $request->string('token')->toString();

        abort_unless($invitation->tokenMatches($token), 404);
        abort_unless($invitation->isPending(), 410);

        $invitation->loadMissing('owner:id,name', 'role:id,name');

        return Inertia::render('auth/accept-invitation', [
            'invitation' => [
                'id' => $invitation->id,
                'email' => $invitation->email,
                'owner' => $invitation->owner->name,
                'role' => $invitation->role->name,
                'expiresAt' => $invitation->expires_at->toIso8601String(),
            ],
            'token' => $token,
        ]);
    }

    public function store(
        AcceptUserInvitationRequest $request,
        UserInvitation $invitation,
        AcceptUserInvitation $acceptInvitation,
    ): RedirectResponse {
        $user = $acceptInvitation->execute(
            $invitation,
            [
                'name' => $request->string('name')->toString(),
                'password' => $request->string('password')->toString(),
                'token' => $request->string('token')->toString(),
            ],
        );

        Auth::login($user);
        $request->session()->regenerate();

        return to_route('dashboard')
            ->with('success', 'Your account is ready.');
    }
}
