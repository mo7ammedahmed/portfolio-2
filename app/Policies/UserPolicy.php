<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function updateTeamRole(User $owner, User $member): bool
    {
        return $this->ownsMember($owner, $member);
    }

    public function removeFromTeam(User $owner, User $member): bool
    {
        return $this->ownsMember($owner, $member);
    }

    private function ownsMember(User $owner, User $member): bool
    {
        return $owner->isPortfolioOwner()
            && $member->owner_id === $owner->id;
    }
}
