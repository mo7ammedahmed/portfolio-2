<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PortfolioPermission;
use App\Models\Experience;
use App\Models\User;

class ExperiencePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageExperiences);
    }

    public function view(User $user, Experience $experience): bool
    {
        return $this->ownsExperience($user, $experience)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageExperiences);
    }

    public function create(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageExperiences);
    }

    public function update(User $user, Experience $experience): bool
    {
        return $this->ownsExperience($user, $experience)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageExperiences);
    }

    public function delete(User $user, Experience $experience): bool
    {
        return $this->ownsExperience($user, $experience)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageExperiences);
    }

    private function ownsExperience(User $user, Experience $experience): bool
    {
        return $experience->user_id === $user->portfolioOwnerId();
    }
}
