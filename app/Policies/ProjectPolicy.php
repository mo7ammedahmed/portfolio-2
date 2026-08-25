<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PortfolioPermission;
use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageProjects);
    }

    public function view(User $user, Project $project): bool
    {
        return $this->ownsProject($user, $project)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageProjects);
    }

    public function create(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageProjects);
    }

    public function update(User $user, Project $project): bool
    {
        return $this->ownsProject($user, $project)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageProjects);
    }

    public function delete(User $user, Project $project): bool
    {
        return $this->ownsProject($user, $project)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageProjects);
    }

    private function ownsProject(User $user, Project $project): bool
    {
        return $project->user_id === $user->portfolioOwnerId();
    }
}
