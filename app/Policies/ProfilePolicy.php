<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PortfolioPermission;
use App\Models\Profile;
use App\Models\User;

class ProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageProfile);
    }

    public function view(User $user, Profile $profile): bool
    {
        return $this->ownsProfile($user, $profile)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageProfile);
    }

    public function create(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageProfile)
            && ! Profile::query()
                ->where('user_id', $user->portfolioOwnerId())
                ->exists();
    }

    public function update(User $user, Profile $profile): bool
    {
        return $this->ownsProfile($user, $profile)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageProfile);
    }

    public function delete(User $user, Profile $profile): bool
    {
        return $this->ownsProfile($user, $profile)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageProfile);
    }

    private function ownsProfile(User $user, Profile $profile): bool
    {
        return $profile->user_id === $user->portfolioOwnerId();
    }
}
