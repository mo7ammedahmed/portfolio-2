<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PortfolioPermission;
use App\Models\Skill;
use App\Models\User;

class SkillPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageSkills);
    }

    public function view(User $user, Skill $skill): bool
    {
        return $this->ownsSkill($user, $skill)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageSkills);
    }

    public function create(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageSkills);
    }

    public function update(User $user, Skill $skill): bool
    {
        return $this->ownsSkill($user, $skill)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageSkills);
    }

    public function delete(User $user, Skill $skill): bool
    {
        return $this->ownsSkill($user, $skill)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageSkills);
    }

    private function ownsSkill(User $user, Skill $skill): bool
    {
        return $skill->user_id === $user->portfolioOwnerId();
    }
}
