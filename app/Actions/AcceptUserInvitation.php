<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AcceptUserInvitation
{
    /**
     * @param  array{name: string, password: string, token: string}  $data
     */
    public function execute(
        UserInvitation $invitation,
        array $data,
    ): User {
        return DB::transaction(function () use ($invitation, $data): User {
            $lockedInvitation = UserInvitation::query()
                ->lockForUpdate()
                ->findOrFail($invitation->id);

            if (
                ! $lockedInvitation->isPending()
                || ! $lockedInvitation->tokenMatches($data['token'])
            ) {
                throw ValidationException::withMessages([
                    'token' => 'This invitation is no longer valid.',
                ]);
            }

            if (User::query()->where('email', $lockedInvitation->email)->exists()) {
                throw ValidationException::withMessages([
                    'email' => 'An account already exists for this email address.',
                ]);
            }

            $user = User::query()->create([
                'owner_id' => $lockedInvitation->owner_id,
                'role_id' => $lockedInvitation->role_id,
                'name' => $data['name'],
                'email' => $lockedInvitation->email,
                'email_verified_at' => now(),
                'password' => $data['password'],
            ]);

            $lockedInvitation->update(['accepted_at' => now()]);

            return $user;
        });
    }
}
