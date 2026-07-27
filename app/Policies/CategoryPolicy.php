<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PortfolioPermission;
use App\Models\Category;
use App\Models\User;

class CategoryPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageCategories);
    }

    public function view(User $user, Category $category): bool
    {
        return $this->ownsCategory($user, $category)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageCategories);
    }

    public function create(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageCategories);
    }

    public function update(User $user, Category $category): bool
    {
        return $this->ownsCategory($user, $category)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageCategories);
    }

    public function delete(User $user, Category $category): bool
    {
        return $this->ownsCategory($user, $category)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageCategories);
    }

    private function ownsCategory(User $user, Category $category): bool
    {
        return $category->user_id === $user->portfolioOwnerId();
    }
}
