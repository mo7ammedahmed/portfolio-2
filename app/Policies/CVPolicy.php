<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PortfolioPermission;
use App\Models\CV;
use App\Models\User;

class CVPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageCV);
    }

    public function view(User $user, CV $cv): bool
    {
        return $this->ownsCV($user, $cv)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageCV);
    }

    public function create(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageCV);
    }

    public function update(User $user, CV $cv): bool
    {
        return $this->ownsCV($user, $cv)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageCV);
    }

    public function delete(User $user, CV $cv): bool
    {
        return $this->ownsCV($user, $cv)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageCV);
    }

    private function ownsCV(User $user, CV $cv): bool
    {
        return $cv->user_id === $user->portfolioOwnerId();
    }
}
